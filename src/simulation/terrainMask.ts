/**
 * Lecture de l'image terre/océan -> masque booléen isLand.
 * Méthode volontairement simple : image dans un canvas caché, lecture des pixels,
 * seuil de luminosité, sous-échantillonnage au plus proche voisin.
 */
export interface TerrainSource {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  /** true si les pixels clairs représentent la terre (détecté automatiquement). */
  brightIsLand: boolean;
}

const THRESHOLD = 128;

export async function loadTerrainSource(url: string): Promise<TerrainSource> {
  const img = new Image();
  img.src = url;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Les océans couvrent ~71 % du globe : si la majorité des pixels est claire,
  // alors clair = océan, sinon clair = terre.
  let bright = 0;
  const stride = 4 * 16; // échantillonnage : 1 pixel sur 16 suffit
  let sampled = 0;
  for (let i = 0; i < data.length; i += stride) {
    if (data[i] > THRESHOLD) bright++;
    sampled++;
  }
  const brightIsLand = bright / sampled < 0.5;

  return { data, width, height, brightIsLand };
}

/** Construit le masque isLand à la résolution de la grille de simulation. */
export function buildLandMask(src: TerrainSource, gridW: number, gridH: number): Uint8Array {
  const mask = new Uint8Array(gridW * gridH);
  for (let gy = 0; gy < gridH; gy++) {
    const sy = Math.min(src.height - 1, Math.floor(((gy + 0.5) / gridH) * src.height));
    for (let gx = 0; gx < gridW; gx++) {
      const sx = Math.min(src.width - 1, Math.floor(((gx + 0.5) / gridW) * src.width));
      const lum = src.data[(sy * src.width + sx) * 4];
      const isBright = lum > THRESHOLD;
      mask[gy * gridW + gx] = isBright === src.brightIsLand ? 1 : 0;
    }
  }
  return mask;
}
