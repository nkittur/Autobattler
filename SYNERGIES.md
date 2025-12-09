# Synergy Design Document

A comprehensive analysis of synergy patterns from successful roguelikes, deckbuilders, and autobattlers, with concrete implementation ideas for this mech autobattler.

---

## 1. MULTIPLICATIVE SCALING (The "Shiv" Pattern)

**Source:** Slay the Spire (Shivs + Accuracy), Balatro (mult vs chips)

**Core Concept:** Low base damage + many hits = flat damage bonuses become multiplicative.

### Examples from Games:
- **Slay the Spire:** Shiv does 4 damage. With Accuracy (+4 to shivs), each shiv does 8 damage. Play 5 shivs = 40 damage instead of 20. That's +4 damage becoming +20.
- **Balatro:** A joker that gives +4 mult seems weak. But with 3x multiplier chain, it becomes +12 effective chips.

### Implementation Ideas:
```
PULSE LASER: 1 damage x 5 shots = 5 total
+ TARGETING LINK (+2 flat damage): 3 damage x 5 shots = 15 total (3x multiplier!)
+ FIRE CONTROL (+2 more shots): 3 damage x 7 shots = 21 total

MACHINE GUN: 2 damage x 8 shots = 16 total
+ AMMO HOPPER (+1 damage): 3 damage x 8 shots = 24 total (+8 from +1!)
+ OVERCLOCKED BARREL (+3 shots): 3 damage x 11 shots = 33 total
```

**Key Items to Add:**
- Weapons with many low-damage hits (shotguns, burst fire, swarm missiles)
- Flat damage boosters that work per-hit
- Shot count increasers

---

## 2. THRESHOLD/BREAKPOINT SYNERGIES (The "Traits" Pattern)

**Source:** TFT/Autobattlers (2/4/6 trait bonuses), Slay the Spire (Catalyst doubling)

**Core Concept:** Collecting enough of something triggers a massive bonus.

### Examples from Games:
- **TFT:** 2 Assassins = +10% crit. 4 Assassins = +30% crit AND bonus crit damage. The jump from 3→4 is huge.
- **Monster Train:** Reform costs 2 Ember normally. With Wickless Baron, Reform costs 0 if you have 3+ burnout units.

### Implementation Ideas:
```
ENERGY WEAPONS TRAIT:
- 1 energy weapon: No bonus
- 2 energy weapons: +20% energy damage
- 3 energy weapons: +20% damage AND shots pierce armor
- 4 energy weapons: +50% damage, pierce, AND chain to nearby enemies

HEAVY CHASSIS TRAIT:
- 2 heavy items: +10 armor
- 4 heavy items: +10 armor, +25% HP, immune to knockback
- 6 heavy items: FORTRESS MODE - take 50% damage but can't move
```

**Key Design:** The last breakpoint should feel BROKEN. Players should actively chase it.

---

## 3. CONVERSION SYNERGIES (The "Body Slam" Pattern)

**Source:** Slay the Spire (Body Slam, Perfected Strike), MTG (Hatred, Channel)

**Core Concept:** Convert one resource into another at favorable rates.

### Examples from Games:
- **Slay the Spire:** Body Slam deals damage equal to your Block. Barricade makes Block persist. Entrench doubles your Block. Suddenly you have 200 block = 200 damage attack.
- **MTG:** Channel converts life to mana at 1:1. Fireball converts mana to damage. Life becomes damage.

### Implementation Ideas:
```
KINETIC CONVERTER: Your armor becomes bonus damage (1:1)
- Light Plating (10 armor) = +10 damage
- Stack armor items, then convert to burst damage

HEAT SINK OVERLOAD: Convert accumulated heat into damage burst
- Each point of heat = 5 damage when triggered
- Synergizes with weapons that generate lots of heat

REACTOR OVERCHARGE: Sacrifice energy capacity for damage
- -1 max energy = +15% damage this battle
- Risk/reward: Will you have enough energy for abilities?

SCRAP RECYCLER: Destroyed armor becomes temporary damage boost
- When armor breaks, gain +50% of lost armor as damage for 3 turns
```

---

## 4. EXPONENTIAL GROWTH (The "Poison" Pattern)

**Source:** Slay the Spire (Poison), Monster Train (Rage), Balatro (scaling jokers)

**Core Concept:** Effects that compound over time, becoming overwhelming if unchecked.

### Examples from Games:
- **Slay the Spire:** Noxious Fumes adds 2 poison per turn. Turn 1: 2. Turn 5: 10. Turn 10: 20 poison PER TURN, dealing 20+19+18... = 210 total.
- **Monster Train:** Rage stacks. Unit starts at 10 damage. After 5 attacks with +5 rage each: 10+15+20+25+30 = 100 damage.

