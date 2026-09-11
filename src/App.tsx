import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocietyProvider } from './context/SocietyContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocietyProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </SocietyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
