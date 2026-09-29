# 54.06 · The constraint behind each difference

Variation 6 of slide 54 (Nutroot compared with BIP341) · lens: Framing: constraints · deck `fcv-j-nutroot-use` page 25 · 7 steps · script 140 words, about 60 s

## Script

**[1]** 33-byte keys: Y hashes the 33-byte encoding, so 02‖x and 03‖x are two secrets; script paths bind the exact compressed secret.

**[2]** Fixed sorted fold: a payer rebuilds a requested tree from its leaves alone; the root commits the leaf set, not the order.

**[3]** Declarative leaves that fail closed: a v3 keyset implies full support, and an unknown leaf type disables only that path.

**[4]** Every spend path names a key: a keyless path could be replayed by anyone who sees its witness.

**[5]** NUMS offset, u disclosed: a holder verifies K − u·G = H; a fresh u makes each secret unique.

**[6]** Input digest as message: a witness authorizes nothing outside its transaction; a published one verifies without the transaction digest.

**[7]** 8 leaves and 512-byte bodies cap a tree at 120 leaf keys, inside the 255 leaf-key slots of NUT-28's one-byte index.

## Background

- **Y**: the hash-to-curve image of the secret; the mint's spent-state entry. Different bytes give a different Y.
- **Leaf set, not order**: the fold sorts hashes, so any transmitted order of the same leaves gives the same root.
- **Full support**: a mint advertising a v3 keyset must implement all of nutroot; there is no per-feature signaling that could leave a proof unchecked.
- **Replay**: a witness becomes visible to the mint and, with disclosure, to everyone; a path satisfiable without a signature could be reused by any observer.
- **One-way digest**: input_digest = tagged_hash("Cashu_TransactionInput", transaction_digest ‖ input_id); publishing it does not reveal the transaction digest that links the other inputs.
- **120 leaf keys**: a 512-byte body holds at most 15 keys (type byte, 4-byte n record, 3-byte keys header, 15 × 33 bytes = 503); 8 leaves × 15 = 120.

## Speaker note

- Rows 1 and 2 pair a difference with statements the spec makes elsewhere (NUT-10 key-uniqueness note; NUT-10 "the fold is normative" and "the root commits the leaf set"; NUT-18 payer computes the root from l). The spec does not phrase them as the motivation. The other rows are stated as reasons in NUT-10.
