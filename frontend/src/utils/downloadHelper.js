// Shared by every download/save button so the blob-to-file logic
// (and its errors) live in exactly one place.
export const triggerBlobDownload = (blobData, filename) => {
  const url = URL.createObjectURL(new Blob([blobData]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};