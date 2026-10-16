/**
 * Wira Satya 96 — Media Security, Leakage Tracking & Storage Optimization Engine
 *
 * Features:
 * 1. Encrypted / Salted Hash File Naming (`WS-<hash_enkripsi>-<date>.<ext>`) for both
 *    uploads and downloads to enable forensic data-leakage tracking per NRP & timestamp.
 * 2. Smart Auto-Crop (trims unused uniform/empty borders + center aspect-ratio crop)
 *    and WebP/JPEG downscaling to minimize database / MinIO object storage footprint.
 */

export type MediaAssetKind = 'AVATAR' | 'COVER' | 'POST' | 'DOCUMENT' | 'EXPORT';

export interface ProcessedSecureMedia {
  dataUrl: string;
  fileName: string;
  trackingCode: string;
  hashEnkripsi: string;
  dateStamp: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
}

export interface MediaAuditEntry {
  trackingCode: string;
  fileName: string;
  hashEnkripsi: string;
  actorNrp: string;
  action: 'UPLOAD' | 'DOWNLOAD';
  kind: MediaAssetKind;
  timestamp: string;
  sizeBytes?: number;
}

const WS96_MEDIA_SALT = 'WS96_BARESKRIM_SECURE_LEAK_TRACKER_2026';
const AUDIT_STORAGE_KEY = 'ws96_media_leakage_audit_v1';

/**
 * Formats current date/time as YYYYMMDD-HHmmss for `WS-hash_enkripsi-date` filenames.
 */
