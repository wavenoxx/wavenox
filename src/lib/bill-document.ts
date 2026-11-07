import { BILL_LIMITS, inspectBillFile, inspectImageDimensions } from "./bill-intelligence";
export interface BillPage {
  dataUrl: string;
  width: number;
  height: number;
}
export interface Redaction {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PreparedBill {
  pages: BillPage[];
  warnings: string[];
}
function canvasFor(width: number, height: number) {
  const ratio = Math.min(1, BILL_LIMITS.rasterEdge / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  return canvas;
}
function raster(canvas: HTMLCanvasElement): BillPage {
  const dataUrl = canvas.toDataURL("image/jpeg", 0.86);
  if (dataUrl.length > BILL_LIMITS.pageBase64Chars)
    throw new Error(
      "A page is too complex to process safely. Upload a smaller clear image or use manual entry.",
    );
  return { dataUrl, width: canvas.width, height: canvas.height };
}
export async function prepareBillDocument(file: File, signal: AbortSignal): Promise<PreparedBill> {
  const mime = inspectBillFile(
    file.type,
    file.size,
    new Uint8Array(await file.slice(0, 12).arrayBuffer()),
  );
  signal.throwIfAborted();
  const warnings: string[] = [];
  if (mime !== "application/pdf") {
    inspectImageDimensions(new Uint8Array(await file.arrayBuffer()), mime);
    const bitmap = await createImageBitmap(file);
    try {
      signal.throwIfAborted();
      if (bitmap.width * bitmap.height > BILL_LIMITS.imagePixels)
        throw new Error("This image is too large to decode safely. Resize it below 24 megapixels.");
      if (Math.min(bitmap.width, bitmap.height) < 700)
        warnings.push(
          "Low-resolution image. Small digits may be unreadable; use a sharper scan and check every reading.",
        );
      const canvas = canvasFor(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return { pages: [raster(canvas)], warnings };
    } finally {
      bitmap.close();
    }
  }
  const pdf = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdf.GlobalWorkerOptions.workerSrc = workerUrl;
  const task = pdf.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    verbosity: 0,
    stopAtErrors: true,
    enableXfa: false,
    useWorkerFetch: false,
    useWasm: false,
    disableFontFace: true,
    maxImageSize: BILL_LIMITS.imagePixels,
    canvasMaxAreaInBytes: BILL_LIMITS.imagePixels * 4,
    disableWorkerRendering: true,
  });
  const destroy = () => {
    void task.destroy().catch(() => {});
  };
  signal.addEventListener("abort", destroy, { once: true });
  const timeout = window.setTimeout(destroy, 20_000);
  try {
    signal.throwIfAborted();
    const doc = await task.promise;
    if (doc.numPages > BILL_LIMITS.pages)
      throw new Error("Use a PDF with at most 3 bill pages, or enter the readings manually.");
    if ((await doc.getJSActions()) || (await doc.getAttachments()))
      throw new Error(
        "PDFs with scripts or embedded files are not supported. Export a plain PDF or use an image.",
      );
    const pages: BillPage[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      signal.throwIfAborted();
      const page = await doc.getPage(i);
      if (await page.getJSActions())
        throw new Error("Interactive PDFs are not supported. Export a plain PDF.");
      const original = page.getViewport({ scale: 1 });
      if (
        !Number.isFinite(original.width * original.height) ||
        original.width <= 0 ||
        original.height <= 0 ||
        original.width * original.height > BILL_LIMITS.imagePixels
      )
        throw new Error("Unsupported PDF page dimensions.");
      const viewport = page.getViewport({
        scale: Math.min(2, BILL_LIMITS.rasterEdge / Math.max(original.width, original.height)),
      });
      const canvas = canvasFor(viewport.width, viewport.height);
      await page.render({
        canvas,
        canvasContext: canvas.getContext("2d")!,
        viewport,
        background: "white",
        annotationMode: pdf.AnnotationMode.DISABLE,
      }).promise;
      pages.push(raster(canvas));
      page.cleanup();
    }
    signal.throwIfAborted();
    return {
      pages,
      warnings: [
        "PDF pages are converted to images locally. Check that all required text is visible; interactive annotations are excluded.",
      ],
    };
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", destroy);
    await task.destroy().catch(() => {});
  }
}
export async function redactBillPage(page: BillPage, redactions: Redaction[]): Promise<string> {
  const canvas = canvasFor(page.width, page.height);
  const img = new Image();
  img.src = page.dataUrl;
  await img.decode();
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#111111";
  for (const r of redactions)
    ctx.fillRect(
      Math.floor(r.x * canvas.width),
      Math.floor(r.y * canvas.height),
      Math.ceil(r.width * canvas.width),
      Math.ceil(r.height * canvas.height),
    );
  return raster(canvas).dataUrl.split(",")[1];
}
