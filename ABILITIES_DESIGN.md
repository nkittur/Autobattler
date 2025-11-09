# 🎮 Mech Autobattler - Ability System Design

## Core Design Principles
1. **Meaningful Choices**: Every ability should enable different playstyles
2. **Synergy Depth**: Abilities combo in non-obvious ways
3. **Risk/Reward**: Powerful effects have meaningful drawbacks
4. **Build Diversity**: No single "best" build
5. **Tier Cost Balance**: Stronger abilities cost more tier points

---

## 🔥 DAMAGE ABILITIES (25 ideas)

### Direct Damage Modifiers
1. **Critical Strike** (T2) - 25% chance to deal 2x damage
2. **Precision** (T3) - Ignore 50% of enemy armor
3. **Armor Piercing** (T4) - Ignore ALL enemy armor
4. **Multi-Strike** (T3) - Attack twice per turn, each at 60% damage
5. **Cleave** (T2) - Deal 30% damage to enemy even when you miss
6. **Executioner** (T3) - Deal +100% damage to enemies below 30% HP
7. **First Blood** (T2) - Deal +50% damage on first hit of battle
8. **Rampage** (T4) - Each consecutive hit +20% damage (stacks 3x)

### Conditional Damage
9. **Overcharge** (T5) - +100% damage, take 10% max HP per attack
10. **Glass Cannon** (T4) - +50% damage, -50% armor
11. **Berserker** (T3) - +2% damage per 1% missing HP
12. **Focused Fire** (T3) - -20% damage, but +10% per consecutive hit on same target
13. **Explosive Rounds** (T3) - Deal 20% of damage dealt back to self
14. **Chain Lightning** (T4) - After killing enemy, deal 50% damage to next enemy
15. **Overkill** (T2) - Excess damage on kill becomes shield (max 50)

### Damage Over Time
16. **Plasma Burn** (T2) - Target takes 5 damage per turn for 3 turns
17. **Acid Bath** (T3) - Reduce enemy armor by 2 per turn (permanent)
18. **Hemorrhage** (T3) - Critical hits cause 15 bleed damage over 5 turns
19. **Corrosion** (T4) - Each hit reduces enemy max HP by 2%

### Damage Types & Interactions
20. **Energy Weapon** (T1) - Deals Energy damage (+50% vs shields, -25% vs armor)
21. **Kinetic Weapon** (T1) - Deals Kinetic damage (+50% vs armor, -25% vs shields)
22. **Explosive Weapon** (T2) - Deals Explosive damage (ignores 25% armor AND shields)
23. **EMP Blast** (T3) - Energy damage + disables enemy abilities for 1 turn
24. **Seismic Slam** (T3) - Kinetic damage + reduces enemy speed by 30%
25. **Incendiary** (T2) - Explosive damage + 10 burn damage over 3 turns

---

## 🛡️ DEFENSE ABILITIES (20 ideas)

### Armor & Reduction
26. **Reinforced Plating** (T2) - +50% armor effectiveness
27. **Reactive Armor** (T3) - Reflect 25% of damage taken back to attacker
28. **Ablative Armor** (T2) - First hit each battle deals 50% damage
29. **Adaptive Plating** (T4) - Gain resistance to last damage type taken (50%)
30. **Hardened** (T3) - Reduce all damage by flat 10 (before armor calc)

### Shields & Barriers
31. **Energy Shield** (T3) - Start with 50 shield HP (shield takes damage first)
32. **Shield Regen** (T4) - Regenerate 5 shield per turn (requires Energy Shield)
33. **Overcharged Shields** (T5) - Shield = 2x armor value, no armor protection
34. **Barrier Generator** (T3) - First hit deals 0 damage, then disabled 3 turns
35. **Phase Shield** (T4) - 40% chance to completely avoid damage

### Healing & Regeneration
36. **Regeneration** (T3) - Heal 5 HP per turn
37. **Vampiric** (T4) - Heal for 25% of damage dealt
38. **Nanobots** (T5) - Heal to full HP when below 20% (once per battle)
39. **Combat Repair** (T2) - Heal 3 HP every time you attack
40. **Adaptive Healing** (T3) - Heal 1 HP per 10 armor you have, per turn

### Damage Prevention
41. **Dodge** (T3) - 20% chance to completely avoid attack
42. **Counterstrike** (T3) - When hit, immediately attack back at 50% damage
43. **Retaliation** (T2) - Deal 15 damage to attacker when hit
44. **Brace** (T2) - Reduce damage by 30% but attack at 70% power
45. **Last Stand** (T4) - Cannot be reduced below 1 HP (once per battle)

