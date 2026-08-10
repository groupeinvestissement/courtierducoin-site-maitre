<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Méthode non permise.']);
    exit;
}

function clean(string $key, int $limit): string {
    $value = trim((string)($_POST[$key] ?? ''));
    $value = preg_replace('/[\r\n]+/', ' ', $value) ?? '';
    return mb_substr($value, 0, $limit);
}

function biginRequest(string $url, string $method, array $headers = [], ?array $body = null): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => $headers,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
    $raw = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    if ($raw === false || $error !== '') {
        throw new RuntimeException('Connexion Bigin impossible.');
    }
    $decoded = json_decode($raw, true);
    if (is_array($decoded) && ($status < 200 || $status >= 300)) {
        $apiError = $decoded['data'][0] ?? $decoded;
        $code = is_array($apiError) ? (string)($apiError['code'] ?? '') : '';
        $apiMessage = is_array($apiError) ? (string)($apiError['message'] ?? '') : '';
        $field = is_array($apiError) ? (string)($apiError['details']['api_name'] ?? '') : '';
        throw new RuntimeException("Bigin HTTP {$status}; code={$code}; field={$field}; message={$apiMessage}");
    }
    if (!is_array($decoded) || $status < 200 || $status >= 300) {
        throw new RuntimeException('Réponse Bigin invalide.');
    }
    return $decoded;
}

function createBiginDeal(array $lead): void {
    $configFile = __DIR__ . '/bigin-config.php';
    if (!is_file($configFile)) {
        throw new RuntimeException('Configuration Bigin absente.');
    }
    $config = require $configFile;
    foreach (['client_id', 'client_secret', 'refresh_token', 'accounts_url', 'api_url'] as $key) {
        if (empty($config[$key])) throw new RuntimeException('Configuration Bigin incomplète.');
    }

    $tokenCh = curl_init(rtrim($config['accounts_url'], '/') . '/oauth/v2/token');
    curl_setopt_array($tokenCh, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_POSTFIELDS => http_build_query([
            'grant_type' => 'refresh_token',
            'client_id' => $config['client_id'],
            'client_secret' => $config['client_secret'],
            'refresh_token' => $config['refresh_token'],
        ]),
    ]);
    $tokenRaw = curl_exec($tokenCh);
    $tokenStatus = (int)curl_getinfo($tokenCh, CURLINFO_HTTP_CODE);
    curl_close($tokenCh);
    $tokenData = json_decode((string)$tokenRaw, true);
    if ($tokenStatus !== 200 || empty($tokenData['access_token'])) {
        throw new RuntimeException('Autorisation Bigin impossible.');
    }

    $apiBase = rtrim($config['api_url'], '/') . '/bigin/v2';
    $headers = [
        'Authorization: Zoho-oauthtoken ' . $tokenData['access_token'],
        'Content-Type: application/json',
    ];
    $description = "Source : www.courtierducoin.ca\n"
        . "Langue : {$lead['langue']}\n"
        . "Projet : {$lead['projet']}\n"
        . "Préférence de contact : {$lead['contact_pref']}\n"
        . "Meilleur moment : {$lead['moment']}\n"
        . "Prénom : {$lead['prenom']}\n"
        . "Nom : {$lead['nom']}\n"
        . "Courriel : {$lead['courriel']}\n"
        . "Téléphone : {$lead['telephone']}\n"
        . 'Adresse de la propriété : ' . ($lead['adresse'] !== '' ? $lead['adresse'] : 'Non fournie');

    $contact = biginRequest($apiBase . '/Contacts', 'POST', $headers, [
        'data' => [[
            'First_Name' => $lead['prenom'],
            'Last_Name' => $lead['nom'],
            'Email' => $lead['courriel'],
            'Mobile' => $lead['telephone'],
            'Mailing_Street' => $lead['adresse'],
            'Description' => $description,
        ]],
    ]);
    $contactId = $contact['data'][0]['details']['id'] ?? null;
    if (!$contactId) throw new RuntimeException('Contact Bigin non créé.');

    $subPipeline = $lead['projet'] === 'Vendre' ? 'COURTAGE-VENDEUR' : 'COURTAGE-ACHETEUR';
    biginRequest($apiBase . '/Pipelines', 'POST', $headers, [
        'data' => [[
            'Deal_Name' => 'site-maitre- ' . $lead['prenom'] . ' ' . $lead['nom'],
            'Contact_Name' => ['id' => $contactId],
            'Pipeline' => ['name' => 'Sales Pipeline', 'id' => '24592000000003237'],
            'Sub_Pipeline' => $subPipeline,
            'Stage' => 'Qualification',
            'Closing_Date' => date('Y-m-d', strtotime('+90 days')),
            'Description' => $description,
        ]],
    ]);
}

if (!empty($_POST['site_web'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$prenom = clean('prenom', 60);
$nom = clean('nom', 60);
$courrielBrut = clean('courriel', 120);
$courriel = $courrielBrut === '' ? '' : filter_var($courrielBrut, FILTER_VALIDATE_EMAIL);
$telephone = clean('telephone', 30);
$adresse = clean('adresse', 180);
$projet = clean('projet', 40);
$contact_pref = clean('contact_pref', 20);
$moment = clean('moment', 20);
$langue = clean('langue', 20);
$langue = in_array($langue, ['Français', 'English'], true) ? $langue : 'Français';
$projetsPermis = ['Vendre', 'Acheter', 'Investir'];

if ($prenom === '' || $nom === '' || ($courrielBrut !== '' && !$courriel) || ($courrielBrut === '' && $telephone === '') || !in_array($projet, $projetsPermis, true) || ($_POST['consentement'] ?? '') !== 'oui') {
    http_response_code(422);
    echo json_encode(['message' => 'Veuillez remplir tous les champs obligatoires.']);
    exit;
}

$lead = compact('prenom', 'nom', 'courriel', 'telephone', 'adresse', 'projet', 'langue', 'contact_pref', 'moment');
try {
    createBiginDeal($lead);
} catch (Throwable $error) {
    error_log('Bigin Rosemont: ' . $error->getMessage());
    http_response_code(503);
    echo json_encode(['message' => "L'envoi vers notre système est temporairement indisponible."]);
    exit;
}

$destinataire = 'contact@courtierducoin.ca';
$sujet = 'Nouveau contact Courtier du coin — ' . $projet;
$message = "Nouvelle demande depuis www.courtierducoin.ca\n\nProjet : {$projet}\nNom : {$prenom} {$nom}\nCourriel : {$courriel}\nTéléphone : {$telephone}\nPréférence : {$contact_pref}\nMoment : {$moment}\n";
$message .= 'Adresse : ' . ($adresse !== '' ? $adresse : 'Non fournie') . "\n\nConsentement : Oui\n";
$headers = [
    'From: Courtier du coin <contact@courtierducoin.ca>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];
if ($courriel !== '') {
    $headers[] = 'Reply-To: ' . $courriel;
}
if (!mail($destinataire, '=?UTF-8?B?' . base64_encode($sujet) . '?=', $message, implode("\r\n", $headers))) {
    error_log('Courriel Rosemont non envoyé pour le deal Bigin créé.');
}

echo json_encode(['ok' => true]);
