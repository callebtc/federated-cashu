import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  Arrow,
  At,
  Canvas,
  Cell,
  Code,
  Draw,
  EASE_IO,
  EASE_OUT,
  Fade,
  FoldShapes,
  GFade,
  Label,
  LeafEncoding,
  Lifeline,
  M,
  MATH,
  MONO,
  Note,
  NutrootTree,
  Packet,
  PointSecret,
  Pre,
  REDUCED,
  Row,
  SANS,
  SERIF,
  StepItem,
  StepList,
  T,
  Up,
  VarCover,
  VarShell,
  c,
  foldLayout,
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

// ─── Local helpers (prefix VH_) ──────────────────────────────────────────────

type VH_Tone = 'idle' | 'on' | 'cool' | 'dim' | 'calc' | 'good' | 'bad' | 'violet';
const VH_BORDER: Record<VH_Tone, string> = {
  idle: c.node,
  on: c.clayHex,
  cool: c.cool,
  dim: c.rule,
  calc: c.clayHex,
  good: c.good,
  bad: c.bad,
  violet: c.violet,
};
const VH_BG: Record<VH_Tone, string> = {
  idle: c.card,
  on: c.claySoft,
  cool: c.coolSoft,
  dim: c.card,
  calc: c.card,
  good: c.goodSoft,
  bad: c.badSoft,
  violet: 'rgba(122, 95, 166, 0.10)',
};

const VH_OF_PS = '2.3 The secret is a public key';
const VH_OF_TR = '2.3 Tree, root and tweak';
const VH_OF_LF = '2.3 Condition leaves (leaf version 0x00)';
const VH_OF_FD = '2.3 The fold fixes the shape';

const VH_enter = (show: boolean, delay = 0, dimTo = 0): CSSProperties => ({
  opacity: show ? 1 : dimTo,
  transform: show || REDUCED || dimTo > 0 ? 'translateY(0px)' : 'translateY(6px)',
  transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
});

const VH_Hex = ({ children, size = 21, color }: { children: ReactNode; size?: number; color?: string }) => (
  <span style={{ fontFamily: MONO, fontSize: size, color, transition: `color 300ms ${EASE_OUT}` }}>{children}</span>
);

/** Centered node in page coordinates. */
const VH_Node = ({
  x,
  y,
  w = 200,
  h = 72,
  title,
  sub,
  tone = 'idle',
  show = true,
  delay = 0,
  dashed = false,
  titleSize = 22,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: ReactNode;
  sub?: ReactNode;
  tone?: VH_Tone;
  show?: boolean;
  delay?: number;
  dashed?: boolean;
  titleSize?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.75px ${dashed || tone === 'calc' ? 'dashed' : 'solid'} ${VH_BORDER[tone]}`,
      background: VH_BG[tone],
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      ...VH_enter(show, delay),
    }}
  >
    <div style={{ fontSize: titleSize, lineHeight: 1.2 }}>{title}</div>
    {sub && <div style={{ fontFamily: MONO, fontSize: 21, color: c.muted, marginTop: 3, lineHeight: 1.25 }}>{sub}</div>}
  </div>
);

/** Absolutely positioned card. */
const VH_Card = ({
  x,
  y,
  w,
  h,
  tone = 'dim',
  show = true,
  delay = 0,
  dimTo = 0,
  pad = '14px 20px',
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  tone?: VH_Tone;
  show?: boolean;
  delay?: number;
  dimTo?: number;
  pad?: string;
  children: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.5px ${tone === 'calc' ? 'dashed' : 'solid'} ${VH_BORDER[tone]}`,
      background: VH_BG[tone],
      borderRadius: 12,
      padding: pad,
      ...VH_enter(show, delay, dimTo),
    }}
  >
    {children}
  </div>
);

/** Byte segment with a caption (captions at 20 px). */
const VH_Seg = ({
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
  const bg = hot ? c.claySoft : tone === 'type' ? c.claySoft : tone === 'bad' ? c.badSoft : tone === 'good' ? c.goodSoft : tone === 'len' ? c.panel : c.card;
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 8,
        ...VH_enter(show, delay),
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: size,
          padding: '6px 10px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          border: `1.5px solid ${border}`,
          background: bg,
          color: tone === 'bad' ? c.bad : c.ink,
          transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
        }}
      >
        {bytes}
      </span>
      {label && (
        <span style={{ fontSize: 20, color: hot ? c.clayHex : c.muted, marginTop: 6, whiteSpace: 'nowrap', transition: `color 300ms ${EASE_OUT}` }}>
          {label}
        </span>
      )}
    </div>
  );
};

const VH_Pill = ({ children, tone = 'dim', size = 22, mono = false }: { children: ReactNode; tone?: VH_Tone; size?: number; mono?: boolean }) => (
  <span
    style={{
      display: 'inline-block',
      border: `1.5px solid ${VH_BORDER[tone]}`,
      background: VH_BG[tone],
      color: tone === 'bad' ? c.bad : tone === 'good' ? c.good : c.ink,
      borderRadius: 8,
      padding: '5px 14px',
      fontSize: size,
      fontFamily: mono ? MONO : SANS,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

/** One line of a code listing, highlightable. */
const VH_CL = ({ on = false, children }: { on?: boolean; children?: ReactNode }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 21,
      lineHeight: 1.7,
      whiteSpace: 'pre',
      padding: '0 10px',
      margin: '0 -10px',
      borderRadius: 6,
      background: on ? c.claySoft : 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    {children ?? ' '}
  </div>
);

const VH_Li = ({ children, color = c.clayHex }: { children: ReactNode; color?: string }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
    <span style={{ color, fontFamily: MONO, flexShrink: 0 }}>–</span>
    <span>{children}</span>
  </div>
);

/** Caption without uppercase transform: for labels that contain math, hex or vector names. */
const VH_Cap = ({ children, color = c.muted, mono = false }: { children: ReactNode; color?: string; mono?: boolean }) => (
  <div style={{ fontSize: mono ? 21 : 22, fontFamily: mono ? MONO : SANS, color, transition: `color 300ms ${EASE_OUT}` }}>{children}</div>
);

const VH_Cat = () => <span style={{ fontFamily: SANS }}> ‖ </span>;

// ═════════════════════════════════════════════════════════════════════════════
// Group 1 · 2.3 The secret is a public key
// ═════════════════════════════════════════════════════════════════════════════

const VH_PsBeginner: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_PS} lens="Beginner" title="A secret made from a key pair" proc={proc}>
      <At x={120} y={262} w={1200}>
        <Fade show={s >= 1}>
          <Label color={s === 1 ? c.clayHex : c.muted}>1 · Private key</Label>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 28 }}>
            <M size={44}>k = 7</M>
            <Note>a number between 1 and n − 1; 7 is one of the spec's test keys</Note>
          </div>
        </Fade>
      </At>
      <At x={120} y={392} w={1200}>
        <Fade show={s >= 2}>
          <Label color={s === 2 ? c.clayHex : c.muted}>2 · Public key</Label>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 28 }}>
            <M size={44}>K = k·G = 7·G</M>
            <Note>G is the fixed generator point of secp256k1</Note>
          </div>
        </Fade>
      </At>
      <At x={120} y={522} w={1200}>
        <Fade show={s >= 3}>
          <Label color={s === 3 ? c.clayHex : c.muted}>3 · Compressed encoding, 33 bytes</Label>
          <div style={{ display: 'flex', marginTop: 10 }}>
            <VH_Seg bytes="02" label="y is even" tone="type" />
            <VH_Seg bytes="5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc" label="x-coordinate, 32 bytes" />
          </div>
        </Fade>
      </At>
      <At x={120} y={668} w={1200}>
        <Fade show={s >= 4}>
          <Label color={s === 4 ? c.clayHex : c.muted}>4 · The proof's secret</Label>
          <div style={{ marginTop: 8 }}>
            <VH_Hex>
              <span style={{ color: c.dim }}>"secret": </span>
              "025cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc"
            </VH_Hex>
          </div>
          <div style={{ marginTop: 10 }}>
            <M size={30}>
              Y = <Up>hash_to_curve_G1</Up>(33 bytes)
            </M>
          </div>
        </Fade>
      </At>
      <At x={120} y={820} w={1200}>
        <Fade show={s >= 5}>
          <Label color={s === 5 ? c.clayHex : c.muted}>5 · Spending</Label>
          <Note style={{ marginTop: 6, color: c.ink }}>
            Witness: one BIP-340 signature by <M>k</M> over the input digest of the transaction.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Pick a private key <M>k</M>: a number. The vectors use test keys such as 7.
        </StepItem>
        <StepItem n={2} step={s}>
          The public key is <M>K = k·G</M>, a point on secp256k1.
        </StepItem>
        <StepItem n={3} step={s}>
          A point is written in 33 bytes: a prefix for the parity of <M>y</M>, then <M>x</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          Those bytes are the secret. The wallet hashes them to <M>Y</M> for blind signing, as before.
        </StepItem>
        <StepItem n={5} step={s}>
          Spending needs a signature by <M>k</M>, so only the key holder can spend.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_Rule = ({ kw, children }: { kw: string; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 20, padding: '6px 0', fontSize: 23, lineHeight: 1.4 }}>
    <span
      style={{
        width: 130,
        flexShrink: 0,
        fontFamily: MONO,
        fontSize: 20,
        paddingTop: 3,
        color: kw === 'MUST NOT' ? c.bad : kw === 'SHOULD' ? c.cool : kw === 'MUST' ? c.clayHex : c.dim,
      }}
    >
      {kw}
    </span>
    <span>{children}</span>
  </div>
);

const VH_RuleGroup = ({ title, n, s, children }: { title: string; n: number; s: number; children: ReactNode }) => (
  <Fade show={s >= n} dimTo={0.28} style={{ marginBottom: 12 }}>
    <Label color={s === n ? c.clayHex : c.muted}>{title}</Label>
    <div style={{ marginTop: 4 }}>{children}</div>
  </Fade>
);

const VH_PsAdvanced: Page = () => {
  const proc = useProcess(4, 2600);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_PS} lens="Advanced" title="Point secrets: rules and edge cases" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VH_RuleGroup title="Encoding" n={1} s={s}>
          <VH_Rule kw="MUST">
            Mints reject any secret that is not a 33-byte compressed point, on keysets with version byte 02 or later.
          </VH_Rule>
          <VH_Rule kw="·">
            On 00 and 01 keysets a point-shaped string is a random string: the keyset version selects the rules, not the
            secret's shape.
          </VH_Rule>
          <VH_Rule kw="·">
            <M>Y</M> = <Code>hash_to_curve_G1</Code> over the decoded 33 bytes. Pre-v3 <M>Y</M> is on secp256k1, v3{' '}
            <M>Y</M> in BLS12-381 G₁: the spaces cannot overlap.
          </VH_Rule>
        </VH_RuleGroup>
        <VH_RuleGroup title="Key path" n={2} s={s}>
          <VH_Rule kw="MUST">
            Exactly one BIP-340 signature, checked against x(secret): by <M>k</M> for a bare secret, by{' '}
            <M>p′ = (k + t) mod n</M> for a tweaked one.
          </VH_Rule>
          <VH_Rule kw="·">
            <M>t</M> is used mod <M>n</M> and never rejected. BIP341 rejects a tweak at or above the curve order.
          </VH_Rule>
        </VH_RuleGroup>
        <VH_RuleGroup title="x-only aliasing" n={3} s={s}>
          <VH_Rule kw="MUST NOT">
            Assume an x-only key identifies one proof: <Code>02</Code> ‖ <M>x</M> and <Code>03</Code> ‖ <M>x</M> are two
            secrets with separate <M>Y</M>, and one scalar key-path spends both.
          </VH_Rule>
        </VH_RuleGroup>
        <VH_RuleGroup title="Uniqueness and derivation" n={4} s={s}>
          <VH_Rule kw="MUST">
            An aggregated <M>K</M> (MuSig2, FROST) carries at least the empty tweak{' '}
            <Code>tagged_hash("Cashu_NutrootTweak", K)</Code>.
          </VH_Rule>
          <VH_Rule kw="MUST">
            v3 key derivations are hardened at every step: one non-hardened child plus the xpub recovers the parent and
            every sibling.
          </VH_Rule>
          <VH_Rule kw="SHOULD">
            Check each new secret against those already used. Outputs are blinded, so reuse surfaces only when the first
            spend burns <M>Y</M>.
          </VH_Rule>
        </VH_RuleGroup>
      </At>
    </VarShell>
  );
};

