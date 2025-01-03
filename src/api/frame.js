import axios from 'axios';
import {queryLink} from './variables'
import {updateError} from './validationOrder'


// export const getFrameData = async (orderIdToUse, jwtToken, setFrameSuborderData, setFrames, setSelectedFrame, setIsthreshold)=> {
export const getFrameData = async (orderIdToUse, jwtToken, setFrameSuborderData, setFrames, setSelectedFrame, setIsthreshold, setIsNewConstruct)=> {
  let filters = {};
  let suborderData = {};
  let frameSuborderID = '';
  let frameID = '';
  let doorModel = '';
  
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
                              product_properties {
                                title
                              }
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
                        threshold
                        newConstruct
                      }
                      id
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
      frameSuborderID = response.data?.data?.order?.data.attributes?.frame_suborder?.data?.id;
      frameID = response.data?.data?.order?.data.attributes?.frame_suborder?.data.attributes?.frame?.data?.id;
      doorModel = data?.door_suborder?.data?.attributes?.door?.data?.attributes?.product_properties?.title;
      
      const threshold = response.data?.data?.order?.data.attributes?.frame_suborder?.data.attributes?.threshold;

      const newConstruct = response.data?.data?.order?.data.attributes?.frame_suborder?.data.attributes?.newConstruct; // newConstruct

      filters = {
        hidden: data?.hidden,
        opening: data?.opening,
        collection: data?.door_suborder?.data?.attributes?.door?.data?.attributes?.collection,
      } || {};

      suborderData = {
        frameSuborderID : frameSuborderID,
        threshold: threshold,
        newConstruct: newConstruct, // newConstruct
        decor: data?.door_suborder?.data?.attributes?.decor?.data?.id,
        side: data?.side,
        sizes: {
          height: data?.door_suborder?.data?.attributes?.sizes?.height,
          thickness: data?.door_suborder?.data?.attributes?.sizes?.thickness,
          width: data?.door_suborder?.data?.attributes?.sizes?.width,
        },
        hidden: data?.hidden // hidden 
      };
      setSelectedFrame(frameID);
      setFrameSuborderData(suborderData);
      setIsthreshold(threshold);
      setIsNewConstruct(newConstruct); // newConstruct
    })

    if (setFrames !== null) {
      await getFrames(jwtToken, filters, setFrames, doorModel);
    }

  }
  catch (error) {
    console.error('Error:', error);
  }
};

export const getFrames = async (jwtToken, framesFilter, setFrames, doorModel)=> {

  const getOpeningFilter = (opening) => {

    if (opening === 'outside') {
      return [opening, 'universal']
    }

    if (opening === 'inside') {
      return ['universal']
    }
  }

const getTrueFrames = (data, doorModel) => {
    const numberMatch = doorModel.match(/\d+/);
    const number = numberMatch ? numberMatch[0] : null;

    return data.filter(item => {
        const title = item.attributes.title;
        if (number === '55') {
            return title === 'hidden_universal_55';
        } else if (number === '51') {
            return title === 'hidden_universal_51';
        } else if (number === '45') {
            return title === 'hidden_universal_45';
        } else {
            return title === 'hidden_outside_43' || title === 'hidden_universal_45';
        }
    });
};

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
              "in": 
                framesFilter.hidden ? getOpeningFilter(framesFilter.opening) : framesFilter.opening
            },
            "or": [
          {
            "collection": {
              "eqi": framesFilter.collection
            }
          },
          {
            "collection": {
              "eqi": null
            }
          },
        ]
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
      const data = response.data?.data?.frames?.data;
      const realFrames = getTrueFrames(data, doorModel);

      if (framesFilter.hidden) {
        setFrames(realFrames);
      } else {
        setFrames(data);
      }

      // setFrames(data);
    })
  }
  catch (error) {
    console.error('Error:', error);
  }
};

