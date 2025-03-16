"use server";

import axios from "axios";

export async function getCNPJ(cnpj: number | string) {
    const headersList = {
        Accept: "*/*",
        "Content-Type": "application/json"
    }

    const reqOptions = {
        url: `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
        method: "GET",
        headers: headersList
    }

    try {
        const response = await axios.request(reqOptions);
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error("Erro ao obter CNPJ:", error);
    }
}