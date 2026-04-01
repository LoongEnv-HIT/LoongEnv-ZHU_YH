import React, { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import URDFLoader from 'urdf-loader';
import { STLLoader } from 'three-stdlib';
import * as THREE from 'three';

export function RobotModel({ url, jointAngles }: { url: string, jointAngles: number[] }) {
  const [robot, setRobot] = useState<any>(null);
  const robotRef = useRef<any>(null);

  useEffect(() => {
    const manager = new THREE.LoadingManager();
    // Register STLLoader to handle .stl files
    manager.addHandler(/\.stl$/i, new STLLoader());
    
    const loader = new URDFLoader(manager);
    
    loader.load(url, (loadedRobot) => {
      // Rotate the robot so Z is up if needed
      loadedRobot.rotation.x = -Math.PI / 2;
      
      // Traverse and set materials
      loadedRobot.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Apply a nice material
          child.material = new THREE.MeshStandardMaterial({
            color: 0x94a3b8, // slate-400
            roughness: 0.6,
            metalness: 0.4,
          });
        }
      });
      
      setRobot(loadedRobot);
    });
  }, [url]);

  useFrame(() => {
    if (robotRef.current && jointAngles) {
      // Update joint angles
      // URDFLoader stores joints in an object
      const joints = Object.values(robotRef.current.joints) as any[];
      // Filter out fixed joints
      const movableJoints = joints.filter(j => j.jointType !== 'fixed');
      
      movableJoints.forEach((joint, index) => {
        if (jointAngles[index] !== undefined) {
          joint.setJointValue(jointAngles[index]);
        }
      });
    }
  });

  if (!robot) return null;

  return <primitive ref={robotRef} object={robot} />;
}
