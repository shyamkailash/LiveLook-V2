import { auth } from "@/lib/firebase";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

async function getAuthHeaders() {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const token = await auth?.currentUser?.getIdToken().catch(() => null);
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

function unwrapPayload<T>(payload: unknown) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  if (!API_BASE_URL) return fallback;

  try {
    const response = await fetch(buildUrl(path), {
      headers: await getAuthHeaders(),
    });

    if (!response.ok) return fallback;

    return unwrapPayload<T>(await response.json());
  } catch {
    return fallback;
  }
}

export async function apiPost<TPayload, TResponse>(
  path: string,
  payload: TPayload,
  fallback: TResponse,
): Promise<TResponse> {
  if (!API_BASE_URL) return fallback;

  try {
    const response = await fetch(buildUrl(path), {
      method: "POST",
      headers: {
        ...(await getAuthHeaders()),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return fallback;

    return unwrapPayload<TResponse>(await response.json());
  } catch {
    return fallback;
  }
}
