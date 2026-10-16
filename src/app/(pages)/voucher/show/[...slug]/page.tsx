"use client";

import { deleteVoucher, getVoucher } from "@/actions/vouchers";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type VoucherRecord = {
  id?: number;
  code?: string;
  password?: string;
  status?: string;
  expires_at?: string;
  created_at?: string;
  planID?: number;
  hsID?: number;
  plan?: { name?: string };
  hotspot?: { nome?: string };
};

function messageFrom(data: unknown, fallback: string) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return fallback;
}

function unwrap(value: unknown): VoucherRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.code || record.id) return record as VoucherRecord;
  if (record.voucher && typeof record.voucher === "object") return record.voucher as VoucherRecord;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as VoucherRecord;
  }
  return null;
}

const VoucherShowPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const id = React.use(params).slug[0];
  const [voucher, setVoucher] = useState<VoucherRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await getVoucher(id);
      const record = unwrap(response);
      if (!record) {
        setMissing(true);
        return;
      }
      setVoucher(record);
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const response = await deleteVoucher(id);
    if (response.status === 200) {
      router.push("/vouchers");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível excluir o voucher."));
    setDeleting(false);
  };

  if (missing) {
    return (
      <SideBar>
        <div className="empty-state">Voucher não encontrado.</div>
      </SideBar>
    );
  }

  if (!voucher) {
    return (
      <SideBar>
        <div className="empty-state">Carregando voucher...</div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <section className="identity-grid">
        <div className="fact">
          <span>Código</span>
          <strong>{voucher.code || "—"}</strong>
        </div>
        <div className="fact">
          <span>Senha</span>
          <strong>{voucher.password || "—"}</strong>
        </div>
        <div className="fact">
          <span>Status</span>
          <strong><StatusPill value={voucher.status} /></strong>
        </div>
        <div className="fact">
          <span>Plano</span>
          <strong>{voucher.plan?.name || voucher.planID || "—"}</strong>
        </div>
        <div className="fact">
          <span>Hotspot</span>
          <strong>{voucher.hotspot?.nome || voucher.hsID || "—"}</strong>
        </div>
        <div className="fact">
          <span>Expira</span>
          <strong>{voucher.expires_at ? new Date(voucher.expires_at).toLocaleString("pt-BR") : "—"}</strong>
        </div>
      </section>

      {error ? <p className="error-message">{error}</p> : null}
      {confirmDelete ? (
        <div className="confirm-reboot">
          <p>Excluir este voucher remove o código do lote.</p>
          <div className="toolbar-actions">
            <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
            <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="page-toolbar">
        <div className="toolbar-actions">
          <button type="button" className="btn" onClick={() => router.push("/vouchers")}>Voltar</button>
          {confirmDelete ? null : (
            <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>Excluir voucher</button>
          )}
        </div>
      </div>
    </SideBar>
  );
};

export default VoucherShowPage;
