# removed.04 · One proof, from output to checkstate

Variation 4 of slide removed (JSON secrets and nutroot secrets) · lens: Explained via a proof's lifecycle · deck `fcv-j-nutroot-use` page 31 · 6 steps · script 140 words, about 60 s

## Script

**[1]** Create. JSON: the wallet writes the policy into the secret string and blinds it. Nutroot: derive K, compute K + t·G, blind the 33-byte point.

**[2]** Issue. Both: the mint signs a blinded output and learns nothing. The pre-v3 quote lock is optional; the v3 quote is a locked input signing its digest.

**[3]** Send. The JSON token shows the policy. The v3 token adds spend info: k or E, K, tree, u. Never a witness.

**[4]** Receive. JSON: parse kind, data and tags. v3: rebuild the secret from spend info, check it can be spent, then sweep.

**[5]** Spend. JSON: the mint parses the whole policy; signatures cover the secret string. v3: a key-path signature on the input digest, or one revealed leaf.

**[6]** Checkstate. JSON: the witness, when the condition requires one. v3: a commitment; witness and input digest only for disclosure leaves.

## Background

- **Blinding**: the wallet sends the mint a blinded form of the secret; the mint signs it without seeing the secret.
- **Quote lock (NUT-20, NUT-04)**: a key bound to a mint quote. Pre-v3 it is optional; on v3 the paid quote is a transaction input and must be locked.
- **Spend info fields**: k, bearer private key; E, ephemeral key for NUT-28; K, internal key; tree, the full leaves; u, the NUMS offset.
- **Sweep**: swap received proofs to secrets derived from the receiver's own seed.
- **Input digest**: the per-input message derived from the TLV transcript; each input signs its own.
- **Commitment (NUT-07)**: tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash), returned for spent v3 proofs.
