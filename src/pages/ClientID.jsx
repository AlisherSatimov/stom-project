import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Upload,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

const ClientDetails = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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
        console.log("Client data:", response.data);
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
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : null,
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

  const handleDeleteClient = () => {
    confirm({
      title: "Are you sure you want to delete this client?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/client/${clientId}`, {
            headers: {
              Authorization: `Bearer ${aToken}`,
            },
          });
          if (response.status === 200) {
            message.success("Client deleted successfully!");
            navigate("/clients");
          }
        } catch (error) {
          console.error("Delete error:", error);
          message.error("Failed to delete client.");
        }
      },
    });
  };

  const handleBeforeUpload = (file) => {
    setFile(file);
    return false;
  };

  const handleUpload = async () => {
    if (!file) return message.warning("Please select a file first.");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dto", JSON.stringify({ id: clientId }));

    try {
      await axios.post(
        `https://3dclinic.uz:8085/analyse/upload/${clientId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        }
      );
      message.success("File uploaded successfully.");
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload file.");
    } finally {
      setUploading(false);
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
          <Col>
            <Card
              style={{
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                minWidth: "600px",
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
                        ? moment(clientData.birthday, "DD/MM/YYYY", true)
                        : null,
                    });
                    setIsModalOpen(true);
                  }}
                >
                  Update Client
                </Button>,
                <Button danger onClick={handleDeleteClient}>
                  Delete Client
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
                    ? moment(
                        clientData.birthday,
                        ["DD/MM/YYYY", "YYYY-MM-DD"],
                        true
                      ).format("DD/MM/YYYY")
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {clientData.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {clientData.address}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: "24px" }}>
                <Title level={5}>Upload Analiz File</Title>
                <Upload
                  beforeUpload={handleBeforeUpload}
                  showUploadList={file ? [{ name: file.name }] : []}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
                <Button
                  type="primary"
                  onClick={handleUpload}
                  disabled={!file}
                  loading={uploading}
                  style={{ marginTop: "8px" }}
                >
                  Upload
                </Button>
              </div>
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
              <DatePicker
                style={{ width: "100%" }}
                open={false}
                format="YYYY-MM-DD"
              />
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
