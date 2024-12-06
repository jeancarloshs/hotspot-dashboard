"use client";
import React, { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/user-login";
// import { Loader } from "rsuite";

const LoginPage = () => {
  const router = useRouter();
  // const [result, handleLoginUser, isPeding] = useActionState(loginUser, null);
  const [isPeding, setIsPeding] = useState(false);
  const [formLogin, setFormLogin] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {}, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPeding(true)
    const formData = new FormData(event.currentTarget);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setIsPeding(false)
      const result = await loginUser(formData);
      console.log("result", result)
    } catch (error) {
      console.error("Erro ao realizar login", error);
    }
  }

  // const handleOnLogin = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   key: "email" | "password"
  // ) => {
  //   setFormLogin({ ...formLogin, [key]: event.target.value });
  // };

  // const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();

  //   const _loginService = new LoginService();
  //   const { data, error } = await _loginService.login({
  //     userEmail: formLogin.email,
  //     userPassword: formLogin.password,
  //   });

  //   if (error) {
  //     console.error("Erro ao realizar login:", error);
  //   }

  //   if (!error) {
  //     console.log("Login", data);
  //   }
  // };

  return (
    <>
      <div className="container--login">
        <div className="container--login--section">
          <div className="container--header">
            <h1 className="container--h1">Acesse sua Conta</h1>
            <span className="container--span">
              Insira suas credenciais para fazer login
            </span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="container--login_form-group">
              <label htmlFor="username"></label>
              <input
                type="text"
                name="username"
                // value={formLogin.email}
                // onChange={(event) => handleOnLogin(event, "email")}
                className="container--login_input"
                placeholder="Email"
                required
              />
              <label htmlFor="password"></label>
              <input
                type="password"
                name="password"
                // value={formLogin.password}
                // onChange={(event) => handleOnLogin(event, "password")}
                className="container--login_input"
                placeholder="Password"
                required
              />
            </div>
            <button disabled={isPeding} className="btnLogin">
              {isPeding ? "Carregando..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
