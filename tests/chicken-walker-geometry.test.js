/**
 * Chicken Walker Leg Geometry Test
 *
 * Tests that chicken walker (digitigrade/reverse-joint) legs have correct geometry:
 * - Knee should project FORWARD of the hip (positive Z when facing +Z)
 * - Shin should angle backward, bringing the ankle roughly under the hip
 * - Creates classic "Z" or "lightning bolt" shape
 *
 * Reference: MECH_STYLE_GUIDE.md
 *
 * Hip ●━━━━━━━━━━━━━━━━
 *      \
 *       \  ← Thigh: SHORT, angled 45-50° FORWARD
 *        \
 *         ●━━━ Knee (FORWARD-pointing, most forward point)
 *        /
 *       /   ← Shin: LONG, angled 40-45° backward from vertical
 *      /
 *     ●━━━━ Ankle (roughly under hip for balance)
 *     ├───► Foot (toes forward)
 */

// Babylon.js uses a LEFT-HANDED coordinate system
// Y is up, Z is forward
// Positive rotation.x rotates the +Y axis toward -Z (in left-handed)
// For a segment pointing down (-Y), positive rotation.x moves the end toward +Z (forward)

/**
 * Calculate joint positions for a chicken walker leg
 * @param {Object} style - Leg style parameters
 * @returns {Object} - Positions of hip, knee, ankle in world coordinates
 */
function calculateLegJointPositions(style) {
    const hipPos = { x: 0, y: 0, z: 0 }; // Reference point

    // Thigh rotation (in radians)
    const thighAngleRad = style.thighAngle * Math.PI / 180;

    // In Babylon.js LEFT-HANDED system:
    // rotation.x positive -> segment end moves toward +Z (forward)
    // rotation.x negative -> segment end moves toward -Z (backward)

    // Knee position relative to hip
    // The knee is at the end of the thigh, which extends downward (-Y) and is rotated
    const kneePos = {
        x: 0,
        y: -style.thighLength * Math.cos(thighAngleRad), // Y component
        z: style.thighLength * Math.sin(thighAngleRad)   // Z component (forward/backward)
    };

    // Shin rotation is relative to thigh's orientation
    // The total shin angle from vertical = thighAngle + shinAngle (relative)
    const shinAngleFromVertical = thighAngleRad + (style.shinAngle * Math.PI / 180);

    // Ankle position relative to knee
    const ankleRelative = {
        x: 0,
        y: -style.shinLength * Math.cos(shinAngleFromVertical),
        z: style.shinLength * Math.sin(shinAngleFromVertical)
    };

    // Ankle position in world coordinates
    const anklePos = {
        x: kneePos.x + ankleRelative.x,
        y: kneePos.y + ankleRelative.y,
        z: kneePos.z + ankleRelative.z
    };

    return { hipPos, kneePos, anklePos };
}

/**
 * Test that chicken walker geometry is correct
 */
