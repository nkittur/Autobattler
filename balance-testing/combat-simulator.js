/**
 * Deterministic Combat Simulator
 *
 * Resolves combat without physics simulation using expected values.
 * This allows running thousands of battles per second.
 */

const {
    ITEM_TEMPLATES,
    MECH_TEMPLATES,
    calculateLeveledStats,
    calculateLeveledBattle,
    checkSynergies
} = require('./game-constants');

// Combat configuration
const COMBAT_CONFIG = {
    roundDuration: 3.0,      // Seconds per combat round
    maxRounds: 30,           // Max rounds before draw
    baseTurnOrder: 100,      // Base initiative
    weightInitiativePenalty: 0.5,  // Initiative penalty per weight
    minDamage: 1             // Minimum damage dealt
};

/**
 * Calculate effective stats for a mech with all its equipment
 */
function calculateMechStats(mech) {
    const chassis = mech.chassis || MECH_TEMPLATES.scout;

    // Base stats from chassis
    const stats = {
        maxHP: chassis.baseHP || 25,
        currentHP: 0,  // Will be set to maxHP
        armor: chassis.baseArmor || 0,
        damageReduction: 0,
        energyShieldHP: 0,
        energyShieldMax: 0,
        shieldRegen: 0,
        speed: chassis.baseSpeed || 1.0,
        accuracy: chassis.baseAccuracy || 65,
        evasion: chassis.specialAbility === 'EVASION' ? chassis.specialValue : 0,
        totalWeight: 0,
        totalEnergy: 0,
        energyCapacity: 0,
        weapons: [],
        damageBonus: 0,
        ballisticDamageBonus: 0,
        energyDamageBonus: 0,
        missileDamageBonus: 0,
        shotsBonus: 0,
        hpRegen: 0,
        specialAbility: chassis.specialAbility,
        specialValue: chassis.specialValue || 0
    };

    // Apply equipment
    for (const item of (mech.equipment || [])) {
        const template = ITEM_TEMPLATES[item.templateId] || item;
        const level = item.level || 1;

        // Get stats with level scaling applied
        const baseStats = item.stats || template.baseStats || {};
        const itemStats = calculateLeveledStats(item.templateId, baseStats, level, template);

        const rarity = item.rarity || 'common';
        const rarityMult = getRarityMultiplier(rarity);

        // Apply stats
        stats.totalWeight += itemStats.weight || 0;

        const energyDraw = itemStats.energyDraw || 0;
        if (energyDraw < 0) {
            stats.energyCapacity += Math.abs(energyDraw);
        } else {
            stats.totalEnergy += energyDraw;
        }

        // HP and defense
        if (itemStats.hpBonus) {
            stats.maxHP += Math.round(itemStats.hpBonus * rarityMult);
        }
        if (itemStats.damageReduction) {
            stats.damageReduction += itemStats.damageReduction * rarityMult;
        }
        if (itemStats.energyShieldHP) {
            const shieldHP = Math.round(itemStats.energyShieldHP * rarityMult);
            stats.energyShieldHP += shieldHP;
            stats.energyShieldMax += shieldHP;
        }
        if (itemStats.shieldRegen) {
            stats.shieldRegen += itemStats.shieldRegen;
        }
        if (itemStats.hpRegen) {
            stats.hpRegen += itemStats.hpRegen;
        }

        // Damage bonuses
        if (itemStats.damageBonus) {
            stats.damageBonus += itemStats.damageBonus * rarityMult;
        }
        if (itemStats.ballisticDamageBonus) {
            stats.ballisticDamageBonus += itemStats.ballisticDamageBonus * rarityMult;
        }
        if (itemStats.energyDamageBonus) {
            stats.energyDamageBonus += itemStats.energyDamageBonus * rarityMult;
        }
        if (itemStats.missileDamageBonus) {
            stats.missileDamageBonus += itemStats.missileDamageBonus * rarityMult;
        }
        if (itemStats.shotsBonus) {
            stats.shotsBonus += itemStats.shotsBonus;
        }

        // Mobility
        if (itemStats.evasionBonus) {
            stats.evasion += itemStats.evasionBonus / 100;
        }
        if (itemStats.stabilityBonus) {
            stats.evasion += itemStats.stabilityBonus * 0.005;
        }
        if (itemStats.speedBonus) {
            stats.speed += itemStats.speedBonus;
        }
        if (itemStats.accuracyBonus) {
            stats.accuracy += itemStats.accuracyBonus;
        }
        if (itemStats.missileAccuracyBonus) {
            // Stored separately for missile weapons
            stats.missileAccuracyBonus = (stats.missileAccuracyBonus || 0) + itemStats.missileAccuracyBonus;
        }

        // Track weapons
        if (template.type === 'WEAPON') {
            const baseBattle = template.baseBattle || {};
            const battle = calculateLeveledBattle(item.templateId, baseBattle, level);

            stats.weapons.push({
                name: item.name || item.templateId,
                templateId: item.templateId,
                damage: Math.round((itemStats.damage || 5) * rarityMult * 10) / 10,
                damageType: template.damageType || 'ballistic',
                accuracy: battle.accuracy || 0.8,
                shotsPerRound: battle.shotsPerRound || 1,
                knockback: battle.knockback || 10,
                isBeam: battle.isBeam || false,
                armorPenetration: battle.armorPenetration || 0,
                splashDamage: battle.splashDamage || 0,
                tracking: battle.tracking || false,
                level
            });
        }
    }

    // Apply synergy bonuses
    const synergies = checkSynergies(mech.equipment || []);
    for (const synergy of synergies) {
        const effect = synergy.effect;
        if (!effect) continue;

        // Damage boosts
        if (effect.type === 'damage_boost') {
            if (effect.damageType === 'energy') {
                stats.energyDamageBonus += (effect.amount || 0) * 10;
            } else if (effect.damageType === 'ballistic') {
                stats.ballisticDamageBonus += (effect.amount || 0) * 10;
            } else if (effect.damageType === 'missile') {
                stats.missileDamageBonus += (effect.amount || 0) * 10;
            } else {
                stats.damageBonus += (effect.amount || 0) * 5;
            }
        }

        // Mixed effects
        if (effect.damage) {
            stats.damageBonus += effect.damage * 5;
        }
        if (effect.hp) {
            stats.maxHP = Math.round(stats.maxHP * (1 + effect.hp));
        }
        if (effect.shield) {
            stats.energyShieldMax = Math.round(stats.energyShieldMax * (1 + effect.shield));
            stats.energyShieldHP = stats.energyShieldMax;
        }
        if (effect.armor) {
            stats.damageReduction += effect.armor;
        }
        if (effect.accuracy) {
            stats.accuracy += effect.accuracy * 100;
        }
        if (effect.evasion) {
            stats.evasion += effect.evasion;
        }
        if (effect.shots) {
            stats.shotsBonus += effect.shots;
        }
        if (effect.speed) {
            stats.speed *= (1 + effect.speed);
        }

        // Type-specific damage
        if (effect.ballisticDamage) {
            stats.ballisticDamageBonus += effect.ballisticDamage * 10;
        }
        if (effect.missileDamage) {
            stats.missileDamageBonus += effect.missileDamage * 10;
        }
        if (effect.knockback) {
            // Apply to weapons
            for (const wpn of stats.weapons) {
                wpn.knockback *= (1 + effect.knockback);
            }
        }
    }

    // If no weapons, add a basic punch
    if (stats.weapons.length === 0) {
        stats.weapons.push({
            name: 'Fist',
            templateId: 'melee',
            damage: 2,
            damageType: 'ballistic',
            accuracy: 0.9,
            shotsPerRound: 1,
            knockback: 5,
            isBeam: false,
            armorPenetration: 0,
            level: 1
        });
    }

    // Apply shots bonus to all weapons
    if (stats.shotsBonus > 0) {
        for (const wpn of stats.weapons) {
            wpn.shotsPerRound += stats.shotsBonus;
        }
    }

    // Calculate initiative
    stats.initiative = COMBAT_CONFIG.baseTurnOrder - stats.totalWeight * COMBAT_CONFIG.weightInitiativePenalty;

    // Set current HP
    stats.currentHP = stats.maxHP;

    // Store synergies for reporting
    stats.activeSynergies = synergies;

    return stats;
}

