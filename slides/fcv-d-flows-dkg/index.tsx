import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  Arrow,
  At,
  Canvas,
  Dkg,
  DkgRounds,
  Dot,
  Draw,
  EASE_IO,
  EASE_OUT,
  Fade,
  GFade,
  Lifeline,
  Line,
  M,
  MATH,
  MONO,
  Member,
  MintQuote,
  Note,
  Packet,
  REDUCED,
  SERIF,
  StepItem,
  StepList,
  T,
  Topology,
  VarCover,
  VarShell,
  WalletNode,
  c,
  ring,
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

// ─── Local helpers (prefix VD_) ──────────────────────────────────────────────

const VD_tr = (show: boolean, delay = 0, dur = 450) =>
  `opacity ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms, transform ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms`;

const VD_Cap = ({ children, color = c.muted, style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <div style={{ fontSize: 21, letterSpacing: '0.08em', textTransform: 'uppercase', color, ...style }}>{children}</div>
);

const VD_Mono = ({ children, size = 21, color }: { children: ReactNode; size?: number; color?: string }) => (
  <span style={{ fontFamily: MONO, fontSize: size, color }}>{children}</span>
);

/** Absolute box that fades in and can be highlighted. */
const VD_Box = ({
  x,
  y,
  w,
  h,
  show = true,
  on = false,
  tone = c.clayHex,
  fill = c.card,
  delay = 0,
  dashed = false,
  pad = '14px 20px',
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  show?: boolean;
  on?: boolean;
  tone?: string;
  fill?: string;
  delay?: number;
  dashed?: boolean;
  pad?: string;
  children?: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${on ? tone : c.rule}`,
      background: fill,
      borderRadius: 12,
      padding: pad,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(8px)',
      transition: `${VD_tr(show, delay)}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

/** Table row: fades in, highlights when on. */
const VD_Tr = ({
  children,
  head = false,
  on = false,
  show = true,
  delay = 0,
}: {
  children: ReactNode;
  head?: boolean;
  on?: boolean;
  show?: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      minHeight: head ? 48 : 58,
      borderBottom: `1px solid ${head ? c.line : c.rule}`,
      background: on ? c.claySoft : 'transparent',
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `${VD_tr(show, delay, 400)}, background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const VD_Td = ({
  children,
  w,
  head = false,
  color,
  size = 23,
  mono = false,
  center = false,
}: {
  children?: ReactNode;
  w: number;
  head?: boolean;
  color?: string;
  size?: number;
  mono?: boolean;
  center?: boolean;
}) => (
  <div
    style={{
      width: w,
      flexShrink: 0,
      boxSizing: 'border-box',
      padding: '9px 16px',
      fontFamily: mono ? MONO : undefined,
      fontSize: head ? 21 : mono ? 21 : size,
      lineHeight: 1.38,
      letterSpacing: head ? '0.07em' : undefined,
      textTransform: head ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
      textAlign: center ? 'center' : undefined,
      transition: `color 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

/** Small centered chip at (x = center, y = top). */
const VD_Chip = ({
  x,
  y,
  w = 180,
  h = 44,
  tone = c.rule,
  fill = c.card,
  show = true,
  delay = 0,
  size = 22,
  mono = false,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  tone?: string;
  fill?: string;
  show?: boolean;
  delay?: number;
  size?: number;
  mono?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone}`,
      background: fill,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: mono ? MONO : undefined,
      fontSize: size,
      color: tone === c.rule || tone === c.node ? c.ink : tone,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `${VD_tr(show, delay, 400)}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

/** One line of a code listing. */
const VD_Ln = ({
  on = false,
  dim = false,
  lh = 1.6,
  children,
}: {
  on?: boolean;
  dim?: boolean;
  lh?: number;
  children?: ReactNode;
}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 21,
      lineHeight: lh,
      whiteSpace: 'pre',
      padding: '0 12px',
      margin: '0 -12px',
      borderRadius: 6,
      color: dim ? c.muted : c.ink,
      background: on ? c.claySoft : 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    {children ?? ' '}
  </div>
);

/** Byte segment with a caption underneath. */
const VD_Seg = ({
  bytes,
  label,
  show = true,
  delay = 0,
  hot = false,
}: {
  bytes: ReactNode;
  label?: ReactNode;
  show?: boolean;
  delay?: number;
  hot?: boolean;
}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginRight: 10,
      marginBottom: 12,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: VD_tr(show, delay, 400),
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 21,
        padding: '5px 10px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${hot ? c.clayHex : c.rule}`,
        background: hot ? c.claySoft : c.card,
      }}
    >
      {bytes}
    </span>
    {label && <span style={{ fontSize: 21, color: c.muted, marginTop: 4, whiteSpace: 'nowrap' }}>{label}</span>}
  </div>
);

/** Shortened segment between two circles. */
const VD_seg = (ax: number, ay: number, bx: number, by: number, ra: number, rb: number) => {
  const d = Math.hypot(bx - ax, by - ay);
  const ux = (bx - ax) / d;
  const uy = (by - ay) / d;
  return { x1: ax + ux * ra, y1: ay + uy * ra, x2: bx - ux * rb, y2: by - uy * rb };
};

/** SVG arc path, angles in degrees, clockwise. */
const VD_arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};

/** Arc that draws itself (pathLength-normalised). */
const VD_DrawArc = ({
  d,
  show,
  color,
  width = 16,
  delay = 0,
}: {
  d: string;
  show: boolean;
  color: string;
  width?: number;
  delay?: number;
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
      transition: `stroke-dashoffset ${REDUCED ? 0 : 700}ms ${EASE_IO} ${show ? delay : 0}ms, stroke 300ms ${EASE_OUT}`,
    }}
  />
);

/** Subscript and superscript for letters that the math font lacks as Unicode sub/superscripts. */
const VD_S = ({ children }: { children: ReactNode }) => (
  <sub style={{ fontSize: '0.7em', verticalAlign: '-0.22em', lineHeight: 0 }}>{children}</sub>
);
const VD_P = ({ children }: { children: ReactNode }) => (
  <sup style={{ fontSize: '0.7em', verticalAlign: '0.36em', lineHeight: 0 }}>{children}</sup>
);

const VD_TOY = 'Toy group: powers of g = 4 modulo 107 (order 53), written multiplicatively; gᵃ stands for a·G₂.';

// ─── Cover ───────────────────────────────────────────────────────────────────

const VD_Cover: Page = () => (
  <VarCover
    section="1.3–1.4"
    title="Request flows and key generation"
    sources={[
      { n: '1.3', title: 'Bolt11 mint, federated', count: 7 },
      { n: '1.3', title: 'Network topology', count: 7 },
      { n: '1.4', title: 'Distributed key generation', count: 7 },
      { n: '1.4', title: 'DKG message flow', count: 7 },
    ]}
  />
);

// ═════════════════════════════════════════════════════════════════════════════
// 1.3 Bolt11 mint, federated
// ═════════════════════════════════════════════════════════════════════════════

const VD_MQ_OF = '1.3 Bolt11 mint, federated';

const VD_QuoteWord = ({ s, first = false }: { s: number; first?: boolean }) => {
  const label = s >= 6 ? 'issued' : s >= 4 ? 'paid' : s >= 2 ? 'unpaid' : first && s >= 1 ? 'invoice created' : '—';
  const color = s >= 6 ? c.clayHex : s >= 4 ? c.good : s >= 2 || (first && s >= 1) ? c.ink : c.dim;
  return <span style={{ color, transition: `color 300ms ${EASE_OUT}` }}>{label}</span>;
};

const VD_MemCard = ({ y, label, sub, s, first = false }: { y: number; label: string; sub: string; s: number; first?: boolean }) => {
  const on = (first && s === 1) || s === 3 || s === 6;
  return (
    <div
      style={{
        position: 'absolute',
        left: 760,
        top: y,
        width: 500,
        height: 150,
        boxSizing: 'border-box',
        border: `1.75px solid ${on ? c.clayHex : c.rule}`,
        background: c.card,
        borderRadius: 12,
        padding: '14px 22px',
        transition: `border-color 300ms ${EASE_OUT}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 24 }}>
        <span style={{ fontFamily: MONO, fontSize: 24 }}>{label}</span>
        <span>
          <span style={{ color: c.muted }}>quote q1: </span>
          <VD_QuoteWord s={s} first={first} />
        </span>
      </div>
      <div style={{ fontSize: 23, marginTop: 12, color: s >= 3 ? c.good : c.dim, transition: `color 300ms ${EASE_OUT}` }}>
        payment report: {s >= 3 ? 'paid' : '—'}
      </div>
      <div style={{ fontSize: 23, marginTop: 6, color: s >= 6 ? c.clayHex : c.dim, transition: `color 300ms ${EASE_OUT}` }}>
        share:{' '}
        {s >= 6 ? (
          <M>
            C′{sub} = k{sub}·B′
          </M>
        ) : (
          '—'
        )}
      </div>
    </div>
  );
};

const VD_MqBeginner: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  const W = { x: 330, y: 525 };
  const ys = [345, 525, 705];
  return (
    <VarShell of={VD_MQ_OF} lens="Beginner" title="Minting from three members, step by step" proc={proc}>
      <Canvas>
        {ys.map((y, i) => (
          <g key={`l${i}`}>
            <Line
              x1={W.x + 56}
              y1={W.y}
              x2={760}
              y2={y}
              color={c.cool}
              opacity={i === 0 ? (s >= 1 ? 0.7 : 0.15) : s >= 5 ? 0.7 : 0.15}
            />
            <Packet x1={W.x + 56} y1={W.y} x2={760} y2={y} run={proc.anim && (s === 5 || s === 6)} delay={i * 60} />
            <Packet x1={760} y1={y} x2={W.x + 56} y2={W.y} run={proc.anim && s === 5} delay={900 + i * 60} />
            <Packet x1={760} y1={y} x2={W.x + 56} y2={W.y} run={proc.anim && s === 6} color={c.clayHex} delay={1000 + i * 60} />
          </g>
        ))}
        <Packet x1={W.x + 56} y1={W.y} x2={760} y2={ys[0]} run={proc.anim && s === 1} delay={200} />
        <path
          d="M 1262 345 H 1296 V 705 H 1262 M 1262 525 H 1296"
          style={{
            fill: 'none',
            stroke: c.violet,
            strokeWidth: 2,
            strokeDasharray: '5 5',
            opacity: s >= 2 ? 0.9 : 0.15,
            transition: `opacity 400ms ${EASE_OUT}`,
          }}
        />
        <Packet x1={1296} y1={345} x2={1296} y2={705} run={proc.anim && s === 2} color={c.violet} delay={200} />
        <text
          x={1320}
          y={525}
          textAnchor="middle"
          transform="rotate(90 1320 525)"
          style={{ fontFamily: 'var(--osd-font-body)', fontSize: 21, fill: c.violet, opacity: s >= 2 ? 1 : 0.3 }}
        >
          consensus
        </text>
        <WalletNode x={W.x} y={W.y} r={56} />
      </Canvas>
      <VD_MemCard y={270} label="m1" sub="₁" s={s} first />
      <VD_MemCard y={450} label="m2" sub="₂" s={s} />
      <VD_MemCard y={630} label="m3" sub="₃" s={s} />
      <At x={120} y={640} w={560}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 24, lineHeight: 1.45 }}>The wallet paid the invoice.</div>
        </Fade>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 24, lineHeight: 1.45 }}>
            Paid reports: 3 of <M>q</M> = 3
          </div>
        </Fade>
        <Fade show={s >= 5}>
          <div style={{ fontSize: 24, lineHeight: 1.45 }}>
            Status: 2 identical answers used (<M>t</M> = 2)
          </div>
        </Fade>
        <Fade show={s >= 6}>
          <div style={{ fontSize: 24, lineHeight: 1.45 }}>
            Shares: any 2 give <M>C′</M>
          </div>
        </Fade>
      </At>
      <At x={120} y={830} w={1220}>
        <Note>
          <b style={{ fontWeight: 500, color: c.ink }}>Quote</b>: the mint's record of an invoice to be paid.{' '}
          <b style={{ fontWeight: 500, color: c.ink }}>Consensus</b>: the members' shared, ordered log.{' '}
          <M>q</M>: matching payment reports needed. <M>t</M>: shares or answers needed.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Wallet asks m1 for a quote; m1 creates an invoice.
        </StepItem>
        <StepItem n={2} step={s}>
          m1 submits the quote to consensus; all three store it.
        </StepItem>
        <StepItem n={3} step={s}>
          Wallet pays. Each member reports what its backend saw.
        </StepItem>
        <StepItem n={4} step={s}>
          <M>q</M> = 3 matching reports: the quote is paid everywhere.
        </StepItem>
        <StepItem n={5} step={s}>
          Wallet reads the status from all; <M>t = 2</M> must agree.
        </StepItem>
        <StepItem n={6} step={s}>
          Wallet sends <M>B′</M> to all; 2 of the 3 shares give <M>C′</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_MQA_W = [60, 190, 690, 740];

const VD_MqAdvanced: Page = () => {
  const proc = useProcess(6, 2400);
  const s = proc.step;
  return (
    <VarShell of={VD_MQ_OF} lens="Advanced" title="Mint flow in the code: rules, timeouts, failures" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VD_Tr head>
          <VD_Td head w={VD_MQA_W[0]}>#</VD_Td>
          <VD_Td head w={VD_MQA_W[1]}>Step</VD_Td>
          <VD_Td head w={VD_MQA_W[2]}>Wallet · wallet/federation.rs</VD_Td>
          <VD_Td head w={VD_MQA_W[3]}>Member · cdk-axum</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1}>
          <VD_Td w={VD_MQA_W[0]} color={c.muted} mono>
            1
          </VD_Td>
          <VD_Td w={VD_MQA_W[1]} size={22}>
            Create quote
          </VD_Td>
          <VD_Td w={VD_MQA_W[2]} size={22}>
            POST to the preferred coordinator, then each member in order; 10 s per attempt. A definitive rejection
            ends the loop.
          </VD_Td>
          <VD_Td w={VD_MQA_W[3]} size={22}>
            Creates the invoice on its backend, submits <VD_Mono>MintQuote</VD_Mono> (quote id, lookup id, request,
            response), replies after acceptance. Lock: quote id.
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2}>
          <VD_Td w={VD_MQA_W[0]} color={c.muted} mono>
            2
          </VD_Td>
          <VD_Td w={VD_MQA_W[1]} size={22}>
            Visibility
          </VD_Td>
          <VD_Td w={VD_MQA_W[2]} size={22}>
            Fans out GET status until <M>t</M> members return the same quote: 100 attempts, 50 ms apart. A failed
            check never creates a second quote.
          </VD_Td>
          <VD_Td w={VD_MQA_W[3]} size={22}>
            Answers from consensus-applied state.
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3}>
          <VD_Td w={VD_MQA_W[0]} color={c.muted} mono>
            3
          </VD_Td>
          <VD_Td w={VD_MQA_W[1]} size={22}>
            Observe
          </VD_Td>
          <VD_Td w={VD_MQA_W[2]} size={22} color={c.dim}>
            —
          </VD_Td>
          <VD_Td w={VD_MQA_W[3]} size={22}>
            Probes its backend on a payment event, a scheduled scan or a status request; submits its own{' '}
            <VD_Mono>MintQuotePayment</VD_Mono>.
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 4} on={s === 4}>
          <VD_Td w={VD_MQA_W[0]} color={c.muted} mono>
            4
          </VD_Td>
          <VD_Td w={VD_MQA_W[1]} size={22}>
            Paid
          </VD_Td>
          <VD_Td w={VD_MQA_W[2]} size={22} color={c.dim}>
            —
          </VD_Td>
          <VD_Td w={VD_MQA_W[3]} size={22}>
            Paid once <M>q</M> matching observations are accepted. <VD_Mono>member_quorum(q)</VD_Mono> requires{' '}
            <M>c ≤ q ≤ n</M>; single observation is test-only.
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 5} on={s === 5}>
          <VD_Td w={VD_MQA_W[0]} color={c.muted} mono>
            5
          </VD_Td>
          <VD_Td w={VD_MQA_W[1]} size={22}>
            Status
          </VD_Td>
          <VD_Td w={VD_MQA_W[2]} size={22}>
            Groups identical responses (<VD_Mono>updated_at</VD_Mono> ignored); returns a state only when <M>t</M>{' '}
            members agree.
          </VD_Td>
          <VD_Td w={VD_MQA_W[3]} size={22}>
            Answers from consensus-applied state.
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 6} on={s === 6}>
          <VD_Td w={VD_MQA_W[0]} color={c.muted} mono>
            6
          </VD_Td>
          <VD_Td w={VD_MQA_W[1]} size={22}>
            Mint
          </VD_Td>
          <VD_Td w={VD_MQA_W[2]} size={22}>
            Checks outputs against the v3 keysets, fans out the mint request, checks each share against{' '}
            <M>Kᵢ</M>, stops at <M>t</M> valid shares.
          </VD_Td>
          <VD_Td w={VD_MQA_W[3]} size={22}>
            Waits until the quote is paid locally, else <VD_Mono>PendingQuote</VD_Mono>; submits{' '}
            <VD_Mono>Mint</VD_Mono> (lock: quote id); returns <M>C′ᵢ</M> after acceptance.
          </VD_Td>
        </VD_Tr>
      </At>
      <At x={120} y={830} w={1680}>
        <Fade show={s >= 6} delay={300}>
          <Note>
            Not a straight line: a status request can itself trigger step 3 on the member that answers it, and every
            member checks for paid again before step 6.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_MqGraphical: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  const W = { x: 300, y: 600 };
  const LN = { x: 620, y: 300 };
  const ms = [
    { x: 960, y: 360 },
    { x: 960, y: 600 },
    { x: 960, y: 840 },
  ];
  const D = { x: 1420, y: 600 };
  const word = s >= 6 ? 'issued' : s >= 4 ? 'paid' : 'unpaid';
  const wordColor = s >= 6 ? c.clayHex : s >= 4 ? c.good : c.muted;
  const arcColor = s >= 4 ? c.good : c.violet;
  return (
    <VarShell of={VD_MQ_OF} lens="Graphical" title="Quote state across three members" proc={proc}>
      <Canvas>
        {ms.map((m, i) => {
          const w = VD_seg(W.x, W.y, m.x, m.y, 56, 44);
          const sp = VD_seg(m.x, m.y, D.x, D.y, 44, 118);
          const ln = VD_seg(LN.x, LN.y, m.x, m.y, 38, 44);
          return (
            <g key={`g${i}`}>
              <Line {...w} color={c.cool} opacity={i === 0 ? (s >= 1 ? 0.7 : 0.12) : s >= 5 ? 0.7 : 0.12} />
              <GFade show={s >= 2} delay={i * 60} to={0.85}>
                <line {...sp} style={{ stroke: c.violet, strokeWidth: 2, strokeDasharray: '6 6' }} />
              </GFade>
              <GFade show={s >= 3} delay={300 + i * 60} to={0.8}>
                <line {...ln} style={{ stroke: c.muted, strokeWidth: 1.5, strokeDasharray: '4 6' }} />
              </GFade>
              <Packet x1={sp.x2} y1={sp.y2} x2={sp.x1} y2={sp.y1} run={proc.anim && s === 2 && i > 0} color={c.violet} delay={700 + i * 80} />
              <Packet x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} run={proc.anim && s === 3} color={c.muted} delay={800 + i * 120} />
              <Packet x1={sp.x1} y1={sp.y1} x2={sp.x2} y2={sp.y2} run={proc.anim && s === 3} color={c.violet} delay={1500 + i * 150} />
              <Packet x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} run={proc.anim && (s === 5 || s === 6)} delay={i * 60} />
              <Packet x1={w.x2} y1={w.y2} x2={w.x1} y2={w.y1} run={proc.anim && s === 5} delay={900 + i * 60} />
              <Packet x1={w.x2} y1={w.y2} x2={w.x1} y2={w.y1} run={proc.anim && s === 6} color={c.clayHex} delay={1000 + i * 60} />
            </g>
          );
        })}
        <Packet {...VD_seg(W.x, W.y, ms[0].x, ms[0].y, 56, 44)} run={proc.anim && s === 1} delay={200} />
        <Packet {...VD_seg(ms[0].x, ms[0].y, D.x, D.y, 44, 118)} run={proc.anim && s === 2} color={c.violet} delay={100} />
        <GFade show={s >= 3} to={0.8}>
          <line {...VD_seg(W.x, W.y, LN.x, LN.y, 56, 38)} style={{ stroke: c.cool, strokeWidth: 1.5, strokeDasharray: '4 6' }} />
        </GFade>
        <Packet {...VD_seg(W.x, W.y, LN.x, LN.y, 56, 38)} run={proc.anim && s === 3} delay={100} />
        <circle cx={LN.x} cy={LN.y} r={38} style={{ fill: c.card, stroke: c.muted, strokeWidth: 1.75 }} />
        <T x={LN.x} y={LN.y + 8} size={22} color={c.muted}>
          LN
        </T>
        <GFade show={s >= 2}>
          <circle cx={D.x} cy={D.y} r={110} style={{ fill: 'none', stroke: c.rule, strokeWidth: 16 }} />
        </GFade>
        <VD_DrawArc d={VD_arc(D.x, D.y, 110, -86, 26)} show={s >= 3} color={arcColor} delay={1800} />
        <VD_DrawArc d={VD_arc(D.x, D.y, 110, 34, 146)} show={s >= 3} color={arcColor} delay={2050} />
        <VD_DrawArc d={VD_arc(D.x, D.y, 110, 154, 266)} show={s >= 3} color={arcColor} delay={2300} />
        <circle
          cx={D.x}
          cy={D.y}
          r={88}
          style={{
            fill: s >= 6 ? c.claySoft : s >= 4 ? c.goodSoft : c.card,
            opacity: s >= 2 ? 1 : 0,
            transition: `fill 400ms ${EASE_OUT}, opacity 400ms ${EASE_OUT}`,
          }}
        />
        <T x={D.x} y={D.y + 10} size={30} color={wordColor} show={s >= 2}>
          {word}
        </T>
        <T x={D.x} y={D.y + 168} size={26} color={c.muted} show={s >= 3} delay={2300}>
          <tspan style={{ fontFamily: MATH, fontStyle: 'italic' }}>q</tspan> 3/3
        </T>
        <T x={W.x} y={W.y + 110} size={30} font="math" color={c.cool} show={s >= 5}>
          t = 2
        </T>
        <T x={W.x} y={W.y - 82} size={40} font="math" color={c.clayHex} show={s >= 6} delay={1500}>
          C′
        </T>
        <WalletNode x={W.x} y={W.y} r={56} />
        {ms.map((m, i) => (
          <Member
            key={`m${i}`}
            x={m.x}
            y={m.y}
            r={44}
            label={`m${i + 1}`}
            tone={(i === 0 && s === 1) || s === 3 || s === 6 ? 'on' : s === 5 ? 'cool' : 'idle'}
          />
        ))}
      </Canvas>
    </VarShell>
  );
};

const VD_MqStateMachine: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const nodeTitle = (t: string, active: boolean) => (
    <div style={{ fontFamily: SERIF, fontSize: 34, color: active ? c.ink : c.muted, transition: `color 300ms ${EASE_OUT}` }}>
      {t}
    </div>
  );
  return (
    <VarShell of={VD_MQ_OF} lens="Explained as a state machine" title="Quote states and the items that move them" proc={proc}>
      <At x={120} y={250} w={1680}>
        <Note>
          Example: a Bolt11 quote for 8 sat. States as CDK stores them; NUT-04 responses carry{' '}
          <VD_Mono size={22}>amount_paid</VD_Mono> and <VD_Mono size={22}>amount_issued</VD_Mono>.
        </Note>
      </At>
      <Canvas>
        <Arrow x1={402} y1={370} x2={586} y2={370} show={s >= 1} color={c.clayHex} />
        <Arrow x1={872} y1={370} x2={1056} y2={370} show={s >= 2} color={c.clayHex} />
        <Arrow x1={1342} y1={370} x2={1516} y2={370} show={s >= 3} color={c.clayHex} />
      </Canvas>
      <VD_Box x={120} y={310} w={280} h={120} on={s === 0} pad="16px 22px">
        {nodeTitle('no quote', true)}
        <VD_Mono color={c.dim}>—</VD_Mono>
      </VD_Box>
      <VD_Box x={590} y={310} w={280} h={120} on={s === 1} show={s >= 1} pad="16px 22px">
        {nodeTitle('unpaid', s >= 1)}
        <VD_Mono color={c.muted}>amount_paid 0</VD_Mono>
      </VD_Box>
      <VD_Box x={1060} y={310} w={280} h={120} on={s === 2} tone={c.good} show={s >= 2} pad="16px 22px">
        {nodeTitle('paid', s >= 2)}
        <VD_Mono color={c.good}>amount_paid 8</VD_Mono>
      </VD_Box>
      <VD_Box x={1520} y={310} w={280} h={120} on={s === 3} show={s >= 3} pad="16px 22px">
        {nodeTitle('issued', s >= 3)}
        <VD_Mono color={c.clayHex}>amount_issued 8</VD_Mono>
      </VD_Box>
      <VD_Box x={305} y={460} w={380} h={150} show={s >= 1} fill={c.panel}>
        <VD_Mono size={22}>MintQuote</VD_Mono>
        <div style={{ fontSize: 22, lineHeight: 1.4, color: c.muted, marginTop: 6 }}>
          one item, from the member that created the invoice
        </div>
      </VD_Box>
      <VD_Box x={775} y={460} w={380} h={150} show={s >= 2} fill={c.panel}>
        <span style={{ fontSize: 22 }}>
          <M>q</M> × <VD_Mono size={22}>MintQuotePayment</VD_Mono>
        </span>
        <div style={{ fontSize: 22, lineHeight: 1.4, color: c.muted, marginTop: 6 }}>
          matching, one per observing member
        </div>
      </VD_Box>
      <VD_Box x={1240} y={460} w={380} h={150} show={s >= 3} fill={c.panel}>
        <VD_Mono size={22}>Mint</VD_Mono>
        <div style={{ fontSize: 22, lineHeight: 1.4, color: c.muted, marginTop: 6 }}>
          exact outputs; conflict lock on the quote id
        </div>
      </VD_Box>
      <VD_Box x={120} y={650} w={420} h={190} show={s >= 4} pad="14px 20px">
        <VD_Cap>Wallet request</VD_Cap>
        <div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 6 }}>create: one member at a time until one accepts</div>
      </VD_Box>
      <VD_Box x={590} y={650} w={360} h={190} show={s >= 4} delay={60}>
        <VD_Cap>In this state</VD_Cap>
        <div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 6 }}>status → unpaid</div>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          mint → members wait, then <VD_Mono>PendingQuote</VD_Mono>
        </div>
      </VD_Box>
      <VD_Box x={1020} y={650} w={380} h={190} show={s >= 4} delay={120}>
        <VD_Cap>In this state</VD_Cap>
        <div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 6 }}>status → paid</div>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>mint → Mint submitted; shares after acceptance</div>
      </VD_Box>
      <VD_Box x={1440} y={650} w={360} h={190} show={s >= 4} delay={180}>
        <VD_Cap>In this state</VD_Cap>
        <div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 6 }}>same outputs again → same operation, stored shares</div>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>other outputs → rejected</div>
      </VD_Box>
      <At x={120} y={870} w={1680}>
        <Fade show={s >= 4} delay={240}>
          <Note>
            No transition: fewer than <M>q</M> matching observations · an observation that differs in state, amount or
            payment id · a second <VD_Mono size={22}>Mint</VD_Mono> for the same quote.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_MqMember: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  const Wx = 220;
  const Mx = 560;
  const Cx = 900;
  const Bx = 1230;
  return (
    <VarShell of={VD_MQ_OF} lens="Perspective: member m2" title="The same flow at member m2" proc={proc}>
      <Canvas>
        <Lifeline x={Wx} label="wallet" color={c.cool} bottom={945} />
        <Lifeline x={Mx} label="m2" bottom={945} />
        <Lifeline x={Cx} label="consensus" color={c.violet} bottom={945} />
        <Lifeline x={Bx} label="m2 backend" color={c.muted} bottom={945} />

        <Arrow x1={Cx} y1={330} x2={Mx + 6} y2={330} show={s >= 1} color={c.violet} font="mono" label="MintQuote (from m1)" />
        <Packet x1={Cx} y1={330} x2={Mx} y2={330} run={proc.anim && s === 1} color={c.violet} delay={200} />

        <Arrow x1={Wx} y1={400} x2={Mx - 6} y2={400} show={s >= 2} color={c.cool} font="mono" label="GET status" />
        <Arrow x1={Mx} y1={450} x2={Wx + 6} y2={450} show={s >= 2} color={c.cool} font="sans" label="unpaid" delay={500} dashed />
        <Packet x1={Wx} y1={400} x2={Mx} y2={400} run={proc.anim && s === 2} delay={100} />

        <Arrow x1={Bx} y1={530} x2={Mx + 6} y2={530} show={s >= 3} color={c.muted} font="sans" label="payment seen" dashed />
        <Arrow x1={Mx} y1={590} x2={Cx - 6} y2={590} show={s >= 3} color={c.violet} font="mono" label="MintQuotePayment (m2)" delay={600} />
        <Packet x1={Bx} y1={530} x2={Mx} y2={530} run={proc.anim && s === 3} color={c.muted} delay={100} />
        <Packet x1={Mx} y1={590} x2={Cx} y2={590} run={proc.anim && s === 3} color={c.violet} delay={900} />

        <Arrow x1={Cx} y1={660} x2={Mx + 6} y2={660} show={s >= 4} color={c.violet} font="sans" label="q observations → paid" />
        <Packet x1={Cx} y1={660} x2={Mx} y2={660} run={proc.anim && s === 4} color={c.violet} delay={200} />

        <Arrow x1={Wx} y1={740} x2={Mx - 6} y2={740} show={s >= 5} color={c.cool} font="sans" label="mint request, B′" />
        <Arrow x1={Mx} y1={800} x2={Cx - 6} y2={800} show={s >= 5} color={c.violet} font="mono" label="Mint (lock q1)" delay={500} />
        <Arrow x1={Cx} y1={850} x2={Mx + 6} y2={850} show={s >= 5} color={c.violet} font="sans" label="accepted" delay={1000} dashed />
        <Packet x1={Wx} y1={740} x2={Mx} y2={740} run={proc.anim && s === 5} delay={100} />
        <Packet x1={Mx} y1={800} x2={Cx} y2={800} run={proc.anim && s === 5} color={c.violet} delay={700} />

        <Arrow x1={Mx} y1={912} x2={Wx + 6} y2={912} show={s >= 6} color={c.clayHex} />
        <T x={(Mx + Wx) / 2} y={896} size={28} font="math" color={c.clayHex} show={s >= 6} delay={300}>
          C′₂ = k₂·B′
        </T>
        <Packet x1={Mx} y1={912} x2={Wx} y2={912} run={proc.anim && s === 6} color={c.clayHex} delay={300} />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          m2 learns the quote from consensus; the wallet talked to m1.
        </StepItem>
        <StepItem n={2} step={s}>
          Status requests are answered from applied state.
        </StepItem>
        <StepItem n={3} step={s}>
          m2 reports what its own backend saw: one observation.
        </StepItem>
        <StepItem n={4} step={s}>
          The quote turns paid only after <M>q</M> accepted observations.
        </StepItem>
        <StepItem n={5} step={s}>
          On a mint request m2 waits for paid, then submits <VD_Mono size={22}>Mint</VD_Mono>.
        </StepItem>
        <StepItem n={6} step={s}>
          m2 signs only the accepted outputs.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>A status request also makes m2 probe its backend.</Note>
      </StepList>
    </VarShell>
  );
};

const VD_MQB_X = [260, 480, 700, 920, 1140];

const VD_MqByzantine: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VD_MQ_OF} lens="Focus: one member's paid vs the quorum" title="One member reports paid" proc={proc}>
      <At x={120} y={250} w={1220}>
        <Note>
          <M>n</M> = 5, <M>f</M> = 1, <M>c</M> = 4, <M>q</M> = 4, <M>t</M> = 3. The invoice is unpaid; m5 is
          Byzantine.
        </Note>
      </At>
      <Canvas>
        {VD_MQB_X.map((x, i) => (
          <Member key={`m${i}`} x={x} y={345} r={38} label={`m${i + 1}`} tone={i === 4 ? 'bad' : 'idle'} />
        ))}
      </Canvas>
      <At x={120} y={400}>
        <Fade show={s >= 1}>
          <VD_Cap>Payment observations</VD_Cap>
        </Fade>
      </At>
      <VD_Chip x={VD_MQB_X[0]} y={436} show={s >= 1}>—</VD_Chip>
      <VD_Chip x={VD_MQB_X[1]} y={436} show={s >= 1}>—</VD_Chip>
      <VD_Chip x={VD_MQB_X[2]} y={436} show={s >= 1}>—</VD_Chip>
      <VD_Chip x={VD_MQB_X[3]} y={436} show={s >= 1}>—</VD_Chip>
      <VD_Chip x={VD_MQB_X[4]} y={436} show={s >= 1} tone={c.bad} fill={c.badSoft}>
        paid
      </VD_Chip>
      <At x={120} y={494} w={1220}>
        <Fade show={s >= 1} delay={300}>
          <div style={{ fontSize: 24 }}>
            Accepted paid observations: 1 of <M>q</M> = 4. The quote stays unpaid on every member.
          </div>
        </Fade>
      </At>
      <At x={120} y={560}>
        <Fade show={s >= 2}>
          <VD_Cap>Status answers</VD_Cap>
        </Fade>
      </At>
      <VD_Chip x={VD_MQB_X[0]} y={596} show={s >= 2}>unpaid</VD_Chip>
      <VD_Chip x={VD_MQB_X[1]} y={596} show={s >= 2} delay={40}>unpaid</VD_Chip>
      <VD_Chip x={VD_MQB_X[2]} y={596} show={s >= 2} delay={80}>unpaid</VD_Chip>
      <VD_Chip x={VD_MQB_X[3]} y={596} show={s >= 2} delay={120}>unpaid</VD_Chip>
      <VD_Chip x={VD_MQB_X[4]} y={596} show={s >= 2} delay={160} tone={c.bad} fill={c.badSoft}>
        paid
      </VD_Chip>
      <At x={120} y={654} w={1220}>
        <Fade show={s >= 2} delay={300}>
          <div style={{ fontSize: 24 }}>
            unpaid × 4 ≥ <M>t</M> = 3, paid × 1. The wallet reads unpaid.
          </div>
        </Fade>
      </At>
      <At x={120} y={720}>
        <Fade show={s >= 3}>
          <VD_Cap>Mint request</VD_Cap>
        </Fade>
      </At>
      <VD_Chip x={VD_MQB_X[0]} y={756} show={s >= 3} mono size={21}>PendingQuote</VD_Chip>
      <VD_Chip x={VD_MQB_X[1]} y={756} show={s >= 3} mono size={21} delay={40}>PendingQuote</VD_Chip>
      <VD_Chip x={VD_MQB_X[2]} y={756} show={s >= 3} mono size={21} delay={80}>PendingQuote</VD_Chip>
      <VD_Chip x={VD_MQB_X[3]} y={756} show={s >= 3} mono size={21} delay={120}>PendingQuote</VD_Chip>
      <VD_Chip x={VD_MQB_X[4]} y={756} show={s >= 3} delay={160} tone={c.bad} fill={c.badSoft}>
        <M>C′₅</M>
      </VD_Chip>
      <At x={120} y={814} w={1220}>
        <Fade show={s >= 3} delay={300}>
          <div style={{ fontSize: 24 }}>
            Shares: 1 &lt; <M>t</M> = 3. No signature.
          </div>
        </Fade>
      </At>
      <At x={120} y={876} w={1220}>
        <Fade show={s >= 4}>
          <Note>
            <M>q ≥ c</M>: of <M>q</M> matching observations at most <M>f</M> are Byzantine, so at least 3 are honest.{' '}
            <M>t ≥ f + 1</M>: any <M>t</M> identical answers include an honest member.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          m5 submits a paid observation for an unpaid invoice.
        </StepItem>
        <StepItem n={2} step={s}>
          m5 answers paid; the wallet needs <M>t</M> identical answers.
        </StepItem>
        <StepItem n={3} step={s}>
          Honest members wait for paid; m5 alone returns 1 share.
        </StepItem>
        <StepItem n={4} step={s}>
          The thresholds leave each decision to honest members.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_MQC_W = [420, 560, 700];

const VD_MqCompare: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const call = (verb: string, path: string) => (
    <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.45 }}>
      <div style={{ color: c.muted }}>{verb}</div>
      <div>{path}</div>
    </div>
  );
  return (
    <VarShell of={VD_MQ_OF} lens="Framing: before and after" title="One mint vs a federation: the same wallet calls" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VD_Tr head>
          <VD_Td head w={VD_MQC_W[0]}>Wallet call (NUT-04, NUT-23)</VD_Td>
          <VD_Td head w={VD_MQC_W[1]}>One mint</VD_Td>
          <VD_Td head w={VD_MQC_W[2]}>
            Federation of <span style={{ textTransform: 'none' }}>n</span> members
          </VD_Td>
        </VD_Tr>
        <VD_Tr on={s === 1}>
          <VD_Td w={VD_MQC_W[0]}>{call('POST', '/v1/mint/quote/bolt11')}</VD_Td>
          <VD_Td w={VD_MQC_W[1]} size={24}>
            The mint creates an invoice and stores the quote.
          </VD_Td>
          <VD_Td w={VD_MQC_W[2]} size={24}>
            <Fade show={s >= 1}>
              Tried on one member at a time. That member's <VD_Mono size={22}>MintQuote</VD_Mono> goes through
              consensus; the wallet checks that <M>t</M> members see it.
            </Fade>
          </VD_Td>
        </VD_Tr>
        <VD_Tr on={s === 2}>
          <VD_Td w={VD_MQC_W[0]} color={c.muted} size={24}>
            wallet pays the invoice
          </VD_Td>
          <VD_Td w={VD_MQC_W[1]} size={24}>
            The mint's backend marks the quote paid.
          </VD_Td>
          <VD_Td w={VD_MQC_W[2]} size={24}>
            <Fade show={s >= 2}>
              Each member checks its backend and submits an observation. Paid after <M>q</M> matching ones.
            </Fade>
          </VD_Td>
        </VD_Tr>
        <VD_Tr on={s === 3}>
          <VD_Td w={VD_MQC_W[0]}>{call('GET', '/v1/mint/quote/bolt11/{id}')}</VD_Td>
          <VD_Td w={VD_MQC_W[1]} size={24}>
            One response.
          </VD_Td>
          <VD_Td w={VD_MQC_W[2]} size={24}>
            <Fade show={s >= 3}>
              Sent to all <M>n</M>; accepted when <M>t</M> responses are identical.
            </Fade>
          </VD_Td>
        </VD_Tr>
        <VD_Tr on={s === 4}>
          <VD_Td w={VD_MQC_W[0]}>{call('POST', '/v1/mint/bolt11')}</VD_Td>
          <VD_Td w={VD_MQC_W[1]} size={24}>
            One blind signature per output: <M>C′ = k·B′</M>.
          </VD_Td>
          <VD_Td w={VD_MQC_W[2]} size={24}>
            <Fade show={s >= 4}>
              Sent to all <M>n</M>; <VD_Mono size={22}>Mint</VD_Mono> is ordered, locked on the quote id; each member
              returns <M>C′ᵢ = kᵢ·B′</M>; the wallet checks and interpolates <M>t</M> of them.
            </Fade>
          </VD_Td>
        </VD_Tr>
      </At>
      <At x={120} y={800} w={1680}>
        <Fade show={s >= 4} delay={400}>
          <Note>
            Unchanged: the wallet's calls and the proofs it ends up with. The federated connector sits under the wallet
            and returns ordinary Cashu responses.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.3 Network topology
// ═════════════════════════════════════════════════════════════════════════════

const VD_TP_OF = '1.3 Network topology';

const VD_TopoBeginner: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  const W = { x: 420, y: 600 };
  const star = [0, 1, 2, 3, 4].map((i) => ring(W.x, W.y, 210, i));
  const mesh = [0, 1, 2, 3, 4].map((i) => ring(1040, 600, 200, i));
  const pairs: [number, number][] = [];
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) pairs.push([i, j]);
  const signers = [0, 1, 3];
  return (
    <VarShell of={VD_TP_OF} lens="Beginner" title="Two networks between the same five members" proc={proc}>
      <At x={220} y={292} w={400} style={{ textAlign: 'center' }}>
        <VD_Cap color={c.cool}>Public plane</VD_Cap>
      </At>
      <At x={840} y={292} w={400} style={{ textAlign: 'center' }}>
        <Fade show={s >= 2} dimTo={0.35}>
          <VD_Cap color={c.violet}>Private plane</VD_Cap>
        </Fade>
      </At>
      <Canvas>
        {star.map((p, i) => {
          const e = VD_seg(W.x, W.y, p.x, p.y, 56, 36);
          return (
            <g key={`s${i}`}>
              <Draw {...e} show={s >= 1} color={c.cool} width={2} delay={i * 50} dur={600} />
              <Packet {...e} run={proc.anim && s === 1} delay={500 + i * 50} />
              <Packet
                x1={e.x2}
                y1={e.y2}
                x2={e.x1}
                y2={e.y1}
                run={proc.anim && s === 4 && signers.includes(i)}
                color={c.clayHex}
                delay={200 + i * 60}
              />
            </g>
          );
        })}
        {pairs.map(([i, j]) => {
          const e = VD_seg(mesh[i].x, mesh[i].y, mesh[j].x, mesh[j].y, 36, 36);
          return (
            <line
              key={`p${i}${j}`}
              {...e}
              style={{
                stroke: c.violet,
                strokeWidth: 1.75,
                strokeDasharray: '4 6',
                opacity: s >= 2 ? 0.8 : 0,
                animation: proc.anim && s === 3 ? 'fc-flow 2.4s linear infinite' : 'none',
                transition: `opacity 500ms ${EASE_OUT}`,
              }}
            />
          );
        })}
        <WalletNode x={W.x} y={W.y} r={56} />
        {star.map((p, i) => (
          <Member key={`a${i}`} x={p.x} y={p.y} r={36} label={`m${i + 1}`} tone={s >= 4 && signers.includes(i) ? 'on' : 'idle'} />
        ))}
        {mesh.map((p, i) => (
          <Member key={`b${i}`} x={p.x} y={p.y} r={36} label={`m${i + 1}`} tone={s === 3 ? 'on' : 'idle'} />
        ))}
        <T x={W.x} y={W.y + 118} size={34} font="math" color={c.clayHex} show={s >= 4} delay={900}>
          C′
        </T>
      </Canvas>
      <At x={220} y={850} w={400} style={{ textAlign: 'center' }}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 26 }}>
            <M>n</M> = 5 links
          </div>
          <div style={{ fontSize: 22, color: c.muted }}>wallet to each member</div>
        </Fade>
      </At>
      <At x={840} y={850} w={400} style={{ textAlign: 'center' }}>
        <Fade show={s >= 2}>
          <div style={{ fontSize: 26 }}>
            <M>n(n − 1)/2</M> = 10 links
          </div>
          <div style={{ fontSize: 22, color: c.muted }}>every pair of members</div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet sends the same request to each member's public URL.
        </StepItem>
        <StepItem n={2} step={s}>
          Members also connect to each other, on a private network. Wallets never use it.
        </StepItem>
        <StepItem n={3} step={s}>
          There they agree on one order of operations before anyone signs.
        </StepItem>
        <StepItem n={4} step={s}>
          Each member answers the wallet with its share; <M>t</M> = 3 shares make one signature.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>
          <M>n</M> = 5 members, signing threshold <M>t</M> = 3.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VD_Bullet = ({ children, on = true }: { children: ReactNode; on?: boolean }) => (
  <div style={{ display: 'flex', gap: 12, fontSize: 23, lineHeight: 1.4, marginTop: 8, color: on ? c.ink : c.muted }}>
    <span style={{ color: c.clayHex, fontFamily: MONO }}>–</span>
    <span>{children}</span>
  </div>
);

const VD_TopoAdvanced: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VD_TP_OF} lens="Advanced" title="The private plane: signing, replay, routes" proc={proc}>
      <At x={120} y={262} w={800}>
        <Fade show={s >= 1} dimTo={0.3}>
          <VD_Cap color={s === 1 ? c.clayHex : c.muted}>Every request on /federation/v1 is signed</VD_Cap>
          <div
            style={{
              marginTop: 12,
              border: `1.5px solid ${s === 1 ? c.clayHex : c.rule}`,
              borderRadius: 12,
              background: c.card,
              padding: '14px 24px',
              transition: `border-color 300ms ${EASE_OUT}`,
            }}
          >
            <VD_Ln>{'FederationSignedRequest<T> {'}</VD_Ln>
            <VD_Ln>{'  version, federation_id,'}</VD_Ln>
            <VD_Ln>{'  sender, receiver,'}</VD_Ln>
            <VD_Ln>{'  sequence, kind,'}</VD_Ln>
            <VD_Ln>{'  body_hash, payload,'}</VD_Ln>
            <VD_Ln>
              {'  signature,'}
              <span style={{ color: c.muted }}>{'  // Schnorr, sender identity key'}</span>
            </VD_Ln>
            <VD_Ln>{'}'}</VD_Ln>
          </div>
          <div style={{ fontSize: 23, lineHeight: 1.4, color: c.muted, marginTop: 12 }}>
            Identity keys come from the roster in the federation config; the kind is covered by the signature.
          </div>
        </Fade>
      </At>
      <At x={980} y={262} w={820}>
        <Fade show={s >= 2} dimTo={0.3}>
          <VD_Cap color={s === 2 ? c.clayHex : c.muted}>Replay, by message class</VD_Cap>
          <VD_Bullet>Effectful DKG messages: durable replay state.</VD_Bullet>
          <VD_Bullet>Status, catch-up, readiness, AlephBFT: per-kind volatile windows.</VD_Bullet>
          <VD_Bullet>
            <VD_Mono size={22}>SubmitOperation</VD_Mono>: no transport watermark; the operation ID makes retries
            idempotent.
          </VD_Bullet>
        </Fade>
      </At>
      <At x={980} y={532} w={820}>
        <Fade show={s >= 3} dimTo={0.3}>
          <VD_Cap color={s === 3 ? c.clayHex : c.muted}>Transport and admission</VD_Cap>
          <VD_Bullet>
            HTTPS or iroh (<VD_Mono size={22}>iroh://&lt;endpoint-id&gt;</VD_Mono>), same routes.
          </VD_Bullet>
          <VD_Bullet>DKG secret shares refuse plain HTTP except explicit loopback development.</VD_Bullet>
          <VD_Bullet>Body limits: DKG routes 1 MiB, FROST signing 512 KiB.</VD_Bullet>
          <VD_Bullet>Public submit routes fail closed while the member lags, catches up or is halted.</VD_Bullet>
        </Fade>
      </At>
      <At x={120} y={806} w={1680}>
        <Fade show={s >= 4} dimTo={0.3}>
          <VD_Cap color={s === 4 ? c.clayHex : c.muted}>Routes under /federation/v1</VD_Cap>
          <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.55, marginTop: 8 }}>
            operations · aleph-bft/{'{activity, messages, backup}'} · journal · checkpoints/
            {'{summary, fetch, signature, quorum, audit}'} · status · config · dkg/
            {'{readiness, commitments, reveals, secret-shares, transcript-signatures, activations}'} · dkg/frost/
            {'{round1, round2, confirmations}'} · frost/signing/{'{commitments, packages, aborts, results}'}
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_TopoGraphical: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  const W = { x: 400, y: 600 };
  const ys = [320, 460, 600, 740, 880];
  const MX = 1000;
  const off = (i: number) => s >= 4 && (i === 3 || i === 4);
  const signers = [0, 1, 2];
  const pairs: [number, number][] = [];
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) pairs.push([i, j]);
  return (
    <VarShell of={VD_TP_OF} lens="Graphical" title="Star and mesh" proc={proc}>
      <Canvas>
        {pairs.map(([i, j]) => {
          const dy = ys[j] - ys[i];
          return (
            <path
              key={`a${i}${j}`}
              d={`M ${MX + 40} ${ys[i]} Q ${MX + 40 + dy * 0.8} ${(ys[i] + ys[j]) / 2} ${MX + 40} ${ys[j]}`}
              style={{
                fill: 'none',
                stroke: c.violet,
                strokeWidth: 2.25,
                strokeDasharray: '4 6',
                opacity: s >= 2 ? (off(i) || off(j) ? 0.15 : 0.85) : 0,
                animation: proc.anim && s >= 2 ? 'fc-flow 2.4s linear infinite' : 'none',
                transition: `opacity 500ms ${EASE_OUT}`,
              }}
            />
          );
        })}
        {ys.map((y, i) => {
          const e = VD_seg(W.x, W.y, MX, y, 56, 40);
          return (
            <g key={`w${i}`}>
              <Line {...e} color={c.cool} width={2} opacity={s >= 1 ? (off(i) ? 0.12 : 0.7) : 0.12} />
              <Packet {...e} run={proc.anim && s === 1} delay={i * 60} />
              <Packet x1={e.x2} y1={e.y2} x2={e.x1} y2={e.y1} run={proc.anim && s === 3 && signers.includes(i)} color={c.clayHex} delay={i * 80} />
            </g>
          );
        })}
        <WalletNode x={W.x} y={W.y} r={56} />
        {ys.map((y, i) => (
          <Member key={`m${i}`} x={MX} y={y} r={40} label={`m${i + 1}`} tone={off(i) ? 'off' : s === 3 && signers.includes(i) ? 'on' : 'idle'} />
        ))}
        <T x={W.x} y={W.y - 90} size={42} font="math" color={c.clayHex} show={s >= 3} delay={700}>
          C′
        </T>
        <T x={640} y={300} size={22} color={c.cool} show={s >= 1}>
          public
        </T>
        <T x={1300} y={596} size={22} color={c.violet} anchor="start" show={s >= 2}>
          private
        </T>
        <T x={1300} y={626} size={21} font="mono" color={c.violet} anchor="start" show={s >= 2}>
          /federation/v1
        </T>
      </Canvas>
      <At x={1520} y={360} w={280}>
        <Fade show={s >= 3}>
          <div style={{ fontFamily: MATH, fontStyle: 'italic', fontSize: 52, color: c.clayHex }}>t = 3</div>
          <div style={{ fontSize: 22, color: c.muted }}>shares per signature</div>
        </Fade>
      </At>
      <At x={1520} y={560} w={280}>
        <Fade show={s >= 2}>
          <div
            style={{
              fontFamily: MATH,
              fontStyle: 'italic',
              fontSize: 52,
              color: s >= 4 ? c.bad : c.violet,
              transition: `color 300ms ${EASE_OUT}`,
            }}
          >
            c = 4
          </div>
          <div style={{ fontSize: 22, color: c.muted }}>members to order</div>
        </Fade>
      </At>
      <At x={1520} y={740} w={280}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 30, color: c.bad }}>3 online</div>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_TPT_W = [440, 170, 640, 430];

const VD_TopoTable: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  const pub = <span style={{ color: c.cool }}>public</span>;
  const priv = <span style={{ color: c.violet }}>private</span>;
  return (
    <VarShell of={VD_TP_OF} lens="Explained via message types" title="Both planes as a table of messages" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VD_Tr head>
          <VD_Td head w={VD_TPT_W[0]}>Message</VD_Td>
          <VD_Td head w={VD_TPT_W[1]}>Plane</VD_Td>
          <VD_Td head w={VD_TPT_W[2]}>Route</VD_Td>
          <VD_Td head w={VD_TPT_W[3]}>From → to</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1}>
          <VD_Td w={VD_TPT_W[0]}>Mint, swap, melt, restore</VD_Td>
          <VD_Td w={VD_TPT_W[1]}>{pub}</VD_Td>
          <VD_Td w={VD_TPT_W[2]} mono>
            /v1/mint/{'{method}'}, /v1/swap, /v1/melt/{'{method}'}, /v1/restore
          </VD_Td>
          <VD_Td w={VD_TPT_W[3]}>
            wallet → all <M>n</M>
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1} delay={60}>
          <VD_Td w={VD_TPT_W[0]}>Quote creation</VD_Td>
          <VD_Td w={VD_TPT_W[1]}>{pub}</VD_Td>
          <VD_Td w={VD_TPT_W[2]} mono>
            /v1/mint/quote/{'{method}'}, /v1/melt/quote/{'{method}'}
          </VD_Td>
          <VD_Td w={VD_TPT_W[3]}>wallet → one member at a time</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1} delay={120}>
          <VD_Td w={VD_TPT_W[0]}>Quote status</VD_Td>
          <VD_Td w={VD_TPT_W[1]}>{pub}</VD_Td>
          <VD_Td w={VD_TPT_W[2]} mono>
            GET /v1/{'{mint,melt}'}/quote/{'{method}'}/{'{id}'}
          </VD_Td>
          <VD_Td w={VD_TPT_W[3]}>
            wallet → all <M>n</M>
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2}>
          <VD_Td w={VD_TPT_W[0]}>Operation envelope</VD_Td>
          <VD_Td w={VD_TPT_W[1]}>{priv}</VD_Td>
          <VD_Td w={VD_TPT_W[2]} mono>
            /federation/v1/operations
          </VD_Td>
          <VD_Td w={VD_TPT_W[3]}>member → peers</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2} delay={60}>
          <VD_Td w={VD_TPT_W[0]}>AlephBFT units</VD_Td>
          <VD_Td w={VD_TPT_W[1]}>{priv}</VD_Td>
          <VD_Td w={VD_TPT_W[2]} mono>
            …/aleph-bft/{'{messages, activity, backup}'}
          </VD_Td>
          <VD_Td w={VD_TPT_W[3]}>member ↔ member</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2} delay={120}>
          <VD_Td w={VD_TPT_W[0]}>Catch-up, checkpoints</VD_Td>
          <VD_Td w={VD_TPT_W[1]}>{priv}</VD_Td>
          <VD_Td w={VD_TPT_W[2]} mono>
            …/journal, …/checkpoints/*
          </VD_Td>
          <VD_Td w={VD_TPT_W[3]}>member → peers</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3}>
          <VD_Td w={VD_TPT_W[0]}>BLS and FROST key generation</VD_Td>
          <VD_Td w={VD_TPT_W[1]}>{priv}</VD_Td>
          <VD_Td w={VD_TPT_W[2]} mono>
            …/dkg/*
          </VD_Td>
          <VD_Td w={VD_TPT_W[3]}>member → every member</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3} delay={60}>
          <VD_Td w={VD_TPT_W[0]}>FROST signing</VD_Td>
          <VD_Td w={VD_TPT_W[1]}>{priv}</VD_Td>
          <VD_Td w={VD_TPT_W[2]} mono>
            …/frost/signing/*
          </VD_Td>
          <VD_Td w={VD_TPT_W[3]}>coordinator → selected signers</VD_Td>
        </VD_Tr>
      </At>
      <At x={120} y={850} w={1680}>
        <Fade show={s >= 3} delay={200}>
          <Note>
            Not consensus items: wallet fan-out, key generation, FROST rounds, status and catch-up. Consensus orders the
            facts they depend on.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_UrlChip = ({ y, label, s }: { y: number; label: string; s: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 640,
      top: y,
      width: 300,
      height: 60,
      boxSizing: 'border-box',
      border: `1.5px solid ${s === 2 || s === 3 ? c.cool : c.rule}`,
      background: c.card,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      padding: '0 18px',
      gap: 14,
      fontSize: 22,
      transition: `border-color 300ms ${EASE_OUT}`,
    }}
  >
    <span style={{ fontFamily: MONO }}>{label}</span>
    <span style={{ color: c.muted }}>public URL</span>
  </div>
);

const VD_TopoWallet: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const ys = [300, 390, 480, 570, 660];
  return (
    <VarShell of={VD_TP_OF} lens="Perspective: wallet" title="What the wallet sees" proc={proc}>
      <VD_Box x={120} y={290} w={400} h={440} on={s === 1} tone={c.cool} pad="18px 24px">
        <VD_Cap color={c.cool}>Wallet holds</VD_Cap>
        <Fade show={s >= 1} dimTo={0.25}>
          <div style={{ fontSize: 23, lineHeight: 1.55, marginTop: 10 }}>
            <div>federation ID</div>
            <div>
              <M>n</M> public mint URLs
            </div>
            <div>
              thresholds <M>t</M>, <M>c</M>
            </div>
            <div>
              <M>K</M> per amount
            </div>
            <div>
              <M>Kᵢ</M> per member and amount
            </div>
          </div>
          <div style={{ fontSize: 22, lineHeight: 1.4, color: c.muted, marginTop: 14 }}>
            from the invite code, checked on import
          </div>
        </Fade>
      </VD_Box>
      <Canvas>
        {ys.map((y, i) => (
          <g key={`l${i}`}>
            <Line x1={520} y1={510} x2={640} y2={y + 30} color={c.cool} opacity={s >= 2 ? 0.7 : 0.2} />
            <Packet x1={520} y1={510} x2={640} y2={y + 30} run={proc.anim && s === 2} delay={i * 50} />
            <Packet x1={640} y1={y + 30} x2={520} y2={510} run={proc.anim && s === 3} color={c.clayHex} delay={i * 70} />
          </g>
        ))}
      </Canvas>
      <VD_UrlChip y={ys[0]} label="m1" s={s} />
      <VD_UrlChip y={ys[1]} label="m2" s={s} />
      <VD_UrlChip y={ys[2]} label="m3" s={s} />
      <VD_UrlChip y={ys[3]} label="m4" s={s} />
      <VD_UrlChip y={ys[4]} label="m5" s={s} />
      <div
        style={{
          position: 'absolute',
          left: 990,
          top: 290,
          width: 340,
          height: 440,
          boxSizing: 'border-box',
          border: `1.75px dashed ${c.violet}`,
          borderRadius: 12,
          background: c.panel,
          padding: '18px 22px',
          opacity: s >= 4 ? 1 : 0.45,
          transition: `opacity 400ms ${EASE_OUT}`,
        }}
      >
        <VD_Cap color={c.violet}>/federation/v1</VD_Cap>
        <div style={{ fontSize: 23, lineHeight: 1.6, color: c.muted, marginTop: 10 }}>
          <div>operation order</div>
          <div>payment observations</div>
          <div>AlephBFT units</div>
          <div>catch-up</div>
          <div>DKG messages</div>
        </div>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 23, color: c.violet, marginTop: 16 }}>not visible to the wallet</div>
        </Fade>
      </div>
      <At x={120} y={780} w={1220}>
        <Fade show={s >= 3}>
          <VD_Cap>Checks the wallet makes itself</VD_Cap>
          <div style={{ fontSize: 24, lineHeight: 1.5, marginTop: 8 }}>
            each share against <M>Kᵢ</M> · <M>t</M> identical quote statuses · the unblinded signature against{' '}
            <M>K</M>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          From the invite code: federation ID, member URLs, thresholds and public keys.
        </StepItem>
        <StepItem n={2} step={s}>
          Every signing request goes to <M>n</M> public URLs.
        </StepItem>
        <StepItem n={3} step={s}>
          Each member answers on its own; the wallet checks every answer.
        </StepItem>
        <StepItem n={4} step={s}>
          Ordering, observations and key generation happen where the wallet cannot see them.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_TPL_W = [400, 250, 180, 180, 190];

const VD_Mark = ({ ok, show }: { ok: boolean; show: boolean }) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 26,
      color: ok ? c.good : c.bad,
      opacity: show ? 1 : 0,
      transition: `opacity 400ms ${EASE_OUT}`,
    }}
  >
    {ok ? '✓' : '✗'}
  </span>
);

const VD_TopoLiveness: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const hi = (k: number) => (s === k ? c.clayHex : undefined);
  return (
    <VarShell of={VD_TP_OF} lens="Framing: liveness as counting" title="How many members each job needs" proc={proc}>
      <At x={120} y={252} w={1220}>
        <Note>
          <M>n</M> = 5, so <M>f</M> = ⌊(<M>n</M> − 1)/3⌋ = 1 and <M>c</M> = 4. Chosen here: <M>t</M> = 3,{' '}
          <M>q</M> = 4.
        </Note>
      </At>
      <At x={120} y={306} w={1200}>
        <VD_Tr head>
          <VD_Td head w={VD_TPL_W[0]}>Job</VD_Td>
          <VD_Td head w={VD_TPL_W[1]}>Needs</VD_Td>
          <VD_Td head w={VD_TPL_W[2]} center color={hi(1)}>
            5 online
          </VD_Td>
          <VD_Td head w={VD_TPL_W[3]} center color={hi(2)}>
            4 online
          </VD_Td>
          <VD_Td head w={VD_TPL_W[4]} center color={hi(3)}>
            3 online
          </VD_Td>
        </VD_Tr>
        <VD_Tr>
          <VD_Td w={VD_TPL_W[0]}>Key generation (DKG)</VD_Td>
          <VD_Td w={VD_TPL_W[1]}>
            all <M>n</M> = 5
          </VD_Td>
          <VD_Td w={VD_TPL_W[2]} center>
            <VD_Mark ok show={s >= 1} />
          </VD_Td>
          <VD_Td w={VD_TPL_W[3]} center>
            <VD_Mark ok={false} show={s >= 2} />
          </VD_Td>
          <VD_Td w={VD_TPL_W[4]} center>
            <VD_Mark ok={false} show={s >= 3} />
          </VD_Td>
        </VD_Tr>
        <VD_Tr>
          <VD_Td w={VD_TPL_W[0]}>Ordering (AlephBFT)</VD_Td>
          <VD_Td w={VD_TPL_W[1]}>
            <M>c</M> = 4
          </VD_Td>
          <VD_Td w={VD_TPL_W[2]} center>
            <VD_Mark ok show={s >= 1} />
          </VD_Td>
          <VD_Td w={VD_TPL_W[3]} center>
            <VD_Mark ok show={s >= 2} />
          </VD_Td>
          <VD_Td w={VD_TPL_W[4]} center>
            <VD_Mark ok={false} show={s >= 3} />
          </VD_Td>
        </VD_Tr>
        <VD_Tr>
          <VD_Td w={VD_TPL_W[0]}>Quote becomes paid</VD_Td>
          <VD_Td w={VD_TPL_W[1]}>
            <M>q</M> = 4 observers
          </VD_Td>
          <VD_Td w={VD_TPL_W[2]} center>
            <VD_Mark ok show={s >= 1} />
          </VD_Td>
          <VD_Td w={VD_TPL_W[3]} center>
            <VD_Mark ok show={s >= 2} />
          </VD_Td>
          <VD_Td w={VD_TPL_W[4]} center>
            <VD_Mark ok={false} show={s >= 3} />
          </VD_Td>
        </VD_Tr>
        <VD_Tr>
          <VD_Td w={VD_TPL_W[0]}>New signatures</VD_Td>
          <VD_Td w={VD_TPL_W[1]}>
            ordering, then <M>t</M> = 3
          </VD_Td>
          <VD_Td w={VD_TPL_W[2]} center>
            <VD_Mark ok show={s >= 1} />
          </VD_Td>
          <VD_Td w={VD_TPL_W[3]} center>
            <VD_Mark ok show={s >= 2} />
          </VD_Td>
          <VD_Td w={VD_TPL_W[4]} center>
            <VD_Mark ok={false} show={s >= 3} />
          </VD_Td>
        </VD_Tr>
      </At>
      <Canvas>
        {[0, 1, 2, 3, 4].map((i) => (
          <Member
            key={`m${i}`}
            x={300 + i * 160}
            y={680}
            r={38}
            label={`m${i + 1}`}
            tone={(s >= 2 && i === 4) || (s >= 3 && i === 3) ? 'off' : 'idle'}
          />
        ))}
      </Canvas>
      <At x={120} y={752} w={1220}>
        <Fade show={s >= 4}>
          <VD_Cap>Where the numbers come from</VD_Cap>
          <div style={{ fontSize: 24, lineHeight: 1.5, marginTop: 8 }}>
            <div>
              <M>c = n − ⌊(n − 1)/3⌋</M> · BFT-safe signing threshold <M>f + 1 ≤ t ≤ c</M>, here 2 to 4
            </div>
            <div>
              Observation quorum <M>c ≤ q ≤ n</M>, here 4 or 5 · a DKG needs every roster member throughout
            </div>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          All five online: every job runs.
        </StepItem>
        <StepItem n={2} step={s}>
          m5 offline: 4 = <M>c</M>. Ordering, observations and signing continue; a DKG cannot run.
        </StepItem>
        <StepItem n={3} step={s}>
          m4 and m5 offline: 3 &lt; <M>c</M>. Nothing new is ordered, so nothing new is signed.
        </StepItem>
        <StepItem n={4} step={s}>
          The rules behind the numbers.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_NoMeshPanel = ({ cx, s, first, mesh }: { cx: number; s: number; first: number; mesh: boolean }) => {
  const W = { x: cx, y: 360 };
  const ms = [cx - 180, cx, cx + 180];
  const live = s >= first;
  const lab: CSSProperties = { fontFamily: MATH, fontStyle: 'italic', fontSize: 26, fill: c.cool, opacity: live ? 1 : 0.3 };
  const e0 = VD_seg(W.x, W.y, ms[0], 560, 46, 40);
  const e1 = VD_seg(W.x, W.y, ms[1], 560, 46, 40);
  const e2 = VD_seg(W.x, W.y, ms[2], 560, 46, 40);
  return (
    <>
      <Line {...e0} color={c.cool} opacity={live ? 0.7 : 0.2} />
      <Line {...e1} color={c.cool} opacity={live ? 0.7 : 0.2} />
      <Line {...e2} color={c.cool} opacity={live ? 0.7 : 0.2} />
      <text x={(e0.x1 + e0.x2) / 2 - 30} y={(e0.y1 + e0.y2) / 2 + 6} textAnchor="end" style={lab}>
        A, B
      </text>
      <text x={cx + 16} y={470} style={lab}>
        B, C
      </text>
      <text x={(e2.x1 + e2.x2) / 2 + 30} y={(e2.y1 + e2.y2) / 2 + 6} textAnchor="start" style={lab}>
        C, A
      </text>
      {mesh && (
        <path
          d={`M ${ms[0]} 600 Q ${ms[1]} 690 ${ms[2]} 600 M ${ms[0] + 20} 596 Q ${(ms[0] + ms[1]) / 2} 636 ${ms[1] - 20} 596 M ${ms[1] + 20} 596 Q ${(ms[1] + ms[2]) / 2} 636 ${ms[2] - 20} 596`}
          style={{
            fill: 'none',
            stroke: c.violet,
            strokeWidth: 1.75,
            strokeDasharray: '4 6',
            opacity: live ? 0.85 : 0.15,
            transition: `opacity 400ms ${EASE_OUT}`,
          }}
        />
      )}
      <WalletNode x={W.x} y={W.y} r={46} />
      <Member x={ms[0]} y={560} r={40} label="m1" />
      <Member x={ms[1]} y={560} r={40} label="m2" />
      <Member x={ms[2]} y={560} r={40} label="m3" />
    </>
  );
};

const VD_TopoNoMesh: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VD_TP_OF} lens="Framing: failure mode" title="Fan-out without a private plane" proc={proc}>
      <At x={120} y={262} w={580} style={{ textAlign: 'center' }}>
        <VD_Cap color={c.bad}>Public plane only</VD_Cap>
      </At>
      <At x={760} y={262} w={580} style={{ textAlign: 'center' }}>
        <VD_Cap color={c.violet}>With the private plane</VD_Cap>
      </At>
      <Canvas>
        <VD_NoMeshPanel cx={410} s={s} first={1} mesh={false} />
        <VD_NoMeshPanel cx={1050} s={s} first={3} mesh />
        <line x1={730} y1={300} x2={730} y2={940} style={{ stroke: c.rule, strokeWidth: 1.5 }} />
      </Canvas>
      <At x={120} y={712} w={580}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 23, lineHeight: 1.5 }}>Each member signs the pair it was sent.</div>
        </Fade>
        <Fade show={s >= 2}>
          <div style={{ fontSize: 23, lineHeight: 1.5, marginTop: 8 }}>
            <M>A</M>, <M>B</M>, <M>C</M> each get <M>t</M> = 2 shares.
          </div>
          <div style={{ fontSize: 26, color: c.bad, marginTop: 8 }}>3 signatures, 2 paid</div>
        </Fade>
      </At>
      <At x={760} y={712} w={580}>
        <Fade show={s >= 3}>
          <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.6 }}>
            <div style={{ color: c.good }}>#1 Mint q [A, B] accepted</div>
            <div style={{ color: c.muted }}>#2 Mint q [B, C] rejected</div>
            <div style={{ color: c.muted }}>#3 Mint q [C, A] rejected</div>
          </div>
        </Fade>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 26, color: c.good, marginTop: 10 }}>only A, B can be signed</div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          <M>t</M> = 2, <M>n</M> = 3, two outputs paid. The wallet sends each member a different pair.
        </StepItem>
        <StepItem n={2} step={s}>
          Members that sign on receipt produce three valid signatures.
        </StepItem>
        <StepItem n={3} step={s}>
          With the private plane each request becomes an envelope; the first one for the quote wins.
        </StepItem>
        <StepItem n={4} step={s}>
          Members return shares only for the accepted outputs.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.4 Distributed key generation
// Toy polynomials (t = 2, n = 3): f₁ = 4 + x, f₂ = 2 + 5x, f₃ = 3 + 6x.
// f = 9 + 12x, k = 9, k₁ = 21, k₂ = 33, k₃ = 45 (computed with python).
// ═════════════════════════════════════════════════════════════════════════════

const VD_DK_OF = '1.4 Distributed key generation';
const VD_MEMC = [c.cool, c.violet, c.good];

const VD_PolyCard = ({
  x,
  i,
  poly,
  vals,
  s,
}: {
  x: number;
  i: number;
  poly: ReactNode;
  vals: [number, number, number];
  s: number;
}) => (
  <VD_Box x={x} y={262} w={380} h={196} show={s >= 1} on={s === 1 || s === 2} tone={VD_MEMC[i]} delay={i * 80} pad="14px 22px">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: MONO, fontSize: 24, color: VD_MEMC[i] }}>m{i + 1}</span>
      <M size={30} color={VD_MEMC[i]}>
        {poly}
      </M>
    </div>
    <Fade show={s >= 2} delay={i * 80}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 110px)', marginTop: 14, rowGap: 2 }}>
        <span style={{ fontSize: 21, color: c.muted }}>to m1</span>
        <span style={{ fontSize: 21, color: c.muted }}>to m2</span>
        <span style={{ fontSize: 21, color: c.muted }}>to m3</span>
        <M size={34}>{vals[0]}</M>
        <M size={34} color={s >= 2 && s <= 3 ? c.clayHex : undefined}>
          {vals[1]}
        </M>
        <M size={34}>{vals[2]}</M>
      </div>
    </Fade>
  </VD_Box>
);

const VD_DkgBeginner: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const X = (x: number) => 790 + 150 * x;
  const Y = (v: number) => 900 - 7.5 * v;
  const f = (x: number) => 9 + 12 * x;
  return (
    <VarShell of={VD_DK_OF} lens="Beginner" title="Three members build one key, with small numbers" proc={proc}>
      <VD_PolyCard x={120} i={0} poly="f₁(x) = 4 + x" vals={[5, 6, 7]} s={s} />
      <VD_PolyCard x={530} i={1} poly="f₂(x) = 2 + 5x" vals={[7, 12, 17]} s={s} />
      <VD_PolyCard x={940} i={2} poly="f₃(x) = 3 + 6x" vals={[9, 15, 21]} s={s} />
      <VD_Box x={120} y={490} w={560} h={180} show={s >= 3} on={s === 3}>
        <VD_Cap>m2 adds what it received</VD_Cap>
        <div style={{ marginTop: 8 }}>
          <M size={36}>k₂ = 6 + 12 + 15 = 33</M>
        </div>
        <div style={{ marginTop: 8 }}>
          <M size={26} color={c.muted}>
            k₁ = 5 + 7 + 9 = 21,&nbsp;&nbsp; k₃ = 7 + 17 + 21 = 45
          </M>
        </div>
      </VD_Box>
      <VD_Box x={120} y={700} w={560} h={180} show={s >= 5} on={s === 5}>
        <VD_Cap>The key</VD_Cap>
        <div style={{ marginTop: 6 }}>
          <M size={34}>k = f(0) = 4 + 2 + 3 = 9</M>
        </div>
        <div style={{ fontSize: 22, lineHeight: 1.4, color: c.muted, marginTop: 6 }}>
          Nobody computes this sum. Any two shares give it, e.g. <M>2·21 − 33 = 9</M>.
        </div>
      </VD_Box>
      <At x={120} y={900} w={560}>
        <Note style={{ fontSize: 22 }}>Integers for readability; real shares are integers mod the BLS12-381 group order.</Note>
      </At>
      <Canvas>
        <GFade show={s >= 4}>
          <line x1={X(0)} y1={900} x2={X(3.35)} y2={900} style={{ stroke: c.node, strokeWidth: 1.5 }} />
          <line x1={X(0)} y1={900} x2={X(0)} y2={515} style={{ stroke: c.node, strokeWidth: 1.5 }} />
        </GFade>
        <Draw x1={X(0)} y1={Y(f(0))} x2={X(3.3)} y2={Y(f(3.3))} show={s >= 4} width={3} />
        <T x={820} y={560} size={28} font="math" anchor="start" color={c.clayHex} show={s >= 4}>
          f = f₁ + f₂ + f₃ = 9 + 12x
        </T>
        {[1, 2, 3].map((i) => (
          <g key={`k${i}`}>
            <Dot x={X(i)} y={Y(f(i))} r={8} show={s >= 4} delay={500 + i * 80} />
            <T x={X(i) - 16} y={Y(f(i)) - 16} size={26} font="math" anchor="end" show={s >= 4} delay={500 + i * 80}>
              {`k${['₁', '₂', '₃'][i - 1]} = ${f(i)}`}
            </T>
            <T x={X(i)} y={934} size={21} font="mono" color={c.muted} show={s >= 4}>
              {`m${i}`}
            </T>
          </g>
        ))}
        <GFade show={s >= 5}>
          <circle cx={X(0)} cy={Y(9)} r={16} style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 2, strokeDasharray: '4 5' }} />
          <T x={X(0) + 26} y={Y(9) + 44} size={32} font="math" anchor="start" color={c.clayHex}>
            k
          </T>
        </GFade>
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Each member picks a random line; its constant term is that member's secret piece.
        </StepItem>
        <StepItem n={2} step={s}>
          Member <M>j</M> sends <M>f<VD_S>j</VD_S>(i)</M> to member <M>i</M>, privately.
        </StepItem>
        <StepItem n={3} step={s}>
          Each member adds the three values it received. The sum is its share.
        </StepItem>
        <StepItem n={4} step={s}>
          The shares lie on the sum of the three lines.
        </StepItem>
        <StepItem n={5} step={s}>
          The key is the sum of the constant terms. Nobody computes it.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_AdvCard = ({
  x,
  y,
  title,
  n,
  s,
  children,
}: {
  x: number;
  y: number;
  title: string;
  n: number;
  s: number;
  children: ReactNode;
}) => (
  <VD_Box x={x} y={y} w={800} h={340} show={s >= n} on={s === n} pad="16px 22px">
    <VD_Cap color={s === n ? c.clayHex : c.muted}>{title}</VD_Cap>
    <div style={{ marginTop: 4 }}>{children}</div>
  </VD_Box>
);

const VD_DkgAdvanced: Page = () => {
  const proc = useProcess(4, 2600);
  const s = proc.step;
  return (
    <VarShell of={VD_DK_OF} lens="Advanced" title="DKG in dkg.rs: checks and abort policy" proc={proc}>
      <VD_AdvCard x={120} y={258} title="Generation" n={1} s={s}>
        <VD_Bullet>
          Per amount, <M>t</M> random scalars; commitments <M>a<VD_S>j,l</VD_S>·G₂</M> with no blinding term (Feldman-style). The
          code names the method <VD_Mono size={22}>PedersenDkg</VD_Mono>.
        </VD_Bullet>
        <VD_Bullet>Evaluated at every roster member's ID, its own included; a zero evaluation is rejected.</VD_Bullet>
        <VD_Bullet>Coefficients are then dropped and zeroized; the reveal and the evaluations are kept.</VD_Bullet>
      </VD_AdvCard>
      <VD_AdvCard x={980} y={258} title="Reveal checks" n={2} s={s}>
        <VD_Bullet>The reveal must hash to the commitment sent before it (SHA-256, versioned canonical JSON).</VD_Bullet>
        <VD_Bullet>Same federation, setup authorization and ceremony ID; sender in the roster.</VD_Bullet>
        <VD_Bullet>
          Amount set equals the keyset spec; exactly <M>t</M> commitments per amount; identical specs across members.
        </VD_Bullet>
      </VD_AdvCard>
      <VD_AdvCard x={120} y={618} title="Share checks" n={3} s={s}>
        <VD_Bullet>A contribution's signer ID must be the receiver's.</VD_Bullet>
        <VD_Bullet>
          <M>f<VD_S>j</VD_S>(i)·G₂ = Σ<VD_S>l</VD_S> i<VD_P>l</VD_P>·A<VD_S>j,l</VD_S></M>, evaluated by Horner; a mismatch is{' '}
          <VD_Mono size={22}>DkgCommitmentMismatch</VD_Mono> naming <M>j</M>.
        </VD_Bullet>
        <VD_Bullet>
          <M>kᵢ = Σ<VD_S>j</VD_S> f<VD_S>j</VD_S>(i)</M>; <M>kᵢ·G₂</M> must equal <M>Kᵢ</M> from the summed commitments, else{' '}
          <VD_Mono size={22}>PrivateShareMismatch</VD_Mono>.
        </VD_Bullet>
      </VD_AdvCard>
      <VD_AdvCard x={980} y={618} title="Failure policy" n={4} s={s}>
        <VD_Bullet>Every roster member, for the whole ceremony; a timeout aborts and names who is missing.</VD_Bullet>
        <VD_Bullet>A second, different commitment or reveal from one member is an error; exact duplicates are ignored.</VD_Bullet>
        <VD_Bullet>Retry uses a new ceremony ID; the old one is recorded as aborted. Limits: 64 members, 64 amounts.</VD_Bullet>
      </VD_AdvCard>
    </VarShell>
  );
};

const VD_Val = ({
  x,
  y,
  show,
  delay = 0,
  tone = c.rule,
  fill = c.card,
  dashed = false,
  dim = false,
  children,
}: {
  x: number;
  y: number;
  show: boolean;
  delay?: number;
  tone?: string;
  fill?: string;
  dashed?: boolean;
  dim?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - 75,
      top: y - 42,
      width: 150,
      height: 84,
      boxSizing: 'border-box',
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${dashed ? c.node : tone}`,
      background: fill,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MATH,
      fontStyle: 'italic',
      fontSize: 36,
      color: dim ? c.muted : c.ink,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'scale(1)' : 'scale(0.97)',
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const VD_DKG_RX = [700, 900, 1100];
const VD_DKG_RY = [400, 520, 640];
const VD_DKG_V = [
  [5, 6, 7],
  [7, 12, 17],
  [9, 15, 21],
];

const VD_DkgGraphical: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const colOn = s === 2 || s === 3;
  return (
    <VarShell of={VD_DK_OF} lens="Graphical" title="Rows are sent, columns are summed" proc={proc}>
      <At x={345} y={300} w={150} style={{ textAlign: 'center' }}>
        <Fade show={s >= 4}>
          <M size={30} color={c.muted}>
            x = 0
          </M>
        </Fade>
      </At>
      <At x={625} y={304} w={150} style={{ textAlign: 'center', fontFamily: MONO, fontSize: 24 }}>
        m1
      </At>
      <At x={825} y={304} w={150} style={{ textAlign: 'center', fontFamily: MONO, fontSize: 24 }}>
        m2
      </At>
      <At x={1025} y={304} w={150} style={{ textAlign: 'center', fontFamily: MONO, fontSize: 24 }}>
        m3
      </At>
      <At x={1405} y={300} w={150} style={{ textAlign: 'center' }}>
        <Fade show={s >= 5}>
          <M size={30} color={c.cool}>
            A<VD_S>j,0</VD_S>
          </M>
        </Fade>
      </At>
      <At x={120} y={382} w={170}>
        <span style={{ fontFamily: MONO, fontSize: 24, color: VD_MEMC[0] }}>m1 </span>
        <M size={30} color={VD_MEMC[0]}>
          f₁
        </M>
      </At>
      <At x={120} y={502} w={170}>
        <span style={{ fontFamily: MONO, fontSize: 24, color: VD_MEMC[1] }}>m2 </span>
        <M size={30} color={VD_MEMC[1]}>
          f₂
        </M>
      </At>
      <At x={120} y={622} w={170}>
        <span style={{ fontFamily: MONO, fontSize: 24, color: VD_MEMC[2] }}>m3 </span>
        <M size={30} color={VD_MEMC[2]}>
          f₃
        </M>
      </At>
      {VD_DKG_RY.map((y, j) => (
        <div key={`r${j}`}>
          <VD_Val x={420} y={y} show={s >= 4} delay={j * 80} dashed dim>
            {[4, 2, 3][j]}
          </VD_Val>
          {VD_DKG_RX.map((x, i) => (
            <VD_Val
              key={`v${i}`}
              x={x}
              y={y}
              show={s >= 1}
              delay={j * 120 + i * 40}
              tone={colOn ? c.clayHex : VD_MEMC[j]}
              fill={colOn ? c.claySoft : c.card}
            >
              {VD_DKG_V[j][i]}
            </VD_Val>
          ))}
          <VD_Val x={1480} y={y} show={s >= 5} delay={j * 80} tone={c.cool} fill={c.coolSoft}>
            {`A${['₁', '₂', '₃'][j]},₀`}
          </VD_Val>
        </div>
      ))}
      <Canvas>
        {VD_DKG_RX.map((x, i) => (
          <Arrow key={`a${i}`} x1={x} y1={690} x2={x} y2={728} show={s >= 2} color={c.clayHex} delay={i * 80} />
        ))}
        <GFade show={s >= 4} to={0.7}>
          <line x1={420} y1={690} x2={420} y2={728} style={{ stroke: c.node, strokeWidth: 2, strokeDasharray: '4 5' }} />
        </GFade>
        <GFade show={s >= 5}>
          <line x1={1480} y1={690} x2={1480} y2={728} style={{ stroke: c.cool, strokeWidth: 2 }} />
        </GFade>
      </Canvas>
      {VD_DKG_RX.map((x, i) => (
        <VD_Val key={`k${i}`} x={x} y={784} show={s >= 3} delay={i * 80} tone={c.clayHex} fill={c.claySoft}>
          {[21, 33, 45][i]}
        </VD_Val>
      ))}
      <VD_Val x={420} y={784} show={s >= 4} delay={300} dashed dim>
        9
      </VD_Val>
      <VD_Val x={1480} y={784} show={s >= 5} delay={300} tone={c.cool} fill={c.coolSoft}>
        K
      </VD_Val>
      <At x={345} y={840} w={150} style={{ textAlign: 'center' }}>
        <Fade show={s >= 4} delay={300}>
          <M size={32} color={c.muted}>
            k
          </M>
          <div style={{ fontSize: 21, color: c.muted }}>never computed</div>
        </Fade>
      </At>
      <At x={625} y={840} w={550} style={{ display: 'flex', justifyContent: 'space-between', padding: '0 58px', boxSizing: 'border-box' }}>
        <Fade show={s >= 3}>
          <M size={32} color={c.clayHex}>
            k₁
          </M>
        </Fade>
        <Fade show={s >= 3} delay={80}>
          <M size={32} color={c.clayHex}>
            k₂
          </M>
        </Fade>
        <Fade show={s >= 3} delay={160}>
          <M size={32} color={c.clayHex}>
            k₃
          </M>
        </Fade>
      </At>
      <At x={1380} y={840} w={200} style={{ textAlign: 'center' }}>
        <Fade show={s >= 5} delay={300}>
          <div style={{ fontSize: 21, color: c.cool }}>published</div>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_DkgCode: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VD_DK_OF} lens="Explained via code" title="The same ceremony in Rust" proc={proc}>
      <At x={120} y={250} w={1220}>
        <div style={{ fontSize: 22, color: c.muted }}>
          Condensed from <VD_Mono size={22}>cdk-common/src/federation/dkg.rs</VD_Mono>; function and error names as in
          the source.
        </div>
        <div
          style={{
            marginTop: 12,
            border: `1.5px solid ${c.rule}`,
            borderRadius: 12,
            background: c.card,
            padding: '12px 24px',
          }}
        >
          <VD_Ln lh={1.5} dim>
            {'// FederationDkgParticipantState::generate_by_construction'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 1}>
            {'coefficients[amount] = (0..t).map(|_| BlsSecretKey::generate());  // a_jl'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 1}>
            {'commitments[amount]  = coefficients[amount].map(BlsSecretKey::public_key_g2);'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 2}>
            {'for receiver in roster {                               // itself included'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 2}>
            {'    shares[amount] = evaluate_secret_key_coefficients('}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 2}>
            {'        receiver.to_bls_signer_id(), &coefficients[amount])?;'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 2}>
            {'}'}
          </VD_Ln>
          <VD_Ln lh={1.5} dim>
            {'// FederationDkgCommitmentRound::derive_member_keyset_share'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 3}>
            {'for participant in participant_order {'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 3}>
            {'    let commitments = dkg_reveal_amount_commitments(reveals, participant, amount)?;'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 3}>
            {'    let expected = evaluate_public_key_commitments(signer_id, commitments)?;'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 3}>
            {'    if secret_share.public_key_share() != expected { DkgCommitmentMismatch }'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 3}>
            {'}'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 4}>
            {'let k_i = aggregate_secret_key_shares(signer_id, &participant_shares)?;'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 4}>
            {'if k_i.public_key_share() != *public_share { PrivateShareMismatch }'}
          </VD_Ln>
          <VD_Ln lh={1.5} dim>
            {'// FederationDkgCommitmentRound::derive_federated_keyset'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 5}>
            {'aggregate_coefficients[l] = aggregate_public_key_commitments(&[A_1l, .., A_nl])?;'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 5}>
            {'aggregate_keys[amount] = aggregate_coefficients[0];          // K = sum of A_j0'}
          </VD_Ln>
          <VD_Ln lh={1.5} on={s === 5}>
            {'public_share[i] = evaluate_public_key_commitments(i, &aggregate_coefficients)?;'}
          </VD_Ln>
        </div>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Sample <M>t</M> coefficients per amount; commit to each in G₂.
        </StepItem>
        <StepItem n={2} step={s}>
          Evaluate at every member's ID, its own included.
        </StepItem>
        <StepItem n={3} step={s}>
          Check each received value against the sender's commitments.
        </StepItem>
        <StepItem n={4} step={s}>
          Sum the contributions; check <M>kᵢ·G₂</M> against <M>Kᵢ</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          <M>K</M> is the sum of the constant-term commitments.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_RecRow = ({ k, children }: { k: string; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', borderBottom: `1px solid ${c.rule}`, padding: '8px 0' }}>
    <span style={{ width: 190, flexShrink: 0, fontSize: 22, color: c.muted }}>{k}</span>
    <span style={{ fontSize: 24 }}>{children}</span>
  </div>
);

const VD_Tick = ({ show, on, children }: { show: boolean; on: boolean; children: ReactNode }) => (
  <Fade show={show} style={{ marginBottom: 22 }}>
    <div style={{ display: 'flex', gap: 14, fontSize: 24, lineHeight: 1.45, color: on ? c.ink : c.muted }}>
      <span style={{ fontFamily: MONO, color: c.good }}>✓</span>
      <span>{children}</span>
    </div>
  </Fade>
);

const VD_DkgAuditor: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VD_DK_OF} lens="Perspective: auditor" title="What an auditor can recompute" proc={proc}>
      <VD_Box x={120} y={262} w={600} h={486} pad="16px 24px">
        <VD_Cap>Public ceremony record, toy values</VD_Cap>
        <div style={{ marginTop: 8 }}>
          <VD_RecRow k="hashes">
            <M>H₁, H₂, H₃</M> <span style={{ fontSize: 21, color: c.muted }}>32 B each</span>
          </VD_RecRow>
          <VD_RecRow k="reveal m1">
            <M>A₁,₀ = 42, A₁,₁ = 4</M>
          </VD_RecRow>
          <VD_RecRow k="reveal m2">
            <M>A₂,₀ = 16, A₂,₁ = 61</M>
          </VD_RecRow>
          <VD_RecRow k="reveal m3">
            <M>A₃,₀ = 64, A₃,₁ = 30</M>
          </VD_RecRow>
          <VD_RecRow k="keyset">
            <M>K = 101</M>
          </VD_RecRow>
          <VD_RecRow k="public shares">
            <M>K₁ = 57, K₂ = 47, K₃ = 35</M>
          </VD_RecRow>
          <VD_RecRow k="transcript">hash, 3 signatures</VD_RecRow>
        </div>
      </VD_Box>
      <At x={770} y={262} w={570}>
        <VD_Cap>Recomputed, mod 107</VD_Cap>
        <div style={{ marginTop: 14 }}>
          <VD_Tick show={s >= 1} on={s === 1}>
            Each reveal hashes to the commitment sent before it.
          </VD_Tick>
          <VD_Tick show={s >= 2} on={s === 2}>
            <M>K = A₁,₀·A₂,₀·A₃,₀ = 42·16·64 = 101</M>
          </VD_Tick>
          <VD_Tick show={s >= 3} on={s === 3}>
            <M>K₂ = Π<VD_S>j</VD_S> A<VD_S>j,0</VD_S>·A<VD_S>j,1</VD_S>² = 30·44·34 = 47</M>
          </VD_Tick>
          <VD_Tick show={s >= 4} on={s === 4}>
            The transcript hash recomputes; 3 Schnorr signatures verify under the roster's identity keys.
          </VD_Tick>
        </div>
      </At>
      <At x={120} y={780} w={1220}>
        <Fade show={s >= 4} delay={200}>
          <Note>
            Not in the record: the values <M>f<VD_S>j</VD_S>(i)</M>, the shares <M>kᵢ</M>, any coefficient. A member signs the
            transcript only after its own deliveries passed the check.
          </Note>
        </Fade>
        <Note style={{ fontSize: 22, marginTop: 16 }}>{VD_TOY}</Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Reveals match the hashes committed before them.
        </StepItem>
        <StepItem n={2} step={s}>
          The aggregate key follows from the constant commitments (a product in the toy group).
        </StepItem>
        <StepItem n={3} step={s}>
          Every public share follows from the reveals.
        </StepItem>
        <StepItem n={4} step={s}>
          The transcript hash and all <M>n</M> signatures verify.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_KN_W = [560, 230, 230, 230, 430];

const VD_DkgKnows: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  const dash = <span style={{ color: c.dim }}>—</span>;
  const yes = <span style={{ color: c.good }}>✓</span>;
  return (
    <VarShell of={VD_DK_OF} lens="Focus: who knows what" title="Who knows what after the ceremony" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VD_Tr head>
          <VD_Td head w={VD_KN_W[0]}>Item (toy values)</VD_Td>
          <VD_Td head w={VD_KN_W[1]} color={VD_MEMC[0]}>
            <span style={{ textTransform: 'none' }}>m1</span>
          </VD_Td>
          <VD_Td head w={VD_KN_W[2]} color={VD_MEMC[1]}>
            <span style={{ textTransform: 'none' }}>m2</span>
          </VD_Td>
          <VD_Td head w={VD_KN_W[3]} color={VD_MEMC[2]}>
            <span style={{ textTransform: 'none' }}>m3</span>
          </VD_Td>
          <VD_Td head w={VD_KN_W[4]}>Wallets, auditors</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1}>
          <VD_Td w={VD_KN_W[0]}>Own polynomial, until evaluated</VD_Td>
          <VD_Td w={VD_KN_W[1]}>
            <M>4 + x</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[2]}>
            <M>2 + 5x</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[3]}>
            <M>3 + 6x</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[4]}>{dash}</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1} delay={60}>
          <VD_Td w={VD_KN_W[0]}>Values it sent to m1, m2, m3</VD_Td>
          <VD_Td w={VD_KN_W[1]}>
            <M>5, 6, 7</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[2]}>
            <M>7, 12, 17</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[3]}>
            <M>9, 15, 21</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[4]}>{dash}</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1} delay={120}>
          <VD_Td w={VD_KN_W[0]}>Values it received</VD_Td>
          <VD_Td w={VD_KN_W[1]}>
            <M>5, 7, 9</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[2]}>
            <M>6, 12, 15</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[3]}>
            <M>7, 17, 21</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[4]}>{dash}</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1} delay={180}>
          <VD_Td w={VD_KN_W[0]}>
            Own share <M>kᵢ</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[1]}>
            <M>21</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[2]}>
            <M>33</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[3]}>
            <M>45</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[4]}>{dash}</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2}>
          <VD_Td w={VD_KN_W[0]}>
            Commitments <M>A<VD_S>j,l</VD_S></M>
          </VD_Td>
          <VD_Td w={VD_KN_W[1]}>{yes}</VD_Td>
          <VD_Td w={VD_KN_W[2]}>{yes}</VD_Td>
          <VD_Td w={VD_KN_W[3]}>{yes}</VD_Td>
          <VD_Td w={VD_KN_W[4]}>{yes} in the transcript</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2} delay={60}>
          <VD_Td w={VD_KN_W[0]}>
            <M>K</M> and every <M>Kᵢ</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[1]}>{yes}</VD_Td>
          <VD_Td w={VD_KN_W[2]}>{yes}</VD_Td>
          <VD_Td w={VD_KN_W[3]}>{yes}</VD_Td>
          <VD_Td w={VD_KN_W[4]}>{yes} keyset, public shares</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3}>
          <VD_Td w={VD_KN_W[0]}>Another member's share</VD_Td>
          <VD_Td w={VD_KN_W[1]}>{dash}</VD_Td>
          <VD_Td w={VD_KN_W[2]}>{dash}</VD_Td>
          <VD_Td w={VD_KN_W[3]}>{dash}</VD_Td>
          <VD_Td w={VD_KN_W[4]}>{dash}</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3} delay={60}>
          <VD_Td w={VD_KN_W[0]}>
            <M>k = f(0)</M>
          </VD_Td>
          <VD_Td w={VD_KN_W[1]}>{dash}</VD_Td>
          <VD_Td w={VD_KN_W[2]}>{dash}</VD_Td>
          <VD_Td w={VD_KN_W[3]}>{dash}</VD_Td>
          <VD_Td w={VD_KN_W[4]}>{dash}</VD_Td>
        </VD_Tr>
      </At>
      <At x={120} y={830} w={1680}>
        <Fade show={s >= 3} delay={200}>
          <Note>
            <M>k</M> = 9 here only because we chose the lines; no party adds 4 + 2 + 3. Coefficients are zeroized after
            evaluation; the evaluations stay in the sender's participant state so it can resend them.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_CO_W = [470, 280, 220, 230];

