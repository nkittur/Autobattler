/**
 * Mech Texture System
 * Manages trim sheet textures for mech rendering with team color tinting
 *
 * This system uses a "trim sheet" approach where a single texture atlas
 * contains multiple surface types that can be UV-mapped to different mech parts.
 *
 * Features:
 * - Single texture atlas for all mechs (efficient)
 * - Team color tinting via material color multiplication
 * - UV region definitions for different surface types
 * - Optional PBR material support with normal/roughness maps
 */

class MechTextureSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            textureSize: options.textureSize || 1024,
            usePBR: options.usePBR || false,
            texturePath: options.texturePath || 'assets/textures/',
            ...options
        };

        // Texture cache
        this.textures = {
            diffuse: null,
            normal: null,
            roughness: null,
            metallic: null
        };

        // Material cache (reuse materials across mechs)
        this.materialCache = new Map();

        // UV regions for different surface types on the trim sheet
        // Based on the provided sci-fi industrial texture sheet layout
        this.uvRegions = {
            // Heavy armor panels (top-left area)
            armorHeavy: { u: 0, v: 0, w: 0.2, h: 0.35 },
            armorPanel: { u: 0.2, v: 0, w: 0.25, h: 0.35 },

            // Vents and grilles (left side)
            ventHorizontal: { u: 0, v: 0.35, w: 0.15, h: 0.15 },
            ventVertical: { u: 0, v: 0.5, w: 0.1, h: 0.2 },

            // Cables and hydraulics (center-top)
            cables: { u: 0.2, v: 0.15, w: 0.1, h: 0.35 },

            // Large armor pieces (center)
            armorLarge: { u: 0.3, v: 0, w: 0.25, h: 0.5 },
            armorContoured: { u: 0.3, v: 0.5, w: 0.25, h: 0.35 },

            // Mechanical details (right side)
            pistons: { u: 0.75, v: 0, w: 0.12, h: 0.5 },
            mechanical: { u: 0.87, v: 0, w: 0.13, h: 0.5 },

            // Weathered/rusty surfaces (bottom)
            weathered: { u: 0, v: 0.65, w: 0.35, h: 0.35 },
            scratched: { u: 0.35, v: 0.65, w: 0.3, h: 0.35 },

            // Technical details (bottom-right)
            techPanel: { u: 0.65, v: 0.65, w: 0.18, h: 0.35 },
            greeble: { u: 0.83, v: 0.5, w: 0.17, h: 0.5 },

            // Default fallback (uses large armor piece)
            default: { u: 0.3, v: 0, w: 0.25, h: 0.5 }
        };

        // Part-to-region mapping
        this.partMapping = {
            // Primary armor surfaces
            primary: ['armorLarge', 'armorPanel', 'armorHeavy'],
            // Secondary/accent surfaces
            secondary: ['armorContoured', 'weathered'],
            // Metal joints and mechanical parts
            metal: ['pistons', 'mechanical'],
            // Dark recesses and vents
            dark: ['ventHorizontal', 'ventVertical', 'cables'],
            // Technical panels
            accent: ['techPanel', 'greeble'],
            // Weathered/battle damaged
            damaged: ['scratched', 'weathered']
        };
    }

    /**
     * Initialize the texture system - load textures
     * @param {string} trimSheetUrl - URL or data URL of the trim sheet texture
     * @returns {Promise} Resolves when textures are loaded
     */
    async initialize(trimSheetUrl) {
        return new Promise((resolve, reject) => {
            // Load the main diffuse/albedo texture
            this.textures.diffuse = new BABYLON.Texture(
                trimSheetUrl,
                this.scene,
                false, // noMipmap
                true,  // invertY
                BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
                () => {
                    console.log('Mech trim sheet loaded successfully');
                    resolve();
                },
                (message, exception) => {
                    console.error('Failed to load mech trim sheet:', message);
                    reject(exception);
                }
            );

            // Set texture properties
            this.textures.diffuse.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
            this.textures.diffuse.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        });
    }

    /**
     * Initialize from a canvas element (for procedurally generated textures)
     * @param {HTMLCanvasElement} canvas - Canvas with the texture
     */
    initializeFromCanvas(canvas) {
        this.textures.diffuse = BABYLON.Texture.LoadFromDataString(
            'mechTrimSheet',
            canvas.toDataURL('image/png'),
            this.scene
        );
        this.textures.diffuse.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        this.textures.diffuse.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    }

    /**
     * Initialize from an Image/HTMLImageElement
     * @param {HTMLImageElement} image - Image element with the texture
     */
    initializeFromImage(image) {
        // Create a canvas from the image
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        this.initializeFromCanvas(canvas);
    }

    /**
     * Create a textured material with team color tinting
     * @param {string} materialType - Type of material (primary, secondary, metal, dark, accent)
     * @param {object} teamColors - Team color object { primary: [r,g,b], secondary: [r,g,b], accent: [r,g,b] }
     * @param {string} mechId - Unique mech identifier for material naming
     * @returns {BABYLON.StandardMaterial} The configured material
     */
    createMaterial(materialType, teamColors, mechId) {
        const cacheKey = `${mechId}_${materialType}`;

        // Check cache first
        if (this.materialCache.has(cacheKey)) {
            return this.materialCache.get(cacheKey);
        }

        const mat = new BABYLON.StandardMaterial(`${mechId}_${materialType}_textured`, this.scene);

        // Apply the trim sheet texture
        if (this.textures.diffuse) {
            mat.diffuseTexture = this.textures.diffuse;
        }

        // Apply team color tinting based on material type
        const tintColor = this.getTintColor(materialType, teamColors);
        mat.diffuseColor = new BABYLON.Color3(tintColor[0], tintColor[1], tintColor[2]);

        // Configure specular based on material type
        const specConfig = this.getSpecularConfig(materialType);
        mat.specularColor = new BABYLON.Color3(specConfig.color, specConfig.color, specConfig.color);
        mat.specularPower = specConfig.power;

        // Cache the material
        this.materialCache.set(cacheKey, mat);

        return mat;
    }

    /**
     * Get tint color for a material type
     */
    getTintColor(materialType, teamColors) {
        switch (materialType) {
            case 'primary':
                // Primary armor gets team primary color
                return teamColors.primary.map(c => c * 1.8 + 0.4); // Brighten for tint
            case 'secondary':
                // Secondary armor gets team secondary color
                return teamColors.secondary.map(c => c * 1.6 + 0.35);
            case 'accent':
                // Accent details get team accent color
                return teamColors.accent.map(c => c * 1.2 + 0.3);
            case 'metal':
                // Metal stays neutral gray (no tinting)
                return [0.85, 0.85, 0.9];
            case 'dark':
                // Dark areas stay dark (minimal tinting)
                return [0.4, 0.4, 0.45];
            case 'glow':
                // Glow uses accent with emissive
                return teamColors.accent.map(c => c * 0.8 + 0.5);
            case 'missile':
                // Missiles stay neutral
                return [0.6, 0.6, 0.65];
            default:
                return [0.7, 0.7, 0.75];
        }
    }

    /**
     * Get specular configuration for a material type
     */
    getSpecularConfig(materialType) {
        const configs = {
            primary: { color: 0.25, power: 24 },
            secondary: { color: 0.2, power: 20 },
            accent: { color: 0.35, power: 28 },
            metal: { color: 0.55, power: 40 },
            dark: { color: 0.1, power: 16 },
            glow: { color: 0.4, power: 32 },
            missile: { color: 0.15, power: 18 }
        };
        return configs[materialType] || configs.primary;
    }

    /**
     * Create a full material set for a mech
     * @param {object} teamColors - Team color object
     * @param {string} mechId - Unique mech identifier
     * @returns {object} Object containing all material types
     */
    createMaterialSet(teamColors, mechId) {
        const mats = {};
        const types = ['primary', 'secondary', 'accent', 'metal', 'dark', 'glow', 'missile'];

        types.forEach(type => {
            mats[type] = this.createMaterial(type, teamColors, mechId);
        });

        return mats;
    }

    /**
     * Get UV coordinates for a specific region
     * @param {string} regionName - Name of the UV region
     * @returns {object} UV region {u, v, w, h}
     */
    getUVRegion(regionName) {
        return this.uvRegions[regionName] || this.uvRegions.default;
    }

    /**
     * Apply UV mapping to a mesh for a specific region
     * @param {BABYLON.Mesh} mesh - The mesh to apply UVs to
     * @param {string} regionName - Name of the UV region to use
     */
    applyUVRegion(mesh, regionName) {
        const region = this.getUVRegion(regionName);

        // Get current UVs
        const uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
        if (!uvs) return;

        // Remap UVs to the specified region
        const newUvs = [];
        for (let i = 0; i < uvs.length; i += 2) {
            // Normalize current UV to 0-1 range, then map to region
            const u = uvs[i] % 1;
            const v = uvs[i + 1] % 1;

            newUvs.push(region.u + u * region.w);
            newUvs.push(region.v + v * region.h);
        }

        mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, newUvs);
    }

    /**
     * Randomly select a UV region for a part type
     * @param {string} partType - Type of part (primary, secondary, metal, etc.)
     * @returns {string} Name of the selected UV region
     */
    selectRegionForPart(partType) {
        const regions = this.partMapping[partType] || this.partMapping.primary;
        return regions[Math.floor(Math.random() * regions.length)];
    }

    /**
     * Clear the material cache
     */
    clearCache() {
        this.materialCache.forEach(mat => mat.dispose());
        this.materialCache.clear();
    }

    /**
     * Dispose of all textures and materials
     */
    dispose() {
        this.clearCache();
        Object.values(this.textures).forEach(tex => {
            if (tex) tex.dispose();
        });
        this.textures = {};
    }
}

