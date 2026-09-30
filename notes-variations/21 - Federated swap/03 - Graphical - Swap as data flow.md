# 21.03 · Swap as data flow

Variation 3 of slide 21 (Federated swap) · lens: Graphical · deck `fcv-c-ordering` page 29 · 5 steps · script 113 words, about 50 s

## Script

The swap as data flow. The wallet holds P1 and P2 and has blinded two outputs, A and B.

**[1]** The wallet sends the same swap to all three members.

**[2]** The envelope goes into AlephBFT and comes out ordered as entry 41.

**[3]** Entry 41 returns to every member. Each applies it and marks P1 and P2 spent.

**[4]** Each member sends its signature shares for A and B to the wallet.

**[5]** The wallet aggregates. For each output, C = r⁻¹ · Σ λᵢ·C′ᵢ. C′ᵢ is member i's share, λᵢ its Lagrange weight, and r⁻¹ the inverse of the blinding factor, which unblinds the result. Two of three shares suffice. A and B are now proofs.

## Background

- **AlephBFT**: the consensus library; it turns submitted envelopes into one ordered log shared by all members.
- **Entry 41**: the swap's position in that log.
- **C′ᵢ = kᵢ·B′**: member i's share, its key share times the blinded output.
- **Σ λᵢ·C′ᵢ**: the Lagrange-weighted sum of t shares, equal to k·B′, the blinded signature under the aggregate key.
- **r⁻¹**: the wallet blinded with factor r; multiplying by r⁻¹ gives C, the signature on the unblinded message.
- **t = 2 of 3**: any two members' shares are enough; the third may be offline.
