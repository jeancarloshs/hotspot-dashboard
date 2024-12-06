"use server";

import axios from "axios";
import ProdConfig from "@/app/api/config/prod_config";

export async function loginUser(data: FormData | null): Promise<any> {
  const environment = new ProdConfig();

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

  const response = await axios.request(reqOptions);
  return response.data;
}