---

## ⚡ SPEED & INITIATIVE (15 ideas)

### Speed Modifiers
46. **Lightweight Frame** (T2) - Weight doesn't affect speed
47. **Overdrive** (T3) - +50 speed, -20% armor
48. **Momentum** (T3) - +5% speed per turn (max +50%)
49. **Quick Deploy** (T2) - Always attack first on turn 1
50. **Sluggish** (T1, negative) - -30 speed, +30% damage

### Turn Manipulation
51. **Double Time** (T5) - Attack twice per turn at full damage
52. **Slow Field** (T3) - Enemy has -30 speed
53. **Time Dilation** (T4) - 30% chance to take 2 turns in a row
54. **Stun Strike** (T4) - 20% chance to stun enemy (skip their turn)
55. **Haste** (T3) - Attack 20% faster (extra partial turn)

### Cooldown & Activation
56. **Charge Attack** (T3) - Every 3rd attack deals +150% damage
57. **Cooldown Reduction** (T4) - All charge abilities activate 1 turn sooner
58. **Burst Fire** (T3) - First 2 attacks deal +50% damage, then -25% rest of battle
59. **Windup** (T2) - Damage +10% per turn (max +100%)
60. **Alpha Strike** (T4) - First attack deals +200% damage, then normal

---

## 💰 ECONOMY & META (15 ideas)

### Salvage Bonuses
61. **Salvager** (T3) - Get 4 salvage options instead of 3
62. **Quality Scrap** (T4) - Salvage is +1 tier higher
63. **Double Salvage** (T5) - Choose 2 salvage items instead of 1
64. **Scavenger** (T2) - 30% chance for bonus random component after battle

### Resource Optimization
65. **Efficient Design** (T3) - This component costs -1 tier point
66. **Lightweight Alloy** (T2) - This component weighs 50% less
67. **Compact** (T2) - This component size is -1 (min 1)
68. **Power Efficient** (T4) - All components cost -1 tier (once per mech)
69. **Overtuned** (T3) - +50% stats, but +2 tier cost

### Battle Rewards
70. **Victory Spoils** (T3) - Gain +10 max HP after each victory
71. **Battle Hardened** (T3) - Gain +2 armor after each victory
72. **Momentum Shift** (T4) - Gain +5 speed after each victory
73. **Learning AI** (T4) - Gain +5% damage after each victory (stacks)
74. **Adaptive Systems** (T3) - After battle, permanently gain 10% resistance to damage type taken most
75. **Experience Core** (T5) - All "gain after victory" effects are doubled

---

## 🎯 CONDITIONAL & COMBO (25 ideas)

### HP-Based Triggers
76. **Adrenaline** (T3) - +50% damage when below 50% HP
77. **Desperation** (T4) - +100% damage when below 25% HP
78. **Healthy** (T2) - +20% armor when above 75% HP
79. **Bleeding Out** (T3) - Lose 5 HP per turn, +30% damage
80. **Pain is Power** (T4) - +1% damage per HP missing

### Hit Streak & Combos
81. **Combo Finisher** (T3) - Every 5th hit deals +300% damage
82. **Chain Attack** (T3) - After critical hit, next attack is guaranteed crit
83. **Rhythm** (T2) - Alternating hit/miss is +30% damage
84. **Snowball** (T4) - Each kill permanently +10% damage this battle
85. **Killstreak** (T3) - Deal +50% damage for 3 turns after a kill

### Element Synergies
86. **Conductor** (T3) - Energy attacks on wet targets deal +100%
87. **Wet** (T2) - Kinetic attacks apply "wet" status
88. **Overload** (T4) - Having 3+ Energy components: all deal +50%
89. **Ballistic Synergy** (T3) - Having 3+ Kinetic components: ignore 30% armor
90. **Demolition Expert** (T4) - Having 3+ Explosive components: +40% damage

### Status Effect Synergies
91. **Exploit Weakness** (T3) - +50% damage to burning targets
92. **Crippling Blow** (T3) - +50% damage to slowed targets
93. **Finishing Strike** (T4) - +100% damage to stunned targets
94. **Assassin** (T4) - Deal +200% damage to targets with DoT effects
95. **Toxic Synergy** (T3) - Poison damage +5 per stack on target

### Complex Interactions
96. **Shield Burst** (T4) - When shields break, deal damage equal to lost shields
97. **Armor Shred** (T3) - Your damage reduces enemy armor permanently by 10%
98. **Speed Demon** (T5) - Convert excess speed over 100 to +1% damage each
99. **Heavy Hitter** (T4) - Convert weight over 100 to +5 damage per 10 weight
100. **Tech Synergy** (T4) - +10% all stats per "System" component equipped

