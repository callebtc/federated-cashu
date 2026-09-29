import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  type SlideTransition,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import {
  type Context,
  type CSSProperties,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

// ─── Design ──────────────────────────────────────────────────────────────────

export const design: DesignSystem = {
  palette: { bg: '#faf9f5', text: '#141413', accent: '#d97757' },
  fonts: {
    display: '"Tiempos Headline", "Copernicus", ui-serif, "New York", "Iowan Old Style", Georgia, serif',
    body: '"Styrene B", "Söhne", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
  },
  typeScale: { hero: 128, body: 30 },
  radius: 12,
};

const c = {
  ink: '#141413',
  muted: '#5e5d59',
  dim: '#9a988f',
  line: '#cfccc1',
  rule: '#e3e0d6',
  panel: '#f0eee6',
  card: '#ffffff',
  node: '#a8a59a',
  claySoft: 'rgba(217, 119, 87, 0.12)',
  clayHex: '#d97757',
  cool: '#4a7fb4',
  coolSoft: 'rgba(74, 127, 180, 0.10)',
  good: '#5f8238',
  goodSoft: 'rgba(95, 130, 56, 0.10)',
  bad: '#b4473d',
  badSoft: 'rgba(180, 71, 61, 0.08)',
  violet: '#7a5fa6',
};
const ACCENT = 'var(--osd-accent)';
const SERIF = 'var(--osd-font-display)';
const SANS = 'var(--osd-font-body)';
const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';
const MATH = '"STIX Two Text", "STIXGeneral", "Iowan Old Style", Georgia, serif';

// Emil Kowalski's easing vocabulary.
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EASE_IO = 'cubic-bezier(0.77, 0, 0.175, 1)';

const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STYLE_ID = 'osd-styles-federated-cashu';
const css = `
@keyframes fc-travel {
  0%   { transform: translate(0px, 0px); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
@keyframes fc-cycle {
  0%   { transform: translate(0px, 0px); opacity: 0; }
  6%   { opacity: 1; }
  38%  { transform: translate(var(--dx), var(--dy)); opacity: 1; }
  44%  { transform: translate(var(--dx), var(--dy)); opacity: 0; }
  100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
}
@keyframes fc-glow {
  0%, 36%  { opacity: 0.25; }
  48%      { opacity: 1; }
  80%,100% { opacity: 0.25; }
}
@keyframes fc-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0px); }
}
@keyframes fc-flow { to { stroke-dashoffset: -40; } }
`;
if (typeof document !== 'undefined') {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

// ─── Beats and processes ─────────────────────────────────────────────────────
// useBeats registers with open-slide's step host (the mechanism behind <Steps>)
// and returns an integer, so a figure can move between states on → / ←.
// Steps advance in play mode; the editor and thumbnails show the final state.
// useProcess adds a loop: press R (or the footer button) to cycle the steps.

type StepRegistration = {
  id: object;
  stepCount: number;
  initialRevealed: number;
  controller: { advance: () => boolean; retreat: () => boolean };
  setRevealed: (n: number) => void;
};
type StepHost = {
  register: (reg: StepRegistration) => () => void;
  reportRevealed: (id: object, revealed: number) => void;
  entryDirection: 'forward' | 'backward' | 'jump';
  controlled: boolean;
  isActivePage: boolean;
} | null;

const HOST_KEY = '__open_slide_step_host_context__';
const fallbackHost = createContext<StepHost>(null);
// Resolved at render time: the runtime may create the shared context after this module loads.
const hostContext = (): Context<StepHost> =>
  ((globalThis as Record<string, unknown>)[HOST_KEY] as Context<StepHost> | undefined) ?? fallbackHost;

function useBeats(count: number): number {
  const host = useContext(hostContext());
  const initial = host?.controlled ? 0 : host?.entryDirection === 'forward' ? 0 : count;
  const ref = useRef(initial);
  const [beat, setBeat] = useState(initial);
  const id = useRef<object>({});
  useLayoutEffect(() => {
    if (!host) return;
    const apply = (n: number) => {
      ref.current = n;
      setBeat(n);
    };
    return host.register({
      id: id.current,
      stepCount: count,
      initialRevealed: ref.current,
      controller: {
        advance: () => {
          if (ref.current >= count) return false;
          apply(ref.current + 1);
          host.reportRevealed(id.current, ref.current);
          return true;
        },
        retreat: () => {
          if (ref.current <= 0) return false;
          apply(ref.current - 1);
          host.reportRevealed(id.current, ref.current);
          return true;
        },
      },
      setRevealed: apply,
    });
  }, [host, count]);
  return host ? beat : count;
}

type Proc = {
  step: number;
  count: number;
  looping: boolean;
  toggle: () => void;
  /** true when one-shot motion (packets) should play */
  anim: boolean;
};

function useProcess(count: number, stepMs = 1800): Proc {
  const beat = useBeats(count);
  const live = useIsActivePage();
  const [looping, setLooping] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const toggle = useCallback(() => setLooping((v) => !v), []);

  const lastBeat = useRef(beat);
  useEffect(() => {
    if (lastBeat.current === beat) return;
    lastBeat.current = beat;
    setLooping(false);
  }, [beat]);

  useEffect(() => {
    if (!looping) return;
    let n = 0;
    setLoopStep(0);
    let t = 0;
    const tick = () => {
      n = n >= count ? 0 : n + 1;
      setLoopStep(n);
      t = window.setTimeout(tick, n === count ? stepMs * 1.6 : n === 0 ? 900 : stepMs);
    };
    t = window.setTimeout(tick, 900);
    return () => window.clearTimeout(t);
  }, [looping, count, stepMs]);

  useEffect(() => {
    if (!live) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'r' || e.key === 'R') setLooping((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [live]);

  return {
    step: looping ? loopStep : beat,
    count,
    looping,
    toggle,
    anim: !REDUCED && (live || looping),
  };
}

/** false on the first frame of the live page, then true: drives entrance staggers. */
function useEntered(): boolean {
  const live = useIsActivePage();
  const [on, setOn] = useState(!live || REDUCED);
  useEffect(() => {
    if (!live || REDUCED) {
      setOn(true);
      return;
    }
    let b = 0;
    const a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [live]);
  return on;
}

function useSha256(input: string): string {
  const [hex, setHex] = useState('');
  useEffect(() => {
    let alive = true;
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)).then((buf) => {
      if (!alive) return;
      setHex(Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join(''));
    });
    return () => {
      alive = false;
    };
  }, [input]);
  return hex;
}

// ─── Chrome ──────────────────────────────────────────────────────────────────

const pageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: SANS,
  padding: '88px 120px 0',
  boxSizing: 'border-box',
};

const Eyebrow = ({ n, children }: { n?: string; children: ReactNode }) => (
  <div style={{ fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.muted }}>
    {n && <span style={{ color: ACCENT, marginRight: 14 }}>{n}</span>}
    {children}
  </div>
);

const Heading = ({ children }: { children: ReactNode }) => (
  <h2
    style={{
      fontFamily: SERIF,
      fontSize: 56,
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.15,
      margin: '14px 0 0',
    }}
  >
    {children}
  </h2>
);

const ProcControls = ({ proc }: { proc: Proc }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
    <span style={{ display: 'flex', gap: 8 }}>
      {Array.from({ length: proc.count }, (_, i) => (
        <span
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: 5,
            background: i < proc.step ? ACCENT : c.rule,
            transition: `background 300ms ${EASE_OUT}`,
          }}
        />
      ))}
    </span>
    <span
      role="button"
      tabIndex={-1}
      data-osd-interactive
      onClick={(e) => {
        e.stopPropagation();
        proc.toggle();
      }}
      style={{
        fontFamily: SANS,
        fontSize: 20,
        color: proc.looping ? ACCENT : c.muted,
        background: proc.looping ? c.claySoft : 'transparent',
        border: `1.5px solid ${proc.looping ? c.clayHex : c.rule}`,
        borderRadius: 999,
        padding: '3px 16px',
        cursor: 'pointer',
        transition: `all 200ms ${EASE_OUT}`,
      }}
    >
      {proc.looping ? 'stop loop' : 'loop (R)'}
    </span>
  </span>
);

const Footer = ({ proc }: { proc?: Proc }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 34,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 22,
        color: c.dim,
      }}
    >
      <span>Federated Cashu · btc++ payments Berlin 2026</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {proc && <ProcControls proc={proc} />}
        <span style={{ fontFamily: MONO, fontSize: 20 }}>
          {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </span>
    </div>
  );
};

const Shell = ({
  n,
  eyebrow,
  title,
  proc,
  children,
}: {
  n?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  proc?: Proc;
  children?: ReactNode;
}) => (
  <div style={pageStyle}>
    {eyebrow && <Eyebrow n={n}>{eyebrow}</Eyebrow>}
    {title && <Heading>{title}</Heading>}
    {children}
    <Footer proc={proc} />
  </div>
);

/** Full-canvas SVG layer in absolute 1920×1080 coordinates. */
const Canvas = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 1920 1080"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
  >
    {children}
  </svg>
);

const Fade = ({
  show,
  children,
  delay = 0,
  y = 8,
  dur = 500,
  dimTo = 0,
  style,
}: {
  show: boolean;
  children: ReactNode;
  delay?: number;
  y?: number;
  dur?: number;
  dimTo?: number;
  style?: CSSProperties;
}) => (
  <div
    style={{
      opacity: show ? 1 : dimTo,
      transform: show || REDUCED || dimTo > 0 ? 'translateY(0px)' : `translateY(${y}px)`,
      transition: `opacity ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms, transform ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms`,
      ...style,
    }}
  >
    {children}
  </div>
);

const GFade = ({
  show,
  children,
  delay = 0,
  dur = 500,
  to = 1,
}: {
  show: boolean;
  children: ReactNode;
  delay?: number;
  dur?: number;
  to?: number;
}) => (
  <g style={{ opacity: show ? to : 0, transition: `opacity ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms` }}>
    {children}
  </g>
);

const At = ({
  x,
  y,
  w,
  children,
  style,
}: {
  x: number;
  y: number;
  w?: number;
  children: ReactNode;
  style?: CSSProperties;
}) => <div style={{ position: 'absolute', left: x, top: y, width: w, ...style }}>{children}</div>;

const M = ({ children, size, color }: { children: ReactNode; size?: number; color?: string }) => (
  <span
    style={{
      fontFamily: MATH,
      fontStyle: 'italic',
      fontSize: size,
      color,
      whiteSpace: 'nowrap',
      transition: `color 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </span>
);
const Up = ({ children }: { children: ReactNode }) => <span style={{ fontStyle: 'normal' }}>{children}</span>;
const Hi = ({ children, color = ACCENT }: { children: ReactNode; color?: string }) => (
  <span style={{ color }}>{children}</span>
);
const Code = ({ children, color }: { children: ReactNode; color?: string }) => (
  <span style={{ fontFamily: MONO, fontSize: '0.86em', color }}>{children}</span>
);

const Note = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ fontSize: 24, color: c.muted, lineHeight: 1.45, ...style }}>{children}</div>
);

const Label = ({ children, color = c.muted }: { children: ReactNode; color?: string }) => (
  <div style={{ fontSize: 20, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>{children}</div>
);

// Step list: the right-hand column on process pages.
const StepList = ({ children, x = 1380, y = 256, w = 420 }: { children: ReactNode; x?: number; y?: number; w?: number }) => (
  <At x={x} y={y} w={w}>
    {children}
  </At>
);

const StepItem = ({ n, step, children }: { n: number; step: number; children: ReactNode }) => {
  const on = step === n;
  const done = step > n;
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        padding: '6px 0 6px 18px',
        marginBottom: 14,
        borderLeft: `3px solid ${on ? c.clayHex : 'transparent'}`,
        color: on ? c.ink : done ? c.muted : c.dim,
        transition: `color 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 22,
          minWidth: 24,
          paddingTop: 5,
          color: on ? ACCENT : 'inherit',
          transition: `color 300ms ${EASE_OUT}`,
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 28, lineHeight: 1.3 }}>{children}</span>
    </div>
  );
};

// ─── SVG primitives ──────────────────────────────────────────────────────────

type Tone = 'idle' | 'on' | 'bad' | 'off' | 'good' | 'cool';
const toneStroke: Record<Tone, string> = {
  idle: c.node,
  on: c.clayHex,
  bad: c.bad,
  off: c.line,
  good: c.good,
  cool: c.cool,
};

const Member = ({
  x,
  y,
  label,
  r = 40,
  tone = 'idle',
}: {
  x: number;
  y: number;
  label: string;
  r?: number;
  tone?: Tone;
}) => (
  <g>
    <circle
      cx={x}
      cy={y}
      r={r}
      style={{
        fill: c.card,
        stroke: toneStroke[tone],
        strokeWidth: tone === 'idle' || tone === 'off' ? 1.75 : 2.5,
        strokeDasharray: tone === 'off' ? '5 5' : 'none',
        transition: `stroke 300ms ${EASE_OUT}`,
      }}
    />
    <text
      x={x}
      y={y + 8}
      textAnchor="middle"
      style={{
        fontFamily: MONO,
        fontSize: 22,
        fill: tone === 'off' ? c.dim : tone === 'bad' ? c.bad : c.ink,
        transition: `fill 300ms ${EASE_OUT}`,
      }}
    >
      {label}
    </text>
  </g>
);

const WalletNode = ({ x, y, r = 52 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} style={{ fill: c.card, stroke: c.cool, strokeWidth: 2.5 }} />
    <text x={x} y={y + 8} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 22, fill: c.cool }}>
      wallet
    </text>
  </g>
);

const Line = ({
  x1,
  y1,
  x2,
  y2,
  color = c.line,
  width = 1.5,
  dash,
  opacity = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  width?: number;
  dash?: string;
  opacity?: number;
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    style={{
      stroke: color,
      strokeWidth: width,
      strokeDasharray: dash ?? 'none',
      opacity,
      transition: `opacity 500ms ${EASE_OUT}, stroke 300ms ${EASE_OUT}`,
    }}
  />
);

/** A line that draws itself when `show` turns on. */
const Draw = ({
  x1,
  y1,
  x2,
  y2,
  show,
  color = c.clayHex,
  width = 3,
  delay = 0,
  dur = 900,
  opacity = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  show: boolean;
  color?: string;
  width?: number;
  delay?: number;
  dur?: number;
  opacity?: number;
}) => {
  const len = Math.ceil(Math.hypot(x2 - x1, y2 - y1)) + 2;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      style={{
        stroke: color,
        strokeWidth: width,
        strokeLinecap: 'round',
        strokeDasharray: len,
        strokeDashoffset: show ? 0 : len,
        opacity,
        transition: `stroke-dashoffset ${REDUCED ? 0 : dur}ms ${EASE_IO} ${show ? delay : 0}ms, opacity 500ms ${EASE_OUT}, stroke 300ms ${EASE_OUT}`,
      }}
    />
  );
};

type LabelFont = 'math' | 'mono' | 'sans';
const fontOf = (f: LabelFont): CSSProperties =>
  f === 'math'
    ? { fontFamily: MATH, fontStyle: 'italic', fontSize: 36 }
    : f === 'mono'
      ? { fontFamily: MONO, fontSize: 21 }
      : { fontFamily: SANS, fontSize: 22 };

const Arrow = ({
  x1,
  y1,
  x2,
  y2,
  show = true,
  color = c.muted,
  label,
  labelColor,
  labelDy = -14,
  font = 'math',
  delay = 0,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  show?: boolean;
  color?: string;
  label?: ReactNode;
  labelColor?: string;
  labelDy?: number;
  font?: LabelFont;
  delay?: number;
  dashed?: boolean;
}) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const s = 13;
  const p1 = `${x2 - s * Math.cos(a - 0.45)},${y2 - s * Math.sin(a - 0.45)}`;
  const p2 = `${x2 - s * Math.cos(a + 0.45)},${y2 - s * Math.sin(a + 0.45)}`;
  return (
    <g>
      {dashed ? (
        <GFade show={show} delay={delay}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: color, strokeWidth: 2, strokeDasharray: '6 6' }} />
        </GFade>
      ) : (
        <Draw x1={x1} y1={y1} x2={x2} y2={y2} show={show} color={color} width={2} delay={delay} dur={700} />
      )}
      <polyline
        points={`${p1} ${x2},${y2} ${p2}`}
        style={{
          fill: 'none',
          stroke: color,
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          opacity: show ? 1 : 0,
          transition: `opacity 200ms ${EASE_OUT} ${show ? delay + 550 : 0}ms`,
        }}
      />
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 + labelDy}
          textAnchor="middle"
          style={{
            ...fontOf(font),
            fill: labelColor ?? color,
            opacity: show ? 1 : 0,
            transition: `opacity 400ms ${EASE_OUT} ${show ? delay + 250 : 0}ms`,
          }}
        >
          {label}
        </text>
      )}
    </g>
  );
};

/** A dot that travels once from (x1,y1) to (x2,y2). */
const Packet = ({
  x1,
  y1,
  x2,
  y2,
  run,
  color = c.cool,
  delay = 0,
  dur = 900,
  r = 8,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  run: boolean;
  color?: string;
  delay?: number;
  dur?: number;
  r?: number;
}) => {
  if (!run) return null;
  return (
    <circle
      cx={x1}
      cy={y1}
      r={r}
      style={
        {
          fill: color,
          '--dx': `${x2 - x1}px`,
          '--dy': `${y2 - y1}px`,
          animation: `fc-travel ${dur}ms ${EASE_IO} ${delay}ms both`,
        } as CSSProperties
      }
    />
  );
};

const Dot = ({
  x,
  y,
  r = 9,
  color = c.clayHex,
  show = true,
  delay = 0,
  ring = false,
}: {
  x: number;
  y: number;
  r?: number;
  color?: string;
  show?: boolean;
  delay?: number;
  ring?: boolean;
}) => (
  <g style={{ opacity: show ? 1 : 0, transition: `opacity 400ms ${EASE_OUT} ${show ? delay : 0}ms` }}>
    <circle cx={x} cy={y} r={r} style={{ fill: color, transition: `fill 300ms ${EASE_OUT}` }} />
    <circle
      cx={x}
      cy={y}
      r={r + 10}
      style={{
        fill: 'none',
        stroke: color,
        strokeWidth: 1.5,
        opacity: ring ? 0.7 : 0,
        transition: `opacity 300ms ${EASE_OUT}`,
      }}
    />
  </g>
);

