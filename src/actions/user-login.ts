"use server";

import axios from "axios";
import ProdConfig from "@/app/api/config/prod_config";
import { cookies } from 'next/headers';

export async function loginUser(data: FormData | null): Promise<any> {
  const environment = new ProdConfig();
  const cookieStore = await cookies();
  console.log(data)
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
    url: `${environment.API_URL}/login`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };


  try {
    const response = await axios.request(reqOptions);
    // console.log(response.data)

    if (response.status === 200) {
      cookieStore.set("token", response.data.objAuth.token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60,
      });
    }

    return response.data;
  } catch (error: any) {
    if (error.response.status === 401) {
      throw new Error("Usuário ou senha inválidos.");
    }
  }
}
