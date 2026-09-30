# 12.02 · v3 blind signatures: rules and failure modes

Variation 2 of slide 12 (Blind BLS signatures on BLS12-381 (keyset v3)) · lens: Advanced · deck `fcv-a-bls` page 20 · 6 steps · script 136 words, about 60 s

## Script

**[1]** All points MUST be canonical, on the curve and in the prime-order subgroup. Otherwise a small-order component h in B′ makes C′ reveal k mod h: the Lim–Lee small-subgroup attack.

**[2]** The identity point is never valid: with K = O, C = O verifies for every secret.

**[3]** r is a random non-zero scalar, rejection-sampled by seeded wallets under NUT-13. r = 0 gives B′ = O; reducing 32 random bytes would bias r.

**[4]** x is the decoded 33 bytes of a compressed secp256k1 key. Every v3 input carries a witness checked against that key; a non-point secret has no key.

**[5]** hash_to_curve_G1 is the RFC 9380 suite with the Cashu DST. If hashes had known discrete logs, one signature would give k·G₁, and from it other signatures.

**[6]** No dleq field on v3: NUT-12 is a secp256k1 construction.

## Background

- **Canonical compressed encoding**: exactly one valid byte string per point: the x-coordinate plus flag bits. Non-canonical variants must be rejected so that one point has one encoding.
- **Prime-order subgroup and cofactor**: the BLS12-381 curves contain more points than the prime-order groups G₁ and G₂. Points outside them have components of small order.
- **Small-subgroup attack (Lim–Lee)**: if the mint multiplies an attacker's point with a small-order component by k, the result reveals k modulo that small order. Repeating with different small orders recovers k piece by piece. NUT-00 cites it.
- **Identity point O**: the neutral element, P + O = P. k·O = O for every k, and e(P, O) = 1.
- **Rejection sampling**: take a hash as a number; if it is zero or not below the group order, discard it and try again. The order is about 0.45·2²⁵⁶, so reducing a 256-bit value modulo it would make some scalars more likely than others.
- **RFC 9380 hash-to-curve**: the IETF standard for mapping bytes to curve points (suite BLS12381G1_XMD:SHA-256_SSWU_RO_). Nobody knows h with H(x) = h·G₁.
- **Known discrete log**: if H(x) = h·G₁ with h known, then h⁻¹·C = k·G₁, and k·H(x′) = h′·(k·G₁) for any other message.
- **Parsing in CDK**: `crates/cashu/src/nuts/nut01/bls.rs` uses `from_compressed`, which checks encoding, curve and subgroup, then rejects the identity explicitly.

## Speaker note

- Row 5 on the slide says one signature gives "every other signature". That holds only for a hash whose outputs all have known discrete logs; the script says "other signatures" to keep it conditional.
- Row 4 on the slide also says "Mints MUST reject any other secret form" (NUT-00, Secret bytes); the script omits it for time.