function getRarityMultiplier(rarity) {
    const multipliers = {
        common: 1.0,
        uncommon: 1.15,
        rare: 1.35,
        epic: 1.6,
        legendary: 2.0
    };
    return multipliers[rarity] || 1.0;
}

/**
 * Calculate DPS for a mech against a target
 */
function calculateDPS(attacker, defender) {
    let totalDPS = 0;
    const weaponBreakdown = [];

    for (const weapon of attacker.weapons) {
        // Base damage per shot
        let damagePerShot = weapon.damage + attacker.damageBonus;

        // Apply type-specific damage bonuses
        if (weapon.damageType === 'ballistic') {
            damagePerShot += attacker.ballisticDamageBonus;
        } else if (weapon.damageType === 'energy') {
            damagePerShot += attacker.energyDamageBonus;
        } else if (weapon.damageType === 'missile') {
            damagePerShot += attacker.missileDamageBonus;
        }

        // Apply accuracy
        let hitChance = weapon.accuracy * (attacker.accuracy / 100);

        // Apply missile-specific accuracy bonus
        if (weapon.damageType === 'missile' && attacker.missileAccuracyBonus) {
            hitChance += attacker.missileAccuracyBonus / 100;
        }

        // Tracking weapons get accuracy bonus
        if (weapon.tracking) {
            hitChance += 0.1;
        }

        // Defender evasion reduces hit chance
        hitChance *= (1 - defender.evasion);
        hitChance = Math.max(0.1, Math.min(0.95, hitChance));  // Clamp 10-95%

        // Apply damage reduction based on damage type
        let effectiveDamage = damagePerShot;
        let armorUsed = 0;

        if (weapon.damageType === 'energy') {
            // Energy weapons bypass armor but are blocked by shields
            // (shields handled separately in combat)
        } else {
            // Ballistic/missile reduced by armor (minus penetration)
            const effectiveArmor = Math.max(0, defender.damageReduction - (weapon.armorPenetration || 0));
            armorUsed = Math.min(effectiveArmor, damagePerShot - COMBAT_CONFIG.minDamage);
            effectiveDamage = Math.max(COMBAT_CONFIG.minDamage, damagePerShot - effectiveArmor);
        }

        // Calculate expected damage per round
        const shotsPerRound = weapon.shotsPerRound || 1;
        const expectedDamage = effectiveDamage * hitChance * shotsPerRound;

        // Add splash damage (hits nearby enemies in multi-enemy fights)
        const splashBonus = weapon.splashDamage || 0;
        const totalExpectedDamage = expectedDamage * (1 + splashBonus * 0.5);

        const dps = totalExpectedDamage / COMBAT_CONFIG.roundDuration;

        totalDPS += dps;
        weaponBreakdown.push({
            name: weapon.name,
            damagePerShot,
            effectiveDamage,
            hitChance,
            shotsPerRound,
            armorUsed,
            armorPenetration: weapon.armorPenetration || 0,
            expectedDamagePerRound: totalExpectedDamage,
            dps
        });
    }

    return { totalDPS, weaponBreakdown };
}

