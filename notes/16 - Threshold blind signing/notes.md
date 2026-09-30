# 16 · Threshold blind signing

1.2 Threshold issuance · 4 steps · script 128 words, about 55 s

## Script

A federation of four members, threshold three.

**[1]** The wallet blinds its token and sends the same request to all four members.

**[2]** Each member signs with its own key share and returns a signature share: one third of the signature. Member three is offline. That does not matter; three answers are enough.

**[3]** The shares go to the wallet. The wallet checks each share on its own and drops any that is invalid, so a faulty member cannot spoil the result.

**[4]** The wallet combines the three shares into one signature. It is exactly the signature a single mint with the full key would have produced, and it verifies against one public key. Any three of the four members give the same result, and the members never see each other's shares.

## Background

- **Signature share**: one member's partial signature, made with its key share. Alone it is not a valid signature.
- **Combining**: the wallet multiplies each share by a fixed weight (a Lagrange coefficient, which depends only on which members answered) and adds them up. The result is the signature under the full key.
- **Why any t work**: the key shares are points on one line or polynomial; any t points determine it (previous slide).
- **Checking a share**: each member publishes a public share; a pairing check against it shows whether that member's share is valid.
- **Picture on the slide**: the thirds are a picture of "t partial pieces make one whole", not a literal split of the signature into bytes.
