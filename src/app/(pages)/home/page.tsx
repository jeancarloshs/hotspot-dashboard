"use client";

import { useEffect, useState } from "react";
import { getProviders } from "@/actions/get-provideres";
import { getAllUsersConnected } from "@/actions/get-all-users-connected";
import IProvider from "@/app/interface/IProviders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { IServer, IUser } from "@/app/interface/IUsersConnected";
import TableC from "@/app/components/_ui/Table/Table";

const HomePage = () => {
    const [providers, setProviders] = useState<IUser[]>([]);  // Inicializando o estado como um array vazio

    useEffect(() => {
        // Função assíncrona dentro do useEffect para obter os dados dos provedores
        const fetchProviders = async () => {
            try {
                const providersData = await getAllUsersConnected();  // Chama a função assíncrona para pegar os dados dos provedores

                // Verifica se o retorno é um array, se não, inicializa providers como array vazio
                if (Array.isArray(providersData)) {
                    setProviders(providersData);  // Atualiza o estado com os dados dos provedores
                } else {
                    console.error("Erro: A resposta da API não é um array");
                    setProviders([]);  // Se não for array, define providers como array vazio
                }
            } catch (error) {
                console.error("Erro ao carregar provedores:", error);
                setProviders([]);  // Define providers como array vazio em caso de erro
            }
        };

        fetchProviders();  // Chama a função para buscar os provedores
    }, []);  // O array vazio significa que isso só vai rodar uma vez, quando o componente for montado
    console.log(providers)
    return (
        <SideBar>
            <TableC dataProps={providers} />
            {/* <div>
                <h1>Home Page</h1>
                <ul>
                    {providers.length > 0 ? (
                        providers.map((provider: IServer, index: number) => (
                            <li key={provider.id}>{provider.user![0]!.nome_completo} - {provider.user![0]!.hotspot!.nome} - {provider.address}</li>  // Exibe o nome de cada provedor
                        ))
                    ) : (
                        <p>Carregando provedores...</p>  // Exibe mensagem enquanto os dados estão sendo carregados
                    )}
                </ul>
            </div> */}
        </SideBar>
        // <div className="content--container">
        //     <div className="sideBar">

        //     </div>
        // </div>
        // <div>
        //     <h1>Home Page</h1>
        //     <ul>
        //         {providers.length > 0 ? (
        //             providers.map((provider: IProvider, index: number) => (
        //                 <li key={provider.id}>{provider.nome}</li>  // Exibe o nome de cada provedor
        //             ))
        //         ) : (
        //             <p>Carregando provedores...</p>  // Exibe mensagem enquanto os dados estão sendo carregados
        //         )}
        //     </ul>
        // </div>
    );
};

export default HomePage;
