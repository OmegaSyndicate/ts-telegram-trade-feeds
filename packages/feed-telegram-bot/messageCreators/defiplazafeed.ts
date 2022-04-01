import { generateDots, ScanText, CerbyFinance, numWithCommas } from "./helpers";

export function createMessage(options: any, constants) {
    const gasFee = Number(options.transaction.gasLimit) * Number(options.transaction.gasPrice) / 1e18 * options.ethPriceUSD;
    if(options.inputToken.symbol == constants.token || options.outputToken.symbol == constants.token) {
        options.type = options.inputToken.symbol == constants.token ? "Sold" : "Bought";
        const dfpInUsd = Number(options.inputToken.symbol == constants.token ? options.inputToken.tokenPriceUSD : options.outputToken.tokenPriceUSD)
        const dfpAmount = Number(options.inputToken.symbol == constants.token ? options.inputAmount : options.outputAmount);
        const otherAmount = Number(options.outputToken.symbol == constants.token ? options.inputAmount : options.outputAmount);
        const otherName = (options.outputToken.symbol == constants.token ? options.inputToken.symbol : options.outputToken.symbol).toUpperCase();
        return `${options.type == "Bought" ? "🚀" : "👹"} *1 ${constants.token.toUpperCase()} = ${dfpInUsd.toFixed(4)} USD*\n` +
                `${options.type} *${numWithCommas(Math.floor(dfpAmount * 1000) / 1000)} ${constants.token.toUpperCase()}* for *${numWithCommas(Math.floor(otherAmount * 1000) / 1000)} ${otherName}* on DefiPlaza (Gas Fee: $${numWithCommas(Math.ceil(gasFee))})\n\n` +
                `${generateDots(options.swapUSD, constants, options.type == "Bought" ? "🟢" : "🔴" )}\n\n` +
                `From address: ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.account, options.sender)}\n\n` +
                `🏛 [Defi Plaza](https://defiplaza.net/swap) | ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.tx, options.id)} | 📊 [Dextools](https://www.dextools.io/app/ether/pair-explorer/0x820d74078eb4c94e24ef0bcc8ccf848a238f473e) | ${CerbyFinance}`
    } else {
        let symbol, price;
        if(~options.inputToken.symbol.toLowerCase().indexOf('usd') || ~options.inputToken.symbol.toLowerCase().indexOf('dai')) {
            symbol = options.outputToken.symbol;
            price = options.outputToken.tokenPriceUSD;
        } else {
            symbol = options.inputToken.symbol;
            price = options.inputToken.tokenPriceUSD;
        }
        return `🔄 *1 ${symbol.toUpperCase()} = ${(+price).toFixed(4)} USD*\n` +
               `Swapped *${numWithCommas(Math.floor(+options.inputAmount * 1000) / 1000)} ${options.inputToken.symbol.toUpperCase()}* for *${numWithCommas(Math.floor(+options.outputAmount * 1000) / 1000)} ${options.outputToken.symbol.toUpperCase()}* on DefiPlaza (Gas Fee: $${numWithCommas(Math.ceil(gasFee))})\n\n` +
                `${generateDots(options.swapUSD, constants, '🟠')}\n\n` +
                `From address: ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.account, options.sender)}\n\n` +
                `🏛 [Defi Plaza](https://defiplaza.net/swap) | ${ScanText.createScanText(ScanText.ScanChain.ETH, ScanText.ScanType.tx, options.id)} | ${CerbyFinance}`
    }
}