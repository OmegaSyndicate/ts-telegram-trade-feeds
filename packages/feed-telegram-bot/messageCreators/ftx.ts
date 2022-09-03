import { numWithCommas, generateDots, CerbyFinance } from "./helpers"

export interface Message {
    id: number,
    price: number,
    size: number,
    side: "sell" | "buy",
    liquidation: boolean,
    time: Date
}

export function createMessage(options: Message, constants) {
    return `${options.side == "buy" ? "🚀" : "👹"} *1 ${constants.token} = ${options.price.toFixed(constants.priceDigit)} USD*\n`
    +   `${options.side == "buy" ? "Bought" : "Sold"} *${numWithCommas(Math.ceil(options.size))} ${constants.token}* for *${numWithCommas(Math.ceil(options.size * options.price))} USD* on FTX\n\n`
    +   `${generateDots(options.size * options.price, constants, options.side == "buy" ? "🟢" : "🔴")}\n\n`
    +   `${constants.mainLink} | 📚 [FTX](${constants.tradeLink}) ${CerbyFinance}`
}