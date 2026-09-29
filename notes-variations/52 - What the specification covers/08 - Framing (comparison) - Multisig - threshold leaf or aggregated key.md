# 52.08 · Multisig: threshold leaf or aggregated key

Variation 8 of slide 52 (What the specification covers) · lens: Framing: comparison · deck `fcv-j-nutroot-use` page 18 · 5 steps · script 140 words, about 60 s

## Script

**[1]** Left: a threshold leaf, n = 2, keys 3 and 4, 75 bytes. It works under any internal key; under a NUMS K there is no key path.

**[2]** Its spend reveals the leaf, K, the path and two signatures: 533 characters for a one-leaf tree. The mint reads both keys and n. Each key signs the input digest alone; a nutspA package carries the spend between signers.

**[3]** Right: K is a MuSig2 or FROST aggregate; nobody holds its scalar. It must carry at least the empty tweak, a tweak hash over K alone.

**[4]** Its spend is one key-path signature, 147 characters. The mint sees a key and one signature, as for a bare key. The cosigners produce that signature in an interactive MuSig2 or FROST session.

**[5]** The trade: witness size and visibility of the policy, against an interactive signing session.

## Background

- **MuSig2 (BIP327)**: n-of-n Schnorr multisignature; the signers combine their keys into one aggregate key and produce one signature in two rounds of messages.
- **FROST**: threshold Schnorr signatures: any threshold-sized subset of the n signers produces one ordinary-looking signature for the group key.
- **Empty tweak**: t = tagged_hash("Cashu_NutrootTweak", K), no root bytes. It shows the cosigners that no script path is hidden in the aggregate. Vector with K = key 3: t = 764c0e0d…d5b69908, secret 03b2bb25…d9233aee.
- **Character counts**: compact JSON with the vector field sizes. Key path: {"signatures":["<128 hex>"]} = 147. Script path: 150 hex leaf, 66 hex K, empty path, two 128-hex signatures = 533.
- **nutspA**: the signing-package transport string that carries a script-path spend to each cosigner.
- **Interactive session**: all cosigners must be online and exchange nonces before the signature exists; a threshold leaf lets each signer sign independently.

## Speaker note

- 533 and 147 are computed from compact JSON with the vector field sizes (the slide says so); recomputed and correct.
- The empty-tweak vector uses K = key 3, a single key standing in for an aggregate.
