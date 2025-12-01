# Mech Rotation Debug Log

This document tracks the debugging and fixes applied to mech torso and leg rotation in `test-babylon-havok.html`.

## Problem Summary

The mechs' torsos and legs were not rotating correctly to face their targets/movement direction. Multiple issues were identified and fixed.

---

## Issue 1: Torso Not Rotating At All (Initial State)

### Symptoms
- AI autobattle showed no visible torso rotation
- Debug logs showed very small rotation values (~0.2°)

### Root Cause
The mechs were positioned directly along the X axis with almost no Z offset, so the calculated angle to enemy was ~0° - there was nothing to rotate to.

### Fix Applied
Added comprehensive diagnostic logging to `updateTorsoTrack()` function:
- Logs when mech/torso/pelvis is null
- Logs when target is invalid or has 0 HP
- Logs angle calculations (dx, dz, angleToEnemy)
- Logs rotation values (baseAngle, rawAngle, target, actual)

### Commit
`3094a59` - Add diagnostic logging to updateTorsoTrack for AI torso rotation debugging

---

## Issue 2: Torso 90° Offset (Mechs Facing Same Direction)

### Symptoms
- Both mechs appeared to face the same direction instead of facing each other
- Rotation was off by 90 degrees

### Root Cause
The mech mesh has its **front (chest) at +Z** and **back (reactor) at -Z**, meaning the visual forward direction is +Z.

The original code assumed mechs faced along the X axis:
```javascript
const baseAngle = mech.isPlayer ? 0 : Math.PI;  // WRONG
```

### Fix Applied
Changed baseAngle to account for +Z facing:
```javascript
const baseAngle = Math.PI / 2;  // 90° offset for +Z facing mesh
```

### Commit
`91b310d` - Fix torso rotation 90° offset - mech mesh faces +Z not +X

---

## Issue 3: Torso Rotating Wrong Direction

### Symptoms
- Torso was rotating, but in the opposite direction from the target
- When target moved right, torso turned left

### Root Cause
Babylon.js uses a **LEFT-HANDED coordinate system**. Positive Y rotation is **CLOCKWISE** when viewed from above:
- `rotation.y = 0` → faces +Z
- `rotation.y = +π/2` → faces +X (clockwise from +Z)
- `rotation.y = -π/2` → faces -X (counter-clockwise from +Z)

The formula was backwards:
```javascript
let torsoAngle = angleToEnemy - baseAngle;  // WRONG - gives inverted rotation
```

### Fix Applied
Swapped the subtraction order:
```javascript
let torsoAngle = baseAngle - angleToEnemy;  // CORRECT - matches left-handed coords
```

### Verification
For player mech (enemy at +X, angleToEnemy = 0):
- `torsoAngle = π/2 - 0 = +π/2` → faces +X ✓

For enemy mech (player at -X, angleToEnemy = π):
- `torsoAngle = π/2 - π = -π/2` → faces -X ✓

---

## Issue 4: Legs/Feet 90° Off From Movement Direction

### Symptoms
- Legs oriented perpendicular to movement direction
- Same 90° offset issue as the original torso problem

### Root Cause
The leg rotation code used the same incorrect formula:
```javascript
let legAngle = moveAngle - baseAngle;  // WRONG
```

### Fix Applied
Applied the same fix as torso:
```javascript
let legAngle = baseAngle - moveAngle;  // CORRECT
```

Added diagnostic logging for leg rotation:
```javascript
dbg(`${name}: legs moveAngle=${...}° legAngle=${...}° footRot=${...}°`, 'torso');
```

---

## Key Learnings

### Babylon.js Coordinate System
- **Left-handed**: +X right, +Y up, +Z forward (into screen)
- **Rotation.y**: Positive = clockwise from above
- **atan2(z, x)**: Returns angle where 0 = +X direction, π/2 = +Z direction

### Mech Mesh Orientation
- Front (chest) faces +Z
- Back (reactor) faces -Z
- To rotate mesh to face world angle θ: `rotation.y = π/2 - θ`

### Debug Logging
Added `'torso'` category with magenta color (`#ff88ff`) for torso/leg rotation logs.

---

## Issue 5: Front of Mech Not Obvious

### Symptoms
- Hard to tell which way mechs were facing visually
- Original torso design was too symmetrical

### Fix Applied
Added distinctive conical front sections to both mechs:

**Mad Cat (Player)**:
- Conical "bird beak" nose cone (8-sided cylinder)
- Twin glowing laser ports (cyan)
- Angled side chest plates
- Giant LRM-20 style shoulder missile racks (5x4 = 20 tubes each)
- Visible missile tips in tubes
- Warning stripes on missile pods

