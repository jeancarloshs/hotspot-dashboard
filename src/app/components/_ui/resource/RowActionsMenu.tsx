"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type RowActionItem = {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  hidden?: boolean;
};

export function RowActionsMenu({
  label = "Ações",
  items,
}: {
  label?: string;
  items: RowActionItem[];
}) {
  const visible = items.filter((item) => !item.hidden);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const placeMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 6,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  };

  useEffect(() => {
    if (!open) return;
    placeMenu();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onReposition = () => placeMenu();
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  if (visible.length === 0) return null;

  if (visible.length === 1) {
    const item = visible[0];
    if (item.href) {
      return (
        <div className="row-links">
          <Link href={item.href}>{item.label}</Link>
        </div>
      );
    }
    return (
      <div className="row-links">
        <button
          type="button"
          className="text-link"
          style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
          disabled={item.disabled}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      </div>
    );
  }

  return (
    <div className="row-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="row-menu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          if (!open) placeMenu();
          setOpen((value) => !value);
        }}
      >
        {label}
        <span aria-hidden="true">▾</span>
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              className="row-menu__panel"
              role="menu"
              style={{ top: coords.top, right: coords.right }}
            >
              {visible.map((item) =>
                item.href ? (
                  <Link
                    key={item.key}
                    role="menuitem"
                    className="row-menu__item"
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    className="row-menu__item"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                    }}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
