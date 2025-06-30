// src/App.jsx
import React, { useState } from 'react';
import { Component } from 'react';
import SimulationPanel from './components/SimulationPanel';
import ThreeDScene from './components/ThreeDScene';
import { BUILDINGS } from './data/models';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>渲染过程中出现错误，请稍后重试。</div>;
    }
    return this.props.children;
  }
}

function App() {
  const [shadows, setShadows] = useState([]);

  return (
    <div className="container mx-auto p-2 filter-compatible text-size-adjust-compatible">
      <h1 className="text-2xl font-bold text-center mb-2">楼盘光照模拟工具</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <SimulationPanel 
            buildings={BUILDINGS} 
            onUpdateShadow={setShadows} 
          />
        </div>
        
        {/* 3D场景 */}
        <div className="lg:col-span-2">
          <ThreeDScene shadows={shadows} />
        </div>
      </div>
    </div>
  );
}

export default App;
<> 

</>
