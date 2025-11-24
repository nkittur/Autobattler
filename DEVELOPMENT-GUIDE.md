# Mech Autobattler - Development Guide

## 📋 Overview

This document captures all patterns, best practices, and approaches established during development of the Mech Autobattler physics-based combat system.

**CRITICAL:** Always follow these patterns. Don't redo things differently.

---

## 🏗️ Architecture

### File Structure

```
Autobattler/
├── index.html              # Main game (full UI, loadout, inventory)
├── physics-test.html       # Physics sandbox (testing/debugging)
├── physics-engine.js       # SHARED physics module (single source of truth)
└── DEVELOPMENT-GUIDE.md    # This file
```

### Shared Physics Engine Pattern

**RULE:** All physics logic lives in `physics-engine.js`

```javascript
// physics-engine.js exports:
PhysicsEngine = {
    createMech()           // Create articulated mechs
    fireProjectile()       // Spawn projectiles with velocity
    setupCollisionDetection()  // Hit detection callbacks
    config                 // Shared configuration
    colors                 // Shared color scheme
}
```

**Usage Pattern:**
1. Test features in `physics-test.html` (faster iteration)
2. If it works, it's already in `physics-engine.js`
3. Main game automatically inherits the fix/feature

**NEVER** duplicate physics code between files!

---

## 🔢 Version Numbering

### Rules

1. **ALWAYS increment version** for every change
2. **Update in ALL places:**
   - `<title>` tag
   - Version badge in UI
   - Commit message
3. **Numbering scheme:**
   - Major feature: `v1.20.0 → v1.21.0`
   - Bug fix: `v1.19.5 → v1.19.6`
   - Minor tweak: `v1.19.6 → v1.19.7`

### Version Checklist

- [ ] Update `<title>` tag
- [ ] Update version badge text
- [ ] Match commit message to version
- [ ] Push to branch: `claude/combat-simulation-physics-[SESSION_ID]`

---

## 🐛 Debug Panel Pattern

### For physics-test.html

**Collapsible panel at bottom (closed by default):**

```html
<button id="toggle-debug-log">🐛 DEBUG LOG (Click to Open)</button>
<div id="status-log" style="display: none;">
    <div id="status-messages"></div>
</div>
```

```javascript
document.getElementById('toggle-debug-log').addEventListener('click', function() {
    const panel = document.getElementById('status-log');
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    this.textContent = isVisible
        ? '🐛 DEBUG LOG (Click to Open)'
        : '🐛 DEBUG LOG (Click to Close)';
});
```

### For index.html (main game)

**Popup modal (hidden by default):**

```html
<button id="toggle-debug">🐛 Debug</button>

<div id="debug-panel" style="display:none; position:fixed; ...">
    <button id="close-debug">✕ Close</button>
    <div id="status-messages"></div>
    <div id="realtime-status"></div>
</div>
```

**Features:**
- Real-time status updates (10x/sec)
- Shows mech positions, projectile counts
- Close with button or toggle button

---

## 📝 Status Logging Pattern

### Visible Status Log (for iPhone/debugging)

```javascript
function statusLog(message, type = 'info') {
    const statusMessages = document.getElementById('status-messages');
    if (!statusMessages) return;

    const timestamp = new Date().toLocaleTimeString();
    const colors = {
        'info': '#0f0',
        'success': '#0ff',
        'warning': '#ff0',
        'error': '#f00'
    };
    const icons = {
        'info': '•',
        'success': '✓',
        'warning': '⚠',
        'error': '✗'
    };

    const entry = document.createElement('div');
    entry.style.color = colors[type];
    entry.style.marginBottom = '5px';
    entry.textContent = `[${timestamp}] ${icons[type]} ${message}`;
    statusMessages.appendChild(entry);

    // Auto-scroll to bottom
    statusMessages.parentElement.scrollTop = statusMessages.parentElement.scrollHeight;

    console.log(`[STATUS] ${message}`);
}
```

**Usage:**
```javascript
statusLog('Creating player mech...', 'info');
statusLog('Player mech created!', 'success');
statusLog('Physics failed to load', 'error');
```

---

## 🎮 Physics Implementation

### Creating Mechs

**ALWAYS use shared module:**

```javascript
// ✓ CORRECT
const mechData = PhysicsEngine.createMech(Matter, x, y, isPlayer, 'Medium');

// Add to world
const Composite = Matter.Composite;
const mech = Composite.create();
Composite.add(mech, [...mechData.parts, ...mechData.constraints]);
Matter.World.add(world, mech);

// ✗ WRONG - Don't duplicate mech creation code!
```

### Firing Projectiles

**CRITICAL:** Must add projectile to world after creation!

