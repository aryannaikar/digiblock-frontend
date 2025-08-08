import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function Lock3DModel({ position = [0, 0, 0], scale = 1, isExpanding = false }) {
  const gltf = useLoader(GLTFLoader, '/lock.glb');
  const meshRef = useRef();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Only rotate based on scroll position, not mouse
      meshRef.current.rotation.y = scrollY * 0.001;
      
      // Add floating animation (reduce during expansion)
      const floatIntensity = isExpanding ? 0.02 : 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * floatIntensity;
      
      // Apply position and scale from props with immediate effect
      meshRef.current.position.x = position[0];
      meshRef.current.position.z = position[2];
      
      // Apply scale with smooth transitions (reduced scale for smaller locker)
      const targetScale = isExpanding ? 2 : scale * 0.3; // Reduced base scale from 0.6 to 0.3
      const currentScale = meshRef.current.scale.x;
      const newScale = currentScale + (targetScale - currentScale) * 0.08;
      meshRef.current.scale.setScalar(newScale);
      
      // Add subtle rotation animation (reduce during expansion)
      const rotationIntensity = isExpanding ? 0.02 : 0.05;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * rotationIntensity;
      
      // Add expansion-specific effects
      if (isExpanding) {
        // Add a subtle pulsing effect during expansion
        const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.scale.setScalar(newScale * pulseScale);
      }
    }
  });

  // Debug logging to verify props are received
  useEffect(() => {
    console.log('Lock3DModel received position:', position, 'scale:', scale);
  }, [position, scale]);

  return (
    <group ref={meshRef}>
      <primitive 
        object={gltf.scene} 
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
      />
      
      {/* Enhanced lighting setup */}
      <ambientLight intensity={isExpanding ? 0.6 : 0.4} />
      
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={isExpanding ? 1.5 : 1.2} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      <pointLight 
        position={[-10, -10, -10]} 
        intensity={isExpanding ? 1.2 : 0.8} 
        color="#0066ff"
      />
      
      <pointLight 
        position={[10, -10, 10]} 
        intensity={isExpanding ? 1.0 : 0.6} 
        color="#ff6600"
      />
      
      {/* Add a subtle spotlight effect */}
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={isExpanding ? 0.8 : 0.5}
        castShadow
        color="#ffffff"
      />
      
      {/* Add extra lights during expansion for dramatic effect */}
      {isExpanding && (
        <>
          <pointLight 
            position={[0, 5, 0]} 
            intensity={0.5} 
            color="#ffffff"
          />
          <pointLight 
            position={[0, -5, 0]} 
            intensity={0.3} 
            color="#00ffff"
          />
        </>
      )}
    </group>
  );
} 