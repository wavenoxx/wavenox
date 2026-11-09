import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { sanitizeProjectDocument } from "./project-files";
describe("private project scan validation", () => {
  it("decodes JPEG and PNG scans into metadata-free JPEG", async () => {
    for (const mime of ["image/png", "image/jpeg"]) {
      const input = sharp({
        create: { width: 500, height: 600, channels: 3, background: "white" },
      });
      const bytes =
        mime === "image/png" ? await input.png().toBuffer() : await input.jpeg().toBuffer();
      const result = await sanitizeProjectDocument(mime, bytes);
      const meta = await sharp(result).metadata();
      expect(meta.format).toBe("jpeg");
      expect(meta.exif).toBeUndefined();
    }
  });
  it("rejects active/unsupported, mismatched, corrupt and oversized content", async () => {
    for (const [mime, bytes] of [
      ["text/html", Buffer.from("<script>secret</script>")],
      ["application/pdf", Buffer.from("%PDF-1.7")],
      ["image/png", Buffer.from("not png")],
      ["image/jpeg", Buffer.alloc(3 * 1024 * 1024 + 1)],
    ] as const)
      await expect(sanitizeProjectDocument(mime, bytes)).rejects.toThrow();
  });
});
