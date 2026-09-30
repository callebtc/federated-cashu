# 32 · Federation components

Original slide, deck `fcv-f-client-intent` page 37 (main deck slide 32). Same text as `notes/32 - Federation components/notes.md`.

Summary · table, no steps · script 55 words, about 25 s

## Script

Part one in one table. Blind threshold signatures: BLS pairings, so anyone can verify without the key. Consensus: AlephBFT orders every operation before members sign. No trusted dealer: distributed key generation. The reserves: FROST threshold custody, with the same members and threshold. Status: this is not production-ready. The review is in cdk pull request 2048.

## Background

- **Mix-and-match**: sending different output sets to different members so each signs a valid-looking request, and more is issued than was paid.
