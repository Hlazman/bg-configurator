import { Table, Dropdown, Space, Button, Tag } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

export const OrdersPage = () => {

  const [data, setData] = useState(() => {
    const initialData = [];
      for (let i = 0; i < 100; i++) {
        initialData.push({
          key: i,
          orderName: `Edward ${i}`,
          age: 32 + i,
          status: 'draft',
          address: `London Park no. ${i}`,
          description: "This not expandable",
        });
      }
      return initialData;
    });

  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleFilterChange = (selectedFilterValues) => {
    setSelectedFilters(selectedFilterValues);
  };

  const handleActionClick = (action) => {
    if (selectedRowData) {
      setSelectedRowData((prevSelectedRowData) => ({
        ...prevSelectedRowData,
        status: action,
      }));
    }
  };

  useEffect(() => {
    if (selectedRowData) {
      setData((prevData) =>
        prevData.map((row) =>
          row.key === selectedRowData.key ? { ...selectedRowData } : row
        )
      );
    }
  }, [selectedRowData]);

  const items = [
    {
      key: '1',
      label: 'Action 1',
    },
    {
      key: '2',
      label: 'Action 2',
    },
    {
      key: '3',
      label: 'Action 3',
    },
    {
      key: '10',
      label: 'Status',
      children: [
        {
          key: 'draft',
          label: 'draft',
          onClick: () => handleActionClick('draft'),
        },
        {
          key: 'publish',
          label: 'publish',
          onClick: () => {handleActionClick('publish')},
        },
        {
          key: 'paid',
          label: 'paid',
          onClick: () => {handleActionClick('paid'); console.log(selectedRowData)},
        },
        {
          key: 'closed',
          label: 'closed',
          onClick: () => handleActionClick('closed'),
        },
      ],
    },
  ];
  
  const columns = [
    // Table.SELECTION_COLUMN,
    // Table.EXPAND_COLUMN,
    {
      title: 'Order Name',
      dataIndex: 'orderName',
      key: 'orderName',
      fixed: 'left',
      sorter: (a, b) => a.orderName.localeCompare(b.orderName),
    },
    {
      title: 'Age',
      width: 100,
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => a.age - b.age,
    },
  
    {
      title: 'Status',
      dataIndex: 'status',
      key: '1',
      sorter: (a, b) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Publish', value: 'publish' },
        { text: 'Paid', value: 'paid' },
        { text: 'Closed', value: 'closed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = 'default';
  
        switch (status) {
          case 'draft':
            color = 'grey';
            break;
          case 'publish':
            color = 'blue';
            break;
          case 'paid':
            color = 'green';
            break;
          case 'closed':
            color = 'gold';
            break;
          default:
            break;
        }
  
        return <Tag color={color}>{status}</Tag>;
      },
    },
    
    {
      title: 'Column 2',
      dataIndex: 'address',
      key: '2',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Column 3',
      dataIndex: 'address',
      key: '3',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Column 4',
      dataIndex: 'address',
      key: '4',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Column 5',
      dataIndex: 'address',
      key: '5',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Column 6',
      dataIndex: 'address',
      key: '6',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Column 7',
      dataIndex: 'address',
      key: '7',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Column 8',
      dataIndex: 'address',
      key: '8',
      sorter: (a, b) => a.age - b.age,
    },
  
    {
      title: 'Action',
      dataIndex: 'operation',
      key: 'operation',
      fixed: 'right',
      with: '80px',
      render: (text, record) => (
        <Space size="large">
          <Dropdown menu={{items}} trigger={['click']} onClick={() => setSelectedRowData(record)}>
            <Button>
              <Space> Actions <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  
  ];
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const handlePaginationChange = (current, pageSize) => {
    setPagination({ ...pagination, current, pageSize });
  };

  return (
    <Table
      rowSelection={{}}
      expandable={{
        expandedRowRender: record => (
          <p style={{ margin: 0 }}>{record.description}</p>
        ),
      }}
      columns={columns}
      dataSource={data}
      scroll={{
        x: 1500,
      }}
      sticky
      pagination={{
        ...pagination,
        position: ['topRight'],
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20', '50', '100'],
        onChange: handlePaginationChange,
      }}
      filters={selectedFilters}
      onFilterChange={handleFilterChange}
    />
  );
};
