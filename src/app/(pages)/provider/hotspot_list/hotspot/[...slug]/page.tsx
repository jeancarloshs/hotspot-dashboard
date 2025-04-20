"use client";

import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import React from "react";

const HotspotPage = ({ params }: any) => {
  const resolvedParams = React.use<any>(params);
  const slug = resolvedParams.slug[0];
//   const slugID = resolvedParams.slug[1];

  return (
    <SideBar>
      <div className="sidebar--container">
        <h1>Hotspot: {slug}</h1>
        {/* Renderize mais conteúdo com base no slug aqui */}
      </div>
    </SideBar>
  );
};

export default HotspotPage;
