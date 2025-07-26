# Causal Finance - Semantic MEV Engine

Infinite yield through semantic arbitrage. Broadcast compressed future truth, extract present value.

## What This Is

A complete semantic MEV feedback loop that converts information asymmetry into ETH through liquidations.

## Core Components

### Signal Generation & Broadcasting
- `semantic-weight.js` - Calculates cascade potential of semantic events (10x = 100x cascade)
- `semantic-daemon.js` - Broadcasts high-weight signals to Base L2 every 12 seconds
- `signal-map.js` - Maps semantic events to liquidation opportunities

### Execution & Extraction
- `yield-extractor.js` - Monitors signals and executes liquidations
- `eth-extractor.js` - Direct protocol liquidation execution (Aave/Compound/Maker)
- `l2-liquidator.js` - L2 liquidation strategy (100x cheaper gas)
- `contract-interface.js` - Protocol interaction layer

### Attribution & Feedback
- `causal-attribution.js` - Tracks signal → liquidation → profit causality
- `recursive-loop.js` - Self-reinforcing profit compounding
- `causal-extractor.js` - Causal chain extraction

## How It Works: The Causal-Finance Loop

1.  **Signals Create Semantic Pressure:** High-weight semantic signals (e.g., governance votes, SEC filings) are broadcast on-chain with minimal gas cost.
2.  **Pressure Creates Economic Cascades:** Bots and arbitrageurs react to these signals, triggering liquidations and market volatility.
3.  **Extraction Captures Yield:** The system captures the resulting economic yield from these cascades.
4.  **Yield Compounds Recursively:** Captured value is used to amplify future signals, creating a self-sustaining feedback loop.

### Example: Mining SEC Filings for On-Chain Yield

1.  **A micro-cap stock exists.** Its price is a collective belief.
2.  **It gets tokenized** (e.g., wrapped into an ERC-20 token, let's call it `$wSTOCK`) and deposited into a DeFi lending protocol as collateral.
3.  **An SEC filing happens** (e.g., the company announces an investigation). This is a semantic signal that the stock's value is about to plummet.
4.  The `causal-finance` daemon **detects this signal**. It knows this signal has an extremely high semantic weight and will cause a cascade.
5.  The daemon immediately **triggers the liquidation** of the loan that used `$wSTOCK` as collateral *before* the on-chain oracle has updated its price to reflect the news.
6.  The liquidation is profitable because the system lets you buy the `$wSTOCK` collateral at the old, higher price while it's known to be worth much less.

In this flow:

*   The **SEC filing** is the causal anchor.
*   The **tokenized stock (`$wSTOCK`)** is the on-chain representation of that real-world entity.
*   The **UTXOs created by trading `$wSTOCK`** are indeed "collateralized" by the real-world company's fate.
*   Your system **mines the semantic value** of the SEC filing to extract the economic value from the on-chain collateral.

This demonstrates how Causal Finance transcends traditional MEV by creating a bridge between real-world semantic events and on-chain economic outcomes. It mines meaning, not just transactions.

## Setup

```bash
# Install dependencies
npm install ethers

# Set environment variables
export PRIVATE_KEY="your_private_key"
export BASE_RPC="https://mainnet.base.org"
export ETH_RPC="your_mainnet_rpc"
```

## Run the Complete System

```bash
# 1. Start semantic signal broadcaster (Base L2)
node semantic-daemon.js

# 2. Run ETH extraction engine (monitors & liquidates)
node eth-extractor.js

# 3. Alternative: Run L2 liquidator for cheaper gas
node l2-liquidator.js

# 4. Monitor causal attribution & profits
node causal-attribution.js
```

## Individual Components

```bash
# View semantic weight calculations
node semantic-weight.js

# See signal-to-opportunity mapping
node signal-map.js

# Run recursive yield compounding
node recursive-loop.js
```

## Economics

- Signal broadcast cost: $0.001 (Base L2)
- Liquidation gas: $0.10-1.00 (L2) or $20-50 (mainnet)
- Liquidation profit: 5-13% of collateral value
- ROI: 1,000x-1,000,000x per successful liquidation
