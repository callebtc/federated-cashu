import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  ACCENT,
  Arrow,
  At,
  Band,
  Canvas,
  Check,
  Code,
  Consensus,
  Dot,
  Draw,
  EASE_IO,
  EASE_OUT,
  Fade,
  GFade,
  JLine,
  Lifeline,
  Line,
  M,
  MONO,
  Member,
  MixMatch,
  Note,
  OperationId,
  Packet,
  REDUCED,
  SANS,
  SERIF,
  Seg,
  StepItem,
  StepList,
  Swap,
  T,
  Up,
  VarCover,
  VarShell,
  WalletNode,
  c,
  useProcess,
} from '../federated-cashu';

export const design: DesignSystem = {
  palette: { bg: '#faf9f5', text: '#141413', accent: '#d97757' },
  fonts: {
    display: '"Tiempos Headline", "Copernicus", ui-serif, "New York", "Iowan Old Style", Georgia, serif',
    body: '"Styrene B", "Söhne", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif',
  },
  typeScale: { hero: 128, body: 30 },
  radius: 12,
};
export { transition } from '../federated-cashu';

// ─── Local helpers (prefix VC_) ──────────────────────────────────────────────

const VC_OF_MIX = '1.3 Mix-and-match across members';
const VC_OF_OP = '1.3 Operation IDs';
const VC_OF_CON = '1.3 Consensus before signing';
const VC_OF_SWAP = '1.3 Federated swap';

const VC_Lab = ({ children, color = c.muted, style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <div style={{ fontSize: 21, letterSpacing: '0.08em', textTransform: 'uppercase', color, ...style }}>{children}</div>
);

const VC_Box = ({
  x,
  y,
  w,
  h,
  show = true,
  tone = c.rule,
  fill = c.card,
  delay = 0,
  pad = '14px 20px',
  dimTo = 0,
  children,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  show?: boolean;
  tone?: string;
  fill?: string;
  delay?: number;
  pad?: string;
  dimTo?: number;
  children?: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone}`,
      background: fill,
      borderRadius: 12,
      padding: pad,
      opacity: show ? 1 : dimTo,
      transform: show || REDUCED || dimTo > 0 ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
      ...style,
    }}
  >
    {children}
  </div>
);

const VC_Chip = ({
  children,
  tone = c.rule,
  fill = c.card,
  color = c.ink,
  mono = true,
  size = 22,
  struck = false,
  dashed = false,
}: {
  children: ReactNode;
  tone?: string;
  fill?: string;
  color?: string;
  mono?: boolean;
  size?: number;
  struck?: boolean;
  dashed?: boolean;
}) => (
  <span
    style={{
      display: 'inline-block',
      border: `1.5px ${dashed ? 'dashed' : 'solid'} ${tone}`,
      background: fill,
      color,
      borderRadius: 8,
      padding: '5px 14px',
      marginRight: 12,
      fontFamily: mono ? MONO : SANS,
      fontSize: size,
      lineHeight: 1.3,
      whiteSpace: 'nowrap',
      textDecoration: struck ? 'line-through' : 'none',
      opacity: struck ? 0.45 : 1,
      transition: `opacity 400ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}, color 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </span>
);

/** Grid cell centered at (x, y). */
const VC_Cell = ({
  x,
  y,
  w = 110,
  h = 64,
  on,
  label,
  tone = c.clayHex,
  soft = c.claySoft,
  delay = 0,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  on: boolean;
  label: ReactNode;
  tone?: string;
  soft?: string;
  delay?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      boxSizing: 'border-box',
      borderRadius: 10,
      border: `1.75px solid ${on ? tone : c.rule}`,
      background: on ? soft : c.card,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: on || REDUCED ? 'scale(1)' : 'scale(0.97)',
      transition: `background 400ms ${EASE_OUT} ${on ? delay : 0}ms, border-color 400ms ${EASE_OUT} ${on ? delay : 0}ms, transform 400ms ${EASE_OUT} ${on ? delay : 0}ms`,
    }}
  >
    <span
      style={{
        opacity: on ? 1 : 0,
        fontFamily: MONO,
        fontSize: 22,
        color: tone,
        transition: `opacity 400ms ${EASE_OUT} ${on ? delay : 0}ms`,
      }}
    >
      {label}
    </span>
  </div>
);

/** Share counter centered at x, top at y. */
const VC_Count = ({ x, y, n, t, w = 120, show = true }: { x: number; y: number; n: number; t: number; w?: number; show?: boolean }) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y,
      width: w,
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 22,
      color: n >= t ? c.good : c.dim,
      opacity: show ? 1 : 0,
      transition: `color 300ms ${EASE_OUT}, opacity 400ms ${EASE_OUT}`,
    }}
  >
    {n >= t ? `${n} ✓` : `${n}/${t}`}
  </div>
);

/** SVG path that draws itself (normalized path length). */
const VC_Curve = ({
  d,
  show,
  color = c.node,
  width = 2,
  delay = 0,
  dur = 800,
  opacity = 1,
}: {
  d: string;
  show: boolean;
  color?: string;
  width?: number;
  delay?: number;
  dur?: number;
  opacity?: number;
}) => (
  <path
    d={d}
    pathLength={1}
    style={{
      fill: 'none',
      stroke: color,
      strokeWidth: width,
      strokeLinecap: 'round',
      strokeDasharray: 1,
      strokeDashoffset: show ? 0 : 1,
      opacity,
      transition: `stroke-dashoffset ${REDUCED ? 0 : dur}ms ${EASE_IO} ${show ? delay : 0}ms, stroke 300ms ${EASE_OUT}, opacity 400ms ${EASE_OUT}`,
    }}
  />
);

/** Flowchart / state node centered at (x, y). */
const VC_Node = ({
  x,
  y,
  w,
  h = 66,
  title,
  sub,
  tone = c.node,
  fill = c.card,
  show = true,
  delay = 0,
  dashed = false,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  title: ReactNode;
  sub?: ReactNode;
  tone?: string;
  fill?: string;
  show?: boolean;
  delay?: number;
  dashed?: boolean;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${tone}`,
      background: fill,
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 12px',
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    <div style={{ fontSize: 22, lineHeight: 1.25 }}>{title}</div>
    {sub && <div style={{ fontSize: 21, color: c.muted, lineHeight: 1.25, marginTop: 2 }}>{sub}</div>}
  </div>
);

/** Table row; header rows pass show. */
const VC_TRow = ({
  show = true,
  h = 58,
  head,
  tint,
  delay = 0,
  children,
}: {
  show?: boolean;
  h?: number;
  head?: boolean;
  tint?: string;
  delay?: number;
  children: ReactNode;
}) => (
  <Fade show={show} delay={delay} y={6}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: h,
        borderBottom: `1px solid ${head ? c.line : c.rule}`,
        background: tint ?? 'transparent',
        transition: `background 300ms ${EASE_OUT}`,
      }}
    >
      {children}
    </div>
  </Fade>
);

const VC_TCell = ({
  w,
  head,
  color,
  mono,
  size,
  children,
}: {
  w: number;
  head?: boolean;
  color?: string;
  mono?: boolean;
  size?: number;
  children?: ReactNode;
}) => (
  <div
    style={{
      width: w,
      flexShrink: 0,
      boxSizing: 'border-box',
      padding: '8px 16px',
      fontSize: head ? 21 : (size ?? 23),
      letterSpacing: head ? '0.08em' : undefined,
      textTransform: head ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
      fontFamily: mono ? MONO : SANS,
      lineHeight: 1.35,
      transition: `color 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const VC_Mark = ({ ok }: { ok: boolean }) => (
  <span style={{ fontFamily: MONO, fontSize: 24, color: ok ? c.good : c.bad, marginRight: 10 }}>{ok ? '✓' : '✗'}</span>
);

/** Keeps math and identifiers out of the uppercase header style. */
const VC_NoCase = ({ children }: { children: ReactNode }) => (
  <span style={{ textTransform: 'none', letterSpacing: 0 }}>{children}</span>
);

const VC_r = (v: number) => Math.round(v * 100) / 100;

// ─── Cover ───────────────────────────────────────────────────────────────────

const VC_Cover: Page = () => (
  <VarCover
    section="1.3"
    title="Ordering"
    sources={[
      { n: '1.3', title: 'Mix-and-match across members', count: 7 },
      { n: '1.3', title: 'Operation IDs', count: 7 },
      { n: '1.3', title: 'Consensus before signing', count: 7 },
      { n: '1.3', title: 'Federated swap', count: 7 },
    ]}
  />
);

// ═════════════════════════════════════════════════════════════════════════════
// 1 · Mix-and-match across members
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VC_MB_COL = [930, 1060, 1190];
const VC_MB_ROW = [410, 530, 650];

const VC_MixReq = ({ y, outs, show }: { y: number; outs: string; show: boolean }) => (
  <>
    <At x={240} y={y - 18}>
      <Fade show={show}>
        <span style={{ fontFamily: MONO, fontSize: 24 }}>sign [{outs}]</span>
      </Fade>
    </At>
    <At x={470} y={y - 15}>
      <Fade show={show} delay={250}>
        <span style={{ fontSize: 22, color: c.good }}>✓ 2 outputs, quote paid</span>
      </Fade>
    </At>
  </>
);

const VC_ColHead = ({ x, y, show = true, children }: { x: number; y: number; show?: boolean; children: ReactNode }) => (
  <At x={x - 60} y={y} w={120} style={{ textAlign: 'center' }}>
    <Fade show={show}>
      <M size={36}>{children}</M>
    </Fade>
  </At>
);

const VC_MixBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const a = (s >= 2 ? 1 : 0) + (s >= 4 ? 1 : 0);
  const b = (s >= 2 ? 1 : 0) + (s >= 3 ? 1 : 0);
  const cc = (s >= 3 ? 1 : 0) + (s >= 4 ? 1 : 0);
  const [xa, xb, xc] = VC_MB_COL;
  const [r1, r2, r3] = VC_MB_ROW;
  return (
    <VarShell of={VC_OF_MIX} lens="Beginner" title="Signing on receipt, step by step" proc={proc}>
      <At x={120} y={250} w={1220}>
        <Note style={{ fontSize: 24 }}>
          <M>n</M> = 3 members, <M>t</M> = 2 shares per signature. A share: one member's partial signature.
        </Note>
      </At>
      <Canvas>
        <Member x={180} y={r1} r={36} label="m1" tone={s >= 2 ? 'on' : 'idle'} />
        <Member x={180} y={r2} r={36} label="m2" tone={s >= 3 ? 'on' : 'idle'} />
        <Member x={180} y={r3} r={36} label="m3" tone={s >= 4 ? 'on' : 'idle'} />
      </Canvas>
      <VC_ColHead x={xa} y={300} show={s >= 1}>
        A
      </VC_ColHead>
      <VC_ColHead x={xb} y={300} show={s >= 1}>
        B
      </VC_ColHead>
      <VC_ColHead x={xc} y={300} show={s >= 1}>
        C
      </VC_ColHead>
      <VC_MixReq y={r1} outs="A, B" show={s >= 2} />
      <VC_MixReq y={r2} outs="B, C" show={s >= 3} />
      <VC_MixReq y={r3} outs="C, A" show={s >= 4} />
      <VC_Cell x={xa} y={r1} on={s >= 2} label="share" delay={400} />
      <VC_Cell x={xb} y={r1} on={s >= 2} label="share" delay={460} />
      <VC_Cell x={xc} y={r1} on={false} label="" />
      <VC_Cell x={xa} y={r2} on={false} label="" />
      <VC_Cell x={xb} y={r2} on={s >= 3} label="share" delay={400} />
      <VC_Cell x={xc} y={r2} on={s >= 3} label="share" delay={460} />
      <VC_Cell x={xa} y={r3} on={s >= 4} label="share" delay={460} />
      <VC_Cell x={xb} y={r3} on={false} label="" />
      <VC_Cell x={xc} y={r3} on={s >= 4} label="share" delay={400} />
      <VC_Count x={xa} y={712} n={a} t={2} show={s >= 1} />
      <VC_Count x={xb} y={712} n={b} t={2} show={s >= 1} />
      <VC_Count x={xc} y={712} n={cc} t={2} show={s >= 1} />
      <At x={120} y={800} w={1220}>
        <Fade show={s >= 5}>
          <div style={{ fontFamily: SERIF, fontSize: 34 }}>Paid for 2 outputs, 3 outputs signed.</div>
          <Note style={{ marginTop: 8 }}>Each member saw a correct request. None saw the other two.</Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet paid a quote for 2 outputs. It blinds three outputs A, B, C.
        </StepItem>
        <StepItem n={2} step={s}>
          It asks m1 to sign A and B. m1 checks the request against the quote and returns two shares.
        </StepItem>
        <StepItem n={3} step={s}>
          It asks m2 to sign B and C. The same check passes.
        </StepItem>
        <StepItem n={4} step={s}>
          It asks m3 to sign C and A. The same check passes.
        </StepItem>
        <StepItem n={5} step={s}>
          Every output has <M>t</M> = 2 shares. The wallet completes three signatures.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VC_PreRow = ({ y, n, show, left, right }: { y: number; n: number; show: boolean; left: ReactNode; right: ReactNode }) => (
  <>
    <At x={120} y={y} w={1680}>
      <Fade show={show}>
        <div style={{ height: 1, background: c.rule }} />
      </Fade>
    </At>
    <At x={120} y={y + 16} w={790}>
      <Fade show={show}>
        <div style={{ display: 'flex', gap: 16, fontSize: 24, lineHeight: 1.4 }}>
          <span style={{ fontFamily: MONO, color: ACCENT, fontSize: 22, paddingTop: 2 }}>{n}</span>
          <span>{left}</span>
        </div>
      </Fade>
    </At>
    <At x={960} y={y + 16} w={840}>
      <Fade show={show} delay={200}>
        <div style={{ fontSize: 24, lineHeight: 1.4 }}>{right}</div>
      </Fade>
    </At>
  </>
);

const VC_TestLine = ({ name, children }: { name: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1.6 }}>
    <span style={{ fontFamily: MONO, fontSize: 21, width: 830, flexShrink: 0 }}>{name}</span>
    <span style={{ fontSize: 22, color: c.muted }}>{children}</span>
  </div>
);

const VC_MixAdvanced: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_MIX} lens="Advanced" title="Preconditions of the attack and what removes each" proc={proc}>
      <At x={120} y={256}>
        <VC_Lab>Precondition</VC_Lab>
      </At>
      <At x={960} y={256}>
        <VC_Lab>In the federation</VC_Lab>
      </At>
      <VC_PreRow
        y={300}
        n={1}
        show={s >= 1}
        left={
          <>
            Shares verify one by one: <M>e(C′ᵢ, G₂) = e(B′, Kᵢ)</M>. Any <M>t</M> valid shares on one <M>B′</M>{' '}
            interpolate to <M>k·B′</M>, whoever sent them.
          </>
        }
        right={
          <>
            Kept. The wallet relies on it to aggregate any <M>t</M> responses. It follows that shares may only be
            produced for agreed outputs.
          </>
        }
      />
      <VC_PreRow
        y={450}
        n={2}
        show={s >= 2}
        left={
          <>
            A member judges a request against its own state: quote paid, amount matches, outputs on a v3 keyset. Every
            window of <M>w</M> outputs passes.
          </>
        }
        right={
          <>
            Members order the envelope with AlephBFT and act on the ordered log. A second output set for the same quote
            hits the conflict key <Code>Mint {'{ quote }'}</Code>.
          </>
        }
      />
      <VC_PreRow
        y={600}
        n={3}
        show={s >= 3}
        left={
          <>
            A share <M>kᵢ·B′</M> refers to one output. It carries nothing about the rest of the request it answered.
          </>
        }
        right={
          <>
            Signing needs an accepted journal entry: <Code>FederationAcceptedSigningRequest</Code> recomputes the{' '}
            <Code>operation_id</Code> and requires the outputs to equal the accepted ones. Share rows store the{' '}
            <Code>operation_id</Code>.
          </>
        }
      />
      <At x={120} y={775} w={1680}>
        <Fade show={s >= 4}>
          <VC_Lab style={{ marginBottom: 8 }}>Regression tests</VC_Lab>
          <VC_TestLine name="naive_local_signing_allows_sliding_window_quorum_cover">
            n = 4, t = 3; ABC, BCD, CDA, DAB give every output 3 shares
          </VC_TestLine>
          <VC_TestLine name="runtime_config_rejects_sliding_window_mint_output_attack">
            one mint accepted; three ConflictingOperation
          </VC_TestLine>
          <VC_TestLine name="local_federated_members_reject_sliding_window_swap_output_attack">
            one swap view gets shares; three fail
          </VC_TestLine>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VC_G = { cx: 960, cy: 612, R: 312 };
const VC_polar = (deg: number, r: number) => ({
  x: VC_r(VC_G.cx + r * Math.cos((deg * Math.PI) / 180)),
  y: VC_r(VC_G.cy + r * Math.sin((deg * Math.PI) / 180)),
});
const VC_RINGS = [130, 175, 220, 265];
const VC_OUT_DEG = [-90, 0, 90, 180];
const VC_WIN_START = [-90, 0, 90, 180];

const VC_WindowArc = ({ i, show }: { i: number; show: boolean }) => {
  const r = VC_RINGS[i];
  const a = VC_polar(VC_WIN_START[i], r);
  const b = VC_polar(VC_WIN_START[i] + 180, r);
  const lab = VC_polar(VC_WIN_START[i] + 45, r);
  return (
    <g>
      <VC_Curve d={`M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`} show={show} color={c.clayHex} width={5} dur={900} />
      <GFade show={show} delay={500}>
        <circle cx={lab.x} cy={lab.y} r={24} style={{ fill: c.card, stroke: c.clayHex, strokeWidth: 2 }} />
        <text x={lab.x} y={lab.y + 7} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.ink }}>
          m{i + 1}
        </text>
      </GFade>
    </g>
  );
};