const VD_DkgCost: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const fm = (x: ReactNode) => <M>{x}</M>;
  return (
    <VarShell of={VD_DK_OF} lens="Framing: cost and sizes" title="What one ceremony exchanges" proc={proc}>
      <At x={120} y={252} w={1220}>
        <Note>
          <M>A</M> = 64 amounts, the per-keyset maximum. One polynomial per amount per member.
        </Note>
      </At>
      <At x={120} y={306} w={1200}>
        <VD_Tr head>
          <VD_Td head w={VD_CO_W[0]}>Quantity</VD_Td>
          <VD_Td head w={VD_CO_W[1]}>Formula</VD_Td>
          <VD_Td head w={VD_CO_W[2]}>
            <M size={24}>n = 3, t = 2</M>
          </VD_Td>
          <VD_Td head w={VD_CO_W[3]}>
            <M size={24}>n = 5, t = 3</M>
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1}>
          <VD_Td w={VD_CO_W[0]}>Polynomials</VD_Td>
          <VD_Td w={VD_CO_W[1]}>{fm('n·A')}</VD_Td>
          <VD_Td w={VD_CO_W[2]}>192</VD_Td>
          <VD_Td w={VD_CO_W[3]}>320</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1} delay={60}>
          <VD_Td w={VD_CO_W[0]}>Secret coefficients, then zeroized</VD_Td>
          <VD_Td w={VD_CO_W[1]}>{fm('n·A·t')}</VD_Td>
          <VD_Td w={VD_CO_W[2]}>384</VD_Td>
          <VD_Td w={VD_CO_W[3]}>960</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2}>
          <VD_Td w={VD_CO_W[0]}>Public G₂ commitments</VD_Td>
          <VD_Td w={VD_CO_W[1]}>{fm('n·A·t')}</VD_Td>
          <VD_Td w={VD_CO_W[2]}>384</VD_Td>
          <VD_Td w={VD_CO_W[3]}>960</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2} delay={60}>
          <VD_Td w={VD_CO_W[0]}>Point data, 96 B compressed each</VD_Td>
          <VD_Td w={VD_CO_W[1]}>{fm('96·n·A·t')}</VD_Td>
          <VD_Td w={VD_CO_W[2]}>36,864 B</VD_Td>
          <VD_Td w={VD_CO_W[3]}>92,160 B</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3}>
          <VD_Td w={VD_CO_W[0]}>Private messages, self included</VD_Td>
          <VD_Td w={VD_CO_W[1]}>{fm('n²')}</VD_Td>
          <VD_Td w={VD_CO_W[2]}>9</VD_Td>
          <VD_Td w={VD_CO_W[3]}>25</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3} delay={60}>
          <VD_Td w={VD_CO_W[0]}>Scalars per message, 32 B each</VD_Td>
          <VD_Td w={VD_CO_W[1]}>{fm('A')}</VD_Td>
          <VD_Td w={VD_CO_W[2]}>64</VD_Td>
          <VD_Td w={VD_CO_W[3]}>64</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3} delay={120}>
          <VD_Td w={VD_CO_W[0]}>Commitment checks per member</VD_Td>
          <VD_Td w={VD_CO_W[1]}>{fm('n·A')}</VD_Td>
          <VD_Td w={VD_CO_W[2]}>192</VD_Td>
          <VD_Td w={VD_CO_W[3]}>320</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 4} on={s === 4}>
          <VD_Td w={VD_CO_W[0]}>Hashes, transcript signatures, activations</VD_Td>
          <VD_Td w={VD_CO_W[1]}>
            <M>n</M> each
          </VD_Td>
          <VD_Td w={VD_CO_W[2]}>3 each</VD_Td>
          <VD_Td w={VD_CO_W[3]}>5 each</VD_Td>
        </VD_Tr>
      </At>
      <At x={120} y={880} w={1220}>
        <Fade show={s >= 4} delay={200}>
          <Note>
            Private traffic grows with <M>n²</M>, public commitments with <M>n·A·t</M>. Every member must stay online for
            all of it.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Each member samples <M>t</M> coefficients for each of <M>A</M> amounts.
        </StepItem>
        <StepItem n={2} step={s}>
          Each coefficient becomes a public G₂ point in its reveal.
        </StepItem>
        <StepItem n={3} step={s}>
          One private message per sender and receiver, carrying <M>A</M> scalars.
        </StepItem>
        <StepItem n={4} step={s}>
          Closing rounds: one message per member each.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.4 DKG message flow
