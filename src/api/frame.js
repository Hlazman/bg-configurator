import axios from 'axios';
import {queryLink} from './variables'


export const getFrameData = async (jwtToken, orderIdToUse, setOrderData, form, setFrameFilter) => {
  try {
    axios.post(queryLink,
      { query: `
          query Query($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  hidden
                  double_door
                  opening
                  side
                  door_suborder {
                    data {
                      attributes {
                        decor {
                          data {
                            id
                          }
                        }
                        sizes {
                          height
                          thickness
                          width
                        }
                        door {
                          data {
                            attributes {
                              collection
                            }
                          }
                        }
                      }
                    }
                  }
                  frame_suborder {
                    data {
                      attributes {
                        frame {
                          data {
                            attributes {
                              title
                            }
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
    ).then(response => {
      const data = response.data?.data?.order?.data?.attributes || {};
      setOrderData(data);
      
      const framesFilter = {
        hidden: data?.hidden,
        opening: data?.opening,
        collection: data?.door_suborder?.data?.attributes?.door?.data?.attributes?.collection,
      } || {};

      setFrameFilter(framesFilter);

      if (data?.frame_suborder?.data?.attributes?.frame?.data?.id) {
        form.setFieldsValue({
          name: data?.frame_suborder?.data?.attributes?.frame.data.id,
        });
      }
    });
  }
  catch (error) {
    console.error('Error:', error);
  }
};

export const getFrames = async (jwtToken, setFrames, currentStepSend, setBtnColor, framesFilter) => {
  try {
    axios.post(queryLink,
      {query: `
          query Frames($pagination: PaginationArg, $filters: FrameFiltersInput) {
            frames(pagination: $pagination, filters: $filters) {
              data {
                attributes {
                  title
                }
                id
              }
            }
          }
        `,
        variables: {
          pagination: {
            limit: 20
          },
          filters: {
            "hidden": {
              "eqi": framesFilter.hidden
            },
            "opening": {
              "eqi": framesFilter.opening
            },
            "collection": {
              "eqi": framesFilter.collection
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
    ).then(response => {
      const data = response.data?.data?.frames?.data || [];
      setFrames(data);
    });

    if (currentStepSend && currentStepSend.frameSend) {
      setBtnColor('#4BB543');
    }
  }
  catch (error) {
    console.error('Error:', error);
  }
};

export const updateFrameSuborder = async (
  jwtToken, frameSuborderId, dataToUpdate, setBtnColor, messageApi, setCurrentStepSend, language
  ) => {
  try {
    axios.post(queryLink,
      {query: `
          mutation Mutation($updateFrameSuborderId: ID!, $data: FrameSuborderInput!) {
            updateFrameSuborder(id: $updateFrameSuborderId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateFrameSuborderId: frameSuborderId,
          data: dataToUpdate
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        }
      }
    ).then(response => {
      messageApi.success(language.successQuery);
      if (setCurrentStepSend) {
        setCurrentStepSend(prevState => {
          return {
            ...prevState,
            frameSend: true
          };
        });
      }
      setBtnColor('#4BB543');
    }).catch(error => {
      messageApi.error(language.errorQuery);
    });
  }
  catch (error) {
    console.error('Error:', error);
  }
};


// FOR TEST
export const updateFrame = async (orderIdToUse, jwtToken, frameSuborderId, selectedDecorId)=> {
  let framesFilter = {};
  let frameId = '';
  let frameSuborderData = {};

  // ORDER DATA
  try {
    await axios.post(queryLink,
      { query: `
          query Query($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  hidden
                  double_door
                  opening
                  side
                  door_suborder {
                    data {
                      attributes {
                        decor {
                          data {
                            id
                          }
                        }
                        sizes {
                          height
                          thickness
                          width
                        }
                        door {
                          data {
                            attributes {
                              collection
                            }
                          }
                        }
                      }
                    }
                  }
                  frame_suborder {
                    data {
                      attributes {
                        frame {
                          data {
                            attributes {
                              title
                            }
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
    ).then(response => {
      const data = response.data?.data?.order?.data?.attributes || {};
      
      framesFilter = {
        hidden: data?.hidden,
        opening: data?.opening,
        collection: data?.door_suborder?.data?.attributes?.door?.data?.attributes?.collection,
      } || {};

      frameSuborderData = {
        decor: data?.door_suborder?.data?.attributes?.decor?.data?.id,
        side: data?.side,
        sizes: {
          height: data?.door_suborder?.data?.attributes?.sizes?.height,
          thickness: data?.door_suborder?.data?.attributes?.sizes?.thickness,
          width: data?.door_suborder?.data?.attributes?.sizes?.width,
        }
      };

    });
  }
  catch (error) {
    console.error('Error:', error);
  }

  // FRAME
  try {
    await axios.post(queryLink,
      {query: `
          query Frames($pagination: PaginationArg, $filters: FrameFiltersInput) {
            frames(pagination: $pagination, filters: $filters) {
              data {
                attributes {
                  title
                }
                id
              }
            }
          }
        `,
        variables: {
          pagination: {
            limit: 20
          },
          filters: {
            "hidden": {
              "eqi": framesFilter.hidden
            },
            "opening": {
              "eqi": framesFilter.opening
            },
            "collection": {
              "eqi": framesFilter.collection
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
    ).then(response => {
      // const data = response.data?.data?.frames?.data[0].id;
      const data = response.data?.data?.frames?.data[0].id;
      frameId = data;

    });
  }
  catch (error) {
    console.error('Error:', error);
  }

  // UPDATE FRAME SUBORDER
  try {
    axios.post(queryLink,
      {query: `
          mutation Mutation($updateFrameSuborderId: ID!, $data: FrameSuborderInput!) {
            updateFrameSuborder(id: $updateFrameSuborderId, data: $data) {
              data {
                id
              }
            }
          }
        `,
        variables: {
          updateFrameSuborderId: frameSuborderId,
          data: {
            frame: frameId,
            decor: selectedDecorId ? selectedDecorId : frameSuborderData?.decor,
            side: frameSuborderData?.side,
            sizes: {
              height: frameSuborderData?.sizes?.height,
              thickness: frameSuborderData?.sizes?.thickness,
              width: frameSuborderData?.sizes?.width,
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
  }
  catch (error) {
    console.error('Error:', error);
  }
};
