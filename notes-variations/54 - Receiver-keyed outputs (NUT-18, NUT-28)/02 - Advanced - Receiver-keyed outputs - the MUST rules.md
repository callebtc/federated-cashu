# 54.02 · Receiver-keyed outputs: the MUST rules

Variation 2 of slide 54 (Receiver-keyed outputs (NUT-18, NUT-28)) · lens: Advanced · deck `fcv-j-nutroot-use` page 4 · 3 steps · script 140 words, about 60 s

## Script

**[1]** Payer rules. A fresh ephemeral keypair per output. Blind k at slot 0, never verbatim, never bearer. Reproduce every leaf of l byte for byte, replacing only keys in b, or refuse to pay. Send E only if a blinding used it.

**[2]** Payee rules. Reject spend info whose E presence disagrees with the request. A disclosed K that differs from the derived one rejects. Accept exactly the requested tree, any order. Evaluate every leaf before counting the payment. Sweep; never re-gift a derived key as bearer k.

**[3]** A shared e gives the same K at slot 0, so with the same tree two outputs share one secret and one Y. The first spend marks Y spent; the other proof is refused. The mint cannot see this at issuance: outputs are blinded. The pre-v3 SIG_ALL shared-e exception is gone on v3.

## Background

- **Slot**: the index i in rᵢ = SHA-256("Cashu_P2BK_v1" ‖ Zx ‖ i). Slot 0 is the internal key; slots 1 onward are leaf keys in transmitted order.
- **Scalar range**: rᵢ must lie in 1 … n − 1. Otherwise the payer retries once with 0xff appended to the hash input, then discards the ephemeral keypair. A SHA-256 output lands outside that range with negligible probability.
- **256-slot cap**: the slot index is one byte, so slot 0 plus at most 255 leaf keys. A 256th leaf key would wrap onto slot 0's index; both sides refuse such a tree.
- **Y**: the hash-to-curve image of the secret; the mint records Y to mark a proof spent.
- **Why the mint cannot see reuse**: outputs arrive as blinded messages B_. Two outputs with the same secret but different blinding factors have different B_.
- **Re-gift rule**: the original payer knows r₀ and t. If the payee passed the derived key p + r₀ + t on as a bearer k, anyone combining it with the payer's knowledge could recover the payee's static private key p. So the payee sweeps first, then sends.
- **SIG_ALL (NUT-11)**: a pre-v3 flag where one signature covers the whole transaction; all SIG_ALL proofs need identical data and tags, so NUT-28's pre-v3 text requires one shared ephemeral for all outputs. NUT-28's v3 section removes that exception, and v3 has no SIG_ALL at all.
