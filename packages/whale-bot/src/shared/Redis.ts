import { createClient, RedisClientType } from 'redis';
import { parentPort } from 'worker_threads';

let redis: RedisClientType;

export default async function getRedisInstance() {
	if (!redis) {
		redis = await createClient();
		
		redis.on('error', (err: Error) => parentPort?.postMessage('Redis Client Error', err));

		await redis.connect();
	}

	return redis;
}