import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Radio, Upload } from "antd";
import { useNavigate } from "react-router-dom";
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
    if (aToken) {
      console.log("token mavjud");
    } else {
      navigate("/login");
    }
  }, [aToken, navigate]);

  const handleNumberChange = (e) => {
    setPhoneNumber(e.target.value);
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
      >
        <Form.Item label="First Name">
          <Input />
        </Form.Item>
        <Form.Item label="Last Name">
          <Input />
        </Form.Item>
        <Form.Item label="Patronymic">
          <Input />
        </Form.Item>
        <Form.Item label="Gender">
          <Radio.Group>
            <Radio value="MALE"> Male </Radio>
            <Radio value="FEMALE"> Female </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Birthday">
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
                /^[+]*[0-9]{1,3}[ ]?[-\s]?[0-9]{1,4}[ ]?[-\s]?[0-9]{1,4}[ ]?[-\s]?[0-9]{1,9}$/, // Telefon raqami uchun regex
              message: "Please enter a valid phone number!",
            },
          ]}
        >
          <Input
            value={phoneNumber}
            onChange={handleNumberChange}
            placeholder="+998912345678"
          />
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
        <Form.Item label="Finish">
          <Button>Submit</Button>
          <Button>Reset</Button>
        </Form.Item>
      </Form>
    </>
  );
};
export default () => <CreateClient />;
