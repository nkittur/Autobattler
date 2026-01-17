/**
 * Mech Texture Generator
 * Creates procedural sci-fi industrial trim sheet textures for mech rendering
 *
 * Generates:
 * - Diffuse map (color/albedo)
 * - Normal map (surface detail/bumpiness)
 * - Roughness map (shininess variation)
 * - Metallic map (metal vs non-metal areas)
 */

class MechTextureGenerator {
    constructor(size = 1024) {
        this.size = size;
        this.cellSize = size / 4; // 4x4 grid of trim sections

        // Create canvases for each map type
        this.diffuseCanvas = document.createElement('canvas');
        this.normalCanvas = document.createElement('canvas');
        this.roughnessCanvas = document.createElement('canvas');
        this.metallicCanvas = document.createElement('canvas');

        [this.diffuseCanvas, this.normalCanvas, this.roughnessCanvas, this.metallicCanvas].forEach(c => {
            c.width = size;
            c.height = size;
        });

        this.diffuseCtx = this.diffuseCanvas.getContext('2d');
        this.normalCtx = this.normalCanvas.getContext('2d');
        this.roughnessCtx = this.roughnessCanvas.getContext('2d');
        this.metallicCtx = this.metallicCanvas.getContext('2d');

        // Seeded random for reproducibility
        this.seed = 12345;
    }

    // Seeded random number generator
    random() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    resetSeed(seed = 12345) {
        this.seed = seed;
    }

    // Generate all texture maps
    generate() {
        this.resetSeed();

        // Fill base colors
        this.fillBase();

        // Generate each trim section in the 4x4 grid
        // Row 0: Heavy armor panels
        this.drawArmorPanel(0, 0, 'heavy');
        this.drawArmorPanel(1, 0, 'angled');
        this.drawArmorPanel(2, 0, 'layered');
        this.drawArmorPanel(3, 0, 'reinforced');

        // Row 1: Mechanical details
        this.drawVents(0, 1, 'horizontal');
        this.drawVents(1, 1, 'vertical');
        this.drawCables(2, 1);
        this.drawPistons(3, 1);

        // Row 2: Surface treatments
        this.drawRivetedPlate(0, 2);
        this.drawWeldedSeams(1, 2);
        this.drawBattleDamage(2, 2);
        this.drawWeatheredMetal(3, 2);

        // Row 3: Technical/greeble
        this.drawTechPanel(0, 3);
        this.drawCircuitry(1, 3);
        this.drawHexPattern(2, 3);
        this.drawGreebleDetail(3, 3);

        return {
            diffuse: this.diffuseCanvas,
            normal: this.normalCanvas,
            roughness: this.roughnessCanvas,
            metallic: this.metallicCanvas
        };
    }

    fillBase() {
        // Base metal color for diffuse
        this.diffuseCtx.fillStyle = '#4a4a52';
        this.diffuseCtx.fillRect(0, 0, this.size, this.size);

        // Neutral normal map (pointing up)
        this.normalCtx.fillStyle = '#8080ff';
        this.normalCtx.fillRect(0, 0, this.size, this.size);

        // Medium roughness
        this.roughnessCtx.fillStyle = '#808080';
        this.roughnessCtx.fillRect(0, 0, this.size, this.size);

        // Full metallic
        this.metallicCtx.fillStyle = '#ffffff';
        this.metallicCtx.fillRect(0, 0, this.size, this.size);
    }

    // Heavy armor panel with beveled edges
    drawArmorPanel(gridX, gridY, style) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.08;
        const bevel = size * 0.06;

        // Panel background - slightly darker
        this.diffuseCtx.fillStyle = '#3d3d44';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Roughness - panels are smoother
        this.roughnessCtx.fillStyle = '#606060';
        this.roughnessCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Draw bevel lighting on normal map
        const normalGrad = this.normalCtx.createLinearGradient(x, y, x + bevel * 2, y + bevel * 2);
        normalGrad.addColorStop(0, '#c0c0ff'); // Light from top-left
        normalGrad.addColorStop(1, '#8080ff');
        this.normalCtx.fillStyle = normalGrad;
        this.normalCtx.fillRect(x + margin, y + margin, size - margin * 2, bevel);
        this.normalCtx.fillRect(x + margin, y + margin, bevel, size - margin * 2);

