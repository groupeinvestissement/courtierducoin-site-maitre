<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Méthode non permise.']);
    exit;
}

function clean(string $key, int $limit = 500): string {
    $value = trim((string)($_POST[$key] ?? ''));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $limit);
}

function safeUrl(string $key): string {
    $value = clean($key, 1000);
    if ($value === '') return '';
    $parts = parse_url($value);
    $allowed = ['www.courtierducoin.ca', 'courtierducoin.ca', 'vaudreuil-soulanges.courtierducoin.ca', 'laval.courtierducoin.ca', 'laval-centre.courtierducoin.ca', 'centre-laval.courtierducoin.ca'];
    return is_array($parts) && in_array(strtolower((string)($parts['host'] ?? '')), $allowed, true) ? $value : '';
}

function safeHost(string $key): string {
    $value = strtolower(clean($key, 120));
    $allowed = ['www.courtierducoin.ca', 'courtierducoin.ca', 'vaudreuil-soulanges.courtierducoin.ca', 'laval.courtierducoin.ca', 'laval-centre.courtierducoin.ca', 'centre-laval.courtierducoin.ca'];
    return in_array($value, $allowed, true) ? $value : '';
}

function requestValue(string $key): string {
    $value = $_POST[$key] ?? '';
    if (is_array($value)) {
        return implode(', ', array_map(static fn($item) => mb_substr(trim((string)$item), 0, 120), array_slice($value, 0, 20)));
    }
    return clean($key, 1000);
}

function biginRequest(string $url, string $method, array $headers = [], ?array $body = null): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 20, CURLOPT_HTTPHEADER => $headers]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $raw = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if ($raw === false || $error !== '') throw new RuntimeException('Connexion Bigin impossible.');
    $decoded = json_decode((string)$raw, true);
    if (!is_array($decoded) || $status < 200 || $status >= 300) {
        $apiError = is_array($decoded) ? ($decoded['data'][0] ?? $decoded) : [];
        $code = is_array($apiError) ? (string)($apiError['code'] ?? '') : '';
        $field = is_array($apiError) ? (string)($apiError['details']['api_name'] ?? '') : '';
        throw new RuntimeException("Bigin HTTP {$status}; code={$code}; field={$field}");
    }
    return $decoded;
}

function findBiginContact(string $apiBase, array $headers, string $email): ?array {
    if ($email === '') return null;
    $ch = curl_init($apiBase . '/Contacts/search?email=' . rawurlencode($email));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_CONNECTTIMEOUT=>10, CURLOPT_TIMEOUT=>20, CURLOPT_HTTPHEADER=>$headers]);
    $raw = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($status === 204) return null;
    if ($raw === false || $status < 200 || $status >= 300) throw new RuntimeException('Recherche de contact Bigin impossible.');
    $decoded = json_decode((string)$raw, true);
    return is_array($decoded) && !empty($decoded['data'][0]) ? $decoded['data'][0] : null;
}

