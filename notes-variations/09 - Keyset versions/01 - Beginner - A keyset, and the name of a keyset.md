# 09.01 · A keyset, and the name of a keyset

Variation 1 of slide 09 (Keyset versions) · lens: Beginner · deck `fcv-a-bls` page 35 · 5 steps · script 102 words, about 45 s

## Script

**[1]** A mint has one key pair per amount, 1, 2, 4, 8 and so on, and publishes the public keys.

**[2]** The keys, the unit and the fee together form a keyset. Here the unit is sat and the fee is input_fee_ppk.

**[3]** Hashing that data with SHA-256 gives 32 bytes. A version byte in front makes the keyset ID.

**[4]** A real ID from the NUT-02 test vectors, for amounts 1 and 2 and unit sat. It starts 02b7e077.

**[5]** The first byte tells the wallet which protocol to run. 00 is v1 and 01 is v2, both on secp256k1. 02 is v3, on BLS12-381.

## Background

- **Keyset**: the set of mint public keys, one per amount (1, 2, 4, 8, … sats). Each proof is signed by the key of its amount.
- **Unit**: the currency the keyset counts in, for example sat.
- **input_fee_ppk**: the fee per spent proof, in parts per thousand of one unit. 100 ppk is 0.1 sat per input.
- **Keyset ID**: a short name derived from the keyset data. Wallets recompute it to check that the mint's keys match the name, and every proof carries it.
- **Version byte**: the first byte of the ID. It selects the curve and the blinding protocol.
- **Sizes**: v1 IDs are 8 bytes (00 plus 7 bytes of hash); v2 and v3 IDs are 33 bytes (version byte plus 32-byte SHA-256).