        // Bottom-right bevel (shadowed)
        const normalGrad2 = this.normalCtx.createLinearGradient(x + size - margin, y + size - margin, x + size - margin - bevel, y + size - margin - bevel);
        normalGrad2.addColorStop(0, '#4040ff');
        normalGrad2.addColorStop(1, '#8080ff');
        this.normalCtx.fillStyle = normalGrad2;
        this.normalCtx.fillRect(x + margin, y + size - margin - bevel, size - margin * 2, bevel);
        this.normalCtx.fillRect(x + size - margin - bevel, y + margin, bevel, size - margin * 2);

        // Style-specific details
        if (style === 'heavy') {
            // Add corner reinforcements
            this.drawCornerBrackets(x, y, size, margin);
        } else if (style === 'angled') {
            // Diagonal line across panel
            this.drawDiagonalRidge(x, y, size, margin);
        } else if (style === 'layered') {
            // Multiple overlapping plates
            this.drawLayeredPlates(x, y, size, margin);
        } else if (style === 'reinforced') {
            // Cross-bracing
            this.drawCrossBracing(x, y, size, margin);
        }

        // Add subtle noise/grain
        this.addNoise(x, y, size, 0.03);
    }

    drawCornerBrackets(x, y, size, margin) {
        const bracketSize = size * 0.15;
        const thickness = size * 0.03;

        // Four corners
        const corners = [
            [x + margin, y + margin],
            [x + size - margin - bracketSize, y + margin],
            [x + margin, y + size - margin - bracketSize],
            [x + size - margin - bracketSize, y + size - margin - bracketSize]
        ];

        this.diffuseCtx.fillStyle = '#2a2a30';
        corners.forEach(([cx, cy], i) => {
            // L-shaped bracket
            this.diffuseCtx.fillRect(cx, cy, bracketSize, thickness);
            this.diffuseCtx.fillRect(cx, cy, thickness, bracketSize);

            // Rivet
            this.drawRivet(cx + bracketSize * 0.3, cy + bracketSize * 0.3, size * 0.02);
        });
    }

    drawDiagonalRidge(x, y, size, margin) {
        this.diffuseCtx.save();
        this.diffuseCtx.strokeStyle = '#555560';
        this.diffuseCtx.lineWidth = size * 0.04;
        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(x + margin, y + size * 0.7);
        this.diffuseCtx.lineTo(x + size * 0.7, y + margin);
        this.diffuseCtx.stroke();
        this.diffuseCtx.restore();

        // Normal map ridge
        this.normalCtx.save();
        this.normalCtx.strokeStyle = '#a0a0ff';
        this.normalCtx.lineWidth = size * 0.02;
        this.normalCtx.beginPath();
        this.normalCtx.moveTo(x + margin, y + size * 0.7);
        this.normalCtx.lineTo(x + size * 0.7, y + margin);
        this.normalCtx.stroke();
        this.normalCtx.restore();
    }

    drawLayeredPlates(x, y, size, margin) {
        for (let i = 0; i < 3; i++) {
            const offset = i * size * 0.12;
            const plateSize = size * 0.35;
            const px = x + margin + offset;
            const py = y + margin + offset;

            this.diffuseCtx.fillStyle = i % 2 === 0 ? '#454550' : '#3a3a42';
            this.diffuseCtx.fillRect(px, py, plateSize, plateSize);

            // Edge highlight
            this.normalCtx.fillStyle = '#a0a0ff';
            this.normalCtx.fillRect(px, py, plateSize, 2);
            this.normalCtx.fillRect(px, py, 2, plateSize);
        }
    }

    drawCrossBracing(x, y, size, margin) {
        const cx = x + size / 2;
        const cy = y + size / 2;
        const len = size * 0.35;
        const thick = size * 0.025;

        this.diffuseCtx.fillStyle = '#353540';
        // Horizontal bar
        this.diffuseCtx.fillRect(cx - len, cy - thick / 2, len * 2, thick);
        // Vertical bar
        this.diffuseCtx.fillRect(cx - thick / 2, cy - len, thick, len * 2);

        // Center rivet
        this.drawRivet(cx, cy, size * 0.03);
    }

    drawRivet(x, y, radius) {
        // Diffuse - dark center
        this.diffuseCtx.beginPath();
        this.diffuseCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.diffuseCtx.fillStyle = '#2a2a30';
        this.diffuseCtx.fill();

        // Normal map - raised bump
        const grad = this.normalCtx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
        grad.addColorStop(0, '#c0c0ff');
        grad.addColorStop(0.5, '#9090ff');
        grad.addColorStop(1, '#6060ff');
        this.normalCtx.beginPath();
        this.normalCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.normalCtx.fillStyle = grad;
        this.normalCtx.fill();

        // Roughness - rivets are smoother
        this.roughnessCtx.beginPath();
        this.roughnessCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.roughnessCtx.fillStyle = '#404040';
        this.roughnessCtx.fill();
    }

    drawVents(gridX, gridY, orientation) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.1;

        // Vent housing
        this.diffuseCtx.fillStyle = '#2d2d35';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Vent slats
        const slats = 8;
        const slatMargin = size * 0.15;
        const slatArea = size - slatMargin * 2;
        const slatSpacing = slatArea / slats;

        for (let i = 0; i < slats; i++) {
            if (orientation === 'horizontal') {
                const sy = y + slatMargin + i * slatSpacing;
                // Dark slot
                this.diffuseCtx.fillStyle = '#151518';
                this.diffuseCtx.fillRect(x + slatMargin, sy, slatArea, slatSpacing * 0.5);
                // Slat surface
                this.diffuseCtx.fillStyle = '#4a4a52';
                this.diffuseCtx.fillRect(x + slatMargin, sy + slatSpacing * 0.5, slatArea, slatSpacing * 0.4);

                // Normal map for slats
                this.normalCtx.fillStyle = '#6060ff'; // Facing down into slot
                this.normalCtx.fillRect(x + slatMargin, sy, slatArea, slatSpacing * 0.3);
                this.normalCtx.fillStyle = '#a0a0ff'; // Top of slat
                this.normalCtx.fillRect(x + slatMargin, sy + slatSpacing * 0.5, slatArea, slatSpacing * 0.2);
            } else {
                const sx = x + slatMargin + i * slatSpacing;
                this.diffuseCtx.fillStyle = '#151518';
                this.diffuseCtx.fillRect(sx, y + slatMargin, slatSpacing * 0.5, slatArea);
                this.diffuseCtx.fillStyle = '#4a4a52';
                this.diffuseCtx.fillRect(sx + slatSpacing * 0.5, y + slatMargin, slatSpacing * 0.4, slatArea);

                this.normalCtx.fillStyle = '#60ff80'; // Facing left into slot
                this.normalCtx.fillRect(sx, y + slatMargin, slatSpacing * 0.3, slatArea);
                this.normalCtx.fillStyle = '#a080ff';
                this.normalCtx.fillRect(sx + slatSpacing * 0.5, y + slatMargin, slatSpacing * 0.2, slatArea);
            }
        }

        // Less metallic in slots
        this.metallicCtx.fillStyle = '#606060';
        this.metallicCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Very rough in slots (matte black)
        this.roughnessCtx.fillStyle = '#d0d0d0';
        this.roughnessCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);
    }

    drawCables(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.1;

        // Background panel
        this.diffuseCtx.fillStyle = '#303038';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Draw multiple cables
        const cableCount = 5;
        const cableRadius = size * 0.04;

        for (let i = 0; i < cableCount; i++) {
            const cx = x + margin + size * 0.15 + (i * size * 0.15);
            const startY = y + margin;
            const endY = y + size - margin;

            // Cable color (varies)
            const colors = ['#1a1a20', '#252530', '#2a2530', '#201a25', '#1a2025'];
            this.diffuseCtx.fillStyle = colors[i];

            // Draw wavy cable
            this.diffuseCtx.beginPath();
            this.diffuseCtx.moveTo(cx - cableRadius, startY);

            for (let py = startY; py <= endY; py += 4) {
                const wave = Math.sin((py - startY) * 0.05 + i * 0.5) * size * 0.02;
                this.diffuseCtx.lineTo(cx + wave - cableRadius, py);
            }
            for (let py = endY; py >= startY; py -= 4) {
                const wave = Math.sin((py - startY) * 0.05 + i * 0.5) * size * 0.02;
                this.diffuseCtx.lineTo(cx + wave + cableRadius, py);
            }
            this.diffuseCtx.closePath();
            this.diffuseCtx.fill();

            // Normal map - rounded cable profile
            for (let py = startY; py <= endY; py += 2) {
                const wave = Math.sin((py - startY) * 0.05 + i * 0.5) * size * 0.02;
                const grad = this.normalCtx.createLinearGradient(
                    cx + wave - cableRadius, py,
                    cx + wave + cableRadius, py
                );
                grad.addColorStop(0, '#6080ff');
                grad.addColorStop(0.5, '#a0a0ff');
                grad.addColorStop(1, '#a080ff');
                this.normalCtx.fillStyle = grad;
                this.normalCtx.fillRect(cx + wave - cableRadius, py, cableRadius * 2, 2);
            }
        }

        // Cables are rubber, not metal
        this.metallicCtx.fillStyle = '#202020';
        for (let i = 0; i < cableCount; i++) {
            const cx = x + margin + size * 0.15 + (i * size * 0.15);
            this.metallicCtx.beginPath();
            this.metallicCtx.arc(cx, y + size / 2, cableRadius * 1.5, 0, Math.PI * 2);
            this.metallicCtx.fill();
        }

        // Rough rubber texture
        this.roughnessCtx.fillStyle = '#909090';
        this.roughnessCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);
    }

    drawPistons(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.1;

        // Background
        this.diffuseCtx.fillStyle = '#353540';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Draw 2 pistons
        for (let i = 0; i < 2; i++) {
            const px = x + size * 0.25 + i * size * 0.45;
            const py = y + margin * 1.5;
            const pWidth = size * 0.15;
            const pHeight = size * 0.7;

            // Cylinder housing (darker)
            this.diffuseCtx.fillStyle = '#2a2a32';
            this.diffuseCtx.fillRect(px - pWidth * 0.6, py, pWidth * 1.2, pHeight);

            // Piston rod (shiny)
            const grad = this.diffuseCtx.createLinearGradient(px - pWidth / 2, py, px + pWidth / 2, py);
            grad.addColorStop(0, '#505058');
            grad.addColorStop(0.3, '#707078');
            grad.addColorStop(0.5, '#858590');
            grad.addColorStop(0.7, '#707078');
            grad.addColorStop(1, '#505058');
            this.diffuseCtx.fillStyle = grad;
            this.diffuseCtx.fillRect(px - pWidth / 2, py + pHeight * 0.1, pWidth, pHeight * 0.6);

            // End caps
            this.diffuseCtx.fillStyle = '#404048';
            this.diffuseCtx.fillRect(px - pWidth * 0.7, py, pWidth * 1.4, pHeight * 0.08);
            this.diffuseCtx.fillRect(px - pWidth * 0.7, py + pHeight * 0.92, pWidth * 1.4, pHeight * 0.08);

            // Normal map - cylindrical
            const normalGrad = this.normalCtx.createLinearGradient(px - pWidth / 2, py, px + pWidth / 2, py);
            normalGrad.addColorStop(0, '#6080ff');
            normalGrad.addColorStop(0.5, '#8080ff');
            normalGrad.addColorStop(1, '#a080ff');
            this.normalCtx.fillStyle = normalGrad;
            this.normalCtx.fillRect(px - pWidth / 2, py, pWidth, pHeight);

            // Piston rod is very smooth/shiny
            this.roughnessCtx.fillStyle = '#303030';
            this.roughnessCtx.fillRect(px - pWidth / 2, py + pHeight * 0.1, pWidth, pHeight * 0.6);
        }
    }

    drawRivetedPlate(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.08;

        // Base plate
        this.diffuseCtx.fillStyle = '#454550';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Rivet grid
        const rivetSpacing = size * 0.12;
        const rivetRadius = size * 0.018;

        for (let rx = x + margin + rivetSpacing; rx < x + size - margin; rx += rivetSpacing) {
            for (let ry = y + margin + rivetSpacing; ry < y + size - margin; ry += rivetSpacing) {
                this.drawRivet(rx, ry, rivetRadius);
            }
        }

        // Add some scratches
        this.addScratches(x, y, size, 8);
    }

    drawWeldedSeams(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.08;

        // Two plates meeting
        this.diffuseCtx.fillStyle = '#424248';
        this.diffuseCtx.fillRect(x + margin, y + margin, size / 2 - margin, size - margin * 2);
        this.diffuseCtx.fillStyle = '#3e3e44';
        this.diffuseCtx.fillRect(x + size / 2, y + margin, size / 2 - margin, size - margin * 2);

        // Weld seam down the middle
        const seamX = x + size / 2;
        const seamWidth = size * 0.04;

        // Weld bead (bumpy, irregular)
        this.diffuseCtx.fillStyle = '#555560';
        for (let sy = y + margin; sy < y + size - margin; sy += 3) {
            const wobble = (this.random() - 0.5) * seamWidth * 0.5;
            const width = seamWidth * (0.8 + this.random() * 0.4);
            this.diffuseCtx.fillRect(seamX - width / 2 + wobble, sy, width, 4);
        }

        // Normal map for weld - raised bumpy line
        for (let sy = y + margin; sy < y + size - margin; sy += 2) {
            const wobble = (this.random() - 0.5) * seamWidth * 0.3;
            this.normalCtx.fillStyle = `rgb(${128 + this.random() * 40}, ${128 + this.random() * 40}, 255)`;
            this.normalCtx.fillRect(seamX - seamWidth / 2 + wobble, sy, seamWidth, 3);
        }

        // Weld is rougher
        this.roughnessCtx.fillStyle = '#a0a0a0';
        this.roughnessCtx.fillRect(seamX - seamWidth, y + margin, seamWidth * 2, size - margin * 2);
    }

    drawBattleDamage(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.08;

        // Base damaged plate
        this.diffuseCtx.fillStyle = '#404048';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Bullet impacts / dents
        const impacts = 5;
        for (let i = 0; i < impacts; i++) {
            const ix = x + margin + this.random() * (size - margin * 3);
            const iy = y + margin + this.random() * (size - margin * 3);
            const ir = size * 0.03 + this.random() * size * 0.04;

            // Dark center (bare metal or scorch)
            this.diffuseCtx.beginPath();
            this.diffuseCtx.arc(ix, iy, ir, 0, Math.PI * 2);
            this.diffuseCtx.fillStyle = '#252528';
            this.diffuseCtx.fill();

            // Surrounding damage ring
            this.diffuseCtx.beginPath();
            this.diffuseCtx.arc(ix, iy, ir * 1.5, 0, Math.PI * 2);
            this.diffuseCtx.strokeStyle = '#353538';
            this.diffuseCtx.lineWidth = 2;
            this.diffuseCtx.stroke();

            // Normal map - crater
            const grad = this.normalCtx.createRadialGradient(ix, iy, 0, ix, iy, ir * 1.5);
            grad.addColorStop(0, '#5050ff'); // Pointing into crater
            grad.addColorStop(0.6, '#8080ff');
            grad.addColorStop(0.8, '#b0b0ff'); // Rim
            grad.addColorStop(1, '#8080ff');
            this.normalCtx.beginPath();
            this.normalCtx.arc(ix, iy, ir * 1.5, 0, Math.PI * 2);
            this.normalCtx.fillStyle = grad;
            this.normalCtx.fill();
        }

        // Scratches and gouges
        this.addScratches(x, y, size, 15);

        // Damaged areas are rougher
        this.roughnessCtx.fillStyle = '#b0b0b0';
        this.roughnessCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);
    }

    drawWeatheredMetal(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.08;

        // Base weathered metal
        this.diffuseCtx.fillStyle = '#4a4a50';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Rust spots
        const rustSpots = 8;
        for (let i = 0; i < rustSpots; i++) {
            const rx = x + margin + this.random() * (size - margin * 3);
            const ry = y + margin + this.random() * (size - margin * 3);
            const rw = size * 0.08 + this.random() * size * 0.12;
            const rh = size * 0.06 + this.random() * size * 0.1;

            // Rust color gradient
            const rustGrad = this.diffuseCtx.createRadialGradient(rx, ry, 0, rx, ry, Math.max(rw, rh));
            rustGrad.addColorStop(0, '#6b4423');
            rustGrad.addColorStop(0.5, '#7a4a28');
            rustGrad.addColorStop(1, '#4a4a50');

            this.diffuseCtx.fillStyle = rustGrad;
            this.diffuseCtx.beginPath();
            this.diffuseCtx.ellipse(rx, ry, rw, rh, this.random() * Math.PI, 0, Math.PI * 2);
            this.diffuseCtx.fill();

            // Rust is not metallic
            this.metallicCtx.fillStyle = '#404040';
            this.metallicCtx.beginPath();
            this.metallicCtx.ellipse(rx, ry, rw * 0.8, rh * 0.8, 0, 0, Math.PI * 2);
            this.metallicCtx.fill();

            // Rust is rough
            this.roughnessCtx.fillStyle = '#c0c0c0';
            this.roughnessCtx.beginPath();
            this.roughnessCtx.ellipse(rx, ry, rw, rh, 0, 0, Math.PI * 2);
            this.roughnessCtx.fill();
        }

        // Paint chips
        for (let i = 0; i < 12; i++) {
            const px = x + margin + this.random() * (size - margin * 2);
            const py = y + margin + this.random() * (size - margin * 2);
            const pw = 2 + this.random() * 6;
            const ph = 2 + this.random() * 4;

            this.diffuseCtx.fillStyle = '#5a5a62';
            this.diffuseCtx.fillRect(px, py, pw, ph);
        }

        // Add noise
        this.addNoise(x, y, size, 0.05);
    }

    drawTechPanel(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.1;

        // Dark tech panel background
        this.diffuseCtx.fillStyle = '#252530';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Screen/display area
        const screenMargin = size * 0.2;
        this.diffuseCtx.fillStyle = '#101520';
        this.diffuseCtx.fillRect(x + screenMargin, y + screenMargin, size - screenMargin * 2, size * 0.4);

        // Screen glow (emissive hint in diffuse)
        const screenGlow = this.diffuseCtx.createLinearGradient(
            x + screenMargin, y + screenMargin,
            x + screenMargin, y + screenMargin + size * 0.4
        );
        screenGlow.addColorStop(0, '#152535');
        screenGlow.addColorStop(0.5, '#1a3040');
        screenGlow.addColorStop(1, '#152535');
        this.diffuseCtx.fillStyle = screenGlow;
        this.diffuseCtx.fillRect(x + screenMargin + 4, y + screenMargin + 4, size - screenMargin * 2 - 8, size * 0.4 - 8);

        // Buttons below screen
        const buttonY = y + size * 0.65;
        const buttonSize = size * 0.06;
        for (let i = 0; i < 4; i++) {
            const bx = x + screenMargin + i * (buttonSize * 2);

            this.diffuseCtx.fillStyle = '#1a1a22';
            this.diffuseCtx.fillRect(bx, buttonY, buttonSize, buttonSize);

            // Button highlight
            this.normalCtx.fillStyle = '#9090ff';
            this.normalCtx.fillRect(bx, buttonY, buttonSize, 2);
        }

        // Status LEDs
        const ledY = y + size * 0.78;
        const ledColors = ['#20ff40', '#ff4020', '#ffff20'];
        for (let i = 0; i < 3; i++) {
            const lx = x + size * 0.7 + i * size * 0.08;
            this.diffuseCtx.beginPath();
            this.diffuseCtx.arc(lx, ledY, size * 0.015, 0, Math.PI * 2);
            this.diffuseCtx.fillStyle = ledColors[i];
            this.diffuseCtx.fill();
        }

        // Tech panels are smooth
        this.roughnessCtx.fillStyle = '#404040';
        this.roughnessCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Screen is not metallic
        this.metallicCtx.fillStyle = '#000000';
        this.metallicCtx.fillRect(x + screenMargin, y + screenMargin, size - screenMargin * 2, size * 0.4);
    }

    drawCircuitry(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.1;

        // PCB-like background
        this.diffuseCtx.fillStyle = '#1a3025';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Circuit traces
        this.diffuseCtx.strokeStyle = '#4a6050';
        this.diffuseCtx.lineWidth = 2;

        // Create grid of connection points
        const gridSize = 6;
        const spacing = (size - margin * 2) / gridSize;

        for (let gx = 0; gx < gridSize; gx++) {
            for (let gy = 0; gy < gridSize; gy++) {
                const px = x + margin + gx * spacing + spacing / 2;
                const py = y + margin + gy * spacing + spacing / 2;

                // Connection point (solder pad)
                this.diffuseCtx.beginPath();
                this.diffuseCtx.arc(px, py, 3, 0, Math.PI * 2);
                this.diffuseCtx.fillStyle = '#708070';
                this.diffuseCtx.fill();

                // Random traces to neighbors
                if (this.random() > 0.5 && gx < gridSize - 1) {
                    this.diffuseCtx.beginPath();
                    this.diffuseCtx.moveTo(px + 3, py);
                    this.diffuseCtx.lineTo(px + spacing - 3, py);
                    this.diffuseCtx.stroke();
                }
                if (this.random() > 0.5 && gy < gridSize - 1) {
                    this.diffuseCtx.beginPath();
                    this.diffuseCtx.moveTo(px, py + 3);
                    this.diffuseCtx.lineTo(px, py + spacing - 3);
                    this.diffuseCtx.stroke();
                }
            }
        }

        // Chips/components
        for (let i = 0; i < 3; i++) {
            const cx = x + margin + size * 0.2 + this.random() * size * 0.5;
            const cy = y + margin + size * 0.2 + this.random() * size * 0.5;
            const cw = size * 0.1 + this.random() * size * 0.1;
            const ch = size * 0.08;

            this.diffuseCtx.fillStyle = '#151518';
            this.diffuseCtx.fillRect(cx, cy, cw, ch);

            // Chip marking
            this.diffuseCtx.fillStyle = '#252528';
            this.diffuseCtx.fillRect(cx + 2, cy + 2, cw * 0.3, ch - 4);
        }

        // PCB is not metallic
        this.metallicCtx.fillStyle = '#202020';
        this.metallicCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Matte finish
        this.roughnessCtx.fillStyle = '#909090';
        this.roughnessCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);
    }

    drawHexPattern(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.08;

        // Background
        this.diffuseCtx.fillStyle = '#3a3a42';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Hex grid
        const hexRadius = size * 0.06;
        const hexHeight = hexRadius * Math.sqrt(3);

        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 5; col++) {
                const hx = x + margin + col * hexRadius * 1.5 + size * 0.15 + (row % 2) * hexRadius * 0.75;
                const hy = y + margin + row * hexHeight * 0.55 + size * 0.12;

                this.drawHexagon(hx, hy, hexRadius * 0.9);
            }
        }
    }

    drawHexagon(cx, cy, radius) {
        // Hexagon path
        this.diffuseCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = cx + radius * Math.cos(angle);
            const hy = cy + radius * Math.sin(angle);
            if (i === 0) this.diffuseCtx.moveTo(hx, hy);
            else this.diffuseCtx.lineTo(hx, hy);
        }
        this.diffuseCtx.closePath();

        // Fill with gradient for depth
        const grad = this.diffuseCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, '#4a4a52');
        grad.addColorStop(1, '#35353d');
        this.diffuseCtx.fillStyle = grad;
        this.diffuseCtx.fill();

        // Edge
        this.diffuseCtx.strokeStyle = '#2a2a32';
        this.diffuseCtx.lineWidth = 1;
        this.diffuseCtx.stroke();

        // Normal map - faceted surface
        this.normalCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = cx + radius * Math.cos(angle);
            const hy = cy + radius * Math.sin(angle);
            if (i === 0) this.normalCtx.moveTo(hx, hy);
            else this.normalCtx.lineTo(hx, hy);
        }
        this.normalCtx.closePath();
        this.normalCtx.fillStyle = '#9090ff';
        this.normalCtx.fill();
    }

    drawGreebleDetail(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.08;

        // Base panel
        this.diffuseCtx.fillStyle = '#404048';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Random greeble boxes
        for (let i = 0; i < 15; i++) {
            const gx = x + margin + this.random() * (size - margin * 3);
            const gy = y + margin + this.random() * (size - margin * 3);
            const gw = size * 0.05 + this.random() * size * 0.12;
            const gh = size * 0.04 + this.random() * size * 0.1;

            const shade = 0.2 + this.random() * 0.25;
            this.diffuseCtx.fillStyle = `rgb(${shade * 255 * 0.8}, ${shade * 255 * 0.8}, ${shade * 255 * 0.9})`;
            this.diffuseCtx.fillRect(gx, gy, gw, gh);

            // Raised edge on normal map
            if (this.random() > 0.5) {
                this.normalCtx.fillStyle = '#a0a0ff';
                this.normalCtx.fillRect(gx, gy, gw, 2);
                this.normalCtx.fillRect(gx, gy, 2, gh);
            }
        }

        // Some pipes
        for (let i = 0; i < 3; i++) {
            const py = y + margin + size * 0.2 + i * size * 0.25;
            const pRadius = size * 0.02 + this.random() * size * 0.02;

            const pipeGrad = this.diffuseCtx.createLinearGradient(x, py - pRadius, x, py + pRadius);
            pipeGrad.addColorStop(0, '#505058');
            pipeGrad.addColorStop(0.5, '#656570');
            pipeGrad.addColorStop(1, '#404048');

            this.diffuseCtx.fillStyle = pipeGrad;
            this.diffuseCtx.fillRect(x + margin, py - pRadius, size - margin * 2, pRadius * 2);
        }

        // Rivets scattered
        for (let i = 0; i < 8; i++) {
            const rx = x + margin + this.random() * (size - margin * 2);
            const ry = y + margin + this.random() * (size - margin * 2);
            this.drawRivet(rx, ry, size * 0.015);
        }
    }

    addScratches(x, y, size, count) {
        this.diffuseCtx.strokeStyle = '#5a5a62';
        this.diffuseCtx.lineWidth = 1;

        for (let i = 0; i < count; i++) {
            const sx = x + this.random() * size;
            const sy = y + this.random() * size;
            const len = size * 0.05 + this.random() * size * 0.15;
            const angle = this.random() * Math.PI * 2;

            this.diffuseCtx.beginPath();
            this.diffuseCtx.moveTo(sx, sy);
            this.diffuseCtx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
            this.diffuseCtx.stroke();

            // Scratch on normal map
            this.normalCtx.strokeStyle = '#7070ff';
            this.normalCtx.lineWidth = 1;
            this.normalCtx.beginPath();
            this.normalCtx.moveTo(sx, sy);
            this.normalCtx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
            this.normalCtx.stroke();
        }
    }

    addNoise(x, y, size, intensity) {
        const imageData = this.diffuseCtx.getImageData(x, y, size, size);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (this.random() - 0.5) * intensity * 255;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }

        this.diffuseCtx.putImageData(imageData, x, y);
    }

    // Get data URLs for all maps
    getDataURLs() {
        return {
            diffuse: this.diffuseCanvas.toDataURL('image/png'),
            normal: this.normalCanvas.toDataURL('image/png'),
            roughness: this.roughnessCanvas.toDataURL('image/png'),
            metallic: this.metallicCanvas.toDataURL('image/png')
        };
    }

    // Save canvases to downloadable files
    downloadAll(prefix = 'mech_texture') {
        const maps = this.getDataURLs();

        Object.entries(maps).forEach(([name, dataUrl]) => {
            const link = document.createElement('a');
            link.download = `${prefix}_${name}.png`;
            link.href = dataUrl;
            link.click();
        });
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MechTextureGenerator;
}
