import { useState } from "react";
import { Card, Button, Spin, message, Row, Col, Modal } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useTranslation } from "react-i18next";

dayjs.extend(customParseFormat);

const Notifications = () => {
  const { t } = useTranslation();
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
      const all = response.data;

      const today = dayjs().startOf("day");
      const threeDaysLater = today.add(3, "day").endOf("day");

      return all
        .filter((n) => {
          const visitDate = dayjs(n.nextVisit, "DD/MM/YYYY");
          return (
            visitDate.isValid() && visitDate.isSameOrBefore(threeDaysLater)
          );
        })
        .sort((a, b) => {
          const aDate = dayjs(a.nextVisit, "DD/MM/YYYY");
          const bDate = dayjs(b.nextVisit, "DD/MM/YYYY");
          return aDate - bDate;
        });
    },
    staleTime: 0,
  });

  // === HANDLE DELETE NOTIFICATION ===
  const handleDelete = async (id) => {
    setDeletingId(id); // faqat shu notification loading bo‘lsin
    try {
      const response = await axios.delete(`/notification/delete/${id}`);
      if (response.status === 200) {
        message.success(t("notificationDeletedSuccess"));
        queryClient.invalidateQueries(["notifications"]);
      } else {
        message.error(t("notificationDeletedFail"));
      }
    } catch (error) {
      message.error(t("notificationDeletedError"));
    } finally {
      setDeletingId(null); // loadingni tiklash
    }
  };

  // === CONFIRM MODAL BEFORE DELETE ===
  const confirmDelete = (id) => {
    Modal.confirm({
      title: t("confirmDeleteTitle"),
      content: t("confirmDeleteContent"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("no"),
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
          {t("failedToLoad")}
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
            {t("noNotifications")}
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
                    loading={deletingId === notification.id}
                  >
                    {t("doneButton")}
                  </Button>
                }
                style={{
                  borderRadius: "8px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  overflow: "hidden",
                }}
              >
                <p style={{ marginBottom: 8 }}>
                  <strong>{t("phoneNumber")}</strong> {notification.phoneNumber}
                </p>
                <p style={{ marginBottom: 8 }}>
                  <strong>{t("nextVisit")}</strong> {notification.nextVisit}
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
