# removed.04 · Which rule applies to an input

Variation 4 of slide removed (Inputs sign, outputs never do) · lens: Explained via decision tree · deck `fcv-f-client-intent` page 32 · 4 steps · script 132 words, about 55 s

## Script

A decision tree for one input.

**[1]** The first question is the keyset version, never the secret's shape: version byte 02 or later means v3.

**[2]** No: pre-v3 rules. A random-string secret is a bearer proof with no witness. A JSON secret selects P2PK from NUT-11 or an HTLC from NUT-14, and these may opt into SIG_ALL, which requires every input to share kind, data and tags.

**[3]** Yes: v3. The secret is a 33-byte public key, and the witness selects the path. Without a leaf field it is the key path, one signature checked x-only. With a leaf it is the script path: leaf, control block and signatures.

**[4]** Both v3 paths sign the same message, this input's input digest. Each input takes its own branch, so pre-v3 and v3 inputs mix in one transaction.

## Background

- **Keyset version byte**: the first byte of the keyset ID. On a pre-v3 keyset a point-shaped string is just another random string.
- **P2PK (NUT-11)**: pay to public key; spending needs a signature by a named key.
- **HTLC (NUT-14)**: hashed timelock contract; spending needs a hash preimage, with a refund path after a locktime.
- **SIG_ALL**: the NUT-11 flag under which one signature, in the first input, covers all inputs and outputs.
- **Key path and script path**: the two v3 spend paths, as in taproot: a signature by the secret's own key, or revealing one committed condition leaf and satisfying it.

## Speaker note

- Specified in cashubtc/nuts#443; not implemented on the federation branches.
