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
		nome: formData.nome,
		cnpj: formData.cnpj,
		razao_social: formData.razao_social,
		endereco: formData.endereco,
		numero: formData.numero,
		complemento: formData.complemento,
		cidade: formData.cidade,
		bairro: formData.bairro,
		cep: formData.cep,
		estado: formData.estado,
		status: formData.status,
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
		console.log(response)
		return response.data;
	} catch (error) {
		console.error("Erro ao salvar provedor:", error);
	}
}