"use server";

import ProdConfig from "@/app/api/config/prod_config";
import IProvider from "@/app/interface/IProviders";
import axios from "axios";
import { cookies } from "next/headers";

export async function updateProvider(id: string | number, formData: IProvider) {
    const _environment = new ProdConfig();
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const headersList = {
        Accept: "*/*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token!.value}`
    };

    const reqOptions = {
        url: `${_environment.API_URL}/provider/${id}/update`,
        method: "PUT",
        headers: headersList,
        data: formData
    };

    try {
        const response = await axios.request(reqOptions);
        return {
            response: response.data,
            status: response.status
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                status: error.response?.status || 500,
                data: error.response?.data || "Erro ao salvar provedor",
            };
        }
        return {
            status: 500,
            data: "Erro desconhecido ao salvar provedor",
        };
    };
}