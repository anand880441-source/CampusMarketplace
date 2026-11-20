const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TOKEN_KEY = "campusmarket_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  let data: { message?: string } | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || "Something went wrong. Please try again.",
      response.status
    );
  }

  return data as T;
}

export async function uploadImages(files: File[]) {
  const token = getToken();
  const formData = new FormData();

  files.forEach((file) => formData.append("images", file));

  const response = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  let data: { message?: string; urls?: string[] } | null = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || "Could not upload images. Please try again.",
      response.status
    );
  }

  return data?.urls || [];
}

export function assetUrl(path?: string) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
