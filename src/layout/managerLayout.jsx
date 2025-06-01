import {
  TeamOutlined,
  DashboardOutlined,
  UserAddOutlined,
  BellOutlined,
  BellTwoTone,
  LogoutOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
  getItem("Patients", "/", <DashboardOutlined />),
  getItem("Clients", "/clients", <TeamOutlined />),
  getItem("Create Client", "/createClient", <UserAddOutlined />),
  getItem("Notifications", "/notifications", <BellOutlined />),
];

const ManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogOut = () => {
    localStorage.removeItem("aToken");
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
          selectedKeys={[location.pathname]}
          mode="inline"
          items={items}
          onClick={({ key }) => handleMenuClick(key)}
        />
      </Sider>
      <Layout>
        <Content
          className="manager-layout"
          style={{
            padding: "16px",
          }}
        >
          <Header
            style={{
              borderRadius: borderRadiusLG,
              padding: "0 20px",
              background: "#fff",
            }}
            className="flex justify-between items-center"
          >
            <span>
              <img src="/manager-icon.png" alt="manager-icon" width={45} />
            </span>
            <span
              style={{
                fontSize: "28px",
                fontWeight: "600",
                letterSpacing: "2px",
              }}
            >
              Manager
            </span>
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
                //
              />
            </span>
          </Header>
          <Breadcrumb style={{}} items={[{}]} />
          <div
            style={{
              marginTop: 16,
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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "30px",
            background: "#fff",
          }}
        >
          {new Date().getFullYear()} 3Dclinic
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ManagerLayout;
