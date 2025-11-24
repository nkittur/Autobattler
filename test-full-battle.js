#!/usr/bin/env node

/**
 * FULL BATTLE SIMULATION - Tests entire combat system
 * Simulates: projectile firing, collisions, damage, HP tracking, battle end
 */

const Matter = require('matter-js');
const { Engine, World, Bodies, Body, Events, Constraint } = Matter;

console.log('\n⚔️  FULL BATTLE SYSTEM DIAGNOSTIC\n');
console.log('═'.repeat(70));

const CONFIG = {
    width: 800,
    height: 450,
    gravity: 1.2,
    frames: 1200, // 20 seconds
    logInterval: 120, // Every 2 seconds
    groundY: 430,
    playerDamage: 30,
    enemyDamage: 20,
    playerHP: 120,
    enemyHP: 80,
    fireRateFrames: 90 // Fire every 1.5 seconds
};

// Create engine
const engine = Engine.create();
engine.gravity.y = CONFIG.gravity;
const world = engine.world;

// Ground
const ground = Bodies.rectangle(CONFIG.width / 2, CONFIG.groundY, CONFIG.width, 40, {
    isStatic: true,
    label: 'ground',
    friction: 0.8
});
World.add(world, ground);

console.log('✓ World created (800x450, gravity=1.2)');
console.log('✓ Ground at Y=430');

// Create simple stable mechs (no flopping)
function createMech(x, y, isPlayer) {
    const torso = Bodies.rectangle(x, y, 40, 60, {
        density: 0.002,
        friction: 0.8,
        frictionAir: 0.05, // Higher air resistance for stability
        label: isPlayer ? 'player_torso' : 'enemy_torso'
    });

    World.add(world, torso);

    return {
        torso,
        currentHP: isPlayer ? CONFIG.playerHP : CONFIG.enemyHP,
        maxHP: isPlayer ? CONFIG.playerHP : CONFIG.enemyHP,
        damage: isPlayer ? CONFIG.playerDamage : CONFIG.enemyDamage,
        isPlayer,
        lastShot: 0
    };
}

const playerMech = createMech(200, 350, true); // Start lower, closer to ground
const enemyMech = createMech(600, 350, false);

console.log(`✓ Player mech: ${playerMech.currentHP}HP, ${playerMech.damage} damage`);
console.log(`✓ Enemy mech: ${enemyMech.currentHP}HP, ${enemyMech.damage} damage`);

// Projectile system
let projectiles = [];
let projectilesFired = 0;
let projectilesHit = 0;

function fireProjectile(fromMech, toMech, frame) {
    const startX = fromMech.torso.position.x;
    const startY = fromMech.torso.position.y;
    const targetX = toMech.torso.position.x;
    const targetY = toMech.torso.position.y;

    const angle = Math.atan2(targetY - startY, targetX - startX);
    const speed = 15;

    const projectile = Bodies.circle(startX, startY, 6, {
        density: 0.001,
        label: 'projectile'
        // Removed isSensor - need real collisions
    });

    Body.setVelocity(projectile, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    });

    projectile.damage = fromMech.damage;
    projectile.shooter = fromMech;
    projectile.target = toMech;
    projectile.firedAt = frame;

    World.add(world, projectile);
    projectiles.push(projectile);
    projectilesFired++;

    const shooter = fromMech.isPlayer ? 'Player' : 'Enemy';
    console.log(`  🚀 ${shooter} fires projectile #${projectilesFired} (${fromMech.damage} dmg)`);
}

// Collision detection
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        const projectile = projectiles.find(p => p === bodyA || p === bodyB);
        if (!projectile) return;

        const other = bodyA === projectile ? bodyB : bodyA;

        // Check if hit target mech
        if (other === projectile.target.torso) {
            projectile.target.currentHP = Math.max(0, projectile.target.currentHP - projectile.damage);
            projectilesHit++;

            const target = projectile.target.isPlayer ? 'Player' : 'Enemy';
            console.log(`  💥 HIT! ${target} takes ${projectile.damage} damage → ${projectile.target.currentHP}/${projectile.target.maxHP} HP`);

            // Remove projectile
            World.remove(world, projectile);
            projectiles = projectiles.filter(p => p !== projectile);
        }
    });
});

console.log('\n' + '─'.repeat(70));
console.log('BATTLE START');
console.log('─'.repeat(70));
console.log('');

// Battle diagnostics
let diagnostics = {
    battleEnded: false,
    battleEndFrame: 0,
    winner: null,
    projectilesFired: 0,
    projectilesHit: 0,
    errors: []
};

