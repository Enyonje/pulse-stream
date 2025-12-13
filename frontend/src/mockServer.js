export function startMockWS() {
  console.log("Mock WebSocket started (dev mode)");
  // Example: simulate incoming messages
  setInterval(() => {
    console.log("Mock message: price update");
  }, 3000);
}