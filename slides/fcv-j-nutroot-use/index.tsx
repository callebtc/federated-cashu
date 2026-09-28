import type { ReactNode } from 'react';
import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import {
  Arrow,
  At,
  Band,
  c,
  Canvas,
  Capabilities,
  Comparison,
  Draw,
  EASE_IO,
  EASE_OUT,
  Fade,
  GFade,
  Label,
  Lifeline,
  M,
  MATH,
  MONO,
  Note,
  Packet,
  REDUCED,
  ReceiverKeyed,
  SANS,
  StepItem,
  StepList,
  T,
  VarCover,
  VarShell,
  VsBip341,
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

// ─── Shared helpers (VJ_) ────────────────────────────────────────────────────

const VJ_OF_RK = '2.4 Receiver-keyed outputs (NUT-18, NUT-28)';
const VJ_OF_CAP = '2.4 What the specification covers';
const VJ_OF_BIP = '2.4 Nutroot compared with BIP341';
const VJ_OF_CMP = '2.4 JSON secrets and nutroot secrets';

type VJ_Tone = 'idle' | 'on' | 'cool' | 'good' | 'bad' | 'dim';
const VJ_STROKE: Record<VJ_Tone, string> = {
  idle: c.node,
  on: c.clayHex,
  cool: c.cool,
  good: c.good,
  bad: c.bad,
  dim: c.rule,
};
const VJ_FILL: Record<VJ_Tone, string> = {
  idle: c.card,
  on: c.claySoft,
  cool: c.coolSoft,
  good: c.goodSoft,
  bad: c.badSoft,
  dim: c.card,
};

/** Monospace at an absolute size (the main deck's Code shrinks to 0.86em). */
const VJ_C = ({ children, color, size = 21 }: { children: ReactNode; color?: string; size?: number }) => (
  <span style={{ fontFamily: MONO, fontSize: size, color, whiteSpace: 'nowrap' }}>{children}</span>
);

const VJ_Card = ({
  x,
  y,
  w,
  h,
  show = true,
  tone,
  fill,
  delay = 0,
  pad = '14px 20px',
  children,
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
      border: `1.5px solid ${tone ?? c.rule}`,
      background: fill ?? c.card,
      borderRadius: 12,
      padding: pad,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(8px)',
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

/** Centered node box with a 21 px monospace sub line. */
const VJ_Box = ({
  x,
  y,
  w,
  h,
  title,
  sub,
  tone = 'idle',
  show = true,
  delay = 0,
  dashed = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: ReactNode;
  sub?: ReactNode;
  tone?: VJ_Tone;
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
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${VJ_STROKE[tone]}`,
      background: VJ_FILL[tone],
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      opacity: show ? 1 : 0,
      transform: `translateY(${show || REDUCED ? 0 : 6}px)`,
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
    }}
  >
    <div style={{ fontSize: 22, lineHeight: 1.25 }}>{title}</div>
    {sub && <div style={{ fontFamily: MONO, fontSize: 21, color: c.muted, marginTop: 4 }}>{sub}</div>}
  </div>
);

/** One line of JSON at 21 px, with an optional right-hand annotation. */
const VJ_JL = ({
  on = false,
  tone = c.claySoft,
  note,
  children,
}: {
  on?: boolean;
  tone?: string;
  note?: ReactNode;
  children: ReactNode;
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      fontFamily: MONO,
      fontSize: 21,
      lineHeight: 1.75,
      padding: '0 10px',
      margin: '0 -10px',
      borderRadius: 6,
      background: on ? tone : 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    <span style={{ whiteSpace: 'pre' }}>{children}</span>
    {note && <span style={{ fontFamily: SANS, fontSize: 21, color: c.muted, whiteSpace: 'nowrap' }}>{note}</span>}
  </div>
);

/** An inline run of hex bytes inside a JSON line. */
const VJ_HS = ({
  children,
  on = false,
  tone = c.claySoft,
  last = false,
}: {
  children: ReactNode;
  on?: boolean;
  tone?: string;
  last?: boolean;
}) => (
  <span
    style={{
      marginRight: last ? 0 : 10,
      padding: '1px 4px',
      borderRadius: 4,
      background: on ? tone : 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </span>
);

/** TLV segment with a 21 px caption. */
const VJ_Seg = ({
  bytes,
  label,
  tone = 'field',
  show = true,
  delay = 0,
  hot = false,
}: {
  bytes: ReactNode;
  label?: ReactNode;
  tone?: 'tag' | 'type' | 'field';
  show?: boolean;
  delay?: number;
  hot?: boolean;
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
        fontSize: 21,
        padding: '5px 10px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${hot || tone === 'type' ? c.clayHex : tone === 'tag' ? c.line : c.rule}`,
        background: hot || tone === 'type' ? c.claySoft : tone === 'tag' ? c.panel : c.card,
        color: tone === 'tag' ? c.muted : c.ink,
        transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      {bytes}
    </span>
    {label && <span style={{ fontSize: 21, color: c.muted, marginTop: 4, whiteSpace: 'nowrap' }}>{label}</span>}
  </div>
);

const VJ_TRow = ({
  children,
  h = 64,
  head = false,
  show = true,
  hot = false,
  delay = 0,
}: {
  children: ReactNode;
  h?: number;
  head?: boolean;
  show?: boolean;
  hot?: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: h,
      borderBottom: `1px solid ${head ? c.line : c.rule}`,
      boxShadow: hot ? `inset 3px 0 0 ${c.clayHex}` : 'inset 3px 0 0 transparent',
      background: hot ? 'rgba(217, 119, 87, 0.05)' : 'transparent',
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 400ms ${EASE_OUT} ${show ? delay : 0}ms, transform 400ms ${EASE_OUT} ${show ? delay : 0}ms, background 300ms ${EASE_OUT}, box-shadow 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const VJ_TCell = ({
  children,
  w,
  head = false,
  color,
  size = 22,
}: {
  children?: ReactNode;
  w: number;
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
      letterSpacing: head ? '0.08em' : undefined,
      textTransform: head ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
      lineHeight: 1.35,
    }}
  >
    {children}
  </div>
);

const VJ_Chip = ({ children, tone = c.rule, fill = c.card }: { children: ReactNode; tone?: string; fill?: string }) => (
  <span
    style={{
      display: 'inline-block',
      fontFamily: MONO,
      fontSize: 21,
      padding: '3px 10px',
      marginRight: 8,
      borderRadius: 6,
      border: `1.5px solid ${tone}`,
      background: fill,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

const VJ_Rule = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 22, lineHeight: 1.4 }}>
    <span style={{ color: c.clayHex, fontFamily: MONO }}>–</span>
    <span>{children}</span>
  </div>
);

const VJ_Mark = ({ ok }: { ok: boolean }) => (
  <span style={{ fontFamily: MONO, fontSize: 24, color: ok ? c.good : c.bad }}>{ok ? '✓' : '✗'}</span>
);

/** SVG circle node with a math label. */
const VJ_SNode = ({
  x,
  y,
  r = 40,
  label,
  tone = 'idle',
  show = true,
  delay = 0,
  size = 30,
}: {
  x: number;
  y: number;
  r?: number;
  label: ReactNode;
  tone?: VJ_Tone;
  show?: boolean;
  delay?: number;
  size?: number;
}) => (
  <GFade show={show} delay={delay}>
    <circle cx={x} cy={y} r={r} style={{ fill: VJ_FILL[tone], stroke: VJ_STROKE[tone], strokeWidth: 2.25 }} />
    <text
      x={x}
      y={y + size * 0.33}
      textAnchor="middle"
      style={{ fontFamily: MATH, fontStyle: 'italic', fontSize: size, fill: c.ink }}
    >
      {label}
    </text>
  </GFade>
);

const VJ_Plus = ({ x, y, show, delay = 0 }: { x: number; y: number; show: boolean; delay?: number }) => (
  <GFade show={show} delay={delay}>
    <circle cx={x} cy={y} r={24} style={{ fill: c.panel, stroke: c.node, strokeWidth: 1.75 }} />
    <text x={x} y={y + 10} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 30, fill: c.ink }}>
      +
    </text>
  </GFade>
);

const VJ_Eq = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 6 }}>{children}</div>
);
const VJ_Gloss = ({ children }: { children: ReactNode }) => (
  <span style={{ fontSize: 22, color: c.muted }}>{children}</span>
);

// ═════════════════════════════════════════════════════════════════════════════
// Cover
// ═════════════════════════════════════════════════════════════════════════════

const VJ_Cover: Page = () => (
  <VarCover
    section="2.4"
    title="Using nutroot"
    sources={[
      { n: '2.4', title: 'Receiver-keyed outputs (NUT-18, NUT-28)', count: 7 },
      { n: '2.4', title: 'What the specification covers', count: 8 },
      { n: '2.4', title: 'Nutroot compared with BIP341', count: 7 },
      { n: '2.4', title: 'JSON secrets and nutroot secrets', count: 7 },
    ]}
  />
);

// ═════════════════════════════════════════════════════════════════════════════
// Source 1 · Receiver-keyed outputs
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VJ_RkBeginner: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_RK} lens="Beginner" title="Paying to a static key, with small numbers" proc={proc}>
      <div style={{ position: 'absolute', left: 729, top: 262, width: 2, height: 268, background: c.rule }} />
      <At x={120} y={262} w={560}>
        <Label color={c.cool}>Payee</Label>
      </At>
      <At x={780} y={262} w={560}>
        <Label>Payer</Label>
      </At>
      <At x={120} y={300} w={590}>
        <Fade show={s >= 1}>
          <VJ_Eq>
            <M size={30}>p = 3</M>
            <VJ_Gloss>private key, never sent</VJ_Gloss>
          </VJ_Eq>
          <VJ_Eq>
            <M size={30}>P = 3·G</M>
            <VJ_Gloss>
              public key, the request's <VJ_C>k</VJ_C>
            </VJ_Gloss>
          </VJ_Eq>
          <VJ_C color={c.muted}>02f9308a…bce036f9</VJ_C>
        </Fade>
      </At>
      <At x={780} y={300} w={560}>
        <Fade show={s >= 1} delay={200}>
          <div style={{ fontSize: 22, color: c.muted, lineHeight: 1.4, paddingTop: 6 }}>
            Reads <VJ_C>k</VJ_C> from the payment request.
          </div>
        </Fade>
      </At>
      <At x={780} y={432} w={560}>
        <Fade show={s >= 2}>
          <VJ_Eq>
            <M size={30}>e = 5, E = 5·G</M>
            <VJ_Gloss>fresh per output</VJ_Gloss>
          </VJ_Eq>
          <VJ_Eq>
            <M size={30}>e·P = 5·3·G = 15·G</M>
          </VJ_Eq>
        </Fade>
      </At>
      <At x={120} y={477} w={590}>
        <Fade show={s >= 2} delay={250}>
          <VJ_Eq>
            <M size={30}>p·E = 3·5·G = 15·G</M>
            <VJ_Gloss>E comes with the proof</VJ_Gloss>
          </VJ_Eq>
        </Fade>
      </At>
      <VJ_Card x={120} y={544} w={1220} h={58} show={s >= 2} delay={450} tone={c.cool} fill={c.coolSoft} pad="12px 20px">
        <span style={{ fontSize: 22 }}>
          Both sides reach the same point <M>15·G</M>. Computing it needs the private key 3 or 5.
        </span>
      </VJ_Card>
      <VJ_Card x={120} y={622} w={1220} h={108} show={s >= 3} tone={s === 3 ? c.clayHex : c.rule}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <M size={30}>r₀ =</M>
          <VJ_C size={22}>SHA256("Cashu_P2BK_v1" ‖ x(15·G) ‖ 0x00)</VJ_C>
          <VJ_Gloss>0x00: slot 0, the internal key</VJ_Gloss>
        </div>
        <div style={{ marginTop: 8 }}>
          <VJ_C color={c.clayHex}>7dfb649b0edda814f7cf0feb889e5657eb2083a528aa60a3a943fe0cea066181</VJ_C>
        </div>
      </VJ_Card>
      <At x={780} y={758} w={560}>
        <Fade show={s >= 4}>
          <VJ_Eq>
            <M size={30}>K = P + r₀·G</M>
            <VJ_Gloss>internal key</VJ_Gloss>
          </VJ_Eq>
          <VJ_C>03a3e12c…3a419e51</VJ_C>
          <div style={{ fontSize: 22, color: c.muted, marginTop: 6 }}>No conditions: K is the proof's secret.</div>
        </Fade>
      </At>
      <At x={120} y={758} w={590}>
        <Fade show={s >= 5}>
          <VJ_Eq>
            <M size={30}>3 + r₀</M>
            <VJ_Gloss>private key of K</VJ_Gloss>
          </VJ_Eq>
          <VJ_C>7dfb649b…ea066184</VJ_C>
          <div style={{ fontSize: 22, color: c.muted, marginTop: 6 }}>Only the payee can compute it.</div>
        </Fade>
      </At>
      <At x={120} y={898} w={1220}>
        <Note style={{ fontSize: 21 }}>
          G: generator point. a·G: G added to itself a times. x(Q): x-coordinate of Q. ‖: byte concatenation. Real
          private keys are 32-byte numbers, public keys 33 bytes.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The payee's private key is 3. Her public key 3·G goes into the request as <VJ_C>k</VJ_C>.
        </StepItem>
        <StepItem n={2} step={s}>
          The payer picks <M>e</M> = 5. Each side combines its private key with the other's public key: 15·G.
        </StepItem>
        <StepItem n={3} step={s}>
          Hashing the x-coordinate of 15·G with slot index 0 gives the blinding scalar <M>r₀</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          The payer adds <M>r₀·G</M> to the payee's key. The result <M>K</M> is the internal key.
        </StepItem>
        <StepItem n={5} step={s}>
          The private key of <M>K</M> is 3 + <M>r₀</M>. The mint sees <M>K</M>, never 3·G or <M>r₀</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VJ_RkAdvanced: Page = () => {
  const proc = useProcess(3, 2800);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_RK} lens="Advanced" title="Receiver-keyed outputs: the MUST rules" proc={proc}>
      <VJ_Card x={120} y={262} w={540} h={500} show={s >= 1} tone={s === 1 ? c.clayHex : c.rule} pad="20px 22px">
        <Label color={c.clayHex}>Payer</Label>
        <div style={{ marginTop: 14 }}>
          <VJ_Rule>
            A fresh <M>(e, E)</M> per output. v3 has no shared-<M>e</M> exception.
          </VJ_Rule>
          <VJ_Rule>
            Blind <VJ_C>k</VJ_C> at slot 0: never <VJ_C>k</VJ_C> verbatim, never a bearer proof.
          </VJ_Rule>
          <VJ_Rule>
            Reproduce every leaf of <VJ_C>l</VJ_C> byte for byte, replacing only keys in <VJ_C>b</VJ_C>, or refuse
            to pay.
          </VJ_Rule>
          <VJ_Rule>
            Send <M>E</M> only if a blinding used it.
          </VJ_Rule>
          <VJ_Rule>
            <M>rᵢ</M> outside [1, <M>n</M> − 1]: retry once with 0xff appended, then discard <M>e</M>.
          </VJ_Rule>
          <VJ_Rule>Refuse trees beyond 256 slots: slot 0 plus 255 leaf keys.</VJ_Rule>
        </div>
      </VJ_Card>
      <VJ_Card x={690} y={262} w={540} h={500} show={s >= 2} tone={s === 2 ? c.clayHex : c.rule} pad="20px 22px">
        <Label color={c.cool}>Payee</Label>
        <div style={{ marginTop: 14 }}>
          <VJ_Rule>
            Reject spend info whose <M>E</M> presence disagrees with the request.
          </VJ_Rule>
          <VJ_Rule>
            The derived <M>K</M> is authoritative: a disclosed <M>K</M> that differs rejects.
          </VJ_Rule>
          <VJ_Rule>
            Accept only the requested tree: one-to-one with <VJ_C>l</VJ_C>, any order, no extra or missing leaf.
          </VJ_Rule>
          <VJ_Rule>Evaluate every leaf against policy before counting the payment.</VJ_Rule>
          <VJ_Rule>
            Never re-gift the derived key as a bearer <VJ_C>k</VJ_C>: sweep, then send.
          </VJ_Rule>
        </div>
      </VJ_Card>
      <VJ_Card
        x={1260}
        y={262}
        w={540}
        h={500}
        show={s >= 3}
        tone={s === 3 ? c.bad : c.rule}
        fill={s === 3 ? c.badSoft : c.card}
        pad="20px 22px"
      >
        <Label color={c.bad}>Failure: one e for two outputs</Label>
        <div style={{ marginTop: 16, fontSize: 22, lineHeight: 1.5 }}>
          <div>
            output 1, slot 0 → <M>K</M>
          </div>
          <div>
            output 2, same <M>e</M>, slot 0 → the same <M>K</M>
          </div>
          <div>
            same <M>K</M>, same tree → same secret → same <M>Y</M>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 22, lineHeight: 1.4 }}>
          The first spend burns <M>Y</M>; the other proof is refused as already spent. The mint cannot see this at
          issuance: outputs are blinded.
        </div>
        <div style={{ marginTop: 16, fontSize: 21, lineHeight: 1.4, color: c.muted }}>
          NUT-11 SIG_ALL required one shared <M>e</M> for all outputs. That exception does not exist for v3.
        </div>
      </VJ_Card>
      <At x={120} y={790} w={1680}>
        <Note style={{ fontSize: 21 }}>
          Sources: NUT-18 nutroot locking · NUT-28 nutroot secrets (v3 keysets) · NUT-10 spend info, key uniqueness.
        </Note>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VJ_RkGraphical: Page = () => {
  const proc = useProcess(6, 1700);
  const s = proc.step;
  const a = proc.anim;
  return (
    <VarShell of={VJ_OF_RK} lens="Graphical" title="From static key to secret" proc={proc}>
      <Canvas>
        <T x={230} y={294} font="sans" size={22} color={c.muted}>
          payer
        </T>
        <VJ_SNode x={230} y={360} r={46} label="e·P" size={28} />
        <T x={230} y={866} font="sans" size={22} color={c.cool}>
          payee
        </T>
        <VJ_SNode x={230} y={780} r={46} label="p·E" size={28} tone="cool" />
        <Arrow x1={266} y1={390} x2={404} y2={540} show={s >= 1} color={c.ink} />
        <Arrow x1={266} y1={750} x2={404} y2={600} show={s >= 1} color={c.cool} />
        <Packet x1={266} y1={390} x2={404} y2={540} run={a && s === 1} color={c.ink} />
        <Packet x1={266} y1={750} x2={404} y2={600} run={a && s === 1} color={c.cool} />
        <VJ_SNode x={440} y={570} r={46} label="Zx" tone="on" show={s >= 1} delay={650} />

        <Arrow x1={478} y1={546} x2={606} y2={452} show={s >= 2} color={c.clayHex} />
        <Arrow x1={478} y1={594} x2={606} y2={688} show={s >= 2} color={c.clayHex} />
        <T x={520} y={488} font="sans" size={22} color={c.muted} anchor="end" show={s >= 2}>
          slot 0
        </T>
        <T x={520} y={664} font="sans" size={22} color={c.muted} anchor="end" show={s >= 2}>
          slot 1
        </T>
        <VJ_SNode x={640} y={430} r={36} label="r₀" show={s >= 2} delay={450} />
        <VJ_SNode x={640} y={710} r={36} label="r₁" show={s >= 2} delay={450} />

        <VJ_SNode x={840} y={300} r={36} label="P" tone="cool" show={s >= 3} />
        <T x={890} y={308} font="sans" size={22} color={c.cool} anchor="start" show={s >= 3}>
          payee key
        </T>
        <Arrow x1={840} y1={336} x2={840} y2={404} show={s >= 3} color={c.cool} />
        <Arrow x1={676} y1={430} x2={814} y2={430} show={s >= 3} color={c.clayHex} delay={150} />
        <VJ_Plus x={840} y={430} show={s >= 3} delay={300} />
        <Arrow x1={866} y1={430} x2={996} y2={430} show={s >= 3} color={c.ink} delay={450} />
        <VJ_SNode x={1040} y={430} r={42} label="K" show={s >= 3} delay={800} />

        <VJ_SNode x={840} y={840} r={36} label="P₄" show={s >= 4} />
        <T x={890} y={848} font="sans" size={22} color={c.muted} anchor="start" show={s >= 4}>
          co-signer key
        </T>
        <Arrow x1={840} y1={804} x2={840} y2={736} show={s >= 4} color={c.muted} />
        <Arrow x1={676} y1={710} x2={814} y2={710} show={s >= 4} color={c.clayHex} delay={150} />
        <VJ_Plus x={840} y={710} show={s >= 4} delay={300} />
        <Arrow x1={866} y1={710} x2={996} y2={710} show={s >= 4} color={c.ink} delay={450} />
        <VJ_SNode x={1040} y={710} r={42} label="P₄′" size={28} show={s >= 4} delay={800} />
        <Arrow x1={1082} y1={710} x2={1146} y2={710} show={s >= 4} color={c.ink} delay={950} />
        <GFade show={s >= 4} delay={1150}>
          <rect x={1150} y={680} width={180} height={60} rx={8} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.75 }} />
          <text x={1240} y={718} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 24, fill: c.ink }}>
            after leaf
          </text>
        </GFade>

        <Arrow x1={1082} y1={430} x2={1414} y2={430} show={s >= 5} color={c.ink} />
        <Arrow x1={1300} y1={678} x2={1426} y2={454} show={s >= 5} color={c.clayHex} />
        <T x={1378} y={590} font="math" size={36} color={c.clayHex} anchor="start" show={s >= 5} delay={300}>
          t
        </T>
        <VJ_Plus x={1440} y={430} show={s >= 5} delay={350} />
        <Arrow x1={1466} y1={430} x2={1574} y2={430} show={s >= 5} color={c.clayHex} delay={500} />
        <GFade show={s >= 5} delay={850}>
          <circle cx={1640} cy={430} r={62} style={{ fill: c.clayHex }} />
          <text x={1640} y={439} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 24, fill: '#ffffff' }}>
            secret
          </text>
        </GFade>
        <T x={1640} y={552} font="math" size={34} show={s >= 6}>
          p + r₀ + t
        </T>
        <T x={1640} y={592} font="sans" size={22} color={c.muted} show={s >= 6} delay={150}>
          payee's spend key
        </T>
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via JSON ──────────────────────────────────────────────────────

