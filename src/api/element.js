import axios from 'axios';
import {queryLink} from './variables'

export const getElements = async (jwtToken, orderIdToUse, setElementOptions) => {
  try {
    const elementsResponse = await axios.post(queryLink,
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
                            whiteListElements(pagination: $pagination) {
                              data {
                                id
                                attributes {
                                  hasDecor
                                  hasDecorRequired
                                  hasHeight
                                  hasLength
                                  hasThickness
                                  hasWidth
                                  title
                                  type
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
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (elementsResponse) {
      // const elements = elementsResponse?.data?.data?.order?.data?.attributes?.door_suborder?.data?.attributes?.door?.data?.attributes?.whiteListElements?.data;
      let elements = elementsResponse?.data?.data?.order?.data?.attributes?.door_suborder?.data?.attributes?.door?.data?.attributes?.whiteListElements?.data;
      const isSliding = await getIsSlidingFrame(orderIdToUse, jwtToken);
      
      if (!isSliding) {
        elements = elements.filter(element => element.id !== "33");
      }

      if (setElementOptions) {
        setElementOptions(elements);
      }

      return elements;
    }

  } catch (error) {
    console.log(error)
    return;
  }
};

export const getElementsDataOrder = async (jwtToken, elementSuborderId, form, setCurrentElementField) => {
  try {
    const response = await axios.post(queryLink,
      { query: `
          query Query($elementSuborderId: ID) {
            elementSuborder(id: $elementSuborderId) {
              data {
                id
                attributes {
                  amount
                  type
                  element {
                    data {
                      id
                    }
                  }
                  sizes {
                    height
                    thickness
                    width
                    length
                  }
                  decor {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          elementSuborderId: elementSuborderId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    
    if (response.data?.data) {
      const elementSuborderData = response?.data?.data?.elementSuborder?.data?.attributes
      
      if (form) {
        form.setFieldsValue({
          name: elementSuborderData?.element?.data?.id,
          width: elementSuborderData?.sizes?.width,
          height: elementSuborderData?.sizes?.height,
          thickness: elementSuborderData?.sizes?.thickness,
          amount: elementSuborderData?.amount,
          length: elementSuborderData?.sizes?.length,
        });

        setCurrentElementField(elementSuborderData?.element?.data?.id);
        return elementSuborderData?.element?.data?.id;
      }
    }
  } catch (error) {
    console.error('error:', error);
    return;
  }
};

export const updateElementSuborder = async (jwtToken, elementID, data, language, messageApi, setCurrentStepSend, setBtnColor) => {
  try {
    await axios.post( queryLink,
      { query: `
          mutation Mutation($updateElementSuborderId: ID!, $data: ElementSuborderInput!) {
            updateElementSuborder(id: $updateElementSuborderId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateElementSuborderId: elementID,
          data,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
    .then(response => {
      messageApi.success(language.successQuery);
      if (setCurrentStepSend) {
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            elementSend: true
          };
        });
      }
      setBtnColor('#4BB543');
    })
  } catch (error) {
    messageApi.error(language.errorQuery);
  }
};


export const getIsSlidingFrame = async (orderIdToUse, jwtToken) => {
  try {
    const response = await axios.post(queryLink,
      { query: `
          query Query($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  frame_suborder {
                    data {
                      attributes {
                        frame {
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
          orderId: orderIdToUse
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      }
    );
    const frameID = response.data?.data?.order?.data.attributes?.frame_suborder?.data.attributes?.frame?.data?.id;
    return frameID === '64' ? true : false;
  }
  catch (error) {
    console.error('Error:', error);
  }
}

// TODO: CLEAR CODE ++++++++++++++++++++++++++++++++
export const getDecorFromSuborder = async (
  dorSuborderId, jwtToken, validateDecorTypeElement, realElementId, language, messageApi, elementID,
  ) => {
  if (dorSuborderId) {
    await axios.post(queryLink,
      { query: `
          query Query($doorSuborderId: ID) {
            doorSuborder(id: $doorSuborderId) {
              data {
                attributes {
                  decor {
                    data {
                      id
                      attributes {
                        type
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          doorSuborderId: dorSuborderId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
    .then(async (response) => {
        const decorType = response?.data?.data?.doorSuborder?.data?.attributes?.decor?.data?.attributes?.type
        const result = await validateDecorTypeElement(jwtToken, realElementId, decorType);
        
        if (result === false) {
          messageApi.error(language.errDecorElement);
          return;
        };

        const decorDataId = response.data.data.doorSuborder.data.attributes.decor.data;

        if (decorDataId && decorDataId.id) {
          await axios.post(queryLink,
            { query: `
                mutation Mutation($updateElementSuborderId: ID!, $data: ElementSuborderInput!) {
                  updateElementSuborder(id: $updateElementSuborderId, data: $data) {
                    data {
                      id
                    }
                  }
                }
              `,
              variables: {
                updateElementSuborderId: elementID.toString(),
                data: {
                  decor: decorDataId.id,
                },
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          ).then((response) => {
              messageApi.success(language.successQuery);
            })
            .catch((error) => {
              messageApi.error(language.errorQuery);
            });
        } else {
          messageApi.error(language.NoDecorData);
        }
      })
      .catch((error) => {
        messageApi.error(language.errorQuery);
      });
  } else {
    messageApi.error(language.NoDecorDataDoor);
  }
};