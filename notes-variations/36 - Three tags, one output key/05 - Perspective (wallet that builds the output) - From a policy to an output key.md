# 36.05 · From a policy to an output key

Variation 5 of slide 36 (Three tags, one output key) · lens: Perspective: wallet that builds the output · deck `fcv-g-json-taproot` page 23 · 5 steps · script 140 words, about 60 s

## Script

The wallet that builds the output starts from a policy.

**[1]** Three conditions, one per path: A and B together, the expected case; A alone after a timelock; B with the preimage of a hash h.

**[2]** BIP341: the most likely condition that is a single key after aggregation becomes the internal key. A and B aggregate with MuSig2 into P, so the cooperative case is a one-signature key path spend.

**[3]** Every other condition becomes a leaf script with fresh keys: a CHECKLOCKTIMEVERIFY script for A, a SHA-256 hash lock for B.

**[4]** The tree is shaped by likelihood; with two leaves, both sit at depth 1.

**[5]** P is tweaked by the root into Q; only x(Q) goes on chain. The wallet keeps P, both scripts and the parity of y(Q). Without an aggregate for the expected case, BIP341 suggests H + r·G.

## Background

- **MuSig2 (BIP327)**: a multi-party Schnorr protocol. Several keys aggregate into one public key, and the signers jointly produce one BIP340 signature that looks like a single-key signature.
- **OP_CHECKLOCKTIMEVERIFY (BIP65)**: fails unless the spending transaction's locktime is at least the given value. `OP_DROP` then removes that value from the stack.
- **`OP_SHA256 <h> OP_EQUALVERIFY`**: hashes the top stack item and fails unless it equals h, so the witness must contain the preimage.
- **Fresh keys**: BIP341 recommends never reusing keys across outputs and using distinct keys per leaf, so leaves cannot be linked or brute-forced.
- **What the wallet stores**: the internal key and the tree for the key-path tweak; the scripts, the sibling hash and the parity bit for a script-path control block.
- **NUMS internal key H + r·G**: a key nobody can sign for, with a fresh r so observers cannot tell that the key path is disabled.
