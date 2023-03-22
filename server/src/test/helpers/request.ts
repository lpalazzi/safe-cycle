import axios from 'axios';

export const makeRequest = async (options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  loggedInUserEmail?: string;
}) => {
  const instance = axios.create({
    baseURL: 'http://localhost:4000',
    timeout: 3000,
  });
  if (options.loggedInUserEmail) {
    const { headers } = await axios.post('http://localhost:4000/user/login', {
      userLogin: { email: options.loggedInUserEmail, password: 'password' },
    });
    const cookie = headers['set-cookie']?.[0];
    if (!cookie) throw new Error('Session cookie was not returned');
    instance.defaults.headers.Cookie = cookie;
  }
  return instance.request({
    url: options.url,
    method: options.method || 'GET',
    data: options.data,
  });
};
