import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Lock3DModel from './Lock3DModel';

export default function Scene3D({ position = [0, 0, 0], scale = 1, isExpanding = false }) {
  return (
    <div 
      className={isExpanding ? 'model-container expanding' : 'model-container'}
      style={{ 
        width: '100%', 
        height: isExpanding ? '100vh' : '60vh', 
        background: 'transparent',
        borderRadius: isExpanding ? '0' : '15px',
        overflow: 'hidden',
        boxShadow: 'none',
        transition: 'all 1.5s ease-in-out',
        position: isExpanding ? 'fixed' : 'relative',
        top: isExpanding ? '0' : 'auto',
        left: isExpanding ? '0' : 'auto',
        zIndex: isExpanding ? '1500' : 'auto'
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 0, isExpanding ? 4 : 12], 
          fov: isExpanding ? 60 : 45,
          near: 0.1,
          far: 1000
        }}
        style={{ background: 'transparent' }}
      >
        <Lock3DModel 
          position={position} 
          scale={scale} 
          isExpanding={isExpanding}
        />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={false}
          autoRotate={false}
          minDistance={3}
          maxDistance={30}
          zoomSpeed={0.5}
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
} 