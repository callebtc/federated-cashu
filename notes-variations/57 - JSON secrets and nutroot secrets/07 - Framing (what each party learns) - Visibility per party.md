# 57.07 · Visibility per party

Variation 7 of slide 57 (JSON secrets and nutroot secrets) · lens: Framing: what each party learns · deck `fcv-j-nutroot-use` page 34 · 6 steps · script 139 words, about 60 s

## Script

**[1]** The mint at issuance: in both cases a blinded output, nothing more.

**[2]** An ordinary spend. JSON: the full policy, kind, keys and tags. Nutroot: a 33-byte key and one signature; the mint cannot even tell whether conditions exist.

**[3]** A conditional spend. JSON: the full policy again. Nutroot: one leaf, K and the sibling hashes; the other leaves stay hashes.

**[4]** Across spends. JSON: the same data key links spends, unless it is blinded with NUT-28. Nutroot: key-path spends show no static key, but a K shared and revealed by script paths links the proofs.

**[5]** Anyone holding Y, through checkstate. JSON: the witness, when the condition requires one. Nutroot: a commitment; witness and input digest only for disclosure leaves.

**[6]** The receiver. JSON: reads the policy from the secret. Nutroot: needs spend info; a tree that computes the secret is provably complete.

## Background

- **Blinded output**: the mint signs a blinded message and cannot see the secret until it is spent.
- **Key-path spend**: one signature by the secret's key; byte-identical for a bare key and a key with conditions.
- **Sibling hashes**: the merkle path; they prove the revealed leaf is in the tree without revealing the others.
- **NUT-28 blinding**: derives a fresh key per payment from a static key, so the mint cannot link spends to one person.
- **Shared K**: NUT-10 recommends a fresh K per proof; a repeated K revealed in script-path spends links those proofs.
- **Y and checkstate (NUT-07)**: anyone holding a proof can compute Y and query its state.
- **Commitment**: tagged_hash("Cashu_SpendCommitment", Y ‖ input_digest ‖ witness_hash); only the spender can open it, unless the leaf has disclosure.
