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

| Weapon | Cells | Weight | Energy | Cost | Shots | DPR | DPR/cell | With +2 |
|--------|-------|--------|--------|------|-------|-----|----------|---------|
| **Machinegun** | 3 | 1 | 1 | 3 | 3 | 2×3=6 | 2.0 | 4×3=12 |
| **Chain Gun** | 4 | 2 | 1 | 4 | 8 | 1×8=8 | 2.0 | 3×8=24 |
| **Pulse Laser** | 3 | 1 | 2 | 5 | 5 | 2×5=10 | 3.33 | 4×5=20 |

### ⚠️ BALANCE ISSUES: Multi-Hit Weapons

**Problem:** These weapons get ~2x their budget in DPR because shots aren't costed properly.

| Weapon | Budget Cost | Expected DPR | Actual DPR | Efficiency |
|--------|-------------|--------------|------------|------------|
| Machinegun | 3 | 3 | 6 | **200%** |
| Chain Gun | 4 | 4 | 8 | **200%** |
| Pulse Laser | 5 | 5 | 10 | **200%** |

**Comparison to Balanced Weapons:**
- Railgun: Cost 4, DPR 5 = 125% (has KB bonus)
- Laser: Cost 5, DPR 4 = 80% (has size bonus)
- Missile: Cost 1, DPR 2 = 200% (but terrible DPR/cell)

**Potential Fixes:**
1. Reduce per-shot damage to make total DPR match cost
2. Increase weight/energy cost proportional to shot count
3. Accept imbalance as intentional (multi-hit is the "strong" archetype)

**Recommendation:** Either:
- Machinegun: damage 2→1, or add 1 energy cost
- Chain Gun: damage 1→0.5 (if fractional allowed), or weight 2→3
- Pulse Laser: damage 2→1, shots 5→5 (DPR 5, matches cost)

---

## Armor

| Item | Cells | Weight | Energy | Effect | Effect/cell | Notes |
|------|-------|--------|--------|--------|-------------|-------|
| **Ballistic Plating** | 4 | 2 | 0 | 1 DR | 0.25 | vs ballistic/missile |
| **Reactive Plating** | 4 | 3 | 0 | 2 DR | 0.5 | Better DR, heavier |
| **Hull Armor** | 3 | 2 | 0 | 8 HP | 2.67 | Raw HP boost |
| **Heavy Hull** | 6 | 4 | 0 | 15 HP | 2.5 | More HP, very heavy |
| **Energy Shield** | 4 | 1 | 1 | 10 Shield | 2.5 | vs energy weapons |

### ⚠️ BALANCE ISSUES: Armor

**Problem 1: DR vs HP unclear exchange rate**
- Is 1 DR = 1 damage blocked? (Yes, per hit)
- Against multi-hit weapons, 1 DR blocks 3-8 damage per round!
- This makes DR extremely valuable vs multi-hit meta

**Problem 2: DR scaling**
- Ballistic Plating: 4 cells, weight 2 → should get ~2 DR (only gets 1)
- Reactive Plating: 4 cells, weight 3 → should get ~1 DR (gets 2) - OVERPOWERED?

**Problem 3: HP items seem efficient**
- Hull Armor: 3 cells for 8 HP = 2.67 HP/cell
- But what's the exchange rate for HP? Not defined.

**Recommendation:** Define HP exchange rate. Suggest: 1 square = 3-4 HP
- Hull Armor (3 cells): Expected 9-12 HP, has 8 → slightly under
- Heavy Hull (6 cells): Expected 18-24 HP, has 15 → under

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

| Item | Cells | Weight | Energy | Effect | Notes |
|------|-------|--------|--------|--------|-------|
| **Targeting Link** | 2 | 0 | 0 | +1 dmg (1 dir) | Directional only |
| **Targeting Hub** | 5 | 0 | 1 | +2 dmg (all adj) | Plus shape |
| **Gyro** | 4 | 1 | 1 | +8% accuracy | |
| **Weapon Amplifier** | 4 | 2 | 1 | +1 dmg (adj) | All adjacent |
| **Armor Linkage** | 4 | 1 | 1 | +1 armor (adj) | |

### ⚠️ BALANCE ISSUES: Systems

**Problem 1: Targeting Link is too efficient**
- 2 cells, 0 cost, +1 damage = essentially free
- With multi-hit weapon: +8 damage from Chain Gun adjacency
- Compare to Weapon Amplifier: 4 cells, cost 4, +1 damage = 4x the price!

**Problem 2: Weapon Amplifier is overcosted**
- 4 cells + weight 2 + energy 1 = massive investment
- Only provides +1 damage to adjacent
- Targeting Link does the same for 2 cells and 0 cost

**Recommendation:**
- Targeting Link: Add weight or energy cost, or reduce to +0.5 damage
- Weapon Amplifier: Reduce weight to 0-1, or increase bonus to +2

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

## Level Scaling

| Level | Budget Bonus | Cumulative |
|-------|--------------|------------|
| 1 | +0 | Base |
| 2 | +0.5 | +0.5 |
| 5 | +0.5 | +2.0 |
| 10 | +0.5 | +4.5 |

**At level 10:** A 4-cell item effectively has 8.5 budget (212% of base)

### ⚠️ BALANCE CONCERN

Level scaling may be too aggressive. At high levels, items become significantly stronger than their size suggests.

---

## Rarity Scaling

### Stat Budget Multipliers
| Rarity | Multiplier | 4-cell effective |
|--------|------------|------------------|
| Common | 1.0× | 4.0 |
| Uncommon | 1.15× | 4.6 |
| Rare | 1.35× | 5.4 |
| Epic | 1.6× | 6.4 |
| Legendary | 2.0× | 8.0 |

### Special Effect Bonus Budget
| Rarity | Bonus | Example (Targeting Link) |
|--------|-------|--------------------------|
| Common | +0 | +1 dmg, 1 direction |
| Uncommon | +1.5 | +1 dmg, 2 directions |
| Rare | +3 | +2 dmg, 2 directions |
| Epic | +5 | +2 dmg, 4 directions |
| Legendary | +8 | +3 dmg, 4 directions |

### ⚠️ BALANCE CONCERN: Legendary Items

**Combined scaling is extreme:**
- Level 10 Legendary 4-cell item:
- Base: 4 cells
- Level bonus: +4.5
- Rarity multiplier: ×2.0
- = (4 + 4.5) × 2.0 = **17 effective budget**
- Plus +8 special effect budget

This makes legendary items 4-5x stronger than common level 1 items.

**Recommendation:** Consider multiplicative vs additive scaling. Current system may cause power spikes.

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

---

## Future Balance Directions

### Priority 1: Fix Multi-Hit Weapons
- Machinegun, Chain Gun, Pulse Laser are 200% efficient
- Options: Reduce damage, increase cost, or accept as intentional

### Priority 2: Clarify HP Exchange Rate
- Currently undefined how HP translates to budget
- Suggested: 1 square = 3-4 HP

### Priority 3: System Cost Parity
- Targeting Link (2 cells, 0 cost) vs Weapon Amplifier (4 cells, 4 cost)
- Both give +1 damage but at vastly different prices

### Priority 4: Review Level/Rarity Stacking
- Combined scaling may be too extreme at high levels
- Consider caps or diminishing returns
