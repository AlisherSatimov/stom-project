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
  message,
  DatePicker,
  Table,
} from "antd";
import { UserOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "../utils/axiosInstance";
import moment from "moment";
import { useTranslation } from "react-i18next";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

const EmployeeID = () => {
  const { t } = useTranslation();
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
        const empRes = await axios.get(`/employees/${employeeId}`);
        setEmployeeData(empRes.data);
        form.setFieldsValue({
          ...empRes.data,
          birthDay: moment(empRes.data.birthDay, "DD/MM/YYYY"),
        });

        // ROLE_USER bo'lsa, bemorlarni olish
        if (empRes.data.role === "ROLE_USER") {
          const patRes = await axios.get(`/patient/doctor/${employeeId}`, {
            headers: {
              Authorization: `Bearer ${aToken}`,
            },
          });
          const sorted = patRes.data.sort((a, b) => b.id - a.id);
          setPatients(sorted);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error(t("failedFetch"));
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
        message.success(t("updateSuccess"));
        setEmployeeData((prev) => ({ ...prev, ...updatedValues }));
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      message.error(t("updateError"));
    }
  };

  const handleDeleteEmployee = () => {
    confirm({
      title: t("confirmDeleteEmployee"),
      icon: <ExclamationCircleOutlined />,
      content: t("cannotBeUndone"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("no"),
      onOk: async () => {
        try {
          const response = await axios.delete(
            `/employees/passive-delete/${employeeId}`,
            {
              headers: {
                Authorization: `Bearer ${aToken}`,
              },
            }
          );
          if (response.status === 200) {
            message.success(t("deleteSuccess"));
            navigate("/admin/employees");
          }
        } catch (error) {
          console.error("Delete error:", error);
          message.error(t("employeeDeleteError"));
        }
      },
    });
  };

  const openServiceModal = (teethServiceEntities) => {
    setSelectedPatientServices(teethServiceEntities);
    setIsServiceModalOpen(true);
  };

  const handleReportCalculation = () => {
    if (!startDate || !endDate) {
      return message.warning(t("pleaseSelectTwoDates"));
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const startMs = start.getTime();
    const endMs = end.getTime();

    const filtered = patients.filter((p) => {
      const createdMs = moment(p.createdAt, "DD/MM/YYYY HH:mm").valueOf();
      const isInRange = createdMs >= startMs && createdMs <= endMs;

      return isInRange;
    });

    const totals = filtered.reduce(
      (acc, p) => {
        const income =
          p.teethServiceEntities?.reduce((s, s2) => s + s2.price, 0) || 0;
        const expense = p.expense || 0;
        acc.totalIncome += income;
        acc.totalExpense += expense;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );

    const netProfit = totals.totalIncome - totals.totalExpense;
    const dentistShare = (netProfit * reportStats.percent) / 100;

    setReportStats({
      totalPatients: filtered.length,
      totalIncome: totals.totalIncome,
      totalExpense: totals.totalExpense,
      netProfit,
      percent: reportStats.percent,
      dentistShare,
    });
  };

  const handlePercentChange = (e) => {
    const percent = Number(e.target.value);
    const dentistShare = (reportStats.totalIncome * percent) / 100;

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
            {t("employeeNotFound")}
          </Typography.Text>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "50vh" }}>
      <Content style={{ padding: "20px" }}>
        <Row
          gutter={24}
          justify={employeeData.role !== "ROLE_USER" ? "center" : undefined}
        >
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
                  {t("editInfo")}
                </Button>,
                <Button danger onClick={handleDeleteEmployee}>
                  {t("deleteEmployee")}
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
                <Descriptions.Item label={t("patronymic")}>
                  {employeeData.patronymic}
                </Descriptions.Item>
                <Descriptions.Item label={t("login")}>
                  {employeeData.login}
                </Descriptions.Item>
                <Descriptions.Item label={t("email")}>
                  {employeeData.email}
                </Descriptions.Item>
                <Descriptions.Item label={t("phoneNumber")}>
                  {employeeData.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label={t("role")}>
                  {employeeData.role.replace("ROLE_", "")}
                </Descriptions.Item>
                <Descriptions.Item label={t("birthday")}>
                  {employeeData.birthDay}
                </Descriptions.Item>
                <Descriptions.Item label={t("address")}>
                  {employeeData.address}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {employeeData.role === "ROLE_USER" && (
            <Col xs={24} md={12}>
              <Title level={4} style={{ marginBottom: 16 }}>
                {t("treatedPatients")}
              </Title>
              <Table
                dataSource={patients}
                rowKey="id"
                columns={[
                  {
                    title: t("fullName"),
                    render: (text, record) =>
                      `${record.patientName} ${record.patientLName}`,
                  },
                  {
                    title: t("date"),
                    dataIndex: "createdAt",
                  },
                  {
                    title: t("income"),
                    render: (text, record) =>
                      record.teethServiceEntities.reduce(
                        (sum, s) => sum + s.price,
                        0
                      ) + ` ${t("currency")}`,
                  },
                  {
                    title: t("expense"),
                    dataIndex: "expense",
                    render: (value) =>
                      value
                        ? value + ` ${t("currency")}`
                        : `0 ${t("currency")}`,
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
          title={t("editEmployeeInfo")}
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
              label={t("firstName")}
              rules={[{ required: true, message: t("pleaseEnterFirstName") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="lastName"
              label={t("lastName")}
              rules={[{ required: true, message: t("pleaseEnterLastName") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="patronymic"
              label={t("patronymic")}
              rules={[{ required: true, message: t("pleaseEnterPatronymic") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="login"
              label={t("login")}
              rules={[{ required: true, message: t("pleaseEnterLogin") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label={t("password")}
              rules={[{ required: true, message: t("pleaseEnterPassword") }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="email"
              label={t("email")}
              rules={[
                {
                  type: "email",
                  required: true,
                  message: t("pleaseEnterValidEmail"),
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label={t("phoneNumber")}
              rules={[
                {
                  required: true,
                  message: t("pleaseEnterPhoneNumber"),
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="birthDay"
              label={t("birthday")}
              rules={[{ required: false }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                disabled
              />
            </Form.Item>

            <Form.Item
              name="address"
              label={t("address")}
              rules={[{ required: true, message: t("pleaseEnterAddress") }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="role"
              label={t("role")}
              rules={[{ required: true, message: t("pleaseSelectRole") }]}
            >
              <Select>
                <Option value="ROLE_USER">{t("dentist")}</Option>
                <Option value="ROLE_ADMIN">{t("admin")}</Option>
                <Option value="ROLE_MODERATOR">{t("manager")}</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={t("serviceDetails")}
          open={isServiceModalOpen}
          onCancel={() => setIsServiceModalOpen(false)}
          footer={null}
        >
          {selectedPatientServices && selectedPatientServices.length > 0 ? (
            <ul>
              {selectedPatientServices.map((item, index) => (
                <li key={index}>
                  {t("tooth")}-{item.teethName}: {item.serviceName} –{" "}
                  {item.price} {t("currency")}
                </li>
              ))}
            </ul>
          ) : (
            <p>{t("noServices")}</p>
          )}
        </Modal>

        {employeeData.role === "ROLE_USER" && (
          <Card title={t("report")} style={{ marginTop: 40 }}>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {t("dateRange")}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: "50%" }}
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: "50%" }}
                  />
                </div>
              </Col>
              <Col span={6} style={{ display: "flex", alignItems: "flex-end" }}>
                <Button type="primary" onClick={handleReportCalculation}>
                  {t("reportCalc")}
                </Button>
              </Col>
              <Col
                span={6}
                style={{ display: "flex", alignItems: "flex-end" }}
              ></Col>
              <Col span={6}>
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: 4,
                    marginLeft: 95,
                  }}
                >
                  {t("forDentist")}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={reportStats.percent}
                    onChange={handlePercentChange}
                    addonAfter="%"
                    style={{ width: "79%", marginLeft: 95 }}
                  />
                </div>
              </Col>
            </Row>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                marginTop: "24px",
              }}
            >
              <Card
                style={{
                  flex: "1 1 18%",
                  textAlign: "center",
                  backgroundColor: "#f0f5ff",
                }}
              >
                👥 <div>{t("totalPatients")}</div>
                <strong>{reportStats.totalPatients}</strong>
              </Card>

              <Card
                style={{
                  flex: "1 1 18%",
                  textAlign: "center",
                  backgroundColor: "#f6ffed",
                }}
              >
                💰 <div>{t("income")}</div>
                <strong>
                  {reportStats.totalIncome} {t("currency")}
                </strong>
              </Card>

              <Card
                style={{
                  flex: "1 1 18%",
                  textAlign: "center",
                  backgroundColor: "#fffbe6",
                }}
              >
                💸 <div>{t("expense")}</div>
                <strong>
                  {reportStats.totalExpense} {t("currency")}
                </strong>
              </Card>

              <Card
                style={{
                  flex: "1 1 18%",
                  textAlign: "center",
                  backgroundColor: "#fff0f6",
                }}
              >
                📈 <div>{t("netProfit")}</div>
                <strong>
                  {reportStats.netProfit} {t("currency")}
                </strong>
              </Card>

              <Card
                style={{
                  flex: "1 1 18%",
                  textAlign: "center",
                  backgroundColor: "#e6fffb",
                }}
              >
                🎯 <div>{t("dentistSalary")}</div>
                <strong>
                  {Math.round(reportStats.dentistShare)} {t("currency")}
                </strong>
              </Card>
            </div>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default EmployeeID;
