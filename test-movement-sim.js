#!/usr/bin/env node

/**
 * Test MOVEMENT FORCES to see if they cause out-of-bounds issues
 */

const Matter = require('matter-js');
const { Engine, World, Bodies, Body, Constraint } = Matter;

console.log('\n🏃 MOVEMENT FORCE DIAGNOSTIC\n');
console.log('═'.repeat(60));

const CONFIG = {
    width: 800,
    height: 450,
    gravity: 1.2,
    frames: 600, // 10 seconds
    logInterval: 60,
    groundY: 430,
    mechStartY: 300,
    moveSpeed: 0.004 // From index.html
};

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

// Create articulated mech (simplified)
function createMech(x, y, isPlayer) {
    const size = 30;
    const torso = Bodies.rectangle(x, y, size * 1.2, size * 1.5, {
        density: 0.002,
        friction: 0.8,
        frictionAir: 0.02,
        label: isPlayer ? 'player_torso' : 'enemy_torso'
    });

    const head = Bodies.circle(x, y - size, size * 0.5, {
        density: 0.001,
        label: isPlayer ? 'player_head' : 'enemy_head'
    });

    const neck = Constraint.create({
        bodyA: head,
        bodyB: torso,
        stiffness: 0.7,
        length: 5
    });

    World.add(world, [torso, head, neck]);

    return {
        torso, head,
        moveDirection: 0,
        moveSpeed: CONFIG.moveSpeed,
        nextMoveChange: Date.now() + 1000,
        isPlayer
    };
}

const mech1 = createMech(200, CONFIG.mechStartY, true);
const mech2 = createMech(600, CONFIG.mechStartY, false);

// Fix: Use frame-based timing instead of Date.now()
mech1.nextMoveChange = 60; // First change at 1 second
mech2.nextMoveChange = 60;

console.log('✓ Mechs created with movement AI');
console.log(`✓ Move speed: ${CONFIG.moveSpeed} (from game code)`);
console.log('✓ Using frame-based timing for simulation');
console.log('\n' + '─'.repeat(60));

// Diagnostics
let diagnostics = {
    errors: [],
    warnings: [],
    boundsViolations: 0,
    movements: { left: 0, right: 0, still: 0 },
    finalPositions: null
};

// Movement AI (fixed to use frame-based timing)
function updateMechMovement(frame) {
    [mech1, mech2].forEach(mech => {
        // Change direction periodically (FIXED: use frame instead of Date.now())
        if (frame > mech.nextMoveChange) {
            const rand = Math.random();
            if (rand < 0.3) {
                mech.moveDirection = -1;
                diagnostics.movements.left++;
            } else if (rand < 0.6) {
                mech.moveDirection = 1;
                diagnostics.movements.right++;
            } else {
                mech.moveDirection = 0;
                diagnostics.movements.still++;
            }
            mech.nextMoveChange = frame + 48 + Math.floor(Math.random() * 72); // 0.8-2s
        }

        // Apply movement force (EXACT CODE FROM index.html)
        if (mech.moveDirection !== 0) {
            const pos = mech.torso.position;

            // Keep mechs on screen (boundary check from index.html)
            if ((mech.moveDirection < 0 && pos.x > 100) ||
                (mech.moveDirection > 0 && pos.x < CONFIG.width - 100)) {

                Body.applyForce(mech.torso, pos, {
                    x: mech.moveDirection * mech.moveSpeed,
                    y: 0
                });
            }
        }
    });
}

console.log('SIMULATION START');
console.log('─'.repeat(60) + '\n');

