#!/usr/bin/env node

/**
 * Test ARTICULATED mechs (torso, head, arms, legs) to find the falling issue
 */

const Matter = require('matter-js');
const { Engine, World, Bodies, Body, Events, Composite, Constraint } = Matter;

console.log('\n🤖 ARTICULATED MECH PHYSICS TEST\n');
console.log('═'.repeat(60));

const CONFIG = {
    width: 800,
    height: 450,
    gravity: 1.2,
    frames: 300,
    logInterval: 30,
    groundY: 430,
    mechStartY: 300
};

// Create engine
const engine = Engine.create();
engine.gravity.y = CONFIG.gravity;
const world = engine.world;

// Create ground
const ground = Bodies.rectangle(CONFIG.width / 2, CONFIG.groundY, CONFIG.width, 40, {
    isStatic: true,
    label: 'ground',
    friction: 0.8
});
World.add(world, ground);
console.log(`✓ Ground created at Y=${CONFIG.groundY}`);

// CREATE ARTICULATED MECH (like in the game)
function createArticulatedMech(x, y, isPlayer) {
    const size = 30;
    const scale = 1.0;
    const scaledSize = size * scale;

    // Create body parts
    const torso = Bodies.rectangle(x, y, scaledSize * 1.2, scaledSize * 1.5, {
        density: 0.002,
        friction: 0.8,
        label: isPlayer ? 'player_torso' : 'enemy_torso'
    });

    const head = Bodies.circle(x, y - scaledSize, scaledSize * 0.5, {
        density: 0.001,
        label: isPlayer ? 'player_head' : 'enemy_head'
    });

    const leftArm = Bodies.rectangle(x - scaledSize * 0.8, y, scaledSize * 0.4, scaledSize, {
        density: 0.001,
        label: isPlayer ? 'player_leftArm' : 'enemy_leftArm'
    });

    const rightArm = Bodies.rectangle(x + scaledSize * 0.8, y, scaledSize * 0.4, scaledSize, {
        density: 0.001,
        label: isPlayer ? 'player_rightArm' : 'enemy_rightArm'
    });

    const leftLeg = Bodies.rectangle(x - scaledSize * 0.3, y + scaledSize, scaledSize * 0.4, scaledSize, {
        density: 0.001,
        label: isPlayer ? 'player_leftLeg' : 'enemy_leftLeg'
    });

    const rightLeg = Bodies.rectangle(x + scaledSize * 0.3, y + scaledSize, scaledSize * 0.4, scaledSize, {
        density: 0.001,
        label: isPlayer ? 'player_rightLeg' : 'enemy_rightLeg'
    });

    // Create constraints (joints)
    const constraints = [
        Constraint.create({
            bodyA: head,
            bodyB: torso,
            pointA: { x: 0, y: scaledSize * 0.3 },
            pointB: { x: 0, y: -scaledSize * 0.7 },
            stiffness: 0.7,
            length: 0,
            label: 'neck'
        }),
        Constraint.create({
            bodyA: leftArm,
            bodyB: torso,
            pointA: { x: 0, y: -scaledSize * 0.4 },
            pointB: { x: -scaledSize * 0.4, y: -scaledSize * 0.5 },
            stiffness: 0.5,
            length: 0,
            label: 'left_shoulder'
        }),
        Constraint.create({
            bodyA: rightArm,
            bodyB: torso,
            pointA: { x: 0, y: -scaledSize * 0.4 },
            pointB: { x: scaledSize * 0.4, y: -scaledSize * 0.5 },
            stiffness: 0.5,
            length: 0,
            label: 'right_shoulder'
        }),
        Constraint.create({
            bodyA: leftLeg,
            bodyB: torso,
            pointA: { x: 0, y: -scaledSize * 0.4 },
            pointB: { x: -scaledSize * 0.2, y: scaledSize * 0.7 },
            stiffness: 0.6,
            length: 0,
            label: 'left_hip'
        }),
        Constraint.create({
            bodyA: rightLeg,
            bodyB: torso,
            pointA: { x: 0, y: -scaledSize * 0.4 },
            pointB: { x: scaledSize * 0.2, y: scaledSize * 0.7 },
            stiffness: 0.6,
            length: 0,
            label: 'right_hip'
        })
    ];

    // Add all parts to world
    World.add(world, [torso, head, leftArm, rightArm, leftLeg, rightLeg]);
    constraints.forEach(c => World.add(world, c));

    return {
        torso, head, leftArm, rightArm, leftLeg, rightLeg,
        constraints,
        parts: [torso, head, leftArm, rightArm, leftLeg, rightLeg]
    };
}

const mech1 = createArticulatedMech(200, CONFIG.mechStartY, true);
const mech2 = createArticulatedMech(600, CONFIG.mechStartY, false);

console.log('✓ Articulated Mech 1 created (6 parts, 5 joints)');
console.log('✓ Articulated Mech 2 created (6 parts, 5 joints)');
console.log('\n' + '─'.repeat(60));
console.log('SIMULATION START');
console.log('─'.repeat(60) + '\n');

// Diagnostics
let diagnostics = {
    errors: [],
    minY: { mech1: CONFIG.mechStartY, mech2: CONFIG.mechStartY },
    maxY: { mech1: 0, mech2: 0 },
    finalPositions: null
};

