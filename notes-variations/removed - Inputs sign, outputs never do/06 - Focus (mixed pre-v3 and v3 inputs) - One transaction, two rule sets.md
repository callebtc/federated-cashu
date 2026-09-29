# removed.06 · One transaction, two rule sets

Variation 6 of slide removed (Inputs sign, outputs never do) · lens: Focus: mixed pre-v3 and v3 inputs · deck `fcv-f-client-intent` page 34 · 4 steps · script 140 words, about 60 s

## Script

The mixed-keyset vector: a v3 and a pre-v3 input in one swap, the migration path to v3 outputs.

**[1]** Both proofs enter the transcript as container 01: the v3 proof, 145 bytes, the pre-v3 proof, 90 bytes, then two v3 outputs of 8 and 2 sat. 423 bytes, digest e8eb75f3.

**[2]** The v3 input's secret is a point and its Y is 48 bytes. It derives input digest 3f48aab7 and signs it; the witness 4c4906b9 verifies.

**[3]** The pre-v3 input's keyset ID is version 00, 8 raw bytes. Its secret is a random string and its Y a 33-byte secp256k1 point. It derives no input digest and carries its own NUT-11 witness, or none.

**[4]** The v3 signature covers the pre-v3 container, so this exact transaction cannot be rewritten. The pre-v3 proof itself stays unbound: whoever sees it can spend it in another transaction.

## Background

- **Pre-v3 Y**: `hash_to_curve` on secp256k1 (NUT-00), a 33-byte compressed point; v3 uses BLS12-381 G1, 48 bytes.
- **v0 keyset ID**: 8 bytes, `00456a94ab4e1c46`, written raw because it is hex.
- **Covered versus bound**: covered means its bytes are in the digest the v3 input signed; bound would mean its own owner signed. A bare pre-v3 proof has no owner signature.
- **Migration path**: wallets can spend old-keyset proofs into v3 outputs in one transaction.

## Speaker note

- On bls-federation, federated admission rejects inputs and outputs on non-v3 keysets (`InvalidFederatedKeysetVersion`), so this mixed case does not arise in the federation today.
- Values rechecked against the vector (423 bytes, digests, signature). Specified in cashubtc/nuts#443; not implemented on the federation branches.