const VH_PsGraphic: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  return (
    <VarShell of={VH_OF_PS} lens="Graphical" title="Bare key and tweaked key on the wire" proc={proc}>
      <Canvas>
        <GFade show={s >= 1}>
          <circle cx={220} cy={620} r={46} style={{ fill: c.card, stroke: c.ink, strokeWidth: 1.75 }} />
        </GFade>
        <T x={220} y={633} font="math" size={40} show={s >= 1}>
          k
        </T>
        <Arrow x1={268} y1={620} x2={346} y2={620} show={s >= 1} />
        <T x={307} y={600} font="math" size={28} color={c.muted} show={s >= 1} delay={250}>
          ·G
        </T>

        <GFade show={s >= 2}>
          <line x1={590} y1={272} x2={620} y2={318} style={{ stroke: c.node, strokeWidth: 1.75 }} />
          <line x1={650} y1={272} x2={620} y2={318} style={{ stroke: c.node, strokeWidth: 1.75 }} />
          <line x1={710} y1={272} x2={710} y2={318} style={{ stroke: c.cool, strokeWidth: 1.75, strokeDasharray: '4 5' }} />
          <line x1={620} y1={318} x2={665} y2={364} style={{ stroke: c.node, strokeWidth: 1.75 }} />
          <line x1={710} y1={318} x2={665} y2={364} style={{ stroke: c.node, strokeWidth: 1.75 }} />
          <circle cx={590} cy={272} r={9} style={{ fill: c.card, stroke: c.ink, strokeWidth: 1.75 }} />
          <circle cx={650} cy={272} r={9} style={{ fill: c.card, stroke: c.ink, strokeWidth: 1.75 }} />
          <circle cx={710} cy={272} r={9} style={{ fill: c.card, stroke: c.ink, strokeWidth: 1.75 }} />
          <circle cx={620} cy={318} r={7} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.75 }} />
          <circle cx={710} cy={318} r={7} style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 1.75, strokeDasharray: '3 3' }} />
          <circle cx={665} cy={364} r={11} style={{ fill: c.clayHex, stroke: c.clayHex, strokeWidth: 1.75 }} />
        </GFade>
        <Arrow x1={665} y1={378} x2={665} y2={414} show={s >= 2} color={c.clayHex} />
        <T x={688} y={404} font="math" size={30} color={c.clayHex} anchor="start" show={s >= 2}>
          t
        </T>

        <Draw x1={430} y1={580} x2={430} y2={440} show={s >= 3} color={c.node} width={2} dur={500} />
        <Arrow x1={430} y1={440} x2={639} y2={440} show={s >= 3} delay={350} />
        <T x={534} y={424} size={22} color={c.muted} show={s >= 3} delay={400}>
          tweaked
        </T>
        <GFade show={s >= 3} delay={500}>
          <circle cx={665} cy={440} r={24} style={{ fill: c.card, stroke: c.clayHex, strokeWidth: 2 }} />
          <text x={665} y={450} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 30, fill: c.clayHex }}>
            +
          </text>
        </GFade>
        <Arrow x1={689} y1={440} x2={748} y2={440} show={s >= 3} delay={650} />
        <Packet run={run(3)} x1={440} y1={440} x2={640} y2={440} color={c.clayHex} delay={300} />

        <Draw x1={430} y1={658} x2={430} y2={800} show={s >= 4} color={c.node} width={2} dur={500} />
        <Arrow x1={430} y1={800} x2={998} y2={800} show={s >= 4} delay={350} />
        <T x={700} y={786} size={22} color={c.muted} show={s >= 4} delay={400}>
          bare
        </T>
        <Arrow x1={952} y1={440} x2={998} y2={440} show={s >= 4} />
        <Packet run={run(4)} x1={440} y1={800} x2={998} y2={800} color={c.cool} delay={300} />
        <Packet run={run(4)} x1={952} y1={440} x2={998} y2={440} color={c.clayHex} delay={300} />
        <GFade show={s >= 4} delay={600}>
          <line x1={1170} y1={488} x2={1170} y2={598} style={{ stroke: c.clayHex, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
          <line x1={1170} y1={650} x2={1170} y2={756} style={{ stroke: c.clayHex, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
        </GFade>
        <T x={1170} y={633} size={28} color={c.clayHex} show={s >= 4} delay={600}>
          indistinguishable
        </T>

        <Arrow x1={1340} y1={440} x2={1458} y2={440} show={s >= 5} />
        <Arrow x1={1340} y1={800} x2={1458} y2={800} show={s >= 5} />
        <T x={1398} y={424} size={22} color={c.muted} show={s >= 5} delay={300}>
          sig
        </T>
        <T x={1398} y={784} size={22} color={c.muted} show={s >= 5} delay={300}>
          sig
        </T>
        <Packet run={run(5)} x1={1340} y1={440} x2={1460} y2={440} color={c.clayHex} delay={200} />
        <Packet run={run(5)} x1={1340} y1={800} x2={1460} y2={800} color={c.cool} delay={200} />
      </Canvas>

      <VH_Node x={430} y={620} w={170} h={76} title={<M size={32}>K = k·G</M>} show={s >= 1} delay={300} />
      <VH_Node x={850} y={440} w={200} h={76} title={<M size={30}>P = K + t·G</M>} tone="on" show={s >= 3} delay={800} />
      <VH_Node
        x={1170}
        y={440}
        w={340}
        h={84}
        title={<VH_Hex size={24}>02d310a4…9ef8f828</VH_Hex>}
        sub="33 B"
        tone={s >= 4 ? 'on' : 'idle'}
        show={s >= 4}
        delay={200}
      />
      <VH_Node
        x={1170}
        y={800}
        w={340}
        h={84}
        title={<VH_Hex size={24}>03a3e12c…3a419e51</VH_Hex>}
        sub="33 B"
        tone={s >= 4 ? 'cool' : 'idle'}
        show={s >= 4}
        delay={500}
      />
      <VH_Card x={1460} y={400} w={340} h={440} show={s >= 5} delay={150} pad="26px 24px">
        <Label>mint</Label>
        <div style={{ marginTop: 22 }}>
          <M size={28}>Y =</M>
        </div>
        <div>
          <M size={28}>
            <Up>hash_to_curve_G1</Up>(33 B)
          </M>
        </div>
        <div style={{ height: 1.5, background: c.rule, margin: '30px 0' }} />
        <div style={{ fontSize: 24, lineHeight: 1.4 }}>one BIP-340 signature, checked against x(secret)</div>
      </VH_Card>
    </VarShell>
  );
};

const VH_Bar = ({ bytes, px, on = false, show, label }: { bytes: number; px: number; on?: boolean; show: boolean; label: ReactNode }) => (
  <Fade show={show} dimTo={0}>
    <Label color={on ? c.clayHex : c.muted}>{label}</Label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
      <div
        style={{
          width: bytes * px,
          height: 40,
          boxSizing: 'border-box',
          borderRadius: 6,
          background: on ? c.claySoft : c.panel,
          border: `1.5px solid ${on ? c.clayHex : c.line}`,
        }}
      />
      <span style={{ fontFamily: MONO, fontSize: 21, color: on ? c.clayHex : c.muted }}>{bytes} B</span>
    </div>
  </Fade>
);

const VH_PsBytes: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const PX = 3.4;
  return (
    <VarShell of={VH_OF_PS} lens="Explained via bytes" title="The secret as bytes, before and after v3" proc={proc}>
      <At x={120} y={262} w={1220}>
        <VH_Bar bytes={64} px={PX} show={s >= 1} label="v1, v2 · random secret: 64 hex characters, hashed as UTF-8" />
      </At>
      <At x={120} y={372} w={1220}>
        <VH_Bar bytes={195} px={PX} show={s >= 2} label="v1, v2 · P2PK JSON secret (NUT-11 example)" />
      </At>
      <At x={120} y={482} w={1220}>
        <VH_Bar bytes={323} px={PX} show={s >= 2} label="v1, v2 · HTLC JSON secret (NUT-14 example)" />
      </At>
      <At x={120} y={592} w={1220}>
        <VH_Bar bytes={33} px={PX} on show={s >= 3} label="v3 · compressed point, with or without conditions" />
      </At>
      <At x={120} y={700} w={1220}>
        <Fade show={s >= 4}>
          <Label color={s === 4 ? c.clayHex : c.muted}>v3 secret, byte by byte</Label>
          <div style={{ display: 'flex', marginTop: 10 }}>
            <VH_Seg bytes="02" label="byte 0: parity of y" tone="type" />
            <VH_Seg bytes="d310a4d661e3158e7d360617e739d6bacbf015431b24a43168db0ab99ef8f828" label="bytes 1–32: x-coordinate" />
          </div>
        </Fade>
      </At>
      <At x={120} y={840} w={1220}>
        <Fade show={s >= 5}>
          <Label color={s === 5 ? c.clayHex : c.muted}>Key-path witness</Label>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 10 }}>
            <VH_Seg bytes="R.x · 32 B" label="nonce point, x only" />
            <VH_Seg bytes="s · 32 B" label="scalar" />
            <Note style={{ marginLeft: 20, marginTop: 6 }}>128 hex characters in the witness JSON</Note>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Before v3 a secret is a string. A random one is 64 hex characters, hashed as 64 UTF-8 bytes.
        </StepItem>
        <StepItem n={2} step={s}>
          A JSON secret grows with its policy: 195 B for P2PK, 323 B for the HTLC example.
        </StepItem>
        <StepItem n={3} step={s}>
          In v3 the secret is always 33 bytes, with or without conditions.
        </StepItem>
        <StepItem n={4} step={s}>
          Byte 0 is 02 or 03, the parity of <M>y</M>; then 32 bytes of <M>x</M>. <M>Y</M> hashes the decoded bytes.
        </StepItem>
        <StepItem n={5} step={s}>
          The key-path witness is one 64-byte signature, bare or tweaked.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_Small = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 20, color: c.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{children}</div>
);

const VH_PsMint: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const tone = (n: number): VH_Tone => (s === n ? 'on' : s >= 4 && n <= 2 ? 'cool' : 'dim');
  return (
    <VarShell of={VH_OF_PS} lens="Perspective: mint" title="What the mint receives" proc={proc}>
      <VH_Card x={120} y={262} w={540} h={470} tone={tone(1)} show={s >= 1} pad="16px 22px">
        <Label color={s === 1 ? c.clayHex : c.muted}>A · bare key, key path</Label>
        <div style={{ marginTop: 14 }}>
          <VH_Small>secret</VH_Small>
          <VH_Hex size={22}>03a3e12c…3a419e51</VH_Hex>
        </div>
        <div style={{ marginTop: 14 }}>
          <VH_Small>witness</VH_Small>
          <div style={{ marginTop: 4 }}>
            <Pre size={21}>{`{ "signatures": ["<64 B>"] }`}</Pre>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <VH_Small>the mint learns</VH_Small>
          <div style={{ fontSize: 23, lineHeight: 1.4, marginTop: 4 }}>a key signed the input digest</div>
        </div>
      </VH_Card>
      <VH_Card x={690} y={262} w={540} h={470} tone={tone(2)} show={s >= 2} pad="16px 22px">
        <Label color={s === 2 ? c.clayHex : c.muted}>B · tweaked key, key path</Label>
        <div style={{ marginTop: 14 }}>
          <VH_Small>secret</VH_Small>
          <VH_Hex size={22}>02d310a4…9ef8f828</VH_Hex>
        </div>
        <div style={{ marginTop: 14 }}>
          <VH_Small>witness</VH_Small>
          <div style={{ marginTop: 4 }}>
            <Pre size={21}>{`{ "signatures": ["<64 B>"] }`}</Pre>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <VH_Small>the mint learns</VH_Small>
          <div style={{ fontSize: 23, lineHeight: 1.4, marginTop: 4 }}>a key signed the input digest</div>
        </div>
      </VH_Card>
      <VH_Card x={1260} y={262} w={540} h={470} tone={tone(3)} show={s >= 3} pad="16px 22px">
        <Label color={s === 3 ? c.clayHex : c.muted}>C · tweaked key, script path</Label>
        <div style={{ marginTop: 14 }}>
          <VH_Small>secret</VH_Small>
          <VH_Hex size={22}>02d310a4…9ef8f828</VH_Hex>
        </div>
        <div style={{ marginTop: 14 }}>
          <VH_Small>witness</VH_Small>
          <div style={{ marginTop: 4 }}>
            <Pre size={21}>{`{ "leaf": "0002…68a3be80",
  "control": { "K": "03a3e12c…",
               "path": [] },
  "signatures": ["<64 B>"] }`}</Pre>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <VH_Small>the mint learns</VH_Small>
          <div style={{ fontSize: 23, lineHeight: 1.4, marginTop: 4 }}>
            the after leaf: key 4, time 1755561600; the internal key <M>K</M>; a one-leaf tree
          </div>
        </div>
      </VH_Card>
      <At x={120} y={774} w={1680}>
        <Fade show={s >= 4}>
          <Note style={{ color: c.ink }}>
            A and B have the same fields and the same lengths: the mint cannot tell whether a tree exists. C discloses the
            exercised leaf, <M>K</M> and the path; any other leaves would stay hashes.
          </Note>
          <Note style={{ marginTop: 12 }}>
            All three sign the input digest of the transaction transcript. Values: receiver-keyed vectors of NUT-10.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VH_Payload = ({
  x,
  y,
  w,
  h,
  show,
  hot,
  title,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  show: boolean;
  hot: boolean;
  title: string;
  children: ReactNode;
}) => (
  <VH_Card x={x} y={y} w={w} h={h} tone={hot ? 'on' : 'dim'} show={show} pad="12px 20px">
    <Label color={hot ? c.clayHex : c.muted}>{title}</Label>
    <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 8 }}>{children}</div>
  </VH_Card>
);

const VH_PsTravel: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  return (
    <VarShell of={VH_OF_PS} lens="Framing: before and after" title="Where the conditions travel" proc={proc}>
      <At x={120} y={262}>
        <Label>Keysets v1, v2 · JSON secret</Label>
      </At>
      <At x={120} y={600}>
        <Label color={c.clayHex}>Keyset v3 · point secret</Label>
      </At>
      <Canvas>
        <Arrow x1={320} y1={330} x2={768} y2={330} show={s >= 1} />
        <Arrow x1={952} y1={330} x2={1538} y2={330} show={s >= 2} />
        <Arrow x1={320} y1={668} x2={768} y2={668} show={s >= 3} />
        <Arrow x1={952} y1={668} x2={1538} y2={668} show={s >= 4} />
        <T x={544} y={316} size={22} color={c.muted} show={s >= 1}>
          token
        </T>
        <T x={1245} y={316} size={22} color={c.muted} show={s >= 2}>
          swap request
        </T>
        <T x={544} y={654} size={22} color={c.muted} show={s >= 3}>
          token
        </T>
        <T x={1245} y={654} size={22} color={c.muted} show={s >= 4}>
          swap request
        </T>
        <Packet run={run(1)} x1={320} y1={330} x2={768} y2={330} delay={300} />
        <Packet run={run(2)} x1={952} y1={330} x2={1540} y2={330} delay={300} />
        <Packet run={run(3)} x1={320} y1={668} x2={768} y2={668} delay={300} />
        <Packet run={run(4)} x1={952} y1={668} x2={1540} y2={668} delay={300} />
      </Canvas>
      <VH_Node x={230} y={330} w={180} h={56} title="sender" tone="cool" />
      <VH_Node x={860} y={330} w={180} h={56} title="receiver" tone="cool" />
      <VH_Node x={1640} y={330} w={200} h={56} title="mint" />
      <VH_Node x={230} y={668} w={180} h={56} title="sender" tone="cool" />
      <VH_Node x={860} y={668} w={180} h={56} title="receiver" tone="cool" />
      <VH_Node x={1640} y={668} w={200} h={56} title="mint" />

      <VH_Payload x={330} y={378} w={430} h={180} show={s >= 1} hot={s === 1} title="token proof">
        <div>
          <Code>secret</Code>: JSON with kind, data and tags
        </div>
        <div style={{ color: c.muted }}>195 B for a P2PK lock</div>
      </VH_Payload>
      <VH_Payload x={960} y={378} w={560} h={180} show={s >= 2} hot={s === 2} title="swap input">
        <div>
          <Code>secret</Code>: the same JSON
        </div>
        <div>
          <Code>witness</Code>: signatures
        </div>
        <div style={{ color: c.clayHex }}>the mint reads the whole policy</div>
      </VH_Payload>
      <VH_Payload x={330} y={716} w={430} h={220} show={s >= 3} hot={s === 3} title="token proof + spend info">
        <div>
          <Code>secret</Code>: a 33-byte point
        </div>
        <div style={{ color: c.clayHex }}>
          <Code>spend_info</Code>: k or E, K, tree, u
        </div>
        <div style={{ color: c.muted }}>tree: every leaf, in full</div>
      </VH_Payload>
      <VH_Payload x={960} y={716} w={560} h={220} show={s >= 4} hot={s === 4} title="swap input">
        <div>
          <Code>secret</Code>: the same 33 bytes
        </div>
        <div>
          <Code>witness</Code>: one signature, or one leaf with <M>K</M>, path and signatures
        </div>
        <div style={{ color: c.clayHex }}>spend info stays with the wallets</div>
      </VH_Payload>
      <At x={1560} y={390} w={240}>
        <Fade show={s >= 2}>
          <Note style={{ fontSize: 22 }}>sees every condition on every spend</Note>
        </Fade>
      </At>
      <At x={1560} y={728} w={240}>
        <Fade show={s >= 4}>
          <Note style={{ fontSize: 22 }}>sees nothing on the key path, one leaf on a script path</Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VH_SecretRow = ({ y, label, hex, show, delay, tone = 'dim' }: { y: number; label: ReactNode; hex: string; show: boolean; delay: number; tone?: VH_Tone }) => (
  <VH_Card x={580} y={y} w={760} h={90} tone={tone} show={show} delay={delay} pad="0 24px">
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <span style={{ width: 320, fontSize: 22, color: c.muted }}>{label}</span>
      <VH_Hex size={23}>{hex}</VH_Hex>
    </div>
  </VH_Card>
);

const VH_PsUnique: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_PS} lens="Focus: uniqueness" title="One internal key, four secrets" proc={proc}>
      <Canvas>
        <Arrow x1={462} y1={500} x2={576} y2={307} show={s >= 1} color={c.node} delay={100} />
        <Arrow x1={462} y1={500} x2={576} y2={417} show={s >= 1} color={c.node} delay={180} />
        <Arrow x1={462} y1={500} x2={576} y2={527} show={s >= 1} color={c.node} delay={260} />
        <Arrow x1={462} y1={500} x2={576} y2={637} show={s >= 1} color={c.node} delay={340} />
      </Canvas>
      <VH_Card x={120} y={430} w={340} h={140} tone="cool" show={s >= 1}>
        <Label color={c.cool}>internal key K</Label>
        <div style={{ marginTop: 10 }}>
          <VH_Hex size={23}>03a3e12c…3a419e51</VH_Hex>
        </div>
        <Note style={{ fontSize: 21, marginTop: 4 }}>the vectors' receiver key</Note>
      </VH_Card>
      <VH_SecretRow y={262} label="no tree: secret = K" hex="03a3e12c…3a419e51" show={s >= 1} delay={150} />
      <VH_SecretRow y={372} label="empty tweak (aggregated form)" hex="03231881…12f79747" show={s >= 1} delay={230} />
      <VH_SecretRow y={482} label="tree: one after leaf" hex="02d310a4…9ef8f828" show={s >= 1} delay={310} />
      <VH_SecretRow y={592} label="tree: three leaves" hex="022d17fd…d51b9999" show={s >= 1} delay={390} />
      <At x={120} y={722} w={1220}>
        <Fade show={s >= 2}>
          <Label color={s === 2 ? c.clayHex : c.muted}>Same x-coordinate, other prefix</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 8 }}>
            <VH_Pill mono tone="cool">
              03a3e12c…3a419e51
            </VH_Pill>
            <span style={{ fontSize: 28 }}>≠</span>
            <VH_Pill mono tone="on">
              02a3e12c…3a419e51
            </VH_Pill>
            <Note style={{ marginLeft: 12 }}>separate Y, one scalar spends both</Note>
          </div>
        </Fade>
      </At>
      <At x={120} y={838} w={1220}>
        <Fade show={s >= 3}>
          <Label color={s === 3 ? c.clayHex : c.muted}>A fresh K per proof</Label>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <VH_Pill>seed-derived (NUT-13)</VH_Pill>
            <VH_Pill>blinded static key (NUT-28)</VH_Pill>
            <VH_Pill>random keypair</VH_Pill>
            <VH_Pill>NUMS offset u</VH_Pill>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The tweak hashes <M>K</M> and the root, so one <M>K</M> gives a different secret for every tree.
        </StepItem>
        <StepItem n={2} step={s}>
          Flipping the prefix byte gives another secret with its own <M>Y</M>. Signatures verify against <M>x</M> only.
        </StepItem>
        <StepItem n={3} step={s}>
          Wallets SHOULD still use a fresh <M>K</M> per proof: a script-path spend reveals <M>K</M> and links proofs that
          share it.
        </StepItem>
        <Note style={{ marginTop: 18, fontSize: 21 }}>
          Reuse is invisible at issuance, since outputs are blinded. It surfaces when the first spend burns <M>Y</M>. The
          empty-tweak value is computed; the others are vectors.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Group 2 · 2.3 Tree, root and tweak
// ═════════════════════════════════════════════════════════════════════════════

