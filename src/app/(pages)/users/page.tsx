"use client";

import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { IUsersConnected } from "@/app/interface/IUsersConnected";
import { useRouter } from "next/navigation";
import { useState } from "react";

const UsersPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<IUsersConnected>();
  const handleInsert = () => {
    router.push("/user/insert");
  };

  return (
    <SideBar>
      <div className="sidebar--container">
        <div className="btn" onClick={handleInsert}>
          <p>Adicionar</p>
        </div>
      </div>
    </SideBar>
  );
};

export default UsersPage;
