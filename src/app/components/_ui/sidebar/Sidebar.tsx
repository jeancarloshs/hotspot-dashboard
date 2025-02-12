"use client";

import {
  Container,
  Header,
  Sidebar,
  Sidenav,
  Content,
  Nav,
  Breadcrumb,
  IconButton,
  HStack,
  Stack,
  Text,
} from "rsuite";
import { Icon } from "@rsuite/icons";
import { FaReact } from "react-icons/fa";
import {
  MdDashboard,
  MdGroup,
  MdSettings,
  MdOutlineStackedBarChart,
  MdKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdList,
} from "react-icons/md";
import { TbLogout2 } from "react-icons/tb";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { userLogout } from "@/actions/user-logout";

interface SideBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const SideBar = ({ children }: SideBarProps) => {
  const [expand, setExpand] = useState<boolean>(true);
  const router = useRouter();
  const handleLogout = async (): Promise<void> => {
    await userLogout();
    return router.push("./");
  };

  return (
    <div className="main-container" style={{ marginLeft: expand ? 260 : 56, transition: '0.3s ease' }}>
      <Sidebar
        className="sidebarComponent"
        width={expand ? 260 : 56}
        collapsible
      >
        <Sidenav.Header>
          <Brand expand={expand} />
        </Sidenav.Header>
        <Sidenav expanded={expand} appearance="subtle">
          <Sidenav.Body>
            <Nav
              defaultActiveKey="1"
              className="siderbarComponent--nav_container"
            >
              <Nav.Item
                eventKey="1"
                className="siderbarComponent--nav_container--nav-item"
                onClick={() => router.push("/home")}
                icon={<Icon as={MdDashboard} />}
              >
                Dashboard
              </Nav.Item>
              <Nav.Item
                eventKey="2"
                className="siderbarComponent--nav_container--nav-item"
                onClick={() => router.push("/providers")}
                icon={<Icon as={MdList} />}
              >
                Clientes
              </Nav.Item>
              <Nav.Item
                eventKey="3"
                className="siderbarComponent--nav_container--nav-item"
                onClick={() => router.push("/users")}
                icon={<Icon as={MdGroup} />}
              >
                Usuarios
              </Nav.Item>
              <Nav.Menu
                eventKey="3"
                className="siderbarComponent--nav_container--nav-item"
                trigger="hover"
                title="Advanced"
                icon={<Icon as={MdOutlineStackedBarChart} />}
                placement="rightStart"
              >
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="4-1"
                >
                  Geo
                </Nav.Item>
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="4-2"
                >
                  Devices
                </Nav.Item>
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="4-3"
                >
                  Brand
                </Nav.Item>
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="4-4"
                >
                  Loyalty
                </Nav.Item>
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="4-5"
                >
                  Visit Depth
                </Nav.Item>
              </Nav.Menu>
              <Nav.Menu
                eventKey="4"
                className="siderbarComponent--nav_container--nav-item"
                trigger="hover"
                title="Configurações"
                icon={<Icon as={MdSettings} />}
                placement="rightStart"
              >
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="5-1"
                >
                  Applications
                </Nav.Item>
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="5-2"
                >
                  Websites
                </Nav.Item>
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="5-3"
                >
                  Channels
                </Nav.Item>
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="5-4"
                >
                  Tags
                </Nav.Item>
                <Nav.Item
                  className="siderbarComponent--nav_container--nav-item"
                  eventKey="5-5"
                >
                  Versions
                </Nav.Item>
              </Nav.Menu>

              <Nav.Item
                className="siderbarComponent--nav_container--nav-item"
                eventKey="6"
                onClick={() => handleLogout()}
                icon={<Icon as={TbLogout2} />}
              >
                Logout
              </Nav.Item>
            </Nav>
          </Sidenav.Body>
        </Sidenav>
        <NavToggle expand={expand} onChange={() => setExpand(!expand)} />
      </Sidebar>

      <Container>
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="##">Dashboard</Breadcrumb.Item>
            <Breadcrumb.Item active>Overview</Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content>{children}</Content>
      </Container>
    </div>
  );
};

const NavToggle = ({
  expand,
  onChange,
}: {
  expand: boolean;
  onChange: () => void;
}) => {
  return (
    <Stack
      className="nav-toggle"
      justifyContent={expand ? "flex-end" : "center"}
    >
      <IconButton
        className="siderbarComponent--nav_container--nav-item"
        onClick={onChange}
        appearance="subtle"
        size="lg"
        icon={
          expand ? <MdKeyboardArrowLeft /> : <MdOutlineKeyboardArrowRight />
        }
      />
    </Stack>
  );
};

const Brand = ({ expand }: { expand: boolean }) => {
  return (
    <HStack className="page-brand" spacing={12}>
      <FaReact size={26} />
      {expand && <Text>HOTSPOT</Text>}
    </HStack>
  );
};

export default SideBar;
