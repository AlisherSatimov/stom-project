import { useState } from "react";
import { Badge, Space, Table, Modal, message, Form, Input } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Patients = () => {
  const { t } = useTranslation();
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();
  const [maxDebt, setMaxDebt] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const aToken = localStorage.getItem("aToken");

  if (aToken == null) {
    navigate("/login");
  }

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const response = await axios.get("/patient/find-debt");
      return response.data.sort((a, b) => b.id - a.id);
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/patient/${id}`),
    onSuccess: () => {
      message.success(t("patientDeleted"));
      queryClient.invalidateQueries(["patients"]);
    },
    onError: () => {
      message.error(t("deleteError"));
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => axios.post("/payment/pay", data),
    onSuccess: (response) => {
      const messageText = response.data;
      const match = messageText.match(/(\d+)\s*so`m\s*qoldi/i);
      const remaining = match ? parseInt(match[1], 10) : 0;

      if (match) {
        const paidMatch = messageText.match(/(\d+)\s*so`m\s*to`landi/i);
        const paidAmount = paidMatch ? parseInt(paidMatch[1], 10) : null;

        const formattedMsg = t("paymentSuccessWithRemaining", {
          paid: paidAmount?.toLocaleString(),
          remaining: remaining.toLocaleString(),
        });
        message.success(formattedMsg);
      }
      setIsModalOpen(false);
      setSelectedPatient(null);
      form.resetFields();
      if (remaining === 0) {
        queryClient.invalidateQueries(["patients"]);
      }
    },
    onError: () => {
      message.error(t("paymentError"));
    },
  });

  const handlePay = async (record) => {
    setSelectedPatient(record);
    setIsModalOpen(true);
    try {
      const total = record.teethServiceEntities.reduce(
        (total, service) => total + service.price,
        0
      );
      const response = await axios.get(`/payment/patient/${record.id}`);
      const paymentHistory = response?.data || [];
      const paid = paymentHistory.reduce((sum, entry) => sum + entry.paid, 0);
      const remaining = total - paid;
      setTotalPrice(total);
      setTotalPaid(paid);
      setMaxDebt(remaining);
      form.setFieldsValue({ paidValue: remaining });
    } catch (error) {
      console.error("Error fetching payment history:", error);
      message.error(t("loadPaymentFail"));
      setTotalPrice(0);
      setTotalPaid(0);
      setMaxDebt(0);
      form.setFieldsValue({ paidValue: 0 });
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: t("areYouSureDelete"),
      content: t("cannotBeUndone"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("no"),
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const paidInput = values.paidValue;
        const willRemain = maxDebt - paidInput;

        paymentMutation.mutate({
          id: selectedPatient.id,
          paidValue: paidInput,
        });

        if (willRemain === 0) {
          queryClient.invalidateQueries(["patients"]);
        }
      })
      .catch((error) => console.error("Validation Failed:", error));
  };

  const columns = [
    {
      title: t("clientName"),
      dataIndex: "patientName",
      key: "patientName",
      render: (text, record) => `${record.patientName} ${record.patientLName}`,
    },
    {
      title: t("phoneNumber"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: t("birthday"),
      dataIndex: "birthDay",
      key: "birthDay",
    },
    {
      title: t("gender"),
      dataIndex: "gender",
      key: "gender",
    },
  ];

  const expandedRowRender = (record) => {
    const expandColumns = [
      {
        title: t("date"),
        dataIndex: "createdAt",
        key: "createdAt",
      },
      {
        title: t("dentistName"),
        dataIndex: "empName",
        key: "empName",
        render: (text, record) => `${record.empName} ${record.empLName}`,
      },
      {
        title: t("services"),
        dataIndex: "teethServiceEntities",
        key: "teethServiceEntities",
        render: (teethServiceEntities) => (
          <>
            {teethServiceEntities.map((service, index) => (
              <div key={index}>
                {`${service.teethName}-${t("tooth")}: ${service.serviceName} (${
                  service.price
                })`}
              </div>
            ))}
          </>
        ),
      },
      {
        title: t("status"),
        key: "state",
        render: (text, record) => (
          <Badge
            status={record.isServiced ? "success" : "processing"}
            text={record.isServiced ? t("finished") : t("Pending")}
          />
        ),
      },
      {
        title: t("price"),
        dataIndex: "teethServiceEntities",
        key: "price",
        render: (teethServiceEntities) =>
          teethServiceEntities.reduce(
            (total, service) => total + service.price,
            0
          ),
      },
      {
        title: t("action"),
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
              {t("pay")}
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
              {t("delete")}
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
            setExpandedRowKeys(expanded ? [record.id] : []);
          },
        }}
        rowClassName={(record) =>
          expandedRowKeys.includes(record.id)
            ? "expanded-row pointer-row"
            : "pointer-row"
        }
        dataSource={patients.map((item) => ({ ...item, key: item.id }))}
        size="middle"
        onRow={(record) => ({
          onClick: () => {
            const isExpanded = expandedRowKeys.includes(record.id);
            setExpandedRowKeys(isExpanded ? [] : [record.id]);
          },
        })}
        loading={isLoading}
      />

      <Modal
        title={t("processPayment")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
      >
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            backgroundColor: "#f6f6f6",
            borderRadius: 8,
          }}
        >
          <div>
            <strong>{t("totalAmount")}:</strong> {totalPrice.toLocaleString()}{" "}
            so'm
          </div>
          <div>
            <strong>{t("paidAlready")}:</strong> {totalPaid.toLocaleString()}{" "}
            so'm
          </div>
          <div>
            <strong>{t("remaining")}:</strong> {maxDebt.toLocaleString()} so'm
          </div>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label={t("paidValue")}
            name="paidValue"
            rules={[
              { required: true, message: t("pleaseEnterPaidValue") },
              {
                validator: (_, value) =>
                  value > maxDebt
                    ? Promise.reject(
                        new Error(t("maxDebtExceeded", { max: maxDebt }))
                      )
                    : Promise.resolve(),
              },
            ]}
          >
            <Input
              type="number"
              min={0}
              max={maxDebt}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > maxDebt) {
                  message.warning(t("maxAllowed", { max: maxDebt }));
                }
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Patients;
