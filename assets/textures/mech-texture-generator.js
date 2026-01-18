/**
 * Mech Texture Generator v2
 * Creates futuristic sci-fi mech armor textures
 *
 * Design Goals:
 * - Clean, futuristic aesthetic (Gundam, Titanfall style)
 * - Subtle panel lines and bevels
 * - Hexagonal patterns for sci-fi feel
 * - Edge highlights and subtle wear (Star Wars style)
 * - Designed to work WITH team colors, not replace them
 */

class MechTextureGenerator {
    constructor(size = 1024) {
        console.log('[TextureGen] Constructor called with size:', size);
        this.size = size;
        this.cellSize = size / 4; // 4x4 grid of trim sections

        // Create canvases for each map type
        this.diffuseCanvas = document.createElement('canvas');
        this.normalCanvas = document.createElement('canvas');

        [this.diffuseCanvas, this.normalCanvas].forEach(c => {
            c.width = size;
            c.height = size;
        });

        this.diffuseCtx = this.diffuseCanvas.getContext('2d');
        this.normalCtx = this.normalCanvas.getContext('2d');

        console.log('[TextureGen] Canvas created:', {
            diffuseCanvas: !!this.diffuseCanvas,
            normalCanvas: !!this.normalCanvas,
            diffuseCtx: !!this.diffuseCtx,
            normalCtx: !!this.normalCtx,
            canvasWidth: this.diffuseCanvas.width,
            canvasHeight: this.diffuseCanvas.height
        });

        // Seeded random for reproducibility
        this.seed = 12345;
    }

