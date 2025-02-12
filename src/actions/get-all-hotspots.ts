"use server";

import ProdConfig from "@/app/api/config/prod_config";
import axios from "axios";
import { cookies } from "next/headers";

export async function getAllHotspots() {
  const _environment = new ProdConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  const headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token!.value}`
  };

  const reqOptions = {
    url: `${_environment.API_URL}/hotspots`,
    method: "GET",
    headers: headersList
  };

  try {
    const response = await axios.request(reqOptions);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao obter provedores:", error);
  }
}