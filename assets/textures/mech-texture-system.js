/**
 * Mech Texture System v2
 * Manages trim sheet textures for mech rendering with team color tinting
 *
 * Design Philosophy:
 * - Texture provides DETAIL (panel lines, wear, surface variation)
 * - Team colors provide the PRIMARY color
 * - Texture is neutral gray so it can be tinted any color
 * - Result: textureGray * teamColor = tinted result
 */

class MechTextureSystem {
    constructor(scene, options = {}) {
        console.log('[TextureSystem] Constructor: hasScene=' + !!scene + ' size=' + (options.textureSize || 1024));
        this.scene = scene;
        this.options = {
            textureSize: options.textureSize || 1024,
            ...options
        };

        // Texture cache
        this.textures = {
            diffuse: null,
            normal: null
        };

        // Material cache
        this.materialCache = new Map();
    }

    /**
     * Initialize from a canvas element (for procedurally generated textures)
     */
    initializeFromCanvas(canvas) {
        console.log('[TextureSystem] initFromCanvas: canvas=' + !!canvas +
            ' size=' + (canvas ? canvas.width + 'x' + canvas.height : 'N/A'));

        try {
            // Dispose old texture if exists
            if (this.textures.diffuse) {
                this.textures.diffuse.dispose();
            }

            // Debug: Check canvas data URL generation
            const dataUrl = canvas.toDataURL('image/png');
            console.log('[TextureSystem] DataURL len=' + dataUrl.length);

            this.textures.diffuse = BABYLON.Texture.LoadFromDataString(
                'mechTrimSheet_' + Date.now(),
                dataUrl,
                this.scene,
                false, // noMipmap
                true,  // invertY
                BABYLON.Texture.TRILINEAR_SAMPLINGMODE
            );
            this.textures.diffuse.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
            this.textures.diffuse.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

            const texSize = this.textures.diffuse.getSize();
            console.log('[TextureSystem] Texture created: ready=' + this.textures.diffuse.isReady() +
                ' size=' + texSize.width + 'x' + texSize.height);

            // Add ready callback for debugging
            this.textures.diffuse.onLoadObservable.add(() => {
                const sz = this.textures.diffuse.getSize();
                console.log('[TextureSystem] Texture LOADED: ready=' + this.textures.diffuse.isReady() +
                    ' size=' + sz.width + 'x' + sz.height);
            });

            // Clear material cache when texture changes
            this.clearCache();
        } catch (error) {
            console.error('[TextureSystem] initFromCanvas FAILED:', error);
            throw error;
        }
    }

    /**
     * Initialize from an Image element
     */
    initializeFromImage(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        this.initializeFromCanvas(canvas);
    }

    /**
     * Create a textured material with team color
     *
     * The texture is neutral gray, and the diffuseColor tints it.
     * Babylon.js multiplies: finalColor = diffuseTexture * diffuseColor
     *
     * So for a gray texture (0.5) and red team color (1, 0.2, 0.2):
     * Result = (0.5, 0.1, 0.1) - a darker red
     *
     * We boost the diffuseColor to compensate for the texture darkening.
     */
    createMaterial(materialType, teamColors, mechId) {
        const cacheKey = `${mechId}_${materialType}`;

        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }

        const hasTex = !!this.textures.diffuse;
        console.log('[TextureSystem] createMat: ' + cacheKey + ' hasTex=' + hasTex);

        const mat = new BABYLON.StandardMaterial(`${mechId}_${materialType}_tex`, this.scene);

        // Apply texture
        if (this.textures.diffuse) {
            mat.diffuseTexture = this.textures.diffuse;
        } else {
            console.warn('[TextureSystem] NO texture for: ' + cacheKey);
        }

        // Get the base color for this material type
        const baseColor = this.getBaseColor(materialType, teamColors);

        // Apply as diffuse color - this tints the gray texture
        mat.diffuseColor = new BABYLON.Color3(baseColor[0], baseColor[1], baseColor[2]);

        // Specular settings
        const spec = this.getSpecularConfig(materialType);
        mat.specularColor = new BABYLON.Color3(spec.color, spec.color, spec.color);
        mat.specularPower = spec.power;

