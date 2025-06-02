import React, { useEffect, useState } from "react";
import { Form, Input, Button, Spin, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Login = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const authErrorMessage = localStorage.getItem("authErrorMessage");
  //   if (authErrorMessage) {
  //     message.warning(authErrorMessage);
  //     localStorage.removeItem("authErrorMessage");
  //   }
  // }, []);

  const handleLogin = async (values) => {
    setLoading(true);
    const { login, password } = values;
    const apiType = "WEB";

    try {
      const response = await axios.post("/auth/login", {
        login: login,
        password: password,
        apiType: apiType,
      });
      let fName = response.data.firstName + "";
      let lName = response.data.lastName + "";
      let aToken = response.data.token;
      localStorage.setItem("aToken", aToken);
      if (response.data.role === "ROLE_MODERATOR") {
        navigate("/");
        sessionStorage.setItem("currentPage", "/");
        message.success(
          t("welcomeManager", {
            fName: fName.toUpperCase(),
            lName: lName.toUpperCase(),
          })
        );
      } else if (response.data.role === "ROLE_ADMIN") {
        navigate("/admin");
        sessionStorage.setItem("currentPage", "/admin");
        message.success(
          t("welcomeAdmin", {
            fName: fName.toUpperCase(),
            lName: lName.toUpperCase(),
          })
        );
      } else {
        message.error(t("notAuthorized"));
        localStorage.removeItem("aToken");
      }
    } catch (error) {
      console.error("Login failed", error.response.data.error);
      message.error(t("invalidLogin"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ textAlign: "right", padding: "10px 50px" }}>
        {["en", "ru", "uz"].map((lang) => (
          <span
            key={lang}
            onClick={() => changeLanguage(lang)}
            style={{
              cursor: "pointer",
              marginRight: lang !== "uz" ? 12 : 0,
              fontWeight: i18n.language === lang ? "bold" : "normal",
              textDecoration: i18n.language === lang ? "underline" : "none",
              color: i18n.language === lang ? "#1890ff" : "#555",
            }}
          >
            {lang.toUpperCase()}
          </span>
        ))}
      </div>

      <div className="login-form">
        <Form
          style={{
            width: "600px",
            margin: "40px 90px 0 0",
          }}
          size="large"
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            label={t("login")}
            name="login"
            rules={[
              {
                required: true,
                message: t("enter_login"),
              },
            ]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} />
          </Form.Item>

          <Form.Item
            label={t("password")}
            name="password"
            rules={[
              {
                required: true,
                message: t("enter_password"),
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
            />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit" style={{ width: "100px" }}>
              {loading ? <Spin className="ant-spin-dot-item" /> : "Login"}
            </Button>
          </Form.Item>
        </Form>
        <img src="/logo.png" alt="dental logo" width={600} />
      </div>
    </div>
  );
};

export default Login;