// export const updateFrameSuborder = async (jwtToken, frameSuborderData, frameId, orderIdToUse, threshold) => {
export const updateFrameSuborder = async (jwtToken, frameSuborderData, frameId, orderIdToUse, threshold, newConstruct) => {
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
          updateFrameSuborderId: frameSuborderData.frameSuborderID,
          data: {
            frame: frameId,
            threshold: threshold,
            newConstruct: newConstruct, // newConstruct
            // decor: selectedDecorId ? selectedDecorId : frameSuborderData?.decor,
            decor: frameSuborderData?.decor,
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

  // await getFrameError(orderIdToUse, jwtToken);
  await updateError(jwtToken, orderIdToUse, 'errorFrame', null);
}

export const updateDecorFrameSuborder = async (jwtToken, frameSuborderID, selectedDecorId) => {
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
          updateFrameSuborderId: frameSuborderID,
          data: {
            decor: selectedDecorId,
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

export const updateCanvasDataFrameSuborder = async (orderIdToUse, jwtToken) => {
  let suborderData = {};
  
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
                      id
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
      const frameSuborderID = response.data?.data?.order?.data.attributes?.frame_suborder?.data?.id;
      
      suborderData = {
        frameSuborderID : frameSuborderID,
        decor: data?.door_suborder?.data?.attributes?.decor?.data?.id,
        side: data?.side,
        sizes: {
          height: data?.door_suborder?.data?.attributes?.sizes?.height,
          thickness: data?.door_suborder?.data?.attributes?.sizes?.thickness,
          width: data?.door_suborder?.data?.attributes?.sizes?.width,
        }
      };

    })
  }
  catch (error) {
    console.error('Error:', error);
  }

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
          updateFrameSuborderId: suborderData.frameSuborderID,
          data: {
            decor: suborderData?.decor,
            side: suborderData?.side,
            sizes: {
              height: suborderData?.sizes?.height,
              thickness: suborderData?.sizes?.thickness,
              width: suborderData?.sizes?.width,
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

  await getFrameError(orderIdToUse, jwtToken);
}

export const getFrameError = async (orderIdToUse, jwtToken) => {
  let filters = {};
  let frameID = '';
  
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
                      id
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

      frameID = data?.frame_suborder?.data?.attributes?.frame?.data?.id
      filters = {
        hidden: data?.hidden,
        opening: data?.opening,
        collection: data?.door_suborder?.data?.attributes?.door?.data?.attributes?.collection,
      } || {};
    })
  }
  catch (error) {
    console.error('Error:', error);
  }

  
  const getOpeningFilter = (opening) => {

    if (opening === 'outside') {
      return [opening, 'universal']
    }

    if (opening === 'inside') {
      return ['universal']
    }
  }

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
              "eqi": filters.hidden
            },
            
            "opening": {
              "in": 
              filters.hidden ? getOpeningFilter(filters.opening) : filters.opening
            },

            "or": [
          {
            "collection": {
              "eqi": filters.collection
            }
          },
          {
            "collection": {
              "eqi": null
            }
          },
        ]
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
      const data = response.data?.data?.frames?.data;
      const idsArray = data.map(item => item.id);

      if (frameID) {
        if (idsArray.includes(frameID)) {
          updateError(jwtToken, orderIdToUse, 'errorFrame', null);
        } else {
          updateError(jwtToken, orderIdToUse, 'errorFrame', 'errorFrame');
        }
      }
    })
  }
  catch (error) {
    console.error('Error:', error);
  }
};

export const removeFrameSuborderData = async (jwtToken, frameSuborderId, orderIdToUse) => {
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
            // frame: null,
            frame: '64',
            threshold : false,
            newConstruct: false, // newConstruct
            price: null,
            basicPrice: null,
            decor: null,
            side: null,
            sizes: {
              height: null,
              thickness: null,
              width: null,
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

  // await getFrameError(orderIdToUse, jwtToken);
  await updateError(jwtToken, orderIdToUse, 'errorFrame', null);
}
