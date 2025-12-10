# Balance Documentation

This document tracks balance analysis, changes, and design rationale for the autobattler.

---

## Exchange Rate System

All items are balanced against a common "budget" system where grid cells translate to stats.

### Core Exchange Rates (1 square = X)
| Stat | Rate | Notes |
|------|------|-------|
| Damage | 1 | Primary combat stat |
| Weight | -1 | Cost (uses weight capacity) |
| Energy Cost | -0.5 | Cost (1 energy = 2 budget) |
| Energy Provided | 1 | For reactors |
| Armor/DR | 1 | Damage reduction |
| Knockback | 5 | Secondary combat stat |
| Projectile Speed | 8 | Minor stat |
| Heat Capacity | 8 | Minor stat |
| Energy Reduction | 0.3 | For cooling items |
| Accuracy | 4 | 4% per square |

### Conversion Rates (for trade-offs)
| Conversion | Rate | Example |
|------------|------|---------|
| Weight → Damage | 1:1 | 1 weight pays for 1 damage |
| Energy → Damage | 1:2 | 1 energy pays for 2 damage |
| Accuracy → Damage | 1%:0.3 | |

### Shape Bonuses
| Condition | Bonus |
|-----------|-------|
| Length 4 | +1 square |
| Length 5 | +3 squares |
| Length 6 | +6 squares |
| Aspect 4:1 | +1 square |
| Aspect 5:1 | +2 squares |
| Aspect 6:1 | +3 squares |

---

## Weapons

### Single-Shot Weapons (Balanced)

| Weapon | Cells | Shape | Weight | Energy | Cost | DPR | DPR/cell | KB | Role |
|--------|-------|-------|--------|--------|------|-----|----------|-----|------|
| **Railgun** | 4 | 1x4 | 2 | 1 | 4 | 5 | 1.25 | 25 | High KB, precision |
| **Laser** | 2 | 2x1 | 1 | 2 | 5 | 4 | 2.0 | 5 | Compact, efficient |

**Design Notes:**
- Railgun: Long awkward shape, but highest knockback (25). Light weight (2) makes it easy to equip.
- Laser: Most space-efficient (2.0 DPR/cell), but energy-hungry. Best for tight builds.

### Multi-Hit Missiles (Synergy Weapons)

Formula: **1 shot per 2 cells**, damage 1 per shot

| Weapon | Cells | Shape | Weight | Energy | Cost | DPR | DPR/cell | With +2 bonus |
|--------|-------|-------|--------|--------|------|-----|----------|---------------|
| **Missile** | 4 | 2x2 | 1 | 0 | 1 | 1×2=2 | 0.5 | 3×2=6 (1.5) |
| **Swarm** | 6 | 2x3 | 1 | 0 | 1 | 1×3=3 | 0.5 | 3×3=9 (1.5) |

**Design Notes:**
- Missiles are intentionally weak alone (0.5 DPR/cell)
- They're cheap to equip (weight 1, energy 0)
- With +2 flat damage bonus, they TRIPLE their output
- This creates a "synergy payoff" archetype

### Multi-Hit Ballistic/Energy Weapons

| Weapon | Cells | Weight | Energy | Cost | Shots | DPR | With +2 | Notes |
|--------|-------|--------|--------|------|-------|-----|---------|-------|
| **Machinegun** | 3 | 1 | 0 | 4 | 2 | 1×2=2 | 3×2=6 | Cheap entry multi-hit |
| **Minigun** | 4 | 2 | 1 | 8 | 8 | 1×8=8 | 3×8=24 | Max synergy potential |
| **Pulse Laser** | 3 | 1 | 2 | 8 | 5 | 1×5=5 | 3×5=15 | Energy multi-hit |

### ✓ BALANCED: Multi-Hit Weapons

**Design:** Multi-hit weapons have FIXED damage (no level/rarity scaling) because:
- Flat damage bonuses multiply with shot count
- Damage scaling would make them exponentially OP at higher levels
- Their value comes from synergy, not raw stats

| Weapon | Cost | Base DPR | Efficiency | With Target Hub (+2) |
|--------|------|----------|------------|----------------------|
| Machinegun | 4 | 2 | 50% | 6 (150%) |
| Minigun | 8 | 8 | 100% | 24 (300%) |
| Pulse Laser | 8 | 5 | 63% | 15 (188%) |

