<template>
  <div class="dynamic-setting">
    <!-- 注塑机设置参数 -->
    <template v-if="type === 'injection_molding'">
      <!-- 注塑机参数配置 -->
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="加热温度">
            <el-input-number 
              v-model="modelValue.setting_heating_temp.value" 
              :min="180" 
              :max="280" 
              class="full-width"
            />
            <span class="unit">℃</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="冷却时间">
            <el-input-number 
              v-model="modelValue.setting_cooling_time.value" 
              :min="0" 
              :max="60" 
              class="full-width"
            />
            <span class="unit">s</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="注射速度">
            <el-input-number 
              v-model="modelValue.setting_injection_speed.value" 
              :min="0" 
              :max="200" 
              class="full-width"
            />
            <span class="unit">mm/s</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="注射压力">
            <el-input-number 
              v-model="modelValue.setting_injection_pressure.value" 
              :min="0" 
              :max="180" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">MPa</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="注射时间">
            <el-input-number 
              v-model="modelValue.setting_injection_time.value" 
              :min="0" 
              :max="10" 
              class="full-width"
            />
            <span class="unit">s</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="保压压力">
            <el-input-number 
              v-model="modelValue.setting_holding_pressure.value" 
              :min="0" 
              :max="120" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">MPa</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="保压时间">
            <el-input-number 
              v-model="modelValue.setting_holding_time.value" 
              :min="0" 
              :max="20" 
              class="full-width"
            />
            <span class="unit">s</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="螺杆转速">
            <el-input-number 
              v-model="modelValue.setting_screw_speed.value" 
              :min="0" 
              :max="300" 
              class="full-width"
            />
            <span class="unit">rpm</span>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 丝印机设置参数 -->
    <template v-else-if="type === 'screen_printing'">
      <!-- 丝印机参数配置 -->
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="印刷压力">
            <el-input-number 
              v-model="modelValue.setting_printing_pressure.value" 
              :min="0" 
              :max="0.8" 
              :precision="2" 
              class="full-width"
            />
            <span class="unit">MPa</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="印刷速度">
            <el-input-number 
              v-model="modelValue.setting_printing_speed.value" 
              :min="0" 
              :max="1.2" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">m/s</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="油墨粘度">
            <el-input-number 
              v-model="modelValue.setting_ink_viscosity.value" 
              :min="0" 
              :max="15" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">Pa·s</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="干燥时间">
            <el-input-number 
              v-model="modelValue.setting_ink_drying_time.value" 
              :min="0" 
              :max="120" 
              class="full-width"
            />
            <span class="unit">s</span>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 烫金机设置参数 -->
    <template v-else-if="type === 'hot_stamping'">
      <!-- 烫金机参数配置 -->
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="烫金温度">
            <el-input-number 
              v-model="modelValue.setting_stamping_temp.value" 
              :min="0" 
              :max="200" 
              class="full-width"
            />
            <span class="unit">℃</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="烫金压力">
            <el-input-number 
              v-model="modelValue.setting_stamping_pressure.value" 
              :min="0" 
              :max="2.5" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">MPa</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="烫金时间">
            <el-input-number 
              v-model="modelValue.setting_stamping_time.value" 
              :min="0" 
              :max="5" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">s</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="金箔速度">
            <el-input-number 
              v-model="modelValue.setting_foil_speed.value" 
              :min="1" 
              :max="10" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">m/s</span>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 喷漆机设置参数 -->
    <template v-else-if="type === 'spray_painting'">
      <!-- 喷漆机参数配置 -->
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="喷漆压力">
            <el-input-number 
              v-model="modelValue.setting_spray_pressure.value" 
              :min="0" 
              :max="0.6" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">MPa</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="喷漆距离">
            <el-input-number 
              v-model="modelValue.setting_spray_distance.value" 
              :min="150" 
              :max="300" 
              class="full-width"
            />
            <span class="unit">mm</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="喷漆速度">
            <el-input-number 
              v-model="modelValue.setting_spray_speed.value" 
              :min="0" 
              :max="1.5" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">m/s</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="干燥温度">
            <el-input-number 
              v-model="modelValue.setting_drying_temp.value" 
              :min="0" 
              :max="80" 
              class="full-width"
            />
            <span class="unit">℃</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="干燥时间">
            <el-input-number 
              v-model="modelValue.setting_drying_time.value" 
              :min="0" 
              :max="120" 
              class="full-width"
            />
            <span class="unit">s</span>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="油漆粘度">
            <el-input-number 
              v-model="modelValue.setting_paint_viscosity.value" 
              :min="0" 
              :max="25" 
              :precision="1" 
              class="full-width"
            />
            <span class="unit">Pa·s</span>
          </el-form-item>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  type: String,
  modelValue: Object
})

const emit = defineEmits(['update:modelValue'])

// 监听类型变化，确保数据结构完整
watch(() => props.type, (newType) => {
  if (newType && (!props.modelValue || Object.keys(props.modelValue).length === 0)) {
    // 如果没有数据，发出更新事件让父组件处理
    emit('update:modelValue', {})
  }
}, { immediate: true })
</script>

<style scoped>
.dynamic-setting {
  padding: 10px 0;
}

.unit {
  margin-left: 8px;
  color: #888;
  font-size: 12px;
}

.full-width {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-input-number .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-input-number .el-input__inner) {
  color: #ffffff;
}
</style>
