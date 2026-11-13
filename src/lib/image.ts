// Client-side image helpers: square-crop and downscale before upload
// (keeps uploads ~100 KB and well under the serverless body limit).

const SIZE = 720;
const QUALITY = 0.85;

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", QUALITY),
  );
}

function squareCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  mirror: boolean,
): HTMLCanvasElement {
  const side = Math.min(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  if (mirror) {
    // Match the mirrored preview people saw while posing.
    ctx.translate(SIZE, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  return canvas;
}

export function captureVideoFrame(video: HTMLVideoElement): Promise<Blob> {
  return toJpeg(squareCanvas(video, video.videoWidth, video.videoHeight, true));
}

export async function normalizeFile(file: File): Promise<Blob> {
  // createImageBitmap respects EXIF orientation in modern browsers.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    return await toJpeg(squareCanvas(bitmap, bitmap.width, bitmap.height, false));
  } finally {
    bitmap.close();
  }
}
