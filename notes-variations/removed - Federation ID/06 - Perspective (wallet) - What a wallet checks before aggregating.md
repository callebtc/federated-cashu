# removed.06 · What a wallet checks before aggregating

Variation 6 of slide removed (Federation ID) · lens: Perspective: wallet · deck `fcv-e-membership-custody` page 8 · 4 steps · script 127 words, about 55 s

## Script

This is the wallet's side of the two hashes.

**[1]** The wallet imports the public config and computes the federation ID F and the config digest D from it.

**[2]** It fetches mint info, the NUT-06 endpoint, from every member in the roster.

**[3]** For each member it checks, in order: the member is in the roster, then the advertised member ID, the federation ID F, the config digest D and the wallet protocol version. At this step all three pass.

**[4]** In this example m2's config was edited locally, so m2 advertises a different digest, D′. The wallet rejects m2 with FederationConfigDigestMismatch and excludes it. m1 and m3 remain valid. Two valid members still meet t equals 2, so the wallet collects and aggregates signature shares from m1 and m3.

## Background

- **Mint info (NUT-06)**: the `GET /v1/info` endpoint of a Cashu mint. A federation member adds `federation_id`, `member_id`, `config_digest` and `wallet_protocol_version`.
- **Config digest**: SHA-256 over the complete public config. A member whose local config differs in any field advertises a different digest.
- **Exclusion**: a member that fails any check is left out of the set the wallet sends requests to and accepts shares from; the failure is recorded per member.
- **Aggregation threshold**: the wallet needs signature shares from t valid members to build one ecash signature. With t = 2 of 3, one excluded member does not stop the wallet.
- **Wallet protocol version**: the version of the wallet-facing federation protocol that the config requires. A mismatch is rejected like the other fields.
