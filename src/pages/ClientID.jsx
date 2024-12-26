import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Spin, Typography } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const ClientDetails = () => {
  const { clientId } = useParams(); // URL'dan client ID ni olish
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const aToken = localStorage.getItem("aToken");

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

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!clientData) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Text type="danger">Client data could not be found!</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", display: "flex", justifyContent: "center" }}>
      <Card
        title="Client Details"
        bordered
        style={{
          width: 400,
          body: { padding: "20px" }, // bodyStyle o'rniga style.body ishlatilmoqda
        }}
      >
        <Title level={4} style={{ textAlign: "center" }}>
          {`${clientData.name} ${clientData.lastName}`}
        </Title>
        <Text>
          <strong>Patronymic:</strong> {clientData.patronymic}
        </Text>
        <br />
        <Text>
          <strong>Gender:</strong>{" "}
          {clientData.gender === "MALE" ? "Male" : "Female"}
        </Text>
        <br />
        <Text>
          <strong>Birthday:</strong> {clientData.birthday}
        </Text>
        <br />
        <Text>
          <strong>Phone Number:</strong> {clientData.phoneNumber}
        </Text>
        <br />
        <Text>
          <strong>Address:</strong> {clientData.address}
        </Text>
      </Card>
    </div>
  );
};

export default ClientDetails;