// Toy group: g = 4 in Z*₁₀₇, order 53. A₁ = (42, 4), A₂ = (16, 61), A₃ = (64, 30).
// f₃(2) = 15, 4¹⁵ = 34 = 64·30² mod 107; 4¹⁶ = 29. A₁,₀·A₂,₀ = 30 (computed with python).
// ═════════════════════════════════════════════════════════════════════════════

const VD_RD_OF = '1.4 DKG message flow';

const VD_RndWorked: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VD_RD_OF} lens="Beginner" title="Checking a delivered value, with small numbers" proc={proc}>
      <VD_Box x={120} y={262} w={560} h={190} show={s >= 1} on={s === 1} tone={c.good}>
        <VD_Cap>m3 publishes, in its reveal</VD_Cap>
        <div style={{ marginTop: 10 }}>
          <M size={32}>A₃,₀ = 4³ = 64</M>
        </div>
        <div style={{ marginTop: 4 }}>
          <M size={32}>A₃,₁ = 4⁶ = 30</M>
          <span style={{ fontSize: 22, color: c.muted }}>&nbsp;&nbsp;(mod 107)</span>
        </div>
      </VD_Box>
      <VD_Box x={740} y={262} w={600} h={190} show={s >= 2} on={s === 2} tone={c.violet}>
        <VD_Cap>m3 → m2, private</VD_Cap>
        <div style={{ marginTop: 10 }}>
          <M size={32}>f₃(2) = 3 + 6·2 = 15</M>
        </div>
        <div style={{ fontSize: 22, color: c.muted, marginTop: 10 }}>
          a signed request on
          <div style={{ fontFamily: MONO, fontSize: 22, whiteSpace: 'nowrap' }}>/federation/v1/dkg/secret-shares</div>
        </div>
      </VD_Box>
      <At x={120} y={500} w={1220}>
        <Fade show={s >= 3}>
          <VD_Cap>m2, from the private value, mod 107</VD_Cap>
          <div style={{ marginTop: 6 }}>
            <M size={36}>4¹⁵ = 34</M>
          </div>
        </Fade>
      </At>
      <At x={120} y={625} w={1220}>
        <Fade show={s >= 4}>
          <VD_Cap>m2, from the public commitments, mod 107</VD_Cap>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 28 }}>
            <M size={36}>A₃,₀ · A₃,₁² = 64 · 30² = 64 · 44 = 34</M>
            <span style={{ fontSize: 26, color: c.good }}>equal: accept</span>
          </div>
        </Fade>
      </At>
      <At x={120} y={760} w={1220}>
        <Fade show={s >= 5}>
          <VD_Cap color={c.bad}>A wrong value, 16</VD_Cap>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 28 }}>
            <M size={36}>4¹⁶ = 29 ≠ 34</M>
            <span style={{ fontSize: 26, color: c.bad }}>reject; the error names m3</span>
          </div>
        </Fade>
      </At>
      <At x={120} y={900} w={1220}>
        <Note style={{ fontSize: 22 }}>{VD_TOY}</Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          m3 has <M>f₃(x) = 3 + 6x</M> and publishes <M>g³</M> and <M>g⁶</M> as commitments.
        </StepItem>
        <StepItem n={2} step={s}>
          It sends m2 the value <M>f₃(2) = 15</M>, privately.
        </StepItem>
        <StepItem n={3} step={s}>
          m2 raises <M>g</M> to the value it received.
        </StepItem>
        <StepItem n={4} step={s}>
          m2 evaluates the commitments at <M>x = 2</M>: same number, accept.
        </StepItem>
        <StepItem n={5} step={s}>
          A wrong value fails the check, and the sender is named.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_RA_W = [250, 720, 710];

