// src/components/MolecularViewer.tsx
import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Atom {
  element: string;
  position: [number, number, number];
  color: string;
  size: number;
}

interface MoleculeProps {
  atoms: Atom[];
  bonds?: Array<[number, number]>;
  title?: string;
}

function Molecule({ atoms, bonds = [], title }: MoleculeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Render atoms */}
      {atoms.map((atom, index) => (
        <group key={index} position={atom.position}>
          <Sphere args={[atom.size, 32, 32]}>
            <meshStandardMaterial color={atom.color} />
          </Sphere>
          <Text
            position={[0, atom.size + 0.5, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {atom.element}
          </Text>
        </group>
      ))}

      {/* Render bonds */}
      {bonds.map(([atomA, atomB], index) => {
        const posA = new THREE.Vector3(...atoms[atomA].position);
        const posB = new THREE.Vector3(...atoms[atomB].position);
        const direction = new THREE.Vector3().subVectors(posB, posA);
        const length = direction.length();
        const center = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);

        return (
          <group key={index} position={center.toArray()}>
            <mesh rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
              <cylinderGeometry args={[0.05, 0.05, length, 8]} />
              <meshStandardMaterial color="#888888" />
            </mesh>
          </group>
        );
      })}

      {title && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.5}
          color="#2ea3ff"
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
      )}
    </group>
  );
}

export default function MolecularViewer({ molecule }: { molecule: MoleculeProps }) {
  // Example EUV resist molecule (simplified)
  const euvResistMolecule: MoleculeProps = {
    atoms: [
      { element: 'C', position: [0, 0, 0], color: '#444444', size: 0.3 },
      { element: 'C', position: [1, 0, 0], color: '#444444', size: 0.3 },
      { element: 'C', position: [2, 0, 0], color: '#444444', size: 0.3 },
      { element: 'O', position: [0.5, 1, 0], color: '#ff4444', size: 0.25 },
      { element: 'N', position: [1.5, -1, 0], color: '#4444ff', size: 0.25 },
      { element: 'H', position: [0, 0, 1], color: '#ffffff', size: 0.15 },
      { element: 'H', position: [2, 0, 1], color: '#ffffff', size: 0.15 },
    ],
    bonds: [[0, 1], [1, 2], [0, 3], [1, 4], [0, 5], [2, 6]],
    title: molecule.title || 'EUV Resist Molecule'
  };

  const finalMolecule = molecule.atoms ? molecule : euvResistMolecule;

  return (
    <div style={{ width: '100%', height: '400px', background: '#0a0a0a', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4444ff" />
        
        <Suspense fallback={null}>
          <Molecule {...finalMolecule} />
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
      
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '10px', 
        color: 'white', 
        fontSize: '12px',
        background: 'rgba(0,0,0,0.7)',
        padding: '5px 10px',
        borderRadius: '4px'
      }}>
        🖱️ Drag to rotate • 🔍 Scroll to zoom
      </div>
    </div>
  );
}
