# 28.03 · One roster, two ceremonies

Variation 3 of slide 28 (Two DKG ceremonies, one roster) · lens: Graphical · deck `fcv-e-membership-custody` page 29 · 5 steps · script 130 words, about 55 s

## Script

Two key ceremonies run over one roster.

**[1]** The roster has five members, the same for both ceremonies.

**[2]** The BLS12-381 DKG gives each member key shares kᵢ and the federation its public keys K. These sign ecash.

**[3]** The FROST DKG on secp256k1 gives each member a share sᵢ of one treasury root, with the public root key P.

**[4]** The federation is ready only when both ceremonies have completed for the same federation, setup authorization and ceremony ID. Either result alone is not enough.

**[5]** Cashu keysets come from the BLS side. From the FROST root, two applications derive their own keys: BDK for on-chain addresses and Bark for Lightning. Both use the same root P; there is no second FROST ceremony. The BLS and FROST secrets are never converted into one another.

## Background

- **DKG**: distributed key generation. Members jointly create a key so that each ends with a share and nobody ever holds the full private key.
- **BLS12-381**: the pairing-friendly curve used for the federation's blind BLS ecash signatures (keyset v3).
- **kᵢ, K**: member i's BLS key shares (one set per amount) and the aggregate public keys that wallets verify against.
- **secp256k1**: Bitcoin's curve. FROST signatures on it are BIP340 Schnorr signatures, valid for Taproot.
- **sᵢ, P**: member i's FROST share of the treasury root and the root public key.
- **Application**: a registered use of the FROST root with its own tweak and label, for example `org.cashubtc.cdk.federated-onchain` for BDK and `org.cashubtc.cdk.federated-bark` for Bark.
