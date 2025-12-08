/**
 * Deterministic Combat Simulator
 *
 * Resolves combat without physics simulation using expected values.
 * This allows running thousands of battles per second.
 */

const { ITEM_TEMPLATES, MECH_TEMPLATES } = require('./game-constants');

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
        speed: chassis.baseSpeed || 1.0,
        accuracy: chassis.baseAccuracy || 65,
        evasion: chassis.specialAbility === 'EVASION' ? chassis.specialValue : 0,
        totalWeight: 0,
        totalEnergy: 0,
        energyCapacity: 0,
        weapons: [],
        damageBonus: 0,
        specialAbility: chassis.specialAbility,
        specialValue: chassis.specialValue || 0
    };

    // Apply equipment
    for (const item of (mech.equipment || [])) {
        const template = ITEM_TEMPLATES[item.templateId] || item;
        const itemStats = item.stats || template.baseStats || {};
        const rarity = item.rarity || 'common';
        const rarityMult = getRarityMultiplier(rarity);
        const level = item.level || 1;
        const levelMult = 1 + (level - 1) * 0.15;
        const mult = rarityMult * levelMult;

        // Apply stats
        stats.totalWeight += itemStats.weight || 0;

        const energyDraw = itemStats.energyDraw || 0;
        if (energyDraw < 0) {
            stats.energyCapacity += Math.abs(energyDraw) * mult;
        } else {
            stats.totalEnergy += energyDraw;
        }

        if (itemStats.hpBonus) {
            stats.maxHP += Math.round(itemStats.hpBonus * mult);
        }
        if (itemStats.damageReduction) {
            stats.damageReduction += Math.round(itemStats.damageReduction * mult);
        }
        if (itemStats.energyShieldHP) {
            const shieldHP = Math.round(itemStats.energyShieldHP * mult);
            stats.energyShieldHP += shieldHP;
            stats.energyShieldMax += shieldHP;
        }
        if (itemStats.damageBonus) {
            stats.damageBonus += itemStats.damageBonus * mult;
        }
        if (itemStats.stabilityBonus) {
            stats.evasion += itemStats.stabilityBonus * 0.005;  // Stability helps avoid knockdown
        }

        // Track weapons
        if (template.type === 'WEAPON') {
            const battle = template.baseBattle || {};
            stats.weapons.push({
                name: item.name || item.templateId,
                templateId: item.templateId,
                damage: Math.round((itemStats.damage || 5) * mult),
                damageType: template.damageType || 'ballistic',
                accuracy: battle.accuracy || 0.8,
                shotsPerRound: battle.shotsPerRound || 1,
                knockback: battle.knockback || 10,
                isBeam: battle.isBeam || false
            });
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
            isBeam: false
        });
    }

    // Calculate initiative
    stats.initiative = COMBAT_CONFIG.baseTurnOrder - stats.totalWeight * COMBAT_CONFIG.weightInitiativePenalty;

    // Set current HP
    stats.currentHP = stats.maxHP;

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

        // Apply accuracy
        let hitChance = weapon.accuracy * (attacker.accuracy / 100);

        // Defender evasion reduces hit chance
        hitChance *= (1 - defender.evasion);
        hitChance = Math.max(0.1, Math.min(0.95, hitChance));  // Clamp 10-95%

        // Apply damage reduction based on damage type
        let effectiveDamage = damagePerShot;

        if (weapon.damageType === 'energy') {
            // Energy weapons bypass armor but are blocked by shields
            // (shields handled separately in combat)
        } else {
            // Ballistic/missile reduced by armor
            effectiveDamage = Math.max(COMBAT_CONFIG.minDamage, damagePerShot - defender.damageReduction);
        }

        // Calculate expected damage per round
        const shotsPerRound = weapon.shotsPerRound || 1;
        const expectedDamage = effectiveDamage * hitChance * shotsPerRound;
        const dps = expectedDamage / COMBAT_CONFIG.roundDuration;

        totalDPS += dps;
        weaponBreakdown.push({
            name: weapon.name,
            damagePerShot,
            effectiveDamage,
            hitChance,
            shotsPerRound,
            expectedDamagePerRound: expectedDamage,
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

    // Armor is already factored into DPS calculation
    // But we can add a small bonus for high armor builds
    effectiveHP += mech.damageReduction * 2 * physicalDamageProp;

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
            ttk: playerTTK
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
