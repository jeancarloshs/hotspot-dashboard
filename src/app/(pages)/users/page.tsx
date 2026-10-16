"use client";

import { getAllUsers } from "@/actions/get-all-users";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { permissionLabel } from "@/app/lib/user-options";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SystemUser = {
  id?: number;
  name?: string;
  email?: string;
  status?: string;
  permission?: string;
};

const UsersPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllUsers();
      setUsers(asList<SystemUser>(response));
    };
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) =>
      [user.name, user.email, user.permission, permissionLabel(user.permission), user.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [users, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Contas com acesso ao painel. O login usa e-mail e senha.</p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar usuário"
            aria-label="Buscar usuário"
          />
          <button type="button" className="btn btn--solid" onClick={() => router.push("/user/insert")}>
            Novo usuário
          </button>
        </div>
      </div>

      <ResourceTable
        rows={visible}
        empty={users.length === 0 ? "Nenhum usuário cadastrado." : "Nenhum usuário encontrado para essa busca."}
        rowKey={(row, index) => row.id ?? index}
        columns={[
          {
            key: "name",
            header: "Nome",
            render: (row) => (
              <>
                <span className="cell-title">{row.name || "—"}</span>
                <span className="cell-sub">{row.email || ""}</span>
              </>
            ),
          },
          { key: "permission", header: "Permissão", render: (row) => permissionLabel(row.permission) },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                <Link href={`/user/show/${row.id}`}>Editar</Link>
              </div>
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default UsersPage;