const VH_TrBeginner: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_TR} lens="Beginner" title="One leaf, one tweak, one secret" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Fade show={s >= 1}>
          <Label color={s === 1 ? c.clayHex : c.muted}>1 · Condition: key 4 may spend from 2025-08-19</Label>
          <div style={{ display: 'flex', marginTop: 10 }}>
            <VH_Seg bytes="00" label="version" tone="type" />
            <VH_Seg bytes="02" label="type: after" tone="type" />
            <VH_Seg bytes="02 0001 01" label="n = 1" />
            <VH_Seg bytes="04 0021 02e493…c4cd13" label="keys: key 4" />
            <VH_Seg bytes="06 0004 68a3be80" label="time 1755561600" />
          </div>
        </Fade>
      </At>
      <At x={120} y={410} w={1220}>
        <Fade show={s >= 2}>
          <Label color={s === 2 ? c.clayHex : c.muted}>2 · Leaf hash, 32 bytes</Label>
          <div style={{ marginTop: 6 }}>
            <VH_Hex size={22}>tagged_hash("Cashu_NutrootLeaf", leaf) =</VH_Hex>
          </div>
          <div>
            <VH_Hex size={22} color={c.clayHex}>
              9ed9c0b8907f7af4fce51cbeac218907bbf80ba40f3342df2406bce30616589a
            </VH_Hex>
          </div>
        </Fade>
      </At>
      <At x={120} y={540} w={1220}>
        <Fade show={s >= 3}>
          <Label color={s === 3 ? c.clayHex : c.muted}>3 · Root: one leaf, so the root is the leaf hash</Label>
          <div style={{ marginTop: 6 }}>
            <VH_Hex size={22}>root = 9ed9c0b8…0616589a</VH_Hex>
          </div>
        </Fade>
      </At>
      <At x={120} y={640} w={1220}>
        <Fade show={s >= 4}>
          <Label color={s === 4 ? c.clayHex : c.muted}>4 · Tweak from the internal key and the root</Label>
          <div style={{ marginTop: 6 }}>
            <VH_Hex size={22}>
              t = tagged_hash("Cashu_NutrootTweak", K<VH_Cat />root)
            </VH_Hex>
          </div>
          <div>
            <VH_Hex size={22}>
              K = 03a3e12c…3a419e51 <span style={{ color: c.dim }}>→</span>{' '}
              <span style={{ color: c.clayHex }}>t = b3b7846b…5effe8a4</span>
            </VH_Hex>
          </div>
        </Fade>
      </At>
      <At x={120} y={770} w={1220}>
        <Fade show={s >= 5}>
          <Label color={s === 5 ? c.clayHex : c.muted}>5 · Secret</Label>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <M size={34}>P = K + t·G =</M>
            <VH_Hex size={22} color={c.clayHex}>
              02d310a4d661e3158e7d360617e739d6bacbf015431b24a43168db0ab99ef8f828
            </VH_Hex>
          </div>
          <Note style={{ marginTop: 8 }}>
            Key path: sign with <M>(k + t) mod n</M>. Leaf: key 4 signs from 2025-08-19.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Write the condition as a leaf: a few typed byte fields.
        </StepItem>
        <StepItem n={2} step={s}>
          Hash the leaf with SHA-256 under the tag <Code>Cashu_NutrootLeaf</Code> (BIP340 tagged hash).
        </StepItem>
        <StepItem n={3} step={s}>
          With one leaf the root is that hash. More leaves are paired until one hash remains.
        </StepItem>
        <StepItem n={4} step={s}>
          Hash the internal key and the root together: the result is the tweak <M>t</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          Add <M>t·G</M> to <M>K</M>. The secret now commits to the key and to every leaf.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_Strip = ({ w, label, value, tone = 'field' }: { w: number; label: string; value: string; tone?: 'field' | 'type' | 'good' }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginRight: 8 }}>
    <div
      style={{
        width: w,
        height: 46,
        boxSizing: 'border-box',
        border: `1.5px solid ${tone === 'type' ? c.clayHex : tone === 'good' ? c.good : c.rule}`,
        background: tone === 'type' ? c.claySoft : tone === 'good' ? c.goodSoft : c.card,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: 21,
      }}
    >
      {value}
    </div>
    <span style={{ fontSize: 20, color: c.muted, marginTop: 6 }}>{label}</span>
  </div>
);

const VH_TrAdvanced: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_TR} lens="Advanced" title="The tweak, byte for byte" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Fade show={s >= 1} dimTo={0.3}>
          <Label color={s === 1 ? c.clayHex : c.muted}>Tag hashes, SHA256(tag)</Label>
          <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.5, marginTop: 6, whiteSpace: 'pre' }}>
            <div>Cashu_NutrootLeaf    e19ba80c5d6798399efd68b1d3b0e7ad57e79a2777310a9e6334934ee7a0b52b</div>
            <div>Cashu_NutrootBranch  f54194fd19dabbcca1474f329fe5ec065fc54d94063d14ae820788ba5bd8e55e</div>
            <div>Cashu_NutrootTweak   cc14d6872e6d0bc79a3dadb4c43f9362916bb6df512126dda139e65b812facd1</div>
          </div>
        </Fade>
      </At>
      <At x={120} y={420} w={1220}>
        <Fade show={s >= 2} dimTo={0.3}>
          <Label color={s === 2 ? c.clayHex : c.muted}>Tweak message: 129 bytes into SHA-256</Label>
          <div style={{ display: 'flex', marginTop: 10 }}>
            <VH_Strip w={224} label="tag hash, 32 B" value="cc14d687…" />
            <VH_Strip w={224} label="tag hash, 32 B" value="cc14d687…" />
            <VH_Strip w={231} label="K, compressed, 33 B" value="03a3e12c…" tone="type" />
            <VH_Strip w={224} label="merkle root, 32 B" value="3d4fbecf…" tone="good" />
          </div>
        </Fade>
      </At>
      <At x={120} y={562} w={1220}>
        <Fade show={s >= 3} dimTo={0.3}>
          <div style={{ display: 'flex', gap: 30 }}>
            <div style={{ flex: 1, border: `1.5px solid ${c.rule}`, borderRadius: 12, padding: '12px 20px', background: c.card }}>
              <Label>BIP341 TapTweak</Label>
              <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 6 }}>
                <div>message: x(P), 32 B ‖ root</div>
                <div>
                  <M>t ≥ n</M>: the tweak fails
                </div>
              </div>
            </div>
            <div style={{ flex: 1, border: `1.5px solid ${c.clayHex}`, borderRadius: 12, padding: '12px 20px', background: c.claySoft }}>
              <Label color={c.clayHex}>Nutroot</Label>
              <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 6 }}>
                <div>message: K, 33 B ‖ root</div>
                <div>
                  <M>t</M> is reduced mod <M>n</M>, never rejected
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </At>
      <At x={120} y={702} w={1220}>
        <Fade show={s >= 4} dimTo={0.3}>
          <Label color={s === 4 ? c.clayHex : c.muted}>Empty tweak: aggregated K, no tree</Label>
          <div style={{ marginTop: 6 }}>
            <VH_Hex size={22}>t = tagged_hash("Cashu_NutrootTweak", K)</VH_Hex>
          </div>
          <Note style={{ fontSize: 22 }}>
            Vector, <M>K</M> = key 3: <Code>t = 764c0e0d…d5b69908</Code>, secret <Code>03b2bb25…06d9233aee</Code>
          </Note>
        </Fade>
      </At>
      <At x={120} y={832} w={1220}>
        <Fade show={s >= 5} dimTo={0.3}>
          <Label color={s === 5 ? c.clayHex : c.muted}>Result</Label>
          <div style={{ marginTop: 6 }}>
            <M size={32}>P = K + t·G</M>
            <span style={{ fontSize: 24, color: c.muted }}>&nbsp;&nbsp;·&nbsp;&nbsp;key-path signer&nbsp;&nbsp;</span>
            <M size={32}>p′ = (k + t) mod n</M>
          </div>
          <Note style={{ fontSize: 22 }}>
            Three-leaf vector: <Code>t = ea08208d…6bf26eaf</Code>, <Code>P = 022d17fd…d51b9999</Code>
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Each tag hashes once to 32 bytes; the message is prefixed with it twice.
        </StepItem>
        <StepItem n={2} step={s}>
          The tweak message is <M>K</M> in 33-byte compressed form, then the root.
        </StepItem>
        <StepItem n={3} step={s}>
          The digest is reduced mod <M>n</M>. BIP341 fails instead when <M>t ≥ n</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          Without a tree the message is <M>K</M> alone. Aggregated keys MUST carry this empty tweak.
        </StepItem>
        <StepItem n={5} step={s}>
          The key-path signer adds <M>t</M> to <M>k</M>. BIP-340 signing negates the scalar when the point has odd{' '}
          <M>y</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_TrGraphic: Page = () => {
  const proc = useProcess(6, 1900);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  const R = [380, 560, 740];
  return (
    <VarShell of={VH_OF_TR} lens="Graphical" title="Leaves to secret" proc={proc}>
      <Canvas>
        <T x={230} y={298} size={22} color={c.muted} show={s >= 1}>
          leaves
        </T>
        <T x={500} y={298} size={22} color={c.muted} show={s >= 2}>
          hashes
        </T>
        <T x={760} y={298} size={22} color={c.muted} show={s >= 3}>
          sorted
        </T>
        <T x={1020} y={298} size={22} color={c.muted} show={s >= 4}>
          fold
        </T>

        <Arrow x1={330} y1={R[0]} x2={403} y2={R[0]} show={s >= 2} />
        <Arrow x1={330} y1={R[1]} x2={403} y2={R[1]} show={s >= 2} delay={60} />
        <Arrow x1={330} y1={R[2]} x2={403} y2={R[2]} show={s >= 2} delay={120} />
        <Packet run={run(2)} x1={330} y1={R[0]} x2={405} y2={R[0]} color={c.ink} delay={200} />
        <Packet run={run(2)} x1={330} y1={R[1]} x2={405} y2={R[1]} color={c.ink} delay={260} />
        <Packet run={run(2)} x1={330} y1={R[2]} x2={405} y2={R[2]} color={c.ink} delay={320} />

        <Arrow x1={595} y1={R[0]} x2={663} y2={R[0]} show={s >= 3} color={c.node} />
        <Arrow x1={595} y1={R[1]} x2={663} y2={R[2]} show={s >= 3} color={c.clayHex} delay={80} />
        <Arrow x1={595} y1={R[2]} x2={663} y2={R[1]} show={s >= 3} color={c.clayHex} delay={80} />
        <Packet run={run(3)} x1={595} y1={R[1]} x2={665} y2={R[2]} color={c.clayHex} delay={300} />
        <Packet run={run(3)} x1={595} y1={R[2]} x2={665} y2={R[1]} color={c.clayHex} delay={300} />

        <Arrow x1={855} y1={R[0]} x2={925} y2={462} show={s >= 4} color={c.node} />
        <Arrow x1={855} y1={R[1]} x2={925} y2={478} show={s >= 4} color={c.node} delay={60} />
        <Arrow x1={855} y1={R[2]} x2={925} y2={R[2]} show={s >= 4} color={c.cool} dashed delay={120} />
        <Packet run={run(4)} x1={855} y1={R[0]} x2={925} y2={462} color={c.ink} delay={300} />
        <Packet run={run(4)} x1={855} y1={R[1]} x2={925} y2={478} color={c.ink} delay={300} />

        <Arrow x1={1115} y1={470} x2={1163} y2={590} show={s >= 5} color={c.node} />
        <Arrow x1={1115} y1={R[2]} x2={1163} y2={620} show={s >= 5} color={c.node} delay={60} />
        <Packet run={run(5)} x1={1115} y1={470} x2={1165} y2={590} color={c.clayHex} delay={250} />
        <Packet run={run(5)} x1={1115} y1={R[2]} x2={1165} y2={620} color={c.clayHex} delay={250} />

        <Arrow x1={1335} y1={605} x2={1393} y2={605} show={s >= 6} color={c.clayHex} />
        <Arrow x1={1480} y1={417} x2={1480} y2={566} show={s >= 6} color={c.clayHex} delay={100} />
        <Arrow x1={1565} y1={605} x2={1608} y2={605} show={s >= 6} color={c.clayHex} delay={250} />
        <GFade show={s >= 6} delay={300}>
          <line x1={1565} y1={380} x2={1690} y2={566} style={{ stroke: c.clayHex, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
        </GFade>
        <Packet run={run(6)} x1={1335} y1={605} x2={1395} y2={605} color={c.clayHex} delay={200} />
        <Packet run={run(6)} x1={1565} y1={605} x2={1610} y2={605} color={c.clayHex} delay={600} />
      </Canvas>

      <VH_Node x={230} y={R[0]} w={200} h={80} title="threshold" sub="42 B" show={s >= 1} />
      <VH_Node x={230} y={R[1]} w={200} h={80} title="after" sub="49 B" show={s >= 1} delay={60} />
      <VH_Node x={230} y={R[2]} w={200} h={80} title="hashlock" sub="77 B" show={s >= 1} delay={120} />

      <VH_Node x={500} y={R[0]} w={190} h={80} title={<M>h₀</M>} sub="23e8ff16…" show={s >= 2} delay={300} />
      <VH_Node x={500} y={R[1]} w={190} h={80} title={<M>h₁</M>} sub="9ed9c0b8…" show={s >= 2} delay={360} />
      <VH_Node x={500} y={R[2]} w={190} h={80} title={<M>h₂</M>} sub="8f38ddf9…" show={s >= 2} delay={420} />

      <VH_Node x={760} y={R[0]} w={190} h={80} title={<M>h₀</M>} sub="23e8ff16…" show={s >= 3} delay={400} />
      <VH_Node x={760} y={R[1]} w={190} h={80} title={<M>h₂</M>} sub="8f38ddf9…" tone={s === 3 ? 'on' : 'idle'} show={s >= 3} delay={450} />
      <VH_Node x={760} y={R[2]} w={190} h={80} title={<M>h₁</M>} sub="9ed9c0b8…" tone={s === 3 ? 'on' : 'idle'} show={s >= 3} delay={500} />

      <VH_Node x={1020} y={470} w={190} h={80} title="branch" sub="8f58855d…" show={s >= 4} delay={500} />
      <VH_Node x={1020} y={R[2]} w={190} h={80} title={<M>h₁</M>} sub="9ed9c0b8…" tone="cool" dashed show={s >= 4} delay={560} />

      <VH_Node x={1250} y={605} w={170} h={80} title="root" sub="3d4fbecf…" tone="on" show={s >= 5} delay={450} />

      <VH_Node x={1480} y={380} w={170} h={74} title={<M>K</M>} sub="03a3e12c…" tone="cool" show={s >= 6} />
      <VH_Node x={1480} y={605} w={170} h={80} title={<M>t</M>} sub="ea08208d…" show={s >= 6} delay={300} />
      <VH_Node x={1700} y={605} w={180} h={80} title={<M>P</M>} sub="022d17fd…" tone="on" show={s >= 6} delay={600} />
    </VarShell>
  );
};

const VH_TraceItem = ({ label, show, hot, children }: { label: ReactNode; show: boolean; hot: boolean; children: ReactNode }) => (
  <Fade show={show} style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 20, color: hot ? c.clayHex : c.muted, transition: `color 300ms ${EASE_OUT}` }}>{label}</div>
    <div style={{ fontFamily: MONO, fontSize: 21, marginTop: 2, color: hot ? c.ink : c.muted, transition: `color 300ms ${EASE_OUT}` }}>
      {children}
    </div>
  </Fade>
);

