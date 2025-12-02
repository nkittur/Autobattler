# Shadow Debugging Log

## Project Overview
- **File:** `test-babylon-havok.html` - Single HTML file Babylon.js + Havok physics mech combat game
- **Branch:** `claude/mobile-lighting-shadows-01UCbsEuxCJ3x1Xe1jtoFvMe`
- **Goal:** Implement lighting, shading, and shadows while staying performant on mobile devices

---

## Timeline of Changes

### v10.4 (WORKED - baseline)
- Minimal shadow test with detailed logging
- Created isolated test case:
  - Small gray test ground (10x10) with `receiveShadows=true`
  - Red sphere above it as single shadow caster
  - DirectionalLight with position (10, 20, 10) and direction (-1, -2, -1)
  - ShadowGenerator with 1024 map size
- **Result:** SHADOWS APPEARED - User confirmed this worked

### v10.5 - Apply to full scene
- Applied the working v10.4 shadow config to full scene
- Added mech shadow casters via `configureMechShadows()`
- **Result:** SHADOWS DISAPPEARED

### v10.6 - Use exact v10.4 config
- Tried using exact v10.4 shadow configuration
- **Result:** Still no shadows

### v10.7 - Texture test
- Added test sphere + simple untextured ground alongside full scene
- Hypothesis: textured ground might be the issue
- **Result:** No shadows at all, even from test sphere on simple ground

### v10.8 - Isolate test
- Disabled `configureMechShadows()` (commented out)
- Disabled rock shadow casters in `createGround()`
- Only test sphere as shadow caster
- **Result:** Pending user test

### v10.9 - Auto frustum
- Added `sunLight.autoCalcShadowZBounds = true` (Babylon 4.1+ feature)
- Added `sunLight.shadowFrustumSize = 50`
- **Result:** Pending user test

### v10.10 - CascadedShadowGenerator (CSM)
- Replaced regular ShadowGenerator with CascadedShadowGenerator
- CSM is designed for large outdoor scenes with DirectionalLight
- Added `shadowGenerator.autoCalcDepthBounds = true`
- **Result:** Pending user test

### v10.11 - PointLight
- Switched from DirectionalLight to PointLight
- PointLight uses cube shadow maps (simpler, no frustum issues)
- Added `useBlurExponentialShadowMap = true`
- **Result:** Pending user test

### v10.12 / v10.12b - Completely minimal test
- **DISABLED ALL SCENE ELEMENTS:**
  - Commented out `createGround(scene, shadowGenerator)`
  - Commented out `createWalls(scene)`
  - Commented out all mech creation
  - No fog, no skybox, no arena
- Only have:
  - HemisphericLight (ambient)
  - DirectionalLight
  - ShadowGenerator
  - Test ground (10x10, gray, receiveShadows=true)
  - Red test sphere (shadow caster)
- Added extra debug logging (WebGL version, shadow map status, light position)
- **Result:** Pending user test

### v10.13 - PCF filtering (current)
- Same minimal setup as v10.12
- Added PCF (Percentage Closer Filtering) for better compatibility
- `shadowGenerator.usePercentageCloserFiltering = true`
- `shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_MEDIUM`
- Added `normalBias = 0.01`
- **Result:** Pending user test

---

## Key Technical Details

### Shadow Configuration (SHADOW_CONFIG)
```javascript
const SHADOW_CONFIG = {
    enabled: true,
    mapSize: 1024,
    blurKernel: 32,
    darkness: 0.35,
};
```

### Mobile Detection
```javascript
function detectMobileAndSetQuality() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    if (isMobile || isLowPower || isSmallScreen) {
        SHADOW_CONFIG.mapSize = 512;
        SHADOW_CONFIG.blurKernel = 16;
    }
}
```

### configureMechShadows function (lines 439-500)
- Uses `addIfMesh()` helper to safely add only Mesh objects (not TransformNodes)
- Adds pelvis, torso, pods, arm parts, leg parts for each mech
- Can add 120+ shadow casters from 8 mechs

---

## Errors Encountered

### 1. `getBoundingInfo is not a function`
- **Cause:** Passing TransformNodes (armGroup, legGroup) to `addShadowCaster()`
- **Fix:** Added `addIfMesh()` helper that checks `typeof obj.getBoundingInfo === 'function'`

### 2. Changes not appearing on reload
- **Cause:** Browser caching
- **Fix:** Increment version numbers in the title tag

