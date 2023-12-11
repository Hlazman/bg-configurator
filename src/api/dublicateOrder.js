import axios from 'axios';

export const dublicateOrder = async (orderId, jwtToken, totalOrderId, selectedCompany, user ) => {
   let orderData = {};
   let frameData = {};
   let doorData = {};
   let elementsData = {};
   let lockData = {};
   let hingeData = {};
   let knobeData = {};
   let optionsData = {};
   let newOrderId = '';

    // ORDER +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    try {
      // QUERY ORDER
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Order($orderId: ID) {
              order(id: $orderId) {
                data {
                  attributes {
                    double_door
                    discount
                    deliveryAt
                    currency
                    comment
                    hidden
                    opening
                    manager {
                      data {
                        attributes {
                          username
                        }
                      }
                    }
                    horizontal_veneer
                    super_gloss
                    shippingAddress {
                      address
                      city
                      country
                      zipCode
                    }
                    shippingCost
                    side
                    tax
                    totalCost
                    basicTotalCost
                    door_suborder {
                      data {
                        id
                      }
                    }
                    element_suborders {
                      data {
                        id
                      }
                    }
                    fitting_suborders {
                      data {
                        id
                        attributes {
                          type
                        }
                      }
                    }
                    option_suborders {
                      data {
                        id
                      }
                    }
                    frame_suborder {
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
            orderId: orderId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      orderData = response?.data?.data?.order?.data?.attributes;

      // CREATE NEW ORDER
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              mutation CreateOrder($data: OrderInput!) {
                createOrder(data: $data) {
                  data {
                    id
                  }
                }
              }
            `,
            variables: {
              data: {
                company: selectedCompany,
                total_order: totalOrderId ? totalOrderId : localStorage.getItem('TotalOrderId'),
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
    
        const createdOrderId = response.data.data.createOrder.data.id;
        newOrderId = createdOrderId;
    
      } catch (error) {
          console.error('Error creating Order:', error);
      }

      // UPDATE NEW ORDER
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              mutation Mutation($data: OrderInput!, $updateOrderId: ID!) {
                updateOrder(data: $data, id: $updateOrderId) {
                  data {
                    id
                  }
                }
              }
            `,
            variables: {
              data: {
                basicTotalCost: orderData.basicTotalCost,
                currency: orderData.currency,
                discount: orderData.discount,
                double_door: orderData.double_door,
                hidden: orderData.hidden,
                horizontal_veneer: orderData.horizontal_veneer,
                opening: orderData.opening,
                side: orderData.side,
                super_gloss: orderData.super_gloss,
                totalCost: orderData.totalCost,
                tax: orderData.tax,
                comment: orderData.comment,
                manager: user.id,
              },
              updateOrderId: newOrderId,
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
          console.error('Error update Order', error)
      }
      
      const subordersId = {
        door: orderData?.door_suborder?.data?.id,
        elements: orderData?.element_suborders?.data.map(suborder => suborder.id),
        fittings: orderData?.fitting_suborders?.data.reduce((acc, suborder) => {
          acc[suborder.attributes.type] = suborder.id;
          return acc;
        }, {}),
        options: orderData?.option_suborders?.data.map(suborder => suborder.id),
        frame: orderData?.frame_suborder?.data?.id,
      };

      // DOOR +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++        
      if (subordersId.door) {
        
        // QUERY DOOR
        try {
          const doorSuborderResponse = await axios.post(
            'https://api.boki.fortesting.com.ua/graphql',
            {
              query: `
                query DoorSuborder($doorSuborderId: ID) {
                  doorSuborder(id: $doorSuborderId) {
                    data {
                      attributes {
                        price
                        basicPrice
                        sizes {
                          height
                          thickness
                          width
                        }
                        door {
                          data {
                            id
                            attributes {
                              collection
                              product_properties {
                                title
                                image {
                                  data {
                                    attributes {
                                      url
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                        decor {
                          data {
                            id
                            attributes {
                              title
                              type
                              veneer {
                                data {
                                  attributes {
                                    main_properties {
                                      image {
                                        data {
                                          attributes {
                                            url
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                              ceramogranite {
                                data {
                                  attributes {
                                    image {
                                      data {
                                        attributes {
                                          url
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                              paint {
                                data {
                                  attributes {
                                    main_properties {
                                      image {
                                        data {
                                          attributes {
                                            url
                                          }
                                        }
                                      }
                                    }
                                    color_range
                                  }
                                }
                              }
                              mirror {
                                data {
                                  attributes {
                                    image {
                                      data {
                                        attributes {
                                          url
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                              HPL {
                                data {
                                  attributes {
                                    image {
                                      data {
                                        attributes {
                                          url
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                              primer {
                                data {
                                  attributes {
                                    image {
                                      data {
                                        attributes {
                                          url
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
                doorSuborderId: subordersId.door,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );
      
          const doorSuborderData = doorSuborderResponse?.data?.data?.doorSuborder?.data?.attributes;
      
          let decorImg = null;
      
          if (doorSuborderData.decor?.data?.attributes?.veneer?.data?.attributes?.main_properties?.image?.data?.attributes?.url) {
            decorImg = doorSuborderData.decor.data.attributes.veneer.data.attributes.main_properties.image.data.attributes.url;
          } else if (doorSuborderData.decor?.data?.attributes?.ceramogranite?.data?.attributes?.image?.data?.attributes?.url) {
            decorImg = doorSuborderData.decor.data.attributes.ceramogranite.data.attributes.image.data.attributes.url;
          } else if (doorSuborderData.decor?.data?.attributes?.paint?.data?.attributes?.main_properties?.image?.data?.attributes?.url) {
            decorImg = doorSuborderData.decor.data.attributes.paint.data.attributes.main_properties.image.data.attributes.url;
          } else if (doorSuborderData.decor?.data?.attributes?.mirror?.data?.attributes?.image?.data?.attributes?.url) {
            decorImg = doorSuborderData.decor.data.attributes.mirror.data.attributes.image.data.attributes.url;
          } else if (doorSuborderData.decor?.data?.attributes?.HPL?.data?.attributes?.image?.data?.attributes?.url) {
            decorImg = doorSuborderData.decor.data.attributes.HPL.data.attributes.image.data.attributes.url;
          } else if (doorSuborderData.decor?.data?.attributes?.primer?.data?.attributes?.image?.data?.attributes?.url) {
            decorImg = doorSuborderData.decor.data.attributes.primer.data.attributes.image.data.attributes.url;
          }
      
          doorSuborderData.decor.img = decorImg;
          doorData = doorSuborderData;

        } catch (error) {
            console.error('Error query Door', error);
        }
        
        // CREATE NEW DOOR
        try {
          const doorSuborderResponse = await axios.post(
            'https://api.boki.fortesting.com.ua/graphql',
            {
              query: `
                mutation CreateDoorSuborder($data: DoorSuborderInput!) {
                  createDoorSuborder(data: $data) {
                    data {
                      id
                    }
                  }
                }
              `,
              variables: {
                data: {
                  order: newOrderId
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
      
          const newDoorSuborderId = doorSuborderResponse.data.data.createDoorSuborder.data.id;
 
          // UPDATE NEW DOOR
          try {
            const response = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  mutation Mutation($updateDoorSuborderId: ID!, $data: DoorSuborderInput!) {
                    updateDoorSuborder(id: $updateDoorSuborderId, data: $data) {
                      data {
                        id
                      }
                    }
                  }
                `,
                variables: {
                  updateDoorSuborderId: newDoorSuborderId,
                  data: {
                    basicPrice: doorData.basicPrice,
                    price: doorData.price,
                    sizes: doorData.sizes,
                    door: doorData.door.data.id,
                    decor: doorData.decor.data.id,
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
      
          } catch (error) {
            console.error('Error update Door', error);
          }

        } catch (error) {
            console.error('Error create Door', error);
        }
      }

      // FRAME +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++        
      if (subordersId.frame) {
        
        // QUERY FRAME
          try {
            const frameSuborderResponse = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  query Query($frameSuborderId: ID) {
                    frameSuborder(id: $frameSuborderId) {
                      data {
                        id
                        attributes {
                          frame {
                            data {
                              id
                              attributes {
                                title
                                type
                              }
                            }
                          }
                          price
                          basicPrice
                        }
                      }
                    }
                  }
                `,
                variables: {
                  frameSuborderId: subordersId.frame,
                },
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken}`,
                },
              }
            );
        
            const frameSuborderData = frameSuborderResponse?.data?.data?.frameSuborder?.data?.attributes;
            frameData = frameSuborderData;
          
          } catch (error) {
              console.error('Error query Frame', error);
          }

        // CREATE NEW FRAME
          try {
            const frameSuborderResponse = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  mutation CreateFrameSuborder($data: FrameSuborderInput!) {
                    createFrameSuborder(data: $data) {
                      data {
                        id
                      }
                    }
                  }
                `,
                variables: {
                  data: {
                    order: newOrderId,
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
  
            const newFrameSuborderId = frameSuborderResponse.data.data.createFrameSuborder.data.id;

            // UPDATE NEW FRAME
            try {
              const response = await axios.post(
                'https://api.boki.fortesting.com.ua/graphql',
                {
                  query: `
                    mutation Mutation($updateFrameSuborderId: ID!, $data: FrameSuborderInput!) {
                      updateFrameSuborder(id: $updateFrameSuborderId, data: $data) {
                        data {
                          id
                        }
                      }
                    }
                  `,
                  variables: {
                    updateFrameSuborderId: newFrameSuborderId,
                    data: {
                      frame: frameData.frame.data.id,
                      side: orderData.side,
                      decor: doorData.decor.data.id,
                      sizes: doorData.sizes,
                      price: frameData.price,
                      basicPrice: doorData.basicPrice,
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
            } catch (error) {
              console.error('Error update Frame', error)
            }
  
          } catch (error) {
              console.error('Error create Frame', error);
          }
      }

      // ELEMENTS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++        
      if (subordersId.elements) {
        
        // QUERY ELEMENTS
        const elementDataArray = [];

        for (const elementId of subordersId.elements) {
          try {
            const elementSuborderResponse = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  query ElementSuborders($elementSuborderId: ID) {
                    elementSuborder(id: $elementSuborderId) {
                      data {
                        attributes {
                          amount
                          price
                          basicPrice
                          type
                          sizes {
                            height
                            thickness
                            width
                            length
                          }
                          element {
                            data {
                              id
                              attributes {
                                title
                              }
                            }
                          }
                          decor {
                            data {
                              id
                              attributes {
                                title
                                type
                                veneer {
                                  data {
                                    attributes {
                                      main_properties {
                                        image {
                                          data {
                                            attributes {
                                              url
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                ceramogranite {
                                  data {
                                    attributes {
                                      image {
                                        data {
                                          attributes {
                                            url
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                paint {
                                  data {
                                    attributes {
                                      main_properties {
                                        image {
                                          data {
                                            attributes {
                                              url
                                            }
                                          }
                                        }
                                      }
                                      color_range
                                    }
                                  }
                                }
                                mirror {
                                  data {
                                    attributes {
                                      image {
                                        data {
                                          attributes {
                                            url
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                HPL {
                                  data {
                                    attributes {
                                      image {
                                        data {
                                          attributes {
                                            url
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                primer {
                                  data {
                                    attributes {
                                      image {
                                        data {
                                          attributes {
                                            url
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
                  elementSuborderId: elementId,
                },
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken}`,
                },
              }
            );

            const elementSuborderData = elementSuborderResponse?.data?.data?.elementSuborder?.data?.attributes;

            let decorImg = null;

            if (elementSuborderData.decor?.data?.attributes?.veneer?.data?.attributes?.main_properties?.image?.data?.attributes?.url) {
              decorImg = elementSuborderData.decor.data.attributes.veneer.data.attributes.main_properties.image.data.attributes.url;
            } else if (elementSuborderData.decor?.data?.attributes?.ceramogranite?.data?.attributes?.image?.data?.attributes?.url) {
              decorImg = elementSuborderData.decor.data.attributes.ceramogranite.data.attributes.image.data.attributes.url;
            } else if (elementSuborderData.decor?.data?.attributes?.paint?.data?.attributes?.main_properties?.image?.data?.attributes?.url) {
              decorImg = elementSuborderData.decor.data.attributes.paint.data.attributes.main_properties.image.data.attributes.url;
            } else if (elementSuborderData.decor?.data?.attributes?.mirror?.data?.attributes?.image?.data?.attributes?.url) {
              decorImg = elementSuborderData.decor.data.attributes.mirror.data.attributes.image.data.attributes.url;
            } else if (elementSuborderData.decor?.data?.attributes?.HPL?.data?.attributes?.image?.data?.attributes?.url) {
              decorImg = elementSuborderData.decor.data.attributes.HPL.data.attributes.image.data.attributes.url;
            } else if (elementSuborderData.decor?.data?.attributes?.primer?.data?.attributes?.image?.data?.attributes?.url) {
              decorImg = elementSuborderData.decor.data.attributes.primer.data.attributes.image.data.attributes.url;
            }

            elementSuborderData.decor.img = decorImg;

            elementDataArray.push(elementSuborderData);
          } catch (error) {
            console.error('Error query Elements', error);
          }
        }

        elementsData = elementDataArray;

        // CREATE NEW ELEMENTS
        for (let i = 0; i< elementsData.length; i++) {
          try {
            const response = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  mutation Mutation($data: ElementSuborderInput!) {
                    createElementSuborder(data: $data) {
                      data {
                        id
                      }
                    }
                  }
                `,
                variables: {
                  data: {
                    order: newOrderId
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
            
            const newElementId = response.data.data.createElementSuborder.data.id;

          // UPDATE NEW ELEMENTS
            try {
              const response = await axios.post(
                'https://api.boki.fortesting.com.ua/graphql',
                {
                  query: `
                    mutation Mutation($updateElementSuborderId: ID!, $data: ElementSuborderInput!) {
                      updateElementSuborder(id: $updateElementSuborderId, data: $data) {
                        data {
                          id
                        }
                      }
                    }
                  `,
                  variables: {
                    updateElementSuborderId: newElementId,
                    data: {
                      decor: elementsData[i].decor.data.id,
                      element: elementsData[i].element.data.id,
                      amount: elementsData[i].amount,
                      basicPrice: elementsData[i].basicPrice,
                      sizes: elementsData[i].sizes,
                      type: elementsData[i].type,
                      price: elementsData[i].price,
                    },
                  },
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                  },
                }
              )
            } catch (error) {
              console.error('Error updating Element:', error);
            }

          } catch (error) {
              console.error('Error creating Element:', error);
          }
        }
      }

      // FIITINGS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++        
      if (subordersId.fittings) {
      
        // QUERY LOCK
        try {
          const lockFittingResponse = await axios.post(
            'https://api.boki.fortesting.com.ua/graphql',
            {
              query: `
                query Query($frameFittingId: ID) {
                  frameFitting(id: $frameFittingId) {
                    data {
                      attributes {
                        title
                        price
                        basicPrice
                        type
                        lock {
                          data {
                            id
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
                          }
                        }
                      }
                    }
                  }
                }
              `,
              variables: {
                frameFittingId: subordersId.fittings.lock,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );
      
          const lockFittingData = lockFittingResponse?.data?.data?.frameFitting?.data?.attributes;
          lockData = lockFittingData

        } catch (error) {
          console.error('Error query Lock', error);
        }

        // CREATE LOCK
        try {
          const fittingSuborderLock = await axios.post(
            'https://api.boki.fortesting.com.ua/graphql',
            {
              query: `
                mutation CreateFrameFitting($data: FrameFittingInput!) {
                  createFrameFitting(data: $data) {
                    data {
                      id
                    }
                  }
                }
              `,
              variables: {
                data: {
                  order: newOrderId,
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
            
          const newFittingSuborderId = fittingSuborderLock.data.data.createFrameFitting.data.id;
          
          // UPDATE LOCK
          try {
            await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  mutation UpdateFrameFitting($updateFrameFittingId: ID!, $data: FrameFittingInput!) {
                    updateFrameFitting(id: $updateFrameFittingId, data: $data) {
                      data {
                        id
                      }
                    }
                  }
                `,
                variables: {
                  updateFrameFittingId: newFittingSuborderId,
                  data: {
                    lock: lockData.lock.data.id,
                    type: lockData.type,
                    title: lockData.title,
                    price: lockData.price,
                    basicPrice: lockData.basicPrice,
                  }
                }
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken}`,
                },
              }
            )
          } catch (error) {
            console.error('Error update Lock', error);
          }
        } catch (error) {
          console.error('Error create Lock', error);
        }

        // QUERY HINGE
        try {
          const hingeFittingResponse = await axios.post(
            'https://api.boki.fortesting.com.ua/graphql',
            {
              query: `
                query Query($frameFittingId: ID) {
                  frameFitting(id: $frameFittingId) {
                    data {
                      attributes {
                        title
                        price
                        basicPrice
                        type
                        amount
                        hinge {
                          data {
                            id
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
                          }
                        }
                      }
                    }
                  }
                }
              `,
              variables: {
                frameFittingId: subordersId.fittings.hinge,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );
      
          const hingeFittingData = hingeFittingResponse?.data?.data?.frameFitting?.data?.attributes;
          hingeData = hingeFittingData;

          // CREATE HINGE
          try {
            const fittingSuborderHinge = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  mutation CreateFrameFitting($data: FrameFittingInput!) {
                    createFrameFitting(data: $data) {
                      data {
                        id
                      }
                    }
                  }
                `,
                variables: {
                  data: {
                    order: newOrderId,
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
              
            const newFittingSuborderId = fittingSuborderHinge.data.data.createFrameFitting.data.id;
            
            // UPDATE HINGE
            try {
              await axios.post(
                'https://api.boki.fortesting.com.ua/graphql',
                {
                  query: `
                    mutation UpdateFrameFitting($updateFrameFittingId: ID!, $data: FrameFittingInput!) {
                      updateFrameFitting(id: $updateFrameFittingId, data: $data) {
                        data {
                          id
                        }
                      }
                    }
                  `,
                  variables: {
                    updateFrameFittingId: newFittingSuborderId,
                    data: {
                      hinge: hingeData.hinge.data.id,
                      type: hingeData.type,
                      title: hingeData.title,
                      price: hingeData.price,
                      basicPrice: hingeData.basicPrice,
                      amount: hingeData.amount,
                    }
                  }
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                  },
                }
              )
            } catch (error) {
              console.error('Error update Hinge', error);
            }
          } catch (error) {
            console.error('Error create Hinge', error);
          }

        } catch (error) {
          console.error('Error qury Hinge', error);
        }

        // QUERY KNOBE
        try {
          const knobeFittingResponse = await axios.post(
            'https://api.boki.fortesting.com.ua/graphql',
            {
              query: `
                query Query($frameFittingId: ID) {
                  frameFitting(id: $frameFittingId) {
                    data {
                      attributes {
                        title
                        price
                        basicPrice
                        type
                        knobe_variant
                        knobe {
                          data {
                            id
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
                          }
                        }
                      }
                    }
                  }
                }
              `,
              variables: {
                frameFittingId: subordersId.fittings.knobe,
              },
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`,
              },
            }
          );
      
          const knobeFittingData = knobeFittingResponse?.data?.data?.frameFitting?.data?.attributes;
          knobeData = knobeFittingData;

          // CREATE KNOBE
          try {
            const fittingSuborderKnobe = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  mutation CreateFrameFitting($data: FrameFittingInput!) {
                    createFrameFitting(data: $data) {
                      data {
                        id
                      }
                    }
                  }
                `,
                variables: {
                  data: {
                    order: newOrderId,
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
              
            const newFittingSuborderId = fittingSuborderKnobe.data.data.createFrameFitting.data.id;
            
            // UPDATE KNOBE
            try {
              await axios.post(
                'https://api.boki.fortesting.com.ua/graphql',
                {
                  query: `
                    mutation UpdateFrameFitting($updateFrameFittingId: ID!, $data: FrameFittingInput!) {
                      updateFrameFitting(id: $updateFrameFittingId, data: $data) {
                        data {
                          id
                        }
                      }
                    }
                  `,
                  variables: {
                    updateFrameFittingId: newFittingSuborderId,
                    data: {
                      knobe: knobeData.knobe.data.id,
                      type: knobeData.type,
                      title: knobeData.title,
                      price: knobeData.price,
                      basicPrice: knobeData.basicPrice,
                      knobe_variant: knobeData.knobe_variant,
                    }
                  }
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${jwtToken}`,
                  },
                }
              )
            } catch (error) {
              console.error('Error update Knobe', error);
            }

          } catch (error) {
            console.error('Error create Knobe', error);
          }


        } catch (error) {
          console.error('Error query Knobe', error);
        }
      }

      // OPTIONS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      if (subordersId.options) {
        
        // QUERY OPTIONS
        const optionsDataArray = [];

        for (const optionId of subordersId.options) {
          try {
            const optionSuborderResponse = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
                  query Query($optionSuborderId: ID) {
                    optionSuborder(id: $optionSuborderId) {
                      data {
                        id
                        attributes {
                          title
                          price
                          basicPrice
                          custom
                          option {
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
                  optionSuborderId: optionId,
                },
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken}`,
                },
              }
            );

            const optionSuborderData = optionSuborderResponse?.data?.data?.optionSuborder?.data?.attributes;
            optionsDataArray.push(optionSuborderData);
          } catch (error) {
            console.error('Error query Options', error);
          }
        }

        optionsData = optionsDataArray;

        // CREATE OPTIONS
        for (let i = 0; i< optionsData.length; i++) {
          try {
            const response = await axios.post(
              'https://api.boki.fortesting.com.ua/graphql',
              {
                query: `
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
                    order: newOrderId,
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
            
            const createdOptionSuborderId = response.data.data.createOptionSuborder.data.id;

              // UPDATE OPTIONS
              try {
                const response = await axios.post(
                  'https://api.boki.fortesting.com.ua/graphql',
                  {
                    query: `
                      mutation Mutation($updateOptionSuborderId: ID!, $data: OptionSuborderInput!) {
                        updateOptionSuborder(id: $updateOptionSuborderId, data: $data) {
                          data {
                            id
                          }
                        }
                      }
                    `,
                    variables: {
                      updateOptionSuborderId: createdOptionSuborderId,
                      data: {
                        title: optionsData[i].title,
                        price: optionsData[i].price,
                        basicPrice: optionsData[i].price,
                        option: optionsData[i].option.data.id,
                        custom: optionsData[i].custom,
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
                console.error('Error updating Option', error);
              }
            
          } catch (error) {
            console.error('Error creating Option', error);
          }
        }
      }

    } catch (error) {
      console.error('Error query Order', error);
    }
};
