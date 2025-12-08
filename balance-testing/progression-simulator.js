/**
 * Progression Simulator
 *
 * Simulates a full game run: shop, mission selection, combat, salvage
 * Tracks all decisions for analysis
 */

const {
    ECONOMY,
    ENEMY_GENERATION,
    DIFFICULTY,
    SALVAGE,
    MISSION_TEMPLATES,
    MECH_TEMPLATES,
    ITEM_TEMPLATES,
    COMPONENT_GENERATION,
    ITEM_COMBOS
} = require('./game-constants');

const { simulateCombat, simulateMultiCombat, calculateMechStats } = require('./combat-simulator');

// Random utilities
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function weightedRandom(weights) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    for (const [key, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) return key;
    }
    return Object.keys(weights)[0];
}

function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// ===========================================
// ENEMY GENERATION
// ===========================================
function generateEnemy(level, budgetMult = 1.0, isBoss = false) {
    const budget = (ENEMY_GENERATION.baseBudget + level * ENEMY_GENERATION.budgetPerLevel) * budgetMult;

    // Select chassis based on level
    const chassisIndex = Math.min(
        ENEMY_GENERATION.chassisTypes.length - 1,
        Math.floor((level - 1) / 2) + Math.floor(Math.random() * 2)
    );
    const chassis = ENEMY_GENERATION.chassisTypes[chassisIndex];

    // Allocate budget
    const healthBudget = budget * ENEMY_GENERATION.allocation.health;
    const damageBudget = budget * ENEMY_GENERATION.allocation.damage;
    const armorBudget = budget * ENEMY_GENERATION.allocation.armor;

    // Calculate stats
    let hp = Math.round(healthBudget * ENEMY_GENERATION.rates.healthPerBudget * chassis.healthMult);
    let baseDamage = Math.round(damageBudget * ENEMY_GENERATION.rates.damagePerBudget * chassis.damageMult);
    let armor = Math.round(armorBudget * ENEMY_GENERATION.rates.armorPerBudget * chassis.armorMult);

    // Apply boss multipliers
    if (isBoss) {
        const bossType = DIFFICULTY.getBossType(level);
        const bossMult = DIFFICULTY.bossMultipliers[bossType] || { hp: 1.5, damage: 1.3, armor: 1.3 };
        hp = Math.round(hp * bossMult.hp);
        baseDamage = Math.round(baseDamage * bossMult.damage);
        armor = Math.round(armor * bossMult.armor);
    }

    // Generate weapons (1-3 based on level)
    const weaponCount = Math.min(3, 1 + Math.floor(level / 3));
    const weaponTypes = ['railgun', 'laser', 'missile', 'machinegun'];
    const equipment = [];

    for (let i = 0; i < weaponCount; i++) {
        const wpnType = randomChoice(weaponTypes);
        const template = ITEM_TEMPLATES[wpnType];
        equipment.push({
            templateId: wpnType,
            name: `Enemy ${wpnType}`,
            stats: {
                ...template.baseStats,
                damage: baseDamage + Math.floor(Math.random() * 2)
            },
            rarity: 'common',
            level: level
        });
    }

    // Add armor if level >= 2
    if (level >= 2 && armor > 0) {
        equipment.push({
            templateId: 'ballistic_plating',
            name: 'Enemy Armor',
            stats: { weight: 2, energyDraw: 0, damageReduction: armor },
            rarity: 'common',
            level: level
        });
    }

    // Generate name
    const tier = Math.min(5, Math.ceil(level / 3));
    const prefix = randomChoice(ENEMY_GENERATION.namePrefixes[tier] || ENEMY_GENERATION.namePrefixes[1]);
    const suffix = randomChoice(ENEMY_GENERATION.nameSuffixes);
    const name = isBoss ? `${DIFFICULTY.getBossType(level)} ${suffix}` : `${prefix} ${suffix}`;

    return {
        name,
        chassis: {
            ...MECH_TEMPLATES.scout,
            baseHP: hp,
            baseArmor: 0
        },
        equipment,
        level,
        isBoss
    };
}

