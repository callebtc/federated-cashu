import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  Arrow,
  At,
  Band,
  Canvas,
  Cell,
  Code,
  Draw,
  EASE_IO,
  Edge,
  EASE_OUT,
  Fade,
  GFade,
  JsonLimits,
  JsonSecret,
  Label,
  Lifeline,
  M,
  MATH,
  MONO,
  Note,
  Packet,
  REDUCED,
  Row,
  SANS,
  StepItem,
  StepList,
  T,
  TaprootSpend,
  TaprootTree,
  Up,
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

// ─── Local helpers (VG_) ─────────────────────────────────────────────────────

const VG_enter = (show: boolean, delay = 0, dur = 450): CSSProperties => ({
  opacity: show ? 1 : 0,
  transform: show || REDUCED ? 'translateY(0px)' : 'translateY(8px)',
  transition: `opacity ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms, transform ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
});

/** Absolute card with an optional uppercase title. */
const VG_Card = ({
  x,
  y,
  w,
  h,
  title,
  tone = c.rule,
  show = true,
  on = false,
  dim = false,
  delay = 0,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  title?: ReactNode;
  tone?: string;
  show?: boolean;
  on?: boolean;
  dim?: boolean;
  delay?: number;
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
      border: `1.5px solid ${on ? c.clayHex : tone}`,
      background: c.card,
      borderRadius: 12,
      padding: '14px 20px',
      ...VG_enter(show, delay),
      opacity: show ? (dim ? 0.4 : 1) : 0,
    }}
  >
    {title && <Label color={on ? c.clayHex : tone === c.rule ? c.muted : tone}>{title}</Label>}
    <div style={{ marginTop: title ? 8 : 0 }}>{children}</div>
  </div>
);

/** A rule line with a check or a cross. */
const VG_Rule = ({ ok = true, size = 22, children }: { ok?: boolean; size?: number; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: size, lineHeight: 1.4 }}>
    <span style={{ color: ok ? c.good : c.bad, fontFamily: MONO, flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
    <span>{children}</span>
  </div>
);

/** One code line with an optional highlight. */
const VG_Line = ({
  on = false,
  size = 20,
  lh = 1.75,
  children,
}: {
  on?: boolean;
  size?: number;
  lh?: number;
  children: ReactNode;
}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: size,
      lineHeight: lh,
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

const VG_CodeBox = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      background: c.card,
      border: `1.5px solid ${c.rule}`,
      borderRadius: 12,
      padding: '14px 24px',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Title plus a monospace value, positioned absolutely. */
const VG_Box = ({
  x,
  y,
  w,
  title,
  value,
  show = true,
  on = false,
  tone = c.rule,
  delay = 0,
}: {
  x: number;
  y: number;
  w: number;
  title: ReactNode;
  value: ReactNode;
  show?: boolean;
  on?: boolean;
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
      border: `1.5px solid ${on ? c.clayHex : tone}`,
      background: c.card,
      borderRadius: 12,
      padding: '12px 20px',
      ...VG_enter(show, delay),
    }}
  >
    <div style={{ fontSize: 22, lineHeight: 1.3 }}>{title}</div>
    <div style={{ fontFamily: MONO, fontSize: 21, lineHeight: 1.4, marginTop: 6, whiteSpace: 'nowrap' }}>{value}</div>
  </div>
);

/** Byte chip with a label underneath. */
const VG_Chip = ({
  bytes,
  label,
  tone = c.rule,
  fill = c.card,
  show = true,
  hot = false,
  delay = 0,
}: {
  bytes: ReactNode;
  label?: ReactNode;
  tone?: string;
  fill?: string;
  show?: boolean;
  hot?: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginRight: 10,
      ...VG_enter(show, delay, 400),
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 20,
        padding: '6px 10px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${hot ? c.clayHex : tone}`,
        background: hot ? c.claySoft : fill,
        transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      {bytes}
    </span>
    {label && <span style={{ fontSize: 21, color: c.muted, marginTop: 6, whiteSpace: 'nowrap' }}>{label}</span>}
  </div>
);

/** Label/value row. */
const VG_Kv = ({ k, w = 120, on = false, children }: { k: ReactNode; w?: number; on?: boolean; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1.6 }}>
    <span style={{ width: w, flexShrink: 0, fontSize: 21, color: c.muted }}>{k}</span>
    <span style={{ fontFamily: MONO, fontSize: 20, color: on ? c.clayHex : c.ink, transition: `color 300ms ${EASE_OUT}` }}>
      {children}
    </span>
  </div>
);

/** A polyline that draws itself. */
const VG_Path = ({
  d,
  len,
  show,
  color = c.muted,
  width = 2,
  delay = 0,
  dashed = false,
}: {
  d: string;
  len: number;
  show: boolean;
  color?: string;
  width?: number;
  delay?: number;
  dashed?: boolean;
}) =>
  dashed ? (
    <GFade show={show} delay={delay}>
      <path d={d} style={{ fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: '6 6' }} />
    </GFade>
  ) : (
    <path
      d={d}
      style={{
        fill: 'none',
        stroke: color,
        strokeWidth: width,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeDasharray: len,
        strokeDashoffset: show ? 0 : len,
        transition: `stroke-dashoffset ${REDUCED ? 0 : 900}ms ${EASE_IO} ${show ? delay : 0}ms`,
      }}
    />
  );

/** Arrowhead at (x, y) pointing along angle a (radians). */
const VG_Head = ({ x, y, a, show, color = c.muted, delay = 0 }: { x: number; y: number; a: number; show: boolean; color?: string; delay?: number }) => {
  const s = 13;
  const p1 = `${x - s * Math.cos(a - 0.45)},${y - s * Math.sin(a - 0.45)}`;
  const p2 = `${x - s * Math.cos(a + 0.45)},${y - s * Math.sin(a + 0.45)}`;
  return (
    <polyline
      points={`${p1} ${x},${y} ${p2}`}
      style={{
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        opacity: show ? 1 : 0,
        transition: `opacity 200ms ${EASE_OUT} ${show ? delay : 0}ms`,
      }}
    />
  );
};

/** SVG rounded box with centred text. */
const VG_SBox = ({
  x,
  y,
  w,
  h,
  label,
  show = true,
  tone = c.node,
  fill = c.card,
  font = 'sans',
  size = 22,
  color = c.ink,
  dashed = false,
  delay = 0,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: ReactNode;
  show?: boolean;
  tone?: string;
  fill?: string;
  font?: 'sans' | 'mono' | 'math';
  size?: number;
  color?: string;
  dashed?: boolean;
  delay?: number;
}) => (
  <GFade show={show} delay={delay}>
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={10}
      style={{
        fill,
        stroke: tone,
        strokeWidth: 1.75,
        strokeDasharray: dashed ? '6 6' : 'none',
        transition: `stroke 300ms ${EASE_OUT}, fill 300ms ${EASE_OUT}`,
      }}
    />
    {label && (
      <text
        x={x + w / 2}
        y={y + h / 2 + size * 0.34}
        textAnchor="middle"
        style={{
          fontFamily: font === 'mono' ? MONO : font === 'math' ? MATH : SANS,
          fontStyle: font === 'math' ? 'italic' : 'normal',
          fontSize: size,
          fill: color,
        }}
      >
        {label}
      </text>
    )}
  </GFade>
);

