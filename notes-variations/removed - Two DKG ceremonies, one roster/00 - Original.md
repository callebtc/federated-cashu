# 29 · Two DKG ceremonies, one roster

Original slide, deck `fcv-e-membership-custody` page 26 (main deck slide 29). Same text as `notes/29 - Two DKG ceremonies, one roster/notes.md`.

1.5 Custody · 3 steps · script 131 words, about 55 s

## Script

**[1]** The first ceremony gives each member BLS key shares kᵢ, one set per amount, for ecash on BLS12-381.

**[2]** The second gives each member a FROST share sᵢ of one treasury root key on secp256k1. Same roster, ceremony ID and threshold. Startup completes only when both finish, and the secrets never mix. FROST uses frost-secp256k1-tr 3.0.0: three rounds on the private plane, commitments, per-recipient packages, root confirmation. Each message binds federation, ceremony, epoch, threshold, roster, sender and receiver. Shares are sealed with AES-256-GCM.

**[3]** Wallet keys derive from the untweaked root P in a fixed order: domain tweak, chain code, non-hardened BIP32, BIP340 even-Y, BIP341 key-path tweak. BDK and Bark both derive from P; there is no second DKG. Any t members produce one BIP340 signature, and the private key is never reconstructed.

## Background

- **Ciphersuite `secp256k1_sha256_tr_v1`**: the FROST variant that produces taproot-compatible (BIP340) signatures on secp256k1 with SHA-256.
- **AES-256-GCM**: authenticated encryption. The share is unreadable without the key, and any modification of the stored bytes is detected.
- **Domain tweak**: the root is tweaked per application (label, version, key epoch), so each application gets its own key from the same root.
- **Chain code**: 32 bytes that, together with a public key, allow BIP32 child key derivation.
- **Non-hardened BIP32**: child public keys can be derived from the parent public key alone. Needed here because nobody holds the parent private key; hardened derivation would need it.
- **BIP340 even-Y**: BIP340 keys are x-coordinates only; the key is normalized so its point has an even y-coordinate.
- **BIP341 key-path tweak**: the taproot output key is the internal key plus a hash-derived tweak, even without scripts.
