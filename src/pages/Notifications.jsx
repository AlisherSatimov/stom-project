import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message } from "antd";
import axios from "axios";
import moment from "moment";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const aToken = localStorage.getItem("aToken");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/notification/find-all", {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        });

        console.log(response.data);

        if (response.status === 200 && Array.isArray(response.data)) {
          const today = moment().format("DD/MM/YYYY");
          const filteredNotifications = response.data.filter(
            (notification) => notification.nextVisit === today
          );
          setNotifications(filteredNotifications);
        } else {
          message.warning("No notifications available for today.");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        message.error("Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [aToken]);

  const handleDeleteNotification = async (id) => {
    try {
      const response = await axios.delete(`/notification/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${aToken}`,
        },
      });

      if (response.status === 200) {
        message.success("Notification deleted successfully!");
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p>No notifications for today.</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <Card
            key={notification.id}
            title={`${notification.clientName} ${notification.clientLastName}`}
            extra={
              <Button
                type="primary"
                danger
                onClick={() => handleDeleteNotification(notification.id)}
              >
                Delete
              </Button>
            }
            style={{ marginBottom: "16px" }}
          >
            <p>Next Visit: {notification.nextVisit}</p>
          </Card>
        ))
      )}
    </>
  );
};

export default Notifications;
