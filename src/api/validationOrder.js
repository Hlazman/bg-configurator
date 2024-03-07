import axios from 'axios';
import {queryLink} from './variables'


export const getOrderErrors = async (jwtToken, orderIdToUse) => {
  try {
    const response = await axios.post(queryLink,
       { query: `
          query Order($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  errorDecor
                  errorFrame
                  errorHinge
                  errorOptions
                }
              }
            }
          }
         `,
         variables: {
           orderId: orderIdToUse,
         }
       },
       {
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${jwtToken}`,
         }
       }
     )
    const errorData = response?.data?.data?.order?.data?.attributes;
      
    if (errorData) {
      const errorArray = Object.values(errorData).filter(value => value !== null);
      return errorArray;
    }
   }
   catch (error) {
     console.error('Error:', error);
     return [];
   }
};

export const updateHingeError = async (jwtToken, orderIdToUse, errorHinge) => {
  try {
    await axios.post(queryLink,
       { query: `
          mutation Mutation($updateOrderId: ID!, $data: OrderInput!) {
            updateOrder(id: $updateOrderId, data: $data) {
              data {
                id
              }
            }
          }
         `,
         variables: {
          updateOrderId: orderIdToUse,
          data: {
            "errorHinge": errorHinge
          }
         }
       },
       {
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${jwtToken}`,
         }
       }
     )
   }
   catch (error) {
     console.error('Error:', error);
   }
};

export const updateDecorError = async () => {

};

export const updateOptionsError = async () => {

};

export const updateFrameError = async () => {

};


export const validateHinges = async (orderIdToUse, jwtToken) => {
  let allowHinges = '';
  let currentHinge = ''

  try {
   await axios.post(queryLink,
      { query: `
          query Query($orderId: ID, $filters: FrameFittingFiltersInput) {
            order(id: $orderId) {
              data {
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
                              whiteListHinges {
                                data {
                                  attributes {
                                    brand
                                    title
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  fitting_suborders(filters: $filters) {
                    data {
                      attributes {
                        hinge {
                          data {
                            attributes {
                              title
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          orderId: orderIdToUse,
          filters: {
            "title": {
              "eqi": "hinge"
            }
          },
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      }
    ).then(response => {
      allowHinges = 
        response.data?.data?.order?.data?.attributes?.door_suborder?.data?.attributes.door?.data?.attributes?.whiteListHinges?.data
        .map(item => item.attributes.title);
      currentHinge = response.data?.data?.order?.data?.attributes?.fitting_suborders?.data[0]?.attributes?.hinge?.data?.attributes?.title

      console.log('currentHinge', currentHinge)
      if (!allowHinges.includes(currentHinge) && currentHinge !==undefined) {
         updateHingeError(jwtToken, orderIdToUse, 'errorHinge');
      } else {
        updateHingeError(jwtToken, orderIdToUse, null);
      }
    });
  }
  catch (error) {
    console.error('Error:', error);
  }
};