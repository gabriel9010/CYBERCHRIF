"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

function MovingLight() {
  const light = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (light.current) {
      light.current.position.x = Math.sin(t * 0.5) * 8;
      light.current.position.z = Math.cos(t * 0.4) * 8;
    }
  });
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight ref={light} position={[0, 5, 0]} intensity={2} color={"#00f6ff"} />
      <pointLight position={[-5, 3, -5]} intensity={1.2} color={"#ff00e1"} />
    </>
  );
}

function Ground() {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#00f6ff"), wireframe: true });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[60, 60, 60, 60]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export default function NeonGrid3D({ height = 420, autoRotate = true }) {
  return (
    <Canvas camera={{ position: [0, 5.5, 9], fov: 55 }} style={{ height }}>
      <color attach="background" args={["transparent"]} />
      <MovingLight />
      <Grid
        args={[60, 60]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#00f6ff"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#ff00e1"
        fadeDistance={35}
        fadeStrength={2}
        infiniteGrid
      />
      <Ground />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate={autoRotate} autoRotateSpeed={0.6} />
    </Canvas>
  );
}
