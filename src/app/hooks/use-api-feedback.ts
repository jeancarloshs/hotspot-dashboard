"use client";

import { useNotice } from "@/app/components/_ui/notice/NoticeProvider";
import { isForbiddenPayload, isForbiddenStatus, messageFrom } from "@/app/lib/message";
import { useCallback, useState } from "react";

/** Erro inline + toast automático em 403. */
export function useApiFeedback() {
  const notice = useNotice();
  const [error, setError] = useState("");

  const clearError = useCallback(() => setError(""), []);

  const fromResponse = useCallback(
    (status: number, data: unknown, fallback: string) => {
      const text = messageFrom(data, fallback, status);
      setError(text);
      if (isForbiddenStatus(status) || isForbiddenPayload(data)) {
        notice.pushForbidden(text);
      }
      return text;
    },
    [notice]
  );

  return { error, setError, clearError, fromResponse };
}
