import axios from 'axios';
import {queryLink} from './variables'

export const checkLock = async (jwtToken, orderIdToUse, setIsDataLock) => {
  try {
    const response = await axios.post(queryLink,
      {query: `
        query Query($orderId: ID, $filters: FrameFittingFiltersInput) {
          order(id: $orderId) {
            data {
              attributes {
                fitting_suborders(filters: $filters) {
                  data {
                    id
                    attributes {
                      lock {
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
          filters: {
            lock: {
              id: {
                "not": null
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

    if (response?.data?.data?.order?.data?.attributes?.fitting_suborders?.data[0]?.attributes?.lock?.data?.id) {
      setIsDataLock(false);
      const lockSuborder = response?.data?.data?.order?.data?.attributes?.fitting_suborders?.data[0]?.id
      return lockSuborder;
  }

    return null;

  } catch (error) {
    console.log(error)
  }
};

export const removeLock = async (jwtToken, orderIdToUse, setIsDataLock, messageApi, language, setPreviousLockId) => {
  const lockSuborder = await checkLock(jwtToken, orderIdToUse, setIsDataLock);
  
  try {
    const response = await axios.post(queryLink,
      {query: `
        mutation Mutation($updateFrameFittingId: ID!, $data: FrameFittingInput!) {
          updateFrameFitting(id: $updateFrameFittingId, data: $data) {
            data {
              id
            }
          }
        }
      `,
        variables: {
          updateFrameFittingId: lockSuborder,
          data: {
            "lock": null
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
      setIsDataLock(true);
      setPreviousLockId(null)
      messageApi.success(language.successQuery);
    }
  } catch (error) {
    console.log(error)
  }
};