// import React, { useEffect, useRef, useState } from "react";
// import { SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
// import { Button, Input, Space, Table, Modal, message } from "antd";
// import Highlighter from "react-highlight-words";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const { confirm } = Modal;

// const Clients = () => {
//   const [clients, setClients] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [searchedColumn, setSearchedColumn] = useState("");
//   const searchInput = useRef(null);
//   const navigate = useNavigate();
//   const aToken = localStorage.getItem("aToken");

//   useEffect(() => {
//     if (!aToken) {
//       navigate("/login");
//       return;
//     }

//     const fetchClients = async () => {
//       try {
//         const response = await axios.get("/client", {
//           headers: {
//             Authorization: `Bearer ${aToken}`,
//           },
//         });

//         if (response && response.data) {
//           const formattedData = response.data.map((item) => ({
//             key: item.id,
//             name: `${item.name} ${item.lastName} ${item.patronymic}`,
//             birthday: item.birthday || "N/A",
//             gender: item.gender,
//             phoneNumber: item.phoneNumber || "N/A",
//             address: item.address || "N/A",
//           }));

//           setClients(formattedData);
//         }
//       } catch (error) {
//         console.error("Error fetching clients:", error);
//         alert("Failed to fetch client data. Please try again later.");
//       }
//     };

//     fetchClients();
//   }, [aToken, navigate]);

//   const handleSearch = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     setSearchText(selectedKeys[0]);
//     setSearchedColumn(dataIndex);
//   };

//   const handleReset = (clearFilters) => {
//     clearFilters();
//     setSearchText("");
//   };

