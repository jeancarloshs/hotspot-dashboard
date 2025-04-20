"use client";

import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Loader } from "rsuite";

const InsertUserPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePageBack = () => {
    router.push("/users");
  };

  return (
    <SideBar>
      <div className="sidebar--container">
        <h1>INSERT</h1>
        <div className="btn-container">
          <Button appearance="default" onClick={handlePageBack}>
            Voltar
          </Button>
          <Button
            appearance="primary"
            // onClick={handleSubmit}
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

export default InsertUserPage;