const VJ_RkJson: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const same = s === 4;
  return (
    <VarShell of={VJ_OF_RK} lens="Explained via JSON" title="Request in, proof out: the NUT-18 vector" proc={proc}>
      <At x={120} y={262} w={1220}>
        <Label>Payment request, nutroot option</Label>
      </At>
      <VJ_Card x={120} y={296} w={1220} h={214} pad="14px 24px">
        <VJ_JL>{'"nutroot": {'}</VJ_JL>
        <VJ_JL on={s === 1 || s === 2} note="key 3: the payee's static key">
          {'  "k": "02f9308a…bce036f9",'}
        </VJ_JL>
        <VJ_JL on={s === 1}>
          {'  "l": ["'}
          <VJ_HS on={same} tone={c.goodSoft}>
            0002
          </VJ_HS>
          <VJ_HS on={same} tone={c.goodSoft}>
            02000101
          </VJ_HS>
          <VJ_HS on={same} tone={c.goodSoft}>
            040021
          </VJ_HS>
          <VJ_HS on={s === 3}>02e493db…abe8c4cd13</VJ_HS>
          <VJ_HS on={same} tone={c.goodSoft} last>
            06000468a3be80
          </VJ_HS>
          {'"],'}
        </VJ_JL>
        <VJ_JL on={s === 1 || s === 3} note="key 4, tagged blind-me by its owner">
          {'  "b": ["02e493db…abe8c4cd13"]'}
        </VJ_JL>
        <VJ_JL>{'}'}</VJ_JL>
      </VJ_Card>
      <At x={120} y={546} w={1220}>
        <Fade show={s >= 2}>
          <Label>Resulting proof, paid with ephemeral key 5</Label>
        </Fade>
      </At>
      <VJ_Card x={120} y={580} w={1220} h={252} show={s >= 2} pad="14px 24px">
        <VJ_JL on={s === 5} note="K + t·G, computed">
          {'"secret": "0302fc15…572c566e",'}
        </VJ_JL>
        <VJ_JL>{'"spend_info": {'}</VJ_JL>
        <VJ_JL on={s === 5} note="key 5: a blinding used it">
          {'  "E": "022f8bde…b240efe4",'}
        </VJ_JL>
        <VJ_JL
          on={s === 2}
          note={
            <>
              slot 0: key 3 + <M>r₀·G</M>
            </>
          }
        >
          {'  "K": "03a3e12c…3a419e51",'}
        </VJ_JL>
        <VJ_JL>
          {'  "tree": ["'}
          <VJ_HS on={same} tone={c.goodSoft}>
            0002
          </VJ_HS>
          <VJ_HS on={same} tone={c.goodSoft}>
            02000101
          </VJ_HS>
          <VJ_HS on={same} tone={c.goodSoft}>
            040021
          </VJ_HS>
          <VJ_HS on={s === 3}>039ca579…24e6ca81</VJ_HS>
          <VJ_HS on={same} tone={c.goodSoft} last>
            06000468a3be80
          </VJ_HS>
          {'"]'}
        </VJ_JL>
        <VJ_JL>{'}'}</VJ_JL>
      </VJ_Card>
      <At x={120} y={854} w={1220}>
        <Note style={{ fontSize: 21 }}>
          Request: tests/18-tests.md. K and the blinded leaf equal the NUT-28 slot-map vectors; the secret is computed
          from them (the vector files do not list it).
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The request names the payee's key <VJ_C>k</VJ_C>, the leaves <VJ_C>l</VJ_C>, and <VJ_C>b</VJ_C>: the leaf
          keys to blind.
        </StepItem>
        <StepItem n={2} step={s}>
          Slot 0: the payer blinds <VJ_C>k</VJ_C> into the internal key <M>K</M> with a fresh ephemeral.
        </StepItem>
        <StepItem n={3} step={s}>
          Slot 1: key 4 is in <VJ_C>b</VJ_C>, so the leaf carries key 4 + <M>r₁·G</M> in its place.
        </StepItem>
        <StepItem n={4} step={s}>
          All other leaf bytes are copied unchanged: version, type, <M>n</M>, time.
        </StepItem>
        <StepItem n={5} step={s}>
          <M>E</M> is sent because a blinding used it. The secret is <M>K</M> tweaked by the tree's root.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: payee ──────────────────────────────────────────────────────

const VJ_Gate = ({
  i,
  s,
  title,
  children,
  verdict,
  ok = false,
}: {
  i: number;
  s: number;
  title: string;
  children: ReactNode;
  verdict: ReactNode;
  ok?: boolean;
}) => {
  const y = 262 + (i - 1) * 102;
  return (
    <>
      <VJ_Card x={120} y={y} w={760} h={84} show={s >= i} tone={s === i ? c.clayHex : c.rule} pad="10px 20px">
        <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.3 }}>
          {i} · {title}
        </div>
        <div style={{ fontSize: 21, color: c.muted, lineHeight: 1.35, marginTop: 2 }}>{children}</div>
      </VJ_Card>
      <VJ_Card
        x={1000}
        y={y}
        w={800}
        h={84}
        show={s >= i}
        delay={250}
        tone={ok ? c.good : c.bad}
        fill={ok ? c.goodSoft : c.badSoft}
        pad="0 20px"
      >
        <div style={{ fontSize: 21, lineHeight: 1.35, display: 'flex', alignItems: 'center', height: '100%' }}>
          {verdict}
        </div>
      </VJ_Card>
    </>
  );
};

const VJ_GateArrow = ({ i, s, ok = false }: { i: number; s: number; ok?: boolean }) => {
  const y = 262 + (i - 1) * 102 + 42;
  return <Arrow x1={888} y1={y} x2={992} y2={y} show={s >= i} color={ok ? c.good : c.bad} delay={150} />;
};

const VJ_RkPayee: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_RK} lens="Perspective: payee" title="What the payee checks on receive" proc={proc}>
      <VJ_Gate i={1} s={s} title="Read E" verdict="E missing, or present where nothing was blinded: reject (NUT-18).">
        <VJ_C>k</VJ_C> is receiver-keyed, so <M>E</M> must be present.
      </VJ_Gate>
      <VJ_Gate
        i={2}
        s={s}
        title="Derive the internal key"
        verdict={
          <span>
            A disclosed <M>K</M> that differs from the derived <M>K</M>: reject (NUT-10).
          </span>
        }
      >
        <M>Zx = x(p·E)</M>, then <M>r₀</M> and <M>K = P + r₀·G</M>
      </VJ_Gate>
      <VJ_Gate
        i={3}
        s={s}
        title="Compare the tree with l"
        verdict="An extra leaf, a missing leaf, or any other changed byte: reject (NUT-18)."
      >
        One-to-one, any order; keys in <VJ_C>b</VJ_C> replaced by points.
      </VJ_Gate>
      <VJ_Gate
        i={4}
        s={s}
        title="Reconstruct the secret"
        verdict={
          <span>
            A leaf that does not parse, or <M>K + t·G</M> ≠ secret: reject (check 1, NUT-10).
          </span>
        }
      >
        All leaves parse; <M>K + t·G</M> equals the secret.
      </VJ_Gate>
      <VJ_Gate
        i={5}
        s={s}
        title="Evaluate every leaf"
        verdict="A leaf outside policy: not treated as received (check 2, NUT-10)."
      >
        Against policy, eg a minimum refund horizon.
      </VJ_Gate>
      <VJ_Gate
        i={6}
        s={s}
        ok
        title="Sweep"
        verdict={
          <span>
            Until swept, the proof needs <M>E</M>, which the seed cannot restore (NUT-10).
          </span>
        }
      >
        Key-path spend with <M>p + r₀ + t</M> to seed-derived secrets.
      </VJ_Gate>
      <Canvas>
        <VJ_GateArrow i={1} s={s} />
        <VJ_GateArrow i={2} s={s} />
        <VJ_GateArrow i={3} s={s} />
        <VJ_GateArrow i={4} s={s} />
        <VJ_GateArrow i={5} s={s} />
        <VJ_GateArrow i={6} s={s} ok />
      </Canvas>
      <At x={120} y={892} w={1680}>
        <Note style={{ fontSize: 21 }}>
          Whether a point in place of a <VJ_C>b</VJ_C> key is its real blinding is for that key's owner to check (NUT-28
          value matching).
        </Note>
      </At>
    </VarShell>
  );
};

// ─── Focus: the slot map ─────────────────────────────────────────────────────

const VJ_SlotCell = ({
  x,
  n,
  who,
  tag,
  tagColor,
  value,
  on,
}: {
  x: number;
  n: number;
  who: ReactNode;
  tag: string;
  tagColor: string;
  value: string;
  on: boolean;
}) => (
  <VJ_Card x={x} y={306} w={290} h={150} tone={on ? c.clayHex : c.rule} fill={on ? c.claySoft : c.card} pad="12px 16px">
    <Label color={on ? c.clayHex : c.muted}>slot {n}</Label>
    <div style={{ fontSize: 22, marginTop: 6 }}>{who}</div>
    <div style={{ fontSize: 21, color: tagColor, marginTop: 2 }}>{tag}</div>
    <div style={{ marginTop: 4 }}>
      <VJ_C>{value}</VJ_C>
    </div>
  </VJ_Card>
);

const VJ_KeyLine = ({ slot, value, note, on }: { slot: number; value: string; note: string; on: boolean }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 14,
      marginTop: 8,
      padding: '0 8px',
      margin: '8px -8px 0',
      borderRadius: 6,
      background: on ? c.claySoft : 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    <VJ_C color={c.clayHex}>[{slot}]</VJ_C>
    <VJ_C>{value}</VJ_C>
    <span style={{ fontSize: 21, color: c.muted }}>{note}</span>
  </div>
);

const VJ_Match = ({ i, value, ok, note }: { i: string; value: string; ok: boolean; note: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 6 }}>
    <M size={26}>c{i}</M>
    <VJ_C>{value}</VJ_C>
    <VJ_Mark ok={ok} />
    <span style={{ fontSize: 21, color: c.muted }}>{note}</span>
  </div>
);

const VJ_RkSlotMap: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_RK} lens="Focus: the slot map" title="Slot numbering in a two-leaf request" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Note style={{ fontSize: 22, color: c.ink }}>
          <VJ_C>k</VJ_C> = key 3 · <VJ_C>l</VJ_C> = [threshold 2 of (key 4, key 6), after (key 4)] ·{' '}
          <VJ_C>b</VJ_C> = [key 4] · <M>e</M> = 5
        </Note>
      </At>
      <VJ_SlotCell x={120} n={0} who="key 3 · payee" tag="always blinded" tagColor={c.clayHex} value="03a3e12c…3a419e51" on={s === 2} />
      <VJ_SlotCell x={430} n={1} who="key 4" tag="in b: blinded" tagColor={c.clayHex} value="039ca579…24e6ca81" on={s === 3} />
      <VJ_SlotCell x={740} n={2} who="key 6" tag="not in b: verbatim" tagColor={c.muted} value="03fff97b…60297556" on={s === 4} />
      <VJ_SlotCell x={1050} n={3} who="key 4, again" tag="in b: blinded" tagColor={c.clayHex} value="023d8b4c…954c7511" on={s === 3} />
      <VJ_Card x={120} y={480} w={600} h={152} tone={s === 1 ? c.clayHex : c.rule} pad="12px 20px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>
          threshold · <M>n</M> = 2
        </div>
        <VJ_KeyLine slot={1} value="039ca579…24e6ca81" note="key 4, blinded" on={s === 3} />
        <VJ_KeyLine slot={2} value="03fff97b…60297556" note="key 6, verbatim" on={s === 4} />
      </VJ_Card>
      <VJ_Card x={740} y={480} w={600} h={152} tone={s === 1 ? c.clayHex : c.rule} pad="12px 20px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>
          after · <M>n</M> = 1 · time 1755561600
        </div>
        <VJ_KeyLine slot={3} value="023d8b4c…954c7511" note="key 4, blinded" on={s === 3} />
      </VJ_Card>
      <VJ_Card x={120} y={652} w={1220} h={236} show={s >= 5} tone={s === 5 ? c.clayHex : c.rule} pad="12px 22px">
        <Label>Key 4's owner matches by value</Label>
        <div style={{ marginTop: 6 }}>
          <M size={28}>Zx = x(4·E),  cᵢ = P₄ + rᵢ·G,  i = 1 … 3</M>
        </div>
        <VJ_Match i="₁" value="039ca579…24e6ca81" ok note="found in the threshold leaf" />
        <VJ_Match i="₂" value="0288e9e9…67a497b9" ok={false} note="not in the tree" />
        <VJ_Match i="₃" value="023d8b4c…954c7511" ok note="found in the after leaf" />
      </VJ_Card>
      <At x={120} y={904} w={1220}>
        <Note style={{ fontSize: 21 }}>
          At most 256 slots per secret, one index byte: slot 0 plus 255 leaf keys. Both sides refuse a longer tree.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Slot 0 is the internal key. Slots 1… follow the keys fields: leaves in order, keys in order.
        </StepItem>
        <StepItem n={2} step={s}>
          Slot 0 is always blinded: it is the receiver-keyed send.
        </StepItem>
        <StepItem n={3} step={s}>
          Keys in <VJ_C>b</VJ_C> are blinded with their slot index: key 4 at slots 1 and 3 gives two unrelated points.
        </StepItem>
        <StepItem n={4} step={s}>
          Key 6 is not in <VJ_C>b</VJ_C>: used verbatim, it still takes slot 2.
        </StepItem>
        <StepItem n={5} step={s}>
          Key 4's owner derives a candidate per slot and looks for it in the tree.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: NUMS request ───────────────────────────────────────────────────

const VJ_NW = [250, 470, 470, 490];

