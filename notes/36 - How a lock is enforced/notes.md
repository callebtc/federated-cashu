# 36 · How a lock is enforced

2.1 Spending conditions today · 7 steps · script 134 words, about 55 s

## Script

What a spending condition looks like from the outside.

**[1]** Alice holds an ordinary token: anyone who holds it can spend it.

**[2]** She swaps it at the mint for a token locked to Carol's public key. The mint signs the new token without seeing the lock: it is hidden inside the blinded secret.

**[3]** Alice sends the locked token to Carol, offline if she wants.

**[4]** To spend it, Carol adds a witness: a signature from her private key.

**[5]** She sends token and witness to the mint. Now the mint sees the secret for the first time, and with it the lock.

**[6]** The mint enforces the condition: the signature must verify against Carol's key. Without it, the swap is refused.

**[7]** Only then is the locked token marked spent, and Carol receives a fresh token of her own.

## Background

- **Spending condition (NUT-10, NUT-11)**: rules embedded in a token's secret, here "a signature by this public key" (P2PK).
- **Witness**: the data that satisfies the condition, here Carol's signature, attached to the proof when spending.
- **Why the mint only learns of the lock at spend time**: at issuance the mint signs a blinded message; the secret, and the lock in it, is revealed only when the token is redeemed.
- **Enforcement**: the mint checks the witness before marking the input spent; an invalid or missing witness makes the whole swap fail.
