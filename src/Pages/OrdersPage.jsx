import { Table, Dropdown, Space, Button, Input, Spin, Modal, message, Divider } from 'antd';
import { 
  DownOutlined, SearchOutlined, EditOutlined, FolderOpenOutlined, CloseCircleOutlined, PlusCircleOutlined, FileDoneOutlined, CopyOutlined 
} from '@ant-design/icons';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useOrder } from '../Context/OrderContext';
import { useSelectedCompany } from '../Context/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import { useTotalOrder } from '../Context/TotalOrderContext';
import { dublicateOrder } from '../api/dublicateOrder'
import { deleteOrderWithSuborders } from '../api/deleteOrderWithSuborders'

export const OrdersPage = () => {
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
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { selectedCompany } = useSelectedCompany();
  const { totalOrderId } = useTotalOrder();

  const isBoss = ['1', '2', '4'];

  const handlePaginationChange = (current, pageSize) => {
    setPagination({ ...pagination, current, pageSize });
  };

  const navigate = useNavigate();
  const { setOrderId } = useOrder();

  const handleEditOrder = (orderID) => {
  setOrderId(orderID)
  navigate(`/editorder`); 
};

const handleOpenOrder = (orderID) => {
  setOrderId(orderID)
  localStorage.setItem('presentation', 'singleOrder');
  navigate(`/order/${orderID}`);
};

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://api.boki.fortesting.com.ua/graphql', {
        query: `
          query Orders($pagination: PaginationArg, $filters: OrderFiltersInput) {
            orders(pagination: $pagination, filters: $filters) {
              data {
                id
                attributes {
                  door_suborder {
                    data {
                      attributes {
                        door {
                          data {
                            attributes {
                              product_properties {
                                title
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  comment
                  createdAt
                  currency
                  manager {
                    data {
                      attributes {
                        username
                      }
                    }
                  }
                  totalCost
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
            },
            total_order: {
              id: {
                eq: totalOrderId ? totalOrderId : localStorage.getItem('TotalOrderId'),
              }
            }, 
          },
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const orders = response?.data?.data?.orders?.data.map((order) => ({
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

  const deleteOrder = async (orderId) => {
    try {
      await deleteOrderWithSuborders(orderId, jwtToken);
      messageApi.success(`${language.successDelete}`);
      await fetchData();

    } catch (error) {
      messageApi.error(`${language.errorDelete}`);
      console.log(error)
    } finally {
      setDeleteOrderId(null);
    }
  };

  // const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // const checkNewOrder = async () => {
  //   console.log('selectedRowKeys', selectedRowKeys);
  //   const lastAddedRow = data[data.length-1]; 
  //   const lastAddedRowKey = lastAddedRow.id;
  //   setSelectedRowKeys([lastAddedRowKey]);
  // }

  const handleDublicate = async (id) => {
    setLoading(true);
    await dublicateOrder(id, jwtToken, totalOrderId, selectedCompany, user);
    await fetchData();
    // await checkNewOrder();
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompany, totalOrderId]);

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

    const items = [
    {
      key: 'openOrder',
      label: `${language.open}`,
      icon: <FolderOpenOutlined />,
    },
    {
      key: 'editOrder',
      label: `${language.edit}`,
      icon: <EditOutlined/>,

    },
    {
      key: 'dublicate',
      label: `${language.dublicate}`,
      icon: <CopyOutlined />,
    },
    {
      key: 'deleteOrder',
      label: `${language.delete}`,
      icon: <CloseCircleOutlined />,
      danger: true,
    },
  ];

  const columns = [
    {
      title: `${language.order}`,
      dataIndex: 'id',
      key: 'id',
      width: '150px',
      fixed: 'left',
      sorter: (a, b) => (a.id || '').localeCompare(b.id || ''),
      render: (text) => `BG Order # ${text || ''}`,
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
      title: `${language.door} ${language.title}`,
      dataIndex: ['attributes', 'door_suborder', 'data', 'attributes', 'door', 'data', 'attributes', 'product_properties', 'title'],
      key: 'orderClient',
      width: '150px',
      sorter: (a, b) => {
        const doorTitleA = a.attributes?.door_suborder?.data?.attributes?.door?.data?.attributes?.product_properties?.title || '';
        const doorTitleB = b.attributes?.door_suborder?.data?.attributes?.door?.data?.attributes?.product_properties?.title || '';
        return doorTitleA.localeCompare(doorTitleB);
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
        const doorName = record.attributes?.door_suborder?.data?.attributes?.door?.data?.attributes?.product_properties?.title || '';
        return doorName.toLowerCase().includes(value.toLowerCase());
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
      title: `${language.createdAt}`,
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
      title: `${language.price} €`,
      dataIndex: ['attributes', 'totalCost'],
      key: 'orderPrice',
      width: '120px',
      sorter: (a, b) => (a.attributes.totalCost || 0) - (b.attributes.totalCost || 0),
      render: (text) => text || '',
    },
    {
      title: `${language.currency}`,
      dataIndex: ['attributes', 'currency'],
      key: 'orderCurrency',
      width: '80px',
      sorter: (a, b) => (a.attributes.currency || '').localeCompare(b.attributes.currency || ''),
      render: (text) => text || '',
    },
    {
      title: `${language.manager}`,
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
                  if (key === 'deleteOrder') setDeleteOrderId(record.id);
                  else if (key === 'editOrder') handleEditOrder(record.id);
                  else if (key === 'openOrder') handleOpenOrder(record.id);
                  else if (key === 'dublicate') handleDublicate(record.id);
                  
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
    <div style={{display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'space-between' }}>
      {contextHolder}

      <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => navigate(`/createorder/`)}>
          {language.addOrder}
      </Button>
      
      <div style={{display: 'flex', gap: '20px'}}>
        <Button
          type="primary"
          icon={<FileDoneOutlined />}
          onClick={() => {
            localStorage.setItem('presentation', 'full');
            navigate('/totalorderdetails')}
          }
        >
          {language.fullPresentation}
        </Button>

        <Button 
          type="primary" 
          icon={<FileDoneOutlined />} 
          onClick={() => {
            localStorage.setItem('presentation', 'short');
            navigate('/totalorderdetails')}
          }
        >
            {language.shortPresentation}
        </Button>

        {isBoss.includes(user.id) && (
        <Button 
          type="primary" 
          icon={<FileDoneOutlined />} 
          onClick={() => {
            localStorage.setItem('presentation', 'factory');
            navigate('/totalorderdetails')}
          }
        >
            {language.factory}
        </Button>
        )}
        
      </div>
    </div>
    
      <Divider/>
      <Spin spinning={loading} size="large">
        <Table
          rowSelection={{}}
          // rowSelection={{
          //   type: 'checkbox',
          //   selectedRowKeys,
          //   onChange: (keys) => {
          //     setSelectedRowKeys(keys);
          //   },
          // }}
          expandable={{
            expandedRowRender,
            rowExpandable: isExpandable,
          }}
          columns={columns}
          dataSource={data}
          // scroll={{
          //   x: 1500,
          // }}
          // sticky
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
        open={deleteOrderId !== null}
        onOk={() => deleteOrder(deleteOrderId)}
        onCancel={() => setDeleteOrderId(null)}
        okText={`${language.yes}`}
        cancelText={`${language.cancel}`}
      >
        <p>{language.undone}</p>
      </Modal>
    </>
  );
};
