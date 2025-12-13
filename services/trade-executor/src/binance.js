import axios from "axios";
import crypto from "crypto";

const BASE_URL = "https://testnet.binance.vision";

export async function placeBinanceOrder({
  symbol,
  side,
  quantity,
  apiKey,
  apiSecret
}) {
  const timestamp = Date.now();

  const query = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${quantity}&timestamp=${timestamp}`;

  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(query)
    .digest("hex");

  const res = await axios.post(
    `${BASE_URL}/api/v3/order?${query}&signature=${signature}`,
    {},
    {
      headers: {
        "X-MBX-APIKEY": apiKey
      }
    }
  );

  return res.data;
}
