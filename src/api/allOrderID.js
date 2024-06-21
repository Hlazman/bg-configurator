import axios from 'axios';
import {queryLink} from './variables'

export const getIDs = async (orderIdToUse, jwtToken) => {
  let orderIDs = {};

  try {
    const response = await axios.post(queryLink,
      { query: `
          query Query($orderId: ID, $pagination: PaginationArg, $optionSubordersPagination2: PaginationArg) {
            order(id: $orderId) {
              data {
                attributes {
                  door_suborder {
                    data {
                      attributes {
                        door {
                          data {
                            id
                          }
                        }
                        decor {
                          data {
                            attributes {
                              HPL {
                                data {
                                  id
                                }
                              }
                              ceramogranite {
                                data {
                                  id
                                }
                              }
                              mirror {
                                data {
                                  id
                                }
                              }
                              paint {
                                data {
                                  id
                                  attributes {
                                    color_code
                                  }
                                }
                              }
                              primer {
                                data {
                                  id
                                }
                              }
                              veneer {
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
                  element_suborders(pagination: $pagination) {
                    data {
                      attributes {
                        element {
                          data {
                            id
                          }
                        }
                        decor {
                          data {
                            attributes {
                              HPL {
                                data {
                                  id
                                }
                              }
                              ceramogranite {
                                data {
                                  id
                                }
                              }
                              mirror {
                                data {
                                  id
                                }
                              }
                              paint {
                                data {
                                  id
                                  attributes {
                                    color_code
                                  }
                                }
                              }
                              primer {
                                data {
                                  id
                                }
                              }
                              veneer {
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
                  fitting_suborders {
                    data {
                      attributes {
                        knobe {
                          data {
                            id
                          }
                        }
                        hinge {
                          data {
                            id
                          }
                        }
                        lock {
                          data {
                            id
                          }
                        }
                      }
                    }
                  }
                  option_suborders(pagination: $optionSubordersPagination2) {
                    data {
                      attributes {
                        option {
                          data {
                            attributes {
                              title
                            }
                            id
                          }
                        }
                        custom
                        title
                      }
                    }
                  }
                  sliding_suborder {
                    data {
                      attributes {
                        sliding {
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
          "pagination": {
            "limit": 100
          },
          "optionSubordersPagination2": {
            "limit": 100
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
    
    const orderData = response.data.data.order.data.attributes;

    orderIDs = {
      door: orderData.door_suborder?.data?.attributes?.door?.data?.id || null,
      sliding: orderData.sliding_suborder?.data?.attributes?.sliding?.data?.id || null,
      elements: orderData.element_suborders.data.map(element => ({
        id: element.attributes.element?.data?.id || null,
        decor: {
          HPL: element.attributes.decor?.data?.attributes?.HPL?.data?.id || null,
          ceramogranite: element.attributes.decor?.data?.attributes?.ceramogranite?.data?.id || null,
          mirror: element.attributes.decor?.data?.attributes?.mirror?.data?.id || null,
          paint: element.attributes.decor?.data?.attributes?.paint?.data?.id || null,
          paintColorCode: element.attributes.decor?.data?.attributes?.paint?.data?.attributes?.color_code || null,
          primer: element.attributes.decor?.data?.attributes?.primer?.data?.id || null,
          veneer: element.attributes.decor?.data?.attributes?.veneer?.data?.id || null,
        },
      })),
      fittings: orderData.fitting_suborders.data.map(fitting => ({
        knobe: fitting.attributes.knobe?.data?.id || null,
        hinge: fitting.attributes.hinge?.data?.id || null,
        lock: fitting.attributes.lock?.data?.id || null,
      })),
      options: orderData.option_suborders.data.map(option => ({
        id: option.attributes.option?.data?.id || null,
        title: option.attributes.option?.data?.attributes?.title || option.attributes.title,
        custom: option.attributes.custom,
      })),
    };

    console.log(orderIDs);
  }
  catch (error) {
    console.error('Error:', error);
  }
}