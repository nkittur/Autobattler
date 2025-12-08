#!/usr/bin/env node

/**
 * Autobattler Balance Testing - Main Runner
 *
 * Runs simulations with multiple agent archetypes and generates reports
 * for balance analysis.
 *
 * Usage:
 *   node index.js                    # Run with defaults (50 runs per agent)
 *   node index.js --runs 100         # Run 100 simulations per agent
 *   node index.js --verbose          # Show detailed output
 *   node index.js --agent aggressive # Run only one agent type
 *   node index.js --output report.txt # Save report to file
 */

const fs = require('fs');
const path = require('path');

const { simulateRun } = require('./progression-simulator');
const { getAllAgents, createAgent, AGENTS } = require('./agents');
const { analyzeAgentRuns, analyzeItems, generateReport, generateQuickSummary } = require('./dashboard');

// ===========================================
// CONFIGURATION
// ===========================================

const DEFAULT_CONFIG = {
    runsPerAgent: 50,
    maxRounds: 10,
    verbose: false,
    outputFile: null,
    agents: Object.keys(AGENTS)
};

// ===========================================
// ARGUMENT PARSING
// ===========================================

function parseArgs() {
    const args = process.argv.slice(2);
    const config = { ...DEFAULT_CONFIG };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '--runs':
            case '-r':
                config.runsPerAgent = parseInt(next) || DEFAULT_CONFIG.runsPerAgent;
                i++;
                break;
            case '--verbose':
            case '-v':
                config.verbose = true;
                break;
            case '--agent':
            case '-a':
                if (next && AGENTS[next]) {
                    config.agents = [next];
                }
                i++;
                break;
            case '--output':
            case '-o':
                config.outputFile = next;
                i++;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
        }
    }

    return config;
}

function printHelp() {
    console.log(`
Autobattler Balance Testing System

Usage: node index.js [options]

Options:
  --runs, -r <n>      Number of runs per agent (default: 50)
  --verbose, -v       Show detailed simulation output
  --agent, -a <type>  Run only specified agent type
  --output, -o <file> Save report to file
  --help, -h          Show this help message

Available agents: ${Object.keys(AGENTS).join(', ')}

Example:
  node index.js --runs 100 --output balance-report.txt
`);
}

// ===========================================
// MAIN RUNNER
// ===========================================

async function runSimulations(config) {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║         AUTOBATTLER BALANCE TESTING SYSTEM                   ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`Configuration:`);
    console.log(`  Runs per agent: ${config.runsPerAgent}`);
    console.log(`  Max rounds: ${config.maxRounds}`);
    console.log(`  Agents: ${config.agents.join(', ')}`);
    console.log();

    const startTime = Date.now();
    const runsByAgent = {};

    // Run simulations for each agent
    for (const agentType of config.agents) {
        console.log(`\n▶ Running ${agentType} agent (${config.runsPerAgent} runs)...`);

        const agent = createAgent(agentType);
        const runs = [];

        for (let i = 0; i < config.runsPerAgent; i++) {
            if (!config.verbose && i % 10 === 0) {
                process.stdout.write(`  Progress: ${i}/${config.runsPerAgent}\r`);
            }

            const run = simulateRun(agent, {
                maxRounds: config.maxRounds,
                verbose: config.verbose
            });
            runs.push(run);
        }

        runsByAgent[agentType] = runs;

        // Quick stats
        const victories = runs.filter(r => r.finalResult === 'victory').length;
        console.log(`  Completed: ${victories}/${config.runsPerAgent} victories (${((victories / config.runsPerAgent) * 100).toFixed(1)}%)`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`\nTotal simulation time: ${(totalTime / 1000).toFixed(2)}s`);

    return runsByAgent;
}

function analyzeResults(runsByAgent) {
    console.log('\n▶ Analyzing results...');

    const agentAnalysis = {};
    for (const [agentName, runs] of Object.entries(runsByAgent)) {
        agentAnalysis[agentName] = analyzeAgentRuns(runs);
    }

    const itemAnalysis = analyzeItems(runsByAgent);

    return {
        runsByAgent,
        agentAnalysis,
        itemAnalysis
    };
}

// ===========================================
// MAIN
// ===========================================

async function main() {
    const config = parseArgs();

    try {
        // Run simulations
        const runsByAgent = await runSimulations(config);

        // Analyze results
        const results = analyzeResults(runsByAgent);

        // Generate reports
        console.log('\n▶ Generating report...');

        const quickSummary = generateQuickSummary(results);
        console.log(quickSummary);

        const fullReport = generateReport(results);

        // Output to file if specified
        if (config.outputFile) {
            fs.writeFileSync(config.outputFile, fullReport, 'utf8');
            console.log(`\n✓ Full report saved to: ${config.outputFile}`);
        } else {
            console.log('\n' + fullReport);
        }

        // Save raw data for further analysis
        const dataFile = config.outputFile
            ? config.outputFile.replace(/\.txt$/, '-data.json')
            : 'balance-data.json';

        const rawData = {
            timestamp: new Date().toISOString(),
            config,
            agentAnalysis: results.agentAnalysis,
            itemAnalysis: Object.fromEntries(
                Object.entries(results.itemAnalysis).map(([k, v]) => [k, {
                    timesUsed: v.timesUsed,
                    winRate: v.winRate,
                    avgRoundReached: v.avgRoundReached,
                    byAgent: v.byAgent
                }])
            )
        };

        fs.writeFileSync(dataFile, JSON.stringify(rawData, null, 2), 'utf8');
        console.log(`✓ Raw data saved to: ${dataFile}`);

    } catch (error) {
        console.error('\n✗ Error during simulation:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { runSimulations, analyzeResults };