/**
 * Calculate effective HP considering shields and damage types
 */
function calculateEffectiveHP(mech, attackerWeapons) {
    let effectiveHP = mech.maxHP;

    // Count energy vs physical damage proportion
    let energyDamageProp = 0;
    let physicalDamageProp = 0;

    for (const wpn of attackerWeapons) {
        const dmg = wpn.damage * (wpn.shotsPerRound || 1);
        if (wpn.damageType === 'energy') {
            energyDamageProp += dmg;
        } else {
            physicalDamageProp += dmg;
        }
    }

    const totalDmg = energyDamageProp + physicalDamageProp;
    energyDamageProp = totalDmg > 0 ? energyDamageProp / totalDmg : 0.5;
    physicalDamageProp = 1 - energyDamageProp;

    // Energy shields only block energy damage
    // Add shield HP proportional to energy damage incoming
    effectiveHP += mech.energyShieldMax * energyDamageProp;

    // Armor provides effective HP against physical damage
    // Each point of armor blocked per shot adds effective HP
    const avgPhysicalDamage = physicalDamageProp > 0 ? physicalDamageProp * totalDmg / attackerWeapons.length : 5;
    const armorValue = Math.min(mech.damageReduction, avgPhysicalDamage - 1);
    effectiveHP += armorValue * 3 * physicalDamageProp;

    // HP regen adds effective HP based on expected combat length
    if (mech.hpRegen > 0) {
        const expectedRounds = 10;  // Assume ~10 rounds of combat
        effectiveHP += mech.hpRegen * expectedRounds;
    }

    // Shield regen adds value
    if (mech.shieldRegen > 0) {
        effectiveHP += mech.shieldRegen * 5 * energyDamageProp;
    }

    return effectiveHP;
}