const VJ_Col = ({ show, children }: { show: boolean; children: ReactNode }) => (
  <div
    style={{
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 450ms ${EASE_OUT}, transform 450ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const VJ_NumsRow = ({
  label,
  a,
  b,
  d,
  s,
  h = 76,
}: {
  label: ReactNode;
  a: ReactNode;
  b: ReactNode;
  d: ReactNode;
  s: number;
  h?: number;
}) => (
  <VJ_TRow h={h}>
    <VJ_TCell w={VJ_NW[0]} color={c.muted}>
      {label}
    </VJ_TCell>
    <VJ_TCell w={VJ_NW[1]}>
      <VJ_Col show={s >= 1}>{a}</VJ_Col>
    </VJ_TCell>
    <VJ_TCell w={VJ_NW[2]}>
      <VJ_Col show={s >= 2}>{b}</VJ_Col>
    </VJ_TCell>
    <VJ_TCell w={VJ_NW[3]}>
      <VJ_Col show={s >= 3}>{d}</VJ_Col>
    </VJ_TCell>
  </VJ_TRow>
);

const VJ_RkNums: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_RK} lens="Framing: a NUMS request" title="k = H: payments spendable through leaves only" proc={proc}>
      <At x={120} y={256} w={1680}>
        <Note style={{ fontSize: 22 }}>
          All three requests carry the same <VJ_C>l</VJ_C> = [after leaf, key 4]. Ephemeral key 5; <M>u</M> is fixed to 7
          and 9 in the vectors (tests/18-tests.md).
        </Note>
      </At>
      <At x={120} y={300} w={1680}>
        <VJ_NumsRow
          s={s}
          h={56}
          label=""
          a={
            <span style={{ fontWeight: 600 }}>
              <VJ_C>k</VJ_C> = key 3
            </span>
          }
          b={
            <span style={{ fontWeight: 600 }}>
              <VJ_C>k</VJ_C> = <M>H</M>, <VJ_C>b</VJ_C> = [key 4]
            </span>
          }
          d={
            <span style={{ fontWeight: 600 }}>
              <VJ_C>k</VJ_C> = <M>H</M>, no <VJ_C>b</VJ_C>
            </span>
          }
        />
        <VJ_NumsRow
          s={s}
          label="internal key"
          a={
            <>
              <M>P₃ + r₀·G</M> (slot 0)
              <br />
              <VJ_C>03a3e12c…3a419e51</VJ_C>
            </>
          }
          b={
            <>
              <M>H + 7·G</M>
              <br />
              <VJ_C>028edfeb…ca7bd407</VJ_C>
            </>
          }
          d={
            <>
              <M>H + 9·G</M>
              <br />
              <VJ_C>03b948fa…be4f7331</VJ_C>
            </>
          }
        />
        <VJ_NumsRow
          s={s}
          label="ephemeral E"
          a="present: blinds slots 0 and 1"
          b="present: blinds slot 1"
          d={<span style={{ color: c.bad }}>absent: nothing blinded, MUST be omitted</span>}
        />
        <VJ_NumsRow
          s={s}
          label="leaf key"
          a={
            <>
              slot 1, blinded
              <br />
              <VJ_C>039ca579…24e6ca81</VJ_C>
            </>
          }
          b={
            <>
              slot 1, blinded
              <br />
              <VJ_C>039ca579…24e6ca81</VJ_C>
            </>
          }
          d={
            <>
              verbatim
              <br />
              <VJ_C>02e493db…abe8c4cd13</VJ_C>
            </>
          }
        />
        <VJ_NumsRow
          s={s}
          label="secret"
          a={
            <>
              <VJ_C>0302fc15…572c566e</VJ_C>
              <br />
              <span style={{ color: c.muted, fontSize: 21 }}>computed, not in the vectors</span>
            </>
          }
          b={<VJ_C>02fb2381…3bcb46d1</VJ_C>}
          d={<VJ_C>030b5dc1…9012a0b2</VJ_C>}
        />
        <VJ_NumsRow
          s={s}
          label="spend info"
          a={<VJ_C>E, K, tree</VJ_C>}
          b={<VJ_C>E, K, u, tree</VJ_C>}
          d={<VJ_C>K, u, tree</VJ_C>}
        />
        <VJ_NumsRow
          s={s}
          label="key path"
          a={
            <>
              payee: <M>p + r₀ + t</M>
            </>
          }
          b={
            <>
              none: <M>K − u·G = H</M>
            </>
          }
          d={
            <>
              none: <M>K − u·G = H</M>
            </>
          }
        />
      </At>
      <At x={120} y={840} w={1680}>
        <Fade show={s >= 4}>
          <Note style={{ fontSize: 22, color: c.ink }}>
            A NUMS internal key is never ECDH-blinded: nobody holds the scalar of <M>H</M>. The fresh <M>u</M> gives each
            output its own secret, and the payee checks <M>K − u·G = H</M>. <M>E</M> travels exactly when a blinding
            used <M>e</M>; the payee MUST reject spend info that disagrees.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Source 2 · What the specification covers
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VJ_LeafCard = ({
  x,
  y,
  show,
  on,
  name,
  meta,
  what,
  example,
  builds,
}: {
  x: number;
  y: number;
  show: boolean;
  on: boolean;
  name: string;
  meta: string;
  what: ReactNode;
  example: ReactNode;
  builds: ReactNode;
}) => (
  <VJ_Card x={x} y={y} w={600} h={206} show={show} tone={on ? c.clayHex : c.rule} pad="16px 22px">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: 26, fontWeight: 600 }}>{name}</span>
      <VJ_C color={c.muted}>{meta}</VJ_C>
    </div>
    <div style={{ fontSize: 23, marginTop: 10, lineHeight: 1.35 }}>{what}</div>
    <div style={{ fontSize: 21, color: c.muted, marginTop: 8 }}>{example}</div>
    <div style={{ fontSize: 22, color: c.clayHex, marginTop: 8 }}>{builds}</div>
  </VJ_Card>
);

const VJ_UseCard = ({ x, show, title, children }: { x: number; show: boolean; title: string; children: ReactNode }) => (
  <VJ_Card x={x} y={752} w={393} h={124} show={show} pad="14px 18px">
    <div style={{ fontSize: 23, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 21, color: c.muted, marginTop: 6, lineHeight: 1.35 }}>{children}</div>
  </VJ_Card>
);

const VJ_CapBeginner: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CAP} lens="Beginner" title="Four leaf types and what they build" proc={proc}>
      <VJ_LeafCard
        x={120}
        y={262}
        show={s >= 1}
        on={s === 1}
        name="threshold"
        meta="0x01 · 42 B"
        what={
          <>
            <M>n</M> of the listed keys sign.
          </>
        }
        example={
          <>
            Example: <M>n</M> = 1, keys = [key 3]
          </>
        }
        builds="Builds: multisig, auditable lock"
      />
      <VJ_LeafCard
        x={740}
        y={262}
        show={s >= 2}
        on={s === 2}
        name="after"
        meta="0x02 · 49 B"
        what={
          <>
            From a time on, <M>n</M> listed keys sign.
          </>
        }
        example="Example: n = 1, key 4, time 1755561600"
        builds="Builds: timelocked refund"
      />
      <VJ_LeafCard
        x={120}
        y={490}
        show={s >= 3}
        on={s === 3}
        name="hashlock"
        meta="0x03 · 77 B"
        what={
          <>
            A SHA-256 preimage, and <M>n</M> keys sign.
          </>
        }
        example="Example: n = 1, key 3, hash a1a1…a1a1"
        builds="Builds: HTLC"
      />
      <VJ_LeafCard
        x={740}
        y={490}
        show={s >= 4}
        on={s === 4}
        name="commit"
        meta="0x04 · 37 B"
        what="Never spendable. Fixes 32 bytes of data."
        example={<>Example: hash = SHA256("external data")</>}
        builds="Builds: binding to data, eg a Nutzap"
      />
      <At x={120} y={720} w={1220}>
        <Fade show={s >= 5}>
          <Label>No tree: the internal key alone</Label>
        </Fade>
      </At>
      <VJ_UseCard x={120} show={s >= 5} title="Bearer token">
        secret = <M>K</M>; its private key <VJ_C>k</VJ_C> travels in spend info.
      </VJ_UseCard>
      <VJ_UseCard x={533} show={s >= 5} title="Pay to a key">
        <M>K</M> blinded from the receiver's static key (NUT-28).
      </VJ_UseCard>
      <VJ_UseCard x={946} show={s >= 5} title="Multisig, one signature">
        <M>K</M> aggregated by MuSig2 or FROST, with the empty tweak.
      </VJ_UseCard>
      <StepList>
        <StepItem n={1} step={s}>
          A leaf is a small record the secret commits to. A threshold leaf lists keys and a number <M>n</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          An after leaf adds a time. Before it, that leaf cannot be used.
        </StepItem>
        <StepItem n={3} step={s}>
          A hashlock leaf adds a hash. The spender reveals the preimage and still signs.
        </StepItem>
        <StepItem n={4} step={s}>
          A commit leaf is never spent. It only ties outside data to the secret.
        </StepItem>
        <StepItem n={5} step={s}>
          Without leaves, the key itself carries the use.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VJ_AW = [270, 1270, 140];

const VJ_MustRow = ({
  use,
  rule,
  nut,
  g,
  s,
}: {
  use: string;
  rule: ReactNode;
  nut: string;
  g: number;
  s: number;
}) => (
  <VJ_TRow h={56} show={s >= g} hot={s === g}>
    <VJ_TCell w={VJ_AW[0]} color={c.muted}>
      {use}
    </VJ_TCell>
    <VJ_TCell w={VJ_AW[1]}>{rule}</VJ_TCell>
    <VJ_TCell w={VJ_AW[2]}>
      <VJ_C color={c.muted}>{nut}</VJ_C>
    </VJ_TCell>
  </VJ_TRow>
);

const VJ_CapAdvanced: Page = () => {
  const proc = useProcess(3, 2600);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CAP} lens="Advanced" title="The MUST behind each use" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VJ_TRow h={46} head>
          <VJ_TCell head w={VJ_AW[0]}>
            Use
          </VJ_TCell>
          <VJ_TCell head w={VJ_AW[1]}>
            Rule that makes it hold
          </VJ_TCell>
          <VJ_TCell head w={VJ_AW[2]}>
            NUT
          </VJ_TCell>
        </VJ_TRow>
        <VJ_MustRow
          g={1}
          s={s}
          use="Bearer token"
          nut="10"
          rule={
            <>
              A proof MUST NOT carry both <VJ_C>k</VJ_C> and <VJ_C>E</VJ_C>; a derived key MUST NOT be re-gifted as a bearer{' '}
              <VJ_C>k</VJ_C>.
            </>
          }
        />
        <VJ_MustRow
          g={1}
          s={s}
          use="Pay to a key"
          nut="28, 18"
          rule="One fresh ephemeral per output; the payee MUST verify the disclosed tree is exactly the requested one."
        />
        <VJ_MustRow
          g={1}
          s={s}
          use="Multisig"
          nut="10"
          rule="An aggregated K MUST carry at least the empty tweak; leaf keys sharing an x-coordinate MUST reject."
        />
        <VJ_MustRow
          g={1}
          s={s}
          use="Timelocked refund"
          nut="10"
          rule="after: the verifier's clock ≥ time. Receivers MUST evaluate every leaf against their policy."
        />
        <VJ_MustRow
          g={2}
          s={s}
          use="HTLC"
          nut="10"
          rule="Preimage ≤ 32 B. Relying on publication MUST check no claimant path, key path included, avoids it."
        />
        <VJ_MustRow
          g={2}
          s={s}
          use="Binding to data"
          nut="10"
          rule="A witness revealing a commit leaf MUST be rejected; receivers treat the leaf as inert."
        />
        <VJ_MustRow
          g={2}
          s={s}
          use="Auditable lock"
          nut="10"
          rule={
            <>
              <M>u</M> MUST be fresh per proof and disclosed; holders check <M>K − u·G = H</M>: no key path exists.
            </>
          }
        />
        <VJ_MustRow
          g={2}
          s={s}
          use="Locked mint quotes"
          nut="04"
          rule="A v3 quote MUST include pubkey; minting an unlocked quote onto a v3 keyset MUST be rejected."
        />
        <VJ_MustRow
          g={3}
          s={s}
          use="Blind auth"
          nut="22"
          rule="A v3 BAT without a valid witness MUST be rejected; intermediaries MUST relay the body byte for byte."
        />
        <VJ_MustRow
          g={3}
          s={s}
          use="Multi-party signing"
          nut="10"
          rule="nutspA slots are a trust-free hint: a wrong slot fails to match and the signer scans instead."
        />
        <VJ_MustRow
          g={3}
          s={s}
          use="Spend evidence"
          nut="07"
          rule="For a disclosure leaf the mint MUST return witness and input digest; otherwise it MUST NOT."
        />
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VJ_TX = [120, 550, 980, 1410];
const VJ_TY = [262, 592];

const VJ_TileFrame = ({ x, y, show, caption }: { x: number; y: number; show: boolean; caption: string }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 390,
      height: 300,
      boxSizing: 'border-box',
      border: `1.5px solid ${c.rule}`,
      borderRadius: 12,
      background: c.card,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'scale(1)' : 'scale(0.97)',
      transition: `opacity 450ms ${EASE_OUT}, transform 450ms ${EASE_OUT}`,
    }}
  >
    <div style={{ position: 'absolute', left: 20, top: 14, fontSize: 24 }}>{caption}</div>
  </div>
);

type VJ_KeyKind = 'plain' | 'blind' | 'agg' | 'nums';

const VJ_GKey = ({ x, y, kind, show, delay = 0 }: { x: number; y: number; kind: VJ_KeyKind; show: boolean; delay?: number }) => (
  <GFade show={show} delay={delay}>
    {kind === 'agg' && (
      <>
        <line x1={x - 40} y1={y + 58} x2={x - 10} y2={y + 20} style={{ stroke: c.node, strokeWidth: 1.5 }} />
        <line x1={x} y1={y + 64} x2={x} y2={y + 24} style={{ stroke: c.node, strokeWidth: 1.5 }} />
        <line x1={x + 40} y1={y + 58} x2={x + 10} y2={y + 20} style={{ stroke: c.node, strokeWidth: 1.5 }} />
        <circle cx={x - 40} cy={y + 60} r={8} style={{ fill: c.card, stroke: c.ink, strokeWidth: 1.5 }} />
        <circle cx={x} cy={y + 66} r={8} style={{ fill: c.card, stroke: c.ink, strokeWidth: 1.5 }} />
        <circle cx={x + 40} cy={y + 60} r={8} style={{ fill: c.card, stroke: c.ink, strokeWidth: 1.5 }} />
      </>
    )}
    <circle
      cx={x}
      cy={y}
      r={24}
      style={{
        fill: kind === 'blind' ? c.coolSoft : c.card,
        stroke: kind === 'blind' ? c.cool : c.ink,
        strokeWidth: 2,
        strokeDasharray: kind === 'nums' ? '5 4' : 'none',
      }}
    />
    <text x={x} y={y + 9} textAnchor="middle" style={{ fontFamily: MATH, fontStyle: 'italic', fontSize: 26, fill: c.ink }}>
      K
    </text>
  </GFade>
);

const VJ_GLeaf = ({
  x,
  y,
  letter,
  disc = false,
  show,
  delay = 0,
}: {
  x: number;
  y: number;
  letter: string;
  disc?: boolean;
  show: boolean;
  delay?: number;
}) => (
  <GFade show={show} delay={delay}>
    <rect x={x - 26} y={y - 20} width={52} height={40} rx={6} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.75 }} />
    <text x={x} y={y + 8} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 22, fill: c.ink }}>
      {letter}
    </text>
    {disc && <circle cx={x} cy={y} r={30} style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 1.75 }} />}
  </GFade>
);

const VJ_GSecret = ({ x, y, show, delay = 0, label }: { x: number; y: number; show: boolean; delay?: number; label?: string }) => (
  <GFade show={show} delay={delay}>
    <circle cx={x} cy={y} r={label ? 28 : 18} style={{ fill: c.clayHex }} />
    {label && (
      <text x={x} y={y + 9} textAnchor="middle" style={{ fontFamily: MATH, fontStyle: 'italic', fontSize: 26, fill: '#ffffff' }}>
        {label}
      </text>
    )}
  </GFade>
);

const VJ_GBadge = ({ x, y, text, show, color = c.muted }: { x: number; y: number; text: string; show: boolean; color?: string }) => (
  <T x={x} y={y} font="mono" size={22} color={color} anchor="start" show={show} delay={500}>
    {text}
  </T>
);

/** Secret with internal key and one leaf, in tile-local layout. */
const VJ_GOneLeaf = ({
  tx,
  ty,
  show,
  kind,
  letter,
  disc = false,
  badge,
}: {
  tx: number;
  ty: number;
  show: boolean;
  kind: VJ_KeyKind;
  letter: string;
  disc?: boolean;
  badge?: string;
}) => (
  <>
    <Draw x1={tx + 185} y1={ty + 114} x2={tx + 128} y2={ty + 186} show={show} color={c.node} width={2} delay={150} dur={500} />
    <Draw x1={tx + 205} y1={ty + 114} x2={tx + 262} y2={ty + 186} show={show} color={c.node} width={2} delay={150} dur={500} />
    <VJ_GSecret x={tx + 195} y={ty + 100} show={show} />
    <VJ_GKey x={tx + 115} y={ty + 210} kind={kind} show={show} delay={300} />
    <VJ_GLeaf x={tx + 275} y={ty + 210} letter={letter} disc={disc} show={show} delay={400} />
    {badge && <VJ_GBadge x={tx + 55} y={ty + 268} text={badge} show={show} color={kind === 'blind' ? c.cool : c.muted} />}
  </>
);

