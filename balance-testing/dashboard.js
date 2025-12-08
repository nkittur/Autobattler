/**
 * Dashboard - Reporting and Analysis System
 *
 * Generates detailed reports from simulation runs that can be
 * read by humans or AI for balance analysis and suggestions.
 */

const { ITEM_TEMPLATES, ECONOMY, DIFFICULTY } = require('./game-constants');

// ===========================================
// FORMATTING UTILITIES
// ===========================================

function formatPercent(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(value, decimals = 1) {
    return value.toFixed(decimals);
}

function padRight(str, len) {
    return str.toString().padEnd(len);
}

function padLeft(str, len) {
    return str.toString().padStart(len);
}

function createBar(value, max, width = 20) {
    const filled = Math.round((value / max) * width);
    return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

// ===========================================
// ANALYSIS FUNCTIONS
// ===========================================

/**
 * Analyze runs for a single agent
 */
function analyzeAgentRuns(runs) {
    const totalRuns = runs.length;
    const victories = runs.filter(r => r.finalResult === 'victory').length;
    const losses = runs.filter(r => r.finalResult === 'loss').length;

    // Round reached statistics
    const roundsReached = runs.map(r => r.finalRound);
    const avgRound = roundsReached.reduce((a, b) => a + b, 0) / totalRuns;
    const maxRound = Math.max(...roundsReached);
    const minRound = Math.min(...roundsReached);

    // Gold statistics
    const finalGold = runs.map(r => r.finalState.gold);
    const avgGold = finalGold.reduce((a, b) => a + b, 0) / totalRuns;

    // Equipment statistics
    const equipmentCounts = runs.map(r => r.finalState.equipment.length);
    const avgEquipment = equipmentCounts.reduce((a, b) => a + b, 0) / totalRuns;

    // Item usage
    const itemUsage = {};
    for (const run of runs) {
        for (const item of run.finalState.equipment) {
            itemUsage[item.templateId] = (itemUsage[item.templateId] || 0) + 1;
        }
    }

    // Decision analysis
    const shopDecisions = { buy: 0, skip: 0, refresh: 0 };
    const missionDecisions = { Easy: 0, Medium: 0, Hard: 0 };
    const salvageDecisions = { pick: 0, skip: 0 };

    for (const run of runs) {
        for (const round of run.rounds) {
            if (round.shopDecision?.action) {
                shopDecisions[round.shopDecision.action] = (shopDecisions[round.shopDecision.action] || 0) + 1;
            }
            const missionDiff = round.missionOptions?.[round.missionDecision?.missionIndex]?.difficulty;
            if (missionDiff) {
                missionDecisions[missionDiff] = (missionDecisions[missionDiff] || 0) + 1;
            }
            if (round.salvageDecision?.action) {
                salvageDecisions[round.salvageDecision.action] = (salvageDecisions[round.salvageDecision.action] || 0) + 1;
            }
        }
    }

    // Per-round survival rate
    const survivalByRound = {};
    for (let r = 1; r <= 10; r++) {
        survivalByRound[r] = runs.filter(run => run.finalRound >= r).length / totalRuns;
    }

    return {
        totalRuns,
        victories,
        losses,
        winRate: victories / totalRuns,
        avgRound,
        maxRound,
        minRound,
        avgGold,
        avgEquipment,
        itemUsage,
        shopDecisions,
        missionDecisions,
        salvageDecisions,
        survivalByRound
    };
}

/**
 * Analyze item performance across all agents
 */
function analyzeItems(allRunsByAgent) {
    const itemStats = {};

    for (const [agentName, runs] of Object.entries(allRunsByAgent)) {
        for (const run of runs) {
            const victory = run.finalResult === 'victory';
            const roundReached = run.finalRound;

            for (const item of run.finalState.equipment) {
                const id = item.templateId;
                if (!itemStats[id]) {
                    itemStats[id] = {
                        timesUsed: 0,
                        inVictories: 0,
                        inLosses: 0,
                        avgRoundReached: 0,
                        roundSum: 0,
                        byAgent: {}
                    };
                }
                itemStats[id].timesUsed++;
                itemStats[id].roundSum += roundReached;
                if (victory) {
                    itemStats[id].inVictories++;
                } else {
                    itemStats[id].inLosses++;
                }
                itemStats[id].byAgent[agentName] = (itemStats[id].byAgent[agentName] || 0) + 1;
            }
        }
    }

    // Calculate averages
    for (const id of Object.keys(itemStats)) {
        const stats = itemStats[id];
        stats.avgRoundReached = stats.roundSum / stats.timesUsed;
        stats.winRate = stats.inVictories / stats.timesUsed;
    }

    return itemStats;
}

/**
 * Analyze decision patterns
 */
function analyzeDecisions(allRunsByAgent) {
    const decisionPatterns = {
        shopByRound: {},
        missionByDifficulty: {},
        salvagePatterns: {}
    };

    for (const [agentName, runs] of Object.entries(allRunsByAgent)) {
        for (const run of runs) {
            for (const round of run.rounds) {
                const r = round.round;

                // Shop decisions by round
                if (!decisionPatterns.shopByRound[r]) {
                    decisionPatterns.shopByRound[r] = { buy: 0, skip: 0, total: 0 };
                }
                decisionPatterns.shopByRound[r].total++;
                if (round.shopDecision?.action === 'buy') {
                    decisionPatterns.shopByRound[r].buy++;
                } else {
                    decisionPatterns.shopByRound[r].skip++;
                }
            }
        }
    }

    return decisionPatterns;
}

// ===========================================
// REPORT GENERATION
// ===========================================

/**
 * Generate a comprehensive report from simulation results
 */
function generateReport(results) {
    const lines = [];
    const add = (line = '') => lines.push(line);

    add('╔══════════════════════════════════════════════════════════════════════════════╗');
    add('║           AUTOBATTLER BALANCE TESTING - SIMULATION REPORT                    ║');
    add('╚══════════════════════════════════════════════════════════════════════════════╝');
    add();
    add(`Generated: ${new Date().toISOString()}`);
    add(`Total Runs: ${Object.values(results.runsByAgent).flat().length}`);
    add(`Agents Tested: ${Object.keys(results.runsByAgent).length}`);
    add();

    // ===========================================
    // AGENT PERFORMANCE SUMMARY
    // ===========================================
    add('┌──────────────────────────────────────────────────────────────────────────────┐');
    add('│                           AGENT PERFORMANCE SUMMARY                          │');
    add('└──────────────────────────────────────────────────────────────────────────────┘');
    add();

    add(`${'Agent'.padEnd(15)} ${'Win Rate'.padEnd(10)} ${'Avg Round'.padEnd(10)} ${'Avg Gold'.padEnd(10)} ${'Avg Items'.padEnd(10)} Survival`);
    add('─'.repeat(78));

    for (const [agentName, analysis] of Object.entries(results.agentAnalysis)) {
        const winBar = createBar(analysis.winRate, 1, 10);
        add(
            `${agentName.padEnd(15)} ` +
            `${formatPercent(analysis.winRate).padEnd(10)} ` +
            `${formatNumber(analysis.avgRound).padEnd(10)} ` +
            `${formatNumber(analysis.avgGold).padEnd(10)} ` +
            `${formatNumber(analysis.avgEquipment).padEnd(10)} ` +
            `${winBar}`
        );
    }
    add();

    // ===========================================
    // SURVIVAL CURVES
    // ===========================================
    add('┌──────────────────────────────────────────────────────────────────────────────┐');
    add('│                              SURVIVAL BY ROUND                               │');
    add('└──────────────────────────────────────────────────────────────────────────────┘');
    add();
    add('Shows percentage of runs that reached each round:');
    add();

    add(`${'Round'.padEnd(8)} ${Object.keys(results.agentAnalysis).map(a => a.substring(0, 8).padEnd(10)).join('')}`);
    add('─'.repeat(78));

    for (let round = 1; round <= 10; round++) {
        const isBoss = DIFFICULTY.isBossRound(round);
        const prefix = isBoss ? '★ ' : '  ';
        let line = `${prefix}${round}`.padEnd(8);

        for (const agentName of Object.keys(results.agentAnalysis)) {
            const survival = results.agentAnalysis[agentName].survivalByRound[round];
            line += `${formatPercent(survival).padEnd(10)}`;
        }
        add(line);
    }
    add();
    add('★ = Boss round');
    add();

    // ===========================================
    // ITEM USAGE ANALYSIS
    // ===========================================
    add('┌──────────────────────────────────────────────────────────────────────────────┐');
    add('│                              ITEM USAGE ANALYSIS                             │');
    add('└──────────────────────────────────────────────────────────────────────────────┘');
    add();

    const itemStats = results.itemAnalysis;
    const sortedItems = Object.entries(itemStats)
        .sort((a, b) => b[1].timesUsed - a[1].timesUsed);

    add(`${'Item'.padEnd(20)} ${'Uses'.padEnd(8)} ${'Win Rate'.padEnd(10)} ${'Avg Round'.padEnd(10)} Status`);
    add('─'.repeat(78));

    for (const [itemId, stats] of sortedItems) {
        let status = '✓ OK';
        if (stats.winRate > 0.7) status = '⚠ Strong';
        if (stats.winRate < 0.3) status = '⚠ Weak';
        if (stats.timesUsed < 5) status = '? Low data';

        const template = ITEM_TEMPLATES[itemId];
        const type = template?.type || 'UNKNOWN';

        add(
            `${itemId.padEnd(20)} ` +
            `${stats.timesUsed.toString().padEnd(8)} ` +
            `${formatPercent(stats.winRate).padEnd(10)} ` +
            `${formatNumber(stats.avgRoundReached).padEnd(10)} ` +
            `${status}`
        );
    }
    add();

    // ===========================================
    // DECISION PATTERNS
    // ===========================================
    add('┌──────────────────────────────────────────────────────────────────────────────┐');
    add('│                             DECISION PATTERNS                                │');
    add('└──────────────────────────────────────────────────────────────────────────────┘');
    add();

    // Shop decisions by agent
    add('Shop Decisions by Agent:');
    add(`${'Agent'.padEnd(15)} ${'Buy %'.padEnd(10)} ${'Skip %'.padEnd(10)} Total Decisions`);
    add('─'.repeat(50));

    for (const [agentName, analysis] of Object.entries(results.agentAnalysis)) {
        const total = analysis.shopDecisions.buy + analysis.shopDecisions.skip;
        const buyPct = total > 0 ? analysis.shopDecisions.buy / total : 0;
        add(
            `${agentName.padEnd(15)} ` +
            `${formatPercent(buyPct).padEnd(10)} ` +
            `${formatPercent(1 - buyPct).padEnd(10)} ` +
            `${total}`
        );
    }
    add();

    // Mission difficulty preferences
    add('Mission Difficulty Preferences:');
    add(`${'Agent'.padEnd(15)} ${'Easy %'.padEnd(10)} ${'Medium %'.padEnd(10)} ${'Hard %'.padEnd(10)}`);
    add('─'.repeat(50));

    for (const [agentName, analysis] of Object.entries(results.agentAnalysis)) {
        const total = analysis.missionDecisions.Easy + analysis.missionDecisions.Medium + analysis.missionDecisions.Hard;
        if (total === 0) continue;
        add(
            `${agentName.padEnd(15)} ` +
            `${formatPercent(analysis.missionDecisions.Easy / total).padEnd(10)} ` +
            `${formatPercent(analysis.missionDecisions.Medium / total).padEnd(10)} ` +
            `${formatPercent(analysis.missionDecisions.Hard / total).padEnd(10)}`
        );
    }
    add();

    // Salvage decisions
    add('Salvage Decisions:');
    add(`${'Agent'.padEnd(15)} ${'Pick %'.padEnd(10)} ${'Skip %'.padEnd(10)}`);
    add('─'.repeat(35));

    for (const [agentName, analysis] of Object.entries(results.agentAnalysis)) {
        const total = analysis.salvageDecisions.pick + analysis.salvageDecisions.skip;
        if (total === 0) continue;
        add(
            `${agentName.padEnd(15)} ` +
            `${formatPercent(analysis.salvageDecisions.pick / total).padEnd(10)} ` +
            `${formatPercent(analysis.salvageDecisions.skip / total).padEnd(10)}`
        );
    }
    add();

    // ===========================================
    // BALANCE ISSUES & SUGGESTIONS
    // ===========================================
    add('┌──────────────────────────────────────────────────────────────────────────────┐');
    add('│                        BALANCE ISSUES & SUGGESTIONS                          │');
    add('└──────────────────────────────────────────────────────────────────────────────┘');
    add();

    const issues = [];
    const suggestions = [];

    // Check for dominant strategies
    const winRates = Object.entries(results.agentAnalysis)
        .map(([name, a]) => ({ name, winRate: a.winRate }))
        .sort((a, b) => b.winRate - a.winRate);

    const bestAgent = winRates[0];
    const worstAgent = winRates[winRates.length - 1];

    if (bestAgent.winRate > 0.7) {
        issues.push(`HIGH: ${bestAgent.name} agent has ${formatPercent(bestAgent.winRate)} win rate - strategy may be too strong`);
    }
    if (worstAgent.winRate < 0.2) {
        issues.push(`HIGH: ${worstAgent.name} agent has ${formatPercent(worstAgent.winRate)} win rate - strategy may be unviable`);
    }

    // Check for item imbalances
    for (const [itemId, stats] of sortedItems) {
        if (stats.timesUsed >= 10) {
            if (stats.winRate > 0.75) {
                issues.push(`MEDIUM: ${itemId} has ${formatPercent(stats.winRate)} win rate when used - may be too strong`);
                suggestions.push(`Consider nerfing ${itemId}: reduce damage/stats or increase cost`);
            }
            if (stats.winRate < 0.25) {
                issues.push(`MEDIUM: ${itemId} has ${formatPercent(stats.winRate)} win rate when used - may be too weak`);
                suggestions.push(`Consider buffing ${itemId}: increase damage/stats or reduce cost`);
            }
        }
    }

    // Check for unused items
    const totalRuns = Object.values(results.runsByAgent).flat().length;
    for (const [itemId, stats] of sortedItems) {
        const usageRate = stats.timesUsed / totalRuns;
        if (usageRate < 0.05) {
            issues.push(`LOW: ${itemId} rarely used (${formatPercent(usageRate)} of runs) - may need buff or cost reduction`);
        }
    }

    // Check survival cliffs
    for (const [agentName, analysis] of Object.entries(results.agentAnalysis)) {
        for (let r = 2; r <= 10; r++) {
            const drop = analysis.survivalByRound[r - 1] - analysis.survivalByRound[r];
            if (drop > 0.3) {
                issues.push(`MEDIUM: ${agentName} has ${formatPercent(drop)} survival drop at round ${r} - difficulty spike?`);
            }
        }
    }

    // Output issues
    if (issues.length > 0) {
        add('IDENTIFIED ISSUES:');
        add('─'.repeat(40));
        for (const issue of issues) {
            add(`  • ${issue}`);
        }
        add();
    } else {
        add('No major balance issues identified.');
        add();
    }

    // Output suggestions
    if (suggestions.length > 0) {
        add('SUGGESTIONS:');
        add('─'.repeat(40));
        for (const suggestion of suggestions) {
            add(`  → ${suggestion}`);
        }
        add();
    }

    // ===========================================
    // RAW DATA FOR AI ANALYSIS
    // ===========================================
    add('┌──────────────────────────────────────────────────────────────────────────────┐');
    add('│                         RAW DATA FOR AI ANALYSIS                             │');
    add('└──────────────────────────────────────────────────────────────────────────────┘');
    add();
    add('The following JSON data can be used for deeper analysis:');
    add();
    add('```json');
    add(JSON.stringify({
        summary: {
            totalRuns: Object.values(results.runsByAgent).flat().length,
            agentWinRates: Object.fromEntries(
                Object.entries(results.agentAnalysis).map(([k, v]) => [k, v.winRate])
            ),
            avgRoundsByAgent: Object.fromEntries(
                Object.entries(results.agentAnalysis).map(([k, v]) => [k, v.avgRound])
            )
        },
        itemStats: Object.fromEntries(
            sortedItems.map(([id, stats]) => [id, {
                uses: stats.timesUsed,
                winRate: stats.winRate,
                avgRound: stats.avgRoundReached
            }])
        ),
        survivalCurves: Object.fromEntries(
            Object.entries(results.agentAnalysis).map(([k, v]) => [k, v.survivalByRound])
        ),
        decisionPatterns: {
            shopBuyRates: Object.fromEntries(
                Object.entries(results.agentAnalysis).map(([k, v]) => {
                    const total = v.shopDecisions.buy + v.shopDecisions.skip;
                    return [k, total > 0 ? v.shopDecisions.buy / total : 0];
                })
            ),
            missionPreferences: Object.fromEntries(
                Object.entries(results.agentAnalysis).map(([k, v]) => [k, v.missionDecisions])
            )
        }
    }, null, 2));
    add('```');
    add();

    return lines.join('\n');
}

/**
 * Generate a quick summary for console output
 */
function generateQuickSummary(results) {
    const lines = [];
    const add = (line = '') => lines.push(line);

    add('\n=== QUICK SUMMARY ===\n');

    for (const [agentName, analysis] of Object.entries(results.agentAnalysis)) {
        const winBar = createBar(analysis.winRate, 1, 15);
        add(`${agentName.padEnd(12)}: ${formatPercent(analysis.winRate).padEnd(7)} win rate ${winBar}`);
    }

    add();

    // Best and worst performing
    const sorted = Object.entries(results.agentAnalysis)
        .sort((a, b) => b[1].winRate - a[1].winRate);

    add(`Best strategy:  ${sorted[0][0]} (${formatPercent(sorted[0][1].winRate)})`);
    add(`Worst strategy: ${sorted[sorted.length - 1][0]} (${formatPercent(sorted[sorted.length - 1][1].winRate)})`);

    return lines.join('\n');
}

module.exports = {
    analyzeAgentRuns,
    analyzeItems,
    analyzeDecisions,
    generateReport,
    generateQuickSummary
};
