"use client";

import { userLogout } from "@/actions/user-logout";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  MdOutlineDashboard,
  MdOutlineRouter,
  MdOutlineStorefront,
  MdPeopleOutline,
  MdAdminPanelSettings,
  MdOutlineDevices,
  MdOutlineConfirmationNumber,
  MdOutlineSell,
  MdOutlinePayments,
  MdOutlineReceiptLong,
} from "react-icons/md";
import { TbLogout2, TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";

interface SideBarProps {
  children?: React.ReactNode;
}

const NAV = [
  { href: "/home", label: "Visão geral", icon: MdOutlineDashboard },
  { href: "/providers", label: "Provedores", icon: MdOutlineStorefront },
  { href: "/hotspots", label: "Hotspots", icon: MdOutlineRouter },
  { href: "/plans", label: "Planos", icon: MdOutlineSell },
  { href: "/vouchers", label: "Vouchers", icon: MdOutlineConfirmationNumber },
  { href: "/payment-gateways", label: "Pagamentos", icon: MdOutlinePayments },
  { href: "/orders", label: "Pedidos", icon: MdOutlineReceiptLong },
  { href: "/clients", label: "Clientes", icon: MdPeopleOutline },
  { href: "/device/insert", label: "Dispositivos", icon: MdOutlineDevices },
  { href: "/users", label: "Usuários", icon: MdAdminPanelSettings },
];

function chromeFor(pathname: string) {
  const rules = [
    { test: "/provider/hotspot/insert", eyebrow: "Hotspots", title: "Novo hotspot", blurb: "Cadastro de um ponto de acesso ligado a um provedor." },
    { test: "/provider/hotspot/cadastro", eyebrow: "Hotspots", title: "Cadastro do hotspot", blurb: "Atualização e exclusão do ponto de acesso." },
    { test: "/provider/hotspot/edit", eyebrow: "Hotspots", title: "Editar MikroTik", blurb: "Configuração do MikroTik selecionado: hotspot, rede, firewall e VPN." },
    { test: "/provider/hotspot/show", eyebrow: "Hotspots", title: "Hotspot", blurb: "Consulta e gerenciamento do MikroTik deste ponto." },
    { test: "/plan/insert", eyebrow: "Planos", title: "Novo plano", blurb: "Limites, preço e sync do perfil no MikroTik." },
    { test: "/plan/show", eyebrow: "Planos", title: "Editar plano", blurb: "Atualização e exclusão do plano de acesso." },
    { test: "/plans", eyebrow: "Acesso", title: "Planos", blurb: "Planos usados em vouchers e perfis do hotspot." },
    { test: "/voucher/generate", eyebrow: "Vouchers", title: "Gerar lote", blurb: "Cria códigos a partir de um plano." },
    { test: "/voucher/redeem", eyebrow: "Vouchers", title: "Resgatar voucher", blurb: "Valida um código em um hotspot." },
    { test: "/voucher/show", eyebrow: "Vouchers", title: "Voucher", blurb: "Detalhes e exclusão do código." },
    { test: "/vouchers", eyebrow: "Acesso", title: "Vouchers", blurb: "Lotes de acesso gerados para os hotspots." },
    { test: "/payment-gateway/insert", eyebrow: "Pagamentos", title: "Novo gateway", blurb: "Credenciais e webhook do provedor de pagamento." },
    { test: "/payment-gateway/show", eyebrow: "Pagamentos", title: "Editar gateway", blurb: "Atualização e exclusão do gateway." },
    { test: "/payment-gateways", eyebrow: "Acesso", title: "Pagamentos", blurb: "Gateways usados na cobrança de planos e vouchers." },
    { test: "/order/checkout", eyebrow: "Pedidos", title: "Checkout", blurb: "Cria um pedido pendente com plano e gateway." },
    { test: "/order/status", eyebrow: "Pedidos", title: "Consultar pedido", blurb: "Status público pelo número do pedido." },
    { test: "/order/show", eyebrow: "Pedidos", title: "Pedido", blurb: "Detalhes, voucher e simulação sandbox." },
    { test: "/orders", eyebrow: "Acesso", title: "Pedidos", blurb: "Pedidos de pagamento e emissão de vouchers." },
    { test: "/provider/hotspots", eyebrow: "Provedores", title: "Hotspots do provedor", blurb: "Pontos de acesso vinculados a este provedor." },
    { test: "/provider/insert", eyebrow: "Provedores", title: "Novo provedor", blurb: "Nome, documento e endereço do provedor." },
    { test: "/provider/show", eyebrow: "Provedores", title: "Editar provedor", blurb: "Atualize o cadastro do provedor." },
    { test: "/provider/home", eyebrow: "Provedores", title: "Painel do provedor", blurb: "Resumo operacional deste provedor." },
    { test: "/providers", eyebrow: "Cadastro", title: "Provedores", blurb: "Empresas que operam os hotspots." },
    { test: "/hotspots", eyebrow: "Rede", title: "Hotspots", blurb: "Pontos de acesso MikroTik cadastrados." },
    { test: "/clients/connected", eyebrow: "Acesso", title: "Sessões", blurb: "Clientes conectados neste momento." },
    { test: "/clients", eyebrow: "Acesso", title: "Clientes", blurb: "Pessoas cadastradas para entrar no hotspot." },
    { test: "/client/insert", eyebrow: "Acesso", title: "Novo cliente", blurb: "Cadastro de acesso a um hotspot." },
    { test: "/client/login", eyebrow: "Acesso", title: "Login do cliente", blurb: "Autentica um cliente já cadastrado em um hotspot." },
    { test: "/client/show", eyebrow: "Acesso", title: "Cliente", blurb: "Atualização e exclusão do cadastro de acesso." },
    { test: "/device/insert", eyebrow: "Acesso", title: "Dispositivo", blurb: "Registro do aparelho a partir do CPF do cliente." },
    { test: "/user/insert", eyebrow: "Equipe", title: "Novo usuário", blurb: "Usuário com acesso a este painel." },
    { test: "/user/show", eyebrow: "Equipe", title: "Editar usuário", blurb: "Nome, permissão, status e provedor desta conta." },
    { test: "/users", eyebrow: "Equipe", title: "Usuários", blurb: "Quem administra o painel." },
    { test: "/home", eyebrow: "Operação", title: "Visão geral", blurb: "Provedores, hotspots e sessões ativas." },
  ];

  return (
    rules.find((rule) => pathname === rule.test || pathname.startsWith(`${rule.test}/`)) ?? {
      eyebrow: "Hotspot",
      title: "Painel",
      blurb: "Gestão de hotspots MikroTik.",
    }
  );
}

function isActive(href: string, pathname: string) {
  if (pathname.startsWith("/device")) return href === "/device/insert";
  if (pathname.includes("/hotspot")) return href === "/hotspots";
  if (href === "/providers") return pathname.startsWith("/provider") && !pathname.includes("/hotspot");
  if (href === "/plans") return pathname.startsWith("/plan");
  if (href === "/vouchers") return pathname.startsWith("/voucher");
  if (href === "/payment-gateways") return pathname.startsWith("/payment-gateway");
  if (href === "/orders") return pathname.startsWith("/order");
  if (href === "/clients") return pathname.startsWith("/client");
  if (href === "/users") return pathname.startsWith("/user");
  return pathname === href || pathname.startsWith(`${href}/`);
}

const SideBar = ({ children }: SideBarProps) => {
  const [expand, setExpand] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const chrome = chromeFor(pathname);
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleLogout = async () => {
    await userLogout();
    router.push("/");
  };

  return (
    <div className="app-frame" style={{ ["--nav" as string]: expand ? "248px" : "76px" }}>
      <aside className={expand ? "app-nav" : "app-nav is-collapsed"}>
        <div className="app-brand">
          <span className="app-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" fill="currentColor" />
              <path d="M5.2 10.4a5.2 5.2 0 0 1 7.6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M2.8 8a8.2 8.2 0 0 1 12.4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <div className="app-brand-copy">
            <strong>HOTSPOT</strong>
            <span>Operação</span>
          </div>
        </div>

        <p className="nav-section">Menu</p>
        <nav className="app-menu" aria-label="Principal">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "app-link is-active" : "app-link"}
                aria-current={active ? "page" : undefined}
                title={item.label}
              >
                <Icon size={18} />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="app-nav-foot">
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => setExpand((open) => !open)}
            aria-label={expand ? "Recolher menu" : "Expandir menu"}
          >
            {expand ? <TbLayoutSidebarLeftCollapse size={18} /> : <TbLayoutSidebarLeftExpand size={18} />}
          </button>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <TbLogout2 size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="eyebrow">{chrome.eyebrow}</p>
            <h1>{chrome.title}</h1>
            <p>{chrome.blurb}</p>
          </div>
          <p className="topbar-date" suppressHydrationWarning>
            {today}
          </p>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
};

export default SideBar;