function createBiginDeal(array $lead): void {
    $configFile = __DIR__ . '/bigin-config.php';
    if (!is_file($configFile)) throw new RuntimeException('Configuration Bigin absente.');
    $config = require $configFile;
    foreach (['client_id','client_secret','refresh_token','accounts_url','api_url'] as $key) {
        if (empty($config[$key])) throw new RuntimeException('Configuration Bigin incomplète.');
    }
    $tokenCh = curl_init(rtrim($config['accounts_url'], '/') . '/oauth/v2/token');
    curl_setopt_array($tokenCh, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 20, CURLOPT_POSTFIELDS => http_build_query(['grant_type'=>'refresh_token','client_id'=>$config['client_id'],'client_secret'=>$config['client_secret'],'refresh_token'=>$config['refresh_token']])]);
    $tokenRaw = curl_exec($tokenCh);
    $tokenStatus = (int)curl_getinfo($tokenCh, CURLINFO_HTTP_CODE);
    curl_close($tokenCh);
    $tokenData = json_decode((string)$tokenRaw, true);
    if ($tokenStatus !== 200 || empty($tokenData['access_token'])) throw new RuntimeException('Autorisation Bigin impossible.');

    $apiBase = rtrim($config['api_url'], '/') . '/bigin/v2';
    $headers = ['Authorization: Zoho-oauthtoken ' . $tokenData['access_token'], 'Content-Type: application/json'];
    $source = $lead['source'];
    $webPage = $source['web_page'] ?? $source['page'] ?? 'Formulaire général';
    $sourceDetailType = $source['source_detail_type'] ?? $source['type'] ?? '';
    $webRegion = $source['region'] ?? ($source ? 'Vaudreuil-Soulanges' : ($lead['region'] ?: 'Non précisée'));
    $regionCode = $source['region_code'] ?? ($source ? 'VS' : 'CDC');
    $sourceDetail = $source ? "Courtier du Coin > {$webRegion} > {$source['page']} > {$sourceDetailType}" : 'Courtier du Coin > Formulaire général';
    $lines = [
        'Source : Site web - Courtier du Coin',
        'Site : CourtierDuCoin.ca',
        'Région : ' . $webRegion,
        'Page : ' . $webPage,
        'Code : ' . ($source['code'] ?? ''),
        'Formulaire : ' . ($source['type'] ?? ''),
        'Form ID : ' . $lead['source_key'],
        'Source détaillée : ' . $sourceDetail,
        'Contexte : ' . ($source['context'] ?? ''),
        'URL : ' . $lead['landing_url'],
        'URL canonique : ' . ($source['canonical'] ?? $lead['canonical_url']),
        'Entry Host : ' . $lead['entry_host'],
        'Entry Path : ' . $lead['entry_path'],
        'First Touch URL : ' . $lead['first_touch_url'],
        'First Touch Date : ' . $lead['first_touch_timestamp'],
        'Last Touch URL : ' . $lead['last_touch_url'],
        'Last Touch Date : ' . $lead['last_touch_timestamp'],
        'Referrer : ' . $lead['referrer'],
        'UTM : source=' . $lead['utm_source'] . '; medium=' . $lead['utm_medium'] . '; campaign=' . $lead['utm_campaign'] . '; content=' . $lead['utm_content'] . '; term=' . $lead['utm_term'],
        'GCLID : ' . $lead['gclid'],
        'FBCLID : ' . $lead['fbclid'],
        'Submission ID : ' . $lead['submission_id'],
        'Consentement demande : Oui (' . $lead['consent_request_timestamp'] . ')',
        'Consentement marketing : ' . ($lead['consent_marketing'] ? 'Oui (' . $lead['consent_marketing_timestamp'] . ')' : 'Non'),
        '',
        'Projet : ' . $lead['projet'],
        'Préférence de contact : ' . $lead['contact_pref'],
        'Meilleur moment : ' . $lead['moment'],
        'Adresse de la propriété : ' . ($lead['adresse'] ?: 'Non fournie'),
        'Réponses : ' . $lead['answers'],
    ];
    $description = implode("\n", $lines);
    $existing = null;
    try { $existing = findBiginContact($apiBase, $headers, $lead['courriel']); }
    catch (Throwable $searchError) { error_log('Bigin contact search unavailable [' . $lead['submission_id'] . ']'); }
    if ($existing && !empty($existing['id'])) {
        $contactId = $existing['id'];
        $history = trim((string)($existing['Description'] ?? ''));
        $updateDescription = ($history !== '' ? $history . "\n\n--- Nouvelle soumission web ---\n" : '') . $description;
        biginRequest($apiBase . '/Contacts/' . rawurlencode((string)$contactId), 'PUT', $headers, ['data' => [[
            'First_Name'=>$lead['prenom'], 'Last_Name'=>$lead['nom'], 'Email'=>$lead['courriel'], 'Mobile'=>$lead['telephone'], 'Mailing_Street'=>$lead['adresse'], 'Description'=>$updateDescription,
        ]]]);
    } else {
        $contact = biginRequest($apiBase . '/Contacts', 'POST', $headers, ['data' => [[
            'First_Name'=>$lead['prenom'], 'Last_Name'=>$lead['nom'], 'Email'=>$lead['courriel'], 'Mobile'=>$lead['telephone'], 'Mailing_Street'=>$lead['adresse'], 'Description'=>$description,
        ]]]);
        $contactId = $contact['data'][0]['details']['id'] ?? null;
    }
    if (!$contactId) throw new RuntimeException('Contact Bigin non créé.');
    try {
        biginRequest($apiBase . '/Contacts/' . rawurlencode((string)$contactId), 'PUT', $headers, ['data' => [[
            'Lead_Source' => 'Site web - Courtier du Coin',
        ]]]);
    } catch (Throwable $leadSourceError) {
        // La provenance complète demeure dans Description et dans chaque opportunité.
        error_log('Bigin Lead_Source mapping unavailable [' . $lead['submission_id'] . ']');
    }
    $subPipeline = $lead['projet'] === 'Acheter' ? 'COURTAGE-ACHETEUR' : 'COURTAGE-VENDEUR';
    $dealPrefix = $source ? "[WEB][{$regionCode}][{$source['code']}][{$source['page']}]" : '[WEB][CDC]';
    biginRequest($apiBase . '/Pipelines', 'POST', $headers, ['data' => [[
        'Deal_Name' => $dealPrefix . ' ' . $lead['prenom'] . ' ' . $lead['nom'], 'Contact_Name' => ['id'=>$contactId], 'Pipeline' => ['name'=>'Sales Pipeline','id'=>'24592000000003237'], 'Sub_Pipeline'=>$subPipeline, 'Stage'=>'Qualification', 'Closing_Date'=>date('Y-m-d', strtotime('+90 days')), 'Description'=>$description,
    ]]]);
}

