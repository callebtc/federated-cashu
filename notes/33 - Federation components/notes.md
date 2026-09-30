# 33 · Federation components

Summary · table, no steps · script 55 words, about 25 s

## Script

Part one in one table. Blind threshold signatures: BLS pairings, so anyone can verify without the key. Consensus: AlephBFT orders every operation before members sign. No trusted dealer: distributed key generation. The reserves: FROST threshold custody, with the same members and threshold. Status: this is not production-ready. The review is in cdk pull request 2048.

## Background

- **Mix-and-match**: sending different output sets to different members so each signs a valid-looking request, and more is issued than was paid.
