import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  Arrow,
  At,
  Band,
  Bdhke,
  BlsFlow,
  c,
  Canvas,
  Dot,
  EASE_IO,
  EASE_OUT,
  Fade,
  GFade,
  Hi,
  Keysets,
  Lifeline,
  M,
  Member,
  Model,
  MONO,
  Note,
  Packet,
  Pairing,
  REDUCED,
  ring,
  StepItem,
  StepList,
  T,
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

// ─── Local helpers (prefix VA_) ──────────────────────────────────────────────

const VA_enter = (show: boolean, delay = 0, dy = 8): CSSProperties => ({
  opacity: show ? 1 : 0,
  transform: show || REDUCED ? 'translateY(0px)' : `translateY(${dy}px)`,
  transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}, color 300ms ${EASE_OUT}`,
});

const VA_Label = ({
  children,
  color = c.muted,
  style,
  plain = false,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
  plain?: boolean;
}) => (
  <div
    style={{
      fontSize: plain ? 23 : 21,
      letterSpacing: plain ? '0.01em' : '0.08em',
      textTransform: plain ? 'none' : 'uppercase',
      color,
      transition: `color 300ms ${EASE_OUT}`,
      ...style,
    }}
  >
    {children}
  </div>
);

const VA_Mono = ({ children, size = 21, color }: { children: ReactNode; size?: number; color?: string }) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: size,
      color,
      textTransform: 'none',
      letterSpacing: 'normal',
      transition: `color 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </span>
);

const VA_Box = ({
  x,
  y,
  w,
  h,
  title,
  titleColor,
  tone = c.rule,
  fill = c.card,
  show = true,
  delay = 0,
  dashed = false,
  size = 23,
  pad = '16px 22px',
  plainTitle = false,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  title?: ReactNode;
  titleColor?: string;
  tone?: string;
  fill?: string;
  show?: boolean;
  delay?: number;
  dashed?: boolean;
  size?: number;
  pad?: string;
  plainTitle?: boolean;
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
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${tone}`,
      background: fill,
      borderRadius: 12,
      padding: pad,
      fontSize: size,
      lineHeight: 1.42,
      ...VA_enter(show, delay),
    }}
  >
    {title && (
      <VA_Label color={titleColor ?? (tone === c.rule ? c.muted : tone)} style={{ marginBottom: 10 }} plain={plainTitle}>
        {title}
      </VA_Label>
    )}
    {children}
  </div>
);

const VA_Li = ({ children, color = c.clayHex, gap = 8 }: { children: ReactNode; color?: string; gap?: number }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: gap }}>
    <span style={{ color, fontFamily: MONO, flexShrink: 0 }}>–</span>
    <span>{children}</span>
  </div>
);

const VA_TR = ({
  children,
  show = true,
  h = 64,
  head = false,
  hot = false,
  delay = 0,
}: {
  children: ReactNode;
  show?: boolean;
  h?: number;
  head?: boolean;
  hot?: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: h,
      borderBottom: `1px solid ${head ? c.line : c.rule}`,
      ...VA_enter(show, delay, 6),
      background: hot ? c.claySoft : 'transparent',
    }}
  >
    {children}
  </div>
);

const VA_TD = ({
  w,
  children,
  head = false,
  color,
  size = 23,
}: {
  w: number;
  children?: ReactNode;
  head?: boolean;
  color?: string;
  size?: number;
}) => (
  <div
    style={{
      width: w,
      flexShrink: 0,
      boxSizing: 'border-box',
      padding: '0 16px',
      fontSize: head ? 21 : size,
      letterSpacing: head ? '0.08em' : undefined,
      textTransform: head ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
      lineHeight: 1.35,
      transition: `color 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

/** One line of code, 21 px, highlighted when `on`. */
const VA_CL = ({ on = false, children }: { on?: boolean; children?: ReactNode }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 21,
      lineHeight: 1.7,
      minHeight: 36,
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
const VA_Cm = ({ children }: { children: ReactNode }) => <span style={{ color: c.muted }}>{children}</span>;

const VA_CodeBox = ({ children }: { children: ReactNode }) => (
  <div style={{ background: c.card, border: `1.5px solid ${c.rule}`, borderRadius: 12, padding: '14px 24px' }}>
    {children}
  </div>
);

/** A byte segment with a caption underneath (21 px). */
const VA_Seg = ({
  bytes,
  label,
  tone = 'field',
  show = true,
  delay = 0,
}: {
  bytes: ReactNode;
  label?: ReactNode;
  tone?: 'type' | 'len' | 'field' | 'hash';
  show?: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: 10,
      verticalAlign: 'top',
      ...VA_enter(show, delay, 6),
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 21,
        padding: '5px 12px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${tone === 'type' ? c.clayHex : tone === 'hash' ? c.cool : c.rule}`,
        background: tone === 'type' ? c.claySoft : tone === 'len' ? c.panel : tone === 'hash' ? c.coolSoft : c.card,
        color: tone === 'len' ? c.muted : c.ink,
      }}
    >
      {bytes}
    </span>
    {label && <span style={{ fontSize: 21, color: c.muted, marginTop: 4, whiteSpace: 'nowrap' }}>{label}</span>}
  </div>
);

const VA_Ok = ({ ok = true }: { ok?: boolean }) => (
  <span style={{ color: ok ? c.good : c.bad, fontFamily: MONO, fontStyle: 'normal' }}>{ok ? '✓' : '✗'}</span>
);

// ─── Cover ───────────────────────────────────────────────────────────────────

const VA_Cover: Page = () => (
  <VarCover
    section="1.1"
    title="BLS blind signatures"
    sources={[
      { n: '—', title: 'System model', count: 7 },
      { n: '1.1', title: 'Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)', count: 7 },
      { n: '1.1', title: 'Blind BLS signatures on BLS12-381 (keyset v3)', count: 7 },
      { n: '1.1', title: 'Pairing check, expanded', count: 7 },
      { n: '1.1', title: 'Keyset versions', count: 7 },
    ]}
  />
);

// ═════════════════════════════════════════════════════════════════════════════
// Setting · System model
// ═════════════════════════════════════════════════════════════════════════════

const VA_OF_MODEL = 'Setting · System model';

// ─── Beginner: the thresholds for n = 5 ─────────────────────────────────────

const VA_MRow = ({ y, tones, show }: { y: number; tones: Tone[]; show: boolean }) => (
  <GFade show={show}>
    <Member x={470} y={y} r={32} label="m1" tone={tones[0]} />
    <Member x={560} y={y} r={32} label="m2" tone={tones[1]} />
    <Member x={650} y={y} r={32} label="m3" tone={tones[2]} />
    <Member x={740} y={y} r={32} label="m4" tone={tones[3]} />
    <Member x={830} y={y} r={32} label="m5" tone={tones[4]} />
  </GFade>
);

const VA_NumRow = ({
  y,
  n,
  step,
  sym,
  children,
}: {
  y: number;
  n: number;
  step: number;
  sym: ReactNode;
  children: ReactNode;
}) => (
  <>
    <At x={120} y={y - 40} w={300} style={{ height: 80, display: 'flex', alignItems: 'center' }}>
      <Fade show={step >= n}>
        <M size={44} color={step === n ? c.clayHex : c.ink}>
          {sym}
        </M>
      </Fade>
    </At>
    <At x={910} y={y - 40} w={890} style={{ height: 80, display: 'flex', alignItems: 'center' }}>
      <Fade show={step >= n} delay={60}>
        <div
          style={{
            fontSize: 26,
            lineHeight: 1.38,
            color: step === n ? c.ink : c.muted,
            transition: `color 300ms ${EASE_OUT}`,
          }}
        >
          {children}
        </div>
      </Fade>
    </At>
  </>
);

const VA_ModelBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_MODEL} lens="Beginner" title="The thresholds for n = 5" proc={proc}>
      <Canvas>
        <VA_MRow y={320} tones={['idle', 'idle', 'idle', 'idle', 'idle']} show={s >= 1} />
        <VA_MRow y={440} tones={['idle', 'idle', 'idle', 'idle', 'bad']} show={s >= 2} />
        <VA_MRow y={560} tones={['on', 'on', 'on', 'on', 'idle']} show={s >= 3} />
        <VA_MRow y={680} tones={['on', 'idle', 'on', 'on', 'idle']} show={s >= 4} />
        <VA_MRow y={800} tones={['good', 'good', 'good', 'good', 'idle']} show={s >= 5} />
      </Canvas>
      <VA_NumRow y={320} n={1} step={s} sym="n = 5">
        members in a fixed roster, m1 to m5. Each holds a share of the signing key for every amount.
      </VA_NumRow>
      <VA_NumRow y={440} n={2} step={s} sym="f = 1">
        members that may be Byzantine: <M>f = ⌊(n − 1)/3⌋ = ⌊4/3⌋ = 1</M>.
      </VA_NumRow>
      <VA_NumRow y={560} n={3} step={s} sym="c = 4">
        members needed to commit an operation to the shared order: <M>c = n − f = 4</M>.
      </VA_NumRow>
      <VA_NumRow y={680} n={4} step={s} sym="t = 3">
        shares needed for one signature. Any 3 members give the same result. Allowed range: <M>f + 1 ≤ t ≤ c</M>.
      </VA_NumRow>
      <VA_NumRow y={800} n={5} step={s} sym="q = 4">
        matching payment observations before a quote counts as paid. <M>q</M> is at least <M>c</M>.
      </VA_NumRow>
      <At x={120} y={880} w={1680}>
        <Fade show={s >= 2}>
          <Note>Byzantine: a member that deviates arbitrarily from the protocol, including sending conflicting messages.</Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Advanced: validation rules ─────────────────────────────────────────────

const VA_Rule = ({ y, show, on, path, children }: { y: number; show: boolean; on: boolean; path: string; children: ReactNode }) => (
  <At x={120} y={y} w={920}>
    <Fade show={show}>
      <div style={{ borderLeft: `3px solid ${on ? c.clayHex : c.rule}`, paddingLeft: 20, transition: `border-color 300ms ${EASE_OUT}` }}>
        <VA_Mono color={on ? c.clayHex : c.muted}>{path}</VA_Mono>
        <div style={{ marginTop: 6 }}>{children}</div>
      </div>
    </Fade>
  </At>
);

const VA_QHead = ({ children, w }: { children: ReactNode; w: number }) => (
  <VA_TD w={w} color={c.muted}>
    <M size={26}>{children}</M>
  </VA_TD>
);

const VA_QRow = ({ n, f, cc, t, q, hot, qOn }: { n: string; f: string; cc: string; t: string; q: string; hot: boolean; qOn: boolean }) => (
  <VA_TR h={60} hot={hot}>
    <VA_TD w={110}>
      <M>{n}</M>
    </VA_TD>
    <VA_TD w={110}>
      <M>{f}</M>
    </VA_TD>
    <VA_TD w={110}>
      <M>{cc}</M>
    </VA_TD>
    <VA_TD w={200}>
      <M>{t}</M>
    </VA_TD>
    <VA_TD w={190} color={qOn ? c.ink : c.dim}>
      <M>{q}</M>
    </VA_TD>
  </VA_TR>
);

const VA_ModelAdvanced: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_MODEL} lens="Advanced" title="Threshold parameters: validation rules" proc={proc}>
      <VA_Rule y={262} show={s >= 1} on={s === 1} path="ThresholdParams::validate">
        <M size={32}>n ≥ 2,&nbsp;&nbsp;1 ≤ t ≤ c ≤ n</M>
        <div style={{ fontSize: 23, color: c.muted, marginTop: 4 }}>Structural. Every configuration passes it.</div>
      </VA_Rule>
      <VA_Rule y={400} show={s >= 2} on={s === 2} path="ThresholdParams::validate_bft_safety">
        <M size={32}>f = ⌊(n − 1)/3⌋,&nbsp;&nbsp;t ≥ f + 1,&nbsp;&nbsp;c ≥ n − f</M>
        <div style={{ fontSize: 23, color: c.muted, marginTop: 4 }}>
          Production members and wallet imports. <VA_Mono>with_bft_consensus</VA_Mono> sets <M>c = n − f</M>.
        </div>
      </VA_Rule>
      <VA_Rule y={538} show={s >= 3} on={s === 3} path="FederationPaymentVerificationPolicy::validate">
        <M size={32}>
          <Up>MemberQuorum</Up>: c ≤ q ≤ n
        </M>
        <div style={{ fontSize: 23, color: c.muted, marginTop: 4 }}>
          <VA_Mono>DevelopmentSingleObservation</VA_Mono> (<M>q = 1</M>) exists for tests only.
        </div>
      </VA_Rule>
      <VA_Rule y={676} show={s >= 4} on={s === 4} path="consequences">
        <div style={{ fontSize: 23, lineHeight: 1.42 }}>
          <VA_Li>
            Two sets of <M>c</M> members share at least <M>2c − n = n − 2f ≥ f + 1</M> members: one of them is honest.
          </VA_Li>
          <VA_Li>
            <M>f</M> Byzantine members hold <M>f &lt; t</M> shares: no signature without an honest member.
          </VA_Li>
          <VA_Li>
            <M>t ≤ c</M>: every set that can commit an operation can also sign it.
          </VA_Li>
        </div>
      </VA_Rule>
      <At x={120} y={928} w={920}>
        <Fade show={s >= 1}>
          <VA_Mono color={c.muted}>crates/cdk-common/src/federation/config.rs</VA_Mono>
        </Fade>
      </At>
      <At x={1080} y={262} w={720}>
        <Fade show={s >= 2}>
          <VA_TR head h={52}>
            <VA_QHead w={110}>n</VA_QHead>
            <VA_QHead w={110}>f</VA_QHead>
            <VA_QHead w={110}>c</VA_QHead>
            <VA_QHead w={200}>t</VA_QHead>
            <VA_QHead w={190}>q</VA_QHead>
          </VA_TR>
          <VA_QRow n="4" f="1" cc="3" t="2 … 3" q="3 … 4" hot={false} qOn={s >= 3} />
          <VA_QRow n="5" f="1" cc="4" t="2 … 4" q="4 … 5" hot qOn={s >= 3} />
          <VA_QRow n="7" f="2" cc="5" t="3 … 5" q="5 … 7" hot={false} qOn={s >= 3} />
          <VA_QRow n="10" f="3" cc="7" t="4 … 7" q="7 … 10" hot={false} qOn={s >= 3} />
          <div style={{ marginTop: 18 }}>
            <Note>
              The deck uses <M>n = 5</M>, <M>t = 3</M>, <M>c = 4</M>.
            </Note>
          </div>
        </Fade>
      </At>
      <Canvas>
        <GFade show={s >= 4}>
          <path d="M 1170 762 L 1170 748 L 1590 748 L 1590 762" style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 2 }} />
          <path d="M 1290 838 L 1290 852 L 1710 852 L 1710 838" style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 2 }} />
          <T x={1380} y={734} size={26} font="math" color={c.clayHex}>
            c = 4
          </T>
          <T x={1500} y={884} size={26} font="math" color={c.clayHex}>
            c = 4
          </T>
          <Member x={1200} y={800} r={26} label="m1" />
          <Member x={1320} y={800} r={26} label="m2" tone="on" />
          <Member x={1440} y={800} r={26} label="m3" tone="on" />
          <Member x={1560} y={800} r={26} label="m4" tone="on" />
          <Member x={1680} y={800} r={26} label="m5" />
        </GFade>
      </Canvas>
      <At x={1080} y={900} w={720}>
        <Fade show={s >= 4} delay={200}>
          <div style={{ textAlign: 'center' }}>
            <M size={26}>
              <Up>overlap</Up> 2c − n = 3 ≥ f + 1 = 2
            </M>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Graphical: two planes ──────────────────────────────────────────────────

const VA_RC = { x: 860, y: 600 };
const VA_RP = [0, 1, 2, 3, 4].map((i) => ring(VA_RC.x, VA_RC.y, 220, i));
const VA_PAIRS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 3],
  [2, 4],
  [3, 4],
];
const VA_WAL = { x: 260, y: 600 };

const VA_LogRow = ({ y, show = true, hot = false, label }: { y: number; show?: boolean; hot?: boolean; label?: string }) => (
  <GFade show={show}>
    <rect
      x={1400}
      y={y}
      width={320}
      height={50}
      rx={8}
      style={{ fill: hot ? c.claySoft : c.panel, stroke: hot ? c.clayHex : c.rule, strokeWidth: 1.5 }}
    />
    {label && (
      <T x={1560} y={y + 33} size={22} color={c.clayHex}>
        {label}
      </T>
    )}
  </GFade>
);

