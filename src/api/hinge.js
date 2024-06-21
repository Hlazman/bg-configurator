import axios from 'axios';
import {queryLink} from './variables'

export const getHinges = async (orderIdToUse, jwtToken, setHingeData, setIsLoading, setSelectedBrand) => {
  let brandFilter = '';

  try {
   await axios.post(queryLink,
      { query: `
      query Query($orderId: ID, $pagination: PaginationArg) {
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
                          whiteListHinges(pagination: $pagination) {
                            data {
                              attributes {
                                brand
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
      brandFilter = response.data?.data?.order?.data?.attributes?.door_suborder?.data?.attributes.door?.data?.attributes?.whiteListHinges?.data[0]?.attributes?.brand || '';
    });
  }
  catch (error) {
    console.error('Error:', error);
  }

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




export const checkHinge = async (jwtToken, orderIdToUse, setIsDataHinges) => {
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
                      hinge {
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
            hinge: {
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

    if (response?.data?.data?.order?.data?.attributes?.fitting_suborders?.data[0]?.attributes?.hinge?.data?.id) {
      // setIsDataHinges(false);
      if (setIsDataHinges !== null) {
        setIsDataHinges(false);
      }

      const hingesSuborder = response?.data?.data?.order?.data?.attributes?.fitting_suborders?.data[0]?.id
      return hingesSuborder;
  }

    return null;

  } catch (error) {
    console.log(error)
  }
};

export const removeHinge = async (jwtToken, orderIdToUse, setIsDataHinges, messageApi, language, setPreviousHingeId) => {
  const hingesSuborder = await checkHinge(jwtToken, orderIdToUse, setIsDataHinges);
  
  if (!hingesSuborder) {
    return
  }
  
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
          updateFrameFittingId: hingesSuborder,
          data: {
            "hinge": null
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
      // setIsDataHinges(true);
      // setPreviousHingeId(null);
      // messageApi.success(language.successQuery);

      if (setIsDataHinges !== null) {
        setIsDataHinges(true);
      }
      if (setPreviousHingeId !== null) {
        setPreviousHingeId(null);
      }

      if (messageApi !== null) {
        messageApi.success(language.successQuery);
      }
    }
  } catch (error) {
    console.log(error)
  }
};