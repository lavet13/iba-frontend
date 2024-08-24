import 'dotenv/config';
import express from 'express';
import fs from 'fs';

async function configProd(app) {
  const compression = await import('compression');
  app.use(compression.default());

  const serveStatic = await import('serve-static');
  app.use(
    serveStatic.default('./dist/client', {
      index: false,
    })
  );

  const { render } = await import('./dist/server/entry-server.js');

  const bootstrap =
    '/assets/' +
    fs
      .readdirSync('./dist/client/assets')
      .filter((fn) => fn.includes('main') && fn.endsWith('.js'))[0];

  app.use('*', (req, res) => {
    const url = req.originalUrl;
    render(req, res, bootstrap, url);
  });

  return app;
}

async function configDev(app) {
  const cwd = process.cwd();

  const vite = await import('vite');
  const server = await vite.createServer({
    root: cwd,
    server: {
      middlewareMode: true,
      hmr: true,
    },
    appType: 'custom',
  });

  app.use(server.middlewares);

  const renderer = async (req, res) => {
    const url = req.originalUrl;
    try {
      const { render } = await server.ssrLoadModule('./entry-server.tsx');
      render(req, res, `/src/main.tsx`, url);
    } catch (err) {
      server.ssrFixStacktrace(err);
      console.log(err.stack);
      res.status(500).end(err.stack);
    }
  };

  app.use('*', renderer);
  return app;
}

const isProd = process.env.NODE_ENV === 'production';
const port = process.env.PORT;
const app = express();
const config = isProd ? configProd : configDev;

config(app)
  .then(app => {
    app.listen(port, () => {
      console.log(`Listening at http://localhost:${port}`);
    });
  })
  .catch(console.error);
