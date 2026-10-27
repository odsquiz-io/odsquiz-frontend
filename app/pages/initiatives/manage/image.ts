export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

type Encoding = { type: string; quality?: number };

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

// Re-encodes in the browser: shrinks the longest side to maxSide at most and drops
// metadata such as GPS tags. The first encoding that fits in 2 MB wins.
async function prepareImage(file: File, maxSide: number, encodings: Encoding[]) {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error("Use uma imagem PNG, JPG ou WebP.");
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Não foi possível ler essa imagem. Tente outro arquivo.");
  });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");

  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("Seu navegador não conseguiu preparar a imagem.");
  }

  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let encoded = false;

  for (const { type, quality } of encodings) {
    const blob = await toBlob(canvas, type, quality);

    // Browsers without WebP encoding hand back a PNG instead, so the type is checked.
    if (blob?.type !== type) {
      continue;
    }

    encoded = true;

    if (blob.size <= MAX_IMAGE_BYTES) {
      return blob;
    }
  }

  throw new Error(
    encoded
      ? "Mesmo reduzida, a imagem passa de 2 MB. Escolha outra imagem."
      : "Seu navegador não conseguiu preparar a imagem.",
  );
}

export function prepareLogo(file: File) {
  return prepareImage(file, 512, [{ type: "image/webp", quality: 0.9 }, { type: "image/png" }]);
}

// JPEG is the last resort: without WebP, a photo saved as PNG often passes 2 MB.
export function preparePhoto(file: File) {
  return prepareImage(file, 1600, [
    { type: "image/webp", quality: 0.85 },
    { type: "image/png" },
    { type: "image/jpeg", quality: 0.85 },
  ]);
}