/**
 * Simulate a single combat between player and enemy
 * Returns detailed combat results
 */
function simulateCombat(playerMech, enemyMech, options = {}) {
    const verbose = options.verbose || false;
    const log = verbose ? console.log : () => {};

    // Calculate stats
    const player = calculateMechStats(playerMech);
    const enemy = calculateMechStats(enemyMech);

    log('\n=== COMBAT START ===');
    log(`Player: ${player.maxHP} HP, ${player.weapons.length} weapons, ${player.damageReduction} armor`);
    log(`Enemy: ${enemy.maxHP} HP, ${enemy.weapons.length} weapons, ${enemy.damageReduction} armor`);

    if (player.activeSynergies?.length > 0) {
        log(`Player synergies: ${player.activeSynergies.map(s => s.name).join(', ')}`);
    }

    // Calculate DPS
    const playerDPS = calculateDPS(player, enemy);
    const enemyDPS = calculateDPS(enemy, player);

    log(`Player DPS: ${playerDPS.totalDPS.toFixed(2)}`);
    log(`Enemy DPS: ${enemyDPS.totalDPS.toFixed(2)}`);

    // Calculate effective HP
    const playerEffectiveHP = calculateEffectiveHP(player, enemy.weapons);
    const enemyEffectiveHP = calculateEffectiveHP(enemy, player.weapons);

    log(`Player Effective HP: ${playerEffectiveHP.toFixed(1)}`);
    log(`Enemy Effective HP: ${enemyEffectiveHP.toFixed(1)}`);

    // Calculate time to kill
    const playerTTK = enemyDPS.totalDPS > 0 ? playerEffectiveHP / enemyDPS.totalDPS : Infinity;
    const enemyTTK = playerDPS.totalDPS > 0 ? enemyEffectiveHP / playerDPS.totalDPS : Infinity;

    log(`Player TTK (time to die): ${playerTTK.toFixed(2)}s`);
    log(`Enemy TTK (time to die): ${enemyTTK.toFixed(2)}s`);

    // Determine winner
    let winner, loser;
    let combatTime;

    if (playerTTK > enemyTTK) {
        winner = 'player';
        loser = 'enemy';
        combatTime = enemyTTK;
    } else if (enemyTTK > playerTTK) {
        winner = 'enemy';
        loser = 'player';
        combatTime = playerTTK;
    } else {
        // Tie - use initiative
        winner = player.initiative >= enemy.initiative ? 'player' : 'enemy';
        loser = winner === 'player' ? 'enemy' : 'player';
        combatTime = playerTTK;
    }

    // Calculate remaining HP
    const playerDamageTaken = Math.min(player.maxHP, enemyDPS.totalDPS * combatTime);
    const enemyDamageTaken = Math.min(enemy.maxHP, playerDPS.totalDPS * combatTime);

    const playerHPRemaining = winner === 'player'
        ? Math.max(1, player.maxHP - playerDamageTaken)
        : 0;
    const enemyHPRemaining = winner === 'enemy'
        ? Math.max(1, enemy.maxHP - enemyDamageTaken)
        : 0;

    // Calculate rounds
    const rounds = Math.ceil(combatTime / COMBAT_CONFIG.roundDuration);

    log(`\n=== COMBAT END ===`);
    log(`Winner: ${winner}`);
    log(`Combat time: ${combatTime.toFixed(2)}s (${rounds} rounds)`);
    log(`Player HP remaining: ${playerHPRemaining.toFixed(1)}`);
    log(`Enemy HP remaining: ${enemyHPRemaining.toFixed(1)}`);

    return {
        winner,
        playerVictory: winner === 'player',
        combatTime,
        rounds,
        player: {
            maxHP: player.maxHP,
            hpRemaining: playerHPRemaining,
            hpPercent: playerHPRemaining / player.maxHP,
            damageTaken: playerDamageTaken,
            damageDealt: enemyDamageTaken,
            dps: playerDPS.totalDPS,
            weapons: playerDPS.weaponBreakdown,
            effectiveHP: playerEffectiveHP,
            ttk: playerTTK,
            synergies: player.activeSynergies
        },
        enemy: {
            maxHP: enemy.maxHP,
            hpRemaining: enemyHPRemaining,
            hpPercent: enemyHPRemaining / enemy.maxHP,
            damageTaken: enemyDamageTaken,
            damageDealt: playerDamageTaken,
            dps: enemyDPS.totalDPS,
            weapons: enemyDPS.weaponBreakdown,
            effectiveHP: enemyEffectiveHP,
            ttk: enemyTTK
        },
        stats: {
            playerDPS: playerDPS.totalDPS,
            enemyDPS: enemyDPS.totalDPS,
            playerEffectiveHP,
            enemyEffectiveHP,
            playerTTK,
            enemyTTK,
            dpsRatio: playerDPS.totalDPS / Math.max(0.1, enemyDPS.totalDPS),
            ehpRatio: playerEffectiveHP / Math.max(1, enemyEffectiveHP)
        }
    };
}

