"use client";

import { useEffect, useState } from "react";
import { getAllProviders } from "@/actions/get-all-provideres";
import { getAllClientsConnected } from "@/actions/get-all-clients-connected";
import IProvider from "@/app/interface/IProviders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { IServer, IUsersConnected } from "@/app/interface/IUsersConnected";
import TableC from "@/app/components/_ui/Table/Table";
import { Stat, StatGroup } from "rsuite";
import PeoplesIcon from "@rsuite/icons/Peoples";
import FunnelStepsIcon from "@rsuite/icons/FunnelSteps";
import { LineChart } from "@mui/x-charts";
import { getAllClients } from "@/actions/get-all-clients";
import { getAllHotspots } from "@/actions/get-all-hotspots";

const HomePage = () => {
  const [allClientsConnected, setAllClientsConnected] = useState<
    IUsersConnected[]
  >([]);
  const [allClients, setAllClients] = useState<IUsersConnected[]>([]);
  const [allProviders, setAllProviders] = useState<IProvider[]>([]);
  const [allHotspots, setAllHotspots] = useState<any>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const _getAllClientsConnected = await getAllClientsConnected();
        const _getAllClients = await getAllClients();
        const _getAllProviders = await getAllProviders();
        const _getAllHotspots = await getAllHotspots();
        setAllClients(_getAllClients);
        setAllProviders(_getAllProviders);
        setAllHotspots(_getAllHotspots);

        // Verifica se o retorno é um array, se não, inicializa providers como array vazio
        if (Array.isArray(_getAllClientsConnected)) {
          setAllClientsConnected(_getAllClientsConnected);
        } else {
          console.error("Erro: A resposta da API não é um array");
          setAllClientsConnected([]);
        }
      } catch (error) {
        console.error("Erro ao carregar provedores:", error);
        setAllClientsConnected([]);
      }
    };

    fetchProviders();
  }, []);

  return (
    <SideBar>
      <div className="sidebar--container">
        <StatGroup spacing={20} columns={4}>
          <Stat
            bordered
            icon={<PeoplesIcon color="#2589F5" style={{ fontSize: 30 }} />}
          >
            <Stat.Value>{allClients.length}</Stat.Value>
            <Stat.Label>Total de Clientes</Stat.Label>
          </Stat>

          <Stat
            bordered
            icon={<PeoplesIcon color="#2589F5" style={{ fontSize: 30 }} />}
          >
            <Stat.Value>{allClientsConnected.length}</Stat.Value>
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

        <TableC dataProps={allClientsConnected} />
      </div>
    </SideBar>
  );
};

export default HomePage;