const VA_ModelGraphical: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  const run = proc.anim;
  const P = VA_RP;
  return (
    <VarShell of={VA_OF_MODEL} lens="Graphical" title="Two planes" proc={proc}>
      <Canvas>
        {VA_PAIRS.map(([i, j], k) => (
          <GFade key={`e${i}${j}`} show={s >= 1} delay={k * 30}>
            <line x1={P[i].x} y1={P[i].y} x2={P[j].x} y2={P[j].y} style={{ stroke: c.node, strokeWidth: 1.5, opacity: 0.6 }} />
          </GFade>
        ))}
        {P.map((p, i) => (
          <g key={`w${i}`}>
            <GFade show={s >= 2} delay={i * 40}>
              <line x1={VA_WAL.x} y1={VA_WAL.y} x2={p.x} y2={p.y} style={{ stroke: c.cool, strokeWidth: 1.75, opacity: 0.45 }} />
            </GFade>
            <Packet x1={VA_WAL.x} y1={VA_WAL.y} x2={p.x} y2={p.y} run={run && s === 2} delay={200 + i * 60} />
            <Packet
              x1={p.x}
              y1={p.y}
              x2={P[(i + 1) % 5].x}
              y2={P[(i + 1) % 5].y}
              run={run && s === 3}
              color={c.clayHex}
              r={6}
              delay={i * 70}
              dur={700}
            />
            <Packet
              x1={p.x}
              y1={p.y}
              x2={P[(i + 2) % 5].x}
              y2={P[(i + 2) % 5].y}
              run={run && s === 3}
              color={c.clayHex}
              r={6}
              delay={500 + i * 70}
              dur={700}
            />
          </g>
        ))}
        <Packet x1={VA_RC.x} y1={VA_RC.y} x2={1560} y2={577} run={run && s === 4} color={c.clayHex} dur={1000} />
        <Packet x1={P[0].x} y1={P[0].y} x2={VA_WAL.x} y2={VA_WAL.y} run={run && s === 5} color={c.clayHex} />
        <Packet x1={P[2].x} y1={P[2].y} x2={VA_WAL.x} y2={VA_WAL.y} run={run && s === 5} color={c.clayHex} delay={80} />
        <Packet x1={P[3].x} y1={P[3].y} x2={VA_WAL.x} y2={VA_WAL.y} run={run && s === 5} color={c.clayHex} delay={160} />
        <T x={VA_RC.x} y={VA_RC.y + 8} size={24} color={c.muted} show={s >= 3}>
          AlephBFT
        </T>
        {P.map((p, i) => (
          <g key={`m${i}`} style={{ opacity: s >= 1 ? 1 : 0, transition: `opacity 450ms ${EASE_OUT} ${i * 40}ms` }}>
            <Member x={p.x} y={p.y} r={46} label={`m${i + 1}`} tone={s >= 5 && [0, 2, 3].includes(i) ? 'on' : 'idle'} />
          </g>
        ))}
        <T x={VA_RC.x} y={890} size={24} color={c.muted} show={s >= 1}>
          private plane
        </T>
        <GFade show={s >= 2}>
          <WalletNode x={VA_WAL.x} y={VA_WAL.y} r={60} />
        </GFade>
        <T x={430} y={440} size={24} color={c.cool} show={s >= 2}>
          public plane
        </T>
        <T x={1560} y={335} size={24} color={c.muted} show={s >= 3}>
          order
        </T>
        <VA_LogRow y={360} show={s >= 3} />
        <VA_LogRow y={424} show={s >= 3} />
        <VA_LogRow y={488} show={s >= 3} />
        <VA_LogRow y={552} show={s >= 4} hot label="swap" />
        <T x={VA_WAL.x} y={710} size={24} color={c.clayHex} show={s >= 5}>
          t = 3 shares
        </T>
        <GFade show={s >= 6}>
          <circle cx={VA_WAL.x} cy={VA_WAL.y} r={72} style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 2 }} />
        </GFade>
        <T x={VA_WAL.x} y={770} size={32} font="math" show={s >= 6}>
          C′ = Σ λᵢ·C′ᵢ
        </T>
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via sequence diagram ─────────────────────────────────────────

const VA_SX = { w: 210, m1: 520, m2: 690, m3: 860, m4: 1030, m5: 1200 };

