import React from "react";
import { Row, Col } from "antd";
import SalesCard from "../componets/SalesCard";
import DashboardWidget from "../componets/ChartGraph";
import {
  UserOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const AdminDashboard = () => {
  const cardsData = [
    { title: "All Clients", amount: "800", icon: UserOutlined },
    { title: "All Services", amount: "48", icon: AppstoreOutlined },
    { title: "All Patients", amount: "3,200", icon: MedicineBoxOutlined },
    { title: "All Employees", amount: "14", icon: TeamOutlined },
  ];

  return (
    <>
      <Row gutter={[16, 16]} justify="center">
        {cardsData.map((card, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
            <SalesCard
              title={card.title}
              amount={card.amount}
              icon={card.icon}
            />
          </Col>
        ))}
      </Row>
      <DashboardWidget />
    </>
  );
};

export default AdminDashboard;
