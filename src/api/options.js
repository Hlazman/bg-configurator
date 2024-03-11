import axios from 'axios';
import {queryLink} from './variables'

export const getOptions = async (jwtToken, orderIdToUse, setOptionsData) => {
  try {
    const optionsResponse = await axios.post(queryLink,
      {query: `
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
                            whiteListOptions(pagination: $pagination) {
                              data {
                                id
                                attributes {
                                  actuality
                                  price
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
          }
        }
        `,
        variables: {
          orderId: orderIdToUse,
          pagination: {
            limit: 50
          },
          sort: "actuality"
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (optionsResponse) {
      const options = optionsResponse?.data?.data?.order?.data?.attributes?.door_suborder?.data?.attributes?.door?.data?.attributes?.whiteListOptions?.data
      setOptionsData(options);
      
      return options;
    }

  } catch (error) {
    console.log(error)
  }
};

export const getOptionsDataOrder = async (orderIdToUse, jwtToken, setOptionsSuborderData, form) => {
  try {
    const response = await axios.post(queryLink,
      { query: `
          query Query($orderId: ID, $pagination: PaginationArg) {
            order(id: $orderId) {
              data {
                attributes {
                  option_suborders(pagination: $pagination) {
                    data {
                      id
                      attributes {
                        title
                        price
                        custom
                        option {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  horizontal_veneer
                  super_gloss
                }
              }
            }
          }
        `,
        variables: {
          orderId: orderIdToUse,
          pagination: {
            limit: 30
          },
          filters: {
            custom: false,
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

    if (response.data?.data?.order) {
      const orderData = response.data.data.order.data.attributes;
      const suborderOptionsData = response.data.data.order.data.attributes.option_suborders.data;
      const customFalseSuborders = suborderOptionsData.filter(suborder => suborder.attributes.custom === false);
      
      setOptionsSuborderData(customFalseSuborders)

      if (form) {
        form.setFieldsValue(orderData);
        customFalseSuborders.forEach(option => {
          form.setFieldsValue({
            [`option_${option.attributes.option.data.id}`]: true
          });
        });
      }

      return customFalseSuborders;

      // form.setFieldsValue(orderData);
      //   customFalseSuborders.forEach(option => {
      //   form.setFieldsValue({
      //     [`option_${option.attributes.option.data.id}`]: true
      //   });
      // });
    }
      
  } catch (error) {
    console.error('Error fetching order data:', error);
  }
};

export const updateOption = async (jwtToken, updateOptionSuborderId, option) => {
  try {
    await axios.post(queryLink,
      { query: `
          mutation Mutation($updateOptionSuborderId: ID!, $data: OptionSuborderInput!) {
            updateOptionSuborder(id: $updateOptionSuborderId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateOptionSuborderId: updateOptionSuborderId.id,
          data: {
            title: option ? option.attributes.title : null,
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

  } catch (error) {
    console.error('Error updating option suborder:', error);
  }
};

export const addOption = async (jwtToken, orderIdToUse, option) => {
  try {
    const response = await axios.post(queryLink,
      { query: `
          mutation Mutation($data: OptionSuborderInput!) {
            createOptionSuborder(data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          data: {
            option: option.id,
            title: option.attributes.title,
            order: orderIdToUse,
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
    
    const updateOptionSuborderId = response.data.data.createOptionSuborder.data;
    updateOption(jwtToken, updateOptionSuborderId, option)

    // fetchOrderData()
    
  } catch (error) {
    console.error('Error creating option suborder:', error);
  }
};

export const deleteOption = async (jwtToken, optionsSuborderData, option) => {
  const updateOptionSuborderId = optionsSuborderData.find(suborder => suborder.attributes.option.data.id === option.id);

  if (updateOptionSuborderId) {
    try {
      updateOption(jwtToken, updateOptionSuborderId, option)
      await axios.post(queryLink,
        { query: `
            mutation Mutation($deleteOptionSuborderId: ID!) {
              deleteOptionSuborder(id: $deleteOptionSuborderId) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            deleteOptionSuborderId: updateOptionSuborderId.id,
          },
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      // fetchOrderData()

    } catch (error) {
      console.error('Error deleting option suborder:', error);
    }
  }
};