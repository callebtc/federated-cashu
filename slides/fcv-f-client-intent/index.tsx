import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  At,
  Arrow,
  Band,
  c,
  Canvas,
  Code,
  Draw,
  EASE_IO,
  EASE_OUT,
  Fade,
  GFade,
  InputDigest,
  InputsSign,
  Lifeline,
  Line,
  M,
  MATH,
  Member,
  MONO,
  Note,
  Packet,
  REDUCED,
  Rewrite,
  SANS,
  SERIF,
  StepItem,
  StepList,
  Summary,
  T,
  Transcript,
  Up,
  useProcess,
  VarCover,
  VarShell,
  WalletNode,
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

// ─── Local helpers ───────────────────────────────────────────────────────────

const VF_OF_RW = '1.6 Proof rewriting by a Byzantine member';
const VF_OF_TR = '1.6 v3 transaction transcript (NUT-10)';
const VF_OF_ID = '1.6 Per-input signing digest';
const VF_OF_IS = '1.6 Inputs sign, outputs never do';
const VF_OF_SM = 'Summary: Federation components';

/** Uppercase caption at 21 px. */
const VF_Lab = ({ children, color = c.muted }: { children: ReactNode; color?: string }) => (
  <div style={{ fontSize: 21, letterSpacing: '0.08em', textTransform: 'uppercase', color }}>{children}</div>
);

const VF_enter = (show: boolean, delay: number, dim = 0): CSSProperties => ({
  opacity: show ? 1 : dim,
  transform: show || REDUCED || dim > 0 ? 'translateY(0px)' : 'translateY(6px)',
  transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
});

/** Absolutely positioned card with an optional caption. */
const VF_Box = ({
  x,
  y,
  w,
  h,
  title,
  tone = c.rule,
  fill = c.card,
  show = true,
  delay = 0,
  dim = 0,
  pad = '14px 22px',
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  title?: ReactNode;
  tone?: string;
  fill?: string;
  show?: boolean;
  delay?: number;
  dim?: number;
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
      border: `1.5px solid ${tone}`,
      background: fill,
      borderRadius: 12,
      padding: pad,
      ...VF_enter(show, delay, dim),
    }}
  >
    {title && <VF_Lab color={tone === c.rule || tone === c.line ? c.muted : tone}>{title}</VF_Lab>}
    {children}
  </div>
);

/** Centered node for figures. */
const VF_Node = ({
  x,
  y,
  w = 280,
  h = 76,
  title,
  value,
  tone = c.node,
  fill = c.card,
  show = true,
  delay = 0,
  dashed = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: ReactNode;
  value?: ReactNode;
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
      padding: '0 10px',
      ...VF_enter(show, delay),
    }}
  >
    <div style={{ fontSize: 22, lineHeight: 1.25 }}>{title}</div>
    {value && <div style={{ fontFamily: MONO, fontSize: 21, color: c.muted, marginTop: 4 }}>{value}</div>}
  </div>
);

/** A byte segment with a caption underneath (caption ≥ 21 px). */
const VF_Seg = ({
  bytes,
  label,
  tone = 'field',
  show = true,
  delay = 0,
  hot = false,
  size = 21,
}: {
  bytes: ReactNode;
  label?: ReactNode;
  tone?: 'type' | 'len' | 'field' | 'bad' | 'good';
  show?: boolean;
  delay?: number;
  hot?: boolean;
  size?: number;
}) => {
  const border = hot ? c.clayHex : tone === 'type' ? c.clayHex : tone === 'bad' ? c.bad : tone === 'good' ? c.good : c.rule;
  const bg = hot
    ? c.claySoft
    : tone === 'type'
      ? c.claySoft
      : tone === 'len'
        ? c.panel
        : tone === 'bad'
          ? c.badSoft
          : tone === 'good'
            ? c.goodSoft
            : c.card;
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 8,
        ...VF_enter(show, delay),
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: size,
          padding: '5px 10px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          border: `1.5px solid ${border}`,
          background: bg,
          color: tone === 'len' && !hot ? c.muted : c.ink,
          transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
        }}
      >
        {bytes}
      </span>
      {label && <span style={{ fontSize: 21, color: c.muted, marginTop: 5, whiteSpace: 'nowrap' }}>{label}</span>}
    </div>
  );
};

/** Table row with its own reveal. */
const VF_TR = ({
  children,
  show = true,
  head = false,
  delay = 0,
  fill,
  minH = 58,
}: {
  children: ReactNode;
  show?: boolean;
  head?: boolean;
  delay?: number;
  fill?: string;
  minH?: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      minHeight: head ? 48 : minH,
      borderBottom: `1px solid ${head ? c.line : c.rule}`,
      background: fill ?? 'transparent',
      ...VF_enter(show, delay),
    }}
  >
    {children}
  </div>
);

const VF_TC = ({
  children,
  w,
  head = false,
  color,
  mono = false,
  size,
}: {
  children?: ReactNode;
  w: number;
  head?: boolean;
  color?: string;
  mono?: boolean;
  size?: number;
}) => (
  <div
    style={{
      width: w,
      flexShrink: 0,
      boxSizing: 'border-box',
      padding: '7px 18px',
      fontSize: head ? 21 : (size ?? 24),
      lineHeight: 1.35,
      letterSpacing: head ? '0.08em' : undefined,
      textTransform: head ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
      fontFamily: mono ? MONO : undefined,
    }}
  >
    {children}
  </div>
);

const VF_Ok = ({ ok = true, children }: { ok?: boolean; children?: ReactNode }) => (
  <span style={{ color: ok ? c.good : c.bad }}>
    <span style={{ fontFamily: MONO }}>{ok ? '✓' : '✗'}</span>
    {children && <span style={{ marginLeft: 10 }}>{children}</span>}
  </span>
);

/** Bullet line with a small clay dash. */
const VF_Li = ({ children, tone = c.clayHex, size = 23 }: { children: ReactNode; tone?: string; size?: number }) => (
  <div style={{ display: 'flex', gap: 12, marginTop: 9, fontSize: size, lineHeight: 1.38 }}>
    <span style={{ color: tone, fontFamily: MONO, flexShrink: 0 }}>–</span>
    <span>{children}</span>
  </div>
);

/** Spec keyword tag (MUST, MUST NOT, MAY, SHOULD). */
const VF_Kw = ({ children, tone = c.clayHex }: { children: ReactNode; tone?: string }) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: '0.82em',
      color: tone,
      border: `1.25px solid ${tone}`,
      borderRadius: 5,
      padding: '0 6px',
      marginRight: 8,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

/** Mono value, optionally colored. */
const VF_Hex = ({ children, color, size }: { children: ReactNode; color?: string; size?: number }) => (
  <span style={{ fontFamily: MONO, fontSize: size, color, whiteSpace: 'nowrap' }}>{children}</span>
);

/** Math-font span inside SVG text (subscripts and primes). */
const VF_Tm = ({ children }: { children: ReactNode }) => (
  <tspan style={{ fontFamily: MATH, fontStyle: 'italic' }}>{children}</tspan>
);

// Values from nuts/tests/10-tests.md (all recomputed with python while authoring).
const VF_V = {
  keyset: '02b7e077d020fabed456a6be138a8e20e9ef40b44d873fa12c005b656eb0cf99f6',
  secret: '02e6e7cfa7b82d4b3b449fa6466c893469a727d0214d48db4956a6054b8022a29b',
  k: '47196dc081150ce13fd0e478b8b71831b825be389211c9c56a8062a61af70347',
  tagHash: '4996fee585f625e6a33865ce975efc32c42d2b1b95328385ce45f5209a16e9ec',
  swapDigest: '7d4783154ee7e697df3087d00206a26f74dab34fd469270f749ca14cc852d2aa',
  inputId: '44002fef2fb9ce3168f3a4e88315290a890080c6c333c2fc47d5327f6c3616f3',
  swapInputDigest: '867091ad6dba3069bcff610e29300b5c1e2d89f0e5165f17d155000e77d18f9c',
  proofContainer:
    '01008e0100010802002102b7e077d020fabed456a6be138a8e20e9ef40b44d873fa12c005b656eb0cf99f6030030a0acf939f033e3d0ae9b5f784341fada38367eec190edfb34e1f0cce9050c80672dbee77a7512b7243544c85ae290a7304003084d1b7291ae5737f3c851aa33cafe0f7afeb5ccb4da086c482bb85b7525e61547f1b5a6d1a01b1fed1f960d1a9d03327',
};

// ─── Cover ───────────────────────────────────────────────────────────────────

const VF_Cover: Page = () => (
  <VarCover
    section="1.6"
    title="Client intent and the transaction transcript"
    sources={[
      { n: '1.6', title: 'Proof rewriting by a Byzantine member', count: 7 },
      { n: '1.6', title: 'v3 transaction transcript (NUT-10)', count: 8 },
      { n: '1.6', title: 'Per-input signing digest', count: 8 },
      { n: '1.6', title: 'Inputs sign, outputs never do', count: 8 },
      { n: '—', title: 'Summary: Federation components', count: 7 },
    ]}
  />
);

// ═════════════════════════════════════════════════════════════════════════════
// Source 1 · Proof rewriting by a Byzantine member
// ═════════════════════════════════════════════════════════════════════════════

const VF_LogRow = ({
  n,
  req,
  from,
  verdict,
  bad,
  show,
  verdictShow,
}: {
  n: string;
  req: ReactNode;
  from: string;
  verdict: string;
  bad: boolean;
  show: boolean;
  verdictShow: boolean;
}) => (
  <div
    style={{
      marginTop: 14,
      border: `1.5px solid ${bad ? c.bad : c.rule}`,
      background: bad ? c.badSoft : c.card,
      borderRadius: 10,
      padding: '10px 16px',
      ...VF_enter(show, 0),
    }}
  >
    <div style={{ fontSize: 22 }}>
      <span style={{ fontFamily: MONO, color: c.dim, marginRight: 12 }}>{n}</span>
      {req}
      <span style={{ color: c.muted, fontSize: 21 }}> ({from})</span>
    </div>
    <div
      style={{
        fontSize: 22,
        marginTop: 4,
        color: bad ? c.bad : c.muted,
        opacity: verdictShow ? 1 : 0,
        transition: `opacity 400ms ${EASE_OUT} ${verdictShow ? 200 : 0}ms`,
      }}
    >
      {verdict}
    </div>
  </div>
);

const VF_RwBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const w = { x: 220, y: 640 };
  const m = [
    { x: 580, y: 500 },
    { x: 580, y: 640 },
    { x: 580, y: 780 },
  ];
  return (
    <VarShell of={VF_OF_RW} lens="Beginner" title="Copying a bearer proof" proc={proc}>
      <At x={120} y={256} w={1220}>
        <div style={{ fontSize: 26, lineHeight: 1.45, padding: '12px 22px', background: c.panel, borderRadius: 12 }}>
          A proof <M>P = (x, C)</M> worth 8 sat. <M>x</M>: a random string chosen by the wallet. <M>C</M>: the mint's
          signature on <M>x</M>. Whoever shows both can spend <M>P</M>.
        </div>
      </At>
      <Canvas>
        <Line x1={w.x} y1={w.y} x2={m[0].x} y2={m[0].y} color={s >= 1 ? c.cool : c.line} />
        <Line x1={w.x} y1={w.y} x2={m[1].x} y2={m[1].y} color={s >= 1 ? c.cool : c.line} />
        <Line x1={w.x} y1={w.y} x2={m[2].x} y2={m[2].y} color={s >= 1 ? c.cool : c.line} />
        <Draw x1={m[0].x + 40} y1={m[0].y} x2={860} y2={520} show={s >= 4} color={c.cool} width={2} />
        <Draw x1={m[2].x + 40} y1={m[2].y} x2={860} y2={760} show={s >= 3} color={c.bad} width={2} />
        <Packet x1={w.x} y1={w.y} x2={m[0].x} y2={m[0].y} run={proc.anim && s === 1} />
        <Packet x1={w.x} y1={w.y} x2={m[1].x} y2={m[1].y} run={proc.anim && s === 1} delay={50} />
        <Packet x1={w.x} y1={w.y} x2={m[2].x} y2={m[2].y} run={proc.anim && s === 1} delay={100} />
        <Packet x1={m[2].x + 40} y1={m[2].y} x2={860} y2={760} run={proc.anim && s === 3} color={c.bad} />
        <Packet x1={m[0].x + 40} y1={m[0].y} x2={860} y2={520} run={proc.anim && s === 4} />
        <WalletNode x={w.x} y={w.y} />
        <Member x={m[0].x} y={m[0].y} label="m1" />
        <Member x={m[1].x} y={m[1].y} label="m2" />
        <Member x={m[2].x} y={m[2].y} label="m3" tone={s >= 2 ? 'bad' : 'idle'} />
      </Canvas>
      <At x={120} y={430} w={340}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 23, color: c.cool }}>
            spend <M>P</M> → <M>A</M> 4, <M>B</M> 4
          </div>
        </Fade>
      </At>
      <At x={470} y={836} w={260}>
        <Fade show={s >= 2}>
          <div style={{ fontSize: 22, color: c.bad }}>
            keeps a copy of <M>x</M>, <M>C</M>
          </div>
        </Fade>
      </At>
      <div
        style={{
          position: 'absolute',
          left: 860,
          top: 460,
          width: 480,
          height: 380,
          boxSizing: 'border-box',
          border: `1.75px solid ${c.node}`,
          background: c.panel,
          borderRadius: 16,
          padding: '16px 20px',
        }}
      >
        <VF_Lab>Agreed order</VF_Lab>
        <VF_LogRow
          n="1"
          req={
            <>
              spend <M>P</M> → <M>X</M> 4, <M>Y</M> 4
            </>
          }
          from="m3"
          verdict="applied: P is now spent"
          bad
          show={s >= 3}
          verdictShow={s >= 4}
        />
        <VF_LogRow
          n="2"
          req={
            <>
              spend <M>P</M> → <M>A</M> 4, <M>B</M> 4
            </>
          }
          from="m1"
          verdict="rejected: P already spent"
          bad={false}
          show={s >= 4}
          verdictShow={s >= 4}
        />
      </div>
      <At x={882} y={748} w={436}>
        <Fade show={s >= 5}>
          <div style={{ fontSize: 24 }}>
            <M>X</M>, <M>Y</M> get signed. The 8 sat now sit in m3's outputs.
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet sends its swap to every member.
        </StepItem>
        <StepItem n={2} step={s}>
          Every member now knows <M>x</M> and <M>C</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          m3 writes its own swap of <M>P</M>, to outputs it controls.
        </StepItem>
        <StepItem n={4} step={s}>
          Members agree on one order. <M>P</M> can be spent once.
        </StepItem>
        <StepItem n={5} step={s}>
          The first swap wins; the wallet's swap fails.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>
          Nothing in <M>P</M> names the outputs the wallet asked for.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VF_RW_W = [200, 500, 260, 260];
const VF_RwAdvanced: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const W = VF_RW_W;
  return (
    <VarShell of={VF_OF_RW} lens="Advanced" title="The rewritten swap passes every check" proc={proc}>
      <At x={120} y={262} w={1220}>
        <VF_TR head>
          <VF_TC head w={W[0]}>Stage</VF_TC>
          <VF_TC head w={W[1]}>Check</VF_TC>
          <VF_TC head w={W[2]}>wallet's swap</VF_TC>
          <VF_TC head w={W[3]}>m3's swap</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 1}>
          <VF_TC w={W[0]} color={c.muted}>Admission</VF_TC>
          <VF_TC w={W[1]}>inputs non-empty, no duplicates</VF_TC>
          <VF_TC w={W[2]}><VF_Ok /></VF_TC>
          <VF_TC w={W[3]}><VF_Ok /></VF_TC>
        </VF_TR>
        <VF_TR show={s >= 1} delay={50}>
          <VF_TC w={W[0]} color={c.muted}> </VF_TC>
          <VF_TC w={W[1]}>outputs v3, no duplicates</VF_TC>
          <VF_TC w={W[2]}><VF_Ok /></VF_TC>
          <VF_TC w={W[3]}><VF_Ok /></VF_TC>
        </VF_TR>
        <VF_TR show={s >= 1} delay={100}>
          <VF_TC w={W[0]} color={c.muted}> </VF_TC>
          <VF_TC w={W[1]}>amounts balance, incl. fees</VF_TC>
          <VF_TC w={W[2]}><VF_Ok /></VF_TC>
          <VF_TC w={W[3]}><VF_Ok /></VF_TC>
        </VF_TR>
        <VF_TR show={s >= 1} delay={150}>
          <VF_TC w={W[0]} color={c.muted}> </VF_TC>
          <VF_TC w={W[1]}>proof and witness size limits</VF_TC>
          <VF_TC w={W[2]}><VF_Ok /></VF_TC>
          <VF_TC w={W[3]}><VF_Ok /></VF_TC>
        </VF_TR>
        <VF_TR show={s >= 2}>
          <VF_TC w={W[0]} color={c.muted}>Envelope</VF_TC>
          <VF_TC w={W[1]}>authorized by a roster member's key</VF_TC>
          <VF_TC w={W[2]}><VF_Ok>m1</VF_Ok></VF_TC>
          <VF_TC w={W[3]}><VF_Ok>m3</VF_Ok></VF_TC>
        </VF_TR>
        <VF_TR show={s >= 3}>
          <VF_TC w={W[0]} color={c.muted}>Consensus</VF_TC>
          <VF_TC w={W[1]}>first swap spending the inputs wins</VF_TC>
          <VF_TC w={W[2]}><VF_Ok ok={false}>#58</VF_Ok></VF_TC>
          <VF_TC w={W[3]}><VF_Ok>#57</VF_Ok></VF_TC>
        </VF_TR>
        <VF_TR show={s >= 3} delay={80}>
          <VF_TC w={W[0]} color={c.muted}>Apply</VF_TC>
          <VF_TC w={W[1]}>verify proofs, mark spent, sign</VF_TC>
          <VF_TC w={W[2]} color={c.dim}>spent</VF_TC>
          <VF_TC w={W[3]}><VF_Ok>X, Y signed</VF_Ok></VF_TC>
        </VF_TR>
        <VF_TR show={s >= 4} fill={c.badSoft}>
          <VF_TC w={W[0]} color={c.bad}>Owner</VF_TC>
          <VF_TC w={W[1]}>owner's signature over the outputs</VF_TC>
          <VF_TC w={W[2]} color={c.bad}>none</VF_TC>
          <VF_TC w={W[3]} color={c.bad}>none</VF_TC>
        </VF_TR>
      </At>
      <VF_Box x={120} y={790} w={1220} show={s >= 4} tone={c.line} fill={c.panel}>
        <div style={{ fontSize: 23, lineHeight: 1.45 }}>
          Pre-v3 mitigation: lock to P2PK with <Code>SIG_ALL</Code> (NUT-11). On the branch, an output mutation then
          changes the operation ID and fails apply. The code does not require <Code>SIG_ALL</Code>.
        </div>
      </VF_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Admission: both requests are well-formed and balanced.
        </StepItem>
        <StepItem n={2} step={s}>
          The envelope signature names the submitting member, not the owner of the inputs.
        </StepItem>
        <StepItem n={3} step={s}>
          Order decides: #57 is applied, #58 is rejected as spent.
        </StepItem>
        <StepItem n={4} step={s}>
          No check involves the owner. A pre-v3 bearer proof has nothing to check.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>
          Audit SEC-2026-07-17-01. Not a BLS bug, not mix-and-match; fan-out and DKG do not address it.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VF_Coin = ({
  x,
  y,
  label,
  tone,
  dashed,
  show,
  delay = 0,
}: {
  x: number;
  y: number;
  label: string;
  tone: string;
  dashed?: boolean;
  show: boolean;
  delay?: number;
}) => (
  <GFade show={show} delay={delay}>
    <circle
      cx={x}
      cy={y}
      r={34}
      style={{ fill: c.card, stroke: tone, strokeWidth: 2.5, strokeDasharray: dashed ? '6 6' : 'none' }}
    />
    <text x={x} y={y + 11} textAnchor="middle" style={{ fontFamily: MATH, fontStyle: 'italic', fontSize: 32, fill: tone }}>
      {label}
    </text>
  </GFade>
);

const VF_RwGraphical: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const w = { x: 210, y: 600 };
  const m = [
    { x: 590, y: 420 },
    { x: 590, y: 600 },
    { x: 590, y: 780 },
  ];
  const cb = { x: 820, y: 540, w: 190, h: 120 };
  const slotX = 1110;
  return (
    <VarShell of={VF_OF_RW} lens="Graphical" title="Two swaps, one set of inputs" proc={proc}>
      <Canvas>
        <Line x1={w.x} y1={w.y} x2={m[0].x} y2={m[0].y} color={s >= 1 ? c.cool : c.line} />
        <Line x1={w.x} y1={w.y} x2={m[1].x} y2={m[1].y} color={s >= 1 ? c.cool : c.line} />
        <Line x1={w.x} y1={w.y} x2={m[2].x} y2={m[2].y} color={s >= 1 ? c.cool : c.line} />
        <Packet x1={w.x} y1={w.y} x2={m[0].x} y2={m[0].y} run={proc.anim && s === 1} />
        <Packet x1={w.x} y1={w.y} x2={m[1].x} y2={m[1].y} run={proc.anim && s === 1} delay={50} />
        <Packet x1={w.x} y1={w.y} x2={m[2].x} y2={m[2].y} run={proc.anim && s === 1} delay={100} />
        <Draw x1={m[2].x + 40} y1={m[2].y} x2={cb.x} y2={cb.y + cb.h - 20} show={s >= 2} color={c.bad} width={2.5} />
        <Packet x1={m[2].x + 40} y1={m[2].y} x2={cb.x} y2={cb.y + cb.h - 20} run={proc.anim && s === 2} color={c.bad} delay={300} />
        <Draw x1={m[0].x + 40} y1={m[0].y} x2={cb.x} y2={cb.y + 20} show={s >= 3} color={c.cool} width={2.5} />
        <Packet x1={m[0].x + 40} y1={m[0].y} x2={cb.x} y2={cb.y + 20} run={proc.anim && s === 3} />
        <rect x={cb.x} y={cb.y} width={cb.w} height={cb.h} rx={14} style={{ fill: c.panel, stroke: c.node, strokeWidth: 1.75 }} />
        <T x={cb.x + cb.w / 2} y={cb.y + cb.h / 2 + 9} size={26}>
          AlephBFT
        </T>
        <Draw x1={cb.x + cb.w} y1={585} x2={slotX} y2={520} show={s >= 4} color={c.bad} width={2.5} />
        <Draw x1={cb.x + cb.w} y1={615} x2={slotX} y2={680} show={s >= 4} color={c.node} width={2} delay={150} />
        <Packet x1={cb.x + cb.w} y1={585} x2={slotX} y2={520} run={proc.anim && s === 4} color={c.bad} dur={600} />
        <GFade show={s >= 4} delay={300}>
          <rect x={slotX} y={480} width={320} height={80} rx={10} style={{ fill: c.badSoft, stroke: c.bad, strokeWidth: 2 }} />
          <T x={slotX + 24} y={530} anchor="start" size={26} color={c.bad}>
            #57 <VF_Tm>X Y</VF_Tm> applied
          </T>
        </GFade>
        <GFade show={s >= 4} delay={450}>
          <rect x={slotX} y={640} width={320} height={80} rx={10} style={{ fill: c.card, stroke: c.line, strokeWidth: 1.5 }} />
          <T x={slotX + 24} y={690} anchor="start" size={26} color={c.dim}>
            #58 <VF_Tm>A B</VF_Tm> spent
          </T>
        </GFade>
        <Draw x1={slotX + 320} y1={520} x2={1540} y2={520} show={s >= 5} color={c.bad} width={2} />
        <VF_Coin x={1590} y={520} label="X" tone={c.bad} show={s >= 5} delay={300} />
        <VF_Coin x={1690} y={520} label="Y" tone={c.bad} show={s >= 5} delay={360} />
        <VF_Coin x={1590} y={680} label="A" tone={c.cool} dashed show={s >= 5} delay={420} />
        <VF_Coin x={1690} y={680} label="B" tone={c.cool} dashed show={s >= 5} delay={480} />
        <T x={1640} y={590} size={22} color={c.bad} show={s >= 5} delay={500}>
          signed
        </T>
        <T x={1640} y={750} size={22} color={c.muted} show={s >= 5} delay={560}>
          not signed
        </T>
        <WalletNode x={w.x} y={w.y} r={56} />
        <T x={w.x} y={500} size={30} font="math" color={c.cool}>
          P₁ P₂
        </T>
        <Member x={m[0].x} y={m[0].y} label="m1" />
        <Member x={m[1].x} y={m[1].y} label="m2" />
        <Member x={m[2].x} y={m[2].y} label="m3" tone={s >= 2 ? 'bad' : 'idle'} />
        <T x={w.x} y={710} size={24} color={c.cool} show={s >= 1}>
          <VF_Tm>P₁ P₂</VF_Tm> → <VF_Tm>A B</VF_Tm>
        </T>
        <T x={m[2].x} y={870} size={24} color={c.bad} show={s >= 2}>
          <VF_Tm>P₁ P₂</VF_Tm> → <VF_Tm>X Y</VF_Tm>
        </T>
      </Canvas>
    </VarShell>
  );
};

