import { numWithCommas, generateDots, shortenAddress, createEtherscanLink } from "./Radix-uniswap"

export interface Message {
    type?: "Bought" | "Sold",
    id: string; // Transaction hash
    inputAmount: string; // Transaction amount
    inputToken: {
        symbol: string,
        tokenPriceUSD: string
    },
    outputAmount: string, // Transaction amount
    outputToken: {
        symbol: string,
        tokenPriceUSD: string
    },
    sender: string, // Transaction sender
    swapUSD: string, // Transaction swap
    gasFee: number,
    transaction: {
        gasLimit: string,
        gasPrice: string
    }
}

export function createMessage(options: any, constants) {
    options.type = options.inputToken.symbol == constants.token ? "Sold" : "Bought";
    const gasPriceUSD = options.ethPriceUSD;
    const radixInUsd = Number(options.inputToken.symbol == constants.token ? options.inputToken.tokenPriceUSD : options.outputToken.tokenPriceUSD)
    const radixAmount = Number(options.inputToken.symbol == constants.token ? options.inputAmount : options.outputAmount);
    const otherAmount = Number(options.outputToken.symbol == constants.token ? options.inputAmount : options.outputAmount);
    const otherName = (options.outputToken.symbol == constants.token ? options.inputToken.symbol : options.outputToken.symbol).toUpperCase();
    const gasFee = Number(options.transaction.gasLimit) * Number(options.transaction.gasPrice) / 1e18 * gasPriceUSD;

     return `${options.type == "Bought" ? "🚀" : "👹"} *1 ${constants.token.toUpperCase()} = ${radixInUsd.toFixed(4)} USD*\n` +
            `${options.type} *${numWithCommas(Math.floor(radixAmount * 1000) / 1000)} ${constants.token.toUpperCase()}* for *${numWithCommas(Math.floor(otherAmount * 1000) / 1000)} ${otherName}* on DefiPlaza (Gas Fee: $${numWithCommas(Math.ceil(gasFee))})\n\n` +
            `${generateDots({amountRadixInUsd: options.swapUSD, feedType: options.type == "Bought" ? "uniswapBuy" : "uniswapSell" }, constants)}\n\n` +
            `From address: [${shortenAddress(options.sender)}](${createEtherscanLink("address", options.sender)})\n\n` +
            `🏛 [Defi Plaza](https://defiplaza.net/swap) | 📶 [Tx Hash](${createEtherscanLink("tx", options.id)}) | 📊 [Dextools](https://www.dextools.io/app/ether/pair-explorer/0x684b00a5773679f88598a19976fbeb25a68e9a5f) | 💥 [Powered by Cerby Finance](https://cerby.fi)`
}