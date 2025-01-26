// import React, { useEffect, useState } from "react";
// import { Card, Button, Spin, message, Row, Col } from "antd";
// import axios from "axios";
// import moment from "moment";

// const Notifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const aToken = localStorage.getItem("aToken");

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const response = await axios.get("/notification/find-all", {
//           headers: {
//             Authorization: `Bearer ${aToken}`,
//           },
//         });

//         if (response.status === 200 && Array.isArray(response.data)) {
//           const today = moment().format("DD/MM/YYYY");
//           const filteredNotifications = response.data.filter(
//             (notification) => notification.nextVisit === today
//           );
//           setNotifications(filteredNotifications);
//         } else {
//           message.warning("No notifications available.");
//         }
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//         message.error("Failed to fetch notifications.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, [aToken]);

//   const handleDeleteNotification = async (id) => {
//     try {
//       const response = await axios.delete(`/notification/delete/${id}`, {
//         headers: {
//           Authorization: `Bearer ${aToken}`,
//         },
//       });

//       if (response.status === 200) {
//         message.success("Notification deleted successfully!");
//         setNotifications((prev) =>
//           prev.filter((notification) => notification.id !== id)
//         );
//       } else {
//         message.error("Failed to delete notification.");
//       }
//     } catch (error) {
//       console.error("Error deleting notification:", error);
//       message.error("An error occurred while deleting the notification.");
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", marginTop: "50px" }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "20px" }}>
//       {notifications.length === 0 ? (
//         <div style={{ textAlign: "center", marginTop: "50px" }}>
//           <p style={{ fontSize: "18px", fontWeight: "bold" }}>
//             No notifications available.
//           </p>
//         </div>
//       ) : (
//         <Row gutter={[16, 16]}>
//           {notifications.map((notification) => (
//             <Col key={notification.id} xs={24} sm={12} md={8} lg={6}>
//               <Card
//                 title={
//                   <span style={{ fontWeight: "bold", fontSize: "16px" }}>
//                     {notification.clientName} {notification.clientLastName}
//                   </span>
//                 }
//                 extra={
//                   <Button
//                     type="primary"
//                     danger
//                     size="small"
//                     onClick={() => handleDeleteNotification(notification.id)}
//                   >
//                     Delete
//                   </Button>
//                 }
//                 style={{
//                   borderRadius: "8px",
//                   boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
//                   overflow: "hidden",
//                 }}
//               >
//                 <p style={{ marginBottom: 8 }}>
//                   <strong>Phone Number:</strong> {notification.phoneNumber}
//                 </p>
//                 <p style={{ marginBottom: 8 }}>
//                   <strong>Next Visit:</strong> {notification.nextVisit}
//                 </p>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       )}
//     </div>
//   );
// };

// export default Notifications;

import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message, Row, Col, Modal } from "antd";
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

        if (response.status === 200 && Array.isArray(response.data)) {
          const today = moment().format("DD/MM/YYYY");
          const filteredNotifications = response.data.filter(
            (notification) => notification.nextVisit === today
          );
          setNotifications(response.data);
          // setNotifications(filteredNotifications); // filterni ishga tushirish
        } else {
          message.warning("No notifications available.");
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

  const confirmDelete = (id) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you want to delete this notification?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => handleDeleteNotification(id),
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

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
                  >
                    Delete
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