---

## 🎲 UNIQUE MECHANICS (20 ideas)

### Risk/Reward Gambles
101. **All or Nothing** (T5) - 50% miss chance, 50% triple damage
102. **Unstable Core** (T4) - 10% chance to deal 500 damage to both
103. **Reckless** (T3) - +40% damage, take +20% more damage
104. **High Stakes** (T4) - Each attack: flip coin. Win = +100% damage, Lose = 0 damage
105. **Russian Roulette** (T5) - 1/6 chance instant kill enemy, 1/6 lose 50% HP

### Transformation & Modes
106. **Siege Mode** (T4) - Toggle: +50% damage, -50% speed, +30% armor
107. **Flight Mode** (T3) - Toggle: +40% speed, -20% armor, -20% damage
108. **Berserker Mode** (T5) - Activate at <30% HP: +100% damage, +50% speed, lose 5 HP/turn
109. **Overcharge Mode** (T4) - Once per battle: +100% all stats for 3 turns, then 50% stats for 2 turns
110. **Emergency Repair** (T3) - Once per battle: Heal 50% HP, disabled for 2 turns

### Resource Systems
111. **Heat Sink** (T3) - Attacks generate heat (max 100). At 100, skip turn. -20 heat per turn idle
112. **Energy Battery** (T4) - Start with 100 energy. Abilities cost energy. +10 per turn
113. **Ammunition** (T3) - 10 shots. +200% damage. After, -50% damage (kinetic only)
114. **Overload Vents** (T4) - Every 10 damage dealt to you releases 30 damage explosion
115. **Shield Capacitor** (T3) - Store 20% of blocked damage, release as bonus attack

### Unique Triggers
116. **Revenge** (T3) - Deal +5% damage per % HP lost this battle
117. **Guardian Angel** (T5) - First time you'd die, heal to 50% instead
118. **Sacrifice** (T4) - On kill, lose 20% max HP, gain +50% damage permanently
119. **Soul Harvest** (T3) - On kill, heal to full HP (once per battle)
120. **Phoenix Protocol** (T5) - On death, resurrect with 30% HP, +50% damage (once)

---

## 🏆 SET BONUSES (15 ideas)

### Weapon Sets
**Energy Weapon Set** (2/3/4 pieces)
- 2pc: +20% Energy damage
- 3pc: Energy attacks have 20% crit chance
- 4pc: Energy attacks chain to deal 50% damage again

**Kinetic Weapon Set** (2/3/4 pieces)
- 2pc: +15% Kinetic damage, +10 armor penetration
- 3pc: Kinetic attacks reduce enemy speed by 10
- 4pc: Kinetic attacks have 25% chance to stun for 1 turn

**Explosive Weapon Set** (2/3/4 pieces)
- 2pc: +25% Explosive damage
- 3pc: Explosions have +1 range (future: AoE)
- 4pc: Enemies hit by explosions take 10 damage per turn for 5 turns

### Armor Sets
**Heavy Armor Set** (2/3 pieces)
- 2pc: +30 armor
- 3pc: Reduce all damage by additional 15 flat

**Reactive Armor Set** (2/3 pieces)
- 2pc: Reflect 15% damage taken
- 3pc: When hit, 25% chance to counterattack

**Shield Generator Set** (2/3 pieces)
- 2pc: Start with 40 shields
- 3pc: Regenerate 8 shields per turn

### System Sets
**Tactical System Set** (2/3/4 pieces)
- 2pc: +20% speed
- 3pc: 15% dodge chance
- 4pc: First attack each turn is guaranteed critical

**Support System Set** (2/3 pieces)
- 2pc: Heal 5 HP per turn
- 3pc: Gain +2 armor per turn (max +30)

**Overcharge System Set** (2/3 pieces)
- 2pc: +30% all damage
- 3pc: +50 speed, abilities activate 1 turn sooner

### Mixed Sets
**Balanced Warrior Set** (1 weapon, 1 armor, 1 system)
- 3pc: +15% all stats (damage, armor, speed)

**Glass Cannon Set** (3+ weapons)
- 3pc: +60% damage, -40% armor

**Fortress Set** (3+ armor pieces)
- 3pc: +80% armor, -30% damage, immune to DoT

**Speed Demon Set** (3+ lightweight/speed items)
- 3pc: +80 speed, attack twice per turn

---

## 🎭 MECH TRAITS (Every 5 Rounds) - 30 Ideas

