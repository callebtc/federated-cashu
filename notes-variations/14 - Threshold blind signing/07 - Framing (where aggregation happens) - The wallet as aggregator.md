# 14.07 · The wallet as aggregator

Variation 7 of slide 14 (Threshold blind signing) · lens: Framing: where aggregation happens · deck `fcv-b-threshold` page 34 · 4 steps · script 113 words, about 50 s

## Script

Where aggregation happens. Left: a star, as implemented. Right: relaying through one member, which is not used.

**[1]** The wallet sends the request to every member.

**[2]** Shares come back to the wallet, which checks and interpolates them: Σ λᵢ·C′ᵢ. Members never exchange shares. The wallet checks each C′ᵢ against Kᵢ and can name a faulty member. Any t responses suffice.

**[3]** The alternative: members forward their shares, C′₁ and C′₃, to one member, here m2.

**[4]** That member returns one C′. It is on the path of every signature, and the wallet receives only C′, which it can check against K as a whole.

The private plane, /federation/v1, carries consensus, catch-up and DKG, not signature shares.

## Background

- **Star**: for signing, each member talks only to the wallet; the wallet is the hub and the aggregator.
- **Relay**: shares travel to one member, which combines them. That member must be online for every signature and sees all shares first.
- **Check against K**: e(C′, G₂) = e(B′, K) tests only the combined result; if it fails, it does not say which share was wrong.
- **Naming a faulty member**: possible in the star because each share is checked on its own against the published Kᵢ.
- **Private plane /federation/v1**: the member-to-member API, authenticated with member identity keys. Consensus messages, catch-up between members and DKG run there; wallets never use it.
