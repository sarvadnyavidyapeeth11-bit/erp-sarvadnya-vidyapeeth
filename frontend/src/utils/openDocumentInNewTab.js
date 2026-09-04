const escapeHtml = (value = "") => (
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]))
);

const dataUrlToBlob = (dataUrl = "") => {
  const match = String(dataUrl).match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) return null;
  const mimeType = match[1] || "application/octet-stream";
  const isBase64 = Boolean(match[2]);
  const data = match[3] || "";
  const binary = isBase64 ? atob(data) : decodeURIComponent(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
};

const getStablePreviewUrl = (fileUrl = "") => {
  if (String(fileUrl).startsWith("data:")) {
    const blob = dataUrlToBlob(fileUrl);
    if (!blob) return fileUrl;
    const objectUrl = URL.createObjectURL(blob);
    window.__erpDocumentPreviewUrls = window.__erpDocumentPreviewUrls || [];
    window.__erpDocumentPreviewUrls.push(objectUrl);
    return objectUrl;
  }
  return fileUrl;
};

export const openDocumentInNewTab = (doc = {}) => {
  const fileUrl = doc.fileUrl || doc.url || doc.src || "";
  const fileName = doc.savedFile || doc.file || doc.docName || doc.name || "Document";
  const safeTitle = escapeHtml(fileName);
  const hasRenderableUrl = typeof fileUrl === "string" && /^(data:|blob:|https?:\/\/)/i.test(fileUrl);

  if (!hasRenderableUrl) {
    const message = `File content is not available for preview. Only the saved file name is present in ERP: ${fileName}`;
    const missingPreview = window.open("", "_blank", "noopener,noreferrer");
    if (!missingPreview) {
      window.alert(message);
      return;
    }

    missingPreview.document.write(`<!doctype html>
<html>
  <head>
    <title>${safeTitle}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; font-family: Arial, sans-serif; color: #0f172a; }
      .card { max-width: 520px; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); }
      h1 { margin: 0 0 10px; font-size: 20px; }
      p { margin: 6px 0; color: #475569; line-height: 1.5; }
      code { color: #6d28d9; font-weight: 700; word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Document file not available</h1>
      <p>ERP me document record saved hai, lekin actual uploaded file content nahi mila.</p>
      <p>Saved File: <code>${safeTitle}</code></p>
      <p>Student ko document dobara upload karna hoga, tab preview open hoga.</p>
    </div>
  </body>
</html>`);
    missingPreview.document.close();
    return;
  }

  const isPdf = (
    String(doc.fileType || "").includes("pdf") ||
    String(fileName).match(/\.pdf$/i) ||
    String(fileUrl).startsWith("data:application/pdf")
  );

  if (isPdf) {
    const pdfUrl = getStablePreviewUrl(fileUrl);
    const preview = window.open("", "_blank", "noopener,noreferrer");
    if (!preview) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
      return;
    }
    preview.document.write(`<!doctype html>
<html>
  <head>
    <title>${safeTitle}</title>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; width: 100%; height: 100%; background: #f8fafc; }
      iframe { width: 100%; height: 100%; border: 0; background: #fff; }
      .fallback { position: fixed; top: 10px; right: 12px; z-index: 2; font-family: Arial, sans-serif; font-size: 12px; }
      .fallback a { color: #4f46e5; font-weight: 700; text-decoration: none; background: #fff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 8px 10px; }
    </style>
  </head>
  <body>
    <div class="fallback"><a href="${pdfUrl}" download="${safeTitle}">Download PDF</a></div>
    <iframe src="${pdfUrl}" title="${safeTitle}"></iframe>
  </body>
</html>`);
    preview.document.close();
    return;
  }

  const preview = window.open("", "_blank", "noopener,noreferrer");
  if (!preview) {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
    return;
  }

  const isImage = String(doc.fileType || "").startsWith("image/") || String(fileName).match(/\.(png|jpe?g|webp)$/i);
  const content = isImage
    ? `<img src="${fileUrl}" alt="${safeTitle}" />`
    : `<iframe src="${fileUrl}" title="${safeTitle}"></iframe>`;

  preview.document.write(`<!doctype html>
<html>
  <head>
    <title>${safeTitle}</title>
    <style>
      html, body { margin: 0; width: 100%; height: 100%; background: #111827; }
      body { display: flex; align-items: center; justify-content: center; }
      iframe { width: 100%; height: 100%; border: 0; background: #fff; }
      img { max-width: 100%; max-height: 100%; object-fit: contain; }
    </style>
  </head>
  <body>${content}</body>
</html>`);
  preview.document.close();
};
