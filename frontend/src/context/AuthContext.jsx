import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post(`/api/auth/login`, { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const registerUser = async (name, email, password, role = 'employee') => {
    const { data } = await api.post(`/api/auth/register`, { name, email, password, role });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put(`/api/auth/profile`, profileData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, registerUser, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
