# 47.04 · The verifier as a decision flowchart

Variation 4 of slide 47 (Script path verification) · lens: Explained via flowchart · deck `fcv-i-nutroot-spend` page 14 · 4 steps · script 139 words, about 60 s

## Script

Down means yes, right means no, unless marked. The first decision is whether the witness has a leaf field.

**[1]** No leaf: the key path. Exactly one signature, valid over the input digest for the secret's x-coordinate, or reject.

**[2]** With a leaf: the path must hold at most 3 sibling hashes, and K + t·G over the recomputed root must equal the secret. A no at either rejects.

**[3]** The leaf must parse: version 0x00, known type and fields. Next, whether the type is commit: the one decision where yes rejects, because commit has no satisfaction rule.

**[4]** Type conditions: after needs the verifier's clock at or past time; hashlock needs SHA-256 of the preimage, at most 32 bytes, to equal hash; threshold needs only signatures. Then no more signatures than listed keys, and at least n distinct listed keys signing. Accept.

## Background

- **Per-input verification**: the flowchart runs once per input. Key-path and script-path inputs mix freely in one transaction.
- **Commitment before parsing**: the leaf is interpreted only after it is proven to be in the tree committed in the secret.
- **Commit leaf**: binds 32 bytes of external data to the tree (for example a Nutzap event digest). It is not a spend path, and a witness revealing it is rejected.
- **x(secret)**: the secret's x-coordinate. BIP-340 verifies against x-only keys.
- **Distinct keys**: several signatures by one key count once toward n.
