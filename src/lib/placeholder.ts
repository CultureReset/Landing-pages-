/**
 * Deterministic abstract cover art. Used for demo content and as the fallback
 * whenever a business has not uploaded a photo — no third-party image host,
 * no network round trip, identical output for the same seed every time.
 */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let state = hash(seed) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

/** Six palettes that read as photography-adjacent rather than "default gradient". */
const PALETTES: [string, string, string, string][] = [
  ["#1b2a3a", "#2f5d78", "#7fb0b5", "#e8d5b7"], // coastal dusk
  ["#2a1a12", "#7c3f21", "#c9763a", "#f0c88a"], // terracotta
  ["#12211a", "#25543c", "#5f9a6c", "#cfe0b8"], // forest
  ["#1a1626", "#3f2c5c", "#8055a8", "#e3cbe8"], // violet hour
  ["#241a1a", "#5e2f34", "#b05a52", "#f0cdb4"], // clay
  ["#101a26", "#1f3b5c", "#4a7fb0", "#d5e4ef"], // blue hour
];

export function placeholderSvg(seed: string, w = 1200, h = 800): string {
  const rand = rng(seed);
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)];
  const [c0, c1, c2, c3] = palette;
  const angle = Math.floor(rand() * 90) + 15;

  const blobs = Array.from({ length: 4 }, (_, i) => {
    const cx = rand() * w;
    const cy = rand() * h;
    const r = (0.28 + rand() * 0.42) * Math.max(w, h);
    const fill = [c1, c2, c3, c2][i];
    const opacity = (0.4 + rand() * 0.4).toFixed(2);
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${opacity}"/>`;
  }).join("");

  // A couple of hard edges keep it from reading as a pure blur.
  const bandY = (0.45 + rand() * 0.35) * h;
  const bandH = (0.04 + rand() * 0.06) * h;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="55%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${(Math.max(w, h) * 0.09).toFixed(0)}"/>
    </filter>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${hash(seed) % 1000}"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.09"/></feComponentTransfer>
    </filter>
    <radialGradient id="vig" cx="50%" cy="42%" r="78%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g filter="url(#soft)">${blobs}</g>
  <rect x="0" y="${bandY.toFixed(0)}" width="${w}" height="${bandH.toFixed(0)}" fill="${c3}" opacity="0.16"/>
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.55"/>
</svg>`;
}

/** Circular monogram art for avatars. */
export function avatarSvg(seed: string, letters: string, size = 400): string {
  const rand = rng(seed);
  const palette = PALETTES[Math.floor(rand() * PALETTES.length)];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="a" gradientTransform="rotate(${Math.floor(rand() * 120)})">
      <stop offset="0%" stop-color="${palette[1]}"/>
      <stop offset="100%" stop-color="${palette[2]}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#a)"/>
  <circle cx="${(rand() * size).toFixed(0)}" cy="${(rand() * size).toFixed(0)}" r="${(size * 0.5).toFixed(0)}" fill="${palette[3]}" opacity="0.22"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
    font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="${(size * 0.36).toFixed(0)}"
    font-weight="600" fill="${palette[0]}" opacity="0.92">${letters}</text>
</svg>`;
}

export function placeholderUrl(seed: string, w = 1200, h = 800): string {
  return `/api/img/${encodeURIComponent(seed)}?w=${w}&h=${h}`;
}

export function avatarUrl(seed: string, letters: string, size = 400): string {
  return `/api/img/${encodeURIComponent(seed)}?w=${size}&h=${size}&kind=avatar&t=${encodeURIComponent(letters)}`;
}