const VA_ModelSequence: Page = () => {
  const proc = useProcess(6);
  const s = proc.step;
  const run = proc.anim;
  const X = VA_SX;
  return (
    <VarShell of={VA_OF_MODEL} lens="Explained via sequence diagram" title="One request, from fan-out to aggregation" proc={proc}>
      <Canvas>
        <Lifeline x={X.w} label="wallet" color={c.cool} />
        <Lifeline x={X.m1} label="m1" />
        <Lifeline x={X.m2} label="m2" color={s >= 5 ? c.dim : c.ink} />
        <Lifeline x={X.m3} label="m3" />
        <Lifeline x={X.m4} label="m4" />
        <Lifeline x={X.m5} label="m5" color={s >= 5 ? c.dim : c.ink} />
        <Arrow x1={X.w} y1={330} x2={X.m5} y2={330} show={s >= 1} color={c.cool} font="sans" label="same request to every public URL" />
        <Dot x={X.m1} y={330} r={7} color={c.cool} show={s >= 1} delay={500} />
        <Dot x={X.m2} y={330} r={7} color={c.cool} show={s >= 1} delay={550} />
        <Dot x={X.m3} y={330} r={7} color={c.cool} show={s >= 1} delay={600} />
        <Dot x={X.m4} y={330} r={7} color={c.cool} show={s >= 1} delay={650} />
        <Packet x1={X.w} y1={330} x2={X.m1} y2={330} run={run && s === 1} delay={200} />
        <Packet x1={X.w} y1={330} x2={X.m3} y2={330} run={run && s === 1} delay={260} />
        <Packet x1={X.w} y1={330} x2={X.m5} y2={330} run={run && s === 1} delay={320} />
        <Band x1={470} x2={1250} y={420} label="each member submits an envelope to consensus" show={s >= 2} />
        <Band x1={470} x2={1250} y={500} label="AlephBFT: one total order, accepted" show={s >= 3} tone="clay" />
        <Band x1={470} x2={1250} y={580} label="apply: verify inputs, mark them spent" show={s >= 4} />
        <Arrow x1={X.m1} y1={680} x2={X.w} y2={680} show={s >= 5} color={c.clayHex} label="C′₁" labelDy={-10} />
        <Arrow x1={X.m3} y1={735} x2={X.w} y2={735} show={s >= 5} color={c.clayHex} label="C′₃" labelDy={-10} delay={120} />
        <Arrow x1={X.m4} y1={790} x2={X.w} y2={790} show={s >= 5} color={c.clayHex} label="C′₄" labelDy={-10} delay={240} />
        <Packet x1={X.m1} y1={680} x2={X.w} y2={680} run={run && s === 5} color={c.clayHex} delay={200} />
        <Packet x1={X.m4} y1={790} x2={X.w} y2={790} run={run && s === 5} color={c.clayHex} delay={320} />
        <Dot x={X.w} y={858} r={9} color={c.clayHex} show={s >= 6} ring />
        <T x={X.w + 36} y={866} size={24} anchor="start" show={s >= 6}>
          check each C′ᵢ with Kᵢ, interpolate t = 3
        </T>
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet sends the same request to every member.
        </StepItem>
        <StepItem n={2} step={s}>
          Each member wraps it in an envelope and submits it.
        </StepItem>
        <StepItem n={3} step={s}>
          AlephBFT orders it. All members see the same order.
        </StepItem>
        <StepItem n={4} step={s}>
          Each member applies the accepted operation.
        </StepItem>
        <StepItem n={5} step={s}>
          Members return <M>C′ᵢ = kᵢ·B′</M>. m2 and m5 are slow; they are not needed.
        </StepItem>
        <StepItem n={6} step={s}>
          The wallet checks each share and interpolates after <M>t = 3</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: federation member ─────────────────────────────────────────

const VA_ModelMember: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const tone = (i: number) => (s === i ? c.clayHex : c.rule);
  return (
    <VarShell of={VA_OF_MODEL} lens="Perspective: federation member" title="What one member holds and does" proc={proc}>
      <VA_Box x={120} y={262} w={820} h={320} title="Holds" tone={tone(1)} titleColor={s === 1 ? c.clayHex : c.muted} show={s >= 1}>
        <VA_Li>
          a BLS share <M>kᵢ</M> for every amount; its public share <M>Kᵢ = kᵢ·G₂</M> is in the public config
        </VA_Li>
        <VA_Li>a secp256k1 identity key that authenticates its messages to other members</VA_Li>
        <VA_Li>
          the public config: roster, <M>n, t, c</M>, aggregate keys <M>K</M>
        </VA_Li>
      </VA_Box>
      <VA_Box x={980} y={262} w={820} h={320} title="Exposes" tone={tone(2)} titleColor={s === 2 ? c.clayHex : c.muted} show={s >= 2}>
        <VA_Li>
          <VA_Mono>public_mint_url</VA_Mono>: the ordinary Cashu API that wallets call
        </VA_Li>
        <VA_Li>
          <VA_Mono>federation_api_url</VA_Mono>: envelopes, consensus messages and catch-up for the other members
        </VA_Li>
      </VA_Box>
      <VA_Box x={120} y={612} w={820} h={320} title="Returns a share when" tone={tone(3)} titleColor={s === 3 ? c.clayHex : c.muted} show={s >= 3}>
        <VA_Li>the operation it received is accepted in the consensus order,</VA_Li>
        <VA_Li>
          it has applied it: inputs verified against <M>K</M> and marked spent,
        </VA_Li>
        <VA_Li>
          and then only for that operation's outputs: <M>C′ᵢ = kᵢ·B′</M>.
        </VA_Li>
      </VA_Box>
      <VA_Box x={980} y={612} w={820} h={320} title="On its own, n = 5" plainTitle tone={tone(4)} titleColor={s === 4 ? c.clayHex : c.muted} show={s >= 4}>
        <VA_Li color={c.good}>
          can verify any v3 proof with <M>K</M>, and any other member's share <M>C′ⱼ</M> with <M>Kⱼ</M>
        </VA_Li>
        <VA_Li color={c.bad}>
          cannot sign (<M>t = 3</M>), commit an operation (<M>c = 4</M>) or mark a quote paid (<M>q ≥ 4</M>)
        </VA_Li>
      </VA_Box>
    </VarShell>
  );
};

// ─── Framing: failure mode ──────────────────────────────────────────────────

const VA_FRow = ({ y, tones, show }: { y: number; tones: Tone[]; show: boolean }) => (
  <GFade show={show}>
    <Member x={160} y={y} r={26} label="m1" tone={tones[0]} />
    <Member x={240} y={y} r={26} label="m2" tone={tones[1]} />
    <Member x={320} y={y} r={26} label="m3" tone={tones[2]} />
    <Member x={400} y={y} r={26} label="m4" tone={tones[3]} />
    <Member x={480} y={y} r={26} label="m5" tone={tones[4]} />
  </GFade>
);

const VA_FCells = ({
  y,
  show,
  on,
  order,
  orderOk,
  sign,
  signOk,
  children,
}: {
  y: number;
  show: boolean;
  on: boolean;
  order: ReactNode;
  orderOk: boolean;
  sign: ReactNode;
  signOk: boolean;
  children: ReactNode;
}) => (
  <>
    <At x={580} y={y - 30} w={220} style={{ height: 60, display: 'flex', alignItems: 'center' }}>
      <Fade show={show}>
        <M size={30}>{order}</M>&nbsp;&nbsp;
        <span style={{ fontSize: 28 }}>
          <VA_Ok ok={orderOk} />
        </span>
      </Fade>
    </At>
    <At x={820} y={y - 30} w={220} style={{ height: 60, display: 'flex', alignItems: 'center' }}>
      <Fade show={show} delay={60}>
        <M size={30}>{sign}</M>&nbsp;&nbsp;
        <span style={{ fontSize: 28 }}>
          <VA_Ok ok={signOk} />
        </span>
      </Fade>
    </At>
    <At x={1060} y={y - 40} w={740} style={{ height: 80, display: 'flex', alignItems: 'center' }}>
      <Fade show={show} delay={120}>
        <div style={{ fontSize: 24, lineHeight: 1.38, color: on ? c.ink : c.muted, transition: `color 300ms ${EASE_OUT}` }}>
          {children}
        </div>
      </Fade>
    </At>
  </>
);

const VA_ModelFaults: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_MODEL} lens="Framing: failure mode" title="Offline and Byzantine members at n = 5" proc={proc}>
      <At x={120} y={262} w={1680}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${c.line}`, paddingBottom: 10 }}>
          <VA_Label style={{ width: 460 }}>members</VA_Label>
          <VA_Label style={{ width: 240 }} plain>
            order, <M>c = 4</M>
          </VA_Label>
          <VA_Label style={{ width: 240 }} plain>
            sign, <M>t = 3</M>
          </VA_Label>
          <VA_Label>outcome</VA_Label>
        </div>
      </At>
      <Canvas>
        <VA_FRow y={360} tones={['idle', 'idle', 'idle', 'idle', 'idle']} show={s >= 1} />
        <VA_FRow y={470} tones={['idle', 'idle', 'idle', 'idle', 'off']} show={s >= 2} />
        <VA_FRow y={580} tones={['idle', 'idle', 'idle', 'off', 'off']} show={s >= 3} />
        <VA_FRow y={690} tones={['bad', 'idle', 'idle', 'idle', 'idle']} show={s >= 4} />
      </Canvas>
      <VA_FCells y={360} show={s >= 1} on={s === 1} order="5" orderOk sign="5" signOk>
        All members online: operations are ordered, then signed.
      </VA_FCells>
      <VA_FCells y={470} show={s >= 2} on={s === 2} order="4" orderOk sign="4" signOk>
        m5 offline: 4 members still commit, and 4 can sign.
      </VA_FCells>
      <VA_FCells y={580} show={s >= 3} on={s === 3} order="3" orderOk={false} sign="3" signOk={false}>
        m4 and m5 offline: nothing is accepted, so no member signs, although 3 shares would suffice.
      </VA_FCells>
      <VA_FCells y={690} show={s >= 4} on={s === 4} order="4" orderOk sign="4" signOk>
        m1 Byzantine: it cannot block the order (4 honest ≥ c) and its share alone is 1 &lt; t.
      </VA_FCells>
      <VA_Box x={120} y={770} w={1680} h={150} title="why t may be below c" plainTitle tone={c.clayHex} show={s >= 5} size={24}>
        <M>t = 3 &lt; c = 4</M> is safe because shares are produced only after the operation is accepted. Members that
        signed on receipt could each be shown a different output set for the same quote.
      </VA_Box>
    </VarShell>
  );
};

// ─── Framing: before and after ──────────────────────────────────────────────

const VA_BW = [300, 620, 760];

const VA_BARow = ({
  k,
  a,
  b,
  s,
  same = false,
}: {
  k: ReactNode;
  a: ReactNode;
  b: ReactNode;
  s: number;
  same?: boolean;
}) => (
  <VA_TR h={70} hot={same && s >= 3}>
    <VA_TD w={VA_BW[0]} color={c.muted}>
      {k}
    </VA_TD>
    <VA_TD w={VA_BW[1]}>
      <span style={{ opacity: s >= 1 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>{a}</span>
    </VA_TD>
    <VA_TD w={VA_BW[2]} color={same && s >= 3 ? c.good : c.ink}>
      <span style={{ opacity: s >= 2 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>{b}</span>
    </VA_TD>
  </VA_TR>
);

const VA_ModelBeforeAfter: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_MODEL} lens="Framing: before and after" title="One mint, then five members" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VA_TR head h={52}>
          <VA_TD head w={VA_BW[0]}> </VA_TD>
          <VA_TD head w={VA_BW[1]}>standalone mint, v3 keyset</VA_TD>
          <VA_TD head w={VA_BW[2]} color={c.clayHex}>
            federation: 5 members, threshold 3
          </VA_TD>
        </VA_TR>
        <VA_BARow
          s={s}
          k="Signing key"
          a={
            <>
              one scalar <M>k</M> per amount, one server
            </>
          }
          b={
            <>
              shares <M>kᵢ</M>; any 3 shares interpolate <M>k·B′</M>
            </>
          }
        />
        <VA_BARow s={s} k="Signs when" a="the request is valid" b="the operation is accepted in the consensus order" />
        <VA_BARow s={s} k="Wallet talks to" a="one URL" b="all 5 public URLs, and aggregates the responses" />
        <VA_BARow
          s={s}
          k="Quote paid when"
          a="its payment backend reports it"
          b={
            <>
              <M>q ≥ 4</M> members report matching observations
            </>
          }
        />
        <VA_BARow
          s={s}
          same
          k="Public key"
          a={<M>K = k·G₂</M>}
          b={
            <>
              the same form, <M>K = k·G₂</M>; after a DKG no machine holds <M>k</M>
            </>
          }
        />
        <VA_BARow
          s={s}
          same
          k="Proof"
          a={
            <>
              <M>(x, C)</M>, checked by <M>e(C, G₂) = e(Y, K)</M>
            </>
          }
          b="unchanged"
        />
        <VA_BARow s={s} same k="Receiver needs" a="the keyset" b="unchanged: nothing federation-specific" />
      </At>
      <At x={120} y={850} w={1680}>
        <Fade show={s >= 3}>
          <Note style={{ fontSize: 26, color: c.ink }}>
            Issuance, ordering and payment acceptance change. The keyset, the proof and its verification do not.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.1 Blind DH on secp256k1 (NUT-00)
// ═════════════════════════════════════════════════════════════════════════════

const VA_OF_BDHKE = '1.1 Blind DH on secp256k1';

// ─── Beginner: toy numbers ──────────────────────────────────────────────────

const VA_DW = [70, 150, 470, 420, 570];

const VA_Who = ({ who }: { who: 'wallet' | 'mint' | 'anyone' }) => (
  <span
    style={{
      fontSize: 21,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: who === 'wallet' ? c.cool : who === 'mint' ? c.clayHex : c.violet,
    }}
  >
    {who}
  </span>
);

const VA_ToyRow = ({
  n,
  s,
  who,
  what,
  formula,
  toy,
}: {
  n: number;
  s: number;
  who: 'wallet' | 'mint' | 'anyone';
  what: ReactNode;
  formula: ReactNode;
  toy: ReactNode;
}) => (
  <VA_TR h={92} show={s >= n} hot={s === n}>
    <VA_TD w={VA_DW[0]} color={c.muted}>
      <VA_Mono>{n}</VA_Mono>
    </VA_TD>
    <VA_TD w={VA_DW[1]}>
      <VA_Who who={who} />
    </VA_TD>
    <VA_TD w={VA_DW[2]}>{what}</VA_TD>
    <VA_TD w={VA_DW[3]}>
      <M size={28}>{formula}</M>
    </VA_TD>
    <VA_TD w={VA_DW[4]}>
      <M size={28}>{toy}</M>
    </VA_TD>
  </VA_TR>
);

const VA_BdhkeBeginner: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BDHKE} lens="Beginner" title="Blind signing with toy numbers" proc={proc}>
      <At x={120} y={262} w={1680}>
        <div style={{ background: c.panel, borderRadius: 12, padding: '12px 24px', fontSize: 24, lineHeight: 1.45 }}>
          Toy group with 13 points <M>0·G, 1·G, …, 12·G</M>. Adding points adds their multiples, mod 13. On secp256k1
          there are about <M>2²⁵⁶</M> points, and the multiple behind a point cannot be recovered from the point.
        </div>
      </At>
      <At x={120} y={384} w={1680}>
        <VA_TR head h={48}>
          <VA_TD head w={VA_DW[0]}>#</VA_TD>
          <VA_TD head w={VA_DW[1]}>who</VA_TD>
          <VA_TD head w={VA_DW[2]}>does</VA_TD>
          <VA_TD head w={VA_DW[3]}>formula</VA_TD>
          <VA_TD head w={VA_DW[4]}>toy value, mod 13</VA_TD>
        </VA_TR>
        <VA_ToyRow
          n={1}
          s={s}
          who="wallet"
          what="hashes its secret x to a point"
          formula={
            <>
              Y = <Up>hash_to_curve</Up>(x)
            </>
          }
          toy="Y = 5·G"
        />
        <VA_ToyRow
          n={2}
          s={s}
          who="wallet"
          what="picks a random blinding factor r = 3 and sends B′"
          formula="B′ = Y + r·G"
          toy="5·G + 3·G = 8·G"
        />
        <VA_ToyRow
          n={3}
          s={s}
          who="mint"
          what="multiplies by its private key k = 7 and returns C′"
          formula="C′ = k·B′"
          toy="7·8 = 56 = 4  →  4·G"
        />
        <VA_ToyRow
          n={4}
          s={s}
          who="wallet"
          what="removes r·K with the public key K = 7·G"
          formula="C = C′ − r·K"
          toy="4 − 3·7 = −17 = 9  →  9·G"
        />
        <VA_ToyRow
          n={5}
          s={s}
          who="mint"
          what="checks a redemption (x, C) with its private key"
          formula="k·Y ≟ C"
          toy={
            <>
              7·5 = 35 = 9  →  9·G <VA_Ok />
            </>
          }
        />
      </At>
    </VarShell>
  );
};

// ─── Advanced: encodings, algebra, DLEQ ─────────────────────────────────────

const VA_BdhkeAdvanced: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const tone = (i: number) => (s === i ? c.clayHex : c.rule);
  const tc = (i: number) => (s === i ? c.clayHex : c.muted);
  return (
    <VarShell of={VA_OF_BDHKE} lens="Advanced" title="NUT-00 BDHKE: encoding, algebra, DLEQ" proc={proc}>
      <VA_Box x={120} y={262} w={820} h={330} title="hash_to_curve" plainTitle tone={tone(1)} titleColor={tc(1)} show={s >= 1}>
        <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.7 }}>
          <div>msg_hash = SHA256("Secp256k1_HashToCurve_Cashu_" || x)</div>
          <div>Y = PublicKey(02 || SHA256(msg_hash || counter))</div>
        </div>
        <div style={{ marginTop: 10 }}>
          <VA_Li>
            <VA_Mono>counter</VA_Mono>: u32, little-endian, from 0 until the 32 bytes are a valid x-coordinate
          </VA_Li>
          <VA_Li>
            prefix <VA_Mono>02</VA_Mono>: the point with even <M>y</M>; CDK stops after <M>2¹⁶</M> attempts
          </VA_Li>
        </div>
      </VA_Box>
      <VA_Box x={980} y={262} w={820} h={330} title="Unblinding" tone={tone(2)} titleColor={tc(2)} show={s >= 2}>
        <M size={30}>C′ − r·K = k·(Y + r·G) − r·(k·G) = k·Y</M>
        <div style={{ marginTop: 14 }}>
          <VA_Li>
            uses only the published key <M>K</M>
          </VA_Li>
          <VA_Li>
            if the mint signed with <M>k′ ≠ k</M>: <M>C = k′·Y + r·(k′ − k)·G</M>, valid under neither key
          </VA_Li>
        </div>
      </VA_Box>
      <VA_Box x={120} y={622} w={820} h={330} title="Offline check: DLEQ (NUT-12)" tone={tone(3)} titleColor={tc(3)} show={s >= 3}>
        <div>
          Only the holder of <M>k</M> can test <M>k·Y = C</M>. The mint proves that one <M>k</M> links{' '}
          <M>K = k·G</M> and <M>C′ = k·B′</M>:
        </div>
        <div style={{ marginTop: 10 }}>
          <M size={27}>R₁ = s·G − e·K,&nbsp; R₂ = s·B′ − e·C′</M>
        </div>
        <div style={{ marginTop: 6 }}>
          <M size={27}>e ≟ hash(R₁, R₂, K, C′)</M>
        </div>
        <div style={{ marginTop: 8, color: c.muted }}>Optional on v1 and v2 keysets. NUT-12 names the key A.</div>
      </VA_Box>
      <VA_Box x={980} y={622} w={820} h={330} title="Failure modes" tone={tone(4)} titleColor={tc(4)} show={s >= 4}>
        <VA_Li color={c.bad}>
          DLEQ nonce reused across two challenges: <M>k = (s₁ − s₂)·(e₁ − e₂)⁻¹</M>. Mints SHOULD use a
          rejection-sampled deterministic nonce.
        </VA_Li>
        <VA_Li color={c.bad}>
          a repeated secret maps to the same <M>Y</M>; the mint rejects it as already spent
        </VA_Li>
        <VA_Li color={c.bad}>
          without DLEQ the wallet cannot tell a wrong-key <M>C′</M> from a valid one until redemption
        </VA_Li>
      </VA_Box>
    </VarShell>
  );
};

// ─── Graphical: additive blinding cancels ───────────────────────────────────

const VA_BH = 60; // bar height
const VA_KX = 1.5; // visual stretch for "·k"

/** A filled bar segment; `sx` stretches it from its left edge, `dx` shifts it. */
const VA_Blk = ({
  x,
  y,
  w,
  fill,
  stroke,
  dashed = false,
  show = true,
  sx = 1,
  dx = 0,
  fade = 1,
  enterX = 0,
  h = VA_BH,
}: {
  x: number;
  y: number;
  w: number;
  fill: string;
  stroke: string;
  dashed?: boolean;
  show?: boolean;
  sx?: number;
  dx?: number;
  fade?: number;
  enterX?: number;
  h?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      borderRadius: 8,
      background: fill,
      border: `2px ${dashed ? 'dashed' : 'solid'} ${stroke}`,
      transformOrigin: 'left center',
      opacity: show ? fade : 0,
      transform: `translateX(${show || REDUCED ? dx : dx + enterX}px) scaleX(${sx})`,
      transition: `transform 800ms ${EASE_IO}, opacity 450ms ${EASE_OUT}`,
    }}
  />
);

/** A label centred at (x, y); `dx` shifts it. */
const VA_BLbl = ({
  x,
  y,
  children,
  show = true,
  dx = 0,
  size = 30,
  color = c.ink,
  enterX = 0,
  fade = 1,
}: {
  x: number;
  y: number;
  children: ReactNode;
  show?: boolean;
  dx?: number;
  size?: number;
  color?: string;
  enterX?: number;
  fade?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - 150,
      top: y - 22,
      width: 300,
      textAlign: 'center',
      opacity: show ? fade : 0,
      transform: `translateX(${show || REDUCED ? dx : dx + enterX}px)`,
      transition: `transform 800ms ${EASE_IO}, opacity 450ms ${EASE_OUT}`,
    }}
  >
    <M size={size} color={color}>
      {children}
    </M>
  </div>
);

const VA_BdhkeGraphical: Page = () => {
  const proc = useProcess(7, 2000);
  const s = proc.step;
  const yW = 280 * VA_KX; // 420
  const rW = 150 * VA_KX; // 225
  const r1 = 290;
  const r2 = 420;
  const r3 = 550;
  const r4 = 690;
  const r5 = 820;
  const cy = (r: number) => r + VA_BH / 2;
  return (
    <VarShell of={VA_OF_BDHKE} lens="Graphical" title="Additive blinding cancels" proc={proc}>
      <Canvas>
        <line x1={960} y1={262} x2={960} y2={930} style={{ stroke: c.line, strokeWidth: 1.5, strokeDasharray: '6 8' }} />
        <T x={200} y={262} size={24} color={c.cool} anchor="start">
          wallet
        </T>
        <T x={1720} y={262} size={24} color={c.clayHex} anchor="end">
          mint
        </T>
        <Packet x1={640} y1={cy(r4)} x2={1040} y2={cy(r5)} run={proc.anim && s === 7} color={c.cool} delay={100} />
      </Canvas>
      {/* row 1: B′ = Y + r·G (wallet) */}
      <VA_Blk x={200} y={r1} w={280} fill={c.coolSoft} stroke={c.cool} show={s >= 1} />
      <VA_BLbl x={340} y={cy(r1)} show={s >= 1}>
        Y
      </VA_BLbl>
      <VA_Blk x={480} y={r1} w={150} fill={c.claySoft} stroke={c.clayHex} show={s >= 2} />
      <VA_BLbl x={555} y={cy(r1)} show={s >= 2}>
        r·G
      </VA_BLbl>
      <VA_BLbl x={720} y={cy(r1)} show={s >= 2} size={34}>
        = B′
      </VA_BLbl>
      {/* row 2: sent, then multiplied by k (mint) */}
      <VA_Blk x={1040} y={r2} w={280} fill={c.coolSoft} stroke={c.cool} show={s >= 3} enterX={-840} sx={s >= 4 ? VA_KX : 1} />
      <VA_Blk
        x={1320}
        y={r2}
        w={150}
        fill={c.claySoft}
        stroke={c.clayHex}
        show={s >= 3}
        enterX={-840}
        dx={s >= 4 ? 140 : 0}
        sx={s >= 4 ? VA_KX : 1}
      />
      <VA_BLbl x={1180} y={cy(r2)} show={s >= 3} fade={s >= 4 ? 0 : 1} enterX={-840}>
        Y
      </VA_BLbl>
      <VA_BLbl x={1180} y={cy(r2)} show={s >= 4} dx={70}>
        k·Y
      </VA_BLbl>
      <VA_BLbl x={1395} y={cy(r2)} show={s >= 3} fade={s >= 4 ? 0 : 1} enterX={-840}>
        r·G
      </VA_BLbl>
      <VA_BLbl x={1395} y={cy(r2)} show={s >= 4} dx={177}>
        k·r·G
      </VA_BLbl>
      <VA_BLbl x={1255} y={r2 - 26} show={s >= 3} fade={s >= 4 ? 0 : 1} size={30} color={c.muted} enterX={-840}>
        B′
      </VA_BLbl>
      <VA_BLbl x={1362} y={r2 - 26} show={s >= 4} size={30} color={c.muted}>
        C′ = k·B′
      </VA_BLbl>
      {/* row 3: returned to the wallet, r·K subtracted */}
      <VA_Blk x={200} y={r3} w={yW} fill={c.coolSoft} stroke={c.cool} show={s >= 5} enterX={840} />
      <VA_BLbl x={200 + yW / 2} y={cy(r3)} show={s >= 5} enterX={840}>
        k·Y
      </VA_BLbl>
      <VA_Blk x={200 + yW} y={r3} w={rW} fill={c.claySoft} stroke={c.clayHex} show={s >= 5} enterX={840} fade={s >= 6 ? 0.4 : 1} />
      <VA_BLbl x={200 + yW + rW / 2} y={cy(r3)} show={s >= 5} enterX={840} fade={s >= 6 ? 0.45 : 1}>
        k·r·G
      </VA_BLbl>
      <VA_BLbl x={200 + yW + rW + 60} y={cy(r3)} show={s >= 5} enterX={840} size={34}>
        = C′
      </VA_BLbl>
      <VA_Blk x={200 + yW} y={r3 + VA_BH + 8} w={rW} h={48} fill={c.card} stroke={c.clayHex} dashed show={s >= 5} fade={s >= 6 ? 0.4 : 1} />
      <VA_BLbl x={200 + yW + rW / 2} y={r3 + VA_BH + 32} show={s >= 5} size={26} color={c.clayHex} fade={s >= 6 ? 0.45 : 1}>
        − r·K
      </VA_BLbl>
      {/* row 4: C = k·Y */}
      <VA_Blk x={200} y={r4} w={yW} fill={c.coolSoft} stroke={c.cool} show={s >= 6} />
      <VA_BLbl x={200 + yW / 2} y={cy(r4)} show={s >= 6}>
        k·Y
      </VA_BLbl>
      <VA_BLbl x={200 + yW + 70} y={cy(r4)} show={s >= 6} size={34}>
        = C
      </VA_BLbl>
      {/* row 5: redemption, the mint recomputes k·Y from x */}
      <VA_Blk x={1040} y={r5} w={yW} fill={c.card} stroke={c.clayHex} show={s >= 7} />
      <VA_BLbl x={1040 + yW / 2} y={cy(r5)} show={s >= 7}>
        k·Y <Up>from</Up> x
      </VA_BLbl>
      <VA_BLbl x={1040 + yW + 110} y={cy(r5)} show={s >= 7} size={34} color={c.good}>
        = C ✓
      </VA_BLbl>
    </VarShell>
  );
};

// ─── Explained via code ─────────────────────────────────────────────────────

const VA_BdhkeCode: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BDHKE} lens="Explained via code" title="BDHKE in cashu::dhke" proc={proc}>
      <At x={120} y={262} w={1220}>
        <VA_CodeBox>
          <VA_CL on={s === 1}>
            <VA_Cm>// blind_message_for_version: Version00 | Version01</VA_Cm>
          </VA_CL>
          <VA_CL on={s === 1}>let y: PublicKey = hash_to_curve(secret)?;</VA_CL>
          <VA_CL on={s === 1}>let r: SecretKey = blinding_factor.unwrap_or_else(SecretKey::generate);</VA_CL>
          <VA_CL on={s === 1}>
            Ok((y.try_combine(&r.public_key())?, r)){'            '}
            <VA_Cm>// B_ = Y + r*G</VA_Cm>
          </VA_CL>
          <VA_CL />
          <VA_CL on={s === 2}>
            <VA_Cm>// sign_message</VA_Cm>
          </VA_CL>
          <VA_CL on={s === 2}>let k = Scalar::from(*k.as_secp256k1()?);</VA_CL>
          <VA_CL on={s === 2}>
            Ok(blinded_message.try_mul_tweak(&SECP256K1, &k)?){'  '}
            <VA_Cm>// C_ = k*B_</VA_Cm>
          </VA_CL>
          <VA_CL />
          <VA_CL on={s === 3}>
            <VA_Cm>// unblind_message</VA_Cm>
          </VA_CL>
          <VA_CL on={s === 3}>
            let a = mint_pubkey.try_mul_tweak(&SECP256K1, &r)?;{'  '}
            <VA_Cm>// r*K</VA_Cm>
          </VA_CL>
          <VA_CL on={s === 3}>let a = a.try_negate(&SECP256K1)?;</VA_CL>
          <VA_CL on={s === 3}>
            Ok(blinded_key.try_combine(&a)?){'                     '}
            <VA_Cm>// C_ - r*K</VA_Cm>
          </VA_CL>
          <VA_CL />
          <VA_CL on={s === 4}>
            <VA_Cm>// verify_message(a: &SecretKey, unblinded_message, msg)</VA_Cm>
          </VA_CL>
          <VA_CL on={s === 4}>let y: PublicKey = hash_to_curve(msg)?;</VA_CL>
          <VA_CL on={s === 4}>let expected = y.try_mul_tweak(&Secp256k1::new(), &Scalar::from(*a.as_secp256k1()?))?;</VA_CL>
          <VA_CL on={s === 4}>{'if unblinded_message == expected { return Ok(()); }'}</VA_CL>
        </VA_CodeBox>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Blind: hash <M>x</M> to a point, add <M>r·G</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Sign: multiply <M>B′</M> by the scalar <M>k</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Unblind: subtract <M>r·K</M>. Only the public key is used.
        </StepItem>
        <StepItem n={4} step={s}>
          Verify: recompute <M>k·Y</M>. The function takes the secret key.
        </StepItem>
      </StepList>
      <At x={1380} y={660} w={420}>
        <Note>
          Excerpts from <VA_Mono>crates/cashu/src/dhke.rs</VA_Mono>, branch <VA_Mono>bls-federation</VA_Mono>, abridged.
        </Note>
      </At>
    </VarShell>
  );
};

// ─── Perspective: mint ──────────────────────────────────────────────────────

const VA_LogLine = ({ show, on, children }: { show: boolean; on: boolean; children: ReactNode }) => (
  <Fade show={show}>
    <div
      style={{
        fontSize: 24,
        lineHeight: 1.4,
        padding: '10px 14px',
        marginBottom: 10,
        borderRadius: 8,
        background: on ? c.claySoft : c.panel,
        transition: `background 300ms ${EASE_OUT}`,
      }}
    >
      {children}
    </div>
  </Fade>
);

const VA_BdhkeMint: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BDHKE} lens="Perspective: mint" title="What the mint sees" proc={proc}>
      <VA_Box x={120} y={262} w={580} h={480} title="Issuance request" tone={c.rule}>
        <VA_LogLine show={s >= 1} on={s === 1}>
          <VA_Mono>BlindedMessage</VA_Mono>: amount, keyset id, <M>B′</M>
        </VA_LogLine>
        <VA_LogLine show={s >= 1} on={s === 1}>
          <M>B′ = Y + r·G</M> with uniform <M>r</M>: a uniformly random point
        </VA_LogLine>
        <VA_LogLine show={s >= 2} on={s === 2}>
          returns <M>C′ = k·B′</M>, optionally with a DLEQ proof
        </VA_LogLine>
      </VA_Box>
      <VA_Box x={740} y={262} w={580} h={480} title="Redemption request" tone={c.rule}>
        <VA_LogLine show={s >= 3} on={s === 3}>
          <VA_Mono>Proof</VA_Mono>: amount, keyset id, secret <M>x</M>, <M>C</M>
        </VA_LogLine>
        <VA_LogLine show={s >= 4} on={s === 4}>
          computes <M>Y = hash_to_curve(x)</M>, checks <M>k·Y = C</M>
        </VA_LogLine>
        <VA_LogLine show={s >= 4} on={s === 4}>
          checks <M>Y</M> is unspent, then records <M>Y</M>
        </VA_LogLine>
      </VA_Box>
      <VA_Box x={120} y={780} w={1200} h={160} tone={c.clayHex} show={s >= 5} size={24}>
        For every pair <M>(B′, Y)</M> there is exactly one <M>r</M> with <M>B′ = Y + r·G</M>. Every issuance is
        consistent with every redemption, so the two records cannot be linked.
      </VA_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Issuance: the mint sees <M>B′</M>, which is independent of <M>Y</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          It returns <M>C′ = k·B′</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Redemption: the proof reveals <M>x</M> and <M>C</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          It recomputes <M>k·Y</M>, compares, and records <M>Y</M> as spent.
        </StepItem>
        <StepItem n={5} step={s}>
          Linking <M>B′</M> to <M>Y</M> would need <M>r</M>; every <M>r</M> is equally likely.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: the constraint that forces the design ─────────────────────────

const VA_BdhkeConstraint: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BDHKE} lens="Framing: the constraint that forces the design" title="Verification needs k" proc={proc}>
      <At x={120} y={266} w={1220}>
        <Fade show={s >= 1}>
          <div style={{ textAlign: 'center' }}>
            <M size={48}>
              <Hi>k</Hi> · <Up>hash_to_curve</Up>(x) ≟ C
            </M>
          </div>
          <div style={{ textAlign: 'center', fontSize: 24, color: c.muted, marginTop: 6 }}>
            the NUT-00 check; only the holder of <M>k</M> can evaluate it
          </div>
        </Fade>
      </At>
      <VA_Box x={120} y={420} w={590} h={340} title="one mint" show={s >= 2} tone={s === 2 ? c.clayHex : c.rule}>
        <VA_Li color={c.good}>
          mint, at redemption: computes <M>k·Y</M> itself
        </VA_Li>
        <VA_Li>wallet, after issuance: needs a DLEQ proof from the mint (NUT-12)</VA_Li>
        <VA_Li>receiver: needs the DLEQ proof and the sender's blinding factor r</VA_Li>
      </VA_Box>
      <VA_Box x={750} y={420} w={590} h={340} title="k split into shares, t of n" plainTitle show={s >= 3} tone={s === 3 ? c.clayHex : c.rule}>
        <VA_Li color={c.bad}>
          redemption: no member has <M>k</M>; <M>t</M> members compute <M>kᵢ·Y</M> and combine, for every input
        </VA_Li>
        <VA_Li color={c.bad}>
          wallet: one DLEQ per share and a trusted interpolation, or a threshold DLEQ, which is a new protocol
        </VA_Li>
        <VA_Li color={c.bad}>receiver: a DLEQ for the aggregate key needs k, which nobody holds</VA_Li>
      </VA_Box>
      <VA_Box x={120} y={800} w={1220} h={130} tone={c.clayHex} fill={c.claySoft} show={s >= 4} size={26}>
        Requirement: a check that uses only public values.&nbsp; v3 uses <M>e(C, G₂) = e(Y, K)</M>.
      </VA_Box>
      <StepList>
        <StepItem n={1} step={s}>
          The NUT-00 check uses the private key.
        </StepItem>
        <StepItem n={2} step={s}>
          With one mint, the key holder checks; everyone else relies on DLEQ.
        </StepItem>
        <StepItem n={3} step={s}>
          With <M>k</M> shared, each check needs <M>t</M> members or a new proof system.
        </StepItem>
        <StepItem n={4} step={s}>
          v3 moves verification to public values.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Focus: the blinding factor ─────────────────────────────────────────────

const VA_BfLine = ({ show, delay = 0, children, color }: { show: boolean; delay?: number; children: ReactNode; color?: string }) => (
  <Fade show={show} delay={delay}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center' }}>
      <M size={27} color={color}>
        {children}
      </M>
    </div>
  </Fade>
);

const VA_BdhkeBlinding: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BDHKE} lens="Focus: the blinding factor" title="One secret, two blinding factors" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Note style={{ color: c.ink }}>
          Toy group mod 13: <M>Y = 5·G</M>, mint key <M>k = 7</M>, published <M>K = 7·G</M>.
        </Note>
      </At>
      <VA_Box x={120} y={320} w={380} h={420} title="r = 3" plainTitle tone={s === 1 ? c.clayHex : c.rule} show={s >= 1}>
        <VA_BfLine show={s >= 1}>B′ = Y + 3·G = 8·G</VA_BfLine>
        <VA_BfLine show={s >= 1} delay={80}>
          C′ = 7·8·G = 4·G
        </VA_BfLine>
        <VA_BfLine show={s >= 1} delay={160}>
          r·K = 21·G = 8·G
        </VA_BfLine>
        <VA_BfLine show={s >= 1} delay={240}>
          C = 4·G − 8·G = 9·G
        </VA_BfLine>
        <VA_BfLine show={s >= 1} delay={320} color={c.good}>
          C = k·Y ✓
        </VA_BfLine>
      </VA_Box>
      <VA_Box x={530} y={320} w={380} h={420} title="r = 10" plainTitle tone={s === 2 ? c.clayHex : c.rule} show={s >= 2}>
        <VA_BfLine show={s >= 2}>B′ = Y + 10·G = 2·G</VA_BfLine>
        <VA_BfLine show={s >= 2} delay={80}>
          C′ = 7·2·G = 1·G
        </VA_BfLine>
        <VA_BfLine show={s >= 2} delay={160}>
          r·K = 70·G = 5·G
        </VA_BfLine>
        <VA_BfLine show={s >= 2} delay={240}>
          C = 1·G − 5·G = 9·G
        </VA_BfLine>
        <VA_BfLine show={s >= 2} delay={320} color={c.good}>
          C = k·Y ✓
        </VA_BfLine>
      </VA_Box>
      <VA_Box x={940} y={320} w={400} h={420} title="r = 3, mint used k′ = 4" plainTitle tone={s === 4 ? c.bad : c.rule} titleColor={s >= 4 ? c.bad : c.muted} show={s >= 4}>
        <VA_BfLine show={s >= 4}>B′ = 8·G</VA_BfLine>
        <VA_BfLine show={s >= 4} delay={80}>
          C′ = 4·8·G = 6·G
        </VA_BfLine>
        <VA_BfLine show={s >= 4} delay={160}>
          r·K = 8·G
        </VA_BfLine>
        <VA_BfLine show={s >= 4} delay={240}>
          C = 6·G − 8·G = 11·G
        </VA_BfLine>
        <VA_BfLine show={s >= 4} delay={320} color={c.bad}>
          C ≠ k·Y = 9·G ✗
        </VA_BfLine>
      </VA_Box>
      <At x={120} y={770} w={1220}>
        <Fade show={s >= 3}>
          <Note style={{ color: c.ink }}>
            <M>B′</M> differs, <M>C</M> does not: <M>C</M> depends only on <M>x</M> and <M>k</M>. With uniform{' '}
            <M>r</M>, <M>B′ = Y + r·G</M> is a uniform point and carries no information about <M>Y</M>.
          </Note>
        </Fade>
        <Fade show={s >= 4} style={{ marginTop: 14 }}>
          <Note>
            Unblinding trusts <M>K</M>. A wrong-key signature unblinds to a point that verifies under no key; only a
            DLEQ proof shows this before redemption.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Blind and unblind with <M>r = 3</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Same secret with <M>r = 10</M>: another <M>B′</M>, the same <M>C</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          <M>B′</M> is uniform; <M>C</M> is fixed by <M>x</M> and <M>k</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          A mint that signs with another key <M>k′</M> gives <M>C ≠ k·Y</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.1 Blind BLS on BLS12-381 (keyset v3)
// ═════════════════════════════════════════════════════════════════════════════

const VA_OF_BLS = '1.1 Blind BLS on BLS12-381';

// ─── Beginner: toy numbers ──────────────────────────────────────────────────

const VA_Rung = ({
  x,
  y,
  w,
  show,
  on,
  who,
  children,
}: {
  x: number;
  y: number;
  w: number;
  show: boolean;
  on: boolean;
  who: 'wallet' | 'mint' | 'anyone';
  children: ReactNode;
}) => (
  <At x={x} y={y} w={w} style={{ height: 76 }}>
    <Fade show={show} style={{ height: 76 }}>
      <div
        style={{
          height: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '0 16px',
          borderRadius: 10,
          background: on ? c.claySoft : 'transparent',
          transition: `background 300ms ${EASE_OUT}`,
        }}
      >
        <span style={{ width: 90, flexShrink: 0 }}>
          <VA_Who who={who} />
        </span>
        <M size={29}>{children}</M>
      </div>
    </Fade>
  </At>
);

const VA_BlsBeginner: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BLS} lens="Beginner" title="Blind BLS with toy numbers" proc={proc}>
      <At x={120} y={262} w={1680}>
        <div style={{ background: c.panel, borderRadius: 12, padding: '12px 24px', fontSize: 24, lineHeight: 1.45 }}>
          Toy groups <M>G₁</M> and <M>G₂</M> with 13 elements; <M>a·G₁</M> is a point of <M>G₁</M>. The pairing
          multiplies the multiples: <M>e(a·G₁, b·G₂) = gᵃᵇ</M>, exponents mod 13.
        </div>
      </At>
      <Canvas>
        <Arrow x1={900} y1={508} x2={1090} y2={508} show={s >= 2} color={c.cool} label="B′" />
        <Packet x1={900} y1={508} x2={1090} y2={508} run={proc.anim && s === 2} delay={300} />
        <Arrow x1={1090} y1={598} x2={900} y2={598} show={s >= 3} color={c.clayHex} label="C′" />
        <Packet x1={1090} y1={598} x2={900} y2={598} run={proc.anim && s === 3} color={c.clayHex} delay={300} />
      </Canvas>
      <VA_Rung x={1100} y={380} w={700} show={s >= 1} on={s === 1} who="mint">
        k = 7, <Up>publishes</Up> K = 7·G₂
      </VA_Rung>
      <VA_Rung x={120} y={380} w={770} show={s >= 1} on={s === 1} who="wallet">
        Y = <Up>H</Up>(x) = 5·G₁
      </VA_Rung>
      <VA_Rung x={120} y={470} w={770} show={s >= 2} on={s === 2} who="wallet">
        r = 3:&nbsp; B′ = r·Y = 15·G₁ = 2·G₁
      </VA_Rung>
      <VA_Rung x={1100} y={560} w={700} show={s >= 3} on={s === 3} who="mint">
        C′ = k·B′ = 14·G₁ = 1·G₁
      </VA_Rung>
      <VA_Rung x={120} y={650} w={770} show={s >= 4} on={s === 4} who="wallet">
        <Up>e</Up>(C′, G₂) = g¹,&nbsp; <Up>e</Up>(B′, K) = g¹⁴ = g¹ <VA_Ok />
      </VA_Rung>
      <VA_Rung x={120} y={740} w={770} show={s >= 5} on={s === 5} who="wallet">
        r⁻¹ = 9 (3·9 = 27 = 1):&nbsp; C = 9·C′ = 9·G₁
      </VA_Rung>
      <VA_Rung x={120} y={830} w={1680} show={s >= 6} on={s === 6} who="anyone">
        <Up>e</Up>(C, G₂) = g⁹,&nbsp; <Up>e</Up>(Y, K) = <Up>e</Up>(5·G₁, 7·G₂) = g³⁵ = g⁹ <VA_Ok />
        &nbsp;&nbsp;
        <span style={{ fontFamily: 'var(--osd-font-body)', fontStyle: 'normal', fontSize: 24, color: c.muted }}>
          no <M>k</M> needed
        </span>
      </VA_Rung>
    </VarShell>
  );
};

// ─── Advanced: MUST rules and failure modes ─────────────────────────────────

const VA_AW = [60, 800, 820];

const VA_RuleRow = ({ n, s, rule, breaks }: { n: number; s: number; rule: ReactNode; breaks: ReactNode }) => (
  <VA_TR h={96} show={s >= n} hot={s === n}>
    <VA_TD w={VA_AW[0]} color={c.muted}>
      <VA_Mono>{n}</VA_Mono>
    </VA_TD>
    <VA_TD w={VA_AW[1]} size={22}>
      {rule}
    </VA_TD>
    <VA_TD w={VA_AW[2]} size={22} color={c.bad}>
      {breaks}
    </VA_TD>
  </VA_TR>
);

const VA_BlsAdvanced: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BLS} lens="Advanced" title="v3 blind signatures: rules and failure modes" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VA_TR head h={52}>
          <VA_TD head w={VA_AW[0]}>#</VA_TD>
          <VA_TD head w={VA_AW[1]}>rule</VA_TD>
          <VA_TD head w={VA_AW[2]}>without it</VA_TD>
        </VA_TR>
        <VA_RuleRow
          n={1}
          s={s}
          rule={
            <>
              <M>B′, C′, C ∈ G₁</M> and <M>K ∈ G₂</M> MUST be canonical compressed encodings, on the curve, in the
              prime-order subgroup.
            </>
          }
          breaks={
            <>
              A <M>B′</M> with a component of small order <M>h</M>: <M>C′ = k·B′</M> reveals <M>k</M> mod <M>h</M>{' '}
              (small-subgroup attack, Lim–Lee).
            </>
          }
        />
        <VA_RuleRow
          n={2}
          s={s}
          rule="The identity point is never a valid blinded message, signature or mint key."
          breaks={
            <>
              With <M>K = O</M>, <M>e(Y, K) = 1</M> for every <M>Y</M>, and <M>C = O</M> verifies for every secret.
            </>
          }
        />
        <VA_RuleRow
          n={3}
          s={s}
          rule={
            <>
              <M>r</M> is a random non-zero scalar in <M>𝔽ᵣ</M>; seeded wallets rejection-sample it (NUT-13).
            </>
          }
          breaks={
            <>
              <M>r = 0</M> gives <M>B′ = O</M>. Reducing 32 random bytes would bias <M>r</M>: the order is{' '}
              <M>≈ 0.45·2²⁵⁶</M>.
            </>
          }
        />
        <VA_RuleRow
          n={4}
          s={s}
          rule="x is the decoded 33 bytes of a compressed secp256k1 key. Mints MUST reject any other secret form."
          breaks="Every v3 input MUST carry a witness (NUT-03), verified against the secret as a public key. A non-point secret has no key."
        />
        <VA_RuleRow
          n={5}
          s={s}
          rule={
            <>
              <VA_Mono>hash_to_curve_G1</VA_Mono>: RFC 9380 suite, DST{' '}
              <VA_Mono>CASHU_BLS12_381_G1_XMD:SHA-256_SSWU_RO_</VA_Mono>.
            </>
          }
          breaks={
            <>
              If <M>H(x) = h·G₁</M> with <M>h</M> known, one signature gives <M>k·G₁ = h⁻¹·C</M>, and then every
              other signature.
            </>
          }
        />
        <VA_RuleRow
          n={6}
          s={s}
          rule={
            <>
              No <VA_Mono>dleq</VA_Mono> field on a v3 <VA_Mono>BlindSignature</VA_Mono> or <VA_Mono>Proof</VA_Mono>{' '}
              (MUST NOT); receivers SHOULD treat one as malformed.
            </>
          }
          breaks="NUT-12 DLEQ is a secp256k1 construction; on v3 the pairing check replaces it."
        />
      </At>
      <At x={120} y={912} w={1680}>
        <Fade show={s >= 2}>
          <Note>
            Parsing in <VA_Mono>crates/cashu/src/nuts/nut01/bls.rs</VA_Mono>: <VA_Mono>from_compressed</VA_Mono>, then an
            explicit identity check.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Graphical: two groups, one pairing ─────────────────────────────────────

const VA_Pt = ({
  x,
  y,
  label,
  show,
  color = c.ink,
  dy = -24,
  delay = 0,
}: {
  x: number;
  y: number;
  label: string;
  show: boolean;
  color?: string;
  dy?: number;
  delay?: number;
}) => (
  <GFade show={show} delay={delay}>
    <circle cx={x} cy={y} r={11} style={{ fill: color }} />
    <T x={x} y={y + dy} size={36} font="math" color={color}>
      {label}
    </T>
  </GFade>
);

const VA_BlsGraphical: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  const run = proc.anim;
  return (
    <VarShell of={VA_OF_BLS} lens="Graphical" title="Two groups, one pairing" proc={proc}>
      <Canvas>
        <rect x={120} y={270} width={800} height={430} rx={16} style={{ fill: 'rgba(217, 119, 87, 0.05)', stroke: c.clayHex, strokeWidth: 1.5 }} />
        <rect x={1000} y={270} width={800} height={430} rx={16} style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 1.5 }} />
        <T x={146} y={306} size={24} anchor="start" color={c.clayHex}>
          G₁ · 48 B
        </T>
        <T x={1026} y={306} size={24} anchor="start" color={c.cool}>
          G₂ · 96 B
        </T>
        {/* G₁: x → Y → B′ → C′ → C */}
        <T x={172} y={492} size={36} font="math" show={s >= 1}>
          x
        </T>
        <Arrow x1={196} y1={480} x2={280} y2={480} show={s >= 1} color={c.muted} label="H" labelDy={-12} />
        <VA_Pt x={300} y={480} label="Y" show={s >= 1} delay={300} />
        <Arrow x1={314} y1={470} x2={504} y2={392} show={s >= 2} color={c.cool} label="×r" labelDy={-18} />
        <VA_Pt x={520} y={380} label="B′" show={s >= 2} delay={400} />
        <Arrow x1={536} y1={392} x2={744} y2={470} show={s >= 3} color={c.clayHex} label="×k" labelDy={-18} />
        <VA_Pt x={760} y={480} label="C′" show={s >= 3} delay={400} color={c.clayHex} />
        <Arrow x1={746} y1={492} x2={538} y2={592} show={s >= 5} color={c.cool} label="×r⁻¹" labelDy={34} />
        <VA_Pt x={520} y={600} label="C" show={s >= 5} delay={400} dy={50} />
        {/* G₂: G₂ → K */}
        <VA_Pt x={1200} y={480} label="G₂" show={s >= 1} color={c.cool} />
        <Arrow x1={1216} y1={480} x2={1540} y2={480} show={s >= 1} color={c.clayHex} label="×k" labelDy={-14} />
        <VA_Pt x={1560} y={480} label="K" show={s >= 1} delay={400} color={c.cool} />
        {/* G_T */}
        <rect x={480} y={750} width={960} height={200} rx={14} style={{ fill: c.card, stroke: c.violet, strokeWidth: 1.5 }} />
        <T x={504} y={786} size={24} anchor="start" color={c.violet}>
          G<tspan style={{ baselineShift: 'sub', fontSize: 17 }}>T</tspan>
        </T>
        <Packet x1={760} y1={480} x2={800} y2={800} run={run && s === 4} color={c.clayHex} />
        <Packet x1={1200} y1={480} x2={950} y2={800} run={run && s === 4} color={c.cool} delay={60} />
        <Packet x1={520} y1={380} x2={1090} y2={800} run={run && s === 4} color={c.ink} delay={120} />
        <Packet x1={1560} y1={480} x2={1250} y2={800} run={run && s === 4} color={c.cool} delay={180} />
        <Packet x1={520} y1={600} x2={820} y2={880} run={run && s === 6} color={c.ink} />
        <Packet x1={1200} y1={480} x2={950} y2={880} run={run && s === 6} color={c.cool} delay={60} />
        <Packet x1={300} y1={480} x2={1100} y2={880} run={run && s === 6} color={c.ink} delay={120} />
        <Packet x1={1560} y1={480} x2={1240} y2={880} run={run && s === 6} color={c.cool} delay={180} />
      </Canvas>
      <At x={560} y={778} w={800}>
        <Fade show={s >= 4} delay={600}>
          <div style={{ textAlign: 'center' }}>
            <M size={38}>
              <Up>e</Up>(C′, G₂) = <Up>e</Up>(B′, K) <VA_Ok />
            </M>
          </div>
        </Fade>
      </At>
      <At x={560} y={858} w={800}>
        <Fade show={s >= 6} delay={600}>
          <div style={{ textAlign: 'center' }}>
            <M size={38}>
              <Up>e</Up>(C, G₂) = <Up>e</Up>(Y, K) <VA_Ok />
            </M>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Explained via bytes: NUT-00 v3 test vector ─────────────────────────────

const VA_HEX_Y = '860d58e5aeda1376185436ed96412313424cc079e056d1dab595e6db4c2c9685fec7da052c8db68d88985b75a42388ad';
const VA_HEX_B = '8e88c5f6a93f653784a66b033a00e52128499e18b095c2a56f080d1c2a937ffc9ef4600804a48d087bbd1f662f6b068f';
const VA_HEX_CB = '8d52d7a6cbe5e99858d5c15c092d11a0c387c78917471211082a6e5afc2a79680dfa188fafe5d4a51c5398ce160e7a16';
const VA_HEX_C = 'b7a4881059133fd91a8753600d9a5e524c65d6224f6fe2d5aef9e59f1507fdad90b3b4d48ee46da5c8dfaa0b88e28b69';
const VA_HEX_K =
  'aa4edef9c1ed7f729f520e47730a124fd70662a904ba1074728114d1031e1572c6c886f6b57ec72a6178288c47c335771638533957d540a9d2370f17cc7ed5863bc0b995b8825e0ee1ea1e1e4d00dbae81f14b0bf3611b78c952aacab827a053';

const VA_Hex = ({ hex, first = true }: { hex: string; first?: boolean }) => (
  <span style={{ fontFamily: MONO, fontSize: 21, whiteSpace: 'nowrap' }}>
    {first ? <span style={{ color: c.clayHex }}>{hex.slice(0, 2)}</span> : hex.slice(0, 2)}
    {hex.slice(2)}
  </span>
);

const VA_HexRow = ({
  y,
  show,
  on,
  label,
  size,
  children,
}: {
  y: number;
  show: boolean;
  on: boolean;
  label: ReactNode;
  size: string;
  children: ReactNode;
}) => (
  <At x={120} y={y} w={1680}>
    <Fade show={show}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          padding: '6px 14px',
          margin: '0 -14px',
          borderRadius: 10,
          background: on ? c.claySoft : 'transparent',
          transition: `background 300ms ${EASE_OUT}`,
        }}
      >
        <div style={{ width: 300, flexShrink: 0 }}>
          <M size={29}>{label}</M>
          <div style={{ fontSize: 21, color: c.muted }}>{size}</div>
        </div>
        <div style={{ paddingTop: 6, lineHeight: 1.6 }}>{children}</div>
      </div>
    </Fade>
  </At>
);

const VA_BlsBytes: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BLS} lens="Explained via bytes" title="One v3 round trip, byte for byte" proc={proc}>
      <At x={120} y={258} w={1680}>
        <Note style={{ color: c.ink }}>
          NUT-00 test vector, v3 round trip: <M>x</M> = UTF-8 bytes of <VA_Mono>"test_message"</VA_Mono>, <M>r = 3</M>,{' '}
          <M>k = 2</M> (NUT-00 calls it <M>a</M>).
        </Note>
      </At>
      <VA_HexRow y={312} show={s >= 1} on={s === 1} label={<>Y = <Up>H</Up>(x)</>} size="G₁, 48 B">
        <VA_Hex hex={VA_HEX_Y} />
      </VA_HexRow>
      <VA_HexRow y={396} show={s >= 2} on={s === 2} label="B′ = 3·Y" size="G₁, 48 B">
        <VA_Hex hex={VA_HEX_B} />
      </VA_HexRow>
      <VA_HexRow y={480} show={s >= 3} on={s === 3} label="C′ = 2·B′" size="G₁, 48 B">
        <VA_Hex hex={VA_HEX_CB} />
      </VA_HexRow>
      <VA_HexRow y={564} show={s >= 4} on={s === 4} label="C = 3⁻¹·C′ = 2·Y" size="G₁, 48 B">
        <VA_Hex hex={VA_HEX_C} />
      </VA_HexRow>
      <VA_HexRow y={648} show={s >= 5} on={s === 5} label="K = 2·G₂" size="G₂, 96 B">
        <VA_Hex hex={VA_HEX_K.slice(0, 96)} />
        <br />
        <VA_Hex hex={VA_HEX_K.slice(96)} first={false} />
      </VA_HexRow>
      <At x={120} y={778} w={1680}>
        <Fade show={s >= 6}>
          <M size={34}>
            <Up>e</Up>(C, G₂) = <Up>e</Up>(Y, K)
          </M>
          <span style={{ fontSize: 24, color: c.muted }}>&nbsp;&nbsp;holds for these bytes.</span>
        </Fade>
      </At>
      <At x={120} y={846} w={1680}>
        <Fade show={s >= 1}>
          <Note>
            First byte, top three bits: <VA_Mono>0x80</VA_Mono> compressed, <VA_Mono>0x40</VA_Mono> point at infinity
            (never valid here), <VA_Mono>0x20</VA_Mono> sign of <M>y</M>. <VA_Mono color={c.clayHex}>86</VA_Mono> ={' '}
            <VA_Mono>100</VA_Mono>
            <VA_Mono color={c.dim}>00110</VA_Mono>, <VA_Mono color={c.clayHex}>b7</VA_Mono> = <VA_Mono>101</VA_Mono>
            <VA_Mono color={c.dim}>10111</VA_Mono>. Real v3 secrets are 33-byte points.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Perspective: receiver ──────────────────────────────────────────────────

const VA_BlsReceiver: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BLS} lens="Perspective: receiver" title="What a receiver checks, offline" proc={proc}>
      <Canvas>
        <Arrow x1={540} y1={440} x2={676} y2={500} show={s >= 4} color={c.muted} />
        <Arrow x1={540} y1={740} x2={676} y2={590} show={s >= 4} color={c.muted} />
        <Arrow x1={1000} y1={626} x2={1000} y2={700} show={s >= 5} color={c.muted} dashed />
      </Canvas>
      <VA_Box x={120} y={280} w={420} h={320} title="token" tone={s === 1 ? c.clayHex : c.rule} show={s >= 1}>
        <div style={{ fontSize: 26, lineHeight: 1.9 }}>
          <div>
            <M>(x₁, C₁)</M>&nbsp; amount 8
          </div>
          <div>
            <M>(x₂, C₂)</M>&nbsp; amount 2
          </div>
          <div>
            <M>(x₃, C₃)</M>&nbsp; amount 2
          </div>
        </div>
        <div style={{ color: c.muted, marginTop: 8 }}>
          no <M>r</M>, no DLEQ
        </div>
      </VA_Box>
      <VA_Box x={120} y={640} w={420} h={250} title="keyset, public" tone={s === 2 ? c.clayHex : c.rule} show={s >= 2}>
        <div style={{ fontSize: 26, lineHeight: 1.6 }}>
          <M>K₂, K₈ ∈ G₂</M>, 96 B each
        </div>
        <div style={{ color: c.muted, marginTop: 6 }}>
          fetched once: <VA_Mono>GET /v1/keys/{'{id}'}</VA_Mono>
        </div>
      </VA_Box>
      <VA_Box x={680} y={420} w={660} h={206} title="one batch check" tone={s >= 4 ? c.good : c.rule} show={s >= 3}>
        <div style={{ fontSize: 24 }}>
          <M>Yᵢ = hash_to_curve_G1(xᵢ)</M>
        </div>
        <div style={{ marginTop: 10, opacity: s >= 4 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>
          <M size={28}>
            <Up>e</Up>(Σ wᵢ·Cᵢ, G₂) = Π <Up>e</Up>(Σ wᵢ·Yᵢ, Kⱼ) <VA_Ok />
          </M>
        </div>
      </VA_Box>
      <VA_Box x={760} y={706} w={500} h={184} title="spent? only the mint knows" dashed tone={s === 5 ? c.clayHex : c.rule} show={s >= 5}>
        check state (NUT-07), or swap the proofs (NUT-03) to own fresh ones
      </VA_Box>
      <StepList>
        <StepItem n={1} step={s}>
          The token carries <M>(x, C)</M> per proof. No <M>r</M>, no DLEQ.
        </StepItem>
        <StepItem n={2} step={s}>
          The receiver fetches <M>K</M> per amount: public, 96 B each.
        </StepItem>
        <StepItem n={3} step={s}>
          It hashes each <M>x</M> to <M>Y</M> in <M>G₁</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          One batch pairing check covers all v3 proofs in the token.
        </StepItem>
        <StepItem n={5} step={s}>
          A valid signature is not an unspent one. That answer stays with the mint.
        </StepItem>
      </StepList>
      <At x={1380} y={760} w={420}>
        <Fade show={s >= 4}>
          <Note>
            On v1 and v2 keysets the same offline check needs the NUT-12 DLEQ proof and the sender's <M>r</M>.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Framing: verification without k ────────────────────────────────────────

const VA_VW = [420, 610, 650];

const VA_VRow = ({ n, s, check, secp, bls }: { n: number; s: number; check: ReactNode; secp: ReactNode; bls: ReactNode }) => (
  <VA_TR h={96} show={s >= n} hot={s === n}>
    <VA_TD w={VA_VW[0]}>{check}</VA_TD>
    <VA_TD w={VA_VW[1]} color={c.bad}>
      {secp}
    </VA_TD>
    <VA_TD w={VA_VW[2]} color={c.good}>
      {bls}
    </VA_TD>
  </VA_TR>
);

const VA_BlsWithoutK: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BLS} lens="Framing: verification without k" title="Who needs what, per check" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VA_TR head h={52}>
          <VA_TD head w={VA_VW[0]}>check</VA_TD>
          <VA_TD head w={VA_VW[1]}>secp256k1 keysets, v1 and v2</VA_TD>
          <VA_TD head w={VA_VW[2]} color={c.clayHex}>
            BLS12-381 keysets, v3
          </VA_TD>
        </VA_TR>
        <VA_VRow
          n={1}
          s={s}
          check={
            <>
              wallet checks <M>C′</M> after issuance
            </>
          }
          secp="a DLEQ proof from the mint, optional"
          bls={
            <M>
              <Up>e</Up>(C′, G₂) = <Up>e</Up>(B′, K)
            </M>
          }
        />
        <VA_VRow
          n={2}
          s={s}
          check="mint verifies an input"
          secp={
            <>
              <M>k·Y = C</M>: needs <M>k</M>
            </>
          }
          bls={
            <M>
              <Up>e</Up>(C, G₂) = <Up>e</Up>(Y, K)
            </M>
          }
        />
        <VA_VRow
          n={3}
          s={s}
          check="receiver verifies offline"
          secp={
            <>
              DLEQ proof plus the sender's <M>r</M>
            </>
          }
          bls="the same pairing, public data only"
        />
        <VA_VRow
          n={4}
          s={s}
          check="federation member verifies an input"
          secp={
            <>
              <M>k·Y</M> computed by <M>t</M> members together
            </>
          }
          bls={
            <>
              the same pairing with the aggregate <M>K</M>, locally
            </>
          }
        />
        <VA_VRow
          n={5}
          s={s}
          check={
            <>
              wallet checks member <M>i</M>'s share
            </>
          }
          secp="one DLEQ per share, then trust the interpolation"
          bls={
            <M>
              <Up>e</Up>(C′ᵢ, G₂) = <Up>e</Up>(B′, Kᵢ)
            </M>
          }
        />
      </At>
      <At x={120} y={820} w={1680}>
        <Fade show={s >= 4}>
          <Note>
            The secp cells in rows 4 and 5 are hypothetical: CDK federates only v3 keysets. Members verify inputs against
            the aggregate key in <VA_Mono>verify_proofs</VA_Mono>, as a batch from 8 proofs up.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Focus: the blind check ─────────────────────────────────────────────────

const VA_BlsBlindCheck: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_BLS} lens="Focus: the blind check"
      title={
        <>
          Checking <M>C′</M> before unblinding
        </>
      } proc={proc}>
      <Canvas>
        <Arrow x1={440} y1={362} x2={440} y2={404} show={s >= 2} color={c.muted} />
        <Arrow x1={440} y1={506} x2={440} y2={548} show={s >= 3} color={c.muted} />
        <Arrow x1={760} y1={600} x2={896} y2={600} show={s >= 4} color={c.bad} />
        <Arrow x1={440} y1={652} x2={440} y2={694} show={s >= 5} color={c.good} />
        <Arrow x1={440} y1={796} x2={440} y2={838} show={s >= 5} color={c.muted} />
      </Canvas>
      <VA_Box x={120} y={262} w={640} h={100} tone={s === 1 ? c.clayHex : c.cool} show={s >= 1} pad="14px 22px">
        wallet keeps, per output: <M>x</M>, <M>r</M>, <M>B′ = r·Y</M>
      </VA_Box>
      <VA_Box x={120} y={406} w={640} h={100} tone={s === 2 ? c.clayHex : c.rule} show={s >= 2} pad="14px 22px">
        response: <M>C′</M> per output; amount and keyset id must match the request
      </VA_Box>
      <VA_Box x={120} y={550} w={640} h={102} tone={s === 3 ? c.clayHex : c.good} fill={c.goodSoft} show={s >= 3} pad="14px 22px">
        <M size={30}>
          <Up>e</Up>(C′, G₂) ≟ <Up>e</Up>(B′, K)
        </M>
        <div style={{ fontSize: 22, color: c.muted }}>all outputs of the response in one batch</div>
      </VA_Box>
      <VA_Box x={900} y={550} w={440} h={102} tone={c.bad} fill={c.badSoft} show={s >= 4} pad="14px 22px">
        fails: reject the response; no proof is stored
      </VA_Box>
      <VA_Box x={120} y={696} w={640} h={100} tone={c.rule} show={s >= 5} pad="14px 22px">
        unblind: <M>C = r⁻¹·C′ = k·Y</M>
      </VA_Box>
      <VA_Box x={120} y={840} w={640} h={100} tone={c.rule} show={s >= 5} delay={150} pad="14px 22px">
        proof <M>(x, C)</M>; receivers later check <M>e(C, G₂) = e(Y, K)</M>
      </VA_Box>
      <StepList>
        <StepItem n={1} step={s}>
          For each requested output the wallet keeps <M>x</M>, <M>r</M> and <M>B′</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          The mint returns <M>C′</M>; amount and keyset id are checked first.
        </StepItem>
        <StepItem n={3} step={s}>
          Blind check with values the wallet already has.
        </StepItem>
        <StepItem n={4} step={s}>
          On failure the response is rejected before any proof exists.
        </StepItem>
        <StepItem n={5} step={s}>
          Unblind. The final check then holds by bilinearity.
        </StepItem>
      </StepList>
      <At x={1380} y={760} w={420}>
        <Fade show={s >= 3}>
          <Note>
            In a federation the wallet runs the same check per share, against <M>Kᵢ</M>. Code:{' '}
            <VA_Mono>validate_mint_response_signatures</VA_Mono>.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.1 Pairing check, expanded
// ═════════════════════════════════════════════════════════════════════════════

const VA_OF_PAIR = '1.1 Pairing check, expanded';

// ─── Beginner: bilinearity with small numbers ───────────────────────────────

const VA_EqRow = ({ y, n, s, eq, children }: { y: number; n: number; s: number; eq: ReactNode; children: ReactNode }) => (
  <>
    <At x={120} y={y} w={920} style={{ height: 80, display: 'flex', alignItems: 'center' }}>
      <Fade show={s >= n}>
        <M size={38} color={s === n ? c.ink : c.muted}>
          {eq}
        </M>
      </Fade>
    </At>
    <At x={1080} y={y} w={720} style={{ height: 80, display: 'flex', alignItems: 'center' }}>
      <Fade show={s >= n} delay={80}>
        <div style={{ fontSize: 24, lineHeight: 1.4, color: s === n ? c.ink : c.muted, transition: `color 300ms ${EASE_OUT}` }}>
          {children}
        </div>
      </Fade>
    </At>
  </>
);

const VA_PairBeginner: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_PAIR} lens="Beginner" title="Bilinearity with small numbers" proc={proc}>
      <At x={120} y={262} w={1680}>
        <div style={{ background: c.panel, borderRadius: 12, padding: '12px 24px', fontSize: 24, lineHeight: 1.45 }}>
          <M>e</M> takes a point of <M>G₁</M> and a point of <M>G₂</M> and returns an element of <M>
            G<sub>T</sub>
          </M>
          . Write{' '}
          <M>g = e(G₁, G₂)</M>. Bilinear means <M>e(a·P, b·Q) = e(P, Q)ᵃᵇ</M>.
        </div>
      </At>
      <VA_EqRow
        y={384}
        n={1}
        s={s}
        eq={
          <>
            <Up>e</Up>(<Hi>2</Hi>·G₁, <Hi color={c.cool}>3</Hi>·G₂) = g⁶
          </>
        }
      >
        Both multiples end up in the exponent: 2·3 = 6.
      </VA_EqRow>
      <VA_EqRow
        y={474}
        n={2}
        s={s}
        eq={
          <>
            <Up>e</Up>(<Hi>6</Hi>·G₁, G₂) = g⁶
          </>
        }
      >
        The factor 3 can move to the <M>G₁</M> side.
      </VA_EqRow>
      <VA_EqRow
        y={564}
        n={3}
        s={s}
        eq={
          <>
            <Up>e</Up>(G₁, <Hi color={c.cool}>6</Hi>·G₂) = g⁶
          </>
        }
      >
        Or both factors can move to the <M>G₂</M> side.
      </VA_EqRow>
      <VA_EqRow
        y={654}
        n={4}
        s={s}
        eq={
          <>
            <Up>e</Up>(<Hi>k</Hi>·Y, G₂) = <Up>e</Up>(Y, <Hi color={c.cool}>k</Hi>·G₂) = <Up>e</Up>(Y, K)
          </>
        }
      >
        The same move with the mint key: <M>k</M> leaves the signature and appears inside the public key <M>K</M>.
      </VA_EqRow>
      <VA_EqRow
        y={764}
        n={5}
        s={s}
        eq={
          <>
            <Up>e</Up>(9·G₁, G₂) = g⁹ = g³⁵ = <Up>e</Up>(5·G₁, 7·G₂)
          </>
        }
      >
        Toy check, mod 13: <M>Y = 5·G₁</M>, <M>k = 7</M>, <M>C = 9·G₁</M>. Equal, and <M>k</M> was never used.
      </VA_EqRow>
    </VarShell>
  );
};

// ─── Advanced: why the check is sound ───────────────────────────────────────

const VA_Arg = ({ y, n, s, title, children }: { y: number; n: number; s: number; title: string; children: ReactNode }) => (
  <At x={120} y={y} w={1680}>
    <Fade show={s >= n}>
      <div
        style={{
          borderLeft: `3px solid ${s === n ? c.clayHex : c.rule}`,
          paddingLeft: 22,
          transition: `border-color 300ms ${EASE_OUT}`,
        }}
      >
        <VA_Label color={s === n ? c.clayHex : c.muted}>{title}</VA_Label>
        <div style={{ fontSize: 24, lineHeight: 1.45, marginTop: 6 }}>{children}</div>
      </div>
    </Fade>
  </At>
);

const VA_PairAdvanced: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_PAIR} lens="Advanced" title="Why the pairing check is sound" proc={proc}>
      <VA_Arg y={262} n={1} s={s} title="properties used">
        <M size={30}>
          <Up>e</Up>(a·P, b·Q) = <Up>e</Up>(P, Q)ᵃᵇ,&nbsp;&nbsp; <Up>e</Up>(G₁, G₂) ≠ 1
        </M>
        <div>
          <M>
            G₁, G₂, G<sub>T</sub>
          </M>{' '}
          have prime order (255 bits). Type-3: no efficient map between <M>G₁</M> and <M>G₂</M>.
        </div>
      </VA_Arg>
      <VA_Arg y={400} n={2} s={s} title="the check accepts exactly one C">
        <M size={30}>
          <Up>e</Up>(C, G₂) = <Up>e</Up>(Y, K) = <Up>e</Up>(k·Y, G₂)&nbsp; ⇒ &nbsp;C = k·Y
        </M>
        <div>
          <M>P ↦ e(P, G₂)</M> is injective on <M>G₁</M>, because <M>e</M> is non-degenerate and the order is prime.
        </div>
      </VA_Arg>
      <VA_Arg y={538} n={3} s={s} title="forging">
        A new valid <M>(x, C)</M> needs <M>k·H(x)</M> from <M>K</M> and earlier signatures: a one-more CDH-type
        problem, with <M>H</M> modelled as a random oracle (blind BLS: Boldyreva, PKC 2003).
      </VA_Arg>
      <VA_Arg y={690} n={4} s={s} title="the blind check implies the final check">
        <M size={30}>C′ = k·B′ = k·r·Y&nbsp; ⇒ &nbsp;r⁻¹·C′ = k·Y</M>
        <div>
          After a passing blind check, the final check can fail only if the wallet used a wrong <M>r</M> or <M>Y</M>.
        </div>
      </VA_Arg>
      <VA_Arg y={828} n={5} s={s} title="not the pairing's job">
        Point validation (identity, subgroup). The spent set: a valid <M>(x, C)</M> passes every time. Batch weights
        that cannot be predicted before the <M>Cᵢ</M> are fixed.
      </VA_Arg>
    </VarShell>
  );
};

// ─── Graphical: the scalar moves across the pairing ─────────────────────────

type VA_ChipTone = 'g1' | 'g2' | 'key' | 'scalar';

const VA_Chip = ({
  x,
  label,
  tone,
  show = true,
  gone = false,
}: {
  x: number;
  label: ReactNode;
  tone: VA_ChipTone;
  show?: boolean;
  gone?: boolean;
}) => {
  const border = tone === 'g1' ? c.clayHex : tone === 'scalar' ? c.ink : c.cool;
  const bg = tone === 'g1' ? c.claySoft : tone === 'key' ? 'rgba(74, 127, 180, 0.22)' : tone === 'g2' ? c.coolSoft : c.card;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 482,
        width: 130,
        height: 100,
        boxSizing: 'border-box',
        borderRadius: 12,
        border: `2px solid ${border}`,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: show && !gone ? 1 : 0,
        transform: `translateX(${x}px) scale(${gone ? 0.96 : 1})`,
        transition: `transform 800ms ${EASE_IO}, opacity 450ms ${EASE_OUT}`,
      }}
    >
      <M size={50}>{label}</M>
    </div>
  );
};

const VA_Over = ({ x, w, show, children }: { x: number; w: number; show: boolean; children: ReactNode }) => (
  <At x={x} y={392} w={w}>
    <Fade show={show}>
      <div style={{ textAlign: 'center' }}>
        <M size={34} color={c.muted}>
          {children}
        </M>
      </div>
    </Fade>
  </At>
);

const VA_PairGraphical: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_PAIR} lens="Graphical" title="The scalar moves across the pairing" proc={proc}>
      <Canvas>
        <rect x={330} y={462} width={680} height={140} rx={16} style={{ fill: 'rgba(217, 119, 87, 0.05)', stroke: c.clayHex, strokeWidth: 1.5 }} />
        <rect x={1080} y={462} width={480} height={140} rx={16} style={{ fill: 'rgba(74, 127, 180, 0.05)', stroke: c.cool, strokeWidth: 1.5 }} />
        <T x={670} y={640} size={24} color={c.clayHex}>
          G₁
        </T>
        <T x={1320} y={640} size={24} color={c.cool}>
          G₂
        </T>
      </Canvas>
      <At x={186} y={452} w={140}>
        <M size={110}>
          <Up>e</Up>(
        </M>
      </At>
      <At x={1024} y={452} w={60}>
        <M size={110}>,</M>
      </At>
      <At x={1574} y={452} w={60}>
        <M size={110}>)</M>
      </At>
      <VA_Chip x={s >= 2 ? 420 : 350} label="r⁻¹" tone="scalar" show={s >= 1} gone={s >= 2} />
      <VA_Chip x={s >= 3 ? 1110 : s >= 2 ? 560 : 505} label="k" tone="scalar" show={s >= 1} gone={s >= 4} />
      <VA_Chip x={s >= 2 ? 590 : 660} label="r" tone="scalar" show={s >= 1} gone={s >= 2} />
      <VA_Chip x={s >= 3 ? 605 : s >= 2 ? 720 : 815} label="Y" tone="g1" show={s >= 1} />
      <VA_Chip x={s >= 3 ? 1270 : 1255} label="G₂" tone="g2" show={s >= 1} gone={s >= 4} />
      <VA_Chip x={1255} label="K" tone="key" show={s >= 4} />
      <VA_Over x={330} w={680} show={s === 1 || s >= 4}>
        C = r⁻¹·C′ = r⁻¹·k·r·Y
      </VA_Over>
      <VA_Over x={330} w={680} show={s === 2}>
        r⁻¹·r = 1
      </VA_Over>
      <VA_Over x={520} w={880} show={s === 3}>
        <Up>e</Up>(k·P, Q) = <Up>e</Up>(P, k·Q)
      </VA_Over>
      <VA_Over x={1080} w={480} show={s >= 4}>
        k·G₂ = K
      </VA_Over>
      <At x={120} y={700} w={1680}>
        <Fade show={s >= 5}>
          <div style={{ textAlign: 'center' }}>
            <M size={52}>
              <Up>e</Up>(C, G₂) = <Up>e</Up>(Y, K)
            </M>
          </div>
        </Fade>
        <Fade show={s >= 5} delay={150} style={{ marginTop: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <M size={32} color={c.muted}>
              blind check, same move: <Up>e</Up>(k·B′, G₂) = <Up>e</Up>(B′, K)
            </M>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Explained via code ─────────────────────────────────────────────────────

const VA_PairCode: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_PAIR} lens="Explained via code" title="The pairing check in nut01/bls.rs" proc={proc}>
      <At x={120} y={262} w={1220}>
        <VA_CodeBox>
          <VA_CL on={s === 1}>
            <VA_Cm>// verify_pairing: e(C, G2) == e(H(x), K)</VA_Cm>
          </VA_CL>
          <VA_CL on={s === 1}>let y = BlsG1PublicKey::hash_to_curve(secret);</VA_CL>
          <VA_CL on={s === 1}>pairing(&signature.point(), &G2Affine::generator())</VA_CL>
          <VA_CL on={s === 1}>{'    == pairing(&y.point(), &mint_pubkey.point())'}</VA_CL>
          <VA_CL />
          <VA_CL on={s === 2}>
            <VA_Cm>// batch_verify_pairing</VA_Cm>
          </VA_CL>
          <VA_CL on={s === 2}>let weights = derive_batch_weights(mint_pubkeys, signatures, messages);</VA_CL>
          <VA_CL on={s === 3}>weighted_signatures += G1Projective::from(signature.point()) * weight.scalar();</VA_CL>
          <VA_CL on={s === 3}>let weighted_message =</VA_CL>
          <VA_CL on={s === 3}>{'    G1Projective::from(BlsG1PublicKey::hash_to_curve(message).point()) * weight.scalar();'}</VA_CL>
          <VA_CL on={s === 3}>
            <VA_Cm>// summed per distinct mint key K_k</VA_Cm>
          </VA_CL>
          <VA_CL />
          <VA_CL on={s === 4}>terms.push(((-weighted_signatures).to_affine(), G2Prepared::from(G2Affine::generator())));</VA_CL>
          <VA_CL on={s === 4}>
            <VA_Cm>// plus one (sum of w_i * Y_i, K_k) term per key</VA_Cm>
          </VA_CL>
          <VA_CL on={s === 4}>multi_miller_loop(&term_refs).final_exponentiation() == Gt::identity()</VA_CL>
        </VA_CodeBox>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          One proof: two pairings, compared in{' '}
          <M>
            G<sub>T</sub>
          </M>
          .
        </StepItem>
        <StepItem n={2} step={s}>
          Weights from a SHA-256 transcript over all <M>(C, K, x)</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          One weighted sum of the <M>Cᵢ</M>; one sum of weighted <M>Yᵢ</M> per key.
        </StepItem>
        <StepItem n={4} step={s}>
          Negating the <M>C</M> sum makes a product that must be 1: one multi-Miller loop, one final exponentiation.
        </StepItem>
      </StepList>
      <At x={1380} y={740} w={420}>
        <Note>
          Excerpts from <VA_Mono>nut01/bls.rs</VA_Mono> in the <VA_Mono>cashu</VA_Mono> crate, branch{' '}
          <VA_Mono>bls-federation</VA_Mono>, abridged.
        </Note>
      </At>
    </VarShell>
  );
};

// ─── Perspective: attacker ──────────────────────────────────────────────────

const VA_XW = [60, 700, 920];

const VA_AtkRow = ({ n, s, attempt, stop }: { n: number; s: number; attempt: ReactNode; stop: ReactNode }) => (
  <VA_TR h={104} show={s >= n} hot={s === n}>
    <VA_TD w={VA_XW[0]} color={c.muted}>
      <VA_Mono>{n}</VA_Mono>
    </VA_TD>
    <VA_TD w={VA_XW[1]} color={c.bad}>
      {attempt}
    </VA_TD>
    <VA_TD w={VA_XW[2]}>{stop}</VA_TD>
  </VA_TR>
);

const VA_PairAttacker: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_PAIR} lens="Perspective: attacker" title="Attempts against the pairing check" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VA_TR head h={52}>
          <VA_TD head w={VA_XW[0]}>#</VA_TD>
          <VA_TD head w={VA_XW[1]}>attempt</VA_TD>
          <VA_TD head w={VA_XW[2]}>what stops it</VA_TD>
        </VA_TR>
        <VA_AtkRow
          n={1}
          s={s}
          attempt={
            <>
              Present <M>C</M> for a new secret <M>x</M> without <M>k</M>.
            </>
          }
          stop={
            <>
              It must equal <M>k·H(x)</M>; computing that from <M>K</M> and old signatures is a one-more CDH-type
              problem.
            </>
          }
        />
        <VA_AtkRow
          n={2}
          s={s}
          attempt={
            <>
              Publish, or slip in, the identity <M>O</M> as a key <M>K</M>.
            </>
          }
          stop={
            <>
              <M>e(Y, O) = 1</M>, so <M>C = O</M> would pass for every <M>x</M>. Identity points MUST be rejected; they
              fail on parse.
            </>
          }
        />
        <VA_AtkRow
          n={3}
          s={s}
          attempt={
            <>
              Send a <M>B′</M> with a small-order component.
            </>
          }
          stop={
            <>
              <M>C′ = k·B′</M> would leak <M>k</M> modulo that order. <M>B′</M> MUST lie in the prime-order subgroup.
            </>
          }
        />
        <VA_AtkRow
          n={4}
          s={s}
          attempt={
            <>
              In one batch, send <M>C₁ + Δ</M> and <M>C₂ − Δ</M>.
            </>
          }
          stop={
            <>
              An unweighted sum would still match. Weighted, the error is <M>(w₁ − w₂)·Δ</M>, and the <M>wᵢ</M> are
              hashed from the submitted <M>Cᵢ</M>.
            </>
          }
        />
        <VA_AtkRow
          n={5}
          s={s}
          attempt={
            <>
              Spend a valid <M>(x, C)</M> a second time.
            </>
          }
          stop={
            <>
              The pairing passes again. The spent set of <M>Y</M> values rejects it.
            </>
          }
        />
      </At>
    </VarShell>
  );
};

// ─── Framing: cost ──────────────────────────────────────────────────────────

const VA_Amt = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: 80,
      height: 56,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.rule}`,
      borderRadius: 10,
      background: c.card,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
    }}
  >
    {children}
  </div>
);

