import App from './App';
import ReactDOM from 'react-dom/client';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from './theme/provider';
import ReactQueryProvider from './react-query/react-query-provider';

const root = document.getElementById('root') as HTMLElement;

const cookies = document.cookie;

ReactDOM.hydrateRoot(
  root,
  <React.StrictMode>
    <BrowserRouter>
      <ReactQueryProvider>
        <ChakraProvider cookies={cookies}>
          <App />
        </ChakraProvider>
      </ReactQueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
