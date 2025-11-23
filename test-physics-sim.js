#!/usr/bin/env node

/**
 * Autonomous Physics Simulation Diagnostic
 * Runs Matter.js physics headlessly and reports detailed state
 */

// Check if matter-js is available
let Matter;
try {
    Matter = require('matter-js');
    console.log('✓ Matter.js loaded successfully');
} catch (e) {
    console.log('✗ Matter.js not found. Installing...');
    require('child_process').execSync('npm install matter-js', { stdio: 'inherit' });
    Matter = require('matter-js');
}

const { Engine, World, Bodies, Body, Events, Composite } = Matter;

console.log('\n🧪 AUTONOMOUS PHYSICS DIAGNOSTIC\n');
console.log('═'.repeat(60));

// Configuration
const CONFIG = {
    width: 800,
    height: 450,
    gravity: 1.2,
    frames: 300, // 5 seconds at 60fps
    logInterval: 30, // Log every 0.5 seconds
    groundY: 430,
    mech1StartX: 200,
    mech2StartX: 600,
    mechStartY: 300
};

// Create engine
const engine = Engine.create();
engine.gravity.y = CONFIG.gravity;
const world = engine.world;

console.log(`Creating world: ${CONFIG.width}x${CONFIG.height}, gravity=${CONFIG.gravity}`);

// Create ground
const ground = Bodies.rectangle(
    CONFIG.width / 2,
    CONFIG.groundY,
    CONFIG.width,
    40,
    {
        isStatic: true,
        label: 'ground',
        friction: 0.8
    }
);
World.add(world, ground);
console.log(`✓ Ground created at Y=${CONFIG.groundY} (static)`);

// Create simple mech bodies
const mech1 = Bodies.rectangle(
    CONFIG.mech1StartX,
    CONFIG.mechStartY,
    40,
    60,
    {
        density: 0.002,
        friction: 0.8,
        frictionAir: 0.02,
        label: 'player_mech'
    }
);

const mech2 = Bodies.rectangle(
    CONFIG.mech2StartX,
    CONFIG.mechStartY,
    40,
    60,
    {
        density: 0.002,
        friction: 0.8,
        frictionAir: 0.02,
        label: 'enemy_mech'
    }
);

World.add(world, [mech1, mech2]);
console.log(`✓ Mech 1 created at (${CONFIG.mech1StartX}, ${CONFIG.mechStartY})`);
console.log(`✓ Mech 2 created at (${CONFIG.mech2StartX}, ${CONFIG.mechStartY})`);

// Test movement forces
let moveDirection = 1; // Start moving right
const moveSpeed = 0.005;
let nextDirectionChange = 50;

// Collision tracking
let collisions = [];
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const labels = [pair.bodyA.label, pair.bodyB.label].sort().join(' + ');
        collisions.push({ frame: currentFrame, labels });
    });
});

// Diagnostic data
let diagnostics = {
    warnings: [],
    errors: [],
    collisionCount: 0,
    maxYReached: { mech1: 0, mech2: 0 },
    minYReached: { mech1: CONFIG.mechStartY, mech2: CONFIG.mechStartY },
    finalPositions: null,
    stableFrames: 0
};

let currentFrame = 0;

console.log('\n' + '─'.repeat(60));
console.log('SIMULATION START');
console.log('─'.repeat(60) + '\n');

// Run simulation
for (let frame = 0; frame < CONFIG.frames; frame++) {
    currentFrame = frame;

    // Apply movement forces periodically
    if (frame > nextDirectionChange) {
        moveDirection = Math.random() < 0.5 ? -1 : 1;
        nextDirectionChange = frame + 30 + Math.floor(Math.random() * 30);
    }

    // Apply horizontal movement to mech1
    if (frame % 10 === 0) { // Apply force every 10 frames
        const pos = mech1.position;
        if ((moveDirection < 0 && pos.x > 50) || (moveDirection > 0 && pos.x < CONFIG.width - 50)) {
            Body.applyForce(mech1, pos, { x: moveDirection * moveSpeed, y: 0 });
        }
    }

    // Update physics
    Engine.update(engine, 16.67); // 60fps

    // Track positions
    diagnostics.maxYReached.mech1 = Math.max(diagnostics.maxYReached.mech1, mech1.position.y);
    diagnostics.maxYReached.mech2 = Math.max(diagnostics.maxYReached.mech2, mech2.position.y);
    diagnostics.minYReached.mech1 = Math.min(diagnostics.minYReached.mech1, mech1.position.y);
    diagnostics.minYReached.mech2 = Math.min(diagnostics.minYReached.mech2, mech2.position.y);

    // Check for issues
    const m1y = mech1.position.y;
    const m2y = mech2.position.y;
    const m1x = mech1.position.x;
    const m2x = mech2.position.x;

    // Falling through ground
    if (m1y > CONFIG.groundY + 50 || m2y > CONFIG.groundY + 50) {
        diagnostics.errors.push(`Frame ${frame}: Mech fell through ground! M1.y=${m1y.toFixed(1)}, M2.y=${m2y.toFixed(1)}`);
    }

    // Going out of bounds
    if (m1y < 0 || m2y < 0 || m1y > CONFIG.height + 100 || m2y > CONFIG.height + 100) {
        diagnostics.errors.push(`Frame ${frame}: Mech out of vertical bounds! M1.y=${m1y.toFixed(1)}, M2.y=${m2y.toFixed(1)}`);
    }

    if (m1x < -50 || m2x < -50 || m1x > CONFIG.width + 50 || m2x > CONFIG.width + 50) {
        diagnostics.errors.push(`Frame ${frame}: Mech out of horizontal bounds! M1.x=${m1x.toFixed(1)}, M2.x=${m2x.toFixed(1)}`);
    }

    // Check if mechs are stable (resting on ground)
    const m1Stable = Math.abs(mech1.velocity.y) < 0.1 && m1y > 350 && m1y < 400;
    const m2Stable = Math.abs(mech2.velocity.y) < 0.1 && m2y > 350 && m2y < 400;

    if (m1Stable && m2Stable) {
        diagnostics.stableFrames++;
    }

    // Periodic logging
    if (frame % CONFIG.logInterval === 0 || frame === CONFIG.frames - 1) {
        const time = (frame / 60).toFixed(2);
        console.log(`[${time}s] Frame ${frame}:`);
        console.log(`  Mech1: pos=(${m1x.toFixed(1)}, ${m1y.toFixed(1)}) vel=(${mech1.velocity.x.toFixed(2)}, ${mech1.velocity.y.toFixed(2)}) ${m1Stable ? '✓ STABLE' : '⬇ MOVING'}`);
        console.log(`  Mech2: pos=(${m2x.toFixed(1)}, ${m2y.toFixed(1)}) vel=(${mech2.velocity.x.toFixed(2)}, ${mech2.velocity.y.toFixed(2)}) ${m2Stable ? '✓ STABLE' : '⬇ MOVING'}`);

        if (collisions.length > 0) {
            const recentCollisions = collisions.filter(c => c.frame > frame - CONFIG.logInterval);
            if (recentCollisions.length > 0) {
                console.log(`  Collisions: ${recentCollisions.map(c => c.labels).join(', ')}`);
            }
        }
        console.log('');
    }
}

