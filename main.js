'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const request = require('request');
const moment = require("moment");

const words = require('./admin/words.js');

let language = 'en';
let _ = null;
var requestInterval;

class Tailscale extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'tailscale',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));

		this.isAdapterStart = false;

		this.endPoints = {
			devices: "devices",
		}
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		try {
			await this.prepareTranslation();

			this.isAdapterStart = true;

			await Promise.allSettled(this.config.accounts.map((account) => this.refreshAccount(account)));

			this.isAdapterStart = false;

		} catch (err) {
			this.log.error(`[onReady] error: ${err.message}, stack: ${err.stack}`);
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			clearTimeout(requestInterval);
			this.log.info('cleaned everything up...');
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * @param {object} account
	 */
	async refreshAccount(account) {
		let logPrefix = `[refreshAccount] [${account.user}]`
		try {
			if (account.enabled) {
				this.log.info(`${logPrefix} getting data from tailscale api${this.isAdapterStart ? '( Adapter restart)' : ''}`);

				for (const [key, endpoint] of Object.entries(this.endPoints)) {
					await this.refreshEndpoints(account, endpoint);
				}

				if (requestInterval) requestInterval = null;

				if (account.interval && account.interval > 0) {
					requestInterval = setTimeout(() => {
						this.refreshAccount(account);
					}, account.interval * 1000);
				} else {
					this.log.info(`${logPrefix} polling interval is deactivated`);
				}
			}
		} catch (err) {
			this.log.error(`${logPrefix} error: ${err.message}, stack: ${err.stack}`);
		}
	}


	/**
	 * @param {object} account
	 * @param {string} endpoint
	 */
	async refreshEndpoints(account, endpoint) {
		let logPrefix = `[refreshEndpoints] [${account.user}] [${endpoint}]`

		try {
			const objStructure = require(`./lib/${endpoint}.json`);

			this.log.debug(`${logPrefix} endpoint structure loaded successful.`);
			this.log.silly(`${logPrefix} endpoint structure: ${JSON.stringify(objStructure)}`);

			let that = this;
			request({
				url: this.getEndpoints(endpoint, account.user),
				auth: {
					'user': await this.decryptValue(account.api),
					'pass': await this.decryptValue(account.password)
				}
			}, async function (error, response, body) {
				if (!error && response.statusCode == 200) {
					that.log.silly(`${logPrefix} result: ${body}`);

					let result = JSON.parse(body);
					if (result && result[endpoint]) {
						for (const item of result[endpoint]) {
							let datapointPrefix = `${account.channelName ? account.channelName : account.user.replace(/\./g, '_')}.${endpoint}`.replace(/[*?"'\[\]\s]/g, "_");
							let name = item.id;

							if (item.name) {
								name = item.name.substring(0, item.name.indexOf('.')).replace(/\-/g, '.');
							}

							datapointPrefix = `${datapointPrefix}.${name}`; 	// ToDo: Prüfen ob Datenpunkte schon existieren -> dann warn und skip + info in tailscale umbennenen

							for (const [key, value] of Object.entries(item)) {
								if (objStructure[key]) {
									if (Array.isArray(objStructure[key])) {
										if (objStructure[key].length === value.length) {
											for (var i = 0; i <= value.length - 1; i++) {
												// Todo: geht noch nicht
												await that.createOrUpdateState(`${datapointPrefix}.${objStructure[key][i].id}`, objStructure[key][i].type, objStructure[key][i].name, value[i]);
											}
										} else {
											that.log.warn(`${logPrefix} [${name}] skipped because array of key '${key}' has not the same lenght as in endpoint structure`);
										}
									} else {
										if (!objStructure[key].ignore) {
											await that.createOrUpdateState(`${datapointPrefix}.${key}`, objStructure[key].type, objStructure[key].name, value);
										} else {
											that.log.debug(`${logPrefix} [${name}] skipped because key '${key}' is ignored in endpoint structure`);
										}
									}
								} else {
									that.log.warn(`${logPrefix} [${name}] skipped because key '${key}' not exists in endpoint structure`);
								}
							}
						}
					}
				} else {
					that.log.error(`${logPrefix} response code: ${response.statusCode}, error: ${error}`);
				}
			});
		} catch (err) {
			this.log.error(`${logPrefix} error: ${err.message}, stack: ${err.stack}`);
		}
	}

	/**
	 * @param {string} endpoint
	 * @param {string} user
	 */
	getEndpoints(endpoint, user) {
		let logPrefix = `[${user}] [getEndpoints]`

		let result = '';
		if (endpoint === this.endPoints.devices) {
			result = `https://api.tailscale.com/api/v2/tailnet/${user}/devices?fields=all`;

			this.log.debug(`${logPrefix} endpoint '${endpoint}', url: ${result}`);

			return result;
		}

		return result;
	}


	/**
	 * @param {string} id
	 * @param {string} type
	 * @param {string} name
	 * @param {any} val
	 */
	async createOrUpdateState(id, type, name, val) {
		if (type === "string") {
			await this.createObjectString(id, name, val);
		} else if (type === "boolean") {
			await this.createObjectBoolean(id, name, val);
		} else if (type === "moment") {

		}
	}

	/**
	 * @param {string} id
	 * @param {string} name
	 * @param {string } val
	 */
	async createObjectString(id, name, val) {
		if (this.isAdapterStart) {
			let obj = await this.getObjectAsync(id);

			if (obj) {
				if (obj.common.name !== _(name)) {
					obj.common.name = _(name);
					await this.setObjectAsync(id, obj);
				}
			} else {
				await this.setObjectNotExistsAsync(id,
					{
						type: 'state',
						common: {
							name: _(name),
							desc: _(name),
							type: 'string',
							read: true,
							write: false,
							role: 'state'
						},
						native: {}
					});
			}
		}
		await this.setStateAsync(id, val, true);
	}

	/**
	 * @param {string} id
	 * @param {string} name
	 * @param {boolean} val
	 */
	async createObjectBoolean(id, name, val) {
		if (this.isAdapterStart) {
			let obj = await this.getObjectAsync(id);

			if (obj) {
				if (obj.common.name !== _(name)) {
					obj.common.name = _(name);
					await this.setObjectAsync(id, obj);
				}
			} else {
				await this.setObjectNotExistsAsync(id,
					{
						type: 'state',
						common: {
							name: _(name),
							type: 'boolean',
							read: true,
							write: false,
							role: 'indicator',
							def: false
						},
						native: {}
					});
			}
		}
		await this.setStateAsync(id, val, true);
	}

	async prepareTranslation() {
		// language for Tranlation
		var sysConfig = await this.getForeignObjectAsync('system.config');
		if (sysConfig && sysConfig.common && sysConfig.common['language']) {
			language = sysConfig.common['language']
		}

		// language Function
		/**
		 * @param {string | number} string
		 */
		_ = function (string) {
			if (words[string]) {
				return words[string][language]
			} else {
				return string;
			}
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}


	/**
	 * @param {string} value
	 */
	async decryptValue(value) {
		let obj = await this.getForeignObjectAsync('system.config');
		if (obj && obj.native && obj.native.secret) {
			//noinspection JSUnresolvedVariable
			return this._decrypt(obj.native.secret, value);
		} else {
			//noinspection JSUnresolvedVariable
			return this._decrypt("Zgfr56gFe87jJOM", value);
		}
	}

	/**
	 * Function to decrypt passwords
	 * @param {string | { charCodeAt: (arg0: number) => number; }[]} key
	 * @param {string} value
	 */
	_decrypt(key, value) {
		let result = "";
		for (let i = 0; i < value.length; ++i) {
			result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
		}
		return result;
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Tailscale(options);
} else {
	// otherwise start the instance directly
	new Tailscale();
}