```javascript
// Create projectile
const projectile = PhysicsEngine.fireProjectile(Matter, world, fromMech, toMech, damage);

// ⚠️ CRITICAL: Add to physics world so it moves!
Matter.World.add(world, projectile);

// Add to tracking array
projectiles.push(projectile);
```

**Common Bug:** Forgetting `World.add()` → projectiles don't move

### Collision Detection

```javascript
PhysicsEngine.setupCollisionDetection(
    Matter,
    engine,
    projectiles,
    playerMech,
    enemyMech,
    (targetMech, damage, isPlayer) => {
        // Handle damage here
        targetMech.currentHP -= damage;
    }
);
```

---

## 🚨 Error Handling

### Visible Error Display

**For users who can't access console (iPhone):**

```javascript
try {
    // Your code
} catch (error) {
    // Show on page
    const errorDiv = document.getElementById('error-display');
    if (errorDiv) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ ERROR: ' + error.message;
    }

    // Also log to console
    console.error('Error:', error);

    // Update status log
    statusLog(`ERROR: ${error.message}`, 'error');
}
```

### Main Loop Error Catching

```javascript
function mainLoop() {
    try {
        // Game logic
        updatePhysics();
        render();
        requestAnimationFrame(mainLoop);
    } catch (error) {
        // Display error visibly
        ctx.fillStyle = '#f00';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('ERROR IN MAINLOOP:', 50, 250);
        ctx.fillText(error.message, 50, 280);

        statusLog(`MAINLOOP ERROR: ${error.message}`, 'error');
        console.error('MainLoop error:', error);
    }
}
```

---

## 🎨 UI Patterns

### Control Buttons

```html
<button id="toggle-physics" class="active">🎮 Physics View</button>
<button id="speed-1x" class="active">1x Speed</button>
<button id="toggle-debug">🐛 Debug</button>
```

**Active State:**
```javascript
button.addEventListener('click', function() {
    this.classList.toggle('active');
});
```

### Version Badge

**Always visible, no JavaScript needed:**

```html
<div style="position: absolute; top: 10px; left: 10px;
            background: #0f0; color: #000; padding: 10px;
            font-weight: bold; z-index: 9999;">
    ✓ v1.19.6 - Feature Name
</div>
```

---

## 🔧 Common Issues & Solutions

### Issue: Mechs Don't Appear

**Diagnosis:**
1. Check status log for initialization errors
2. Check if `createMech()` was called
3. Check if mechs added to world
4. Check collision filters (category/mask)

**Solution:**
```javascript
// Add comprehensive logging
statusLog('Creating mech...', 'info');
const mech = PhysicsEngine.createMech(...);
statusLog('Mech created!', 'success');
```

### Issue: Projectiles Don't Move

**Cause:** Not added to physics world

**Solution:**
```javascript
const projectile = PhysicsEngine.fireProjectile(...);
Matter.World.add(world, projectile);  // ← Don't forget!
```

### Issue: Variables Undefined

**Common variables that must be defined:**
- `speed` (projectile velocity)
- `shooterData` (targeting tracking)
- `Matter` (Matter.js library)

**Solution:**
```javascript
// At top of fireProjectile:
const speed = 30;
const shooterData = from.isPlayer ? targetingData.player : targetingData.enemy;
```

### Issue: iPhone Can't See Debug Info

**Solution:** Use visible status log, not just console.log

```javascript
// ✓ CORRECT - Visible on screen
statusLog('Mech created', 'success');

// ✗ WRONG - Only in console
console.log('Mech created');
```

---

## 📊 Testing Workflow

### 1. Test in physics-test.html First

```bash
# Open physics-test.html in browser
# Make changes to physics-engine.js
# Refresh to test
```

### 2. Verify in Main Game

```bash
# Changes in physics-engine.js automatically apply
# Open index.html to verify
```

### 3. Commit Pattern

```bash
git add physics-engine.js physics-test.html index.html
git commit -m "v1.19.6 - Feature description

- What changed
- Why it changed
- What was fixed"
git push -u origin claude/combat-simulation-physics-[SESSION_ID]
```

---

## 🎯 Code Standards

### JavaScript

**Use `const` and `let`, never `var`:**
```javascript
const speed = 30;  // ✓
let position = 0;  // ✓
var x = 10;        // ✗
```

**Destructuring Matter.js:**
```javascript
const { Bodies, Body, World, Composite } = Matter;
```

**Error Handling:**
```javascript
// Always catch and display errors visibly
try {
    // code
} catch (error) {
    statusLog(`ERROR: ${error.message}`, 'error');
}
```

### HTML/CSS

**Inline styles for one-offs OK:**
```html
<div style="background:#222; color:#0f0; padding:15px;">
```

**IDs for JavaScript hooks:**
```html
<div id="status-messages"></div>
<button id="toggle-debug">Debug</button>
```

---

## 🚀 Performance

