#!/usr/bin/env node

// Causal Attribution Engine
// Tracks semantic signals → on-chain events → profit extraction
// Proves which signals generated which yield

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class CausalAttribution {
    constructor() {
        this.chains = new Map(); // signalId → causal chain
        this.profits = new Map(); // txHash → profit data
        this.dbPath = path.join(__dirname, 'causal-profits.json');
    }

    // Generate unique signal ID with semantic fingerprint
    generateSignalId(semanticData) {
        const timestamp = Date.now();
        const nonce = crypto.randomBytes(4).toString('hex');
        const semanticHash = crypto.createHash('sha256')
            .update(JSON.stringify({
                type: semanticData.type,
                source: semanticData.source,
                weight: semanticData.weight,
                timestamp
            }))
            .digest('hex')
            .substring(0, 8);
        
        return `SIG-${semanticHash}-${nonce}`;
    }

    // Tag a JAM with attribution metadata
    tagJAM(jamData, semanticSource) {
        const signalId = this.generateSignalId(semanticSource);
        
        const taggedJAM = {
            ...jamData,
            attribution: {
                signalId,
                semanticWeight: semanticSource.weight,
                sourceType: semanticSource.type,
                timestamp: Date.now(),
                causalAnchor: semanticSource.anchor || null,
                expectedCascade: Math.pow(semanticSource.weight, 2)
            }
        };

        // Start tracking causal chain
        this.chains.set(signalId, {
            origin: semanticSource,
            jam: taggedJAM,
            events: [],
            profit: 0,
            status: 'BROADCASTED'
        });

        return taggedJAM;
    }

    // Record on-chain event in causal chain
    recordEvent(signalId, eventData) {
        const chain = this.chains.get(signalId);
        if (!chain) return;

        chain.events.push({
            timestamp: Date.now(),
            type: eventData.type,
            txHash: eventData.txHash,
            gasUsed: eventData.gasUsed || 0,
            response: eventData.response || null
        });

        // Update status based on event
        if (eventData.type === 'BOT_RESPONSE') {
            chain.status = 'TRIGGERED';
        } else if (eventData.type === 'LIQUIDATION_EXECUTED') {
            chain.status = 'PROFITABLE';
        }
    }

    // Record profit extraction
    async recordProfit(signalId, profitData) {
        const chain = this.chains.get(signalId);
        if (!chain) return;

        const profit = {
            signalId,
            txHash: profitData.txHash,
            amountETH: profitData.amountETH,
            gasSpent: profitData.gasSpent || 0,
            netProfit: profitData.amountETH - (profitData.gasSpent || 0),
            timestamp: Date.now(),
            liquidationType: profitData.type || 'UNKNOWN'
        };

        chain.profit += profit.netProfit;
        chain.status = 'COMPLETED';
        
        this.profits.set(profitData.txHash, profit);
        
        // Calculate ROI on semantic weight
        const semanticROI = (profit.netProfit / chain.origin.weight) * 100;
        chain.semanticROI = semanticROI;

        await this.saveToDatabase();
        
        return {
            signalId,
            profit: profit.netProfit,
            semanticROI,
            cascadeMultiplier: profit.netProfit / 0.02 // vs base gas cost
        };
    }

    // Get full causal trace
    getCausalTrace(signalId) {
        const chain = this.chains.get(signalId);
        if (!chain) return null;

        return {
            signalId,
            origin: {
                type: chain.origin.type,
                weight: chain.origin.weight,
                timestamp: chain.jam.attribution.timestamp
            },
            jamBroadcast: {
                timestamp: chain.jam.attribution.timestamp,
                expectedCascade: chain.jam.attribution.expectedCascade
            },
            events: chain.events,
            profit: {
                total: chain.profit,
                roi: chain.semanticROI || 0,
                status: chain.status
            },
            timeline: this.calculateTimeline(chain)
        };
    }

    calculateTimeline(chain) {
        if (chain.events.length === 0) return null;
        
        const start = chain.jam.attribution.timestamp;
        const firstEvent = chain.events[0].timestamp;
        const lastEvent = chain.events[chain.events.length - 1].timestamp;
        
        return {
            signalToEvent: firstEvent - start,
            totalDuration: lastEvent - start,
            eventCount: chain.events.length
        };
    }

    // Analytics: Which semantic types are most profitable?
    analyzeSemanticYield() {
        const analysis = {};
        
        for (const [_, chain] of this.chains) {
            const type = chain.origin.type;
            if (!analysis[type]) {
                analysis[type] = {
                    count: 0,
                    totalProfit: 0,
                    avgROI: 0,
                    successRate: 0
                };
            }
            
            analysis[type].count++;
            analysis[type].totalProfit += chain.profit;
            
            if (chain.status === 'COMPLETED' || chain.status === 'PROFITABLE') {
                analysis[type].successRate++;
            }
        }
        
        // Calculate averages
        Object.keys(analysis).forEach(type => {
            const data = analysis[type];
            data.avgProfit = data.totalProfit / data.count;
            data.successRate = (data.successRate / data.count) * 100;
        });
        
        return analysis;
    }

    // Get profit dashboard data
    async getDashboard() {
        const totalSignals = this.chains.size;
        const completedSignals = Array.from(this.chains.values())
            .filter(c => c.status === 'COMPLETED').length;
        
        const totalProfit = Array.from(this.chains.values())
            .reduce((sum, chain) => sum + chain.profit, 0);
        
        const semanticAnalysis = this.analyzeSemanticYield();
        
        const recentProfits = Array.from(this.profits.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10);
        
        return {
            summary: {
                totalSignals,
                completedSignals,
                successRate: (completedSignals / totalSignals) * 100,
                totalProfitETH: totalProfit,
                avgProfitPerSignal: totalProfit / totalSignals
            },
            semanticAnalysis,
            recentProfits,
            timestamp: Date.now()
        };
    }

    // Persistence
    async saveToDatabase() {
        const data = {
            chains: Array.from(this.chains.entries()),
            profits: Array.from(this.profits.entries()),
            timestamp: Date.now()
        };
        
        await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
    }

    async loadFromDatabase() {
        try {
            const data = await fs.readFile(this.dbPath, 'utf8');
            const parsed = JSON.parse(data);
            
            this.chains = new Map(parsed.chains);
            this.profits = new Map(parsed.profits);
        } catch (e) {
            // Fresh start if no database
            console.log('[*] Starting fresh attribution database');
        }
    }
}

// Export for integration
module.exports = CausalAttribution;

// Demo if run directly
if (require.main === module) {
    const attribution = new CausalAttribution();
    
    console.log('[*] Causal Attribution Engine initialized');
    console.log('[*] This tracks: Semantic Signal → JAM → Bot Response → Profit');
    console.log('[*] Every yield extraction is causally linked to its origin');
    
    // Example usage
    const exampleSignal = {
        type: 'parameterChange',
        weight: 10,
        source: 'MakerDAO stability fee increase',
        anchor: '0xabc123...'
    };
    
    const taggedJAM = attribution.tagJAM(
        { type: 'LIQUIDATION_ALERT', data: '...' },
        exampleSignal
    );
    
    console.log('\n[*] Tagged JAM:', taggedJAM);
    console.log('[*] Signal ID:', taggedJAM.attribution.signalId);
    console.log('[*] Expected cascade:', taggedJAM.attribution.expectedCascade, 'x');
}
