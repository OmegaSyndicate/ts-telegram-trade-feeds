declare var Parse: any;

export class ParseStateStore {
	async load(fn: Function) {
		const config = await Parse.Config.get({
			useMasterKey: true
		});
		const migrations = config.get('node-migrate') || {};

		fn(null, migrations);
	}

	async save(set: any, fn: Function) {
		await Parse.Config.save({
			'node-migrate': {
				lastRun: set.lastRun,
				migrations: set.migrations
			}
		}, {
			'node-migrate': true // make node-migrate private and masterKey only
		});

		fn();
	}
}