**Intended play pattern:**
- Multi-hit weapons are weak alone
- Pair with Targeting Hub/Amplifier for massive damage multiplication
- DR armor hard-counters multi-hit (2 DR = -16 damage vs Minigun!)

---

## Armor

**Exchange Rates:**
- 1 square = 1 DR
- 1 square = 2.5 HP
- Total Cost = Cells + Weight + Energy×2

| Item | Cells | Weight | Energy | Cost | Effect | Value | Efficiency | Notes |
|------|-------|--------|--------|------|--------|-------|------------|-------|
| **Ballistic Plating** | 3 | 0 | 0 | 3 | 2 DR | 2 | 67% | L-shape, vs ballistic |
| **Reactive Plating** | 3 | 0 | 1 | 5 | 3 DR | 3 | 60% | L-shape, best DR |
| **Hull Armor** | 3 | 1 | 0 | 4 | 10 HP | 4 | **100%** | Raw HP boost |
| **Heavy Hull** | 4 | 2 | 0 | 6 | 15 HP | 6 | **100%** | Best HP item |
| **Energy Shield** | 4 | 1 | 1 | 7 | 10 Shield | 4 | 57% | vs energy weapons |

### ✓ BALANCED: HP Items

Hull Armor and Heavy Hull are exactly 100% efficient using the 2.5 HP = 1 square exchange rate.

### Design Note: DR Items

DR items are intentionally 60-67% efficient by raw numbers because:
- 1 DR blocks 1 damage PER HIT
- Against 8-shot Chain Gun: 2 DR blocks 16 damage per round!
- This creates a counter-meta: DR counters multi-hit builds

---

## Reactors

| Item | Cells | Weight | Energy Provided | Heat Cap | Energy/cell |
|------|-------|--------|-----------------|----------|-------------|
| **Reactor** | 4 | 2 | 3 | 15 | 0.75 |
| **Power Cell** | 3 | 1 | 2 | 10 | 0.67 |
| **Capacitor** | 4 | 1 | 2 (+1 adj) | - | 0.5+ |

Exchange rate: 1 square = 1 energy provided

### ⚠️ BALANCE ISSUES: Reactors

**Problem:** All reactors provide less energy than their cell count suggests.

| Reactor | Cells | Expected Energy | Actual | Efficiency |
|---------|-------|-----------------|--------|------------|
| Reactor | 4 | 4 | 3 | 75% |
| Power Cell | 3 | 3 | 2 | 67% |
| Capacitor | 4 | 4 | 2 | 50% |

**Rationale:** Weight costs eat into budget.
- Reactor: 4 cells - 2 weight = 2 net, but provides 3 (+heat) ✓
- Power Cell: 3 cells - 1 weight = 2 net, provides 2 ✓

**Verdict:** Actually balanced when accounting for weight! Heat capacity is bonus.

---

## Systems

**Exchange Rates:**
- +1 damage (1 direction) = 1 square
- +1 damage (all directions) = 2 squares
- Total Cost = Cells + Weight + Energy×2

| Item | Cells | Weight | Energy | Cost | Effect | Value | Efficiency | Notes |
|------|-------|--------|--------|------|--------|-------|------------|-------|
| **Targeting Link** | 2 | 0 | 0 | 2 | +1 dmg (1 dir) | 1 | 50% | Directional only |
| **Targeting Hub** | 5 | 1 | 1 | 8 | +2 dmg (all) | 4 | 50% | Plus shape |
| **Weapon Amplifier** | 3 | 1 | 1 | 6 | +1 dmg (all) | 2 | 33% | Vertical bar |
| **Gyro** | 4 | 1 | 1 | 7 | +8% accuracy | 2 | 29% | |
| **Armor Linkage** | 4 | 1 | 1 | 7 | +1 armor (adj) | 2 | 29% | |

### Design Note: Targeting Systems

Targeting systems have intentionally low raw efficiency (33-50%) because:
- Their value is MULTIPLICATIVE with multi-hit weapons
- Targeting Hub + Chain Gun (8 shots): +2×8 = +16 effective damage
- Raw efficiency doesn't capture synergy value

| Synergy Example | Base DPR | With Target Hub | Effective Value |
|-----------------|----------|-----------------|-----------------|
| Chain Gun (8 shots) | 8 | 8 + 16 = 24 | +16 from +2 bonus |
| Pulse Laser (5 shots) | 10 | 10 + 10 = 20 | +10 from +2 bonus |
| Railgun (1 shot) | 5 | 5 + 2 = 7 | +2 from +2 bonus |

