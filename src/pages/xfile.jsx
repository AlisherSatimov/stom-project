import React from "react";
import { Button, InputNumber, message } from "antd";
import axios from "axios";

const XrayUploader = () => {
  const [xrayId, setXrayId] = React.useState(null);
  const aToken = localStorage.getItem("aToken");

  const handleDownload = async () => {
    if (!xrayId) {
      return message.warning("Iltimos, xray ID ni kiriting.");
    }

    try {
      const response = await axios.get(
        `https://3dclinic.uz:8085/xray/${xrayId}`,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
          responseType: "blob", // blob formatda qabul qilish
        }
      );
      console.log(response.data);

      // Content-Type orqali kengaytmani aniqlash
      const contentType = response.headers["content-type"];
      let extension = "bin";
      if (contentType.includes("pdf")) {
        extension = "pdf";
      } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
        extension = "jpg";
      } else if (contentType.includes("png")) {
        extension = "png";
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `xray-${xrayId}.${extension}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Yuklab olishda xatolik:", error);
      message.error("X-ray faylni yuklab bo‘lmadi.");
    }
  };

  return (
    <div style={{ maxWidth: 400 }}>
      <InputNumber
        placeholder="X-ray ID (masalan: 2)"
        onChange={(value) => setXrayId(value)}
        style={{ width: "100%", marginBottom: 16 }}
      />

      <Button type="primary" onClick={handleDownload} disabled={!xrayId} block>
        Yuklab olish
      </Button>
    </div>
  );
};

export default XrayUploader;
