import { request } from "../helpers/request";

// GET https://ascendex.com/api/pro/v1/trades?symbol=XRD/USDT

// Config has to state XRD_USDT. to to Kafka unable to handle / in topic names


export async function* sync(latestMessage, settings, logger) {
	while (true) {
		const latest = (await latestMessage())?.value;
		yield await makeRequest(settings, logger, latest);
	}
}

async function makeRequest(settings, logger, latestString?: string) {
	
	const received: Response = await request("GET", `https://ascendex.com/api/pro/v1/trades?symbol=${settings.token.replace('_', '/')}`, {});
	let result: Transaction[] = [];

	if (latestString) {
		const latest: Transaction = JSON.parse(latestString);

		for (let row of received.data.data) {
			if (row.ts > latest.ts) {
				result.push(row);
			}
		}
	} else {
		result = received.data.data;
	}

	return result;
}

interface Response {
	code: string,
	data: {
		m: string,
		symbol: string,
		data: Transaction[]
	}
}

interface Transaction {
	seqnum: number,
	p: string,
	q: string,
	ts: number,
	bm: true // true is buy, false = sell
}