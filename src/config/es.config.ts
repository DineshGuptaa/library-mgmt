import { registerAs } from '@nestjs/config';

export default registerAs('elasticsearch', () => {
  const node = process.env.ES_NODE || 'http://localhost:9200';
  const apiKey = process.env.ES_API_KEY;
  const username = process.env.ES_USERNAME;
  const password = process.env.ES_PASSWORD;

  let auth: Record<string, string> | undefined;
  if (apiKey) {
    auth = { apiKey };
  } else if (username && password) {
    auth = { username, password };
  }

  let tls: Record<string, boolean> | undefined;
  if (node.startsWith('https')) {
    tls = { rejectUnauthorized: process.env.ES_TLS_REJECT_UNAUTHORIZED !== 'false' };
  }

  return {
    node,
    auth,
    tls,
    maxRetries: Number(process.env.ES_MAX_RETRIES) || 3,
    requestTimeout: Number(process.env.ES_REQUEST_TIMEOUT) || 60000,
  };
});
