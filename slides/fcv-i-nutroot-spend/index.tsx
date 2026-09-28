import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  Arrow,
  At,
  Canvas,
  Draw,
  EASE_IO,
  EASE_OUT,
  Fade,
  GFade,
  InternalKey,
  Label,
  Lifeline,
  M,
  MONO,
  Note,
  NutrootSpends,
  Packet,
  REDUCED,
  ScriptVerify,
  SpendInfo,
  StepItem,
  StepList,
  T,
  VarCover,
  VarShell,
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

// ─── Local helpers ───────────────────────────────────────────────────────────

type VI_Tone = 'idle' | 'on' | 'cool' | 'good' | 'bad' | 'dim';
const VI_TB: Record<VI_Tone, string> = {
  idle: c.node,
  on: c.clayHex,
  cool: c.cool,
  good: c.good,
  bad: c.bad,
  dim: c.rule,
};
const VI_TF: Record<VI_Tone, string> = {
  idle: c.card,
  on: c.claySoft,
  cool: c.coolSoft,
  good: c.goodSoft,
  bad: c.badSoft,
  dim: c.card,
};

const VI_enter = (show: boolean, delay = 0, dy = 8): CSSProperties => ({
  opacity: show ? 1 : 0,
  transform: show || REDUCED ? 'translateY(0px)' : `translateY(${dy}px)`,
  transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
});

/** Inline monospace token (hex, JSON), never wrapped. */
const VI_Mono = ({ children, size = 21, color }: { children: ReactNode; size?: number; color?: string }) => (
  <span style={{ fontFamily: MONO, fontSize: size, color, whiteSpace: 'nowrap' }}>{children}</span>
);

/** One line inside a box, with a small top gap. */
const VI_L = ({ children, gap = 6, color }: { children: ReactNode; gap?: number; color?: string }) => (
  <div style={{ marginTop: gap, color }}>{children}</div>
);

/** Normative keyword. */
const VI_Kw = ({ children }: { children: ReactNode }) => (
  <span style={{ color: c.clayHex, letterSpacing: '0.04em' }}>{children}</span>
);

const VI_Ok = () => <span style={{ color: c.good, fontFamily: MONO }}> ✓</span>;
const VI_No = () => <span style={{ color: c.bad, fontFamily: MONO }}> ✗</span>;

/** Absolute card with an optional label. */
const VI_Box = ({
  x,
  y,
  w,
  h,
  title,
  tone = 'dim',
  show = true,
  delay = 0,
  size = 22,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  title?: ReactNode;
  tone?: VI_Tone;
  show?: boolean;
  delay?: number;
  size?: number;
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
      border: `1.5px solid ${VI_TB[tone]}`,
      background: VI_TF[tone],
      borderRadius: 12,
      padding: '14px 22px',
      ...VI_enter(show, delay),
    }}
  >
    {title && <Label color={tone === 'dim' || tone === 'idle' ? c.muted : VI_TB[tone]}>{title}</Label>}
    <div style={{ fontSize: size, lineHeight: 1.45, marginTop: title ? 8 : 0 }}>{children}</div>
  </div>
);

/** Centered HTML node for figures. */
const VI_Node = ({
  x,
  y,
  w = 240,
  h = 64,
  tone = 'idle',
  show = true,
  delay = 0,
  dashed = false,
  size = 23,
  sub,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  tone?: VI_Tone;
  show?: boolean;
  delay?: number;
  dashed?: boolean;
  size?: number;
  sub?: ReactNode;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${VI_TB[tone]}`,
      background: VI_TF[tone],
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      ...VI_enter(show, delay, 6),
    }}
  >
    <div style={{ fontSize: size, lineHeight: 1.2, color: tone === 'bad' ? c.bad : c.ink }}>{children}</div>
    {sub && <div style={{ fontFamily: MONO, fontSize: 21, color: c.muted, marginTop: 3 }}>{sub}</div>}
  </div>
);

/** Table row with auto height. */
const VI_Tr = ({
  children,
  head = false,
  show = true,
  hot = false,
  delay = 0,
}: {
  children: ReactNode;
  head?: boolean;
  show?: boolean;
  hot?: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: head ? '8px 0' : '12px 0',
      borderBottom: `1px solid ${head ? c.line : c.rule}`,
      background: hot ? c.claySoft : 'transparent',
      ...VI_enter(show, delay, 6),
    }}
  >
    {children}
  </div>
);

const VI_Td = ({
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
      fontSize: head ? 20 : size,
      lineHeight: head ? 1.3 : 1.4,
      letterSpacing: head ? '0.08em' : undefined,
      textTransform: head ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
    }}
  >
    {children}
  </div>
);

/** A byte segment with a caption underneath. */
const VI_Chip = ({
  bytes,
  cap,
  hot = false,
  type = false,
  show = true,
  delay = 0,
}: {
  bytes: ReactNode;
  cap?: ReactNode;
  hot?: boolean;
  type?: boolean;
  show?: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: 10,
      ...VI_enter(show, delay, 6),
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 21,
        padding: '5px 10px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${hot || type ? c.clayHex : c.rule}`,
        background: hot || type ? c.claySoft : c.card,
        transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      {bytes}
    </span>
    {cap && <span style={{ fontSize: 21, color: c.muted, marginTop: 4, whiteSpace: 'nowrap' }}>{cap}</span>}
  </div>
);

/** SVG path that draws itself (normalized length). */
const VI_Path = ({
  d,
  show,
  color = c.node,
  width = 2,
  delay = 0,
  dur = 800,
  dashed = false,
}: {
  d: string;
  show: boolean;
  color?: string;
  width?: number;
  delay?: number;
  dur?: number;
  dashed?: boolean;
}) =>
  dashed ? (
    <GFade show={show} delay={delay}>
      <path d={d} style={{ fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: '6 6' }} />
    </GFade>
  ) : (
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
        opacity: show ? 1 : 0,
        transition: `stroke-dashoffset ${REDUCED ? 0 : dur}ms ${EASE_IO} ${show ? delay : 0}ms, opacity 150ms ${EASE_OUT} ${show ? delay : 0}ms, stroke 300ms ${EASE_OUT}`,
      }}
    />
  );

/** Arrowhead at (x, y), pointing away from (fx, fy). */
const VI_Head = ({
  x,
  y,
  fx,
  fy,
  show = true,
  color = c.node,
  delay = 0,
}: {
  x: number;
  y: number;
  fx: number;
  fy: number;
  show?: boolean;
  color?: string;
  delay?: number;
}) => {
  const a = Math.atan2(y - fy, x - fx);
  const k = 13;
  const p1 = `${x - k * Math.cos(a - 0.45)},${y - k * Math.sin(a - 0.45)}`;
  const p2 = `${x - k * Math.cos(a + 0.45)},${y - k * Math.sin(a + 0.45)}`;
  return (
    <polyline
      points={`${p1} ${x},${y} ${p2}`}
      style={{
        fill: 'none',
        stroke: color,
        strokeWidth: 2.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        opacity: show ? 1 : 0,
        transition: `opacity 200ms ${EASE_OUT} ${show ? delay : 0}ms`,
      }}
    />
  );
};

/** Horizontal size bar against a fixed maximum. */
const VI_Bar = ({
  label,
  value,
  max,
  w,
  lw = 300,
  show = true,
  delay = 0,
  color = c.clayHex,
}: {
  label: ReactNode;
  value: number;
  max: number;
  w: number;
  lw?: number;
  show?: boolean;
  delay?: number;
  color?: string;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', height: 44 }}>
    <span style={{ width: lw, flexShrink: 0, fontSize: 22, color: c.ink }}>{label}</span>
    <span style={{ position: 'relative', width: w, height: 20, flexShrink: 0 }}>
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: 20,
          width: (value / max) * w,
          borderRadius: 4,
          background: color,
          transformOrigin: 'left center',
          transform: show || REDUCED ? 'scaleX(1)' : 'scaleX(0)',
          transition: `transform 700ms ${EASE_IO} ${show ? delay : 0}ms`,
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: (value / max) * w + 12,
          top: -5,
          fontFamily: MONO,
          fontSize: 21,
          color: c.ink,
          whiteSpace: 'nowrap',
          opacity: show ? 1 : 0,
          transition: `opacity 300ms ${EASE_OUT} ${show ? delay + 400 : 0}ms`,
        }}
      >
        {value}
      </span>
    </span>
  </div>
);

const VI_OF1 = '2.3 Key path and script path';
const VI_OF2 = '2.3 Script path verification';
const VI_OF3 = '2.3 Three forms of internal key';
const VI_OF4 = '2.4 Spend info and receive-time checks';

// ═════════════════════════════════════════════════════════════════════════════
// Cover
// ═════════════════════════════════════════════════════════════════════════════

const VI_Cover: Page = () => (
  <VarCover
    section="2.3–2.4"
    title="Nutroot spends and spend info"
    sources={[
      { n: '2.3', title: 'Key path and script path', count: 7 },
      { n: '2.3', title: 'Script path verification', count: 7 },
      { n: '2.3', title: 'Three forms of internal key', count: 7 },
      { n: '2.4', title: 'Spend info and receive-time checks', count: 8 },
    ]}
  />
);

// ═════════════════════════════════════════════════════════════════════════════
// 1 · Key path and script path
// ═════════════════════════════════════════════════════════════════════════════

