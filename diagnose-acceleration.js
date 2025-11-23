#!/usr/bin/env node

/**
 * Diagnose WHY mechs are accelerating off screen
 */

const Matter = require('matter-js');
const { Engine, World, Bodies, Body } = Matter;

console.log('\n🔬 ACCELERATION BUG ANALYSIS\n');
console.log('═'.repeat(60));

const engine = Engine.create();
engine.gravity.y = 1.2;
const world = engine.world;

// Ground
const ground = Bodies.rectangle(400, 430, 800, 40, {
    isStatic: true,
    friction: 0.8
});
World.add(world, ground);

// Single mech
const mech = Bodies.rectangle(200, 300, 40, 60, {
    density: 0.002,
    friction: 0.8,
    frictionAir: 0.02
});
World.add(world, mech);

console.log('Testing horizontal force application...\n');

let forceApplications = 0;
const moveSpeed = 0.004;

// Simulate movement RIGHT
for (let frame = 0; frame < 600; frame++) {
    // Apply force if moving right and in bounds
    if (mech.position.x < 700) {
        Body.applyForce(mech, mech.position, { x: moveSpeed, y: 0 });
        forceApplications++;
    }

    Engine.update(engine, 16.67);

    // Log key moments
    if (frame === 0 || frame === 60 || frame === 120 || frame === 180 || frame === 240 || frame === 300) {
        const stable = Math.abs(mech.velocity.y) < 0.1;
        console.log(`Frame ${frame} (${(frame/60).toFixed(1)}s):`);
        console.log(`  Position: (${mech.position.x.toFixed(1)}, ${mech.position.y.toFixed(1)})`);
        console.log(`  Velocity: (${mech.velocity.x.toFixed(3)}, ${mech.velocity.y.toFixed(3)}) ${stable ? '✓' : '⚠️ UNSTABLE'}`);
        console.log(`  On ground: ${mech.position.y < 400 ? 'YES' : 'NO'}`);
        console.log(`  Forces applied so far: ${forceApplications}`);
        console.log('');
    }

    // Check if it fell through
    if (mech.position.y > 500) {
        console.log(`❌ MECH FELL THROUGH GROUND at frame ${frame}!`);
        console.log(`   Final position: (${mech.position.x.toFixed(1)}, ${mech.position.y.toFixed(1)})`);
        console.log(`   Final velocity: (${mech.velocity.x.toFixed(3)}, ${mech.velocity.y.toFixed(3)})`);
        console.log(`   Total force applications: ${forceApplications}`);

        console.log('\n🔍 DIAGNOSIS:');
        console.log('   • Horizontal forces are being applied WHILE ON GROUND');
        console.log('   • Forces are applied EVERY FRAME (60 times per second)');
        console.log(`   • Total forces: ${forceApplications} over ${frame} frames`);
        console.log('   • This accumulates velocity beyond what friction can counteract');
        console.log('   • High velocity destabilizes ground contact');
        console.log('   • Mech bounces or phases through ground');
        console.log('   • Once airborne, falls infinitely');

        console.log('\n💡 SOLUTION:');
        console.log('   • Reduce movement force magnitude');
        console.log('   • OR apply forces less frequently (not every frame)');
        console.log('   • OR increase frictionAir to counteract acceleration');
        console.log('   • OR limit max velocity');
        process.exit(1);
    }
}

console.log('✅ Mech stayed on ground for 10 seconds');
console.log(`Final position: (${mech.position.x.toFixed(1)}, ${mech.position.y.toFixed(1)})`);
console.log(`Final velocity: (${mech.velocity.x.toFixed(3)}, ${mech.velocity.y.toFixed(3)})`);
