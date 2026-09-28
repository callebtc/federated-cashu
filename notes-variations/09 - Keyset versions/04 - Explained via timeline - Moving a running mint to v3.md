# 09.04 · Moving a running mint to v3

Variation 4 of slide 09 (Keyset versions) · lens: Explained via timeline · deck `fcv-a-bls` page 38 · 5 steps · script 100 words, about 45 s

## Script

**[1]** Running: an active secp256k1 keyset, v1 or v2. Wallets hold secp proofs.

**[2]** Upgrade: deploy a build with v3 support. The active keyset stays active; nothing rotates implicitly.

**[3]** Rotate: the operator runs rotate-next-keyset with --keyset-version v3, a cdk-mint-rpc command. It creates a v3 keyset for the unit and marks the old one inactive.

**[4]** Transition: new outputs come only from the active v3 keyset. Old secp proofs remain valid inputs, and wallets SHOULD swap them first. One swap may mix keyset versions.

**[5]** After: v3 proofs have point secrets, a witness on every input and no DLEQ. Only v3 keysets can be federated.

## Background

- **Keyset rotation**: the mint creates a new active keyset for a unit; the previous one becomes inactive. Inactive keysets still accept proofs as inputs but sign no new outputs (NUT-02).
- **cdk-mint-rpc**: the gRPC management interface and CLI for a CDK mint. `rotate-next-keyset` accepts `--keyset-version v1|v2|v3`, plus unit, amounts, fee and expiry.
- **Mixed swap (NUT-03)**: one swap may take secp inputs and produce v3 outputs. Each input is verified under the rules of its own keyset version.
- **Why wallets swap old proofs first**: NUT-02 asks wallets to prioritise swapping proofs from inactive keysets, so the old keyset leaves circulation.
- **Point secrets**: on v3 the secret is a 33-byte compressed secp256k1 public key. Spending requires a witness: a signature by that key, or a script-path witness for a condition leaf the key commits to.

## Speaker note

- Do not claim a default keyset version for new keysets: `FEDERATION_NOTES.md` says v3, while the code's `preferred_keyset_version` defaults to v2. The slide makes no default claim; keep it that way in Q&A.
