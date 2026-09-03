export interface ApiClientOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: BodyInit | Record<string, unknown> | null;
  token?: string;
}

export class ApiClientError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

const inFlightGetRequests = new Map<string, Promise<unknown>>();

/**
 * Unified fetch wrapper supporting in-flight GET deduplication,
 * automated JSON parsing, and error formatting.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { params, body, headers = {}, token, method = "GET", ...restOptions } = options;

  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const reqHeaders = new Headers(headers);

  if (token) {
    reqHeaders.set("Authorization", `Bearer ${token}`);
  }

  let finalBody: BodyInit | undefined;
  if (body) {
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      finalBody = body;
    } else if (typeof body === "string" || body instanceof Blob || body instanceof ArrayBuffer) {
      finalBody = body;
    } else {
      if (!reqHeaders.has("Content-Type")) {
        reqHeaders.set("Content-Type", "application/json");
      }
      finalBody = JSON.stringify(body);
    }
  }

  const isGet = method.toUpperCase() === "GET";
  if (isGet && inFlightGetRequests.has(url)) {
    return inFlightGetRequests.get(url) as Promise<T>;
  }

  const fetchPromise = (async (): Promise<T> => {
    try {
      const response = await fetch(url, {
        method,
        headers: reqHeaders,
        body: finalBody,
        ...restOptions,
      });

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        const errorMessage =
          (typeof errorData === "object" && errorData !== null && "error" in errorData
            ? String((errorData as { error: unknown }).error)
            : (typeof errorData === "object" && errorData !== null && "message" in errorData
            ? String((errorData as { message: unknown }).message)
            : `Request failed with status ${response.status}`));

        throw new ApiClientError(errorMessage, response.status, errorData);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } finally {
      if (isGet) {
        inFlightGetRequests.delete(url);
      }
    }
  })();

  if (isGet) {
    inFlightGetRequests.set(url, fetchPromise);
  }

  return fetchPromise;
}
