# 11.05 · What a receiver checks, offline

Variation 5 of slide 11 (Blind BLS signatures on BLS12-381 (keyset v3)) · lens: Perspective: receiver · deck `fcv-a-bls` page 23 · 5 steps · script 128 words, about 55 s

## Script

**[1]** A token carries one pair (x, C) per proof, here amounts 8, 2 and 2. No blinding factor, no DLEQ proof.

**[2]** The receiver fetches the keyset's public keys once, with GET /v1/keys/{id}: K₂ and K₈, 96-byte G₂ points.

**[3]** It hashes each secret to Yᵢ = hash_to_curve_G1(xᵢ).

**[4]** One batch pairing check covers all v3 proofs in the token: the weighted sum of the Cᵢ against G₂ equals the product, over keys, of the weighted Yᵢ against each key. It runs offline. On v1 and v2 keysets the same check needs the NUT-12 DLEQ proof and the sender's r.

**[5]** A valid signature is not an unspent one. Only the mint knows the spent state. The receiver checks state with NUT-07, or swaps the proofs with NUT-03 to own fresh ones.

## Background

- **Token**: a serialized set of proofs (NUT-00, V4 format cashuB…). For v3 each proof carries amount, secret, C and optional spend info; a dleq field is not allowed.
- **GET /v1/keys/{keyset_id}**: the NUT-01/NUT-02 endpoint returning one public key per amount.
- **Batch verification**: each proof gets a weight wᵢ derived from a SHA-256 transcript of all proofs. Proofs under the same key are summed: e(Σ wᵢ·Cᵢ, G₂) = Π over keys e(Σ wᵢ·Yᵢ, Kⱼ). Here two keys, K₂ and K₈, so three pairings in total instead of six.
- **Offline**: the check uses only the token and the published keys; the mint is not contacted.
- **NUT-07 (check state)**: asks the mint whether a proof's Y is unspent, pending or spent.
- **NUT-03 (swap)**: exchanges the received proofs for new ones. After the swap the sender can no longer spend the originals.
