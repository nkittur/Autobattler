/**
 * SHARED PHYSICS ENGINE - Single source of truth
 * Used by both physics-test.html and main game (index.html)
 * Any changes here automatically propagate to both!
 */

const PhysicsEngine = {
    // Configuration
    config: {
        gravity: 1.2,
        groundHeight: 40,
        canvasWidth: 800,
        canvasHeight: 450,
        mechSize: 30,
        projectileSpeed: 30,
        spawnOffset: 60
    },

    // Colors
    colors: {
        player: '#00ff88',
        enemy: '#ff4444',
        terrain: '#4a4a6a',
        projectile: '#ffaa00',
        background: '#0d0d1f',
        sky: '#1a1a3e',
        explosion: '#ff6600'
    },

    /**
     * Create articulated mech with Matter.js
     * @param {Matter} Matter - Matter.js library
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} isPlayer - Is this the player's mech?
     * @param {string} mechClass - 'Light', 'Medium', or 'Heavy'
     * @returns {Object} Mech object with all body parts
     */
    createMech(Matter, x, y, isPlayer, mechClass = 'Medium') {
        const { Bodies, Constraint, Composite, World } = Matter;

        // Size based on mech class
        let scale = 1;
        if (mechClass === 'Light') scale = 0.8;
        if (mechClass === 'Heavy') scale = 1.3;

        const size = this.config.mechSize * scale;

        // Create body parts
        const torso = Bodies.rectangle(x, y, size * 1.2, size * 1.5, {
            density: 0.002,
            friction: 0.8,
            frictionAir: 0.05,
            restitution: 0.1,
            inertia: Infinity, // Prevent rotation
            label: isPlayer ? 'player_torso' : 'enemy_torso',
            collisionFilter: {
                category: 0x0001, // Mech category
                mask: 0x0001 | 0x0002 // Collide with mechs and projectiles
            }
        });

        const head = Bodies.circle(x, y - size, size * 0.5, {
            density: 0.001,
            friction: 0.5,
            frictionAir: 0.03,
            label: isPlayer ? 'player_head' : 'enemy_head',
            collisionFilter: {
                category: 0x0001,
                mask: 0x0001 | 0x0002
            }
        });

        const leftArm = Bodies.rectangle(x - size * 0.8, y, size * 0.3, size, {
            density: 0.001,
            friction: 0.5,
            frictionAir: 0.03,
            label: isPlayer ? 'player_arm' : 'enemy_arm',
            collisionFilter: {
                category: 0x0001,
                mask: 0x0001 | 0x0002
            }
        });

        const rightArm = Bodies.rectangle(x + size * 0.8, y, size * 0.3, size, {
            density: 0.001,
            friction: 0.5,
            frictionAir: 0.03,
            label: isPlayer ? 'player_arm' : 'enemy_arm',
            collisionFilter: {
                category: 0x0001,
                mask: 0x0001 | 0x0002
            }
        });

        const leftLeg = Bodies.rectangle(x - size * 0.3, y + size * 1.2, size * 0.35, size * 0.8, {
            density: 0.002,
            friction: 0.9,
            frictionAir: 0.04,
            label: isPlayer ? 'player_leg' : 'enemy_leg',
            collisionFilter: {
                category: 0x0001,
                mask: 0x0001 | 0x0002
            }
        });

        const rightLeg = Bodies.rectangle(x + size * 0.3, y + size * 1.2, size * 0.35, size * 0.8, {
            density: 0.002,
            friction: 0.9,
            frictionAir: 0.04,
            label: isPlayer ? 'player_leg' : 'enemy_leg',
            collisionFilter: {
                category: 0x0001,
                mask: 0x0001 | 0x0002
            }
        });

        // Create constraints (joints)
        const constraints = [
            Constraint.create({
                bodyA: head,
                bodyB: torso,
                pointA: { x: 0, y: size * 0.3 },
                pointB: { x: 0, y: -size * 0.7 },
                stiffness: 0.7,
                length: 0,
                label: 'neck'
            }),
            Constraint.create({
                bodyA: leftArm,
                bodyB: torso,
                pointA: { x: 0, y: -size * 0.4 },
                pointB: { x: -size * 0.5, y: -size * 0.3 },
                stiffness: 0.5,
                length: 0,
                label: 'left_shoulder'
            }),
            Constraint.create({
                bodyA: rightArm,
                bodyB: torso,
                pointA: { x: 0, y: -size * 0.4 },
                pointB: { x: size * 0.5, y: -size * 0.3 },
                stiffness: 0.5,
                length: 0,
                label: 'right_shoulder'
            }),
            Constraint.create({
                bodyA: leftLeg,
                bodyB: torso,
                pointA: { x: 0, y: -size * 0.4 },
                pointB: { x: -size * 0.2, y: size * 0.7 },
                stiffness: 0.6,
                length: 0,
                label: 'left_hip'
            }),
            Constraint.create({
                bodyA: rightLeg,
                bodyB: torso,
                pointA: { x: 0, y: -size * 0.4 },
                pointB: { x: size * 0.2, y: size * 0.7 },
                stiffness: 0.6,
                length: 0,
                label: 'right_hip'
            })
        ];

        // Return mech object
        return {
            torso,
            head,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            constraints,
            scale,
            isPlayer,
            color: isPlayer ? this.colors.player : this.colors.enemy,
            parts: [torso, head, leftArm, rightArm, leftLeg, rightLeg]
        };
    },

    /**
     * Fire a projectile from one mech to another
     * @param {Matter} Matter - Matter.js library
     * @param {Object} world - Matter.js world
     * @param {Object} fromMech - Shooter mech
     * @param {Object} toMech - Target mech
     * @param {number} damage - Damage value
     * @returns {Object} Projectile body
     */
    fireProjectile(Matter, world, fromMech, toMech, damage = 10) {
        const { Bodies, Body } = Matter;

        const centerX = fromMech.torso.position.x;
        const centerY = fromMech.torso.position.y;
        const targetX = toMech.torso.position.x;
        const targetY = toMech.torso.position.y;

        // Simple direct aiming
        const angle = Math.atan2(targetY - centerY, targetX - centerX);

        // Spawn projectile outside mech body
        const startX = centerX + Math.cos(angle) * this.config.spawnOffset;
        const startY = centerY + Math.sin(angle) * this.config.spawnOffset;

        // Create projectile
        const projectile = Bodies.circle(startX, startY, 10, {
            density: 0.01,
            restitution: 0.1,
            friction: 0.05,
            frictionAir: 0.001,
            label: 'bullet',
            collisionFilter: {
                category: 0x0002, // Projectile category
                mask: 0x0001      // Only collide with mechs
            }
        });

        // Set velocity
        Body.setVelocity(projectile, {
            x: Math.cos(angle) * this.config.projectileSpeed,
            y: Math.sin(angle) * this.config.projectileSpeed
        });

        // Store metadata
        projectile.damage = damage;
        projectile.fromPlayer = fromMech.isPlayer;
        projectile.shooter = fromMech;
        projectile.targetX = targetX;
        projectile.targetY = targetY;

        return projectile;
    },

    /**
     * Setup collision detection for projectiles hitting mechs
     * @param {Matter} Matter - Matter.js library
     * @param {Object} engine - Matter.js engine
     * @param {Array} projectiles - Array of projectile bodies
     * @param {Object} playerMech - Player mech object
     * @param {Object} enemyMech - Enemy mech object
     * @param {Function} onHit - Callback when projectile hits: (target, damage, isPlayer) => {}
     */
    setupCollisionDetection(Matter, engine, projectiles, playerMech, enemyMech, onHit) {
        const { Events, World } = Matter;

        Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;

                // Find projectile
                const projectile = projectiles.find(p => p === bodyA || p === bodyB);
                if (!projectile) return;

                const other = bodyA === projectile ? bodyB : bodyA;

                // Ignore self-collision
                if (projectile.shooter) {
                    const shooterParts = projectile.shooter.parts;
                    if (shooterParts && shooterParts.includes(other)) {
                        return;
                    }
                }

                // Check if hit player or enemy
                const hitPlayer = other.label && other.label.includes('player');
                const hitEnemy = other.label && other.label.includes('enemy');

                if (hitPlayer || hitEnemy) {
                    const targetMech = hitPlayer ? playerMech : enemyMech;

                    // Callback for damage
                    if (onHit) {
                        onHit(targetMech, projectile.damage, hitPlayer);
                    }

                    // Remove projectile
                    World.remove(engine.world, projectile);
                    const index = projectiles.indexOf(projectile);
                    if (index > -1) {
                        projectiles.splice(index, 1);
                    }
                }
            });
        });
    }
};

// Export for use in both files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}