const VA_Strip = ({ y, n, show, kind }: { y: number; n: number; show: boolean; kind: 'ml' | 'fe' }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <GFade key={`${kind}${y}${i}`} show={show} delay={i * 35}>
        <rect
          x={460 + i * 48}
          y={y}
          width={40}
          height={40}
          rx={6}
          style={{
            fill: kind === 'ml' ? c.claySoft : 'rgba(122, 95, 166, 0.14)',
            stroke: kind === 'ml' ? c.clayHex : c.violet,
            strokeWidth: 1.5,
          }}
        />
      </GFade>
    ))}
  </>
);

const VA_StripLabel = ({ y, show, children }: { y: number; show: boolean; children: ReactNode }) => (
  <At x={120} y={y} w={320} style={{ height: 40, display: 'flex', alignItems: 'center' }}>
    <Fade show={show}>
      <span style={{ fontSize: 24 }}>{children}</span>
    </Fade>
  </At>
);

const VA_PairCost: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_PAIR} lens="Framing: cost" title="Verifying a swap with eight inputs" proc={proc}>
      <At x={120} y={262} w={1680}>
        <Fade show={s >= 1}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <VA_Amt>1</VA_Amt>
            <VA_Amt>1</VA_Amt>
            <VA_Amt>2</VA_Amt>
            <VA_Amt>2</VA_Amt>
            <VA_Amt>4</VA_Amt>
            <VA_Amt>8</VA_Amt>
            <VA_Amt>8</VA_Amt>
            <VA_Amt>16</VA_Amt>
            <span style={{ fontSize: 24, color: c.muted, marginLeft: 20 }}>8 inputs, 5 distinct amounts, so 5 keys</span>
          </div>
        </Fade>
      </At>
      <At x={120} y={354} w={1680}>
        <Fade show={s >= 2}>
          <VA_Label>
            eight separate checks, <VA_Mono>verify_pairing</VA_Mono>
          </VA_Label>
        </Fade>
      </At>
      <VA_StripLabel y={396} show={s >= 2}>
        Miller loops: <M size={28}>16</M>
      </VA_StripLabel>
      <VA_StripLabel y={450} show={s >= 2}>
        final exponentiations: <M size={28}>16</M>
      </VA_StripLabel>
      <At x={120} y={536} w={1680}>
        <Fade show={s >= 3}>
          <VA_Label>
            one batch, <VA_Mono>batch_verify_pairing</VA_Mono>
          </VA_Label>
        </Fade>
      </At>
      <VA_StripLabel y={578} show={s >= 3}>
        Miller loops: <M size={28}>6</M>
      </VA_StripLabel>
      <VA_StripLabel y={666} show={s >= 3}>
        final exponentiations: <M size={28}>1</M>
      </VA_StripLabel>
      <Canvas>
        <VA_Strip y={396} n={16} show={s >= 2} kind="ml" />
        <VA_Strip y={450} n={16} show={s >= 2} kind="fe" />
        <VA_Strip y={578} n={6} show={s >= 3} kind="ml" />
        <GFade show={s >= 3} delay={300}>
          <T x={480} y={646} size={24} font="math">
            G₂
          </T>
          <T x={528} y={646} size={24} font="math">
            K₁
          </T>
          <T x={576} y={646} size={24} font="math">
            K₂
          </T>
          <T x={624} y={646} size={24} font="math">
            K₄
          </T>
          <T x={672} y={646} size={24} font="math">
            K₈
          </T>
          <T x={720} y={646} size={24} font="math">
            K₁₆
          </T>
        </GFade>
        <VA_Strip y={666} n={1} show={s >= 3} kind="fe" />
      </Canvas>
      <At x={860} y={578} w={940}>
        <Fade show={s >= 3} delay={400}>
          <Note>
            plus 16 scalar multiplications in <M>G₁</M> (<M>wᵢ·Cᵢ</M>, <M>wᵢ·Yᵢ</M>) and 8 <VA_Mono>hash_to_curve_G1</VA_Mono>,
            which the separate checks also need
          </Note>
        </Fade>
      </At>
      <VA_Box x={120} y={760} w={1680} h={170} tone={c.clayHex} show={s >= 4} size={24}>
        Federation members batch from 8 proofs up (<VA_Mono>FEDERATION_BLS_PROOF_BATCH_MIN</VA_Mono>) and check smaller
        requests one by one. On the wire each v3 proof carries a 48-byte <M>C</M> (33 B on secp256k1); each 96-byte{' '}
        <M>K</M> is fetched once per keyset.
      </VA_Box>
    </VarShell>
  );
};