/**
 * Simplified texture-aware ShapeBuilder that applies UV regions
 */
class TexturedShapeBuilder {
    constructor(scene, materials, mechId, textureSystem) {
        this.scene = scene;
        this.mats = materials;
        this.mechId = mechId;
        this.textureSystem = textureSystem;
        this.partCount = 0;
    }

    name(base) {
        return `${this.mechId}_${base}_${this.partCount++}`;
    }

    // Create a box with automatic UV region assignment
    box(w, h, d, parent, mat = 'primary', uvRegion = null) {
        const mesh = BABYLON.MeshBuilder.CreateBox(this.name('box'), {
            width: w, height: h, depth: d
        }, this.scene);
        mesh.material = this.mats[mat];
        if (parent) mesh.parent = parent;

        // Apply UV region if texture system is available
        if (this.textureSystem && uvRegion) {
            this.textureSystem.applyUVRegion(mesh, uvRegion);
        } else if (this.textureSystem) {
            // Auto-select based on material type
            this.textureSystem.applyUVRegion(mesh, this.textureSystem.selectRegionForPart(mat));
        }

        return mesh;
    }

    // Create a wedge with UV mapping
    wedge(wBottom, wTop, h, d, parent, mat = 'primary', uvRegion = null) {
        const mesh = BABYLON.MeshBuilder.CreateCylinder(this.name('wedge'), {
            diameterBottom: wBottom * 1.414,
            diameterTop: wTop * 1.414,
            height: h,
            tessellation: 4
        }, this.scene);
        mesh.rotation.y = Math.PI / 4;
        mesh.scaling.z = d / wBottom;
        mesh.material = this.mats[mat];
        if (parent) mesh.parent = parent;

        if (this.textureSystem && uvRegion) {
            this.textureSystem.applyUVRegion(mesh, uvRegion);
        } else if (this.textureSystem) {
            this.textureSystem.applyUVRegion(mesh, this.textureSystem.selectRegionForPart(mat));
        }

        return mesh;
    }

