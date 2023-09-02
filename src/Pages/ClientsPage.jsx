import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'antd';

export const ClientsPage = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');

    const fetchData = async () => {
      try {
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

        // Установите ключи для данных клиентов
        const clientsWithKeys = response.data.data.clients.data.map(client => ({
          ...client,
          key: client.id, // Используйте id в качестве ключа
        }));

        setClients(clientsWithKeys);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      }
    };

    if (jwtToken) {
      fetchData();
    }
  }, []);
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Название клиента',
      dataIndex: ['attributes', 'client_name'],
      key: 'attributes.client_name',
    },
    {
      title: 'Компания',
      dataIndex: ['attributes', 'client_company'],
      key: 'attributes.client_company',
    },
    {
      title: 'Email',
      dataIndex: ['attributes', 'contacts', 'email'],
      key: 'attributes.contacts.email',
    },
    {
      title: 'Телефон',
      dataIndex: ['attributes', 'contacts', 'phone'],
      key: 'attributes.contacts.phone',
    },
    {
      title: 'Дополнительный телефон',
      dataIndex: ['attributes', 'contacts', 'phone_2'],
      key: 'attributes.contacts.phone_2',
    },
    {
      title: 'Адресы',
      dataIndex: ['attributes', 'addresses'],
      key: 'addresses',
      render: (addresses) => (
        <ul>
          {addresses.map((address, index) => (
            <li key={index}>
              <p>Адрес: {address.address}</p>
              <p>Город: {address.city}</p>
              <p>Страна: {address.country}</p>
              <p>Почтовый индекс: {address.zipCode}</p>
            </li>
          ))}
        </ul>
      ),
    },
    {
      title: 'Менеджер',
      dataIndex: ['attributes', 'manager', 'data', 'attributes', 'username'],
      key: 'attributes.manager.data.attributes.username',
    },
    {
      title: 'Название компании',
      dataIndex: ['attributes', 'company', 'data', 'attributes', 'name'],
      key: 'attributes.company.data.attributes.name',
    },
    // Добавьте другие поля по аналогии
  ];
  

  return (
    <div>
      <h1>Список клиентов</h1>
      <Table dataSource={clients} columns={columns} />
    </div>
  );
};