    random() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }

    resetSeed(seed = 12345) {
        this.seed = seed;
    }

    // Generate all texture maps
    generate() {
        console.log('[TextureGen] generate() called');
        try {
            this.resetSeed();
            this.fillBase();

            // Row 0: Clean armor panels
            this.drawCleanArmorPanel(0, 0, 'standard');
            this.drawCleanArmorPanel(1, 0, 'beveled');
            this.drawCleanArmorPanel(2, 0, 'segmented');
            this.drawCleanArmorPanel(3, 0, 'angular');

            // Row 1: Hexagonal and geometric patterns
            this.drawHexArmorPanel(0, 1);
            this.drawDiamondPlate(1, 1);
            this.drawTechLines(2, 1);
            this.drawVentSlats(3, 1);

            // Row 2: Mechanical details
            this.drawJointTexture(0, 2);
            this.drawPistonHousing(1, 2);
            this.drawCableChannel(2, 2);
            this.drawThrusterNozzle(3, 2);

            // Row 3: Accent and detail panels
            this.drawAccentStripe(0, 3);
            this.drawStatusPanel(1, 3);
            this.drawEdgeWear(2, 3);
            this.drawMetallicPlain(3, 3);

            // Debug: Check if canvas has actual content
            const imageData = this.diffuseCtx.getImageData(0, 0, 10, 10);
            const hasContent = imageData.data.some((v, i) => i % 4 !== 3 && v !== 0);
            console.log('[TextureGen] generate() complete:', {
                hasContent,
                samplePixel: Array.from(imageData.data.slice(0, 4)),
                canvasSize: `${this.diffuseCanvas.width}x${this.diffuseCanvas.height}`
            });

            return {
                diffuse: this.diffuseCanvas,
                normal: this.normalCanvas
            };
        } catch (error) {
            console.error('[TextureGen] generate() FAILED:', error);
            throw error;
        }
    }

    fillBase() {
        // Base is neutral gray - team colors will tint this
        // Using mid-gray so colors can go lighter or darker
        this.diffuseCtx.fillStyle = '#808080';
        this.diffuseCtx.fillRect(0, 0, this.size, this.size);

        // Neutral normal map
        this.normalCtx.fillStyle = '#8080ff';
        this.normalCtx.fillRect(0, 0, this.size, this.size);
    }

    // ==========================================
    // ROW 0: CLEAN ARMOR PANELS
    // ==========================================

    drawCleanArmorPanel(gridX, gridY, style) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.04;

        // Main panel - slightly lighter than base for visibility
        this.diffuseCtx.fillStyle = '#8a8a8a';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Panel edge - dark recessed line
        this.diffuseCtx.strokeStyle = '#505050';
        this.diffuseCtx.lineWidth = 2;
        this.diffuseCtx.strokeRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Inner bevel highlight (top-left edges catch light)
        this.diffuseCtx.strokeStyle = '#a0a0a0';
        this.diffuseCtx.lineWidth = 1;
        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(x + margin + 3, y + size - margin);
        this.diffuseCtx.lineTo(x + margin + 3, y + margin + 3);
        this.diffuseCtx.lineTo(x + size - margin, y + margin + 3);
        this.diffuseCtx.stroke();

        // Normal map - raised panel edges
        this.drawPanelNormal(x + margin, y + margin, size - margin * 2, size - margin * 2);

        if (style === 'beveled') {
            // Add corner bevels
            this.drawCornerBevels(x, y, size, margin);
        } else if (style === 'segmented') {
            // Add horizontal segment lines
            this.drawSegmentLines(x, y, size, margin, 3);
        } else if (style === 'angular') {
            // Add diagonal accent line
            this.drawAngularAccent(x, y, size, margin);
        }

        // Subtle surface variation
        this.addSubtleNoise(x + margin, y + margin, size - margin * 2, 0.02);
    }

    drawPanelNormal(x, y, w, h) {
        const bevel = 4;

        // Top edge - facing up
        this.normalCtx.fillStyle = '#8090ff';
        this.normalCtx.fillRect(x, y, w, bevel);

        // Left edge - facing left
        this.normalCtx.fillStyle = '#9080ff';
        this.normalCtx.fillRect(x, y, bevel, h);

        // Bottom edge - facing down
        this.normalCtx.fillStyle = '#8070ff';
        this.normalCtx.fillRect(x, y + h - bevel, w, bevel);

        // Right edge - facing right
        this.normalCtx.fillStyle = '#7080ff';
        this.normalCtx.fillRect(x + w - bevel, y, bevel, h);
    }

    drawCornerBevels(x, y, size, margin) {
        const bevelSize = size * 0.08;

        // Cut corners with darker triangles
        this.diffuseCtx.fillStyle = '#707070';

        // Top-left
        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(x + margin, y + margin);
        this.diffuseCtx.lineTo(x + margin + bevelSize, y + margin);
        this.diffuseCtx.lineTo(x + margin, y + margin + bevelSize);
        this.diffuseCtx.closePath();
        this.diffuseCtx.fill();

        // Top-right
        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(x + size - margin, y + margin);
        this.diffuseCtx.lineTo(x + size - margin - bevelSize, y + margin);
        this.diffuseCtx.lineTo(x + size - margin, y + margin + bevelSize);
        this.diffuseCtx.closePath();
        this.diffuseCtx.fill();

        // Bottom corners
        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(x + margin, y + size - margin);
        this.diffuseCtx.lineTo(x + margin + bevelSize, y + size - margin);
        this.diffuseCtx.lineTo(x + margin, y + size - margin - bevelSize);
        this.diffuseCtx.closePath();
        this.diffuseCtx.fill();

        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(x + size - margin, y + size - margin);
        this.diffuseCtx.lineTo(x + size - margin - bevelSize, y + size - margin);
        this.diffuseCtx.lineTo(x + size - margin, y + size - margin - bevelSize);
        this.diffuseCtx.closePath();
        this.diffuseCtx.fill();
    }

    drawSegmentLines(x, y, size, margin, segments) {
        const segmentHeight = (size - margin * 2) / segments;

        this.diffuseCtx.strokeStyle = '#606060';
        this.diffuseCtx.lineWidth = 1;

        for (let i = 1; i < segments; i++) {
            const ly = y + margin + i * segmentHeight;
            this.diffuseCtx.beginPath();
            this.diffuseCtx.moveTo(x + margin + 5, ly);
            this.diffuseCtx.lineTo(x + size - margin - 5, ly);
            this.diffuseCtx.stroke();

            // Highlight below line
            this.diffuseCtx.strokeStyle = '#959595';
            this.diffuseCtx.beginPath();
            this.diffuseCtx.moveTo(x + margin + 5, ly + 1);
            this.diffuseCtx.lineTo(x + size - margin - 5, ly + 1);
            this.diffuseCtx.stroke();
            this.diffuseCtx.strokeStyle = '#606060';
        }
    }

    drawAngularAccent(x, y, size, margin) {
        // Diagonal stripe across panel
        this.diffuseCtx.fillStyle = '#757575';
        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(x + margin, y + size * 0.6);
        this.diffuseCtx.lineTo(x + margin, y + size * 0.7);
        this.diffuseCtx.lineTo(x + size - margin, y + size * 0.3);
        this.diffuseCtx.lineTo(x + size - margin, y + size * 0.2);
        this.diffuseCtx.closePath();
        this.diffuseCtx.fill();
    }

    // ==========================================
    // ROW 1: HEXAGONAL AND GEOMETRIC
    // ==========================================

    drawHexArmorPanel(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.04;

        // Background
        this.diffuseCtx.fillStyle = '#858585';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Hex grid
        const hexRadius = size * 0.07;
        const hexHeight = hexRadius * Math.sqrt(3);
        const cols = 5;
        const rows = 5;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const hx = x + margin + size * 0.12 + col * hexRadius * 1.55 + (row % 2) * hexRadius * 0.775;
                const hy = y + margin + size * 0.12 + row * hexHeight * 0.9;

                if (hx < x + size - margin - hexRadius && hy < y + size - margin - hexRadius) {
                    this.drawHexagon(hx, hy, hexRadius * 0.85);
                }
            }
        }
    }

    drawHexagon(cx, cy, radius) {
        // Hex outline (recessed)
        this.diffuseCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = cx + radius * Math.cos(angle);
            const hy = cy + radius * Math.sin(angle);
            if (i === 0) this.diffuseCtx.moveTo(hx, hy);
            else this.diffuseCtx.lineTo(hx, hy);
        }
        this.diffuseCtx.closePath();

        // Fill slightly darker
        this.diffuseCtx.fillStyle = '#7a7a7a';
        this.diffuseCtx.fill();

        // Edge highlight
        this.diffuseCtx.strokeStyle = '#909090';
        this.diffuseCtx.lineWidth = 1;
        this.diffuseCtx.stroke();

        // Inner hex (raised center)
        this.diffuseCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = cx + radius * 0.7 * Math.cos(angle);
            const hy = cy + radius * 0.7 * Math.sin(angle);
            if (i === 0) this.diffuseCtx.moveTo(hx, hy);
            else this.diffuseCtx.lineTo(hx, hy);
        }
        this.diffuseCtx.closePath();
        this.diffuseCtx.fillStyle = '#8d8d8d';
        this.diffuseCtx.fill();
    }

    drawDiamondPlate(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.04;

        // Background
        this.diffuseCtx.fillStyle = '#828282';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Diamond pattern
        const diamondSize = size * 0.06;
        const spacing = diamondSize * 2.2;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const dx = x + margin + spacing * 0.5 + col * spacing + (row % 2) * spacing * 0.5;
                const dy = y + margin + spacing * 0.5 + row * spacing * 0.5;

                if (dx < x + size - margin && dy < y + size - margin) {
                    // Diamond shape
                    this.diffuseCtx.beginPath();
                    this.diffuseCtx.moveTo(dx, dy - diamondSize * 0.5);
                    this.diffuseCtx.lineTo(dx + diamondSize * 0.5, dy);
                    this.diffuseCtx.lineTo(dx, dy + diamondSize * 0.5);
                    this.diffuseCtx.lineTo(dx - diamondSize * 0.5, dy);
                    this.diffuseCtx.closePath();

                    // Raised diamond
                    this.diffuseCtx.fillStyle = '#909090';
                    this.diffuseCtx.fill();
                }
            }
        }
    }

    drawTechLines(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.04;

        // Background
        this.diffuseCtx.fillStyle = '#838383';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Horizontal tech lines with breaks
        this.diffuseCtx.strokeStyle = '#6a6a6a';
        this.diffuseCtx.lineWidth = 2;

        const lineSpacing = size * 0.12;
        for (let i = 1; i < 8; i++) {
            const ly = y + margin + i * lineSpacing;

            // Line with random breaks
            let lx = x + margin + 5;
            while (lx < x + size - margin - 5) {
                const segLen = 20 + this.random() * 40;
                const gap = 5 + this.random() * 15;

                this.diffuseCtx.beginPath();
                this.diffuseCtx.moveTo(lx, ly);
                this.diffuseCtx.lineTo(Math.min(lx + segLen, x + size - margin - 5), ly);
                this.diffuseCtx.stroke();

                lx += segLen + gap;
            }
        }

        // Vertical accent lines
        this.diffuseCtx.strokeStyle = '#959595';
        this.diffuseCtx.lineWidth = 1;

        const vx1 = x + size * 0.3;
        const vx2 = x + size * 0.7;

        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(vx1, y + margin + 10);
        this.diffuseCtx.lineTo(vx1, y + size - margin - 10);
        this.diffuseCtx.stroke();

        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(vx2, y + margin + 10);
        this.diffuseCtx.lineTo(vx2, y + size - margin - 10);
        this.diffuseCtx.stroke();
    }

    drawVentSlats(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.06;

        // Vent housing (dark recessed area)
        this.diffuseCtx.fillStyle = '#404040';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Slats
        const slats = 10;
        const slatHeight = (size - margin * 2) / slats;

        for (let i = 0; i < slats; i++) {
            const sy = y + margin + i * slatHeight;

            // Dark gap
            this.diffuseCtx.fillStyle = '#252525';
            this.diffuseCtx.fillRect(x + margin + 5, sy, size - margin * 2 - 10, slatHeight * 0.3);

            // Slat surface (angled, catches light on top)
            const gradient = this.diffuseCtx.createLinearGradient(0, sy + slatHeight * 0.3, 0, sy + slatHeight);
            gradient.addColorStop(0, '#707070');
            gradient.addColorStop(0.3, '#606060');
            gradient.addColorStop(1, '#505050');
            this.diffuseCtx.fillStyle = gradient;
            this.diffuseCtx.fillRect(x + margin + 5, sy + slatHeight * 0.3, size - margin * 2 - 10, slatHeight * 0.7);
        }

        // Frame
        this.diffuseCtx.strokeStyle = '#555555';
        this.diffuseCtx.lineWidth = 3;
        this.diffuseCtx.strokeRect(x + margin, y + margin, size - margin * 2, size - margin * 2);
    }

    // ==========================================
    // ROW 2: MECHANICAL DETAILS
    // ==========================================

    drawJointTexture(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const cx = x + size / 2;
        const cy = y + size / 2;

        // Background plate
        this.diffuseCtx.fillStyle = '#757575';
        this.diffuseCtx.fillRect(x, y, size, size);

        // Central joint ball
        const gradient = this.diffuseCtx.createRadialGradient(
            cx - size * 0.1, cy - size * 0.1, 0,
            cx, cy, size * 0.3
        );
        gradient.addColorStop(0, '#a0a0a0');
        gradient.addColorStop(0.5, '#808080');
        gradient.addColorStop(1, '#606060');

        this.diffuseCtx.beginPath();
        this.diffuseCtx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
        this.diffuseCtx.fillStyle = gradient;
        this.diffuseCtx.fill();

        // Joint ring
        this.diffuseCtx.strokeStyle = '#505050';
        this.diffuseCtx.lineWidth = 4;
        this.diffuseCtx.stroke();

        // Inner ring detail
        this.diffuseCtx.beginPath();
        this.diffuseCtx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
        this.diffuseCtx.strokeStyle = '#6a6a6a';
        this.diffuseCtx.lineWidth = 2;
        this.diffuseCtx.stroke();

        // Bolt details around ring
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const bx = cx + Math.cos(angle) * size * 0.25;
            const by = cy + Math.sin(angle) * size * 0.25;

            this.diffuseCtx.beginPath();
            this.diffuseCtx.arc(bx, by, 3, 0, Math.PI * 2);
            this.diffuseCtx.fillStyle = '#555555';
            this.diffuseCtx.fill();
        }
    }

    drawPistonHousing(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.1;

        // Background
        this.diffuseCtx.fillStyle = '#6a6a6a';
        this.diffuseCtx.fillRect(x, y, size, size);

        // Piston cylinder (vertical, metallic)
        const cylWidth = size * 0.3;
        const cylX = x + (size - cylWidth) / 2;

        const cylGradient = this.diffuseCtx.createLinearGradient(cylX, 0, cylX + cylWidth, 0);
        cylGradient.addColorStop(0, '#606060');
        cylGradient.addColorStop(0.3, '#909090');
        cylGradient.addColorStop(0.5, '#a5a5a5');
        cylGradient.addColorStop(0.7, '#909090');
        cylGradient.addColorStop(1, '#606060');

        this.diffuseCtx.fillStyle = cylGradient;
        this.diffuseCtx.fillRect(cylX, y + margin, cylWidth, size - margin * 2);

        // Piston rod (shinier)
        const rodWidth = size * 0.12;
        const rodX = x + (size - rodWidth) / 2;

        const rodGradient = this.diffuseCtx.createLinearGradient(rodX, 0, rodX + rodWidth, 0);
        rodGradient.addColorStop(0, '#808080');
        rodGradient.addColorStop(0.3, '#b0b0b0');
        rodGradient.addColorStop(0.5, '#d0d0d0');
        rodGradient.addColorStop(0.7, '#b0b0b0');
        rodGradient.addColorStop(1, '#808080');

        this.diffuseCtx.fillStyle = rodGradient;
        this.diffuseCtx.fillRect(rodX, y + size * 0.25, rodWidth, size * 0.5);

        // End caps
        this.diffuseCtx.fillStyle = '#555555';
        this.diffuseCtx.fillRect(cylX - 5, y + margin, cylWidth + 10, size * 0.08);
        this.diffuseCtx.fillRect(cylX - 5, y + size - margin - size * 0.08, cylWidth + 10, size * 0.08);
    }

    drawCableChannel(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;

        // Dark channel background
        this.diffuseCtx.fillStyle = '#454545';
        this.diffuseCtx.fillRect(x, y, size, size);

        // Cables
        const cableColors = ['#353535', '#404040', '#383838', '#3a3a3a'];
        const numCables = 4;
        const cableWidth = size * 0.12;
        const spacing = (size - cableWidth) / (numCables + 1);

        for (let i = 0; i < numCables; i++) {
            const cx = x + spacing * (i + 1);

            // Cable body
            const cableGrad = this.diffuseCtx.createLinearGradient(cx, 0, cx + cableWidth, 0);
            cableGrad.addColorStop(0, '#303030');
            cableGrad.addColorStop(0.3, '#505050');
            cableGrad.addColorStop(0.5, '#585858');
            cableGrad.addColorStop(0.7, '#505050');
            cableGrad.addColorStop(1, '#303030');

            this.diffuseCtx.fillStyle = cableGrad;
            this.diffuseCtx.fillRect(cx, y, cableWidth, size);

            // Cable ribs
            for (let r = 0; r < 12; r++) {
                const ry = y + r * (size / 12) + size * 0.02;
                this.diffuseCtx.fillStyle = '#404040';
                this.diffuseCtx.fillRect(cx - 1, ry, cableWidth + 2, 3);
            }
        }
    }

    drawThrusterNozzle(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const cx = x + size / 2;
        const cy = y + size / 2;

        // Background
        this.diffuseCtx.fillStyle = '#707070';
        this.diffuseCtx.fillRect(x, y, size, size);

        // Outer ring
        this.diffuseCtx.beginPath();
        this.diffuseCtx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
        this.diffuseCtx.fillStyle = '#505050';
        this.diffuseCtx.fill();

        // Inner heat ring
        const heatGrad = this.diffuseCtx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.35);
        heatGrad.addColorStop(0, '#303030');
        heatGrad.addColorStop(0.7, '#404040');
        heatGrad.addColorStop(1, '#353535');

        this.diffuseCtx.beginPath();
        this.diffuseCtx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
        this.diffuseCtx.fillStyle = heatGrad;
        this.diffuseCtx.fill();

        // Nozzle vanes
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            this.diffuseCtx.save();
            this.diffuseCtx.translate(cx, cy);
            this.diffuseCtx.rotate(angle);
            this.diffuseCtx.fillStyle = '#606060';
            this.diffuseCtx.fillRect(-2, size * 0.12, 4, size * 0.2);
            this.diffuseCtx.restore();
        }

        // Center hole
        this.diffuseCtx.beginPath();
        this.diffuseCtx.arc(cx, cy, size * 0.1, 0, Math.PI * 2);
        this.diffuseCtx.fillStyle = '#202020';
        this.diffuseCtx.fill();
    }

    // ==========================================
    // ROW 3: ACCENT AND DETAIL PANELS
    // ==========================================

    drawAccentStripe(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;

        // Base panel
        this.diffuseCtx.fillStyle = '#858585';
        this.diffuseCtx.fillRect(x, y, size, size);

        // Accent stripe (will be colored by team color)
        // Using lighter gray so team color shows through
        this.diffuseCtx.fillStyle = '#a0a0a0';
        this.diffuseCtx.fillRect(x, y + size * 0.35, size, size * 0.3);

        // Stripe edge highlights
        this.diffuseCtx.fillStyle = '#b5b5b5';
        this.diffuseCtx.fillRect(x, y + size * 0.35, size, 2);

        this.diffuseCtx.fillStyle = '#606060';
        this.diffuseCtx.fillRect(x, y + size * 0.65 - 2, size, 2);

        // Edge detail lines
        this.diffuseCtx.strokeStyle = '#707070';
        this.diffuseCtx.lineWidth = 1;
        this.diffuseCtx.setLineDash([10, 5]);
        this.diffuseCtx.beginPath();
        this.diffuseCtx.moveTo(x + 10, y + size * 0.5);
        this.diffuseCtx.lineTo(x + size - 10, y + size * 0.5);
        this.diffuseCtx.stroke();
        this.diffuseCtx.setLineDash([]);
    }

    drawStatusPanel(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.08;

        // Panel background
        this.diffuseCtx.fillStyle = '#707070';
        this.diffuseCtx.fillRect(x, y, size, size);

        // Recessed screen area
        this.diffuseCtx.fillStyle = '#404040';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size * 0.5);

        // Screen bezel
        this.diffuseCtx.strokeStyle = '#555555';
        this.diffuseCtx.lineWidth = 2;
        this.diffuseCtx.strokeRect(x + margin, y + margin, size - margin * 2, size * 0.5);

        // Status indicator lights
        const lightY = y + size * 0.7;
        const lightColors = ['#306030', '#603030', '#606030']; // Will glow when active
        const lightSpacing = (size - margin * 2) / 4;

        for (let i = 0; i < 3; i++) {
            const lx = x + margin + lightSpacing * (i + 0.5);

            // Light housing
            this.diffuseCtx.beginPath();
            this.diffuseCtx.arc(lx, lightY, size * 0.04, 0, Math.PI * 2);
            this.diffuseCtx.fillStyle = '#353535';
            this.diffuseCtx.fill();

            // Light (dim)
            this.diffuseCtx.beginPath();
            this.diffuseCtx.arc(lx, lightY, size * 0.025, 0, Math.PI * 2);
            this.diffuseCtx.fillStyle = lightColors[i];
            this.diffuseCtx.fill();
        }

        // Small buttons
        for (let i = 0; i < 4; i++) {
            const bx = x + margin + 10 + i * 20;
            const by = y + size * 0.85;
            this.diffuseCtx.fillStyle = '#505050';
            this.diffuseCtx.fillRect(bx, by, 12, 8);
        }
    }

    drawEdgeWear(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;
        const margin = size * 0.04;

        // Clean base panel
        this.diffuseCtx.fillStyle = '#888888';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, size - margin * 2);

        // Subtle edge wear (slightly lighter/shinier where paint worn)
        const edgeWidth = 6;

        // Top edge wear
        this.diffuseCtx.fillStyle = '#959595';
        this.diffuseCtx.fillRect(x + margin, y + margin, size - margin * 2, edgeWidth);

        // Bottom edge wear
        this.diffuseCtx.fillRect(x + margin, y + size - margin - edgeWidth, size - margin * 2, edgeWidth);

        // Left edge wear
        this.diffuseCtx.fillRect(x + margin, y + margin, edgeWidth, size - margin * 2);

        // Right edge wear
        this.diffuseCtx.fillRect(x + size - margin - edgeWidth, y + margin, edgeWidth, size - margin * 2);

        // A few subtle scratches (not heavy damage)
        this.diffuseCtx.strokeStyle = '#9a9a9a';
        this.diffuseCtx.lineWidth = 1;

        for (let i = 0; i < 4; i++) {
            const sx = x + margin + this.random() * (size - margin * 2);
            const sy = y + margin + this.random() * (size - margin * 2);
            const len = 10 + this.random() * 20;
            const angle = this.random() * Math.PI;

            this.diffuseCtx.beginPath();
            this.diffuseCtx.moveTo(sx, sy);
            this.diffuseCtx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
            this.diffuseCtx.stroke();
        }
    }

    drawMetallicPlain(gridX, gridY) {
        const x = gridX * this.cellSize;
        const y = gridY * this.cellSize;
        const size = this.cellSize;

        // Clean metallic gradient
        const gradient = this.diffuseCtx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, '#7a7a7a');
        gradient.addColorStop(0.3, '#8a8a8a');
        gradient.addColorStop(0.5, '#909090');
        gradient.addColorStop(0.7, '#8a8a8a');
        gradient.addColorStop(1, '#7a7a7a');

        this.diffuseCtx.fillStyle = gradient;
        this.diffuseCtx.fillRect(x, y, size, size);

        // Subtle brushed metal lines
        this.diffuseCtx.strokeStyle = '#858585';
        this.diffuseCtx.lineWidth = 0.5;

        for (let i = 0; i < size; i += 3) {
            this.diffuseCtx.beginPath();
            this.diffuseCtx.moveTo(x, y + i);
            this.diffuseCtx.lineTo(x + size, y + i);
            this.diffuseCtx.stroke();
        }
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    addSubtleNoise(x, y, size, intensity) {
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

    getDataURLs() {
        return {
            diffuse: this.diffuseCanvas.toDataURL('image/png'),
            normal: this.normalCanvas.toDataURL('image/png')
        };
    }

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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MechTextureGenerator;
}
