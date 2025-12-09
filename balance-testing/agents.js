/**
 * Agent Archetypes
 *
 * Different AI strategies for playing through the game.
 * Each agent makes decisions based on their personality/strategy.
 */

const { ITEM_TEMPLATES, ECONOMY } = require('./game-constants');
const { calculateMechStats, calculateDPS } = require('./combat-simulator');

// ===========================================
// EVALUATION UTILITIES
// ===========================================

/**
 * Evaluate an item's combat value
 */
function evaluateItem(item, weights = {}) {
    const template = ITEM_TEMPLATES[item.templateId] || {};
    const stats = item.stats || template.baseStats || {};

    let value = 0;

    // Damage value
    if (stats.damage) {
        value += stats.damage * (weights.damage || 1.0);
    }

    // HP value
    if (stats.hpBonus) {
        value += stats.hpBonus * 0.3 * (weights.defense || 1.0);
    }

    // Armor value
    if (stats.damageReduction) {
        value += stats.damageReduction * 3 * (weights.defense || 1.0);
    }

    // Shield value
    if (stats.energyShieldHP) {
        value += stats.energyShieldHP * 0.25 * (weights.defense || 1.0);
    }

    // Energy provided value
    if (stats.energyDraw && stats.energyDraw < 0) {
        value += Math.abs(stats.energyDraw) * 1.5 * (weights.utility || 1.0);
    }

    // System bonuses
    if (stats.damageBonus) {
        value += stats.damageBonus * 2 * (weights.damage || 1.0);
    }

    // Rarity bonus
    const rarityBonus = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 4,
        legendary: 6
    };
    value += rarityBonus[item.rarity] || 0;

    // Level bonus
    value += (item.level - 1) * 0.5;

    // Damaged penalty
    if (item.isDamaged) {
        value *= 0.6;
    }

    return value;
}

/**
 * Evaluate a mission's risk/reward
 */
function evaluateMission(mission, state, weights = {}) {
    // Base reward value
    let rewardValue = mission.reward.gold * (weights.economy || 1.0);
    rewardValue += mission.reward.xp * 0.1;

    // Risk penalty based on difficulty
    const riskPenalty = {
        Easy: 0,
        Medium: 2,
        Hard: 5
    };
    const risk = (riskPenalty[mission.difficulty] || 0) * (weights.safety || 1.0);

    // Enemy count penalty
    const enemyPenalty = (mission.enemyCount - 1) * 2;

    // Boss bonus/penalty
    const bossFactor = mission.isBoss ? (weights.bossFocus || 0) : 0;

    return rewardValue - risk - enemyPenalty + bossFactor;
}

// ===========================================
// BASE AGENT CLASS
// ===========================================
class BaseAgent {
    constructor(name, weights = {}) {
        this.name = name;
        this.weights = {
            damage: 1.0,
            defense: 1.0,
            utility: 1.0,
            economy: 1.0,
            safety: 1.0,
            immediate: 1.0,
            future: 1.0,
            synergy: 1.0,
            ...weights
        };
    }

    /**
     * Decide what to do in the shop
     * @returns {{ action: 'buy'|'refresh'|'skip', itemIndex?: number }}
     */
    decideShop(state, shopItems) {
        // Default: buy best value item we can afford
        let bestItem = null;
        let bestValue = -Infinity;
        let bestIndex = -1;

        for (let i = 0; i < shopItems.length; i++) {
            const item = shopItems[i];
            if (item.price > state.gold) continue;

            const value = evaluateItem(item, this.weights) - item.price * this.weights.economy;
            if (value > bestValue) {
                bestValue = value;
                bestItem = item;
                bestIndex = i;
            }
        }

        // Only buy if value is positive
        if (bestValue > 0 && bestItem) {
            return { action: 'buy', itemIndex: bestIndex, reason: `Best value: ${bestValue.toFixed(1)}` };
        }

        return { action: 'skip', reason: 'No good deals' };
    }

    /**
     * Decide which mission to take
     * @returns {{ action: 'select', missionIndex: number }}
     */
    decideMission(state, missions) {
        let bestMission = 0;
        let bestValue = -Infinity;

        for (let i = 0; i < missions.length; i++) {
            const value = evaluateMission(missions[i], state, this.weights);
            if (value > bestValue) {
                bestValue = value;
                bestMission = i;
            }
        }

        return {
            action: 'select',
            missionIndex: bestMission,
            reason: `Best mission value: ${bestValue.toFixed(1)}`
        };
    }

