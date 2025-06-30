// src/data/models.js
// 地理位置数据
export const LOCATIONS = [
  { id: 'shanghai', name: '上海', latitude: 31.2304, longitude: 121.4737 },
  { id: 'beijing', name: '北京', latitude: 39.9042, longitude: 116.4074 },
  { id: 'guangzhou', name: '广州', latitude: 23.1291, longitude: 113.2644 },
];

// 预设楼盘数据（简单示例）
export const BUILDINGS = [
  { 
    id: 'building1', 
    name: '阳光小区', 
    position: { x: 0, y: 0 },
    height: 30, // 米
    footprint: [ // 多边形坐标（简化为矩形）
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 40 },
      { x: 0, y: 40 },
      { x: 0, y: 0 } // 闭合多边形
    ]
  },
  // 其他楼盘...
];