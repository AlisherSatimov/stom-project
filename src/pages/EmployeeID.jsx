import React, { useEffect } from "react";
import { useEmployee } from "../context/EmployeeContext"; // EmployeeContext ni import qiling
import { Card, Spin, Typography } from "antd";

const { Title, Text } = Typography;

const EmployeeID = () => {
  const { employeeId, employeeData } = useEmployee();

  useEffect(() => {
    if (!employeeId) {
      console.error("Employee ID mavjud emas");
    }
  }, [employeeId]);

  if (!employeeData) {
    return <Spin size="large" style={{ display: "block", margin: "auto" }} />;
  }

  return (
    <Card
      title={`Employee: ${employeeData.firstName} ${employeeData.lastName}`}
      style={{ maxWidth: 600, margin: "auto", marginTop: 20 }}
    >
      <p>
        <Text strong>Email:</Text> {employeeData.email}
      </p>
      <p>
        <Text strong>Phone:</Text> {employeeData.phoneNumber}
      </p>
      <p>
        <Text strong>Role:</Text> {employeeData.role}
      </p>
      <p>
        <Text strong>BirthDay:</Text> {employeeData.birthDay}
      </p>
      <p>
        <Text strong>Address:</Text> {employeeData.address}
      </p>
    </Card>
  );
};

export default EmployeeID;
