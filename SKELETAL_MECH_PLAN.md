# Skeletal Mech Implementation Plan

## Architecture

```
Skeleton "mechSkeleton"
├── root (at 0,0,0)
    └── torso (at spawn position)
        ├── head
        ├── leftShoulder → leftArm → leftForearm
        ├── rightShoulder → rightArm → rightForearm
        ├── leftHip → leftUpperLeg → leftLowerLeg
        └── rightHip → rightUpperLeg → rightLowerLeg
```

## Key Differences from Manual Approach

| Manual Approach | Skeletal Approach |
|----------------|-------------------|
| Position bodies in world space | Position bones relative to parent |
| Calculate pivot points manually | Bones automatically connect at endpoints |
| Create constraints manually | Ragdoll creates them automatically |
| Parent visual meshes manually | Mesh skinned/linked to bone |
| Error-prone alignment | Built-in parent-child transforms |

## Bone Configuration

Each bone needs:
- **Name**: "torso", "leftArm", etc.
- **Parent bone**: Which bone it's attached to
- **Local position**: Relative to parent (not world space!)
- **Local rotation**: Initial orientation
- **Length**: Bone extends along Y axis typically

## Ragdoll Config (Similar to Walking Example)

```javascript
const config = [
    // Torso - main body
    {
        bones: ["torso"],
        size: 0.75,  // Half-height of torso box
        mass: 80,
        boxOffset: 0 // Center of mass
    },

    // Arms (upper arms from shoulder)
    {
        bones: ["leftArm", "rightArm"],
        size: 0.3,   // Half-length of upper arm
        width: 0.25,
        depth: 0.25,
        mass: 4,
        boxOffset: 0.15,  // Joint at shoulder
        boneOffsetAxis: BABYLON.Axis.Y,
        rotationAxis: BABYLON.Axis.Y,
        // No min/max = free rotation like example
    },

    // Forearms (from elbow)
    {
        bones: ["leftForearm", "rightForearm"],
        size: 0.4,
        width: 0.2,
        depth: 0.2,
        mass: 2,
        boxOffset: 0.2,
        boneOffsetAxis: BABYLON.Axis.Y,
        rotationAxis: BABYLON.Axis.Y,
        min: -1,  // Elbow bends one way
        max: 1
    },

    // Legs (upper legs from hip)
    {
        bones: ["leftUpperLeg", "rightUpperLeg"],
        size: 0.35,
        width: 0.3,
        depth: 0.3,
        mass: 6,
        boxOffset: 0.175,
        boneOffsetAxis: BABYLON.Axis.Y,
        rotationAxis: BABYLON.Axis.Y,
        min: -1,
        max: 1
    },

    // Lower legs (from knee)
    {
        bones: ["leftLowerLeg", "rightLowerLeg"],
        size: 0.35,
        width: 0.25,
        depth: 0.25,
        mass: 4,
        boxOffset: 0.175,
        boneOffsetAxis: BABYLON.Axis.Y,
        rotationAxis: BABYLON.Axis.Y,
        min: -1,
        max: 1
    }
];
```

## How It Works

### 1. Bone Creation
```javascript
const skeleton = new BABYLON.Skeleton("mechSkeleton", "mech", scene);

// Root bone at world position
const rootBone = new BABYLON.Bone("root", skeleton);
rootBone.setPosition(new BABYLON.Vector3(xPos, 0, 0));

// Torso bone relative to root
const torsoBone = new BABYLON.Bone("torso", skeleton, rootBone);
torsoBone.setPosition(new BABYLON.Vector3(0, spawnY, 0)); // Relative to root

// Arm bone relative to torso
const leftArmBone = new BABYLON.Bone("leftArm", skeleton, torsoBone);
leftArmBone.setPosition(new BABYLON.Vector3(-0.9, 0.65, 0)); // Relative to torso!
```

### 2. Visual Meshes

Either:
**Option A - Skinning** (complex but proper):
- Create mesh vertices
- Assign bone weights
- Mesh deforms with bones

**Option B - Simple Parenting** (easier):
- Create mesh
- Link to specific bone
- Mesh follows bone transform

### 3. Ragdoll Creation
```javascript
const ragdoll = new BABYLON.Ragdoll(skeleton, mechRoot, config);
```

Ragdoll internally:
- Creates physics body for each bone in config
- Positions body at bone's world position
- Creates constraints between parent/child bones
- Pivot points are automatic (at bone connection)
- Applies limits from config

### 4. Motors/Animation

**Before ragdoll activated:**
- Bones driven by animation or manual rotation
- Physics bodies follow bones
- Mechs stand naturally

**After ragdoll activated:**
- Physics drives bones
- Constraints keep limbs attached
- Can apply forces/motors through physics

## Why This Will Work

1. **Proven system**: Uses same Ragdoll class as walking example
2. **Automatic pivots**: Bones connect at endpoints automatically
3. **Transform hierarchy**: Parent-child math handled by engine
4. **Config-driven**: Just specify sizes/limits, not positions
5. **No manual constraint setup**: Ragdoll does it all

## Implementation Steps

1. Create skeleton with bones hierarchy
2. Create visual meshes (boxes) linked to bones
3. Create Ragdoll with config
4. Test - bones should stay attached
5. Add motors for active pose control
6. Add visual details (weapons, armor)

This is the "proper" way to do articulated ragdolls in Babylon.
