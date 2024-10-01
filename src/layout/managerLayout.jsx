import { useState } from "react";
import {
  TeamOutlined,
  DashboardOutlined,
  UserAddOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
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
        <Content
          style={{
            margin: "0 16px",
          }}
        >
          <Breadcrumb
            style={{
              margin: "16px 0",
            }}
          >
            <Breadcrumb.Item>{getItem.key}</Breadcrumb.Item>
            {/* <Breadcrumb.Item>User</Breadcrumb.Item> */}
          </Breadcrumb>
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
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};
export default ManagerLayout;
