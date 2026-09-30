# 41.07 · Alice pays Carol with a refund leaf

Variation 7 of slide 41 (Key path and script path) · lens: Worked example end to end · deck `fcv-i-nutroot-spend` page 9 · 5 steps · script 139 words, about 60 s

## Script

**[1]** Alice pays Carol, refundable to Alice. Carol's static key 3, blinded at NUT-28 slot 0, gives K, 03a3e12c…. One after leaf gives the root, its leaf hash 9ed9c0b8…. The tweak t is b3b7846b…, and the secret P is 02d310a4….

**[2]** Carol holds the key path from issue on. Her private key is p′ = (3 + r₀ + t) mod n, 31b2e906…. Her witness is one signature.

**[3]** Alice's route is the script path through the after leaf: key 4, time 1755561600. She sends the leaf, K, an empty path and a signature by key 4. Before that time, verifier step 4 rejects it on the mint's clock.

**[4]** From 2025-08-19 on, Alice's witness verifies. Both paths are then open.

**[5]** The first valid spend to reach the mint burns Y. A later spend of the same proof is refused as already spent.

## Background

- **r₀**: the NUT-28 slot-0 blinding scalar, SHA256("Cashu_P2BK_v1" ‖ Zx ‖ 0x00), where Zx is the ECDH x-coordinate shared by Alice's ephemeral key and Carol's static key. K = (3 + r₀)·G.
- **Refund leaf**: an after leaf naming the refund key. It becomes spendable when the verifier's clock is at or past its time.
- **Mint clock**: the mint evaluates `after` against its own local time.
- **Verifier step 4**: evaluation of the leaf condition, after the path length check, the commitment check and parsing.
- **Burning Y**: the mint records Y = hash_to_curve(secret) of every spent proof and refuses a second spend with the same Y.

## Speaker note

- The signatures are the vector's and sign an illustrative digest. In a real refund, Alice signs the input digest of her own refund transaction.
