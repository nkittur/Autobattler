// ============================================
// PIXEL ART ICON LIBRARY
// Retro-futuristic Battletech-style icons
// ============================================

const PIXEL_ICONS = {
    // ============================================
    // WEAPON ICONS
    // ============================================
    weapons: {
        // Generic weapon fallback
        default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="13" width="20" height="6" fill="#b85a3a"/>
            <rect x="22" y="12" width="6" height="8" fill="#a04030"/>
            <rect x="2" y="11" width="4" height="10" fill="#8a3a2a"/>
            <rect x="8" y="11" width="2" height="2" fill="#d4724e"/>
            <rect x="14" y="11" width="2" height="2" fill="#d4724e"/>
            <rect x="26" y="14" width="4" height="4" fill="#ff6644"/>
        </svg>`,

        // Laser weapons
        laser: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="12" width="18" height="8" fill="#b85a3a"/>
            <rect x="20" y="10" width="8" height="12" fill="#a04030"/>
            <rect x="2" y="10" width="4" height="12" fill="#8a3a2a"/>
            <rect x="8" y="10" width="2" height="2" fill="#ff6644"/>
            <rect x="12" y="10" width="2" height="2" fill="#ff6644"/>
            <rect x="16" y="10" width="2" height="2" fill="#ff6644"/>
            <rect x="26" y="14" width="4" height="4" fill="#ff4422"/>
            <rect x="28" y="15" width="2" height="2" fill="#ffaa88"/>
        </svg>`,

        // Missile/Rocket weapons
        missile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="6" y="10" width="16" height="12" fill="#666"/>
            <rect x="4" y="8" width="4" height="4" fill="#b85a3a"/>
            <rect x="4" y="20" width="4" height="4" fill="#b85a3a"/>
            <rect x="20" y="11" width="8" height="4" fill="#777"/>
            <rect x="20" y="17" width="8" height="4" fill="#777"/>
            <rect x="26" y="12" width="4" height="2" fill="#ff4422"/>
            <rect x="26" y="18" width="4" height="2" fill="#ff4422"/>
            <rect x="8" y="12" width="2" height="2" fill="#444"/>
            <rect x="12" y="12" width="2" height="2" fill="#444"/>
            <rect x="8" y="18" width="2" height="2" fill="#444"/>
            <rect x="12" y="18" width="2" height="2" fill="#444"/>
        </svg>`,

        // Autocannon/Ballistic
        autocannon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="2" y="10" width="8" height="12" fill="#555"/>
            <rect x="8" y="12" width="18" height="8" fill="#666"/>
            <rect x="24" y="14" width="6" height="4" fill="#444"/>
            <rect x="4" y="12" width="2" height="2" fill="#b85a3a"/>
            <rect x="12" y="10" width="3" height="2" fill="#777"/>
            <rect x="17" y="10" width="3" height="2" fill="#777"/>
            <rect x="12" y="20" width="3" height="2" fill="#777"/>
            <rect x="17" y="20" width="3" height="2" fill="#777"/>
            <rect x="28" y="15" width="2" height="2" fill="#333"/>
        </svg>`,

        // Particle Projector Cannon
        ppc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="8" width="16" height="16" fill="#b85a3a"/>
            <rect x="18" y="10" width="10" height="12" fill="#a04030"/>
            <rect x="6" y="4" width="4" height="6" fill="#8a3a2a"/>
            <rect x="6" y="22" width="4" height="6" fill="#8a3a2a"/>
            <rect x="26" y="13" width="4" height="6" fill="#4488ff"/>
            <rect x="28" y="14" width="2" height="4" fill="#88bbff"/>
            <rect x="10" y="12" width="4" height="8" fill="#666"/>
            <rect x="11" y="14" width="2" height="4" fill="#888"/>
        </svg>`,

        // Machine Gun
        machinegun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="13" width="22" height="6" fill="#555"/>
            <rect x="2" y="11" width="4" height="10" fill="#444"/>
            <rect x="8" y="11" width="2" height="2" fill="#666"/>
            <rect x="14" y="11" width="2" height="2" fill="#666"/>
            <rect x="20" y="11" width="2" height="2" fill="#666"/>
            <rect x="24" y="14" width="6" height="4" fill="#444"/>
            <rect x="28" y="15" width="2" height="2" fill="#333"/>
        </svg>`,

        // Flamer
        flamer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="11" width="12" height="10" fill="#666"/>
            <rect x="14" y="13" width="10" height="6" fill="#555"/>
            <rect x="2" y="13" width="4" height="6" fill="#b85a3a"/>
            <rect x="22" y="12" width="8" height="8" fill="#ff4422"/>
            <rect x="24" y="10" width="4" height="4" fill="#ff6644"/>
            <rect x="26" y="8" width="2" height="4" fill="#ffaa44"/>
            <rect x="28" y="14" width="2" height="4" fill="#ff8844"/>
        </svg>`,

        // Gauss Rifle
        gauss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="2" y="10" width="24" height="12" fill="#4a6a8c"/>
            <rect x="24" y="12" width="6" height="8" fill="#5a7a9c"/>
            <rect x="6" y="8" width="4" height="4" fill="#3a5a7c"/>
            <rect x="12" y="8" width="4" height="4" fill="#3a5a7c"/>
            <rect x="6" y="20" width="4" height="4" fill="#3a5a7c"/>
            <rect x="12" y="20" width="4" height="4" fill="#3a5a7c"/>
            <rect x="28" y="14" width="2" height="4" fill="#88bbff"/>
            <rect x="18" y="13" width="4" height="6" fill="#6a8aac"/>
        </svg>`
    },

    // ============================================
    // ARMOR ICONS
    // ============================================
    armor: {
        default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M16 2 L4 8 L4 18 C4 26 16 30 16 30 C16 30 28 26 28 18 L28 8 Z" fill="#4a6a8c"/>
            <path d="M16 4 L6 9 L6 17 C6 24 16 28 16 28 C16 28 26 24 26 17 L26 9 Z" fill="#5a7a9c"/>
            <rect x="14" y="8" width="4" height="12" fill="#6a8aac"/>
            <rect x="10" y="12" width="12" height="4" fill="#6a8aac"/>
        </svg>`,

        plating: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="4" width="24" height="24" fill="#4a6a8c"/>
            <rect x="6" y="6" width="20" height="20" fill="#5a7a9c"/>
            <rect x="8" y="8" width="6" height="6" fill="#6a8aac"/>
            <rect x="18" y="8" width="6" height="6" fill="#6a8aac"/>
            <rect x="8" y="18" width="6" height="6" fill="#6a8aac"/>
            <rect x="18" y="18" width="6" height="6" fill="#6a8aac"/>
            <rect x="14" y="14" width="4" height="4" fill="#3a5a7c"/>
        </svg>`,

        reactive: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="4" width="24" height="24" fill="#4a6a8c"/>
            <rect x="6" y="6" width="8" height="8" fill="#c4a03a"/>
            <rect x="18" y="6" width="8" height="8" fill="#5a7a9c"/>
            <rect x="6" y="18" width="8" height="8" fill="#5a7a9c"/>
            <rect x="18" y="18" width="8" height="8" fill="#c4a03a"/>
            <rect x="14" y="14" width="4" height="4" fill="#6a8aac"/>
        </svg>`
    },

    // ============================================
    // REACTOR ICONS
    // ============================================
    reactor: {
        default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="8" y="2" width="16" height="28" fill="#444"/>
            <rect x="10" y="4" width="12" height="24" fill="#c4a03a"/>
            <rect x="12" y="8" width="8" height="4" fill="#e4c05a"/>
            <rect x="12" y="14" width="8" height="4" fill="#e4c05a"/>
            <rect x="12" y="20" width="8" height="4" fill="#e4c05a"/>
            <rect x="14" y="10" width="4" height="8" fill="#ffdd66"/>
        </svg>`,

        fusion: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="6" y="4" width="20" height="24" fill="#444"/>
            <rect x="8" y="6" width="16" height="20" fill="#c4a03a"/>
            <circle cx="16" cy="16" r="6" fill="#e4c05a"/>
            <circle cx="16" cy="16" r="3" fill="#ffdd66"/>
            <rect x="4" y="10" width="4" height="4" fill="#555"/>
            <rect x="24" y="10" width="4" height="4" fill="#555"/>
            <rect x="4" y="18" width="4" height="4" fill="#555"/>
            <rect x="24" y="18" width="4" height="4" fill="#555"/>
        </svg>`,

        xl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="2" width="24" height="28" fill="#555"/>
            <rect x="6" y="4" width="20" height="24" fill="#c4a03a"/>
            <rect x="8" y="6" width="6" height="20" fill="#e4c05a"/>
            <rect x="18" y="6" width="6" height="20" fill="#e4c05a"/>
            <rect x="10" y="12" width="12" height="8" fill="#ffdd66"/>
            <rect x="14" y="8" width="4" height="4" fill="#ff8844"/>
            <rect x="14" y="20" width="4" height="4" fill="#ff8844"/>
        </svg>`
    },

    // ============================================
    // SYSTEM ICONS
    // ============================================
    system: {
        default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="#7a4a8c" stroke-width="4"/>
            <circle cx="16" cy="16" r="4" fill="#9a6aac"/>
            <rect x="14" y="2" width="4" height="6" fill="#7a4a8c"/>
            <rect x="14" y="24" width="4" height="6" fill="#7a4a8c"/>
            <rect x="2" y="14" width="6" height="4" fill="#7a4a8c"/>
            <rect x="24" y="14" width="6" height="4" fill="#7a4a8c"/>
        </svg>`,

        targeting: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="10" fill="none" stroke="#7a4a8c" stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="none" stroke="#9a6aac" stroke-width="2"/>
            <circle cx="16" cy="16" r="2" fill="#ba8acc"/>
            <rect x="15" y="2" width="2" height="6" fill="#7a4a8c"/>
            <rect x="15" y="24" width="2" height="6" fill="#7a4a8c"/>
            <rect x="2" y="15" width="6" height="2" fill="#7a4a8c"/>
            <rect x="24" y="15" width="6" height="2" fill="#7a4a8c"/>
        </svg>`,

        ecm: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="10" y="4" width="12" height="24" fill="#7a4a8c"/>
            <rect x="6" y="8" width="6" height="4" fill="#9a6aac"/>
            <rect x="20" y="8" width="6" height="4" fill="#9a6aac"/>
            <rect x="6" y="20" width="6" height="4" fill="#9a6aac"/>
            <rect x="20" y="20" width="6" height="4" fill="#9a6aac"/>
            <rect x="14" y="12" width="4" height="8" fill="#ba8acc"/>
            <circle cx="4" cy="10" r="2" fill="#ff44ff"/>
            <circle cx="28" cy="10" r="2" fill="#ff44ff"/>
            <circle cx="4" cy="22" r="2" fill="#ff44ff"/>
            <circle cx="28" cy="22" r="2" fill="#ff44ff"/>
        </svg>`,

        gyro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="#7a4a8c"/>
            <circle cx="16" cy="16" r="8" fill="#9a6aac"/>
            <circle cx="16" cy="16" r="4" fill="#7a4a8c"/>
            <rect x="4" y="14" width="24" height="4" fill="#ba8acc"/>
            <rect x="14" y="4" width="4" height="24" fill="#ba8acc"/>
        </svg>`
    },

    // ============================================
    // COOLING ICONS
    // ============================================
    cooling: {
        default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="6" y="4" width="4" height="24" fill="#3a7a8c"/>
            <rect x="14" y="4" width="4" height="24" fill="#3a7a8c"/>
            <rect x="22" y="4" width="4" height="24" fill="#3a7a8c"/>
            <rect x="4" y="8" width="24" height="4" fill="#5a9aac"/>
            <rect x="4" y="16" width="24" height="4" fill="#5a9aac"/>
            <rect x="4" y="24" width="24" height="4" fill="#5a9aac"/>
        </svg>`,

        heatsink: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="4" width="24" height="24" fill="#3a7a8c"/>
            <rect x="6" y="6" width="3" height="20" fill="#5a9aac"/>
            <rect x="11" y="6" width="3" height="20" fill="#5a9aac"/>
            <rect x="16" y="6" width="3" height="20" fill="#5a9aac"/>
            <rect x="21" y="6" width="3" height="20" fill="#5a9aac"/>
            <rect x="26" y="6" width="2" height="20" fill="#7abacc"/>
        </svg>`,

        dhs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="2" y="4" width="28" height="24" fill="#3a7a8c"/>
            <rect x="4" y="6" width="2" height="20" fill="#5a9aac"/>
            <rect x="8" y="6" width="2" height="20" fill="#5a9aac"/>
            <rect x="12" y="6" width="2" height="20" fill="#5a9aac"/>
            <rect x="16" y="6" width="2" height="20" fill="#5a9aac"/>
            <rect x="20" y="6" width="2" height="20" fill="#5a9aac"/>
            <rect x="24" y="6" width="2" height="20" fill="#5a9aac"/>
            <rect x="28" y="6" width="2" height="20" fill="#7abacc"/>
            <rect x="4" y="14" width="24" height="4" fill="#2a6a7c"/>
        </svg>`
    },

    // ============================================
    // MECH CHASSIS ICONS
    // ============================================
    mechs: {
        scout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <rect x="20" y="2" width="8" height="6" fill="#4a7c59"/>
            <rect x="22" y="4" width="2" height="2" fill="#8fb174"/>
            <rect x="24" y="4" width="2" height="2" fill="#8fb174"/>
            <rect x="16" y="8" width="16" height="12" fill="#3a6a49"/>
            <rect x="10" y="10" width="8" height="8" fill="#4a7c59"/>
            <rect x="30" y="10" width="8" height="8" fill="#4a7c59"/>
            <rect x="6" y="12" width="6" height="4" fill="#b85a3a"/>
            <rect x="36" y="12" width="6" height="4" fill="#b85a3a"/>
            <rect x="18" y="20" width="12" height="6" fill="#2a5a39"/>
            <rect x="18" y="26" width="4" height="12" fill="#3a6a49"/>
            <rect x="26" y="26" width="4" height="12" fill="#3a6a49"/>
            <rect x="16" y="36" width="6" height="4" fill="#2a5a39"/>
            <rect x="26" y="36" width="6" height="4" fill="#2a5a39"/>
        </svg>`,

        warrior: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <rect x="18" y="2" width="12" height="8" fill="#4a7c59"/>
            <rect x="20" y="4" width="2" height="2" fill="#8fb174"/>
            <rect x="26" y="4" width="2" height="2" fill="#8fb174"/>
            <rect x="14" y="10" width="20" height="16" fill="#3a6a49"/>
            <rect x="6" y="12" width="10" height="12" fill="#4a7c59"/>
            <rect x="32" y="12" width="10" height="12" fill="#4a7c59"/>
            <rect x="2" y="14" width="6" height="8" fill="#b85a3a"/>
            <rect x="40" y="14" width="6" height="8" fill="#b85a3a"/>
            <rect x="16" y="26" width="16" height="6" fill="#2a5a39"/>
            <rect x="16" y="32" width="6" height="12" fill="#3a6a49"/>
            <rect x="26" y="32" width="6" height="12" fill="#3a6a49"/>
            <rect x="14" y="40" width="8" height="4" fill="#2a5a39"/>
            <rect x="26" y="40" width="8" height="4" fill="#2a5a39"/>
        </svg>`,

        striker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <rect x="18" y="2" width="12" height="6" fill="#4a7c59"/>
            <rect x="20" y="3" width="2" height="2" fill="#8fb174"/>
            <rect x="26" y="3" width="2" height="2" fill="#8fb174"/>
            <rect x="14" y="8" width="20" height="14" fill="#3a6a49"/>
            <rect x="6" y="10" width="10" height="10" fill="#4a7c59"/>
            <rect x="32" y="10" width="10" height="10" fill="#4a7c59"/>
            <rect x="0" y="12" width="8" height="4" fill="#b85a3a"/>
            <rect x="40" y="12" width="8" height="4" fill="#b85a3a"/>
            <rect x="0" y="16" width="8" height="4" fill="#b85a3a"/>
            <rect x="40" y="16" width="8" height="4" fill="#b85a3a"/>
            <rect x="16" y="22" width="16" height="6" fill="#2a5a39"/>
            <rect x="16" y="28" width="6" height="14" fill="#3a6a49"/>
            <rect x="26" y="28" width="6" height="14" fill="#3a6a49"/>
            <rect x="14" y="38" width="8" height="6" fill="#2a5a39"/>
            <rect x="26" y="38" width="8" height="6" fill="#2a5a39"/>
        </svg>`,

        heavy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <rect x="16" y="0" width="16" height="8" fill="#4a7c59"/>
            <rect x="18" y="2" width="3" height="3" fill="#8fb174"/>
            <rect x="27" y="2" width="3" height="3" fill="#8fb174"/>
            <rect x="10" y="8" width="28" height="18" fill="#3a6a49"/>
            <rect x="2" y="10" width="10" height="14" fill="#4a7c59"/>
            <rect x="36" y="10" width="10" height="14" fill="#4a7c59"/>
            <rect x="0" y="12" width="4" height="10" fill="#b85a3a"/>
            <rect x="44" y="12" width="4" height="10" fill="#b85a3a"/>
            <rect x="14" y="26" width="20" height="6" fill="#2a5a39"/>
            <rect x="12" y="32" width="8" height="14" fill="#3a6a49"/>
            <rect x="28" y="32" width="8" height="14" fill="#3a6a49"/>
            <rect x="10" y="42" width="10" height="4" fill="#2a5a39"/>
            <rect x="28" y="42" width="10" height="4" fill="#2a5a39"/>
        </svg>`,

        assault: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <rect x="14" y="0" width="20" height="10" fill="#4a7c59"/>
            <rect x="16" y="2" width="4" height="4" fill="#8fb174"/>
            <rect x="28" y="2" width="4" height="4" fill="#8fb174"/>
            <rect x="8" y="10" width="32" height="20" fill="#3a6a49"/>
            <rect x="0" y="12" width="10" height="16" fill="#4a7c59"/>
            <rect x="38" y="12" width="10" height="16" fill="#4a7c59"/>
            <rect x="0" y="14" width="4" height="6" fill="#b85a3a"/>
            <rect x="44" y="14" width="4" height="6" fill="#b85a3a"/>
            <rect x="0" y="20" width="4" height="6" fill="#b85a3a"/>
            <rect x="44" y="20" width="4" height="6" fill="#b85a3a"/>
            <rect x="12" y="30" width="24" height="6" fill="#2a5a39"/>
            <rect x="10" y="36" width="10" height="10" fill="#3a6a49"/>
            <rect x="28" y="36" width="10" height="10" fill="#3a6a49"/>
            <rect x="8" y="42" width="12" height="4" fill="#2a5a39"/>
            <rect x="28" y="42" width="12" height="4" fill="#2a5a39"/>
        </svg>`
    },

    // ============================================
    // UI ICONS
    // ============================================
    ui: {
        gold: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="#c4a03a"/>
            <circle cx="16" cy="16" r="10" fill="#e4c05a"/>
            <circle cx="16" cy="16" r="6" fill="#c4a03a"/>
            <rect x="14" y="8" width="4" height="4" fill="#ffdd66"/>
            <rect x="10" y="14" width="4" height="4" fill="#ffdd66"/>
            <rect x="18" y="14" width="4" height="4" fill="#ffdd66"/>
            <rect x="14" y="20" width="4" height="4" fill="#ffdd66"/>
        </svg>`,

        refresh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M16 4 L16 10 L22 7 Z" fill="#5a9aac"/>
            <path d="M26 16 C26 10 21 6 16 6" fill="none" stroke="#5a9aac" stroke-width="4"/>
            <path d="M16 28 L16 22 L10 25 Z" fill="#5a9aac"/>
            <path d="M6 16 C6 22 11 26 16 26" fill="none" stroke="#5a9aac" stroke-width="4"/>
        </svg>`,

        back: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="8" y="14" width="18" height="4" fill="#5a9aac"/>
            <path d="M12 16 L4 16 L12 8 L12 12 L12 20 L12 24 Z" fill="#5a9aac"/>
        </svg>`,

        rotate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M16 6 L22 12 L18 12 L18 20 L14 20 L14 12 L10 12 Z" fill="#8fb174"/>
            <path d="M8 16 C8 20 11 24 16 24" fill="none" stroke="#5a9aac" stroke-width="3"/>
            <path d="M16 26 L16 22 L20 24 Z" fill="#5a9aac"/>
        </svg>`,

        lock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="8" y="14" width="16" height="14" fill="#666"/>
            <rect x="10" y="16" width="12" height="10" fill="#888"/>
            <path d="M12 14 L12 10 C12 6 20 6 20 10 L20 14" fill="none" stroke="#666" stroke-width="4"/>
            <rect x="14" y="18" width="4" height="4" fill="#c4a03a"/>
        </svg>`,

        damage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <polygon points="16,2 20,12 30,12 22,18 26,28 16,22 6,28 10,18 2,12 12,12" fill="#b85a3a"/>
            <polygon points="16,6 18,12 24,12 19,16 21,22 16,18 11,22 13,16 8,12 14,12" fill="#d4724e"/>
        </svg>`,

        energy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <polygon points="18,2 8,16 14,16 12,30 24,14 18,14 20,2" fill="#c4a03a"/>
            <polygon points="17,6 10,16 14,16 13,26 22,14 18,14 19,6" fill="#e4c05a"/>
        </svg>`,

        weight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="10" y="20" width="12" height="8" fill="#666"/>
            <rect x="8" y="24" width="16" height="6" fill="#888"/>
            <rect x="12" y="8" width="8" height="14" fill="#666"/>
            <rect x="6" y="6" width="6" height="6" fill="#888"/>
            <rect x="20" y="6" width="6" height="6" fill="#888"/>
        </svg>`,

        squares: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <rect x="4" y="4" width="10" height="10" fill="#4a7c59"/>
            <rect x="18" y="4" width="10" height="10" fill="#4a7c59"/>
            <rect x="4" y="18" width="10" height="10" fill="#4a7c59"/>
            <rect x="18" y="18" width="10" height="10" fill="#4a7c59"/>
            <rect x="6" y="6" width="6" height="6" fill="#6a9c79"/>
            <rect x="20" y="6" width="6" height="6" fill="#6a9c79"/>
            <rect x="6" y="20" width="6" height="6" fill="#6a9c79"/>
            <rect x="20" y="20" width="6" height="6" fill="#6a9c79"/>
        </svg>`,

        hp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M16 28 L4 16 C0 12 0 6 6 4 C12 2 16 8 16 8 C16 8 20 2 26 4 C32 6 32 12 28 16 Z" fill="#a04040"/>
            <path d="M16 24 L6 16 C4 14 4 10 8 8 C12 6 16 10 16 10 C16 10 20 6 24 8 C28 10 28 14 26 16 Z" fill="#c06060"/>
        </svg>`,

        armor_stat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M16 2 L4 8 L4 18 C4 26 16 30 16 30 C16 30 28 26 28 18 L28 8 Z" fill="#4a6a8c"/>
            <path d="M16 6 L8 10 L8 17 C8 22 16 26 16 26 C16 26 24 22 24 17 L24 10 Z" fill="#6a8aac"/>
        </svg>`,

        accuracy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="#c4a03a" stroke-width="2"/>
            <circle cx="16" cy="16" r="8" fill="none" stroke="#c4a03a" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="none" stroke="#c4a03a" stroke-width="2"/>
            <circle cx="16" cy="16" r="2" fill="#e4c05a"/>
        </svg>`
    }
};

// Function to get icon as data URL
function getPixelIconDataUrl(category, type) {
    const icons = PIXEL_ICONS[category];
    if (!icons) return null;
    const svg = icons[type] || icons.default;
    if (!svg) return null;
    return 'data:image/svg+xml,' + encodeURIComponent(svg.replace(/\s+/g, ' ').trim());
}

// Function to get icon as HTML element
function createPixelIcon(category, type, size = 32) {
    const dataUrl = getPixelIconDataUrl(category, type);
    if (!dataUrl) return null;
    const img = document.createElement('div');
    img.className = 'pixel-icon';
    img.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background-image: url("${dataUrl}");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        image-rendering: pixelated;
    `;
    return img;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PIXEL_ICONS, getPixelIconDataUrl, createPixelIcon };
}
