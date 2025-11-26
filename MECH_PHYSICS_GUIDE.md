# Mech Physics Design Guide - Motor-Controlled Ragdoll

This guide documents the proper way to implement motor-controlled ragdoll physics in Babylon.js with Havok, based on working examples.

## Core Principles

### 1. Work WITH Physics, Not Against It
- Use motor constraints to actively hold pose (not external forces)
- Motors provide torque to maintain target angles
- When hit, motors allow movement then return to target
- Disable motors for true ragdoll behavior on death

### 2. Rigid Body Structure
Each limb should be:
- **Independent physics body** with its own mass and inertia
- **Connected via 6DOF constraint** to parent body
- **Position in world space** (not parented in scene graph for physics bodies)
- **Visual children parented** to physics body for weapons, armor, etc.

### 3. Constraint Setup

#### Pivot Points (CRITICAL)
- **pivotA**: Offset from parent body's center (in parent's local space)
- **pivotB**: Offset from child body's center (in child's local space)
- Must align exactly in world space when limb is at neutral position
- Example: If shoulder is 0.9m from torso center, and arm center is 0.3m from its top:
  - pivotA = (0.9, 0.65, 0) in torso space
  - pivotB = (0, 0.3, 0) in arm space

#### Axes (For Orientation)
- axisA and axisB define the "up" direction for each body at the joint
- Usually (0, 1, 0) for both unless limb has specific rotation

#### Collision
- Set `collision: false` in constraint options to prevent connected bodies from colliding
- Use collision filtering for groups (mechs, projectiles, ground)

### 4. Motor Configuration

Motors work on **angular axes only** (not linear):
- **ANGULAR_X**: Rotation around X axis (pitch - forward/backward tilt)
- **ANGULAR_Y**: Rotation around Y axis (yaw - left/right turn)
- **ANGULAR_Z**: Rotation around Z axis (roll - side tilt)

For each axis you want to control:
```javascript
constraint.setMotorEnabled(BABYLON.PhysicsConstraintAxis.ANGULAR_X, true);
constraint.setMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, targetAngle);
constraint.setMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, maxForce);
```

**Motor Target**: Angle in radians (0 = neutral, π/2 = 90°, etc.)
**Motor Max Force**: Torque strength (higher = stronger hold)
- Arms: 50-100 for moderate hold
- Legs: 100-200 for weight support

### 5. Mass Distribution

Total mech mass budget (~100kg):
- **Torso**: 80kg (largest, main body)
- **Arms**: 3-5kg each (lighter, more reactive)
- **Legs**: 5-8kg each (heavier for stability)
- **Head**: Visual only (parented to torso)

### 6. Damping

Critical for stability:
- **Linear damping**: 0.2-0.4 (reduces sliding)
- **Angular damping**: 0.4-0.6 (reduces spinning)
- Higher damping = more stable but less dynamic

### 7. Position Calculation

When spawning limbs:
```javascript
// WRONG: Relative position with parenting
upperArm.parent = torso;
upperArm.position = new BABYLON.Vector3(xOffset, 0.35, 0);

// CORRECT: World position, no parenting
upperArm.position = new BABYLON.Vector3(
    torsoWorldX + xOffset,  // Offset from torso world position
    torsoWorldY + yOffset,
    torsoWorldZ + zOffset
);
```

## Common Mistakes

### ❌ MISTAKE 1: Parenting Physics Bodies
```javascript
// WRONG - creates scene graph hierarchy but breaks physics
upperArm.parent = torso;
```
**Why it fails**: Babylon's parent system moves children in the render loop, fighting against physics constraints.

**Fix**: Position limbs in world space, use constraints only for physics connection.

### ❌ MISTAKE 2: Misaligned Pivot Points
```javascript
// WRONG - pivots don't align
pivotA: new BABYLON.Vector3(0.9, 0.65, 0),  // Shoulder in torso space
pivotB: new BABYLON.Vector3(0, 0.5, 0),     // Wrong offset in arm space
```
**Why it fails**: Constraint tries to force misaligned points together, causing instability or separation.

**Fix**: Calculate pivotB based on limb dimensions. If arm is 0.6m tall, center is 0.3m from top.

### ❌ MISTAKE 3: Using External Forces for Pose
```javascript
// WRONG - fighting physics with constant forces
legAggregate.body.applyForce(standingForce, legPosition);
```
**Why it fails**: Constant force application fights the physics solver, causes instability.

**Fix**: Use motor constraints with target angles.

