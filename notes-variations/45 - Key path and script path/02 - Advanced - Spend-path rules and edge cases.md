# 45.02 · Spend-path rules and edge cases

Variation 2 of slide 45 (Key path and script path) · lens: Advanced · deck `fcv-i-nutroot-spend` page 4 · 4 steps · script 139 words, about 60 s

## Script

**[1]** Key path: exactly one BIP-340 signature, by k for a bare secret or p′ = (k + t) mod n for a tweaked one, checked against x(P) over the input digest. Bare and tweaked spends are byte-identical. Carol's signature listed twice is a spec rejection vector.

**[2]** Script path: a leaf field selects it. control carries K, 33 bytes, and at most three 32-byte path hashes; no leaf-version byte, no parity bit, because K + t·G is compared with the full secret. Signatures must not outnumber the leaf's keys.

**[3]** Edge case: 02‖x and 03‖x, here 3·G and (n − 3)·G, are two secrets with separate Y. One scalar key-path spends both, tweaked or not. Script paths bind the exact 33-byte secret.

**[4]** A witness signs one input's digest in one transaction and verifies nowhere else. Tokens must not carry v3 witnesses.

## Background

- **BIP-340**: the Schnorr signature standard used by Taproot. Public keys are x-only (32 bytes), signatures are 64 bytes.
- **x-only verification and negation**: BIP-340 verifies against an x-coordinate and uses the point with even y. A signer whose point has odd y signs with n − d instead of d. So d and n − d sign for the same x-coordinate.
- **(n − 3)·G**: the negation of 3·G, same x, opposite y parity. 02f9308a… is 3·G (even y), 03f9308a… is (n − 3)·G.
- **Y**: hash_to_curve of the 33 secret bytes, the key under which the mint records a spend. 02‖x and 03‖x are different bytes, so they have different Y.
- **Why script paths bind the exact secret**: the commitment check compares K + t·G with the full compressed point, including the prefix byte. Leaf keys that share an x-coordinate are rejected by leaf validation.
- **Input digest**: tagged_hash("Cashu_TransactionInput", transaction_digest ‖ input_id). A transaction cannot repeat a Y, so no two inputs sign the same message.
- **4096 characters**: mints MAY reject a longer serialized witness; the spec states every valid witness has a compact encoding below it.
- **Witnesses in tokens**: v3 proofs in serialized tokens MUST NOT carry a witness, and wallets drop one when encoding or decoding, since it authorizes nothing outside its transaction.
