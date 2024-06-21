import axios from 'axios';
import {queryLink} from './variables'

export const deleteOrderWithSuborders = async (orderId, jwtToken) => {
  
  let doorSuborder = {};
  let frameSuborder  = {};
  let slidingSuborder  = {};
  let elementsSuborder = [];
  let fittingSuborders = [];
  let optionSuborders = [];

  try {
    const response = await axios.post(
      queryLink,
      {
        query: `
          query Query($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
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
                    }
                  }
                  frame_suborder {
                    data {
                      id
                    }
                  }
                  sliding_suborder {
                    data {
                      id
                    }
                  }
                  option_suborders {
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

    
    if (response.data.data && response.data.data.order) {
      const orderData = response.data.data.order.data.attributes;
      
      doorSuborder = orderData?.door_suborder?.data?.id;
      frameSuborder = orderData?.frame_suborder.data?.id;
      slidingSuborder = orderData?.sliding_suborder.data?.id;
      elementsSuborder = [...orderData?.element_suborders.data];
      fittingSuborders = [...orderData?.fitting_suborders.data];
      optionSuborders = [...orderData?.option_suborders.data];
    }

 // DELETE ORDER +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  try {
    const response = await axios.post(
      queryLink,
      {
        query: `
          mutation Mutation($deleteOrderId: ID!) {
            deleteOrder(id: $deleteOrderId) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          deleteOrderId: orderId,
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
      console.error('Error delete Order', error)
  };

  // DELETE DOOR SUBORDER +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  try {
    const response = await axios.post(
      queryLink,
      {
        query: `
          mutation DeleteFrameSuborder($deleteDoorSuborderId: ID!) {
            deleteDoorSuborder(id: $deleteDoorSuborderId) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          deleteDoorSuborderId: doorSuborder,
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
      console.error('Error delete Door Suborder', error)
  };

  // DELETE FRAME SUBORDER ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  try {
    const response = await axios.post(
      queryLink,
      {
        query: `
          mutation DeleteFrameSuborder($deleteFrameSuborderId: ID!) {
            deleteFrameSuborder(id: $deleteFrameSuborderId) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          deleteFrameSuborderId: frameSuborder,
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
      console.error('Error delete Frame Suborder', error)
  };

  // DELETE SLIDING SUBORDERS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  try {
    const response = await axios.post(
      queryLink,
      {
        query: `
          mutation Mutation($deleteSlidingSuborderId: ID!) {
            deleteSlidingSuborder(id: $deleteSlidingSuborderId) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          deleteSlidingSuborderId: slidingSuborder,
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
      console.error('Error delete Frame Suborder', error)
  };

  // DELETE FITTINGS SUBORDERS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  for (let i = 0; i< fittingSuborders.length; i++) {
    try {
      const response = await axios.post(
        queryLink,
        {
          query: `
            mutation DeleteFrameSuborder($deleteFrameFittingId: ID!) {
              deleteFrameFitting(id: $deleteFrameFittingId) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            deleteFrameFittingId: fittingSuborders[i].id,
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
        console.error('Error delete Fitting Suborder', error)
    };
  }

  // DELETE ELEMENTS SUBORDERS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  for (let i = 0; i< elementsSuborder.length; i++) {
    try {
      const response = await axios.post(
        queryLink,
        {
          query: `
            mutation DeleteFrameSuborder($deleteElementSuborderId: ID!) {
              deleteElementSuborder(id: $deleteElementSuborderId) {
                data {
                  id
                }
              }
            }
          `,
          variables: {
            deleteElementSuborderId: elementsSuborder[i].id,
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
        console.error('Error delete Option Suborder', error)
    };
  }

    // DELETE OPTIONS SUBORDERS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    for (let i = 0; i< optionSuborders.length; i++) {
      try {
        const response = await axios.post(
          queryLink,
          {
            query: `
              mutation DeleteFrameSuborder($deleteOptionSuborderId: ID!) {
                deleteOptionSuborder(id: $deleteOptionSuborderId) {
                  data {
                    id
                  }
                }
              }
            `,
            variables: {
              deleteOptionSuborderId: optionSuborders[i].id,
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
          console.error('Error delete Order', error)
      };
    }

  } catch (error) {
    console.error('Error query Order', error);
  }
}