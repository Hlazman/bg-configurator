import axios from 'axios';
import {queryLink} from './variables'

export const checkDecorSecondSide = async (jwtToken, orderIdToUse, setIsDataSecondDecor) => {
  try {
    const response = await axios.post(queryLink,
      {query: `
        query Query($orderId: ID) {
          order(id: $orderId) {
            data {
              attributes {
                door_suborder {
                  data {
                    id
                    attributes {
                      otherSideDecor {
                        data {
                          id
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
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (response?.data?.data?.order?.data?.attributes?.door_suborder?.data?.attributes?.otherSideDecor?.data?.id) {
        setIsDataSecondDecor(false);
        const doorSuborderId = response?.data?.data?.order?.data?.attributes?.door_suborder?.data?.id
        return doorSuborderId;
    }

    return null;

  } catch (error) {
    console.log(error)
  }
};

export const removeDecorSecondSide = async (jwtToken, orderIdToUse, setIsDataSecondDecor, messageApi, language) => {
  const doorSuborderId = await checkDecorSecondSide(jwtToken, orderIdToUse, setIsDataSecondDecor);
  
  try {
    const response = await axios.post(queryLink,
      {query: `
        mutation Mutation($updateDoorSuborderId: ID!, $data: DoorSuborderInput!) {
          updateDoorSuborder(id: $updateDoorSuborderId, data: $data) {
            data {
              id
            }
          }
        }
      `,
        variables: {
          updateDoorSuborderId: doorSuborderId,
          data: {
            "otherSideDecor": null
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

    if (response) {
      setIsDataSecondDecor(true);
      messageApi.success(language.successQuery);
    }
  } catch (error) {
    console.log(error)
  }
};