const VD_RndAdvanced: Page = () => {
  const proc = useProcess(6, 2400);
  const s = proc.step;
  return (
    <VarShell of={VD_RD_OF} lens="Advanced" title="Round rules in the DKG driver" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VD_Tr head>
          <VD_Td head w={VD_RA_W[0]}>Phase</VD_Td>
          <VD_Td head w={VD_RA_W[1]}>Advances when</VD_Td>
          <VD_Td head w={VD_RA_W[2]}>Rejected or stalled when</VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 1} on={s === 1}>
          <VD_Td w={VD_RA_W[0]}>Readiness</VD_Td>
          <VD_Td w={VD_RA_W[1]} size={22}>
            every member confirms the same ceremony ID and keyset policy
          </VD_Td>
          <VD_Td w={VD_RA_W[2]} size={22}>
            ceremony ID or policy differs
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 2} on={s === 2}>
          <VD_Td w={VD_RA_W[0]}>Commitment</VD_Td>
          <VD_Td w={VD_RA_W[1]} size={22}>
            all <M>n</M> commitment hashes are stored
          </VD_Td>
          <VD_Td w={VD_RA_W[2]} size={22}>
            a second, different commitment from one member; another ceremony ID
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 3} on={s === 3}>
          <VD_Td w={VD_RA_W[0]}>Reveal</VD_Td>
          <VD_Td w={VD_RA_W[1]} size={22}>
            sent only after all <M>n</M> commitments; every reveal matches its hash
          </VD_Td>
          <VD_Td w={VD_RA_W[2]} size={22}>
            reveal hash mismatch; keyset spec differs; not <M>t</M> commitments per amount
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 4} on={s === 4}>
          <VD_Td w={VD_RA_W[0]}>Secret shares</VD_Td>
          <VD_Td w={VD_RA_W[1]} size={22}>
            sent only after all <M>n</M> reveals; one contribution from every member, self included
          </VD_Td>
          <VD_Td w={VD_RA_W[2]} size={22}>
            signer ID ≠ receiver; <M>
              f<VD_S>j</VD_S>(i)·G₂ ≠ Σ<VD_S>l</VD_S> i<VD_P>l</VD_P>·A<VD_S>j,l</VD_S>
            </M>
            ; plain HTTP to a non-loopback peer
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 5} on={s === 5}>
          <VD_Td w={VD_RA_W[0]}>Share, signature</VD_Td>
          <VD_Td w={VD_RA_W[1]} size={22}>
            <M>kᵢ·G₂ = Kᵢ</M>, persisted; <M>n</M> Schnorr signatures over one transcript hash
          </VD_Td>
          <VD_Td w={VD_RA_W[2]} size={22}>
            <VD_Mono size={21}>PrivateShareMismatch</VD_Mono>; a missing or invalid signature
          </VD_Td>
        </VD_Tr>
        <VD_Tr show={s >= 6} on={s === 6}>
          <VD_Td w={VD_RA_W[0]}>Activation</VD_Td>
          <VD_Td w={VD_RA_W[1]} size={22}>
            every member confirms the final config digest
          </VD_Td>
          <VD_Td w={VD_RA_W[2]} size={22}>
            a missing confirmation; the ceremony timeout aborts the run and names absent members
          </VD_Td>
        </VD_Tr>
      </At>
      <At x={120} y={830} w={1680}>
        <Fade show={s >= 6} delay={300}>
          <Note>
            Every message is a signed private request; effectful DKG messages keep durable replay state. Later phases
            resend earlier artifacts, so a lagging peer catches up without an acknowledgement journal.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_TRI = (cx: number, cy: number) => [
  { x: cx, y: cy - 150 },
  { x: cx + 130, y: cy + 75 },
  { x: cx - 130, y: cy + 75 },
];
const VD_PAIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
  [1, 2],
  [2, 1],
];

