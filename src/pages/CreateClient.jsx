import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Radio, Upload, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      birthday: values.birthday.format("YYYY-MM-DD"), // Date format conversion
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
        message.success(response.data.message); // Success message
        navigate("/clients"); // Redirect to client list page
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
    <>
      <Form
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        layout="horizontal"
        style={{
          maxWidth: 600,
        }}
        onFinish={handleSubmit} // Handle form submission
      >
        <Form.Item
          label="First Name"
          name="name"
          rules={[{ required: true, message: "Please enter first name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: "Please enter last name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Patronymic"
          name="patronymic"
          rules={[{ required: true, message: "Please enter patronymic!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Gender"
          name="gender"
          rules={[{ required: true, message: "Please select gender!" }]}
        >
          <Radio.Group>
            <Radio value="MALE"> Male </Radio>
            <Radio value="FEMALE"> Female </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Birthday"
          name="birthday"
          rules={[{ required: true, message: "Please select birthday!" }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          label="Phone Number"
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
          <Input placeholder="+998912345678" />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please enter address!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Upload"
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
              <div
                style={{
                  marginTop: 8,
                }}
              >
                Upload
              </div>
            </button>
          </Upload>
        </Form.Item>
        <Form.Item label="Actions">
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="reset">Reset</Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default CreateClient;
