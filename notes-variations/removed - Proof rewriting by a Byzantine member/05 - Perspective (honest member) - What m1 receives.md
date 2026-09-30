# removed.05 · What m1 receives

Variation 5 of slide removed (Proof rewriting by a Byzantine member) · lens: Perspective: honest member · deck `fcv-f-client-intent` page 7 · 4 steps · script 128 words, about 55 s

## Script

This is the view from m1, an honest member.

**[1]** It holds two envelopes of kind swap. Envelope 1 is the wallet's request, which m1 wrapped itself. Envelope 2 comes from m3 through consensus. Each is signed by a roster member's key, and neither carries a witness.

**[2]** The inputs are identical, P1 and P2 as secret and signature. The outputs differ: A and B against X and Y.

**[3]** Under pre-v3 rules no field says which output set the owner chose. m1 applies whichever envelope consensus orders first.

**[4]** With v3 inputs, m1 rebuilds each envelope's transcript and input digests. The wallet's witnesses verify for A and B. Copied into envelope 2, they are checked against digests over X and Y and fail. New witnesses would need the private key k.

## Background

- **Witness**: data attached to an input that proves the right to spend it, typically a signature.
- **Transcript and input digest (v3, NUT-10)**: a canonical byte serialization of the whole transaction, and per input a tagged hash of the transcript's digest and that input's ID. Different outputs give a different transcript, so every input digest changes.
- **k**: the private key whose public key K = k·G is the proof's secret on a v3 keyset. The mint and members see K and signatures, never k.
- **Why m1 cannot decide pre-v3**: both envelopes are well-formed, balanced and member-signed; nothing in them comes from the proof owner.

## Speaker note

- v3 transcript signing is specified in cashubtc/nuts#443 and not implemented on bls-federation or bls-federation-bdk-frost: no member recomputes input digests today. Present step 4 as the specified behaviour.
- "Pre-v3" means the rules before nuts#443. The branch's federated keysets are already version 02 (BLS), but it applies the old bearer and NUT-11 rules to them.