### Offensive Traits
1. **BERSERKER** (T4) - Gain +3% damage per 1% HP missing
2. **CRITICAL CORE** (T3) - All attacks have +30% crit chance, crits deal 3x damage
3. **MULTI-WEAPON** (T4) - Attack with all equipped weapons simultaneously
4. **OVERCHARGED** (T5) - +100% damage, lose 8% max HP per turn
5. **EXECUTIONER** (T3) - Enemies below 40% HP take double damage
6. **ALPHA PREDATOR** (T4) - +100% damage on first attack, +20% each turn after

### Defensive Traits
7. **FORTRESS** (T4) - Armor increased by 100%, speed reduced by 50%
8. **REGENERATOR** (T4) - Regenerate 8% max HP per turn
9. **SHIELDED** (T5) - Convert all armor to regenerating shields (1:2 ratio)
10. **IMMORTAL** (T5) - Cannot drop below 1 HP until turn 10
11. **ADAPTIVE** (T4) - Take 50% less from each damage type after first hit
12. **COUNTERSTRIKE** (T3) - Automatically attack back when hit (75% damage)

### Speed & Utility Traits
13. **LIGHTNING FAST** (T4) - Weight doesn't affect speed, +50 base speed
14. **TIME MASTER** (T5) - 40% chance to take 2 consecutive turns
15. **FIRST STRIKE** (T3) - Always go first, +50% damage on opening attack
16. **PERSISTENT** (T3) - +30 speed, DoT effects last 2x longer
17. **EVASIVE** (T4) - 35% dodge chance, +40 speed

### Economy Traits
18. **SALVAGE MASTER** (T4) - Choose 2 salvage items, get 4 options
19. **EFFICIENT** (T5) - All components cost -2 tier points (min 1)
20. **OVERBUILT** (T3) - +50% tier capacity, +50% weight capacity
21. **RECYCLER** (T4) - After battle, random component gains +1 tier (better stats)
22. **HOARDER** (T3) - +3 inventory slots shown in salvage

### Synergy-Focused Traits
23. **ENERGY MASTER** (T4) - All Energy damage +100%, Energy components cost -1 tier
24. **KINETIC MASTER** (T4) - All Kinetic damage +100%, ignore 50% armor
25. **DEMOLITION** (T4) - All Explosive damage +100%, explosions heal you 20%
26. **SET SPECIALIST** (T5) - Set bonuses activate 1 piece earlier, doubled
27. **COMBO ARTIST** (T4) - All combo/streak bonuses doubled
28. **STATUS MASTER** (T4) - All DoT and debuffs deal double, last double

### Unique Mechanics Traits
29. **VAMPIRE** (T5) - Heal for 40% damage dealt, -30% armor
30. **PHOENIX** (T5) - On death, resurrect at 50% HP with +80% damage (once)
31. **GAMBLING MAN** (T4) - All random chances improved by 15% (absolute)
32. **MOMENTUM** (T4) - Gain +10% all stats per victory (resets on loss, stacks infinitely)
33. **SACRIFICE** (T5) - Start at 50% HP, +150% damage
34. **ENRAGE** (T4) - When hit, gain +20% damage for rest of battle (stacks)
35. **TECH LORD** (T5) - System components give +20% to all stats

---

## 💎 IMPLEMENTATION PRIORITY

### Phase 1 - Core Abilities (Implementing Now)
- Basic damage types (Energy, Kinetic, Explosive)
- Critical strike mechanics
- Vampiric/Lifesteal
- DoT effects (Burn, Bleed)
- Shield systems
- Set bonuses for 3+ same type
- 10 mech traits

### Phase 2 - Advanced Synergies
- Complex combos
- Status effect interactions
- Resource systems (heat, energy, ammo)
- Transformation modes
- Advanced set bonuses

### Phase 3 - Polish
- All 35 mech traits
- Unique legendary components
- Achievement synergies
- Visual effect indicators

---

## 🎯 TIER COST GUIDELINES

**Tier 1** (1 point): Basic stats, minor bonuses (+10-20%)
**Tier 2** (2 points): Good bonuses (+20-40%), simple abilities
**Tier 3** (3 points): Strong abilities (+40-60%), synergies, DoT
**Tier 4** (4 points): Very strong (+60-100%), combo mechanics, powerful sets
**Tier 5** (5+ points): Game-changing abilities, transformations, resurrections

**Balance Rule**: Power should be roughly linear with tier cost, but synergies can make combinations exponentially powerful.

---

**Total Ideas: 135+**
**Focus: Build diversity, meaningful choices, "bad" abilities that become amazing with synergies**
