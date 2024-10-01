import { Button, Form, Input, Spin } from "antd";
import { useState } from "react";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";

export const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // const navigate = useNavigate();
  const handleLogin = async () => {
    setLoading(true);
    const apiType = "WEB";

    const response = await axios.post("/auth/login", {
      login,
      password,
      apiType,
    });
    const data = response.data;

    console.log("data", data);
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
          <Input
            prefix={
              <UserOutlined
                className="site-form-item-icon"
                onChange={(e) => setLogin(e.target.value)}
              />
            }
          />
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
            prefix={
              <LockOutlined
                className="site-form-item-icon"
                onChange={(e) => setPassword(e.target.value)}
              />
            }
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
