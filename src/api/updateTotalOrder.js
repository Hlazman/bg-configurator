import axios from 'axios';
import {queryLink} from './variables'

export const updateTotalOrder = async (totalOrderId, jwtToken, selectedCompany) => {
  // await axios.post('https://api.boki.fortesting.com.ua/graphql',
  await axios.post(queryLink,
    {
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
          company: selectedCompany,
        }
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    )
    .catch((error) => {
      console.log('Error update Total Order', error)
  });
};