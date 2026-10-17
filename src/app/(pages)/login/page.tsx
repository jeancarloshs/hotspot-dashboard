"use client";

import { loginUser } from "@/actions/user-login";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LoginPage = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await loginUser(formData);
      if (response?.error || response.status >= 400) {
        setError(String(response.error || "E-mail ou senha inválidos."));
        setIsPending(false);
        return;
      }
      router.push("/home");
    } catch {
      setError("Não foi possível entrar agora.");
      setIsPending(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-story">
        <div>
          <p className="eyebrow">Painel de operação</p>
          <h1>Hotspot</h1>
          <p>Provedores, pontos de acesso e sessões MikroTik no mesmo lugar.</p>
          <ul className="login-points">
            <li>Acesso a partir de suporte</li>
            <li>Menu conforme o nível</li>
            <li>ISP isolado (exceto super admin)</li>
          </ul>
        </div>
      </section>

      <section className="login-form-wrap">
        <form className="login-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Acesso</p>
          <h2>Entre na sua conta</h2>
          <p className="page-lead">
            Use o e-mail do usuário do sistema. Níveis: suporte, moderador, gerente, administrador e super admin.
          </p>

          <div className="login-field">
            <label htmlFor="username">E-mail</label>
            <input id="username" name="username" type="email" autoComplete="username" required />
          </div>

          <div className="login-field">
            <label htmlFor="password">Senha</label>
            <div className="password-row">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {error ? <p className="login-error">{error}</p> : null}

          <button className="btnLogin" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