function testChickenWalkerGeometry() {
    console.log('=== Chicken Walker Leg Geometry Test ===\n');

    // OLD code values (WERE WRONG - knee was behind hip)
    const oldStyle = {
        thighLength: 0.45,  // average of 0.4-0.5
        shinLength: 0.925,  // average of 0.85-1.0
        thighAngle: -35,    // NEGATIVE - went backward (WRONG!)
        shinAngle: 70       // relative to thigh
    };

    // NEW FIXED code values (knee projects forward, correct chicken walker shape)
    const fixedStyle = {
        thighLength: 0.45,
        shinLength: 0.925,
        thighAngle: 45,     // POSITIVE - thigh goes FORWARD
        shinAngle: -67.5    // average of -75 to -60, shin angles backward from thigh
    };

    console.log('--- Testing OLD (buggy) values ---');
    console.log(`thighAngle: ${oldStyle.thighAngle}°, shinAngle: ${oldStyle.shinAngle}° (relative)`);

    const oldPos = calculateLegJointPositions(oldStyle);

    console.log(`Hip:   (${oldPos.hipPos.x.toFixed(3)}, ${oldPos.hipPos.y.toFixed(3)}, ${oldPos.hipPos.z.toFixed(3)})`);
    console.log(`Knee:  (${oldPos.kneePos.x.toFixed(3)}, ${oldPos.kneePos.y.toFixed(3)}, ${oldPos.kneePos.z.toFixed(3)})`);
    console.log(`Ankle: (${oldPos.anklePos.x.toFixed(3)}, ${oldPos.anklePos.y.toFixed(3)}, ${oldPos.anklePos.z.toFixed(3)})`);

    const oldKneeForward = oldPos.kneePos.z > 0;
    console.log(`\nKnee is ${oldKneeForward ? 'FORWARD' : 'BEHIND'} hip: z = ${oldPos.kneePos.z.toFixed(3)}`);
    console.log(`Expected: Knee should be FORWARD (z > 0)`);
    console.log(`Result: ${oldKneeForward ? 'PASS ✓' : 'FAIL ✗ - This was the bug!'}`);

    console.log('\n--- Testing NEW FIXED values ---');
    console.log(`thighAngle: ${fixedStyle.thighAngle}°, shinAngle: ${fixedStyle.shinAngle}° (relative)`);

    const fixedPos = calculateLegJointPositions(fixedStyle);

    console.log(`Hip:   (${fixedPos.hipPos.x.toFixed(3)}, ${fixedPos.hipPos.y.toFixed(3)}, ${fixedPos.hipPos.z.toFixed(3)})`);
    console.log(`Knee:  (${fixedPos.kneePos.x.toFixed(3)}, ${fixedPos.kneePos.y.toFixed(3)}, ${fixedPos.kneePos.z.toFixed(3)})`);
    console.log(`Ankle: (${fixedPos.anklePos.x.toFixed(3)}, ${fixedPos.anklePos.y.toFixed(3)}, ${fixedPos.anklePos.z.toFixed(3)})`);

    const fixedKneeForward = fixedPos.kneePos.z > 0;
    console.log(`\nKnee is ${fixedKneeForward ? 'FORWARD' : 'BEHIND'} hip: z = ${fixedPos.kneePos.z.toFixed(3)}`);
    console.log(`Expected: Knee should be FORWARD (z > 0)`);
    console.log(`Result: ${fixedKneeForward ? 'PASS ✓' : 'FAIL ✗'}`);

    // Check if ankle is roughly under the hip (for balance)
    const ankleUnderHip = Math.abs(fixedPos.anklePos.z) < 0.3; // Allow some tolerance
    console.log(`\nAnkle roughly under hip: z = ${fixedPos.anklePos.z.toFixed(3)} (|z| < 0.3?)`);
    console.log(`Result: ${ankleUnderHip ? 'PASS ✓ - Good balance' : 'Note: Ankle offset from hip'}`);

    console.log('\n=== Summary ===');
    console.log('OLD code had thighAngle NEGATIVE, which put knee BEHIND hip.');
    console.log('NEW FIXED code has thighAngle POSITIVE, which puts knee FORWARD.');
    console.log('This creates the correct chicken walker (Mad Cat) stance.');

    return {
        oldWasBuggy: !oldKneeForward,
        newIsFixed: fixedKneeForward
    };
}

// Alternative calculation: what shin angle is needed for ankle to be under hip?
function calculateRequiredShinAngle(thighAngle, thighLength, shinLength) {
    const thighAngleRad = thighAngle * Math.PI / 180;

    // Knee Z position
    const kneeZ = thighLength * Math.sin(thighAngleRad);

    // For ankle to be at Z=0 (directly under hip):
    // ankleZ = kneeZ + shinLength * sin(totalShinAngle) = 0
    // sin(totalShinAngle) = -kneeZ / shinLength
    const sinTotalShin = -kneeZ / shinLength;

    if (Math.abs(sinTotalShin) > 1) {
        console.log('Geometry impossible: shin cannot reach back to hip');
        return null;
    }

    const totalShinAngleRad = Math.asin(sinTotalShin);
    const totalShinAngleDeg = totalShinAngleRad * 180 / Math.PI;

    // Relative shin angle = total shin angle - thigh angle
    const relativeShinAngleDeg = totalShinAngleDeg - thighAngle;

    return {
        totalShinAngle: totalShinAngleDeg,
        relativeShinAngle: relativeShinAngleDeg
    };
}

console.log('\n=== Calculating Required Shin Angle for Balance ===\n');

// For thigh at 45 degrees forward
const thighAngle = 45;
const thighLength = 0.45;
const shinLength = 0.925;

const required = calculateRequiredShinAngle(thighAngle, thighLength, shinLength);
if (required) {
    console.log(`With thighAngle = ${thighAngle}°:`);
    console.log(`  To place ankle directly under hip (Z=0):`);
    console.log(`  - Total shin angle from vertical: ${required.totalShinAngle.toFixed(1)}°`);
    console.log(`  - Relative shin angle (for code): ${required.relativeShinAngle.toFixed(1)}°`);
}

// Run the test
console.log('\n');
testChickenWalkerGeometry();
