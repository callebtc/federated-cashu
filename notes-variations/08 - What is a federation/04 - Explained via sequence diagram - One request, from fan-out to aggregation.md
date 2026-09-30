# 08.04 · One request, from fan-out to aggregation

Variation 4 of slide 08 (What is a federation) · lens: Explained via sequence diagram · deck `fcv-a-bls` page 6 · 6 steps · script 114 words, about 50 s

## Script

One request, read top to bottom, from the wallet's side.

**[1]** The wallet sends the same request to the public URL of every member.

**[2]** Each member wraps the request in an envelope and submits it to consensus.

**[3]** AlephBFT produces one total order. All members see the same order, and the operation is accepted.

**[4]** Each member applies the accepted operation: it verifies the inputs and marks them spent.

**[5]** Members return shares C′ᵢ = kᵢ·B′. Shares from m1, m3 and m4 arrive. m2 and m5 are slow; the wallet does not wait for them.

**[6]** The wallet checks each share against that member's public share Kᵢ and interpolates as soon as it has t = 3 valid shares.

## Background

- **Envelope**: the request wrapped with the federation and the operation kind, for a swap {federation, kind: Swap, inputs, outputs}. Its hash is the operation ID. Same bytes, same ID; a different output set gives a different ID.
- **Total order**: every member processes the same operations in the same sequence, so every member computes the same state.
- **Apply**: the deterministic step that executes an ordered operation against the member's database: verify the input proofs, mark them spent, then sign the accepted outputs.
- **Share check**: the wallet verifies e(C′ᵢ, G₂) = e(B′, Kᵢ), with Kᵢ = kᵢ·G₂ from the public config. An invalid share is dropped and does not affect the result.
- **Interpolation**: combining t valid shares with Lagrange weights into k·B′, the same value a single mint with key k would return.
- **Why slow members do not matter**: any t valid shares give the same signature, so the wallet stops waiting after the t-th valid share.
