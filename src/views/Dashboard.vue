<template>
  <div class="data-dashboard">
    <!-- 顶部标题栏 -->
    <div class="header">
      <h1 class="title">可视化展板-ECharts</h1>
      <div class="time">{{ currentTime }}</div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 今日产量 -->
        <div class="production-today">
          <h2>今日产量</h2>
          <div class="production-value">{{ todayProduction }}</div>
          <div class="production-unit">件</div>
        </div>

        <!-- 设备运行状态 -->
        <div class="status-panel">
          <h2>设备运行状态</h2>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-value">{{ deviceStatus.running }}</div>
              <div class="status-label">运行</div>
            </div>
            <div class="status-item">
              <div class="status-value">{{ deviceStatus.idle }}</div>
              <div class="status-label">空闲</div>
            </div>
            <div class="status-item">
              <div class="status-value">{{ deviceStatus.downtime }}</div>
              <div class="status-label">停机</div>
            </div>
          </div>
        </div>

        <!-- 生产趋势图 -->
        <div class="chart-container">
          <h2>生产趋势</h2>
          <div ref="productionTrendChart" class="chart"></div>
        </div>
      </div>

      <!-- 中间面板 -->
      <div class="center-panel">
        <!-- 设备类型故障次数柱状图 -->
        <div class="chart-container">
          <h2>设备类型故障次数</h2>
          <div ref="deviceFaultChart" class="chart"></div>
        </div>

        <!-- 故障设备详情表格 -->
        <div class="data-table">
          <h2>故障设备详情</h2>
          <table>
            <thead>
              <tr>
                <th>设备类型</th>
                <th>设备名称</th>
                <th>故障次数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in faultDeviceList" :key="index">
                <td>{{ item.type }}</td>
                <td>{{ item.name }}</td>
                <td :class="getFaultClass(item.count)">{{ item.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 设备故障趋势图 -->
        <div class="chart-container">
          <h2>设备故障趋势</h2>
          <div ref="faultTrendChart" class="chart"></div>
        </div>

        <!-- 设备运行率饼图 -->
        <div class="chart-container">
          <h2>设备运行率</h2>
          <div ref="operationRateChart" class="chart"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'DataDashboard',
  setup() {
    const currentTime = ref('');
    const productionTrendChart = ref(null);
    const deviceFaultChart = ref(null);
    const faultTrendChart = ref(null);
    const operationRateChart = ref(null);

    // 修改设备状态为三种状态：运行、空闲、停机
    const deviceStatus = ref({
      running: 42,
      idle: 8,
      downtime: 5 // 停机状态
    });

    const todayProduction = ref(1258);

    const deviceFaultData = ref([
      { type: '注塑机', count: 15 },
      { type: '丝印机', count: 8 },
      { type: '喷漆机', count: 12 },
      { type: '烫金机', count: 5 }
    ]);

    const faultDeviceList = ref([
      { type: '注塑机', name: '注塑机-01', count: 5 },
      { type: '注塑机', name: '注塑机-03', count: 4 },
      { type: '喷漆机', name: '喷漆机-02', count: 6 },
      { type: '丝印机', name: '丝印机-01', count: 3 },
      { type: '烫金机', name: '烫金机-01', count: 2 }
    ]);

    // 设备故障趋势数据
    const faultTrendData = ref([
      { month: '1月', count: 12 },
      { month: '2月', count: 15 },
      { month: '3月', count: 8 },
      { month: '4月', count: 10 },
      { month: '5月', count: 7 },
      { month: '6月', count: 9 }
    ]);

    let productionTrendInstance = null;
    let deviceFaultInstance = null;
    let faultTrendInstance = null;
    let operationRateInstance = null;

    // 更新时间
    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleString();
    };

    // 初始化图表
    const initCharts = () => {
      // 生产趋势图
      productionTrendInstance = echarts.init(productionTrendChart.value);
      productionTrendInstance.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
          axisLine: {
            lineStyle: {
              color: '#4fc3f7'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#4fc3f7'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [{
          data: [120, 132, 101, 134, 90, 230],
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#4fc3f7',
            width: 2
          },
          itemStyle: {
            color: '#4fc3f7'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(79, 195, 247, 0.5)' },
              { offset: 1, color: 'rgba(79, 195, 247, 0.1)' }
            ])
          }
        }]
      });

      // 设备类型故障次数柱状图
      deviceFaultInstance = echarts.init(deviceFaultChart.value);
      const maxFault = Math.max(...deviceFaultData.value.map(item => item.count));
      deviceFaultInstance.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: 'category',
          data: deviceFaultData.value.map(item => item.type),
          axisLine: {
            lineStyle: {
              color: '#4fc3f7'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#4fc3f7'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [{
          data: deviceFaultData.value.map(item => ({
            value: item.count,
            itemStyle: {
              color: item.count === maxFault ? '#f44336' : '#4fc3f7'
            }
          })),
          type: 'bar',
          barWidth: '40%'
        }]
      });

      // 设备故障趋势图
      faultTrendInstance = echarts.init(faultTrendChart.value);
      faultTrendInstance.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: faultTrendData.value.map(item => item.month),
          axisLine: {
            lineStyle: {
              color: '#4fc3f7'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#4fc3f7'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [{
          data: faultTrendData.value.map(item => item.count),
          type: 'line',
          smooth: true,
          lineStyle: {
            color: '#ff9800',
            width: 2
          },
          itemStyle: {
            color: '#ff9800'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 152, 0, 0.5)' },
              { offset: 1, color: 'rgba(255, 152, 0, 0.1)' }
            ])
          }
        }]
      });

      // 设备运行率饼图
      operationRateInstance = echarts.init(operationRateChart.value);
      const totalDevices = deviceStatus.value.running + deviceStatus.value.idle + 
                          deviceStatus.value.downtime;
      operationRateInstance.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: {
            color: '#ffffff'
          }
        },
        series: [{
          name: '设备状态',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0f0f0f',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold',
              color: '#ffffff'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { 
              value: deviceStatus.value.running, 
              name: '运行',
              itemStyle: { color: '#4caf50' }
            },
            { 
              value: deviceStatus.value.idle, 
              name: '空闲',
              itemStyle: { color: '#2196f3' }
            },
            { 
              value: deviceStatus.value.downtime, 
              name: '停机',
              itemStyle: { color: '#f44336' }
            }
          ]
        }]
      });
    };

    // 获取故障次数样式类
    const getFaultClass = (count) => {
      if (count >= 5) return 'danger';
      if (count >= 3) return 'warning';
      return 'normal';
    };

    // 调整图表大小
    const resizeCharts = () => {
      productionTrendInstance?.resize();
      deviceFaultInstance?.resize();
      faultTrendInstance?.resize();
      operationRateInstance?.resize();
    };

    onMounted(() => {
      updateTime();
      setInterval(updateTime, 1000);
      initCharts();
      window.addEventListener('resize', resizeCharts);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeCharts);
      productionTrendInstance?.dispose();
      deviceFaultInstance?.dispose();
      faultTrendInstance?.dispose();
      operationRateInstance?.dispose();
    });

    return {
      currentTime,
      productionTrendChart,
      deviceFaultChart,
      faultTrendChart,
      operationRateChart,
      deviceStatus,
      todayProduction,
      deviceFaultData,
      faultDeviceList,
      getFaultClass
    };
  }
};
</script>