The low base efficiency is the "cost" of synergy potential.

---

## Cooling

| Item | Cells | Weight | Energy | Reduction | Red/cell |
|------|-------|--------|--------|-----------|----------|
| **Heat Sink** | 4 | 1 | 0 | 1 | 0.25 |
| **Cooling System** | 6 | 2 | 0 | 2 | 0.33 |

Exchange rate: 1 square = 0.3 energy reduction

### ⚠️ BALANCE ISSUES: Cooling

**Problem:** Both cooling items provide less than expected.

| Item | Cells | Expected (×0.3) | Actual | Efficiency |
|------|-------|-----------------|--------|------------|
| Heat Sink | 4 | 1.2 | 1 | 83% |
| Cooling System | 6 | 1.8 | 2 | 111% |

**Verdict:** Heat Sink slightly weak, Cooling System slightly strong. Close enough.

---

## Budget System v2 (Current)

### Core Principles
1. **Level 1 = Prototype**: Each item template defines prototype stats at level 1 that should balance
2. **Additive Scaling**: Higher levels add flat budget, not multipliers
3. **Proportional Allocation**: Extra budget is distributed proportionally to prototype stats
4. **No Damage Scaling on Multi-Hit**: Weapons with shotsPerRound > 1 don't scale damage

### Master Budget Exchange Rates