const VJ_CapGraphical: Page = () => {
  const proc = useProcess(8, 1200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CAP} lens="Graphical" title="One secret, eight shapes" proc={proc}>
      <VJ_TileFrame x={VJ_TX[0]} y={VJ_TY[0]} show={s >= 1} caption="bearer" />
      <VJ_TileFrame x={VJ_TX[1]} y={VJ_TY[0]} show={s >= 2} caption="pay to a key" />
      <VJ_TileFrame x={VJ_TX[2]} y={VJ_TY[0]} show={s >= 3} caption="multisig" />
      <VJ_TileFrame x={VJ_TX[3]} y={VJ_TY[0]} show={s >= 4} caption="refund" />
      <VJ_TileFrame x={VJ_TX[0]} y={VJ_TY[1]} show={s >= 5} caption="HTLC" />
      <VJ_TileFrame x={VJ_TX[1]} y={VJ_TY[1]} show={s >= 6} caption="Nutzap" />
      <VJ_TileFrame x={VJ_TX[2]} y={VJ_TY[1]} show={s >= 7} caption="auditable lock" />
      <VJ_TileFrame x={VJ_TX[3]} y={VJ_TY[1]} show={s >= 8} caption="quote lock" />
      <Canvas>
        {/* bearer: the secret is K itself */}
        <VJ_GSecret x={VJ_TX[0] + 195} y={VJ_TY[0] + 165} show={s >= 1} delay={200} label="K" />
        <VJ_GBadge x={VJ_TX[0] + 238} y={VJ_TY[0] + 173} text="k" show={s >= 1} />

        {/* pay to a key: blinded K is the secret */}
        <GFade show={s >= 2} delay={200}>
          <circle cx={VJ_TX[1] + 195} cy={VJ_TY[0] + 165} r={38} style={{ fill: 'none', stroke: c.cool, strokeWidth: 2 }} />
        </GFade>
        <VJ_GSecret x={VJ_TX[1] + 195} y={VJ_TY[0] + 165} show={s >= 2} delay={200} label="K" />
        <VJ_GBadge x={VJ_TX[1] + 246} y={VJ_TY[0] + 173} text="E" show={s >= 2} color={c.cool} />

        {/* multisig: aggregated K, empty tweak */}
        <Draw
          x1={VJ_TX[2] + 195}
          y1={VJ_TY[0] + 118}
          x2={VJ_TX[2] + 195}
          y2={VJ_TY[0] + 162}
          show={s >= 3}
          color={c.node}
          width={2}
          delay={150}
          dur={400}
        />
        <VJ_GSecret x={VJ_TX[2] + 195} y={VJ_TY[0] + 100} show={s >= 3} />
        <VJ_GKey x={VJ_TX[2] + 195} y={VJ_TY[0] + 186} kind="agg" show={s >= 3} delay={300} />

        {/* refund */}
        <VJ_GOneLeaf tx={VJ_TX[3]} ty={VJ_TY[0]} show={s >= 4} kind="blind" letter="A" badge="E" />

        {/* HTLC */}
        <VJ_GOneLeaf tx={VJ_TX[0]} ty={VJ_TY[1]} show={s >= 5} kind="blind" letter="H" disc badge="E" />

        {/* Nutzap: NUMS K, threshold + commit */}
        <Draw x1={VJ_TX[1] + 183} y1={VJ_TY[1] + 108} x2={VJ_TX[1] + 116} y2={VJ_TY[1] + 180} show={s >= 6} color={c.node} width={2} delay={150} dur={500} />
        <Draw x1={VJ_TX[1] + 208} y1={VJ_TY[1] + 104} x2={VJ_TX[1] + 286} y2={VJ_TY[1] + 164} show={s >= 6} color={c.node} width={2} delay={150} dur={500} />
        <Draw x1={VJ_TX[1] + 290} y1={VJ_TY[1] + 170} x2={VJ_TX[1] + 248} y2={VJ_TY[1] + 228} show={s >= 6} color={c.node} width={2} delay={350} dur={400} />
        <Draw x1={VJ_TX[1] + 290} y1={VJ_TY[1] + 170} x2={VJ_TX[1] + 332} y2={VJ_TY[1] + 228} show={s >= 6} color={c.node} width={2} delay={350} dur={400} />
        <VJ_GSecret x={VJ_TX[1] + 195} y={VJ_TY[1] + 95} show={s >= 6} />
        <VJ_GKey x={VJ_TX[1] + 100} y={VJ_TY[1] + 200} kind="nums" show={s >= 6} delay={300} />
        <GFade show={s >= 6} delay={300}>
          <circle cx={VJ_TX[1] + 290} cy={VJ_TY[1] + 170} r={6} style={{ fill: c.node }} />
        </GFade>
        <VJ_GLeaf x={VJ_TX[1] + 240} y={VJ_TY[1] + 250} letter="T" disc show={s >= 6} delay={450} />
        <VJ_GLeaf x={VJ_TX[1] + 340} y={VJ_TY[1] + 250} letter="C" show={s >= 6} delay={500} />
        <VJ_GBadge x={VJ_TX[1] + 70} y={VJ_TY[1] + 262} text="u" show={s >= 6} />

        {/* auditable lock */}
        <VJ_GOneLeaf tx={VJ_TX[2]} ty={VJ_TY[1]} show={s >= 7} kind="nums" letter="T" disc badge="u" />

        {/* quote lock */}
        <VJ_GOneLeaf tx={VJ_TX[3]} ty={VJ_TY[1]} show={s >= 8} kind="plain" letter="A" />
      </Canvas>
      <At x={120} y={916} w={1680}>
        <Note style={{ fontSize: 22 }}>
          T threshold · A after · H hashlock · C commit · ring: disclosure · dashed: NUMS · blue: blinded
        </Note>
      </At>
    </VarShell>
  );
};

// ─── Explained via the transaction model ─────────────────────────────────────

const VJ_CapTxModel: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  const hot = (n: number) => (s === n ? c.clayHex : c.rule);
  return (
    <VarShell of={VJ_OF_CAP} lens="Explained via the transaction model" title="Where each use sits in a v3 transaction" proc={proc}>
      <VJ_Card x={470} y={290} w={880} h={440} show={s >= 1} tone={s === 1 ? c.clayHex : c.line} fill={c.panel} pad="14px 24px">
        <Label color={c.ink}>v3 transaction (NUT-10)</Label>
      </VJ_Card>
      <At x={500} y={334} w={520}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 22, color: c.muted }}>Inputs: each signs its input digest</div>
        </Fade>
      </At>
      <At x={1060} y={334} w={270}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 22, color: c.muted }}>Outputs never sign</div>
        </Fade>
      </At>
      <VJ_Card x={500} y={372} w={530} h={196} show={s >= 2} tone={hot(2)} pad="12px 20px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>
          proof · <VJ_C>0x01</VJ_C>
        </div>
        <div style={{ display: 'flex', gap: 30, fontSize: 21, lineHeight: 1.35, marginTop: 6 }}>
          <div>
            <div>bearer token</div>
            <div>pay to a key</div>
            <div>multisig</div>
            <div>timelocked refund</div>
          </div>
          <div>
            <div>HTLC</div>
            <div>binding to data</div>
            <div>auditable lock</div>
            <div style={{ color: c.muted }}>all are secret shapes</div>
          </div>
        </div>
      </VJ_Card>
      <VJ_Card x={500} y={586} w={530} h={124} show={s >= 3} tone={hot(3)} pad="12px 20px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>
          mint quote · <VJ_C>0x02</VJ_C>
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.35, marginTop: 4 }}>
          Locked mint quotes: the lock key signs. Batched: each quote signs its own digest (NUT-04, 20, 29).
        </div>
      </VJ_Card>
      <VJ_Card x={1060} y={372} w={270} h={96} show={s >= 1} delay={200} pad="12px 18px">
        <div style={{ fontSize: 22 }}>blinded message</div>
        <VJ_C color={c.muted}>0x03</VJ_C>
      </VJ_Card>
      <VJ_Card x={1060} y={486} w={270} h={96} show={s >= 1} delay={300} pad="12px 18px">
        <div style={{ fontSize: 22 }}>melt quote</div>
        <VJ_C color={c.muted}>0x04</VJ_C>
      </VJ_Card>
      <At x={1060} y={600} w={270}>
        <Fade show={s >= 1} delay={400}>
          <div style={{ fontSize: 21, color: c.muted, lineHeight: 1.35 }}>bound by every input digest</div>
        </Fade>
      </At>
      <VJ_Card x={120} y={372} w={310} h={250} show={s >= 4} tone={hot(4)} pad="14px 18px">
        <Label color={s === 4 ? c.clayHex : c.muted}>Before</Label>
        <div style={{ fontSize: 22, fontWeight: 600, marginTop: 6 }}>
          <VJ_C size={22}>nutspA</VJ_C> signing package
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.35, marginTop: 6, color: c.muted }}>
          Inputs, outputs and the spends awaiting signatures. Each leaf-key holder adds BIP-340 signatures.
        </div>
      </VJ_Card>
      <VJ_Card x={1390} y={372} w={410} h={176} show={s >= 5} tone={hot(5)} pad="14px 18px">
        <Label color={s === 5 ? c.clayHex : c.muted}>After · checkstate</Label>
        <div style={{ fontSize: 21, lineHeight: 1.35, marginTop: 6 }}>
          Commitment over <M>Y</M>, input digest and witness hash (NUT-07). Witness published only for disclosure
          leaves.
        </div>
      </VJ_Card>
      <VJ_Card x={1390} y={566} w={410} h={144} show={s >= 5} delay={250} tone={hot(5)} pad="14px 18px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>
          <VJ_C size={22}>nutrcA</VJ_C> spend receipt
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.35, marginTop: 6, color: c.muted }}>
          The payer opens the commitment: token, transcript, witness.
        </div>
      </VJ_Card>
      <VJ_Card x={470} y={770} w={880} h={124} show={s >= 6} tone={hot(6)} pad="14px 24px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>
          request transcript · <VJ_C>0x05</VJ_C>, never in a transaction
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.35, marginTop: 6 }}>
          Blind auth (NUT-22): a BAT's point secret signs method, request-target and body hash.
        </div>
      </VJ_Card>
      <Canvas>
        <Arrow x1={434} y1={497} x2={494} y2={497} show={s >= 4} color={c.muted} delay={200} />
        <Arrow x1={1336} y1={460} x2={1386} y2={460} show={s >= 5} color={c.muted} delay={200} />
      </Canvas>
    </VarShell>
  );
};

// ─── Perspective: mint ───────────────────────────────────────────────────────

const VJ_MW = [290, 190, 860, 340];

const VJ_SeenRow = ({
  use,
  path,
  chips,
  state,
  show,
  stateShow,
  hot = false,
}: {
  use: string;
  path: string;
  chips: ReactNode;
  state: ReactNode;
  show: boolean;
  stateShow: boolean;
  hot?: boolean;
}) => (
  <VJ_TRow h={72} show={show} hot={hot}>
    <VJ_TCell w={VJ_MW[0]}>{use}</VJ_TCell>
    <VJ_TCell w={VJ_MW[1]} color={c.muted}>
      {path}
    </VJ_TCell>
    <VJ_TCell w={VJ_MW[2]}>{chips}</VJ_TCell>
    <VJ_TCell w={VJ_MW[3]} size={21}>
      <VJ_Col show={stateShow}>{state}</VJ_Col>
    </VJ_TCell>
  </VJ_TRow>
);

const VJ_CapMint: Page = () => {
  const proc = useProcess(3, 2600);
  const s = proc.step;
  const keyChips = (
    <>
      <VJ_Chip>secret 33 B</VJ_Chip>
      <VJ_Chip>signature 64 B</VJ_Chip>
    </>
  );
  return (
    <VarShell of={VJ_OF_CAP} lens="Perspective: mint" title="What the mint sees when each use is spent" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VJ_TRow h={48} head>
          <VJ_TCell head w={VJ_MW[0]}>
            Use
          </VJ_TCell>
          <VJ_TCell head w={VJ_MW[1]}>
            Path
          </VJ_TCell>
          <VJ_TCell head w={VJ_MW[2]}>
            The mint receives
          </VJ_TCell>
          <VJ_TCell head w={VJ_MW[3]}>
            Checkstate (NUT-07)
          </VJ_TCell>
        </VJ_TRow>
        <VJ_SeenRow use="Bearer token" path="key" chips={keyChips} state="commitment" show={s >= 1} stateShow={s >= 3} hot={s === 1} />
        <VJ_SeenRow use="Pay to a key" path="key" chips={keyChips} state="commitment" show={s >= 1} stateShow={s >= 3} hot={s === 1} />
        <VJ_SeenRow use="Multisig, aggregated" path="key" chips={keyChips} state="commitment" show={s >= 1} stateShow={s >= 3} hot={s === 1} />
        <VJ_SeenRow
          use="Multisig, leaf"
          path="script"
          show={s >= 2}
          stateShow={s >= 3}
          hot={s === 2}
          state="commitment"
          chips={
            <>
              <VJ_Chip>secret</VJ_Chip>
              <VJ_Chip tone={c.clayHex} fill={c.claySoft}>
                leaf 75 B
              </VJ_Chip>
              <VJ_Chip>K</VJ_Chip>
              <VJ_Chip>path</VJ_Chip>
              <VJ_Chip>2 signatures</VJ_Chip>
            </>
          }
        />
        <VJ_SeenRow
          use="Refund after time"
          path="script"
          show={s >= 2}
          stateShow={s >= 3}
          hot={s === 2}
          state="commitment"
          chips={
            <>
              <VJ_Chip>secret</VJ_Chip>
              <VJ_Chip tone={c.clayHex} fill={c.claySoft}>
                leaf 49 B
              </VJ_Chip>
              <VJ_Chip>K</VJ_Chip>
              <VJ_Chip>path</VJ_Chip>
              <VJ_Chip>signature</VJ_Chip>
            </>
          }
        />
        <VJ_SeenRow
          use="HTLC claim"
          path="script"
          show={s >= 2}
          stateShow={s >= 3}
          hot={s === 2}
          state="commitment; witness only with disclosure"
          chips={
            <>
              <VJ_Chip>secret</VJ_Chip>
              <VJ_Chip tone={c.clayHex} fill={c.claySoft}>
                leaf 77 B
              </VJ_Chip>
              <VJ_Chip>K</VJ_Chip>
              <VJ_Chip>path</VJ_Chip>
              <VJ_Chip>signature</VJ_Chip>
              <VJ_Chip tone={c.clayHex} fill={c.claySoft}>
                preimage ≤ 32 B
              </VJ_Chip>
            </>
          }
        />
        <VJ_SeenRow
          use="Auditable lock"
          path="script"
          show={s >= 2}
          stateShow={s >= 3}
          hot={s === 2}
          state={<span style={{ color: c.clayHex }}>commitment, witness, input digest</span>}
          chips={
            <>
              <VJ_Chip>secret</VJ_Chip>
              <VJ_Chip tone={c.clayHex} fill={c.claySoft}>
                leaf 46 B
              </VJ_Chip>
              <VJ_Chip>K</VJ_Chip>
              <VJ_Chip>path</VJ_Chip>
              <VJ_Chip>signature</VJ_Chip>
            </>
          }
        />
      </At>
      <At x={120} y={830} w={1680}>
        <Fade show={s >= 1}>
          <Note style={{ fontSize: 22 }}>
            The first three rows are byte-identical on the wire. Leaf sizes from tests/10-tests.md. Quote locks sign by key
            path or script path (NUT-04); blind auth tokens by key path (NUT-22).
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Focus: Nutzap with a commit leaf ────────────────────────────────────────

const VJ_CapNutzap: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CAP} lens="Focus: Nutzap with a commit leaf" title="An auditable lock bound to outside data" proc={proc}>
      <VJ_Box x={300} y={320} w={340} h={92} title={<M size={26}>K = H + u·G</M>} sub="028edfeb…ca7bd407" show={s >= 1} tone={s === 1 ? 'on' : 'idle'} dashed />
      <VJ_Box x={720} y={320} w={300} h={92} title={<>tweak <M>t</M></>} sub="2f2b4d5a…38253403" show={s >= 4} />
      <VJ_Box x={1130} y={320} w={340} h={92} title="secret" sub="0217b907…6b9b3c28" show={s >= 4} tone="on" delay={300} />
      <VJ_Box x={720} y={482} w={300} h={92} title="merkle root" sub="14147412…12b01fad" show={s >= 4} />
      <VJ_Card x={300} y={596} w={400} h={134} show={s >= 2} tone={s === 2 ? c.clayHex : c.rule} pad="12px 18px">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 22, fontWeight: 600 }}>threshold</span>
          <VJ_C color={c.muted}>46 B</VJ_C>
        </div>
        <div style={{ fontSize: 21, marginTop: 2 }}>
          <M>n</M> = 1 · key 3 · disclosure 0x01
        </div>
        <div style={{ marginTop: 4 }}>
          <VJ_C color={c.muted}>b957f8b5…00793cd6</VJ_C>
        </div>
      </VJ_Card>
      <VJ_Card x={740} y={596} w={400} h={134} show={s >= 3} tone={s === 3 ? c.clayHex : c.rule} pad="12px 18px">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 22, fontWeight: 600 }}>commit</span>
          <VJ_C color={c.muted}>37 B</VJ_C>
        </div>
        <div style={{ fontSize: 21, marginTop: 2 }}>hash = SHA256("external data")</div>
        <div style={{ marginTop: 4 }}>
          <VJ_C color={c.muted}>20cccc22…f9914f27</VJ_C>
        </div>
      </VJ_Card>
      <Canvas>
        <Draw x1={500} y1={596} x2={690} y2={530} show={s >= 4} color={c.node} width={1.75} />
        <Draw x1={940} y1={596} x2={750} y2={530} show={s >= 4} color={c.node} width={1.75} />
        <Arrow x1={720} y1={436} x2={720} y2={368} show={s >= 4} color={c.clayHex} delay={250} />
        <Arrow x1={472} y1={320} x2={566} y2={320} show={s >= 4} color={c.muted} delay={250} />
        <Arrow x1={872} y1={320} x2={956} y2={320} show={s >= 4} color={c.clayHex} delay={450} />
      </Canvas>
      <VJ_Card x={120} y={756} w={1220} h={196} show={s >= 6} tone={s === 6 ? c.clayHex : c.rule} pad="12px 22px">
        <Label>Spend by key 3, script path</Label>
        <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.5, marginTop: 6, whiteSpace: 'pre' }}>
          {'{"leaf": "0001…0a000101", "control": {"K": "028edfeb…",\n "path": ["20cccc22…"]}, "signatures": ["<64 B>"]}'}
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.35, marginTop: 6 }}>
          The mint publishes this witness and its input digest (NUT-07, NUT-17). A witness revealing the commit leaf MUST
          be rejected.
        </div>
      </VJ_Card>
      <StepList>
        <StepItem n={1} step={s}>
          The sender picks a fresh <M>u</M>. <M>K = H + u·G</M> has no key path.
        </StepItem>
        <StepItem n={2} step={s}>
          One threshold leaf: <M>n</M> = 1, key 3, disclosure, key not blinded.
        </StepItem>
        <StepItem n={3} step={s}>
          A commit leaf fixes 32 bytes. In a Nutzap: a digest of the Nostr event it pays for.
        </StepItem>
        <StepItem n={4} step={s}>
          Sorted pair, root, tweak: the secret commits both leaves.
        </StepItem>
        <StepItem n={5} step={s}>
          Anyone with the spend info checks <M>K − u·G = H</M> and the secret: only key 3 can spend.
        </StepItem>
        <StepItem n={6} step={s}>
          The spend reveals the threshold leaf; the commit leaf stays one sibling hash.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Focus: locked mint quotes ───────────────────────────────────────────────

