"use client";

import { useEffect, useState } from "react";
import { getAllProviders } from "@/actions/get-all-provideres";
import { getAllUsersConnected } from "@/actions/get-all-users-connected";
import IProvider from "@/app/interface/IProviders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { IServer, IUser } from "@/app/interface/IUsersConnected";
import TableC from "@/app/components/_ui/Table/Table";
import { Stat, StatGroup } from "rsuite";
import PeoplesIcon from "@rsuite/icons/Peoples";
import FunnelStepsIcon from "@rsuite/icons/FunnelSteps";
import { LineChart } from "@mui/x-charts";
import { getAllUsers } from "@/actions/get-all-users";
import { getAllHotspots } from "@/actions/get-all-hotspots";

const HomePage = () => {
  const [allUsersConnected, setAllUsersConnected] = useState<IUser[]>([]); // Inicializando o estado como um array vazio
  const [allUseres, setAllUsers] = useState<IUser[]>([])
  const [allProviders, setAllProviders] = useState<IProvider[]>([]);
  const [allHotspots, setAllHotspots] = useState<any>([]);

  useEffect(() => {
    // Função assíncrona dentro do useEffect para obter os dados dos provedores
    const fetchProviders = async () => {
      try {
        const _getAllUsersConnected = await getAllUsersConnected(); // Chama a função assíncrona para pegar os dados dos provedores
        const _getAllUsers = await getAllUsers();
        const _getAllProviders = await getAllProviders();
        const _getAllHotspots = await getAllHotspots();
        setAllUsers(_getAllUsers)
        setAllProviders(_getAllProviders)
        setAllHotspots(_getAllHotspots);

        // Verifica se o retorno é um array, se não, inicializa providers como array vazio
        if (Array.isArray(_getAllUsersConnected)) {
          setAllUsersConnected(_getAllUsersConnected); // Atualiza o estado com os dados dos provedores
        } else {
          console.error("Erro: A resposta da API não é um array");
          setAllUsersConnected([]); // Se não for array, define providers como array vazio
        }
      } catch (error) {
        console.error("Erro ao carregar provedores:", error);
        setAllUsersConnected([]); // Define providers como array vazio em caso de erro
      }
    };

    fetchProviders(); // Chama a função para buscar os provedores
  }, []); // O array vazio significa que isso só vai rodar uma vez, quando o componente for montado
  console.log(allUsersConnected);
  return (
    <SideBar>
      <div className="sidebar--container">
        <StatGroup spacing={20} columns={4}>
          <Stat
            bordered
            icon={<PeoplesIcon color="#2589F5" style={{ fontSize: 30 }} />}
          >
            <Stat.Value>{allUseres.length}</Stat.Value>
            <Stat.Label>Total de Clientes</Stat.Label>
          </Stat>

          <Stat
            bordered
            icon={<PeoplesIcon color="#2589F5" style={{ fontSize: 30 }} />}
          >
            <Stat.Value>{allUsersConnected.length}</Stat.Value>
            <Stat.Label>Clientes Online</Stat.Label>
          </Stat>

          <Stat
            bordered
            icon={<PeoplesIcon color="#2589F5" style={{ fontSize: 30 }} />}
          >
            <Stat.Value>{allProviders.length}</Stat.Value>
            <Stat.Label>Total de Provedores</Stat.Label>
          </Stat>

          <Stat
            bordered
            icon={<PeoplesIcon color="#2589F5" style={{ fontSize: 30 }} />}
          >
            <Stat.Value>{allHotspots.length}</Stat.Value>
            <Stat.Label>Total de Hotspots</Stat.Label>
          </Stat>
        </StatGroup>

        <div className="container--line-chart">
          <LineChart
            className="line-chart"
            xAxis={[{ data: [1, 2, 3, 5, 8, 10, 11, 12] }]}
            series={[
              {
                data: [2, 5.5, 2, 8.5, 1.5, 5, 10, 11],
                area: true,
              },
            ]}
            width={500}
            height={300}
          />

          <LineChart
            className="line-chart"
            xAxis={[{ data: [1, 2, 3, 5, 8, 10, 11, 12] }]}
            series={[
              {
                data: [2, 5.5, 2, 8.5, 1.5, 5, 10, 11],
                area: true,
              },
            ]}
            width={500}
            height={300}
          />
        </div>

        <TableC dataProps={allUsersConnected} />
      </div>
    </SideBar>
  );
};

export default HomePage;
