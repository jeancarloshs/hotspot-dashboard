"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NoticeKind = "error" | "info" | "success";

type Notice = {
  id: number;
  kind: NoticeKind;
  text: string;
};

type NoticeContextValue = {
  push: (text: string, kind?: NoticeKind) => void;
  pushForbidden: (text?: string) => void;
};

const NoticeContext = createContext<NoticeContextValue>({
  push: () => {},
  pushForbidden: () => {},
});

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Notice[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((text: string, kind: NoticeKind = "info") => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = nextId.current++;
    setItems((current) => [...current.slice(-2), { id, kind, text: trimmed }]);
  }, []);

  const pushForbidden = useCallback(
    (text = "Sem permissão para esta ação.") => push(text, "error"),
    [push]
  );

  const value = useMemo(() => ({ push, pushForbidden }), [push, pushForbidden]);

  return (
    <NoticeContext.Provider value={value}>
      {children}
      <div className="notice-stack" aria-live="polite">
        {items.map((item) => (
          <NoticeToast key={item.id} notice={item} onDismiss={dismiss} />
        ))}
      </div>
    </NoticeContext.Provider>
  );
}

function NoticeToast({
  notice,
  onDismiss,
}: {
  notice: Notice;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(notice.id), 4200);
    return () => window.clearTimeout(timer);
  }, [notice.id, onDismiss]);

  return (
    <div className={`notice-toast notice-toast--${notice.kind}`} role="status">
      <p>{notice.text}</p>
      <button type="button" className="notice-toast__close" onClick={() => onDismiss(notice.id)} aria-label="Fechar">
        ×
      </button>
    </div>
  );
}

export function useNotice() {
  return useContext(NoticeContext);
}
