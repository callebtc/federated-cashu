# 54.01 · Paying to a static key, with small numbers

Variation 1 of slide 54 (Receiver-keyed outputs (NUT-18, NUT-28)) · lens: Beginner · deck `fcv-j-nutroot-use` page 3 · 5 steps · script 139 words, about 60 s

## Script

G is the generator; a·G is G added a times.

**[1]** The payee's private key p is 3. Her public key P = 3·G goes into the payment request as k.

**[2]** The payer picks a fresh ephemeral key e = 5 and sends E = 5·G with the proof. The payer computes e·P = 15·G, the payee p·E = 15·G. This is ECDH: both reach the same point, and computing it needs private key 3 or 5.

**[3]** SHA-256 over the tag Cashu_P2BK_v1, the x-coordinate of 15·G and slot index 0 gives the blinding scalar r₀.

**[4]** The payer adds r₀·G to the payee's key. The result, K, is the internal key; without conditions, K is the secret.

**[5]** The private key of K is 3 + r₀, and only the payee can compute it. The mint sees K, never 3·G or r₀.

## Background

- **ECDH (Elliptic Curve Diffie–Hellman)**: each side multiplies its own private key with the other side's public key: 5·(3·G) = 3·(5·G) = 15·G. Someone who sees only 3·G and 5·G cannot compute 15·G. Only the x-coordinate of the shared point, Zx, is used.
- **Ephemeral keypair e, E**: a one-time keypair the payer creates per output. E travels to the payee in the proof's spend info; e is discarded.
- **Blinding scalar r₀**: r₀ = SHA-256("Cashu_P2BK_v1" ‖ x(15·G) ‖ 0x00) = 7dfb649b…ea066181, the value in the NUT-28 slot-map vector and the NUT-10 worked example. The last byte is the slot index; slot 0 is the internal key.
- **Why 3 + r₀ is the private key**: K = 3·G + r₀·G = (3 + r₀)·G. The payer knows r₀ but not 3; the mint knows neither.
- **Why blind**: every payment arrives at a fresh K, so the mint cannot link it to the payee's published key 3·G.
- **Test keys**: "key N" is the private scalar N. Real private keys are random 32-byte numbers, and sums are taken mod n, the curve order. K = 03a3e12c…3a419e51 is the vectors' internal key; with spend info E alone it is the secret of the V4 token vector "receiver-keyed, no conditions".
