import { shortenAddress } from "./Radix-uniswap";
import { generateDots } from "./Wise-stakes-uniswap";
import { getDoubleOffset, numWithCommas } from "./uniswapv2";

export interface Message {
    transaction: {
        id: string
    },
    pool: {
        id: string
        token0: {
            symbol: string //'eXRD'
        },
        token1: {
            symbol: string // 'WETH'
        }
    },
    origin: string //'0x3535c09a553cc00d1d8322cac2d10f8813560d8d',
    amount0: string// '2849.263250686660608297',
    amount1: string// '-0.134034483360981099',
    amountUSD: string //'455.9956933813455862936782876258156',
    feedType: 'sold' | 'buy'
}

export function createMessage(options: Message, constants) {
    const currentTokenNum: 0 | 1 = options.pool.token0.symbol == constants.token ? 0 : 1;
    const amountCurrentToken = Math.abs(+options[`amount${currentTokenNum}`]);
    const amountPairToken = Math.abs(+options[`amount${+!currentTokenNum}`]);
    const priceByPairToken = amountPairToken / amountCurrentToken;
    const pairTokenSymbol = options.pool[`token${+!currentTokenNum}`].symbol;
    const pairTokenStable = pairTokenSymbol.toLowerCase().includes('usd');
    const priceUSD = pairTokenStable ? priceByPairToken : +options.amountUSD / +amountCurrentToken

    return `${options.feedType == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${Number(priceUSD).toFixed(getDoubleOffset(priceUSD))} ${pairTokenStable ? pairTokenSymbol : `USD (${priceByPairToken.toFixed(getDoubleOffset(priceByPairToken))} ${pairTokenSymbol})`}*\n` +
            `${options.feedType == "buy" ? "Bought" : "Sold"} *${numWithCommas((+amountCurrentToken).toFixed(getDoubleOffset(+amountCurrentToken)))} ${constants.token}* for *${numWithCommas((+amountPairToken).toFixed(getDoubleOffset(+amountPairToken)))} ${pairTokenSymbol}${pairTokenStable ? '' : ` (${numWithCommas(Math.ceil(+options.amountUSD))}$)`}* on Uniswap V3\n\n` +
            `${generateDots(options.amountUSD, constants, options.feedType == "buy" ? "🟢" : "🔴")}\n\n` +
            `From address: [${shortenAddress(options.origin)}](https://etherscan.io/address/${options.origin})\n\n` +
            `🦄 [Uniswap V3](https://v3.info.uniswap.org/#/pools/${options.pool.id}) | 📶 [Tx Hash](https://etherscan.io/tx/${options.transaction.id}) | 📊 [Dextools](https://www.dextools.io/app/ether/pair-explorer/${options.pool.id}) | 💥 [Powered by Cerby Finance](https://cerby.fi)`
}