/** SVG hash node. */
const VG_Node = ({
  x,
  y,
  r = 30,
  label,
  tone = c.node,
  fill = c.card,
  show = true,
  faint = false,
  dashed = false,
  delay = 0,
  size = 24,
  font = 'mono',
}: {
  x: number;
  y: number;
  r?: number;
  label?: ReactNode;
  tone?: string;
  fill?: string;
  show?: boolean;
  faint?: boolean;
  dashed?: boolean;
  delay?: number;
  size?: number;
  font?: 'mono' | 'math' | 'sans';
}) => (
  <g
    style={{
      opacity: show ? (faint ? 0.25 : 1) : 0,
      transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms`,
    }}
  >
    <circle cx={x} cy={y} r={r} style={{ fill: c.card }} />
    <circle
      cx={x}
      cy={y}
      r={r}
      style={{
        fill,
        stroke: tone,
        strokeWidth: 2,
        strokeDasharray: dashed ? '5 5' : 'none',
        transition: `stroke 300ms ${EASE_OUT}, fill 300ms ${EASE_OUT}`,
      }}
    />
    {label && (
      <text
        x={x}
        y={y + size * 0.34}
        textAnchor="middle"
        style={{
          fontFamily: font === 'mono' ? MONO : font === 'math' ? MATH : SANS,
          fontStyle: font === 'math' ? 'italic' : 'normal',
          fontSize: size,
          fill: c.ink,
        }}
      >
        {label}
      </text>
    )}
  </g>
);

const VG_Glyph = ({ ok }: { ok: boolean | null }) =>
  ok === null ? (
    <span style={{ color: c.dim }}>–</span>
  ) : (
    <span style={{ color: ok ? c.good : c.bad, fontFamily: MONO }}>{ok ? '✓' : '✗'}</span>
  );

/** A group of rules with a left rule that turns clay when active. */
const VG_Group = ({ title, on, children }: { title: string; on: boolean; children: ReactNode }) => (
  <div
    style={{
      borderLeft: `3px solid ${on ? c.clayHex : c.rule}`,
      padding: '6px 0 6px 18px',
      marginBottom: 14,
      transition: `border-color 300ms ${EASE_OUT}`,
    }}
  >
    <Label color={on ? c.clayHex : c.muted}>{title}</Label>
    {children}
  </div>
);

// ─── Data ────────────────────────────────────────────────────────────────────
// NUT-11 example secret (195 bytes). Byte runs for the byte-level pages.

type VG_Kind = 'syn' | 'kind' | 'nonce' | 'data' | 'tags' | 'esc';
type VG_Run = [string, VG_Kind];
const VG_NONCE = '859d4935c4907062a6297cf4e663e2835d90d97ecdd510745d32f6816323a41f';
const VG_DATA = '0249098aa8b9d2fbec49ff8598feb17b592b986e62319a4fa488a3dc36387157a7';
const VG_RUNS: VG_Run[] = [
  ['["', 'syn'],
  ['P2PK', 'kind'],
  ['",{"nonce":"', 'syn'],
  [VG_NONCE, 'nonce'],
  ['","data":"', 'syn'],
  [VG_DATA, 'data'],
  ['","tags":', 'syn'],
  ['[["sigflag","SIG_INPUTS"]]', 'tags'],
  ['}]', 'syn'],
];
/** The same runs as they appear inside the proof JSON: every quote escaped, plus enclosing quotes. */
const VG_escapeRuns = (runs: VG_Run[]): VG_Run[] => {
  const out: VG_Run[] = [['"', 'syn']];
  for (const [t, k] of runs) {
    let buf = '';
    for (const ch of t) {
      if (ch === '"') {
        if (buf) out.push([buf, k]);
        out.push(['\\', 'esc']);
        buf = '"';
      } else {
        buf += ch;
      }
    }
    if (buf) out.push([buf, k]);
  }
  out.push(['"', 'syn']);
  return out;
};
const VG_ESC_RUNS = VG_escapeRuns(VG_RUNS);

const VG_RUN_FILL: Record<VG_Kind, string> = {
  syn: c.panel,
  kind: c.claySoft,
  nonce: c.coolSoft,
  data: 'rgba(122, 95, 166, 0.14)',
  tags: c.goodSoft,
  esc: c.bad,
};
const VG_RUN_EDGE: Record<VG_Kind, string> = {
  syn: c.line,
  kind: c.clayHex,
  nonce: c.cool,
  data: c.violet,
  tags: c.good,
  esc: c.bad,
};

/** Proportional byte strip: one run per contiguous field. */
const VG_Strip = ({ runs, px, h = 44, show = true }: { runs: VG_Run[]; px: number; h?: number; show?: boolean }) => {
  const offsets: number[] = [];
  let acc = 0;
  for (const [t] of runs) {
    offsets.push(acc);
    acc += t.length;
  }
  return (
    <div style={{ position: 'relative', height: h, width: acc * px, ...VG_enter(show, 0, 500) }}>
      {runs.map(([t, k], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: offsets[i] * px,
            top: 0,
            width: t.length * px,
            height: h,
            boxSizing: 'border-box',
            background: VG_RUN_FILL[k],
            border: `1px solid ${VG_RUN_EDGE[k]}`,
          }}
        />
      ))}
    </div>
  );
};

/** Caption without uppercase, for labels that contain identifiers. */
const VG_Cap = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 22, color: c.muted }}>{children}</div>
);

/** Centred caption under a strip position (in bytes). */
const VG_StripLabel = ({ at, px, children, color = c.muted }: { at: number; px: number; children: ReactNode; color?: string }) => (
  <div
    style={{
      position: 'absolute',
      left: at * px - 110,
      width: 220,
      textAlign: 'center',
      fontSize: 21,
      color,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// 2.1 NUT-10 well-known secrets
// ═════════════════════════════════════════════════════════════════════════════

const VG_OF_JS = '2.1 NUT-10 well-known secrets';

// ─── Beginner ────────────────────────────────────────────────────────────────

const VG_JsBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_JS} lens="Beginner" title="Plain secret and locked secret" proc={proc}>
      <VG_Card x={120} y={256} w={520} title="Plain proof (NUT-00 example)" on={s === 1}>
        <VG_Kv k="amount">2</VG_Kv>
        <VG_Kv k="id">009a1f293253e41e</VG_Kv>
        <VG_Kv k="secret" on={s === 1}>
          407915bc…768a7837
        </VG_Kv>
        <VG_Kv k="C">02bc9097…0cf85163ea</VG_Kv>
      </VG_Card>
      <At x={120} y={484} w={520}>
        <Fade show={s >= 1}>
          <Note>
            The secret is 32 random bytes written as 64 hex characters. Whoever holds the proof can spend it.
          </Note>
        </Fade>
      </At>
      <VG_Card x={680} y={256} w={660} title="Locked proof (NUT-11 example)" show={s >= 2} on={s === 2 || s === 4}>
        <div style={{ fontSize: 21, color: c.muted }}>secret</div>
        <VG_Line>{'['}</VG_Line>
        <VG_Line on={s === 3}>
          {'  "P2PK",'}
          <VG_Tag show={s >= 3}>kind: the rule</VG_Tag>
        </VG_Line>
        <VG_Line>{'  {'}</VG_Line>
        <VG_Line on={s === 3}>
          {'    "nonce": "859d4935…6323a41f",'}
          <VG_Tag show={s >= 3}>unique</VG_Tag>
        </VG_Line>
        <VG_Line on={s === 3}>
          {'    "data": "0249098a…387157a7",'}
          <VG_Tag show={s >= 3}>receiver key</VG_Tag>
        </VG_Line>
        <VG_Line on={s === 3}>
          {'    "tags": [["sigflag", "SIG_INPUTS"]]'}
          <VG_Tag show={s >= 3}>options</VG_Tag>
        </VG_Line>
        <VG_Line>{'  }'}</VG_Line>
        <VG_Line>{']'}</VG_Line>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 6 }}>witness</div>
        <VG_Line on={s === 4}>{'{"signatures": ["60f3c9b7…b59e1383"]}'}</VG_Line>
      </VG_Card>
      <VG_Card x={120} y={732} w={390} h={132} title="Mint signature">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>C matches the secret.</div>
      </VG_Card>
      <VG_Card x={535} y={732} w={390} h={132} title="Not spent before">
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>The mint has not seen this secret.</div>
      </VG_Card>
      <VG_Card x={950} y={732} w={390} h={132} title="Rule in the secret" tone={c.clayHex} show={s >= 4} on={s === 4}>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>A signature by the key in data.</div>
      </VG_Card>
      <At x={120} y={892} w={1220}>
        <Fade show={s >= 5}>
          <Note>
            The mint enforces the rule only if it supports the kind (listed in its NUT-06 info). Otherwise anyone
            holding the proof can spend it.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Plain proof: the secret is random. Holding the proof is enough to spend it.
        </StepItem>
        <StepItem n={2} step={s}>
          Locked proof: the secret is a JSON text that names a rule.
        </StepItem>
        <StepItem n={3} step={s}>
          <Code>kind</Code> names the rule, <Code>nonce</Code> keeps the secret unique, <Code>data</Code> is the
          receiver's key.
        </StepItem>
        <StepItem n={4} step={s}>
          To spend, the receiver signs the secret string. The signature goes in <Code>witness</Code>.
        </StepItem>
        <StepItem n={5} step={s}>
          The rule holds only at a mint that supports it.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

/** Small inline annotation after a code line. */
const VG_Tag = ({ show, children }: { show: boolean; children: ReactNode }) => (
  <span
    style={{
      fontFamily: SANS,
      fontSize: 21,
      color: c.clayHex,
      marginLeft: 14,
      opacity: show ? 1 : 0,
      transition: `opacity 400ms ${EASE_OUT}`,
    }}
  >
    ← {children}
  </span>
);

// ─── Advanced ────────────────────────────────────────────────────────────────

const VG_JsAdvanced: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_JS} lens="Advanced" title="Parsing and signing rules (NUT-10, NUT-11)" proc={proc}>
      <At x={120} y={256} w={580}>
        <VG_CodeBox>
          <VG_Line>{'['}</VG_Line>
          <VG_Line on={s === 1}>{'  "P2PK",'}</VG_Line>
          <VG_Line>{'  {'}</VG_Line>
          <VG_Line on={s === 1}>{'    "nonce": "da627964…53ed3746",'}</VG_Line>
          <VG_Line on={s === 3}>{'    "data": "033281c3…6099c26e",'}</VG_Line>
          <VG_Line on={s === 1}>{'    "tags": ['}</VG_Line>
          <VG_Line on={s === 2 || s === 4}>{'      ["sigflag", "SIG_ALL"],'}</VG_Line>
          <VG_Line on={s === 2}>{'      ["n_sigs", "2"],'}</VG_Line>
          <VG_Line on={s === 2}>{'      ["locktime", "1689418329"],'}</VG_Line>
          <VG_Line on={s === 3}>{'      ["refund", "033281c3…", "02e2aeb9…"],'}</VG_Line>
          <VG_Line on={s === 3}>{'      ["pubkeys", "02698c4e…", "02319220…"]'}</VG_Line>
          <VG_Line>{'    ]'}</VG_Line>
          <VG_Line>{'  }'}</VG_Line>
          <VG_Line>{']'}</VG_Line>
        </VG_CodeBox>
        <Note style={{ marginTop: 14 }}>
          NUT-11 complex example: 2-of-3 over data and pubkeys; after the locktime also 1-of-2 refund.
        </Note>
      </At>
      <At x={740} y={256} w={1060}>
        <VG_Group title="Structure · NUT-10" on={s === 1}>
          <VG_Rule>
            A JSON array <Code>[kind, {'{'}nonce, data, tags{'}'}]</Code>; tags are arrays of non-empty strings.
          </VG_Rule>
          <VG_Rule ok={false}>
            Invalid tags: <Code>[]</Code> · <Code>["locktime", 1765300829]</Code> · <Code>["locktime", ""]</Code>
          </VG_Rule>
        </VG_Group>
        <VG_Group title="Tags · NUT-11" on={s === 2}>
          <VG_Rule>Each tag at most once. A repeated tag makes the proof unspendable.</VG_Rule>
          <VG_Rule>
            <Code>n_sigs</Code>, <Code>n_sigs_refund</Code>: positive integers, at most the keys in their pathway.
          </VG_Rule>
          <VG_Rule>
            <Code>sigflag</Code> is <Code>SIG_INPUTS</Code> (default) or <Code>SIG_ALL</Code>. Other values:
            malformed.
          </VG_Rule>
        </VG_Group>
        <VG_Group title="Keys" on={s === 3}>
          <VG_Rule>Compressed keys, compared by lowercase x-coordinate; the 02/03 prefix is ignored.</VG_Rule>
          <VG_Rule>
            A key at most once per pathway. It may appear in both: here <Code>033281c3…</Code>
          </VG_Rule>
        </VG_Group>
        <VG_Group title="Signatures" on={s === 4}>
          <VG_Rule>Message: the unescaped secret string, or the SIG_ALL concatenation.</VG_Rule>
          <VG_Rule>64-byte Schnorr over SHA256(message). Count distinct keys with a valid signature.</VG_Rule>
        </VG_Group>
        <VG_Group title="Scope" on={s === 5}>
          <VG_Rule ok={false}>Mint without NUT-11 support: the proof may be treated as anyone-can-spend.</VG_Rule>
          <VG_Rule>Keysets 00 and 01 only. Keysets 02 and later reject any non-point secret.</VG_Rule>
        </VG_Group>
      </At>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VG_JsGraphical: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_JS} lens="Graphical" title="Three layers around one string" proc={proc}>
      <Canvas>
        {/* outer: proof JSON */}
        <VG_SBox x={140} y={290} w={840} h={640} tone={c.line} fill={c.panel} show={s >= 3} />
        <T x={170} y={332} anchor="start" size={22} color={c.muted} show={s >= 3}>
          Proof JSON · every quote escaped
        </T>
        <VG_SBox x={230} y={790} w={110} h={56} label="C" font="mono" show={s >= 3} delay={80} />
        <VG_SBox x={360} y={790} w={110} h={56} label="id" font="mono" show={s >= 3} delay={120} />
        <VG_SBox x={490} y={790} w={150} h={56} label="amount" font="mono" show={s >= 3} delay={160} />
        <VG_SBox
          x={660}
          y={790}
          w={220}
          h={56}
          label="witness"
          font="mono"
          tone={s >= 5 ? c.clayHex : c.node}
          show={s >= 3}
          delay={200}
        />
        {/* middle: the string */}
        <VG_SBox x={200} y={370} w={720} h={340} tone={c.clayHex} fill={c.card} show={s >= 2} />
        <T x={230} y={412} anchor="start" size={22} color={c.clayHex} show={s >= 2}>
          secret: one string, 195 bytes
        </T>
        {/* inner: JSON array */}
        <VG_SBox x={250} y={450} w={620} h={220} tone={c.node} fill={c.card} show={s >= 1} />
        <T x={280} y={494} anchor="start" size={22} color={c.muted} show={s >= 1}>
          JSON array
        </T>
        <VG_SBox x={280} y={560} w={120} h={60} label="P2PK" font="mono" tone={c.clayHex} fill={c.claySoft} show={s >= 1} delay={60} />
        <VG_SBox x={420} y={560} w={130} h={60} label="nonce" font="mono" show={s >= 1} delay={100} />
        <VG_SBox x={570} y={560} w={130} h={60} label="data" font="mono" show={s >= 1} delay={140} />
        <VG_SBox x={720} y={560} w={120} h={60} label="tags" font="mono" show={s >= 1} delay={180} />
        {/* right: hash_to_curve */}
        <Arrow x1={920} y1={480} x2={1076} y2={480} show={s >= 4} color={c.clayHex} />
        <Packet x1={920} y1={480} x2={1076} y2={480} run={proc.anim && s === 4} color={c.clayHex} delay={200} />
        <VG_SBox x={1080} y={450} w={300} h={60} label="hash_to_curve" font="mono" show={s >= 4} delay={300} />
        <Arrow x1={1380} y1={480} x2={1496} y2={480} show={s >= 4} color={c.clayHex} delay={400} />
        <VG_Node x={1536} y={480} r={36} label="Y" font="math" size={32} tone={c.clayHex} show={s >= 4} delay={700} />
        <T x={1596} y={492} anchor="start" size={32} font="math" show={s >= 4} delay={800}>
          k·Y = C
        </T>
        {/* right: signature */}
        <Arrow x1={920} y1={640} x2={1076} y2={640} show={s >= 5} color={c.cool} />
        <Packet x1={920} y1={640} x2={1076} y2={640} run={proc.anim && s === 5} color={c.cool} delay={200} />
        <VG_SBox x={1080} y={610} w={300} h={60} label="SHA-256" font="mono" show={s >= 5} delay={300} />
        <Arrow x1={1380} y1={640} x2={1476} y2={640} show={s >= 5} color={c.cool} delay={400} />
        <VG_SBox x={1480} y={610} w={320} h={60} label="Schnorr, 64 B" show={s >= 5} tone={c.cool} delay={600} />
        <VG_Path d="M 1640 670 L 1640 818 L 890 818" len={900} show={s >= 5} color={c.cool} delay={800} />
        <VG_Head x={890} y={818} a={Math.PI} show={s >= 5} color={c.cool} delay={1500} />
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via bytes ─────────────────────────────────────────────────────

const VG_PX = 5.7;

const VG_JsBytes: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_JS} lens="Explained via bytes" title="The P2PK secret, byte by byte" proc={proc}>
      <At x={120} y={256} w={1220}>
        <VG_Cap>Proof.secret: 195 bytes of UTF-8</VG_Cap>
      </At>
      <At x={120} y={296} w={1220}>
        <VG_Strip runs={VG_RUNS} px={VG_PX} show={s >= 1} />
      </At>
      <At x={120} y={350} w={1220}>
        <Fade show={s >= 1}>
          <div style={{ position: 'relative', height: 30 }}>
            <VG_StripLabel at={6} px={VG_PX} color={c.clayHex}>
              kind 4
            </VG_StripLabel>
            <VG_StripLabel at={50} px={VG_PX} color={c.cool}>
              nonce 64
            </VG_StripLabel>
            <VG_StripLabel at={125} px={VG_PX} color={c.violet}>
              data 66
            </VG_StripLabel>
            <VG_StripLabel at={180} px={VG_PX} color={c.good}>
              tags 26
            </VG_StripLabel>
          </div>
        </Fade>
      </At>
      <At x={120} y={412} w={1220}>
        <Fade show={s >= 2}>
          <VG_Cap>
            Inside the proof JSON: 213 characters, 16 <span style={{ color: c.bad }}>backslashes</span> and 2 enclosing
            quotes added
          </VG_Cap>
        </Fade>
      </At>
      <At x={120} y={452} w={1220}>
        <VG_Strip runs={VG_ESC_RUNS} px={VG_PX} show={s >= 2} />
      </At>
      <At x={120} y={548} w={1220}>
        <Fade show={s >= 3}>
          <VG_Cap>Y = hash_to_curve(secret), NUT-00</VG_Cap>
          <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.6, marginTop: 8 }}>
            <div>msg_hash = SHA256("Secp256k1_HashToCurve_Cashu_" ‖ secret) = 68be7c63…c4356c96</div>
            <div>
              counter 0: no point · counter 1: Y = <span style={{ color: c.clayHex }}>02561ea0cc7fc3ea…3641840fa2a9</span>
            </div>
          </div>
        </Fade>
      </At>
      <At x={120} y={700} w={1220}>
        <Fade show={s >= 4}>
          <VG_Cap>Signed message, NUT-11</VG_Cap>
          <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.6, marginTop: 8 }}>
            <div>
              SHA256(secret) = <span style={{ color: c.cool }}>6eebbc3ac319f417…2e4b5f446c</span>
            </div>
            <div>
              BIP340 verify, key 49098aa8…387157a7, sig 60f3c9b7…b59e1383 <span style={{ color: c.good }}>✓</span>
            </div>
          </div>
        </Fade>
      </At>
      <At x={120} y={858} w={1220}>
        <Fade show={s >= 5}>
          <Note>
            130 of the 195 bytes are hex digits that encode 65 binary bytes: the 32-byte nonce and the 33-byte key.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The secret is 195 bytes: 35 of JSON syntax and 160 of values.
        </StepItem>
        <StepItem n={2} step={s}>
          In the proof JSON every quote is escaped again: 213 characters on the wire.
        </StepItem>
        <StepItem n={3} step={s}>
          The mint hashes the 195 bytes with a domain separator, then counts up until x is on the curve.
        </StepItem>
        <StepItem n={4} step={s}>
          The signature covers SHA-256 of the same 195 bytes.
        </StepItem>
        <StepItem n={5} step={s}>
          Hex encoding doubles the size of the binary values.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: mint ───────────────────────────────────────────────────────

const VG_MintRow = ({ n, s, fn, children }: { n: number; s: number; fn: ReactNode; children: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      height: 52,
      borderBottom: `1px solid ${c.rule}`,
      ...VG_enter(s >= n, 0, 400),
    }}
  >
    <span style={{ width: 34, fontFamily: MONO, fontSize: 20, color: s === n ? c.clayHex : c.muted }}>{n}</span>
    <span style={{ width: 346, fontFamily: MONO, fontSize: 20, color: s === n ? c.clayHex : c.ink }}>{fn}</span>
    <span style={{ fontFamily: MONO, fontSize: 20 }}>{children}</span>
  </div>
);

const VG_JsMint: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_JS} lens="Perspective: mint" title="Redeeming a P2PK proof in CDK" proc={proc}>
      <At x={120} y={256} w={1220}>
        <VG_CodeBox>
          <VG_Line>{'{'}</VG_Line>
          <VG_Line on={s === 1 || s === 2}>{'  "amount": 1, "id": "009a1f293253e41e",'}</VG_Line>
          <VG_Line on={s === 1 || s === 3}>{'  "secret": "[\\"P2PK\\",{\\"nonce\\":\\"859d4935…\\",\\"data\\":\\"0249098a…\\",'}</VG_Line>
          <VG_Line on={s === 1 || s === 3}>{'             \\"tags\\":[[\\"sigflag\\",\\"SIG_INPUTS\\"]]}]",'}</VG_Line>
          <VG_Line on={s === 2}>{'  "C": "02698c4e2b5f9534cd0687d87513c759790cf829aa5739184a3e3735471fbda904",'}</VG_Line>
          <VG_Line on={s === 1 || s === 4}>{'  "witness": "{\\"signatures\\":[\\"60f3c9b7…b59e1383\\"]}"'}</VG_Line>
          <VG_Line>{'}'}</VG_Line>
        </VG_CodeBox>
      </At>
      <At x={120} y={574} w={1220}>
        <VG_MintRow n={1} s={s} fn="verify_inputs">
          1 input · secret 195 chars ≤ 1024 · witness ≤ 1024
        </VG_MintRow>
        <VG_MintRow n={2} s={s} fn="verify_proofs">
          Y = 02561ea0…840fa2a9 · C = k·Y
        </VG_MintRow>
        <VG_MintRow n={3} s={s} fn="verify_spending_conditions">
          P2PK · SIG_INPUTS: this input alone
        </VG_MintRow>
        <VG_MintRow n={4} s={s} fn="P2PK witness">
          SHA256(secret) = 6eebbc3a… · sig by 49098aa8… <span style={{ color: c.good }}>✓</span>
        </VG_MintRow>
        <VG_MintRow n={5} s={s} fn="swap saga">
          Y pending → outputs signed → Y spent
        </VG_MintRow>
      </At>
      <At x={120} y={874} w={1220}>
        <Note style={{ fontSize: 21 }}>
          <Code>crates/cdk/src/mint/swap/mod.rs</Code> (process_swap_request),{' '}
          <Code>crates/cashu/src/nuts/nut10/mod.rs</Code>
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Limits: input count, secret and witness at most 1024 characters, no duplicate inputs.
        </StepItem>
        <StepItem n={2} step={s}>
          The mint signature: <M>C</M> must equal <M>k·Y</M> for the amount's key.
        </StepItem>
        <StepItem n={3} step={s}>
          Parse the NUT-10 secret. One SIG_ALL input switches to the joint check.
        </StepItem>
        <StepItem n={4} step={s}>
          Signatures over SHA256(secret) from at least <Code>n_sigs</Code> distinct listed keys.
        </StepItem>
        <StepItem n={5} step={s}>
          <M>Y</M> stored as pending (a known <M>Y</M> fails), outputs signed, <M>Y</M> marked spent.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: failure mode ───────────────────────────────────────────────────

const VG_Sp = ({ on }: { on: boolean }) => (
  <span
    style={{
      background: on ? 'rgba(217, 119, 87, 0.35)' : 'transparent',
      borderRadius: 3,
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    {' '}
  </span>
);

const VG_JS_FW = [330, 100, 270, 270, 250];

const VG_JsFailure: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  const h = s >= 2;
  return (
    <VarShell of={VG_OF_JS} lens="Framing: failure mode" title="Re-serializing the secret breaks the proof" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Label>As issued · 195 bytes</Label>
        <VG_CodeBox style={{ marginTop: 8, padding: '10px 20px' }}>
          <VG_Line lh={1.5}>{'["P2PK",{"nonce":"859d…a41f","data":"0249…57a7","tags":[["sigflag","SIG_INPUTS"]]}]'}</VG_Line>
        </VG_CodeBox>
      </At>
      <At x={120} y={384} w={1220}>
        <Fade show={s >= 2}>
          <Label color={c.clayHex}>Parsed and serialized again · 202 bytes, same JSON value</Label>
          <VG_CodeBox style={{ marginTop: 8, padding: '10px 20px' }}>
            <VG_Line lh={1.5}>
              {'["P2PK",'}
              <VG_Sp on={h} />
              {'{"nonce":'}
              <VG_Sp on={h} />
              {'"859d…a41f",'}
              <VG_Sp on={h} />
              {'"data":'}
              <VG_Sp on={h} />
              {'"0249…57a7",'}
              <VG_Sp on={h} />
              {'"tags":'}
              <VG_Sp on={h} />
              {'[["sigflag",'}
              <VG_Sp on={h} />
              {'"SIG_INPUTS"]]}]'}
            </VG_Line>
          </VG_CodeBox>
        </Fade>
      </At>
      <At x={120} y={540} w={1220}>
        <Row i={0} head>
          <Cell head w={VG_JS_FW[0]}> </Cell>
          <Cell head w={VG_JS_FW[1]}>bytes</Cell>
          <Cell head w={VG_JS_FW[2]}>SHA-256</Cell>
          <Cell head w={VG_JS_FW[3]}>Y</Cell>
          <Cell head w={VG_JS_FW[4]}>result</Cell>
        </Row>
        <Fade show={s >= 1}>
          <Row i={1}>
            <Cell w={VG_JS_FW[0]} color={c.muted}>as issued</Cell>
            <Cell w={VG_JS_FW[1]}>195</Cell>
            <Cell w={VG_JS_FW[2]}><Code>6eebbc3a…4b5f446c</Code></Cell>
            <Cell w={VG_JS_FW[3]}><Code>02561ea0…840fa2a9</Code></Cell>
            <Cell w={VG_JS_FW[4]} color={c.good}>valid</Cell>
          </Row>
        </Fade>
        <Fade show={s >= 3}>
          <Row i={2}>
            <Cell w={VG_JS_FW[0]} color={c.muted}>serialized again</Cell>
            <Cell w={VG_JS_FW[1]}>202</Cell>
            <Cell w={VG_JS_FW[2]}><Code>32dca537…9cf22d73</Code></Cell>
            <Cell w={VG_JS_FW[3]}><Code>02788f86…b050a318</Code></Cell>
            <Cell w={VG_JS_FW[4]} color={c.bad}><M>C ≠ k·Y′</M></Cell>
          </Row>
        </Fade>
        <Fade show={s >= 4}>
          <Row i={3}>
            <Cell w={VG_JS_FW[0]} color={c.muted}>escaped text signed</Cell>
            <Cell w={VG_JS_FW[1]}>211</Cell>
            <Cell w={VG_JS_FW[2]}><Code>30ff61eb…ad51eecf</Code></Cell>
            <Cell w={VG_JS_FW[3]}><Code>02561ea0…840fa2a9</Code></Cell>
            <Cell w={VG_JS_FW[4]} color={c.bad}>signature fails</Cell>
          </Row>
        </Fade>
      </At>
      <At x={120} y={840} w={1220}>
        <Fade show={s >= 4}>
          <Note>
            NUT-11: the secret is signed as a string, and the message MUST be the unescaped secret string. Wallets keep
            the secret bytes exactly as issued.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The mint signed <M>Y</M> of exactly these 195 bytes.
        </StepItem>
        <StepItem n={2} step={s}>
          A wallet parses the JSON and serializes it again: same value, 7 added spaces.
        </StepItem>
        <StepItem n={3} step={s}>
          New bytes give a new <M>Y′</M> and a new SHA-256. <M>C</M> no longer verifies.
        </StepItem>
        <StepItem n={4} step={s}>
          Signing the escaped transport text changes the message. The signature fails.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: the constraint that forces the design ──────────────────────────

const VG_JsConstraint: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell
      of={VG_OF_JS}
      lens="Framing: the constraint that forces the design"
      title="Why the condition lives inside the secret"
      proc={proc}
    >
      <Canvas>
        <Lifeline x={330} label="wallet" top={292} bottom={930} color={c.cool} />
        <Lifeline x={1050} label="mint" top={292} bottom={930} color={c.clayHex} />
        <Arrow x1={330} y1={370} x2={1050} y2={370} show={s >= 1} color={c.cool} label="B′ = Y + r·G" />
        <Packet x1={330} y1={370} x2={1050} y2={370} run={proc.anim && s === 1} delay={200} />
        <Arrow x1={1050} y1={450} x2={330} y2={450} show={s >= 1} color={c.clayHex} label="C′ = k·B′" delay={700} />
        <Packet x1={1050} y1={450} x2={330} y2={450} run={proc.anim && s === 1} color={c.clayHex} delay={900} />
        <T x={1072} y={378} anchor="start" size={22} color={c.muted} show={s >= 1} delay={300}>
          sees B′ only
        </T>
        <Band x1={180} x2={1200} y={660} label="redemption, possibly by another holder" show={s >= 4} />
        <Arrow x1={330} y1={750} x2={1050} y2={750} show={s >= 4} color={c.cool} label="secret, C, witness" font="sans" />
        <Packet x1={330} y1={750} x2={1050} y2={750} run={proc.anim && s === 4} delay={200} />
        <T x={1072} y={758} anchor="start" size={22} color={c.muted} show={s >= 4} delay={300}>
          sees the policy
        </T>
      </Canvas>
      <At x={360} y={500} w={660}>
        <Fade show={s >= 2}>
          <M size={30}>
            C = C′ − r·K = k·Y,&nbsp;&nbsp;Y = <Up>hash_to_curve</Up>(secret)
          </M>
        </Fade>
        <Fade show={s >= 3} style={{ marginTop: 14 }}>
          <div
            style={{
              display: 'inline-block',
              border: `1.5px solid ${c.clayHex}`,
              background: c.claySoft,
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 22,
            }}
          >
            The only bytes <M>C</M> commits to: the secret
          </div>
        </Fade>
      </At>
      <At x={660} y={800} w={680}>
        <Fade show={s >= 4}>
          <VG_CodeBox style={{ padding: '10px 18px' }}>
            <div style={{ fontSize: 22, lineHeight: 1.45 }}>
              Parse <Code>kind</Code>, enforce <Code>data</Code> and <Code>tags</Code>, check the witness.
            </div>
          </VG_CodeBox>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Issuance is blind: the mint signs <M>B′</M> and never sees the secret.
        </StepItem>
        <StepItem n={2} step={s}>
          After unblinding, <M>C</M> binds exactly the bytes behind <M>Y</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          A condition the mint can enforce must be inside those bytes.
        </StepItem>
        <StepItem n={4} step={s}>
          At redemption the secret is revealed and the mint enforces it.
        </StepItem>
        <StepItem n={5} step={s}>
          Consequences: the full policy is revealed, the secret grows with it, the mint must support the kind.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 2.1 Conditions as tags: HTLC (NUT-14)
// ═════════════════════════════════════════════════════════════════════════════

const VG_OF_HT = '2.1 Conditions as tags: HTLC (NUT-14)';

// ─── Beginner ────────────────────────────────────────────────────────────────

const VG_Explain = ({
  n,
  s,
  field,
  children,
  mono,
}: {
  n: number;
  s: number;
  field: string;
  children: ReactNode;
  mono?: ReactNode;
}) => (
  <div
    style={{
      borderLeft: `3px solid ${s === n ? c.clayHex : c.rule}`,
      padding: '4px 0 4px 18px',
      marginBottom: 16,
      transition: `border-color 300ms ${EASE_OUT}`,
      ...VG_enter(s >= n, 0, 400),
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 20, color: c.clayHex }}>{field}</div>
    <div style={{ fontSize: 22, lineHeight: 1.4 }}>{children}</div>
    {mono && <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.5, color: c.muted }}>{mono}</div>}
  </div>
);

const VG_HtBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_HT} lens="Beginner" title="An HTLC, field by field" proc={proc}>
      <At x={120} y={256} w={560}>
        <VG_CodeBox>
          <VG_Line>{'['}</VG_Line>
          <VG_Line>{'  "HTLC",'}</VG_Line>
          <VG_Line>{'  {'}</VG_Line>
          <VG_Line>{'    "nonce": "da627964…53ed3746",'}</VG_Line>
          <VG_Line on={s === 1}>{'    "data": "02319220…3ca6c50c",'}</VG_Line>
          <VG_Line>{'    "tags": ['}</VG_Line>
          <VG_Line on={s === 2}>{'      ["pubkeys", "02698c4e…71fbda904"],'}</VG_Line>
          <VG_Line on={s === 3}>{'      ["locktime", "1689418329"],'}</VG_Line>
          <VG_Line on={s === 4}>{'      ["refund", "033281c3…6099c26e"]'}</VG_Line>
          <VG_Line>{'    ]'}</VG_Line>
          <VG_Line>{'  }'}</VG_Line>
          <VG_Line>{']'}</VG_Line>
        </VG_CodeBox>
        <Note style={{ marginTop: 10, fontSize: 21 }}>NUT-14 example secret.</Note>
      </At>
      <At x={720} y={256} w={620}>
        <VG_Explain n={1} s={s} field="data" mono="SHA256(00…01) = ec4916dd…cbfaac8bc5">
          SHA-256 of a secret 32-byte preimage. Example pair from NUT-14:
        </VG_Explain>
        <VG_Explain n={2} s={s} field="pubkeys">
          The receiver: shows the preimage and signs.
        </VG_Explain>
        <VG_Explain n={3} s={s} field="locktime" mono="1689418329 = 2023-07-15 10:52:09 UTC">
          A deadline in Unix seconds, written as a string.
        </VG_Explain>
        <VG_Explain n={4} s={s} field="refund">
          The sender: may sign after the deadline.
        </VG_Explain>
      </At>
      <Canvas>
        <GFade show={s >= 5}>
          <line x1={160} y1={900} x2={1310} y2={900} style={{ stroke: c.line, strokeWidth: 1.5 }} />
          <line x1={760} y1={760} x2={760} y2={912} style={{ stroke: c.muted, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
          <text x={770} y={930} style={{ fontFamily: MONO, fontSize: 20, fill: c.muted }}>
            locktime
          </text>
          <rect x={160} y={782} width={1150} height={36} rx={8} style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 1.5 }} />
          <text x={178} y={808} style={{ fontFamily: SANS, fontSize: 21, fill: c.cool }}>
            receiver: preimage + signature
          </text>
          <rect x={760} y={836} width={550} height={36} rx={8} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.5 }} />
          <text x={778} y={862} style={{ fontFamily: SANS, fontSize: 21, fill: c.clayHex }}>
            sender: refund signature
          </text>
        </GFade>
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          <Code>data</Code> is a hash. Knowing its preimage opens the hash lock.
        </StepItem>
        <StepItem n={2} step={s}>
          <Code>pubkeys</Code> names the receiver, who must also sign.
        </StepItem>
        <StepItem n={3} step={s}>
          <Code>locktime</Code> is a deadline.
        </StepItem>
        <StepItem n={4} step={s}>
          <Code>refund</Code> names the sender, who may sign after the deadline.
        </StepItem>
        <StepItem n={5} step={s}>
          Receiver: any time. Sender: only after the deadline.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VG_HtAdvanced: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_HT} lens="Advanced" title="HTLC verification rules (NUT-14, NUT-11)" proc={proc}>
      <VG_Card x={120} y={256} w={820} h={250} title="Hash lock" on={s === 1}>
        <VG_Rule>
          <Code>data</Code>: SHA-256 of a 32-byte preimage, 64 lowercase hex characters.
        </VG_Rule>
        <VG_Rule>
          <Code>preimage</Code>: 64 hex characters. Check{' '}
          <Code>SHA256(hex_to_bytes(preimage)) == hex_to_bytes(data)</Code>.
        </VG_Rule>
      </VG_Card>
      <VG_Card x={980} y={256} w={820} h={250} title="Receiver pathway" tone={c.cool} on={s === 2}>
        <VG_Rule>
          Preimage plus signatures under the Locktime Multisig rules: <Code>pubkeys</Code>, at least{' '}
          <Code>n_sigs</Code> (default 1).
        </VG_Rule>
        <VG_Rule>Always available, also after the locktime. Without pubkeys the preimage alone spends.</VG_Rule>
      </VG_Card>
      <VG_Card x={120} y={532} w={820} h={250} title="Sender pathway" on={s === 3}>
        <VG_Rule>
          After the locktime: <Code>refund</Code> keys, at least <Code>n_sigs_refund</Code> (default 1).
        </VG_Rule>
        <VG_Rule ok={false}>
          No <Code>refund</Code> tag: anyone can spend after the locktime. No valid <Code>locktime</Code>: receiver
          pathway only.
        </VG_Rule>
      </VG_Card>
      <VG_Card x={980} y={532} w={820} h={250} title="Signatures (NUT-11)" on={s === 4}>
        <VG_Rule>Count distinct public keys with a valid signature, not signatures: Schnorr signatures are not deterministic.</VG_Rule>
        <VG_Rule>Each pathway is self-contained. Conditions cannot be mixed between pathways.</VG_Rule>
      </VG_Card>
      <VG_Card x={120} y={808} w={1680} title="Witness and scope" on={s === 5}>
        <div style={{ fontSize: 22, lineHeight: 1.45 }}>
          <Code>{'{"preimage": <hex>, "signatures": [<hex>, …]}'}</Code>, readable later through a NUT-07 state
          check; applications relying on that check NUT-07 in the mint info. Keysets 02+: hashlock leaves always need a
          signature.
        </div>
      </VG_Card>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VG_Lane = ({
  x1,
  x2,
  y,
  label,
  tone,
  fill,
  show,
  delay = 0,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  tone: string;
  fill: string;
  show: boolean;
  delay?: number;
}) => (
  <g style={{ opacity: show ? 1 : 0, transition: `opacity 300ms ${EASE_OUT} ${show ? delay : 0}ms` }}>
    <rect
      x={x1}
      y={y}
      width={x2 - x1}
      height={34}
      rx={8}
      style={{
        fill,
        stroke: tone,
        strokeWidth: 1.75,
        transformBox: 'fill-box',
        transformOrigin: 'left center',
        transform: show || REDUCED ? 'scaleX(1)' : 'scaleX(0.02)',
        transition: `transform 800ms ${EASE_IO} ${show ? delay : 0}ms`,
      }}
    />
    <text x={x1 + 16} y={y + 25} style={{ fontFamily: SANS, fontSize: 22, fill: tone }}>
      {label}
    </text>
  </g>
);

const VG_HtGraphical: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_HT} lens="Graphical" title="Who can spend, over time" proc={proc}>
      <Canvas>
        <line x1={1100} y1={300} x2={1100} y2={660} style={{ stroke: c.muted, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
        <text x={1100} y={290} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.muted }}>
          locktime
        </text>
        {/* row 1 */}
        <text x={120} y={388} style={{ fontFamily: MONO, fontSize: 22, fill: c.ink }}>
          locktime + refund
        </text>
        <line x1={440} y1={440} x2={1780} y2={440} style={{ stroke: c.rule, strokeWidth: 1.5 }} />
        <VG_Lane x1={440} x2={1780} y={338} label="receiver" tone={c.cool} fill={c.coolSoft} show={s >= 1} />
        <VG_Lane x1={1100} x2={1780} y={384} label="sender" tone={c.clayHex} fill={c.claySoft} show={s >= 2} />
        {/* row 2 */}
        <text x={120} y={588} style={{ fontFamily: MONO, fontSize: 22, fill: c.ink }}>
          locktime only
        </text>
        <line x1={440} y1={640} x2={1780} y2={640} style={{ stroke: c.rule, strokeWidth: 1.5 }} />
        <VG_Lane x1={440} x2={1780} y={538} label="receiver" tone={c.cool} fill={c.coolSoft} show={s >= 3} />
        <VG_Lane x1={1100} x2={1780} y={584} label="anyone" tone={c.bad} fill={c.badSoft} show={s >= 3} delay={500} />
        {/* row 3 */}
        <text x={120} y={788} style={{ fontFamily: MONO, fontSize: 22, fill: c.ink }}>
          no locktime
        </text>
        <line x1={440} y1={840} x2={1780} y2={840} style={{ stroke: c.rule, strokeWidth: 1.5 }} />
        <VG_Lane x1={440} x2={1780} y={760} label="receiver only" tone={c.cool} fill={c.coolSoft} show={s >= 4} />
        {/* time axis */}
        <Arrow x1={440} y1={920} x2={1780} y2={920} color={c.muted} label="time" font="sans" labelDy={36} />
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via a truth table ─────────────────────────────────────────────

const VG_TW = [90, 200, 260, 330, 230, 190, 380];

const VG_HtTable: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_HT} lens="Explained via a truth table" title="HTLC spend outcomes" proc={proc}>
      <At x={120} y={250} w={1680}>
        <Fade show={s >= 1}>
          <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
            <M size={40}>valid ⇔ R ∨ S ∨ A</M>
            <div style={{ fontSize: 24, lineHeight: 1.55 }}>
              <div>
                <M>R</M>: <Code>SHA256(preimage) = data</Code> and at least <Code>n_sigs</Code> receiver keys signed
              </div>
              <div>
                <M>S</M>: clock &gt; <Code>locktime</Code> and at least <Code>n_sigs_refund</Code> refund keys signed
              </div>
              <div>
                <M>A</M>: clock &gt; <Code>locktime</Code> and no <Code>refund</Code> tag
              </div>
            </div>
          </div>
        </Fade>
      </At>
      <At x={120} y={420} w={1680}>
        <Row i={0} head>
          <Cell head w={VG_TW[0]}>#</Cell>
          <Cell head w={VG_TW[1]}>preimage</Cell>
          <Cell head w={VG_TW[2]}>receiver sigs</Cell>
          <Cell head w={VG_TW[3]}>clock</Cell>
          <Cell head w={VG_TW[4]}>refund sigs</Cell>
          <Cell head w={VG_TW[5]}>result</Cell>
          <Cell head w={VG_TW[6]}>pathway</Cell>
        </Row>
        <Fade show={s >= 2}>
          <Row i={1}>
            <Cell w={VG_TW[0]} color={c.muted}>1</Cell>
            <Cell w={VG_TW[1]}><VG_Glyph ok /></Cell>
            <Cell w={VG_TW[2]}><VG_Glyph ok /></Cell>
            <Cell w={VG_TW[3]}>before locktime</Cell>
            <Cell w={VG_TW[4]}><VG_Glyph ok={null} /></Cell>
            <Cell w={VG_TW[5]} color={c.good}>valid</Cell>
            <Cell w={VG_TW[6]}><M>R</M></Cell>
          </Row>
          <Row i={2}>
            <Cell w={VG_TW[0]} color={c.muted}>2</Cell>
            <Cell w={VG_TW[1]}><VG_Glyph ok /></Cell>
            <Cell w={VG_TW[2]}><VG_Glyph ok={false} /></Cell>
            <Cell w={VG_TW[3]}>before locktime</Cell>
            <Cell w={VG_TW[4]}><VG_Glyph ok={null} /></Cell>
            <Cell w={VG_TW[5]} color={c.bad}>invalid</Cell>
            <Cell w={VG_TW[6]} color={c.muted}>preimage alone fails</Cell>
          </Row>
        </Fade>
        <Fade show={s >= 3}>
          <Row i={3}>
            <Cell w={VG_TW[0]} color={c.muted}>3</Cell>
            <Cell w={VG_TW[1]}><VG_Glyph ok /></Cell>
            <Cell w={VG_TW[2]}><VG_Glyph ok={false} /></Cell>
            <Cell w={VG_TW[3]}>before locktime</Cell>
            <Cell w={VG_TW[4]}><VG_Glyph ok /></Cell>
            <Cell w={VG_TW[5]} color={c.bad}>invalid</Cell>
            <Cell w={VG_TW[6]} color={c.muted}>refund too early</Cell>
          </Row>
          <Row i={4}>
            <Cell w={VG_TW[0]} color={c.muted}>4</Cell>
            <Cell w={VG_TW[1]}><VG_Glyph ok={false} /></Cell>
            <Cell w={VG_TW[2]}><VG_Glyph ok={null} /></Cell>
            <Cell w={VG_TW[3]}>after locktime</Cell>
            <Cell w={VG_TW[4]}><VG_Glyph ok /></Cell>
            <Cell w={VG_TW[5]} color={c.good}>valid</Cell>
            <Cell w={VG_TW[6]}><M>S</M></Cell>
          </Row>
        </Fade>
        <Fade show={s >= 4}>
          <Row i={5}>
            <Cell w={VG_TW[0]} color={c.muted}>5</Cell>
            <Cell w={VG_TW[1]}><VG_Glyph ok /></Cell>
            <Cell w={VG_TW[2]}><VG_Glyph ok /></Cell>
            <Cell w={VG_TW[3]}>after locktime</Cell>
            <Cell w={VG_TW[4]}><VG_Glyph ok={null} /></Cell>
            <Cell w={VG_TW[5]} color={c.good}>valid</Cell>
            <Cell w={VG_TW[6]}><M>R</M>, still available</Cell>
          </Row>
          <Row i={6}>
            <Cell w={VG_TW[0]} color={c.muted}>6</Cell>
            <Cell w={VG_TW[1]}><VG_Glyph ok={false} /></Cell>
            <Cell w={VG_TW[2]}><VG_Glyph ok={null} /></Cell>
            <Cell w={VG_TW[3]}>after, no refund tag</Cell>
            <Cell w={VG_TW[4]}><VG_Glyph ok={null} /></Cell>
            <Cell w={VG_TW[5]} color={c.good}>valid</Cell>
            <Cell w={VG_TW[6]}><M>A</M>: no witness needed</Cell>
          </Row>
        </Fade>
      </At>
      <At x={120} y={900} w={1680}>
        <Fade show={s >= 4}>
          <Note style={{ fontSize: 22 }}>
            Rows 1–5 carry pubkeys, locktime and refund tags. Row 3 matches an invalid case in the NUT-11 test vectors.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Perspective: sender and receiver ────────────────────────────────────────

const VG_HtParties: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const XS = 250;
  const XM = 760;
  const XR = 1270;
  return (
    <VarShell of={VG_OF_HT} lens="Perspective: sender and receiver" title="Both sides of an HTLC payment" proc={proc}>
      <Canvas>
        <Lifeline x={XS} label="sender S" top={292} bottom={930} color={c.clayHex} />
        <Lifeline x={XM} label="mint" top={292} bottom={930} />
        <Lifeline x={XR} label="receiver R" top={292} bottom={930} color={c.cool} />
        {/* 1: info */}
        <Arrow x1={XS} y1={360} x2={XM - 8} y2={360} show={s >= 1} color={c.muted} label="GET /v1/info" font="mono" />
        <Arrow x1={XR} y1={360} x2={XM + 8} y2={360} show={s >= 1} color={c.muted} label="GET /v1/info" font="mono" delay={150} />
        {/* 2: locked token */}
        <Arrow x1={XS} y1={460} x2={XR} y2={460} show={s >= 2} color={c.clayHex} dashed />
        <Packet x1={XS} y1={460} x2={XR} y2={460} run={proc.anim && s === 2} color={c.clayHex} dur={1200} />
        <T x={1000} y={446} size={22} show={s >= 2} delay={200}>
          token locked to h, R, S, T
        </T>
        {/* 3: receiver spends */}
        <Arrow x1={XR} y1={560} x2={XM} y2={560} show={s >= 3} color={c.cool} label="swap: preimage + sig by R" font="sans" />
        <Packet x1={XR} y1={560} x2={XM} y2={560} run={proc.anim && s === 3} delay={200} />
        <Arrow x1={XM} y1={630} x2={XR} y2={630} show={s >= 3} color={c.cool} label="new proofs" font="sans" delay={700} />
        {/* 4: sender reads the witness */}
        <Arrow x1={XS} y1={730} x2={XM} y2={730} show={s >= 4} color={c.clayHex} label="POST /v1/checkstate" font="mono" />
        <Arrow x1={XM} y1={800} x2={XS} y2={800} show={s >= 4} color={c.clayHex} label="SPENT, witness: preimage" font="sans" delay={700} />
        <Packet x1={XM} y1={800} x2={XS} y2={800} run={proc.anim && s === 4} color={c.clayHex} delay={900} />
        {/* 5: refund */}
        <Band x1={150} x2={1330} y={880} label="no spend by R before T: S swaps with a refund signature after T" show={s >= 5} tone="clay" />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Both read the mint info: NUT-14 support, and NUT-07 if S needs the witness later.
        </StepItem>
        <StepItem n={2} step={s}>
          S locks proofs: <Code>data</Code> = <M>h</M>, <Code>pubkeys</Code> = <M>R</M>, <Code>refund</Code> ={' '}
          <M>S</M>, <Code>locktime</Code> = <M>T</M>.
        </StepItem>
        <StepItem n={3} step={s}>
          R swaps with the preimage and a signature. The mint verifies both.
        </StepItem>
        <StepItem n={4} step={s}>
          S reads the spent proof's witness through NUT-07 and learns the preimage.
        </StepItem>
        <StepItem n={5} step={s}>
          Otherwise S takes the proofs back after <M>T</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: cost and sizes ─────────────────────────────────────────────────

const VG_SZ = 1.94; // px per character

const VG_SizeRow = ({
  y,
  title,
  sub,
  n,
  show,
  tone = c.node,
  fill = c.panel,
  delay = 0,
}: {
  y: number;
  title: string;
  sub: string;
  n: number;
  show: boolean;
  tone?: string;
  fill?: string;
  delay?: number;
}) => (
  <>
    <At x={120} y={y} w={400}>
      <Fade show={show} delay={delay}>
        <div style={{ fontSize: 24, lineHeight: 1.25 }}>{title}</div>
        <div style={{ fontSize: 21, color: c.muted, lineHeight: 1.3 }}>{sub}</div>
      </Fade>
    </At>
    <At x={540} y={y + 10} w={1260}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: n * VG_SZ,
            height: 40,
            boxSizing: 'border-box',
            border: `1.5px solid ${tone}`,
            background: fill,
            borderRadius: 6,
            transformOrigin: 'left center',
            transform: show || REDUCED ? 'scaleX(1)' : 'scaleX(0.01)',
            opacity: show ? 1 : 0,
            transition: `transform 700ms ${EASE_IO} ${show ? delay : 0}ms, opacity 200ms ${EASE_OUT} ${show ? delay : 0}ms`,
          }}
        />
        <span
          style={{
            fontFamily: MONO,
            fontSize: 22,
            opacity: show ? 1 : 0,
            transition: `opacity 300ms ${EASE_OUT} ${show ? delay + 500 : 0}ms`,
          }}
        >
          {n}
        </span>
      </div>
    </At>
  </>
);

const VG_HtSizes: Page = () => {
  const proc = useProcess(4, 2000);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_HT} lens="Framing: cost and sizes" title="Secret size grows with the policy" proc={proc}>
      <At x={540} y={250} w={1000}>
        <Label>characters in Proof.secret</Label>
      </At>
      <VG_SizeRow y={290} title="random secret" sub="NUT-00: 32 bytes as hex" n={64} show={s >= 1} />
      <VG_SizeRow y={378} title="P2PK, one key" sub="NUT-11 example" n={195} show={s >= 1} delay={120} />
      <VG_SizeRow y={466} title="HTLC, receiver + refund" sub="NUT-14 example" n={323} show={s >= 2} tone={c.clayHex} fill={c.claySoft} />
      <VG_SizeRow y={554} title="P2PK 2-of-3 + refund" sub="NUT-11 complex example" n={500} show={s >= 3} />
      <VG_SizeRow y={642} title="HTLC 2-of-3 + refund" sub="NUT-14 complex example" n={567} show={s >= 3} tone={c.clayHex} fill={c.claySoft} delay={120} />
      <At x={120} y={742} w={1680}>
        <div style={{ borderTop: `1px solid ${c.line}`, opacity: s >= 4 ? 1 : 0, transition: `opacity 400ms ${EASE_OUT}` }} />
      </At>
      <VG_SizeRow y={762} title="v3 secret, any policy" sub="nutroot: a 33-byte point" n={66} show={s >= 4} tone={c.cool} fill={c.coolSoft} />
      <At x={120} y={870} w={1680}>
        <Fade show={s >= 4}>
          <Note style={{ fontSize: 22 }}>
            Witness text on top: 128 hex characters per signature, 64 per preimage. The whole policy is sent and
            revealed on every spend. CDK rejects secrets and witnesses longer than 1024 characters.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Focus: SIG_ALL message ──────────────────────────────────────────────────

const VG_HtSigAll: Page = () => {
  const proc = useProcess(4, 2400);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_HT} lens="Focus: the SIG_ALL message" title="SIG_ALL signs a concatenated string" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Label>Swap · NUT-11 test vector · 1 input, 1 output</Label>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <VG_Chip bytes={'["P2PK",{…}]'} label="secret_0 · 192" show={s >= 1} hot={s === 1} />
          <VG_Chip bytes="02c97ee3…4808d3cd" label="C_0 · 66" show={s >= 1} delay={60} />
          <VG_Chip bytes="2" label="amount_0" show={s >= 1} delay={120} />
          <VG_Chip bytes="038ec853…d9a86c39" label="B_0 · 66" show={s >= 1} delay={180} />
        </div>
        <Fade show={s >= 1} delay={300} style={{ marginTop: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 20 }}>
            SHA256(325 chars) = <span style={{ color: c.clayHex }}>de7f9e3ca0fcc5ed…e9dc6eb09a</span>
          </span>
        </Fade>
      </At>
      <At x={120} y={470} w={1220}>
        <Fade show={s >= 2}>
          <Label>Melt · NUT-11 test vector · 1 input, 1 blank output, quote id</Label>
        </Fade>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <VG_Chip bytes={'["P2PK",{…}]'} label="secret_0 · 192" show={s >= 2} />
          <VG_Chip bytes="02a9d461…ddaa10028b" label="C_0 · 66" show={s >= 2} delay={60} />
          <VG_Chip bytes="0" label="amount_0" show={s >= 2} delay={120} />
          <VG_Chip bytes="038ec853…d9a86c39" label="B_0 · 66" show={s >= 2} delay={180} />
          <VG_Chip bytes="cF8911fz…bJxK0" label="quote_id · 40" show={s >= 2} hot={s === 2} delay={240} />
        </div>
        <Fade show={s >= 2} delay={300} style={{ marginTop: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 20 }}>
            SHA256(365 chars) = <span style={{ color: c.clayHex }}>9efa1067cc7dc870…df3c3cf262</span>
          </span>
        </Fade>
      </At>
      <At x={120} y={690} w={1220}>
        <Fade show={s >= 3}>
          <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.7 }}>
            <div>swap: secret_0 ‖ C_0 ‖ … ‖ secret_n ‖ C_n ‖ amount_0 ‖ B_0 ‖ … ‖ amount_m ‖ B_m</div>
            <div>melt: the same, then ‖ quote_id</div>
          </div>
        </Fade>
      </At>
      <At x={120} y={800} w={1220}>
        <Fade show={s >= 4}>
          <VG_CodeBox style={{ padding: '12px 20px' }}>
            <div style={{ fontSize: 22, lineHeight: 1.45 }}>
              Every input must have the same kind, <Code>SIG_ALL</Code>, and the same <Code>data</Code> and{' '}
              <Code>tags</Code>. Otherwise the request fails.
            </div>
          </VG_CodeBox>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Swap: each input's secret and <Code>C</Code>, then each output's amount and <Code>B_</Code>, as one string.
        </StepItem>
        <StepItem n={2} step={s}>
          Melt: the same, then the quote id.
        </StepItem>
        <StepItem n={3} step={s}>
          Hash with SHA-256 and sign once. Only the first input carries the witness.
        </StepItem>
        <StepItem n={4} step={s}>
          One SIG_ALL input forces identical conditions on all inputs.
        </StepItem>
        <Note style={{ marginTop: 16, fontSize: 21 }}>
          <Code>C</Code> and <Code>B_</Code> are hex strings; amounts are decimal strings.
        </Note>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 2.2 Taproot output keys (BIP341)
// ═════════════════════════════════════════════════════════════════════════════

const VG_OF_TT = '2.2 Taproot output keys (BIP341)';

// ─── Beginner ────────────────────────────────────────────────────────────────

const VG_TtBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TT} lens="Beginner" title="One script, one output key: a worked example" proc={proc}>
      <VG_Box
        x={120}
        y={256}
        w={1000}
        title={
          <>
            Script: push the 32-byte key <M>x</M>(2·<M>G</M>), then <Code>OP_CHECKSIG</Code>. 34 bytes.
          </>
        }
        value={
          <>
            <VG_Hl>20</VG_Hl> c6047f9441ed7d6d…abac09b95c709ee5 <VG_Hl>ac</VG_Hl>
          </>
        }
        show={s >= 1}
        on={s === 1}
      />
      <VG_Box
        x={120}
        y={384}
        w={1000}
        title={
          <>
            Leaf hash = <Code>hash_TapLeaf(c0 ‖ 22 ‖ script)</Code>. One leaf: this is the root.
          </>
        }
        value="ab11b8ce98a88b0dccf33a81…fec6fa0cc0f7d4c0a28b8977"
        show={s >= 2}
        on={s === 2}
      />
      <VG_Box
        x={120}
        y={512}
        w={1000}
        title={
          <>
            Tweak <M>t</M> = <Code>hash_TapTweak(x(P) ‖ root)</Code>, internal key <M>P</M> = 1·<M>G</M>
          </>
        }
        value="1a3484dd1ab69c35021ef8c2…08cff16b77db7f13588e4502"
        show={s >= 3}
        on={s === 3}
      />
      <VG_Box
        x={120}
        y={640}
        w={1000}
        title={
          <>
            Output key <M>Q = P + t·G</M>, x-coordinate (y is odd)
          </>
        }
        value="456b959d3ad02729d12d7df9…5c5b61071897c59414a1842e"
        show={s >= 4}
        on={s === 4}
      />
      <VG_Box
        x={120}
        y={768}
        w={1000}
        title={
          <>
            Output script: <Code>OP_1</Code>, push 32 bytes
          </>
        }
        value="51 20 456b959d3ad02729…9414a1842e"
        show={s >= 5}
        on={s === 5}
      />
      <Canvas>
        <Arrow x1={200} y1={346} x2={200} y2={382} show={s >= 2} color={c.node} />
        <Arrow x1={200} y1={474} x2={200} y2={510} show={s >= 3} color={c.node} />
        <Arrow x1={200} y1={602} x2={200} y2={638} show={s >= 4} color={c.node} />
        <Arrow x1={200} y1={730} x2={200} y2={766} show={s >= 5} color={c.node} />
      </Canvas>
      <At x={1150} y={404} w={190}>
        <Fade show={s >= 2}>
          <div style={{ fontSize: 21, color: c.muted, lineHeight: 1.4 }}>
            <Code>c0</Code> leaf version
            <br />
            <Code>22</Code> length 34
          </div>
        </Fade>
      </At>
      <At x={120} y={890} w={1220}>
        <Fade show={s >= 5}>
          <Note>
            Key-path secret: <M>q</M> = 1 + <M>t</M> = <Code>1a3484dd…13588e4503</Code>. Toy keys 1 and 2; computed with
            the BIP341 algorithm.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          A leaf is a script. Here: check a signature for the key with secret 2.
        </StepItem>
        <StepItem n={2} step={s}>
          Hash the leaf with its version and length. With one leaf, this hash is the root.
        </StepItem>
        <StepItem n={3} step={s}>
          Hash the internal key <M>P</M> (secret 1) together with the root: the tweak <M>t</M>.
        </StepItem>
        <StepItem n={4} step={s}>
          Add <M>t·G</M> to <M>P</M>. The sum is the output key <M>Q</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          The output publishes only <M>x</M>(<M>Q</M>): 32 bytes.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

/** Highlighted opcode byte inside a mono value. */
const VG_Hl = ({ children }: { children: ReactNode }) => <span style={{ color: c.clayHex }}>{children}</span>;

// ─── Advanced ────────────────────────────────────────────────────────────────

const VG_More = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 21, lineHeight: 1.4, color: c.muted, marginTop: 8 }}>{children}</div>
);

const VG_TtAdvanced: Page = () => {
  const proc = useProcess(6, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TT} lens="Advanced" title="Output key construction: rules and edge cases" proc={proc}>
      <VG_Card x={120} y={256} w={820} h={220} title="x-only keys (BIP340)" on={s === 1}>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          Keys are 32-byte x-coordinates; <Code>lift_x</Code> picks the point with even <M>y</M>. A secret key whose point
          has odd <M>y</M> is negated before the tweak is added.
        </div>
        <VG_More>Treating only x as the key keeps each signature valid for exactly one key.</VG_More>
      </VG_Card>
      <VG_Card x={980} y={256} w={820} h={220} title="Tweak" on={s === 2}>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          <M>t</M> = <Code>hash_TapTweak(p ‖ root)</Code> read as an integer; fail if <M>t ≥ n</M>. <M>Q = P + t·G</M>.
          A script path spend must reveal the parity of <M>y</M>(<M>Q</M>).
        </div>
        <VG_More>
          2<sup>256</sup> − <M>n</M> is about 2<sup>128.3</sup>, so <M>t ≥ n</M> happens with probability below
          2<sup>−127</sup>.
        </VG_More>
      </VG_Card>
      <VG_Card x={120} y={496} w={820} h={220} title="No script path" on={s === 3}>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          Commit to an empty tree: <M>Q = P +</M> <Code>hash_TapTweak(p)</Code>
          <M>·G</M>.
        </div>
        <VG_More>
          Without it, a party to a key aggregated without MuSig can hide a script path in its own key. MuSig already
          randomizes the aggregate.
        </VG_More>
      </VG_Card>
      <VG_Card x={980} y={496} w={820} h={220} title="NUMS internal key" on={s === 4}>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          <M>H</M> = <Code>lift_x(50929b74…ce803ac0)</Code>, the SHA-256 of the uncompressed <M>G</M>. Its discrete
          logarithm is unknown.
        </div>
        <VG_More>
          Use <M>H + r·G</M> with a fresh <M>r</M>: a bare <M>H</M> would reveal that there is no key path. Revealing{' '}
          <M>r</M> proves it to a verifier.
        </VG_More>
      </VG_Card>
      <VG_Card x={120} y={736} w={820} h={220} title="Leaves and branches" on={s === 5}>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          Leaf versions are even and never <Code>0x50</Code>; <Code>0xc0</Code> is BIP342 tapscript.{' '}
          <Code>TapBranch</Code> sorts its two children, so a path carries no left/right bits. Depth ≤ 128.
        </div>
        <VG_More>Scripts of 253 bytes or more take a 3-byte compact size: 0xfd, then 2 bytes little-endian.</VG_More>
      </VG_Card>
      <VG_Card x={980} y={736} w={820} h={220} title="Reference" on={s === 6}>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          BIP341 Python: <Code>taproot_tweak_pubkey</Code>, <Code>taproot_tweak_seckey</Code>,{' '}
          <Code>taproot_tree_helper</Code>.
        </div>
        <VG_More>
          Vectors: <Code>bip-0341/wallet-test-vectors.json</Code>, 7 output cases with leaf hashes, tweaks and
          control blocks.
        </VG_More>
      </VG_Card>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VG_TtGraphical: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const leafTone = c.cool;
  const branchTone = c.violet;
  const tweakTone = c.clayHex;
  return (
    <VarShell of={VG_OF_TT} lens="Graphical" title="Three tags, one output key" proc={proc}>
      <Canvas>
        {/* edges */}
        <Draw x1={460} y1={836} x2={460} y2={770} show={s >= 1} color={c.node} width={2} />
        <Draw x1={1100} y1={836} x2={1100} y2={770} show={s >= 1} color={c.node} width={2} delay={60} />
        <Draw x1={1440} y1={836} x2={1440} y2={770} show={s >= 1} color={c.node} width={2} delay={120} />
        <Draw x1={1100} y1={714} x2={1250} y2={630} show={s >= 2} color={c.node} width={2} />
        <Draw x1={1440} y1={714} x2={1290} y2={630} show={s >= 2} color={c.node} width={2} />
        <Draw x1={470} y1={712} x2={835} y2={488} show={s >= 3} color={c.node} width={2} />
        <Draw x1={1250} y1={572} x2={895} y2={482} show={s >= 3} color={c.node} width={2} />
        <Draw x1={865} y1={426} x2={865} y2={366} show={s >= 4} color={c.node} width={2} />
        <Draw x1={560} y1={330} x2={829} y2={330} show={s >= 4} color={c.node} width={2} />
        <Arrow x1={901} y1={330} x2={1156} y2={330} show={s >= 5} color={tweakTone} />
        {/* packets */}
        <Packet x1={460} y1={836} x2={460} y2={770} run={proc.anim && s === 1} color={leafTone} r={7} />
        <Packet x1={1100} y1={836} x2={1100} y2={770} run={proc.anim && s === 1} color={leafTone} r={7} delay={60} />
        <Packet x1={1440} y1={836} x2={1440} y2={770} run={proc.anim && s === 1} color={leafTone} r={7} delay={120} />
        <Packet x1={1100} y1={714} x2={1250} y2={630} run={proc.anim && s === 2} color={branchTone} r={7} />
        <Packet x1={1440} y1={714} x2={1290} y2={630} run={proc.anim && s === 2} color={branchTone} r={7} />
        <Packet x1={470} y1={712} x2={835} y2={488} run={proc.anim && s === 3} color={branchTone} r={7} />
        <Packet x1={1250} y1={572} x2={895} y2={482} run={proc.anim && s === 3} color={branchTone} r={7} />
        <Packet x1={865} y1={426} x2={865} y2={366} run={proc.anim && s === 4} color={tweakTone} r={7} />
        <Packet x1={560} y1={330} x2={829} y2={330} run={proc.anim && s === 4} color={tweakTone} r={7} />
        <Packet x1={901} y1={330} x2={1156} y2={330} run={proc.anim && s === 5} color={tweakTone} r={7} />
        {/* scripts */}
        <VG_SBox x={380} y={836} w={160} h={56} label="script A" show={s >= 1} />
        <VG_SBox x={1020} y={836} w={160} h={56} label="script B" show={s >= 1} delay={60} />
        <VG_SBox x={1360} y={836} w={160} h={56} label="script C" show={s >= 1} delay={120} />
        {/* hashes */}
        <VG_Node x={460} y={742} r={28} tone={leafTone} fill={c.coolSoft} show={s >= 1} delay={300} />
        <VG_Node x={1100} y={742} r={28} tone={leafTone} fill={c.coolSoft} show={s >= 1} delay={360} />
        <VG_Node x={1440} y={742} r={28} tone={leafTone} fill={c.coolSoft} show={s >= 1} delay={420} />
        <VG_Node x={1270} y={600} r={30} tone={branchTone} fill="rgba(122, 95, 166, 0.14)" show={s >= 2} delay={300} />
        <VG_Node x={865} y={456} r={32} tone={branchTone} fill="rgba(122, 95, 166, 0.14)" show={s >= 3} delay={300} />
        <VG_Node x={865} y={330} r={36} tone={tweakTone} fill={c.claySoft} show={s >= 4} delay={300} />
        {/* keys */}
        <VG_SBox x={420} y={300} w={140} h={60} label="P" font="math" size={32} show={s >= 4} />
        <VG_SBox x={1160} y={296} w={330} h={68} label="Q = P + t·G" font="math" size={32} tone={tweakTone} show={s >= 5} delay={400} />
        <T x={1325} y={404} font="mono" size={22} color={c.muted} show={s >= 5} delay={600}>
          OP_1 &lt;x(Q)&gt;
        </T>
        {/* legend */}
        <circle cx={1380} cy={512} r={12} style={{ fill: c.coolSoft, stroke: leafTone, strokeWidth: 2 }} />
        <text x={1402} y={520} style={{ fontFamily: MONO, fontSize: 22, fill: c.ink }}>TapLeaf</text>
        <circle cx={1580} cy={512} r={12} style={{ fill: 'rgba(122, 95, 166, 0.14)', stroke: branchTone, strokeWidth: 2 }} />
        <text x={1602} y={520} style={{ fontFamily: MONO, fontSize: 22, fill: c.ink }}>TapBranch</text>
        <circle cx={1380} cy={458} r={12} style={{ fill: c.claySoft, stroke: tweakTone, strokeWidth: 2 }} />
        <text x={1402} y={466} style={{ fontFamily: MONO, fontSize: 22, fill: c.ink }}>TapTweak</text>
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via code ──────────────────────────────────────────────────────

const VG_TtCode: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  const on = (k: number) => s === k;
  return (
    <VarShell of={VG_OF_TT} lens="Explained via code" title="Output key construction in code" proc={proc}>
      <At x={120} y={256} w={1220}>
        <VG_CodeBox>
          <VG_Line lh={1.55} on={on(1)}>{'def tagged(tag, msg):'}</VG_Line>
          <VG_Line lh={1.55} on={on(1)}>{'    h = sha256(tag.encode())'}</VG_Line>
          <VG_Line lh={1.55} on={on(1)}>{'    return sha256(h + h + msg)'}</VG_Line>
          <VG_Line lh={1.55}> </VG_Line>
          <VG_Line lh={1.55} on={on(2)}>{'def leaf_hash(script, version=0xc0):'}</VG_Line>
          <VG_Line lh={1.55} on={on(2)}>{'    return tagged("TapLeaf", bytes([version]) + compact_size(len(script)) + script)'}</VG_Line>
          <VG_Line lh={1.55}> </VG_Line>
          <VG_Line lh={1.55} on={on(3)}>{'def node_hash(node):'}</VG_Line>
          <VG_Line lh={1.55} on={on(3)}>{'    if node.is_leaf:'}</VG_Line>
          <VG_Line lh={1.55} on={on(3)}>{'        return leaf_hash(node.script, node.version)'}</VG_Line>
          <VG_Line lh={1.55} on={on(3)}>{'    a, b = node_hash(node.left), node_hash(node.right)'}</VG_Line>
          <VG_Line lh={1.55} on={on(3)}>{'    return tagged("TapBranch", min(a, b) + max(a, b))'}</VG_Line>
          <VG_Line lh={1.55}> </VG_Line>
          <VG_Line lh={1.55} on={on(4) || on(5)}>{'def output_key(p, tree):'}</VG_Line>
          <VG_Line lh={1.55} on={on(4)}>{'    root = node_hash(tree) if tree else b""'}</VG_Line>
          <VG_Line lh={1.55} on={on(4)}>{'    t = int.from_bytes(tagged("TapTweak", p + root), "big")'}</VG_Line>
          <VG_Line lh={1.55} on={on(4)}>{'    if t >= N: raise ValueError           # BIP341: fail'}</VG_Line>
          <VG_Line lh={1.55} on={on(5)}>{'    Q = lift_x(p) + t * G                 # even-y lift of p'}</VG_Line>
          <VG_Line lh={1.55} on={on(5)}>{'    return x(Q), Q.y % 2                  # script: 51 20 x(Q)'}</VG_Line>
        </VG_CodeBox>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Tagged hash (BIP340): SHA-256 over a 64-byte tag prefix, then the message.
        </StepItem>
        <StepItem n={2} step={s}>
          A leaf commits to its version, its compact-size length and its script.
        </StepItem>
        <StepItem n={3} step={s}>
          A branch hashes its children smaller first, so a path needs no left/right bits.
        </StepItem>
        <StepItem n={4} step={s}>
          No tree: empty root. A tweak outside the group order fails.
        </StepItem>
        <StepItem n={5} step={s}>
          Keep the parity bit: script path spends reveal it.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: constructor ────────────────────────────────────────────────

const VG_TtConstructor: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TT} lens="Perspective: wallet that builds the output" title="From a policy to an output key" proc={proc}>
      <At x={120} y={256} w={440}>
        <Label>Policy</Label>
      </At>
      <VG_Card x={120} y={296} w={440} h={116} tone={c.clayHex} show={s >= 1} on={s === 2}>
        <div style={{ fontSize: 24, lineHeight: 1.35 }}>
          <M>A</M> and <M>B</M> together
        </div>
        <div style={{ fontSize: 21, color: c.muted }}>the expected case</div>
      </VG_Card>
      <VG_Card x={120} y={432} w={440} h={116} tone={c.cool} show={s >= 1} delay={80} on={s === 3}>
        <div style={{ fontSize: 24, lineHeight: 1.35 }}>
          <M>A</M> alone after time <M>t</M>
        </div>
        <div style={{ fontSize: 21, color: c.muted }}>fallback</div>
      </VG_Card>
      <VG_Card x={120} y={568} w={440} h={116} tone={c.violet} show={s >= 1} delay={160} on={s === 3}>
        <div style={{ fontSize: 24, lineHeight: 1.35 }}>
          <M>B</M> with the preimage of <M>h</M>
        </div>
        <div style={{ fontSize: 21, color: c.muted }}>fallback</div>
      </VG_Card>
      {/* output side */}
      <VG_Card x={620} y={296} w={330} h={124} title="internal key P" tone={c.clayHex} show={s >= 2} on={s === 2}>
        <div style={{ fontSize: 22, lineHeight: 1.35 }}>
          aggregate of <M>A</M> and <M>B</M> (MuSig2)
        </div>
      </VG_Card>
      <VG_Card x={1010} y={296} w={330} h={124} title="output key" show={s >= 5} on={s === 5}>
        <M size={30}>Q = P + t·G</M>
      </VG_Card>
      <Canvas>
        <Arrow x1={950} y1={358} x2={1006} y2={358} show={s >= 5} color={c.clayHex} />
        <Draw x1={780} y1={568} x2={1130} y2={506} show={s >= 4} color={c.node} width={2} />
        <Draw x1={1180} y1={568} x2={1180} y2={506} show={s >= 4} color={c.node} width={2} />
        <Arrow x1={1175} y1={452} x2={1175} y2={424} show={s >= 5} color={c.clayHex} />
      </Canvas>
      <VG_Node_Html x={1175} y={480} show={s >= 4} label="root" />
      <VG_Card x={620} y={568} w={320} title="leaf 1 · depth 1" tone={c.cool} show={s >= 3} on={s === 3}>
        <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.5 }}>
          {'<t> OP_CLTV OP_DROP'}
          <br />
          {'<A> OP_CHECKSIG'}
        </div>
      </VG_Card>
      <VG_Card x={1020} y={568} w={320} title="leaf 2 · depth 1" tone={c.violet} show={s >= 3} delay={80} on={s === 3}>
        <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.5 }}>
          {'OP_SHA256 <h>'}
          <br />
          {'OP_EQUALVERIFY'}
          <br />
          {'<B> OP_CHECKSIG'}
        </div>
      </VG_Card>
      <At x={120} y={806} w={1220}>
        <Fade show={s >= 5}>
          <Note>
            Keep <M>P</M>, both scripts and the parity of <M>y</M>(<M>Q</M>). Without an aggregate for the expected case,
            BIP341 suggests <M>H + r·G</M> as internal key.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Write the policy as separate conditions, one per execution path.
        </StepItem>
        <StepItem n={2} step={s}>
          The most likely condition that is a single key, after aggregation, becomes the internal key.
        </StepItem>
        <StepItem n={3} step={s}>
          Every other condition becomes a leaf script, with fresh keys.
        </StepItem>
        <StepItem n={4} step={s}>
          Shape the tree by likelihood. Two leaves: both at depth 1.
        </StepItem>
        <StepItem n={5} step={s}>
          Tweak <M>P</M> by the root. Only <M>x</M>(<M>Q</M>) goes on chain.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

/** Small HTML node with a label, centred on (x, y). */
const VG_Node_Html = ({ x, y, show, label }: { x: number; y: number; show: boolean; label: string }) => (
  <div
    style={{
      position: 'absolute',
      left: x - 80,
      top: y - 30,
      width: 160,
      height: 60,
      boxSizing: 'border-box',
      border: `1.75px dashed ${c.node}`,
      background: c.card,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      ...VG_enter(show),
    }}
  >
    {label}
  </div>
);

// ─── Framing: tree shape and proof size ──────────────────────────────────────

const VG_Leaf = ({
  x,
  y,
  name,
  p,
  size,
  show,
  sizeOn,
  delay = 0,
}: {
  x: number;
  y: number;
  name: string;
  p: string;
  size: string;
  show: boolean;
  sizeOn: boolean;
  delay?: number;
}) => (
  <g style={{ opacity: show ? 1 : 0, transition: `opacity 450ms ${EASE_OUT} ${show ? delay : 0}ms` }}>
    <circle cx={x} cy={y} r={32} style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 2 }} />
    <text x={x} y={y + 9} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 24, fill: c.ink }}>
      {name}
    </text>
    <text x={x} y={y + 62} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.muted }}>
      {p}
    </text>
    <text
      x={x}
      y={y + 90}
      textAnchor="middle"
      style={{
        fontFamily: MONO,
        fontSize: 21,
        fill: c.clayHex,
        opacity: sizeOn ? 1 : 0,
        transition: `opacity 400ms ${EASE_OUT}`,
      }}
    >
      {size}
    </text>
  </g>
);

const VG_TtHuffman: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const bal = s >= 2;
  const huf = s >= 3;
  return (
    <VarShell of={VG_OF_TT} lens="Framing: tree shape and proof size" title="Tree shape sets the script path cost" proc={proc}>
      <Canvas>
        <text x={420} y={290} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 24, fill: c.muted }}>
          balanced
        </text>
        <text x={1010} y={290} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 24, fill: c.muted }}>
          by probability (Huffman)
        </text>
        {/* balanced edges */}
        <Edge x1={420} y1={340} x2={270} y2={440} show={bal} />
        <Edge x1={420} y1={340} x2={570} y2={440} show={bal} />
        <Edge x1={270} y1={440} x2={195} y2={560} show={bal} />
        <Edge x1={270} y1={440} x2={345} y2={560} show={bal} />
        <Edge x1={570} y1={440} x2={495} y2={560} show={bal} />
        <Edge x1={570} y1={440} x2={645} y2={560} show={bal} />
        <VG_Node x={420} y={340} r={14} tone={c.violet} fill={c.card} show={bal} />
        <VG_Node x={270} y={440} r={14} tone={c.violet} fill={c.card} show={bal} />
        <VG_Node x={570} y={440} r={14} tone={c.violet} fill={c.card} show={bal} />
        <VG_Leaf x={195} y={590} name="A" p="0.6" size="97 B" show={s >= 1} sizeOn={bal} />
        <VG_Leaf x={345} y={590} name="B" p="0.2" size="97 B" show={s >= 1} sizeOn={bal} delay={60} />
        <VG_Leaf x={495} y={590} name="C" p="0.1" size="97 B" show={s >= 1} sizeOn={bal} delay={120} />
        <VG_Leaf x={645} y={590} name="D" p="0.1" size="97 B" show={s >= 1} sizeOn={bal} delay={180} />
        {/* huffman edges */}
        <Edge x1={980} y1={340} x2={840} y2={420} show={huf} />
        <Edge x1={980} y1={340} x2={1120} y2={440} show={huf} />
        <Edge x1={1120} y1={440} x2={1020} y2={540} show={huf} />
        <Edge x1={1120} y1={440} x2={1220} y2={560} show={huf} />
        <Edge x1={1220} y1={560} x2={1140} y2={680} show={huf} />
        <Edge x1={1220} y1={560} x2={1300} y2={680} show={huf} />
        <VG_Node x={980} y={340} r={14} tone={c.violet} fill={c.card} show={huf} />
        <VG_Node x={1120} y={440} r={14} tone={c.violet} fill={c.card} show={huf} />
        <VG_Node x={1220} y={560} r={14} tone={c.violet} fill={c.card} show={huf} />
        <T x={1150} y={430} anchor="start" size={20} font="mono" color={c.violet} show={huf}>0.4</T>
        <T x={1250} y={550} anchor="start" size={20} font="mono" color={c.violet} show={huf}>0.2</T>
        <VG_Leaf x={840} y={450} name="A" p="0.6" size="65 B" show={huf} sizeOn={huf} />
        <VG_Leaf x={1020} y={570} name="B" p="0.2" size="97 B" show={huf} sizeOn={huf} delay={60} />
        <VG_Leaf x={1140} y={710} name="C" p="0.1" size="129 B" show={huf} sizeOn={huf} delay={120} />
        <VG_Leaf x={1300} y={710} name="D" p="0.1" size="129 B" show={huf} sizeOn={huf} delay={180} />
      </Canvas>
      <At x={120} y={846} w={1220}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 26, lineHeight: 1.5 }}>
            Expected control block <M>33 + 32·E[m]</M>: balanced <Code>97 B</Code> · Huffman{' '}
            <Code>33 + 32·1.6 = 84.2 B</Code>
          </div>
          <div style={{ fontSize: 24, color: c.muted }}>
            <M>E[m]</M> = 0.6·1 + 0.2·2 + 0.1·3 + 0.1·3 = 1.6
          </div>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Four leaves with spend probabilities 0.6, 0.2, 0.1, 0.1.
        </StepItem>
        <StepItem n={2} step={s}>
          Balanced: every path has 2 hashes. Control block 33 + 64 = 97 bytes.
        </StepItem>
        <StepItem n={3} step={s}>
          Huffman: merge the two least likely nodes until one is left. <M>A</M> ends at depth 1.
        </StepItem>
        <StepItem n={4} step={s}>
          Expected cost drops; the rare leaves pay 129 bytes.
        </StepItem>
        <StepItem n={5} step={s}>
          The revealed depth hints at the tree shape. BIP341 notes that deviating from the optimum can help privacy.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Focus: tagged hashes ────────────────────────────────────────────────────

const VG_BPX = 4.6875; // px per byte: one 64-byte block = 300 px

const VG_Block = ({ bytes, label, tone, fill, show, delay = 0 }: { bytes: number; label: ReactNode; tone: string; fill: string; show: boolean; delay?: number }) => (
  <div
    style={{
      width: bytes * VG_BPX,
      height: 56,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone}`,
      background: fill,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 20,
      whiteSpace: 'nowrap',
      ...VG_enter(show, delay, 400),
    }}
  >
    {label}
  </div>
);

