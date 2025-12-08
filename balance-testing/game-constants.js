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
    // Interest: 1g per 5g saved, max 5g per turn
    interestPer: 5,        // Earn 1g for every 5g saved
    interestMax: 5,        // Maximum interest per turn
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

// Calculate interest: 1g per 5g saved, max 5g
function calculateInterest(gold) {
    const interest = Math.floor(gold / ECONOMY.interestPer);
    return Math.min(interest, ECONOMY.interestMax);
}

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
    // Base difficulty by round
    getMultiplier(round) {
        if (round <= 4) return 0.6 + (round - 1) * 0.1;
        if (round === 5) return 1.5;
        if (round <= 9) return 1.0 + (round - 5) * 0.15;
        if (round === 10) return 2.5;
        return 2.0 + (round - 10) * 0.2;
    },

    // Per-round scaling applied to ALL missions (compounds with difficulty)
    getRoundScaling(round) {
        // Every round gets 8% harder
        return 1.0 + (round - 1) * 0.08;
    },

    // Difficulty multipliers by mission type (Medium and Hard are now harder)
    missionDifficultyMult: {
        Easy: 1.0,
        Medium: 1.4,   // Was effectively ~1.0, now 40% harder
        Hard: 1.8      // Was effectively ~1.5, now 80% harder
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
// MISSION TEMPLATES (with updated difficulties)
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
        rewardMult: 1.8    // Increased reward for harder mission
    },
    ambush: {
        id: 'ambush',
        name: 'Ambush Site',
        difficulty: 'Medium',
        risk: 2,
        baseBudgetMult: 0.8,
        enemyCount: 2,
        description: 'Clear hostile ambush. Two medium threats detected.',
        rewardMult: 2.2    // Increased reward
    },
    fortress: {
        id: 'fortress',
        name: 'Fortress Breach',
        difficulty: 'Hard',
        risk: 3,
        baseBudgetMult: 1.5,
        enemyCount: 1,
        description: 'Assault heavily defended position. Prepare for heavy combat.',
        rewardMult: 3.0    // Increased reward for much harder mission
    },
    warzone: {
        id: 'warzone',
        name: 'Active Warzone',
        difficulty: 'Hard',
        risk: 3,
        baseBudgetMult: 1.0,
        enemyCount: 3,
        description: 'Enter active combat zone. Multiple hostiles incoming.',
        rewardMult: 4.0    // Increased reward
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
// LEVEL SCALING SYSTEM
// ===========================================
// Each item type has custom level scaling rules
const LEVEL_SCALING = {
    // Pulse weapons: gain shots at level 5, 10, etc.
    pulse_laser: {
        damagePerLevel: 0.5,      // +50% damage per level
        shotsBreakpoints: [5, 10, 15],  // Gain +1 shot at these levels
        baseShots: 3
    },

    // Beam weapons: continuous damage, scales smoothly
    beam_laser: {
        damagePerLevel: 0.25,     // +25% per level
        durationPerLevel: 0.1    // +10% beam duration per level
    },

    // Railguns: high single-shot damage
    railgun: {
        damagePerLevel: 0.4,      // +40% per level
        penetrationAtLevel: [3, 7],  // Gains armor penetration at these levels
        penetrationAmount: 1
    },

    // Missiles: more missiles at higher levels
    missile: {
        damagePerLevel: 0.2,      // +20% per level
        clusterBreakpoints: [4, 8, 12],  // Splits into more missiles
        baseCluster: 1
    },

    // Machine guns: more shots, slightly more damage
    machinegun: {
        damagePerLevel: 0.15,     // +15% per level
        shotsBreakpoints: [3, 6, 9],  // +1 shot at these levels
        baseShots: 3
    },

    // Armor: linear scaling
    armor: {
        reductionPerLevel: 0.5,   // +0.5 damage reduction per level
        hpPerLevel: 0.3           // +30% HP bonus per level
    },

    // Shields: capacity scales, recharge improves
    shield: {
        capacityPerLevel: 0.35,   // +35% capacity per level
        rechargeAtLevel: [5, 10]  // Gains recharge at these levels
    },

    // Reactors: more energy at higher levels
    reactor: {
        energyPerLevel: 0.25,     // +25% energy per level
        efficiencyAtLevel: [4, 8] // Reduces heat at these levels
    }
};

// Calculate stats for an item at a given level
function calculateLeveledStats(templateId, baseStats, level, template) {
    const stats = { ...baseStats };
    const scaling = LEVEL_SCALING[templateId] || LEVEL_SCALING[template?.category] || null;

    if (!scaling) {
        // Default scaling: +15% per level for main stat
        const levelMult = 1 + (level - 1) * 0.15;
        for (const key of Object.keys(stats)) {
            if (typeof stats[key] === 'number' && key !== 'weight' && key !== 'energyDraw') {
                if (key === 'energyDraw' && stats[key] < 0) {
                    // Energy provided scales
                    stats[key] = Math.round(stats[key] * levelMult);
                } else if (stats[key] > 0) {
                    stats[key] = Math.round(stats[key] * levelMult * 10) / 10;
                }
            }
        }
        return stats;
    }

    // Apply custom scaling
    if (scaling.damagePerLevel && stats.damage) {
        stats.damage = Math.round(stats.damage * (1 + (level - 1) * scaling.damagePerLevel) * 10) / 10;
    }
    if (scaling.reductionPerLevel && stats.damageReduction) {
        stats.damageReduction = Math.round((stats.damageReduction + (level - 1) * scaling.reductionPerLevel) * 10) / 10;
    }
    if (scaling.hpPerLevel && stats.hpBonus) {
        stats.hpBonus = Math.round(stats.hpBonus * (1 + (level - 1) * scaling.hpPerLevel));
    }
    if (scaling.capacityPerLevel && stats.energyShieldHP) {
        stats.energyShieldHP = Math.round(stats.energyShieldHP * (1 + (level - 1) * scaling.capacityPerLevel));
    }
    if (scaling.energyPerLevel && stats.energyDraw < 0) {
        stats.energyDraw = Math.round(stats.energyDraw * (1 + (level - 1) * scaling.energyPerLevel));
    }

    return stats;
}

// Calculate battle properties for an item at a given level
function calculateLeveledBattle(templateId, baseBattle, level) {
    const battle = { ...baseBattle };
    const scaling = LEVEL_SCALING[templateId] || null;

    if (!scaling) return battle;

    // Shots breakpoints
    if (scaling.shotsBreakpoints && scaling.baseShots) {
        let extraShots = 0;
        for (const bp of scaling.shotsBreakpoints) {
            if (level >= bp) extraShots++;
        }
        battle.shotsPerRound = scaling.baseShots + extraShots;
    }

    // Cluster breakpoints (missiles)
    if (scaling.clusterBreakpoints && scaling.baseCluster) {
        let clusters = scaling.baseCluster;
        for (const bp of scaling.clusterBreakpoints) {
            if (level >= bp) clusters++;
        }
        battle.clusterCount = clusters;
    }

    // Penetration (railguns)
    if (scaling.penetrationAtLevel) {
        let pen = 0;
        for (const bp of scaling.penetrationAtLevel) {
            if (level >= bp) pen += scaling.penetrationAmount;
        }
        battle.armorPenetration = pen;
    }

    // Beam duration
    if (scaling.durationPerLevel && battle.beamDuration) {
        battle.beamDuration = Math.round(battle.beamDuration * (1 + (level - 1) * scaling.durationPerLevel));
    }

    return battle;
}

// ===========================================
// ITEM TEMPLATES (Expanded with synergies)
// ===========================================
const ITEM_TEMPLATES = {
    // ===========================================
    // WEAPONS - Ballistic
    // ===========================================
    railgun: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'ballistic',
        synergyTags: ['ballistic', 'precision', 'heavy'],
        baseStats: { weight: 3, energyDraw: 1, damage: 5 },
        baseBattle: {
            projectileSpeed: 55,
            knockback: 25,
            shotsPerRound: 1,
            isBeam: false,
            accuracy: 0.85
        }
    },
    autocannon: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'ballistic',
        synergyTags: ['ballistic', 'sustained', 'heavy'],
        baseStats: { weight: 4, energyDraw: 1, damage: 3 },
        baseBattle: {
            projectileSpeed: 50,
            knockback: 15,
            shotsPerRound: 2,
            isBeam: false,
            accuracy: 0.80
        }
    },
    machinegun: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'ballistic',
        synergyTags: ['ballistic', 'sustained', 'light'],
        baseStats: { weight: 1, energyDraw: 1, damage: 2 },
        baseBattle: {
            projectileSpeed: 60,
            knockback: 5,
            shotsPerRound: 3,
            isBeam: false,
            accuracy: 0.70
        }
    },
    gauss_rifle: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'ballistic',
        synergyTags: ['ballistic', 'precision', 'tech'],
        baseStats: { weight: 2, energyDraw: 2, damage: 7 },
        baseBattle: {
            projectileSpeed: 70,
            knockback: 20,
            shotsPerRound: 1,
            isBeam: false,
            accuracy: 0.90,
            armorPenetration: 1
        }
    },

    // ===========================================
    // WEAPONS - Energy
    // ===========================================
    laser: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'energy',
        synergyTags: ['energy', 'precision', 'light'],
        baseStats: { weight: 2, energyDraw: 2, damage: 4 },
        baseBattle: {
            isBeam: true,
            beamDuration: 200,
            knockback: 8,
            shotsPerRound: 1,
            accuracy: 0.95
        }
    },
    pulse_laser: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'energy',
        synergyTags: ['energy', 'sustained', 'light'],
        baseStats: { weight: 1, energyDraw: 2, damage: 1 },
        baseBattle: {
            isBeam: false,
            knockback: 3,
            shotsPerRound: 3,
            accuracy: 0.85,
            projectileSpeed: 80
        }
    },
    heavy_laser: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'energy',
        synergyTags: ['energy', 'precision', 'heavy'],
        baseStats: { weight: 3, energyDraw: 3, damage: 8 },
        baseBattle: {
            isBeam: true,
            beamDuration: 300,
            knockback: 15,
            shotsPerRound: 1,
            accuracy: 0.92
        }
    },
    plasma_cannon: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'energy',
        synergyTags: ['energy', 'heavy', 'tech'],
        baseStats: { weight: 4, energyDraw: 4, damage: 10 },
        baseBattle: {
            isBeam: false,
            knockback: 35,
            shotsPerRound: 1,
            accuracy: 0.75,
            projectileSpeed: 35,
            splashDamage: 0.3  // 30% splash to nearby
        }
    },

    // ===========================================
    // WEAPONS - Missile
    // ===========================================
    missile: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'missile',
        synergyTags: ['missile', 'explosive', 'tracking'],
        baseStats: { weight: 3, energyDraw: 1, damage: 5 },
        baseBattle: {
            projectileSpeed: 30,
            knockback: 30,
            shotsPerRound: 1,
            isBeam: false,
            accuracy: 0.75,
            tracking: true
        }
    },
    swarm_missiles: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'missile',
        synergyTags: ['missile', 'sustained', 'tracking'],
        baseStats: { weight: 2, energyDraw: 1, damage: 2 },
        baseBattle: {
            projectileSpeed: 35,
            knockback: 10,
            shotsPerRound: 4,
            isBeam: false,
            accuracy: 0.65,
            tracking: true
        }
    },
    heavy_missile: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'missile',
        synergyTags: ['missile', 'explosive', 'heavy'],
        baseStats: { weight: 4, energyDraw: 2, damage: 12 },
        baseBattle: {
            projectileSpeed: 25,
            knockback: 50,
            shotsPerRound: 1,
            isBeam: false,
            accuracy: 0.70,
            tracking: true,
            splashDamage: 0.4
        }
    },
    rocket_pod: {
        type: 'WEAPON',
        category: 'weapon',
        damageType: 'missile',
        synergyTags: ['missile', 'explosive', 'sustained'],
        baseStats: { weight: 2, energyDraw: 0, damage: 3 },
        baseBattle: {
            projectileSpeed: 40,
            knockback: 20,
            shotsPerRound: 2,
            isBeam: false,
            accuracy: 0.60,
            tracking: false  // Unguided rockets
        }
    },

    // ===========================================
    // ARMOR - Damage Reduction
    // ===========================================
    ballistic_plating: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['armor', 'ballistic_resist', 'light'],
        baseStats: { weight: 2, energyDraw: 0, damageReduction: 1 }
    },
    reactive_plating: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['armor', 'ballistic_resist', 'heavy'],
        baseStats: { weight: 3, energyDraw: 0, damageReduction: 2 }
    },
    composite_armor: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['armor', 'ballistic_resist', 'tech'],
        baseStats: { weight: 2, energyDraw: 0, damageReduction: 1, energyResist: 1 }
    },

    // ===========================================
    // ARMOR - HP Boost
    // ===========================================
    hull_armor: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['armor', 'hp_boost', 'light'],
        baseStats: { weight: 2, energyDraw: 0, hpBonus: 8 }
    },
    heavy_hull: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['armor', 'hp_boost', 'heavy'],
        baseStats: { weight: 4, energyDraw: 0, hpBonus: 15 }
    },
    reinforced_frame: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['armor', 'hp_boost', 'structure'],
        baseStats: { weight: 3, energyDraw: 0, hpBonus: 10, stabilityBonus: 10 }
    },

    // ===========================================
    // ARMOR - Energy Shields
    // ===========================================
    energy_shield: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['shield', 'energy_resist', 'light'],
        baseStats: { weight: 1, energyDraw: 1, energyShieldHP: 10 }
    },
    heavy_shield: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['shield', 'energy_resist', 'heavy'],
        baseStats: { weight: 2, energyDraw: 2, energyShieldHP: 20 }
    },
    hardened_shield: {
        type: 'ARMOR',
        category: 'armor',
        synergyTags: ['shield', 'energy_resist', 'tech'],
        baseStats: { weight: 2, energyDraw: 2, energyShieldHP: 15, shieldRegen: 2 }
    },

    // ===========================================
    // REACTORS
    // ===========================================
    reactor: {
        type: 'REACTOR',
        category: 'reactor',
        synergyTags: ['power', 'energy', 'standard'],
        baseStats: { weight: 2, energyDraw: -3, heatCapacity: 15 }
    },
    power_cell: {
        type: 'REACTOR',
        category: 'reactor',
        synergyTags: ['power', 'energy', 'light'],
        baseStats: { weight: 1, energyDraw: -2, heatCapacity: 10 }
    },
    fusion_core: {
        type: 'REACTOR',
        category: 'reactor',
        synergyTags: ['power', 'energy', 'heavy', 'tech'],
        baseStats: { weight: 3, energyDraw: -5, heatCapacity: 20 }
    },
    capacitor_bank: {
        type: 'REACTOR',
        category: 'reactor',
        synergyTags: ['power', 'energy', 'burst'],
        baseStats: { weight: 1, energyDraw: -1, burstEnergy: 3 }  // Extra energy for first 3 rounds
    },

    // ===========================================
    // TARGETING SYSTEMS
    // ===========================================
    targeting_link: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['targeting', 'precision', 'light'],
        baseStats: { weight: 0, energyDraw: 0, damageBonus: 1 }
    },
    targeting_hub: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['targeting', 'precision', 'tech'],
        baseStats: { weight: 0, energyDraw: 1, damageBonus: 2, accuracyBonus: 5 }
    },
    fire_control: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['targeting', 'sustained', 'tech'],
        baseStats: { weight: 1, energyDraw: 1, damageBonus: 1, shotsBonus: 1 }
    },

    // ===========================================
    // MOBILITY SYSTEMS
    // ===========================================
    gyro: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['mobility', 'stability', 'standard'],
        baseStats: { weight: 1, energyDraw: 0, stabilityBonus: 20, evasionBonus: 5 }
    },
    jump_jets: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['mobility', 'evasion', 'light'],
        baseStats: { weight: 1, energyDraw: 1, evasionBonus: 15, mobilityBonus: 1 }
    },
    sprint_module: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['mobility', 'speed', 'light'],
        baseStats: { weight: 0, energyDraw: 1, speedBonus: 0.3, initiativeBonus: 10 }
    },

    // ===========================================
    // COOLING SYSTEMS
    // ===========================================
    heat_sink: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['cooling', 'energy', 'standard'],
        baseStats: { weight: 1, energyDraw: 0, energyReduction: 1, heatCapacity: 5 }
    },
    cryo_cooler: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['cooling', 'energy', 'tech'],
        baseStats: { weight: 2, energyDraw: 0, energyReduction: 2, heatCapacity: 10 }
    },

    // ===========================================
    // SPECIAL SYSTEMS
    // ===========================================
    ammo_feed: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['ballistic', 'sustained', 'ammo'],
        baseStats: { weight: 1, energyDraw: 0, ballisticDamageBonus: 2 }
    },
    missile_guidance: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['missile', 'tracking', 'tech'],
        baseStats: { weight: 1, energyDraw: 1, missileAccuracyBonus: 20, missileDamageBonus: 1 }
    },
    energy_capacitor: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['energy', 'burst', 'tech'],
        baseStats: { weight: 1, energyDraw: 1, energyDamageBonus: 2 }
    },
    repair_nanites: {
        type: 'SYSTEM',
        category: 'system',
        synergyTags: ['repair', 'sustain', 'tech'],
        baseStats: { weight: 1, energyDraw: 1, hpRegen: 2 }  // Regen 2 HP per round
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
// ITEM COMBOS (Expanded Synergies)
// ===========================================
const ITEM_COMBOS = {
    // === Weapon Type Synergies ===
    laser_array: {
        name: 'Laser Array',
        requiredTags: ['energy', 'energy'],  // Two energy weapons
        bonus: '+20% Energy Damage',
        effect: { type: 'damage_boost', damageType: 'energy', amount: 0.20 }
    },
    missile_barrage: {
        name: 'Missile Barrage',
        requiredTags: ['missile', 'missile'],
        bonus: '+25% Missile Damage, +15% Knockback',
        effect: { type: 'mixed', missileDamage: 0.25, knockback: 0.15 }
    },
    ballistic_storm: {
        name: 'Ballistic Storm',
        requiredTags: ['ballistic', 'ballistic'],
        bonus: '+15% Ballistic Damage, +1 Shot',
        effect: { type: 'mixed', ballisticDamage: 0.15, shots: 1 }
    },

    // === Playstyle Synergies ===
    precision_package: {
        name: 'Precision Package',
        requiredTags: ['precision', 'targeting'],
        bonus: '+20% Accuracy, +2 Damage',
        effect: { type: 'mixed', accuracy: 0.20, damage: 2 }
    },
    sustained_fire: {
        name: 'Sustained Fire',
        requiredTags: ['sustained', 'sustained'],
        bonus: '+2 Shots/Round',
        effect: { type: 'shots_boost', amount: 2 }
    },
    heavy_ordinance: {
        name: 'Heavy Ordinance',
        requiredTags: ['heavy', 'heavy'],
        bonus: '+30% Damage, -10% Speed',
        effect: { type: 'mixed', damage: 0.30, speed: -0.10 }
    },

    // === Defense Synergies ===
    fortress_setup: {
        name: 'Fortress Setup',
        requiredTags: ['armor', 'armor', 'hp_boost'],
        bonus: '+30% HP, +1 Armor',
        effect: { type: 'mixed', hp: 0.30, armor: 1 }
    },
    energy_fortress: {
        name: 'Energy Fortress',
        requiredTags: ['shield', 'shield'],
        bonus: '+40% Shield Capacity',
        effect: { type: 'shield_boost', amount: 0.40 }
    },
    adaptive_defense: {
        name: 'Adaptive Defense',
        requiredTags: ['armor', 'shield'],
        bonus: '+15% HP, +15% Shield',
        effect: { type: 'mixed', hp: 0.15, shield: 0.15 }
    },

    // === Tech Synergies ===
    tech_suite: {
        name: 'Advanced Tech Suite',
        requiredTags: ['tech', 'tech', 'tech'],
        bonus: '+25% All Damage, -1 Energy Cost',
        effect: { type: 'mixed', damage: 0.25, energyCost: -1 }
    },
    power_surge: {
        name: 'Power Surge',
        requiredTags: ['power', 'energy'],
        bonus: '+20% Energy Weapon Damage',
        effect: { type: 'damage_boost', damageType: 'energy', amount: 0.20 }
    },

    // === Mobility Synergies ===
    evasion_suite: {
        name: 'Evasion Suite',
        requiredTags: ['mobility', 'mobility'],
        bonus: '+25% Evasion',
        effect: { type: 'evasion_boost', amount: 0.25 }
    },
    hit_and_run: {
        name: 'Hit and Run',
        requiredTags: ['light', 'mobility', 'precision'],
        bonus: '+15% Damage, +15% Evasion',
        effect: { type: 'mixed', damage: 0.15, evasion: 0.15 }
    },

    // === Weapon + Support Synergies ===
    guided_missiles: {
        name: 'Guided Missile System',
        requiredTags: ['missile', 'tracking'],
        bonus: '+30% Missile Accuracy',
        effect: { type: 'accuracy_boost', damageType: 'missile', amount: 0.30 }
    },
    overclocked_lasers: {
        name: 'Overclocked Lasers',
        requiredTags: ['energy', 'cooling'],
        bonus: '+25% Energy Damage, No Overheat',
        effect: { type: 'damage_boost', damageType: 'energy', amount: 0.25 }
    },
    ammo_specialist: {
        name: 'Ammo Specialist',
        requiredTags: ['ballistic', 'ammo'],
        bonus: '+30% Ballistic Damage',
        effect: { type: 'damage_boost', damageType: 'ballistic', amount: 0.30 }
    },

    // === Ultimate Synergies (3+ items) ===
    glass_cannon: {
        name: 'Glass Cannon',
        requiredTags: ['heavy', 'heavy', 'precision'],
        incompatibleTags: ['armor', 'shield'],
        bonus: '+50% Damage',
        effect: { type: 'damage_boost', amount: 0.50 }
    },
    walking_tank: {
        name: 'Walking Tank',
        requiredTags: ['armor', 'armor', 'hp_boost', 'hp_boost'],
        bonus: '+50% HP, +2 Armor, -20% Speed',
        effect: { type: 'mixed', hp: 0.50, armor: 2, speed: -0.20 }
    },
    swarm_commander: {
        name: 'Swarm Commander',
        requiredTags: ['sustained', 'sustained', 'sustained'],
        bonus: '+3 Shots/Round, +10% Accuracy',
        effect: { type: 'mixed', shots: 3, accuracy: 0.10 }
    }
};

// ===========================================
// HELPER: Check if mech has synergy
// ===========================================
function checkSynergies(equipment) {
    const activeSynergies = [];
    const allTags = [];

    // Collect all tags from equipment
    for (const item of equipment) {
        const template = ITEM_TEMPLATES[item.templateId];
        if (template?.synergyTags) {
            allTags.push(...template.synergyTags);
        }
    }

    // Check each combo
    for (const [comboId, combo] of Object.entries(ITEM_COMBOS)) {
        const requiredTags = [...combo.requiredTags];
        const availableTags = [...allTags];

        let hasAll = true;
        for (const tag of requiredTags) {
            const idx = availableTags.indexOf(tag);
            if (idx >= 0) {
                availableTags.splice(idx, 1);
            } else {
                hasAll = false;
                break;
            }
        }

        // Check incompatible tags
        if (hasAll && combo.incompatibleTags) {
            for (const tag of combo.incompatibleTags) {
                if (allTags.includes(tag)) {
                    hasAll = false;
                    break;
                }
            }
        }

        if (hasAll) {
            activeSynergies.push({ id: comboId, ...combo });
        }
    }

    return activeSynergies;
}

module.exports = {
    ECONOMY,
    ENEMY_GENERATION,
    DIFFICULTY,
    SALVAGE,
    MISSION_TEMPLATES,
    MECH_TEMPLATES,
    ITEM_TEMPLATES,
    COMPONENT_GENERATION,
    ITEM_COMBOS,
    LEVEL_SCALING,
    calculateInterest,
    calculateLeveledStats,
    calculateLeveledBattle,
    checkSynergies
};
