import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/router/routes';
import { AuthProvider } from './contexts/AuthContext';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;