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
      <div style={{ fontSize: 34, color: c.muted, lineHeight: 1.4, maxWidth: 880 }}>
        Threshold BLS issuance, consensus-ordered signing and threshold custody in the Cashu Development Kit
      </div>
      <div style={{ fontFamily: MONO, fontSize: 24, color: c.dim, marginTop: 64 }}>calle · github.com/cashubtc/cdk</div>
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

const OUTLINE_TOP = 372;
const OUTLINE_ROW = 84;
const OUTLINE_COL = [120, 1000];

const OutlineRow = ({ n, title, topics, state }: { n: string; title: string; topics: string; state: 'on' | 'off' | 'all' }) => (
  <div style={{ height: OUTLINE_ROW, color: state === 'off' ? c.dim : c.ink, transition: `color 400ms ${EASE_OUT}` }}>
    <div style={{ display: 'flex', alignItems: 'baseline' }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 21,
          width: 64,
          color: state === 'off' ? c.dim : ACCENT,
          transition: `color 400ms ${EASE_OUT}`,
        }}
      >
        {n}
      </span>
      <span style={{ fontFamily: SERIF, fontSize: 34 }}>{title}</span>
    </div>
    <div
      style={{
        marginLeft: 64,
        fontSize: 21,
        color: state === 'off' ? c.dim : c.muted,
        transition: `color 400ms ${EASE_OUT}`,
      }}
    >
      {topics}
    </div>
  </div>
);

const ChapterHead = ({ n, title, dim }: { n: number; title: string; dim: boolean }) => (
  <div style={{ height: 114, color: dim ? c.dim : c.ink, transition: `color 400ms ${EASE_OUT}` }}>
    <Label color={dim ? c.dim : c.clayHex}>Chapter {n}</Label>
    <div style={{ fontFamily: SERIF, fontSize: 46, marginTop: 6 }}>{title}</div>
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
            top: OUTLINE_TOP + at.i * OUTLINE_ROW + 4,
            width: 4,
            height: 64,
            borderRadius: 2,
            background: ACCENT,
            transition: `top 600ms ${EASE_IO}, left 600ms ${EASE_IO}`,
          }}
        />
      )}
      <At x={OUTLINE_COL[0]} y={258} w={800}>
        <ChapterHead n={1} title="Federating Cashu" dim={at !== undefined && at.ch !== 1} />
        <OutlineRow n="1.1" title="BLS blind signatures" topics="BDHKE, pairings, keyset v3" state={st(1, 0)} />
        <OutlineRow n="1.2" title="Threshold issuance" topics="Shamir shares, Lagrange, wallet-side aggregation" state={st(1, 1)} />
        <OutlineRow n="1.3" title="Ordering" topics="mix-and-match, operation IDs, consensus, request flows" state={st(1, 2)} />
        <OutlineRow n="1.4" title="Keys and membership" topics="DKG, federation ID, recovery" state={st(1, 3)} />
        <OutlineRow n="1.5" title="Custody" topics="funding backends, FROST, melt" state={st(1, 4)} />
        <OutlineRow n="1.6" title="Client intent" topics="proof rewriting, transaction transcript, input signatures" state={st(1, 5)} />
      </At>
      <At x={OUTLINE_COL[1]} y={258} w={800}>
        <ChapterHead n={2} title="Nutroot" dim={at !== undefined && at.ch !== 2} />
        <OutlineRow n="2.1" title="Spending conditions today" topics="NUT-10 JSON secrets, P2PK, HTLC" state={st(2, 0)} />
        <OutlineRow n="2.2" title="Taproot" topics="BIP340/341 output keys, key path, script path" state={st(2, 1)} />
        <OutlineRow n="2.3" title="Nutroot secrets" topics="point secrets, leaves, tree fold, spends, internal keys" state={st(2, 2)} />
        <OutlineRow n="2.4" title="Using nutroot" topics="spend info, receiver keys, capabilities, BIP341 differences" state={st(2, 3)} />
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
        <Label color={c.clayHex}>Chapter {n}</Label>
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
        <div style={{ fontSize: 32, color: c.muted, maxWidth: 1200, lineHeight: 1.4 }}>{sub}</div>
      </Fade>
      <Footer />
    </div>
  );
};

const Chapter1: Page = () => (
  <ChapterTitle
    n={1}
    title="Federating Cashu"
    sub="A Cashu mint operated by n members: threshold BLS issuance, consensus-ordered signing, threshold custody."
  />
);
const Chapter2: Page = () => (
  <ChapterTitle
    n={2}
    title="Nutroot"
    sub={
      <>
        Point secrets and condition trees for v3 keysets. Specification: <Code>cashubtc/nuts#443</Code>, NUT-10 and
        per-NUT deltas.
      </>
    }
  />
);

const Fact = ({ k, children }: { k: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 20, padding: '14px 0', borderBottom: `1px solid ${c.rule}` }}>
    <span style={{ width: 130, flexShrink: 0 }}>{k}</span>
    <span style={{ fontSize: 24, color: c.muted, lineHeight: 1.4 }}>{children}</span>
  </div>
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
    <Shell eyebrow="Setting" title="System model" proc={proc}>
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
            key k, reserves
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
      <At x={1180} y={270} w={620}>
        <Fact k={<M size={34}>n</M>}>members in a fixed roster</Fact>
        <Fact k={<M size={34}>t</M>}>signing threshold: BLS shares per signature</Fact>
        <Fact k={<M size={34}>c</M>}>
          consensus threshold, <M>c = n − ⌊(n − 1)/3⌋</M>, with <M>t ≤ c</M>
        </Fact>
        <Fact k={<M size={34}>q</M>}>
          payment observation quorum, <M>q ≥ c</M>
        </Fact>
        <Fact k={<span style={{ fontSize: 24 }}>wallet</span>}>sends each request to every member and aggregates the responses</Fact>
        <Fact k={<span style={{ fontSize: 24 }}>members</span>}>order operations with AlephBFT before signing</Fact>
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
      <At x={120} y={908} w={1200}>
        <Note>
          Wallet-side verification needs a DLEQ proof (NUT-12). With <M>k</M> split across members, checking{' '}
          <M>k·Y = C</M> becomes an interactive threshold computation on every redemption.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Hash the secret <M>x</M> to a curve point <M>Y</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Blind with a random scalar <M>r</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Send <M>B′</M> to the mint.
        </StepItem>
        <StepItem n={4} step={s}>
          Mint multiplies by its private key <M>k</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          Mint returns <M>C′</M>.
        </StepItem>
        <StepItem n={6} step={s}>
          Unblind with the public key <M>K = k·G</M>.
        </StepItem>
        <StepItem n={7} step={s}>
          On redemption the mint recomputes <M>k·Y</M>. This requires <M>k</M>.
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
      <At x={900} y={680} w={420}>
        <Fade show={s >= 1}>
          <Note>
            <div>
              <Code>H</Code>: hash-to-curve, DST
            </div>
            <div style={{ fontFamily: MONO, fontSize: 18, color: c.ink, margin: '4px 0 12px' }}>
              CASHU_BLS12_381_G1_XMD:SHA-256_SSWU_RO_
            </div>
            <div>G₁: 48 B messages and signatures</div>
            <div>G₂: 96 B public keys</div>
            <div>DLEQ on v3: rejected</div>
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Hash <M>x</M> to <M>Y</M> in G₁ (standard hash-to-curve).
        </StepItem>
        <StepItem n={2} step={s}>
          Blind by scalar multiplication, <M>r ∈ 𝔽ᵣ*</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Send <M>B′</M> to the mint.
        </StepItem>
        <StepItem n={4} step={s}>
          Mint multiplies by <M>k</M>, as before.
        </StepItem>
        <StepItem n={5} step={s}>
          Wallet checks <M>C′</M> against the public key <M>K = k·G₂</M>.
        </StepItem>
        <StepItem n={6} step={s}>
          Unblind with <M>r⁻¹</M>. Any party verifies <M>C</M> with <M>K</M> only.
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
      <At x={120} y={800} w={1680}>
        <div style={{ height: 1, background: c.rule, marginBottom: 22 }} />
        <Note>
          <div>
            Blind check before unblinding: <M>e(C′, G₂) = e(B′, K)</M>, same derivation without <M>r</M>.
          </div>
          <div>
            Batch verification: <M>e(Σ hᵢ·Cᵢ, G₂) = Π e(hᵢ·Yᵢ, Kᵢ)</M>, weights <M>hᵢ</M> from a SHA-256 transcript{' '}
            <Code>Cashu_BLS_Batch_v1</Code>, rejection-sampled into <M>𝔽ᵣ*</M>.
          </div>
        </Note>
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
  <Shell n="1.1" eyebrow="BLS blind signatures" title="Threshold BLS compared with t-of-n secp multisig">
    <At x={120} y={262} w={1680}>
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
          <M>x</M>, <M>t</M> signatures, roster, policy
        </Cell>
        <Cell w={XW[2]}>
          <M>x</M>, one <M>C</M>
        </Cell>
      </Row>
      <Row i={2}>
        <Cell w={XW[0]} color={c.muted}>Wallet verification</Cell>
        <Cell w={XW[1]}>
          <M>t</M> DLEQ checks and a policy check
        </Cell>
        <Cell w={XW[2]}>one pairing, or one batch</Cell>
      </Row>
      <Row i={3}>
        <Cell w={XW[0]} color={c.muted}>Keyset</Cell>
        <Cell w={XW[1]}>member keys plus roster history</Cell>
        <Cell w={XW[2]}>
          one aggregate <M>K</M> per amount
        </Cell>
      </Row>
      <Row i={4}>
        <Cell w={XW[0]} color={c.muted}>Receiver</Cell>
        <Cell w={XW[1]}>must implement the federation format</Cell>
        <Cell w={XW[2]}>any v3 wallet verifies offline</Cell>
      </Row>
      <Row i={5}>
        <Cell w={XW[0]} color={c.muted}>Signer set visible</Cell>
        <Cell w={XW[1]}>yes</Cell>
        <Cell w={XW[2]}>
          no: every subset yields the same <M>C</M>
        </Cell>
      </Row>
      <Row i={6}>
        <Cell w={XW[0]} color={c.muted}>Consensus needed</Cell>
        <Cell w={XW[1]}>yes</Cell>
        <Cell w={XW[2]}>yes</Cell>
      </Row>
    </At>
    <At x={120} y={760} w={1680}>
      <Note>
        Both keep blindness and <M>t</M>-of-<M>n</M> availability. Neither removes consensus, replay protection,
        catch-up or payment observation. Threshold Schnorr (FROST) over the secret would be a different token format.
      </Note>
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
          Sample <M>f(x) = k + a₁x + … + aₜ₋₁xᵗ⁻¹</M>, so <M>f(0) = k</M>. With <M>t = 2</M>, <M>f</M> is a line.
        </StepItem>
        <StepItem n={2} step={s}>
          Member <M>i</M> stores <M>kᵢ = f(i)</M>. Member IDs are non-zero.
        </StepItem>
        <StepItem n={3} step={s}>
          One share is consistent with every line; it reveals nothing about <M>k</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          Any <M>t</M> shares fix <M>f</M>, and with it <M>f(0)</M>.
        </StepItem>
        <Note style={{ marginTop: 26, fontSize: 22 }}>
          One polynomial per amount in the keyset. Issuance never reconstructs <M>k</M>; interpolation is applied to
          signature shares.
        </Note>
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
          Wallet blinds the secret once.
        </StepItem>
        <StepItem n={2} step={s}>
          It sends the same request to every member's public URL.
        </StepItem>
        <StepItem n={3} step={s}>
          Member <M>i</M> returns <M>C′ᵢ = kᵢ·B′</M> (<Code>blind_sign_share</Code>).
        </StepItem>
        <StepItem n={4} step={s}>
          m2 does not answer. <M>t = 2</M> responses are enough.
        </StepItem>
        <StepItem n={5} step={s}>
          Each share is checked against the member's public share <M>Kᵢ</M>; invalid shares are dropped.
        </StepItem>
        <StepItem n={6} step={s}>
          Wallet interpolates with the weights for <M>S = {'{1, 3}'}</M>.
        </StepItem>
        <StepItem n={7} step={s}>
          Unblind and verify against the aggregate key <M>K</M>. Members never exchange shares.
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
      <div style={{ fontSize: 26, color: c.muted, marginTop: 10 }}>
        <M>t = 2</M>, <M>n = 3</M>. The wallet paid a mint quote for two outputs and sends each member a different pair.
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
          m1 signs <M>A, B</M>. The request matches the paid amount.
        </StepItem>
        <StepItem n={2} step={s}>
          m2 signs <M>B, C</M>. <M>B</M> now has <M>t</M> shares.
        </StepItem>
        <StepItem n={3} step={s}>
          m3 signs <M>C, A</M>. <M>A</M> and <M>C</M> now have <M>t</M> shares.
        </StepItem>
        <StepItem n={4} step={s}>
          Three valid signatures for a two-output quote. Each member saw a valid request.
        </StepItem>
        <Note style={{ marginTop: 26, fontSize: 22 }}>
          Swap variant: fixed inputs, overlapping output windows. Regression test: windows ABC, BCD, CDA, DAB against
          one 3-output quote.
        </Note>
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

