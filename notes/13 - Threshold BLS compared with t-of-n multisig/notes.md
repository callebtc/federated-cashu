# 13 · Threshold BLS compared with t-of-n multisig

1.1 BLS blind signatures · table, no steps · script 99 words, about 40 s

## Script

The alternative is to keep secp256k1 keys and put the federation into the proof, as t-of-n multisig. Each proof then carries t signatures and the roster. The wallet checks t DLEQ proofs, and anyone can see which members signed.

Threshold BLS moves the threshold into issuance instead. The proof is one signature, exactly as today, checked with one pairing. Every set of t signers produces the same signature, so the signer set is not visible.

Both designs still need consensus among the members. Threshold BLS keeps today's proof format, so any v3 wallet can verify a federation's tokens offline.

## Background

- **Multisig (t-of-n)**: t separate signatures from a list of n keys are required, and all of them appear in the proof.
- **Aggregate key**: one public key K for the shared secret of all members together. Nobody holds the private key.
- **Signer set not visible**: a threshold BLS signature is identical no matter which t members produced it.
