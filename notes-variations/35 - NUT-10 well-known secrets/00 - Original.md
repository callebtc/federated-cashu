# 35 · NUT-10 well-known secrets

Original slide, deck `fcv-g-json-taproot` page 2 (main deck slide 35). Same text as `notes/35 - NUT-10 well-known secrets/notes.md`.

2.1 Spending conditions today · 4 steps · script 100 words, about 45 s

## Script

**[1]** Today a spending condition is a well-known secret: a JSON array. First the kind, here P2PK, then an object with a nonce, the data, which for P2PK is the public key, and tags.

**[2]** This JSON is serialized into the string Proof.secret. Inside the proof's own JSON it is escaped a second time, so every quote appears as backslash-quote.

**[3]** The mint hashes the bytes of that string to the curve, here 195 bytes. The size of the secret grows with the policy.

**[4]** The witness is a JSON string too, holding the signatures. Under SIG_INPUTS the signature covers the unescaped secret string.

## Background

- **NUT-10**: the specification of structured ("well-known") secrets that carry spending conditions.
- **P2PK (NUT-11)**: pay-to-public-key: the proof needs a signature by the key in `data`.
- **Nonce**: a random value that makes each secret unique, even with the same conditions.
- **Tags**: key–value lists for extra conditions, such as `sigflag`, `locktime`, `refund`.
- **JSON escaping**: to put a JSON text inside a JSON string, each `"` becomes `\"`. The secret is therefore JSON inside a string inside JSON.
- **UTF-8 bytes**: the string is hashed as its byte encoding, so every character, including spaces and backslashes, changes Y.