const VF_RwSequence: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const X = { w: 200, m1: 470, m2: 700, m3: 930, cs: 1200 };
  return (
    <VarShell of={VF_OF_RW} lens="Explained via sequence diagram" title="The race as a message sequence" proc={proc}>
      <Canvas>
        <Lifeline x={X.w} label="wallet" top={300} bottom={930} color={c.cool} />
        <Lifeline x={X.m1} label="m1" top={300} bottom={930} />
        <Lifeline x={X.m2} label="m2" top={300} bottom={930} />
        <Lifeline x={X.m3} label="m3" top={300} bottom={930} color={s >= 2 ? c.bad : c.ink} />
        <Lifeline x={X.cs} label="consensus" top={300} bottom={930} />
        <Arrow
          x1={X.w}
          y1={350}
          x2={X.m1}
          y2={350}
          show={s >= 1}
          color={c.cool}
          font="sans"
          label={
            <>
              <VF_Tm>P₁P₂</VF_Tm> → <VF_Tm>AB</VF_Tm>
            </>
          }
        />
        <Arrow x1={X.w} y1={372} x2={X.m2} y2={372} show={s >= 1} color={c.cool} delay={60} />
        <Arrow x1={X.w} y1={394} x2={X.m3} y2={394} show={s >= 1} color={c.cool} delay={120} />
        <Packet x1={X.w} y1={394} x2={X.m3} y2={394} run={proc.anim && s === 1} delay={200} />
        <Arrow
          x1={X.m3}
          y1={480}
          x2={X.cs}
          y2={480}
          show={s >= 2}
          color={c.bad}
          font="sans"
          label={
            <>
              <VF_Tm>P₁P₂</VF_Tm> → <VF_Tm>XY</VF_Tm>
            </>
          }
        />
        <Packet x1={X.m3} y1={480} x2={X.cs} y2={480} run={proc.anim && s === 2} color={c.bad} delay={200} />
        <Arrow
          x1={X.m1}
          y1={556}
          x2={X.cs}
          y2={556}
          show={s >= 3}
          color={c.cool}
          font="sans"
          label={
            <>
              <VF_Tm>P₁P₂</VF_Tm> → <VF_Tm>AB</VF_Tm>
            </>
          }
        />
        <Packet x1={X.m1} y1={556} x2={X.cs} y2={556} run={proc.anim && s === 3} delay={200} dur={1200} />
        <Band x1={440} x2={1230} y={640} show={s >= 4} tone="clay" label="order: #57 (X, Y), then #58 (A, B)" />
        <Band
          x1={440}
          x2={1230}
          y={716}
          show={s >= 4}
          label={
            <tspan style={{ fill: c.bad }}>#57 applied: P₁, P₂ spent, X, Y signed</tspan>
          }
        />
        <Band x1={440} x2={1230} y={792} show={s >= 4} label="#58: TokenAlreadySpent" />
        <Arrow
          x1={X.m1}
          y1={872}
          x2={X.w}
          y2={872}
          show={s >= 5}
          color={c.bad}
          dashed
          font="mono"
          label="TokenAlreadySpent"
        />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet sends the same swap to every member.
        </StepItem>
        <StepItem n={2} step={s}>
          m3 submits an envelope with the same inputs and its own outputs.
        </StepItem>
        <StepItem n={3} step={s}>
          m1 submits the wallet's envelope, later.
        </StepItem>
        <StepItem n={4} step={s}>
          One order for all members: #57 is applied, #58 conflicts on its inputs.
        </StepItem>
        <StepItem n={5} step={s}>
          The wallet receives <Code>TokenAlreadySpent</Code>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VF_EnvLine = ({ k, children, hot }: { k: string; children: ReactNode; hot?: string }) => (
  <div
    style={{
      display: 'flex',
      fontSize: 23,
      lineHeight: 1.5,
      padding: '0 8px',
      margin: '0 -8px',
      borderRadius: 6,
      background: hot ?? 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    <span style={{ width: 150, flexShrink: 0, color: c.dim }}>{k}</span>
    <span>{children}</span>
  </div>
);

const VF_RwHonest: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const inHot = s >= 2 ? c.claySoft : undefined;
  const outHot = s >= 2 ? 'rgba(122, 95, 166, 0.12)' : undefined;
  return (
    <VarShell of={VF_OF_RW} lens="Perspective: honest member" title="What m1 receives" proc={proc}>
      <VF_Box x={120} y={262} w={590} title="Envelope 1, submitted by m1" show={s >= 1}>
        <div style={{ marginTop: 8 }}>
          <VF_EnvLine k="kind">Swap</VF_EnvLine>
          <VF_EnvLine k="inputs" hot={inHot}>
            <M>P₁</M>, <M>P₂</M> as <M>(x, C)</M>
          </VF_EnvLine>
          <VF_EnvLine k="outputs" hot={outHot}>
            <M>A</M>, <M>B</M>
          </VF_EnvLine>
          <VF_EnvLine k="witnesses">none</VF_EnvLine>
          <VF_EnvLine k="signed by">m1's member key</VF_EnvLine>
        </div>
      </VF_Box>
      <VF_Box x={750} y={262} w={590} title="Envelope 2, submitted by m3" show={s >= 1} delay={120}>
        <div style={{ marginTop: 8 }}>
          <VF_EnvLine k="kind">Swap</VF_EnvLine>
          <VF_EnvLine k="inputs" hot={inHot}>
            <M>P₁</M>, <M>P₂</M> as <M>(x, C)</M>
          </VF_EnvLine>
          <VF_EnvLine k="outputs" hot={outHot}>
            <M>X</M>, <M>Y</M>
          </VF_EnvLine>
          <VF_EnvLine k="witnesses">none</VF_EnvLine>
          <VF_EnvLine k="signed by">m3's member key</VF_EnvLine>
        </div>
      </VF_Box>
      <VF_Box x={120} y={540} w={1220} show={s >= 3} tone={c.line} fill={c.panel} title="pre-v3">
        <div style={{ fontSize: 24, lineHeight: 1.45, marginTop: 6 }}>
          No field says which output set the owner chose. m1 applies whichever envelope consensus orders first.
        </div>
      </VF_Box>
      <VF_Box x={120} y={700} w={590} show={s >= 4} tone={c.good} title="v3 · envelope 1">
        <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 6 }}>
          Each input carries a witness over its input digest for <M>A</M>, <M>B</M>. m1 recomputes it:{' '}
          <VF_Ok>verifies</VF_Ok>
        </div>
      </VF_Box>
      <VF_Box x={750} y={700} w={590} show={s >= 4} delay={150} tone={c.bad} title="v3 · envelope 2">
        <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 6 }}>
          Copied witnesses sign the digest for <M>A</M>, <M>B</M>, not <M>X</M>, <M>Y</M>:{' '}
          <VF_Ok ok={false}>fails</VF_Ok>. New ones need <M>k</M>.
        </div>
      </VF_Box>
      <StepList>
        <StepItem n={1} step={s}>
          m1 wraps the wallet's request; m3's envelope arrives through consensus.
        </StepItem>
        <StepItem n={2} step={s}>
          Same inputs, different outputs.
        </StepItem>
        <StepItem n={3} step={s}>
          Pre-v3: m1 has no way to tell the owner's envelope from the copy.
        </StepItem>
        <StepItem n={4} step={s}>
          v3: every input witness is checked against the transcript of the envelope it arrives in.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VF_BaCell = ({
  x,
  y,
  title,
  tone,
  show,
  delay = 0,
  children,
}: {
  x: number;
  y: number;
  title: string;
  tone: string;
  show: boolean;
  delay?: number;
  children: ReactNode;
}) => (
  <VF_Box x={x} y={y} w={590} h={132} title={title} tone={tone} show={show} delay={delay} dim={0}>
    <div style={{ fontSize: 23, lineHeight: 1.4, marginTop: 6 }}>{children}</div>
  </VF_Box>
);

const VF_RwBeforeAfter: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const L = 120;
  const R = 750;
  const Y = [304, 456, 608, 760];
  return (
    <VarShell of={VF_OF_RW} lens="Framing: before and after" title="The same swap, pre-v3 and v3" proc={proc}>
      <At x={L} y={256}>
        <VF_Lab>pre-v3 keyset · what m3 can do</VF_Lab>
      </At>
      <At x={R} y={256}>
        <VF_Lab color={c.clayHex}>v3 keyset · what m3 can do</VF_Lab>
      </At>
      <VF_BaCell x={L} y={Y[0]} title="holds" tone={c.rule} show={s >= 1}>
        secret <M>x</M> and <M>C</M> for each input: the full bearer proof.
      </VF_BaCell>
      <VF_BaCell x={R} y={Y[0]} title="holds" tone={c.rule} show={s >= 1} delay={120}>
        secret <M>K = k·G</M>, <M>C</M>, and the witness <Code>a46a08f9…09a2</Code>. Not <M>k</M>.
      </VF_BaCell>
      <VF_BaCell x={L} y={Y[1]} title="builds" tone={c.rule} show={s >= 2}>
        <M>P₁ P₂</M> → <M>X Y</M>. No witness needed.
      </VF_BaCell>
      <VF_BaCell x={R} y={Y[1]} title="builds" tone={c.rule} show={s >= 2} delay={120}>
        <M>P₁ P₂</M> → <M>X Y</M>. New transcript, new input digests: needs new signatures by <M>k</M>.
      </VF_BaCell>
      <VF_BaCell x={L} y={Y[2]} title="checks" tone={c.rule} show={s >= 3}>
        <M>C</M> valid under the keyset key; inputs unspent; amounts balance. <VF_Ok>all pass</VF_Ok>
      </VF_BaCell>
      <VF_BaCell x={R} y={Y[2]} title="checks" tone={c.rule} show={s >= 3} delay={120}>
        Copied witness against the new input digest. <VF_Ok ok={false}>fails</VF_Ok>
      </VF_BaCell>
      <VF_BaCell x={L} y={Y[3]} title="result" tone={c.bad} show={s >= 4}>
        Applied if ordered first. The owner's swap fails as spent.
      </VF_BaCell>
      <VF_BaCell x={R} y={Y[3]} title="result" tone={c.good} show={s >= 4} delay={120}>
        Rejected: no valid witness. Only <M>A B</M> can be applied.
      </VF_BaCell>
      <StepList>
        <StepItem n={1} step={s}>
          What the fan-out gives m3.
        </StepItem>
        <StepItem n={2} step={s}>
          The rewrite: same inputs, m3's outputs.
        </StepItem>
        <StepItem n={3} step={s}>
          What honest members check.
        </StepItem>
        <StepItem n={4} step={s}>
          Outcome.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>
          Values: the NUT-10 swap vector. m3 still sees every proof; it can no longer produce a different valid
          spend.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VF_AuthRow = ({
  y,
  what,
  who,
  says,
  show,
  tone = c.rule,
  fill = c.card,
}: {
  y: number;
  what: ReactNode;
  who: ReactNode;
  says: ReactNode;
  show: boolean;
  tone?: string;
  fill?: string;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      top: y,
      width: 1220,
      height: 118,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      border: `1.5px solid ${tone}`,
      background: fill,
      borderRadius: 12,
      ...VF_enter(show, 0),
    }}
  >
    <div style={{ width: 300, padding: '0 22px', fontSize: 24, fontWeight: 600, boxSizing: 'border-box' }}>{what}</div>
    <div style={{ width: 360, padding: '0 22px', fontSize: 23, lineHeight: 1.4, color: c.muted, boxSizing: 'border-box' }}>{who}</div>
    <div style={{ width: 560, padding: '0 22px', fontSize: 24, lineHeight: 1.4, boxSizing: 'border-box' }}>{says}</div>
  </div>
);

const VF_RwAuthz: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_RW} lens="Framing: member versus owner authorization" title="Who authorized this spend" proc={proc}>
      <At x={120} y={256} w={1220}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: 300, paddingLeft: 22, boxSizing: 'border-box' }}>
            <VF_Lab>artifact</VF_Lab>
          </div>
          <div style={{ width: 360, paddingLeft: 22, boxSizing: 'border-box' }}>
            <VF_Lab>produced by</VF_Lab>
          </div>
          <div style={{ width: 560, paddingLeft: 22, boxSizing: 'border-box' }}>
            <VF_Lab>attests</VF_Lab>
          </div>
        </div>
      </At>
      <VF_AuthRow
        y={300}
        show={s >= 1}
        what="Envelope signature"
        who="the submitting member's identity key"
        says="a roster member submitted this operation"
      />
      <VF_AuthRow
        y={436}
        show={s >= 2}
        what="Consensus order"
        who="AlephBFT among the members"
        says="this is the first operation spending these inputs"
      />
      <VF_AuthRow
        y={572}
        show={s >= 3}
        what="Signature shares"
        who={
          <>
            <M>t</M> members, bound to the <Code>operation_id</Code>
          </>
        }
        says="the federation signed the outputs of the accepted operation"
      />
      <VF_AuthRow
        y={708}
        show={s >= 4}
        tone={s >= 5 ? c.good : c.bad}
        fill={s >= 5 ? c.goodSoft : c.badSoft}
        what="Owner signature"
        who={s >= 5 ? 'the key of each v3 input' : 'the owner of the inputs'}
        says={
          s >= 5 ? (
            <>
              these inputs pay exactly these outputs: a witness over each input digest
            </>
          ) : (
            <span style={{ color: c.bad }}>pre-v3 bearer proof: nothing is produced</span>
          )
        }
      />
      <At x={120} y={860} w={1220}>
        <Fade show={s >= 4}>
          <Note>
            Consensus picks one operation, not the owner's. DKG protects the mint key, not bearer secrets.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The envelope proves who submitted it.
        </StepItem>
        <StepItem n={2} step={s}>
          The order proves which operation came first.
        </StepItem>
        <StepItem n={3} step={s}>
          The shares prove the federation signed.
        </StepItem>
        <StepItem n={4} step={s}>
          Nothing proves the owner chose the outputs.
        </StepItem>
        <StepItem n={5} step={s}>
          v3 adds that row: every input signs the whole transaction.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Source 2 · v3 transaction transcript (NUT-10)
// ═════════════════════════════════════════════════════════════════════════════

const VF_Cap = ({ children, show = true, delay = 0 }: { children: ReactNode; show?: boolean; delay?: number }) => (
  <div style={{ fontSize: 22, color: c.muted, marginBottom: 8, ...VF_enter(show, delay) }}>{children}</div>
);

const VF_TrBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_TR} lens="Beginner" title="Writing a transaction as records" proc={proc}>
      <At x={120} y={256} w={1220}>
        <VF_Cap>Record</VF_Cap>
        <div style={{ display: 'flex', gap: 28 }}>
          <VF_Seg bytes="type" label="1 byte" tone="type" hot={s === 1} />
          <VF_Seg bytes="length" label="2 bytes, big-endian" tone="len" hot={s === 1} />
          <VF_Seg bytes="value" label="length bytes" />
        </div>
      </At>
      <At x={120} y={400} w={1220}>
        <VF_Cap show={s >= 2}>Amount field (type 01), minimal big-endian</VF_Cap>
        <div style={{ display: 'flex', gap: 56 }}>
          <div style={VF_enter(s >= 2, 0)}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>amount 8</div>
            <VF_Seg bytes="01" tone="type" />
            <VF_Seg bytes="0001" tone="len" />
            <VF_Seg bytes="08" />
          </div>
          <div style={VF_enter(s >= 2, 80)}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>amount 0</div>
            <VF_Seg bytes="01" tone="type" />
            <VF_Seg bytes="0000" tone="len" />
            <span style={{ fontSize: 22, color: c.muted }}>no value bytes</span>
          </div>
          <div style={VF_enter(s >= 2, 160)}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>amount 256</div>
            <VF_Seg bytes="01" tone="type" />
            <VF_Seg bytes="0002" tone="len" />
            <VF_Seg bytes="0100" />
          </div>
        </div>
      </At>
      <At x={120} y={556} w={1220}>
        <VF_Cap show={s >= 3}>
          Proof input: type 01, length 142, then four fields (<M>Y</M>: the secret hashed to a curve point)
        </VF_Cap>
        <div style={{ display: 'flex' }}>
          <VF_Seg bytes="01" label="type" tone="type" show={s >= 3} />
          <VF_Seg bytes="008e" label="142" tone="len" show={s >= 3} delay={40} />
          <VF_Seg bytes="01 0001 08" label="amount" show={s >= 3} delay={80} />
          <VF_Seg bytes="02 0021 02b7e0…f6" label="keyset id" show={s >= 3} delay={120} />
          <VF_Seg bytes="03 0030 a0acf9…0a73" label="Y" show={s >= 3} delay={160} />
          <VF_Seg bytes="04 0030 84d1b7…3327" label="C" show={s >= 3} delay={200} />
        </div>
      </At>
      <At x={120} y={716} w={1220}>
        <VF_Cap show={s >= 4}>Transcript: inputs, then outputs</VF_Cap>
        <div style={{ display: 'flex' }}>
          <VF_Seg bytes="proof input · 145 B" tone="type" show={s >= 4} />
          <VF_Seg bytes="output 4 sat · 94 B" show={s >= 4} delay={60} />
          <VF_Seg bytes="output 4 sat · 94 B" show={s >= 4} delay={120} />
          <span style={{ fontSize: 24, marginLeft: 10, alignSelf: 'center', ...VF_enter(s >= 4, 180) }}>= 333 bytes</span>
        </div>
      </At>
      <At x={120} y={846} w={1220}>
        <Fade show={s >= 5}>
          <div style={{ fontSize: 24 }}>
            SHA-256 of the 333 bytes <span style={{ color: c.muted }}>→</span>{' '}
            <VF_Hex color={c.clayHex} size={22}>
              {VF_V.swapDigest}
            </VF_Hex>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          A record: type, length, value.
        </StepItem>
        <StepItem n={2} step={s}>
          Numbers use as few bytes as possible. Zero uses none.
        </StepItem>
        <StepItem n={3} step={s}>
          A proof input is one record holding four smaller records.
        </StepItem>
        <StepItem n={4} step={s}>
          The transcript: every input record, then every output record.
        </StepItem>
        <StepItem n={5} step={s}>
          One hash over all of it: the transaction digest.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>Values: the swap vector, one 8-sat proof to two 4-sat outputs.</Note>
      </StepList>
    </VarShell>
  );
};