const T = ({
  x,
  y,
  children,
  size = 30,
  color = c.ink,
  anchor = 'middle',
  font = 'sans',
  show = true,
  delay = 0,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  font?: LabelFont;
  show?: boolean;
  delay?: number;
}) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    style={{
      ...fontOf(font),
      fontSize: size,
      fill: color,
      opacity: show ? 1 : 0,
      transition: `opacity 400ms ${EASE_OUT} ${show ? delay : 0}ms, fill 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </text>
);

/** Consensus/broadcast band in sequence diagrams. */
const Band = ({
  x1,
  x2,
  y,
  label,
  show,
  tone = 'neutral',
}: {
  x1: number;
  x2: number;
  y: number;
  label: ReactNode;
  show: boolean;
  tone?: 'neutral' | 'clay' | 'cool';
}) => (
  <GFade show={show}>
    <rect
      x={x1}
      y={y - 22}
      width={x2 - x1}
      height={44}
      rx={8}
      style={{
        fill: tone === 'clay' ? c.claySoft : tone === 'cool' ? c.coolSoft : c.panel,
        stroke: tone === 'clay' ? c.clayHex : tone === 'cool' ? c.cool : c.rule,
        strokeWidth: 1.5,
      }}
    />
    <text x={(x1 + x2) / 2} y={y + 8} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 22, fill: c.ink }}>
      {label}
    </text>
  </GFade>
);

const Lifeline = ({
  x,
  label,
  top = 272,
  bottom = 912,
  color = c.ink,
}: {
  x: number;
  label: string;
  top?: number;
  bottom?: number;
  color?: string;
}) => (
  <g>
    <text x={x} y={top - 16} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 24, fill: color }}>
      {label}
    </text>
    <line x1={x} y1={top} x2={x} y2={bottom} style={{ stroke: c.line, strokeWidth: 1.5, strokeDasharray: '4 6' }} />
  </g>
);

// ─── Transitions ─────────────────────────────────────────────────────────────

const HOLD: Keyframe[] = [{ opacity: 1 }, { opacity: 1 }];
export const transition: SlideTransition = {
  duration: 240,
  exit: { duration: 240, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: HOLD },
  enter: {
    duration: 240,
    easing: EASE_OUT,
    keyframes: [
      { opacity: 0, transform: 'translateY(4px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

const ring = (cx: number, cy: number, r: number, i: number, n = 5) => {
  const a = ((-90 + (360 / n) * i) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

// ═════════════════════════════════════════════════════════════════════════════
// Opening
// ═════════════════════════════════════════════════════════════════════════════

const CoverFigure = () => {
  const live = useIsActivePage() && !REDUCED;
  const cx = 1440;
  const cy = 560;
  const pts = [0, 1, 2, 3, 4].map((i) => ring(cx, cy, 230, i));
  const signers = [0, 2, 3];
  return (
    <Canvas>
      {pts.map((p, i) => (
        <line key={`l${i}`} x1={p.x} y1={p.y} x2={cx} y2={cy} style={{ stroke: c.rule, strokeWidth: 1.5 }} />
      ))}
      <circle
        cx={cx}
        cy={cy}
        r={56}
        style={{
          fill: c.claySoft,
          stroke: c.clayHex,
          strokeWidth: 2,
          animation: live ? `fc-glow 4000ms ${EASE_IO} infinite` : 'none',
        }}
      />
      <T x={cx} y={cy + 14} size={44} font="math">
        C′
      </T>
      {signers.map((i, k) => (
        <circle
          key={`p${i}`}
          cx={pts[i].x}
          cy={pts[i].y}
          r={8}
          style={
            {
              fill: c.clayHex,
              opacity: 0,
              '--dx': `${cx - pts[i].x}px`,
              '--dy': `${cy - pts[i].y}px`,
              animation: live ? `fc-cycle 4000ms ${EASE_IO} ${k * 60}ms infinite` : 'none',
            } as CSSProperties
          }
        />
      ))}
      {pts.map((p, i) => (
        <Member key={`m${i}`} x={p.x} y={p.y} r={40} label={`m${i + 1}`} tone={signers.includes(i) ? 'on' : 'idle'} />
      ))}
    </Canvas>
  );
};

const Cover: Page = () => (
  <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <CoverFigure />
    <div style={{ position: 'relative', maxWidth: 1000 }}>
      <Eyebrow>btc++ payments · Berlin · 2026-10-01</Eyebrow>
      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 'var(--osd-size-hero)',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          margin: '32px 0 36px',
        }}
      >
        Federated Cashu
      </h1>
      <div style={{ fontSize: 40, color: c.muted, lineHeight: 1.4 }}>Federations and nutroot</div>
      <div style={{ fontFamily: MONO, fontSize: 26, color: c.dim, marginTop: 64 }}>calle · github.com/cashubtc/cdk</div>
    </div>
  </div>
);

type SectionRef = { ch: 1 | 2; i: number };
const SECTION_TITLES: Record<string, string> = {
  '1.0': 'BLS blind signatures',
  '1.1': 'Threshold issuance',
  '1.2': 'Ordering',
  '1.3': 'Keys and membership',
  '1.4': 'Custody',
  '1.5': 'Client intent',
  '2.0': 'Spending conditions today',
  '2.1': 'Taproot',
  '2.2': 'Nutroot secrets',
  '2.3': 'Using nutroot',
};

const OUTLINE_TOP = 382;
const OUTLINE_ROW = 70;
const OUTLINE_COL = [120, 1000];

const OutlineRow = ({ n, title, state }: { n: string; title: string; topics?: string; state: 'on' | 'off' | 'all' }) => (
  <div
    style={{
      height: OUTLINE_ROW,
      display: 'flex',
      alignItems: 'baseline',
      color: state === 'off' ? c.dim : c.ink,
      transition: `color 400ms ${EASE_OUT}`,
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 24,
        width: 76,
        color: state === 'off' ? c.dim : ACCENT,
        transition: `color 400ms ${EASE_OUT}`,
      }}
    >
      {n}
    </span>
    <span style={{ fontFamily: SERIF, fontSize: 40 }}>{title}</span>
  </div>
);

const ChapterHead = ({ n, title, dim }: { n: number; title: string; dim: boolean }) => (
  <div style={{ height: 124, color: dim ? c.dim : c.ink, transition: `color 400ms ${EASE_OUT}` }}>
    <Label color={dim ? c.dim : c.clayHex}>Part {n}</Label>
    <div style={{ fontFamily: SERIF, fontSize: 52, marginTop: 6 }}>{title}</div>
  </div>
);

const Outline = ({ active }: { active?: SectionRef }) => {
  const entered = useEntered();
  const at: SectionRef | undefined =
    active === undefined ? undefined : entered ? active : { ch: active.ch, i: Math.max(active.i - 1, 0) };
  const st = (ch: 1 | 2, i: number): 'on' | 'off' | 'all' =>
    at === undefined ? 'all' : at.ch === ch && at.i === i ? 'on' : 'off';
  const key = active ? `${active.ch}.${active.i}` : '';
  return (
    <Shell
      eyebrow={active === undefined ? 'Federated Cashu' : 'Outline'}
      title={active === undefined ? 'Outline' : `${active.ch}.${active.i + 1} · ${SECTION_TITLES[key]}`}
    >
      {at !== undefined && (
        <div
          style={{
            position: 'absolute',
            left: OUTLINE_COL[at.ch - 1] - 24,
            top: OUTLINE_TOP + at.i * OUTLINE_ROW + 10,
            width: 4,
            height: 46,
            borderRadius: 2,
            background: ACCENT,
            transition: `top 600ms ${EASE_IO}, left 600ms ${EASE_IO}`,
          }}
        />
      )}
      <At x={OUTLINE_COL[0]} y={258} w={840}>
        <ChapterHead n={1} title="Federations" dim={at !== undefined && at.ch !== 1} />
        <OutlineRow n="1.1" title="BLS blind signatures" state={st(1, 0)} />
        <OutlineRow n="1.2" title="Threshold issuance" state={st(1, 1)} />
        <OutlineRow n="1.3" title="Ordering" state={st(1, 2)} />
        <OutlineRow n="1.4" title="Keys and membership" state={st(1, 3)} />
        <OutlineRow n="1.5" title="Custody" state={st(1, 4)} />
        <OutlineRow n="1.6" title="Client intent" state={st(1, 5)} />
      </At>
      <At x={OUTLINE_COL[1]} y={258} w={800}>
        <ChapterHead n={2} title="Nutroot" dim={at !== undefined && at.ch !== 2} />
        <OutlineRow n="2.1" title="Spending conditions today" state={st(2, 0)} />
        <OutlineRow n="2.2" title="Taproot" state={st(2, 1)} />
        <OutlineRow n="2.3" title="Nutroot secrets" state={st(2, 2)} />
        <OutlineRow n="2.4" title="Using nutroot" state={st(2, 3)} />
      </At>
    </Shell>
  );
};

const OutlineAll: Page = () => <Outline />;
const Section1: Page = () => <Outline active={{ ch: 1, i: 0 }} />;
const Section2: Page = () => <Outline active={{ ch: 1, i: 1 }} />;
const Section3: Page = () => <Outline active={{ ch: 1, i: 2 }} />;
const Section4: Page = () => <Outline active={{ ch: 1, i: 3 }} />;
const Section5: Page = () => <Outline active={{ ch: 1, i: 4 }} />;
const Section6: Page = () => <Outline active={{ ch: 1, i: 5 }} />;
const SectionN1: Page = () => <Outline active={{ ch: 2, i: 0 }} />;
const SectionN2: Page = () => <Outline active={{ ch: 2, i: 1 }} />;
const SectionN3: Page = () => <Outline active={{ ch: 2, i: 2 }} />;
const SectionN4: Page = () => <Outline active={{ ch: 2, i: 3 }} />;

const ChapterTitle = ({ n, title, sub }: { n: number; title: string; sub: ReactNode }) => {
  const on = useEntered();
  return (
    <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Fade show={on}>
        <Label color={c.clayHex}>Part {n}</Label>
      </Fade>
      <Fade show={on} delay={60}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 'var(--osd-size-hero)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            margin: '24px 0 32px',
          }}
        >
          {title}
        </div>
      </Fade>
      <Fade show={on} delay={120}>
        <div style={{ fontSize: 40, color: c.muted, lineHeight: 1.4 }}>{sub}</div>
      </Fade>
      <Footer />
    </div>
  );
};

const Chapter1: Page = () => <ChapterTitle n={1} title="Federations" sub="One Cashu mint, run by n members." />;
const Chapter2: Page = () => (
  <ChapterTitle n={2} title="Nutroot" sub="Conditional payments for Cashu v3, built like taproot." />
);

const Fact = ({ k, children }: { k: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 20, padding: '14px 0', borderBottom: `1px solid ${c.rule}` }}>
    <span style={{ width: 130, flexShrink: 0 }}>{k}</span>
    <span style={{ fontSize: 24, color: c.muted, lineHeight: 1.4 }}>{children}</span>
  </div>
);

const FedRow = ({ k, show, delay = 0, children }: { k: ReactNode; show: boolean; delay?: number; children: ReactNode }) => (
  <Fade show={show} delay={delay}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, padding: '18px 0', borderBottom: `1px solid ${c.rule}` }}>
      <span style={{ width: 290, flexShrink: 0 }}>{k}</span>
      <span style={{ fontSize: 30 }}>{children}</span>
    </div>
  </Fade>
);

const Model: Page = () => {
  const proc = useProcess(2);
  const s = proc.step;
  const cx = 660;
  const cy = 590;
  const w1 = { x: 180, y: 380 };
  const w2 = { x: 180, y: 800 };
  const pairs: [number, number][] = [];
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) pairs.push([i, j]);
  return (
    <Shell eyebrow="Setting" title="What is a federation" proc={proc}>
      <Canvas>
        {pairs.map(([i, j]) => {
          const a = ring(cx, cy, 230, i);
          const b = ring(cx, cy, 230, j);
          return (
            <GFade key={`e${i}${j}`} show={s >= 1} delay={500}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: c.rule, strokeWidth: 1.5 }} />
            </GFade>
          );
        })}
        {[0, 1, 2, 3, 4].map((i) => {
          const p = ring(cx, cy, 230, i);
          return (
            <g key={`w${i}`}>
              <GFade show={s >= 2} delay={i * 40}>
                <line x1={w1.x} y1={w1.y} x2={p.x} y2={p.y} style={{ stroke: c.cool, strokeWidth: 1.5, opacity: 0.45 }} />
                <line x1={w2.x} y1={w2.y} x2={p.x} y2={p.y} style={{ stroke: c.cool, strokeWidth: 1.5, opacity: 0.45 }} />
              </GFade>
              <Packet x1={w1.x} y1={w1.y} x2={p.x} y2={p.y} run={proc.anim && s === 2} delay={300 + i * 50} />
            </g>
          );
        })}
        <g
          style={{
            opacity: s >= 1 ? 0 : 1,
            transform: s >= 1 ? 'scale(0.96)' : 'scale(1)',
            transformOrigin: `${cx}px ${cy}px`,
            transition: `opacity 400ms ${EASE_OUT}, transform 400ms ${EASE_OUT}`,
          }}
        >
          <rect x={cx - 140} y={cy - 80} width={280} height={160} rx={14} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.75 }} />
          <T x={cx} y={cy - 14} size={30}>
            mint
          </T>
          <T x={cx} y={cy + 34} size={24} color={c.muted}>
            one key, one operator
          </T>
        </g>
        {[0, 1, 2, 3, 4].map((i) => {
          const p = ring(cx, cy, 230, i);
          return (
            <g
              key={`m${i}`}
              style={{
                opacity: s >= 1 ? 1 : 0,
                transform: s >= 1 ? `translate(${p.x - cx}px, ${p.y - cy}px)` : 'translate(0px, 0px) scale(0.96)',
                transformOrigin: `${cx}px ${cy}px`,
                transition: `transform 800ms ${EASE_IO} ${i * 40}ms, opacity 400ms ${EASE_OUT} ${i * 40}ms`,
              }}
            >
              <Member x={cx} y={cy} r={46} label={`m${i + 1}`} />
            </g>
          );
        })}
        <GFade show={s >= 2}>
          <WalletNode x={w1.x} y={w1.y} r={46} />
          <WalletNode x={w2.x} y={w2.y} r={46} />
        </GFade>
      </Canvas>
      <At x={1180} y={300} w={640}>
        <FedRow k={<M size={40}>n</M>} show={s >= 1}>
          members instead of one mint
        </FedRow>
        <FedRow k={<M size={40}>t</M>} show={s >= 1} delay={60}>
          members sign each token
        </FedRow>
        <FedRow k={<M size={40}>c = n − f</M>} show={s >= 1} delay={120}>
          order every operation
        </FedRow>
        <FedRow k={<M size={40}>f = ⌊(n − 1)/3⌋</M>} show={s >= 1} delay={180}>
          may fail or lie
        </FedRow>
        <FedRow k={<span style={{ fontSize: 30, color: c.cool }}>wallets</span>} show={s >= 2}>
          talk to every member
        </FedRow>
      </At>
    </Shell>
  );
};

const PartCard = ({ show, label, title, lines, tone }: { show: boolean; label: string; title: string; lines: ReactNode[]; tone: string }) => (
  <Fade show={show} dimTo={0.25}>
    <div
      style={{
        width: 780,
        height: 420,
        boxSizing: 'border-box',
        border: `1.75px solid ${tone}`,
        background: c.card,
        borderRadius: 'var(--osd-radius)',
        padding: '36px 44px',
      }}
    >
      <Label color={tone}>{label}</Label>
      <div style={{ fontFamily: SERIF, fontSize: 56, marginTop: 14 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontSize: 32, color: c.muted, marginTop: i === 0 ? 40 : 16 }}>
          {l}
        </div>
      ))}
    </div>
  </Fade>
);

const FedParts: Page = () => {
  const proc = useProcess(2, 2200);
  const s = proc.step;
  return (
    <Shell eyebrow="Setting" title="Two parts of a federation" proc={proc}>
      <div style={{ display: 'flex', gap: 40, marginTop: 70 }}>
        <PartCard
          show={s >= 1}
          label="Cryptography"
          title="Threshold signatures"
          tone={c.clayHex}
          lines={[
            <>
              any <M>t</M> of <M>n</M> members sign
            </>,
            'no member holds the key',
          ]}
        />
        <PartCard
          show={s >= 2}
          label="Consensus"
          title="Shared state"
          tone={c.violet}
          lines={['payments observed by a quorum', 'same rules, same order, every member']}
        />
      </div>
    </Shell>
  );
};

const Paper: Page = () => (
  <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <div style={{ marginTop: 40 }}>
      <Label>btc++ payments · Berlin · 2026-10-01</Label>
    </div>
    <div style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 500, lineHeight: 1.15, maxWidth: 1400, marginTop: 44 }}>
      Federated Cashu: Threshold Blind Signatures with Consensus-Ordered Issuance
    </div>
    <div style={{ fontFamily: SERIF, fontSize: 36, marginTop: 48, display: 'flex', gap: 80 }}>
      <span>Calle</span>
      <span>Sol</span>
      <span>Astra</span>
    </div>
    <div style={{ fontSize: 24, color: c.muted, marginTop: 10, display: 'flex', gap: 80 }}>
      <span>Cashu</span>
      <span>OpenAI</span>
      <span>OpenAI</span>
    </div>
    <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, marginTop: 64 }}>Abstract</div>
    <div
      style={{
        fontFamily: SERIF,
        fontSize: 28,
        lineHeight: 1.5,
        maxWidth: 1240,
        marginTop: 16,
        textAlign: 'justify',
        hyphens: 'auto',
      }}
    >
      We describe a Cashu mint operated by a federation of n members. Any t members issue a BLS blind signature that
      verifies under one aggregate key. Members order every operation through consensus before they sign. The reserves
      are held under a FROST threshold key by the same members. In v3, every input signs the whole transaction.
    </div>
    <Footer />
  </div>
);

const BigStat = ({ show, delay, value, label }: { show: boolean; delay: number; value: string; label: ReactNode }) => (
  <Fade show={show} delay={delay}>
    <div style={{ width: 500 }}>
      <div style={{ fontFamily: SERIF, fontSize: 104, lineHeight: 1.05 }}>{value}</div>
      <div style={{ fontSize: 32, color: c.muted, marginTop: 14 }}>{label}</div>
    </div>
  </Fade>
);

const DAY = 64;

const Built: Page = () => {
  const proc = useProcess(5, 1800);
  const s = proc.step;
  const D0 = 780;
  const px = (d: number) => D0 + d * DAY;
  const top = 320;
  const rowH = 92;
  const rows: { title: string; sub: string; x1: number; x2: number; tone: string; fill: string; fade?: boolean; mono?: boolean }[] = [
    { title: 'Spec', sub: '1 day · long description and review', x1: px(-1), x2: px(0) - 4, tone: c.violet, fill: c.panel },
    { title: '/goal: build', sub: '7 days', x1: px(0), x2: px(7), tone: c.clayHex, fill: c.claySoft, mono: true },
    { title: 'Review & Refactor', sub: '1 day', x1: px(7) + 4, x2: px(8), tone: c.cool, fill: c.coolSoft },
    { title: '/goal: implement review', sub: '6 days', x1: px(8) + 4, x2: px(14), tone: c.clayHex, fill: c.claySoft, mono: true },
    { title: 'Ongoing', sub: 'optimizing, bug fixing', x1: px(14) + 4, x2: 1800, tone: c.clayHex, fill: c.claySoft, fade: true },
  ];
  return (
    <Shell eyebrow="Authorship" title="How this was built" proc={proc}>
      <Canvas>
        {[0, 3, 7, 8, 14].map((d) => (
          <g key={d}>
            <line x1={px(d)} y1={top - 22} x2={px(d)} y2={top + rows.length * rowH - 30} style={{ stroke: c.rule, strokeWidth: 1.5, strokeDasharray: '3 6' }} />
            <text x={px(d)} y={top - 34} opacity={d === 8 ? 0 : 1} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 22, fill: c.dim }}>
              {`day ${d}`}
            </text>
          </g>
        ))}
      </Canvas>
      {rows.map((r, i) => (
        <Fade key={r.title} show={s >= i + 1} style={{ position: 'absolute', left: 120, top: top + i * rowH, width: 1680, height: rowH }}>
          <div style={{ position: 'absolute', left: 0, top: 4, display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span style={{ fontFamily: r.mono ? MONO : SERIF, fontSize: r.mono ? 28 : 34 }}>{r.title}</span>
          </div>
          <div style={{ position: 'absolute', left: 0, top: 50, fontSize: 24, color: c.muted }}>{r.sub}</div>
          <div
            style={{
              position: 'absolute',
              left: r.x1 - 120,
              top: 10,
              width: r.x2 - r.x1,
              height: 50,
              boxSizing: 'border-box',
              borderRadius: r.fade ? '10px 0 0 10px' : 10,
              border: r.fade ? 'none' : `1.75px solid ${r.tone}`,
              borderLeft: `1.75px solid ${r.tone}`,
              background: r.fade ? `linear-gradient(90deg, ${r.fill}, rgba(217, 119, 87, 0))` : r.fill,
            }}
          />
        </Fade>
      ))}
      <Canvas>
        <GFade show={s >= 2} delay={500}>
          <circle cx={px(3)} cy={top + rowH + 35} r={10} style={{ fill: c.clayHex }} />
        </GFade>
      </Canvas>
      <At x={px(3) + 18} y={top + rowH + 20} w={420}>
        <Fade show={s >= 2} delay={600}>
          <span style={{ fontSize: 23, color: c.clayHex }}>first working federation</span>
        </Fade>
      </At>
      <At x={120} y={935} w={1680}>
        <div style={{ fontSize: 30, color: c.muted }}>
          Agents: <span style={{ color: ACCENT }}>Sol</span> and <span style={{ color: ACCENT }}>Astra</span> (OpenAI),{' '}
          <span style={{ color: ACCENT }}>Opus</span> (Anthropic)
        </div>
      </At>
    </Shell>
  );
};

const ThanksRow = ({ show, delay, who, what }: { show: boolean; delay: number; who: string; what: ReactNode }) => (
  <Fade show={show} delay={delay}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 40, padding: '30px 0', borderBottom: `1px solid ${c.rule}` }}>
      <span style={{ fontFamily: SERIF, fontSize: 48, width: 460, flexShrink: 0 }}>{who}</span>
      <span style={{ fontSize: 32, color: c.muted }}>{what}</span>
    </div>
  </Fade>
);

const Thanks: Page = () => {
  const proc = useProcess(3, 1800);
  const s = proc.step;
  return (
    <Shell eyebrow="Authorship" title="Built on the work of" proc={proc}>
      <At x={120} y={300} w={1680}>
        <ThanksRow show={s >= 1} delay={0} who="CDK team" what="the codebase all of this builds on" />
        <ThanksRow show={s >= 2} delay={0} who="Cashu team" what="the BLS blind signature spec" />
        <ThanksRow
          show={s >= 3}
          delay={0}
          who="Fedimint team"
          what="showed it works: BLS blind signatures, AlephBFT, iroh"
        />
      </At>
    </Shell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 01 · BLS blind signatures
// ═════════════════════════════════════════════════════════════════════════════

const EQ = 42;
const Lanes = () => (
  <>
    <At x={120} y={250}>
      <Label color={c.cool}>Wallet</Label>
    </At>
    <At x={900} y={250}>
      <Label color={c.clayHex}>Mint</Label>
    </At>
  </>
);

const Bdhke: Page = () => {
  const proc = useProcess(7);
  const s = proc.step;
  return (
    <Shell n="1.1" eyebrow="BLS blind signatures" title="Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)" proc={proc}>
      <Lanes />
      <Canvas>
        <Arrow x1={590} y1={470} x2={870} y2={470} show={s >= 3} color={c.cool} label="B′" />
        <Packet x1={590} y1={470} x2={870} y2={470} run={proc.anim && s === 3} delay={250} />
        <Arrow x1={870} y1={612} x2={590} y2={612} show={s >= 5} color={c.clayHex} label="C′" />
        <Packet x1={870} y1={612} x2={590} y2={612} run={proc.anim && s === 5} color={c.clayHex} delay={250} />
        <Arrow x1={590} y1={782} x2={870} y2={782} show={s >= 7} color={c.muted} label="(x, C)" />
        <Packet x1={590} y1={782} x2={870} y2={782} run={proc.anim && s === 7} color={c.muted} delay={250} />
      </Canvas>
      <At x={120} y={298} w={460}>
        <Fade show={s >= 1}>
          <M size={EQ}>
            Y = <Up>hash_to_curve</Up>(x)
          </M>
        </Fade>
        <Fade show={s >= 2} style={{ marginTop: 18 }}>
          <M size={EQ}>B′ = Y + r·G</M>
        </Fade>
      </At>
      <At x={900} y={520} w={420}>
        <Fade show={s >= 4}>
          <M size={EQ}>
            C′ = <Hi>k</Hi>·B′
          </M>
        </Fade>
      </At>
      <At x={120} y={670} w={460}>
        <Fade show={s >= 6}>
          <M size={EQ}>C = C′ − r·K = k·Y</M>
        </Fade>
      </At>
      <At x={900} y={830} w={420}>
        <Fade show={s >= 7}>
          <M size={EQ}>
            <Hi>k</Hi>·Y ≟ C
          </M>
        </Fade>
      </At>
      <At x={120} y={900} w={1200}>
        <Fade show={s >= 7}>
          <div style={{ fontSize: 32 }}>
            Only the holder of <M>k</M> can verify <M>C</M>.
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Hash <M>x</M> to <M>Y</M>
        </StepItem>
        <StepItem n={2} step={s}>
          Blind with <M>r</M>
        </StepItem>
        <StepItem n={3} step={s}>
          Send <M>B′</M>
        </StepItem>
        <StepItem n={4} step={s}>
          Sign with <M>k</M>
        </StepItem>
        <StepItem n={5} step={s}>
          Return <M>C′</M>
        </StepItem>
        <StepItem n={6} step={s}>
          Unblind
        </StepItem>
        <StepItem n={7} step={s}>
          Verifying needs <M>k</M>
        </StepItem>
      </StepList>
    </Shell>
  );
};

const BlsFlow: Page = () => {
  const proc = useProcess(6);
  const s = proc.step;
  return (
    <Shell n="1.1" eyebrow="BLS blind signatures" title="Blind BLS signatures on BLS12-381 (keyset v3)" proc={proc}>
      <Lanes />
      <Canvas>
        <Arrow x1={590} y1={470} x2={870} y2={470} show={s >= 3} color={c.cool} label="B′" />
        <Packet x1={590} y1={470} x2={870} y2={470} run={proc.anim && s === 3} delay={250} />
        <Arrow x1={870} y1={612} x2={590} y2={612} show={s >= 5} color={c.clayHex} label="C′" />
        <Packet x1={870} y1={612} x2={590} y2={612} run={proc.anim && s === 5} color={c.clayHex} delay={250} />
      </Canvas>
      <At x={120} y={298} w={460}>
        <Fade show={s >= 1}>
          <M size={EQ}>
            Y = <Up>H</Up>(x) ∈ G₁
          </M>
        </Fade>
        <Fade show={s >= 2} style={{ marginTop: 18 }}>
          <M size={EQ}>B′ = r·Y</M>
        </Fade>
      </At>
      <At x={900} y={520} w={420}>
        <Fade show={s >= 4}>
          <M size={EQ}>
            C′ = <Hi>k</Hi>·B′
          </M>
        </Fade>
      </At>
      <At x={120} y={662} w={460}>
        <Fade show={s >= 5}>
          <M size={36}>
            <Up>e</Up>(C′, G₂) ≟ <Up>e</Up>(B′, <Hi color={c.cool}>K</Hi>)
          </M>
        </Fade>
        <Fade show={s >= 6} style={{ marginTop: 22 }}>
          <M size={EQ}>C = r⁻¹·C′ = k·Y</M>
        </Fade>
        <Fade show={s >= 6} delay={150} style={{ marginTop: 22 }}>
          <M size={36}>
            <Up>e</Up>(C, G₂) ≟ <Up>e</Up>(Y, <Hi color={c.cool}>K</Hi>)
          </M>
        </Fade>
      </At>
      <At x={900} y={700} w={420}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 30, lineHeight: 1.7 }}>
            <div>signatures: 48 B</div>
            <div>public keys: 96 B</div>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Hash <M>x</M> to <M>Y</M> in G₁
        </StepItem>
        <StepItem n={2} step={s}>
          Blind: <M>r·Y</M>
        </StepItem>
        <StepItem n={3} step={s}>
          Send <M>B′</M>
        </StepItem>
        <StepItem n={4} step={s}>
          Sign with <M>k</M>
        </StepItem>
        <StepItem n={5} step={s}>
          Check with a pairing
        </StepItem>
        <StepItem n={6} step={s}>
          Unblind, verify with <M>K</M>
        </StepItem>
      </StepList>
    </Shell>
  );
};

const DerivLine = ({
  n,
  step,
  first,
  children,
  why,
}: {
  n: number;
  step: number;
  first?: boolean;
  children: ReactNode;
  why?: string;
}) => (
  <Fade show={!!first || step >= n} style={{ display: 'flex', alignItems: 'baseline', height: 72 }}>
    <span style={{ width: 70, textAlign: 'right', paddingRight: 24 }}>{!first && <M size={42}>=</M>}</span>
    <span style={{ width: 860 }}>
      <M size={42}>{children}</M>
    </span>
    <span style={{ fontSize: 24, color: step === n ? ACCENT : c.muted, transition: `color 300ms ${EASE_OUT}` }}>{why}</span>
  </Fade>
);

const Pairing: Page = () => {
  const proc = useProcess(6, 1500);
  const s = proc.step;
  return (
    <Shell n="1.1" eyebrow="BLS blind signatures" title="Pairing check, expanded" proc={proc}>
      <At x={120} y={262} w={1680}>
        <DerivLine n={0} step={s} first>
          <Up>e</Up>(C, G₂)
        </DerivLine>
        <DerivLine n={1} step={s} why="unblind: C = r⁻¹·C′">
          <Up>e</Up>(<Hi>r⁻¹·C′</Hi>, G₂)
        </DerivLine>
        <DerivLine n={2} step={s} why="sign and blind: C′ = k·r·Y">
          <Up>e</Up>(r⁻¹·<Hi>k·r·Y</Hi>, G₂)
        </DerivLine>
        <DerivLine n={3} step={s} why="r⁻¹·r = 1">
          <Up>e</Up>(<Hi>k·Y</Hi>, G₂)
        </DerivLine>
        <DerivLine n={4} step={s} why="bilinearity">
          <Up>e</Up>(Y, G₂)<Hi>ᵏ</Hi>
        </DerivLine>
        <DerivLine n={5} step={s} why="bilinearity">
          <Up>e</Up>(Y, <Hi>k·G₂</Hi>)
        </DerivLine>
        <DerivLine n={6} step={s} why="K = k·G₂ is the published key">
          <Up>e</Up>(Y, <Hi color={c.cool}>K</Hi>)
        </DerivLine>
      </At>
      <At x={120} y={830} w={1680}>
        <div style={{ height: 1, background: c.rule, marginBottom: 28 }} />
        <Fade show={s >= 6}>
          <div style={{ fontSize: 34 }}>
            Both sides use only public values: anyone with <M>K</M> can verify.
          </div>
        </Fade>
      </At>
    </Shell>
  );
};

const Cell = ({ children, head, w, color }: { children: ReactNode; head?: boolean; w: number; color?: string }) => (
  <div
    style={{
      width: w,
      flexShrink: 0,
      boxSizing: 'border-box',
      padding: '0 20px',
      fontSize: head ? 20 : 25,
      letterSpacing: head ? '0.08em' : undefined,
      textTransform: head ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
    }}
  >
    {children}
  </div>
);

const Row = ({ children, i, head, h }: { children: ReactNode; i: number; head?: boolean; h?: number }) => {
  const on = useEntered();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: head ? 52 : h ?? 62,
        borderBottom: `1px solid ${head ? c.line : c.rule}`,
        opacity: on ? 1 : 0,
        transform: on ? 'translateY(0px)' : 'translateY(6px)',
        transition: `opacity 400ms ${EASE_OUT} ${i * 40}ms, transform 400ms ${EASE_OUT} ${i * 40}ms`,
      }}
    >
      {children}
    </div>
  );
};

const KW = [320, 400, 400, 560];
const Keysets: Page = () => (
  <Shell n="1.1" eyebrow="BLS blind signatures" title="Keyset versions">
    <At x={120} y={262} w={1680}>
      <Row i={0} head>
        <Cell head w={KW[0]}> </Cell>
        <Cell head w={KW[1]}>v1</Cell>
        <Cell head w={KW[2]}>v2</Cell>
        <Cell head w={KW[3]} color={c.clayHex}>
          v3
        </Cell>
      </Row>
      <Row i={1}>
        <Cell w={KW[0]} color={c.muted}>Curve</Cell>
        <Cell w={KW[1]}>secp256k1</Cell>
        <Cell w={KW[2]}>secp256k1</Cell>
        <Cell w={KW[3]}>BLS12-381</Cell>
      </Row>
      <Row i={2}>
        <Cell w={KW[0]} color={c.muted}>Keyset ID</Cell>
        <Cell w={KW[1]}>
          <Code>00</Code> + 7 bytes
        </Cell>
        <Cell w={KW[2]}>
          <Code>01</Code> + 32 bytes
        </Cell>
        <Cell w={KW[3]}>
          <Code>02</Code> + 32 bytes
        </Cell>
      </Row>
      <Row i={3}>
        <Cell w={KW[0]} color={c.muted}>Public key</Cell>
        <Cell w={KW[1]}>33 B</Cell>
        <Cell w={KW[2]}>33 B</Cell>
        <Cell w={KW[3]}>96 B, in G₂</Cell>
      </Row>
      <Row i={4}>
        <Cell w={KW[0]} color={c.muted}>Blind / unblind</Cell>
        <Cell w={KW[1]}>
          <M>Y + r·G</M> / <M>C′ − r·K</M>
        </Cell>
        <Cell w={KW[2]}>
          <M>Y + r·G</M> / <M>C′ − r·K</M>
        </Cell>
        <Cell w={KW[3]}>
          <M>r·Y</M> / <M>r⁻¹·C′</M>
        </Cell>
      </Row>
      <Row i={5}>
        <Cell w={KW[0]} color={c.muted}>Verification</Cell>
        <Cell w={KW[1]}>mint (k), wallet (DLEQ)</Cell>
        <Cell w={KW[2]}>mint (k), wallet (DLEQ)</Cell>
        <Cell w={KW[3]}>pairing with K, any party</Cell>
      </Row>
      <Row i={6}>
        <Cell w={KW[0]} color={c.muted}>DLEQ (NUT-12)</Cell>
        <Cell w={KW[1]}>optional</Cell>
        <Cell w={KW[2]}>optional</Cell>
        <Cell w={KW[3]}>rejected if present</Cell>
      </Row>
      <Row i={7}>
        <Cell w={KW[0]} color={c.muted}>Threshold issuance</Cell>
        <Cell w={KW[1]}>no</Cell>
        <Cell w={KW[2]}>no</Cell>
        <Cell w={KW[3]}>yes</Cell>
      </Row>
    </At>
    <At x={120} y={808} w={1680}>
      <Note>
        <div>
          v3 ID: <Code>02</Code> ‖ SHA256(len32(keys) ‖ keys ‖ len32(unit) ‖ unit ‖ len32(fee) ‖ fee), keys = amounts and
          96-byte G₂ keys, length-framed. Expiry is not committed.
        </div>
        <div>
          Existing secp keysets remain active; a v3 keyset needs an explicit{' '}
          <Code>rotate-next-keyset --keyset-version v3</Code>. Token formats V3/V4 are unrelated.
        </div>
      </Note>
    </At>
  </Shell>
);

const XW = [380, 620, 680];
const Multisig: Page = () => (
  <Shell n="1.1" eyebrow="BLS blind signatures" title="Threshold BLS compared with t-of-n multisig">
    <At x={120} y={290} w={1680}>
      <Row i={0} head>
        <Cell head w={XW[0]}> </Cell>
        <Cell head w={XW[1]}>secp multisig</Cell>
        <Cell head w={XW[2]} color={c.clayHex}>
          threshold BLS
        </Cell>
      </Row>
      <Row i={1}>
        <Cell w={XW[0]} color={c.muted}>Proof contains</Cell>
        <Cell w={XW[1]}>
          <M>t</M> signatures, roster
        </Cell>
        <Cell w={XW[2]}>one signature</Cell>
      </Row>
      <Row i={2}>
        <Cell w={XW[0]} color={c.muted}>Wallet checks</Cell>
        <Cell w={XW[1]}>
          <M>t</M> DLEQ proofs
        </Cell>
        <Cell w={XW[2]}>one pairing</Cell>
      </Row>
      <Row i={3}>
        <Cell w={XW[0]} color={c.muted}>Signers visible</Cell>
        <Cell w={XW[1]}>yes</Cell>
        <Cell w={XW[2]}>no</Cell>
      </Row>
      <Row i={4}>
        <Cell w={XW[0]} color={c.muted}>Consensus needed</Cell>
        <Cell w={XW[1]}>yes</Cell>
        <Cell w={XW[2]}>yes</Cell>
      </Row>
    </At>
    <At x={120} y={720} w={1680}>
      <div style={{ fontSize: 34 }}>Threshold BLS keeps today's proof format.</div>
    </At>
  </Shell>
);

// ═════════════════════════════════════════════════════════════════════════════
// 02 · Threshold issuance
// ═════════════════════════════════════════════════════════════════════════════

const Shamir: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  // x ∈ [0,4] → [220,1220]; f(x) = 3 + 1.2x; y px = 900 − 65·f
  const X = (x: number) => 220 + 250 * x;
  const Y = (y: number) => 900 - 65 * y;
  const f = (x: number) => 3 + 1.2 * x;
  const fan = (sl: number) => ({ y1: Y(f(2)) + sl * (X(0) - X(2)), y2: Y(f(2)) + sl * (X(4) - X(2)) });
  const fA = fan(0.1);
  const fB = fan(-0.15);
  const fC = fan(-0.42);
  return (
    <Shell n="1.2" eyebrow="Threshold issuance" title="Shamir secret sharing, t = 2" proc={proc}>
      <Canvas>
        <Line x1={220} y1={900} x2={1250} y2={900} color={c.node} />
        <Line x1={220} y1={900} x2={220} y2={330} color={c.node} />
        <T x={1262} y={930} size={28} font="math" color={c.muted}>
          x
        </T>
        <T x={188} y={346} size={28} font="math" color={c.muted}>
          f(x)
        </T>
        <Draw x1={X(0)} y1={Y(f(0))} x2={X(4)} y2={Y(f(4))} show={s >= 1} opacity={s === 3 ? 0.08 : 1} />
        <GFade show={s === 3}>
          <line x1={X(0)} y1={fA.y1} x2={X(4)} y2={fA.y2} style={{ stroke: c.node, strokeWidth: 1.5, strokeDasharray: '6 6' }} />
          <line x1={X(0)} y1={fB.y1} x2={X(4)} y2={fB.y2} style={{ stroke: c.node, strokeWidth: 1.5, strokeDasharray: '6 6' }} />
          <line x1={X(0)} y1={fC.y1} x2={X(4)} y2={fC.y2} style={{ stroke: c.node, strokeWidth: 1.5, strokeDasharray: '6 6' }} />
          <T x={190} y={Y(f(0)) + 14} size={42} anchor="end" color={c.muted}>
            ?
          </T>
        </GFade>
        <Dot x={X(0)} y={Y(f(0))} r={11} ring show={s >= 1 && s !== 3} />
        <T x={190} y={Y(f(0)) + 14} size={42} anchor="end" font="math" color={c.clayHex} show={s >= 1 && s !== 3}>
          k
        </T>
        <g style={{ opacity: s === 3 ? 0.15 : 1, transition: `opacity 500ms ${EASE_OUT}` }}>
          <Dot x={X(1)} y={Y(f(1))} color={s >= 4 ? c.clayHex : c.cool} ring={s >= 4} show={s >= 2} />
          <Dot x={X(3)} y={Y(f(3))} color={s >= 4 ? c.clayHex : c.cool} ring={s >= 4} show={s >= 2} delay={100} />
          <T x={X(1)} y={Y(f(1)) - 30} size={32} font="math" show={s >= 2}>
            k₁
          </T>
          <T x={X(3)} y={Y(f(3)) - 30} size={32} font="math" show={s >= 2} delay={100}>
            k₃
          </T>
        </g>
        <Dot x={X(2)} y={Y(f(2))} color={c.cool} show={s >= 2} delay={50} />
        <T x={X(2)} y={Y(f(2)) - 30} size={32} font="math" show={s >= 2} delay={50}>
          k₂
        </T>
        <T x={X(1)} y={940} size={22} font="mono" color={c.muted} show={s >= 2}>
          m1
        </T>
        <T x={X(2)} y={940} size={22} font="mono" color={c.muted} show={s >= 2} delay={50}>
          m2
        </T>
        <T x={X(3)} y={940} size={22} font="mono" color={c.muted} show={s >= 2} delay={100}>
          m3
        </T>
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Random line through (0, <M>k</M>)
        </StepItem>
        <StepItem n={2} step={s}>
          Member <M>i</M> holds <M>f(i)</M>
        </StepItem>
        <StepItem n={3} step={s}>
          One share: any <M>k</M> fits
        </StepItem>
        <StepItem n={4} step={s}>
          Two shares fix <M>k</M>
        </StepItem>
      </StepList>
    </Shell>
  );
};

type Subset = { members: number[]; lam: Record<number, string>; derive: string; sum: string };
const SUBSETS: Subset[] = [
  { members: [1, 2], lam: { 1: '2', 2: '−1' }, derive: 'λ₁ = 2/(2−1) = 2,   λ₂ = 1/(1−2) = −1', sum: 'f(0) = 2·4.2 − 1·5.4 = 3' },
  { members: [1, 3], lam: { 1: '3/2', 3: '−1/2' }, derive: 'λ₁ = 3/(3−1) = 3/2,   λ₃ = 1/(1−3) = −1/2', sum: 'f(0) = 1.5·4.2 − 0.5·6.6 = 3' },
  { members: [2, 3], lam: { 2: '3', 3: '−2' }, derive: 'λ₂ = 3/(3−2) = 3,   λ₃ = 2/(2−3) = −2', sum: 'f(0) = 3·5.4 − 2·6.6 = 3' },
];

const ShareCard = ({ i, value, sub, x }: { i: number; value: string; sub: Subset | null; x: number }) => {
  const on = sub !== null && sub.members.includes(i);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 392,
        width: 320,
        height: 120,
        boxSizing: 'border-box',
        borderRadius: 'var(--osd-radius)',
        border: `1.75px solid ${on ? c.clayHex : c.rule}`,
        background: on ? c.claySoft : c.card,
        padding: '16px 24px',
        transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 20, color: c.muted }}>m{i}</div>
      <M size={38}>
        f({i}) = {value}
      </M>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 138, textAlign: 'center', height: 48 }}>
        {on && sub && (
          <span
            key={sub.derive}
            style={{ display: 'inline-block', animation: REDUCED ? 'none' : `fc-in 400ms ${EASE_OUT} both` }}
          >
            <M size={38} color={ACCENT}>
              λ{['₁', '₂', '₃'][i - 1]} = {sub.lam[i]}
            </M>
          </span>
        )}
      </div>
    </div>
  );
};

const Lagrange: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const sub = s >= 2 ? SUBSETS[Math.min(s, 4) - 2] : null;
  return (
    <Shell n="1.2" eyebrow="Threshold issuance" title="Lagrange interpolation at x = 0" proc={proc}>
      <At x={120} y={258} w={1200}>
        <M size={40}>
          f(0) = Σ<sub style={{ fontSize: 24 }}>i∈S</sub> λᵢ·f(i),&nbsp;&nbsp; λᵢ = Π
          <sub style={{ fontSize: 24 }}>j∈S, j≠i</sub> j / (j − i)
        </M>
        <Note style={{ marginTop: 8 }}>
          Example: <M>t = 2</M>, <M>f(x) = 3 + 1.2x</M>, <M>k = 3</M>. <M>S</M> is the set of responding members.
        </Note>
      </At>
      <ShareCard i={1} value="4.2" sub={sub} x={120} />
      <ShareCard i={2} value="5.4" sub={sub} x={500} />
      <ShareCard i={3} value="6.6" sub={sub} x={880} />
      <At x={120} y={606} w={1200} style={{ height: 150 }}>
        {sub && (
          <div key={sub.derive} style={{ animation: REDUCED ? 'none' : `fc-in 400ms ${EASE_OUT} both` }}>
            <div style={{ fontSize: 28, color: c.muted }}>
              <M>{sub.derive}</M>
            </div>
            <div style={{ marginTop: 20 }}>
              <M size={40}>{sub.sum}</M>
            </div>
          </div>
        )}
      </At>
      <At x={120} y={800} w={1200}>
        <Fade show={s >= 5}>
          <div
            style={{
              border: `1.75px solid ${c.clayHex}`,
              background: c.claySoft,
              borderRadius: 'var(--osd-radius)',
              padding: '18px 28px',
            }}
          >
            <M size={36}>
              C′ = Σ λᵢ·C′ᵢ = Σ λᵢ·kᵢ·B′ = f(0)·B′ = <Hi>k·B′</Hi>
            </M>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Any <M>t</M> points determine <M>f(0)</M> as a weighted sum.
        </StepItem>
        <StepItem n={2} step={s}>
          <M>S = {'{1, 2}'}</M>
        </StepItem>
        <StepItem n={3} step={s}>
          <M>S = {'{1, 3}'}</M>
        </StepItem>
        <StepItem n={4} step={s}>
          <M>S = {'{2, 3}'}</M>: different weights, same <M>f(0)</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          The weights are scalars, so they apply to G₁ points: the wallet interpolates signature shares.
        </StepItem>
        <Note style={{ marginTop: 26, fontSize: 22 }}>
          <Code>aggregate_blind_signature_shares()</Code> in <Code>nut01/bls.rs</Code>
        </Note>
      </StepList>
    </Shell>
  );
};

const ThresholdSign: Page = () => {
  const proc = useProcess(7);
  const s = proc.step;
  const w = { x: 300, y: 540 };
  const m = [
    { x: 1000, y: 340 },
    { x: 1000, y: 540 },
    { x: 1000, y: 740 },
  ];
  return (
    <Shell n="1.2" eyebrow="Threshold issuance" title="Threshold blind signing" proc={proc}>
      <Canvas>
        <Line x1={w.x} y1={w.y} x2={m[0].x} y2={m[0].y} color={s >= 2 ? c.cool : c.rule} opacity={s >= 2 ? 0.6 : 1} />
        <Line
          x1={w.x}
          y1={w.y}
          x2={m[1].x}
          y2={m[1].y}
          color={s >= 2 ? c.cool : c.rule}
          opacity={s >= 4 ? 0.2 : s >= 2 ? 0.6 : 1}
          dash={s >= 4 ? '5 7' : undefined}
        />
        <Line x1={w.x} y1={w.y} x2={m[2].x} y2={m[2].y} color={s >= 2 ? c.cool : c.rule} opacity={s >= 2 ? 0.6 : 1} />
        <Packet x1={w.x} y1={w.y} x2={m[0].x} y2={m[0].y} run={proc.anim && s === 2} />
        <Packet x1={w.x} y1={w.y} x2={m[1].x} y2={m[1].y} run={proc.anim && s === 2} delay={50} />
        <Packet x1={w.x} y1={w.y} x2={m[2].x} y2={m[2].y} run={proc.anim && s === 2} delay={100} />
        <Packet x1={m[0].x} y1={m[0].y} x2={w.x} y2={w.y} run={proc.anim && s === 4} color={c.clayHex} />
        <Packet x1={m[2].x} y1={m[2].y} x2={w.x} y2={w.y} run={proc.anim && s === 4} color={c.clayHex} delay={120} />
        <T x={650} y={410} size={34} font="math" color={c.cool} show={s >= 2}>
          B′
        </T>
        <WalletNode x={w.x} y={w.y} r={60} />
        <Member x={m[0].x} y={m[0].y} label="m1" r={44} tone={s >= 3 ? 'on' : 'idle'} />
        <Member x={m[1].x} y={m[1].y} label="m2" r={44} tone={s >= 4 ? 'off' : s >= 3 ? 'on' : 'idle'} />
        <Member x={m[2].x} y={m[2].y} label="m3" r={44} tone={s >= 3 ? 'on' : 'idle'} />
      </Canvas>
      <At x={120} y={330} w={400}>
        <Fade show={s >= 1}>
          <M size={34}>
            B′ = r·<Up>H</Up>(x)
          </M>
        </Fade>
      </At>
      <At x={1066} y={318} w={300}>
        <Fade show={s >= 3}>
          <M size={34}>C′₁ = k₁·B′</M>
        </Fade>
      </At>
      <At x={1066} y={518} w={300}>
        <Fade show={s >= 3} delay={50}>
          <span style={{ opacity: s >= 4 ? 0.3 : 1, transition: `opacity 300ms ${EASE_OUT}` }}>
            <M size={34}>C′₂ = k₂·B′</M>
          </span>
        </Fade>
      </At>
      <At x={1066} y={570} w={300}>
        <Fade show={s >= 4}>
          <span style={{ fontSize: 20, color: c.dim }}>no response, not needed</span>
        </Fade>
      </At>
      <At x={1066} y={718} w={300}>
        <Fade show={s >= 3} delay={100}>
          <M size={34}>C′₃ = k₃·B′</M>
        </Fade>
      </At>
      <At x={120} y={730} w={800}>
        <Fade show={s >= 5}>
          <M size={32}>
            <Up>e</Up>(C′₁, G₂) = <Up>e</Up>(B′, K₁),&nbsp; <Up>e</Up>(C′₃, G₂) = <Up>e</Up>(B′, K₃)
          </M>
        </Fade>
        <Fade show={s >= 6} style={{ marginTop: 20 }}>
          <M size={34}>
            C′ = λ₁·C′₁ + λ₃·C′₃ = <Hi>k·B′</Hi>
          </M>
        </Fade>
        <Fade show={s >= 7} style={{ marginTop: 20 }}>
          <M size={34}>
            C = r⁻¹·C′,&nbsp; <Up>e</Up>(C, G₂) = <Up>e</Up>(<Up>H</Up>(x), K)
          </M>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Blind once
        </StepItem>
        <StepItem n={2} step={s}>
          Send to every member
        </StepItem>
        <StepItem n={3} step={s}>
          Each returns <M>kᵢ·B′</M>
        </StepItem>
        <StepItem n={4} step={s}>
          m2 silent: 2 are enough
        </StepItem>
        <StepItem n={5} step={s}>
          Check each share
        </StepItem>
        <StepItem n={6} step={s}>
          Combine the shares
        </StepItem>
        <StepItem n={7} step={s}>
          Unblind, verify with <M>K</M>
        </StepItem>
      </StepList>
    </Shell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 03 · Ordering
// ═════════════════════════════════════════════════════════════════════════════

const GridCell = ({ x, y, on, label }: { x: number; y: number; on: boolean; label: string }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 75,
      top: y - 42,
      width: 150,
      height: 84,
      boxSizing: 'border-box',
      borderRadius: 10,
      border: `1.75px solid ${on ? c.clayHex : c.rule}`,
      background: on ? c.claySoft : c.card,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: on || REDUCED ? 'scale(1)' : 'scale(0.97)',
      transition: `background 400ms ${EASE_OUT}, border-color 400ms ${EASE_OUT}, transform 400ms ${EASE_OUT}`,
    }}
  >
    <span style={{ opacity: on ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>
      <M size={30} color={ACCENT}>
        {label}
      </M>
    </span>
  </div>
);

const ColumnStatus = ({ x, count }: { x: number; count: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 75,
      top: 796,
      width: 150,
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 22,
      color: count >= 2 ? c.good : c.dim,
      transition: `color 300ms ${EASE_OUT}`,
    }}
  >
    {count}/2
  </div>
);

const RequestRow = ({ y, label, window, show }: { y: number; label: string; window: string; show: boolean }) => (
  <div style={{ position: 'absolute', left: 120, top: y - 36, display: 'flex', alignItems: 'center', gap: 22 }}>
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        boxSizing: 'border-box',
        border: `2px solid ${show ? c.clayHex : c.node}`,
        background: c.card,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: 22,
        transition: `border-color 300ms ${EASE_OUT}`,
      }}
    >
      {label}
    </div>
    <div style={{ fontFamily: MONO, fontSize: 24, color: show ? c.ink : c.dim, transition: `color 300ms ${EASE_OUT}` }}>
      sign [{window}]
    </div>
  </div>
);

const MixMatch: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const a = (s >= 1 ? 1 : 0) + (s >= 3 ? 1 : 0);
  const b = (s >= 1 ? 1 : 0) + (s >= 2 ? 1 : 0);
  const cc = (s >= 2 ? 1 : 0) + (s >= 3 ? 1 : 0);
  const minted = [a, b, cc].filter((n) => n >= 2).length;
  const colX = [600, 780, 960];
  const rowY = [420, 560, 700];
  return (
    <Shell n="1.3" eyebrow="Ordering" title="Mix-and-match across members" proc={proc}>
      <div style={{ fontSize: 32, marginTop: 14 }}>
        <M>t = 2</M>, <M>n = 3</M>. Paid for two outputs. Each member gets a different pair.
      </div>
      <At x={colX[0] - 75} y={316} w={150} style={{ textAlign: 'center' }}>
        <M size={38}>A</M>
      </At>
      <At x={colX[1] - 75} y={316} w={150} style={{ textAlign: 'center' }}>
        <M size={38}>B</M>
      </At>
      <At x={colX[2] - 75} y={316} w={150} style={{ textAlign: 'center' }}>
        <M size={38}>C</M>
      </At>
      <RequestRow y={rowY[0]} label="m1" window="A, B" show={s >= 1} />
      <RequestRow y={rowY[1]} label="m2" window="B, C" show={s >= 2} />
      <RequestRow y={rowY[2]} label="m3" window="C, A" show={s >= 3} />
      <GridCell x={colX[0]} y={rowY[0]} on={s >= 1} label="C′₁" />
      <GridCell x={colX[1]} y={rowY[0]} on={s >= 1} label="C′₁" />
      <GridCell x={colX[2]} y={rowY[0]} on={false} label="" />
      <GridCell x={colX[0]} y={rowY[1]} on={false} label="" />
      <GridCell x={colX[1]} y={rowY[1]} on={s >= 2} label="C′₂" />
      <GridCell x={colX[2]} y={rowY[1]} on={s >= 2} label="C′₂" />
      <GridCell x={colX[0]} y={rowY[2]} on={s >= 3} label="C′₃" />
      <GridCell x={colX[1]} y={rowY[2]} on={false} label="" />
      <GridCell x={colX[2]} y={rowY[2]} on={s >= 3} label="C′₃" />
      <ColumnStatus x={colX[0]} count={a} />
      <ColumnStatus x={colX[1]} count={b} />
      <ColumnStatus x={colX[2]} count={cc} />
      <At x={1110} y={380} w={220}>
        <Label>Paid</Label>
        <div style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 1.1 }}>2</div>
        <div style={{ marginTop: 28 }}>
          <Label>Signed</Label>
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 96,
            lineHeight: 1.1,
            color: minted > 2 ? c.bad : c.ink,
            transition: `color 300ms ${EASE_OUT}`,
          }}
        >
          {minted}
        </div>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          m1 signs A, B
        </StepItem>
        <StepItem n={2} step={s}>
          m2 signs B, C
        </StepItem>
        <StepItem n={3} step={s}>
          m3 signs C, A
        </StepItem>
        <StepItem n={4} step={s}>
          3 signatures, 2 paid
        </StepItem>
      </StepList>
    </Shell>
  );
};

const ENV_A = '{"kind":"Mint","quote":"q-7f3a","outputs":["A","B"]}';
const ENV_B = '{"kind":"Mint","quote":"q-7f3a","outputs":["B","C"]}';

const Envelope = ({ outputs, hot, retry }: { outputs: string; hot?: boolean; retry?: boolean }) => (
  <div
    style={{
      width: 560,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.rule}`,
      borderRadius: 'var(--osd-radius)',
      background: c.card,
      padding: '16px 28px',
      fontFamily: MONO,
      fontSize: 24,
      lineHeight: 1.55,
    }}
  >
    {retry && <div style={{ fontFamily: SANS, fontSize: 18, color: c.muted, letterSpacing: '0.08em' }}>RETRY, SAME BYTES</div>}
    <div>
      <span style={{ color: c.dim }}>kind:    </span>Mint
    </div>
    <div>
      <span style={{ color: c.dim }}>quote:   </span>q-7f3a
    </div>
    <div>
      <span style={{ color: c.dim }}>outputs: </span>
      <span style={{ color: hot ? c.violet : c.ink }}>[{outputs}]</span>
    </div>
  </div>
);

