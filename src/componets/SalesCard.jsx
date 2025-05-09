import React from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const SalesCard = ({ title, amount, icon: Icon, iconColor = "#1677ff" }) => {
  const iconStyle = {
    color: "white",
    backgroundColor: iconColor,
    borderRadius: "20%",
    padding: "15px",
    fontSize: "24px",
  };

  return (
    <Card
      style={{
        borderRadius: "10px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <div
        className="admin-total-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0px",
        }}
      >
        <div>
          <Text type="secondary">{title}</Text>
          <Title level={3} style={{ margin: 0 }}>
            {amount}
          </Title>
        </div>
        {Icon && <Icon style={iconStyle} />}
      </div>
    </Card>
  );
};

export default SalesCard;
