import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE,
});

// Attaches the stored access token (if any) to every request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("aiaa_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// When an access token expires (15min by default), the backend returns 401.
// Instead of treating that as "logged out", silently use the refresh token
// to get a new access token and retry the original request once. Only if
// the refresh token itself is invalid/expired do we actually clear the session.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      const refreshToken = typeof window !== "undefined" ? window.localStorage.getItem("aiaa_refresh_token") : null;

      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      try {
        // Multiple requests can 401 at the same moment; share one refresh call between them.
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE}/auth/refresh`, { refreshToken })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        window.localStorage.setItem("aiaa_access_token", data.accessToken);

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function setSession({ accessToken, refreshToken }) {
  if (typeof window === "undefined") return;
  if (accessToken) window.localStorage.setItem("aiaa_access_token", accessToken);
  if (refreshToken) window.localStorage.setItem("aiaa_refresh_token", refreshToken);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("aiaa_access_token");
  window.localStorage.removeItem("aiaa_refresh_token");
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("aiaa_access_token");
}

// Backend file routes (profile photos, documents, attachments) return paths
// like "/uploads/xyz.jpg" which are relative to the backend's own origin,
// not the frontend's. This resolves them to a full, loadable URL.
export function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const origin = API_BASE.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}
