# 49.01 · Who can sign for the internal key

Variation 1 of slide 49 (Three forms of internal key) · lens: Beginner · deck `fcv-i-nutroot-spend` page 19 · 3 steps · script 140 words, about 60 s

## Script

A private key is a number k; its public key is k·G, with G the generator point. Key N means k = N. K has three forms, by who knows k.

**[1]** One holder: K = k·G. With k = 7, K is 025cbdf0…. Without conditions the secret is K itself; the holder signs with k.

**[2]** Cosigners, MuSig2 or FROST: nobody holds k whole; they sign together. The secret gets the empty tweak, t a hash of K alone, which every cosigner can check. With key 3 as K, t ends in 08 and the key-path scalar 3 + t in 0b.

**[3]** Nobody: K = H + u·G, H a point made from a hash, with no known private key. With u = 7, K is 028edfeb…, and K − 7·G gives H. No key path: only a leaf can spend.

## Background

- **Generator G**: a fixed point of secp256k1. k·G is easy to compute; recovering k from k·G is infeasible.
- **MuSig2 (BIP327)**: n-of-n Schnorr multisignature. Several signers produce one BIP-340 signature for one aggregate key.
- **FROST**: threshold Schnorr signing (t-of-n). The group's private key exists only as shares.
- **Empty tweak**: t = tagged_hash("Cashu_NutrootTweak", K), with no root bytes. It lets every cosigner check that no script path is hidden in the secret.
- **3 + t**: the vector's tweak ends in byte 0x08; adding the scalar 3 gives 0x0b. The secret is 03b2bb25….
- **NUMS point H**: lift_x(SHA256(G uncompressed)), an x-coordinate taken from a hash. Finding its private key means solving a discrete logarithm.

## Speaker note

- The empty-tweak vector uses the single-party key 3 as a stand-in for an aggregate, so the key-path scalar can be printed. A real aggregate has no single holder of k.