const VF_RuleCard = ({
  x,
  title,
  show,
  children,
}: {
  x: number;
  title: string;
  show: boolean;
  children: ReactNode;
}) => (
  <VF_Box x={x} y={262} w={540} h={480} title={title} show={show} dim={0.15} tone={show ? c.clayHex : c.rule} pad="18px 22px">
    <div style={{ marginTop: 6 }}>{children}</div>
  </VF_Box>
);

const VF_TrAdvanced: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_TR} lens="Advanced" title="Transcript rules (NUT-10)" proc={proc}>
      <VF_RuleCard x={120} title="Structure" show={s >= 1}>
        <VF_Li size={22}>
          <VF_Kw>MUST</VF_Kw>at least one input and at least one output
        </VF_Li>
        <VF_Li size={22}>
          <VF_Kw>MUST NOT</VF_Kw>repeat a proof <M>Y</M> or a mint quote id
        </VF_Li>
        <VF_Li size={22}>containers grouped by ascending type; request order within a type</VF_Li>
        <VF_Li size={22}>
          field records inside a container <VF_Kw>MUST</VF_Kw>strictly ascend
        </VF_Li>
        <VF_Li size={22}>
          <Code>0x05</Code> authorized request <VF_Kw>NEVER</VF_Kw>in a transaction: sole container of a NUT-22
          request transcript
        </VF_Li>
      </VF_RuleCard>
      <VF_RuleCard x={690} title="Encoding" show={s >= 2}>
        <VF_Li size={22}>record = type (1 B) ‖ length (2 B, big-endian) ‖ value</VF_Li>
        <VF_Li size={22}>
          integers minimal big-endian: 0 is zero bytes; a leading zero byte <VF_Kw>MUST</VF_Kw>be rejected
        </VF_Li>
        <VF_Li size={22}>
          points raw: <M>Y</M>, <M>C</M>, <Code>B_</Code>, 48 B on v3 (a pre-v3 <M>Y</M> is 33 B)
        </VF_Li>
        <VF_Li size={22}>keyset id: raw bytes when hex, UTF-8 otherwise; quote id: UTF-8</VF_Li>
        <VF_Li size={22}>
          <M>Y</M> is the keyset's hash-to-curve of the secret; a secret never enters a transcript
        </VF_Li>
      </VF_RuleCard>
      <VF_RuleCard x={1260} title="Binding" show={s >= 3}>
        <VF_Li size={22}>
          mint quote input: the amount this transaction issues, at most <Code>amount_paid − amount_issued</Code>
        </VF_Li>
        <VF_Li size={22}>
          melt quote output: quote <Code>amount</Code> plus the selected fee reserve (<Code>fee_reserve</Code>, or the{' '}
          <Code>fee_options</Code> entry at <Code>fee_index</Code>), read from the mint's quote state
        </VF_Li>
        <VF_Li size={22}>outputs exactly as in the request, blank change included</VF_Li>
        <VF_Li size={22}>v3 mint: all outputs on one keyset (NUT-04)</VF_Li>
        <VF_Li size={22}>
          batch: <Code>quote_amounts</Code> required, outputs sum to exactly their total (NUT-29)
        </VF_Li>
      </VF_RuleCard>
      <At x={120} y={776} w={1680}>
        <Note style={{ fontSize: 22 }}>
          Vectors in <Code>tests/10-tests.md</Code>: swap, multiple inputs, mixed keysets, mint, partial mint, batched
          mint, melt, melt with change.
        </Note>
      </At>
    </VarShell>
  );
};

