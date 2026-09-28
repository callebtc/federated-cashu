import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  Arrow,
  At,
  Band,
  c,
  Canvas,
  Check,
  Code,
  Dot,
  Draw,
  EASE_IO,
  EASE_OUT,
  Fade,
  GFade,
  Hi,
  JLine,
  Label,
  Lagrange,
  Lifeline,
  Line,
  M,
  MONO,
  Member,
  Multisig,
  Note,
  Packet,
  REDUCED,
  Shamir,
  StepItem,
  StepList,
  T,
  ThresholdSign,
  Up,
  useProcess,
  VarCover,
  VarShell,
  WalletNode,
} from '../federated-cashu';
import type { Tone } from '../federated-cashu';

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

// ─── Helpers (VB_) ───────────────────────────────────────────────────────────

const VB_OF_MS = '1.1 Threshold BLS compared with t-of-n secp multisig';
const VB_OF_SH = '1.2 Shamir secret sharing, t = 2';
const VB_OF_LG = '1.2 Lagrange interpolation at x = 0';
const VB_OF_TS = '1.2 Threshold blind signing';

type VB_Tone = 'rule' | 'clay' | 'cool' | 'bad' | 'good' | 'violet' | 'panel';
const VB_EDGE: Record<VB_Tone, string> = {
  rule: c.rule,
  clay: c.clayHex,
  cool: c.cool,
  bad: c.bad,
  good: c.good,
  violet: c.violet,
  panel: c.rule,
};
const VB_FILL: Record<VB_Tone, string> = {
  rule: c.card,
  clay: c.claySoft,
  cool: c.coolSoft,
  bad: c.badSoft,
  good: c.goodSoft,
  violet: 'rgba(122, 95, 166, 0.08)',
  panel: c.panel,
};
const VB_SUB = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

/** Absolutely positioned bordered box with an entrance. */
const VB_Box = ({
  x,
  y,
  w,
  h,
  show = true,
  dim = 0,
  tone = 'rule',
  delay = 0,
  dashed = false,
  pad = '14px 20px',
  children,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  show?: boolean;
  dim?: number;
  tone?: VB_Tone;
  delay?: number;
  dashed?: boolean;
  pad?: string;
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
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${VB_EDGE[tone]}`,
      background: VB_FILL[tone],
      borderRadius: 12,
      padding: pad,
      opacity: show ? 1 : dim,
      transform: show || dim > 0 || REDUCED ? 'translateY(0px)' : 'translateY(8px)',
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** A plain word inside a math run. */
const VB_Wd = ({ children }: { children: ReactNode }) => (
  <span style={{ fontFamily: 'var(--osd-font-body)', fontStyle: 'normal', fontSize: '0.82em' }}>{children}</span>
);

/** Subscript that renders in every font. */
const VB_Sb = ({ children }: { children: ReactNode }) => (
  <sub style={{ fontSize: '0.62em', verticalAlign: '-0.28em', lineHeight: 0 }}>{children}</sub>
);

/** Small label inside a box. */
const VB_Cap = ({ children, color = c.muted, upper = true }: { children: ReactNode; color?: string; upper?: boolean }) => (
  <div
    style={{
      fontSize: 21,
      letterSpacing: upper ? '0.08em' : '0.02em',
      textTransform: upper ? 'uppercase' : undefined,
      color,
      marginBottom: 6,
    }}
  >
    {children}
  </div>
);

/** Body text inside boxes. */
const VB_Txt = ({ children, size = 24, color = c.ink }: { children: ReactNode; size?: number; color?: string }) => (
  <div style={{ fontSize: size, lineHeight: 1.38, color }}>{children}</div>
);

/** Inline chip (a field of a proof, a byte range, a value). */
const VB_Chip = ({
  children,
  tone = 'rule',
  w,
  h = 46,
  size = 22,
}: {
  children: ReactNode;
  tone?: VB_Tone;
  w?: number;
  h?: number;
  size?: number;
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: w,
      height: h,
      boxSizing: 'border-box',
      padding: '0 14px',
      marginRight: 8,
      border: `1.5px solid ${VB_EDGE[tone]}`,
      background: VB_FILL[tone],
      borderRadius: 8,
      fontSize: size,
      whiteSpace: 'nowrap',
      verticalAlign: 'middle',
      transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </span>
);

/** Table cell with fixed width. */
const VB_TCell = ({
  w,
  children,
  head,
  upper = true,
  color,
  show = true,
  size = 24,
  align = 'left',
}: {
  w: number;
  children?: ReactNode;
  head?: boolean;
  upper?: boolean;
  color?: string;
  show?: boolean;
  size?: number;
  align?: 'left' | 'center' | 'right';
}) => (
  <div
    style={{
      width: w,
      flexShrink: 0,
      boxSizing: 'border-box',
      padding: '0 18px',
      fontSize: head ? 21 : size,
      lineHeight: 1.35,
      letterSpacing: head && upper ? '0.08em' : undefined,
      textTransform: head && upper ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
      textAlign: align,
      opacity: show ? 1 : 0,
      transition: `opacity 400ms ${EASE_OUT}, color 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

/** Table row with fixed height and an optional highlight. */
const VB_TRow = ({
  h,
  children,
  hot = false,
  head = false,
  show = true,
  tone = 'clay',
}: {
  h: number;
  children: ReactNode;
  hot?: boolean;
  head?: boolean;
  show?: boolean;
  tone?: VB_Tone;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: h,
      borderBottom: `1px solid ${head ? c.line : c.rule}`,
      background: hot ? VB_FILL[tone] : 'rgba(0, 0, 0, 0)',
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT}, transform 400ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

/** Plot axes in canvas coordinates. */
const VB_Axes = ({
  x0,
  y0,
  x1,
  y1,
  xl = 'x',
  yl = 'f(x)',
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  xl?: string;
  yl?: string;
}) => (
  <g>
    <Line x1={x0} y1={y0} x2={x1} y2={y0} color={c.node} />
    <Line x1={x0} y1={y0} x2={x0} y2={y1} color={c.node} />
    <T x={x1 + 14} y={y0 + 30} size={28} font="math" color={c.muted}>
      {xl}
    </T>
    <T x={x0 - 32} y={y1 + 16} size={28} font="math" color={c.muted}>
      {yl}
    </T>
  </g>
);

/** SVG path of a function sampled on [xa, xb]. */
const VB_path = (
  f: (x: number) => number,
  xa: number,
  xb: number,
  X: (x: number) => number,
  Y: (y: number) => number,
  n = 48,
): string => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = xa + ((xb - xa) * i) / n;
    d += `${i === 0 ? 'M' : 'L'} ${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)} `;
  }
  return d.trim();
};

/** A curve that draws itself when `show` turns on. */
const VB_Curve = ({
  d,
  show,
  color = c.clayHex,
  width = 3,
  delay = 0,
  dur = 1100,
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
      strokeLinejoin: 'round',
      strokeDasharray: 1,
      strokeDashoffset: show ? 0 : 1,
      opacity: show ? opacity : 0,
      transition: `stroke-dashoffset ${REDUCED ? 0 : dur}ms ${EASE_IO} ${show ? delay : 0}ms, opacity 400ms ${EASE_OUT}, stroke 300ms ${EASE_OUT}`,
    }}
  />
);

/** A dashed curve that fades in. */
const VB_DashCurve = ({
  d,
  show,
  delay = 0,
  color = c.node,
  to = 1,
}: {
  d: string;
  show: boolean;
  delay?: number;
  color?: string;
  to?: number;
}) => (
  <GFade show={show} delay={delay} to={to}>
    <path d={d} style={{ fill: 'none', stroke: color, strokeWidth: 1.75, strokeDasharray: '6 6' }} />
  </GFade>
);

/** Matrix with bracket borders; rows can be highlighted or dimmed. */
const VB_Mat = ({
  rows,
  hot = [],
  dim = [],
  size = 36,
  cw = 76,
}: {
  rows: string[][];
  hot?: number[];
  dim?: number[];
  size?: number;
  cw?: number;
}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      padding: '6px 8px',
      borderLeft: `2px solid ${c.ink}`,
      borderRight: `2px solid ${c.ink}`,
      borderRadius: 14,
    }}
  >
    {rows.map((r, i) => (
      <div
        key={`r${i}`}
        style={{
          display: 'flex',
          height: Math.round(size * 1.5),
          alignItems: 'center',
          borderRadius: 8,
          background: hot.includes(i) ? c.claySoft : 'rgba(0, 0, 0, 0)',
          opacity: dim.includes(i) ? 0.28 : 1,
          transition: `background 300ms ${EASE_OUT}, opacity 300ms ${EASE_OUT}`,
        }}
      >
        {r.map((cell, j) => (
          <span key={`c${j}`} style={{ width: cw, textAlign: 'center' }}>
            <M size={size}>{cell}</M>
          </span>
        ))}
      </div>
    ))}
  </div>
);

/** One line of a stepped derivation. */
const VB_Eq = ({ show, children, size = 32, delay = 0, h = 62 }: { show: boolean; children: ReactNode; size?: number; delay?: number; h?: number }) => (
  <Fade show={show} delay={delay} style={{ height: h, display: 'flex', alignItems: 'center' }}>
    <M size={size}>{children}</M>
  </Fade>
);

/** Horizontal band behind a table-like row on a figure. */
const VB_RowBand = ({ y, h, on, x = 110, w = 1240 }: { y: number; h: number; on: boolean; x?: number; w?: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 12,
      background: on ? c.claySoft : 'rgba(0, 0, 0, 0)',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  />
);

// ─── Cover ───────────────────────────────────────────────────────────────────

const VB_Cover: Page = () => (
  <VarCover
    section="1.1–1.2"
    title="Threshold issuance"
    sources={[
      { n: '1.1', title: 'Threshold BLS compared with t-of-n secp multisig', count: 7 },
      { n: '1.2', title: 'Shamir secret sharing, t = 2', count: 8 },
      { n: '1.2', title: 'Lagrange interpolation at x = 0', count: 7 },
      { n: '1.2', title: 'Threshold blind signing', count: 7 },
    ]}
  />
);

// ═════════════════════════════════════════════════════════════════════════════
// 1.1 Threshold BLS compared with t-of-n secp multisig
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VB_MsBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const my = 420;
  const L = [230, 410, 590];
  const R = [870, 1050, 1230];
  const tone = (i: number): Tone => (s >= 3 ? (i === 1 ? 'off' : 'on') : 'idle');
  return (
    <VarShell of={VB_OF_MS} lens="Beginner" title="Two ways to require 2 of 3 signers" proc={proc}>
      <At x={120} y={262} w={580}>
        <Label>multisig · secp256k1</Label>
      </At>
      <At x={760} y={262} w={580}>
        <Label color={c.clayHex}>threshold BLS · BLS12-381</Label>
      </At>
      <Canvas>
        <Line x1={730} y1={262} x2={730} y2={880} color={c.rule} />
        <GFade show={s >= 2}>
          <line x1={R[1]} y1={344} x2={R[0]} y2={my - 34} style={{ stroke: c.clayHex, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
          <line x1={R[1]} y1={344} x2={R[1]} y2={my - 34} style={{ stroke: c.clayHex, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
          <line x1={R[1]} y1={344} x2={R[2]} y2={my - 34} style={{ stroke: c.clayHex, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
          <rect x={R[1] - 60} y={298} width={120} height={46} rx={10} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.75 }} />
          <T x={R[1]} y={331} size={30} font="math" color={c.clayHex}>
            k
          </T>
        </GFade>
        <Member x={L[0]} y={my} r={34} label="m1" tone={tone(0)} />
        <Member x={L[1]} y={my} r={34} label="m2" tone={tone(1)} />
        <Member x={L[2]} y={my} r={34} label="m3" tone={tone(2)} />
        <Member x={R[0]} y={my} r={34} label="m1" tone={tone(0)} />
        <Member x={R[1]} y={my} r={34} label="m2" tone={tone(1)} />
        <Member x={R[2]} y={my} r={34} label="m3" tone={tone(2)} />
        <T x={L[0]} y={500} size={30} font="math" show={s >= 2}>
          k₁
        </T>
        <T x={L[1]} y={500} size={30} font="math" show={s >= 2} delay={60}>
          k₂
        </T>
        <T x={L[2]} y={500} size={30} font="math" show={s >= 2} delay={120}>
          k₃
        </T>
        <T x={L[1]} y={540} size={22} color={c.muted} show={s >= 2} delay={200}>
          three own keys
        </T>
        <T x={R[0]} y={500} size={30} font="math" show={s >= 2}>
          f(1)
        </T>
        <T x={R[1]} y={500} size={30} font="math" show={s >= 2} delay={60}>
          f(2)
        </T>
        <T x={R[2]} y={500} size={30} font="math" show={s >= 2} delay={120}>
          f(3)
        </T>
        <T x={R[1]} y={540} size={22} color={c.muted} show={s >= 2} delay={200}>
          shares of k
        </T>
        <Draw x1={L[0]} y1={514} x2={L[0]} y2={574} show={s >= 3} color={c.muted} width={2} dur={500} />
        <Draw x1={L[2]} y1={514} x2={L[2]} y2={574} show={s >= 3} color={c.muted} width={2} dur={500} delay={80} />
        <Draw x1={R[0]} y1={514} x2={R[1] - 42} y2={586} show={s >= 3} color={c.clayHex} width={2} dur={600} />
        <Draw x1={R[2]} y1={514} x2={R[1] + 42} y2={586} show={s >= 3} color={c.clayHex} width={2} dur={600} delay={80} />
        <GFade show={s >= 3} delay={300}>
          <rect x={L[0] - 40} y={578} width={80} height={44} rx={8} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.5 }} />
          <T x={L[0]} y={610} size={28} font="math">
            C₁
          </T>
          <rect x={L[2] - 40} y={578} width={80} height={44} rx={8} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.5 }} />
          <T x={L[2]} y={610} size={28} font="math">
            C₃
          </T>
          <rect x={R[1] - 40} y={578} width={80} height={44} rx={8} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.5 }} />
          <T x={R[1]} y={610} size={28} font="math">
            C
          </T>
        </GFade>
      </Canvas>
      <VB_Box x={130} y={650} w={560} h={88} show={s >= 4} pad="18px 16px">
        <VB_Chip>
          <M size={26}>x</M>
        </VB_Chip>
        <VB_Chip>
          <M size={26}>C₁</M>
        </VB_Chip>
        <VB_Chip>
          <M size={26}>C₃</M>
        </VB_Chip>
        <VB_Chip tone="panel">
          <M size={24}>K₁, K₂, K₃</M>, 2 of 3
        </VB_Chip>
      </VB_Box>
      <VB_Box x={770} y={650} w={560} h={88} show={s >= 4} tone="clay" pad="18px 16px">
        <VB_Chip>
          <M size={26}>x</M>
        </VB_Chip>
        <VB_Chip>
          <M size={26}>C</M>
        </VB_Chip>
      </VB_Box>
      <At x={130} y={764} w={560}>
        <Fade show={s >= 5}>
          <VB_Txt>
            Receiver checks <M>C₁</M> against <M>K₁</M>, <M>C₃</M> against <M>K₃</M>, and the 2-of-3 rule.
          </VB_Txt>
        </Fade>
      </At>
      <At x={770} y={764} w={560}>
        <Fade show={s >= 5}>
          <VB_Txt>
            Receiver checks <M>C</M> against one public key <M>K</M>.
          </VB_Txt>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Three members, m1 to m3. Any two should be able to issue.
        </StepItem>
        <StepItem n={2} step={s}>
          Left: every member has its own key <M>kᵢ</M>. Right: one key <M>k</M>, split into shares <M>f(i)</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          m1 and m3 answer. Left: two signatures. Right: two shares, combined into one.
        </StepItem>
        <StepItem n={4} step={s}>
          The token. Left: <M>x</M>, two signatures, the keys and the rule. Right: <M>x</M> and <M>C</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          The receiver. Left: two checks and the rule. Right: one check.
        </StepItem>
        <Note style={{ marginTop: 20, fontSize: 22 }}>
          <M>x</M>: token secret. <M>kᵢ</M>, <M>k</M>: private keys. <M>Kᵢ</M>, <M>K</M>: public keys. <M>C</M>: signature.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VB_MA_W = [280, 466, 466, 466];
