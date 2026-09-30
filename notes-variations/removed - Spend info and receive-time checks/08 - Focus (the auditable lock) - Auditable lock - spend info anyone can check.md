# removed.08 · Auditable lock: spend info anyone can check

Variation 8 of slide removed (Spend info and receive-time checks) · lens: Focus: the auditable lock · deck `fcv-i-nutroot-spend` page 34 · 4 steps · script 140 words, about 60 s

## Script

The lock's one leaf, 46 bytes: threshold, n = 1, the key P, here key 3, and disclosure mode 01.

**[1]** Spend info: K = 028edfeb…, u = 7, and a tree with that leaf. K − 7·G is 0250929b…, the NUMS point H, so no key path exists.

**[2]** With one leaf the root is its hash, b957f8b5…. The tweak is 6c3a09b1…, and K + t·G equals the secret, 02fc11bf…. The secret commits to exactly this leaf, so only P can spend.

**[3]** The disclosure is minimal. Knowing P, a holder rebuilds all spend info from u alone: K = H + u·G, and the one canonical leaf from P.

**[4]** On spend, the mint publishes through NUT-07 the 344-character witness, the input digest 1732e47d… and the commitment c682da9c…. The transaction digest stays private. Verifying the lock needs no keys and no mint.

## Background

- **Auditable lock**: a script-only lock any third party can verify: NUMS K with u disclosed, one threshold leaf, n = 1, keys = [P] (not blinded), with disclosure. Use case: a public tip such as a Nutzap.
- **NUMS check**: K − u·G = H proves K has no known private key, so the only spend path is the leaf.
- **Canonical leaf**: fields strictly ascend and integers are minimal, so a threshold leaf naming P has one serialization.
- **Disclosure 0x01**: makes a mint supporting NUT-07 or NUT-17 publish the exact witness and input digest of the spend.
- **Commitment**: tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash); the published witness and input digest open it.
- **Why the transaction digest stays private**: input_digest is a one-way hash of the transaction digest and the input id.

## Speaker note

- u = 7 is fixed for a stable vector; a real lock uses a fresh u per proof.
- 344 is the length of the vector's witness string, counted for the slide (I recomputed it).
- Status: auditable locks and NUT-07 commitments are specified in nuts#443 and not implemented in either federation branch.