if (!empty($_POST['site_web'])) { echo json_encode(['ok'=>true]); exit; }

$sourcesFile = __DIR__ . '/web-form-sources.php';
$sources = is_file($sourcesFile) ? require $sourcesFile : [];
$sourceKey = clean('source_key', 80);
$source = $sourceKey !== '' ? ($sources[$sourceKey] ?? null) : null;
if ($sourceKey === '' && (clean('region', 80) === 'laval' || str_starts_with(clean('canonical_url', 1000), 'https://www.courtierducoin.ca/laval/') || clean('canonical_url', 1000) === 'https://www.courtierducoin.ca/secteurs/laval/')) {
    http_response_code(422);
    echo json_encode(['message'=>'Source du formulaire requise.']);
    exit;
}
if ($sourceKey !== '' && $source === null) {
    error_log('Web form rejected: unknown source_key');
    http_response_code(422);
    echo json_encode(['message'=>'Source du formulaire invalide.']);
    exit;
}

$prenom = clean('prenom', 60);
$nom = clean('nom', 60);
$courrielBrut = clean('courriel', 120);
$courriel = $courrielBrut === '' ? '' : filter_var($courrielBrut, FILTER_VALIDATE_EMAIL);
$telephone = clean('telephone', 30);
$adresse = clean('adresse', 180);
$projet = clean('projet', 40);
$contactPref = clean('contact_pref', 30);
$moment = clean('best_time', 80) ?: (clean('sale_timeline', 80) ?: clean('moment', 80));
$consentRequest = (($_POST['consent_request'] ?? $_POST['consentement'] ?? '') === 'oui');
$consentMarketing = (($_POST['consent_marketing'] ?? '') === 'oui');
$projects = ['Vendre','Acheter','Investir'];
if ($prenom === '' || $nom === '' || ($courrielBrut !== '' && !$courriel) || ($courrielBrut === '' && $telephone === '') || !in_array($projet, $projects, true) || !$consentRequest) {
    http_response_code(422);
    echo json_encode(['message'=>'Veuillez remplir tous les champs obligatoires.']);
    exit;
}

