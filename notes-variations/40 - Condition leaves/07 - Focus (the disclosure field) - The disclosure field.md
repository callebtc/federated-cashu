# 40.07 · The disclosure field

Variation 7 of slide 40 (Condition leaves) · lens: Focus: the disclosure field · deck `fcv-h-nutroot-tree` page 25 · 5 steps · script 138 words, about 60 s

## Script

**[1]** disclosure is field 0x0a. It is optional; when present it must be mode 0x01, encoded 0a000101. On threshold_1of1_key3 it gives 46 bytes.

**[2]** It is part of the leaf bytes, so it changes the leaf hash, from 23e8ff16… to b957f8b5…, and with it the secret.

**[3]** Satisfaction is unchanged. When the leaf is exercised, a mint that supports NUT-07 or NUT-17 must publish the exact witness and the input digest.

**[4]** The key path avoids it: one signature by p′, no leaf, nothing published. A protocol relying on publication must check from spend info that no path avoids it. A NUMS internal key, K = H + u·G with u in spend info, removes the key path.

**[5]** Together this is the auditable lock, a vector: K = H + 7·G, 028edfeb…, one threshold leaf for key 3 with disclosure, secret 02fc11bf….

## Background

- **NUT-07**: token state check, where anyone holding a proof asks the mint whether it is spent. **NUT-17**: WebSocket subscriptions to the same state.
- **Exact witness and input digest**: the published data lets anyone holding the proof verify key 3's signature. The input digest is a one-way derivation, so it does not reveal the transaction digest that would link the spend to the rest of the transaction.
- **p′**: the key-path private key (k + t) mod n.
- **NUMS internal key**: K = H + u·G, where nobody knows the private key of H. With u disclosed, anyone checks K − u·G = H and knows no key path exists.
- **Auditable lock**: NUMS internal key with u disclosed, exactly one threshold leaf, n = 1, one unblinded key, with disclosure. Anyone can verify from spend info that only that key can spend, and that the spend will be published.

## Speaker note

- The input digest and transcript signing are specified in nuts#443; neither federation branch implements them yet.