//   const getColumnSearchProps = (dataIndex) => ({
//     filterDropdown: ({
//       setSelectedKeys,
//       selectedKeys,
//       confirm,
//       clearFilters,
//       close,
//     }) => (
//       <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
//         <Input
//           ref={searchInput}
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={(e) =>
//             setSelectedKeys(e.target.value ? [e.target.value] : [])
//           }
//           onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
//           style={{ marginBottom: 8, display: "block" }}
//         />
//         <Space>
//           <Button
//             type="primary"
//             onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Search
//           </Button>
//           <Button
//             onClick={() => clearFilters && handleReset(clearFilters)}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Reset
//           </Button>
//           <Button
//             type="link"
//             size="small"
//             onClick={() => {
//               confirm({
//                 closeDropdown: false,
//               });
//               setSearchText(selectedKeys[0]);
//               setSearchedColumn(dataIndex);
//             }}
//           >
//             Filter
//           </Button>
//           <Button
//             type="link"
//             size="small"
//             onClick={() => {
//               close();
//             }}
//           >
//             close
//           </Button>
//         </Space>
//       </div>
//     ),
//     filterIcon: (filtered) => (
//       <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
//     ),
//     onFilter: (value, record) =>
//       record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
//     filterDropdownProps: {
//       onOpenChange(open) {
//         if (open) {
//           setTimeout(() => searchInput.current?.select(), 100);
//         }
//       },
//     },
//     render: (text) =>
//       searchedColumn === dataIndex ? (
//         <Highlighter
//           highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
//           searchWords={[searchText]}
//           autoEscape
//           textToHighlight={text ? text.toString() : ""}
//         />
//       ) : (
//         text
//       ),
//   });

//   const handleDelete = (clientId) => {
//     confirm({
//       title: "Are you sure you want to delete this client?",
//       icon: <ExclamationCircleOutlined />,
//       content: "This action cannot be undone.",
//       okText: "Yes",
//       okType: "danger",
//       cancelText: "No",
//       onOk: async () => {
//         try {
//           const response = await axios.delete(`/client/${clientId}`, {
//             headers: {
//               Authorization: `Bearer ${aToken}`,
//             },
//           });

//           if (response.status === 200) {
//             message.success("Client deleted successfully!");
//             setClients((prev) =>
//               prev.filter((client) => client.key !== clientId)
//             );
//           } else {
//             message.error("Failed to delete client.");
//           }
//         } catch (error) {
//           console.error("Error deleting client:", error);
//           message.error("An error occurred while deleting the client.");
//         }
//       },
//       onCancel() {
//         console.log("Delete action canceled.");
//       },
//     });
//   };

//   const columns = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//       width: "20%",
//       ...getColumnSearchProps("name"),
//       render: (text, record) => (
//         <a
//           onClick={() => navigate(`/client/${record.key}`)}
//           style={{ color: "#1890ff", cursor: "pointer" }}
//         >
//           {text}
//         </a>
//       ),
//     },
//     {
//       title: "Birthday",
//       dataIndex: "birthday",
//       key: "birthday",
//       width: "10%",
//       ...getColumnSearchProps("birthday"),
//     },
//     {
//       title: "Gender",
//       dataIndex: "gender",
//       key: "gender",
//       width: "10%",
//       ...getColumnSearchProps("gender"),
//     },
//     {
//       title: "Address",
//       dataIndex: "address",
//       key: "address",
//       width: "30%",
//       ...getColumnSearchProps("address"),
//     },
//     {
//       title: "Phone Number",
//       dataIndex: "phoneNumber",
//       key: "phoneNumber",
//       width: "20%",
//       ...getColumnSearchProps("phoneNumber"),
//     },
//     {
//       title: "Action",
//       key: "operation",
//       render: (_, record) => (
//         <Space size="middle">
//           <a
//             className="text-green-500"
//             onClick={() => navigate(`/client/${record.key}/edit`)}
//           >
//             Update
//           </a>
//           <a
//             className="text-red-500"
//             onClick={() => handleDelete(record.key)}
//             style={{ cursor: "pointer" }}
//           >
//             Delete
//           </a>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <>
//       <Table columns={columns} dataSource={clients} />
//     </>
//   );
// };

// export default Clients;

// import React, { useEffect, useRef, useState } from "react";
// import { SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
// import { Button, Input, Space, Table, Modal, message } from "antd";
// import Highlighter from "react-highlight-words";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useClient } from "../context/ClientContext";

// const { confirm } = Modal;

// const Clients = () => {
//   const [clients, setClients] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [searchedColumn, setSearchedColumn] = useState("");
//   const searchInput = useRef(null);
//   const navigate = useNavigate();
//   const { setClientId } = useClient(); // Contextdan client ID ni o'rnatish uchun hook
//   const aToken = localStorage.getItem("aToken");

//   useEffect(() => {
//     if (!aToken) {
//       navigate("/login");
//       return;
//     }

//     const fetchClients = async () => {
//       try {
//         const response = await axios.get("/client", {
//           headers: {
//             Authorization: `Bearer ${aToken}`,
//           },
//         });

//         if (response && response.data) {
//           const formattedData = response.data.map((item) => ({
//             key: item.id,
//             name: `${item.name} ${item.lastName} ${item.patronymic}`,
//             birthday: item.birthday || "N/A",
//             gender: item.gender,
//             phoneNumber: item.phoneNumber || "N/A",
//             address: item.address || "N/A",
//           }));

//           setClients(formattedData);
//         }
//       } catch (error) {
//         console.error("Error fetching clients:", error);
//         alert("Failed to fetch client data. Please try again later.");
//       }
//     };

//     fetchClients();
//   }, [aToken, navigate]);

//   const handleSearch = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     setSearchText(selectedKeys[0]);
//     setSearchedColumn(dataIndex);
//   };

//   const handleReset = (clearFilters) => {
//     clearFilters();
//     setSearchText("");
//   };

//   const getColumnSearchProps = (dataIndex) => ({
//     filterDropdown: ({
//       setSelectedKeys,
//       selectedKeys,
//       confirm,
//       clearFilters,
//       close,
//     }) => (
//       <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
//         <Input
//           ref={searchInput}
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={(e) =>
//             setSelectedKeys(e.target.value ? [e.target.value] : [])
//           }
//           onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
//           style={{ marginBottom: 8, display: "block" }}
//         />
//         <Space>
//           <Button
//             type="primary"
//             onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Search
//           </Button>
//           <Button
//             onClick={() => clearFilters && handleReset(clearFilters)}
//             size="small"
//             style={{ width: 90 }}
//           >
//             Reset
//           </Button>
//         </Space>
//       </div>
//     ),
//     filterIcon: (filtered) => (
//       <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
//     ),
//     onFilter: (value, record) =>
//       record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
//     render: (text) =>
//       searchedColumn === dataIndex ? (
//         <Highlighter
//           highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
//           searchWords={[searchText]}
//           autoEscape
//           textToHighlight={text ? text.toString() : ""}
//         />
//       ) : (
//         text
//       ),
//   });

//   const handleDelete = (clientId) => {
//     confirm({
//       title: "Are you sure you want to delete this client?",
//       icon: <ExclamationCircleOutlined />,
//       content: "This action cannot be undone.",
//       okText: "Yes",
//       okType: "danger",
//       cancelText: "No",
//       onOk: async () => {
//         try {
//           const response = await axios.delete(`/client/${clientId}`, {
//             headers: {
//               Authorization: `Bearer ${aToken}`,
//             },
//           });

//           if (response.status === 200) {
//             message.success("Client deleted successfully!");
//             setClients((prev) =>
//               prev.filter((client) => client.key !== clientId)
//             );
//           } else {
//             message.error("Failed to delete client.");
//           }
//         } catch (error) {
//           console.error("Error deleting client:", error);
//           message.error("An error occurred while deleting the client.");
//         }
//       },
//       onCancel() {
//         console.log("Delete action canceled.");
//       },
//     });
//   };

//   const handleClientClick = (clientId) => {
//     setClientId(clientId); // Client ID ni Context orqali o'rnatish
//     navigate(`/clientID`); // Client sahifasiga yo'naltirish
//   };

//   const columns = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//       width: "20%",
//       ...getColumnSearchProps("name"),
//       render: (text, record) => (
//         <a
//           onClick={() => handleClientClick(record.key)}
//           style={{ color: "#1890ff", cursor: "pointer" }}
//         >
//           {text}
//         </a>
//       ),
//     },
//     {
//       title: "Birthday",
//       dataIndex: "birthday",
//       key: "birthday",
//       width: "10%",
//       ...getColumnSearchProps("birthday"),
//     },
//     {
//       title: "Gender",
//       dataIndex: "gender",
//       key: "gender",
//       width: "10%",
//       ...getColumnSearchProps("gender"),
//     },
//     {
//       title: "Address",
//       dataIndex: "address",
//       key: "address",
//       width: "30%",
//       ...getColumnSearchProps("address"),
//     },
//     {
//       title: "Phone Number",
//       dataIndex: "phoneNumber",
//       key: "phoneNumber",
//       width: "20%",
//       ...getColumnSearchProps("phoneNumber"),
//     },
//     {
//       title: "Action",
//       key: "operation",
//       render: (_, record) => (
//         <Space size="middle">
//           <a className="text-green-500">Update</a>
//           <a
//             className="text-red-500"
//             onClick={() => handleDelete(record.key)}
//             style={{ cursor: "pointer" }}
//           >
//             Delete
//           </a>
//         </Space>
//       ),
//     },
//   ];

//   return <Table columns={columns} dataSource={clients} />;
// };

// export default Clients;

// Clients.jsx
import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, Modal, message } from "antd";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useClient } from "../context/ClientContext";

