"use client";

import { useState, useEffect } from "react";
import { RiPencilLine } from "@remixicon/react";

// ─── Types ───────────────────────────────────────────────────────────────────

type FormatA = { format: "A"; badge: string; domain: string; subtitle: string };
type FormatB = { format: "B"; badge: string; domain: string };
type FormatC = { format: "C"; badge: string; domain: string };
type FormatD = { format: "D"; badge: string; domain: string };

type HeroFindingCardProps = (FormatA | FormatB | FormatC | FormatD) & {
  dotIndex?: number;
  dotCount?: number;
  style?: React.CSSProperties;
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function CardHeader({ domain, subtitle }: { domain: string; subtitle?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: "0.5px solid #EDE5D9",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: "#8A7F72",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#639922",
            flexShrink: 0,
            boxShadow: "0 0 0 0 #639922",
            animation: "heroPulse 2s ease-out infinite",
          }}
        />
        Live Finding
      </span>
      <span
        style={{
          fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: "#8A7F72",
          textTransform: "uppercase",
        }}
      >
        85 Signals Scanned
      </span>

      {/* pulse keyframes injected once */}
      <style>{`
        @keyframes heroPulse {
          0%   { box-shadow: 0 0 0 0 rgba(99,153,34,0.55); }
          70%  { box-shadow: 0 0 0 6px rgba(99,153,34,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,153,34,0); }
        }
      `}</style>
    </div>
  );
}

function BadgeRow({
  badge,
  domain,
  subtitle,
  pencil,
}: {
  badge: string;
  domain: string;
  subtitle?: string;
  pencil?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px 0",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          background: "#FEF0DA",
          color: "#854F0B",
          border: "0.5px solid #F5D89A",
          borderRadius: 100,
          padding: "3px 10px",
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {pencil && <RiPencilLine size={10} />}
        {!pencil && (
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#D97706",
              flexShrink: 0,
            }}
          />
        )}
        {badge}
      </span>
      <span
        style={{
          fontSize: 12,
          color: "#A09690",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        · {domain}
        {subtitle ? ` · ${subtitle}` : ""}
      </span>
    </div>
  );
}

function NavDots({ active = 0, count = 4 }: { active?: number; count?: number }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "0 16px 14px", alignItems: "center" }}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === active ? 20 : 12,
            height: 3,
            borderRadius: 2,
            background: i === active ? "#1A1814" : "#D5CDC4",
            transition: "width 0.3s ease, background 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

function ScorePotential() {
  return (
    <div style={{ background: "#1A1814", padding: "14px 16px" }}>
      <div
        style={{
          fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: "#4A4A47",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Score Potential
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, color: "#8A7F72" }}>NOW 6.5</span>
        <span style={{ fontSize: 12, color: "#639922" }}>TARGET 8.0</span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          background: "#2C2C2A",
          height: 5,
          borderRadius: 3,
          position: "relative",
        }}
      >
        <div
          style={{
            width: "65%",
            height: "100%",
            background: "#639922",
            borderRadius: 3,
          }}
        />
        {/* Target dot — at 80% position (TARGET 8.0 on a 10-pt scale) */}
        <div
          style={{
            position: "absolute",
            left: "80%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#639922",
            border: "2px solid #1A1814",
          }}
        />
      </div>

      <div style={{ fontSize: 11, color: "#6B6358", margin: "8px 0 6px" }}>
        Fix 3 gaps to close most of the distance
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "#6B6358" }}>
        {[
          { label: "Raise contrast", val: "+0.6" },
          { label: "Add trial offer", val: "+0.5" },
          { label: "Place logos", val: "+0.4" },
        ].map(({ label, val }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A4A47", flexShrink: 0 }}
            />
            {label}{" "}
            <span style={{ color: "#639922" }}>{val}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Format bodies ────────────────────────────────────────────────────────────

function FormatABody() {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      {/* Big ratio */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-familjen, 'Familjen Grotesk', sans-serif)",
            fontSize: 52,
            fontWeight: 700,
            color: "#1A1814",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          2.8
        </span>
        <span
          style={{
            fontFamily: "var(--font-familjen, 'Familjen Grotesk', sans-serif)",
            fontSize: 52,
            fontWeight: 400,
            color: "#CBBDAF",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          :1
        </span>
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
          fontSize: 12,
          color: "#8A7F72",
          marginTop: 4,
          marginBottom: 12,
        }}
      >
        contrast ratio · fails WCAG AA
      </div>

      {/* Color fix row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingTop: 12,
          borderTop: "0.5px solid #EDE5D9",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#9CA3AF",
            border: "0.5px solid #ddd",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
            fontSize: 11,
            color: "#C0B9B0",
            textDecoration: "line-through",
          }}
        >
          #9CA3AF on white
        </span>
        <span style={{ fontSize: 11, color: "#C8BFB4" }}>→</span>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#4B5563",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
            fontSize: 11,
            color: "#1A1814",
          }}
        >
          #4B5563
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#639922" }}>· passes AA</span>
      </div>
    </div>
  );
}

function FormatBBody() {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      {/* Column headers */}
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
        <span
          style={{
            flex: 1,
            fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
            fontSize: 9,
            letterSpacing: "0.08em",
            color: "#A09690",
            textTransform: "uppercase",
          }}
        >
          Before
        </span>
        <span
          style={{
            flex: 1,
            fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
            fontSize: 9,
            letterSpacing: "0.08em",
            color: "#A09690",
            textTransform: "uppercase",
          }}
        >
          After
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12 }}>
        <div
          style={{
            flex: 1,
            background: "#F0ECE8",
            border: "0.5px solid #E4DACC",
            borderRadius: 7,
            padding: "9px 16px",
            fontSize: 13,
            color: "#A09690",
          }}
        >
          Get started
        </div>
        <div
          style={{
            flex: 1,
            background: "#1A5C1A",
            borderRadius: 7,
            padding: "9px 16px",
            fontSize: 13,
            color: "white",
            fontWeight: 600,
          }}
        >
          Start free — 14 days, no card
        </div>
      </div>

      {/* Verdict */}
      <div
        style={{
          fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
          fontSize: 11,
          color: "#A09690",
          marginTop: 10,
          marginBottom: 14,
        }}
      >
        vague CTA · no outcome stated
      </div>
    </div>
  );
}

