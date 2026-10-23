export const MAX_ATTACHMENT_LENGTH = 450_000;

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("File gagal dibaca"));
    reader.readAsDataURL(blob);
  });
}
