import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Dropdown, Space, Button, Input, Spin } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const ClientsPage = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Query {
                clients {
                  data {
                    id
                    attributes {
                      addresses {
                        address
                        city
                        country
                        zipCode
                      }
                      client_company
                      client_name
                      company {
                        data {
                          attributes {
                            name
                          }
                        }
                      }
                      contacts {
                        email
                        phone
                        phone_2
                      }
                      manager {
                        data {
                          attributes {
                            username
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const clientsWithKeys = response.data.data.clients.data.map((client) => ({
          ...client,
          key: client.id,
        }));

        setClients(clientsWithKeys);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jwtToken) {
      fetchData();
    }
  }, []);

  const handlePaginationChange = (pagination) => {
    setPagination(pagination);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
  };

  const navigate = useNavigate();

  const handleEditClient = (clientId) => {
    navigate(`/editclient/${clientId}`);
  };

  const columns = [
    {
      title: 'Client',
      dataIndex: ['attributes', 'client_name'],
      key: 'attributes.client_name',
      width: '200px',
      fixed: 'left',
      sorter: (a, b) => a.attributes.client_name.localeCompare(b.attributes.client_name),
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
      onFilter: (value, record) => record.attributes.client_name.toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => {
            document.querySelector('.ant-table-filter-dropdown input')?.focus();
          }, 0);
        }
      },
    },
    {
      title: 'Organization',
      dataIndex: ['attributes', 'client_company'],
      key: 'attributes.client_company',
      sorter: (a, b) => {
        const orgA = (a.attributes.client_company || '').toLowerCase();
        const orgB = (b.attributes.client_company || '').toLowerCase();
        return orgA.localeCompare(orgB);
      },
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
        const org = (record.attributes.client_company || '').toLowerCase();
        return org.includes(value.toLowerCase());
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
      title: 'Email',
      dataIndex: ['attributes', 'contacts', 'email'],
      key: 'attributes.contacts.email',
    },
    {
      title: 'Phone',
      dataIndex: ['attributes', 'contacts'],
      key: 'attributes.contacts.phone',
      render: (contacts, record) => (
        <span>
          {contacts && contacts.phone && (
            <p>{contacts.phone}</p>
          )}
          {contacts && contacts.phone_2 && (
            <p style={{ marginLeft: 8 }}>{contacts.phone_2}</p>
          )}
        </span>
      ),
    },
    {
      title: 'Addresses',
      dataIndex: ['attributes', 'addresses'],
      key: 'addresses',
      width: '300px',
      render: (addresses) => (
        <div>
          {addresses && addresses.length > 0 ? (
            showAllAddresses ? (
              <ul>
                {addresses.map((address, index) => (
                  <li key={index}>
                    <span> {address?.zipCode + ','}</span>
                    <span> {address?.city + ','}</span>
                    <span> {address?.country + ','};</span>
                    <span> {address?.address + ','};</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul>
                <li>
                  <span> {addresses[0]?.zipCode + ','}</span>
                  <span> {addresses[0]?.city + ','}</span>
                  <span> {addresses[0]?.country + ','}</span>
                  <span> {addresses[0]?.address + ','}</span>
                </li>
              </ul>
            )
          ) : (
            <p></p>
          )}
          {addresses && addresses.length > 1 && (
            <Button type='link' onClick={() => setShowAllAddresses(!showAllAddresses)}>
              {showAllAddresses ? 'Скрыть адреса' : 'Показать еще'}
            </Button>
          )}
        </div>
      ),
    },
    {
      title: 'Manager',
      dataIndex: ['attributes', 'manager', 'data', 'attributes', 'username'],
      key: 'attributes.manager.data.attributes.username',
    },
    {
      title: 'Company by',
      dataIndex: ['attributes', 'company', 'data', 'attributes', 'name'],
      key: 'attributes.company.data.attributes.name',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      key: 'operation',
      fixed: 'right',
      width: '120px',
      // render: () => (
      //   <Space size="large">
      //     <Dropdown menu={{items}} trigger={['click']}>
      //       <Button>
      //         <Space> Actions <DownOutlined />
      //         </Space>
      //       </Button>
      //     </Dropdown>
      //   </Space>
      // ),
      render: (_, record) => (
        <Space size="large">
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: 'Edit',
                  onClick: () => handleEditClient(record.id), // Передаем record.id вместо clientId
                },
                {
                  key: '2',
                  label: 'Delete',
                },
              ],
            }}
            trigger={['click']}
          >
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
    <div>
      <Spin spinning={loading} size="large">
        <Table
          rowSelection={{}}
          columns={columns}
          dataSource={clients}
          pagination={{
            ...pagination,
            position: ['topRight'],
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50', '100'],
            onChange: handlePaginationChange,
          }}
          filters={selectedFilters}
          onFilterChange={handleFilterChange}
          scroll={{
            x: 1500,
          }}
          sticky
        />
      </Spin>
    </div>
  );
};
