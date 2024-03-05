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