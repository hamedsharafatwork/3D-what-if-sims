import React from "react";
import { HouseStyle } from "./timeline";

const Mat: React.FC<{ color: string }> = ({ color }) => (
  <meshStandardMaterial color={color} flatShading roughness={0.85} />
);

export const Tree: React.FC<{ x: number; z: number; s?: number }> = ({ x, z, s = 1 }) => (
  <group position={[x, 0, z]} scale={s}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.1, 0.5, 6]} />
      <Mat color="#7a5230" />
    </mesh>
    <mesh position={[0, 0.75, 0]} castShadow>
      <coneGeometry args={[0.38, 0.8, 7]} />
      <Mat color="#3f9b4f" />
    </mesh>
    <mesh position={[0, 1.08, 0]} castShadow>
      <coneGeometry args={[0.28, 0.55, 7]} />
      <Mat color="#4fb35f" />
    </mesh>
  </group>
);

export const Person: React.FC<{ color: string; bob?: number; wave?: number }> = ({ color, bob = 0, wave = 0 }) => (
  <group position={[0, Math.abs(bob) * 0.06, 0]}>
    <mesh position={[0, 0.17, 0]} castShadow>
      <capsuleGeometry args={[0.08, 0.16, 4, 8]} />
      <Mat color={color} />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <sphereGeometry args={[0.085, 10, 8]} />
      <Mat color="#f2c9a0" />
    </mesh>
    {wave !== 0 ? (
      <mesh position={[0.11, 0.33, 0]} rotation={[0, 0, -0.6 + Math.sin(wave) * 0.5]}>
        <capsuleGeometry args={[0.025, 0.14, 3, 6]} />
        <Mat color={color} />
      </mesh>
    ) : null}
  </group>
);

const Door: React.FC<{ z: number; h?: number }> = ({ z, h = 0.32 }) => (
  <mesh position={[0, h / 2, z + 0.005]}>
    <boxGeometry args={[0.18, h, 0.02]} />
    <Mat color="#5b3a22" />
  </mesh>
);

const Window: React.FC<{ x: number; y: number; z: number }> = ({ x, y, z }) => (
  <mesh position={[x, y, z + 0.005]}>
    <boxGeometry args={[0.14, 0.14, 0.02]} />
    <meshStandardMaterial color="#9fd8ff" emissive="#4aa3d8" emissiveIntensity={0.25} />
  </mesh>
);

export const HouseModel: React.FC<{ style: HouseStyle; color: string; roof: string }> = ({ style, color, roof }) => {
  if (style === "shack") {
    return (
      <group>
        {[[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.1, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.2, 5]} />
            <Mat color="#8a6a48" />
          </mesh>
        ))}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.75, 0.45, 0.6]} />
          <Mat color={color} />
        </mesh>
        <mesh position={[0, 0.69, 0.03]} rotation={[0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.92, 0.06, 0.8]} />
          <Mat color="#f2d38b" />
        </mesh>
        <group position={[0, 0.2, 0]}>
          <Door z={0.3} />
        </group>
        <Window x={0.22} y={0.48} z={0.3} />
      </group>
    );
  }
  if (style === "castle") {
    return (
      <group>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.8, 0.7, 0.7]} />
          <Mat color={color} />
        </mesh>
        {[[-0.4, -0.35], [0.4, -0.35], [-0.4, 0.35], [0.4, 0.35]].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.13, 1, 8]} />
              <Mat color={color} />
            </mesh>
            <mesh position={[0, 1.15, 0]} castShadow>
              <coneGeometry args={[0.17, 0.32, 8]} />
              <Mat color={roof} />
            </mesh>
          </group>
        ))}
        <Door z={0.35} h={0.38} />
      </group>
    );
  }
  const isCabin = style === "cabin";
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.6, 0.7]} />
        <Mat color={color} />
      </mesh>
      <mesh position={[0, isCabin ? 0.86 : 0.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.66, isCabin ? 0.6 : 0.45, 4]} />
        <Mat color={isCabin ? "#4a3222" : roof} />
      </mesh>
      {isCabin ? (
        <mesh position={[0.25, 0.95, -0.1]} castShadow>
          <boxGeometry args={[0.1, 0.35, 0.1]} />
          <Mat color="#7d7d7d" />
        </mesh>
      ) : null}
      <Door z={0.35} />
      <Window x={0.24} y={0.38} z={0.35} />
      <Window x={-0.24} y={0.38} z={0.35} />
    </group>
  );
};

export const MayorHall: React.FC<{ flagWave: number }> = ({ flagWave }) => (
  <group>
    <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.3, 0.9, 1]} />
      <Mat color="#fff7e8" />
    </mesh>
    {[-0.45, -0.15, 0.15, 0.45].map((x) => (
      <mesh key={x} position={[x, 0.45, 0.52]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
        <Mat color="#ffffff" />
      </mesh>
    ))}
    <mesh position={[0, 1.08, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[1, 0.4, 4]} />
      <Mat color="#c0392b" />
    </mesh>
    <mesh position={[0, 1.55, 0]}>
      <cylinderGeometry args={[0.02, 0.02, 0.9, 6]} />
      <Mat color="#666" />
    </mesh>
    <mesh position={[0.18, 1.85, 0]} rotation={[0, Math.sin(flagWave) * 0.35, 0]}>
      <boxGeometry args={[0.34, 0.2, 0.02]} />
      <Mat color="#ffcc00" />
    </mesh>
    <Door z={0.5} h={0.42} />
  </group>
);

export const Lighthouse: React.FC<{ glow: number }> = ({ glow }) => (
  <group>
    {[0, 1, 2, 3].map((i) => (
      <mesh key={i} position={[0, 0.25 + i * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.32 - i * 0.04, 0.36 - i * 0.04, 0.5, 10]} />
        <Mat color={i % 2 === 0 ? "#ffffff" : "#e74c3c"} />
      </mesh>
    ))}
    <mesh position={[0, 2.2, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 0.3, 10]} />
      <meshStandardMaterial color="#fff6b0" emissive="#ffe066" emissiveIntensity={glow} />
    </mesh>
    <mesh position={[0, 2.5, 0]} castShadow>
      <coneGeometry args={[0.3, 0.3, 10]} />
      <Mat color="#c0392b" />
    </mesh>
  </group>
);