/**
 * Simulate combat with multiple enemies (sequential)
 */
function simulateMultiCombat(playerMech, enemies, options = {}) {
    const results = [];
    let currentPlayer = { ...playerMech };
    let playerStats = calculateMechStats(playerMech);
    let remainingHP = playerStats.maxHP;

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const result = simulateCombat(currentPlayer, enemy, options);

        // Update player HP for next fight
        remainingHP = result.playerVictory
            ? result.player.hpRemaining
            : 0;

        results.push({
            enemyIndex: i,
            result,
            playerHPAfter: remainingHP
        });

        // Stop if player died
        if (!result.playerVictory) {
            break;
        }

        // Update current player state for next fight
        // (In a more detailed sim, we'd track exact HP)
    }

    const totalVictories = results.filter(r => r.result.playerVictory).length;
    const totalEnemies = enemies.length;
    const overallVictory = totalVictories === totalEnemies;

    return {
        overallVictory,
        totalVictories,
        totalEnemies,
        fights: results,
        finalHP: remainingHP,
        finalHPPercent: remainingHP / playerStats.maxHP
    };
}

module.exports = {
    simulateCombat,
    simulateMultiCombat,
    calculateMechStats,
    calculateDPS,
    calculateEffectiveHP,
    COMBAT_CONFIG
};
