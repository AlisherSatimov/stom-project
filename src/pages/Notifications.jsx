import { useEffect, useState } from "react";
import { Card, Button, Spin, message, Row, Col, Modal } from "antd";
import axios from "../utils/axiosInstance";

const Notifications = () => {
  // State to store fetched notifications
  const [notifications, setNotifications] = useState([]);

  // State to handle loading spinner
  const [loading, setLoading] = useState(true);

  // Fetch notifications from backend when component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/notification/find-all");

        if (response.status === 200 && Array.isArray(response.data)) {
          setNotifications(response.data); // Set received data into state
        } else {
          message.warning("No notifications available.");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        message.error("Failed to fetch notifications.");
      } finally {
        setLoading(false); // Hide spinner regardless of success or failure
      }
    };

    fetchNotifications();
  }, []);

  // Handles deletion of a single notification by ID
  const handleDeleteNotification = async (id) => {
    try {
      const response = await axios.delete(`/notification/delete/${id}`);

      if (response.status === 200) {
        message.success("Notification deleted successfully!");

        // Update state by removing the deleted item
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== id)
        );
      } else {
        message.error("Failed to delete notification.");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      message.error("An error occurred while deleting the notification.");
    }
  };

  // Show confirmation modal before deleting
  const confirmDelete = (id) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you want to delete this notification?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => handleDeleteNotification(id), // Proceed if user confirms
    });
  };

  // Show loading spinner while fetching notifications
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Display message when there are no notifications */}
      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p style={{ fontSize: "18px", fontWeight: "bold" }}>
            No notifications available.
          </p>
        </div>
      ) : (
        // Display all notifications using Ant Design's grid system
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
                {/* Display phone number and next visit date */}
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