const OpId = ({ hex, color }: { hex: string; color: string }) => (
  <div>
    <Label>operation_id</Label>
    <div style={{ fontFamily: MONO, fontSize: 32, color, marginTop: 6 }}>{hex ? `${hex.slice(0, 16)}…` : '…'}</div>
  </div>
);

const OperationId: Page = () => {
  const proc = useProcess(3);
  const s = proc.step;
  const ha = useSha256(ENV_A);
  const hb = useSha256(ENV_B);
  return (
    <Shell n="1.3" eyebrow="Ordering" title="Operation IDs" proc={proc}>
      <Canvas>
        <Arrow x1={700} y1={340} x2={880} y2={340} show={s >= 1} label="SHA-256" font="mono" labelColor={c.muted} />
        <Arrow x1={700} y1={560} x2={880} y2={560} show={s >= 2} label="SHA-256" font="mono" labelColor={c.muted} />
        <Arrow x1={700} y1={800} x2={880} y2={800} show={s >= 3} label="SHA-256" font="mono" labelColor={c.muted} />
      </Canvas>
      <At x={120} y={262}>
        <Envelope outputs="A, B" />
      </At>
      <At x={910} y={306}>
        <Fade show={s >= 1} delay={400}>
          <OpId hex={ha} color={c.clayHex} />
        </Fade>
      </At>
      <At x={120} y={482}>
        <Fade show={s >= 2}>
          <Envelope outputs="B, C" hot />
        </Fade>
      </At>
      <At x={910} y={526}>
        <Fade show={s >= 2} delay={400}>
          <OpId hex={hb} color={c.violet} />
        </Fade>
      </At>
      <At x={120} y={702}>
        <Fade show={s >= 3}>
          <Envelope outputs="A, B" retry />
        </Fade>
      </At>
      <At x={910} y={766}>
        <Fade show={s >= 3} delay={400}>
          <OpId hex={ha} color={c.clayHex} />
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The exact request is an envelope: federation, kind, quote or inputs, outputs.
        </StepItem>
        <StepItem n={2} step={s}>
          A different output set is a different operation.
        </StepItem>
        <StepItem n={3} step={s}>
          An exact retry maps to the same operation and joins it.
        </StepItem>
        <Note style={{ marginTop: 26, fontSize: 22 }}>
          Signature shares carry the <Code>operation_id</Code>. The hashes on this slide are computed live.
        </Note>
      </StepList>
    </Shell>
  );
};

const LogRow = ({ n, op, verdict, ok, show }: { n: string; op: string; verdict: string; ok: boolean; show: boolean }) => (
  <Fade show={show} style={{ marginBottom: 16 }}>
    <div
      style={{
        border: `1.5px solid ${ok ? c.good : c.rule}`,
        background: ok ? c.goodSoft : c.card,
        borderRadius: 10,
        padding: '12px 20px',
        fontFamily: MONO,
        fontSize: 22,
      }}
    >
      <span style={{ color: c.dim }}>{n}</span> <span style={{ color: ok ? c.clayHex : c.violet }}>op {op}</span>
      <div style={{ fontFamily: SANS, fontSize: 21, color: ok ? c.good : c.bad, marginTop: 4 }}>{verdict}</div>
    </div>
  </Fade>
);

const EnvChip = ({ op, outs, color, into, y }: { op: string; outs: string; color: string; into: boolean; y: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      top: y,
      width: 300,
      boxSizing: 'border-box',
      border: `1.5px solid ${color}`,
      background: c.card,
      borderRadius: 10,
      padding: '12px 18px',
      fontFamily: MONO,
      fontSize: 22,
      color,
      transform: into && !REDUCED ? 'translateX(330px) scale(0.96)' : 'translateX(0px)',
      opacity: into ? 0 : 1,
      transition: `transform 900ms ${EASE_IO}, opacity 400ms ${EASE_OUT} ${into ? 500 : 0}ms`,
    }}
  >
    op {op} · [{outs}]
  </div>
);

const ShareTag = ({ m, op }: { m: string; op: string }) => (
  <div
    style={{
      border: `1.5px solid ${c.clayHex}`,
      background: c.claySoft,
      borderRadius: 10,
      padding: '10px 18px',
      fontFamily: MONO,
      fontSize: 21,
    }}
  >
    {m}: <M color={c.clayHex}>C′ᵢ</M>
    <span style={{ color: c.clayHex }}>, op {op}</span>
  </div>
);

const ORD_REQ = [
  { m: 'm1', outs: 'A, B', tone: c.clayHex, x: 300, jx: 470, jy: 488, rot: -6 },
  { m: 'm2', outs: 'B, C', tone: c.violet, x: 640, jx: 800, jy: 540, rot: 5 },
  { m: 'm3', outs: 'C, A', tone: c.cool, x: 980, jx: 610, jy: 552, rot: -3 },
];
const ORD_CHIP_Y = 360;
const ORD_BOX = { x: 330, y: 440, w: 620, h: 170 };
const ORD_ROW_Y = [676, 746, 816];