// ─── Focus: batch weights ───────────────────────────────────────────────────

const VA_Try = ({ ctr, hex, ok, show, delay = 0 }: { ctr: number; hex: string; ok: boolean; show: boolean; delay?: number }) => (
  <Fade show={show} delay={delay} y={6}>
    <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.7, whiteSpace: 'pre', color: ok ? c.ink : c.muted }}>
      ctr {ctr}{'  '}
      <span style={{ color: ok ? c.good : c.bad }}>{hex.slice(0, 2)}</span>
      {hex.slice(2)}…{'  '}
      <span style={{ color: ok ? c.good : c.bad }}>{ok ? '✓ accepted' : '✗ ≥ order'}</span>
    </div>
  </Fade>
);

const VA_PairWeights: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_PAIR} lens="Focus: batch weights" title="Batch weights from the transcript" proc={proc}>
      <At x={120} y={250} w={1680}>
        <Fade show={s >= 1}>
          <VA_Label>transcript, 340 bytes (NUT-00 batch test vector)</VA_Label>
          <div style={{ marginTop: 10 }}>
            <VA_Seg bytes="Cashu_BLS_Batch_v1" label="DST, 18 B" tone="type" />
            <VA_Seg bytes="acebf797…" label="C₁, 48 B" />
            <VA_Seg bytes="aa4edef9…" label="K, 96 B" tone="hash" />
            <VA_Seg bytes="0000000d" label="length, 4 B" tone="len" />
            <VA_Seg bytes="batch_proof_1" label="secret₁, 13 B" />
          </div>
          <div style={{ marginTop: 8 }}>
            <VA_Seg bytes="9776497a…" label="C₂, 48 B" />
            <VA_Seg bytes="aa4edef9…" label="K, 96 B" tone="hash" />
            <VA_Seg bytes="0000000d" label="length, 4 B" tone="len" />
            <VA_Seg bytes="batch_proof_2" label="secret₂, 13 B" />
          </div>
        </Fade>
      </At>
      <At x={120} y={470} w={1680}>
        <Fade show={s >= 2}>
          <VA_Label plain>challenge = SHA-256(transcript)</VA_Label>
          <div style={{ marginTop: 4 }}>
            <VA_Mono>539b5df396e82adab0760459590d38122d2552bc74f6bd860e915ff3b95e550a</VA_Mono>
          </div>
        </Fade>
      </At>
      <At x={120} y={568} w={900}>
        <Fade show={s >= 3}>
          <VA_Label plain>
            <M>w₁</M>, <M>i = 0</M>:&nbsp; <VA_Mono>h = SHA-256(challenge || u32_BE(i) || u32_BE(ctr))</VA_Mono>
          </VA_Label>
        </Fade>
        <div style={{ marginTop: 4 }}>
          <VA_Try ctr={0} hex="c076cec15e8da422" ok={false} show={s >= 3} delay={100} />
          <VA_Try ctr={1} hex="acb6f4c9bc73e982" ok={false} show={s >= 3} delay={220} />
          <VA_Try ctr={2} hex="b33665c6f7fc8d29" ok={false} show={s >= 3} delay={340} />
          <VA_Try ctr={3} hex="b5dd749e3661fd0b" ok={false} show={s >= 3} delay={460} />
          <VA_Try ctr={4} hex="0e7ff8be2ccb756d" ok show={s >= 3} delay={580} />
        </div>
        <Fade show={s >= 4} style={{ marginTop: 12 }}>
          <VA_Label plain>
            <M>w₂</M>, <M>i = 1</M>
          </VA_Label>
        </Fade>
        <VA_Try ctr={0} hex="6d026a181a6215b2" ok show={s >= 4} delay={100} />
      </At>
      <At x={1060} y={568} w={740}>
        <Fade show={s >= 3}>
          <VA_Label plain>
            accept iff <M>0 &lt; h &lt;</M> <VA_Mono>BLS_FR_ORDER</VA_Mono>
          </VA_Label>
          <div style={{ marginTop: 4 }}>
            <VA_Mono>73eda753299d7d48…00000001</VA_Mono>
          </div>
          <div style={{ fontSize: 24, color: c.muted, marginTop: 6, lineHeight: 1.4 }}>
            <M>≈ 0.45·2²⁵⁶</M>: about 55% of hashes are rejected. Rejection sampling MUST be used; reducing mod the order would bias the weights.
          </div>
        </Fade>
        <Fade show={s >= 5} style={{ marginTop: 28 }}>
          <M size={29}>
            <Up>e</Up>(w₁·C₁ + w₂·C₂, G₂) = <Up>e</Up>(w₁·Y₁ + w₂·Y₂, K)
          </M>
          <div style={{ fontSize: 24, color: c.muted, marginTop: 8, lineHeight: 1.4 }}>
            One key, so two Miller loops. The weights are public and fixed only after every <M>Cᵢ</M> is.
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.1 Keyset versions
// ═════════════════════════════════════════════════════════════════════════════

