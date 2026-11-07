import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CAPTIONS, HOUSES, populationAt, s } from "./timeline";

const FONT = "'Inter Display', 'Arial Black', 'Helvetica Neue', Arial, sans-serif";

// Smooth outline built from shadows (no miter spikes like -webkit-text-stroke).
const outline = (w: number) => {
  const parts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    parts.push(`${(Math.cos(a) * w).toFixed(1)}px ${(Math.sin(a) * w).toFixed(1)}px 0 #111`);
  }
  parts.push(`0 ${w + 5}px 0 rgba(0,0,0,0.45)`);
  return parts.join(",");
};

const stroke: React.CSSProperties = { fontWeight: 900, textShadow: outline(7) };

// Words wrapped in *asterisks* are highlighted yellow.
const renderText = (text: string) =>
  text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") ? (
      <span key={i} style={{ color: "#ffe14d" }}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = populationAt(frame);

  const lastChange = Math.max(0, ...HOUSES.filter((h) => frame >= h.appearAt).map((h) => h.appearAt));
  const bump = lastChange ? 1 + 0.25 * (1 - spring({ frame: frame - lastChange, fps, config: { damping: 12 } })) : 1;

  const cap = CAPTIONS.find((c) => frame >= s(c.from) && frame < s(c.to));
  const capIn = cap ? spring({ frame: frame - s(cap.from), fps, config: { damping: 12, stiffness: 200 } }) : 0;

  const hudIn = spring({ frame, fps, config: { damping: 14 } });
  const endIn = spring({ frame: frame - s(41), fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: "white", alignItems: "center" }}>
      {/* HUD */}
      <div style={{ marginTop: 170, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${hudIn})` }}>
        <div style={{ background: "#ff4d6d", padding: "10px 34px", borderRadius: 60, fontSize: 52, fontWeight: 900, letterSpacing: 2, border: "6px solid #111" }}>
          DAY 1
        </div>
        <div style={{ marginTop: 22, fontSize: 40, letterSpacing: 4, ...stroke, textShadow: outline(5) }}>POPULATION</div>
        <div style={{ fontSize: 130, lineHeight: 1, transform: `scale(${bump})`, ...stroke }}>{pop}</div>
      </div>

      {/* Caption */}
      {cap && frame < s(41) ? (
        <div
          style={{
            position: "absolute",
            top: 1230,
            width: 900,
            textAlign: "center",
            fontSize: 78,
            lineHeight: 1.12,
            transform: `scale(${interpolate(capIn, [0, 1], [0.7, 1])})`,
            opacity: capIn,
            ...stroke,
          }}
        >
          {renderText(cap.text)}
        </div>
      ) : null}

      {/* End card */}
      {frame >= s(41) ? (
        <div style={{ position: "absolute", top: 1150, textAlign: "center", transform: `scale(${endIn}) rotate(-3deg)` }}>
          <div style={{ fontSize: 110, lineHeight: 1.05, ...stroke }}>
            COMMENT
            <br />
            TO <span style={{ color: "#ffe14d" }}>MOVE IN</span>
          </div>
          <div style={{ marginTop: 26, fontSize: 48, ...stroke, textShadow: outline(5) }}>follow so you can find your house</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