const VG_TagRow = ({
  y,
  tag,
  digest,
  msgBytes,
  msgLabel,
  show,
  on,
  extra,
}: {
  y: number;
  tag: string;
  digest: string;
  msgBytes: number;
  msgLabel: string;
  show: boolean;
  on: boolean;
  extra?: ReactNode;
}) => (
  <At x={120} y={y} w={1220}>
    <Fade show={show}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
        <span style={{ fontFamily: MONO, fontSize: 24, color: on ? c.clayHex : c.ink, transition: `color 300ms ${EASE_OUT}` }}>
          {tag}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 20, color: c.muted }}>
          SHA256("{tag}") = {digest}
        </span>
      </div>
      <div style={{ display: 'flex', marginTop: 10, alignItems: 'center' }}>
        <VG_Block bytes={64} label="tag hash ‖ tag hash" tone={c.line} fill={c.panel} show={show} />
        <VG_Block bytes={msgBytes} label={msgLabel} tone={on ? c.clayHex : c.node} fill={on ? c.claySoft : c.card} show={show} delay={120} />
        {extra}
      </div>
    </Fade>
  </At>
);

const VG_TtTags: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TT} lens="Focus: tagged hashes" title="Tagged hashes: TapLeaf, TapBranch, TapTweak" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 28 }}>
            <Code>hash_tag(m) = SHA256(SHA256(tag) ‖ SHA256(tag) ‖ m)</Code>
          </div>
          <Note style={{ marginTop: 6 }}>The prefix is 64 bytes, one SHA-256 block: its midstate is a constant per tag.</Note>
        </Fade>
      </At>
      <VG_TagRow
        y={396}
        tag="TapLeaf"
        digest="aeea8fdc…be78e9ee"
        msgBytes={36}
        msgLabel="c0 22 script"
        show={s >= 2}
        on={s === 2}
        extra={<span style={{ fontSize: 21, color: c.muted, marginLeft: 16 }}>36 B for a 34-byte script</span>}
      />
      <VG_TagRow
        y={546}
        tag="TapBranch"
        digest="1941a1f2…f516a015"
        msgBytes={64}
        msgLabel="min(a, b) ‖ max(a, b)"
        show={s >= 3}
        on={s === 3}
      />
      <VG_TagRow
        y={696}
        tag="TapTweak"
        digest="e80fe163…af57c5e9"
        msgBytes={64}
        msgLabel="x(P) ‖ root"
        show={s >= 4}
        on={s === 4}
        extra={<span style={{ fontSize: 21, color: c.muted, marginLeft: 16 }}>32 B without scripts</span>}
      />
      <At x={120} y={860} w={1220}>
        <Fade show={s >= 5}>
          <Note>
            Distinct tags keep the contexts apart: a leaf hash cannot be reinterpreted as a branch or a tweak. Nutroot uses
            its own tags in the same structure.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Prefix the message with two copies of SHA256(tag).
        </StepItem>
        <StepItem n={2} step={s}>
          TapLeaf: leaf version, compact-size length, script.
        </StepItem>
        <StepItem n={3} step={s}>
          TapBranch: two 32-byte child hashes, smaller first.
        </StepItem>
        <StepItem n={4} step={s}>
          TapTweak: the internal key, then the root if there are scripts.
        </StepItem>
        <StepItem n={5} step={s}>
          Hashes from one context cannot be reused in another.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 2.2 Key path and script path (BIP341, BIP342)