// Run simulation
for (let frame = 0; frame < CONFIG.frames; frame++) {
    Engine.update(engine, 16.67);

    // Get lowest point of each mech (feet)
    const m1Lowest = Math.max(...mech1.parts.map(p => p.position.y));
    const m2Lowest = Math.max(...mech2.parts.map(p => p.position.y));
    const m1Highest = Math.min(...mech1.parts.map(p => p.position.y));
    const m2Highest = Math.min(...mech2.parts.map(p => p.position.y));

    diagnostics.maxY.mech1 = Math.max(diagnostics.maxY.mech1, m1Lowest);
    diagnostics.maxY.mech2 = Math.max(diagnostics.maxY.mech2, m2Lowest);
    diagnostics.minY.mech1 = Math.min(diagnostics.minY.mech1, m1Highest);
    diagnostics.minY.mech2 = Math.min(diagnostics.minY.mech2, m2Highest);

    // Check for falling through ground
    if (m1Lowest > CONFIG.groundY + 100 || m2Lowest > CONFIG.groundY + 100) {
        diagnostics.errors.push(`Frame ${frame}: Mech fell through ground! M1=${m1Lowest.toFixed(1)}, M2=${m2Lowest.toFixed(1)}`);
    }

    // Check for exploding (parts flying apart)
    const m1Spread = m1Lowest - m1Highest;
    const m2Spread = m2Lowest - m2Highest;
    if (m1Spread > 200 || m2Spread > 200) {
        diagnostics.errors.push(`Frame ${frame}: Mech exploded! M1 spread=${m1Spread.toFixed(1)}, M2 spread=${m2Spread.toFixed(1)}`);
    }

    // Periodic logging
    if (frame % CONFIG.logInterval === 0 || frame === CONFIG.frames - 1) {
        const time = (frame / 60).toFixed(2);
        const m1TorsoY = mech1.torso.position.y.toFixed(1);
        const m2TorsoY = mech2.torso.position.y.toFixed(1);
        const m1VelY = mech1.torso.velocity.y.toFixed(2);
        const m2VelY = mech2.torso.velocity.y.toFixed(2);

        console.log(`[${time}s] Frame ${frame}:`);
        console.log(`  Mech1 torso: Y=${m1TorsoY} vel.y=${m1VelY} | Range: ${m1Highest.toFixed(1)}-${m1Lowest.toFixed(1)}`);
        console.log(`  Mech2 torso: Y=${m2TorsoY} vel.y=${m2VelY} | Range: ${m2Highest.toFixed(1)}-${m2Lowest.toFixed(1)}`);
        console.log('');
    }
}

diagnostics.finalPositions = {
    mech1: {
        torso: { y: mech1.torso.position.y },
        lowest: Math.max(...mech1.parts.map(p => p.position.y))
    },
    mech2: {
        torso: { y: mech2.torso.position.y },
        lowest: Math.max(...mech2.parts.map(p => p.position.y))
    }
};

// REPORT
console.log('\n' + '═'.repeat(60));
console.log('ARTICULATED MECH DIAGNOSTIC REPORT');
console.log('═'.repeat(60) + '\n');

console.log('📍 FINAL POSITIONS:');
console.log(`  Mech1 torso Y: ${diagnostics.finalPositions.mech1.torso.y.toFixed(1)}`);
console.log(`  Mech1 lowest part: ${diagnostics.finalPositions.mech1.lowest.toFixed(1)}`);
console.log(`  Mech2 torso Y: ${diagnostics.finalPositions.mech2.torso.y.toFixed(1)}`);
console.log(`  Mech2 lowest part: ${diagnostics.finalPositions.mech2.lowest.toFixed(1)}`);
console.log(`  Ground: ${CONFIG.groundY} (lowest parts should be around 400-410)`);
console.log('');

console.log('📈 Y-POSITION RANGE:');
console.log(`  Mech1: ${diagnostics.minY.mech1.toFixed(1)} → ${diagnostics.maxY.mech1.toFixed(1)}`);
console.log(`  Mech2: ${diagnostics.minY.mech2.toFixed(1)} → ${diagnostics.maxY.mech2.toFixed(1)}`);
console.log('');

if (diagnostics.errors.length > 0) {
    console.log('❌ ERRORS:');
    diagnostics.errors.slice(0, 10).forEach(err => console.log(`  ${err}`));
    console.log('');
}

console.log('═'.repeat(60));

const m1OnGround = diagnostics.finalPositions.mech1.lowest > 380 && diagnostics.finalPositions.mech1.lowest < 420;
const m2OnGround = diagnostics.finalPositions.mech2.lowest > 380 && diagnostics.finalPositions.mech2.lowest < 420;
const noErrors = diagnostics.errors.length === 0;

if (m1OnGround && m2OnGround && noErrors) {
    console.log('✅ ARTICULATED MECHS WORK CORRECTLY');
    console.log('\n  • Fell and landed on ground');
    console.log('  • Parts stayed together');
    console.log('  • No falling through ground');
    process.exit(0);
} else {
    console.log('❌ ARTICULATED MECHS HAVE ISSUES');
    if (!m1OnGround || !m2OnGround) {
        console.log('\n  • Mechs not resting on ground properly');
        console.log(`    Mech1 lowest: ${diagnostics.finalPositions.mech1.lowest.toFixed(1)} (expected 380-420)`);
        console.log(`    Mech2 lowest: ${diagnostics.finalPositions.mech2.lowest.toFixed(1)} (expected 380-420)`);
    }
    if (!noErrors) {
        console.log('\n  • Critical errors detected (see above)');
    }
    process.exit(1);
}