$submissionId = clean('submission_id', 80);
if (!preg_match('/^[A-Za-z0-9-]{10,80}$/', $submissionId)) $submissionId = bin2hex(random_bytes(16));
$allowedAnswerFields = ['property_type','house_type','coproperty_type','condo_type','unit_type','unit_count','occupancy_type','occupancy','sale_timeline','timeline','next_purchase','major_work_considered','major_work_known','property_features','unit_features','features','condo_documents_status','documents_status','succession_role','succession_stage','people_to_update','remote_coordination_needed','notice_type','municipality','document_date','registration_date_known','situation_stage','gross_revenue_optional','message'];
$answerPairs = [];
foreach ($allowedAnswerFields as $field) {
    $value = requestValue($field);
    if ($value !== '') $answerPairs[] = $field . '=' . $value;
}
$serverTimestamp = gmdate('c');
$lead = [
    'prenom'=>$prenom, 'nom'=>$nom, 'courriel'=>(string)$courriel, 'telephone'=>$telephone, 'adresse'=>$adresse, 'projet'=>$projet,
    'contact_pref'=>$contactPref, 'moment'=>$moment, 'region'=>clean('region', 80), 'source_key'=>$sourceKey, 'source'=>$source,
    'submission_id'=>$submissionId, 'landing_url'=>safeUrl('landing_url'), 'canonical_url'=>safeUrl('canonical_url'), 'first_touch_url'=>safeUrl('first_touch_url'), 'last_touch_url'=>safeUrl('last_touch_url'),
    'entry_host'=>safeHost('entry_host'), 'entry_path'=>clean('entry_path', 250), 'first_touch_timestamp'=>clean('first_touch_timestamp', 40), 'last_touch_timestamp'=>$serverTimestamp,
    'referrer'=>clean('referrer', 500), 'utm_source'=>clean('utm_source', 120), 'utm_medium'=>clean('utm_medium', 120), 'utm_campaign'=>clean('utm_campaign', 160), 'utm_content'=>clean('utm_content', 160), 'utm_term'=>clean('utm_term', 160), 'gclid'=>clean('gclid', 250), 'fbclid'=>clean('fbclid', 250),
    'consent_request_timestamp'=>$serverTimestamp, 'consent_marketing'=>$consentMarketing, 'consent_marketing_timestamp'=>$consentMarketing ? $serverTimestamp : '', 'answers'=>implode('; ', $answerPairs),
];

try {
    createBiginDeal($lead);
} catch (Throwable $error) {
    error_log('Bigin submission failed [' . $submissionId . '][' . ($sourceKey ?: 'legacy') . ']: ' . $error->getMessage());
    http_response_code(503);
    echo json_encode(['message'=>"L'envoi vers notre système est temporairement indisponible."]);
    exit;
}

$to = 'contact@courtierducoin.ca';
$code = $source['code'] ?? 'general';
$page = $source['page'] ?? 'Contact';
$webPage = $source['web_page'] ?? $page;
$type = $source['type'] ?? $projet;
$webRegion = $source['region'] ?? ($source ? 'Vaudreuil-Soulanges' : ($lead['region'] ?: 'Non précisée'));
$regionCode = $source['region_code'] ?? ($source ? 'VS' : 'CDC');
$subject = "[WEB][{$regionCode}][{$code}][{$page}] {$type}";
$body = "Source : Courtier du Coin\nRégion : {$webRegion}\nPage : {$webPage}\nCode : {$code}\nFormulaire : {$type}\nForm ID : {$sourceKey}\nURL : {$lead['landing_url']}\nUTM : {$lead['utm_source']} / {$lead['utm_medium']} / {$lead['utm_campaign']}\nSubmission ID : {$submissionId}\n\nNom : {$prenom} {$nom}\nCourriel : {$courriel}\nTéléphone : {$telephone}\nAdresse : " . ($adresse ?: 'Non fournie') . "\nRéponses : {$lead['answers']}\n";
$headers = ['From: Courtier du Coin <contact@courtierducoin.ca>', 'Content-Type: text/plain; charset=UTF-8', 'X-Mailer: PHP/' . phpversion()];
if ($courriel !== '') $headers[] = 'Reply-To: ' . $courriel;
if (!mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers))) error_log('Web notification failed [' . $submissionId . ']');

echo json_encode(['ok'=>true, 'submission_id'=>$submissionId]);