// ═════════════════════════════════════════════════════════════════════════════

const VG_OF_TS = '2.2 Key path and script path (BIP341, BIP342)';

/** A witness stack element. */
const VG_Elem = ({
  w,
  label,
  size,
  tone = c.node,
  fill = c.card,
  show = true,
  delay = 0,
}: {
  w: number;
  label: ReactNode;
  size: string;
  tone?: string;
  fill?: string;
  show?: boolean;
  delay?: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: w,
      height: 58,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone}`,
      background: fill,
      borderRadius: 8,
      padding: '0 16px',
      marginBottom: 10,
      ...VG_enter(show, delay, 400),
    }}
  >
    <span style={{ fontSize: 22 }}>{label}</span>
    <span style={{ fontFamily: MONO, fontSize: 20, color: c.muted }}>{size}</span>
  </div>
);

// ─── Beginner ────────────────────────────────────────────────────────────────

const VG_TsBeginner: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TS} lens="Beginner" title="Two ways to spend one output" proc={proc}>
      <VG_Card x={390} y={256} w={680} title="Output (toy example from 2.2)" on={s === 1} show={s >= 1}>
        <div style={{ fontFamily: MONO, fontSize: 21 }}>OP_1 &lt;456b959d…14a1842e&gt;</div>
        <div style={{ fontSize: 21, color: c.muted, marginTop: 4 }}>
          <M>Q</M> = key <M>P</M> (secret 1) tweaked by one script (key with secret 2)
        </div>
      </VG_Card>
      <Canvas>
        <Arrow x1={560} y1={390} x2={400} y2={460} show={s >= 2} color={c.clayHex} />
        <Arrow x1={900} y1={390} x2={1040} y2={460} show={s >= 3} color={c.cool} />
      </Canvas>
      <At x={120} y={470} w={560}>
        <Fade show={s >= 2}>
          <Label color={c.clayHex}>Key path · witness</Label>
          <div style={{ marginTop: 10 }}>
            <VG_Elem
              w={560}
              label={
                <>
                  signature, secret <M>q</M> = 1 + <M>t</M>
                </>
              }
              size="64 B"
              tone={c.clayHex}
              fill={c.claySoft}
            />
          </div>
          <Note style={{ marginTop: 6 }}>Nothing about the script is revealed.</Note>
        </Fade>
      </At>
      <At x={760} y={470} w={580}>
        <Fade show={s >= 3}>
          <Label color={c.cool}>Script path · witness</Label>
          <div style={{ marginTop: 10 }}>
            <VG_Elem w={580} label="signature by key 2" size="64 B" tone={c.cool} fill={c.coolSoft} />
            <VG_Elem
              w={580}
              label={
                <>
                  script <Code>20 c6047f94…5c709ee5 ac</Code>
                </>
              }
              size="34 B"
            />
            <VG_Elem
              w={580}
              label={
                <>
                  control <Code>c1 79be667e…16f81798</Code>
                </>
              }
              size="33 B"
            />
          </div>
          <Note style={{ marginTop: 6 }}>
            Inputs, the script, then the control block: <Code>c1</Code> = leaf version <Code>c0</Code> + 1 for odd{' '}
            <M>y</M>(<M>Q</M>), followed by <M>x</M>(<M>P</M>).
          </Note>
        </Fade>
      </At>
      <At x={120} y={880} w={1220}>
        <Fade show={s >= 4}>
          <Note>
            Verifier: hash the script, tweak <M>x</M>(<M>P</M>) with it, compare with <M>x</M>(<M>Q</M>) and the parity
            bit, then run the script.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The output shows 32 bytes, <M>x</M>(<M>Q</M>). <M>Q</M> combines the key <M>P</M> and the script.
        </StepItem>
        <StepItem n={2} step={s}>
          Key path: one signature by the owner of <M>P</M>, with the secret adjusted by the tweak.
        </StepItem>
        <StepItem n={3} step={s}>
          Script path: the script, a proof that <M>Q</M> commits to it, and inputs that satisfy it.
        </StepItem>
        <StepItem n={4} step={s}>
          The verifier checks the proof against <M>Q</M>, then runs the script.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Advanced ────────────────────────────────────────────────────────────────

const VG_TsAdvanced: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TS} lens="Advanced" title="Witness validation (BIP341, BIP342)" proc={proc}>
      <Canvas>
        <Arrow x1={380} y1={392} x2={380} y2={446} show color={c.node} />
        <Arrow x1={640} y1={320} x2={716} y2={320} show color={c.node} />
        <Arrow x1={980} y1={496} x2={980} y2={546} show color={c.node} />
        <Arrow x1={1540} y1={496} x2={1540} y2={546} show color={c.node} />
      </Canvas>
      <VG_Card x={120} y={256} w={520} h={136} title="Stack" on={s === 1}>
        <div style={{ fontSize: 22, lineHeight: 1.4 }}>
          0 elements: fail. At least 2 and the last starts with <Code>0x50</Code>: remove it as the annex.
        </div>
      </VG_Card>
      <VG_Card x={120} y={450} w={520} h={250} title="1 element: key path" tone={c.clayHex} on={s === 2}>
        <VG_Rule>64 B: signature with SIGHASH_DEFAULT.</VG_Rule>
        <VG_Rule>65 B: last byte is the hash type; 0x00 is invalid there.</VG_Rule>
        <VG_Rule>BIP340 verify against the output key <M>q</M>.</VG_Rule>
      </VG_Card>
      <VG_Card x={720} y={256} w={1080} h={240} title="2 or more: script path" tone={c.cool} on={s === 3}>
        <VG_Rule>
          Control block <M>c</M>: 33 + 32<M>m</M> bytes, 0 ≤ <M>m</M> ≤ 128. <M>p</M> = <M>c</M>[1:33],{' '}
          <M>P</M> = <Code>lift_x(p)</Code>, fail if not on the curve.
        </VG_Rule>
        <VG_Rule>
          <M>v</M> = <M>c</M>[0] &amp; 0xfe. <M>k</M>
          <sub>0</sub> = <Code>hash_TapLeaf(v ‖ compact_size(s) ‖ s)</Code>.
        </VG_Rule>
        <VG_Rule>
          Fold each 32-byte <M>e</M>
          <sub>j</sub> with <Code>hash_TapBranch</Code>, smaller input first.
        </VG_Rule>
        <VG_Rule>
          <M>t</M> = <Code>hash_TapTweak(p ‖ k_m)</Code>, fail if <M>t ≥ n</M>. <M>x</M>(<M>P + t·G</M>) = <M>q</M> and
          parity = <M>c</M>[0] &amp; 1.
        </VG_Rule>
      </VG_Card>
      <VG_Card x={720} y={550} w={640} h={380} title="Tapscript (BIP342)" on={s === 4}>
        <VG_Rule>Leaf version 0xc0.</VG_Rule>
        <VG_Rule>Any OP_SUCCESSx opcode: the spend succeeds.</VG_Rule>
        <VG_Rule ok={false}>OP_CHECKMULTISIG disabled; OP_CHECKSIGADD added.</VG_Rule>
        <VG_Rule>MINIMALIF is a consensus rule.</VG_Rule>
        <VG_Rule>Sigops budget: 50 + witness size; 50 per signature.</VG_Rule>
        <VG_Rule>Stack ≤ 1000 elements, each ≤ 520 bytes.</VG_Rule>
        <VG_Rule>At the end: exactly one element, and it is true.</VG_Rule>
      </VG_Card>
      <VG_Card x={1400} y={550} w={400} h={380} title="Other leaf versions" on={s === 5}>
        <div style={{ fontSize: 22, lineHeight: 1.45 }}>
          The spend succeeds without further rules. These versions are reserved for soft forks.
        </div>
      </VG_Card>
    </VarShell>
  );
};

// ─── Graphical ───────────────────────────────────────────────────────────────

const VG_MiniTree = ({ dx, mode, s }: { dx: number; mode: 'key' | 'script'; s: number }) => {
  const on = mode === 'key' ? s >= 2 : s >= 3;
  const key = mode === 'key';
  const hidden = { faint: on, dashed: on };
  const Q = { x: 510 + dx, y: 340 };
  const P = { x: 330 + dx, y: 460 };
  const R = { x: 690 + dx, y: 460 };
  const A = { x: 560 + dx, y: 590 };
  const BC = { x: 820 + dx, y: 590 };
  const B = { x: 740 + dx, y: 720 };
  const C = { x: 900 + dx, y: 720 };
  return (
    <g>
      <line x1={P.x} y1={P.y} x2={Q.x} y2={Q.y} style={{ stroke: c.node, strokeWidth: 1.75, opacity: key && on ? 0.25 : 1, transition: `opacity 400ms ${EASE_OUT}` }} />
      <line x1={R.x} y1={R.y} x2={Q.x} y2={Q.y} style={{ stroke: c.node, strokeWidth: 1.75, opacity: key && on ? 0.25 : 1, transition: `opacity 400ms ${EASE_OUT}` }} />
      <line x1={A.x} y1={A.y} x2={R.x} y2={R.y} style={{ stroke: c.node, strokeWidth: 1.75, opacity: on ? 0.25 : 1, transition: `opacity 400ms ${EASE_OUT}` }} />
      <line x1={BC.x} y1={BC.y} x2={R.x} y2={R.y} style={{ stroke: key && on ? c.node : on ? c.cool : c.node, strokeWidth: 1.75, opacity: key && on ? 0.25 : 1, transition: `opacity 400ms ${EASE_OUT}` }} />
      <line x1={B.x} y1={B.y} x2={BC.x} y2={BC.y} style={{ stroke: !key && on ? c.cool : c.node, strokeWidth: 1.75, opacity: key && on ? 0.25 : 1, transition: `opacity 400ms ${EASE_OUT}` }} />
      <line x1={C.x} y1={C.y} x2={BC.x} y2={BC.y} style={{ stroke: c.node, strokeWidth: 1.75, opacity: on ? 0.25 : 1, transition: `opacity 400ms ${EASE_OUT}` }} />
      <VG_Node x={Q.x} y={Q.y} r={34} label="Q" font="math" size={30} tone={c.clayHex} fill={on ? c.claySoft : c.card} />
      <VG_Node x={P.x} y={P.y} r={30} label="P" font="math" size={28} {...(key ? hidden : {})} tone={!key && on ? c.cool : c.node} fill={!key && on ? c.coolSoft : c.card} />
      <VG_Node x={R.x} y={R.y} r={26} {...(key ? hidden : {})} tone={!key && on ? c.cool : c.node} dashed={on} />
      <VG_Node x={A.x} y={A.y} r={on && !key ? 12 : 30} label={on && !key ? undefined : 'A'} {...(key ? hidden : {})} fill={on && !key ? c.node : c.card} />
      <VG_Node x={BC.x} y={BC.y} r={26} {...(key ? hidden : {})} tone={!key && on ? c.cool : c.node} dashed={on} />
      <VG_Node x={B.x} y={B.y} r={30} label="B" {...(key ? hidden : {})} tone={!key && on ? c.cool : c.node} fill={!key && on ? c.coolSoft : c.card} />
      <VG_Node x={C.x} y={C.y} r={on && !key ? 12 : 30} label={on && !key ? undefined : 'C'} {...(key ? hidden : {})} fill={on && !key ? c.node : c.card} />
    </g>
  );
};

const VG_TsGraphical: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const B = 3; // px per byte
  return (
    <VarShell of={VG_OF_TS} lens="Graphical" title="What each spend reveals" proc={proc}>
      <Canvas>
        <text x={510} y={284} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 26, fill: s >= 2 ? c.clayHex : c.muted, transition: `fill 300ms ${EASE_OUT}` }}>
          key path
        </text>
        <text x={1370} y={284} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 26, fill: s >= 3 ? c.cool : c.muted, transition: `fill 300ms ${EASE_OUT}` }}>
          script path
        </text>
        <VG_MiniTree dx={0} mode="key" s={s} />
        <VG_MiniTree dx={860} mode="script" s={s} />
        <GFade show={s >= 3}>
          <circle cx={1000} cy={660} r={10} style={{ fill: c.node }} />
          <text x={1022} y={668} style={{ fontFamily: SANS, fontSize: 22, fill: c.muted }}>
            32-byte hash only
          </text>
          <circle cx={1000} cy={706} r={12} style={{ fill: c.card, stroke: c.cool, strokeWidth: 2, strokeDasharray: '5 5' }} />
          <text x={1022} y={714} style={{ fontFamily: SANS, fontSize: 22, fill: c.muted }}>
            recomputed
          </text>
        </GFade>
        {/* witness bars */}
        <GFade show={s >= 4}>
          <rect x={414} y={826} width={64 * B} height={40} rx={6} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.5 }} />
          <text x={414 + 32 * B} y={900} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.muted }}>
            sig 64
          </text>
          <rect x={1060} y={826} width={64 * B} height={40} rx={6} style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 1.5 }} />
          <text x={1060 + 32 * B} y={900} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.muted }}>
            sig 64
          </text>
          <rect x={1262} y={826} width={120} height={40} rx={6} style={{ fill: c.card, stroke: c.cool, strokeWidth: 1.5 }} />
          <text x={1322} y={900} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.muted }}>
            script
          </text>
          <rect x={1392} y={826} width={97 * B} height={40} rx={6} style={{ fill: c.card, stroke: c.node, strokeWidth: 1.5 }} />
          <text x={1392 + 48 * B} y={900} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 21, fill: c.muted }}>
            control 97
          </text>
        </GFade>
      </Canvas>
    </VarShell>
  );
};

// ─── Explained via bytes ─────────────────────────────────────────────────────

const VG_Bit = ({ b, tone, fill }: { b: string; tone: string; fill: string }) => (
  <div
    style={{
      width: 64,
      height: 64,
      marginRight: 8,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone}`,
      background: fill,
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 26,
    }}
  >
    {b}
  </div>
);