export function formatMediaDateStamp(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

/**
 * Computes a deterministic salted 16-hex-character encrypted tracking hash (`hash_enkripsi`)
 * binding actor NRP, timestamp, and payload fingerprint (FNV-1a 64-bit / Dual-32 mix + XOR cipher).
 */
export function computeEncryptedTrackingHash(
  actorNrp: string = 'ANON',
  dateStamp: string = formatMediaDateStamp(),
  payloadSample: string = ''
): string {
  const cleanNrp = (actorNrp || 'ANON').replace(/\D/g, '') || '00000000';
  const rawInput = `${WS96_MEDIA_SALT}|NRP:${cleanNrp}|TS:${dateStamp}|SAMPLE:${payloadSample.slice(0, 128)}`;

  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  for (let i = 0; i < rawInput.length; i++) {
    const ch = rawInput.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch ^ (i & 0xff);
    h2 = Math.imul(h2, 0x1000193b);
  }

  // Embed obfuscated NRP checksum in last 4 hex chars for instant forensic verification
  let nrpXor = 0x5a96;
  for (let i = 0; i < cleanNrp.length; i++) {
    nrpXor = ((nrpXor << 3) ^ cleanNrp.charCodeAt(i) ^ (i * 17)) & 0xffff;
  }

  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = ((h2 >>> 0) & 0xffff).toString(16).padStart(4, '0');
  const part3 = (nrpXor >>> 0).toString(16).padStart(4, '0');
  return `${part1}${part2}${part3}`.toLowerCase();
}

/**
 * Generates an official leakage-tracked filename with format:
 * `WS-<hash_enkripsi>-<date>.<ext>` (or without extension if ext is omitted).
 */
export function generateLeakageTrackedFileName(
  actorNrp: string = 'ANON',
  ext: string = 'webp',
  kind: MediaAssetKind = 'AVATAR',
  action: 'UPLOAD' | 'DOWNLOAD' = 'UPLOAD',
  payloadSample: string = '',
  sizeBytes?: number
): { fileName: string; trackingCode: string; hashEnkripsi: string; dateStamp: string } {
  const dateStamp = formatMediaDateStamp();
  const hashEnkripsi = computeEncryptedTrackingHash(actorNrp, dateStamp, payloadSample);
  const trackingCode = `WS-${hashEnkripsi}-${dateStamp}`;
  const cleanExt = ext.replace(/^\./, '').toLowerCase();
  const fileName = cleanExt ? `${trackingCode}.${cleanExt}` : trackingCode;

  recordMediaAuditEntry({
    trackingCode,
    fileName,
    hashEnkripsi,
    actorNrp: actorNrp || 'ANON',
    action,
    kind,
    timestamp: new Date().toISOString(),
    sizeBytes,
  });

  return { fileName, trackingCode, hashEnkripsi, dateStamp };
}

/**
 * Records upload/download tracking metadata in localStorage for leakage auditing.
 */
export function recordMediaAuditEntry(entry: MediaAuditEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const list: MediaAuditEntry[] = raw ? JSON.parse(raw) : [];
    const updated = [entry, ...list].slice(0, 200);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Detects uniform/blank borders (white, transparent, or solid black bars) around an image
 * and returns the cropped content bounding box so wasted margins are stripped before encoding.
 */
function detectActiveContentBox(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { sx: number; sy: number; sw: number; sh: number } {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Sample corner pixel as reference background
    const refR = data[0];
    const refG = data[1];
    const refB = data[2];
    const refA = data[3];

    const isBorderPixel = (idx: number): boolean => {
      const a = data[idx + 3];
      if (a < 16) return true; // transparent
      if (refA < 16) return false;
      const dr = Math.abs(data[idx] - refR);
      const dg = Math.abs(data[idx + 1] - refG);
      const db = Math.abs(data[idx + 2] - refB);
      return dr < 10 && dg < 10 && db < 10;
    };

    let top = 0;
    let bottom = height - 1;
    let left = 0;
    let right = width - 1;

    const stepX = Math.max(1, Math.floor(width / 120));
    const stepY = Math.max(1, Math.floor(height / 120));

    // Scan top
    topLoop: for (let y = 0; y < height * 0.25; y += stepY) {
      for (let x = 0; x < width; x += stepX) {
        if (!isBorderPixel((y * width + x) * 4)) {
          top = Math.max(0, y - stepY);
          break topLoop;
        }
      }
    }

    // Scan bottom
    bottomLoop: for (let y = height - 1; y > height * 0.75; y -= stepY) {
      for (let x = 0; x < width; x += stepX) {
        if (!isBorderPixel((y * width + x) * 4)) {
          bottom = Math.min(height - 1, y + stepY);
          break bottomLoop;
        }
      }
    }

    // Scan left
    leftLoop: for (let x = 0; x < width * 0.25; x += stepX) {
      for (let y = top; y <= bottom; y += stepY) {
        if (!isBorderPixel((y * width + x) * 4)) {
          left = Math.max(0, x - stepX);
          break leftLoop;
        }
      }
    }

    // Scan right
    rightLoop: for (let x = width - 1; x > width * 0.75; x -= stepX) {
      for (let y = top; y <= bottom; y += stepY) {
        if (!isBorderPixel((y * width + x) * 4)) {
          right = Math.min(width - 1, x + stepX);
          break rightLoop;
        }
      }
    }

    const sw = right - left + 1;
    const sh = bottom - top + 1;
    if (sw >= width * 0.5 && sh >= height * 0.5) {
      return { sx: left, sy: top, sw, sh };
    }
  } catch {
    // Fallback if canvas is tainted
  }
  return { sx: 0, sy: 0, sw: width, sh: height };
}

/**
 * Compresses, auto-crops unused borders/margins, and tags an uploaded image file
 * with the `WS-<hash_enkripsi>-<date>` leakage-tracking identifier.
 *
 * Target storage budgets (for DB / MinIO efficiency):
 * - AVATAR: 256x256 square crop, WebP/JPEG quality 0.78 (~12–25 KB)
 * - COVER:  960x320 banner crop (3:1), WebP/JPEG quality 0.80 (~25–45 KB)
 * - POST:   max 960x720 auto-fit crop, WebP/JPEG quality 0.78 (~30–60 KB)
 */
export function processSecureImageUpload(
  file: File,
  kind: MediaAssetKind = 'AVATAR',
  actorNrp: string = 'ANON'
): Promise<ProcessedSecureMedia> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) {
        reject(new Error('File gambar kosong'));
        return;
      }

      const img = new window.Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung'));
      img.onload = () => {
        // 1. Draw to staging canvas to trim unused uniform borders
        const stageW = Math.min(img.width, 1600);
        const stageScale = stageW / img.width;
        const stageH = Math.max(1, Math.round(img.height * stageScale));

        const stageCanvas = document.createElement('canvas');
        stageCanvas.width = stageW;
        stageCanvas.height = stageH;
        const stageCtx = stageCanvas.getContext('2d');
        if (!stageCtx) {
          reject(new Error('Canvas context tidak tersedia'));
          return;
        }
        stageCtx.drawImage(img, 0, 0, stageW, stageH);

        const activeBox = detectActiveContentBox(stageCtx, stageW, stageH);

        // 2. Determine target dimensions & smart center-crop based on asset kind
        let sx = activeBox.sx;
        let sy = activeBox.sy;
        let sw = activeBox.sw;
        let sh = activeBox.sh;
        let outW = sw;
        let outH = sh;
        let quality = 0.78;

        if (kind === 'AVATAR') {
          // Strict 1:1 square center crop, 256x256 px
          const minSide = Math.min(sw, sh);
          sx = sx + (sw - minSide) / 2;
          sy = sy + (sh - minSide) / 2;
          sw = minSide;
          sh = minSide;
          outW = 256;
          outH = 256;
          quality = 0.78;
        } else if (kind === 'COVER') {
          // Sleek 3:1 cover banner aspect ratio, max 960x320 px
          const targetRatio = 3.0;
          const currentRatio = sw / sh;
          if (currentRatio > targetRatio) {
            const newSw = sh * targetRatio;
            sx = sx + (sw - newSw) / 2;
            sw = newSw;
          } else {
            const newSh = sw / targetRatio;
            sy = sy + (sh - newSh) / 2;
            sh = newSh;
          }
          outW = Math.min(960, Math.round(sw));
          outH = Math.max(1, Math.round(outW / targetRatio));
          quality = 0.8;
        } else {
          // POST / DOCUMENT: max 960x720 preserving cropped content aspect ratio
          const maxW = 960;
          const maxH = 720;
          const scale = Math.min(1, maxW / sw, maxH / sh);
          outW = Math.max(1, Math.round(sw * scale));
          outH = Math.max(1, Math.round(sh * scale));
          quality = 0.78;
        }

        const outCanvas = document.createElement('canvas');
        outCanvas.width = outW;
        outCanvas.height = outH;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) {
          reject(new Error('Output canvas gagal diinisialisasi'));
          return;
        }

        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = 'high';
        outCtx.drawImage(stageCanvas, sx, sy, sw, sh, 0, 0, outW, outH);

        // Prefer WebP for 35% smaller storage footprint; fallback to JPEG if browser doesn't encode WebP
        let encodedDataUrl = outCanvas.toDataURL('image/webp', quality);
        let ext = 'webp';
        if (!encodedDataUrl.startsWith('data:image/webp')) {
          encodedDataUrl = outCanvas.toDataURL('image/jpeg', quality);
          ext = 'jpg';
        }

        const compressedBytes = Math.round((encodedDataUrl.length * 3) / 4);
        const { fileName, trackingCode, hashEnkripsi, dateStamp } =
          generateLeakageTrackedFileName(
            actorNrp,
            ext,
            kind,
            'UPLOAD',
            encodedDataUrl.slice(-96),
            compressedBytes
          );

        // Inject tracking filename parameter into the data URL header so any inspection reveals `WS-<hash>-<date>`
        const trackedDataUrl = encodedDataUrl.replace(
          /^data:(image\/[a-z]+);base64,/,
          `data:$1;name=${fileName};base64,`
        );

        resolve({
          dataUrl: trackedDataUrl,
          fileName,
          trackingCode,
          hashEnkripsi,
          dateStamp,
          originalBytes: file.size || Math.round((rawDataUrl.length * 3) / 4),
          compressedBytes,
          width: outW,
          height: outH,
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Triggers a browser file download with automatic `WS-<hash_enkripsi>-<date>.<ext>` naming
 * so exported CSVs, reports, or downloaded media can be traced if leaked.
 */
export function triggerTrackedDownload(params: {
  content: Blob | string;
  ext: string;
  actorNrp?: string;
  kind?: MediaAssetKind;
  mimeType?: string;
}): { fileName: string; trackingCode: string } {
  const {
    content,
    ext,
    actorNrp = 'ANON',
    kind = 'EXPORT',
    mimeType = 'text/csv;charset=utf-8;',
  } = params;

  const sample = typeof content === 'string' ? content.slice(0, 128) : `blob-${content.size}`;
  const sizeBytes = typeof content === 'string' ? content.length : content.size;

  const { fileName, trackingCode } = generateLeakageTrackedFileName(
    actorNrp,
    ext,
    kind,
    'DOWNLOAD',
    sample,
    sizeBytes
  );

  if (typeof window !== 'undefined') {
    let url = '';
    let shouldRevoke = false;
    if (typeof content === 'string' && content.startsWith('data:')) {
      url = content;
    } else if (typeof content === 'string') {
      const blob = new Blob([content], { type: mimeType });
      url = URL.createObjectURL(blob);
      shouldRevoke = true;
    } else {
      url = URL.createObjectURL(content);
      shouldRevoke = true;
    }

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
  }

  return { fileName, trackingCode };
}
