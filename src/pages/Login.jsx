import React, { useEffect, useState } from "react";
import { Form, Input, Button, Spin, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authErrorMessage = localStorage.getItem("authErrorMessage");
    if (authErrorMessage) {
      message.warning(authErrorMessage);
      localStorage.removeItem("authErrorMessage"); // faqat bir marta ko‘rsatish uchun
    }
  }, []);

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
      if (response.data.role == "ROLE_MODERATOR") {
        navigate("/");
        sessionStorage.setItem("currentPage", "/");
        message.success(
          `Welcome Manager ${fName.toUpperCase()} ${lName.toUpperCase()}`
        );
      } else if (response.data.role == "ROLE_ADMIN") {
        navigate("/admin");
        sessionStorage.setItem("currentPage", "/admin");
        message.success(
          `Welcome Admin ${fName.toUpperCase()} ${lName.toUpperCase()}`
        );
      } else {
        message.error(
          `You are not a Manager or Admin. Please enter a valid Login and Password.`
        );
      }
    } catch (error) {
      console.error("Login failed", error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
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
            label="Login"
            name="login"
            rules={[
              {
                required: true,
                message: "Please input your login!",
              },
            ]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
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