const VI_SpendsBeginner: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VI_OF1} lens="Beginner" title="One secret, two ways to spend it" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Fade show={s >= 1}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
            <M size={40}>P = K + t·G</M>
            <span style={{ fontSize: 24, color: c.muted }}>the proof's secret: one 33-byte public key</span>
          </div>
          <div style={{ fontSize: 22, color: c.muted, lineHeight: 1.45, marginTop: 10 }}>
            <M>K</M> internal public key, <M>k</M> its private key · <M>t</M> tweak: a hash of <M>K</M> and the
            conditions, read as a number · <M>G</M> generator point · <M>n</M> curve order
          </div>
          <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 8 }}>
            NUT-10 example: one condition, "from 2025-08-19 key 4 may sign" ·{' '}
            <VI_Mono>P = 02d310a4…9ef8f828</VI_Mono>
          </div>
        </Fade>
      </At>
      <VI_Box x={120} y={500} w={595} h={390} title="Key path · Carol" tone={s === 2 ? 'on' : 'dim'} show={s >= 2} size={23}>
        <VI_L gap={0}>
          Carol holds <M>k</M>, so she can compute the private key of <M>P</M>:
        </VI_L>
        <VI_L gap={10}>
          <M size={30}>p′ = (k + t) mod n</M>
        </VI_L>
        <VI_L>
          <VI_Mono>= 31b2e906…78d008e7</VI_Mono>
        </VI_L>
        <VI_L gap={14}>She signs the input digest once:</VI_L>
        <VI_L>
          <VI_Mono>{'{"signatures":["619e0726…583bd510"]}'}</VI_Mono>
        </VI_L>
        <VI_L gap={14} color={c.muted}>
          The mint checks the signature against <M>P</M>. The condition is never shown.
        </VI_L>
      </VI_Box>
      <VI_Box
        x={745}
        y={500}
        w={595}
        h={390}
        title="Script path · Alice"
        tone={s >= 3 ? 'on' : 'dim'}
        show={s >= 3}
        size={23}
      >
        <VI_L gap={0}>
          Alice holds key 4, not <M>k</M>. She reveals:
        </VI_L>
        <VI_L>the leaf: after · n = 1 · key 4 · time 1755561600</VI_L>
        <VI_L>
          the internal key <VI_Mono>K = 03a3e12c…3a419e51</VI_Mono>
        </VI_L>
        <VI_L>
          the path <VI_Mono>[ ]</VI_Mono>: the tree has one leaf
        </VI_L>
        <VI_L>and a signature by key 4.</VI_L>
        <Fade show={s >= 4}>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${c.rule}` }}>
            Mint: leaf → root → <M>t</M> → is <M>K + t·G = P</M>? Then: clock ≥ 1755561600, and key 4 signed?
          </div>
        </Fade>
      </VI_Box>
      <StepList>
        <StepItem n={1} step={s}>
          A v3 secret is one public key <M>P</M>. The conditions are folded into it.
        </StepItem>
        <StepItem n={2} step={s}>
          Key path: sign with the private key of <M>P</M>. Nothing else is shown.
        </StepItem>
        <StepItem n={3} step={s}>
          Script path: show one condition, <M>K</M> and the neighbour hashes, then satisfy it.
        </StepItem>
        <StepItem n={4} step={s}>
          The mint rebuilds <M>P</M> from what was shown, then checks the condition.
        </StepItem>
        <Note style={{ marginTop: 16, fontSize: 21 }}>
          Neighbour hashes: the other branches of the tree, as hashes. With one leaf there are none.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VI_SpendsAdvanced: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF1} lens="Advanced" title="Spend-path rules and edge cases" proc={proc}>
      <VI_Box x={120} y={256} w={825} h={340} title="Key path · NUT-10" tone={s === 1 ? 'on' : 'dim'} show={s >= 1} size={23}>
        <VI_L gap={0}>
          <VI_Mono>{'{"signatures":["<128 hex>"]}'}</VI_Mono> with <VI_Kw>exactly one</VI_Kw> entry.
        </VI_L>
        <VI_L>
          Signer: <M>k</M> for a bare secret, <M>p′ = (k + t) mod n</M> for a tweaked one.
        </VI_L>
        <VI_L>
          Checked against x(<M>P</M>) over the input digest. BIP-340 signing negates <M>p′</M> when <M>P</M> has
          odd <M>y</M>.
        </VI_L>
        <VI_L>Bare and tweaked key-path spends are byte-identical.</VI_L>
        <VI_L color={c.muted}>Rejection vector: Carol's signature listed twice.</VI_L>
      </VI_Box>
      <VI_Box x={975} y={256} w={825} h={340} title="Script path · NUT-10" tone={s === 2 ? 'on' : 'dim'} show={s >= 2} size={23}>
        <VI_L gap={0}>
          <VI_Mono>leaf</VI_Mono> present selects the script path. <VI_Mono>control</VI_Mono> holds <M>K</M> (33 B)
          and <VI_Mono>path</VI_Mono> (<VI_Kw>at most 3</VI_Kw> × 32 B).
        </VI_L>
        <VI_L>
          No leaf-version byte, no parity bit: <M>K + t·G</M> is compared with the full 33-byte secret.
        </VI_L>
        <VI_L>
          <VI_Mono>signatures</VI_Mono> <VI_Kw>MUST NOT</VI_Kw> outnumber the leaf's keys. <VI_Mono>preimage</VI_Mono>:
          hashlock only, ≤ 32 B.
        </VI_L>
        <VI_L color={c.muted}>Mints MAY reject a serialized witness over 4096 characters.</VI_L>
      </VI_Box>
      <VI_Box x={120} y={626} w={825} h={340} title="Edge case · two keys, one x-coordinate" tone={s === 3 ? 'on' : 'dim'} show={s >= 3} size={23}>
        <VI_L gap={0}>
          One x-coordinate, two secrets: separate <M>Y</M>, separate spent-state entries.
        </VI_L>
        <VI_L>One scalar key-path spends both: signatures verify against x only. Tweaking keeps this.</VI_L>
        <VI_L>
          <VI_Mono>02f9308a…13bce036f9</VI_Mono> = <M>3·G</M> and <VI_Mono>03f9308a…13bce036f9</VI_Mono> ={' '}
          <M>(n − 3)·G</M>
        </VI_L>
        <VI_L color={c.muted}>
          Script paths bind the exact 33-byte secret. Leaf keys sharing an x-coordinate reject.
        </VI_L>
      </VI_Box>
      <VI_Box x={975} y={626} w={825} h={340} title="Edge case · witness scope" tone={s === 4 ? 'on' : 'dim'} show={s >= 4} size={23}>
        <VI_L gap={0}>
          A witness signs the input digest of one input in one transaction. It authorizes nothing elsewhere.
        </VI_L>
        <VI_L>Distinct inputs sign distinct digests: a witness verifies only at its own input.</VI_L>
        <VI_L>
          v3 proofs in serialized tokens <VI_Kw>MUST NOT</VI_Kw> carry a witness; wallets drop it when encoding or
          decoding.
        </VI_L>
      </VI_Box>
    </VarShell>
  );
};

const VI_SpendsGraphical: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  const rev = s >= 4;
  return (
    <VarShell of={VI_OF1} lens="Graphical" title="Two routes to the same point" proc={proc}>
      <Canvas>
        <T x={330} y={298} size={24} color={c.muted}>
          key path
        </T>
        <VI_Path d="M450 350 H1300 Q1410 350 1426 530" show={s >= 1} color={c.clayHex} width={3} dur={900} />
        <VI_Head x={1426} y={530} fx={1410} fy={350} show={s >= 1} color={c.clayHex} delay={750} />
        <T x={880} y={330} font="math" size={34} color={c.clayHex} show={s >= 1} delay={300}>
          p′ = k + t
        </T>
        <T x={880} y={392} size={22} color={c.muted} show={rev}>
          tree never shown
        </T>
        <Packet x1={450} y1={350} x2={1300} y2={350} run={proc.anim && s === 1} color={c.clayHex} dur={1000} />

        <T x={330} y={744} size={24} color={c.muted} show={s >= 2}>
          script path
        </T>
        <Arrow x1={430} y1={800} x2={688} y2={800} show={s >= 2} color={c.node} />
        <Arrow x1={655} y1={894} x2={733} y2={836} show={s >= 2} color={c.cool} delay={200} />
        <Arrow x1={865} y1={894} x2={787} y2={836} show={s >= 2} color={c.cool} delay={300} />
        <Packet x1={430} y1={800} x2={690} y2={800} run={proc.anim && s === 2} color={c.ink} />
        <Arrow x1={830} y1={800} x2={1048} y2={800} show={s >= 3} color={c.node} />
        <Arrow x1={1100} y1={710} x2={1100} y2={766} show={s >= 3} color={c.node} delay={150} />
        <VI_Path d="M1150 800 H1300 Q1410 800 1426 672" show={s >= 3} color={c.ink} width={3} delay={350} />
        <VI_Head x={1426} y={672} fx={1410} fy={800} show={s >= 3} color={c.ink} delay={1100} />
        <Packet x1={830} y1={800} x2={1300} y2={800} run={proc.anim && s === 3} color={c.ink} dur={1100} />

        <circle cx={1480} cy={600} r={74} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 2.5 }} />
        <T x={1480} y={618} font="math" size={54}>
          P
        </T>
        <T x={1480} y={712} size={24} color={c.muted}>
          secret
        </T>

        <GFade show={rev}>
          <rect x={1300} y={872} width={34} height={26} rx={5} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.75 }} />
          <T x={1348} y={893} size={22} anchor="start">
            revealed
          </T>
          <rect
            x={1300}
            y={920}
            width={34}
            height={26}
            rx={5}
            style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 1.75, strokeDasharray: '4 4' }}
          />
          <T x={1348} y={941} size={22} anchor="start">
            opaque hash
          </T>
        </GFade>
      </Canvas>
      <VI_Node x={330} y={350} w={240} tone="on" show={s >= 1}>
        signature
      </VI_Node>
      <VI_Node x={330} y={800} w={200} tone={rev ? 'on' : 'idle'} show={s >= 2}>
        leaf
      </VI_Node>
      <VI_Node x={760} y={800} w={140} show={s >= 2} delay={100}>
        root
      </VI_Node>
      <VI_Node x={640} y={920} w={90} h={52} tone="cool" dashed show={s >= 2} delay={200}>
        <M>h₀</M>
      </VI_Node>
      <VI_Node x={880} y={920} w={90} h={52} tone="cool" dashed show={s >= 2} delay={300}>
        <M>h₁</M>
      </VI_Node>
      <VI_Node x={1100} y={680} w={90} h={56} tone={rev ? 'on' : 'idle'} show={s >= 3}>
        <M>K</M>
      </VI_Node>
      <VI_Node x={1100} y={800} w={100} show={s >= 3} delay={100}>
        <M>t</M>
      </VI_Node>
    </VarShell>
  );
};

const VI_SpendsBytes: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VI_OF1} lens="Explained via bytes" title="The two witnesses, byte by byte" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Fade show={s >= 1}>
          <Label color={c.clayHex}>Carol · key path · 147 characters</Label>
          <div
            style={{
              marginTop: 8,
              fontFamily: MONO,
              fontSize: 21,
              lineHeight: 1.5,
              background: c.card,
              border: `1.5px solid ${s === 1 ? c.clayHex : c.rule}`,
              borderRadius: 12,
              padding: '10px 20px',
              whiteSpace: 'pre',
              transition: `border-color 300ms ${EASE_OUT}`,
            }}
          >
            {
              '{"signatures":["619e0726595b5adff06cc3e6ea1c409f10f7b064cf8888f0eed0efbac854eabf\n                4632642930bdc7c4d7d983379301a4f263991dbd19d96e5ebcfab9e8583bd510"]}'
            }
          </div>
        </Fade>
      </At>
      <At x={120} y={410} w={1220}>
        <Fade show={s >= 2}>
          <Label color={c.clayHex}>Alice · script path · 350 characters</Label>
        </Fade>
      </At>
      <At x={120} y={448} w={1220}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ width: 190, flexShrink: 0, paddingTop: 6, opacity: s >= 2 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>
            <VI_Mono color={c.muted}>"leaf":</VI_Mono>
          </span>
          <VI_Chip bytes="00" cap="version 0" show={s >= 2} hot={s === 2} />
          <VI_Chip bytes="02" cap="type after" type show={s >= 2} delay={40} />
          <VI_Chip bytes="02 0001 01" cap="n = 1" show={s >= 2} delay={80} />
          <VI_Chip bytes="04 0021 02e493…c4cd13" cap="keys: key 4" show={s >= 2} delay={120} />
          <VI_Chip bytes="06 0004 68a3be80" cap="time 1755561600" show={s >= 2} delay={160} />
        </div>
      </At>
      <At x={120} y={548} w={1220}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ width: 190, flexShrink: 0, paddingTop: 6, opacity: s >= 3 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>
            <VI_Mono color={c.muted}>"control":</VI_Mono>
          </span>
          <VI_Chip bytes="03a3e12c…3a419e51" cap="K, 33 bytes" show={s >= 3} hot={s === 3} />
          <VI_Chip bytes="[ ]" cap="path: no siblings" show={s >= 3} hot={s === 3} delay={60} />
        </div>
      </At>
      <At x={120} y={648} w={1220}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ width: 190, flexShrink: 0, paddingTop: 6, opacity: s >= 3 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }}>
            <VI_Mono color={c.muted}>"signatures":</VI_Mono>
          </span>
          <VI_Chip bytes="0b2ea247…6715873e" cap="64 bytes, by key 4" show={s >= 3} delay={120} />
        </div>
      </At>
      <At x={120} y={770} w={1220}>
        <Fade show={s >= 4}>
          <Label>Serialized length in characters, against the 4096 bound</Label>
          <div style={{ marginTop: 10 }}>
            <VI_Bar label="key path" value={147} max={4096} w={880} lw={220} show={s >= 4} />
            <VI_Bar label="script path" value={350} max={4096} w={880} lw={220} show={s >= 4} delay={120} />
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Key path: one field, one 64-byte BIP-340 signature by <M>p′</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Script path: the leaf's exact TLV bytes: version, type, then fields in ascending type order.
        </StepItem>
        <StepItem n={3} step={s}>
          <VI_Code>control</VI_Code>: <M>K</M> and the sibling path, empty for a one-leaf tree. Then the signatures.
        </StepItem>
        <StepItem n={4} step={s}>
          Both are compact JSON strings, far below the bound mints may enforce.
        </StepItem>
        <Note style={{ marginTop: 16, fontSize: 21 }}>
          NUT-10 worked example. The vector signatures sign an illustrative digest, not a real transcript.
        </Note>
      </StepList>
    </VarShell>
  );
};

/** Inline mono inside step items (24 px body). */
const VI_Code = ({ children }: { children: ReactNode }) => (
  <span style={{ fontFamily: MONO, fontSize: 22 }}>{children}</span>
);

const VI_MW = [280, 440, 560, 400];
const VI_SpendsMint: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VI_OF1} lens="Perspective: mint" title="What the mint learns per spend" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VI_Tr head>
          <VI_Td head w={VI_MW[0]}>Spend</VI_Td>
          <VI_Td head w={VI_MW[1]}>The mint receives</VI_Td>
          <VI_Td head w={VI_MW[2]}>The mint learns</VI_Td>
          <VI_Td head w={VI_MW[3]}>Checkstate returns</VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 1} hot={s === 1}>
          <VI_Td w={VI_MW[0]} color={c.muted}>
            Key path, bare <M>K</M>
          </VI_Td>
          <VI_Td w={VI_MW[1]}>
            <VI_Mono>{'{"signatures":[sig]}'}</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_MW[2]}>A valid signature for x(secret). Nothing more.</VI_Td>
          <VI_Td w={VI_MW[3]}>SPENT, commitment</VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 2} hot={s === 2}>
          <VI_Td w={VI_MW[0]} color={c.muted}>
            Key path, tweaked <M>P</M>
          </VI_Td>
          <VI_Td w={VI_MW[1]}>The same bytes</VI_Td>
          <VI_Td w={VI_MW[2]}>The same: not even whether conditions exist.</VI_Td>
          <VI_Td w={VI_MW[3]}>SPENT, commitment</VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 3} hot={s === 3}>
          <VI_Td w={VI_MW[0]} color={c.muted}>
            Script path
          </VI_Td>
          <VI_Td w={VI_MW[1]}>leaf, K, path, signatures, preimage if hashlock</VI_Td>
          <VI_Td w={VI_MW[2]}>That conditions exist, the leaf, K. Siblings stay opaque hashes.</VI_Td>
          <VI_Td w={VI_MW[3]}>SPENT, commitment</VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 4} hot={s === 4}>
          <VI_Td w={VI_MW[0]} color={c.muted}>
            Script path, disclosure leaf
          </VI_Td>
          <VI_Td w={VI_MW[1]}>The same</VI_Td>
          <VI_Td w={VI_MW[2]}>The same; the mint must publish the witness</VI_Td>
          <VI_Td w={VI_MW[3]}>SPENT, commitment, exact witness, input digest</VI_Td>
        </VI_Tr>
      </At>
      <VI_Box x={120} y={672} w={820} title="NUT-07 vector · key path, no disclosure" show={s >= 3} size={21}>
        <div style={{ fontFamily: MONO, lineHeight: 1.5 }}>
          <div>"state": "SPENT",</div>
          <div>"witness": null,</div>
          <div>"input_digest": null,</div>
          <div>"commitment": "80ef4c34…a9597f5b"</div>
        </div>
      </VI_Box>
      <VI_Box x={980} y={672} w={820} title="NUT-07 vector · auditable lock, disclosure leaf" show={s >= 4} size={21} tone={s === 4 ? 'on' : 'dim'}>
        <div style={{ fontFamily: MONO, lineHeight: 1.5 }}>
          <div>"state": "SPENT",</div>
          <div>"witness": "{'{'}\"leaf\":\"0001…0a000101\",…{'}'}",</div>
          <div>"input_digest": "1732e47d…686336d1",</div>
          <div>"commitment": "c682da9c…2a361ae4"</div>
        </div>
      </VI_Box>
      <At x={120} y={884} w={1680}>
        <Fade show={s >= 4}>
          <Note style={{ fontSize: 22 }}>
            <VI_Mono>commitment = tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash)</VI_Mono>. The
            transaction digest is never returned. A revealed <M>K</M> links every proof that shares it.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VI_CmpRow = ({
  y,
  show,
  hot,
  label,
  left,
  right,
}: {
  y: number;
  show: boolean;
  hot: boolean;
  label: string;
  left: ReactNode;
  right: ReactNode;
}) => (
  <>
    <At x={120} y={y + 18} w={220}>
      <Fade show={show}>
        <Label color={hot ? c.clayHex : c.muted}>{label}</Label>
      </Fade>
    </At>
    <VI_Box x={340} y={y} w={710} h={170} show={show} tone={hot ? 'idle' : 'dim'}>
      {left}
    </VI_Box>
    <VI_Box x={1090} y={y} w={710} h={170} show={show} tone={hot ? 'on' : 'dim'} delay={80}>
      {right}
    </VI_Box>
  </>
);

const VI_SpendsBip341: Page = () => {
  const proc = useProcess(3, 2600);
  const s = proc.step;
  return (
    <VarShell of={VI_OF1} lens="Framing: comparison with BIP341" title="Spend paths: BIP341 and nutroot side by side" proc={proc}>
      <At x={340} y={250} w={710}>
        <Label>BIP341 / BIP342</Label>
      </At>
      <At x={1090} y={250} w={710}>
        <Label color={c.clayHex}>Nutroot (NUT-10)</Label>
      </At>
      <VI_CmpRow
        y={290}
        show={s >= 1}
        hot={s === 1}
        label="Key path"
        left={
          <>
            <VI_Mono>[ signature ]</VI_Mono> 64 B, or 65 B with a sighash type byte.
            <VI_L>
              Signed by <M>q = p + t</M> (parity negation applies), verified against the 32-byte output key.
            </VI_L>
          </>
        }
        right={
          <>
            <VI_Mono>{'{"signatures":[sig]}'}</VI_Mono>, exactly one entry.
            <VI_L>
              Signed by <M>p′ = (k + t) mod n</M> over the input digest, verified against x(<M>P</M>).
            </VI_L>
          </>
        }
      />
      <VI_CmpRow
        y={484}
        show={s >= 2}
        hot={s === 2}
        label="Script path"
        left={
          <>
            <VI_Mono>[ inputs…, script, control ]</VI_Mono>
            <VI_L>
              control = (leaf version | parity) ‖ x(<M>P</M>) ‖ path: 33 + 32·m bytes, m ≤ 128.
            </VI_L>
          </>
        }
        right={
          <>
            <VI_Mono>{'{leaf, control:{K, path}, signatures, preimage?}'}</VI_Mono>
            <VI_L>
              <M>K</M> is 33 bytes, the path at most 3 hashes. The leaf carries its own version byte.
            </VI_L>
          </>
        }
      />
      <VI_CmpRow
        y={678}
        show={s >= 3}
        hot={s === 3}
        label="Check"
        left={
          <>
            TapLeaf hash → TapBranch per path hash → <M>t</M> = hash_TapTweak(x(<M>P</M>) ‖ root), fail if{' '}
            <M>t ≥ n</M> → x(<M>Q</M>) and parity must match → execute the script.
          </>
        }
        right={
          <>
            Leaf hash → sorted Branch per path hash → <M>t</M> over the 33-byte <M>K</M> and root, mod <M>n</M> →{' '}
            <M>K + t·G</M> must equal the secret → evaluate the declarative leaf.
          </>
        }
      />
    </VarShell>
  );
};

const VI_SpendsWorked: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const bar = (on: boolean): CSSProperties => ({
    transformBox: 'fill-box',
    transformOrigin: 'left center',
    transform: on || REDUCED ? 'scaleX(1)' : 'scaleX(0)',
    opacity: on ? 1 : 0,
    transition: `transform 800ms ${EASE_IO}, opacity 200ms ${EASE_OUT}`,
  });
  return (
    <VarShell of={VI_OF1} lens="Worked example end to end" title="Alice pays Carol with a refund leaf" proc={proc}>
      <Canvas>
        <T x={160} y={318} anchor="start" size={23} color={c.cool} show={s >= 2}>
          Carol · key path
        </T>
        <rect x={200} y={332} width={1100} height={14} rx={7} style={{ fill: c.cool, ...bar(s >= 2) }} />
        <T x={160} y={398} anchor="start" size={23} color={c.clayHex} show={s >= 3}>
          Alice · script path through the after leaf
        </T>
        <GFade show={s >= 3}>
          <line x1={200} y1={419} x2={820} y2={419} style={{ stroke: c.line, strokeWidth: 2, strokeDasharray: '4 8' }} />
        </GFade>
        <rect x={820} y={412} width={480} height={14} rx={7} style={{ fill: c.clayHex, ...bar(s >= 4) }} />
        <line x1={180} y1={480} x2={1318} y2={480} style={{ stroke: c.node, strokeWidth: 1.75 }} />
        <VI_Head x={1320} y={480} fx={1300} fy={480} color={c.node} />
        <line x1={820} y1={300} x2={820} y2={490} style={{ stroke: c.muted, strokeWidth: 1.5, strokeDasharray: '5 5' }} />
        <T x={200} y={514} anchor="start" size={22} color={c.muted}>
          issued
        </T>
        <T x={820} y={514} size={22} color={c.muted}>
          time 1755561600 · 2025-08-19
        </T>
        <T x={1320} y={514} anchor="end" size={22} color={c.muted}>
          mint clock
        </T>
      </Canvas>
      <VI_Box x={120} y={560} w={390} h={390} title="Construction" show={s >= 1} tone={s === 1 ? 'on' : 'dim'}>
        <VI_L gap={0}>
          <M>K = 3·G + r₀·G</M> (key 3, slot 0)
        </VI_L>
        <VI_L gap={2}>
          <VI_Mono>03a3e12c…3a419e51</VI_Mono>
        </VI_L>
        <VI_L gap={10}>root = hash of the one leaf</VI_L>
        <VI_L gap={2}>
          <VI_Mono>9ed9c0b8…0616589a</VI_Mono>
        </VI_L>
        <VI_L gap={10}>
          <M>t</M> = <VI_Mono>b3b7846b…5effe8a4</VI_Mono>
        </VI_L>
        <VI_L gap={10}>
          <M>P</M> = <VI_Mono>02d310a4…9ef8f828</VI_Mono>
        </VI_L>
      </VI_Box>
      <VI_Box x={535} y={560} w={390} h={390} title="Carol · key path" show={s >= 2} tone={s === 2 ? 'on' : 'dim'}>
        <VI_L gap={0}>
          <M>p′ = (3 + r₀ + t) mod n</M>
        </VI_L>
        <VI_L gap={2}>
          <VI_Mono>31b2e906…78d008e7</VI_Mono>
        </VI_L>
        <VI_L gap={10}>witness:</VI_L>
        <VI_L gap={2}>
          <VI_Mono>{'{"signatures":'}</VI_Mono>
        </VI_L>
        <VI_L gap={0}>
          <VI_Mono>{' ["619e0726…583bd510"]}'}</VI_Mono>
        </VI_L>
        <VI_L gap={10} color={c.good}>
          valid from issue on
        </VI_L>
      </VI_Box>
      <VI_Box x={950} y={560} w={390} h={390} title="Alice · script path" show={s >= 3} tone={s === 3 || s === 4 ? 'on' : 'dim'}>
        <VI_L gap={0}>leaf: after, n = 1, key 4, time 1755561600</VI_L>
        <VI_L gap={8}>
          control: <M>K</M>, path <VI_Mono>[ ]</VI_Mono>
        </VI_L>
        <VI_L gap={8}>signature by key 4:</VI_L>
        <VI_L gap={2}>
          <VI_Mono>0b2ea247…6715873e</VI_Mono>
        </VI_L>
        <VI_L gap={10} color={c.bad}>
          before time: step 4 rejects
          <VI_No />
        </VI_L>
        <Fade show={s >= 4}>
          <div style={{ marginTop: 4, color: c.good }}>
            from time on: verifies
            <VI_Ok />
          </div>
        </Fade>
      </VI_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Carol's static key 3, blinded at slot 0, gives <M>K</M>. One after leaf gives the root.
        </StepItem>
        <StepItem n={2} step={s}>
          Carol holds the key path from the start: one signature by <M>p′</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Before the time, Alice's script path fails the clock check.
        </StepItem>
        <StepItem n={4} step={s}>
          From the time on, Alice's leaf verifies: <M>K</M>, empty path, key 4 signs.
        </StepItem>
        <StepItem n={5} step={s}>
          The first valid spend burns <M>Y</M>; a later one is refused as spent.
        </StepItem>
        <Note style={{ marginTop: 12, fontSize: 21 }}>Vector signatures sign an illustrative digest.</Note>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 2 · Script path verification
// ═════════════════════════════════════════════════════════════════════════════

const VI_QRow = ({
  y,
  n,
  q,
  show,
  hot,
  children,
}: {
  y: number;
  n: number;
  q: string;
  show: boolean;
  hot: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      top: y,
      width: 1220,
      height: 140,
      boxSizing: 'border-box',
      display: 'flex',
      border: `1.5px solid ${hot ? c.clayHex : c.rule}`,
      background: c.card,
      borderRadius: 12,
      padding: '16px 24px',
      ...VI_enter(show),
    }}
  >
    <div style={{ width: 380, flexShrink: 0, display: 'flex', gap: 14 }}>
      <span style={{ fontFamily: MONO, fontSize: 22, color: hot ? c.clayHex : c.muted, paddingTop: 3 }}>{n}</span>
      <span style={{ fontSize: 26, lineHeight: 1.3 }}>{q}</span>
    </div>
    <div style={{ fontSize: 22, lineHeight: 1.45 }}>{children}</div>
  </div>
);

const VI_VerifyBeginner: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VI_OF2} lens="Beginner" title="Checking a script-path spend, one question at a time" proc={proc}>
      <VI_QRow y={256} n={1} q="Is the path short enough?" show={s >= 1} hot={s === 1}>
        path = <VI_Mono>[ ]</VI_Mono>: zero sibling hashes. At most 3 are allowed.
        <VI_Ok />
      </VI_QRow>
      <VI_QRow y={412} n={2} q="Does it rebuild the secret?" show={s >= 2} hot={s === 2}>
        <div>
          one leaf, so root = its hash = <VI_Mono>9ed9c0b8…0616589a</VI_Mono>
        </div>
        <div>
          <M>t</M> = hash of (<M>K</M>, root) = <VI_Mono>b3b7846b…5effe8a4</VI_Mono>
        </div>
        <div>
          <M>K + t·G</M> = <VI_Mono>02d310a4…9ef8f828</VI_Mono> = the proof's secret
          <VI_Ok />
        </div>
      </VI_QRow>
      <VI_QRow y={568} n={3} q="Can the leaf be read?" show={s >= 3} hot={s === 3}>
        <div>
          <VI_Mono>00</VI_Mono> version 0 · <VI_Mono>02</VI_Mono> after · n = 1 · keys: key 4 · time 1755561600
        </div>
        <div>
          Every part is known and in order.
          <VI_Ok />
        </div>
      </VI_QRow>
      <VI_QRow y={724} n={4} q="Is the condition met?" show={s >= 4} hot={s === 4}>
        <div>
          mint clock ≥ 1755561600 (2025-08-19)
          <VI_Ok />
        </div>
        <div>
          key 4 signed this input's digest
          <VI_Ok />
        </div>
        <div>
          1 distinct signing key, and n = 1
          <VI_Ok />
        </div>
      </VI_QRow>
      <VI_Box x={1380} y={256} w={420} title="Words used" size={22}>
        <VI_L gap={0}>
          <b style={{ fontWeight: 500 }}>leaf</b>: one condition, as bytes
        </VI_L>
        <VI_L>
          <b style={{ fontWeight: 500 }}>path</b>: sibling hashes on the way to the root
        </VI_L>
        <VI_L>
          <b style={{ fontWeight: 500 }}>root</b>: one hash covering all leaves
        </VI_L>
        <VI_L>
          <M>K</M>: the internal public key
        </VI_L>
        <VI_L>
          <M>t</M>: tweak, a hash read as a number
        </VI_L>
        <VI_L>
          <M>G</M>: the curve's generator point
        </VI_L>
        <VI_L>
          <b style={{ fontWeight: 500 }}>input digest</b>: the message each input signs
        </VI_L>
        <VI_L gap={14} color={c.muted}>
          Example: Alice's refund witness from the NUT-10 vectors.
        </VI_L>
      </VI_Box>
    </VarShell>
  );
};

const VI_AW = [110, 800, 770];
const VI_VerifyAdvanced: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF2} lens="Advanced" title="Verifier steps, rules and rejection vectors" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VI_Tr head>
          <VI_Td head w={VI_AW[0]}>Step</VI_Td>
          <VI_Td head w={VI_AW[1]}>Rule (NUT-10, MUST)</VI_Td>
          <VI_Td head w={VI_AW[2]}>Rejection vector or failure</VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 1} hot={s === 1}>
          <VI_Td w={VI_AW[0]}>
            <VI_Mono size={22}>1</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_AW[1]}>path holds at most 3 sibling hashes (8-leaf cap, normative fold)</VI_Td>
          <VI_Td w={VI_AW[2]}>A fourth hash rejects before any hashing.</VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 2} hot={s === 2}>
          <VI_Td w={VI_AW[0]}>
            <VI_Mono size={22}>2</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_AW[1]}>
            leaf hash, then Branch over sorted pairs; <M>t</M> = tagged_hash(Tweak, <M>K</M> ‖ root) mod <M>n</M>,
            never rejected; <M>K + t·G</M> equals the 33-byte secret
          </VI_Td>
          <VI_Td w={VI_AW[2]}>
            Wrong leaf, <M>K</M> or path: another point. The type 0x05 leaf of the two-leaf vector passes this step.
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 3} hot={s === 3}>
          <VI_Td w={VI_AW[0]}>
            <VI_Mono size={22}>3</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_AW[1]}>
            version 0x00, allocated type, known fields in strictly ascending order, disclosure only 0x01, minimal
            integers
          </VI_Td>
          <VI_Td w={VI_AW[2]}>
            type 0x05 · field 0x09 <VI_Mono>…090004deadbeef</VI_Mono> · disclosure <VI_Mono>0a000100</VI_Mono>,{' '}
            <VI_Mono>0a0000</VI_Mono>, <VI_Mono>0a000102</VI_Mono>
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 4} hot={s === 4}>
          <VI_Td w={VI_AW[0]}>
            <VI_Mono size={22}>4</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_AW[1]}>
            commit rejects; after: clock ≥ time; hashlock: SHA256(preimage) = hash, preimage ≤ 32 B; distinct listed
            keys with a valid BIP-340 signature ≥ <M>n</M>; signatures ≤ listed keys
          </VI_Td>
          <VI_Td w={VI_AW[2]}>Alice's refund signature listed twice: 2 signatures, 1 listed key.</VI_Td>
        </VI_Tr>
      </At>
      <VI_Box x={120} y={760} w={1680} show={s >= 4} size={22}>
        <VI_L gap={0}>
          Keys are counted, not signatures: Schnorr signatures are non-deterministic, so one key can produce many
          valid ones (as in NUT-11).
        </VI_L>
        <VI_L color={c.muted}>
          Leaf validation, when building and when verifying a disclosed tree: 1 ≤ n ≤ keys, no two keys share an
          x-coordinate, body ≤ 512 bytes.
        </VI_L>
      </VI_Box>
    </VarShell>
  );
};

const VI_Badge = ({ y, n, on, done, children }: { y: number; n: number; on: boolean; done: boolean; children: ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      left: 1420,
      top: y,
      width: 380,
      display: 'flex',
      gap: 16,
      alignItems: 'baseline',
      fontSize: 26,
      color: on ? c.ink : c.dim,
      transition: `color 300ms ${EASE_OUT}`,
    }}
  >
    <span style={{ fontFamily: MONO, fontSize: 22, color: on ? c.clayHex : c.dim }}>{n}</span>
    <span>{children}</span>
    <span style={{ color: c.good, fontFamily: MONO, opacity: done ? 1 : 0, transition: `opacity 300ms ${EASE_OUT}` }}>✓</span>
  </div>
);

const VI_VerifyGraphical: Page = () => {
  const proc = useProcess(5, 1800);
  const s = proc.step;
  return (
    <VarShell of={VI_OF2} lens="Graphical" title="Climbing from leaf to secret" proc={proc}>
      <Canvas>
        <Arrow x1={700} y1={856} x2={700} y2={802} show={s >= 1} color={c.node} />
        <Arrow x1={928} y1={650} x2={832} y2={650} show={s >= 2} color={c.cool} />
        <Arrow x1={700} y1={738} x2={700} y2={682} show={s >= 2} color={c.node} delay={200} />
        <Arrow x1={928} y1={530} x2={832} y2={530} show={s >= 3} color={c.cool} />
        <Arrow x1={700} y1={618} x2={700} y2={562} show={s >= 3} color={c.node} delay={200} />
        <Arrow x1={442} y1={410} x2={568} y2={410} show={s >= 4} color={c.node} />
        <Arrow x1={700} y1={498} x2={700} y2={442} show={s >= 4} color={c.node} delay={150} />
        <Arrow x1={700} y1={378} x2={700} y2={322} show={s >= 4} color={c.clayHex} delay={400} />
        <Packet x1={700} y1={890} x2={700} y2={770} run={proc.anim && s === 1} color={c.ink} />
        <Packet x1={1060} y1={650} x2={700} y2={650} run={proc.anim && s === 2} color={c.cool} />
        <Packet x1={1060} y1={530} x2={700} y2={530} run={proc.anim && s === 3} color={c.cool} />
        <Packet x1={340} y1={410} x2={700} y2={410} run={proc.anim && s === 4} color={c.ink} />
        <T x={880} y={302} size={40} font="math" show={s >= 5} color={c.good}>
          =
        </T>
      </Canvas>
      <VI_Node x={700} y={890} w={300} show={s >= 1}>
        hashlock leaf
      </VI_Node>
      <VI_Node x={700} y={770} w={260} h={60} show={s >= 1} delay={200} tone={s === 1 ? 'on' : 'idle'}>
        <VI_Mono>8f38ddf9…</VI_Mono>
      </VI_Node>
      <VI_Node x={700} y={650} w={260} h={60} show={s >= 2} delay={300} tone={s === 2 ? 'on' : 'idle'}>
        <VI_Mono>8f58855d…</VI_Mono>
      </VI_Node>
      <VI_Node x={1060} y={650} w={260} h={60} show={s >= 2} tone="cool" dashed>
        <M>h₀</M> <VI_Mono>23e8ff16…</VI_Mono>
      </VI_Node>
      <VI_Node x={700} y={530} w={260} h={60} show={s >= 3} delay={300} tone={s === 3 ? 'on' : 'idle'}>
        root <VI_Mono>3d4fbecf…</VI_Mono>
      </VI_Node>
      <VI_Node x={1060} y={530} w={260} h={60} show={s >= 3} tone="cool" dashed>
        <M>h₁</M> <VI_Mono>9ed9c0b8…</VI_Mono>
      </VI_Node>
      <VI_Node x={340} y={410} w={200} h={60} show={s >= 4}>
        <M>K</M> <VI_Mono>03a3…</VI_Mono>
      </VI_Node>
      <VI_Node x={700} y={410} w={260} h={60} show={s >= 4} delay={250} tone={s === 4 ? 'on' : 'idle'}>
        <M>t</M> <VI_Mono>ea08208d…</VI_Mono>
      </VI_Node>
      <VI_Node x={700} y={290} w={300} h={60} show={s >= 4} delay={550} tone={s >= 4 ? 'on' : 'idle'}>
        <M>K + t·G</M>
      </VI_Node>
      <VI_Node x={1060} y={290} w={300} h={60} show={s >= 5} tone="good">
        secret <VI_Mono>022d17fd…</VI_Mono>
      </VI_Node>
      <VI_Badge y={300} n={1} on={s >= 1} done={s >= 1}>
        path: 2 ≤ 3
      </VI_Badge>
      <VI_Badge y={370} n={2} on={s >= 2} done={s >= 5}>
        commitment
      </VI_Badge>
      <VI_Badge y={440} n={3} on={s >= 5} done={false}>
        parse
      </VI_Badge>
      <VI_Badge y={510} n={4} on={s >= 5} done={false}>
        evaluate
      </VI_Badge>
    </VarShell>
  );
};

const VI_FX = 860;
const VI_FW = 640;
const VI_FY = [288, 364, 440, 516, 592, 668, 744, 820, 900];
const VI_FNode = ({ i, show, hot, tone, children }: { i: number; show: boolean; hot: boolean; tone?: VI_Tone; children: ReactNode }) => (
  <VI_Node x={VI_FX} y={VI_FY[i]} w={VI_FW} h={50} size={22} show={show} tone={tone ?? (hot ? 'on' : 'idle')}>
    {children}
  </VI_Node>
);

const VI_FReject = ({ i, show, label = 'no' }: { i: number; show: boolean; label?: string }) => (
  <>
    <Draw x1={VI_FX + VI_FW / 2} y1={VI_FY[i]} x2={1290} y2={VI_FY[i]} show={show} color={c.bad} width={2} dur={400} />
    <T x={1236} y={VI_FY[i] - 9} size={21} color={c.bad} show={show}>
      {label}
    </T>
  </>
);

const VI_FDown = ({ i, show, label }: { i: number; show: boolean; label?: string }) => (
  <>
    <Arrow x1={VI_FX} y1={VI_FY[i] + 25} x2={VI_FX} y2={VI_FY[i + 1] - 25} show={show} color={c.good} />
    {label && (
      <T x={VI_FX + 16} y={VI_FY[i] + 44} size={21} anchor="start" color={c.good} show={show}>
        {label}
      </T>
    )}
  </>
);

const VI_VerifyFlow: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF2} lens="Explained via flowchart" title="The verifier as a decision flowchart" proc={proc}>
      <Canvas>
        <T x={1320} y={296} size={22} anchor="start" color={c.muted}>
          ↓ yes · → no, unless marked
        </T>
        <Arrow x1={540} y1={288} x2={484} y2={288} show={s >= 1} color={c.muted} />
        <T x={512} y={276} size={21} color={c.muted} show={s >= 1}>
          no
        </T>
        <VI_FDown i={0} show={s >= 2} />
        <VI_FDown i={1} show={s >= 2} />
        <VI_FDown i={2} show={s >= 3} />
        <VI_FDown i={3} show={s >= 3} />
        <VI_FDown i={4} show={s >= 4} label="no" />
        <VI_FDown i={5} show={s >= 4} />
        <VI_FDown i={6} show={s >= 4} />
        <VI_FDown i={7} show={s >= 4} />
        <VI_FReject i={1} show={s >= 2} />
        <VI_FReject i={2} show={s >= 2} />
        <VI_FReject i={3} show={s >= 3} />
        <VI_FReject i={4} show={s >= 3} label="yes" />
        <VI_FReject i={5} show={s >= 4} />
        <VI_FReject i={6} show={s >= 4} />
        <VI_FReject i={7} show={s >= 4} />
        <Draw x1={1290} y1={VI_FY[1]} x2={1290} y2={900} show={s >= 2} color={c.bad} width={2} dur={700} />
        <Arrow x1={1290} y1={900} x2={1318} y2={900} show={s >= 2} color={c.bad} delay={500} />
        <Draw x1={480} y1={668} x2={540} y2={668} show={s >= 4} color={c.muted} width={1.5} />
      </Canvas>
      <VI_Box x={120} y={262} w={360} h={200} title="No leaf: key path" show={s >= 1} tone={s === 1 ? 'on' : 'dim'}>
        Exactly one entry in <VI_Mono>signatures</VI_Mono>, a valid BIP-340 signature over the input digest for
        x(secret). Else reject.
      </VI_Box>
      <VI_Box x={120} y={560} w={360} h={270} title="Type conditions" show={s >= 3} tone={s === 4 ? 'on' : 'dim'}>
        <VI_L gap={0}>commit: none, always rejects</VI_L>
        <VI_L>after: verifier's clock ≥ time</VI_L>
        <VI_L>hashlock: SHA256(preimage) = hash, preimage ≤ 32 B</VI_L>
        <VI_L>threshold: signatures only</VI_L>
      </VI_Box>
      <VI_FNode i={0} show hot={s === 1}>
        witness has a <VI_Mono>leaf</VI_Mono> field?
      </VI_FNode>
      <VI_FNode i={1} show={s >= 2} hot={s === 2}>
        path holds at most 3 sibling hashes?
      </VI_FNode>
      <VI_FNode i={2} show={s >= 2} hot={s === 2}>
        <M>K + t·G</M> over the recomputed root = secret?
      </VI_FNode>
      <VI_FNode i={3} show={s >= 3} hot={s === 3}>
        leaf parses: version 0x00, known type and fields?
      </VI_FNode>
      <VI_FNode i={4} show={s >= 3} hot={s === 3}>
        leaf type is commit?
      </VI_FNode>
      <VI_FNode i={5} show={s >= 4} hot={s === 4}>
        type condition holds (after, hashlock)?
      </VI_FNode>
      <VI_FNode i={6} show={s >= 4} hot={s === 4}>
        signatures ≤ keys listed in the leaf?
      </VI_FNode>
      <VI_FNode i={7} show={s >= 4} hot={s === 4}>
        distinct listed keys with a valid signature ≥ <M>n</M>?
      </VI_FNode>
      <VI_FNode i={8} show={s >= 4} hot={false} tone="good">
        accept this input
      </VI_FNode>
      <VI_Node x={1430} y={900} w={220} h={56} tone="bad" show={s >= 2}>
        reject
      </VI_Node>
    </VarShell>
  );
};

const VI_XW = [640, 320, 720];
const VI_XRow = ({ show, hot, a, at, why }: { show: boolean; hot: boolean; a: ReactNode; at: string; why: ReactNode }) => (
  <VI_Tr show={show} hot={hot}>
    <VI_Td w={VI_XW[0]}>{a}</VI_Td>
    <VI_Td w={VI_XW[1]} color={c.bad}>
      {at}
    </VI_Td>
    <VI_Td w={VI_XW[2]} color={c.muted}>
      {why}
    </VI_Td>
  </VI_Tr>
);

const VI_VerifyAttacker: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF2} lens="Perspective: attacker" title="Where a forged script-path witness fails" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VI_Tr head>
          <VI_Td head w={VI_XW[0]}>Attempt</VI_Td>
          <VI_Td head w={VI_XW[1]}>Stopped at</VI_Td>
          <VI_Td head w={VI_XW[2]}>Why</VI_Td>
        </VI_Tr>
        <VI_XRow show={s >= 1} hot={s === 1} a="Reveal a leaf that is not in the tree" at="2 · commitment" why={<>Another root, another tweak: <M>K + t·G</M> ≠ secret.</>} />
        <VI_XRow show={s >= 1} hot={s === 1} a="Pad the path with a fourth hash" at="1 · path length" why="More than 3 sibling hashes rejects outright." />
        <VI_XRow show={s >= 2} hot={s === 2} a="Reveal the commit leaf" at="4 · evaluate" why="commit has no satisfaction rule." />
        <VI_XRow show={s >= 2} hot={s === 2} a="Reveal a leaf of unallocated type 0x05" at="3 · parse" why="Fails closed, although the commitment verifies." />
        <VI_XRow show={s >= 3} hot={s === 3} a={<>Meet <M>n</M> = 2 with two signatures by one key</>} at="4 · evaluate" why="Distinct keys are counted, not signatures." />
        <VI_XRow show={s >= 3} hot={s === 3} a="List more signatures than the leaf has keys" at="4 · evaluate" why="signatures must not outnumber listed keys." />
        <VI_XRow show={s >= 4} hot={s === 4} a="Spend an after leaf before its time" at="4 · evaluate" why="The verifier's clock must be at or past time." />
        <VI_XRow show={s >= 4} hot={s === 4} a="Replay a witness in another transaction" at="4 · evaluate" why="The signature covers this input digest only." />
      </At>
      <VI_Box x={120} y={790} w={1680} show={s >= 4} size={22}>
        <VI_L gap={0}>
          A leaf listing <VI_Mono>02‖x</VI_Mono> and <VI_Mono>03‖x</VI_Mono> would count one signer twice: leaf
          validation rejects keys that share an x-coordinate.
        </VI_L>
        <VI_L color={c.muted}>
          Every spendable leaf names at least one key: a hashlock preimage alone is never spend power.
        </VI_L>
      </VI_Box>
    </VarShell>
  );
};

const VI_VerifyCost: Page = () => {
  const proc = useProcess(3, 2600);
  const s = proc.step;
  return (
    <VarShell of={VI_OF2} lens="Framing: cost and sizes" title="Verification cost and witness sizes" proc={proc}>
      <VI_Box x={120} y={256} w={800} h={300} title="Caps (NUT-10)" show={s >= 1} tone={s === 1 ? 'on' : 'dim'} size={23}>
        <VI_L gap={0}>leaf body ≤ 512 B, so a leaf ≤ 513 B and ≤ 15 keys</VI_L>
        <VI_L>tree ≤ 8 leaves, so a path ≤ 3 sibling hashes</VI_L>
        <VI_L>≤ 120 leaf keys per tree, inside NUT-28's 255 slots</VI_L>
        <VI_L>preimage ≤ 32 B · signatures ≤ listed keys</VI_L>
        <VI_L>mints MAY reject a witness over 4096 characters</VI_L>
      </VI_Box>
      <VI_Box x={960} y={256} w={840} h={300} title="Verifier work per script-path input" show={s >= 2} tone={s === 2 ? 'on' : 'dim'} size={23}>
        <VI_L gap={0}>1 · one length check</VI_L>
        <VI_L>
          2 · at most 5 tagged hashes (1 leaf, ≤ 3 branch, 1 tweak), one <M>t·G</M>, one point addition
        </VI_L>
        <VI_L>3 · one pass over at most 513 bytes</VI_L>
        <VI_L>4 · at most one SHA-256, then BIP-340 checks against the listed keys</VI_L>
      </VI_Box>
      <At x={120} y={600} w={1680}>
        <Fade show={s >= 3}>
          <Label>Compact witness length in characters (computed from the NUT-10 vectors and caps)</Label>
          <div style={{ marginTop: 12 }}>
            <VI_Bar label="key path" value={147} max={4096} w={1060} lw={560} show={s >= 3} />
            <VI_Bar label="Alice's refund leaf, empty path" value={350} max={4096} w={1060} lw={560} show={s >= 3} delay={80} />
            <VI_Bar label="hashlock leaf, 2-hash path, 32-byte preimage" value={617} max={4096} w={1060} lw={560} show={s >= 3} delay={160} />
            <VI_Bar
              label="largest valid: 15 keys, 3-hash path"
              value={3302}
              max={4096}
              w={1060}
              lw={560}
              show={s >= 3}
              delay={240}
              color={c.cool}
            />
          </div>
        </Fade>
      </At>
      <Canvas>
        <GFade show={s >= 3} delay={400}>
          <line x1={1740} y1={650} x2={1740} y2={850} style={{ stroke: c.bad, strokeWidth: 2, strokeDasharray: '6 6' }} />
          <T x={1740} y={884} size={22} color={c.bad}>
            4096
          </T>
        </GFade>
      </Canvas>
      <At x={120} y={910} w={1680}>
        <Fade show={s >= 3}>
          <Note style={{ fontSize: 22 }}>
            NUT-10: every valid witness has a compact JSON encoding below the 4096-character bound.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VI_SigPill = ({ k, n }: { k: 3 | 4; n?: number }) => (
  <span
    style={{
      display: 'inline-block',
      fontSize: 22,
      padding: '5px 16px',
      marginRight: 10,
      borderRadius: 999,
      border: `1.75px solid ${k === 3 ? c.cool : c.violet}`,
      background: k === 3 ? c.coolSoft : 'rgba(122, 95, 166, 0.10)',
      whiteSpace: 'nowrap',
    }}
  >
    {n ? `sig ${n} · ` : 'sig · '}key {k}
  </span>
);

const VI_ThRow = ({
  y,
  show,
  hot,
  ok,
  label,
  pills,
  result,
}: {
  y: number;
  show: boolean;
  hot: boolean;
  ok: boolean;
  label: string;
  pills: ReactNode;
  result: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      top: y,
      width: 1220,
      height: 112,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      border: `1.5px solid ${hot ? c.clayHex : c.rule}`,
      background: c.card,
      borderRadius: 12,
      padding: '0 24px',
      ...VI_enter(show),
    }}
  >
    <span style={{ width: 300, flexShrink: 0, fontSize: 23 }}>{label}</span>
    <span style={{ width: 460, flexShrink: 0 }}>{pills}</span>
    <span style={{ fontSize: 23, lineHeight: 1.35, color: ok ? c.good : c.bad }}>{result}</span>
  </div>
);

const VI_VerifyThreshold: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF2} lens="Focus: counting distinct keys" title="Thresholds count keys, not signatures" proc={proc}>
      <At x={120} y={250} w={1220}>
        <Label>Leaf threshold_2of2_keys3_4, 75 bytes (NUT-10 vector)</Label>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <VI_Chip bytes="00" cap="version" />
          <VI_Chip bytes="01" cap="threshold" type />
          <VI_Chip bytes="02 0001 02" cap="n = 2" hot={s === 1} />
          <VI_Chip bytes="04 0042 02f9…36f9 02e4…cd13" cap="keys: key 3, key 4" hot={s === 1} />
        </div>
      </At>
      <VI_ThRow
        y={380}
        show={s >= 1}
        hot={s === 1}
        ok
        label="Each key signs once"
        pills={
          <>
            <VI_SigPill k={3} />
            <VI_SigPill k={4} />
          </>
        }
        result={
          <>
            distinct keys 2 ≥ <M>n</M> = 2<VI_Ok />
          </>
        }
      />
      <VI_ThRow
        y={506}
        show={s >= 2}
        hot={s === 2}
        ok={false}
        label="One key signs twice"
        pills={
          <>
            <VI_SigPill k={3} n={1} />
            <VI_SigPill k={3} n={2} />
          </>
        }
        result={
          <>
            distinct keys 1 {'<'} 2<VI_No />
          </>
        }
      />
      <VI_ThRow
        y={632}
        show={s >= 3}
        hot={s === 3}
        ok={false}
        label="One entry too many"
        pills={
          <>
            <VI_SigPill k={3} />
            <VI_SigPill k={4} />
            <VI_SigPill k={3} />
          </>
        }
        result={
          <>
            3 signatures {'>'} 2 listed keys
            <VI_No />
          </>
        }
      />
      <VI_ThRow
        y={758}
        show={s >= 4}
        hot={s === 4}
        ok={false}
        label="Leaf lists 02‖x and 03‖x"
        pills={<VI_SigPill k={3} />}
        result={
          <>
            one signature satisfies both: malformed leaf
            <VI_No />
          </>
        }
      />
      <StepList>
        <StepItem n={1} step={s}>
          A two-of-two leaf: keys 3 and 4 each sign once. Two distinct keys meet <M>n</M> = 2.
        </StepItem>
        <StepItem n={2} step={s}>
          BIP-340 signatures are non-deterministic: one key can produce two valid ones. Counting signatures would let
          it meet <M>n</M> alone.
        </StepItem>
        <StepItem n={3} step={s}>
          The witness may not hold more signatures than the leaf lists keys.
        </StepItem>
        <StepItem n={4} step={s}>
          Keys sharing an x-coordinate verify the same signature. Leaf validation rejects them.
        </StepItem>
        <Note style={{ marginTop: 14, fontSize: 21 }}>The same counting rule as NUT-11.</Note>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 3 · Three forms of internal key
// ═════════════════════════════════════════════════════════════════════════════

const VI_KeyRow = ({
  y,
  show,
  hot,
  who,
  eq,
  children,
}: {
  y: number;
  show: boolean;
  hot: boolean;
  who: string;
  eq: ReactNode;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      top: y,
      width: 1220,
      height: 196,
      boxSizing: 'border-box',
      display: 'flex',
      border: `1.5px solid ${hot ? c.clayHex : c.rule}`,
      background: c.card,
      borderRadius: 12,
      padding: '18px 26px',
      ...VI_enter(show),
    }}
  >
    <div style={{ width: 380, flexShrink: 0 }}>
      <Label color={hot ? c.clayHex : c.muted}>{who}</Label>
      <div style={{ marginTop: 14 }}>{eq}</div>
    </div>
    <div style={{ fontSize: 23, lineHeight: 1.45 }}>{children}</div>
  </div>
);

const VI_KeyBeginner: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF3} lens="Beginner" title="Who can sign for the internal key" proc={proc}>
      <VI_KeyRow y={256} show={s >= 1} hot={s === 1} who="One holder" eq={<M size={36}>K = k·G</M>}>
        <div>
          <M>k</M> = 7 (a test key) → <M>K</M> = <VI_Mono>025cbdf0…cac4f9bc</VI_Mono>
        </div>
        <div>No conditions: the secret is <M>K</M> itself.</div>
        <div>The holder signs with <M>k</M>.</div>
      </VI_KeyRow>
      <VI_KeyRow
        y={482}
        show={s >= 2}
        hot={s === 2}
        who="Cosigners · MuSig2, FROST"
        eq={
          <>
            <M size={36}>P = K + t·G</M>
            <div style={{ fontSize: 22, color: c.muted, marginTop: 4 }}>
              <M>t</M> = hash of <M>K</M> alone
            </div>
          </>
        }
      >
        <div>Nobody holds <M>k</M> whole: the cosigners sign together.</div>
        <div>
          Vector: <M>K</M> = key 3 → <M>t</M> = <VI_Mono>764c0e0d…d5b69908</VI_Mono>
        </div>
        <div>
          secret <VI_Mono>03b2bb25…d9233aee</VI_Mono>, key-path scalar 3 + <M>t</M> ={' '}
          <VI_Mono>…d5b6990b</VI_Mono>
        </div>
      </VI_KeyRow>
      <VI_KeyRow y={708} show={s >= 3} hot={s === 3} who="Nobody · NUMS" eq={<M size={36}>K = H + u·G</M>}>
        <div>
          <M>H</M>: a point made from a hash. Nobody knows its private key.
        </div>
        <div>
          <M>u</M> = 7 → <M>K</M> = <VI_Mono>028edfeb…ca7bd407</VI_Mono>, and <M>K − 7·G = H</M>
          <VI_Ok />
        </div>
        <div>No key path: only a leaf can spend.</div>
      </VI_KeyRow>
      <StepList>
        <StepItem n={1} step={s}>
          One wallet knows the private key <M>k</M> and signs directly.
        </StepItem>
        <StepItem n={2} step={s}>
          A group shares <M>k</M>. The secret gets the empty tweak, which every cosigner can check.
        </StepItem>
        <StepItem n={3} step={s}>
          Nobody knows <M>k</M>. A leaf is the only way to spend.
        </StepItem>
        <Note style={{ marginTop: 16, fontSize: 21 }}>
          A private key is a number <M>k</M>; its public key is the point <M>k·G</M>, the generator <M>G</M> added{' '}
          <M>k</M> times. "Key N" means <M>k</M> = N.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VI_Rule = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
    <span style={{ color: c.clayHex, fontFamily: MONO }}>–</span>
    <span>{children}</span>
  </div>
);

const VI_KeyAdvanced: Page = () => {
  const proc = useProcess(3, 2600);
  const s = proc.step;
  return (
    <VarShell of={VI_OF3} lens="Advanced" title="Internal key: normative rules" proc={proc}>
      <VI_Box x={120} y={256} w={540} h={470} title="Single-party key" show={s >= 1} tone={s === 1 ? 'on' : 'dim'}>
        <VI_Rule>No conditions: the secret is <M>K</M>, untweaked.</VI_Rule>
        <VI_Rule>
          Sources: NUT-13 type 0x00, a NUT-28 blinded static key (slot 0), or a random keypair whose <M>k</M>{' '}
          travels in spend info.
        </VI_Rule>
        <VI_Rule>
          v3 derivations <VI_Kw>MUST</VI_Kw> be hardened at every step: one non-hardened child plus the xpub recovers
          the parent and every sibling.
        </VI_Rule>
        <VI_Rule>
          A derived key <VI_Kw>MUST NOT</VI_Kw> be re-gifted as a bearer <M>k</M>.
        </VI_Rule>
      </VI_Box>
      <VI_Box x={690} y={256} w={540} h={470} title="Aggregated key · MuSig2, FROST" show={s >= 2} tone={s === 2 ? 'on' : 'dim'}>
        <VI_Rule>
          <VI_Kw>MUST</VI_Kw> carry at least the empty tweak, no root bytes, even when scriptless:
        </VI_Rule>
        <div style={{ marginTop: 4 }}>
          <VI_Mono>tagged_hash("Cashu_NutrootTweak", K)</VI_Mono>
        </div>
        <VI_Rule>Receive check without a tree: <M>K</M> or its empty tweak equals the secret.</VI_Rule>
        <VI_Rule>
          A wallet that does not cosign <VI_Kw>MUST NOT</VI_Kw> treat the proof as received value.
        </VI_Rule>
        <VI_Rule>Reason (BIP341): otherwise one party can add a script path the others cannot see.</VI_Rule>
      </VI_Box>
      <VI_Box x={1260} y={256} w={540} h={470} title="NUMS offset key" show={s >= 3} tone={s === 3 ? 'on' : 'dim'}>
        <VI_Rule>
          <M>H</M> <VI_Kw>MUST</VI_Kw> be lift_x(SHA256(<M>G</M>, 65-byte uncompressed)):
        </VI_Rule>
        <div style={{ marginTop: 4 }}>
          <VI_Mono>0250929b…ce803ac0</VI_Mono>
        </div>
        <VI_Rule>
          <M>u</M> <VI_Kw>MUST</VI_Kw> be fresh per proof and disclosed in spend info; <VI_Kw>MUST NOT</VI_Kw>{' '}
          appear otherwise.
        </VI_Rule>
        <VI_Rule>Seeded wallets MAY derive <M>u</M> (NUT-13 type 0x02).</VI_Rule>
        <VI_Rule>Never ECDH-blinded (NUT-28): nobody holds the scalar of <M>H</M>.</VI_Rule>
      </VI_Box>
      <At x={120} y={760} w={1680}>
        <Fade show={s >= 3}>
          <Note style={{ fontSize: 22 }}>
            Uniqueness is a property of the secret: one <M>K</M> under different trees gives distinct secrets. A
            repeated (<M>K</M>, tree) repeats the secret, and script paths revealing a shared <M>K</M> link proofs.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VI_Pt = ({ x, y, label, show = true, dash = false, tone = c.ink, delay = 0 }: { x: number; y: number; label: ReactNode; show?: boolean; dash?: boolean; tone?: string; delay?: number }) => (
  <GFade show={show} delay={delay}>
    <circle
      cx={x}
      cy={y}
      r={36}
      style={{ fill: c.card, stroke: tone, strokeWidth: 2.25, strokeDasharray: dash ? '5 5' : 'none' }}
    />
    <T x={x} y={y + 12} font="math" size={34} color={tone}>
      {label}
    </T>
  </GFade>
);

const VI_KeyGraphical: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF3} lens="Graphical" title="Three internal keys, three key paths" proc={proc}>
      <Canvas>
        {/* panel 1: one holder */}
        <GFade show={s >= 1}>
          <rect x={120} y={262} width={520} height={690} rx={14} style={{ fill: 'none', stroke: s === 1 ? c.clayHex : c.rule, strokeWidth: 1.5 }} />
        </GFade>
        <VI_Pt x={380} y={360} label="k" show={s >= 1} />
        <Arrow x1={380} y1={398} x2={380} y2={490} show={s >= 1} color={c.node} />
        <T x={398} y={452} size={24} anchor="start" font="math" show={s >= 1} delay={200}>
          ·G
        </T>
        <VI_Pt x={380} y={530} label="K" show={s >= 1} delay={200} />
        <Arrow x1={380} y1={568} x2={380} y2={664} show={s >= 1} color={c.node} delay={300} />
        <VI_Path d="M344 386 Q180 540 266 694" show={s >= 1} color={c.clayHex} width={2.5} delay={500} />
        <VI_Head x={266} y={694} fx={180} fy={540} show={s >= 1} color={c.clayHex} delay={1200} />
        <T x={196} y={548} size={22} color={c.clayHex} show={s >= 1} delay={600}>
          sign
        </T>
        <Packet x1={344} y1={386} x2={266} y2={694} run={proc.anim && s === 1} color={c.clayHex} />
        <T x={380} y={900} size={26} show={s >= 1}>
          one holder
        </T>

        {/* panel 2: cosigners */}
        <GFade show={s >= 2}>
          <rect x={700} y={262} width={520} height={690} rx={14} style={{ fill: 'none', stroke: s === 2 ? c.clayHex : c.rule, strokeWidth: 1.5 }} />
        </GFade>
        <VI_Pt x={880} y={360} label="k₁" show={s >= 2} />
        <VI_Pt x={1040} y={360} label="k₂" show={s >= 2} delay={80} />
        <Arrow x1={900} y1={394} x2={948} y2={498} show={s >= 2} color={c.node} delay={150} />
        <Arrow x1={1020} y1={394} x2={972} y2={498} show={s >= 2} color={c.node} delay={200} />
        <VI_Pt x={960} y={530} label="K" show={s >= 2} delay={300} />
        <Arrow x1={960} y1={568} x2={960} y2={664} show={s >= 2} color={c.clayHex} delay={400} />
        <T x={978} y={606} size={22} anchor="start" color={c.clayHex} show={s >= 2} delay={500}>
          + t·G
        </T>
        <T x={978} y={638} size={22} anchor="start" color={c.muted} show={s >= 2} delay={500}>
          t = hash(K)
        </T>
        <VI_Path d="M846 392 Q720 560 858 690" show={s >= 2} color={c.clayHex} width={2.5} delay={600} dashed />
        <VI_Path d="M1074 392 Q1230 560 1062 690" show={s >= 2} color={c.clayHex} width={2.5} delay={600} dashed />
        <T x={960} y={820} size={22} color={c.clayHex} show={s >= 2} delay={700}>
          joint signature
        </T>
        <T x={960} y={900} size={26} show={s >= 2}>
          cosigners
        </T>

        {/* panel 3: NUMS */}
        <GFade show={s >= 3}>
          <rect x={1280} y={262} width={520} height={690} rx={14} style={{ fill: 'none', stroke: s === 3 ? c.clayHex : c.rule, strokeWidth: 1.5 }} />
        </GFade>
        <VI_Pt x={1340} y={360} label="?" show={s >= 3} dash tone={c.bad} />
        <VI_Pt x={1480} y={360} label="H" show={s >= 3} dash tone={c.muted} delay={80} />
        <T x={1620} y={368} size={22} color={c.bad} show={s >= 3} delay={150}>
          dl unknown
        </T>
        <Arrow x1={1480} y1={398} x2={1480} y2={490} show={s >= 3} color={c.node} delay={200} />
        <T x={1498} y={452} size={22} anchor="start" show={s >= 3} delay={300}>
          + u·G
        </T>
        <VI_Pt x={1480} y={530} label="K" show={s >= 3} delay={300} tone={c.muted} />
        <Arrow x1={1480} y1={568} x2={1480} y2={664} show={s >= 3} color={c.node} delay={400} />
        <T x={1498} y={622} size={22} anchor="start" show={s >= 3} delay={500}>
          + t·G
        </T>
        <Arrow x1={1664} y1={700} x2={1578} y2={700} show={s >= 3} color={c.clayHex} delay={600} />
        <VI_Path d="M1330 398 Q1290 560 1382 690" show={s >= 3} color={c.bad} width={2} delay={600} dashed />
        <T x={1320} y={566} size={30} color={c.bad} font="mono" show={s >= 3} delay={700}>
          ✗
        </T>
        <T x={1300} y={800} size={22} color={c.bad} anchor="start" show={s >= 3} delay={700}>
          no key path
        </T>
        <T x={1540} y={900} size={26} show={s >= 3}>
          nobody
        </T>
      </Canvas>
      <VI_Node x={380} y={700} w={220} h={64} tone="on" show={s >= 1} delay={400}>
        secret = <M>K</M>
      </VI_Node>
      <VI_Node x={960} y={700} w={200} h={64} tone="on" show={s >= 2} delay={500}>
        secret
      </VI_Node>
      <VI_Node x={1480} y={700} w={190} h={64} tone="on" show={s >= 3} delay={500}>
        secret
      </VI_Node>
      <VI_Node x={1720} y={700} w={110} h={56} tone="on" show={s >= 3} delay={600}>
        leaf
      </VI_Node>
    </VarShell>
  );
};

const VI_KW = [120, 600, 330, 630];
const VI_KeyBytes: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF3} lens="Explained via bytes" title="Deriving k, u and leaf keys from the seed (NUT-13)" proc={proc}>
      <At x={120} y={250} w={1680}>
        <Label>
          V3 message, HMAC-SHA256 keyed by the seed · 71 bytes, 75 with the leaf-key suffix
        </Label>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <VI_Chip bytes="Cashu_KDF_HMAC_SHA256" cap="tag, 21 B" show={s >= 1} />
          <VI_Chip bytes="00000021" cap="u32 length 33" show={s >= 1} delay={40} />
          <VI_Chip bytes="02b7e077…b0cf99f6" cap="keyset id, 33 B" show={s >= 1} delay={80} />
          <VI_Chip bytes="00…00" cap="u64 counter" show={s >= 1} delay={120} />
          <VI_Chip bytes="00" cap="type" type show={s >= 1} hot={s >= 2} delay={160} />
          <VI_Chip bytes="00000000" cap="u32 attempt" show={s >= 1} delay={200} />
          <VI_Chip bytes="u32 i" cap="0x03 only" show={s >= 1} hot={s === 4} delay={240} />
        </div>
      </At>
      <At x={120} y={396} w={1680}>
        <VI_Tr head>
          <VI_Td head w={VI_KW[0]}>Type</VI_Td>
          <VI_Td head w={VI_KW[1]}>Derives</VI_Td>
          <VI_Td head w={VI_KW[2]}>Rejection sampled below</VI_Td>
          <VI_Td head w={VI_KW[3]}>Counter 0 of the test seed</VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 2} hot={s === 2}>
          <VI_Td w={VI_KW[0]}>
            <VI_Mono>0x00</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_KW[1]}>
            internal private key <M>k</M>; the secret is <M>K = k·G</M>
          </VI_Td>
          <VI_Td w={VI_KW[2]}>SECP256K1_N</VI_Td>
          <VI_Td w={VI_KW[3]}>
            <VI_Mono>47196dc0…1af70347</VI_Mono> → <VI_Mono>02e6e7cf…8022a29b</VI_Mono>
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 2} hot={s === 2}>
          <VI_Td w={VI_KW[0]}>
            <VI_Mono>0x01</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_KW[1]} color={c.muted}>
            blinding factor <M>r</M>, not a key
          </VI_Td>
          <VI_Td w={VI_KW[2]} color={c.muted}>
            BLS_FR_ORDER
          </VI_Td>
          <VI_Td w={VI_KW[3]} color={c.muted}>
            <VI_Mono>156857a0…9e2d7728</VI_Mono>
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 3} hot={s === 3}>
          <VI_Td w={VI_KW[0]}>
            <VI_Mono>0x02</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_KW[1]}>
            NUMS offset <M>u</M>; <M>K = H + u·G</M>, same counter as the proof
          </VI_Td>
          <VI_Td w={VI_KW[2]}>SECP256K1_N</VI_Td>
          <VI_Td w={VI_KW[3]}>
            <VI_Mono>4af68649…630fc025</VI_Mono> → <M>K</M> <VI_Mono>0308ca9e…a2c7d096</VI_Mono>
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 4} hot={s === 4}>
          <VI_Td w={VI_KW[0]}>
            <VI_Mono>0x03</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_KW[1]}>own leaf key at index i, matched to the tree by value</VI_Td>
          <VI_Td w={VI_KW[2]}>SECP256K1_N</VI_Td>
          <VI_Td w={VI_KW[3]}>
            i = 0: <VI_Mono>8aac8b31…dba23788</VI_Mono> → <VI_Mono>033c1828…80f0653c</VI_Mono>
          </VI_Td>
        </VI_Tr>
      </At>
      <At x={120} y={770} w={1680}>
        <Fade show={s >= 4}>
          <Note style={{ fontSize: 22 }}>
            Types 0x00–0x03 share the proof counter; each key comes straight from the seed, which is the hardening
            NUT-10 requires. Test seed "nut13 v3 test seed". NUT-13 has no type for aggregated keys.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VI_KeyCosigner: Page = () => {
  const proc = useProcess(4, 2600);
  const s = proc.step;
  const AL = 300;
  const MA = 1040;
  return (
    <VarShell of={VI_OF3} lens="Perspective: cosigner" title="The empty tweak, from a cosigner's side" proc={proc}>
      <Canvas>
        <Lifeline x={AL} label="Alice" color={c.cool} top={284} bottom={944} />
        <Lifeline x={MA} label="Mallory" color={c.bad} top={284} bottom={944} />
        <Arrow x1={AL} y1={330} x2={MA - 6} y2={330} show={s >= 1} color={c.cool} label="A" />
        <Packet x1={AL} y1={330} x2={MA} y2={330} run={proc.anim && s === 1} />
        <Arrow x1={MA} y1={598} x2={AL + 6} y2={598} show={s >= 2} color={c.bad} font="sans" label="M, proof of possession" delay={400} />
        <Packet x1={MA} y1={598} x2={AL} y2={598} run={proc.anim && s === 2} color={c.bad} delay={500} />
      </Canvas>
      <VI_Box x={700} y={360} w={640} title="Mallory, before replying" show={s >= 2} tone={s === 2 ? 'bad' : 'dim'}>
        <VI_L gap={0}>
          leaf only she satisfies: threshold, n = 1, keys [<M>M₀</M>]
        </VI_L>
        <VI_L>
          <M>K′ = A + M₀</M>, <M>t</M> = tagged_hash(Tweak, <M>K′</M> ‖ root)
        </VI_L>
        <VI_L>
          announces <M>M = M₀ + t·G</M>; she knows its scalar
        </VI_L>
      </VI_Box>
      <VI_Box x={130} y={628} w={1200} title="Without the rule" show={s >= 3} tone={s === 3 ? 'bad' : 'dim'}>
        <VI_L gap={0}>
          Both compute <M>K = A + M = K′ + t·G</M>. Alice sees a plain aggregate.
        </VI_L>
        <VI_L>
          Secret <M>K</M>: Mallory spends alone by script path: her leaf, control {'{'}<M>K′</M>, path [ ]{'}'}, her
          signature.
        </VI_L>
      </VI_Box>
      <VI_Box x={130} y={790} w={1200} title="With the rule" show={s >= 4} tone={s === 4 ? 'good' : 'dim'}>
        <VI_L gap={0}>
          Secret = <M>K</M> + tagged_hash(Tweak, <M>K</M>)·<M>G</M>, which Alice recomputes from the <M>K</M> she
          aggregated.
        </VI_L>
        <VI_L>The tweak commits to <M>K</M> with no root: Mallory's tree sits under <M>K</M>, and no leaf opens the secret.</VI_L>
      </VI_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Alice and Mallory aggregate by summing keys, with proofs of possession.
        </StepItem>
        <StepItem n={2} step={s}>
          Mallory shifts her key by the tweak of a tree only she satisfies.
        </StepItem>
        <StepItem n={3} step={s}>
          An untweaked aggregate would carry that hidden script path.
        </StepItem>
        <StepItem n={4} step={s}>
          The empty tweak lets every cosigner check the secret: no hidden leaf.
        </StepItem>
        <Note style={{ marginTop: 14, fontSize: 21 }}>
          BIP341's example (MSDL-pop). MuSig key aggregation already randomizes keys; nutroot requires the empty tweak
          for every aggregated key.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VI_KeyNums: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF3} lens="Focus: the NUMS offset" title="NUMS offset: a fresh u, a disclosed u" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 24 }}>
            <M>H</M> = lift_x(SHA256(<M>G</M> uncompressed, 65 bytes))
          </div>
          <div style={{ marginTop: 6 }}>
            <VI_Mono>0250929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0</VI_Mono>
          </div>
        </Fade>
      </At>
      <Canvas>
        <VI_Pt x={220} y={520} label="G" show={s >= 1} />
        <GFade show={s >= 1} delay={200}>
          <line x1={254} y1={506} x2={486} y2={432} style={{ stroke: c.bad, strokeWidth: 2, strokeDasharray: '6 6' }} />
        </GFade>
        <T x={360} y={446} size={24} color={c.bad} font="math" show={s >= 1} delay={300}>
          dl = ?
        </T>
        <VI_Pt x={520} y={420} label="H" show={s >= 1} dash tone={c.muted} delay={200} />
        <Arrow x1={556} y1={432} x2={822} y2={508} show={s >= 2} color={c.clayHex} label="+ u·G" font="sans" labelDy={-12} />
        <VI_Pt x={860} y={520} label="K" show={s >= 2} delay={400} />
        <T x={880} y={622} size={21} font="mono" color={c.muted} show={s >= 2} delay={500}>
          u = 7: 028edfeb…ca7bd407
        </T>
        <VI_Path d="M240 556 Q540 660 832 552" show={s >= 2} color={c.bad} dashed delay={600} />
        <T x={540} y={640} size={22} color={c.bad} show={s >= 2} delay={700}>
          dl(K) = dl(H) + u: unknown
        </T>
        <Arrow x1={896} y1={508} x2={1162} y2={432} show={s >= 2} color={c.node} label="+ t·G" font="sans" labelDy={-12} delay={800} />
        <VI_Pt x={1200} y={420} label="P" show={s >= 2} delay={1000} />
      </Canvas>
      <VI_Box x={120} y={680} w={595} h={270} title="Fresh offset per proof" show={s >= 3} tone={s === 3 ? 'on' : 'dim'}>
        <VI_L gap={0}>
          Secrets must be unique (NUT-00). The same <M>K</M> and tree give the same secret, the same <M>Y</M>: the first
          spend burns it, the others are refused.
        </VI_L>
        <VI_L>
          Seeded wallets may derive <M>u</M> from the proof counter (NUT-13 type 0x02).
        </VI_L>
      </VI_Box>
      <VI_Box x={745} y={680} w={595} h={270} title="Disclosed offset" show={s >= 4} tone={s === 4 ? 'on' : 'dim'}>
        <VI_L gap={0}>
          Without <M>u</M>, <M>K</M> looks like any key: the holder cannot rule out a key path.
        </VI_L>
        <VI_L>
          <M>K − 7·G</M> = <VI_Mono>0250929b…ce803ac0</VI_Mono> = <M>H</M>
          <VI_Ok />
        </VI_L>
        <VI_L color={c.muted}>Never ECDH-blinded (NUT-28).</VI_L>
      </VI_Box>
      <StepList>
        <StepItem n={1} step={s}>
          <M>H</M>: its x-coordinate is a hash of <M>G</M>. Nobody knows its discrete log.
        </StepItem>
        <StepItem n={2} step={s}>
          <M>K = H + u·G</M>. Its discrete log is still unknown: no key path.
        </StepItem>
        <StepItem n={3} step={s}>
          A fresh <M>u</M> per proof keeps the secrets unique.
        </StepItem>
        <StepItem n={4} step={s}>
          A disclosed <M>u</M> lets any holder check <M>K − u·G = H</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VI_KeyReuse: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF3} lens="Framing: failure mode" title="Reused and related keys: what breaks" proc={proc}>
      <VI_Box x={120} y={256} w={825} h={340} title="Same (K, tree) twice" show={s >= 1} tone={s === 1 ? 'bad' : 'dim'} size={23}>
        <VI_L gap={0}>
          Same secret, same <M>Y</M>. The mint cannot see it at issuance: outputs are blinded, so the <M>B_</M>{' '}
          differ.
        </VI_L>
        <VI_L>
          The first spend burns <M>Y</M>; every other proof carrying that secret is refused as spent.
        </VI_L>
        <VI_L color={c.muted}>Wallets SHOULD check each new secret against those already used.</VI_L>
      </VI_Box>
      <VI_Box x={975} y={256} w={825} h={340} title="Same K, different trees" show={s >= 2} tone={s === 2 ? 'bad' : 'dim'} size={23}>
        <VI_L gap={0}>Distinct secrets: uniqueness is a property of the secret, not the key.</VI_L>
        <VI_L>
          A script-path spend reveals <M>K</M>: spends revealing a shared <M>K</M> link their proofs.
        </VI_L>
        <VI_L color={c.muted}>
          Wallets SHOULD use a fresh <M>K</M> per proof where possible.
        </VI_L>
      </VI_Box>
      <VI_Box x={120} y={626} w={825} h={340} title="Two secrets, one x-coordinate" show={s >= 3} tone={s === 3 ? 'bad' : 'dim'} size={23}>
        <VI_L gap={0}>
          Distinct secrets, distinct <M>Y</M>, distinct spent-state entries.
        </VI_L>
        <VI_L>One scalar key-path spends both: signatures verify against x only.</VI_L>
        <VI_L>
          <VI_Mono>02f9308a…13bce036f9</VI_Mono> and <VI_Mono>03f9308a…13bce036f9</VI_Mono>
        </VI_L>
        <VI_L color={c.muted}>
          Wallets <VI_Kw>MUST NOT</VI_Kw> assume an x-only key identifies one proof.
        </VI_L>
      </VI_Box>
      <VI_Box x={975} y={626} w={825} h={340} title="Non-hardened derivation" show={s >= 4} tone={s === 4 ? 'bad' : 'dim'} size={23}>
        <VI_L gap={0}>
          One non-hardened BIP-32 child private key plus the xpub recovers the parent and every sibling.
        </VI_L>
        <VI_L>
          v3 keys travel (a bearer <M>k</M> in spend info), so derivations <VI_Kw>MUST</VI_Kw> be hardened at every
          step.
        </VI_L>
        <VI_L color={c.muted}>NUT-13 V3 derives each key directly from the seed with HMAC-SHA256.</VI_L>
      </VI_Box>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 4 · Spend info and receive-time checks
// ═════════════════════════════════════════════════════════════════════════════

const VI_SiRow = ({
  y,
  show,
  hot,
  k,
  size,
  what,
  ex,
}: {
  y: number;
  show: boolean;
  hot: boolean;
  k: string;
  size?: string;
  what: ReactNode;
  ex: ReactNode;
}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 120,
        top: y,
        width: 560,
        height: 96,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        border: `1.5px solid ${hot ? c.clayHex : c.rule}`,
        background: hot ? c.claySoft : c.card,
        borderRadius: 10,
        padding: '0 24px',
        ...VI_enter(show),
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 30, width: 90 }}>{k}</span>
      <span style={{ fontSize: 22, color: c.muted }}>{size}</span>
    </div>
    <div style={{ position: 'absolute', left: 720, top: y + 6, width: 1080, fontSize: 23, lineHeight: 1.4, ...VI_enter(show, 100) }}>
      <div>{what}</div>
      <div style={{ marginTop: 4, color: c.muted }}>{ex}</div>
    </div>
  </>
);

const VI_InfoBeginner: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  return (
    <VarShell of={VI_OF4} lens="Beginner" title="What travels next to a proof" proc={proc}>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 256,
          width: 560,
          height: 80,
          boxSizing: 'border-box',
          border: `1.5px solid ${c.node}`,
          borderRadius: 10,
          padding: '10px 24px',
          background: c.panel,
        }}
      >
        <Label>Proof</Label>
        <div style={{ fontSize: 22, marginTop: 4 }}>amount · keyset id · secret <M>P</M> · signature <M>C</M></div>
      </div>
      <At x={720} y={266} w={1080}>
        <div style={{ fontSize: 23, lineHeight: 1.4 }}>
          The secret is a public key <M>P</M>. To spend it, the next holder may need more: the spend info.
        </div>
      </At>
      <VI_SiRow
        y={366}
        show={s >= 1}
        hot={s === 1}
        k="k"
        size="32 bytes"
        what="Here is the private key. Whoever holds it can spend."
        ex={
          <>
            <VI_Mono>47196dc0…1af70347</VI_Mono>, and <M>k·G</M> = <VI_Mono>02e6e7cf…8022a29b</VI_Mono> = <M>P</M>
          </>
        }
      />
      <VI_SiRow
        y={478}
        show={s >= 2}
        hot={s === 2}
        k="E"
        size="33 bytes"
        what="Derive your key: combine E with your own static key (NUT-28). Never sent with k."
        ex={
          <>
            <VI_Mono>022f8bde…b240efe4</VI_Mono> (test key 5)
          </>
        }
      />
      <VI_SiRow
        y={590}
        show={s >= 3}
        hot={s === 3}
        k="K"
        size="33 bytes"
        what={<>The internal key: the key <M>P</M> was built from.</>}
        ex={<VI_Mono>03a3e12c…3a419e51</VI_Mono>}
      />
      <VI_SiRow
        y={702}
        show={s >= 4}
        hot={s === 4}
        k="tree"
        size="leaves"
        what="The conditions, as full leaves, never as hashes."
        ex="[ after: key 4 may sign from 2025-08-19 ]"
      />
      <VI_SiRow
        y={814}
        show={s >= 5}
        hot={s === 5}
        k="u"
        size="32 bytes"
        what={
          <>
            Shows that nobody has the private key of <M>K</M>: <M>K = H + u·G</M>.
          </>
        }
        ex={<VI_Mono>4af68649…630fc025</VI_Mono>}
      />
      <At x={120} y={930} w={1680}>
        <Fade show={s >= 6}>
          <div style={{ fontSize: 24 }}>
            The receiver rebuilds <M>P</M> from these fields. If it matches, no condition is hidden.
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

const VI_PW = [140, 100, 760, 680];
const VI_Src = ({ children, hot }: { children: ReactNode; hot: boolean }) => (
  <span
    style={{
      fontSize: 23,
      padding: '8px 18px',
      borderRadius: 999,
      border: `1.5px solid ${hot ? c.clayHex : c.node}`,
      background: hot ? c.claySoft : c.card,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const VI_InfoAdvanced: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF4} lens="Advanced" title="Spend info: presence rules and precedence" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VI_Tr head>
          <VI_Td head w={VI_PW[0]}>JSON</VI_Td>
          <VI_Td head w={VI_PW[1]}>V4</VI_Td>
          <VI_Td head w={VI_PW[2]}>Rule (NUT-10)</VI_Td>
          <VI_Td head w={VI_PW[3]}>Reason</VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 1} hot={s === 1}>
          <VI_Td w={VI_PW[0]}>
            <VI_Mono size={22}>k</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[1]}>
            <VI_Mono size={22}>k</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[2]}>
            <VI_Kw>MUST NOT</VI_Kw> appear with <VI_Mono>E</VI_Mono>. A derived key <VI_Kw>MUST NOT</VI_Kw> be
            re-gifted as <VI_Mono>k</VI_Mono>: sweep, then send.
          </VI_Td>
          <VI_Td w={VI_PW[3]} color={c.muted}>
            The first sender knows the blinding tweak and could recover the receiver's static key.
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 1} hot={s === 1}>
          <VI_Td w={VI_PW[0]}>
            <VI_Mono size={22}>E</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[1]}>
            <VI_Mono size={22}>e</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[2]}>
            <VI_Kw>SHOULD</VI_Kw> be sent when the sender holds the receiver's static key; <VI_Mono>k</VI_Mono> is the
            offline fallback.
          </VI_Td>
          <VI_Td w={VI_PW[3]} color={c.muted}>
            Only the receiver can derive the key.
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 2} hot={s === 2}>
          <VI_Td w={VI_PW[0]}>
            <VI_Mono size={22}>K</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[1]}>
            <VI_Mono size={22}>i</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[2]}>
            <VI_Kw>MUST</VI_Kw> accompany a tree when neither <VI_Mono>k</VI_Mono> nor <VI_Mono>E</VI_Mono> does;{' '}
            <VI_Kw>SHOULD</VI_Kw> accompany <VI_Mono>E</VI_Mono>; redundant with <VI_Mono>k</VI_Mono>.
          </VI_Td>
          <VI_Td w={VI_PW[3]} color={c.muted}>
            The control block needs it; third-party leaf signers cannot spend without it.
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 2} hot={s === 2}>
          <VI_Td w={VI_PW[0]}>
            <VI_Mono size={22}>tree</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[1]}>
            <VI_Mono size={22}>t</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[2]}>Full serialized leaves in slot order, never hashes. A permuted list is equivalent.</VI_Td>
          <VI_Td w={VI_PW[3]} color={c.muted}>
            The root commits the leaf set; nothing may be derived from a leaf's position.
          </VI_Td>
        </VI_Tr>
        <VI_Tr show={s >= 3} hot={s === 3}>
          <VI_Td w={VI_PW[0]}>
            <VI_Mono size={22}>u</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[1]}>
            <VI_Mono size={22}>u</VI_Mono>
          </VI_Td>
          <VI_Td w={VI_PW[2]}>
            <VI_Kw>MUST</VI_Kw> be present exactly when <M>K</M> is a NUMS offset.
          </VI_Td>
          <VI_Td w={VI_PW[3]} color={c.muted}>
            Omission is undetectable, but fails a NUT-18 NUMS request.
          </VI_Td>
        </VI_Tr>
      </At>
      <At x={120} y={800} w={1680}>
        <Fade show={s >= 4}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Label>Key source precedence</Label>
            <VI_Src hot={s === 4}>bearer: k·G</VI_Src>
            <span style={{ fontSize: 26, color: c.muted }}>›</span>
            <VI_Src hot={s === 4}>receiver-keyed: derived from E, slot 0</VI_Src>
            <span style={{ fontSize: 26, color: c.muted }}>›</span>
            <VI_Src hot={s === 4}>disclosed K</VI_Src>
          </div>
          <Note style={{ fontSize: 22, marginTop: 20 }}>
            The derived key is authoritative: a disclosed <M>K</M> that differs from the key derived from <M>E</M>{' '}
            <VI_Kw>MUST</VI_Kw> reject. V4 tokens carry the CBOR map <VI_Mono>si</VI_Mono> with byte-string values, and
            no witness.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VI_InfoGraphical: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  return (
    <VarShell of={VI_OF4} lens="Graphical" title="Receive: reconstruct, confirm, sweep" proc={proc}>
      <Canvas>
        <Arrow x1={470} y1={392} x2={560} y2={482} show={s >= 1} color={c.node} delay={200} />
        <Arrow x1={590} y1={392} x2={590} y2={482} show={s >= 1} color={c.node} delay={250} />
        <Arrow x1={710} y1={392} x2={620} y2={482} show={s >= 1} color={c.node} delay={300} />
        <Arrow x1={320} y1={560} x2={438} y2={560} show={s >= 1} color={c.ink} />
        <Packet x1={320} y1={560} x2={440} y2={560} run={proc.anim && s === 1} color={c.ink} />
        <Arrow x1={740} y1={560} x2={848} y2={560} show={s >= 2} color={c.good} />
        <Arrow x1={590} y1={637} x2={590} y2={808} show={s >= 2} color={c.bad} delay={200} />
        <Packet x1={740} y1={560} x2={850} y2={560} run={proc.anim && s === 2} color={c.good} />
        <Arrow x1={1150} y1={560} x2={1258} y2={560} show={s >= 3} color={c.good} />
        <Arrow x1={1000} y1={637} x2={1000} y2={808} show={s >= 3} color={c.bad} delay={200} />
        <Packet x1={1150} y1={560} x2={1260} y2={560} run={proc.anim && s === 3} color={c.good} />
        <Arrow x1={1480} y1={560} x2={1593} y2={560} show={s >= 4} color={c.clayHex} />
        <Packet x1={1480} y1={560} x2={1595} y2={560} run={proc.anim && s === 4} color={c.clayHex} />
      </Canvas>
      <VI_Node x={470} y={360} w={110} h={56} show={s >= 1} tone="cool">
        <M>k·G</M>
      </VI_Node>
      <VI_Node x={590} y={360} w={110} h={56} show={s >= 1} tone="cool" delay={60}>
        from <M>E</M>
      </VI_Node>
      <VI_Node x={710} y={360} w={110} h={56} show={s >= 1} tone="cool" delay={120}>
        <M>K</M>
      </VI_Node>
      <VI_Node x={220} y={560} w={200} h={110} show sub="+ spend info">
        token
      </VI_Node>
      <VI_Node x={590} y={560} w={300} h={150} show={s >= 1} tone={s === 2 ? 'on' : 'idle'} size={26} sub="reconstruct">
        <M size={30}>K + t·G = P ?</M>
      </VI_Node>
      <VI_Node x={1000} y={560} w={300} h={150} show={s >= 2} tone={s === 3 ? 'on' : 'idle'} size={24} sub="spendable">
        key path or leaf keys, policy
      </VI_Node>
      <VI_Node x={1370} y={560} w={220} h={110} show={s >= 3} tone={s === 4 ? 'on' : 'idle'}>
        swap
      </VI_Node>
      <VI_Node x={1690} y={560} w={190} h={110} show={s >= 4} tone="good">
        seed-derived
      </VI_Node>
      <VI_Node x={590} y={840} w={170} h={56} show={s >= 2} tone="bad">
        reject
      </VI_Node>
      <VI_Node x={1000} y={840} w={170} h={56} show={s >= 3} tone="bad">
        reject
      </VI_Node>
    </VarShell>
  );
};

const VI_DW = [250, 300, 560, 570];
const VI_DRow = ({ show, hot, a, b, c1, d }: { show: boolean; hot: boolean; a: ReactNode; b: ReactNode; c1: ReactNode; d: ReactNode }) => (
  <VI_Tr show={show} hot={hot}>
    <VI_Td w={VI_DW[0]}>{a}</VI_Td>
    <VI_Td w={VI_DW[1]} color={c.muted}>
      {b}
    </VI_Td>
    <VI_Td w={VI_DW[2]}>{c1}</VI_Td>
    <VI_Td w={VI_DW[3]}>{d}</VI_Td>
  </VI_Tr>
);

const VI_InfoTable: Page = () => {
  const proc = useProcess(3, 2600);
  const s = proc.step;
  return (
    <VarShell of={VI_OF4} lens="Explained via decision table" title="Receive-time checks by spend-info shape" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VI_Tr head>
          <VI_Td head w={VI_DW[0]}>Spend info</VI_Td>
          <VI_Td head w={VI_DW[1]}>Key source</VI_Td>
          <VI_Td head w={VI_DW[2]}>Check 1 requires</VI_Td>
          <VI_Td head w={VI_DW[3]}>Who else can spend until swept</VI_Td>
        </VI_Tr>
        <VI_DRow show={s >= 1} hot={s === 1} a="none" b="seed key (NUT-13)" c1="nothing to reconstruct; check 2 decides" d="nobody: self-owned, seed-recoverable" />
        <VI_DRow
          show={s >= 1}
          hot={s === 1}
          a={<VI_Mono size={22}>k</VI_Mono>}
          b={<M>k·G</M>}
          c1={<><M>k·G</M>, or its empty tweak, = secret</>}
          d="the sender, plus any tree hidden behind k"
        />
        <VI_DRow
          show={s >= 1}
          hot={s === 1}
          a={<VI_Mono size={22}>E</VI_Mono>}
          b={<>derived from <M>E</M>, slot 0</>}
          c1={<>derived <M>K</M>, or its empty tweak, = secret</>}
          d="nobody; but E is not seed-derivable"
        />
        <VI_DRow
          show={s >= 2}
          hot={s === 2}
          a={<VI_Mono size={22}>E + tree</VI_Mono>}
          b={<>derived from <M>E</M></>}
          c1={<>leaves parse; <M>K + t·G</M> = secret</>}
          d="leaf key holders, under their conditions"
        />
        <VI_DRow
          show={s >= 2}
          hot={s === 2}
          a={<VI_Mono size={22}>K + tree</VI_Mono>}
          b={<>disclosed <M>K</M></>}
          c1={<>leaves parse; <M>K + t·G</M> = secret</>}
          d="the key-path holder, at any time"
        />
        <VI_DRow
          show={s >= 2}
          hot={s === 2}
          a={<VI_Mono size={22}>K + u + tree</VI_Mono>}
          b={<>disclosed <M>K</M></>}
          c1={<>and <M>K − u·G = H</M>: no key path</>}
          d="leaf key holders only"
        />
        <VI_DRow
          show={s >= 3}
          hot={s === 3}
          a="anything else"
          b="none, or two"
          c1={<span style={{ color: c.bad }}>reject: a tree without a key source, or k with E</span>}
          d="n/a"
        />
      </At>
      <At x={120} y={770} w={1680}>
        <Fade show={s >= 3}>
          <Note style={{ fontSize: 22 }}>
            V4 vectors: <VI_Mono>k</VI_Mono> → <VI_Mono>02e6e7cf…</VI_Mono> · <VI_Mono>E</VI_Mono> →{' '}
            <VI_Mono>03a3e12c…</VI_Mono> · <VI_Mono>E</VI_Mono> or <VI_Mono>K</VI_Mono> + tree →{' '}
            <VI_Mono>02d310a4…</VI_Mono> · <VI_Mono>K + u + tree</VI_Mono> → <VI_Mono>0251a4f3…</VI_Mono>. A
            permuted tree is equivalent.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VI_InfoReceiver: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const SE = 240;
  const RE = 600;
  const MI = 960;
  const swept = s >= 4;
  return (
    <VarShell of={VI_OF4} lens="Perspective: receiver" title="Sweeping, from the receiver's side" proc={proc}>
      <Canvas>
        <Lifeline x={SE} label="Sender" top={290} bottom={940} />
        <Lifeline x={RE} label="Receiver" color={c.cool} top={290} bottom={940} />
        <Lifeline x={MI} label="Mint" color={c.muted} top={290} bottom={940} />
        <Arrow x1={SE} y1={344} x2={RE - 6} y2={344} show={s >= 1} color={c.ink} font="sans" label="token + spend info" />
        <Packet x1={SE} y1={344} x2={RE} y2={344} run={proc.anim && s === 1} color={c.ink} />
        <Arrow x1={RE} y1={560} x2={MI - 6} y2={560} show={s >= 3} color={c.cool} font="sans" label="swap" />
        <Packet x1={RE} y1={560} x2={MI} y2={560} run={proc.anim && s === 3} />
        <Arrow x1={MI} y1={630} x2={RE + 6} y2={630} show={s >= 3} color={c.muted} font="sans" label="signatures" delay={500} />
      </Canvas>
      <VI_Box x={400} y={386} w={400} title="Receiver" show={s >= 2} tone={s === 2 ? 'on' : 'dim'}>
        <VI_L gap={0}>check 1: reconstruct</VI_L>
        <VI_L gap={2}>check 2: spendable, policy</VI_L>
      </VI_Box>
      <VI_Box x={400} y={690} w={400} title="After the swap" show={s >= 4} tone={s === 4 ? 'good' : 'dim'}>
        <VI_L gap={0}>seed-derived secrets: recoverable (NUT-09, NUT-13), no one else holds a path</VI_L>
      </VI_Box>
      <VI_Box x={1100} y={290} w={700} h={140} title={swept ? 'Bearer private key · swept' : 'Bearer private key'} show={s >= 1} tone={swept ? 'good' : 'dim'}>
        The sender holds the same scalar, and <M>k</M> may be <M>p′</M> of a hidden tree: both verify alike.
      </VI_Box>
      <VI_Box x={1100} y={450} w={700} h={140} title={swept ? 'Receiver-keyed (E) · swept' : 'Receiver-keyed (E)'} show={s >= 1} tone={swept ? 'good' : 'dim'} delay={60}>
        <M>E</M> is wallet data, not seed-derivable: until swept, the seed alone cannot recover the proof.
      </VI_Box>
      <VI_Box x={1100} y={610} w={700} h={140} title={swept ? 'Disclosed tree, no key handed over · swept' : 'Disclosed tree, no key handed over'} show={s >= 1} tone={swept ? 'good' : 'dim'} delay={120}>
        The key-path holder can spend at any time, unless <M>K</M> is a NUMS offset.
      </VI_Box>
      <VI_Box x={1100} y={770} w={700} h={170} title="Passing it on" show={s >= 1} tone={s === 4 ? 'on' : 'dim'} delay={180}>
        Never re-gift a derived key as a bearer <M>k</M>: the first sender knows the blinding tweak. Sweep, then send.
      </VI_Box>
    </VarShell>
  );
};

const VI_WBox = ({ y, h, title, show, hot, children }: { y: number; h: number; title: string; show: boolean; hot: boolean; children: ReactNode }) => (
  <VI_Box x={120} y={y} w={1220} h={h} title={title} show={show} tone={hot ? 'on' : 'dim'}>
    {children}
  </VI_Box>
);

const VI_InfoWorked: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF4} lens="Worked example end to end" title="Carol receives Alice's token" proc={proc}>
      <VI_WBox y={256} h={132} title="Token entry (V4 vector, receiver-keyed with a tree)" show={s >= 1} hot={s === 1}>
        <VI_L gap={0}>
          secret <VI_Mono>02d310a4…9ef8f828</VI_Mono> · spend info: <M>E</M> = <VI_Mono>022f8bde…b240efe4</VI_Mono>
        </VI_L>
        <VI_L gap={2}>
          tree = [ <VI_Mono>0002…68a3be80</VI_Mono> ] (after, n = 1, key 4, time 1755561600)
        </VI_L>
      </VI_WBox>
      <VI_WBox y={398} h={132} title="Derive K from E (NUT-28, slot 0)" show={s >= 2} hot={s === 2}>
        <VI_L gap={0}>
          <M>Zx</M> = x(<M>3·E</M>) · <M>r₀</M> = SHA256("Cashu_P2BK_v1" ‖ <M>Zx</M> ‖ 0x00) ={' '}
          <VI_Mono>7dfb649b…ea066181</VI_Mono>
        </VI_L>
        <VI_L gap={2}>
          <M>K = 3·G + r₀·G</M> = <VI_Mono>03a3e12c…3a419e51</VI_Mono>
        </VI_L>
      </VI_WBox>
      <VI_WBox y={540} h={132} title="Check 1 · reconstruct" show={s >= 3} hot={s === 3}>
        <VI_L gap={0}>
          leaf parses · root = <VI_Mono>9ed9c0b8…0616589a</VI_Mono> · <M>t</M> ={' '}
          <VI_Mono>b3b7846b…5effe8a4</VI_Mono>
        </VI_L>
        <VI_L gap={2}>
          <M>K + t·G</M> = <VI_Mono>02d310a4…9ef8f828</VI_Mono> = secret
          <VI_Ok />
        </VI_L>
      </VI_WBox>
      <VI_WBox y={682} h={132} title="Check 2 · spendable and acceptable" show={s >= 4} hot={s === 4}>
        <VI_L gap={0}>
          key path: <M>p′ = (3 + r₀ + t) mod n</M> = <VI_Mono>31b2e906…78d008e7</VI_Mono>
          <VI_Ok />
        </VI_L>
        <VI_L gap={2}>policy: Alice (key 4) can refund from 2025-08-19; compare with the minimum refund horizon</VI_L>
      </VI_WBox>
      <VI_WBox y={824} h={100} title="Sweep" show={s >= 5} hot={s === 5}>
        swap <M>P</M> to a seed-derived secret: <M>E</M> is not seed-derivable, and the refund path stays open until
        then
      </VI_WBox>
      <StepList>
        <StepItem n={1} step={s}>
          Carol receives a secret with spend info <M>E</M> and a tree.
        </StepItem>
        <StepItem n={2} step={s}>
          She derives <M>K</M> from <M>E</M> with her static key 3.
        </StepItem>
        <StepItem n={3} step={s}>
          The tree and <M>K</M> rebuild the secret, so no leaf is hidden.
        </StepItem>
        <StepItem n={4} step={s}>
          She holds the key path. The refund leaf must pass her policy first.
        </StepItem>
        <StepItem n={5} step={s}>
          Sweep to a seed-derived secret.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VI_FW2 = [700, 330, 650];
const VI_FRow = ({ show, hot, a, b, r }: { show: boolean; hot: boolean; a: ReactNode; b: string; r: ReactNode }) => (
  <VI_Tr show={show} hot={hot}>
    <VI_Td w={VI_FW2[0]}>{a}</VI_Td>
    <VI_Td w={VI_FW2[1]} color={c.clayHex}>
      {b}
    </VI_Td>
    <VI_Td w={VI_FW2[2]} color={c.muted}>
      {r}
    </VI_Td>
  </VI_Tr>
);

const VI_InfoFailure: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF4} lens="Framing: failure mode" title="What each receive-time check catches" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VI_Tr head>
          <VI_Td head w={VI_FW2[0]}>The sender's spend info</VI_Td>
          <VI_Td head w={VI_FW2[1]}>Caught by</VI_Td>
          <VI_Td head w={VI_FW2[2]}>Result</VI_Td>
        </VI_Tr>
        <VI_FRow show={s >= 1} hot={s === 1} a="A tree with one leaf left out, eg a hidden refund" b="check 1" r={<>Another root: <M>K + t·G</M> ≠ secret. Reject.</>} />
        <VI_FRow show={s >= 1} hot={s === 1} a={<>A disclosed <M>K</M> that differs from the key derived from <M>E</M></>} b="check 1" r="The derived key is authoritative. Reject." />
        <VI_FRow show={s >= 2} hot={s === 2} a="A tree without a key source, or k together with E" b="check 1" r="No valid shape. Reject." />
        <VI_FRow show={s >= 2} hot={s === 2} a="A leaf of unknown version or type, or an unknown field" b="check 1" r="Every leaf must parse. Reject." />
        <VI_FRow show={s >= 3} hot={s === 3} a={<>An aggregated <M>K</M> the wallet does not cosign</>} b="check 2" r="Not treated as received value." />
        <VI_FRow show={s >= 3} hot={s === 3} a="A refund leaf that opens too soon" b="check 2 · policy" r="Refused by the acceptance policy." />
        <VI_FRow show={s >= 4} hot={s === 4} a={<>A bearer <M>k</M> that is really <M>p′</M> of a tweaked tree</>} b="neither check" r="Both pass. Only the sweep removes the hidden path." />
      </At>
      <VI_Box x={120} y={780} w={1680} show={s >= 4} size={22}>
        <VI_L gap={0}>
          A disclosure that computes the secret is provably complete: the secret commits the tree, so no hidden leaf can
          exist.
        </VI_L>
        <VI_L color={c.muted}>
          A bearer scalar is the exception: <M>p′</M> and a bare <M>k</M> verify identically. Wallets that swap at once
          enforce check 2 implicitly.
        </VI_L>
      </VI_Box>
    </VarShell>
  );
};

const VI_InfoAudit: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VI_OF4} lens="Focus: the auditable lock" title="Auditable lock: spend info anyone can check" proc={proc}>
      <At x={120} y={250} w={1220}>
        <Label>Leaf, 46 bytes</Label>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <VI_Chip bytes="00" cap="version" />
          <VI_Chip bytes="01" cap="threshold" type />
          <VI_Chip bytes="02 0001 01" cap="n = 1" hot={s === 2} />
          <VI_Chip bytes="04 0021 02f9308a…bce036f9" cap="keys: P = key 3" hot={s === 2} />
          <VI_Chip bytes="0a 0001 01" cap="disclosure" hot={s === 4} />
        </div>
      </At>
      <At x={120} y={400} w={1220}>
        <div style={{ fontSize: 23, lineHeight: 1.5 }}>
          <Fade show={s >= 1}>
            <div>
              spend info: <M>K</M> = <VI_Mono>028edfeb…ca7bd407</VI_Mono>, <M>u</M> = 7, tree = [ leaf ]
            </div>
            <div>
              <M>K − 7·G</M> = <VI_Mono>0250929b…ce803ac0</VI_Mono> = <M>H</M>
              <VI_Ok /> <span style={{ color: c.muted }}>no key path</span>
            </div>
          </Fade>
          <Fade show={s >= 2} style={{ marginTop: 10 }}>
            <div>
              root = leaf hash = <VI_Mono>b957f8b5…00793cd6</VI_Mono>, <M>t</M> = <VI_Mono>6c3a09b1…7689610b</VI_Mono>
            </div>
            <div>
              <M>K + t·G</M> = <VI_Mono>02fc11bf…c13a053b</VI_Mono> = secret
              <VI_Ok /> <span style={{ color: c.muted }}>only <M>P</M> can spend</span>
            </div>
          </Fade>
        </div>
      </At>
      <VI_Box x={120} y={640} w={1220} title="Minimal disclosure" show={s >= 3} tone={s === 3 ? 'on' : 'dim'}>
        Knowing <M>P</M>, a holder rebuilds all spend info from <M>u</M> alone: <M>K = H + u·G</M>, and the one
        canonical leaf from <M>P</M>.
      </VI_Box>
      <VI_Box x={120} y={774} w={1220} title="On spend · NUT-07 checkstate (vector)" show={s >= 4} tone={s === 4 ? 'on' : 'dim'} size={21}>
        <div style={{ fontFamily: MONO, lineHeight: 1.45 }}>
          <div>witness: 344 characters, signature 4cc8e5af…b85d0660</div>
          <div>input_digest: 1732e47d…686336d1 · commitment: c682da9c…2a361ae4</div>
        </div>
      </VI_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Spend info <M>K</M>, <M>u</M>, tree. <M>K − u·G = H</M>: nobody holds a key path.
        </StepItem>
        <StepItem n={2} step={s}>
          One threshold leaf naming <M>P</M>. It computes the secret, so only <M>P</M> can spend.
        </StepItem>
        <StepItem n={3} step={s}>
          The disclosure is canonical: <M>u</M> and <M>P</M> rebuild it.
        </StepItem>
        <StepItem n={4} step={s}>
          On spend the mint publishes witness and input digest; the transaction digest stays private.
        </StepItem>
        <Note style={{ marginTop: 14, fontSize: 21 }}>No keys and no mint are needed to verify the lock.</Note>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Deck
// ═════════════════════════════════════════════════════════════════════════════

const PAGES: [Page, string | undefined][] = [
  [VI_Cover, undefined],

  [NutrootSpends, 'Original slide.'],
  [
    VI_SpendsBeginner,
    `Beginner. One secret P, two ways to open it, with the Alice and Carol refund vector. Carol signs with p′ = k + t and shows nothing else; Alice shows the leaf, K and an empty path, and the mint rebuilds P before checking the condition.`,
  ],
  [
    VI_SpendsAdvanced,
    `Advanced. The normative rules for both witness shapes, plus two edge cases: 02‖x and 03‖x are two secrets one scalar can key-path spend, and a witness is bound to one input of one transaction. Mention the rejection vector with a duplicated signature.`,
  ],
  [
    VI_SpendsGraphical,
    `Graphical. Both routes end at the same point P. The key path is a single signature; the script path climbs from the leaf through opaque sibling hashes and the tweak with K. Last step: what is revealed and what stays a hash.`,
  ],
  [
    VI_SpendsBytes,
    `Explained via bytes. Carol's key-path witness and Alice's script-path witness from the NUT-10 worked example, field by field. Both are a few hundred characters, far below the 4096-character bound a mint may enforce.`,
  ],
  [
    VI_SpendsMint,
    `Perspective: the mint. A key-path spend of a tweaked secret teaches the mint nothing beyond a bare-key spend. A script path reveals that conditions exist, the leaf and K. Checkstate returns a commitment for every spent v3 proof, and the witness only for a disclosure leaf; both responses are NUT-07 vectors.`,
  ],
  [
    VI_SpendsBip341,
    `Framing: comparison with BIP341. The same two spend paths, row by row: witness shape, control data and the commitment check. Differences to name: the 33-byte K instead of x-only with a parity bit, the tweak reduced mod n instead of rejected, and a declarative leaf instead of script execution.`,
  ],
  [
    VI_SpendsWorked,
    `Worked example end to end. Alice pays Carol with a refund leaf. Carol can key-path spend from the start; Alice's script path verifies only once the mint clock passes the leaf time. Values are the NUT-10 vector's; its signatures sign an illustrative digest.`,
  ],

  [ScriptVerify, 'Original slide.'],
  [
    VI_VerifyBeginner,
    `Beginner. The four verifier steps as four plain questions, answered with Alice's refund witness: empty path, rebuilt secret, readable leaf, condition met. The right column defines every term used.`,
  ],
  [
    VI_VerifyAdvanced,
    `Advanced. Each verifier step with its exact rule and a rejection vector from the spec. Point out that the unknown-type leaf passes the commitment check and fails only at parsing, and that thresholds count keys, not signatures.`,
  ],
  [
    VI_VerifyGraphical,
    `Graphical. The commitment check as a climb from the hashlock leaf to the secret, with the three-leaf vector's hashes. Siblings come in from the side, K joins at the tweak, and the result must equal the secret.`,
  ],
  [
    VI_VerifyFlow,
    `Explained via flowchart. Every decision the verifier takes and every branch that rejects. The key path is the left branch when no leaf is present; commit is the one decision where yes rejects.`,
  ],
  [
    VI_VerifyAttacker,
    `Perspective: attacker. Eight ways to forge or stretch a script-path witness, and the step that stops each. The bottom box covers the case the verifier cannot see, a leaf that lists one signer twice, which leaf validation rejects.`,
  ],
  [
    VI_VerifyCost,
    `Framing: cost and sizes. The caps bound the verifier's work to a handful of hashes, one scalar multiplication and a few signature checks. Witness lengths are computed from the vectors; the largest valid witness, a 15-key threshold leaf with a 3-hash path, is about 3.3k characters, under the 4096 bound.`,
  ],

  [
    VI_VerifyThreshold,
    `Focus: counting distinct keys. With the two-of-two vector leaf: two keys signing once each pass; one key signing twice fails because keys are counted, not signatures; an extra entry fails the signature-count bound; a leaf listing both parities of one x is malformed.`,
  ],

  [InternalKey, 'Original slide.'],
  [
    VI_KeyBeginner,
    `Beginner. The three forms by who knows the private key: one holder, a group, nobody. Each with a test-key example from the vectors; note that the empty-tweak scalar is visibly 3 + t in its last byte.`,
  ],
  [
    VI_KeyAdvanced,
    `Advanced. The normative rules for each form: hardened derivation and the re-gift ban, the mandatory empty tweak for aggregated keys, and the exact NUMS construction with a fresh, disclosed u.`,
  ],
  [
    VI_KeyGraphical,
    `Graphical. Three small figures: a key path signed by one scalar, a joint signature for an aggregate with the empty tweak, and a NUMS key whose key path does not exist, so only a leaf reaches the secret.`,
  ],
  [
    VI_KeyBytes,
    `Explained via bytes. The NUT-13 V3 message that derives k, u and leaf keys, with the counter-0 values of the test seed. The counter-0 k and u are exactly the keys used in the NUT-10 bearer and script-only token vectors.`,
  ],
  [
    VI_KeyCosigner,
    `Perspective: cosigner. BIP341's hidden script path attack in nutroot notation: Mallory shifts her key by the tweak of a tree only she satisfies. With an untweaked aggregate she could spend alone; with the empty tweak Alice checks the secret herself and the hidden leaf no longer opens it.`,
  ],
  [
    VI_KeyNums,
    `Focus: the NUMS offset. Why H has no known discrete log, why K = H + u·G keeps that property, why u must be fresh per proof, and why it must be disclosed. The check K − 7·G = H uses the vector's u = 7.`,
  ],
  [
    VI_KeyReuse,
    `Framing: failure mode. Four ways key reuse or related keys go wrong: a repeated secret burns on first spend, a shared K links script-path spends, 02‖x and 03‖x share one key-path scalar, and non-hardened derivation leaks siblings.`,
  ],

  [SpendInfo, 'Original slide.'],
  [
    VI_InfoBeginner,
    `Beginner. The five spend-info fields one at a time, each in plain words with a value from the vectors. The last step states the point of all of them: the receiver rebuilds the secret and so knows nothing is hidden.`,
  ],
  [
    VI_InfoAdvanced,
    `Advanced. The presence rules for each field with the spec's reason, then the precedence of key sources in check 1. Stress the re-gift ban and that a disclosed K contradicting the E-derived key rejects.`,
  ],
  [
    VI_InfoGraphical,
    `Graphical. Receive as a pipeline: three possible key sources feed the reconstruction, then the spendability and policy check, then the sweep to a seed-derived secret. Each check has its reject exit.`,
  ],
  [
    VI_InfoTable,
    `Explained via decision table. One row per spend-info shape, matching the V4 token vectors: where the key comes from, what check 1 requires, and who else can spend until the receiver sweeps.`,
  ],
  [
    VI_InfoReceiver,
    `Perspective: receiver. The token arrives, both checks run, and the receiver swaps to seed-derived secrets. The cards on the right are the reasons to sweep for each shape; after the swap they are closed.`,
  ],
  [
    VI_InfoWorked,
    `Worked example end to end. Carol receives the receiver-keyed token with the refund tree, derives K from E, rebuilds the secret, confirms she holds the key path, runs her refund policy, and sweeps.`,
  ],
  [
    VI_InfoFailure,
    `Framing: failure mode. What a dishonest or careless sender could put in spend info and which check stops it. The last row is the one neither check catches, a bearer scalar hiding a tree, which is why receivers sweep.`,
  ],
  [
    VI_InfoAudit,
    `Focus: the auditable lock. NUMS K with u disclosed and one threshold leaf with disclosure: anyone can verify that only P can spend, without keys or a mint. On spend, the mint publishes the witness and input digest; values from the NUT-10 and NUT-07 vectors.`,
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · Nutroot spends and spend info (temporary)',
  createdAt: '2026-09-28T09:02:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