### ❌ MISTAKE 4: Wrong Constraint Type
```javascript
// WRONG - ball-and-socket can't use motors
new BABYLON.PhysicsConstraint(
    BABYLON.PhysicsConstraintType.BALL_AND_SOCKET,
    options
);
```
**Why it fails**: Only 6DOF constraints support motors.

**Fix**: Always use SIX_DOF for motor-controlled joints.

### ❌ MISTAKE 5: Incorrect API Usage
```javascript
// WRONG - old API or wrong parameter order
new BABYLON.PhysicsConstraint(type, options, scene, body); // scene is 3rd param

// WRONG - collision as array
options: { collision: [{ key: 'collision', value: false }] }
```
**Fix**:
```javascript
new BABYLON.PhysicsConstraint(type, options, scene);
options: { collision: false }
```

## Working Implementation Pattern

```javascript
// 1. Create physics body in world space
const upperArm = BABYLON.MeshBuilder.CreateBox('arm', {
    width: 0.25, height: 0.6, depth: 0.25
}, scene);
upperArm.position = new BABYLON.Vector3(
    torsoWorldX + shoulderOffsetX,
    torsoWorldY + shoulderOffsetY,
    0
);

// 2. Add physics aggregate
const armAggregate = new BABYLON.PhysicsAggregate(
    upperArm,
    BABYLON.PhysicsShapeType.BOX,
    { mass: 3, friction: 0.3, restitution: 0.1 },
    scene
);

// 3. Set collision group
armAggregate.shape.filterMembershipMask = 1;      // Group 1 = mechs
armAggregate.shape.filterCollideMask = 1 | 2 | 4; // Collide with mechs, projectiles, ground

// 4. Add damping
armAggregate.body.setLinearDamping(0.3);
armAggregate.body.setAngularDamping(0.5);

// 5. Create 6DOF constraint
const constraint = new BABYLON.PhysicsConstraint(
    BABYLON.PhysicsConstraintType.SIX_DOF,
    {
        pivotA: new BABYLON.Vector3(shoulderOffsetX, shoulderOffsetY, 0), // In torso space
        pivotB: new BABYLON.Vector3(0, armHeight / 2, 0),                 // In arm space (center to top)
        collision: false,
        axisA: new BABYLON.Vector3(0, 1, 0),
        axisB: new BABYLON.Vector3(0, 1, 0)
    },
    scene
);

// 6. Add constraint to parent body
torsoAggregate.body.addConstraint(armAggregate.body, constraint);

// 7. Configure motors for desired pose
constraint.setMotorEnabled(BABYLON.PhysicsConstraintAxis.ANGULAR_X, true);
constraint.setMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, Math.PI / 3); // Raise forward
constraint.setMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_X, 80);

constraint.setMotorEnabled(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, true);
constraint.setMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 0);
constraint.setMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 80);

constraint.setMotorEnabled(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, true);
constraint.setMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, sideOffset); // Slight outward
constraint.setMotorMaxForce(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, 80);

// 8. Parent visual children (weapons, etc) to physics body
weapon.parent = upperArm; // Visual parenting is fine
```

## Debugging Checklist

When limbs fall off or don't move:

1. **Check pivot alignment**:
   - Add debug spheres at pivot points
   - Verify they overlap in world space

2. **Check constraint creation**:
   - Look for errors in console
   - Verify constraint was successfully added

3. **Check collision filtering**:
   - Ensure connected bodies have `collision: false` in constraint
   - Verify collision groups are set

4. **Check motor configuration**:
   - Verify motors are enabled
   - Check target angles are reasonable (not NaN or Infinity)
   - Ensure max force is sufficient but not excessive

5. **Check body positions**:
   - Log world positions on creation
   - Verify bodies are created at expected locations
   - Check for NaN positions

6. **Check scene parenting**:
   - Physics bodies should NOT be parented to each other
   - Only visual elements should be parented to physics bodies

## Example: Firing Stance Motors

For arms raised to firing position:
```javascript
// Forward raise (60° pitch)
constraint.setMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_X, Math.PI / 3);

// No yaw
constraint.setMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Y, 0);

// Slight outward roll (±30°)
constraint.setMotorTarget(BABYLON.PhysicsConstraintAxis.ANGULAR_Z, side === 'left' ? -Math.PI/6 : Math.PI/6);
```

## Impact Response

Motors allow natural impact response:
1. Projectile hits limb
2. Apply impulse to limb physics body
3. Limb moves/rotates from impact
4. Motor torque pulls limb back to target angle
5. Limb settles at target position

This creates realistic "flinch and recover" behavior.