const VD_TriPanel = ({
  cx,
  cy,
  n,
  s,
  anim,
  kind,
}: {
  cx: number;
  cy: number;
  n: number;
  s: number;
  anim: boolean;
  kind: 'bcast' | 'private' | 'sign';
}) => {
  const P = VD_TRI(cx, cy);
  const seen = s >= n;
  return (
    <g style={{ opacity: seen ? 1 : 0.15, transition: `opacity 500ms ${EASE_OUT}` }}>
      {kind !== 'sign' &&
        VD_PAIRS.map(([a, b], k) => {
          const e = VD_seg(P[a].x, P[a].y, P[b].x, P[b].y, 44, 44);
          const len = Math.hypot(e.x2 - e.x1, e.y2 - e.y1);
          const ox = (-(e.y2 - e.y1) / len) * 7;
          const oy = ((e.x2 - e.x1) / len) * 7;
          const col = kind === 'private' ? VD_MEMC[a] : c.node;
          return (
            <g key={`p${k}`}>
              <Arrow x1={e.x1 + ox} y1={e.y1 + oy} x2={e.x2 + ox} y2={e.y2 + oy} show={seen} color={col} delay={k * 50} />
              <Packet
                x1={e.x1 + ox}
                y1={e.y1 + oy}
                x2={e.x2 + ox}
                y2={e.y2 + oy}
                run={anim && s === n}
                color={kind === 'private' ? VD_MEMC[a] : c.muted}
                delay={300 + k * 80}
                r={6}
              />
            </g>
          );
        })}
      {kind === 'sign' &&
        P.map((p, k) => {
          const e = VD_seg(p.x, p.y, cx, cy, 44, 34);
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
            x={cx - 38}
            y={cy - 20}
            width={76}
            height={40}
            rx={8}
            style={{
              fill: seen ? c.claySoft : c.card,
              stroke: seen ? c.clayHex : c.node,
              strokeWidth: 1.75,
              transition: `fill 400ms ${EASE_OUT} 900ms, stroke 400ms ${EASE_OUT} 900ms`,
            }}
          />
          <text x={cx} y={cy + 7} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.ink }}>
            hash
          </text>
        </g>
      )}
      <Member x={P[0].x} y={P[0].y} r={36} label="m1" tone={s === n ? 'on' : 'idle'} />
      <Member x={P[1].x} y={P[1].y} r={36} label="m2" tone={s === n ? 'on' : 'idle'} />
      <Member x={P[2].x} y={P[2].y} r={36} label="m3" tone={s === n ? 'on' : 'idle'} />
    </g>
  );
};

