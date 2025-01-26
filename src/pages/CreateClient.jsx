import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Radio,
  Upload,
  message,
  Typography,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const CreateClient = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();
  let aToken = localStorage.getItem("aToken");

  useEffect(() => {
    if (!aToken) {
      navigate("/login");
    }
  }, [aToken, navigate]);

  const handleSubmit = async (values) => {
    const clientData = {
      name: values.name,
      lastName: values.lastName,
      patronymic: values.patronymic,
      gender: values.gender,
      birthday: values.birthday.format("YYYY-MM-DD"),
      phoneNumber: values.phoneNumber,
      address: values.address,
    };

    try {
      const response = await axios.post(
        "https://3dclinic.uz:8085/client",
        clientData,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success(response.data.message);
        navigate("/clients");
      } else {
        message.error("Something went wrong. Please try again!");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      message.error(
        "Failed to create client. Please check your connection and try again."
      );
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        Create New Client
      </Title>
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              First Name
            </span>
          }
          name="name"
          rules={[{ required: true, message: "Please enter first name!" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              Last Name
            </span>
          }
          name="lastName"
          rules={[{ required: true, message: "Please enter last name!" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              Patronymic
            </span>
          }
          name="patronymic"
          rules={[{ required: true, message: "Please enter patronymic!" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>Gender</span>
          }
          name="gender"
          rules={[{ required: true, message: "Please select gender!" }]}
        >
          <Radio.Group>
            <Radio value="MALE" style={{ fontSize: "16px" }}>
              Male
            </Radio>
            <Radio value="FEMALE" style={{ fontSize: "16px" }}>
              Female
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              Birthday
            </span>
          }
          name="birthday"
          rules={[{ required: true, message: "Please select birthday!" }]}
        >
          <DatePicker size="large" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              Phone Number
            </span>
          }
          name="phoneNumber"
          rules={[
            {
              required: true,
              message: "Enter your phone number!",
            },
            {
              pattern:
                /^[+]*[0-9]{1,3}[ ]?[-\s]?[0-9]{1,4}[ ]?[-\s]?[0-9]{1,4}[ ]?[-\s]?[0-9]{1,9}$/,
              message: "Please enter a valid phone number!",
            },
          ]}
        >
          <Input size="large" placeholder="+998912345678" />
        </Form.Item>
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
              Address
            </span>
          }
          name="address"
          rules={[{ required: true, message: "Please enter address!" }]}
        >
          <Input size="large" />
        </Form.Item>
        <Form.Item
          label={
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>Upload</span>
          }
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload action="/upload.do" listType="picture-card">
            <button
              style={{
                border: 0,
                background: "none",
              }}
              type="button"
            >
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Space style={{ width: "100%", justifyContent: "center" }}>
            <Button type="primary" htmlType="submit" size="large">
              Submit
            </Button>
            <Button htmlType="reset" size="large">
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateClient;
