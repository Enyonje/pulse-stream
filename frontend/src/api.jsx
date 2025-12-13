export function connectWS(onMessage) {
  const ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:8080");

  ws.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log("📩 Received:", msg);
    onMessage(msg);
  };

  ws.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  ws.onclose = () => {
    console.log("🔌 WebSocket closed");
  };
}