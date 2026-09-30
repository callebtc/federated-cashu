# 31.01 · Federation components in plain terms

Variation 1 of slide 31 (Federation components) · lens: Beginner · deck `fcv-f-client-intent` page 38 · 7 steps · script 138 words, about 60 s

## Script

Seven requirements, each with the component that meets it.

**[1]** Anyone can check a token without the mint's private key. BLS signatures allow that: the check uses the public key and a pairing, a function on curve points.

**[2]** No single member holds the signing key. Each holds a share, and any t members' partial signatures combine in the wallet.

**[3]** Members never sign two conflicting requests. They agree on one order with AlephBFT before signing.

**[4]** The wallet sends each request to every member, checks each share and combines them.

**[5]** No machine sees the whole key, even at setup: distributed key generation.

**[6]** The bitcoin behind the tokens is not held by one operator: t members sign treasury transactions with FROST.

**[7]** A member cannot redirect a user's spend: every v3 input signs the whole transaction. This row is specified, not yet implemented.

## Background

- **BLS signature**: a signature on the BLS12-381 curve that anyone can verify from the public key alone.
- **Pairing**: a bilinear map e(P, Q) on BLS12-381 points; checking e(C, g2) = e(Y, K), with g2 the G2 generator and K = k·g2, confirms that C = k·Y without knowing k.
- **t of n**: t is the signing threshold, n the number of members; any t shares suffice, fewer reveal nothing about the key.
- **AlephBFT**: the consensus protocol that gives all members one order of operations.
- **DKG**: distributed key generation; members create their shares jointly, so the full key never exists on one machine.
- **FROST**: a threshold Schnorr signature scheme; t members produce one BIP-340 signature for a bitcoin transaction.

## Speaker note

- Row 7 is specified in cashubtc/nuts#443 and not implemented on bls-federation or bls-federation-bdk-frost; SEC-2026-07-17-01 is open. Status line on the slide: not production-ready, review cashubtc/cdk#2048.