const OrdChip = ({ outs, tone, style }: { outs: string; tone: string; style?: CSSProperties }) => (
  <div
    style={{
      position: 'absolute',
      width: 170,
      height: 52,
      boxSizing: 'border-box',
      border: `1.75px solid ${tone}`,
      background: c.card,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 28,
      color: tone,
      ...style,
    }}
  >
    [{outs}]
  </div>
);

const Consensus: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  return (
    <Shell n="1.3" eyebrow="Ordering" title="One order, replicated" proc={proc}>
      <Canvas>
        {ORD_REQ.map((r) => (
          <Member key={r.m} x={r.x} y={290} r={38} label={r.m} />
        ))}
        <Arrow x1={640} y1={ORD_BOX.y + ORD_BOX.h + 4} x2={640} y2={ORD_ROW_Y[0] - 32} show={s >= 2} color={c.node} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          left: ORD_BOX.x,
          top: ORD_BOX.y,
          width: ORD_BOX.w,
          height: ORD_BOX.h,
          boxSizing: 'border-box',
          border: `1.75px solid ${s >= 1 ? c.node : c.rule}`,
          background: c.panel,
          borderRadius: 18,
          transition: `border-color 300ms ${EASE_OUT}`,
        }}
      >
        <div style={{ position: 'absolute', right: 22, bottom: 12, fontFamily: SERIF, fontSize: 30, color: c.muted }}>
          AlephBFT
        </div>
      </div>
      {ORD_REQ.map((r) => (
        <OrdChip
          key={`ghost${r.m}`}
          outs={r.outs}
          tone={r.tone}
          style={{ left: r.x - 85, top: ORD_CHIP_Y - 26, opacity: s >= 1 ? 0.3 : 0, transition: `opacity 400ms ${EASE_OUT}` }}
        />
      ))}
      {ORD_REQ.map((r, i) => {
        const inside = s >= 1;
        const gone = s >= 2;
        const dx = r.jx - r.x;
        const dy = r.jy - ORD_CHIP_Y;
        return (
          <OrdChip
            key={r.m}
            outs={r.outs}
            tone={r.tone}
            style={{
              left: r.x - 85,
              top: ORD_CHIP_Y - 26,
              opacity: gone ? 0 : 1,
              transform: inside ? `translate(${dx}px, ${dy}px) rotate(${r.rot}deg)` : 'translate(0px, 0px)',
              transition: `transform 900ms ${EASE_IO} ${i * 90}ms, opacity 400ms ${EASE_OUT}`,
            }}
          />
        );
      })}
      {ORD_REQ.map((r, i) => {
        const ok = i === 0;
        const judged = s >= 3;
        return (
          <div
            key={`row${r.m}`}
            style={{
              position: 'absolute',
              left: 640 - 85 - 44 - 22,
              top: ORD_ROW_Y[i] - 26,
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              opacity: s >= 2 ? (judged && !ok ? 0.55 : 1) : 0,
              transform: s >= 2 || REDUCED ? 'translateY(0px)' : 'translateY(-60px)',
              transition: `opacity 450ms ${EASE_OUT} ${s >= 2 ? 300 + i * 120 : 0}ms, transform 700ms ${EASE_IO} ${s >= 2 ? 300 + i * 120 : 0}ms`,
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 26, color: c.muted, width: 44 }}>#{i + 1}</span>
            <OrdChip outs={r.outs} tone={r.tone} style={{ position: 'relative' }} />
            <span
              style={{
                fontSize: 28,
                color: ok ? c.good : c.bad,
                opacity: judged ? 1 : 0,
                transition: `opacity 400ms ${EASE_OUT} ${judged ? 200 + i * 150 : 0}ms`,
              }}
            >
              {ok ? 'applied' : 'quote already used'}
            </span>
          </div>
        );
      })}
      <At x={1080} y={430} w={260}>
        <Fade show={s >= 4}>
          <Label>Paid</Label>
          <div style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 1.1 }}>2</div>
          <div style={{ marginTop: 20 }}>
            <Label>Signed</Label>
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 1.1, color: c.good }}>2</div>
        </Fade>
      </At>
      <At x={120} y={880} w={1200}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 32 }}>
            Every member signs only <M>A, B</M>. <M>C</M> gets no shares.
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Requests go in, unordered
        </StepItem>
        <StepItem n={2} step={s}>
          One order comes out
        </StepItem>
        <StepItem n={3} step={s}>
          #1 wins, the rest fail
        </StepItem>
        <StepItem n={4} step={s}>
          Paid 2, signed 2
        </StepItem>
      </StepList>
    </Shell>
  );
};

const PipeStage = ({
  x,
  n,
  title,
  step,
  children,
  tone,
}: {
  x: number;
  n: number;
  title: string;
  step: number;
  children: ReactNode;
  tone?: string;
}) => {
  const on = step === n;
  const seen = step >= n;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 268,
        width: 300,
        height: 360,
        boxSizing: 'border-box',
        border: `1.75px solid ${on ? (tone ?? c.clayHex) : c.rule}`,
        background: seen ? c.card : c.panel,
        borderRadius: 'var(--osd-radius)',
        padding: '20px 22px',
        opacity: seen ? 1 : 0.45,
        transition: `border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}, opacity 400ms ${EASE_OUT}`,
      }}
    >
      <div style={{ fontFamily: MONO, fontSize: 20, color: on ? ACCENT : c.dim }}>{n}</div>
      <div style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}>{title}</div>
      <div style={{ fontSize: 28, color: c.muted, lineHeight: 1.35, marginTop: 16 }}>{children}</div>
    </div>
  );
};

const PIPE_X = [120, 465, 810, 1155, 1500];

const PipeArrows = ({ proc }: { proc: Proc }) => (
  <Canvas>
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <Arrow x1={PIPE_X[i] + 306} y1={330} x2={PIPE_X[i + 1] - 6} y2={330} show={proc.step >= i + 2} color={c.node} />
        <Packet
          x1={PIPE_X[i] + 306}
          y1={330}
          x2={PIPE_X[i + 1] - 6}
          y2={330}
          run={proc.anim && proc.step === i + 2}
          color={c.clayHex}
          dur={700}
        />
      </g>
    ))}
  </Canvas>
);

const FlowChip = ({
  children,
  tone,
  fill = c.card,
  struck = false,
  dashed = false,
}: {
  children: ReactNode;
  tone: string;
  fill?: string;
  struck?: boolean;
  dashed?: boolean;
}) => (
  <span
    style={{
      display: 'inline-block',
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${tone}`,
      background: fill,
      borderRadius: 8,
      padding: '6px 16px',
      marginRight: 12,
      fontFamily: MONO,
      fontSize: 28,
      whiteSpace: 'nowrap',
      textDecoration: struck ? 'line-through' : 'none',
      opacity: struck ? 0.45 : 1,
      transition: `opacity 400ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </span>
);

const SWAP_MY = [360, 600, 840];

const Swap: Page = () => {
  const proc = useProcess(5, 1700);
  const s = proc.step;
  const w = { x: 230, y: 600 };
  const mx = 680;
  const bx = 1010;
  return (
    <Shell n="1.3" eyebrow="Ordering" title="Federated swap" proc={proc}>
      <Canvas>
        {SWAP_MY.map((y, i) => (
          <g key={`a${i}`}>
            <Line x1={w.x + 60} y1={w.y} x2={mx - 44} y2={y} color={c.cool} opacity={s >= 1 ? 0.6 : 0.15} />
            <Packet x1={w.x + 60} y1={w.y} x2={mx - 44} y2={y} run={proc.anim && s === 1} delay={i * 50} />
            <Line x1={mx + 44} y1={y} x2={bx} y2={580 + i * 20} color={c.violet} opacity={s >= 2 ? 0.6 : 0.12} />
            <Packet x1={mx + 44} y1={y} x2={bx} y2={580 + i * 20} run={proc.anim && s === 2} color={c.violet} delay={i * 60} />
            <Packet x1={bx} y1={580 + i * 20} x2={mx + 44} y2={y} run={proc.anim && s === 3} color={c.violet} delay={i * 60} />
            <Line x1={mx - 44} y1={y + 10} x2={w.x + 60} y2={w.y + 10} color={c.clayHex} opacity={s >= 4 ? 0.7 : 0} />
            <Packet x1={mx - 44} y1={y + 10} x2={w.x + 60} y2={w.y + 10} run={proc.anim && s === 4} color={c.clayHex} delay={i * 60} />
          </g>
        ))}
        <WalletNode x={w.x} y={w.y} r={60} />
        {SWAP_MY.map((y, i) => (
          <Member key={`m${i}`} x={mx} y={y} r={44} label={`m${i + 1}`} tone={s >= 3 ? 'on' : 'idle'} />
        ))}
      </Canvas>
      <div
        style={{
          position: 'absolute',
          left: bx,
          top: 530,
          width: 280,
          height: 140,
          boxSizing: 'border-box',
          border: `1.75px solid ${s >= 2 ? c.violet : c.rule}`,
          background: c.panel,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `border-color 300ms ${EASE_OUT}`,
        }}
      >
        <span style={{ fontFamily: SERIF, fontSize: 34 }}>AlephBFT</span>
        <span style={{ fontFamily: MONO, fontSize: 26, color: c.violet, opacity: s >= 2 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>
          #41
        </span>
      </div>
      {SWAP_MY.map((y) => (
        <At key={`sp${y}`} x={mx - 72} y={y + 52}>
          <Fade show={s >= 3} delay={500}>
            <span style={{ fontSize: 24, color: c.bad }}>P1 P2 spent</span>
          </Fade>
        </At>
      ))}
      <At x={110} y={420} w={260} style={{ textAlign: 'center' }}>
        <FlowChip tone={c.cool} struck={s >= 3}>
          P1
        </FlowChip>
        <FlowChip tone={c.cool} struck={s >= 3}>
          P2
        </FlowChip>
      </At>
      <At x={110} y={720} w={260} style={{ textAlign: 'center' }}>
        <FlowChip tone={s >= 5 ? c.good : c.cool} fill={s >= 5 ? c.goodSoft : c.card} dashed={s < 5}>
          A
        </FlowChip>
        <FlowChip tone={s >= 5 ? c.good : c.cool} fill={s >= 5 ? c.goodSoft : c.card} dashed={s < 5}>
          B
        </FlowChip>
      </At>
      <At x={80} y={810} w={340} style={{ textAlign: 'center' }}>
        <Fade show={s >= 5}>
          <M size={32}>C = r⁻¹·Σ λᵢ·C′ᵢ</M>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Send to every member
        </StepItem>
        <StepItem n={2} step={s}>
          Submit to AlephBFT
        </StepItem>
        <StepItem n={3} step={s}>
          Apply: inputs spent
        </StepItem>
        <StepItem n={4} step={s}>
          Shares come back
        </StepItem>
        <StepItem n={5} step={s}>
          Combine: new tokens
        </StepItem>
      </StepList>
    </Shell>
  );
};

const MintQuote: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  const W = 200;
  const M1 = 480;
  const M2 = 720;
  const M3 = 960;
  const LN = 1220;
  return (
    <Shell n="1.3" eyebrow="Ordering" title="Bolt11 mint, federated" proc={proc}>
      <Canvas>
        <Lifeline x={W} label="Wallet" color={c.cool} />
        <Lifeline x={M1} label="m1" />
        <Lifeline x={M2} label="m2" />
        <Lifeline x={M3} label="m3" />
        <Lifeline x={LN} label="Lightning" color={c.muted} />

        <Arrow x1={W} y1={314} x2={M1 - 6} y2={314} show={s >= 1} color={c.cool} font="mono" label="POST /v1/mint/quote/bolt11" />
        <Packet x1={W} y1={314} x2={M1} y2={314} run={proc.anim && s === 1} delay={200} />

        <Band x1={M1 - 40} x2={M3 + 40} y={382} label="consensus: MintQuote" show={s >= 2} />
        <Arrow x1={W} y1={446} x2={M3 - 6} y2={446} show={s >= 2} color={c.cool} font="mono" label="poll until t members return the quote" delay={400} dashed />

        <Arrow x1={LN} y1={516} x2={M1 + 6} y2={516} show={s >= 3} color={c.muted} font="mono" label="payment settles" dashed />
        <Dot x={M3} y={516} r={7} color={c.muted} show={s >= 3} delay={200} />
        <Dot x={M2} y={516} r={7} color={c.muted} show={s >= 3} delay={300} />
        <Dot x={M1} y={516} r={7} color={c.muted} show={s >= 3} delay={400} />

        <Band x1={M1 - 40} x2={M3 + 40} y={584} label="MintQuotePayment × 3 → paid (q = 3)" show={s >= 4} />

        <Arrow x1={W} y1={652} x2={M3 - 6} y2={652} show={s >= 5} color={c.cool} font="mono" label="GET quote status, all members" />
        <Dot x={M1} y={652} r={7} color={c.cool} show={s >= 5} delay={300} />
        <Dot x={M2} y={652} r={7} color={c.cool} show={s >= 5} delay={400} />

        <Arrow x1={W} y1={722} x2={M3 - 6} y2={722} show={s >= 6} color={c.cool} font="mono" label="POST /v1/mint (blinded outputs)" />
        <Dot x={M1} y={722} r={7} color={c.cool} show={s >= 6} delay={300} />
        <Dot x={M2} y={722} r={7} color={c.cool} show={s >= 6} delay={400} />
        <Band x1={M1 - 40} x2={M3 + 40} y={794} label="consensus: Mint" show={s >= 6} tone="clay" />
        <Arrow
          x1={M3}
          y1={864}
          x2={W + 6}
          y2={864}
          show={s >= 6}
          color={c.clayHex}
          font="mono"
          label="signature shares from each member"
          delay={500}
        />
        <Packet x1={M3} y1={864} x2={W} y2={864} run={proc.anim && s === 6} color={c.clayHex} delay={900} />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Wallet creates the quote on the first healthy member.
        </StepItem>
        <StepItem n={2} step={s}>
          The quote is ordered through consensus. The wallet polls until <M>t</M> members return it.
        </StepItem>
        <StepItem n={3} step={s}>
          A member probes its backend on a status request, on a payment event, or on a scan.
        </StepItem>
        <StepItem n={4} step={s}>
          Each observation is a consensus item. The quote is paid after <M>q</M> of them.
        </StepItem>
        <StepItem n={5} step={s}>
          The wallet accepts a status once <M>t</M> members return identical responses.
        </StepItem>
        <StepItem n={6} step={s}>
          Each member waits until the quote is paid in its own state, then the Mint operation is ordered and signed.
        </StepItem>
      </StepList>
    </Shell>
  );
};

const Topology: Page = () => {
  const proc = useProcess(3);
  const s = proc.step;
  const w = { x: 800, y: 330 };
  const xs = [440, 620, 800, 980, 1160];
  const my = 600;
  const off = (i: number) => s >= 3 && (i === 3 || i === 4);
  const pairs: [number, number][] = [];
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) pairs.push([i, j]);
  return (
    <Shell n="1.3" eyebrow="Ordering" title="Network topology" proc={proc}>
      <Canvas>
        {pairs.map(([i, j]) => {
          const mx = (xs[i] + xs[j]) / 2;
          const depth = my + 50 + (xs[j] - xs[i]) * 0.3;
          return (
            <path
              key={`${i}-${j}`}
              d={`M ${xs[i]} ${my + 40} Q ${mx} ${depth} ${xs[j]} ${my + 40}`}
              style={{
                fill: 'none',
                stroke: c.violet,
                strokeWidth: 1.75,
                strokeDasharray: '4 6',
                opacity: s >= 2 ? (off(i) || off(j) ? 0.12 : 0.75) : 0.1,
                animation: proc.anim && s >= 2 ? 'fc-flow 2.4s linear infinite' : 'none',
                transition: `opacity 500ms ${EASE_OUT}`,
              }}
            />
          );
        })}
        {xs.map((x, i) => (
          <g key={`p${i}`}>
            <Line x1={w.x} y1={w.y + 46} x2={x} y2={my - 40} color={c.cool} opacity={s >= 1 ? (off(i) ? 0.15 : 0.7) : 0.15} />
            <Packet x1={w.x} y1={w.y + 46} x2={x} y2={my - 40} run={proc.anim && s === 1} delay={i * 50} />
            <Packet
              x1={x}
              y1={my - 40}
              x2={w.x}
              y2={w.y + 46}
              run={proc.anim && s === 1 && i !== 2}
              color={c.clayHex}
              delay={1000 + i * 60}
            />
          </g>
        ))}
        <WalletNode x={w.x} y={w.y} r={46} />
        {xs.map((x, i) => (
          <Member key={`m${i}`} x={x} y={my} label={`m${i + 1}`} tone={off(i) ? 'off' : 'idle'} />
        ))}
      </Canvas>
      <At x={120} y={300} w={290}>
        <Fade show={s >= 1} dimTo={0.35}>
          <Label color={c.cool}>Public plane</Label>
          <Note style={{ marginTop: 8, fontSize: 28, color: c.ink }}>
            Cashu API on every member
          </Note>
        </Fade>
      </At>
      <At x={120} y={720} w={290}>
        <Fade show={s >= 2} dimTo={0.35}>
          <Label color={c.violet}>Private plane</Label>
          <Note style={{ marginTop: 8, fontSize: 28, color: c.ink }}>
            consensus, catch-up, DKG
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Wallets: public API
        </StepItem>
        <StepItem n={2} step={s}>
          Members: private plane
        </StepItem>
        <StepItem n={3} step={s}>
          2 offline: ordering stops
        </StepItem>
      </StepList>
    </Shell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 04 · Keys and membership
// ═════════════════════════════════════════════════════════════════════════════

const DKG_ROWS: [string, number, number, number, number][] = [
  ['m1', 3, 3, 2, 8],
  ['m2', 4, 2, 3, 9],
  ['m3', 5, 1, 4, 10],
];

const Dkg: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  // Toy example: f₁ = 2 + x, f₂ = 4 − x, f₃ = 1 + x, sum f = 7 + x.
  const X = (x: number) => 200 + 180 * x;
  const Y = (y: number) => 900 - 48 * y;
  const f1 = (x: number) => 2 + x;
  const f2 = (x: number) => 4 - x;
  const f3 = (x: number) => 1 + x;
  const sum = (x: number) => f1(x) + f2(x) + f3(x);
  const lineOp = s >= 3 ? 0.3 : 1;
  const sub = ['₁', '₂', '₃'];
  const cols = [c.cool, c.violet, c.good];
  return (
    <Shell n="1.4" eyebrow="Keys and membership" title="Distributed key generation" proc={proc}>
      <Canvas>
        <Line x1={200} y1={900} x2={900} y2={900} color={c.node} />
        <Line x1={200} y1={900} x2={200} y2={330} color={c.node} />
        <Draw x1={X(0)} y1={Y(f1(0))} x2={X(3.5)} y2={Y(f1(3.5))} show={s >= 1} color={c.cool} width={2.5} opacity={lineOp} />
        <Draw x1={X(0)} y1={Y(f2(0))} x2={X(3.5)} y2={Y(f2(3.5))} show={s >= 1} color={c.violet} width={2.5} delay={80} opacity={lineOp} />
        <Draw x1={X(0)} y1={Y(f3(0))} x2={X(3.5)} y2={Y(f3(3.5))} show={s >= 1} color={c.good} width={2.5} delay={160} opacity={lineOp} />
        <T x={X(3.5) + 14} y={Y(f1(3.5)) + 10} size={28} font="math" anchor="start" color={c.cool} show={s >= 1}>
          f₁ = 2 + x
        </T>
        <T x={X(3.5) + 14} y={Y(f2(3.5)) + 10} size={28} font="math" anchor="start" color={c.violet} show={s >= 1}>
          f₂ = 4 − x
        </T>
        <T x={X(3.5) + 14} y={Y(f3(3.5)) - 6} size={28} font="math" anchor="start" color={c.good} show={s >= 1}>
          f₃ = 1 + x
        </T>
        {[1, 2, 3].map((i) => (
          <g key={`g${i}`}>
            <GFade show={s >= 2} delay={i * 60} to={0.8}>
              <line x1={X(i)} y1={900} x2={X(i)} y2={Y(sum(i)) - 18} style={{ stroke: c.line, strokeWidth: 1.5, strokeDasharray: '4 6' }} />
            </GFade>
            <Dot x={X(i)} y={Y(f1(i))} r={6} color={c.cool} show={s >= 2} delay={i * 60} />
            <Dot x={X(i)} y={Y(f2(i))} r={6} color={c.violet} show={s >= 2} delay={i * 60} />
            <Dot x={X(i)} y={Y(f3(i))} r={6} color={c.good} show={s >= 2} delay={i * 60} />
            <T x={X(i)} y={940} size={22} font="mono" color={c.muted} show={s >= 2} delay={i * 60}>
              {`m${i}`}
            </T>
            <Dot x={X(i)} y={Y(sum(i))} r={9} show={s >= 3} delay={400 + i * 60} />
            <T x={X(i)} y={Y(sum(i)) - 24} size={30} font="math" show={s >= 3} delay={400 + i * 60}>
              {`k${sub[i - 1]} = ${sum(i)}`}
            </T>
          </g>
        ))}
        <Draw x1={X(0)} y1={Y(sum(0))} x2={X(3.5)} y2={Y(sum(3.5))} show={s >= 3} width={3} />
        <T x={X(3.5) + 14} y={Y(sum(3.5)) + 10} size={28} font="math" anchor="start" color={c.clayHex} show={s >= 3}>
          f = 7 + x
        </T>
        <GFade show={s >= 4}>
          <circle cx={X(0)} cy={Y(sum(0))} r={18} style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 2, strokeDasharray: '4 5' }} />
          <T x={X(0) + 30} y={Y(sum(0)) + 44} size={30} font="math" anchor="start" color={c.clayHex}>
            k = 2 + 4 + 1 = 7
          </T>
        </GFade>
      </Canvas>
      <At x={1010} y={330} w={330}>
        <Fade show={s >= 2}>
          <div style={{ display: 'flex', fontSize: 24, color: c.muted }}>
            <span style={{ width: 80 }} />
            {['f₁', 'f₂', 'f₃'].map((f, j) => (
              <span key={f} style={{ width: 80, textAlign: 'center', fontFamily: MATH, fontStyle: 'italic', color: cols[j] }}>
                {f}
              </span>
            ))}
          </div>
          {DKG_ROWS.map(([m, a, b, d, k]) => (
            <div key={m} style={{ display: 'flex', alignItems: 'baseline', height: 64, borderBottom: `1px solid ${c.rule}` }}>
              <span style={{ width: 80, fontFamily: MONO, fontSize: 22, color: c.muted }}>{m}</span>
              {[a, b, d].map((v, j) => (
                <span key={j} style={{ width: 80, textAlign: 'center' }}>
                  <M size={32}>{v}</M>
                </span>
              ))}
            </div>
          ))}
        </Fade>
        <Fade show={s >= 3} style={{ marginTop: 18 }}>
          {DKG_ROWS.map(([m, , , , k], i) => (
            <div key={m} style={{ fontSize: 28, height: 44 }}>
              <M size={30}>
                k{sub[i]} = {DKG_ROWS[i][1]} + {DKG_ROWS[i][2]} + {DKG_ROWS[i][3]} = <Hi>{k}</Hi>
              </M>
            </div>
          ))}
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Each picks a random line
        </StepItem>
        <StepItem n={2} step={s}>
          Send <M>fⱼ(i)</M> to member <M>i</M>
        </StepItem>
        <StepItem n={3} step={s}>
          Add what you received
        </StepItem>
        <StepItem n={4} step={s}>
          <M>k = f(0)</M>: never computed
        </StepItem>
      </StepList>
    </Shell>
  );
};

const P2P = ({ x1, x2, y, show, delay, color }: { x1: number; x2: number; y: number; show: boolean; delay: number; color: string }) => (
  <Arrow x1={x1} y1={y} x2={x2 + (x2 > x1 ? -6 : 6)} y2={y} show={show} color={color} delay={delay} />
);

const DkgRounds: Page = () => {
  const proc = useProcess(7, 2000);
  const s = proc.step;
  const A = 300;
  const B = 680;
  const C = 1060;
  return (
    <Shell n="1.4" eyebrow="Keys and membership" title="DKG message flow" proc={proc}>
      <Canvas>
        <Lifeline x={A} label="m1" color={c.cool} />
        <Lifeline x={B} label="m2" color={c.violet} />
        <Lifeline x={C} label="m3" color={c.good} />
        <Band x1={A - 60} x2={C + 60} y={314} label="same ceremony, same policy" show={s >= 1} />
        <Band x1={A - 60} x2={C + 60} y={378} label="commit: hash of the reveal" show={s >= 2} />
        <Band x1={A - 60} x2={C + 60} y={442} label="reveal: coefficients · G₂" show={s >= 3} />
        <P2P x1={A} x2={B} y={494} show={s >= 4} delay={0} color={c.cool} />
        <P2P x1={A} x2={C} y={516} show={s >= 4} delay={60} color={c.cool} />
        <P2P x1={B} x2={A} y={538} show={s >= 4} delay={120} color={c.violet} />
        <P2P x1={B} x2={C} y={560} show={s >= 4} delay={180} color={c.violet} />
        <P2P x1={C} x2={A} y={582} show={s >= 4} delay={240} color={c.good} />
        <P2P x1={C} x2={B} y={604} show={s >= 4} delay={300} color={c.good} />
        <T x={C + 90} y={556} size={26} font="math" anchor="start" color={c.muted} show={s >= 4}>
          fⱼ(i)
        </T>
        <Band x1={A - 60} x2={C + 60} y={660} label="check each value, add" show={s >= 5} tone="clay" />
        <Band x1={A - 60} x2={C + 60} y={726} label="sign the transcript" show={s >= 6} />
        <Band x1={A - 60} x2={C + 60} y={792} label="activate" show={s >= 7} tone="cool" />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Ready
        </StepItem>
        <StepItem n={2} step={s}>
          Commit
        </StepItem>
        <StepItem n={3} step={s}>
          Reveal
        </StepItem>
        <StepItem n={4} step={s}>
          Deliver shares
        </StepItem>
        <StepItem n={5} step={s}>
          Verify and add
        </StepItem>
        <StepItem n={6} step={s}>
          Sign transcript
        </StepItem>
        <StepItem n={7} step={s}>
          Activate
        </StepItem>
      </StepList>
    </Shell>
  );
};

const TRI = (cx: number, cy: number) => [
  { x: cx, y: cy - 150 },
  { x: cx + 130, y: cy + 75 },
  { x: cx - 130, y: cy + 75 },
];
const TRI_PAIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
  [1, 2],
  [2, 1],
];
const TRI_MEMC = [c.cool, c.violet, c.good];
const triSeg = (ax: number, ay: number, bx: number, by: number, ra: number, rb: number) => {
  const d = Math.hypot(bx - ax, by - ay);
  const ux = (bx - ax) / d;
  const uy = (by - ay) / d;
  return { x1: ax + ux * ra, y1: ay + uy * ra, x2: bx - ux * rb, y2: by - uy * rb };
};