// Main simulation loop
for (let frame = 0; frame < CONFIG.frames; frame++) {
    // Weapon firing
    if (!diagnostics.battleEnded) {
        // Player fires
        if (frame - playerMech.lastShot >= CONFIG.fireRateFrames && playerMech.currentHP > 0) {
            fireProjectile(playerMech, enemyMech, frame);
            playerMech.lastShot = frame;
        }

        // Enemy fires
        if (frame - enemyMech.lastShot >= CONFIG.fireRateFrames && enemyMech.currentHP > 0) {
            fireProjectile(enemyMech, playerMech, frame);
            enemyMech.lastShot = frame;
        }
    }

    // Update physics
    Engine.update(engine, 16.67);

    // Clean up old projectiles (traveled too far)
    const oldProjectiles = projectiles.filter(p => frame - p.firedAt > 180); // 3 seconds
    oldProjectiles.forEach(p => {
        World.remove(world, p);
    });
    projectiles = projectiles.filter(p => frame - p.firedAt <= 180);

    // Check battle end
    if (!diagnostics.battleEnded) {
        if (playerMech.currentHP <= 0 || enemyMech.currentHP <= 0) {
            diagnostics.battleEnded = true;
            diagnostics.battleEndFrame = frame;
            diagnostics.winner = playerMech.currentHP > 0 ? 'PLAYER' : 'ENEMY';

            console.log('\n' + '═'.repeat(70));
            console.log(`⚔️  BATTLE ENDED at frame ${frame} (${(frame/60).toFixed(1)}s)`);
            console.log(`🏆 WINNER: ${diagnostics.winner}`);
            console.log(`   Player: ${playerMech.currentHP}/${playerMech.maxHP} HP`);
            console.log(`   Enemy: ${enemyMech.currentHP}/${enemyMech.maxHP} HP`);
            console.log('═'.repeat(70));
        }
    }

    // Check for physics issues
    if (playerMech.torso.position.y > 500 || enemyMech.torso.position.y > 500) {
        diagnostics.errors.push(`Frame ${frame}: Mech fell through ground!`);
    }

    if (playerMech.torso.position.x < 0 || playerMech.torso.position.x > CONFIG.width ||
        enemyMech.torso.position.x < 0 || enemyMech.torso.position.x > CONFIG.width) {
        diagnostics.errors.push(`Frame ${frame}: Mech went out of bounds!`);
    }

    // Periodic status
    if (frame % CONFIG.logInterval === 0 && frame > 0) {
        const time = (frame / 60).toFixed(1);
        console.log(`[${time}s] Player: ${playerMech.currentHP}HP | Enemy: ${enemyMech.currentHP}HP | Projectiles: ${projectiles.length} active | Fired: ${projectilesFired} | Hit: ${projectilesHit}`);
    }
}

diagnostics.projectilesFired = projectilesFired;
diagnostics.projectilesHit = projectilesHit;

// FINAL REPORT
console.log('\n' + '═'.repeat(70));
console.log('BATTLE DIAGNOSTIC REPORT');
console.log('═'.repeat(70));
console.log('');

console.log('⚔️  COMBAT STATISTICS:');
console.log(`   Projectiles fired: ${diagnostics.projectilesFired}`);
console.log(`   Projectiles hit: ${diagnostics.projectilesHit}`);
console.log(`   Hit rate: ${diagnostics.projectilesFired > 0 ? ((diagnostics.projectilesHit / diagnostics.projectilesFired) * 100).toFixed(1) : 0}%`);
console.log('');

console.log('🏥 FINAL HP:');
console.log(`   Player: ${playerMech.currentHP}/${playerMech.maxHP} HP`);
console.log(`   Enemy: ${enemyMech.currentHP}/${enemyMech.maxHP} HP`);
console.log('');

console.log('📍 FINAL POSITIONS:');
console.log(`   Player: (${playerMech.torso.position.x.toFixed(1)}, ${playerMech.torso.position.y.toFixed(1)})`);
console.log(`   Enemy: (${enemyMech.torso.position.x.toFixed(1)}, ${enemyMech.torso.position.y.toFixed(1)})`);
console.log('');

if (diagnostics.errors.length > 0) {
    console.log('❌ ERRORS:');
    const uniqueErrors = [...new Set(diagnostics.errors)];
    uniqueErrors.slice(0, 5).forEach(err => console.log(`   ${err}`));
    if (uniqueErrors.length > 5) {
        console.log(`   ... and ${uniqueErrors.length - 5} more errors`);
    }
    console.log('');
}

console.log('═'.repeat(70));

// Determine success
let success = true;
let failures = [];

if (diagnostics.projectilesFired === 0) {
    success = false;
    failures.push('❌ NO PROJECTILES FIRED - weapon system broken');
}

if (diagnostics.projectilesHit === 0 && diagnostics.projectilesFired > 0) {
    success = false;
    failures.push('❌ NO HITS DETECTED - collision system broken');
}

if (!diagnostics.battleEnded) {
    success = false;
    failures.push('❌ BATTLE DID NOT END - damage not being applied');
}

if (diagnostics.errors.length > 0) {
    success = false;
    failures.push(`❌ PHYSICS ERRORS DETECTED (${diagnostics.errors.length} issues)`);
}

if (success) {
    console.log('✅ BATTLE SYSTEM WORKING CORRECTLY\n');
    console.log('   ✓ Projectiles fired');
    console.log('   ✓ Projectiles hit targets');
    console.log('   ✓ Damage applied correctly');
    console.log('   ✓ Battle completed with winner');
    console.log('   ✓ Physics stable (no falling/escaping)');
    process.exit(0);
} else {
    console.log('❌ BATTLE SYSTEM HAS ISSUES\n');
    failures.forEach(f => console.log(`   ${f}`));
    process.exit(1);
}
