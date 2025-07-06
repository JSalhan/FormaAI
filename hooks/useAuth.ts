'use client';
import { useAuthStore } from '../stores/authStore';

const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    setUser,
  } = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    login: state.login,
    logout: state.logout,
    setUser: state.setUser,
  }));

  return { user, token, isAuthenticated, login, logout, setUser };
};

export default useAuth;
