import { useState } from "react";
import {
  TeamOutlined,
  DashboardOutlined,
  UserAddOutlined,
  UserOutlined,
  BellOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "antd/es/layout/layout";
const { Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem("Dashboard", "dashboard", <DashboardOutlined />),
  getItem("Clients", "clients", <TeamOutlined />),
  getItem("Create Clinet", "createClient", <UserAddOutlined />),
  getItem("Client ID", "clientID", <UserOutlined />),
  getItem("Notifications", "notifications", <BellOutlined />),
];
const ManagerLayout = () => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (key) => {
    key === "dashboard" ? navigate("/") : navigate(`/${key}`);
    sessionStorage.setItem("currentPage", key.toString());
    console.log(key);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={[
            sessionStorage.getItem("currentPage") || "dashboard",
          ]}
          mode="inline"
          items={items}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            margin: 16,
            borderRadius: borderRadiusLG,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <span>salom</span>
        </Header>
        <Content
          style={{
            margin: "0 16px",
          }}
        >
          <Breadcrumb style={{}} items={[{ title: getItem.key }]} />

          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {<Outlet />}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          {new Date().getFullYear()} 3Dclinic
        </Footer>
      </Layout>
    </Layout>
  );
};
export default ManagerLayout;
