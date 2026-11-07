import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { HouseModel, Lighthouse, MayorHall, Person, Tree } from "./Models";
import { Overlay } from "./Overlay";
import {
  HOUSES,
  ISLAND_GROW_FROM,
  ISLAND_GROW_TO,
  ISLAND_R_END,
  ISLAND_R_START,
  RESERVED_PLOT,
  s,
} from "./timeline";

// ---------- Camera ----------
type Key = { t: number; th: number; d: number; h: number; c: [number, number, number] };
const h0 = HOUSES[0];
const KEYS: Key[] = [
  { t: 0, th: 1.2, d: 20, h: 14, c: [0, 0, 0] },
  { t: 3.0, th: 1.45, d: 6, h: 3.2, c: [0, 0.6, 0] },
  { t: 7.0, th: 1.65, d: 5.2, h: 2.4, c: [0, 0.6, 0] },
  { t: 9.5, th: 1.3, d: 10, h: 6, c: [0, 0, 0] },
  { t: 11.6, th: Math.atan2(h0.z, h0.x) + 0.15, d: 3.6, h: 2, c: [h0.x, 0.35, h0.z] },
  { t: 14.6, th: Math.atan2(h0.z, h0.x) + 0.35, d: 4.2, h: 2.2, c: [h0.x, 0.35, h0.z] },
  { t: 16.2, th: 2.3, d: 9, h: 5.5, c: [0, 0, 0] },
  { t: 20.5, th: 3.5, d: 9, h: 5.5, c: [0, 0, 0] },
  { t: 24.5, th: 3.8, d: 14, h: 9, c: [0, 0, 0] },
  { t: 31, th: 4.8, d: 22, h: 15, c: [0, 0, 0] },
  { t: 35, th: 5.5, d: 19, h: 13, c: [0, 0, 0] },
  { t: 37.6, th: Math.PI * 2 + 0.12, d: 2.6, h: 4.2, c: [RESERVED_PLOT.x, 0.3, RESERVED_PLOT.z] },
  { t: 40.6, th: Math.PI * 2 + 0.3, d: 3.0, h: 4.6, c: [RESERVED_PLOT.x, 0.3, RESERVED_PLOT.z] },
  { t: 44, th: Math.PI * 2 + 0.7, d: 20, h: 14, c: [0, 0, 0] },
];

const camAt = (frame: number, fps: number) => {
  const t = frame / fps;
  let i = KEYS.findIndex((k) => k.t > t) - 1;
  if (i < 0) i = t <= 0 ? 0 : KEYS.length - 2;
  const a = KEYS[i];
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const p = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t || 1))));
  const L = (x: number, y: number) => x + (y - x) * p;
  const th = L(a.th, b.th);
  const d = L(a.d, b.d);
  const h = L(a.h, b.h);
  const c: [number, number, number] = [L(a.c[0], b.c[0]), L(a.c[1], b.c[1]), L(a.c[2], b.c[2])];
  return { pos: [c[0] + Math.cos(th) * d, c[1] + h, c[2] + Math.sin(th) * d] as const, c };
};

const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { camera } = useThree();
  useLayoutEffect(() => {
    const { pos, c } = camAt(frame, fps);
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(c[0], c[1], c[2]);
  }, [frame, fps, camera]);
  return null;
};

// ---------- Scene pieces ----------
const pop = (frame: number, at: number, fps: number) =>
  frame < at ? 0 : spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 170 } });

const Island: React.FC<{ r: number; frame: number }> = ({ r, frame }) => (
  <group>
    <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[120, 48]} />
      <meshStandardMaterial color="#2aa7d6" roughness={0.4} />
    </mesh>
    {/* shallow water ring */}
    <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r + 0.3, r + 2.2 + Math.sin(frame / 20) * 0.08, 24]} />
      <meshStandardMaterial color="#6fd6ee" transparent opacity={0.8} flatShading />
    </mesh>
    <mesh position={[0, -1.4, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[r + 0.6, r + 1.1, 2.6, 16]} />
      <meshStandardMaterial color="#f1d9a0" flatShading />
    </mesh>
    <mesh position={[0, -0.06, 0]} receiveShadow>
      <cylinderGeometry args={[r - 0.15, r + 0.2, 0.12, 16]} />
      <meshStandardMaterial color="#6cc25a" flatShading />
    </mesh>
    {/* main water surface */}
    <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r + 0.5, 120, 48]} />
      <meshStandardMaterial color="#35b4e0" transparent opacity={0.92} />
    </mesh>
  </group>
);

const TREES = Array.from({ length: 26 }, (_, i) => {
  const ring = i < 6 ? 3.15 : i < 14 ? 4.6 : i < 20 ? 6.0 : 7.7;
  const a = random(`ta${i}`) * Math.PI * 2;
  return { x: Math.cos(a) * ring, z: Math.sin(a) * ring, s: 0.8 + random(`ts${i}`) * 0.5, late: ring > 7 };
}).filter((t) => Math.hypot(t.x - RESERVED_PLOT.x, t.z - RESERVED_PLOT.z) > 1.2 && !HOUSES.some((h) => Math.hypot(t.x - h.x, t.z - h.z) < 0.85));

