import axios from 'axios';
import {queryLink} from './variables'


export const checkSuperGloss = async (orderIdToUse, jwtToken) => {
  try {
    const response = await axios.post( queryLink,
      { query: `
          query Order($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  super_gloss
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

      const superGlossData = response.data?.data?.order?.data?.attributes?.super_gloss
      return superGlossData;

  } catch (error) {
    console.log(error);
  }
};


export const updateSuperGloss = async (orderIdToUse, jwtToken, selectedValue) => {
  try {
    await axios.post(queryLink,
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
            super_gloss: selectedValue,
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