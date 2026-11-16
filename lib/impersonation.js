/**
 * "View portal": an admin views a counsellor's portal, read-only, in a new
 * tab. The counsellor token lives ONLY in that tab's sessionStorage, so the
 * admin's own tab (token in localStorage) stays signed in as the admin.
 */
const KEY = "vqt_impersonation";
export const IMPERSONATION_READY = "vqt-impersonation-ready";
export const IMPERSONATION_PAYLOAD = "vqt-impersonation-payload";

function storage() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function getImpersonation() {
  const s = storage();
  if (!s) return null;
  try {
    const data = JSON.parse(s.getItem(KEY) || "null");
    if (!data?.token) return null;
    if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
      s.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function isImpersonating() {
  return !!getImpersonation();
}

export function setImpersonation(payload) {
  storage()?.setItem(
    KEY,
    JSON.stringify({
      token: payload.token,
      expires_at: payload.expires_at,
      counsellor: payload.counsellor,
    }),
  );
}

export function clearImpersonation() {
  storage()?.removeItem(KEY);
}

/**
 * Admin tab: start viewing a counsellor's portal. The new tab is opened
 * inside the click (so pop-up blockers allow it), then the token is handed
 * to it with postMessage (never in the URL, never in localStorage).
 *
 * @param {string} tcUuid counsellor uuid
 * @param {(uuid: string) => Promise<object>} startRequest API call that returns the token payload
 */
export async function openCounsellorPortalAs(tcUuid, startRequest) {
  const viewer = window.open("/portal-view", "_blank");
  if (!viewer) {
    throw new Error("Please allow pop-ups for this site to view the counsellor's portal.");
  }

  let payload;
  try {
    payload = await startRequest(tcUuid);
  } catch (err) {
    viewer.close();
    throw err;
  }

  const origin = window.location.origin;
  const send = () => {
    if (!viewer.closed) viewer.postMessage({ type: IMPERSONATION_PAYLOAD, payload }, origin);
  };

  // The new tab asks for the token once it has loaded; answer every ask
  // (it stops asking once it has the token).
  const onMessage = (event) => {
    if (event.origin !== origin || event.source !== viewer) return;
    if (event.data?.type === IMPERSONATION_READY) send();
  };
  window.addEventListener("message", onMessage);
  setTimeout(() => window.removeEventListener("message", onMessage), 60000);
  send();
}