const VG_TsBytes: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  const vtone = c.clayHex;
  return (
    <VarShell of={VG_OF_TS} lens="Explained via bytes" title="Control block, byte by byte" proc={proc}>
      <At x={120} y={256} w={1220}>
        <Label>Leaf B · BIP341 wallet vectors, scriptPubKey[5] · 97 bytes</Label>
        <div style={{ display: 'flex', marginTop: 12 }}>
          <VG_Chip bytes="c0" label="byte 0" hot={s === 2} show={s >= 1} />
          <VG_Chip bytes="e0dfe230…d9602d263e6f" label="bytes 1–32: p" hot={s === 3} show={s >= 1} delay={60} />
          <VG_Chip bytes="9e31407b…24501d5ceaf6" label={<>bytes 33–64: <M>e</M><sub>0</sub></>} hot={s === 4} show={s >= 1} delay={120} />
          <VG_Chip bytes="2645a02e…066ed62b9817" label={<>bytes 65–96: <M>e</M><sub>1</sub></>} hot={s === 4} show={s >= 1} delay={180} />
        </div>
      </At>
      <At x={120} y={420} w={1220}>
        <Fade show={s >= 2}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <VG_Bit b="1" tone={vtone} fill={c.claySoft} />
            <VG_Bit b="1" tone={vtone} fill={c.claySoft} />
            <VG_Bit b="0" tone={vtone} fill={c.claySoft} />
            <VG_Bit b="0" tone={vtone} fill={c.claySoft} />
            <VG_Bit b="0" tone={vtone} fill={c.claySoft} />
            <VG_Bit b="0" tone={vtone} fill={c.claySoft} />
            <VG_Bit b="0" tone={vtone} fill={c.claySoft} />
            <VG_Bit b="0" tone={c.cool} fill={c.coolSoft} />
            <div style={{ marginLeft: 20, fontSize: 22, lineHeight: 1.45 }}>
              <div>
                <Code>c[0] &amp; 0xfe</Code> = <Code>0xc0</Code>: leaf version
              </div>
              <div>
                <Code>c[0] &amp; 1</Code> = 0: <M>y</M>(<M>Q</M>) is even
              </div>
              <div style={{ color: c.muted }}>
                scriptPubKey[6] starts with <Code>c1</Code>: odd <M>y</M>(<M>Q</M>)
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 8, fontSize: 21, color: c.muted }}>
            <span style={{ width: 504, textAlign: 'center', borderTop: `1.5px solid ${vtone}`, paddingTop: 4 }}>leaf version</span>
            <span style={{ width: 64, textAlign: 'center', borderTop: `1.5px solid ${c.cool}`, paddingTop: 4 }}>parity</span>
          </div>
        </Fade>
      </At>
      <At x={120} y={606} w={1220}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 22 }}>
            <M>p</M> = <M>c</M>[1:33], <M>P</M> = <Code>lift_x(p)</Code>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 20, marginTop: 4 }}>
            e0dfe2300b0dd746a3f8674dfd4525623639042569d829c7f0eed9602d263e6f
          </div>
        </Fade>
      </At>
      <At x={120} y={706} w={1220}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 22, lineHeight: 1.5 }}>
            <M>e</M>
            <sub>0</sub> = leaf hash of C (the sibling of B), <M>e</M>
            <sub>1</sub> = leaf hash of A (the sibling of branch BC)
          </div>
        </Fade>
      </At>
      <At x={120} y={786} w={1220}>
        <Fade show={s >= 5}>
          <VG_CodeBox style={{ padding: '12px 20px' }}>
            <div style={{ fontSize: 22, lineHeight: 1.45 }}>
              Length 33 + 32<M>m</M> with 0 ≤ <M>m</M> ≤ 128: 33 to 4129 bytes. Here <M>m</M> = 2. Any other length
              fails.
            </div>
          </VG_CodeBox>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The control block is the last witness element of a script path spend.
        </StepItem>
        <StepItem n={2} step={s}>
          Byte 0: leaf version in the upper 7 bits, parity of <M>y</M>(<M>Q</M>) in the lowest bit.
        </StepItem>
        <StepItem n={3} step={s}>
          Bytes 1–32: the x-only internal key.
        </StepItem>
        <StepItem n={4} step={s}>
          Then one 32-byte hash per level, starting next to the leaf.
        </StepItem>
        <StepItem n={5} step={s}>
          The length fixes <M>m</M>. No directions are stored: branches sort their inputs.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Perspective: chain observer ─────────────────────────────────────────────