const Consensus: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const ha = useSha256(ENV_A).slice(0, 4);
  const hb = useSha256(ENV_B).slice(0, 4);
  return (
    <Shell n="1.3" eyebrow="Ordering" title="Consensus before signing" proc={proc}>
      <EnvChip op={ha} outs="A, B" color={c.clayHex} into={s >= 1} y={330} />
      <EnvChip op={hb} outs="B, C" color={c.violet} into={s >= 1} y={430} />
      <div
        style={{
          position: 'absolute',
          left: 470,
          top: 300,
          width: 320,
          height: 220,
          boxSizing: 'border-box',
          border: `1.75px solid ${s >= 1 ? c.node : c.rule}`,
          background: c.panel,
          borderRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `border-color 300ms ${EASE_OUT}`,
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 36 }}>AlephBFT</div>
        <div style={{ fontSize: 22, color: c.muted, marginTop: 6 }}>total order</div>
      </div>
      <Canvas>
        <Arrow x1={800} y1={410} x2={860} y2={410} show={s >= 2} />
      </Canvas>
      <At x={880} y={300} w={420}>
        <LogRow n="#41" op={ha} verdict="applied: quote issued" ok show={s >= 2} />
        <LogRow n="#42" op={hb} verdict="fails at apply: quote already issued" ok={false} show={s >= 3} />
      </At>
      <At x={120} y={600} w={1180}>
        <Fade show={s >= 4}>
          <div style={{ display: 'flex', gap: 20 }}>
            <ShareTag m="m1" op={ha} />
            <ShareTag m="m2" op={ha} />
            <ShareTag m="m3" op={ha} />
          </div>
        </Fade>
      </At>
      <At x={120} y={720} w={1180}>
        <Fade show={s >= 5}>
          <Note>
            <div>Conflict keys: mint and melt quote IDs. Swaps have none; the proof store at apply is the spend lock.</div>
            <div>Replay is idempotent: the same operation yields the same state and the same shares.</div>
            <div>
              A signing threshold <M>t</M> below the consensus threshold <M>c</M> is safe only because signing follows
              ordering.
            </div>
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Members submit envelopes to consensus instead of signing on receipt.
        </StepItem>
        <StepItem n={2} step={s}>
          Consensus emits one order. #41 is applied.
        </StepItem>
        <StepItem n={3} step={s}>
          #42 targets the same quote and fails when applied.
        </StepItem>
        <StepItem n={4} step={s}>
          Members sign only the outputs of accepted operations; shares are bound to the operation ID.
        </StepItem>
        <StepItem n={5} step={s}>
          Conflict keys, replay, thresholds.
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
      <div style={{ fontSize: 22, color: c.muted, lineHeight: 1.45, marginTop: 12 }}>{children}</div>
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

const Swap: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <Shell n="1.3" eyebrow="Ordering" title="Federated swap" proc={proc}>
      <PipeArrows proc={proc} />
      <PipeStage x={PIPE_X[0]} n={1} title="Request" step={s}>
        <div>
          <Code>POST /v1/swap</Code>
        </div>
        <div>to every member's public URL</div>
        <div>identical body</div>
      </PipeStage>
      <PipeStage x={PIPE_X[1]} n={2} title="Admission" step={s}>
        <div>unique inputs</div>
        <div>v3 outputs, unique</div>
        <div>content bounds</div>
        <div>proofs and spending conditions verify</div>
      </PipeStage>
      <PipeStage x={PIPE_X[2]} n={3} title="Consensus" step={s}>
        <div>
          envelope → <Code>operation_id</Code>
        </div>
        <div>total order</div>
        <div>first swap spending the inputs wins</div>
      </PipeStage>
      <PipeStage x={PIPE_X[3]} n={4} title="Apply" step={s}>
        <div>check the balance incl. fees</div>
        <div>mark inputs spent</div>
        <div>
          sign outputs: <M>C′ᵢ = kᵢ·B′</M>
        </div>
      </PipeStage>
      <PipeStage x={PIPE_X[4]} n={5} title="Aggregate" step={s} tone={c.cool}>
        <div>
          wallet collects <M>t</M> shares per output
        </div>
        <div>interpolate, unblind</div>
        <div>
          verify against <M>K</M>
        </div>
      </PipeStage>
      <At x={120} y={660} w={1680}>
        <div style={{ height: 1, background: c.rule, marginBottom: 22 }} />
        <Note>
          <div>Members that lag behind the consensus log fail closed and return no shares.</div>
          <div>
            An offline member catches up from the journal, then serves the accepted shares; it cannot sign another
            output set for spent inputs.
          </div>
          <div>Restore returns the stored shares of the accepted operation, never new ones.</div>
          <div>Swaps carry no conflict key: a second swap over the same inputs fails at apply with <Code>TokenAlreadySpent</Code>.</div>
        </Note>
      </At>
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
          <Note style={{ marginTop: 8 }}>
            Cashu HTTP API on each member's <Code>public_mint_url</Code>. The wallet fans out and aggregates.
          </Note>
        </Fade>
      </At>
      <At x={120} y={720} w={290}>
        <Fade show={s >= 2} dimTo={0.35}>
          <Label color={c.violet}>Private plane</Label>
          <Note style={{ marginTop: 8 }}>
            <Code>/federation/v1</Code>, member-authenticated: consensus, journal catch-up, DKG.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Wallets use the public plane only. Responses are aggregated client-side.
        </StepItem>
        <StepItem n={2} step={s}>
          Members order operations on the private plane. Wallets never see it.
        </StepItem>
        <StepItem n={3} step={s}>
          Two members offline: signing needs <M>t</M> responses, ordering needs <M>c</M> members.
        </StepItem>
        <Note style={{ marginTop: 26, fontSize: 22 }}>
          Both planes run over HTTPS or iroh. The transport does not change the protocol.
        </Note>
      </StepList>
    </Shell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 04 · Keys and membership
// ═════════════════════════════════════════════════════════════════════════════

const Dkg: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const X = (x: number) => 220 + 280 * x;
  const Y = (y: number) => 900 - 52 * y;
  const f1 = (x: number) => 1.5 + 0.8 * x;
  const f2 = (x: number) => 3 - 0.4 * x;
  const f3 = (x: number) => 1 + 0.6 * x;
  const sum = (x: number) => f1(x) + f2(x) + f3(x);
  const lineOp = s >= 3 ? 0.3 : 1;
  const sub = ['₁', '₂', '₃'];
  return (
    <Shell n="1.4" eyebrow="Keys and membership" title="Distributed key generation" proc={proc}>
      <Canvas>
        <Line x1={220} y1={900} x2={1220} y2={900} color={c.node} />
        <Line x1={220} y1={900} x2={220} y2={330} color={c.node} />
        <Draw x1={X(0)} y1={Y(f1(0))} x2={X(3.5)} y2={Y(f1(3.5))} show={s >= 1} color={c.cool} width={2.5} opacity={lineOp} />
        <Draw x1={X(0)} y1={Y(f2(0))} x2={X(3.5)} y2={Y(f2(3.5))} show={s >= 1} color={c.violet} width={2.5} delay={80} opacity={lineOp} />
        <Draw x1={X(0)} y1={Y(f3(0))} x2={X(3.5)} y2={Y(f3(3.5))} show={s >= 1} color={c.good} width={2.5} delay={160} opacity={lineOp} />
        <T x={X(3.5) + 16} y={Y(f1(3.5)) + 10} size={28} font="math" anchor="start" color={c.cool} show={s >= 1}>
          f₁
        </T>
        <T x={X(3.5) + 16} y={Y(f2(3.5)) + 10} size={28} font="math" anchor="start" color={c.violet} show={s >= 1}>
          f₂
        </T>
        <T x={X(3.5) + 16} y={Y(f3(3.5)) + 10} size={28} font="math" anchor="start" color={c.good} show={s >= 1}>
          f₃
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
            <Dot x={X(i)} y={Y(sum(i))} r={9} show={s >= 3} delay={600 + i * 60} />
            <T x={X(i)} y={Y(sum(i)) - 24} size={30} font="math" show={s >= 3} delay={600 + i * 60}>
              {`k${sub[i - 1]}`}
            </T>
          </g>
        ))}
        <Draw x1={X(0)} y1={Y(sum(0))} x2={X(3.5)} y2={Y(sum(3.5))} show={s >= 3} width={3} />
        <T x={X(3.5) + 16} y={Y(sum(3.5)) + 10} size={28} font="math" anchor="start" color={c.clayHex} show={s >= 3}>
          f
        </T>
        <GFade show={s >= 4}>
          <circle cx={X(0)} cy={Y(sum(0))} r={18} style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 2, strokeDasharray: '4 5' }} />
          <T x={190} y={Y(sum(0)) + 12} size={40} font="math" anchor="end" color={c.clayHex}>
            k
          </T>
        </GFade>
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Member <M>j</M> samples its own polynomial <M>fⱼ</M> of degree <M>t − 1</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          It sends <M>fⱼ(i)</M> privately to member <M>i</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Member <M>i</M> sums what it received: <M>kᵢ = Σⱼ fⱼ(i) = f(i)</M> with <M>f = Σⱼ fⱼ</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          <M>k = f(0) = Σⱼ fⱼ(0)</M> is never computed. <M>K = k·G₂</M> is published.
        </StepItem>
        <Note style={{ marginTop: 26, fontSize: 22 }}>
          Dealer-free DKG (<Code>PedersenDkg</Code> in code) with Feldman-style commitments <M>aⱼ,ₗ·G₂</M>, once per
          amount. The trusted-dealer setup used in tests ends in the same state.
          <div style={{ marginTop: 6 }}>
            <Code>cdk-common/src/federation/dkg.rs</Code>
          </div>
        </Note>
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
        <Band x1={A - 60} x2={C + 60} y={314} label="readiness: same ceremony ID and keyset policy" show={s >= 1} />
        <Band x1={A - 60} x2={C + 60} y={378} label="commitment: SHA-256 of the member's reveal" show={s >= 2} />
        <Band x1={A - 60} x2={C + 60} y={442} label="reveal: Aⱼ,ₗ = aⱼ,ₗ·G₂ for every amount" show={s >= 3} />
        <P2P x1={A} x2={B} y={494} show={s >= 4} delay={0} color={c.cool} />
        <P2P x1={A} x2={C} y={516} show={s >= 4} delay={60} color={c.cool} />
        <P2P x1={B} x2={A} y={538} show={s >= 4} delay={120} color={c.violet} />
        <P2P x1={B} x2={C} y={560} show={s >= 4} delay={180} color={c.violet} />
        <P2P x1={C} x2={A} y={582} show={s >= 4} delay={240} color={c.good} />
        <P2P x1={C} x2={B} y={604} show={s >= 4} delay={300} color={c.good} />
        <T x={C + 90} y={556} size={22} font="mono" anchor="start" color={c.muted} show={s >= 4}>
          fⱼ(i)
        </T>
        <Band x1={A - 60} x2={C + 60} y={660} label="check fⱼ(i)·G₂ = Σₗ iˡ·Aⱼ,ₗ · kᵢ = Σⱼ fⱼ(i) · K = Σⱼ Aⱼ,₀" show={s >= 5} tone="clay" />
        <Band x1={A - 60} x2={C + 60} y={726} label="transcript signature by each identity key" show={s >= 6} />
        <Band x1={A - 60} x2={C + 60} y={792} label="activation: same transcript hash and final config digest" show={s >= 7} tone="cool" />
        <T x={(A + C) / 2} y={862} size={22} color={c.muted} show={s >= 7}>
          then FROST rounds 1, 2 and confirmation for the treasury root
        </T>
        <T x={(A + C) / 2} y={900} size={21} color={c.muted} show={s >= 1}>
          Every message is a signed request to every member; there is no broadcast channel.
        </T>
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Each member confirms it runs the exact ceremony and keyset policy.
        </StepItem>
        <StepItem n={2} step={s}>
          Each member sends a hash of its reveal first, so no member can choose its polynomial after seeing others.
        </StepItem>
        <StepItem n={3} step={s}>
          After all commitments arrive, members reveal their G₂ commitments.
        </StepItem>
        <StepItem n={4} step={s}>
          Point-to-point delivery of <M>fⱼ(i)</M> on the private plane.
        </StepItem>
        <StepItem n={5} step={s}>
          Each value is checked against the sender's commitments; each member stores its share.
        </StepItem>
        <StepItem n={6} step={s}>
          Members sign the public transcript hash.
        </StepItem>
        <StepItem n={7} step={s}>
          All members confirm the finalized config. No ecash is signed before activation.
        </StepItem>
      </StepList>
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
        <Note style={{ marginTop: 26 }}>
          Not recoverable from peers: identity key, BLS key shares, sealed FROST share. Without them the seat cannot
          sign, and replacing it requires a new roster.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Restore a checkpoint: snapshot, manifest and secrets from one backup generation.
        </StepItem>
        <StepItem n={2} step={s}>
          Request the journal suffix from peers.
        </StepItem>
        <StepItem n={3} step={s}>
          Replay accepted operations deterministically: same operation, same state, same shares.
        </StepItem>
        <StepItem n={4} step={s}>
          Check log positions and digests against a checkpoint signed by at least <M>c</M> members.
        </StepItem>
        <StepItem n={5} step={s}>
          Readiness gate passes. Until then the member does not sign.
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
      <At x={120} y={780} w={1000}>
        <div style={{ position: 'relative', height: 150 }}>
          <Fade show={s === 1} style={{ position: 'absolute', inset: 0 }}>
            <Note>
              <div style={{ color: c.bad }}>The node operator can:</div>
              <div>mark unpaid quotes paid · refuse or redirect melts · spend the reserves</div>
              <div>Consensus among members does not constrain a key they do not hold.</div>
            </Note>
          </Fade>
          <Fade show={s >= 2} style={{ position: 'absolute', inset: 0 }}>
            <Note>
              <div style={{ color: c.good }}>Invoices, payments and withdrawals are consensus operations.</div>
              <div>
                Spending requires <M>t</M> FROST signers from the same roster.
              </div>
            </Note>
          </Fade>
        </div>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Federated issuance over a single-operator Lightning or on-chain backend.
        </StepItem>
        <StepItem n={2} step={s}>
          Threshold custody: the members that sign ecash also sign treasury transactions.
        </StepItem>
        <Note style={{ marginTop: 26, fontSize: 22 }}>
          <div>Federated BDK: on-chain treasury.</div>
          <div>Federated Bark: Lightning treasury.</div>
          <div style={{ marginTop: 10 }}>
            <Code>development_single_observation</Code> and <Code>fakewallet</Code> are test-only.
          </div>
        </Note>
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
      <At x={120} y={352} w={520}>
        <Fade show={s >= 1} dimTo={0.3}>
          <div style={{ fontSize: 24 }}>
            ecash: BLS12-381, <M>K</M> in G₂, per amount
          </div>
        </Fade>
        <Fade show={s >= 2} dimTo={0.3} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 24 }}>treasury: FROST on secp256k1, one root</div>
        </Fade>
      </At>
      <At x={120} y={480} w={1680}>
        <Note>
          <div>
            Same roster, ceremony ID and signature threshold. Startup is complete only when both ceremonies finish; the
            secrets never mix.
          </div>
          <div>
            FROST: <Code>frost-secp256k1-tr 3.0.0</Code>, ciphersuite <Code>secp256k1_sha256_tr_v1</Code>. Three rounds
            on the private plane: commitments, per-recipient packages, root confirmation. Each message binds federation,
            ceremony, epoch, threshold, roster, sender and receiver. Shares are sealed with AES-256-GCM.
          </div>
        </Note>
      </At>
      <At x={120} y={712}>
        <Fade show={s >= 3}>
          <Label color={c.cool}>Derivation from the untweaked root, in order</Label>
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
      <At x={120} y={872} w={1680}>
        <Fade show={s >= 3} delay={500}>
          <Note>
            BDK and Bark derive from <M>P</M>; there is no second DKG. Any <M>t</M> members produce one BIP340 signature;
            the private key is never reconstructed.
          </Note>
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
        <div>
          <Code>make_payment</Code> creates an intent
        </div>
        <div>Melt operation through consensus</div>
        <div>no funds move</div>
      </PipeStage>
      <PipeStage x={PIPE_X[1]} n={2} title="Proposal" step={s}>
        <div>
          <Code>TransactionProposal</Code>
        </div>
        <div>exact unsigned transaction</div>
        <div>ordered like any operation</div>
      </PipeStage>
      <PipeStage x={PIPE_X[2]} n={3} title="Recompute" step={s}>
        <div>every member checks:</div>
        <div>input ownership, value conservation, fee cap, destination, sighashes</div>
      </PipeStage>
      <PipeStage x={PIPE_X[3]} n={4} title="FROST sign" step={s} tone={c.cool}>
        <div>authorization binds operation, tx, input index, sighash</div>
        <div>nonces burn on failure, never reused</div>
      </PipeStage>
      <PipeStage x={PIPE_X[4]} n={5} title="Persist, broadcast" step={s}>
        <div>
          <Code>TransactionSigned</Code> stored
        </div>
        <div>
          then <Code>BroadcastIntent</Code>
        </div>
        <div>replay broadcasts the same bytes</div>
      </PipeStage>
      <At x={120} y={660} w={1680}>
        <div style={{ height: 1, background: c.rule, marginBottom: 22 }} />
        <Note>
          <div>
            A single member can propose. It cannot change the destination, get a different transaction signed, or
            broadcast different bytes.
          </div>
          <div>
            Deposits: addresses are allocated by consensus (quote, epoch, keychain, index). A deposit needs the
            observation quorum and confirmation depth.
          </div>
          <div>A reorg before issuance withdraws the observation; after issuance it raises an alarm and does not unmint.</div>
          <div>Nonce lifecycle (cdk-frost): Generated → Reserved → CommitmentSent → Signing → ShareProduced → Consumed; failures burn the nonce.</div>
        </Note>
      </At>
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
          <span style={{ fontFamily: MONO, fontSize: 22, color: c.cool }}>swap P₁ P₂ → A B</span>
        </Fade>
      </At>
      <At x={560} y={800} w={400}>
        <Fade show={s >= 2}>
          <span style={{ fontFamily: MONO, fontSize: 22, color: c.bad }}>swap P₁ P₂ → X Y</span>
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
      <At x={1000} y={680} w={320}>
        <Fade show={s >= 3} style={{ marginBottom: 14 }}>
          <div
            style={{
              border: `1.5px solid ${c.bad}`,
              background: c.badSoft,
              borderRadius: 10,
              padding: '10px 18px',
              fontFamily: MONO,
              fontSize: 21,
            }}
          >
            #57 → X Y <span style={{ color: c.bad }}>applied</span>
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
              fontSize: 21,
              color: c.dim,
            }}
          >
            #58 → A B inputs spent
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Fan-out gives every member the bearer proofs <M>(x, C)</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          m3 builds a swap of the same inputs to its own outputs and submits it first.
        </StepItem>
        <StepItem n={3} step={s}>
          Consensus orders #57 first. The wallet's swap fails with <Code>TokenAlreadySpent</Code>.
        </StepItem>
        <StepItem n={4} step={s}>
          The shares for X, Y are valid. A pre-v3 bearer proof carries no witness, so nothing binds it to the owner's outputs.
        </StepItem>
        <Note style={{ marginTop: 26, fontSize: 22 }}>
          Audit SEC-2026-07-17-01. DKG protects <M>k</M>, not bearer secrets; consensus picks one operation, not the
          owner's.
        </Note>
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
    <At x={120} y={262} w={1680}>
      <Row h={66} i={0} head>
        <Cell head w={SW[0]}>Concern</Cell>
        <Cell head w={SW[1]}>Mechanism</Cell>
      </Row>
      <Row h={66} i={1}>
        <Cell w={SW[0]} color={c.muted}>Verification without k</Cell>
        <Cell w={SW[1]}>BLS12-381 pairings, keyset v3</Cell>
      </Row>
      <Row h={66} i={2}>
        <Cell w={SW[0]} color={c.muted}>Split signing key</Cell>
        <Cell w={SW[1]}>Shamir shares, wallet-side interpolation</Cell>
      </Row>
      <Row h={66} i={3}>
        <Cell w={SW[0]} color={c.muted}>Mix-and-match</Cell>
        <Cell w={SW[1]}>operation IDs, AlephBFT before signing</Cell>
      </Row>
      <Row h={66} i={4}>
        <Cell w={SW[0]} color={c.muted}>Wallet fan-out</Cell>
        <Cell w={SW[1]}>per-member requests, share checks, aggregation</Cell>
      </Row>
      <Row h={66} i={5}>
        <Cell w={SW[0]} color={c.muted}>Key generation</Cell>
        <Cell w={SW[1]}>Pedersen DKG (BLS), FROST DKG (treasury)</Cell>
      </Row>
      <Row h={66} i={6}>
        <Cell w={SW[0]} color={c.muted}>Custody</Cell>
        <Cell w={SW[1]}>FROST-signed BDK and Bark treasuries</Cell>
      </Row>
      <Row h={66} i={7}>
        <Cell w={SW[0]} color={c.muted}>Client intent</Cell>
        <Cell w={SW[1]}>every v3 input signs the TLV transaction transcript</Cell>
      </Row>
    </At>
    <At x={120} y={820} w={1680}>
      <Note>Status: not production-ready. Review: cashubtc/cdk#2048.</Note>
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
          <span style={{ fontSize: 24, color: c.muted }}>&nbsp;&nbsp;over the 195 UTF-8 bytes of the string</span>
        </Fade>
        <Fade show={s >= 4} style={{ marginTop: 18 }}>
          <span style={{ fontFamily: MONO, fontSize: 21 }}>
            "witness": "{'{'}\"signatures\":[\"60f3c9b7…b59e1383\"]{'}'}"
          </span>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          A JSON array: <Code>kind</Code>, then <Code>nonce</Code>, <Code>data</Code> and <Code>tags</Code>.
        </StepItem>
        <StepItem n={2} step={s}>
          The JSON is serialized into the string <Code>Proof.secret</Code>, then escaped again inside the proof JSON.
        </StepItem>
        <StepItem n={3} step={s}>
          The mint hashes the string bytes to the curve. Secret size follows the policy.
        </StepItem>
        <StepItem n={4} step={s}>
          The witness is a JSON string too. <Code>SIG_INPUTS</Code> signs the unescaped secret string.
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
        <Note style={{ marginTop: 12 }}>323 bytes as a secret string. Every value is a string, including integers.</Note>
      </At>
      <At x={820} y={256} w={980}>
        <Fade show={s >= 1} dimTo={0.3}>
          <Label>Pathways</Label>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            <div style={{ flex: 1, border: `1.5px solid ${c.cool}`, background: c.coolSoft, borderRadius: 12, padding: '14px 18px', fontSize: 22, lineHeight: 1.4 }}>
              <div style={{ fontWeight: 600 }}>Receiver</div>
              preimage of <Code>data</Code> and signatures by <Code>pubkeys</Code> (<Code>n_sigs</Code>). Always available.
            </div>
            <div style={{ flex: 1, border: `1.5px solid ${c.node}`, background: c.card, borderRadius: 12, padding: '14px 18px', fontSize: 22, lineHeight: 1.4 }}>
              <div style={{ fontWeight: 600 }}>Sender</div>
              after <Code>locktime</Code>: signatures by <Code>refund</Code> keys. No <Code>refund</Code> tag: anyone can
              spend.
            </div>
          </div>
        </Fade>
      </At>
      <At x={820} y={560} w={980}>
        <Fade show={s >= 2} dimTo={0.3}>
          <Label>Properties of JSON secrets</Label>
          <div style={{ fontSize: 23, lineHeight: 1.4, marginTop: 12 }}>
            <Limit>Secret size grows with the policy: 195 B (P2PK), 323 B (this HTLC).</Limit>
            <Limit>Every spend reveals the complete policy to the mint.</Limit>
            <Limit>Signed message: the secret string, or a string concatenation under <Code>SIG_ALL</Code>.</Limit>
            <Limit>A mint without support for a kind treats the proof as anyone-can-spend.</Limit>
            <Limit>Combinations are limited to the tag pathways of each kind.</Limit>
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
          Each leaf is a tapscript. <Code>leaf_hash = hash_TapLeaf(0xc0 ‖ compact_size(s) ‖ s)</Code>.
        </StepItem>
        <StepItem n={2} step={s}>
          <Code>hash_TapBranch</Code> hashes the two children in sorted order.
        </StepItem>
        <StepItem n={3} step={s}>
          The root commits to every script.
        </StepItem>
        <StepItem n={4} step={s}>
          The output key <M>Q</M> is the internal key tweaked by the root. The output is a 32-byte x-only key.
        </StepItem>
        <StepItem n={5} step={s}>
          The constructor chooses the shape: the likely script sits at depth 1 for a shorter proof.
        </StepItem>
        <Note style={{ marginTop: 18, fontSize: 21 }}>
          Tagged hashes (BIP340): <Code>SHA256(SHA256(tag) ‖ SHA256(tag) ‖ m)</Code>.
        </Note>
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
          <Pre size={20}>{`[ signature ]      64 B`}</Pre>
          <Note style={{ marginTop: 12 }}>
            Signed with <M>q = p + t</M> (BIP340 parity negation applies). Indistinguishable from a single-key spend.
          </Note>
        </Fade>
        <Fade show={s >= 2} style={{ position: 'absolute', inset: 0 }}>
          <Label color={c.clayHex}>Script path witness for B</Label>
          <Pre size={17}>{`[ …inputs, script B, control ]

control = (0xc0 | parity(Q))
          ‖ x(P)
          ‖ hash(C) ‖ hash(A)`}</Pre>
          <Note style={{ marginTop: 10 }}>33 + 32·m bytes, m ≤ 128.</Note>
        </Fade>
      </At>
      <At x={120} y={730} w={1220}>
        <Fade show={s >= 3}>
          <Note>
            <div>
              Verifier: leaf hash of B → <Code>hash_TapBranch</Code> with hash(C), then hash(A) → tweak with x(P) → compare
              with <M>Q</M> and the parity bit → execute script B.
            </div>
            <div style={{ marginTop: 8 }}>
              Unexecuted scripts stay hashes. An internal key with no known discrete log (<M>H</M> = lift_x(SHA256(G)),
              or <M>H + r·G</M>) disables the key path.
            </div>
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Key path: one signature by the tweaked key. The tree is never revealed.
        </StepItem>
        <StepItem n={2} step={s}>
          Script path: reveal one script and the sibling hashes on its path. Here: B, with hash(C) and hash(A).
        </StepItem>
        <StepItem n={3} step={s}>
          Recompute the root, check the tweak, then run the script.
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
            marginTop: 8,
            fontFamily: MONO,
            fontSize: 18,
            lineHeight: 1.5,
            wordBreak: 'break-all',
            background: c.card,
            border: `1.5px solid ${c.rule}`,
            borderRadius: 12,
            padding: '12px 20px',
            opacity: s >= 1 ? 0.45 : 1,
            transition: `opacity 500ms ${EASE_OUT}`,
          }}
        >
          407915bc212be61a77e3e6d2aeb4c727980bda51cd06a6afc29e2861768a7837
          <span style={{ color: c.dim }}>{'   or   '}</span>
          {'["P2PK",{"nonce":"859d4935c4907062…","data":"0249098aa8b9d2fb…","tags":[["sigflag","SIG_INPUTS"]]}]'}
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
          <Note>
            A bare <M>K</M> and a tweaked <M>P</M> look the same on the wire. A key-path spend of a locked proof is
            byte-identical to a bare-key spend.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Every v3 secret is a 33-byte compressed point, 66 hex characters. Mints reject any other form.
        </StepItem>
        <StepItem n={2} step={s}>
          Conditions are committed into the key, following BIP341 with Cashu tags.
        </StepItem>
        <StepItem n={3} step={s}>
          The mint learns that conditions exist only when a script path is used.
        </StepItem>
        <Note style={{ marginTop: 18, fontSize: 21 }}>
          Pre-v3 and v3 <M>Y</M> spaces cannot overlap: secp256k1 vs. BLS12-381 G₁.
        </Note>
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
      <At x={120} y={910} w={1220}>
        <Note style={{ fontSize: 21 }}>
          Values: three-leaf vector in <Code>tests/10-tests.md</Code>; the root above reproduces the vector's root.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Three condition leaves, serialized as TLV records, in transmitted order.
        </StepItem>
        <StepItem n={2} step={s}>
          <Code>leaf_hash = tagged_hash("Cashu_NutrootLeaf", leaf)</Code>
        </StepItem>
        <StepItem n={3} step={s}>
          Sort the leaf hashes ascending: <M>h₀ &lt; h₂ &lt; h₁</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          Pair per level with <Code>tagged_hash("Cashu_NutrootBranch", min ‖ max)</Code>. The unpaired <M>h₁</M> is
          promoted unchanged.
        </StepItem>
        <StepItem n={5} step={s}>
          One hash remains: the merkle root.
        </StepItem>
        <StepItem n={6} step={s}>
          Tweak the internal key: <M>t</M> is taken mod <M>n</M>, never rejected.
        </StepItem>
      </StepList>
    </Shell>
  );
};