const VD_RndGraphical: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const cy = 520;
  const xs = [330, 740, 1150, 1560];
  const lab = (on: boolean): CSSProperties => ({
    fontFamily: MATH,
    fontStyle: 'italic',
    fontSize: 32,
    fill: on ? c.ink : c.muted,
    transition: `fill 300ms ${EASE_OUT}`,
  });
  return (
    <VarShell of={VD_RD_OF} lens="Graphical" title="Commit, reveal, deliver, sign" proc={proc}>
      <Canvas>
        <VD_TriPanel cx={xs[0]} cy={cy} n={1} s={s} anim={proc.anim} kind="bcast" />
        <VD_TriPanel cx={xs[1]} cy={cy} n={2} s={s} anim={proc.anim} kind="bcast" />
        <VD_TriPanel cx={xs[2]} cy={cy} n={3} s={s} anim={proc.anim} kind="private" />
        <VD_TriPanel cx={xs[3]} cy={cy} n={4} s={s} anim={proc.anim} kind="sign" />
        <text x={xs[0]} y={cy + 180} textAnchor="middle" style={lab(s === 1)}>
          H(reveal)
        </text>
        <text x={xs[1]} y={cy + 180} textAnchor="middle" style={lab(s === 2)}>
          A
          <tspan baselineShift="sub" fontSize="22">
            j,l
          </tspan>
        </text>
        <text x={xs[2]} y={cy + 180} textAnchor="middle" style={lab(s === 3)}>
          f
          <tspan baselineShift="sub" fontSize="22">
            j
          </tspan>
          <tspan>(i)</tspan>
        </text>
        <text x={xs[3]} y={cy + 180} textAnchor="middle" style={{ ...lab(s === 4), fontFamily: 'var(--osd-font-body)', fontStyle: 'normal', fontSize: 26 }}>
          signatures
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
            r={9}
            style={{ fill: s >= i + 1 ? c.clayHex : c.card, stroke: s >= i + 1 ? c.clayHex : c.node, strokeWidth: 2, transition: `fill 300ms ${EASE_OUT}` }}
          />
        ))}
      </Canvas>
    </VarShell>
  );
};

