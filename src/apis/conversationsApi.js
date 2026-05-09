// src/apis/conversationsApi.js

// ---- Env & base URL ---------------------------------------------------------
const RAW_API_BASE =
  (import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BASE_URL ||
    "").trim();

if (!RAW_API_BASE) {
  // Hard fail early in console so you notice during dev
  console.error(
    "[conversationsApi] Missing VITE_API_BASE_URL (or VITE_BASE_URL). " +
      "Set it to your backend, e.g. https://tendr-backend-70a2.onrender.com/api/v1"
  );
}

// Normalize (remove trailing slashes)
const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

// JWT storage key (optional)
const JWT_KEY = import.meta.env.VITE_JWT_STORAGE_KEY || "jwt";

// Optional override for the path; default to "/conversations"
const ENV_CONVERSATIONS_PATH = (import.meta.env.VITE_CONVERSATIONS_PATH || "/conversations")
  .toString()
  .replace(/^\/?/, "/");

// ---- Helpers ----------------------------------------------------------------
function getAuthToken() {
  try {
    return localStorage.getItem(JWT_KEY) || "";
  } catch {
    return "";
  }
}

function authHeaders(extra = {}) {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/**
 * Try multiple paths on the same base (useful for /conversations vs /api/v1/conversations).
 * Returns the first successful Response (res.ok). If a path 404s, tries the next.
 * Throws on non-404 errors.
 */
async function tryFetch(paths, init) {
  if (!API_BASE) {
    throw new Error(
      "VITE_API_BASE_URL (or VITE_BASE_URL) is not set; cannot call conversations API."
    );
  }

  let lastErr;
  for (const p of paths) {
    const url = `${API_BASE}${p}`;
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;

      // For 404, continue to next candidate path
      if (res.status === 404) {
        lastErr = new Error(`GET ${url} -> 404`);
        continue;
      }

      // Other status codes: read body (if any) for debugging and stop trying
      const text = await res.text().catch(() => "");
      lastErr = new Error(`Request ${init?.method || "GET"} ${url} failed (${res.status}). ${text || ""}`.trim());
      break;
    } catch (e) {
      lastErr = e;
      // Network or CORS failures should stop immediately
      break;
    }
  }
  throw lastErr || new Error("All fetch attempts failed");
}

/**
 * Build a pair of candidate paths that cover both:
 *   /conversations
 *   /api/v1/conversations
 */
function candidatePathsFor(pathFromEnv = ENV_CONVERSATIONS_PATH) {
  const preferred = pathFromEnv.startsWith("/") ? pathFromEnv : `/${pathFromEnv}`;
  const alt = preferred.includes("/api/v1/")
    ? preferred.replace("/api/v1/", "/")
    : `/api/v1${preferred}`;
  return preferred === alt ? [preferred] : [preferred, alt];
}

// ---- Public API --------------------------------------------------------------

/**
 * GET conversations.
 * Returns an array of conversation objects (server shape), or [] on 404.
 */
export async function fetchConversations({ signal } = {}) {
  const paths = candidatePathsFor(ENV_CONVERSATIONS_PATH);

  try {
    const res = await tryFetch(paths, {
      method: "GET",
      headers: authHeaders(),
      credentials: "include",
      signal,
    });

    // If we're here, res.ok === true
    const json = await res.json().catch(() => ({}));
    // Accept either { conversations: [...] } or a raw array [...]
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.conversations)) return json.conversations;
    return [];
  } catch (e) {
    // Treat 404 as "no conversations yet"
    if (/-> 404$/.test(e?.message || "") || e?.status === 404) {
      return [];
    }
    throw e;
  }
}

/**
 * POST a message into a conversation.
 * @param {string} conversationId
 * @param {{sender: "user"|"customer-care", content: string}} payload
 * Returns the parsed JSON response from the server.
 */
export async function postConversationMessage(conversationId, { sender, content }) {
  if (!conversationId) throw new Error("conversationId is required");
  if (!content) throw new Error("content cannot be blank");

  const msgPath = `${ENV_CONVERSATIONS_PATH}/${encodeURIComponent(conversationId)}/message`;
  const paths = candidatePathsFor(msgPath);

  let lastErr;
  for (const p of paths) {
    const url = `${API_BASE}${p}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ sender, content }),
      });
      if (res.ok) return res.json();
      const text = await res.text().catch(() => "");
      lastErr = new Error(`POST ${url} failed (${res.status}). ${text || ""}`.trim());
      if (res.status !== 404) break; // only try alt path on 404
    } catch (e) {
      lastErr = e;
      break;
    }
  }
  throw lastErr || new Error("Failed to post conversation message");
}

/**
 * Map server conversation objects into vendor items for the picker modal.
 * Adjust field extraction if your backend shape differs.
 */
export function mapConversationsToVendors(conversations = []) {
  return conversations.map((c) => {
    const vendorId =
      c.vendor?._id ||
      c.vendorId ||
      c.requestId?.vendorId ||
      c._id;

    const vendorName =
      c.vendor?.name ||
      c.vendorName ||
      c.requestId?.vendorName ||
      c.requestId?.serviceProviderName ||
      c.name ||
      "Vendor";

    const lastMessage =
      c.lastMessage?.content ||
      c.lastMessage ||
      c.preview ||
      "";

    const unreadCount =
      typeof c.unreadCount === "number"
        ? c.unreadCount
        : Number(c.unread || 0);

    const approved =
      c.vendor?.approved ?? c.approved ?? true;

    return {
      _id: vendorId,
      name: vendorName,
      lastMessage,
      unreadCount,
      approved,
      __conversation: c, // keep original for debugging if needed
    };
  });
}


/**
 * Conversation array loading api on admin dashboard 
 */

export async function getAllConversation({ signal, chatType }) {
  const typeMap = { vendor: 'vendor', support: 'support', event: 'concierge' };
  const mappedType = typeMap[chatType] || chatType;
  const path = `/admin/conversations?chatType=${mappedType}`;

  // Use the correct token key (tendr_token, set on login)
  const token = localStorage.getItem('tendr_token') || localStorage.getItem('jwt') || '';

  try {
    const res = await tryFetch([path], {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
      signal,
    });
    if (res.ok) {
      const data = await res.json();
      return data.conversations || [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Get conversation messages by ID
 */
export async function getConversationMessages(id) {
  const path = `/messages/${id}/messages`;

  try {
    const res = await tryFetch([path] , {
      method: "GET"
    })

    if(res.ok){
      const data = await res.json();
      return data
    }
    
  } catch (error) {
    throw new Error("Failed to fetch conversation messages: " + error.message);
  }
}

