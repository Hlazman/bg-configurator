import axios from 'axios';
import {queryLink} from './variables'


export const getCompanyData = async (jwtToken, selectedCompany, setCompanyData) => {
  try {
    const response = await axios.post(
      queryLink,
      {
        query: `
          query Company($companyId: ID) {
            company(id: $companyId) {
              data {
                attributes {
                  contacts {
                    email
                    phone
                    phone_2
                    website
                  }
                  logo {
                    data {
                      attributes {
                        url
                      }
                    }
                  }
                  name
                }
              }
            }
          }
        `,
        variables: {
          companyId: selectedCompany,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (response && response?.data && response?.data?.data && response?.data?.data?.company) {
      const companyData = response?.data?.data?.company?.data?.attributes;
      setCompanyData(companyData);
    } else {
      console.error('Error: Invalid response structure or missing data');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};