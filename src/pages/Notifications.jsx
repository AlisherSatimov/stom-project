import React, { useEffect } from "react";
import { Card } from "antd";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const aToken = localStorage.getItem("aToken");

  useEffect(() => {
    if (aToken) {
      console.log("token mavjud");
    } else {
      navigate("/login");
    }
  }, [aToken, navigate]);

  return (
    <>
      <Card title="Card title">
        <Card type="inner" title="Message 1" extra={<a href="#">More</a>}>
          Content
        </Card>
        <Card
          style={{
            marginTop: 16,
          }}
          type="inner"
          title="Message 2"
          extra={<a href="#">More</a>}
        >
          Content
        </Card>
      </Card>
    </>
  );
};

export default Notifications;
