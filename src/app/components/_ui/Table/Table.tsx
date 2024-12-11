import React, { useState } from 'react';
import { Table, IconButton } from 'rsuite';
import CollaspedOutlineIcon from '@rsuite/icons/CollaspedOutline';
import ExpandOutlineIcon from '@rsuite/icons/ExpandOutline';
import { IServer, IServerMK, IUser } from '@/app/interface/IUsersConnected';

// Definindo a interface para os dados dos usuários
// interface IUser {
//   id: number;
//   avatar: string;
//   firstName: string;
//   lastName: string;
//   gender: string;
//   age: number;
//   city: string;
//   email: string;
//   phone: string;
// }

interface ITableCProps {
  dataProps: IUser[];
}

// Exemplo de mock de dados
const mockUsers = (arrayProps: any): any => {
  return arrayProps.map((item: IServerMK) => ({
    id: item.user![0].id,
    nome_completo: item.user![0].nome_completo,
    email: item.user![0].email,
    telefone: item.user![0].telefone,
    cpf: item.user![0].cpf,
    address: item.server!.address!,
    mac_address: item.server!.mac_address!,
    uptime: item.server!.uptime!,
    hotspot: item.server!.hotspot?.nome
  }));
};

const { Column, HeaderCell, Cell } = Table;
// const data = mockUsers();
const rowKey = 'id';

// Tipagem das props para o componente ExpandCell
interface IExpandCellProps {
  rowData: IUser;
  expandedRowKeys: number[];
  onChange: (rowData: IUser) => void;
  [key: string]: any; // Para aceitar outras props do componente Cell
}

// Componente para a célula de expandir
const ExpandCell: React.FC<IExpandCellProps> = ({ rowData, expandedRowKeys, onChange, ...props }) => (
  <Cell {...props} style={{ padding: 5 }}>
    <IconButton
      appearance="subtle"
      onClick={() => onChange(rowData)} // Passa a linha para a função onChange
      icon={
        expandedRowKeys.includes(rowData[rowKey]) ? (
          <CollaspedOutlineIcon />
        ) : (
          <ExpandOutlineIcon />
        )
      }
    />
  </Cell>
);

// Função para renderizar a linha expandida
const renderRowExpanded = (rowData?: IUser) => (
  <div>
    <div
      style={{
        width: 60,
        height: 60,
        float: 'left',
        marginRight: 10,
        background: '#eee'
      }}
    >
      {/* <img src={rowData.avatar} style={{ width: 60 }} alt="Avatar" /> */}
    </div>
    <p>Nome: {rowData!.nome_completo}</p>
    <p>Email: {rowData!.email}</p>
    <p>Phone: {rowData!.telefone}</p>
  </div>
);

const TableC = ({ dataProps }: ITableCProps) => {
  // Tipagem do estado expandedRowKeys como array de números (chaves das linhas)
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  // Função para gerenciar a expansão das linhas
  const handleExpanded = (rowData: IUser | any) => {
    const nextExpandedRowKeys = expandedRowKeys.includes(rowData[rowKey])
      ? expandedRowKeys.filter((key) => key !== rowData[rowKey])
      : [...expandedRowKeys, rowData[rowKey]];

    setExpandedRowKeys(nextExpandedRowKeys);
  };

  return (
    <Table
      shouldUpdateScroll={false}
      height={300}
      data={mockUsers(dataProps)}
      rowKey={rowKey}
      expandedRowKeys={expandedRowKeys}
      onRowClick={(data) => {
        console.log(data);
      }}
      renderRowExpanded={renderRowExpanded}
    >
      <Column width={70} align="center">
        <HeaderCell>#</HeaderCell>
        <ExpandCell dataKey="id" expandedRowKeys={expandedRowKeys} onChange={handleExpanded} rowData={{} as IUser} />
      </Column>

      <Column width={150}>
        <HeaderCell>Nome Completo</HeaderCell>
        <Cell dataKey="nome_completo" />
      </Column>

      <Column width={130}>
        <HeaderCell>CPF</HeaderCell>
        <Cell dataKey="cpf" />
      </Column>

      <Column width={100}>
        <HeaderCell>IP</HeaderCell>
        <Cell dataKey="address" />
      </Column>

      <Column width={200}>
        <HeaderCell>MAC</HeaderCell>
        <Cell dataKey="mac_address" />
      </Column>

      <Column width={200}>
        <HeaderCell>Uptime</HeaderCell>
        <Cell dataKey="uptime" />
      </Column>

      <Column width={200}>
        <HeaderCell>Hotspot</HeaderCell>
        <Cell dataKey="hotspot" />
      </Column>
    </Table>
  );
};

export default TableC;
