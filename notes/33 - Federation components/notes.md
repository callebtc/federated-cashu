# 33 · Federation components

Summary · table, no steps · script 55 words, about 25 s

## Script

Part one in one table. Verifying without the key: BLS pairings. Splitting the key: Shamir shares, combined by the wallet. Mix-and-match: consensus before signing. No trusted dealer: distributed key generation. The reserves: FROST threshold custody. Rewritten outputs: SIG_ALL always on, in v3. Status: this is not production-ready. The review is in cdk pull request 2048.

## Background

- **Mix-and-match**: sending different output sets to different members so each signs a valid-looking request, and more is issued than was paid.