const VJ_CapQuote: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const a = proc.anim;
  const W = 240;
  const MI = 1220;
  return (
    <VarShell of={VJ_OF_CAP} lens="Focus: locked mint quotes" title="A paid mint quote is a signed input" proc={proc}>
      <Canvas>
        <Lifeline x={W} label="Wallet" color={c.cool} top={290} bottom={950} />
        <Lifeline x={MI} label="Mint" color={c.muted} top={290} bottom={950} />
        <Arrow x1={W} y1={336} x2={MI - 6} y2={336} show={s >= 1} color={c.cool} font="mono" label="POST /v1/mint/quote/bolt11 · pubkey: L" />
        <Packet x1={W} y1={336} x2={MI} y2={336} run={a && s === 1} />
        <Arrow x1={MI} y1={396} x2={W + 6} y2={396} show={s >= 1} color={c.muted} font="mono" label="quote id, payment request" delay={500} />
        <Band x1={W + 40} x2={MI - 40} y={456} label="request paid · amount_paid = 8" show={s >= 2} tone="cool" />
        <Arrow x1={W} y1={800} x2={MI - 6} y2={800} show={s >= 4} color={c.clayHex} font="mono" label="POST /v1/mint/bolt11 · quote, outputs, signature" />
        <Packet x1={W} y1={800} x2={MI} y2={800} run={a && s === 4} color={c.clayHex} />
        <Arrow x1={MI} y1={852} x2={W + 6} y2={852} show={s >= 4} color={c.muted} font="mono" label="blind signatures" delay={600} />
      </Canvas>
      <VJ_Card x={290} y={494} w={890} h={262} show={s >= 3} tone={s === 3 ? c.clayHex : c.rule} pad="12px 20px">
        <Label>Transcript: quote input, then output</Label>
        <div style={{ display: 'flex', marginTop: 8 }}>
          <VJ_Seg bytes="02" label="quote" tone="type" />
          <VJ_Seg bytes="0016" label="length" />
          <VJ_Seg bytes="01 0001 08" label="amount 8" />
          <VJ_Seg bytes="02 000f 71756f…3031" label="quote-mint-0001" />
        </div>
        <div style={{ display: 'flex', marginTop: 8 }}>
          <VJ_Seg bytes="03" label="output" tone="type" />
          <VJ_Seg bytes="005b" label="length" />
          <VJ_Seg bytes="01 0001 08" label="amount 8" />
          <VJ_Seg bytes="02 0021 02b7…99f6" label="keyset id" />
          <VJ_Seg bytes="03 0030 b42a…cd55" label="B_" />
        </div>
        <Fade show={s >= 4} style={{ marginTop: 10 }}>
          <span style={{ fontSize: 21, color: c.muted }}>input digest signed by </span>
          <M size={24}>L</M>
          <span style={{ fontSize: 21, color: c.muted }}>: </span>
          <VJ_C color={c.clayHex}>ca6970e6…60565f39</VJ_C>
          <span style={{ fontSize: 21, color: c.muted }}> · mint vector, tests/10-tests.md</span>
        </Fade>
      </VJ_Card>
      <VJ_Card x={290} y={878} w={890} h={78} show={s >= 5} tone={s === 5 ? c.clayHex : c.rule} fill={c.panel} pad="8px 18px">
        <div style={{ fontSize: 21, lineHeight: 1.35 }}>
          <M>L</M> may be a nutroot point: an after leaf lets a never-redeemed quote be reclaimed via script path after the
          locktime.
        </div>
      </VJ_Card>
      <StepList>
        <StepItem n={1} step={s}>
          The quote request carries a lock key <M>L</M>. On a v3 keyset the lock is mandatory.
        </StepItem>
        <StepItem n={2} step={s}>
          The request is paid; the quote has 8 to issue.
        </StepItem>
        <StepItem n={3} step={s}>
          The paid quote is an input: container 0x02 commits the quote id and the amount this request issues.
        </StepItem>
        <StepItem n={4} step={s}>
          <M>L</M> signs the quote input's digest, carried in the <VJ_C>signature</VJ_C> field.
        </StepItem>
        <StepItem n={5} step={s}>
          <M>L</M> can commit leaves like any v3 key.
        </StepItem>
        <Note style={{ marginTop: 14, fontSize: 21 }}>
          Batched mint (NUT-29): each quote signs its own input digest over one shared transcript.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: multisig two ways ──────────────────────────────────────────────

const VJ_CapMultisig: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CAP} lens="Framing: comparison" title="Multisig: threshold leaf or aggregated key" proc={proc}>
      <VJ_Card x={120} y={262} w={590} h={580} show={s >= 1} tone={s === 1 || s === 2 ? c.clayHex : c.rule} pad="18px 22px">
        <Label color={c.clayHex}>Threshold leaf · script path</Label>
        <div style={{ fontSize: 23, marginTop: 12 }}>
          threshold, <M>n</M> = 2, keys [key 3, key 4]
        </div>
        <div style={{ marginTop: 6 }}>
          <VJ_C color={c.muted}>0001 020001 02 040042 02f9…36f9 02e4…cd13</VJ_C>
        </div>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 6, lineHeight: 1.35 }}>
          75 bytes. Any internal key; a NUMS <M>K</M> leaves no key path.
        </div>
        <Fade show={s >= 2} style={{ marginTop: 20 }}>
          <Label>Spend</Label>
          <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.5, marginTop: 6, whiteSpace: 'pre' }}>
            {'{ "leaf": "<75 B>",\n  "control": {"K": "<33 B>", "path": []},\n  "signatures": ["<64 B>", "<64 B>"] }'}
          </div>
          <div style={{ fontSize: 22, marginTop: 10, lineHeight: 1.4 }}>
            533 characters for a one-leaf tree. The mint reads both keys and <M>n</M>.
          </div>
          <div style={{ fontSize: 21, marginTop: 8, lineHeight: 1.35, color: c.muted }}>
            Each key signs the input digest on its own; a <VJ_C>nutspA</VJ_C> package carries the spend between signers.
          </div>
        </Fade>
      </VJ_Card>
      <VJ_Card x={750} y={262} w={590} h={580} show={s >= 3} tone={s === 3 || s === 4 ? c.clayHex : c.rule} pad="18px 22px">
        <Label color={c.clayHex}>Aggregated key · key path</Label>
        <div style={{ fontSize: 23, marginTop: 12, lineHeight: 1.35 }}>
          <M>K</M>: a MuSig2 or FROST aggregate; nobody holds its scalar.
        </div>
        <div style={{ fontSize: 23, marginTop: 8, lineHeight: 1.35 }}>
          Required: at least the empty tweak <VJ_C>t = tagged_hash(Tweak, K)</VJ_C>.
        </div>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 8, lineHeight: 1.35 }}>
          Vector, <M>K</M> = key 3: <VJ_C>t = 764c0e0d…d5b69908</VJ_C>, secret <VJ_C>03b2bb25…d9233aee</VJ_C>
        </div>
        <Fade show={s >= 4} style={{ marginTop: 20 }}>
          <Label>Spend</Label>
          <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.5, marginTop: 6 }}>{'{ "signatures": ["<64 B>"] }'}</div>
          <div style={{ fontSize: 22, marginTop: 10, lineHeight: 1.4 }}>
            147 characters. The mint sees a key and one signature, as for a bare key.
          </div>
          <div style={{ fontSize: 21, marginTop: 8, lineHeight: 1.35, color: c.muted }}>
            The cosigners produce that signature in an interactive MuSig2 or FROST session. The empty tweak shows them that
            no script path is hidden.
          </div>
        </Fade>
      </VJ_Card>
      <VJ_Card x={120} y={866} w={1220} h={90} show={s >= 5} tone={s === 5 ? c.clayHex : c.rule} fill={c.panel} pad="10px 22px">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          Leaf: 533 characters, policy shown to the mint, independent signatures. Aggregate: 147 characters, nothing
          shown, one joint signature.
        </div>
      </VJ_Card>
      <StepList>
        <StepItem n={1} step={s}>
          A threshold leaf lists the keys and <M>n</M>. It sits in the tree like any condition.
        </StepItem>
        <StepItem n={2} step={s}>
          Its spend reveals the leaf: both keys and <M>n</M>. Each signer signs alone.
        </StepItem>
        <StepItem n={3} step={s}>
          An aggregated <M>K</M> has no single holder, so it carries at least the empty tweak.
        </StepItem>
        <StepItem n={4} step={s}>
          Its spend is one key-path signature. The mint cannot tell it apart.
        </StepItem>
        <StepItem n={5} step={s}>
          The trade: witness size and visibility against an interactive signing session.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Source 3 · Nutroot compared with BIP341
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VJ_SX = [300, 602, 904, 1206, 1508];

const VJ_Stage = ({ i, s, head, bip, nut, ex }: { i: number; s: number; head: string; bip: ReactNode; nut: ReactNode; ex: ReactNode }) => {
  const x = VJ_SX[i - 1];
  const on = s === i;
  return (
    <>
      <At x={x} y={262} w={290}>
        <Fade show={s >= i}>
          <div style={{ fontSize: 24, fontWeight: 600, color: on ? c.clayHex : c.ink }}>
            <span style={{ fontFamily: MONO, fontSize: 21, color: c.clayHex, marginRight: 10 }}>{i}</span>
            {head}
          </div>
        </Fade>
      </At>
      <VJ_Card x={x} y={312} w={290} h={170} show={s >= i} tone={on ? c.clayHex : c.rule} pad="12px 14px">
        <div style={{ fontSize: 21, lineHeight: 1.35 }}>{bip}</div>
      </VJ_Card>
      <VJ_Card x={x} y={496} w={290} h={170} show={s >= i} delay={150} tone={on ? c.clayHex : c.rule} fill={c.claySoft} pad="12px 14px">
        <div style={{ fontSize: 21, lineHeight: 1.35 }}>{nut}</div>
      </VJ_Card>
      <VJ_Card x={x} y={690} w={290} h={96} show={s >= 6} delay={(i - 1) * 60} fill={c.panel} pad="10px 14px">
        <div style={{ fontSize: 21, lineHeight: 1.35 }}>{ex}</div>
      </VJ_Card>
    </>
  );
};

const VJ_BipBeginner: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_BIP} lens="Beginner" title="Same pipeline, different constants" proc={proc}>
      <At x={120} y={380} w={170}>
        <div style={{ fontSize: 24, color: c.muted }}>BIP341</div>
      </At>
      <At x={120} y={564} w={170}>
        <div style={{ fontSize: 24, color: c.clayHex }}>Nutroot</div>
      </At>
      <At x={120} y={722} w={170}>
        <Fade show={s >= 6}>
          <div style={{ fontSize: 22, color: c.muted, lineHeight: 1.3 }}>
            Example
            <br />
            (vector)
          </div>
        </Fade>
      </At>
      <VJ_Stage
        i={1}
        s={s}
        head="leaf"
        bip="A tapscript: opcodes that run on a stack."
        nut="A record: type, then fields n, keys, time or hash."
        ex="after leaf, key 4, 49 bytes"
      />
      <VJ_Stage
        i={2}
        s={s}
        head="leaf hash"
        bip="Tag TapLeaf over version 0xc0, the length, the script."
        nut="Tag Cashu_NutrootLeaf over the leaf bytes."
        ex={<VJ_C>9ed9c0b8…0616589a</VJ_C>}
      />
      <VJ_Stage
        i={3}
        s={s}
        head="root"
        bip="The builder picks the shape, depth up to 128."
        nut="Sort hashes, pair, promote an odd one. At most 8 leaves."
        ex="one leaf: root = leaf hash"
      />
      <VJ_Stage
        i={4}
        s={s}
        head="tweak t"
        bip="Tag TapTweak over x(P), 32 bytes, and the root. t ≥ n fails."
        nut="Tag Cashu_NutrootTweak over K, 33 bytes, and the root. Taken mod n."
        ex={<VJ_C>b3b7846b…5effe8a4</VJ_C>}
      />
      <VJ_Stage
        i={5}
        s={s}
        head="key"
        bip="Q = P + t·G. The output shows x(Q), 32 bytes."
        nut="secret = K + t·G, all 33 bytes."
        ex={<VJ_C>02d310a4…9ef8f828</VJ_C>}
      />
      <At x={120} y={818} w={1680}>
        <Fade show={s >= 6}>
          <Note style={{ fontSize: 22 }}>
            tagged_hash(tag, m) = SHA256(SHA256(tag) ‖ SHA256(tag) ‖ m). ‖: concatenation. t: the tweak, a number.
            n: the curve order. G: the generator. P, K: internal keys. Example: tests/10-tests.md, receiver-keyed proof
            with a refund leaf.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Advanced: porting pitfalls ──────────────────────────────────────────────

const VJ_PitRow = ({
  y,
  ok,
  habit,
  code,
  result,
  show,
  hot,
}: {
  y: number;
  ok: boolean;
  habit: string;
  code: string;
  result: ReactNode;
  show: boolean;
  hot: boolean;
}) => (
  <div
    style={{
      position: 'absolute',
      left: 120,
      top: y,
      width: 1680,
      height: 70,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      padding: '0 18px',
      borderRadius: 10,
      border: `1.5px solid ${hot ? (ok ? c.good : c.bad) : c.rule}`,
      background: hot ? (ok ? c.goodSoft : c.badSoft) : c.card,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 450ms ${EASE_OUT}, transform 450ms ${EASE_OUT}, background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
    }}
  >
    <VJ_Mark ok={ok} />
    <div style={{ width: 1020 }}>
      <div style={{ fontSize: 22, color: c.muted, lineHeight: 1.3 }}>{habit}</div>
      <VJ_C>{code}</VJ_C>
    </div>
    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
      <div style={{ fontSize: 21, color: c.muted }}>secret</div>
      <VJ_C color={ok ? c.good : c.bad} size={22}>
        {result}
      </VJ_C>
    </div>
  </div>
);

const VJ_BipAdvanced: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_BIP} lens="Advanced: porting pitfalls" title="Four ways BIP341 code gets the wrong secret" proc={proc}>
      <At x={120} y={256} w={1680}>
        <Note style={{ fontSize: 22 }}>
          Worked example (tests/10-tests.md): <M>K</M> = <VJ_C>03a3e12c…3a419e51</VJ_C> (odd y), one after leaf, root{' '}
          <VJ_C>9ed9c0b8…0616589a</VJ_C>. Wrong results computed.
        </Note>
      </At>
      <VJ_PitRow y={306} ok show={s >= 1} hot={s === 1} habit="Specification" code={'tagged_hash("Cashu_NutrootTweak", K ‖ root), K 33 bytes, t mod n'} result="02d310a4…9ef8f828" />
      <VJ_PitRow y={386} ok={false} show={s >= 2} hot={s === 2} habit="x-only key in the tweak preimage" code={'tagged_hash("Cashu_NutrootTweak", x(K) ‖ root)'} result="029faf21…57b6424e" />
      <VJ_PitRow y={466} ok={false} show={s >= 3} hot={s === 3} habit="BIP341 tag names" code={'tagged_hash("TapTweak", K ‖ root)'} result="0371dcff…c8a4bba5" />
      <VJ_PitRow y={546} ok={false} show={s >= 4} hot={s === 4} habit="Even-y internal key: lift_x(x(K)) = 02a3e12c…" code={'lift_x(x(K)) + t·G'} result="03fda2b2…71bcfdb1" />
      <VJ_PitRow y={626} ok={false} show={s >= 5} hot={s === 5} habit="TapLeaf-style leaf hash" code={'hash_TapLeaf(0xc0 ‖ 0x31 ‖ leaf) as the root'} result="031ced43…4e69bb19" />
      <At x={120} y={728} w={1680}>
        <Fade show={s >= 6}>
          <Label>Rules no vector exercises</Label>
          <div style={{ marginTop: 10 }}>
            <VJ_Rule>
              A tweak ≥ <M>n</M> reduces mod <M>n</M>, never rejects. A hash lands there with probability ≈ 3.7·10⁻³⁹.
            </VJ_Rule>
            <VJ_Rule>
              The tweaked private key is <M>(k + t) mod n</M>. No negation first, even when <M>K</M> has odd y.
            </VJ_Rule>
            <VJ_Rule>
              The control block has no leaf version and no parity bit: the leaf starts with its version byte, <M>K</M>{' '}
              carries its parity.
            </VJ_Rule>
            <VJ_Rule>
              Secrets compare as 33 bytes: 02‖x and 03‖x are two secrets, and one scalar key-path spends both.
            </VJ_Rule>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VJ_GRect = ({ x, y, w = 120, label, show, delay = 0, tlv = false }: { x: number; y: number; w?: number; label: string; show: boolean; delay?: number; tlv?: boolean }) => (
  <GFade show={show} delay={delay}>
    <rect x={x - w / 2} y={y - 22} width={w} height={44} rx={7} style={{ fill: c.card, stroke: tlv ? c.clayHex : c.node, strokeWidth: 1.75 }} />
    {tlv && (
      <>
        <line x1={x - w / 2 + 24} y1={y - 22} x2={x - w / 2 + 24} y2={y + 22} style={{ stroke: c.clayHex, strokeWidth: 1.2 }} />
        <line x1={x + w / 2 - 24} y1={y - 22} x2={x + w / 2 - 24} y2={y + 22} style={{ stroke: c.clayHex, strokeWidth: 1.2 }} />
      </>
    )}
    <text x={x} y={y + 8} textAnchor="middle" style={{ fontFamily: tlv ? MONO : SANS, fontSize: 22, fill: c.ink }}>
      {label}
    </text>
  </GFade>
);

const VJ_GDot = ({ x, y, show, delay = 0, dashed = false }: { x: number; y: number; show: boolean; delay?: number; dashed?: boolean }) => (
  <GFade show={show} delay={delay}>
    <circle cx={x} cy={y} r={13} style={{ fill: dashed ? c.coolSoft : c.card, stroke: dashed ? c.cool : c.node, strokeWidth: 1.75, strokeDasharray: dashed ? '4 4' : 'none' }} />
  </GFade>
);