const TriPanel = ({ cx, cy, n, s, anim, kind, center = 'hash' }: { cx: number; cy: number; n: number; s: number; anim: boolean; kind: 'bcast' | 'private' | 'sign'; center?: string }) => {
  const P = TRI(cx, cy);
  const seen = s >= n;
  return (
    <g style={{ opacity: seen ? 1 : 0.15, transition: `opacity 500ms ${EASE_OUT}` }}>
      {kind !== 'sign' &&
        TRI_PAIRS.map(([a, b], k) => {
          const e = triSeg(P[a].x, P[a].y, P[b].x, P[b].y, 44, 44);
          const len = Math.hypot(e.x2 - e.x1, e.y2 - e.y1);
          const ox = (-(e.y2 - e.y1) / len) * 7;
          const oy = ((e.x2 - e.x1) / len) * 7;
          const col = kind === 'private' ? TRI_MEMC[a] : c.node;
          return (
            <g key={`p${k}`}>
              <Arrow x1={e.x1 + ox} y1={e.y1 + oy} x2={e.x2 + ox} y2={e.y2 + oy} show={seen} color={col} delay={k * 50} />
              <Packet
                x1={e.x1 + ox}
                y1={e.y1 + oy}
                x2={e.x2 + ox}
                y2={e.y2 + oy}
                run={anim && s === n}
                color={kind === 'private' ? TRI_MEMC[a] : c.muted}
                delay={300 + k * 80}
                r={6}
              />
            </g>
          );
        })}
      {kind === 'sign' &&
        P.map((p, k) => {
          const e = triSeg(p.x, p.y, cx, cy, 44, 34);
          return (
            <g key={`g${k}`}>
              <Arrow {...e} show={seen} color={c.cool} delay={k * 60} />
              <Packet {...e} run={anim && s === n} color={c.cool} delay={300 + k * 100} r={6} />
            </g>
          );
        })}
      {kind === 'sign' && (
        <g>
          <rect
            x={cx - 42}
            y={cy - 22}
            width={84}
            height={44}
            rx={8}
            style={{
              fill: seen ? c.claySoft : c.card,
              stroke: seen ? c.clayHex : c.node,
              strokeWidth: 1.75,
              transition: `fill 400ms ${EASE_OUT} 900ms, stroke 400ms ${EASE_OUT} 900ms`,
            }}
          />
          <text x={cx} y={cy + 8} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 22, fill: c.ink }}>
            {center}
          </text>
        </g>
      )}
      <Member x={P[0].x} y={P[0].y} r={36} label="m1" tone={s === n ? 'on' : 'idle'} />
      <Member x={P[1].x} y={P[1].y} r={36} label="m2" tone={s === n ? 'on' : 'idle'} />
      <Member x={P[2].x} y={P[2].y} r={36} label="m3" tone={s === n ? 'on' : 'idle'} />
    </g>
  );
};

const DKG_PHASES = ['Commit', 'Reveal', 'Deliver', 'Sign'];

const DkgOverview: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const cy = 540;
  const xs = [330, 740, 1150, 1560];
  const lab = (on: boolean): CSSProperties => ({
    fontFamily: MATH,
    fontStyle: 'italic',
    fontSize: 34,
    fill: on ? c.ink : c.muted,
    transition: `fill 300ms ${EASE_OUT}`,
  });
  return (
    <Shell n="1.4" eyebrow="Keys and membership" title="Commit, reveal, deliver, sign" proc={proc}>
      {DKG_PHASES.map((p, i) => (
        <div
          key={p}
          style={{
            position: 'absolute',
            left: xs[i] - 150,
            top: 272,
            width: 300,
            textAlign: 'center',
            fontFamily: SERIF,
            fontSize: 40,
            color: s >= i + 1 ? c.ink : c.dim,
            transition: `color 300ms ${EASE_OUT}`,
          }}
        >
          {p}
        </div>
      ))}
      <Canvas>
        <TriPanel cx={xs[0]} cy={cy} n={1} s={s} anim={proc.anim} kind="bcast" />
        <TriPanel cx={xs[1]} cy={cy} n={2} s={s} anim={proc.anim} kind="bcast" />
        <TriPanel cx={xs[2]} cy={cy} n={3} s={s} anim={proc.anim} kind="private" />
        <TriPanel cx={xs[3]} cy={cy} n={4} s={s} anim={proc.anim} kind="sign" />
        <text x={xs[0]} y={cy + 180} textAnchor="middle" style={lab(s === 1)}>
          H(reveal)
        </text>
        <text x={xs[1]} y={cy + 180} textAnchor="middle" style={lab(s === 2)}>
          a·G₂
        </text>
        <text x={xs[2]} y={cy + 180} textAnchor="middle" style={lab(s === 3)}>
          fⱼ(i)
        </text>
        <text x={xs[3]} y={cy + 180} textAnchor="middle" style={{ ...lab(s === 4), fontFamily: SANS, fontStyle: 'normal', fontSize: 30 }}>
          transcript
        </text>
        <line x1={xs[0]} y1={cy + 260} x2={xs[3]} y2={cy + 260} style={{ stroke: c.rule, strokeWidth: 2 }} />
        <Draw x1={xs[0]} y1={cy + 260} x2={xs[1]} y2={cy + 260} show={s >= 2} width={3} />
        <Draw x1={xs[1]} y1={cy + 260} x2={xs[2]} y2={cy + 260} show={s >= 3} width={3} />
        <Draw x1={xs[2]} y1={cy + 260} x2={xs[3]} y2={cy + 260} show={s >= 4} width={3} />
        {xs.map((x, i) => (
          <circle
            key={`d${i}`}
            cx={x}
            cy={cy + 260}
            r={10}
            style={{ fill: s >= i + 1 ? c.clayHex : c.card, stroke: s >= i + 1 ? c.clayHex : c.node, strokeWidth: 2, transition: `fill 300ms ${EASE_OUT}` }}
          />
        ))}
      </Canvas>
    </Shell>
  );
};

const ROSTER_A =
  'fed:v1|t=2|c=3|m1,https://m1.mint.example,4c1f09|m2,https://m2.mint.example,9a07e2|m3,https://m3.mint.example,e21b77';
const ROSTER_B =
  'fed:v1|t=2|c=3|m1,https://m1.mint.example,4c1f09|m2,https://m2.mint.example.org,9a07e2|m3,https://m3.mint.example,e21b77';

const RosterLine = ({ m, url, id, hot }: { m: string; url: ReactNode; id: string; hot?: boolean }) => (
  <div
    style={{
      display: 'flex',
      gap: 24,
      background: hot ? c.claySoft : 'transparent',
      borderRadius: 6,
      padding: '2px 10px',
      margin: '0 -10px',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    <span style={{ color: c.muted }}>{m}</span>
    <span style={{ flex: 1 }}>{url}</span>
    <span style={{ color: c.dim }}>{id}…</span>
  </div>
);

const FederationId: Page = () => {
  const proc = useProcess(1, 2400);
  const s = proc.step;
  const hex = useSha256(s >= 1 ? ROSTER_B : ROSTER_A);
  return (
    <Shell n="1.4" eyebrow="Keys and membership" title="Federation ID" proc={proc}>
      <At x={120} y={270} w={780}>
        <div
          style={{
            border: `1.5px solid ${c.rule}`,
            borderRadius: 'var(--osd-radius)',
            background: c.card,
            padding: '20px 32px',
            fontFamily: MONO,
            fontSize: 22,
            lineHeight: 1.9,
          }}
        >
          <Label>Setup transcript</Label>
          <div>
            <span style={{ color: c.muted }}>thresholds </span>t=2 c=3
          </div>
          <RosterLine m="m1" url="https://m1.mint.example" id="4c1f" />
          <RosterLine
            m="m2"
            hot={s >= 1}
            url={
              <>
                https://m2.mint.example
                <span style={{ color: c.clayHex, opacity: s >= 1 ? 1 : 0, transition: `opacity 300ms ${EASE_OUT}` }}>
                  .org
                </span>
              </>
            }
            id="9a07"
          />
          <RosterLine m="m3" url="https://m3.mint.example" id="e21b" />
        </div>
      </At>
      <At x={980} y={270} w={820}>
        <Note>
          <Code color={c.ink}>federation_id = SHA-256(domain ‖ transcript)</Code>
        </Note>
        <div
          key={hex}
          style={{
            fontFamily: MONO,
            fontSize: 30,
            lineHeight: 1.5,
            marginTop: 14,
            color: s >= 1 ? c.violet : c.clayHex,
            animation: REDUCED ? 'none' : `fc-in 400ms ${EASE_OUT} both`,
          }}
        >
          {hex.slice(0, 32)}
          <br />
          {hex.slice(32)}
        </div>
      </At>
      <At x={980} y={470} w={820}>
        <Note>
          Hashed: setup authorization, thresholds, and for every member its ID, both URLs and identity key. Any change
          produces a different federation ID.
        </Note>
      </At>
      <At x={120} y={620} w={1680}>
        <div style={{ height: 1, background: c.rule, marginBottom: 20 }} />
        <Label>Requires a new federation</Label>
        <Note style={{ marginTop: 8 }}>
          adding, removing or replacing a member · rotating an identity key · changing <M>t</M> or <M>c</M> · payment
          observation policy · Bitcoin network · FROST epoch · wallet protocol version · HTTPS ↔ iroh · a DNS name in
          the roster
        </Note>
        <div style={{ marginTop: 20 }}>
          <Label>Consensus-mutable</Label>
        </div>
        <Note style={{ marginTop: 8 }}>
          <Code>KeysetRotation</Code> is the only consensus mutation of the public signing surface.
        </Note>
        <div style={{ marginTop: 20 }}>
          <Label>Open</Label>
        </div>
        <Note style={{ marginTop: 8 }}>
          locator vs. identity (DNS) · genesis vs. policy amendments · member repair vs. replacement · user migration
        </Note>
      </At>
    </Shell>
  );
};

const JOURNAL_X = 300;
const Block = ({ i, row, filled, tone = c.node, delay = 0 }: { i: number; row: number; filled: boolean; tone?: string; delay?: number }) => (
  <div
    style={{
      position: 'absolute',
      left: JOURNAL_X + i * 58,
      top: row - 22,
      width: 48,
      height: 44,
      borderRadius: 6,
      boxSizing: 'border-box',
      border: `1.5px solid ${filled ? tone : c.rule}`,
      background: filled ? (tone === c.clayHex ? c.claySoft : c.panel) : c.card,
      transform: filled || REDUCED ? 'scale(1)' : 'scale(0.96)',
      transition: `background 300ms ${EASE_OUT} ${filled ? delay : 0}ms, border-color 300ms ${EASE_OUT} ${filled ? delay : 0}ms, transform 300ms ${EASE_OUT} ${filled ? delay : 0}ms`,
    }}
  />
);

const Journal = ({ row, label, have, extra, extraOn }: { row: number; label: string; have: number; extra?: number; extraOn?: boolean }) => (
  <>
    <At x={120} y={row - 16} style={{ fontFamily: MONO, fontSize: 24 }}>
      {label}
    </At>
    {Array.from({ length: 12 }, (_, i) => {
      const own = i < have;
      const fromPeers = extra !== undefined && i >= 6 && i < 6 + extra;
      return (
        <Block
          key={i}
          i={i}
          row={row}
          filled={own || (fromPeers && !!extraOn)}
          tone={fromPeers ? c.clayHex : c.node}
          delay={fromPeers ? (i - 6) * 60 : 0}
        />
      );
    })}
  </>
);

const Recovery: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const rows = [380, 520, 660];
  const digestX = JOURNAL_X + 12 * 58 + 30;
  const ax = JOURNAL_X + 9 * 58;
  return (
    <Shell n="1.4" eyebrow="Keys and membership" title="Restart, restore and catch-up" proc={proc}>
      <Journal row={rows[0]} label="m1" have={12} />
      <Journal row={rows[1]} label="m2" have={s >= 1 ? 6 : 0} extra={6} extraOn={s >= 3} />
      <Journal row={rows[2]} label="m3" have={12} />
      <At x={JOURNAL_X + 6 * 58 - 60} y={rows[1] - 62} w={200}>
        <Fade show={s >= 1}>
          <span style={{ fontSize: 20, color: c.muted }}>checkpoint</span>
        </Fade>
      </At>
      <Canvas>
        <GFade show={s >= 1}>
          <line
            x1={JOURNAL_X + 6 * 58 - 5}
            y1={rows[1] - 32}
            x2={JOURNAL_X + 6 * 58 - 5}
            y2={rows[1] + 32}
            style={{ stroke: c.ink, strokeWidth: 2 }}
          />
        </GFade>
        <Arrow x1={ax} y1={rows[0] + 26} x2={ax} y2={rows[1] - 28} show={s >= 2} color={c.clayHex} />
        <Arrow x1={ax} y1={rows[2] - 26} x2={ax} y2={rows[1] + 28} show={s >= 2} color={c.clayHex} />
        <Packet x1={ax} y1={rows[0] + 26} x2={ax} y2={rows[1] - 28} run={proc.anim && s === 2} color={c.clayHex} />
        <Packet x1={ax} y1={rows[2] - 26} x2={ax} y2={rows[1] + 28} run={proc.anim && s === 2} color={c.clayHex} delay={100} />
      </Canvas>
      <At x={digestX} y={rows[0] - 14} style={{ fontFamily: MONO, fontSize: 20, color: c.muted }}>
        state 9f3a…
      </At>
      <At x={digestX} y={rows[1] - 14} style={{ fontFamily: MONO, fontSize: 20 }}>
        <Fade show={s >= 4}>
          <span style={{ color: c.good }}>state 9f3a… ✓</span>
        </Fade>
      </At>
      <At x={digestX} y={rows[2] - 14} style={{ fontFamily: MONO, fontSize: 20, color: c.muted }}>
        state 9f3a…
      </At>
      <At x={120} y={740} w={1180}>
        <Fade show={s >= 5}>
          <span
            style={{
              display: 'inline-block',
              border: `1.5px solid ${c.good}`,
              background: c.goodSoft,
              color: c.good,
              borderRadius: 999,
              padding: '6px 20px',
              fontSize: 22,
            }}
          >
            m2 ready: serving and signing
          </span>
        </Fade>
        <Note style={{ marginTop: 30, fontSize: 32, color: c.ink }}>
          Keys are not recoverable from peers.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Restore a checkpoint
        </StepItem>
        <StepItem n={2} step={s}>
          Fetch the missing log
        </StepItem>
        <StepItem n={3} step={s}>
          Replay it
        </StepItem>
        <StepItem n={4} step={s}>
          Match the signed checkpoint
        </StepItem>
        <StepItem n={5} step={s}>
          Ready: sign again
        </StepItem>
      </StepList>
    </Shell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 05 · Custody
// ═════════════════════════════════════════════════════════════════════════════

const Funding: Page = () => {
  const proc = useProcess(2, 2400);
  const s = proc.step;
  const xs = [300, 460, 620, 780, 940];
  const my = 330;
  const bx = 620;
  const by = 640;
  const center: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <Shell n="1.5" eyebrow="Custody" title="Funding backends" proc={proc}>
      <Canvas>
        {xs.map((x, i) => (
          <line
            key={`l${i}`}
            x1={x}
            y1={my + 40}
            x2={bx}
            y2={by - 60}
            style={{
              stroke: s >= 2 ? c.cool : c.node,
              strokeWidth: 1.5,
              strokeDasharray: s >= 2 ? '5 6' : 'none',
              opacity: s >= 1 ? 0.8 : 0,
              transition: `opacity 400ms ${EASE_OUT} ${i * 40}ms, stroke 300ms ${EASE_OUT}`,
            }}
          />
        ))}
        {xs.map((x, i) => (
          <g key={`m${i}`}>
            <Member x={x} y={my} label={`m${i + 1}`} tone="on" />
            <GFade show={s >= 2} delay={i * 50}>
              <rect x={x - 38} y={my + 54} width={76} height={30} rx={6} style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 1.5 }} />
              <text x={x} y={my + 77} textAnchor="middle" style={{ fontFamily: MATH, fontStyle: 'italic', fontSize: 24, fill: c.cool }}>
                s{['₁', '₂', '₃', '₄', '₅'][i]}
              </text>
            </GFade>
          </g>
        ))}
      </Canvas>
      <div
        style={{
          position: 'absolute',
          left: bx - 220,
          top: by - 60,
          width: 440,
          height: 120,
          boxSizing: 'border-box',
          border: `1.75px solid ${s >= 2 ? c.cool : c.bad}`,
          background: c.card,
          borderRadius: 'var(--osd-radius)',
          opacity: s >= 1 ? 1 : 0,
          transition: `opacity 400ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
        }}
      >
        <Fade show={s === 1} style={center}>
          <div style={{ fontSize: 28 }}>one CLN / LND / BDK node</div>
          <div style={{ fontSize: 22, color: c.muted }}>keys held by one operator</div>
        </Fade>
        <Fade show={s >= 2} style={center}>
          <div style={{ fontSize: 28 }}>
            treasury key <M>P</M>
          </div>
          <div style={{ fontSize: 22, color: c.muted }}>
            FROST, <M>t</M>-of-<M>n</M> on secp256k1
          </div>
        </Fade>
      </div>
      <At x={120} y={250}>
        <Label color={c.clayHex}>Ecash issuer · BLS threshold</Label>
      </At>
      <At x={120} y={800} w={1100}>
        <div style={{ position: 'relative', height: 120 }}>
          <Fade show={s === 1} style={{ position: 'absolute', inset: 0 }}>
            <div style={{ fontSize: 34, color: c.bad }}>One operator can spend the reserves.</div>
          </Fade>
          <Fade show={s >= 2} style={{ position: 'absolute', inset: 0 }}>
            <div style={{ fontSize: 34, color: c.good }}>
              Spending needs <M>t</M> members.
            </div>
          </Fade>
        </div>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          One-operator backend
        </StepItem>
        <StepItem n={2} step={s}>
          Threshold custody
        </StepItem>
      </StepList>
    </Shell>
  );
};

const Badge = ({
  x,
  y,
  label,
  color,
  soft,
  show,
  delay = 0,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  soft: string;
  show: boolean;
  delay?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - 80,
      top: y,
      width: 160,
      textAlign: 'center',
      border: `1.5px solid ${color}`,
      background: soft,
      borderRadius: 8,
      padding: '6px 0',
      fontFamily: SANS,
      fontSize: 21,
      color,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT} ${show ? delay : 0}ms, transform 400ms ${EASE_OUT} ${show ? delay : 0}ms`,
    }}
  >
    {label}
  </div>
);

const CHAIN_X = (i: number) => 120 + i * 282;
const ChainChip = ({ i, label, show }: { i: number; label: ReactNode; show: boolean }) => (
  <div
    style={{
      position: 'absolute',
      left: CHAIN_X(i),
      top: 760,
      width: 236,
      height: 76,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.cool}`,
      background: c.card,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: 22,
      lineHeight: 1.25,
      padding: '0 10px',
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT} ${show ? i * 70 : 0}ms, transform 400ms ${EASE_OUT} ${show ? i * 70 : 0}ms`,
    }}
  >
    {label}
  </div>
);

const KeyMaterial: Page = () => {
  const proc = useProcess(3, 2000);
  const s = proc.step;
  const xs = [760, 950, 1140, 1330, 1520];
  return (
    <Shell n="1.5" eyebrow="Custody" title="Two DKG ceremonies, one roster" proc={proc}>
      <Canvas>
        {xs.map((x, i) => (
          <Member key={i} x={x} y={300} r={36} label={`m${i + 1}`} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Arrow
            key={`a${i}`}
            x1={CHAIN_X(i) + 240}
            y1={798}
            x2={CHAIN_X(i + 1) - 6}
            y2={798}
            show={s >= 3}
            color={c.cool}
            delay={i * 70 + 150}
          />
        ))}
      </Canvas>
      <Badge x={xs[0]} y={352} label="BLS kᵢ" color={c.clayHex} soft={c.claySoft} show={s >= 1} />
      <Badge x={xs[1]} y={352} label="BLS kᵢ" color={c.clayHex} soft={c.claySoft} show={s >= 1} delay={50} />
      <Badge x={xs[2]} y={352} label="BLS kᵢ" color={c.clayHex} soft={c.claySoft} show={s >= 1} delay={100} />
      <Badge x={xs[3]} y={352} label="BLS kᵢ" color={c.clayHex} soft={c.claySoft} show={s >= 1} delay={150} />
      <Badge x={xs[4]} y={352} label="BLS kᵢ" color={c.clayHex} soft={c.claySoft} show={s >= 1} delay={200} />
      <Badge x={xs[0]} y={402} label="FROST sᵢ" color={c.cool} soft={c.coolSoft} show={s >= 2} />
      <Badge x={xs[1]} y={402} label="FROST sᵢ" color={c.cool} soft={c.coolSoft} show={s >= 2} delay={50} />
      <Badge x={xs[2]} y={402} label="FROST sᵢ" color={c.cool} soft={c.coolSoft} show={s >= 2} delay={100} />
      <Badge x={xs[3]} y={402} label="FROST sᵢ" color={c.cool} soft={c.coolSoft} show={s >= 2} delay={150} />
      <Badge x={xs[4]} y={402} label="FROST sᵢ" color={c.cool} soft={c.coolSoft} show={s >= 2} delay={200} />
      <At x={120} y={360} w={600}>
        <Fade show={s >= 1} dimTo={0.3}>
          <div style={{ fontSize: 30 }}>ecash: BLS, one key per amount</div>
        </Fade>
        <Fade show={s >= 2} dimTo={0.3} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 30 }}>treasury: FROST, one root key</div>
        </Fade>
      </At>

      <At x={120} y={700}>
        <Fade show={s >= 3}>
          <Label color={c.cool}>Wallet keys derive from the root</Label>
        </Fade>
      </At>
      <ChainChip
        i={0}
        show={s >= 3}
        label={
          <>
            root <M size={26}>P</M>
          </>
        }
      />
      <ChainChip i={1} show={s >= 3} label="domain tweak" />
      <ChainChip i={2} show={s >= 3} label="chain code" />
      <ChainChip i={3} show={s >= 3} label="non-hardened BIP32" />
      <ChainChip i={4} show={s >= 3} label="BIP340 even-Y" />
      <ChainChip i={5} show={s >= 3} label="BIP341 key-path tweak" />
      <At x={120} y={880} w={1680}>
        <Fade show={s >= 3} delay={500}>
          <div style={{ fontSize: 32 }}>One root key, never reconstructed.</div>
        </Fade>
      </At>
    </Shell>
  );
};

const Melt: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <Shell n="1.5" eyebrow="Custody" title="On-chain melt: intent to broadcast" proc={proc}>
      <PipeArrows proc={proc} />
      <PipeStage x={PIPE_X[0]} n={1} title="Intent" step={s}>
        ordered by consensus, no funds move
      </PipeStage>
      <PipeStage x={PIPE_X[1]} n={2} title="Proposal" step={s}>
        exact unsigned transaction
      </PipeStage>
      <PipeStage x={PIPE_X[2]} n={3} title="Recompute" step={s}>
        every member checks it
      </PipeStage>
      <PipeStage x={PIPE_X[3]} n={4} title="FROST sign" step={s} tone={c.cool}>
        <M>t</M> members, fresh nonces
      </PipeStage>
      <PipeStage x={PIPE_X[4]} n={5} title="Broadcast" step={s}>
        stored first, same bytes on replay
      </PipeStage>
      <At x={120} y={700} w={1680}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 34 }}>One member can propose. It cannot change what gets signed.</div>
        </Fade>
      </At>
    </Shell>
  );
};

const CUST_X = [300, 480, 660, 840, 1020];
const CUST_MY = 600;

const QuorumBox = ({ y, label, sub, value, tone, fill }: { y: number; label: string; sub: ReactNode; value: string; tone: string; fill: string }) => (
  <div
    style={{
      position: 'absolute',
      left: 180,
      top: y,
      width: 960,
      height: 110,
      boxSizing: 'border-box',
      border: `1.75px solid ${tone}`,
      background: fill,
      borderRadius: 'var(--osd-radius)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      transition: `border-color 400ms ${EASE_OUT}, background 400ms ${EASE_OUT}`,
    }}
  >
    <div>
      <div style={{ fontFamily: SERIF, fontSize: 36 }}>{label}</div>
      <div style={{ fontSize: 24, color: c.muted }}>{sub}</div>
    </div>
    <div key={value} style={{ fontFamily: SERIF, fontSize: 52, color: tone, animation: REDUCED ? 'none' : `fc-in 400ms ${EASE_OUT} both` }}>
      {value}
    </div>
  </div>
);

const CustodyQuorum: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  const single = s === 2;
  const frost = s >= 3;
  const ecashOn = (i: number) => s >= 1 && i < 3;
  const resOn = (i: number) => (single ? i === 0 : frost ? i < 3 : false);
  const resTone = single ? c.bad : frost ? c.cool : c.rule;
  return (
    <Shell n="1.5" eyebrow="Custody" title="One threshold for ecash and reserves" proc={proc}>
      <QuorumBox
        y={290}
        label="Ecash issuance"
        sub="BLS threshold signatures"
        value={s >= 1 ? '3 of 5' : ''}
        tone={s >= 1 ? c.clayHex : c.rule}
        fill={s >= 1 ? c.claySoft : c.card}
      />
      <QuorumBox
        y={800}
        label="Reserves"
        sub={single ? 'one operator holds the key' : frost ? 'FROST treasury key' : 'Lightning and on-chain funds'}
        value={single ? '1 of 5' : frost ? '3 of 5' : ''}
        tone={resTone}
        fill={single ? c.badSoft : frost ? c.coolSoft : c.card}
      />
      <Canvas>
        {CUST_X.map((x, i) => (
          <g key={x}>
            <line
              x1={x}
              y1={CUST_MY - 46}
              x2={x}
              y2={400}
              style={{ stroke: c.clayHex, strokeWidth: 2.5, opacity: ecashOn(i) ? 0.9 : 0.12, transition: `opacity 400ms ${EASE_OUT} ${i * 60}ms` }}
            />
            <line
              x1={x}
              y1={CUST_MY + 46}
              x2={x}
              y2={800}
              style={{ stroke: single ? c.bad : c.cool, strokeWidth: 2.5, opacity: resOn(i) ? 0.9 : 0.12, transition: `opacity 400ms ${EASE_OUT} ${i * 60}ms, stroke 300ms ${EASE_OUT}` }}
            />
            <Member x={x} y={CUST_MY} r={44} label={`m${i + 1}`} tone={single && i === 0 ? 'bad' : ecashOn(i) || resOn(i) ? 'on' : 'idle'} />
          </g>
        ))}
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Ecash: 3 of 5 sign
        </StepItem>
        <StepItem n={2} step={s}>
          One-operator backend
        </StepItem>
        <StepItem n={3} step={s}>
          FROST: 3 of 5 spend
        </StepItem>
      </StepList>
    </Shell>
  );
};

