# 🤖 Mech Autobattler

A browser-based tactical mech combat game with strategic loadout management and progressive difficulty. Build your perfect mech, salvage components from defeated enemies, and survive as long as you can!

## 🎮 How to Play

### Starting the Game

1. **Open `index.html` in any modern web browser**
   - Works on mobile (portrait mode optimized) and desktop
   - No installation or server required
   - Game auto-saves to localStorage

2. **Choose Your Starting Mech**
   - **Scout** (Light): Fast, agile, lower capacity
   - **Warrior** (Medium): Balanced stats across the board
   - **Titan** (Heavy): Slow but powerful, high capacity

### Game Loop

#### 1. **Loadout Management Screen**
   - **Mech Panel** (top on mobile, left on desktop):
     - View your current mech's stats
     - See tier points and weight usage
     - 7 component slots: Head, Torso, Left/Right Arms, Left/Right Shoulders, Legs

   - **Inventory Panel** (bottom on mobile, right on desktop):
     - All salvaged components
     - Tap/click to select a component
     - Then tap/click a compatible slot to attach

   - **Resource Management**:
     - **Tier Points**: Total power budget (50/75/100 based on mech class)
     - **Weight**: Affects initiative speed (100/150/200 capacity)
     - **Slot Capacity**: Each slot has size limits (1-4 units)

#### 2. **Battle Screen**
   - Watch your mech fight automatically
   - Combat is turn-based with initiative determined by weight
   - Lighter mechs attack first!
   - Victory = Advance to salvage/mech selection
   - Defeat = Game Over, start fresh

#### 3. **Salvage Selection** (Rounds 1-4, 6-9, etc.)
   - Choose 1 of 3 random components
   - Components scale with round number
   - Higher tiers = more damage/armor but cost more resources

#### 4. **Mech Selection** (Every 5th Round)
   - Choose 1 of 3 new mechs (higher tier than current)
   - **Important**: You can only salvage ONE component from your old mech
   - Choose wisely - lose all other equipped components!

## 🔧 Game Mechanics

### Component Types

**Weapons** (Arms/Shoulders)
- High damage, moderate tier/weight cost
- Examples: Laser Cannon, Plasma Rifle, Missile Pod

**Armor** (Torso)
- High armor rating, heavy weight
- Reduces incoming damage significantly

**Systems** (Head/Legs/Torso)
- Balanced damage and armor bonuses
- Specialized functions (targeting, boosters, shields)

### Stats Explained

- **⚔️ Damage**: Total attack power (sum of all components)
- **🛡️ Armor**: Damage reduction (50% effective, max 70% reduction)
- **⚡ Speed**: Initiative order (100 - weight/2)
- **⚖️ Weight**: Higher = slower but often more powerful
- **📏 Size**: Must fit in slot capacity
- **⭐ Tier Points**: Total "power budget"

### Strategic Decisions

**Build Specialization**
- Glass Cannon: High damage, low armor, fast
- Tank: Heavy armor, slow, sustained damage
- Balanced: Mix of all stats

**Mech Swapping**
- Keep invested mech vs start fresh with better base
- Only save ONE component - which is most valuable?
- Higher tier mechs unlock better salvage options

**Component Prioritization**
- Early game: Focus on survival (armor + damage)
- Mid game: Optimize synergies
- Late game: Min-max for maximum efficiency

## 📱 Mobile Controls

- **Tap** to select inventory items
- **Tap** slots to attach/detach components
- **Tap** salvage/mech cards to select
- **Swipe** to scroll through inventory
- All buttons are touch-optimized

## 🐛 Debug Panel

Tap the **DEBUG** button (top-right) to see:
- Current round and victories
- Mech statistics
- Resource usage
- Reset game option

## 💾 Save System

- Game auto-saves after every action
- Uses browser localStorage
- Reload page to continue where you left off
- Reset via Debug panel if needed

## 🎯 Difficulty Scaling

- **Monster HP**: +20% every 5 rounds
- **Monster Damage**: +15% every 5 rounds
- **Salvage Quality**: +1 tier every 5 rounds
- **Mech Tier**: +1 every 5 rounds

## 🏆 Strategy Tips

1. **Early Game (Rounds 1-5)**
   - Focus on filling empty slots
   - Don't overcomplicate - any component is better than none
   - Balance damage and armor

2. **Mid Game (Rounds 6-15)**
   - Optimize tier/weight ratio
   - Consider speed for first-strike advantage
   - Prepare for mech swaps - identify your best component

3. **Late Game (Rounds 16+)**
   - Max out tier capacity efficiently
   - Heavy armor becomes critical
   - Speed matters - lighter loadouts can win via attrition

4. **Component Management**
   - Keep tier 1 components for flexibility
   - Higher tier ≠ always better (resource constraints)
   - Match component size to slot capacity

5. **Mech Selection Strategy**
   - Scout → Warrior: Bring your best weapon
   - Warrior → Titan: Bring highest tier armor
   - Same class: Usually keep current mech

## 🛠️ Technical Details

- **Technology**: Vanilla HTML/CSS/JavaScript
- **File Size**: ~45KB (single file)
- **Browser Support**: Chrome, Firefox, Safari, Edge (modern versions)
- **Mobile Support**: iOS Safari, Chrome Android
- **Offline**: Fully functional offline after first load

## 🎨 Future Enhancement Ideas

- Component synergies and set bonuses
- Special abilities and active skills
- Monster types with unique mechanics
- Achievement system
- Leaderboard integration
- Sound effects and music
- More mech classes and component types
- Damage type system (energy/kinetic/explosive)

## 📝 Version

**v1.0** - Initial Release
- Complete core game loop
- Persistent saves
- Mobile-optimized UI
- 3 mech classes
- 15+ component types
- Infinite scaling difficulty

---

**Enjoy the game! How long can you survive?** 🚀
