# 06.04 · BDHKE in cashu::dhke

Variation 4 of slide 06 (Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)) · lens: Explained via code · deck `fcv-a-bls` page 14 · 4 steps · script 120 words, about 50 s

## Script

Four excerpts from `crates/cashu/src/dhke.rs`, branch bls-federation.

**[1]** Blind. `blind_message_for_version`, versions 00 and 01. It hashes the secret to y, takes the given blinding factor or generates one, and combines y with r times G: B′ = Y + r·G.

**[2]** Sign. `sign_message` turns k into a scalar and multiplies B′ by it: C′ = k·B′.

**[3]** Unblind. `unblind_message` multiplies the mint public key by r, negates it, and adds it to C′: C = C′ − r·K. Only the public key is used.

**[4]** Verify. `verify_message` takes the secret key a as its first argument. It hashes the message to y, multiplies y by that secret key, and compares with the unblinded signature. On a secp keyset, every redemption check needs the private key.

## Background

- **`try_combine`**: point addition. `r.public_key()` is r·G, so `y.try_combine(&r.public_key())` is Y + r·G.
- **`try_mul_tweak`**: multiplication of a point by a scalar, here k·B′ or r·K.
- **`try_negate`**: the point with the opposite y-coordinate, −P. Adding −r·K subtracts r·K.
- **Scalar**: an integer modulo the curve order, used as a multiplier for points.
- **`SecretKey::generate`**: a random blinding factor when the caller does not supply one. Deterministic wallets (NUT-13) pass a derived one.
- **Why the verify signature matters**: a function that needs the private key can only run where the key is. With k split across members, no single machine could run it.

## Speaker note

- The excerpts are abridged. On the branch, `blind_message_for_version` also has a `Version02` arm (B′ = r·Y) and `sign_message` a BLS arm, both behind the `federation` feature; the slide shows only the secp256k1 paths.
