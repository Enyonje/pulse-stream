import axios from 'axios';
import logger from './logger.js';

const timeout = parseInt(process.env.REQUEST_TIMEOUT_MS || '8000', 10);

export async function getUserPrefs(userId) {
  const base = process.env.USER_PREFS_URL;
  const url = `${base}/prefs/${encodeURIComponent(userId)}`;
  try {
    const res = await axios.get(url, { timeout });
    return res.data;
  } catch (err) {
    logger.warn({ userId, err: err.message }, 'Failed to fetch user prefs');
    // Fallback defaults if prefs not found
    return { maxRisk: 0.02, symbols: [], tradeSize: 100, enabled: true };
  }
}