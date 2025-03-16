"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { IHotspot } from "@/app/interface/IUsersConnected";
import React, { useEffect, useState } from "react";

const HotspotsPage = ({ params }: any) => {
  const [allHotSpots, setAllHotspots] = useState<IHotspot[]>([]);
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  const resolvedParams = React.use<any>(params);
  const slug = resolvedParams.slug[0];
  //   const slugID = resolvedParams.slug[1];

  useEffect(() => {
    const fetchHotspots = async () => {
      const _getAllHotspots = await getAllHotspots(slug);
      try {
        setAllHotspots(_getAllHotspots);
      } catch (error) {
        setError("Erro ao carregar os hotspots");
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, []);
  // console.log(allHotSpots);

  return (
    <SideBar>
      <div className="sidebar--container">
        {allHotSpots.map((item) => {
          return <h1 key={item.id}>Hotspot List: {item.nome}</h1>;
        })}
        {/* Renderize mais conteúdo com base no slug aqui */}
      </div>
    </SideBar>
  );
};

export default HotspotsPage;
