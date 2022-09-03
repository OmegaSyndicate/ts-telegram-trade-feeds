import fetch from 'node-fetch';
import { MessageData } from '../Tracker';
import { Tracker } from '../Tracker';

interface ApiResponse {
	data: Transaction[],
	date: number,
	code: number
}

export interface Transaction {
	id: number,
	date: number,
	type: "buy" | "sell", // BID - BUY, ASK - SELL
	amount: number,
	price: number
}

export class Digifinex extends Tracker {

	public async request(): Promise<Transaction[]> {
		const response = await fetch(`https://openapi.digifinex.com/v3/trades?symbol=${this.config.token}`);
		const received = await response.json() as ApiResponse;
		
		// Oldest first
		return received.data.reverse();
	}

	public validate(tx: Transaction, latest: Transaction): boolean {
		if (tx.date <= this.config.fromTimestamp) {
			return false;
		}

		if (latest && tx.date <= latest.date) {
			return false;
		}

		if ((+tx.amount * +tx.price) < this.config.minUSD) {
			return false;
		}

		// Run generic validator checks
		return super.validate(tx, latest);
	}

	public convertToMessage(tx: Transaction): MessageData {
		const symbols = this.config.token.split('_');

		const messageData: MessageData = {
			platform: 'Digifinex',
			platformIcon: '▶️',
			platformUrl: `https://www.digifinex.com/en-ww/trade/${this.config.token.replace('_', '/')}/`,
			type: tx.type == 'buy' ? 'Bought' : 'Sold',
			baseSymbol: symbols[0].toUpperCase(),
			baseAmount: tx.amount,
			quoteSymbol: symbols[1].toUpperCase(),
			quoteAmount: tx.amount * tx.price,
			usdValue: tx.amount * tx.price
		}

		return messageData;
	}
}