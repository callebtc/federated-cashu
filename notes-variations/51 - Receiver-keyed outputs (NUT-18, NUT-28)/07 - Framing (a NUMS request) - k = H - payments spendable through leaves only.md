# 51.07 · k = H: payments spendable through leaves only

Variation 7 of slide 51 (Receiver-keyed outputs (NUT-18, NUT-28)) · lens: Framing: a NUMS request · deck `fcv-j-nutroot-use` page 9 · 4 steps · script 138 words, about 60 s

## Script

Three requests with one leaf, an after leaf for key 4; ephemeral key 5.

**[1]** k is key 3: K is key 3 blinded at slot 0, E blinds slots 0 and 1, and the payee holds the key path p + r₀ + t.

**[2]** k is the NUMS point H, key 4 in b: K = H + 7·G. E travels because it blinds key 4 at slot 1, as in column one. Spend info adds u; K − u·G = H: no key path.

**[3]** k = H without b: nothing is blinded, so E MUST be omitted; key 4 stays verbatim; u = 9.

**[4]** A NUMS key is never ECDH-blinded: nobody holds H's scalar. The fresh u makes each secret unique. E travels exactly when a blinding used e, and the payee rejects spend info that disagrees.

## Background

- **NUMS point H**: "nothing up my sleeve". H = lift_x(SHA-256 of G's 65-byte uncompressed encoding) = 0250929b…803ac0. Nobody knows its private key.
- **K = H + u·G**: an internal key whose private key nobody knows. u is fresh per output and disclosed in spend info, so the holder can check K − u·G = H.
- **Why no ECDH blinding**: the receiver's half of the ECDH needs H's private key. Nobody holds it, so a blinded NUMS key could not be verified.
- **E rule (NUT-18)**: E appears exactly when a blinding used its keypair: always for a receiver-keyed k, for a NUMS k only when b is non-empty. A payer must not send an unused ephemeral.
- **Script-only proof**: spendable only through its leaves; here only key 4 after the time.
- **Same blinded key in columns one and two**: r₁ depends on e, key 4 and index 1, not on k.

## Speaker note

- Column one's secret 0302fc15…572c566e is computed (marked on the slide); recomputed and correct. Columns two and three are the tests/18-tests.md NUMS vectors.
- u = 7 and u = 9 are fixed for stable vectors; a real payment uses a fresh random u.