/** Dot where member i's window crosses output j; k = position in the window. */
const VC_WinDot = ({ i, j, k, show }: { i: number; j: number; k: number; show: boolean }) => {
  const p = VC_polar(VC_OUT_DEG[j], VC_RINGS[i]);
  return <Dot x={p.x} y={p.y} r={8} color={c.clayHex} show={show} delay={200 + k * 300} />;
};

const VC_OutNode = ({ j, label, n, done }: { j: number; label: string; n: number; done: boolean }) => {
  const p = VC_polar(VC_OUT_DEG[j], VC_G.R);
  const side = j === 1 || j === 3 ? 'middle' : 'start';
  const tx = j === 1 || j === 3 ? p.x : p.x + 48;
  const ty = j === 3 || j === 1 ? p.y + 70 : p.y + 8;
  return (
    <g>
      <circle
        cx={p.x}
        cy={p.y}
        r={32}
        style={{
          fill: done ? c.goodSoft : c.card,
          stroke: done ? c.good : c.node,
          strokeWidth: done ? 2.5 : 1.75,
          transition: `stroke 300ms ${EASE_OUT}, fill 300ms ${EASE_OUT}`,
        }}
      />
      <T x={p.x} y={p.y + 12} size={34} font="math">
        {label}
      </T>
      <text
        x={tx}
        y={ty}
        textAnchor={side}
        style={{
          fontFamily: MONO,
          fontSize: 22,
          fill: n >= 3 ? c.good : c.muted,
          transition: `fill 300ms ${EASE_OUT}`,
        }}
      >
        {n}/3
      </text>
    </g>
  );
};

const VC_MixGraphical: Page = () => {
  const proc = useProcess(5, 1600);
  const s = proc.step;
  const nA = (s >= 1 ? 1 : 0) + (s >= 3 ? 1 : 0) + (s >= 4 ? 1 : 0);
  const nB = (s >= 1 ? 1 : 0) + (s >= 2 ? 1 : 0) + (s >= 4 ? 1 : 0);
  const nC = (s >= 1 ? 1 : 0) + (s >= 2 ? 1 : 0) + (s >= 3 ? 1 : 0);
  const nD = (s >= 2 ? 1 : 0) + (s >= 3 ? 1 : 0) + (s >= 4 ? 1 : 0);
  const signed = [nA, nB, nC, nD].filter((n) => n >= 3).length;
  const pA = VC_polar(-90, VC_G.R - 34);
  const pB = VC_polar(0, VC_G.R - 34);
  const pC = VC_polar(90, VC_G.R - 34);
  const pD = VC_polar(180, VC_G.R - 34);
  return (
    <VarShell of={VC_OF_MIX} lens="Graphical" title="Sliding windows" proc={proc}>
      <Canvas>
        <Line x1={VC_G.cx} y1={VC_G.cy} x2={pA.x} y2={pA.y} color={c.rule} dash="4 6" />
        <Line x1={VC_G.cx} y1={VC_G.cy} x2={pB.x} y2={pB.y} color={c.rule} dash="4 6" />
        <Line x1={VC_G.cx} y1={VC_G.cy} x2={pC.x} y2={pC.y} color={c.rule} dash="4 6" />
        <Line x1={VC_G.cx} y1={VC_G.cy} x2={pD.x} y2={pD.y} color={c.rule} dash="4 6" />
        <circle cx={VC_G.cx} cy={VC_G.cy} r={44} style={{ fill: c.panel, stroke: c.node, strokeWidth: 1.5 }} />
        <T x={VC_G.cx} y={VC_G.cy + 8} size={22}>
          quote
        </T>
        <VC_WindowArc i={0} show={s >= 1} />
        <VC_WindowArc i={1} show={s >= 2} />
        <VC_WindowArc i={2} show={s >= 3} />
        <VC_WindowArc i={3} show={s >= 4} />
        <VC_WinDot i={0} j={0} k={0} show={s >= 1} />
        <VC_WinDot i={0} j={1} k={1} show={s >= 1} />
        <VC_WinDot i={0} j={2} k={2} show={s >= 1} />
        <VC_WinDot i={1} j={1} k={0} show={s >= 2} />
        <VC_WinDot i={1} j={2} k={1} show={s >= 2} />
        <VC_WinDot i={1} j={3} k={2} show={s >= 2} />
        <VC_WinDot i={2} j={2} k={0} show={s >= 3} />
        <VC_WinDot i={2} j={3} k={1} show={s >= 3} />
        <VC_WinDot i={2} j={0} k={2} show={s >= 3} />
        <VC_WinDot i={3} j={3} k={0} show={s >= 4} />
        <VC_WinDot i={3} j={0} k={1} show={s >= 4} />
        <VC_WinDot i={3} j={1} k={2} show={s >= 4} />
        <VC_OutNode j={0} label="A" n={nA} done={s >= 5} />
        <VC_OutNode j={1} label="B" n={nB} done={s >= 5} />
        <VC_OutNode j={2} label="C" n={nC} done={s >= 5} />
        <VC_OutNode j={3} label="D" n={nD} done={s >= 5} />
      </Canvas>
      <At x={120} y={300} w={420}>
        <div style={{ fontSize: 30 }}>
          <M>t</M> = 3, <M>n</M> = 4
        </div>
        <Note style={{ marginTop: 14 }}>One arc: one member's request of three outputs.</Note>
      </At>
      <At x={1500} y={360} w={260}>
        <VC_Lab>Paid</VC_Lab>
        <div style={{ fontFamily: SERIF, fontSize: 96, lineHeight: 1.1 }}>3</div>
        <VC_Lab style={{ marginTop: 28 }}>Signed</VC_Lab>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 96,
            lineHeight: 1.1,
            color: signed > 3 ? c.bad : c.ink,
            transition: `color 300ms ${EASE_OUT}`,
          }}
        >
          {signed}
        </div>
      </At>
    </VarShell>
  );
};

// ─── Explained via interpolation ─────────────────────────────────────────────

const VC_IW = [130, 80, 120, 150, 130, 280, 120];

const VC_InterpRow = ({
  show,
  out,
  b,
  set,
  shares,
  lam,
  sum,
  kb,
}: {
  show: boolean;
  out: string;
  b: string;
  set: string;
  shares: string;
  lam: string;
  sum: string;
  kb: string;
}) => (
  <VC_TRow show={show} h={62}>
    <VC_TCell w={VC_IW[0]}>
      <M size={30}>{out}</M>
    </VC_TCell>
    <VC_TCell w={VC_IW[1]} mono>
      {b}
    </VC_TCell>
    <VC_TCell w={VC_IW[2]} mono>
      {set}
    </VC_TCell>
    <VC_TCell w={VC_IW[3]} mono>
      {shares}
    </VC_TCell>
    <VC_TCell w={VC_IW[4]} mono>
      {lam}
    </VC_TCell>
    <VC_TCell w={VC_IW[5]} mono>
      {sum}
    </VC_TCell>
    <VC_TCell w={VC_IW[6]} mono color={c.good}>
      {kb} ✓
    </VC_TCell>
  </VC_TRow>
);

const VC_MixInterp: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_MIX} lens="Explained via interpolation" title="Three subsets, three valid interpolations" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Fade show={s >= 1}>
          <div>
            <M size={34}>
              f(x) = 7 + 5x <Up>mod</Up> 23
            </M>
            <span style={{ display: 'inline-block', width: 48 }} />
            <M size={34}>k = f(0) = 7</M>
          </div>
          <div style={{ marginTop: 10 }}>
            <M size={34}>k₁ = 12,&nbsp; k₂ = 17,&nbsp; k₃ = 22</M>
          </div>
          <div style={{ marginTop: 10 }}>
            <M size={30}>λᵢ = ∏ j / (j − i)</M>
            <span style={{ fontSize: 26, margin: '0 12px' }}>over</span>
            <M size={30}>j ∈ S, j ≠ i</M>
          </div>
        </Fade>
      </At>
      <At x={120} y={474} w={1130}>
        <VC_TRow head h={50}>
          <VC_TCell w={VC_IW[0]} head>
            output
          </VC_TCell>
          <VC_TCell w={VC_IW[1]} head>
            <VC_NoCase>
              <M size={26}>b</M>
            </VC_NoCase>
          </VC_TCell>
          <VC_TCell w={VC_IW[2]} head>
            <VC_NoCase>
              <M size={26}>S</M>
            </VC_NoCase>
          </VC_TCell>
          <VC_TCell w={VC_IW[3]} head>
            <VC_NoCase>
              <M size={26}>kᵢ·b</M>
            </VC_NoCase>
          </VC_TCell>
          <VC_TCell w={VC_IW[4]} head>
            <VC_NoCase>
              <M size={26}>λᵢ</M>
            </VC_NoCase>
          </VC_TCell>
          <VC_TCell w={VC_IW[5]} head>
            <VC_NoCase>
              <M size={26}>Σ λᵢ·kᵢ·b</M>
            </VC_NoCase>
          </VC_TCell>
          <VC_TCell w={VC_IW[6]} head>
            <VC_NoCase>
              <M size={26}>k·b</M>
            </VC_NoCase>
          </VC_TCell>
        </VC_TRow>
        <VC_InterpRow show={s >= 2} out="A" b="4" set="{1, 3}" shares="2, 19" lam="13, 11" sum="13·2 + 11·19 = 5" kb="5" />
        <VC_InterpRow show={s >= 3} out="B" b="9" set="{1, 2}" shares="16, 15" lam="2, 22" sum="2·16 + 22·15 = 17" kb="17" />
        <VC_InterpRow show={s >= 4} out="C" b="15" set="{2, 3}" shares="2, 8" lam="3, 21" sum="3·2 + 21·8 = 13" kb="13" />
      </At>
      <At x={120} y={760} w={1200}>
        <Fade show={s >= 5}>
          <Note>
            Toy model, all values mod 23: scalars stand in for G1 points, <M>b</M> for a blinded output <M>B′</M> and{' '}
            <M>kᵢ·b</M> for <M>C′ᵢ = kᵢ·B′</M>. The weights depend only on <M>S</M>, never on the request a member
            answered.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Shares of <M>k</M> = 7 on a line mod 23. Member <M>i</M> holds <M>kᵢ = f(i)</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          A was signed by m1 and m3. Weights for <M>S</M> = {'{1, 3}'}: 13, 11. Result 5 = 7·4.
        </StepItem>
        <StepItem n={3} step={s}>
          B was signed by m1 and m2. Weights 2, 22. Result 17 = 7·9.
        </StepItem>
        <StepItem n={4} step={s}>
          C was signed by m2 and m3. Weights 3, 21. Result 13 = 7·15.
        </StepItem>
        <StepItem n={5} step={s}>
          Three different subsets, three correct signatures under <M>k</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: attacker ───────────────────────────────────────────────────

const VC_AT = { w: 220, m1: 560, m2: 830, m3: 1100 };

const VC_ReqLabel = ({ y, show, children, color = c.bad }: { y: number; show: boolean; children: ReactNode; color?: string }) => (
  <T x={VC_AT.w + 20} y={y - 12} size={21} font="mono" anchor="start" color={color} show={show} delay={200}>
    {children}
  </T>
);