const VG_OW = [440, 560, 680];

const VG_TsObserver: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TS} lens="Perspective: chain observer" title="What a chain observer learns" proc={proc}>
      <At x={120} y={250} w={1680}>
        <Row i={0} head>
          <Cell head w={VG_OW[0]}> </Cell>
          <Cell head w={VG_OW[1]} color={c.clayHex}>key path</Cell>
          <Cell head w={VG_OW[2]} color={c.cool}>script path</Cell>
        </Row>
        <Fade show={s >= 1}>
          <Row i={1}>
            <Cell w={VG_OW[0]} color={c.muted}>Output before the spend</Cell>
            <Cell w={VG_OW[1]}><Code>OP_1 &lt;32 B&gt;</Code>, like any taproot output</Cell>
            <Cell w={VG_OW[2]}>the same</Cell>
          </Row>
          <Row i={2}>
            <Cell w={VG_OW[0]} color={c.muted}>Witness</Cell>
            <Cell w={VG_OW[1]}>one signature, 64 or 65 B</Cell>
            <Cell w={VG_OW[2]}>inputs, script, control block</Cell>
          </Row>
        </Fade>
        <Fade show={s >= 2}>
          <Row i={3}>
            <Cell w={VG_OW[0]} color={c.muted}>Spending conditions</Cell>
            <Cell w={VG_OW[1]}>none</Cell>
            <Cell w={VG_OW[2]}>the executed script only</Cell>
          </Row>
          <Row i={4}>
            <Cell w={VG_OW[0]} color={c.muted}>Internal key</Cell>
            <Cell w={VG_OW[1]}>hidden</Cell>
            <Cell w={VG_OW[2]}>revealed, 32 B</Cell>
          </Row>
        </Fade>
        <Fade show={s >= 3}>
          <Row i={5}>
            <Cell w={VG_OW[0]} color={c.muted}>Other scripts</Cell>
            <Cell w={VG_OW[1]}>hidden</Cell>
            <Cell w={VG_OW[2]}>hidden; sibling hashes only</Cell>
          </Row>
          <Row i={6}>
            <Cell w={VG_OW[0]} color={c.muted}>Tree depth</Cell>
            <Cell w={VG_OW[1]}>hidden</Cell>
            <Cell w={VG_OW[2]}>
              path length <M>m</M>: at least <M>m</M> levels
            </Cell>
          </Row>
        </Fade>
        <Fade show={s >= 4}>
          <Row i={7}>
            <Cell w={VG_OW[0]} color={c.muted}>Key path</Cell>
            <Cell w={VG_OW[1]}>used</Cell>
            <Cell w={VG_OW[2]}>not used; a script path exists</Cell>
          </Row>
          <Row i={8}>
            <Cell w={VG_OW[0]} color={c.muted}>Looks like</Cell>
            <Cell w={VG_OW[1]}>a single-key spend</Cell>
            <Cell w={VG_OW[2]}>a script path spend</Cell>
          </Row>
        </Fade>
      </At>
      <At x={120} y={846} w={1680}>
        <Fade show={s >= 4}>
          <Note style={{ fontSize: 22 }}>
            BIP341: the depth of a spent leaf can point to the wallet software that built the tree. Keys should be fresh per
            output and distinct per leaf, so unrevealed leaves cannot be found by brute force.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ─── Worked example end to end ───────────────────────────────────────────────

