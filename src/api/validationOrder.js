import axios from 'axios';
import {queryLink} from './variables'
import { getElements } from './element';

export const updateErrorEvent = new Event('updateError');

export const getOrderErrors = async (jwtToken, orderIdToUse) => {
  try {
    const response = await axios.post(queryLink,
       { query: `
          query Order($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  errorDecor
                  errorDecor2
                  errorFrame
                  errorHinge
                  errorOptions
                  errorElement
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

export const getTotalOrderErrors = async (jwtToken, totalOrderId) => {
  try {
    const response = await axios.post(queryLink,
       { query: `
          query Query($totalOrderId: ID, $pagination: PaginationArg) {
            totalOrder(id: $totalOrderId) {
              data {
                attributes {
                  orders(pagination: $pagination) {
                    data {
                      id
                      attributes {
                        errorDecor
                        errorDecor2
                        errorElement
                        errorFrame
                        errorHinge
                        errorOptions
                        totalCost
                      }
                    }
                  }
                }
              }
            }
          }
         `,
         variables: {
          totalOrderId: totalOrderId,
          pagination: {
            "limit": 100
          },
         }
       },
       {
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${jwtToken}`,
         }
       }
     )
    

     const ordersData = response?.data?.data?.totalOrder?.data?.attributes.orders?.data;

     if (!ordersData?.length) {
        return true;
       };

     const hasErrors = ordersData.some(order => {
      return (
        order.attributes.errorDecor !== null ||
        order.attributes.errorDecor2 !== null ||
        order.attributes.errorElement !== null ||
        order.attributes.errorFrame !== null ||
        order.attributes.errorHinge !== null ||
        order.attributes.errorOptions !== null ||
        order.attributes.totalCost === 0 || 
        order.attributes.totalCost === null
      );
    });

    return hasErrors;
   }
   catch (error) {
     console.error('Error:', error);
     return;
   }
}

