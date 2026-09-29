# 04.03 · Two planes

Variation 3 of slide 04 (What is a federation) · lens: Graphical · deck `fcv-a-bls` page 5 · 6 steps · script 117 words, about 50 s

## Script

**[1]** Five members on the private plane. Every pair is connected: members exchange consensus messages over this mesh.

**[2]** The wallet is on the public plane. It sends the same request to the public URL of every member.

**[3]** Members exchange messages among themselves. AlephBFT turns the submitted requests into one order, shown as the log on the right.

**[4]** The request becomes one entry in that order, here a swap.

**[5]** After applying the entry, members return signature shares. Shares from m1, m3 and m4 reach the wallet. t = 3 is enough.

**[6]** The wallet combines them: C′ = Σ λᵢ·C′ᵢ, where λᵢ are Lagrange weights for the three responding members. The members never exchange shares. The wallet is the aggregator.

## Background

- **Public plane**: each member's `public_mint_url`, the ordinary Cashu HTTP API that wallets call.
- **Private plane**: each member's `federation_api_url`, used only between members for envelopes, AlephBFT messages and catch-up. Messages are authenticated with each member's secp256k1 identity key.
- **AlephBFT**: a Rust library implementing asynchronous Byzantine fault-tolerant consensus. Every honest member outputs the same ordered list of items.
- **Signature share C′ᵢ = kᵢ·B′**: one member's partial blind signature. Alone it is not a valid signature.
- **Lagrange weights λᵢ**: numbers that recombine shares of a polynomial at x = 0. For signers S, λᵢ = Π over j in S, j ≠ i, of xⱼ/(xⱼ − xᵢ). Example S = {1, 3, 4}: λ₁ = 12/6 = 2, λ₃ = 4/(−2) = −2, λ₄ = 3/3 = 1. Then 2·k₁ − 2·k₃ + 1·k₄ = k, so Σ λᵢ·C′ᵢ = k·B′. The arithmetic is done modulo the group order.
- **Aggregator**: the party that collects and combines shares. Here it is the wallet.
