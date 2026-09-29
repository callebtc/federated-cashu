# 54.03 · Secret size and what a spend reveals

Variation 3 of slide 54 (JSON secrets and nutroot secrets) · lens: Graphical · deck `fcv-j-nutroot-use` page 30 · 4 steps · script 102 words, about 45 s

## Script

Bars at 4 pixels per byte: gray for JSON secrets on v1 and v2, clay for nutroot on v3.

**[1]** JSON secret sizes: 195 bytes for P2PK, 276 for the refund, 323 for the HTLC. The secret grows with the policy.

**[2]** The v3 secret in each case: 33 bytes.

**[3]** Policy revealed at spend, for the refund example: the JSON secret shows all 276 bytes, on any spend.

**[4]** On v3, Carol spends by key path, a signature by the secret's own key. It reveals nothing of the policy; that bar is empty. Alice's refund reveals the 49-byte after leaf, plus K and her signature.

## Background

- **195 B P2PK and 323 B HTLC**: the main deck's example secrets (slides 39 and 40); the P2PK one carries a sigflag tag.
- **276 B refund**: P2PK with a 64-character nonce, Carol's key as data, and locktime and refund tags, compact JSON.
- **33 bytes**: a compressed secp256k1 public key, whatever the conditions.
- **Key path**: spending with the secret's own private key; the witness is one signature and nothing about the tree.
- **Script path**: the witness reveals the exercised leaf, the internal key K, the merkle path (empty for one leaf) and signatures.

## Speaker note

- 276 B is computed (compact JSON, 64-character nonce); recomputed and correct. 195 and 323 are the main deck's own examples.