const VA_OF_KEYS = '1.1 Keyset versions';

const VA_ID_V3 = '02b7e077d020fabed456a6be138a8e20e9ef40b44d873fa12c005b656eb0cf99f6';

// ─── Beginner: a keyset and its name ────────────────────────────────────────

const VA_VerChip = ({ b, v, curve }: { b: string; v: string; curve: string }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      marginRight: 16,
      padding: '8px 16px',
      border: `1.5px solid ${b === '02' ? c.clayHex : c.rule}`,
      background: b === '02' ? c.claySoft : c.card,
      borderRadius: 10,
      fontSize: 24,
    }}
  >
    <VA_Mono size={24} color={c.clayHex}>
      {b}
    </VA_Mono>
    <span>
      {v}, {curve}
    </span>
  </div>
);

const VA_KeysBeginner: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_KEYS} lens="Beginner" title="A keyset, and the name of a keyset" proc={proc}>
      <Canvas>
        <Arrow x1={584} y1={480} x2={676} y2={480} show={s >= 3} color={c.muted} />
        <Arrow x1={884} y1={480} x2={956} y2={480} show={s >= 3} color={c.muted} delay={300} />
      </Canvas>
      <VA_Box x={120} y={280} w={460} h={400} title="keyset" tone={s <= 2 && s >= 1 ? c.clayHex : c.rule} show={s >= 1}>
        <div style={{ fontSize: 26, lineHeight: 1.6 }}>
          <div>
            amount 1 → <M>K₁</M>
          </div>
          <div>
            amount 2 → <M>K₂</M>
          </div>
          <div>
            amount 4 → <M>K₄</M>
          </div>
          <div>
            amount 8 → <M>K₈</M>
          </div>
          <div style={{ color: c.muted }}>…</div>
        </div>
        <Fade show={s >= 2} style={{ marginTop: 10, fontSize: 24, lineHeight: 1.45 }}>
          <div>unit: sat</div>
          <div>fee: input_fee_ppk</div>
        </Fade>
      </VA_Box>
      <VA_Box x={680} y={440} w={200} h={80} tone={c.rule} show={s >= 3} pad="0" size={24}>
        <div style={{ height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SHA-256</div>
      </VA_Box>
      <At x={960} y={424} w={380}>
        <Fade show={s >= 3} delay={400}>
          <VA_Seg bytes="02" label="version" tone="type" />
          <VA_Seg bytes="32 bytes of hash" label="from the data" tone="hash" />
        </Fade>
      </At>
      <At x={120} y={716} w={1220}>
        <Fade show={s >= 4}>
          <VA_Label>test vector from NUT-02: amounts 1 and 2, unit sat</VA_Label>
          <div style={{ marginTop: 6 }}>
            <VA_Mono size={22}>
              <span style={{ color: c.clayHex }}>{VA_ID_V3.slice(0, 2)}</span>
              {VA_ID_V3.slice(2)}
            </VA_Mono>
          </div>
        </Fade>
      </At>
      <At x={120} y={836} w={1220}>
        <Fade show={s >= 5}>
          <VA_VerChip b="00" v="v1" curve="secp256k1" />
          <VA_VerChip b="01" v="v2" curve="secp256k1" />
          <VA_VerChip b="02" v="v3" curve="BLS12-381" />
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The mint has one key pair per amount and publishes the public keys.
        </StepItem>
        <StepItem n={2} step={s}>
          Keys, unit and fee together form a keyset.
        </StepItem>
        <StepItem n={3} step={s}>
          Hashing that data gives 32 bytes; a version byte in front makes the ID.
        </StepItem>
        <StepItem n={4} step={s}>
          A real ID, from the spec's test vectors.
        </StepItem>
        <StepItem n={5} step={s}>
          The first byte tells the wallet which protocol to run.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced: rules across NUTs ────────────────────────────────────────────

const VA_NutRow = ({ nut, on, children }: { nut: string; on: boolean; children: ReactNode }) => (
  <VA_TR h={66} hot={on}>
    <VA_TD w={150} color={c.clayHex}>
      <VA_Mono size={22} color={c.clayHex}>
        {nut}
      </VA_Mono>
    </VA_TD>
    <VA_TD w={1530}>{children}</VA_TD>
  </VA_TR>
);

const VA_KeysAdvanced: Page = () => {
  const proc = useProcess(3, 2600);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_KEYS} lens="Advanced" title="v3 keysets: the rules, NUT by NUT" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VA_TR head h={52}>
          <VA_TD head w={150}>NUT</VA_TD>
          <VA_TD head w={1530}>rule for keysets with version byte 02</VA_TD>
        </VA_TR>
        <VA_NutRow nut="NUT-01" on={s === 1}>
          Public keys are compressed <M>G₂</M> points: 96 bytes, 192 hex characters.
        </VA_NutRow>
        <VA_NutRow nut="NUT-02" on={s === 1}>
          ID = <VA_Mono>02</VA_Mono> ‖ SHA-256 over length-framed keys, unit and fee. <VA_Mono>final_expiry</VA_Mono> is not
          committed. The unit MUST match <VA_Mono>[a-z0-9_-]+</VA_Mono>.
        </VA_NutRow>
        <VA_NutRow nut="NUT-00" on={s === 2}>
          <VA_Mono>Proof.secret</VA_Mono> is a 33-byte compressed secp256k1 key (66 hex). Mints MUST reject any other form.
        </VA_NutRow>
        <VA_NutRow nut="NUT-00" on={s === 2}>
          <M>B′, C′, C</M> and <M>K</M> MUST be canonical, not the identity, and in the prime-order subgroup.
        </VA_NutRow>
        <VA_NutRow nut="NUT-12" on={s === 2}>
          No <VA_Mono>dleq</VA_Mono> field on a v3 <VA_Mono>BlindSignature</VA_Mono> or <VA_Mono>Proof</VA_Mono>; receivers
          SHOULD treat one as malformed.
        </VA_NutRow>
        <VA_NutRow nut="NUT-03" on={s === 3}>
          Every v3 input MUST carry a witness over its input digest. Keyset versions mix freely within one swap.
        </VA_NutRow>
        <VA_NutRow nut="NUT-02" on={s === 3}>
          New outputs MUST use active keysets. Proofs from inactive keysets remain valid inputs.
        </VA_NutRow>
        <VA_NutRow nut="NUT-13" on={s === 3}>
          Blinding factors are rejection-sampled below <VA_Mono>BLS_FR_ORDER</VA_Mono>; the secret branch derives a key
          whose public key is the secret.
        </VA_NutRow>
      </At>
      <At x={120} y={880} w={1680}>
        <Note>
          Groups: keys and ID; signing and verifying; spending, rotation and derivation. Source: cashubtc/nuts#443.
        </Note>
      </At>
    </VarShell>
  );
};

