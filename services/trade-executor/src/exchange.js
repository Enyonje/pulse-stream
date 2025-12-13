import axios from 'axios';
import logger from './logger.js';

const timeout = parseInt(process.env.REQUEST_TIMEOUT_MS || '8000', 10);

export async function placeOrder(order) {
  const base = process.env.EXCHANGE_API_URL;
  const url = `${base}/orders`;
  try {
    const res = await axios.post(url, order, { timeout });
    return res.data;
  } catch (err) {
    logger.error({ order, err: err.message }, 'Exchange order failed');
    throw err;
  }
}