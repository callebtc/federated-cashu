# 40 · The secret is a public key

2.3 Nutroot secrets · 4 steps · script 86 words, about 35 s

## Script

**[1]** Every ecash token has a secret: the value the mint signed, blinded, when the token was created. Until now it was a random string, or a JSON document for tokens with conditions.

**[2]** With nutroot, the secret is a public key, always 33 bytes.

**[3]** A token with a script looks exactly the same: a secret that is a public key.

**[4]** The script is hidden inside the key. Only when someone spends the token through the script does the mint learn that a script was there at all.

## Background

- **Secret**: part of every Cashu proof; the mint marks it spent when the token is redeemed.
- **Public key as secret**: the holder of the matching private key can sign for it; that signature is the default way to spend.
- **Hidden script**: the conditions are committed into the key by a tweak, as in Bitcoin taproot. The next slide shows how.