const VH_TrCode: Page = () => {
  const proc = useProcess(6, 2400);
  const s = proc.step;
  const on = (...n: number[]) => n.includes(s);
  return (
    <VarShell of={VH_OF_TR} lens="Explained via code" title="The fold and the tweak in fifteen lines" proc={proc}>
      <At x={120} y={262} w={930}>
        <div style={{ background: c.card, border: `1.5px solid ${c.rule}`, borderRadius: 12, padding: '14px 24px' }}>
          <VH_CL on={on(1)}>{'def th(tag, msg):'}</VH_CL>
          <VH_CL on={on(1)}>{'    t = sha256(tag.encode())'}</VH_CL>
          <VH_CL on={on(1)}>{'    return sha256(t + t + msg)'}</VH_CL>
          <VH_CL />
          <VH_CL>{'def merkle_root(leaves):'}</VH_CL>
          <VH_CL on={on(2)}>{'    level = sorted(th("Cashu_NutrootLeaf", l) for l in leaves)'}</VH_CL>
          <VH_CL on={on(3, 4)}>{'    while len(level) > 1:'}</VH_CL>
          <VH_CL on={on(3)}>{'        pairs = [level[i:i+2] for i in range(0, len(level), 2)]'}</VH_CL>
          <VH_CL on={on(4)}>{'        level = [th("Cashu_NutrootBranch", min(p) + max(p))'}</VH_CL>
          <VH_CL on={on(4)}>{'                 if len(p) == 2 else p[0] for p in pairs]'}</VH_CL>
          <VH_CL on={on(5)}>{'    return level[0]'}</VH_CL>
          <VH_CL />
          <VH_CL on={on(5)}>{'root = merkle_root(tree)'}</VH_CL>
          <VH_CL on={on(6)}>{'t = int.from_bytes(th("Cashu_NutrootTweak", K + root), "big") % n'}</VH_CL>
          <VH_CL on={on(6)}>
            {'P = K + t * G    '}
            <span style={{ color: c.dim }}>{'# point arithmetic'}</span>
          </VH_CL>
        </div>
        <Note style={{ marginTop: 14, fontSize: 21 }}>
          <Code>sha256</Code> returns the 32-byte digest; leaves are serialized bytes. With <Code>tree</Code>, <Code>K</Code>{' '}
          and <Code>n</Code> bound, lines 1–14 run as shown and reproduce the vector's root and tweak.
        </Note>
      </At>
      <At x={1100} y={262} w={700}>
        <Label>Trace · three-leaf vector</Label>
        <div style={{ marginTop: 14 }}>
          <VH_TraceItem label='SHA256("Cashu_NutrootLeaf")' show={s >= 1} hot={s === 1}>
            e19ba80c…e7a0b52b
          </VH_TraceItem>
          <VH_TraceItem label={<>level 0, sorted: <M>h₀, h₂, h₁</M></>} show={s >= 2} hot={s === 2}>
            [23e8ff16…, 8f38ddf9…, 9ed9c0b8…]
          </VH_TraceItem>
          <VH_TraceItem label="pairs" show={s >= 3} hot={s === 3}>
            [[23e8ff16…, 8f38ddf9…], [9ed9c0b8…]]
          </VH_TraceItem>
          <VH_TraceItem label={<>level 1: branch, <M>h₁</M> promoted</>} show={s >= 4} hot={s === 4}>
            [8f58855d…, 9ed9c0b8…]
          </VH_TraceItem>
          <VH_TraceItem label="level 2 = root" show={s >= 5} hot={s === 5}>
            3d4fbecf…b49d43ad
          </VH_TraceItem>
          <VH_TraceItem label={<>tweak <M>t</M></>} show={s >= 6} hot={s === 6}>
            ea08208d…6bf26eaf
          </VH_TraceItem>
          <VH_TraceItem label={<>secret <M>P</M></>} show={s >= 6} hot={s === 6}>
            022d17fd…d51b9999
          </VH_TraceItem>
        </div>
      </At>
    </VarShell>
  );
};

/** Edge line in page coordinates: draws, or fades in when dashed. */
const VH_Edge = ({
  x1,
  y1,
  x2,
  y2,
  show,
  dashed = false,
  color = c.node,
  delay = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  show: boolean;
  dashed?: boolean;
  color?: string;
  delay?: number;
}) =>
  dashed ? (
    <GFade show={show} delay={delay}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: c.cool, strokeWidth: 1.75, strokeDasharray: '5 6' }} />
    </GFade>
  ) : (
    <Draw x1={x1} y1={y1} x2={x2} y2={y2} show={show} color={color} width={1.75} delay={delay} dur={600} />
  );

const VH_TrViews: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  const L = 120;
  const Rx = 750;
  return (
    <VarShell of={VH_OF_TR} lens="Perspective: receiver and mint" title="Two parties, two parts of the tree" proc={proc}>
      <At x={L} y={262}>
        <Label color={s === 1 || s === 2 ? c.cool : c.muted}>Receiver · spend info: K and every leaf</Label>
      </At>
      <At x={Rx} y={262}>
        <Label color={s >= 3 && s <= 4 ? c.clayHex : c.muted}>Mint · witness: one leaf, K, path</Label>
      </At>
      <Canvas>
        <VH_Edge x1={L + 100} y1={702} x2={L + 197} y2={633} show={s >= 2} />
        <VH_Edge x1={L + 295} y1={702} x2={L + 197} y2={633} show={s >= 2} />
        <VH_Edge x1={L + 490} y1={702} x2={L + 490} y2={633} show={s >= 2} dashed />
        <VH_Edge x1={L + 197} y1={567} x2={L + 343} y2={503} show={s >= 2} delay={200} />
        <VH_Edge x1={L + 490} y1={567} x2={L + 343} y2={503} show={s >= 2} delay={200} />
        <VH_Edge x1={L + 343} y1={437} x2={L + 343} y2={385} show={s >= 2} delay={400} />
        <Packet run={run(2)} x1={L + 295} y1={702} x2={L + 343} y2={385} color={c.cool} delay={300} dur={1200} />

        <VH_Edge x1={Rx + 100} y1={702} x2={Rx + 197} y2={633} show={s >= 4} />
        <VH_Edge x1={Rx + 295} y1={702} x2={Rx + 197} y2={633} show={s >= 4} />
        <VH_Edge x1={Rx + 197} y1={567} x2={Rx + 343} y2={503} show={s >= 4} delay={200} />
        <VH_Edge x1={Rx + 490} y1={567} x2={Rx + 343} y2={503} show={s >= 4} delay={200} />
        <VH_Edge x1={Rx + 343} y1={437} x2={Rx + 343} y2={385} show={s >= 4} delay={400} />
        <Packet run={run(4)} x1={Rx + 295} y1={702} x2={Rx + 343} y2={385} color={c.clayHex} delay={300} dur={1200} />
      </Canvas>

      <VH_Node x={L + 100} y={740} w={180} h={76} title="threshold" sub="full leaf" tone="cool" show={s >= 1} />
      <VH_Node x={L + 295} y={740} w={180} h={76} title="hashlock" sub="full leaf" tone="cool" show={s >= 1} delay={60} />
      <VH_Node x={L + 490} y={740} w={180} h={76} title="after" sub="full leaf" tone="cool" show={s >= 1} delay={120} />
      <VH_Node x={L + 197} y={600} w={190} h={66} title="branch" tone="cool" show={s >= 2} delay={150} />
      <VH_Node x={L + 490} y={600} w={190} h={66} title={<M>h₁</M>} tone="cool" dashed show={s >= 2} delay={150} />
      <VH_Node x={L + 343} y={470} w={200} h={66} title="root" tone="cool" show={s >= 2} delay={350} />
      <VH_Node x={L + 343} y={350} w={300} h={70} title={<>K + t·G = secret ✓</>} tone="cool" show={s >= 2} delay={550} />

      <VH_Node x={Rx + 100} y={740} w={180} h={76} title={<M>h₀</M>} sub="23e8ff16…" tone="dim" dashed show={s >= 3} />
      <VH_Node x={Rx + 295} y={740} w={180} h={76} title="hashlock" sub="full leaf" tone="on" show={s >= 3} delay={60} />
      <VH_Node x={Rx + 490} y={600} w={190} h={66} title={<M>h₁</M>} sub="9ed9c0b8…" tone="dim" dashed show={s >= 3} delay={120} />
      <VH_Node x={Rx + 197} y={600} w={190} h={66} title="branch" tone="calc" show={s >= 4} delay={150} />
      <VH_Node x={Rx + 343} y={470} w={200} h={66} title="root" tone="calc" show={s >= 4} delay={350} />
      <VH_Node x={Rx + 343} y={350} w={300} h={70} title={<>K + t·G = secret ✓</>} tone="on" show={s >= 4} delay={550} />

      <At x={L} y={808} w={590}>
        <Fade show={s >= 2}>
          <Note style={{ fontSize: 22 }}>Folds every leaf. A match proves the disclosure is complete: no leaf is hidden.</Note>
        </Fade>
      </At>
      <At x={Rx} y={808} w={590}>
        <Fade show={s >= 4}>
          <Note style={{ fontSize: 22 }}>Hashes one leaf and two branches. The threshold and after leaves stay hashes.</Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The receiver gets spend info: <M>K</M> and every leaf in full.
        </StepItem>
        <StepItem n={2} step={s}>
          It folds the whole tree (check 1). The secret matches, so nothing is left out.
        </StepItem>
        <StepItem n={3} step={s}>
          The mint gets one leaf, <M>K</M> and the path <M>[h₀, h₁]</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          It recomputes three hashes and the tweak, then compares with the secret.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_TrHtlc: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  const hot = (n: number) => s === n;
  return (
    <VarShell of={VH_OF_TR} lens="Worked example end to end" title="An HTLC as a nutroot tree" proc={proc}>
      <VH_Card x={120} y={262} w={590} h={132} tone={hot(2) ? 'on' : 'dim'} show={s >= 2}>
        <div style={{ fontSize: 24, fontWeight: 600 }}>
          hashlock <span style={{ fontWeight: 400, color: c.muted, fontFamily: MONO, fontSize: 21 }}>· 77 B</span>
        </div>
        <div style={{ fontSize: 22, color: c.muted, marginTop: 2 }}>n = 1 · key 3 · hash a1a1…a1a1</div>
        <VH_Hex color={hot(3) ? c.clayHex : c.ink}>8f38ddf9…5b65f2fa</VH_Hex>
      </VH_Card>
      <VH_Card x={750} y={262} w={590} h={132} tone={hot(2) ? 'on' : 'dim'} show={s >= 2} delay={80}>
        <div style={{ fontSize: 24, fontWeight: 600 }}>
          after <span style={{ fontWeight: 400, color: c.muted, fontFamily: MONO, fontSize: 21 }}>· 49 B</span>
        </div>
        <div style={{ fontSize: 22, color: c.muted, marginTop: 2 }}>n = 1 · key 4 · time 1755561600</div>
        <VH_Hex color={hot(3) ? c.clayHex : c.ink}>9ed9c0b8…0616589a</VH_Hex>
      </VH_Card>
      <VH_Card x={120} y={420} w={590} h={112} tone={hot(3) ? 'on' : 'cool'} show={s >= 3}>
        <VH_Cap color={c.cool}>
          internal key, NUMS offset <M>u</M> = 7
        </VH_Cap>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <M size={28}>K = H + 7·G</M>
          <VH_Hex>028edfeb…ca7bd407</VH_Hex>
        </div>
      </VH_Card>
      <VH_Card x={750} y={420} w={590} h={112} tone={hot(4) ? 'on' : 'dim'} show={s >= 4}>
        <VH_Cap color={hot(4) ? c.clayHex : c.muted}>
          root = <Code>branch(8f38ddf9…, 9ed9c0b8…)</Code>
        </VH_Cap>
        <div style={{ marginTop: 8 }}>
          <VH_Hex size={22}>1f205396…ff236dd9</VH_Hex>
        </div>
      </VH_Card>
      <VH_Card x={120} y={558} w={590} h={112} tone={hot(5) ? 'on' : 'dim'} show={s >= 5}>
        <VH_Cap color={hot(5) ? c.clayHex : c.muted}>
          tweak <M>t</M> = <Code>tagged_hash(Tweak, K</Code> ‖ <Code>root)</Code>
        </VH_Cap>
        <div style={{ marginTop: 8 }}>
          <VH_Hex size={22}>999d7474…983486b0</VH_Hex>
        </div>
      </VH_Card>
      <VH_Card x={750} y={558} w={590} h={112} tone="on" show={s >= 5} delay={100}>
        <VH_Cap color={c.clayHex}>
          secret <M>P = K + t·G</M>
        </VH_Cap>
        <div style={{ marginTop: 8 }}>
          <VH_Hex size={22}>03c11b5b…1a1ebea5</VH_Hex>
        </div>
      </VH_Card>
      <At x={120} y={702} w={1220}>
        <Fade show={s >= 6}>
          <Label color={hot(6) ? c.clayHex : c.muted}>Spend paths</Label>
          <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 8 }}>
            <VH_Li color={c.good}>
              key 3 + preimage: reveal the hashlock leaf, path <Code>[9ed9c0b8…]</Code>
            </VH_Li>
            <VH_Li color={c.good}>
              key 4, clock ≥ 1755561600: reveal the after leaf, path <Code>[8f38ddf9…]</Code>
            </VH_Li>
            <VH_Li color={c.bad}>
              key path: none. <M>K − 7·G = H</M>, whose discrete log nobody knows
            </VH_Li>
          </div>
          <Note style={{ fontSize: 21, marginTop: 4 }}>
            Spend info: <M>K</M>, <M>u</M>, tree. Leaves, <M>K</M> and leaf hashes are vector values; root, <M>t</M> and{' '}
            <M>P</M> computed.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Policy: key 3 with the preimage of <Code>a1…a1</Code>, or key 4 from 2025-08-19. No key path.
        </StepItem>
        <StepItem n={2} step={s}>
          One leaf per spend path, as serialized in the vectors.
        </StepItem>
        <StepItem n={3} step={s}>
          Script-only: <M>K = H + u·G</M>. The vectors use <M>u</M> = 7; real proofs use a fresh <M>u</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          Two leaves: the root is their branch hash, lower hash first.
        </StepItem>
        <StepItem n={5} step={s}>
          Tweak and secret, as for any tree.
        </StepItem>
        <StepItem n={6} step={s}>
          Each spend reveals one leaf and one sibling hash.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_FRow = ({
  label,
  a,
  b,
  show,
  hot = false,
  head = false,
}: {
  label: ReactNode;
  a: ReactNode;
  b: ReactNode;
  show: boolean;
  hot?: boolean;
  head?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: head ? 52 : 68,
      borderBottom: `1px solid ${head ? c.line : c.rule}`,
      background: hot ? c.badSoft : 'transparent',
      ...VH_enter(show),
    }}
  >
    <div style={{ width: 250, flexShrink: 0, paddingLeft: 12, fontSize: head ? 20 : 22, color: c.muted, textTransform: head ? 'uppercase' : undefined, letterSpacing: head ? '0.08em' : undefined }}>
      {label}
    </div>
    <div style={{ width: 485, flexShrink: 0, fontSize: head ? 20 : 24, color: head ? c.muted : c.ink, textTransform: head ? 'uppercase' : undefined, letterSpacing: head ? '0.08em' : undefined }}>
      {a}
    </div>
    <div style={{ width: 485, flexShrink: 0, fontSize: head ? 20 : 24, color: head ? c.bad : c.ink, textTransform: head ? 'uppercase' : undefined, letterSpacing: head ? '0.08em' : undefined }}>
      {b}
    </div>
  </div>
);

const VH_TrFail: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_TR} lens="Framing: failure mode" title="Three changed bytes, a different secret" proc={proc}>
      <At x={120} y={262} w={1220}>
        <VH_FRow head label="" a="three-leaf vector" b="time moved to 2025-09-19" show />
        <VH_FRow
          label="after leaf, time field"
          a={
            <VH_Hex>
              06 0004 68<span style={{ color: c.clayHex }}>a3be80</span>
            </VH_Hex>
          }
          b={
            <VH_Hex>
              06 0004 68<span style={{ color: c.bad }}>cc9d00</span>
            </VH_Hex>
          }
          show={s >= 1}
        />
        <VH_FRow label="its leaf hash" a={<VH_Hex>9ed9c0b8…0616589a</VH_Hex>} b={<VH_Hex color={c.bad}>7be5a164…6e9ae8b8</VH_Hex>} show={s >= 2} />
        <VH_FRow
          label="sorted hashes"
          a={<M size={28}>h₀ &lt; h₂ &lt; h₁</M>}
          b={
            <M size={28} color={c.bad}>
              h₀ &lt; h₁′ &lt; h₂
            </M>
          }
          show={s >= 2}
        />
        <VH_FRow
          label="level 1"
          a={
            <M size={28}>
              <Up>branch</Up>(h₀, h₂), h₁
            </M>
          }
          b={
            <M size={28} color={c.bad}>
              <Up>branch</Up>(h₀, h₁′), h₂
            </M>
          }
          show={s >= 3}
        />
        <VH_FRow label="root" a={<VH_Hex>3d4fbecf…b49d43ad</VH_Hex>} b={<VH_Hex color={c.bad}>54ba2366…8bcf3ef1</VH_Hex>} show={s >= 3} />
        <VH_FRow label="tweak t" a={<VH_Hex>ea08208d…6bf26eaf</VH_Hex>} b={<VH_Hex color={c.bad}>d0d14c62…7d23d286</VH_Hex>} show={s >= 4} />
        <VH_FRow
          label="secret P"
          a={<VH_Hex>022d17fd…d51b9999</VH_Hex>}
          b={<VH_Hex color={c.bad}>02364898…28514ada</VH_Hex>}
          show={s >= 4}
          hot={s >= 5}
        />
      </At>
      <At x={120} y={830} w={1220}>
        <Note style={{ fontSize: 21 }}>
          Same internal key <Code>03a3e12c…3a419e51</Code>. Left column: vector values. Right column: computed with the NUT-10
          tagged hashes.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Move the after leaf's time by one month: 3 of its 49 bytes change.
        </StepItem>
        <StepItem n={2} step={s}>
          Its hash changes completely and now sorts between <M>h₀</M> and <M>h₂</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          The fold pairs different hashes: another root.
        </StepItem>
        <StepItem n={4} step={s}>
          Another tweak, another secret.
        </StepItem>
        <StepItem n={5} step={s}>
          A tree that does not reproduce the secret fails check 1. A payer that cannot reproduce a requested leaf exactly MUST
          refuse to pay <span style={{ whiteSpace: 'nowrap' }}>(NUT-18)</span>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Group 3 · 2.3 Condition leaves (leaf version 0x00)
// ═════════════════════════════════════════════════════════════════════════════

const VH_DecRow = ({ bytes, show, hot, children }: { bytes: string; show: boolean; hot: boolean; children: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      minHeight: 72,
      borderBottom: `1px solid ${c.rule}`,
      ...VH_enter(show),
    }}
  >
    <div style={{ width: 400, flexShrink: 0 }}>
      <VH_Hex size={22} color={hot ? c.clayHex : c.ink}>
        {bytes}
      </VH_Hex>
    </div>
    <div style={{ fontSize: 24, lineHeight: 1.4, padding: '6px 0' }}>{children}</div>
  </div>
);

