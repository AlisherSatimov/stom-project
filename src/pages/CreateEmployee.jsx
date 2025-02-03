import React, { useEffect } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Row,
  Col,
  message,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const { Option } = Select;

const CreateEmployee = () => {
  const navigate = useNavigate();
  let aToken = localStorage.getItem("aToken");

  useEffect(() => {
    if (!aToken) {
      navigate("/login");
    }
  }, [aToken, navigate]);

  const handleSubmit = async (values) => {
    const employeeData = {
      firstName: values.firstName,
      lastName: values.lastName,
      patronymic: values.patronymic,
      login: values.login,
      password: values.password,
      email: values.email,
      role: values.role,
      birthDay: values.birthDay ? values.birthDay.format("YYYY-MM-DD") : "",
      phoneNumber: values.phoneNumber,
      address: values.address,
    };

    try {
      const response = await axios.post(
        "https://3dclinic.uz:8085/auth/create",
        employeeData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Hodim yaratildi");
        navigate("/admin/employees");
      } else {
        message.error("Nimadir xato ketdi, qaytadan urinib ko'ring!");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      message.error("Hodim yaratishda xatolik yuz berdi.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "50px auto",
        padding: "40px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        Create New Employee
      </Title>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>First Name</strong>}
              name="firstName"
              rules={[{ required: true, message: "Please enter first name!" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Last Name</strong>}
              name="lastName"
              rules={[{ required: true, message: "Please enter last name!" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Patronymic</strong>}
              name="patronymic"
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Login</strong>}
              name="login"
              rules={[{ required: true, message: "Please enter login!" }]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Password</strong>}
              name="password"
              rules={[{ required: true, message: "Please enter password!" }]}
            >
              <Input.Password size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Email</strong>}
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter valid email!",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Role</strong>}
              name="role"
              rules={[{ required: true, message: "Please select a role!" }]}
            >
              <Select size="large" placeholder="Select role">
                <Option value="ROLE_ADMIN">Admin</Option>
                <Option value="ROLE_MODERATOR">Moderator</Option>
                <Option value="ROLE_USER">User</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Birthday</strong>}
              name="birthDay"
              rules={[{ required: true, message: "Please select birthday!" }]}
            >
              <DatePicker size="large" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Phone Number</strong>}
              name="phoneNumber"
              rules={[
                { required: true, message: "Please enter phone number!" },
              ]}
            >
              <Input size="large" placeholder="+998912345678" />
            </Form.Item>
            <Form.Item
              label={<strong style={{ fontSize: "18px" }}>Address</strong>}
              name="address"
              rules={[{ required: true, message: "Please enter address!" }]}
            >
              <Input size="large" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "100%" }}
          >
            {" "}
            Create Employee{" "}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateEmployee;
