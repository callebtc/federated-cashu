# 10.07 · One secret, two blinding factors

Variation 7 of slide 10 (Blind Diffie–Hellman key exchange on secp256k1 (NUT-00)) · lens: Focus: the blinding factor · deck `fcv-a-bls` page 17 · 4 steps · script 140 words, about 60 s

## Script

Toy group mod 13: Y = 5·G, mint key k = 7, published K = 7·G.

**[1]** With r = 3: B′ = 8·G, C′ = 4·G, r·K = 21·G = 8·G, and C = 4·G − 8·G = 9·G. That is k·Y.

**[2]** The same secret with r = 10: B′ = 2·G, C′ = 1·G, r·K = 70·G = 5·G, and again C = 9·G.

**[3]** B′ differs, C does not: C depends only on x and k. With uniform r, B′ = Y + r·G is a uniform point and carries no information about Y.

**[4]** Third column: r = 3, but the mint signs with k′ = 4. C′ = 6·G; subtracting r·K = 8·G gives 11·G, not k·Y = 9·G. Unblinding trusts K. The result verifies under neither k nor k′; only a DLEQ proof shows this before redemption.

## Background

- **Arithmetic mod 13**: 5 + 10 = 15 = 2; 7·2 = 14 = 1; 10·7 = 70 = 5; 1 − 5 = −4 = 9; 4·8 = 32 = 6; 6 − 8 = −2 = 11.
- **Why C is independent of r**: C′ − r·K = k·Y + k·r·G − r·k·G = k·Y. The r terms cancel for every r.
- **Uniform B′**: for each candidate Y there is a matching r, so the mint cannot tell which Y a given B′ came from.
- **Wrong-key signature**: with k′, C = k′·Y + r·(k′ − k)·G. It equals k·Y only if k′ = k.
- **DLEQ proof (NUT-12)**: proves that the key behind K also produced C′. It would fail for C′ = k′·B′ and let the wallet reject the response at issuance.

## Speaker note

- The slide says the wrong-key result "verifies under no key". In a group of prime order every point is some multiple of Y (in the toy group 11·G = 10·Y), so say "under neither k nor k′", or "under no key the mint holds".
