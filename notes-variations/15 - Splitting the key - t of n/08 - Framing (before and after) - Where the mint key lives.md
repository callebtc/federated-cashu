# 15.08 · Where the mint key lives

Variation 8 of slide 15 (Splitting the key - t of n) · lens: Framing: before and after · deck `fcv-b-threshold` page 18 · 4 steps · script 129 words, about 55 s

## Script

Where the mint key lives, before and after federation.

**[1]** A standalone v3 mint stores k on one host.

**[2]** The federation, here t = 3 and n = 5, stores the shares f(1) to f(5) on five hosts. With distributed key generation, k = f(0) is never computed and exists nowhere.

**[3]** Signing. Standalone: C′ = k·B′ on one host. Federation: t members return kᵢ·B′, and the wallet sums λᵢ·kᵢ·B′. Compromise. Standalone: one host gives full signing power. Federation: t − 1 hosts learn nothing about k; t hosts have full signing power. Availability. Standalone: host offline, no issuance. Federation: shares from any t members suffice, but ordering needs c = 4 of 5.

**[4]** Unchanged in both: the published K = k·G₂ per amount, the same v3 keyset, the same proofs.

## Background

- **DKG (distributed key generation)**: the members jointly create the shares, so each holds f(i) and nobody ever holds k (section 1.4).
- **λᵢ (Lagrange weights)**: numbers fixed by which members answered, with Σ λᵢ·kᵢ = k, so Σ λᵢ·kᵢ·B′ = k·B′.
- **Compromise threshold**: fewer than t shares give no information about k; t shares determine k.
- **c = 4 of 5**: the consensus threshold, c = n − ⌊(n − 1)/3⌋. Members sign only operations consensus has accepted, and acceptance needs c members.
- **K = k·G₂**: the aggregate public key per amount. It is computed from public data, so the federation publishes it without anyone knowing k.
