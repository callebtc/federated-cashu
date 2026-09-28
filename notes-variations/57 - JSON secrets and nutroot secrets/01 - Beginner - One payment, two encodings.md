# 57.01 · One payment, two encodings

Variation 1 of slide 57 (JSON secrets and nutroot secrets) · lens: Beginner · deck `fcv-j-nutroot-use` page 28 · 5 steps · script 139 words, about 60 s

## Script

One payment: Carol, key 3, can spend; from 19 August 2025, Alice, key 4, can take it back.

**[1]** One condition, two encodings.

**[2]** On keysets v1 and v2 the condition is written into the secret as JSON: kind P2PK, a random nonce, Carol's key as data, and tags for the locktime and Alice's refund key. 276 bytes. The whole policy is the secret.

**[3]** On v3 the secret is a 33-byte public key. The condition travels beside the proof as spend info, wallet to wallet only: the ephemeral key E and one after leaf naming Alice's key, 49 bytes.

**[4]** At the mint, the JSON version shows the whole policy on every spend. On v3, Carol signs with the secret's own key, the key path: one signature, nothing else.

**[5]** Alice's refund, after the date, reveals only her leaf, K and her signature.

## Background

- **Proof secret**: the value the mint's blind signature is bound to; the mint sees it only when the proof is spent.
- **P2PK (NUT-11)**: pay-to-public-key; `data` is the key that must sign, the `locktime` and `refund` tags let the refund key sign after the time.
- **Nonce**: a random value, 32 bytes as 64 hex characters, so two secrets with the same policy differ.
- **Spend info**: data sent with a token from wallet to wallet, never to the mint: here E, from which Carol derives her key, and the tree.
- **Key path / script path**: key path is a signature by the secret's own private key and reveals nothing else; script path reveals one leaf, K and its signatures.
- **1755561600**: Unix time for 2025-08-19 00:00 UTC.
- **v3 values**: the NUT-10 worked example (Carol key 3, Alice key 4, ephemeral key 5), secret 02d310a4…9ef8f828.

## Speaker note

- 276 bytes is computed from compact JSON with a 64-character nonce (deck note); recomputed and correct.
