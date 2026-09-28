import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';
import {
  Arrow,
  At,
  Band,
  Canvas,
  Draw,
  EASE_OUT,
  Fade,
  FederationId,
  Funding,
  GFade,
  KeyMaterial,
  Lifeline,
  Line,
  M,
  MONO,
  Melt,
  Member,
  Note,
  Packet,
  REDUCED,
  ROSTER_A,
  ROSTER_B,
  Recovery,
  RosterLine,
  SANS,
  StepItem,
  StepList,
  T,
  VarCover,
  VarShell,
  WalletNode,
  c,
  useProcess,
  useSha256,
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

const VE_VIOLET_SOFT = 'rgba(122, 95, 166, 0.10)';
const VE_soft = (tone: string) =>
  tone === c.clayHex
    ? c.claySoft
    : tone === c.cool
      ? c.coolSoft
      : tone === c.good
        ? c.goodSoft
        : tone === c.bad
          ? c.badSoft
          : tone === c.violet
            ? VE_VIOLET_SOFT
            : c.panel;

const VE_enter = (show: boolean, dimTo = 0, delay = 0, dur = 450): CSSProperties => ({
  opacity: show ? 1 : dimTo,
  transform: show || REDUCED || dimTo > 0 ? 'translateY(0px)' : 'translateY(6px)',
  transition: `opacity ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms, transform ${dur}ms ${EASE_OUT} ${show ? delay : 0}ms, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}, color 300ms ${EASE_OUT}`,
});

const VE_Label = ({ children, color = c.muted, style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <div style={{ fontSize: 21, letterSpacing: '0.08em', textTransform: 'uppercase', color, fontFamily: SANS, ...style }}>
    {children}
  </div>
);

/** Inline code that never drops below 21 px. */
const VE_C = ({ children, color }: { children: ReactNode; color?: string }) => (
  <span style={{ fontFamily: MONO, fontSize: 'max(21px, 0.88em)', color }}>{children}</span>
);

/** Math subscript at the minimum text size (for indices without a Unicode glyph). */
const VE_Sub = ({ children }: { children: ReactNode }) => (
  <sub style={{ fontSize: 21, lineHeight: 0, verticalAlign: '-0.3em' }}>{children}</sub>
);

const VE_NoWrap = ({ children }: { children: ReactNode }) => <span style={{ whiteSpace: 'nowrap' }}>{children}</span>;

const VE_Box = ({
  x,
  y,
  w,
  h,
  tone = c.rule,
  fill,
  show = true,
  dimTo = 0,
  delay = 0,
  title,
  titleColor,
  titleMono,
  size = 23,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  tone?: string;
  fill?: string;
  show?: boolean;
  dimTo?: number;
  delay?: number;
  title?: ReactNode;
  titleColor?: string;
  titleMono?: boolean;
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
      border: `1.5px solid ${tone}`,
      background: fill ?? c.card,
      borderRadius: 12,
      padding: '14px 22px',
      ...VE_enter(show, dimTo, delay),
    }}
  >
    {title && !titleMono && <VE_Label color={titleColor ?? (tone === c.rule ? c.muted : tone)}>{title}</VE_Label>}
    {title && titleMono && (
      <div style={{ fontFamily: MONO, fontSize: 21, color: titleColor ?? (tone === c.rule ? c.muted : tone) }}>{title}</div>
    )}
    <div style={{ fontSize: size, lineHeight: 1.42, marginTop: title ? 8 : 0 }}>{children}</div>
  </div>
);

const VE_TD = ({
  w,
  children,
  head,
  color,
  mono,
  size = 23,
}: {
  w: number;
  children?: ReactNode;
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
      padding: '0 16px',
      fontSize: head ? 21 : mono ? size - 1 : size,
      fontFamily: mono ? MONO : undefined,
      letterSpacing: head ? '0.08em' : undefined,
      textTransform: head ? 'uppercase' : undefined,
      color: color ?? (head ? c.muted : c.ink),
      lineHeight: 1.32,
    }}
  >
    {children}
  </div>
);

const VE_TR = ({
  children,
  h = 56,
  head,
  show = true,
  dimTo = 0.18,
  hot,
  tone = c.clayHex,
  delay = 0,
}: {
  children: ReactNode;
  h?: number;
  head?: boolean;
  show?: boolean;
  dimTo?: number;
  hot?: boolean;
  tone?: string;
  delay?: number;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      height: h,
      borderBottom: `1px solid ${head ? c.line : c.rule}`,
      background: hot ? VE_soft(tone) : 'transparent',
      borderRadius: 4,
      ...VE_enter(show, dimTo, delay, 400),
    }}
  >
    {children}
  </div>
);

/** One line of a code block; `on` highlights it. */
const VE_CL = ({ on, children, color }: { on?: boolean; children?: ReactNode; color?: string }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 21,
      lineHeight: 1.5,
      whiteSpace: 'pre',
      padding: '0 10px',
      margin: '0 -10px',
      borderRadius: 6,
      color,
      background: on ? c.claySoft : 'transparent',
      transition: `background 300ms ${EASE_OUT}`,
    }}
  >
    {children}
  </div>
);

const VE_CodeBox = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
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