    /**
     * Decide which salvage to take
     * @returns {{ action: 'pick'|'skip', itemIndices?: number[] }}
     */
    decideSalvage(state, salvageOptions) {
        const { items, pickCount, skipBonus } = salvageOptions;

        // Evaluate all items
        const evaluatedItems = items.map((item, index) => ({
            item,
            index,
            value: evaluateItem(item, this.weights)
        }));

        // Sort by value
        evaluatedItems.sort((a, b) => b.value - a.value);

        // Get best picks
        const bestPicks = evaluatedItems.slice(0, pickCount);
        const totalPickValue = bestPicks.reduce((sum, p) => sum + p.value, 0);

        // Compare to skip bonus
        const skipValue = skipBonus * this.weights.economy;

        if (totalPickValue > skipValue) {
            return {
                action: 'pick',
                itemIndices: bestPicks.map(p => p.index),
                reason: `Pick value: ${totalPickValue.toFixed(1)} vs skip: ${skipValue.toFixed(1)}`
            };
        }

        return {
            action: 'skip',
            reason: `Skip value: ${skipValue.toFixed(1)} vs pick: ${totalPickValue.toFixed(1)}`
        };
    }

    /**
     * Decide how to arrange/sell equipment
     * @returns {{ action: 'keep'|'sell', itemIndices?: number[] }}
     */
    decideBuild(state) {
        // Default: keep everything
        // Could sell low-value or damaged items
        const sellIndices = [];

        for (let i = 0; i < state.mech.equipment.length; i++) {
            const item = state.mech.equipment[i];
            const value = evaluateItem(item, this.weights);

            // Sell if very low value and we have too many items
            if (value < 1 && state.mech.equipment.length > 5) {
                sellIndices.push(i);
            }
        }

        if (sellIndices.length > 0) {
            return { action: 'sell', itemIndices: sellIndices };
        }

        return { action: 'keep' };
    }
}

// ===========================================
// AGENT ARCHETYPES
// ===========================================

/**
 * Aggressive Agent - Maximizes damage output
 */
class AggressiveAgent extends BaseAgent {
    constructor() {
        super('Aggressive', {
            damage: 2.0,
            defense: 0.5,
            utility: 0.8,
            economy: 0.7,
            safety: 0.3,
            immediate: 1.5,
            future: 0.5
        });
    }

    decideShop(state, shopItems) {
        // Prioritize weapons
        let bestItem = null;
        let bestValue = -Infinity;
        let bestIndex = -1;

        for (let i = 0; i < shopItems.length; i++) {
            const item = shopItems[i];
            if (item.price > state.gold) continue;

            let value = evaluateItem(item, this.weights);

            // Bonus for weapons
            if (item.type === 'WEAPON') {
                value *= 1.5;
            }

            // Penalty for defensive items
            if (item.type === 'ARMOR' && !item.stats.damageBonus) {
                value *= 0.5;
            }

            value -= item.price * 0.5;  // Less price sensitive

            if (value > bestValue) {
                bestValue = value;
                bestItem = item;
                bestIndex = i;
            }
        }

        if (bestValue > 0 && bestItem) {
            return { action: 'buy', itemIndex: bestIndex, reason: `Aggressive buy: ${bestValue.toFixed(1)}` };
        }

        return { action: 'skip', reason: 'No weapons worth buying' };
    }

    decideMission(state, missions) {
        // Take harder missions for better rewards
        let bestMission = 0;
        let bestValue = -Infinity;

        for (let i = 0; i < missions.length; i++) {
            const mission = missions[i];
            let value = mission.reward.gold * 1.5 + mission.reward.xp * 0.2;

            // Bonus for harder missions
            if (mission.difficulty === 'Hard') value *= 1.3;
            if (mission.difficulty === 'Medium') value *= 1.1;

            // Aggressive agents like bosses
            if (mission.isBoss) value *= 1.2;

            if (value > bestValue) {
                bestValue = value;
                bestMission = i;
            }
        }

        return { action: 'select', missionIndex: bestMission, reason: `Aggressive mission: ${bestValue.toFixed(1)}` };
    }
}

/**
 * Defensive Agent - Maximizes survival
 */
class DefensiveAgent extends BaseAgent {
    constructor() {
        super('Defensive', {
            damage: 0.8,
            defense: 2.0,
            utility: 1.0,
            economy: 1.0,
            safety: 2.0,
            immediate: 1.0,
            future: 1.0
        });
    }

