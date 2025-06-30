// src/components/SimulationPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { LOCATIONS } from '../data/models';
import { calculateSunPosition, calculateShadow } from '../utils/sunlight-calculator';
import dayjs from 'dayjs';


function SimulationPanel({ buildings, onUpdateShadow, selectedDate, setSelectedDate }) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);

  const updateSimulation = useCallback(() => {
      const sunPosition = calculateSunPosition(
        selectedDate,
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      
      const shadows = buildings.map(building => ({
        ...building,
        shadow: calculateShadow(building, sunPosition)
      }));
      
      onUpdateShadow(shadows);
    },
    [selectedLocation, selectedDate, buildings, onUpdateShadow]
  );

  useEffect(() => {
    updateSimulation();
  }, [selectedLocation, selectedDate, buildings, onUpdateShadow, updateSimulation]);

  const handleTimeChange = (e) => {
    const totalMinutes = parseInt(e.target.value, 10);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const newDate = new Date(selectedDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setSelectedDate(newDate);
  };

  const getTotalMinutes = () => {
    return selectedDate.getHours() * 60 + selectedDate.getMinutes();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">模拟设置</h2> 
      
      {/* 地区选择 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">地区</label>
        <select
          value={selectedLocation.id}
          onChange={(e) => {
            const location = LOCATIONS.find(loc => loc.id === e.target.value);
            if (location) setSelectedLocation(location);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          title="请选择地区"
          placeholder="请选择地区"
        >
          {LOCATIONS.map(location => (
            <option key={location.id} value={location.id}>{location.name}</option>
          ))}
        </select>
      </div> 
      
      {/* 日期选择 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
        <input
          type="date"
          value={dayjs(selectedDate).format('YYYY-MM-DD')}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            newDate.setHours(selectedDate.getHours());
            newDate.setMinutes(selectedDate.getMinutes());
            setSelectedDate(newDate);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          title="请选择日期"
          placeholder="请选择日期"
        />
      </div> 
      
      {/* 时间滑块 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">时间</label>
        <input
          type="range"
          min="0"
          max="1439"
          value={getTotalMinutes()}
          onChange={handleTimeChange}
          className="w-full"
        />
        <div className="text-sm text-gray-500">
          {dayjs(selectedDate).format('HH:mm')}
        </div>
      </div> 
    </div> 
  );
}

export default SimulationPanel;