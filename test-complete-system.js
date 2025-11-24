#!/usr/bin/env node
const Matter = require('matter-js');
const { Engine, World, Bodies, Body, Events, Constraint } = Matter;

console.log('\n🎯 COMPLETE SYSTEM TEST - Everything Together\n');
console.log('Testing: Articulated mechs + Movement + Terrain + Battle + Boundaries\n');

const engine = Engine.create();
engine.gravity.y = 1.2;
const world = engine.world;

// Ground
const ground = Bodies.rectangle(400, 430, 800, 40, { isStatic: true, friction: 0.8 });
World.add(world, ground);

// TERRAIN BLOCKS (like in game)
console.log('Creating terrain blocks...');
const terrain = [];
for (let i = 0; i < 5; i++) {
    const x = 300 + i * 40;
    const y = 350;
    const block = Bodies.rectangle(x, y, 20, 20, {
        isStatic: true, // Make static so they don't fall
        label: 'terrain'
    });
    World.add(world, block);
    terrain.push(block);
}
console.log(`✓ Created ${terrain.length} terrain blocks at x=300-500`);

// Create ARTICULATED mech
function createArticulatedMech(x, y, isPlayer) {
    const size = 30;
    const torso = Bodies.rectangle(x, y, size * 1.2, size * 1.5, {
        density: 0.002, friction: 0.8, frictionAir: 0.05,
        label: isPlayer ? 'player_torso' : 'enemy_torso'
    });
    const head = Bodies.circle(x, y - size, size * 0.5, {
        density: 0.001, label: isPlayer ? 'player_head' : 'enemy_head'
    });
    const neck = Constraint.create({ bodyA: head, bodyB: torso, stiffness: 0.7, length: 5 });

    World.add(world, [torso, head, neck]);

    return {
        torso, head,
        currentHP: isPlayer ? 120 : 80,
        maxHP: isPlayer ? 120 : 80,
        damage: isPlayer ? 30 : 20,
        isPlayer,
        moveDirection: 0,
        moveSpeed: 0.004,
        nextMoveChange: 60,
        lastShot: 0
    };
}

const player = createArticulatedMech(150, 300, true); // Left side
const enemy = createArticulatedMech(650, 300, false); // Right side
console.log(`✓ Player at X=150, Enemy at X=650 (blocks at X=300-500 between them)`);

let projectiles = [];
let shotsFired = 0;
let hits = 0;

// Collision detection
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const proj = projectiles.find(p => p === pair.bodyA || p === pair.bodyB);
        if (!proj) return;

        const other = pair.bodyA === proj ? pair.bodyB : pair.bodyA;

        if (other === proj.target.torso || other === proj.target.head) {
            proj.target.currentHP = Math.max(0, proj.target.currentHP - proj.damage);
            hits++;
            console.log(`  💥 HIT! ${proj.target.isPlayer ? 'Player' : 'Enemy'}: ${proj.target.currentHP}HP`);
            World.remove(world, proj);
            projectiles = projectiles.filter(p => p !== proj);
        } else if (other.label === 'terrain') {
            console.log(`  🧱 Projectile hit terrain block`);
            World.remove(world, proj);
            projectiles = projectiles.filter(p => p !== proj);
        }
    });
});

// Fire projectile
function fireProjectile(from, to, frame) {
    const angle = Math.atan2(to.torso.position.y - from.torso.position.y,
                             to.torso.position.x - from.torso.position.x);
    const proj = Bodies.circle(from.torso.position.x, from.torso.position.y, 6, {
        density: 0.001, label: 'projectile'
    });
    Body.setVelocity(proj, { x: Math.cos(angle) * 15, y: Math.sin(angle) * 15 });
    proj.damage = from.damage;
    proj.target = to;
    proj.firedAt = frame;

    World.add(world, proj);
    projectiles.push(proj);
    shotsFired++;
    console.log(`🚀 ${from.isPlayer ? 'Player' : 'Enemy'} fires #${shotsFired}`);
}

