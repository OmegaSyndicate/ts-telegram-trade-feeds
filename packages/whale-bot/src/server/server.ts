// const { Appsignal } = require('@appsignal/nodejs');
// const { expressMiddleware } = require('@appsignal/express');
// import { revision } from '../git-revision';

// const appsignal = new Appsignal({
// 	active: true,
// 	name: 'GroundControl Platform',
// 	revision: revision,
// 	ignoreActions: ['GET /api/health', 'GET [unknown route]'],
// });

// console.log('Starting at', new Date());
// console.log('Environment', process.env.NODE_ENV);
// console.log('App revision', revision);

// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { ParseServer, RedisCacheAdapter } from 'parse-server';
// import ParseDashboard from 'parse-dashboard';
// import { load } from 'migrate';
// import { ParseStateStore } from './parse-statestore';
// // import { expressErrorHandler } from '@appsignal/express/dist/middleware';

// // Enable .env support
// dotenv.config();

// // Enable sourcemaps
// require('source-map-support').install();

// // Better logging for errors within promises
// process.on('unhandledRejection', console.error);

// const port = process.env.PORT || 1337;
// const parseMount = process.env.PARSE_MOUNT || '/api';

// const liveQueryClasses = ['Exchange', 'Publisher', 'Tracker'];
// const appName = process.env.APP_NAME || 'Whales';

// /**
//  * Setup Parse Server
//  */
// let parseConfig = {
// 	databaseURI: process.env.DATABASE_URI,
// 	appId: process.env.APP_ID,
// 	javascriptKey: process.env.JS_KEY,
// 	masterKey: process.env.MASTER_KEY,
// 	serverURL: 'http://localhost:' + port + parseMount,

// 	appName: appName,
// 	publicServerURL: process.env.PUBLIC_URL + parseMount,
// 	verifyUserEmails: true,
// 	// Do not set to true and handle email verification ourselves
// 	// So user does not have to login again after verification
// 	preventLoginWithUnverifiedEmail: false,
// 	enableAnonymousUsers: false,
// 	allowClientClassCreation: false,

// 	// Optimize performance by access Parse directly in cloud functions
// 	directAccess: true,
// 	enableSingleSchemaCache: true,
// 	maxUploadSize: '40mb',
// 	logLevel: process.env.NODE_ENV == 'production' ? 'error' : 'info',

// 	// for Appsignal
// 	enableExpressErrorHandler: true,

// 	// Do not expire sessions after one year
// 	expireInactiveSessions: false,

// 	// account lockout policy setting (OPTIONAL) - defaults to undefined
// 	// if the account lockout policy is set and there are more than `threshold` number of failed login attempts then the `login` api call returns error code `Parse.Error.OBJECT_NOT_FOUND` with error message `Your account is locked due to multiple failed login attempts. Please try again after <duration> minute(s)`. After `duration` minutes of no login attempts, the application will allow the user to try login again.
// 	accountLockout: {
// 		duration: 5, // duration policy setting determines the number of minutes that a locked-out account remains locked out before automatically becoming unlocked. Set it to a value greater than 0 and less than 100000.
// 		threshold: 5, // threshold policy setting determines the number of failed sign-in attempts that will cause a user account to be locked. Set it to an integer value greater than 0 and less than 1000.
// 	},
// 	// optional settings to enforce password policies
// 	passwordPolicy: {
// 		// Two optional settings to enforce strong passwords. Either one or both can be specified.
// 		// If both are specified, both checks must pass to accept the password
// 		// 1. a RegExp object or a regex string representing the pattern to enforce
// 		// validatorPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/, // enforce password with at least 8 char with at least 1 lower case, 1 upper case and 1 digit
// 		// 2. a callback function to be invoked to validate the password
// 		// validatorCallback: (password) => { return validatePassword(password) },
// 		// validationError: 'Password must contain at least 1 digit.', // optional error message to be sent instead of the default "Password does not meet the Password Policy requirements." message.
// 		doNotAllowUsername: true, // optional setting to disallow username in passwords
// 		// maxPasswordAge: 90, // optional setting in days for password expiry. Login fails if user does not reset the password within this period after signup/last reset.
// 		// maxPasswordHistory: 5, // optional setting to prevent reuse of previous n passwords. Maximum value that can be specified is 20. Not specifying it or specifying 0 will not enforce history.
// 		//optional setting to set a validity duration for password reset links (in seconds)
// 		resetTokenValidityDuration: 24 * 3600, // expire after 24 hours
// 	},

// 	cloud: __dirname + '/cloud.js',

// 	liveQuery: {
// 		classNames: liveQueryClasses, // List of classes to support for query subscriptions example: [ 'Posts', 'Comments' ]
// 	},

// 	// make sure sensitive information of the Account class is only shared with masterKey
// 	// protectedFields: {
// 	// 	'Account': {
// 	// 	  '*': ['stripeCustomerId', 'stripeSubscriptionId', 'stripePriceId', 'moneybirdCustomerId'],
// 	// 	  'role:admin': []
// 	// 	}
// 	// },

// 	// emailAdapter: {
// 	// 	module: EmailAdapter,
// 	// },

