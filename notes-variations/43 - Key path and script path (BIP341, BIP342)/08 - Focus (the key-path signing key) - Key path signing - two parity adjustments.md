# 43.08 · Key path signing: two parity adjustments

Variation 8 of slide 43 (Key path and script path (BIP341, BIP342)) · lens: Focus: the key-path signing key · deck `fcv-g-json-taproot` page 34 · 5 steps · script 135 words, about 60 s

## Script

A key-path-only output with a toy internal secret, 6.

**[1]** 6·G has an odd y-coordinate. The x-only key x(P) stands for the point with that x and even y, which is −6·G. So the secret matching x(P) is d = n − 6, with n the group order.

**[2]** With no script tree, the tweak t is the TapTweak hash of x(P) alone.

**[3]** The tweaked secret is q = d + t mod n. Its point Q has odd y again.

**[4]** BIP340 signing needs the secret of the even-y point with x(Q), so it signs with n − q. The signature verifies for x(Q).

**[5]** Skipping the first negation gives 6 + t, the secret of a different point, with x-coordinate 411ef3f6…, not x(Q). The signature fails. BIP341's taproot_tweak_seckey does the first negation; BIP340 signing does the second.

## Background

- **Point negation**: −X has the same x-coordinate as X and the opposite y parity. Its secret is n minus the secret of X.
- **Group order n**: the number of multiples of G before they repeat; secrets are taken mod n.
- **Why even y**: an x-only key denotes the even-y point (lift_x). A signer whose secret gives the odd-y point must negate it to match.
- **taproot_tweak_seckey (BIP341)**: negates the internal secret if its point has odd y, then adds t mod n.
- **BIP340 Sign**: negates the signing secret if its public point has odd y.
- **Why 6 + t fails**: (6 + t)·G ≠ ±Q, because Q = (t − 6)·G here, so its x differs from x(Q).

## Speaker note

- Values computed for the slide with the BIP340/BIP341 algorithms, not from test vectors. Recomputed here: x(P), d, t, q, x(Q), n − q and the wrong x `411ef3f6…` match; a BIP340 signature with q verifies for x(Q), one with 6 + t does not.
