# 31.06 · The same swap, pre-v3 and v3

Variation 6 of slide 31 (Proof rewriting by a Byzantine member) · lens: Framing: before and after · deck `fcv-f-client-intent` page 8 · 4 steps · script 139 words, about 60 s

## Script

What m3 can do with the same fan-out, on a pre-v3 keyset and on a v3 keyset.

**[1]** Pre-v3, m3 receives the secret x and the signature C: the whole bearer proof. On v3, m3 receives the secret K, the public key k·G, the signature C, and the owner's witness, a46a08f9 in the swap vector. It never receives k.

**[2]** m3 builds the same rewrite, P1 and P2 into X and Y. Pre-v3 that needs nothing more. On v3 the transcript changes, so the input digests change and need new signatures by k.

**[3]** Pre-v3, honest members check C, spent state and balance, and all pass. On v3, the copied witness is checked against the new input digest and fails.

**[4]** Pre-v3, the rewrite wins if it is ordered first. On v3 it is rejected, and only A and B can be applied.

## Background

- **K = k·G**: G is the fixed generator point of secp256k1; multiplying it by the private scalar k gives the public key K. Computing k from K is the discrete logarithm problem, which is infeasible.
- **a46a08f9…09a2**: the key-path witness of the NUT-10 swap vector, a BIP-340 signature over that transaction's input digest.
- **BIP-340 signature**: a 64-byte Schnorr signature. Without k, no one can produce a valid signature over a new message.
- **Why the copied witness fails**: it signs the input digest of the owner's transaction. m3's transaction has different outputs, a different transcript and therefore a different input digest.
- **What m3 still can do**: see every proof and submit envelopes; it can no longer produce a different valid spend.

## Speaker note

- v3 transcript signing is specified (cashubtc/nuts#443) and not implemented on either federation branch; the right-hand column describes the specified behaviour.
- In the vector the witness binds the swap vector's two 4-sat outputs; "A B" is the slide's label for them.
