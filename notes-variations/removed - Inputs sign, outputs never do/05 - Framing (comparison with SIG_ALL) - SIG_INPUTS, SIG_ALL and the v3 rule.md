# removed.05 · SIG_INPUTS, SIG_ALL and the v3 rule

Variation 5 of slide removed (Inputs sign, outputs never do) · lens: Framing: comparison with SIG_ALL · deck `fcv-f-client-intent` page 33 · 3 steps · script 140 words, about 60 s

## Script

Three signing rules compared: NUT-11 SIG_INPUTS, NUT-11 SIG_ALL, and the v3 rule of NUT-10.

**[1]** SIG_INPUTS is the default flag. Each locked input signs its own secret string and nothing about outputs. Locks may differ, unlocked inputs may join, and mint quotes use a separate NUT-20 signature.

**[2]** SIG_ALL covers outputs. The first input's witness signs the inputs' secrets and C values and the outputs' amounts and B_ values. Every input needs the same kind, data and tags, so different locks and unlocked inputs are rejected. The choice is fixed per proof at lock time.

**[3]** v3: every input signs its own digest over the TLV transcript. Outputs are always covered, locks may differ, and mint quotes are inputs of the same transaction. It always applies, and there is no sigflag. NUT-11's same-tags rule already keeps a SIG_ALL input out of mixed transactions.

## Background

- **sigflag**: a NUT-11 tag in a P2PK secret choosing what the signature covers.
- **SIG_INPUTS**: signature over the input's secret only; outputs can be changed without invalidating it.
- **SIG_ALL**: signature over all inputs and outputs, in the first input's witness only, with identical locks required on every input.
- **NUT-20**: the pre-v3 signature that locks a mint quote to a key, separate from any proof signature.
- **Why v3 needs no uniformity rule**: each input signs its own message, so inputs with different keys each provide their own witness.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
