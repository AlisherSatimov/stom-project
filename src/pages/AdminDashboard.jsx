import React, { useEffect, useState } from "react";
import { Row, Col, Spin, Card } from "antd";
import {
  UserOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import SalesCard from "../componets/SalesCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    clients: null,
    services: null,
    patients: null,
    employees: null,
  });
  const [monthlyPatients, setMonthlyPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("aToken");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, servicesRes, patientsRes, employeesRes, monthlyRes] =
          await Promise.all([
            axios.get("https://3dclinic.uz:8085/client/count-client", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("https://3dclinic.uz:8085/service/count-services", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("https://3dclinic.uz:8085/patient/clients", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("https://3dclinic.uz:8085/employees/count-doctor", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("https://3dclinic.uz:8085/patient/monthly-appointments", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setStats({
          clients: clientsRes.data,
          services: servicesRes.data,
          patients: patientsRes.data,
          employees: employeesRes.data,
        });

        const monthNames = [
          "",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const formattedMonthly = monthlyRes.data.map((item) => ({
          month: monthNames[item.month],
          count: item.count,
        }));

        setMonthlyPatients(formattedMonthly);
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const cardsData = [
    { title: "All Clients", amount: stats.clients, icon: UserOutlined },
    { title: "All Services", amount: stats.services, icon: AppstoreOutlined },
    {
      title: "All Patients",
      amount: stats.patients,
      icon: MedicineBoxOutlined,
    },
    { title: "All Employees", amount: stats.employees, icon: TeamOutlined },
  ];

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]} justify="center">
        {cardsData.map((card, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
            <SalesCard
              title={card.title}
              amount={card.amount ?? "–"}
              icon={card.icon}
            />
          </Col>
        ))}
      </Row>

      {/* Bar Chart – Monthly Treated Patients */}
      <Card
        title="Monthly Treated Patients"
        style={{ marginTop: 24, borderRadius: 8 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={monthlyPatients}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" name="Patients" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Spin>
  );
};

export default AdminDashboard;
