# 39 · Taproot output keys (BIP341)

2.2 Taproot · 5 steps · script 116 words, about 50 s

## Script

**[1]** In BIP341 each leaf is a tapscript. Its leaf hash is a tagged hash over the leaf version 0xc0, the script length and the script.

**[2]** A branch hashes its two children in sorted order, with the TapBranch tag.

**[3]** The root therefore commits to every script in the tree.

**[4]** The internal key P is tweaked by t, a TapTweak hash over x(P) and the root. The output key is Q = P + t·G. The output itself contains only the 32-byte x-only key Q.

**[5]** The constructor chooses the shape. The likely script goes at depth 1 so its proof is shorter.

All three hashes are BIP340 tagged hashes: SHA-256 over the tag's hash twice, then the message.

## Background

- **Merkle tree**: leaves are hashed, then pairs of hashes are hashed together level by level until one root hash remains. Proving one leaf needs only the sibling hashes on its path.
- **Tapscript (BIP342)**: the script language for taproot leaves. The example scripts: `<A> OP_CHECKSIG` (signature by A); `<t> OP_CLTV OP_DROP <B> OP_CHECKSIG` (after time t, signature by B); `OP_SHA256 <h> OP_EQUALVERIFY <C> OP_CHECKSIG` (preimage of h, and signature by C).
- **compact_size**: Bitcoin's variable-length integer encoding, used for the script length.
- **x-only key, x(P)**: a public key given by its x-coordinate only (32 bytes); the y-coordinate is implied to be even.
- **Tweak**: adding t·G to a public key. The owner of p can sign for P + t·G with the private key p + t.
- **`OP_1 <x(Q)>`**: the segwit version 1 output script that holds the output key.