const VC_MixAttacker: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const { w, m1, m2, m3 } = VC_AT;
  return (
    <VarShell of={VC_OF_MIX} lens="Perspective: attacker" title="Request plan for one paid quote" proc={proc}>
      <Canvas>
        <Lifeline x={w} label="attacker's wallet" top={300} bottom={780} color={c.bad} />
        <Lifeline x={m1} label="m1" top={300} bottom={780} />
        <Lifeline x={m2} label="m2" top={300} bottom={780} />
        <Lifeline x={m3} label="m3" top={300} bottom={780} />

        <Arrow x1={w} y1={430} x2={m1 - 6} y2={430} show={s >= 2} color={c.bad} />
        <Packet x1={w} y1={430} x2={m1} y2={430} run={proc.anim && s === 2} color={c.bad} />
        <VC_ReqLabel y={430} show={s >= 2}>
          mint q [A, B]
        </VC_ReqLabel>
        <T x={m1 + 16} y={438} size={21} anchor="start" color={c.good} show={s >= 2} delay={600}>
          valid
        </T>

        <Arrow x1={w} y1={505} x2={m2 - 6} y2={505} show={s >= 3} color={c.bad} />
        <Packet x1={w} y1={505} x2={m2} y2={505} run={proc.anim && s === 3} color={c.bad} />
        <VC_ReqLabel y={505} show={s >= 3}>
          mint q [B, C]
        </VC_ReqLabel>
        <T x={m2 + 16} y={513} size={21} anchor="start" color={c.good} show={s >= 3} delay={600}>
          valid
        </T>

        <Arrow x1={w} y1={580} x2={m3 - 6} y2={580} show={s >= 3} color={c.bad} delay={150} />
        <Packet x1={w} y1={580} x2={m3} y2={580} run={proc.anim && s === 3} color={c.bad} delay={150} />
        <VC_ReqLabel y={580} show={s >= 3}>
          mint q [C, A]
        </VC_ReqLabel>
        <T x={m3 + 16} y={588} size={21} anchor="start" color={c.good} show={s >= 3} delay={750}>
          valid
        </T>

        <Arrow x1={m1} y1={660} x2={w + 6} y2={660} show={s >= 4} color={c.clayHex} />
        <Arrow x1={m2} y1={700} x2={w + 6} y2={700} show={s >= 4} color={c.clayHex} delay={80} />
        <Arrow x1={m3} y1={740} x2={w + 6} y2={740} show={s >= 4} color={c.clayHex} delay={160} />
        <Packet x1={m1} y1={660} x2={w} y2={660} run={proc.anim && s === 4} color={c.clayHex} />
        <Packet x1={m2} y1={700} x2={w} y2={700} run={proc.anim && s === 4} color={c.clayHex} delay={80} />
        <Packet x1={m3} y1={740} x2={w} y2={740} run={proc.anim && s === 4} color={c.clayHex} delay={160} />
        <T x={m1 - 20} y={650} size={21} anchor="end" color={c.clayHex} show={s >= 4}>
          shares A, B
        </T>
        <T x={m2 - 20} y={690} size={21} anchor="end" color={c.clayHex} show={s >= 4}>
          shares B, C
        </T>
        <T x={m3 - 20} y={730} size={21} anchor="end" color={c.clayHex} show={s >= 4}>
          shares C, A
        </T>
      </Canvas>
      <VC_Box x={120} y={326} w={200} show={s >= 1} tone={c.bad} pad="8px 16px">
        <span style={{ fontSize: 22 }}>
          blind <M>A, B, C</M>
        </span>
      </VC_Box>
      <VC_Box x={120} y={810} w={1220} show={s >= 5} tone={c.bad} fill={c.badSoft} pad="12px 20px">
        <div style={{ fontFamily: MONO, fontSize: 22 }}>A ← m1, m3 · B ← m1, m2 · C ← m2, m3</div>
        <div style={{ fontSize: 24, marginTop: 4 }}>Three signatures interpolated; the quote paid for two.</div>
      </VC_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Pay one mint quote for 2 outputs. Blind three outputs A, B, C.
        </StepItem>
        <StepItem n={2} step={s}>
          Send m1 a mint request for [A, B]. Against the quote it is correct.
        </StepItem>
        <StepItem n={3} step={s}>
          Send m2 [B, C] and m3 [C, A]. Each member checks only its own request.
        </StepItem>
        <StepItem n={4} step={s}>
          Collect the shares. No member has seen another member's request.
        </StepItem>
        <StepItem n={5} step={s}>
          Group shares by output: each has <M>t = 2</M>. Interpolate three signatures.
        </StepItem>
        <Note style={{ marginTop: 20, fontSize: 22 }}>An honest wallet sends one identical body to every member.</Note>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: the swap variant ───────────────────────────────────────────────

const VC_SW_L = [250, 360, 470, 580];
const VC_SW_R = [870, 980, 1090, 1200];
const VC_SW_ROW = [410, 490, 570, 650];

const VC_RowLabel = ({ x, y, children, show = true }: { x: number; y: number; children: ReactNode; show?: boolean }) => (
  <At x={x} y={y - 16}>
    <Fade show={show}>
      <span style={{ fontFamily: MONO, fontSize: 22, color: c.muted }}>{children}</span>
    </Fade>
  </At>
);

const VC_MixSwap: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const L = s >= 1;
  const R = s >= 3;
  const [la, lb, lc, ld] = VC_SW_L;
  const [ra, rb, rc, rd] = VC_SW_R;
  const [y1, y2, y3, y4] = VC_SW_ROW;
  return (
    <VarShell of={VC_OF_MIX} lens="Framing: the swap variant" title="Fixed inputs, sliding output windows" proc={proc}>
      <At x={120} y={256}>
        <VC_Lab color={c.bad}>Sign on receipt</VC_Lab>
      </At>
      <At x={740} y={256}>
        <VC_Lab color={c.good}>Order, then sign</VC_Lab>
      </At>
      <VC_ColHead x={la} y={310}>
        A
      </VC_ColHead>
      <VC_ColHead x={lb} y={310}>
        B
      </VC_ColHead>
      <VC_ColHead x={lc} y={310}>
        C
      </VC_ColHead>
      <VC_ColHead x={ld} y={310}>
        D
      </VC_ColHead>
      <VC_ColHead x={ra} y={310}>
        A
      </VC_ColHead>
      <VC_ColHead x={rb} y={310}>
        B
      </VC_ColHead>
      <VC_ColHead x={rc} y={310}>
        C
      </VC_ColHead>
      <VC_ColHead x={rd} y={310}>
        D
      </VC_ColHead>
      <VC_RowLabel x={140} y={y1}>
        m1
      </VC_RowLabel>
      <VC_RowLabel x={140} y={y2}>
        m2
      </VC_RowLabel>
      <VC_RowLabel x={140} y={y3}>
        m3
      </VC_RowLabel>
      <VC_RowLabel x={140} y={y4}>
        m4
      </VC_RowLabel>
      <VC_RowLabel x={760} y={y1}>
        m1
      </VC_RowLabel>
      <VC_RowLabel x={760} y={y2}>
        m2
      </VC_RowLabel>
      <VC_RowLabel x={760} y={y3}>
        m3
      </VC_RowLabel>
      <VC_RowLabel x={760} y={y4}>
        m4
      </VC_RowLabel>

      <VC_Cell x={la} y={y1} w={96} h={60} on={L} label="✓" delay={0} />
      <VC_Cell x={lb} y={y1} w={96} h={60} on={L} label="✓" delay={40} />
      <VC_Cell x={lc} y={y1} w={96} h={60} on={L} label="✓" delay={80} />
      <VC_Cell x={ld} y={y1} w={96} h={60} on={false} label="" />
      <VC_Cell x={la} y={y2} w={96} h={60} on={false} label="" />
      <VC_Cell x={lb} y={y2} w={96} h={60} on={L} label="✓" delay={160} />
      <VC_Cell x={lc} y={y2} w={96} h={60} on={L} label="✓" delay={200} />
      <VC_Cell x={ld} y={y2} w={96} h={60} on={L} label="✓" delay={240} />
      <VC_Cell x={la} y={y3} w={96} h={60} on={L} label="✓" delay={400} />
      <VC_Cell x={lb} y={y3} w={96} h={60} on={false} label="" />
      <VC_Cell x={lc} y={y3} w={96} h={60} on={L} label="✓" delay={320} />
      <VC_Cell x={ld} y={y3} w={96} h={60} on={L} label="✓" delay={360} />
      <VC_Cell x={la} y={y4} w={96} h={60} on={L} label="✓" delay={520} />
      <VC_Cell x={lb} y={y4} w={96} h={60} on={L} label="✓" delay={560} />
      <VC_Cell x={lc} y={y4} w={96} h={60} on={false} label="" />
      <VC_Cell x={ld} y={y4} w={96} h={60} on={L} label="✓" delay={480} />

      <VC_Cell x={ra} y={y1} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={0} />
      <VC_Cell x={rb} y={y1} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={40} />
      <VC_Cell x={rc} y={y1} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={80} />
      <VC_Cell x={rd} y={y1} w={96} h={60} on={false} label="" />
      <VC_Cell x={ra} y={y2} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={120} />
      <VC_Cell x={rb} y={y2} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={160} />
      <VC_Cell x={rc} y={y2} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={200} />
      <VC_Cell x={rd} y={y2} w={96} h={60} on={false} label="" />
      <VC_Cell x={ra} y={y3} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={240} />
      <VC_Cell x={rb} y={y3} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={280} />
      <VC_Cell x={rc} y={y3} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={320} />
      <VC_Cell x={rd} y={y3} w={96} h={60} on={false} label="" />
      <VC_Cell x={ra} y={y4} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={360} />
      <VC_Cell x={rb} y={y4} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={400} />
      <VC_Cell x={rc} y={y4} w={96} h={60} on={R} label="✓" tone={c.good} soft={c.goodSoft} delay={440} />
      <VC_Cell x={rd} y={y4} w={96} h={60} on={false} label="" />

      <VC_Count x={la} y={700} w={100} n={L ? 3 : 0} t={3} show={s >= 2} />
      <VC_Count x={lb} y={700} w={100} n={L ? 3 : 0} t={3} show={s >= 2} />
      <VC_Count x={lc} y={700} w={100} n={L ? 3 : 0} t={3} show={s >= 2} />
      <VC_Count x={ld} y={700} w={100} n={L ? 3 : 0} t={3} show={s >= 2} />
      <VC_Count x={ra} y={700} w={100} n={R ? 4 : 0} t={3} show={s >= 3} />
      <VC_Count x={rb} y={700} w={100} n={R ? 4 : 0} t={3} show={s >= 3} />
      <VC_Count x={rc} y={700} w={100} n={R ? 4 : 0} t={3} show={s >= 3} />
      <VC_Count x={rd} y={700} w={100} n={0} t={3} show={s >= 3} />

      <At x={120} y={760} w={580}>
        <Fade show={s >= 2}>
          <div style={{ fontSize: 26, color: c.bad }}>4 outputs complete from inputs worth 3</div>
        </Fade>
      </At>
      <At x={740} y={760} w={600}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 26, color: c.good }}>3 outputs complete</div>
          <div style={{ fontSize: 24, color: c.muted, marginTop: 6 }}>
            [B, C, D], [C, D, A], [D, A, B]: <Code>TokenAlreadySpent</Code>
          </div>
        </Fade>
      </At>
      <At x={120} y={820} w={580}>
        <Fade show={s >= 1}>
          <span style={{ fontSize: 22, color: c.muted }}>inputs in every request: P1, P2, P3</span>
        </Fade>
      </At>
      <At x={120} y={900} w={1220}>
        <Fade show={s >= 4}>
          <span style={{ fontFamily: MONO, fontSize: 21, color: c.muted }}>
            local_federated_members_reject_sliding_window_swap_output_attack
          </span>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          <M>n</M> = 4, <M>t</M> = 3. Three inputs of 1 are fixed. Each member gets a balanced swap with a different
          window of three outputs.
        </StepItem>
        <StepItem n={2} step={s}>
          Signing on receipt, every output collects 3 shares: four outputs from three inputs.
        </StepItem>
        <StepItem n={3} step={s}>
          With ordering, one envelope is accepted first, here [A, B, C]. Every member signs its outputs.
        </StepItem>
        <StepItem n={4} step={s}>
          The other envelopes spend the same inputs and fail at apply. D gets no shares.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: counting shares ────────────────────────────────────────────────

const VC_CNT_UNIT = 34;
const VC_CW = [70, 70, 130, 150];

const VC_CountRow = ({
  n,
  t,
  w,
  max,
  show,
  ordered,
  hot,
  tag,
}: {
  n: number;
  t: number;
  w: number;
  max: number;
  show: boolean;
  ordered: boolean;
  hot?: boolean;
  tag?: string;
}) => (
  <VC_TRow show={show} h={60} tint={hot ? c.claySoft : undefined}>
    <VC_TCell w={VC_CW[0]} mono>
      {n}
    </VC_TCell>
    <VC_TCell w={VC_CW[1]} mono>
      {t}
    </VC_TCell>
    <VC_TCell w={VC_CW[2]} mono>
      {w}
    </VC_TCell>
    <VC_TCell w={VC_CW[3]} mono color={c.bad}>
      {max}
    </VC_TCell>
    <div style={{ width: 590, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          width: w * VC_CNT_UNIT,
          height: 22,
          background: c.node,
          borderRadius: '4px 0 0 4px',
        }}
      />
      <div
        style={{
          width: (max - w) * VC_CNT_UNIT,
          height: 22,
          background: c.bad,
          borderRadius: '0 4px 4px 0',
        }}
      />
      {tag && <span style={{ fontSize: 21, color: ACCENT, marginLeft: 14 }}>{tag}</span>}
    </div>
    <VC_TCell w={110} mono color={c.good}>
      <span style={{ opacity: ordered ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>{w}</span>
    </VC_TCell>
  </VC_TRow>
);

const VC_MixCount: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_MIX} lens="Framing: counting shares" title="How many outputs one quote can yield" proc={proc}>
      <At x={120} y={260} w={1220}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 28 }}>
            <M size={34}>n</M> members × <M size={34}>w</M> outputs each = <M size={34}>n·w</M> shares
          </div>
        </Fade>
        <Fade show={s >= 2} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 28 }}>
            <M size={34}>t</M> shares per output → at most <M size={34}>⌊n·w / t⌋</M> outputs
          </div>
        </Fade>
      </At>
      <At x={120} y={420} w={1220}>
        <VC_TRow head h={50}>
          <VC_TCell w={VC_CW[0]} head>
            <VC_NoCase>
              <M size={26}>n</M>
            </VC_NoCase>
          </VC_TCell>
          <VC_TCell w={VC_CW[1]} head>
            <VC_NoCase>
              <M size={26}>t</M>
            </VC_NoCase>
          </VC_TCell>
          <VC_TCell w={VC_CW[2]} head>
            <VC_NoCase>
              <M size={26}>w</M>
            </VC_NoCase>{' '}
            paid
          </VC_TCell>
          <VC_TCell w={VC_CW[3]} head>
            signed
          </VC_TCell>
          <VC_TCell w={590} head>
            paid + extra
          </VC_TCell>
          <VC_TCell w={110} head>
            ordered
          </VC_TCell>
        </VC_TRow>
        <VC_CountRow n={3} t={2} w={2} max={3} show={s >= 2} ordered={s >= 5} tag="main slide" />
        <VC_CountRow n={4} t={3} w={3} max={4} show={s >= 2} ordered={s >= 5} hot={s === 3} tag={s >= 3 ? 'regression test' : undefined} />
        <VC_CountRow n={5} t={3} w={2} max={3} show={s >= 2} ordered={s >= 5} />
        <VC_CountRow n={5} t={3} w={10} max={16} show={s >= 4} ordered={s >= 5} />
        <VC_CountRow n={7} t={5} w={10} max={14} show={s >= 4} ordered={s >= 5} />
      </At>
      <At x={120} y={830} w={1220}>
        <Note>
          Assumes each member signs at most one request per quote. Cyclic windows reach the bound in every row
          (checked by enumeration).
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Each member signs one request of <M>w</M> outputs for the quote: <M>n·w</M> shares in total.
        </StepItem>
        <StepItem n={2} step={s}>
          An output needs <M>t</M> shares, so at most <M>⌊n·w / t⌋</M> outputs complete.
        </StepItem>
        <StepItem n={3} step={s}>
          <M>n</M> = 4, <M>t</M> = 3, <M>w</M> = 3 is the regression test: 4 outputs for 3 paid.
        </StepItem>
        <StepItem n={4} step={s}>
          For large <M>w</M> the yield approaches <M>n/t</M> times the paid amount.
        </StepItem>
        <StepItem n={5} step={s}>
          Ordered, the yield is <M>w</M>, independent of <M>n</M> and <M>t</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 2 · Operation IDs
// ═════════════════════════════════════════════════════════════════════════════

// SHA-256 of the toy strings below, computed with python hashlib.
const VC_H_AB = ['8ec8c56a0caed28bdbb3a9e761ecae94', '436cd868f92fe43b94ac4770cf1bfc44'];
const VC_H_AC = ['505895e0517833bf2eece0f25c72fab4', '154741930f56bb624250f1474ff399b2'];

const VC_HexOut = ({ y, show, hex, color, delay = 0 }: { y: number; show: boolean; hex: string[]; color: string; delay?: number }) => (
  <At x={880} y={y}>
    <Fade show={show} delay={delay}>
      <div style={{ fontFamily: MONO, fontSize: 22, lineHeight: 1.5, color }}>
        <div>{hex[0]}</div>
        <div>{hex[1]}</div>
      </div>
    </Fade>
  </At>
);

const VC_OpBeginner: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_OP} lens="Beginner" title="A hash as the name of a request" proc={proc}>
      <Canvas>
        <Arrow x1={700} y1={329} x2={860} y2={329} show={s >= 2} label="SHA-256" font="mono" labelColor={c.muted} />
        <Arrow x1={700} y1={519} x2={860} y2={519} show={s >= 3} label="SHA-256" font="mono" labelColor={c.muted} />
        <Arrow x1={700} y1={709} x2={860} y2={709} show={s >= 4} label="SHA-256" font="mono" labelColor={c.muted} />
      </Canvas>
      <At x={120} y={264}>
        <Fade show={s >= 1}>
          <VC_Lab>request</VC_Lab>
        </Fade>
      </At>
      <VC_Box x={120} y={300} w={570} show={s >= 1} pad="14px 22px" style={{ fontFamily: MONO, fontSize: 24 }}>
        {'{"outputs":["A","B"],"quote":"q1"}'}
      </VC_Box>
      <VC_HexOut y={296} show={s >= 2} hex={VC_H_AB} color={c.clayHex} delay={400} />

      <At x={120} y={454}>
        <Fade show={s >= 3}>
          <VC_Lab>one output changed</VC_Lab>
        </Fade>
      </At>
      <VC_Box x={120} y={490} w={570} show={s >= 3} pad="14px 22px" style={{ fontFamily: MONO, fontSize: 24 }}>
        {'{"outputs":["A","'}
        <span style={{ color: c.violet }}>C</span>
        {'"],"quote":"q1"}'}
      </VC_Box>
      <VC_HexOut y={486} show={s >= 3} hex={VC_H_AC} color={c.violet} delay={400} />

      <At x={120} y={644}>
        <Fade show={s >= 4}>
          <VC_Lab>same bytes again</VC_Lab>
        </Fade>
      </At>
      <VC_Box x={120} y={680} w={570} show={s >= 4} pad="14px 22px" style={{ fontFamily: MONO, fontSize: 24 }}>
        {'{"outputs":["A","B"],"quote":"q1"}'}
      </VC_Box>
      <VC_HexOut y={676} show={s >= 4} hex={VC_H_AB} color={c.clayHex} delay={400} />
      <At x={880} y={752}>
        <Fade show={s >= 4} delay={600}>
          <span style={{ fontSize: 22, color: c.good }}>✓ identical to the first</span>
        </Fade>
      </At>
      <At x={120} y={830} w={1220}>
        <Note>
          CDK hashes the canonical request envelope (federation ID, version, operation) behind a domain tag. The strings
          here are shortened; the hashes are real SHA-256.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          A request is a byte string: a quote and two blinded outputs, written here as JSON.
        </StepItem>
        <StepItem n={2} step={s}>
          SHA-256 maps any byte string to 32 bytes. The same input always gives the same output.
        </StepItem>
        <StepItem n={3} step={s}>
          Change one output from B to C: an unrelated hash, a different operation.
        </StepItem>
        <StepItem n={4} step={s}>
          Send the first bytes again: the same hash. A retry names the same operation.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VC_Seg = ({
  bytes,
  label,
  tone = 'field',
  show,
  delay = 0,
}: {
  bytes: string;
  label: string;
  tone?: 'type' | 'len' | 'field';
  show: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginRight: 10,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT} ${show ? delay : 0}ms, transform 400ms ${EASE_OUT} ${show ? delay : 0}ms`,
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 21,
        padding: '6px 10px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${tone === 'type' ? c.clayHex : c.rule}`,
        background: tone === 'type' ? c.claySoft : tone === 'len' ? c.panel : c.card,
        color: tone === 'len' ? c.muted : c.ink,
      }}
    >
      {bytes}
    </span>
    <span style={{ fontSize: 21, color: c.muted, marginTop: 6, whiteSpace: 'nowrap' }}>{label}</span>
  </div>
);

const VC_OpAdvanced: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_OP} lens="Advanced" title="Operation ID: construction and rules" proc={proc}>
      <At x={120} y={256}>
        <VC_Lab>Hashed transcript, with a toy payload in place of the envelope</VC_Lab>
      </At>
      <At x={120} y={296} w={1680}>
        <div style={{ display: 'flex' }}>
          <VC_Seg bytes="00 00 00 1b" label="length 27" tone="len" show={s >= 1} />
          <VC_Seg bytes="cdk-federation-operation-v1" label="domain tag" tone="type" show={s >= 1} delay={60} />
          <VC_Seg bytes="00 00 00 34" label="length 52" tone="len" show={s >= 1} delay={120} />
          <VC_Seg
            bytes={'{"kind":"Mint","outputs":["A","B"],"quote":"q-7f3a"}'}
            label="canonical JSON, keys sorted"
            show={s >= 1}
            delay={180}
          />
        </div>
      </At>
      <At x={120} y={404} w={1680}>
        <Fade show={s >= 1} delay={350}>
          <div style={{ fontSize: 26 }}>
            SHA-256 → <Code>b154a1d80cf8a919020c222037ead2a1…</Code>
            <span style={{ fontSize: 22, color: c.muted, marginLeft: 20 }}>(computed for these bytes)</span>
          </div>
        </Fade>
      </At>
      <At x={120} y={480} w={1680}>
        <Fade show={s >= 2}>
          <Check>
            Canonical bytes: JSON of <Code>{'{ federation_id, operation, version }'}</Code> with every object's keys
            sorted. The <Code>authorization</Code> signature is excluded, so every member that wraps the same request
            derives the same ID.
          </Check>
          <Check>
            The version must equal <Code>FEDERATION_OPERATION_VERSION</Code> = 6; any other version is rejected before
            hashing.
          </Check>
          <Check>
            No supplied ID is trusted: consensus admission, signing (<Code>FederationAcceptedSigningRequest</Code>) and
            catch-up (<Code>CatchUpOperationIdMismatch</Code>) recompute it from the envelope.
          </Check>
        </Fade>
        <Fade show={s >= 3}>
          <Check>
            Canonical envelopes above 1 MiB are not admitted (<Code>FEDERATION_MAX_OPERATION_ENVELOPE_BYTES</Code>).
          </Check>
          <Check>
            Key order in the incoming JSON does not change the ID (
            <Code>canonical_hash_ignores_custom_json_field_order</Code>); a golden vector pins the v6 encoding.
          </Check>
          <Check>
            The ID names bytes, not intent: two output sets for one quote have two IDs; the conflict key relates them.
          </Check>
        </Fade>
      </At>
      <At x={120} y={920} w={1680}>
        <span style={{ fontFamily: MONO, fontSize: 21, color: c.muted }}>crates/cdk-common/src/federation/operation.rs</span>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VC_ReqChip = ({ y, who, outs, tone, show, delay = 0 }: { y: number; who: string; outs: string; tone: string; show: boolean; delay?: number }) => (
  <VC_Box x={140} y={y - 30} w={430} h={60} show={show} tone={tone} delay={delay} pad="0 20px" style={{ display: 'flex', alignItems: 'center' }}>
    <span style={{ fontSize: 23 }}>{who}</span>
    <span style={{ fontFamily: MONO, fontSize: 23, marginLeft: 14, color: tone }}>[{outs}]</span>
  </VC_Box>
);

