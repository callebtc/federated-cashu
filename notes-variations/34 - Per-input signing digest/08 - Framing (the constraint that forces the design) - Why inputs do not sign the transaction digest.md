# 34.08 · Why inputs do not sign the transaction digest

Variation 8 of slide 34 (Per-input signing digest) · lens: Framing: the constraint that forces the design · deck `fcv-f-client-intent` page 27 · 4 steps · script 138 words, about 60 s

## Script

The constraint behind the per-input digest. d is the transaction digest, id i the input ID.

**[1]** The simpler design: every input signs d directly.

**[2]** It fails twice. A disclosure leaf makes the mint publish the exercised witness with its signed message. If that message is d, publication reveals a value shared by every input and links the spend to the rest of the transaction. And with one message for all inputs, a signature by one x-only key verifies at every input with that key.

**[3]** NUT-10 signs the tagged hash of d and id i instead. Publication reveals only the witness and input digest; d stays behind SHA-256. Each input signs a different message.

**[4]** NUT-07 fixes what the mint returns: for a disclosure spend, the exact witness and input digest; otherwise none of witness, input digest or transaction digest.

## Background

- **Disclosure leaf**: a condition leaf carrying `disclosure` mode 0x01. When it is exercised, a mint supporting NUT-07 or NUT-17 publishes the witness and input digest, so third parties can verify the spend.
- **NUT-07 (token state check)**: the endpoint where anyone holding a proof can ask whether it is spent; on v3 keysets it returns a commitment and, for disclosure spends, the opening.
- **Linkability**: a value shared by all inputs would let an observer group all inputs and outputs of one transaction.
- **x-only key**: BIP-340 verifies against the x-coordinate only, so twin secrets 02‖x and 03‖x share one signing key.
- **Spender's opening**: to prove how an input digest was formed, the spender reveals the TLV transcript; the verifier recomputes the transaction digest and the input ID.

## Speaker note

- Specified in cashubtc/nuts#443 (NUT-10, NUT-07); not implemented on the federation branches.
