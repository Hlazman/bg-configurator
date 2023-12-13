import axios from 'axios';
import { deleteOrderWithSuborders } from './deleteOrderWithSuborders'

export const deleteTotalOrderWithOrders = async (totalOrderId, jwtToken) => {
  let ordersId = [];

  try {
    const response = await axios.post('https://api.boki.fortesting.com.ua/graphql', {
      query: `
        query TotalOrder($totalOrderId: ID) {
          totalOrder(id: $totalOrderId) {
            data {
              id
              attributes {
                orders {
                  data {
                    id
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        totalOrderId: totalOrderId ? totalOrderId : localStorage.getItem('TotalOrderId'),
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    const orders = response?.data?.data?.totalOrder?.data?.attributes?.orders?.data;
    ordersId = orders;

  } catch (error) {
      console.log('Error query TotalOrder', error)
  }

  try {
    const response = await axios.post(
      'https://api.boki.fortesting.com.ua/graphql',
      {
        query: `
          mutation Mutation($deleteTotalOrderId: ID!) {
            deleteTotalOrder(id: $deleteTotalOrderId) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          deleteTotalOrderId: totalOrderId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (response.data.data.deleteTotalOrder) {
      for (let i = 0; i< ordersId.length; i++) {
        const orderID = ordersId[i].id;
        await deleteOrderWithSuborders(orderID, jwtToken)
      }
    }

  } catch (error) {
    console.log('Error delete TotalOrder', error)
  }

};