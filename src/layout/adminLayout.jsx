import {
  TeamOutlined,
  DashboardOutlined,
  UserAddOutlined,
  LogoutOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Header } from "antd/es/layout/layout";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const { Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    getItem(t("dashboard"), "/admin", <DashboardOutlined />),
    getItem(t("employees"), "/admin/employees", <TeamOutlined />),
    getItem(t("createEmployee"), "/admin/createEmployee", <UserAddOutlined />),
    getItem(
      t("serviceController"),
      "/admin/serviceController",
      <ReconciliationOutlined />
    ),
  ];

  const handleLogOut = () => {
    localStorage.removeItem("aToken");
    navigate("/login");
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (key) => {
    navigate(key);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider width={250}>
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
            {t("administrator")}
          </span>
          <span className="flex">
            <LanguageSwitcher />

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