| Stat | Budget Cost | Notes |
|------|-------------|-------|
| Cell (in shape) | +1 | Earned |
| Weight | +1 | Earned (compensation) |
| Damage | -1 | Spent |
| Energy Cost | -2 | Spent (1 energy = 2 budget) |
| Damage Reduction | -1 | Spent |
| HP Bonus | -0.4 | Spent (1 budget = 2.5 HP) |
| Energy Provided | -1 | Spent (for reactors) |
| Knockback | -0.2 | Spent (1 budget = 5 KB, doesn't scale!) |
| +1 Dmg (1 direction) | -1 | Spent |
| +1 Dmg (all adjacent) | -3 | Spent |
| Energy Reduction | -1 | Spent |

**Budget Formula:** Budget Earned - Budget Spent ≈ 0 at prototype

---

## Level Scaling

| Level | Level Budget | Notes |
|-------|--------------|-------|
| 1 | 0 | Prototype stats |
| 2 | 1 | +1 budget |
| 5 | 4 | +4 budget |
| 10 | 9 | +9 budget |

**Allocation Rules:**
- Budget distributed proportionally based on prototype stat costs
- Weight can decrease by max 1 (30% chance per upgrade)
- Energy can decrease by max 1 (30% chance per upgrade)
- Multi-hit weapons (shotsPerRound > 1) do NOT gain damage
- Knockback does NOT scale

**Example:** Level 5 Laser (prototype: 4 damage, 2 energy)
- Prototype spend: 4 dmg × 1 + 2 energy × 2 = 8 budget on stats
- Level budget: 4
- 50% of prototype spend is damage → +2 damage
- 50% is energy → no bonus (energy only decreases, max -1)
- Result: 6 damage, 1 energy (if reduction rolled)

---

## Rarity Scaling

### Fixed Budget Per Tier (Not Multipliers!)

| Level Range | Budget per Tier |
|-------------|-----------------|
| 1-5 | +1 per tier |
| 6-10 | +2 per tier |
| 11+ | +3 per tier |

| Rarity | Tier | Budget (Lv1-5) | Budget (Lv6-10) | Budget (Lv11+) |
|--------|------|----------------|-----------------|----------------|
| Common | 0 | +0 | +0 | +0 |
| Uncommon | 1 | +1 | +2 | +3 |
| Rare | 2 | +2 | +4 | +6 |
| Epic | 3 | +3 | +6 | +9 |
| Legendary | 4 | +4 | +8 | +12 |

**Example:** Level 8 Epic Laser
- Level budget: 7 (level - 1)
- Rarity budget: 6 (tier 3 × 2 for level 6-10)
- Total extra budget: 13
- Distributed proportionally to scalable stats

### Power Comparison (vs old system)

| Level | Rarity | Old System | New System | Change |
|-------|--------|------------|------------|--------|
| 5 | Common | Base × 1.0 + 2 | Base + 4 | Linear |
| 5 | Legendary | Base × 2.0 + 2 | Base + 8 | Reduced spike |
| 10 | Common | Base × 1.0 + 4.5 | Base + 9 | Linear |
| 10 | Legendary | Base × 2.0 + 4.5 | Base + 17 | Much more controlled |

---

## Modifier System

### Overview
- **Uncommon+ items only** can have modifiers
- Higher levels = higher chance of getting a modifier
- Modifiers have budget costs (1-3) deducted from item budget
- Higher rarity allows higher-cost modifiers

### Modifier Chance by Level

| Level | Modifier Chance |
|-------|-----------------|
| 1 | 10% |
| 3 | 20% |
| 5 | 30% |
| 7 | 50% |
| 10 | 70% |
| 15+ | 90% |

### Max Modifier Budget by Rarity

| Rarity | Max Modifier Cost |
|--------|-------------------|
| Common | (no modifiers) |
| Uncommon | 1 |
| Rare | 2 |
| Epic | 3 |
| Legendary | 3 |

### Available Modifiers

**Cost 1 (Minor):**
| Modifier | Effect | Valid Types |
|----------|--------|-------------|
| First Strike | First shot deals 2× damage | WEAPON |
| Lightweight | -1 weight | ALL |
| Efficient | -1 energy cost | WEAPON |
| Reinforced | +2 HP | ARMOR |
| Overclocked | +1 energy provided | REACTOR |

**Cost 2 (Moderate):**
| Modifier | Effect | Valid Types |
|----------|--------|-------------|
| Devastating | First shot deals 2.5× damage | WEAPON |
| Reactor-Fed | +1 damage per adjacent reactor | WEAPON |
| Fortified | +1 DR | ARMOR |

**Cost 3 (Powerful):**
| Modifier | Effect | Valid Types |
|----------|--------|-------------|
| Alpha Strike | First shot deals 3× damage | WEAPON |
| Weapon-Linked | +1 damage per adjacent weapon | WEAPON |
| Synergy Field | +1 damage to all adjacent weapons | SYSTEM |

---

## Change History

### 2024-12-09: Weapon Rebalance

**Changes Made:**

1. **Laser** (buffed space efficiency)
   - Cells: 4 → 2 (2x1 shape)
   - Weight: 2 → 1
   - Damage: 4 → 4 (unchanged)
   - Knockback: 8 → 5
   - *Rationale:* Most compact weapon, rewards tight inventory management

2. **Missile** (converted to synergy weapon)
   - Cells: 4 → 4 (2x2 shape)
   - Weight: 3 → 1
   - Energy: 1 → 0
   - Damage: 5 → 1×2 shots
   - Knockback: 30 → 10
   - *Rationale:* Cheap to equip, weak alone, 3x damage with flat bonuses

3. **Swarm Missiles** (matched missile formula)
   - Shots: 4 → 3 (1 per 2 cells)
   - Weight: 3 → 1
   - Energy: 1 → 0
   - Damage: 3 → 1
   - *Rationale:* Consistent with missile formula

4. **Railgun** (buffed)
   - Weight: 3 → 2
   - *Rationale:* Make it the knockback specialist, easier to equip

5. **Basic Plating** (buffed)
   - Weight: 2 → 1
   - *Rationale:* Starter armor should be easy to equip

### 2024-12-09: Item Size Increase

**Changes Made:**
- Increased average item sizes from ~3 to ~4 cells
- Goal: Make inventory management more challenging (fit 5-6 items instead of 7-8)

### 2024-12-09: Armor & Systems Rebalance

**HP Items (now 100% efficient at 2.5 HP = 1 square):**
1. **Hull Armor**
   - Weight: 2 → 1
   - HP: 8 → 10 (2.5 HP per square)
   - *Rationale:* Match 2.5 HP = 1 square exchange rate

2. **Heavy Hull**
   - Cells: 6 → 4 (2x2 shape)
   - Weight: 4 → 2
   - HP: 15 → 15 (unchanged)
   - *Rationale:* More compact, exactly 100% efficient

**DR Items (intentionally 60-67% efficient vs multi-hit counter):**
3. **Ballistic Plating**
   - Cells: 4 → 3 (L-shape)
   - Weight: 2 → 0
   - DR: 1 → 2
   - *Rationale:* DR counters multi-hit, raw efficiency misleading

4. **Reactive Plating**
   - Cells: 4 → 3 (L-shape)
   - Weight: 3 → 0
   - Energy: 0 → 1
   - DR: 2 → 3
   - *Rationale:* Best DR item, costs energy for balance

**Targeting Systems (synergy items, low base efficiency by design):**
5. **Weapon Amplifier**
   - Cells: 4 → 3 (1x3 vertical)
   - Weight: 2 → 1
   - *Rationale:* 33% base efficiency but multiplicative with multi-hit

6. **Targeting Hub**
   - Weight: 0 → 1
   - *Rationale:* 50% base efficiency, +16 effective vs Chain Gun

### 2024-12-10: Multi-Hit Weapon Rebalance & System Unification

**Multi-Hit Weapons (fixed damage, no scaling):**
1. **Machinegun**
   - Energy: 1 → 0
   - Damage: 2 → 1
   - Shots: 3 → 2
   - *Rationale:* Cheap multi-hit entry point, 50% base efficiency

2. **Chain Gun → Minigun** (renamed)
   - Removed damage scaling (was gaining +2 dmg at higher levels!)
   - Now fixed at 1×8 = 8 DPR
   - *Rationale:* Synergy weapon, value comes from flat bonuses

3. **Pulse Laser**
   - Damage: 2 → 1
   - Removed damage scaling
   - Now fixed at 1×5 = 5 DPR
   - *Rationale:* Energy-based synergy weapon

**System Unification:**
- Removed separate ITEM_DATABASE for starter items
- All items now use ITEM_TEMPLATES via generateComponent()
- Starter items are level 0 (weaker than shop level 1)
- Enemy items also generated from templates

### 2024-12-10: Budget System v2 & Modifier System

**New Budget System (replaces old multiplier system):**
- Level 1 = prototype stats (templates define base balance)
- Level N adds (N-1) flat budget, allocated proportionally
- Rarity adds fixed budget per tier (not multipliers!)
- Level 1-5: +1 per tier, Level 6-10: +2 per tier, Level 11+: +3 per tier

**Key Changes:**
1. **No more multiplicative rarity scaling** - prevents exponential power spikes
2. **Proportional stat allocation** - budget goes to stats item already has
3. **Weight/Energy cap** - max -1 reduction from prototype (30% chance)
4. **Multi-hit damage lock** - weapons with shotsPerRound > 1 don't gain damage
5. **Knockback doesn't scale** - stays at prototype value

**New Modifier System:**
- Uncommon+ items only can have modifiers
- Modifiers cost 1-3 budget
- Higher levels = higher modifier chance (10% at L1, 90% at L15)
- Higher rarity = access to higher-cost modifiers
- Examples: First Strike (2× first shot), Reactor-Fed (+1 dmg per reactor)

*Rationale:* The old multiplicative system caused Level 10 Legendary items to be 4-5× stronger than Level 1 Common. New additive system keeps progression meaningful but controlled.

---

## Future Balance Directions

### ~~Priority 1: Fix Multi-Hit Weapons~~ ✓ DONE
- Fixed damage scaling on multi-hit weapons
- Now properly balanced as synergy weapons

### ~~Priority 2: Clarify HP Exchange Rate~~ ✓ DONE
- Defined: 1 square = 2.5 HP
- Hull Armor and Heavy Hull now 100% efficient

### ~~Priority 3: System Cost Parity~~ ✓ DONE
- Weapon Amplifier reduced from cost 8 to cost 6
- Targeting Hub increased from cost 7 to cost 8
- Both now have low base efficiency but high synergy value

### ~~Priority 4: Review Level/Rarity Stacking~~ ✓ DONE
- Replaced multiplicative system with additive Budget System v2
- Power progression now linear and predictable

### Priority 1: Energy Shield Rebalance
- Currently 57% efficient (10 shield for cost 7)
- Needs review: Is shield fundamentally different from HP?

### Priority 2: Modifier Combat Implementation
- First Strike/Devastating/Alpha Strike effects need combat resolution code
- Reactor-Fed/Weapon-Linked need adjacency detection
- Synergy Field needs to apply damage bonus to nearby weapons

### Priority 3: Template Prototype Audit
- Verify all ITEM_TEMPLATES balance at Level 1
- Check: Budget Earned (cells + weight) ≈ Budget Spent (stats)
