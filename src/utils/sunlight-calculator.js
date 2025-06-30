// src/utils/sunlight-calculator.js
import * as turf from '@turf/turf';
import dayjs from 'dayjs';

/**
 * 计算指定日期时间和地理位置的太阳位置
 * @param {Date} date - 日期时间
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {Object} - 包含太阳高度角和方位角
 */
export function calculateSunPosition(date, latitude, longitude) {
  // 简化的太阳位置计算（实际项目中建议使用更精确的算法）
  const julianDate = calculateJulianDate(date);
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (284 + julianDate));
  
  // 计算时角（以弧度为单位）
  const hourAngle = (date.getHours() + date.getMinutes() / 60 - 12) * 15 * (Math.PI / 180);
  
  // 转换为弧度
  const latRad = latitude * (Math.PI / 180);
  const declRad = declination * (Math.PI / 180);
  
  // 计算太阳高度角
  const altitude = Math.asin(
    Math.sin(latRad) * Math.sin(declRad) + 
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngle)
  );
  
  // 计算太阳方位角
  const azimuth = Math.atan2(
    Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(latRad) - Math.tan(declRad) * Math.cos(latRad)
  );
  
  return {
    altitude: altitude * (180 / Math.PI), // 转换为角度
    azimuth: azimuth * (180 / Math.PI) + 180 // 转换为角度并调整到0-360度范围
  };
}

/**
 * 计算建筑物阴影
 * @param {Object} building - 建筑物数据
 * @param {Object} sunPosition - 太阳位置
 * @returns {Feature<Polygon>} - 阴影多边形
 */
export function calculateShadow(building, sunPosition) {
  // 太阳高度角越小，阴影越长
  const shadowLength = building.height / Math.tan(sunPosition.altitude * (Math.PI / 180));
  
  // 转换坐标格式为经纬度数组
  const coordinates = building.footprint.map(point => [point.x, point.y]);
  // 创建建筑物多边形
  const buildingPolygon = turf.polygon([coordinates]);
  
  // 计算阴影方向（与太阳方位角相反）
  const shadowDirection = (sunPosition.azimuth + 180) % 360;
  
  // 使用turf.js计算阴影多边形
  const shadow = turf.transformTranslate(
    buildingPolygon, 
    shadowLength / 1000, // 转换为千米（turf.js默认单位）
    shadowDirection, 
    { units: 'kilometers' }
  );
  
  return shadow;
}

// 计算儒略日（简化版）
function calculateJulianDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}