# 13.07 · A proof stays (amount, id, secret, C)

Variation 7 of slide 13 (Threshold BLS compared with t-of-n multisig) · lens: Framing: the constraint · deck `fcv-b-threshold` page 9 · 4 steps · script 120 words, about 50 s

## Script

The design constraint. The panel shows a v3 proof as specified in NUT-00: amount, a keyset ID starting with 02, the secret, and C, a 48-byte point.

**[1]** The constraint: a proof stays (amount, id, secret, C), and the wallet-to-mint protocol stays Cashu.

**[2]** secp multisig breaks it. C becomes t signatures, and the proof must also carry the roster and the policy.

**[3]** Threshold BLS keeps it. C is still one G₁ point of 48 bytes, because the shares are interpolated before the proof exists.

**[4]** What follows. The keyset is an ordinary v3 keyset with one K per amount. Any v3 wallet verifies with K, offline. The wallet API is unchanged: FederatedMintConnector, in crates/cdk/src/wallet/federation.rs, fans the request out to the members underneath.

## Background

- **Proof (NUT-00)**: what a wallet stores and sends: amount, keyset ID, secret, and the unblinded signature C.
- **v3 keyset ID**: version byte 02 followed by 32 bytes of SHA-256 over the keyset's amounts and keys, unit and fee (slide 1.1, Keyset versions).
- **G₁ point, 48 bytes**: a compressed BLS12-381 point; v3 signatures and blinded messages are G₁ points.
- **FederatedMintConnector**: the wallet-side connector that sends the same ordinary Cashu request to every member's public URL, verifies and aggregates the shares, and returns a normal Cashu response to the rest of the wallet.
- **Wallet-to-mint protocol stays Cashu**: each member serves the standard HTTP API and returns an ordinary response whose C_ values are signature shares.

## Speaker note

- The secret field is drawn as 33 bytes. That is the v3 secret form of the spec draft (nuts#443, NUT-00 "Secret bytes": a compressed public key whose 33 decoded bytes are hashed). On bls-federation, `Proof::y` hashes the secret string's bytes (`hash_to_curve_for_version(self.secret.as_bytes(), …)`), and I found no 33-byte check there. Present the size as the specified form, not as implemented.
