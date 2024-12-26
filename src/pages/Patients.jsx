import React, { useEffect } from "react";
import { Badge, Space, Table } from "antd";
import { useNavigate } from "react-router-dom";

const expandDataSource = Array.from({
  length: 3,
}).map((_, i) => ({
  key: i.toString(),
  createdAt: "10/11/2024 - 14:12",
  empName: "Farhod Yusubov",
  teethServiceEntities: "4-Teeth: Plomba 200",
  price: "600",
}));
const dataSource = Array.from({
  length: 15,
}).map((_, i) => ({
  key: i.toString(),
  name: "Ali Erkinov",
  phoneNumber: "+998972541123",
  birthDay: "25/08/1998",
  gender: "MALE",
}));
const expandColumns = [
  {
    title: "Date",
    dataIndex: "createdAt",
    key: "createdAt",
  },
  {
    title: "Dentist Name",
    dataIndex: "empName",
    key: "empName",
  },
  {
    title: "Upgrade Status",
    dataIndex: "teethServiceEntities",
    key: "teethServiceEntities",
  },
  {
    title: "Status",
    key: "state",
    render: () => <Badge status="success" text="Finished" />,
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Action",
    key: "operation",
    render: () => (
      <Space size="middle">
        <a className="text-green-500">Pay</a>
        <a className="text-red-500">Delete</a>
      </Space>
    ),
  },
];
const columns = [
  {
    title: "Client Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Phone Number",
    dataIndex: "phoneNumber",
    key: "phoneNumber",
  },
  {
    title: "Birthday",
    dataIndex: "birthDay",
    key: "birthDay",
  },
  {
    title: "Gender",
    dataIndex: "gender",
    key: "gender",
  },
];
const expandedRowRender = () => (
  <Table
    columns={expandColumns}
    dataSource={expandDataSource}
    pagination={false}
  />
);

export const Patients = () => {
  const navigate = useNavigate();
  let aToken = localStorage.getItem("aToken");

  useEffect(() => {
    if (aToken) {
      console.log("token mavjud");
    } else {
      navigate("/login");
    }
  }, [aToken, navigate]);

  return (
    <Table
      columns={columns}
      expandable={{
        expandedRowRender, // Kengaytirilgan qatorni ko'rsatish
      }}
      dataSource={dataSource}
      size="middle"
    />
  );
};

export default Patients;
