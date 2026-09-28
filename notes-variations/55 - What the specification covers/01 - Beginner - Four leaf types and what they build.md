# 55.01 · Four leaf types and what they build

Variation 1 of slide 55 (What the specification covers) · lens: Beginner · deck `fcv-j-nutroot-use` page 11 · 5 steps · script 138 words, about 60 s

## Script

**[1]** A leaf is a small record the secret commits to. Threshold, type 0x01: any n of the listed keys sign. 42 bytes with one key. It builds multisig and the auditable lock.

**[2]** After, type 0x02, adds a time: from then on, n listed keys can sign. 49 bytes. It builds the timelocked refund.

**[3]** Hashlock, type 0x03, adds a SHA-256 hash. The spender reveals the preimage, the input that hashes to it, and still signs. 77 bytes. It builds the HTLC.

**[4]** Commit, type 0x04, is never spendable. It fixes 32 bytes of outside data, for example for a Nutzap. 37 bytes.

**[5]** No tree needed: a bearer token, secret K with its private key in spend info; pay to a key, K blinded from the receiver's static key; one-signature multisig, K aggregated by MuSig2 or FROST, with the empty tweak.

## Background

- **Leaf bytes**: version byte, type byte, then field records of type (1 byte), length (2 bytes) and value. Threshold with one key: 2 + 4 (n record) + 36 (keys record: 3-byte header plus a 33-byte key) = 42. After adds a 7-byte time record: 49. Hashlock adds a 35-byte hash record: 77. Commit is 2 + 35 = 37. Sizes of the tests/10-tests.md leaves.
- **n**: the signature threshold, from 1 up to the number of listed keys.
- **HTLC**: hashed timelock contract; money unlocked by revealing a preimage, used for atomic swaps. A hashlock leaf also needs n signatures, so a published preimage alone does not let anyone spend.
- **Nutzap**: ecash sent over Nostr to a recipient's key. The commit leaf can hold a digest of the Nostr event the payment is for.
- **Auditable lock**: a NUMS internal key with one threshold leaf, n = 1, with disclosure; anyone can verify only that key can spend.
- **Bearer token**: whoever holds the private key k in spend info can spend.
- **MuSig2, FROST**: protocols where several signers hold shares of one aggregate key and produce one joint signature. The empty tweak, tagged_hash("Cashu_NutrootTweak", K), shows the cosigners that no script path is hidden.
