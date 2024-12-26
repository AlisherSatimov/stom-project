import {
  TeamOutlined,
  DashboardOutlined,
  UserAddOutlined,
  UserOutlined,
  BellOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BellTwoTone,
  LogoutOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Header } from "antd/es/layout/layout";
import { useSider } from "../context/SiderContext";

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
  getItem("Patients", "/", <DashboardOutlined />),
  getItem("Clients", "/clients", <TeamOutlined />),
  getItem("Create Client", "/createClient", <UserAddOutlined />),
  getItem("Notifications", "/notifications", <BellOutlined />),
];

const ManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, toggleSider } = useSider();

  const handleLogOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (key) => {
    navigate(key); // `key` to'g'ridan-to'g'ri URL bo'ladi
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider collapsible collapsed={collapsed} onCollapse={toggleSider}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]} // Sahifadagi tanlangan elementni ko'rsatadi
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
          className="flex justify-between items-center"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSider}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <span className="flex">
            <BellTwoTone
              className="text-2xl"
              style={{
                width: 50,
              }}
            />
            <LogoutOutlined
              className="text-2xl"
              onClick={handleLogOut}
              style={{
                width: 50,
              }}
            />
          </span>
        </Header>
        <Content
          style={{
            margin: "0 16px",
          }}
        >
          <Breadcrumb style={{}} items={[{}]} />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
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
