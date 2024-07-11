import axios from 'axios';
import {queryLink} from './variables'

export const checkKnobe = async (jwtToken, orderIdToUse, setIsDataKnobe, setKnobePrice) => {
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
                      knobe {
                        data {
                          id
                        }
                      }
                      price
                      basicPrice
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
            knobe: {
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

    if (response?.data?.data?.order?.data?.attributes?.fitting_suborders?.data[0]?.attributes?.knobe?.data?.id) {
        setIsDataKnobe(false);
        const knobeSuborder = response?.data?.data?.order?.data?.attributes?.fitting_suborders?.data[0]?.id;

        if (setKnobePrice !== null) {
          const knobePrice = response?.data?.data?.order?.data?.attributes?.fitting_suborders?.data[0]?.attributes?.price;
          setKnobePrice(knobePrice);
        }
        

        return knobeSuborder;
    }

    return null;

  } catch (error) {
    console.log(error)
  }
};

export const removeKnobe = async (jwtToken, orderIdToUse, setIsDataKnobe, messageApi, language, setPreviousKnobeId, setKnobeVariant, setKnobePrice) => {
  const knobeSuborder = await checkKnobe(jwtToken, orderIdToUse, setIsDataKnobe, null);
  
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
          updateFrameFittingId: knobeSuborder,
          data: {
            "knobe": null,
            knobe_variant: null,
            basicPrice: 0,
            price: 0,
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
      setIsDataKnobe(true);
      setPreviousKnobeId(null);
      setKnobePrice(0);
      setKnobeVariant('standard');
      messageApi.success(language.successQuery);
    }
  } catch (error) {
    console.log(error)
  }
};