# 51 · Three forms of internal key

Original slide, deck `fcv-i-nutroot-spend` page 18 (main deck slide 51). Same text as `notes/51 - Three forms of internal key/notes.md`.

2.3 Nutroot secrets · 3 steps · script 140 words, about 60 s

## Script

**[1]** Single-party: K = k·G. The holder can spend by key path. Without conditions the secret is K itself, untweaked. In the vector, k = 7.

**[2]** Aggregated, with MuSig2 or FROST: nobody holds k alone. The secret must carry at least the empty tweak, a tagged hash of K alone, so cosigners can verify that no script path is hidden in the key.

**[3]** NUMS offset, for script-only proofs: K = H + u·G. H is lift_x of the SHA-256 of the uncompressed generator, so nobody knows its discrete log. u is fresh per proof and disclosed in spend info. Holders check K − u·G = H, which proves no key path exists.

Secrets must be unique: keys come from the seed, a blinded static key, a random keypair, or a fresh NUMS offset. v3 key derivations are hardened at every step.

## Background

- **MuSig2 (BIP327)**: n-of-n Schnorr multisignature; several signers produce one signature for one aggregate key.
- **Hidden script path**: a cosigner who contributes to an aggregate key could secretly add a tweak with a script tree. Requiring the empty tweak lets everyone check the final key has none.
- **Why a fresh u**: with a shared H, all script-only proofs would have the same internal key and be linkable. A fresh u makes every K different, and the discrete log of K is still unknown.
- **Hardened derivation**: child keys derived with the parent private key. With non-hardened derivation, one child private key plus the parent extended public key (xpub) reveals the parent private key and every sibling key. Tokens carry private keys to other people, so this matters here.
- **Not ECDH-blinded**: NUT-28 blinding needs the receiver's private key for the Diffie–Hellman step; nobody holds H's private key, so a NUMS key is never blinded that way (next section).
