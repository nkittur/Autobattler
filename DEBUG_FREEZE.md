# Debug Investigation

## Current Issue (v10.2)
Canvas is blank after Havok initialized. No mechs render.

## Problem History
1. v9.5-9.7: Freeze bug when weapons fired (fixed with defensive checks)
2. v10.1: Working - mass-based wall avoidance, cinematic camera added
3. v10.2: **BROKEN** - Canvas blank after leg geometry changes

## Changes Since Last Working Version (8cea02d)

### Commit f0281e4: Fix mech leg geometry to proper digitigrade 'lightning bolt' shape
- Changed ALL 5 mech leg geometries (Mad Cat, Dire Wolf, Commando, Catapult, Hatchetman)
- Key changes:
  - upperLeg.rotation.x: 0.5 → 0.85 (steeper forward angle)
  - lowerLeg.rotation.x: -0.65 → -0.75 (steeper backward angle)
  - Added calfBulge mesh to all legs
  - Changed dimensions and positions of all leg components
  - Hip positions changed (removed Z offset of -0.1)

### Commit 2cce482: Fix walking animation
- Updated animateLeg() base values: 0.5 → 0.85, -0.65 → -0.75
- Updated dampLegs() target values to match

### Commit 6e5c689: Improve cinematic camera
- Added helper functions: getBattleCenter(), getClosestEnemyPair()
- Replaced camera modes with new ones
- Added const declarations in switch cases (problematic!)

### Commit ace02b0: Fix switch case block scope
- Added {} braces around switch cases with const declarations
- **This should have fixed the syntax error but didn't**

## Potential Causes

### 1. Leg Hierarchy Issues
The leg changes modified parent-child relationships. Check if:
- upperLeg is properly parented to legGroup
- knee is properly parented to upperLeg
- lowerLeg is properly parented to knee
- ankle is properly parented to lowerLeg

### 2. Walking Animation Accessing Wrong Properties
The animateLeg function expects:
- leg.upperLeg.rotation.x
- leg.lowerLeg.rotation.x
- leg.foot.rotation.x

If any mech's createLeg doesn't return these properly, animation will fail.

### 3. Physics Body Positioning
Changed hip positions could put physics bodies in invalid states.
Old: hip.position.z = -0.1
New: hip.position.z = 0

### 4. Cinematic Camera Null References
Even with block scope fix, could still have issues:
- state.target could be undefined before battle starts
- state.target.ai.target could throw if ai doesn't exist

## Investigation Steps

### Step 1: Check if legs are the problem
Try reverting just the leg changes to see if that fixes rendering.

### Step 2: Check console for actual error
The blank canvas with "Havok initialized" suggests error happens during scene creation.

### Step 3: Test each mech type individually
Comment out all but one mech to isolate which mech creation is failing.

### Step 4: Check leg return values
Ensure all 5 createLeg functions return:
{ hip, upperLeg, knee, lowerLeg, ankle, foot, legGroup, footGroup }

## Quick Fix Attempts

### Attempt 1: Revert to last working commit
```bash
git checkout 8cea02d -- test-babylon-havok.html
```

### Attempt 2: Just revert leg geometry (keep camera fixes)
Manually restore old leg geometry while keeping other changes.
