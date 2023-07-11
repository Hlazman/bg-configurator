import { Table, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useState } from 'react';

const items = [
  {
    key: '1',
    label: 'Action 1',
  },
  {
    key: '2',
    label: 'Action 2',
  },
];

const columns = [
  // Table.SELECTION_COLUMN,
  // Table.EXPAND_COLUMN,
  {
    title: 'Full Name',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: 'Age',
    width: 100,
    dataIndex: 'age',
    key: 'age',
    sorter: (a, b) => a.age - b.age,
  },
  {
    title: 'Column 1',
    dataIndex: 'address',
    key: '1',
    sorter: (a, b) => a.age - b.age,
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
    render: () => (
      <Space size="large">
        <Dropdown menu={{items}}>
          <p>Actions <DownOutlined /> </p>
        </Dropdown>
      </Space>
    ),
  },
];

const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edward ${i}`,
    age: 32+i,
    address: `London Park no. ${i}`,
    description: "This not expandable"
  });
}

export const OrdersPage = () => {
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
        marginTop: '20px',
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
    />
  );
};