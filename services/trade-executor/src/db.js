export async function updateTradeStatus(
  tradeId,
  status,
  filledQty
) {
  await pool.query(
    `
    UPDATE trades
    SET status = $1,
        filled_quantity = $2
    WHERE trade_id = $3
    `,
    [status, filledQty, tradeId]
  );
}
