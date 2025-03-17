"use client";

import { getAllProviders } from "@/actions/get-all-provideres";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import IProvider from "@/app/interface/IProviders";
import { useEffect, useState } from "react";
// import { Button, ButtonToolbar } from "rsuite";
import AddOutlineIcon from "@rsuite/icons/AddOutline";
import GearIcon from "@rsuite/icons/Gear";
import {
  Table,
  Button,
  Popover,
  Whisper,
  Checkbox,
  Dropdown,
  IconButton,
  Progress,
} from "rsuite";
import MoreIcon from "@rsuite/icons/legacy/More";
import PlusRoundIcon from "@rsuite/icons/PlusRound";
import { mockUsers } from "@/mock";
import { useRouter } from "next/navigation";

const ProvidersPage = () => {
  const router = useRouter();
  const { Column, HeaderCell, Cell } = Table;
  const [providers, setProviders] = useState<IProvider[]>([]);
  // const [providerID, setProviderID] = useState<string | any>(null);
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  let ispID: any;

  const renderMenu = (
    { onClose, left, top, className }: any,
    ref: IProvider | any
  ) => {
    const handleSelect = (eventKey: any) => {
      onClose();
      console.log(`eventKey ${eventKey}`);
      switch (eventKey) {
        case 1:
          router.push(`/provider/home/${ispID}`);
          break;
        case 2:
          router.push(`/provider/hotspot_list/${ispID}`);
          break;
        case 3:
          router.push(`/provider/show/${ispID}`);
          break;
        default:
          console.log("escolha uma opção");
      }
    };

    return (
      <Popover ref={ref} className={className} style={{ left, top }} full>
        <Dropdown.Menu onSelect={handleSelect}>
          <Dropdown.Item eventKey={1}>Home</Dropdown.Item>
          <Dropdown.Item eventKey={2}>Hotspots</Dropdown.Item>
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
    const fetchProviders = async () => {
      try {
        const _getAllProviders = await getAllProviders();
        setProviders(_getAllProviders);
      } catch (error) {
        setError("Erro ao carregar os provedores");
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);
  // console.log(providers);

  // if (loading) return <p>Carregando...</p>;
  // if (error) return <p>{error}</p>;

  // if (!providers || providers.length === 0) {
  //   return <p>Nenhum provedor encontrado.</p>;
  // }

  const handleInsert = () => {
    router.push("/provider/insert");
  };

  return (
    <SideBar>
      <div className="sidebar--container">
        <div className="btn" onClick={handleInsert}>
          <p>Adicionar</p>
        </div>
        <Table
          height={600}
          data={providers}
          onRowClick={(rowData: IProvider) => {
            ispID = rowData.id;
            // setProviderID(id)
            renderMenu({}, ispID);
            console.log("rowData", rowData);
          }}
        >
          <Column width={60} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={200}>
            <HeaderCell>Provedor</HeaderCell>
            <Cell dataKey="nome" />
          </Column>

          <Column width={200}>
            <HeaderCell>Razão Social</HeaderCell>
            <Cell dataKey="razao_social" />
          </Column>

          <Column width={200}>
            <HeaderCell>CNPJ</HeaderCell>
            <Cell dataKey="cnpj" />
          </Column>

          <Column width={200}>
            <HeaderCell>Cidade</HeaderCell>
            <Cell dataKey="cidade" />
          </Column>

          <Column width={200}>
            <HeaderCell>Status</HeaderCell>
            <Cell dataKey="status" className="statusProvider" />
          </Column>

          {/* <Column width={300}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="email" />
        </Column> */}
          {/* <Column width={80} fixed="right">
            <HeaderCell>Opções</HeaderCell>

            <Cell style={{ padding: "6px" }}>
              {(rowData: IProvider) => (
                <Button
                  appearance="link"
                  onClick={() =>
                    router.push(`/provider/home/${rowData.slug}/${rowData.id}`)
                  }
                >
                  Editar
                </Button>
              )}
            </Cell>
          </Column> */}

          <Column width={120} fixed="right">
            <HeaderCell>Opções</HeaderCell>
            <ActionCell dataKey="id" />
          </Column>
        </Table>
      </div>
    </SideBar>
  );
};

export default ProvidersPage;