    decideShop(state, shopItems) {
        // Prioritize armor and shields
        let bestItem = null;
        let bestValue = -Infinity;
        let bestIndex = -1;

        for (let i = 0; i < shopItems.length; i++) {
            const item = shopItems[i];
            if (item.price > state.gold) continue;

            let value = evaluateItem(item, this.weights);

            // Bonus for defensive items
            if (item.type === 'ARMOR') {
                value *= 1.5;
            }

            // Bonus for reactors (sustain energy for shields)
            if (item.type === 'REACTOR') {
                value *= 1.3;
            }

            value -= item.price;

            if (value > bestValue) {
                bestValue = value;
                bestItem = item;
                bestIndex = i;
            }
        }

        if (bestValue > 0 && bestItem) {
            return { action: 'buy', itemIndex: bestIndex, reason: `Defensive buy: ${bestValue.toFixed(1)}` };
        }

        return { action: 'skip', reason: 'No defensive items worth buying' };
    }

    decideMission(state, missions) {
        // Take easier missions to avoid losses
        let bestMission = 0;
        let bestValue = -Infinity;

        for (let i = 0; i < missions.length; i++) {
            const mission = missions[i];
            let value = mission.reward.gold;

            // Penalty for harder missions
            if (mission.difficulty === 'Hard') value *= 0.5;
            if (mission.difficulty === 'Medium') value *= 0.8;

            // Penalty for multiple enemies
            value -= (mission.enemyCount - 1) * 5;

            // Defensive agents avoid bosses when possible
            if (mission.isBoss) value *= 0.7;

            if (value > bestValue) {
                bestValue = value;
                bestMission = i;
            }
        }

        return { action: 'select', missionIndex: bestMission, reason: `Defensive mission: ${bestValue.toFixed(1)}` };
    }
}

/**
 * Economist Agent - Maximizes gold efficiency
 */
class EconomistAgent extends BaseAgent {
    constructor() {
        super('Economist', {
            damage: 1.0,
            defense: 1.0,
            utility: 1.2,
            economy: 2.5,
            safety: 1.0,
            immediate: 0.5,
            future: 2.0
        });
    }

    decideShop(state, shopItems) {
        // Only buy if great value, save for interest
        const threshold = state.round <= 3 ? 0 : 3;  // Early game: skip, late game: more selective

        // Check if we should save for interest
        if (state.gold >= 4 && state.gold < ECONOMY.interestThreshold) {
            return { action: 'skip', reason: 'Saving for interest threshold' };
        }

        let bestItem = null;
        let bestValue = -Infinity;
        let bestIndex = -1;

        for (let i = 0; i < shopItems.length; i++) {
            const item = shopItems[i];
            if (item.price > state.gold) continue;

            const baseValue = evaluateItem(item, this.weights);
            const priceEfficiency = baseValue / item.price;

            // Only consider if very efficient
            if (priceEfficiency < 1.5) continue;

            const value = priceEfficiency;

            if (value > bestValue) {
                bestValue = value;
                bestItem = item;
                bestIndex = i;
            }
        }

        if (bestValue > threshold && bestItem) {
            return { action: 'buy', itemIndex: bestIndex, reason: `Efficient buy: ${bestValue.toFixed(1)} value/gold` };
        }

        return { action: 'skip', reason: 'Saving gold' };
    }

    decideSalvage(state, salvageOptions) {
        // Economist often skips salvage for gold
        const skipValue = salvageOptions.skipBonus * 2;  // Values gold highly
        const bestPickValue = salvageOptions.items
            .map(i => evaluateItem(i, this.weights))
            .sort((a, b) => b - a)[0] || 0;

        if (skipValue > bestPickValue * 1.2) {
            return { action: 'skip', reason: `Skip for ${salvageOptions.skipBonus}g` };
        }

        // Otherwise pick best item
        const evaluatedItems = salvageOptions.items.map((item, index) => ({
            index,
            value: evaluateItem(item, this.weights)
        }));
        evaluatedItems.sort((a, b) => b.value - a.value);

        return {
            action: 'pick',
            itemIndices: evaluatedItems.slice(0, salvageOptions.pickCount).map(e => e.index),
            reason: 'Best salvage value'
        };
    }
}

/**
 * Synergist Agent - Builds around combos
 */
class SynergistAgent extends BaseAgent {
    constructor() {
        super('Synergist', {
            damage: 1.0,
            defense: 0.8,
            utility: 1.0,
            economy: 0.8,
            safety: 0.8,
            immediate: 0.6,
            future: 1.5,
            synergy: 2.5
        });
        this.targetSynergy = null;  // Track what synergy we're building
    }

