/**
 * Game Constants - Extracted from test-babylon-havok.html
 * These are the balance-relevant parameters for the autobattler
 */

// ===========================================
// ECONOMY SYSTEM
// ===========================================
const ECONOMY = {
    startingGold: 5,
    winBonus: 2,
    lossBonus: 1,
    interestRate: 0.2,
    interestCap: 2,
    interestThreshold: 5,
    streakBonus: 1,
    maxStreak: 3,
    shopRefreshCost: 1,
    mechPrices: {
        common: 3,
        uncommon: 5,
        rare: 8,
        epic: 12,
        legendary: 18
    },
    weaponPrices: {
        common: 3,
        uncommon: 4,
        rare: 6,
        epic: 9,
        legendary: 14
    },
    sellMultiplier: 0.33,
    bargainDiscount: 0.7
};

// ===========================================
// ENEMY GENERATION
// ===========================================
const ENEMY_GENERATION = {
    baseBudget: 20,
    budgetPerLevel: 10,
    allocation: {
        health: 0.40,
        damage: 0.30,
        armor: 0.15,
        weapons: 0.15
    },
    rates: {
        healthPerBudget: 1.5,
        damagePerBudget: 0.4,
        armorPerBudget: 0.3,
        weaponBudget: 15
    },
    chassisTypes: [
        { name: 'Scout Frame', weight: 'light', healthMult: 0.7, damageMult: 0.8, armorMult: 0.5 },
        { name: 'Light Frame', weight: 'light', healthMult: 0.85, damageMult: 0.9, armorMult: 0.7 },
        { name: 'Medium Frame', weight: 'medium', healthMult: 1.0, damageMult: 1.0, armorMult: 1.0 },
        { name: 'Heavy Frame', weight: 'heavy', healthMult: 1.2, damageMult: 1.1, armorMult: 1.3 },
        { name: 'Assault Frame', weight: 'heavy', healthMult: 1.4, damageMult: 1.2, armorMult: 1.5 }
    ],
    namePrefixes: {
        1: ['Rusty', 'Worn', 'Patrol', 'Scout'],
        2: ['Standard', 'Militia', 'Guard', 'Sentry'],
        3: ['Veteran', 'Battle', 'Assault', 'Strike'],
        4: ['Elite', 'Heavy', 'Siege', 'War'],
        5: ['Champion', 'Destroyer', 'Havoc', 'Titan']
    },
    nameSuffixes: ['Mech', 'Walker', 'Unit', 'Bot', 'Drone', 'Hunter', 'Striker']
};

// ===========================================
// DIFFICULTY SCALING
// ===========================================
const DIFFICULTY = {
    getMultiplier(round) {
        if (round <= 4) return 0.6 + (round - 1) * 0.1;
        if (round === 5) return 1.5;
        if (round <= 9) return 1.0 + (round - 5) * 0.15;
        if (round === 10) return 2.5;
        return 2.0 + (round - 10) * 0.2;
    },
    isBossRound(round) {
        return round === 5 || round === 10 || (round > 10 && round % 5 === 0);
    },
    getBossType(round) {
        if (round === 5) return 'ELITE_COMMANDER';
        if (round === 10) return 'WARLORD';
        if (round === 15) return 'TITAN_PRIME';
        return 'BOSS_' + round;
    },
    bossMultipliers: {
        ELITE_COMMANDER: { hp: 1.5, damage: 1.3, armor: 1.3 },
        WARLORD: { hp: 2.0, damage: 1.5, armor: 1.5 },
        TITAN_PRIME: { hp: 2.5, damage: 1.8, armor: 2.0 }
    }
};

// ===========================================
// SALVAGE SYSTEM
// ===========================================
const SALVAGE = {
    normalOptions: 4,
    bossOptions: 6,
    normalPicks: 1,
    bossPicks: 2,
    highValueChance: 0.2,
    comboChance: 0.15,
    damagedChance: 0.9,
    damagedLevelReduction: [1, 2],
    rarityRates: {
        Easy: { common: 0.75, uncommon: 0.20, rare: 0.05, epic: 0, legendary: 0 },
        Medium: { common: 0.60, uncommon: 0.30, rare: 0.08, epic: 0.02, legendary: 0 },
        Hard: { common: 0.45, uncommon: 0.35, rare: 0.12, epic: 0.06, legendary: 0.02 }
    }
};

