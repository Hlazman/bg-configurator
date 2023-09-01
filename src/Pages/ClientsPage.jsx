import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Импортируйте axios, если он не был импортирован ранее.

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

        setClients(response.data.data.clients.data);
      } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
      }
    };

    if (jwtToken) {
      fetchData();
    }
  }, []);

  return (
    <div>
      <h1>Список клиентов</h1>
      <ul>
        {clients.map((client) => (
          <li key={client.id}>
            <p>Название клиента: {client.attributes.client_name}</p>
            <p>Компания: {client.attributes.client_company}</p>
            {/* Другие поля клиента здесь */}
          </li>
        ))}
      </ul>
    </div>
  );
};


