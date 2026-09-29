# 49.07 · Reused and related keys: what breaks

Variation 7 of slide 49 (Three forms of internal key) · lens: Framing: failure mode · deck `fcv-i-nutroot-spend` page 25 · 4 steps · script 139 words, about 60 s

## Script

**[1]** Failure one: the same K and tree twice give the same secret and the same Y. The mint cannot see it at issuance: outputs are blinded, so the B_ values differ. The first spend burns Y; every other proof with that secret is refused. Wallets should check new secrets against used ones.

**[2]** Failure two: the same K under different trees. The secrets differ, so nothing burns. But a script-path spend reveals K, and spends revealing a shared K link their proofs. Wallets should use a fresh K per proof.

**[3]** Failure three: 02‖x and 03‖x. Distinct secrets and Y, but one scalar key-path spends both, since signatures verify against x only.

**[4]** Failure four: non-hardened derivation. One BIP-32 child private key plus the xpub recovers the parent and every sibling. v3 keys travel as bearer k, so derivations must be hardened.

## Background

- **B_**: the blinded message the wallet sends at issuance. The same secret with a different blinding factor gives a different B_, so the mint cannot compare secrets.
- **Y**: hash_to_curve(secret), the key under which the mint records a spend.
- **Linking**: seeing the same K in two script-path witnesses tells the mint, or anyone the witnesses are disclosed to, that the proofs belong together.
- **x-only**: BIP-340 verifies against the x-coordinate. Wallets MUST NOT assume an x-only key identifies one proof or one spent-state entry.
- **Non-hardened BIP-32**: a child private key is the parent private key plus a value computable from the xpub (public key and chain code). Subtracting that value from the child gives the parent.
- **NUT-13 V3**: derives each key directly from the seed with HMAC-SHA256; there is no parent-child relation to exploit.
