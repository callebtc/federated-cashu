# 55.06 · Moving value from v1, v2 to v3

Variation 6 of slide 55 (JSON secrets and nutroot secrets) · lens: Framing: migration · deck `fcv-j-nutroot-use` page 33 · 4 steps · script 134 words, about 55 s

## Script

The mixed-keyset swap from the NUT-10 test vectors.

**[1]** One swap spends two proofs: 8 sat on a v3 keyset, whose Y is 48 bytes, and 2 sat on keyset 00456a94ab4e1c46, version byte 00, whose Y is 33 bytes. Both enter one transaction digest.

**[2]** Only the v3 input derives and signs an input digest, 3f48aab7…. The pre-v3 input keeps its own NUT-11 or bare witness.

**[3]** Both outputs, 8 and 2 sat, are on the v3 keyset. Old inputs, v3 outputs: the migration path is an ordinary swap.

**[4]** During the transition a payment request carries both nut10 and nutroot. A payer on a v1 or v2 keyset follows nut10; a payer on v3 must follow nutroot. The payee must accept either, and only she is exposed if they differ. nutroot alone asks for v3 outputs only.

## Background

- **Mixed transaction**: NUT-10 allows pre-v3 and v3 inputs together; each input is verified under its own keyset's rules.
- **Y sizes**: pre-v3 Y is a 33-byte secp256k1 point; v3 Y is a 48-byte BLS12-381 G1 point. Both enter the transcript as the proof container's Y field.
- **Transaction digest**: SHA-256 of the TLV transcript over all inputs and outputs, here e8eb75f3…9392d893.
- **Input digest**: tagged_hash("Cashu_TransactionInput", transaction_digest ‖ input_id); only v3 inputs sign one.
- **Bare witness**: a pre-v3 proof with a random secret needs no signature; a NUT-11 proof signs as before.
- **nut10 and nutroot (NUT-18)**: the pre-v3 and v3 encodings of the payee's locking condition in one request.
- **Pre-v3 settings**: the NUT-10, 11, 14 and 20 mint info settings describe pre-v3 keysets only; v3 support is implied by the keyset.
