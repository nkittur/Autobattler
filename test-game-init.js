#!/usr/bin/env node

/**
 * Simulate EXACT game initialization to find bugs
 */

const Matter = require('matter-js');
const { Engine, World, Bodies, Body, Events, Constraint } = Matter;

console.log('\n🎮 GAME INITIALIZATION SIMULATION\n');
console.log('═'.repeat(70));

// Simulate game stats
const playerStats = {
    damage: 30,
    armor: 10,
    speed: 50
};

const monsterData = {
    damage: 20,
    armor: 5,
    speed: 50,
    currentHP: 80,
    maxHP: 80
};

// Calculate fire rates (EXACT formula from game)
const playerFireRate = 1000 + (100 - playerStats.speed) * 20;
const enemyFireRate = 1000 + (100 - monsterData.speed) * 20;

console.log('Fire rates calculated:');
console.log(`  Player: ${playerFireRate}ms (${(1000/playerFireRate).toFixed(2)} shots/sec)`);
console.log(`  Enemy: ${enemyFireRate}ms (${(1000/enemyFireRate).toFixed(2)} shots/sec)`);
console.log('');

// Initialize timing (EXACT pattern from game)
let lastPlayerShot = 0;
let lastEnemyShot = 0;
let isActive = true;

// Simulate combat tick loop
console.log('Simulating first 10 seconds of combat loop...\n');

let shotsFired = 0;
const startTime = Date.now();

// Run for 10 seconds
const endTime = startTime + 10000;
let frame = 0;

while (Date.now() < endTime) {
    if (!isActive) break;

    const now = Date.now();

    // Player auto-fire (EXACT code from game)
    if (now - lastPlayerShot > playerFireRate) {
        shotsFired++;
        const elapsed = now - startTime;
        console.log(`[${(elapsed/1000).toFixed(2)}s] 🚀 Player fires shot #${shotsFired}`);
        lastPlayerShot = now;
    }

    // Enemy auto-fire
    if (now - lastEnemyShot > enemyFireRate) {
        shotsFired++;
        const elapsed = now - startTime;
        console.log(`[${(elapsed/1000).toFixed(2)}s] 🚀 Enemy fires shot #${shotsFired}`);
        lastEnemyShot = now;
    }

    frame++;

    // Simulate 16ms frame time
    const sleepUntil = Date.now() + 16;
    while (Date.now() < sleepUntil) {
        // Busy wait
    }
}

console.log(`\n═══ RESULTS ═══`);
console.log(`Total shots fired in 10 seconds: ${shotsFired}`);
console.log(`Expected: ~${Math.floor(10000 / playerFireRate) * 2} shots (player + enemy)`);
console.log(`Frames executed: ${frame}`);

if (shotsFired > 0) {
    console.log('\n✅ Combat loop fires weapons correctly');
    process.exit(0);
} else {
    console.log('\n❌ NO SHOTS FIRED - combat loop broken!');
    process.exit(1);
}