const VF_BarSeg = ({
  x,
  y,
  w,
  h,
  fill,
  stroke,
  label,
  show,
  delay = 0,
  size = 22,
  color = c.ink,
  mathLabel = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  label?: ReactNode;
  show: boolean;
  delay?: number;
  size?: number;
  color?: string;
  mathLabel?: boolean;
}) => (
  <g
    style={{
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms`,
    }}
  >
    <rect x={x} y={y} width={w} height={h} rx={4} style={{ fill, stroke, strokeWidth: 1.5 }} />
    {label && (
      <text
        x={x + w / 2}
        y={y + h / 2 + size * 0.35}
        textAnchor="middle"
        style={
          mathLabel
            ? { fontFamily: MATH, fontStyle: 'italic', fontSize: size + 6, fill: color }
            : { fontFamily: SANS, fontSize: size, fill: color }
        }
      >
        {label}
      </text>
    )}
  </g>
);

const VF_VIOLET_SOFT = 'rgba(122, 95, 166, 0.14)';

const VF_TrGraphical: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  const X0 = 120;
  const B = 5; // px per byte
  const yC = 330;
  const yF = 470;
  const pr = X0;
  const o1 = X0 + 145 * B;
  const o2 = o1 + 94 * B;
  const end = o2 + 94 * B;
  return (
    <VarShell of={VF_OF_TR} lens="Graphical" title="333 bytes" proc={proc}>
      <Canvas>
        <T x={(pr + o1) / 2} y={306} size={22} color={c.clayHex} show={s >= 1}>
          inputs
        </T>
        <T x={(o1 + end) / 2} y={306} size={22} color={c.muted} show={s >= 1}>
          outputs
        </T>
        <VF_BarSeg x={pr} y={yC} w={145 * B} h={90} fill={c.claySoft} stroke={c.clayHex} label="proof input · 145 B" show={s >= 1} />
        <VF_BarSeg x={o1} y={yC} w={94 * B} h={90} fill={c.panel} stroke={c.node} label="blinded message · 94 B" show={s >= 1} delay={80} />
        <VF_BarSeg x={o2} y={yC} w={94 * B} h={90} fill={c.panel} stroke={c.node} label="blinded message · 94 B" show={s >= 1} delay={160} />
        {/* proof fields */}
        <VF_BarSeg x={pr} y={yF} w={3 * B} h={60} fill={c.clayHex} stroke={c.clayHex} show={s >= 2} />
        <VF_BarSeg x={pr + 3 * B} y={yF} w={4 * B} h={60} fill={c.violet} stroke={c.violet} show={s >= 2} delay={40} />
        <VF_BarSeg x={pr + 7 * B} y={yF} w={36 * B} h={60} fill={c.card} stroke={c.node} label="keyset id" show={s >= 2} delay={80} />
        <VF_BarSeg x={pr + 43 * B} y={yF} w={51 * B} h={60} fill={c.coolSoft} stroke={c.cool} label="Y" mathLabel show={s >= 2} delay={120} />
        <VF_BarSeg x={pr + 94 * B} y={yF} w={51 * B} h={60} fill={c.goodSoft} stroke={c.good} label="C" mathLabel show={s >= 2} delay={160} />
        {/* output fields */}
        <VF_BarSeg x={o1} y={yF} w={3 * B} h={60} fill={c.clayHex} stroke={c.clayHex} show={s >= 2} delay={200} />
        <VF_BarSeg x={o1 + 3 * B} y={yF} w={4 * B} h={60} fill={c.violet} stroke={c.violet} show={s >= 2} delay={220} />
        <VF_BarSeg x={o1 + 7 * B} y={yF} w={36 * B} h={60} fill={c.card} stroke={c.node} label="keyset id" show={s >= 2} delay={240} />
        <VF_BarSeg x={o1 + 43 * B} y={yF} w={51 * B} h={60} fill={c.card} stroke={c.node} label="B_" show={s >= 2} delay={260} />
        <VF_BarSeg x={o2} y={yF} w={3 * B} h={60} fill={c.clayHex} stroke={c.clayHex} show={s >= 2} delay={280} />
        <VF_BarSeg x={o2 + 3 * B} y={yF} w={4 * B} h={60} fill={c.violet} stroke={c.violet} show={s >= 2} delay={300} />
        <VF_BarSeg x={o2 + 7 * B} y={yF} w={36 * B} h={60} fill={c.card} stroke={c.node} label="keyset id" show={s >= 2} delay={320} />
        <VF_BarSeg x={o2 + 43 * B} y={yF} w={51 * B} h={60} fill={c.card} stroke={c.node} label="B_" show={s >= 2} delay={340} />
        {/* legend for the two narrow segments */}
        <GFade show={s >= 2} delay={400}>
          <rect x={pr} y={578} width={18} height={18} style={{ fill: c.clayHex }} />
          <text x={pr + 28} y={594} style={{ fontFamily: SANS, fontSize: 21, fill: c.muted }}>
            type, length
          </text>
          <rect x={pr + 180} y={578} width={18} height={18} style={{ fill: c.violet }} />
          <text x={pr + 208} y={594} style={{ fontFamily: SANS, fontSize: 21, fill: c.muted }}>
            amount
          </text>
        </GFade>
        {/* secret -> Y */}
        <GFade show={s >= 2} delay={450}>
          <rect x={250} y={790} width={240} height={60} rx={10} style={{ fill: c.card, stroke: c.line, strokeWidth: 1.5, strokeDasharray: '6 6' }} />
          <text x={370} y={829} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 24, fill: c.muted }}>
            secret
          </text>
        </GFade>
        <Arrow x1={380} y1={784} x2={pr + 68 * B} y2={538} show={s >= 2} delay={500} color={c.cool} />
        <T x={436} y={690} anchor="start" size={22} color={c.cool} show={s >= 2} delay={700}>
          hash-to-curve
        </T>
        {/* SHA-256 */}
        <GFade show={s >= 3}>
          <line x1={pr} y1={548} x2={end} y2={548} style={{ stroke: c.clayHex, strokeWidth: 1.75 }} />
          <line x1={pr} y1={540} x2={pr} y2={548} style={{ stroke: c.clayHex, strokeWidth: 1.75 }} />
          <line x1={end} y1={540} x2={end} y2={548} style={{ stroke: c.clayHex, strokeWidth: 1.75 }} />
        </GFade>
        <Arrow x1={1450} y1={550} x2={1450} y2={640} show={s >= 3} color={c.clayHex} delay={150} />
        <GFade show={s >= 3} delay={300}>
          <rect x={1340} y={650} width={220} height={60} rx={10} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.75 }} />
          <text x={1450} y={689} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 24, fill: c.ink }}>
            SHA-256
          </text>
        </GFade>
        <Arrow x1={1450} y1={712} x2={1450} y2={780} show={s >= 3} color={c.clayHex} delay={400} />
        <T x={1785} y={830} anchor="end" size={24} font="mono" color={c.clayHex} show={s >= 3} delay={700}>
          {VF_V.swapDigest}
        </T>
      </Canvas>
    </VarShell>
  );
};

// ─── Hex dump of the proof container ─────────────────────────────────────────

const VF_RANGES: [number, number, string, string][] = [
  [0, 3, c.clayHex, c.claySoft],
  [3, 7, c.violet, VF_VIOLET_SOFT],
  [7, 43, c.muted, c.panel],
  [43, 94, c.cool, c.coolSoft],
  [94, 145, c.good, c.goodSoft],
];
const VF_rangeOf = (i: number) => VF_RANGES.findIndex(([a, b]) => i >= a && i < b);
const VF_FIELD_HDR = new Set([3, 4, 5, 7, 8, 9, 43, 44, 45, 94, 95, 96]);

const VF_HexRow = ({ row, s }: { row: number; s: number }) => {
  const bytes: ReactNode[] = [];
  for (let j = 0; j < 16; j++) {
    const i = row * 16 + j;
    if (i >= 145) break;
    const r = VF_rangeOf(i);
    const reached = s >= r + 1;
    const cur = s === r + 1;
    const [, , tone, soft] = VF_RANGES[r];
    bytes.push(
      <span
        key={i}
        style={{
          display: 'inline-block',
          width: 34,
          textAlign: 'center',
          background: cur ? c.claySoft : reached ? soft : 'transparent',
          color: reached ? (VF_FIELD_HDR.has(i) || r === 0 ? tone : c.ink) : c.dim,
          fontWeight: VF_FIELD_HDR.has(i) || r === 0 ? 600 : 400,
          transition: `background 300ms ${EASE_OUT}, color 300ms ${EASE_OUT}`,
        }}
      >
        {VF_V.proofContainer.slice(i * 2, i * 2 + 2)}
      </span>,
    );
  }
  return (
    <div style={{ fontFamily: MONO, fontSize: 22, lineHeight: 1.72, whiteSpace: 'nowrap' }}>
      <span style={{ color: c.dim, display: 'inline-block', width: 70 }}>{`0x${(row * 16).toString(16).padStart(2, '0')}`}</span>
      {bytes}
    </div>
  );
};

const VF_Legend = ({
  n,
  s,
  tone,
  soft,
  off,
  bytes,
  text,
}: {
  n: number;
  s: number;
  tone: string;
  soft: string;
  off: string;
  bytes: string;
  text: ReactNode;
}) => (
  <div style={{ display: 'flex', gap: 14, marginBottom: 16, ...VF_enter(s >= n, 0) }}>
    <span style={{ width: 20, height: 20, marginTop: 6, flexShrink: 0, background: soft, border: `2px solid ${tone}`, borderRadius: 4 }} />
    <div>
      <div style={{ fontFamily: MONO, fontSize: 21, color: c.muted }}>
        {off} · <span style={{ color: tone }}>{bytes}</span>
      </div>
      <div style={{ fontSize: 22 }}>{text}</div>
    </div>
  </div>
);

const VF_TrBytes: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_TR} lens="Explained via bytes" title="The proof container, byte by byte" proc={proc}>
      <At x={120} y={262} w={680}>
        <VF_HexRow row={0} s={s} />
        <VF_HexRow row={1} s={s} />
        <VF_HexRow row={2} s={s} />
        <VF_HexRow row={3} s={s} />
        <VF_HexRow row={4} s={s} />
        <VF_HexRow row={5} s={s} />
        <VF_HexRow row={6} s={s} />
        <VF_HexRow row={7} s={s} />
        <VF_HexRow row={8} s={s} />
        <VF_HexRow row={9} s={s} />
      </At>
      <At x={860} y={266} w={480}>
        <VF_Legend n={1} s={s} tone={c.clayHex} soft={c.claySoft} off="0x00" bytes="01 008e" text="proof input, length 142" />
        <VF_Legend n={2} s={s} tone={c.violet} soft={VF_VIOLET_SOFT} off="0x03" bytes="01 0001 08" text="amount 8" />
        <VF_Legend n={3} s={s} tone={c.muted} soft={c.panel} off="0x07" bytes="02 0021 …" text="keyset id, 33 raw bytes" />
        <VF_Legend
          n={4}
          s={s}
          tone={c.cool}
          soft={c.coolSoft}
          off="0x2b"
          bytes="03 0030 …"
          text={
            <>
              <M>Y</M>, 48 B (G1 point)
            </>
          }
        />
        <VF_Legend
          n={5}
          s={s}
          tone={c.good}
          soft={c.goodSoft}
          off="0x5e"
          bytes="04 0030 …"
          text={
            <>
              <M>C</M>, 48 B (the mint's signature)
            </>
          }
        />
      </At>
      <VF_Box x={120} y={720} w={1220} show={s >= 4} tone={c.line} fill={c.panel}>
        <div style={{ fontSize: 23, lineHeight: 1.5 }}>
          Not in these bytes: the secret <VF_Hex size={21}>02e6e7cf…a29b</VF_Hex>. Field 03 carries{' '}
          <M>
            Y = <Up>hash_to_curve_G1</Up>(secret)
          </M>
          .
        </div>
        <div style={{ fontSize: 23, lineHeight: 1.5, marginTop: 6, ...VF_enter(s >= 5, 0) }}>
          <Code>input_id</Code> = SHA-256 of all 145 bytes ={' '}
          <VF_Hex size={21} color={c.clayHex}>
            44002fef2fb9ce31…6c3616f3
          </VF_Hex>
        </div>
      </VF_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Container type 01 (proof input); length <Code>008e</Code> = 142.
        </StepItem>
        <StepItem n={2} step={s}>
          Field 01, amount: length 1, value <Code>08</Code>.
        </StepItem>
        <StepItem n={3} step={s}>
          Field 02, keyset id: <Code>0021</Code> = 33 raw bytes.
        </StepItem>
        <StepItem n={4} step={s}>
          Field 03, <M>Y</M>: <Code>0030</Code> = 48 bytes.
        </StepItem>
        <StepItem n={5} step={s}>
          Field 04, <M>C</M>: 48 bytes. The whole record hashes to the input id.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Operations as transactions ──────────────────────────────────────────────

type VF_CType = '01' | '02' | '03' | '04';
const VF_CTONE: Record<VF_CType, [string, string]> = {
  '01': [c.clayHex, c.claySoft],
  '02': [c.violet, VF_VIOLET_SOFT],
  '03': [c.node, c.card],
  '04': [c.good, c.goodSoft],
};

const VF_CChip = ({ t, bytes, w }: { t: VF_CType; bytes: number; w: number }) => (
  <span
    style={{
      display: 'inline-block',
      width: w,
      boxSizing: 'border-box',
      marginRight: 8,
      padding: '6px 0',
      textAlign: 'center',
      fontFamily: MONO,
      fontSize: 21,
      border: `1.75px solid ${VF_CTONE[t][0]}`,
      background: VF_CTONE[t][1],
      borderRadius: 8,
    }}
  >
    {t} · {bytes} B
  </span>
);

const VF_OpRow = ({
  name,
  sub,
  size,
  digest,
  show,
  children,
}: {
  name: string;
  sub: string;
  size: string;
  digest: string;
  show: boolean;
  children: ReactNode;
}) => (
  <VF_TR show={show} minH={84}>
    <VF_TC w={290}>
      <div style={{ fontSize: 25 }}>{name}</div>
      <div style={{ fontSize: 21, color: c.muted }}>{sub}</div>
    </VF_TC>
    <VF_TC w={790}>
      <div style={{ display: 'flex' }}>{children}</div>
    </VF_TC>
    <VF_TC w={130} mono size={22}>
      {size}
    </VF_TC>
    <VF_TC w={470} mono size={22} color={c.clayHex}>
      {digest}
    </VF_TC>
  </VF_TR>
);

const VF_LegendChip = ({ t, text }: { t: VF_CType; text: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginRight: 36, fontSize: 22 }}>
    <span
      style={{
        fontFamily: MONO,
        fontSize: 21,
        padding: '2px 10px',
        border: `1.75px solid ${VF_CTONE[t][0]}`,
        background: VF_CTONE[t][1],
        borderRadius: 6,
      }}
    >
      {t}
    </span>
    {text}
  </span>
);

const VF_TrOps: Page = () => {
  const proc = useProcess(5, 1800);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_TR} lens="Focus: every operation is a transaction" title="Swap, mint, melt: one transcript shape" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VF_TR head>
          <VF_TC head w={290}>Operation</VF_TC>
          <VF_TC head w={790}>Containers in transcript order</VF_TC>
          <VF_TC head w={130}>Size</VF_TC>
          <VF_TC head w={470}>transaction_digest</VF_TC>
        </VF_TR>
        <VF_OpRow name="Swap" sub="NUT-03 · 8 → 4 + 4" size="333 B" digest="7d4783154ee7e697…" show={s >= 1}>
          <VF_CChip t="01" bytes={145} w={220} />
          <VF_CChip t="03" bytes={94} w={170} />
          <VF_CChip t="03" bytes={94} w={170} />
        </VF_OpRow>
        <VF_OpRow name="Mint" sub="NUT-04 · quote 8 → 8" size="119 B" digest="271cb7d13b3de01f…" show={s >= 2}>
          <VF_CChip t="02" bytes={25} w={140} />
          <VF_CChip t="03" bytes={94} w={170} />
        </VF_OpRow>
        <VF_OpRow name="Batched mint" sub="NUT-29 · quotes 5 + 3 → 8" size="144 B" digest="7309fef139318f9d…" show={s >= 3}>
          <VF_CChip t="02" bytes={25} w={140} />
          <VF_CChip t="02" bytes={25} w={140} />
          <VF_CChip t="03" bytes={94} w={170} />
        </VF_OpRow>
        <VF_OpRow name="Melt" sub="NUT-05 · 8 → quote 8" size="170 B" digest="1245d154ac77eaa2…" show={s >= 4}>
          <VF_CChip t="01" bytes={145} w={220} />
          <VF_CChip t="04" bytes={25} w={140} />
        </VF_OpRow>
        <VF_OpRow name="Melt with change" sub="NUT-08 blank outputs" size="356 B" digest="9443ab45dd96f047…" show={s >= 5}>
          <VF_CChip t="01" bytes={145} w={220} />
          <VF_CChip t="03" bytes={93} w={170} />
          <VF_CChip t="03" bytes={93} w={170} />
          <VF_CChip t="04" bytes={25} w={140} />
        </VF_OpRow>
      </At>
      <At x={120} y={790} w={1680}>
        <div>
          <VF_LegendChip t="01" text="proof input" />
          <VF_LegendChip t="02" text="mint quote input" />
          <VF_LegendChip t="03" text="blinded message output" />
          <VF_LegendChip t="04" text="melt quote output" />
        </div>
        <Note style={{ marginTop: 20 }}>
          Inputs (01, 02) sign, outputs (03, 04) never do. Other combinations are valid transactions; they need only an
          endpoint or request field.
        </Note>
      </At>
    </VarShell>
  );
};

const VF_TrMeltChange: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_TR} lens="Focus: ordering and zero amounts" title="Melt with change, container by container" proc={proc}>
      <At x={120} y={262} w={560}>
        <Fade show={s >= 1}>
          <VF_Lab>request body, field order</VF_Lab>
          <pre
            style={{
              margin: '8px 0 0',
              fontFamily: MONO,
              fontSize: 22,
              lineHeight: 1.5,
              background: c.card,
              border: `1.5px solid ${c.rule}`,
              borderRadius: 12,
              padding: '12px 22px',
            }}
          >
            {'{\n  "quote":   "quote-melt-0001",\n  "inputs":  [ 8-sat proof ],\n  "outputs": [ blank, blank ]\n}'}
          </pre>
        </Fade>
      </At>
      <At x={760} y={262} w={580}>
        <Fade show={s >= 2}>
          <VF_Lab>transcript order</VF_Lab>
        </Fade>
        <div style={{ marginTop: 8 }}>
          <div style={{ marginBottom: 10, ...VF_enter(s >= 2, 0) }}>
            <VF_CChip t="01" bytes={145} w={220} /> <span style={{ fontSize: 22 }}>proof input</span>
          </div>
          <div style={{ marginBottom: 10, ...VF_enter(s >= 2, 60) }}>
            <VF_CChip t="03" bytes={93} w={220} /> <span style={{ fontSize: 22 }}>blank output</span>
          </div>
          <div style={{ marginBottom: 10, ...VF_enter(s >= 2, 120) }}>
            <VF_CChip t="03" bytes={93} w={220} /> <span style={{ fontSize: 22 }}>blank output</span>
          </div>
          <div style={{ ...VF_enter(s >= 2, 180) }}>
            <VF_CChip t="04" bytes={25} w={220} /> <span style={{ fontSize: 22 }}>melt quote, last</span>
          </div>
        </div>
      </At>
      <At x={120} y={530} w={1220}>
        <VF_Cap show={s >= 3}>Blank output, amount 0</VF_Cap>
        <div style={{ display: 'flex' }}>
          <VF_Seg bytes="03" label="type" tone="type" show={s >= 3} />
          <VF_Seg bytes="005a" label="90" tone="len" show={s >= 3} hot={s === 3} delay={40} />
          <VF_Seg bytes="01 0000" label="amount: empty" show={s >= 3} hot={s === 3} delay={80} />
          <VF_Seg bytes="02 0021 02b7e0…cf99f6" label="keyset id" show={s >= 3} delay={120} />
          <VF_Seg bytes="03 0030 b42a0b…78cd55" label="B_" show={s >= 3} delay={160} />
        </div>
        <div style={{ fontSize: 22, color: c.muted, marginTop: 6, ...VF_enter(s >= 3, 250) }}>
          a 4-sat output for comparison: <VF_Hex size={21}>03 005b 01 0001 04 …</VF_Hex>
        </div>
      </At>
      <At x={120} y={716} w={1220}>
        <VF_Cap show={s >= 4}>Melt quote output</VF_Cap>
        <div style={{ display: 'flex' }}>
          <VF_Seg bytes="04" label="type" tone="type" show={s >= 4} />
          <VF_Seg bytes="0016" label="22" tone="len" show={s >= 4} delay={40} />
          <VF_Seg bytes="01 0001 08" label="amount 8 + fee reserve 0" show={s >= 4} hot={s === 4} delay={80} />
          <VF_Seg bytes="02 000f 71756f74652d6d656c742d30303031" label='"quote-melt-0001", UTF-8' show={s >= 4} delay={120} />
        </div>
      </At>
      <At x={120} y={880} w={1220}>
        <Fade show={s >= 4} delay={300}>
          <div style={{ fontSize: 22, color: c.muted }}>
            356 B · digest <VF_Hex color={c.clayHex}>9443ab45dd96f047…</VF_Hex> · input digest{' '}
            <VF_Hex color={c.clayHex}>1604341ea199ab31…</VF_Hex>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The request names the quote first, then proofs, then blank change outputs.
        </StepItem>
        <StepItem n={2} step={s}>
          The transcript sorts by container type: 03 before 04, whatever the request order.
        </StepItem>
        <StepItem n={3} step={s}>
          Amount 0 encodes as an empty value, <Code>01 0000</Code>: length 90, not 91.
        </StepItem>
        <StepItem n={4} step={s}>
          The melt quote binds its id and its amount plus fee reserve.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>Same proof as the swap vector; same input id, different digest.</Note>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: wallet and mint ────────────────────────────────────────────

const VF_Lane = ({
  x,
  y,
  n,
  s,
  tone,
  children,
}: {
  x: number;
  y: number;
  n: number;
  s: number;
  tone: string;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 450,
      height: 104,
      boxSizing: 'border-box',
      border: `1.5px solid ${s === n ? tone : c.rule}`,
      background: c.card,
      borderRadius: 12,
      padding: '12px 18px',
      fontSize: 23,
      lineHeight: 1.4,
      ...VF_enter(s >= n, 0),
    }}
  >
    {children}
  </div>
);

const VF_TrBothSides: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const Y = [300, 424, 548, 672];
  const WX = 120;
  const MX = 890;
  return (
    <VarShell of={VF_OF_TR} lens="Perspective: wallet and mint" title="Both sides build the same bytes" proc={proc}>
      <At x={WX} y={256}>
        <VF_Lab color={c.cool}>wallet</VF_Lab>
      </At>
      <At x={MX} y={256}>
        <VF_Lab color={c.clayHex}>mint</VF_Lab>
      </At>
      <VF_Lane x={WX} y={Y[0]} n={1} s={s} tone={c.cool}>
        holds <M>k</M>, the secret <M>K = k·G</M>, and <M>C</M>
      </VF_Lane>
      <VF_Lane x={WX} y={Y[1]} n={1} s={s} tone={c.cool}>
        <M>
          Y = <Up>hash_to_curve_G1</Up>(K)
        </M>
      </VF_Lane>
      <VF_Lane x={WX} y={Y[2]} n={1} s={s} tone={c.cool}>
        transcript, 333 B
        <br />
        <VF_Hex size={21} color={c.clayHex}>
          → 7d4783154ee7e697…
        </VF_Hex>
      </VF_Lane>
      <VF_Lane x={WX} y={Y[3]} n={2} s={s} tone={c.cool}>
        input digest <VF_Hex size={21}>867091ad…</VF_Hex>
        <br />
        BIP-340 signature with <M>k</M>
      </VF_Lane>
      <div
        style={{
          position: 'absolute',
          left: 590,
          top: Y[0],
          width: 280,
          height: Y[3] + 104 - Y[0],
          boxSizing: 'border-box',
          border: `1.5px dashed ${s >= 3 ? c.node : c.rule}`,
          background: c.panel,
          borderRadius: 12,
          padding: '14px 18px',
          ...VF_enter(s >= 3, 0),
        }}
      >
        <VF_Lab>POST /v1/swap</VF_Lab>
        <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.6, marginTop: 10, whiteSpace: 'pre' }}>
          {'inputs:\n  amount 8\n  id 02b7e0…\n  secret 02e6e7…\n  C 84d1b7…\n  witness\noutputs: 2 ×\n  amount 4\n  id, B_'}
        </div>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 8 }}>no transcript field</div>
      </div>
      <Canvas>
        <Packet x1={570} y1={560} x2={890} y2={560} run={proc.anim && s === 3} dur={1100} />
      </Canvas>
      <VF_Lane x={MX} y={Y[0]} n={4} s={s} tone={c.clayHex}>
        reads amount, id, <M>K</M>, <M>C</M>, witness; outputs
      </VF_Lane>
      <VF_Lane x={MX} y={Y[1]} n={4} s={s} tone={c.clayHex}>
        <M>
          Y = <Up>hash_to_curve_G1</Up>(K)
        </M>
        , checks <M>Y</M> unspent
      </VF_Lane>
      <VF_Lane x={MX} y={Y[2]} n={4} s={s} tone={c.clayHex}>
        rebuilds the transcript, 333 B
        <br />
        <VF_Hex size={21} color={c.clayHex}>
          → 7d4783154ee7e697…
        </VF_Hex>
      </VF_Lane>
      <VF_Lane x={MX} y={Y[3]} n={4} s={s} tone={c.clayHex}>
        input digest <VF_Hex size={21}>867091ad…</VF_Hex>
        <br />
        verifies against <M>x(K)</M> <VF_Ok />
      </VF_Lane>
      <At x={120} y={812} w={1220}>
        <Fade show={s >= 4} delay={300}>
          <Note>
            The request carries no transcript: each side derives it from the request. For a melt, the mint reads the
            quote amount and fee reserve from its own quote state.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet builds the transcript from its own request.
        </StepItem>
        <StepItem n={2} step={s}>
          It derives the input digest and signs it with <M>k</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          The request carries the proof with its witness and the outputs.
        </StepItem>
        <StepItem n={4} step={s}>
          The mint rebuilds identical bytes and checks the signature against the secret's x-coordinate.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Comparison with the NUT-11 SIG_ALL message ──────────────────────────────

const VF_SA_W = [330, 640, 710];
const VF_SaRow = ({ a, b, v, show, delay = 0 }: { a: ReactNode; b: ReactNode; v: ReactNode; show: boolean; delay?: number }) => (
  <VF_TR show={show} delay={delay} minH={56}>
    <VF_TC w={VF_SA_W[0]} color={c.muted}>
      {a}
    </VF_TC>
    <VF_TC w={VF_SA_W[1]}>{b}</VF_TC>
    <VF_TC w={VF_SA_W[2]}>{v}</VF_TC>
  </VF_TR>
);

const VF_TrSigAll: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  const W = VF_SA_W;
  return (
    <VarShell of={VF_OF_TR} lens="Framing: comparison with the SIG_ALL message" title="SIG_ALL message versus TLV transcript" proc={proc}>
      <At x={120} y={256} w={1680}>
        <div style={{ display: 'flex', gap: 30 }}>
          <div style={{ width: 830, background: c.panel, borderRadius: 12, padding: '12px 20px', boxSizing: 'border-box' }}>
            <VF_Lab>NUT-11 SIG_ALL, swap</VF_Lab>
            <div style={{ fontFamily: MONO, fontSize: 21, marginTop: 6 }}>
              secret_0 ‖ C_0 ‖ … ‖ amount_0 ‖ B_0 ‖ …
            </div>
          </div>
          <div style={{ width: 820, background: c.claySoft, borderRadius: 12, padding: '12px 20px', boxSizing: 'border-box' }}>
            <VF_Lab color={c.clayHex}>NUT-10 v3 transcript</VF_Lab>
            <div style={{ fontFamily: MONO, fontSize: 21, marginTop: 6 }}>type ‖ length ‖ value, per element</div>
          </div>
        </div>
      </At>
      <At x={120} y={384} w={1680}>
        <VF_TR head>
          <VF_TC head w={W[0]}> </VF_TC>
          <VF_TC head w={W[1]}>SIG_ALL message (pre-v3)</VF_TC>
          <VF_TC head w={W[2]}>transaction transcript (v3)</VF_TC>
        </VF_TR>
        <VF_SaRow show={s >= 1} a="unit" b="string concatenation" v="typed records with 2-byte lengths" />
        <VF_SaRow
          show={s >= 1}
          delay={60}
          a="input identified by"
          b="secret string, C as hex"
          v={
            <>
              <M>Y</M> and <M>C</M>, raw bytes; no secret
            </>
          }
        />
        <VF_SaRow show={s >= 1} delay={120} a="input amount, keyset" b="not included" v="included" />
        <VF_SaRow
          show={s >= 2}
          a="output"
          b={
            <>
              amount as string, <Code>B_</Code> as hex
            </>
          }
          v={
            <>
              amount, keyset id, <Code>B_</Code>
            </>
          }
        />
        <VF_SaRow show={s >= 2} delay={60} a="melt quote" b="quote_id appended" v="container 04: id, amount plus fee reserve" />
        <VF_SaRow show={s >= 2} delay={120} a="mint quote" b="separate NUT-20 message" v="container 02: an input that signs" />
        <VF_SaRow show={s >= 3} a="signed by" b="first input's witness only" v="every v3 input, over its own input digest" />
        <VF_SaRow show={s >= 3} delay={60} a="applies" b="opt-in, fixed in the secret's tags" v="every v3 transaction" />
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Source 3 · Per-input signing digest
// ═════════════════════════════════════════════════════════════════════════════

const VF_DRow = ({
  y,
  n,
  s,
  formula,
  value,
  plain,
}: {
  y: number;
  n: number;
  s: number;
  formula: ReactNode;
  value: ReactNode;
  plain: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      top: y,
      width: 1220,
      height: 126,
      boxSizing: 'border-box',
      border: `1.5px solid ${s === n ? c.clayHex : c.rule}`,
      background: c.card,
      borderRadius: 12,
      padding: '12px 22px',
      ...VF_enter(s >= n, 0),
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 22, lineHeight: 1.4 }}>{formula}</div>
    <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.4, color: c.clayHex }}>{value}</div>
    <div style={{ fontSize: 22, lineHeight: 1.4, color: c.muted }}>{plain}</div>
  </div>
);

const VF_IdBeginner: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_ID} lens="Beginner" title="Three hashes before one signature" proc={proc}>
      <VF_DRow
        y={262}
        n={1}
        s={s}
        formula="transaction_digest = SHA-256(transcript)"
        value={VF_V.swapDigest}
        plain="Fingerprint of the whole transaction, all 333 bytes."
      />
      <VF_DRow
        y={404}
        n={2}
        s={s}
        formula="input_id = SHA-256(this input's record)"
        value={VF_V.inputId}
        plain="Fingerprint of this one input, its 145-byte record."
      />
      <VF_DRow
        y={546}
        n={3}
        s={s}
        formula={'input_digest = tagged_hash("Cashu_TransactionInput", transaction_digest ‖ input_id)'}
        value={VF_V.swapInputDigest}
        plain="This input inside this transaction. Tagged hash: SHA-256 with a fixed label hashed in front."
      />
      <VF_DRow
        y={688}
        n={4}
        s={s}
        formula="signature = BIP-340 sign(k, input_digest)"
        value="a46a08f9cf25bee38abe8e83a57dae31…a56509a2"
        plain={
          <>
            <M>k</M>: the private key of the proof's secret <M>K = k·G</M>. 64 bytes, carried in the witness.
          </>
        }
      />
      <At x={120} y={840} w={1220}>
        <Fade show={s >= 4} delay={300}>
          <Note>Change any byte of any input or output: line 1 changes, so lines 3 and 4 change.</Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Hash the whole transaction once.
        </StepItem>
        <StepItem n={2} step={s}>
          Hash this input's record on its own.
        </StepItem>
        <StepItem n={3} step={s}>
          Combine both under a fixed label.
        </StepItem>
        <StepItem n={4} step={s}>
          Sign the result with the proof's private key.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>Values: the swap vector from the NUT-10 tests.</Note>
      </StepList>
    </VarShell>
  );
};

const VF_Prop = ({
  x,
  y,
  n,
  title,
  show,
  children,
}: {
  x: number;
  y: number;
  n: string;
  title: string;
  show: boolean;
  children: ReactNode;
}) => (
  <div style={{ position: 'absolute', left: x, top: y, width: 810, ...VF_enter(show, 0) }}>
    <div style={{ fontSize: 24, fontWeight: 600 }}>
      <span style={{ fontFamily: MONO, color: c.clayHex, marginRight: 12 }}>{n}</span>
      {title}
    </div>
    <div style={{ fontSize: 22, lineHeight: 1.42, color: c.muted, marginTop: 4, paddingLeft: 30 }}>{children}</div>
  </div>
);

const VF_IdAdvanced: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_ID} lens="Advanced" title="Properties of the input digest" proc={proc}>
      <At x={120} y={256} w={1680}>
        <pre
          style={{
            margin: 0,
            fontFamily: MONO,
            fontSize: 22,
            lineHeight: 1.5,
            background: c.card,
            border: `1.5px solid ${c.rule}`,
            borderRadius: 12,
            padding: '12px 24px',
          }}
        >
          {'transaction_digest = SHA256(transcript)\ninput_id           = SHA256(input container record, header included)\ninput_digest       = SHA256(T ‖ T ‖ transaction_digest ‖ input_id)\nT                  = SHA256("Cashu_TransactionInput") = 4996fee585f625e6…'}
        </pre>
      </At>
      <VF_Prop x={120} y={450} n="1" title="Distinct messages" show={s >= 1}>
        A valid transaction repeats no <M>Y</M> and no quote id, so input ids differ and no two inputs sign the same
        message (given SHA-256 collision resistance).
      </VF_Prop>
      <VF_Prop x={990} y={450} n="2" title="Whole-transaction coverage" show={s >= 1}>
        The transaction digest covers every container, outputs included. Changing any output changes every input
        digest.
      </VF_Prop>
      <VF_Prop x={120} y={610} n="3" title="Bound to one input" show={s >= 2}>
        A witness verifies only at its own input. <Code>02‖x</Code> and <Code>03‖x</Code> are distinct secrets one
        scalar can spend; their signatures still cover different messages.
      </VF_Prop>
      <VF_Prop x={990} y={610} n="4" title="One-way under disclosure" show={s >= 2}>
        A published witness and input digest verify without the transaction digest; recovering it from them needs a
        SHA-256 preimage.
      </VF_Prop>
      <VF_Prop x={120} y={770} n="5" title="Tagging" show={s >= 3}>
        Only the signed message is tagged. A NUT-22 request transcript is signed under its own tag.
      </VF_Prop>
      <VF_Prop x={990} y={770} n="6" title="Mixed keysets" show={s >= 3}>
        Pre-v3 inputs sit in the transcript but derive no input digest; they keep NUT-10 JSON, NUT-11 and NUT-14
        rules.
      </VF_Prop>
    </VarShell>
  );
};

const VF_IdGraphical: Page = () => {
  const proc = useProcess(5, 1800);
  const s = proc.step;
  const B = 3.5;
  const i1 = 120;
  const i2 = i1 + 145 * B;
  const o1 = i2 + 145 * B;
  const o2 = o1 + 94 * B;
  const end = o2 + 94 * B;
  return (
    <VarShell of={VF_OF_ID} lens="Graphical" title="One transaction digest, one digest per input" proc={proc}>
      <Canvas>
        <VF_BarSeg x={i1} y={272} w={145 * B} h={64} fill={c.claySoft} stroke={c.clayHex} label="in₁" show />
        <VF_BarSeg x={i2} y={272} w={145 * B} h={64} fill={c.coolSoft} stroke={c.cool} label="in₂" show />
        <VF_BarSeg x={o1} y={272} w={94 * B} h={64} fill={c.panel} stroke={c.node} label="out" show />
        <VF_BarSeg x={o2} y={272} w={94 * B} h={64} fill={c.panel} stroke={c.node} label="out" show />
        <GFade show={s >= 1}>
          <line x1={i1} y1={352} x2={end} y2={352} style={{ stroke: c.node, strokeWidth: 1.75 }} />
          <line x1={i1} y1={344} x2={i1} y2={352} style={{ stroke: c.node, strokeWidth: 1.75 }} />
          <line x1={end} y1={344} x2={end} y2={352} style={{ stroke: c.node, strokeWidth: 1.75 }} />
        </GFade>
        <Arrow x1={960} y1={354} x2={960} y2={428} show={s >= 1} color={c.node} />
        <Arrow x1={300} y1={340} x2={300} y2={428} show={s >= 2} color={c.clayHex} />
        <Arrow x1={i2 + 460} y1={340} x2={1560} y2={428} show={s >= 2} color={c.cool} />
        <Arrow x1={380} y1={512} x2={560} y2={598} show={s >= 3} color={c.clayHex} />
        <Arrow x1={880} y1={512} x2={720} y2={598} show={s >= 3} color={c.node} />
        <Arrow x1={1040} y1={512} x2={1200} y2={598} show={s >= 3} color={c.node} />
        <Arrow x1={1480} y1={512} x2={1360} y2={598} show={s >= 3} color={c.cool} />
        <Arrow x1={640} y1={682} x2={640} y2={766} show={s >= 4} color={c.clayHex} />
        <Arrow x1={1280} y1={682} x2={1280} y2={766} show={s >= 4} color={c.cool} />
        <GFade show={s >= 5}>
          <line x1={790} y1={800} x2={1110} y2={672} style={{ stroke: c.bad, strokeWidth: 2, strokeDasharray: '7 7' }} />
          <line x1={1130} y1={800} x2={810} y2={672} style={{ stroke: c.bad, strokeWidth: 2, strokeDasharray: '7 7' }} />
          <circle cx={960} cy={736} r={24} style={{ fill: c.card, stroke: c.bad, strokeWidth: 2 }} />
          <text x={960} y={745} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 26, fill: c.bad }}>
            ✗
          </text>
        </GFade>
      </Canvas>
      <VF_Node x={960} y={470} w={380} title="transaction_digest" value="9517f426…" show={s >= 1} tone={c.node} fill={c.panel} />
      <VF_Node x={300} y={470} w={330} title="input_id₁" value="44002fef…" show={s >= 2} tone={c.clayHex} />
      <VF_Node x={1560} y={470} w={330} title="input_id₂" value="08960176…" show={s >= 2} tone={c.cool} />
      <VF_Node x={640} y={640} w={360} title="input_digest₁" value="3c5ccb85…" show={s >= 3} tone={c.clayHex} fill={c.claySoft} />
      <VF_Node x={1280} y={640} w={360} title="input_digest₂" value="720c3e06…" show={s >= 3} tone={c.cool} fill={c.coolSoft} />
      <VF_Node x={640} y={810} w={300} title="σ₁, key of in₁" value="51133bcf…" show={s >= 4} tone={c.clayHex} />
      <VF_Node x={1280} y={810} w={300} title="σ₂, key of in₂" value="5069c493…" show={s >= 4} tone={c.cool} />
    </VarShell>
  );
};

const VF_BRow = ({
  off,
  name,
  hex,
  show,
  hot,
  tone = c.ink,
}: {
  off: string;
  name: ReactNode;
  hex: string;
  show: boolean;
  hot: boolean;
  tone?: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: 46,
      padding: '0 12px',
      borderRadius: 8,
      background: hot ? c.claySoft : 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
      ...VF_enter(show, 0),
    }}
  >
    <span style={{ width: 70, fontFamily: MONO, fontSize: 21, color: c.dim }}>{off}</span>
    <span style={{ width: 236, fontSize: 22, color: c.muted }}>{name}</span>
    <span style={{ fontFamily: MONO, fontSize: 22, color: tone }}>{hex}</span>
  </div>
);

const VF_IdBytes: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_ID} lens="Explained via bytes" title="The tagged hash, byte by byte" proc={proc}>
      <At x={120} y={256} w={1220}>
        <div style={{ fontSize: 22, color: c.muted, marginBottom: 8 }}>
          tag = <Code>"Cashu_TransactionInput"</Code>, 22 ASCII bytes · message to hash: 128 bytes
        </div>
        <VF_BRow off="0x00" name="SHA-256(tag)" hex={VF_V.tagHash} show={s >= 1} hot={s === 1} />
        <VF_BRow off="0x20" name="SHA-256(tag)" hex={VF_V.tagHash} show={s >= 1} hot={s === 1} />
        <VF_BRow off="0x40" name="transaction_digest" hex={VF_V.swapDigest} show={s >= 2} hot={s === 2} />
        <VF_BRow off="0x60" name="input_id" hex={VF_V.inputId} show={s >= 3} hot={s === 3} />
      </At>
      <At x={120} y={520} w={1220}>
        <Fade show={s >= 4}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderTop: `1.5px solid ${c.line}` }}>
            <span style={{ width: 306, fontSize: 22 }}>SHA-256 → input_digest</span>
            <VF_Hex size={22} color={c.clayHex}>
              {VF_V.swapInputDigest}
            </VF_Hex>
          </div>
        </Fade>
      </At>
      <VF_Box x={120} y={610} w={1220} show={s >= 5} title="BIP-340 over input_digest">
        <div style={{ display: 'flex', marginTop: 8 }}>
          <span style={{ width: 290, fontSize: 22, color: c.muted }}>signer</span>
          <span style={{ fontSize: 22 }}>
            <M>k</M> = <VF_Hex size={21}>47196dc081150ce1…1af70347</VF_Hex> (bearer key of this vector)
          </span>
        </div>
        <div style={{ display: 'flex', marginTop: 6 }}>
          <span style={{ width: 290, fontSize: 22, color: c.muted }}>signature, 64 B</span>
          <span style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.45 }}>
            a46a08f9cf25bee38abe8e83a57dae316b64e826f3bd1a7261d3230cb97a70d9
            <br />
            10ffda84536464853b651cafeb3167affc13d1456d0647cdc685422ba56509a2
          </span>
        </div>
        <div style={{ display: 'flex', marginTop: 6 }}>
          <span style={{ width: 290, fontSize: 22, color: c.muted }}>checked against</span>
          <span style={{ fontSize: 22 }}>
            x-coordinate of the secret, <VF_Hex size={21}>e6e7cfa7b82d4b3b…4b8022a29b</VF_Hex>
          </span>
        </div>
      </VF_Box>
      <StepList>
        <StepItem n={1} step={s}>
          SHA-256 of the tag, written twice: 64 bytes.
        </StepItem>
        <StepItem n={2} step={s}>
          The transaction digest: 32 bytes.
        </StepItem>
        <StepItem n={3} step={s}>
          The input id: 32 bytes.
        </StepItem>
        <StepItem n={4} step={s}>
          One SHA-256 over the 128 bytes: the input digest.
        </StepItem>
        <StepItem n={5} step={s}>
          A 64-byte BIP-340 signature, checked x-only.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VF_CodeLine = ({ on, children }: { on: boolean; children: ReactNode }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 22,
      lineHeight: 1.62,
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

const VF_Cm = ({ children }: { children: ReactNode }) => <span style={{ color: c.dim }}>{children}</span>;

const VF_IdVerifier: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_ID} lens="Perspective: mint (verifier)" title="Verifying the inputs of one request" proc={proc}>
      <VF_Box x={120} y={262} w={1220} title="pseudocode, not CDK code" pad="14px 26px">
        <div style={{ marginTop: 8 }}>
          <VF_CodeLine on={s === 1}>
            {'tx = transcript(request)       '}
            <VF_Cm># containers, by type</VF_Cm>
          </VF_CodeLine>
          <VF_CodeLine on={s === 1}>{'d  = sha256(tx)'}</VF_CodeLine>
          <VF_CodeLine on={s === 2}>{'for each input i in request:'}</VF_CodeLine>
          <VF_CodeLine on={s === 2}>{'  if keyset(i).version < 02:'}</VF_CodeLine>
          <VF_CodeLine on={s === 2}>
            {'    pre-v3 rules               '}
            <VF_Cm># JSON secret, NUT-11, NUT-14</VF_Cm>
          </VF_CodeLine>
          <VF_CodeLine on={s === 2}>{'    continue'}</VF_CodeLine>
          <VF_CodeLine on={s === 3}>
            {'  rec = container(i)           '}
            <VF_Cm># same bytes as in tx</VF_Cm>
          </VF_CodeLine>
          <VF_CodeLine on={s === 3}>{'  msg = tagged_hash("Cashu_TransactionInput", d ‖ sha256(rec))'}</VF_CodeLine>
          <VF_CodeLine on={s === 4}>{'  w = parse(i.witness)'}</VF_CodeLine>
          <VF_CodeLine on={s === 4}>{'  if "leaf" in w: script path over msg'}</VF_CodeLine>
          <VF_CodeLine on={s === 4}>{'  else: exactly one BIP-340 signature on msg, x-only secret'}</VF_CodeLine>
          <VF_CodeLine on={s === 5}>{'  require Y(i) unspent'}</VF_CodeLine>
        </div>
      </VF_Box>
      <At x={120} y={804} w={1220}>
        <Fade show={s >= 4}>
          <Note>
            Script path: at most 3 sibling hashes; recompute root and tweak, <M>K + t·G</M> must equal the secret;
            parse the leaf, fail closed. Mints may reject a witness over 4096 characters.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Build the transcript once per request.
        </StepItem>
        <StepItem n={2} step={s}>
          Pre-v3 inputs keep their own rules in the same transaction.
        </StepItem>
        <StepItem n={3} step={s}>
          Each v3 input gets its own message.
        </StepItem>
        <StepItem n={4} step={s}>
          Key path: one signature. Script path: leaf, control block, signatures.
        </StepItem>
        <StepItem n={5} step={s}>
          Then the usual double-spend check on <M>Y</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VF_InCard = ({
  x,
  title,
  tone,
  show,
  delay = 0,
  secret,
  id,
  dig,
  sig,
}: {
  x: number;
  title: string;
  tone: string;
  show: boolean;
  delay?: number;
  secret: string;
  id: string;
  dig: string;
  sig: string;
}) => (
  <VF_Box x={x} y={344} w={590} title={title} tone={tone} show={show} delay={delay}>
    <div style={{ fontSize: 22, lineHeight: 1.5, marginTop: 6 }}>
      <div>
        <span style={{ color: c.dim, display: 'inline-block', width: 170 }}>secret</span>
        <VF_Hex size={21}>{secret}</VF_Hex>
      </div>
      <div>
        <span style={{ color: c.dim, display: 'inline-block', width: 170 }}>input_id</span>
        <VF_Hex size={21}>{id}</VF_Hex>
      </div>
      <div>
        <span style={{ color: c.dim, display: 'inline-block', width: 170 }}>input_digest</span>
        <VF_Hex size={21} color={tone}>
          {dig}
        </VF_Hex>
      </div>
      <div>
        <span style={{ color: c.dim, display: 'inline-block', width: 170 }}>signature</span>
        <VF_Hex size={21}>{sig}</VF_Hex>
      </div>
    </div>
  </VF_Box>
);

const VF_MCell = ({ ok, show, delay = 0, children }: { ok: boolean; show: boolean; delay?: number; children: ReactNode }) => (
  <div
    style={{
      width: 320,
      height: 62,
      boxSizing: 'border-box',
      marginRight: 16,
      border: `1.5px solid ${ok ? c.good : c.bad}`,
      background: ok ? c.goodSoft : c.badSoft,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 23,
      ...VF_enter(show, delay),
    }}
  >
    {children}
  </div>
);

const VF_IdMatrix: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_ID} lens="Focus: no cross-input replay" title="Two inputs, two messages" proc={proc}>
      <VF_Box x={120} y={262} w={1220} show={s >= 1} fill={c.panel} tone={c.line} pad="10px 22px">
        <span style={{ fontSize: 22, color: c.muted }}>shared transaction_digest </span>
        <VF_Hex size={21}>9517f426f14d8dcf29aa4e44832f7cba5c44d754f2dde955fecdc0ad731610d6</VF_Hex>
      </VF_Box>
      <VF_InCard
        x={120}
        title="input 1 · 8 sat"
        tone={c.clayHex}
        show={s >= 2}
        secret="02e6e7cf…8022a29b"
        id="44002fef…6c3616f3"
        dig="3c5ccb85…74a9aa1b"
        sig="51133bcf…8c88280f"
      />
      <VF_InCard
        x={750}
        title="input 2 · 4 sat"
        tone={c.cool}
        show={s >= 2}
        delay={120}
        secret="03a882e1…2cdf74bf"
        id="08960176…7d6ffdaf"
        dig="720c3e06…32f68acf"
        sig="5069c493…2d76135a"
      />
      <At x={120} y={580} w={1220}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, ...VF_enter(s >= 3, 0) }}>
          <span style={{ width: 220 }} />
          <span style={{ width: 336, fontSize: 22, color: c.muted }}>over input_digest 1</span>
          <span style={{ width: 336, fontSize: 22, color: c.muted }}>over input_digest 2</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ width: 220, fontSize: 23, ...VF_enter(s >= 3, 0) }}>signature 1, key 1</span>
          <VF_MCell ok show={s >= 3}>
            <VF_Ok>verifies</VF_Ok>
          </VF_MCell>
          <VF_MCell ok={false} show={s >= 4}>
            <VF_Ok ok={false}>fails</VF_Ok>
          </VF_MCell>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 220, fontSize: 23, ...VF_enter(s >= 3, 0) }}>signature 2, key 2</span>
          <VF_MCell ok={false} show={s >= 4} delay={100}>
            <VF_Ok ok={false}>fails</VF_Ok>
          </VF_MCell>
          <VF_MCell ok show={s >= 3} delay={100}>
            <VF_Ok>verifies</VF_Ok>
          </VF_MCell>
        </div>
      </At>
      <At x={120} y={830} w={1220}>
        <Fade show={s >= 4} delay={250}>
          <Note>
            <Code>02‖x</Code> and <Code>03‖x</Code> are distinct secrets with distinct <M>Y</M> that one scalar spends.
            If both were inputs signing one shared message, one signature would verify at both.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Both inputs share one transaction digest.
        </StepItem>
        <StepItem n={2} step={s}>
          Each input hashes its own record: different input ids, different input digests.
        </StepItem>
        <StepItem n={3} step={s}>
          Each signature verifies over its own input digest.
        </StepItem>
        <StepItem n={4} step={s}>
          Moved to the other input, it fails.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>Values: the multi-input vector (NUT-13 V3 counters 0 and 1).</Note>
      </StepList>
    </VarShell>
  );
};

const VF_CT_W = [290, 300, 300, 330];
const VF_IdCrossTx: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const W = VF_CT_W;
  return (
    <VarShell of={VF_OF_ID} lens="Framing: what a witness authorizes" title="One input, three transactions" proc={proc}>
      <VF_Box x={120} y={262} w={1220} title="the proof" show={s >= 1} tone={c.clayHex}>
        <div style={{ fontSize: 22, marginTop: 6 }}>
          secret <VF_Hex size={21}>02e6e7cf…8022a29b</VF_Hex>, 8 sat · input_id{' '}
          <VF_Hex size={21} color={c.clayHex}>
            44002fef2fb9ce31…6c3616f3
          </VF_Hex>{' '}
          in all three
        </div>
      </VF_Box>
      <At x={120} y={410} w={1220}>
        <VF_TR head>
          <VF_TC head w={W[0]}>transaction</VF_TC>
          <VF_TC head w={W[1]}>transaction digest</VF_TC>
          <VF_TC head w={W[2]}>input digest</VF_TC>
          <VF_TC head w={W[3]}>witness a46a08f9…</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 2} minH={62}>
          <VF_TC w={W[0]}>swap</VF_TC>
          <VF_TC w={W[1]} mono size={22}>7d4783154ee7…</VF_TC>
          <VF_TC w={W[2]} mono size={22}>867091ad6dba…</VF_TC>
          <VF_TC w={W[3]}>{s >= 3 && <VF_Ok>verifies</VF_Ok>}</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 2} delay={80} minH={62}>
          <VF_TC w={W[0]}>melt</VF_TC>
          <VF_TC w={W[1]} mono size={22}>1245d154ac77…</VF_TC>
          <VF_TC w={W[2]} mono size={22}>269af868bed9…</VF_TC>
          <VF_TC w={W[3]}>{s >= 3 && <VF_Ok ok={false}>fails</VF_Ok>}</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 2} delay={160} minH={62}>
          <VF_TC w={W[0]}>melt with change</VF_TC>
          <VF_TC w={W[1]} mono size={22}>9443ab45dd96…</VF_TC>
          <VF_TC w={W[2]} mono size={22}>1604341ea199…</VF_TC>
          <VF_TC w={W[3]}>{s >= 3 && <VF_Ok ok={false}>fails</VF_Ok>}</VF_TC>
        </VF_TR>
      </At>
      <VF_Box x={120} y={700} w={1220} show={s >= 4} tone={c.line} fill={c.panel} title="tokens (NUT-10, witnesses)">
        <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 6 }}>
          v3 proofs in serialized tokens <VF_Kw>MUST NOT</VF_Kw>carry a witness; wallets <VF_Kw>MUST</VF_Kw>drop one when
          encoding or decoding. A witness signs one input digest in one transaction and authorizes nothing elsewhere.
        </div>
      </VF_Box>
      <StepList>
        <StepItem n={1} step={s}>
          One proof: its container, and so its input id, never changes.
        </StepItem>
        <StepItem n={2} step={s}>
          Different transactions give different digests.
        </StepItem>
        <StepItem n={3} step={s}>
          The swap's witness verifies in the swap only.
        </StepItem>
        <StepItem n={4} step={s}>
          So a witness is useless outside its transaction, and tokens drop it.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>All digests from the NUT-10 transcript vectors.</Note>
      </StepList>
    </VarShell>
  );
};

const VF_IdDisclosure: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_ID} lens="Framing: the constraint that forces the design" title="Why inputs do not sign the transaction digest" proc={proc}>
      <VF_Box x={120} y={262} w={590} h={290} title="alternative: one shared message" tone={c.bad} show={s >= 1}>
        <div style={{ fontFamily: MONO, fontSize: 21, marginTop: 10 }}>msg(input i) = d</div>
        <div style={VF_enter(s >= 2, 0)}>
          <VF_Li tone={c.bad} size={22}>
            Disclosure publishes <M>d</M>, shared by every input: it links the spend to the rest of the transaction.
          </VF_Li>
          <VF_Li tone={c.bad} size={22}>
            One message for all inputs: a signature by one x-only key verifies at every input with that key.
          </VF_Li>
        </div>
      </VF_Box>
      <VF_Box x={750} y={262} w={590} h={290} title="NUT-10: one message per input" tone={c.good} show={s >= 3}>
        <div style={{ fontFamily: MONO, fontSize: 21, marginTop: 10 }}>msg(input i) = tagged_hash(tag, d ‖ id_i)</div>
        <VF_Li tone={c.good} size={22}>
          Disclosure publishes the witness and input digest only; <M>d</M> stays hidden behind SHA-256.
        </VF_Li>
        <VF_Li tone={c.good} size={22}>Each input signs a different message; a witness verifies at one input.</VF_Li>
      </VF_Box>
      <VF_Box x={120} y={590} w={1220} title="NUT-07 on v3 keysets" show={s >= 4} tone={c.line} fill={c.panel}>
        <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 6 }}>
          Spent through a <Code>disclosure</Code> 0x01 leaf: the mint <VF_Kw>MUST</VF_Kw>return the exact witness and
          input digest. Otherwise it <VF_Kw>MUST NOT</VF_Kw>return witness, input digest or transaction digest. To prove
          how the digest was formed, the spender reveals the transcript.
        </div>
      </VF_Box>
      <StepList>
        <StepItem n={1} step={s}>
          The simpler design: every input signs <M>d</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          It leaks <M>d</M> on disclosure; inputs sharing an x-only key would share signatures.
        </StepItem>
        <StepItem n={3} step={s}>
          NUT-10 derives one message per input.
        </StepItem>
        <StepItem n={4} step={s}>
          Publication then reveals one input, not the transaction.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>
          <M>d</M>: transaction digest. <Code>id_i</Code>: input id.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Source 4 · Inputs sign, outputs never do
// ═════════════════════════════════════════════════════════════════════════════

const VF_PartCard = ({
  x,
  y,
  title,
  sub,
  tone,
  show,
  delay = 0,
  signs,
  signShow,
}: {
  x: number;
  y: number;
  title: string;
  sub: ReactNode;
  tone: string;
  show: boolean;
  delay?: number;
  signs?: boolean;
  signShow: boolean;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 440,
      height: 124,
      boxSizing: 'border-box',
      border: `1.75px solid ${tone}`,
      background: c.card,
      borderRadius: 12,
      padding: '14px 20px',
      ...VF_enter(show, delay),
    }}
  >
    <div style={{ fontSize: 26 }}>{title}</div>
    <div
      style={{
        fontSize: 22,
        marginTop: 6,
        color: signs ? c.clayHex : c.muted,
        opacity: signShow ? 1 : 0,
        transition: `opacity 400ms ${EASE_OUT}`,
      }}
    >
      {sub}
    </div>
  </div>
);

const VF_IsBeginner: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_IS} lens="Beginner" title="Which parts of a transaction sign" proc={proc}>
      <At x={120} y={262}>
        <Fade show={s >= 1}>
          <VF_Lab color={c.clayHex}>inputs: value comes from here</VF_Lab>
        </Fade>
      </At>
      <At x={900} y={262}>
        <Fade show={s >= 2}>
          <VF_Lab>outputs: value goes here</VF_Lab>
        </Fade>
      </At>
      <VF_PartCard
        x={120}
        y={310}
        title="proof, 8 sat"
        sub={
          <>
            signs with <M>k</M>, the key of its secret
          </>
        }
        tone={c.clayHex}
        show={s >= 1}
        signs
        signShow={s >= 3}
      />
      <VF_PartCard
        x={120}
        y={460}
        title="paid mint quote"
        sub="signs with the quote's lock key"
        tone={c.clayHex}
        show={s >= 1}
        delay={80}
        signs
        signShow={s >= 3}
      />
      <VF_PartCard x={900} y={310} title="blinded message" sub="no signature" tone={c.node} show={s >= 2} signShow={s >= 4} />
      <VF_PartCard x={900} y={460} title="melt quote" sub="no signature" tone={c.node} show={s >= 2} delay={80} signShow={s >= 4} />
      <Canvas>
        <Arrow x1={570} y1={450} x2={890} y2={450} show={s >= 2} color={c.node} label="value" font="sans" />
      </Canvas>
      <VF_Box x={120} y={630} w={1220} show={s >= 3} tone={c.clayHex} fill={c.claySoft}>
        <div style={{ fontSize: 24, lineHeight: 1.45 }}>
          Each input signs a digest of the whole transaction, outputs included. Changing an output breaks every input's
          signature, so outputs need none of their own.
        </div>
      </VF_Box>
      <At x={120} y={790} w={1220}>
        <Fade show={s >= 4}>
          <Note>
            <div>Today's endpoints use parts of this shape:</div>
            <div>mint: quote → blinded messages · swap: proofs → blinded messages</div>
            <div>melt: proofs → melt quote and blank change outputs</div>
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Inputs: proofs and paid mint quotes.
        </StepItem>
        <StepItem n={2} step={s}>
          Outputs: blinded messages and melt quotes.
        </StepItem>
        <StepItem n={3} step={s}>
          Every input signs with its own key.
        </StepItem>
        <StepItem n={4} step={s}>
          Outputs never sign; the inputs' signatures already cover them.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VF_IsAdvanced: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_IS} lens="Advanced" title="Witness rules for v3 inputs" proc={proc}>
      <VF_RuleCard x={120} title="Proof inputs" show={s >= 1}>
        <VF_Li size={22}>
          <VF_Kw>MUST</VF_Kw>carry a witness: a BIP-340 signature over the input digest
        </VF_Li>
        <VF_Li size={22}>key path: exactly one signature, checked against the secret's x-coordinate</VF_Li>
        <VF_Li size={22}>
          signer <M>k</M> for a bare secret, <M>p′ = (k + t) mod n</M> for a tweaked one; byte-identical on the wire
        </VF_Li>
        <VF_Li size={22}>
          script path: <Code>leaf</Code>, <Code>control</Code> {'{'}K, path{'}'}, <Code>signatures</Code>,{' '}
          <Code>preimage</Code>; path of at most 3 hashes
        </VF_Li>
        <VF_Li size={22}>thresholds count distinct keys; no more signatures than listed keys</VF_Li>
      </VF_RuleCard>
      <VF_RuleCard x={690} title="Mint quote inputs" show={s >= 2}>
        <VF_Li size={22}>
          the quote <VF_Kw>MUST</VF_Kw>include <Code>pubkey</Code>; minting an unlocked quote onto a v3 keyset{' '}
          <VF_Kw>MUST</VF_Kw>be rejected
        </VF_Li>
        <VF_Li size={22}>
          witness in the request's <Code>signature</Code> field: 128 hex characters, or a script-path JSON string
        </VF_Li>
        <VF_Li size={22}>commits the amount this request issues, the sum of its outputs; outputs share one keyset</VF_Li>
        <VF_Li size={22}>
          batch (NUT-29): every quote <VF_Kw>MUST</VF_Kw>be locked; <Code>signatures[i]</Code> signs quote{' '}
          <M>i</M>'s input digest over one shared transcript
        </VF_Li>
      </VF_RuleCard>
      <VF_RuleCard x={1260} title="Around the rule" show={s >= 3}>
        <VF_Li size={22}>
          no <Code>SIG_ALL</Code>, no <Code>sigflag</Code> for v3 inputs: different locks, or none, mix freely
        </VF_Li>
        <VF_Li size={22}>pre-v3 inputs in the same transaction keep their own rules</VF_Li>
        <VF_Li size={22}>
          serialized tokens <VF_Kw>MUST NOT</VF_Kw>carry v3 witnesses; wallets <VF_Kw>MUST</VF_Kw>drop them
        </VF_Li>
        <VF_Li size={22}>
          mints <VF_Kw>MAY</VF_Kw>reject a serialized witness over 4096 characters
        </VF_Li>
        <VF_Li size={22}>
          a quote lock <VF_Kw>MAY</VF_Kw>be a nutroot point, e.g. with an <Code>after</Code> refund leaf
        </VF_Li>
      </VF_RuleCard>
      <At x={120} y={776} w={1680}>
        <Note style={{ fontSize: 22 }}>Sources: NUT-10 (signing rule, witnesses), NUT-04 and NUT-29 (v3 sections), NUT-03, NUT-05.</Note>
      </At>
    </VarShell>
  );
};

const VF_IsGraphical: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  const box = { x: 800, y: 380, w: 320, h: 360 };
  const inY = [450, 670];
  const outY = [440, 560, 680];
  const stripe = (i: number, tone: string, fill: string) => (
    <rect
      key={i}
      x={box.x + 30}
      y={box.y + 70 + i * 54}
      width={box.w - 60}
      height={40}
      rx={6}
      style={{ fill, stroke: tone, strokeWidth: 1.5 }}
    />
  );
  return (
    <VarShell of={VF_OF_IS} lens="Graphical" title="Keys on the left, none on the right" proc={proc}>
      <Canvas>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={16} style={{ fill: c.panel, stroke: c.node, strokeWidth: 1.75 }} />
        <T x={box.x + box.w / 2} y={box.y + 44} size={24} color={c.muted}>
          transcript
        </T>
        <GFade show={s >= 1}>
          {stripe(0, c.clayHex, c.claySoft)}
          {stripe(1, c.clayHex, c.claySoft)}
          {stripe(2, c.node, c.card)}
          {stripe(3, c.node, c.card)}
          {stripe(4, c.node, c.card)}
        </GFade>
        <Line x1={344} y1={inY[0]} x2={box.x + 30} y2={box.y + 90} color={c.clayHex} opacity={0.5} />
        <Line x1={344} y1={inY[1] - 8} x2={box.x + 30} y2={box.y + 144} color={c.clayHex} opacity={0.5} />
        <Packet x1={344} y1={inY[0]} x2={box.x} y2={box.y + 90} run={proc.anim && s === 1} color={c.clayHex} />
        <Packet x1={344} y1={inY[1]} x2={box.x} y2={box.y + 144} run={proc.anim && s === 1} color={c.clayHex} delay={80} />
        <Line x1={1440} y1={outY[0]} x2={box.x + box.w} y2={box.y + 198} color={c.node} opacity={0.5} />
        <Line x1={1440} y1={outY[1]} x2={box.x + box.w} y2={box.y + 252} color={c.node} opacity={0.5} />
        <Line x1={1440} y1={outY[2]} x2={box.x + box.w} y2={box.y + 306} color={c.node} opacity={0.5} />
        <Packet x1={1440} y1={outY[0]} x2={box.x + box.w} y2={box.y + 198} run={proc.anim && s === 1} color={c.node} delay={160} />
        <Packet x1={1440} y1={outY[1]} x2={box.x + box.w} y2={box.y + 252} run={proc.anim && s === 1} color={c.node} delay={220} />
        <Packet x1={1440} y1={outY[2]} x2={box.x + box.w} y2={box.y + 306} run={proc.anim && s === 1} color={c.node} delay={280} />
        {/* digests */}
        <Arrow x1={box.x - 6} y1={box.y + 150} x2={660} y2={inY[0] + 76} show={s >= 2} color={c.clayHex} />
        <Arrow x1={box.x - 6} y1={box.y + 250} x2={660} y2={inY[1] - 10} show={s >= 2} color={c.clayHex} delay={100} />
        <GFade show={s >= 2} delay={300}>
          <rect x={540} y={inY[0] + 50} width={112} height={52} rx={10} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.75 }} />
          <T x={596} y={inY[0] + 86} size={28} font="math">
            d₁
          </T>
          <rect x={540} y={inY[1] - 36} width={112} height={52} rx={10} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.75 }} />
          <T x={596} y={inY[1]} size={28} font="math">
            d₂
          </T>
        </GFade>
        {/* signatures */}
        <Draw x1={340} y1={inY[0] + 18} x2={536} y2={inY[0] + 72} show={s >= 3} color={c.clayHex} width={3} />
        <Draw x1={344} y1={inY[1] - 12} x2={536} y2={inY[1] - 10} show={s >= 3} color={c.clayHex} width={3} delay={120} />
        <T x={420} y={inY[0] + 84} size={28} font="math" color={c.clayHex} show={s >= 3} delay={400}>
          σ₁
        </T>
        <T x={440} y={inY[1] + 34} size={28} font="math" color={c.clayHex} show={s >= 3} delay={500}>
          σ₂
        </T>
        {/* input nodes */}
        <circle cx={300} cy={inY[0]} r={44} style={{ fill: c.card, stroke: c.clayHex, strokeWidth: 2.5 }} />
        <T x={300} y={inY[0] + 11} size={30} font="math">
          P₁
        </T>
        <circle cx={300} cy={inY[1]} r={44} style={{ fill: c.card, stroke: c.clayHex, strokeWidth: 2.5 }} />
        <T x={300} y={inY[1] + 11} size={30} font="math">
          P₂
        </T>
        <GFade show={s >= 3}>
          <rect x={150} y={inY[0] - 22} width={70} height={44} rx={22} style={{ fill: c.clayHex }} />
          <T x={185} y={inY[0] + 9} size={24} font="math" color={c.card}>
            k₁
          </T>
          <rect x={150} y={inY[1] - 22} width={70} height={44} rx={22} style={{ fill: c.clayHex }} />
          <T x={185} y={inY[1] + 9} size={24} font="math" color={c.card}>
            k₂
          </T>
        </GFade>
        {/* output nodes */}
        <circle cx={1484} cy={outY[0]} r={44} style={{ fill: c.card, stroke: c.node, strokeWidth: 2, strokeDasharray: s >= 4 ? '6 6' : 'none' }} />
        <T x={1484} y={outY[0] + 11} size={30} font="math">
          B₁
        </T>
        <circle cx={1484} cy={outY[1]} r={44} style={{ fill: c.card, stroke: c.node, strokeWidth: 2, strokeDasharray: s >= 4 ? '6 6' : 'none' }} />
        <T x={1484} y={outY[1] + 11} size={30} font="math">
          B₂
        </T>
        <circle cx={1484} cy={outY[2]} r={44} style={{ fill: c.card, stroke: c.node, strokeWidth: 2, strokeDasharray: s >= 4 ? '6 6' : 'none' }} />
        <T x={1484} y={outY[2] + 11} size={30} font="math">
          B₃
        </T>
        <T x={1484} y={790} size={24} color={c.muted} show={s >= 4}>
          no key
        </T>
        <T x={300} y={800} size={24} color={c.clayHex} show={s >= 1}>
          inputs
        </T>
        <T x={1484} y={340} size={24} color={c.muted} show={s >= 1}>
          outputs
        </T>
      </Canvas>
    </VarShell>
  );
};

const VF_Edge = ({ x1, y1, x2, y2, show, label, delay = 0 }: { x1: number; y1: number; x2: number; y2: number; show: boolean; label?: string; delay?: number }) => (
  <>
    <Draw x1={x1} y1={y1} x2={x2} y2={y2} show={show} color={c.node} width={1.75} delay={delay} dur={600} />
    {label && (
      <T x={(x1 + x2) / 2 + (x2 > x1 ? 18 : -18)} y={(y1 + y2) / 2} size={21} color={c.muted} show={show} delay={delay + 300} anchor={x2 > x1 ? 'start' : 'end'}>
        {label}
      </T>
    )}
  </>
);

const VF_IsDecision: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_IS} lens="Explained via decision tree" title="Which rule applies to an input" proc={proc}>
      <Canvas>
        <VF_Edge x1={660} y1={318} x2={660} y2={360} show={s >= 1} />
        <VF_Edge x1={560} y1={420} x2={400} y2={472} show={s >= 2} label="no" />
        <VF_Edge x1={760} y1={420} x2={920} y2={472} show={s >= 3} label="yes" />
        <VF_Edge x1={300} y1={548} x2={285} y2={622} show={s >= 2} delay={150} />
        <VF_Edge x1={460} y1={548} x2={600} y2={622} show={s >= 2} delay={150} />
        <VF_Edge x1={600} y1={698} x2={500} y2={772} show={s >= 2} delay={300} />
        <VF_Edge x1={960} y1={548} x2={960} y2={610} show={s >= 3} delay={150} />
        <VF_Edge x1={900} y1={670} x2={840} y2={742} show={s >= 3} delay={300} label="no" />
        <VF_Edge x1={1020} y1={670} x2={1120} y2={742} show={s >= 3} delay={300} label="yes" />
        <VF_Edge x1={820} y1={818} x2={900} y2={880} show={s >= 4} />
        <VF_Edge x1={1140} y1={818} x2={1060} y2={880} show={s >= 4} />
      </Canvas>
      <VF_Node x={660} y={290} w={240} h={56} title="one input" show={s >= 1} />
      <VF_Node x={660} y={390} w={400} h={60} title="keyset version 02 or later?" show={s >= 1} dashed tone={c.clayHex} />
      <VF_Node x={360} y={510} w={440} h={76} title="pre-v3" value="random string or JSON secret" show={s >= 2} />
      <VF_Node x={960} y={510} w={440} h={76} title="v3" value="secret: a 33-byte point" show={s >= 3} tone={c.clayHex} />
      <VF_Node x={285} y={660} w={330} h={76} title="random string" value="bearer, no witness" show={s >= 2} delay={200} />
      <VF_Node x={620} y={660} w={280} h={76} title="P2PK or HTLC" value="NUT-11, NUT-14" show={s >= 2} delay={250} />
      <VF_Node x={480} y={810} w={330} h={76} title="optional SIG_ALL" value="same kind, data, tags" show={s >= 2} delay={400} />
      <VF_Node x={960} y={640} w={320} h={60} title="witness has a leaf?" show={s >= 3} dashed tone={c.clayHex} delay={200} />
      <VF_Node x={810} y={780} w={290} h={76} title="key path" value="one signature, x-only" show={s >= 3} delay={400} />
      <VF_Node x={1150} y={780} w={360} h={76} title="script path" value="leaf, control, signatures" show={s >= 3} delay={450} />
      <VF_Node
        x={980}
        y={912}
        w={560}
        h={60}
        title="signed message: this input's input digest"
        show={s >= 4}
        tone={c.clayHex}
        fill={c.claySoft}
      />
      <StepList>
        <StepItem n={1} step={s}>
          The keyset version picks the rules, never the secret's shape.
        </StepItem>
        <StepItem n={2} step={s}>
          Pre-v3: bearer by default; P2PK and HTLC by NUT-11 and NUT-14.
        </StepItem>
        <StepItem n={3} step={s}>
          v3: every secret is a point; the witness selects key or script path.
        </StepItem>
        <StepItem n={4} step={s}>
          Both v3 paths sign the same message: this input's digest.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>
          Each input takes its own branch, so keyset versions mix in one transaction.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VF_SG_W = [300, 420, 460, 500];
const VF_SgRow = ({
  a,
  b,
  c2,
  v,
  s,
  delay = 0,
}: {
  a: string;
  b: ReactNode;
  c2: ReactNode;
  v: ReactNode;
  s: number;
  delay?: number;
}) => {
  const W = VF_SG_W;
  const cell = (on: boolean, children: ReactNode, w: number, color?: string) => (
    <div style={{ opacity: on ? 1 : 0, transition: `opacity 450ms ${EASE_OUT} ${on ? delay : 0}ms` }}>
      <VF_TC w={w} color={color}>
        {children}
      </VF_TC>
    </div>
  );
  return (
    <VF_TR minH={64}>
      <VF_TC w={W[0]} color={c.muted}>
        {a}
      </VF_TC>
      {cell(s >= 1, b, W[1])}
      {cell(s >= 2, c2, W[2])}
      {cell(s >= 3, v, W[3])}
    </VF_TR>
  );
};

const VF_IsSigAll: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  const W = VF_SG_W;
  return (
    <VarShell of={VF_OF_IS} lens="Framing: comparison with SIG_ALL" title="SIG_INPUTS, SIG_ALL and the v3 rule" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VF_TR head>
          <VF_TC head w={W[0]}> </VF_TC>
          <VF_TC head w={W[1]}>SIG_INPUTS (NUT-11)</VF_TC>
          <VF_TC head w={W[2]}>SIG_ALL (NUT-11)</VF_TC>
          <VF_TC head w={W[3]} color={c.clayHex}>
            v3 (NUT-10)
          </VF_TC>
        </VF_TR>
        <VF_SgRow
          s={s}
          a="signed message"
          b="the proof's secret string"
          c2="inputs' secret and C, outputs' amount and B_, concatenated"
          v="this input's digest over the TLV transcript"
        />
        <VF_SgRow s={s} delay={40} a="witness on" b="each locked input" c2="the first input only" v="every v3 input" />
        <VF_SgRow s={s} delay={80} a="covers outputs" b="no" c2="yes" v="yes" />
        <VF_SgRow
          s={s}
          delay={120}
          a="different locks"
          b="allowed"
          c2="rejected: same kind, data, tags"
          v="allowed"
        />
        <VF_SgRow s={s} delay={160} a="unlocked inputs" b="allowed" c2="rejected" v="every input signs, locked or not" />
        <VF_SgRow s={s} delay={200} a="mint quotes" b="NUT-20, separate" c2="NUT-20, separate" v="an input of the same transaction" />
        <VF_SgRow s={s} delay={240} a="chosen" b="default flag" c2="per proof, at lock time" v="always" />
      </At>
      <At x={120} y={800} w={1680}>
        <Fade show={s >= 3} delay={300}>
          <Note>
            NUT-11's same-kind, same-flag, same-tags rule already keeps a <Code>SIG_ALL</Code> input out of any mixed
            transaction. v3 has no <Code>sigflag</Code>.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VF_IsMixed: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_IS} lens="Focus: mixed pre-v3 and v3 inputs" title="One transaction, two rule sets" proc={proc}>
      <At x={120} y={262} w={1220}>
        <div style={{ display: 'flex', alignItems: 'center', ...VF_enter(s >= 1, 0) }}>
          <VF_CChip t="01" bytes={145} w={210} />
          <VF_CChip t="01" bytes={90} w={190} />
          <VF_CChip t="03" bytes={94} w={170} />
          <VF_CChip t="03" bytes={94} w={170} />
          <span style={{ fontSize: 22, color: c.muted, marginLeft: 10 }}>
            423 B · <VF_Hex color={c.clayHex}>e8eb75f3f209bbf5…</VF_Hex>
          </span>
        </div>
        <div style={{ display: 'flex', fontSize: 21, color: c.muted, marginTop: 6, ...VF_enter(s >= 1, 100) }}>
          <span style={{ width: 218 }}>v3, 8 sat</span>
          <span style={{ width: 198 }}>pre-v3, 2 sat</span>
          <span style={{ width: 356 }}>outputs 8, 2 (v3 keyset)</span>
        </div>
      </At>
      <VF_Box x={120} y={380} w={590} h={250} title="v3 input" tone={c.clayHex} show={s >= 2}>
        <div style={{ fontSize: 22, lineHeight: 1.5, marginTop: 6 }}>
          <div>
            keyset <VF_Hex size={21}>02b7e077…0cf99f6</VF_Hex>
          </div>
          <div>
            secret: a point, <VF_Hex size={21}>02e6e7cf…</VF_Hex>
          </div>
          <div>
            <M>Y</M>: 48 B <VF_Hex size={21}>a0acf939…</VF_Hex>
          </div>
          <div>
            input digest <VF_Hex size={21} color={c.clayHex}>3f48aab72fb7ec0e…</VF_Hex>
          </div>
          <div>
            witness: BIP-340 <VF_Hex size={21}>4c4906b9…</VF_Hex> <VF_Ok />
          </div>
        </div>
      </VF_Box>
      <VF_Box x={750} y={380} w={590} h={250} title="pre-v3 input" tone={c.node} show={s >= 3}>
        <div style={{ fontSize: 22, lineHeight: 1.5, marginTop: 6 }}>
          <div>
            keyset <VF_Hex size={21}>00456a94ab4e1c46</VF_Hex> (v0, 8 raw bytes)
          </div>
          <div>
            secret: a random string, <VF_Hex size={21}>d341ee48…</VF_Hex>
          </div>
          <div>
            <M>Y</M>: 33 B <VF_Hex size={21}>029ef117…</VF_Hex>
          </div>
          <div>no input digest</div>
          <div>witness: its own NUT-11, or none</div>
        </div>
      </VF_Box>
      <VF_Box x={120} y={662} w={1220} show={s >= 4} tone={c.bad} fill={c.badSoft}>
        <div style={{ fontSize: 23, lineHeight: 1.45 }}>
          The v3 signature covers the pre-v3 container: this exact transaction cannot be rewritten. The pre-v3 proof
          itself is still unbound: whoever sees it can spend it in another transaction.
        </div>
      </VF_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Both proofs enter one transcript as container 01.
        </StepItem>
        <StepItem n={2} step={s}>
          Only the v3 input derives an input digest and signs it.
        </StepItem>
        <StepItem n={3} step={s}>
          The pre-v3 input keeps NUT-11 or bare rules.
        </StepItem>
        <StepItem n={4} step={s}>
          Its bytes are covered; the proof is not bound.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>
          The mixed-keyset vector: the migration path, old inputs to v3 outputs.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VF_IsReceiver: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_IS} lens="Perspective: receiver" title="Receiving an unlocked v3 token" proc={proc}>
      <At x={120} y={262} w={600}>
        <Fade show={s >= 1}>
          <VF_Lab>token entry, JSON form</VF_Lab>
          <pre
            style={{
              margin: '8px 0 0',
              fontFamily: MONO,
              fontSize: 22,
              lineHeight: 1.5,
              background: c.card,
              border: `1.5px solid ${c.rule}`,
              borderRadius: 12,
              padding: '12px 22px',
            }}
          >
            {'{\n  "amount": 8,\n  "id": "02b7e077…",\n  "secret": "02e6e7cf…8022a29b",\n  "C": "84d1b729…a9d03327",\n  "spend_info": {\n    "k": "47196dc0…1af70347"\n  }\n}'}
          </pre>
          <div style={{ fontSize: 22, color: c.muted, marginTop: 8 }}>No witness: tokens never carry one.</div>
        </Fade>
      </At>
      <VF_Box x={760} y={262} w={580} title="check 1 · reconstructs the secret" show={s >= 2} tone={s >= 2 ? c.good : c.rule}>
        <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 6 }}>
          No tree, so <M>k·G</M> must equal the secret:
          <br />
          <VF_Hex size={21}>02e6e7cf…8022a29b</VF_Hex> <VF_Ok />
        </div>
      </VF_Box>
      <VF_Box x={760} y={420} w={580} title="check 2 · the wallet can spend it" show={s >= 3} tone={s >= 3 ? c.good : c.rule}>
        <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 6 }}>
          It holds the key path, <M>k</M>. Recommended: check <M>C</M> by the pairing, no mint round-trip.
        </div>
      </VF_Box>
      <VF_Box x={760} y={578} w={580} title="sweep" show={s >= 4} tone={c.clayHex} fill={c.claySoft}>
        <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 6 }}>
          Swap to its own seed-derived secrets, signing with <M>k</M>. The sender holds the same scalar, and a bearer
          scalar can conceal a tweaked tree.
        </div>
      </VF_Box>
      <At x={120} y={780} w={1220}>
        <Fade show={s >= 4} delay={300}>
          <Note>
            In a V4 token, spend info is the CBOR map <Code>si</Code>, key <Code>k</Code>. <Code>k</Code> and{' '}
            <Code>E</Code> are mutually exclusive. A derived private key must not be re-gifted as a bearer{' '}
            <Code>k</Code>: sweep, then send.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The token carries the proof and the bearer key <M>k</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Check 1: <M>k·G</M> equals the secret.
        </StepItem>
        <StepItem n={3} step={s}>
          Check 2: the wallet holds the key path.
        </StepItem>
        <StepItem n={4} step={s}>
          Sweep at once: the sender still knows <M>k</M>.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>Values: the bearer V4 vector; k·G recomputed.</Note>
      </StepList>
    </VarShell>
  );
};

const VF_IsQuotes: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_IS} lens="Focus: paid mint quotes are inputs" title="A mint quote signs like a proof" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Fade show={s >= 1}>
          <pre
            style={{
              margin: 0,
              fontFamily: MONO,
              fontSize: 22,
              lineHeight: 1.5,
              background: c.card,
              border: `1.5px solid ${c.rule}`,
              borderRadius: 12,
              padding: '12px 22px',
            }}
          >
            <span style={{ color: c.dim }}>{'POST /v1/mint/{method}\n'}</span>
            {'{\n  "quote": "quote-mint-0004",\n  "outputs": [ { "amount": 4, "id": "02b7e0…", "B_": "b42a0b…" } ],\n'}
            <span style={{ background: s >= 1 ? c.claySoft : 'transparent' }}>{'  "signature": "1b6de2bf…ec46c5cc"'}</span>
            {'\n}'}
          </pre>
        </Fade>
      </At>
      <At x={120} y={530} w={1220}>
        <VF_Cap show={s >= 2}>Quote input container: 8 sat paid, 4 issued now</VF_Cap>
        <div style={{ display: 'flex' }}>
          <VF_Seg bytes="02" label="type" tone="type" show={s >= 2} />
          <VF_Seg bytes="0016" label="22" tone="len" show={s >= 2} delay={40} />
          <VF_Seg bytes="01 0001 04" label="amount issued: 4" show={s >= 2} hot={s === 2} delay={80} />
          <VF_Seg bytes="02 000f 71756f74652d6d696e742d30303034" label='"quote-mint-0004"' show={s >= 2} delay={120} />
        </div>
      </At>
      <At x={120} y={680} w={1220}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 22, lineHeight: 1.6 }}>
            <span style={{ color: c.muted }}>digest </span>
            <VF_Hex size={21}>e02e360bcd1f8350…</VF_Hex>
            <span style={{ color: c.muted }}> → input digest </span>
            <VF_Hex size={21} color={c.clayHex}>
              7578e345637e38e7…
            </VF_Hex>
            <br />
            <span style={{ color: c.muted }}>signed by the lock key </span>
            <VF_Hex size={21}>02929055…678d209812</VF_Hex> <VF_Ok />
          </div>
        </Fade>
      </At>
      <VF_Box x={120} y={790} w={1220} show={s >= 4} tone={c.bad} fill={c.badSoft}>
        <div style={{ fontSize: 23, lineHeight: 1.45 }}>
          Over a transcript that commits 8 instead of 4, the same signature fails <VF_Ok ok={false} />. Batched mint:
          one transcript, and each quote's lock key signs its own input digest.
        </div>
      </VF_Box>
      <StepList>
        <StepItem n={1} step={s}>
          The quote's witness travels in the request's <Code>signature</Code> field.
        </StepItem>
        <StepItem n={2} step={s}>
          The quote input commits the amount issued now, not the quote amount.
        </StepItem>
        <StepItem n={3} step={s}>
          The quote's lock key signs that input's digest.
        </StepItem>
        <StepItem n={4} step={s}>
          Another amount, another digest: the signature fails.
        </StepItem>
        <Note style={{ marginTop: 22, fontSize: 22 }}>
          The quote must carry <Code>pubkey</Code>: an unlocked quote cannot mint onto a v3 keyset.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Source 5 · Summary: Federation components
// ═════════════════════════════════════════════════════════════════════════════

const VF_SB_W = [70, 760, 850];
const VF_SbRow = ({ n, p, a, show }: { n: string; p: ReactNode; a: ReactNode; show: boolean }) => (
  <VF_TR show={show} minH={82}>
    <VF_TC w={VF_SB_W[0]} mono color={c.clayHex}>
      {n}
    </VF_TC>
    <VF_TC w={VF_SB_W[1]} size={25} color={c.muted}>
      {p}
    </VF_TC>
    <VF_TC w={VF_SB_W[2]} size={25}>
      {a}
    </VF_TC>
  </VF_TR>
);

const VF_SmBeginner: Page = () => {
  const proc = useProcess(7, 1400);
  const s = proc.step;
  const W = VF_SB_W;
  return (
    <VarShell of={VF_OF_SM} lens="Beginner" title="Federation components in plain terms" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VF_TR head>
          <VF_TC head w={W[0]}> </VF_TC>
          <VF_TC head w={W[1]}>Requirement</VF_TC>
          <VF_TC head w={W[2]}>How the federation meets it</VF_TC>
        </VF_TR>
        <VF_SbRow
          n="1"
          show={s >= 1}
          p="Anyone can check a token without the mint's private key."
          a="BLS signatures: a public-key check with a pairing."
        />
        <VF_SbRow
          n="2"
          show={s >= 2}
          p="No single member holds the signing key."
          a={
            <>
              Key shares: any <M>t</M> members' partial signatures combine in the wallet.
            </>
          }
        />
        <VF_SbRow
          n="3"
          show={s >= 3}
          p="Members never sign two conflicting requests."
          a="Members agree on one order (AlephBFT) before signing."
        />
        <VF_SbRow
          n="4"
          show={s >= 4}
          p="The wallet talks to all members, not to one."
          a="It sends each request to every member, checks each share, combines them."
        />
        <VF_SbRow
          n="5"
          show={s >= 5}
          p="No machine sees the whole key, even at setup."
          a="Distributed key generation (DKG)."
        />
        <VF_SbRow
          n="6"
          show={s >= 6}
          p="The bitcoin behind the tokens is not held by one operator."
          a={
            <>
              Threshold custody: <M>t</M> members sign treasury transactions (FROST).
            </>
          }
        />
        <VF_SbRow
          n="7"
          show={s >= 7}
          p="A member cannot redirect a user's spend."
          a="Every v3 input signs the whole transaction."
        />
      </At>
      <At x={120} y={900} w={1680}>
        <Note style={{ fontSize: 22 }}>Status: not production-ready. Review: cashubtc/cdk#2048.</Note>
      </At>
    </VarShell>
  );
};

const VF_SA2_W = [250, 330, 560, 540];
const VF_SmAdvanced: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  const W = VF_SA2_W;
  return (
    <VarShell of={VF_OF_SM} lens="Advanced" title="Thresholds and residual risk per component" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VF_TR head>
          <VF_TC head w={W[0]}>Component</VF_TC>
          <VF_TC head w={W[1]}>Parameter</VF_TC>
          <VF_TC head w={W[2]}>Mechanism</VF_TC>
          <VF_TC head w={W[3]}>Residual, as documented</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 1} minH={84}>
          <VF_TC w={W[0]} color={c.muted}>Issuance</VF_TC>
          <VF_TC w={W[1]}>
            <M>t</M> shares per signature
          </VF_TC>
          <VF_TC w={W[2]}>threshold BLS, wallet-side interpolation</VF_TC>
          <VF_TC w={W[3]}>
            <M>t ≤ c</M> is safe only because signing follows ordering
          </VF_TC>
        </VF_TR>
        <VF_TR show={s >= 1} delay={60} minH={84}>
          <VF_TC w={W[0]} color={c.muted}>Ordering</VF_TC>
          <VF_TC w={W[1]}>
            <M>c = n − ⌊(n − 1)/3⌋</M>
          </VF_TC>
          <VF_TC w={W[2]}>operation IDs, AlephBFT total order, conflicts rejected on apply</VF_TC>
          <VF_TC w={W[3]}>members behind the log fail closed, return no shares</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 2} minH={84}>
          <VF_TC w={W[0]} color={c.muted}>Payments</VF_TC>
          <VF_TC w={W[1]}>
            <M>q ≥ c</M> observations
          </VF_TC>
          <VF_TC w={W[2]}>independent observation; deposits also need confirmation depth</VF_TC>
          <VF_TC w={W[3]}>reorg after issuance: alarm, no unmint</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 2} delay={60} minH={84}>
          <VF_TC w={W[0]} color={c.muted}>Custody</VF_TC>
          <VF_TC w={W[1]}>
            <M>t</M> FROST signers, same roster
          </VF_TC>
          <VF_TC w={W[2]}>federated BDK and Bark treasuries</VF_TC>
          <VF_TC w={W[3]}>single-observation and fakewallet backends: test only</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 3} minH={84}>
          <VF_TC w={W[0]} color={c.muted}>Keys</VF_TC>
          <VF_TC w={W[1]}>two ceremonies, one roster</VF_TC>
          <VF_TC w={W[2]}>Pedersen DKG (BLS), FROST DKG (treasury)</VF_TC>
          <VF_TC w={W[3]}>a membership change is a new federation</VF_TC>
        </VF_TR>
        <VF_TR show={s >= 3} delay={60} minH={84} fill={c.badSoft}>
          <VF_TC w={W[0]} color={c.muted}>Client intent</VF_TC>
          <VF_TC w={W[1]}>the input's own key</VF_TC>
          <VF_TC w={W[2]}>v3: every input signs the TLV transcript</VF_TC>
          <VF_TC w={W[3]} color={c.bad}>
            pre-v3 bearer proofs: the receiving member is trusted
          </VF_TC>
        </VF_TR>
      </At>
      <At x={120} y={860} w={1680}>
        <Fade show={s >= 3} delay={300}>
          <Note>
            SEC-2026-07-17-01 is open on the branch; v3 transcripts are specified in cashubtc/nuts#443. Status: not
            production-ready.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VF_Tag = ({
  x,
  y,
  n,
  s,
  children,
}: {
  x: number;
  y: number;
  n: number;
  s: number;
  children: ReactNode;
}) => {
  const on = s === n;
  const seen = s >= n;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 14px',
        border: `1.5px solid ${on ? c.clayHex : c.rule}`,
        background: on ? c.claySoft : c.card,
        borderRadius: 999,
        fontSize: 22,
        whiteSpace: 'nowrap',
        opacity: seen ? 1 : 0.25,
        transition: `opacity 400ms ${EASE_OUT}, background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 21, color: c.clayHex }}>{n}</span>
      {children}
    </div>
  );
};

