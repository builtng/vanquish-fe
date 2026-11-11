import apiService from "@/lib/api";

/**
 * Opens a document that sits behind the logged-in API (applicant uploads).
 *
 * - Uses the same API address as the rest of the app (the raw env value can
 *   be missing in production, which sent the request to the wrong server).
 * - Opens the file in a new tab so PDFs and images can be viewed straight
 *   away, instead of downloading a file with no extension.
 * - Shows the server's real reason when a file cannot be opened.
 *
 * @param {string} endpoint API path, e.g. `/qc-applications/12/document/valid_id_document`
 * @param {string} label    Friendly name used if the file has to be downloaded
 */
export async function openProtectedDocument(endpoint, label = "document") {
  // Open the tab straight away (inside the click) so pop-up blockers allow it.
  const viewer = typeof window !== "undefined" ? window.open("", "_blank") : null;

  try {
    const token = apiService.getToken();
    const response = await fetch(`${apiService.baseURL}${endpoint}`, {
      headers: {
        Accept: "application/json, */*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      let message = "This document could not be opened.";
      try {
        const data = await response.json();
        if (data?.message) message = data.message;
      } catch {
        // not JSON
      }
      throw new Error(message);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    if (viewer && !viewer.closed) {
      viewer.location.href = blobUrl;
    } else {
      // Pop-up blocked: fall back to downloading with a sensible file name.
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = match ? decodeURIComponent(match[1]) : label.replace(/[^a-zA-Z0-9_-]/g, "_");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    if (viewer && !viewer.closed) viewer.close();
    console.error("Document open error:", err);
    alert(`${label}: ${err.message || "This document could not be opened. Please try again."}`);
  }
}