const VC_link = (y1: number, y2: number) => `M 572 ${y1} C 772 ${y1}, 772 ${y2}, 968 ${y2}`;

const VC_OpGraphical: Page = () => {
  const proc = useProcess(4, 1800);
  const s = proc.step;
  const id1 = 470;
  const id2 = 820;
  return (
    <VarShell of={VC_OF_OP} lens="Graphical" title="Many requests, two operations" proc={proc}>
      <Canvas>
        <rect x={732} y={292} width={80} height={580} rx={14} style={{ fill: c.panel, stroke: c.rule, strokeWidth: 1.5 }} />
        <T x={772} y={276} size={22} font="mono" color={c.muted}>
          SHA-256
        </T>
        <VC_Curve d={VC_link(330, id1)} show={s >= 1} color={c.clayHex} width={2.5} />
        <VC_Curve d={VC_link(420, id1)} show={s >= 1} color={c.clayHex} width={2.5} delay={60} />
        <VC_Curve d={VC_link(510, id1)} show={s >= 1} color={c.clayHex} width={2.5} delay={120} />
        <VC_Curve d={VC_link(640, id1)} show={s >= 2} color={c.clayHex} width={2.5} />
        <VC_Curve d={VC_link(820, id2)} show={s >= 3} color={c.violet} width={2.5} />
        <Arrow x1={1272} y1={id1} x2={1424} y2={id1} show={s >= 4} color={c.node} />
        <Arrow x1={1272} y1={id2} x2={1424} y2={id2} show={s >= 4} color={c.node} delay={120} />
      </Canvas>
      <VC_ReqChip y={330} who="wallet → m1" outs="A, B" tone={c.clayHex} show={s >= 1} />
      <VC_ReqChip y={420} who="wallet → m2" outs="A, B" tone={c.clayHex} show={s >= 1} delay={50} />
      <VC_ReqChip y={510} who="wallet → m3" outs="A, B" tone={c.clayHex} show={s >= 1} delay={100} />
      <VC_ReqChip y={640} who="retry → m1" outs="A, B" tone={c.clayHex} show={s >= 2} />
      <VC_ReqChip y={820} who="attacker → m2" outs="B, C" tone={c.violet} show={s >= 3} />
      <VC_Node
        x={1120}
        y={id1}
        w={300}
        h={96}
        title={<span style={{ fontFamily: MONO, fontSize: 26, color: c.clayHex }}>30cec45b…</span>}
        sub={s >= 2 ? '4 requests' : '3 requests'}
        tone={c.clayHex}
        show={s >= 1}
        delay={500}
      />
      <VC_Node
        x={1120}
        y={id2}
        w={300}
        h={96}
        title={<span style={{ fontFamily: MONO, fontSize: 26, color: c.violet }}>6222b53b…</span>}
        sub="1 request"
        tone={c.violet}
        show={s >= 3}
        delay={500}
      />
      <VC_Box x={1440} y={id1 - 32} w={340} h={64} show={s >= 4} delay={400} pad="0 20px" style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 23 }}>#41 · op 30ce…</span>
      </VC_Box>
      <VC_Box x={1440} y={id2 - 32} w={340} h={64} show={s >= 4} delay={520} pad="0 20px" style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 23 }}>#42 · op 6222…</span>
      </VC_Box>
      <At x={1440} y={id1 - 80}>
        <Fade show={s >= 4}>
          <VC_Lab>log</VC_Lab>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Explained via code ──────────────────────────────────────────────────────

const VC_OpCode: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_OP} lens="Explained via code" title="operation_id() in cdk-common" proc={proc}>
      <VC_Box x={120} y={262} w={1220} pad="14px 24px">
        <JLine on={false}>{'pub fn operation_id(&self) -> Result<FederationOperationId> {'}</JLine>
        <JLine on={s === 1}>{'    self.ensure_supported_version()?;'}</JLine>
        <JLine on={s === 2}>{'    let canonical = self.unsigned_canonical_bytes()?;'}</JLine>
        <JLine on={s === 4}>{'    Ok(operation_id_from_canonical(&canonical))'}</JLine>
        <JLine on={false}>{'}'}</JLine>
        <JLine on={s === 2}>{'fn unsigned_canonical_bytes(&self) -> Result<Vec<u8>> {'}</JLine>
        <JLine on={s === 2}>{'    canonical_json_bytes(&FederationUnsignedOperationEnvelope {'}</JLine>
        <JLine on={s === 2}>{'        version: self.version,'}</JLine>
        <JLine on={s === 2}>{'        federation_id: self.federation_id,'}</JLine>
        <JLine on={s === 2}>{'        operation: &self.operation,'}</JLine>
        <JLine on={false}>{'    })'}</JLine>
        <JLine on={false}>{'}'}</JLine>
        <JLine on={false}>{'fn operation_id_from_canonical(canonical: &[u8]) -> FederationOperationId {'}</JLine>
        <JLine on={s === 3}>{'    let mut transcript = Vec::new();'}</JLine>
        <JLine on={s === 3}>{'    append_hash_bytes(&mut transcript, FEDERATION_OPERATION_HASH_VERSION);'}</JLine>
        <JLine on={s === 3}>{'    append_hash_bytes(&mut transcript, canonical);'}</JLine>
        <JLine on={s === 4}>{'    FederationOperationId::from_bytes(Sha256Hash::hash(&transcript).to_byte_array())'}</JLine>
        <JLine on={false}>{'}'}</JLine>
      </VC_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Reject an envelope whose version is not the current one (6).
        </StepItem>
        <StepItem n={2} step={s}>
          Serialize version, federation ID and operation with sorted keys. The authorization signature is left out.
        </StepItem>
        <StepItem n={3} step={s}>
          Append the domain tag and the canonical bytes, each prefixed with its u32 big-endian length.
        </StepItem>
        <StepItem n={4} step={s}>
          SHA-256 of this transcript is the operation ID.
        </StepItem>
        <Note style={{ marginTop: 20, fontSize: 24 }}>
          <div>Domain tag:</div>
          <Code>cdk-federation-operation-v1</Code>
          <div style={{ marginTop: 8 }}>File:</div>
          <Code>federation/operation.rs</Code>
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: receiving member ───────────────────────────────────────────

const VC_FX = 400;
const VC_FW = 540;
const VC_OX = 1045;
const VC_OW = 470;
const VC_FY = [296, 392, 488, 584, 680, 776, 872];

const VC_OpMember: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  const y = VC_FY;
  const right = VC_FX + VC_FW / 2;
  const oleft = VC_OX - VC_OW / 2;
  return (
    <VarShell of={VC_OF_OP} lens="Perspective: receiving member" title="What a member does with an incoming request" proc={proc}>
      <Canvas>
        <Arrow x1={VC_FX} y1={y[0] + 33} x2={VC_FX} y2={y[1] - 35} show={s >= 1} color={c.node} />
        <Arrow x1={VC_FX} y1={y[1] + 33} x2={VC_FX} y2={y[2] - 35} show={s >= 2} color={c.node} />
        <Arrow x1={VC_FX} y1={y[2] + 33} x2={VC_FX} y2={y[3] - 35} show={s >= 2} color={c.node} />
        <Arrow x1={VC_FX} y1={y[3] + 33} x2={VC_FX} y2={y[4] - 35} show={s >= 3} color={c.node} />
        <Arrow x1={VC_FX} y1={y[4] + 33} x2={VC_FX} y2={y[5] - 35} show={s >= 3} color={c.node} />
        <Arrow x1={VC_FX} y1={y[5] + 33} x2={VC_FX} y2={y[6] - 35} show={s >= 4} color={c.node} />
        <T x={VC_FX + 16} y={y[3] + 55} size={21} anchor="start" color={c.muted} show={s >= 3}>
          yes
        </T>
        <T x={VC_FX + 16} y={y[4] + 55} size={21} anchor="start" color={c.muted} show={s >= 3}>
          no
        </T>
        <T x={VC_FX + 16} y={y[5] + 55} size={21} anchor="start" color={c.muted} show={s >= 4}>
          no
        </T>
        <Arrow x1={right} y1={y[1]} x2={oleft - 6} y2={y[1]} show={s >= 1} color={c.bad} label="fail" font="sans" delay={200} />
        <Arrow x1={right} y1={y[3]} x2={oleft - 6} y2={y[3]} show={s >= 2} color={c.bad} label="no" font="sans" delay={200} />
        <Arrow x1={right} y1={y[4]} x2={oleft - 6} y2={y[4]} show={s >= 3} color={c.cool} label="yes" font="sans" delay={200} />
        <Arrow x1={right} y1={y[5]} x2={oleft - 6} y2={y[5]} show={s >= 3} color={c.bad} label="yes" font="sans" delay={300} />
      </Canvas>
      <VC_Node x={VC_FX} y={y[0]} w={VC_FW} title={<span style={{ fontFamily: MONO, fontSize: 22 }}>POST /v1/swap</span>} sub="same body at every member" show={s >= 1} />
      <VC_Node x={VC_FX} y={y[1]} w={VC_FW} title="Admission" sub="v3 outputs, unique inputs, valid proofs" show={s >= 1} delay={100} />
      <VC_Node
        x={VC_FX}
        y={y[2]}
        w={VC_FW}
        title={
          <>
            Envelope → <span style={{ fontFamily: MONO, fontSize: 22 }}>operation_id</span>
          </>
        }
        sub="federation_id, version 6, operation"
        show={s >= 2}
      />
      <VC_Node x={VC_FX} y={y[3]} w={VC_FW} title="Sync status healthy?" show={s >= 2} delay={100} />
      <VC_Node
        x={VC_FX}
        y={y[4]}
        w={VC_FW}
        title={
          <>
            <span style={{ fontFamily: MONO, fontSize: 22 }}>operation_id</span> already pending or finalized?
          </>
        }
        show={s >= 3}
      />
      <VC_Node x={VC_FX} y={y[5]} w={VC_FW} title="Conflict key held by another operation?" show={s >= 3} delay={100} />
      <VC_Node
        x={VC_FX}
        y={y[6]}
        w={VC_FW}
        title="Queue for AlephBFT"
        sub="after apply: answer from stored shares"
        tone={c.good}
        fill={c.goodSoft}
        show={s >= 4}
      />
      <VC_Node x={VC_OX} y={y[1]} w={VC_OW} title="rejected before consensus" tone={c.bad} show={s >= 1} delay={500} />
      <VC_Node
        x={VC_OX}
        y={y[3]}
        w={VC_OW}
        title="fail closed, no shares"
        sub="NodeLagging · NodeCatchingUp · NodeHalted"
        tone={c.bad}
        show={s >= 2}
        delay={500}
      />
      <VC_Node x={VC_OX} y={y[4]} w={VC_OW} title="join the existing operation" sub="DuplicateOperation" tone={c.cool} show={s >= 3} delay={500} />
      <VC_Node
        x={VC_OX}
        y={y[5]}
        w={VC_OW}
        title="refused: ConflictingOperation"
        sub="HTTP 409 on the private plane"
        tone={c.bad}
        show={s >= 3}
        delay={600}
      />
      <StepList>
        <StepItem n={1} step={s}>
          Admission runs before anything is proposed: outputs, inputs, proofs, size bounds.
        </StepItem>
        <StepItem n={2} step={s}>
          The member builds the envelope and computes the <Code>operation_id</Code> itself. If it is not healthy it
          stops here.
        </StepItem>
        <StepItem n={3} step={s}>
          A known <Code>operation_id</Code> is joined. A conflict key held by another operation is refused.
        </StepItem>
        <StepItem n={4} step={s}>
          Only a new, non-conflicting envelope is queued. After apply the member answers from stored shares.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: retry after a lost response ────────────────────────────────────

const VC_RT = { w: 230, m: 660, log: 1090 };

const VC_OpRetry: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const { w, m, log } = VC_RT;
  return (
    <VarShell of={VC_OF_OP} lens="Framing: retry after a lost response" title="Retries and the operation ID" proc={proc}>
      <Canvas>
        <Lifeline x={w} label="wallet" top={290} bottom={860} color={c.cool} />
        <Lifeline x={m} label="m1" top={290} bottom={860} />
        <Lifeline x={log} label="consensus log" top={290} bottom={860} color={c.violet} />

        <Arrow x1={w} y1={340} x2={m - 6} y2={340} show={s >= 1} color={c.cool} />
        <Packet x1={w} y1={340} x2={m} y2={340} run={proc.anim && s === 1} />
        <T x={w + 20} y={328} size={21} anchor="start" color={c.cool} show={s >= 1}>
          swap P1, P2 → [A, B]
        </T>
        <Arrow x1={m} y1={400} x2={log - 6} y2={400} show={s >= 1} color={c.violet} delay={300} />
        <T x={m + 20} y={388} size={26} anchor="start" font="math" color={c.violet} show={s >= 1} delay={300}>
          op₁
        </T>
        <Band x1={log - 110} x2={log + 110} y={452} label="#41 = op₁" show={s >= 1} tone="neutral" />

        <Arrow x1={m} y1={524} x2={w + 6} y2={524} show={s >= 2} color={c.bad} dashed />
        <T x={w + 20} y={512} size={21} anchor="start" color={c.bad} show={s >= 2}>
          response lost
        </T>
        <T x={(w + m) / 2} y={532} size={30} font="mono" color={c.bad} show={s >= 2} delay={300}>
          ✗
        </T>

        <Arrow x1={w} y1={594} x2={m - 6} y2={594} show={s >= 3} color={c.cool} />
        <Packet x1={w} y1={594} x2={m} y2={594} run={proc.anim && s === 3} />
        <T x={w + 20} y={582} size={21} anchor="start" color={c.cool} show={s >= 3}>
          the same bytes again
        </T>
        <Arrow x1={m} y1={644} x2={log - 6} y2={644} show={s >= 3} color={c.violet} dashed delay={300} />
        <T x={m + 20} y={632} size={22} anchor="start" color={c.violet} show={s >= 3} delay={300}>
          op₁ is already #41
        </T>
        <Arrow x1={m} y1={704} x2={w + 6} y2={704} show={s >= 3} color={c.clayHex} delay={700} />
        <Packet x1={m} y1={704} x2={w} y2={704} run={proc.anim && s === 3} color={c.clayHex} delay={900} />
        <T x={w + 20} y={692} size={21} anchor="start" color={c.clayHex} show={s >= 3} delay={700}>
          stored shares for #41
        </T>

        <Arrow x1={w} y1={784} x2={m - 6} y2={784} show={s >= 4} color={c.bad} />
        <T x={w + 20} y={772} size={21} anchor="start" color={c.bad} show={s >= 4}>
          P1, P2 → [A, C]
        </T>
        <Arrow x1={m} y1={834} x2={log - 6} y2={834} show={s >= 4} color={c.bad} delay={300} />
        <T x={m + 20} y={822} size={26} anchor="start" font="math" color={c.bad} show={s >= 4} delay={300}>
          op₂
        </T>
        <T x={log + 18} y={842} size={21} anchor="start" color={c.bad} show={s >= 4} delay={700}>
          TokenAlreadySpent
        </T>
      </Canvas>
      <At x={120} y={892} w={1220}>
        <Fade show={s >= 5}>
          <Note style={{ fontSize: 23 }}>
            Mint: new outputs on the same quote conflict on <Code>Mint {'{ quote }'}</Code> and are refused with{' '}
            <Code>ConflictingOperation</Code>.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet sends a swap. m1 derives <M>op₁</M>; consensus finalizes it as #41.
        </StepItem>
        <StepItem n={2} step={s}>
          The response is lost. The wallet cannot tell whether the swap was applied.
        </StepItem>
        <StepItem n={3} step={s}>
          It resends the same bytes: same <M>op₁</M>, already #41. m1 returns the shares it stored.
        </StepItem>
        <StepItem n={4} step={s}>
          New outputs make a new operation <M>op₂</M>. Its inputs were spent by #41.
        </StepItem>
        <StepItem n={5} step={s}>
          A safe retry resends the exact bytes.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: operation ID vs conflict key ───────────────────────────────────

const VC_KW = [640, 230, 340, 470];

const VC_KeyRow = ({
  show,
  pair,
  sameId,
  ckey,
  ok,
  outcome,
}: {
  show: boolean;
  pair: ReactNode;
  sameId: boolean;
  ckey: ReactNode;
  ok: boolean;
  outcome: ReactNode;
}) => (
  <VC_TRow show={show} h={84}>
    <VC_TCell w={VC_KW[0]}>{pair}</VC_TCell>
    <VC_TCell w={VC_KW[1]} color={sameId ? c.good : c.violet}>
      {sameId ? 'same' : 'different'}
    </VC_TCell>
    <VC_TCell w={VC_KW[2]}>{ckey}</VC_TCell>
    <VC_TCell w={VC_KW[3]}>
      <VC_Mark ok={ok} />
      {outcome}
    </VC_TCell>
  </VC_TRow>
);

const VC_OpVsKey: Page = () => {
  const proc = useProcess(6, 1800);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_OP} lens="Framing: operation ID vs conflict key" title="Two identities: the exact bytes and the claimed resource" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VC_TRow head h={50}>
          <VC_TCell w={VC_KW[0]} head>
            Two requests
          </VC_TCell>
          <VC_TCell w={VC_KW[1]} head>
            operation_id
          </VC_TCell>
          <VC_TCell w={VC_KW[2]} head>
            conflict key
          </VC_TCell>
          <VC_TCell w={VC_KW[3]} head>
            Outcome
          </VC_TCell>
        </VC_TRow>
        <VC_KeyRow
          show={s >= 1}
          pair={
            <>
              retry of <Code>mint q-7f3a [A, B]</Code>, same bytes
            </>
          }
          sameId
          ckey={
            <>
              same, <Code>Mint {'{ q-7f3a }'}</Code>
            </>
          }
          ok
          outcome="joins the existing operation"
        />
        <VC_KeyRow
          show={s >= 2}
          pair={
            <>
              <Code>mint q-7f3a [A, B]</Code> and <Code>mint q-7f3a [B, C]</Code>
            </>
          }
          sameId={false}
          ckey="same"
          ok={false}
          outcome={
            <>
              second refused: <Code>ConflictingOperation</Code>
            </>
          }
        />
        <VC_KeyRow
          show={s >= 3}
          pair={
            <>
              <Code>mint q-7f3a [A, B]</Code> and <Code>mint q-91c0 [C, D]</Code>
            </>
          }
          sameId={false}
          ckey="different"
          ok
          outcome="independent; both ordered"
        />
        <VC_KeyRow
          show={s >= 4}
          pair={
            <>
              <Code>swap P1, P2 → [A, B]</Code> and <Code>swap P1, P2 → [B, C]</Code>
            </>
          }
          sameId={false}
          ckey="none: swaps have no conflict key"
          ok={false}
          outcome={
            <>
              both ordered; the second fails at apply: <Code>TokenAlreadySpent</Code>
            </>
          }
        />
        <VC_KeyRow
          show={s >= 5}
          pair={
            <>
              payment observation for <Code>q-7f3a</Code> by m1 and by m2
            </>
          }
          sameId={false}
          ckey="different: the key includes the observer"
          ok
          outcome="both count toward the observation quorum"
        />
      </At>
      <At x={120} y={780} w={1680}>
        <Fade show={s >= 6}>
          <Note style={{ fontSize: 24 }}>
            Proof <M>Y</M>s are deliberately not conflict keys. Reserving a <M>Y</M> at ordering time would let a faulty
            member order an invalid proof with that <M>Y</M> first and lock out its owner. The proof store at apply is
            the spend lock (<Code>conflict_keys()</Code> in <Code>operation.rs</Code>).
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 3 · Consensus before signing
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VC_CB_X = [290, 660, 1030];

const VC_LogCell = ({
  x,
  y,
  n,
  outs,
  color,
  verdict,
  show,
  delay = 0,
}: {
  x: number;
  y: number;
  n: string;
  outs: string;
  color: string;
  verdict?: 'ok' | 'bad';
  show: boolean;
  delay?: number;
}) => (
  <VC_Box
    x={x - 150}
    y={y}
    w={300}
    h={56}
    show={show}
    delay={delay}
    tone={verdict === 'ok' ? c.good : verdict === 'bad' ? c.bad : c.rule}
    fill={verdict === 'ok' ? c.goodSoft : verdict === 'bad' ? c.badSoft : c.card}
    pad="0 16px"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
  >
    <span style={{ fontFamily: MONO, fontSize: 22 }}>
      {n} <span style={{ color }}>[{outs}]</span>
    </span>
    <span style={{ opacity: verdict ? 1 : 0, transition: `opacity 300ms ${EASE_OUT}` }}>
      <VC_Mark ok={verdict !== 'bad'} />
    </span>
  </VC_Box>
);

const VC_ConBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const [x1, x2, x3] = VC_CB_X;
  const v1 = s >= 3 ? 'ok' : undefined;
  const v2 = s >= 4 ? 'bad' : undefined;
  return (
    <VarShell of={VC_OF_CON} lens="Beginner" title="Agree on the order, then sign" proc={proc}>
      <Canvas>
        <Arrow x1={x1} y1={330} x2={x1} y2={368} show={s >= 2} color={c.clayHex} />
        <Arrow x1={x3} y1={330} x2={x3} y2={368} show={s >= 2} color={c.violet} />
        <Arrow x1={x1} y1={436} x2={x1} y2={458} show={s >= 3} color={c.node} />
        <Arrow x1={x2} y1={436} x2={x2} y2={458} show={s >= 3} color={c.node} />
        <Arrow x1={x3} y1={436} x2={x3} y2={458} show={s >= 3} color={c.node} />
        <Member x={x1} y={492} r={30} label="m1" tone={s >= 5 ? 'on' : 'idle'} />
        <Member x={x2} y={492} r={30} label="m2" tone={s >= 5 ? 'on' : 'idle'} />
        <Member x={x3} y={492} r={30} label="m3" tone={s >= 5 ? 'on' : 'idle'} />
      </Canvas>
      <VC_Box x={x1 - 160} y={272} w={320} h={56} show={s >= 1} tone={c.clayHex} pad="0 18px" style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 22 }}>mint q [A, B] → m1</span>
      </VC_Box>
      <VC_Box x={x3 - 160} y={272} w={320} h={56} show={s >= 1} tone={c.violet} delay={100} pad="0 18px" style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 22 }}>mint q [B, C] → m3</span>
      </VC_Box>
      <VC_Box
        x={x1 - 160}
        y={372}
        w={x3 - x1 + 320}
        h={62}
        show={s >= 2}
        fill={c.panel}
        pad="0 20px"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontSize: 24 }}>consensus: one list, one order</span>
      </VC_Box>
      <VC_LogCell x={x1} y={540} n="1" outs="A, B" color={c.clayHex} verdict={v1} show={s >= 3} />
      <VC_LogCell x={x2} y={540} n="1" outs="A, B" color={c.clayHex} verdict={v1} show={s >= 3} delay={60} />
      <VC_LogCell x={x3} y={540} n="1" outs="A, B" color={c.clayHex} verdict={v1} show={s >= 3} delay={120} />
      <VC_LogCell x={x1} y={610} n="2" outs="B, C" color={c.violet} verdict={v2} show={s >= 3} delay={200} />
      <VC_LogCell x={x2} y={610} n="2" outs="B, C" color={c.violet} verdict={v2} show={s >= 3} delay={260} />
      <VC_LogCell x={x3} y={610} n="2" outs="B, C" color={c.violet} verdict={v2} show={s >= 3} delay={320} />
      <VC_Box x={x1 - 110} y={700} w={220} h={50} show={s >= 5} tone={c.clayHex} fill={c.claySoft} pad="0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22 }}>signs A, B</span>
      </VC_Box>
      <VC_Box x={x2 - 110} y={700} w={220} h={50} show={s >= 5} tone={c.clayHex} fill={c.claySoft} delay={60} pad="0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22 }}>signs A, B</span>
      </VC_Box>
      <VC_Box x={x3 - 110} y={700} w={220} h={50} show={s >= 5} tone={c.clayHex} fill={c.claySoft} delay={120} pad="0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22 }}>signs A, B</span>
      </VC_Box>
      <At x={130} y={800} w={1200}>
        <Fade show={s >= 5} delay={300}>
          <div style={{ fontFamily: SERIF, fontSize: 32 }}>A and B: three shares each. C: none.</div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          m1 receives a mint for quote q with outputs [A, B]. m3 receives one for the same quote with [B, C].
        </StepItem>
        <StepItem n={2} step={s}>
          Neither signs. Both requests go into consensus, which outputs one list in one order.
        </StepItem>
        <StepItem n={3} step={s}>
          Every member receives the same list. Entry 1 is the first to use quote q: accepted.
        </StepItem>
        <StepItem n={4} step={s}>
          Entry 2 uses quote q again: rejected by every member, for the same reason.
        </StepItem>
        <StepItem n={5} step={s}>
          Members sign only the outputs of entry 1. C never gets a share.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VC_QX = [240, 390, 540, 690, 840];

