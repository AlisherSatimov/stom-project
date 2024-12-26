import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Layout,
  Card,
  Avatar,
  Descriptions,
  Spin,
  Typography,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment"; // moment kutubxonasini import qilish

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const ClientDetails = () => {
  const { clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const aToken = localStorage.getItem("aToken");

  const [form] = Form.useForm();

  useEffect(() => {
    if (!clientId) {
      console.error("clientId is missing from URL");
      return;
    }
    const fetchClientData = async () => {
      try {
        const response = await axios.get(`/client/${clientId}`, {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        });
        setClientData(response.data);
      } catch (error) {
        console.error("Error fetching client data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, [clientId, aToken]);

  const handleUpdateClient = async (values) => {
    try {
      const updatedValues = {
        ...values,
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null, // moment formatlash
      };

      const response = await axios.put(`/client/${clientId}`, updatedValues, {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });

      if (response.status === 200) {
        message.success("Client updated successfully!");
        setClientData((prev) => ({ ...prev, ...updatedValues }));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating client:", error);
      message.error("Failed to update client.");
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!clientData) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ textAlign: "center", marginTop: "50px" }}>
          <Typography.Text type="danger">
            Client data could not be found!
          </Typography.Text>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "50vh" }}>
      <Content style={{ padding: "20px" }}>
        <Row justify="center" align="middle" style={{ minHeight: "50vh" }}>
          <Col xs={24} sm={16} md={12} lg={8}>
            <Card
              style={{
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
              cover={
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#87d068" }}
                  />
                </div>
              }
              actions={[
                <Button
                  type="primary"
                  onClick={() => {
                    form.setFieldsValue({
                      ...clientData,
                      birthday: clientData.birthday
                        ? moment(clientData.birthday, "YYYY-MM-DD")
                        : null, // moment bilan DatePicker uchun formatlash
                    });
                    setIsModalOpen(true);
                  }}
                >
                  Update Client
                </Button>,
              ]}
            >
              <Title
                level={4}
                style={{ textAlign: "center", marginBottom: "20px" }}
              >
                {`${clientData.name} ${clientData.lastName}`}
              </Title>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Patronymic">
                  {clientData.patronymic}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {clientData.gender === "MALE" ? "Male" : "Female"}
                </Descriptions.Item>
                <Descriptions.Item label="Birthday">
                  {clientData.birthday
                    ? moment(clientData.birthday).format("YYYY-MM-DD")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {clientData.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {clientData.address}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Modal
          title="Update Client Information"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => {
            form
              .validateFields()
              .then((values) => {
                handleUpdateClient(values);
              })
              .catch((info) => {
                console.log("Validation Failed:", info);
              });
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="First Name"
              rules={[
                { required: true, message: "Please enter the first name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[
                { required: true, message: "Please enter the last name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="patronymic" label="Patronymic">
              <Input />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Please select the gender!" }]}
            >
              <Select>
                <Option value="MALE">Male</Option>
                <Option value="FEMALE">Female</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="birthday"
              label="Birthday"
              rules={[
                { required: true, message: "Please select the birthday!" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                { required: true, message: "Please enter the phone number!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ClientDetails;