const VG_VRow = ({ n, s, f, cmp, v, ok }: { n: number; s: number; f: ReactNode; cmp?: ReactNode; v: ReactNode; ok?: boolean }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      height: 58,
      borderBottom: `1px solid ${c.rule}`,
      ...VG_enter(s >= n, 0, 400),
    }}
  >
    <span style={{ width: 450, fontSize: 22, color: s === n ? c.clayHex : c.ink, transition: `color 300ms ${EASE_OUT}` }}>{f}</span>
    <span style={{ width: 270, fontSize: 21, color: c.muted }}>{cmp}</span>
    <span style={{ fontFamily: MONO, fontSize: 20 }}>
      {v}
      {ok && <span style={{ color: c.good }}> ✓</span>}
    </span>
  </div>
);

const VG_TsVerify: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TS} lens="Worked example end to end" title="Verifying a script path spend" proc={proc}>
      <At x={120} y={250} w={1220}>
        <VG_CodeBox style={{ padding: '10px 20px' }}>
          <VG_Kv k="output q" w={170}>91b64d5324723a98…fc21783605</VG_Kv>
          <VG_Kv k="script B" w={170}>20 2352d137f2f3ab38…313d4abda8 ac</VG_Kv>
          <VG_Kv k="control" w={170}>c0 e0dfe230… 9e31407b… 2645a02e…</VG_Kv>
        </VG_CodeBox>
      </At>
      <At x={120} y={426} w={1220}>
        <VG_VRow n={1} s={s} f={<>parse: <M>v</M> = 0xc0, parity 0, <M>m</M> = 2</>} v="p = e0dfe230…2d263e6f" />
        <VG_VRow
          n={2}
          s={s}
          f={
            <>
              <M>k</M>
              <sub>0</sub> = <Code>hash_TapLeaf(c0 ‖ 22 ‖ script)</Code>
            </>
          }
          v="ba982a91d4fc5521…b8e888de1c"
        />
        <VG_VRow
          n={3}
          s={s}
          f={
            <>
              <M>k</M>
              <sub>1</sub> = <Code>hash_TapBranch(e0 ‖ k0)</Code>
            </>
          }
          cmp={<>e0 9e31… &lt; k0 ba98…</>}
          v="ffe578e9ea769027…ccef85e553"
        />
        <VG_VRow
          n={3}
          s={s}
          f={
            <>
              <M>k</M>
              <sub>2</sub> = <Code>hash_TapBranch(e1 ‖ k1)</Code>
            </>
          }
          cmp={<>e1 2645… &lt; k1 ffe5…</>}
          v="ccbd66c6f7e8fdab…f7761ce0e2"
        />
        <VG_VRow
          n={4}
          s={s}
          f={
            <>
              <M>t</M> = <Code>hash_TapTweak(p ‖ k2)</Code>
            </>
          }
          cmp="t < n"
          v="b57bfa183d28eeb6…70d5a786f4"
        />
        <VG_VRow
          n={5}
          s={s}
          f={
            <>
              <M>x</M>(<M>P + t·G</M>), parity of <M>y</M>
            </>
          }
          cmp="= q, even"
          v="91b64d5324723a98…fc21783605"
          ok
        />
      </At>
      <At x={120} y={806} w={1220}>
        <Fade show={s >= 5}>
          <Note>
            Then script B runs: <Code>&lt;2352d137…&gt; OP_CHECKSIG</Code> with the signature from the witness. Values from{' '}
            <Code>bip-0341/wallet-test-vectors.json</Code>, recomputed with the BIP341 algorithm.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Split the control block: version, parity, internal key, two path hashes.
        </StepItem>
        <StepItem n={2} step={s}>
          Hash the revealed script into the leaf hash.
        </StepItem>
        <StepItem n={3} step={s}>
          Fold in each path hash, the smaller hash first.
        </StepItem>
        <StepItem n={4} step={s}>
          Tweak the internal key with the resulting root.
        </StepItem>
        <StepItem n={5} step={s}>
          <M>x</M>(<M>Q</M>) and the parity must match the output. Then the script runs.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Framing: one condition, three encodings ─────────────────────────────────