### Implementation Ideas:
```
CORROSIVE ROUNDS: Each hit applies 1 Corrosion
- Corrosion: At end of turn, deal damage equal to stacks, then add 1 stack
- Turn 1: 1 damage, Turn 5: 15 cumulative damage, Turn 10: 55 cumulative

MOMENTUM CORE: +5% damage per round of combat (stacks)
- Round 1: Base damage
- Round 5: +25% damage
- Round 10: +50% damage
- Rewards surviving longer

ADAPTIVE TARGETING: +10% accuracy per miss (resets on hit)
- Miss 3 times? Next shot has +30% accuracy
- Eventually guarantees hits

BERSERKER PROTOCOL: +15% damage each time you take damage
- Synergizes with low-armor builds
- Risk: Die fast or become unstoppable
```

---

## 5. ON-TRIGGER CHAINS (The "Whenever" Pattern)

**Source:** MTG (Landfall, ETB), Slay the Spire (After Image), Monster Train (Incant)

**Core Concept:** "Whenever X happens, do Y" - then find ways to make X happen many times.

### Examples from Games:
- **MTG:** "Whenever a creature enters, deal 1 damage" + Token generation = machine gun
- **Monster Train:** Incant triggers "when you play a spell." Add spell-cost reducers, draw more spells, each spell triggers 3+ incant effects.

### Implementation Ideas:
```
OVERWATCH PROTOCOL: "Whenever an enemy attacks, your weapons deal 2 bonus damage"
- Synergizes with fast-firing enemies (more attacks = more triggers)
- Stack multiple Overwatch effects

REACTIVE PLATING: "Whenever you take damage, reflect 3 damage"
- Against many small hits = massive reflected damage
- Synergizes with high armor (survive to reflect more)

SALVAGE DRONE: "Whenever you destroy an enemy weapon, gain +1 permanent damage"
- Snowballs over the run
- Encourages targeting weapons first

CHAIN LIGHTNING NODE: "Whenever you deal energy damage, 30% chance to deal 5 to another enemy"
- Multi-hit energy weapons trigger multiple checks
- Pulse laser (5 hits) = 5 chances to chain
```

---

## 6. ENABLE/PAYOFF PAIRS (The "Build Around" Pattern)

**Source:** MTG (Tribal lords), Slay the Spire (Kunai + Shuriken), Balatro (Joker combos)

**Core Concept:** Some cards are weak alone but broken when paired.

### Examples from Games:
- **Slay the Spire:** Kunai (+1 Dex when you play 3 attacks) + Shuriken (+1 Str when you play 3 attacks) + attack spam = exponential scaling
- **Balatro:** "Blueprint" copies the joker to its right. Alone: useless. With strong joker: doubles everything.

### Implementation Ideas:
```
ENABLER: AMMO FABRICATOR
- "Your ballistic weapons have unlimited ammo but deal -50% damage"
- Alone: Terrible
- With VOLUME FIRE COMPUTER: "+5% damage per shot fired this combat"
- Result: Fire 100 shots, each at +500% damage by end

ENABLER: TARGETING UPLINK
- "Share targeting data: All weapons gain accuracy of your most accurate weapon"
- Alone: Minor benefit
- With SNIPER SCOPE (+50% accuracy): All weapons get +50% accuracy

PAYOFF: RESONANCE AMPLIFIER
- "Deal +100% damage to enemies affected by 3+ status effects"
- Need: Burn + Corrode + Slow sources
- When assembled: DOUBLE DAMAGE to everything
```

---

## 7. RISK/REWARD TRADEOFFS (The "Glass Cannon" Pattern)

**Source:** Slay the Spire (Runic Dome, Cursed Key), Monster Train (Wickless builds)

**Core Concept:** Accept a downside for an outsized upside.

### Examples from Games:
- **Slay the Spire:** Runic Dome gives +1 energy but you can't see enemy intents. Huge power if you can handle the risk.
- **Monster Train:** Wickless Baron: Units with Burnout cost 0... but they die after a few turns.

### Implementation Ideas:
```
GLASS CANNON CHASSIS:
- +100% damage dealt
- +100% damage taken
- For aggressive players who trust their offense

EXPERIMENTAL REACTOR:
- +5 energy capacity
- 10% chance to explode each round (instant death)
- High energy builds become viable but risky

BERSERKER CHIP:
- +10% damage for each 10% HP missing
- At 10% HP: +90% damage bonus
- Risk: One hit kills you

OVERCLOCKED WEAPONS:
- +50% fire rate
- Each shot has 5% chance to jam (weapon disabled 1 round)
- Worth it for burst damage windows
```

---

## 8. POSITIONING/TIMING SYNERGIES (The "Setup" Pattern)

**Source:** Autobattlers (positioning), Card games (order of play)

**Core Concept:** The same pieces perform differently based on arrangement or sequence.

