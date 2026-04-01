import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Environment, ContactShadows, Float, Stage } from '@react-three/drei';
import { motion } from 'motion/react';
import { Box, Cpu, Activity, Zap, ShieldAlert } from 'lucide-react';

function RobotArm() {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.5, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Joint 1 */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      
      {/* Arm 1 */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.15, 0.15, 1.5, 32]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      
      {/* Joint 2 */}
      <mesh position={[0.5, 2, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Arm 2 */}
      <mesh position={[1, 2.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 32]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* End Effector */}
      <mesh position={[1.3, 3, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

export function SimulationView() {
  return (
    <div className="w-full h-full bg-[#ffffff] relative overflow-hidden flex flex-col">
      {/* Overlay HUD - VSCode Style */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-2 py-0.5 bg-[#f3f3f3] border border-[#e5e5e5] text-[#333333]">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-wider">引擎: MuJoCo WASM</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-0.5 bg-[#f3f3f3] border border-[#e5e5e5] text-[#333333]">
          <Activity className="w-3 h-3 text-blue-600" />
          <span className="text-[10px] font-medium">物理引擎已激活</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-[#f3f3f3] border border-[#e5e5e5] p-2 w-40">
          <p className="text-[9px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-1.5">关节状态 (Joint States)</p>
          <div className="space-y-1">
            {[
              { label: 'J1', val: '0.452', p: '45%' },
              { label: 'J2', val: '-1.204', p: '20%' },
              { label: 'J3', val: '0.881', p: '65%' },
              { label: 'J4', val: '2.115', p: '80%' }
            ].map(j => (
              <div key={j.label} className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[#6f6f6f] w-4">{j.label}</span>
                <div className="flex-1 h-1 bg-[#e5e5e5] overflow-hidden">
                  <div className="h-full bg-[#007acc]" style={{ width: j.p }} />
                </div>
                <span className="text-[9px] font-mono text-[#333333]">{j.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
        <div className="bg-[#f3f3f3] border border-[#e5e5e5] px-2 py-1">
          <span className="text-[9px] font-bold text-[#6f6f6f] uppercase tracking-wider mr-2">帧率 (FPS)</span>
          <span className="text-xs font-mono text-[#333333]">120.4</span>
        </div>
        <div className="bg-[#f3f3f3] border border-[#e5e5e5] px-2 py-1">
          <span className="text-[9px] font-bold text-[#6f6f6f] uppercase tracking-wider mr-2">步长 (STEP)</span>
          <span className="text-xs font-mono text-[#333333]">0.8ms</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 bg-[#ffffff]">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
          
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5} shadows="contact">
              <RobotArm />
            </Stage>
            <Grid 
              infiniteGrid 
              fadeDistance={50} 
              fadeStrength={5} 
              cellSize={1} 
              sectionSize={5} 
              sectionColor="#e5e5e5" 
              cellColor="#f3f3f3" 
            />
          </Suspense>
          
          <Environment preset="city" />
          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.1} 
            scale={20} 
            blur={2.4} 
            far={4.5} 
          />
        </Canvas>
      </div>
    </div>
  );
}
