# 53.01 · What travels next to a proof

Variation 1 of slide 53 (Spend info and receive-time checks) · lens: Beginner · deck `fcv-i-nutroot-spend` page 27 · 6 steps · script 138 words, about 60 s

## Script

A proof holds an amount, a keyset id, the secret P, which is a public key, and the mint's signature C. The next holder may need more: the spend info.

**[1]** k, 32 bytes: here is the private key; whoever holds it can spend. In the vector, k·G = 02e6e7cf… = P.

**[2]** E, 33 bytes: derive your key. The receiver combines E with its own long-lived static key, NUT-28. Never sent with k.

**[3]** K, 33 bytes: the internal key, the key P was built from.

**[4]** tree: the conditions, as full leaves, never as hashes. Here one leaf: key 4 may sign from 2025-08-19.

**[5]** u, 32 bytes: it shows nobody has K's private key, because K = H + u·G, and nobody knows H's private key.

**[6]** The receiver rebuilds P from these fields. If it matches, no condition is hidden.

## Background

- **C**: the mint's blind signature on the secret, which makes the proof valid ecash.
- **Static key**: the receiver's long-lived public key, published so senders can pay to it.
- **Ephemeral key E**: a one-time public key of the sender. The sender's one-time private key with the receiver's public key, or the receiver's private key with E, gives the same shared value (ECDH), from which the receiver's key for this proof is derived.
- **Leaf**: one condition, serialized as bytes. The tree is the set of leaves.
- **H**: the NUMS point, an x-coordinate taken from a hash, with no known private key.
- **Why rebuilding proves completeness**: the secret commits to the root, and the root commits to every leaf. If the disclosed leaves reproduce the secret, no extra leaf can exist.
- **Where spend info travels**: in the token, from sender to receiver (JSON `spend_info`, V4 CBOR map `si`). It is never sent to the mint.

## Speaker note

- The example values come from different vectors: k from the V4 bearer token, E from the receiver-keyed tokens, K from the refund example, u from the script-only token. One token never carries all five fields.
