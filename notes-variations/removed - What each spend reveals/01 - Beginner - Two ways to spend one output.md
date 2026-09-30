# removed.01 · Two ways to spend one output

Variation 1 of slide removed (What each spend reveals) · lens: Beginner · deck `fcv-g-json-taproot` page 27 · 4 steps · script 140 words, about 60 s

## Script

**[1]** The toy output from the previous group: OP_1 and the 32-byte x(Q). Q is the internal key P, secret 1, tweaked by one script that checks a signature by the key with secret 2.

**[2]** Key path: the witness is one 64-byte signature made with the tweaked secret q = 1 + t. Nothing about the script is revealed.

**[3]** Script path: the witness holds the script's input, a 64-byte signature by key 2; the 34-byte script; and a 33-byte control block. Its first byte is c1: leaf version c0 plus 1, because y(Q) is odd. The next 32 bytes are x(P), the x-coordinate of G. One leaf means no path hashes.

**[4]** The verifier hashes the script into the leaf hash, which is the root, tweaks x(P) with it, and compares with x(Q) and the parity bit. Then it runs the script.

## Background

- **Witness**: the data a spending transaction supplies for an input. For taproot it is a list of byte strings.
- **Key path**: a single signature for Q. The tree stays hidden.
- **Script path**: the script's inputs, the script, and the control block that proves Q commits to the script.
- **Control block**: byte 0 = leaf version plus the parity of y(Q); bytes 1–32 = x(P); then one 32-byte hash per tree level (none here).
- **Parity bit**: tells the verifier whether Q has even or odd y, so it can check the full point, not just x(Q).
- **`79be667e…16f81798`**: the x-coordinate of G, the internal key with secret 1.

## Speaker note

- Since y(Q) is odd, BIP340 signs with n − q rather than q = 1 + t. The slide's "secret q = 1 + t" names the tweaked secret; the negation happens inside BIP340 signing.
