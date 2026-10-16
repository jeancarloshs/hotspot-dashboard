import { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
};

export function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["data", "users", "clients", "hotspots", "providers", "plans", "vouchers", "paymentGateways", "gateways"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

function statusTone(value: string) {
  const normalized = value.trim().toLowerCase();
  if (
    normalized.includes("inativ") ||
    normalized === "offline" ||
    normalized === "inactive" ||
    normalized === "disabled" ||
    normalized === "desativado"
  ) {
    return "idle";
  }
  if (
    normalized === "ativo" ||
    normalized.startsWith("ativ") ||
    normalized === "online" ||
    normalized === "active"
  ) {
    return "ok";
  }
  if (normalized.includes("bloq") || normalized.includes("cancel") || normalized.includes("rejeit")) {
    return "bad";
  }
  if (normalized.includes("pend")) return "wait";
  return "neutral";
}

export function StatusPill({ value }: { value?: string | null }) {
  const label = value?.trim() || "—";
  return <span className={`pill pill--${statusTone(label)}`}>{label}</span>;
}

export function ResourceTable<T>({
  rows,
  columns,
  empty,
  rowKey,
  bare = false,
}: {
  rows: T[];
  columns: Column<T>[];
  empty: string;
  rowKey: (row: T, index: number) => string | number;
  bare?: boolean;
}) {
  const content = rows.length === 0 ? (
    <div className="empty-state">{empty}</div>
  ) : (
    <div className="table-wrap">
      <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.align === "right" ? "is-right" : undefined}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.align === "right" ? "is-right" : undefined}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );

  if (bare) return content;
  return <section className="panel">{content}</section>;
}
