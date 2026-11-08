import sharp from "sharp";
import { PROJECT_DOCUMENT_LIMIT } from "@/lib/projects";
import { inspectBillFile, inspectImageDimensions } from "@/lib/bill-intelligence";
import { ProjectError } from "./project-store";
export async function sanitizeProjectDocument(mime: string, bytes: Buffer): Promise<Buffer> {
  if (
    !["image/jpeg", "image/png"].includes(mime) ||
    bytes.length === 0 ||
    bytes.length > PROJECT_DOCUMENT_LIMIT
  )
    throw new ProjectError(
      400,
      "Choose a JPEG or PNG scan up to 3 MiB. PDFs and active documents are not accepted.",
    );
  try {
    inspectBillFile(mime, bytes.length, bytes);
    inspectImageDimensions(bytes, mime as "image/jpeg" | "image/png");
    const meta = await sharp(bytes, { limitInputPixels: 24_000_000, failOn: "warning" }).metadata();
    if ((meta.pages ?? 1) !== 1) throw new Error("Multiple frames");
    const clean = await sharp(bytes, { limitInputPixels: 24_000_000, failOn: "warning" })
      .rotate()
      .resize({ width: 3200, height: 3200, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "white" })
      .jpeg({ quality: 90 })
      .timeout({ seconds: 5 })
      .toBuffer();
    if (clean.length > PROJECT_DOCUMENT_LIMIT) throw new Error("Result too large");
    return clean;
  } catch {
    throw new ProjectError(
      400,
      "The document could not be validated. Use a clear JPEG or PNG scan.",
    );
  }
}