const LeafEncoding: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const LW = [210, 110, 400, 460];
  return (
    <Shell n="2.3" eyebrow="Nutroot secrets" title="Condition leaves (leaf version 0x00)" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Label>after_1of1_key4, 49 bytes</Label>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <Seg bytes="00" label="version" tone="type" hot={s === 1} />
          <Seg bytes="02" label="type: after" tone="type" hot={s === 1} />
          <Seg bytes="02 0001 01" label="n = 1" hot={s === 2} />
          <Seg bytes="04 0021 02e493…c4cd13" label="keys: key 4" hot={s === 3} />
          <Seg bytes="06 0004 68a3be80" label="time 1755561600" hot={s === 4} />
        </div>
      </At>
      <At x={120} y={400} w={1220}>
        <Fade show={s >= 5}>
          <span style={{ fontSize: 24 }}>
            <Code>tagged_hash("Cashu_NutrootLeaf", leaf)</Code>
            <span style={{ color: c.muted }}> = </span>
            <Code color={c.clayHex}>9ed9c0b8907f7af4fce51cbeac218907…</Code>
          </span>
        </Fade>
      </At>
      <At x={120} y={462} w={1220}>
        <Row i={0} head>
          <Cell head w={LW[0]}>Leaf</Cell>
          <Cell head w={LW[1]}>Type</Cell>
          <Cell head w={LW[2]}>Fields</Cell>
          <Cell head w={LW[3]}>Satisfied by</Cell>
        </Row>
        <Row i={1}>
          <Cell w={LW[0]}>threshold</Cell>
          <Cell w={LW[1]}><Code>0x01</Code></Cell>
          <Cell w={LW[2]}>n, keys, disclosure?</Cell>
          <Cell w={LW[3]}>n distinct listed keys sign</Cell>
        </Row>
        <Row i={2}>
          <Cell w={LW[0]} color={s >= 1 && s <= 4 ? c.clayHex : undefined}>after</Cell>
          <Cell w={LW[1]}><Code>0x02</Code></Cell>
          <Cell w={LW[2]}>n, keys, time, disclosure?</Cell>
          <Cell w={LW[3]}>clock ≥ time, and n keys sign</Cell>
        </Row>
        <Row i={3}>
          <Cell w={LW[0]}>hashlock</Cell>
          <Cell w={LW[1]}><Code>0x03</Code></Cell>
          <Cell w={LW[2]}>n, keys, hash, disclosure?</Cell>
          <Cell w={LW[3]}>SHA-256 preimage, and n keys sign</Cell>
        </Row>
        <Row i={4}>
          <Cell w={LW[0]}>commit</Cell>
          <Cell w={LW[1]}><Code>0x04</Code></Cell>
          <Cell w={LW[2]}>hash</Cell>
          <Cell w={LW[3]}>never: binds external data</Cell>
        </Row>
      </At>
      <At x={120} y={800} w={1220}>
        <Note style={{ fontSize: 22 }}>
          <div>
            Fields: <Code>n 0x02</Code> · <Code>keys 0x04</Code> (33-byte points, one record) · <Code>time 0x06</Code> ·{' '}
            <Code>hash 0x08</Code> · <Code>disclosure 0x0a</Code> (mode 0x01 only).
          </div>
          <div>
            Record = type (1) ‖ length (2, BE) ‖ value. Fields strictly ascending. Unknown fields reject; odd types
            reserved. Body ≤ 512 B.
          </div>
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          <Code>leaf = leaf_version ‖ leaf_type ‖ field TLVs</Code>. Other versions and unknown types are unsatisfiable.
        </StepItem>
        <StepItem n={2} step={s}>
          Signature threshold, one byte: <M>1 ≤ n ≤</M> number of keys.
        </StepItem>
        <StepItem n={3} step={s}>
          Keys are compressed points. Two keys with the same x-coordinate reject.
        </StepItem>
        <StepItem n={4} step={s}>
          Unix seconds, minimal big-endian.
        </StepItem>
        <StepItem n={5} step={s}>
          The exact bytes are the leaf everywhere: spend info, witness, hash preimage.
        </StepItem>
        <Note style={{ marginTop: 16, fontSize: 21 }}>
          Every spendable leaf names at least one key. A preimage alone is never spend power.
        </Note>
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
        <Note style={{ fontSize: 22 }}>
          Leaves in sorted-hash order. Numbers under leaves: sibling hashes on the path. Dashed: promoted unchanged.
        </Note>
      </At>
      <StepList>
        <Note style={{ fontSize: 23, color: c.ink }}>
          <Limit>Sort leaf hashes, pair neighbours per level, promote an unpaired last hash.</Limit>
          <Limit>The shape depends only on the leaf count. A payer can rebuild a payee's requested tree without being told its shape.</Limit>
          <Limit>No left/right flags: pairs are hashed in sorted order.</Limit>
          <Limit>At most 8 leaves, so every path has at most 3 sibling hashes.</Limit>
          <Limit>Duplicate leaves are kept, not deduplicated.</Limit>
          <Limit>BIP341 lets the constructor choose depths; nutroot does not.</Limit>
        </Note>
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
          <Pre size={19}>{`{ "signatures": ["<64 B>"] }`}</Pre>
          <Note style={{ marginTop: 12 }}>
            One BIP-340 signature by <M>p′ = (k + t) mod n</M>, checked against x(<M>P</M>). Exactly one entry.
          </Note>
        </Fade>
        <Fade show={s >= 2} style={{ position: 'absolute', inset: 0 }}>
          <Label color={c.clayHex}>Script path witness, hashlock leaf</Label>
          <Pre size={16}>{`{
  "leaf": "0003…a1a1a1",
  "control": {
    "K": "03a3e12c…3a419e51",
    "path": ["23e8ff16…",
             "9ed9c0b8…"]
  },
  "signatures": ["<64 B>"],
  "preimage": "<≤ 32 B>"
}`}</Pre>
        </Fade>
      </At>
      <At x={120} y={740} w={1220}>
        <Fade show={s >= 3}>
          <Note>
            <div>
              Only the exercised leaf is revealed. <M>h₀</M> and <M>h₁</M> travel as opaque hashes; the after leaf stays
              private.
            </div>
            <div style={{ marginTop: 6 }}>
              By default the disclosure ends at the mint. A leaf with <Code>disclosure 0x01</Code> makes the mint publish
              the exercised witness and input digest (NUT-07, NUT-17).
            </div>
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Key path: byte-identical to a bare-key spend. The mint learns nothing about the tree.
        </StepItem>
        <StepItem n={2} step={s}>
          Script path: reveal one leaf, the internal key <M>K</M> and the sibling path. No leaf version, no parity bit.
        </StepItem>
        <StepItem n={3} step={s}>
          What the mint learns, and when it is published.
        </StepItem>
        <Note style={{ marginTop: 16, fontSize: 21 }}>
          Both witnesses sign the input digest of the NUT-10 transaction transcript.
        </Note>
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
  <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 23, lineHeight: 1.4 }}>
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
            <Check>2 sibling hashes; at most 3 are allowed.</Check>
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
            <Check>fields 02 n, 04 keys, 08 hash: known, ascending</Check>
          </div>
        </Fade>
        <Fade show={s >= 4} style={{ position: 'absolute', inset: 0 }}>
          <Label>Step 4 · evaluate</Label>
          <div style={{ marginTop: 12 }}>
            <Check>SHA256(preimage) = hash, preimage ≤ 32 bytes</Check>
            <Check>distinct listed keys with a valid BIP-340 signature over the input digest ≥ n = 1</Check>
            <Check>signatures ≤ number of listed keys</Check>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Reject a path with more than 3 sibling hashes.
        </StepItem>
        <StepItem n={2} step={s}>
          Recompute leaf hash → root through the path, then the tweak from <M>K</M>. <M>K + t·G</M> must equal the
          secret.
        </StepItem>
        <StepItem n={3} step={s}>
          Parse the leaf. Unknown version, type or field fails closed.
        </StepItem>
        <StepItem n={4} step={s}>
          Evaluate: commit rejects; after needs clock ≥ time; hashlock needs the preimage; then count distinct signing
          keys ≥ <M>n</M>.
        </StepItem>
        <Note style={{ marginTop: 16, fontSize: 21 }}>Mints may reject witnesses longer than 4096 characters.</Note>
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
        height: 480,
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
      <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 14 }}>{children}</div>
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
          <M size={32}>K = k·G</M>
          <div style={{ marginTop: 12 }}>The holder can key-path spend.</div>
          <div style={{ marginTop: 10 }}>Without conditions the secret is <M>K</M>, untweaked.</div>
          <div style={{ marginTop: 10, color: c.muted }}>
            Vector: <M>k = 7</M> → secret <Code>025cbdf0…c4f9bc</Code>
          </div>
        </KeyCard>
        <KeyCard n={2} step={s} title="Aggregated (MuSig2, FROST)">
          <div>Nobody holds <M>k</M>. The secret must carry at least the empty tweak:</div>
          <div style={{ marginTop: 10 }}>
            <Code>t = tagged_hash(Tweak, K)</Code>
          </div>
          <div style={{ marginTop: 10 }}>so cosigners can verify that no script path is hidden.</div>
          <div style={{ marginTop: 10, color: c.muted }}>
            Vector: <M>K</M> = key 3 → secret <Code>03b2bb25…d9233aee</Code>
          </div>
        </KeyCard>
        <KeyCard n={3} step={s} title="NUMS offset (script-only)">
          <M size={32}>K = H + u·G</M>
          <div style={{ marginTop: 10 }}>
            <M>H</M> = lift_x(SHA256(G uncompressed)) = <Code>0250929b…ce803ac0</Code>
          </div>
          <div style={{ marginTop: 10 }}>
            Fresh <M>u</M> per proof, disclosed in spend info. Holders check <M>K − u·G = H</M>: no key path exists.
          </div>
        </KeyCard>
      </div>
      <At x={120} y={820} w={1220}>
        <Note style={{ fontSize: 22 }}>
          Secrets must be unique (NUT-00). Keys come from the seed (NUT-13), a blinded static key (NUT-28), a random
          keypair, or a fresh NUMS offset. v3 key derivations are hardened at every step.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          A wallet key.
        </StepItem>
        <StepItem n={2} step={s}>
          A key shared by cosigners.
        </StepItem>
        <StepItem n={3} step={s}>
          No key path. Not ECDH-blinded: nobody holds the scalar of <M>H</M>.
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
        height: 290,
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
      <At x={900} y={262} w={440}>
        <Note style={{ fontSize: 21 }}>
          <div>
            <Code>k</Code> and <Code>E</Code> are mutually exclusive. <Code>K</Code> is required with a tree when neither
            is present. <Code>u</Code> is present exactly for NUMS keys.
          </div>
          <div style={{ marginTop: 10 }}>
            Locked proofs need the tree even for key-path spends (the tweak needs the root): spend info is fund-critical
            wallet data.
          </div>
        </Note>
      </At>
      <div style={{ position: 'absolute', left: 120, top: 650, display: 'flex', gap: 25 }}>
        <FlowBox title="Check 1 · reconstruct" show={s >= 2} tone={s === 2 ? c.clayHex : c.rule}>
          <div>Key source: <M>k·G</M>, derived from <M>E</M>, or disclosed <M>K</M>.</div>
          <div style={{ marginTop: 6 }}>No tree: <M>K</M> (or its empty tweak) = secret.</div>
          <div style={{ marginTop: 6 }}>Tree: all leaves parse and <M>K + t·G</M> = secret. With <M>u</M>: <M>K − u·G = H</M>.</div>
        </FlowBox>
        <FlowBox title="Check 2 · spendable" show={s >= 3} tone={s === 3 ? c.clayHex : c.rule}>
          <div>The wallet holds the key path (<M>k</M>, <M>E</M>-derived, seed key, cosigner share) or keys for a disclosed leaf.</div>
          <div style={{ marginTop: 6 }}>Every leaf is checked against policy, eg a minimum refund horizon.</div>
        </FlowBox>
        <FlowBox title="Sweep" show={s >= 4} tone={s === 4 ? c.clayHex : c.rule}>
          <div>Swap received proofs to seed-derived secrets.</div>
          <div style={{ marginTop: 6 }}>A bearer <M>k</M> is shared with the sender; <M>E</M> is not seed-recoverable; a disclosed tree may leave a key path to someone else.</div>
        </FlowBox>
      </div>
      <StepList>
        <StepItem n={1} step={s}>
          A token entry may carry spend info: what the next holder needs that the proof does not say.
        </StepItem>
        <StepItem n={2} step={s}>
          The disclosed data must compute the secret. A tree that computes it is provably complete.
        </StepItem>
        <StepItem n={3} step={s}>
          The receiver must be able to spend it.
        </StepItem>
        <StepItem n={4} step={s}>
          Then sweep.
        </StepItem>
      </StepList>
    </Shell>
  );
};

