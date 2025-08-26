import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * FOGSLY Rank Banner — Gold, Silver, Bronze + New Tiers
 */

const TIERS = {
  master: {
    name: "FOGSLY Master",
    bg: "from-yellow-600 via-amber-500 to-yellow-700", // gold
    frame: "bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-300",
    glow: "shadow-[0_0_60px_rgba(255,215,0,0.75)]",
    text: "text-yellow-50",
    accent: "bg-yellow-300",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M12 3l2.39 4.84 5.34.78-3.87 3.77.91 5.33L12 15.9l-4.77 2.5.91-5.33L4.27 8.62l5.34-.78L12 3z" />
      </svg>
    ),
  },
  vanguard: {
    name: "FOGSLY Vanguard",
    bg: "from-gray-400 via-gray-300 to-gray-500", // silver
    frame: "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100",
    glow: "shadow-[0_0_60px_rgba(192,192,192,0.75)]",
    text: "text-gray-50",
    accent: "bg-gray-300",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M13 2l-1 9h8l-9 11 1-9H4l9-11z" />
      </svg>
    ),
  },
  earlybird: {
    name: "#FOGSLYEarlyBird",
    bg: "from-orange-900 via-amber-700 to-yellow-800", // bronze/brown
    frame: "bg-gradient-to-r from-amber-200 via-orange-100 to-yellow-200",
    glow: "shadow-[0_0_60px_rgba(205,127,50,0.75)]",
    text: "text-amber-50",
    accent: "bg-orange-300",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M22 12s-4-2-7-2c-3.87 0-7 3.13-7 7 0 0-4-2-6-2 2-3 6-10 13-10 4 0 7 2 7 2l-2 5z" />
      </svg>
    ),
  },
  legend: {
    name: "FOGSLY Legend",
    bg: "from-purple-700 via-violet-600 to-indigo-800", // royal purple
    frame: "bg-gradient-to-r from-purple-200 via-violet-100 to-indigo-200",
    glow: "shadow-[0_0_60px_rgba(138,43,226,0.75)]",
    text: "text-purple-50",
    accent: "bg-purple-400",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7l3-7z" />
      </svg>
    ),
  },
  champion: {
    name: "FOGSLY Champion",
    bg: "from-blue-700 via-sky-600 to-blue-800", // deep blue
    frame: "bg-gradient-to-r from-sky-200 via-blue-100 to-sky-200",
    glow: "shadow-[0_0_60px_rgba(30,144,255,0.75)]",
    text: "text-blue-50",
    accent: "bg-sky-400",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
        <path d="M12 2l4 8h8l-6 6 2 8-8-5-8 5 2-8-6-6h8l4-8z" />
      </svg>
    ),
  },
  rookie: {
    name: "FOGSLY Rookie",
    bg: "from-green-700 via-emerald-600 to-green-800", // green
    frame: "bg-gradient-to-r from-green-200 via-emerald-100 to-green-200",
    glow: "shadow-[0_0_60px_rgba(50,205,50,0.75)]",
    text: "text-green-50",
    accent: "bg-green-400",
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
    transition: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 },
  },
};

const popIn = {
  initial: { scale: 0.6, opacity: 0, rotate: -10 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 280, damping: 20 },
  },
};

const floatPulse = {
  animate: {
    y: [0, -4, 0],
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
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
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${t.text} ${t.glow}`}
        style={{
          backgroundImage: "linear-gradient(90deg, rgb(0 0 0 / 90%), rgb(20 20 20 / 89%))",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(255,255,255,0.2)",
          width: "65%"
        }}
      >
        <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${t.text} ${t.accent} bg-opacity-90 animate-pulse`}>{rankText}</span>
        <span className="flex items-center gap-1.5">
          <span className="opacity-90 animate-spin-slow">{t.icon}</span>
          <span className="tracking-wide drop-shadow-lg">{textLabel}</span>
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
                <div className="relative rounded-full bg-black/30 backdrop-blur-sm border border-white/30 w-20 h-20 flex items-center justify-center">
                  <span className="text-white font-extrabold text-2xl drop-shadow-lg">{rankText}</span>
                </div>
              </div>
              <div className="hidden md:flex items-center text-white font-bold">
                <span className="mr-2 opacity-90 animate-bounce">{t.icon}</span>
                <span className="text-xl md:text-3xl tracking-wide drop-shadow-md">{textLabel}</span>
              </div>
            </motion.div>

            <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} className="flex items-center gap-2">
              <span className="hidden md:inline text-white/80">Tier:</span>
              <span className="inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold text-sm md:text-base text-black bg-white/95 shadow-lg">
                {tier === "master" && "Top 20"}
                {tier === "vanguard" && "#21 – #100"}
                {tier === "earlybird" && "#101 – #300"}
                {tier === "legend" && "Top 5"}
                {tier === "champion" && "#301 – #1000"}
                {tier === "rookie" && "#1001+"}
              </span>
            </motion.div>
          </div>

          <div className="mt-4 md:hidden text-center text-white font-semibold">
            <span className="inline-flex items-center gap-2 animate-fade-in">
              <span className="opacity-90">{t.icon}</span>
              <span>{textLabel}</span>
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