    decideShop(state, shopItems) {
        // Count current weapon types
        const typeCounts = {};
        for (const item of state.mech.equipment) {
            if (ITEM_TEMPLATES[item.templateId]?.type === 'WEAPON') {
                typeCounts[item.templateId] = (typeCounts[item.templateId] || 0) + 1;
            }
        }

        // If we have one of something, prioritize getting a second
        let targetType = null;
        for (const [type, count] of Object.entries(typeCounts)) {
            if (count === 1) {
                targetType = type;
                break;
            }
        }

        let bestItem = null;
        let bestValue = -Infinity;
        let bestIndex = -1;

        for (let i = 0; i < shopItems.length; i++) {
            const item = shopItems[i];
            if (item.price > state.gold) continue;

            let value = evaluateItem(item, this.weights);

            // Big bonus if completing a pair
            if (targetType && item.templateId === targetType) {
                value *= 2.5;
            }

            // Bonus for weapons (synergies are weapon-based)
            if (item.type === 'WEAPON') {
                value *= 1.2;
            }

            value -= item.price;

            if (value > bestValue) {
                bestValue = value;
                bestItem = item;
                bestIndex = i;
            }
        }

        if (bestValue > 0 && bestItem) {
            return { action: 'buy', itemIndex: bestIndex, reason: `Synergy buy: ${bestValue.toFixed(1)}` };
        }

        return { action: 'skip', reason: 'No synergy opportunities' };
    }

    decideSalvage(state, salvageOptions) {
        // Count current weapon types
        const typeCounts = {};
        for (const item of state.mech.equipment) {
            if (ITEM_TEMPLATES[item.templateId]?.type === 'WEAPON') {
                typeCounts[item.templateId] = (typeCounts[item.templateId] || 0) + 1;
            }
        }

        // Find target type
        let targetType = null;
        for (const [type, count] of Object.entries(typeCounts)) {
            if (count === 1) {
                targetType = type;
                break;
            }
        }

        // Evaluate items with synergy bonus
        const evaluatedItems = salvageOptions.items.map((item, index) => {
            let value = evaluateItem(item, this.weights);

            // Big bonus for matching type
            if (targetType && item.templateId === targetType) {
                value *= 2.0;
            }

            return { index, value };
        });

        evaluatedItems.sort((a, b) => b.value - a.value);
        const totalPickValue = evaluatedItems.slice(0, salvageOptions.pickCount)
            .reduce((sum, p) => sum + p.value, 0);

        if (totalPickValue > salvageOptions.skipBonus) {
            return {
                action: 'pick',
                itemIndices: evaluatedItems.slice(0, salvageOptions.pickCount).map(e => e.index),
                reason: 'Building synergy'
            };
        }

        return { action: 'skip', reason: 'No synergy in salvage' };
    }
}

/**
 * Adaptive Agent - Counter-builds based on upcoming enemies
 */
class AdaptiveAgent extends BaseAgent {
    constructor() {
        super('Adaptive', {
            damage: 1.0,
            defense: 1.0,
            utility: 1.0,
            economy: 1.0,
            safety: 1.2,
            immediate: 1.5,
            future: 0.8
        });
    }

    decideMission(state, missions) {
        // Calculate actual win probability for each mission
        const { calculateMechStats, simulateCombat } = require('./combat-simulator');
        const playerStats = calculateMechStats(state.mech);

        let bestMission = 0;
        let bestScore = -Infinity;

        for (let i = 0; i < missions.length; i++) {
            const mission = missions[i];

            // Estimate win probability based on stats
            let totalEnemyHP = 0;
            let totalEnemyDPS = 0;

            for (const enemy of mission.enemies) {
                const enemyStats = calculateMechStats(enemy);
                totalEnemyHP += enemyStats.maxHP;
                totalEnemyDPS += enemyStats.weapons.reduce((sum, w) => sum + w.damage, 0);
            }

            // Simple win probability estimate
            const playerPower = playerStats.maxHP + playerStats.weapons.reduce((sum, w) => sum + w.damage * 5, 0);
            const enemyPower = totalEnemyHP + totalEnemyDPS * 5;
            const winProb = playerPower / (playerPower + enemyPower);

            // Score = expected value
            const expectedValue = winProb * mission.reward.gold - (1 - winProb) * 2;

            if (expectedValue > bestScore) {
                bestScore = expectedValue;
                bestMission = i;
            }
        }

        return { action: 'select', missionIndex: bestMission, reason: `Adaptive: EV ${bestScore.toFixed(1)}` };
    }