const VC_Bracket = ({ x1, x2, y, up, color, show }: { x1: number; x2: number; y: number; up?: boolean; color: string; show: boolean }) => {
  const t = up ? 12 : -12;
  return (
    <GFade show={show}>
      <polyline
        points={`${x1},${y + t} ${x1},${y} ${x2},${y} ${x2},${y + t}`}
        style={{ fill: 'none', stroke: color, strokeWidth: 2.5, strokeLinejoin: 'round' }}
      />
    </GFade>
  );
};

const VC_ConAdvanced: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const [a, b, cx, d, e] = VC_QX;
  return (
    <VarShell of={VC_OF_CON} lens="Advanced" title="Quorum intersection and the two thresholds" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Fade show={s >= 1}>
          <M size={32}>n = 5,&nbsp; f = ⌊(n − 1)/3⌋ = 1,&nbsp; c = n − f = 4,&nbsp; t = 3</M>
        </Fade>
      </At>
      <Canvas>
        <GFade show={s >= 2}>
          <rect x={b - 40} y={384} width={d - b + 80} height={72} rx={14} style={{ fill: c.goodSoft, stroke: c.good, strokeWidth: 1.5, strokeDasharray: '5 5' }} />
        </GFade>
        <VC_Bracket x1={a - 34} x2={d + 34} y={362} up color={c.clayHex} show={s >= 2} />
        <VC_Bracket x1={b - 34} x2={e + 34} y={478} color={c.cool} show={s >= 2} />
        <T x={(a + d) / 2} y={348} size={28} font="math" color={c.clayHex} show={s >= 2}>
          Q₁
        </T>
        <T x={(b + e) / 2} y={512} size={28} font="math" color={c.cool} show={s >= 2}>
          Q₂
        </T>
        <Member x={a} y={420} r={30} label="m1" />
        <Member x={b} y={420} r={30} label="m2" />
        <Member x={cx} y={420} r={30} label="m3" />
        <Member x={d} y={420} r={30} label="m4" />
        <Member x={e} y={420} r={30} label="m5" />

        <GFade show={s >= 3}>
          <rect x={cx - 40} y={664} width={80} height={72} rx={14} style={{ fill: c.badSoft, stroke: c.bad, strokeWidth: 1.5, strokeDasharray: '5 5' }} />
        </GFade>
        <VC_Bracket x1={a - 34} x2={cx + 34} y={642} up color={c.clayHex} show={s >= 3} />
        <VC_Bracket x1={cx - 34} x2={e + 34} y={758} color={c.cool} show={s >= 3} />
        <T x={(a + cx) / 2} y={628} size={28} font="math" color={c.clayHex} show={s >= 3}>
          T₁
        </T>
        <T x={(cx + e) / 2} y={792} size={28} font="math" color={c.cool} show={s >= 3}>
          T₂
        </T>
        <Member x={a} y={700} r={30} label="m1" />
        <Member x={b} y={700} r={30} label="m2" />
        <Member x={cx} y={700} r={30} label="m3" tone={s >= 3 ? 'bad' : 'idle'} />
        <Member x={d} y={700} r={30} label="m4" />
        <Member x={e} y={700} r={30} label="m5" />
      </Canvas>
      <At x={950} y={372} w={390}>
        <Fade show={s >= 2} delay={300}>
          <M size={30}>|Q₁ ∩ Q₂| ≥ 2c − n = 3</M>
          <Note style={{ marginTop: 8 }}>
            <M>3 ≥ f + 1</M>: an honest member is in both.
          </Note>
        </Fade>
      </At>
      <At x={950} y={652} w={390}>
        <Fade show={s >= 3} delay={300}>
          <M size={30}>|T₁ ∩ T₂| ≥ 2t − n = 1</M>
          <Note style={{ marginTop: 8 }}>
            <M>1 ≤ f</M>: the shared member may be the faulty one.
          </Note>
        </Fade>
      </At>
      <At x={120} y={838} w={1220}>
        <Fade show={s >= 4}>
          <Note>
            <Code>validate_bft_safety</Code>: <M>t ≥ f + 1</M> and <M>c ≥ n − f</M>. <Code>ThresholdParams</Code>:{' '}
            <M>t ≤ c ≤ n</M>. Signers act only on finalized entries.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          <M>n</M> = 5 tolerates <M>f</M> = 1 faulty member. The consensus threshold is <M>c</M> = 4.
        </StepItem>
        <StepItem n={2} step={s}>
          Two sets of <M>c</M> members share at least 3, so an honest one. Two conflicting orders cannot both finalize.
        </StepItem>
        <StepItem n={3} step={s}>
          Two sets of <M>t</M> = 3 signers may share only m3, possibly the faulty member. Signers alone cannot exclude a
          second output set.
        </StepItem>
        <StepItem n={4} step={s}>
          So <M>t</M> members sign only what <M>c</M> members finalized.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VC_GX = [580, 960, 1340];

const VC_EnvChip = ({ cx, outs, color }: { cx: number; outs: string; color: string }) => (
  <div
    style={{
      position: 'absolute',
      left: cx - 100,
      top: 272,
      width: 200,
      height: 56,
      boxSizing: 'border-box',
      border: `1.75px solid ${color}`,
      background: c.card,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 24,
      color,
    }}
  >
    [{outs}]
  </div>
);

const VC_ConGraphical: Page = () => {
  const proc = useProcess(4, 1800);
  const s = proc.step;
  const [x1, x2, x3] = VC_GX;
  const v1 = s >= 3 ? 'ok' : undefined;
  const v2 = s >= 3 ? 'bad' : undefined;
  return (
    <VarShell of={VC_OF_CON} lens="Graphical" title="One order, replicated" proc={proc}>
      <Canvas>
        <Arrow x1={880} y1={330} x2={930} y2={396} show={s >= 1} color={c.clayHex} />
        <Arrow x1={1040} y1={330} x2={990} y2={396} show={s >= 1} color={c.violet} />
        <Packet x1={880} y1={330} x2={930} y2={396} run={proc.anim && s === 1} color={c.clayHex} />
        <Packet x1={1040} y1={330} x2={990} y2={396} run={proc.anim && s === 1} color={c.violet} delay={80} />
        <Draw x1={960} y1={492} x2={x1} y2={534} show={s >= 2} color={c.node} width={2} />
        <Draw x1={960} y1={492} x2={x2} y2={534} show={s >= 2} color={c.node} width={2} />
        <Draw x1={960} y1={492} x2={x3} y2={534} show={s >= 2} color={c.node} width={2} />
        <Member x={x1} y={562} r={26} label="m1" tone={s >= 4 ? 'on' : 'idle'} />
        <Member x={x2} y={562} r={26} label="m2" tone={s >= 4 ? 'on' : 'idle'} />
        <Member x={x3} y={562} r={26} label="m3" tone={s >= 4 ? 'on' : 'idle'} />
        <Draw x1={x1} y1={740} x2={936} y2={840} show={s >= 4} color={c.clayHex} width={2} />
        <Draw x1={x2} y1={740} x2={x2} y2={832} show={s >= 4} color={c.clayHex} width={2} />
        <Draw x1={x3} y1={740} x2={984} y2={840} show={s >= 4} color={c.clayHex} width={2} />
        <Packet x1={x1} y1={740} x2={936} y2={840} run={proc.anim && s === 4} color={c.clayHex} delay={400} />
        <Packet x1={x2} y1={740} x2={x2} y2={832} run={proc.anim && s === 4} color={c.clayHex} delay={460} />
        <Packet x1={x3} y1={740} x2={984} y2={840} run={proc.anim && s === 4} color={c.clayHex} delay={520} />
        <WalletNode x={960} y={884} r={46} />
        <T x={1030} y={878} size={24} anchor="start" color={c.good} show={s >= 4} delay={800}>
          A, B: 3 shares each
        </T>
        <T x={1030} y={912} size={24} anchor="start" color={c.bad} show={s >= 4} delay={900}>
          C: none
        </T>
      </Canvas>
      <VC_EnvChip cx={840} outs="A, B" color={c.clayHex} />
      <VC_EnvChip cx={1080} outs="B, C" color={c.violet} />
      <VC_Box
        x={780}
        y={400}
        w={360}
        h={92}
        tone={s >= 1 ? c.node : c.rule}
        fill={c.panel}
        pad="0"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontFamily: SERIF, fontSize: 34 }}>AlephBFT</span>
      </VC_Box>
      <VC_LogCell x={x1} y={604} n="#41" outs="A, B" color={c.clayHex} verdict={v1} show={s >= 2} />
      <VC_LogCell x={x2} y={604} n="#41" outs="A, B" color={c.clayHex} verdict={v1} show={s >= 2} delay={60} />
      <VC_LogCell x={x3} y={604} n="#41" outs="A, B" color={c.clayHex} verdict={v1} show={s >= 2} delay={120} />
      <VC_LogCell x={x1} y={672} n="#42" outs="B, C" color={c.violet} verdict={v2} show={s >= 2} delay={180} />
      <VC_LogCell x={x2} y={672} n="#42" outs="B, C" color={c.violet} verdict={v2} show={s >= 2} delay={240} />
      <VC_LogCell x={x3} y={672} n="#42" outs="B, C" color={c.violet} verdict={v2} show={s >= 2} delay={300} />
    </VarShell>
  );
};