const VH_LfBeginner: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_LF} lens="Beginner" title="Reading a leaf, byte by byte" proc={proc}>
      <At x={120} y={262} w={1220}>
        <VH_Cap mono>threshold_1of1_key3 · 42 bytes</VH_Cap>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <VH_Seg bytes="00" tone="type" hot={s === 1} />
          <VH_Seg bytes="01" tone="type" hot={s === 2} />
          <VH_Seg bytes="02 0001 01" hot={s === 3} />
          <VH_Seg bytes="04 0021 02f9308a…bce036f9" hot={s === 4} />
        </div>
      </At>
      <At x={120} y={392} w={1220}>
        <VH_DecRow bytes="00" show={s >= 1} hot={s === 1}>
          Leaf version 0. The only version defined; any other is unsatisfiable.
        </VH_DecRow>
        <VH_DecRow bytes="01" show={s >= 2} hot={s === 2}>
          Leaf type 1: threshold, "n of these keys sign".
        </VH_DecRow>
        <VH_DecRow bytes="02 0001 01" show={s >= 3} hot={s === 3}>
          Field 0x02 (n), length 1 byte, value 1.
        </VH_DecRow>
        <VH_DecRow bytes="04 0021 02f9…36f9" show={s >= 4} hot={s === 4}>
          Field 0x04 (keys), length 0x21 = 33 bytes: key 3.
        </VH_DecRow>
        <VH_DecRow bytes="1 + 1 + 4 + 36 = 42" show={s >= 5} hot={s === 5}>
          One signature by key 3. Leaf hash <Code>23e8ff16…839116cb</Code>.
        </VH_DecRow>
      </At>
      <At x={120} y={800} w={1220}>
        <Fade show={s >= 3}>
          <div
            style={{
              display: 'inline-block',
              border: `1.5px solid ${c.rule}`,
              background: c.panel,
              borderRadius: 10,
              padding: '12px 22px',
              fontSize: 24,
            }}
          >
            record = type (1 byte) ‖ length (2 bytes, big-endian) ‖ value
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The first byte says how to read the rest. Only version 0x00 exists.
        </StepItem>
        <StepItem n={2} step={s}>
          The second byte is the leaf type. 0x01 is a threshold of signatures.
        </StepItem>
        <StepItem n={3} step={s}>
          Then records: a type byte, a two-byte length, the value.
        </StepItem>
        <StepItem n={4} step={s}>
          Keys are 33-byte compressed points, all in one record.
        </StepItem>
        <StepItem n={5} step={s}>
          No names, no separators. These exact bytes are hashed, sent and checked.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_LfAdvanced: Page = () => {
  const proc = useProcess(4, 2600);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_LF} lens="Advanced" title="Malformed, unsatisfiable, inert" proc={proc}>
      <VH_Card x={120} y={262} w={540} h={470} tone={s === 1 ? 'bad' : 'dim'} show={s >= 1} dimTo={0.3} pad="16px 22px">
        <Label color={c.bad}>Malformed: reject</Label>
        <div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 12 }}>
          <VH_Li color={c.bad}>unknown field type, including every odd type</VH_Li>
          <VH_Li color={c.bad}>known field on the wrong leaf type</VH_Li>
          <VH_Li color={c.bad}>field types not strictly ascending</VH_Li>
          <VH_Li color={c.bad}>n = 0, or n above the number of keys</VH_Li>
          <VH_Li color={c.bad}>
            no key, an invalid point, or two keys sharing an <span style={{ whiteSpace: 'nowrap' }}>x-coordinate</span>
          </VH_Li>
          <VH_Li color={c.bad}>body over 512 bytes</VH_Li>
          <VH_Li color={c.bad}>disclosure other than 0a000101</VH_Li>
          <VH_Li color={c.bad}>
            integer with a leading zero byte; time above <span style={{ whiteSpace: 'nowrap' }}>2⁵³ − 1</span>
          </VH_Li>
        </div>
      </VH_Card>
      <VH_Card x={690} y={262} w={540} h={470} tone={s === 2 ? 'violet' : 'dim'} show={s >= 2} dimTo={0.3} pad="16px 22px">
        <Label color={c.violet}>Unsatisfiable: path disabled</Label>
        <div style={{ fontSize: 22, lineHeight: 1.4, marginTop: 12 }}>
          <VH_Li color={c.violet}>leaf version other than 0x00</VH_Li>
          <VH_Li color={c.violet}>leaf type 0x05 or above</VH_Li>
          <VH_Li color={c.violet}>a commit leaf revealed in a witness</VH_Li>
        </div>
        <Note style={{ fontSize: 22, marginTop: 16 }}>
          The commitment math still verifies (vector: a type 0x05 leaf beside an after leaf). An unknown type disables only
          that path of that proof.
        </Note>
      </VH_Card>
      <VH_Card x={1260} y={262} w={540} h={470} tone={s === 3 ? 'good' : 'dim'} show={s >= 3} dimTo={0.3} pad="16px 22px">
        <Label color={c.good}>Inert: parses, grants nothing</Label>
        <div style={{ fontSize: 22, lineHeight: 1.45, marginTop: 12 }}>
          A <Code>commit</Code> leaf in a receiver's tree binds 32 bytes of application data. It neither adds nor removes a
          spend path.
        </div>
        <Note style={{ fontSize: 22, marginTop: 16 }}>The mint sees it only as a sibling hash in a path.</Note>
      </VH_Card>
      <At x={120} y={760} w={1680}>
        <Fade show={s >= 4}>
          <Label color={s === 4 ? c.clayHex : c.muted}>Where the verdict lands</Label>
          <div style={{ display: 'flex', gap: 30, marginTop: 10 }}>
            <div style={{ flex: 1, border: `1.5px solid ${c.rule}`, background: c.card, borderRadius: 12, padding: '14px 22px', fontSize: 22, lineHeight: 1.45 }}>
              <b style={{ fontWeight: 600 }}>Mint, script-path witness.</b> Parses the one revealed leaf and fails closed on an
              unknown version, type or field.
            </div>
            <div style={{ flex: 1, border: `1.5px solid ${c.rule}`, background: c.card, borderRadius: 12, padding: '14px 22px', fontSize: 22, lineHeight: 1.45 }}>
              <b style={{ fontWeight: 600 }}>Receiver, check 1.</b> Every disclosed leaf MUST parse: an unknown version, type or
              field rejects the proof.
            </div>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

const VH_BPX = 17;
const VH_BAR_X = 460;
type VH_FieldKind = 'hdr' | 'n' | 'keys' | 'time' | 'hash' | 'disc';
const VH_FIELD: Record<VH_FieldKind, { border: string; bg: string; text: string }> = {
  hdr: { border: c.clayHex, bg: c.claySoft, text: '' },
  n: { border: c.violet, bg: 'rgba(122, 95, 166, 0.12)', text: '02' },
  keys: { border: c.cool, bg: c.coolSoft, text: '04 · 33-byte key' },
  time: { border: c.good, bg: c.goodSoft, text: '06' },
  hash: { border: c.node, bg: c.panel, text: '08 · 32-byte hash' },
  disc: { border: c.bad, bg: c.badSoft, text: '0a' },
};

const VH_Fseg = ({ at, bytes, kind, y, show, delay }: { at: number; bytes: number; kind: VH_FieldKind; y: number; show: boolean; delay: number }) => (
  <div
    style={{
      position: 'absolute',
      left: VH_BAR_X + at * VH_BPX,
      top: y,
      width: bytes * VH_BPX - 3,
      height: 60,
      boxSizing: 'border-box',
      border: `1.5px solid ${VH_FIELD[kind].border}`,
      background: VH_FIELD[kind].bg,
      borderRadius: 5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 21,
      color: c.ink,
      whiteSpace: 'nowrap',
      ...VH_enter(show, delay),
    }}
  >
    {VH_FIELD[kind].text}
  </div>
);

const VH_BarName = ({ y, name, total, show }: { y: number; name: string; total: string; show: boolean }) => (
  <div style={{ position: 'absolute', left: 120, top: y + 2, width: 320, ...VH_enter(show) }}>
    <div style={{ fontSize: 24, lineHeight: 1.1 }}>{name}</div>
    <div style={{ fontFamily: MONO, fontSize: 21, color: c.muted, marginTop: 4 }}>{total}</div>
  </div>
);

const VH_Swatch = ({ kind, label }: { kind: VH_FieldKind; label: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginRight: 34, fontSize: 22, color: c.muted }}>
    <span style={{ width: 28, height: 20, borderRadius: 4, border: `1.5px solid ${VH_FIELD[kind].border}`, background: VH_FIELD[kind].bg }} />
    {label}
  </span>
);

const VH_LfGraphic: Page = () => {
  const proc = useProcess(5, 1700);
  const s = proc.step;
  const Y = [290, 410, 530, 650, 770];
  return (
    <VarShell of={VH_OF_LF} lens="Graphical" title="Five leaves to scale" proc={proc}>
      <VH_BarName y={Y[0]} name="threshold" total="42 B" show={s >= 1} />
      <VH_Fseg y={Y[0]} at={0} bytes={2} kind="hdr" show={s >= 1} delay={0} />
      <VH_Fseg y={Y[0]} at={2} bytes={4} kind="n" show={s >= 1} delay={50} />
      <VH_Fseg y={Y[0]} at={6} bytes={36} kind="keys" show={s >= 1} delay={100} />

      <VH_BarName y={Y[1]} name="threshold + disclosure" total="46 B" show={s >= 2} />
      <VH_Fseg y={Y[1]} at={0} bytes={2} kind="hdr" show={s >= 2} delay={0} />
      <VH_Fseg y={Y[1]} at={2} bytes={4} kind="n" show={s >= 2} delay={50} />
      <VH_Fseg y={Y[1]} at={6} bytes={36} kind="keys" show={s >= 2} delay={100} />
      <VH_Fseg y={Y[1]} at={42} bytes={4} kind="disc" show={s >= 2} delay={150} />

      <VH_BarName y={Y[2]} name="after" total="49 B" show={s >= 3} />
      <VH_Fseg y={Y[2]} at={0} bytes={2} kind="hdr" show={s >= 3} delay={0} />
      <VH_Fseg y={Y[2]} at={2} bytes={4} kind="n" show={s >= 3} delay={50} />
      <VH_Fseg y={Y[2]} at={6} bytes={36} kind="keys" show={s >= 3} delay={100} />
      <VH_Fseg y={Y[2]} at={42} bytes={7} kind="time" show={s >= 3} delay={150} />

      <VH_BarName y={Y[3]} name="hashlock" total="77 B" show={s >= 4} />
      <VH_Fseg y={Y[3]} at={0} bytes={2} kind="hdr" show={s >= 4} delay={0} />
      <VH_Fseg y={Y[3]} at={2} bytes={4} kind="n" show={s >= 4} delay={50} />
      <VH_Fseg y={Y[3]} at={6} bytes={36} kind="keys" show={s >= 4} delay={100} />
      <VH_Fseg y={Y[3]} at={42} bytes={35} kind="hash" show={s >= 4} delay={150} />

      <VH_BarName y={Y[4]} name="commit" total="37 B" show={s >= 5} />
      <VH_Fseg y={Y[4]} at={0} bytes={2} kind="hdr" show={s >= 5} delay={0} />
      <VH_Fseg y={Y[4]} at={2} bytes={35} kind="hash" show={s >= 5} delay={50} />

      <At x={120} y={880} w={1680}>
        <VH_Swatch kind="hdr" label="version, type" />
        <VH_Swatch kind="n" label="n" />
        <VH_Swatch kind="keys" label="keys" />
        <VH_Swatch kind="time" label="time" />
        <VH_Swatch kind="hash" label="hash" />
        <VH_Swatch kind="disc" label="disclosure" />
      </At>
    </VarShell>
  );
};

const VH_Rec = ({ bytes, label, hot, done }: { bytes: string; label: ReactNode; hot: boolean; done: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, height: 70 }}>
    <span
      style={{
        fontFamily: MONO,
        fontSize: 21,
        padding: '6px 12px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${hot ? c.clayHex : done ? c.line : c.rule}`,
        background: hot ? c.claySoft : c.card,
        color: done || hot ? c.ink : c.dim,
        transition: `all 300ms ${EASE_OUT}`,
      }}
    >
      {bytes}
    </span>
    <span style={{ fontSize: 22, color: hot ? c.clayHex : done ? c.ink : c.dim, transition: `color 300ms ${EASE_OUT}` }}>{label}</span>
  </div>
);

const VH_LfParser: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  const on = (...n: number[]) => n.includes(s);
  return (
    <VarShell of={VH_OF_LF} lens="Explained via a parser" title="A leaf parser, step by step" proc={proc}>
      <At x={120} y={262} w={840}>
        <div style={{ background: c.card, border: `1.5px solid ${c.rule}`, borderRadius: 12, padding: '14px 24px' }}>
          <VH_CL>{'def parse_leaf(b):'}</VH_CL>
          <VH_CL on={on(1)}>{'    if b[0] != 0x00: return UNSATISFIABLE'}</VH_CL>
          <VH_CL on={on(2)}>{'    kind = b[1]'}</VH_CL>
          <VH_CL on={on(2)}>{'    if kind not in (1, 2, 3, 4): return UNSATISFIABLE'}</VH_CL>
          <VH_CL on={on(2)}>{'    if len(b) - 1 > 512: return MALFORMED'}</VH_CL>
          <VH_CL on={on(3)}>{'    fields, last, i = {}, 0, 2'}</VH_CL>
          <VH_CL on={on(3, 4, 5)}>{'    while i < len(b):'}</VH_CL>
          <VH_CL on={on(3, 4, 5)}>{'        typ = b[i]'}</VH_CL>
          <VH_CL on={on(3, 4, 5)}>{'        ln = int.from_bytes(b[i+1:i+3], "big")'}</VH_CL>
          <VH_CL on={on(3, 4, 5)}>{'        if typ <= last or typ not in ALLOWED[kind]:'}</VH_CL>
          <VH_CL>{'            return MALFORMED'}</VH_CL>
          <VH_CL on={on(3, 4, 5)}>{'        if i + 3 + ln > len(b): return MALFORMED'}</VH_CL>
          <VH_CL on={on(3, 4, 5)}>{'        fields[typ] = b[i+3:i+3+ln]'}</VH_CL>
          <VH_CL on={on(3, 4, 5)}>{'        last, i = typ, i + 3 + ln'}</VH_CL>
          <VH_CL on={on(6)}>{'    return check_values(kind, fields)'}</VH_CL>
        </div>
        <Note style={{ marginTop: 14, fontSize: 21 }}>
          Sketch. The verdicts follow NUT-10; the order of the checks is not normative. <Code>ALLOWED</Code> lists each leaf
          type's fields.
        </Note>
      </At>
      <At x={1010} y={262} w={790}>
        <VH_Cap mono>hashlock_1of1_key3 · 77 bytes</VH_Cap>
        <div style={{ marginTop: 14 }}>
          <VH_Rec bytes="00" label="version 0x00" hot={s === 1} done={s > 1} />
          <VH_Rec bytes="03" label="type 0x03: hashlock" hot={s === 2} done={s > 2} />
          <VH_Rec bytes="02 0001 01" label="n = 1" hot={s === 3} done={s > 3} />
          <VH_Rec bytes="04 0021 02f9308a…bce036f9" label="keys: key 3" hot={s === 4} done={s > 4} />
          <VH_Rec bytes="08 0020 a1a1a1a1…a1a1a1a1" label="hash, 32 B" hot={s === 5} done={s > 5} />
        </div>
        <Fade show={s >= 6} style={{ marginTop: 22 }}>
          <div style={{ border: `1.5px solid ${c.good}`, background: c.goodSoft, borderRadius: 12, padding: '14px 20px', fontSize: 22, lineHeight: 1.45 }}>
            <div>n ≤ number of keys ✓ · valid point ✓ · hash is 32 bytes ✓</div>
            <div style={{ marginTop: 4 }}>
              hashlock: key 3 signs, with the preimage of <Code>a1…a1</Code>
            </div>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

const VH_Verdict = ({ y, show, tone, pill, left, sub, children }: { y: number; show: boolean; tone: VH_Tone; pill: string; left: ReactNode; sub: ReactNode; children: ReactNode }) => (
  <>
    <VH_Card x={120} y={y} w={520} h={104} tone={show && tone === 'on' ? 'on' : 'dim'} show={show} pad="14px 20px">
      <div style={{ fontSize: 23, fontWeight: 600 }}>{left}</div>
      <div style={{ marginTop: 4 }}>
        <VH_Hex color={c.muted}>{sub}</VH_Hex>
      </div>
    </VH_Card>
    <div style={{ position: 'absolute', left: 670, top: y, width: 670, height: 104, display: 'flex', alignItems: 'center', gap: 18, ...VH_enter(show, 150) }}>
      <VH_Pill tone={tone === 'on' ? 'good' : tone}>{pill}</VH_Pill>
      <span style={{ fontSize: 23, lineHeight: 1.35 }}>{children}</span>
    </div>
  </>
);

const VH_LfReceiver: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_LF} lens="Perspective: receiver" title="A receiver reads the tree" proc={proc}>
      <VH_Verdict y={262} show={s >= 1} tone={s === 1 ? 'on' : 'good'} pill="mine" left="key path" sub="K = 03a3e12c…3a419e51">
        derived from my static key 3 and the sender's <M>E</M>
      </VH_Verdict>
      <VH_Verdict y={386} show={s >= 2} tone={s === 2 ? 'on' : 'good'} pill="mine" left="threshold · n = 1" sub="keys: key 3">
        key 3 is my static key
      </VH_Verdict>
      <VH_Verdict y={510} show={s >= 3} tone="bad" pill="sender" left="after · n = 1" sub="keys: key 4 · 1755561600">
        key 4 can spend from 2025-08-19 00:00 UTC
      </VH_Verdict>
      <VH_Verdict y={634} show={s >= 4} tone={s === 4 ? 'on' : 'cool'} pill="mine, conditional" left="hashlock · n = 1" sub="keys: key 3 · hash a1…a1">
        only with the preimage of <Code>a1…a1</Code>
      </VH_Verdict>
      <VH_Card x={120} y={780} w={1220} h={130} tone={s === 5 ? 'on' : 'dim'} show={s >= 5} pad="14px 24px">
        <Label color={s === 5 ? c.clayHex : c.muted}>Acceptance</Label>
        <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 6 }}>
          Accept if the tree reproduces the secret (check 1) and 2025-08-19 leaves enough time under my policy. Then sweep to
          seed-derived secrets before key 4 can spend.
        </div>
      </VH_Card>
      <StepList>
        <StepItem n={1} step={s}>
          Derive <M>K</M> from <M>E</M>; it must match any disclosed <M>K</M>. The key path is mine.
        </StepItem>
        <StepItem n={2} step={s}>
          threshold: a leaf I can satisfy alone.
        </StepItem>
        <StepItem n={3} step={s}>
          after: the sender's refund key. From that date both of us can spend.
        </StepItem>
        <StepItem n={4} step={s}>
          hashlock: mine only with the preimage.
        </StepItem>
        <StepItem n={5} step={s}>
          Every disclosed leaf is checked against the acceptance policy before the payment counts.
        </StepItem>
        <Note style={{ marginTop: 14, fontSize: 21 }}>Scenario: the three-leaf vector, received by the holder of key 3.</Note>
      </StepList>
    </VarShell>
  );
};