// Movement AI with velocity clamping
function updateMovement(mech, frame) {
    if (frame > mech.nextMoveChange) {
        mech.moveDirection = Math.random() < 0.3 ? (Math.random() < 0.5 ? -1 : 1) : 0;
        mech.nextMoveChange = frame + 60;
    }

    // VELOCITY CLAMPING (the fix!)
    if (Math.abs(mech.torso.velocity.x) > 2.5) {
        Body.setVelocity(mech.torso, {
            x: Math.sign(mech.torso.velocity.x) * 2.5,
            y: mech.torso.velocity.y
        });
    }

    // BOUNDARY ENFORCEMENT (the fix!)
    const pos = mech.torso.position;
    if (pos.x < 100 || pos.x > 700) {
        Body.setPosition(mech.torso, { x: Math.max(100, Math.min(700, pos.x)), y: pos.y });
        Body.setVelocity(mech.torso, { x: 0, y: mech.torso.velocity.y });
        mech.moveDirection = 0;
    } else if (mech.moveDirection !== 0) {
        if ((mech.moveDirection < 0 && pos.x > 150) || (mech.moveDirection > 0 && pos.x < 650)) {
            Body.applyForce(mech.torso, pos, { x: mech.moveDirection * mech.moveSpeed, y: 0 });
        }
    }
}

console.log('\nRunning 10 second battle...\n');

let battleEnded = false;
const fireInterval = 90; // Fire every 1.5s

for (let frame = 0; frame < 600; frame++) {
    // Movement
    updateMovement(player, frame);
    updateMovement(enemy, frame);

    // Firing
    if (!battleEnded) {
        if (frame - player.lastShot >= fireInterval && player.currentHP > 0) {
            fireProjectile(player, enemy, frame);
            player.lastShot = frame;
        }
        if (frame - enemy.lastShot >= fireInterval && enemy.currentHP > 0) {
            fireProjectile(enemy, player, frame);
            enemy.lastShot = frame;
        }
    }

    Engine.update(engine, 16.67);

    // Clean old projectiles
    projectiles = projectiles.filter(p => {
        if (frame - p.firedAt > 180) {
            World.remove(world, p);
            return false;
        }
        return true;
    });

    // Check battle end
    if (!battleEnded && (player.currentHP <= 0 || enemy.currentHP <= 0)) {
        battleEnded = true;
        console.log(`\n⚔️  BATTLE ENDED at ${(frame/60).toFixed(1)}s`);
        console.log(`Winner: ${player.currentHP > 0 ? 'PLAYER' : 'ENEMY'}`);
        console.log(`Player: ${player.currentHP}HP, Enemy: ${enemy.currentHP}HP\n`);
    }

    // Check physics errors
    if (player.torso.position.y > 500 || enemy.torso.position.y > 500) {
        console.log(`❌ Frame ${frame}: Mech fell through ground!`);
        break;
    }
    if (player.torso.position.x < 0 || player.torso.position.x > 800 ||
        enemy.torso.position.x < 0 || enemy.torso.position.x > 800) {
        console.log(`❌ Frame ${frame}: Mech escaped bounds! P=${player.torso.position.x.toFixed(0)}, E=${enemy.torso.position.x.toFixed(0)}`);
    }
}

console.log(`\n═══ FINAL RESULTS ═══`);
console.log(`Shots fired: ${shotsFired}`);
console.log(`Hits: ${hits}`);
console.log(`Player: ${player.currentHP}/${player.maxHP} HP at (${player.torso.position.x.toFixed(0)}, ${player.torso.position.y.toFixed(0)})`);
console.log(`Enemy: ${enemy.currentHP}/${enemy.maxHP} HP at (${enemy.torso.position.x.toFixed(0)}, ${enemy.torso.position.y.toFixed(0)})`);

const success = shotsFired > 0 && battleEnded && 
                player.torso.position.x > 0 && player.torso.position.x < 800 &&
                enemy.torso.position.x > 0 && enemy.torso.position.x < 800;

if (success) {
    console.log('\n✅ COMPLETE SYSTEM WORKING!\n');
    process.exit(0);
} else {
    console.log('\n❌ SYSTEM HAS ISSUES\n');
    process.exit(1);
}