export const updateError = async (jwtToken, orderIdToUse, errorField, errorName) => {
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
            [errorField]: errorName
          }
         }
       },
       {
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${jwtToken}`,
         }
       }
     );

     document.dispatchEvent(updateErrorEvent);
   }
   catch (error) {
     console.error('Error:', error);
   }
};

// HINGES
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

      if (!allowHinges.includes(currentHinge) && currentHinge !==undefined) {
        updateError(jwtToken, orderIdToUse, 'errorHinge', 'errorHinge');
      } else {
        updateError(jwtToken, orderIdToUse, 'errorHinge', null);
      }
    });
  }
  catch (error) {
    console.error('Error:', error);
  }
};

// OPTIONS
export const validateOptions = async (orderIdToUse, jwtToken, optionsData, optionsSuborderData, setNotValidOptions) => {
    const notValidIds = [];

    if (optionsData && optionsSuborderData) {
      for (const suborderItem of optionsSuborderData) {
        const suborderOptionId = suborderItem.attributes.option.data.id;
        const isValid = optionsData.some((dataItem) => dataItem.id === suborderOptionId);
        
        if (!isValid) {
            notValidIds.push(suborderOptionId);
        }
    }

    try {
      const response = await axios.post(queryLink,
         { query: `
            query Query($filters: OptionFiltersInput, $pagination: PaginationArg) {
              options(filters: $filters, pagination: $pagination) {
                data {
                  id
                  attributes {
                    title
                    price
                    actuality
                  }
                }
              }
            }
           `,
           variables: {
            filters: {
              "id": {
                "in": notValidIds.length ? notValidIds : null
              }
            },
            pagination: {
              "limit": 100
            },
            
           }
         },
         {
           headers: {
             'Content-Type': 'application/json',
             Authorization: `Bearer ${jwtToken}`,
           }
         }
       )

       if (response) {
        const notValid = response?.data?.data?.options?.data;
        setNotValidOptions(notValid);
        
        if (notValid.length) {
          updateError(jwtToken, orderIdToUse, 'errorOptions', 'errorOptions');
        } else {
          updateError(jwtToken, orderIdToUse, 'errorOptions', null);
        }
       } 
     }
     catch (error) {
       console.error('Error:', error);
     }
    }

};

// DECOR
const validateDecorSides = (orderIdToUse, jwtToken, decorType, doorAttributes, errorField, errorName) => {
  switch (decorType) {
    case "mirror":
      if (doorAttributes.hasGlass === false) {
        updateError(jwtToken, orderIdToUse, errorField, errorName)
      } else {
        updateError(jwtToken, orderIdToUse, errorField, null)
      }
      break;

    case "HPL":
      if (doorAttributes.hasHPL === false) {
        updateError(jwtToken, orderIdToUse, errorField, errorName)
      } else {
        updateError(jwtToken, orderIdToUse, errorField, null)
      }
      break;

      case "ceramogranite":
        if (doorAttributes.ceramogranite === false) {
          updateError(jwtToken, orderIdToUse, errorField, errorName)
        } else {
          updateError(jwtToken, orderIdToUse, errorField, null)
        }
        break;

      case "veneer":
        if (doorAttributes.hasVeneer === false) {
          updateError(jwtToken, orderIdToUse, errorField, errorName)
        } else {
          updateError(jwtToken, orderIdToUse, errorField, null)
        }
        break;

      case "primer":
        if (doorAttributes.hasPrimer === false) {
          updateError(jwtToken, orderIdToUse, errorField, errorName)
        } else {
          updateError(jwtToken, orderIdToUse, errorField, null)
        }
        break;

      case "paint":
        if (doorAttributes.hasPaint === false) {
          updateError(jwtToken, orderIdToUse, errorField, errorName)
        } else {
          updateError(jwtToken, orderIdToUse, errorField, null)
        }
        break;
    
    default:
      console.log("Unknown decor type");
  }
};

export const validateDecor = async (orderIdToUse, jwtToken) => {
  try {
   const decorResponse = await axios.post(queryLink,
      { query: `
          query ExampleQuery($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  door_suborder {
                    data {
                      attributes {
                        door {
                          data {
                            id
                            attributes {
                              hasGlass
                              hasHPL
                              hasPaint
                              hasPrimer
                              hasStoneware
                              hasVeneer
                            }
                          }
                        }
                        decor {
                          data {
                            attributes {
                              type
                            }
                          }
                        }
                        otherSideDecor {
                          data {
                            attributes {
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
    
    if (decorResponse?.data) {
      const decorType = decorResponse?.data?.data?.order?.data?.attributes?.door_suborder?.data.attributes?.decor?.data?.attributes?.type;
      const decorTypeOtherSide = decorResponse?.data?.data?.order?.data?.attributes?.door_suborder?.data.attributes?.otherSideDecor?.data?.attributes?.type;
      const doorAttributes = decorResponse?.data?.data?.order?.data?.attributes?.door_suborder?.data?.attributes?.door?.data?.attributes;

      const decorState = {
         mirror: { hasGlass: !doorAttributes.hasGlass },
         HPL: { hasHPL: !doorAttributes.hasHPL},
         ceramogranite: { hasStoneware: !doorAttributes.hasStoneware },
         veneer: { hasVeneer: !doorAttributes.hasVeneer },
         primer: { hasPrimer: !doorAttributes.hasPrimer },
         paint: { hasPaint: !doorAttributes.hasPaint },
      };

      validateDecorSides(orderIdToUse, jwtToken, decorType, doorAttributes, 'errorDecor', 'errorDecor')
      validateDecorSides(orderIdToUse, jwtToken, decorTypeOtherSide, doorAttributes, 'errorDecor2', 'errorDecor2')
      
      return decorState;
    }
    
  }
  catch (error) {
    console.error('Error:', error);
  }
};

// ELEMENTS
export const validateDecorElementsDisabled = async (jwtToken, realElementId) => {
  
  if (!realElementId) {
    return;
  }

  try {
   const decorElementsResponse = await axios.post(queryLink,
      { query: `
          query Element($elementId: ID) {
            element(id: $elementId) {
              data {
                attributes {
                  hasGlass
                  hasHPL
                  hasPaint
                  hasPrimer
                  hasStoneware
                  hasVeneer
                }
              }
            }
          }
        `,
        variables: {
          elementId: realElementId
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      }
    );
    
    if (decorElementsResponse?.data) {
      const elementsAttributes = decorElementsResponse?.data?.data?.element?.data?.attributes;

      const decorState = {
         mirror: { hasGlass: !elementsAttributes.hasGlass },
         HPL: { hasHPL: !elementsAttributes.hasHPL},
         ceramogranite: { hasStoneware: !elementsAttributes.hasStoneware },
         veneer: { hasVeneer: !elementsAttributes.hasVeneer },
         primer: { hasPrimer: !elementsAttributes.hasPrimer },
         paint: { hasPaint: !elementsAttributes.hasPaint },
      };

      return decorState;
    }
    
  }
  catch (error) {
    console.error('Error:', error);
  }
};

export const validateDecorTypeElement = async (jwtToken, realElementId, decorType) => {
  const elementAttributes = await validateDecorElementsDisabled(jwtToken, realElementId)
  let result = false;
  
  switch (decorType) {
    case "mirror":
      if (elementAttributes.mirror.hasGlass === true) {
        result = false;
      } else {
        result = true;
      }
      break;

    case "HPL":
      if (elementAttributes.HPL.hasHPL === true) {
        result = false;
      } else {
        result = true;
      }
      break;

      case "ceramogranite":
        if (elementAttributes.ceramogranite.hasStoneware === true) {
          result = false;
        } else {
          result = true;
        }
        break;

      case "veneer":
        if (elementAttributes.veneer.hasVeneer === true) {
          result = false;
        } else {
          result = true;
        }
        break;

      case "primer":
        if (elementAttributes.primer.hasPrimer === true) {
          result = false;
        } else {
          result = true;
        }
        break;

      case "paint":
        if (elementAttributes.paint.hasPaint === true) {
          result = false;
        } else {
          result = true;
        }
        break;
    
    default: console.log("Unknown decor type");
  }

  return result;
};

export const validateElements = async (orderIdToUse, jwtToken) => {
  const elements = await getElements(jwtToken, orderIdToUse);
  let subOrderElements = [];
  
  try {
    const response = await axios.post(queryLink,
      { query: `
          query ElementSuborders($pagination: PaginationArg, $filters: ElementSuborderFiltersInput) {
            elementSuborders(pagination: $pagination, filters: $filters) {
              data {
                id
                attributes {
                  element {
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
          pagination: {
            "limit": 100,
          },
          filters: {
            order: {
              id: {
                "eqi": orderIdToUse
              }
            }
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

      if(response?.data?.data?.elementSuborders?.data) {
        const suborders = response?.data?.data?.elementSuborders?.data;
        
        for (let i = 0; i < suborders.length; i++) {
          subOrderElements.push(suborders[i]?.attributes?.element?.data?.id);
        }
      }

  } catch (error) {
    console.log(error)
  }
  
  const notValid = subOrderElements.filter(id => !elements.some(element => element.id === id));

  if (notValid.length) {
    updateError(jwtToken, orderIdToUse, 'errorElement', 'errorElement');
  } else {
    updateError(jwtToken, orderIdToUse, 'errorElement', null);
  }

  return notValid;
};