// ─── Explained via state machine ─────────────────────────────────────────────

const VC_ConState: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_CON} lens="Explained via state machine" title="Lifecycle of one operation" proc={proc}>
      <Canvas>
        <Arrow x1={362} y1={330} x2={424} y2={330} show={s >= 1} color={c.node} />
        <Arrow x1={808} y1={296} x2={696} y2={318} show={s >= 1} color={c.cool} dashed delay={200} />
        <Arrow x1={808} y1={374} x2={696} y2={344} show={s >= 1} color={c.bad} dashed delay={300} />
        <Arrow x1={560} y1={364} x2={560} y2={484} show={s >= 2} color={c.node} />
        <Arrow x1={692} y1={520} x2={786} y2={520} show={s >= 2} color={c.good} delay={200} />
        <Arrow x1={480} y1={554} x2={400} y2={604} show={s >= 2} color={c.bad} delay={300} />
        <Arrow x1={900} y1={554} x2={900} y2={654} show={s >= 3} color={c.node} />
        <Arrow x1={846} y1={724} x2={640} y2={814} show={s >= 3} color={c.good} delay={200} />
        <Arrow x1={900} y1={724} x2={900} y2={814} show={s >= 4} color={c.bad} />
        <Arrow x1={954} y1={724} x2={1160} y2={814} show={s >= 4} color={c.bad} delay={100} />
      </Canvas>
      <VC_Node x={250} y={330} w={220} title="submitted" show={s >= 1} />
      <VC_Node x={560} y={330} w={260} h={68} title="pending" sub="in the mempool" show={s >= 1} delay={100} />
      <VC_Node x={1020} y={290} w={420} h={64} title="resubmission, same operation_id" sub="joins the pending entry" tone={c.cool} dashed show={s >= 1} delay={250} />
      <VC_Node x={1020} y={378} w={420} h={64} title="other operation, same key" sub="refused: ConflictingOperation" tone={c.bad} dashed show={s >= 1} delay={350} />
      <VC_Node x={560} y={520} w={260} h={68} title="finalized" sub="at index i" tone={c.violet} show={s >= 2} />
      <VC_Node x={900} y={520} w={220} title="Accepted" tone={c.good} show={s >= 2} delay={200} />
      <VC_Node x={290} y={640} w={340} h={68} title="Rejected" sub="conflicts with an earlier entry" tone={c.bad} show={s >= 2} delay={300} />
      <VC_Node x={900} y={690} w={220} title="Applying" show={s >= 3} />
      <VC_Node
        x={520}
        y={850}
        w={420}
        h={70}
        title="Applied"
        sub="state and shares in one transaction"
        tone={c.good}
        fill={c.goodSoft}
        show={s >= 3}
        delay={200}
      />
      <VC_Node x={900} y={850} w={300} h={70} title="Rejected" sub="error response stored" tone={c.bad} show={s >= 4} delay={100} />
      <VC_Node x={1210} y={850} w={240} h={70} title="Failed" sub="retried on replay" tone={c.bad} dashed show={s >= 4} delay={200} />
      <StepList>
        <StepItem n={1} step={s}>
          Submissions wait in the mempool. The same <Code>operation_id</Code> joins; a held conflict key refuses the
          other operation.
        </StepItem>
        <StepItem n={2} step={s}>
          AlephBFT finalizes the entry at an index. A non-mint entry whose key is already taken is stored as Rejected.
        </StepItem>
        <StepItem n={3} step={s}>
          Accepted entries are applied. Success commits state, shares and Applied together.
        </StepItem>
        <StepItem n={4} step={s}>
          Definitive errors such as <Code>TokenAlreadySpent</Code> end Rejected; other errors end Failed and are
          retried on replay.
        </StepItem>
        <Note style={{ marginTop: 20, fontSize: 22 }}>
          Shares are produced only inside apply, never for Rejected entries.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: Byzantine member ───────────────────────────────────────────

const VC_Item = ({ ok, children }: { ok: boolean; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 14, fontSize: 24, lineHeight: 1.4, marginBottom: 18 }}>
    <span style={{ fontFamily: MONO, color: ok ? c.good : c.bad, paddingTop: 1 }}>–</span>
    <span>{children}</span>
  </div>
);

const VC_ConByzantine: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_CON} lens="Perspective: Byzantine member" title="What one faulty member can and cannot do" proc={proc}>
      <Canvas>
        <Member x={200} y={320} r={34} label="m1" />
        <Member x={320} y={320} r={34} label="m2" />
        <Member x={440} y={320} r={34} label="m3" />
        <Member x={560} y={320} r={34} label="m4" />
        <Member x={680} y={320} r={34} label="m5" tone={s >= 1 ? 'bad' : 'idle'} />
      </Canvas>
      <At x={780} y={296} w={1000}>
        <Fade show={s >= 1}>
          <M size={30}>n = 5,&nbsp; f = 1,&nbsp; c = 4,&nbsp; t = 3</M>
          <span style={{ fontSize: 24, color: c.bad, marginLeft: 28 }}>m5 is faulty</span>
        </Fade>
      </At>
      <At x={120} y={410} w={800}>
        <Fade show={s >= 2}>
          <VC_Lab color={c.good} style={{ marginBottom: 14 }}>
            <VC_NoCase>m5</VC_NoCase> cannot
          </VC_Lab>
          <VC_Item ok>
            Complete a signature alone: <M>t ≥ f + 1</M>, so at least one share must come from an honest member.
          </VC_Item>
          <VC_Item ok>
            Make honest members sign outputs that were not finalized: they sign only the exact outputs of an ordered
            entry.
          </VC_Item>
          <VC_Item ok>
            Finalize two conflicting operations: any two sets of <M>c</M> members share an honest one.
          </VC_Item>
          <VC_Item ok>
            Feed a lagging member a false history: catch-up needs a certificate quorum of <M>c</M> and matching order
            and state digests.
          </VC_Item>
        </Fade>
      </At>
      <At x={990} y={410} w={810}>
        <Fade show={s >= 3}>
          <VC_Lab color={c.bad} style={{ marginBottom: 14 }}>
            <VC_NoCase>m5</VC_NoCase> can
          </VC_Lab>
          <VC_Item ok={false}>
            Withhold its shares and votes. The other four still reach <M>t</M> = 3 and <M>c</M> = 4.
          </VC_Item>
          <VC_Item ok={false}>
            Submit a swap with rewritten outputs for proofs it has seen, unless a witness in the proofs commits to the
            outputs (Client intent).
          </VC_Item>
          <VC_Item ok={false}>
            Get an operation with an invalid proof ordered first. It fails at apply and locks nothing: proof{' '}
            <M>Y</M>s are deliberately not conflict keys.
          </VC_Item>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Framing: order of the two steps ─────────────────────────────────────────

const VC_Ev = ({
  x,
  y,
  label,
  show,
  color = c.ink,
  delay = 0,
}: {
  x: number;
  y: number;
  label: ReactNode;
  show: boolean;
  color?: string;
  delay?: number;
}) => (
  <g>
    <Dot x={x} y={y} r={8} color={color} show={show} delay={delay} />
    <T x={x} y={y - 26} size={22} color={color} show={show} delay={delay}>
      {label}
    </T>
  </g>
);

const VC_ShareDots = ({ x, y, show, delay = 0 }: { x: number; y: number; show: boolean; delay?: number }) => (
  <g>
    <Dot x={x - 9} y={y} r={6} color={c.clayHex} show={show} delay={delay + 200} />
    <Dot x={x + 9} y={y} r={6} color={c.clayHex} show={show} delay={delay + 260} />
    <T x={x} y={y + 36} size={21} color={c.clayHex} show={show} delay={delay + 300}>
      shares
    </T>
  </g>
);

const VC_ConSignOrder: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_CON} lens="Framing: order of the two steps" title="Sign, then order versus order, then sign" proc={proc}>
      <At x={120} y={256}>
        <VC_Lab color={c.bad}>Sign on receipt</VC_Lab>
      </At>
      <At x={560} y={252}>
        <Note>
          <M>n</M> = 3, <M>t</M> = 2, one quote paid for two outputs
        </Note>
      </At>
      <At x={120} y={580}>
        <VC_Lab color={c.good}>Order, then sign</VC_Lab>
      </At>
      <Canvas>
        <Arrow x1={140} y1={430} x2={1320} y2={430} color={c.line} />
        <VC_Ev x={260} y={430} label="[A, B] at m1" show={s >= 1} />
        <VC_ShareDots x={260} y={466} show={s >= 1} />
        <VC_Ev x={520} y={430} label="[B, C] at m2" show={s >= 1} delay={250} />
        <VC_ShareDots x={520} y={466} show={s >= 1} delay={250} />
        <VC_Ev x={780} y={430} label="[C, A] at m3" show={s >= 1} delay={500} />
        <VC_ShareDots x={780} y={466} show={s >= 1} delay={500} />
        <VC_Ev x={1100} y={430} label="ordering finds the conflict" show={s >= 2} color={c.bad} />
        <T x={1100} y={476} size={22} color={c.bad} show={s >= 2} delay={300}>
          C is already signed
        </T>

        <Arrow x1={140} y1={740} x2={1320} y2={740} color={c.line} />
        <VC_Ev x={240} y={740} label="[A, B] in" show={s >= 3} />
        <VC_Ev x={440} y={740} label="[B, C] in" show={s >= 3} delay={200} />
        <VC_Ev x={680} y={740} label="#41, #42 finalized" show={s >= 3} color={c.violet} delay={450} />
        <VC_Ev x={940} y={740} label="#41: A, B" show={s >= 4} color={c.good} />
        <VC_ShareDots x={940} y={776} show={s >= 4} />
        <VC_Ev x={1180} y={740} label="#42: rejected" show={s >= 4} color={c.bad} delay={300} />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Signing on receipt: each member returns shares for the request it sees, at once.
        </StepItem>
        <StepItem n={2} step={s}>
          Ordering afterwards can detect the conflict, but the shares for C are already with the wallet. A share
          cannot be withdrawn.
        </StepItem>
        <StepItem n={3} step={s}>
          Ordering first: both requests become envelopes and consensus fixes #41 before #42.
        </StepItem>
        <StepItem n={4} step={s}>
          Shares exist only for #41. The conflict is settled before any signature exists.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Focus: conflict keys ────────────────────────────────────────────────────

const VC_CKW = [320, 560, 800];

const VC_CkRow = ({ show, kind, keyText, effect, hot }: { show: boolean; kind: string; keyText: ReactNode; effect: ReactNode; hot?: boolean }) => (
  <VC_TRow show={show} h={54} tint={hot ? c.claySoft : undefined}>
    <VC_TCell w={VC_CKW[0]} mono size={22}>
      {kind}
    </VC_TCell>
    <VC_TCell w={VC_CKW[1]}>{keyText}</VC_TCell>
    <VC_TCell w={VC_CKW[2]} color={c.muted}>
      {effect}
    </VC_TCell>
  </VC_TRow>
);

const VC_Stage = ({ x, title, show, tone, children }: { x: number; title: string; show: boolean; tone: string; children: ReactNode }) => (
  <VC_Box x={x} y={768} w={540} h={180} show={show} tone={tone} pad="12px 20px">
    <VC_Lab color={tone}>{title}</VC_Lab>
    <div style={{ fontSize: 24, lineHeight: 1.4, marginTop: 6 }}>{children}</div>
  </VC_Box>
);

const VC_ConKeys: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_CON} lens="Focus: conflict keys" title="Conflict keys by operation kind" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VC_TRow head h={46}>
          <VC_TCell w={VC_CKW[0]} head>
            Cashu operation
          </VC_TCell>
          <VC_TCell w={VC_CKW[1]} head>
            Conflict key
          </VC_TCell>
          <VC_TCell w={VC_CKW[2]} head>
            Effect
          </VC_TCell>
        </VC_TRow>
        <VC_CkRow show={s >= 1} kind="MintQuote" keyText="quote id" effect="one request and response per quote" />
        <VC_CkRow
          show={s >= 1}
          kind="MintQuotePayment"
          keyText="quote, observer, and state or payment id"
          effect="one observation per member and state"
        />
        <VC_CkRow show={s >= 1} kind="Mint" keyText="every quote id in the request" effect="one output set per quote" hot={s === 1} />
        <VC_CkRow show={s >= 2} kind="MeltQuote" keyText="quote id" effect="one quote definition" />
        <VC_CkRow show={s >= 2} kind="MeltQuotePayment" keyText="quote, state, observer" effect="one observation per member and state" />
        <VC_CkRow show={s >= 2} kind="Melt" keyText="quote id" effect="one melt per quote" />
        <VC_CkRow show={s >= 2} kind="KeysetRotation" keyText="keyset id" effect="one rotation per keyset id" />
        <VC_CkRow show={s >= 3} kind="Swap" keyText="none" effect="spend lock: proof state at apply" hot={s === 3} />
      </At>
      <VC_Stage x={120} title="Mempool" show={s >= 4} tone={c.cool}>
        A pending operation holds its keys. Another operation with one of them: <Code>ConflictingOperation</Code>.
      </VC_Stage>
      <VC_Stage x={690} title="Finalization" show={s >= 4} tone={c.violet}>
        A non-mint entry whose key is already held is stored as Rejected. Mint: checked at apply.
      </VC_Stage>
      <VC_Stage x={1260} title="Apply" show={s >= 4} tone={c.clayHex}>
        Swaps: spent inputs give <Code>TokenAlreadySpent</Code>; the entry ends Rejected.
      </VC_Stage>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 4 · Federated swap
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VC_SB_M = [320, 520, 720];

const VC_SpentTag = ({ y, show }: { y: number; show: boolean }) => (
  <At x={706} y={y + 46}>
    <Fade show={show}>
      <span style={{ fontSize: 21, color: c.bad }}>P1, P2 spent</span>
    </Fade>
  </At>
);

