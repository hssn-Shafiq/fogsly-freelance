import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * FOGSLY Rank Banner — Gold, Silver, Bronze + New Tiers
 */

const TIERS = {
  legend: {
    name: "FOGSLY Legend",
    bg: "from-yellow-400 via-amber-500 to-orange-600", // Gold gradient - matches .bg-rank-legend
    frame: "bg-gradient-to-r from-yellow-200 via-amber-100 to-orange-200",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.75)]",
    text: "text-yellow-900",
    accent: "bg-yellow-400",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z" />
      </svg>
    ),
  },
  master: {
    name: "FOGSLY Master",
    bg: "from-yellow-300 via-yellow-400 to-yellow-600", // Yellow gradient - matches .bg-rank-master
    frame: "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300",
    glow: "shadow-[0_0_60px_rgba(250,204,21,0.75)]",
    text: "text-yellow-900",
    accent: "bg-yellow-300",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M12 3l2.39 4.84 5.34.78-3.87 3.77.91 5.33L12 15.9l-4.77 2.5.91-5.33L4.27 8.62l5.34-.78L12 3z" />
      </svg>
    ),
  },
  vanguard: {
    name: "FOGSLY Vanguard",
    bg: "from-gray-300 via-gray-400 to-gray-600", // Silver gradient - matches .bg-rank-vanguard
    frame: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300",
    glow: "shadow-[0_0_60px_rgba(209,213,219,0.75)]",
    text: "text-gray-800",
    accent: "bg-gray-300",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M13 2l-1 9h8l-9 11 1-9H4l9-11z" />
      </svg>
    ),
  },
  earlybird: {
    name: "#FOGSLYEarlyBird",
    bg: "from-orange-500 via-orange-600 to-orange-700", // Orange gradient - matches .bg-rank-earlybird
    frame: "bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400",
    glow: "shadow-[0_0_60px_rgba(249,115,22,0.75)]",
    text: "text-orange-900",
    accent: "bg-orange-400",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M22 12s-4-2-7-2c-3.87 0-7 3.13-7 7 0 0-4-2-6-2 2-3 6-10 13-10 4 0 7 2 7 2l-2 5z" />
      </svg>
    ),
  },
  champion: {
    name: "FOGSLY Champion",
    bg: "from-blue-500 via-blue-600 to-blue-800", // Blue gradient - matches .bg-rank-champion
    frame: "bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400",
    glow: "shadow-[0_0_60px_rgba(59,130,246,0.75)]",
    text: "text-blue-900",
    accent: "bg-blue-400",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M12 2l4 8h8l-6 6 2 8-8-5-8 5 2-8-6-6h8l4-8z" />
      </svg>
    ),
  },
  rookie: {
    name: "FOGSLY Rookie",
    bg: "from-emerald-500 via-emerald-600 to-emerald-800", // Green gradient - matches .bg-rank-rookie
    frame: "bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-400",
    glow: "shadow-[0_0_60px_rgba(16,185,129,0.75)]",
    text: "text-emerald-900",
    accent: "bg-emerald-400",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
      </svg>
    ),
  },
};

const shineVariants = {
  initial: { x: "-150%", opacity: 0 },
  animate: {
    x: "150%",
    opacity: [0, 1, 0],
    transition: { duration: 2, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 3 },
  },
};

const popIn = {
  initial: { scale: 0.6, opacity: 0, rotate: -10 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 20 },
  },
};

const floatPulse = {
  animate: {
    y: [0, -4, 0],
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" as const },
  },
};

