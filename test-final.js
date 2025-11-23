#!/usr/bin/env node

const Matter = require('matter-js');
const { Engine, World, Bodies, Body, Constraint } = Matter;

console.log('\n🎯 FINAL INTEGRATED TEST: Articulated Mechs + Movement\n');

const engine = Engine.create();
engine.gravity.y = 1.2;
const world = engine.world;

const ground = Bodies.rectangle(400, 430, 800, 40, { isStatic: true, friction: 0.8 });
World.add(world, ground);

// Articulated mech with head
function createMech(x, y) {
    const torso = Bodies.rectangle(x, y, 40, 60, { density: 0.002, friction: 0.8, frictionAir: 0.02 });
    const head = Bodies.circle(x, y - 30, 15, { density: 0.001 });
    const neck = Constraint.create({ bodyA: head, bodyB: torso, stiffness: 0.7, length: 5 });
    
    World.add(world, [torso, head, neck]);
    return { torso, head, moveDir: 0, nextChange: 60 };
}

const m1 = createMech(200, 300);
const m2 = createMech(600, 300);

console.log('Running 10 second simulation with movement...\n');

let issues = [];

for (let f = 0; f < 600; f++) {
    // Movement AI
    [m1, m2].forEach(m => {
        if (f > m.nextChange) {
            m.moveDir = Math.random() < 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0;
            m.nextChange = f + 60;
        }
        if (m.moveDir !== 0 && m.torso.position.x > 100 && m.torso.position.x < 700) {
            Body.applyForce(m.torso, m.torso.position, { x: m.moveDir * 0.004, y: 0 });
        }
    });
    
    Engine.update(engine, 16.67);
    
    // Check for falling
    if (m1.torso.position.y > 500 || m2.torso.position.y > 500) {
        issues.push(`Frame ${f}: Mech fell! M1.y=${m1.torso.position.y.toFixed(1)}, M2.y=${m2.torso.position.y.toFixed(1)}`);
        if (issues.length === 1) { // First issue
            console.log(`❌ FALLING DETECTED at frame ${f}:`);
            console.log(`   M1: pos=(${m1.torso.position.x.toFixed(1)}, ${m1.torso.position.y.toFixed(1)}) vel.y=${m1.torso.velocity.y.toFixed(2)}`);
            console.log(`   M2: pos=(${m2.torso.position.x.toFixed(1)}, ${m2.torso.position.y.toFixed(1)}) vel.y=${m2.torso.velocity.y.toFixed(2)}`);
        }
    }
    
    if (f % 120 === 0) {
        console.log(`[${(f/60).toFixed(1)}s] M1: (${m1.torso.position.x.toFixed(0)}, ${m1.torso.position.y.toFixed(0)}) M2: (${m2.torso.position.x.toFixed(0)}, ${m2.torso.position.y.toFixed(0)})`);
    }
}

console.log(`\nFinal: M1=(${m1.torso.position.x.toFixed(1)}, ${m1.torso.position.y.toFixed(1)}) M2=(${m2.torso.position.x.toFixed(1)}, ${m2.torso.position.y.toFixed(1)})`);
console.log(`Issues detected: ${issues.length}`);

if (issues.length > 0) {
    console.log('\n❌ TEST FAILED - Mechs fell through ground');
    console.log('Root cause: Articulated bodies with movement forces become unstable');
    process.exit(1);
} else {
    console.log('\n✅ TEST PASSED');
    process.exit(0);
}
