"use client";
import React, { useActionState, useEffect, useState } from "react";
// import { cookies } from 'next/headers';
// import { NextResponse } from 'next/server';
import { useRouter } from "next/navigation";
import { loginUser } from "@/actions/user-login";
import EyeRoundIcon from "@rsuite/icons/EyeRound";
import EyeCloseIcon from "@rsuite/icons/EyeClose";
import { RolePermissions, Roles } from "@/app/interface/IStatusList";
// import { Loader } from "rsuite";

const LoginPage = () => {
  const router = useRouter();

  // const response = NextResponse.next();
  // const [result, handleLoginUser, isPeding] = useActionState(loginUser, null);
  const [isPeding, setIsPeding] = useState(false);
  const [formLogin, setFormLogin] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(true);

  useEffect(() => {}, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPeding(true);
    const formData = new FormData(event.currentTarget);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await loginUser(formData);

      if (response!.data!.objAuth!.permission === Roles.SUPER_ADMIN) {
        router.push("./home");
      }
    } catch (error: any) {
      if (error.message.match("401")) {
        setIsPeding(false);
        return alert("Usuário ou senha inválidos");
      }
      setIsPeding(false);
      console.error("Erro ao realizar login", error);
      alert(`Erro ao realizar login\n ${error}`);
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
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
              <div className="input-password-wrapper">
                <label htmlFor="password"></label>
                <input
                  type={showPassword == true ? "password" : "text"}
                  name="password"
                  // value={formLogin.password}
                  // onChange={(event) => handleOnLogin(event, "password")}
                  className="container--login_input password"
                  placeholder="Password"
                  required
                />
                {showPassword == true ? (
                  <EyeCloseIcon
                    color="white"
                    className="password--icon"
                    onClick={() => handleShowPassword()}
                  />
                ) : (
                  <EyeRoundIcon
                    color="white"
                    className="password--icon"
                    onClick={() => handleShowPassword()}
                  />
                )}
              </div>
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
