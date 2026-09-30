# 44.01 · One secret, two ways to spend it

Variation 1 of slide 44 (Key path and script path) · lens: Beginner · deck `fcv-i-nutroot-spend` page 3 · 4 steps · script 139 words, about 60 s

## Script

**[1]** A v3 secret is one 33-byte public key, P = K + t·G. K is the internal public key, k its private key, G the generator point, n the curve order. The tweak t is a hash of K and the conditions, read as a number. The one condition: from 2025-08-19, key 4 may sign.

**[2]** Key path: Carol holds k, so she computes P's private key, p′ = (k + t) mod n, and signs the input digest once. The mint checks that signature against P. The condition is never shown.

**[3]** Script path: Alice holds key 4, not k. She reveals the leaf, K, an empty path because the tree has one leaf, and her signature.

**[4]** The mint rebuilds P from the leaf and K. If K + t·G equals P, it checks its clock and key 4's signature.

## Background

- **Private and public key**: a private key is a number k; its public key is the curve point k·G. Whoever knows k can sign for k·G.
- **Tweak t**: t = tagged_hash("Cashu_NutrootTweak", K ‖ merkle_root) mod n. Changing any condition changes the root, so t and P change.
- **p′ = (k + t) mod n**: P = K + t·G = (k + t)·G, so k + t is the private key of P. Only the holder of k, who also knows the tree, can compute it.
- **Input digest**: the message each v3 input signs, derived from the transaction transcript (NUT-10). It differs per input and per transaction.
- **After leaf**: a condition satisfied when the verifier's clock is at or past `time` and n listed keys sign. Here n = 1, key 4, time 1755561600 (2025-08-19 00:00 UTC).
- **Path**: the sibling hashes needed to recompute the root from the leaf hash. In a one-leaf tree the root is the leaf hash, so the path is empty.
- **The example's keys**: Carol's static key is key 3 (private scalar 3). K is that key blinded at NUT-28 slot 0, K = (3 + r₀)·G = 03a3e12c…. Alice's refund key is key 4.

## Speaker note

- The values are the NUT-10 worked example. Its signatures sign an illustrative digest, SHA256("illustrative transaction transcript"), not a real input digest.
- "Checks the signature against P" means against the x-coordinate of P (BIP-340 x-only verification).