const VH_RejRow = ({
  name,
  pre,
  bad,
  post,
  verdict,
  show,
  hot,
}: {
  name: string;
  pre?: string;
  bad: string;
  post?: string;
  verdict: ReactNode;
  show: boolean;
  hot: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      minHeight: 78,
      borderBottom: `1px solid ${c.rule}`,
      background: hot ? c.badSoft : 'transparent',
      ...VH_enter(show, 0, 0.25),
    }}
  >
    <div style={{ width: 750, flexShrink: 0, paddingLeft: 10 }}>
      <div style={{ fontFamily: MONO, fontSize: 20, color: c.muted }}>{name}</div>
      <div style={{ fontFamily: MONO, fontSize: 21, whiteSpace: 'nowrap', marginTop: 2 }}>
        {pre && <span style={{ color: c.dim }}>{pre}</span>}
        <span style={{ color: c.bad, fontWeight: 600 }}>{bad}</span>
        {post && <span style={{ color: c.dim }}>{post}</span>}
      </div>
    </div>
    <div style={{ fontSize: 22, lineHeight: 1.35, paddingRight: 10 }}>{verdict}</div>
  </div>
);

const VH_LfReject: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  const T3 = '00 01 · 02 0001 01 · 04 0021 02f9…36f9 · ';
  return (
    <VarShell of={VH_OF_LF} lens="Framing: what fails and why" title="Rejection vectors" proc={proc}>
      <At x={120} y={256} w={1220}>
        <VH_RejRow name="leaf_unknown_field" pre={T3} bad="09 0004 deadbeef" verdict="Odd field 0x09: unknown. Malformed." show={s >= 1} hot={s === 1} />
        <VH_RejRow name="leaf_disclosure_mode0" pre={T3} bad="0a 0001 00" verdict="Mode 0x00: malformed." show={s >= 2} hot={s === 2} />
        <VH_RejRow name="leaf_disclosure_empty" pre={T3} bad="0a 0000" verdict="Empty value: malformed." show={s >= 2} hot={s === 2} />
        <VH_RejRow name="leaf_disclosure_mode2" pre={T3} bad="0a 0001 02" verdict="Unallocated mode: malformed." show={s >= 2} hot={s === 2} />
        <VH_RejRow
          name="leaf_0_unknown_type"
          bad="00 05"
          post=" · 02 0001 01 · 04 0021 02f9…36f9 · 0a 0021 …"
          verdict="Type 0x05: unsatisfiable. The root still verifies."
          show={s >= 3}
          hot={s === 3}
        />
        <VH_RejRow name="leaf_commit, in a witness" bad="00 04" post=" · 08 0020 6445…6fae" verdict="Commit: no satisfaction rule. Witness rejected." show={s >= 4} hot={s === 4} />
        <VH_RejRow
          name="key-path witness, signature listed twice"
          bad='{"signatures": [sig, sig]}'
          verdict="Key path: exactly one entry. Script path: at most the leaf's key count."
          show={s >= 5}
          hot={s === 5}
        />
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          An unknown field rejects the leaf. Odd types are reserved, none allocated.
        </StepItem>
        <StepItem n={2} step={s}>
          disclosure has one valid encoding, <Code>0a000101</Code>. Anything else is malformed.
        </StepItem>
        <StepItem n={3} step={s}>
          An unallocated leaf type is unsatisfiable: its path is disabled.
        </StepItem>
        <StepItem n={4} step={s}>
          A commit leaf is never a spend path.
        </StepItem>
        <StepItem n={5} step={s}>
          Signature lists are bounded on both paths.
        </StepItem>
        <Note style={{ marginTop: 14, fontSize: 21 }}>
          Bytes from <Code>tests/10-tests.md</Code>; the common prefix is <Code>threshold_1of1_key3</Code>.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VH_LfDisclosure: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  return (
    <VarShell of={VH_OF_LF} lens="Focus: the disclosure field" title="The disclosure field" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Fade show={s >= 1}>
          <VH_Cap mono color={s === 1 ? c.clayHex : c.muted}>
            threshold_1of1_key3_disclosure · 46 bytes
          </VH_Cap>
          <div style={{ display: 'flex', marginTop: 10 }}>
            <VH_Seg bytes="00" tone="type" />
            <VH_Seg bytes="01" tone="type" />
            <VH_Seg bytes="02 0001 01" label="n = 1" />
            <VH_Seg bytes="04 0021 02f9308a…bce036f9" label="keys: key 3" />
            <VH_Seg bytes="0a 0001 01" label="disclosure, mode 0x01" hot />
          </div>
        </Fade>
      </At>
      <At x={120} y={404} w={1220}>
        <Fade show={s >= 2}>
          <div style={{ display: 'flex', gap: 24 }}>
            <VH_Pill mono>without: 23e8ff16…839116cb</VH_Pill>
            <VH_Pill mono tone="on">
              with: b957f8b5…00793cd6
            </VH_Pill>
          </div>
        </Fade>
      </At>
      <Canvas>
        <Arrow x1={494} y1={548} x2={546} y2={548} show={s >= 3} />
        <Arrow x1={880} y1={548} x2={932} y2={548} show={s >= 3} delay={200} />
        <Packet run={run(3)} x1={494} y1={548} x2={946} y2={548} color={c.clayHex} delay={300} dur={1200} />
      </Canvas>
      <VH_Card x={120} y={494} w={372} h={108} show={s >= 3} pad="12px 18px">
        <Label>spend through the leaf</Label>
        <div style={{ fontSize: 22, marginTop: 6 }}>script-path witness</div>
      </VH_Card>
      <VH_Card x={548} y={494} w={330} h={108} show={s >= 3} delay={150} pad="12px 18px">
        <Label>mint</Label>
        <div style={{ fontSize: 22, marginTop: 6 }}>with NUT-07 or NUT-17</div>
      </VH_Card>
      <VH_Card x={934} y={494} w={406} h={108} tone="on" show={s >= 3} delay={300} pad="12px 18px">
        <Label color={c.clayHex}>published</Label>
        <div style={{ fontSize: 22, marginTop: 6 }}>exact witness + input digest</div>
      </VH_Card>
      <At x={120} y={634} w={1220}>
        <Fade show={s >= 4}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'stretch' }}>
            <div style={{ flex: 1, border: `1.5px dashed ${c.bad}`, background: c.badSoft, borderRadius: 12, padding: '12px 18px', fontSize: 22, lineHeight: 1.4 }}>
              <Label color={c.bad}>key path</Label>
              one signature by <M>p′</M>: no leaf, nothing published
            </div>
            <div style={{ flex: 1, border: `1.5px solid ${c.good}`, background: c.goodSoft, borderRadius: 12, padding: '12px 18px', fontSize: 22, lineHeight: 1.4 }}>
              <Label color={c.good}>closed by a NUMS internal key</Label>
              <M>K = H + u·G</M>, <M>u</M> in spend info
            </div>
          </div>
        </Fade>
      </At>
      <At x={120} y={800} w={1220}>
        <Fade show={s >= 5}>
          <Label color={s === 5 ? c.clayHex : c.muted}>Auditable lock to key 3 (vector)</Label>
          <div style={{ fontSize: 22, lineHeight: 1.5, marginTop: 6 }}>
            <Code>K = H + 7·G = 028edfeb…ca7bd407</Code>, one leaf above, secret <Code>02fc11bf…c13a053b</Code>
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          disclosure (0x0a) is optional. When present it MUST be mode 0x01: <Code>0a000101</Code>.
        </StepItem>
        <StepItem n={2} step={s}>
          It is part of the leaf bytes, so it changes the leaf hash and the secret.
        </StepItem>
        <StepItem n={3} step={s}>
          Satisfaction is unchanged. A mint with NUT-07 or NUT-17 MUST publish the exact witness and input digest.
        </StepItem>
        <StepItem n={4} step={s}>
          A protocol relying on publication MUST check that no path avoids it, the key path included.
        </StepItem>
        <StepItem n={5} step={s}>
          The auditable lock: NUMS internal key, one threshold leaf with disclosure.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_LfCommit: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  return (
    <VarShell of={VH_OF_LF} lens="Focus: the commit leaf" title="The commit leaf" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Fade show={s >= 1}>
          <VH_Cap mono color={s === 1 ? c.clayHex : c.muted}>
            leaf_commit · 37 bytes
          </VH_Cap>
          <div style={{ display: 'flex', marginTop: 10 }}>
            <VH_Seg bytes="00" label="version" tone="type" />
            <VH_Seg bytes="04" label="type: commit" tone="type" />
            <VH_Seg bytes="08 0020 64451ff9…cfaf46fae" label='hash = SHA256("external data")' hot={s === 2} />
          </div>
        </Fade>
      </At>
      <Canvas>
        <VH_Edge x1={360} y1={625} x2={580} y2={508} show={s >= 3} />
        <VH_Edge x1={840} y1={625} x2={620} y2={508} show={s >= 3} />
        <Arrow x1={802} y1={470} x2={1008} y2={470} show={s >= 3} color={c.clayHex} delay={300} />
        <T x={905} y={452} size={21} font="mono" color={c.muted} show={s >= 3} delay={300}>
          K = H + 7·G
        </T>
        <Packet run={run(4)} x1={840} y1={625} x2={620} y2={508} color={c.clayHex} delay={200} />
        <Packet run={run(4)} x1={360} y1={625} x2={580} y2={508} color={c.dim} delay={200} />
      </Canvas>
      <VH_Node x={600} y={470} w={400} h={76} title="root" sub="14147412…12b01fad" show={s >= 3} delay={200} />
      <VH_Node x={1160} y={470} w={300} h={76} title="secret" sub="0217b907…6b9b3c28" tone="on" show={s >= 3} delay={500} />
      <VH_Node
        x={360}
        y={670}
        w={420}
        h={90}
        title="commit leaf"
        sub="20cccc22…f9914f27"
        tone="idle"
        dashed={s >= 4}
        show={s >= 2}
      />
      <VH_Node x={840} y={670} w={420} h={90} title="threshold + disclosure, key 3" sub="b957f8b5…00793cd6" tone={s >= 4 ? 'on' : 'idle'} show={s >= 2} delay={100} />
      <At x={120} y={752} w={1220}>
        <Fade show={s >= 4}>
          <Note style={{ color: c.ink }}>
            Spending: key 3 reveals the threshold leaf with <Code>path = [20cccc22…]</Code>. The mint sees the commitment as
            one sibling hash.
          </Note>
        </Fade>
        <Fade show={s >= 5} style={{ marginTop: 12 }}>
          <Note style={{ color: c.ink }}>
            A witness revealing the commit leaf MUST be rejected. Use: bind the proof to external data, eg the Nostr event a
            Nutzap pays for.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          A commit leaf carries <Code>hash</Code> and nothing else: no keys, no disclosure.
        </StepItem>
        <StepItem n={2} step={s}>
          It sits beside a real condition, here the auditable threshold leaf.
        </StepItem>
        <StepItem n={3} step={s}>
          It changes the root, so the secret commits to those 32 bytes.
        </StepItem>
        <StepItem n={4} step={s}>
          Spends go through the other leaf; the commit stays a hash.
        </StepItem>
        <StepItem n={5} step={s}>
          It grants no spend power. A receiver treats it as inert.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Group 4 · 2.3 The fold fixes the shape
// ═════════════════════════════════════════════════════════════════════════════

const VH_Ball = ({
  x,
  y,
  label,
  show,
  tone = 'idle',
  dashed = false,
  r = 36,
  delay = 0,
}: {
  x: number;
  y: number;
  label: string;
  show: boolean;
  tone?: VH_Tone;
  dashed?: boolean;
  r?: number;
  delay?: number;
}) => (
  <GFade show={show} delay={delay}>
    <circle
      cx={x}
      cy={y}
      r={r}
      style={{
        fill: VH_BG[tone],
        stroke: VH_BORDER[tone],
        strokeWidth: tone === 'idle' ? 1.75 : 2.5,
        strokeDasharray: dashed ? '5 5' : 'none',
        transition: `fill 300ms ${EASE_OUT}, stroke 300ms ${EASE_OUT}`,
      }}
    />
    <text x={x} y={y + 10} textAnchor="middle" style={{ fontFamily: MATH, fontStyle: 'italic', fontSize: 28, fill: c.ink }}>
      {label}
    </text>
  </GFade>
);

const VH_FdBeginner: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const path = s >= 5;
  return (
    <VarShell of={VH_OF_FD} lens="Beginner" title="Folding five hashes" proc={proc}>
      <Canvas>
        <T x={1230} y={808} size={22} color={c.muted} anchor="start" show={s >= 1}>
          level 0
        </T>
        <T x={1230} y={648} size={22} color={c.muted} anchor="start" show={s >= 2}>
          level 1
        </T>
        <T x={1230} y={488} size={22} color={c.muted} anchor="start" show={s >= 3}>
          level 2
        </T>
        <T x={1230} y={328} size={22} color={c.muted} anchor="start" show={s >= 4}>
          level 3
        </T>
        <VH_Edge x1={200} y1={764} x2={320} y2={676} show={s >= 2} />
        <VH_Edge x1={440} y1={764} x2={320} y2={676} show={s >= 2} />
        <VH_Edge x1={680} y1={764} x2={800} y2={676} show={s >= 2} />
        <VH_Edge x1={920} y1={764} x2={800} y2={676} show={s >= 2} />
        <VH_Edge x1={1160} y1={764} x2={1160} y2={676} show={s >= 2} dashed />
        <VH_Edge x1={320} y1={604} x2={560} y2={524} show={s >= 3} />
        <VH_Edge x1={800} y1={604} x2={560} y2={524} show={s >= 3} />
        <VH_Edge x1={1160} y1={604} x2={1160} y2={516} show={s >= 3} dashed />
        <VH_Edge x1={560} y1={436} x2={860} y2={364} show={s >= 4} />
        <VH_Edge x1={1160} y1={444} x2={860} y2={364} show={s >= 4} />

        <VH_Ball x={200} y={800} label="a" show={s >= 1} />
        <VH_Ball x={440} y={800} label="b" show={s >= 1} delay={50} />
        <VH_Ball x={680} y={800} label="c" show={s >= 1} delay={100} tone={path ? 'cool' : 'idle'} />
        <VH_Ball x={920} y={800} label="d" show={s >= 1} delay={150} tone={path ? 'on' : 'idle'} />
        <VH_Ball x={1160} y={800} label="e" show={s >= 1} delay={200} />
        <VH_Ball x={320} y={640} label="ab" show={s >= 2} delay={300} tone={path ? 'on' : 'idle'} />
        <VH_Ball x={800} y={640} label="cd" show={s >= 2} delay={350} />
        <VH_Ball x={1160} y={640} label="e" show={s >= 2} delay={400} tone="cool" dashed />
        <VH_Ball x={560} y={480} label="abcd" r={44} show={s >= 3} delay={300} />
        <VH_Ball x={1160} y={480} label="e" show={s >= 3} delay={350} tone={path ? 'on' : 'cool'} dashed />
        <VH_Ball x={860} y={320} label="root" r={44} show={s >= 4} delay={300} tone="on" />
      </Canvas>
      <At x={120} y={880} w={1220}>
        <Fade show={s >= 5}>
          <Note style={{ color: c.ink }}>
            Path for <M>c</M>: <M>[d, ab, e]</M>. Path for <M>e</M>: <M>[abcd]</M>.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Five leaf hashes, sorted ascending: <M>a &lt; b &lt; c &lt; d &lt; e</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Pair neighbours: <M>ab</M> is the hash of <M>a</M> and <M>b</M>. <M>e</M> has no partner and moves up unchanged.
        </StepItem>
        <StepItem n={3} step={s}>
          Next level: pair <M>ab</M> with <M>cd</M>. <M>e</M> moves up again.
        </StepItem>
        <StepItem n={4} step={s}>
          Pair <M>abcd</M> with <M>e</M>: one hash is left, the root.
        </StepItem>
        <StepItem n={5} step={s}>
          To prove <M>c</M>, send the sibling at each level: <M>d</M>, <M>ab</M>, <M>e</M>.
        </StepItem>
        <Note style={{ marginTop: 14, fontSize: 21 }}>Each pair is hashed smaller value first, with the branch tag.</Note>
      </StepList>
    </VarShell>
  );
};

