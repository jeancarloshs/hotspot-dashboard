"use server";

import ProdConfig from "@/app/api/config/prod_config";
import IProvider from "@/app/interface/IProviders";
import axios from "axios";
import { cookies } from "next/headers";

export async function createProvider(formData: IProvider) {
	const _environment = new ProdConfig();
	const cookieStore = await cookies();
	const token = cookieStore.get("token");

	const bodyContent = JSON.stringify({
		nome: formData.nome ?? null,
		cnpj: formData.cnpj ?? null,
		razao_social: formData.razao_social ?? null,
		endereco: formData.endereco ?? null,
		telefone: formData.telefone ?? null,
		celular: formData.celular ?? null,
		email: formData.email ?? null,
		site: formData.site ?? null,
		numero: formData.numero ?? null,
		complemento: formData.complemento ?? null,
		cidade: formData.cidade ?? null,
		bairro: formData.bairro ?? null,
		cep: formData.cep ?? null,
		estado: formData.estado ?? null,
		status: formData.status ?? null,
	});

	const headersList = {
		Accept: "*/*",
		"Content-Type": "application/json",
		"Authorization": `Bearer ${token!.value}`
	};

	const reqOptions = {
		url: `${_environment.API_URL}/provider/create`,
		method: "POST",
		headers: headersList,
		data: bodyContent,
	};

	try {
		const response = await axios.request(reqOptions);
		console.log("Dados recebidos no formData:", formData);
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
	}
}