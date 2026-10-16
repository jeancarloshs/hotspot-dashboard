export function messageFrom(data: unknown, fallback: string) {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    if ("message" in data && typeof data.message === "string" && data.message.trim()) return data.message;
    if ("error" in data && typeof data.error === "string" && data.error.trim()) return data.error;
  }
  return fallback;
}
