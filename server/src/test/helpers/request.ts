import express from 'express';
import request from 'supertest';
import expressLoader from 'loaders/express';

export const makeRequest = async (options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  loggedInUserEmail?: string;
}) => {
  const app = express();
  expressLoader(app);
  const agent = request.agent(app);

  if (options.loggedInUserEmail) {
    await agent
      .post('/user/login')
      .send({
        userLogin: { email: options.loggedInUserEmail, password: 'password' },
      })
      .set('Content-Type', 'application/json');
  }

  if (options.method === 'POST') {
    return agent
      .post(options.url)
      .send(options.data)
      .set('Content-Type', 'application/json');
  } else if (options.method === 'PUT') {
    return agent
      .put(options.url)
      .send(options.data)
      .set('Content-Type', 'application/json');
  } else if (options.method === 'DELETE') {
    return agent.delete(options.url);
  } else {
    return agent.get(options.url);
  }
};
