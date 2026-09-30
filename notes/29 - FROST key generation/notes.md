# 29 · FROST key generation

1.5 Custody · 4 steps · script 125 words, about 55 s

## Script

The treasury key is generated the same way as the ecash keys, with lines and shares, but on secp256k1.

**[1]** Commit. Each member picks a random polynomial and publishes its coefficients as points, together with a proof that it knows its own secret constant.

**[2]** Share. Each member sends every other member its polynomial evaluated at that member's ID, privately. The receiver checks the value against the published points and adds up what it received: that sum is its FROST share.

**[3]** Confirm. Every member computes the group key P from the published points and confirms that all members got the same P.

**[4]** The result is one Bitcoin key. Any t members can produce a single BIP340 signature for it, and the private key is never assembled anywhere.

## Background

- **Proof of knowledge**: a Schnorr signature over the constant term's commitment. It prevents a member from choosing its contribution as a function of the others' keys (a rogue-key attack).
- **Same math as the BLS ceremony**: shares are sums of the members' polynomial values; the public key is the sum of the constant-term commitments. See the toy example on the DKG slide.
- **Library**: `frost-secp256k1-tr` 3.0.0 (Zcash Foundation), ciphersuite `secp256k1_sha256_tr_v1`, which produces taproot-compatible signatures. Its DKG has two rounds (commitments with proof, then private shares); CDK adds a confirmation round in which members confirm the resulting key.
- **Transport**: all rounds run on the private federation plane; each message is bound to the federation, ceremony, epoch, threshold, roster, sender and receiver. Shares are stored encrypted (AES-256-GCM).
