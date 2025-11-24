#!/usr/bin/env node

/**
 * DEBUG COLLISION SYSTEM - See what collisions are being detected
 */

const Matter = require('matter-js');
const { Engine, World, Bodies, Body, Events } = Matter;

console.log('\n🔍 COLLISION DEBUG\n');

const engine = Engine.create();
engine.gravity.y = 1.2;
const world = engine.world;

// Ground
const ground = Bodies.rectangle(400, 430, 800, 40, {
    isStatic: true,
    label: 'ground'
});
World.add(world, ground);

// Two mechs
const mech1 = Bodies.rectangle(200, 380, 40, 60, {
    isStatic: true, // Make static so they don't move
    label: 'player_torso'
});

const mech2 = Bodies.rectangle(600, 380, 40, 60, {
    isStatic: true,
    label: 'enemy_torso'
});

World.add(world, [mech1, mech2]);

console.log('Created 2 static mechs at (200, 380) and (600, 380)');
console.log('Distance between mechs: 400 units\n');

// Track ALL collisions
let allCollisions = [];
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const labelA = pair.bodyA.label || 'unlabeled';
        const labelB = pair.bodyB.label || 'unlabeled';
        const collision = `${labelA} ↔ ${labelB}`;
        allCollisions.push(collision);
        console.log(`  💥 Collision: ${collision}`);
    });
});

console.log('Firing projectile from mech1 to mech2...\n');

// Fire a projectile
const angle = Math.atan2(mech2.position.y - mech1.position.y, mech2.position.x - mech1.position.x);
const speed = 15;

const projectile = Bodies.circle(mech1.position.x, mech1.position.y, 6, {
    density: 0.001,
    label: 'projectile',
    // NOTE: Not using isSensor - normal collision body
});

Body.setVelocity(projectile, {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed
});

World.add(world, projectile);

console.log(`Projectile created at (${mech1.position.x}, ${mech1.position.y})`);
console.log(`Velocity: (${Math.cos(angle) * speed}, ${Math.sin(angle) * speed})`);
console.log(`Target: (${mech2.position.x}, ${mech2.position.y})`);
console.log(`Expected travel time: ${400 / speed} ticks = ${(400 / speed * 16.67 / 1000).toFixed(2)}s\n`);

// Run simulation
let hitDetected = false;
for (let frame = 0; frame < 300; frame++) {
    Engine.update(engine, 16.67);

    // Check if projectile hit target
    if (projectile.position.x >= mech2.position.x - 30 &&
        projectile.position.x <= mech2.position.x + 30 &&
        !hitDetected) {
        console.log(`Frame ${frame}: Projectile at (${projectile.position.x.toFixed(1)}, ${projectile.position.y.toFixed(1)})`);
        console.log(`           Target at (${mech2.position.x.toFixed(1)}, ${mech2.position.y.toFixed(1)})`);
        hitDetected = true;
    }

    // Stop if projectile went way past
    if (projectile.position.x > 700) break;
}

console.log(`\n═══ RESULTS ═══`);
console.log(`Projectile final position: (${projectile.position.x.toFixed(1)}, ${projectile.position.y.toFixed(1)})`);
console.log(`Total collisions detected: ${allCollisions.length}`);

if (allCollisions.length > 0) {
    console.log(`Collisions:`);
    allCollisions.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
}

const projectileHitMech = allCollisions.some(c => c.includes('projectile') && c.includes('enemy_torso'));

if (projectileHitMech) {
    console.log('\n✅ Projectile HIT target!');
    process.exit(0);
} else {
    console.log('\n❌ Projectile MISSED or collision not detected!');
    console.log('\nPossible issues:');
    console.log('  - Projectile too fast (tunneling through)');
    console.log('  - Collision filtering preventing detection');
    console.log('  - isSensor flag interfering');
    console.log('  - Matter.js collision detection issue');
    process.exit(1);
}