        // Emissive for glow materials
        if (materialType === 'glow') {
            mat.emissiveColor = new BABYLON.Color3(
                teamColors.accent[0] * 0.4,
                teamColors.accent[1] * 0.4,
                teamColors.accent[2] * 0.4
            );
        }

        this.materialCache.set(cacheKey, mat);
        return mat;
    }

    /**
     * Get base color for material type
     *
     * Since texture is ~0.5 gray (mid-gray), we need to boost colors
     * by roughly 2x to get the intended brightness.
     *
     * But we also want variation - primary should be team color,
     * secondary slightly darker, metal should stay metallic, etc.
     */
    getBaseColor(materialType, teamColors) {
        // Boost factor to compensate for gray texture multiplication
        // Texture averages ~0.5, so multiply by 2 to get back to original
        const boost = 2.0;

        switch (materialType) {
            case 'primary':
                // Main armor - full team primary color, boosted
                return [
                    Math.min(1, teamColors.primary[0] * boost),
                    Math.min(1, teamColors.primary[1] * boost),
                    Math.min(1, teamColors.primary[2] * boost)
                ];

            case 'secondary':
                // Secondary armor - team secondary color, boosted
                return [
                    Math.min(1, teamColors.secondary[0] * boost),
                    Math.min(1, teamColors.secondary[1] * boost),
                    Math.min(1, teamColors.secondary[2] * boost)
                ];

            case 'accent':
                // Accent details - team accent color
                return [
                    Math.min(1, teamColors.accent[0] * boost),
                    Math.min(1, teamColors.accent[1] * boost),
                    Math.min(1, teamColors.accent[2] * boost)
                ];

            case 'metal':
                // Metal parts - neutral metallic gray (not team colored)
                return [0.75, 0.75, 0.8];

            case 'dark':
                // Dark recesses - very dark, minimal color
                return [0.3, 0.3, 0.35];

            case 'glow':
                // Glowing parts - bright accent
                return [
                    Math.min(1, teamColors.accent[0] * 1.5),
                    Math.min(1, teamColors.accent[1] * 1.5),
                    Math.min(1, teamColors.accent[2] * 1.5)
                ];

            case 'missile':
                // Missiles/weapons - dark neutral
                return [0.55, 0.55, 0.6];

            default:
                return [0.7, 0.7, 0.75];
        }
    }

    /**
     * Specular configuration per material type
     */
    getSpecularConfig(materialType) {
        const configs = {
            primary: { color: 0.2, power: 20 },
            secondary: { color: 0.15, power: 16 },
            accent: { color: 0.3, power: 24 },
            metal: { color: 0.5, power: 40 },
            dark: { color: 0.05, power: 12 },
            glow: { color: 0.4, power: 32 },
            missile: { color: 0.15, power: 16 }
        };
        return configs[materialType] || configs.primary;
    }

    /**
     * Create a full material set for a mech
     */
    createMaterialSet(teamColors, mechId) {
        console.log('[TextureSystem] createMatSet: ' + mechId + ' hasTex=' + !!this.textures.diffuse);

        const mats = {};
        const types = ['primary', 'secondary', 'accent', 'metal', 'dark', 'glow', 'missile'];

        types.forEach(type => {
            mats[type] = this.createMaterial(type, teamColors, mechId);
        });

        const hasTexCount = Object.values(mats).filter(m => !!m.diffuseTexture).length;
        console.log('[TextureSystem] MatSet done: ' + mechId + ' withTex=' + hasTexCount + '/7');

        return mats;
    }

    /**
     * Clear material cache
     */
    clearCache() {
        this.materialCache.forEach(mat => mat.dispose());
        this.materialCache.clear();
    }

    /**
     * Dispose all resources
     */
    dispose() {
        this.clearCache();
        if (this.textures.diffuse) {
            this.textures.diffuse.dispose();
        }
        if (this.textures.normal) {
            this.textures.normal.dispose();
        }
        this.textures = {};
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MechTextureSystem };
}
