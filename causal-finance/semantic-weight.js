#!/usr/bin/env node

// Semantic Weight Scoring - The Core of Causal Finance
// Meaning > Money

class SemanticScorer {
    // Score events by their causal power, not dollar value
    scoreEvent(event) {
        const weights = {
            // Maximum semantic weight - creates cascades
            'parameterChange': 10,      // Any protocol parameter change
            'goingConcern': 10,         // Company distress signal
            'firstOfType': 10,          // New mechanism introduced
            'governanceVote': 9,        // DAO decisions
            'insiderAction': 9,         // Form 4, insider moves
            
            // Medium weight - profitable but competitive  
            'liquidationTrigger': 7,    // Direct liquidation event
            'oracleUpdate': 6,          // Price feed changes
            'largeTx': 3,              // Big transfer (low weight!)
            
            // Low weight - noise
            'routineTx': 1,            // Regular transfers
            'spam': 0                  // MEV spam
        };
        
        return weights[event.type] || 0;
    }
    
    // Calculate cascade potential
    calculateCascade(event) {
        const score = this.scoreEvent(event);
        
        // High semantic weight creates exponential effects
        const cascadePotential = Math.pow(score, 2);
        
        return {
            semanticWeight: score,
            cascadePotential: cascadePotential,
            priority: score >= 7 ? 'URGENT' : 'MONITOR'
        };
    }
    
    // Compare traditional vs semantic approach
    compareApproaches(events) {
        console.log('[*] Traditional vs Semantic Approach:\n');
        
        events.forEach(event => {
            const semantic = this.calculateCascade(event);
            
            console.log(`Event: ${event.name}`);
            console.log(`  Traditional focus: $${event.tvl || 0}`);
            console.log(`  Semantic weight: ${semantic.semanticWeight}/10`);
            console.log(`  Cascade potential: ${semantic.cascadePotential}x`);
            console.log(`  Action: ${semantic.priority}\n`);
        });
    }
}

// Demo the difference
const scorer = new SemanticScorer();

const exampleEvents = [
    { name: 'MakerDAO changes stability fee 1%', type: 'parameterChange', tvl: 100000 },
    { name: 'Whale moves $10M', type: 'largeTx', tvl: 10000000 },
    { name: 'Protocol adds new fee tier', type: 'firstOfType', tvl: 0 },
    { name: 'Company files bankruptcy', type: 'goingConcern', tvl: 500000 }
];

console.log('[*] Semantic Weight > Dollar Value\n');
console.log('[*] Why small signals create big profits:\n');

scorer.compareApproaches(exampleEvents);

console.log('[!] The Secret: High semantic weight forces market response');
console.log('[!] You profit from the cascade, not the initial value');

module.exports = SemanticScorer;