const NoteBox = ({ x, y, w, show, children, tone = c.rule }: { x: number; y: number; w: number; show: boolean; children: ReactNode; tone?: string }) => (
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
      fontSize: 20,
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
      <NoteBox x={PR - 250} y={360} w={500} show={s >= 2}>
        fresh <M>(e, E)</M> per output · per key <M>P</M>: <M>Zx = x(e·P)</M>
        <br />
        <Code>rᵢ = SHA256("Cashu_P2BK_v1" ‖ Zx ‖ i)</Code>
      </NoteBox>
      <NoteBox x={PR - 250} y={470} w={500} show={s >= 3}>
        slot 0: <M>K = k + r₀·G</M> · slots 1…: keys in <Code>b</Code> become <M>P′ = P + rᵢ·G</M> · leaves of{' '}
        <Code>l</Code> reproduced byte for byte · <M>P = K + t·G</M>
      </NoteBox>
      <NoteBox x={PE - 190} y={770} w={560} show={s >= 5} tone={c.clayHex}>
        <M>Zx = x(p·E)</M> · check the tree equals <Code>l</Code> exactly · spend with <M>p + r₀ + t</M>
        <br />
        <span style={{ color: c.muted }}>Vector: (3 + r₀ + t) mod n = 31b2e906…78d008e7</span>
      </NoteBox>
      <StepList>
        <StepItem n={1} step={s}>
          The payment request carries the payee's static key <M>k</M>, the requested leaves <Code>l</Code> and the
          blind-me keys <Code>b</Code>.
        </StepItem>
        <StepItem n={2} step={s}>
          A fresh ephemeral and one ECDH per blinded key give one blinding scalar per slot.
        </StepItem>
        <StepItem n={3} step={s}>
          Slot 0 blinds the internal key. The tree is the requested one, no more leaves and no fewer.
        </StepItem>
        <StepItem n={4} step={s}>
          The payer swaps to the tweaked secret and sends proof and spend info.
        </StepItem>
        <StepItem n={5} step={s}>
          The payee derives the same scalars and key-path sweeps.
        </StepItem>
      </StepList>
    </Shell>
  );
};