const VC_SwapBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const w = { x: 260, y: 400 };
  const [y1, y2, y3] = VC_SB_M;
  return (
    <VarShell of={VC_OF_SWAP} lens="Beginner" title="One swap from start to finish" proc={proc}>
      <Canvas>
        <Line x1={w.x + 56} y1={w.y} x2={720} y2={y1} color={s >= 2 ? c.cool : c.rule} opacity={s >= 2 ? 0.7 : 1} />
        <Line x1={w.x + 56} y1={w.y} x2={720} y2={y2} color={s >= 2 ? c.cool : c.rule} opacity={s >= 2 ? 0.7 : 1} />
        <Line x1={w.x + 56} y1={w.y} x2={720} y2={y3} color={s >= 2 ? c.cool : c.rule} opacity={s >= 2 ? 0.7 : 1} />
        <Packet x1={w.x + 56} y1={w.y} x2={720} y2={y1} run={proc.anim && s === 2} />
        <Packet x1={w.x + 56} y1={w.y} x2={720} y2={y2} run={proc.anim && s === 2} delay={50} />
        <Packet x1={w.x + 56} y1={w.y} x2={720} y2={y3} run={proc.anim && s === 2} delay={100} />
        <Draw x1={800} y1={y1} x2={1030} y2={500} show={s >= 3} color={c.violet} width={2} />
        <Draw x1={800} y1={y2} x2={1030} y2={520} show={s >= 3} color={c.violet} width={2} delay={60} />
        <Draw x1={800} y1={y3} x2={1030} y2={540} show={s >= 3} color={c.violet} width={2} delay={120} />
        <Packet x1={720} y1={y1} x2={w.x + 56} y2={w.y} run={proc.anim && s === 4} color={c.clayHex} delay={500} />
        <Packet x1={720} y1={y2} x2={w.x + 56} y2={w.y} run={proc.anim && s === 4} color={c.clayHex} delay={560} />
        <Packet x1={720} y1={y3} x2={w.x + 56} y2={w.y} run={proc.anim && s === 4} color={c.clayHex} delay={620} />
        <WalletNode x={w.x} y={w.y} r={56} />
        <Member x={760} y={y1} r={40} label="m1" tone={s >= 4 ? 'on' : 'idle'} />
        <Member x={760} y={y2} r={40} label="m2" tone={s >= 4 ? 'on' : 'idle'} />
        <Member x={760} y={y3} r={40} label="m3" tone={s >= 4 ? 'on' : 'idle'} />
      </Canvas>
      <VC_SpentTag y={y1} show={s >= 4} />
      <VC_SpentTag y={y2} show={s >= 4} />
      <VC_SpentTag y={y3} show={s >= 4} />
      <VC_Box x={1030} y={462} w={300} h={116} show={s >= 3} tone={c.violet} fill={c.panel} pad="14px 20px">
        <div style={{ fontSize: 24 }}>consensus</div>
        <div style={{ fontSize: 22, color: c.muted, marginTop: 4 }}>first to spend P1, P2</div>
      </VC_Box>
      <At x={120} y={530} w={560}>
        <VC_Lab>held proofs</VC_Lab>
        <div style={{ marginTop: 10 }}>
          <VC_Chip tone={c.cool} struck={s >= 4}>
            P1 = 4
          </VC_Chip>
          <VC_Chip tone={c.cool} struck={s >= 4}>
            P2 = 1
          </VC_Chip>
        </div>
      </At>
      <At x={120} y={650} w={560}>
        <Fade show={s >= 1}>
          <VC_Lab>blinded outputs</VC_Lab>
          <div style={{ marginTop: 10 }}>
            <VC_Chip tone={c.cool} dashed>
              A = 2
            </VC_Chip>
            <VC_Chip tone={c.cool} dashed>
              B = 2
            </VC_Chip>
            <VC_Chip tone={c.cool} dashed>
              C = 1
            </VC_Chip>
          </div>
        </Fade>
      </At>
      <At x={120} y={770} w={560}>
        <Fade show={s >= 5}>
          <VC_Lab color={c.good}>new proofs</VC_Lab>
          <div style={{ marginTop: 10 }}>
            <VC_Chip tone={c.good} fill={c.goodSoft}>
              A = 2
            </VC_Chip>
            <VC_Chip tone={c.good} fill={c.goodSoft}>
              B = 2
            </VC_Chip>
            <VC_Chip tone={c.good} fill={c.goodSoft}>
              C = 1
            </VC_Chip>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet holds P1 (4) and P2 (1). It blinds A (2), B (2), C (1): 5 in, 5 out, no fee here.
        </StepItem>
        <StepItem n={2} step={s}>
          It sends the same swap request to m1, m2 and m3.
        </StepItem>
        <StepItem n={3} step={s}>
          The members order it through consensus: the first swap that spends P1 and P2.
        </StepItem>
        <StepItem n={4} step={s}>
          Each member marks P1, P2 spent and returns its shares for A, B, C.
        </StepItem>
        <StepItem n={5} step={s}>
          With <M>t</M> = 2 shares per output the wallet builds each signature and unblinds: three new proofs.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VC_AW = [480, 360, 840];

const VC_ApplyRow = ({ show, state, sigs, ok, children, h = 52 }: { show: boolean; state: string; sigs: string; ok: boolean; h?: number; children: ReactNode }) => (
  <VC_TRow show={show} h={h}>
    <VC_TCell w={VC_AW[0]} mono size={22}>
      {state}
    </VC_TCell>
    <VC_TCell w={VC_AW[1]}>{sigs}</VC_TCell>
    <VC_TCell w={VC_AW[2]}>
      <VC_Mark ok={ok} />
      {children}
    </VC_TCell>
  </VC_TRow>
);

const VC_SwapAdvanced: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_SWAP} lens="Advanced" title="Applying an accepted swap" proc={proc}>
      <At x={120} y={256} w={1680}>
        <Fade show={s >= 1}>
          <VC_Lab>Before the database transaction</VC_Lab>
          <div style={{ fontSize: 24, marginTop: 8 }}>
            inputs non-empty · inputs verify against the aggregate v3 keys · spending conditions · outputs on v3 keysets
            · balanced including fees
          </div>
        </Fade>
      </At>
      <At x={120} y={346} w={1680}>
        <Fade show={s >= 2}>
          <VC_Lab style={{ marginBottom: 6 }}>Inside one transaction, by input state and existing output signatures</VC_Lab>
        </Fade>
        <VC_TRow head h={46} show={s >= 2}>
          <VC_TCell w={VC_AW[0]} head>
            Input proofs
          </VC_TCell>
          <VC_TCell w={VC_AW[1]} head>
            Output signatures
          </VC_TCell>
          <VC_TCell w={VC_AW[2]} head>
            Result
          </VC_TCell>
        </VC_TRow>
        <VC_ApplyRow show={s >= 2} state="Unspent" sigs="none" ok h={70}>
          mark inputs Spent, sign the outputs, store share rows, blinded messages, signatures and the completed operation
        </VC_ApplyRow>
        <VC_ApplyRow show={s >= 2} state="Unspent" sigs="all present" ok={false}>
          <Code>BlindedMessageAlreadySigned</Code>
        </VC_ApplyRow>
        <VC_ApplyRow show={s >= 2} state="Unspent" sigs="some present" ok={false}>
          error: partially persisted signatures
        </VC_ApplyRow>
        <VC_ApplyRow show={s >= 2} state="Spent" sigs="all present, completed swap of this operation" ok h={70}>
          replay: re-derive this member's shares and store the share rows again
        </VC_ApplyRow>
        <VC_ApplyRow show={s >= 2} state="Spent" sigs="otherwise" ok={false}>
          <Code>TokenAlreadySpent</Code>
        </VC_ApplyRow>
        <VC_ApplyRow show={s >= 2} state="Pending, Reserved, PendingSpent" sigs="any" ok={false}>
          <Code>TokenPending</Code>
        </VC_ApplyRow>
      </At>
      <At x={120} y={822} w={1680}>
        <Fade show={s >= 3}>
          <Note style={{ fontSize: 23, color: c.ink }}>
            Success writes Applied in the same transaction; an error rolls everything back. <Code>TokenAlreadySpent</Code>{' '}
            and <Code>TokenPending</Code> are definitive: the entry ends Rejected with the error response stored.
          </Note>
          <Note style={{ fontSize: 23, color: c.ink, marginTop: 6 }}>
            The public route answers from storage only: per output index it reads the share row matching member,{' '}
            <M>B′</M>, keyset and amount.
          </Note>
          <div style={{ fontFamily: MONO, fontSize: 21, color: c.muted, marginTop: 6 }}>
            crates/cdk/src/mint/federation/application.rs · apply_federation_swap
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VC_SG_M = [360, 600, 840];
const VC_SG_BOX = { x: 1300, y: 600 };

const VC_ApplyChips = ({ y, show }: { y: number; show: boolean }) => (
  <At x={756} y={y - 16}>
    <Fade show={show} delay={500}>
      <VC_Chip tone={c.bad} size={21} struck>
        P1
      </VC_Chip>
      <VC_Chip tone={c.bad} size={21} struck>
        P2
      </VC_Chip>
    </Fade>
  </At>
);

const VC_SwapGraphical: Page = () => {
  const proc = useProcess(5, 1700);
  const s = proc.step;
  const w = { x: 260, y: 600 };
  const [y1, y2, y3] = VC_SG_M;
  const bx = VC_SG_BOX.x - 140;
  return (
    <VarShell of={VC_OF_SWAP} lens="Graphical" title="Swap as data flow" proc={proc}>
      <Canvas>
        <Line x1={w.x + 60} y1={w.y} x2={776} y2={y1} color={c.cool} opacity={s >= 1 ? 0.6 : 0.15} />
        <Line x1={w.x + 60} y1={w.y} x2={776} y2={y2} color={c.cool} opacity={s >= 1 ? 0.6 : 0.15} />
        <Line x1={w.x + 60} y1={w.y} x2={776} y2={y3} color={c.cool} opacity={s >= 1 ? 0.6 : 0.15} />
        <Packet x1={w.x + 60} y1={w.y} x2={776} y2={y1} run={proc.anim && s === 1} />
        <Packet x1={w.x + 60} y1={w.y} x2={776} y2={y2} run={proc.anim && s === 1} delay={50} />
        <Packet x1={w.x + 60} y1={w.y} x2={776} y2={y3} run={proc.anim && s === 1} delay={100} />

        <Line x1={864} y1={y1} x2={bx} y2={580} color={c.violet} opacity={s >= 2 ? 0.6 : 0.12} />
        <Line x1={864} y1={y2} x2={bx} y2={600} color={c.violet} opacity={s >= 2 ? 0.6 : 0.12} />
        <Line x1={864} y1={y3} x2={bx} y2={620} color={c.violet} opacity={s >= 2 ? 0.6 : 0.12} />
        <Packet x1={864} y1={y1} x2={bx} y2={580} run={proc.anim && s === 2} color={c.violet} />
        <Packet x1={864} y1={y2} x2={bx} y2={600} run={proc.anim && s === 2} color={c.violet} delay={60} />
        <Packet x1={864} y1={y3} x2={bx} y2={620} run={proc.anim && s === 2} color={c.violet} delay={120} />
        <Packet x1={bx} y1={580} x2={864} y2={y1} run={proc.anim && s === 3} color={c.violet} />
        <Packet x1={bx} y1={600} x2={864} y2={y2} run={proc.anim && s === 3} color={c.violet} delay={60} />
        <Packet x1={bx} y1={620} x2={864} y2={y3} run={proc.anim && s === 3} color={c.violet} delay={120} />

        <Line x1={776} y1={y1 + 10} x2={w.x + 60} y2={w.y + 10} color={c.clayHex} opacity={s >= 4 ? 0.7 : 0} />
        <Line x1={776} y1={y2 + 10} x2={w.x + 60} y2={w.y + 10} color={c.clayHex} opacity={s >= 4 ? 0.7 : 0} />
        <Line x1={776} y1={y3 + 10} x2={w.x + 60} y2={w.y + 10} color={c.clayHex} opacity={s >= 4 ? 0.7 : 0} />
        <Packet x1={776} y1={y1 + 10} x2={w.x + 60} y2={w.y + 10} run={proc.anim && s === 4} color={c.clayHex} />
        <Packet x1={776} y1={y2 + 10} x2={w.x + 60} y2={w.y + 10} run={proc.anim && s === 4} color={c.clayHex} delay={60} />
        <Packet x1={776} y1={y3 + 10} x2={w.x + 60} y2={w.y + 10} run={proc.anim && s === 4} color={c.clayHex} delay={120} />

        <WalletNode x={w.x} y={w.y} r={60} />
        <Member x={820} y={y1} r={44} label="m1" tone={s >= 3 ? 'on' : 'idle'} />
        <Member x={820} y={y2} r={44} label="m2" tone={s >= 3 ? 'on' : 'idle'} />
        <Member x={820} y={y3} r={44} label="m3" tone={s >= 3 ? 'on' : 'idle'} />
      </Canvas>
      <VC_Box
        x={bx}
        y={VC_SG_BOX.y - 60}
        w={280}
        h={120}
        tone={s >= 2 ? c.violet : c.rule}
        fill={c.panel}
        pad="0"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontFamily: SERIF, fontSize: 32 }}>AlephBFT</span>
        <span style={{ fontFamily: MONO, fontSize: 24, color: c.violet, opacity: s >= 2 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>
          #41
        </span>
      </VC_Box>
      <VC_ApplyChips y={y1 + 70} show={s >= 3} />
      <VC_ApplyChips y={y2 + 70} show={s >= 3} />
      <VC_ApplyChips y={y3 + 70} show={s >= 3} />
      <At x={150} y={430} w={300} style={{ textAlign: 'center' }}>
        <VC_Chip tone={c.cool} struck={s >= 3}>
          P1
        </VC_Chip>
        <VC_Chip tone={c.cool} struck={s >= 3}>
          P2
        </VC_Chip>
      </At>
      <At x={150} y={700} w={300} style={{ textAlign: 'center' }}>
        <VC_Chip tone={s >= 5 ? c.good : c.cool} fill={s >= 5 ? c.goodSoft : c.card} dashed={s < 5}>
          A
        </VC_Chip>
        <VC_Chip tone={s >= 5 ? c.good : c.cool} fill={s >= 5 ? c.goodSoft : c.card} dashed={s < 5}>
          B
        </VC_Chip>
      </At>
      <At x={120} y={790} w={400} style={{ textAlign: 'center' }}>
        <Fade show={s >= 5}>
          <M size={30}>C = r⁻¹·Σ λᵢ·C′ᵢ</M>
          <div style={{ fontSize: 22, color: c.muted, marginTop: 6 }}>
            <M>t</M> = 2 of 3
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Explained via sequence diagram ──────────────────────────────────────────

const VC_SQ = { w: 200, m1: 440, m2: 640, m3: 840, m4: 1060 };

const VC_SwapSequence: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  const { w, m1, m2, m3, m4 } = VC_SQ;
  return (
    <VarShell of={VC_OF_SWAP} lens="Explained via sequence diagram" title="Federated swap as a sequence" proc={proc}>
      <Canvas>
        <Lifeline x={w} label="wallet" top={290} bottom={910} color={c.cool} />
        <Lifeline x={m1} label="m1" top={290} bottom={910} />
        <Lifeline x={m2} label="m2" top={290} bottom={910} />
        <Lifeline x={m3} label="m3" top={290} bottom={910} />
        <Lifeline x={m4} label="m4" top={290} bottom={910} color={s >= 2 ? c.bad : c.ink} />

        <Arrow x1={w} y1={332} x2={m4 - 6} y2={332} show={s >= 1} color={c.cool} />
        <Packet x1={w} y1={332} x2={m4} y2={332} run={proc.anim && s === 1} />
        <Dot x={m1} y={332} r={7} color={c.cool} show={s >= 1} delay={300} />
        <Dot x={m2} y={332} r={7} color={c.cool} show={s >= 1} delay={380} />
        <Dot x={m3} y={332} r={7} color={c.cool} show={s >= 1} delay={460} />
        <T x={w + 20} y={320} size={21} anchor="start" font="mono" color={c.cool} show={s >= 1}>
          POST /v1/swap, same body
        </T>

        <T x={m1 + 14} y={404} size={24} anchor="start" font="mono" color={c.good} show={s >= 2}>
          ✓
        </T>
        <T x={m2 + 14} y={404} size={24} anchor="start" font="mono" color={c.good} show={s >= 2} delay={60}>
          ✓
        </T>
        <T x={m3 + 14} y={404} size={24} anchor="start" font="mono" color={c.good} show={s >= 2} delay={120}>
          ✓
        </T>
        <T x={m4 + 14} y={404} size={21} anchor="start" color={c.bad} show={s >= 2} delay={180}>
          lagging
        </T>

        <Band x1={m1 - 40} x2={m3 + 40} y={470} label="AlephBFT: finalized as #41" show={s >= 3} />
        <Band x1={m1 - 40} x2={m3 + 40} y={548} label="apply: P1, P2 spent, shares stored" show={s >= 4} tone="clay" />

        <Arrow x1={m4} y1={622} x2={w + 6} y2={622} show={s >= 4} color={c.bad} dashed delay={300} />
        <T x={m4 - 18} y={610} size={21} anchor="end" color={c.bad} show={s >= 4} delay={300}>
          NodeLagging, no shares
        </T>

        <Arrow x1={m3} y1={694} x2={w + 6} y2={694} show={s >= 5} color={c.clayHex} />
        <Packet x1={m3} y1={694} x2={w} y2={694} run={proc.anim && s === 5} color={c.clayHex} delay={200} />
        <Dot x={m1} y={694} r={7} color={c.clayHex} show={s >= 5} delay={300} />
        <Dot x={m2} y={694} r={7} color={c.clayHex} show={s >= 5} delay={380} />
        <T x={w + 20} y={682} size={21} anchor="start" color={c.clayHex} show={s >= 5}>
          shares for A, B
        </T>
        <Band x1={120} x2={700} y={772} label="wallet: check each share against Kᵢ, interpolate, unblind" show={s >= 5} tone="cool" />

        <Band x1={m4 - 110} x2={m4 + 110} y={856} label="replay #41" show={s >= 6} tone="clay" />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          <M>n</M> = 4, <M>t</M> = 3, <M>c</M> = 3. The wallet sends the same swap to all four members.
        </StepItem>
        <StepItem n={2} step={s}>
          m1–m3 pass admission and submit the envelope. m4 is behind the log and fails closed.
        </StepItem>
        <StepItem n={3} step={s}>
          Three members finalize the swap as #41: enough for <M>c</M> = 3.
        </StepItem>
        <StepItem n={4} step={s}>
          Each applying member spends P1, P2 and stores its shares for A, B. m4 returns nothing.
        </StepItem>
        <StepItem n={5} step={s}>
          The wallet checks three shares per output against <M>Kᵢ</M>, interpolates and unblinds.
        </StepItem>
        <StepItem n={6} step={s}>
          Later m4 replays #41 from the journal and holds the same state and its own shares.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: lagging member ─────────────────────────────────────────────

const VC_Phase = ({ x1, x2, label, fill, tone, show, dashed }: { x1: number; x2: number; label: string; fill: string; tone: string; show: boolean; dashed?: boolean }) => (
  <div
    style={{
      position: 'absolute',
      left: x1,
      top: 330,
      width: x2 - x1 - 4,
      height: 46,
      boxSizing: 'border-box',
      border: `1.5px ${dashed ? 'dashed' : 'solid'} ${tone}`,
      background: fill,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 21,
      color: tone,
      opacity: show ? 1 : 0.25,
      transition: `opacity 400ms ${EASE_OUT}`,
    }}
  >
    {label}
  </div>
);

const VC_PhaseCard = ({ x, w, title, show, tone, children }: { x: number; w: number; title: string; show: boolean; tone: string; children: ReactNode }) => (
  <VC_Box x={x} y={416} w={w} h={196} show={show} tone={tone} pad="12px 20px">
    <VC_Lab color={tone}>{title}</VC_Lab>
    <div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 6 }}>{children}</div>
  </VC_Box>
);

const VC_SwapLagging: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_SWAP} lens="Perspective: lagging member" title="A lagging member during and after a swap" proc={proc}>
      <At x={150} y={256}>
        <VC_Lab>
          <VC_NoCase>m3</VC_NoCase> over time
        </VC_Lab>
      </At>
      <VC_Phase x1={150} x2={330} label="healthy" fill={c.goodSoft} tone={c.good} show />
      <VC_Phase x1={330} x2={600} label="offline" fill={c.panel} tone={c.node} show={s >= 1} dashed />
      <VC_Phase x1={600} x2={800} label="lagging" fill={c.badSoft} tone={c.bad} show={s >= 2} />
      <VC_Phase x1={800} x2={1030} label="catching_up" fill={c.claySoft} tone={c.clayHex} show={s >= 3} />
      <VC_Phase x1={1030} x2={1320} label="healthy" fill={c.goodSoft} tone={c.good} show={s >= 4} />
      <Canvas>
        <GFade show={s >= 1}>
          <line x1={465} y1={300} x2={465} y2={328} style={{ stroke: c.violet, strokeWidth: 2.5 }} />
        </GFade>
        <T x={480} y={306} size={21} anchor="start" color={c.violet} show={s >= 1}>
          #41 finalized without m3
        </T>
      </Canvas>
      <VC_PhaseCard x={150} w={430} title="restart" show={s >= 2} tone={c.bad}>
        Its operation count is below a peer's: lagging. Swap, mint and melt fail closed.
      </VC_PhaseCard>
      <VC_PhaseCard x={600} w={400} title="catch-up" show={s >= 3} tone={c.clayHex}>
        Journal entries from peers with a certificate quorum of <M>c</M>. Replay #41: P1, P2 spent, own shares stored.
      </VC_PhaseCard>
      <VC_PhaseCard x={1020} w={300} title="healthy" show={s >= 4} tone={c.good}>
        Order and state digests match its peers. Readiness gate passes.
      </VC_PhaseCard>
      <At x={150} y={650} w={1170}>
        <VC_TRow show={s >= 5} h={54}>
          <VC_TCell w={640}>
            retry of #41, <Code>P1, P2 → A, B</Code>
          </VC_TCell>
          <VC_TCell w={530} color={c.good}>
            <VC_Mark ok />
            its stored shares for #41
          </VC_TCell>
        </VC_TRow>
        <VC_TRow show={s >= 5} h={54} delay={120}>
          <VC_TCell w={640}>
            <Code>P1, P2 → X, Y</Code>
          </VC_TCell>
          <VC_TCell w={530} color={c.bad}>
            <VC_Mark ok={false} />
            <Code>TokenAlreadySpent</Code>
          </VC_TCell>
        </VC_TRow>
        <VC_TRow show={s >= 2} h={54}>
          <VC_TCell w={640}>any value request while not healthy</VC_TCell>
          <VC_TCell w={530} color={c.bad}>
            <VC_Mark ok={false} />
            fails closed, no shares
          </VC_TCell>
        </VC_TRow>
      </At>
      <At x={150} y={850} w={1170}>
        <Note style={{ fontSize: 24 }}>
          Sync status: <Code>healthy</Code>, <Code>awaiting_quorum</Code>, <Code>lagging</Code>,{' '}
          <Code>catching_up</Code>, <Code>halted</Code>. Only healthy is ready.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          m3 is offline while the others finalize swap #41, P1, P2 → A, B.
        </StepItem>
        <StepItem n={2} step={s}>
          After restart its operation count is below a peer's: lagging. Value routes fail closed.
        </StepItem>
        <StepItem n={3} step={s}>
          It fetches the missing entries with a certificate quorum and replays #41 deterministically.
        </StepItem>
        <StepItem n={4} step={s}>
          Its order and state digests match its peers: healthy again.
        </StepItem>
        <StepItem n={5} step={s}>
          It can serve the shares of #41. It cannot sign another output set for P1, P2.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: what each member stores ────────────────────────────────────────

