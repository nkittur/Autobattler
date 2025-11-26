# Deep Analysis of Ragdoll Configuration

Looking at the ragdoll config more carefully, I notice some critical patterns:

## Arms Configuration - NO LIMITS!

```javascript
{
    bones: ["mixamorig:LeftArm", "mixamorig:RightArm"],
    depth: 0.1,
    size: 0.1,
    width: 0.2,
    rotationAxis: BABYLON.Axis.Y,
    //min: -1,    // COMMENTED OUT
    //max: 1,     // COMMENTED OUT
    boxOffset: 0.10,
    boneOffsetAxis: BABYLON.Axis.Y
}
```

**The arms have NO min/max limits!** They can rotate freely.

## ForeArms Configuration - HAS LIMITS

```javascript
{
    bones: ["mixamorig:LeftForeArm", "mixamorig:RightForeArm"],
    rotationAxis: BABYLON.Axis.Y,
    min: -1,   // HAS LIMITS
    max: 1,
    boxOffset: 0.12,
    boneOffsetAxis: BABYLON.Axis.Y
}
```

Forearms (elbows) have limits because elbows can only bend one direction.

## Key Insight: rotationAxis Might Define Constraint Type

`rotationAxis: BABYLON.Axis.Y` might mean:
- The joint primarily rotates around Y axis
- This could create a HINGE constraint on that axis
- Other axes might be locked or have different behavior

## Box Positioning - The boxOffset Mystery

```javascript
boxOffset: 0.2,
boneOffsetAxis: BABYLON.Axis.Y
```

This positions the physics box ALONG the bone direction by 0.2 units.

In a skeletal system:
- Bone has start point and end point
- boxOffset moves the physics box along the bone's vector
- This ensures the joint is at the bone connection point

## What We Might Be Missing

1. **Constraint might need to be at BONE ENDPOINTS, not bone centers**
2. **The ragdoll system might use bone matrices to auto-calculate pivots**
3. **rotationAxis might create different constraint types per axis**
4. **We might need HINGE constraints for some joints, not 6DOF**

## Critical Question: Are we using the right constraint type?

Maybe we should try:
- HINGE constraint for simple joints (elbow, knee)
- BALL_AND_SOCKET for complex joints (shoulder, hip)
- Not 6DOF everywhere

Or if using 6DOF:
- Lock 2 angular axes completely
- Only allow rotation on primary axis
- This effectively makes it a hinge
