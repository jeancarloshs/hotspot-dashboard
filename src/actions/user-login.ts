"use server";

import axios from "axios";
import ProdConfig from "@/app/api/config/prod_config";
import { cookies } from 'next/headers';

export async function loginUser(data: FormData | null): Promise<any> {
  const _environment = new ProdConfig();
  const cookieStore = await cookies();
  // console.log(data)

  if (!data) {
    throw new Error("Os dados enviados são inválidos.");
  }

  const email = data.get("username");
  const password = data.get("password");

  if (!email || !password) {
    throw new Error("Email ou senha não foram fornecidos.");
  }

  const bodyContent = JSON.stringify({
    email: email,
    password: password,
  });

  const headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  const reqOptions = {
    url: `${_environment.API_URL}/login`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };


  try {
    const response = await axios.request(reqOptions);

    if (response.status === 200) {
      cookieStore.set("token", response.data.objAuth.token, {
        httpOnly: true, // Não acessível via JavaScript (protege contra XSS)
        secure: process.env.NEXT_PUBLIC_DEBUG === "production", // Garante que o cookie seja seguro apenas em produção
        maxAge: 24 * 60 * 60, // 1 dia de expiração
        sameSite: "strict", // Protege contra ataques CSRF
        path: '/',  // Torna o cookie acessível globalmente no domínio
      });
    }

    return {
      data: response.data,
      status: response.status
    }
  } catch (error: any) {
    if (error.response.status === 401) {
      throw new Error("Usuário ou senha inválidos.");
    }
  }
}
