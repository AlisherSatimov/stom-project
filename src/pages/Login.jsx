import React, { useState } from "react";
import { Form, Input, Button, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const aToken = response.data;
      localStorage.setItem("aToken", aToken);
      // console.log("aToken:", aToken);
      navigate("/");
    } catch (error) {
      console.error("Login failed", error.response.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <img src="/logo.png" alt="dental logo" width={400} />
      <Form
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
    </div>
  );
};

export default Login;