function FogslyRankBanner({ rank, tier = "master", label, compact = false }) {
  const t = useMemo(() => TIERS[tier] ?? TIERS.master, [tier]);
  const textLabel = label || t.name;
  const rankText = `#${rank}`;

  if (compact) {
    return (
      <motion.span
        variants={popIn}
        initial="initial"
        animate="animate"
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${t.glow}`}
        style={{
          backgroundImage: `linear-gradient(90deg, ${t.bg.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ')})`,
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.3)",
          width: "80%"
        }}
      >
        <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold text-white bg-black/30 backdrop-blur-sm animate-pulse`}>{rankText}</span>
        <span className="flex items-center gap-1.5">
          <span className={`opacity-90 animate-spin-slow ${t.text}`}>{t.icon}</span>
          <span className={`tracking-wide drop-shadow-lg ${t.text}`}>{textLabel}</span>
        </span>
      </motion.span>
    );
  }

  return (
    <motion.div
      key={`${tier}-${rank}`}
      variants={popIn}
      initial="initial"
      animate="animate"
      className={`relative w-full max-w-4xl overflow-hidden rounded-3xl ${t.glow}`}
    >
      {/* Outer frame */}
      <div className={`p-[3px] rounded-3xl ${t.frame}`}>
        {/* Banner core */}
        <div className={`relative rounded-3xl p-8 md:p-10 bg-gradient-to-r ${t.bg}`}>
          <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:22px_22px] animate-pulse" />

          <motion.div className="absolute -inset-y-6 w-1/3 skew-x-12 bg-white/40 blur-md" variants={shineVariants} initial="initial" animate="animate" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div variants={floatPulse} animate="animate" className="flex items-center gap-4">
              <div className="relative">
                <div className={`absolute -inset-1 rounded-full blur-xl opacity-70 ${t.accent}`} />
                <div className="relative rounded-full bg-white/20 backdrop-blur-sm border border-white/40 w-20 h-20 flex items-center justify-center">
                  <span className="text-white font-extrabold text-2xl drop-shadow-lg">{rankText}</span>
                </div>
              </div>
              <div className="hidden md:flex items-center text-white font-bold">
                <span className="mr-2 opacity-90 animate-bounce text-white">{t.icon}</span>
                <span className="text-xl md:text-3xl tracking-wide drop-shadow-md text-white">{textLabel}</span>
              </div>
            </motion.div>

            <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} className="flex items-center gap-2">
              <span className="hidden md:inline text-white/90">Tier:</span>
              <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold text-sm md:text-base ${t.text} bg-white/95 shadow-lg`}>
                {tier === "legend" && "Top 5"}
                {tier === "master" && "Top 20"}
                {tier === "vanguard" && "#21 – #100"}
                {tier === "earlybird" && "#101 – #300"}
                {tier === "champion" && "#301 – #1000"}
                {tier === "rookie" && "#1001+"}
              </span>
            </motion.div>
          </div>

          <div className="mt-4 md:hidden text-center text-white font-semibold">
            <span className="inline-flex items-center gap-2 animate-fade-in">
              <span className="opacity-90 text-white">{t.icon}</span>
              <span className="text-white">{textLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- DEMO ----------
export function FogslyRankBannerDemo() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col items-center justify-center gap-12 p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-white/90 tracking-wide animate-pulse">🏆 FOGSLY Rank Banners — All Tiers</h1>

      <div className="flex flex-col gap-10 w-full items-center">
        <FogslyRankBanner rank={3} tier="legend" label="FOGSLY Legend 👑" />
        <FogslyRankBanner rank={7} tier="master" label="FOGSLY Master" />
        <FogslyRankBanner rank={56} tier="vanguard" label="FOGSLY Vanguard ⚡" />
        <FogslyRankBanner rank={245} tier="earlybird" label="#FOGSLYEarlyBird" />
        <FogslyRankBanner rank={678} tier="champion" label="FOGSLY Champion 🏅" />
        <FogslyRankBanner rank={1205} tier="rookie" label="FOGSLY Rookie 🌱" />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-5">
        <span className="text-white/70">Compact Pills:</span>
        <FogslyRankBanner rank={3} tier="legend" label="Legend" compact />
        <FogslyRankBanner rank={7} tier="master" label="Master" compact />
        <FogslyRankBanner rank={56} tier="vanguard" label="Vanguard" compact />
        <FogslyRankBanner rank={245} tier="earlybird" label="EarlyBird" compact />
        <FogslyRankBanner rank={678} tier="champion" label="Champion" compact />
        <FogslyRankBanner rank={1205} tier="rookie" label="Rookie" compact />
      </div>
    </div>
  );
}

export default FogslyRankBanner;