const DEPLOYED_API_BASE_URL = "https://incomeshield-ai-w7lt.onrender.com";

export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!raw) {
    return DEPLOYED_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalFrontend =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local");

    const pointsToLocalApi =
      raw.includes("127.0.0.1") || raw.includes("localhost");

    if (!isLocalFrontend && pointsToLocalApi) {
      return DEPLOYED_API_BASE_URL;
    }
  }

  return raw;
}