diagnostics.finalPositions = {
    mech1: { x: mech1.position.x, y: mech1.position.y },
    mech2: { x: mech2.position.x, y: mech2.position.y }
};
diagnostics.collisionCount = collisions.length;

// FINAL REPORT
console.log('\n' + '═'.repeat(60));
console.log('DIAGNOSTIC REPORT');
console.log('═'.repeat(60) + '\n');

console.log('📊 STATISTICS:');
console.log(`  Total frames simulated: ${CONFIG.frames}`);
console.log(`  Total collisions: ${diagnostics.collisionCount}`);
console.log(`  Stable frames: ${diagnostics.stableFrames}/${CONFIG.frames} (${(diagnostics.stableFrames/CONFIG.frames*100).toFixed(1)}%)`);
console.log('');

console.log('📍 FINAL POSITIONS:');
console.log(`  Mech1: (${diagnostics.finalPositions.mech1.x.toFixed(1)}, ${diagnostics.finalPositions.mech1.y.toFixed(1)})`);
console.log(`  Mech2: (${diagnostics.finalPositions.mech2.x.toFixed(1)}, ${diagnostics.finalPositions.mech2.y.toFixed(1)})`);
console.log('');

console.log('📈 Y-POSITION RANGE:');
console.log(`  Mech1: ${diagnostics.minYReached.mech1.toFixed(1)} → ${diagnostics.maxYReached.mech1.toFixed(1)}`);
console.log(`  Mech2: ${diagnostics.minYReached.mech2.toFixed(1)} → ${diagnostics.maxYReached.mech2.toFixed(1)}`);
console.log(`  Ground: ${CONFIG.groundY} (mechs should settle around 370-380)`);
console.log('');

// Collision analysis
if (diagnostics.collisionCount > 0) {
    const groundCollisions = collisions.filter(c => c.labels.includes('ground')).length;
    console.log('💥 COLLISION BREAKDOWN:');
    console.log(`  Ground collisions: ${groundCollisions}`);
    console.log(`  Other collisions: ${diagnostics.collisionCount - groundCollisions}`);
    console.log('');
}

// Issues
let hasErrors = false;

if (diagnostics.errors.length > 0) {
    hasErrors = true;
    console.log('❌ ERRORS DETECTED:');
    diagnostics.errors.slice(0, 10).forEach(err => console.log(`  ${err}`));
    if (diagnostics.errors.length > 10) {
        console.log(`  ... and ${diagnostics.errors.length - 10} more errors`);
    }
    console.log('');
}

if (diagnostics.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    diagnostics.warnings.forEach(warn => console.log(`  ${warn}`));
    console.log('');
}

// Final verdict
console.log('═'.repeat(60));
if (hasErrors) {
    console.log('❌ SIMULATION FAILED');
    console.log('\nISSUES DETECTED:');
    if (diagnostics.errors.some(e => e.includes('fell through ground'))) {
        console.log('  • Mechs falling through ground - collision detection broken');
    }
    if (diagnostics.errors.some(e => e.includes('out of bounds'))) {
        console.log('  • Mechs going out of bounds - physics world issue');
    }
    process.exit(1);
} else {
    const m1Final = diagnostics.finalPositions.mech1.y;
    const m2Final = diagnostics.finalPositions.mech2.y;
    const m1OnGround = m1Final > 350 && m1Final < 400;
    const m2OnGround = m2Final > 350 && m2Final < 400;

    if (m1OnGround && m2OnGround) {
        console.log('✅ SIMULATION PASSED');
        console.log('\n  • Mechs fell and landed on ground correctly');
        console.log('  • No out-of-bounds issues');
        console.log('  • Ground collision working properly');
        console.log(`  • ${diagnostics.stableFrames} frames stable`);
        process.exit(0);
    } else {
        console.log('⚠️  SIMULATION INCOMPLETE');
        console.log('\n  • No critical errors but mechs not resting on ground');
        console.log(`  • Mech1 final Y: ${m1Final.toFixed(1)} (expected: 360-390)`);
        console.log(`  • Mech2 final Y: ${m2Final.toFixed(1)} (expected: 360-390)`);
        process.exit(1);
    }
}
