# 54.05 · Script-path checks: Bitcoin node and mint

Variation 5 of slide 54 (Nutroot compared with BIP341) · lens: Perspective: the verifier · deck `fcv-j-nutroot-use` page 24 · 6 steps · script 137 words, about 60 s

## Script

**[1]** The Bitcoin node needs a control block of 33 + 32m bytes, m up to 128. The mint rejects a path over 3 hashes.

**[2]** The node reads the leaf version from the control block and lifts P to even y. The mint needs neither: K has 33 bytes, the leaf starts with version 0x00.

**[3]** Both hash the leaf under their own tag and fold the path in sorted pairs.

**[4]** The node fails if t ≥ n and checks x(Q) and the parity bit. The mint reduces mod n and compares K + t·G with the secret.

**[5]** The node executes the script; unknown leaf versions and OP_SUCCESS succeed. The mint parses and evaluates; anything unknown fails closed.

**[6]** Time: CHECKLOCKTIMEVERIFY compares with the transaction's nLockTime; the mint uses its local clock. Signatures cover the input digest, not a sighash.

## Background

- **Control block**: c[0] holds the leaf version (c[0] & 0xfe) and the parity of Q (lowest bit); c[1:33] is x(P); then 32 bytes per path level.
- **lift_x**: turn an x-coordinate into the curve point with even y.
- **OP_SUCCESS**: reserved tapscript opcodes that make a script succeed at once; like unknown leaf versions, they keep room for future soft forks.
- **Fail closed**: an unknown leaf version, type or field makes the leaf unsatisfiable, never anyone-can-spend.
- **OP_CHECKLOCKTIMEVERIFY (BIP65)**: fails unless the spending transaction's nLockTime is at least the given value; consensus rules then enforce the lock time.
- **Local clock**: the mint's own time, checked against the after leaf's time.
- **Sighash vs input digest**: Bitcoin signatures commit to a hash of the transaction chosen by the sighash flag; a nutroot signature commits to the input digest of the TLV transcript.
