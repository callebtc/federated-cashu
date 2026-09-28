# 10 · Threshold BLS compared with t-of-n secp multisig

1.1 BLS blind signatures · table, no steps · script 134 words, about 55 s

## Script

The alternative design keeps secp keys and puts the federation into the proof, as t-of-n multisig. Then each proof contains the secret, t signatures, the roster and the policy. The wallet checks t DLEQ proofs plus the policy. The keyset holds every member key plus the roster history. Every receiver must implement the federation format, and the signer set is visible.

Threshold BLS moves the threshold into issuance. The proof is the same as today: x and one C. Verification is one pairing, or one batch. The keyset has one aggregate key K per amount. Any v3 wallet verifies offline. Every subset of signers produces the same C, so the signer set is not visible.

Both keep blind issuance and t-of-n availability. Neither removes the need for consensus, replay protection, catch-up or payment observation.

## Background

- **Multisig (t-of-n)**: a scheme where t separate signatures from a list of n keys are required and all appear in the proof.
- **Aggregate key**: a single public key K that corresponds to the shared secret k of all members together. Nobody holds k itself.
- **Signer set not visible**: a threshold BLS signature is identical no matter which t members produced it (next section shows why).
- **FROST** (mentioned on the slide): Flexible Round-Optimized Schnorr Threshold signatures. t of n members jointly produce one ordinary Schnorr signature. Using it for the token secret itself would require a different token format; it is used later in this talk for the treasury.
