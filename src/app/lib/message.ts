export function isForbiddenStatus(status?: number): boolean {
  return status === 403;
}

export function isForbiddenPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  const error = typeof record.error === "string" ? record.error.toLowerCase() : "";
  const message = typeof record.message === "string" ? record.message.toLowerCase() : "";
  return error === "forbidden"
    || message.includes("permissão insuficiente")
    || message.includes("permissoes insuficiente")
    || message.includes("sem permissão")
    || message.includes("forbidden");
}

/** Mensagem amigável para respostas da API; 403 vira texto claro de ACL. */
export function messageFrom(data: unknown, fallback: string, status?: number) {
  if (isForbiddenStatus(status) || isForbiddenPayload(data)) {
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim() && !msg.toLowerCase().includes("forbidden")) {
        return msg.trim();
      }
    }
    return "Sem permissão para esta ação.";
  }
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    if ("message" in data && typeof data.message === "string" && data.message.trim()) return data.message;
    if ("error" in data && typeof data.error === "string" && data.error.trim()) {
      const error = data.error.trim();
      if (error.toLowerCase() === "forbidden") return "Sem permissão para esta ação.";
      return error;
    }
  }
  return fallback;
}
