import serverless from 'serverless-http';
import { app, initApp } from '../../server';

let initialized = false;

export const handler = async (event: any, context: any) => {
  if (!initialized) {
    // Note: server.ts already calls initApp() at module load
    // but we ensure it here just in case of different build patterns
    await initApp();
    initialized = true;
  }
  
  // serverless-http handles the conversion between Netlify events and Express req/res
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