const VF_SmGraphical: Page = () => {
  const proc = useProcess(7, 1500);
  const s = proc.step;
  const w = { x: 250, y: 600 };
  const my = [330, 465, 600, 735, 870];
  const mx = 740;
  const cb = { x: 980, y: 530, w: 260, h: 140 };
  const tb = { x: 1440, y: 530, w: 300, h: 140 };
  return (
    <VarShell of={VF_OF_SM} lens="Graphical" title="Where each component sits" proc={proc}>
      <Canvas>
        <Line x1={w.x} y1={w.y} x2={mx} y2={my[0]} color={c.cool} opacity={0.5} />
        <Line x1={w.x} y1={w.y} x2={mx} y2={my[1]} color={c.cool} opacity={0.5} />
        <Line x1={w.x} y1={w.y} x2={mx} y2={my[2]} color={c.cool} opacity={0.5} />
        <Line x1={w.x} y1={w.y} x2={mx} y2={my[3]} color={c.cool} opacity={0.5} />
        <Line x1={w.x} y1={w.y} x2={mx} y2={my[4]} color={c.cool} opacity={0.5} />
        <Line x1={mx} y1={my[0]} x2={cb.x} y2={cb.y + 20} color={c.violet} opacity={0.5} />
        <Line x1={mx} y1={my[1]} x2={cb.x} y2={cb.y + 45} color={c.violet} opacity={0.5} />
        <Line x1={mx} y1={my[2]} x2={cb.x} y2={cb.y + 70} color={c.violet} opacity={0.5} />
        <Line x1={mx} y1={my[3]} x2={cb.x} y2={cb.y + 95} color={c.violet} opacity={0.5} />
        <Line x1={mx} y1={my[4]} x2={cb.x} y2={cb.y + 120} color={c.violet} opacity={0.5} />
        <Line x1={cb.x + cb.w} y1={cb.y + cb.h / 2} x2={tb.x} y2={tb.y + tb.h / 2} color={c.node} />
        <Packet x1={w.x} y1={w.y} x2={mx} y2={my[0]} run={proc.anim && s === 4} />
        <Packet x1={w.x} y1={w.y} x2={mx} y2={my[2]} run={proc.anim && s === 4} delay={60} />
        <Packet x1={w.x} y1={w.y} x2={mx} y2={my[4]} run={proc.anim && s === 4} delay={120} />
        <Packet x1={mx} y1={my[1]} x2={cb.x} y2={cb.y + 45} run={proc.anim && s === 3} color={c.violet} />
        <Packet x1={mx} y1={my[3]} x2={cb.x} y2={cb.y + 95} run={proc.anim && s === 3} color={c.violet} delay={80} />
        <rect x={cb.x} y={cb.y} width={cb.w} height={cb.h} rx={14} style={{ fill: c.panel, stroke: c.node, strokeWidth: 1.75 }} />
        <T x={cb.x + cb.w / 2} y={cb.y + cb.h / 2 + 10} size={28}>
          AlephBFT
        </T>
        <rect x={tb.x} y={tb.y} width={tb.w} height={tb.h} rx={14} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.75 }} />
        <T x={tb.x + tb.w / 2} y={tb.y + tb.h / 2 + 10} size={28}>
          treasury
        </T>
        <WalletNode x={w.x} y={w.y} r={60} />
        <Member x={mx} y={my[0]} label="m1" />
        <Member x={mx} y={my[1]} label="m2" />
        <Member x={mx} y={my[2]} label="m3" />
        <Member x={mx} y={my[3]} label="m4" />
        <Member x={mx} y={my[4]} label="m5" />
      </Canvas>
      <VF_Tag x={130} y={690} n={1} s={s}>
        pairing check
      </VF_Tag>
      <VF_Tag x={800} y={276} n={2} s={s}>
        key shares
      </VF_Tag>
      <VF_Tag x={980} y={470} n={3} s={s}>
        operation IDs, one order
      </VF_Tag>
      <VF_Tag x={130} y={460} n={4} s={s}>
        fan-out, aggregation
      </VF_Tag>
      <VF_Tag x={800} y={900} n={5} s={s}>
        DKG
      </VF_Tag>
      <VF_Tag x={1440} y={470} n={6} s={s}>
        FROST
      </VF_Tag>
      <VF_Tag x={130} y={750} n={7} s={s}>
        input witnesses
      </VF_Tag>
    </VarShell>
  );
};

