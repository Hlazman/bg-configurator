import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { Table, Dropdown, Space, Button, Input, Spin, Modal, message } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import { useSelectedCompany } from '../Context/CompanyContext';

export const ClientsPage = () => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const [deleteClientId, setDeleteClientId] = useState(null);
  const { user } = useContext(AuthContext);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];
  const { selectedCompany } = useSelectedCompany();
  const jwtToken = localStorage.getItem('token');

  const handleDeleteClient = async () => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation Mutation($deleteClientId: ID!) {
              deleteClient(id: $deleteClientId) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            deleteClientId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      if (response.data.data.deleteClient) {
        message.success(`${language.successDelete}`);
        fetchData();
      }
    } catch (error) {
      message.error(`${language.errorDelete}`);
    } finally {
      setDeleteClientId(null);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
          query Query($filters: ClientFiltersInput, $pagination: PaginationArg) {
            clients(filters: $filters, pagination: $pagination) {
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
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const clientsWithKeys = response?.data?.data?.clients?.data?.map((client) => ({
        ...client,
        key: client.id,
      }));

      setClients(clientsWithKeys);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [jwtToken, selectedCompany]);

  useEffect(() => {
    if (jwtToken) {
      fetchData();
    }
  }, [jwtToken, fetchData]);

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
      title: `${language.client}`,
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
      title: `${language.organization}`,
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
      title: `${language.phone}`,
      dataIndex: ['attributes', 'contacts'],
      key: 'attributes.contacts.phone',
      render: (contacts, record) => (
        <span>
          {contacts && contacts.phone && (
            <p>{contacts.phone}</p>
          )}
          {contacts && contacts.phone_2 && (
            <p>{contacts.phone_2}</p>
          )}
        </span>
      ),
    },
    {
      title: `${language.addresses}`,
      dataIndex: ['attributes', 'addresses'],
      key: 'addresses',
      width: '300px',
      render: (addresses) => (
        <div>
          {addresses && addresses.length > 0 ? (
            showAllAddresses ? (
              <>
                {addresses.map((address, index) => (
                  <div key={index}>
                    <span> {address?.zipCode && address.zipCode + ','}</span>
                    <span> {address?.city && address.city + ','}</span>
                    <span> {address?.country && address.country + ','}</span>
                    <span> {address?.address && address.address + ','}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div>
                  <span> {addresses[0]?.zipCode && addresses[0].zipCode + ','}</span>
                  <span> {addresses[0]?.city && addresses[0].city + ','}</span>
                  <span> {addresses[0]?.country && addresses[0].country + ','}</span>
                  <span> {addresses[0]?.address && addresses[0].address + ','}</span>
                </div>
              </>
            )
          ) : (
            <p></p>
          )}
          {addresses && addresses.length > 1 && (
            <Button type='link' onClick={() => setShowAllAddresses(!showAllAddresses)}>
              {showAllAddresses ? `${language.hideAddresses}` : `${language.showAddresses}`}
            </Button>
          )}
        </div>
      ),
    },
    {
      title: `${language.manager}`,
      dataIndex: ['attributes', 'manager', 'data', 'attributes', 'username'],
      key: 'attributes.manager.data.attributes.username',
    },
    {
      title: `${language.companyBy}`,
      dataIndex: ['attributes', 'company', 'data', 'attributes', 'name'],
      key: 'attributes.company.data.attributes.name',
    },
    {
      title: `${language.action}`,
      dataIndex: 'operation',
      key: 'operation',
      fixed: 'right',
      width: '150px',
      render: (_, record) => (
        <Space size="large">
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: `${language.edit}`,
                  onClick: () => handleEditClient(record.id),
                },
                {
                  key: '2',
                  label: `${language.delete}`,
                  onClick: () => setDeleteClientId(record.id),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button> 
            {language.actions} <DownOutlined />
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

      <Modal
        title={`${language.removeData} ${user.username}?`}
        open={deleteClientId !== null}
        onOk={handleDeleteClient}
        onCancel={() => setDeleteClientId(null)}
        okText={`${language.yes}`}
        cancelText={`${language.cancel}`}
      >
        <p>{language.undone}</p>
      </Modal>

    </div>
  );
};