// 	customPages: {
// 		// invalidLink: '.....',
// 		verifyEmailSuccess: process.env.PUBLIC_URL + '/',
// 		choosePassword: process.env.PUBLIC_URL + '/resetPassword',
// 		passwordResetSuccess: process.env.PUBLIC_URL + '/resetPasswordThankyou',
// 	},
// } as any;

// const parseLiveQueryConfig = {
// 	// appId: process.env.APP_ID,
// 	// masterKey: process.env.MASTER_KEY,
// 	// keyPairs: {
// 	// 	masterKey: process.env.MASTER_KEY
// 	// },
// 	// serverURL: 'http://localhost:' + port + parseMount,
// 	websocketTimeout: 10 * 1000,
// 	cacheTimeout: 60 * 600 * 1000,
// 	logLevel: 'VERBOSE'
// } as any;

// if (process.env.REDIS_URL) {
// 	parseConfig.cacheAdapter = new RedisCacheAdapter({
// 		url: process.env.REDIS_URL
// 	});

// 	parseConfig.liveQuery.redisURL = process.env.REDIS_URL;
// 	parseConfig.liveQuery.redisOptions = { socket_keepalive: true };

// 	parseLiveQueryConfig.redisURL = process.env.REDIS_URL;
// 	parseLiveQueryConfig.redisOptions = { socket_keepalive: true };
// }

// // @ts-ignore
// const api = new ParseServer(parseConfig);

// // Setup Parse Dashboard
// // @ts-ignore
// const dashboard = new ParseDashboard(
// 	{
// 		apps: [
// 			{
// 				serverURL: process.env.PUBLIC_URL + parseMount,
// 				appId: process.env.APP_ID,
// 				masterKey: process.env.MASTER_KEY,
// 				appName: appName,
// 				production: true,
// 			},
// 		],
// 		users: [
// 			{
// 				user: process.env.DASH_USER,
// 				pass: process.env.DASH_PASS,
// 			},
// 		],
// 	},
// 	{
// 		allowInsecureHTTP: true,
// 		cookieSessionSecret: 'sljghwlsfnw;afhjwn;vlhnwib;gohivwo[g;vnweia;gvwba;fevqwjabfl;',
// 	}
// );

// const app = express();

// app.disable('x-powered-by');

// // Enable CORS headers
// // Allow everything for now
// // app.options('*', cors());
// // app.use(cors());

// // Serve static assets from the /public folder
// // app.use(express.static(path.join(__dirname, '/../client/')));

// // Track with appsignal
// // ADD THIS AFTER ANY OTHER EXPRESS MIDDLEWARE, BUT BEFORE ANY ROUTES!
// // app.use(expressMiddleware(appsignal));

// // Serve the Parse API on the /parse URL prefix
// app.use(parseMount, api);

// // Add dashboard
// app.use('/parse-dashboard', dashboard);

// // Serve the Parse API on the /parse URL prefix
// app.use(parseMount, api);

// // Route 404's to index.html, so Angular can handle the parsing
// // app.get('*', (req, res) => {
// // 	res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
// // });

// // Track errors with appsignal
// // ADD THIS AFTER ANY OTHER EXPRESS MIDDLEWARE, BUT BEFORE ANY ROUTES!
// // app.use((err, req, res, next) => {
// // 	// Do not log internal Parse.Errors
// // 	if (err instanceof Parse.Error) {
// // 		console.log('Ignoring Parse.Error');
// // 		return next(err);
// // 	}

// // 	const span = appsignal.tracer().currentSpan();
// // 	if (!span) {
// // 		return next(err);
// // 	}
// // 	// if there's no `status` property, forward the error
// // 	// we also ignore client errors here
// // 	if (err && (!err.status || (err.status && err.status >= 500))) {
// // 		span.addError(err);
// // 	}
// // 	return next(err);
// // });

// // Fix up Parse.Error handling for Express
// // app.use(function (err, req, res, next) {
// // 	if (!err) {
// // 		return next(err, req, res);
// // 	}

// // 	let httpStatus;

// // 	switch (err.code) {
// // 		case Parse.Error.INTERNAL_SERVER_ERROR:
// // 			httpStatus = 500;
// // 			break;

// // 		case Parse.Error.OBJECT_NOT_FOUND:
// // 			httpStatus = 404;
// // 			break;

// // 		default:
// // 			httpStatus = 400;
// // 	}

// // 	res.status(httpStatus);
// // 	res.json({
// // 		code: err.code,
// // 		error: err.message,
// // 	});

// // 	return next(err, req, res);
// // });

// const httpServer = require('http').createServer(app);
// httpServer.listen(port, function () {
// 	console.log('Running on http://localhost:' + port);
// });

// // This will enable the Live Query real-time server
// const liveQueryServer = ParseServer.createLiveQueryServer(httpServer, parseLiveQueryConfig);

// // Evertything is running, start migrations
// const m = load(
// 	{
// 		stateStore: new ParseStateStore(),
// 	},
// 	(err: string, set: any) => {
// 		if (err) {
// 			console.error(err);
// 			throw new Error(err);
// 		}

// 		set.on('migration', function (migration: any, direction: string) {
// 			console.log('## Migration: ', direction, migration.title);
// 		});

// 		set.up((err: string) => {
// 			if (err) {
// 				console.error(err);
// 				throw new Error(err);
// 			}

// 			console.log('migrations successfully ran');
// 		});
// 	}
// );