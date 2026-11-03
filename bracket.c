/* bracket.c - Monte Carlo fairness check for single-elimination brackets.
 * Build:  gcc -O2 -o bracket bracket.c
 * Usage:  ./bracket [teams=6] [trials=200000]
 * All teams have EQUAL strength, so any unequal title odds come only from bracket shape.
 */
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define MAXP 64

static int is_pow2(int n){ return n >= 2 && (n & (n - 1)) == 0; }

/* Standard seeding order: 1 meets lowest seed, top seeds meet late. */
static void seed_order(int p, int *o){
    int len = 1; o[0] = 1;
    while (len < p){
        int l = len * 2 + 1;
        for (int i = len - 1; i >= 0; i--){ o[2*i + 1] = l - o[i]; o[2*i] = o[i]; }
        len *= 2;
    }
}

int main(int argc, char **argv){
    int n = argc > 1 ? atoi(argv[1]) : 6;
    long trials = argc > 2 ? atol(argv[2]) : 200000;
    if (n < 3 || n > 32){ fprintf(stderr, "teams must be 3..32\n"); return 1; }

    int p = 1; while (p < n) p *= 2;
    int order[MAXP], cur[MAXP], nxt[MAXP];
    long wins[MAXP + 1] = {0};
    seed_order(p, order);
    srand((unsigned)time(NULL));

    for (long t = 0; t < trials; t++){
        int len = p;
        for (int i = 0; i < p; i++) cur[i] = order[i] <= n ? order[i] : 0; /* 0 = bye slot */
        while (len > 1){
            for (int i = 0; i < len; i += 2){
                int a = cur[i], b = cur[i+1];
                nxt[i/2] = !a ? b : !b ? a : (rand() & 1 ? a : b);
            }
            len /= 2;
            for (int i = 0; i < len; i++) cur[i] = nxt[i];
        }
        wins[cur[0]]++;
    }

    printf("Teams: %d  Bracket slots: %d  Byes: %d  Complete pairing: %s\n",
           n, p, p - n, is_pow2(n) ? "YES" : "NO");
    printf("Fair share per team: %.2f%%\n\n", 100.0 / n);
    printf("Seed  Title%%   Matches needed\n");
    for (int s = 1; s <= n; s++){
        int rounds = 0; for (int q = p; q > 1; q /= 2) rounds++;
        int bye = (s <= p - n);
        printf("%4d  %6.2f%%  %d%s\n", s, 100.0 * wins[s] / trials, bye ? rounds - 1 : rounds, bye ? "  (bye)" : "");
    }
    return 0;
}
