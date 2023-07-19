import React, { createContext, useState } from 'react';
import usersData from '../tempData/users.json';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const users = usersData.users.map((user) => ({
    ...user,
    isAuthorized: false,
  }));

  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const isRouteAllowed = (route) => {
    if (!isAuthenticated()) {
      return false;
    }

    if (user.role === 'Admin') {
      return true;
    }

    if (user.role === 'Manager') {
      const managerPermissions = ['Clients data', 'Products data'];
      if (managerPermissions.includes(route)) {
        return user.permission.includes(route);
      }
    }

    return false;
  };

  // TEMP FUNCTION
  const loginUser = (userId) => {
    const authorizedUser = users.find((user) => user.id === userId);
    if (authorizedUser) {
      authorizedUser.isAuthorized = true;
      login(authorizedUser);
    }
  };
  // TEMP FUNCTION

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isRouteAllowed, loginUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
