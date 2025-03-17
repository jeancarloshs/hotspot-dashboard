"use client";

import { getAllUsers } from "@/actions/get-all-users";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import IProvider from "@/app/interface/IProviders";
import { IUsersConnected } from "@/app/interface/IUsersConnected";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dropdown, IconButton, Popover, Table, Whisper } from "rsuite";
import PlusRoundIcon from "@rsuite/icons/PlusRound";

const UsersPage = () => {
  const router = useRouter();
  const { Column, HeaderCell, Cell } = Table;
  const [users, setUsers] = useState<IUsersConnected[]>([]);
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  let userID: any;

  const renderMenu = (
    { onClose, left, top, className }: any,
    ref: IProvider | any
  ) => {
    const handleSelect = (eventKey: any) => {
      onClose();
      console.log(`eventKey ${eventKey}`);
      switch (eventKey) {
        case 1:
          router.push(`/user/${userID}`);
          break;
        case 2:
          router.push(`/user/hotspots/${userID}`);
          break;
        case 3:
          router.push(`/user/show/${userID}`);
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
    const getUsers = async () => {
      try {
        const _getAllUsers = await getAllUsers();
        if (Array.isArray(_getAllUsers)) {
          setUsers(_getAllUsers);
        } else {
          console.error("Erro: A resposta da API não é um array");
          setUsers([]);
        }
      } catch (error) {
        setError("Erro ao carregar os provedores");
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  const handleInsert = () => {
    router.push("/user/insert");
  };

  return (
    <SideBar>
      <div className="sidebar--container">
        <div className="btn" onClick={handleInsert}>
          <p>Adicionar</p>
        </div>
        <Table
          height={600}
          data={users}
          onRowClick={(rowData: IUsersConnected) => {
            userID = rowData.id;
            // setProviderID(id)
            renderMenu({}, userID);
            console.log("rowData", rowData);
          }}
          renderEmpty={() => (
            <div style={{ padding: 20, textAlign: "center" }}>
              Nenhum Usuário Cadastrado
            </div>
          )}
        >
          <Column width={100} align="center" fixed>
            <HeaderCell>Id</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column width={300}>
            <HeaderCell>Nome</HeaderCell>
            <Cell dataKey="name" />
          </Column>

          <Column width={300}>
            <HeaderCell>E-mail</HeaderCell>
            <Cell dataKey="email" />
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

export default UsersPage;