### Implementation Ideas:
```
FLANKING BONUS:
- Weapons deal +25% damage if attacking from the side
- Need mobility items to enable repositioning

ALPHA STRIKE PROTOCOL:
- First attack each combat deals 3x damage
- Synergizes with slow, heavy weapons (railgun)
- Anti-synergy with fast weapons

MOMENTUM TRANSFER:
- When a projectile hits, next projectile deals +20% damage
- Optimal: Alternate between weapons to maximize
- Order of weapon firing matters!

KILLSTREAK PROTOCOL:
- Each kill this round: +50% damage
- Overkill matters: Positioning to chain kills
```

---

## 9. ECONOMY MANIPULATION (The "Econ" Pattern)

**Source:** TFT (interest), Slay the Spire (gold relics), Balatro (money jokers)

**Core Concept:** Breaking normal resource rules for compounding advantage.

### Examples from Games:
- **TFT:** Save 50 gold = +5 gold/round. Over 10 rounds = +50 free gold.
- **Slay the Spire:** Courier relic: Card rewards cost gold but you pick from 5 instead of 3. Information = power.

### Implementation Ideas:
```
INVESTMENT PROTOCOL:
- Skip salvage: Gain gold equal to best item's tier x3
- Sometimes cash is better than items

LOAN SHARK MODULE:
- Start each battle with +10 gold
- At round 10, lose 50 gold (or take damage if you can't pay)
- Tempo vs late game

SALVAGE EFFICIENCY:
- Salvage gives 2 items instead of 1
- But all salvaged items are -1 tier
- Quantity vs quality

MARKET MANIPULATION:
- See shop items before deciding to buy
- Choose to refresh for free once
- Information is power
```

---

## 10. TRIBAL/TAG SYNERGIES (The "Type Matters" Pattern)

**Source:** MTG (tribal), TFT (origins/classes), Balatro (suits)

**Core Concept:** Having enough of a type unlocks extra power.

### Implementation Ideas:
```
ENERGY SPECIALIST:
- "Your mech counts as having +1 energy weapon for trait purposes"
- Easier to hit breakpoints

HYBRID DOCTRINE:
- "If you have exactly 1 of each damage type, all weapons deal +30%"
- Rewards diverse builds

RAILGUN MASTERY:
- "Each railgun you have increases all railgun damage by 25%"
- 1 railgun: +25%
- 2 railguns: Each gets +50%
- 3 railguns: Each gets +75% (multiplicative insanity)

ADAPTIVE CHASSIS:
- "Gain the 2-piece bonus of all weapon types you have at least 1 of"
- Generalist enabler
```

---

## TOP IMPLEMENTATION PRIORITIES (Low-Hanging Fruit)

### Tier 1: Implement Immediately
1. **Multi-hit weapons** (Pulse Laser, Shotgun, Swarm Missiles) - enables flat damage multiplication
2. **Flat damage boosters** (Targeting Link, Ammo Hopper) - the multipliers
3. **Simple trait breakpoints** (2/3/4 of a type = bonus) - already have tags, just need bonuses

### Tier 2: Implement Soon
4. **Conversion items** (Armor → Damage, Heat → Burst)
5. **On-hit triggers** (Whenever you hit, X% chance to Y)
6. **Risk/reward chassis options** (Glass Cannon mode)

### Tier 3: Implement Later
7. **Exponential scaling** (Stacking buffs over combat)
8. **Complex combos** (3+ piece synergies)
9. **Economy manipulation** (Gold/interest strategies)

---

## CONCRETE ITEM DESIGNS

### Multi-Hit Weapons
```javascript
pulse_laser: { damage: 1, shots: 5 }      // 5 damage base, but +2 flat = 15
scatter_cannon: { damage: 2, shots: 6 }   // Shotgun pattern
swarm_missiles: { damage: 3, shots: 4 }   // Tracking micro-missiles
chain_gun: { damage: 1, shots: 10 }       // Maximum flat damage scaling
```

### Flat Damage Boosters
```javascript
targeting_link: { flatDamage: +2 }        // Per hit!
ammo_hopper: { flatDamage: +1, shots: +2 }
overcharge_capacitor: { flatDamage: +3, selfDamage: 5 }
```

### Trait Breakpoints
```javascript
ENERGY_TRAIT: {
  2: { energyDamage: +20% },
  3: { energyDamage: +20%, ignoreArmor: 50% },
  4: { energyDamage: +50%, ignoreArmor: 100%, chainDamage: true }
}
```

### Conversion Items
```javascript
kinetic_converter: {
  effect: "Deal bonus damage equal to your armor rating",
  synergy: "Stack armor, then convert to offense"
}
```

---

## SUCCESS METRICS

A synergy system is working when players say:
1. "I need ONE more energy weapon for the 4-piece!"
2. "This item is trash... unless I find a Targeting Link"
3. "Do I go glass cannon or play it safe?"
4. "I just did 500 damage in one turn!" (from careful setup)
5. "I lost but I see what I should have done differently"