const CW = [300, 560, 360];
const Capabilities: Page = () => (
  <Shell n="2.4" eyebrow="Using nutroot" title="What the specification covers">
    <At x={120} y={250} w={1680}>
      <Row i={0} head>
        <Cell head w={CW[0]}>Use</Cell>
        <Cell head w={CW[1] + 460}>Construction</Cell>
        <Cell head w={CW[2]}>NUT</Cell>
      </Row>
      <Row i={1}>
        <Cell w={CW[0]} color={c.muted}>Bearer token</Cell>
        <Cell w={CW[1] + 460}>bare <M>K</M>; private key <M>k</M> in spend info</Cell>
        <Cell w={CW[2]}>10</Cell>
      </Row>
      <Row i={2}>
        <Cell w={CW[0]} color={c.muted}>Pay to a key</Cell>
        <Cell w={CW[1] + 460}>internal key blinded from the receiver's static key; key-path spend</Cell>
        <Cell w={CW[2]}>28, 18</Cell>
      </Row>
      <Row i={3}>
        <Cell w={CW[0]} color={c.muted}>Multisig</Cell>
        <Cell w={CW[1] + 460}><Code>threshold</Code> leaf, or a MuSig2/FROST internal key with at least the empty tweak</Cell>
        <Cell w={CW[2]}>10</Cell>
      </Row>
      <Row i={4}>
        <Cell w={CW[0]} color={c.muted}>Timelocked refund</Cell>
        <Cell w={CW[1] + 460}><Code>after</Code> leaf naming the refund keys</Cell>
        <Cell w={CW[2]}>10</Cell>
      </Row>
      <Row i={5}>
        <Cell w={CW[0]} color={c.muted}>HTLC</Cell>
        <Cell w={CW[1] + 460}><Code>hashlock</Code> leaf; <Code>disclosure 0x01</Code> when the preimage must be observable</Cell>
        <Cell w={CW[2]}>10, 14, 07</Cell>
      </Row>
      <Row i={6}>
        <Cell w={CW[0]} color={c.muted}>Binding to data</Cell>
        <Cell w={CW[1] + 460}><Code>commit</Code> leaf beside the real conditions, eg a Nutzap event digest</Cell>
        <Cell w={CW[2]}>10</Cell>
      </Row>
      <Row i={7}>
        <Cell w={CW[0]} color={c.muted}>Auditable lock</Cell>
        <Cell w={CW[1] + 460}>NUMS internal key + one <Code>threshold</Code> leaf (n = 1) with disclosure</Cell>
        <Cell w={CW[2]}>10</Cell>
      </Row>
      <Row i={8}>
        <Cell w={CW[0]} color={c.muted}>Locked mint quotes</Cell>
        <Cell w={CW[1] + 460}>the paid quote is a signed input; its lock key may carry an <Code>after</Code> refund leaf</Cell>
        <Cell w={CW[2]}>04, 20, 29</Cell>
      </Row>
      <Row i={9}>
        <Cell w={CW[0]} color={c.muted}>Blind auth</Cell>
        <Cell w={CW[1] + 460}>point secret signing a request transcript (method, target, body hash)</Cell>
        <Cell w={CW[2]}>22</Cell>
      </Row>
      <Row i={10}>
        <Cell w={CW[0]} color={c.muted}>Multi-party signing</Cell>
        <Cell w={CW[1] + 460}><Code>nutspA</Code> signing package; <Code>nutrcA</Code> spend receipt</Cell>
        <Cell w={CW[2]}>10</Cell>
      </Row>
      <Row i={11}>
        <Cell w={CW[0]} color={c.muted}>Spend evidence</Cell>
        <Cell w={CW[1] + 460}>
          <Code>tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash)</Code>
        </Cell>
        <Cell w={CW[2]}>07</Cell>
      </Row>
    </At>
  </Shell>
);

