"use client";

import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import React from "react";
import { Button, Form } from "rsuite";

const InsertProviderPage = () => {
  return (
    <SideBar>
      <div className="sidebar--container">
        <Form fluid className="form-provider">
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Nome Provedor</Form.ControlLabel>
            <Form.Control placeholder="Nome Provedor" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>CNPJ</Form.ControlLabel>
            <Form.Control placeholder="CNPJ" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Razao Social</Form.ControlLabel>
            <Form.Control placeholder="Razao Social" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Telefone</Form.ControlLabel>
            <Form.Control placeholder="Telefone" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>E-mail</Form.ControlLabel>
            <Form.Control placeholder="E-mail" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Site</Form.ControlLabel>
            <Form.Control placeholder="Site" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>CEP</Form.ControlLabel>
            <Form.Control placeholder="CEP" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Endereço</Form.ControlLabel>
            <Form.Control placeholder="Endereço" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Número</Form.ControlLabel>
            <Form.Control placeholder="Número" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Complemento</Form.ControlLabel>
            <Form.Control placeholder="Complemento" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Cidade</Form.ControlLabel>
            <Form.Control placeholder="Cidade" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Bairro</Form.ControlLabel>
            <Form.Control placeholder="Bairro" name="providerName" />
          </Form.Group>
          <Form.Group controlId="username-8">
            <Form.ControlLabel>Estado</Form.ControlLabel>
            <Form.Control placeholder="Estado" name="providerName" />
          </Form.Group>

          {/* <Form.Group controlId="password-8">
            <Form.ControlLabel>Username</Form.ControlLabel>
            <Form.Control
              placeholder="Password"
              name="password"
              type="password"
              autoComplete="off"
            />
          </Form.Group> */}

          {/* <Button>Login</Button> */}
        </Form>
      </div>
    </SideBar>
  );
};

export default InsertProviderPage;
