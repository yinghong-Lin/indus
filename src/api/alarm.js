import request from "./index"

export const alarmAPI = {
  // 获取报警记录列表
  getAlarmRecords(params) {
    return request.get("/alarm/records", { params })
  },

  // 查询报警记录
  selectAlarm(alarm_id) {
    return request.post("/alarm/select", { alarm_id })
  },

  // 删除报警记录
  deleteAlarm(alarm_id) {
    return request.delete("/alarm/delete", { data: { alarm_id } })
  },
}
