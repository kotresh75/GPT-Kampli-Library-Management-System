import React, { useState, useEffect, useRef, useCallback } from 'react';
import API_BASE from '../../config/apiConfig';

// ─── Thresholds for color-coding ────────────────────────────────────────────
const FPS_GOOD = 50, FPS_WARN = 30;
const CPU_GOOD = 40, CPU_WARN = 70;
const RAM_WARN = 512, RAM_CRIT = 1024; // MB
const PING_GOOD = 50, PING_WARN = 200;

const getColor = (value, good, warn) => {
  if (value <= good) return '#4ade80'; // green
  if (value <= warn) return '#facc15'; // yellow
  return '#f87171'; // red
};

const getColorInverse = (value, good, warn) => {
  if (value >= good) return '#4ade80';
  if (value >= warn) return '#facc15';
  return '#f87171';
};

// ─── Tiny bar component ─────────────────────────────────────────────────────
const MiniBar = ({ percent, color }) => (
  <div style={styles.barTrack}>
    <div style={{ ...styles.barFill, width: `${Math.min(100, Math.max(0, percent))}%`, background: color }} />
  </div>
);

// ─── Metric row ─────────────────────────────────────────────────────────────
const MetricRow = ({ icon, label, value, unit, barPercent, barColor }) => (
  <div style={styles.row}>
    <span style={styles.icon}>{icon}</span>
    <span style={styles.label}>{label}</span>
    <span style={{ ...styles.value, color: barColor }}>{value}<span style={styles.unit}> {unit}</span></span>
    <MiniBar percent={barPercent} color={barColor} />
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// PerformanceWidget — mounts on open, unmounts on close (no background drain)
// ═════════════════════════════════════════════════════════════════════════════
const PerformanceWidget = () => {
  const [fps, setFps] = useState(0);
  const [cpu, setCpu] = useState(null);
  const [ram, setRam] = useState(null);
  const [gpu, setGpu] = useState(null);
  const [ping, setPing] = useState(null);
  const [processCount, setProcessCount] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const rafRef = useRef(null);
  const intervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // ── FPS via requestAnimationFrame ───────────────────────────────────────
  const countFrames = useCallback(() => {
    frameCountRef.current++;
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    if (delta >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / delta));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
    rafRef.current = requestAnimationFrame(countFrames);
  }, []);

  // ── Fetch system metrics + API ping ─────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    // Electron metrics (CPU / RAM / GPU)
    if (window.electron?.getSystemMetrics) {
      try {
        const m = await window.electron.getSystemMetrics();
        setCpu(m.cpuPercent);
        setRam(m.ramMB);
        setGpu(m.gpuMemMB);
        setProcessCount(m.processCount);
      } catch { /* ignore */ }
    }

    // API latency
    try {
      const t0 = performance.now();
      await fetch(`${API_BASE}/api/status`);
      setPing(Math.round(performance.now() - t0));
    } catch {
      setPing(-1);
    }
  }, []);

  // ── Start everything on mount, stop on unmount ──────────────────────────
  useEffect(() => {
    // Start FPS counter
    lastTimeRef.current = performance.now();
    frameCountRef.current = 0;
    rafRef.current = requestAnimationFrame(countFrames);

    // Initial fetch + 1-second interval
    fetchMetrics();
    intervalRef.current = setInterval(fetchMetrics, 1000);

    return () => {
      // Cleanup — stops all polling
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [countFrames, fetchMetrics]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => window.dispatchEvent(new CustomEvent('toggle-perf-widget')), 280);
  };

  // ── Format helpers ──────────────────────────────────────────────────────
  const fpsColor = getColorInverse(fps, FPS_GOOD, FPS_WARN);
  const cpuColor = cpu !== null ? getColor(cpu, CPU_GOOD, CPU_WARN) : '#64748b';
  const ramColor = ram !== null ? getColor(ram, RAM_WARN, RAM_CRIT) : '#64748b';
  const gpuColor = '#60a5fa'; // always calm blue – memory only, no utilization %
  const pingColor = ping !== null && ping >= 0 ? getColor(ping, PING_GOOD, PING_WARN) : '#64748b';

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

  return (
    <div style={{ ...styles.wrapper, animation: isClosing ? 'perfSlideOut 0.28s ease-in forwards' : 'perfSlideIn 0.32s ease-out forwards' }}>
      {/* Injected keyframes */}
      <style>{keyframeCSS}</style>

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerIcon}>⚡</span>
        <span style={styles.headerText}>Performance Monitor</span>
        <button onClick={handleClose} style={styles.closeBtn} title="Close (Alt+G)">✕</button>
      </div>

      {/* Metrics */}
      <div style={styles.body}>
        <MetricRow icon="🎞" label="FPS" value={fps} unit="fps" barPercent={(fps / 60) * 100} barColor={fpsColor} />
        <MetricRow icon="🧠" label="CPU" value={cpu !== null ? cpu : 'N/A'} unit={cpu !== null ? '%' : ''} barPercent={cpu || 0} barColor={cpuColor} />
        <MetricRow icon="💾" label="RAM" value={ram !== null ? ram : 'N/A'} unit={ram !== null ? 'MB' : ''} barPercent={ram ? Math.min((ram / 2048) * 100, 100) : 0} barColor={ramColor} />
        <MetricRow icon="🎮" label="GPU Mem" value={gpu !== null ? gpu : 'N/A'} unit={gpu !== null ? 'MB' : ''} barPercent={gpu ? Math.min((gpu / 1024) * 100, 100) : 0} barColor={gpuColor} />
        <MetricRow icon="📡" label="Ping" value={ping !== null ? (ping >= 0 ? ping : 'Err') : '...'} unit={ping !== null && ping >= 0 ? 'ms' : ''} barPercent={ping && ping >= 0 ? Math.min((ping / 500) * 100, 100) : 0} barColor={pingColor} />
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span>⚙ Processes: {processCount}</span>
        <span>{dateStr} · {timeStr}</span>
      </div>
    </div>
  );
};

// ─── Keyframe animations ────────────────────────────────────────────────────
const keyframeCSS = `
@keyframes perfSlideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes perfSlideOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(20px) scale(0.95); }
}
`;

// ─── Inline styles (glassmorphism, matches existing design system) ───────────
const styles = {
  wrapper: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 10000,
    width: 290,
    borderRadius: 16,
    background: 'rgba(15, 23, 42, 0.78)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
    fontFamily: "var(--font-family-base, 'Outfit', sans-serif)",
    color: '#e2e8f0',
    overflow: 'hidden',
    userSelect: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px 8px',
    borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
  },
  headerIcon: { fontSize: 16 },
  headerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: 14,
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 6,
    transition: 'background 0.15s',
  },
  body: {
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  },
  icon: { fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0 },
  label: { width: 54, color: '#94a3b8', fontSize: 12, fontWeight: 500, flexShrink: 0 },
  value: { width: 62, textAlign: 'right', fontWeight: 700, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 13, flexShrink: 0 },
  unit: { fontWeight: 400, fontSize: 11, opacity: 0.6 },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: 'rgba(148, 163, 184, 0.12)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.35s ease, background 0.35s ease',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '7px 14px 9px',
    borderTop: '1px solid rgba(148, 163, 184, 0.12)',
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 0.3,
  },
};

export default PerformanceWidget;