const VB_MsAdvanced: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const W = VB_MA_W;
  return (
    <VarShell of={VB_OF_MS} lens="Advanced" title="Three designs for t-of-n issuance" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VB_TRow h={52} head>
          <VB_TCell w={W[0]} head>
            {' '}
          </VB_TCell>
          <VB_TCell w={W[1]} head show={s >= 1}>
            Bare secp multisig
          </VB_TCell>
          <VB_TCell w={W[2]} head show={s >= 2}>
            Interpolated secp DHKE
          </VB_TCell>
          <VB_TCell w={W[3]} head show={s >= 3} color={c.clayHex}>
            Threshold BLS
          </VB_TCell>
        </VB_TRow>
        <VB_TRow h={86}>
          <VB_TCell w={W[0]} color={c.muted}>
            Key
          </VB_TCell>
          <VB_TCell w={W[1]} show={s >= 1}>
            own key <M>kᵢ</M> per member
          </VB_TCell>
          <VB_TCell w={W[2]} show={s >= 2}>
            one <M>k</M>, Shamir-shared as <M>kᵢ</M>
          </VB_TCell>
          <VB_TCell w={W[3]} show={s >= 3}>
            one <M>k ∈ 𝔽ᵣ</M>, Shamir-shared as <M>kᵢ</M>
          </VB_TCell>
        </VB_TRow>
        <VB_TRow h={86}>
          <VB_TCell w={W[0]} color={c.muted}>
            Member returns
          </VB_TCell>
          <VB_TCell w={W[1]} show={s >= 1}>
            <M>C′ᵢ = kᵢ·B′</M> and a DLEQ
          </VB_TCell>
          <VB_TCell w={W[2]} show={s >= 2}>
            <M>C′ᵢ = kᵢ·B′</M>
          </VB_TCell>
          <VB_TCell w={W[3]} show={s >= 3}>
            <M>C′ᵢ = kᵢ·B′</M> in G₁
          </VB_TCell>
        </VB_TRow>
        <VB_TRow h={86}>
          <VB_TCell w={W[0]} color={c.muted}>
            Share check
          </VB_TCell>
          <VB_TCell w={W[1]} show={s >= 1}>
            DLEQ against <M>Kᵢ</M>
          </VB_TCell>
          <VB_TCell w={W[2]} show={s >= 2}>
            DLEQ against <M>Kᵢ</M>
          </VB_TCell>
          <VB_TCell w={W[3]} show={s >= 3}>
            <M>
              <Up>e</Up>(C′ᵢ, G₂) = <Up>e</Up>(B′, Kᵢ)
            </M>
          </VB_TCell>
        </VB_TRow>
        <VB_TRow h={86}>
          <VB_TCell w={W[0]} color={c.muted}>
            Proof
          </VB_TCell>
          <VB_TCell w={W[1]} show={s >= 1}>
            <M>x</M>, <M>t</M> signatures, roster, policy
          </VB_TCell>
          <VB_TCell w={W[2]} show={s >= 2}>
            <M>x</M>, one <M>C</M>
          </VB_TCell>
          <VB_TCell w={W[3]} show={s >= 3}>
            <M>x</M>, one <M>C</M>
          </VB_TCell>
        </VB_TRow>
        <VB_TRow h={86} hot={s >= 4}>
          <VB_TCell w={W[0]} color={c.muted}>
            Offline check of <M>C</M>
          </VB_TCell>
          <VB_TCell w={W[1]} show={s >= 1}>
            <M>t</M> DLEQ checks and the policy
          </VB_TCell>
          <VB_TCell w={W[2]} show={s >= 2}>
            DLEQ under <M>K</M> needs <M>k</M>: a threshold DLEQ, a new protocol
          </VB_TCell>
          <VB_TCell w={W[3]} show={s >= 3}>
            <M>
              <Up>e</Up>(C, G₂) = <Up>e</Up>(Y, K)
            </M>
          </VB_TCell>
        </VB_TRow>
        <VB_TRow h={86}>
          <VB_TCell w={W[0]} color={c.muted}>
            Keyset
          </VB_TCell>
          <VB_TCell w={W[1]} show={s >= 1}>
            a set of member keys
          </VB_TCell>
          <VB_TCell w={W[2]} show={s >= 2}>
            one <M>K = k·G</M> per amount
          </VB_TCell>
          <VB_TCell w={W[3]} show={s >= 3}>
            one <M>K = k·G₂</M> per amount (v3)
          </VB_TCell>
        </VB_TRow>
      </At>
      <At x={120} y={858} w={1680}>
        <Fade show={s >= 4}>
          <Note>
            Threshold BLS is the interpolated design on a pairing curve: one check works for a share (against <M>Kᵢ</M>) and
            for the result (against <M>K</M>). NUT-12: v3 BlindSignatures and Proofs MUST NOT carry a <Code>dleq</Code>{' '}
            field.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VB_Blk = ({
  x,
  y,
  w,
  h = 84,
  tone = 'rule',
  show = true,
  dx = 0,
  hatch = false,
  move = false,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  tone?: VB_Tone;
  show?: boolean;
  dx?: number;
  hatch?: boolean;
  move?: boolean;
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
      border: `1.75px solid ${VB_EDGE[tone]}`,
      background: hatch
        ? `repeating-linear-gradient(135deg, ${c.panel} 0px, ${c.panel} 10px, ${c.card} 10px, ${c.card} 20px)`
        : VB_FILL[tone],
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      color: c.ink,
      opacity: show ? 1 : 0,
      transform: `translateX(${dx}px) scale(${show || REDUCED ? 1 : 0.96})`,
      transition: move
        ? `opacity 400ms ${EASE_OUT}, transform 700ms ${EASE_IO}`
        : `opacity 400ms ${EASE_OUT}, transform 400ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const VB_SigBlk = ({ i, t }: { i: number; t: number }) => (
  <VB_Blk x={338 + (i - 1) * 140} y={420} w={132} show={i <= t}>
    <M size={32}>C{VB_SUB[i]}</M>
  </VB_Blk>
);

const VB_MsGraphical: Page = () => {
  const proc = useProcess(3, 1500);
  const s = proc.step;
  const t = 2 + s;
  return (
    <VarShell of={VB_OF_MS} lens="Graphical" title="Proof size as t grows" proc={proc}>
      <At x={220} y={376}>
        <Label>secp multisig</Label>
      </At>
      <VB_Blk x={220} y={420} w={110}>
        <M size={32}>x</M>
      </VB_Blk>
      <VB_SigBlk i={1} t={t} />
      <VB_SigBlk i={2} t={t} />
      <VB_SigBlk i={3} t={t} />
      <VB_SigBlk i={4} t={t} />
      <VB_SigBlk i={5} t={t} />
      <VB_Blk x={618} y={420} w={230} dx={(t - 2) * 140} hatch move>
        roster, policy
      </VB_Blk>
      <At x={338} y={526} w={1000}>
        <span style={{ fontSize: 30 }}>
          {t} × 33 B = {t * 33} B
        </span>
        <span style={{ fontSize: 26, color: c.muted, marginLeft: 32 }}>
          {t} DLEQ checks + policy
        </span>
      </At>
      <At x={220} y={666}>
        <Label color={c.clayHex}>threshold BLS</Label>
      </At>
      <VB_Blk x={220} y={710} w={110}>
        <M size={32}>x</M>
      </VB_Blk>
      <VB_Blk x={338} y={710} w={192} tone="clay">
        <M size={32}>C</M>
      </VB_Blk>
      <At x={338} y={816} w={1000}>
        <span style={{ fontSize: 30 }}>48 B</span>
        <span style={{ fontSize: 26, color: c.muted, marginLeft: 32 }}>
          for every <M>t</M> · one pairing
        </span>
      </At>
      <At x={1440} y={420} w={360}>
        <M size={120}>t = {t}</M>
        <div style={{ marginTop: 16 }}>
          <M size={40} color={c.muted}>
            n = 5
          </M>
        </div>
      </At>
    </VarShell>
  );
};

// ─── Explained via lifecycle ─────────────────────────────────────────────────

const VB_LCX = [310, 610, 910, 1210, 1510];

const VB_LcCell = ({ i, y, s, tone, children }: { i: number; y: number; s: number; tone: VB_Tone; children: ReactNode }) => (
  <VB_Box x={VB_LCX[i]} y={y} w={280} h={180} show={s >= i + 1} tone={tone} pad="14px 18px">
    <VB_Txt>{children}</VB_Txt>
  </VB_Box>
);

const VB_LcHead = ({ i, s, children }: { i: number; s: number; children: ReactNode }) => (
  <At x={VB_LCX[i]} y={262} w={280}>
    <Label color={s === i + 1 ? c.clayHex : c.muted}>{children}</Label>
  </At>
);

const VB_MsLifecycle: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const cx = VB_LCX.map((x) => x + 140);
  return (
    <VarShell of={VB_OF_MS} lens="Explained via lifecycle" title="Where the threshold appears in a token's life" proc={proc}>
      <VB_LcHead i={0} s={s}>
        Issuance
      </VB_LcHead>
      <VB_LcHead i={1} s={s}>
        Storage
      </VB_LcHead>
      <VB_LcHead i={2} s={s}>
        Transfer
      </VB_LcHead>
      <VB_LcHead i={3} s={s}>
        Verification
      </VB_LcHead>
      <VB_LcHead i={4} s={s}>
        Spending
      </VB_LcHead>
      <Canvas>
        <Line x1={cx[0]} y1={318} x2={cx[4]} y2={318} color={c.line} />
        <Dot x={cx[0]} y={318} r={7} color={s >= 1 ? c.clayHex : c.node} ring={s === 1} />
        <Dot x={cx[1]} y={318} r={7} color={s >= 2 ? c.clayHex : c.node} ring={s === 2} />
        <Dot x={cx[2]} y={318} r={7} color={s >= 3 ? c.clayHex : c.node} ring={s === 3} />
        <Dot x={cx[3]} y={318} r={7} color={s >= 4 ? c.clayHex : c.node} ring={s === 4} />
        <Dot x={cx[4]} y={318} r={7} color={s >= 5 ? c.clayHex : c.node} ring={s === 5} />
        <Packet x1={cx[0]} y1={318} x2={cx[1]} y2={318} run={proc.anim && s === 2} color={c.clayHex} />
        <Packet x1={cx[1]} y1={318} x2={cx[2]} y2={318} run={proc.anim && s === 3} color={c.clayHex} />
        <Packet x1={cx[2]} y1={318} x2={cx[3]} y2={318} run={proc.anim && s === 4} color={c.clayHex} />
        <Packet x1={cx[3]} y1={318} x2={cx[4]} y2={318} run={proc.anim && s === 5} color={c.clayHex} />
      </Canvas>
      <At x={120} y={424} w={180}>
        <div style={{ fontSize: 24, color: c.muted }}>secp multisig</div>
      </At>
      <At x={120} y={634} w={180}>
        <div style={{ fontSize: 24, color: c.clayHex }}>threshold BLS</div>
      </At>
      <VB_LcCell i={0} y={350} s={s} tone="clay">
        collects <M>t</M> signatures, each with a DLEQ
      </VB_LcCell>
      <VB_LcCell i={1} y={350} s={s} tone="clay">
        stores <M>x</M>, <M>t</M> signatures, roster, policy
      </VB_LcCell>
      <VB_LcCell i={2} y={350} s={s} tone="clay">
        the token carries the whole bundle
      </VB_LcCell>
      <VB_LcCell i={3} y={350} s={s} tone="clay">
        <M>t</M> DLEQ checks and the <M>t</M>-of-<M>n</M> policy
      </VB_LcCell>
      <VB_LcCell i={4} y={350} s={s} tone="clay">
        the mint checks the bundle against roster history
      </VB_LcCell>
      <VB_LcCell i={0} y={560} s={s} tone="clay">
        fans out, checks <M>t</M> shares against <M>Kᵢ</M>, interpolates
      </VB_LcCell>
      <VB_LcCell i={1} y={560} s={s} tone="rule">
        stores <M>(x, C)</M>
      </VB_LcCell>
      <VB_LcCell i={2} y={560} s={s} tone="rule">
        an ordinary v3 token
      </VB_LcCell>
      <VB_LcCell i={3} y={560} s={s} tone="rule">
        one pairing with <M>K</M>, in any v3 wallet
      </VB_LcCell>
      <VB_LcCell i={4} y={560} s={s} tone="rule">
        an ordinary v3 input, checked against <M>K</M>
      </VB_LcCell>
      <At x={310} y={770} w={1200}>
        <VB_Chip tone="clay">federation-aware</VB_Chip>
        <VB_Chip tone="rule">ordinary Cashu</VB_Chip>
      </At>
      <At x={120} y={846} w={1680}>
        <Fade show={s >= 5}>
          <div style={{ fontSize: 26, lineHeight: 1.45 }}>
            Multisig federates the token: every stage handles the bundle. Threshold BLS federates the issuer and emits an
            ordinary v3 proof.
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Perspective: receiver ───────────────────────────────────────────────────

const VB_MsReceiver: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_MS} lens="Perspective: receiver" title="What the receiver needs to accept a token" proc={proc}>
      <At x={120} y={262} w={580}>
        <Label>secp multisig</Label>
      </At>
      <At x={760} y={262} w={580}>
        <Label color={c.clayHex}>threshold BLS</Label>
      </At>
      <VB_Box x={120} y={300} w={580} h={120} show={s >= 1}>
        <VB_Cap>received</VB_Cap>
        <VB_Chip>
          <M size={26}>x</M>
        </VB_Chip>
        <VB_Chip>
          <M size={26}>C₁ … Cₜ</M>
        </VB_Chip>
        <VB_Chip>
          DLEQ ×&nbsp;<M size={24}>t</M>
        </VB_Chip>
        <VB_Chip tone="panel">roster, policy</VB_Chip>
      </VB_Box>
      <VB_Box x={760} y={300} w={580} h={120} show={s >= 1} tone="clay">
        <VB_Cap color={c.clayHex}>received</VB_Cap>
        <VB_Chip>
          <M size={26}>x</M>
        </VB_Chip>
        <VB_Chip>
          <M size={26}>C</M>
        </VB_Chip>
      </VB_Box>
      <VB_Box x={120} y={436} w={580} h={150} show={s >= 2}>
        <VB_Cap>must know in advance</VB_Cap>
        <VB_Txt>
          member keys <M>K₁ … Kₙ</M>, the roster, the <M>t</M>-of-<M>n</M> policy and the proof format
        </VB_Txt>
      </VB_Box>
      <VB_Box x={760} y={436} w={580} h={150} show={s >= 2} tone="clay">
        <VB_Cap color={c.clayHex}>must know in advance</VB_Cap>
        <VB_Txt>the v3 keyset: one <M>K</M> per amount, as for a standalone mint</VB_Txt>
      </VB_Box>
      <VB_Box x={120} y={602} w={580} h={130} show={s >= 3}>
        <VB_Cap>computes</VB_Cap>
        <VB_Txt>
          <M>t</M> DLEQ checks; counts distinct listed keys against <M>t</M>
        </VB_Txt>
      </VB_Box>
      <VB_Box x={760} y={602} w={580} h={130} show={s >= 3} tone="clay">
        <VB_Cap color={c.clayHex}>computes</VB_Cap>
        <VB_Txt>
          <M>
            Y = <Up>H</Up>(x)
          </M>
          , then one pairing:{' '}
          <M>
            <Up>e</Up>(C, G₂) = <Up>e</Up>(Y, K)
          </M>
        </VB_Txt>
      </VB_Box>
      <VB_Box x={120} y={748} w={580} h={100} show={s >= 4}>
        <VB_Cap>software</VB_Cap>
        <VB_Txt>must implement the federation format</VB_Txt>
      </VB_Box>
      <VB_Box x={760} y={748} w={580} h={100} show={s >= 4} tone="clay">
        <VB_Cap color={c.clayHex}>software</VB_Cap>
        <VB_Txt>any v3 wallet, offline</VB_Txt>
      </VB_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Alice sends Carol a proof. What arrives?
        </StepItem>
        <StepItem n={2} step={s}>
          What Carol must know before she can check it.
        </StepItem>
        <StepItem n={3} step={s}>
          What Carol computes.
        </StepItem>
        <StepItem n={4} step={s}>
          Which software can do it.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          Multisig puts the federation into the proof. Threshold BLS keeps it in issuance; Carol sees a standalone v3
          proof.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Focus: signer set visibility ────────────────────────────────────────────

const VB_SsLeft = ({ y, show, set, a, b }: { y: number; show: boolean; set: string; a: string; b: string }) => (
  <At x={130} y={y} w={560}>
    <Fade show={show} style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ width: 160 }}>
        <M size={28}>S = {set}</M>
      </span>
      <VB_Chip>
        <M size={26}>x</M>
      </VB_Chip>
      <VB_Chip>
        <M size={26}>{a}</M>
      </VB_Chip>
      <VB_Chip>
        <M size={26}>{b}</M>
      </VB_Chip>
    </Fade>
  </At>
);

const VB_MsSignerSet: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_MS} lens="Focus: signer set visibility" title="What a proof reveals about its signers" proc={proc}>
      <At x={130} y={262} w={560}>
        <Label>secp multisig: proof contents</Label>
      </At>
      <At x={700} y={262} w={640}>
        <Label color={c.clayHex}>threshold BLS: result from the shares</Label>
        <Note style={{ marginTop: 4 }}>
          <M>C′ᵢ = f(i)·B′</M> with <M>f(x) = 3 + 1.2x</M>
        </Note>
      </At>
      <VB_RowBand y={350} h={100} on={s === 1} />
      <VB_RowBand y={470} h={100} on={s === 2} />
      <VB_RowBand y={590} h={100} on={s === 3} />
      <VB_SsLeft y={377} show={s >= 1} set="{1, 2}" a="C₁" b="C₂" />
      <VB_SsLeft y={497} show={s >= 2} set="{1, 3}" a="C₁" b="C₃" />
      <VB_SsLeft y={617} show={s >= 3} set="{2, 3}" a="C₂" b="C₃" />
      <At x={700} y={380} w={640}>
        <VB_Eq show={s >= 1} size={30} h={40}>
          2·C′₁ − 1·C′₂ = (8.4 − 5.4)·B′ = 3·B′
        </VB_Eq>
      </At>
      <At x={700} y={500} w={640}>
        <VB_Eq show={s >= 2} size={30} h={40}>
          1.5·C′₁ − 0.5·C′₃ = (6.3 − 3.3)·B′ = 3·B′
        </VB_Eq>
      </At>
      <At x={700} y={620} w={640}>
        <VB_Eq show={s >= 3} size={30} h={40}>
          3·C′₂ − 2·C′₃ = (16.2 − 13.2)·B′ = 3·B′
        </VB_Eq>
      </At>
      <VB_Box x={120} y={730} w={560} h={124} show={s >= 4}>
        <VB_Txt>
          Three different proofs. The receiver and the mint at redemption see which members signed.
        </VB_Txt>
      </VB_Box>
      <VB_Box x={700} y={730} w={640} h={124} show={s >= 4} tone="clay" delay={80}>
        <VB_Txt>
          One result for every subset: <M>C′ = 3·B′</M>. After unblinding, one <M>C = k·Y</M>.
        </VB_Txt>
      </VB_Box>
      <StepList>
        <StepItem n={1} step={s}>
          <M>S = {'{1, 2}'}</M>: m1 and m2 respond.
        </StepItem>
        <StepItem n={2} step={s}>
          <M>S = {'{1, 3}'}</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          <M>S = {'{2, 3}'}</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          Multisig proofs name their signers. The threshold result does not depend on <M>S</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: the constraint ─────────────────────────────────────────────────

const VB_MsConstraint: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const hotC = s === 2 || s === 3;
  return (
    <VarShell of={VB_OF_MS} lens="Framing: the constraint" title="A proof stays (amount, id, secret, C)" proc={proc}>
      <At x={120} y={270} w={500}>
        <div style={{ background: c.card, border: `1.5px solid ${c.rule}`, borderRadius: 12, padding: '16px 24px' }}>
          <JLine on={false}>{'{'}</JLine>
          <JLine on={s === 1}>{'  "amount": 8,'}</JLine>
          <JLine on={s === 1}>{'  "id": "02<32 B>",'}</JLine>
          <JLine on={s === 1}>{'  "secret": "<33 B>",'}</JLine>
          <JLine on={s === 1 || hotC}>{'  "C": "<48 B>"'}</JLine>
          <JLine on={false}>{'}'}</JLine>
        </div>
        <Note style={{ marginTop: 10 }}>a v3 proof (NUT-00), hex fields shown by size</Note>
      </At>
      <VB_Box x={660} y={270} w={680} h={132} show={s >= 2} tone="bad">
        <VB_Cap color={c.bad}>secp multisig</VB_Cap>
        <VB_Txt>
          <M>C</M> becomes <M>t</M> signatures; the proof also carries roster and policy.
        </VB_Txt>
      </VB_Box>
      <VB_Box x={660} y={418} w={680} h={132} show={s >= 3} tone="clay">
        <VB_Cap color={c.clayHex}>threshold BLS</VB_Cap>
        <VB_Txt>
          Unchanged: <M>C</M> is one G₁ point, 48 B, interpolated before the proof exists.
        </VB_Txt>
      </VB_Box>
      <VB_Box x={120} y={600} w={393} h={166} show={s >= 4}>
        <VB_Cap>keyset</VB_Cap>
        <VB_Txt>an ordinary v3 keyset, one <M>K</M> per amount</VB_Txt>
      </VB_Box>
      <VB_Box x={533} y={600} w={393} h={166} show={s >= 4} delay={60}>
        <VB_Cap>receiver</VB_Cap>
        <VB_Txt>
          any v3 wallet verifies with <M>K</M>, offline
        </VB_Txt>
      </VB_Box>
      <VB_Box x={946} y={600} w={393} h={166} show={s >= 4} delay={120}>
        <VB_Cap>wallet API</VB_Cap>
        <VB_Txt>
          unchanged; <Code>FederatedMintConnector</Code> fans out underneath
        </VB_Txt>
      </VB_Box>
      <At x={120} y={792} w={1220}>
        <Fade show={s >= 4} delay={200}>
          <Note>
            <Code>crates/cdk/src/wallet/federation.rs</Code>
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The constraint: a proof is (amount, id, secret, <M>C</M>), and the wallet-to-mint protocol stays Cashu.
        </StepItem>
        <StepItem n={2} step={s}>
          secp multisig breaks it: <M>C</M> becomes <M>t</M> signatures plus roster and policy.
        </StepItem>
        <StepItem n={3} step={s}>
          Threshold BLS keeps it: shares are combined into one <M>C</M> before the proof exists.
        </StepItem>
        <StepItem n={4} step={s}>
          What follows: ordinary keyset, ordinary receivers, fan-out hidden inside the wallet.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.2 Shamir secret sharing, t = 2
// ═════════════════════════════════════════════════════════════════════════════

const VB_DASH: CSSProperties = { stroke: c.node, strokeWidth: 1.5, strokeDasharray: '6 6' };

// ─── Beginner ────────────────────────────────────────────────────────────────

const VB_ShBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const X = (x: number) => 220 + 250 * x;
  const Y = (y: number) => 900 - 26 * y;
  const fan = s === 4;
  const hot = s >= 5;
  return (
    <VarShell of={VB_OF_SH} lens="Beginner" title="Sharing a number with a line" proc={proc}>
      <Canvas>
        <VB_Axes x0={220} y0={900} x1={1260} y1={330} />
        <Draw x1={X(0)} y1={Y(7)} x2={X(4)} y2={Y(19)} show={s >= 2} opacity={fan ? 0.08 : 1} />
        <GFade show={fan}>
          <line x1={X(0)} y1={Y(13)} x2={X(4)} y2={Y(1)} style={VB_DASH} />
          <line x1={X(0)} y1={Y(9)} x2={X(4)} y2={Y(13)} style={VB_DASH} />
          <line x1={X(0)} y1={Y(4)} x2={X(17 / 6)} y2={Y(21)} style={VB_DASH} />
          <T x={196} y={Y(8) + 14} size={44} anchor="end" color={c.muted}>
            ?
          </T>
        </GFade>
        <Dot x={X(0)} y={Y(7)} r={11} ring={hot} show={s >= 1 && !fan} />
        <T x={190} y={Y(7) + 10} size={26} font="math" anchor="end" color={c.clayHex} show={s >= 1 && !fan}>
          k = 7
        </T>
        <Dot x={X(1)} y={Y(10)} color={hot ? c.clayHex : c.cool} ring={hot || fan} show={s >= 3} />
        <Dot x={X(2)} y={Y(13)} color={c.cool} show={s >= 3 && !fan} delay={60} />
        <Dot x={X(3)} y={Y(16)} color={hot ? c.clayHex : c.cool} ring={hot} show={s >= 3 && !fan} delay={120} />
        <T x={X(1)} y={Y(10) - 30} size={28} show={s >= 3}>
          10
        </T>
        <T x={X(2)} y={Y(13) - 30} size={28} show={s >= 3 && !fan} delay={60}>
          13
        </T>
        <T x={X(3)} y={Y(16) - 30} size={28} show={s >= 3 && !fan} delay={120}>
          16
        </T>
        <T x={X(1)} y={940} size={22} font="mono" color={c.muted} show={s >= 3}>
          m1
        </T>
        <T x={X(2)} y={940} size={22} font="mono" color={c.muted} show={s >= 3} delay={60}>
          m2
        </T>
        <T x={X(3)} y={940} size={22} font="mono" color={c.muted} show={s >= 3} delay={120}>
          m3
        </T>
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          The secret is a number: <M>k = 7</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Pick a random slope, here 3. The line <M>f(x) = 7 + 3x</M> crosses <M>x = 0</M> at <M>k</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Member <M>i</M> gets the height at <M>x = i</M>: 10, 13, 16.
        </StepItem>
        <StepItem n={4} step={s}>
          One value alone: a line through (1, 10) can cross <M>x = 0</M> anywhere.
        </StepItem>
        <StepItem n={5} step={s}>
          Two values fix the line. Follow it back to <M>x = 0</M>: 7.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          Real shares are elements of a finite field <M>𝔽ᵣ</M>; the picture uses ordinary numbers.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VB_Seg = ({ children, label, tone = 'rule', w }: { children: ReactNode; label: string; tone?: VB_Tone; w: number }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginRight: 8, width: w }}>
    <span
      style={{
        width: '100%',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: MONO,
        fontSize: 21,
        padding: '6px 10px',
        borderRadius: 6,
        border: `1.5px solid ${VB_EDGE[tone]}`,
        background: VB_FILL[tone],
      }}
    >
      {children}
    </span>
    <span style={{ fontSize: 21, color: c.muted, marginTop: 4, whiteSpace: 'nowrap' }}>{label}</span>
  </div>
);

const VB_SegRow = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <div style={{ marginBottom: 22 }}>
    <VB_Txt>{title}</VB_Txt>
    <div style={{ display: 'flex', marginTop: 8 }}>{children}</div>
  </div>
);

const VB_ShAdvanced: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_SH} lens="Advanced" title="Shamir shares in the implementation" proc={proc}>
      <At x={120} y={262} w={780}>
        <Fade show={s >= 1} dimTo={0.25}>
          <VB_Cap>polynomial, one per amount</VB_Cap>
          <M size={30}>f(x) = k + a₁x + … + aₜ₋₁xᵗ⁻¹</M>
          <span style={{ fontSize: 24 }}>
            {' '}
            over <M size={30}>𝔽ᵣ</M>
          </span>
          <VB_Txt>
            <M>kᵢ = f(i)</M>, <M>Kᵢ = kᵢ·G₂</M>, <M>K = f(0)·G₂</M>. Uniform coefficients: any <M>t − 1</M> shares are
            uniform and independent of <M>k</M>.
          </VB_Txt>
        </Fade>
        <Fade show={s >= 2} dimTo={0.25} style={{ marginTop: 26 }}>
          <VB_Cap>signer IDs</VB_Cap>
          <VB_Txt>
            <Code>BlsSignerId</Code>: non-zero <Code>u16</Code>, big-endian. 0 is rejected because <M>f(0) = k</M>.
          </VB_Txt>
          <VB_Txt>Duplicate IDs are rejected. A share whose public key is the identity is rejected.</VB_Txt>
        </Fade>
        <Fade show={s >= 3} dimTo={0.25} style={{ marginTop: 26 }}>
          <VB_Cap>parameters</VB_Cap>
          <VB_Txt>
            <M>0 &lt; t ≤ n</M>, <M>t ≤ c ≤ n</M>, <M>n ≥ 2</M> (<Code>ThresholdParams</Code>).
          </VB_Txt>
          <VB_Txt>
            Production profile, <Code>validate_bft_safety</Code>: <M>t &gt; ⌊(n − 1)/3⌋</M> and{' '}
            <M>c ≥ n − ⌊(n − 1)/3⌋</M>.
          </VB_Txt>
        </Fade>
        <Fade show={s >= 4} dimTo={0.25} style={{ marginTop: 26 }}>
          <VB_Cap>setup</VB_Cap>
          <VB_Txt>
            <Code>trusted_dealer_keygen</Code> (tests): <Code>coefficients[0]</Code> is <M>k</M>, their number is <M>t</M>.
            Dealer-free DKG ends in the same shares.
          </VB_Txt>
        </Fade>
      </At>
      <At x={960} y={262} w={840}>
        <Fade show={s >= 5} dimTo={0.25}>
          <VB_Cap>encodings, version byte 01</VB_Cap>
          <VB_SegRow title="secret share, 35 B">
            <VB_Seg w={80} label="version" tone="clay">
              01
            </VB_Seg>
            <VB_Seg w={190} label="signer ID, u16 BE">
              id
            </VB_Seg>
            <VB_Seg w={360} label="32 B">
              scalar
            </VB_Seg>
          </VB_SegRow>
          <VB_SegRow title="public share, 99 B">
            <VB_Seg w={80} label="version" tone="clay">
              01
            </VB_Seg>
            <VB_Seg w={190} label="signer ID">
              id
            </VB_Seg>
            <VB_Seg w={480} label="96 B, compressed">
              <M>G₂</M> point
            </VB_Seg>
          </VB_SegRow>
          <VB_SegRow title="blind signature share, 51 B">
            <VB_Seg w={80} label="version" tone="clay">
              01
            </VB_Seg>
            <VB_Seg w={190} label="signer ID">
              id
            </VB_Seg>
            <VB_Seg w={300} label="48 B, compressed">
              <M>G₁</M> point
            </VB_Seg>
          </VB_SegRow>
          <VB_Txt color={c.muted}>
            Secret shares are written only to private member configuration or secret storage.
          </VB_Txt>
          <div style={{ marginTop: 14 }}>
            <Note>
              <Code>crates/cashu/src/nuts/nut01/bls.rs</Code>
              <br />
              <Code>crates/cdk-common/src/federation/config.rs</Code>
            </Note>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VB_SG_f = (x: number) => 3 + 2.5 * x - 0.3 * x * x;

const VB_ShGraphical: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const X = (x: number) => 220 + 210 * x;
  const Y = (y: number) => 900 - 56 * y;
  const f = VB_SG_f;
  const fam = (k: number) => (x: number) => f(x) + k * (x - 2) * (x - 4);
  const two = s === 3;
  const dimOp = s >= 3 ? 0.25 : 1;
  const famOp = s >= 4 ? 0.4 : 1;
  return (
    <VarShell of={VB_OF_SH} lens="Graphical" title="t = 3: a parabola through three shares" proc={proc}>
      <Canvas>
        <VB_Axes x0={220} y0={900} x1={1300} y1={330} />
        <VB_Curve d={VB_path(f, 0, 5, X, Y)} show={s >= 1 && !two} />
        <VB_DashCurve d={VB_path(fam(0.5), 0, 5, X, Y)} show={s >= 3} to={famOp} />
        <VB_DashCurve d={VB_path(fam(0.2), 0, 5, X, Y)} show={s >= 3} to={famOp} delay={60} />
        <VB_DashCurve d={VB_path(fam(-0.15), 0, 5, X, Y)} show={s >= 3} to={famOp} delay={120} />
        <VB_DashCurve d={VB_path(fam(-0.3), 0, 5, X, Y)} show={s >= 3} to={famOp} delay={180} />
        <T x={196} y={Y(4) + 16} size={48} anchor="end" color={c.muted} show={two}>
          ?
        </T>
        <Dot x={X(0)} y={Y(3)} r={11} ring={s >= 4} show={s >= 1 && !two} />
        <T x={188} y={Y(3) + 12} size={36} font="math" anchor="end" color={c.clayHex} show={s >= 1 && !two}>
          k
        </T>
        <g style={{ opacity: two ? 0.25 : 1, transition: `opacity 400ms ${EASE_OUT}` }}>
          <Dot x={X(1)} y={Y(f(1))} color={s >= 4 ? c.clayHex : c.cool} ring={s >= 4} show={s >= 2} />
        </g>
        <Dot x={X(2)} y={Y(f(2))} color={s >= 3 ? c.clayHex : c.cool} ring={s >= 3} show={s >= 2} delay={50} />
        <g style={{ opacity: dimOp, transition: `opacity 400ms ${EASE_OUT}` }}>
          <Dot x={X(3)} y={Y(f(3))} color={c.cool} show={s >= 2} delay={100} />
        </g>
        <Dot x={X(4)} y={Y(f(4))} color={s >= 3 ? c.clayHex : c.cool} ring={s >= 3} show={s >= 2} delay={150} />
        <g style={{ opacity: dimOp, transition: `opacity 400ms ${EASE_OUT}` }}>
          <Dot x={X(5)} y={Y(f(5))} color={c.cool} show={s >= 2} delay={200} />
        </g>
        <T x={X(1)} y={940} size={22} font="mono" color={c.muted} show={s >= 2}>
          m1
        </T>
        <T x={X(2)} y={940} size={22} font="mono" color={c.muted} show={s >= 2} delay={50}>
          m2
        </T>
        <T x={X(3)} y={940} size={22} font="mono" color={c.muted} show={s >= 2} delay={100}>
          m3
        </T>
        <T x={X(4)} y={940} size={22} font="mono" color={c.muted} show={s >= 2} delay={150}>
          m4
        </T>
        <T x={X(5)} y={940} size={22} font="mono" color={c.muted} show={s >= 2} delay={200}>
          m5
        </T>
      </Canvas>
      <At x={1420} y={300} w={380}>
        <M size={44}>t = 3, n = 5</M>
        <Fade show={s >= 1} style={{ marginTop: 26 }}>
          <M size={30} color={c.muted}>
            degree t − 1 = 2
          </M>
        </Fade>
        <Fade show={s >= 3} style={{ marginTop: 48 }}>
          <div style={{ fontSize: 28, color: c.muted }}>
            2 shares: any <M>k</M>
          </div>
        </Fade>
        <Fade show={s >= 4} style={{ marginTop: 18 }}>
          <div style={{ fontSize: 28, color: c.clayHex }}>3 shares: one parabola</div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Explained via linear algebra ────────────────────────────────────────────

const VB_ShLinear: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const hot = s >= 3 ? [0, 1] : s === 2 ? [0] : [];
  const dim = s >= 3 ? [2] : s === 2 ? [1, 2] : [];
  return (
    <VarShell of={VB_OF_SH} lens="Explained via linear algebra" title="Shares as a linear system" proc={proc}>
      <At x={120} y={268} w={1220}>
        <M size={34}>
          f(x) = k + a₁·x.&nbsp;&nbsp; <VB_Wd>Share</VB_Wd> i:&nbsp; k + i·a₁ = f(i)
        </M>
      </At>
      <At x={120} y={346} w={1220} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <VB_Mat
          rows={[
            ['1', '1'],
            ['1', '2'],
            ['1', '3'],
          ]}
          hot={hot}
          dim={dim}
        />
        <VB_Mat rows={[['k'], ['a₁']]} />
        <M size={40}>=</M>
        <VB_Mat rows={[['4.2'], ['5.4'], ['6.6']]} hot={hot} dim={dim} cw={96} />
      </At>
      <At x={120} y={552} w={1220}>
        <VB_Eq show={s >= 2} size={30} h={52}>
          <VB_Wd>row 1 alone:</VB_Wd>&nbsp; k + a₁ = 4.2, <VB_Wd>so</VB_Wd> a₁ = 4.2 − k <VB_Wd>for every</VB_Wd> k
        </VB_Eq>
        <VB_Eq show={s >= 3} size={30} h={52}>
          <VB_Wd>rows 1, 2:</VB_Wd>&nbsp; <Up>det</Up> = 1·2 − 1·1 = 1 ≠ 0, <VB_Wd>so</VB_Wd> (k, a₁) = (3, 1.2)
        </VB_Eq>
      </At>
      <At x={120} y={680} w={1220}>
        <Fade show={s >= 4} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <VB_Mat
            rows={[
              ['1', '1'],
              ['1', '2'],
            ]}
          />
          <span style={{ alignSelf: 'flex-start', marginLeft: -10, marginTop: 4 }}>
            <M size={26}>−1</M>
          </span>
          <M size={36}>=</M>
          <VB_Mat
            rows={[
              ['2', '−1'],
              ['−1', '1'],
            ]}
            hot={[0]}
          />
        </Fade>
      </At>
      <At x={120} y={822} w={1220}>
        <VB_Eq show={s >= 4} size={32} h={52} delay={150}>
          k = 2·4.2 − 1·5.4 = 3,&nbsp;&nbsp; <VB_Wd>so</VB_Wd> λ₁ = 2, λ₂ = −1
        </VB_Eq>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Each share is one linear equation in the unknown coefficients <M>(k, a₁)</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          One equation, two unknowns: every <M>k</M> has a matching <M>a₁</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Two rows with distinct IDs: the 2×2 matrix is invertible, one solution.
        </StepItem>
        <StepItem n={4} step={s}>
          The first row of the inverse gives <M>k</M> directly: the Lagrange weights.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          For <M>t</M> shares: a <M>t</M>×<M>t</M> Vandermonde matrix, invertible if and only if the IDs are distinct.
          ID 0 would be the row (1, 0, …), the secret itself.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: federation member ──────────────────────────────────────────

const VB_SM_W = [120, 210, 330, 220, 300];

const VB_SmRow = ({ a, sb, s }: { a: string; sb: string; s: number }) => (
  <VB_TRow h={72}>
    <VB_TCell w={VB_SM_W[0]}>
      <Code>{a}</Code>
    </VB_TCell>
    <VB_TCell w={VB_SM_W[1]} show={s >= 1}>
      <M size={28}>f{sb}(2)</M>
      <span style={{ fontSize: 21, color: c.muted, marginLeft: 10 }}>32 B</span>
    </VB_TCell>
    <VB_TCell w={VB_SM_W[2]} show={s >= 2}>
      <M size={26}>f{sb}(j)·G₂, j = 1…5</M>
    </VB_TCell>
    <VB_TCell w={VB_SM_W[3]} show={s >= 2}>
      <M size={26}>f{sb}(0)·G₂</M>
    </VB_TCell>
    <VB_TCell w={VB_SM_W[4]} show={s >= 3} color={c.muted}>
      <M size={26}>
        f{sb}(0); f{sb}(j), j ≠ 2
      </M>
    </VB_TCell>
  </VB_TRow>
);

const VB_ShMember: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const W = VB_SM_W;
  return (
    <VarShell of={VB_OF_SH} lens="Perspective: federation member" title="What member m2 holds" proc={proc}>
      <At x={120} y={258} w={1180}>
        <VB_Txt color={c.muted}>
          One polynomial <M>fₐ</M> per amount <M>a</M> of the keyset. Rows: amounts 1, 2, 4, 8, …
        </VB_Txt>
      </At>
      <At x={120} y={304} w={1180}>
        <VB_TRow h={52} head>
          <VB_TCell w={W[0]} head>
            amount
          </VB_TCell>
          <VB_TCell w={W[1]} head show={s >= 1} color={c.clayHex}>
            private
          </VB_TCell>
          <VB_TCell w={W[2]} head show={s >= 2} color={c.cool}>
            public shares
          </VB_TCell>
          <VB_TCell w={W[3]} head show={s >= 2} color={c.cool}>
            public key
          </VB_TCell>
          <VB_TCell w={W[4]} head show={s >= 3}>
            not known
          </VB_TCell>
        </VB_TRow>
        <VB_SmRow a="1" sb="₁" s={s} />
        <VB_SmRow a="2" sb="₂" s={s} />
        <VB_SmRow a="4" sb="₄" s={s} />
        <VB_SmRow a="8" sb="₈" s={s} />
        <VB_TRow h={48}>
          <VB_TCell w={W[0]} color={c.muted}>
            …
          </VB_TCell>
        </VB_TRow>
      </At>
      <VB_Box x={120} y={724} w={1180} h={170} show={s >= 4} tone="clay">
        <VB_Cap color={c.clayHex} upper={false}>
          alone, m2 can compute
        </VB_Cap>
        <M size={30}>C′₂ = f₁(2)·B′</M>
        <span style={{ fontSize: 24 }}> for an output of amount 1</span>
        <VB_Txt color={c.muted}>
          Anyone can check it against <M>f₁(2)·G₂</M>. It is a share, not a signature under <M>f₁(0)·G₂</M>.
        </VB_Txt>
      </VB_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Per amount, m2 stores one scalar <M>fₐ(2)</M>, only in private configuration.
        </StepItem>
        <StepItem n={2} step={s}>
          Public: every member's <M>fₐ(j)·G₂</M> and the keyset key <M>fₐ(0)·G₂</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Unknown to m2: <M>fₐ(0)</M>, the other members' scalars, the coefficients of <M>fₐ</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          Alone, m2 produces one share per request, not a signature.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: attacker ───────────────────────────────────────────────────

const VB_SA_W = [300, 440, 480];

const VB_SaRow = ({ j, s, all, per }: { j: number; s: number; all: string; per: ReactNode }) => (
  <VB_TRow h={66} show={s >= j} hot={Math.min(s, 3) === j} tone={j === 3 ? 'bad' : 'clay'}>
    <VB_TCell w={VB_SA_W[0]}>
      <M size={30}>{j}</M>
    </VB_TCell>
    <VB_TCell w={VB_SA_W[1]}>
      <M size={30}>{all}</M>
    </VB_TCell>
    <VB_TCell w={VB_SA_W[2]}>
      <M size={28}>{per}</M>
    </VB_TCell>
  </VB_TRow>
);

const VB_ShAttacker: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const j = Math.min(s, 3);
  const tone = (i: number): Tone => (i < j ? 'bad' : 'idle');
  return (
    <VarShell of={VB_OF_SH} lens="Perspective: attacker" title="Collecting shares of a 3-of-5 key" proc={proc}>
      <Canvas>
        <Member x={260} y={330} r={40} label="m1" tone={tone(0)} />
        <Member x={420} y={330} r={40} label="m2" tone={tone(1)} />
        <Member x={580} y={330} r={40} label="m3" tone={tone(2)} />
        <Member x={740} y={330} r={40} label="m4" tone={tone(3)} />
        <Member x={900} y={330} r={40} label="m5" tone={tone(4)} />
      </Canvas>
      <At x={1000} y={308} w={340}>
        <span style={{ fontSize: 26, color: c.muted, marginRight: 14 }}>compromised</span>
        <M size={34} color={j > 0 ? c.bad : c.ink}>
          j = {j}
        </M>
      </At>
      <At x={120} y={410} w={1220}>
        <VB_TRow h={52} head>
          <VB_TCell w={VB_SA_W[0]} head upper={false}>
            shares known, <M>j</M>
          </VB_TCell>
          <VB_TCell w={VB_SA_W[1]} head upper={false}>
            polynomials of degree ≤ 2 that fit
          </VB_TCell>
          <VB_TCell w={VB_SA_W[2]} head upper={false}>
            of those, with <M>f(0) = k′</M>
          </VB_TCell>
        </VB_TRow>
        <VB_SaRow j={0} s={s} all="97³" per={<>97², <VB_Wd>for every</VB_Wd> k′</>} />
        <VB_SaRow j={1} s={s} all="97²" per={<>97, <VB_Wd>for every</VB_Wd> k′</>} />
        <VB_SaRow j={2} s={s} all="97" per={<>1, <VB_Wd>for every</VB_Wd> k′</>} />
        <VB_SaRow j={3} s={s} all="1" per={<>1 <VB_Wd>for</VB_Wd> k′ = k, 0 <VB_Wd>otherwise</VB_Wd></>} />
      </At>
      <VB_Box x={120} y={770} w={1220} h={168} show={s >= 4} tone="bad">
        <VB_Cap color={c.bad}>at the threshold</VB_Cap>
        <VB_Txt>
          Interpolation gives <M>k = f(0)</M>, and the three members can compute <M>k·B′</M> for any <M>B′</M> without
          the others. Production profile (<Code>validate_bft_safety</Code>): <M>t &gt; ⌊(n − 1)/3⌋</M>, the number of
          faulty members consensus tolerates.
        </VB_Txt>
      </VB_Box>
      <StepList>
        <StepItem n={1} step={s}>
          One member compromised: every candidate <M>k′</M> still fits 97 polynomials.
        </StepItem>
        <StepItem n={2} step={s}>
          Two: every <M>k′</M> fits exactly one. Still nothing learned about <M>k</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Three, the threshold: one polynomial fits, <M>k</M> is determined.
        </StepItem>
        <StepItem n={4} step={s}>
          With <M>t</M> shares the attacker signs on its own.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          Toy field <M>𝔽₉₇</M>, <M>t = 3</M>. Over <M>𝔽ᵣ</M> the counts are powers of <M>r</M>; the argument is the
          same.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Focus: why one share reveals nothing ────────────────────────────────────

const VB_OS_W = [200, 300, 260, 300];

const VB_OsRow = ({ k, a, f2, s, hot = false }: { k: string; a: string; f2: string; s: number; hot?: boolean }) => (
  <VB_TRow h={50} hot={hot && s >= 4}>
    <VB_TCell w={VB_OS_W[0]} show={s >= 2}>
      <M size={28}>{k}</M>
    </VB_TCell>
    <VB_TCell w={VB_OS_W[1]} show={s >= 2}>
      <M size={28}>{a}</M>
    </VB_TCell>
    <VB_TCell w={VB_OS_W[2]} show={s >= 2} color={s >= 3 ? c.clayHex : c.ink}>
      <M size={28}>65</M>
    </VB_TCell>
    <VB_TCell w={VB_OS_W[3]} show={s >= 4}>
      <M size={28} color={hot ? c.clayHex : undefined}>
        {f2}
      </M>
    </VB_TCell>
  </VB_TRow>
);

const VB_OsGap = ({ s }: { s: number }) => (
  <VB_TRow h={34}>
    <VB_TCell w={VB_OS_W[0]} show={s >= 2} color={c.muted}>
      ⋮
    </VB_TCell>
    <VB_TCell w={VB_OS_W[1]} show={s >= 2} color={c.muted}>
      ⋮
    </VB_TCell>
    <VB_TCell w={VB_OS_W[2]} show={s >= 2} color={c.muted}>
      ⋮
    </VB_TCell>
    <VB_TCell w={VB_OS_W[3]} show={s >= 4} color={c.muted}>
      ⋮
    </VB_TCell>
  </VB_TRow>
);

const VB_ShOneShare: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const W = VB_OS_W;
  return (
    <VarShell of={VB_OF_SH} lens="Focus: why one share reveals nothing" title="One share fits every secret" proc={proc}>
      <At x={120} y={262} w={1220}>
        <VB_Eq show={s >= 1} size={30} h={48}>
          <VB_Wd>dealer:</VB_Wd>&nbsp; f(x) = 20 + 45x <Up>mod</Up> 97,&nbsp; k₁ = 65, k₂ = 13, k₃ = 58
        </VB_Eq>
      </At>
      <At x={120} y={330} w={1060}>
        <VB_TRow h={48} head>
          <VB_TCell w={W[0]} head upper={false} show={s >= 2}>
            <M size={26}>k′</M>
          </VB_TCell>
          <VB_TCell w={W[1]} head upper={false} show={s >= 2}>
            <M size={26}>a′ = 65 − k′</M>
          </VB_TCell>
          <VB_TCell w={W[2]} head upper={false} show={s >= 2}>
            <M size={26}>f′(1) = k′ + a′</M>
          </VB_TCell>
          <VB_TCell w={W[3]} head upper={false} show={s >= 4}>
            <M size={26}>f′(2) = k′ + 2a′</M>
          </VB_TCell>
        </VB_TRow>
        <VB_OsRow k="0" a="65" f2="33" s={s} />
        <VB_OsRow k="1" a="64" f2="32" s={s} />
        <VB_OsRow k="2" a="63" f2="31" s={s} />
        <VB_OsGap s={s} />
        <VB_OsRow k="20" a="45" f2="13" s={s} hot />
        <VB_OsGap s={s} />
        <VB_OsRow k="50" a="15" f2="80" s={s} />
        <VB_OsGap s={s} />
        <VB_OsRow k="96" a="66" f2="34" s={s} />
      </At>
      <At x={120} y={806} w={1220}>
        <Fade show={s >= 3}>
          <VB_Txt>
            Each <M>k′</M> fits exactly one line through (1, 65). With <M>a₁</M> uniform, every <M>k′</M> has
            probability 1/97.
          </VB_Txt>
        </Fade>
        <Fade show={s >= 4} style={{ marginTop: 8 }}>
          <VB_Txt color={c.clayHex}>
            <M>k₂ = 13</M> leaves one row: <M>k′ = 20</M>.
          </VB_Txt>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Dealer: a line over <M>𝔽₉₇</M> with <M>k = 20</M>, three shares.
        </StepItem>
        <StepItem n={2} step={s}>
          An observer holds only <M>k₁ = 65</M> and tries every candidate secret <M>k′</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Each <M>k′</M> has exactly one slope <M>a′</M> that fits. The share favours no <M>k′</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          A second share, <M>k₂ = 13</M>, is consistent with one row only.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          All arithmetic mod 97. Over <M>𝔽ᵣ</M> the same holds for any <M>t − 1</M> shares.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: before and after ───────────────────────────────────────────────

const VB_BaRow = ({ s, cap, left, right }: { s: number; cap: string; left: ReactNode; right: ReactNode }) => (
  <VB_TRow h={92} show={s >= 3}>
    <VB_TCell w={180} color={c.muted}>
      {cap}
    </VB_TCell>
    <VB_TCell w={400}>{left}</VB_TCell>
    <VB_TCell w={40}> </VB_TCell>
    <VB_TCell w={600}>{right}</VB_TCell>
  </VB_TRow>
);

const VB_ShBeforeAfter: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const mx = [820, 935, 1050, 1165, 1280];
  return (
    <VarShell of={VB_OF_SH} lens="Framing: before and after" title="Where the mint key lives" proc={proc}>
      <At x={120} y={262} w={580}>
        <Label>standalone v3 mint</Label>
      </At>
      <At x={760} y={262} w={580}>
        <Label color={c.clayHex}>federation</Label>
      </At>
      <Canvas>
        <GFade show={s >= 1}>
          <rect x={300} y={312} width={220} height={124} rx={14} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.75 }} />
          <T x={410} y={360} size={26}>
            mint host
          </T>
          <T x={410} y={414} size={40} font="math" color={c.clayHex}>
            k
          </T>
        </GFade>
        <GFade show={s >= 2}>
          <Member x={mx[0]} y={346} r={32} label="m1" />
          <Member x={mx[1]} y={346} r={32} label="m2" />
          <Member x={mx[2]} y={346} r={32} label="m3" />
          <Member x={mx[3]} y={346} r={32} label="m4" />
          <Member x={mx[4]} y={346} r={32} label="m5" />
          <T x={mx[0]} y={414} size={26} font="math" color={c.clayHex}>
            f(1)
          </T>
          <T x={mx[1]} y={414} size={26} font="math" color={c.clayHex}>
            f(2)
          </T>
          <T x={mx[2]} y={414} size={26} font="math" color={c.clayHex}>
            f(3)
          </T>
          <T x={mx[3]} y={414} size={26} font="math" color={c.clayHex}>
            f(4)
          </T>
          <T x={mx[4]} y={414} size={26} font="math" color={c.clayHex}>
            f(5)
          </T>
        </GFade>
      </Canvas>
      <At x={760} y={432} w={580} style={{ textAlign: 'center' }}>
        <Fade show={s >= 2} delay={150}>
          <M size={24}>t = 3, n = 5</M>
          <span style={{ fontSize: 22, color: c.muted }}>
            {' '}
            · <M>k = f(0)</M> is never computed
          </span>
        </Fade>
      </At>
      <At x={120} y={478} w={1220}>
        <VB_BaRow
          s={s}
          cap="signing"
          left={
            <>
              <M>C′ = k·B′</M> on one host
            </>
          }
          right={
            <>
              <M>C′ = Σ λᵢ·kᵢ·B′</M> from <M>t</M> shares, summed by the wallet
            </>
          }
        />
        <VB_BaRow
          s={s}
          cap="compromise"
          left="one host: full signing power"
          right={
            <>
              <M>t − 1</M> hosts: nothing about <M>k</M>. <M>t</M> hosts: full signing power
            </>
          }
        />
        <VB_BaRow
          s={s}
          cap="availability"
          left="host offline: no issuance"
          right={
            <>
              shares from any <M>t</M> members; ordering needs <M>c = 4</M> of 5
            </>
          }
        />
      </At>
      <VB_Box x={120} y={790} w={1220} h={70} show={s >= 4} tone="cool" pad="16px 20px">
        <VB_Txt>
          Public in both: <M>K = k·G₂</M> per amount, the same v3 keyset, the same proofs.
        </VB_Txt>
      </VB_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Standalone: <M>k</M> is stored on one host.
        </StepItem>
        <StepItem n={2} step={s}>
          Federation: shares <M>f(i)</M> on <M>n</M> hosts. With DKG, <M>k</M> exists nowhere.
        </StepItem>
        <StepItem n={3} step={s}>
          Signing, compromise and availability, side by side.
        </StepItem>
        <StepItem n={4} step={s}>
          Unchanged: the published <M>K</M> and the token.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.2 Lagrange interpolation at x = 0
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VB_LgBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const X = (x: number) => 200 + 150 * x;
  const Y = (y: number) => 880 - 26 * y;
  return (
    <VarShell of={VB_OF_LG} lens="Beginner" title="Reading f(0) off two points" proc={proc}>
      <Canvas>
        <VB_Axes x0={200} y0={880} x1={700} y1={380} />
        <Draw x1={X(1)} y1={Y(10)} x2={X(2)} y2={Y(13)} show={s >= 2} color={c.node} width={2} />
        <Draw x1={X(2)} y1={Y(13)} x2={X(3)} y2={Y(16)} show={s >= 5} color={c.node} width={2} />
        <GFade show={s >= 2}>
          <line x1={X(1)} y1={Y(10)} x2={X(2)} y2={Y(10)} style={VB_DASH} />
          <line x1={X(2)} y1={Y(10)} x2={X(2)} y2={Y(13)} style={VB_DASH} />
          <T x={(X(1) + X(2)) / 2} y={Y(10) + 32} size={26} font="math" color={c.muted}>
            1
          </T>
          <T x={X(2) + 14} y={(Y(10) + Y(13)) / 2 + 9} size={26} font="math" color={c.muted} anchor="start">
            3
          </T>
        </GFade>
        <Draw x1={X(1)} y1={Y(10)} x2={X(0)} y2={Y(7)} show={s >= 3} />
        <Dot x={X(0)} y={Y(7)} r={10} ring show={s >= 3} delay={600} />
        <T x={172} y={Y(7) + 10} size={28} anchor="end" color={c.clayHex} show={s >= 3} delay={600}>
          7
        </T>
        <Dot x={X(1)} y={Y(10)} color={c.cool} show={s >= 1} />
        <Dot x={X(2)} y={Y(13)} color={c.cool} show={s >= 1} delay={60} />
        <Dot x={X(3)} y={Y(16)} color={c.cool} show={s >= 5} />
        <T x={X(1)} y={Y(10) - 26} size={26} show={s >= 1}>
          10
        </T>
        <T x={X(2) - 8} y={Y(13) - 26} size={26} show={s >= 1} delay={60}>
          13
        </T>
        <T x={X(3)} y={Y(16) - 26} size={26} show={s >= 5}>
          16
        </T>
        <T x={X(1)} y={920} size={22} font="mono" color={c.muted} show={s >= 1}>
          m1
        </T>
        <T x={X(2)} y={920} size={22} font="mono" color={c.muted} show={s >= 1} delay={60}>
          m2
        </T>
        <T x={X(3)} y={920} size={22} font="mono" color={c.muted} show={s >= 5}>
          m3
        </T>
      </Canvas>
      <At x={760} y={290} w={580}>
        <VB_Eq show={s >= 1} h={66}>
          f(1) = 10,&nbsp; f(2) = 13
        </VB_Eq>
        <VB_Eq show={s >= 2} h={66}>
          <VB_Wd>slope</VB_Wd> = (13 − 10)/(2 − 1) = 3
        </VB_Eq>
        <VB_Eq show={s >= 3} h={66}>
          f(0) = 10 − 3 = 7
        </VB_Eq>
        <VB_Eq show={s >= 4} h={66}>
          f(0) = 10 − (13 − 10) = 2·10 − 1·13
        </VB_Eq>
        <VB_Eq show={s >= 4} h={66} delay={150}>
          <Hi>λ₁ = 2,&nbsp; λ₂ = −1</Hi>
        </VB_Eq>
        <VB_Eq show={s >= 5} h={66}>
          <VB_Wd>IDs 1 and 3:</VB_Wd>&nbsp; <Hi>λ₁ = 3/2,&nbsp; λ₃ = −1/2</Hi>
        </VB_Eq>
        <VB_Eq show={s >= 5} h={66} delay={150}>
          1.5·10 − 0.5·16 = 7
        </VB_Eq>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Two members report their values.
        </StepItem>
        <StepItem n={2} step={s}>
          Slope: rise over run between the two points.
        </StepItem>
        <StepItem n={3} step={s}>
          Walk back from <M>x = 1</M> to <M>x = 0</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          The same result as a weighted sum of the two values.
        </StepItem>
        <StepItem n={5} step={s}>
          The weights depend only on which IDs answered, not on the values.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          <M>f(x) = 7 + 3x</M>, so <M>k = f(0) = 7</M>.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VB_LgAdvanced: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_LG} lens="Advanced" title="Computing the weights in 𝔽ᵣ" proc={proc}>
      <At x={120} y={258} w={900}>
        <Note>
          <Code>crates/cashu/src/nuts/nut01/bls.rs</Code>, condensed
        </Note>
      </At>
      <At x={120} y={300} w={900}>
        <div style={{ background: c.card, border: `1.5px solid ${c.rule}`, borderRadius: 12, padding: '16px 24px' }}>
          <JLine on={false}>{'fn aggregate_blind_signature_shares(threshold, shares) {'}</JLine>
          <JLine on={s === 1}>{'    validate_threshold_shares(threshold, signer_ids)?;'}</JLine>
          <JLine on={false}>{'    let mut aggregate = G1Projective::identity();'}</JLine>
          <JLine on={false}>{'    for share in shares {'}</JLine>
          <JLine on={s === 2}>{'        let coefficient = lagrange_coefficient_at_zero('}</JLine>
          <JLine on={s === 2}>{'            share.signer_id, signer_ids)?;'}</JLine>
          <JLine on={s === 3}>{'        aggregate += G1Projective::from(share.signature.point())'}</JLine>
          <JLine on={s === 3}>{'            * coefficient;'}</JLine>
          <JLine on={false}>{'    }'}</JLine>
          <JLine on={s === 3}>{'    g1_from_projective(aggregate)  // rejects the identity'}</JLine>
          <JLine on={false}>{'}'}</JLine>
          <JLine on={false}>{'fn lagrange_coefficient_at_zero(signer_id, signer_ids) {'}</JLine>
          <JLine on={s === 2}>{'    for other_id in signer_ids {  // skips signer_id'}</JLine>
          <JLine on={s === 2}>{'        numerator *= -x_j;  denominator *= x_i - x_j;'}</JLine>
          <JLine on={false}>{'    }'}</JLine>
          <JLine on={s === 2}>{'    Ok(numerator * denominator_inverse)'}</JLine>
          <JLine on={false}>{'}'}</JLine>
        </div>
      </At>
      <At x={1080} y={270} w={720}>
        <Fade show={s >= 1} dimTo={0.2}>
          <Check ok={false}>
            Fewer than <M>t</M> shares: <Code>InsufficientThresholdShares</Code>
          </Check>
          <Check ok={false}>
            Duplicate signer IDs: <Code>DuplicateThresholdSignerId</Code>
          </Check>
        </Fade>
        <Fade show={s >= 2} dimTo={0.2} style={{ marginTop: 16 }}>
          <Check>
            <M>
              λ<VB_Sb>i</VB_Sb> = Π (−x<VB_Sb>j</VB_Sb>)/(x<VB_Sb>i</VB_Sb> − x<VB_Sb>j</VB_Sb>)
            </M>{' '}
            over <M>j ∈ S, j ≠ i</M>: one inversion in <M>𝔽ᵣ</M> per share
          </Check>
          <Check>Distinct non-zero IDs keep every denominator non-zero</Check>
        </Fade>
        <Fade show={s >= 3} dimTo={0.2} style={{ marginTop: 16 }}>
          <Check>
            <M>C′ = Σ λᵢ·C′ᵢ</M>: <M>t</M> scalar multiplications in G₁ per output
          </Check>
          <Check ok={false}>
            Identity result: <Code>InvalidPublicKey</Code>
          </Check>
        </Fade>
        <Fade show={s >= 4} dimTo={0.2} style={{ marginTop: 16 }}>
          <Check>
            Every share passed in is used; the wallet passes exactly <M>t</M>
          </Check>
          <Check>
            Test: subsets {'{1, 3, 5}'} and {'{2, 3, 4}'} of a 3-of-5 keyset give the same <M>k·B′</M>
          </Check>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VB_LX = (v: number) => 240 + 90 * v;

const VB_BAxis = ({ y, s, set, first }: { y: number; s: number; set: string; first?: boolean }) => (
  <g>
    <Line x1={VB_LX(0)} y1={y} x2={VB_LX(17)} y2={y} color={c.node} />
    <line x1={VB_LX(0)} y1={y - 8} x2={VB_LX(0)} y2={y + 8} style={{ stroke: c.node, strokeWidth: 1.5 }} />
    <T x={VB_LX(0)} y={y + 36} size={24} font="math" color={c.muted}>
      0
    </T>
    <T x={120} y={y + 9} size={28} font="math" anchor="start" color={c.muted}>
      {set}
    </T>
    <Dot x={VB_LX(4.2)} y={y} r={7} color={c.cool} show={s >= 1} />
    <Dot x={VB_LX(5.4)} y={y} r={7} color={c.cool} show={s >= 1} delay={50} />
    <Dot x={VB_LX(6.6)} y={y} r={7} color={c.cool} show={s >= 1} delay={100} />
    <T x={VB_LX(4.2)} y={y + 36} size={24} font="math" color={c.cool} show={s >= 1}>
      C′₁
    </T>
    <T x={VB_LX(5.4)} y={y + 36} size={24} font="math" color={c.cool} show={s >= 1} delay={50}>
      C′₂
    </T>
    <T x={VB_LX(6.6)} y={y + 36} size={24} font="math" color={c.cool} show={s >= 1} delay={100}>
      C′₃
    </T>
    {first && (
      <T x={VB_LX(17)} y={y + 36} size={22} anchor="end" color={c.muted}>
        multiples of B′
      </T>
    )}
  </g>
);

const VB_BPath = ({
  y,
  show,
  a,
  b,
  la,
  lb,
}: {
  y: number;
  show: boolean;
  a: number;
  b: number;
  la: string;
  lb: string;
}) => (
  <g>
    <Arrow x1={VB_LX(0)} y1={y - 100} x2={VB_LX(a)} y2={y - 100} show={show} color={c.clayHex} />
    <T x={VB_LX(a) - 14} y={y - 114} size={28} font="math" anchor="end" color={c.clayHex} show={show} delay={300}>
      {la}
    </T>
    <GFade show={show} delay={500}>
      <line x1={VB_LX(a)} y1={y - 100} x2={VB_LX(a)} y2={y - 50} style={{ stroke: c.node, strokeWidth: 1.5, strokeDasharray: '4 5' }} />
    </GFade>
    <Arrow x1={VB_LX(a)} y1={y - 50} x2={VB_LX(b)} y2={y - 50} show={show} color={c.violet} delay={600} />
    <T x={(VB_LX(a) + VB_LX(b)) / 2} y={y - 64} size={28} font="math" color={c.violet} show={show} delay={900}>
      {lb}
    </T>
    <GFade show={show} delay={1100}>
      <line x1={VB_LX(b)} y1={y - 50} x2={VB_LX(b)} y2={y} style={{ stroke: c.node, strokeWidth: 1.5, strokeDasharray: '4 5' }} />
    </GFade>
    <Dot x={VB_LX(b)} y={y} r={9} ring show={show} delay={1200} />
  </g>
);

const VB_LgGraphical: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const rows = [450, 640, 830];
  return (
    <VarShell of={VB_OF_LG} lens="Graphical" title="Interpolation as point arithmetic" proc={proc}>
      <At x={120} y={262} w={1200}>
        <M size={30}>C′ᵢ = f(i)·B′,&nbsp; f(x) = 3 + 1.2x</M>
      </At>
      <Canvas>
        <GFade show={s >= 4} delay={1300}>
          <line
            x1={VB_LX(3)}
            y1={330}
            x2={VB_LX(3)}
            y2={872}
            style={{ stroke: c.clayHex, strokeWidth: 1.75, strokeDasharray: '6 6' }}
          />
          <T x={VB_LX(3)} y={912} size={30} font="math" color={c.clayHex}>
            C′ = 3·B′ = k·B′
          </T>
        </GFade>
        <VB_BAxis y={rows[0]} s={s} set="{1, 2}" first />
        <VB_BAxis y={rows[1]} s={s} set="{1, 3}" />
        <VB_BAxis y={rows[2]} s={s} set="{2, 3}" />
        <VB_BPath y={rows[0]} show={s >= 2} a={8.4} b={3} la="2·C′₁" lb="−1·C′₂" />
        <VB_BPath y={rows[1]} show={s >= 3} a={6.3} b={3} la="1.5·C′₁" lb="−0.5·C′₃" />
        <VB_BPath y={rows[2]} show={s >= 4} a={16.2} b={3} la="3·C′₂" lb="−2·C′₃" />
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via a table ───────────────────────────────────────────────────

const VB_LT_W = [220, 140, 140, 140, 140, 140, 170, 220];

const VB_LRow = ({ set, l, s, hot = false }: { set: string; l: string[]; s: number; hot?: boolean }) => (
  <VB_TRow h={52} hot={hot && s >= 3}>
    <VB_TCell w={VB_LT_W[0]}>
      <M size={26}>{set}</M>
    </VB_TCell>
    <VB_TCell w={VB_LT_W[1]} align="center">
      <M size={26}>{l[0]}</M>
    </VB_TCell>
    <VB_TCell w={VB_LT_W[2]} align="center">
      <M size={26}>{l[1]}</M>
    </VB_TCell>
    <VB_TCell w={VB_LT_W[3]} align="center">
      <M size={26}>{l[2]}</M>
    </VB_TCell>
    <VB_TCell w={VB_LT_W[4]} align="center">
      <M size={26}>{l[3]}</M>
    </VB_TCell>
    <VB_TCell w={VB_LT_W[5]} align="center">
      <M size={26}>{l[4]}</M>
    </VB_TCell>
    <VB_TCell w={VB_LT_W[6]} align="center" show={s >= 1}>
      <M size={26}>1</M>
    </VB_TCell>
    <VB_TCell w={VB_LT_W[7]} align="center" show={s >= 2}>
      <M size={26} color={c.clayHex}>
        3
      </M>
    </VB_TCell>
  </VB_TRow>
);

const VB_LgTable: Page = () => {
  const proc = useProcess(3);
  const s = proc.step;
  const W = VB_LT_W;
  return (
    <VarShell of={VB_OF_LG} lens="Explained via a table" title="Weights for every 3-of-5 subset" proc={proc}>
      <At x={120} y={262} w={1310}>
        <VB_TRow h={48} head>
          <VB_TCell w={W[0]} head upper={false}>
            <M size={26}>S</M>
          </VB_TCell>
          <VB_TCell w={W[1]} head upper={false} align="center">
            <M size={26}>λ₁</M>
          </VB_TCell>
          <VB_TCell w={W[2]} head upper={false} align="center">
            <M size={26}>λ₂</M>
          </VB_TCell>
          <VB_TCell w={W[3]} head upper={false} align="center">
            <M size={26}>λ₃</M>
          </VB_TCell>
          <VB_TCell w={W[4]} head upper={false} align="center">
            <M size={26}>λ₄</M>
          </VB_TCell>
          <VB_TCell w={W[5]} head upper={false} align="center">
            <M size={26}>λ₅</M>
          </VB_TCell>
          <VB_TCell w={W[6]} head upper={false} align="center" show={s >= 1}>
            <M size={26}>Σ λᵢ</M>
          </VB_TCell>
          <VB_TCell w={W[7]} head upper={false} align="center" show={s >= 2}>
            <M size={26}>Σ λᵢ·f(i)</M>
          </VB_TCell>
        </VB_TRow>
        <VB_LRow set="{1, 2, 3}" l={['3', '−3', '1', '', '']} s={s} />
        <VB_LRow set="{1, 2, 4}" l={['8/3', '−2', '', '1/3', '']} s={s} />
        <VB_LRow set="{1, 2, 5}" l={['5/2', '−5/3', '', '', '1/6']} s={s} />
        <VB_LRow set="{1, 3, 4}" l={['2', '', '−2', '1', '']} s={s} />
        <VB_LRow set="{1, 3, 5}" l={['15/8', '', '−5/4', '', '3/8']} s={s} hot />
        <VB_LRow set="{1, 4, 5}" l={['5/3', '', '', '−5/3', '1']} s={s} />
        <VB_LRow set="{2, 3, 4}" l={['', '6', '−8', '3', '']} s={s} hot />
        <VB_LRow set="{2, 3, 5}" l={['', '5', '−5', '', '1']} s={s} />
        <VB_LRow set="{2, 4, 5}" l={['', '10/3', '', '−5', '8/3']} s={s} />
        <VB_LRow set="{3, 4, 5}" l={['', '', '10', '−15', '6']} s={s} />
      </At>
      <At x={1480} y={262} w={320}>
        <VB_Cap>shares</VB_Cap>
        <M size={26}>f(x) = 3 + 2.5x − 0.3x²</M>
        <div style={{ marginTop: 10 }}>
          <M size={26}>f(1…5) =</M>
        </div>
        <div>
          <M size={26}>5.2, 6.8, 7.8, 8.2, 8.0</M>
        </div>
        <Fade show={s >= 1} style={{ marginTop: 28 }}>
          <VB_Txt color={c.muted}>
            <M>Σ λᵢ = 1</M>: the weights interpolate the constant polynomial 1.
          </VB_Txt>
        </Fade>
        <Fade show={s >= 2} style={{ marginTop: 18 }}>
          <VB_Txt color={c.muted}>
            <M>Σ λᵢ·f(i) = f(0) = 3</M> for every subset.
          </VB_Txt>
        </Fade>
      </At>
      <At x={120} y={858} w={1680}>
        <Fade show={s >= 3}>
          <Note>
            In <M>𝔽ᵣ</M> each fraction is a field element, e.g. <M>15/8 = 15·8⁻¹</M>. Highlighted: the subsets of{' '}
            <Code>test_threshold_bls_three_of_five_aggregates_any_valid_subset</Code>.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Perspective: federation member ──────────────────────────────────────────

const VB_LmPanel = ({
  top,
  s,
  on,
  set,
  other,
  otherLabel,
  f1,
  f2,
}: {
  top: number;
  s: number;
  on: number;
  set: string;
  other: 2 | 3;
  otherLabel: string;
  f1: string;
  f2: string;
}) => {
  const mx = 330;
  const wy = top + 150;
  const my = [top + 60, top + 150, top + 240];
  const oy = my[other - 1];
  const silent = other === 2 ? my[2] : my[1];
  const tone = (i: number): Tone => {
    if (i === 1) return s >= 1 ? 'on' : 'idle';
    if (i === other) return s >= on ? 'on' : 'idle';
    return s >= on ? 'off' : 'idle';
  };
  return (
    <>
      <VB_Box x={120} y={top} w={1220} h={300} tone="panel" />
      <At x={140} y={top + 14}>
        <M size={28}>S = {set}</M>
      </At>
      <Canvas>
        <Arrow x1={mx + 32} y1={my[0] + 8} x2={770} y2={wy - 12} show={s >= 1} color={c.clayHex} />
        <T x={560} y={top + 84} size={28} font="math" color={s >= 4 ? c.clayHex : c.ink} show={s >= 1} delay={300}>
          C′₁ = 4.2·B′
        </T>
        <Arrow x1={mx + 32} y1={oy} x2={770} y2={wy + (other === 2 ? 0 : 12)} show={s >= on} color={c.cool} />
        <T x={560} y={other === 2 ? top + 138 : top + 180} size={28} font="math" show={s >= on} delay={300}>
          {otherLabel}
        </T>
        <Member x={mx} y={my[0]} r={30} label="m1" tone={tone(1)} />
        <Member x={mx} y={my[1]} r={30} label="m2" tone={tone(2)} />
        <Member x={mx} y={my[2]} r={30} label="m3" tone={tone(3)} />
        <T x={mx - 50} y={silent + 8} size={22} anchor="end" color={c.dim} show={s >= on}>
          silent
        </T>
        <WalletNode x={820} y={wy} r={50} />
      </Canvas>
      <At x={900} y={top + 104} w={420}>
        <Fade show={s >= on} delay={500}>
          <M size={30}>{f1}</M>
          <div>
            <M size={30}>{f2}</M>
          </div>
        </Fade>
      </At>
    </>
  );
};

const VB_LgMember: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_LG} lens="Perspective: federation member" title="Members do not need to know S" proc={proc}>
      <VB_LmPanel top={270} s={s} on={2} set="{1, 2}" other={2} otherLabel="C′₂ = 5.4·B′" f1="2·C′₁ − 1·C′₂" f2="= 3·B′" />
      <VB_LmPanel top={600} s={s} on={3} set="{1, 3}" other={3} otherLabel="C′₃ = 6.6·B′" f1="1.5·C′₁ − 0.5·C′₃" f2="= 3·B′" />
      <StepList>
        <StepItem n={1} step={s}>
          m1 answers with <M>C′₁ = k₁·B′</M>. It does not know who else will answer.
        </StepItem>
        <StepItem n={2} step={s}>
          If m2 also answers, <M>S = {'{1, 2}'}</M> and the wallet weights <M>C′₁</M> by 2.
        </StepItem>
        <StepItem n={3} step={s}>
          If m3 answers instead, <M>S = {'{1, 3}'}</M> and the weight is 3/2. m1's response is the same.
        </StepItem>
        <StepItem n={4} step={s}>
          The wallet applies the weights. A member that weighted its own share would need <M>S</M> before answering.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          <M>f(x) = 3 + 1.2x</M>, <M>k = 3</M>.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Worked example end to end ───────────────────────────────────────────────

const VB_LW_W = [220, 120, 120, 120, 120, 120];

const VB_LgWorked: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const W = VB_LW_W;
  return (
    <VarShell of={VB_OF_LG} lens="Worked example end to end" title="3-of-5 interpolation mod 97" proc={proc}>
      <At x={120} y={262} w={1220}>
        <VB_Eq show={s >= 1} size={30} h={46}>
          f(x) = 20 + 45x + 11x² <Up>mod</Up> 97,&nbsp;&nbsp; k = f(0) = 20
        </VB_Eq>
      </At>
      <At x={120} y={320} w={820}>
        <VB_TRow h={48} head show={s >= 1}>
          <VB_TCell w={W[0]} head upper={false}>
            <M size={26}>x</M>
          </VB_TCell>
          <VB_TCell w={W[1]} head upper={false} align="center">
            <M size={26}>1</M>
          </VB_TCell>
          <VB_TCell w={W[2]} head upper={false} align="center">
            <M size={26}>2</M>
          </VB_TCell>
          <VB_TCell w={W[3]} head upper={false} align="center">
            <M size={26}>3</M>
          </VB_TCell>
          <VB_TCell w={W[4]} head upper={false} align="center">
            <M size={26}>4</M>
          </VB_TCell>
          <VB_TCell w={W[5]} head upper={false} align="center">
            <M size={26}>5</M>
          </VB_TCell>
        </VB_TRow>
        <VB_TRow h={52} show={s >= 1}>
          <VB_TCell w={W[0]}>
            <M size={28}>
              f(x) <Up>mod</Up> 97
            </M>
          </VB_TCell>
          <VB_TCell w={W[1]} align="center">
            <M size={28}>76</M>
          </VB_TCell>
          <VB_TCell w={W[2]} align="center">
            <M size={28}>57</M>
          </VB_TCell>
          <VB_TCell w={W[3]} align="center">
            <M size={28}>60</M>
          </VB_TCell>
          <VB_TCell w={W[4]} align="center">
            <M size={28}>85</M>
          </VB_TCell>
          <VB_TCell w={W[5]} align="center">
            <M size={28}>35</M>
          </VB_TCell>
        </VB_TRow>
      </At>
      <VB_Box x={120} y={446} w={590} h={300} show={s >= 2} tone="clay">
        <VB_Cap color={c.clayHex}>S = {'{1, 3, 5}'}</VB_Cap>
        <VB_Eq show h={44} size={28}>
          λ₁ = 15/8 ≡ 14
        </VB_Eq>
        <VB_Eq show h={44} size={28}>
          λ₃ = −5/4 ≡ 23
        </VB_Eq>
        <VB_Eq show h={44} size={28}>
          λ₅ = 3/8 ≡ 61
        </VB_Eq>
        <VB_Eq show={s >= 3} h={44} size={28}>
          14·76 + 23·60 + 61·35
        </VB_Eq>
        <VB_Eq show={s >= 3} h={44} size={28} delay={150}>
          ≡ 94 + 22 + 1 = 117 ≡ <Hi>20</Hi>
        </VB_Eq>
      </VB_Box>
      <VB_Box x={750} y={446} w={590} h={300} show={s >= 4} tone="clay">
        <VB_Cap color={c.clayHex}>S = {'{2, 3, 4}'}</VB_Cap>
        <VB_Eq show h={44} size={28}>
          λ₂ = 6
        </VB_Eq>
        <VB_Eq show h={44} size={28}>
          λ₃ = −8 ≡ 89
        </VB_Eq>
        <VB_Eq show h={44} size={28}>
          λ₄ = 3
        </VB_Eq>
        <VB_Eq show h={44} size={28}>
          6·57 + 89·60 + 3·85
        </VB_Eq>
        <VB_Eq show h={44} size={28} delay={150}>
          ≡ 51 + 5 + 61 = 117 ≡ <Hi>20</Hi>
        </VB_Eq>
      </VB_Box>
      <VB_Box x={120} y={776} w={1220} h={118} show={s >= 5} tone="cool">
        <M size={30}>C′ = Σ λᵢ·C′ᵢ = 20·B′</M>
        <span style={{ fontSize: 24 }}> for both subsets</span>
        <VB_Txt color={c.muted}>The in-tree 3-of-5 test aggregates the same two subsets.</VB_Txt>
      </VB_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Dealer polynomial of degree 2 over <M>𝔽₉₇</M>, five shares.
        </StepItem>
        <StepItem n={2} step={s}>
          <M>S = {'{1, 3, 5}'}</M>: weights as fractions, reduced mod 97.
        </StepItem>
        <StepItem n={3} step={s}>
          Weighted sum of the shares: 20, which is <M>k</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          <M>S = {'{2, 3, 4}'}</M>: different weights, same <M>k</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          The same weights on G₁ points give <M>C′ = k·B′</M>.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          Inverses mod 97: <M>8⁻¹ ≡ 85</M>, <M>4⁻¹ ≡ 73</M>.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: failure mode ───────────────────────────────────────────────────

const VB_LgFailure: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_LG} lens="Framing: failure mode" title="Interpolating a bad share" proc={proc}>
      <VB_Box x={120} y={270} w={360} h={144} show={s >= 1} tone={s >= 3 ? 'clay' : 'rule'}>
        <VB_Cap upper={false}>m1</VB_Cap>
        <M size={32}>C′₁ = 4.2·B′</M>
      </VB_Box>
      <VB_Box x={520} y={270} w={360} h={144} show={s >= 1} tone={s >= 2 ? 'bad' : 'rule'} delay={60}>
        <VB_Cap color={s >= 2 ? c.bad : c.muted} upper={false}>
          m2
        </VB_Cap>
        <M size={32}>C′₂ = {s >= 2 ? '6.4' : '5.4'}·B′</M>
        <div style={{ fontSize: 21, color: c.muted, opacity: s >= 2 ? 1 : 0, transition: `opacity 300ms ${EASE_OUT}` }}>
          honest value: 5.4·B′
        </div>
      </VB_Box>
      <VB_Box x={920} y={270} w={360} h={144} show={s >= 1} tone={s >= 5 ? 'clay' : 'rule'} delay={120}>
        <VB_Cap upper={false}>m3</VB_Cap>
        <M size={32}>C′₃ = 6.6·B′</M>
      </VB_Box>
      <At x={120} y={444} w={1220}>
        <VB_Eq show={s >= 3} h={48}>
          S = {'{1, 2}'}:&nbsp; 2·4.2 − 1·6.4 = 2,&nbsp; <VB_Wd>so</VB_Wd> C′ = 2·B′ ≠ k·B′
        </VB_Eq>
        <Fade show={s >= 3} delay={150} style={{ marginTop: 8 }}>
          <VB_Txt color={c.muted}>
            After unblinding <M>C = 2·Y</M>, and <M><Up>e</Up>(C, G₂) ≠ <Up>e</Up>(Y, K)</M>. The error is{' '}
            <M>λ₂·δ·B′</M> with <M>δ = 1</M>; the sum does not say which share was wrong.
          </VB_Txt>
        </Fade>
      </At>
      <At x={120} y={600} w={1220}>
        <Fade show={s >= 4}>
          <Check>
            <M size={28}>
              <Up>e</Up>(C′₁, G₂) = <Up>e</Up>(B′, K₁)
            </M>
          </Check>
          <Check ok={false}>
            <M size={28}>
              <Up>e</Up>(C′₂, G₂) ≠ <Up>e</Up>(B′, K₂)
            </M>
            : m2 is dropped
          </Check>
        </Fade>
      </At>
      <VB_Box x={120} y={730} w={1220} h={80} show={s >= 5} tone="good" pad="16px 20px">
        <M size={32}>
          S = {'{1, 3}'}:&nbsp; 1.5·4.2 − 0.5·6.6 = 3,&nbsp; <VB_Wd>so</VB_Wd> C′ = 3·B′ = k·B′
        </M>
      </VB_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Honest shares: <M>C′ᵢ = f(i)·B′</M> with <M>f(x) = 3 + 1.2x</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          m2 returns <M>6.4·B′</M> instead of <M>5.4·B′</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Interpolation still yields a point, the wrong one. The final check fails without naming the culprit.
        </StepItem>
        <StepItem n={4} step={s}>
          Checking each share against its <M>Kᵢ</M> first identifies m2.
        </StepItem>
        <StepItem n={5} step={s}>
          Drop m2, use m3.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          <Code>aggregate_blind_signature_shares</Code> also rejects fewer than <M>t</M> shares and duplicate signer IDs.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.2 Threshold blind signing
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VB_TsBeginner: Page = () => {
  const proc = useProcess(6);
  const s = proc.step;
  const w = { x: 220, y: 380 };
  const m = [
    { x: 700, y: 300 },
    { x: 700, y: 380 },
    { x: 700, y: 460 },
  ];
  const tone = (i: number): Tone => (s >= 3 ? (i === 1 ? 'off' : 'on') : 'idle');
  return (
    <VarShell of={VB_OF_TS} lens="Beginner" title="Threshold signing with toy numbers" proc={proc}>
      <Canvas>
        <Line x1={w.x + 48} y1={w.y} x2={m[0].x - 30} y2={m[0].y} color={c.cool} opacity={0.5} />
        <Line x1={w.x + 48} y1={w.y} x2={m[1].x - 30} y2={m[1].y} color={c.cool} opacity={s >= 3 ? 0.15 : 0.5} />
        <Line x1={w.x + 48} y1={w.y} x2={m[2].x - 30} y2={m[2].y} color={c.cool} opacity={0.5} />
        <Packet x1={w.x + 48} y1={w.y} x2={m[0].x - 30} y2={m[0].y} run={proc.anim && s === 2} />
        <Packet x1={w.x + 48} y1={w.y} x2={m[1].x - 30} y2={m[1].y} run={proc.anim && s === 2} delay={50} />
        <Packet x1={w.x + 48} y1={w.y} x2={m[2].x - 30} y2={m[2].y} run={proc.anim && s === 2} delay={100} />
        <Packet x1={m[0].x - 30} y1={m[0].y} x2={w.x + 48} y2={w.y} run={proc.anim && s === 3} color={c.clayHex} />
        <Packet x1={m[2].x - 30} y1={m[2].y} x2={w.x + 48} y2={w.y} run={proc.anim && s === 3} color={c.clayHex} delay={120} />
        <WalletNode x={w.x} y={w.y} r={48} />
        <T x={w.x} y={w.y + 84} size={28} font="math" show={s >= 1}>
          Y = <tspan style={{ fontStyle: 'normal' }}>H</tspan>(x)
        </T>
        <T x={430} y={w.y - 62} size={28} font="math" color={c.cool} show={s >= 2}>
          B′
        </T>
        <Member x={m[0].x} y={m[0].y} r={30} label="m1" tone={tone(0)} />
        <Member x={m[1].x} y={m[1].y} r={30} label="m2" tone={tone(1)} />
        <Member x={m[2].x} y={m[2].y} r={30} label="m3" tone={tone(2)} />
        <T x={748} y={m[0].y + 9} size={26} font="math" anchor="start">
          k₁ = 10
        </T>
        <T x={748} y={m[1].y + 9} size={26} font="math" anchor="start" color={s >= 3 ? c.dim : c.ink}>
          k₂ = 13
        </T>
        <T x={748} y={m[2].y + 9} size={26} font="math" anchor="start">
          k₃ = 16
        </T>
      </Canvas>
      <At x={960} y={290} w={380}>
        <Note>
          Toy numbers: <M>k = 7</M>, <M>kᵢ = 7 + 3i</M>, <M>r = 5</M>. Real scalars live in <M>𝔽ᵣ</M>.
        </Note>
      </At>
      <At x={120} y={516} w={1220}>
        <VB_Eq show={s >= 2}>B′ = r·Y = 5·Y</VB_Eq>
        <VB_Eq show={s >= 3}>C′₁ = 10·B′ = 50·Y,&nbsp;&nbsp; C′₃ = 16·B′ = 80·Y</VB_Eq>
        <VB_Eq show={s >= 4}>C′ = 3/2·C′₁ − 1/2·C′₃ = 75·Y − 40·Y = 35·Y</VB_Eq>
        <VB_Eq show={s >= 5}>
          C = r⁻¹·C′ = 35·Y / 5 = 7·Y = <Hi>k·Y</Hi>
        </VB_Eq>
        <Fade show={s >= 6} style={{ marginTop: 10 }}>
          <VB_Txt>
            No member used <M>k = 7</M>. <M>(x, C)</M> is what a single mint with key 7 would issue.
          </VB_Txt>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Hash the secret <M>x</M> to a point <M>Y</M>. Below, every point is a multiple of <M>Y</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Blind with <M>r = 5</M>. Members see only <M>B′</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          m1 and m3 multiply <M>B′</M> by their shares. m2 does not answer.
        </StepItem>
        <StepItem n={4} step={s}>
          Combine with the weights for IDs 1 and 3: 3/2 and −1/2.
        </StepItem>
        <StepItem n={5} step={s}>
          Unblind with <M>r⁻¹</M>.
        </StepItem>
        <StepItem n={6} step={s}>
          Same result as one mint with <M>k = 7</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VB_Stage = ({ i, s, title, children }: { i: number; s: number; title: string; children: ReactNode }) => (
  <VB_Box
    x={120}
    y={262 + (i - 1) * 104}
    w={1180}
    h={92}
    show={s >= i}
    tone={s === i ? 'clay' : 'rule'}
    pad="10px 20px"
    style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}
  >
    <span style={{ fontFamily: MONO, fontSize: 22, color: s === i ? c.clayHex : c.muted, width: 26, paddingTop: 2 }}>{i}</span>
    <div>
      <div style={{ fontSize: 24, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 21, lineHeight: 1.38, color: c.muted }}>{children}</div>
    </div>
  </VB_Box>
);

const VB_TsAdvanced: Page = () => {
  const proc = useProcess(6);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_TS} lens="Advanced" title="Share verification and selection in the wallet" proc={proc}>
      <VB_Stage i={1} s={s} title="Fan-out">
        Same Cashu request to every member's <Code>public_mint_url</Code>, via <Code>FederatedMintConnector</Code>.
      </VB_Stage>
      <VB_Stage i={2} s={s} title="Metadata, per member">
        Each signature must match its output's amount and keyset ID (<Code>validate_signature_metadata</Code>).
      </VB_Stage>
      <VB_Stage i={3} s={s} title="Batch pairing check, per member">
        All of a member's shares in one multi-pairing, DST <Code>Cashu_BLS_Blind_Batch_v1</Code>.
      </VB_Stage>
      <VB_Stage i={4} s={s} title="Fallback">
        On failure, <Code>verify_blind_signature_share</Code> per output names the bad share; member ignored.
      </VB_Stage>
      <VB_Stage i={5} s={s} title="Selection">
        Group members by identical (amount, keyset ID) lists; first group with ≥ <M>t</M> members; take <M>t</M>.
      </VB_Stage>
      <VB_Stage i={6} s={s} title="Aggregation">
        <Code>aggregate_blind_signature_shares(t, shares)</Code> per output → <Code>BlindSignature</Code> with{' '}
        <Code>dleq: None</Code>.
      </VB_Stage>
      <At x={1350} y={262} w={450}>
        <VB_Cap>batch check, one member</VB_Cap>
        <div>
          <M size={26}>
            <Up>e</Up>(−Σ w<VB_Sb>j</VB_Sb>·C′<VB_Sb>j</VB_Sb>, G₂)
          </M>
        </div>
        <div>
          <M size={26}>
            · ∏ <Up>e</Up>(Σ w<VB_Sb>j</VB_Sb>·B′<VB_Sb>j</VB_Sb>, K<VB_Sb>i,a</VB_Sb>) = 1
          </M>
        </div>
        <div style={{ marginTop: 6 }}>
          <VB_Txt size={22} color={c.muted}>
            <M>
              w<VB_Sb>j</VB_Sb>
            </M>
            : non-zero weights from a SHA-256 transcript; one factor per key{' '}
            <M>
              K<VB_Sb>i,a</VB_Sb>
            </M>{' '}
            (member <M>i</M>, amount <M>a</M>); one final exponentiation
          </VB_Txt>
        </div>
        <div style={{ marginTop: 22 }}>
          <VB_Cap>signer ID</VB_Cap>
          <VB_Txt size={22} color={c.muted}>
            taken from the member that answered, <Code>member_id.to_bls_signer_id()</Code>, not from the response
          </VB_Txt>
        </div>
        <div style={{ marginTop: 22 }}>
          <VB_Cap>no compatible group</VB_Cap>
          <VB_Txt size={22} color={c.muted}>
            <Code>InvalidMintResponse</Code>: insufficient valid federation signature shares
          </VB_Txt>
        </div>
        <div style={{ marginTop: 22 }}>
          <Note>
            <Code>crates/cdk/src/wallet/federation.rs</Code>
          </Note>
        </div>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VB_TsGraphical: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const W = { x: 260, y: 590 };
  const MX = 1100;
  const ys = [330, 460, 590, 720, 850];
  const GX = 790;
  const gy = (y: number) => 590 + (y - 590) * ((GX - 320) / (MX - 40 - 320));
  const Q = { x: 540, y: 820 };
  const tone = (i: number): Tone => {
    if (i === 3) return s >= 2 ? 'off' : 'idle';
    if (i === 1) return s >= 3 ? 'bad' : 'idle';
    return s >= 3 ? 'on' : 'idle';
  };
  const back = (i: number) => (
    <Packet x1={MX - 40} y1={ys[i]} x2={GX} y2={gy(ys[i])} run={proc.anim && s === 2} color={c.clayHex} delay={i * 60} />
  );
  const merge = (i: number) => (
    <Packet x1={GX} y1={gy(ys[i])} x2={Q.x} y2={Q.y} run={proc.anim && s === 4} color={c.clayHex} delay={i * 60} />
  );
  return (
    <VarShell of={VB_OF_TS} lens="Graphical" title="3-of-5 threshold signing" proc={proc}>
      <Canvas>
        <Line x1={320} y1={590} x2={MX - 40} y2={ys[0]} color={c.cool} opacity={0.4} />
        <Line x1={320} y1={590} x2={MX - 40} y2={ys[1]} color={c.cool} opacity={0.4} />
        <Line x1={320} y1={590} x2={MX - 40} y2={ys[2]} color={c.cool} opacity={0.4} />
        <Line x1={320} y1={590} x2={MX - 40} y2={ys[3]} color={c.cool} opacity={s >= 2 ? 0.12 : 0.4} />
        <Line x1={320} y1={590} x2={MX - 40} y2={ys[4]} color={c.cool} opacity={0.4} />
        <Packet x1={320} y1={590} x2={MX - 40} y2={ys[0]} run={proc.anim && s === 1} />
        <Packet x1={320} y1={590} x2={MX - 40} y2={ys[1]} run={proc.anim && s === 1} delay={50} />
        <Packet x1={320} y1={590} x2={MX - 40} y2={ys[2]} run={proc.anim && s === 1} delay={100} />
        <Packet x1={320} y1={590} x2={MX - 40} y2={ys[3]} run={proc.anim && s === 1} delay={150} />
        <Packet x1={320} y1={590} x2={MX - 40} y2={ys[4]} run={proc.anim && s === 1} delay={200} />
        <T x={350} y={548} size={30} font="math" color={c.cool} show={s >= 1}>
          B′
        </T>
        <GFade show={s >= 3}>
          <line x1={GX} y1={300} x2={GX} y2={880} style={{ stroke: c.node, strokeWidth: 1.5, strokeDasharray: '5 7' }} />
        </GFade>
        <GFade show={s >= 2}>
          <line x1={MX - 40} y1={ys[0]} x2={GX} y2={gy(ys[0])} style={{ stroke: c.clayHex, strokeWidth: 2 }} />
          <line
            x1={MX - 40}
            y1={ys[1]}
            x2={GX}
            y2={gy(ys[1])}
            style={{ stroke: s >= 3 ? c.bad : c.clayHex, strokeWidth: 2, transition: `stroke 300ms ${EASE_OUT}` }}
          />
          <line x1={MX - 40} y1={ys[2]} x2={GX} y2={gy(ys[2])} style={{ stroke: c.clayHex, strokeWidth: 2 }} />
          <line x1={MX - 40} y1={ys[4]} x2={GX} y2={gy(ys[4])} style={{ stroke: c.clayHex, strokeWidth: 2 }} />
        </GFade>
        {back(0)}
        {back(1)}
        {back(2)}
        {back(4)}
        <T x={GX - 16} y={gy(ys[0]) - 12} size={30} anchor="end" color={c.good} show={s >= 3}>
          ✓
        </T>
        <T x={GX - 16} y={gy(ys[1]) - 12} size={30} anchor="end" color={c.bad} show={s >= 3}>
          ✗
        </T>
        <T x={GX - 16} y={gy(ys[2]) - 12} size={30} anchor="end" color={c.good} show={s >= 3}>
          ✓
        </T>
        <T x={GX - 16} y={gy(ys[4]) - 12} size={30} anchor="end" color={c.good} show={s >= 3}>
          ✓
        </T>
        <Draw x1={GX} y1={gy(ys[0])} x2={Q.x} y2={Q.y} show={s >= 4} width={2} />
        <Draw x1={GX} y1={gy(ys[2])} x2={Q.x} y2={Q.y} show={s >= 4} width={2} delay={60} />
        <Draw x1={GX} y1={gy(ys[4])} x2={Q.x} y2={Q.y} show={s >= 4} width={2} delay={120} />
        {merge(0)}
        {merge(2)}
        {merge(4)}
        <Dot x={Q.x} y={Q.y} r={12} ring show={s >= 4} delay={700} />
        <T x={Q.x} y={Q.y + 54} size={28} font="math" show={s >= 4} delay={700}>
          C′ = Σ λᵢ·C′ᵢ
        </T>
        <Draw x1={Q.x - 14} y1={Q.y} x2={W.x + 72} y2={Q.y} show={s >= 5} width={2} dur={500} />
        <Packet x1={Q.x} y1={Q.y} x2={W.x + 70} y2={Q.y} run={proc.anim && s === 5} color={c.clayHex} />
        <GFade show={s >= 5} delay={500}>
          <rect x={W.x - 70} y={Q.y - 30} width={140} height={60} rx={10} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.75 }} />
          <T x={W.x} y={Q.y + 10} size={28} font="math">
            (x, C)
          </T>
          <T x={W.x} y={Q.y + 62} size={28} font="math" color={c.muted}>
            C = r⁻¹·C′
          </T>
        </GFade>
        <WalletNode x={W.x} y={W.y} r={60} />
        <Member x={MX} y={ys[0]} r={40} label="m1" tone={tone(0)} />
        <Member x={MX} y={ys[1]} r={40} label="m2" tone={tone(1)} />
        <Member x={MX} y={ys[2]} r={40} label="m3" tone={tone(2)} />
        <Member x={MX} y={ys[3]} r={40} label="m4" tone={tone(3)} />
        <Member x={MX} y={ys[4]} r={40} label="m5" tone={tone(4)} />
        <T x={MX + 60} y={ys[1] + 8} size={24} anchor="start" color={c.bad} show={s >= 3}>
          invalid share
        </T>
        <T x={MX + 60} y={ys[3] + 8} size={24} anchor="start" color={c.dim} show={s >= 2}>
          offline
        </T>
      </Canvas>
      <At x={590} y={262} w={400} style={{ textAlign: 'center' }}>
        <Fade show={s >= 3}>
          <span style={{ fontSize: 24, color: c.muted }}>check </span>
          <M size={28} color={c.muted}>
            <Up>e</Up>(C′ᵢ, G₂) = <Up>e</Up>(B′, Kᵢ)
          </M>
        </Fade>
      </At>
      <At x={1440} y={300} w={360}>
        <M size={56}>t = 3, n = 5</M>
      </At>
    </VarShell>
  );
};

// ─── Explained via sequence diagram ──────────────────────────────────────────

const VB_TsSequence: Page = () => {
  const proc = useProcess(6);
  const s = proc.step;
  const X = { w: 200, m1: 640, m2: 900, m3: 1160 };
  return (
    <VarShell of={VB_OF_TS} lens="Explained via sequence diagram" title="Threshold signing as a message sequence" proc={proc}>
      <Canvas>
        <Lifeline x={X.w} label="wallet" top={300} bottom={930} color={c.cool} />
        <Lifeline x={X.m1} label="m1" top={300} bottom={930} />
        <Lifeline x={X.m2} label="m2" top={300} bottom={930} />
        <Lifeline x={X.m3} label="m3" top={300} bottom={930} />
        <Arrow x1={X.w + 12} y1={332} x2={X.m1 - 10} y2={332} show={s >= 1} color={c.cool} />
        <Arrow x1={X.w + 12} y1={354} x2={X.m2 - 10} y2={354} show={s >= 1} color={c.cool} delay={60} />
        <Arrow x1={X.w + 12} y1={376} x2={X.m3 - 10} y2={376} show={s >= 1} color={c.cool} delay={120} />
        <T x={420} y={320} size={24} color={c.cool} show={s >= 1}>
          request with B′
        </T>
        <Band x1={600} x2={1200} y={440} label="operation accepted by consensus (1.3)" show={s >= 2} />
        <Arrow x1={X.m1 - 10} y1={600} x2={X.w + 12} y2={600} show={s >= 4} color={c.clayHex} />
        <T x={420} y={588} size={28} font="math" color={c.clayHex} show={s >= 4} delay={250}>
          C′₁
        </T>
        <Arrow x1={X.m3 - 10} y1={652} x2={X.w + 12} y2={652} show={s >= 4} color={c.clayHex} delay={120} />
        <T x={1030} y={640} size={28} font="math" color={c.clayHex} show={s >= 4} delay={370}>
          C′₃
        </T>
        <Arrow x1={X.m2 - 10} y1={612} x2={X.m2 - 120} y2={612} show={s >= 4} color={c.dim} dashed />
        <T x={X.m2 + 16} y={600} size={22} anchor="start" color={c.dim} show={s >= 4}>
          timeout
        </T>
      </Canvas>
      <VB_Box x={X.m1 - 85} y={492} w={170} h={52} show={s >= 3} pad="7px 10px" style={{ textAlign: 'center' }}>
        <M size={26}>C′₁ = k₁·B′</M>
      </VB_Box>
      <VB_Box x={X.m2 - 85} y={492} w={170} h={52} show={s >= 3} pad="7px 10px" delay={60} style={{ textAlign: 'center' }}>
        <M size={26}>C′₂ = k₂·B′</M>
      </VB_Box>
      <VB_Box x={X.m3 - 85} y={492} w={170} h={52} show={s >= 3} pad="7px 10px" delay={120} style={{ textAlign: 'center' }}>
        <M size={26}>C′₃ = k₃·B′</M>
      </VB_Box>
      <VB_Box x={X.w + 22} y={700} w={410} h={58} show={s >= 5} tone="cool" pad="8px 14px">
        <M size={26}>
          <Up>e</Up>(C′ᵢ, G₂) = <Up>e</Up>(B′, Kᵢ)
        </M>
        <span style={{ color: c.good, marginLeft: 12 }}>✓</span>
      </VB_Box>
      <VB_Box x={X.w + 22} y={772} w={410} h={58} show={s >= 6} tone="cool" pad="8px 14px">
        <M size={26}>C′ = λ₁·C′₁ + λ₃·C′₃</M>
      </VB_Box>
      <VB_Box x={X.w + 22} y={844} w={410} h={58} show={s >= 6} tone="cool" pad="8px 14px" delay={150}>
        <M size={26}>
          C = r⁻¹·C′,&nbsp; <Up>e</Up>(C, G₂) = <Up>e</Up>(Y, K)
        </M>
      </VB_Box>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet sends the same request, with <M>B′</M>, to every member.
        </StepItem>
        <StepItem n={2} step={s}>
          Members first order the operation (section 1.3).
        </StepItem>
        <StepItem n={3} step={s}>
          Each member that accepted computes its share.
        </StepItem>
        <StepItem n={4} step={s}>
          Shares go to the wallet, not to other members. m2's response times out.
        </StepItem>
        <StepItem n={5} step={s}>
          The wallet checks each share against <M>Kᵢ</M>.
        </StepItem>
        <StepItem n={6} step={s}>
          Interpolate with <M>t = 2</M> shares, unblind, verify with <M>K</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: Byzantine member ───────────────────────────────────────────

const VB_BY_W = [560, 640, 480];

const VB_ByRow = ({ i, s, a, b, r }: { i: number; s: number; a: ReactNode; b: ReactNode; r: ReactNode }) => (
  <VB_TRow h={90} show={s >= i} hot={s === i}>
    <VB_TCell w={VB_BY_W[0]}>{a}</VB_TCell>
    <VB_TCell w={VB_BY_W[1]}>{b}</VB_TCell>
    <VB_TCell w={VB_BY_W[2]} color={c.muted}>
      {r}
    </VB_TCell>
  </VB_TRow>
);

const VB_TsByzantine: Page = () => {
  const proc = useProcess(6);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_TS} lens="Perspective: Byzantine member" title="What a faulty member can return" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VB_TRow h={52} head>
          <VB_TCell w={VB_BY_W[0]} head>
            returned share
          </VB_TCell>
          <VB_TCell w={VB_BY_W[1]} head>
            wallet check
          </VB_TCell>
          <VB_TCell w={VB_BY_W[2]} head>
            result
          </VB_TCell>
        </VB_TRow>
        <VB_ByRow
          i={1}
          s={s}
          a={
            <>
              a random G₁ point <M>R</M>
            </>
          }
          b={
            <M>
              <Up>e</Up>(R, G₂) ≠ <Up>e</Up>(B′, K₃)
            </M>
          }
          r="invalid; m3 ignored for this request"
        />
        <VB_ByRow
          i={2}
          s={s}
          a={
            <>
              <M>k₃·B″</M>, a share for another blinded message <M>B″</M>
            </>
          }
          b={
            <M>
              <Up>e</Up>(k₃·B″, G₂) ≠ <Up>e</Up>(B′, K₃)
            </M>
          }
          r="invalid; m3 ignored"
        />
        <VB_ByRow
          i={3}
          s={s}
          a={
            <>
              m1's valid share <M>C′₁</M>
            </>
          }
          b={
            <>
              checked against <M>K₃</M>, since the signer ID is the member that answered: fails
            </>
          }
          r="invalid; m3 ignored"
        />
        <VB_ByRow
          i={4}
          s={s}
          a="a valid share with a wrong amount or keyset ID"
          b="metadata check against the requested output"
          r="rejected before any pairing"
        />
        <VB_ByRow
          i={5}
          s={s}
          a="no response"
          b="—"
          r={
            <>
              <M>t</M> shares from the other members suffice
            </>
          }
        />
      </At>
      <VB_Box x={120} y={792} w={1680} h={130} show={s >= 6} tone="cool">
        <VB_Cap color={c.cool} upper={false}>
          what m3 cannot do
        </VB_Cap>
        <VB_Txt>
          It cannot learn <M>x</M> (it sees only <M>B′ = r·Y</M>), finish a signature alone (it holds one share), or get
          a share that fails its <M>Kᵢ</M> check into the interpolation.
        </VB_Txt>
      </VB_Box>
    </VarShell>
  );
};

// ─── Framing: liveness ───────────────────────────────────────────────────────

const VB_LV_MX = [180, 270, 360, 450, 540];

const VB_LvRow = ({
  y,
  s,
  i,
  off,
  ord,
  ordOk,
  sh,
  shOk,
  res,
}: {
  y: number;
  s: number;
  i: number;
  off: number[];
  ord: string;
  ordOk: boolean;
  sh: string;
  shOk: boolean;
  res: ReactNode;
}) => {
  const tone = (k: number): Tone => (off.includes(k) ? 'off' : 'idle');
  const show = s >= i;
  return (
    <>
      <Canvas>
        <GFade show={show}>
          <Member x={VB_LV_MX[0]} y={y} r={32} label="m1" tone={tone(0)} />
          <Member x={VB_LV_MX[1]} y={y} r={32} label="m2" tone={tone(1)} />
          <Member x={VB_LV_MX[2]} y={y} r={32} label="m3" tone={tone(2)} />
          <Member x={VB_LV_MX[3]} y={y} r={32} label="m4" tone={tone(3)} />
          <Member x={VB_LV_MX[4]} y={y} r={32} label="m5" tone={tone(4)} />
          <line x1={120} y1={y + 70} x2={1800} y2={y + 70} style={{ stroke: c.rule, strokeWidth: 1 }} />
        </GFade>
      </Canvas>
      <At x={680} y={y - 22} w={280}>
        <Fade show={show} delay={80}>
          <M size={30}>{ord}</M>
          <span style={{ fontSize: 28, marginLeft: 14, color: ordOk ? c.good : c.bad }}>{ordOk ? '✓' : '✗'}</span>
        </Fade>
      </At>
      <At x={980} y={y - 22} w={280}>
        <Fade show={show} delay={160}>
          <M size={30}>{sh}</M>
          <span style={{ fontSize: 28, marginLeft: 14, color: shOk ? c.good : c.bad }}>{shOk ? '✓' : '✗'}</span>
        </Fade>
      </At>
      <At x={1280} y={y - 34} w={520} style={{ height: 68, display: 'flex', alignItems: 'center' }}>
        <Fade show={show} delay={240}>
          <VB_Txt>{res}</VB_Txt>
        </Fade>
      </At>
    </>
  );
};

const VB_TsLiveness: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <VarShell of={VB_OF_TS} lens="Framing: liveness" title="Which members must be online, n = 5" proc={proc}>
      <At x={120} y={262} w={500}>
        <Label>online members</Label>
      </At>
      <At x={680} y={262} w={280}>
        <Label>ordering</Label>
        <span style={{ fontSize: 22, color: c.muted }}>online ≥ </span>
        <M size={26}>c = 4</M>
      </At>
      <At x={980} y={262} w={280}>
        <Label>shares</Label>
        <span style={{ fontSize: 22, color: c.muted }}>online ≥ </span>
        <M size={26}>t = 3</M>
      </At>
      <At x={1280} y={262} w={520}>
        <Label>issuance</Label>
      </At>
      <VB_LvRow y={380} s={s} i={1} off={[]} ord="5 ≥ 4" ordOk sh="5 ≥ 3" shOk res={
          <>
            yes: any 3 of the 5 responses, 10 subsets, one <M>C</M>
          </>
        }
      />
      <VB_LvRow y={520} s={s} i={2} off={[3]} ord="4 ≥ 4" ordOk sh="4 ≥ 3" shOk res={
          <>
            yes: 4 subsets of 3, one <M>C</M>
          </>
        }
      />
      <VB_LvRow
        y={660}
        s={s}
        i={3}
        off={[3, 4]}
        ord="3 < 4"
        ordOk={false}
        sh="3 ≥ 3"
        shOk
        res="no: the shares would suffice, but no operation is accepted"
      />
      <VB_LvRow y={800} s={s} i={4} off={[2, 3, 4]} ord="2 < 4" ordOk={false} sh="2 < 3" shOk={false} res="no" />
      <At x={120} y={892} w={1680}>
        <Note>
          Members sign only after the operation is accepted: issuance needs <M>c</M> members for ordering and <M>t</M>{' '}
          responses. Model: <M>c = n − ⌊(n − 1)/3⌋</M>, <M>t ≤ c</M>.
        </Note>
      </At>
    </VarShell>
  );
};

// ─── Framing: where aggregation happens ──────────────────────────────────────

const VB_TsAggregator: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const my = 620;
  const lw = { x: 410, y: 350 };
  const lm = [250, 410, 570];
  const rw = { x: 1050, y: 350 };
  const rm = [890, 1050, 1210];
  return (
    <VarShell of={VB_OF_TS} lens="Framing: where aggregation happens" title="The wallet as aggregator" proc={proc}>
      <At x={120} y={262} w={580}>
        <Label color={c.clayHex}>star · implemented</Label>
      </At>
      <At x={760} y={262} w={580}>
        <Label>relay via one member · not used</Label>
      </At>
      <Canvas>
        <Line x1={730} y1={262} x2={730} y2={900} color={c.rule} />
        <Line x1={lw.x} y1={lw.y + 46} x2={lm[0]} y2={my - 36} color={s >= 2 ? c.clayHex : c.cool} opacity={0.6} />
        <Line x1={lw.x} y1={lw.y + 46} x2={lm[1]} y2={my - 36} color={s >= 2 ? c.clayHex : c.cool} opacity={0.6} />
        <Line x1={lw.x} y1={lw.y + 46} x2={lm[2]} y2={my - 36} color={s >= 2 ? c.clayHex : c.cool} opacity={0.6} />
        <Packet x1={lw.x} y1={lw.y + 46} x2={lm[0]} y2={my - 36} run={proc.anim && s === 1} />
        <Packet x1={lw.x} y1={lw.y + 46} x2={lm[1]} y2={my - 36} run={proc.anim && s === 1} delay={50} />
        <Packet x1={lw.x} y1={lw.y + 46} x2={lm[2]} y2={my - 36} run={proc.anim && s === 1} delay={100} />
        <Packet x1={lm[0]} y1={my - 36} x2={lw.x} y2={lw.y + 46} run={proc.anim && s === 2} color={c.clayHex} />
        <Packet x1={lm[1]} y1={my - 36} x2={lw.x} y2={lw.y + 46} run={proc.anim && s === 2} color={c.clayHex} delay={60} />
        <Packet x1={lm[2]} y1={my - 36} x2={lw.x} y2={lw.y + 46} run={proc.anim && s === 2} color={c.clayHex} delay={120} />
        <T x={470} y={345} size={28} font="math" anchor="start" color={c.clayHex} show={s >= 2} delay={600}>
          Σ λᵢ·C′ᵢ
        </T>
        <WalletNode x={lw.x} y={lw.y} r={46} />
        <Member x={lm[0]} y={my} r={36} label="m1" tone={s >= 2 ? 'on' : 'idle'} />
        <Member x={lm[1]} y={my} r={36} label="m2" tone={s >= 2 ? 'on' : 'idle'} />
        <Member x={lm[2]} y={my} r={36} label="m3" tone={s >= 2 ? 'on' : 'idle'} />
        <GFade show={s >= 3} to={0.5}>
          <line x1={rw.x} y1={rw.y + 46} x2={rm[0]} y2={my - 36} style={{ stroke: c.cool, strokeWidth: 1.5 }} />
          <line x1={rw.x} y1={rw.y + 46} x2={rm[2]} y2={my - 36} style={{ stroke: c.cool, strokeWidth: 1.5 }} />
        </GFade>
        <Arrow x1={rm[0] + 38} y1={my} x2={rm[1] - 40} y2={my} show={s >= 3} color={c.clayHex} />
        <Arrow x1={rm[2] - 38} y1={my} x2={rm[1] + 40} y2={my} show={s >= 3} color={c.clayHex} delay={80} />
        <T x={(rm[0] + rm[1]) / 2} y={my - 16} size={26} font="math" color={c.clayHex} show={s >= 3} delay={300}>
          C′₁
        </T>
        <T x={(rm[1] + rm[2]) / 2} y={my - 16} size={26} font="math" color={c.clayHex} show={s >= 3} delay={380}>
          C′₃
        </T>
        <Arrow x1={rw.x} y1={my - 38} x2={rw.x} y2={rw.y + 50} show={s >= 4} color={c.clayHex} />
        <T x={rw.x + 18} y={500} size={30} font="math" anchor="start" color={c.clayHex} show={s >= 4} delay={300}>
          C′
        </T>
        <WalletNode x={rw.x} y={rw.y} r={46} />
        <Member x={rm[0]} y={my} r={36} label="m1" tone={s >= 3 ? 'on' : 'idle'} />
        <Member x={rm[1]} y={my} r={36} label="m2" tone={s >= 4 ? 'on' : 'idle'} />
        <Member x={rm[2]} y={my} r={36} label="m3" tone={s >= 3 ? 'on' : 'idle'} />
      </Canvas>
      <At x={120} y={700} w={580}>
        <Fade show={s >= 2}>
          <Check>Members never exchange shares.</Check>
          <Check>
            The wallet checks each <M>C′ᵢ</M> against <M>Kᵢ</M> and can name a faulty member.
          </Check>
          <Check>
            Any <M>t</M> responses suffice.
          </Check>
        </Fade>
      </At>
      <At x={760} y={700} w={580}>
        <Fade show={s >= 4}>
          <VB_Txt>One member is on the path of every signature.</VB_Txt>
          <div style={{ height: 12 }} />
          <VB_Txt>
            The wallet receives one <M>C′</M> and checks it against <M>K</M>.
          </VB_Txt>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Implemented: the wallet sends the request to every member.
        </StepItem>
        <StepItem n={2} step={s}>
          Shares come back to the wallet, which checks and interpolates.
        </StepItem>
        <StepItem n={3} step={s}>
          Alternative, not used: members forward shares to one member.
        </StepItem>
        <StepItem n={4} step={s}>
          That member returns one <M>C′</M>.
        </StepItem>
        <Note style={{ marginTop: 24, fontSize: 22 }}>
          The private plane, <Code>/federation/v1</Code>, carries consensus, catch-up and DKG, not signature shares.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Deck ────────────────────────────────────────────────────────────────────

const PAGES: [Page, string | undefined][] = [
  [VB_Cover, undefined],
  [Multisig, 'Original slide.'],
  [
    VB_MsBeginner,
    'Beginner. Two ways to get 2-of-3 issuance side by side, one idea per step: independent keys versus one key split into shares. Say: with multisig the receiver gets two signatures and a rule; with threshold BLS the receiver gets one signature under one key.',
  ],
  [
    VB_MsAdvanced,
    'Advanced. Three designs, not two: bare secp multisig, interpolated secp DHKE, threshold BLS. The interpolated secp variant also yields one C, but checking it offline needs a DLEQ under K, and nobody holds k. Pairings make the same check work for a share against Ki and for the result against K.',
  ],
  [
    VB_MsGraphical,
    'Graphical. Proof size as t grows from 2 to 5: the multisig proof gains a 33-byte signature per signer plus roster and policy; the BLS proof stays one 48-byte G1 point. Let the figure run; R loops it.',
  ],
  [
    VB_MsLifecycle,
    'Explained via the token lifecycle. Walk the five stages: with multisig every stage handles the bundle, with threshold BLS only issuance knows about the federation. Close with: multisig federates the token, threshold BLS federates the issuer.',
  ],
  [
    VB_MsReceiver,
    'Perspective: the receiver. What arrives, what she must know in advance, what she computes, which software can do it. A threshold BLS token is checked by any v3 wallet with one pairing.',
  ],
  [
    VB_MsSignerSet,
    'Focus: signer set visibility. Three subsets of a 2-of-3 federation, with the toy line f(x) = 3 + 1.2x. Multisig proofs name their signers; the threshold result is C′ = 3·B′ for every subset.',
  ],
  [
    VB_MsConstraint,
    'Framing: the design constraint. A Cashu proof is (amount, id, secret, C) and the wallet-to-mint protocol stays Cashu. Multisig changes the proof format; threshold BLS interpolates before the proof exists, so keyset, receivers and wallet API stay as they are.',
  ],
  [Shamir, 'Original slide.'],
  [
    VB_ShBeginner,
    'Beginner. Ordinary integers instead of field elements: k = 7, slope 3, shares 10, 13, 16. One value is consistent with a line through any intercept; two values fix the line and give back 7.',
  ],
  [
    VB_ShAdvanced,
    'Advanced. The implementation rules: polynomial over the BLS12-381 scalar field, non-zero u16 signer IDs, rejection of duplicates and zero shares, the threshold parameter checks including the production BFT profile, and the byte encodings of the three share types. Sources: nut01/bls.rs and federation/config.rs.',
  ],
  [
    VB_ShGraphical,
    'Graphical. t = 3 with five members, so the polynomial is a parabola. Two shares leave a family of parabolas with different intercepts; the third share fixes it. Let the steps carry it.',
  ],
  [
    VB_ShLinear,
    'Explained via linear algebra. Each share is one row of a Vandermonde system. One row leaves k free; two rows with distinct IDs are invertible, and the first row of the inverse is the Lagrange weight vector. This also explains why ID 0 is forbidden and duplicate IDs are rejected.',
  ],
  [
    VB_ShMember,
    'Perspective: a federation member. Per amount, m2 holds one private scalar and knows every public share and the keyset key. It never learns f(0). Alone it can produce a share per request, checkable against its public share, but not a signature.',
  ],
  [
    VB_ShAttacker,
    'Perspective: an attacker collecting shares of a 3-of-5 key, counted in the toy field F97. With up to two shares every candidate k fits the same number of polynomials, so nothing is learned. Three shares determine k and allow signing without the other members.',
  ],
  [
    VB_ShOneShare,
    'Focus: why one share reveals nothing, over F97 with f(x) = 20 + 45x. For every candidate secret exactly one slope fits k1 = 65. The second share selects the single consistent row, k = 20.',
  ],
  [
    VB_ShBeforeAfter,
    'Framing: before and after. A standalone v3 mint holds k on one host; the federation holds shares on n hosts, and with DKG k exists nowhere. Compare signing, compromise and availability; the published K and the token stay the same.',
  ],
  [Lagrange, 'Original slide.'],
  [
    VB_LgBeginner,
    'Beginner. Slope and step back with two points of f(x) = 7 + 3x, then the same result rewritten as 2·10 − 1·13. The weights depend only on which IDs answered; with IDs 1 and 3 they are 3/2 and −1/2.',
  ],
  [
    VB_LgAdvanced,
    'Advanced. The aggregation code, condensed: validation, one Lagrange coefficient per share with one field inversion, scalar multiplication in G1, rejection of the identity. Mention the in-tree 3-of-5 test with subsets {1, 3, 5} and {2, 3, 4}.',
  ],
  [
    VB_LgGraphical,
    'Graphical. Interpolation drawn as point arithmetic on the multiples of B′. Each subset takes a different path and lands on the same point, 3·B′ = k·B′.',
  ],
  [
    VB_LgTable,
    'Explained via a table. All ten 3-of-5 subsets with their weights. Every row sums to 1, which interpolates the constant polynomial, and every weighted sum of the shares gives k = 3. The highlighted rows are the subsets of the in-tree test.',
  ],
  [
    VB_LgMember,
    "Perspective: a federation member. m1's response is the same whichever other member answers; only the weight changes, and the wallet applies it. So members need no agreement on S before answering.",
  ],
  [
    VB_LgWorked,
    'Worked example end to end over F97: a degree-2 polynomial, five shares, two subsets, weights reduced mod 97, the same k = 20 from both. The subsets match the in-tree 3-of-5 test.',
  ],
  [
    VB_LgFailure,
    'Framing: failure mode. A wrong share still interpolates to a point, just the wrong one; the final check against K fails without naming the culprit. The per-share check against Ki identifies m2, and m3 replaces it.',
  ],
  [ThresholdSign, 'Original slide.'],
  [
    VB_TsBeginner,
    'Beginner. Every point written as a multiple of Y, with toy integers: k = 7, shares 10, 13, 16, r = 5. Two members answer, the wallet combines 50·Y and 80·Y into 35·Y and unblinds to 7·Y. No member used k.',
  ],
  [
    VB_TsAdvanced,
    'Advanced. The wallet side as implemented: fan-out, per-member metadata check, per-member batch pairing with the blind batch DST, per-share fallback that names the bad share, grouping by metadata, exactly t members, aggregation with dleq set to None. Code: wallet/federation.rs.',
  ],
  [
    VB_TsGraphical,
    'Graphical. 3-of-5: fan-out, m4 offline, m2 returns a share that fails its pairing check, three valid shares are combined and unblinded. Little text; let the figure run.',
  ],
  [
    VB_TsSequence,
    'Explained via a sequence diagram. The same flow with explicit messages, including the ordering step from section 1.3 before any share is computed. m2 accepted the operation but its response times out; two shares suffice.',
  ],
  [
    VB_TsByzantine,
    'Perspective: a Byzantine member. Four things m3 could return instead of its share and why the wallet rejects each, plus withholding, which only costs liveness. The signer ID comes from which member answered, not from the response.',
  ],
  [
    VB_TsLiveness,
    'Framing: liveness for n = 5, t = 3, c = 4. Signing needs t responses, but members sign only after ordering, which needs c members. With three members online the shares would suffice, yet no operation is accepted.',
  ],
  [
    VB_TsAggregator,
    'Framing: where aggregation happens. The implementation is a star: the wallet collects, checks and interpolates; members never exchange shares. Contrast with relaying shares through one member, which is not used.',
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · Threshold issuance (temporary)',
  createdAt: '2026-09-28T09:09:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
