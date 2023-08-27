// import React, { useState, useEffect } from 'react';
// import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
// import axios from 'axios';

// const StoneStep = ({ formData, handleCardClick, handleNext }) => {
//   const [stoneData, setStoneData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const jwtToken = localStorage.getItem('token');

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.post(
//           'https://api.boki.fortesting.com.ua/graphql',
//           {
//             query: `
//               query Ceramogranites {
//                 ceramogranites {
//                   data {
//                     id
//                     attributes {
//                       image {
//                         data {
//                           attributes {
//                             url
//                           }
//                         }
//                       }
//                       title
//                     }
//                   }
//                 }
//               }
//             `,
//           },
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${jwtToken}`,
//             },
//           }
//         );

//         const ceramogranites = response.data.data.ceramogranites.data;
//         setStoneData(ceramogranites);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//       setIsLoading(false);
//     };

//     fetchData();
//   }, [jwtToken]);

//   const filteredImgUrls = stoneData.map(stone => stone.attributes.image.data.attributes.url);

//   return (
//     <Form onFinish={formData} onValuesChange={formData}>
//       <Divider />

//       {isLoading ? (
//         <div style={{ textAlign: 'center', marginTop: '20px' }}>
//           <Spin size="large" />
//         </div>
//       ) : (
//         <Form.Item name="step2Field">
//           <Radio.Group value={formData.step2Field}>
//             <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
//               {filteredImgUrls.map((imgUrl) => {
//                 const stone = stoneData.find(
//                   stone =>
//                     stone.attributes.image.data.attributes.url === imgUrl
//                 );
//                 return (
//                   <div key={stone.id} style={{ width: 220, margin: '20px 10px' }}>
//                     <Card
//                       className="custom-card"
//                       hoverable
//                       style={{
//                         border:
//                           formData.step2Field === stone.id
//                             ? '7px solid #f06d20'
//                             : 'none',
//                       }}
//                       onClick={() => handleCardClick('step2Field', stone.id)}
//                     >
//                       <div style={{ overflow: 'hidden', height: 220 }}>
//                         <img
//                           src={`https://api.boki.fortesting.com.ua${imgUrl}`}
//                           alt={stone.attributes.title}
//                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                         />
//                       </div>
//                       <Card.Meta
//                         title={stone.attributes.title}
//                         style={{ paddingTop: '10px' }}
//                       />
//                       <Radio value={stone.id} style={{ display: 'none' }} />
//                     </Card>
//                   </div>
//                 );
//               })}
//             </div>
//           </Radio.Group>
//         </Form.Item>
//       )}

//       <Button type="primary" onClick={handleNext}>
//         Далее
//       </Button>
//     </Form>
//   );
// };

// export default StoneStep;

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Radio, Divider, Spin } from 'antd';
import axios from 'axios';

const StoneStep = ({ formData, handleCardClick, handleNext }) => {
  const [stoneData, setStoneData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(
          'https://api.boki.fortesting.com.ua/graphql',
          {
            query: `
              query Ceramogranites {
                ceramogranites {
                  data {
                    id
                    attributes {
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
            `,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const ceramogranites = response.data.data.ceramogranites.data;
        setStoneData(ceramogranites);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [jwtToken]);

  const filteredStoneData = stoneData.filter(stone =>
    stone.attributes.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Form onFinish={formData} onValuesChange={formData}>
      <div style={{ display: 'flex', gap: '30px' }}>
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
      </div>
      <Divider />

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form.Item name="step2Field">
          <Radio.Group value={formData.step2Field}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {filteredStoneData.map(stone => (
                <div key={stone.id} style={{ width: 220, margin: '20px 10px' }}>
                  <Card
                    className="custom-card"
                    hoverable
                    style={{
                      border:
                        formData.step2Field === stone.id ? '7px solid #f06d20' : 'none',
                    }}
                    onClick={() => handleCardClick('step2Field', stone.id)}
                  >
                    <div style={{ overflow: 'hidden', height: 220 }}>
                      <img
                        src={`https://api.boki.fortesting.com.ua${stone.attributes.image.data.attributes.url}`}
                        alt={stone.attributes.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Meta title={stone.attributes.title} style={{ paddingTop: '10px' }} />
                    <Radio value={stone.id} style={{ display: 'none' }} />
                  </Card>
                </div>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>
      )}

      <Button type="primary" onClick={handleNext}>
        Далее
      </Button>
    </Form>
  );
};

export default StoneStep;