const VF_AT_W = [520, 500, 660];
const VF_AtRow = ({ cap, eff, comp, show }: { cap: ReactNode; eff: ReactNode; comp: ReactNode; show: boolean }) => (
  <VF_TR show={show} minH={84}>
    <VF_TC w={VF_AT_W[0]}>{cap}</VF_TC>
    <VF_TC w={VF_AT_W[1]} color={c.bad}>
      {eff}
    </VF_TC>
    <VF_TC w={VF_AT_W[2]} color={c.good}>
      {comp}
    </VF_TC>
  </VF_TR>
);

const VF_SmByAttacker: Page = () => {
  const proc = useProcess(6, 1600);
  const s = proc.step;
  const W = VF_AT_W;
  return (
    <VarShell of={VF_OF_SM} lens="Framing: by attacker capability" title="Components by attacker capability" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VF_TR head>
          <VF_TC head w={W[0]}>Capability</VF_TC>
          <VF_TC head w={W[1]}>Without the component</VF_TC>
          <VF_TC head w={W[2]}>Component</VF_TC>
        </VF_TR>
        <VF_AtRow
          show={s >= 1}
          cap="one party holds the whole key"
          eff="it signs any output alone"
          comp="Shamir shares from a DKG; no machine sees the key"
        />
        <VF_AtRow
          show={s >= 2}
          cap="members sign on receipt; a client plays them against each other"
          eff="two output sets for one set of inputs"
          comp="operation IDs, AlephBFT order before signing"
        />
        <VF_AtRow
          show={s >= 3}
          cap="a member returns an invalid share"
          eff="the aggregate fails to verify"
          comp={
            <>
              wallet checks each share against <M>Kᵢ</M> and drops it
            </>
          }
        />
        <VF_AtRow
          show={s >= 4}
          cap="members go offline or withhold shares"
          eff="no signature"
          comp={
            <>
              any <M>t</M> responses suffice
            </>
          }
        />
        <VF_AtRow
          show={s >= 5}
          cap="one operator runs the funding backend"
          eff="it controls the funds, whatever members agree"
          comp={
            <>
              FROST treasury: <M>t</M> signers from the roster
            </>
          }
        />
        <VF_AtRow
          show={s >= 6}
          cap="one receiving member sees the proofs"
          eff="it rewrites the spend to its own outputs"
          comp="v3: every input signs the transcript"
        />
      </At>
      <At x={120} y={880} w={1680}>
        <Fade show={s >= 6} delay={300}>
          <Note style={{ fontSize: 22 }}>
            Code: <Code>nut01/bls.rs</Code>, <Code>federation/dkg.rs</Code>, <Code>cdk-axum/src/federation/</Code>,{' '}
            <Code>wallet/federation.rs</Code>, <Code>cdk-frost</Code>; spec: NUT-10 (cashubtc/nuts#443).
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VF_PartyCol = ({
  x,
  title,
  path,
  tone,
  show,
  children,
}: {
  x: number;
  title: string;
  path: ReactNode;
  tone: string;
  show: boolean;
  children: ReactNode;
}) => (
  <VF_Box x={x} y={262} w={540} h={470} title={title} tone={tone} show={show} dim={0.15} pad="18px 22px">
    <div style={{ fontFamily: MONO, fontSize: 21, color: c.muted, marginTop: 6 }}>{path}</div>
    <div style={{ marginTop: 6 }}>{children}</div>
  </VF_Box>
);

const VF_SmByParty: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_SM} lens="Perspective: by party" title="Components by party" proc={proc}>
      <VF_PartyCol x={120} title="wallet" path="cdk/src/wallet/federation.rs" tone={c.cool} show={s >= 1}>
        <VF_Li tone={c.cool}>sends each request to every member's public URL</VF_Li>
        <VF_Li tone={c.cool}>
          checks each share against the member's public share <M>Kᵢ</M>
        </VF_Li>
        <VF_Li tone={c.cool}>
          interpolates <M>t</M> shares: <Code>aggregate_blind_signature_shares</Code>
        </VF_Li>
        <VF_Li tone={c.cool}>
          unblinds, checks <M>C</M> against <M>K</M> with a pairing
        </VF_Li>
        <VF_Li tone={c.cool}>v3: signs each input's digest (NUT-10)</VF_Li>
      </VF_PartyCol>
      <VF_PartyCol x={690} title="member" path="cdk-axum/src/federation/" tone={c.clayHex} show={s >= 2}>
        <VF_Li>runs admission checks, submits an envelope</VF_Li>
        <VF_Li>applies operations in consensus order</VF_Li>
        <VF_Li>
          signs outputs of accepted operations with its share <M>kᵢ</M>: <Code>blind_sign_share</Code>
        </VF_Li>
        <VF_Li>
          takes part in the DKG: <Code>federation/dkg.rs</Code>
        </VF_Li>
        <VF_Li>holds a FROST share for the treasury</VF_Li>
      </VF_PartyCol>
      <VF_PartyCol x={1260} title="roster" path="private plane, /federation/v1" tone={c.violet} show={s >= 3}>
        <VF_Li tone={c.violet}>AlephBFT total order, journal catch-up</VF_Li>
        <VF_Li tone={c.violet}>
          thresholds: <M>t</M> signatures, <M>c</M> ordering, <M>q</M> payment observations
        </VF_Li>
        <VF_Li tone={c.violet}>
          FROST treasury, <Code>cdk-frost</Code>: BDK on-chain, Bark Lightning
        </VF_Li>
        <VF_Li tone={c.violet}>a membership change is a new federation</VF_Li>
      </VF_PartyCol>
      <At x={120} y={764} w={1680}>
        <Note style={{ fontSize: 22 }}>Paths on branch bls-federation; FROST crates on bls-federation-bdk-frost.</Note>
      </At>
    </VarShell>
  );
};

