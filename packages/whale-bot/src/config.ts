export interface WhaleConfig {
	logsChat: string
	trackers: TrackerConfig[]
}

export interface TrackerConfig {
	type: string,
	token: string,
	fromTimestamp: number,
	minUSD: number,
	synchronizeInterval: number,
	publishers: PublisherConfig[]
}

export interface PublisherConfig {
	channel: string
}

export const Config: WhaleConfig = {
	logsChat: "@feedLogs",
	trackers: [
		// {
		// 	"token": "eXRD",
		// 	"pairs": ["0x684b00a5773679f88598a19976fbeb25a68e9a5f"],
		// 	"type": "uniswapv2",
		// 	"synchronizeIntervalMs": 30000,
		// 	"fromTimestamp": 1654603762,
		// 	"publishers": [
		// 		{
		// 			"channel": "@xrdtrades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 2500,
		// 			"withSync": false
		// 		}
		// 	]
		// },
		// {
		// 	"token": "eXRD",
		// 	"tokenHash": "0x6468e79a80c0eab0f9a2b574c8d5bc374af59414",
		// 	"type": "uniswapv3",
		// 	"synchronizeIntervalMs": 30000,
		// 	"fromTimestamp": 1654603762,
		// 	"publishers": [
		// 		{
		// 			"channel": "@xrdtrades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 2500,
		// 			"withSync": false
		// 		}
		// 	]
		// },
		// {
		// 	"token": "tXRDUSD",
		// 	"type": "bitfinex",
		// 	"synchronizeIntervalMs": 30000,
		// 	"publishers": [
		// 		{
		// 			"channel": "@xrdtrades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 2500,
		// 			"withSync": false,
		// 			"fromTimestamp": 1654466400
		// 		}
		// 	]
		// },
		// {
		// 	"token": "tXRDBTC",
		// 	"type": "bitfinex",
		// 	"synchronizeIntervalMs": 30000,
		// 	"fromTimestamp": 1655203646,
		// 	"publishers": [
		// 		{
		// 			"channel": "@xrdtrades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 2500,
		// 			"withSync": false,
		// 			"fromTimestamp": 1655203646
		// 		}
		// 	]
		// },
		// {
		// 	"token": "EXRD-USDT",
		// 	"type": "kucoin",
		// 	"synchronizeIntervalMs": 30000,
		// 	"publishers": [
		// 		{
		// 			"channel": "@xrdtrades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 2500,
		// 			"withSync": false,
		// 			"fromTimestamp": 1654466400
		// 		}
		// 	]
		// },
		// {
		// 	"token": "xrd_usdt",
		// 	"type": "mexc",
		// 	"synchronizeIntervalMs": 30000,
		// 	"fromTimestamp": 1654812000,
		// 	"publishers": [
		// 		{
		// 			"channel": "@xrdtrades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 2500,
		// 			"withSync": false
		// 		}
		// 	]
		// },
		{
			token: "XRD_USDT",
			type: "Digifinex",
			synchronizeInterval: 3000,
			fromTimestamp: 1657288572,
			minUSD: 4,
			publishers: [
				{
					"channel": "@feedlogs",
				}
			]
		},
		// {
		// 	"token": "eXRD",
		// 	"type": "defiplaza",
		// 	"synchronizeIntervalMs": 30000,
		// 	"fromTimestamp": 1654603762,
		// 	"publishers": [
		// 		{
		// 			"channel": "@xrdtrades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 1000,
		// 			"withSync": false
		// 		}
		// 	]
		// },
		// {
		// 	"token": "DFP2",
		// 	"type": "defiplaza",
		// 	"synchronizeIntervalMs": 30000,
		// 	"fromTimestamp": 1654603762,
		// 	"publishers": [
		// 		{
		// 			"channel": "@dfp2trades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 1000,
		// 			"withSync": false,
		// 			"fromTimestamp": 1654466400
		// 		}
		// 	]
		// },
		// {
		// 	"token": "DFP2",
		// 	"pairs": ["0x820d74078eb4c94e24ef0bcc8ccf848a238f473e"],
		// 	"type": "uniswapv2",
		// 	"synchronizeIntervalMs": 30000,
		// 	"fromTimestamp": 1654603762,
		// 	"publishers": [
		// 		{
		// 			"channel": "@dfp2trades",
		// 			"USDInterval": 1000,
		// 			"minUSD": 1000,
		// 			"withSync": false
		// 		}
		// 	]
		// },
		// {
		// 	"type": "defiplazafeed",
		// 	"synchronizeIntervalMs": 30000,
		// 	"fromTimestamp": 1654603762,
		// 	"publishers": [
		// 		{
		// 			"channel": "@DefiPlazaFeed",
		// 			"USDInterval": 1000,
		// 			"minUSD": 1000,
		// 			"withSync": false
		// 		}
		// 	]
		// }
	]
}