### 3. Logs not visible
- **Cause:** Using `console.log()` instead of `log()`
- **Fix:** Use `log()` function which displays on-screen

---

## Research Findings

### From Web Search:
1. **DirectionalLight requires position** - Must set `light.position` for shadow generation
2. **iOS Safari WebGL 2.0 issue** - Shadows may fail to render on iOS Safari with WebGL 2.0
3. **autoCalcShadowZBounds** - Babylon 4.1+ feature to auto-calculate shadow frustum
4. **CascadedShadowGenerator** - Better for large outdoor scenes
5. **PCF filtering** - More widely compatible than other shadow types

### Key Babylon.js Shadow Requirements:
1. Light must have both `direction` and `position` set
2. `mesh.receiveShadows = true` on receiver meshes
3. `shadowGenerator.addShadowCaster(mesh)` for caster meshes
4. Only Point, Directional, and Spot lights can cast shadows

---

## Hypotheses

### Why v10.4 worked but later versions don't:

1. **Too many shadow casters** - Adding 120+ mech casters corrupts shadow map
   - Tested in v10.8 by disabling all extra casters
   - Result: Still didn't work

2. **Scene elements interfering** - Skybox, physics, fog, etc.
   - Tested in v10.12 by disabling entire scene
   - Result: Pending

3. **Frustum calculation issues** - Large scene throws off shadow frustum
   - Tested in v10.9 with autoCalcShadowZBounds
   - Tested in v10.10 with CSM
   - Result: Pending

4. **Light type issues** - DirectionalLight frustum complexity
   - Tested in v10.11 with PointLight
   - Result: Pending

5. **WebGL/Browser compatibility** - iOS Safari or mobile WebGL issues
   - Tested in v10.13 with PCF filtering
   - Result: Pending

---

## Next Steps

### If v10.13 works (shadows visible):
1. Re-enable `createGround()` - test if skybox/arena breaks shadows
2. Re-enable `createWalls()` - test walls
3. Re-enable mech creation (without shadow casters) - test if mechs break shadows
4. Re-enable rock shadow casters (6 rocks)
5. Re-enable mech shadow casters (start with 1 mech, then all)
6. Find the exact element that breaks shadows

### If v10.13 doesn't work:
1. Check browser console for WebGL errors
2. Try on different browser/device
3. Check if Babylon.js CDN version has issues
4. Try older Babylon.js version
5. Create standalone HTML with ONLY shadow test (no Havok physics)
6. Check if Havok initialization affects rendering

### Once shadows work:
1. Optimize shadow map size for mobile (512px)
2. Limit shadow casters to key mech parts only
3. Consider shadow distance culling
4. Test on actual mobile devices
5. Add soft shadows with blur for better visuals

---

## Git Commits Made

```
85ce2a2 v10.13: Try PCF filtering for shadows (more compatible)
8834849 v10.12b: Add extra debug logging (WebGL2, ShadowMap, light position)
2f40f94 v10.12: Completely minimal shadow test - full scene disabled
0133f71 v10.11: Try PointLight instead of DirectionalLight
82b2d97 v10.10: Try CascadedShadowGenerator (CSM) for large scene
88bd86e v10.9: Enable autoCalcShadowZBounds and shadowFrustumSize
f107473 v10.8: Isolate test - disable mech and rock shadow casters
```

---

## Key Code Locations

- **Version tag:** Line 158
- **SHADOW_CONFIG:** Lines 400-405
- **detectMobileAndSetQuality:** Lines 407-425
- **configureMechShadows:** Lines 439-500
- **Lighting + Shadows section:** Lines 674-730
- **createGround:** Lines 765+
- **createWalls:** After createGround

---

## Current State (v10.13)

The current version is a completely minimal shadow test:
- NO fog
- NO skybox
- NO arena ground with physics
- NO horizon ground
- NO mountains
- NO walls
- NO rocks
- NO mechs

Only:
- HemisphericLight (intensity 0.4)
- DirectionalLight (position 10,20,10, direction -1,-2,-1, intensity 1.5)
- ShadowGenerator (1024, PCF filtering, bias 0.001, normalBias 0.01)
- Test ground (10x10, gray, receiveShadows=true)
- Red test sphere (diameter 2, y=4, shadow caster)

Expected result: Red sphere with visible shadow on gray ground.
