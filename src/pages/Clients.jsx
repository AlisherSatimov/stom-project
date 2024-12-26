import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Modal } from "antd";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Clients = () => {
  const [clients, setClients] = useState([]); // Store clients data
  const [searchText, setSearchText] = useState(""); // For search functionality
  const [searchedColumn, setSearchedColumn] = useState(""); // For search functionality
  const [selectedClient, setSelectedClient] = useState(null); // For storing the selected client for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal visibility
  const searchInput = useRef(null);
  const navigate = useNavigate();
  const aToken = localStorage.getItem("aToken"); // Fetch token from localStorage

  useEffect(() => {
    if (!aToken) {
      navigate("/login");
      return;
    }

    const fetchClients = async () => {
      try {
        const response = await axios.get("/client", {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        });

        if (response && response.data) {
          // Jadval uchun ma'lumotlarni moslashtirish
          const formattedData = response.data.map((item) => ({
            key: item.id, // Jadval uchun unique key
            name: `${item.name} ${item.lastName} ${item.patronymic}`,
            birthday: item.birthday || "N/A",
            gender: item.gender,
            phoneNumber: item.phoneNumber || "N/A",
            address: item.address || "N/A",
          }));

          setClients(formattedData);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        alert("Failed to fetch client data. Please try again later.");
      }
    };

    fetchClients();
  }, [aToken, navigate]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleNameClick = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true); // Changed from setIsModalVisible to setIsModalOpen
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Changed from setIsModalVisible to setIsModalOpen
    setSelectedClient(null);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
      render: (text, record) => (
        <a
          onClick={() => handleNameClick(record)}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
      key: "birthday",
      width: "10%",
      ...getColumnSearchProps("birthday"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: "10%",
      ...getColumnSearchProps("gender"),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: "30%",
      ...getColumnSearchProps("address"),
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: "20%",
      ...getColumnSearchProps("phoneNumber"),
    },
    {
      title: "Action",
      key: "operation",
      render: () => (
        <Space size="middle">
          <a className="text-green-500">Update</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={clients} />
      <Modal
        title="Client Details"
        open={isModalOpen} // Changed from visible to open
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedClient && (
          <div>
            <p>
              <strong>Name:</strong> {selectedClient.name}
            </p>
            <p>
              <strong>Birthday:</strong> {selectedClient.birthday}
            </p>
            <p>
              <strong>Gender:</strong> {selectedClient.gender}
            </p>
            <p>
              <strong>Phone Number:</strong> {selectedClient.phoneNumber}
            </p>
            <p>
              <strong>Address:</strong> {selectedClient.address}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Clients;
