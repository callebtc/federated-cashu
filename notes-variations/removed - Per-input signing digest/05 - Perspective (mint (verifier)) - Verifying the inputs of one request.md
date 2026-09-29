# removed.05 · Verifying the inputs of one request

Variation 5 of slide removed (Per-input signing digest) · lens: Perspective: mint (verifier) · deck `fcv-f-client-intent` page 24 · 5 steps · script 136 words, about 60 s

## Script

The mint's side of one request, as pseudocode. This is not CDK code.

**[1]** Build the transcript once from the request, containers grouped by type, and hash it to d, the transaction digest.

**[2]** Loop over the inputs. An input on a keyset with version byte below 02 follows the pre-v3 rules, JSON secrets, NUT-11 and NUT-14, and derives no message.

**[3]** A v3 input takes its container, the same bytes as in the transcript, hashes it to the input ID, and tag-hashes d with it. That is its message.

**[4]** Parse the witness. A leaf field selects the script path: at most 3 sibling hashes, recompute root and tweak, K plus t·G must equal the secret, parse the leaf and fail closed. Otherwise the key path: exactly one BIP-340 signature, checked x-only.

**[5]** Then the usual double-spend check on Y.

## Background

- **Keyset version byte**: the first byte of a keyset ID. 00 and 01 are pre-v3 keysets; 02 is v3 (BLS12-381).
- **Key path**: one signature by the secret's own private key.
- **Script path**: the witness reveals one condition leaf, the control block (internal key K and a merkle path) and signatures. The verifier recomputes the merkle root, the tweak `t = tagged_hash("Cashu_NutrootTweak", K ‖ root)`, and checks K + t·G equals the secret.
- **Fail closed**: an unknown leaf version, type or field rejects the spend rather than being ignored.
- **4096 characters**: mints may reject longer serialized witnesses; every valid witness fits below it.
- **Double-spend check**: Y must not already be marked spent.

## Speaker note

- The page is pseudocode written for the slide; no CDK code implements it. Specified in cashubtc/nuts#443; not implemented on the federation branches.