const { confirm } = Modal;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const navigate = useNavigate();
  const { setClientId } = useClient(); // Contextdan client ID ni o'rnatish uchun hook
  const aToken = localStorage.getItem("aToken");

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
          const formattedData = response.data.map((item) => ({
            key: item.id,
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
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleDelete = (clientId) => {
    confirm({
      title: "Are you sure you want to delete this client?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`/client/${clientId}`, {
            headers: {
              Authorization: `Bearer ${aToken}`,
            },
          });

          if (response.status === 200) {
            message.success("Client deleted successfully!");
            setClients((prev) =>
              prev.filter((client) => client.key !== clientId)
            );
          } else {
            message.error("Failed to delete client.");
          }
        } catch (error) {
          console.error("Error deleting client:", error);
          message.error("An error occurred while deleting the client.");
        }
      },
      onCancel() {
        console.log("Delete action canceled.");
      },
    });
  };

  const handleClientClick = (clientId) => {
    if (!clientId) {
      console.error("Client ID is undefined");
      return;
    }
    setClientId(clientId); // Context orqali client ID ni o'rnatish
    navigate(`/clientID/${clientId}`); // Client sahifasiga parametr bilan yo'naltirish
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
          onClick={() => handleClientClick(record.key)}
          style={{ color: "#1890ff", cursor: "pointer" }}
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
      render: (_, record) => (
        <Space size="middle">
          <a className="text-green-500">Update</a>
          <a
            className="text-red-500"
            onClick={() => handleDelete(record.key)}
            style={{ cursor: "pointer" }}
          >
            Delete
          </a>
        </Space>
      ),
    },
  ];

  return <Table columns={columns} dataSource={clients} />;
};

export default Clients;
