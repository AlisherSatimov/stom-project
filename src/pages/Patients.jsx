import React, { useEffect, useState } from "react";
import { Badge, Space, Table, Modal, message, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const navigate = useNavigate();
  const aToken = localStorage.getItem("aToken");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!aToken) {
      navigate("/login");
      return;
    }

    const fetchPatients = async () => {
      try {
        const response = await axios.get("/patient/find-debt", {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        });

        if (response && response.data) {
          setPatients(response.data.sort((a, b) => b.id - a.id));
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Failed to fetch patient data. Please try again later.");
      }
    };

    fetchPatients();
  }, [aToken, navigate]);

  const handlePay = (record) => {
    setSelectedPatient(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      paidValue: record.teethServiceEntities.reduce(
        (total, service) => total + service.price,
        0
      ),
    });
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this patient?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/patient/${id}`, {
            headers: {
              Authorization: `Bearer ${aToken}`,
            },
          });

          if (response.status === 200) {
            message.success("Patient deleted successfully!");
            setPatients((prev) => prev.filter((patient) => patient.id !== id));
          } else {
            message.error("Failed to delete the patient.");
          }
        } catch (error) {
          console.error("Error deleting patient:", error);
          message.error("An error occurred while deleting the patient.");
        }
      },
    });
  };

  const handleModalSubmit = async (values) => {
    try {
      const response = await axios.post(
        "/payment/pay",
        {
          id: selectedPatient.id,
          paidValue: values.paidValue,
        },
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        }
      );

      if (response.status === 200) {
        const messageText = response.data;
        message.success(messageText);

        // 🔍 "qoldi" qismidagi sonni ajratamiz
        const match = messageText.match(/(\d+)\s*so`m\s*qoldi/i);
        const remaining = match ? parseInt(match[1], 10) : null;

        console.log("Remaining:", remaining); // debug uchun

        setIsModalOpen(false);
        setSelectedPatient(null);
        form.resetFields();

        // Agar qolgan pul 0 bo‘lsa, patientni olib tashlaymiz
        if (remaining === 0) {
          setPatients((prev) =>
            prev.filter((p) => p.id !== selectedPatient.id)
          );
        }
      } else {
        message.error("Failed to process payment.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      message.error("An error occurred while processing payment.");
    }
  };

  const columns = [
    {
      title: "Client Name",
      dataIndex: "patientName",
      key: "patientName",
      render: (text, record) => `${record.patientName} ${record.patientLName}`,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Birthday",
      dataIndex: "birthDay",
      key: "birthDay",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
  ];

  const expandedRowRender = (record) => {
    const expandColumns = [
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
      },
      {
        title: "Dentist Name",
        dataIndex: "empName",
        key: "empName",
        render: (text, record) => `${record.empName} ${record.empLName}`,
      },
      {
        title: "Services",
        dataIndex: "teethServiceEntities",
        key: "teethServiceEntities",
        render: (teethServiceEntities) => (
          <>
            {teethServiceEntities.map((service, index) => (
              <div
                key={index}
              >{`${service.teethName}-Teeth: ${service.serviceName} (${service.price})`}</div>
            ))}
          </>
        ),
      },
      {
        title: "Status",
        key: "state",
        render: (text, record) => (
          <Badge
            status={record.isServiced ? "success" : "processing"}
            text={record.isServiced ? "Finished" : "Pending"}
          />
        ),
      },
      {
        title: "Price",
        dataIndex: "teethServiceEntities",
        key: "price",
        render: (teethServiceEntities) =>
          teethServiceEntities.reduce(
            (total, service) => total + service.price,
            0
          ),
      },
      {
        title: "Action",
        key: "operation",
        width: "16%",
        render: (_, record) => (
          <Space size="middle">
            <a
              onClick={() => handlePay(record)}
              style={{
                color: "green",
                cursor: "pointer",
                border: "1px solid green",
                padding: "8px 26px",
                borderRadius: "5px",
                backgroundColor: "#18ff331e",
              }}
            >
              Pay
            </a>
            <a
              className="text-red-500"
              onClick={() => handleDelete(record.id)}
              style={{
                cursor: "pointer",
                border: "1px solid red",
                padding: "8px 16px",
                borderRadius: "5px",
                backgroundColor: "#ff181809",
              }}
            >
              Delete
            </a>
          </Space>
        ),
      },
    ];

    return (
      <Table columns={expandColumns} dataSource={[record]} pagination={false} />
    );
  };

  return (
    <>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [record.key] : []);
          },
        }}
        rowClassName={(record) =>
          expandedRowKeys.includes(record.key)
            ? "expanded-row pointer-row"
            : "pointer-row"
        }
        dataSource={patients.map((item) => ({ ...item, key: item.id }))}
        size="middle"
        onRow={(record) => ({
          onClick: () => {
            const isExpanded = expandedRowKeys.includes(record.key);
            setExpandedRowKeys(isExpanded ? [] : [record.key]);
          },
        })}
      />

      <Modal
        title="Process Payment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => handleModalSubmit(values))
            .catch((error) => console.error("Validation Failed:", error));
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Paid Value"
            name="paidValue"
            rules={[{ required: true, message: "Please enter paid value" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Patients;
