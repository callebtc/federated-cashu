# removed.05 · What the receiver needs to accept a token

Variation 5 of slide removed (Threshold BLS compared with t-of-n multisig) · lens: Perspective: receiver · deck `fcv-b-threshold` page 7 · 4 steps · script 135 words, about 60 s

## Script

The receiver's view. Alice sends Carol a proof. Left: secp multisig. Right: threshold BLS.

**[1]** What arrives. Multisig: the secret x, signatures C₁ to Cₜ, t DLEQ proofs, and the roster and policy. Threshold BLS: x and one C.

**[2]** What Carol must know in advance. Multisig: the member keys K₁ to Kₙ, the roster, the t-of-n policy and the proof format. Threshold BLS: the v3 keyset, one K per amount, as for a standalone mint.

**[3]** What Carol computes. Multisig: t DLEQ checks, then she counts the distinct listed keys against t. Threshold BLS: she hashes x to Y = H(x) and checks one pairing equation, e(C, G₂) = e(Y, K).

**[4]** Which software can do it. Multisig needs a wallet that implements the federation format. Threshold BLS: any v3 wallet, offline. Carol sees a standalone v3 proof.

## Background

- **Proof**: amount, keyset ID, secret x and signature C. Whoever holds it holds the value.
- **Y = H(x)**: hash-to-curve; maps the secret bytes deterministically to a point in G₁.
- **Pairing e(·,·)**: takes a G₁ point and a G₂ point; e(a·P, b·Q) = e(P, Q)^(a·b). For a correct C = k·Y: e(k·Y, G₂) = e(Y, k·G₂) = e(Y, K).
- **Counting distinct keys**: a multisig receiver must check that the t signatures come from t different listed keys; otherwise one member could count twice.
- **v3 keyset**: a BLS12-381 keyset, ID prefix 02, one 96-byte G₂ public key per amount.
- **Offline**: the check needs no contact with the mint, only the published keyset.
