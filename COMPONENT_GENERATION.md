# Component Generation Guide

This document describes how components (items) are generated in the Mech Autobattler. All values in this document are synchronized with `index.html`.

## Table of Contents
- [Feature Flags](#feature-flags)
- [Budget System](#budget-system)
- [Rarity System](#rarity-system)
- [Modifier System](#modifier-system)
- [Positional Modifiers](#positional-modifiers)
- [Shape Generation](#shape-generation)
- [Item Templates](#item-templates)

---

## Feature Flags

Located in `COMPONENT_GENERATION`:

| Flag | Default | Description |
|------|---------|-------------|
| `useRandomShapes` | `true` | Generate random connected shapes instead of fixed template shapes |

---

## Budget System

Components are balanced using a budget system. Stats "cost" budget, while size and weight "provide" budget.

### Budget Sources (Earning Budget)

| Source | Rate | Description |
|--------|------|-------------|
| Cell | 1 | Each cell in the item shape adds 1 budget |
| Weight | 1 | Each point of weight adds 1 budget (compensation for slot usage) |

### Budget Costs (Spending Budget)

| Stat | Rate | Example |
|------|------|---------|
| Damage | 1 | 1 budget = 1 damage |
| Energy Cost | 2 | 1 budget = 0.5 energy draw |
| Damage Reduction | 1 | 1 budget = 1 DR (non-stacking, highest only) |
| HP | 0.4 | 1 budget = 2.5 HP |
| Energy Provided | 1 | 1 budget = 1 energy |
| Knockback | 0.2 | 1 budget = 5 knockback (fixed, doesn't scale) |
| Targeting Damage (1 Dir) | 1 | 1 budget = +1 dmg to one adjacent weapon |
| Targeting Damage (All Dir) | 3 | 3 budget = +1 dmg to all adjacent weapons |
| Accuracy Bonus | 0.25 | 1 budget = 4% accuracy |
| Energy Reduction | 3 | 3 budget = 1 energy reduction to adjacent items |
| Heat Capacity | 0.125 | 1 budget = 8 heat capacity |

### Stat Categories

**Scalable Stats** (improve with level):
- damage, damageReduction, hp, energyProvided, targetingDamage1Dir, targetingDamageAllDir

**Reducible Stats** (can decrease by max 1 from prototype):
- weight, energyCost

**Fixed Stats** (never scale):
- knockback, shotsPerRound

---

## Rarity System

### Rarity Tiers

| Rarity | Tier | Color |
|--------|------|-------|
| Common | 0 | #aaaaaa (gray) |
| Uncommon | 1 | #00ff88 (green) |
| Rare | 2 | #4488ff (blue) |
| Epic | 3 | #aa44ff (purple) |
| Legendary | 4 | #ffaa00 (orange) |

### Rarity Budget Bonus

Extra budget granted based on level range and rarity tier:

| Level Range | Budget per Tier |
|-------------|-----------------|
| 1-5 (Low) | 1 |
| 6-10 (Mid) | 2 |
| 11+ (High) | 3 |

**Formula**: `rarityBudget = tierNumber × budgetPerTier`

Example: Epic (tier 3) at level 8 (mid) = 3 × 2 = 6 extra budget

---

## Modifier System

Modifiers are special effects that can appear on uncommon+ items. They are divided into **standard modifiers** and **positional modifiers** (which depend on item placement).

### Modifier Chance by Level

| Level | Chance |
|-------|--------|
| 1 | 10% |
| 3 | 20% |
| 5 | 30% |
| 7 | 50% |
| 10 | 70% |
| 15 | 90% |

### Max Modifier Budget by Rarity

| Rarity | Max Budget |
|--------|------------|
| Uncommon | 1 |
| Rare | 2 |
| Epic | 3 |
| Legendary | 3 |

---

## Standard Modifiers

### Cost 1 (Minor Effects)

| ID | Name | Description | Applies To | Effect Key |
|----|------|-------------|------------|------------|
| `first_strike` | First Strike | First shot deals 2× damage | WEAPON | `firstShotMultiplier: 2` |
| `lightweight` | Lightweight | -1 weight | WEAPON, ARMOR, SYSTEM | `weightBonus: -1` |
| `efficient` | Efficient | -1 energy cost | WEAPON, SYSTEM | `energyBonus: -1` |
| `hardened` | Hardened | +1 DR | ARMOR | `drBonus: 1` |

### Cost 2 (Moderate Effects)

| ID | Name | Description | Applies To | Effect Key |
|----|------|-------------|------------|------------|
| `devastating` | Devastating | First shot deals 2.5× damage | WEAPON | `firstShotMultiplier: 2.5` |
| `reactor_synergy` | Reactor Synergy | +0.5 damage per adjacent reactor | WEAPON | `damagePerReactor: 0.5` |
| `weapon_link` | Weapon Link | +1 damage per adjacent weapon | WEAPON | `damagePerWeapon: 1` |
| `fortified` | Fortified | +5 HP | ARMOR | `hpBonus: 5` |
| `overcharged` | Overcharged | +1 energy provided | REACTOR | `energyProvidedBonus: 1` |

### Cost 3 (Powerful Effects)

| ID | Name | Description | Applies To | Effect Key |
|----|------|-------------|------------|------------|
| `alpha_strike` | Alpha Strike | First shot deals 3× damage | WEAPON | `firstShotMultiplier: 3` |
| `reactor_amplifier` | Reactor Amplifier | +1 damage per adjacent reactor | WEAPON | `damagePerReactor: 1` |
| `adaptive_plating` | Adaptive Plating | +2 DR, -1 weight | ARMOR | `drBonus: 2, weightBonus: -1` |
| `power_surge` | Power Surge | +2 energy provided | REACTOR | `energyProvidedBonus: 2` |
| `targeting_matrix` | Targeting Matrix | +1 damage to all adjacent weapons | SYSTEM | `adjacentDamageBonus: 1` |

---

## Positional Modifiers

These modifiers provide bonuses based on where items are placed on the mech grid. They are evaluated dynamically when calculating player stats.

### Cost 1: Position-Based Bonuses

| ID | Name | Description | Applies To | Effect Key | Condition |
|----|------|-------------|------------|------------|-----------|
| `top_mounted` | Top Mounted | +2 damage when in top row | WEAPON | `topRowDamageBonus: 2` | Any cell in row 0 |
| `grounded` | Grounded | +3 HP when in bottom row | ARMOR | `bottomRowHPBonus: 3` | Any cell in bottom row |
| `flanker` | Flanker | +1 damage when on edge | WEAPON | `edgeDamageBonus: 1` | Any cell on left/right edge |
| `compact` | Compact | +1 energy when central | REACTOR | `centralEnergyBonus: 1` | No cells touching any edge |

### Cost 2: Adjacency Count Bonuses

| ID | Name | Description | Applies To | Effect Key | Calculation |
|----|------|-------------|------------|------------|-------------|
| `weapon_array` | Weapon Array | +0.5 damage per adjacent weapon | WEAPON | `damagePerAdjacentWeapon: 0.5` | Count unique adjacent weapons |
| `armor_mesh` | Armor Mesh | +2 HP per adjacent armor | ARMOR | `hpPerAdjacentArmor: 2` | Count unique adjacent armor |
| `power_grid` | Power Grid | +0.5 energy per adjacent reactor | REACTOR | `energyPerAdjacentReactor: 0.5` | Count unique adjacent reactors |

### Cost 2: Isolation Bonuses

| ID | Name | Description | Applies To | Effect Key | Condition |
|----|------|-------------|------------|------------|-----------|
| `lone_wolf` | Lone Wolf | +3 damage when isolated | WEAPON | `isolationDamageBonus: 3` | No adjacent items |
| `hermit_plating` | Hermit Plating | +5 HP when isolated | ARMOR | `isolationHPBonus: 5` | No adjacent items |

### Cost 2: Special Position Bonuses

| ID | Name | Description | Applies To | Effect Key | Condition |
|----|------|-------------|------------|------------|-----------|
| `corner_pocket` | Corner Pocket | +2 damage in corner | WEAPON | `cornerDamageBonus: 2` | Any cell in grid corner |
| `symmetry_bonus` | Mirror Match | +2 HP if mirrored | ARMOR | `symmetryHPBonus: 2` | Same type on opposite side |

### Cost 3: Chain Bonuses

| ID | Name | Description | Applies To | Effect Key | Calculation |
|----|------|-------------|------------|------------|-------------|
| `weapon_chain` | Weapon Chain | +1 damage per chain weapon | WEAPON | `damagePerChainWeapon: 1` | BFS to find connected weapons |
| `armor_chain` | Armor Chain | +2 HP per chain armor | ARMOR | `hpPerChainArmor: 2` | BFS to find connected armor |

### Cost 3: Tetris Bonuses (Row/Column Completion)

| ID | Name | Description | Applies To | Effect Key | Condition |
|----|------|-------------|------------|------------|-----------|
| `row_complete` | Row Dominator | +3 damage if row filled | WEAPON | `rowCompleteDamageBonus: 3` | Any row completely filled |
| `column_complete` | Column Master | +5 HP if column filled | ARMOR | `columnCompleteHPBonus: 5` | Any column completely filled |

---

## Position Check Functions

The following helper functions are used to evaluate positional modifiers (defined in `calculatePositionalBonuses()`):

| Function | Description | Returns |
|----------|-------------|---------|
| `isInTopRow(positions)` | Check if any cell is in row 0 | boolean |
| `isInBottomRow(positions)` | Check if any cell is in last row | boolean |
| `isOnLeftEdge(positions)` | Check if any cell is in column 0 | boolean |
| `isOnRightEdge(positions)` | Check if any cell is in last column | boolean |
| `isOnEdge(positions)` | Check if on left or right edge | boolean |
| `isInCorner(positions)` | Check if any cell is in a corner | boolean |
| `isCentral(positions)` | Check if no cells touch any edge | boolean |
| `countAdjacentOfType(positions, type, excludeId)` | Count unique adjacent items of type | number |
| `isIsolated(positions, instanceId)` | Check if no adjacent items | boolean |
| `getLongestChain(startId, type)` | BFS to find connected item count | number |
| `hasCompleteRow()` | Check if any grid row is filled | boolean |
| `hasCompleteColumn()` | Check if any grid column is filled | boolean |

---

## Shape Generation

When `useRandomShapes` is enabled:

1. Count cells in template's `baseShape`
2. Generate random connected shape with same cell count
3. Algorithm picks random existing cell to expand from (creates varied shapes)
4. All cells guaranteed to be adjacent to at least one other cell

### Shape Trimming
After generation, empty rows/columns are removed to create minimal bounding box.

---

## Item Templates

### Weapons

| Template | Cells | Weight | Energy | Damage | Special |
|----------|-------|--------|--------|--------|---------|
| Railgun | 4 | 2 | 1 | 5 | High knockback (25) |
| Laser | 2 | 1 | 4 | 4 | Beam weapon |
| Missile | 4 | 2 | 0 | 5 | Cluster (6 missiles) |
| Machine Gun | 3 | 1 | 0 | 1 | 2 shots/round |
| Minigun | 4 | 2 | 2 | 1 | 8 shots/round |
| Pulse Laser | 3 | 1 | 2 | 1 | 5 shots/round, beam |
| Swarm Missiles | 6 | 2 | 1 | 1 | 3 shots/round, cluster |

### Armor (HP Scaling)

Formula: `HP = cells × 3 + (cells - 1) × 1`

| Template | Cells | Weight | HP |
|----------|-------|--------|-----|
| Small Armor | 1 | 0 | 3 |
| Light Armor | 2 | 0 | 7 |
| Medium Armor | 3 | 1 | 11 |
| Heavy Armor | 4 | 1 | 15 |
| Reinforced Armor | 5 | 2 | 19 |
| Titan Armor | 6 | 2 | 23 |

### Armor (Damage Reduction)

**Note**: DR requires weight 2 investment. DR does not stack - only highest value applies.

| Template | Cells | Weight | DR | Energy |
|----------|-------|--------|-----|--------|
| Ballistic Plating | 3 | 2 | 2 | 0 |
| Reactive Plating | 3 | 2 | 3 | 1 |

### Reactors

| Template | Cells | Weight | Energy Provided |
|----------|-------|--------|-----------------|
| Reactor | 4 | 1 | 3 |
| Power Cell | 3 | 1 | 2 |

### Systems

| Template | Cells | Weight | Energy | Effect |
|----------|-------|--------|--------|--------|
| Targeting Link | 3 | 1 | 1 | +1 damage to one adjacent weapon |
| Targeting Hub | 5 | 1 | 2 | +2 damage to ALL adjacent weapons |
| Gyro | 3 | 1 | 0 | Stability bonus |
| Heat Sink | 2 | 1 | 0 | -1 energy to adjacent items |
| Cooling System | 6 | 2 | 0 | -3 energy to adjacent items |
| Armor Linkage | 4 | 1 | 1 | +1 armor to adjacent armor |
| Reactor Linkage | 4 | 1 | 1 | +1 energy to adjacent reactors |

---

## Code Location

All generation config is in `index.html`:

| Section | Line (approx) | Description |
|---------|---------------|-------------|
| `COMPONENT_GENERATION` | ~2333 | Main config object |
| `COMPONENT_GENERATION.modifiers` | ~2422 | Modifier definitions by cost |
| `COMPONENT_GENERATION.positionalModifiers` | ~2565 | Positional modifier config |
| `ITEM_TEMPLATES` | ~2626 | Item template definitions |
| `generateComponent()` | ~3410 | Main generation function |
| `generateRandomShape()` | ~3182 | Random shape algorithm |
| `calculatePositionalBonuses()` | ~8404 | Position bonus evaluation |
| `calculateAdjacencyBonuses()` | ~8288 | Adjacency bonus evaluation |

---

## Adding New Modifiers

To add a new modifier:

1. Add entry to `COMPONENT_GENERATION.modifiers[cost]` array
2. Define: `id`, `name`, `description`, `appliesTo`, `effect`
3. If positional, add evaluation logic to `calculatePositionalBonuses()`
4. Update this documentation

Example:
```javascript
{
    id: 'new_modifier',
    name: 'New Modifier',
    description: '+X bonus when condition',
    appliesTo: ['WEAPON'],  // or ARMOR, REACTOR, SYSTEM
    effect: { newEffectKey: value }
}
```

---

## Changelog

- **v1.0**: Initial documentation
- **v1.1**: Added positional modifiers system
  - Position-based (top/bottom/edge/corner/central)
  - Adjacency counts (weapon/armor/reactor neighbors)
  - Isolation bonuses (no adjacent items)
  - Chain bonuses (connected items of same type)
  - Tetris bonuses (row/column completion)
- DR items now require weight 2
- 6-tier armor HP scaling system
- Random shape generation picks random cells to expand from