const VJ_BipGraphical: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  const O = 900;
  return (
    <VarShell of={VJ_OF_BIP} lens="Graphical" title="Two trees, one construction" proc={proc}>
      <Canvas>
        <line x1={960} y1={282} x2={960} y2={900} style={{ stroke: c.rule, strokeWidth: 1.5 }} />
        <T x={500} y={286} font="sans" size={26} color={c.muted}>
          BIP341
        </T>
        <T x={500 + O} y={286} font="sans" size={26} color={c.clayHex}>
          Nutroot
        </T>

        {/* leaves */}
        <VJ_GRect x={260} y={640} label="script" show={s >= 1} />
        <VJ_GRect x={500} y={780} label="script" show={s >= 1} delay={60} />
        <VJ_GRect x={700} y={780} label="script" show={s >= 1} delay={120} />
        <VJ_GRect x={1150} y={780} label="TLV" tlv show={s >= 1} />
        <VJ_GRect x={1320} y={780} label="TLV" tlv show={s >= 1} delay={60} />
        <VJ_GRect x={1500} y={780} label="TLV" tlv show={s >= 1} delay={120} />

        {/* BIP341 tree: builder-chosen depths */}
        <Draw x1={260} y1={618} x2={420} y2={512} show={s >= 2} color={c.node} width={1.75} />
        <Draw x1={600} y1={618} x2={440} y2={512} show={s >= 2} color={c.node} width={1.75} />
        <Draw x1={500} y1={758} x2={594} y2={632} show={s >= 2} color={c.node} width={1.75} />
        <Draw x1={700} y1={758} x2={606} y2={632} show={s >= 2} color={c.node} width={1.75} />
        <VJ_GDot x={600} y={620} show={s >= 2} delay={300} />
        <VJ_GDot x={430} y={500} show={s >= 2} delay={500} />
        <T x={260} y={700} font="sans" size={22} color={c.clayHex} show={s >= 4}>
          chosen depth
        </T>

        {/* nutroot tree: sorted fold with promotion */}
        <Draw x1={1150} y1={758} x2={1228} y2={632} show={s >= 2} color={c.node} width={1.75} />
        <Draw x1={1320} y1={758} x2={1242} y2={632} show={s >= 2} color={c.node} width={1.75} />
        <GFade show={s >= 2}>
          <line x1={1500} y1={758} x2={1500} y2={633} style={{ stroke: c.cool, strokeWidth: 1.75, strokeDasharray: '5 6' }} />
        </GFade>
        <Draw x1={1235} y1={607} x2={1322} y2={512} show={s >= 2} color={c.node} width={1.75} delay={300} />
        <Draw x1={1500} y1={607} x2={1338} y2={512} show={s >= 2} color={c.node} width={1.75} delay={300} />
        <VJ_GDot x={1235} y={620} show={s >= 2} delay={300} />
        <VJ_GDot x={1500} y={620} show={s >= 2} delay={300} dashed />
        <VJ_GDot x={1330} y={500} show={s >= 2} delay={500} />
        <T x={1530} y={628} font="sans" size={22} color={c.clayHex} anchor="start" show={s >= 4}>
          sorted fold
        </T>

        {/* tweak rows */}
        <VJ_SNode x={250} y={372} r={34} label="P" show={s >= 3} />
        <Arrow x1={284} y1={372} x2={404} y2={372} show={s >= 3} color={c.muted} />
        <VJ_Plus x={430} y={372} show={s >= 3} delay={200} />
        <Arrow x1={430} y1={486} x2={430} y2={398} show={s >= 3} color={c.clayHex} />
        <Arrow x1={456} y1={372} x2={566} y2={372} show={s >= 3} color={c.muted} delay={300} />
        <VJ_SNode x={610} y={372} r={40} label="Q" tone="on" show={s >= 3} delay={500} />
        <T x={610} y={446} font="mono" size={22} color={c.clayHex} show={s >= 4}>
          x(Q) · 32 B
        </T>
        <T x={414} y={452} font="sans" size={22} color={c.clayHex} anchor="end" show={s >= 4}>
          t ≥ n: fail
        </T>

        <VJ_SNode x={1150} y={372} r={34} label="K" show={s >= 3} />
        <Arrow x1={1184} y1={372} x2={1304} y2={372} show={s >= 3} color={c.muted} />
        <VJ_Plus x={1330} y={372} show={s >= 3} delay={200} />
        <Arrow x1={1330} y1={486} x2={1330} y2={398} show={s >= 3} color={c.clayHex} />
        <Arrow x1={1356} y1={372} x2={1466} y2={372} show={s >= 3} color={c.muted} delay={300} />
        <GFade show={s >= 3} delay={500}>
          <circle cx={1510} cy={372} r={40} style={{ fill: c.clayHex }} />
          <text x={1510} y={383} textAnchor="middle" style={{ fontFamily: MATH, fontStyle: 'italic', fontSize: 30, fill: '#ffffff' }}>
            P
          </text>
        </GFade>
        <T x={1510} y={446} font="mono" size={22} color={c.clayHex} show={s >= 4}>
          33 B
        </T>
        <T x={1314} y={452} font="sans" size={22} color={c.clayHex} anchor="end" show={s >= 4}>
          t mod n
        </T>

        <T x={480} y={880} font="mono" size={22} color={c.muted} show={s >= 4}>
          control: c0|parity ‖ x(P) ‖ path ≤ 128
        </T>
        <T x={1380} y={880} font="mono" size={22} color={c.muted} show={s >= 4}>
          control: {'{ K, path ≤ 3 }'}
        </T>
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via bytes ─────────────────────────────────────────────────────

const VJ_ByteRow = ({ who, size, show, delay = 0, children }: { who: string; size?: string; show: boolean; delay?: number; children: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      marginTop: 10,
      opacity: show ? 1 : 0,
      transform: show || REDUCED ? 'translateY(0px)' : 'translateY(6px)',
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms, transform 450ms ${EASE_OUT} ${show ? delay : 0}ms`,
    }}
  >
    <div style={{ width: 160, flexShrink: 0, fontSize: 22, paddingTop: 5, color: who === 'BIP341' ? c.muted : c.clayHex }}>{who}</div>
    <div style={{ display: 'flex' }}>{children}</div>
    {size && <div style={{ marginLeft: 12, paddingTop: 6, fontSize: 21, color: c.muted, whiteSpace: 'nowrap' }}>{size}</div>}
  </div>
);

const VJ_BipBytes: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_BIP} lens="Explained via bytes" title="The hash preimages, byte by byte" proc={proc}>
      <At x={120} y={256} w={1680}>
        <Fade show={s >= 1}>
          <Label color={s === 1 ? c.clayHex : c.muted}>Leaf hash</Label>
        </Fade>
        <VJ_ByteRow who="BIP341" show={s >= 1} size="prefix + script">
          <VJ_Seg bytes="aeea8fdc… ×2" label={'SHA256("TapLeaf")'} tone="tag" />
          <VJ_Seg bytes="c0" label="version" tone="type" />
          <VJ_Seg bytes="<len>" label="compact_size" />
          <VJ_Seg bytes="<script>" label="opcodes" />
        </VJ_ByteRow>
        <VJ_ByteRow who="Nutroot" show={s >= 1} delay={150} size="prefix + 49 B">
          <VJ_Seg bytes="e19ba80c… ×2" label={'SHA256("Cashu_NutrootLeaf")'} tone="tag" />
          <VJ_Seg bytes="00" label="version" tone="type" />
          <VJ_Seg bytes="02" label="after" tone="type" />
          <VJ_Seg bytes="02 0001 01" label="n = 1" />
          <VJ_Seg bytes="04 0021 02e493…c4cd13" label="keys: key 4" />
          <VJ_Seg bytes="06 0004 68a3be80" label="time" />
        </VJ_ByteRow>
      </At>
      <At x={120} y={470} w={1680}>
        <Fade show={s >= 2}>
          <Label color={s === 2 ? c.clayHex : c.muted}>Branch: same shape, own tag</Label>
        </Fade>
        <VJ_ByteRow who="BIP341" show={s >= 2} size="prefix + 64 B">
          <VJ_Seg bytes="1941a1f2… ×2" label={'SHA256("TapBranch")'} tone="tag" />
          <VJ_Seg bytes="<32 B>" label="smaller hash" />
          <VJ_Seg bytes="<32 B>" label="larger hash" />
        </VJ_ByteRow>
        <VJ_ByteRow who="Nutroot" show={s >= 2} delay={150} size="prefix + 64 B">
          <VJ_Seg bytes="f54194fd… ×2" label={'SHA256("Cashu_NutrootBranch")'} tone="tag" />
          <VJ_Seg bytes="<32 B>" label="smaller hash" />
          <VJ_Seg bytes="<32 B>" label="larger hash" />
        </VJ_ByteRow>
      </At>
      <At x={120} y={684} w={1680}>
        <Fade show={s >= 3}>
          <Label color={s === 3 ? c.clayHex : c.muted}>Tweak</Label>
        </Fade>
        <VJ_ByteRow who="BIP341" show={s >= 3} size="prefix + 64 B">
          <VJ_Seg bytes="e80fe163… ×2" label={'SHA256("TapTweak")'} tone="tag" />
          <VJ_Seg bytes="<32 B>" label="x(P)" />
          <VJ_Seg bytes="<32 B>" label="root" />
        </VJ_ByteRow>
        <VJ_ByteRow who="Nutroot" show={s >= 3} delay={150} size="prefix + 65 B">
          <VJ_Seg bytes="cc14d687… ×2" label={'SHA256("Cashu_NutrootTweak")'} tone="tag" />
          <VJ_Seg bytes="03a3e12c…3a419e51" label="K, 33 B" hot={s === 3} />
          <VJ_Seg bytes="9ed9c0b8…0616589a" label="root" />
        </VJ_ByteRow>
      </At>
      <At x={120} y={900} w={1680}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 22, display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <M size={28}>t</M>
            <span>=</span>
            <VJ_C>b3b7846b…5effe8a4</VJ_C>
            <span style={{ color: c.muted }}>→</span>
            <M size={28}>K + t·G</M>
            <span>=</span>
            <VJ_C color={c.clayHex}>02d310a4…9ef8f828</VJ_C>
            <span style={{ color: c.muted }}>33 B. BIP341 outputs x(Q), 32 B, and keeps the parity for the control block.</span>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Perspective: the verifier ───────────────────────────────────────────────

const VJ_VRow = ({ i, s, left, right }: { i: number; s: number; left: ReactNode; right: ReactNode }) => {
  const y = 306 + (i - 1) * 104;
  return (
    <>
      <VJ_Card x={120} y={y} w={800} h={92} show={s >= i} tone={s === i ? c.node : c.rule} pad="10px 20px">
        <div style={{ display: 'flex', gap: 14, fontSize: 22, lineHeight: 1.35 }}>
          <span style={{ fontFamily: MONO, fontSize: 21, color: c.muted, paddingTop: 2 }}>{i}</span>
          <span>{left}</span>
        </div>
      </VJ_Card>
      <VJ_Card x={1000} y={y} w={800} h={92} show={s >= i} delay={200} tone={s === i ? c.clayHex : c.rule} fill={s === i ? c.claySoft : c.card} pad="10px 20px">
        <div style={{ display: 'flex', gap: 14, fontSize: 22, lineHeight: 1.35 }}>
          <span style={{ fontFamily: MONO, fontSize: 21, color: c.clayHex, paddingTop: 2 }}>{i}</span>
          <span>{right}</span>
        </div>
      </VJ_Card>
    </>
  );
};

const VJ_BipVerifier: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_BIP} lens="Perspective: the verifier" title="Script-path checks: Bitcoin node and mint" proc={proc}>
      <At x={120} y={260} w={800}>
        <div style={{ fontSize: 24, color: c.muted }}>Bitcoin node (BIP341, BIP342)</div>
      </At>
      <At x={1000} y={260} w={800}>
        <div style={{ fontSize: 24, color: c.clayHex }}>Mint (NUT-10)</div>
      </At>
      <VJ_VRow
        i={1}
        s={s}
        left="Control block of 33 + 32m bytes, m ≤ 128; any other length fails."
        right="Path of at most 3 sibling hashes; more rejects."
      />
      <VJ_VRow
        i={2}
        s={s}
        left={
          <>
            Leaf version <VJ_C>c[0] & 0xfe</VJ_C>; <M>P</M> = lift_x(<VJ_C>c[1:33]</VJ_C>), even y.
          </>
        }
        right={
          <>
            No version, no parity: <M>K</M> is 33 bytes, the leaf starts with version 0x00.
          </>
        }
      />
      <VJ_VRow
        i={3}
        s={s}
        left="TapLeaf hash over version, compact_size, script; fold the path in sorted pairs."
        right="Cashu_NutrootLeaf hash over the leaf bytes; fold the path in sorted pairs."
      />
      <VJ_VRow
        i={4}
        s={s}
        left={
          <>
            TapTweak over x(<M>P</M>) ‖ root; fail if <M>t ≥ n</M>; check x(<M>Q</M>) and the parity bit.
          </>
        }
        right={
          <>
            Cashu_NutrootTweak over <M>K</M> ‖ root, mod <M>n</M>; <M>K + t·G</M> must equal the 33-byte secret.
          </>
        }
      />
      <VJ_VRow
        i={5}
        s={s}
        left="Execute the script (BIP342). Unknown leaf versions and OP_SUCCESS succeed."
        right="Parse the leaf; unknown version, type or field fails closed. Evaluate, no interpreter."
      />
      <VJ_VRow
        i={6}
        s={s}
        left="OP_CHECKLOCKTIMEVERIFY compares with the transaction's nLockTime; consensus enforces it."
        right={
          <>
            after: the mint's local clock ≥ time. Signatures cover the input digest, not a sighash.
          </>
        }
      />
    </VarShell>
  );
};

// ─── Framing: the constraint behind each difference ──────────────────────────

const VJ_YW = [400, 1140, 140];

const VJ_WhyRow = ({ i, s, diff, why, nut }: { i: number; s: number; diff: string; why: ReactNode; nut: string }) => (
  <VJ_TRow h={84} show={s >= i} hot={s === i}>
    <VJ_TCell w={VJ_YW[0]}>
      <span style={{ fontWeight: 600 }}>{diff}</span>
    </VJ_TCell>
    <VJ_TCell w={VJ_YW[1]}>{why}</VJ_TCell>
    <VJ_TCell w={VJ_YW[2]}>
      <VJ_C color={c.muted}>{nut}</VJ_C>
    </VJ_TCell>
  </VJ_TRow>
);

const VJ_BipWhy: Page = () => {
  const proc = useProcess(7, 1800);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_BIP} lens="Framing: constraints" title="The constraint behind each difference" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VJ_TRow h={48} head>
          <VJ_TCell head w={VJ_YW[0]}>
            Difference
          </VJ_TCell>
          <VJ_TCell head w={VJ_YW[1]}>
            Constraint stated in the specification
          </VJ_TCell>
          <VJ_TCell head w={VJ_YW[2]}>
            NUT
          </VJ_TCell>
        </VJ_TRow>
        <VJ_WhyRow
          i={1}
          s={s}
          diff="33-byte keys"
          nut="10"
          why="Secret identity is the 33-byte encoding: Y hashes it, and 02‖x and 03‖x are two secrets. Script paths bind the exact compressed secret."
        />
        <VJ_WhyRow
          i={2}
          s={s}
          diff="Fixed sorted fold"
          nut="10, 18"
          why="A payer rebuilds a requested tree from its leaves alone. The root commits the leaf set, not the order."
        />
        <VJ_WhyRow
          i={3}
          s={s}
          diff="Declarative leaves, fail closed"
          nut="10"
          why="A v3 keyset implies full support. An unknown leaf type disables only that path; it never becomes anyone-can-spend."
        />
        <VJ_WhyRow
          i={4}
          s={s}
          diff="Every spend path names a key"
          nut="10"
          why="A keyless path could be replayed by anyone who sees its witness. A preimage alone is never spend power."
        />
        <VJ_WhyRow
          i={5}
          s={s}
          diff="NUMS offset required, u disclosed"
          nut="10"
          why={
            <>
              A holder verifies <M>K − u·G = H</M>: no key path exists. A fresh <M>u</M> makes each secret unique.
            </>
          }
        />
        <VJ_WhyRow
          i={6}
          s={s}
          diff="Input digest as the message"
          nut="10"
          why="A witness authorizes nothing outside its transaction. A published witness verifies without the shared transaction digest."
        />
        <VJ_WhyRow
          i={7}
          s={s}
          diff="≤ 8 leaves, ≤ 512-byte bodies"
          nut="10, 28"
          why="The caps keep a tree at 120 leaf keys, inside the 255 leaf-key slots of NUT-28's one-byte index."
        />
      </At>
    </VarShell>
  );
};

// ─── Framing: sizes ──────────────────────────────────────────────────────────

const VJ_ZW = [360, 620, 700];

const VJ_SizeRow = ({ k, bip, nut, show }: { k: string; bip: ReactNode; nut: ReactNode; show: boolean }) => (
  <VJ_TRow h={60} show={show}>
    <VJ_TCell w={VJ_ZW[0]} color={c.muted}>
      {k}
    </VJ_TCell>
    <VJ_TCell w={VJ_ZW[1]}>{bip}</VJ_TCell>
    <VJ_TCell w={VJ_ZW[2]}>{nut}</VJ_TCell>
  </VJ_TRow>
);

const VJ_BipSizes: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_BIP} lens="Framing: sizes" title="Sizes and limits side by side" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VJ_TRow h={50} head>
          <VJ_TCell head w={VJ_ZW[0]}> </VJ_TCell>
          <VJ_TCell head w={VJ_ZW[1]}>
            BIP341
          </VJ_TCell>
          <VJ_TCell head w={VJ_ZW[2]} color={c.clayHex}>
            Nutroot
          </VJ_TCell>
        </VJ_TRow>
        <VJ_SizeRow show={s >= 1} k="Committed key" bip="32 B x-only output key" nut="33 B compressed secret" />
        <VJ_SizeRow show={s >= 1} k="Tweak preimage" bip="x(P) ‖ root: 64 B" nut="K ‖ root: 65 B" />
        <VJ_SizeRow
          show={s >= 1}
          k="Key-path witness"
          bip="64 B signature, 65 with a non-default sighash"
          nut="JSON, 147 characters, one 64 B signature"
        />
        <VJ_SizeRow show={s >= 1} k="Merkle path" bip="≤ 128 hashes" nut="≤ 3 hashes" />
        <VJ_SizeRow show={s >= 2} k="Tree" bip="depth ≤ 128, shape chosen" nut="≤ 8 leaves, shape fixed" />
        <VJ_SizeRow show={s >= 2} k="Control block" bip="33 + 32m B, at most 4129 B" nut="K 33 B + path ≤ 96 B, hex in JSON" />
        <VJ_SizeRow show={s >= 2} k="Leaf" bip="script under leaf version 0xc0" nut="≤ 513 B (body ≤ 512 B)" />
      </At>
      <At x={120} y={762} w={1680}>
        <Fade show={s >= 3}>
          <Label>Nutroot script-path witnesses, compact JSON (computed from the vector shapes)</Label>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
            <VJ_Chip>one after leaf, empty path: 350</VJ_Chip>
            <VJ_Chip>2-of-2 threshold leaf: 533</VJ_Chip>
            <VJ_Chip>hashlock in the three-leaf tree: 617</VJ_Chip>
          </div>
          <Note style={{ marginTop: 14, fontSize: 22 }}>
            Characters. Mints MAY reject a witness over 4096 characters; every valid witness has a compact encoding below
            that bound.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Source 4 · JSON secrets and nutroot secrets
// ═════════════════════════════════════════════════════════════════════════════

// ─── Beginner ────────────────────────────────────────────────────────────────

const VJ_CmpBeginner: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CMP} lens="Beginner" title="One payment, two encodings" proc={proc}>
      <VJ_Card x={120} y={256} w={1220} h={52} fill={c.panel} tone={s === 1 ? c.clayHex : c.rule} pad="10px 20px">
        <span style={{ fontSize: 22 }}>
          Carol (key 3) can spend. From 2025-08-19 00:00 UTC (1755561600) Alice (key 4) can take it back.
        </span>
      </VJ_Card>
      <At x={120} y={330} w={590}>
        <Fade show={s >= 2}>
          <Label>Keysets v1, v2: JSON secret</Label>
          <div style={{ marginTop: 8 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 21,
                lineHeight: 1.5,
                whiteSpace: 'pre',
                background: c.card,
                border: `1.5px solid ${s === 2 ? c.clayHex : c.rule}`,
                borderRadius: 12,
                padding: '12px 20px',
              }}
            >
              {`["P2PK", {
  "nonce": "<32 B hex>",
  "data": "02f9308a…bce036f9",
  "tags": [
    ["locktime", "1755561600"],
    ["refund", "02e493db…e8c4cd13"]
  ]
}]`}
            </div>
          </div>
          <div style={{ fontSize: 22, marginTop: 10, lineHeight: 1.4 }}>
            276 bytes as a string. The whole policy is the secret.
          </div>
        </Fade>
      </At>
      <At x={750} y={330} w={590}>
        <Fade show={s >= 3}>
          <Label color={c.clayHex}>Keyset v3: nutroot</Label>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 21,
                background: c.claySoft,
                border: `1.5px solid ${c.clayHex}`,
                borderRadius: 10,
                padding: '8px 14px',
              }}
            >
              02d310a4…9ef8f828
            </span>
            <span style={{ fontSize: 22, color: c.muted }}>secret, 33 bytes</span>
          </div>
          <div style={{ fontSize: 22, color: c.muted, marginTop: 18 }}>Spend info, wallet to wallet only:</div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 21,
              lineHeight: 1.5,
              whiteSpace: 'pre',
              background: c.card,
              border: `1.5px solid ${s === 3 ? c.clayHex : c.rule}`,
              borderRadius: 12,
              padding: '12px 20px',
              marginTop: 8,
            }}
          >
            {`{ "E": "022f8bde…b240efe4",
  "tree": ["00020200…68a3be80"] }`}
          </div>
          <div style={{ fontSize: 22, marginTop: 10, lineHeight: 1.4 }}>
            The tree holds one after leaf, 49 bytes, naming key 4.
          </div>
        </Fade>
      </At>
      <VJ_Card x={120} y={760} w={590} h={190} show={s >= 4} tone={s === 4 ? c.clayHex : c.rule} pad="14px 20px">
        <Label>At the mint, any spend</Label>
        <div style={{ fontSize: 22, marginTop: 8, lineHeight: 1.4 }}>
          The 276-byte policy: Carol's key, Alice's key, the locktime. Signatures on the secret string.
        </div>
      </VJ_Card>
      <VJ_Card x={750} y={760} w={590} h={190} show={s >= 4} tone={s === 4 || s === 5 ? c.clayHex : c.rule} pad="14px 20px">
        <Label color={c.clayHex}>At the mint</Label>
        <div style={{ fontSize: 22, marginTop: 8, lineHeight: 1.4 }}>Carol: one signature by key path. Nothing else.</div>
        <Fade show={s >= 5}>
          <div style={{ fontSize: 22, marginTop: 6, lineHeight: 1.4 }}>
            Alice, after the time: the after leaf, <M>K</M> and her signature.
          </div>
        </Fade>
      </VJ_Card>
      <StepList>
        <StepItem n={1} step={s}>
          One condition: Carol now, Alice after a date.
        </StepItem>
        <StepItem n={2} step={s}>
          Before v3 the condition is written into the secret as JSON.
        </StepItem>
        <StepItem n={3} step={s}>
          On v3 the secret is a key; the condition travels beside the proof as spend info.
        </StepItem>
        <StepItem n={4} step={s}>
          When Carol spends, the mint sees the whole JSON, or only a signature.
        </StepItem>
        <StepItem n={5} step={s}>
          Alice's refund reveals only her leaf.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced: the version switch ────────────────────────────────────────────

const VJ_SwitchPair = ({ i, s, left, right }: { i: number; s: number; left: ReactNode; right: ReactNode }) => {
  const y = 470 + (i - 1) * 100;
  return (
    <>
      <VJ_Card x={120} y={y} w={760} h={86} show={s >= i + 1} tone={s === i + 1 ? c.node : c.rule} pad="10px 20px">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>{left}</div>
      </VJ_Card>
      <VJ_Card x={1040} y={y} w={760} h={86} show={s >= i + 1} delay={200} tone={s === i + 1 ? c.clayHex : c.rule} fill={s === i + 1 ? c.claySoft : c.card} pad="10px 20px">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>{right}</div>
      </VJ_Card>
    </>
  );
};

const VJ_CmpAdvanced: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CMP} lens="Advanced" title="The keyset version selects the rules" proc={proc}>
      <VJ_Box x={960} y={290} w={380} h={56} title="proof input" />
      <VJ_Box x={960} y={380} w={520} h={60} title="keyset version byte" tone="on" show={s >= 1} />
      <Canvas>
        <Arrow x1={960} y1={318} x2={960} y2={346} show color={c.muted} />
        <Arrow x1={880} y1={410} x2={560} y2={462} show={s >= 1} color={c.muted} />
        <Arrow x1={1040} y1={410} x2={1360} y2={462} show={s >= 1} color={c.clayHex} />
        <T x={640} y={416} font="mono" size={22} color={c.muted} anchor="end" show={s >= 1}>
          00, 01
        </T>
        <T x={1280} y={416} font="sans" size={22} color={c.clayHex} anchor="start" show={s >= 1}>
          02 and later
        </T>
      </Canvas>
      <VJ_SwitchPair
        i={1}
        s={s}
        left="Secret: any string. A well-known JSON secret is parsed; its kind selects the rules."
        right="Secret MUST be a 33-byte compressed point; anything else rejects. Its shape never selects rules."
      />
      <VJ_SwitchPair
        i={2}
        s={s}
        left="Y = hash_to_curve over the string's bytes: a 33-byte secp256k1 point."
        right="Y = hash_to_curve_G1 over the 33 decoded bytes: a 48-byte BLS12-381 point."
      />
      <VJ_SwitchPair
        i={3}
        s={s}
        left="Witness signs the secret string, or a concatenation under SIG_ALL (NUT-11)."
        right="Each input signs its own input digest. SIG_ALL and sigflag do not exist."
      />
      <VJ_SwitchPair
        i={4}
        s={s}
        left="A mint without support for a kind may treat the proof as anyone-can-spend."
        right="A v3 keyset implies all of nutroot. NUT-10, 11, 14, 20 settings are pre-v3 only."
      />
      <VJ_Card x={120} y={884} w={1680} h={80} show={s >= 6} tone={s === 6 ? c.clayHex : c.rule} fill={c.panel} pad="10px 20px">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          Mixed transactions are valid: each input follows its own keyset. A point-shaped string on a v1/v2 keyset is just a
          string. v3 tokens never carry a witness.
        </div>
      </VJ_Card>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VJ_Bar = ({
  y,
  label,
  bytes,
  tone,
  show,
  delay = 0,
  note,
}: {
  y: number;
  label: ReactNode;
  bytes: number;
  tone: string;
  show: boolean;
  delay?: number;
  note?: ReactNode;
}) => (
  <>
    <div style={{ position: 'absolute', left: 120, top: y, width: 200, height: 40, display: 'flex', alignItems: 'center', fontSize: 22, color: c.muted }}>
      {label}
    </div>
    <div
      style={{
        position: 'absolute',
        left: 330,
        top: y + 4,
        width: Math.max(bytes * 4, 3),
        height: 32,
        background: tone,
        borderRadius: 4,
        transformOrigin: 'left center',
        transform: show || REDUCED ? 'scaleX(1)' : 'scaleX(0.04)',
        opacity: show ? 1 : 0,
        transition: `transform 700ms ${EASE_OUT} ${show ? delay : 0}ms, opacity 300ms ${EASE_OUT} ${show ? delay : 0}ms`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 330 + Math.max(bytes * 4, 3) + 14,
        top: y,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        whiteSpace: 'nowrap',
        opacity: show ? 1 : 0,
        transition: `opacity 400ms ${EASE_OUT} ${show ? delay + 400 : 0}ms`,
      }}
    >
      <VJ_C>{bytes} B</VJ_C>
      {note && <span style={{ fontSize: 21, color: c.muted }}>{note}</span>}
    </div>
  </>
);

const VJ_CmpGraphical: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CMP} lens="Graphical" title="Secret size and what a spend reveals" proc={proc}>
      <At x={120} y={256} w={800}>
        <Label>Secret</Label>
      </At>
      <VJ_Bar y={290} label="P2PK" bytes={195} tone={c.node} show={s >= 1} />
      <VJ_Bar y={334} label="v3" bytes={33} tone={c.clayHex} show={s >= 2} />
      <VJ_Bar y={398} label="refund" bytes={276} tone={c.node} show={s >= 1} delay={80} />
      <VJ_Bar y={442} label="v3" bytes={33} tone={c.clayHex} show={s >= 2} delay={80} />
      <VJ_Bar y={506} label="HTLC" bytes={323} tone={c.node} show={s >= 1} delay={160} />
      <VJ_Bar y={550} label="v3" bytes={33} tone={c.clayHex} show={s >= 2} delay={160} />
      <At x={120} y={632} w={1200}>
        <Fade show={s >= 3}>
          <Label>Policy revealed at spend · refund example</Label>
        </Fade>
      </At>
      <VJ_Bar y={666} label="JSON" bytes={276} tone={c.node} show={s >= 3} note="any spend" />
      <VJ_Bar y={718} label="v3, Carol" bytes={0} tone={c.clayHex} show={s >= 4} note="key path: a signature only" />
      <VJ_Bar y={770} label="v3, Alice" bytes={49} tone={c.clayHex} show={s >= 4} delay={120} note="after leaf; plus K and a signature" />
      <At x={120} y={880} w={1680}>
        <Note style={{ fontSize: 22 }}>gray: JSON secret (v1, v2) · clay: nutroot (v3) · 4 px per byte</Note>
      </At>
    </VarShell>
  );
};

// ─── Explained via a proof's lifecycle ───────────────────────────────────────

const VJ_LX = (i: number) => 255 + i * 282;

const VJ_LifeCell = ({ i, y, h, s, children, v3 = false }: { i: number; y: number; h: number; s: number; children: ReactNode; v3?: boolean }) => (
  <VJ_Card
    x={VJ_LX(i) - 135}
    y={y}
    w={270}
    h={h}
    show={s >= i + 1}
    delay={v3 ? 200 : 0}
    tone={s === i + 1 ? (v3 ? c.clayHex : c.node) : c.rule}
    fill={s === i + 1 && v3 ? c.claySoft : c.card}
    pad="12px 14px"
  >
    <div style={{ fontSize: 21, lineHeight: 1.35 }}>{children}</div>
  </VJ_Card>
);

const VJ_CmpLifecycle: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  const mx = VJ_LX(Math.max(0, s - 1));
  return (
    <VarShell of={VJ_OF_CMP} lens="Explained via a proof's lifecycle" title="One proof, from output to checkstate" proc={proc}>
      <Canvas>
        <line x1={180} y1={318} x2={1740} y2={318} style={{ stroke: c.line, strokeWidth: 1.5 }} />
        <T x={VJ_LX(0)} y={290} font="sans" size={22}>
          1 create
        </T>
        <T x={VJ_LX(1)} y={290} font="sans" size={22}>
          2 issue
        </T>
        <T x={VJ_LX(2)} y={290} font="sans" size={22}>
          3 send
        </T>
        <T x={VJ_LX(3)} y={290} font="sans" size={22}>
          4 receive
        </T>
        <T x={VJ_LX(4)} y={290} font="sans" size={22}>
          5 spend
        </T>
        <T x={VJ_LX(5)} y={290} font="sans" size={22}>
          6 checkstate
        </T>
        <circle cx={VJ_LX(0)} cy={318} r={6} style={{ fill: c.node }} />
        <circle cx={VJ_LX(1)} cy={318} r={6} style={{ fill: c.node }} />
        <circle cx={VJ_LX(2)} cy={318} r={6} style={{ fill: c.node }} />
        <circle cx={VJ_LX(3)} cy={318} r={6} style={{ fill: c.node }} />
        <circle cx={VJ_LX(4)} cy={318} r={6} style={{ fill: c.node }} />
        <circle cx={VJ_LX(5)} cy={318} r={6} style={{ fill: c.node }} />
        <g
          style={{
            transform: `translate(${mx}px, 318px)`,
            opacity: s >= 1 ? 1 : 0,
            transition: `transform 600ms ${EASE_IO}, opacity 300ms ${EASE_OUT}`,
          }}
        >
          <circle cx={0} cy={0} r={12} style={{ fill: c.clayHex }} />
        </g>
      </Canvas>
      <At x={120} y={338} w={800}>
        <Label>Keysets v1, v2 · JSON</Label>
      </At>
      <VJ_LifeCell i={0} y={368} h={224} s={s}>
        The wallet writes the policy into the secret string, then blinds it.
      </VJ_LifeCell>
      <VJ_LifeCell i={1} y={368} h={224} s={s}>
        The mint signs the blinded output and learns nothing. A quote lock is optional (NUT-20).
      </VJ_LifeCell>
      <VJ_LifeCell i={2} y={368} h={224} s={s}>
        The token carries the proof. The policy is readable in the secret.
      </VJ_LifeCell>
      <VJ_LifeCell i={3} y={368} h={224} s={s}>
        The receiver parses kind, data and tags, and checks keys and locktime.
      </VJ_LifeCell>
      <VJ_LifeCell i={4} y={368} h={224} s={s}>
        The mint parses the whole policy. Signatures cover the secret string.
      </VJ_LifeCell>
      <VJ_LifeCell i={5} y={368} h={224} s={s}>
        Checkstate returns the witness if the condition requires one.
      </VJ_LifeCell>
      <At x={120} y={616} w={800}>
        <Label color={c.clayHex}>Keyset v3 · nutroot</Label>
      </At>
      <VJ_LifeCell i={0} y={646} h={250} s={s} v3>
        The wallet derives <M>K</M>, computes <M>K + t·G</M>, and blinds the 33-byte point.
      </VJ_LifeCell>
      <VJ_LifeCell i={1} y={646} h={250} s={s} v3>
        The mint signs the blinded output and learns nothing. The quote is a locked input and signs its digest.
      </VJ_LifeCell>
      <VJ_LifeCell i={2} y={646} h={250} s={s} v3>
        The token carries the proof plus spend info: <VJ_C>k</VJ_C> or <VJ_C>E</VJ_C>, <VJ_C>K</VJ_C>, tree,{' '}
        <VJ_C>u</VJ_C>. Never a witness.
      </VJ_LifeCell>
      <VJ_LifeCell i={3} y={646} h={250} s={s} v3>
        The receiver rebuilds the secret from spend info, checks it can spend, and sweeps.
      </VJ_LifeCell>
      <VJ_LifeCell i={4} y={646} h={250} s={s} v3>
        Key path: one signature on the input digest. Script path: one leaf.
      </VJ_LifeCell>
      <VJ_LifeCell i={5} y={646} h={250} s={s} v3>
        Checkstate returns a commitment. Witness and input digest only for disclosure leaves.
      </VJ_LifeCell>
    </VarShell>
  );
};

// ─── Perspective: receiving wallet ───────────────────────────────────────────

const VJ_SweepCard = ({ x, show, title, children }: { x: number; show: boolean; title: ReactNode; children: ReactNode }) => (
  <VJ_Card x={x} y={782} w={393} h={170} show={show} pad="14px 18px">
    <div style={{ fontSize: 22, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 21, color: c.muted, marginTop: 6, lineHeight: 1.35 }}>{children}</div>
  </VJ_Card>
);

const VJ_CmpReceiver: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CMP} lens="Perspective: receiving wallet" title="What the receiver needs to know what it holds" proc={proc}>
      <At x={120} y={262} w={590}>
        <Fade show={s >= 1}>
          <Label>v1, v2: the secret describes itself</Label>
          <div
            style={{
              marginTop: 8,
              fontFamily: MONO,
              fontSize: 21,
              lineHeight: 1.5,
              whiteSpace: 'pre',
              background: c.card,
              border: `1.5px solid ${s === 1 ? c.clayHex : c.rule}`,
              borderRadius: 12,
              padding: '12px 20px',
            }}
          >
            {`["P2PK", {
  "nonce": "<32 B hex>",
  "data": "02f9308a…bce036f9",
  "tags": [["locktime", "1755561600"],
    ["refund", "02e493db…e8c4cd13"]] }]`}
          </div>
          <div style={{ fontSize: 22, marginTop: 12, lineHeight: 1.4 }}>
            The receiver reads kind, keys and locktime from the string. Nothing can hide in it.
          </div>
        </Fade>
      </At>
      <At x={750} y={262} w={590}>
        <Fade show={s >= 2}>
          <Label color={c.clayHex}>v3: the secret is a point</Label>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 21,
                background: c.claySoft,
                border: `1.5px solid ${c.clayHex}`,
                borderRadius: 10,
                padding: '6px 14px',
              }}
            >
              02d310a4…9ef8f828
            </span>
            <span style={{ fontSize: 21, color: c.muted }}>says nothing</span>
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: MONO,
              fontSize: 21,
              lineHeight: 1.5,
              whiteSpace: 'pre',
              background: c.card,
              border: `1.5px solid ${s === 2 ? c.clayHex : c.rule}`,
              borderRadius: 12,
              padding: '12px 20px',
            }}
          >
            {`"spend_info": {
  "E": "022f8bde…b240efe4",
  "tree": ["00020200…68a3be80"] }`}
          </div>
        </Fade>
      </At>
      <At x={750} y={580} w={590}>
        <Fade show={s >= 3}>
          <div style={{ display: 'flex', gap: 12, fontSize: 22, lineHeight: 1.4 }}>
            <VJ_Mark ok />
            <span>
              Derive <M>K</M> from <M>E</M>; <M>K + t·G</M> = secret, so the tree is complete.
            </span>
          </div>
        </Fade>
        <Fade show={s >= 4} style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 12, fontSize: 22, lineHeight: 1.4 }}>
            <VJ_Mark ok />
            <span>
              Key path held (<M>p + r₀ + t</M>); the after leaf is checked against the refund-horizon policy.
            </span>
          </div>
        </Fade>
      </At>
      <At x={120} y={748} w={1220}>
        <Fade show={s >= 5}>
          <Label>Sweep promptly, whatever the spend info</Label>
        </Fade>
      </At>
      <VJ_SweepCard x={120} show={s >= 5} title={<>bearer <VJ_C size={22}>k</VJ_C></>}>
        The sender holds the same scalar, and a bearer scalar can hide a tweaked tree.
      </VJ_SweepCard>
      <VJ_SweepCard x={533} show={s >= 5} title={<>receiver-keyed <VJ_C size={22}>E</VJ_C></>}>
        The ephemeral is wallet data; the seed alone cannot recover the proof.
      </VJ_SweepCard>
      <VJ_SweepCard x={946} show={s >= 5} title="tree, no k or E">
        The key-path holder can spend at any time, unless <M>K</M> is a NUMS offset.
      </VJ_SweepCard>
      <StepList>
        <StepItem n={1} step={s}>
          A JSON secret carries its policy. The receiver needs nothing else to read it.
        </StepItem>
        <StepItem n={2} step={s}>
          A v3 secret is 33 bytes. Conditions arrive as spend info, wallet to wallet.
        </StepItem>
        <StepItem n={3} step={s}>
          Check 1: the disclosed data must compute the secret. Then no hidden leaf can exist.
        </StepItem>
        <StepItem n={4} step={s}>
          Check 2: the wallet can spend, and every leaf passes its policy.
        </StepItem>
        <StepItem n={5} step={s}>
          Spend info is fund-critical until the proof is swept to seed-derived secrets.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: migration ──────────────────────────────────────────────────────

const VJ_CmpMigration: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CMP} lens="Framing: migration" title="Moving value from v1, v2 to v3" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Label>Mixed-keyset swap, from tests/10-tests.md</Label>
      </At>
      <VJ_Card x={120} y={296} w={460} h={112} show={s >= 1} tone={s === 2 ? c.clayHex : c.rule} fill={s === 2 ? c.claySoft : c.card} pad="12px 18px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>proof · 8 sat · v3 keyset</div>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 4, lineHeight: 1.35 }}>
          <M>Y</M> 48 B · signs input digest <VJ_C>3f48aab7…5af55837</VJ_C>
        </div>
      </VJ_Card>
      <VJ_Card x={120} y={428} w={460} h={112} show={s >= 1} delay={120} tone={s === 2 ? c.node : c.rule} pad="12px 18px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>
          proof · 2 sat · keyset <VJ_C size={22}>00456a94ab4e1c46</VJ_C>
        </div>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 4, lineHeight: 1.35 }}>
          <M>Y</M> 33 B · its own NUT-11 or bare witness
        </div>
      </VJ_Card>
      <VJ_Box x={780} y={418} w={300} h={112} title="transaction digest" sub="e8eb75f3…9392d893" show={s >= 1} delay={250} />
      <VJ_Card x={980} y={296} w={360} h={112} show={s >= 3} tone={s === 3 ? c.clayHex : c.rule} pad="12px 18px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>blinded message</div>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 4 }}>8 sat · v3 keyset</div>
      </VJ_Card>
      <VJ_Card x={980} y={428} w={360} h={112} show={s >= 3} delay={120} tone={s === 3 ? c.clayHex : c.rule} pad="12px 18px">
        <div style={{ fontSize: 22, fontWeight: 600 }}>blinded message</div>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 4 }}>2 sat · v3 keyset</div>
      </VJ_Card>
      <Canvas>
        <Arrow x1={584} y1={352} x2={626} y2={392} show={s >= 1} color={c.muted} delay={300} />
        <Arrow x1={584} y1={484} x2={626} y2={444} show={s >= 1} color={c.muted} delay={300} />
        <Arrow x1={934} y1={392} x2={976} y2={352} show={s >= 3} color={c.clayHex} />
        <Arrow x1={934} y1={444} x2={976} y2={484} show={s >= 3} color={c.clayHex} />
      </Canvas>
      <At x={120} y={582} w={1220}>
        <Fade show={s >= 4}>
          <Label>Payment request during the transition (NUT-18)</Label>
        </Fade>
      </At>
      <VJ_Card x={120} y={620} w={600} h={150} show={s >= 4} pad="12px 20px">
        <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.5, whiteSpace: 'pre' }}>
          {`{ "a": 8, "u": "sat",
  "nut10":   { "k": "P2PK", "d": "<key>" },
  "nutroot": { "k": "<key>" } }`}
        </div>
      </VJ_Card>
      <At x={760} y={620} w={580}>
        <Fade show={s >= 4} delay={200}>
          <VJ_Rule>A payer on a v1 or v2 keyset follows nut10.</VJ_Rule>
          <VJ_Rule>A payer on a v3 keyset MUST follow nutroot.</VJ_Rule>
          <VJ_Rule>The payee MUST accept either; only she is exposed if they differ.</VJ_Rule>
          <VJ_Rule>nutroot alone asks for v3 outputs only.</VJ_Rule>
        </Fade>
      </At>
      <At x={120} y={904} w={1220}>
        <Note style={{ fontSize: 21 }}>
          Pre-v3 proofs keep their own rules; the NUT-10, 11, 14 and 20 mint settings apply to pre-v3 keysets only.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          One swap can spend a v3 proof and a pre-v3 proof together.
        </StepItem>
        <StepItem n={2} step={s}>
          Only the v3 input signs an input digest. The pre-v3 input keeps its own witness.
        </StepItem>
        <StepItem n={3} step={s}>
          Old inputs, v3 outputs: the migration path is an ordinary swap.
        </StepItem>
        <StepItem n={4} step={s}>
          Payment requests can carry both encodings of one condition.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: what each party learns ─────────────────────────────────────────

const VJ_PW = [360, 640, 680];

const VJ_PartyRow = ({ i, s, who, json, nut }: { i: number; s: number; who: string; json: ReactNode; nut: ReactNode }) => (
  <VJ_TRow h={80} show={s >= i} hot={s === i}>
    <VJ_TCell w={VJ_PW[0]}>
      <span style={{ fontWeight: 600 }}>{who}</span>
    </VJ_TCell>
    <VJ_TCell w={VJ_PW[1]} color={c.muted}>
      {json}
    </VJ_TCell>
    <VJ_TCell w={VJ_PW[2]}>{nut}</VJ_TCell>
  </VJ_TRow>
);

const VJ_CmpParties: Page = () => {
  const proc = useProcess(6, 1900);
  const s = proc.step;
  return (
    <VarShell of={VJ_OF_CMP} lens="Framing: what each party learns" title="Visibility per party" proc={proc}>
      <At x={120} y={250} w={1680}>
        <VJ_TRow h={50} head>
          <VJ_TCell head w={VJ_PW[0]}>
            Party, moment
          </VJ_TCell>
          <VJ_TCell head w={VJ_PW[1]}>
            JSON secret (v1, v2)
          </VJ_TCell>
          <VJ_TCell head w={VJ_PW[2]} color={c.clayHex}>
            Nutroot secret (v3)
          </VJ_TCell>
        </VJ_TRow>
        <VJ_PartyRow i={1} s={s} who="Mint, at issuance" json="A blinded output: nothing." nut="A blinded output: nothing." />
        <VJ_PartyRow
          i={2}
          s={s}
          who="Mint, ordinary spend"
          json="The full policy: kind, keys, tags."
          nut="A 33-byte key and one signature; not even whether conditions exist."
        />
        <VJ_PartyRow
          i={3}
          s={s}
          who="Mint, conditional spend"
          json="The full policy, again."
          nut={
            <>
              One leaf, <M>K</M> and sibling hashes. Other leaves stay hashes.
            </>
          }
        />
        <VJ_PartyRow
          i={4}
          s={s}
          who="Mint, across spends"
          json="The same data key links spends, unless blinded (NUT-28)."
          nut={
            <>
              Key-path spends show no static key. A shared <M>K</M> revealed by script paths links proofs.
            </>
          }
        />
        <VJ_PartyRow
          i={5}
          s={s}
          who={'Anyone with Y, checkstate'}
          json="The witness, when the condition requires one."
          nut="A commitment. Witness and input digest only for disclosure leaves."
        />
        <VJ_PartyRow
          i={6}
          s={s}
          who="Receiver"
          json="Reads the policy from the secret."
          nut="Needs spend info; a tree that computes the secret is provably complete."
        />
      </At>
      <At x={120} y={832} w={1680}>
        <Note style={{ fontSize: 22 }}>Sources: NUT-07 checkstate · NUT-10 nutroot secrets, key uniqueness · NUT-28 summary.</Note>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Deck
// ═════════════════════════════════════════════════════════════════════════════

const VJ_PAGES: [Page, string | undefined][] = [
  [VJ_Cover, undefined],

  [ReceiverKeyed, 'Original slide.'],
  [
    VJ_RkBeginner,
    `Beginner. The receiver-keyed send with the test keys: payee key 3, ephemeral 5, so the shared point is 15·G. r0 and K are the real vector values. The point to make: both sides reach the same scalar, and only the payee can sign for K.`,
  ],
  [
    VJ_RkAdvanced,
    `Advanced. The normative rules split by party, plus the failure that the fresh-ephemeral rule prevents. A shared e reproduces K, so two outputs share one secret and the second is unspendable. Point out that NUT-11's SIG_ALL exception is gone on v3.`,
  ],
  [
    VJ_RkGraphical,
    `Graphical. ECDH gives Zx, Zx gives one scalar per slot, slot 0 blinds the payee key into K, slot 1 blinds the co-signer key inside the leaf, the leaf feeds the tweak. Let the figure build; the last step names the payee's spend key p + r0 + t.`,
  ],
  [
    VJ_RkJson,
    `Explained via JSON. The NUT-18 nutroot vector on top, the resulting proof and spend info below. Walk the highlights: k to K, the b key to its blinded form, every other leaf byte identical, E present because it blinded something. The secret is computed, not a vector value.`,
  ],
  [
    VJ_RkPayee,
    `Perspective: payee. Six gates in order, each with its reject condition. The derived K wins over a disclosed K; the tree must match l exactly, an extra leaf is spend power nobody asked for. The last gate is the sweep, because E is not seed-recoverable.`,
  ],
  [
    VJ_RkSlotMap,
    `Focus: the slot map. A two-leaf request with key 4 at two positions and key 6 left verbatim. Blinded values are computed with the NUT-28 derivation. Key 4 at slots 1 and 3 gives unrelated points; key 6 still consumes slot 2; the owner of key 4 matches by value.`,
  ],
  [
    VJ_RkNums,
    `Framing: NUMS request. Three requests with the same leaf: receiver-keyed, NUMS with a blind-me key, NUMS without. Columns two and three are the NUT-18 NUMS vectors. The E rule is the thing to stress: present exactly when a blinding used e.`,
  ],

  [Capabilities, 'Original slide.'],
  [
    VJ_CapBeginner,
    `Beginner. The four leaf types as building blocks, with the byte sizes of the vector leaves, and the three uses that need no tree at all. Say what each leaf lets someone do, then map it to the use.`,
  ],
  [
    VJ_CapAdvanced,
    `Advanced. For each row of the original table, the MUST that makes it safe. Three groups: key forms, leaf-based uses, protocol-level uses. Every rule is quoted from the NUT in the last column.`,
  ],
  [
    VJ_CapGraphical,
    `Graphical. Each use drawn as the shape of its secret: bare key, blinded key, aggregated key, key plus leaves, NUMS key plus leaves. Let the tiles appear one by one; the legend decodes the letters.`,
  ],
  [
    VJ_CapTxModel,
    `Explained via the transaction model. Most uses are shapes of a proof input's secret; locked quotes are the other input type; blind auth uses the separate request transcript. nutspA comes before the transaction, the checkstate commitment and nutrcA after it.`,
  ],
  [
    VJ_CapMint,
    `Perspective: mint. What arrives at the mint for each use. The three key-path rows are byte-identical; script-path rows show the leaf; only disclosure leaves put the witness on checkstate.`,
  ],
  [
    VJ_CapNutzap,
    `Focus: Nutzap. The commit-leaf vector: NUMS internal key with u = 7, a threshold leaf for key 3 with disclosure, and a commit leaf. Anyone holding the spend info can verify that only key 3 can spend. The commit leaf never becomes a spend path; revealing it rejects.`,
  ],
  [
    VJ_CapQuote,
    `Focus: locked mint quotes. On v3 the paid quote is a transaction input and its lock key signs the input digest. Values are the NUT-10 mint vector. The lock key can commit an after leaf, so an unredeemed quote can be reclaimed after the locktime.`,
  ],
  [
    VJ_CapMultisig,
    `Framing: comparison. Multisig as a threshold leaf against an aggregated internal key. Witness sizes are computed from the vector shapes: 533 characters against 147. The trade is visibility and size against an interactive signing session.`,
  ],

  [VsBip341, 'Original slide.'],
  [
    VJ_BipBeginner,
    `Beginner. The same five-stage pipeline in both systems, stage by stage, then the worked vector underneath. Emphasise that only the constants and encodings change: tags, key size, reduce instead of reject.`,
  ],
  [
    VJ_BipAdvanced,
    `Advanced: porting pitfalls. Each wrong row is what BIP341 code produces on the worked example, computed. x-only key, TapTweak tag, even-y lifting and TapLeaf hashing each give a different secret. The bottom list covers rules no vector can catch.`,
  ],
  [
    VJ_BipGraphical,
    `Graphical. Two trees side by side: builder-chosen depths against the sorted fold with a promoted leaf; x-only Q against the 33-byte secret; reject against mod n. Let the labels arrive last.`,
  ],
  [
    VJ_BipBytes,
    `Explained via bytes. The three hash preimages as byte segments. Leaf: no 0xc0 and no length prefix, the leaf starts with its own version byte. Branch: identical shape. Tweak: 33 bytes of K instead of 32. Tag hashes are real SHA-256 values.`,
  ],
  [
    VJ_BipVerifier,
    `Perspective: the verifier. A Bitcoin node's script-path checks next to the mint's, in the order each spec lists them. The mint parses instead of executing, fails closed where Bitcoin succeeds for upgrades, and uses its own clock for after leaves.`,
  ],
  [
    VJ_BipWhy,
    `Framing: the constraint behind each difference. Only reasons the specification itself states. Tweak reduction has no stated reason, so it is not on this page.`,
  ],
  [
    VJ_BipSizes,
    `Framing: sizes. Keys, preimages, witnesses, paths and trees side by side. The witness character counts below are computed from compact JSON with the vector field sizes.`,
  ],

  [Comparison, 'Original slide.'],
  [
    VJ_CmpBeginner,
    `Beginner. One refund payment in both encodings. The JSON secret is 276 bytes with a 64-character nonce and shows the whole policy on every spend; the v3 secret is the vector's 33-byte point and the condition travels as spend info.`,
  ],
  [
    VJ_CmpAdvanced,
    `Advanced. The keyset version byte picks the rule set; the secret's shape never does. Four paired consequences: secret format, Y, signing, support. Mixed transactions are valid.`,
  ],
  [
    VJ_CmpGraphical,
    `Graphical. Secret sizes to scale, then how much of the policy each spend path shows in the refund example. The v3 key-path bar is empty on purpose.`,
  ],
  [
    VJ_CmpLifecycle,
    `Explained via a proof's lifecycle. Six stations from creating the output to checkstate, one track per secret family. The marker follows the station; compare the two cells under it.`,
  ],
  [
    VJ_CmpReceiver,
    `Perspective: receiving wallet. A JSON secret describes itself; a v3 secret needs spend info, and reconstructing the secret from it proves nothing is hidden. Then the three reasons to sweep.`,
  ],
  [
    VJ_CmpMigration,
    `Framing: migration. The mixed-keyset vector: a v3 input and a v0 input in one swap, only the v3 input signs an input digest, outputs on v3. Then the payment request carrying both nut10 and nutroot.`,
  ],
  [
    VJ_CmpParties,
    `Framing: what each party learns. Row by row, the mint at issuance, at spend, across spends, anyone with Y, and the receiver. Each nutroot cell is a statement from NUT-07, NUT-10 or NUT-28.`,
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · Using nutroot (temporary)',
  createdAt: '2026-09-28T09:01:00.000Z',
};
export default VJ_PAGES.map(([p]) => p) satisfies Page[];
export const notes = VJ_PAGES.map(([, n]) => n);
