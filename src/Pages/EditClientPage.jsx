// import React, { useState, useEffect } from 'react';
// import { Form, Input, Button, Card, Space, Spin, message } from 'antd';
// import { UserOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

// export const EditClientPage = () => {
//   const { clientId } = useParams();
//   const jwtToken = localStorage.getItem('token');

//   const [form] = Form.useForm();

//   const [clientData, setClientData] = useState(null)
//   const [loading, setLoading] = useState(false);

//   const handleAddAddress = () => {
//     setClientData((prevData) => ({
//       ...prevData,
//       addresses: [...prevData.addresses, { id: null, country: null, city: null, address: null, zipCode: null }],
//     }));
//   };

//   const handleRemoveAddress = (index) => {
//     setClientData((prevData) => {
//       const updatedAddresses = [...prevData.addresses];
//       updatedAddresses.splice(index, 1);
//       return {
//         ...prevData,
//         addresses: updatedAddresses,
//       };
//     });
//   };


//   useEffect(() => {
//       setLoading(true);
//       axios
//         .post(
//           'https://api.boki.fortesting.com.ua/graphql',
//           {
//             query: `
//             query Query($clientId: ID) {
//               client(id: $clientId) {
//                 data {
//                   attributes {
//                     client_name
//                     client_company
//                     addresses {
//                       id
//                       address
//                       city
//                       country
//                       zipCode
//                     }
//                     contacts {
//                       email
//                       phone
//                       phone_2
//                     }
//                   }
//                 }
//               }
//             }
//             `,
//             variables: { clientId },
//           },
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${jwtToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           setLoading(false);
//           const client = response.data.data.client.data.attributes;
//           console.log(client)
//           form.setFieldsValue({
//             client_name: client.client_name,
//             client_company: client.client_company || '',
//             phone: client.contacts.phone || '',
//             phone_2: client.contacts.phone_2 || '',
//             email: client.contacts.email || '',
//             addresses: client.addresses.map((address) => ({
//               country: address.country || '',
//               city: address.city || '',
//               address: address.address || '',
//               zipCode: address.zipCode || '',
//             })),
//           });
//           setClientData(client);
//         })
//         .catch((error) => {
//           setLoading(false);
//           console.error(error);
//           message.error('An error occurred while fetching client data');
//         });
//   }, [clientId, jwtToken, form]);

//   const onFinish = (values) => {
//     setLoading(true);
//     const data = {
//       client_name: values.client_name,
//       client_company: values.client_company || null,
//       addresses: clientData.addresses.map((address) => ({
//         ...address,
//         id: address.id || null,
//       })),
//       contacts: {
//         phone: values.phone || null,
//         email: values.email || null,
//         phone_2: values.phone_2 || null,
//       },
//     };
  
//     axios
//       .post(
//         'https://api.boki.fortesting.com.ua/graphql',
//         {
//           query: `
//             mutation UpdateClient($data: ClientInput!, $updateClientId: ID!) {
//               updateClient(data: $data, id: $updateClientId) {
//                 data {
//                   id
//                 }
//               }
//             }
//           `,
//           variables: {
//             data,
//             updateClientId: clientId, // Передайте ID клиента, которого вы хотите обновить
//           },
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${jwtToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setLoading(false);
//         console.log(response.data.data)

//         const responseData = response.data.data;
//         if (responseData && responseData.updateClient) {
//           const updatedClientId = responseData.updateClient.data.id;
//           message.success(`Client with ID ${updatedClientId} successfully updated`);
//         } else {
//           message.error('An error occurred while updating the client');
//         }
//       })
//       .catch((error) => {
//         setLoading(false);
//         console.error(error);
//         message.error('An error occurred while updating the client');
//       });
//   };

//   return (
//     <Spin spinning={loading}>
//       <Card style={{ marginTop: '35px' }}>
//         <Form
//           form={form}
//           name="editClientForm"
//           onFinish={onFinish}
//         >
//           <Form.Item
//             name="client_name"
//             rules={[{ required: true, message: 'Please enter the client name!' }]}
//           >
//             <Input prefix={<UserOutlined />} placeholder="Client Name" addonBefore="Client name" />
//           </Form.Item>

//           <Form.Item
//             name="client_company"
//           >
//             <Input placeholder="Orgainzation" addonBefore="Orgainzation"/>
//           </Form.Item>

//           {clientData && clientData.addresses.map((address, index) => (
//             <Space key={index} style={{ alignItems: 'flex-start' }}>
//               <Form.Item
//                 name={['addresses', index, 'country']}
//               >
//                 <Input placeholder="Country" addonBefore="Country" />
//               </Form.Item>
//               <Form.Item
//                 name={['addresses', index, 'city']}
//               >
//                 <Input placeholder="City" addonBefore="City" />
//               </Form.Item>
//               <Form.Item
//                 name={['addresses', index, 'address']}
//               >
//                 <Input placeholder="Address" addonBefore="Address" />
//               </Form.Item>
//               <Form.Item
//                 name={['addresses', index, 'zipCode']}
//               >
//                 <Input placeholder="Zip Code" addonBefore="Zip Code" />
//               </Form.Item>

//               <Button danger type="primary" onClick={() => handleRemoveAddress(index)} icon={<MinusCircleOutlined />}>
//                 Remove Address
//               </Button>
//             </Space>
//           ))}

//           <Form.Item>
//             <Button type="primary" onClick={handleAddAddress} icon={<PlusOutlined />}>
//               Add Address
//             </Button>
//           </Form.Item>

//           <Form.Item
//             name="phone"
//           >
//             <Input placeholder="Phone" addonBefore="Phone"/>
//           </Form.Item>

//           <Form.Item
//             name="phone_2"
//           >
//             <Input placeholder="Phone 2" addonBefore="Phone 2"/>
//           </Form.Item>

//           <Form.Item
//             name="email"
//           >
//             <Input placeholder="Email" addonBefore="Email"/>
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit">
//               Update Client
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </Spin>
//   );
// };


import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Space, Spin, message } from 'antd';
import { UserOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export const EditClientPage = () => {
  const { clientId } = useParams();
  const jwtToken = localStorage.getItem('token');

  const [form] = Form.useForm();

  const [clientData, setClientData] = useState(null)
  const [loading, setLoading] = useState(false);


  const generateUniqueId = () => {
    // Генерируйте уникальный id здесь, например, используя библиотеку uuid
    // В этом примере, мы используем текущее время для демонстрации
    return new Date().getTime().toString();
  };

  const handleAddAddress = () => {
    setClientData((prevData) => ({
      ...prevData,
      addresses: [...prevData.addresses, { id: generateUniqueId(), country: null, city: null, address: null, zipCode: null }],
      // addresses: [...prevData.addresses, {country: null, city: null, address: null, zipCode: null }],
    }));
  };

  const handleRemoveAddress = (index) => {
    setClientData((prevData) => {
      const updatedAddresses = [...prevData.addresses];
      updatedAddresses.splice(index, 1);
      return {
        ...prevData,
        addresses: updatedAddresses,
      };
    });
  };

  // Функция для обновления поля в массиве addresses
  const handleUpdateAddressField = (index, field, value) => {
    setClientData((prevData) => {
      const updatedAddresses = [...prevData.addresses];
      updatedAddresses[index][field] = value;
      return {
        ...prevData,
        addresses: updatedAddresses,
      };
    });
  };

  useEffect(() => {
    setLoading(true);
    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($clientId: ID) {
              client(id: $clientId) {
                data {
                  attributes {
                    client_name
                    client_company
                    addresses {
                      id
                      address
                      city
                      country
                      zipCode
                    }
                    contacts {
                      email
                      phone
                      phone_2
                    }
                  }
                }
              }
            }
          `,
          variables: { clientId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        setLoading(false);
        const client = response.data.data.client.data.attributes;

        form.setFieldsValue({
          client_name: client.client_name,
          client_company: client.client_company || '',
          phone: client.contacts.phone || '',
          phone_2: client.contacts.phone_2 || '',
          email: client.contacts.email || '',
          addresses: client.addresses.map((address) => ({
            country: address.country || '',
            city: address.city || '',
            address: address.address || '',
            zipCode: address.zipCode || '',
          })),
        });
        setClientData(client);
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        message.error('An error occurred while fetching client data');
      });
  }, [clientId, jwtToken, form]);

  const onFinish = (values) => {
    setLoading(true);
    const data = {
      client_name: values.client_name,
      client_company: values.client_company || null,
      addresses: clientData.addresses.map((address) => ({
        ...address,
        id: address.id || null,
      })),
      contacts: {
        phone: values.phone || null,
        email: values.email || null,
        phone_2: values.phone_2 || null,
      },
    };
    
    axios
      .post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation UpdateClient($data: ClientInput!, $updateClientId: ID!) {
              updateClient(data: $data, id: $updateClientId) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            data,
            updateClientId: clientId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      )
      .then((response) => {
        setLoading(false);

        console.log(response.data)
        const responseData = response.data.data;
        if (responseData && responseData.updateClient) {
          const updatedClientId = responseData.updateClient.data.id;
          message.success(`Client with ID ${updatedClientId} successfully updated`);
        } else {
          message.error('An error occurred while updating the client');
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        message.error('An error occurred while updating the client');
      });
  };

  return (
    <Spin spinning={loading}>
      <Card style={{ marginTop: '35px' }}>
        <Form
          form={form}
          name="editClientForm"
          onFinish={onFinish}
        >
          <Form.Item
            name="client_name"
            rules={[{ required: true, message: 'Please enter the client name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Client Name" addonBefore="Client name" />
          </Form.Item>

          <Form.Item
            name="client_company"
          >
            <Input placeholder="Orgainzation" addonBefore="Orgainzation"/>
          </Form.Item>

          {clientData && clientData.addresses.map((address, index) => (
            <Space key={index} style={{ alignItems: 'flex-start' }}>
              <Form.Item
                name={['addresses', index, 'country']}
              >
                <Input
                  placeholder="Country"
                  addonBefore="Country"
                  onChange={(e) => handleUpdateAddressField(index, 'country', e.target.value)}
                />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'city']}
              >
                <Input
                  placeholder="City"
                  addonBefore="City"
                  onChange={(e) => handleUpdateAddressField(index, 'city', e.target.value)}
                />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'address']}
              >
                <Input
                  placeholder="Address"
                  addonBefore="Address"
                  onChange={(e) => handleUpdateAddressField(index, 'address', e.target.value)}
                />
              </Form.Item>
              <Form.Item
                name={['addresses', index, 'zipCode']}
              >
                <Input
                  placeholder="Zip Code"
                  addonBefore="Zip Code"
                  onChange={(e) => handleUpdateAddressField(index, 'zipCode', e.target.value)}
                />
              </Form.Item>

              <Button danger type="primary" onClick={() => handleRemoveAddress(index)} icon={<MinusCircleOutlined />}>
                Remove Address
              </Button>
            </Space>
          ))}

          <Form.Item>
            <Button type="primary" onClick={handleAddAddress} icon={<PlusOutlined />}>
              Add Address
            </Button>
          </Form.Item>

          <Form.Item
            name="phone"
          >
            <Input placeholder="Phone" addonBefore="Phone"/>
          </Form.Item>

          <Form.Item
            name="phone_2"
          >
            <Input placeholder="Phone 2" addonBefore="Phone 2"/>
          </Form.Item>

          <Form.Item
            name="email"
          >
            <Input placeholder="Email" addonBefore="Email"/>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Client
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};