    decideShop(state, shopItems) {
        // Buy items that shore up weaknesses
        const stats = calculateMechStats(state.mech);

        // Identify weaknesses
        const needsDamage = stats.weapons.reduce((sum, w) => sum + w.damage, 0) < 8;
        const needsDefense = stats.maxHP < 30;
        const needsEnergy = stats.energyCapacity < stats.totalEnergy;

        let bestItem = null;
        let bestValue = -Infinity;
        let bestIndex = -1;

        for (let i = 0; i < shopItems.length; i++) {
            const item = shopItems[i];
            if (item.price > state.gold) continue;

            let value = evaluateItem(item, this.weights);

            // Boost based on needs
            if (needsDamage && item.type === 'WEAPON') value *= 1.5;
            if (needsDefense && item.type === 'ARMOR') value *= 1.5;
            if (needsEnergy && item.type === 'REACTOR') value *= 2.0;

            value -= item.price;

            if (value > bestValue) {
                bestValue = value;
                bestItem = item;
                bestIndex = i;
            }
        }

        if (bestValue > 0 && bestItem) {
            return { action: 'buy', itemIndex: bestIndex, reason: `Adaptive buy: ${bestValue.toFixed(1)}` };
        }

        return { action: 'skip', reason: 'No urgent needs' };
    }
}

/**
 * Random Agent - Baseline for comparison
 */
class RandomAgent extends BaseAgent {
    constructor() {
        super('Random', {});
    }

    decideShop(state, shopItems) {
        // Random buy if can afford something
        const affordable = shopItems.filter(item => item.price <= state.gold);
        if (affordable.length > 0 && Math.random() < 0.5) {
            const item = affordable[Math.floor(Math.random() * affordable.length)];
            const index = shopItems.indexOf(item);
            return { action: 'buy', itemIndex: index, reason: 'Random choice' };
        }
        return { action: 'skip', reason: 'Random skip' };
    }

    decideMission(state, missions) {
        const index = Math.floor(Math.random() * missions.length);
        return { action: 'select', missionIndex: index, reason: 'Random mission' };
    }

    decideSalvage(state, salvageOptions) {
        if (Math.random() < 0.3) {
            return { action: 'skip', reason: 'Random skip' };
        }
        const indices = [];
        for (let i = 0; i < salvageOptions.pickCount; i++) {
            indices.push(Math.floor(Math.random() * salvageOptions.items.length));
        }
        return { action: 'pick', itemIndices: [...new Set(indices)], reason: 'Random picks' };
    }
}

/**
 * Greedy Agent - Always takes best immediate value
 */
class GreedyAgent extends BaseAgent {
    constructor() {
        super('Greedy', {
            damage: 1.0,
            defense: 1.0,
            utility: 1.0,
            economy: 0.5,
            safety: 0.5,
            immediate: 2.5,
            future: 0.3
        });
    }

    decideShop(state, shopItems) {
        // Always buy if can afford
        let bestItem = null;
        let bestValue = -Infinity;
        let bestIndex = -1;

        for (let i = 0; i < shopItems.length; i++) {
            const item = shopItems[i];
            if (item.price > state.gold) continue;

            const value = evaluateItem(item, this.weights);
            if (value > bestValue) {
                bestValue = value;
                bestItem = item;
                bestIndex = i;
            }
        }

        // Buy anything with positive value
        if (bestItem && bestValue > -5) {
            return { action: 'buy', itemIndex: bestIndex, reason: `Greedy buy: ${bestValue.toFixed(1)}` };
        }

        return { action: 'skip', reason: 'Nothing good enough' };
    }

    decideSalvage(state, salvageOptions) {
        // Always pick, never skip
        const evaluatedItems = salvageOptions.items.map((item, index) => ({
            index,
            value: evaluateItem(item, this.weights)
        }));
        evaluatedItems.sort((a, b) => b.value - a.value);

        return {
            action: 'pick',
            itemIndices: evaluatedItems.slice(0, salvageOptions.pickCount).map(e => e.index),
            reason: 'Greedy picks'
        };
    }
}

// ===========================================
// AGENT REGISTRY
// ===========================================
const AGENTS = {
    aggressive: AggressiveAgent,
    defensive: DefensiveAgent,
    economist: EconomistAgent,
    synergist: SynergistAgent,
    adaptive: AdaptiveAgent,
    random: RandomAgent,
    greedy: GreedyAgent,
    balanced: BaseAgent
};

function createAgent(type) {
    const AgentClass = AGENTS[type] || BaseAgent;
    return new AgentClass();
}

function getAllAgents() {
    return Object.keys(AGENTS).map(type => createAgent(type));
}

module.exports = {
    BaseAgent,
    AggressiveAgent,
    DefensiveAgent,
    EconomistAgent,
    SynergistAgent,
    AdaptiveAgent,
    RandomAgent,
    GreedyAgent,
    AGENTS,
    createAgent,
    getAllAgents,
    evaluateItem,
    evaluateMission
};