### Optimization Rules

1. **Use requestAnimationFrame** for render loops
2. **Limit debug updates** to 10x/sec max
3. **Remove off-screen projectiles:**

```javascript
function removeOffScreenProjectiles() {
    const margin = 50;
    projectiles.forEach(projectile => {
        const pos = projectile.position;
        if (pos.x < -margin || pos.x > canvas.width + margin ||
            pos.y < -margin || pos.y > canvas.height + margin) {
            Matter.World.remove(world, projectile);
        }
    });
}
```

4. **Collision filters** to prevent projectile-projectile collisions:

```javascript
collisionFilter: {
    category: 0x0002,  // Projectile category
    mask: 0x0001       // Only collide with mechs
}
```

---

## 📱 Mobile Considerations

### iPhone Specific

1. **No console access** → Use visible status log
2. **Touch events** → Ensure buttons are tappable
3. **Cache issues** → Update version badge to verify
4. **Viewport:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

---

## 🎨 Color Scheme

```javascript
colors: {
    player: '#00ff88',     // Green
    enemy: '#ff4444',      // Red
    terrain: '#4a4a6a',    // Gray
    projectile: '#ffaa00', // Orange
    background: '#0d0d1f', // Dark blue
    sky: '#1a1a3e',        // Purple-blue
    explosion: '#ff6600'   // Bright orange
}
```

---

## 🔄 Git Workflow

### Branch Naming

```
claude/combat-simulation-physics-[SESSION_ID]
```

### Commit Messages

```
v1.19.6 - Short description (< 50 chars)

Detailed explanation:
- What changed
- Why it changed
- What was fixed/added

Technical details if needed.
```

### Push Pattern

```bash
git add [files]
git commit -m "..."
git push -u origin claude/combat-simulation-physics-[SESSION_ID]
```

---

## ⚠️ Things to NEVER Do

1. ❌ **Don't duplicate physics code** between files
2. ❌ **Don't forget to increment version numbers**
3. ❌ **Don't skip `World.add()` for projectiles**
4. ❌ **Don't rely only on console.log for debugging**
5. ❌ **Don't make breaking changes without testing both files**
6. ❌ **Don't use `var`** (use `const`/`let`)
7. ❌ **Don't hard-code values** (use shared config)
8. ❌ **Don't commit without pushing**

---

## 📚 Reference

### Matter.js Key Objects

```javascript
Matter.Engine    // Physics engine
Matter.World     // Physics world (contains all bodies)
Matter.Bodies    // Body creation (rectangle, circle, etc.)
Matter.Body      // Body manipulation (velocity, force, etc.)
Matter.Composite // Groups of bodies (mechs)
Matter.Constraint// Joints between bodies
Matter.Events    // Collision events
```

### Common Operations

```javascript
// Create body
const body = Bodies.circle(x, y, radius, options);

// Add to world
World.add(world, body);

// Set velocity
Body.setVelocity(body, {x: vx, y: vy});

// Apply force
Body.applyForce(body, body.position, {x: fx, y: fy});

// Remove from world
World.remove(world, body);

// Update physics
Engine.update(engine, deltaTime);
```

---

## 🎯 Success Criteria

Before considering a feature "done":

- [ ] Works in physics-test.html
- [ ] Works in index.html (main game)
- [ ] Version number incremented everywhere
- [ ] Status logging shows all steps
- [ ] Error handling in place
- [ ] Code committed and pushed
- [ ] No console errors
- [ ] Mobile-friendly (tested on iPhone if possible)

---

## 📞 Quick Reference

### File Purposes

| File | Purpose | Edit When |
|------|---------|-----------|
| `physics-engine.js` | Core physics logic | Changing physics behavior |
| `physics-test.html` | Testing/debugging | Testing new features |
| `index.html` | Main game | UI, game logic, integration |
| `DEVELOPMENT-GUIDE.md` | This guide | Establishing new patterns |

### Common Commands

```bash
# Test physics changes
open physics-test.html

# Test full game
open index.html

# Commit changes
git add -A && git commit -m "v1.X.X - Description" && git push

# Check version
grep "<title>" index.html physics-test.html
```

---

## 🔮 Future Considerations

### When Adding New Features

1. Prototype in `physics-test.html`
2. If it needs physics, add to `physics-engine.js`
3. Update both files to use shared code
4. Test in both environments
5. Document any new patterns here

### When Refactoring

1. Never break the shared physics module
2. Maintain backward compatibility
3. Update all references
4. Test thoroughly before committing

---

**Last Updated:** v1.19.6
**Maintainer:** Claude (AI Assistant)
**Repository:** Autobattler Physics Combat System

---

*This guide should be updated whenever new patterns or approaches are established. Always follow these guidelines to maintain consistency and avoid rework.*
