#!/usr/bin/env node

const Matter = require('matter-js');
const { Engine, World, Bodies, Body, Constraint } = Matter;

console.log('\n✅ TESTING FIX: Velocity Clamping + Strict Boundaries\n');

const engine = Engine.create();
engine.gravity.y = 1.2;
const world = engine.world;

const ground = Bodies.rectangle(400, 430, 800, 40, { isStatic: true, friction: 0.8 });
World.add(world, ground);

function createMech(x, y) {
    const torso = Bodies.rectangle(x, y, 40, 60, { density: 0.002, friction: 0.8, frictionAir: 0.02 });
    const head = Bodies.circle(x, y - 30, 15, { density: 0.001 });
    const neck = Constraint.create({ bodyA: head, bodyB: torso, stiffness: 0.7, length: 5 });
    
    World.add(world, [torso, head, neck]);
    return { torso, head, moveDir: 0, nextChange: 60 };
}

const m1 = createMech(200, 300);
const m2 = createMech(600, 300);

console.log('Running 10 second simulation with FIX applied...\n');

let issues = [];
const maxSpeed = 2.5;

for (let f = 0; f < 600; f++) {
    // Movement AI
    [m1, m2].forEach(m => {
        if (f > m.nextChange) {
            m.moveDir = Math.random() < 0.5 ? (Math.random() < 0.5 ? -1 : 1) : 0;
            m.nextChange = f + 60;
        }
        
        // FIX 1: Clamp velocity
        if (Math.abs(m.torso.velocity.x) > maxSpeed) {
            Body.setVelocity(m.torso, {
                x: Math.sign(m.torso.velocity.x) * maxSpeed,
                y: m.torso.velocity.y
            });
        }
        
        // FIX 2: Strict boundary enforcement
        const pos = m.torso.position;
        if (pos.x < 100 || pos.x > 700) {
            Body.setPosition(m.torso, {
                x: Math.max(100, Math.min(700, pos.x)),
                y: pos.y
            });
            Body.setVelocity(m.torso, { x: 0, y: m.torso.velocity.y });
            m.moveDir = 0;
        } else if (m.moveDir !== 0 && pos.x > 150 && pos.x < 650) {
            Body.applyForce(m.torso, pos, { x: m.moveDir * 0.004, y: 0 });
        }
    });
    
    Engine.update(engine, 16.67);
    
    if (m1.torso.position.y > 500 || m2.torso.position.y > 500) {
        issues.push(f);
    }
    
    if (f % 120 === 0) {
        console.log(`[${(f/60).toFixed(1)}s] M1: (${m1.torso.position.x.toFixed(0)}, ${m1.torso.position.y.toFixed(0)}) vel.x=${m1.torso.velocity.x.toFixed(2)} | M2: (${m2.torso.position.x.toFixed(0)}, ${m2.torso.position.y.toFixed(0)}) vel.x=${m2.torso.velocity.x.toFixed(2)}`);
    }
}

console.log(`\nFinal positions:`);
console.log(`  M1: (${m1.torso.position.x.toFixed(1)}, ${m1.torso.position.y.toFixed(1)})`);
console.log(`  M2: (${m2.torso.position.x.toFixed(1)}, ${m2.torso.position.y.toFixed(1)})`);
console.log(`\nMax speed enforced: ${maxSpeed}`);
console.log(`Falling issues: ${issues.length}`);

if (issues.length === 0) {
    console.log('\n✅ FIX SUCCESSFUL - No falling issues!');
    process.exit(0);
} else {
    console.log('\n❌ FIX FAILED');
    process.exit(1);
}