const VC_Field = ({ name, children }: { name: string; children?: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1.45 }}>
    <span style={{ fontFamily: MONO, fontSize: 21, width: 330, flexShrink: 0 }}>{name}</span>
    {children && <span style={{ fontSize: 21, color: c.muted }}>{children}</span>}
  </div>
);

const VC_Line = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, fontSize: 22, lineHeight: 1.4, marginBottom: 6 }}>
    <span style={{ color: ACCENT, fontFamily: MONO }}>–</span>
    <span>{children}</span>
  </div>
);

const VC_SwapStores: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_SWAP} lens="Framing: what each member stores" title="State written by one accepted swap" proc={proc}>
      <VC_Box x={120} y={256} w={820} h={384} show={s >= 1} tone={c.violet} pad="14px 22px">
        <VC_Lab color={c.violet}>Journal entry</VC_Lab>
        <div style={{ fontFamily: MONO, fontSize: 21, color: c.violet, margin: '2px 0 8px' }}>FederationJournalEntry</div>
        <VC_Field name="index">order position</VC_Field>
        <VC_Field name="operation_id" />
        <VC_Field name="envelope">the exact swap request</VC_Field>
        <VC_Field name="conflict_keys">empty for a swap</VC_Field>
        <VC_Field name="previous_order_digest" />
        <VC_Field name="order_digest" />
        <VC_Field name="consensus_evidence" />
        <VC_Field name="application">Applied</VC_Field>
      </VC_Box>
      <VC_Box x={980} y={256} w={820} h={384} show={s >= 2} tone={c.clayHex} pad="14px 22px">
        <VC_Lab color={c.clayHex}>One share row per output</VC_Lab>
        <div style={{ fontFamily: MONO, fontSize: 21, color: c.clayHex, margin: '2px 0 8px' }}>
          FederationSignatureShareRecord
        </div>
        <VC_Field name="operation_id" />
        <VC_Field name="accepted_operation_index" />
        <VC_Field name="consensus_evidence" />
        <VC_Field name="output_index" />
        <VC_Field name="member_id">this member only</VC_Field>
        <VC_Field name="keyset_id" />
        <VC_Field name="amount" />
        <VC_Field name="blinded_secret">B′ of the output</VC_Field>
        <VC_Field name="share">
          <M>kᵢ·B′</M>
        </VC_Field>
      </VC_Box>
      <VC_Box x={120} y={664} w={820} h={290} show={s >= 3} pad="14px 22px">
        <VC_Lab style={{ marginBottom: 10 }}>Mint state, same transaction</VC_Lab>
        <VC_Line>P1, P2: proof state Spent</VC_Line>
        <VC_Line>A, B: blinded messages and blind signatures</VC_Line>
        <VC_Line>completed operation: kind Swap, amounts, fee</VC_Line>
        <VC_Line>application state Applied, committed with the rest</VC_Line>
      </VC_Box>
      <VC_Box x={980} y={664} w={820} h={290} show={s >= 4} tone={c.good} pad="14px 22px">
        <VC_Lab color={c.good} style={{ marginBottom: 10 }}>
          How the rows are used
        </VC_Lab>
        <VC_Line>retry: the same operation_id is answered from the share rows</VC_Line>
        <VC_Line>restore: a readiness-gated read of the share rows, not a journal operation</VC_Line>
        <VC_Line>catch-up: a peer sends the entry; the member replays it and writes its own rows</VC_Line>
        <VC_Line>not stored: other members' shares. Shares are never consensus items.</VC_Line>
      </VC_Box>
    </VarShell>
  );
};

// ─── Framing: comparison with mint ───────────────────────────────────────────

const VC_VW = [340, 620, 720];

const VC_VsRow = ({ show, aspect, swap, mint }: { show: boolean; aspect: string; swap: ReactNode; mint: ReactNode }) => (
  <VC_TRow show={show} h={88}>
    <VC_TCell w={VC_VW[0]} color={c.muted}>
      {aspect}
    </VC_TCell>
    <VC_TCell w={VC_VW[1]}>{swap}</VC_TCell>
    <VC_TCell w={VC_VW[2]}>{mint}</VC_TCell>
  </VC_TRow>
);

const VC_SwapVsMint: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  return (
    <VarShell of={VC_OF_SWAP} lens="Framing: comparison with mint" title="Swap and Bolt11 mint through the same pipeline" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VC_TRow head h={50}>
          <VC_TCell w={VC_VW[0]} head>
            {' '}
          </VC_TCell>
          <VC_TCell w={VC_VW[1]} head>
            Swap
          </VC_TCell>
          <VC_TCell w={VC_VW[2]} head>
            Bolt11 mint
          </VC_TCell>
        </VC_TRow>
        <VC_VsRow
          show={s >= 1}
          aspect="Consensus operations"
          swap={
            <>
              1: <Code>Swap</Code>
            </>
          }
          mint={
            <>
              2 + <M>q</M>: <Code>MintQuote</Code>, <M>q</M> × <Code>MintQuotePayment</Code>, <Code>Mint</Code>
            </>
          }
        />
        <VC_VsRow
          show={s >= 1}
          aspect="Public requests"
          swap={
            <>
              <Code>POST /v1/swap</Code>, the same body to every member
            </>
          }
          mint="quote on the first healthy member; status polls and the mint request to every member"
        />
        <VC_VsRow
          show={s >= 2}
          aspect="What makes it unique"
          swap={
            <>
              its input proofs, checked at apply: <Code>TokenAlreadySpent</Code>
            </>
          }
          mint={
            <>
              the quote id: conflict key <Code>Mint {'{ quote }'}</Code>
            </>
          }
        />
        <VC_VsRow
          show={s >= 2}
          aspect="Fact from outside"
          swap="none"
          mint={
            <>
              the payment, observed by each member; paid after <M>q</M> observations
            </>
          }
        />
        <VC_VsRow show={s >= 3} aspect="Shares" swap="for the outputs of the accepted swap" mint="for the outputs of the accepted mint" />
      </At>
      <At x={120} y={782} w={1680}>
        <Fade show={s >= 1} delay={300}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ width: 340, fontSize: 22, color: c.muted }}>swap</span>
            <VC_Chip tone={c.clayHex} fill={c.claySoft} size={21}>
              Swap
            </VC_Chip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 340, fontSize: 22, color: c.muted }}>
              mint, <M>q</M> = 4
            </span>
            <VC_Chip size={21}>MintQuote</VC_Chip>
            <VC_Chip tone={c.violet} size={21}>
              MintQuotePayment
            </VC_Chip>
            <VC_Chip tone={c.violet} size={21}>
              MintQuotePayment
            </VC_Chip>
            <VC_Chip tone={c.violet} size={21}>
              MintQuotePayment
            </VC_Chip>
            <VC_Chip tone={c.violet} size={21}>
              MintQuotePayment
            </VC_Chip>
            <VC_Chip tone={c.clayHex} fill={c.claySoft} size={21}>
              Mint
            </VC_Chip>
          </div>
        </Fade>
      </At>
      <At x={120} y={912} w={1680}>
        <Fade show={s >= 3}>
          <Note style={{ fontSize: 22 }}>
            <M>q</M>: payment observation quorum, <M>q ≥ c</M> in production. One development observer gives three
            operations.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Deck ────────────────────────────────────────────────────────────────────

const PAGES: [Page, string | undefined][] = [
  [VC_Cover, undefined],

  [MixMatch, 'Original slide.'],
  [
    VC_MixBeginner,
    'Beginner. One request per step, with a local check that passes each time. Say: every member did its job correctly and the wallet still has three signatures for a two-output quote.',
  ],
  [
    VC_MixAdvanced,
    'Advanced. The attack needs three preconditions: independently valid shares, purely local checks, and shares not bound to a request. The first is kept on purpose; ordering removes the second and the accepted-entry signing request removes the third. Name the three regression tests.',
  ],
  [
    VC_MixGraphical,
    'Graphical. The regression test geometry: four members, four outputs, each member request covers three consecutive outputs. Each arc adds one share to three outputs; after four arcs every output has three.',
  ],
  [
    VC_MixInterp,
    'Explained via interpolation, with a toy field mod 23. Each output is interpolated from a different pair of members, each with its own Lagrange weights, and each result is k times the blinded value. The algebra never sees which request a member answered.',
  ],
  [
    VC_MixAttacker,
    "Perspective: attacker. The plan is simply to send each member a different body. Every body is valid on its own; the only requirement is that members don't compare requests before signing.",
  ],
  [
    VC_MixSwap,
    'Framing: the swap variant, from the wallet-level test. Inputs are fixed, output windows slide. Without ordering four outputs complete from three inputs; with ordering the first accepted envelope wins and the others fail with TokenAlreadySpent.',
  ],
  [
    VC_MixCount,
    'Framing: counting shares. If each member signs one request of w outputs, the attacker gets at most floor(n·w/t) outputs, and cyclic windows reach it. The ratio approaches n over t; ordering brings it back to exactly w.',
  ],

  [OperationId, 'Original slide.'],
  [
    VC_OpBeginner,
    'Beginner. A hash as the name of the exact bytes: change one output and the name changes, resend the same bytes and the name repeats. Toy strings, real SHA-256.',
  ],
  [
    VC_OpAdvanced,
    'Advanced. The exact transcript: length-prefixed domain tag and canonical JSON with sorted keys, authorization excluded. Rules: version 6 only, 1 MiB cap, every consumer recomputes the ID, key order does not matter.',
  ],
  [
    VC_OpGraphical,
    'Graphical. Fan-out and retries collapse into one operation because the bytes are identical; a different output set is a second operation. One log entry per operation, not per HTTP request.',
  ],
  [
    VC_OpCode,
    'Explained via code. Walk the four highlighted parts of operation_id() in cdk-common: version check, canonical bytes without the authorization, length-prefixed transcript, SHA-256.',
  ],
  [
    VC_OpMember,
    'Perspective: the receiving member. Admission, envelope and ID, readiness, duplicate check, conflict check, then the queue. Every exit before the queue returns no shares.',
  ],
  [
    VC_OpRetry,
    'Framing: retry after a lost response. The same bytes give the same operation ID, so a retry joins the finalized entry and returns the stored shares. Regenerating outputs creates a new operation that loses: TokenAlreadySpent for a swap, ConflictingOperation for a mint.',
  ],
  [
    VC_OpVsKey,
    'Framing: operation ID versus conflict key. The ID names the exact bytes, the conflict key names the claimed resource. Swaps deliberately have no conflict key; the proof store at apply is their lock, and the code comment explains why.',
  ],

  [Consensus, 'Original slide.'],
  [
    VC_ConBeginner,
    'Beginner. Two conflicting requests reach different members. Nobody signs until consensus has produced one list; every member reads the same list and reaches the same verdicts.',
  ],
  [
    VC_ConAdvanced,
    'Advanced. Quorum intersection with n equal to 5: any two consensus quorums of 4 share three members, so an honest one; two signing sets of 3 may share only the faulty member. That is why t below c is safe only when signing follows ordering.',
  ],
  [
    VC_ConGraphical,
    'Graphical. Two envelopes go into AlephBFT, one ordered log comes out and is replicated at every member. Only entry 41 produces shares.',
  ],
  [
    VC_ConState,
    'Explained via state machine. Mempool with duplicate joins and conflict refusals, finalization at an index, Accepted or Rejected, then apply: Applied with shares in one transaction, Rejected with the stored error response, or Failed and retried on replay.',
  ],
  [
    VC_ConByzantine,
    'Perspective: a Byzantine member in a five-member federation. It cannot sign alone, cannot make honest members sign unordered outputs, cannot finalize a conflict and cannot fake a catch-up. It can stay silent, race a rewritten swap of proofs without an output-binding witness, and order an invalid proof first.',
  ],
  [
    VC_ConSignOrder,
    'Framing: the order of the two steps. Signing first creates shares that cannot be withdrawn when ordering later finds the conflict. Ordering first settles the conflict before any signature exists.',
  ],
  [
    VC_ConKeys,
    'Focus: conflict keys. Quote-scoped operations lock their quote id, observations lock per observer, swaps have none. The key is checked in the mempool and at finalization; the swap lock is the proof state at apply.',
  ],

  [Swap, 'Original slide.'],
  [
    VC_SwapBeginner,
    'Beginner. A three-member example with concrete amounts: two proofs in, three outputs out, no fee. Request, consensus, spend and share, then the wallet combines two shares per output.',
  ],
  [
    VC_SwapAdvanced,
    'Advanced. The apply step as a decision table from apply_federation_swap: pre-checks, then input state and existing signatures decide between signing, idempotent replay, TokenAlreadySpent and TokenPending. The public route only reads stored share rows.',
  ],
  [
    VC_SwapGraphical,
    'Graphical. The data flow in five beats: fan-out, into AlephBFT, back to the members who spend P1 and P2, shares to the wallet, aggregation into new proofs.',
  ],
  [
    VC_SwapSequence,
    'Explained via sequence diagram with four members, t and c equal to 3. One member is lagging and fails closed; the other three are enough to finalize and to sign. The lagging member later replays the entry.',
  ],
  [
    VC_SwapLagging,
    'Perspective: the lagging member. Offline, lagging, catching up, healthy. While not healthy it refuses value requests; after replay it can serve the shares of the accepted swap but cannot sign another output set for the same inputs.',
  ],
  [
    VC_SwapStores,
    'Framing: what one accepted swap writes at each member. Journal entry, one share row per output bound to the operation ID, the spent proofs and completed operation, all in one transaction. Restore and retries read these rows.',
  ],
  [
    VC_SwapVsMint,
    'Framing: comparison with the Bolt11 mint. Swap is one consensus operation with no external fact and locks on its inputs at apply; mint needs quote, q payment observations and the mint operation, and locks on the quote id.',
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · Ordering (temporary)',
  createdAt: '2026-09-28T09:08:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
