import { useEffect, useState } from "react";
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
import axios from "../utils/axiosInstance";
import moment from "moment";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

const ClientDetails = () => {
  // Extract clientId from route params
  const { clientId } = useParams();
  const navigate = useNavigate();

  // Component state definitions
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [fileList, setFileList] = useState([]);

  const [form] = Form.useForm();

  const fetchClientData = async () => {
    try {
      const response = await axios.get(`/client/${clientId}`);
      setClientData(response.data);
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAnalyses = async () => {
    try {
      const response = await axios.get(`/analyse/list/${clientId}`);
      setAnalyses(response.data || []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      message.error("Failed to load analysis files.");
    }
  };

  // Fetch client data and analysis files on mount
  useEffect(() => {
    if (!clientId) {
      console.error("clientId is missing from URL");
      return;
    }
    fetchClientData();
    fetchAnalyses();
  }, [clientId]);

  // Handle file download
  const handleDownload = async (id, fileName) => {
    try {
      const response = await axios.get(`/analyse/download/${id}`);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
      message.error("Failed to download file.");
    }
  };

  // Handle client update (modal submission)
  const handleUpdateClient = async (values) => {
    try {
      const updatedValues = {
        ...values,
        birthday: values.birthday
          ? values.birthday.format("YYYY-MM-DD") // ISO format for backend
          : null,
      };

      const response = await axios.put(`/client/${clientId}`, updatedValues);

      if (response.status === 200) {
        message.success("Client updated successfully!");
        setIsModalOpen(false);

        // ✅ YANGILANGAN MA’LUMOTLARNI QAYTADAN OLISH
        fetchClientData();
      }
    } catch (error) {
      console.error("Error updating client:", error);
      message.error("Failed to update client.");
    }
  };

  // Handle client deletion with confirmation
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
          const response = await axios.delete(`/client/${clientId}`);
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

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return message.warning("Please select a file first.");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dto", JSON.stringify({ id: clientId }));

    try {
      await axios.post(`/analyse/upload/${clientId}`, formData);
      message.success("File uploaded successfully.");
      setFile(null);
      const updatedList = await axios.get(`/analyse/list/${clientId}`);
      setAnalyses(updatedList.data || []);
      setFileList([]);
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  // Handle file deletion with confirmation
  const handleDeleteFile = (fileId, fileName) => {
    confirm({
      title: `Are you sure you want to delete "${fileName}"?`,
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      async onOk() {
        try {
          await axios.delete(`/analyse/${fileId}`);
          message.success("File deleted successfully.");
          const updatedList = await axios.get(`/analyse/list/${clientId}`);
          setAnalyses(updatedList.data || []);
        } catch (error) {
          console.error("Delete error:", error);
          message.error("Failed to delete file.");
        }
      },
    });
  };

  // Loading spinner fallback
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

  // Show fallback message if no client data found
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

  // Render main layout with client info and file actions
  return (
    <Layout style={{ minHeight: "50vh" }}>
      <Content style={{ padding: "20px" }}>
        <Row gutter={24} align="top">
          {/* Left column - Client profile info and upload */}
          <Col xs={24} md={12}>
            <Card
              style={{
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                minWidth: "100%",
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
                        ? moment(clientData.birthday, "DD/MM/YYYY") // parses correctly from string
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
                    ? moment(clientData.birthday, "DD/MM/YYYY").format(
                        "DD/MM/YYYY"
                      )
                    : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Phone Number">
                  {clientData.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {clientData.address}
                </Descriptions.Item>
              </Descriptions>

              {/* Upload section */}
              <div style={{ marginTop: "24px" }}>
                <Title level={5}>Upload Analiz File</Title>
                <Upload
                  beforeUpload={(file) => {
                    setFile(file);
                    setFileList([file]);
                    return false;
                  }}
                  fileList={fileList}
                  onRemove={() => {
                    setFile(null);
                    setFileList([]);
                  }}
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

          {/* Right column - Uploaded analyses list */}
          <Col xs={24} md={12}>
            <Card
              title="📂 Uploaded Analyses"
              style={{
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                minHeight: "400px",
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {analyses.length === 0 ? (
                <Typography.Text type="secondary">
                  No analyses found.
                </Typography.Text>
              ) : (
                <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
                  {analyses.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        padding: "10px 15px",
                        border: "1px solid #f0f0f0",
                        borderRadius: "6px",
                        marginBottom: "8px",
                        backgroundColor: "#fafafa",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        onClick={() => handleDownload(item.id, item.fileName)}
                        style={{
                          cursor: "pointer",
                          maxWidth: "70%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "inline-block",
                        }}
                        title={item.fileName}
                      >
                        📄 {item.fileName}
                      </span>
                      <Button
                        type="text"
                        danger
                        onClick={() => handleDeleteFile(item.id, item.fileName)}
                      >
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Col>
        </Row>

        {/* Update client modal */}
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
              rules={[{ required: false }]}
            >
              <DatePicker
                disabled
                style={{ width: "100%" }}
                format="DD/MM/YYYY" // controls how it looks in UI
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