    // Cylinder with UV mapping
    cylinder(diameter, height, parent, mat = 'metal', uvRegion = null) {
        const mesh = BABYLON.MeshBuilder.CreateCylinder(this.name('cyl'), {
            diameter: diameter,
            height: height,
            tessellation: 24
        }, this.scene);
        mesh.material = this.mats[mat];
        if (parent) mesh.parent = parent;

        if (this.textureSystem && uvRegion) {
            this.textureSystem.applyUVRegion(mesh, uvRegion);
        } else if (this.textureSystem) {
            this.textureSystem.applyUVRegion(mesh, this.textureSystem.selectRegionForPart(mat));
        }

        return mesh;
    }

    // Sphere with UV mapping
    sphere(diameter, parent, mat = 'dark', uvRegion = null) {
        const mesh = BABYLON.MeshBuilder.CreateSphere(this.name('sph'), {
            diameter: diameter,
            segments: 16
        }, this.scene);
        mesh.material = this.mats[mat];
        if (parent) mesh.parent = parent;

        if (this.textureSystem && uvRegion) {
            this.textureSystem.applyUVRegion(mesh, uvRegion);
        } else if (this.textureSystem) {
            this.textureSystem.applyUVRegion(mesh, this.textureSystem.selectRegionForPart(mat));
        }

        return mesh;
    }

    // Tapered cylinder
    taperedCylinder(dBot, dTop, height, parent, mat = 'metal') {
        const mesh = BABYLON.MeshBuilder.CreateCylinder(this.name('tcyl'), {
            diameterBottom: dBot,
            diameterTop: dTop,
            height: height,
            tessellation: 24
        }, this.scene);
        mesh.material = this.mats[mat];
        if (parent) mesh.parent = parent;

        if (this.textureSystem) {
            this.textureSystem.applyUVRegion(mesh, this.textureSystem.selectRegionForPart(mat));
        }

        return mesh;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MechTextureSystem, TexturedShapeBuilder };
}
