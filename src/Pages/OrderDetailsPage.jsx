import React, { useEffect, useState, useContext } from 'react';
import { Button, Divider } from 'antd';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { useOrder } from '../Context/OrderContext';
import { OrderDescription } from '../Components/OrderDescription';
import { OrderDescriptionFactory } from '../Components/OrderDescriptionFactory';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../Context/LanguageContext';
import languageMap from '../Languages/language';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LeftCircleOutlined } from '@ant-design/icons';


export const OrderDetailsPage = ({fromTotalOrder, isCreatingTotalPdf, orderName, currancyValue}) => {
  const { user } = useContext(AuthContext);
  const jwtToken = localStorage.getItem('token');
  const { orderId, setOrderId } = useOrder();
  const [orderData, setOrderData] = useState(null);
  const [subordersId, setSubordersId] = useState(null);
  const { selectedLanguage } = useLanguage();
  const language = languageMap[selectedLanguage];

  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const navigate = useNavigate();

  const [doorData, setDoorData] = useState(null);
  const [frameData, setFrameData] = useState(null);
  const [elementData, setElementData] = useState(null);
  const [lockData, setLockData] = useState(null);
  const [hingeData, setHingeData] = useState(null);
  const [knobeData, setKnobeData] = useState(null);
  const [optionsData, setOptionsData] = useState(null);
  const presentation = localStorage.getItem('presentation');

  const embedImages = async () => {
    const images = document.querySelectorAll('img');
    const promises = Array.from(images).map(async (img) => {
      const src = img.src;
      const response = await fetch(src);
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      img.src = dataUrl;
    });

    await Promise.all(promises);
  };

  const handlePdfExport = async () => {
    setIsCreatingPdf(true);
    const element = document.getElementById('pdf-content');
    await embedImages();
  
    await html2pdf()
      .from(element)
      .set({
        margin: [5, 0, 5, 0], 
        filename: `Order ${fromTotalOrder ? fromTotalOrder : orderId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all', after: '#nextpage' }
      })
      .save();
      setIsCreatingPdf(false);
  };
  
  const fetchData = async () => {
    try {
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
                    hidden
                    opening
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
            orderId: fromTotalOrder ? fromTotalOrder : orderId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      const orderData = response?.data?.data?.order?.data?.attributes;
      setOrderData(orderData);

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
      setSubordersId(subordersId);
        
      if (subordersId.frame) {
        fetchFrameData(subordersId.frame);
      }

      if (subordersId.door) {
        fetchDoorData(subordersId.door);
      }

      if (subordersId.elements) {
        fetchElementsData(subordersId.elements)
      }

      if (subordersId.fittings) {
        fetchLockData(subordersId.fittings.lock);
        fetchHingeData(subordersId.fittings.hinge);
        fetchKnobeData(subordersId.fittings.knobe);
      }

      if (subordersId.options) {
        fetchOptionsData(subordersId.options)
      }

    } catch (error) {
      console.error('Error while fetching order data:', error);
    }
  };

const fetchFrameData = async (frameId) => {
  try {
      const frameSuborderResponse = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            query Query($frameSuborderId: ID) {
              frameSuborder(id: $frameSuborderId) {
                data {
                  attributes {
                    frame {
                      data {
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
            frameSuborderId: frameId,
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
      setFrameData(frameSuborderData);
    
  } catch (error) {
    console.error('Error while fetching frame suborder data:', error);
  }
}

const fetchDoorData = async (doorId) => {
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
          doorSuborderId: doorId,
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

    setDoorData(doorSuborderData);
  } catch (error) {
    console.error('Error while fetching door suborder data:', error);
  }
}

const fetchElementsData = async (elementIds) => {
  const elementDataArray = [];

  for (const elementId of elementIds) {
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
                        attributes {
                          title
                        }
                      }
                    }
                    decor {
                      data {
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
      console.error('Error while fetching element suborder data:', error);
    }
  }

  setElementData(elementDataArray);
}

const fetchHingeData = async (hingeId) => {
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
          frameFittingId: hingeId,
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
    setHingeData(hingeFittingData);
  } catch (error) {
    console.error('Error while fetching hinge fitting data:', error);
  }
}

const fetchKnobeData = async (knobeid) => {
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
          frameFittingId: knobeid,
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
    setKnobeData(knobeFittingData);
  } catch (error) {
    console.error('Error while fetching knobe fitting data:', error);
  }
}

const fetchLockData = async (lockId) => {
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
          frameFittingId: lockId,
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
    setLockData(lockFittingData);
  } catch (error) {
    console.error('Error while fetching lock fitting data:', error);
  }
}

const { orderId: urlOrderId } = useParams();

useEffect(() => {
  if (!orderId) {
    setOrderId(urlOrderId);
    fetchData();
  } else {
    fetchData();
  }  
}, [jwtToken, orderId, urlOrderId]);


const fetchOptionsData = async (optionIds) => {
  const optionsDataArray = [];

  for (const optionId of optionIds) {
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
      console.error('Error while fetching option suborder data:', error);
    }
  }

  setOptionsData(optionsDataArray);
};

  return (
    <div>
      {/* SINGLEORDER */}
      {presentation === 'singleOrder' && (
        <div>
          
          <div style={{display: 'flex', gap: '20px', justifyContent: 'space-between', margin: '20px 50px'}}>
            <Button icon={<LeftCircleOutlined />} type="dashed" onClick={()=> navigate(`/orders`)}> {language.orderList} </Button>
            <Button type="primary" size={'large'} onClick={handlePdfExport}>{language.save} PDF</Button>
          </div>

          <div id="pdf-content">
            <OrderDescription
              orderId={orderId}
              orderData={orderData}
              frameData={frameData}
              doorData={doorData}
              elementData={elementData}
              hingeData={hingeData}
              knobeData={knobeData}
              lockData={lockData}
              optionsData={optionsData}
              isCreatingPdf={isCreatingPdf}
            />
          </div>
        </div>
      )}

        {/* FACTORY */}
       {presentation === 'factory' && (
            <OrderDescriptionFactory
              orderId={orderId} 
              orderData={orderData}
              frameData={frameData}
              doorData={doorData}
              elementData={elementData}
              hingeData={hingeData}
              knobeData={knobeData}
              lockData={lockData}
              optionsData={optionsData}
              isCreatingPdf={isCreatingTotalPdf}
              orderName={orderName}
              currancyValue={currancyValue}
            />
      )}

        {/* FULL TOATAL ORDER */}
        {/* SHORT TOATAL ORDER */}

    </div>
  );
};
