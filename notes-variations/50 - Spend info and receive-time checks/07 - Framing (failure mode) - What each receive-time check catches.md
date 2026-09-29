# 50.07 · What each receive-time check catches

Variation 7 of slide 50 (Spend info and receive-time checks) · lens: Framing: failure mode · deck `fcv-i-nutroot-spend` page 33 · 4 steps · script 135 words, about 60 s

## Script

**[1]** A tree with one leaf left out, for example a hidden refund: another root, so K + t·G misses the secret, and check 1 rejects. A disclosed K that differs from the key derived from E: the derived key is authoritative, and check 1 rejects.

**[2]** A tree without a key source, or k together with E: no valid shape. A leaf of unknown version or type, or with an unknown field: every leaf must parse. Both reject.

**[3]** An aggregated K the wallet does not cosign fails check 2 and is not received value. A refund leaf that opens too soon fails the acceptance policy.

**[4]** One case passes both checks: a bearer k that is really p′ of a tweaked tree, because p′ and a bare k verify identically. Only the sweep removes that hidden path.

## Background

- **Provably complete**: the secret commits to the root and the root to every leaf, so a disclosure that computes the secret leaves no room for a hidden leaf.
- **Hidden refund**: a leaf that would let the sender reclaim the proof. Leaving it out of the disclosed tree changes the root, so check 1 catches it.
- **Why a bearer k can hide a tree**: p′ = k₀ + t is an ordinary scalar; p′·G equals the tweaked secret, exactly as a bare key would.
- **Acceptance policy**: the receiver's rules for disclosed leaves, for example a minimum refund horizon.
- **Swapping at once**: a wallet that swaps immediately enforces check 2 implicitly, because the swap fails if it cannot spend.