const VD_PH = [
  ['Commitment', 'commitments'],
  ['Reveal', 'reveals'],
  ['Secret shares', 'contributions'],
  ['Local share', 'share ready'],
  ['Signature', 'signatures'],
  ['Activation', 'activations'],
  ['Complete', ''],
];

const VD_PhaseNode = ({ k, s }: { k: number; s: number }) => {
  const active = s === k + 1;
  const done = s > k + 1;
  const reached = active || done;
  const counter = k === 3 || k === 6 ? (reached ? '✓' : '—') : reached ? '3/3' : '0/3';
  return (
    <div
      style={{
        position: 'absolute',
        left: 120 + k * 245,
        top: 300,
        width: 210,
        height: 150,
        boxSizing: 'border-box',
        border: `1.75px solid ${active ? c.clayHex : done ? c.good : c.rule}`,
        background: active ? c.claySoft : c.card,
        borderRadius: 12,
        padding: '14px 16px',
        transition: `border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
      }}
    >
      <div style={{ fontSize: 23, color: reached ? c.ink : c.muted }}>{VD_PH[k][0]}</div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 34,
          marginTop: 10,
          color: done ? c.good : active ? c.clayHex : c.dim,
          transition: `color 300ms ${EASE_OUT}`,
        }}
      >
        {counter}
      </div>
      <div style={{ fontSize: 21, color: c.muted }}>{VD_PH[k][1]}</div>
    </div>
  );
};

const VD_PhaseCond = ({ k, children }: { k: number; children: ReactNode }) => (
  <div style={{ position: 'absolute', left: 120 + k * 245, top: 468, width: 210, fontSize: 21, lineHeight: 1.4, color: c.muted }}>
    {children}
  </div>
);

const VD_RndStates: Page = () => {
  const proc = useProcess(7, 1800);
  const s = proc.step;
  return (
    <VarShell of={VD_RD_OF} lens="Explained as a state machine" title="Driver phases and their counters" proc={proc}>
      <At x={120} y={252} w={1680}>
        <div style={{ fontSize: 22, color: c.muted }}>
          <M>n</M> = 3. Counters from <VD_Mono size={22}>FederationDkgDriverProgress</VD_Mono>; each member runs this
          machine on its own records.
        </div>
      </At>
      <Canvas>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <Arrow key={`a${k}`} x1={120 + k * 245 + 212} y1={375} x2={120 + (k + 1) * 245 - 4} y2={375} show={s >= k + 2} color={c.node} />
        ))}
      </Canvas>
      <VD_PhaseNode k={0} s={s} />
      <VD_PhaseNode k={1} s={s} />
      <VD_PhaseNode k={2} s={s} />
      <VD_PhaseNode k={3} s={s} />
      <VD_PhaseNode k={4} s={s} />
      <VD_PhaseNode k={5} s={s} />
      <VD_PhaseNode k={6} s={s} />
      <VD_PhaseCond k={0}>every member's hash is stored</VD_PhaseCond>
      <VD_PhaseCond k={1}>sent once all hashes exist; each must match</VD_PhaseCond>
      <VD_PhaseCond k={2}>sent once all reveals exist; each is checked</VD_PhaseCond>
      <VD_PhaseCond k={3}>
        <M>kᵢ·G₂ = Kᵢ</M>, then persisted
      </VD_PhaseCond>
      <VD_PhaseCond k={4}>
        <M>n</M> signatures over one transcript hash
      </VD_PhaseCond>
      <VD_PhaseCond k={5}>every member confirms the final config</VD_PhaseCond>
      <VD_PhaseCond k={6}>the keyset may sign</VD_PhaseCond>
      <At x={120} y={640}>
        <Fade show={s >= 7}>
          <VD_Cap>Ceremony record state</VD_Cap>
        </Fade>
      </At>
      <Canvas>
        <Arrow x1={364} y1={726} x2={616} y2={690} show={s >= 7} color={c.good} />
        <Arrow x1={364} y1={742} x2={616} y2={820} show={s >= 7} color={c.bad} delay={120} />
      </Canvas>
      <VD_Box x={120} y={690} w={240} h={84} show={s >= 7} on tone={c.clayHex} pad="20px 22px">
        <div style={{ fontFamily: SERIF, fontSize: 30 }}>active</div>
      </VD_Box>
      <VD_Box x={620} y={650} w={240} h={80} show={s >= 7} on tone={c.good} pad="18px 22px" delay={100}>
        <div style={{ fontFamily: SERIF, fontSize: 30, color: c.good }}>complete</div>
      </VD_Box>
      <VD_Box x={620} y={780} w={240} h={80} show={s >= 7} on tone={c.bad} pad="18px 22px" delay={200}>
        <div style={{ fontFamily: SERIF, fontSize: 30, color: c.bad }}>aborted</div>
      </VD_Box>
      <At x={900} y={668} w={900}>
        <Fade show={s >= 7} delay={150}>
          <div style={{ fontSize: 23, color: c.muted }}>every member confirmed every ceremony</div>
        </Fade>
      </At>
      <At x={900} y={784} w={900}>
        <Fade show={s >= 7} delay={250}>
          <div style={{ fontSize: 23, lineHeight: 1.45, color: c.muted }}>
            replaced by a new ceremony ID. A timeout only stops the driver and names the members it waited for.
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

const VD_CheatRow = ({
  y,
  n,
  s,
  does,
  caught,
  result,
}: {
  y: number;
  n: number;
  s: number;
  does: ReactNode;
  caught: ReactNode;
  result: ReactNode;
}) => (
  <VD_Box x={120} y={y} w={1680} h={160} show={s >= n} on={s === n} tone={c.bad} pad="14px 24px">
    <div style={{ display: 'flex', gap: 36 }}>
      <div style={{ width: 520 }}>
        <VD_Cap color={c.bad}>m3 does</VD_Cap>
        <div style={{ fontSize: 23, lineHeight: 1.4, marginTop: 6 }}>{does}</div>
      </div>
      <div style={{ width: 600 }}>
        <VD_Cap>Caught by</VD_Cap>
        <div style={{ fontSize: 23, lineHeight: 1.4, marginTop: 6 }}>{caught}</div>
      </div>
      <div style={{ width: 440 }}>
        <VD_Cap>Result</VD_Cap>
        <div style={{ fontSize: 23, lineHeight: 1.4, marginTop: 6 }}>{result}</div>
      </div>
    </div>
  </VD_Box>
);

const VD_RndByzantine: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VD_RD_OF} lens="Perspective: Byzantine member" title="Four ways m3 can cheat, and where each is caught" proc={proc}>
      <VD_CheatRow
        y={262}
        n={1}
        s={s}
        does={
          <>
            Sends m2 the value 16 instead of <M>f₃(2) = 15</M>.
          </>
        }
        caught={
          <>
            m2's check, in the toy group mod 107: <M>4¹⁶ = 29 ≠ A₃,₀·A₃,₁² = 34</M>.
          </>
        }
        result={
          <>
            <VD_Mono size={21}>DkgCommitmentMismatch</VD_Mono> naming m3; the ceremony cannot finish.
          </>
        }
      />
      <VD_CheatRow
        y={437}
        n={2}
        s={s}
        does="Reveals a polynomial other than the one it hashed."
        caught="Every receiver: reveal hash mismatch."
        result="The reveal is rejected; only the committed polynomial can be revealed."
      />
      <VD_CheatRow
        y={612}
        n={3}
        s={s}
        does="Sends different commitments to different peers."
        caught="A peer holding both: conflicting commitment. Otherwise the members' transcript hashes differ."
        result={
          <>
            No hash collects <M>n</M> signatures; no activation.
          </>
        }
      />
      <VD_CheatRow
        y={787}
        n={4}
        s={s}
        does="Stays silent in any round."
        caught="The driver waits for every roster member."
        result="Timeout: the run aborts and names m3. A new ceremony is needed."
      />
    </VarShell>
  );
};

const VD_KCell = ({ x, y, on, bad, show, delay, children }: { x: number; y: number; on?: boolean; bad?: boolean; show: boolean; delay: number; children: ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 130,
      height: 60,
      boxSizing: 'border-box',
      border: `1.5px solid ${on ? c.clayHex : bad ? c.bad : c.rule}`,
      background: on ? c.claySoft : c.card,
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MATH,
      fontStyle: 'italic',
      fontSize: 30,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `${VD_tr(show, delay, 400)}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const VD_GRIND_K = [13, 52, 101, 83, 11, 44];

const VD_RndLastMover: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VD_RD_OF} lens="Framing: failure mode" title="Reveals without a prior hash round" proc={proc}>
      <VD_Box x={120} y={262} w={360} h={96} show={s >= 1} tone={c.cool} on={s === 1} pad="12px 20px">
        <VD_Cap color={c.cool}>m1 reveals</VD_Cap>
        <M size={30}>A₁,₀ = 42</M>
      </VD_Box>
      <VD_Box x={520} y={262} w={360} h={96} show={s >= 1} tone={c.violet} on={s === 1} pad="12px 20px" delay={80}>
        <VD_Cap color={c.violet}>m2 reveals</VD_Cap>
        <M size={30}>A₂,₀ = 16</M>
      </VD_Box>
      <At x={920} y={262} w={420}>
        <Note style={{ fontSize: 22 }}>Toy group: powers of 4 mod 107, order 53, written multiplicatively.</Note>
      </At>
      <At x={120} y={390} w={1220}>
        <Fade show={s >= 1} delay={200}>
          <M size={34}>K = A₁,₀ · A₂,₀ · A₃,₀ = 42 · 16 · A₃,₀ = 30 · A₃,₀</M>
          <span style={{ fontSize: 22, color: c.muted }}>&nbsp;&nbsp;(mod 107)</span>
        </Fade>
      </At>
      <At x={120} y={484}>
        <Fade show={s >= 2}>
          <M size={30}>a₃,₀</M>
        </Fade>
      </At>
      <At x={120} y={564}>
        <Fade show={s >= 2}>
          <M size={30}>K</M>
        </Fade>
      </At>
      {VD_GRIND_K.map((k, i) => (
        <div key={`g${i}`}>
          <VD_KCell x={300 + i * 150} y={470} show={s >= 2} delay={i * 60} on={s >= 3 && i === 1}>
            {i + 1}
          </VD_KCell>
          <VD_KCell x={300 + i * 150} y={550} show={s >= 2} delay={120 + i * 60} on={s >= 3 && k % 2 === 0}>
            {k}
          </VD_KCell>
        </div>
      ))}
      <At x={120} y={650} w={1220}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 24, lineHeight: 1.45 }}>
            m3 wants an even <M>K</M>: it takes <M>a₃,₀ = 2</M>, gets <M>K = 52</M>, and still delivers valid shares,
            since it knows its own polynomial.
          </div>
        </Fade>
      </At>
      <VD_Box x={120} y={770} w={1220} h={170} show={s >= 4} on tone={c.good} pad="16px 24px">
        <VD_Cap color={c.good}>With the hash round</VD_Cap>
        <div style={{ fontSize: 24, lineHeight: 1.45, marginTop: 8 }}>
          <M>H₃ = H(reveal₃)</M> is published before any reveal is sent. Choosing <M>a₃,₀</M> after seeing 42 and 16
          changes the reveal, which is then rejected as a reveal hash mismatch.
        </div>
      </VD_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Suppose there were no hash round, and m1 and m2 reveal first.
        </StepItem>
        <StepItem n={2} step={s}>
          m3 computes <M>K</M> for candidate constant terms before choosing.
        </StepItem>
        <StepItem n={3} step={s}>
          It keeps one with a property it wants, here an even <M>K</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          The hash round fixes every polynomial before any reveal is seen.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VD_Field = ({ name, children }: { name: string; children?: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', padding: '3px 0' }}>
    <span style={{ width: 360, flexShrink: 0, fontFamily: MONO, fontSize: 21 }}>{name}</span>
    <span style={{ fontSize: 21, color: c.muted }}>{children}</span>
  </div>
);

const VD_RndTranscript: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VD_RD_OF} lens="Focus: transcript and activation" title="What the members sign before activation" proc={proc}>
      <VD_Box x={120} y={262} w={620} h={384} on={s === 1} pad="16px 22px">
        <VD_Cap>Transcript payload</VD_Cap>
        <div style={{ marginTop: 8 }}>
          <VD_Field name="setup_method">
            <VD_Mono>pedersen_dkg</VD_Mono>
          </VD_Field>
          <VD_Field name="federation_id" />
          <VD_Field name="setup_authorization" />
          <VD_Field name="threshold_params">
            <M>n, t, c</M>
          </VD_Field>
          <VD_Field name="participant_order">member order</VD_Field>
          <VD_Field name="member_identity_public_keys" />
          <VD_Field name="keysets">
            <M>K</M>, <M>Kᵢ</M> per amount
          </VD_Field>
          <VD_Field name="ceremonies">hashes and reveals</VD_Field>
        </div>
      </VD_Box>
      <VD_Box x={120} y={676} w={620} h={230} show={s >= 4} on={s === 4} pad="16px 22px">
        <VD_Cap>Activation</VD_Cap>
        <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 8 }}>
          Each member then sends a signed confirmation of ceremony ID, transcript hash and final config digest.
          Activation needs one from every member; no ecash is signed before.
        </div>
      </VD_Box>
      <At x={780} y={262} w={575}>
        <Fade show={s >= 2} dimTo={0.25}>
          <VD_Cap color={s === 2 ? c.clayHex : c.muted}>transcript_hash = SHA-256 of</VD_Cap>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
            <VD_Seg bytes="00000020" label="u32 length" hot={s === 2} />
            <VD_Seg bytes="cdk-federation-dkg-transcript-v2" label="domain, 32 B" />
            <VD_Seg bytes="<4 B>" label="JSON length" />
            <VD_Seg bytes="<canonical JSON>" label="payload" />
          </div>
        </Fade>
      </At>
      <At x={780} y={500} w={575}>
        <Fade show={s >= 3} dimTo={0.25}>
          <VD_Cap color={s === 3 ? c.clayHex : c.muted}>Each member signs, BIP340, 64 B</VD_Cap>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
            <VD_Seg bytes="0000002a" label="u32 length" hot={s === 3} />
            <VD_Seg bytes="cdk-federation-dkg-transcript-signature-v2" label="domain, 42 B" />
            <VD_Seg bytes="00000020" label="u32 length" />
            <VD_Seg bytes="transcript_hash" label="32 B" />
          </div>
          <div style={{ fontSize: 22, lineHeight: 1.4, color: c.muted, marginTop: 4 }}>
            Signed as SHA-256 of these bytes, with the identity key; all <M>n</M> must verify over the same hash.
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The payload binds roster, thresholds, keys and the full public ceremony.
        </StepItem>
        <StepItem n={2} step={s}>
          Its hash is SHA-256 over length-prefixed, versioned bytes.
        </StepItem>
        <StepItem n={3} step={s}>
          Each member signs that hash with its identity key; all <M>n</M> must verify.
        </StepItem>
        <StepItem n={4} step={s}>
          Then every member confirms the final config. Only then is the keyset used.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Deck ────────────────────────────────────────────────────────────────────

