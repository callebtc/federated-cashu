# 10.06 · Verification needs k

Variation 6 of slide 10 (Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)) · lens: Framing: the constraint that forces the design · deck `fcv-a-bls` page 16 · 4 steps · script 128 words, about 55 s

## Script

**[1]** The NUT-00 check is k·hash_to_curve(x) = C. Only the holder of k can evaluate it.

**[2]** With one mint this works. The mint computes k·Y itself at redemption. A wallet checking a fresh signature needs a DLEQ proof from the mint, NUT-12. A receiver needs that DLEQ proof and the sender's blinding factor r.

**[3]** With k split into shares, t of n, every check changes. At redemption no member has k: t members compute kᵢ·Y and combine, for every input. A wallet needs one DLEQ per share and a trusted interpolation, or a threshold DLEQ, which Cashu does not specify. A receiver's DLEQ for the aggregate key needs k, which nobody holds.

**[4]** The requirement is a check that uses only public values. v3 uses e(C, G₂) = e(Y, K).

## Background

- **DLEQ proof (NUT-12)**: a short proof that the same k was used in K = k·G and C′ = k·B′, without revealing k. It lets a party without k check a signature.
- **Why the receiver needs r**: the DLEQ proof is about B′ and C′, which the receiver never saw. With r it recomputes B′ = Y + r·G and C′ = C + r·K, then checks the proof.
- **Threshold computation**: a result that needs cooperation of t key-share holders, each contributing kᵢ·Y, combined with Lagrange weights. It is interactive: members must be online and exchange messages for each check.
- **Pairing check e(C, G₂) = e(Y, K)**: on BLS12-381, a pairing compares two hidden multipliers using only public points. It needs K, not k, so any party can run it offline. The next slides explain it.

## Speaker note

- The deck note says a DLEQ protocol for shared keys "does not exist". Do not say that. The accurate statement, and what the slide says, is that it would be a new protocol: Cashu specifies no threshold DLEQ.