/** A byte segment with a caption underneath. */
const VE_Seg = ({
  bytes,
  label,
  tone = 'field',
  show = true,
  delay = 0,
  hot = false,
  w,
}: {
  bytes: ReactNode;
  label?: ReactNode;
  tone?: 'len' | 'field' | 'int';
  show?: boolean;
  delay?: number;
  hot?: boolean;
  w?: number;
}) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: w,
      flexShrink: 0,
      marginRight: 8,
      ...VE_enter(show, 0, delay, 400),
    }}
  >
    <span
      style={{
        fontFamily: MONO,
        fontSize: 21,
        padding: '5px 9px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        border: `1.5px solid ${hot ? c.clayHex : tone === 'len' ? c.rule : tone === 'int' ? c.cool : c.line}`,
        background: hot ? c.claySoft : tone === 'len' ? c.panel : tone === 'int' ? c.coolSoft : c.card,
        color: tone === 'len' && !hot ? c.muted : c.ink,
        transition: `background 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
      }}
    >
      {bytes}
    </span>
    {label && <span style={{ fontSize: 21, color: c.muted, marginTop: 4, whiteSpace: 'nowrap' }}>{label}</span>}
  </div>
);

const VE_Pill = ({ children, tone = c.good, show = true, delay = 0 }: { children: ReactNode; tone?: string; show?: boolean; delay?: number }) => (
  <span
    style={{
      display: 'inline-block',
      border: `1.5px solid ${tone}`,
      background: VE_soft(tone),
      color: tone,
      borderRadius: 999,
      padding: '5px 18px',
      fontSize: 22,
      whiteSpace: 'nowrap',
      ...VE_enter(show, 0, delay, 400),
    }}
  >
    {children}
  </span>
);

/** Text that re-enters whenever its key changes (status lines). */
const VE_Swap = ({ k, children, style }: { k: string | number; children: ReactNode; style?: CSSProperties }) => (
  <div key={k} style={{ animation: REDUCED ? 'none' : `fc-in 400ms ${EASE_OUT} both`, ...style }}>
    {children}
  </div>
);

const VE_Bullet = ({ children, color = c.clayHex, gap = 10 }: { children: ReactNode; color?: string; gap?: number }) => (
  <div style={{ display: 'flex', gap: 12, marginTop: gap }}>
    <span style={{ color, fontFamily: MONO, flexShrink: 0 }}>–</span>
    <span>{children}</span>
  </div>
);

const VE_Mark = ({ ok = true }: { ok?: boolean }) => (
  <span style={{ fontFamily: MONO, color: ok ? c.good : c.bad }}>{ok ? '✓' : '✗'}</span>
);

// ═════════════════════════════════════════════════════════════════════════════
// 1.4 Federation ID
// ═════════════════════════════════════════════════════════════════════════════

const VE_FidBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const hexA = useSha256(ROSTER_A);
  const hexB = useSha256(ROSTER_B);
  return (
    <VarShell of="1.4 Federation ID" lens="Beginner" title="A federation ID from three roster rows" proc={proc}>
      <At x={120} y={262} w={1200}>
        <div
          style={{
            border: `1.5px solid ${c.rule}`,
            borderRadius: 12,
            background: c.card,
            padding: '14px 28px',
            fontFamily: MONO,
            fontSize: 22,
            lineHeight: 1.85,
          }}
        >
          <div style={{ display: 'flex', gap: 24, fontFamily: 'inherit' }}>
            <VE_Label style={{ width: 40 }}>id</VE_Label>
            <VE_Label style={{ flex: 1 }}>public URL</VE_Label>
            <VE_Label>identity key</VE_Label>
          </div>
          <Fade show={s >= 2} dimTo={0.12}>
            <span style={{ color: c.muted }}>thresholds </span>t=2 c=3
          </Fade>
          <Fade show={s >= 1} dimTo={0.12}>
            <RosterLine m="m1" url="https://m1.mint.example" id="4c1f" />
          </Fade>
          <Fade show={s >= 1} dimTo={0.12} delay={60}>
            <RosterLine
              m="m2"
              hot={s >= 5}
              url={
                <>
                  https://m2.mint.example
                  <span style={{ color: c.clayHex, opacity: s >= 5 ? 1 : 0, transition: `opacity 300ms ${EASE_OUT}` }}>
                    .org
                  </span>
                </>
              }
              id="9a07"
            />
          </Fade>
          <Fade show={s >= 1} dimTo={0.12} delay={120}>
            <RosterLine m="m3" url="https://m3.mint.example" id="e21b" />
          </Fade>
        </div>
      </At>
      <At x={120} y={548} w={1200}>
        <Fade show={s >= 3}>
          <VE_Label>Written out as one string (illustrative)</VE_Label>
          <div
            style={{
              marginTop: 8,
              fontFamily: MONO,
              fontSize: 21,
              lineHeight: 1.5,
              wordBreak: 'break-all',
              background: c.panel,
              borderRadius: 10,
              padding: '8px 16px',
            }}
          >
            {s >= 5 ? ROSTER_B : ROSTER_A}
          </div>
        </Fade>
      </At>
      <At x={120} y={690} w={1200}>
        <Fade show={s >= 4}>
          <VE_Label>SHA-256 of that string: the federation ID, 32 bytes</VE_Label>
          <div style={{ fontFamily: MONO, fontSize: 26, marginTop: 6, color: c.clayHex }}>{hexA}</div>
        </Fade>
      </At>
      <At x={120} y={790} w={1200}>
        <Fade show={s >= 5}>
          <VE_Label>After adding “.org” to m2's URL</VE_Label>
          <div style={{ fontFamily: MONO, fontSize: 26, marginTop: 6, color: c.violet }}>{hexB}</div>
          <Note style={{ marginTop: 18 }}>No part of the old ID survives. A changed roster is a different federation.</Note>
        </Fade>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Each member has an ID, a public URL and an identity key.
        </StepItem>
        <StepItem n={2} step={s}>
          Thresholds: <M>t</M> = 2 shares per signature, <M>c</M> = 3 members to order.
        </StepItem>
        <StepItem n={3} step={s}>
          The roster is written out as one string.
        </StepItem>
        <StepItem n={4} step={s}>
          SHA-256 maps it to 32 bytes: the federation ID.
        </StepItem>
        <StepItem n={5} step={s}>
          Change one URL: the new hash is unrelated to the old one.
        </StepItem>
        <Note style={{ marginTop: 20, fontSize: 22 }}>
          SHA-256 is a hash function: equal inputs give equal outputs, any change gives an unpredictable new output.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VE_FID_A = 'c256f6d7290141d4408fd3f4f4f7b9f5667b803193348c2ce3608604e8c1e412';
const VE_FID_B = '83a0f86389a16b9553cb2a667139741803e4015bf5caeba4b3e39269eca1f293';

const VE_RowTag = ({ y, children }: { y: number; children: ReactNode }) => (
  <At x={120} y={y + 6} style={{ fontFamily: MONO, fontSize: 24, color: c.muted }}>
    {children}
  </At>
);

const VE_FidBytes: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const ch = s >= 4;
  return (
    <VarShell of="1.4 Federation ID" lens="Explained via bytes" title="The roster transcript, byte by byte" proc={proc}>
      <At x={120} y={262}>
        <VE_Label>Header</VE_Label>
      </At>
      <At x={120} y={294}>
        <div style={{ display: 'flex' }}>
          <VE_Seg bytes="00000018" label="len" tone="len" show={s >= 1} />
          <VE_Seg bytes="cdk-federation-roster-v1" label="domain" show={s >= 1} delay={50} />
          <VE_Seg bytes="0101…01" label="setup authorization, 32 B" show={s >= 1} delay={100} />
          <VE_Seg bytes="0003" label="n" tone="int" show={s >= 1} delay={150} />
          <VE_Seg bytes="0002" label="t" tone="int" show={s >= 1} delay={200} />
          <VE_Seg bytes="0003" label="c" tone="int" show={s >= 1} delay={250} />
        </div>
      </At>
      <At x={120} y={386}>
        <VE_Label>Members, ascending member_id</VE_Label>
      </At>
      <VE_RowTag y={418}>m1</VE_RowTag>
      <At x={190} y={418}>
        <div style={{ display: 'flex' }}>
          <VE_Seg w={100} bytes="0001" label="member_id" tone="int" show={s >= 2} />
          <VE_Seg w={124} bytes="00000017" label="len" tone="len" show={s >= 2} delay={40} />
          <VE_Seg w={370} bytes="https://m1.mint.example" label="public_mint_url" show={s >= 2} delay={80} />
          <VE_Seg w={124} bytes="0000001b" label="len" tone="len" show={s >= 2} delay={120} />
          <VE_Seg w={370} bytes="https://fed.m1.mint.example" label="federation_api_url" show={s >= 2} delay={160} />
          <VE_Seg w={124} bytes="00000021" label="len" tone="len" show={s >= 2} delay={200} />
          <VE_Seg w={214} bytes="0279be66…f81798" label="identity key 1·G" show={s >= 2} delay={240} />
        </div>
      </At>
      <VE_RowTag y={498}>m2</VE_RowTag>
      <At x={190} y={498}>
        <div style={{ display: 'flex' }}>
          <VE_Seg w={100} bytes="0002" tone="int" show={s >= 2} delay={100} />
          <VE_Seg w={124} bytes={ch ? '0000001b' : '00000017'} tone="len" hot={ch} show={s >= 2} delay={140} />
          <VE_Seg w={370}
            bytes={
              <>
                https://m2.mint.example
                {ch && <span style={{ color: c.clayHex }}>.org</span>}
              </>
            }
            hot={ch}
            show={s >= 2}
            delay={180}
          />
          <VE_Seg w={124} bytes="0000001b" tone="len" show={s >= 2} delay={220} />
          <VE_Seg w={370} bytes="https://fed.m2.mint.example" show={s >= 2} delay={260} />
          <VE_Seg w={124} bytes="00000021" tone="len" show={s >= 2} delay={300} />
          <VE_Seg w={214} bytes="02c6047f…709ee5" show={s >= 2} delay={340} />
        </div>
      </At>
      <VE_RowTag y={550}>m3</VE_RowTag>
      <At x={190} y={550}>
        <div style={{ display: 'flex' }}>
          <VE_Seg w={100} bytes="0003" tone="int" show={s >= 2} delay={200} />
          <VE_Seg w={124} bytes="00000017" tone="len" show={s >= 2} delay={240} />
          <VE_Seg w={370} bytes="https://m3.mint.example" show={s >= 2} delay={280} />
          <VE_Seg w={124} bytes="0000001b" tone="len" show={s >= 2} delay={320} />
          <VE_Seg w={370} bytes="https://fed.m3.mint.example" show={s >= 2} delay={360} />
          <VE_Seg w={124} bytes="00000021" tone="len" show={s >= 2} delay={400} />
          <VE_Seg w={214} bytes="02f9308a…e036f9" show={s >= 2} delay={440} />
        </div>
      </At>
      <At x={120} y={620} w={1680}>
        <Fade show={s >= 3}>
          <VE_Label>SHA-256 over 357 bytes = federation_id</VE_Label>
          <div style={{ fontFamily: MONO, fontSize: 26, marginTop: 6, color: ch ? c.dim : c.clayHex, transition: `color 300ms ${EASE_OUT}` }}>
            {VE_FID_A}
          </div>
        </Fade>
      </At>
      <At x={120} y={716} w={1680}>
        <Fade show={ch}>
          <VE_Label>m2 public URL plus “.org”: 361 bytes</VE_Label>
          <div style={{ fontFamily: MONO, fontSize: 26, marginTop: 6, color: c.violet }}>{VE_FID_B}</div>
        </Fade>
      </At>
      <At x={120} y={830} w={1680}>
        <Note>
          <div>Length prefixes are u32 big-endian; n, t, c and member_id are u16 big-endian.</div>
          <div>
            Toy roster: setup authorization 32 × <VE_C>0x01</VE_C> (as in the code's tests), identity keys 1·G, 2·G, 3·G.
          </div>
          <div>
            <VE_C>crates/cdk-common/src/federation/config.rs</VE_C> · <VE_C>derive_federation_id</VE_C>
          </div>
        </Note>
      </At>
    </VarShell>
  );
};

const VE_FidAdvanced: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.4 Federation ID" lens="Advanced" title="Two hashes and where they are checked" proc={proc}>
      <At x={120} y={262} w={820}>
        <Fade show={s >= 1} dimTo={0.25}>
          <VE_Label>federation_id: roster only</VE_Label>
          <VE_CodeBox style={{ marginTop: 10 }}>
            <VE_CL>federation_id = SHA-256(</VE_CL>
            <VE_CL>{'    lp("cdk-federation-roster-v1")'}</VE_CL>
            <VE_CL>{'  ‖ setup_authorization               32 B'}</VE_CL>
            <VE_CL>{'  ‖ member_count ‖ signature_threshold'}</VE_CL>
            <VE_CL>{'  ‖ consensus_threshold        u16 BE each'}</VE_CL>
            <VE_CL>{'  ‖ for each member, ascending id:'}</VE_CL>
            <VE_CL>{'      member_id ‖ lp(public_mint_url)'}</VE_CL>
            <VE_CL>{'      ‖ lp(federation_api_url)'}</VE_CL>
            <VE_CL>{'      ‖ lp(identity_public_key) )    33 B'}</VE_CL>
          </VE_CodeBox>
        </Fade>
      </At>
      <At x={980} y={262} w={820}>
        <Fade show={s >= 2} dimTo={0.25}>
          <VE_Label>config_digest: the whole public config</VE_Label>
          <VE_CodeBox style={{ marginTop: 10 }}>
            <VE_CL>config_digest = SHA-256(</VE_CL>
            <VE_CL>{'    lp("cdk-federation-config-digest-v1")'}</VE_CL>
            <VE_CL>{'  ‖ lp(serde_json(FederationConfig)) )'}</VE_CL>
            <VE_CL> </VE_CL>
            <VE_CL color={c.muted}>{'lp(x) = u32 BE length ‖ x'}</VE_CL>
          </VE_CodeBox>
          <Note style={{ marginTop: 16 }}>
            <div>Covers keysets, policies, FROST wallet config and setup transcript as well.</div>
            <div>
              <VE_C>KeysetRotation</VE_C> changes <VE_C>config_digest</VE_C>, never <VE_C>federation_id</VE_C>.
            </div>
          </Note>
        </Fade>
      </At>
      <VE_Box x={120} y={640} w={540} h={300} title="Config validation" show={s >= 3} size={22}>
        <VE_Bullet gap={0}>
          <VE_C>validate()</VE_C> recomputes the ID; a difference is <VE_C>FederationIdMismatch</VE_C>.
        </VE_Bullet>
        <VE_Bullet>
          <M>n</M> ≥ 2 and 1 ≤ <M>t</M> ≤ <M>c</M> ≤ <M>n</M>.
        </VE_Bullet>
        <VE_Bullet>
          Production and wallet import:{' '}
          <VE_NoWrap>
            <M>f</M> = ⌊(<M>n</M> − 1)/3⌋,
          </VE_NoWrap>{' '}
          <VE_NoWrap>
            <M>t</M> ≥ <M>f</M> + 1,
          </VE_NoWrap>{' '}
          <VE_NoWrap>
            <M>c</M> ≥ <M>n</M> − <M>f</M>.
          </VE_NoWrap>
        </VE_Bullet>
      </VE_Box>
      <VE_Box x={690} y={640} w={540} h={300} title="Consensus and DKG" show={s >= 3} delay={80} size={22}>
        <VE_Bullet gap={0}>
          Every envelope is <VE_C>{'{ federation_id, version, operation }'}</VE_C>; its hash is the <VE_C>operation_id</VE_C>.
        </VE_Bullet>
        <VE_Bullet>BLS and FROST DKG results bind the federation ID and setup authorization.</VE_Bullet>
        <VE_Bullet>Startup, DKG and catch-up fail closed on a mismatch.</VE_Bullet>
      </VE_Box>
      <VE_Box x={1260} y={640} w={540} h={300} title="Wallet, per member" tone={c.cool} show={s >= 4} size={22}>
        <VE_Bullet gap={0} color={c.cool}>
          Mint info carries <VE_C>federation_id</VE_C>, <VE_C>member_id</VE_C>, <VE_C>config_digest</VE_C>,{' '}
          <VE_C>wallet_protocol_version</VE_C>.
        </VE_Bullet>
        <VE_Bullet color={c.cool}>Checked in that order; a member that fails is excluded.</VE_Bullet>
        <VE_Bullet color={c.cool}>
          Aggregation needs <M>t</M> valid members.
        </VE_Bullet>
      </VE_Box>
    </VarShell>
  );
};

const VE_DocRow = ({ i, label, tone, hot, show }: { i: number; label: string; tone: string; hot?: boolean; show: boolean }) => (
  <div
    style={{
      position: 'absolute',
      left: 136,
      top: 318 + i * 56,
      width: 448,
      height: 46,
      boxSizing: 'border-box',
      borderLeft: `4px solid ${tone}`,
      borderRadius: 4,
      background: hot ? VE_soft(tone) : c.panel,
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      fontSize: 23,
      ...VE_enter(show, 0.3),
    }}
  >
    {label}
  </div>
);

const VE_HashNode = ({ x, y, show }: { x: number; y: number; show: boolean }) => (
  <GFade show={show}>
    <circle cx={x} cy={y} r={52} style={{ fill: c.card, stroke: c.ink, strokeWidth: 1.75 }} />
    <T x={x} y={y + 8} size={21}>
      SHA-256
    </T>
  </GFade>
);

const VE_FidGraphical: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const idV = s >= 4 ? 'A′' : 'A';
  const dV = s >= 4 ? 'D″' : s >= 3 ? 'D′' : 'D';
  return (
    <VarShell of="1.4 Federation ID" lens="Graphical" title="What each hash covers" proc={proc}>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 262,
          width: 480,
          height: 700,
          boxSizing: 'border-box',
          border: `1.5px solid ${c.line}`,
          borderRadius: 12,
          background: c.card,
          padding: '14px 16px',
        }}
      >
        <VE_Label>FederationConfig</VE_Label>
      </div>
      <VE_DocRow i={0} label="setup authorization" tone={c.clayHex} show={s >= 1} />
      <VE_DocRow i={1} label="n · t · c" tone={c.clayHex} show={s >= 1} />
      <VE_DocRow i={2} label="m1 · URLs · key" tone={c.clayHex} show={s >= 1} />
      <VE_DocRow i={3} label="m2 · URLs · key" tone={c.clayHex} show={s >= 1} hot={s >= 4} />
      <VE_DocRow i={4} label="m3 · URLs · key" tone={c.clayHex} show={s >= 1} />
      <VE_DocRow i={5} label="wallet protocol" tone={c.violet} show={s >= 2} />
      <VE_DocRow i={6} label="observation policy" tone={c.violet} show={s >= 2} />
      <VE_DocRow i={7} label="checkpoint policy" tone={c.violet} show={s >= 2} />
      <VE_DocRow i={8} label="FROST wallet" tone={c.violet} show={s >= 2} />
      <VE_DocRow i={9} label="BLS keysets" tone={c.violet} show={s >= 2} hot={s >= 3} />
      <VE_DocRow i={10} label="setup transcript" tone={c.violet} show={s >= 2} />
      <Canvas>
        <GFade show={s >= 1}>
          <path d="M 604 318 H 624 V 588 H 604" style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 2 }} />
        </GFade>
        <Arrow x1={624} y1={453} x2={764} y2={453} show={s >= 1} color={c.clayHex} />
        <VE_HashNode x={820} y={453} show={s >= 1} />
        <Arrow x1={872} y1={453} x2={926} y2={453} show={s >= 1} color={c.clayHex} delay={300} />
        <GFade show={s >= 2}>
          <path d="M 636 318 H 652 V 920 H 604" style={{ fill: 'none', stroke: c.violet, strokeWidth: 2 }} />
        </GFade>
        <Arrow x1={652} y1={760} x2={764} y2={760} show={s >= 2} color={c.violet} />
        <VE_HashNode x={820} y={760} show={s >= 2} />
        <Arrow x1={872} y1={760} x2={926} y2={760} show={s >= 2} color={c.violet} delay={300} />
      </Canvas>
      <VE_Box x={930} y={395} w={330} h={116} tone={c.clayHex} show={s >= 1} delay={400} title="federation_id">
        <VE_Swap k={idV}>
          <M size={34} color={s >= 4 ? c.clayHex : c.ink}>
            {idV}
          </M>
        </VE_Swap>
      </VE_Box>
      <VE_Box x={930} y={702} w={330} h={116} tone={c.violet} show={s >= 2} delay={400} title="config_digest">
        <VE_Swap k={dV}>
          <M size={34} color={s >= 3 ? c.violet : c.ink}>
            {dV}
          </M>
        </VE_Swap>
      </VE_Box>
      <At x={1320} y={432}>
        <Fade show={s === 3}>
          <span style={{ fontSize: 24, color: c.good }}>unchanged ✓</span>
        </Fade>
      </At>
      <At x={1320} y={426}>
        <Fade show={s >= 4}>
          <VE_Pill tone={c.clayHex}>m2 URL changed</VE_Pill>
        </Fade>
      </At>
      <At x={1320} y={736}>
        <Fade show={s >= 3}>
          <VE_Pill tone={c.violet}>KeysetRotation</VE_Pill>
        </Fade>
      </At>
    </VarShell>
  );
};

const VE_FT = [560, 250, 250, 620];
const VE_Yes = () => <span style={{ color: c.clayHex }}>yes</span>;
const VE_No = () => <span style={{ color: c.dim }}>no</span>;

const VE_FidTable: Page = () => {
  const proc = useProcess(3);
  const s = proc.step;
  return (
    <VarShell of="1.4 Federation ID" lens="Framing: decision table" title="Which changes need a new federation" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VE_TR head h={48}>
          <VE_TD head w={VE_FT[0]}>Change</VE_TD>
          <VE_TD head w={VE_FT[1]}>In federation_id</VE_TD>
          <VE_TD head w={VE_FT[2]}>In config_digest</VE_TD>
          <VE_TD head w={VE_FT[3]}>Path</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 1}>
          <VE_TD w={VE_FT[0]}>Add, remove or replace a member</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup, new dual DKG</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 1} delay={40}>
          <VE_TD w={VE_FT[0]}>Rotate a member identity key</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 1} delay={80}>
          <VE_TD w={VE_FT[0]}>
            Change <M>t</M> or <M>c</M>
          </VE_TD>
          <VE_TD w={VE_FT[1]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 1} delay={120}>
          <VE_TD w={VE_FT[0]}>Change a public mint URL</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 1} delay={160}>
          <VE_TD w={VE_FT[0]}>Change a federation API URL, HTTPS ↔ iroh</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 2}>
          <VE_TD w={VE_FT[0]}>Payment observation policy</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_No /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 2} delay={40}>
          <VE_TD w={VE_FT[0]}>Checkpoint policy</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_No /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 2} delay={80}>
          <VE_TD w={VE_FT[0]}>Wallet protocol version</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_No /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 2} delay={120}>
          <VE_TD w={VE_FT[0]}>On-chain policy (network, depth, fees)</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_No /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>new setup; the FROST root is immutable</VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 3} hot={s >= 3} tone={c.good}>
          <VE_TD w={VE_FT[0]}>Rotate a BLS keyset</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_No /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_Yes /></VE_TD>
          <VE_TD w={VE_FT[3]}>
            <VE_C>KeysetRotation</VE_C>, through consensus
          </VE_TD>
        </VE_TR>
        <VE_TR h={54} show={s >= 3} hot={s >= 3} tone={c.good} delay={40}>
          <VE_TD w={VE_FT[0]}>Renew the TLS certificate, same name</VE_TD>
          <VE_TD w={VE_FT[1]}><VE_No /></VE_TD>
          <VE_TD w={VE_FT[2]}><VE_No /></VE_TD>
          <VE_TD w={VE_FT[3]}>local to the member</VE_TD>
        </VE_TR>
      </At>
      <At x={120} y={922} w={1680}>
        <Fade show={s >= 3}>
          <Note>There is no membership operation and no URL update: keyset rotation is the only live change to the public signing surface.</Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VE_InfoCard = ({ y, m, digest, bad, s }: { y: number; m: string; digest: ReactNode; bad?: boolean; s: number }) => (
  <div
    style={{
      position: 'absolute',
      left: 900,
      top: y,
      width: 420,
      height: 190,
      boxSizing: 'border-box',
      border: `1.5px solid ${bad && s >= 4 ? c.bad : s >= 3 ? c.good : c.rule}`,
      background: c.card,
      borderRadius: 12,
      padding: '12px 20px',
      ...VE_enter(s >= 2, 0.25),
    }}
  >
    <VE_CL>
      federation_id{'   '}
      <M>F</M>
    </VE_CL>
    <VE_CL>member_id{'       '}{m}</VE_CL>
    <VE_CL>
      config_digest{'   '}
      {digest}
    </VE_CL>
    <VE_CL>
      wallet_protocol_version <M>v</M>
    </VE_CL>
    <div style={{ fontSize: 22, marginTop: 2, color: bad && s >= 4 ? c.bad : c.good, opacity: s >= 3 ? 1 : 0, transition: `opacity 300ms ${EASE_OUT}` }}>
      {bad && s >= 4 ? '✗ digest mismatch: excluded' : '✓ accepted'}
    </div>
  </div>
);

const VE_FidWallet: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  const w = { x: 260, y: 602 };
  const ys = [362, 602, 842];
  return (
    <VarShell of="1.4 Federation ID" lens="Perspective: wallet" title="What a wallet checks before aggregating" proc={proc}>
      <Canvas>
        {ys.map((y, i) => (
          <g key={i}>
            <Line x1={w.x + 56} y1={w.y} x2={776} y2={y} color={c.cool} opacity={s >= 2 ? 0.6 : 0.12} />
            <Packet x1={w.x + 56} y1={w.y} x2={776} y2={y} run={proc.anim && s === 2} delay={i * 60} />
            <Packet x1={776} y1={y} x2={w.x + 56} y2={w.y} run={proc.anim && s === 2} color={c.clayHex} delay={1000 + i * 60} />
          </g>
        ))}
        <WalletNode x={w.x} y={w.y} r={56} />
        <Member x={820} y={ys[0]} r={44} label="m1" tone={s >= 3 ? 'good' : 'idle'} />
        <Member x={820} y={ys[1]} r={44} label="m2" tone={s >= 4 ? 'bad' : s >= 3 ? 'good' : 'idle'} />
        <Member x={820} y={ys[2]} r={44} label="m3" tone={s >= 3 ? 'good' : 'idle'} />
      </Canvas>
      <VE_Box x={120} y={700} w={300} h={110} title="imported" tone={c.cool} show={s >= 1}>
        <M size={30}>F</M>, <M size={30}>D</M>
      </VE_Box>
      <VE_InfoCard y={272} m="1" digest={<M>D</M>} s={s} />
      <VE_InfoCard y={512} m="2" digest={<M color={s >= 4 ? c.bad : undefined}>{s >= 4 ? 'D′' : 'D'}</M>} bad s={s} />
      <VE_InfoCard y={752} m="3" digest={<M>D</M>} s={s} />
      <StepList>
        <StepItem n={1} step={s}>
          Import the config; compute its ID <M>F</M> and digest <M>D</M>.
        </StepItem>
        <StepItem n={2} step={s}>
          Fetch mint info (NUT-06) from every member.
        </StepItem>
        <StepItem n={3} step={s}>
          Per member: in the roster, member ID, <M>F</M>, <M>D</M>, protocol version.
        </StepItem>
        <StepItem n={4} step={s}>
          m2's config was edited locally, so it advertises <M>D′</M>. m2 is excluded; m1 and m3 still reach{' '}
          <VE_NoWrap>
            <M>t</M> = 2.
          </VE_NoWrap>
        </StepItem>
      </StepList>
      <At x={120} y={846} w={600}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 22, color: c.bad }}>
            m2: <VE_C>FederationConfigDigestMismatch</VE_C>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

const VE_DnsRow = ({
  y,
  show,
  attempt,
  ok,
  children,
}: {
  y: number;
  show: boolean;
  attempt: ReactNode;
  ok?: boolean;
  children: ReactNode;
}) => (
  <At x={120} y={y} w={1680}>
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: 96, ...VE_enter(show, 0.15) }}>
      <div
        style={{
          width: 600,
          boxSizing: 'border-box',
          border: `1.5px solid ${ok ? c.good : c.rule}`,
          background: ok ? c.goodSoft : c.panel,
          borderRadius: 12,
          padding: '14px 22px',
          fontSize: 24,
          lineHeight: 1.4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {attempt}
      </div>
      <div style={{ width: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: c.dim }}>→</div>
      <div
        style={{
          flex: 1,
          boxSizing: 'border-box',
          border: `1.5px solid ${ok ? c.good : c.bad}`,
          background: c.card,
          borderRadius: 12,
          padding: '14px 22px',
          fontSize: 23,
          lineHeight: 1.4,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <VE_Mark ok={!!ok} />
        <span>{children}</span>
      </div>
    </div>
  </At>
);

const VE_FidDns: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.4 Federation ID" lens="Framing: failure mode" title="Renaming one member's domain" proc={proc}>
      <At x={120} y={250}>
        <span style={{ fontSize: 24, color: c.muted }}>
          m2's domain <VE_C>mint-a.example.com</VE_C> expires; its operator wants <VE_C>mint-a.net</VE_C>.
        </span>
      </At>
      <VE_DnsRow y={306} show={s >= 1} attempt="m2 serves the new name from its reverse proxy">
        Peers and wallets still dial <VE_C>mint-a.example.com</VE_C>, the URL in the roster.
      </VE_DnsRow>
      <VE_DnsRow y={426} show={s >= 2} attempt="m2 edits its own config">
        m2 derives a different federation ID; its envelopes and DKG transcripts no longer match the others.
      </VE_DnsRow>
      <VE_DnsRow y={546} show={s >= 3} attempt="Wallets are told the new URL">
        The member's advertised config digest no longer matches the config the wallet imported.
      </VE_DnsRow>
      <VE_DnsRow y={666} show={s >= 4} ok attempt="New setup">
        New proposal, authorization, federation ID and dual DKG. Users move their eCash to the new federation.
      </VE_DnsRow>
      <At x={120} y={806} w={1680}>
        <Fade show={s >= 4} delay={200}>
          <Note>
            <div>Not hashed: TLS certificates. Renewing the certificate for the same name is a local operation.</div>
            <div>Same outcome for a raw IP in the roster after a server move, or a regenerated iroh endpoint ID.</div>
            <div>
              Open question: hash only member ID and identity key, and publish URLs as an authenticated, rotatable
              advertisement. Not specified.
            </div>
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.4 Restart, restore and catch-up
// ═════════════════════════════════════════════════════════════════════════════

const VE_Slot = ({ x, y, label, filled, tone = c.node, delay = 0 }: { x: number; y: number; label: string; filled: boolean; tone?: string; delay?: number }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 300,
      height: 50,
      boxSizing: 'border-box',
      border: `1.5px ${filled ? 'solid' : 'dashed'} ${filled ? tone : c.rule}`,
      background: filled ? (tone === c.clayHex ? c.claySoft : c.panel) : c.card,
      borderRadius: 8,
      padding: '0 14px',
      display: 'flex',
      alignItems: 'center',
      fontFamily: MONO,
      fontSize: 21,
      color: filled ? c.ink : c.dim,
      transform: filled || REDUCED ? 'scale(1)' : 'scale(0.97)',
      transition: `background 300ms ${EASE_OUT} ${filled ? delay : 0}ms, border-color 300ms ${EASE_OUT} ${filled ? delay : 0}ms, color 300ms ${EASE_OUT} ${filled ? delay : 0}ms, transform 300ms ${EASE_OUT} ${filled ? delay : 0}ms`,
    }}
  >
    {label}
  </div>
);

const VE_OPS = ['#0 MintQuote', '#1 MintQuotePayment', '#2 Mint', '#3 Swap', '#4 MeltQuote', '#5 Melt'];
const VE_JX = [140, 560, 980];
const VE_JY = (i: number) => 310 + i * 62;

const VE_RecBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of="1.4 Restart, restore and catch-up" lens="Beginner" title="Catching up by replaying the journal" proc={proc}>
      <At x={VE_JX[0]} y={262} style={{ fontFamily: MONO, fontSize: 24 }}>
        m1
      </At>
      <At x={VE_JX[1]} y={262} style={{ fontFamily: MONO, fontSize: 24 }}>
        m2 <span style={{ fontFamily: SANS, color: c.muted, fontSize: 22 }}>restarting</span>
      </At>
      <At x={VE_JX[2]} y={262} style={{ fontFamily: MONO, fontSize: 24 }}>
        m3
      </At>
      <VE_Slot x={VE_JX[0]} y={VE_JY(0)} label={VE_OPS[0]} filled />
      <VE_Slot x={VE_JX[0]} y={VE_JY(1)} label={VE_OPS[1]} filled />
      <VE_Slot x={VE_JX[0]} y={VE_JY(2)} label={VE_OPS[2]} filled />
      <VE_Slot x={VE_JX[0]} y={VE_JY(3)} label={VE_OPS[3]} filled />
      <VE_Slot x={VE_JX[0]} y={VE_JY(4)} label={VE_OPS[4]} filled />
      <VE_Slot x={VE_JX[0]} y={VE_JY(5)} label={VE_OPS[5]} filled />
      <VE_Slot x={VE_JX[1]} y={VE_JY(0)} label={VE_OPS[0]} filled={s >= 2} />
      <VE_Slot x={VE_JX[1]} y={VE_JY(1)} label={VE_OPS[1]} filled={s >= 2} delay={60} />
      <VE_Slot x={VE_JX[1]} y={VE_JY(2)} label={VE_OPS[2]} filled={s >= 2} delay={120} />
      <VE_Slot x={VE_JX[1]} y={VE_JY(3)} label={VE_OPS[3]} filled={s >= 4} tone={c.clayHex} />
      <VE_Slot x={VE_JX[1]} y={VE_JY(4)} label={VE_OPS[4]} filled={s >= 4} tone={c.clayHex} delay={120} />
      <VE_Slot x={VE_JX[1]} y={VE_JY(5)} label={VE_OPS[5]} filled={s >= 4} tone={c.clayHex} delay={240} />
      <VE_Slot x={VE_JX[2]} y={VE_JY(0)} label={VE_OPS[0]} filled />
      <VE_Slot x={VE_JX[2]} y={VE_JY(1)} label={VE_OPS[1]} filled />
      <VE_Slot x={VE_JX[2]} y={VE_JY(2)} label={VE_OPS[2]} filled />
      <VE_Slot x={VE_JX[2]} y={VE_JY(3)} label={VE_OPS[3]} filled />
      <VE_Slot x={VE_JX[2]} y={VE_JY(4)} label={VE_OPS[4]} filled />
      <VE_Slot x={VE_JX[2]} y={VE_JY(5)} label={VE_OPS[5]} filled />
      <Canvas>
        <Arrow x1={446} y1={VE_JY(3) + 25} x2={552} y2={VE_JY(3) + 25} show={s >= 3} color={c.clayHex} />
        <Arrow x1={446} y1={VE_JY(4) + 25} x2={552} y2={VE_JY(4) + 25} show={s >= 3} color={c.clayHex} delay={80} />
        <Arrow x1={974} y1={VE_JY(5) + 25} x2={868} y2={VE_JY(5) + 25} show={s >= 3} color={c.clayHex} delay={160} />
        <Packet x1={446} y1={VE_JY(3) + 25} x2={552} y2={VE_JY(3) + 25} run={proc.anim && s === 3} color={c.clayHex} dur={600} />
        <Packet x1={446} y1={VE_JY(4) + 25} x2={552} y2={VE_JY(4) + 25} run={proc.anim && s === 3} color={c.clayHex} dur={600} delay={80} />
        <Packet x1={974} y1={VE_JY(5) + 25} x2={868} y2={VE_JY(5) + 25} run={proc.anim && s === 3} color={c.clayHex} dur={600} delay={160} />
      </Canvas>
      <At x={VE_JX[0]} y={700} style={{ fontSize: 26 }}>
        digest <M size={30}>d₆</M>
      </At>
      <At x={VE_JX[1]} y={700} style={{ fontSize: 26 }}>
        <Fade show={s >= 2}>
          <VE_Swap k={s >= 4 ? 'd6' : 'd3'}>
            digest <M size={30}>{s >= 4 ? 'd₆' : 'd₃'}</M>{' '}
            {s >= 4 ? <VE_Mark /> : <span style={{ color: c.dim, fontSize: 22 }}>behind</span>}
          </VE_Swap>
        </Fade>
      </At>
      <At x={VE_JX[2]} y={700} style={{ fontSize: 26 }}>
        digest <M size={30}>d₆</M>
      </At>
      <At x={VE_JX[1]} y={770}>
        <VE_Pill show={s >= 5}>ready: serving and signing</VE_Pill>
      </At>
      <At x={120} y={870} w={1220}>
        <Note>
          Journal: accepted operations in consensus order. <M>dₙ</M>: a hash over the first <M>n</M> entries; equal
          digests mean equal histories. Illustrative sequence.
        </Note>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The journal lists accepted operations in consensus order. m1 and m3 hold all six.
        </StepItem>
        <StepItem n={2} step={s}>
          m2 restarts from a backup that ends after #2.
        </StepItem>
        <StepItem n={3} step={s}>
          Peers send the missing entries #3 to #5.
        </StepItem>
        <StepItem n={4} step={s}>
          m2 applies them in order. Same operations in the same order give the same state.
        </StepItem>
        <StepItem n={5} step={s}>
          Its digest now equals the peers'. Only then does m2 sign again.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VE_RecAdvanced: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.4 Restart, restore and catch-up" lens="Advanced" title="Catch-up: what is verified, what gates readiness" proc={proc}>
      <At x={120} y={262} w={820}>
        <Fade show={s >= 1} dimTo={0.3}>
          <VE_Label>Private REST catch-up</VE_Label>
          <VE_CodeBox style={{ marginTop: 10 }}>
            <VE_CL on={s === 1}>FederationJournalCatchUpRequest</VE_CL>
            <VE_CL>{'  next_index                first missing entry'}</VE_CL>
            <VE_CL>{'  target_checkpoint_id      bounds the page'}</VE_CL>
            <VE_CL>{'  limit'}</VE_CL>
            <VE_CL>{'  known_order_digest'}</VE_CL>
            <VE_CL>{'  aleph_bft_next_item_index'}</VE_CL>
            <VE_CL on={s === 1}>FederationCatchUpOperation, per entry</VE_CL>
            <VE_CL>{'  index, operation_id'}</VE_CL>
            <VE_CL>{'  previous_order_digest → order_digest'}</VE_CL>
            <VE_CL>{'  application'}</VE_CL>
          </VE_CodeBox>
        </Fade>
      </At>
      <At x={120} y={680} w={820}>
        <Fade show={s >= 1} dimTo={0.3} delay={150}>
          <VE_Label>Order digest chain</VE_Label>
          <VE_CodeBox style={{ marginTop: 10 }}>
            <VE_CL>
              <M>d₀</M>{'   = SHA-256("cdk-federation-journal-genesis-v1")'}
            </VE_CL>
            <VE_CL color={c.muted}>{'     = 98719e56…a7f03c4e'}</VE_CL>
            <VE_CL>
              <M>dᵢ₊₁</M>
              {' = SHA-256(lp("…-journal-entry-v1") ‖ lp('}
              <M>dᵢ</M>
              {')'}
            </VE_CL>
            <VE_CL>{'       ‖ i as u64 BE ‖ lp(operation_id))'}</VE_CL>
          </VE_CodeBox>
        </Fade>
      </At>
      <VE_Box x={980} y={262} w={820} h={220} title="Accepting a page" tone={c.cool} show={s >= 2} size={22}>
        <VE_Bullet gap={0} color={c.cool}>
          A consensus-threshold quorum of catch-up certificates: range, ordered operation IDs, order digest, state digest,
          signer.
        </VE_Bullet>
        <VE_Bullet color={c.cool}>
          Each entry matches its finalized item, else <VE_C>CatchUpIndexMismatch</VE_C>,{' '}
          <VE_C>CatchUpOperationIdMismatch</VE_C> or <VE_C>CatchUpDigestMismatch</VE_C>.
        </VE_Bullet>
      </VE_Box>
      <VE_Box x={980} y={500} w={820} h={150} title="Applying" show={s >= 3} size={22}>
        <VE_Bullet gap={0}>Catch-up and live finality are serialized, never interleaved.</VE_Bullet>
        <VE_Bullet>After replay, order digest and materialized-state digest must both match.</VE_Bullet>
      </VE_Box>
      <VE_Box x={980} y={668} w={820} h={290} title="Readiness gate" tone={c.clayHex} show={s >= 4} size={22}>
        <VE_Bullet gap={0}>
          Gated: public mint, swap and melt; FROST commitments and shares; payment observations; broadcast.
        </VE_Bullet>
        <VE_Bullet>Requires: not lagging, not catching up, not halted, checkpoint and audit OK.</VE_Bullet>
        <VE_Bullet>
          A materialized-state audit mismatch latches. No force clear: restore a known-good generation or replay from
          genesis with the same secrets.
        </VE_Bullet>
      </VE_Box>
    </VarShell>
  );
};

const VE_RecGraphical: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const BY = 550;
  const AX = 628;
  const PY = 400;
  return (
    <VarShell of="1.4 Restart, restore and catch-up" lens="Graphical" title="Restore along the journal index" proc={proc}>
      <Canvas>
        <T x={180} y={BY + 34} size={26} font="mono" anchor="end">
          m2
        </T>
        <GFade show={s >= 1}>
          <rect x={200} y={BY} width={960} height={50} rx={6} style={{ fill: c.panel, stroke: c.node, strokeWidth: 1.5 }} />
        </GFade>
        {[0, 1, 2, 3, 4].map((i) => (
          <GFade key={i} show={s >= 3} delay={i * 70}>
            <rect x={1164 + i * 100} y={BY} width={92} height={50} rx={6} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.5 }} />
          </GFade>
        ))}
        <Line x1={200} y1={AX} x2={1700} y2={AX} color={c.node} />
        <Line x1={200} y1={AX - 8} x2={200} y2={AX + 8} color={c.node} />
        <Line x1={860} y1={AX - 8} x2={860} y2={AX + 8} color={c.node} />
        <Line x1={1160} y1={AX - 8} x2={1160} y2={AX + 8} color={c.node} />
        <Line x1={1660} y1={AX - 8} x2={1660} y2={AX + 8} color={c.node} />
        <T x={200} y={AX + 46} size={22} color={c.muted}>
          0
        </T>
        <T x={860} y={AX + 46} size={22} color={c.muted}>
          checkpoint
        </T>
        <T x={1160} y={AX + 46} size={22} color={c.muted}>
          frontier
        </T>
        <T x={1660} y={AX + 46} size={22} color={c.muted}>
          tip
        </T>
        <GFade show={s >= 2}>
          <line x1={860} y1={BY - 30} x2={860} y2={AX} style={{ stroke: c.ink, strokeWidth: 2 }} />
          <path d={`M 860 ${BY - 18} V ${BY - 30} H 1160 V ${BY - 18}`} style={{ fill: 'none', stroke: c.clayHex, strokeWidth: 2 }} />
          <T x={1010} y={BY - 42} size={22} color={c.clayHex}>
            verified
          </T>
        </GFade>
        <Member x={1300} y={PY} r={38} label="m1" />
        <Member x={1540} y={PY} r={38} label="m3" />
        <Packet x1={1300} y1={PY + 38} x2={1210} y2={BY} run={proc.anim && s === 3} color={c.clayHex} />
        <Packet x1={1300} y1={PY + 38} x2={1310} y2={BY} run={proc.anim && s === 3} color={c.clayHex} delay={80} />
        <Packet x1={1540} y1={PY + 38} x2={1410} y2={BY} run={proc.anim && s === 3} color={c.clayHex} delay={160} />
        <Packet x1={1540} y1={PY + 38} x2={1510} y2={BY} run={proc.anim && s === 3} color={c.clayHex} delay={240} />
        <Packet x1={1540} y1={PY + 38} x2={1610} y2={BY} run={proc.anim && s === 3} color={c.clayHex} delay={320} />
        <GFade show={s >= 3} to={0.5}>
          <line x1={1300} y1={PY + 38} x2={1260} y2={BY - 8} style={{ stroke: c.clayHex, strokeWidth: 1.5, strokeDasharray: '4 6' }} />
          <line x1={1540} y1={PY + 38} x2={1560} y2={BY - 8} style={{ stroke: c.clayHex, strokeWidth: 1.5, strokeDasharray: '4 6' }} />
        </GFade>
        <GFade show={s >= 4}>
          <circle cx={1750} cy={BY + 25} r={28} style={{ fill: c.goodSoft, stroke: c.good, strokeWidth: 2 }} />
          <T x={1750} y={BY + 35} size={28} color={c.good}>
            ✓
          </T>
          <T x={1750} y={BY - 22} size={22} color={c.good}>
            digests
          </T>
        </GFade>
        <GFade show={s >= 5}>
          <rect x={1650} y={AX + 70} width={140} height={46} rx={23} style={{ fill: c.goodSoft, stroke: c.good, strokeWidth: 1.5 }} />
          <T x={1720} y={AX + 101} size={24} color={c.good}>
            ready
          </T>
        </GFade>
        <Arrow x1={330} y1={776} x2={330} y2={BY + 58} show={s >= 1} color={c.node} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          left: 200,
          top: 780,
          width: 760,
          boxSizing: 'border-box',
          border: `1.5px solid ${s >= 5 ? c.clayHex : c.line}`,
          borderRadius: 12,
          background: c.card,
          padding: '14px 20px',
          ...VE_enter(s >= 1),
        }}
      >
        <VE_Label>backup</VE_Label>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <VE_Pill tone={c.node}>snapshot</VE_Pill>
          <VE_Pill tone={c.cool}>identity key</VE_Pill>
          <VE_Pill tone={c.cool}>BLS shares</VE_Pill>
          <VE_Pill tone={c.cool}>FROST share</VE_Pill>
        </div>
      </div>
      <At x={1000} y={842}>
        <Fade show={s >= 5}>
          <span style={{ fontSize: 26, color: c.bad }}>keys: never from peers</span>
        </Fade>
      </At>
    </VarShell>
  );
};

const VE_RT = [520, 240, 920];

const VE_RecTable: Page = () => {
  const proc = useProcess(3);
  const s = proc.step;
  return (
    <VarShell of="1.4 Restart, restore and catch-up" lens="Explained via table" title="What a member can lose" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VE_TR head h={48}>
          <VE_TD head w={VE_RT[0]}>Lost</VE_TD>
          <VE_TD head w={VE_RT[1]}>Recoverable</VE_TD>
          <VE_TD head w={VE_RT[2]}>How</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 1}>
          <VE_TD w={VE_RT[0]}>Process crash, database intact</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.good}>yes</VE_TD>
          <VE_TD w={VE_RT[2]}>ordinary restart</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 1} delay={40}>
          <VE_TD w={VE_RT[0]}>In-memory AlephBFT suffix</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.good}>yes</VE_TD>
          <VE_TD w={VE_RT[2]}>replay from the trusted checkpoint and the session backup</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 1} delay={80}>
          <VE_TD w={VE_RT[0]}>Database, after a good snapshot</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.good}>yes</VE_TD>
          <VE_TD w={VE_RT[2]}>restore snapshot, manifest and secrets; catch up the tail</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 1} delay={120}>
          <VE_TD w={VE_RT[0]}>Entire database, secrets intact</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.good}>yes, slow</VE_TD>
          <VE_TD w={VE_RT[2]}>empty database, genesis catch-up pages from peers</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 1} delay={160}>
          <VE_TD w={VE_RT[0]}>Partition or lag</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.good}>yes</VE_TD>
          <VE_TD w={VE_RT[2]}>peer catch-up; fail closed until caught up</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 2}>
          <VE_TD w={VE_RT[0]}>Pending, unfinalized proposal</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.clayHex}>maybe</VE_TD>
          <VE_TD w={VE_RT[2]}>
            retry the exact <VE_C>operation_id</VE_C>; never a changed envelope
          </VE_TD>
        </VE_TR>
        <VE_TR show={s >= 2} delay={40}>
          <VE_TD w={VE_RT[0]}>FROST nonce, mid-round</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.good}>yes</VE_TD>
          <VE_TD w={VE_RT[2]}>ambiguous nonces burn; new attempt with fresh nonces</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 3} hot={s >= 3} tone={c.bad}>
          <VE_TD w={VE_RT[0]}>Identity key or BLS shares</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.bad}>no</VE_TD>
          <VE_TD w={VE_RT[2]}>new roster, new federation</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 3} hot={s >= 3} tone={c.bad} delay={40}>
          <VE_TD w={VE_RT[0]}>Sealed FROST share or its sealing key</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.bad}>no</VE_TD>
          <VE_TD w={VE_RT[2]}>this seat can no longer sign treasury transactions</VE_TD>
        </VE_TR>
        <VE_TR show={s >= 3} hot={s >= 3} tone={c.bad} delay={80}>
          <VE_TD w={VE_RT[0]}>Another member's secrets</VE_TD>
          <VE_TD w={VE_RT[1]} color={c.bad}>never use</VE_TD>
          <VE_TD w={VE_RT[2]}>wrong seat; activation and proof of possession fail</VE_TD>
        </VE_TR>
      </At>
      <At x={120} y={900} w={1680}>
        <Fade show={s >= 3}>
          <Note>A checkpoint is a commitment to state, not a snapshot: an empty database cannot start from a checkpoint ID alone.</Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VE_OpCard = ({
  x,
  y,
  w,
  n,
  step,
  title,
  children,
}: {
  x: number;
  y: number;
  w: number;
  n: number;
  step: number;
  title: string;
  children: ReactNode;
}) => {
  const on = step === n;
  const seen = step >= n;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        boxSizing: 'border-box',
        border: `1.5px solid ${on ? c.clayHex : c.rule}`,
        background: seen ? c.card : c.panel,
        borderRadius: 12,
        padding: '12px 22px 14px',
        opacity: seen ? 1 : 0.35,
        transition: `opacity 400ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}, background 300ms ${EASE_OUT}`,
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
        <span style={{ fontFamily: MONO, fontSize: 21, color: on ? c.clayHex : c.dim }}>{n}</span>
        <span style={{ fontSize: 25, fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ fontSize: 22, lineHeight: 1.42, color: c.muted, marginTop: 6 }}>{children}</div>
    </div>
  );
};

const VE_RecOperator: Page = () => {
  const proc = useProcess(7, 1800);
  const s = proc.step;
  return (
    <VarShell of="1.4 Restart, restore and catch-up" lens="Perspective: operator" title="Backup and restore, in order" proc={proc}>
      <At x={120} y={252}>
        <VE_Label>Backup, mint stopped</VE_Label>
      </At>
      <At x={980} y={252}>
        <VE_Label>Restore</VE_Label>
      </At>
      <VE_OpCard x={120} y={290} w={820} n={1} step={s} title="Snapshot the stopped database">
        Quiesced SQLite or Postgres snapshot; the mint stays stopped until the manifest is written.
      </VE_OpCard>
      <VE_OpCard x={120} y={430} w={820} n={2} step={s} title="Write the manifest">
        <VE_CL color={c.ink}>{'cdk-mintd federation backup-manifest \\'}</VE_CL>
        <VE_CL color={c.ink}>{'  --public-config federation-public.json \\'}</VE_CL>
        <VE_CL color={c.ink}>{'  --private-config member-private.json \\'}</VE_CL>
        <VE_CL color={c.ink}>{'  --output database-backup-manifest.json'}</VE_CL>
      </VE_OpCard>
      <VE_OpCard x={120} y={640} w={820} n={3} step={s} title="Keep one generation together">
        snapshot · manifest · public config · member private config · sealed FROST share and the key that opens it
      </VE_OpCard>
      <VE_Box x={120} y={790} w={820} h={150} title="The manifest binds" show={s >= 2} dimTo={0.35} size={22}>
        federation ID · config digest · member ID · trusted checkpoint · durable frontier · AlephBFT session and backup
        size · schema version · secret storage generation
      </VE_Box>
      <VE_OpCard x={980} y={290} w={820} n={4} step={s} title="Put the files back">
        database snapshot, public and private config, sealed FROST material
      </VE_OpCard>
      <VE_OpCard x={980} y={404} w={820} n={5} step={s} title="Start with the manifest">
        <VE_CL color={c.ink}>[federation]</VE_CL>
        <VE_CL color={c.ink}>{'restore_manifest_path = "…/database-backup-manifest.json"'}</VE_CL>
        <div style={{ marginTop: 6 }}>Startup compares manifest, database and secrets; any mismatch refuses to start.</div>
      </VE_OpCard>
      <VE_OpCard x={980} y={596} w={820} n={6} step={s} title="Audit">
        <VE_CL color={c.ink}>{'cdk-mintd federation audit-checkpoint \\'}</VE_CL>
        <VE_CL color={c.ink}>{'  --public-config … --private-config … --member 2'}</VE_CL>
        <div style={{ marginTop: 6 }}>Serve only after a matched audit.</div>
      </VE_OpCard>
      <VE_OpCard x={980} y={788} w={820} n={7} step={s} title="Catch up to the tip">
        Replay from the snapshot frontier; the readiness gate opens after the digests match.
      </VE_OpCard>
    </VarShell>
  );
};

const VE_RecPeers: Page = () => {
  const proc = useProcess(4);
  const s = proc.step;
  return (
    <VarShell of="1.4 Restart, restore and catch-up" lens="Framing: what peers can and cannot give" title="Replicated history, member-local secrets" proc={proc}>
      <VE_Box x={120} y={280} w={560} h={480} title="Peers can send" tone={c.good} show={s >= 1} dimTo={0.3}>
        <VE_Bullet gap={0} color={c.good}>
          Finalized AlephBFT items and journal pages, from genesis
        </VE_Bullet>
        <VE_Bullet color={c.good}>
          Catch-up certificates: range, ordered operation IDs, order digest, state digest, signer
        </VE_Bullet>
        <VE_Bullet color={c.good}>Checkpoint quorums</VE_Bullet>
        <Fade show={s >= 2} style={{ marginTop: 22 }}>
          <VE_Label color={c.good}>Accepted when</VE_Label>
          <div style={{ marginTop: 6 }}>a consensus-threshold quorum of certificates agrees and both digests match after replay.</div>
        </Fade>
      </VE_Box>
      <VE_Box x={1240} y={280} w={560} h={480} title="Only this member's backup has" tone={c.clayHex} show={s >= 3} dimTo={0.3}>
        <VE_Bullet gap={0}>Identity secret key: authenticates the private REST plane</VE_Bullet>
        <VE_Bullet>BLS key shares for every keyset, including rotated ones</VE_Bullet>
        <VE_Bullet>Sealed FROST root share and its sealing key</VE_Bullet>
        <VE_Bullet>Bark receive secrets, if Bark is enabled</VE_Bullet>
        <Fade show={s >= 4} style={{ marginTop: 22 }}>
          <VE_Label color={c.bad}>If lost</VE_Label>
          <div style={{ marginTop: 6 }}>
            The seat cannot sign. The others keep serving until a new roster runs setup. Never copy another member's
            private config.
          </div>
        </Fade>
      </VE_Box>
      <Canvas>
        <Arrow x1={684} y1={520} x2={898} y2={520} show={s >= 1} color={c.good} />
        <Packet x1={684} y1={520} x2={898} y2={520} run={proc.anim && s === 1} color={c.good} />
        <Arrow x1={1236} y1={520} x2={1022} y2={520} show={s >= 3} color={c.clayHex} />
        <Packet x1={1236} y1={520} x2={1022} y2={520} run={proc.anim && s === 3} color={c.clayHex} />
        <Member x={960} y={520} r={56} label="m2" tone={s >= 3 ? 'on' : 'idle'} />
        <T x={790} y={496} size={22} color={c.good} show={s >= 1}>
          history
        </T>
        <T x={1130} y={496} size={22} color={c.clayHex} show={s >= 3}>
          secrets
        </T>
        <T x={960} y={620} size={22} color={c.muted} show={s >= 2}>
          certificates, digests ✓
        </T>
      </Canvas>
    </VarShell>
  );
};

const VE_RecDigest: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.4 Restart, restore and catch-up" lens="Focus: the two digests" title="Order digest and state digest" proc={proc}>
      <VE_Box x={120} y={280} w={380} h={100} tone={c.clayHex} show={s >= 1}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
          <M size={32}>d₀</M>
          <VE_C>98719e56…a7f03c4e</VE_C>
        </div>
        <div style={{ fontSize: 21, color: c.muted }}>empty journal</div>
      </VE_Box>
      <VE_Box x={820} y={280} w={380} h={100} tone={c.clayHex} show={s >= 1} delay={300}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
          <M size={32}>d₁</M>
          <VE_C>022d8081…4364fe27</VE_C>
        </div>
        <div style={{ fontSize: 21, color: c.muted }}>after entry #0</div>
      </VE_Box>
      <VE_Box x={1420} y={280} w={380} h={100} show={s >= 1} delay={500} dimTo={0}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'baseline', color: c.dim }}>
          <M size={32}>d₂</M>
          <span>…</span>
        </div>
      </VE_Box>
      <Canvas>
        <Arrow x1={504} y1={330} x2={814} y2={330} show={s >= 1} color={c.clayHex} delay={150} />
        <Arrow x1={1204} y1={330} x2={1414} y2={330} show={s >= 1} color={c.node} delay={400} />
        <T x={660} y={380} size={22} color={c.muted} show={s >= 1} delay={300}>
          i = 0, operation_id
        </T>
        <T x={660} y={410} size={21} font="mono" show={s >= 1} delay={300}>
          d7c9e7c0…a7c2f9a0
        </T>
      </Canvas>
      <At x={120} y={450} w={1680}>
        <Fade show={s >= 2} dimTo={0.2}>
          <VE_CodeBox>
            <VE_CL>
              <M>d₀</M>
              {'   = SHA-256("cdk-federation-journal-genesis-v1")'}
            </VE_CL>
            <VE_CL>
              <M>dᵢ₊₁</M>
              {' = SHA-256(lp("cdk-federation-journal-entry-v1") ‖ lp('}
              <M>dᵢ</M>
              {') ‖ i as u64 BE ‖ lp(operation_id))'}
            </VE_CL>
          </VE_CodeBox>
          <Note style={{ marginTop: 10, fontSize: 22 }}>
            Values: golden-vector test in <VE_C>crates/cdk-common/src/federation/journal.rs</VE_C>.
          </Note>
        </Fade>
      </At>
      <At x={120} y={640} w={860}>
        <Fade show={s >= 3} dimTo={0.2}>
          <VE_Label>Materialized rows</VE_Label>
          <VE_CodeBox style={{ marginTop: 8 }}>
            <VE_CL>mint_quotes  quote-1    amount 1  state ISSUED</VE_CL>
            <VE_CL>proofs       proof-y-1  amount 1  state SPENT</VE_CL>
          </VE_CodeBox>
        </Fade>
      </At>
      <VE_Box x={1040} y={666} w={760} h={138} title="state digest" tone={c.violet} show={s >= 3} dimTo={0.2} delay={200}>
        <div style={{ fontFamily: MONO, fontSize: 22 }}>05bb07bd…49501330</div>
        <div style={{ fontSize: 21, color: c.muted }}>
          empty state: <VE_C>3bdc17a9…e37dac16</VE_C>
        </div>
      </VE_Box>
      <Canvas>
        <Arrow x1={984} y1={735} x2={1034} y2={735} show={s >= 3} color={c.violet} delay={100} />
      </Canvas>
      <At x={120} y={834} w={1680}>
        <Fade show={s >= 3} dimTo={0.2}>
          <Note style={{ fontSize: 22 }}>
            The state digest does not depend on row insertion order; it changes with any field and with duplicate rows.
          </Note>
        </Fade>
      </At>
      <At x={120} y={890} w={1680}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 25, borderLeft: `3px solid ${c.clayHex}`, paddingLeft: 18 }}>
            Checkpoints and catch-up certificates bind both. Same journal, different database projection: not caught up.
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.5 Funding backends
// ═════════════════════════════════════════════════════════════════════════════

const VE_Big = ({ children, color }: { children: ReactNode; color?: string }) => (
  <div style={{ fontSize: 34, color, transition: `color 300ms ${EASE_OUT}` }}>{children}</div>
);

const VE_FundBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const amt = s >= 2 ? '600 sat' : '1,000 sat';
  const wx = 730;
  const wy = 830;
  return (
    <VarShell of="1.5 Funding backends" lens="Beginner" title="Two halves of a mint" proc={proc}>
      <VE_Box x={140} y={280} w={480} h={320} title="eCash issuer" tone={c.clayHex} />
      <VE_Box x={760} y={280} w={560} h={320} title="Reserves" tone={c.cool} />
      <Canvas>
        <Member x={260} y={380} r={34} label="m1" tone={s >= 3 ? 'on' : 'idle'} />
        <Member x={380} y={380} r={34} label="m2" tone={s >= 3 ? 'on' : 'idle'} />
        <Member x={500} y={380} r={34} label="m3" tone={s >= 3 ? 'on' : 'idle'} />
        <Line x1={380} y1={600} x2={wx - 40} y2={wy - 36} color={c.clayHex} opacity={s >= 1 ? 0.7 : 0.15} />
        <Line x1={wx + 40} y1={wy - 36} x2={1040} y2={600} color={c.cool} opacity={s >= 1 ? 0.7 : 0.15} />
        <Line x1={1200} y1={600} x2={1200} y2={wy - 30} color={c.cool} opacity={s >= 2 ? 0.7 : 0.15} />
        <Packet x1={wx + 40} y1={wy - 36} x2={1040} y2={600} run={proc.anim && s === 1} color={c.cool} />
        <Packet x1={380} y1={600} x2={wx - 40} y2={wy - 36} run={proc.anim && s === 1} color={c.clayHex} delay={700} />
        <Packet x1={wx - 40} y1={wy - 36} x2={380} y2={600} run={proc.anim && s === 2} color={c.clayHex} />
        <Packet x1={1200} y1={600} x2={1200} y2={wy - 30} run={proc.anim && s === 2} color={c.cool} delay={700} />
        <WalletNode x={wx} y={wy} r={50} />
        <T x={486} y={700} size={22} color={c.clayHex} anchor="end" show={s >= 1}>
          eCash
        </T>
        <T x={950} y={700} size={22} color={c.cool} anchor="start" show={s >= 1}>
          sat in
        </T>
        <T x={1220} y={720} size={22} color={c.cool} anchor="start" show={s >= 2}>
          sat out
        </T>
        <GFade show={s === 4}>
          <rect x={960} y={345} width={160} height={70} rx={10} style={{ fill: c.badSoft, stroke: c.bad, strokeWidth: 2 }} />
          <T x={1040} y={388} size={24} color={c.bad}>
            one node
          </T>
        </GFade>
        <GFade show={s >= 5}>
          <Member x={920} y={380} r={34} label="m1" tone="cool" />
          <Member x={1040} y={380} r={34} label="m2" tone="cool" />
          <Member x={1160} y={380} r={34} label="m3" tone="cool" />
        </GFade>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          left: 1130,
          top: wy - 30,
          width: 140,
          height: 60,
          boxSizing: 'border-box',
          border: `1.5px solid ${c.cool}`,
          borderRadius: 10,
          background: c.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          ...VE_enter(s >= 2, 0.2),
        }}
      >
        address
      </div>
      <At x={170} y={440} w={420}>
        <VE_Label>eCash outstanding</VE_Label>
        <VE_Swap k={amt}>
          <VE_Big>{s >= 1 ? amt : '0 sat'}</VE_Big>
        </VE_Swap>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 22, color: c.clayHex, marginTop: 6 }}>2 of 3 members sign each proof</div>
        </Fade>
      </At>
      <At x={790} y={440} w={500}>
        <VE_Label>bitcoin held</VE_Label>
        <VE_Swap k={amt}>
          <VE_Big>{s >= 1 ? amt : '0 sat'}</VE_Big>
        </VE_Swap>
        <div style={{ position: 'relative', height: 40, marginTop: 6 }}>
          <Fade show={s === 4} style={{ position: 'absolute', inset: 0 }}>
            <div style={{ fontSize: 22, color: c.bad }}>its operator can move it alone</div>
          </Fade>
          <Fade show={s >= 5} style={{ position: 'absolute', inset: 0 }}>
            <div style={{ fontSize: 22, color: c.cool }}>
              FROST shares <M>s₁</M>, <M>s₂</M>, <M>s₃</M>: 2 of 3 sign
            </div>
          </Fade>
        </div>
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          Mint: 1,000 sat arrive in the reserves; the issuer signs 1,000 sat of eCash.
        </StepItem>
        <StepItem n={2} step={s}>
          Melt: 400 sat of eCash come back; the reserves pay 400 sat out.
        </StepItem>
        <StepItem n={3} step={s}>
          The issuer is federated: 2 of 3 members sign each proof.
        </StepItem>
        <StepItem n={4} step={s}>
          With one Lightning or on-chain node, its operator alone can move the 600 sat.
        </StepItem>
        <StepItem n={5} step={s}>
          Threshold custody: the same 3 members hold key shares; 2 of them sign a Bitcoin transaction.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VE_Rule = ({ show, delay = 0, children }: { show: boolean; delay?: number; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 24, lineHeight: 1.45, ...VE_enter(show, 0.2, delay) }}>
    <span style={{ color: c.clayHex, fontFamily: MONO, flexShrink: 0 }}>–</span>
    <span>{children}</span>
  </div>
);

const VE_NT = [110, 110, 110, 170, 220];

const VE_FundAdvanced: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.5 Funding backends" lens="Advanced" title="Thresholds for issuance, ordering and custody" proc={proc}>
      <At x={120} y={266} w={880}>
        <VE_Rule show={s >= 1}>
          The FROST signing threshold is exactly <M>t</M>, the BLS signature threshold. There is no separate custody
          threshold.
        </VE_Rule>
        <VE_Rule show={s >= 1} delay={80}>
          Startup and activation fail closed if FROST material uses another threshold or participant set.
        </VE_Rule>
        <VE_Rule show={s >= 2}>
          <M>f</M> = ⌊(<M>n</M> − 1)/3⌋, <M>c</M> = <M>n</M> − <M>f</M>, <M>t</M> ≤ <M>c</M>; production observation
          quorum <M>q</M> ≥ <M>c</M>.
        </VE_Rule>
        <VE_Rule show={s >= 3}>
          Signing alone survives <M>n</M> − <M>t</M> unavailable signers. An ordered spend needs <M>c</M> members for
          consensus and <M>t</M> signers: the larger requirement governs.
        </VE_Rule>
        <VE_Rule show={s >= 4}>
          Fewer than <M>t</M> members cannot spend. No set of signers can spend without an accepted transaction.
        </VE_Rule>
      </At>
      <At x={1080} y={262} w={720}>
        <Fade show={s >= 2} dimTo={0.2}>
          <VE_TR head h={52}>
            <VE_TD w={VE_NT[0]} color={c.muted}>
              <M>n</M>
            </VE_TD>
            <VE_TD w={VE_NT[1]} color={c.muted}>
              <M>f</M>
            </VE_TD>
            <VE_TD w={VE_NT[2]} color={c.muted}>
              <M>c</M>
            </VE_TD>
            <VE_TD w={VE_NT[3]} color={c.muted}>
              <M>t</M> range
            </VE_TD>
            <VE_TD w={VE_NT[4]} color={c.muted}>
              tolerated
            </VE_TD>
          </VE_TR>
          <VE_TR>
            <VE_TD w={VE_NT[0]}>4</VE_TD>
            <VE_TD w={VE_NT[1]}>1</VE_TD>
            <VE_TD w={VE_NT[2]}>3</VE_TD>
            <VE_TD w={VE_NT[3]}>2 … 3</VE_TD>
            <VE_TD w={VE_NT[4]}>1</VE_TD>
          </VE_TR>
          <VE_TR>
            <VE_TD w={VE_NT[0]}>5</VE_TD>
            <VE_TD w={VE_NT[1]}>1</VE_TD>
            <VE_TD w={VE_NT[2]}>4</VE_TD>
            <VE_TD w={VE_NT[3]}>2 … 4</VE_TD>
            <VE_TD w={VE_NT[4]}>1</VE_TD>
          </VE_TR>
          <VE_TR>
            <VE_TD w={VE_NT[0]}>7</VE_TD>
            <VE_TD w={VE_NT[1]}>2</VE_TD>
            <VE_TD w={VE_NT[2]}>5</VE_TD>
            <VE_TD w={VE_NT[3]}>3 … 5</VE_TD>
            <VE_TD w={VE_NT[4]}>2</VE_TD>
          </VE_TR>
          <Note style={{ marginTop: 14, fontSize: 22 }}>
            <M>t</M> ≥ <M>f</M> + 1 in production. Tolerated: members that can be offline while a spend still orders and
            signs, <M>n</M> − <M>c</M>.
          </Note>
        </Fade>
      </At>
      <VE_Box x={1080} y={620} w={720} h={230} title="Three authorities" tone={c.cool} show={s >= 3} size={22}>
        <VE_Bullet gap={0} color={c.cool}>
          AlephBFT orders and authorizes wallet state transitions.
        </VE_Bullet>
        <VE_Bullet color={c.cool}>BDK is watch-only: descriptors, chain index, PSBT, broadcast.</VE_Bullet>
        <VE_Bullet color={c.cool}>The FROST key manager holds the root share and all nonce state.</VE_Bullet>
      </VE_Box>
      <At x={120} y={900} w={1680}>
        <Note style={{ fontSize: 22 }}>
          <VE_C>ThresholdParams::validate_bft_safety</VE_C> · <VE_C>docs/federated-cashu-bdk-frost-architecture-decision.md</VE_C>
        </Note>
      </At>
    </VarShell>
  );
};

const VE_LX = [560, 700, 840, 980, 1120];
const VE_SUB = ['₁', '₂', '₃', '₄', '₅'];

const VE_FundGraphical: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  const pick = (i: number) => i === 0 || i === 2 || i === 3;
  return (
    <VarShell of="1.5 Funding backends" lens="Graphical" title="Who can move the reserves" proc={proc}>
      <At x={120} y={336} w={400} style={{ fontSize: 30, ...VE_enter(s >= 1, 0.2) }}>
        issue eCash
      </At>
      <At x={120} y={560} w={400} style={{ fontSize: 30, ...VE_enter(s >= 2, 0.2) }}>
        <div>move reserves</div>
        <div style={{ fontSize: 24, color: c.bad }}>one node</div>
      </At>
      <At x={120} y={800} w={400} style={{ fontSize: 30, ...VE_enter(s >= 3, 0.2) }}>
        <div>move reserves</div>
        <div style={{ fontSize: 24, color: c.cool }}>FROST</div>
      </At>
      <Canvas>
        <Line x1={120} y1={470} x2={1800} y2={470} color={c.rule} />
        <Line x1={120} y1={710} x2={1800} y2={710} color={c.rule} />
        <GFade show={s >= 1} to={1}>
          {VE_LX.map((x, i) => (
            <Member key={`a${i}`} x={x} y={360} r={38} label={`m${i + 1}`} tone={s >= 1 && pick(i) ? 'on' : 'idle'} />
          ))}
          <T x={1500} y={370} size={32} color={c.clayHex}>
            3 of 5
          </T>
        </GFade>
        <GFade show={s >= 2} to={1}>
          {VE_LX.map((x, i) => (
            <Member key={`b${i}`} x={x} y={600} r={38} label={`m${i + 1}`} tone="off" />
          ))}
          <rect x={1210} y={560} width={180} height={80} rx={12} style={{ fill: c.badSoft, stroke: c.bad, strokeWidth: 2 }} />
          <T x={1300} y={609} size={26} color={c.bad}>
            node
          </T>
          <T x={1500} y={610} size={32} color={c.bad}>
            1 key
          </T>
        </GFade>
        <GFade show={s >= 3} to={1}>
          {VE_LX.map((x, i) => (
            <g key={`c${i}`}>
              <Member x={x} y={830} r={38} label={`m${i + 1}`} tone={pick(i) ? 'cool' : 'idle'} />
              <rect x={x - 26} y={880} width={52} height={32} rx={6} style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 1.5 }} />
              <text x={x} y={904} textAnchor="middle" style={{ fontFamily: 'var(--osd-font-body)', fontSize: 22, fill: c.cool }}>
                <tspan style={{ fontStyle: 'italic' }}>s</tspan>
                {VE_SUB[i]}
              </text>
            </g>
          ))}
          <T x={1500} y={840} size={32} color={c.cool}>
            3 of 5
          </T>
        </GFade>
      </Canvas>
    </VarShell>
  );
};

const VE_BT = [420, 290, 340, 380, 250];

const VE_FundTable: Page = () => {
  const proc = useProcess(2, 2400);
  const s = proc.step;
  return (
    <VarShell of="1.5 Funding backends" lens="Explained via table" title="Funding backends compared" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VE_TR head h={52}>
          <VE_TD head w={VE_BT[0]}>Backend</VE_TD>
          <VE_TD head w={VE_BT[1]}>Keys</VE_TD>
          <VE_TD head w={VE_BT[2]}>Quote paid when</VE_TD>
          <VE_TD head w={VE_BT[3]}>Funds move when</VE_TD>
          <VE_TD head w={VE_BT[4]}>Use</VE_TD>
        </VE_TR>
        <VE_TR h={96} show={s >= 1} hot={s >= 1} tone={c.bad}>
          <VE_TD w={VE_BT[0]} size={22}>CLN, LND, BDK or Bark connector</VE_TD>
          <VE_TD w={VE_BT[1]} size={22}>one operator's node</VE_TD>
          <VE_TD w={VE_BT[2]} size={22}>that node reports it</VE_TD>
          <VE_TD w={VE_BT[3]} size={22}>the operator decides</VE_TD>
          <VE_TD w={VE_BT[4]} size={22}>standalone CDK</VE_TD>
        </VE_TR>
        <VE_TR h={96} show={s >= 1} delay={60}>
          <VE_TD w={VE_BT[0]} size={22}>
            fakewallet with <VE_C>development_single_observation</VE_C>
          </VE_TD>
          <VE_TD w={VE_BT[1]} size={22}>no real funds</VE_TD>
          <VE_TD w={VE_BT[2]} size={22}>one accepted observation</VE_TD>
          <VE_TD w={VE_BT[3]} size={22}>not applicable</VE_TD>
          <VE_TD w={VE_BT[4]} size={22}>tests only</VE_TD>
        </VE_TR>
        <VE_TR h={96} show={s >= 2} hot={s >= 2} tone={c.cool}>
          <VE_TD w={VE_BT[0]} size={22}>Federated BDK, on-chain</VE_TD>
          <VE_TD w={VE_BT[1]} size={22}>FROST share per member; watch-only BDK</VE_TD>
          <VE_TD w={VE_BT[2]} size={22}>
            <M>q</M> member observations at confirmation depth
          </VE_TD>
          <VE_TD w={VE_BT[3]} size={22}>
            accepted <VE_C>TransactionProposal</VE_C>, then <M>t</M> FROST signers
          </VE_TD>
          <VE_TD w={VE_BT[4]} size={22}>on-chain treasury</VE_TD>
        </VE_TR>
        <VE_TR h={96} show={s >= 2} hot={s >= 2} tone={c.cool} delay={60}>
          <VE_TD w={VE_BT[0]} size={22}>Federated Bark, Lightning</VE_TD>
          <VE_TD w={VE_BT[1]} size={22}>FROST share per member; Bark application</VE_TD>
          <VE_TD w={VE_BT[2]} size={22}>
            <M>q</M> member observations
          </VE_TD>
          <VE_TD w={VE_BT[3]} size={22}>
            accepted action plan, then <M>t</M> FROST signers
          </VE_TD>
          <VE_TD w={VE_BT[4]} size={22}>Lightning treasury</VE_TD>
        </VE_TR>
      </At>
      <At x={120} y={740} w={1680}>
        <Note>
          <div>
            <span style={{ color: c.bad }}>Row 1:</span> quorum observations against a single-key node still leave one
            trusted operator.
          </div>
          <div style={{ marginTop: 10 }}>
            Rows 3 and 4 derive their keys from the same FROST root. A standalone BDK mnemonic is never valid in
            federation mode.
          </div>
        </Note>
      </At>
    </VarShell>
  );
};

const VE_FundFailure: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const W = 220;
  const M1 = 480;
  const M2 = 620;
  const M3 = 760;
  const N = 1100;
  return (
    <VarShell of="1.5 Funding backends" lens="Framing: failure mode" title="One CLN node under a federated issuer" proc={proc}>
      <Canvas>
        <Lifeline x={W} label="wallet" color={c.cool} top={292} bottom={930} />
        <Lifeline x={M1} label="m1" top={292} bottom={930} />
        <Lifeline x={M2} label="m2" top={292} bottom={930} />
        <Lifeline x={M3} label="m3" top={292} bottom={930} />
        <Lifeline x={N} label="CLN node" color={c.bad} top={292} bottom={930} />
        <Arrow x1={W} y1={340} x2={M1 - 6} y2={340} show={s >= 1} color={c.cool} label="quote" font="sans" />
        <Arrow x1={M1} y1={380} x2={N - 6} y2={380} show={s >= 1} color={c.node} label="invoice?" font="sans" delay={200} />
        <Arrow x1={N} y1={420} x2={M1 + 6} y2={420} show={s >= 1} color={c.node} dashed delay={400} />
        <Arrow x1={N} y1={480} x2={M1 + 6} y2={480} show={s >= 2} color={c.bad} />
        <Arrow x1={N} y1={506} x2={M2 + 6} y2={506} show={s >= 2} color={c.bad} delay={80} />
        <Arrow x1={N} y1={532} x2={M3 + 6} y2={532} show={s >= 2} color={c.bad} delay={160} />
        <T x={960} y={468} size={22} color={c.bad} show={s >= 2}>
          “paid”
        </T>
        <Band x1={M1 - 40} x2={M3 + 40} y={590} label="q = 3 observations, one source" show={s >= 2} />
        <Arrow x1={M1} y1={650} x2={W + 6} y2={650} show={s >= 2} color={c.clayHex} label="eCash" font="sans" delay={300} />
        <Arrow x1={W} y1={730} x2={M1 - 6} y2={730} show={s >= 3} color={c.cool} label="melt" font="sans" />
        <Arrow x1={M1} y1={770} x2={N - 6} y2={770} show={s >= 3} color={c.node} label="pay invoice X" font="sans" delay={200} />
        <Arrow x1={N} y1={810} x2={1320} y2={810} show={s >= 3} color={c.bad} label="pays Y" font="sans" delay={400} />
        <Arrow x1={N} y1={890} x2={1320} y2={890} show={s >= 4} color={c.bad} label="sweeps reserves" font="sans" />
        <Packet x1={N} y1={480} x2={M1 + 6} y2={480} run={proc.anim && s === 2} color={c.bad} />
        <Packet x1={N} y1={890} x2={1320} y2={890} run={proc.anim && s === 4} color={c.bad} />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Quote: a member asks the node for an invoice.
        </StepItem>
        <StepItem n={2} step={s}>
          The node reports paid; nothing arrived. Each member observes it,{' '}
          <VE_NoWrap>
            <M>q</M> = 3
          </VE_NoWrap>{' '}
          is reached from one source, eCash is issued.
        </StepItem>
        <StepItem n={3} step={s}>
          Melt: the members order payment of invoice X; the node pays Y, or nothing.
        </StepItem>
        <StepItem n={4} step={s}>
          The operator moves the reserves. Consensus among members does not constrain a key they do not hold.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VE_FundMember: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.5 Funding backends" lens="Perspective: federation member" title="One member's side of the treasury" proc={proc}>
      <At x={120} y={262} w={780}>
        <VE_Label>Member-local mintd config</VE_Label>
        <VE_CodeBox style={{ marginTop: 10 }}>
          <VE_CL>[onchain]</VE_CL>
          <VE_CL>onchain_backend = "federated-bdk"</VE_CL>
          <VE_CL> </VE_CL>
          <VE_CL>[federation.onchain_wallet]</VE_CL>
          <VE_CL>enabled = true</VE_CL>
          <VE_CL on={s === 2}>chain_source_type = "bitcoinrpc"</VE_CL>
          <VE_CL on={s === 2}>chain_source_scope = "independent"</VE_CL>
          <VE_CL>chain_source_id = "member-1-bitcoin"</VE_CL>
          <VE_CL>bitcoind_rpc_host = "127.0.0.1"</VE_CL>
          <VE_CL>request_timeout_secs = 15</VE_CL>
          <VE_CL>sync_interval_secs = 30</VE_CL>
        </VE_CodeBox>
        <Note style={{ marginTop: 16 }}>
          This section is never part of the federation consensus config. It has no mnemonic and no private key.
        </Note>
      </At>
      <VE_Box x={960} y={262} w={840} h={180} title="Shared, in the public config" tone={c.clayHex} show={s >= 1} dimTo={0.25} size={22}>
        Network, confirmation depth (default 6, at least 1), fee-policy version, and the Taproot descriptors{' '}
        <VE_C>tr(xpub/0/*)</VE_C>, <VE_C>tr(xpub/1/*)</VE_C>. Must match the active FROST application exactly.
      </VE_Box>
      <VE_Box x={960} y={466} w={840} h={180} title="Local to this member" tone={c.cool} show={s >= 2} dimTo={0.25} size={22}>
        Chain source (Bitcoin Core RPC or Esplora), credentials, timeouts, storage path, and the sealed FROST root share.
        A timeout or stale tip degrades only this member, which fails closed until a sync succeeds.
      </VE_Box>
      <VE_Box x={960} y={670} w={840} h={180} title="Not available" tone={c.bad} show={s >= 3} dimTo={0.25} size={22}>
        No mnemonic: a standalone <VE_C>[bdk]</VE_C> section is rejected. No share, nonce or private-key export, no
        force-spend, no force-release. Rebroadcast only re-sends accepted signed bytes.
      </VE_Box>
    </VarShell>
  );
};

const VE_Case = ({
  x,
  y,
  title,
  show,
  cause,
  effect,
}: {
  x: number;
  y: number;
  title: string;
  show: boolean;
  cause: ReactNode;
  effect: ReactNode;
}) => (
  <VE_Box x={x} y={y} w={820} h={210} title={title} show={show} dimTo={0.2}>
    <div style={{ fontSize: 25 }}>{cause}</div>
    <div style={{ fontSize: 25, color: c.bad, marginTop: 14, display: 'flex', gap: 12 }}>
      <span>→</span>
      <span>{effect}</span>
    </div>
  </VE_Box>
);

const VE_FundConstraint: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.5 Funding backends" lens="Framing: the constraint that forces the design" title="Both sides of mint and melt need the same quorum" proc={proc}>
      <VE_Case
        x={120}
        y={270}
        title="Mint · deposit"
        show={s >= 1}
        cause={<>Issuing needs <M>t</M> members, but one member can report a deposit that never arrived.</>}
        effect="eCash is issued without reserves."
      />
      <VE_Case
        x={980}
        y={270}
        title="Mint · after issuance"
        show={s >= 2}
        cause={<>Issuing needs <M>t</M> members, but one member can later sweep the deposit.</>}
        effect="Outstanding eCash is unbacked."
      />
      <VE_Case
        x={120}
        y={510}
        title="Melt · payout"
        show={s >= 3}
        cause={<>Burning the proofs needs <M>t</M> members, but one member can redirect the payout.</>}
        effect="The proofs are spent and the user is not paid."
      />
      <VE_Case
        x={980}
        y={510}
        title="Melt · ledger"
        show={s >= 4}
        cause={<>The payout needs <M>t</M> signers, but one member can issue change or reopen the proofs.</>}
        effect="Ledger and treasury disagree."
      />
      <At x={120} y={800} w={1680}>
        <Fade show={s >= 4} delay={200}>
          <div style={{ fontSize: 25, lineHeight: 1.45, borderLeft: `3px solid ${c.clayHex}`, paddingLeft: 18 }}>
            <div>Required: same roster, same consensus history, custody threshold not weaker than the eCash threshold.</div>
            <div>
              In CDK the FROST signing threshold is exactly <M>t</M>.
            </div>
          </div>
        </Fade>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.5 Two DKG ceremonies, one roster
// ═════════════════════════════════════════════════════════════════════════════

const VE_KT = [210, 250, 190, 250];

const VE_KeyBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  return (
    <VarShell of="1.5 Two DKG ceremonies, one roster" lens="Beginner" title="Adding a public tweak to threshold shares" proc={proc}>
      <At x={120} y={262} w={1220}>
        <div style={{ fontSize: 28 }}>
          Toy numbers mod 97: secret <M>s</M> = 13, line <M>f</M>(<M>x</M>) = 13 + 7<M>x</M>, threshold 2 of 3.
        </div>
      </At>
      <At x={120} y={330} w={900}>
        <VE_TR head h={48}>
          <VE_TD head w={VE_KT[0]}>member</VE_TD>
          <VE_TD head w={VE_KT[1]}>share</VE_TD>
          <VE_TD head w={VE_KT[2]}>tweak</VE_TD>
          <VE_TD head w={VE_KT[3]}>new share</VE_TD>
        </VE_TR>
        <VE_TR h={62} show={s >= 1}>
          <VE_TD w={VE_KT[0]} mono>m1</VE_TD>
          <VE_TD w={VE_KT[1]}>
            <M size={28}>f(1) = 20</M>
          </VE_TD>
          <VE_TD w={VE_KT[2]}>
            <Fade show={s >= 3}>
              <M size={28}>+ 5</M>
            </Fade>
          </VE_TD>
          <VE_TD w={VE_KT[3]}>
            <Fade show={s >= 3} delay={200}>
              <M size={28} color={c.clayHex}>25</M>
            </Fade>
          </VE_TD>
        </VE_TR>
        <VE_TR h={62} show={s >= 1} delay={60}>
          <VE_TD w={VE_KT[0]} mono>m2</VE_TD>
          <VE_TD w={VE_KT[1]}>
            <M size={28}>f(2) = 27</M>
          </VE_TD>
          <VE_TD w={VE_KT[2]}>
            <Fade show={s >= 3} delay={60}>
              <M size={28}>+ 5</M>
            </Fade>
          </VE_TD>
          <VE_TD w={VE_KT[3]}>
            <Fade show={s >= 3} delay={260}>
              <M size={28} color={c.clayHex}>32</M>
            </Fade>
          </VE_TD>
        </VE_TR>
        <VE_TR h={62} show={s >= 1} delay={120}>
          <VE_TD w={VE_KT[0]} mono>m3</VE_TD>
          <VE_TD w={VE_KT[1]}>
            <M size={28}>f(3) = 34</M>
          </VE_TD>
          <VE_TD w={VE_KT[2]}>
            <Fade show={s >= 3} delay={120}>
              <M size={28}>+ 5</M>
            </Fade>
          </VE_TD>
          <VE_TD w={VE_KT[3]}>
            <Fade show={s >= 3} delay={320}>
              <M size={28} color={c.clayHex}>39</M>
            </Fade>
          </VE_TD>
        </VE_TR>
      </At>
      <VE_Box x={120} y={610} w={1220} h={170} title="Interpolate with m1 and m2" show={s >= 2} dimTo={0.2}>
        <div style={{ fontSize: 28 }}>
          <M>λ₁</M> = 2, <M>λ₂</M> = −1:<span style={{ marginLeft: 28 }} />
          <M>2·20 − 27 = 13 = s</M>
        </div>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 28, color: c.clayHex }}>
            same weights:<span style={{ marginLeft: 28 }} />
            <M color={c.clayHex}>2·25 − 32 = 18 = s + τ</M>
          </div>
        </Fade>
      </VE_Box>
      <VE_Box x={120} y={800} w={1220} h={160} title="Public side, on secp256k1" tone={c.cool} show={s >= 5} dimTo={0.2}>
        <div style={{ fontSize: 26 }}>
          <M>P = s·G</M> becomes <M>P + τ·G</M>, which anyone can compute. In CDK the tweak is{' '}
          <M size={28}>
            a + b<VE_Sub>0</VE_Sub> + b<VE_Sub>j</VE_Sub>
          </M>
          : application, branch and index.
        </div>
      </VE_Box>
      <StepList>
        <StepItem n={1} step={s}>
          Member <M>i</M> holds the value of the line at <M>x</M> = <M>i</M>. The secret is the value at 0.
        </StepItem>
        <StepItem n={2} step={s}>
          Two shares fix the line. For m1, m2 the Lagrange weights are 2 and −1; they sum to 1.
        </StepItem>
        <StepItem n={3} step={s}>
          Everyone knows the tweak <M>τ</M> = 5. Each member adds it to its own share.
        </StepItem>
        <StepItem n={4} step={s}>
          The same weights now give 18 = 13 + 5: the new values are shares of <M>s + τ</M>.
        </StepItem>
        <StepItem n={5} step={s}>
          The public key moves the same way. Nobody computes <M>s</M>.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VE_FRow = ({ k, children }: { k: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', gap: 16, fontSize: 24, lineHeight: 1.45, marginBottom: 8 }}>
    <span style={{ width: 150, flexShrink: 0, textAlign: 'right' }}>{k}</span>
    <span style={{ color: c.muted }}>=</span>
    <span style={{ flex: 1 }}>{children}</span>
  </div>
);

const VE_KeyAdvanced: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.5 Two DKG ceremonies, one roster" lens="Advanced" title="Derivation contract: formulas and failure cases" proc={proc}>
      <VE_Box x={120} y={262} w={900} h={470} title="Derivation version 1" tone={c.clayHex} show={s >= 1} dimTo={0.25}>
        <VE_FRow k={<M>a</M>}>
          <M>H₁</M>(root epoch, transcript, <M>P</M>, application, key epoch, version, policy) mod <M>n</M>; zero is
          rejected
        </VE_FRow>
        <VE_FRow k="chain code">
          <M>H₂</M>(root epoch, application, key epoch, version, policy, <M>P + a·G</M>)
        </VE_FRow>
        <VE_FRow
          k={
            <M size={28}>
              P<VE_Sub>j</VE_Sub>
            </M>
          }
        >
          <M size={28}>
            P + a·G + b<VE_Sub>0</VE_Sub>·G + b<VE_Sub>j</VE_Sub>·G
          </M>
        </VE_FRow>
        <VE_FRow
          k={
            <M size={28}>
              s<VE_Sub>i,j</VE_Sub>
            </M>
          }
        >
          <M size={28}>
            s<VE_Sub>i</VE_Sub> + a + b<VE_Sub>0</VE_Sub> + b<VE_Sub>j</VE_Sub>
          </M>{' '}
          mod <M>n</M>
        </VE_FRow>
        <VE_FRow k={<M>Q</M>}>
          lift_x(
          <M size={28}>
            P<VE_Sub>j</VE_Sub>
          </M>
          ) + <VE_C>hash_TapTweak</VE_C>(
          <M size={28}>
            x(P<VE_Sub>j</VE_Sub>)
          </M>
          )·<M size={28}>G</M>
        </VE_FRow>
        <div style={{ fontSize: 21, color: c.muted, lineHeight: 1.5, marginTop: 10 }}>
          <div>
            <M>H₁</M>: SHA-256 with <VE_C>cdk/frost/application-derivation/v1</VE_C>
          </div>
          <div>
            <M>H₂</M>: SHA-256 with <VE_C>cdk/frost/bip32-chain-code/v1</VE_C>
          </div>
          <div>
            <M size={28}>
              b<VE_Sub>0</VE_Sub>, b<VE_Sub>j</VE_Sub>
            </M>
            : public BIP32 tweaks for branch and index
          </div>
        </div>
      </VE_Box>
      <VE_Box x={120} y={756} w={900} h={200} title="What BDK sees" show={s >= 2} dimTo={0.25} size={22}>
        A depth-0 xpub over <M>P + a·G</M> with that chain code; descriptors <VE_C>tr(xpub/0/*)</VE_C> and{' '}
        <VE_C>tr(xpub/1/*)</VE_C>. Tests: address equality at indexes 0, 1, 17, 1 000 003, 2³¹ − 1 and 256 property
        indexes.
      </VE_Box>
      <VE_Box x={1080} y={262} w={720} h={216} title="Indexes" show={s >= 2} dimTo={0.25} size={22}>
        Non-hardened only: branch 0 or 1, index 0 … 2³¹ − 1. If{' '}
        <VE_NoWrap>
          <VE_C>parse256(IL)</VE_C> ≥ <M>n</M>
        </VE_NoWrap>{' '}
        or the child is the point at infinity: the next normal index, accepted by consensus before use. At 2³¹ − 1 there is no retry: fail closed.
      </VE_Box>
      <VE_Box x={1080} y={498} w={720} h={196} title="Bindings" show={s >= 3} dimTo={0.25} size={22}>
        Nonce commitments and signature shares bind root epoch, application, session and the derivation hash. Swapping
        branch, index, network, tweak list or Taproot mode between rounds is rejected.
      </VE_Box>
      <VE_Box x={1080} y={714} w={720} h={242} title="Residual risk" tone={c.bad} show={s >= 4} dimTo={0.25} size={22}>
        Public tweaks separate namespaces; they do not isolate compromise. A leaked derived private key can reveal the root
        key.{' '}
        <VE_NoWrap>
          <VE_C>frost-secp256k1-tr</VE_C>
        </VE_NoWrap>{' '}
        was outside the upstream NCC audit; mainnet stays gated on review.
      </VE_Box>
    </VarShell>
  );
};

const VE_GBox = ({
  x,
  y,
  w,
  h,
  tone,
  show,
  delay = 0,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: string;
  show: boolean;
  delay?: number;
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
      border: `1.75px solid ${tone}`,
      background: VE_soft(tone),
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: 26,
      ...VE_enter(show, 0, delay),
    }}
  >
    <span>{children}</span>
  </div>
);

const VE_KeyGraphical: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const rx = [760, 860, 960, 1060, 1160];
  return (
    <VarShell of="1.5 Two DKG ceremonies, one roster" lens="Graphical" title="One roster, two ceremonies" proc={proc}>
      <Canvas>
        {rx.map((x, i) => (
          <Member key={i} x={x} y={320} r={34} label={`m${i + 1}`} tone={s >= 1 ? 'idle' : 'off'} />
        ))}
        <T x={680} y={328} size={24} color={c.muted} anchor="end">
          roster
        </T>
        <Draw x1={960} y1={360} x2={620} y2={440} show={s >= 2} color={c.clayHex} width={2} />
        <Draw x1={960} y1={360} x2={1300} y2={440} show={s >= 3} color={c.cool} width={2} />
        <Draw x1={610} y1={520} x2={610} y2={580} show={s >= 2} color={c.clayHex} width={2} delay={300} />
        <Draw x1={1310} y1={520} x2={1310} y2={580} show={s >= 3} color={c.cool} width={2} delay={300} />
        <Draw x1={710} y1={615} x2={840} y2={715} show={s >= 4} color={c.clayHex} width={2} />
        <Draw x1={1210} y1={615} x2={1080} y2={715} show={s >= 4} color={c.cool} width={2} />
        <Draw x1={610} y1={650} x2={610} y2={860} show={s >= 5} color={c.clayHex} width={2} />
        <Draw x1={1310} y1={650} x2={1160} y2={860} show={s >= 5} color={c.cool} width={2} delay={100} />
        <Draw x1={1310} y1={650} x2={1420} y2={860} show={s >= 5} color={c.cool} width={2} delay={200} />
      </Canvas>
      <VE_GBox x={420} y={440} w={380} h={80} tone={c.clayHex} show={s >= 2}>
        BLS12-381 DKG
      </VE_GBox>
      <VE_GBox x={1120} y={440} w={380} h={80} tone={c.cool} show={s >= 3}>
        FROST DKG, secp256k1
      </VE_GBox>
      <VE_GBox x={510} y={580} w={200} h={70} tone={c.clayHex} show={s >= 2} delay={400}>
        <M>kᵢ</M>, <M>K</M>
      </VE_GBox>
      <VE_GBox x={1210} y={580} w={200} h={70} tone={c.cool} show={s >= 3} delay={400}>
        <M>sᵢ</M>, <M>P</M>
      </VE_GBox>
      <VE_GBox x={840} y={690} w={240} h={80} tone={s >= 4 ? c.good : c.node} show={s >= 4}>
        both, then ready
      </VE_GBox>
      <VE_GBox x={420} y={860} w={380} h={80} tone={c.clayHex} show={s >= 5}>
        Cashu keysets
      </VE_GBox>
      <VE_GBox x={1060} y={860} w={200} h={80} tone={c.cool} show={s >= 5} delay={100}>
        BDK
      </VE_GBox>
      <VE_GBox x={1320} y={860} w={200} h={80} tone={c.cool} show={s >= 5} delay={200}>
        Bark
      </VE_GBox>
    </VarShell>
  );
};

const VE_DT = [70, 380, 900, 330];

const VE_KeyReasons: Page = () => {
  const proc = useProcess(6, 2000);
  const s = proc.step;
  return (
    <VarShell of="1.5 Two DKG ceremonies, one roster" lens="Focus: the derivation chain" title="Six derivation steps and the reason for each" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VE_TR head h={48}>
          <VE_TD head w={VE_DT[0]}>#</VE_TD>
          <VE_TD head w={VE_DT[1]}>Step</VE_TD>
          <VE_TD head w={VE_DT[2]}>Reason</VE_TD>
          <VE_TD head w={VE_DT[3]}>Owner</VE_TD>
        </VE_TR>
        <VE_TR h={88} show={s >= 1} hot={s === 1} dimTo={0.2}>
          <VE_TD w={VE_DT[0]} mono color={c.muted}>1</VE_TD>
          <VE_TD w={VE_DT[1]}>
            Untweaked root <M>P</M>
          </VE_TD>
          <VE_TD w={VE_DT[2]} size={22}>
            Application-neutral. The upstream <VE_C>post_dkg</VE_C> Taproot output is never persisted as the root.
          </VE_TD>
          <VE_TD w={VE_DT[3]} mono>cdk-frost</VE_TD>
        </VE_TR>
        <VE_TR h={88} show={s >= 2} hot={s === 2} dimTo={0.2}>
          <VE_TD w={VE_DT[0]} mono color={c.muted}>2</VE_TD>
          <VE_TD w={VE_DT[1]}>
            Application tweak <M>a</M>
          </VE_TD>
          <VE_TD w={VE_DT[2]} size={22}>
            Separates applications that share the root: namespace separation, not compromise isolation.
          </VE_TD>
          <VE_TD w={VE_DT[3]} mono>cdk-frost</VE_TD>
        </VE_TR>
        <VE_TR h={88} show={s >= 3} hot={s === 3} dimTo={0.2}>
          <VE_TD w={VE_DT[0]} mono color={c.muted}>3</VE_TD>
          <VE_TD w={VE_DT[1]}>Chain code</VE_TD>
          <VE_TD w={VE_DT[2]} size={22}>
            BIP32 needs one. Derived publicly from root epoch, application and group key.
          </VE_TD>
          <VE_TD w={VE_DT[3]} mono>cdk-frost-bip32</VE_TD>
        </VE_TR>
        <VE_TR h={88} show={s >= 4} hot={s === 4} dimTo={0.2}>
          <VE_TD w={VE_DT[0]} mono color={c.muted}>4</VE_TD>
          <VE_TD w={VE_DT[1]}>Non-hardened BIP32 branch, index</VE_TD>
          <VE_TD w={VE_DT[2]} size={22}>
            Public derivation: BDK watches from an xpub, members add the same public tweak to their shares. Hardened
            derivation hashes the parent private key, which nobody has.
          </VE_TD>
          <VE_TD w={VE_DT[3]} mono>cdk-frost-bip32</VE_TD>
        </VE_TR>
        <VE_TR h={88} show={s >= 5} hot={s === 5} dimTo={0.2}>
          <VE_TD w={VE_DT[0]} mono color={c.muted}>5</VE_TD>
          <VE_TD w={VE_DT[1]}>BIP340 even-Y</VE_TD>
          <VE_TD w={VE_DT[2]} size={22}>
            x-only public keys. Applied transiently inside FROST signing, never stored.
          </VE_TD>
          <VE_TD w={VE_DT[3]} mono>frost-secp256k1-tr</VE_TD>
        </VE_TR>
        <VE_TR h={88} show={s >= 6} hot={s === 6} dimTo={0.2}>
          <VE_TD w={VE_DT[0]} mono color={c.muted}>6</VE_TD>
          <VE_TD w={VE_DT[1]}>BIP341 TapTweak, no script root</VE_TD>
          <VE_TD w={VE_DT[2]} size={22}>
            Key-path-only P2TR outputs: <VE_C>tr(xpub/0/*)</VE_C> receive, <VE_C>tr(xpub/1/*)</VE_C> change.
          </VE_TD>
          <VE_TD w={VE_DT[3]} mono>cdk-frost-bip32</VE_TD>
        </VE_TR>
      </At>
      <At x={120} y={876} w={1680}>
        <Note>
          Frozen as derivation version 1 of <VE_C>org.cashubtc.cdk.federated-onchain</VE_C>. Bark registers its own
          application, <VE_C>org.cashubtc.cdk.federated-bark</VE_C>, on the same root.
        </Note>
      </At>
    </VarShell>
  );
};

const VE_AttackRow = ({ y, show, attempt, children }: { y: number; show: boolean; attempt: ReactNode; children: ReactNode }) => (
  <At x={120} y={y} w={1680}>
    <div style={{ display: 'flex', alignItems: 'stretch', height: 118, ...VE_enter(show, 0.15) }}>
      <div
        style={{
          width: 600,
          boxSizing: 'border-box',
          border: `1.5px solid ${c.bad}`,
          background: c.badSoft,
          borderRadius: 12,
          padding: '12px 22px',
          fontSize: 24,
          lineHeight: 1.4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {attempt}
      </div>
      <div style={{ width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: c.dim }}>→</div>
      <div
        style={{
          flex: 1,
          boxSizing: 'border-box',
          border: `1.5px solid ${c.rule}`,
          background: c.card,
          borderRadius: 12,
          padding: '12px 22px',
          fontSize: 22,
          lineHeight: 1.42,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span>{children}</span>
      </div>
    </div>
  </At>
);

const VE_KeyAttacker: Page = () => {
  const proc = useProcess(5, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.5 Two DKG ceremonies, one roster" lens="Perspective: attacker" title="Same roster, same threshold: what an attacker tries" proc={proc}>
      <VE_AttackRow y={262} show={s >= 1} attempt="FROST threshold 2 while BLS needs 3">
        Two members could then move reserves that three are needed to issue against. The FROST context copies{' '}
        <VE_C>signature_threshold</VE_C>; <VE_C>validate_against</VE_C> rejects any difference.
      </VE_AttackRow>
      <VE_AttackRow y={400} show={s >= 2} attempt="Add a participant outside the roster">
        Participants must equal the roster: “FROST DKG roster or threshold differs from BLS federation setup”.
      </VE_AttackRow>
      <VE_AttackRow y={538} show={s >= 3} attempt="Pair a FROST root from another ceremony">
        <VE_C>FederationDualDkgResult::validate</VE_C> requires the same federation, setup authorization, member and
        ceremony ID.
      </VE_AttackRow>
      <VE_AttackRow y={676} show={s >= 4} attempt="Send two different packages to one receiver">
        Rejected as equivocation. Activation needs byte-identical root confirmations from every configured member.
      </VE_AttackRow>
      <VE_AttackRow y={814} show={s >= 5} attempt="Replay a message into another ceremony or epoch">
        Each message binds federation, ceremony, root epoch, protocol, ciphersuite, threshold, ordered roster, sender and
        receiver.
      </VE_AttackRow>
    </VarShell>
  );
};

const VE_P2P = ({ x1, x2, y, show, delay, color }: { x1: number; x2: number; y: number; show: boolean; delay: number; color: string }) => (
  <Arrow x1={x1} y1={y} x2={x2 + (x2 > x1 ? -6 : 6)} y2={y} show={show} color={color} delay={delay} />
);

const VE_KeyRounds: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const A = 300;
  const B = 680;
  const C = 1060;
  return (
    <VarShell of="1.5 Two DKG ceremonies, one roster" lens="Focus: the FROST ceremony" title="FROST root ceremony, message by message" proc={proc}>
      <Canvas>
        <Lifeline x={A} label="m1" color={c.cool} bottom={830} />
        <Lifeline x={B} label="m2" color={c.violet} bottom={830} />
        <Lifeline x={C} label="m3" color={c.good} bottom={830} />
        <Band x1={A - 60} x2={C + 60} y={330} label="round 1: commitments and proofs · /dkg/frost/round1" show={s >= 1} />
        <VE_P2P x1={A} x2={B} y={404} show={s >= 2} delay={0} color={c.cool} />
        <VE_P2P x1={A} x2={C} y={430} show={s >= 2} delay={60} color={c.cool} />
        <VE_P2P x1={B} x2={A} y={456} show={s >= 2} delay={120} color={c.violet} />
        <VE_P2P x1={B} x2={C} y={482} show={s >= 2} delay={180} color={c.violet} />
        <VE_P2P x1={C} x2={A} y={508} show={s >= 2} delay={240} color={c.good} />
        <VE_P2P x1={C} x2={B} y={534} show={s >= 2} delay={300} color={c.good} />
        <T x={C + 50} y={476} size={22} anchor="start" color={c.muted} show={s >= 2}>
          round 2
        </T>
        <T x={C + 50} y={504} size={21} font="mono" anchor="start" color={c.muted} show={s >= 2}>
          /dkg/frost/round2
        </T>
        <Band x1={A - 60} x2={C + 60} y={610} label="local: untweaked root; own share vs verification share" show={s >= 3} />
        <Band x1={A - 60} x2={C + 60} y={690} label="publish exact root bytes · /dkg/frost/confirmations" show={s >= 4} tone="cool" />
        <Band x1={A - 60} x2={C + 60} y={770} label="all equal, BLS complete → activate" show={s >= 5} tone="clay" />
      </Canvas>
      <StepList>
        <StepItem n={1} step={s}>
          Broadcast round-1 packages: commitments and proofs.
        </StepItem>
        <StepItem n={2} step={s}>
          A confidential contribution to each other member.
        </StepItem>
        <StepItem n={3} step={s}>
          Convert to the untweaked root; check the own share against its verification share.
        </StepItem>
        <StepItem n={4} step={s}>
          Publish the exact public root bytes.
        </StepItem>
        <StepItem n={5} step={s}>
          All members confirm the same bytes and BLS is complete: activate. Otherwise abort.
        </StepItem>
        <Note style={{ marginTop: 16, fontSize: 22 }}>
          Persist before send: sealed AES-256-GCM phase state. A phase advances only after its outbound batch is
          acknowledged.
        </Note>
      </StepList>
    </VarShell>
  );
};

const VE_KeyCode: Page = () => {
  const proc = useProcess(3, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.5 Two DKG ceremonies, one roster" lens="Explained via code" title="Where the key material lives" proc={proc}>
      <At x={120} y={262} w={900}>
        <VE_CodeBox>
          <VE_CL color={c.muted}>{'// cdk-common/src/federation/frost_dkg.rs'}</VE_CL>
          <VE_CL>{'pub struct FederationFrostDkgContext {'}</VE_CL>
          <VE_CL on={s === 1}>{'    federation_id,'}</VE_CL>
          <VE_CL on={s === 1}>{'    ceremony_id,        // shared with BLS'}</VE_CL>
          <VE_CL on={s === 1}>{'    setup_authorization,'}</VE_CL>
          <VE_CL>{'    root_key_epoch,'}</VE_CL>
          <VE_CL>{'    protocol_version,   // 2'}</VE_CL>
          <VE_CL>{'    ciphersuite,        // "secp256k1_sha256_tr_v1"'}</VE_CL>
          <VE_CL on={s === 1}>{'    threshold,          // = signature_threshold'}</VE_CL>
          <VE_CL on={s === 1}>{'    participants,       // = roster member IDs'}</VE_CL>
          <VE_CL>{'}'}</VE_CL>
          <VE_CL on={s === 1}>{'validate_against(config)  // all of the above'}</VE_CL>
          <VE_CL>{'pub struct FederationDualDkgResult { bls, frost }'}</VE_CL>
        </VE_CodeBox>
        <Note style={{ marginTop: 16 }}>
          No production function reconstructs the root, exports a plaintext share or a derived private key, or signs an
          arbitrary digest.
        </Note>
      </At>
      <VE_Box x={1080} y={262} w={720} h={140} title="crates/cdk-axum/src/federation/dkg_driver.rs" titleMono show={s >= 1} dimTo={0.25} size={22}>
        Drives both ceremonies on the private plane; activation needs both results.
      </VE_Box>
      <VE_Box x={1080} y={422} w={720} h={176} title="crates/cdk-frost" titleMono tone={c.cool} show={s >= 2} dimTo={0.25} size={22}>
        Root package, sealed share, application registration, additive derivation, nonce store, FROST signing. No BDK,
        network, mint logic, consensus or transport.
      </VE_Box>
      <VE_Box x={1080} y={618} w={720} h={140} title="crates/cdk-frost-bip32" titleMono tone={c.clayHex} show={s >= 3} dimTo={0.25} size={22}>
        <VE_C>org.cashubtc.cdk.federated-onchain</VE_C> v1: chain code, branches 0 and 1, descriptors, BIP341.
      </VE_Box>
      <VE_Box x={1080} y={778} w={720} h={110} title="crates/cdk-frost-bark" titleMono tone={c.clayHex} show={s >= 3} dimTo={0.25} size={22} delay={80}>
        Bark VTXO keys from a registered application on the same root.
      </VE_Box>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// 1.5 On-chain melt: intent to broadcast
// ═════════════════════════════════════════════════════════════════════════════

const VE_TxBox = ({ x, y, w, h, tone = c.line, show = true, delay = 0, children }: { x: number; y: number; w: number; h: number; tone?: string; show?: boolean; delay?: number; children: ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      boxSizing: 'border-box',
      border: `1.75px solid ${tone}`,
      background: c.card,
      borderRadius: 12,
      padding: '10px 20px',
      fontSize: 24,
      lineHeight: 1.35,
      ...VE_enter(show, 0, delay),
    }}
  >
    {children}
  </div>
);

const VE_MX = [380, 540, 700, 860, 1020];
const VE_MELT_STATUS = [
  '',
  'Melt accepted: proofs reserved, no bitcoin moved',
  'Proposal: the exact unsigned transaction',
  'Checked independently by all five members',
  'Signed by m1, m3 and m4 together',
  'Signed bytes stored, then broadcast',
];

const VE_MeltBeginner: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const signer = (i: number) => i === 0 || i === 2 || i === 3;
  return (
    <VarShell of="1.5 On-chain melt: intent to broadcast" lens="Beginner" title="Paying 40,000 sat from the federation's coins" proc={proc}>
      <Canvas>
        {VE_MX.map((x, i) => (
          <g key={i}>
            <Draw x1={x} y1={336} x2={330} y2={470} show={s >= 4 && signer(i)} color={c.cool} width={2} delay={i * 60} />
            <Member x={x} y={300} r={36} label={`m${i + 1}`} tone={s >= 4 && signer(i) ? 'cool' : s >= 3 ? 'good' : 'idle'} />
          </g>
        ))}
        <Draw x1={500} y1={535} x2={856} y2={475} show={s >= 2} color={c.node} width={2} />
        <Draw x1={500} y1={535} x2={856} y2={585} show={s >= 2} color={c.node} width={2} delay={100} />
      </Canvas>
      <VE_TxBox x={160} y={470} w={340} h={130} tone={s >= 4 ? c.cool : c.line} show={s >= 2}>
        <VE_Label>input</VE_Label>
        <div style={{ fontSize: 30 }}>100,000 sat</div>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 21, color: c.cool }}>one Schnorr signature</div>
        </Fade>
      </VE_TxBox>
      <VE_TxBox x={860} y={430} w={460} h={90} show={s >= 2} delay={150}>
        <div style={{ fontSize: 28 }}>40,000 sat</div>
        <div style={{ fontSize: 21, color: c.muted }}>to the user's address</div>
      </VE_TxBox>
      <VE_TxBox x={860} y={540} w={460} h={90} show={s >= 2} delay={250}>
        <div style={{ fontSize: 28 }}>58,800 sat</div>
        <div style={{ fontSize: 21, color: c.muted }}>change, federation address</div>
      </VE_TxBox>
      <At x={880} y={648}>
        <Fade show={s >= 2} delay={350}>
          <span style={{ fontSize: 24, color: c.muted }}>fee 1,200 sat</span>
        </Fade>
      </At>
      <At x={160} y={630} w={640}>
        <Fade show={s >= 3}>
          <div style={{ fontSize: 23, lineHeight: 1.6 }}>
            <div>
              100,000 = 40,000 + 58,800 + 1,200 <VE_Mark />
            </div>
            <div>
              fee 1,200 ≤ quote's cap 2,000 <VE_Mark />
            </div>
            <div>
              destination = the quote's address <VE_Mark />
            </div>
            <div>
              input belongs to the federation <VE_Mark />
            </div>
          </div>
        </Fade>
      </At>
      <At x={120} y={830} w={1220}>
        {s >= 1 && (
          <VE_Swap k={s} style={{ fontSize: 26, borderLeft: `3px solid ${c.clayHex}`, paddingLeft: 18 }}>
            {VE_MELT_STATUS[s]}
          </VE_Swap>
        )}
      </At>
      <StepList>
        <StepItem n={1} step={s}>
          The wallet melts eCash for 40,000 sat, fee cap 2,000. The members order the Melt; the proofs are reserved.
        </StepItem>
        <StepItem n={2} step={s}>
          One member drafts the transaction.
        </StepItem>
        <StepItem n={3} step={s}>
          Every member checks the sums, the fee cap and the destination.
        </StepItem>
        <StepItem n={4} step={s}>
          Any 3 of the 5 members produce one Schnorr signature.
        </StepItem>
        <StepItem n={5} step={s}>
          The signed bytes are stored, then broadcast. A retry sends the same bytes.
        </StepItem>
      </StepList>
    </VarShell>
  );
};

const VE_MeltAdvanced: Page = () => {
  const proc = useProcess(3, 2400);
  const s = proc.step;
  return (
    <VarShell of="1.5 On-chain melt: intent to broadcast" lens="Advanced" title="Proposal, recomputation, signing authorization" proc={proc}>
      <VE_Box x={120} y={262} w={540} h={470} title="Proposal, a consensus operation" show={s >= 1} dimTo={0.25}>
        <VE_CL color={c.clayHex}>FederationTransactionProposal</VE_CL>
        <VE_CL>batch_id, intent_ids</VE_CL>
        <VE_CL>scope: root epoch, application,</VE_CL>
        <VE_CL>{'  key epoch, network, policy'}</VE_CL>
        <VE_CL>
          proposer{'      '}
          <span style={{ color: c.bad }}>no authority</span>
        </VE_CL>
        <VE_CL>selected_inputs</VE_CL>
        <VE_CL>recipient_outputs, change_output</VE_CL>
        <VE_CL>unsigned_transaction</VE_CL>
        <VE_CL>fee_sat, fee_rate_sat_per_kwu</VE_CL>
        <VE_CL>sighash_type, psbt_commitment</VE_CL>
        <VE_CL>replacement_of</VE_CL>
      </VE_Box>
      <At x={120} y={752} w={540}>
        <Fade show={s >= 1} dimTo={0.25}>
          <Note style={{ fontSize: 22 }}>At most 64 inputs, 65 outputs, weight 400,000, 512 KiB encoded.</Note>
        </Fade>
      </At>
      <VE_Box x={690} y={262} w={540} h={470} title="Recomputed by every member" tone={c.clayHex} show={s >= 2} dimTo={0.25}>
        <VE_CL color={c.clayHex}>FederationTransactionPolicyAudit</VE_CL>
        <VE_CL>txid{'         '}from unsigned bytes</VE_CL>
        <VE_CL>fee_sat, fee_rate_sat_per_kwu</VE_CL>
        <VE_CL>weight{'       '}key-path signed</VE_CL>
        <VE_CL>fee_contributions per intent</VE_CL>
        <VE_CL>taproot_sighashes per input</VE_CL>
        <div style={{ fontSize: 22, lineHeight: 1.42, marginTop: 12 }}>
          Also: inputs owned and spendable, value conservation, each intent's <VE_C>maximum_fee_sat</VE_C>, destination
          script, network.
        </div>
      </VE_Box>
      <VE_Box x={1260} y={262} w={540} h={470} title="Signing authorization" tone={c.cool} show={s >= 3} dimTo={0.25}>
        <VE_CL color={c.cool}>FederationFrostSigning</VE_CL>
        <VE_CL color={c.cool}>{'  AuthorizationReference'}</VE_CL>
        <VE_CL>accepted_operation_id</VE_CL>
        <VE_CL>proposal_id, txid</VE_CL>
        <VE_CL>input_index</VE_CL>
        <VE_CL>sighash_type</VE_CL>
        <VE_CL>sighash{'           '}32 B</VE_CL>
        <div style={{ fontSize: 22, lineHeight: 1.42, marginTop: 12 }}>
          Built only in state <VE_C>Accepted</VE_C>. Signers rebuild the sighash; a wrong message, epoch or signer set is
          refused.
        </div>
      </VE_Box>
      <At x={120} y={880} w={1680}>
        <Note style={{ fontSize: 22 }}>
          <VE_C>crates/cdk-common/src/federation/transaction_proposal.rs</VE_C> · FROST round packages travel on the
          private plane, never in the journal.
        </Note>
      </At>
    </VarShell>
  );
};

const VE_MeltGraphical: Page = () => {
  const proc = useProcess(5);
  const s = proc.step;
  const mx = [700, 790, 880, 970, 1060];
  const signer = (i: number) => i === 0 || i === 2 || i === 3;
  return (
    <VarShell of="1.5 On-chain melt: intent to broadcast" lens="Graphical" title="From proofs to a broadcast transaction" proc={proc}>
      <Canvas>
        <WalletNode x={190} y={680} r={50} />
        <Arrow x1={242} y1={680} x2={326} y2={680} show={s >= 1} color={c.cool} />
        <Packet x1={242} y1={680} x2={326} y2={680} run={proc.anim && s === 1} dur={600} />
        <GFade show={s >= 1}>
          <rect x={330} y={630} width={200} height={100} rx={12} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 1.75 }} />
          <T x={430} y={689} size={28}>
            Melt
          </T>
        </GFade>
        <Arrow x1={534} y1={680} x2={694} y2={680} show={s >= 2} color={c.node} />
        {mx.map((x, i) => (
          <g key={i}>
            <Member x={x} y={390} r={34} label={`m${i + 1}`} tone={s >= 4 && signer(i) ? 'cool' : s >= 3 ? 'good' : 'idle'} />
            <T x={x} y={460} size={26} color={c.good} show={s >= 3} delay={i * 60}>
              ✓
            </T>
            <Draw x1={x} y1={470} x2={880} y2={576} show={s >= 4 && signer(i)} color={c.cool} width={2} delay={i * 80} />
          </g>
        ))}
        <rect
          x={700}
          y={580}
          width={360}
          height={200}
          rx={12}
          style={{
            fill: c.card,
            stroke: s >= 4 ? c.cool : c.node,
            strokeWidth: 2,
            strokeDasharray: s >= 4 ? 'none' : '7 6',
            opacity: s >= 2 ? 1 : 0,
            transition: `opacity 400ms ${EASE_OUT}, stroke 300ms ${EASE_OUT}`,
          }}
        />
        <GFade show={s >= 2}>
          <circle cx={770} cy={680} r={22} style={{ fill: c.panel, stroke: c.node, strokeWidth: 1.5 }} />
          <line x1={792} y1={680} x2={960} y2={640} style={{ stroke: c.node, strokeWidth: 1.75 }} />
          <line x1={792} y1={680} x2={960} y2={720} style={{ stroke: c.node, strokeWidth: 1.75 }} />
          <circle cx={980} cy={640} r={16} style={{ fill: c.coolSoft, stroke: c.cool, strokeWidth: 1.5 }} />
          <circle cx={980} cy={720} r={16} style={{ fill: c.panel, stroke: c.node, strokeWidth: 1.5 }} />
        </GFade>
        <T x={880} y={820} size={24} color={s >= 4 ? c.cool : c.muted} show={s >= 2}>
          {s >= 4 ? '3 of 5 signed' : 'proposal'}
        </T>
        <Arrow x1={1064} y1={680} x2={1176} y2={680} show={s >= 5} color={c.node} />
        <GFade show={s >= 5}>
          <rect x={1180} y={635} width={120} height={90} rx={10} style={{ fill: c.panel, stroke: c.ink, strokeWidth: 1.75 }} />
          <line x1={1200} y1={660} x2={1280} y2={660} style={{ stroke: c.node, strokeWidth: 2 }} />
          <line x1={1200} y1={680} x2={1280} y2={680} style={{ stroke: c.node, strokeWidth: 2 }} />
          <line x1={1200} y1={700} x2={1260} y2={700} style={{ stroke: c.node, strokeWidth: 2 }} />
          <T x={1240} y={760} size={24} color={c.muted}>
            stored
          </T>
        </GFade>
        <Arrow x1={1304} y1={680} x2={1476} y2={680} show={s >= 5} color={c.clayHex} delay={400} />
        <Packet x1={1304} y1={680} x2={1476} y2={680} run={proc.anim && s === 5} color={c.clayHex} delay={900} />
        <GFade show={s >= 5} delay={600}>
          <circle cx={1560} cy={680} r={80} style={{ fill: c.claySoft, stroke: c.clayHex, strokeWidth: 2 }} />
          <T x={1560} y={690} size={28}>
            Bitcoin
          </T>
        </GFade>
      </Canvas>
    </VarShell>
  );
};

const VE_State = ({
  x,
  y,
  w,
  name,
  show,
  on,
  tone = c.clayHex,
  dashed,
}: {
  x: number;
  y: number;
  w: number;
  name: ReactNode;
  show: boolean;
  on?: boolean;
  tone?: string;
  dashed?: boolean;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: 64,
      boxSizing: 'border-box',
      border: `1.75px ${dashed ? 'dashed' : 'solid'} ${on ? tone : c.node}`,
      background: on ? VE_soft(tone) : c.card,
      borderRadius: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: MONO,
      fontSize: 22,
      ...VE_enter(show, 0.2),
    }}
  >
    {name}
  </div>
);

const VE_Edge = ({ y, show, children }: { y: number; show: boolean; children: ReactNode }) => (
  <At x={560} y={y} w={500}>
    <Fade show={show} dimTo={0.2}>
      <div style={{ fontSize: 22, lineHeight: 1.35, color: c.muted }}>{children}</div>
    </Fade>
  </At>
);

const VE_MeltStates: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  const ys = [280, 400, 520, 640, 760];
  return (
    <VarShell of="1.5 On-chain melt: intent to broadcast" lens="Explained via state machine" title="The accepted transaction as a state machine" proc={proc}>
      <VE_State x={160} y={ys[0]} w={360} name="Accepted" show={s >= 1} on={s === 1} />
      <VE_State x={160} y={ys[1]} w={360} name="Signed" show={s >= 2} on={s === 2} />
      <VE_State x={160} y={ys[2]} w={360} name="BroadcastPending" show={s >= 3} on={s === 3} />
      <VE_State x={160} y={ys[3]} w={360} name="Broadcast" show={s >= 4} on={s === 4} />
      <VE_State x={160} y={ys[4]} w={360} name="Confirmed" show={s >= 5} on={s >= 5} tone={c.good} />
      <Canvas>
        <Arrow x1={340} y1={346} x2={340} y2={396} show={s >= 2} color={c.node} />
        <Arrow x1={340} y1={466} x2={340} y2={516} show={s >= 3} color={c.node} />
        <Arrow x1={340} y1={586} x2={340} y2={636} show={s >= 4} color={c.node} />
        <Arrow x1={340} y1={706} x2={340} y2={756} show={s >= 5} color={c.node} />
        <GFade show={s >= 2} to={0.8}>
          <line x1={352} y1={371} x2={548} y2={371} style={{ stroke: c.rule, strokeWidth: 1.5, strokeDasharray: '3 5' }} />
        </GFade>
        <GFade show={s >= 3} to={0.8}>
          <line x1={352} y1={491} x2={548} y2={491} style={{ stroke: c.rule, strokeWidth: 1.5, strokeDasharray: '3 5' }} />
        </GFade>
        <GFade show={s >= 4} to={0.8}>
          <line x1={352} y1={611} x2={548} y2={611} style={{ stroke: c.rule, strokeWidth: 1.5, strokeDasharray: '3 5' }} />
        </GFade>
        <GFade show={s >= 5} to={0.8}>
          <line x1={352} y1={731} x2={548} y2={731} style={{ stroke: c.rule, strokeWidth: 1.5, strokeDasharray: '3 5' }} />
        </GFade>
        <GFade show={s >= 5}>
          <path d="M 1066 300 H 1086 V 800 H 1066" style={{ fill: 'none', stroke: c.node, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
          <line x1={1086} y1={430} x2={1110} y2={430} style={{ stroke: c.node, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
          <line x1={1086} y1={640} x2={1110} y2={640} style={{ stroke: c.node, strokeWidth: 1.5, strokeDasharray: '5 6' }} />
        </GFade>
      </Canvas>
      <VE_Edge y={296} show={s >= 1}>
        on an accepted <VE_C>TransactionProposal</VE_C>
      </VE_Edge>
      <VE_Edge y={356} show={s >= 2}>
        <VE_C>TransactionSigned</VE_C>: exact bytes persisted
      </VE_Edge>
      <VE_Edge y={476} show={s >= 3}>
        <VE_C>TransactionBroadcastIntent</VE_C>
      </VE_Edge>
      <VE_Edge y={596} show={s >= 4}>
        a success-equivalent broadcast observation
      </VE_Edge>
      <VE_Edge y={716} show={s >= 5}>
        settlement policy: depth and distinct observers
      </VE_Edge>
      <VE_State x={1110} y={398} w={240} name="Replaced { by }" show={s >= 5} dashed />
      <VE_State x={1110} y={608} w={240} name="Abandoned" show={s >= 5} dashed />
      <At x={1110} y={470} w={250}>
        <Fade show={s >= 5}>
          <div style={{ fontSize: 21, color: c.muted, lineHeight: 1.35 }}>replacement proposal accepted</div>
        </Fade>
      </At>
      <At x={1110} y={680} w={250}>
        <Fade show={s >= 5}>
          <div style={{ fontSize: 21, color: c.muted, lineHeight: 1.35 }}>another candidate of the batch confirmed</div>
        </Fade>
      </At>
      <At x={1110} y={770} w={250}>
        <Fade show={s >= 5}>
          <div style={{ fontSize: 21, color: c.clayHex, lineHeight: 1.35 }}>inputs stay reserved</div>
        </Fade>
      </At>
      <At x={1440} y={262} w={360}>
        <VE_Label>Payment intent</VE_Label>
      </At>
      <VE_State x={1440} y={300} w={360} name="Pending" show on={s === 0} tone={c.cool} />
      <VE_State x={1440} y={420} w={360} name="Accepted { proposal_id }" show={s >= 1} on={s >= 1 && s < 5} tone={c.cool} />
      <VE_State x={1440} y={540} w={360} name="Completed { txid }" show={s >= 5} on={s >= 5} tone={c.good} />
      <VE_State x={1440} y={660} w={360} name="Failed" show={s >= 5} dashed />
      <Canvas>
        <Arrow x1={1620} y1={366} x2={1620} y2={416} show={s >= 1} color={c.node} />
        <Arrow x1={1620} y1={486} x2={1620} y2={536} show={s >= 5} color={c.node} />
      </Canvas>
      <At x={120} y={870} w={1680}>
        <Note>
          Melt saga: a paid <VE_C>MeltQuotePayment</VE_C> quorum finalizes (inputs spent, quote paid, change signed); a
          failed quorum rolls back. <VE_C>FederationAcceptedTransactionState</VE_C> in{' '}
          <VE_C>transaction_proposal.rs</VE_C>.
        </Note>
      </At>
    </VarShell>
  );
};

const VE_BZ = [560, 1120];

const VE_MeltByzantine: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.5 On-chain melt: intent to broadcast" lens="Perspective: Byzantine member" title="One member in a melt: what it can and cannot do" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VE_TR head h={48}>
          <VE_TD head w={VE_BZ[0]}>Attempt</VE_TD>
          <VE_TD head w={VE_BZ[1]}>Outcome</VE_TD>
        </VE_TR>
        <VE_TR h={72} show={s >= 1} hot={s >= 1} tone={c.good}>
          <VE_TD w={VE_BZ[0]}>Propose a transaction</VE_TD>
          <VE_TD w={VE_BZ[1]} size={22}>
            <VE_Mark /> Allowed. The <VE_C>proposer</VE_C> field is diagnostic and grants no authority.
          </VE_TD>
        </VE_TR>
        <VE_TR h={72} show={s >= 1} hot={s >= 1} tone={c.good} delay={60}>
          <VE_TD w={VE_BZ[0]}>Broadcast accepted bytes</VE_TD>
          <VE_TD w={VE_BZ[1]} size={22}>
            <VE_Mark /> Allowed for any ready member, using only the persisted <VE_C>TransactionSigned</VE_C> bytes.
          </VE_TD>
        </VE_TR>
        <VE_TR h={72} show={s >= 2}>
          <VE_TD w={VE_BZ[0]}>Pay a different address</VE_TD>
          <VE_TD w={VE_BZ[1]} size={22}>
            <VE_Mark ok={false} /> Each member checks outputs against the intent's <VE_C>destination_script</VE_C>.
          </VE_TD>
        </VE_TR>
        <VE_TR h={72} show={s >= 2} delay={60}>
          <VE_TD w={VE_BZ[0]}>Take a higher fee</VE_TD>
          <VE_TD w={VE_BZ[1]} size={22}>
            <VE_Mark ok={false} /> Fee and fee rate are recomputed; each intent carries <VE_C>maximum_fee_sat</VE_C>.
          </VE_TD>
        </VE_TR>
        <VE_TR h={72} show={s >= 2} delay={120}>
          <VE_TD w={VE_BZ[0]}>Spend a coin that is not spendable</VE_TD>
          <VE_TD w={VE_BZ[1]} size={22}>
            <VE_Mark ok={false} /> Inputs must be accepted and spendable; each UTXO has one reservation owner.
          </VE_TD>
        </VE_TR>
        <VE_TR h={72} show={s >= 3}>
          <VE_TD w={VE_BZ[0]}>Get another message signed</VE_TD>
          <VE_TD w={VE_BZ[1]} size={22}>
            <VE_Mark ok={false} /> Signers rebuild the sighash from the accepted transaction; wrong message, epoch or
            signer set is refused.
          </VE_TD>
        </VE_TR>
        <VE_TR h={72} show={s >= 3} delay={60}>
          <VE_TD w={VE_BZ[0]}>Broadcast different bytes</VE_TD>
          <VE_TD w={VE_BZ[1]} size={22}>
            <VE_Mark ok={false} /> The broadcast intent names one txid; observations cannot substitute another.
          </VE_TD>
        </VE_TR>
        <VE_TR h={72} show={s >= 4}>
          <VE_TD w={VE_BZ[0]}>Skip from Melt to broadcast</VE_TD>
          <VE_TD w={VE_BZ[1]} size={22}>
            <VE_Mark ok={false} /> Broadcast needs an accepted proposal, <VE_C>TransactionSigned</VE_C> and a broadcast
            intent.
          </VE_TD>
        </VE_TR>
      </At>
      <At x={120} y={912} w={1680}>
        <Fade show={s >= 4}>
          <Note>The FROST coordinator only aggregates shares. It is replaceable and has no authority.</Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VE_NX = (i: number) => 120 + i * 288;

const VE_NState = ({ i, name, show, sub, tone = c.cool, delay = 0 }: { i: number; name: string; show: boolean; sub: ReactNode; tone?: string; delay?: number }) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: VE_NX(i),
        top: 290,
        width: 240,
        height: 72,
        boxSizing: 'border-box',
        border: `1.75px solid ${show ? tone : c.rule}`,
        background: show ? VE_soft(tone) : c.card,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: 22,
        ...VE_enter(show, 0.25, delay),
      }}
    >
      {name}
    </div>
    <At x={VE_NX(i)} y={378} w={240}>
      <Fade show={show} dimTo={0.25} delay={delay}>
        <div style={{ fontSize: 21, lineHeight: 1.35, color: c.muted, textAlign: 'center' }}>{sub}</div>
      </Fade>
    </At>
  </>
);

const VE_Reason = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      fontFamily: MONO,
      fontSize: 21,
      color: c.bad,
      border: `1.5px solid ${c.rule}`,
      background: c.card,
      borderRadius: 6,
      padding: '3px 9px',
    }}
  >
    {children}
  </span>
);

const VE_MeltNonce: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  return (
    <VarShell of="1.5 On-chain melt: intent to broadcast" lens="Focus: nonce lifecycle" title="Nonce lifecycle in the FROST key manager" proc={proc}>
      <VE_NState i={0} name="Generated" show={s >= 1} sub="secret nonces sealed" />
      <VE_NState i={1} name="Reserved" show={s >= 1} delay={100} sub="owned by one authorization slot" />
      <VE_NState i={2} name="CommitmentSent" show={s >= 1} delay={200} sub="commitment may have left" />
      <VE_NState i={3} name="Signing" show={s >= 2} sub="package hash locked; secret nonces removed" />
      <VE_NState i={4} name="ShareProduced" show={s >= 2} delay={100} sub="share cached, not yet delivered" />
      <VE_NState i={5} name="Consumed" show={s >= 2} delay={200} tone={c.good} sub="terminal; an exact retry returns the share" />
      <Canvas>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <Arrow x1={VE_NX(i) + 242} y1={326} x2={VE_NX(i + 1) - 4} y2={326} show={s >= (i < 2 ? 1 : 2)} color={c.node} delay={i < 2 ? i * 100 : (i - 2) * 100} />
            <GFade show={s >= 3} to={0.7} delay={i * 50}>
              <line
                x1={VE_NX(i) + 120}
                y1={470}
                x2={960}
                y2={556}
                style={{ stroke: c.bad, strokeWidth: 1.5, strokeDasharray: '5 6' }}
              />
            </GFade>
          </g>
        ))}
      </Canvas>
      <div
        style={{
          position: 'absolute',
          left: 820,
          top: 560,
          width: 280,
          height: 72,
          boxSizing: 'border-box',
          border: `1.75px solid ${c.bad}`,
          background: c.badSoft,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: 22,
          ...VE_enter(s >= 3, 0.25),
        }}
      >
        <span>Burned {'{ reason }'}</span>
      </div>
      <At x={120} y={566} w={660}>
        <Fade show={s >= 3} dimTo={0.25}>
          <Note>Any non-terminal state can burn. Burned and Consumed are terminal: the nonce is never used again.</Note>
        </Fade>
      </At>
      <At x={1140} y={560} w={660}>
        <Fade show={s >= 3} dimTo={0.25}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <VE_Reason>Aborted</VE_Reason>
            <VE_Reason>AmbiguousResponse</VE_Reason>
            <VE_Reason>Timeout</VE_Reason>
            <VE_Reason>CoordinatorLost</VE_Reason>
            <VE_Reason>SignerSetChanged</VE_Reason>
            <VE_Reason>InvalidPackage</VE_Reason>
            <VE_Reason>RestartRecovery</VE_Reason>
            <VE_Reason>ReplacedAttempt</VE_Reason>
            <VE_Reason>InternalFailure</VE_Reason>
          </div>
        </Fade>
      </At>
      <At x={120} y={760} w={1680}>
        <Fade show={s >= 4}>
          <div style={{ fontSize: 25, lineHeight: 1.45, borderLeft: `3px solid ${c.clayHex}`, paddingLeft: 18 }}>
            Why: one Schnorr nonce used with two challenges reveals the secret, <M>x = (s₁ − s₂)/(e₁ − e₂)</M>. A restart,
            timeout or ambiguous reply therefore burns the nonce; a new attempt uses a fresh one.
          </div>
          <Note style={{ marginTop: 18, fontSize: 22 }}>
            Main-slide shorthand: vacant → reserved → published → consumed. One durable compare-and-swap nonce store per
            participant: <VE_C>crates/cdk-frost/src/nonce.rs</VE_C>.
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VE_RChip = ({ i, y, show, tone = c.line, delay = 0, children }: { i: number; y: number; show: boolean; tone?: string; delay?: number; children: ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      left: 120 + i * 280,
      top: y,
      width: 250,
      height: 84,
      boxSizing: 'border-box',
      border: `1.5px solid ${tone}`,
      background: tone === c.line ? c.card : VE_soft(tone),
      borderRadius: 10,
      padding: '6px 14px',
      display: 'flex',
      alignItems: 'center',
      fontSize: 22,
      lineHeight: 1.3,
      ...VE_enter(show, 0.15, delay),
    }}
  >
    <span>{children}</span>
  </div>
);

const VE_MeltReorg: Page = () => {
  const proc = useProcess(4, 2200);
  const s = proc.step;
  const A = 320;
  const B = 580;
  return (
    <VarShell of="1.5 On-chain melt: intent to broadcast" lens="Framing: reorg before vs after issuance" title="A deposit reorg, before and after issuance" proc={proc}>
      <At x={120} y={278}>
        <VE_Label>Before issuance</VE_Label>
      </At>
      <VE_RChip i={0} y={A} show={s >= 1}>deposit observed</VE_RChip>
      <VE_RChip i={1} y={A} show={s >= 1} delay={80}>
        confirmed by <M>q</M> members at depth
      </VE_RChip>
      <VE_RChip i={2} y={A} show={s >= 1} delay={160} tone={c.bad}>
        block disconnected
      </VE_RChip>
      <VE_RChip i={3} y={A} show={s >= 2}>
        <M>q</M> reorg observations
      </VE_RChip>
      <VE_RChip i={4} y={A} show={s >= 2} delay={80}>
        UTXO <VE_C>Reorged</VE_C>, new epoch
      </VE_RChip>
      <VE_RChip i={5} y={A} show={s >= 2} delay={160} tone={c.good}>
        quote stays unpaid; observe again
      </VE_RChip>
      <At x={120} y={B - 42}>
        <Fade show={s >= 3}>
          <VE_Label>After issuance</VE_Label>
        </Fade>
      </At>
      <VE_RChip i={0} y={B} show={s >= 3}>deposit spendable</VE_RChip>
      <VE_RChip i={1} y={B} show={s >= 3} delay={60}>
        <VE_C>MintQuotePayment</VE_C> quorum
      </VE_RChip>
      <VE_RChip i={2} y={B} show={s >= 3} delay={120} tone={c.clayHex}>
        eCash issued
      </VE_RChip>
      <VE_RChip i={3} y={B} show={s >= 3} delay={180} tone={c.bad}>
        block disconnected
      </VE_RChip>
      <VE_RChip i={4} y={B} show={s >= 3} delay={240}>
        <M>q</M> reorg observations
      </VE_RChip>
      <VE_RChip i={5} y={B} show={s >= 3} delay={300} tone={c.bad}>
        liability alarm; no unmint
      </VE_RChip>
      <Canvas>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <Arrow x1={370 + i * 280 + 2} y1={A + 42} x2={400 + i * 280 - 4} y2={A + 42} show={s >= (i < 2 ? 1 : 2)} color={c.node} />
            <Arrow x1={370 + i * 280 + 2} y1={B + 42} x2={400 + i * 280 - 4} y2={B + 42} show={s >= 3} color={c.node} delay={i * 60} />
          </g>
        ))}
      </Canvas>
      <At x={120} y={740} w={1680}>
        <Fade show={s >= 4}>
          <Note>
            <div>
              One member's reorg report is diagnostic only: the <VE_C>Reorged</VE_C> transition needs the same observer
              quorum as spendability.
            </div>
            <div style={{ marginTop: 8 }}>
              UTXO states: Observed → Confirmed → Spendable → Reserved → Spent; Reorged; Quarantined on conflicting
              evidence.
            </div>
            <div style={{ marginTop: 8 }}>
              <VE_C>crates/cdk-common/src/federation/chain_observation.rs</VE_C>
            </div>
          </Note>
        </Fade>
      </At>
    </VarShell>
  );
};

const VE_CT = [400, 520, 760];

const VE_MeltCrash: Page = () => {
  const proc = useProcess(5, 2000);
  const s = proc.step;
  return (
    <VarShell of="1.5 On-chain melt: intent to broadcast" lens="Framing: crash at each stage" title="Crash points in an on-chain melt" proc={proc}>
      <At x={120} y={262} w={1680}>
        <VE_TR head h={48}>
          <VE_TD head w={VE_CT[0]}>Crash after</VE_TD>
          <VE_TD head w={VE_CT[1]}>Durable state on restart</VE_TD>
          <VE_TD head w={VE_CT[2]}>What happens</VE_TD>
        </VE_TR>
        <VE_TR h={100} show={s >= 1} hot={s === 1}>
          <VE_TD w={VE_CT[0]}>Melt accepted</VE_TD>
          <VE_TD w={VE_CT[1]} size={22}>
            inputs reserved; payment intent <VE_C>Pending</VE_C>
          </VE_TD>
          <VE_TD w={VE_CT[2]} size={22}>
            The intent stays eligible for deterministic batching.
          </VE_TD>
        </VE_TR>
        <VE_TR h={100} show={s >= 2} hot={s === 2}>
          <VE_TD w={VE_CT[0]}>Proposal accepted, FROST round open</VE_TD>
          <VE_TD w={VE_CT[1]} size={22}>
            nonce records not terminal
          </VE_TD>
          <VE_TD w={VE_CT[2]} size={22}>
            Burned with <VE_C>RestartRecovery</VE_C>; a new attempt uses fresh nonces.
          </VE_TD>
        </VE_TR>
        <VE_TR h={100} show={s >= 3} hot={s === 3}>
          <VE_TD w={VE_CT[0]}>
            <VE_C>TransactionSigned</VE_C> persisted
          </VE_TD>
          <VE_TD w={VE_CT[1]} size={22}>
            exact signed bytes and txid
          </VE_TD>
          <VE_TD w={VE_CT[2]} size={22}>
            Broadcast intent; any ready member sends those bytes.
          </VE_TD>
        </VE_TR>
        <VE_TR h={100} show={s >= 4} hot={s === 4}>
          <VE_TD w={VE_CT[0]}>Broadcast, result ambiguous</VE_TD>
          <VE_TD w={VE_CT[1]} size={22}>
            inputs stay reserved
          </VE_TD>
          <VE_TD w={VE_CT[2]} size={22}>
            Exact-byte rebroadcast, or a reviewed fee-bump replacement with a fresh FROST session.
          </VE_TD>
        </VE_TR>
        <VE_TR h={100} show={s >= 5} hot={s === 5}>
          <VE_TD w={VE_CT[0]}>Confirmation observed</VE_TD>
          <VE_TD w={VE_CT[1]} size={22}>
            settlement policy met
          </VE_TD>
          <VE_TD w={VE_CT[2]} size={22}>
            A paid <VE_C>MeltQuotePayment</VE_C> quorum finalizes the melt; change is signed if present.
          </VE_TD>
        </VE_TR>
      </At>
      <At x={120} y={846} w={1680}>
        <Note>
          <div>Signed bytes are persisted before the broadcast intent: a crash cannot broadcast bytes the journal does not know.</div>
          <div style={{ marginTop: 8 }}>
            <VE_C>cdk-mintd federation rebroadcast --proposal-id &lt;id&gt; --acknowledge-exact-byte-retry</VE_C>
          </div>
        </Note>
      </At>
    </VarShell>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Deck
// ═════════════════════════════════════════════════════════════════════════════

const VE_Cover: Page = () => (
  <VarCover
    section="1.4–1.5"
    title="Membership and custody"
    sources={[
      { n: '1.4', title: 'Federation ID', count: 7 },
      { n: '1.4', title: 'Restart, restore and catch-up', count: 7 },
      { n: '1.5', title: 'Funding backends', count: 7 },
      { n: '1.5', title: 'Two DKG ceremonies, one roster', count: 7 },
      { n: '1.5', title: 'On-chain melt: intent to broadcast', count: 8 },
    ]}
  />
);

const PAGES: [Page, string | undefined][] = [
  [VE_Cover, undefined],

  [FederationId, 'Original slide.'],
  [
    VE_FidBeginner,
    'Beginner. A three-member roster is written out as one string and hashed live with SHA-256. Changing one URL gives an unrelated hash, so a changed roster is a different federation. The string is illustrative; the next variation shows the real encoding.',
  ],
  [
    VE_FidBytes,
    'Explained via bytes. The exact transcript from derive_federation_id: length-prefixed domain, setup authorization, n, t, c, then every member with its ID, both URLs and its identity key. The hash is computed over a toy roster with keys 1·G, 2·G, 3·G; appending .org to one URL changes a length prefix and the whole ID.',
  ],
  [
    VE_FidAdvanced,
    'Advanced. Two hashes: the federation ID over the roster and the config digest over the complete public config. Show where each is enforced: config validation with the BFT threshold bounds, every consensus envelope and both DKG results, and the wallet check of each member’s mint info.',
  ],
  [
    VE_FidGraphical,
    'Graphical. The public config as one document: the upper rows feed the federation ID, all rows feed the config digest. A keyset rotation changes only the digest; a URL change changes both.',
  ],
  [
    VE_FidTable,
    'Framing as a decision table. Each change an operator might want, whether it is in the ID or the digest, and the path it takes. Everything except keyset rotation and local TLS renewal means a new setup.',
  ],
  [
    VE_FidWallet,
    'Perspective of the wallet. It imports the config, fetches mint info from every member, and checks member ID, federation ID, config digest and protocol version per member. A member with a locally edited config is excluded; aggregation continues if t members remain valid.',
  ],
  [
    VE_FidDns,
    'Framing as a failure mode: one member renames its domain. Each shortcut fails for a specific reason; the only path is a new setup and a user migration. Close with the open design question of separating locator from identity.',
  ],

  [Recovery, 'Original slide.'],
  [
    VE_RecBeginner,
    'Beginner. Three journals as lists of named operations. m2 restores up to entry 2, receives 3 to 5 from peers and replays them in order. Equal digests mean equal histories; only then does m2 sign again. The operation sequence is illustrative.',
  ],
  [
    VE_RecAdvanced,
    'Advanced. The catch-up request and per-entry projection, the order-digest formula with its genesis value, the certificate quorum and mismatch errors, and the readiness gate with its latched audit failure.',
  ],
  [
    VE_RecGraphical,
    'Graphical. The journal index as an axis: the restored snapshot up to the frontier, the suffix verified from the trusted checkpoint, the tail from peers, then the digest check and the ready state. Keys come only from the backup.',
  ],
  [
    VE_RecTable,
    'Explained as a table of loss cases, from a process crash to lost secrets. Everything that is history is recoverable; identity key, BLS shares and the sealed FROST share are not. End on the checkpoint-is-not-a-snapshot point.',
  ],
  [
    VE_RecOperator,
    'Perspective of the operator. Seven steps: stop and snapshot, write the manifest, keep one generation together; then restore files, start with restore_manifest_path, audit the checkpoint, and catch up. The manifest fields explain why a mismatched file set refuses to start.',
  ],
  [
    VE_RecPeers,
    'Framing: what peers can and cannot give a restoring member. History with certificates on the left, member-local secrets on the right. Losing the right side ends the seat; copying another member’s config is never an option.',
  ],
  [
    VE_RecDigest,
    'Focus on the two digests. The order digest chains operation IDs from a fixed genesis; the state digest covers the materialized rows. All hex values are golden vectors from journal.rs. Catch-up requires both to match.',
  ],

  [Funding, 'Original slide.'],
  [
    VE_FundBeginner,
    'Beginner. A mint as an issuer plus reserves, with 1,000 sat in and 400 sat out. Federating only the issuer leaves one operator holding the remaining 600 sat; threshold custody puts the same members on both sides.',
  ],
  [
    VE_FundAdvanced,
    'Advanced. The threshold rules from the architecture decision: FROST threshold equals t, fail-closed activation, the BFT bounds, and which quorum governs an ordered spend. The table gives concrete numbers for 4, 5 and 7 members.',
  ],
  [
    VE_FundGraphical,
    'Graphical. Three lanes: who can issue, who can move reserves with a single node, and who can move them with FROST. The point is visible without text: one key versus three of the same five.',
  ],
  [
    VE_FundTable,
    'Explained as a comparison table of backends: keys, what marks a quote paid, what moves funds, and where each belongs. Single-operator connectors are for standalone CDK; fakewallet is for tests.',
  ],
  [
    VE_FundFailure,
    'Framing as a failure mode: a federated issuer over one CLN node. The node fakes a payment, three members observe the same lie and eCash is issued; then it pays the wrong invoice and sweeps the reserves.',
  ],
  [
    VE_FundMember,
    'Perspective of one member. The member-local mintd section has no key material; shared policy is in the public config; the only secret is the sealed FROST share. There is no export or force-spend path.',
  ],
  [
    VE_FundConstraint,
    'Framing: the constraint that forces the design. Four cases where issuance and custody have different quorums, each with its consequence. The rule that follows: same roster, same history, custody threshold equal to t.',
  ],

  [KeyMaterial, 'Original slide.'],
  [
    VE_KeyBeginner,
    'Beginner. Toy Shamir shares mod 97 show why a public tweak can be added to every share: the Lagrange weights sum to 1, so the tweak passes through to the secret. This is the reason BIP32 child keys can be derived without reconstructing the root.',
  ],
  [
    VE_KeyAdvanced,
    'Advanced. The derivation formulas with their hash labels, the index rules including the invalid-child retry, the bindings that stop substitution between rounds, and the residual risks named in the reviews.',
  ],
  [
    VE_KeyGraphical,
    'Graphical. One roster feeds two ceremonies; both outputs are required before the federation is ready; Cashu keysets come from BLS, BDK and Bark derive from the FROST root.',
  ],
  [
    VE_KeyReasons,
    'Focus on the derivation chain. Each of the six steps with the reason it exists and the crate that owns it. Step 4 explains why hardened derivation is impossible for a threshold key.',
  ],
  [
    VE_KeyAttacker,
    'Perspective of an attacker trying to split custody from issuance: lower threshold, extra participant, foreign root, equivocation, replay. Each is rejected by a named check in frost_dkg.rs or the ceremony rules.',
  ],
  [
    VE_KeyRounds,
    'Focus on the FROST ceremony as a sequence diagram: broadcast round, confidential round, local conversion, public confirmation, activation. Mention persist-before-send and batch acknowledgement for partitions.',
  ],
  [
    VE_KeyCode,
    'Explained via code. The FROST DKG context struct and what it copies from the BLS setup, then the crate boundaries: cdk-frost has no network or consensus dependencies, the Bitcoin and Bark specifics live in their own adapters.',
  ],

  [Melt, 'Original slide.'],
  [
    VE_MeltBeginner,
    'Beginner. A 40,000 sat payout with toy numbers: one input, a payment and change, a 1,200 sat fee under a 2,000 sat cap. Every member checks the sums before three of five sign; the bytes are stored before broadcast.',
  ],
  [
    VE_MeltAdvanced,
    'Advanced. The proposal fields, what every member recomputes in the policy audit, and the exact tuple a signature share is authorized for. Limits and the file are at the bottom.',
  ],
  [
    VE_MeltGraphical,
    'Graphical. Proofs enter consensus, a proposal appears dashed, five members check it, three sign, the bytes are stored and sent to Bitcoin. Walk through it without reading text.',
  ],
  [
    VE_MeltStates,
    'Explained as a state machine. The accepted transaction moves Accepted, Signed, BroadcastPending, Broadcast, Confirmed, each on a named operation or observation. Replaced and Abandoned keep inputs reserved; the payment intent runs in parallel.',
  ],
  [
    VE_MeltByzantine,
    'Perspective of a Byzantine member. Two things it may do, six things it may try, each with the check that stops it. The coordinator has no authority either.',
  ],
  [
    VE_MeltNonce,
    'Focus on the nonce lifecycle as implemented: six states, burn from any non-terminal state, nine burn reasons. The Schnorr nonce-reuse equation explains why ambiguity always burns.',
  ],
  [
    VE_MeltReorg,
    'Framing: a deposit reorg before versus after issuance. Before, the UTXO moves to a new epoch and the quote stays unpaid. After, the federation raises a liability alarm and does not unmint. One member cannot trigger either.',
  ],
  [
    VE_MeltCrash,
    'Framing: a crash at each stage of the melt and what the durable state allows on restart. Persisting signed bytes before the broadcast intent is the property that makes every row safe.',
  ],
];

export const meta: SlideMeta = {
  title: 'Variations · Membership and custody (temporary)',
  createdAt: '2026-09-28T09:06:00.000Z',
};
export default PAGES.map(([p]) => p) satisfies Page[];
export const notes = PAGES.map(([, n]) => n);
