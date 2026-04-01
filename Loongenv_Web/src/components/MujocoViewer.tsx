import React from 'react';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { MujocoProvider, MujocoCanvas } from 'mujoco-react';

export const MujocoViewer: React.FC<{ isPaused?: boolean; speed?: number }> = ({ isPaused = true, speed = 1 }) => {
  return (
    <div className="relative w-full h-full bg-black/40 rounded-xl overflow-hidden border border-white/10">
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${!isPaused ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className={`text-xs font-mono font-bold ${!isPaused ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPaused ? 'MuJoCo PAUSED' : 'MuJoCo RUNNING'}
          </span>
        </div>
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <span className="text-xs font-mono text-muted">Model: er15-1400.mjcf.xml</span>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-muted uppercase">Physics State</span>
          <span className="text-xs font-mono text-blue-400">FPS: 60 | Speed: {speed}x</span>
          <span className="text-xs font-mono text-main">Task: ER15-1400 Simulation</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <MujocoProvider>
        <MujocoCanvas 
          config={{
            src: '/models/',
            sceneFile: 'er15-1400.mjcf.xml'
          }}
          paused={isPaused}
          speed={speed}
          shadows 
          camera={{ position: [3, 2, 3], fov: 45 }}
        >
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          
          {/* Environment & Ground */}
          <Grid 
            renderOrder={-1} 
            position={[0, 0, 0]} 
            infiniteGrid 
            cellSize={0.5} 
            cellThickness={0.5} 
            sectionSize={2} 
            sectionThickness={1} 
            sectionColor="#8080ff" 
            fadeDistance={10} 
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial transparent opacity={0.4} />
          </mesh>
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} />
          <Environment preset="city" />
        </MujocoCanvas>
      </MujocoProvider>
    </div>
  );
};
