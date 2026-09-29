# 30 · Two key shares per member

1.5 Custody · 3 steps · script 104 words, about 45 s

## Script

After both ceremonies, every member holds two kinds of key share.

**[1]** BLS key shares, kᵢ, one per amount in the keyset. With these, members produce blind signature shares: this issues ecash.

**[2]** A FROST share, sᵢ, of the one treasury key. With this, members sign Bitcoin transactions: this moves the reserves, on-chain through BDK and for Lightning through Bark.

**[3]** Both come from ceremonies over the same roster, with the same threshold. Startup completes only when both have finished, and the two secrets are never mixed. Wallet addresses are derived from the treasury key with non-hardened BIP32, so any t members can sign for every address.

## Background

- **Key share**: one member's part of a private key; t shares are needed to sign, and the full key is never assembled.
- **BLS12-381 vs secp256k1**: ecash uses BLS signatures on the curve BLS12-381; Bitcoin transactions need BIP340 Schnorr signatures on secp256k1. Hence two separate ceremonies.
- **Non-hardened BIP32**: child public keys can be derived from the parent public key alone; required because nobody holds the parent private key.
- **Derivation order in the code**: root P, domain tweak, chain code, non-hardened BIP32, BIP340 even-Y, BIP341 key-path tweak.