const BW = [300, 640, 740];
const VsBip341: Page = () => (
  <Shell n="2.4" eyebrow="Using nutroot" title="Nutroot compared with BIP341">
    <At x={120} y={250} w={1680}>
      <Row i={0} head>
        <Cell head w={BW[0]}> </Cell>
        <Cell head w={BW[1]}>BIP341</Cell>
        <Cell head w={BW[2]} color={c.clayHex}>Nutroot</Cell>
      </Row>
      <Row i={1}>
        <Cell w={BW[0]} color={c.muted}>Key</Cell>
        <Cell w={BW[1]}>32-byte x-only output key</Cell>
        <Cell w={BW[2]}>33-byte compressed point; signatures checked against x</Cell>
      </Row>
      <Row i={2}>
        <Cell w={BW[0]} color={c.muted}>Tweak</Cell>
        <Cell w={BW[1]}>over x(P), rejected if ≥ n</Cell>
        <Cell w={BW[2]}>over the 33-byte K, reduced mod n</Cell>
      </Row>
      <Row i={3}>
        <Cell w={BW[0]} color={c.muted}>Leaves</Cell>
        <Cell w={BW[1]}>tapscript: opcodes, stack</Cell>
        <Cell w={BW[2]}>declarative TLV: threshold, after, hashlock, commit</Cell>
      </Row>
      <Row i={4}>
        <Cell w={BW[0]} color={c.muted}>Tree shape</Cell>
        <Cell w={BW[1]}>chosen per leaf, depth ≤ 128</Cell>
        <Cell w={BW[2]}>fixed by the sorted fold; ≤ 8 leaves, path ≤ 3</Cell>
      </Row>
      <Row i={5}>
        <Cell w={BW[0]} color={c.muted}>Control block</Cell>
        <Cell w={BW[1]}>leaf version, parity, x(P), path</Cell>
        <Cell w={BW[2]}>K and path in the JSON witness</Cell>
      </Row>
      <Row i={6}>
        <Cell w={BW[0]} color={c.muted}>Tags</Cell>
        <Cell w={BW[1]}>TapLeaf, TapBranch, TapTweak</Cell>
        <Cell w={BW[2]}>Cashu_NutrootLeaf, _Branch, _Tweak</Cell>
      </Row>
      <Row i={7}>
        <Cell w={BW[0]} color={c.muted}>Unknown data</Cell>
        <Cell w={BW[1]}>OP_SUCCESS, annex</Cell>
        <Cell w={BW[2]}>unknown fields of either parity reject</Cell>
      </Row>
      <Row i={8}>
        <Cell w={BW[0]} color={c.muted}>NUMS</Cell>
        <Cell w={BW[1]}>H, with H + r·G suggested</Cell>
        <Cell w={BW[2]}>H + u·G required, u disclosed</Cell>
      </Row>
      <Row i={9}>
        <Cell w={BW[0]} color={c.muted}>Signed message</Cell>
        <Cell w={BW[1]}>sighash: input index, annex, hash type</Cell>
        <Cell w={BW[2]}>input digest of the NUT-10 transaction transcript</Cell>
      </Row>
    </At>
    <At x={120} y={900} w={1680}>
      <Note style={{ fontSize: 22 }}>
        Borrowed: the commitment structure. Tweaked keys and derived values are not interchangeable with Bitcoin's.
      </Note>
    </At>
  </Shell>
);