const VF_Layer = ({
  y,
  name,
  code,
  show,
  children,
}: {
  y: number;
  name: string;
  code: ReactNode;
  show: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      top: y,
      width: 1680,
      height: 108,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      border: `1.5px solid ${c.rule}`,
      background: c.card,
      borderRadius: 12,
      ...VF_enter(show, 0),
    }}
  >
    <div style={{ width: 250, padding: '0 24px', fontFamily: SERIF, fontSize: 30, boxSizing: 'border-box' }}>{name}</div>
    <div style={{ width: 930, display: 'flex', flexWrap: 'wrap', gap: 10, boxSizing: 'border-box', paddingRight: 20 }}>
      {children}
    </div>
    <div style={{ width: 500, padding: '0 24px', fontFamily: MONO, fontSize: 21, color: c.muted, boxSizing: 'border-box', lineHeight: 1.45 }}>
      {code}
    </div>
  </div>
);

const VF_Pill = ({ children, tone = c.rule }: { children: ReactNode; tone?: string }) => (
  <span
    style={{
      fontSize: 22,
      padding: '5px 14px',
      border: `1.5px solid ${tone}`,
      background: tone === c.rule ? c.panel : c.claySoft,
      borderRadius: 999,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const VF_SmByLayer: Page = () => {
  const proc = useProcess(5, 1800);
  const s = proc.step;
  return (
    <VarShell of={VF_OF_SM} lens="Explained via layers" title="Components by layer" proc={proc}>
      <VF_Layer y={262} name="Protocol" code="cashubtc/nuts#443, on #371" show={s >= 1}>
        <VF_Pill>keyset v3, BLS12-381</VF_Pill>
        <VF_Pill tone={c.clayHex}>NUT-10 transaction transcript</VF_Pill>
        <VF_Pill>NUT-03/04/05/29 v3 sections</VF_Pill>
      </VF_Layer>
      <VF_Layer
        y={386}
        name="Cryptography"
        code={
          <>
            nut01/bls.rs
            <br />
            federation/dkg.rs, cdk-frost
          </>
        }
        show={s >= 2}
      >
        <VF_Pill>pairing verification</VF_Pill>
        <VF_Pill>Shamir shares, interpolation</VF_Pill>
        <VF_Pill>Pedersen DKG</VF_Pill>
        <VF_Pill>FROST, BIP340</VF_Pill>
      </VF_Layer>
      <VF_Layer y={510} name="Ordering" code="cdk-axum/src/federation/" show={s >= 3}>
        <VF_Pill>operation IDs</VF_Pill>
        <VF_Pill>AlephBFT</VF_Pill>
        <VF_Pill>journal catch-up</VF_Pill>
        <VF_Pill>private plane</VF_Pill>
      </VF_Layer>
      <VF_Layer y={634} name="Wallet" code="cdk/src/wallet/federation.rs" show={s >= 4}>
        <VF_Pill>fan-out</VF_Pill>
        <VF_Pill>share checks</VF_Pill>
        <VF_Pill>aggregation</VF_Pill>
        <VF_Pill tone={c.clayHex}>v3 input witnesses</VF_Pill>
      </VF_Layer>
      <VF_Layer y={758} name="Custody" code="cdk-frost (bdk-frost branch)" show={s >= 5}>
        <VF_Pill>federated BDK, on-chain</VF_Pill>
        <VF_Pill>federated Bark, Lightning</VF_Pill>
        <VF_Pill>
          <M>t</M> FROST signers
        </VF_Pill>
      </VF_Layer>
      <At x={120} y={900} w={1680}>
        <Fade show={s >= 5} delay={300}>
          <Note style={{ fontSize: 22 }}>
            Two components change the protocol itself: keyset v3 for verification, and the transcript for client intent.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VF_Stage = ({
  i,
  s,
  title,
  who,
  tag,
  children,
}: {
  i: number;
  s: number;
  title: string;
  who: string;
  tag: string;
  children: ReactNode;
}) => {
  const n = i + 1;
  const on = s === n;
  const seen = s >= n;
  return (
    <div
      style={{
        position: 'absolute',
        left: 120 + i * 243,
        top: 372,
        width: 222,
        height: 290,
        boxSizing: 'border-box',
        border: `1.5px solid ${on ? c.clayHex : c.rule}`,
        background: seen ? c.card : c.panel,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        opacity: seen ? 1 : 0.35,
        transition: `opacity 400ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}>{title}</div>
      <div style={{ fontSize: 21, color: who === 'wallet' ? c.cool : c.muted, marginTop: 4 }}>{who}</div>
      <div style={{ fontSize: 22, lineHeight: 1.38, marginTop: 10, flex: 1 }}>{children}</div>
      <div
        style={{
          fontSize: 21,
          color: c.clayHex,
          borderTop: `1px solid ${c.rule}`,
          paddingTop: 8,
          lineHeight: 1.3,
        }}
      >
        {tag}
      </div>
    </div>
  );
};

const VF_SmLifecycle: Page = () => {
  const proc = useProcess(7, 1500);
  const s = proc.step;
  const cx = (i: number) => 120 + i * 243 + 111;
  return (
    <VarShell of={VF_OF_SM} lens="Worked example end to end" title="One swap through every component" proc={proc}>
      <Canvas>
        <line x1={cx(0)} y1={320} x2={cx(6)} y2={320} style={{ stroke: c.rule, strokeWidth: 2 }} />
        <rect
          x={cx(0)}
          y={318}
          width={cx(6) - cx(0)}
          height={4}
          style={{
            fill: c.clayHex,
            transformOrigin: `${cx(0)}px 320px`,
            transform: `scaleX(${Math.max(0, s - 1) / 6})`,
            transition: `transform ${REDUCED ? 0 : 700}ms ${EASE_IO}`,
          }}
        />
        <VF_RailDot x={cx(0)} on={s >= 1} />
        <VF_RailDot x={cx(1)} on={s >= 2} />
        <VF_RailDot x={cx(2)} on={s >= 3} />
        <VF_RailDot x={cx(3)} on={s >= 4} />
        <VF_RailDot x={cx(4)} on={s >= 5} />
        <VF_RailDot x={cx(5)} on={s >= 6} />
        <VF_RailDot x={cx(6)} on={s >= 7} />
      </Canvas>
      <VF_Stage i={0} s={s} title="Sign inputs" who="wallet" tag="client intent">
        each v3 input signs its input digest
      </VF_Stage>
      <VF_Stage i={1} s={s} title="Fan out" who="wallet" tag="wallet fan-out">
        the same request to every member
      </VF_Stage>
      <VF_Stage i={2} s={s} title="Admit" who="each member" tag="mix-and-match">
        admission checks; envelope and <Code>operation_id</Code>
      </VF_Stage>
      <VF_Stage i={3} s={s} title="Order" who="roster" tag="mix-and-match">
        AlephBFT; the first spend of the inputs wins
      </VF_Stage>
      <VF_Stage i={4} s={s} title="Apply, sign" who="each member" tag="split key, DKG">
        <M>C′ᵢ = kᵢ·B′</M> with its DKG share
      </VF_Stage>
      <VF_Stage i={5} s={s} title="Aggregate" who="wallet" tag="split signing key">
        check <M>t</M> shares, interpolate
      </VF_Stage>
      <VF_Stage i={6} s={s} title="Verify" who="wallet" tag="verification without k">
        unblind; pairing check against <M>K</M>
      </VF_Stage>
      <At x={120} y={700} w={1680}>
        <Fade show={s >= 7} delay={300}>
          <Note>
            Custody does not act in a swap: FROST signs treasury transactions for payments and withdrawals. Each tag
            is a row of the summary table.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VF_RailDot = ({ x, on }: { x: number; on: boolean }) => (
  <circle
    cx={x}
    cy={320}
    r={on ? 10 : 7}
    style={{ fill: on ? c.clayHex : c.card, stroke: on ? c.clayHex : c.node, strokeWidth: 2, transition: `all 300ms ${EASE_OUT}` }}
  />
);

// ─── Deck ────────────────────────────────────────────────────────────────────

const PAGES: [Page, string | undefined][] = [
  [VF_Cover, undefined],

  // 1.6 Proof rewriting by a Byzantine member
  [Rewrite, 'Original slide.'],
  [
    VF_RwBeginner,
    `Beginner. One proof, three members, toy amounts. A bearer proof is two values; whoever shows both can spend it. The fan-out hands those values to every member, so m3 can write its own swap, and the agreed order decides which swap spends P.`,
  ],
  [
    VF_RwAdvanced,
    `Advanced. Walk the swap pipeline row by row: every admission check, the envelope authorization and apply accept m3's swap. The only row that would catch it, an owner signature over the outputs, has nothing to check on a pre-v3 bearer proof. SIG_ALL on P2PK is the pre-v3 mitigation, and the branch does not require it.`,
  ],
  [
    VF_RwGraphical,
    `Graphical. Let the figure run: fan-out, m3's red envelope reaches AlephBFT first, #57 is applied, #58 is spent, and only X and Y get signed. Say little; point at the two log slots and the two coin pairs.`,
  ],
  [
    VF_RwSequence,
    `Explained via a sequence diagram. Time runs downward: the wallet's fan-out, m3's envelope, m1's envelope, then one order for all members. The wallet only sees the end: TokenAlreadySpent.`,
  ],
  [
    VF_RwHonest,
    `Perspective of an honest member. m1 sees two well-formed envelopes with identical inputs and different outputs, both authorized by roster members. Pre-v3 it has no field to tell them apart; with v3 inputs it recomputes each envelope's input digests and the copied witnesses fail.`,
  ],
  [
    VF_RwBeforeAfter,
    `Framing: before and after, from m3's side. Same fan-out, same rewrite attempt. Pre-v3 m3 holds the whole bearer proof; on a v3 keyset it holds the public secret, C and a witness bound to the owner's outputs, but not k.`,
  ],
  [
    VF_RwAuthz,
    `Framing: member authorization versus owner authorization. List what each artifact attests: the envelope names the submitter, the order names the first operation, the shares name the accepted outputs. The missing row is the owner's; v3 fills it with the input witnesses.`,
  ],

  // 1.6 v3 transaction transcript (NUT-10)
  [Transcript, 'Original slide.'],
  [
    VF_TrBeginner,
    `Beginner. Build the transcript from one record upward: type, length, value; minimal amounts, with zero as no bytes; one proof container; then the whole transcript and its hash. All values are the NUT-10 swap vector.`,
  ],
  [
    VF_TrAdvanced,
    `Advanced. The normative rules in three groups: structure, encoding, and what each quote container binds. Point out the MUST NOT on repeated Y or quote id, the rejection of non-minimal integers, and that the 0x05 container never appears in a transaction.`,
  ],
  [
    VF_TrGraphical,
    `Graphical. The 333-byte swap transcript drawn to scale, five pixels per byte. The proof container is mostly Y and C; the secret itself only enters as Y. Then one SHA-256.`,
  ],
  [
    VF_TrBytes,
    `Explained via bytes. The 145-byte proof container as a hex dump, one field per step, with offsets. The same bytes appear in the transcript and hash to the input id.`,
  ],
  [
    VF_TrOps,
    `Focus: every operation is a transaction. Swap, mint, batched mint, melt and melt with change are the same shape with different container types. Sizes and digests are from the NUT-10 vectors.`,
  ],
  [
    VF_TrMeltChange,
    `Focus: ordering and zero amounts. The request lists the quote first, but the transcript sorts by container type, so the blank outputs precede the melt quote. A zero amount is an empty value, which is why the blank's length is 90, not 91.`,
  ],
  [
    VF_TrBothSides,
    `Perspective: wallet and mint. The transcript is never sent; each side derives it from the request and gets the same 333 bytes. The wallet signs the input digest with k, the mint verifies against the secret's x-coordinate.`,
  ],
  [
    VF_TrSigAll,
    `Framing: comparison with the NUT-11 SIG_ALL message. SIG_ALL concatenates strings and covers only secrets, C, amounts, B_ and a melt quote id; the transcript is typed, length-prefixed, includes keyset ids and input amounts, and treats mint quotes as inputs.`,
  ],

  // 1.6 Per-input signing digest
  [InputDigest, 'Original slide.'],
  [
    VF_IdBeginner,
    `Beginner. Three hashes and a signature, one line each, with the swap vector values. Explain the tagged hash as SHA-256 with a fixed label in front, and that any change to the transaction changes lines 1, 3 and 4.`,
  ],
  [
    VF_IdAdvanced,
    `Advanced. Six properties of the construction: distinct messages per input, coverage of outputs, binding to one input even for 02 and 03 prefixed twins, one-wayness under disclosure, where tagging applies, and how pre-v3 inputs fit.`,
  ],
  [
    VF_IdGraphical,
    `Graphical, with the multi-input vector. One transaction digest fans into two input digests; each key signs its own. The crossed dashed lines at the end: neither signature transfers to the other input.`,
  ],
  [
    VF_IdBytes,
    `Explained via bytes. The exact 128-byte message: the tag hash twice, the transaction digest, the input id. Its SHA-256 is the input digest; the signature and the x-only check follow, all from the swap vector.`,
  ],
  [
    VF_IdVerifier,
    `Perspective of the mint verifying a request, as pseudocode. Build the transcript once, skip pre-v3 inputs to their own rules, derive one message per v3 input, check key path or script path, then the usual spent check. This is not CDK code.`,
  ],
  [
    VF_IdMatrix,
    `Focus: no cross-input replay. Two inputs share one transaction digest but sign different messages; the matrix shows each signature verifies only on its own diagonal. The 02 and 03 twin case is why this matters.`,
  ],
  [
    VF_IdCrossTx,
    `Framing: what a witness authorizes. The same proof in the swap, melt and melt with change vectors keeps its input id, but every transaction digest differs, so the swap's witness verifies only in the swap. That is why tokens drop witnesses.`,
  ],
  [
    VF_IdDisclosure,
    `Framing: the constraint that forces the design. If every input signed the transaction digest, a disclosed witness would publish that digest and one signature could serve several inputs. The per-input digest publishes one input only; NUT-07 fixes what the mint may reveal.`,
  ],

  // 1.6 Inputs sign, outputs never do
  [InputsSign, 'Original slide.'],
  [
    VF_IsBeginner,
    `Beginner. Inputs are where value comes from, outputs where it goes. Each input signs with its own key; outputs have no key and need none, because every input already signs a digest that covers them.`,
  ],
  [
    VF_IsAdvanced,
    `Advanced. The witness rules for proof inputs and mint quote inputs, and the rules around them: no sigflag, pre-v3 inputs unchanged, no witnesses in tokens, the 4096-character bound.`,
  ],
  [
    VF_IsGraphical,
    `Graphical. Two proofs and three blinded messages feed one transcript; each input gets its own digest and signs it with its key. The outputs stay keyless.`,
  ],
  [
    VF_IsDecision,
    `Explained via a decision tree. The keyset version selects the rules; pre-v3 keeps bearer, P2PK and HTLC; v3 splits into key path or script path, and both sign the input's digest. Each input takes its own branch, so versions mix.`,
  ],
  [
    VF_IsSigAll,
    `Framing: comparison with SIG_ALL. Reveal the columns left to right: SIG_INPUTS signs only the secret, SIG_ALL covers outputs but forces identical locks and one witness, v3 covers outputs with a witness on every input and no restriction on locks.`,
  ],
  [
    VF_IsMixed,
    `Focus: mixed pre-v3 and v3 inputs, from the mixed-keyset vector. Both proofs are in one transcript; only the v3 input signs a digest. The pre-v3 bytes are covered, but that proof remains unbound on its own.`,
  ],
  [
    VF_IsReceiver,
    `Perspective of the receiver of an unlocked v3 token. The bearer key k travels in spend info; check that k·G is the secret, check the key path, then sweep, because the sender still knows k and a bearer scalar can conceal a tree.`,
  ],
  [
    VF_IsQuotes,
    `Focus: paid mint quotes are inputs. The partial-mint vector: the quote container commits the 4 issued, not the 8 paid; the lock key signs that input's digest, and the same signature fails over a transcript committing 8.`,
  ],

  // Summary
  [Summary, 'Original slide.'],
  [
    VF_SmBeginner,
    `Beginner. Each row of the summary as a requirement and the component that meets it, without jargon. Go row by row.`,
  ],
  [
    VF_SmAdvanced,
    `Advanced. The same components with their parameters and the residual risks the notes document: t below c only because signing follows ordering, lagging members fail closed, reorg after issuance, test-only backends, and the open client-intent item for pre-v3 proofs.`,
  ],
  [
    VF_SmGraphical,
    `Graphical. One figure of wallet, five members, AlephBFT and the treasury; the numbered tags light up one component at a time where it lives.`,
  ],
  [
    VF_SmByAttacker,
    `Framing: by attacker capability. Each row is a capability, what it achieves without the component, and the component that stops it. The last row is the subject of this section.`,
  ],
  [
    VF_SmByParty,
    `Perspective: by party. What the wallet, each member, and the roster as a whole do, with the code paths on the branch.`,
  ],
  [
    VF_SmByLayer,
    `Explained via layers: protocol, cryptography, ordering, wallet, custody. Client intent is the only item that changes the protocol layer.`,
  ],
  [
    VF_SmLifecycle,
    `Worked example end to end. Follow one swap through seven stages; each stage is tagged with the summary row it exercises. Custody is the one component a swap does not touch.`,
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · Client intent and the transaction transcript (temporary)',
  createdAt: '2026-09-28T09:05:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
