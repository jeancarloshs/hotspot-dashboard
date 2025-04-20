"use userver";

import axios from "axios";

export async function getCep(cep: number | string ) {
    const headersList = {
        Accept: "*/*",
        "Content-Type": "application/json"
    }

    const reqOptions = {
        url: `https://viacep.com.br/ws/${cep}/json/`,
        method: "GET",
        headers: headersList
    }

    try {
        const response = await axios.request(reqOptions);
        // console.log(response);
        return response.data;
    } catch (error) {
        console.error("Erro ao obter CEP:", error);
    }
}