const PAGES: [Page, string | undefined][] = [
  [VD_Cover, undefined],

  // 1.3 Bolt11 mint, federated
  [MintQuote, 'Original slide.'],
  [
    VD_MqBeginner,
    `Beginner. Three members, t = 2, q = 3, one quote followed from creation to shares. Each step changes one field on each member card. Say: the wallet talks to one member to get an invoice, but it only trusts what t members agree on, and the members only move the quote forward through consensus.`,
  ],
  [
    VD_MqAdvanced,
    `Advanced. The flow as the code implements it: wallet side in wallet/federation.rs, member side in cdk-axum. Point out the visibility check right after quote creation (t members must see the quote, 100 attempts 50 ms apart), the observation triggers, the member_quorum rule c ≤ q ≤ n, and that members re-check paid before submitting Mint.`,
  ],
  [
    VD_MqGraphical,
    `Graphical. The disc is the quote as consensus sees it; the ring fills with one arc per accepted payment observation. Walk the six beats without reading text: quote at m1, replicated, paid via Lightning and observed three times, status read, then shares back to the wallet.`,
  ],
  [
    VD_MqStateMachine,
    `Explained as a state machine. Unpaid, paid, issued, and the single consensus item type that moves each transition. Then what a wallet request does in each state, and which events do not move the state at all: too few observations, a mismatching observation, a second Mint for the same quote.`,
  ],
  [
    VD_MqMember,
    `Perspective of member m2, which never saw the quote request. It learns the quote from consensus, answers status from applied state, reports its own observation, and signs only after its Mint envelope is accepted. Mention that a status request also makes m2 probe its backend.`,
  ],
  [
    VD_MqByzantine,
    `Focus: one member's paid versus the quorum. n = 5, q = 4, t = 3, and m5 lies. Its observation is one of four needed, its status answer loses to four identical unpaid answers, and its lone share is below t. The last line is the counting argument: q ≥ c and t ≥ f + 1.`,
  ],
  [
    VD_MqCompare,
    `Framing: before and after. The same four NUT-04/NUT-23 wallet calls against one mint and against a federation. The wallet API does not change; what changes is who answers, how many answers are needed, and that every state change goes through consensus.`,
  ],

  // 1.3 Network topology
  [Topology, 'Original slide.'],
  [
    VD_TopoBeginner,
    `Beginner. The two planes drawn separately: a star with five links for wallets, a full mesh with ten links between members. Say: the wallet asks everyone and combines three shares; the members talk among themselves first, so they agree before anyone signs.`,
  ],
  [
    VD_TopoAdvanced,
    `Advanced. What makes the private plane private: every request is a signed envelope from a roster identity, replay handling differs by message class, secret shares refuse plain HTTP, public submit routes fail closed while a member lags. The route list is the complete /federation/v1 surface on the bls-federation branch.`,
  ],
  [
    VD_TopoGraphical,
    `Graphical. Request fan-out, mesh traffic, shares back, then two members drop out. Three are still enough for t = 3 shares but not for c = 4 ordering, so nothing new gets signed. Let the figure carry it.`,
  ],
  [
    VD_TopoTable,
    `Explained via message types. Every message on either plane, with route and direction. Public rows are ordinary Cashu routes; private rows are consensus, catch-up, key generation and FROST signing. Close with the note: none of these are consensus items themselves; consensus orders the facts they depend on.`,
  ],
  [
    VD_TopoWallet,
    `Perspective of the wallet. It holds the public config from the invite code and talks to n public URLs. It checks each answer itself. Everything on /federation/v1 is invisible to it; its safety comes from thresholds, not from seeing the members agree.`,
  ],
  [
    VD_TopoLiveness,
    `Framing: liveness as counting. For n = 5: DKG needs all five, ordering needs c = 4, payment needs q = 4 observers, new signatures need ordering first and then t = 3 shares. One member down: everything but a DKG continues. Two down: ordering stops, so signing stops too.`,
  ],
  [
    VD_TopoNoMesh,
    `Framing: failure mode. Take the private plane away and members sign what they receive: the mix-and-match case, three signatures for two paid outputs. With it, each request becomes an envelope, the first for the quote wins, and only its outputs are signed.`,
  ],

  // 1.4 Distributed key generation
  [Dkg, 'Original slide.'],
  [
    VD_DkgBeginner,
    `Beginner. Three integer lines: 4 + x, 2 + 5x, 3 + 6x. m2 receives 6, 12 and 15 and keeps 33. The shares lie on 9 + 12x, and k = 9 is the sum of the constant terms that nobody ever adds. Mention that real values are mod the group order and there is one polynomial per amount.`,
  ],
  [
    VD_DkgAdvanced,
    `Advanced. What dkg.rs checks and when a ceremony aborts. Note the naming: commitments are a·G2 without a blinding term, Feldman-style, and the code calls the method PedersenDkg. The failure policy is abort and restart with a new ceremony ID; there is no disqualify-and-continue.`,
  ],
  [
    VD_DkgGraphical,
    `Graphical. Row j is what member j sends, column i is what member i receives and sums. The x = 0 column is never sent and its sum k is never computed; the public column of constant commitments sums to K. Same toy numbers as the beginner page.`,
  ],
  [
    VD_DkgCode,
    `Explained via code. The ceremony as condensed Rust from dkg.rs, with the real function and error names. Step through: sample and commit, evaluate per receiver, check against commitments, sum and compare with the public share, aggregate the constant terms into K.`,
  ],
  [
    VD_DkgAuditor,
    `Perspective of an auditor with only the public record. Everything public can be recomputed: reveals against hashes, K, every Ki, the transcript signatures. Toy numbers in a small multiplicative group show the computation. What the auditor cannot see are the private evaluations; each member signs only after its own checks passed.`,
  ],
  [
    VD_DkgKnows,
    `Focus: who knows what. With the toy numbers, each member knows its own line until evaluation, the values it sent and received, and its own share. Everyone, including wallets, knows the commitments, K and the Ki. Nobody knows another member's share or k.`,
  ],
  [
    VD_DkgCost,
    `Framing: cost and sizes. For a full 64-amount keyset: n·A polynomials, n·A·t public G2 points, n squared private messages of A scalars each. For five members that is 960 points, about 92 KB of point data, and 25 private messages, with every member online throughout.`,
  ],

  // 1.4 DKG message flow
  [DkgRounds, 'Original slide.'],
  [
    VD_RndWorked,
    `Beginner, worked example. One delivered value checked end to end in a toy group, powers of 4 mod 107: m3 publishes 64 and 30, sends 15 to m2, and m2 gets 34 both ways. A wrong value, 16, gives 29 and the error names m3.`,
  ],
  [
    VD_RndAdvanced,
    `Advanced. The driver's rules per phase: what lets it advance and what rejects or stalls it. Reveals go out only after all commitments are in, shares only after all reveals. Every message is signed; later phases resend earlier artifacts so a lagging peer can catch up.`,
  ],
  [
    VD_RndGraphical,
    `Graphical. Four panels with the message pattern of each round: hash broadcast, reveal broadcast, private per-pair delivery in the sender's colour, then signatures over one transcript hash. The timeline underneath fills as the rounds complete.`,
  ],
  [
    VD_RndStates,
    `Explained as a state machine. The seven driver phases with the counters each member tracks, and the condition to advance. At the end, the ceremony record: active becomes complete once every member confirmed, or aborted when replaced by a new ceremony; a timeout only stops the driver.`,
  ],
  [
    VD_RndByzantine,
    `Perspective of a Byzantine member. Four ways to cheat and where each is caught: a wrong private value fails the commitment check and names the sender; a changed polynomial fails the hash; equivocation splits the transcript hash so it never collects n signatures; silence times out.`,
  ],
  [
    VD_RndLastMover,
    `Framing: failure mode. Why the hash round exists. Without it, the last member to reveal sees the other constant commitments and can try candidates until K has a property it wants; in the toy group, an even K. With the hash round, its polynomial is fixed before any reveal is visible.`,
  ],
  [
    VD_RndTranscript,
    `Focus: the transcript and activation. The signed payload binds roster, thresholds, identity keys, keysets and the full public ceremony. Show the exact byte framing of the hash and of the BIP340 signature input, then activation: every member confirms the final config before the keyset signs anything.`,
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · Request flows and key generation (temporary)',
  createdAt: '2026-09-28T09:07:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
