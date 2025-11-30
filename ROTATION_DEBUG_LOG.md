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

## Files Modified
- `test-babylon-havok.html` - Main physics test file

## Related Commits
1. `3094a59` - Add diagnostic logging to updateTorsoTrack
2. `91b310d` - Fix torso rotation 90° offset
3. `d943d7a` - Improve mech stability with chicken-walker legs
4. Current - Fix rotation direction (left-handed coordinate fix)
