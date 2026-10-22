const MAX_SIDE = 512;

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

// Re-encodes in the browser: shrinks to 512 × 512 at most and drops metadata such as GPS tags.
export async function prepareLogo(file: File) {
  if (!LOGO_TYPES.includes(file.type)) {
    throw new Error("Use uma imagem PNG, JPG ou WebP.");
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Não foi possível ler essa imagem. Tente outro arquivo.");
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
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

  // Browsers without WebP encoding hand back a PNG instead, so the type is checked.
  const webp = await toBlob(canvas, "image/webp", 0.9);
  const logo = webp?.type === "image/webp" ? webp : await toBlob(canvas, "image/png");

  if (!logo) {
    throw new Error("Seu navegador não conseguiu preparar a imagem.");
  }

  if (logo.size > MAX_LOGO_BYTES) {
    throw new Error("Mesmo reduzida, a imagem passa de 2 MB. Escolha outra imagem.");
  }

  return logo;
}