const QW = [300, 640, 740];
const Comparison: Page = () => (
  <Shell n="2.4" eyebrow="Using nutroot" title="JSON secrets and nutroot secrets">
    <At x={120} y={250} w={1680}>
      <Row i={0} head>
        <Cell head w={QW[0]}> </Cell>
        <Cell head w={QW[1]}>NUT-10 JSON (keysets v1, v2)</Cell>
        <Cell head w={QW[2]} color={c.clayHex}>Nutroot (keyset v3)</Cell>
      </Row>
      <Row i={1}>
        <Cell w={QW[0]} color={c.muted}>Secret</Cell>
        <Cell w={QW[1]}>string; 195 B for P2PK, 323 B for the HTLC</Cell>
        <Cell w={QW[2]}>33-byte point, always</Cell>
      </Row>
      <Row i={2}>
        <Cell w={QW[0]} color={c.muted}>Revealed on spend</Cell>
        <Cell w={QW[1]}>the full policy</Cell>
        <Cell w={QW[2]}>nothing (key path) or one leaf (script path)</Cell>
      </Row>
      <Row i={3}>
        <Cell w={QW[0]} color={c.muted}>Signed message</Cell>
        <Cell w={QW[1]}>secret string, or a concatenation (SIG_ALL)</Cell>
        <Cell w={QW[2]}>per-input digest over the TLV transcript</Cell>
      </Row>
      <Row i={4}>
        <Cell w={QW[0]} color={c.muted}>Unlocked proofs</Cell>
        <Cell w={QW[1]}>no witness</Cell>
        <Cell w={QW[2]}>bare key; <M>k</M> travels in spend info</Cell>
      </Row>
      <Row i={5}>
        <Cell w={QW[0]} color={c.muted}>Unsupported mint</Cell>
        <Cell w={QW[1]}>proof treated as anyone-can-spend</Cell>
        <Cell w={QW[2]}>a v3 keyset implies full support</Cell>
      </Row>
      <Row i={6}>
        <Cell w={QW[0]} color={c.muted}>Combinations</Cell>
        <Cell w={QW[1]}>tag pathways per kind</Cell>
        <Cell w={QW[2]}>up to 8 leaves in one tree</Cell>
      </Row>
      <Row i={7}>
        <Cell w={QW[0]} color={c.muted}>Encoding</Cell>
        <Cell w={QW[1]}>JSON, integers as strings</Cell>
        <Cell w={QW[2]}>TLV, minimal big-endian, fail closed</Cell>
      </Row>
    </At>
    <At x={120} y={800} w={1680}>
      <Note style={{ fontSize: 22 }}>
        Test vectors in <Code>tests/10-tests.md</Code>, produced by two independent implementations (cashu-ts,
        nutshell). CDK tracking issue: <Code>cashubtc/cdk#2433</Code>.
      </Note>
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
  Section1,
  Bdhke,
  BlsFlow,
  Pairing,
  Keysets,
  Multisig,
  Section2,
  Shamir,
  Lagrange,
  ThresholdSign,
  Section3,
  MixMatch,
  OperationId,
  Consensus,
  Swap,
  MintQuote,
  Topology,
  Section4,
  Dkg,
  DkgRounds,
  FederationId,
  Recovery,
  Section5,
  Funding,
  KeyMaterial,
  Melt,
  Section6,
  Rewrite,
  Transcript,
  InputDigest,
  InputsSign,
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

export const notes: (string | undefined)[] = [
  // Cover
  `Federated Cashu and nutroot. Two chapters: running a mint as a federation, and the v3 secret format.`,
  // OutlineAll
  undefined,
  // Chapter1
  undefined,
  // Model
  `Standalone mint: one key k per amount, one operator. Federation: n members, signing threshold t, consensus threshold c, observation quorum q. Wallets fan out to every member.`,
  // Section1
  undefined,
  // Bdhke
  `NUT-00 recap. Additive blinding with r·G. Verification computes k·Y, so the mint needs k. Wallets verify only with a DLEQ proof.`,
  // BlsFlow
  `Same protocol shape on BLS12-381. Multiplicative blinding. The wallet checks the blind signature with a pairing before unblinding. Verification needs only K. DLEQ is rejected for v3.`,
  // Pairing
  `Bilinearity, one step per line. The same argument gives the blind check. Batch verification uses random weights from a transcript.`,
  // Keysets
  `v3 is a keyset version, not a token format. Rotation to v3 is explicit.`,
  // Multisig
  `Multisig puts the federation into the proof. Threshold BLS keeps the proof format and moves the threshold into issuance.`,
  // Section2
  undefined,
  // Shamir
  `Standard Shamir. t = 2, so the polynomial is a line. One polynomial per amount.`,
  // Lagrange
  `The weights depend on which members respond. Three subsets, three sets of weights, same f(0). The weights are scalars, so they apply to G1 points.`,
  // ThresholdSign
  `The wallet is the aggregator. m2 being offline does not matter. Each share is verified against the member's public share before interpolation.`,
  // Section3
  undefined,
  // MixMatch
  `Members that sign on receipt can be played against each other. Every request looks valid to the member that receives it.`,
  // OperationId
  `Hash of the canonical envelope. Real SHA-256 on the slide.`,
  // Consensus
  `AlephBFT gives a total order. Conflicts are detected on apply. Only then are shares produced.`,
  // Swap
  `End-to-end swap. Admission checks run before consensus.`,
  // MintQuote
  `Quote created on one member and ordered through consensus; the wallet waits until t members return it. Members probe the backend on status requests, payment events or scans; observations reach quorum q. The wallet accepts a status from t identical responses. Each member mints only once the quote is paid in its own state.`,
  // Topology
  `Two planes. Liveness: t for signatures, c for ordering.`,
  // Section4
  undefined,
  // Dkg
  `Pedersen DKG. The aggregate secret is the sum of the constant terms and is never computed.`,
  // DkgRounds
  `Readiness, then a hash of each member's reveal, then the reveal, private deliveries checked against commitments, transcript signatures, and activation by all members. The FROST treasury ceremony runs after activation.`,
  // FederationId
  `The federation ID is a hash over the setup transcript. Membership changes produce a new federation. Open design questions at the bottom.`,
  // Recovery
  `History is replicated and verifiable; key material is not. Checkpoint, suffix, replay, digest check, readiness gate.`,
  // Section5
  undefined,
  // Funding
  `A single-operator backend under a federated issuer leaves the operator in control of the funds. Threshold custody with FROST.`,
  // KeyMaterial
  `Two ceremonies on the same roster. FROST produces one root; applications derive from it in a fixed order.`,
  // Melt
  `Melt as a sequence of consensus objects. Deposit and reorg handling below.`,
  // Section6
  undefined,
  // Rewrite
  `Fan-out shows every member the bearer proofs. A pre-v3 proof has no witness binding it to outputs, so a member can race a rewritten swap.`,
  // Transcript
  `v3 serializes every transaction as TLV containers: inputs (proofs, mint quotes) and outputs (blinded messages, melt quotes). Values are from the NUT-10 test vectors.`,
  // InputDigest
  `Each input signs its own tagged digest over the transaction digest and its container. Rewriting outputs changes every digest.`,
  // InputsSign
  `This is SIG_ALL for every v3 transaction. An unlocked token is a bare key with its private key in spend info; the mint never sees k.`,
  // Summary
  `Each federation concern and the mechanism behind it.`,
  // Chapter2
  `Nutroot: the v3 secret family. Spec PR cashubtc/nuts#443, on top of the BLS keyset PR #371.`,
  // SectionN1
  undefined,
  // JsonSecret
  `NUT-10 today: a JSON array serialized into a string, escaped again inside the proof JSON, hashed to the curve as a string.`,
  // JsonLimits
  `P2PK and HTLC express conditions as tags with fixed pathways. The whole policy is revealed on every spend.`,
  // SectionN2
  undefined,
  // TaprootTree
  `BIP341 recap: internal key, script leaves, TapLeaf and TapBranch hashes, tweak, x-only output key. The constructor picks the tree shape.`,
  // TaprootSpend
  `Key path: one signature, looks like single-sig. Script path: script plus control block with parity, internal key and path; then execute.`,
  // SectionN3
  undefined,
  // PointSecret
  `v3 secrets are 33-byte compressed secp256k1 points. Bare key or tweaked key, indistinguishable on the wire.`,
  // NutrootTree
  `Worked three-leaf vector from the spec: leaf hashes, sorted fold with a promoted leaf, root, tweak, secret.`,
  // LeafEncoding
  `Leaves are declarative TLV records with a fixed vocabulary. No interpreter, no opcodes, fail closed on anything unknown.`,
  // FoldShapes
  `The fold is normative: sort, pair, promote. Shape depends only on the leaf count. Press R to cycle 1 to 8 leaves.`,
  // NutrootSpends
  `Key path: one signature by k plus t. Script path: leaf, control with K and path, signatures, preimage.`,
  // ScriptVerify
  `The four verification steps from the spec, with the values of the three-leaf vector.`,
  // InternalKey
  `Single-party, aggregated with mandatory empty tweak, or NUMS offset with disclosed u for script-only proofs.`,
  // SectionN4
  undefined,
  // SpendInfo
  `Spend info carries k, E, K, tree, u. Receive-time checks: reconstruct the secret, confirm it is spendable, then sweep.`,
  // ReceiverKeyed
  `NUT-18 payment request with a nutroot option; NUT-28 slot blinding; the payee key-path sweeps.`,
  // Capabilities
  `Everything the current spec text covers, with the NUT that specifies it.`,
  // VsBip341
  `What nutroot borrows from BIP341 and where it differs.`,
  // Comparison
  `JSON secrets against nutroot secrets.`,
  // End
  undefined,
];

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
  StepItem,
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
  Check,
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
