"use client";

import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { IUsersConnected } from "@/app/interface/IUsersConnected";
import { useState } from "react";

const UsersPage = () => {
    const [users, setUsers] = useState<IUsersConnected>();
  return (
    <SideBar>
      <div className="sidebar--container">
        <h1>USUARIOS</h1>
      </div>
    </SideBar>
  );
};

export default UsersPage;
