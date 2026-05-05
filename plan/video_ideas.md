# Video ideas

First 10 titles, drawn from the existing Pine Script projects. Each is mapped to a content pillar and source project so we can rotate between pillars and not lean on the same script twice in a row.

| #  | Working title                                                            | Pillar             | Source project        |
|----|--------------------------------------------------------------------------|--------------------|-----------------------|
| 1  | I Backtested the Hull Suite + RSI Strategy on SPY for 5 Years            | Strategy backtest  | Hull + RSI            |
| 2  | Why Hull MA Beats EMA (And When It Doesn't)                              | Indicator breakdown| Hull + RSI            |
| 3  | Tuning the Hull + RSI: How Far Can You Push It Before It Overfits?       | Mistakes           | Hull + RSI            |
| 4  | I Built a Tillson T3 Screener That Scans 50 Tickers in One Click         | Pine Script tutorial | T3 screener         |
| 5  | T3 vs EMA vs HMA: Which Moving Average Actually Catches Trends Earlier?  | Indicator breakdown| T3 screener           |
| 6  | This Is How Pros Mark Daily and Weekly Levels (Without Drawing Anything) | Pine Script tutorial | MTF levels          |
| 7  | Multi-Timeframe Indicators Without the Repaint Trap                      | Mistakes           | MTF levels            |
| 8  | The Opening Range Breakout Strategy, But With Real Levels                | Strategy backtest  | Levels + ORB          |
| 9  | Coding the Opening Range in Pine Script v6 in 8 Minutes                  | Pine Script tutorial | Levels + ORB        |
| 10 | The 5 Backtest Lies That Make Bad Strategies Look Good                   | Mistakes           | (general)             |

## Pillar mix

- Strategy backtest: 2
- Indicator breakdown: 2
- Pine Script tutorial: 3
- Mistakes: 3

Decent rotation. The "Mistakes" pillar tends to overperform on YouTube algo because the curiosity gap is sharper - leaning into 3 of those for the launch run is intentional.

## Notes per video

### 1. Hull Suite + RSI backtest on SPY
- 5-year window so it covers 2020 chop, 2022 drawdown, 2023 rally - shows regime dependence honestly
- Lead with the equity curve, including drawdowns
- End with: "next week, we tune the parameters - and watch what happens to the result"

### 2. Why Hull MA beats EMA
- Visual: same trend, Hull tracks tighter, EMA lags
- Show the math (weighted moving average of weighted moving averages, sqrt period)
- Caveat: Hull whipsaws in chop. Don't hide it.

### 3. Tuning the Hull + RSI (overfitting episode)
- Run 50 parameter combos, show the best
- Then show what happens when you forward-test the "best" combo
- This is the honesty that builds trust = subscribers = RPM

### 4. T3 screener
- Hook: "I'm scanning 50 tickers in one click"
- Code-along format. Build it from scratch.
- Pinned comment: full Pine Script

### 5. T3 vs EMA vs HMA
- Side-by-side on the same chart
- Use 3 different market regimes (trend, chop, reversal)
- No winner - "use the one that fits your bias"

### 6. How pros mark levels
- The MTF levels indicator does it automatically - lead with that
- Then show why those specific levels matter (volume, structure)
- Subtle plug: "if you don't want to draw these by hand, here's the script"

### 7. MTF without repainting
- Repainting is the #1 reason backtests look great and live trading sucks
- Show a repainting indicator vs the right way (`request.security` with `lookahead_off`)
- Educational, not preachy

### 8. ORB with real levels
- Combine the levels indicator with opening range
- Backtest on QQQ for the volatile open
- Honest stats including max drawdown

### 9. Coding ORB in 8 minutes
- Speedrun tutorial format
- Timer in the corner
- Final code in description

### 10. 5 backtest lies
- Listicle, but earned: lookahead bias, no slippage, no commissions, survivorship bias, in-sample only
- Show each one with a TradingView example
- Best evergreen video of the batch - rank-bait but also genuinely educational

## Order to record (suggested)

Lead with the strongest hook, alternate pillars:

1. Video #10 (5 backtest lies) - strongest evergreen, broad appeal, no Pine Script project dependency, easy first launch
2. Video #1 (Hull + RSI backtest) - establishes the channel format
3. Video #4 (T3 screener tutorial) - tutorial pillar, code-along
4. Video #7 (MTF without repainting) - second mistakes video, technical depth
5. Video #2 (Hull MA vs EMA) - indicator breakdown
6. ...continue rotating

Reasoning: launch with the broadest topic (mistakes), then prove you can do strategy + tutorial + indicator content within the first 5 videos so the algo can categorize the channel.