<style scoped>
.data-dashboard {
  font-family: 'Arial', sans-serif;
  background-color: #0f0f0f;
  color: #ffffff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #060A3A;
  border-bottom: 1px solid rgba(79, 195, 247, 0.3);
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.time {
  font-size: 16px;
  color: #ffffff;
}

.main-content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
  background-color: #060A3A;
}

.left-panel, .center-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.left-panel {
  flex: 1;
}

.center-panel {
  flex: 1.5;
}

.right-panel {
  flex: 1;
}

.chart-container {
  background-color: #0D0F49;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chart-container h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.chart {
  flex: 1;
  min-height: 200px;
}

.production-today {
  background-color: #0D0F49;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.production-today h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.production-value {
  font-size: 48px;
  font-weight: bold;
  color: #FDE677;
  margin: 10px 0;
}

.production-unit {
  font-size: 16px;
  color: #b0bec5;
}

.status-panel {
  background-color: #0D0F49;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.status-panel h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 修改为3列 */
  gap: 15px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: rgba(15, 23, 42, 0.5);
  border-radius: 6px;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-label {
  font-size: 14px;
  color: #b0bec5;
}

.data-table {
  background-color: #0D0F49;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  flex: 1;
}

.data-table h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
  background-color: rgba(79, 195, 247, 0.2);
  color: #4fc3f7;
}

tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.normal {
  color: #4caf50;
}

.warning {
  color: #ff9800;
}

.danger {
  color: #f44336;
}
</style>