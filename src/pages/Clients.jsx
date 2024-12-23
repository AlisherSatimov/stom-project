import React, { useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table } from "antd";
import Highlighter from "react-highlight-words";
import { useNavigate } from "react-router-dom";
const data = [
  {
    key: "1",
    name: "Sardor Baxromov Saidovich",
    birthday: "14/08/2004",
    gender: "MALE",
    phoneNumber: "+998975586625",
    address: "Urganch",
  },
  {
    key: "2",
    name: "Akmal Karimov Alievich",
    birthday: "01/01/1998",
    gender: "MALE",
    phoneNumber: "+998975586625",
    address: "Urganch",
  },
  {
    key: "3",
    name: "Ali Ekinov Toirovich",
    birthday: "25/08/1998",
    gender: "MALE",
    phoneNumber: "+998972541123",
    address: "Yangiariq",
  },
  {
    key: "4",
    name: "Guli Azamatova Murod qizi",
    birthday: "14/08/2000",
    gender: "FEMALE",
    phoneNumber: "+998976543210",
    address: "Xonqa",
  },
];
const Clients = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const navigate = useNavigate();

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
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: "20%",
      ...getColumnSearchProps("name"),
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
      sorter: (a, b) => a.address.length - b.address.length,
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
          <a
            className="text-green-500"
            onClick={() => navigate("/createClient")}
          >
            Create
          </a>
          <a className="text-gray-700">Update</a>
          <a className="text-red-500">Delete</a>
        </Space>
      ),
    },
  ];
  return <Table columns={columns} dataSource={data} />;
};
export default Clients;
