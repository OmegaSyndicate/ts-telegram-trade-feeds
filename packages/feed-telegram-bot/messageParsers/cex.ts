import { Message } from '../messageCreators/cex';

interface zbTransaction {
    date: number,
    amount: string,
    price: string,
    trade_type: "bid" | "ask",
    type: "buy" | "sell",
    tid: number
}


interface mexcTransaction {
    trade_time: number,
    trade_price: string,
    trade_quantity: string,
    trade_type: "BID" | "ASK" // BID - BUY, ASK - SELL
}


interface bkexTransaction {
    direction: "B" | "S", // B - Buy, S - Sell
    price: number,
    symbol: string,
    ts: number, // timestamp
    volume: number
}


interface bitmartTransaction {
    amount: string, // in usd
    order_time: number,
    price: string,
    count: string, // in casper
    type: "sell" | "buy"
}

interface Output {
    type: "sell" | "buy",
    vsSymbol: string,
    inTokens: number,
    price: number,
    anotherPrice?: number
}


export function parser(message: Buffer, logger, settings): Message {
    let msg = JSON.parse(String(message));

    let pair;
    console.log(settings)
    if(settings.pair) {
        pair = settings.pair;
    } else if(msg.pair) {
        pair = msg.pair;
    } else if(msg.symbol) {
        pair = msg.symbol;
    }
    console.log(pair);
    let vsSymbol;
    if(pair.split('_').length > 1) {
        vsSymbol = pair.split('_')[1].toUpperCase();
    } else if(pair.split('-').length > 1) {
        vsSymbol = pair.split('-')[1].toUpperCase();
    }

    msg.vsSymbol = vsSymbol;
    switch(settings.type) {
        case "bitmart":
            msg.price = Number(msg.price);
            msg.inTokens = Number(msg.count);
            return msg;
        case "bkex":
            msg.type = msg.direction == "B" ? 'buy' : 'sell';
            msg.inTokens = msg.volume;
            return msg;
        case "mexc":
            msg.type = msg.trade_type == "BID" ? 'buy' : 'sell';
            msg.price = +msg.trade_price;
            msg.inTokens = +msg.trade_quantity;
            return msg;
        case "zb":
            msg.price = +msg.price;
            msg.inTokens = +msg.amount;
            return msg;
        default:
            logger.error(`Error from cex parser. This type of parser is not supported: ${settings.type}`);
            throw -1;
    }
}