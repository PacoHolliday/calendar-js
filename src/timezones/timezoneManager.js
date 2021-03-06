/**
 * @copyright Copyright (c) 2019 Georg Ehrke
 *
 * @author Georg Ehrke <georg-nextcloud@ehrke.email>
 *
 * @license GNU AGPL version 3 or any later version
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
import Timezone from './timezone.js'

/**
 * @class TimezoneManager
 */
export class TimezoneManager {

	/**
	 * Constructor
	 */
	constructor() {
		/**
		 * Map of aliases
		 * Alias name => timezoneId
		 *
		 * @type {Map<String, String>}
		 */
		this._aliases = new Map()

		/**
		 * Map of Timezones
		 * timezoneId => Timezone
		 *
		 * @type {Map<String, Timezone>}
		 * @private
		 */
		this._timezones = new Map()
	}

	/**
	 * Gets a timezone for the given id
	 *
	 * @param {String} timezoneId
	 * @returns {Timezone|null}
	 */
	getTimezoneForId(timezoneId) {
		if (this._timezones.has(timezoneId)) {
			return this._timezones.get(timezoneId)
		}

		if (this._aliases.has(timezoneId)) {
			const realTimezoneId = this._aliases.get(timezoneId)
			if (this._timezones.has(realTimezoneId)) {
				return this._timezones.get(realTimezoneId)
			}
		}

		return null
	}

	/**
	 * Checks if there is a timezone for the given id stored in this manager
	 *
	 * @param timezoneId
	 * @returns {boolean}
	 */
	hasTimezoneForId(timezoneId) {
		return this._timezones.has(timezoneId) || this._aliases.has(timezoneId)
	}

	/**
	 * Checks if the given timezone id is an alias
	 *
	 * @param {String} timezoneId
	 * @returns {boolean}
	 */
	isAlias(timezoneId) {
		return !this._timezones.has(timezoneId) && this._aliases.has(timezoneId)
	}

	/**
	 * Lists all timezones
	 *
	 * @param {Boolean} includeAliases
	 * @returns {String[]}
	 */
	listAllTimezones(includeAliases = false) {
		const timezones = Array.from(this._timezones.keys())

		if (includeAliases) {
			return timezones.concat(Array.from(this._aliases.keys()))
		}

		return timezones
	}

	/**
	 * Registers a timezone
	 *
	 * @param {Timezone} timezone
	 */
	registerTimezone(timezone) {
		this._timezones.set(timezone.timezoneId, timezone)
	}

	/**
	 * Registers a timezone based on ics data
	 *
	 * @param {String} timezoneId
	 * @param {String} ics
	 */
	registerTimezoneFromICS(timezoneId, ics) {
		const timezone = new Timezone(timezoneId, ics)
		this.registerTimezone(timezone)
	}

	/**
	 * Registers a new timezone-alias
	 *
	 * @param aliasName
	 * @param timezoneId
	 */
	registerAlias(aliasName, timezoneId) {
		this._aliases.set(aliasName, timezoneId)
	}

	/**
	 * Unregisters a timezone
	 *
	 * @param {String} timezoneId
	 */
	unregisterTimezones(timezoneId) {
		this._timezones.delete(timezoneId)
	}

	/**
	 * Unregisters a timezone-alias
	 *
	 * @param aliasName
	 */
	unregisterAlias(aliasName) {
		this._aliases.delete(aliasName)
	}

	/**
	 * Clear all timezones
 	 */
	clearAllTimezones() {
		this._aliases = new Map()
		this._timezones = new Map()

		timezoneManager.registerTimezone(Timezone.utc)
		timezoneManager.registerTimezone(Timezone.floating)
		timezoneManager.registerAlias('GMT', Timezone.utc.timezoneId)
		timezoneManager.registerAlias('Z', Timezone.utc.timezoneId)
	}

}

const timezoneManager = new TimezoneManager()
timezoneManager.clearAllTimezones()

/**
 * Gets the default instance of the timezone manager
 *
 * @returns {TimezoneManager}
 */
export function getTimezoneManager() {
	return timezoneManager
}

/**
 *
 * @param tzName
 * @returns {boolean}
 */
export function isOlsonTimezone(tzName) {
	const hasSlash = tzName.indexOf('/') !== -1
	const hasSpace = tzName.indexOf(' ') !== -1
	const startsWithETC = tzName.startsWith('Etc')
	const startsWithUS = tzName.startsWith('US/')

	return hasSlash && !hasSpace && !startsWithETC && !startsWithUS
}
