import axios from 'axios';
import {queryLink} from './variables'

export const getHinges = async (orderIdToUse, jwtToken, setHingeData, setIsLoading, setSelectedBrand) => {
  const axorDoors = ['ALUM UNIQUE 43', 'ALUM UNIQUE 51', 'ALUM PREMIUM 55'];
  let doorTitle = '';

  try {
   await axios.post(queryLink,
      { query: `
          query Query($orderId: ID) {
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
          orderId: orderIdToUse
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      }
    ).then(response => {
      doorTitle = response.data?.data?.order?.data?.attributes?.door_suborder?.data?.attributes.door?.data?.attributes?.product_properties?.title || '';
    });
  }
  catch (error) {
    console.error('Error:', error);
  }

  const brandFilter = axorDoors.includes(doorTitle) ? 'Otlav' : 'Axor';
  setSelectedBrand(brandFilter);
  
  try {
    const response = await axios.post( queryLink,
      {query: `
          query Hinges($pagination: PaginationArg, $filters: HingeFiltersInput) {
            hinges(pagination: $pagination, filters: $filters) {
              data {
                attributes {
                  brand
                  image {
                    data {
                      attributes {
                        url
                      }
                    }
                  }
                  title
                }
                id
              }
            }
          }
        `,
        variables: {
          pagination: {
            limit: 100
          },
          filters: {
            "brand": {
              // "eqi": axorDoors.includes(doorTitle) ? 'Otlav' : 'Axor'
              "eqi": brandFilter
            }
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    const hinges = response.data.data.hinges.data.map(hinge => ({
      ...hinge,
      id: hinge.id,
    }));
    setHingeData(hinges);
    setIsLoading(false);
  }
  catch (error) {
    console.error('Error:', error);
  }
};


export const getHingesData = async (jwtToken, setIsLoading, hingeSuborderId, setPreviousHingeId, setHingeAmount) => {
  try {
    setIsLoading(true);
  
    const variables = {
      frameFittingId: hingeSuborderId,
    };

    await axios.post(queryLink, {
      query: `
        query GetFrameFitting($frameFittingId: ID) {
          frameFitting(id: $frameFittingId) {
            data {
              attributes {
                amount
                hinge {
                  data {
                    id
                  }
                }
              }
            }
          }
        }
      `,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    })
    .then((response) => {
      const hingeId = response?.data?.data?.frameFitting?.data?.attributes?.hinge?.data?.id;
      const amount = response?.data?.data?.frameFitting?.data?.attributes?.amount;

      if (hingeId) {
        setPreviousHingeId(hingeId);
      }

      if (amount) {
        setHingeAmount(amount)
      }

      setIsLoading(false);
    })
    .catch((error) => {
      setIsLoading(false);
    });
  }
  catch (error) {
    console.error('Error:', error);
  }
};


export const updateHinges = async (
  jwtToken, hingeSuborderId, previousHingeId, hingeAmount, messageApi, language, setCurrentStepSend, setBtnColor
  ) => {
  try {
    const variables = {
      "updateFrameFittingId": hingeSuborderId,
      "data": {
        "hinge": previousHingeId,
        'custom_amount': hingeAmount,
      }
    };

    axios.post(queryLink,
      { query: `
          mutation UpdateFrameFitting($updateFrameFittingId: ID!, $data: FrameFittingInput!) {
            updateFrameFitting(id: $updateFrameFittingId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
    .then((response) => {
      messageApi.success(language.successQuery);
      if (setCurrentStepSend) {
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            fittingHingeSend: true
          };
        });
      }
      setBtnColor('#4BB543');
    })
    .catch((error) => {
      messageApi.error(language.errorQuery);
    });
  }
  catch (error) {
    console.error('Error:', error);
  }
};