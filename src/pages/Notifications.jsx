import { useState } from "react";
import { Card, Button, Spin, message, Row, Col, Modal } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";

const Notifications = () => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null); // 🔄 Local loading holat

  // === FETCH NOTIFICATIONS WITH REACT QUERY ===
  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await axios.get("/notification/find-all");
      return response.data;
    },
    staleTime: 0,
  });

  // === HANDLE DELETE NOTIFICATION ===
  const handleDelete = async (id) => {
    setDeletingId(id); // faqat shu notification loading bo‘lsin
    try {
      const response = await axios.delete(`/notification/delete/${id}`);
      if (response.status === 200) {
        message.success("Notification deleted successfully!");
        queryClient.invalidateQueries(["notifications"]);
      } else {
        message.error("Failed to delete notification.");
      }
    } catch (error) {
      message.error("Error deleting notification.");
    } finally {
      setDeletingId(null); // loadingni tiklash
    }
  };

  // === CONFIRM MODAL BEFORE DELETE ===
  const confirmDelete = (id) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you want to delete this notification?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => handleDelete(id),
    });
  };

  // === RENDER STATES ===
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !Array.isArray(notifications)) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p style={{ fontSize: "18px", fontWeight: "bold", color: "red" }}>
          Failed to load notifications.
        </p>
      </div>
    );
  }

  // === MAIN RENDER ===
  return (
    <div style={{ padding: "20px" }}>
      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p style={{ fontSize: "18px", fontWeight: "bold" }}>
            No notifications available.
          </p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {notifications.map((notification) => (
            <Col key={notification.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                title={
                  <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {notification.clientName} {notification.clientLastName}
                  </span>
                }
                extra={
                  <Button
                    type="primary"
                    danger
                    size="small"
                    onClick={() => confirmDelete(notification.id)}
                    loading={deletingId === notification.id} // ✅ faqat shu tugma loading bo‘ladi
                  >
                    Done
                  </Button>
                }
                style={{
                  borderRadius: "8px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                }}
              >
                <p style={{ marginBottom: 8 }}>
                  <strong>Phone Number:</strong> {notification.phoneNumber}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>Next Visit:</strong> {notification.nextVisit}
                </p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Notifications;
