# 37.03 · Who can spend, over time

Variation 3 of slide 37 (Conditions as tags - HTLC (NUT-14)) · lens: Graphical · deck `fcv-g-json-taproot` page 13 · 4 steps · script 114 words, about 50 s

## Script

Three tag configurations of an HTLC, against time. The dashed line is the locktime.

**[1]** With locktime and refund tags, the receiver can spend at any time with the preimage and signatures. That pathway does not close at the locktime.

**[2]** From the locktime on, the sender can also spend, with signatures from the refund keys. After the locktime both pathways are open, and the first valid spend is the one the mint accepts.

**[3]** With a locktime but no refund tag, the receiver pathway is the same. After the locktime the proof becomes anyone-can-spend: it needs no witness at all.

**[4]** Without a valid locktime, the lock is permanent. Only the receiver pathway exists, at any time.

## Background

- **Mint clock**: NUT-11 compares `locktime` with the mint's local clock. The lock has expired when the clock is past the locktime.
- **Anyone-can-spend**: a proof that needs only its secret and a valid C. Any holder of the proof can swap it.
- **Permanent lock**: NUT-11's term for a missing or invalid `locktime`.
- **First valid spend**: after a successful spend the mint records the proof's Y as spent, so a second spend of the same proof fails.
