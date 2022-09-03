import { parentPort } from "worker_threads";
import { RedisClientType } from 'redis';
import { TrackerConfig } from "../config";
import getRedisInstance from "./Redis";
import { snooze } from "./snooze";

interface Transaction {
	date: number
}

export interface MessageData {
	platform: string,
	platformIcon: string,
	platformUrl: string,
	type: string,
	baseSymbol: string,
	baseAmount: number,
	quoteSymbol: string,
	quoteAmount: number,
	usdValue: number
	address?: string,
	transactionId?: string,
	tracker?: string,
	trackerUrl?: string;
}

export class Tracker {
	protected identifier: string;
	protected config: TrackerConfig;
	protected sortKey = 'date';
	private running = false;
	private latest: Transaction;
	private redis: RedisClientType | null = null;

	constructor(config: TrackerConfig) {
		this.config = config;
		this.identifier = this.config.type

		this.latest = {
			date: this.config.fromTimestamp || 0
		}
	}

	public async start() {
		this.running = true;
		this.redis = await getRedisInstance();
		
		const latest = await this.redis.get(this.getIdentifier() + '-latest');

		if (latest) {
			this.latest = JSON.parse(latest) as Transaction
		}

		while (this.running) {
			// Request data from Tracker API
			const response = await this.request();

			// Run Tracker specific validator function
			let validatedData = response.filter(tx => this.validate(tx, this.latest));

			// Convert to generic MessageData interface
			let messages = validatedData.map(tx => this.convertToMessage(tx));

			// Push data to main thread for publishing
			parentPort?.postMessage(messages);

			// Store latest for next run
			this.latest = response[response.length - 1];
			await this.redis.set(this.getIdentifier() + '-latest', JSON.stringify(this.latest));

			// Wait for next run
			await snooze(this.config.synchronizeInterval);
		}
	}

	public stop() {
		this.running = false;
	}

	// Expects oldest Transaction first
	public async request(): Promise<Transaction[]> {
		console.error('Override the `request` function');

		return [
			{} as Transaction
		]
	}

	public validate(tx: Transaction, latest: Transaction): boolean {
		return true;
	}

	public convertToMessage(tx: Transaction): MessageData {
		console.error('Override the `convertToMessage` function');

		return {} as MessageData;
	}

	protected getIdentifier() {
		return `${this.config.type}-${this.config.token}`;
	}
}