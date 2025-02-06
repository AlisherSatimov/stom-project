import {
  TeamOutlined,
  DashboardOutlined,
  UserAddOutlined,
  BellTwoTone,
  LogoutOutlined,
  ReconciliationOutlined,
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
  getItem("Dashboard", "/admin", <DashboardOutlined />),
  getItem("Employees", "/admin/employees", <TeamOutlined />),
  getItem("Create Employee", "/admin/createEmployee", <UserAddOutlined />),
  getItem(
    "Service Controller",
    "/admin/serviceController",
    <ReconciliationOutlined />
  ),
];

const AdminLayout = () => {
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
      <Sider>
        <div
          className="text-lg"
          style={{
            padding: "32px 30px",
            color: "#fff",
            fontWeight: "600",
            fontSize: "32px",
          }}
        >
          3D Clinic
        </div>
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
            padding: "0 20px",
            margin: 16,
            borderRadius: borderRadiusLG,
            background: colorBgContainer,
          }}
          className="flex justify-between items-center"
        >
          <span>
            <img src="/boss.png" alt="boss icon" width={45} />
          </span>
          <span
            style={{
              fontSize: "28px",
              fontWeight: "600",
              letterSpacing: "2px",
            }}
          >
            Adminstrator
          </span>
          <span className="flex">
            <BellTwoTone
              className="text-2xl"
              style={{
                width: 50,
              }}
            />
            <LogoutOutlined className="text-2xl" onClick={handleLogOut} />
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

export default AdminLayout;
