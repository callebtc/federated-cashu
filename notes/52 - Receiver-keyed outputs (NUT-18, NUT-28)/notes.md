# 52 · Receiver-keyed outputs (NUT-18, NUT-28)

2.4 Using nutroot · 5 steps · script 145 words, about 60 s

## Script

**[1]** The payee's NUT-18 request carries a nutroot option: k, its static public key; l, the requested leaves; b, the keys to blind.

**[2]** Per output, the payer draws a fresh ephemeral keypair e, E. For each key it blinds, it computes Zx = x(e·P) by ECDH with that key, and the slot's scalar rᵢ = SHA-256 over Cashu_P2BK_v1, Zx and the slot index i.

**[3]** Slot 0 blinds the internal key: K = k + r₀·G. Keys in b are blinded inside the leaves; the leaves of l are reproduced byte for byte, no more and no fewer. The secret is P = K + t·G.

**[4]** The payer swaps to P and sends the proof with spend info E, K and tree.

**[5]** The payee computes the same Zx as x(p·E), checks the tree equals l exactly, and sweeps by key path with p + r₀ + t.

## Background

- **NUT-18**: payment requests: a payee publishes what it wants to receive and how.
- **NUT-28, P2BK**: pay-to-blinded-key: the payer derives a fresh one-time key for the payee from the payee's static key.
- **ECDH**: Elliptic Curve Diffie–Hellman. The payer computes e·k (its ephemeral private key times the payee's public key); the payee computes p·E (its private key times the ephemeral public key). Both equal e·p·G, so both sides obtain the same Zx without sending it.
- **Why blind**: the mint and third parties cannot link the output to the payee's static key.
- **Slot**: index i of the blinding scalar; slot 0 is the internal key (the payee's static key), slots 1 onward the keys inside leaves, in transmitted order. Each slot uses the ECDH secret of its own key, Zx = x(e·P); the slot index makes every rᵢ different even for the same key.
- **0xff retry**: if a hash result is zero or not below the curve order, it is recomputed with an extra 0xff byte appended.
- **Vector on the slide**: with payee private key 3, (3 + r₀ + t) mod n = 31b2e906…78d008e7.
