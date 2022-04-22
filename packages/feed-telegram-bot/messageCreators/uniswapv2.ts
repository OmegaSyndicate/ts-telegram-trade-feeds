import { numWithCommas, generateDots, ScanText, CerbyFinance, getDoubleOffset } from "./helpers";

export interface Message {
    transaction: {
        id: string
      },
      pair: {
        id: string
        token0Price: string //'6.188803945610883316218647766016132',
        token1Price: string // '0.1615821100148442632225806532438304',
        token0: {
          symbol: string //'eXRD',
        },
        token1: {
          symbol: string // 'USDC',
        }
      },
      amount0In: string //'0',
      amount0Out: string //'57981.057704442267737468',
      amount1In: string //'9337.32393',
      amount1Out: string //'0',
      amountUSD: string //'9334.281816012078000053795287812957',
      to: string //'0xf07704777d6bc182bf2c67fbda48913169b84983', // contract
      from: string
      feedType: 'sold' | 'buy'
}

export function createMessage(options: Message, constants) {
    if(constants.moved) {
      return `❗️ Channel is moved to @WiseTokenFeed\n` +
            `❗️ This channel will be removed by 22 May 2022`
    }
    const currentTokenNum: 0 | 1 = options.pair.token0.symbol == constants.token ? 0 : 1;
    const priceByPairToken = +options.pair[`token${+!currentTokenNum}Price`];
    const amountCurrentToken = options.feedType == 'buy' ? options[`amount${currentTokenNum}Out`] : options[`amount${currentTokenNum}In`];
    const amountPairToken = options.feedType == 'sold' ? options[`amount${+!currentTokenNum}Out`] : options[`amount${+!currentTokenNum}In`];
    const pairTokenSymbol = options.pair[`token${+!currentTokenNum}`].symbol;
    const pairTokenStable = options.pair[`token${+!currentTokenNum}`].symbol.toLowerCase().includes('usd');
    const priceUSD = pairTokenStable ? priceByPairToken : +options.amountUSD / +amountCurrentToken;

    return `${options.feedType == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${Number(priceUSD).toFixed(getDoubleOffset(priceUSD))} ${pairTokenStable ? pairTokenSymbol : `USD (${priceByPairToken.toFixed(getDoubleOffset(priceByPairToken))} ${pairTokenSymbol})`}*\n` +
            `${options.feedType == "buy" ? "Bought" : "Sold"} *${numWithCommas((+amountCurrentToken).toFixed(getDoubleOffset(+amountCurrentToken)))} ${constants.token}* for *${numWithCommas((+amountPairToken).toFixed(getDoubleOffset(+amountPairToken)))} ${pairTokenSymbol}${pairTokenStable ? '' : ` (${numWithCommas(Math.ceil(+options.amountUSD))}$)`}* on Uniswap V2\n\n` +
            `${generateDots(+options.amountUSD, constants, options.feedType == "buy" ? "🟢" : "🔴")}\n\n` +
            `From address: ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.account, options.from)}\n\n` +
            `🦄 [Uniswap V2](https://v2.info.uniswap.org/pair/${options.pair.id}) | ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.tx, options.transaction.id)} | 📊 [Dextools](https://www.dextools.io/app/ether/pair-explorer/${options.pair.id}) | ${CerbyFinance}`
}