// ─── Graphical: sizes to scale ──────────────────────────────────────────────

const VA_PX = 12; // pixels per byte

const VA_Bar = ({
  y,
  bytes,
  show,
  color,
  ver = false,
  delay = 0,
}: {
  y: number;
  bytes: number;
  show: boolean;
  color: string;
  ver?: boolean;
  delay?: number;
}) => {
  const len = bytes * VA_PX;
  return (
    <g>
      <line
        x1={400}
        y1={y}
        x2={400 + len}
        y2={y}
        style={{
          stroke: color,
          strokeWidth: 36,
          strokeLinecap: 'butt',
          strokeDasharray: len,
          strokeDashoffset: show ? 0 : len,
          transition: `stroke-dashoffset ${REDUCED ? 0 : 700}ms ${EASE_IO} ${show ? delay : 0}ms`,
        }}
      />
      {ver && (
        <GFade show={show} delay={delay + 500}>
          <rect x={400} y={y - 18} width={VA_PX} height={36} style={{ fill: c.ink }} />
        </GFade>
      )}
      <T x={400 + len + 18} y={y + 9} size={26} anchor="start" show={show} delay={delay + 500}>
        {bytes} B
      </T>
    </g>
  );
};

const VA_KeysGraphical: Page = () => {
  const proc = useProcess(3, 2000);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_KEYS} lens="Graphical" title="Sizes to scale" proc={proc}>
      <Canvas>
        <T x={120} y={300} size={24} anchor="start" color={c.muted} show={s >= 1}>
          keyset ID
        </T>
        <T x={120} y={349} size={24} anchor="start" show={s >= 1}>
          v1 · 00
        </T>
        <VA_Bar y={340} bytes={8} show={s >= 1} color={c.node} ver />
        <T x={120} y={409} size={24} anchor="start" show={s >= 1}>
          v2 · 01
        </T>
        <VA_Bar y={400} bytes={33} show={s >= 1} color={c.node} ver delay={80} />
        <T x={120} y={469} size={24} anchor="start" show={s >= 1}>
          v3 · 02
        </T>
        <VA_Bar y={460} bytes={33} show={s >= 1} color={c.clayHex} ver delay={160} />
        <T x={120} y={540} size={24} anchor="start" color={c.muted} show={s >= 2}>
          public key, per amount
        </T>
        <T x={120} y={589} size={24} anchor="start" show={s >= 2}>
          secp256k1
        </T>
        <VA_Bar y={580} bytes={33} show={s >= 2} color={c.node} />
        <T x={120} y={649} size={24} anchor="start" show={s >= 2}>
          G₂
        </T>
        <VA_Bar y={640} bytes={96} show={s >= 2} color={c.cool} delay={80} />
        <T x={120} y={720} size={24} anchor="start" color={c.muted} show={s >= 3}>
          signature C, per proof
        </T>
        <T x={120} y={769} size={24} anchor="start" show={s >= 3}>
          secp256k1
        </T>
        <VA_Bar y={760} bytes={33} show={s >= 3} color={c.node} />
        <T x={120} y={829} size={24} anchor="start" show={s >= 3}>
          G₁
        </T>
        <VA_Bar y={820} bytes={48} show={s >= 3} color={c.clayHex} delay={80} />
        <GFade show={s >= 1}>
          <line x1={400} y1={910} x2={400 + 16 * VA_PX} y2={910} style={{ stroke: c.muted, strokeWidth: 2 }} />
          <line x1={400} y1={900} x2={400} y2={920} style={{ stroke: c.muted, strokeWidth: 2 }} />
          <line x1={400 + 16 * VA_PX} y1={900} x2={400 + 16 * VA_PX} y2={920} style={{ stroke: c.muted, strokeWidth: 2 }} />
          <T x={400 + 16 * VA_PX + 18} y={918} size={22} anchor="start" color={c.muted}>
            16 bytes
          </T>
        </GFade>
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via timeline: rotating to v3 ─────────────────────────────────

const VA_TX = [280, 600, 920, 1240, 1560];

