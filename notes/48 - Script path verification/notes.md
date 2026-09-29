# 48 · Script path verification

2.3 Nutroot secrets · 4 steps · script 142 words, about 60 s

## Script

The four verification steps from the spec, with the vector's values.

**[1]** Reject a path with more than three sibling hashes. Here there are two.

**[2]** Recompute the commitment: leaf hash 8f38…, with 23e8… the branch 8f58…, with 9ed9… the root 3d4f…. Then the tweak from K and the root. K + t·G must equal the secret, 022d….

**[3]** Parse the leaf: version 0x00, type 0x03 hashlock, fields n, keys and hash, all known and ascending. Anything unknown fails closed.

**[4]** Evaluate. SHA-256 of the preimage equals the hash, with the preimage at most 32 bytes. Then count distinct listed keys with a valid BIP-340 signature over the input digest: at least n, here one, and no more signatures than listed keys. A commit leaf always fails; an after leaf needs the clock at or past its time. Mints may reject witnesses longer than 4096 characters.

## Background

- **Why distinct keys, not signatures**: Schnorr signatures are randomized, so one key can produce many different valid signatures. Counting keys prevents one signer from counting several times.
- **Commitment check first**: the leaf is only trusted after it is proven to be part of the tree committed in the secret.
- **Local clock**: the mint's own time; "after" is checked against it.