// Run simulation
for (let frame = 0; frame < CONFIG.frames; frame++) {
    // Update movement BEFORE physics (like in game)
    updateMechMovement(frame);

    // Update physics
    Engine.update(engine, 16.67);

    const m1x = mech1.torso.position.x;
    const m1y = mech1.torso.position.y;
    const m2x = mech2.torso.position.x;
    const m2y = mech2.torso.position.y;

    // Check bounds
    if (m1x < 0 || m1x > CONFIG.width) {
        diagnostics.errors.push(`Frame ${frame}: Mech1 X out of bounds! x=${m1x.toFixed(1)}`);
        diagnostics.boundsViolations++;
    }
    if (m2x < 0 || m2x > CONFIG.width) {
        diagnostics.errors.push(`Frame ${frame}: Mech2 X out of bounds! x=${m2x.toFixed(1)}`);
        diagnostics.boundsViolations++;
    }
    if (m1y < 0 || m1y > CONFIG.height + 100) {
        diagnostics.errors.push(`Frame ${frame}: Mech1 Y out of bounds! y=${m1y.toFixed(1)}`);
        diagnostics.boundsViolations++;
    }
    if (m2y < 0 || m2y > CONFIG.height + 100) {
        diagnostics.errors.push(`Frame ${frame}: Mech2 Y out of bounds! y=${m2y.toFixed(1)}`);
        diagnostics.boundsViolations++;
    }

    // Periodic logging
    if (frame % CONFIG.logInterval === 0 || frame === CONFIG.frames - 1) {
        const time = (frame / 60).toFixed(2);
        const m1dir = mech1.moveDirection === -1 ? '←' : mech1.moveDirection === 1 ? '→' : '•';
        const m2dir = mech2.moveDirection === -1 ? '←' : mech2.moveDirection === 1 ? '→' : '•';

        console.log(`[${time}s] Frame ${frame}:`);
        console.log(`  Mech1 ${m1dir}: pos=(${m1x.toFixed(1)}, ${m1y.toFixed(1)}) vel=(${mech1.torso.velocity.x.toFixed(2)}, ${mech1.torso.velocity.y.toFixed(2)})`);
        console.log(`  Mech2 ${m2dir}: pos=(${m2x.toFixed(1)}, ${m2y.toFixed(1)}) vel=(${mech2.torso.velocity.x.toFixed(2)}, ${mech2.torso.velocity.y.toFixed(2)})`);
        console.log('');
    }
}

diagnostics.finalPositions = {
    mech1: { x: mech1.torso.position.x, y: mech1.torso.position.y },
    mech2: { x: mech2.torso.position.x, y: mech2.torso.position.y }
};

// REPORT
console.log('\n' + '═'.repeat(60));
console.log('MOVEMENT DIAGNOSTIC REPORT');
console.log('═'.repeat(60) + '\n');

console.log('📊 MOVEMENT STATISTICS:');
console.log(`  Left movements: ${diagnostics.movements.left}`);
console.log(`  Right movements: ${diagnostics.movements.right}`);
console.log(`  Idle periods: ${diagnostics.movements.still}`);
console.log(`  Bounds violations: ${diagnostics.boundsViolations}`);
console.log('');

console.log('📍 FINAL POSITIONS:');
console.log(`  Mech1: (${diagnostics.finalPositions.mech1.x.toFixed(1)}, ${diagnostics.finalPositions.mech1.y.toFixed(1)})`);
console.log(`  Mech2: (${diagnostics.finalPositions.mech2.x.toFixed(1)}, ${diagnostics.finalPositions.mech2.y.toFixed(1)})`);
console.log(`  Expected X range: 100-700`);
console.log(`  Expected Y range: 360-400`);
console.log('');

if (diagnostics.errors.length > 0) {
    console.log('❌ ERRORS:');
    const unique = [...new Set(diagnostics.errors)];
    unique.slice(0, 10).forEach(err => console.log(`  ${err}`));
    if (unique.length > 10) {
        console.log(`  ... and ${unique.length - 10} more unique errors`);
    }
    console.log('');
}

console.log('═'.repeat(60));

const m1InBounds = diagnostics.finalPositions.mech1.x > 0 && diagnostics.finalPositions.mech1.x < CONFIG.width &&
                   diagnostics.finalPositions.mech1.y > 300 && diagnostics.finalPositions.mech1.y < 450;
const m2InBounds = diagnostics.finalPositions.mech2.x > 0 && diagnostics.finalPositions.mech2.x < CONFIG.width &&
                   diagnostics.finalPositions.mech2.y > 300 && diagnostics.finalPositions.mech2.y < 450;

if (m1InBounds && m2InBounds && diagnostics.boundsViolations === 0) {
    console.log('✅ MOVEMENT SYSTEM WORKS CORRECTLY');
    console.log('\n  • Mechs stayed within bounds');
    console.log('  • Movement forces appropriate');
    console.log('  • No out-of-bounds issues');
    process.exit(0);
} else {
    console.log('❌ MOVEMENT SYSTEM HAS ISSUES');
    if (!m1InBounds || !m2InBounds) {
        console.log('\n  • Mechs went out of bounds');
    }
    if (diagnostics.boundsViolations > 0) {
        console.log(`\n  • ${diagnostics.boundsViolations} bounds violations detected`);
    }
    process.exit(1);
}