const VA_KeysTimeline: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  const run = proc.anim;
  const tone = (i: number) => (s === i ? c.clayHex : c.rule);
  return (
    <VarShell of={VA_OF_KEYS} lens="Explained via timeline" title="Moving a running mint to v3" proc={proc}>
      <Canvas>
        <line x1={160} y1={400} x2={1760} y2={400} style={{ stroke: c.line, strokeWidth: 3 }} />
        <Dot x={VA_TX[0]} y={400} show={s >= 1} ring={s === 1} />
        <Dot x={VA_TX[1]} y={400} show={s >= 2} ring={s === 2} />
        <Dot x={VA_TX[2]} y={400} show={s >= 3} ring={s === 3} />
        <Dot x={VA_TX[3]} y={400} show={s >= 4} ring={s === 4} />
        <Dot x={VA_TX[4]} y={400} show={s >= 5} ring={s === 5} />
        <Packet x1={VA_TX[0]} y1={400} x2={VA_TX[1]} y2={400} run={run && s === 2} color={c.clayHex} />
        <Packet x1={VA_TX[1]} y1={400} x2={VA_TX[2]} y2={400} run={run && s === 3} color={c.clayHex} />
        <Packet x1={VA_TX[2]} y1={400} x2={VA_TX[3]} y2={400} run={run && s === 4} color={c.clayHex} />
        <Packet x1={VA_TX[3]} y1={400} x2={VA_TX[4]} y2={400} run={run && s === 5} color={c.clayHex} />
        <T x={VA_TX[0]} y={360} size={26} show={s >= 1}>
          running
        </T>
        <T x={VA_TX[1]} y={360} size={26} show={s >= 2}>
          upgrade
        </T>
        <T x={VA_TX[2]} y={360} size={26} show={s >= 3}>
          rotate
        </T>
        <T x={VA_TX[3]} y={360} size={26} show={s >= 4}>
          transition
        </T>
        <T x={VA_TX[4]} y={360} size={26} show={s >= 5}>
          after
        </T>
      </Canvas>
      <VA_Box x={VA_TX[0] - 150} y={450} w={300} h={330} tone={tone(1)} show={s >= 1} size={22}>
        An active secp256k1 keyset, v1 or v2. Wallets hold secp proofs.
      </VA_Box>
      <VA_Box x={VA_TX[1] - 150} y={450} w={300} h={330} tone={tone(2)} show={s >= 2} size={22}>
        Deploy a build with v3 support. The active keyset stays active; nothing rotates implicitly.
      </VA_Box>
      <VA_Box x={VA_TX[2] - 150} y={450} w={300} h={330} tone={tone(3)} show={s >= 3} size={22}>
        <VA_Mono>rotate-next-keyset</VA_Mono>
        <br />
        <VA_Mono>--keyset-version v3</VA_Mono>
        <div style={{ marginTop: 8 }}>creates a v3 keyset for the unit and marks the old one inactive.</div>
      </VA_Box>
      <VA_Box x={VA_TX[3] - 150} y={450} w={300} h={330} tone={tone(4)} show={s >= 4} size={22}>
        New outputs come only from the active v3 keyset. Old secp proofs remain valid inputs; wallets SHOULD swap them
        first. One swap may mix keyset versions.
      </VA_Box>
      <VA_Box x={VA_TX[4] - 150} y={450} w={300} h={330} tone={tone(5)} show={s >= 5} size={22}>
        v3 proofs: point secrets, a witness on every input, no DLEQ. Only v3 keysets can be federated.
      </VA_Box>
      <At x={120} y={830} w={1680}>
        <Fade show={s >= 3}>
          <Note>
            Sources: NUT-02 (active keysets), NUT-03 (mixed versions), <VA_Mono>cdk-mint-rpc</VA_Mono> (
            <VA_Mono>rotate-next-keyset</VA_Mono>).
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Perspective: wallet ────────────────────────────────────────────────────

const VA_KeysWallet: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_KEYS} lens="Perspective: wallet" title="One byte selects the protocol" proc={proc}>
      <Canvas>
        <GFade show={s >= 1}>
          <circle cx={230} cy={600} r={82} style={{ fill: c.card, stroke: c.clayHex, strokeWidth: 2.5 }} />
          <text x={230} y={609} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 26, fill: c.ink }}>
            id[0]
          </text>
        </GFade>
        <T x={230} y={726} size={22} color={c.muted} show={s >= 1}>
          first byte of the ID
        </T>
        <Arrow x1={290} y1={544} x2={414} y2={420} show={s >= 2} color={c.node} />
        <Arrow x1={290} y1={656} x2={414} y2={780} show={s >= 3} color={c.clayHex} />
      </Canvas>
      <VA_Box x={420} y={262} w={920} h={300} title="00, 01: secp256k1, NUT-00 legacy" tone={s === 2 ? c.clayHex : c.rule} show={s >= 2}>
        <VA_Li color={c.node}>
          hash_to_curve: SHA-256 try-and-increment, <VA_Mono>Secp256k1_HashToCurve_Cashu_</VA_Mono>
        </VA_Li>
        <VA_Li color={c.node}>
          blind <M>B′ = Y + r·G</M>, unblind <M>C = C′ − r·K</M>
        </VA_Li>
        <VA_Li color={c.node}>
          check <M>C′</M>: the DLEQ proof, if the mint sent one (NUT-12)
        </VA_Li>
        <VA_Li color={c.node}>secret: a random string, or a NUT-10 JSON secret</VA_Li>
      </VA_Box>
      <VA_Box x={420} y={620} w={920} h={300} title="02: BLS12-381" tone={s === 3 ? c.clayHex : c.rule} show={s >= 3}>
        <VA_Li>hash_to_curve_G1: RFC 9380 suite with the Cashu DST</VA_Li>
        <VA_Li>
          blind <M>B′ = r·Y</M>, unblind <M>C = r⁻¹·C′</M>
        </VA_Li>
        <VA_Li>
          check <M>C′</M>: pairing with <M>K</M>, batched; a <VA_Mono>dleq</VA_Mono> field is rejected
        </VA_Li>
        <VA_Li>secret: a 33-byte point; every input carries a witness</VA_Li>
      </VA_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Signatures and proofs name their keyset. The ID's first byte is the version.
        </StepItem>
        <StepItem n={2} step={s}>
          <VA_Mono>00</VA_Mono> and <VA_Mono>01</VA_Mono>: the secp256k1 protocol.
        </StepItem>
        <StepItem n={3} step={s}>
          <VA_Mono>02</VA_Mono>: the BLS12-381 protocol and point secrets.
        </StepItem>
        <StepItem n={4} step={s}>
          In CDK: <VA_Mono>construct_proofs</VA_Mono> and <VA_Mono>blind_message_for_version</VA_Mono> match on{' '}
          <VA_Mono>keyset_id.get_version()</VA_Mono>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: what v3 keeps and changes ─────────────────────────────────────

const VA_KeysKeepChange: Page = () => {
  const proc = useProcess(3, 2600);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_KEYS} lens="Framing: what v3 keeps and what it changes" title="What stays, what changes" proc={proc}>
      <VA_Box x={120} y={262} w={820} h={480} title="unchanged" tone={c.good} show={s >= 1} size={24}>
        <VA_Li color={c.good} gap={14}>
          endpoints and message shapes: <VA_Mono>BlindedMessage</VA_Mono> {'{amount, id, B_}'},{' '}
          <VA_Mono>BlindSignature</VA_Mono> {'{amount, id, C_}'}, <VA_Mono>Proof</VA_Mono> {'{amount, id, secret, C}'}
        </VA_Li>
        <VA_Li color={c.good} gap={14}>
          33-byte keyset IDs, as in v2; the short ID is the first 8 bytes
        </VA_Li>
        <VA_Li color={c.good} gap={14}>
          one public key per amount; rotation through active and inactive keysets
        </VA_Li>
        <VA_Li color={c.good} gap={14}>
          double-spend protection: the mint records <M>Y</M> and rejects a repeat
        </VA_Li>
      </VA_Box>
      <VA_Box x={980} y={262} w={820} h={480} title="changed on v3" tone={c.clayHex} show={s >= 2} size={24}>
        <VA_Li gap={10}>
          curve: <M>K ∈ G₂</M>, 96 B; <M>B′, C′, C ∈ G₁</M>, 48 B
        </VA_Li>
        <VA_Li gap={10}>
          <VA_Mono>hash_to_curve_G1</VA_Mono>; blinding <M>r·Y</M>, unblinding <M>r⁻¹·C′</M>
        </VA_Li>
        <VA_Li gap={10}>
          verification by pairing with <M>K</M>; DLEQ removed
        </VA_Li>
        <VA_Li gap={10}>ID preimage: binary, length-framed; expiry not committed</VA_Li>
        <VA_Li gap={10}>secrets are 33-byte points; every input carries a witness</VA_Li>
        <VA_Li gap={10}>
          V4 tokens carry <VA_Mono>si</VA_Mono> (spend info) for v3 proofs
        </VA_Li>
        <VA_Li gap={10}>threshold issuance: CDK federates only v3 keysets</VA_Li>
      </VA_Box>
      <At x={120} y={786} w={1680}>
        <Fade show={s >= 3}>
          <Note style={{ fontSize: 26, color: c.ink }}>
            A client that only parses the JSON sees the same fields. The values in them are longer and live on another
            curve.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Focus: the keyset ID preimage ──────────────────────────────────────────

const VA_PreRow = ({ y, show, label, children }: { y: number; show: boolean; label: ReactNode; children: ReactNode }) => (
  <At x={120} y={y} w={1680}>
    <Fade show={show}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ width: 230, flexShrink: 0, fontSize: 23, color: c.muted, paddingTop: 6 }}>{label}</div>
        <div>{children}</div>
      </div>
    </Fade>
  </At>
);

const VA_KeysPreimage: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VA_OF_KEYS} lens="Focus: the keyset ID preimage" title="A v3 keyset ID, byte by byte" proc={proc}>
      <VA_PreRow y={258} show={s >= 1} label="keys, length">
        <VA_Seg bytes="000000d2" label="len32(keys) = 210" tone="len" />
      </VA_PreRow>
      <VA_PreRow y={346} show={s >= 2} label="amount 1">
        <VA_Seg bytes="00000001" label="len32" tone="len" />
        <VA_Seg bytes="01" label="amount" tone="type" />
        <VA_Seg bytes="00000060" label="len32 = 96" tone="len" />
        <VA_Seg bytes="8d0273f6…" label="G₂ key, 96 B" tone="hash" />
      </VA_PreRow>
      <VA_PreRow y={434} show={s >= 2} label="amount 2">
        <VA_Seg bytes="00000001" label="len32" tone="len" />
        <VA_Seg bytes="02" label="amount" tone="type" />
        <VA_Seg bytes="00000060" label="len32 = 96" tone="len" />
        <VA_Seg bytes="8bf78a97…" label="G₂ key, 96 B" tone="hash" />
      </VA_PreRow>
      <VA_PreRow y={522} show={s >= 3} label="unit, fee">
        <VA_Seg bytes="00000003" label="len32" tone="len" />
        <VA_Seg bytes="736174" label={'"sat"'} />
        <VA_Seg bytes="00000000" label="len32 = 0" tone="len" />
        <VA_Seg bytes="(empty)" label="fee 0: no bytes" />
      </VA_PreRow>
      <VA_PreRow y={622} show={s >= 4} label="SHA-256, 225 B">
        <VA_Seg bytes="b7e077d020fabed456a6be138a8e20e9ef40b44d873fa12c005b656eb0cf99f6" label="32 bytes" tone="hash" />
      </VA_PreRow>
      <VA_PreRow y={712} show={s >= 4} label="keyset ID">
        <div style={{ paddingTop: 6 }}>
          <VA_Mono size={22}>
            <span style={{ color: c.clayHex }}>{VA_ID_V3.slice(0, 2)}</span>
            {VA_ID_V3.slice(2)}
          </VA_Mono>
          <div style={{ fontSize: 21, color: c.muted, marginTop: 4 }}>version byte 02, then the hash: 33 bytes</div>
        </div>
      </VA_PreRow>
      <VA_Box x={120} y={820} w={1680} h={120} tone={c.rule} fill={c.panel} show={s >= 5} size={24}>
        v2 for comparison: SHA-256 over the ASCII string{' '}
        <VA_Mono>amount:pubkey_hex,…|unit:sat[|input_fee_ppk:…][|final_expiry:…]</VA_Mono>, prefix{' '}
        <VA_Mono>01</VA_Mono>. v3 frames every field with a 4-byte length and leaves expiry out.
      </VA_Box>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Deck
// ═════════════════════════════════════════════════════════════════════════════

const PAGES: [Page, string | undefined][] = [
  [VA_Cover, undefined],

  // System model
  [Model, 'Original slide.'],
  [
    VA_ModelBeginner,
    'Beginner. The same five members drawn once per threshold, with every symbol defined and the arithmetic written out for n = 5. Say: f members may misbehave, c must agree on the order, t shares make a signature, q members must see a payment.',
  ],
  [
    VA_ModelAdvanced,
    'Advanced. The validation rules as the code enforces them: ThresholdParams::validate, validate_bft_safety and the payment observation policy, with the admissible t and q for common n. The quorum intersection is the reason for c = n − f: two committing sets always share an honest member.',
  ],
  [
    VA_ModelGraphical,
    'Graphical. Two planes: wallets talk to every public URL, members talk to each other on a private mesh where AlephBFT orders operations. Let the animation carry it: fan-out, ordering, one log entry, three shares back, one interpolated signature.',
  ],
  [
    VA_ModelSequence,
    "Sequence diagram of one request, from the wallet's side. The request fans out, every member submits an envelope, AlephBFT fixes one order, members apply it, and shares come back. Point out that m2 and m5 are slow and the wallet does not wait for them.",
  ],
  [
    VA_ModelMember,
    'Perspective of one member: what it holds, the two endpoints it exposes, when it returns a share, and what it can do alone. The last card is the point: a member can verify anything, but it cannot sign, commit or confirm a payment by itself.',
  ],
  [
    VA_ModelFaults,
    'Failure-mode framing at n = 5. One offline member changes nothing; two offline members stop ordering and therefore signing, although three shares would exist. A Byzantine member can neither block nor sign alone. Close on why t below c is safe only because signing follows ordering.',
  ],
  [
    VA_ModelBeforeAfter,
    'Before and after: a standalone v3 mint against the five-member federation, row by row. Issuance, ordering and payment acceptance change; the public key, the proof and what a receiver needs stay the same.',
  ],

  // Blind DH on secp256k1
  [Bdhke, 'Original slide.'],
  [
    VA_BdhkeBeginner,
    'Beginner. NUT-00 once through, in a 13-point toy group where every point is written as a multiple of G. Walk the rows: hash, blind with r = 3, sign with k = 7, unblind with the public key, check at redemption. Stress that the last check uses k.',
  ],
  [
    VA_BdhkeAdvanced,
    'Advanced. The exact hash_to_curve construction, the unblinding algebra including a wrong-key signature, the NUT-12 DLEQ equations, and the failure modes: a reused DLEQ nonce leaks k, repeated secrets are rejected, and without DLEQ a wrong-key signature goes unnoticed until redemption.',
  ],
  [
    VA_BdhkeGraphical,
    'Graphical. Points drawn as bars: Y plus the blinding term r·G, stretched by k at the mint, and r·K cancelling the blinding term on the way back. The last row is the mint recomputing k·Y at redemption.',
  ],
  [
    VA_BdhkeCode,
    'The same protocol read from cashu::dhke on the bls-federation branch: blind, sign, unblind, verify. The point is in the last block: verify_message takes the secret key as an argument.',
  ],
  [
    VA_BdhkeMint,
    "The mint's view. At issuance it sees B′, a uniformly random point; at redemption it sees x and C. For every pair there is exactly one r that connects them, so the two records cannot be linked.",
  ],
  [
    VA_BdhkeConstraint,
    'Framing: the constraint behind the design. The NUT-00 check needs k. With one mint that is fine; with k split across members every check becomes a t-member computation, and offline checks need a DLEQ protocol for shared keys that does not exist. So v3 needs a check over public values.',
  ],
  [
    VA_BdhkeBlinding,
    'Focus on the blinding factor, with toy numbers. Two values of r give different B′ but the same C, so B′ carries nothing about Y. The third column is what unblinding cannot detect: a mint signing with another key yields a point that verifies under no key.',
  ],

  // Blind BLS on BLS12-381
  [BlsFlow, 'Original slide.'],
  [
    VA_BlsBeginner,
    'Beginner. Blind BLS in toy groups of 13 elements, where the pairing multiplies the multiples. Walk the ladder: hash, blind by multiplication, sign, check the blind signature, unblind with the inverse of r, and the final check that anyone can run without k.',
  ],
  [
    VA_BlsAdvanced,
    'Advanced. The v3 MUST rules, each paired with what breaks without it: small-subgroup key leakage, identity keys that accept everything, biased blinding factors, secrets without a key, hashing with known discrete logs, and DLEQ on the wrong curve.',
  ],
  [
    VA_BlsGraphical,
    'Graphical. One panel per group and a box for the pairing target. Y, B′, C′ and C live in G₁, the key lives in G₂, and each check feeds one point from each group into the pairing.',
  ],
  [
    VA_BlsBytes,
    'The NUT-00 v3 test vector byte for byte: Y, B′, C′, C and K with their sizes. Point at the first byte of each point, which carries the compression and sign flags. The pairing equality holds for exactly these bytes.',
  ],
  [
    VA_BlsReceiver,
    "Receiver's perspective. A token carries only x and C; the receiver fetches the public keys, hashes the secrets and runs one batch pairing check, offline. What it cannot learn offline is whether the proofs are unspent.",
  ],
  [
    VA_BlsWithoutK,
    'Framing: who needs what, per check. On secp keysets every check needs k or a DLEQ proof; on v3 every check is a pairing against public keys. The two federation rows are why the design moved to BLS.',
  ],
  [
    VA_BlsBlindCheck,
    'Focus on the blind check. The wallet checks C′ against B′ and K before unblinding, in one batch per response, and rejects the response if it fails. After a passing blind check the final check holds by bilinearity.',
  ],

  // Pairing check
  [Pairing, 'Original slide.'],
  [
    VA_PairBeginner,
    'Beginner. Bilinearity with small numbers: multiples go into the exponent and can move between the two arguments. Then the same move with the mint key, and a toy check that holds without ever using k.',
  ],
  [
    VA_PairAdvanced,
    'Advanced. The soundness argument in five parts: the properties used, why the check accepts exactly one C, what a forger would have to solve, why the blind check implies the final check, and what the pairing does not cover.',
  ],
  [
    VA_PairGraphical,
    'Graphical. The pairing as two slots. The blinding factors cancel, the scalar k slides from the G₁ slot to the G₂ slot, and k·G₂ becomes K. Name each move as it happens.',
  ],
  [
    VA_PairCode,
    'The check as implemented in nut01/bls.rs. The single check compares two pairings; the batch derives weights, forms the sums, negates the signature term and runs one multi-Miller loop with one final exponentiation.',
  ],
  [
    VA_PairAttacker,
    "Attacker's perspective: five attempts and what stops each. Forging needs k·H(x); identity keys and small-subgroup points are rejected; batch errors cannot cancel because the weights depend on the submitted signatures; a replay is stopped by the spent set, not by the pairing.",
  ],
  [
    VA_PairCost,
    'Framing: cost. Eight inputs under five keys: sixteen Miller loops and sixteen final exponentiations one by one, against six Miller loops and one final exponentiation as a batch. Federation members switch to the batch from eight proofs.',
  ],
  [
    VA_PairWeights,
    'Focus on the batch weights, with the NUT-00 vector: the 340-byte transcript, its SHA-256 challenge, and rejection sampling. The first weight is accepted only at counter 4, the second at counter 0. The weights are public; what matters is that they are fixed after the signatures.',
  ],

  // Keyset versions
  [Keysets, 'Original slide.'],
  [
    VA_KeysBeginner,
    'Beginner. A keyset is one public key per amount plus unit and fee; its ID is a hash of that data with a version byte in front. Show the real v3 test-vector ID and the three version bytes.',
  ],
  [
    VA_KeysAdvanced,
    'Advanced. Every rule that applies to version-02 keysets, one row per NUT, in three groups: keys and ID; signing and verifying; spending, rotation and derivation.',
  ],
  [
    VA_KeysGraphical,
    'Graphical. Sizes to scale: keyset IDs, the public key per amount, and the signature per proof, secp256k1 against BLS12-381. The 96-byte G₂ key is the one that stands out.',
  ],
  [
    VA_KeysTimeline,
    "An operator's timeline for moving a running mint to v3: an upgrade without implicit rotation, an explicit rotate-next-keyset with version v3, a transition in which old secp proofs remain valid inputs, and the state afterwards.",
  ],
  [
    VA_KeysWallet,
    'Wallet perspective. The first byte of the keyset ID selects the whole protocol: hash-to-curve, blinding, the check on C′, and the secret format. In CDK this is one match on keyset_id.get_version().',
  ],
  [
    VA_KeysKeepChange,
    "Framing: what stays and what changes. The messages keep their shape and the ID keeps its width; the curve, the checks, the ID preimage, the secret format and the token's spend info change.",
  ],
  [
    VA_KeysPreimage,
    'Focus on the keyset ID preimage byte by byte, with the NUT-02 test vector for amounts 1 and 2: length-framed keys, the unit and an empty fee, 225 bytes, one SHA-256, version byte 02. The v2 format is an ASCII string and also commits the expiry.',
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · BLS blind signatures (temporary)',
  createdAt: '2026-09-28T09:10:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
