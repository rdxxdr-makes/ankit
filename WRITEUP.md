# How Incomplete Brackets Create Unfair Pairings

## 1. The rule
Single elimination halves the field each round: 16 -> 8 -> 4 -> 2 -> 1. That only works when the number of teams is a power of two (2, 4, 8, 16, 32...). Every round must pair up **completely** before the next begins. This simulator enforces that rule: a round locks only when every match is paired and predicted.

## 2. What goes wrong with an incomplete bracket
If the field is not a power of two (say 6, 11 or 20 teams), somebody has no opponent. Organisers usually fix this with **byes**: some teams skip round 1. The bracket is then padded to the next power of two (6 -> 8 slots, so 2 byes). This creates three unfairness problems.

1. **Unequal workload.** A bye team needs fewer wins to become champion. With 6 teams, seeds 1 and 2 need 2 wins; seeds 3-6 need 3.
2. **Unequal title odds, even with equal skill.** Each extra win is another chance to be eliminated. Assuming every match is a 50/50 coin flip (6 teams): bye teams win the title 25% of the time (0.5 x 0.5); the other four win 12.5% (0.5 x 0.5 x 0.5). Fair would be 16.7% each. The bye is worth about 2x title odds.
3. **Distorted pairings.** Byes are normally given to top seeds, so the strongest teams avoid early contests while the weakest face the toughest path, and some matchups never occur in round 1. If byes are drawn at random instead, luck rather than merit decides who gets the shortcut. Either way, results stop measuring only skill, and predictors can exploit the bracket shape rather than team strength.

## 3. How the project demonstrates it
- **Game (index.html / script.js):** accepts only 4, 8, 16, 32 teams and refuses to advance until the round is fully paired and picked.
- **Incomplete Bracket Lab:** runs 20,000 simulations of any size from 3 to 32 with equal-strength teams and charts title odds per seed. Byes show in orange.
- **C program (bracket.c):** same experiment from the command line with more trials, printing exact percentages and matches needed.

## 4. Possible fixes
- Use only complete sizes (play-in/qualifier round to cut to 8, 16...).
- Run a play-in round among the lowest seeds so the byes are earned.
- Use double elimination or round robin, which reduce the cost of a single unlucky match.
- Randomise bye assignment openly and disclose it, if byes are unavoidable.

## 5. Conclusion
A bracket is fair only when every team faces the same number of rounds. Incomplete brackets break that symmetry, so the winner partly reflects the draw rather than performance.