// ===========================================
// MISSION TEMPLATES
// ===========================================
const MISSION_TEMPLATES = {
    patrol: {
        id: 'patrol',
        name: 'Border Patrol',
        difficulty: 'Easy',
        risk: 1,
        baseBudgetMult: 0.6,
        enemyCount: 1,
        description: 'Light recon mission. Expect minimal resistance.',
        rewardMult: 1.0
    },
    skirmish: {
        id: 'skirmish',
        name: 'Skirmish Zone',
        difficulty: 'Easy',
        risk: 1,
        baseBudgetMult: 0.5,
        enemyCount: 2,
        description: 'Light engagement. Multiple weak hostiles detected.',
        rewardMult: 1.2
    },
    convoy: {
        id: 'convoy',
        name: 'Convoy Assault',
        difficulty: 'Medium',
        risk: 2,
        baseBudgetMult: 1.0,
        enemyCount: 1,
        description: 'Intercept enemy supply convoy. Medium resistance expected.',
        rewardMult: 1.5
    },
    ambush: {
        id: 'ambush',
        name: 'Ambush Site',
        difficulty: 'Medium',
        risk: 2,
        baseBudgetMult: 0.7,
        enemyCount: 2,
        description: 'Clear hostile ambush. Two medium threats detected.',
        rewardMult: 1.8
    },
    fortress: {
        id: 'fortress',
        name: 'Fortress Breach',
        difficulty: 'Hard',
        risk: 3,
        baseBudgetMult: 1.5,
        enemyCount: 1,
        description: 'Assault heavily defended position. Prepare for heavy combat.',
        rewardMult: 2.5
    },
    warzone: {
        id: 'warzone',
        name: 'Active Warzone',
        difficulty: 'Hard',
        risk: 3,
        baseBudgetMult: 0.9,
        enemyCount: 3,
        description: 'Enter active combat zone. Multiple hostiles incoming.',
        rewardMult: 3.0
    }
};

// ===========================================
// MECH CHASSIS
// ===========================================
const MECH_TEMPLATES = {
    scout: {
        id: 'scout',
        name: 'Scout Frame',
        class: 'Light',
        tonnage: 35,
        modSpace: 12,
        baseHP: 25,
        baseArmor: 0,
        baseSpeed: 1.3,
        baseAccuracy: 70,
        specialAbility: 'EVASION',
        specialValue: 0.15,
        price: 0,
        rarity: 'common'
    },
    warrior: {
        id: 'warrior',
        name: 'Warrior Frame',
        class: 'Medium',
        tonnage: 55,
        modSpace: 18,
        baseHP: 35,
        baseArmor: 0,
        baseSpeed: 1.0,
        baseAccuracy: 65,
        specialAbility: 'FOCUS_FIRE',
        specialValue: 0.10,
        price: 8,
        rarity: 'uncommon'
    },
    titan: {
        id: 'titan',
        name: 'Titan Frame',
        class: 'Heavy',
        tonnage: 80,
        modSpace: 24,
        baseHP: 50,
        baseArmor: 2,
        baseSpeed: 0.7,
        baseAccuracy: 55,
        specialAbility: 'FORTRESS',
        specialValue: 0.20,
        price: 15,
        rarity: 'rare'
    }
};

