import axios from 'axios';
import {queryLink} from './variables'


export const checkVeneerDirection = async (orderIdToUse, jwtToken) => {
  try {
    const response = await axios.post( queryLink,
      { query: `
          query Order($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  horizontal_veneer
                }
              }
            }
          }
        `,
        variables: {
          orderId: orderIdToUse,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

      const veneerDirection = response.data?.data?.order?.data?.attributes?.horizontal_veneer
      return veneerDirection;

  } catch (error) {
    console.log(error);
  }
};

export const updateVeneerDirection = async (orderIdToUse, jwtToken, selectedValue) => {
  try {
    await axios.post( queryLink,
      { query: `
          mutation Mutation($data: OrderInput!, $updateOrderId: ID!) {
            updateOrder(data: $data, id: $updateOrderId) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateOrderId: orderIdToUse,
          data: {
            horizontal_veneer: selectedValue,
          }
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
  } catch (error) {
    console.log(error);
  }
}