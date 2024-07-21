import React from 'react';
import ReactDOMServer from 'react-dom/server';
import type { Request, Response } from 'express';
import App from './src/App';
import Html from './src/Html';
import { StaticRouter } from 'react-router-dom/server';
import { ChakraProvider } from './src/theme/provider';
import ReactQueryProvider from './src/react-query/react-query-provider';

export function render(
  req: Request,
  res: Response,
  bootstrap: string,
  url: string
) {
  const cookies = req.headers.cookie ?? '';

  const { pipe } = ReactDOMServer.renderToPipeableStream(
    <Html>
      <StaticRouter location={url}>
        <ReactQueryProvider>
          <ChakraProvider cookies={cookies}>
            <App />
          </ChakraProvider>
        </ReactQueryProvider>
      </StaticRouter>
    </Html>,
    {
      onShellReady() {
        res.statusCode = 200;
        res.setHeader('content-type', 'text/html');
        pipe(res);
      },
      bootstrapModules: [bootstrap],
    }
  );
}
