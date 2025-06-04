// Import necessary libraries and hooks
import { Table, Button, Space, Modal, Form, Input, message, Spin } from "antd";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance"; // Custom axios instance
import { useTranslation } from "react-i18next";

const ServiceController = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility
  const [isEditing, setIsEditing] = useState(false); // Edit/Add mode
  const [selectedService, setSelectedService] = useState(null); // Editing target
  const [form] = Form.useForm(); // Ant Design form instance

  const queryClient = useQueryClient(); // Access query cache client

  // Fetch all services using React Query
  const {
    data: services,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await axios.get("/service");
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Mutation to delete a service
  const deleteService = useMutation({
    mutationFn: (id) => axios.delete(`/service/passive-delete/${id}`),
    onSuccess: () => {
      message.success(t("serviceDeleted"));
      queryClient.invalidateQueries(["services"]);
    },
    onError: () => message.error(t("serviceDeleteFail")),
  });

  // Mutation to create a new service
  const createService = useMutation({
    mutationFn: (data) => axios.post("/service", data),
    onSuccess: () => {
      message.success(t("serviceCreated"));
      queryClient.invalidateQueries(["services"]);
    },
    onError: () => message.error(t("serviceCreateFail")),
  });

  // Mutation to update a service
  const updateService = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/service/${id}`, data),
    onSuccess: () => {
      message.success(t("serviceUpdated"));
      queryClient.invalidateQueries(["services"]);
    },
    onError: () => message.error(t("serviceUpdateFail")),
  });

  // Modal open for new service
  const handleAddService = () => {
    setIsEditing(false);
    setSelectedService(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // Modal open for editing
  const handleEdit = (service) => {
    setIsEditing(true);
    setSelectedService(service);
    form.setFieldsValue(service);
    setIsModalOpen(true);
  };

  // Modal submit handler (create or update)
  const handleModalSubmit = async (values) => {
    const price = Number(values.price);
    const expense = Number(values.expense);

    if (isNaN(price) || isNaN(expense)) {
      message.error(t("invalidPriceOrExpense"));
      return;
    }

    const payload = {
      ...values,
      price,
      expense,
    };

    try {
      if (isEditing) {
        if (!selectedService?.id) {
          message.error(t("serviceIdNotFound"));
          return;
        }

        await updateService.mutateAsync({
          id: selectedService.id,
          data: payload,
        });
      } else {
        await createService.mutateAsync(payload);
      }

      // Modalni yopish va forma yangilash
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Submit error:", error);
      message.error(t("serviceSubmitFail"));
    }
  };

  // Delete confirmation modal
  const handleDelete = (id) => {
    Modal.confirm({
      title: t("confirmDeleteService"),
      content: t("cannotBeUndone"),
      okText: t("yes"),
      okType: "danger",
      cancelText: t("no"),
      onOk: () => deleteService.mutate(id),
    });
  };

  // Confirm modal OK
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => handleModalSubmit(values))
      .catch((err) => console.error("Validation Error:", err));
  };

  // Define columns for Ant Design table
  const columns = [
    {
      title: t("serviceName"),
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: t("price"),
      dataIndex: "price",
      key: "price",
      render: (value) => `${value.toLocaleString()} UZS`,
    },
    {
      title: t("expense"),
      dataIndex: "expense",
      key: "expense",
      render: (value) => `${value.toLocaleString()} UZS`,
    },
    {
      title: t("action"),
      key: "action",
      align: "right",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>{t("edit")}</Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            {t("delete")}
          </Button>
        </Space>
      ),
    },
  ];

  // Render loading state
  if (isLoading) return <Spin spinning={true} />;

  // Render error state
  if (isError) return message.error(t("loadServicesFail"));

  return (
    <div>
      <Button
        type="primary"
        onClick={handleAddService}
        style={{ float: "right", marginBottom: "16px" }}
      >
        {t("addService")}
      </Button>

      <Table columns={columns} dataSource={services} rowKey="id" />

      <Modal
        title={isEditing ? t("editService") : t("addService")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
        okText={t("yes")}
        cancelText={t("no")}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("serviceName")}
            name="serviceName"
            rules={[{ required: true, message: t("pleaseEnterServiceName") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t("price")}
            name="price"
            rules={[{ required: true, message: t("pleaseEnterPrice") }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label={t("expense")}
            name="expense"
            rules={[{ required: true, message: t("pleaseEnterExpense") }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceController;
