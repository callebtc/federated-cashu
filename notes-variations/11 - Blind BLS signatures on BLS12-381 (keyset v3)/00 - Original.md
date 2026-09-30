# 11 · Blind BLS signatures on BLS12-381 (keyset v3)

Original slide, deck `fcv-a-bls` page 18 (main deck slide 11). Same text as `notes/11 - Blind BLS signatures on BLS12-381 (keyset v3)/notes.md`.

1.1 BLS blind signatures · 6 steps · script 127 words, about 55 s

## Script

**[1]** Same protocol shape on a different curve, BLS12-381. The wallet hashes x to a point Y in the group G₁, using standard hash-to-curve with a Cashu-specific domain separation tag.

**[2]** Blinding is now multiplicative: B′ = r·Y.

**[3]** The wallet sends B′. **[4]** The mint multiplies by k, as before.

**[5]** Before unblinding, the wallet checks the blind signature with a pairing: e(C′, G₂) must equal e(B′, K). Only the public key K is needed.

**[6]** The wallet unblinds by multiplying with r⁻¹, the inverse of r, and gets C = k·Y. Anyone who knows K can verify C with one pairing equation: no private key, no DLEQ proof. Sizes: messages and signatures are 48-byte G₁ points; public keys are 96-byte G₂ points. A DLEQ proof on a v3 keyset is rejected.

## Background

- **The envelope icons (for a non-technical audience)**: blinding is putting a paper in an envelope; the mint signs the envelope from the outside without seeing the paper; unblinding is taking the paper out, and the signature is on it. This is the classic picture from Chaum's original description of blind signatures.
- **BLS12-381**: a "pairing-friendly" elliptic curve, also used in Ethereum's consensus layer and Zcash. It comes with two groups of points, G₁ (48 bytes per compressed point) and G₂ (96 bytes). "BLS" in the curve name refers to Barreto–Lynn–Scott; the signature scheme "BLS" refers to Boneh–Lynn–Shacham. A BLS signature on a message is k·H(message).
- **Pairing e(·,·)**: a function that takes one point from G₁ and one from G₂ and returns an element of a third group. Its key property: e(a·P, b·Q) = e(P, Q)^(a·b). This lets anyone check that two hidden multipliers match, using only public points.
- **Why the checks work**: see the next slide.
- **Multiplicative blinding**: the blinding factor multiplies the point instead of being added. It is removed by multiplying with r⁻¹, the number that gives 1 when multiplied by r (modulo the group order).
- **𝔽ᵣ\***: the non-zero integers modulo the group order r. The blinding factor is drawn from this set.
- **Domain separation tag (DST)**: a fixed string mixed into the hash, `CASHU_BLS12_381_G1_XMD:SHA-256_SSWU_RO_`. Hashes computed for this purpose can then never coincide with hashes computed for another protocol.
