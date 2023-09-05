import { Table, Dropdown, Space, Button, Tag, Input, Spin } from 'antd';
import { DownOutlined, SearchOutlined, FilterOutlined, EditOutlined, FolderOpenOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const OrdersPage = () => {
  const [selectedFilters, setSelectedFilters] = useState();
  const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  
  const [loading, setLoading] = useState(true);
  const jwtToken = localStorage.getItem('token');

  const handlePaginationChange = (current, pageSize) => {
    setPagination({ ...pagination, current, pageSize });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          query Orders($pagination: PaginationArg) {
            orders(pagination: $pagination) {
              data {
                id
                attributes {
                  client {
                    data {
                      attributes {
                        client_name
                      }
                    }
                  }
                  comment
                  company {
                    data {
                      attributes {
                        name
                      }
                    }
                  }
                  createdAt
                  discount
                  currency
                  manager {
                    data {
                      attributes {
                        username
                      }
                    }
                  }
                  shippingAddress {
                    address
                    city
                    country
                    zipCode
                  }
                  totalCost
                  tax
                  status
                  deliveryAt
                }
              }
            }
          }
        `,
        variables: {
          pagination: {
            limit: 400,
          },
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const orders = response.data.data.orders.data.map((order) => ({
        ...order,
        key: order.id,
      }));

      setData(orders);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const expandedRowRender = (record) => (
    <div>
      {record.attributes.comment ? (
        <p style={{ margin: 0 }}> {record.attributes.comment}</p>
      ) : (
        <p>No comments</p>
      )}
    </div>
  );

  const isExpandable = (record) => !!record.attributes.comment;

  const handleFilterChange = (selectedFilterValues) => {
    setSelectedFilters(selectedFilterValues);
  };

  const handleStatusClick = async (orderId, newStatus) => {
    try {
      const response = await axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          mutation Mutation($updateOrderId: ID!, $data: OrderInput!) {
            updateOrder(id: $updateOrderId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateOrderId: orderId,
          data: {
            status: newStatus,
          },
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const updatedOrder = response.data.data.updateOrder.data;
      setData((prevData) =>
        prevData.map((order) =>
          order.id === updatedOrder.id ? { ...order, attributes: { ...order.attributes, status: newStatus } } : order
        )
      );

      console.log('Successfully updated order status:', response.data);
      // fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

    const items = [
    {
      key: '1',
      label: 'Open',
      icon: <FolderOpenOutlined />,
    },
    {
      key: '2',
      label: 'Edit',
      icon: <EditOutlined/>,

    },
    {
      key: '3',
      label: 'Delete',
      icon: <CloseCircleOutlined />,
      danger: true,
    },
    {
      key: '10',
      label: 'Status',
      children: [
        {
          key: 'draft',
          label: 'Draft',
        },
        {
          key: 'active',
          label: 'Active',
        },
        {
          key: 'paid',
          label: 'Paid',
        },
        {
          key: 'closed',
          label: 'Closed',
        },
      ],
    },
  ];

  const columns = [
    {
      title: 'Order Name',
      dataIndex: 'id',
      key: 'id',
      width: '200px',
      fixed: 'left',
      sorter: (a, b) => (a.id || '').localeCompare(b.id || ''),
      render: (text) => `BG Order # ${text || ''}`,
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
      onFilter: (value, record) => {
        const orderName = record.id || '';
        return orderName.toLowerCase().includes(value.toLowerCase());
      },
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
      dataIndex: ['attributes', 'status'],
      key: 'orderStatus',
      width: '120px',
      sorter: (a, b) => (a.attributes.status || '').localeCompare(b.attributes.status || ''),
      filters: [
        { text: 'Draft', value: 'Draft' },
        { text: 'Active', value: 'Active' },
        { text: 'Paid', value: 'Paid' },
        { text: 'Closed', value: 'Closed' },
      ],
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? 'blue' : '#f06d20' }} />
      ),
      onFilter: (value, record) => (record.attributes.status || '') === value,
      render: (status) => {
        let color = 'default';
  
        switch (status) {
          case 'Draft':
            color = 'grey';
            break;
          case 'Active':
            color = 'blue';
            break;
          case 'Paid':
            color = 'green';
            break;
          case 'Closed':
            color = 'gold';
            break;
          default:
            break;
        }
  
        return <Tag color={color}>{status || ''}</Tag>;
      },
    },
    {
      title: 'Created at',
      dataIndex: ['attributes', 'createdAt'],
      key: 'orderCreatedAt',
      width: '150px',
      defaultSortOrder: 'desc',
      sorter: (a, b) => (a.attributes.createdAt || '').localeCompare(b.attributes.createdAt || ''),
      render: (text) => {
        if (!text) return '';
        const date = new Date(text);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        return formattedDate;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Created at"
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
      onFilter: (value, record) => {
        const createdAt = record.attributes.createdAt || '';
        const date = new Date(createdAt);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        return formattedDate.toLowerCase().includes(value.toLowerCase());
      },
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            document.querySelector('.ant-table-filter-dropdown input')?.focus();
          }, 0);
        }
      },
    },
    {
      title: 'Delivery address',
      dataIndex: ['attributes', 'shippingAddress'],
      key: 'orderDeliveryAddress',
      width: '200px',
      render: (shippingAddress) => (
        shippingAddress
          ? `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country}, ${shippingAddress.zipCode}`
          : ''
      ),
      sorter: (a, b) => {
        const addressA = `${a.attributes.shippingAddress?.address || ''} ${a.attributes.shippingAddress?.city || ''} ${a.attributes.shippingAddress?.country || ''} ${a.attributes.shippingAddress?.zipCode || ''}`;
        const addressB = `${b.attributes.shippingAddress?.address || ''} ${b.attributes.shippingAddress?.city || ''} ${b.attributes.shippingAddress?.country || ''} ${b.attributes.shippingAddress?.zipCode || ''}`;
        return addressA.localeCompare(addressB);
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Address"
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
      onFilter: (value, record) => {
        const shippingAddress = record.attributes.shippingAddress || {};
        const address = `${shippingAddress.address || ''} ${shippingAddress.city || ''} ${shippingAddress.country || ''} ${shippingAddress.zipCode || ''}`;
        return address.toLowerCase().includes(value.toLowerCase());
      },
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            document.querySelector('.ant-table-filter-dropdown input')?.focus();
          }, 0);
        }
      },
    },
    {
      title: 'Delivery at',
      dataIndex: ['attributes', 'deliveryAt'],
      key: 'orderDeliveryAt',
      width: '150px',
      sorter: (a, b) => (a.attributes.deliveryAt || '').localeCompare(b.attributes.deliveryAt || ''),
      render: (text) => {
        if (!text) return '';
        const date = new Date(text);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        return formattedDate;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Delivery at"
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
      onFilter: (value, record) => {
        const deliveryAt = record.attributes.deliveryAt || '';
        const date = new Date(deliveryAt);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        return formattedDate.toLowerCase().includes(value.toLowerCase());
      },
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            document.querySelector('.ant-table-filter-dropdown input')?.focus();
          }, 0);
        }
      },    
    },
    {
      title: 'Price',
      dataIndex: ['attributes', 'totalCost'],
      key: 'orderPrice',
      width: '120px',
      sorter: (a, b) => (a.attributes.totalCost || 0) - (b.attributes.totalCost || 0),
      render: (text) => text || '',
    },
    {
      title: 'Discount',
      dataIndex: ['attributes', 'discount'],
      key: 'orderDiscount',
      width: '150px',
      sorter: (a, b) => {
        const discountA = String(a.attributes.discount || '');
        const discountB = String(b.attributes.discount || '');
        return discountA.localeCompare(discountB);
      },
      render: (text) => text || '',
    },
    {
      title: 'Currency',
      dataIndex: ['attributes', 'currency'],
      key: 'orderCurrency',
      width: '120px',
      sorter: (a, b) => (a.attributes.currency || '').localeCompare(b.attributes.currency || ''),
      render: (text) => text || '',
    },
    {
      title: 'Client',
      dataIndex: ['attributes', 'client', 'data', 'attributes', 'client_name'],
      key: 'orderClient',
      width: '150px',
      sorter: (a, b) => {
        const clientNameA = a.attributes?.client?.data?.attributes?.client_name || '';
        const clientNameB = b.attributes?.client?.data?.attributes?.client_name || '';
        return clientNameA.localeCompare(clientNameB);
      },
      render: (text) => text || '',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Client"
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
      onFilter: (value, record) => {
        const clientName = record.attributes?.client?.data?.attributes?.client_name || '';
        return clientName.toLowerCase().includes(value.toLowerCase());
      },
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            document.querySelector('.ant-table-filter-dropdown input')?.focus();
          }, 0);
        }
      },
    },
    {
      title: 'Manager',
      dataIndex: ['attributes', 'manager', 'data', 'attributes', 'username'],
      key: 'orderManager',
      width: '150px',
      sorter: (a, b) => {
        const usernameA = a.attributes?.manager?.data?.attributes?.username || '';
        const usernameB = b.attributes?.manager?.data?.attributes?.username || '';
        return usernameA.localeCompare(usernameB);
      },
      render: (text) => text || '',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Manager"
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
      onFilter: (value, record) => {
        const managerName = record.attributes?.manager?.data?.attributes?.username || '';
        return managerName.toLowerCase().includes(value.toLowerCase());
      },
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            document.querySelector('.ant-table-filter-dropdown input')?.focus();
          }, 0);
        }
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      key: 'operation',
      fixed: 'right',
      width: '120px',
      render: (text, record) => (
        <Space size="large">
          <Dropdown menu={
            {
              items,
              onClick: ({ key }) => {
                  if (key === 'draft') handleStatusClick(record.id, 'Draft');
                  else if (key === 'active') handleStatusClick(record.id, 'Active');
                  else if (key === 'paid') handleStatusClick(record.id, 'Paid');
                  else if (key === 'closed') handleStatusClick(record.id, 'Closed');
              }
          }
          } trigger={['click']} >
            <Button>
              <Space> Actions <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading} size="large">
      <Table
        rowSelection={{}}
        expandable={{
          expandedRowRender,
          rowExpandable: isExpandable,
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
    </Spin>
  );
};
