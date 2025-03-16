"use client";

import { getCep } from "@/actions/get-cep";
import { getCNPJ } from "@/actions/get-cnpj";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Form } from "rsuite";

const InsertProviderPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    providerName: "",
    providerCNPJ: "",
    providerSocialName: "",
    providerTel: "",
    providerCel: "",
    providerEmail: "",
    providerSite: "",
    providerCEP: "",
    providerAddress: "",
    providerNumber: "",
    providerComplement: "",
    providerCity: "",
    providerNeighborhood: "",
    providerState: "",
  });

  const handleChange = (event: any) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCepBlur = async (event: any) => {
    const cep = event.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (cep.length === 8) {
      const response = await getCep(cep);
      if (response) {
        setFormData({
          ...formData,
          providerAddress: response.logradouro,
          providerNeighborhood: response.bairro,
          providerCity: response.localidade,
          providerState: response.uf,
        });
      }
    }
  };

  const handleCNPJBlur = async (event: any) => {
    const cnpj = event.target.value.replace(/[.\-/]/g, "");
    if (cnpj.length === 14) {
      const response = await getCNPJ(cnpj);
      console.log(response);
      if (response) {
        setFormData({
          ...formData,
          providerName: response.nome_fantasia,
          providerSocialName: response.razao_social,
          providerTel: response.ddd_telefone_1,
        });
      }
    }
  };

  const handlePageBack = () => {
    router.push("/providers");
  };

  const handleSubmit = async () => {
    console.log("enviado");
  };

  return (
    <SideBar>
      <div className="sidebar--container">
        <Form className="form-provider">
          <Form.Group controlId="providerName">
            <Form.ControlLabel>Nome Provedor</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Nome Provedor"
              name="providerName"
              value={formData.providerName}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerCNPJ">
            <Form.ControlLabel>CNPJ</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="CNPJ"
              name="providerCNPJ"
              // value={formData.providerCNPJ}
              onChange={handleChange}
              onBlur={handleCNPJBlur}
            />
          </Form.Group>
          <Form.Group controlId="providerSocialName">
            <Form.ControlLabel>Razao Social</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Razao Social"
              name="providerSocialName"
              value={formData.providerSocialName}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerTel">
            <Form.ControlLabel>Telefone</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Telefone"
              name="providerTel"
              value={formData.providerTel}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerCel">
            <Form.ControlLabel>Celular</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Celular"
              name="providerCel"
              value={formData.providerCel}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerEmail">
            <Form.ControlLabel>E-mail</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="E-mail"
              name="providerEmail"
              value={formData.providerEmail}
            />
          </Form.Group>
          <Form.Group controlId="providerSite">
            <Form.ControlLabel>Site</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Site"
              name="providerSite"
              value={formData.providerSite}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerCEP">
            <Form.ControlLabel>CEP</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="CEP"
              name="providerCEP"
              // value={formData.providerCEP}
              onChange={handleChange}
              onBlur={handleCepBlur}
            />
          </Form.Group>
          <Form.Group controlId="providerAddress">
            <Form.ControlLabel>Endereço</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Endereço"
              name="providerAddress"
              value={formData.providerAddress}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerNumber">
            <Form.ControlLabel>Número</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Número"
              name="providerNumber"
              value={formData.providerNumber}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerComplement">
            <Form.ControlLabel>Complemento</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Complemento"
              name="providerComplement"
              value={formData.providerComplement}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerCity">
            <Form.ControlLabel>Cidade</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Cidade"
              name="providerCity"
              value={formData.providerCity}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerNeighborhood">
            <Form.ControlLabel>Bairro</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Bairro"
              name="providerNeighborhood"
              value={formData.providerNeighborhood}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="providerState">
            <Form.ControlLabel>Estado</Form.ControlLabel>
            <Form.Control
              className="inputForm"
              placeholder="Estado"
              name="providerState"
              value={formData.providerState}
              onChange={handleChange}
            />
          </Form.Group>

          {/* <Button>Login</Button> */}
        </Form>
        <div className="btn-container">
          <div className="btn" onClick={handlePageBack}>
            <p>Voltar</p>
          </div>
          <div className="btn" onClick={handleSubmit}>
            <p>Salvar</p>
          </div>
        </div>
      </div>
    </SideBar>
  );
};

export default InsertProviderPage;