const VH_ERow = ({ n, s, head = false, a, b, c3 }: { n: number; s: number; head?: boolean; a: ReactNode; b: ReactNode; c3: ReactNode }) => {
  const show = head || s >= Math.ceil(n / 2);
  const hot = !head && s === Math.ceil(n / 2);
  const cell = (w: number, size: number): CSSProperties => ({
    width: w,
    flexShrink: 0,
    boxSizing: 'border-box',
    padding: '10px 18px',
    fontSize: head ? 20 : size,
    lineHeight: 1.35,
    letterSpacing: head ? '0.08em' : undefined,
    textTransform: head ? 'uppercase' : undefined,
    color: head ? c.muted : c.ink,
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: head ? 52 : 86,
        borderBottom: `1px solid ${head ? c.line : c.rule}`,
        borderLeft: `3px solid ${hot ? c.clayHex : 'transparent'}`,
        ...VH_enter(show, 0, 0.25),
      }}
    >
      <div style={{ ...cell(300, 24), fontWeight: head ? 400 : 600 }}>{a}</div>
      <div style={cell(800, 23)}>{b}</div>
      <div style={{ ...cell(577, 22), color: head ? c.muted : c.muted }}>{c3}</div>
    </div>
  );
};

const VH_FdAdvanced: Page = () => {
  const proc = useProcess(3, 2800);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_FD} lens="Advanced" title="Fold edge cases" proc={proc}>
      <At x={120} y={256} w={1680}>
        <VH_ERow n={0} s={s} head a="case" b="rule" c3="vector or consequence" />
        <VH_ERow
          n={1}
          s={s}
          a="one leaf"
          b="The root is the leaf hash. The path is empty."
          c3={
            <>
              single after leaf: root <Code>9ed9c0b8…0616589a</Code>
            </>
          }
        />
        <VH_ERow
          n={2}
          s={s}
          a="odd count"
          b="The unpaired last hash is promoted unchanged, never hashed with itself."
          c3="Bitcoin's transaction merkle tree duplicates the last hash instead."
        />
        <VH_ERow
          n={3}
          s={s}
          a="duplicate leaves"
          b="Kept. The fold MUST NOT deduplicate."
          c3={
            <>
              root <Code>branch(h, h) = 1eaf2914…</Code>, not <Code>h</Code>
            </>
          }
        />
        <VH_ERow
          n={4}
          s={s}
          a="permuted list"
          b="Same root. MUST be treated as equivalent; nothing is derived from a leaf's position."
          c3={
            <>
              every order of the three-leaf vector: <Code>3d4fbecf…</Code>
            </>
          }
        />
        <VH_ERow
          n={5}
          s={s}
          a="9 or more leaves"
          b="Rejected outright, even if promotion gives some leaf a short path."
          c3="9 leaves: eight paths of 4 hashes, one path of 1"
        />
        <VH_ERow
          n={6}
          s={s}
          a="path over 3 hashes"
          b="The verifier rejects it first, before recomputing anything."
          c3="control.path has at most 3 entries"
        />
      </At>
    </VarShell>
  );
};

const VH_MiniFold = ({ x, y, n, show, hot }: { x: number; y: number; n: number; show: boolean; hot: boolean }) => {
  const { nodes, edges, depth } = foldLayout(n);
  const fx = (v: number) => 40 + ((v - 120) * 310) / 960;
  const fy = (v: number) => 238 - ((780 - v) / 130) * 56;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 390,
        height: 318,
        boxSizing: 'border-box',
        border: `1.5px solid ${hot ? c.clayHex : c.rule}`,
        background: c.card,
        borderRadius: 12,
        ...VH_enter(show),
      }}
    >
      <svg viewBox="0 0 390 318" style={{ position: 'absolute', inset: 0, width: 390, height: 318 }}>
        <text x={20} y={40} style={{ fontFamily: SERIF, fontSize: 30, fill: hot ? c.clayHex : c.ink }}>
          {n}
        </text>
        {edges.map((e) => (
          <line
            key={e.id}
            x1={fx(e.x1)}
            y1={fy(e.y1)}
            x2={fx(e.x2)}
            y2={fy(e.y2)}
            style={{ stroke: e.dashed ? c.cool : c.node, strokeWidth: 1.75, strokeDasharray: e.dashed ? '4 5' : 'none' }}
          />
        ))}
        {nodes.map((nd) => (
          <circle
            key={nd.id}
            cx={fx(nd.x)}
            cy={fy(nd.y)}
            r={nd.root ? 11 : nd.kind === 'leaf' ? 9 : 7}
            style={{
              fill: nd.root ? c.clayHex : nd.kind === 'promoted' ? c.coolSoft : c.card,
              stroke: nd.root ? c.clayHex : nd.kind === 'promoted' ? c.cool : nd.kind === 'leaf' ? c.ink : c.node,
              strokeWidth: 1.75,
              strokeDasharray: nd.kind === 'promoted' && !nd.root ? '3 3' : 'none',
            }}
          />
        ))}
        <text x={195} y={294} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.muted }}>
          {depth.join(' ')}
        </text>
      </svg>
    </div>
  );
};

const VH_FdGraphic: Page = () => {
  const proc = useProcess(8, 1300);
  const s = proc.step;
  const X = [120, 550, 980, 1410];
  return (
    <VarShell of={VH_OF_FD} lens="Graphical" title="All eight trees" proc={proc}>
      <VH_MiniFold x={X[0]} y={262} n={1} show={s >= 1} hot={s === 1} />
      <VH_MiniFold x={X[1]} y={262} n={2} show={s >= 2} hot={s === 2} />
      <VH_MiniFold x={X[2]} y={262} n={3} show={s >= 3} hot={s === 3} />
      <VH_MiniFold x={X[3]} y={262} n={4} show={s >= 4} hot={s === 4} />
      <VH_MiniFold x={X[0]} y={604} n={5} show={s >= 5} hot={s === 5} />
      <VH_MiniFold x={X[1]} y={604} n={6} show={s >= 6} hot={s === 6} />
      <VH_MiniFold x={X[2]} y={604} n={7} show={s >= 7} hot={s === 7} />
      <VH_MiniFold x={X[3]} y={604} n={8} show={s >= 8} hot={s === 8} />
      <At x={120} y={938} w={1680}>
        <div style={{ fontSize: 22, color: c.muted }}>dashed: promoted unchanged · digits: path length per leaf, sorted order</div>
      </At>
    </VarShell>
  );
};

const VH_FdTable: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const W = [110, 130, 220, 200, 420];
  const V = [220, 320];
  return (
    <VarShell of={VH_OF_FD} lens="Explained via a table" title="Leaf count, levels, path lengths" proc={proc}>
      <At x={120} y={262} w={1080}>
        <Row i={0} head>
          <Cell head w={W[0]}>n</Cell>
          <Cell head w={W[1]}>levels</Cell>
          <Cell head w={W[2]}>branches</Cell>
          <Cell head w={W[3]}>promotions</Cell>
          <Cell head w={W[4]}>path lengths, sorted order</Cell>
        </Row>
        <Fade show={s >= 1} dimTo={0.25}>
          <Row i={1}>
            <Cell w={W[0]}>1</Cell>
            <Cell w={W[1]}>0</Cell>
            <Cell w={W[2]}>0</Cell>
            <Cell w={W[3]}>0</Cell>
            <Cell w={W[4]}><Code>0</Code></Cell>
          </Row>
          <Row i={2}>
            <Cell w={W[0]}>2</Cell>
            <Cell w={W[1]}>1</Cell>
            <Cell w={W[2]}>1</Cell>
            <Cell w={W[3]}>0</Cell>
            <Cell w={W[4]}><Code>1 1</Code></Cell>
          </Row>
          <Row i={3}>
            <Cell w={W[0]}>3</Cell>
            <Cell w={W[1]}>2</Cell>
            <Cell w={W[2]}>2</Cell>
            <Cell w={W[3]}>1</Cell>
            <Cell w={W[4]}><Code>2 2 1</Code></Cell>
          </Row>
          <Row i={4}>
            <Cell w={W[0]}>4</Cell>
            <Cell w={W[1]}>2</Cell>
            <Cell w={W[2]}>3</Cell>
            <Cell w={W[3]}>0</Cell>
            <Cell w={W[4]}><Code>2 2 2 2</Code></Cell>
          </Row>
        </Fade>
        <Fade show={s >= 2} dimTo={0.25}>
          <Row i={5}>
            <Cell w={W[0]}>5</Cell>
            <Cell w={W[1]}>3</Cell>
            <Cell w={W[2]}>4</Cell>
            <Cell w={W[3]}>2</Cell>
            <Cell w={W[4]}><Code>3 3 3 3 1</Code></Cell>
          </Row>
          <Row i={6}>
            <Cell w={W[0]}>6</Cell>
            <Cell w={W[1]}>3</Cell>
            <Cell w={W[2]}>5</Cell>
            <Cell w={W[3]}>1</Cell>
            <Cell w={W[4]}><Code>3 3 3 3 2 2</Code></Cell>
          </Row>
          <Row i={7}>
            <Cell w={W[0]}>7</Cell>
            <Cell w={W[1]}>3</Cell>
            <Cell w={W[2]}>6</Cell>
            <Cell w={W[3]}>1</Cell>
            <Cell w={W[4]}><Code>3 3 3 3 3 3 2</Code></Cell>
          </Row>
          <Row i={8}>
            <Cell w={W[0]}>8</Cell>
            <Cell w={W[1]}>3</Cell>
            <Cell w={W[2]}>7</Cell>
            <Cell w={W[3]}>0</Cell>
            <Cell w={W[4]}><Code>3 3 3 3 3 3 3 3</Code></Cell>
          </Row>
        </Fade>
        <Fade show={s >= 3} dimTo={0.25}>
          <Row i={9}>
            <Cell w={W[0]} color={c.bad}>9</Cell>
            <Cell w={W[1]} color={c.bad}>4</Cell>
            <Cell w={W[2]} color={c.bad}>8</Cell>
            <Cell w={W[3]} color={c.bad}>3</Cell>
            <Cell w={W[4]} color={c.bad}>rejected: over 8 leaves</Cell>
          </Row>
        </Fade>
      </At>
      <At x={1260} y={262} w={540}>
        <Fade show={s >= 4} dimTo={0.25}>
          <Row i={0} head>
            <Cell head w={V[0]}>path length</Cell>
            <Cell head w={V[1]}>possible n</Cell>
          </Row>
          <Row i={1}>
            <Cell w={V[0]}>0</Cell>
            <Cell w={V[1]}>1</Cell>
          </Row>
          <Row i={2}>
            <Cell w={V[0]}>1</Cell>
            <Cell w={V[1]}>2, 3, 5</Cell>
          </Row>
          <Row i={3}>
            <Cell w={V[0]}>2</Cell>
            <Cell w={V[1]}>3, 4, 6, 7</Cell>
          </Row>
          <Row i={4}>
            <Cell w={V[0]}>3</Cell>
            <Cell w={V[1]}>5, 6, 7, 8</Cell>
          </Row>
          <Note style={{ marginTop: 18, fontSize: 22 }}>
            A script-path witness shows its path length. Under the fixed fold that narrows the leaf count to these sets.
          </Note>
        </Fade>
      </At>
      <At x={120} y={900} w={1080}>
        <Note style={{ fontSize: 21 }}>All values computed from the normative fold: sort, pair, promote.</Note>
      </At>
    </VarShell>
  );
};