// ===========================================
// ITEM TEMPLATES (Weapons, Armor, Systems)
// ===========================================
const ITEM_TEMPLATES = {
    // WEAPONS
    railgun: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'ballistic',
        baseStats: { weight: 3, energyDraw: 1, damage: 5 },
        baseBattle: {
            projectileSpeed: 55,
            knockback: 25,
            shotsPerRound: 1,
            isBeam: false,
            accuracy: 0.85
        }
    },
    laser: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'energy',
        baseStats: { weight: 2, energyDraw: 2, damage: 4 },
        baseBattle: {
            isBeam: true,
            knockback: 8,
            shotsPerRound: 1,
            accuracy: 0.95  // Beams are accurate
        }
    },
    missile: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'missile',
        baseStats: { weight: 3, energyDraw: 1, damage: 5 },
        baseBattle: {
            projectileSpeed: 30,
            knockback: 30,
            shotsPerRound: 1,
            isBeam: false,
            accuracy: 0.75  // Missiles can miss
        }
    },
    machinegun: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'ballistic',
        baseStats: { weight: 1, energyDraw: 1, damage: 2 },
        baseBattle: {
            projectileSpeed: 60,
            knockback: 5,
            shotsPerRound: 3,
            isBeam: false,
            accuracy: 0.70  // Spray and pray
        }
    },

    // ARMOR
    ballistic_plating: {
        type: 'ARMOR',
        category: 'armor',
        baseStats: { weight: 2, energyDraw: 0, damageReduction: 1 }
    },
    reactive_plating: {
        type: 'ARMOR',
        category: 'armor',
        baseStats: { weight: 3, energyDraw: 0, damageReduction: 2 }
    },
    hull_armor: {
        type: 'ARMOR',
        category: 'armor',
        baseStats: { weight: 2, energyDraw: 0, hpBonus: 8 }
    },
    heavy_hull: {
        type: 'ARMOR',
        category: 'armor',
        baseStats: { weight: 4, energyDraw: 0, hpBonus: 15 }
    },
    energy_shield: {
        type: 'ARMOR',
        category: 'armor',
        baseStats: { weight: 1, energyDraw: 1, energyShieldHP: 10 }
    },

    // REACTORS
    reactor: {
        type: 'REACTOR',
        category: 'reactor',
        baseStats: { weight: 2, energyDraw: -3, heatCapacity: 15 }
    },
    power_cell: {
        type: 'REACTOR',
        category: 'reactor',
        baseStats: { weight: 1, energyDraw: -2, heatCapacity: 10 }
    },

    // SYSTEMS
    targeting_link: {
        type: 'SYSTEM',
        category: 'system',
        baseStats: { weight: 0, energyDraw: 0, damageBonus: 1 }
    },
    targeting_hub: {
        type: 'SYSTEM',
        category: 'system',
        baseStats: { weight: 0, energyDraw: 1, damageBonus: 2 }
    },
    gyro: {
        type: 'SYSTEM',
        category: 'system',
        baseStats: { weight: 1, energyDraw: 0, stabilityBonus: 20 }
    },
    heat_sink: {
        type: 'SYSTEM',
        category: 'system',
        baseStats: { weight: 1, energyDraw: 0, energyReduction: 1 }
    }
};

// ===========================================
// COMPONENT GENERATION (Rarity scaling)
// ===========================================
const COMPONENT_GENERATION = {
    rarityMultipliers: {
        common: 1.0,
        uncommon: 1.15,
        rare: 1.35,
        epic: 1.6,
        legendary: 2.0
    },
    levelBudgetBonus: 0.5,
    budgetVariance: 0.15
};

// ===========================================
// ITEM COMBOS (Synergies)
// ===========================================
const ITEM_COMBOS = {
    laser_set: {
        name: 'Laser Array Set',
        items: ['laser', 'laser'],
        bonus: '+15% Laser Damage',
        effect: { type: 'damage_boost', damageType: 'energy', amount: 0.15 }
    },
    missile_barrage: {
        name: 'Missile Barrage Kit',
        items: ['missile', 'missile'],
        bonus: '+20% Knockback',
        effect: { type: 'knockback_boost', amount: 0.20 }
    },
    rapid_assault: {
        name: 'Rapid Assault Package',
        items: ['machinegun', 'machinegun'],
        bonus: '+1 Shot/Round',
        effect: { type: 'shots_boost', amount: 1 }
    },
    heavy_hitter: {
        name: 'Heavy Hitter Bundle',
        items: ['railgun', 'ballistic_plating'],
        bonus: '+10% Damage, +1 Armor',
        effect: { type: 'mixed', damage: 0.10, armor: 1 }
    },
    fortress: {
        name: 'Fortress Setup',
        items: ['heavy_hull', 'reactive_plating'],
        bonus: '+25% HP',
        effect: { type: 'hp_boost', amount: 0.25 }
    }
};

module.exports = {
    ECONOMY,
    ENEMY_GENERATION,
    DIFFICULTY,
    SALVAGE,
    MISSION_TEMPLATES,
    MECH_TEMPLATES,
    ITEM_TEMPLATES,
    COMPONENT_GENERATION,
    ITEM_COMBOS
};