/** Bottom block of a card: revealed byte count with a proportional bar (1 px per byte). */
const VG_Revealed = ({ n, parts, tone, fill }: { n: number; parts: string; tone: string; fill: string }) => (
  <div style={{ position: 'absolute', left: 20, right: 20, bottom: 20 }}>
    <div style={{ fontSize: 21, color: c.muted }}>revealed for the spend</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 2 }}>
      <span style={{ fontFamily: MONO, fontSize: 32 }}>{n} B</span>
      <span style={{ fontFamily: MONO, fontSize: 20, color: c.muted }}>{parts}</span>
    </div>
    <div
      style={{
        width: n,
        height: 16,
        marginTop: 8,
        boxSizing: 'border-box',
        border: `1.5px solid ${tone}`,
        background: fill,
        borderRadius: 4,
      }}
    />
  </div>
);

const VG_TsThree: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TS} lens="Framing: comparison" title="One key condition, three encodings" proc={proc}>
      <At x={120} y={250} w={1220}>
        <Fade show={s >= 1}>
          <div style={{ fontSize: 26 }}>
            Condition: a valid signature by key <M>A</M>.
          </div>
        </Fade>
      </At>
      <VG_Card x={120} y={316} w={390} h={500} title="NUT-11 JSON secret" tone={c.node} show={s >= 2} on={s === 2}>
        <div style={{ fontSize: 22, lineHeight: 1.45 }}>
          <div>
            Secret <Code>["P2PK", {'{'}…, "data": A{'}'}]</Code>, 195 B as text.
          </div>
          <div style={{ marginTop: 10 }}>
            Witness <Code>{'{"signatures": […]}'}</Code>, 147 B as text.
          </div>
          <div style={{ marginTop: 10, color: c.muted }}>
            The mint sees <M>A</M>, the nonce and all tags.
          </div>
        </div>
        <VG_Revealed n={342} parts="195 + 147" tone={c.node} fill={c.panel} />
      </VG_Card>
      <VG_Card x={535} y={316} w={390} h={500} title="Tapscript leaf" tone={c.cool} show={s >= 3} on={s === 3}>
        <div style={{ fontSize: 22, lineHeight: 1.45 }}>
          <div>
            Leaf <Code>&lt;x(A)&gt; OP_CHECKSIG</Code>, 34 B.
          </div>
          <div style={{ marginTop: 10 }}>Witness: signature 64 B, script 34 B, control block 33 B (one leaf).</div>
          <div style={{ marginTop: 10, color: c.muted }}>
            The chain sees <M>A</M>, the internal key, and that a script path exists.
          </div>
        </div>
        <VG_Revealed n={131} parts="64 + 34 + 33" tone={c.cool} fill={c.coolSoft} />
      </VG_Card>
      <VG_Card x={950} y={316} w={390} h={500} title="Key path" tone={c.clayHex} show={s >= 4} on={s === 4}>
        <div style={{ fontSize: 22, lineHeight: 1.45 }}>
          <div>
            Internal key <M>A</M>, no scripts: <M>Q = A +</M> <Code>hash_TapTweak(x(A))</Code>
            <M>·G</M>.
          </div>
          <div style={{ marginTop: 10 }}>Witness: signature 64 B.</div>
          <div style={{ marginTop: 10, color: c.muted }}>The chain sees a single-key spend.</div>
        </div>
        <VG_Revealed n={64} parts="signature" tone={c.clayHex} fill={c.claySoft} />
      </VG_Card>
      <At x={120} y={846} w={1220}>
        <Fade show={s >= 5}>
          <Note>
            Revealed bytes count the secret and witness text (JSON) or the witness elements (taproot). Nutroot (v3
            keysets, section 2.3) brings the key path and leaf structure into the Cashu secret itself.
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          One condition: a signature by <M>A</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Cashu JSON secret: the condition is text inside the secret. The mint reads it at redemption.
        </StepItem>
        <StepItem n={3} step={s}>
          Tapscript leaf: the condition is a script committed in <M>Q</M>, shown when used.
        </StepItem>
        <StepItem n={4} step={s}>
          Key path: the condition is the key itself.
        </StepItem>
        <StepItem n={5} step={s}>
          Size and disclosure fall from left to right.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ─── Focus: key-path signing key ─────────────────────────────────────────────

const VG_NRow = ({ n, s, f, v, bad = false }: { n: number; s: number; f: ReactNode; v: ReactNode; bad?: boolean }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'baseline',
      minHeight: 76,
      padding: '8px 0',
      boxSizing: 'border-box',
      borderBottom: `1px solid ${c.rule}`,
      ...VG_enter(s >= n, 0, 400),
    }}
  >
    <span style={{ width: 440, flexShrink: 0, fontSize: 24, color: bad ? c.bad : s === n ? c.clayHex : c.ink, transition: `color 300ms ${EASE_OUT}` }}>
      {f}
    </span>
    <span style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.5, color: bad ? c.bad : c.ink }}>{v}</span>
  </div>
);

const VG_TsNegation: Page = () => {
  const proc = useProcess(5, 2400);
  const s = proc.step;
  return (
    <VarShell of={VG_OF_TS} lens="Focus: the key-path signing key" title="Key path signing: two parity adjustments" proc={proc}>
      <At x={120} y={250} w={1220}>
        <Note style={{ fontSize: 22 }}>
          Toy internal secret <M>d</M>
          <sub>0</sub> = 6, no script tree. Values computed with the BIP340 and BIP341 algorithms.
        </Note>
      </At>
      <At x={120} y={300} w={1220}>
        <VG_NRow
          n={1}
          s={s}
          f={
            <>
              <M>P</M> = 6·<M>G</M>, <M>y</M> odd
            </>
          }
          v="x(P) = fff97bd5755eeea4…8b2f057a1460297556"
        />
        <VG_NRow
          n={1}
          s={s}
          f={
            <>
              <M>d</M> = <M>n</M> − 6
            </>
          }
          v={
            <>
              fffffffffffffffffffffffffffffffe…d036413b
              <br />
              <span style={{ color: c.muted }}>d·G = lift_x(x(P)), the even-y point</span>
            </>
          }
        />
        <VG_NRow
          n={2}
          s={s}
          f={
            <>
              <M>t</M> = <Code>hash_TapTweak(x(P))</Code>
            </>
          }
          v="25fee0b2ff9076ea93b70323…9ce98af1843c67265ce1ba5843"
        />
        <VG_NRow
          n={3}
          s={s}
          f={
            <>
              <M>q</M> = <M>d + t</M> mod <M>n</M>
            </>
          }
          v={
            <>
              25fee0b2ff9076ea93b70323…9ce98af1843c67265ce1ba583d
              <br />
              <span style={{ color: c.muted }}>Q = q·G, y odd, x(Q) = a8e1f6946495d797…3cc2fc1a</span>
            </>
          }
        />
        <VG_NRow
          n={4}
          s={s}
          f={
            <>
              BIP340 signs with <M>n − q</M>
            </>
          }
          v={
            <>
              da011f4d006f89156c48fcdc…c5bdaeb7836b382fee7be904
              <br />
              <span style={{ color: c.good }}>signature valid for x(Q) ✓</span>
            </>
          }
        />
        <VG_NRow
          n={5}
          s={s}
          bad
          f={
            <>
              6 + <M>t</M>, no first negation
            </>
          }
          v="x = 411ef3f61fa8e2fb… ≠ x(Q): signature fails ✗"
        />
      </At>
      <At x={120} y={800} w={1220}>
        <Fade show={s >= 5}>
          <Note>
            <Code>taproot_tweak_seckey</Code> (BIP341) negates when <M>y</M>(<M>P</M>) is odd; BIP340 signing negates
            when <M>y</M>(<M>Q</M>) is odd. Both are needed for a signature that verifies against <M>x</M>(<M>Q</M>).
          </Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          6·<M>G</M> has odd <M>y</M>. The x-only key stands for the even point, so the internal secret is{' '}
          <M>n</M> − 6.
        </StepItem>
        <StepItem n={2} step={s}>
          Key-path-only output: tweak over <M>x</M>(<M>P</M>) with an empty root.
        </StepItem>
        <StepItem n={3} step={s}>
          Tweaked secret <M>q = d + t</M>. Here <M>Q</M> has odd <M>y</M> again.
        </StepItem>
        <StepItem n={4} step={s}>
          BIP340 signing negates once more and signs with <M>n − q</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          Skipping the first negation yields a different key. The signature fails.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Deck
// ═════════════════════════════════════════════════════════════════════════════

const VG_Cover: Page = () => (
  <VarCover
    section="2.1–2.2"
    title="JSON secrets and taproot"
    sources={[
      { n: '2.1', title: 'NUT-10 well-known secrets', count: 7 },
      { n: '2.1', title: 'Conditions as tags: HTLC (NUT-14)', count: 7 },
      { n: '2.2', title: 'Taproot output keys (BIP341)', count: 7 },
      { n: '2.2', title: 'Key path and script path (BIP341, BIP342)', count: 8 },
    ]}
  />
);

const PAGES: [Page, string | undefined][] = [
  [VG_Cover, undefined],
  // 2.1 NUT-10 well-known secrets
  [JsonSecret, 'Original slide.'],
  [
    VG_JsBeginner,
    'Beginner. A plain NUT-00 proof next to a P2PK-locked proof, one field at a time. Say: the secret either is random, or it is a JSON text that names a rule; the mint adds one check for the rule, and only if it supports the kind.',
  ],
  [
    VG_JsAdvanced,
    'Advanced. The NUT-10 structure rules and the NUT-11 tag, key and signature rules, applied to the complex P2PK example. Emphasize the MUST-reject cases, key comparison by x-coordinate, and counting distinct keys rather than signatures.',
  ],
  [
    VG_JsGraphical,
    'Graphical. Three nested layers: JSON array, secret string, proof JSON. The same string feeds hash_to_curve for Y and SHA-256 for the signature. Let the figure build; little to say beyond naming the layers.',
  ],
  [
    VG_JsBytes,
    'Explained via bytes. The 195 bytes by field, the 213 escaped characters on the wire, the hash_to_curve counter, and the signed digest, all computed from the NUT-11 example. The signature from the spec verifies over SHA-256 of the 195 bytes.',
  ],
  [
    VG_JsMint,
    'Perspective: mint. The checks CDK runs when this proof is swapped, in code order: input limits, C = k·Y, spending conditions, the P2PK witness, then the swap saga. Function names are from crates/cdk/src/mint/swap/mod.rs.',
  ],
  [
    VG_JsFailure,
    'Framing: failure mode. The secret is a string, not a JSON value. Re-serializing with different whitespace changes Y and the digest; signing the escaped form changes the message. All hashes computed from the NUT-11 example.',
  ],
  [
    VG_JsConstraint,
    'Framing: the constraint that forces the design. Issuance is blind and C commits only to the secret bytes, so any condition the mint enforces has to be inside the secret. That is why the policy is revealed at redemption and why the secret grows.',
  ],
  // 2.1 Conditions as tags: HTLC
  [JsonLimits, 'Original slide.'],
  [
    VG_HtBeginner,
    'Beginner. The NUT-14 example secret, one tag at a time, with the example preimage/hash pair and the locktime as a date. End with the two pathways on a time axis.',
  ],
  [
    VG_HtAdvanced,
    'Advanced. The HTLC rules from NUT-14 and the multisig rules it inherits from NUT-11: hash format, receiver and sender pathways, defaults, no-refund and no-locktime cases, distinct-key counting, NUT-07 witness retrieval.',
  ],
  [
    VG_HtGraphical,
    'Graphical. Who can spend over time for three tag configurations: with refund, locktime without refund (anyone after the locktime), and no locktime (receiver only).',
  ],
  [
    VG_HtTable,
    'Explained via a truth table. The spend rule as R or S or A, then six concrete cases. Row 3, a refund signature before the locktime, is one of the invalid NUT-11 test vectors.',
  ],
  [
    VG_HtParties,
    'Perspective: sender and receiver. A sequence diagram: both check mint info, the sender locks, the receiver swaps with preimage and signature, the sender learns the preimage through the NUT-07 state check, or takes the refund path after the locktime.',
  ],
  [
    VG_HtSizes,
    'Framing: cost and sizes. Secret length for the spec examples, from 64 to 567 characters, against 66 for any v3 secret. Witnesses add 128 hex characters per signature; CDK caps secret and witness at 1024 characters.',
  ],
  [
    VG_HtSigAll,
    'Focus: the SIG_ALL message. The concatenated string for a swap and a melt, with lengths and digests from the NUT-11 test vectors; the spec signatures verify over these digests. All inputs must share kind, data and tags.',
  ],
  // 2.2 Taproot output keys
  [TaprootTree, 'Original slide.'],
  [
    VG_TtBeginner,
    'Beginner. A one-leaf tree with toy keys: internal secret 1, script key secret 2. Every value from script bytes to the output script is computed. Point out that the key-path secret is literally 1 + t.',
  ],
  [
    VG_TtAdvanced,
    'Advanced. The rules around the tweak: x-only keys and even y, rejecting t ≥ n, committing to an empty tree when there are no scripts, NUMS internal keys, leaf version constraints and sorted branches, with pointers to the BIP341 reference code and vectors.',
  ],
  [
    VG_TtGraphical,
    'Graphical. The three-leaf tree built bottom-up, coloured by tag: TapLeaf, TapBranch, TapTweak. Hashes flow up to the tweak, which moves P to Q.',
  ],
  [
    VG_TtCode,
    'Explained via code. The whole construction as short Python: tagged hash, leaf hash, sorted branch hash, tweak with the t ≥ n check, even-y lift, parity. Step through the highlighted lines.',
  ],
  [
    VG_TtConstructor,
    'Perspective: the wallet that builds the output. A three-condition policy becomes an aggregate internal key plus two leaves, following the BIP341 construction guidelines. Stress what the wallet must store to spend later.',
  ],
  [
    VG_TtHuffman,
    'Framing: tree shape and proof size. Four leaves with spend probabilities; balanced tree against a Huffman tree. Expected control block 97 B against 84.2 B, at the cost of 129 B for the rare leaves and a depth that leaks information.',
  ],
  [
    VG_TtTags,
    'Focus: tagged hashes. The 64-byte tag prefix, and what each of the three tags hashes, with message sizes. The tag digests are computed. Nutroot reuses the structure with its own tags.',
  ],
  // 2.2 Key path and script path
  [TaprootSpend, 'Original slide.'],
  [
    VG_TsBeginner,
    'Beginner. The toy output from the previous group, spent both ways. Key path: one 64-byte signature. Script path: signature, 34-byte script, 33-byte control block starting with c1 because y(Q) is odd.',
  ],
  [
    VG_TsAdvanced,
    'Advanced. The BIP341 witness validation procedure as a flow: annex, key path signature sizes, control block checks and commitment, then the BIP342 tapscript rules and the upgrade path for unknown leaf versions.',
  ],
  [
    VG_TsGraphical,
    'Graphical. The same tree seen through each spend: key path shows only Q; script path shows P, script B and two hashes, and the verifier recomputes the branch and root. Witness sizes at the bottom.',
  ],
  [
    VG_TsBytes,
    'Explained via bytes. The 97-byte control block for leaf B from a BIP341 test vector: the version and parity bits of byte 0, the internal key, and the two path hashes. Length alone determines the path length.',
  ],
  [
    VG_TsObserver,
    'Perspective: chain observer. What each spend type discloses, following the BIP341 security section: key path looks like a single-key spend; script path reveals one script, the internal key and the depth.',
  ],
  [
    VG_TsVerify,
    'Worked example end to end. Verification of leaf B from the BIP341 vector with real values: leaf hash, two branch steps with the ordering decision, tweak, and the comparison with the output key.',
  ],
  [
    VG_TsThree,
    'Framing: comparison. One condition, a signature by A, as a NUT-11 JSON secret, as a tapscript leaf, and as a key path. Revealed data shrinks from 342 bytes to 64. Nutroot borrows the taproot commitment structure for Cashu secrets.',
  ],
  [
    VG_TsNegation,
    'Focus: the key-path signing key. With internal secret 6, whose point has odd y, the secret is negated before tweaking, and BIP340 negates again because Q has odd y. Skipping the first negation produces a key that does not match.',
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · JSON secrets and taproot (temporary)',
  createdAt: '2026-09-28T09:04:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