const FrostDkg: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const cy = 520;
  const xs = [360, 960, 1560];
  const heads = ['Commit', 'Share', 'Confirm'];
  const lab = (on: boolean): CSSProperties => ({
    fontFamily: MATH,
    fontStyle: 'italic',
    fontSize: 34,
    fill: on ? c.ink : c.muted,
    transition: `fill 300ms ${EASE_OUT}`,
  });
  return (
    <Shell n="1.5" eyebrow="Custody" title="FROST key generation" proc={proc}>
      {heads.map((h, i) => (
        <div
          key={h}
          style={{
            position: 'absolute',
            left: xs[i] - 200,
            top: 262,
            width: 400,
            textAlign: 'center',
            fontFamily: SERIF,
            fontSize: 40,
            color: s >= i + 1 ? c.ink : c.dim,
            transition: `color 300ms ${EASE_OUT}`,
          }}
        >
          {h}
        </div>
      ))}
      <Canvas>
        <TriPanel cx={xs[0]} cy={cy} n={1} s={s} anim={proc.anim} kind="bcast" />
        <TriPanel cx={xs[1]} cy={cy} n={2} s={s} anim={proc.anim} kind="private" />
        <TriPanel cx={xs[2]} cy={cy} n={3} s={s} anim={proc.anim} kind="sign" center="P" />
        <text x={xs[0]} y={cy + 170} textAnchor="middle" style={lab(s === 1)}>
          a·G + proof
        </text>
        <text x={xs[1]} y={cy + 170} textAnchor="middle" style={lab(s === 2)}>
          fⱼ(i)
        </text>
        <text x={xs[2]} y={cy + 170} textAnchor="middle" style={{ ...lab(s === 3), fontFamily: SANS, fontStyle: 'normal', fontSize: 30 }}>
          same key P
        </text>
      </Canvas>
      <At x={120} y={800} w={1680}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 36, textAlign: 'center' }}>
            One key <M>P</M> on secp256k1. Any <M>t</M> members sign; the private key never exists.
          </div>
        </Fade>
      </At>
    </Shell>
  );
};

const ShareBadge = ({ x, y, label, tone, soft, show, delay }: { x: number; y: number; label: ReactNode; tone: string; soft: string; show: boolean; delay: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 70,
      top: y,
      width: 140,
      textAlign: 'center',
      border: `1.75px solid ${tone}`,
      background: soft,
      borderRadius: 10,
      padding: '8px 0',
      fontSize: 28,
      color: tone,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT} ${show ? delay : 0}ms, transform 400ms ${EASE_OUT} ${show ? delay : 0}ms`,
    }}
  >
    {label}
  </div>
);

const UseCard = ({ y, show, tone, soft, title, line }: { y: number; show: boolean; tone: string; soft: string; title: ReactNode; line: string }) => (
  <Fade show={show} style={{ position: 'absolute', left: 980, top: y, width: 360 }}>
    <div style={{ border: `1.75px solid ${tone}`, background: soft, borderRadius: 'var(--osd-radius)', padding: '18px 26px' }}>
      <div style={{ fontFamily: SERIF, fontSize: 36 }}>{title}</div>
      <div style={{ fontSize: 26, color: c.muted, marginTop: 6 }}>{line}</div>
    </div>
  </Fade>
);

const TwoShares: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  const xs = [200, 360, 520, 680, 840];
  return (
    <Shell n="1.5" eyebrow="Custody" title="Two key shares per member" proc={proc}>
      <Canvas>
        {xs.map((x, i) => (
          <Member key={x} x={x} y={300} r={42} label={`m${i + 1}`} tone={s >= 3 ? 'on' : 'idle'} />
        ))}
        <Arrow x1={916} y1={437} x2={968} y2={437} show={s >= 1} color={c.clayHex} delay={300} />
        <Arrow x1={916} y1={617} x2={968} y2={617} show={s >= 2} color={c.cool} delay={300} />
      </Canvas>
      {xs.map((x, i) => (
        <ShareBadge key={`b${x}`} x={x} y={412} label={<M>kᵢ</M>} tone={c.clayHex} soft={c.claySoft} show={s >= 1} delay={i * 60} />
      ))}
      {xs.map((x, i) => (
        <ShareBadge key={`f${x}`} x={x} y={592} label={<M>sᵢ</M>} tone={c.cool} soft={c.coolSoft} show={s >= 2} delay={i * 60} />
      ))}
      <UseCard y={378} show={s >= 1} tone={c.clayHex} soft={c.claySoft} title="BLS shares" line="sign ecash" />
      <UseCard y={558} show={s >= 2} tone={c.cool} soft={c.coolSoft} title="FROST share" line="signs Bitcoin transactions" />
      <At x={120} y={800} w={1220}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 34 }}>Same roster, same threshold, two separate ceremonies.</div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          BLS shares: ecash
        </StepItem>
        <StepItem n={2} step={s}>
          FROST shares: reserves
        </StepItem>
        <StepItem n={3} step={s}>
          Same roster, same <M>t</M>
        </StepItem>
      </StepList>
    </Shell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 06 · Client intent
// ═════════════════════════════════════════════════════════════════════════════

const Rewrite: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const w = { x: 250, y: 560 };
  const m = [
    { x: 700, y: 380 },
    { x: 700, y: 560 },
    { x: 700, y: 740 },
  ];
  const box = { x: 1000, y: 560 };
  return (
    <Shell n="1.6" eyebrow="Client intent" title="Proof rewriting by a Byzantine member" proc={proc}>
      <Canvas>
        <Line x1={w.x} y1={w.y} x2={m[0].x} y2={m[0].y} />
        <Line x1={w.x} y1={w.y} x2={m[1].x} y2={m[1].y} />
        <Line x1={w.x} y1={w.y} x2={m[2].x} y2={m[2].y} />
        <Line x1={m[0].x} y1={m[0].y} x2={box.x} y2={box.y} />
        <Line x1={m[1].x} y1={m[1].y} x2={box.x} y2={box.y} />
        <Line x1={m[2].x} y1={m[2].y} x2={box.x} y2={box.y} color={s >= 2 ? c.bad : c.line} />
        <Packet x1={w.x} y1={w.y} x2={m[0].x} y2={m[0].y} run={proc.anim && s === 1} />
        <Packet x1={w.x} y1={w.y} x2={m[1].x} y2={m[1].y} run={proc.anim && s === 1} delay={50} />
        <Packet x1={w.x} y1={w.y} x2={m[2].x} y2={m[2].y} run={proc.anim && s === 1} delay={100} />
        <Packet x1={m[2].x} y1={m[2].y} x2={box.x} y2={box.y} run={proc.anim && s === 2} color={c.bad} dur={600} />
        <Packet x1={m[0].x} y1={m[0].y} x2={box.x} y2={box.y} run={proc.anim && s === 2} dur={1200} delay={300} />
        <WalletNode x={w.x} y={w.y} r={56} />
        <Member x={m[0].x} y={m[0].y} label="m1" />
        <Member x={m[1].x} y={m[1].y} label="m2" />
        <Member x={m[2].x} y={m[2].y} label="m3" tone={s >= 2 ? 'bad' : 'idle'} />
      </Canvas>
      <At x={120} y={300} w={460}>
        <Fade show={s >= 1}>
          <span style={{ fontFamily: MONO, fontSize: 26, color: c.cool }}>swap P₁ P₂ → A B</span>
        </Fade>
      </At>
      <At x={540} y={800} w={440}>
        <Fade show={s >= 2}>
          <span style={{ fontFamily: MONO, fontSize: 26, color: c.bad }}>swap P₁ P₂ → X Y</span>
        </Fade>
      </At>
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y - 70,
          width: 220,
          height: 140,
          boxSizing: 'border-box',
          border: `1.75px solid ${c.node}`,
          background: c.panel,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: SERIF,
          fontSize: 30,
        }}
      >
        consensus
      </div>
      <At x={1000} y={680} w={330}>
        <Fade show={s >= 3} style={{ marginBottom: 14 }}>
          <div
            style={{
              border: `1.5px solid ${c.bad}`,
              background: c.badSoft,
              borderRadius: 10,
              padding: '10px 18px',
              fontFamily: MONO,
              fontSize: 24,
            }}
          >
            X Y <span style={{ color: c.bad }}>applied</span>
          </div>
        </Fade>
        <Fade show={s >= 3} delay={150}>
          <div
            style={{
              border: `1.5px solid ${c.rule}`,
              background: c.card,
              borderRadius: 10,
              padding: '10px 18px',
              fontFamily: MONO,
              fontSize: 24,
              color: c.dim,
            }}
          >
            A B already spent
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          All members see the proofs
        </StepItem>
        <StepItem n={2} step={s}>
          m3 swaps them first
        </StepItem>
        <StepItem n={3} step={s}>
          The owner's swap fails
        </StepItem>
        <StepItem n={4} step={s}>
          Nothing binds the outputs
        </StepItem>
      </StepList>
    </Shell>
  );
};

const TxSide = ({ items, tone, hot }: { items: string[]; tone: string; hot?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    {items.map((it) => (
      <div
        key={it}
        style={{
          width: 170,
          height: 76,
          boxSizing: 'border-box',
          border: `1.75px solid ${tone}`,
          background: hot ? c.badSoft : c.card,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: 30,
          transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
        }}
      >
        {it}
      </div>
    ))}
  </div>
);

const SigAll: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  const swapped = s >= 2;
  return (
    <Shell n="1.6" eyebrow="Client intent" title="SIG_ALL for every transaction" proc={proc}>
      <At x={120} y={330} w={1200}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <TxSide items={['P₁', 'P₂']} tone={c.cool} />
          <div style={{ fontSize: 44, color: c.muted }}>→</div>
          <div style={{ position: 'relative' }}>
            <Fade show={!swapped} style={{ position: 'absolute', inset: 0 }}>
              <TxSide items={['A', 'B']} tone={c.cool} />
            </Fade>
            <Fade show={swapped}>
              <TxSide items={['X', 'Y']} tone={c.bad} hot />
            </Fade>
          </div>
          <div style={{ marginLeft: 40 }}>
            <Fade show={s >= 1}>
              <div
                style={{
                  border: `1.75px solid ${swapped ? c.bad : c.good}`,
                  background: swapped ? c.badSoft : c.goodSoft,
                  borderRadius: 12,
                  padding: '18px 26px',
                  fontSize: 30,
                  transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
                }}
              >
                {swapped ? 'signature invalid' : 'each input signs inputs and outputs'}
              </div>
            </Fade>
          </div>
        </div>
      </At>
      <At x={120} y={680} w={1200}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 36, lineHeight: 1.5 }}>
            <div>
              Before v3: <Code>SIG_ALL</Code> is optional.
            </div>
            <div>
              In v3: <Code>SIG_ALL</Code> is always on.
            </div>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Inputs sign the outputs
        </StepItem>
        <StepItem n={2} step={s}>
          Swapped outputs: rejected
        </StepItem>
        <StepItem n={3} step={s}>
          v3: mandatory
        </StepItem>
      </StepList>
    </Shell>
  );
};

const Seg = ({
  bytes,
  label,
  tone = 'field',
  show = true,
  delay = 0,
  hot = false,
  size = 20,
}: {
  bytes: ReactNode;
  label?: ReactNode;
  tone?: 'type' | 'len' | 'field';
  show?: boolean;
  delay?: number;
  hot?: boolean;
  size?: number;
}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: 8,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT} ${show ? delay : 0}ms, transform 400ms ${EASE_OUT} ${show ? delay : 0}ms`,
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: size,
        padding: '6px 10px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${hot ? c.clayHex : tone === 'type' ? c.clayHex : c.rule}`,
        background: hot ? c.claySoft : tone === 'type' ? c.claySoft : tone === 'len' ? c.panel : c.card,
        color: tone === 'len' && !hot ? c.muted : c.ink,
        transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      {bytes}
    </span>
    {label && <span style={{ fontSize: 18, color: c.muted, marginTop: 6, whiteSpace: 'nowrap' }}>{label}</span>}
  </div>
);

const OutputSegs = ({ s, delay = 0 }: { s: number; delay?: number }) => (
  <div style={{ display: 'flex', marginTop: 10 }}>
    <Seg bytes="03" label="type" tone="type" show={s >= 2} hot={s === 3} delay={delay} />
    <Seg bytes="005b" label="length 91" tone="len" show={s >= 2} hot={s === 3} delay={delay + 40} />
    <Seg bytes="01 0001 04" label="amount 4" show={s >= 2} delay={delay + 80} />
    <Seg bytes="02 0021 02b7e0…cf99f6" label="keyset id" show={s >= 2} delay={delay + 120} />
    <Seg bytes="03 0030 b42a0b…78cd55" label="B_, 48 B" show={s >= 2} delay={delay + 160} />
  </div>
);

const Transcript: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <Shell n="1.6" eyebrow="Client intent" title="v3 transaction transcript (NUT-10)" proc={proc}>
      <div style={{ fontSize: 24, color: c.muted, marginTop: 10 }}>
        Swap: one 8-sat proof in, two 4-sat blinded messages out (<Code>tests/10-tests.md</Code>).
      </div>
      <At x={120} y={300} w={1220}>
        <Fade show={s >= 1}>
          <Label>Proof input · container 0x01</Label>
        </Fade>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <Seg bytes="01" label="type" tone="type" show={s >= 1} hot={s === 3} />
          <Seg bytes="008e" label="length 142" tone="len" show={s >= 1} hot={s === 3} delay={40} />
          <Seg bytes="01 0001 08" label="amount 8" show={s >= 1} delay={80} />
          <Seg bytes="02 0021 02b7e0…cf99f6" label="keyset id" show={s >= 1} delay={120} />
          <Seg bytes="03 0030 a0acf9…290a73" label="Y, 48 B" show={s >= 1} delay={160} />
          <Seg bytes="04 0030 84d1b7…d03327" label="C, 48 B" show={s >= 1} delay={200} />
        </div>
      </At>
      <At x={120} y={456} w={1220}>
        <Fade show={s >= 2}>
          <Label>Blinded messages · container 0x03, twice</Label>
        </Fade>
        <OutputSegs s={s} />
        <OutputSegs s={s} delay={120} />
      </At>
      <At x={120} y={746} w={1220}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 26 }}>
            <Code>transaction_digest = SHA256(transcript)</Code>
            <span style={{ color: c.muted, fontSize: 22 }}>&nbsp;&nbsp;333 bytes</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 24, color: c.clayHex, marginTop: 10 }}>
            7d4783154ee7e697df3087d00206a26f74dab34fd469270f749ca14cc852d2aa
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Each proof input becomes container 0x01: amount, keyset id, <M>Y</M>, <M>C</M>. The secret never enters the
          transcript.
        </StepItem>
        <StepItem n={2} step={s}>
          Each blinded message becomes container 0x03: amount, keyset id, <M>B_</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Record = type (1 B) ‖ length (2 B, big-endian) ‖ value. Containers group by ascending type; elements keep
          request order.
        </StepItem>
        <StepItem n={4} step={s}>
          The transaction digest is a plain SHA-256 of the transcript.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 21 }}>
          Containers: 0x01 proof · 0x02 mint quote · 0x03 blinded message · 0x04 melt quote · 0x05 authorized request
          (NUT-22 only). Integers are minimal big-endian.
        </Note>
      </StepList>
    </Shell>
  );
};

const DBox = ({
  x,
  y,
  w,
  title,
  value,
  show,
  tone,
  delay = 0,
}: {
  x: number;
  y: number;
  w: number;
  title: ReactNode;
  value: ReactNode;
  show: boolean;
  tone?: string;
  delay?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone ?? c.rule}`,
      background: c.card,
      borderRadius: 12,
      padding: '12px 20px',
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT} ${show ? delay : 0}ms, transform 400ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}`,
    }}
  >
    <Label>{title}</Label>
    <div style={{ fontFamily: MONO, fontSize: 21, marginTop: 6 }}>{value}</div>
  </div>
);

const InputDigest: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <Shell n="1.6" eyebrow="Client intent" title="Per-input signing digest" proc={proc}>
      <Canvas>
        <Arrow x1={505} y1={338} x2={595} y2={338} show={s >= 1} label="SHA256" font="mono" labelColor={c.muted} />
        <Arrow x1={505} y1={518} x2={595} y2={518} show={s >= 2} label="SHA256" font="mono" labelColor={c.muted} />
        <Arrow x1={965} y1={338} x2={1000} y2={410} show={s >= 3} color={c.clayHex} />
        <Arrow x1={965} y1={518} x2={1000} y2={456} show={s >= 3} color={c.clayHex} />
        <Arrow x1={1170} y1={496} x2={1170} y2={626} show={s >= 4} color={c.clayHex} />
      </Canvas>
      <DBox x={120} y={290} w={380} title="TLV transcript" value="01008e01…78cd55  (333 B)" show />
      <DBox x={120} y={470} w={380} title="input container 0x01" value="01008e01…d03327  (145 B)" show />
      <DBox x={600} y={290} w={360} title="transaction_digest" value="7d4783154ee7e697…" show={s >= 1} delay={300} />
      <DBox x={600} y={470} w={360} title="input_id" value="44002fef2fb9ce31…" show={s >= 2} delay={300} />
      <DBox
        x={1000}
        y={384}
        w={340}
        title="input_digest"
        value="867091ad6dba3069…"
        show={s >= 3}
        tone={c.clayHex}
        delay={300}
      />
      <DBox
        x={600}
        y={632}
        w={740}
        title="witness (key path)"
        value={'{"signatures":["a46a08f9cf25bee3…a56509a2"]}'}
        show={s >= 4}
        delay={300}
      />
      <At x={600} y={740} w={740}>
        <Fade show={s >= 4} delay={400}>
          <Note>BIP-340 signature by the proof secret's key.</Note>
        </Fade>
      </At>
      <At x={120} y={820} w={1220}>
        <Fade show={s >= 5}>
          <div
            style={{
              border: `1.5px solid ${c.bad}`,
              background: c.badSoft,
              borderRadius: 12,
              padding: '14px 22px',
              fontSize: 24,
            }}
          >
            Outputs <M>A, B</M> → <M>X, Y</M>: different transcript → different <Code>transaction_digest</Code> and{' '}
            <Code>input_digest</Code> → the witness does not verify.
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Plain content hash of the whole transaction.
        </StepItem>
        <StepItem n={2} step={s}>
          Plain content hash of this input's complete container record.
        </StepItem>
        <StepItem n={3} step={s}>
          <Code>input_digest = tagged_hash("Cashu_TransactionInput", transaction_digest ‖ input_id)</Code>
        </StepItem>
        <StepItem n={4} step={s}>
          The input's witness signs its own input digest. No two inputs sign the same message.
        </StepItem>
        <StepItem n={5} step={s}>
          Any change to inputs or outputs invalidates every witness.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 21 }}>
          A witness published under <Code>disclosure</Code> verifies without revealing the transaction digest.
        </Note>
      </StepList>
    </Shell>
  );
};

const RuleCard = ({ title, tone, children }: { title: string; tone: string; children: ReactNode }) => (
  <div
    style={{
      width: 590,
      height: 340,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone}`,
      background: c.card,
      borderRadius: 'var(--osd-radius)',
      padding: '22px 28px',
    }}
  >
    <Label color={tone}>{title}</Label>
    <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 12 }}>{children}</div>
  </div>
);

const InputsSign: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  return (
    <Shell n="1.6" eyebrow="Client intent" title="Inputs sign, outputs never do" proc={proc}>
      <div style={{ display: 'flex', gap: 30, marginTop: 44 }}>
        <Fade show={s >= 1} dimTo={0.25}>
          <RuleCard title="pre-v3 keysets (v1, v2)" tone={c.node}>
            <div>Random-string secret: no witness. Whoever presents <M>(x, C)</M> spends it.</div>
            <div style={{ marginTop: 10 }}>P2PK <Code>SIG_INPUTS</Code>: signature over the secret string only.</div>
            <div style={{ marginTop: 10 }}>
              <Code>SIG_ALL</Code>: optional; every input needs the same data and tags.
            </div>
          </RuleCard>
        </Fade>
        <Fade show={s >= 2} dimTo={0.25}>
          <RuleCard title="v3 keysets" tone={c.clayHex}>
            <div>Every secret is a public key; every input carries a BIP-340 witness over its input digest.</div>
            <div style={{ marginTop: 10 }}>No sigflag: inputs with different locks, or none, mix freely.</div>
            <div style={{ marginTop: 10 }}>Paid mint quotes are inputs, signed by the quote lock key (NUT-04).</div>
            <div style={{ marginTop: 10 }}>Serialized tokens never carry witnesses.</div>
          </RuleCard>
        </Fade>
      </div>
      <At x={120} y={660} w={640}>
        <Fade show={s >= 3}>
          <div
            style={{
              border: `1.5px solid ${c.rule}`,
              background: c.card,
              borderRadius: 12,
              padding: '14px 22px',
              fontFamily: MONO,
              fontSize: 20,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontFamily: SANS }}>
              <Label>Unlocked v3 token entry</Label>
            </div>
            <div>
              <span style={{ color: c.dim }}>"secret": </span>"025cbdf0…cac4f9bc"
              <span style={{ color: c.dim }}>  K = k·G</span>
            </div>
            <div>
              <span style={{ color: c.dim }}>"C":      </span>"84d1b729…a9d03327"
            </div>
            <div>
              <span style={{ color: c.dim }}>"spend_info": </span>
              {'{ "k": "00…07" }'}
              <span style={{ color: c.clayHex }}>  bearer key</span>
            </div>
          </div>
        </Fade>
      </At>
      <At x={800} y={672} w={520}>
        <Fade show={s >= 3} delay={200}>
          <Note>
            The mint receives <M>K</M>, <M>C</M> and a signature, never <M>k</M>. A member that sees the swap cannot
            re-sign it for other outputs.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Pre-v3: output binding is opt-in and restricted.
        </StepItem>
        <StepItem n={2} step={s}>
          v3: every input signs the whole transaction. This replaces <Code>SIG_ALL</Code>.
        </StepItem>
        <StepItem n={3} step={s}>
          An anyone-can-spend token is a bare key whose private key <M>k</M> travels in the token's spend info.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 21 }}>
          Specified in <Code>cashubtc/nuts#443</Code> (NUT-10, NUT-03, NUT-04, NUT-05).
        </Note>
      </StepList>
    </Shell>
  );
};

const SW = [460, 1220];
const Summary: Page = () => (
  <Shell eyebrow="Summary" title="Federation components">
    <At x={120} y={290} w={1680}>
      <Row h={66} i={0} head>
        <Cell head w={SW[0]}>Problem</Cell>
        <Cell head w={SW[1]}>Mechanism</Cell>
      </Row>
      <Row h={66} i={1}>
        <Cell w={SW[0]} color={c.muted}>Verify without the key</Cell>
        <Cell w={SW[1]}>BLS pairings</Cell>
      </Row>
      <Row h={66} i={2}>
        <Cell w={SW[0]} color={c.muted}>Split the key</Cell>
        <Cell w={SW[1]}>Shamir shares, combined by the wallet</Cell>
      </Row>
      <Row h={66} i={3}>
        <Cell w={SW[0]} color={c.muted}>Mix-and-match</Cell>
        <Cell w={SW[1]}>AlephBFT consensus before signing</Cell>
      </Row>
      <Row h={66} i={4}>
        <Cell w={SW[0]} color={c.muted}>No dealer</Cell>
        <Cell w={SW[1]}>Distributed key generation</Cell>
      </Row>
      <Row h={66} i={5}>
        <Cell w={SW[0]} color={c.muted}>Reserves</Cell>
        <Cell w={SW[1]}>FROST threshold custody</Cell>
      </Row>
      <Row h={66} i={6}>
        <Cell w={SW[0]} color={c.muted}>Rewritten outputs</Cell>
        <Cell w={SW[1]}>
          <Code>SIG_ALL</Code> always on (v3)
        </Cell>
      </Row>
    </At>
    <At x={120} y={800} w={1680}>
      <div style={{ fontSize: 32 }}>Status: not production-ready.</div>
    </At>
  </Shell>
);

// ═════════════════════════════════════════════════════════════════════════════
// Chapter 2 · Nutroot
// ═════════════════════════════════════════════════════════════════════════════

/** Positioned, optionally scaled figure with its own local coordinate space. */
const Fig = ({
  x,
  y,
  w,
  h,
  scale = 1,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  scale?: number;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
    }}
  >
    {children}
  </div>
);

const FigSvg = ({ w, h, children }: { w: number; h: number; children: ReactNode }) => (
  <svg
    viewBox={`0 0 ${w} ${h}`}
    style={{ position: 'absolute', left: 0, top: 0, width: w, height: h, pointerEvents: 'none', overflow: 'visible' }}
  >
    {children}
  </svg>
);

type NodeTone = 'idle' | 'on' | 'cool' | 'dim' | 'calc';
const nodeBorder: Record<NodeTone, string> = {
  idle: c.node,
  on: c.clayHex,
  cool: c.cool,
  dim: c.rule,
  calc: c.clayHex,
};
const nodeBg: Record<NodeTone, string> = {
  idle: c.card,
  on: c.claySoft,
  cool: c.coolSoft,
  dim: c.card,
  calc: c.card,
};

const TNode = ({
  x,
  y,
  w = 230,
  h = 72,
  title,
  sub,
  tone = 'idle',
  show = true,
  delay = 0,
  dashed = false,
  dx = 0,
  faint = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: ReactNode;
  sub?: ReactNode;
  tone?: NodeTone;
  show?: boolean;
  delay?: number;
  dashed?: boolean;
  dx?: number;
  faint?: boolean;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.75px ${dashed || tone === 'calc' ? 'dashed' : 'solid'} ${nodeBorder[tone]}`,
      background: nodeBg[tone],
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      opacity: show ? (faint ? 0.3 : 1) : 0,
      transform: `translate(${dx}px, ${show || REDUCED ? 0 : 6}px)`,
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 800ms ${EASE_IO}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    <div style={{ fontSize: 22, lineHeight: 1.2 }}>{title}</div>
    {sub && <div style={{ fontFamily: MONO, fontSize: 17, color: c.muted, marginTop: 3, lineHeight: 1.3 }}>{sub}</div>}
  </div>
);

/** SVG edge between two local points; fades in. */
const Edge = ({
  x1,
  y1,
  x2,
  y2,
  show,
  dashed,
  color = c.node,
  delay = 0,
  faint = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  show: boolean;
  dashed?: boolean;
  color?: string;
  delay?: number;
  faint?: boolean;
}) =>
  dashed ? (
    <GFade show={show} delay={delay} to={faint ? 0.3 : 1}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: color, strokeWidth: 1.75, strokeDasharray: '5 6' }} />
    </GFade>
  ) : (
    <Draw x1={x1} y1={y1} x2={x2} y2={y2} show={show} color={color} width={1.75} delay={delay} dur={600} opacity={faint ? 0.3 : 1} />
  );

