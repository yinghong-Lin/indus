import Mock from "mockjs";

// 修正设备类型映射，使用接口文档中的正确类型名称
const equipmentTypes = {
  injection_molding: "注塑机",
  screen_printing: "丝印机",
  hot_stamping: "烫金机",
  spray_painting: "喷漆机",
};

// 设备状态映射
const equipmentStatuses = ["RUN", "OFF", "ERROR", "MAINTAIN"];

// 生成注塑机设置参数
const generateInjectionMoldingSettings = () => ({
  setting_heating_temp: { value: Mock.Random.natural(180, 280), unit: "℃" },
  setting_cooling_time: { value: Mock.Random.natural(10, 30), unit: "s" },
  setting_injection_speed: { value: Mock.Random.natural(60, 120), unit: "mm/s" },
  setting_injection_pressure: { value: Mock.Random.float(80, 150, 1, 1), unit: "MPa" },
  setting_injection_time: { value: Mock.Random.natural(2, 5), unit: "s" },
  setting_opening_time: { value: Mock.Random.natural(1, 3), unit: "s" },
  setting_closing_time: { value: Mock.Random.natural(1, 2), unit: "s" },
  setting_holding_pressure: { value: Mock.Random.float(60, 100, 1, 1), unit: "MPa" },
  setting_holding_time: { value: Mock.Random.natural(3, 8), unit: "s" },
  setting_injection_position: { value: Mock.Random.float(0.01, 0.1, 2, 2), unit: "mm" },
  setting_screw_speed: { value: Mock.Random.natural(80, 200), unit: "rpm" },
});

// 生成注塑机规格参数
const generateInjectionMoldingSpecs = () => ({
  spec_opening_stroke: { min: 0, max: 200, unit: "mm" },
  spec_clamping_force: { min: 0, max: 1200, unit: "kN" },
  spec_motor_power: { min: 0, max: 15.5, unit: "kW" },
  spec_heating_zone_count: { min: 0, max: 8, unit: "个" },
  spec_heating_temp: { min: 180, max: 280, unit: "℃" },
  spec_injection_speed: { min: 0, max: 200, unit: "mm/s" },
  spec_injection_pressure: { min: 0, max: 180.0, unit: "MPa" },
  spec_screw_speed: { min: 0, max: 300, unit: "rpm" },
  spec_holding_pressure: { min: 0, max: 120.0, unit: "MPa" },
});

// 生成丝印机设置参数
const generateScreenPrintingSettings = () => ({
  setting_printing_pressure: { value: Mock.Random.float(0.3, 0.7, 1, 1), unit: "MPa" },
  setting_printing_speed: { value: Mock.Random.float(0.5, 1.0, 1, 1), unit: "m/s" },
  setting_ink_viscosity: { value: Mock.Random.float(8, 14, 1, 1), unit: "Pa·s" },
  setting_ink_drying_time: { value: Mock.Random.natural(20, 60), unit: "s" },
});

// 生成丝印机规格参数
const generateScreenPrintingSpecs = () => ({
  spec_printing_pressure: { min: 0, max: 0.8, unit: "MPa" },
  spec_printing_speed: { min: 0, max: 1.2, unit: "m/s" },
  spec_mesh_count: { min: 0, max: 300, unit: "目" },
  spec_template_thickness: { min: 0, max: 0.3, unit: "mm" },
  spec_ink_viscosity: { min: 0, max: 15.0, unit: "Pa·s" },
  spec_uv_drying_power: { min: 0, max: 2000, unit: "W" },
});

// 生成烫金机设置参数
const generateHotStampingSettings = () => ({
  setting_stamping_temp: { value: Mock.Random.natural(80, 150), unit: "℃" },
  setting_stamping_pressure: { value: Mock.Random.float(0.5, 2.0, 1, 1), unit: "MPa" },
  setting_stamping_time: { value: Mock.Random.float(0.3, 2.0, 1, 1), unit: "s" },
  setting_foil_speed: { value: Mock.Random.float(1.5, 5.0, 1, 1), unit: "m/s" },
});

// 生成烫金机规格参数
const generateHotStampingSpecs = () => ({
  spec_stamping_temp: { min: 0, max: 200, unit: "℃" },
  spec_stamping_pressure: { min: 0, max: 2.5, unit: "MPa" },
  spec_foil_speed_min: { min: 1, max: 10, unit: "m/s" },
  spec_foil_speed_max: { min: 1, max: 10, unit: "m/s" },
  spec_stamping_duration: { min: 0, max: 5, unit: "s" },
});

// 生成喷漆机设置参数
const generateSprayPaintingSettings = () => ({
  setting_paint_viscosity: { value: Mock.Random.float(10, 20, 1, 1), unit: "Pa·s" },
  setting_spray_pressure: { value: Mock.Random.float(0.3, 0.5, 1, 1), unit: "MPa" },
  setting_spray_distance: { value: Mock.Random.natural(180, 250), unit: "mm" },
  setting_spray_speed: { value: Mock.Random.float(0.8, 1.3, 1, 1), unit: "m/s" },
  setting_drying_temp: { value: Mock.Random.natural(50, 75), unit: "℃" },
  setting_drying_time: { value: Mock.Random.natural(15, 40), unit: "s" },
});

