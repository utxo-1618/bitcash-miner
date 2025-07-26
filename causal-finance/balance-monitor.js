#!/usr/bin/env node

const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

class BalanceMonitor {
    constructor() {
        this.privateKey = process.env.PRIVATE_KEY;
        if (!this.privateKey) {
            console.error('Error: PRIVATE_KEY not set');
            process.exit(1);
        }
        
        const wallet = new ethers.Wallet(this.privateKey);
        this.address = wallet.address;
        
        this.chains = {
            ethereum: {
                rpc: process.env.ETH_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo',
                name: 'Ethereum',
                symbol: 'ETH'
            },
            base: {
                rpc: process.env.BASE_RPC || 'https://mainnet.base.org',
                name: 'Base',
                symbol: 'ETH'
            },
            arbitrum: {
                rpc: 'https://arb1.arbitrum.io/rpc',
                name: 'Arbitrum',
                symbol: 'ETH'
            },
            optimism: {
                rpc: 'https://mainnet.optimism.io',
                name: 'Optimism',
                symbol: 'ETH'
            }
        };
        
        this.profitLogPath = path.join(__dirname, 'logs', 'karmic-reflections.json');
        this.balanceHistory = [];
    }
    
    async checkAllBalances() {
        console.log('BALANCE CHECK: Address', this.address);
        let totalValueUSD = 0;
        const ethPrice = await this.getETHPrice();
        
        for (const [chainId, config] of Object.entries(this.chains)) {
            try {
                const provider = new ethers.JsonRpcProvider(config.rpc);
                const balance = await provider.getBalance(this.address);
                const ethBalance = parseFloat(ethers.formatEther(balance));
                const usdValue = ethBalance * ethPrice;
                
                console.log(`[${config.name}] ${ethBalance.toFixed(6)} ${config.symbol} ($${usdValue.toFixed(2)})`);
                
                totalValueUSD += usdValue;
                
                this.balanceHistory.push({
                    chain: chainId,
                    balance: ethBalance,
                    usdValue,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                console.error(`Error: ${config.name}: ${error.message}`);
            }
        }
        
        console.log(`TOTAL USD VALUE: $${totalValueUSD.toFixed(2)}`);
        
        await this.checkCausalProfits();
        await this.saveHistory();
        
        return totalValueUSD;
    }
    
    async getETHPrice() {
        return 2000;
    }
    
    async checkCausalProfits() {
        try {
            const causalData = await fs.readFile(
                path.join(__dirname, 'causal-profits.json'),
                'utf8'
            );
            const profits = JSON.parse(causalData);
            
            if (profits.profits && profits.profits.length > 0) {
                console.log('CAUSAL PROFIT ATTRIBUTION:');
                
                const recentProfits = profits.profits
                    .slice(-5)
                    .map(([txHash, data]) => data);
                
                let totalProfit = 0;
                recentProfits.forEach(profit => {
                    console.log(`Signal: ${profit.signalId.substring(0, 16)}...`);
                    console.log(`Profit: ${profit.netProfit.toFixed(4)} ETH`);
                    totalProfit += profit.netProfit;
                });
                
                console.log(`Recent Profit Total: ${totalProfit.toFixed(4)} ETH`);
            }
        } catch (error) {
            console.error('Error: Reading causal profits');
        }
    }
    
    async saveHistory() {
        try {
            await fs.mkdir(path.dirname(this.profitLogPath), { recursive: true });
            
            let history = [];
            try {
                const existing = await fs.readFile(this.profitLogPath, 'utf8');
                history = JSON.parse(existing);
            } catch (e) {}
            
            history.push({
                timestamp: Date.now(),
                balances: this.balanceHistory.slice(-4),
                totalUSD: this.balanceHistory.reduce((sum, b) => sum + b.usdValue, 0)
            });
            
            if (history.length > 1000) {
                history = history.slice(-1000);
            }
            
            await fs.writeFile(this.profitLogPath, JSON.stringify(history, null, 2));
            
        } catch (error) {
            console.error('Error: Failed to save history:', error.message);
        }
    }
    
    async generateReport() {
        try {
            const history = JSON.parse(
                await fs.readFile(this.profitLogPath, 'utf8')
            );
            
            if (history.length < 2) return;
            
            const firstSnapshot = history[0];
            const lastSnapshot = history[history.length - 1];
            
            const totalGain = lastSnapshot.totalUSD - firstSnapshot.totalUSD;
            const timeElapsed = (lastSnapshot.timestamp - firstSnapshot.timestamp) / 1000 / 60 / 60; // hours
            const gainPerHour = totalGain / timeElapsed;
            
            console.log('REPORT:');
            console.log(`Initial Balance: $${firstSnapshot.totalUSD.toFixed(2)}`);
            console.log(`Current Balance: $${lastSnapshot.totalUSD.toFixed(2)}`);
            console.log(`Total Gain: $${totalGain.toFixed(2)}`);
            console.log(`Gain/Hour: $${gainPerHour.toFixed(2)}`);
            console.log(`Time Running: ${timeElapsed.toFixed(1)} hours`);
            
        } catch (error) {}
    }
}

async function main() {
    const monitor = new BalanceMonitor();
    console.log('Starting Balance Monitor');
    
    await monitor.checkAllBalances();
    await monitor.generateReport();
    
    if (process.env.PM2_CRON_RESTART) {
        process.exit(0);
    }
    
    setInterval(async () => {
        await monitor.checkAllBalances();
        await monitor.generateReport();
    }, 5 * 60 * 1000);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BalanceMonitor;