// ─── 2.1 Spending conditions today ───────────────────────────────────────────

const Pre = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
  <pre
    style={{
      margin: 0,
      fontFamily: MONO,
      fontSize: size,
      lineHeight: 1.5,
      background: c.card,
      border: `1.5px solid ${c.rule}`,
      borderRadius: 12,
      padding: '16px 24px',
      whiteSpace: 'pre',
    }}
  >
    {children}
  </pre>
);

const P2PK_ESCAPED =
  '"[\\"P2PK\\",{\\"nonce\\":\\"859d4935c4907062a6297cf4e663e2835d90d97ecdd510745d32f6816323a41f\\",\\"data\\":\\"0249098aa8b9d2fbec49ff8598feb17b592b986e62319a4fa488a3dc36387157a7\\",\\"tags\\":[[\\"sigflag\\",\\"SIG_INPUTS\\"]]}]"';

const JsonSecret: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <Shell n="2.1" eyebrow="Spending conditions today" title="NUT-10 well-known secrets" proc={proc}>
      <At x={120} y={256} w={1200}>
        <Fade show={s >= 1}>
          <Label>Secret, kind P2PK (NUT-11 example)</Label>
          <div style={{ marginTop: 8, width: 760 }}>
            <Pre size={21}>
              {`[
  "P2PK",
  {
    "nonce": "859d4935…6323a41f",
    "data": "0249098a…36387157a7",
    "tags": [["sigflag", "SIG_INPUTS"]]
  }
]`}
            </Pre>
          </div>
        </Fade>
      </At>
      <At x={120} y={574} w={1200}>
        <Fade show={s >= 2}>
          <Label>Proof.secret on the wire</Label>
          <div
            style={{
              marginTop: 8,
              fontFamily: MONO,
              fontSize: 18,
              lineHeight: 1.5,
              wordBreak: 'break-all',
              background: c.card,
              border: `1.5px solid ${c.rule}`,
              borderRadius: 12,
              padding: '12px 20px',
            }}
          >
            <span style={{ color: c.dim }}>"secret": </span>
            {P2PK_ESCAPED}
          </div>
        </Fade>
      </At>
      <At x={120} y={778} w={1200}>
        <Fade show={s >= 3}>
          <M size={36}>
            Y = <Up>hash_to_curve</Up>(secret)
          </M>
          <span style={{ fontSize: 30, color: c.muted }}>&nbsp;&nbsp;over 195 bytes</span>
        </Fade>
        <Fade show={s >= 4} style={{ marginTop: 18 }}>
          <span style={{ fontFamily: MONO, fontSize: 21 }}>
            "witness": "{'{'}\"signatures\":[\"60f3c9b7…b59e1383\"]{'}'}"
          </span>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          JSON array
        </StepItem>
        <StepItem n={2} step={s}>
          Escaped into a string
        </StepItem>
        <StepItem n={3} step={s}>
          Hashed as a string
        </StepItem>
        <StepItem n={4} step={s}>
          Witness: JSON too
        </StepItem>
      </StepList>
    </Shell>
  );
};

const Limit = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
    <span style={{ color: c.clayHex, fontFamily: MONO }}>–</span>
    <span>{children}</span>
  </div>
);

const JsonLimits: Page = () => {
  const proc = useProcess(2, 2400);
  const s = proc.step;
  const box = (tone: string, bg: string): CSSProperties => ({
    flex: 1,
    border: `1.5px solid ${tone}`,
    background: bg,
    borderRadius: 12,
    padding: '18px 24px',
    fontSize: 30,
    lineHeight: 1.35,
  });
  return (
    <Shell n="2.1" eyebrow="Spending conditions today" title="Conditions as tags: HTLC (NUT-14)" proc={proc}>
      <At x={120} y={256} w={640}>
        <Pre size={20}>
          {`[
  "HTLC",
  {
    "nonce": "da627964…53ed3746",
    "data": "02319220…3ca6c50c",
    "tags": [
      ["pubkeys", "02698c4e…71fbda904"],
      ["locktime", "1689418329"],
      ["refund", "033281c3…6099c26e"]
    ]
  }
]`}
        </Pre>
        <div style={{ fontSize: 30, marginTop: 18 }}>323 bytes, integers as strings</div>
      </At>
      <At x={820} y={256} w={980}>
        <Fade show={s >= 1} dimTo={0.3}>
          <Label>Pathways</Label>
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            <div style={box(c.cool, c.coolSoft)}>
              <div style={{ fontWeight: 600 }}>Receiver</div>
              preimage + signatures
            </div>
            <div style={box(c.node, c.card)}>
              <div style={{ fontWeight: 600 }}>Sender</div>
              after locktime: refund keys
            </div>
          </div>
        </Fade>
      </At>
      <At x={820} y={560} w={980}>
        <Fade show={s >= 2} dimTo={0.3}>
          <div style={{ fontSize: 34, lineHeight: 1.5 }}>
            <Limit>Size grows with the policy</Limit>
            <Limit>Every spend reveals the whole policy</Limit>
            <Limit>Unknown kind: anyone can spend</Limit>
          </div>
        </Fade>
      </At>
    </Shell>
  );
};

// ─── 2.2 Taproot ─────────────────────────────────────────────────────────────

type TapMode = 'build' | 'key' | 'script';

const TapTree = ({ s, mode }: { s: number; mode: TapMode }) => {
  const b = mode === 'build';
  const leaves = b ? s >= 1 : true;
  const branch = b ? s >= 2 : true;
  const root = b ? s >= 3 : true;
  const tweak = b ? s >= 4 : true;
  const depth = b && s >= 5;
  const key = mode === 'key';
  const scr = mode === 'script';
  const treeFaint = key;
  return (
    <>
      <FigSvg w={1180} h={600}>
        <Edge x1={300} y1={308} x2={590} y2={226} show={root} faint={treeFaint} />
        <Edge x1={880} y1={324} x2={590} y2={226} show={root} faint={treeFaint} />
        <Edge x1={720} y1={480} x2={880} y2={396} show={branch} faint={treeFaint} />
        <Edge x1={1030} y1={480} x2={880} y2={396} show={branch} faint={treeFaint} />
        <Arrow x1={590} y1={152} x2={570} y2={92} show={tweak} color={c.clayHex} />
      </FigSvg>
      <TNode x={170} y={44} w={340} h={84} title="internal key P" sub="x-only, 32 B" tone={key ? 'on' : 'idle'} />
      <TNode
        x={570}
        y={44}
        w={340}
        h={84}
        title={<Code>t = hash_TapTweak(x(P) ‖ root)</Code>}
        show={tweak}
        tone={key ? 'on' : 'idle'}
      />
      <TNode
        x={990}
        y={44}
        w={380}
        h={84}
        title={
          <>
            <M>Q = P + t·G</M>
          </>
        }
        sub="output: OP_1 <x(Q)>"
        show={tweak}
        tone="on"
      />
      <TNode
        x={590}
        y={190}
        w={240}
        title="root"
        sub="hash_TapBranch"
        show={root}
        tone={scr ? 'calc' : 'idle'}
        faint={treeFaint}
      />
      <TNode
        x={300}
        y={360}
        w={300}
        h={100}
        title={depth ? 'script A · depth 1' : 'script A'}
        sub={<>{'<A> OP_CHECKSIG'}</>}
        show={leaves}
        tone={scr ? 'cool' : depth ? 'on' : 'idle'}
        faint={treeFaint}
      />
      <TNode
        x={880}
        y={360}
        w={240}
        title="branch"
        sub="hash_TapBranch"
        show={branch}
        tone={scr ? 'calc' : 'idle'}
        faint={treeFaint}
      />
      <TNode
        x={720}
        y={530}
        w={300}
        h={100}
        title={depth ? 'script B · depth 2' : 'script B'}
        sub={
          <>
            {'<t> OP_CLTV OP_DROP'}
            <br />
            {'<B> OP_CHECKSIG'}
          </>
        }
        show={leaves}
        delay={60}
        tone={scr ? 'on' : 'idle'}
        faint={treeFaint}
      />
      <TNode
        x={1030}
        y={530}
        w={300}
        h={100}
        title={depth ? 'script C · depth 2' : 'script C'}
        sub={
          <>
            {'OP_SHA256 <h> OP_EQUALVERIFY'}
            <br />
            {'<C> OP_CHECKSIG'}
          </>
        }
        show={leaves}
        delay={120}
        tone={scr ? 'cool' : 'idle'}
        faint={treeFaint}
      />
    </>
  );
};

const TaprootTree: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <Shell n="2.2" eyebrow="Taproot" title="Taproot output keys (BIP341)" proc={proc}>
      <Fig x={120} y={276} w={1180} h={600}>
        <TapTree s={s} mode="build" />
      </Fig>
      <StepList>
        <StepItem n={1} step={s}>
          Hash each script
        </StepItem>
        <StepItem n={2} step={s}>
          Hash pairs, sorted
        </StepItem>
        <StepItem n={3} step={s}>
          Root commits to all
        </StepItem>
        <StepItem n={4} step={s}>
          Tweak: <M>Q = P + t·G</M>
        </StepItem>
        <StepItem n={5} step={s}>
          Shape: builder chooses
        </StepItem>
      </StepList>
    </Shell>
  );
};

const TaprootSpend: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  const mode: TapMode = s >= 2 ? 'script' : 'key';
  return (
    <Shell n="2.2" eyebrow="Taproot" title="Key path and script path (BIP341, BIP342)" proc={proc}>
      <Fig x={120} y={262} w={1180} h={600} scale={0.72}>
        <TapTree s={3} mode={mode} />
      </Fig>
      <At x={990} y={262} w={360} style={{ height: 420 }}>
        <Fade show={s <= 1} style={{ position: 'absolute', inset: 0 }}>
          <Label color={c.clayHex}>Key path witness</Label>
          <Pre size={24}>{`[ signature ]`}</Pre>
          <div style={{ fontSize: 28, marginTop: 16 }}>Looks like any single-key spend.</div>
        </Fade>
        <Fade show={s >= 2} style={{ position: 'absolute', inset: 0 }}>
          <Label color={c.clayHex}>Script path witness</Label>
          <Pre size={22}>{`[ inputs, script B,
  control ]`}</Pre>
          <div style={{ fontSize: 28, marginTop: 16 }}>control: x(P), hash(C), hash(A)</div>
        </Fade>
      </At>
      <At x={120} y={760} w={1220}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 34 }}>Unused scripts stay hidden.</div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Key path: one signature
        </StepItem>
        <StepItem n={2} step={s}>
          Script path: script + path
        </StepItem>
        <StepItem n={3} step={s}>
          Recompute, then run
        </StepItem>
      </StepList>
    </Shell>
  );
};

// ─── 2.3 Nutroot secrets ─────────────────────────────────────────────────────

const PointSecret: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  return (
    <Shell n="2.3" eyebrow="Nutroot secrets" title="The secret is a public key" proc={proc}>
      <At x={120} y={266} w={1220}>
        <Label>Keysets v1, v2: a string</Label>
        <div
          style={{
            marginTop: 10,
            fontFamily: MONO,
            fontSize: 26,
            opacity: s >= 1 ? 0.45 : 1,
            transition: `opacity 500ms ${EASE_OUT}`,
          }}
        >
          407915bc…768a7837<span style={{ color: c.dim, fontFamily: SANS }}>{'   or   '}</span>["P2PK",{"{…}"}]
        </div>
      </At>
      <At x={120} y={450} w={1220}>
        <Fade show={s >= 1}>
          <Label color={c.clayHex}>Keyset v3: a compressed secp256k1 point, 33 bytes</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 10 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 24,
                background: c.claySoft,
                border: `1.5px solid ${c.clayHex}`,
                borderRadius: 10,
                padding: '10px 18px',
              }}
            >
              02d310a4d661e3158e7d360617e739d6bacbf015431b24a43168db0ab99ef8f828
            </span>
          </div>
          <div style={{ marginTop: 16 }}>
            <M size={34}>
              Y = <Up>hash_to_curve_G1</Up>(33 bytes)
            </M>
          </div>
        </Fade>
      </At>
      <At x={120} y={690} w={1220}>
        <Fade show={s >= 2}>
          <div style={{ display: 'flex', gap: 30 }}>
            <div style={{ flex: 1 }}>
              <Label>No conditions</Label>
              <div style={{ marginTop: 8 }}>
                <M size={36}>secret = K = k·G</M>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <Label>With conditions</Label>
              <div style={{ marginTop: 8 }}>
                <M size={36}>secret = P = K + t·G</M>
              </div>
            </div>
          </div>
        </Fade>
        <Fade show={s >= 3} style={{ marginTop: 26 }}>
          <div style={{ fontSize: 34 }}>A locked secret looks like an unlocked one.</div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          33-byte public key
        </StepItem>
        <StepItem n={2} step={s}>
          Conditions in the tweak
        </StepItem>
        <StepItem n={3} step={s}>
          Same look on the wire
        </StepItem>
      </StepList>
    </Shell>
  );
};

type NutMode = 'build' | 'key' | 'script';
const NX = [180, 570, 960];

const LeafCard = ({
  slot,
  dx,
  title,
  detail,
  bytes,
  hash,
  showHash,
  show,
  tone,
  delay = 0,
}: {
  slot: number;
  dx: number;
  title: string;
  detail: ReactNode;
  bytes: string;
  hash: ReactNode;
  showHash: boolean;
  show: boolean;
  tone: NodeTone;
  delay?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: NX[slot] - 170,
      top: 474,
      width: 340,
      height: 136,
      boxSizing: 'border-box',
      border: `1.75px solid ${nodeBorder[tone]}`,
      background: nodeBg[tone],
      borderRadius: 12,
      padding: '12px 18px',
      opacity: show ? (tone === 'dim' ? 0.3 : 1) : 0,
      transform: `translate(${dx}px, ${show || REDUCED ? 0 : 6}px)`,
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 900ms ${EASE_IO}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 24, fontWeight: 600 }}>{title}</span>
      <span style={{ fontFamily: MONO, fontSize: 17, color: c.muted }}>{bytes}</span>
    </div>
    <div style={{ fontSize: 19, color: c.muted, marginTop: 4 }}>{detail}</div>
    <div
      style={{
        fontFamily: MONO,
        fontSize: 18,
        marginTop: 8,
        opacity: showHash ? 1 : 0,
        transition: `opacity 400ms ${EASE_OUT}`,
      }}
    >
      {hash}
    </div>
  </div>
);

const NutTree = ({ s, mode }: { s: number; mode: NutMode }) => {
  const b = mode === 'build';
  const leaves = b ? s >= 1 : true;
  const hashes = b ? s >= 2 : true;
  const sorted = b ? s >= 3 : true;
  const lvl1 = b ? s >= 4 : true;
  const root = b ? s >= 5 : true;
  const tweak = b ? s >= 6 : true;
  const key = mode === 'key';
  const scr = mode === 'script';
  const d = sorted ? 390 : 0;
  const treeTone = (t: NodeTone): NodeTone => (key ? 'dim' : t);
  return (
    <>
      <FigSvg w={1180} h={620}>
        <Edge x1={NX[0]} y1={474} x2={375} y2={396} show={lvl1} faint={key} />
        <Edge x1={NX[1]} y1={474} x2={375} y2={396} show={lvl1} faint={key} />
        <Edge x1={NX[2]} y1={474} x2={NX[2]} y2={396} show={lvl1} dashed faint={key} />
        <Edge x1={375} y1={324} x2={667} y2={226} show={root} faint={key} />
        <Edge x1={NX[2]} y1={324} x2={667} y2={226} show={root} faint={key} />
        <Arrow x1={667} y1={152} x2={590} y2={92} show={tweak} color={c.clayHex} />
      </FigSvg>
      <TNode x={180} y={44} w={360} h={84} title="internal key K" sub="03a3e12c…3a419e51" tone={key ? 'on' : 'idle'} />
      <TNode
        x={590}
        y={44}
        w={360}
        h={84}
        title={<Code>t = tagged_hash(Tweak, K ‖ root)</Code>}
        sub="ea08208d…6bf26eaf"
        show={tweak}
        tone={key ? 'on' : 'idle'}
      />
      <TNode
        x={1000}
        y={44}
        w={360}
        h={84}
        title={
          <>
            secret <M>P = K + t·G</M>
          </>
        }
        sub="022d17fd…d51b9999"
        show={tweak}
        tone="on"
      />
      <TNode x={667} y={190} w={260} title="merkle root" sub="3d4fbecf…b49d43ad" show={root} tone={treeTone(scr ? 'calc' : 'idle')} />
      <TNode x={375} y={360} w={260} title="branch" sub="8f58855d…ed77f67c" show={lvl1} tone={treeTone(scr ? 'calc' : 'idle')} delay={100} />
      <TNode
        x={NX[2]}
        y={360}
        w={260}
        title="h₁ promoted"
        sub="9ed9c0b8…0616589a"
        show={lvl1}
        dashed
        tone={treeTone(scr ? 'cool' : 'idle')}
        delay={200}
      />
      <LeafCard
        slot={0}
        dx={0}
        title="threshold"
        detail="n = 1 · key 3"
        bytes="42 B"
        hash="h₀ 23e8ff16…839116cb"
        showHash={hashes}
        show={leaves}
        tone={treeTone(scr ? 'cool' : 'idle')}
      />
      <LeafCard
        slot={1}
        dx={d}
        title="after"
        detail="n = 1 · key 4 · 2025-08-19"
        bytes="49 B"
        hash="h₁ 9ed9c0b8…0616589a"
        showHash={hashes}
        show={leaves}
        tone={treeTone(scr ? 'dim' : 'idle')}
        delay={60}
      />
      <LeafCard
        slot={2}
        dx={-d}
        title="hashlock"
        detail="n = 1 · key 3 · hash a1…a1"
        bytes="77 B"
        hash="h₂ 8f38ddf9…5b65f2fa"
        showHash={hashes}
        show={leaves}
        tone={treeTone(scr ? 'on' : 'idle')}
        delay={120}
      />
    </>
  );
};

const NutrootTree: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  return (
    <Shell n="2.3" eyebrow="Nutroot secrets" title="Tree, root and tweak" proc={proc}>
      <Fig x={120} y={262} w={1180} h={620}>
        <NutTree s={s} mode="build" />
      </Fig>

      <StepList>
        <StepItem n={1} step={s}>
          Three leaves
        </StepItem>
        <StepItem n={2} step={s}>
          Hash each leaf
        </StepItem>
        <StepItem n={3} step={s}>
          Sort the hashes
        </StepItem>
        <StepItem n={4} step={s}>
          Pair, promote the odd one
        </StepItem>
        <StepItem n={5} step={s}>
          Root
        </StepItem>
        <StepItem n={6} step={s}>
          Tweak the key
        </StepItem>
      </StepList>
    </Shell>
  );
};

const LEAF_TYPES = [
  { name: 'threshold', code: '0x01', rule: 'n of the listed keys sign' },
  { name: 'after', code: '0x02', rule: 'after a time, n keys sign' },
  { name: 'hashlock', code: '0x03', rule: 'preimage, and n keys sign' },
  { name: 'commit', code: '0x04', rule: 'never spendable, binds data' },
];

const LeafEncoding: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <Shell n="2.3" eyebrow="Nutroot secrets" title="Condition leaves" proc={proc}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 44, width: 1220 }}>
        {LEAF_TYPES.map((l, i) => (
          <Fade key={l.name} show={s >= i + 1}>
            <div
              style={{
                height: 156,
                boxSizing: 'border-box',
                border: `1.75px solid ${s === i + 1 ? c.clayHex : c.rule}`,
                background: s === i + 1 ? c.claySoft : c.card,
                borderRadius: 'var(--osd-radius)',
                padding: '22px 30px',
                transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: SERIF, fontSize: 46 }}>{l.name}</span>
                <span style={{ fontFamily: MONO, fontSize: 24, color: c.muted }}>{l.code}</span>
              </div>
              <div style={{ fontSize: 30, color: c.muted, marginTop: 12 }}>{l.rule}</div>
            </div>
          </Fade>
        ))}
      </div>
      <At x={120} y={690} w={1220}>
        <Fade show={s >= 5}>
          <Label>after leaf, 49 bytes</Label>
          <div style={{ display: 'flex', marginTop: 12 }}>
            <Seg bytes="00" label="version" tone="type" size={24} />
            <Seg bytes="02" label="after" tone="type" size={24} />
            <Seg bytes="02 0001 01" label="n = 1" size={24} />
            <Seg bytes="04 0021 02e493…" label="keys" size={24} />
            <Seg bytes="06 0004 68a3be80" label="time" size={24} />
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          threshold
        </StepItem>
        <StepItem n={2} step={s}>
          after
        </StepItem>
        <StepItem n={3} step={s}>
          hashlock
        </StepItem>
        <StepItem n={4} step={s}>
          commit
        </StepItem>
        <StepItem n={5} step={s}>
          Bytes: TLV records
        </StepItem>
      </StepList>
    </Shell>
  );
};

type FoldNode = { id: string; x: number; y: number; kind: 'leaf' | 'branch' | 'promoted'; root?: boolean };
type FoldEdge = { id: string; x1: number; y1: number; x2: number; y2: number; dashed: boolean };

function foldLayout(n: number) {
  const leafY = 780;
  const dy = 130;
  const nodes: FoldNode[] = [];
  const edges: FoldEdge[] = [];
  let level = Array.from({ length: n }, (_, i) => ({
    id: `L${i}`,
    x: n === 1 ? 600 : 120 + (i * 960) / (n - 1),
    leaves: [i],
  }));
  level.forEach((l) => nodes.push({ id: l.id, x: l.x, y: leafY, kind: 'leaf' }));
  const depth = Array.from({ length: n }, () => 0);
  let L = 0;
  while (level.length > 1) {
    L += 1;
    const next: typeof level = [];
    for (let j = 0; j < level.length; j += 2) {
      const a = level[j];
      const b2 = level[j + 1];
      const y = leafY - L * dy;
      if (b2) {
        const node = { id: `N${L}-${j / 2}`, x: (a.x + b2.x) / 2, leaves: [...a.leaves, ...b2.leaves] };
        nodes.push({ id: node.id, x: node.x, y, kind: 'branch' });
        edges.push({ id: `${a.id}>${node.id}`, x1: a.x, y1: y + dy, x2: node.x, y2: y, dashed: false });
        edges.push({ id: `${b2.id}>${node.id}`, x1: b2.x, y1: y + dy, x2: node.x, y2: y, dashed: false });
        node.leaves.forEach((li) => (depth[li] += 1));
        next.push(node);
      } else {
        const node = { id: `N${L}-${j / 2}`, x: a.x, leaves: a.leaves };
        nodes.push({ id: node.id, x: node.x, y, kind: 'promoted' });
        edges.push({ id: `${a.id}>${node.id}`, x1: a.x, y1: y + dy, x2: node.x, y2: y, dashed: true });
        next.push(node);
      }
    }
    level = next;
  }
  const rootId = level[0].id;
  nodes.forEach((nd) => {
    if (nd.id === rootId) nd.root = true;
  });
  return { nodes, edges, depth, levels: L };
}

const FoldShapes: Page = () => {
  const proc = useProcess(7, 1600);
  const n = proc.step + 1;
  const { nodes, edges, depth, levels } = foldLayout(n);
  return (
    <Shell n="2.3" eyebrow="Nutroot secrets" title="The fold fixes the shape" proc={proc}>
      <At x={120} y={250} w={700}>
        <span style={{ fontFamily: SERIF, fontSize: 60 }}>{n}</span>
        <span style={{ fontSize: 26, color: c.muted }}>
          &nbsp;{n === 1 ? 'leaf' : 'leaves'} · root at level {levels} · path lengths{' '}
          <span style={{ fontFamily: MONO, color: c.ink }}>{depth.join(' ')}</span>
        </span>
      </At>
      <Fig x={120} y={0} w={1200} h={1080}>
        <FigSvg w={1200} h={1080}>
          {edges.map((e) => (
            <line
              key={e.id}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              style={{
                stroke: e.dashed ? c.cool : c.node,
                strokeWidth: 1.75,
                strokeDasharray: e.dashed ? '5 6' : 'none',
                animation: REDUCED ? 'none' : `fc-in 500ms ${EASE_OUT} both`,
              }}
            />
          ))}
          {nodes.map((nd) => (
            <g
              key={nd.id}
              style={{
                transform: `translate(${nd.x}px, ${nd.y}px)`,
                transition: `transform 600ms ${EASE_IO}`,
              }}
            >
              <circle
                r={nd.root ? 22 : nd.kind === 'leaf' ? 16 : 13}
                style={{
                  fill: nd.root ? c.clayHex : nd.kind === 'leaf' ? c.card : nd.kind === 'promoted' ? c.coolSoft : c.card,
                  stroke: nd.root ? c.clayHex : nd.kind === 'promoted' ? c.cool : nd.kind === 'leaf' ? c.ink : c.node,
                  strokeWidth: 1.75,
                  strokeDasharray: nd.kind === 'promoted' ? '4 4' : 'none',
                  animation: REDUCED ? 'none' : `fc-in 400ms ${EASE_OUT} both`,
                }}
              />
            </g>
          ))}
          {depth.map((dp, i) => (
            <text
              key={`d${i}`}
              x={n === 1 ? 600 : 120 + (i * 960) / (n - 1)}
              y={838}
              textAnchor="middle"
              style={{ fontFamily: MONO, fontSize: 22, fill: c.muted, transition: `all 600ms ${EASE_IO}` }}
            >
              {dp}
            </text>
          ))}
        </FigSvg>
      </Fig>
      <At x={120} y={870} w={1200}>
        <Note style={{ fontSize: 30, color: c.ink }}>
          Numbers: path length per leaf
        </Note>
      </At>
      <StepList>
        <div style={{ fontSize: 30, lineHeight: 1.45 }}>
          <Limit>Sort, pair, promote</Limit>
          <Limit>Shape = number of leaves</Limit>
          <Limit>≤ 8 leaves, path ≤ 3</Limit>
        </div>
      </StepList>
    </Shell>
  );
};

const NutrootSpends: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  const mode: NutMode = s >= 2 ? 'script' : 'key';
  return (
    <Shell n="2.3" eyebrow="Nutroot secrets" title="Key path and script path" proc={proc}>
      <Fig x={120} y={262} w={1180} h={620} scale={0.72}>
        <NutTree s={6} mode={mode} />
      </Fig>
      <At x={990} y={262} w={370} style={{ height: 460 }}>
        <Fade show={s <= 1} style={{ position: 'absolute', inset: 0 }}>
          <Label color={c.clayHex}>Key path witness</Label>
          <Pre size={22}>{`{ "signatures": [sig] }`}</Pre>
          <div style={{ fontSize: 28, marginTop: 16 }}>
            one signature by <M>k + t</M>
          </div>
        </Fade>
        <Fade show={s >= 2} style={{ position: 'absolute', inset: 0 }}>
          <Label color={c.clayHex}>Script path witness</Label>
          <Pre size={22}>{`{
  "leaf": "0003…",
  "control": { K, path },
  "signatures": [sig],
  "preimage": "…"
}`}</Pre>
        </Fade>
      </At>
      <At x={120} y={760} w={1220}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 34 }}>Only the used leaf is revealed.</div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Key path: one signature
        </StepItem>
        <StepItem n={2} step={s}>
          Script path: one leaf
        </StepItem>
        <StepItem n={3} step={s}>
          What the mint learns
        </StepItem>
      </StepList>
    </Shell>
  );
};