// 生成喷漆机规格参数
const generateSprayPaintingSpecs = () => ({
  spec_spray_pressure: { min: 0, max: 0.6, unit: "MPa" },
  spec_spray_distance_min: { min: 150, max: 300, unit: "mm" },
  spec_spray_distance_max: { min: 150, max: 300, unit: "mm" },
  spec_spray_speed: { min: 0, max: 1.5, unit: "m/s" },
  spec_drying_temp: { min: 0, max: 80, unit: "℃" },
  spec_paint_viscosity: { min: 0, max: 25.0, unit: "Pa·s" },
});

// 根据设备类型生成设置参数
const generateSettingDetails = (type) => {
  switch (type) {
    case "injection_molding":
      return generateInjectionMoldingSettings();
    case "screen_printing":
      return generateScreenPrintingSettings();
    case "hot_stamping":
      return generateHotStampingSettings();
    case "spray_painting":
      return generateSprayPaintingSettings();
    default:
      return {};
  }
};

// 根据设备类型生成规格参数
const generateSpecDetails = (type) => {
  switch (type) {
    case "injection_molding":
      return generateInjectionMoldingSpecs();
    case "screen_printing":
      return generateScreenPrintingSpecs();
    case "hot_stamping":
      return generateHotStampingSpecs();
    case "spray_painting":
      return generateSprayPaintingSpecs();
    default:
      return {};
  }
};

// 生成设备数据
const generateEquipmentData = () => {
  const equipment = [];
  const types = Object.keys(equipmentTypes);
  const locations = ["生产区域A", "生产区域B", "生产区域C", "生产区域D"];

  for (let i = 0; i < 50; i++) {
    const type = Mock.Random.pick(types);
    const status = Mock.Random.pick(equipmentStatuses);
    const id = Mock.Random.guid();

    equipment.push({
      equipment_id: id,
      equipment_name: `${equipmentTypes[type]}${Mock.Random.natural(1, 20)}号`,
      equipment_type: type,
      equipment_status: status,
      location: Mock.Random.pick(locations),
      setting_details: generateSettingDetails(type),
      spec_details: generateSpecDetails(type),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return equipment;
};

const equipmentData = generateEquipmentData();

// 获取设备列表接口
Mock.mock(/\/productionControl\/getEquipmentList/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url);
  const page = Number(u.searchParams.get("page") || 1);
  const page_size = Number(u.searchParams.get("page_size") || 10);

  const start = (page - 1) * page_size;
  const end = start + page_size;
  const list = equipmentData.slice(start, end);

  return {
    code: 200,
    msg: "获取设备列表成功",
    data: {
      equipments: list,
      pagination: {
        total: equipmentData.length,
        page,
        page_size,
        total_pages: Math.ceil(equipmentData.length / page_size),
      },
    },
  };
});

// 根据id获取设备信息
Mock.mock(/\/productionControl\/getEquipmentById/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url);
  const equipment_id = u.searchParams.get("equipment_id");

  const equipment = equipmentData.find((item) => item.equipment_id === equipment_id);

  if (equipment) {
    return {
      code: 200,
      msg: "获取成功",
      data: equipment,
    };
  } else {
    return {
      code: 404,
      msg: "设备不存在",
      data: null,
    };
  }
});

// 新增设备接口
Mock.mock(/\/api\/productionControl\/addEquipment/, "post", ({ body }) => {
  try {
    const data = JSON.parse(body);

    // 验证必填字段
    if (!data.equipment_name || !data.equipment_type || !data.location) {
      return {
        code: 400,
        msg: "缺少必填字段：设备名称、设备类型、设备位置",
        data: null,
      };
    }

    // 确保有完整的默认参数
    if (!data.setting_details || Object.keys(data.setting_details).length === 0) {
      data.setting_details = generateSettingDetails(data.equipment_type);
    }
    if (!data.spec_details || Object.keys(data.spec_details).length === 0) {
      data.spec_details = generateSpecDetails(data.equipment_type);
    }

    const newEquipment = {
      equipment_id: Mock.Random.guid(),
      equipment_status: "OFF",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };

    equipmentData.unshift(newEquipment);

    return {
      code: 200,
      msg: "新增设备成功",
      data: newEquipment,
    };
  } catch (error) {
    return {
      code: 500,
      msg: "服务器内部错误：" + error.message,
      data: null,
    };
  }
});

// 删除设备接口
Mock.mock(/\/api\/productionControl\/deleteEquipment/, "delete", ({ url }) => {
  const u = new URL("http://localhost" + url);
  const equipment_id = u.searchParams.get("equipment_id");

  const index = equipmentData.findIndex((item) => item.equipment_id === equipment_id);

  if (index > -1) {
    const deletedEquipment = equipmentData.splice(index, 1)[0];
    return {
      code: 200,
      msg: `删除设备"${deletedEquipment.equipment_name}"成功`,
      data: null,
    };
  } else {
    return {
      code: 404,
      msg: "设备不存在",
      data: null,
    };
  }
});

