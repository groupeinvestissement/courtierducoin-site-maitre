#!/usr/bin/env node

import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number.parseInt(process.env.SECTOR_HERO_PREVIEW_PORT ?? '4173', 10);
const HOST = '127.0.0.1';
const NETWORK_PROFILE = process.env.SECTOR_HERO_PREVIEW_NETWORK_PROFILE === 'mobile'
  ? {
      name: 'mobile-simulated',
      latencyMs: 150,
      downstreamBytesPerSecond: 200_000,
      chunkBytes: 16_384,
    }
  : null;
const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.vtt', 'text/vtt; charset=utf-8'],
  ['.webp', 'image/webp'],
]);
const IMMUTABLE_EXTENSIONS = new Set(['.jpeg', '.jpg', '.mp4', '.vtt']);

function safeRequestTarget(requestUrl) {
  const parsedUrl = new URL(requestUrl, `http://${HOST}:${PORT}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const resolved = path.resolve(ROOT, `.${pathname}`);
  const relative = path.relative(ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return {
    filePath: resolved,
    forceNormalMotion: parsedUrl.searchParams.get('__qa_motion') === 'normal',
    disableHeroJs: parsedUrl.searchParams.get('__qa_js') === 'off',
    heroDataMode: parsedUrl.searchParams.get('__qa_data'),
    collectPerformance: parsedUrl.searchParams.get('__qa_perf') === '1',
    cacheBust: parsedUrl.searchParams.get('__qa_cache_bust'),
  };
}

function normalMotionHarness(html) {
  const harness = `<style data-qa-normal-motion>@media (prefers-reduced-motion: reduce){.sector-hero__video{display:block!important}}</style><script data-qa-normal-motion>(()=>{const nativeMatchMedia=window.matchMedia.bind(window);window.matchMedia=(query)=>{const nativeQuery=nativeMatchMedia(query);if(query!=="(prefers-reduced-motion: reduce)")return nativeQuery;return{media:nativeQuery.media,matches:false,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return false}}}})();</script>`;
  return html.replace('</head>', `${harness}</head>`);
}

function performanceHarness(html) {
  const harness = `<script data-qa-performance>(()=>{const metrics={cls:0,lcp:null,resources:[],navigation:null};const sync=()=>{const root=document.documentElement;root.dataset.qaCls=String(metrics.cls);root.dataset.qaLcp=metrics.lcp?JSON.stringify(metrics.lcp):"";root.dataset.qaResources=JSON.stringify(metrics.resources);root.dataset.qaNavigation=metrics.navigation?JSON.stringify(metrics.navigation):""};sync();try{new PerformanceObserver(list=>{for(const entry of list.getEntries()){if(!entry.hadRecentInput)metrics.cls+=entry.value}sync()}).observe({type:"layout-shift",buffered:true})}catch{}try{new PerformanceObserver(list=>{const entries=list.getEntries();const entry=entries[entries.length-1];if(entry)metrics.lcp={startTime:entry.startTime,size:entry.size,url:entry.url||null,tag:entry.element?.tagName||null,className:entry.element?.className||null};sync()}).observe({type:"largest-contentful-paint",buffered:true})}catch{}addEventListener("load",()=>setTimeout(()=>{metrics.resources=performance.getEntriesByType("resource").filter(entry=>entry.name.includes("/assets/video/heroes/")).map(entry=>({name:entry.name,startTime:entry.startTime,duration:entry.duration,transferSize:entry.transferSize,initiatorType:entry.initiatorType}));const navigation=performance.getEntriesByType("navigation")[0];if(navigation)metrics.navigation={responseStart:navigation.responseStart,domContentLoaded:navigation.domContentLoadedEventEnd,loadEventEnd:navigation.loadEventEnd};sync()},800),{once:true})})();</script>`;
  return html.replace('</head>', `${harness}</head>`);
}

function applyQaHtmlModes(html, target) {
  let output = html;
  if (target.disableHeroJs) {
    output = output.replace(/<script\b[^>]*src=(['"])\/sector-hero\.js(?:\?[^'"]*)?\1[^>]*><\/script>/gi, '');
  }
  if (target.heroDataMode === 'missing') {
    output = output.replace(/\sdata-(?:desktop|mobile)-video=(['"])[\s\S]*?\1/gi, '');
  } else if (target.heroDataMode === 'error') {
    output = output.replace(/\sdata-(desktop|mobile)-video=(['"])[\s\S]*?\2/gi, (_full, format) => ` data-${format}-video="/__qa_missing_video__.mp4"`);
  }
  if (target.forceNormalMotion) output = normalMotionHarness(output);
  if (target.collectPerformance) output = performanceHarness(output);
  if (target.cacheBust) {
    const encodedToken = encodeURIComponent(target.cacheBust);
    const appendCacheBust = (url) => {
      if (!url.startsWith('/') || url.startsWith('//')) return url;
      const hashIndex = url.indexOf('#');
      const body = hashIndex === -1 ? url : url.slice(0, hashIndex);
      const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
      return `${body}${body.includes('?') ? '&' : '?'}__qa_cache_bust=${encodedToken}${hash}`;
    };
    output = output.replace(
      /(<(?:link|script|img|source|video)\b[^>]*?\s(?:src|href|poster|srcset)=)(['"])([^'"]*)\2/gi,
      (_match, prefix, quote, value) => {
        const rewritten = value
          .split(',')
          .map((candidate) => {
            const parts = candidate.trim().split(/\s+/);
            parts[0] = appendCacheBust(parts[0]);
            return parts.join(' ');
          })
          .join(', ');
        return `${prefix}${quote}${rewritten}${quote}`;
      },
    );
    output = output.replace(
      /(\sdata-(?:desktop|mobile)-(?:video|poster)=)(['"])([^'"]+)\2/gi,
      (_match, prefix, quote, value) => `${prefix}${quote}${appendCacheBust(value)}${quote}`,
    );
  }
  return output;
}

function parseRange(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader ?? '');
  if (!match) return null;
  let start = match[1] ? Number.parseInt(match[1], 10) : null;
  let end = match[2] ? Number.parseInt(match[2], 10) : null;
  if (start === null && end !== null) {
    start = Math.max(0, size - end);
    end = size - 1;
  } else {
    start ??= 0;
    end ??= size - 1;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function applyNetworkLatency() {
  if (NETWORK_PROFILE) await wait(NETWORK_PROFILE.latencyMs);
}

async function sendBuffer(response, content) {
  if (!NETWORK_PROFILE) {
    response.end(content);
    return;
  }

  for (let offset = 0; offset < content.length; offset += NETWORK_PROFILE.chunkBytes) {
    const chunk = content.subarray(offset, offset + NETWORK_PROFILE.chunkBytes);
    response.write(chunk);
    await wait((chunk.length / NETWORK_PROFILE.downstreamBytesPerSecond) * 1_000);
  }
  response.end();
}

async function sendFile(response, filePath, start, end) {
  const stream = createReadStream(filePath, { start, end, highWaterMark: NETWORK_PROFILE?.chunkBytes });
  if (!NETWORK_PROFILE) {
    stream.pipe(response);
    return;
  }

  for await (const chunk of stream) {
    response.write(chunk);
    await wait((chunk.length / NETWORK_PROFILE.downstreamBytesPerSecond) * 1_000);
  }
  response.end();
}

const server = createServer(async (request, response) => {
  try {
    const target = safeRequestTarget(request.url ?? '/');
    if (!target) {
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }

    const { filePath, forceNormalMotion, disableHeroJs, heroDataMode, collectPerformance, cacheBust } = target;

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw Object.assign(new Error('Not found'), { code: 'ENOENT' });
    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES.get(extension) ?? 'application/octet-stream';
    const cacheControl = IMMUTABLE_EXTENSIONS.has(extension)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache';
    const range = extension === '.mp4' ? parseRange(request.headers.range, fileStat.size) : null;

    if (extension === '.html' && (forceNormalMotion || disableHeroJs || heroDataMode || collectPerformance || cacheBust)) {
      const content = Buffer.from(applyQaHtmlModes(await readFile(filePath, 'utf8'), target));
      await applyNetworkLatency();
      response.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': String(content.length),
        'Cache-Control': 'no-cache',
      });
      if (request.method === 'HEAD') response.end();
      else await sendBuffer(response, content);
      return;
    }

    if (request.headers.range && extension === '.mp4' && !range) {
      response.writeHead(416, {
        'Content-Range': `bytes */${fileStat.size}`,
        'Accept-Ranges': 'bytes',
      });
      response.end();
      return;
    }

    const status = range ? 206 : 200;
    const start = range?.start ?? 0;
    const end = range?.end ?? fileStat.size - 1;
    const headers = {
      'Content-Type': contentType,
      'Content-Length': String(end - start + 1),
      'Cache-Control': cacheControl,
      ...(extension === '.mp4' ? { 'Accept-Ranges': 'bytes' } : {}),
      ...(range ? { 'Content-Range': `bytes ${start}-${end}/${fileStat.size}` } : {}),
    };
    await applyNetworkLatency();
    response.writeHead(status, headers);
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    await sendFile(response, filePath, start, end);
  } catch (error) {
    const status = error?.code === 'ENOENT' ? 404 : 500;
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(status === 404 ? 'Not found' : 'Internal server error');
  }
});

server.listen(PORT, HOST, () => {
  const networkSummary = NETWORK_PROFILE
    ? ` (${NETWORK_PROFILE.name}: ${NETWORK_PROFILE.latencyMs} ms, ${(NETWORK_PROFILE.downstreamBytesPerSecond * 8) / 1_000_000} Mbps)`
    : '';
  console.log(`Sector hero preview: http://${HOST}:${PORT}/${networkSummary}`);
});
