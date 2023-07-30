import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user data is available in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, rememberMe) => {
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const loginUserWithApi = async (email, password, rememberMe) => {
    try {
      const response = await axios.post(
        'https://api.boki.fortesting.com.ua/graphql',
        {
          query: `
            mutation {
              login(input: {
                identifier: "${email}"
                password: "${password}"
              }) {
                user {
                  id
                  username
                  email
                }
                jwt
              }
            }
          `,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { data } = response.data;
      if (data && data.login && data.login.jwt && data.login.user) {
        // Successful login, set user data and token
        const { user, jwt } = data.login;
        setUser(user);
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        localStorage.setItem('token', jwt);
      } else {
        // Handle login error here if needed
        console.error('Login failed');
      }
    } catch (error) {
      // Handle error here if needed
      console.error('Error occurred during login:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        loginUserWithApi,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


