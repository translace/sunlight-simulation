// src/components/ThreeDScene.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BUILDINGS } from '../data/models';
import { calculateSunPosition } from '../utils/sunlight-calculator';


function ThreeDScene({ shadows, selectedDate }) {
  const containerRef = useRef();
  const scene = useRef();
  const camera = useRef();
  const renderer = useRef();
  const controls = useRef();
  const buildingMeshes = useRef([]);
  const shadowMeshes = useRef([]);
  const directionalLight = useRef();
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化Three.js场景和渲染器
  useEffect(() => {
    // 创建场景
    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color(0xf0f0f0);

    // 创建相机
    camera.current = new THREE.PerspectiveCamera(
      75, 
      1, // 临时宽高比，将在resize时更新
      0.1, 
      1000
    );
    camera.current.position.set(50, 50, 50);
    camera.current.lookAt(0, 0, 0);

    // 创建渲染器
    renderer.current = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false // 不透明背景，性能更好
    });
    renderer.current.shadowMap.enabled = true; // 启用阴影映射
    renderer.current.shadowMap.type = THREE.PCFSoftShadowMap; // 柔和阴影

    // 将渲染器canvas添加到容器中
    containerRef.current.appendChild(renderer.current.domElement);

    // 添加轨道控制器
    controls.current = new OrbitControls(camera.current, renderer.current.domElement);
    controls.current.enableDamping = true;
    controls.current.dampingFactor = 0.1;

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // 环境光
    scene.current.add(ambientLight);

    directionalLight.current = new THREE.DirectionalLight(0xffffff, 1.5); // 平行光（太阳）
    directionalLight.current.position.set(5, 10, 7);
    directionalLight.current.castShadow = true;

    // 配置阴影相机
    directionalLight.current.shadow.camera.top = 50;
    directionalLight.current.shadow.camera.bottom = -50;
    directionalLight.current.shadow.camera.left = -50;
    directionalLight.current.shadow.camera.right = 50;
    directionalLight.current.shadow.camera.near = 0.1;
    directionalLight.current.shadow.camera.far = 200;
    directionalLight.current.shadow.mapSize.width = 2048;
    directionalLight.current.shadow.mapSize.height = 2048;

    scene.current.add(directionalLight.current);

    // 添加地面
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe0e0e0, 
      roughness: 0.8, 
      metalness: 0.2 
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.current.add(plane);

    // 添加方位文字
    function createLabel(text, position, scale = 30) {
      const canvas = document.createElement('canvas');
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      context.font = 'Bold 128px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = 'red';
      context.fillText(text, size / 2, size / 2);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(...position);
      sprite.scale.set(scale, scale, 1);
      return sprite;
    }

    const directions = [
      { text: '南', position: [0, 0.01, 45] },
      { text: '北', position: [0, 0.01, -45] },
      { text: '东', position: [45, 0.01, 0] },
      { text: '西', position: [-45, 0.01, 0] }
    ];

    directions.forEach(({ text, position }) => {
      scene.current.add(createLabel(text, position));
    });

    // 处理窗口大小变化（关键部分：强制高度为600px）
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth || 800;
      const height = 600; // 直接强制高度为600px
      
      // 设置相机和渲染器尺寸
      camera.current.aspect = width / height;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(width, height);
      
      // 标记为已初始化
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    // 立即调用一次以设置正确尺寸
    handleResize();

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);

    // 添加定时器确保尺寸正确设置（解决某些浏览器延迟问题）
    const timer1 = setTimeout(() => {
      handleResize();
      console.log('第一次强制设置尺寸');
    }, 100);

    const timer2 = setTimeout(() => {
      handleResize();
      console.log('第二次强制设置尺寸');
    }, 500);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      controls.current.update();
      renderer.current.render(scene.current, camera.current);
    };
    animate();

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (renderer.current) {
        renderer.current.dispose();
      }
      if (containerRef.current && renderer.current) {
        containerRef.current.removeChild(renderer.current.domElement);
      }
    };
  }, [isInitialized]);

  const updateSunPosition = useCallback(() => {
      if (!isInitialized || !selectedDate) return;

      const latitude = 30;
      const longitude = 120;
      const sunPosition = calculateSunPosition(selectedDate, latitude, longitude);

      // 根据太阳位置更新光源位置
      const altitudeRad = sunPosition.altitude * (Math.PI / 180);
      const azimuthRad = sunPosition.azimuth * (Math.PI / 180);
      const radius = 20;

      const x = radius * Math.cos(altitudeRad) * Math.sin(azimuthRad);
      const y = radius * Math.sin(altitudeRad);
      const z = radius * Math.cos(altitudeRad) * Math.cos(azimuthRad);

      directionalLight.current.position.set(x, y, z);
      directionalLight.current.target.position.set(0, 0, 0);
      directionalLight.current.target.updateMatrixWorld();
    },
    [selectedDate, isInitialized]
  );

  useEffect(() => {
    updateSunPosition();
  }, [selectedDate, isInitialized, updateSunPosition]);

    // 更新场景中的建筑物和阴影
    const updateScene = useCallback(() => {
        // 确保场景已初始化
        if (!isInitialized) return;
        
        // 清除旧的建筑物和阴影
        if (buildingMeshes.current.length) {
          buildingMeshes.current.forEach(mesh => {
            scene.current.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
          });
          buildingMeshes.current = [];
        }
        
        if (shadowMeshes.current.length) {
          shadowMeshes.current.forEach(mesh => {
            scene.current.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
          });
          shadowMeshes.current = [];
        }
        
        // 添加新的建筑物
        BUILDINGS.forEach(building => {
          const geometry = new THREE.BoxGeometry(20, building.height, 40);
          const material = new THREE.MeshStandardMaterial({
            color: 0x777777,
            roughness: 0.7,
            metalness: 0.3
          });
          const mesh = new THREE.Mesh(geometry, material);
          
          mesh.position.set(building.position.x, building.height / 2, building.position.y);
          mesh.castShadow = true; // 启用阴影投射
          
          scene.current.add(mesh);
          buildingMeshes.current.push(mesh);
        });
        
        // 添加阴影
        if (shadows && shadows.length) {
          shadows.forEach(({ shadow, building }) => {
            if (shadow && shadow.geometry && shadow.geometry.coordinates) {
              const coordinates = shadow.geometry.coordinates[0];
              const points = coordinates.map(coord => new THREE.Vector2(coord[0], coord[1]));
              
              const shape = new THREE.Shape(points);
              const geometry = new THREE.ShapeGeometry(shape);
              
              // 使用阴影材质
              const material = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.3
              });
              
              const mesh = new THREE.Mesh(geometry, material);
              mesh.rotation.x = -Math.PI / 2;
              mesh.position.y = 0.01; // 避免Z-fighting
              
              scene.current.add(mesh);
              shadowMeshes.current.push(mesh);
            }
          });
        }
      },
      [shadows, isInitialized]
    );

    useEffect(() => {
      updateScene();
    }, [shadows, isInitialized, updateScene]);

    return (
      <div 
        ref={containerRef} 
        className="w-full bg-gray-100 rounded-lg shadow-md overflow-hidden"
        style={{
          // 强制设置高度并使用!important确保优先级
          height: '600px !important',
          display: 'grid',
          gridTemplateRows: '1fr',
          // 添加调试边框以便直观确认容器尺寸
          border: '2px solid red'
        }}
      />
    );
}

export default ThreeDScene;
