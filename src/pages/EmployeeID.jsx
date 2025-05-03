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
  message,
  DatePicker,
  Table,
} from "antd";
import { UserOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

const EmployeeID = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatientServices, setSelectedPatientServices] = useState(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const aToken = localStorage.getItem("aToken");
  const [form] = Form.useForm();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportStats, setReportStats] = useState({
    totalPatients: 0,
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    percent: 0,
    dentistShare: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await axios.get(`/employees/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        });
        setEmployeeData(empRes.data);
        form.setFieldsValue({
          ...empRes.data,
          birthDay: moment(empRes.data.birthDay, "DD/MM/YYYY"),
        });

        // ROLE_USER bo'lsa, bemorlarni olish
        if (empRes.data.role === "ROLE_USER") {
          const patRes = await axios.get(
            `https://3dclinic.uz:8085/patient/doctor/${employeeId}`,
            {
              headers: {
                Authorization: `Bearer ${aToken}`,
              },
            }
          );
          const sorted = patRes.data.sort((a, b) => b.id - a.id);
          setPatients(sorted);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, form, aToken]);

  const handleUpdateEmployee = async (values) => {
    try {
      const updatedValues = {
        ...values,
        birthDay: values.birthDay ? values.birthDay.format("YYYY-MM-DD") : null,
      };

      const response = await axios.put(
        `https://3dclinic.uz:8085/employees/${employeeId}`,
        updatedValues,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Employee updated successfully!");
        setEmployeeData((prev) => ({ ...prev, ...updatedValues }));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      message.error("Failed to update employee.");
    }
  };

  const handleDeleteEmployee = () => {
    confirm({
      title: "Are you sure you want to delete this employee?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/employees/${employeeId}`, {
            headers: {
              Authorization: `Bearer ${aToken}`,
            },
          });
          if (response.status === 200) {
            message.success("Employee deleted successfully!");
            navigate("/admin/employees");
          }
        } catch (error) {
          console.error("Delete error:", error);
          message.error("Failed to delete employee.");
        }
      },
    });
  };

  const openServiceModal = (teethServiceEntities) => {
    setSelectedPatientServices(teethServiceEntities);
    setIsServiceModalOpen(true);
  };

  const handleReportCalculation = () => {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    if (!startMs || !endMs || isNaN(startMs) || isNaN(endMs)) {
      return message.warning("Iltimos, ikki sana tanlang.");
    }

    const filtered = patients.filter((p) => {
      const createdMs = new Date(p.createdAt).getTime();
      return createdMs >= startMs && createdMs <= endMs;
    });

    const totalIncome = filtered.reduce((sum, p) => {
      return (
        sum + (p.teethServiceEntities?.reduce((s, s2) => s + s2.price, 0) || 0)
      );
    }, 0);

    const totalExpense = filtered.reduce((sum, p) => sum + (p.expense || 0), 0);
    const netProfit = totalIncome - totalExpense;
    const dentistShare = (netProfit * reportStats.percent) / 100;

    setReportStats({
      totalPatients: filtered.length,
      totalIncome,
      totalExpense,
      netProfit,
      percent: reportStats.percent,
      dentistShare,
    });

    console.log("📋 Filtered patients:", filtered);
  };

  const handlePercentChange = (e) => {
    const percent = Number(e.target.value);
    const dentistShare = (reportStats.netProfit * percent) / 100;

    setReportStats((prev) => ({
      ...prev,
      percent,
      dentistShare,
    }));
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

  if (!employeeData) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ textAlign: "center", marginTop: "50px" }}>
          <Typography.Text type="danger">
            Employee data could not be found!
          </Typography.Text>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "50vh" }}>
      <Content style={{ padding: "20px" }}>
        <Row gutter={24}>
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
                    style={{ backgroundColor: "#1890ff" }}
                  />
                </div>
              }
              actions={[
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                  Edit Info
                </Button>,
                <Button danger onClick={handleDeleteEmployee}>
                  Delete Employee
                </Button>,
              ]}
            >
              <Title
                level={4}
                style={{ textAlign: "center", marginBottom: "20px" }}
              >
                {`${employeeData.firstName} ${employeeData.lastName}`}
              </Title>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Patronymic">
                  {employeeData.patronymic}
                </Descriptions.Item>
                <Descriptions.Item label="Login">
                  {employeeData.login}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {employeeData.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {employeeData.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  {employeeData.role.replace("ROLE_", "")}
                </Descriptions.Item>
                <Descriptions.Item label="BirthDay">
                  {employeeData.birthDay}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {employeeData.address}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {employeeData.role === "ROLE_USER" && (
            <Col xs={24} md={12}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Davolangan bemorlar
              </Title>
              <Table
                dataSource={patients}
                rowKey="id"
                columns={[
                  {
                    title: "Full Name",
                    render: (text, record) =>
                      `${record.patientName} ${record.patientLName}`,
                  },
                  {
                    title: "Date",
                    dataIndex: "createdAt",
                  },
                  {
                    title: "Income",
                    render: (text, record) =>
                      record.teethServiceEntities.reduce(
                        (sum, s) => sum + s.price,
                        0
                      ) + " so'm",
                  },
                  {
                    title: "Expense",
                    dataIndex: "expense",
                    render: (value) => (value ? value + " so'm" : "0 so'm"),
                  },
                ]}
                onRow={(record) => ({
                  onClick: () => openServiceModal(record.teethServiceEntities),
                })}
              />
            </Col>
          )}
        </Row>
        <Modal
          title="Edit Employee Information"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => {
            form
              .validateFields()
              .then((values) => handleUpdateEmployee(values))
              .catch((info) => console.log("Validation Failed:", info));
          }}
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="patronymic" label="Patronymic">
              <Input />
            </Form.Item>

            <Form.Item
              name="login"
              label="Login"
              rules={[{ required: true, message: "Please enter login" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Please enter a valid email" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="phoneNumber" label="Phone Number">
              <Input />
            </Form.Item>

            <Form.Item
              name="birthDay"
              label="BirthDay"
              rules={[
                { required: true, message: "Please select the birthday" },
              ]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select>
                <Option value="ROLE_USER">User</Option>
                <Option value="ROLE_ADMIN">Admin</Option>
                <Option value="ROLE_MODERATOR">Moderator</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Service Details"
          open={isServiceModalOpen}
          onCancel={() => setIsServiceModalOpen(false)}
          footer={null}
        >
          {selectedPatientServices && selectedPatientServices.length > 0 ? (
            <ul>
              {selectedPatientServices.map((item, index) => (
                <li key={index}>
                  Tish {item.teethName}: {item.serviceName} – {item.price} so'm
                </li>
              ))}
            </ul>
          ) : (
            <p>No services provided.</p>
          )}
        </Modal>

        {employeeData.role === "ROLE_USER" && (
          <Card title="🧾 Report" style={{ marginTop: 40 }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col span={6}>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
              <Col>
                <Button type="primary" onClick={handleReportCalculation}>
                  Report calculation
                </Button>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                👥 Total patients: <strong>{reportStats.totalPatients}</strong>
              </Col>
              <Col span={6}>
                💰 Income: <strong>{reportStats.totalIncome} so'm</strong>
              </Col>
              <Col span={6}>
                💸 Costs: <strong>{reportStats.totalExpense} so'm</strong>
              </Col>
              <Col span={6}>
                📈 Net profit: <strong>{reportStats.netProfit} so'm</strong>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={4}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={reportStats.percent}
                  onChange={handlePercentChange}
                  addonAfter="%"
                />
              </Col>
              <Col span={6}>
                🎯 Dentist salary:{" "}
                <strong>{Math.round(reportStats.dentistShare)} so'm</strong>
              </Col>
            </Row>
          </Card>
        )}
        {/* <Card title="🧾 Hisobot bo‘limi" style={{ marginTop: 40 }}>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Boshlanish sanasi"
              />
            </Col>
            <Col span={6}>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Tugash sanasi"
              />
            </Col>
            <Col>
              <Button type="primary" onClick={handleReportCalculation}>
                Hisobotni hisoblash
              </Button>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              👥 Jami bemorlar: <strong>{reportStats.totalPatients}</strong>
            </Col>
            <Col span={6}>
              💰 Tushum: <strong>{reportStats.totalIncome} so'm</strong>
            </Col>
            <Col span={6}>
              💸 Xarajat: <strong>{reportStats.totalExpense} so'm</strong>
            </Col>
            <Col span={6}>
              📈 Sof foyda: <strong>{reportStats.netProfit} so'm</strong>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={4}>
              <Input
                type="number"
                min={0}
                max={100}
                value={reportStats.percent}
                onChange={handlePercentChange}
                addonAfter="%"
              />
            </Col>
            <Col span={6}>
              🎯 Dentist ulushi:{" "}
              <strong>{Math.round(reportStats.dentistShare)} so'm</strong>
            </Col>
          </Row>
        </Card> */}
      </Content>
    </Layout>
  );
};

export default EmployeeID;