const ReservedPlot: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = interpolate(frame, [s(35), s(36)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <group position={[RESERVED_PLOT.x, 0.01, RESERVED_PLOT.z]} rotation={[0, RESERVED_PLOT.rot, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 0.9]} />
        <meshStandardMaterial color="#b98a52" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.02, 0]} scale={1 + glow * pulse * 0.15}>
        <ringGeometry args={[0.62, 0.72, 4]} />
        <meshStandardMaterial color="#ffe14d" emissive="#ffd000" emissiveIntensity={0.2 + glow * pulse * 1.5} transparent opacity={0.35 + glow * 0.65} />
      </mesh>
      {/* little sign */}
      <mesh position={[0.35, 0.25, 0.42]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 5]} />
        <meshStandardMaterial color="#6b4a2b" />
      </mesh>
      <mesh position={[0.35, 0.48, 0.43]}>
        <boxGeometry args={[0.36, 0.2, 0.03]} />
        <meshStandardMaterial color="#fff6d5" emissive="#ffe14d" emissiveIntensity={glow * pulse * 0.6} />
      </mesh>
    </group>
  );
};

const ResidentWalker: React.FC<{ frame: number }> = ({ frame }) => {
  // Resident #1 walks up from the beach and goes inside.
  const start = s(12.3);
  const end = s(14.0);
  if (frame < start || frame > s(14.4)) return null;
  const a = Math.atan2(h0.z, h0.x);
  const p = interpolate(frame, [start, end], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const r0 = Math.hypot(h0.x, h0.z);
  const r = interpolate(p, [0, 1], [r0 + 2.4, r0 + 0.38]);
  const sc = interpolate(frame, [end, s(14.4)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <group position={[Math.cos(a) * r, 0, Math.sin(a) * r]} rotation={[0, -a - Math.PI / 2, 0]} scale={sc * 1.15}>
      <Person color="#ff5c8a" bob={Math.sin(frame / 2.2)} />
    </group>
  );
};

export const IslandVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const r = interpolate(frame, [ISLAND_GROW_FROM, ISLAND_GROW_TO], [ISLAND_R_START, ISLAND_R_END], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const mayorPop = pop(frame, s(0.8), fps);
  const lighthousePop = pop(frame, s(28.5), fps);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#7fcdf7, #d8f1ff)" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 55, near: 0.1, far: 400 }}>
        <CameraRig />
        <fog attach="fog" args={["#bfe6fb", 30, 90]} />
        <hemisphereLight args={["#ffffff", "#5aa0c8", 1.4]} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={2.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
        />
        <Island r={r} frame={frame} />

        <group scale={mayorPop}>
          <MayorHall flagWave={frame / 6} />
        </group>
        <group position={[0.75, 0, 0.95]} scale={mayorPop * 1.15}>
          <Person color="#2c3e50" wave={frame >= s(3.5) && frame < s(8) ? frame / 3 : 0} />
        </group>

        <ReservedPlot frame={frame} />

        {TREES.map((t, i) => {
          const sc = t.late ? pop(frame, ISLAND_GROW_TO - 10 + i * 2, fps) : pop(frame, s(0.3) + i * 2, fps);
          return <Tree key={i} x={t.x} z={t.z} s={t.s * sc} />;
        })}

        {HOUSES.map((h) => {
          const sc = pop(frame, h.appearAt, fps);
          if (sc === 0) return null;
          const personSc = pop(frame, h.appearAt + (h.id === 0 ? s(3) : 8), fps);
          return (
            <group key={h.id} position={[h.x, 0, h.z]} rotation={[0, h.rot, 0]}>
              <group scale={[sc, sc, sc]} position={[0, (1 - Math.min(sc, 1)) * 0.8, 0]}>
                <HouseModel style={h.style} color={h.color} roof={h.roof} />
              </group>
              {personSc > 0 ? (
                <group position={[0.38, 0, 0.55]} scale={personSc * 1.1}>
                  <Person
                    color={["#ff5c8a", "#ffb400", "#4caf50", "#3f7cff", "#9b59b6"][h.id % 5]}
                    bob={Math.sin(frame / 4 + h.id)}
                    wave={h.id === 0 ? frame / 3 : 0}
                  />
                </group>
              ) : null}
            </group>
          );
        })}

        <ResidentWalker frame={frame} />

        {lighthousePop > 0 ? (
          <group position={[Math.cos(4.3) * (ISLAND_R_END - 0.7), 0, Math.sin(4.3) * (ISLAND_R_END - 0.7)]} scale={lighthousePop}>
            <Lighthouse glow={0.6 + 0.4 * Math.sin(frame / 6)} />
          </group>
        ) : null}
      </ThreeCanvas>
      <Overlay />
    </AbsoluteFill>
  );
};
