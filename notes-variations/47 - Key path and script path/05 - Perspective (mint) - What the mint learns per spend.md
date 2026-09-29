# 47.05 · What the mint learns per spend

Variation 5 of slide 47 (Key path and script path) · lens: Perspective: mint · deck `fcv-i-nutroot-spend` page 7 · 4 steps · script 139 words, about 60 s

## Script

**[1]** A key-path spend of a bare K: the mint receives one signature and learns only that it is valid for the secret's x-coordinate. Checkstate later returns SPENT and a commitment.

**[2]** A key-path spend of a tweaked P: the same bytes. The mint learns the same, not even whether conditions exist.

**[3]** A script path sends leaf, K, path, signatures, and a preimage for a hashlock. The mint learns that conditions exist, the leaf and K; siblings stay hashes. Checkstate still returns only the commitment. The NUT-07 key-path vector shows witness and input digest as null.

**[4]** Disclosure 0x01 changes that: a mint supporting NUT-07 or NUT-17 must publish the exact witness and input digest. The commitment is a tagged hash over Y, input digest and witness hash. The transaction digest is never returned. A revealed K links every proof sharing it.

## Background

- **Checkstate (NUT-07)**: the endpoint where wallets ask whether proofs are spent. For spent v3 proofs it returns a commitment.
- **Spend commitment**: tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash), with witness_hash = SHA256 of the exact witness string. The spender can open it to any holder of the proof by revealing witness and input digest.
- **Why the transaction digest stays private**: input_digest is a one-way hash of the transaction digest and the input id. Publishing it does not reveal the digest that would link the other inputs of the transaction.
- **Disclosure**: an optional leaf field (type 0x0a, mode 0x01). It does not change satisfaction, only publication.
- **NUT-17**: WebSocket subscriptions for proof state updates.
- **The two vectors**: 80ef4c34… is the NUT-07 commitment for the bearer swap input spent by key path; c682da9c… is the auditable lock spent through its disclosure leaf, with input digest 1732e47d….

## Speaker note

- The slide says "the mint must publish the witness". NUT-10 states the obligation for "a mint supporting NUT-07 or NUT-17"; the script says so.
- Status: nutroot, per-input signing and spend commitments are specified in nuts#443. Neither federation branch implements them (no Cashu_NutrootTweak, Cashu_TransactionInput or Cashu_SpendCommitment in bls-federation or bls-federation-bdk-frost).
