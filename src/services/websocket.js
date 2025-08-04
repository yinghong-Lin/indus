import { ElMessage } from "element-plus"
import { useAuthStore } from "../stores/auth" // Import useAuthStore here

class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectInterval = 5000 // 5秒重连
    this.reconnectTimer = null
    this.isConnected = false
    this.url = ""
  }

  connect(accessToken) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected.")
      return this.ws
    }

    // Ensure using the correct WebSocket URL, and include access_token
    const baseUrl = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000"
    this.url = `${baseUrl}/productionMonitor/ws/getLastRealtimeData?access_token=${accessToken}`

    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log("WebSocket connected.")
      this.isConnected = true
      if (this.reconnectTimer) {
        clearInterval(this.reconnectTimer)
        this.reconnectTimer = null
      }
      ElMessage.success("实时数据连接成功")
    }

    this.ws.onmessage = (event) => {
      // console.log('Received:', event.data);
      // Can process received data here, e.g., by emitting events to Vue components
    }

    this.ws.onclose = (event) => {
      this.isConnected = false
      console.log("WebSocket disconnected:", event.code, event.reason)
      ElMessage.warning("实时数据连接断开，尝试重连...")
      this.startReconnect()
    }

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      ElMessage.error("实时数据连接错误")
      this.ws.close() // Close connection on error to trigger onclose for reconnect
    }

    return this.ws
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      console.warn("WebSocket not connected, message not sent:", message)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.reconnectTimer) {
      clearInterval(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.isConnected = false
    console.log("WebSocket service disconnected.")
  }

  startReconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setInterval(() => {
        console.log("Attempting to reconnect WebSocket...")
        const authStore = useAuthStore()
        if (authStore.access_token) {
          this.connect(authStore.access_token)
        } else {
          console.warn("No access token available for reconnect. Stopping reconnect attempts.")
          clearInterval(this.reconnectTimer)
          this.reconnectTimer = null
        }
      }, this.reconnectInterval)
    }
  }
}

export const websocketService = new WebSocketService()
