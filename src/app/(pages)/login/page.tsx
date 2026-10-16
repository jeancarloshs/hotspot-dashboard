"use client";

import { loginUser } from "@/actions/user-login";
import { Roles } from "@/app/interface/IStatusList";
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
      const auth = response?.data?.objAuth;
      if (auth?.permission === Roles.SUPER_ADMIN) {
        router.push("/home");
        return;
      }
      setError(auth?.token ? "Esta conta não tem permissão para o painel." : "E-mail ou senha inválidos.");
      setIsPending(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setError(message.includes("401") ? "E-mail ou senha inválidos." : "Não foi possível entrar agora.");
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
            <li>Provedores e hotspots</li>
            <li>Clientes conectados</li>
            <li>Usuários do sistema</li>
          </ul>
        </div>
      </section>

      <section className="login-form-wrap">
        <form className="login-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Acesso</p>
          <h2>Entre na sua conta</h2>
          <p className="page-lead">Use o e-mail e a senha do usuário do sistema.</p>

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
