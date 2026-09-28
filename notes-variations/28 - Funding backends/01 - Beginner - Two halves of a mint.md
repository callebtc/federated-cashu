# 28.01 · Two halves of a mint

Variation 1 of slide 28 (Funding backends) · lens: Beginner · deck `fcv-e-membership-custody` page 19 · 5 steps · script 140 words, about 60 s

## Script

A mint has two halves: the issuer signs eCash, and the reserves hold the bitcoin.

**[1]** A user deposits 1,000 sat into the reserves, and the issuer signs 1,000 sat of eCash.

**[2]** The user melts 400 sat of eCash. The issuer takes those proofs, the eCash tokens, back, and the reserves pay 400 sat to the user's address. 600 sat remain on both sides.

**[3]** The issuer is federated: two of three members contribute a signature share to each proof.

**[4]** If the reserves sit in one Lightning or on-chain node, that node's operator can move the 600 sat alone. Federating the issuer does not change that.

**[5]** With threshold custody, the same three members hold shares s₁, s₂, s₃ of the treasury key under FROST, a threshold Schnorr scheme. Any two together sign a Bitcoin transaction; no single member can move the reserves.

## Background

- **eCash proof**: a token signed by the mint that represents an amount. It is backed only while the mint holds matching reserves.
- **Mint and melt**: minting exchanges a payment into the mint for eCash (NUT-04). Melting exchanges eCash for a payment made by the mint (NUT-05).
- **Signature share**: one member's part of an eCash signature. t shares combine into one signature.
- **Reserves**: the bitcoin held by the mint, on-chain or in Lightning channels, that backs outstanding eCash.
- **FROST**: Flexible Round-Optimized Schnorr Threshold signatures. t of n members jointly produce one ordinary BIP340 Schnorr signature; the full private key is never assembled.
- **Treasury key**: the secp256k1 key that controls the reserves. Under threshold custody each member holds a share sᵢ of it.
