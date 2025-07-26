#!/usr/bin/env node

// Every governance action creates liquidations
// This maps proposals to profit

const governanceEffects = {
    // MakerDAO
    'Stability Fee Increase': {
        effect: 'Vaults below new ratio get liquidated',
        bots: ['Liquidation keeper', 'Collateral auction'],
        profit: 'Liquidation penalty + collateral discount'
    },
    
    // Compound
    'Collateral Factor Change': {
        effect: 'Positions suddenly undercollateralized',
        bots: ['Flash loan liquidator', 'MEV searcher'],
        profit: 'Liquidation incentive + slippage'
    },
    
    // Aave
    'Risk Parameter Update': {
        effect: 'Loan-to-value ratios shift',
        bots: ['Health factor monitor', 'Liquidation bot'],
        profit: 'Liquidation bonus + arbitrage'
    },
    
    // Uniswap
    'Fee Tier Addition': {
        effect: 'Liquidity migrates, creating arbs',
        bots: ['Cross-pool arbitrage', 'JIT liquidity'],
        profit: 'Price differences + MEV'
    },
    
    // Any DAO
    'Treasury Diversification': {
        effect: 'Large market sells create cascades',
        bots: ['Front-running bot', 'Sandwich attacker'],
        profit: 'Frontrun dumps + sandwich profits'
    }
};

console.log('[*] Governance → Liquidation Map\n');

for (const [proposal, data] of Object.entries(governanceEffects)) {
    console.log(`[${proposal}]`);
    console.log(`  Effect: ${data.effect}`);
    console.log(`  Bots: ${data.bots.join(', ')}`);
    console.log(`  Profit: ${data.profit}\n`);
}

console.log('[*] Every vote is a liquidation event');
console.log('[*] Every parameter change is extractable alpha');
console.log('[*] Governance is just MEV generation with extra steps');

module.exports = governanceEffects;
