"use client";

import { createProvider } from "@/actions/create-provider";
import { getCep } from "@/actions/get-cep";
import { getCNPJ } from "@/actions/get-cnpj";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Dropdown, Form, Loader } from "rsuite";

const InsertProviderPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<IProvider>({
    nome: "",
    cnpj: "",
    razao_social: "",
    endereco: "",
    telefone: "",
    celular: "",
    email: "",
    site: "",
    numero: "",
    complemento: "",
    cidade: "",
    bairro: "",
    cep: "",
    estado: "",
    status: "",
  });

  const handleChange = (value: string, key: string) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleCepBlur = async (event: React.FocusEvent<HTMLElement>) => {
    const target = event.target as HTMLInputElement; // Faz o cast para HTMLInputElement
    const cep = target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      const response = await getCep(cep);
      if (response) {
        setFormData((prevState) => ({
          ...prevState,
          endereco: response.logradouro,
          bairro: response.bairro,
          cidade: response.localidade,
          estado: response.uf,
        }));
      }
    }
  };

  const handleCNPJBlur = async (event: React.FocusEvent<HTMLElement>) => {
    const target = event.target as HTMLInputElement;
    const cnpj = target.value.replace(/[.\-/]/g, "");
    if (cnpj.length === 14) {
      const response = await getCNPJ(cnpj);
      if (response) {
        setFormData({
          ...formData,
          nome: response.nome_fantasia,
          razao_social: response.razao_social,
          telefone: response.ddd_telefone_1,
        });
      }
    }
  };

  const formatCNPJ = (cnpj: any) => {
    return cnpj
      .replace(/[^\d]/g, "") // Remove qualquer caractere não numérico
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5"); // Adiciona a formatação
  };

  const formatCEP = (cep: any) => {
    return cep
      .replace(/[^\d]/g, "")
      .replace(/^(\d{2})(\d{3})(\d{3})$/, "$1.$2-$3");
  };

  const formatTel = (telefone: any) => {
    const cleaned = telefone.replace(/[^\d]/g, "");

    if (cleaned.length === 10) {
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    } else if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else {
      return telefone;
    }
  };

  const handlePageBack = () => {
    router.push("/providers");
  };

  const handleSubmit = async () => {
    const formattedCNPJ = formatCNPJ(formData.cnpj);
    const formattedCEP = formatCEP(formData.cep);
    const formattedTelefone = formatTel(formData.telefone);
    const formattedCel = formatTel(formData.celular);

    const response = await createProvider({
      ...formData,
      cnpj: formattedCNPJ,
      cep: formattedCEP,
      telefone: formattedTelefone,
      celular: formattedCel,
    });

    if (response.status === 201) {
      router.push("/providers");
    } else {
      console.error("Erro ao salvar provedor:", response.data);
      alert(`Erro ao salvar provedor. Tente novamente.`);
    }
  };

  return (
    <SideBar>
      <div className="sidebar--container">
        <Form className="form-provider">
          <Form.Group controlId="nome">
            <Form.ControlLabel>Nome Provedor</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Nome Provedor"
              name="nome"
              value={formData.nome}
              onChange={(value: string) => handleChange(value, "nome")}
            />
          </Form.Group>
          <Form.Group controlId="cnpj">
            <Form.ControlLabel>CNPJ</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="CNPJ"
              name="cnpj"
              value={formatCNPJ(formData.cnpj)}
              onChange={(value: string) => handleChange(value, "cnpj")}
              onBlur={handleCNPJBlur}
            />
          </Form.Group>
          <Form.Group controlId="razao_social">
            <Form.ControlLabel>Razao Social</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Razao Social"
              name="razao_social"
              value={formData.razao_social}
              onChange={(value: string) => handleChange(value, "razao_social")}
            />
          </Form.Group>
          <Form.Group controlId="telefone">
            <Form.ControlLabel>Telefone</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Telefone"
              name="telefone"
              value={formatTel(formData.telefone)}
              onChange={(value: string) => handleChange(value, "telefone")}
            />
          </Form.Group>
          <Form.Group controlId="celular">
            <Form.ControlLabel>Celular</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Celular"
              name="celular"
              value={formatTel(formData.celular)}
              onChange={(value: string) => handleChange(value, "celular")}
            />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.ControlLabel>E-mail</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="E-mail"
              name="email"
              value={formData.email}
              onChange={(value: string) => handleChange(value, "email")}
            />
          </Form.Group>
          <Form.Group controlId="site">
            <Form.ControlLabel>Site</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Site"
              name="site"
              value={formData.site}
              onChange={(value: string) => handleChange(value, "site")}
            />
          </Form.Group>
          <Form.Group controlId="cep">
            <Form.ControlLabel>CEP</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="CEP"
              name="cep"
              value={formatCEP(formData.cep)}
              onChange={(value: string) => handleChange(value, "cep")}
              onBlur={handleCepBlur}
            />
          </Form.Group>
          <Form.Group controlId="endereco">
            <Form.ControlLabel>Endereço</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Endereço"
              name="endereco"
              value={formData.endereco}
              onChange={(value: string) => handleChange(value, "endereco")}
            />
          </Form.Group>
          <Form.Group controlId="numero">
            <Form.ControlLabel>Número</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Número"
              name="numero"
              value={formData.numero}
              onChange={(value: string) => handleChange(value, "numero")}
            />
          </Form.Group>
          <Form.Group controlId="complemento">
            <Form.ControlLabel>Complemento</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Complemento"
              name="complemento"
              value={formData.complemento}
              onChange={(value: string) => handleChange(value, "complemento")}
            />
          </Form.Group>
          <Form.Group controlId="cidade">
            <Form.ControlLabel>Cidade</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Cidade"
              name="cidade"
              value={formData.cidade}
              onChange={(value: string) => handleChange(value, "cidade")}
            />
          </Form.Group>
          <Form.Group controlId="bairro">
            <Form.ControlLabel>Bairro</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Bairro"
              name="bairro"
              value={formData.bairro}
              onChange={(value: string) => handleChange(value, "bairro")}
            />
          </Form.Group>
          <Form.Group controlId="estado">
            <Form.ControlLabel>Estado</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Estado"
              name="estado"
              value={formData.estado}
              onChange={(value: string) => handleChange(value, "estado")}
            />
          </Form.Group>
          <Form.Group controlId="estado">
            <Form.ControlLabel>Status</Form.ControlLabel>
            <Dropdown title="Status">
              <Dropdown.Item>Ativo</Dropdown.Item>
              <Dropdown.Item>Inativo</Dropdown.Item>
              <Dropdown.Item>Bloqueado</Dropdown.Item>
              <Dropdown.Item>Pendente</Dropdown.Item>
              <Dropdown.Item>Rejeitado</Dropdown.Item>
              <Dropdown.Item>Cancelado</Dropdown.Item>
            </Dropdown>
          </Form.Group>
        </Form>
        <div className="btn-container">
          <Button appearance="default" onClick={handlePageBack}>
            Voltar
          </Button>
          <Button
            appearance="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader /> : "Salvar"}
          </Button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </SideBar>
  );
};

export default InsertProviderPage;
