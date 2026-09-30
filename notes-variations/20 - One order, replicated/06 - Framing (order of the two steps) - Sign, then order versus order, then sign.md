# 20.06 · Sign, then order versus order, then sign

Variation 6 of slide 20 (One order, replicated) · lens: Framing: order of the two steps · deck `fcv-c-ordering` page 24 · 4 steps · script 108 words, about 45 s

## Script

The same two steps in two orders. n = 3, t = 2, one quote paid for two outputs.

**[1]** Sign on receipt. m1 gets A and B, m2 gets B and C, m3 gets C and A. Each returns its shares at once.

**[2]** Ordering afterwards can detect that the requests conflict. But the shares for C are already with the wallet, and a share cannot be withdrawn. C is already signed.

**[3]** Order, then sign. Both requests become envelopes, and consensus fixes entry 41 before entry 42.

**[4]** Shares exist only for entry 41, outputs A and B. Entry 42 is rejected. The conflict is settled before any signature exists.

## Background

- **Sign on receipt**: each member signs as soon as its own local check passes.
- **Order, then sign**: members first agree on the order of operations through consensus, then sign only the outputs of accepted entries.
- **Why a share cannot be withdrawn**: a share is a value kᵢ·B′ held by the wallet. With t of them the wallet computes the signature; nothing a member does later changes that.
- **Envelope**: the canonical encoding of a request; its hash is the operation ID.
