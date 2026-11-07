import { random } from "remotion";

export const FPS = 30;
export const DURATION_SEC = 44;
export const s = (sec: number) => Math.round(sec * FPS);

// ---------- Captions (the voiceover script) ----------
export type Caption = { from: number; to: number; text: string };

export const CAPTIONS: Caption[] = [
  { from: 0, to: 3.5, text: "Day 1 of building a tiny town on an empty island." },
  { from: 3.5, to: 7.5, text: "Right now it's just me. Population: *one very bored mayor.*" },
  { from: 7.5, to: 11, text: "Here's the idea: follow along, drop a comment…" },
  { from: 11, to: 15, text: "…and a little house pops up. A little person moves in. *That's you.*" },
  { from: 15, to: 21, text: "Want a say? Comment a color or a vibe. *Beach shack, cabin, tiny castle…*" },
  { from: 21, to: 24.5, text: "No pressure. Even just *“hi”* gets you a house." },
  { from: 24.5, to: 31, text: "The more neighbors we get, the bigger the island grows." },
  { from: 31, to: 35, text: "Every day I'll show you who moved in." },
  { from: 35, to: 41, text: "So… want a spot? I saved one *right next door.*" },
  { from: 41, to: 44, text: "Comment to move in!" },
];

// ---------- Houses ----------
export type HouseStyle = "classic" | "shack" | "cabin" | "castle";
export type House = {
  id: number;
  x: number;
  z: number;
  rot: number;
  appearAt: number; // frame
  style: HouseStyle;
  color: string;
  roof: string;
};

const WALLS = ["#f7e6c4", "#ffd1dc", "#cde7ff", "#d9f5c5", "#fff3a8", "#e8d5ff", "#ffffff", "#ffcfa3"];
const ROOFS = ["#d9534f", "#3b6ea8", "#5a9e4b", "#8a5a3c", "#e07b39", "#7d4fa8", "#2f4858"];

// Rings of plots around the mayor's house at the center.
const RINGS = [
  { r: 2.4, n: 6 },
  { r: 3.9, n: 10 },
  { r: 5.3, n: 14 },
  { r: 6.9, n: 18 },
];

const plots: { x: number; z: number; rot: number }[] = [];
RINGS.forEach((ring, ri) => {
  for (let i = 0; i < ring.n; i++) {
    const a = (i / ring.n) * Math.PI * 2 + ri * 0.35;
    const jitter = (random(`j${ri}-${i}`) - 0.5) * 0.35;
    const r = ring.r + jitter;
    plots.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, rot: -a + Math.PI / 2 });
  }
});

// Plot 0 (ring 1, facing the camera side) is the reserved "next door" spot.
export const RESERVED_PLOT = plots[0];
const freePlots = plots.slice(1);

// Appearance schedule (seconds)
const schedule: number[] = [12]; // the first resident
schedule.push(16, 17.6, 19.2); // shack, cabin, castle examples
for (let i = 0; i < 30; i++) schedule.push(24.6 + i * 0.21); // rapid growth
for (let i = 0; i < 6; i++) schedule.push(31.2 + i * 0.6);

const exampleStyles: HouseStyle[] = ["classic", "shack", "cabin", "castle"];

export const HOUSES: House[] = schedule.map((t, i) => {
  const p = freePlots[i];
  const style: HouseStyle =
    i < 4 ? exampleStyles[i] : (["classic", "classic", "shack", "cabin", "castle"] as const)[Math.floor(random(`st${i}`) * 5)];
  const color =
    style === "shack" ? "#bfe6ff" : style === "cabin" ? "#a8744f" : style === "castle" ? "#c9c9d1" : WALLS[Math.floor(random(`w${i}`) * WALLS.length)];
  return {
    id: i,
    x: p.x,
    z: p.z,
    rot: p.rot,
    appearAt: s(t),
    style,
    color: i === 0 ? "#ffd1dc" : color,
    roof: ROOFS[Math.floor(random(`r${i}`) * ROOFS.length)],
  };
});

export const populationAt = (frame: number) =>
  1 + HOUSES.filter((h) => frame >= h.appearAt).length;

// Island radius grows when it gets crowded
export const ISLAND_GROW_FROM = s(26);
export const ISLAND_GROW_TO = s(30);
export const ISLAND_R_START = 6.2;
export const ISLAND_R_END = 8.4;
