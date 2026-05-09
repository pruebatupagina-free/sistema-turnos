import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    API.get('/auth/me')
      .then(({ data }) => {
        setUsuario(data);
        setNegocio(data.negocioId);
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUsuario(data.usuario);
    setNegocio(data.usuario.negocio);
    return data.usuario;
  };

  const register = async (payload) => {
    const { data } = await API.post('/auth/register-public', payload);
    localStorage.setItem('token', data.token);
    setUsuario(data.usuario);
    setNegocio(data.negocio);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
    setNegocio(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, negocio, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
