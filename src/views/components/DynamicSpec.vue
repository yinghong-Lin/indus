<template>
  <div class="dynamic-spec">
    <!-- 注塑机规格参数 -->
    <template v-if="type === 'injection_molding'">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="合模力范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_clamping_force.min" 
                :max="modelValue.spec_clamping_force.max" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_clamping_force.max" 
                :min="modelValue.spec_clamping_force.min" 
                :max="1200" 
                placeholder="最大值"
              />
              <span class="unit">kN</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="加热温度范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_heating_temp.min" 
                :max="modelValue.spec_heating_temp.max" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_heating_temp.max" 
                :min="modelValue.spec_heating_temp.min" 
                :max="280" 
                placeholder="最大值"
              />
              <span class="unit">℃</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="注射压力范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_injection_pressure.min" 
                :max="modelValue.spec_injection_pressure.max" 
                :precision="1" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_injection_pressure.max" 
                :min="modelValue.spec_injection_pressure.min" 
                :max="180" 
                :precision="1" 
                placeholder="最大值"
              />
              <span class="unit">MPa</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="螺杆转速范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_screw_speed.min" 
                :max="modelValue.spec_screw_speed.max" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_screw_speed.max" 
                :min="modelValue.spec_screw_speed.min" 
                :max="300" 
                placeholder="最大值"
              />
              <span class="unit">rpm</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 丝印机规格参数 -->
    <template v-else-if="type === 'screen_printing'">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="印刷压力范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_printing_pressure.min" 
                :max="modelValue.spec_printing_pressure.max" 
                :precision="2" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_printing_pressure.max" 
                :min="modelValue.spec_printing_pressure.min" 
                :max="0.8" 
                :precision="2" 
                placeholder="最大值"
              />
              <span class="unit">MPa</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="印刷速度范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_printing_speed.min" 
                :max="modelValue.spec_printing_speed.max" 
                :precision="1" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_printing_speed.max" 
                :min="modelValue.spec_printing_speed.min" 
                :max="1.2" 
                :precision="1" 
                placeholder="最大值"
              />
              <span class="unit">m/s</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="网目数范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_mesh_count.min" 
                :max="modelValue.spec_mesh_count.max" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_mesh_count.max" 
                :min="modelValue.spec_mesh_count.min" 
                :max="300" 
                placeholder="最大值"
              />
              <span class="unit">目</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="油墨粘度范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_ink_viscosity.min" 
                :max="modelValue.spec_ink_viscosity.max" 
                :precision="1" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_ink_viscosity.max" 
                :min="modelValue.spec_ink_viscosity.min" 
                :max="15" 
                :precision="1" 
                placeholder="最大值"
              />
              <span class="unit">Pa·s</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 烫金机规格参数 -->
    <template v-else-if="type === 'hot_stamping'">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="烫金温度范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_stamping_temp.min" 
                :max="modelValue.spec_stamping_temp.max" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_stamping_temp.max" 
                :min="modelValue.spec_stamping_temp.min" 
                :max="200" 
                placeholder="最大值"
              />
              <span class="unit">℃</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="烫金压力范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_stamping_pressure.min" 
                :max="modelValue.spec_stamping_pressure.max" 
                :precision="1" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_stamping_pressure.max" 
                :min="modelValue.spec_stamping_pressure.min" 
                :max="2.5" 
                :precision="1" 
                placeholder="最大值"
              />
              <span class="unit">MPa</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="金箔速度范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_foil_speed_min.min" 
                :max="modelValue.spec_foil_speed_min.max" 
                :precision="1" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_foil_speed_max.max" 
                :min="modelValue.spec_foil_speed_min.min" 
                :max="10" 
                :precision="1" 
                placeholder="最大值"
              />
              <span class="unit">m/s</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="烫金时间范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_stamping_duration.min" 
                :max="modelValue.spec_stamping_duration.max" 
                :precision="1" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_stamping_duration.max" 
                :min="modelValue.spec_stamping_duration.min" 
                :max="5" 
                :precision="1" 
                placeholder="最大值"
              />
              <span class="unit">s</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 喷漆机规格参数 -->
    <template v-else-if="type === 'spray_painting'">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="喷涂压力范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_spray_pressure.min" 
                :max="modelValue.spec_spray_pressure.max" 
                :precision="1" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_spray_pressure.max" 
                :min="modelValue.spec_spray_pressure.min" 
                :max="0.6" 
                :precision="1" 
                placeholder="最大值"
              />
              <span class="unit">MPa</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="喷涂距离范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_spray_distance_min.min" 
                :max="modelValue.spec_spray_distance_min.max" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_spray_distance_max.max" 
                :min="modelValue.spec_spray_distance_min.min" 
                :max="300" 
                placeholder="最大值"
              />
              <span class="unit">mm</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="喷涂速度范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_spray_speed.min" 
                :max="modelValue.spec_spray_speed.max" 
                :precision="1" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_spray_speed.max" 
                :min="modelValue.spec_spray_speed.min" 
                :max="1.5" 
                :precision="1" 
                placeholder="最大值"
              />
              <span class="unit">m/s</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="干燥温度范围">
            <div class="range-input">
              <el-input-number 
                v-model="modelValue.spec_drying_temp.min" 
                :max="modelValue.spec_drying_temp.max" 
                placeholder="最小值"
              />
              <span class="range-separator">-</span>
              <el-input-number 
                v-model="modelValue.spec_drying_temp.max" 
                :min="modelValue.spec_drying_temp.min" 
                :max="80" 
                placeholder="最大值"
              />
              <span class="unit">℃</span>
            </div>
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
.dynamic-spec {
  padding: 10px 0;
}

.range-input {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.range-separator {
  color: #888;
  font-weight: bold;
  margin: 0 4px;
}

.unit {
  color: #888;
  font-size: 12px;
  white-space: nowrap;
}

:deep(.el-input-number) {
  flex: 1;
  min-width: 80px;
}

:deep(.el-input-number .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-input-number .el-input__inner) {
  color: #ffffff;
}

@media (max-width: 768px) {
  .range-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .range-separator {
    text-align: center;
    margin: 4px 0;
  }
}
</style>
