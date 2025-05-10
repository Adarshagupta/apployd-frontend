import React from 'react';
import ReactDOM from 'react-dom/client';
import { 
  RouterProvider, 
  createBrowserRouter
} from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme';
import App, { routes } from './App';
import './index.css';

// Create router with imported routes and future flags for React Router v7 compatibility
const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

// Add development environment flag for fallback mechanisms
if (process.env.NODE_ENV !== 'production') {
  window.isDevEnvironment = true;
  console.log('Running in development mode - fallback mechanisms enabled');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
); 