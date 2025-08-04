import { useAuthStore } from "../stores/auth" // 假设 auth store 的路径是正确的

class WebSocketService {
  constructor() {
    this.baseUrl = "ws://127.0.0.1:8000/productionMonitor/ws/getLastRealtimeData"
    this.connections = new Map() // Map to store WebSocket connections: equipment_id -> WebSocket instance
    this.onMessageCallback = null
    this.authStore = useAuthStore() // 获取 auth store 实例
  }

  /**
   * 为一组设备ID建立 WebSocket 连接。
   * @param {string[]} equipmentIds - 要监控的设备ID数组。
   * @param {Function} onMessageCallback - 处理实时数据的回调函数。
   */
  startMonitoring(equipmentIds, onMessageCallback) {
    this.onMessageCallback = onMessageCallback

    // 从 authStore 中获取 accsee_token
    // const accessToken = this.authStore.access_token
    const access_token =localStorage.getItem("access_token")

    if (!access_token) {
      console.warn("WebSocketService: 未获取到 access token，无法建立连接。")
      return
    }

    // 关闭当前不再需要监控的连接
    this.connections.forEach((ws, id) => {
      if (!equipmentIds.includes(id)) {
        this.disconnect(id)
      }
    })

    // 为提供的设备ID建立新连接
    equipmentIds.forEach((equipmentId) => {
      // 只有当连接不存在或已关闭时才建立新连接
      if (!this.connections.has(equipmentId) || this.connections.get(equipmentId).readyState === WebSocket.CLOSED) {
        const url = `${this.baseUrl}?equipment_id=${equipmentId}&access_token=${access_token}`
        const ws = new WebSocket(url)

        ws.onopen = () => {
          console.log(`WebSocket for ${equipmentId} 已连接。`)
        }

        ws.onmessage = (event) => {
          this.handleMessage(event, equipmentId) // 将 equipmentId 传递给 handleMessage
        }

        ws.onerror = (error) => {
          console.error(`WebSocket for ${equipmentId} 错误:`, error)
          // 可选：在此处实现重连逻辑
        }

        ws.onclose = (event) => {
          console.log(`WebSocket for ${equipmentId} 已关闭。Code: ${event.code}, Reason: ${event.reason}`)
          this.connections.delete(equipmentId) // 连接关闭时从 Map 中移除
          // 可选：如果不是正常关闭，在此处实现重连逻辑
        }

        this.connections.set(equipmentId, ws)
      }
    })
  }

  /**
   * 处理接收到的 WebSocket 消息。
   * @param {MessageEvent} event - WebSocket 消息事件。
   * @param {string} equipmentId - 消息所属的设备ID。
   */
  handleMessage(event, equipmentId) {
    try {
      const data = JSON.parse(event.data)
      if (data.code === 200 && data.data) {
        // 确保数据包含 equipment_id，以便回调函数识别
        const realtimeData = { ...data.data, equipment_id: equipmentId }
        if (typeof this.onMessageCallback === "function") {
          this.onMessageCallback(realtimeData)
        }
      } else {
        console.warn(`WebSocket 消息 for ${equipmentId} 指示错误:`, data.msg)
      }
    } catch (error) {
      console.error(`解析 WebSocket 消息失败 for ${equipmentId}:`, error)
    }
  }

  /**
   * 关闭指定设备ID的 WebSocket 连接。
   * @param {string} equipmentId - 要关闭连接的设备ID。
   */
  disconnect(equipmentId) {
    const ws = this.connections.get(equipmentId)
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      ws.close()
      console.log(`WebSocket for ${equipmentId} 已手动关闭。`)
    }
    this.connections.delete(equipmentId)
  }

  /**
   * 关闭所有活跃的 WebSocket 连接。
   */
  stopAllMonitoring() {
    this.connections.forEach((ws, equipmentId) => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
        console.log(`WebSocket for ${equipmentId} 在停止所有监控时关闭。`)
      }
    })
    this.connections.clear()
    console.log("所有 WebSocket 连接已停止。")
  }
}

export const websocketService = new WebSocketService()