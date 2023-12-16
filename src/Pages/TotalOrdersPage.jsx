import { Table, Dropdown, Space, Button, Tag, Input, Spin, Modal, message } from 'antd';
import { DownOutlined, SearchOutlined, FilterOutlined, EditOutlined, FolderOpenOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useTotalOrder } from '../Context/TotalOrderContext';
import { useSelectedCompany } from '../Context/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import { deleteTotalOrderWithOrders } from '../api/deleteTotalOrderWithOrders'

export const TotalOrdersPage = () => {
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const [selectedFilters, setSelectedFilters] = useState();
  const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  
  const [loading, setLoading] = useState(true);
  const jwtToken = localStorage.getItem('token');
  const { user } = useContext(AuthContext);
  const [deleteTotalOrderId, setDeleteTotalOrderId] = useState(null);
  const { selectedCompany } = useSelectedCompany();
  const navigate = useNavigate();
  const { setTotalOrderId } = useTotalOrder();
  const [messageApi, contextHolder] = message.useMessage();

  const handlePaginationChange = (current, pageSize) => {
    setPagination({ ...pagination, current, pageSize });
  };

  const handleEditTotalOrder = (totalOrderID) => {
  setTotalOrderId(totalOrderID)
  navigate(`/edittotalorder`);
};

const handleOpenTotalOrder = (totalOrderID) => {
  setTotalOrderId(totalOrderID)
  localStorage.setItem('TotalOrderId', totalOrderID);
  navigate(`/orders`);
};

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          query TotalOrders($pagination: PaginationArg, $filters: TotalOrderFiltersInput) {
            totalOrders(pagination: $pagination, filters: $filters) {
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
                  title
                  company {
                    data {
                      attributes {
                        name
                      }
                    }
                  }
                  createdAt
                  discount
                  contacts {
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
          filters: {
            company: {
              id: {
                eq: selectedCompany,
              }
            }
          },
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const totalOrders = response?.data?.data?.totalOrders?.data?.map((totalorder) => ({
        ...totalorder,
        key: totalorder.id,
      }));

      setData(totalOrders);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const deleteTotalOrder = async (totalOrderId) => {
    try {
      await deleteTotalOrderWithOrders(totalOrderId, jwtToken);
      messageApi.success(`${language.successDelete}`);
      await fetchData();

    } catch (error) {
      messageApi.error(`${language.errorDelete}`);
      console.log(error)
    } finally {
      setDeleteTotalOrderId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompany]);

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

  const handleStatusClick = async (totalOrderId, newStatus) => {
    try {
      const response = await axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          mutation Mutation($updateTotalOrderId: ID!, $data: TotalOrderInput!) {
            updateTotalOrder(id: $updateTotalOrderId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateTotalOrderId: totalOrderId,
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

      // const updatedTotalOrder = response.data.data.updateTotalOrder.data;
      // setData((prevData) =>
      //   prevData.map((totalOrder) =>
      //     totalOrder.id === updatedTotalOrder.id ? { ...totalOrder, attributes: { ...totalOrder.attributes, status: newStatus } } : totalOrder
      //   )
      // );
      
      console.log(totalOrderId)
      setData((prevData) =>
      prevData.map((totalOrder) =>
        totalOrderId === totalOrder.id ? { ...totalOrder, attributes: { ...totalOrder.attributes, status: newStatus } } : totalOrder
      )
    );

    } catch (error) {
      console.error('Error updating totalOrder status:', error);
    }
  };

    const items = [
    {
      key: 'openTotalOrder',
      label: `${language.open}`,
      icon: <FolderOpenOutlined />,
    },
    {
      key: 'editTotalOrder',
      label: `${language.edit}`,
      icon: <EditOutlined/>,

    },
    {
      key: 'deleteTotalOrder',
      label: `${language.delete}`,
      icon: <CloseCircleOutlined />,
      danger: true,
    },
    {
      key: '10',
      label: `${language.status}`,
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
      title: `${language.order}`,
      dataIndex: ['attributes', 'title'],
      key: 'title',
      width: '200px',
      fixed: 'left',
      sorter: (a, b) => (a.attributes.title || '').localeCompare(b.attributes.title || ''),
      render: (text) => `${text || ''}`,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={language.search}
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
              {language.search}
            </Button>
            <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
              {language.reset}
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'blue' : '#f06d20' }} />
      ),
      onFilter: (value, record) => {
        const totalOrderName = record.attributes.title || '';
        return totalOrderName.toLowerCase().includes(value.toLowerCase());
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
      title: `${language.status}`,
      dataIndex: ['attributes', 'status'],
      key: 'totalOrderStatus',
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
      title: `${language.createdAt}`,
      dataIndex: ['attributes', 'createdAt'],
      key: 'totalOrderCreatedAt',
      width: '150px',
      defaultSortToatlOrder: 'desc',
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
            placeholder={language.search}
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
              {language.search}
            </Button>
            <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
              {language.reset}
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
      title: `${language.deliveryAddress}`,
      dataIndex: ['attributes', 'contacts'],
      key: 'totalOrderDeliveryAddress',
      width: '200px',
      render: (contacts) => (
        contacts
          ? `${contacts.address || ''}${contacts.city ? `, ${contacts.city}` : ''}${contacts.country ? `, ${contacts.country}` : ''}${contacts.zipCode ? `, ${contacts.zipCode}` : ''}`
          : ''
      ),
      sorter: (a, b) => {
        const addressA = `${a.attributes.contacts?.address || ''} ${a.attributes.contacts?.city || ''} ${a.attributes.contacts?.country || ''} ${a.attributes.contacts?.zipCode || ''}`;
        const addressB = `${b.attributes.contacts?.address || ''} ${b.attributes.contacts?.city || ''} ${b.attributes.contacts?.country || ''} ${b.attributes.contacts?.zipCode || ''}`;
        return addressA.localeCompare(addressB);
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={language.search}
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
              {language.search}
            </Button>
            <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
              {language.reset}
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'blue' : '#f06d20' }} />
      ),
      onFilter: (value, record) => {
        const contacts = record.attributes.contacts || {};
        const address = `${contacts.address || ''} ${contacts.city || ''} ${contacts.country || ''} ${contacts.zipCode || ''}`;
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
      title: `${language.deliveryAt}`,
      dataIndex: ['attributes', 'deliveryAt'],
      key: 'tottalOrderDeliveryAt',
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
            placeholder={language.search}
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
              {language.search}
            </Button>
            <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
              {language.reset}
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
      title: `${language.price} €`,
      dataIndex: ['attributes', 'totalCost'],
      key: 'totalOrderPrice',
      width: '120px',
      sorter: (a, b) => (a.attributes.totalCost || 0) - (b.attributes.totalCost || 0),
      render: (text) => text || '',
    },
    {
      title: `${language.discount}`,
      dataIndex: ['attributes', 'discount'],
      key: 'tottalOrderDiscount',
      width: '150px',
      sorter: (a, b) => {
        const discountA = String(a.attributes.discount || '');
        const discountB = String(b.attributes.discount || '');
        return discountA.localeCompare(discountB);
      },
      render: (text) => text || '',
    },
    {
      title: `${language.client}`,
      dataIndex: ['attributes', 'client', 'data', 'attributes', 'client_name'],
      key: 'totalOrderClient',
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
            placeholder={language.search}
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
              {language.search}
            </Button>
            <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
              {language.reset}
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
      title: `${language.action}`,
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
                  else if (key === 'deleteTotalOrder') setDeleteTotalOrderId(record.id);
                  else if (key === 'editTotalOrder') handleEditTotalOrder(record.id);
                  else if (key === 'openTotalOrder') handleOpenTotalOrder(record.id);
              }
          }
          } trigger={['click']} >
            <Button>
               {language.actions} <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Spin spinning={loading} size="large">
        {contextHolder}
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

      <Modal
        title={`${language.removeData} ${user.username}?`}
        open={deleteTotalOrderId !== null}
        onOk={() => deleteTotalOrder(deleteTotalOrderId)}
        onCancel={() => setDeleteTotalOrderId(null)}
        okText={`${language.yes}`}
        cancelText={`${language.cancel}`}
      >
        <p>{language.undone}</p>
      </Modal>
    </>
  );
};