// ===========================================
// MISSION GENERATION
// ===========================================
function generateMissions(round, count = 3) {
    const templates = Object.values(MISSION_TEMPLATES);
    const selected = shuffleArray(templates).slice(0, count);

    return selected.map(template => {
        const isBoss = DIFFICULTY.isBossRound(round);
        const baseLevel = Math.max(1, Math.floor(DIFFICULTY.getMultiplier(round) * 2));
        const riskBonus = template.risk - 2;
        const enemyLevel = Math.max(1, Math.min(15, baseLevel + riskBonus + (isBoss ? 2 : 0)));

        // Generate enemies for this mission
        const enemies = [];
        for (let i = 0; i < template.enemyCount; i++) {
            enemies.push(generateEnemy(enemyLevel, template.baseBudgetMult, isBoss && i === 0));
        }

        // Calculate expected reward
        const baseGold = ECONOMY.winBonus * template.rewardMult;
        const xpReward = enemyLevel * 10 * template.rewardMult;

        return {
            ...template,
            round,
            enemyLevel,
            enemies,
            reward: {
                gold: Math.round(baseGold),
                xp: Math.round(xpReward)
            },
            isBoss
        };
    });
}

// ===========================================
// SHOP GENERATION
// ===========================================
function generateShopItems(round, count = 4) {
    const items = [];
    const itemTypes = Object.keys(ITEM_TEMPLATES);

    // Determine available rarities based on round
    const rarityWeights = {
        common: round <= 3 ? 0.8 : 0.5,
        uncommon: round <= 3 ? 0.2 : 0.35,
        rare: round >= 4 ? 0.12 : 0,
        epic: round >= 6 ? 0.03 : 0,
        legendary: round >= 8 ? 0.01 : 0
    };

    for (let i = 0; i < count; i++) {
        const templateId = randomChoice(itemTypes);
        const template = ITEM_TEMPLATES[templateId];
        const rarity = weightedRandom(rarityWeights);
        const level = Math.max(1, Math.floor(round / 2));

        const rarityMult = COMPONENT_GENERATION.rarityMultipliers[rarity];
        const levelMult = 1 + (level - 1) * COMPONENT_GENERATION.levelBudgetBonus;

        // Calculate stats with rarity/level scaling
        const stats = {};
        for (const [key, value] of Object.entries(template.baseStats)) {
            if (typeof value === 'number') {
                if (key === 'weight') {
                    stats[key] = value;  // Weight doesn't scale
                } else if (key === 'energyDraw' && value < 0) {
                    stats[key] = Math.round(value * rarityMult * levelMult);  // Energy provided scales
                } else if (key === 'energyDraw') {
                    stats[key] = value;  // Energy cost doesn't scale
                } else {
                    stats[key] = Math.round(value * rarityMult * levelMult);
                }
            } else {
                stats[key] = value;
            }
        }

        // Calculate price
        const basePrice = ECONOMY.weaponPrices[rarity] || 3;
        const price = Math.round(basePrice * (1 + (level - 1) * 0.3));

        // Generate name
        const prefixes = ['Mk' + level, 'Type-' + level, 'Model ' + level];
        const prefix = randomChoice(prefixes);

        items.push({
            templateId,
            name: `${prefix} ${templateId.replace('_', ' ')}`,
            type: template.type,
            category: template.category,
            stats,
            rarity,
            level,
            price,
            sellValue: Math.round(price * ECONOMY.sellMultiplier)
        });
    }

    return items;
}

// ===========================================
// SALVAGE GENERATION
// ===========================================
function generateSalvageOptions(result, round, difficulty = 'Easy') {
    const isVictory = result === 'victory';
    const isBoss = DIFFICULTY.isBossRound(round);

    const optionCount = isBoss
        ? SALVAGE.bossOptions
        : (isVictory ? SALVAGE.normalOptions : Math.max(2, SALVAGE.normalOptions - 2));

    const pickCount = isBoss ? SALVAGE.bossPicks : SALVAGE.normalPicks;

    const rarityRates = SALVAGE.rarityRates[difficulty] || SALVAGE.rarityRates.Easy;
    const items = [];

    // Item pool with weights
    const itemPool = {
        railgun: 15,
        laser: 15,
        missile: 12,
        machinegun: 12,
        ballistic_plating: 10,
        hull_armor: 10,
        energy_shield: 8,
        reactor: 6,
        power_cell: 6,
        targeting_link: 4,
        gyro: 3
    };

    for (let i = 0; i < optionCount; i++) {
        const templateId = weightedRandom(itemPool);
        const template = ITEM_TEMPLATES[templateId];
        const rarity = weightedRandom(rarityRates);
        const level = Math.max(1, Math.floor(round / 2) + Math.floor(Math.random() * 2));

        const rarityMult = COMPONENT_GENERATION.rarityMultipliers[rarity];
        const levelMult = 1 + (level - 1) * COMPONENT_GENERATION.levelBudgetBonus;

        // Check if damaged
        const isDamaged = Math.random() < SALVAGE.damagedChance;
        const damageMult = isDamaged ? (0.6 + Math.random() * 0.2) : 1.0;

        // Calculate stats
        const stats = {};
        for (const [key, value] of Object.entries(template.baseStats)) {
            if (typeof value === 'number') {
                if (key === 'weight' || key === 'energyDraw') {
                    stats[key] = value;
                } else {
                    stats[key] = Math.round(value * rarityMult * levelMult * damageMult);
                }
            } else {
                stats[key] = value;
            }
        }

        // Calculate sell value
        const basePrice = ECONOMY.weaponPrices[rarity] || 3;
        const sellValue = isDamaged ? 0 : Math.round(basePrice * ECONOMY.sellMultiplier);

        items.push({
            templateId,
            name: `Salvaged ${templateId.replace('_', ' ')}`,
            type: template.type,
            category: template.category,
            stats,
            rarity,
            level,
            isDamaged,
            damageMult,
            sellValue,
            price: 0  // Salvage is free
        });
    }

    // Calculate skip bonus (gold equal to highest level)
    const skipBonus = Math.max(...items.map(i => i.level));

    return {
        items,
        pickCount,
        skipBonus,
        isVictory,
        isBoss
    };
}

