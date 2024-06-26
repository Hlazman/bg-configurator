import axios from 'axios';
import {queryLink} from './variables'


export const getSlidings = async (orderIdToUse, jwtToken, setSlidingData) => {
  let slidings = {};

  try {
   await axios.post(queryLink,
      { query: `
          query Slidings($pagination: PaginationArg) {
            slidings(pagination: $pagination) {
              data {
                id
                attributes {
                  description
                  doubleSidedCloser
                  fittingsArticle
                  image {
                    data {
                      id
                      attributes {
                        url
                      }
                    }
                  }
                  kitArticle
                  price
                  shockAbsorber
                  title
                  trackArticle
                  installation
                  maxThickness
                  maxWeight
                  maxWidth
                  minThickness
                  minWidth
                  oneSidedCloser
                  rollerType
                }
              }
            }
          }
        `,
        variables: {
          orderId: orderIdToUse,
          "sort": [
            "title:asc"
          ],
          "pagination": {
            "limit": 50
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
      slidings = response.data?.data?.slidings?.data;
      
      // console.log('slidings', slidings)
    });
  }
  catch (error) {
    console.error('Error:', error);
  }

  setSlidingData(slidings);
}

export const getSlidingData = async (orderIdToUse, jwtToken, setPreviousSlidingId, setSlidingData) => {
  let slidingId = '';
  let sliding = '';

  try {
   await axios.post(queryLink,
      { query: `
          query Query($orderId: ID) {
            order(id: $orderId) {
              data {
                attributes {
                  sliding_suborder {
                    data {
                      attributes {
                        basicPrice
                        price
                        sliding {
                          data {
                            attributes {
                              description
                              doubleSidedCloser
                              fittingsArticle
                              image {
                                data {
                                  attributes {
                                    url
                                  }
                                }
                              }
                              installation
                              kitArticle
                              maxThickness
                              maxWeight
                              maxWidth
                              minThickness
                              minWidth
                              oneSidedCloser
                              rollerType
                              shockAbsorber
                              title
                              trackArticle
                              price
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
      slidingId = response.data?.data?.order?.data?.attributes?.sliding_suborder?.data?.attributes?.sliding.data?.id;
      // sliding = response.data?.data?.order?.data?.attributes?.sliding_suborder?.data?.attributes?.sliding.data?.attributes;
      sliding = response.data?.data?.order?.data?.attributes?.sliding_suborder?.data;
    });
  }
  catch (error) {
    console.error('Error:', error);
  }
  
  if (setPreviousSlidingId !== null) {
    setPreviousSlidingId(slidingId);
  }

  if (setSlidingData !== null) {
    setSlidingData(sliding);
  }
}

export const updateSliding = async (jwtToken, slidingSuborderId, previousSlidingId, messageApi, language) => {
  try {
   await axios.post(queryLink,
      { query: `
          mutation Mutation($data: SlidingSuborderInput!, $updateSlidingSuborderId: ID!) {
              updateSlidingSuborder(data: $data, id: $updateSlidingSuborderId) {
                data {
                  id
                }
              }
            }
        `,
        variables: {
          updateSlidingSuborderId: slidingSuborderId,
              data: {
                sliding: previousSlidingId,
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
      if (messageApi !== null && language !== null) {
        messageApi.success(language.successQuery); 
      }
    });
  }
  catch (error) {
    console.error('Error:', error);
  }
}

export const removeSlidingSuborderData = async (jwtToken, slidingSuborderId) => {
  try {
    await axios.post(queryLink,
       { query: `
           mutation Mutation($data: SlidingSuborderInput!, $updateSlidingSuborderId: ID!) {
               updateSlidingSuborder(data: $data, id: $updateSlidingSuborderId) {
                 data {
                   id
                 }
               }
             }
         `,
         variables: {
           updateSlidingSuborderId: slidingSuborderId,
               data: {
                 sliding: null,
                 price: null,
                 basicPrice: null,
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
}

