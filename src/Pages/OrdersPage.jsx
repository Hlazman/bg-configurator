import { Table, Dropdown, Space, Button, Tag, Input } from 'antd';
import { DownOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

export const OrdersPage = () => {

  const [data, setData] = useState(() => {
    const initialData = [];
    const currentDate = new Date();
      for (let i = 0; i < 100; i++) {
        initialData.push({
          key: i,
          orderName: `Edward ${i}`,
          orderStatus: 'draft',
          orderDateCreated: currentDate.toLocaleString(),
          orderDeliveryAddress: `London Park no. ${i}`,
          orderDeliveryAt: currentDate.toLocaleString(),
          // orderUpdateAt: currentDate.toLocaleString(),
          orderCreateBy: `Edward ${i}`,
          orderPrice: 100 + i,
          orderDiscount: '10%',
          orderCurrency: '$',
          orderComments: "This some text for order comment",
          milestones: [
            {'Publish': ''},
            {'Paid': ''},
            {'Closed': ''},
          ]
        });
      }
      return initialData;
    });

  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const expandedRowRender = (record) => (
    <div>
      {record.milestones.map((milestone, index) => (
        <p key={index} style={{ margin: 0}}>
          <span style={{ margin: 0, color: '#f06d20'}}> {Object.keys(milestone)[0]}: </span> 
          <span> {Object.values(milestone)[0]} </span>
        </p>
      ))}
    </div>
  );

  const handleFilterChange = (selectedFilterValues) => {
    setSelectedFilters(selectedFilterValues);
  };

  const handleActionClick = (action) => {
    if (selectedRowData) {
      const currentDate = new Date().toLocaleString();
      const updatedMilestones = selectedRowData.milestones.map((milestone) => {
        switch (action) {
          case 'publish':
            return { ...milestone, 'Publish': currentDate };
          case 'paid':
            return { ...milestone, 'Paid': currentDate };
          case 'closed':
            return { ...milestone, 'Closed': currentDate };
          default:
            return milestone;
        }
      });
  
      setSelectedRowData((prevSelectedRowData) => ({
        ...prevSelectedRowData,
        orderStatus: action,
        milestones: updatedMilestones,
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
          onClick: () => {handleActionClick('paid')},
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
    {
      title: 'Order Name',
      dataIndex: 'orderName',
      key: 'orderName',
      width: '200px',
      fixed: 'left',
      sorter: (a, b) => a.orderName.localeCompare(b.orderName),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Order Name"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'blue' : '#f06d20' }} />
      ),
      onFilter: (value, record) => record.orderName.toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            document.querySelector('.ant-table-filter-dropdown input')?.focus();
          }, 0);
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: '120px',
      sorter: (a, b) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Publish', value: 'publish' },
        { text: 'Paid', value: 'paid' },
        { text: 'Closed', value: 'closed' },
      ],
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? 'blue' : '#f06d20'}} />
      ),
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
      title: 'Created at',
      dataIndex: 'orderDateCreated',
      key: 'orderCreateAt',
      width: '150px',
      sorter: (a, b) => a.createAt - b.createAt,
    },
    {
      title: 'Delivery address',
      dataIndex: 'orderDeliveryAddress',
      key: 'orderDeliveryAddress',
      width: '200px',
      sorter: (a, b) => a.DeliveryAddress.localeCompare(b.DeliveryAddress),
    },
    {
      title: 'Delivery at',
      dataIndex: 'orderDeliveryAt',
      key: 'orderDeliveryAt',
      width: '150px',
      sorter: (a, b) => a.deliveryAt - b.deliveryAt,
    },
    {
      title: 'Created by',
      dataIndex: 'orderCreateBy',
      key: 'orderCreateBy',
      width: '150px',
      sorter: (a, b) => a.orderCreateBy.localeCompare(b.orderCreateBy),
    },
    {
      title: 'Price',
      dataIndex: 'orderPrice',
      key: 'orderPrice',
      width: '120px',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Discount',
      dataIndex: 'orderDiscount',
      key: 'orderDiscount',
      width: '150px',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Currency',
      dataIndex: 'orderCurrency',
      key: 'orderCurrency',
      width: '120px',
      sorter: (a, b) => a.orderCurrency.localeCompare(b.orderCurrency),
    },
    {
      title: 'Comments',
      dataIndex: 'orderComments',
      key: 'orderComments',
      width: '350px',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      key: 'operation',
      fixed: 'right',
      width: '120px',
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
      expandable={{expandedRowRender}}
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