const VH_FdPayer: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  const A = 340;
  const B = 1040;
  return (
    <VarShell of={VH_OF_FD} lens="Perspective: payer and payee" title="Rebuilding a requested tree" proc={proc}>
      <Canvas>
        <Lifeline x={A} label="payee" top={304} bottom={930} color={c.cool} />
        <Lifeline x={B} label="payer" top={304} bottom={930} />
        <Arrow x1={A} y1={362} x2={B} y2={362} show={s >= 1} color={c.cool} />
        <T x={(A + B) / 2} y={348} size={22} color={c.cool} show={s >= 1} delay={200}>
          NUT-18 request: static key, leaves, blind set
        </T>
        <Packet run={run(1)} x1={A} y1={362} x2={B} y2={362} color={c.cool} delay={200} />
        <Arrow x1={B} y1={800} x2={A} y2={800} show={s >= 5} color={c.clayHex} />
        <T x={(A + B) / 2} y={786} size={22} color={c.clayHex} show={s >= 5} delay={200}>
          proof with secret P, spend info
        </T>
        <Packet run={run(5)} x1={B} y1={800} x2={A} y2={800} color={c.clayHex} delay={200} />
      </Canvas>
      <VH_Card x={760} y={420} w={560} h={82} tone={s === 2 ? 'on' : 'dim'} show={s >= 2} pad="10px 18px">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          <M>K</M>: <M>k</M> blinded at slot 0 with a fresh <M>E</M>, or <M>H + u·G</M>
        </div>
      </VH_Card>
      <VH_Card x={760} y={530} w={560} h={100} tone={s === 3 ? 'on' : 'dim'} show={s >= 3} pad="10px 18px">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          leaves: reproduce <M>l</M> byte for byte, blinding keys tagged in <M>b</M>; else refuse
        </div>
      </VH_Card>
      <VH_Card x={760} y={658} w={560} h={100} tone={s === 4 ? 'on' : 'dim'} show={s >= 4} pad="10px 18px">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          root: sort, pair, promote. <M>P = K + t·G</M>. No shape was sent.
        </div>
      </VH_Card>
      <VH_Card x={360} y={836} w={420} h={86} tone={s === 5 ? 'cool' : 'dim'} show={s >= 5} delay={400} pad="10px 18px">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          check 1; the tree is exactly <M>l</M>, in any order
        </div>
      </VH_Card>
      <StepList>
        <StepItem n={1} step={s}>
          The payee sends its static key <M>k</M> and the leaves <M>l</M> in slot order; <M>b</M> marks keys to blind.
        </StepItem>
        <StepItem n={2} step={s}>
          The payer derives the internal key.
        </StepItem>
        <StepItem n={3} step={s}>
          It reproduces every leaf exactly. If it cannot, it MUST refuse to pay.
        </StepItem>
        <StepItem n={4} step={s}>
          The leaf list alone fixes the tree: the fold needs no shape information.
        </StepItem>
        <StepItem n={5} step={s}>
          The payee checks the tree is exactly the request: no extra leaf, in any order.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_FdDup: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  return (
    <VarShell of={VH_OF_FD} lens="Focus: duplicate leaves" title="Duplicate leaves are kept" proc={proc}>
      <At x={120} y={262}>
        <Label color={c.good}>As specified</Label>
      </At>
      <At x={860} y={262}>
        <Label color={s >= 4 ? c.bad : c.muted}>Deduplicated</Label>
      </At>
      <Canvas>
        <VH_Edge x1={300} y1={655} x2={450} y2={558} show={s >= 3} />
        <VH_Edge x1={600} y1={655} x2={450} y2={558} show={s >= 3} />
        <VH_Edge x1={450} y1={482} x2={450} y2={398} show={s >= 3} delay={250} />
        <Packet run={run(3)} x1={300} y1={655} x2={450} y2={558} color={c.clayHex} delay={200} />
        <Packet run={run(3)} x1={600} y1={655} x2={450} y2={558} color={c.clayHex} delay={200} />
        <VH_Edge x1={1100} y1={655} x2={1100} y2={558} show={s >= 4} color={c.bad} />
        <VH_Edge x1={1100} y1={482} x2={1100} y2={398} show={s >= 4} color={c.bad} delay={250} />
        <GFade show={s >= 5}>
          <path d="M 600 745 Q 450 800 300 745" style={{ fill: 'none', stroke: c.cool, strokeWidth: 2, strokeDasharray: '5 6' }} />
        </GFade>
      </Canvas>
      <VH_Node x={300} y={700} w={270} h={90} title="threshold_1of1_key3" sub="h = 23e8ff16…" show={s >= 1} tone={s === 2 ? 'on' : 'idle'} titleSize={21} />
      <VH_Node x={600} y={700} w={270} h={90} title="threshold_1of1_key3" sub="h = 23e8ff16…" show={s >= 1} delay={80} tone={s === 2 ? 'on' : 'idle'} titleSize={21} />
      <VH_Node x={450} y={520} w={340} h={76} title="root = branch(h, h)" sub="1eaf2914…ddd2cbc6" show={s >= 3} tone="good" delay={200} />
      <VH_Node x={450} y={360} w={340} h={76} title="secret, K = key 6" sub="03dd2f11…f1b0dbfd" show={s >= 3} tone="good" delay={450} />
      <VH_Node x={1100} y={700} w={300} h={90} title="one copy" sub="h = 23e8ff16…" show={s >= 4} tone="bad" titleSize={21} />
      <VH_Node x={1100} y={520} w={340} h={76} title="root = h" sub="23e8ff16…839116cb" show={s >= 4} tone="bad" delay={200} />
      <VH_Node x={1100} y={360} w={340} h={76} title="secret, K = key 6" sub="02d40875…61e17428" show={s >= 4} tone="bad" delay={450} />
      <At x={120} y={820} w={1220}>
        <Fade show={s >= 5}>
          <Note style={{ color: c.ink }}>
            Either copy spends with <Code>path = [23e8ff16…]</Code>. Left column: vector values; right column: computed.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Two identical threshold leaves under internal key 6.
        </StepItem>
        <StepItem n={2} step={s}>
          Both hash to the same <M>h</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          The fold pairs them: the root is <M>
            <Up>branch</Up>(h, h)
          </M>
          , distinct from <M>h</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          A wallet that deduplicates gets root <M>h</M> and a different secret: check 1 fails on a valid proof.
        </StepItem>
        <StepItem n={5} step={s}>
          Either copy spends, with the other copy's hash as its path.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_OChip = ({ x, y, label, show, delay = 0, tone = 'idle' }: { x: number; y: number; label: string; show: boolean; delay?: number; tone?: VH_Tone }) => (
  <VH_Node x={x} y={y} w={150} h={56} title={label} show={show} delay={delay} tone={tone} titleSize={21} />
);

const VH_FdOrder: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const run = (n: number) => proc.anim && s === n;
  const rows = [310, 440, 570];
  return (
    <VarShell of={VH_OF_FD} lens="Focus: order independence" title="Any transmitted order, one root" proc={proc}>
      <At x={120} y={250}>
        <Label>transmitted order</Label>
      </At>
      <VH_OChip x={195} y={rows[0]} label="threshold" show={s >= 1} />
      <VH_OChip x={360} y={rows[0]} label="after" show={s >= 1} delay={40} />
      <VH_OChip x={525} y={rows[0]} label="hashlock" show={s >= 1} delay={80} />
      <VH_OChip x={195} y={rows[1]} label="hashlock" show={s >= 1} delay={120} />
      <VH_OChip x={360} y={rows[1]} label="threshold" show={s >= 1} delay={160} />
      <VH_OChip x={525} y={rows[1]} label="after" show={s >= 1} delay={200} />
      <VH_OChip x={195} y={rows[2]} label="after" show={s >= 1} delay={240} />
      <VH_OChip x={360} y={rows[2]} label="hashlock" show={s >= 1} delay={280} />
      <VH_OChip x={525} y={rows[2]} label="threshold" show={s >= 1} delay={320} />
      <Canvas>
        <Arrow x1={610} y1={rows[0]} x2={758} y2={428} show={s >= 2} color={c.node} />
        <Arrow x1={610} y1={rows[1]} x2={758} y2={440} show={s >= 2} color={c.node} delay={60} />
        <Arrow x1={610} y1={rows[2]} x2={758} y2={452} show={s >= 2} color={c.node} delay={120} />
        <Packet run={run(2)} x1={610} y1={rows[0]} x2={760} y2={428} color={c.ink} delay={300} />
        <Packet run={run(2)} x1={610} y1={rows[1]} x2={760} y2={440} color={c.ink} delay={300} />
        <Packet run={run(2)} x1={610} y1={rows[2]} x2={760} y2={452} color={c.ink} delay={300} />
        <Arrow x1={1015} y1={484} x2={1015} y2={560} show={s >= 3} color={c.clayHex} />
      </Canvas>
      <At x={770} y={250}>
        <Label>after hashing and sorting</Label>
      </At>
      <VH_Node x={845} y={440} w={150} h={80} title={<M>h₀</M>} sub="23e8ff16…" show={s >= 2} delay={300} />
      <VH_Node x={1015} y={440} w={150} h={80} title={<M>h₂</M>} sub="8f38ddf9…" show={s >= 2} delay={350} />
      <VH_Node x={1185} y={440} w={150} h={80} title={<M>h₁</M>} sub="9ed9c0b8…" show={s >= 2} delay={400} />
      <VH_Node x={1015} y={606} w={320} h={80} title="root" sub="3d4fbecf…b49d43ad" tone="on" show={s >= 3} delay={200} />
      <At x={120} y={700} w={1220}>
        <Fade show={s >= 4}>
          <Label color={s === 4 ? c.clayHex : c.muted}>Path for the hashlock leaf</Label>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'nowrap' }}>
            <VH_Pill mono>path = [23e8ff16…, 9ed9c0b8…]</VH_Pill>
            <span style={{ fontSize: 24, color: c.muted }}>→</span>
            <M size={28}>
              <Up>branch</Up>(min, max)
            </M>
            <span style={{ fontSize: 24, color: c.muted }}>at each level</span>
          </div>
          <Note style={{ marginTop: 12 }}>No left/right flags: the verifier orders each pair itself.</Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Three transmitted orders of the same three leaves.
        </StepItem>
        <StepItem n={2} step={s}>
          Hashing and sorting erases the order: every list becomes <M>h₀, h₂, h₁</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          Same fold, same root. A permuted list MUST be treated as equivalent; nothing is derived from position.
        </StepItem>
        <StepItem n={4} step={s}>
          Pairs hash lower value first, so a path is a plain list of hashes.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VH_Derive = ({ y, show, hot, from, children }: { y: number; show: boolean; hot: boolean; from: ReactNode; children: ReactNode }) => (
  <div style={{ position: 'absolute', left: 120, top: y, width: 1220, height: 112, display: 'flex', alignItems: 'stretch', gap: 0, ...VH_enter(show) }}>
    <div
      style={{
        width: 380,
        boxSizing: 'border-box',
        border: `1.5px solid ${hot ? c.clayHex : c.rule}`,
        background: hot ? c.claySoft : c.panel,
        borderRadius: 12,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        fontSize: 24,
        fontWeight: 600,
        transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      {from}
    </div>
    <div style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: c.muted }}>→</div>
    <div
      style={{
        flex: 1,
        boxSizing: 'border-box',
        border: `1.5px solid ${c.rule}`,
        background: c.card,
        borderRadius: 12,
        padding: '10px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontSize: 23,
        lineHeight: 1.4,
      }}
    >
      {children}
    </div>
  </div>
);

const VH_FdLimits: Page = () => {
  const proc = useProcess(5, 2600);
  const s = proc.step;
  return (
    <VarShell of={VH_OF_FD} lens="Framing: the constraint behind the limits" title="Where 8, 3, 512 and 120 come from" proc={proc}>
      <VH_Derive y={262} show={s >= 1} hot={s === 1} from="NUT-28 slot index: one byte">
        <div>256 slots per secret: slot 0 is the internal key, at most 255 leaf keys.</div>
        <div style={{ color: c.muted }}>A 256th leaf key would reuse slot 0's index.</div>
      </VH_Derive>
      <VH_Derive y={398} show={s >= 2} hot={s === 2} from="leaf body ≤ 512 bytes">
        <div>
          threshold body: <M>1 + 4 + 3 + 33·m ≤ 512</M>, so <M>m ≤ 15</M> keys
        </div>
        <div style={{ color: c.muted }}>15 keys: 503 B. 16 keys: 536 B.</div>
      </VH_Derive>
      <VH_Derive y={534} show={s >= 3} hot={s === 3} from="tree ≤ 8 leaves">
        <div>8 × 15 = 120 leaf keys, within the 255 slots.</div>
      </VH_Derive>
      <VH_Derive y={670} show={s >= 4} hot={s === 4} from="8 leaves, fixed fold">
        <div>Every path has at most 3 sibling hashes.</div>
        <div style={{ color: c.muted }}>A tree of 9 or more leaves is rejected outright.</div>
      </VH_Derive>
      <VH_Derive y={806} show={s >= 5} hot={s === 5} from="future increases">
        <div>MUST stay within 255 slots, or revise NUT-28's slot encoding.</div>
      </VH_Derive>
      <StepList>
        <StepItem n={1} step={s}>
          NUT-28 blinds each key with a one-byte slot index. Slot 0 is the internal key.
        </StepItem>
        <StepItem n={2} step={s}>
          A leaf body is capped at 512 bytes. At 33 bytes per key, a leaf holds at most 15.
        </StepItem>
        <StepItem n={3} step={s}>
          Eight leaves of 15 keys: 120, inside the 255 leaf-key slots.
        </StepItem>
        <StepItem n={4} step={s}>
          The same cap of eight bounds every path to three hashes.
        </StepItem>
        <StepItem n={5} step={s}>
          Raising either cap means changing NUT-28 too.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Deck ────────────────────────────────────────────────────────────────────

const VH_Cover: Page = () => (
  <VarCover
    section="2.3"
    title="Nutroot secrets: keys, leaves, tree"
    sources={[
      { n: '2.3', title: 'The secret is a public key', count: 7 },
      { n: '2.3', title: 'Tree, root and tweak', count: 7 },
      { n: '2.3', title: 'Condition leaves (leaf version 0x00)', count: 8 },
      { n: '2.3', title: 'The fold fixes the shape', count: 8 },
    ]}
  />
);

const PAGES: [Page, string | undefined][] = [
  [VH_Cover, undefined],

  [PointSecret, 'Original slide.'],
  [
    VH_PsBeginner,
    'Beginner lens. Builds a secret from the test key 7: scalar, point, 33-byte encoding, then the proof field. Say that the wallet still hashes the secret to Y for blind signing, and that spending needs a signature by k.',
  ],
  [
    VH_PsAdvanced,
    'Advanced lens. The normative rules around point secrets, grouped into encoding, key path, x-only aliasing, and uniqueness and derivation. Point out the two departures from BIP341: t mod n instead of rejection, and the 02/03 aliasing that x-only verification creates.',
  ],
  [
    VH_PsGraphic,
    'Graphical lens. One internal key feeds two lanes, bare and tweaked. Both reach the mint as 33 bytes and one 64-byte signature, so the mint cannot tell them apart.',
  ],
  [
    VH_PsBytes,
    'Explained via bytes. Proportional sizes of pre-v3 random and JSON secrets against the fixed 33-byte point, then the two parts of the point and the 64-byte key-path signature.',
  ],
  [
    VH_PsMint,
    "Perspective of the mint. Three spends as received: bare key path, tweaked key path, tweaked script path. The first two have the same shape; only the script path discloses a leaf, K and the path. Values are the receiver-keyed vectors.",
  ],
  [
    VH_PsTravel,
    'Framing: before and after. In v1 and v2 the conditions ride inside the secret and reach the mint on every spend. In v3 the tree travels in spend info between wallets, and the mint sees only the witness.',
  ],
  [
    VH_PsUnique,
    'Focus on uniqueness. One internal key from the vectors yields a different secret per tree; the empty-tweak value is computed, the rest are vectors. Mention the 02/03 prefix aliasing and that wallets should still use a fresh K per proof.',
  ],

  [NutrootTree, 'Original slide.'],
  [
    VH_TrBeginner,
    'Beginner lens. The smallest tree: the single after leaf of the refund vector. Leaf bytes, leaf hash, root equals leaf hash, tweak, secret; every value is from the spec vectors.',
  ],
  [
    VH_TrAdvanced,
    "Advanced lens. The exact tag hashes, the 129-byte tweak message with the 33-byte compressed K, reduction mod n where BIP341 rejects, the empty tweak for aggregated keys, and the key-path signer p' = k + t.",
  ],
  [
    VH_TrGraphic,
    'Graphical lens. The three-leaf vector as a left-to-right pipeline: hash, sort (the crossing arrows are the reordering), pair, promote, root, tweak, secret.',
  ],
  [
    VH_TrCode,
    'Explained via code. Python that reproduces the vector root, with a trace of every intermediate value. The listing was run against the vector before it went on the slide.',
  ],
  [
    VH_TrViews,
    'Perspective of receiver and mint. The receiver folds every leaf, which proves the disclosure is complete. The mint recomputes one path from one leaf and two opaque sibling hashes.',
  ],
  [
    VH_TrHtlc,
    'Worked example end to end. An HTLC as two leaves under a NUMS internal key: key 3 with the preimage, or key 4 after the date, and no key path. Leaves, K and leaf hashes are vector values; root, tweak and secret were computed with the spec hashes and a checked secp256k1 implementation.',
  ],
  [
    VH_TrFail,
    'Framing: failure mode. Changing three bytes of one leaf moves its hash, reorders the fold, and gives a different root, tweak and secret. This is why check 1 catches any altered tree and why a payer must reproduce requested leaves exactly.',
  ],

  [LeafEncoding, 'Original slide.'],
  [
    VH_LfBeginner,
    'Beginner lens. The simplest leaf, 42 bytes, decoded record by record: version, type, then type-length-value records for n and keys.',
  ],
  [
    VH_LfAdvanced,
    'Advanced lens. Three verdicts: malformed rejects, unsatisfiable disables one path, inert parses and grants nothing. The bottom row shows where each verdict lands: the mint judges one revealed leaf, the receiver judges every disclosed leaf at check 1.',
  ],
  [
    VH_LfGraphic,
    'Graphical lens. The five leaf shapes from the vectors drawn to scale and colored by field. The keys record dominates; hashlock is the largest at 77 bytes.',
  ],
  [
    VH_LfParser,
    'Explained via a parser. A Python sketch walks the hashlock leaf: version and type, then the record loop with ascending, allowed and bounds checks, then value checks. The order of the checks is illustrative, not normative.',
  ],
  [
    VH_LfReceiver,
    'Perspective of the receiver holding key 3. Each leaf of the three-leaf vector is read as who can spend and from when. The after leaf gives the sender a claim from 2025-08-19, which the acceptance policy has to allow for.',
  ],
  [
    VH_LfReject,
    'Framing: what fails and why. The rejection vectors from the spec with the failing bytes highlighted, plus the unknown leaf type, a revealed commit leaf, and the bounded signature lists.',
  ],
  [
    VH_LfDisclosure,
    'Focus on the disclosure field. One fixed encoding, a changed leaf hash, publication through NUT-07 and NUT-17, and why a protocol relying on it needs a NUMS internal key: the auditable lock.',
  ],
  [
    VH_LfCommit,
    'Focus on the commit leaf. It carries only a hash, changes the root and is never spendable. The vector binds SHA256 of "external data" beside the auditable threshold leaf.',
  ],

  [FoldShapes, 'Original slide.'],
  [
    VH_FdBeginner,
    'Beginner lens. Five symbolic hashes folded one level at a time: pair neighbours, promote the odd one, repeat. Ends with the merkle paths for c and e.',
  ],
  [
    VH_FdAdvanced,
    'Advanced lens. Edge cases of the normative fold: one leaf, odd counts, duplicates, permutations, more than eight leaves and over-long paths, each with its rule and a vector or consequence.',
  ],
  [
    VH_FdGraphic,
    'Graphical lens. All eight permitted shapes side by side, promoted nodes dashed, path lengths under each tree.',
  ],
  [
    VH_FdTable,
    'Explained via a table. Levels, branch hashes, promotions and path lengths for every leaf count, and the reverse view: which leaf counts a witness path length is compatible with. All computed from the fold.',
  ],
  [
    VH_FdPayer,
    'Perspective of payer and payee (NUT-18). The request carries only leaves; the payer rebuilds the tree because the fold fixes the shape, and the payee checks the tree is exactly what it asked for.',
  ],
  [
    VH_FdDup,
    'Focus on duplicate leaves, from the vectors. The fold keeps both copies, so the root is branch(h, h), not h; a deduplicating wallet would reject a valid proof. The deduplicated secret on the right is computed.',
  ],
  [
    VH_FdOrder,
    'Focus on order independence. Three transmitted orders sort to the same hash list and the same root. Paths carry no left/right flags because pairs hash in sorted order.',
  ],
  [
    VH_FdLimits,
    'Framing: the constraint behind the limits. The one-byte NUT-28 slot index allows 255 leaf keys; a 512-byte leaf body fits 15 keys; eight leaves give 120 keys and paths of at most three hashes.',
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · Nutroot secrets: keys, leaves, tree (temporary)',
  createdAt: '2026-09-28T09:03:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
