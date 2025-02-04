import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, message } from "antd";
import axios from "axios";

const ServiceController = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [form] = Form.useForm();
  const aToken = localStorage.getItem("aToken");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get("/service", {
        headers: { Authorization: `Bearer ${aToken}` },
      });
      if (response.status === 200) {
        setServices(response.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Failed to fetch services.");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this service?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/service/${id}`, {
            headers: { Authorization: `Bearer ${aToken}` },
          });
          if (response.status === 200) {
            message.success("Service deleted successfully!");
            setServices((prev) => prev.filter((service) => service.id !== id));
          }
        } catch (error) {
          console.error("Error deleting service:", error);
          message.error("Failed to delete service.");
        }
      },
    });
  };

  const handleEdit = (service) => {
    setIsEditing(true);
    setSelectedService(service);
    form.setFieldsValue({
      serviceName: service.serviceName,
      price: service.price,
    });
    setIsModalOpen(true);
  };

  const handleAddService = () => {
    setIsEditing(false);
    setSelectedService(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (values) => {
    if (isEditing) {
      try {
        const response = await axios.put(
          `/service/${selectedService.id}`,
          values,
          { headers: { Authorization: `Bearer ${aToken}` } }
        );
        if (response.status === 200) {
          message.success("Service updated successfully!");
          fetchServices();
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error("Error updating service:", error);
        message.error("Failed to update service.");
      }
    } else {
      try {
        const response = await axios.post("/service", values, {
          headers: { Authorization: `Bearer ${aToken}` },
        });
        if (response.status === 200) {
          message.success("Service created successfully!");
          fetchServices();
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error("Error creating service:", error);
        message.error("Failed to create service.");
      }
    }
  };

  const columns = [
    {
      title: "Service Name",
      dataIndex: "serviceName",
      key: "serviceName",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} UZS`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="default" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: "16px", float: "right" }}
        onClick={handleAddService}
      >
        Add Service
      </Button>
      <Table columns={columns} dataSource={services} rowKey="id" />

      <Modal
        title={isEditing ? "Edit Service" : "Add Service"}
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
            label="Service Name"
            name="serviceName"
            rules={[{ required: true, message: "Please enter service name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceController;