**Dire Wolf (Enemy)**:
- Angular "fortress" style nose cone (6-sided for aggressive look)
- Quad laser barrel array (red/orange glow)
- Angled chest plates with armor detail

Now mechs have obviously distinctive fronts making facing direction clear.

---

## Issue 6: Feet Not Balanced (Mechs Fall Over)

### Symptoms
- Mechs would fall forward because feet only extended forward
- Timber Wolf would tip over and not recover

### Root Cause
Original foot design had claws only extending forward with a small heel spur. This didn't provide enough rear support when the mech leaned back or got hit.

### Fix Applied
Redesigned both mech feet with Mad Cat-style balanced forward/backward extension:

**Mad Cat / Timber Wolf**:
- 3 forward claws (center longest, left/right angled outward)
- 2 rear claws (left/right angled outward)
- Center rear spur for extra stability
- Main foot body centered under ankle (was previously offset forward)
- Total footprint now extends equally forward and backward

**Dire Wolf**:
- Same balanced design but scaled up for heavier mech
- 3 forward claws with tips
- 2 rear claws with tips
- Center rear spur
- Larger overall footprint for stability

---

## Issue 7: Get-Up Recovery System Not Working

### Symptoms
- Mech would fall down and stay down
- Recovery system wasn't lifting mech back up
- Force reset at 3 seconds wasn't effective

### Root Cause
1. Detection threshold too high (80°) - mech could be lying flat without triggering
2. Recovery forces too weak (200) to right a fallen mech
3. Upward lift force (80) insufficient
4. Force reset only set quaternion but didn't reposition the physics body

### Fix Applied
Completely rewrote the recovery system with phased approach:

**Detection** (improved):
- Lower threshold: 70° tilt OR (45° tilt AND pelvis below 1.5 height)
- Catches mechs lying on their side, not just inverted

**Phase 1 (0-0.5s)**: Stop all motion
- Zero out linear and angular velocity
- Prepare for lift

**Phase 2 (0.5-1.5s)**: Active recovery
- Strong uprighting torque (400 strength, was 200)
- Progressive lift force based on height difference
- Dampen horizontal velocity during lift

**Phase 3 (1.5-2.5s)**: Gentle correction
- Milder uprighting force
- Let physics settle

**Force Reset (2.5s)**: Teleport if still stuck
- Stop all motion
- Set pelvis to standing height (Y=4.0)
- Reset rotation to upright (preserving facing direction)

Added `fallCount` tracking to monitor how often mechs fall.

---

## Issue 8: Whole Body Should Rotate Toward Target

### Symptoms
- Only torso twisted to face enemy
- Mech body stayed fixed in one direction
- Legs walked sideways instead of toward target

### Root Cause
AI only applied linear forces for movement. No angular forces were applied to rotate the physics body.

### Fix Applied
Added full body rotation in `updateAI()` after movement force application:

```javascript
// Calculate angle to target
const dx = targetPos.x - myPos.x;
const dz = targetPos.z - myPos.z;
const angleToTarget = Math.atan2(dz, dx);

// Convert to body rotation (mesh faces +Z)
const baseAngle = Math.PI / 2;
const desiredYaw = baseAngle - angleToTarget;

// Calculate rotation error (normalize to [-PI, PI])
let yawError = desiredYaw - currentYaw;
while (yawError > Math.PI) yawError -= 2 * Math.PI;
while (yawError < -Math.PI) yawError += 2 * Math.PI;

// Apply angular impulse to rotate body
if (Math.abs(yawError) > 0.17) {  // > 10 degrees
    const desiredAngVel = Math.sign(yawError) * Math.min(Math.abs(yawError) * 2, 1.5);
    const yawCorrection = (desiredAngVel - angVel.y) * 25 * dt;
    body.applyAngularImpulse(new BABYLON.Vector3(0, yawCorrection, 0));
}
```

Now mechs:
- Rotate their entire body to face the target
- Walk forward toward enemy instead of strafing sideways
- Torso provides fine-tuning aim on top of body rotation

---

## Files Modified
- `test-babylon-havok.html` - Main physics test file
- `ROTATION_DEBUG_LOG.md` - This file

## Related Commits
1. `3094a59` - Add diagnostic logging to updateTorsoTrack
2. `91b310d` - Fix torso rotation 90° offset
3. `d943d7a` - Improve mech stability with chicken-walker legs
4. `7fc4385` - Fix rotation direction (left-handed coordinate fix)
5. `c3ee797` - Enhance torsos with conical fronts and giant missile racks
6. (pending) - Balanced feet design with forward/backward claws
7. (pending) - Improved phased recovery system with teleport fallback
8. (pending) - Full body rotation toward target