function FormatCBody() {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      {/* Big zero */}
      <div
        style={{
          fontFamily: "var(--font-familjen, 'Familjen Grotesk', sans-serif)",
          fontSize: 52,
          fontWeight: 700,
          color: "#1A1814",
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        0
      </div>
      <div
        style={{
          fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
          fontSize: 12,
          color: "#8A7F72",
          marginBottom: 12,
        }}
      >
        trust signals above the fold
      </div>

      {/* Absent row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingTop: 12,
          borderTop: "0.5px solid #EDE5D9",
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "#A09690",
            textTransform: "uppercase",
          }}
        >
          Absent
        </span>
        <span style={{ fontSize: 11, color: "#C8BFB4" }}>→</span>
        <span style={{ fontSize: 12, color: "#1A1814", fontWeight: 500 }}>
          Customer logos · Ratings · Guarantees
        </span>
      </div>
    </div>
  );
}

function FormatDBody() {
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        {/* Before */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
              fontSize: 9,
              letterSpacing: "0.08em",
              color: "#A09690",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Before
          </div>
          <div style={{ fontSize: 14, color: "#A09690", fontWeight: 400 }}>
            The CRM that works for your team
          </div>
        </div>

        {/* After */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "var(--font-geist-mono, 'Geist Mono', monospace)",
              fontSize: 9,
              letterSpacing: "0.08em",
              color: "#639922",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            After
          </div>
          <div style={{ fontSize: 14, color: "#1A1814", fontWeight: 700 }}>
            Simple CRM for teams who outgrew spreadsheets
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HeroFindingCard(props: HeroFindingCardProps) {
  const { dotIndex = 0, dotCount = 4, style: styleProp } = props;
  const subtitle = props.format === "A" ? props.subtitle : undefined;
  const pencil = props.format === "D";

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        ...styleProp,
      }}
    >
      <CardHeader domain={props.domain} />
      <BadgeRow badge={props.badge} domain={props.domain} subtitle={subtitle} pencil={pencil} />

      {props.format === "A" && <FormatABody />}
      {props.format === "B" && <FormatBBody />}
      {props.format === "C" && <FormatCBody />}
      {props.format === "D" && <FormatDBody />}

      <NavDots active={dotIndex} count={dotCount} />
      <ScorePotential />
    </div>
  );
}

// ─── Rotating hero card (self-contained, ready to drop into any hero panel) ──

export function RotatingFindingCard() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % 4), 4000);
    return () => clearInterval(id);
  }, []);

  const dotProps = { dotIndex: active, dotCount: 4 };

  return (
    <>
      <style>{`
        @keyframes heroCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div key={active} style={{ animation: "heroCardIn 0.35s ease-out both" }}>
        {active === 0 && <HeroFindingCard format="A" badge="CONTRAST" domain="linear.app" subtitle="hero subhead" {...dotProps} />}
        {active === 1 && <HeroFindingCard format="B" badge="CTA COPY" domain="notion.com" {...dotProps} />}
        {active === 2 && <HeroFindingCard format="C" badge="TRUST" domain="vercel.com" {...dotProps} />}
        {active === 3 && <HeroFindingCard format="D" badge="AUDIENCE UNCLEAR" domain="folk.app" {...dotProps} />}
      </div>
    </>
  );
}

// ─── Dev preview ─────────────────────────────────────────────────────────────

export function HeroFindingCardPreview() {
  const w = { style: { width: 280, flexShrink: 0 } } as const;
  return (
    <div style={{ display: "flex", gap: 16, padding: 32, background: "#F0EDE6", flexWrap: "wrap" }}>
      <HeroFindingCard format="A" badge="CONTRAST" domain="linear.app" subtitle="hero subhead" dotIndex={0} dotCount={4} {...w} />
      <HeroFindingCard format="B" badge="CTA COPY" domain="notion.com" dotIndex={1} dotCount={4} {...w} />
      <HeroFindingCard format="C" badge="TRUST" domain="vercel.com" dotIndex={2} dotCount={4} {...w} />
      <HeroFindingCard format="D" badge="AUDIENCE UNCLEAR" domain="folk.app" dotIndex={3} dotCount={4} {...w} />
    </div>
  );
}
