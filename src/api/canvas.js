import axios from 'axios';
import {queryLink} from './variables'

export const updateCanvas = async (jwtToken, updateDoorSuborderId, data, messageApi, language, setCurrentStepSend, setBtnColor, getValid ) => {
  try {
    const response = await axios.post(
      // 'https://api.boki.fortesting.com.ua/graphql',
      queryLink,
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
          updateDoorSuborderId: updateDoorSuborderId,
          data: data
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    
    // if (response.data.errors) {
    //   // console.log(response.data.errors)
    //   throw new Error()
      
    // } else {
    //   messageApi.success(language.successQuery);
    // }

    messageApi.success(language.successQuery);

    if (setCurrentStepSend) {
      setCurrentStepSend(prevState => {
        return {
          ...prevState,
          canvasSend: true
        };
      });
    }
    setBtnColor('#4BB543');

    getValid();

  } catch (error) {
    console.error(error);
    messageApi.error(`${language.errorQuery}. ${language.wrongSize}`); 
  }
}