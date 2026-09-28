# 25.03 · Two hashes and where they are checked

Variation 3 of slide 25 (Federation ID) · lens: Advanced · deck `fcv-e-membership-custody` page 5 · 4 steps · script 136 words, about 60 s

## Script

Two hashes, and where each is checked.

**[1]** The federation ID covers only the roster: the domain, the setup authorization, n, t and c, and each member's ID, both URLs and identity key.

**[2]** The config digest hashes a second domain and the JSON of the whole public config: keysets, policies, FROST wallet config, setup transcript. A KeysetRotation changes the digest, never the ID.

**[3]** Validation recomputes the ID and rejects a mismatch. Production and wallet import enforce the BFT bounds, with f equal to floor of n minus 1 over 3: t at least f plus 1, c at least n minus f. Every consensus envelope carries the ID; both DKG results bind it.

**[4]** Wallets check each member's mint info: member ID, federation ID, config digest, protocol version. A failing member is excluded; aggregation needs t valid members.

## Background

- **lp(x)**: x preceded by its length as a 4-byte big-endian integer. It keeps adjacent variable-length fields unambiguous.
- **Config digest**: SHA-256 over a length-prefixed domain string and the length-prefixed serde_json encoding of the complete `FederationConfig`. Any change to a public setting, including keysets, changes it.
- **f and the BFT bounds**: f = ⌊(n − 1)/3⌋ is the number of arbitrarily faulty members the federation is designed to tolerate. t ≥ f + 1 means f faulty members cannot produce an eCash signature alone. c ≥ n − f means any two ordering quorums share at least f + 1 members, so at least one honest member is in both. Example: n = 4 gives f = 1, t ≥ 2, c ≥ 3.
- **Structural bounds**: independent of the BFT bounds, `validate` requires n ≥ 2 and 1 ≤ t ≤ c ≤ n.
- **Envelope and operation ID**: every consensus operation is wrapped in an envelope with version, federation ID and payload. The operation ID is a domain-separated SHA-256 over its canonical bytes, so an operation for one federation cannot be replayed into another.
- **Mint info (NUT-06)**: the `GET /v1/info` endpoint of a Cashu mint. In federation mode it also carries federation ID, member ID, config digest and wallet protocol version.
- **Aggregation**: combining t BLS signature shares from different members into one eCash signature.
- **KeysetRotation**: the consensus operation that adds or rotates a BLS keyset. It changes the config, not the roster.
