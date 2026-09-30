# 15.01 · Sharing a number with a line

Variation 1 of slide 15 (Splitting the key - t of n) · lens: Beginner · deck `fcv-b-threshold` page 11 · 5 steps · script 129 words, about 55 s

## Script

Sharing a number with a line, using ordinary integers.

**[1]** The secret is a number, k = 7.

**[2]** Pick a random slope, here 3. The line f(x) = 7 + 3x crosses x = 0 at k.

**[3]** Member i gets the height of the line at x = i. m1 gets 10, m2 gets 13, m3 gets 16. These values are the shares.

**[4]** One value alone reveals nothing. Many lines pass through the point (1, 10), and each crosses x = 0 at a different height. From 10 alone, k could be any number.

**[5]** Two values fix the line: through (1, 10) and (3, 16) there is exactly one. Following it back to x = 0 gives 7. Real shares are elements of a finite field, 𝔽ᵣ, not ordinary numbers.

## Background

- **Secret k**: the number to protect; in the federation it is a mint private key.
- **Line f(x) = k + a·x**: a polynomial of degree 1. Its value at x = 0 is k; the slope a is chosen at random.
- **Share**: the value f(i) given to member i. Member IDs start at 1 because f(0) is the secret itself.
- **Why one share is not enough**: for every candidate k there is a slope that makes the line pass through (1, 10), so the share fits every k.
- **Why two are enough**: two points determine one line, and the line determines f(0).
- **Finite field 𝔽ᵣ**: the numbers 0 to r − 1 with addition and multiplication modulo r, the BLS12-381 group order. With a uniformly random slope in 𝔽ᵣ, one share leaves every value of k exactly equally likely. With ordinary integers that statement does not hold exactly, which is why the real scheme uses a field.
