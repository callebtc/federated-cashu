# 36.01 · One script, one output key: a worked example

Variation 1 of slide 36 (Three tags, one output key) · lens: Beginner · deck `fcv-g-json-taproot` page 19 · 5 steps · script 138 words, about 60 s

## Script

A taproot output built with toy keys. G is the curve's base point; a private key k has the public key k·G.

**[1]** The single script pushes the 32-byte x-coordinate of 2·G, then OP_CHECKSIG: it accepts a signature by the key whose secret is 2. 0x20 is the push length, 0xac is OP_CHECKSIG: 34 bytes.

**[2]** The leaf hash is a tagged hash over the leaf version c0, the length 0x22, and the script. With one leaf, this hash is the root.

**[3]** The internal key is P = 1·G. The tweak t is the TapTweak hash of x(P) and the root, read as a number.

**[4]** The output key is Q = P + t·G. Its y-coordinate is odd.

**[5]** The output script is OP_1 and the 32-byte x(Q). The key-path secret is 1 + t: the internal secret plus the tweak.

## Background

- **Scalar multiplication k·G**: adding the base point G to itself k times. Computing k·G is fast; recovering k from k·G is infeasible.
- **x-coordinate, x(P)**: BIP340 keys are the 32-byte x-coordinate of a point; the y-coordinate is taken to be even.
- **OP_CHECKSIG in tapscript**: pops a 32-byte key and a signature and checks a BIP340 signature.
- **Tagged hash**: SHA-256 prefixed with two copies of SHA-256 of a tag name, here `TapLeaf` and `TapTweak`, so hashes from different uses cannot coincide.
- **Leaf version 0xc0**: marks a BIP342 tapscript leaf.
- **Why the secret is 1 + t**: Q = 1·G + t·G = (1 + t)·G.
- **OP_1 (0x51)**: segwit version 1, followed by a 32-byte push (`0x20`) of x(Q).
- **Toy keys**: secrets 1 and 2 are public knowledge; they only make the arithmetic visible.

## Speaker note

- All values were computed for the slide (not from BIP341 vectors). Recomputed here: script, leaf hash, t, x(Q), odd y(Q) and q = 1 + t match.
- Because y(Q) is odd, BIP340 signing with q actually signs with n − q. The slide's "key-path secret q = 1 + t" is correct as the tweaked secret.
