"use client";

import React, { useEffect, useState } from "react";
import { getAllHotspots } from "@/actions/get-all-hotspots";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { IHotspot } from "@/app/interface/IUsersConnected";
import { useRouter } from "next/navigation";
import {
  Button,
  Dropdown,
  Form,
  IconButton,
  Loader,
  Popover,
  Table,
  Whisper,
} from "rsuite";
import PlusRoundIcon from "@rsuite/icons/PlusRound";
import IProvider from "@/app/interface/IProviders";

const HotspotsPage = ({ params }: any) => {
  const router = useRouter();
  const [allHotSpots, setAllHotspots] = useState<IHotspot[]>([]);
  const { Column, HeaderCell, Cell } = Table;
  // const [users, setUsers] = useState<IUsersConnected[]>([]);
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  const resolvedParams = React.use<any>(params);
  const slug = resolvedParams.slug[0];
  //   const slugID = resolvedParams.slug[1];

  const renderMenu = (
    { onClose, left, top, className }: any,
    ref: IProvider | any
  ) => {
    const handleSelect = (eventKey: any) => {
      onClose();
      console.log(`eventKey ${eventKey}`);
      switch (eventKey) {
        case 1:
          router.push(`/user/${slug}`);
          break;
        case 2:
          router.push(`/user/hotspots/${slug}`);
          break;
        case 3:
          router.push(`/user/show/${slug}`);
          break;
        default:
          console.log("escolha uma opção");
      }
    };

    return (
      <Popover ref={ref} className={className} style={{ left, top }} full>
        <Dropdown.Menu onSelect={handleSelect}>
          <Dropdown.Item eventKey={1}>Home</Dropdown.Item>
          <Dropdown.Item eventKey={2}>Configurações</Dropdown.Item>
          <Dropdown.Item eventKey={3}>Editar</Dropdown.Item>
        </Dropdown.Menu>
      </Popover>
    );
  };

  const ActionCell = ({ rowData, dataKey, ...props }: any) => {
    return (
      <Cell {...props} className="link-group" style={{ padding: "6px" }}>
        <Whisper
          placement="autoVerticalStart"
          trigger="click"
          speaker={renderMenu}
        >
          <IconButton appearance="subtle" icon={<PlusRoundIcon />} />
        </Whisper>
      </Cell>
    );
  };

  useEffect(() => {
    const fetchHotspots = async () => {
      const _getAllHotspots = await getAllHotspots(slug);
      try {
        setAllHotspots(_getAllHotspots);
      } catch (error) {
        setError("Erro ao carregar os hotspots");
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);

  console.log(allHotSpots);

  const handlePageBack = () => {
    router.push("/providers");
  };

  const handleInsert = (id: any): any => {
    console.log("id", id);
    // router.push("/providers");
  };

  return (
    <SideBar>
      <div className="sidebar--container">
        <div className="btn-container">
          <div className="btn" onClick={handlePageBack}>
            <p>Voltar</p>
          </div>
          <div className="btn" onClick={() => handleInsert(slug)}>
            <p>Adicionar</p>
          </div>
        </div>

        <Table
          height={600}
          data={allHotSpots}
          // onRowClick={(rowData: IUsersConnected) => {
          //   userID = rowData.id;
          //   // setProviderID(id)
          //   renderMenu({}, userID);
          //   console.log("rowData", rowData);
          // }}
          renderEmpty={() => (
            <div style={{ padding: 20, textAlign: "center" }}>
              Nenhum Hotspot Cadastrado
            </div>
          )}
        >
          <Column width={100} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={200}>
            <HeaderCell>Nome Hotspot</HeaderCell>
            <Cell dataKey="nome" />
          </Column>

          <Column width={200}>
            <HeaderCell>Provedor</HeaderCell>
            <Cell dataKey="isp.nome" />
          </Column>

          <Column width={200}>
            <HeaderCell>IP</HeaderCell>
            <Cell dataKey="ip" />
          </Column>

          <Column width={200}>
            <HeaderCell>Status</HeaderCell>
            <Cell dataKey="status" className="statusProvider" />
          </Column>

          <Column width={120} fixed="right">
            <HeaderCell>Opções</HeaderCell>
            <ActionCell dataKey="id" />
          </Column>
        </Table>
      </div>
    </SideBar>
  );
};

export default HotspotsPage;