// 更新设备接口
Mock.mock("/productionControl/updateEquipment", "put", ({ body }) => {
  try {
    const data = JSON.parse(body);

    if (!data.equipment_id) {
      return {
        code: 400,
        msg: "缺少设备ID",
        data: null,
      };
    }

    const index = equipmentData.findIndex((item) => item.equipment_id === data.equipment_id);

    if (index > -1) {
      // 保留原有的创建时间，只更新修改时间
      const originalCreatedAt = equipmentData[index].created_at;
      equipmentData[index] = {
        ...equipmentData[index],
        ...data,
        created_at: originalCreatedAt,
        updated_at: new Date().toISOString(),
      };

      return {
        code: 200,
        msg: "更新设备成功",
        data: equipmentData[index],
      };
    } else {
      return {
        code: 404,
        msg: "设备不存在",
        data: null,
      };
    }
  } catch (error) {
    return {
      code: 500,
      msg: "服务器内部错误：" + error.message,
      data: null,
    };
  }
});

// 更新设备状态接口
Mock.mock(/\/api\/productionControl\/updateEquipmentRunStatus/, "patch", ({ url }) => {
  const u = new URL("http://localhost" + url);
  const equipment_id = u.searchParams.get("equipment_id");
  const status = u.searchParams.get("status");

  if (!equipment_id || !status) {
    return {
      code: 400,
      msg: "缺少必要参数：设备ID或状态",
      data: null,
    };
  }

  const equipment = equipmentData.find((item) => item.equipment_id === equipment_id);

  if (equipment) {
    equipment.equipment_status = status;
    equipment.updated_at = new Date().toISOString();

    return {
      code: 200,
      msg: `已更新设备'${equipment.equipment_name}'运行状态为'${status}'`,
      data: equipment,
    };
  } else {
    return {
      code: 404,
      msg: "设备不存在",
      data: null,
    };
  }
});

// 更新设备规格接口
Mock.mock(/\/api\/productionControl\/updateEquipmentSpec/, "patch", ({ url, body }) => {
  try {
    const u = new URL("http://localhost" + url);
    const equipment_id = u.searchParams.get("equipment_id");
    const data = JSON.parse(body);

    if (!equipment_id) {
      return {
        code: 400,
        msg: "缺少设备ID",
        data: null,
      };
    }

    const equipment = equipmentData.find((item) => item.equipment_id === equipment_id);

    if (equipment) {
      equipment.spec_details = { ...equipment.spec_details, ...data.spec_details };
      equipment.updated_at = new Date().toISOString();

      return {
        code: 200,
        msg: `已更新设备'${equipment.equipment_name}'的规格`,
        data: equipment,
      };
    } else {
      return {
        code: 404,
        msg: "设备不存在",
        data: null,
      };
    }
  } catch (error) {
    return {
      code: 500,
      msg: "服务器内部错误：" + error.message,
      data: null,
    };
  }
});

// 更新设备设置参数接口
Mock.mock(/\/api\/productionControl\/updateEquipmentSetting/, "patch", ({ url, body }) => {
  try {
    const u = new URL("http://localhost" + url);
    const equipment_id = u.searchParams.get("equipment_id");
    const data = JSON.parse(body);

    if (!equipment_id) {
      return {
        code: 400,
        msg: "缺少设备ID",
        data: null,
      };
    }

    const equipment = equipmentData.find((item) => item.equipment_id === equipment_id);

    if (equipment) {
      equipment.setting_details = { ...equipment.setting_details, ...data.setting_details };
      equipment.updated_at = new Date().toISOString();

      return {
        code: 200,
        msg: `已更新设备'${equipment.equipment_name}'的设置`,
        data: equipment,
      };
    } else {
      return {
        code: 404,
        msg: "设备不存在",
        data: null,
      };
    }
  } catch (error) {
    return {
      code: 500,
      msg: "服务器内部错误：" + error.message,
      data: null,
    };
  }
});

// 搜索框设备接口
Mock.mock(/\/api\/productionControl\/searchEquipment/, "get", ({ url }) => {
  const u = new URL("http://localhost" + url);
  const page = Number(u.searchParams.get("page") || 1);
  const page_size = Number(u.searchParams.get("page_size") || 10);
  const keyword = u.searchParams.get("keyword") || "";
  const equipment_type = u.searchParams.get("equipment_type") || "all";

  let filteredData = [...equipmentData];

  // 按类型筛选
  if (equipment_type !== "all") {
    filteredData = filteredData.filter((item) => item.equipment_type === equipment_type);
  }

  // 按关键词搜索
  if (keyword) {
    filteredData = filteredData.filter(
      (item) =>
        item.equipment_name.includes(keyword) || item.location.includes(keyword),
    );
  }

  const start = (page - 1) * page_size;
  const end = start + page_size;
  const list = filteredData.slice(start, end);

  return {
    code: 200,
    msg: "搜索成功",
    data: {
      equipments: list,
      pagination: {
        total: filteredData.length,
        page,
        page_size,
        total_pages: Math.ceil(filteredData.length / page_size),
      },
    },
  };
});

console.log("[Mock] 生产控制设备接口已启动！");