// ===========================================
// GAME STATE
// ===========================================
function createInitialState() {
    return {
        round: 1,
        gold: ECONOMY.startingGold,
        xp: 0,
        winStreak: 0,
        lossStreak: 0,
        wins: 0,
        losses: 0,
        mech: {
            chassis: MECH_TEMPLATES.scout,
            equipment: [
                // Starting loadout: basic railgun
                {
                    templateId: 'railgun',
                    name: 'Training Railgun',
                    stats: { weight: 3, energyDraw: 1, damage: 4 },
                    rarity: 'common',
                    level: 1
                }
            ]
        },
        bench: [],  // Items not currently equipped
        decisions: [],  // Log of all decisions
        combatResults: []  // Log of all combat results
    };
}

// ===========================================
// PROGRESSION SIMULATOR
// ===========================================
function simulateRun(agent, config = {}) {
    const maxRounds = config.maxRounds || 10;
    const verbose = config.verbose || false;
    const log = verbose ? console.log : () => {};

    const state = createInitialState();
    const runLog = {
        agentName: agent.name,
        startTime: Date.now(),
        rounds: [],
        finalRound: 0,
        finalResult: null
    };

    for (let round = 1; round <= maxRounds; round++) {
        state.round = round;
        const roundLog = {
            round,
            startGold: state.gold,
            startEquipment: state.mech.equipment.length
        };

        log(`\n${'='.repeat(50)}`);
        log(`ROUND ${round} - Gold: ${state.gold}g`);

        // 1. SHOP PHASE
        const shopItems = generateShopItems(round);
        const shopDecision = agent.decideShop(state, shopItems);
        roundLog.shopOptions = shopItems.map(i => ({ name: i.name, price: i.price, rarity: i.rarity }));
        roundLog.shopDecision = shopDecision;

        state.decisions.push({
            round,
            phase: 'shop',
            options: shopItems,
            choice: shopDecision
        });

        // Apply shop decision
        if (shopDecision.action === 'buy' && shopDecision.itemIndex !== undefined) {
            const item = shopItems[shopDecision.itemIndex];
            if (state.gold >= item.price) {
                state.gold -= item.price;
                state.mech.equipment.push(item);
                log(`  Bought: ${item.name} for ${item.price}g`);
            }
        } else if (shopDecision.action === 'refresh') {
            state.gold -= ECONOMY.shopRefreshCost;
            // In a real sim we'd regenerate shop, but we'll skip for now
        }

        // 2. MISSION SELECTION
        const missions = generateMissions(round);
        const missionDecision = agent.decideMission(state, missions);
        roundLog.missionOptions = missions.map(m => ({
            name: m.name,
            difficulty: m.difficulty,
            enemyCount: m.enemyCount,
            enemyLevel: m.enemyLevel,
            isBoss: m.isBoss
        }));
        roundLog.missionDecision = missionDecision;

        state.decisions.push({
            round,
            phase: 'mission',
            options: missions,
            choice: missionDecision
        });

        const selectedMission = missions[missionDecision.missionIndex || 0];
        log(`  Mission: ${selectedMission.name} (${selectedMission.difficulty})`);
        log(`  Enemies: ${selectedMission.enemies.length}, Level ${selectedMission.enemyLevel}`);

        // 3. COMBAT
        const combatResult = simulateMultiCombat(state.mech, selectedMission.enemies, { verbose });
        roundLog.combat = {
            victory: combatResult.overallVictory,
            fights: combatResult.fights.length,
            victories: combatResult.totalVictories,
            finalHP: combatResult.finalHP
        };

        state.combatResults.push(combatResult);

        if (combatResult.overallVictory) {
            state.wins++;
            state.winStreak++;
            state.lossStreak = 0;
            log(`  VICTORY! (${combatResult.totalVictories}/${combatResult.totalEnemies} enemies defeated)`);
        } else {
            state.losses++;
            state.lossStreak++;
            state.winStreak = 0;
            log(`  DEFEAT! (Died at enemy ${combatResult.totalVictories + 1}/${combatResult.totalEnemies})`);
        }

        // 4. REWARDS
        const baseGold = combatResult.overallVictory ? ECONOMY.winBonus : ECONOMY.lossBonus;
        const streakBonus = combatResult.overallVictory
            ? Math.min(state.winStreak, ECONOMY.maxStreak) * ECONOMY.streakBonus
            : 0;
        const interest = state.gold >= ECONOMY.interestThreshold
            ? Math.min(Math.floor(state.gold * ECONOMY.interestRate), ECONOMY.interestCap)
            : 0;
        const goldEarned = baseGold + streakBonus + interest;
        state.gold += goldEarned;

        roundLog.goldEarned = { base: baseGold, streak: streakBonus, interest, total: goldEarned };
        log(`  Gold earned: ${goldEarned}g (base: ${baseGold}, streak: ${streakBonus}, interest: ${interest})`);

        // 5. SALVAGE
        const salvageOptions = generateSalvageOptions(
            combatResult.overallVictory ? 'victory' : 'defeat',
            round,
            selectedMission.difficulty
        );
        const salvageDecision = agent.decideSalvage(state, salvageOptions);
        roundLog.salvageOptions = salvageOptions.items.map(i => ({
            name: i.name,
            rarity: i.rarity,
            isDamaged: i.isDamaged,
            templateId: i.templateId
        }));
        roundLog.salvageDecision = salvageDecision;

        state.decisions.push({
            round,
            phase: 'salvage',
            options: salvageOptions,
            choice: salvageDecision
        });

        // Apply salvage decision
        if (salvageDecision.action === 'skip') {
            state.gold += salvageOptions.skipBonus;
            log(`  Skipped salvage, got ${salvageOptions.skipBonus}g`);
        } else if (salvageDecision.action === 'pick') {
            for (const idx of salvageDecision.itemIndices || []) {
                if (idx < salvageOptions.items.length) {
                    const item = salvageOptions.items[idx];
                    state.mech.equipment.push(item);
                    log(`  Picked: ${item.name} (${item.rarity}${item.isDamaged ? ', damaged' : ''})`);
                }
            }
        }

        // 6. BUILD PHASE - Let agent reorganize equipment
        const buildDecision = agent.decideBuild(state);
        if (buildDecision.action === 'sell' && buildDecision.itemIndices) {
            for (const idx of buildDecision.itemIndices.sort((a, b) => b - a)) {
                const item = state.mech.equipment[idx];
                if (item) {
                    state.gold += item.sellValue || 0;
                    state.mech.equipment.splice(idx, 1);
                    log(`  Sold: ${item.name} for ${item.sellValue || 0}g`);
                }
            }
        }

        roundLog.endGold = state.gold;
        roundLog.endEquipment = state.mech.equipment.length;
        runLog.rounds.push(roundLog);

        // Check for game over (too many losses)
        if (state.losses >= 3) {
            log(`\n*** GAME OVER - Too many losses! ***`);
            runLog.finalResult = 'loss';
            runLog.finalRound = round;
            break;
        }

        // Check for boss victory
        if (round === maxRounds && combatResult.overallVictory) {
            log(`\n*** VICTORY - Beat the final boss! ***`);
            runLog.finalResult = 'victory';
            runLog.finalRound = round;
            break;
        }
    }

    // Set final result if not already set
    if (!runLog.finalResult) {
        runLog.finalResult = state.wins >= maxRounds ? 'victory' : 'incomplete';
        runLog.finalRound = state.round;
    }

    runLog.endTime = Date.now();
    runLog.duration = runLog.endTime - runLog.startTime;
    runLog.finalState = {
        gold: state.gold,
        wins: state.wins,
        losses: state.losses,
        equipment: state.mech.equipment.map(e => ({
            name: e.name,
            templateId: e.templateId,
            rarity: e.rarity,
            level: e.level
        }))
    };

    return runLog;
}

module.exports = {
    simulateRun,
    createInitialState,
    generateEnemy,
    generateMissions,
    generateShopItems,
    generateSalvageOptions
};
