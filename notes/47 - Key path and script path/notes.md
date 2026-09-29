# 47 · Key path and script path

2.3 Nutroot secrets · 3 steps · script 145 words, about 60 s

## Script

**[1]** Key path: the witness is one BIP-340 signature by p′ = (k + t) mod n, checked against the x-coordinate of P. Exactly one entry. It is byte-identical to a bare-key spend, and the mint learns nothing about the tree.

**[2]** Script path, for the hashlock leaf: the witness holds the leaf bytes, a control object with the internal key K and the sibling path, the signatures, and a preimage of at most 32 bytes. Unlike BIP341, there is no leaf version and no parity bit in the control.

**[3]** Only the exercised leaf is revealed. h₀ and h₁ travel as opaque hashes, and the after leaf stays private. By default that disclosure ends at the mint. If the leaf sets disclosure 0x01, the mint publishes the exercised witness and input digest through NUT-07 and NUT-17. Both witness types sign the input digest of the transaction transcript.

## Background

- **p′ = (k + t) mod n**: the private key of P = K + t·G is the internal private key plus the tweak.
- **Why no parity bit**: K is sent as a full 33-byte compressed point and the secret is a full point, so the verifier compares points directly.
- **Opaque hash**: a hash that proves a sibling exists without revealing its content.
- **NUT-07**: token state check, where wallets ask whether proofs are spent. **NUT-17**: WebSocket subscriptions for state updates.