const JLine = ({ on, children }: { on: boolean; children: ReactNode }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 20,
      lineHeight: 1.75,
      whiteSpace: 'pre',
      padding: '0 10px',
      margin: '0 -10px',
      borderRadius: 6,
      background: on ? c.claySoft : 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const Check = ({ ok = true, children }: { ok?: boolean; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 28, lineHeight: 1.35 }}>
    <span style={{ color: ok ? c.good : c.bad, fontFamily: MONO }}>{ok ? '✓' : '✗'}</span>
    <span>{children}</span>
  </div>
);

const ScriptVerify: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <Shell n="2.3" eyebrow="Nutroot secrets" title="Script path verification" proc={proc}>
      <At x={120} y={266} w={560}>
        <div style={{ background: c.card, border: `1.5px solid ${c.rule}`, borderRadius: 12, padding: '14px 24px' }}>
          <JLine on={false}>{'{'}</JLine>
          <JLine on={s === 2 || s === 3}>{'  "leaf": "000302000101…a1a1",'}</JLine>
          <JLine on={false}>{'  "control": {'}</JLine>
          <JLine on={s === 2}>{'    "K": "03a3e12c…3a419e51",'}</JLine>
          <JLine on={s === 1 || s === 2}>{'    "path": ["23e8ff16…", "9ed9c0b8…"]'}</JLine>
          <JLine on={false}>{'  },'}</JLine>
          <JLine on={s === 4}>{'  "signatures": ["<64 B>"],'}</JLine>
          <JLine on={s === 4}>{'  "preimage": "<≤ 32 B>"'}</JLine>
          <JLine on={false}>{'}'}</JLine>
        </div>
      </At>
      <At x={730} y={266} w={620} style={{ height: 560 }}>
        <Fade show={s === 1} style={{ position: 'absolute', inset: 0 }}>
          <Label>Step 1</Label>
          <div style={{ marginTop: 12 }}>
            <Check>2 sibling hashes, at most 3 allowed</Check>
          </div>
        </Fade>
        <Fade show={s === 2} style={{ position: 'absolute', inset: 0 }}>
          <Label>Step 2 · commitment</Label>
          <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.9, marginTop: 12 }}>
            <div>leaf_hash        = 8f38ddf9…</div>
            <div>branch(·, 23e8…) = 8f58855d…</div>
            <div>branch(·, 9ed9…) = 3d4fbecf…</div>
            <div>t                = ea08208d…</div>
            <div>
              K + t·G          = 022d17fd… <span style={{ color: c.good }}>= secret ✓</span>
            </div>
          </div>
        </Fade>
        <Fade show={s === 3} style={{ position: 'absolute', inset: 0 }}>
          <Label>Step 3 · parse</Label>
          <div style={{ marginTop: 12 }}>
            <Check>version 0x00</Check>
            <Check>type 0x03, hashlock</Check>
            <Check>fields: known, in order</Check>
          </div>
        </Fade>
        <Fade show={s >= 4} style={{ position: 'absolute', inset: 0 }}>
          <Label>Step 4 · evaluate</Label>
          <div style={{ marginTop: 12 }}>
            <Check>SHA256(preimage) = hash</Check>
            <Check>signatures from n = 1 listed key</Check>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Path: at most 3
        </StepItem>
        <StepItem n={2} step={s}>
          Recompute the secret
        </StepItem>
        <StepItem n={3} step={s}>
          Parse the leaf
        </StepItem>
        <StepItem n={4} step={s}>
          Evaluate
        </StepItem>
      </StepList>
    </Shell>
  );
};

const KeyCard = ({ n, step, title, children }: { n: number; step: number; title: string; children: ReactNode }) => {
  const on = step === n || step >= 4;
  return (
    <div
      style={{
        width: 390,
        height: 380,
        boxSizing: 'border-box',
        border: `1.75px solid ${step === n ? c.clayHex : c.rule}`,
        background: c.card,
        borderRadius: 'var(--osd-radius)',
        padding: '22px 26px',
        opacity: step === 0 || on || step > n ? 1 : 0.45,
        transition: `opacity 400ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      <Label color={step === n ? c.clayHex : c.muted}>{title}</Label>
      <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 22 }}>{children}</div>
    </div>
  );
};

const InternalKey: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  return (
    <Shell n="2.3" eyebrow="Nutroot secrets" title="Three forms of internal key" proc={proc}>
      <div style={{ display: 'flex', gap: 20, marginTop: 50 }}>
        <KeyCard n={1} step={s} title="Single-party">
          <M size={40}>K = k·G</M>
          <div style={{ marginTop: 22 }}>holder spends by key path</div>
        </KeyCard>
        <KeyCard n={2} step={s} title="Aggregated">
          <div>MuSig2, FROST: nobody holds <M>k</M></div>
          <div style={{ marginTop: 22 }}>must carry the empty tweak</div>
        </KeyCard>
        <KeyCard n={3} step={s} title="NUMS offset">
          <M size={40}>K = H + u·G</M>
          <div style={{ marginTop: 22 }}>no key path</div>
          <div style={{ marginTop: 12 }}>
            <M>u</M> is disclosed and checked
          </div>
        </KeyCard>
      </div>

      <StepList>
        <StepItem n={1} step={s}>
          Wallet key
        </StepItem>
        <StepItem n={2} step={s}>
          Shared key
        </StepItem>
        <StepItem n={3} step={s}>
          No key path
        </StepItem>
      </StepList>
    </Shell>
  );
};

// ─── 2.4 Using nutroot ───────────────────────────────────────────────────────

const FlowBox = ({ title, show, tone = c.rule, children }: { title: string; show: boolean; tone?: string; children: ReactNode }) => (
  <Fade show={show} dimTo={0.2}>
    <div
      style={{
        width: 390,
        height: 200,
        boxSizing: 'border-box',
        border: `1.5px solid ${tone}`,
        background: c.card,
        borderRadius: 12,
        padding: '16px 20px',
      }}
    >
      <Label color={tone === c.rule ? c.muted : tone}>{title}</Label>
      <div style={{ fontSize: 21, lineHeight: 1.45, marginTop: 10 }}>{children}</div>
    </div>
  </Fade>
);

const SIW = [120, 100, 520];
const SpendInfo: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <Shell n="2.4" eyebrow="Using nutroot" title="Spend info and receive-time checks" proc={proc}>
      <At x={120} y={250} w={740}>
        <Row i={0} head>
          <Cell head w={SIW[0]}>JSON</Cell>
          <Cell head w={SIW[1]}>V4</Cell>
          <Cell head w={SIW[2]}>Content</Cell>
        </Row>
        <Row i={1}>
          <Cell w={SIW[0]}><Code>k</Code></Cell>
          <Cell w={SIW[1]}><Code>k</Code></Cell>
          <Cell w={SIW[2]}>bearer private key, 32 B</Cell>
        </Row>
        <Row i={2}>
          <Cell w={SIW[0]}><Code>E</Code></Cell>
          <Cell w={SIW[1]}><Code>e</Code></Cell>
          <Cell w={SIW[2]}>ephemeral public key (NUT-28), 33 B</Cell>
        </Row>
        <Row i={3}>
          <Cell w={SIW[0]}><Code>K</Code></Cell>
          <Cell w={SIW[1]}><Code>i</Code></Cell>
          <Cell w={SIW[2]}>internal public key, 33 B</Cell>
        </Row>
        <Row i={4}>
          <Cell w={SIW[0]}><Code>tree</Code></Cell>
          <Cell w={SIW[1]}><Code>t</Code></Cell>
          <Cell w={SIW[2]}>serialized leaves, always full</Cell>
        </Row>
        <Row i={5}>
          <Cell w={SIW[0]}><Code>u</Code></Cell>
          <Cell w={SIW[1]}><Code>u</Code></Cell>
          <Cell w={SIW[2]}>NUMS offset, 32 B</Cell>
        </Row>
      </At>
      <At x={900} y={290} w={440}>
        <div style={{ fontSize: 30, lineHeight: 1.4 }}>Needed even for key-path spends: the tweak needs the root.</div>
      </At>
      <div style={{ position: 'absolute', left: 120, top: 660, display: 'flex', gap: 25 }}>
        <FlowBox title="Check 1" show={s >= 2} tone={s === 2 ? c.clayHex : c.rule}>
          <div style={{ fontSize: 30 }}>the data rebuilds the secret</div>
        </FlowBox>
        <FlowBox title="Check 2" show={s >= 3} tone={s === 3 ? c.clayHex : c.rule}>
          <div style={{ fontSize: 30 }}>the wallet can spend it</div>
        </FlowBox>
        <FlowBox title="Then" show={s >= 4} tone={s === 4 ? c.clayHex : c.rule}>
          <div style={{ fontSize: 30 }}>swap to your own keys</div>
        </FlowBox>
      </div>
      <StepList>
        <StepItem n={1} step={s}>
          Spend info
        </StepItem>
        <StepItem n={2} step={s}>
          Rebuild the secret
        </StepItem>
        <StepItem n={3} step={s}>
          Can I spend it
        </StepItem>
        <StepItem n={4} step={s}>
          Sweep
        </StepItem>
      </StepList>
    </Shell>
  );
};

const NoteBox = ({ x, y, w, show, children, tone = c.rule, size = 20 }: { x: number; y: number; w: number; show: boolean; children: ReactNode; tone?: string; size?: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone}`,
      background: tone === c.rule ? c.panel : c.claySoft,
      borderRadius: 10,
      padding: '8px 14px',
      fontSize: size,
      lineHeight: 1.4,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT}, transform 400ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const ReceiverKeyed: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const PE = 230;
  const PR = 720;
  const MI = 1180;
  return (
    <Shell n="2.4" eyebrow="Using nutroot" title="Receiver-keyed outputs (NUT-18, NUT-28)" proc={proc}>
      <Canvas>
        <Lifeline x={PE} label="Payee" color={c.cool} top={276} bottom={930} />
        <Lifeline x={PR} label="Payer" top={276} bottom={930} />
        <Lifeline x={MI} label="Mint" color={c.muted} top={276} bottom={930} />
        <Arrow x1={PE} y1={320} x2={PR - 6} y2={320} show={s >= 1} color={c.cool} font="mono" label="nutroot { k, l, b }" />
        <Packet x1={PE} y1={320} x2={PR} y2={320} run={proc.anim && s === 1} />
        <Arrow x1={PR} y1={640} x2={MI - 6} y2={640} show={s >= 4} color={c.muted} font="mono" label="swap to secret P" />
        <Arrow x1={PR} y1={710} x2={PE + 6} y2={710} show={s >= 4} color={c.clayHex} font="mono" label="proof + spend info { E, K, tree }" delay={300} />
        <Packet x1={PR} y1={710} x2={PE} y2={710} run={proc.anim && s === 4} color={c.clayHex} delay={700} />
      </Canvas>
      <NoteBox size={24} x={PR - 250} y={360} w={500} show={s >= 2}>
        fresh <M>(e, E)</M> per output · per key <M>P</M>: <M>Zx = x(e·P)</M>
        <br />
        <Code>rᵢ = SHA256("Cashu_P2BK_v1" ‖ Zx ‖ i)</Code>
      </NoteBox>
      <NoteBox size={24} x={PR - 250} y={470} w={500} show={s >= 3}>
        <M>K = k + r₀·G</M> · blinded keys in the leaves · <M>P = K + t·G</M>
      </NoteBox>
      <NoteBox size={24} x={PE - 190} y={770} w={560} show={s >= 5} tone={c.clayHex}>
        <M>Zx = x(p·E)</M> · tree = <Code>l</Code> · spend with <M>p + r₀ + t</M>
      </NoteBox>
      <StepList>
        <StepItem n={1} step={s}>
          Request: <Code>k, l, b</Code>
        </StepItem>
        <StepItem n={2} step={s}>
          ECDH per key
        </StepItem>
        <StepItem n={3} step={s}>
          Blind keys, build tree
        </StepItem>
        <StepItem n={4} step={s}>
          Swap, send
        </StepItem>
        <StepItem n={5} step={s}>
          Payee sweeps
        </StepItem>
      </StepList>
    </Shell>
  );
};

const CW = [300, 560, 360];
const CapRow = ({ i, use, how, nut }: { i: number; use: string; how: ReactNode; nut: string }) => (
  <Row i={i}>
    <Cell w={CW[0] + 60} color={c.muted}>
      {use}
    </Cell>
    <Cell w={CW[1] + 400}>{how}</Cell>
    <Cell w={CW[2]}>{nut}</Cell>
  </Row>
);

const Capabilities: Page = () => (
  <Shell n="2.4" eyebrow="Using nutroot" title="What the specification covers">
    <At x={120} y={260} w={1680}>
      <Row i={0} head>
        <Cell head w={CW[0] + 60}>Use</Cell>
        <Cell head w={CW[1] + 400}>Construction</Cell>
        <Cell head w={CW[2]}>NUT</Cell>
      </Row>
      <CapRow i={1} use="Bearer token" how={<>bare key, <M>k</M> in spend info</>} nut="10" />
      <CapRow i={2} use="Pay to a key" how="blinded receiver key" nut="28, 18" />
      <CapRow i={3} use="Multisig" how="threshold leaf, or MuSig2 / FROST key" nut="10" />
      <CapRow i={4} use="Timelocked refund" how="after leaf" nut="10" />
      <CapRow i={5} use="HTLC" how="hashlock leaf" nut="10, 14" />
      <CapRow i={6} use="Binding to data" how="commit leaf" nut="10" />
      <CapRow i={7} use="Auditable lock" how="NUMS key + one threshold leaf" nut="10" />
      <CapRow i={8} use="Locked mint quote" how="the quote signs as an input" nut="04, 20" />
      <CapRow i={9} use="Blind auth" how="point secret signs the request" nut="22" />
    </At>
  </Shell>
);

const BW = [300, 640, 740];
const VsBip341: Page = () => (
  <Shell n="2.4" eyebrow="Using nutroot" title="Nutroot compared with BIP341">
    <At x={120} y={260} w={1680}>
      <Row i={0} head>
        <Cell head w={BW[0]}> </Cell>
        <Cell head w={BW[1]}>BIP341</Cell>
        <Cell head w={BW[2]} color={c.clayHex}>
          Nutroot
        </Cell>
      </Row>
      <Row i={1}>
        <Cell w={BW[0]} color={c.muted}>Key</Cell>
        <Cell w={BW[1]}>32-byte x-only</Cell>
        <Cell w={BW[2]}>33-byte point</Cell>
      </Row>
      <Row i={2}>
        <Cell w={BW[0]} color={c.muted}>Tweak</Cell>
        <Cell w={BW[1]}>over x(P)</Cell>
        <Cell w={BW[2]}>over K, mod n</Cell>
      </Row>
      <Row i={3}>
        <Cell w={BW[0]} color={c.muted}>Leaves</Cell>
        <Cell w={BW[1]}>scripts with opcodes</Cell>
        <Cell w={BW[2]}>four condition types</Cell>
      </Row>
      <Row i={4}>
        <Cell w={BW[0]} color={c.muted}>Tree shape</Cell>
        <Cell w={BW[1]}>builder chooses</Cell>
        <Cell w={BW[2]}>fixed by sorting</Cell>
      </Row>
      <Row i={5}>
        <Cell w={BW[0]} color={c.muted}>Unknown data</Cell>
        <Cell w={BW[1]}>reserved for upgrades</Cell>
        <Cell w={BW[2]}>rejected</Cell>
      </Row>
      <Row i={6}>
        <Cell w={BW[0]} color={c.muted}>Signed message</Cell>
        <Cell w={BW[1]}>sighash</Cell>
        <Cell w={BW[2]}>transaction digest</Cell>
      </Row>
    </At>
    <At x={120} y={800} w={1680}>
      <div style={{ fontSize: 34 }}>Same structure. Not interchangeable with Bitcoin keys.</div>
    </At>
  </Shell>
);

const QW = [300, 640, 740];
const Comparison: Page = () => (
  <Shell n="2.4" eyebrow="Using nutroot" title="JSON secrets and nutroot secrets">
    <At x={120} y={260} w={1680}>
      <Row i={0} head>
        <Cell head w={QW[0]}> </Cell>
        <Cell head w={QW[1]}>JSON (v1, v2)</Cell>
        <Cell head w={QW[2]} color={c.clayHex}>
          Nutroot (v3)
        </Cell>
      </Row>
      <Row i={1}>
        <Cell w={QW[0]} color={c.muted}>Secret</Cell>
        <Cell w={QW[1]}>string, 195 to 323 B</Cell>
        <Cell w={QW[2]}>33 bytes, always</Cell>
      </Row>
      <Row i={2}>
        <Cell w={QW[0]} color={c.muted}>Revealed on spend</Cell>
        <Cell w={QW[1]}>the whole policy</Cell>
        <Cell w={QW[2]}>nothing, or one leaf</Cell>
      </Row>
      <Row i={3}>
        <Cell w={QW[0]} color={c.muted}>Signed</Cell>
        <Cell w={QW[1]}>the secret string</Cell>
        <Cell w={QW[2]}>the whole transaction</Cell>
      </Row>
      <Row i={4}>
        <Cell w={QW[0]} color={c.muted}>Unsupported mint</Cell>
        <Cell w={QW[1]}>anyone can spend</Cell>
        <Cell w={QW[2]}>v3 implies support</Cell>
      </Row>
      <Row i={5}>
        <Cell w={QW[0]} color={c.muted}>Combinations</Cell>
        <Cell w={QW[1]}>fixed per kind</Cell>
        <Cell w={QW[2]}>up to 8 leaves</Cell>
      </Row>
    </At>
    <At x={120} y={740} w={1680}>
      <div style={{ fontSize: 32 }}>Test vectors from two implementations: cashu-ts and nutshell.</div>
    </At>
  </Shell>
);

const End: Page = () => (
  <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <div style={{ fontFamily: SERIF, fontSize: 104, fontWeight: 500, letterSpacing: '-0.02em' }}>Questions</div>
    <div style={{ fontFamily: MONO, fontSize: 28, color: c.muted, marginTop: 48, lineHeight: 1.8 }}>
      <div>github.com/cashubtc/cdk · branch bls-federation</div>
      <div>calle · @callebtc</div>
    </div>
    <Footer />
  </div>
);


// Pre-rework styles, kept for the temporary variation decks (exported under the original names).
const StepItemLegacy = ({ n, step, children }: { n: number; step: number; children: ReactNode }) => {
  const on = step === n;
  const done = step > n;
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        padding: '5px 0 5px 16px',
        marginBottom: 10,
        borderLeft: `3px solid ${on ? c.clayHex : 'transparent'}`,
        color: on ? c.ink : done ? c.muted : c.dim,
        transition: `color 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 20,
          minWidth: 22,
          paddingTop: 4,
          color: on ? ACCENT : 'inherit',
          transition: `color 300ms ${EASE_OUT}`,
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 24, lineHeight: 1.38 }}>{children}</span>
    </div>
  );
};

const CheckLegacy = ({ ok = true, children }: { ok?: boolean; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 23, lineHeight: 1.4 }}>
    <span style={{ color: ok ? c.good : c.bad, fontFamily: MONO }}>{ok ? '✓' : '✗'}</span>
    <span>{children}</span>
  </div>
);

// ─── Variation decks (temporary) ─────────────────────────────────────────────
// Shared by the slides/fcv-* variation decks, which import from this file.

const VarShell = ({
  of,
  lens,
  title,
  proc,
  children,
}: {
  of: string;
  lens: string;
  title?: ReactNode;
  proc?: Proc;
  children?: ReactNode;
}) => (
  <div style={pageStyle}>
    <div style={{ fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.muted }}>
      <span
        style={{
          color: c.violet,
          border: `1.5px solid ${c.violet}`,
          borderRadius: 6,
          padding: '1px 10px',
          marginRight: 14,
          letterSpacing: '0.08em',
        }}
      >
        Variation
      </span>
      {of}
      <span style={{ color: c.violet }}> · {lens}</span>
    </div>
    {title && <Heading>{title}</Heading>}
    {children}
    <Footer proc={proc} />
  </div>
);

const VarCover = ({
  section,
  title,
  sources,
}: {
  section: string;
  title: string;
  sources: { n: string; title: string; count: number }[];
}) => (
  <div style={{ ...pageStyle, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Label color={c.violet}>Variations · temporary · section {section}</Label>
    <div style={{ fontFamily: SERIF, fontSize: 96, fontWeight: 500, letterSpacing: '-0.02em', margin: '20px 0 40px' }}>
      {title}
    </div>
    <div style={{ fontSize: 26, color: c.muted, marginBottom: 28 }}>
      Each group starts with the original slide, followed by its variations.
    </div>
    {sources.map((src) => (
      <div key={src.n + src.title} style={{ display: 'flex', gap: 24, fontSize: 30, lineHeight: 1.7 }}>
        <span style={{ fontFamily: MONO, fontSize: 24, color: ACCENT, width: 70 }}>{src.n}</span>
        <span style={{ width: 900 }}>{src.title}</span>
        <span style={{ color: c.muted, fontSize: 24 }}>{src.count} variations</span>
      </div>
    ))}
    <Footer />
  </div>
);

// ─── Export ──────────────────────────────────────────────────────────────────

export const meta: SlideMeta = {
  title: 'Federated Cashu',
  createdAt: '2026-09-27T15:15:55.523Z',
};

export default [
  Cover,
  OutlineAll,
  Chapter1,
  Model,
  FedParts,
  Paper,
  Built,
  Thanks,
  Section1,
  Bdhke,
  BlsFlow,
  Pairing,
  Multisig,
  Section2,
  Shamir,
  ThresholdSign,
  Section3,
  MixMatch,
  Consensus,
  Swap,
  Topology,
  Section4,
  Dkg,
  DkgOverview,
  DkgRounds,
  Recovery,
  Section5,
  CustodyQuorum,
  FrostDkg,
  TwoShares,
  Section6,
  Rewrite,
  SigAll,
  Summary,
  Chapter2,
  SectionN1,
  JsonSecret,
  JsonLimits,
  SectionN2,
  TaprootTree,
  TaprootSpend,
  SectionN3,
  PointSecret,
  NutrootTree,
  LeafEncoding,
  FoldShapes,
  NutrootSpends,
  ScriptVerify,
  InternalKey,
  SectionN4,
  SpendInfo,
  ReceiverKeyed,
  Capabilities,
  VsBip341,
  Comparison,
  End,
] satisfies Page[];

export { notes } from './speaker-notes';

// Named exports for the temporary variation decks (slides/fcv-*).
export {
  c,
  ACCENT,
  SERIF,
  SANS,
  MONO,
  MATH,
  EASE_OUT,
  EASE_IO,
  REDUCED,
  useBeats,
  useProcess,
  useEntered,
  useSha256,
  pageStyle,
  Eyebrow,
  Heading,
  ProcControls,
  Footer,
  Shell,
  Canvas,
  Fade,
  GFade,
  At,
  M,
  Up,
  Hi,
  Code,
  Note,
  Label,
  StepList,
  StepItemLegacy as StepItem,
  toneStroke,
  Member,
  WalletNode,
  Line,
  Draw,
  fontOf,
  Arrow,
  Packet,
  Dot,
  T,
  Band,
  Lifeline,
  ring,
  CoverFigure,
  Cover,
  SECTION_TITLES,
  OUTLINE_TOP,
  OUTLINE_ROW,
  OUTLINE_COL,
  OutlineRow,
  ChapterHead,
  Outline,
  OutlineAll,
  Section1,
  Section2,
  Section3,
  Section4,
  Section5,
  Section6,
  SectionN1,
  SectionN2,
  SectionN3,
  SectionN4,
  ChapterTitle,
  Chapter1,
  Chapter2,
  Fact,
  Model,
  EQ,
  Lanes,
  Bdhke,
  BlsFlow,
  DerivLine,
  Pairing,
  Cell,
  Row,
  KW,
  Keysets,
  XW,
  Multisig,
  Shamir,
  SUBSETS,
  ShareCard,
  Lagrange,
  ThresholdSign,
  GridCell,
  ColumnStatus,
  RequestRow,
  MixMatch,
  ENV_A,
  ENV_B,
  Envelope,
  OpId,
  OperationId,
  LogRow,
  EnvChip,
  ShareTag,
  Consensus,
  PipeStage,
  PIPE_X,
  PipeArrows,
  Swap,
  MintQuote,
  Topology,
  Dkg,
  P2P,
  DkgRounds,
  ROSTER_A,
  ROSTER_B,
  RosterLine,
  FederationId,
  JOURNAL_X,
  Block,
  Journal,
  Recovery,
  Funding,
  Badge,
  CHAIN_X,
  ChainChip,
  KeyMaterial,
  Melt,
  Rewrite,
  Seg,
  OutputSegs,
  Transcript,
  DBox,
  InputDigest,
  RuleCard,
  InputsSign,
  SW,
  Summary,
  Fig,
  FigSvg,
  nodeBorder,
  nodeBg,
  TNode,
  Edge,
  Pre,
  P2PK_ESCAPED,
  JsonSecret,
  Limit,
  JsonLimits,
  TapTree,
  TaprootTree,
  TaprootSpend,
  PointSecret,
  NX,
  LeafCard,
  NutTree,
  NutrootTree,
  LeafEncoding,
  foldLayout,
  FoldShapes,
  NutrootSpends,
  JLine,
  CheckLegacy as Check,
  ScriptVerify,
  KeyCard,
  InternalKey,
  FlowBox,
  SIW,
  SpendInfo,
  NoteBox,
  ReceiverKeyed,
  CW,
  Capabilities,
  BW,
  VsBip341,
  QW,
  Comparison,
  End,
  VarShell,
  VarCover,
  FedRow,
  FedParts,
  PartCard,
  Paper,
  BigStat,
  Built,
  ThanksRow,
  Thanks,
  DKG_ROWS,
  TxSide,
  SigAll,
  LEAF_TYPES,
  CapRow,
  ORD_REQ,
  OrdChip,
  FlowChip,
  DAY,
  TriPanel,
  DkgOverview,
  CustodyQuorum,
  FrostDkg,
  TwoShares,
};
export type {
  StepRegistration,
  StepHost,
  Proc,
  Tone,
  LabelFont,
  SectionRef,
  Subset,
  NodeTone,
  TapMode,
  NutMode,
  FoldNode,
  FoldEdge,
};
