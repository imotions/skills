import { createRequire as e } from "node:module";
import t from "node:os";
import n from "node:path";
import r from "node:child_process";
import i from "node:fs";
import a from "node:crypto";
import o from "node:sea";
//#region \0rolldown/runtime.js
var s = Object.create, c = Object.defineProperty, l = Object.getOwnPropertyDescriptor, u = Object.getOwnPropertyNames, d = Object.getPrototypeOf, f = Object.prototype.hasOwnProperty, p = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), m = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = u(t), a = 0, o = i.length, s; a < o; a++) s = i[a], !f.call(e, s) && s !== n && c(e, s, {
		get: ((e) => t[e]).bind(null, s),
		enumerable: !(r = l(t, s)) || r.enumerable
	});
	return e;
}, h = (e, t, n) => (n = e == null ? {} : s(d(e)), m(t || !e || !e.__esModule ? c(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), g = /* @__PURE__ */ e(import.meta.url), _ = /* @__PURE__ */ p(((e) => {
	var t = class extends Error {
		constructor(e, t, n) {
			super(n), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name, this.code = t, this.exitCode = e, this.nestedError = void 0;
		}
	}, n = class extends t {
		constructor(e) {
			super(1, "commander.invalidArgument", e), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name;
		}
	};
	e.CommanderError = t, e.InvalidArgumentError = n;
})), v = /* @__PURE__ */ p(((e) => {
	var { InvalidArgumentError: t } = _(), n = class {
		constructor(e, t) {
			switch (this.description = t || "", this.variadic = !1, this.parseArg = void 0, this.defaultValue = void 0, this.defaultValueDescription = void 0, this.argChoices = void 0, e[0]) {
				case "<":
					this.required = !0, this._name = e.slice(1, -1);
					break;
				case "[":
					this.required = !1, this._name = e.slice(1, -1);
					break;
				default:
					this.required = !0, this._name = e;
					break;
			}
			this._name.endsWith("...") && (this.variadic = !0, this._name = this._name.slice(0, -3));
		}
		name() {
			return this._name;
		}
		_collectValue(e, t) {
			return t === this.defaultValue || !Array.isArray(t) ? [e] : (t.push(e), t);
		}
		default(e, t) {
			return this.defaultValue = e, this.defaultValueDescription = t, this;
		}
		argParser(e) {
			return this.parseArg = e, this;
		}
		choices(e) {
			return this.argChoices = e.slice(), this.parseArg = (e, n) => {
				if (!this.argChoices.includes(e)) throw new t(`Allowed choices are ${this.argChoices.join(", ")}.`);
				return this.variadic ? this._collectValue(e, n) : e;
			}, this;
		}
		argRequired() {
			return this.required = !0, this;
		}
		argOptional() {
			return this.required = !1, this;
		}
	};
	function r(e) {
		let t = e.name() + (e.variadic === !0 ? "..." : "");
		return e.required ? "<" + t + ">" : "[" + t + "]";
	}
	e.Argument = n, e.humanReadableArgName = r;
})), ee = /* @__PURE__ */ p(((e) => {
	var { humanReadableArgName: t } = v(), n = class {
		constructor() {
			this.helpWidth = void 0, this.minWidthToWrap = 40, this.sortSubcommands = !1, this.sortOptions = !1, this.showGlobalOptions = !1;
		}
		prepareContext(e) {
			this.helpWidth = this.helpWidth ?? e.helpWidth ?? 80;
		}
		visibleCommands(e) {
			let t = e.commands.filter((e) => !e._hidden), n = e._getHelpCommand();
			return n && !n._hidden && t.push(n), this.sortSubcommands && t.sort((e, t) => e.name().localeCompare(t.name())), t;
		}
		compareOptions(e, t) {
			let n = (e) => e.short ? e.short.replace(/^-/, "") : e.long.replace(/^--/, "");
			return n(e).localeCompare(n(t));
		}
		visibleOptions(e) {
			let t = e.options.filter((e) => !e.hidden), n = e._getHelpOption();
			if (n && !n.hidden) {
				let r = n.short && e._findOption(n.short), i = n.long && e._findOption(n.long);
				!r && !i ? t.push(n) : n.long && !i ? t.push(e.createOption(n.long, n.description)) : n.short && !r && t.push(e.createOption(n.short, n.description));
			}
			return this.sortOptions && t.sort(this.compareOptions), t;
		}
		visibleGlobalOptions(e) {
			if (!this.showGlobalOptions) return [];
			let t = [];
			for (let n = e.parent; n; n = n.parent) {
				let e = n.options.filter((e) => !e.hidden);
				t.push(...e);
			}
			return this.sortOptions && t.sort(this.compareOptions), t;
		}
		visibleArguments(e) {
			return e._argsDescription && e.registeredArguments.forEach((t) => {
				t.description = t.description || e._argsDescription[t.name()] || "";
			}), e.registeredArguments.find((e) => e.description) ? e.registeredArguments : [];
		}
		subcommandTerm(e) {
			let n = e.registeredArguments.map((e) => t(e)).join(" ");
			return e._name + (e._aliases[0] ? "|" + e._aliases[0] : "") + (e.options.length ? " [options]" : "") + (n ? " " + n : "");
		}
		optionTerm(e) {
			return e.flags;
		}
		argumentTerm(e) {
			return e.name();
		}
		longestSubcommandTermLength(e, t) {
			return t.visibleCommands(e).reduce((e, n) => Math.max(e, this.displayWidth(t.styleSubcommandTerm(t.subcommandTerm(n)))), 0);
		}
		longestOptionTermLength(e, t) {
			return t.visibleOptions(e).reduce((e, n) => Math.max(e, this.displayWidth(t.styleOptionTerm(t.optionTerm(n)))), 0);
		}
		longestGlobalOptionTermLength(e, t) {
			return t.visibleGlobalOptions(e).reduce((e, n) => Math.max(e, this.displayWidth(t.styleOptionTerm(t.optionTerm(n)))), 0);
		}
		longestArgumentTermLength(e, t) {
			return t.visibleArguments(e).reduce((e, n) => Math.max(e, this.displayWidth(t.styleArgumentTerm(t.argumentTerm(n)))), 0);
		}
		commandUsage(e) {
			let t = e._name;
			e._aliases[0] && (t = t + "|" + e._aliases[0]);
			let n = "";
			for (let t = e.parent; t; t = t.parent) n = t.name() + " " + n;
			return n + t + " " + e.usage();
		}
		commandDescription(e) {
			return e.description();
		}
		subcommandDescription(e) {
			return e.summary() || e.description();
		}
		optionDescription(e) {
			let t = [];
			if (e.argChoices && t.push(`choices: ${e.argChoices.map((e) => JSON.stringify(e)).join(", ")}`), e.defaultValue !== void 0 && (e.required || e.optional || e.isBoolean() && typeof e.defaultValue == "boolean") && t.push(`default: ${e.defaultValueDescription || JSON.stringify(e.defaultValue)}`), e.presetArg !== void 0 && e.optional && t.push(`preset: ${JSON.stringify(e.presetArg)}`), e.envVar !== void 0 && t.push(`env: ${e.envVar}`), t.length > 0) {
				let n = `(${t.join(", ")})`;
				return e.description ? `${e.description} ${n}` : n;
			}
			return e.description;
		}
		argumentDescription(e) {
			let t = [];
			if (e.argChoices && t.push(`choices: ${e.argChoices.map((e) => JSON.stringify(e)).join(", ")}`), e.defaultValue !== void 0 && t.push(`default: ${e.defaultValueDescription || JSON.stringify(e.defaultValue)}`), t.length > 0) {
				let n = `(${t.join(", ")})`;
				return e.description ? `${e.description} ${n}` : n;
			}
			return e.description;
		}
		formatItemList(e, t, n) {
			return t.length === 0 ? [] : [
				n.styleTitle(e),
				...t,
				""
			];
		}
		groupItems(e, t, n) {
			let r = /* @__PURE__ */ new Map();
			return e.forEach((e) => {
				let t = n(e);
				r.has(t) || r.set(t, []);
			}), t.forEach((e) => {
				let t = n(e);
				r.has(t) || r.set(t, []), r.get(t).push(e);
			}), r;
		}
		formatHelp(e, t) {
			let n = t.padWidth(e, t), r = t.helpWidth ?? 80;
			function i(e, r) {
				return t.formatItem(e, n, r, t);
			}
			let a = [`${t.styleTitle("Usage:")} ${t.styleUsage(t.commandUsage(e))}`, ""], o = t.commandDescription(e);
			o.length > 0 && (a = a.concat([t.boxWrap(t.styleCommandDescription(o), r), ""]));
			let s = t.visibleArguments(e).map((e) => i(t.styleArgumentTerm(t.argumentTerm(e)), t.styleArgumentDescription(t.argumentDescription(e))));
			if (a = a.concat(this.formatItemList("Arguments:", s, t)), this.groupItems(e.options, t.visibleOptions(e), (e) => e.helpGroupHeading ?? "Options:").forEach((e, n) => {
				let r = e.map((e) => i(t.styleOptionTerm(t.optionTerm(e)), t.styleOptionDescription(t.optionDescription(e))));
				a = a.concat(this.formatItemList(n, r, t));
			}), t.showGlobalOptions) {
				let n = t.visibleGlobalOptions(e).map((e) => i(t.styleOptionTerm(t.optionTerm(e)), t.styleOptionDescription(t.optionDescription(e))));
				a = a.concat(this.formatItemList("Global Options:", n, t));
			}
			return this.groupItems(e.commands, t.visibleCommands(e), (e) => e.helpGroup() || "Commands:").forEach((e, n) => {
				let r = e.map((e) => i(t.styleSubcommandTerm(t.subcommandTerm(e)), t.styleSubcommandDescription(t.subcommandDescription(e))));
				a = a.concat(this.formatItemList(n, r, t));
			}), a.join("\n");
		}
		displayWidth(e) {
			return r(e).length;
		}
		styleTitle(e) {
			return e;
		}
		styleUsage(e) {
			return e.split(" ").map((e) => e === "[options]" ? this.styleOptionText(e) : e === "[command]" ? this.styleSubcommandText(e) : e[0] === "[" || e[0] === "<" ? this.styleArgumentText(e) : this.styleCommandText(e)).join(" ");
		}
		styleCommandDescription(e) {
			return this.styleDescriptionText(e);
		}
		styleOptionDescription(e) {
			return this.styleDescriptionText(e);
		}
		styleSubcommandDescription(e) {
			return this.styleDescriptionText(e);
		}
		styleArgumentDescription(e) {
			return this.styleDescriptionText(e);
		}
		styleDescriptionText(e) {
			return e;
		}
		styleOptionTerm(e) {
			return this.styleOptionText(e);
		}
		styleSubcommandTerm(e) {
			return e.split(" ").map((e) => e === "[options]" ? this.styleOptionText(e) : e[0] === "[" || e[0] === "<" ? this.styleArgumentText(e) : this.styleSubcommandText(e)).join(" ");
		}
		styleArgumentTerm(e) {
			return this.styleArgumentText(e);
		}
		styleOptionText(e) {
			return e;
		}
		styleArgumentText(e) {
			return e;
		}
		styleSubcommandText(e) {
			return e;
		}
		styleCommandText(e) {
			return e;
		}
		padWidth(e, t) {
			return Math.max(t.longestOptionTermLength(e, t), t.longestGlobalOptionTermLength(e, t), t.longestSubcommandTermLength(e, t), t.longestArgumentTermLength(e, t));
		}
		preformatted(e) {
			return /\n[^\S\r\n]/.test(e);
		}
		formatItem(e, t, n, r) {
			let i = " ".repeat(2);
			if (!n) return i + e;
			let a = e.padEnd(t + e.length - r.displayWidth(e)), o = (this.helpWidth ?? 80) - t - 2 - 2, s;
			return s = o < this.minWidthToWrap || r.preformatted(n) ? n : r.boxWrap(n, o).replace(/\n/g, "\n" + " ".repeat(t + 2)), i + a + " ".repeat(2) + s.replace(/\n/g, `\n${i}`);
		}
		boxWrap(e, t) {
			if (t < this.minWidthToWrap) return e;
			let n = e.split(/\r\n|\n/), r = /[\s]*[^\s]+/g, i = [];
			return n.forEach((e) => {
				let n = e.match(r);
				if (n === null) {
					i.push("");
					return;
				}
				let a = [n.shift()], o = this.displayWidth(a[0]);
				n.forEach((e) => {
					let n = this.displayWidth(e);
					if (o + n <= t) {
						a.push(e), o += n;
						return;
					}
					i.push(a.join(""));
					let r = e.trimStart();
					a = [r], o = this.displayWidth(r);
				}), i.push(a.join(""));
			}), i.join("\n");
		}
	};
	function r(e) {
		return e.replace(/\x1b\[\d*(;\d*)*m/g, "");
	}
	e.Help = n, e.stripColor = r;
})), y = /* @__PURE__ */ p(((e) => {
	var { InvalidArgumentError: t } = _(), n = class {
		constructor(e, t) {
			this.flags = e, this.description = t || "", this.required = e.includes("<"), this.optional = e.includes("["), this.variadic = /\w\.\.\.[>\]]$/.test(e), this.mandatory = !1;
			let n = a(e);
			this.short = n.shortFlag, this.long = n.longFlag, this.negate = !1, this.long && (this.negate = this.long.startsWith("--no-")), this.defaultValue = void 0, this.defaultValueDescription = void 0, this.presetArg = void 0, this.envVar = void 0, this.parseArg = void 0, this.hidden = !1, this.argChoices = void 0, this.conflictsWith = [], this.implied = void 0, this.helpGroupHeading = void 0;
		}
		default(e, t) {
			return this.defaultValue = e, this.defaultValueDescription = t, this;
		}
		preset(e) {
			return this.presetArg = e, this;
		}
		conflicts(e) {
			return this.conflictsWith = this.conflictsWith.concat(e), this;
		}
		implies(e) {
			let t = e;
			return typeof e == "string" && (t = { [e]: !0 }), this.implied = Object.assign(this.implied || {}, t), this;
		}
		env(e) {
			return this.envVar = e, this;
		}
		argParser(e) {
			return this.parseArg = e, this;
		}
		makeOptionMandatory(e = !0) {
			return this.mandatory = !!e, this;
		}
		hideHelp(e = !0) {
			return this.hidden = !!e, this;
		}
		_collectValue(e, t) {
			return t === this.defaultValue || !Array.isArray(t) ? [e] : (t.push(e), t);
		}
		choices(e) {
			return this.argChoices = e.slice(), this.parseArg = (e, n) => {
				if (!this.argChoices.includes(e)) throw new t(`Allowed choices are ${this.argChoices.join(", ")}.`);
				return this.variadic ? this._collectValue(e, n) : e;
			}, this;
		}
		name() {
			return this.long ? this.long.replace(/^--/, "") : this.short.replace(/^-/, "");
		}
		attributeName() {
			return this.negate ? i(this.name().replace(/^no-/, "")) : i(this.name());
		}
		helpGroup(e) {
			return this.helpGroupHeading = e, this;
		}
		is(e) {
			return this.short === e || this.long === e;
		}
		isBoolean() {
			return !this.required && !this.optional && !this.negate;
		}
	}, r = class {
		constructor(e) {
			this.positiveOptions = /* @__PURE__ */ new Map(), this.negativeOptions = /* @__PURE__ */ new Map(), this.dualOptions = /* @__PURE__ */ new Set(), e.forEach((e) => {
				e.negate ? this.negativeOptions.set(e.attributeName(), e) : this.positiveOptions.set(e.attributeName(), e);
			}), this.negativeOptions.forEach((e, t) => {
				this.positiveOptions.has(t) && this.dualOptions.add(t);
			});
		}
		valueFromOption(e, t) {
			let n = t.attributeName();
			if (!this.dualOptions.has(n)) return !0;
			let r = this.negativeOptions.get(n).presetArg, i = r === void 0 ? !1 : r;
			return t.negate === (i === e);
		}
	};
	function i(e) {
		return e.split("-").reduce((e, t) => e + t[0].toUpperCase() + t.slice(1));
	}
	function a(e) {
		let t, n, r = /^-[^-]$/, i = /^--[^-]/, a = e.split(/[ |,]+/).concat("guard");
		if (r.test(a[0]) && (t = a.shift()), i.test(a[0]) && (n = a.shift()), !t && r.test(a[0]) && (t = a.shift()), !t && i.test(a[0]) && (t = n, n = a.shift()), a[0].startsWith("-")) {
			let t = a[0], n = `option creation failed due to '${t}' in option flags '${e}'`;
			throw /^-[^-][^-]/.test(t) ? Error(`${n}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`) : r.test(t) ? Error(`${n}
- too many short flags`) : i.test(t) ? Error(`${n}
- too many long flags`) : Error(`${n}
- unrecognised flag format`);
		}
		if (t === void 0 && n === void 0) throw Error(`option creation failed due to no flags found in '${e}'.`);
		return {
			shortFlag: t,
			longFlag: n
		};
	}
	e.Option = n, e.DualOptions = r;
})), te = /* @__PURE__ */ p(((e) => {
	var t = 3;
	function n(e, n) {
		if (Math.abs(e.length - n.length) > t) return Math.max(e.length, n.length);
		let r = [];
		for (let t = 0; t <= e.length; t++) r[t] = [t];
		for (let e = 0; e <= n.length; e++) r[0][e] = e;
		for (let t = 1; t <= n.length; t++) for (let i = 1; i <= e.length; i++) {
			let a = 1;
			a = e[i - 1] === n[t - 1] ? 0 : 1, r[i][t] = Math.min(r[i - 1][t] + 1, r[i][t - 1] + 1, r[i - 1][t - 1] + a), i > 1 && t > 1 && e[i - 1] === n[t - 2] && e[i - 2] === n[t - 1] && (r[i][t] = Math.min(r[i][t], r[i - 2][t - 2] + 1));
		}
		return r[e.length][n.length];
	}
	function r(e, r) {
		if (!r || r.length === 0) return "";
		r = Array.from(new Set(r));
		let i = e.startsWith("--");
		i && (e = e.slice(2), r = r.map((e) => e.slice(2)));
		let a = [], o = t;
		return r.forEach((t) => {
			if (t.length <= 1) return;
			let r = n(e, t), i = Math.max(e.length, t.length);
			(i - r) / i > .4 && (r < o ? (o = r, a = [t]) : r === o && a.push(t));
		}), a.sort((e, t) => e.localeCompare(t)), i && (a = a.map((e) => `--${e}`)), a.length > 1 ? `\n(Did you mean one of ${a.join(", ")}?)` : a.length === 1 ? `\n(Did you mean ${a[0]}?)` : "";
	}
	e.suggestSimilar = r;
})), b = /* @__PURE__ */ p(((e) => {
	var t = g("node:events").EventEmitter, n = g("node:child_process"), r = g("node:path"), i = g("node:fs"), a = g("node:process"), { Argument: o, humanReadableArgName: s } = v(), { CommanderError: c } = _(), { Help: l, stripColor: u } = ee(), { Option: d, DualOptions: f } = y(), { suggestSimilar: p } = te(), m = class e extends t {
		constructor(e) {
			super(), this.commands = [], this.options = [], this.parent = null, this._allowUnknownOption = !1, this._allowExcessArguments = !1, this.registeredArguments = [], this._args = this.registeredArguments, this.args = [], this.rawArgs = [], this.processedArgs = [], this._scriptPath = null, this._name = e || "", this._optionValues = {}, this._optionValueSources = {}, this._storeOptionsAsProperties = !1, this._actionHandler = null, this._executableHandler = !1, this._executableFile = null, this._executableDir = null, this._defaultCommandName = null, this._exitCallback = null, this._aliases = [], this._combineFlagAndOptionalValue = !0, this._description = "", this._summary = "", this._argsDescription = void 0, this._enablePositionalOptions = !1, this._passThroughOptions = !1, this._lifeCycleHooks = {}, this._showHelpAfterError = !1, this._showSuggestionAfterError = !0, this._savedState = null, this._outputConfiguration = {
				writeOut: (e) => a.stdout.write(e),
				writeErr: (e) => a.stderr.write(e),
				outputError: (e, t) => t(e),
				getOutHelpWidth: () => a.stdout.isTTY ? a.stdout.columns : void 0,
				getErrHelpWidth: () => a.stderr.isTTY ? a.stderr.columns : void 0,
				getOutHasColors: () => b() ?? (a.stdout.isTTY && a.stdout.hasColors?.()),
				getErrHasColors: () => b() ?? (a.stderr.isTTY && a.stderr.hasColors?.()),
				stripColor: (e) => u(e)
			}, this._hidden = !1, this._helpOption = void 0, this._addImplicitHelpCommand = void 0, this._helpCommand = void 0, this._helpConfiguration = {}, this._helpGroupHeading = void 0, this._defaultCommandGroup = void 0, this._defaultOptionGroup = void 0;
		}
		copyInheritedSettings(e) {
			return this._outputConfiguration = e._outputConfiguration, this._helpOption = e._helpOption, this._helpCommand = e._helpCommand, this._helpConfiguration = e._helpConfiguration, this._exitCallback = e._exitCallback, this._storeOptionsAsProperties = e._storeOptionsAsProperties, this._combineFlagAndOptionalValue = e._combineFlagAndOptionalValue, this._allowExcessArguments = e._allowExcessArguments, this._enablePositionalOptions = e._enablePositionalOptions, this._showHelpAfterError = e._showHelpAfterError, this._showSuggestionAfterError = e._showSuggestionAfterError, this;
		}
		_getCommandAndAncestors() {
			let e = [];
			for (let t = this; t; t = t.parent) e.push(t);
			return e;
		}
		command(e, t, n) {
			let r = t, i = n;
			typeof r == "object" && r && (i = r, r = null), i ||= {};
			let [, a, o] = e.match(/([^ ]+) *(.*)/), s = this.createCommand(a);
			return r && (s.description(r), s._executableHandler = !0), i.isDefault && (this._defaultCommandName = s._name), s._hidden = !!(i.noHelp || i.hidden), s._executableFile = i.executableFile || null, o && s.arguments(o), this._registerCommand(s), s.parent = this, s.copyInheritedSettings(this), r ? this : s;
		}
		createCommand(t) {
			return new e(t);
		}
		createHelp() {
			return Object.assign(new l(), this.configureHelp());
		}
		configureHelp(e) {
			return e === void 0 ? this._helpConfiguration : (this._helpConfiguration = e, this);
		}
		configureOutput(e) {
			return e === void 0 ? this._outputConfiguration : (this._outputConfiguration = {
				...this._outputConfiguration,
				...e
			}, this);
		}
		showHelpAfterError(e = !0) {
			return typeof e != "string" && (e = !!e), this._showHelpAfterError = e, this;
		}
		showSuggestionAfterError(e = !0) {
			return this._showSuggestionAfterError = !!e, this;
		}
		addCommand(e, t) {
			if (!e._name) throw Error("Command passed to .addCommand() must have a name\n- specify the name in Command constructor or using .name()");
			return t ||= {}, t.isDefault && (this._defaultCommandName = e._name), (t.noHelp || t.hidden) && (e._hidden = !0), this._registerCommand(e), e.parent = this, e._checkForBrokenPassThrough(), this;
		}
		createArgument(e, t) {
			return new o(e, t);
		}
		argument(e, t, n, r) {
			let i = this.createArgument(e, t);
			return typeof n == "function" ? i.default(r).argParser(n) : i.default(n), this.addArgument(i), this;
		}
		arguments(e) {
			return e.trim().split(/ +/).forEach((e) => {
				this.argument(e);
			}), this;
		}
		addArgument(e) {
			let t = this.registeredArguments.slice(-1)[0];
			if (t?.variadic) throw Error(`only the last argument can be variadic '${t.name()}'`);
			if (e.required && e.defaultValue !== void 0 && e.parseArg === void 0) throw Error(`a default value for a required argument is never used: '${e.name()}'`);
			return this.registeredArguments.push(e), this;
		}
		helpCommand(e, t) {
			if (typeof e == "boolean") return this._addImplicitHelpCommand = e, e && this._defaultCommandGroup && this._initCommandGroup(this._getHelpCommand()), this;
			let [, n, r] = (e ?? "help [command]").match(/([^ ]+) *(.*)/), i = t ?? "display help for command", a = this.createCommand(n);
			return a.helpOption(!1), r && a.arguments(r), i && a.description(i), this._addImplicitHelpCommand = !0, this._helpCommand = a, (e || t) && this._initCommandGroup(a), this;
		}
		addHelpCommand(e, t) {
			return typeof e == "object" ? (this._addImplicitHelpCommand = !0, this._helpCommand = e, this._initCommandGroup(e), this) : (this.helpCommand(e, t), this);
		}
		_getHelpCommand() {
			return this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help")) ? (this._helpCommand === void 0 && this.helpCommand(void 0, void 0), this._helpCommand) : null;
		}
		hook(e, t) {
			let n = [
				"preSubcommand",
				"preAction",
				"postAction"
			];
			if (!n.includes(e)) throw Error(`Unexpected value for event passed to hook : '${e}'.
Expecting one of '${n.join("', '")}'`);
			return this._lifeCycleHooks[e] ? this._lifeCycleHooks[e].push(t) : this._lifeCycleHooks[e] = [t], this;
		}
		exitOverride(e) {
			return e ? this._exitCallback = e : this._exitCallback = (e) => {
				if (e.code !== "commander.executeSubCommandAsync") throw e;
			}, this;
		}
		_exit(e, t, n) {
			this._exitCallback && this._exitCallback(new c(e, t, n)), a.exit(e);
		}
		action(e) {
			let t = (t) => {
				let n = this.registeredArguments.length, r = t.slice(0, n);
				return this._storeOptionsAsProperties ? r[n] = this : r[n] = this.opts(), r.push(this), e.apply(this, r);
			};
			return this._actionHandler = t, this;
		}
		createOption(e, t) {
			return new d(e, t);
		}
		_callParseArg(e, t, n, r) {
			try {
				return e.parseArg(t, n);
			} catch (e) {
				if (e.code === "commander.invalidArgument") {
					let t = `${r} ${e.message}`;
					this.error(t, {
						exitCode: e.exitCode,
						code: e.code
					});
				}
				throw e;
			}
		}
		_registerOption(e) {
			let t = e.short && this._findOption(e.short) || e.long && this._findOption(e.long);
			if (t) {
				let n = e.long && this._findOption(e.long) ? e.long : e.short;
				throw Error(`Cannot add option '${e.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${n}'
-  already used by option '${t.flags}'`);
			}
			this._initOptionGroup(e), this.options.push(e);
		}
		_registerCommand(e) {
			let t = (e) => [e.name()].concat(e.aliases()), n = t(e).find((e) => this._findCommand(e));
			if (n) {
				let r = t(this._findCommand(n)).join("|"), i = t(e).join("|");
				throw Error(`cannot add command '${i}' as already have command '${r}'`);
			}
			this._initCommandGroup(e), this.commands.push(e);
		}
		addOption(e) {
			this._registerOption(e);
			let t = e.name(), n = e.attributeName();
			if (e.negate) {
				let t = e.long.replace(/^--no-/, "--");
				this._findOption(t) || this.setOptionValueWithSource(n, e.defaultValue === void 0 ? !0 : e.defaultValue, "default");
			} else e.defaultValue !== void 0 && this.setOptionValueWithSource(n, e.defaultValue, "default");
			let r = (t, r, i) => {
				t == null && e.presetArg !== void 0 && (t = e.presetArg);
				let a = this.getOptionValue(n);
				t !== null && e.parseArg ? t = this._callParseArg(e, t, a, r) : t !== null && e.variadic && (t = e._collectValue(t, a)), t ??= e.negate ? !1 : e.isBoolean() || e.optional ? !0 : "", this.setOptionValueWithSource(n, t, i);
			};
			return this.on("option:" + t, (t) => {
				r(t, `error: option '${e.flags}' argument '${t}' is invalid.`, "cli");
			}), e.envVar && this.on("optionEnv:" + t, (t) => {
				r(t, `error: option '${e.flags}' value '${t}' from env '${e.envVar}' is invalid.`, "env");
			}), this;
		}
		_optionEx(e, t, n, r, i) {
			if (typeof t == "object" && t instanceof d) throw Error("To add an Option object use addOption() instead of option() or requiredOption()");
			let a = this.createOption(t, n);
			if (a.makeOptionMandatory(!!e.mandatory), typeof r == "function") a.default(i).argParser(r);
			else if (r instanceof RegExp) {
				let e = r;
				r = (t, n) => {
					let r = e.exec(t);
					return r ? r[0] : n;
				}, a.default(i).argParser(r);
			} else a.default(r);
			return this.addOption(a);
		}
		option(e, t, n, r) {
			return this._optionEx({}, e, t, n, r);
		}
		requiredOption(e, t, n, r) {
			return this._optionEx({ mandatory: !0 }, e, t, n, r);
		}
		combineFlagAndOptionalValue(e = !0) {
			return this._combineFlagAndOptionalValue = !!e, this;
		}
		allowUnknownOption(e = !0) {
			return this._allowUnknownOption = !!e, this;
		}
		allowExcessArguments(e = !0) {
			return this._allowExcessArguments = !!e, this;
		}
		enablePositionalOptions(e = !0) {
			return this._enablePositionalOptions = !!e, this;
		}
		passThroughOptions(e = !0) {
			return this._passThroughOptions = !!e, this._checkForBrokenPassThrough(), this;
		}
		_checkForBrokenPassThrough() {
			if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions) throw Error(`passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`);
		}
		storeOptionsAsProperties(e = !0) {
			if (this.options.length) throw Error("call .storeOptionsAsProperties() before adding options");
			if (Object.keys(this._optionValues).length) throw Error("call .storeOptionsAsProperties() before setting option values");
			return this._storeOptionsAsProperties = !!e, this;
		}
		getOptionValue(e) {
			return this._storeOptionsAsProperties ? this[e] : this._optionValues[e];
		}
		setOptionValue(e, t) {
			return this.setOptionValueWithSource(e, t, void 0);
		}
		setOptionValueWithSource(e, t, n) {
			return this._storeOptionsAsProperties ? this[e] = t : this._optionValues[e] = t, this._optionValueSources[e] = n, this;
		}
		getOptionValueSource(e) {
			return this._optionValueSources[e];
		}
		getOptionValueSourceWithGlobals(e) {
			let t;
			return this._getCommandAndAncestors().forEach((n) => {
				n.getOptionValueSource(e) !== void 0 && (t = n.getOptionValueSource(e));
			}), t;
		}
		_prepareUserArgs(e, t) {
			if (e !== void 0 && !Array.isArray(e)) throw Error("first parameter to parse must be array or undefined");
			if (t ||= {}, e === void 0 && t.from === void 0) {
				a.versions?.electron && (t.from = "electron");
				let e = a.execArgv ?? [];
				(e.includes("-e") || e.includes("--eval") || e.includes("-p") || e.includes("--print")) && (t.from = "eval");
			}
			e === void 0 && (e = a.argv), this.rawArgs = e.slice();
			let n;
			switch (t.from) {
				case void 0:
				case "node":
					this._scriptPath = e[1], n = e.slice(2);
					break;
				case "electron":
					a.defaultApp ? (this._scriptPath = e[1], n = e.slice(2)) : n = e.slice(1);
					break;
				case "user":
					n = e.slice(0);
					break;
				case "eval":
					n = e.slice(1);
					break;
				default: throw Error(`unexpected parse option { from: '${t.from}' }`);
			}
			return !this._name && this._scriptPath && this.nameFromFilename(this._scriptPath), this._name = this._name || "program", n;
		}
		parse(e, t) {
			this._prepareForParse();
			let n = this._prepareUserArgs(e, t);
			return this._parseCommand([], n), this;
		}
		async parseAsync(e, t) {
			this._prepareForParse();
			let n = this._prepareUserArgs(e, t);
			return await this._parseCommand([], n), this;
		}
		_prepareForParse() {
			this._savedState === null ? this.saveStateBeforeParse() : this.restoreStateBeforeParse();
		}
		saveStateBeforeParse() {
			this._savedState = {
				_name: this._name,
				_optionValues: { ...this._optionValues },
				_optionValueSources: { ...this._optionValueSources }
			};
		}
		restoreStateBeforeParse() {
			if (this._storeOptionsAsProperties) throw Error("Can not call parse again when storeOptionsAsProperties is true.\n- either make a new Command for each call to parse, or stop storing options as properties");
			this._name = this._savedState._name, this._scriptPath = null, this.rawArgs = [], this._optionValues = { ...this._savedState._optionValues }, this._optionValueSources = { ...this._savedState._optionValueSources }, this.args = [], this.processedArgs = [];
		}
		_checkForMissingExecutable(e, t, n) {
			if (i.existsSync(e)) return;
			let r = `'${e}' does not exist
 - if '${n}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${t ? `searched for local subcommand relative to directory '${t}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory"}`;
			throw Error(r);
		}
		_executeSubCommand(e, t) {
			t = t.slice();
			let o = !1, s = [
				".js",
				".ts",
				".tsx",
				".mjs",
				".cjs"
			];
			function l(e, t) {
				let n = r.resolve(e, t);
				if (i.existsSync(n)) return n;
				if (s.includes(r.extname(t))) return;
				let a = s.find((e) => i.existsSync(`${n}${e}`));
				if (a) return `${n}${a}`;
			}
			this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
			let u = e._executableFile || `${this._name}-${e._name}`, d = this._executableDir || "";
			if (this._scriptPath) {
				let e;
				try {
					e = i.realpathSync(this._scriptPath);
				} catch {
					e = this._scriptPath;
				}
				d = r.resolve(r.dirname(e), d);
			}
			if (d) {
				let t = l(d, u);
				if (!t && !e._executableFile && this._scriptPath) {
					let n = r.basename(this._scriptPath, r.extname(this._scriptPath));
					n !== this._name && (t = l(d, `${n}-${e._name}`));
				}
				u = t || u;
			}
			o = s.includes(r.extname(u));
			let f;
			a.platform === "win32" ? (this._checkForMissingExecutable(u, d, e._name), t.unshift(u), t = h(a.execArgv).concat(t), f = n.spawn(a.execPath, t, { stdio: "inherit" })) : o ? (t.unshift(u), t = h(a.execArgv).concat(t), f = n.spawn(a.argv[0], t, { stdio: "inherit" })) : f = n.spawn(u, t, { stdio: "inherit" }), f.killed || [
				"SIGUSR1",
				"SIGUSR2",
				"SIGTERM",
				"SIGINT",
				"SIGHUP"
			].forEach((e) => {
				a.on(e, () => {
					f.killed === !1 && f.exitCode === null && f.kill(e);
				});
			});
			let p = this._exitCallback;
			f.on("close", (e) => {
				e ??= 1, p ? p(new c(e, "commander.executeSubCommandAsync", "(close)")) : a.exit(e);
			}), f.on("error", (t) => {
				if (t.code === "ENOENT") this._checkForMissingExecutable(u, d, e._name);
				else if (t.code === "EACCES") throw Error(`'${u}' not executable`);
				if (!p) a.exit(1);
				else {
					let e = new c(1, "commander.executeSubCommandAsync", "(error)");
					e.nestedError = t, p(e);
				}
			}), this.runningCommand = f;
		}
		_dispatchSubcommand(e, t, n) {
			let r = this._findCommand(e);
			r || this.help({ error: !0 }), r._prepareForParse();
			let i;
			return i = this._chainOrCallSubCommandHook(i, r, "preSubcommand"), i = this._chainOrCall(i, () => {
				if (r._executableHandler) this._executeSubCommand(r, t.concat(n));
				else return r._parseCommand(t, n);
			}), i;
		}
		_dispatchHelpCommand(e) {
			e || this.help();
			let t = this._findCommand(e);
			return t && !t._executableHandler && t.help(), this._dispatchSubcommand(e, [], [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]);
		}
		_checkNumberOfArguments() {
			this.registeredArguments.forEach((e, t) => {
				e.required && this.args[t] == null && this.missingArgument(e.name());
			}), !(this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) && this.args.length > this.registeredArguments.length && this._excessArguments(this.args);
		}
		_processArguments() {
			let e = (e, t, n) => {
				let r = t;
				if (t !== null && e.parseArg) {
					let i = `error: command-argument value '${t}' is invalid for argument '${e.name()}'.`;
					r = this._callParseArg(e, t, n, i);
				}
				return r;
			};
			this._checkNumberOfArguments();
			let t = [];
			this.registeredArguments.forEach((n, r) => {
				let i = n.defaultValue;
				n.variadic ? r < this.args.length ? (i = this.args.slice(r), n.parseArg && (i = i.reduce((t, r) => e(n, r, t), n.defaultValue))) : i === void 0 && (i = []) : r < this.args.length && (i = this.args[r], n.parseArg && (i = e(n, i, n.defaultValue))), t[r] = i;
			}), this.processedArgs = t;
		}
		_chainOrCall(e, t) {
			return e?.then && typeof e.then == "function" ? e.then(() => t()) : t();
		}
		_chainOrCallHooks(e, t) {
			let n = e, r = [];
			return this._getCommandAndAncestors().reverse().filter((e) => e._lifeCycleHooks[t] !== void 0).forEach((e) => {
				e._lifeCycleHooks[t].forEach((t) => {
					r.push({
						hookedCommand: e,
						callback: t
					});
				});
			}), t === "postAction" && r.reverse(), r.forEach((e) => {
				n = this._chainOrCall(n, () => e.callback(e.hookedCommand, this));
			}), n;
		}
		_chainOrCallSubCommandHook(e, t, n) {
			let r = e;
			return this._lifeCycleHooks[n] !== void 0 && this._lifeCycleHooks[n].forEach((e) => {
				r = this._chainOrCall(r, () => e(this, t));
			}), r;
		}
		_parseCommand(e, t) {
			let n = this.parseOptions(t);
			if (this._parseOptionsEnv(), this._parseOptionsImplied(), e = e.concat(n.operands), t = n.unknown, this.args = e.concat(t), e && this._findCommand(e[0])) return this._dispatchSubcommand(e[0], e.slice(1), t);
			if (this._getHelpCommand() && e[0] === this._getHelpCommand().name()) return this._dispatchHelpCommand(e[1]);
			if (this._defaultCommandName) return this._outputHelpIfRequested(t), this._dispatchSubcommand(this._defaultCommandName, e, t);
			this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName && this.help({ error: !0 }), this._outputHelpIfRequested(n.unknown), this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
			let r = () => {
				n.unknown.length > 0 && this.unknownOption(n.unknown[0]);
			}, i = `command:${this.name()}`;
			if (this._actionHandler) {
				r(), this._processArguments();
				let n;
				return n = this._chainOrCallHooks(n, "preAction"), n = this._chainOrCall(n, () => this._actionHandler(this.processedArgs)), this.parent && (n = this._chainOrCall(n, () => {
					this.parent.emit(i, e, t);
				})), n = this._chainOrCallHooks(n, "postAction"), n;
			}
			if (this.parent?.listenerCount(i)) r(), this._processArguments(), this.parent.emit(i, e, t);
			else if (e.length) {
				if (this._findCommand("*")) return this._dispatchSubcommand("*", e, t);
				this.listenerCount("command:*") ? this.emit("command:*", e, t) : this.commands.length ? this.unknownCommand() : (r(), this._processArguments());
			} else this.commands.length ? (r(), this.help({ error: !0 })) : (r(), this._processArguments());
		}
		_findCommand(e) {
			if (e) return this.commands.find((t) => t._name === e || t._aliases.includes(e));
		}
		_findOption(e) {
			return this.options.find((t) => t.is(e));
		}
		_checkForMissingMandatoryOptions() {
			this._getCommandAndAncestors().forEach((e) => {
				e.options.forEach((t) => {
					t.mandatory && e.getOptionValue(t.attributeName()) === void 0 && e.missingMandatoryOptionValue(t);
				});
			});
		}
		_checkForConflictingLocalOptions() {
			let e = this.options.filter((e) => {
				let t = e.attributeName();
				return this.getOptionValue(t) === void 0 ? !1 : this.getOptionValueSource(t) !== "default";
			});
			e.filter((e) => e.conflictsWith.length > 0).forEach((t) => {
				let n = e.find((e) => t.conflictsWith.includes(e.attributeName()));
				n && this._conflictingOption(t, n);
			});
		}
		_checkForConflictingOptions() {
			this._getCommandAndAncestors().forEach((e) => {
				e._checkForConflictingLocalOptions();
			});
		}
		parseOptions(e) {
			let t = [], n = [], r = t;
			function i(e) {
				return e.length > 1 && e[0] === "-";
			}
			let a = (e) => /^-(\d+|\d*\.\d+)(e[+-]?\d+)?$/.test(e) ? !this._getCommandAndAncestors().some((e) => e.options.map((e) => e.short).some((e) => /^-\d$/.test(e))) : !1, o = null, s = null, c = 0;
			for (; c < e.length || s;) {
				let l = s ?? e[c++];
				if (s = null, l === "--") {
					r === n && r.push(l), r.push(...e.slice(c));
					break;
				}
				if (o && (!i(l) || a(l))) {
					this.emit(`option:${o.name()}`, l);
					continue;
				}
				if (o = null, i(l)) {
					let t = this._findOption(l);
					if (t) {
						if (t.required) {
							let n = e[c++];
							n === void 0 && this.optionMissingArgument(t), this.emit(`option:${t.name()}`, n);
						} else if (t.optional) {
							let n = null;
							c < e.length && (!i(e[c]) || a(e[c])) && (n = e[c++]), this.emit(`option:${t.name()}`, n);
						} else this.emit(`option:${t.name()}`);
						o = t.variadic ? t : null;
						continue;
					}
				}
				if (l.length > 2 && l[0] === "-" && l[1] !== "-") {
					let e = this._findOption(`-${l[1]}`);
					if (e) {
						e.required || e.optional && this._combineFlagAndOptionalValue ? this.emit(`option:${e.name()}`, l.slice(2)) : (this.emit(`option:${e.name()}`), s = `-${l.slice(2)}`);
						continue;
					}
				}
				if (/^--[^=]+=/.test(l)) {
					let e = l.indexOf("="), t = this._findOption(l.slice(0, e));
					if (t && (t.required || t.optional)) {
						this.emit(`option:${t.name()}`, l.slice(e + 1));
						continue;
					}
				}
				if (r === t && i(l) && !(this.commands.length === 0 && a(l)) && (r = n), (this._enablePositionalOptions || this._passThroughOptions) && t.length === 0 && n.length === 0) {
					if (this._findCommand(l)) {
						t.push(l), n.push(...e.slice(c));
						break;
					} else if (this._getHelpCommand() && l === this._getHelpCommand().name()) {
						t.push(l, ...e.slice(c));
						break;
					} else if (this._defaultCommandName) {
						n.push(l, ...e.slice(c));
						break;
					}
				}
				if (this._passThroughOptions) {
					r.push(l, ...e.slice(c));
					break;
				}
				r.push(l);
			}
			return {
				operands: t,
				unknown: n
			};
		}
		opts() {
			if (this._storeOptionsAsProperties) {
				let e = {}, t = this.options.length;
				for (let n = 0; n < t; n++) {
					let t = this.options[n].attributeName();
					e[t] = t === this._versionOptionName ? this._version : this[t];
				}
				return e;
			}
			return this._optionValues;
		}
		optsWithGlobals() {
			return this._getCommandAndAncestors().reduce((e, t) => Object.assign(e, t.opts()), {});
		}
		error(e, t) {
			this._outputConfiguration.outputError(`${e}\n`, this._outputConfiguration.writeErr), typeof this._showHelpAfterError == "string" ? this._outputConfiguration.writeErr(`${this._showHelpAfterError}\n`) : this._showHelpAfterError && (this._outputConfiguration.writeErr("\n"), this.outputHelp({ error: !0 }));
			let n = t || {}, r = n.exitCode || 1, i = n.code || "commander.error";
			this._exit(r, i, e);
		}
		_parseOptionsEnv() {
			this.options.forEach((e) => {
				if (e.envVar && e.envVar in a.env) {
					let t = e.attributeName();
					(this.getOptionValue(t) === void 0 || [
						"default",
						"config",
						"env"
					].includes(this.getOptionValueSource(t))) && (e.required || e.optional ? this.emit(`optionEnv:${e.name()}`, a.env[e.envVar]) : this.emit(`optionEnv:${e.name()}`));
				}
			});
		}
		_parseOptionsImplied() {
			let e = new f(this.options), t = (e) => this.getOptionValue(e) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(e));
			this.options.filter((n) => n.implied !== void 0 && t(n.attributeName()) && e.valueFromOption(this.getOptionValue(n.attributeName()), n)).forEach((e) => {
				Object.keys(e.implied).filter((e) => !t(e)).forEach((t) => {
					this.setOptionValueWithSource(t, e.implied[t], "implied");
				});
			});
		}
		missingArgument(e) {
			let t = `error: missing required argument '${e}'`;
			this.error(t, { code: "commander.missingArgument" });
		}
		optionMissingArgument(e) {
			let t = `error: option '${e.flags}' argument missing`;
			this.error(t, { code: "commander.optionMissingArgument" });
		}
		missingMandatoryOptionValue(e) {
			let t = `error: required option '${e.flags}' not specified`;
			this.error(t, { code: "commander.missingMandatoryOptionValue" });
		}
		_conflictingOption(e, t) {
			let n = (e) => {
				let t = e.attributeName(), n = this.getOptionValue(t), r = this.options.find((e) => e.negate && t === e.attributeName()), i = this.options.find((e) => !e.negate && t === e.attributeName());
				return r && (r.presetArg === void 0 && n === !1 || r.presetArg !== void 0 && n === r.presetArg) ? r : i || e;
			}, r = (e) => {
				let t = n(e), r = t.attributeName();
				return this.getOptionValueSource(r) === "env" ? `environment variable '${t.envVar}'` : `option '${t.flags}'`;
			}, i = `error: ${r(e)} cannot be used with ${r(t)}`;
			this.error(i, { code: "commander.conflictingOption" });
		}
		unknownOption(e) {
			if (this._allowUnknownOption) return;
			let t = "";
			if (e.startsWith("--") && this._showSuggestionAfterError) {
				let n = [], r = this;
				do {
					let e = r.createHelp().visibleOptions(r).filter((e) => e.long).map((e) => e.long);
					n = n.concat(e), r = r.parent;
				} while (r && !r._enablePositionalOptions);
				t = p(e, n);
			}
			let n = `error: unknown option '${e}'${t}`;
			this.error(n, { code: "commander.unknownOption" });
		}
		_excessArguments(e) {
			if (this._allowExcessArguments) return;
			let t = this.registeredArguments.length, n = t === 1 ? "" : "s", r = `error: too many arguments${this.parent ? ` for '${this.name()}'` : ""}. Expected ${t} argument${n} but got ${e.length}.`;
			this.error(r, { code: "commander.excessArguments" });
		}
		unknownCommand() {
			let e = this.args[0], t = "";
			if (this._showSuggestionAfterError) {
				let n = [];
				this.createHelp().visibleCommands(this).forEach((e) => {
					n.push(e.name()), e.alias() && n.push(e.alias());
				}), t = p(e, n);
			}
			let n = `error: unknown command '${e}'${t}`;
			this.error(n, { code: "commander.unknownCommand" });
		}
		version(e, t, n) {
			if (e === void 0) return this._version;
			this._version = e, t ||= "-V, --version", n ||= "output the version number";
			let r = this.createOption(t, n);
			return this._versionOptionName = r.attributeName(), this._registerOption(r), this.on("option:" + r.name(), () => {
				this._outputConfiguration.writeOut(`${e}\n`), this._exit(0, "commander.version", e);
			}), this;
		}
		description(e, t) {
			return e === void 0 && t === void 0 ? this._description : (this._description = e, t && (this._argsDescription = t), this);
		}
		summary(e) {
			return e === void 0 ? this._summary : (this._summary = e, this);
		}
		alias(e) {
			if (e === void 0) return this._aliases[0];
			let t = this;
			if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler && (t = this.commands[this.commands.length - 1]), e === t._name) throw Error("Command alias can't be the same as its name");
			let n = this.parent?._findCommand(e);
			if (n) {
				let t = [n.name()].concat(n.aliases()).join("|");
				throw Error(`cannot add alias '${e}' to command '${this.name()}' as already have command '${t}'`);
			}
			return t._aliases.push(e), this;
		}
		aliases(e) {
			return e === void 0 ? this._aliases : (e.forEach((e) => this.alias(e)), this);
		}
		usage(e) {
			if (e === void 0) {
				if (this._usage) return this._usage;
				let e = this.registeredArguments.map((e) => s(e));
				return [].concat(this.options.length || this._helpOption !== null ? "[options]" : [], this.commands.length ? "[command]" : [], this.registeredArguments.length ? e : []).join(" ");
			}
			return this._usage = e, this;
		}
		name(e) {
			return e === void 0 ? this._name : (this._name = e, this);
		}
		helpGroup(e) {
			return e === void 0 ? this._helpGroupHeading ?? "" : (this._helpGroupHeading = e, this);
		}
		commandsGroup(e) {
			return e === void 0 ? this._defaultCommandGroup ?? "" : (this._defaultCommandGroup = e, this);
		}
		optionsGroup(e) {
			return e === void 0 ? this._defaultOptionGroup ?? "" : (this._defaultOptionGroup = e, this);
		}
		_initOptionGroup(e) {
			this._defaultOptionGroup && !e.helpGroupHeading && e.helpGroup(this._defaultOptionGroup);
		}
		_initCommandGroup(e) {
			this._defaultCommandGroup && !e.helpGroup() && e.helpGroup(this._defaultCommandGroup);
		}
		nameFromFilename(e) {
			return this._name = r.basename(e, r.extname(e)), this;
		}
		executableDir(e) {
			return e === void 0 ? this._executableDir : (this._executableDir = e, this);
		}
		helpInformation(e) {
			let t = this.createHelp(), n = this._getOutputContext(e);
			t.prepareContext({
				error: n.error,
				helpWidth: n.helpWidth,
				outputHasColors: n.hasColors
			});
			let r = t.formatHelp(this, t);
			return n.hasColors ? r : this._outputConfiguration.stripColor(r);
		}
		_getOutputContext(e) {
			e ||= {};
			let t = !!e.error, n, r, i;
			return t ? (n = (e) => this._outputConfiguration.writeErr(e), r = this._outputConfiguration.getErrHasColors(), i = this._outputConfiguration.getErrHelpWidth()) : (n = (e) => this._outputConfiguration.writeOut(e), r = this._outputConfiguration.getOutHasColors(), i = this._outputConfiguration.getOutHelpWidth()), {
				error: t,
				write: (e) => (r || (e = this._outputConfiguration.stripColor(e)), n(e)),
				hasColors: r,
				helpWidth: i
			};
		}
		outputHelp(e) {
			let t;
			typeof e == "function" && (t = e, e = void 0);
			let n = this._getOutputContext(e), r = {
				error: n.error,
				write: n.write,
				command: this
			};
			this._getCommandAndAncestors().reverse().forEach((e) => e.emit("beforeAllHelp", r)), this.emit("beforeHelp", r);
			let i = this.helpInformation({ error: n.error });
			if (t && (i = t(i), typeof i != "string" && !Buffer.isBuffer(i))) throw Error("outputHelp callback must return a string or a Buffer");
			n.write(i), this._getHelpOption()?.long && this.emit(this._getHelpOption().long), this.emit("afterHelp", r), this._getCommandAndAncestors().forEach((e) => e.emit("afterAllHelp", r));
		}
		helpOption(e, t) {
			return typeof e == "boolean" ? (e ? (this._helpOption === null && (this._helpOption = void 0), this._defaultOptionGroup && this._initOptionGroup(this._getHelpOption())) : this._helpOption = null, this) : (this._helpOption = this.createOption(e ?? "-h, --help", t ?? "display help for command"), (e || t) && this._initOptionGroup(this._helpOption), this);
		}
		_getHelpOption() {
			return this._helpOption === void 0 && this.helpOption(void 0, void 0), this._helpOption;
		}
		addHelpOption(e) {
			return this._helpOption = e, this._initOptionGroup(e), this;
		}
		help(e) {
			this.outputHelp(e);
			let t = Number(a.exitCode ?? 0);
			t === 0 && e && typeof e != "function" && e.error && (t = 1), this._exit(t, "commander.help", "(outputHelp)");
		}
		addHelpText(e, t) {
			let n = [
				"beforeAll",
				"before",
				"after",
				"afterAll"
			];
			if (!n.includes(e)) throw Error(`Unexpected value for position to addHelpText.
Expecting one of '${n.join("', '")}'`);
			let r = `${e}Help`;
			return this.on(r, (e) => {
				let n;
				n = typeof t == "function" ? t({
					error: e.error,
					command: e.command
				}) : t, n && e.write(`${n}\n`);
			}), this;
		}
		_outputHelpIfRequested(e) {
			let t = this._getHelpOption();
			t && e.find((e) => t.is(e)) && (this.outputHelp(), this._exit(0, "commander.helpDisplayed", "(outputHelp)"));
		}
	};
	function h(e) {
		return e.map((e) => {
			if (!e.startsWith("--inspect")) return e;
			let t, n = "127.0.0.1", r = "9229", i;
			return (i = e.match(/^(--inspect(-brk)?)$/)) === null ? (i = e.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) === null ? (i = e.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null && (t = i[1], n = i[3], r = i[4]) : (t = i[1], /^\d+$/.test(i[3]) ? r = i[3] : n = i[3]) : t = i[1], t && r !== "0" ? `${t}=${n}:${parseInt(r) + 1}` : e;
		});
	}
	function b() {
		if (a.env.NO_COLOR || a.env.FORCE_COLOR === "0" || a.env.FORCE_COLOR === "false") return !1;
		if (a.env.FORCE_COLOR || a.env.CLICOLOR_FORCE !== void 0) return !0;
	}
	e.Command = m, e.useColor = b;
})), { program: x, createCommand: S, createArgument: C, createOption: ne, CommanderError: w, InvalidArgumentError: T, InvalidOptionArgumentError: re, Command: E, Argument: D, Option: O, Help: k } = (/* @__PURE__ */ h((/* @__PURE__ */ p(((e) => {
	var { Argument: t } = v(), { Command: n } = b(), { CommanderError: r, InvalidArgumentError: i } = _(), { Help: a } = ee(), { Option: o } = y();
	e.program = new n(), e.createCommand = (e) => new n(e), e.createOption = (e, t) => new o(e, t), e.createArgument = (e, n) => new t(e, n), e.Command = n, e.Option = o, e.Argument = t, e.Help = a, e.CommanderError = r, e.InvalidArgumentError = i, e.InvalidOptionArgumentError = i;
})))(), 1)).default;
//#endregion
//#region ../node_modules/es-toolkit/dist/array/chunk.mjs
function A(e, t) {
	if (!Number.isInteger(t) || t <= 0) throw Error("Size must be an integer greater than zero.");
	let n = Math.ceil(e.length / t), r = Array(n);
	for (let i = 0; i < n; i++) {
		let n = i * t, a = n + t;
		r[i] = e.slice(n, a);
	}
	return r;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/compact.mjs
function j(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		r && t.push(r);
	}
	return t;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/difference.mjs
function ie(e, t) {
	let n = new Set(t);
	return e.filter((e) => !n.has(e));
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/flatten.mjs
function ae(e, t = 1) {
	let n = [], r = Math.floor(t), i = (e, t) => {
		for (let a = 0; a < e.length; a++) {
			let o = e[a];
			Array.isArray(o) && t < r ? i(o, t + 1) : n.push(o);
		}
	};
	return i(e, 0), n;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/flatMap.mjs
function M(e, t, n = 1) {
	return ae(e.map((n, r) => t(n, r, e)), n);
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/maxBy.mjs
function oe(e, t) {
	if (e.length === 0) return;
	let n = e[0], r = t(n, 0, e);
	for (let i = 1; i < e.length; i++) {
		let a = e[i], o = t(a, i, e);
		o > r && (r = o, n = a);
	}
	return n;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/minBy.mjs
function se(e, t) {
	if (e.length === 0) return;
	let n = e[0], r = t(n, 0, e);
	for (let i = 1; i < e.length; i++) {
		let a = e[i], o = t(a, i, e);
		o < r && (r = o, n = a);
	}
	return n;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/remove.mjs
function N(e, t) {
	let n = e.slice(), r = [], i = 0;
	for (let a = 0; a < e.length; a++) {
		if (t(e[a], a, n)) {
			r.push(e[a]);
			continue;
		}
		if (!Object.hasOwn(e, a)) {
			delete e[i++];
			continue;
		}
		e[i++] = e[a];
	}
	return e.length = i, r;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/sample.mjs
function ce(e) {
	return e[Math.floor(Math.random() * e.length)];
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/uniq.mjs
function le(e) {
	return [...new Set(e)];
}
//#endregion
//#region ../node_modules/es-toolkit/dist/array/without.mjs
function ue(e, ...t) {
	return ie(e, t);
}
//#endregion
//#region ../node_modules/es-toolkit/dist/math/sumBy.mjs
function de(e, t) {
	let n = 0;
	for (let r = 0; r < e.length; r++) n += t(e[r], r);
	return n;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/math/round.mjs
function fe(e, t = 0) {
	if (!Number.isInteger(t)) throw Error("Precision must be an integer.");
	let n = 10 ** t;
	return Math.round(e * n) / n;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/predicate/isPrimitive.mjs
function pe(e) {
	return e == null || typeof e != "object" && typeof e != "function";
}
//#endregion
//#region ../node_modules/es-toolkit/dist/string/capitalize.mjs
function me(e) {
	return e.charAt(0).toUpperCase() + e.slice(1).toLowerCase();
}
//#endregion
//#region ../node_modules/es-toolkit/dist/string/words.mjs
var P = /\p{Lu}?\p{Ll}+|[0-9]+|\p{Lu}+(?!\p{Ll})|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{L}+/gu;
function he(e) {
	return Array.from(e.match(P) ?? []);
}
//#endregion
//#region ../node_modules/es-toolkit/dist/string/camelCase.mjs
function ge(e) {
	let t = he(e);
	if (t.length === 0) return "";
	let [n, ...r] = t;
	return `${n.toLowerCase()}${r.map((e) => me(e)).join("")}`;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/_internal/isEqualsSameValueZero.mjs
function _e(e, t) {
	return e === t || Number.isNaN(e) && Number.isNaN(t);
}
//#endregion
//#region ../node_modules/es-toolkit/dist/predicate/isNil.mjs
function ve(e) {
	return e == null;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/string/kebabCase.mjs
function ye(e) {
	return he(e).map((e) => e.toLowerCase()).join("-");
}
//#endregion
//#region ../node_modules/es-toolkit/dist/string/lowerFirst.mjs
function be(e) {
	return e.substring(0, 1).toLowerCase() + e.substring(1);
}
//#endregion
//#region ../node_modules/es-toolkit/dist/string/upperFirst.mjs
function xe(e) {
	return e.substring(0, 1).toUpperCase() + e.substring(1);
}
//#endregion
//#region ../common-javascript/src/main/javascript/suspense/Suspender.ts
var Se = class e {
	promise;
	state;
	value;
	constructor(e) {
		this.state = "pending", this.value = void 0, this.promise = e.then((e) => (this.state = "resolved", this.value = e, e)).catch((e) => {
			throw this.state = "rejected", this.value = e, e;
		});
	}
	valueOrThrow() {
		if (this.isPending()) throw this.promise;
		if (this.isRejected()) throw this.value;
		return this.value;
	}
	isPending() {
		return this.state === "pending";
	}
	isResolved() {
		return this.state === "resolved";
	}
	isRejected() {
		return this.state === "rejected";
	}
	isFulfilled() {
		return this.isResolved() || this.isRejected();
	}
	static resolve(t) {
		return new e(Promise.resolve(t));
	}
}, Ce = class {
	listeners;
	unsubscribers;
	triggerTimer;
	externalStoreCounter;
	state;
	constructor() {
		this.listeners = {}, this.unsubscribers = [], this.externalStoreCounter = 0, this.state = {}, this.onAnyChange = this.onAnyChange.bind(this), this.getUseSyncExternalStoreSnapshot = this.getUseSyncExternalStoreSnapshot.bind(this);
	}
	initialize() {
		return this;
	}
	setState(e) {
		Object.entries(e).some(([e, t]) => !this.compareState(this.state[e], t)) && (this.state = {
			...this.state,
			...e
		}, this.externalStoreCounter++, Object.keys(e).forEach((e) => this.trigger(e)), this.trigger("*"));
	}
	getUseSyncExternalStoreSnapshot() {
		return this.externalStoreCounter;
	}
	onAnyChange(e) {
		return this.registerListener("*", e);
	}
	compareState(e, t) {
		return e === t;
	}
	subscribe(e) {
		if (!e) throw Error("Unsubscriber must be defined");
		this.unsubscribers.push(e);
	}
	registerListener(e, t) {
		return this.listeners[e] || (this.listeners[e] = []), this.listeners[e].push(t), () => {
			N(this.listeners[e] ?? [], (e) => e === t);
		};
	}
	trigger(e, ...t) {
		if (this.listeners[e]) {
			if (e === "*") {
				window.clearTimeout(this.triggerTimer), this.triggerTimer = window.setTimeout(() => {
					this.listeners[e].slice().forEach((e) => e());
				}, 0);
				return;
			}
			this.listeners[e].slice().forEach((e) => e(...t));
		}
	}
	track(e) {
		return e.finally(() => {
			this.externalStoreCounter++, this.trigger("*");
		}), new Se(e);
	}
	close() {
		this.unsubscribers.forEach((e) => e()), this.unsubscribers = [], this.listeners = {};
	}
}, we = /* @__PURE__ */ p(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.iterator;
	function m(e) {
		return typeof e != "object" || !e ? null : (e = p && e[p] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var h = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, g = Object.assign, _ = {};
	function v(e, t, n) {
		this.props = e, this.context = t, this.refs = _, this.updater = n || h;
	}
	v.prototype.isReactComponent = {}, v.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, v.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function ee() {}
	ee.prototype = v.prototype;
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = _, this.updater = n || h;
	}
	var te = y.prototype = new ee();
	te.constructor = y, g(te, v.prototype), te.isPureReactComponent = !0;
	var b = Array.isArray;
	function x() {}
	var S = {
		H: null,
		A: null,
		T: null,
		S: null
	}, C = Object.prototype.hasOwnProperty;
	function ne(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function w(e, t) {
		return ne(e.type, t, e.props);
	}
	function T(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function re(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var E = /\/+/g;
	function D(e, t) {
		return typeof e == "object" && e && e.key != null ? re("" + e.key) : t.toString(36);
	}
	function O(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(x, x) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function k(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, k(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + D(e, 0) : a, b(o) ? (i = "", c != null && (i = c.replace(E, "$&/") + "/"), k(o, r, i, "", function(e) {
			return e;
		})) : o != null && (T(o) && (o = w(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(E, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (b(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + D(a, u), c += k(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + D(a, u++), c += k(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return k(O(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function A(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return k(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function j(e) {
		if (e._status === -1) {
			var t = e._result;
			t = t(), t.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t);
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t);
			}), e._status === -1 && (e._status = 0, e._result = t);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var ie = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, ae = {
		map: A,
		forEach: function(e, t, n) {
			A(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return A(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return A(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!T(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = ae, e.Component = v, e.Fragment = r, e.Profiler = a, e.PureComponent = y, e.StrictMode = i, e.Suspense = l, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = S, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return S.H.useMemoCache(e);
		}
	}, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = g({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !C.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return ne(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) C.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return ne(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = T, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: j
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = function(e) {
		var t = S.T, n = {};
		S.T = n;
		try {
			var r = e(), i = S.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(x, ie);
		} catch (e) {
			ie(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), S.T = t;
		}
	}, e.unstable_useCacheRefresh = function() {
		return S.H.useCacheRefresh();
	}, e.use = function(e) {
		return S.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return S.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return S.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return S.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return S.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return S.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return S.H.useEffectEvent(e);
	}, e.useId = function() {
		return S.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return S.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return S.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return S.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return S.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return S.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return S.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return S.H.useRef(e);
	}, e.useState = function(e) {
		return S.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return S.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return S.H.useTransition();
	}, e.version = "19.2.0";
})), Te = /* @__PURE__ */ p(((e, t) => {
	t.exports = we();
})), Ee = /* @__PURE__ */ h(Te(), 1), F = new Proxy({}, { get() {
	throw Error("Tried to access store context before it has been set. This is usually caused by Vite fast refresh. Reload the page.");
} }), De = () => {
	let e = Ee.createContext(F);
	return [e, () => {
		let t = (0, Ee.useContext)(e);
		return (0, Ee.useSyncExternalStore)(t.onAnyChange, t.getUseSyncExternalStoreSnapshot), t;
	}];
}, Oe = {}, ke = () => {}, Ae = 3, je = null, Me = (e) => {
	if (e.endsWith(".js") || e.endsWith(".ts") || e.endsWith(".tsx")) {
		let t;
		t = e.includes("/") ? "/" : "\\";
		let n = e.lastIndexOf(t) + 1, r = e.lastIndexOf(".");
		return e.substr(n, r - n);
	}
	return e;
}, Ne = {
	TRACE: 1,
	DEBUG: 2,
	INFO: 3,
	WARN: 4,
	ERROR: 5,
	OFF: 6
}, Pe = class {
	name;
	level;
	constructor(e) {
		return e = Me(e), Oe[e] ? Oe[e] : (this.name = e, this.setLogLevel(Ae), Oe[e] = this, this);
	}
	_initialize() {
		[
			"error",
			"warn",
			"info",
			"debug",
			"trace"
		].forEach((e) => {
			let t = ke;
			Ne[e.toLocaleUpperCase()] >= this.level && (je ? t = (...t) => {
				je.log(this.name, e, t), console[e](...[`[${this.name}]`].concat(t));
			} : !je && typeof console < "u" && console[e] && (t = Function.prototype.bind.call(console[e], console, `[${this.name}]`))), this[e] = t;
		});
	}
	setLogLevel(e) {
		return this.level = e, this._initialize(), this;
	}
	error(...e) {}
	warn(...e) {}
	info(...e) {}
	debug(...e) {}
	trace(...e) {}
}, Fe = new Pe("Action").setLogLevel(Ne.INFO), Ie = {}, Le = (e, t = !1) => {
	if (Ie[e]) {
		if (t) return Ie[e];
		throw Error(`Action ${e} already exists.`);
	}
	let n = [], r = async (...t) => (Fe.debug("Triggered action", e, "with args", t), (await Promise.all(n.map((e) => e(...t)))).find((e) => e !== void 0));
	return r.actionName = e, r.onDispatch = (e) => (n.push(e), () => {
		N(n, (t) => t === e);
	}), Ie[e] = r, r;
};
Le("login"), Le("mfaLogin"), Le("enableMfa"), Le("validateMfaTotp"), Le("disableMfa"), Le("loginWithToken"), Le("logout"), Le("changePassword"), Le("changePasswordWithToken"), Le("loginOtherUser"), Le("requestPasswordReset"), Le("goToHelpCenter"), Le("goToZendeskHelpCenter"), Le("loginWithGoogle"), Le("acceptDataProcessingAgreementForOwnCompany");
var Re = Le("setCurrentRegion");
Le("overrideAuth");
//#endregion
//#region ../common-javascript/src/main/javascript/auth/SettingsStore.ts
var [ze, Be] = De(), Ve = class extends Ce {
	constructor(e = window) {
		super(), this.state = {
			config: e.CONFIG,
			build: e.BUILD,
			currentRegion: null
		};
	}
	initialize() {
		return super.initialize(), this.subscribe(Re.onDispatch((e) => this.setCurrentRegion(e))), this.checkExclusiveUiUrl(), this;
	}
	getApiUrl() {
		if (!this.state.currentRegion) throw Error("Region-specific api url is not available before current region is set");
		return this.state.currentRegion.apiUrl;
	}
	getDataCollectionUrl() {
		if (!this.state.currentRegion) throw Error("Region-specific data collection url is not available before current region is set");
		return this.state.currentRegion.dataCollectionUrl;
	}
	getRegions() {
		return this.state.config.regions;
	}
	getCurrentRegion() {
		if (!this.state.currentRegion) throw Error("Region is not available before current region is set");
		return this.state.currentRegion;
	}
	getSentryConfig() {
		return this.state.config.sentryDsn ? {
			dsn: this.state.config.sentryDsn,
			environment: this.state.config.sentryEnv,
			release: this.state.build.version
		} : null;
	}
	getMixpanelToken() {
		return this.state.config.mixpanelToken;
	}
	getBuildVersion() {
		return this.state.build.version;
	}
	getStripePublishableKey(e) {
		let t = this.state.config.stripePublishableKeys[e];
		if (!t) throw Error(`Unknown Stripe region id: ${e}`);
		return t;
	}
	setCurrentRegion(e) {
		if (!e) {
			this.setState({ currentRegion: null });
			return;
		}
		let t = this.state.config.regions.find((t) => t.id === e);
		if (!t) throw Error(`Unknown region: ${e}`);
		this.setState({ currentRegion: t });
	}
	checkExclusiveUiUrl() {
		let e = this.state.config.regions.find((e) => !!e.exclusiveUiUrl);
		e && (window.location.href.startsWith(e.exclusiveUiUrl) || (window.location.href = `${e.exclusiveUiUrl}/${window.location.hash}`));
	}
}, He = class {
	accessToken;
	expirationDate;
	mfaNeeded;
	constructor(e) {
		this.accessToken = e.accessToken, this.expirationDate = e.expirationDate, this.mfaNeeded = e.mfaNeeded;
	}
}, Ue = new Set([
	"localhost",
	"127.0.0.1",
	"[::1]"
]), We = (e, t) => {
	try {
		let n = new URL(e), r = new URL(t);
		return n.protocol !== r.protocol || !(n.hostname === r.hostname || Ue.has(n.hostname) && Ue.has(r.hostname)) ? !1 : r.pathname === "/" || n.pathname.startsWith(r.pathname);
	} catch {
		return !1;
	}
}, Ge = class {
	id;
	name;
	author;
	contact;
	redirectUri;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.author = e.author, this.contact = e.contact, this.redirectUri = e.redirectUri;
	}
	getRedirectUris() {
		return this.redirectUri?.split(/\s+/).filter(Boolean) ?? [];
	}
	isAllowedRedirectUri(e) {
		return this.getRedirectUris().some((t) => We(e, t));
	}
}, Ke = class {
	targetKey;
	bucket;
	region;
	credentials;
	datetime;
	endpoint;
	constructor(e) {
		this.targetKey = e.targetKey, this.bucket = e.bucket, this.region = e.region, this.credentials = e.credentials, this.datetime = e.datetime, this.endpoint = e.endpoint;
	}
}, qe = (e, t) => new Promise((n, r) => {
	let i = setTimeout(() => n(), e);
	t?.addEventListener("abort", () => {
		clearTimeout(i), r(t.reason ?? new DOMException("Aborted", "AbortError"));
	});
}), Je = (e) => Object.entries(e).map(([e, t]) => Array.isArray(t) ? t.map((t) => `${encodeURIComponent(e)}=${encodeURIComponent(t)}`).join("&") : `${encodeURIComponent(e)}=${encodeURIComponent(t)}`).join("&"), Ye = (e) => {
	let t = {};
	return e.split("&").forEach((e) => {
		let n = e.indexOf("="), r = n === -1 ? e : e.slice(0, n), i = n === -1 ? "" : decodeURIComponent(e.slice(n + 1).replace(/\+/g, " "));
		t[r] ? Array.isArray(t[r]) ? t[r].push(i) : t[r] = [t[r], i] : t[r] = i;
	}), t;
}, Xe = class {
	constructor(e) {
		typeof e == "string" && ((e.startsWith("?") || e.startsWith("#")) && (e = e.substr(1)), Object.assign(this, Ye(e))), typeof e == "object" && e && Object.assign(this, e);
	}
	toQueryString() {
		return `?${Je(this)}`;
	}
	toHashFragment() {
		return `#${Je(this)}`;
	}
	toString() {
		return Je(this);
	}
	static addParameters(e, t) {
		return e + (e.includes("?") ? "&" : "?") + Je(t);
	}
}, Ze = new Pe("FetchApi"), Qe = class extends Error {
	status;
	data;
	constructor(e, t, n) {
		super(e), this.status = t, this.data = n;
	}
}, $e = class extends Ce {
	window;
	token;
	maxRetries;
	retryDelay;
	constructor(e = window) {
		super(), this.window = e, this.maxRetries = 2, this.retryDelay = 5e3, this.token = null, this.state = { connected: !0 };
	}
	isConnected() {
		return this.state.connected;
	}
	onConnectionChanged(e) {
		return this.registerListener("connected", e);
	}
	onUnauthorized(e) {
		return this.registerListener("unauthorized", e);
	}
	async sendRequest(e, t, n) {
		let r = n?.retries ?? this.maxRetries, i = this.getBaseUrl();
		if (!e.startsWith(i)) {
			if (e.startsWith("http") || e.startsWith("//")) return Ze.error("Tried to send request to absolute URL via api with different base URL.", e, i), Promise.reject(/* @__PURE__ */ Error("Tried to send request to absolute URL via api with different base URL."));
			e = i + e;
		}
		i.startsWith(this.window.location.origin) || (t.mode = "cors"), t = {
			...t,
			headers: {
				Accept: "application/json",
				...t.headers
			}
		}, n?.timeout && (t.signal = AbortSignal.timeout(n.timeout)), this.authenticateRequest(t);
		let a;
		try {
			a = await fetch(e, t);
		} catch (i) {
			if (this.setState({ connected: !1 }), r > 0) return await qe(this.retryDelay), this.sendRequest(e, t, {
				...n,
				retries: r - 1
			});
			throw i;
		}
		if (!a.ok) {
			if (a.status === 401) this.trigger("unauthorized");
			else if (a.status >= 500 || a.type === "opaque") {
				if (this.setState({ connected: !1 }), r > 0) return await qe(this.retryDelay), this.sendRequest(e, t, {
					...n,
					retries: r - 1
				});
				throw Error(`Request for ${e} failed.`);
			}
			this.setState({ connected: !0 });
			let i, o;
			try {
				o = await a.json(), i = o.message;
			} catch {
				throw Error(`Request for ${e} failed: ${a.statusText}`);
			}
			throw new Qe(i || a.statusText, a.status, o);
		}
		return this.setState({ connected: !0 }), a;
	}
	setAuthToken(e) {
		this.token = e;
	}
	authenticateRequest(e) {}
	getBaseUrl() {
		return "";
	}
}, I = (e) => async (t) => new e(await t.json()), et = () => (e) => e.json(), L = (e) => async (t) => (await t.json()).map((t) => new e(t)), tt = (e) => async (t) => {
	let n = await t.json(), r = {};
	return n.forEach((t) => {
		r[t.id] = new e(t);
	}), r;
}, R = (e) => ({
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(e)
}), z = (e) => ({
	headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
	body: new Xe(e).toString()
}), nt = (e, t) => Promise.race([e, new Promise((e, n) => {
	setTimeout(() => n(/* @__PURE__ */ Error("Timed out")), t);
})]), rt = (e) => {
	if (!e.ok) throw new Qe(e.statusText, e.status, void 0);
	return e;
}, it = class extends $e {
	settingsStore;
	constructor(e, t = window) {
		super(t), this.settingsStore = e;
	}
	onMultipleRegions(e) {
		return this.registerListener("multiple-regions", e);
	}
	getBaseUrl() {
		return this.settingsStore.getApiUrl();
	}
	forEachRegion(e) {
		return this.settingsStore.getRegions().map((t) => e(t).then((e) => ({
			region: t,
			value: e
		})));
	}
	setCurrentRegion(e) {
		Re(e ? e.id : null);
	}
	async sendMultiRegionRequestSingleAnswer(e) {
		let { region: t, value: n } = await Promise.any(this.forEachRegion(e));
		return this.setCurrentRegion(t), n;
	}
	async sendMultiRegionRequestMultiAnswer(e) {
		let t = await Promise.allSettled(this.forEachRegion((t) => nt(e(t), 5e3))), n = t.flatMap((e) => e.status === "fulfilled" ? [e.value] : []);
		if (n.length === 0) {
			let e = t.flatMap((e) => e.status === "rejected" && e.reason instanceof Qe ? [e.reason.status] : []);
			throw e.length === t.length && new Set(e).size === 1 ? new Qe("All region requests failed with same status", e[0], void 0) : Error("All region requests failed");
		}
		if (n.length === 1) {
			let { region: e, value: t } = n[0];
			return this.setCurrentRegion(e), t;
		}
		let r, i = new Promise((e) => {
			r = e;
		});
		return this.trigger("multiple-regions", new Map(n.map((e) => [e.region, () => {
			this.setCurrentRegion(e.region), r(e.value);
		}]))), i;
	}
}, at;
function B() {
	return at.apply(null, arguments);
}
function ot(e) {
	at = e;
}
function V(e) {
	return e instanceof Array || Object.prototype.toString.call(e) === "[object Array]";
}
function st(e) {
	return e != null && Object.prototype.toString.call(e) === "[object Object]";
}
function ct(e, t) {
	return Object.prototype.hasOwnProperty.call(e, t);
}
function lt(e) {
	if (Object.getOwnPropertyNames) return Object.getOwnPropertyNames(e).length === 0;
	for (var t in e) if (ct(e, t)) return !1;
	return !0;
}
function ut(e) {
	return e === void 0;
}
function dt(e) {
	return typeof e == "number" || Object.prototype.toString.call(e) === "[object Number]";
}
function ft(e) {
	return e instanceof Date || Object.prototype.toString.call(e) === "[object Date]";
}
function pt(e, t) {
	var n = [], r, i = e.length;
	for (r = 0; r < i; ++r) n.push(t(e[r], r));
	return n;
}
function mt(e, t) {
	for (var n in t) ct(t, n) && (e[n] = t[n]);
	return ct(t, "toString") && (e.toString = t.toString), ct(t, "valueOf") && (e.valueOf = t.valueOf), e;
}
function ht(e, t, n, r) {
	return Gi(e, t, n, r, !0).utc();
}
function gt() {
	return {
		empty: !1,
		unusedTokens: [],
		unusedInput: [],
		overflow: -2,
		charsLeftOver: 0,
		nullInput: !1,
		invalidEra: null,
		invalidMonth: null,
		invalidFormat: !1,
		userInvalidated: !1,
		iso: !1,
		parsedDateParts: [],
		era: null,
		meridiem: null,
		rfc2822: !1,
		weekdayMismatch: !1
	};
}
function H(e) {
	return e._pf ??= gt(), e._pf;
}
var _t = Array.prototype.some ? Array.prototype.some : function(e) {
	var t = Object(this), n = t.length >>> 0, r;
	for (r = 0; r < n; r++) if (r in t && e.call(this, t[r], r, t)) return !0;
	return !1;
};
function vt(e) {
	if (e._isValid == null) {
		var t = H(e), n = _t.call(t.parsedDateParts, function(e) {
			return e != null;
		}), r = !isNaN(e._d.getTime()) && t.overflow < 0 && !t.empty && !t.invalidEra && !t.invalidMonth && !t.invalidWeekday && !t.weekdayMismatch && !t.nullInput && !t.invalidFormat && !t.userInvalidated && (!t.meridiem || t.meridiem && n);
		if (e._strict && (r = r && t.charsLeftOver === 0 && t.unusedTokens.length === 0 && t.bigHour === void 0), Object.isFrozen == null || !Object.isFrozen(e)) e._isValid = r;
		else return r;
	}
	return e._isValid;
}
function yt(e) {
	var t = ht(NaN);
	return e == null ? H(t).userInvalidated = !0 : mt(H(t), e), t;
}
var bt = B.momentProperties = [], xt = !1;
function St(e, t) {
	var n, r, i, a = bt.length;
	if (ut(t._isAMomentObject) || (e._isAMomentObject = t._isAMomentObject), ut(t._i) || (e._i = t._i), ut(t._f) || (e._f = t._f), ut(t._l) || (e._l = t._l), ut(t._strict) || (e._strict = t._strict), ut(t._tzm) || (e._tzm = t._tzm), ut(t._isUTC) || (e._isUTC = t._isUTC), ut(t._offset) || (e._offset = t._offset), ut(t._pf) || (e._pf = H(t)), ut(t._locale) || (e._locale = t._locale), a > 0) for (n = 0; n < a; n++) r = bt[n], i = t[r], ut(i) || (e[r] = i);
	return e;
}
function Ct(e) {
	St(this, e), this._d = new Date(e._d == null ? NaN : e._d.getTime()), this.isValid() || (this._d = /* @__PURE__ */ new Date(NaN)), xt === !1 && (xt = !0, B.updateOffset(this), xt = !1);
}
function wt(e) {
	return e instanceof Ct || e != null && e._isAMomentObject != null;
}
function Tt(e) {
	B.suppressDeprecationWarnings === !1 && typeof console < "u" && console.warn && console.warn("Deprecation warning: " + e);
}
function Et(e, t) {
	var n = !0;
	return mt(function() {
		if (B.deprecationHandler != null && B.deprecationHandler(null, e), n) {
			var r = [], i, a, o, s = arguments.length;
			for (a = 0; a < s; a++) {
				if (i = "", typeof arguments[a] == "object") {
					for (o in i += "\n[" + a + "] ", arguments[0]) ct(arguments[0], o) && (i += o + ": " + arguments[0][o] + ", ");
					i = i.slice(0, -2);
				} else i = arguments[a];
				r.push(i);
			}
			Tt(e + "\nArguments: " + Array.prototype.slice.call(r).join("") + "\n" + (/* @__PURE__ */ Error()).stack), n = !1;
		}
		return t.apply(this, arguments);
	}, t);
}
var Dt = {};
function Ot(e, t) {
	B.deprecationHandler != null && B.deprecationHandler(e, t), Dt[e] || (Tt(t), Dt[e] = !0);
}
B.suppressDeprecationWarnings = !1, B.deprecationHandler = null;
function kt(e) {
	return typeof Function < "u" && e instanceof Function || Object.prototype.toString.call(e) === "[object Function]";
}
function At(e) {
	var t, n;
	for (n in e) ct(e, n) && (t = e[n], kt(t) ? this[n] = t : this["_" + n] = t);
	this._config = e, this._dayOfMonthOrdinalParseLenient = RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|\\d{1,2}");
}
function jt(e, t) {
	var n = mt({}, e), r;
	for (r in t) ct(t, r) && (st(e[r]) && st(t[r]) ? (n[r] = {}, mt(n[r], e[r]), mt(n[r], t[r])) : t[r] == null ? delete n[r] : n[r] = t[r]);
	for (r in e) ct(e, r) && !ct(t, r) && st(e[r]) && (n[r] = mt({}, n[r]));
	return n;
}
function Mt(e) {
	e != null && this.set(e);
}
var Nt = Object.keys ? Object.keys : function(e) {
	var t, n = [];
	for (t in e) ct(e, t) && n.push(t);
	return n;
}, Pt = {
	sameDay: "[Today at] LT",
	nextDay: "[Tomorrow at] LT",
	nextWeek: "dddd [at] LT",
	lastDay: "[Yesterday at] LT",
	lastWeek: "[Last] dddd [at] LT",
	sameElse: "L"
};
function Ft(e, t, n) {
	var r = this._calendar[e] || this._calendar.sameElse;
	return kt(r) ? r.call(t, n) : r;
}
function It(e, t, n) {
	var r = "" + Math.abs(e), i = t - r.length;
	return (e >= 0 ? n ? "+" : "" : "-") + (10 ** Math.max(0, i)).toString().substr(1) + r;
}
var Lt = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, Rt = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, zt = {}, Bt = {};
function U(e, t, n, r) {
	var i = r;
	typeof r == "string" && (i = function() {
		return this[r]();
	}), e && (Bt[e] = i), t && (Bt[t[0]] = function() {
		return It(i.apply(this, arguments), t[1], t[2]);
	}), n && (Bt[n] = function() {
		return this.localeData().ordinal(i.apply(this, arguments), e);
	});
}
function Vt(e) {
	return e.match(/\[[\s\S]/) ? e.replace(/^\[|\]$/g, "") : e.replace(/\\/g, "");
}
function Ht(e) {
	var t = e.match(Lt), n, r;
	for (n = 0, r = t.length; n < r; n++) Bt[t[n]] ? t[n] = Bt[t[n]] : t[n] = Vt(t[n]);
	return function(n) {
		var i = "", a;
		for (a = 0; a < r; a++) i += kt(t[a]) ? t[a].call(n, e) : t[a];
		return i;
	};
}
function Ut(e, t) {
	return e.isValid() ? (t = Wt(t, e.localeData()), zt[t] = zt[t] || Ht(t), zt[t](e)) : e.localeData().invalidDate();
}
function Wt(e, t) {
	var n = 5;
	function r(e) {
		return t.longDateFormat(e) || e;
	}
	for (Rt.lastIndex = 0; n >= 0 && Rt.test(e);) e = e.replace(Rt, r), Rt.lastIndex = 0, --n;
	return e;
}
var Gt = {
	LTS: "h:mm:ss A",
	LT: "h:mm A",
	L: "MM/DD/YYYY",
	LL: "MMMM D, YYYY",
	LLL: "MMMM D, YYYY h:mm A",
	LLLL: "dddd, MMMM D, YYYY h:mm A"
};
function Kt(e) {
	var t = this._longDateFormat[e], n = this._longDateFormat[e.toUpperCase()];
	return t || !n ? t : (this._longDateFormat[e] = n.match(Lt).map(function(e) {
		return e === "MMMM" || e === "MM" || e === "DD" || e === "dddd" ? e.slice(1) : e;
	}).join(""), this._longDateFormat[e]);
}
var qt = "Invalid date";
function Jt() {
	return this._invalidDate;
}
var Yt = "%d", Xt = /\d{1,2}/;
function Zt(e) {
	return this._ordinal.replace("%d", e);
}
var Qt = {
	future: "in %s",
	past: "%s ago",
	s: "a few seconds",
	ss: "%d seconds",
	m: "a minute",
	mm: "%d minutes",
	h: "an hour",
	hh: "%d hours",
	d: "a day",
	dd: "%d days",
	w: "a week",
	ww: "%d weeks",
	M: "a month",
	MM: "%d months",
	y: "a year",
	yy: "%d years"
};
function $t(e, t, n, r) {
	var i = this._relativeTime[n];
	return kt(i) ? i(e, t, n, r) : i.replace(/%d/i, e);
}
function en(e, t) {
	var n = this._relativeTime[e > 0 ? "future" : "past"];
	return kt(n) ? n(t) : n.replace(/%s/i, t);
}
var W = {};
function tn(e, t) {
	var n = e.toLowerCase();
	W[n] = W[n + "s"] = W[t] = e;
}
function nn(e) {
	return typeof e == "string" ? W[e] || W[e.toLowerCase()] : void 0;
}
function rn(e) {
	var t = {}, n, r;
	for (r in e) ct(e, r) && (n = nn(r), n && (t[n] = e[r]));
	return t;
}
var an = {};
function on(e, t) {
	an[e] = t;
}
function sn(e) {
	var t = [], n;
	for (n in e) ct(e, n) && t.push({
		unit: n,
		priority: an[n]
	});
	return t.sort(function(e, t) {
		return e.priority - t.priority;
	}), t;
}
function cn(e) {
	return e % 4 == 0 && e % 100 != 0 || e % 400 == 0;
}
function ln(e) {
	return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
}
function G(e) {
	var t = +e, n = 0;
	return t !== 0 && isFinite(t) && (n = ln(t)), n;
}
function un(e, t) {
	return function(n) {
		return n == null ? dn(this, e) : (fn(this, e, n), B.updateOffset(this, t), this);
	};
}
function dn(e, t) {
	return e.isValid() ? e._d["get" + (e._isUTC ? "UTC" : "") + t]() : NaN;
}
function fn(e, t, n) {
	e.isValid() && !isNaN(n) && (t === "FullYear" && cn(e.year()) && e.month() === 1 && e.date() === 29 ? (n = G(n), e._d["set" + (e._isUTC ? "UTC" : "") + t](n, e.month(), Zn(n, e.month()))) : e._d["set" + (e._isUTC ? "UTC" : "") + t](n));
}
function pn(e) {
	return e = nn(e), kt(this[e]) ? this[e]() : this;
}
function mn(e, t) {
	if (typeof e == "object") {
		e = rn(e);
		var n = sn(e), r, i = n.length;
		for (r = 0; r < i; r++) this[n[r].unit](e[n[r].unit]);
	} else if (e = nn(e), kt(this[e])) return this[e](t);
	return this;
}
var hn = /\d/, gn = /\d\d/, _n = /\d{3}/, vn = /\d{4}/, yn = /[+-]?\d{6}/, bn = /\d\d?/, xn = /\d\d\d\d?/, Sn = /\d\d\d\d\d\d?/, Cn = /\d{1,3}/, wn = /\d{1,4}/, Tn = /[+-]?\d{1,6}/, En = /\d+/, Dn = /[+-]?\d+/, On = /Z|[+-]\d\d:?\d\d/gi, kn = /Z|[+-]\d\d(?::?\d\d)?/gi, An = /[+-]?\d+(\.\d{1,3})?/, jn = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i, Mn = {};
function K(e, t, n) {
	Mn[e] = kt(t) ? t : function(e, r) {
		return e && n ? n : t;
	};
}
function Nn(e, t) {
	return ct(Mn, e) ? Mn[e](t._strict, t._locale) : new RegExp(Pn(e));
}
function Pn(e) {
	return Fn(e.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(e, t, n, r, i) {
		return t || n || r || i;
	}));
}
function Fn(e) {
	return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
var In = {};
function Ln(e, t) {
	var n, r = t, i;
	for (typeof e == "string" && (e = [e]), dt(t) && (r = function(e, n) {
		n[t] = G(e);
	}), i = e.length, n = 0; n < i; n++) In[e[n]] = r;
}
function Rn(e, t) {
	Ln(e, function(e, n, r, i) {
		r._w = r._w || {}, t(e, r._w, r, i);
	});
}
function zn(e, t, n) {
	t != null && ct(In, e) && In[e](t, n._a, n, e);
}
var Bn = 0, Vn = 1, Hn = 2, Un = 3, Wn = 4, Gn = 5, Kn = 6, qn = 7, Jn = 8;
function Yn(e, t) {
	return (e % t + t) % t;
}
var Xn = Array.prototype.indexOf ? Array.prototype.indexOf : function(e) {
	var t;
	for (t = 0; t < this.length; ++t) if (this[t] === e) return t;
	return -1;
};
function Zn(e, t) {
	if (isNaN(e) || isNaN(t)) return NaN;
	var n = Yn(t, 12);
	return e += (t - n) / 12, n === 1 ? cn(e) ? 29 : 28 : 31 - n % 7 % 2;
}
U("M", ["MM", 2], "Mo", function() {
	return this.month() + 1;
}), U("MMM", 0, 0, function(e) {
	return this.localeData().monthsShort(this, e);
}), U("MMMM", 0, 0, function(e) {
	return this.localeData().months(this, e);
}), tn("month", "M"), on("month", 8), K("M", bn), K("MM", bn, gn), K("MMM", function(e, t) {
	return t.monthsShortRegex(e);
}), K("MMMM", function(e, t) {
	return t.monthsRegex(e);
}), Ln(["M", "MM"], function(e, t) {
	t[Vn] = G(e) - 1;
}), Ln(["MMM", "MMMM"], function(e, t, n, r) {
	var i = n._locale.monthsParse(e, r, n._strict);
	i == null ? H(n).invalidMonth = e : t[Vn] = i;
});
var Qn = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), $n = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), er = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, tr = jn, nr = jn;
function rr(e, t) {
	return e ? V(this._months) ? this._months[e.month()] : this._months[(this._months.isFormat || er).test(t) ? "format" : "standalone"][e.month()] : V(this._months) ? this._months : this._months.standalone;
}
function ir(e, t) {
	return e ? V(this._monthsShort) ? this._monthsShort[e.month()] : this._monthsShort[er.test(t) ? "format" : "standalone"][e.month()] : V(this._monthsShort) ? this._monthsShort : this._monthsShort.standalone;
}
function ar(e, t, n) {
	var r, i, a, o = e.toLocaleLowerCase();
	if (!this._monthsParse) for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], r = 0; r < 12; ++r) a = ht([2e3, r]), this._shortMonthsParse[r] = this.monthsShort(a, "").toLocaleLowerCase(), this._longMonthsParse[r] = this.months(a, "").toLocaleLowerCase();
	return n ? t === "MMM" ? (i = Xn.call(this._shortMonthsParse, o), i === -1 ? null : i) : (i = Xn.call(this._longMonthsParse, o), i === -1 ? null : i) : t === "MMM" ? (i = Xn.call(this._shortMonthsParse, o), i === -1 ? (i = Xn.call(this._longMonthsParse, o), i === -1 ? null : i) : i) : (i = Xn.call(this._longMonthsParse, o), i === -1 ? (i = Xn.call(this._shortMonthsParse, o), i === -1 ? null : i) : i);
}
function or(e, t, n) {
	var r, i, a;
	if (this._monthsParseExact) return ar.call(this, e, t, n);
	for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), r = 0; r < 12; r++) if (i = ht([2e3, r]), n && !this._longMonthsParse[r] && (this._longMonthsParse[r] = RegExp("^" + this.months(i, "").replace(".", "") + "$", "i"), this._shortMonthsParse[r] = RegExp("^" + this.monthsShort(i, "").replace(".", "") + "$", "i")), !n && !this._monthsParse[r] && (a = "^" + this.months(i, "") + "|^" + this.monthsShort(i, ""), this._monthsParse[r] = new RegExp(a.replace(".", ""), "i")), n && t === "MMMM" && this._longMonthsParse[r].test(e) || n && t === "MMM" && this._shortMonthsParse[r].test(e) || !n && this._monthsParse[r].test(e)) return r;
}
function sr(e, t) {
	var n;
	if (!e.isValid()) return e;
	if (typeof t == "string") {
		if (/^\d+$/.test(t)) t = G(t);
		else if (t = e.localeData().monthsParse(t), !dt(t)) return e;
	}
	return n = Math.min(e.date(), Zn(e.year(), t)), e._d["set" + (e._isUTC ? "UTC" : "") + "Month"](t, n), e;
}
function cr(e) {
	return e == null ? dn(this, "Month") : (sr(this, e), B.updateOffset(this, !0), this);
}
function lr() {
	return Zn(this.year(), this.month());
}
function ur(e) {
	return this._monthsParseExact ? (ct(this, "_monthsRegex") || fr.call(this), e ? this._monthsShortStrictRegex : this._monthsShortRegex) : (ct(this, "_monthsShortRegex") || (this._monthsShortRegex = tr), this._monthsShortStrictRegex && e ? this._monthsShortStrictRegex : this._monthsShortRegex);
}
function dr(e) {
	return this._monthsParseExact ? (ct(this, "_monthsRegex") || fr.call(this), e ? this._monthsStrictRegex : this._monthsRegex) : (ct(this, "_monthsRegex") || (this._monthsRegex = nr), this._monthsStrictRegex && e ? this._monthsStrictRegex : this._monthsRegex);
}
function fr() {
	function e(e, t) {
		return t.length - e.length;
	}
	var t = [], n = [], r = [], i, a;
	for (i = 0; i < 12; i++) a = ht([2e3, i]), t.push(this.monthsShort(a, "")), n.push(this.months(a, "")), r.push(this.months(a, "")), r.push(this.monthsShort(a, ""));
	for (t.sort(e), n.sort(e), r.sort(e), i = 0; i < 12; i++) t[i] = Fn(t[i]), n[i] = Fn(n[i]);
	for (i = 0; i < 24; i++) r[i] = Fn(r[i]);
	this._monthsRegex = RegExp("^(" + r.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = RegExp("^(" + n.join("|") + ")", "i"), this._monthsShortStrictRegex = RegExp("^(" + t.join("|") + ")", "i");
}
U("Y", 0, 0, function() {
	var e = this.year();
	return e <= 9999 ? It(e, 4) : "+" + e;
}), U(0, ["YY", 2], 0, function() {
	return this.year() % 100;
}), U(0, ["YYYY", 4], 0, "year"), U(0, ["YYYYY", 5], 0, "year"), U(0, [
	"YYYYYY",
	6,
	!0
], 0, "year"), tn("year", "y"), on("year", 1), K("Y", Dn), K("YY", bn, gn), K("YYYY", wn, vn), K("YYYYY", Tn, yn), K("YYYYYY", Tn, yn), Ln(["YYYYY", "YYYYYY"], Bn), Ln("YYYY", function(e, t) {
	t[Bn] = e.length === 2 ? B.parseTwoDigitYear(e) : G(e);
}), Ln("YY", function(e, t) {
	t[Bn] = B.parseTwoDigitYear(e);
}), Ln("Y", function(e, t) {
	t[Bn] = parseInt(e, 10);
});
function pr(e) {
	return cn(e) ? 366 : 365;
}
B.parseTwoDigitYear = function(e) {
	return G(e) + (G(e) > 68 ? 1900 : 2e3);
};
var mr = un("FullYear", !0);
function hr() {
	return cn(this.year());
}
function gr(e, t, n, r, i, a, o) {
	var s;
	return e < 100 && e >= 0 ? (s = new Date(e + 400, t, n, r, i, a, o), isFinite(s.getFullYear()) && s.setFullYear(e)) : s = new Date(e, t, n, r, i, a, o), s;
}
function _r(e) {
	var t, n;
	return e < 100 && e >= 0 ? (n = Array.prototype.slice.call(arguments), n[0] = e + 400, t = new Date(Date.UTC.apply(null, n)), isFinite(t.getUTCFullYear()) && t.setUTCFullYear(e)) : t = new Date(Date.UTC.apply(null, arguments)), t;
}
function vr(e, t, n) {
	var r = 7 + t - n;
	return -((7 + _r(e, 0, r).getUTCDay() - t) % 7) + r - 1;
}
function yr(e, t, n, r, i) {
	var a = (7 + n - r) % 7, o = vr(e, r, i), s = 1 + 7 * (t - 1) + a + o, c, l;
	return s <= 0 ? (c = e - 1, l = pr(c) + s) : s > pr(e) ? (c = e + 1, l = s - pr(e)) : (c = e, l = s), {
		year: c,
		dayOfYear: l
	};
}
function br(e, t, n) {
	var r = vr(e.year(), t, n), i = Math.floor((e.dayOfYear() - r - 1) / 7) + 1, a, o;
	return i < 1 ? (o = e.year() - 1, a = i + xr(o, t, n)) : i > xr(e.year(), t, n) ? (a = i - xr(e.year(), t, n), o = e.year() + 1) : (o = e.year(), a = i), {
		week: a,
		year: o
	};
}
function xr(e, t, n) {
	var r = vr(e, t, n), i = vr(e + 1, t, n);
	return (pr(e) - r + i) / 7;
}
U("w", ["ww", 2], "wo", "week"), U("W", ["WW", 2], "Wo", "isoWeek"), tn("week", "w"), tn("isoWeek", "W"), on("week", 5), on("isoWeek", 5), K("w", bn), K("ww", bn, gn), K("W", bn), K("WW", bn, gn), Rn([
	"w",
	"ww",
	"W",
	"WW"
], function(e, t, n, r) {
	t[r.substr(0, 1)] = G(e);
});
function Sr(e) {
	return br(e, this._week.dow, this._week.doy).week;
}
var Cr = {
	dow: 0,
	doy: 6
};
function wr() {
	return this._week.dow;
}
function Tr() {
	return this._week.doy;
}
function Er(e) {
	var t = this.localeData().week(this);
	return e == null ? t : this.add((e - t) * 7, "d");
}
function Dr(e) {
	var t = br(this, 1, 4).week;
	return e == null ? t : this.add((e - t) * 7, "d");
}
U("d", 0, "do", "day"), U("dd", 0, 0, function(e) {
	return this.localeData().weekdaysMin(this, e);
}), U("ddd", 0, 0, function(e) {
	return this.localeData().weekdaysShort(this, e);
}), U("dddd", 0, 0, function(e) {
	return this.localeData().weekdays(this, e);
}), U("e", 0, 0, "weekday"), U("E", 0, 0, "isoWeekday"), tn("day", "d"), tn("weekday", "e"), tn("isoWeekday", "E"), on("day", 11), on("weekday", 11), on("isoWeekday", 11), K("d", bn), K("e", bn), K("E", bn), K("dd", function(e, t) {
	return t.weekdaysMinRegex(e);
}), K("ddd", function(e, t) {
	return t.weekdaysShortRegex(e);
}), K("dddd", function(e, t) {
	return t.weekdaysRegex(e);
}), Rn([
	"dd",
	"ddd",
	"dddd"
], function(e, t, n, r) {
	var i = n._locale.weekdaysParse(e, r, n._strict);
	i == null ? H(n).invalidWeekday = e : t.d = i;
}), Rn([
	"d",
	"e",
	"E"
], function(e, t, n, r) {
	t[r] = G(e);
});
function Or(e, t) {
	return typeof e == "string" ? isNaN(e) ? (e = t.weekdaysParse(e), typeof e == "number" ? e : null) : parseInt(e, 10) : e;
}
function kr(e, t) {
	return typeof e == "string" ? t.weekdaysParse(e) % 7 || 7 : isNaN(e) ? null : e;
}
function Ar(e, t) {
	return e.slice(t, 7).concat(e.slice(0, t));
}
var jr = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), Mr = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), Nr = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), Pr = jn, Fr = jn, Ir = jn;
function Lr(e, t) {
	var n = V(this._weekdays) ? this._weekdays : this._weekdays[e && e !== !0 && this._weekdays.isFormat.test(t) ? "format" : "standalone"];
	return e === !0 ? Ar(n, this._week.dow) : e ? n[e.day()] : n;
}
function Rr(e) {
	return e === !0 ? Ar(this._weekdaysShort, this._week.dow) : e ? this._weekdaysShort[e.day()] : this._weekdaysShort;
}
function zr(e) {
	return e === !0 ? Ar(this._weekdaysMin, this._week.dow) : e ? this._weekdaysMin[e.day()] : this._weekdaysMin;
}
function Br(e, t, n) {
	var r, i, a, o = e.toLocaleLowerCase();
	if (!this._weekdaysParse) for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], r = 0; r < 7; ++r) a = ht([2e3, 1]).day(r), this._minWeekdaysParse[r] = this.weekdaysMin(a, "").toLocaleLowerCase(), this._shortWeekdaysParse[r] = this.weekdaysShort(a, "").toLocaleLowerCase(), this._weekdaysParse[r] = this.weekdays(a, "").toLocaleLowerCase();
	return n ? t === "dddd" ? (i = Xn.call(this._weekdaysParse, o), i === -1 ? null : i) : t === "ddd" ? (i = Xn.call(this._shortWeekdaysParse, o), i === -1 ? null : i) : (i = Xn.call(this._minWeekdaysParse, o), i === -1 ? null : i) : t === "dddd" ? (i = Xn.call(this._weekdaysParse, o), i !== -1 || (i = Xn.call(this._shortWeekdaysParse, o), i !== -1) ? i : (i = Xn.call(this._minWeekdaysParse, o), i === -1 ? null : i)) : t === "ddd" ? (i = Xn.call(this._shortWeekdaysParse, o), i !== -1 || (i = Xn.call(this._weekdaysParse, o), i !== -1) ? i : (i = Xn.call(this._minWeekdaysParse, o), i === -1 ? null : i)) : (i = Xn.call(this._minWeekdaysParse, o), i !== -1 || (i = Xn.call(this._weekdaysParse, o), i !== -1) ? i : (i = Xn.call(this._shortWeekdaysParse, o), i === -1 ? null : i));
}
function Vr(e, t, n) {
	var r, i, a;
	if (this._weekdaysParseExact) return Br.call(this, e, t, n);
	for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), r = 0; r < 7; r++) if (i = ht([2e3, 1]).day(r), n && !this._fullWeekdaysParse[r] && (this._fullWeekdaysParse[r] = RegExp("^" + this.weekdays(i, "").replace(".", "\\.?") + "$", "i"), this._shortWeekdaysParse[r] = RegExp("^" + this.weekdaysShort(i, "").replace(".", "\\.?") + "$", "i"), this._minWeekdaysParse[r] = RegExp("^" + this.weekdaysMin(i, "").replace(".", "\\.?") + "$", "i")), this._weekdaysParse[r] || (a = "^" + this.weekdays(i, "") + "|^" + this.weekdaysShort(i, "") + "|^" + this.weekdaysMin(i, ""), this._weekdaysParse[r] = new RegExp(a.replace(".", ""), "i")), n && t === "dddd" && this._fullWeekdaysParse[r].test(e) || n && t === "ddd" && this._shortWeekdaysParse[r].test(e) || n && t === "dd" && this._minWeekdaysParse[r].test(e) || !n && this._weekdaysParse[r].test(e)) return r;
}
function Hr(e) {
	if (!this.isValid()) return e == null ? NaN : this;
	var t = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
	return e == null ? t : (e = Or(e, this.localeData()), this.add(e - t, "d"));
}
function Ur(e) {
	if (!this.isValid()) return e == null ? NaN : this;
	var t = (this.day() + 7 - this.localeData()._week.dow) % 7;
	return e == null ? t : this.add(e - t, "d");
}
function Wr(e) {
	if (!this.isValid()) return e == null ? NaN : this;
	if (e != null) {
		var t = kr(e, this.localeData());
		return this.day(this.day() % 7 ? t : t - 7);
	} else return this.day() || 7;
}
function Gr(e) {
	return this._weekdaysParseExact ? (ct(this, "_weekdaysRegex") || Jr.call(this), e ? this._weekdaysStrictRegex : this._weekdaysRegex) : (ct(this, "_weekdaysRegex") || (this._weekdaysRegex = Pr), this._weekdaysStrictRegex && e ? this._weekdaysStrictRegex : this._weekdaysRegex);
}
function Kr(e) {
	return this._weekdaysParseExact ? (ct(this, "_weekdaysRegex") || Jr.call(this), e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (ct(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = Fr), this._weekdaysShortStrictRegex && e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex);
}
function qr(e) {
	return this._weekdaysParseExact ? (ct(this, "_weekdaysRegex") || Jr.call(this), e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (ct(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = Ir), this._weekdaysMinStrictRegex && e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex);
}
function Jr() {
	function e(e, t) {
		return t.length - e.length;
	}
	var t = [], n = [], r = [], i = [], a, o, s, c, l;
	for (a = 0; a < 7; a++) o = ht([2e3, 1]).day(a), s = Fn(this.weekdaysMin(o, "")), c = Fn(this.weekdaysShort(o, "")), l = Fn(this.weekdays(o, "")), t.push(s), n.push(c), r.push(l), i.push(s), i.push(c), i.push(l);
	t.sort(e), n.sort(e), r.sort(e), i.sort(e), this._weekdaysRegex = RegExp("^(" + i.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = RegExp("^(" + r.join("|") + ")", "i"), this._weekdaysShortStrictRegex = RegExp("^(" + n.join("|") + ")", "i"), this._weekdaysMinStrictRegex = RegExp("^(" + t.join("|") + ")", "i");
}
function Yr() {
	return this.hours() % 12 || 12;
}
function Xr() {
	return this.hours() || 24;
}
U("H", ["HH", 2], 0, "hour"), U("h", ["hh", 2], 0, Yr), U("k", ["kk", 2], 0, Xr), U("hmm", 0, 0, function() {
	return "" + Yr.apply(this) + It(this.minutes(), 2);
}), U("hmmss", 0, 0, function() {
	return "" + Yr.apply(this) + It(this.minutes(), 2) + It(this.seconds(), 2);
}), U("Hmm", 0, 0, function() {
	return "" + this.hours() + It(this.minutes(), 2);
}), U("Hmmss", 0, 0, function() {
	return "" + this.hours() + It(this.minutes(), 2) + It(this.seconds(), 2);
});
function Zr(e, t) {
	U(e, 0, 0, function() {
		return this.localeData().meridiem(this.hours(), this.minutes(), t);
	});
}
Zr("a", !0), Zr("A", !1), tn("hour", "h"), on("hour", 13);
function Qr(e, t) {
	return t._meridiemParse;
}
K("a", Qr), K("A", Qr), K("H", bn), K("h", bn), K("k", bn), K("HH", bn, gn), K("hh", bn, gn), K("kk", bn, gn), K("hmm", xn), K("hmmss", Sn), K("Hmm", xn), K("Hmmss", Sn), Ln(["H", "HH"], Un), Ln(["k", "kk"], function(e, t, n) {
	var r = G(e);
	t[Un] = r === 24 ? 0 : r;
}), Ln(["a", "A"], function(e, t, n) {
	n._isPm = n._locale.isPM(e), n._meridiem = e;
}), Ln(["h", "hh"], function(e, t, n) {
	t[Un] = G(e), H(n).bigHour = !0;
}), Ln("hmm", function(e, t, n) {
	var r = e.length - 2;
	t[Un] = G(e.substr(0, r)), t[Wn] = G(e.substr(r)), H(n).bigHour = !0;
}), Ln("hmmss", function(e, t, n) {
	var r = e.length - 4, i = e.length - 2;
	t[Un] = G(e.substr(0, r)), t[Wn] = G(e.substr(r, 2)), t[Gn] = G(e.substr(i)), H(n).bigHour = !0;
}), Ln("Hmm", function(e, t, n) {
	var r = e.length - 2;
	t[Un] = G(e.substr(0, r)), t[Wn] = G(e.substr(r));
}), Ln("Hmmss", function(e, t, n) {
	var r = e.length - 4, i = e.length - 2;
	t[Un] = G(e.substr(0, r)), t[Wn] = G(e.substr(r, 2)), t[Gn] = G(e.substr(i));
});
function $r(e) {
	return (e + "").toLowerCase().charAt(0) === "p";
}
var ei = /[ap]\.?m?\.?/i, ti = un("Hours", !0);
function ni(e, t, n) {
	return e > 11 ? n ? "pm" : "PM" : n ? "am" : "AM";
}
var ri = {
	calendar: Pt,
	longDateFormat: Gt,
	invalidDate: qt,
	ordinal: Yt,
	dayOfMonthOrdinalParse: Xt,
	relativeTime: Qt,
	months: Qn,
	monthsShort: $n,
	week: Cr,
	weekdays: jr,
	weekdaysMin: Nr,
	weekdaysShort: Mr,
	meridiemParse: ei
}, ii = {}, ai = {}, oi;
function si(e, t) {
	var n, r = Math.min(e.length, t.length);
	for (n = 0; n < r; n += 1) if (e[n] !== t[n]) return n;
	return r;
}
function ci(e) {
	return e && e.toLowerCase().replace("_", "-");
}
function li(e) {
	for (var t = 0, n, r, i, a; t < e.length;) {
		for (a = ci(e[t]).split("-"), n = a.length, r = ci(e[t + 1]), r = r ? r.split("-") : null; n > 0;) {
			if (i = di(a.slice(0, n).join("-")), i) return i;
			if (r && r.length >= n && si(a, r) >= n - 1) break;
			n--;
		}
		t++;
	}
	return oi;
}
function ui(e) {
	return e.match("^[^/\\\\]*$") != null;
}
function di(e) {
	var t = null, n;
	if (ii[e] === void 0 && typeof module < "u" && module && module.exports && ui(e)) try {
		t = oi._abbr, n = g, n("./locale/" + e), fi(t);
	} catch {
		ii[e] = null;
	}
	return ii[e];
}
function fi(e, t) {
	var n;
	return e && (n = ut(t) ? hi(e) : pi(e, t), n ? oi = n : typeof console < "u" && console.warn && console.warn("Locale " + e + " not found. Did you forget to load it?")), oi._abbr;
}
function pi(e, t) {
	if (t !== null) {
		var n, r = ri;
		if (t.abbr = e, ii[e] != null) Ot("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."), r = ii[e]._config;
		else if (t.parentLocale != null) if (ii[t.parentLocale] != null) r = ii[t.parentLocale]._config;
		else if (n = di(t.parentLocale), n != null) r = n._config;
		else return ai[t.parentLocale] || (ai[t.parentLocale] = []), ai[t.parentLocale].push({
			name: e,
			config: t
		}), null;
		return ii[e] = new Mt(jt(r, t)), ai[e] && ai[e].forEach(function(e) {
			pi(e.name, e.config);
		}), fi(e), ii[e];
	} else return delete ii[e], null;
}
function mi(e, t) {
	if (t != null) {
		var n, r, i = ri;
		ii[e] != null && ii[e].parentLocale != null ? ii[e].set(jt(ii[e]._config, t)) : (r = di(e), r != null && (i = r._config), t = jt(i, t), r ?? (t.abbr = e), n = new Mt(t), n.parentLocale = ii[e], ii[e] = n), fi(e);
	} else ii[e] != null && (ii[e].parentLocale == null ? ii[e] != null && delete ii[e] : (ii[e] = ii[e].parentLocale, e === fi() && fi(e)));
	return ii[e];
}
function hi(e) {
	var t;
	if (e && e._locale && e._locale._abbr && (e = e._locale._abbr), !e) return oi;
	if (!V(e)) {
		if (t = di(e), t) return t;
		e = [e];
	}
	return li(e);
}
function gi() {
	return Nt(ii);
}
function _i(e) {
	var t, n = e._a;
	return n && H(e).overflow === -2 && (t = n[Vn] < 0 || n[Vn] > 11 ? Vn : n[Hn] < 1 || n[Hn] > Zn(n[Bn], n[Vn]) ? Hn : n[Un] < 0 || n[Un] > 24 || n[Un] === 24 && (n[Wn] !== 0 || n[Gn] !== 0 || n[Kn] !== 0) ? Un : n[Wn] < 0 || n[Wn] > 59 ? Wn : n[Gn] < 0 || n[Gn] > 59 ? Gn : n[Kn] < 0 || n[Kn] > 999 ? Kn : -1, H(e)._overflowDayOfYear && (t < Bn || t > Hn) && (t = Hn), H(e)._overflowWeeks && t === -1 && (t = qn), H(e)._overflowWeekday && t === -1 && (t = Jn), H(e).overflow = t), e;
}
var vi = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, yi = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, bi = /Z|[+-]\d\d(?::?\d\d)?/, xi = [
	["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
	["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
	["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
	[
		"GGGG-[W]WW",
		/\d{4}-W\d\d/,
		!1
	],
	["YYYY-DDD", /\d{4}-\d{3}/],
	[
		"YYYY-MM",
		/\d{4}-\d\d/,
		!1
	],
	["YYYYYYMMDD", /[+-]\d{10}/],
	["YYYYMMDD", /\d{8}/],
	["GGGG[W]WWE", /\d{4}W\d{3}/],
	[
		"GGGG[W]WW",
		/\d{4}W\d{2}/,
		!1
	],
	["YYYYDDD", /\d{7}/],
	[
		"YYYYMM",
		/\d{6}/,
		!1
	],
	[
		"YYYY",
		/\d{4}/,
		!1
	]
], Si = [
	["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
	["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
	["HH:mm:ss", /\d\d:\d\d:\d\d/],
	["HH:mm", /\d\d:\d\d/],
	["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
	["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
	["HHmmss", /\d\d\d\d\d\d/],
	["HHmm", /\d\d\d\d/],
	["HH", /\d\d/]
], Ci = /^\/?Date\((-?\d+)/i, wi = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/, Ti = {
	UT: 0,
	GMT: 0,
	EDT: -240,
	EST: -300,
	CDT: -300,
	CST: -360,
	MDT: -360,
	MST: -420,
	PDT: -420,
	PST: -480
};
function Ei(e) {
	var t, n, r = e._i, i = vi.exec(r) || yi.exec(r), a, o, s, c, l = xi.length, u = Si.length;
	if (i) {
		for (H(e).iso = !0, t = 0, n = l; t < n; t++) if (xi[t][1].exec(i[1])) {
			o = xi[t][0], a = xi[t][2] !== !1;
			break;
		}
		if (o == null) {
			e._isValid = !1;
			return;
		}
		if (i[3]) {
			for (t = 0, n = u; t < n; t++) if (Si[t][1].exec(i[3])) {
				s = (i[2] || " ") + Si[t][0];
				break;
			}
			if (s == null) {
				e._isValid = !1;
				return;
			}
		}
		if (!a && s != null) {
			e._isValid = !1;
			return;
		}
		if (i[4]) if (bi.exec(i[4])) c = "Z";
		else {
			e._isValid = !1;
			return;
		}
		e._f = o + (s || "") + (c || ""), Ri(e);
	} else e._isValid = !1;
}
function Di(e, t, n, r, i, a) {
	var o = [
		Oi(e),
		$n.indexOf(t),
		parseInt(n, 10),
		parseInt(r, 10),
		parseInt(i, 10)
	];
	return a && o.push(parseInt(a, 10)), o;
}
function Oi(e) {
	var t = parseInt(e, 10);
	return t <= 49 ? 2e3 + t : t <= 999 ? 1900 + t : t;
}
function ki(e) {
	return e.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
}
function Ai(e, t, n) {
	return e && Mr.indexOf(e) !== new Date(t[0], t[1], t[2]).getDay() ? (H(n).weekdayMismatch = !0, n._isValid = !1, !1) : !0;
}
function ji(e, t, n) {
	if (e) return Ti[e];
	if (t) return 0;
	var r = parseInt(n, 10), i = r % 100;
	return (r - i) / 100 * 60 + i;
}
function Mi(e) {
	var t = wi.exec(ki(e._i)), n;
	if (t) {
		if (n = Di(t[4], t[3], t[2], t[5], t[6], t[7]), !Ai(t[1], n, e)) return;
		e._a = n, e._tzm = ji(t[8], t[9], t[10]), e._d = _r.apply(null, e._a), e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), H(e).rfc2822 = !0;
	} else e._isValid = !1;
}
function Ni(e) {
	var t = Ci.exec(e._i);
	if (t !== null) {
		e._d = /* @__PURE__ */ new Date(+t[1]);
		return;
	}
	if (Ei(e), e._isValid === !1) delete e._isValid;
	else return;
	if (Mi(e), e._isValid === !1) delete e._isValid;
	else return;
	e._strict ? e._isValid = !1 : B.createFromInputFallback(e);
}
B.createFromInputFallback = Et("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function(e) {
	e._d = /* @__PURE__ */ new Date(e._i + (e._useUTC ? " UTC" : ""));
});
function Pi(e, t, n) {
	return e ?? t ?? n;
}
function Fi(e) {
	var t = new Date(B.now());
	return e._useUTC ? [
		t.getUTCFullYear(),
		t.getUTCMonth(),
		t.getUTCDate()
	] : [
		t.getFullYear(),
		t.getMonth(),
		t.getDate()
	];
}
function Ii(e) {
	var t, n, r = [], i, a, o;
	if (!e._d) {
		for (i = Fi(e), e._w && e._a[Hn] == null && e._a[Vn] == null && Li(e), e._dayOfYear != null && (o = Pi(e._a[Bn], i[Bn]), (e._dayOfYear > pr(o) || e._dayOfYear === 0) && (H(e)._overflowDayOfYear = !0), n = _r(o, 0, e._dayOfYear), e._a[Vn] = n.getUTCMonth(), e._a[Hn] = n.getUTCDate()), t = 0; t < 3 && e._a[t] == null; ++t) e._a[t] = r[t] = i[t];
		for (; t < 7; t++) e._a[t] = r[t] = e._a[t] == null ? +(t === 2) : e._a[t];
		e._a[Un] === 24 && e._a[Wn] === 0 && e._a[Gn] === 0 && e._a[Kn] === 0 && (e._nextDay = !0, e._a[Un] = 0), e._d = (e._useUTC ? _r : gr).apply(null, r), a = e._useUTC ? e._d.getUTCDay() : e._d.getDay(), e._tzm != null && e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), e._nextDay && (e._a[Un] = 24), e._w && e._w.d !== void 0 && e._w.d !== a && (H(e).weekdayMismatch = !0);
	}
}
function Li(e) {
	var t = e._w, n, r, i, a, o, s, c, l;
	t.GG != null || t.W != null || t.E != null ? (a = 1, o = 4, n = Pi(t.GG, e._a[Bn], br(Ki(), 1, 4).year), r = Pi(t.W, 1), i = Pi(t.E, 1), (i < 1 || i > 7) && (c = !0)) : (a = e._locale._week.dow, o = e._locale._week.doy, l = br(Ki(), a, o), n = Pi(t.gg, e._a[Bn], l.year), r = Pi(t.w, l.week), t.d == null ? t.e == null ? i = a : (i = t.e + a, (t.e < 0 || t.e > 6) && (c = !0)) : (i = t.d, (i < 0 || i > 6) && (c = !0))), r < 1 || r > xr(n, a, o) ? H(e)._overflowWeeks = !0 : c == null ? (s = yr(n, r, i, a, o), e._a[Bn] = s.year, e._dayOfYear = s.dayOfYear) : H(e)._overflowWeekday = !0;
}
B.ISO_8601 = function() {}, B.RFC_2822 = function() {};
function Ri(e) {
	if (e._f === B.ISO_8601) {
		Ei(e);
		return;
	}
	if (e._f === B.RFC_2822) {
		Mi(e);
		return;
	}
	e._a = [], H(e).empty = !0;
	var t = "" + e._i, n, r, i, a, o, s = t.length, c = 0, l, u;
	for (i = Wt(e._f, e._locale).match(Lt) || [], u = i.length, n = 0; n < u; n++) a = i[n], r = (t.match(Nn(a, e)) || [])[0], r && (o = t.substr(0, t.indexOf(r)), o.length > 0 && H(e).unusedInput.push(o), t = t.slice(t.indexOf(r) + r.length), c += r.length), Bt[a] ? (r ? H(e).empty = !1 : H(e).unusedTokens.push(a), zn(a, r, e)) : e._strict && !r && H(e).unusedTokens.push(a);
	H(e).charsLeftOver = s - c, t.length > 0 && H(e).unusedInput.push(t), e._a[Un] <= 12 && H(e).bigHour === !0 && e._a[Un] > 0 && (H(e).bigHour = void 0), H(e).parsedDateParts = e._a.slice(0), H(e).meridiem = e._meridiem, e._a[Un] = zi(e._locale, e._a[Un], e._meridiem), l = H(e).era, l !== null && (e._a[Bn] = e._locale.erasConvertYear(l, e._a[Bn])), Ii(e), _i(e);
}
function zi(e, t, n) {
	var r;
	return n == null ? t : e.meridiemHour == null ? e.isPM == null ? t : (r = e.isPM(n), r && t < 12 && (t += 12), !r && t === 12 && (t = 0), t) : e.meridiemHour(t, n);
}
function Bi(e) {
	var t, n, r, i, a, o, s = !1, c = e._f.length;
	if (c === 0) {
		H(e).invalidFormat = !0, e._d = /* @__PURE__ */ new Date(NaN);
		return;
	}
	for (i = 0; i < c; i++) a = 0, o = !1, t = St({}, e), e._useUTC != null && (t._useUTC = e._useUTC), t._f = e._f[i], Ri(t), vt(t) && (o = !0), a += H(t).charsLeftOver, a += H(t).unusedTokens.length * 10, H(t).score = a, s ? a < r && (r = a, n = t) : (r == null || a < r || o) && (r = a, n = t, o && (s = !0));
	mt(e, n || t);
}
function Vi(e) {
	if (!e._d) {
		var t = rn(e._i), n = t.day === void 0 ? t.date : t.day;
		e._a = pt([
			t.year,
			t.month,
			n,
			t.hour,
			t.minute,
			t.second,
			t.millisecond
		], function(e) {
			return e && parseInt(e, 10);
		}), Ii(e);
	}
}
function Hi(e) {
	var t = new Ct(_i(Ui(e)));
	return t._nextDay &&= (t.add(1, "d"), void 0), t;
}
function Ui(e) {
	var t = e._i, n = e._f;
	return e._locale = e._locale || hi(e._l), t === null || n === void 0 && t === "" ? yt({ nullInput: !0 }) : (typeof t == "string" && (e._i = t = e._locale.preparse(t)), wt(t) ? new Ct(_i(t)) : (ft(t) ? e._d = t : V(n) ? Bi(e) : n ? Ri(e) : Wi(e), vt(e) || (e._d = null), e));
}
function Wi(e) {
	var t = e._i;
	ut(t) ? e._d = new Date(B.now()) : ft(t) ? e._d = new Date(t.valueOf()) : typeof t == "string" ? Ni(e) : V(t) ? (e._a = pt(t.slice(0), function(e) {
		return parseInt(e, 10);
	}), Ii(e)) : st(t) ? Vi(e) : dt(t) ? e._d = new Date(t) : B.createFromInputFallback(e);
}
function Gi(e, t, n, r, i) {
	var a = {};
	return (t === !0 || t === !1) && (r = t, t = void 0), (n === !0 || n === !1) && (r = n, n = void 0), (st(e) && lt(e) || V(e) && e.length === 0) && (e = void 0), a._isAMomentObject = !0, a._useUTC = a._isUTC = i, a._l = n, a._i = e, a._f = t, a._strict = r, Hi(a);
}
function Ki(e, t, n, r) {
	return Gi(e, t, n, r, !1);
}
var qi = Et("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
	var e = Ki.apply(null, arguments);
	return this.isValid() && e.isValid() ? e < this ? this : e : yt();
}), Ji = Et("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function() {
	var e = Ki.apply(null, arguments);
	return this.isValid() && e.isValid() ? e > this ? this : e : yt();
});
function Yi(e, t) {
	var n, r;
	if (t.length === 1 && V(t[0]) && (t = t[0]), !t.length) return Ki();
	for (n = t[0], r = 1; r < t.length; ++r) (!t[r].isValid() || t[r][e](n)) && (n = t[r]);
	return n;
}
function Xi() {
	return Yi("isBefore", [].slice.call(arguments, 0));
}
function Zi() {
	return Yi("isAfter", [].slice.call(arguments, 0));
}
var Qi = function() {
	return Date.now ? Date.now() : +/* @__PURE__ */ new Date();
}, $i = [
	"year",
	"quarter",
	"month",
	"week",
	"day",
	"hour",
	"minute",
	"second",
	"millisecond"
];
function ea(e) {
	var t, n = !1, r, i = $i.length;
	for (t in e) if (ct(e, t) && !(Xn.call($i, t) !== -1 && (e[t] == null || !isNaN(e[t])))) return !1;
	for (r = 0; r < i; ++r) if (e[$i[r]]) {
		if (n) return !1;
		parseFloat(e[$i[r]]) !== G(e[$i[r]]) && (n = !0);
	}
	return !0;
}
function ta() {
	return this._isValid;
}
function na() {
	return Ta(NaN);
}
function ra(e) {
	var t = rn(e), n = t.year || 0, r = t.quarter || 0, i = t.month || 0, a = t.week || t.isoWeek || 0, o = t.day || 0, s = t.hour || 0, c = t.minute || 0, l = t.second || 0, u = t.millisecond || 0;
	this._isValid = ea(t), this._milliseconds = +u + l * 1e3 + c * 6e4 + s * 1e3 * 60 * 60, this._days = +o + a * 7, this._months = +i + r * 3 + n * 12, this._data = {}, this._locale = hi(), this._bubble();
}
function ia(e) {
	return e instanceof ra;
}
function aa(e) {
	return e < 0 ? Math.round(-1 * e) * -1 : Math.round(e);
}
function oa(e, t, n) {
	var r = Math.min(e.length, t.length), i = Math.abs(e.length - t.length), a = 0, o;
	for (o = 0; o < r; o++) (n && e[o] !== t[o] || !n && G(e[o]) !== G(t[o])) && a++;
	return a + i;
}
function sa(e, t) {
	U(e, 0, 0, function() {
		var e = this.utcOffset(), n = "+";
		return e < 0 && (e = -e, n = "-"), n + It(~~(e / 60), 2) + t + It(~~e % 60, 2);
	});
}
sa("Z", ":"), sa("ZZ", ""), K("Z", kn), K("ZZ", kn), Ln(["Z", "ZZ"], function(e, t, n) {
	n._useUTC = !0, n._tzm = la(kn, e);
});
var ca = /([\+\-]|\d\d)/gi;
function la(e, t) {
	var n = (t || "").match(e), r, i, a;
	return n === null ? null : (r = n[n.length - 1] || [], i = (r + "").match(ca) || [
		"-",
		0,
		0
	], a = +(i[1] * 60) + G(i[2]), a === 0 ? 0 : i[0] === "+" ? a : -a);
}
function ua(e, t) {
	var n, r;
	return t._isUTC ? (n = t.clone(), r = (wt(e) || ft(e) ? e.valueOf() : Ki(e).valueOf()) - n.valueOf(), n._d.setTime(n._d.valueOf() + r), B.updateOffset(n, !1), n) : Ki(e).local();
}
function da(e) {
	return -Math.round(e._d.getTimezoneOffset());
}
B.updateOffset = function() {};
function fa(e, t, n) {
	var r = this._offset || 0, i;
	if (!this.isValid()) return e == null ? NaN : this;
	if (e != null) {
		if (typeof e == "string") {
			if (e = la(kn, e), e === null) return this;
		} else Math.abs(e) < 16 && !n && (e *= 60);
		return !this._isUTC && t && (i = da(this)), this._offset = e, this._isUTC = !0, i != null && this.add(i, "m"), r !== e && (!t || this._changeInProgress ? Aa(this, Ta(e - r, "m"), 1, !1) : this._changeInProgress ||= (this._changeInProgress = !0, B.updateOffset(this, !0), null)), this;
	} else return this._isUTC ? r : da(this);
}
function pa(e, t) {
	return e == null ? -this.utcOffset() : (typeof e != "string" && (e = -e), this.utcOffset(e, t), this);
}
function ma(e) {
	return this.utcOffset(0, e);
}
function ha(e) {
	return this._isUTC && (this.utcOffset(0, e), this._isUTC = !1, e && this.subtract(da(this), "m")), this;
}
function ga() {
	if (this._tzm != null) this.utcOffset(this._tzm, !1, !0);
	else if (typeof this._i == "string") {
		var e = la(On, this._i);
		e == null ? this.utcOffset(0, !0) : this.utcOffset(e);
	}
	return this;
}
function _a(e) {
	return this.isValid() ? (e = e ? Ki(e).utcOffset() : 0, (this.utcOffset() - e) % 60 == 0) : !1;
}
function va() {
	return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
}
function ya() {
	if (!ut(this._isDSTShifted)) return this._isDSTShifted;
	var e = {}, t;
	return St(e, this), e = Ui(e), e._a ? (t = e._isUTC ? ht(e._a) : Ki(e._a), this._isDSTShifted = this.isValid() && oa(e._a, t.toArray()) > 0) : this._isDSTShifted = !1, this._isDSTShifted;
}
function ba() {
	return this.isValid() ? !this._isUTC : !1;
}
function xa() {
	return this.isValid() ? this._isUTC : !1;
}
function Sa() {
	return this.isValid() ? this._isUTC && this._offset === 0 : !1;
}
var Ca = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/, wa = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
function Ta(e, t) {
	var n = e, r = null, i, a, o;
	return ia(e) ? n = {
		ms: e._milliseconds,
		d: e._days,
		M: e._months
	} : dt(e) || !isNaN(+e) ? (n = {}, t ? n[t] = +e : n.milliseconds = +e) : (r = Ca.exec(e)) ? (i = r[1] === "-" ? -1 : 1, n = {
		y: 0,
		d: G(r[Hn]) * i,
		h: G(r[Un]) * i,
		m: G(r[Wn]) * i,
		s: G(r[Gn]) * i,
		ms: G(aa(r[Kn] * 1e3)) * i
	}) : (r = wa.exec(e)) ? (i = r[1] === "-" ? -1 : 1, n = {
		y: Ea(r[2], i),
		M: Ea(r[3], i),
		w: Ea(r[4], i),
		d: Ea(r[5], i),
		h: Ea(r[6], i),
		m: Ea(r[7], i),
		s: Ea(r[8], i)
	}) : n == null ? n = {} : typeof n == "object" && ("from" in n || "to" in n) && (o = Oa(Ki(n.from), Ki(n.to)), n = {}, n.ms = o.milliseconds, n.M = o.months), a = new ra(n), ia(e) && ct(e, "_locale") && (a._locale = e._locale), ia(e) && ct(e, "_isValid") && (a._isValid = e._isValid), a;
}
Ta.fn = ra.prototype, Ta.invalid = na;
function Ea(e, t) {
	var n = e && parseFloat(e.replace(",", "."));
	return (isNaN(n) ? 0 : n) * t;
}
function Da(e, t) {
	var n = {};
	return n.months = t.month() - e.month() + (t.year() - e.year()) * 12, e.clone().add(n.months, "M").isAfter(t) && --n.months, n.milliseconds = t - +e.clone().add(n.months, "M"), n;
}
function Oa(e, t) {
	var n;
	return e.isValid() && t.isValid() ? (t = ua(t, e), e.isBefore(t) ? n = Da(e, t) : (n = Da(t, e), n.milliseconds = -n.milliseconds, n.months = -n.months), n) : {
		milliseconds: 0,
		months: 0
	};
}
function ka(e, t) {
	return function(n, r) {
		var i, a;
		return r !== null && !isNaN(+r) && (Ot(t, "moment()." + t + "(period, number) is deprecated. Please use moment()." + t + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."), a = n, n = r, r = a), i = Ta(n, r), Aa(this, i, e), this;
	};
}
function Aa(e, t, n, r) {
	var i = t._milliseconds, a = aa(t._days), o = aa(t._months);
	e.isValid() && (r ??= !0, o && sr(e, dn(e, "Month") + o * n), a && fn(e, "Date", dn(e, "Date") + a * n), i && e._d.setTime(e._d.valueOf() + i * n), r && B.updateOffset(e, a || o));
}
var ja = ka(1, "add"), Ma = ka(-1, "subtract");
function Na(e) {
	return typeof e == "string" || e instanceof String;
}
function Pa(e) {
	return wt(e) || ft(e) || Na(e) || dt(e) || Ia(e) || Fa(e) || e == null;
}
function Fa(e) {
	var t = st(e) && !lt(e), n = !1, r = [
		"years",
		"year",
		"y",
		"months",
		"month",
		"M",
		"days",
		"day",
		"d",
		"dates",
		"date",
		"D",
		"hours",
		"hour",
		"h",
		"minutes",
		"minute",
		"m",
		"seconds",
		"second",
		"s",
		"milliseconds",
		"millisecond",
		"ms"
	], i, a, o = r.length;
	for (i = 0; i < o; i += 1) a = r[i], n ||= ct(e, a);
	return t && n;
}
function Ia(e) {
	var t = V(e), n = !1;
	return t && (n = e.filter(function(t) {
		return !dt(t) && Na(e);
	}).length === 0), t && n;
}
function La(e) {
	var t = st(e) && !lt(e), n = !1, r = [
		"sameDay",
		"nextDay",
		"lastDay",
		"nextWeek",
		"lastWeek",
		"sameElse"
	], i, a;
	for (i = 0; i < r.length; i += 1) a = r[i], n ||= ct(e, a);
	return t && n;
}
function Ra(e, t) {
	var n = e.diff(t, "days", !0);
	return n < -6 ? "sameElse" : n < -1 ? "lastWeek" : n < 0 ? "lastDay" : n < 1 ? "sameDay" : n < 2 ? "nextDay" : n < 7 ? "nextWeek" : "sameElse";
}
function za(e, t) {
	arguments.length === 1 && (arguments[0] ? Pa(arguments[0]) ? (e = arguments[0], t = void 0) : La(arguments[0]) && (t = arguments[0], e = void 0) : (e = void 0, t = void 0));
	var n = e || Ki(), r = ua(n, this).startOf("day"), i = B.calendarFormat(this, r) || "sameElse", a = t && (kt(t[i]) ? t[i].call(this, n) : t[i]);
	return this.format(a || this.localeData().calendar(i, this, Ki(n)));
}
function Ba() {
	return new Ct(this);
}
function Va(e, t) {
	var n = wt(e) ? e : Ki(e);
	return this.isValid() && n.isValid() ? (t = nn(t) || "millisecond", t === "millisecond" ? this.valueOf() > n.valueOf() : n.valueOf() < this.clone().startOf(t).valueOf()) : !1;
}
function Ha(e, t) {
	var n = wt(e) ? e : Ki(e);
	return this.isValid() && n.isValid() ? (t = nn(t) || "millisecond", t === "millisecond" ? this.valueOf() < n.valueOf() : this.clone().endOf(t).valueOf() < n.valueOf()) : !1;
}
function Ua(e, t, n, r) {
	var i = wt(e) ? e : Ki(e), a = wt(t) ? t : Ki(t);
	return this.isValid() && i.isValid() && a.isValid() ? (r ||= "()", (r[0] === "(" ? this.isAfter(i, n) : !this.isBefore(i, n)) && (r[1] === ")" ? this.isBefore(a, n) : !this.isAfter(a, n))) : !1;
}
function Wa(e, t) {
	var n = wt(e) ? e : Ki(e), r;
	return this.isValid() && n.isValid() ? (t = nn(t) || "millisecond", t === "millisecond" ? this.valueOf() === n.valueOf() : (r = n.valueOf(), this.clone().startOf(t).valueOf() <= r && r <= this.clone().endOf(t).valueOf())) : !1;
}
function Ga(e, t) {
	return this.isSame(e, t) || this.isAfter(e, t);
}
function Ka(e, t) {
	return this.isSame(e, t) || this.isBefore(e, t);
}
function qa(e, t, n) {
	var r, i, a;
	if (!this.isValid() || (r = ua(e, this), !r.isValid())) return NaN;
	switch (i = (r.utcOffset() - this.utcOffset()) * 6e4, t = nn(t), t) {
		case "year":
			a = Ja(this, r) / 12;
			break;
		case "month":
			a = Ja(this, r);
			break;
		case "quarter":
			a = Ja(this, r) / 3;
			break;
		case "second":
			a = (this - r) / 1e3;
			break;
		case "minute":
			a = (this - r) / 6e4;
			break;
		case "hour":
			a = (this - r) / 36e5;
			break;
		case "day":
			a = (this - r - i) / 864e5;
			break;
		case "week":
			a = (this - r - i) / 6048e5;
			break;
		default: a = this - r;
	}
	return n ? a : ln(a);
}
function Ja(e, t) {
	if (e.date() < t.date()) return -Ja(t, e);
	var n = (t.year() - e.year()) * 12 + (t.month() - e.month()), r = e.clone().add(n, "months"), i, a;
	return t - r < 0 ? (i = e.clone().add(n - 1, "months"), a = (t - r) / (r - i)) : (i = e.clone().add(n + 1, "months"), a = (t - r) / (i - r)), -(n + a) || 0;
}
B.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", B.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
function Ya() {
	return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
}
function Xa(e) {
	if (!this.isValid()) return null;
	var t = e !== !0, n = t ? this.clone().utc() : this;
	return n.year() < 0 || n.year() > 9999 ? Ut(n, t ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ") : kt(Date.prototype.toISOString) ? t ? this.toDate().toISOString() : new Date(this.valueOf() + this.utcOffset() * 60 * 1e3).toISOString().replace("Z", Ut(n, "Z")) : Ut(n, t ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ");
}
function Za() {
	if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)";
	var e = "moment", t = "", n, r, i, a;
	return this.isLocal() || (e = this.utcOffset() === 0 ? "moment.utc" : "moment.parseZone", t = "Z"), n = "[" + e + "(\"]", r = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY", i = "-MM-DD[T]HH:mm:ss.SSS", a = t + "[\")]", this.format(n + r + i + a);
}
function Qa(e) {
	e ||= this.isUtc() ? B.defaultFormatUtc : B.defaultFormat;
	var t = Ut(this, e);
	return this.localeData().postformat(t);
}
function $a(e, t) {
	return this.isValid() && (wt(e) && e.isValid() || Ki(e).isValid()) ? Ta({
		to: this,
		from: e
	}).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
}
function eo(e) {
	return this.from(Ki(), e);
}
function to(e, t) {
	return this.isValid() && (wt(e) && e.isValid() || Ki(e).isValid()) ? Ta({
		from: this,
		to: e
	}).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
}
function no(e) {
	return this.to(Ki(), e);
}
function ro(e) {
	var t;
	return e === void 0 ? this._locale._abbr : (t = hi(e), t != null && (this._locale = t), this);
}
var io = Et("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function(e) {
	return e === void 0 ? this.localeData() : this.locale(e);
});
function ao() {
	return this._locale;
}
var oo = 1e3, so = 60 * oo, co = 60 * so, lo = 146097 * 24 * co;
function uo(e, t) {
	return (e % t + t) % t;
}
function fo(e, t, n) {
	return e < 100 && e >= 0 ? new Date(e + 400, t, n) - lo : new Date(e, t, n).valueOf();
}
function po(e, t, n) {
	return e < 100 && e >= 0 ? Date.UTC(e + 400, t, n) - lo : Date.UTC(e, t, n);
}
function mo(e) {
	var t, n;
	if (e = nn(e), e === void 0 || e === "millisecond" || !this.isValid()) return this;
	switch (n = this._isUTC ? po : fo, e) {
		case "year":
			t = n(this.year(), 0, 1);
			break;
		case "quarter":
			t = n(this.year(), this.month() - this.month() % 3, 1);
			break;
		case "month":
			t = n(this.year(), this.month(), 1);
			break;
		case "week":
			t = n(this.year(), this.month(), this.date() - this.weekday());
			break;
		case "isoWeek":
			t = n(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
			break;
		case "day":
		case "date":
			t = n(this.year(), this.month(), this.date());
			break;
		case "hour":
			t = this._d.valueOf(), t -= uo(t + (this._isUTC ? 0 : this.utcOffset() * so), co);
			break;
		case "minute":
			t = this._d.valueOf(), t -= uo(t, so);
			break;
		case "second":
			t = this._d.valueOf(), t -= uo(t, oo);
			break;
	}
	return this._d.setTime(t), B.updateOffset(this, !0), this;
}
function ho(e) {
	var t, n;
	if (e = nn(e), e === void 0 || e === "millisecond" || !this.isValid()) return this;
	switch (n = this._isUTC ? po : fo, e) {
		case "year":
			t = n(this.year() + 1, 0, 1) - 1;
			break;
		case "quarter":
			t = n(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
			break;
		case "month":
			t = n(this.year(), this.month() + 1, 1) - 1;
			break;
		case "week":
			t = n(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
			break;
		case "isoWeek":
			t = n(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
			break;
		case "day":
		case "date":
			t = n(this.year(), this.month(), this.date() + 1) - 1;
			break;
		case "hour":
			t = this._d.valueOf(), t += co - uo(t + (this._isUTC ? 0 : this.utcOffset() * so), co) - 1;
			break;
		case "minute":
			t = this._d.valueOf(), t += so - uo(t, so) - 1;
			break;
		case "second":
			t = this._d.valueOf(), t += oo - uo(t, oo) - 1;
			break;
	}
	return this._d.setTime(t), B.updateOffset(this, !0), this;
}
function go() {
	return this._d.valueOf() - (this._offset || 0) * 6e4;
}
function _o() {
	return Math.floor(this.valueOf() / 1e3);
}
function vo() {
	return new Date(this.valueOf());
}
function yo() {
	var e = this;
	return [
		e.year(),
		e.month(),
		e.date(),
		e.hour(),
		e.minute(),
		e.second(),
		e.millisecond()
	];
}
function bo() {
	var e = this;
	return {
		years: e.year(),
		months: e.month(),
		date: e.date(),
		hours: e.hours(),
		minutes: e.minutes(),
		seconds: e.seconds(),
		milliseconds: e.milliseconds()
	};
}
function xo() {
	return this.isValid() ? this.toISOString() : null;
}
function So() {
	return vt(this);
}
function Co() {
	return mt({}, H(this));
}
function wo() {
	return H(this).overflow;
}
function To() {
	return {
		input: this._i,
		format: this._f,
		locale: this._locale,
		isUTC: this._isUTC,
		strict: this._strict
	};
}
U("N", 0, 0, "eraAbbr"), U("NN", 0, 0, "eraAbbr"), U("NNN", 0, 0, "eraAbbr"), U("NNNN", 0, 0, "eraName"), U("NNNNN", 0, 0, "eraNarrow"), U("y", ["y", 1], "yo", "eraYear"), U("y", ["yy", 2], 0, "eraYear"), U("y", ["yyy", 3], 0, "eraYear"), U("y", ["yyyy", 4], 0, "eraYear"), K("N", Io), K("NN", Io), K("NNN", Io), K("NNNN", Lo), K("NNNNN", Ro), Ln([
	"N",
	"NN",
	"NNN",
	"NNNN",
	"NNNNN"
], function(e, t, n, r) {
	var i = n._locale.erasParse(e, r, n._strict);
	i ? H(n).era = i : H(n).invalidEra = e;
}), K("y", En), K("yy", En), K("yyy", En), K("yyyy", En), K("yo", zo), Ln([
	"y",
	"yy",
	"yyy",
	"yyyy"
], Bn), Ln(["yo"], function(e, t, n, r) {
	var i;
	n._locale._eraYearOrdinalRegex && (i = e.match(n._locale._eraYearOrdinalRegex)), n._locale.eraYearOrdinalParse ? t[Bn] = n._locale.eraYearOrdinalParse(e, i) : t[Bn] = parseInt(e, 10);
});
function Eo(e, t) {
	var n, r, i, a = this._eras || hi("en")._eras;
	for (n = 0, r = a.length; n < r; ++n) {
		switch (typeof a[n].since) {
			case "string":
				i = B(a[n].since).startOf("day"), a[n].since = i.valueOf();
				break;
		}
		switch (typeof a[n].until) {
			case "undefined":
				a[n].until = Infinity;
				break;
			case "string":
				i = B(a[n].until).startOf("day").valueOf(), a[n].until = i.valueOf();
				break;
		}
	}
	return a;
}
function Do(e, t, n) {
	var r, i, a = this.eras(), o, s, c;
	for (e = e.toUpperCase(), r = 0, i = a.length; r < i; ++r) if (o = a[r].name.toUpperCase(), s = a[r].abbr.toUpperCase(), c = a[r].narrow.toUpperCase(), n) switch (t) {
		case "N":
		case "NN":
		case "NNN":
			if (s === e) return a[r];
			break;
		case "NNNN":
			if (o === e) return a[r];
			break;
		case "NNNNN":
			if (c === e) return a[r];
			break;
	}
	else if ([
		o,
		s,
		c
	].indexOf(e) >= 0) return a[r];
}
function Oo(e, t) {
	var n = e.since <= e.until ? 1 : -1;
	return t === void 0 ? B(e.since).year() : B(e.since).year() + (t - e.offset) * n;
}
function ko() {
	var e, t, n, r = this.localeData().eras();
	for (e = 0, t = r.length; e < t; ++e) if (n = this.clone().startOf("day").valueOf(), r[e].since <= n && n <= r[e].until || r[e].until <= n && n <= r[e].since) return r[e].name;
	return "";
}
function Ao() {
	var e, t, n, r = this.localeData().eras();
	for (e = 0, t = r.length; e < t; ++e) if (n = this.clone().startOf("day").valueOf(), r[e].since <= n && n <= r[e].until || r[e].until <= n && n <= r[e].since) return r[e].narrow;
	return "";
}
function jo() {
	var e, t, n, r = this.localeData().eras();
	for (e = 0, t = r.length; e < t; ++e) if (n = this.clone().startOf("day").valueOf(), r[e].since <= n && n <= r[e].until || r[e].until <= n && n <= r[e].since) return r[e].abbr;
	return "";
}
function Mo() {
	var e, t, n, r, i = this.localeData().eras();
	for (e = 0, t = i.length; e < t; ++e) if (n = i[e].since <= i[e].until ? 1 : -1, r = this.clone().startOf("day").valueOf(), i[e].since <= r && r <= i[e].until || i[e].until <= r && r <= i[e].since) return (this.year() - B(i[e].since).year()) * n + i[e].offset;
	return this.year();
}
function No(e) {
	return ct(this, "_erasNameRegex") || Bo.call(this), e ? this._erasNameRegex : this._erasRegex;
}
function Po(e) {
	return ct(this, "_erasAbbrRegex") || Bo.call(this), e ? this._erasAbbrRegex : this._erasRegex;
}
function Fo(e) {
	return ct(this, "_erasNarrowRegex") || Bo.call(this), e ? this._erasNarrowRegex : this._erasRegex;
}
function Io(e, t) {
	return t.erasAbbrRegex(e);
}
function Lo(e, t) {
	return t.erasNameRegex(e);
}
function Ro(e, t) {
	return t.erasNarrowRegex(e);
}
function zo(e, t) {
	return t._eraYearOrdinalRegex || En;
}
function Bo() {
	var e = [], t = [], n = [], r = [], i, a, o = this.eras();
	for (i = 0, a = o.length; i < a; ++i) t.push(Fn(o[i].name)), e.push(Fn(o[i].abbr)), n.push(Fn(o[i].narrow)), r.push(Fn(o[i].name)), r.push(Fn(o[i].abbr)), r.push(Fn(o[i].narrow));
	this._erasRegex = RegExp("^(" + r.join("|") + ")", "i"), this._erasNameRegex = RegExp("^(" + t.join("|") + ")", "i"), this._erasAbbrRegex = RegExp("^(" + e.join("|") + ")", "i"), this._erasNarrowRegex = RegExp("^(" + n.join("|") + ")", "i");
}
U(0, ["gg", 2], 0, function() {
	return this.weekYear() % 100;
}), U(0, ["GG", 2], 0, function() {
	return this.isoWeekYear() % 100;
});
function Vo(e, t) {
	U(0, [e, e.length], 0, t);
}
Vo("gggg", "weekYear"), Vo("ggggg", "weekYear"), Vo("GGGG", "isoWeekYear"), Vo("GGGGG", "isoWeekYear"), tn("weekYear", "gg"), tn("isoWeekYear", "GG"), on("weekYear", 1), on("isoWeekYear", 1), K("G", Dn), K("g", Dn), K("GG", bn, gn), K("gg", bn, gn), K("GGGG", wn, vn), K("gggg", wn, vn), K("GGGGG", Tn, yn), K("ggggg", Tn, yn), Rn([
	"gggg",
	"ggggg",
	"GGGG",
	"GGGGG"
], function(e, t, n, r) {
	t[r.substr(0, 2)] = G(e);
}), Rn(["gg", "GG"], function(e, t, n, r) {
	t[r] = B.parseTwoDigitYear(e);
});
function Ho(e) {
	return Jo.call(this, e, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
}
function Uo(e) {
	return Jo.call(this, e, this.isoWeek(), this.isoWeekday(), 1, 4);
}
function Wo() {
	return xr(this.year(), 1, 4);
}
function Go() {
	return xr(this.isoWeekYear(), 1, 4);
}
function Ko() {
	var e = this.localeData()._week;
	return xr(this.year(), e.dow, e.doy);
}
function qo() {
	var e = this.localeData()._week;
	return xr(this.weekYear(), e.dow, e.doy);
}
function Jo(e, t, n, r, i) {
	var a;
	return e == null ? br(this, r, i).year : (a = xr(e, r, i), t > a && (t = a), Yo.call(this, e, t, n, r, i));
}
function Yo(e, t, n, r, i) {
	var a = yr(e, t, n, r, i), o = _r(a.year, 0, a.dayOfYear);
	return this.year(o.getUTCFullYear()), this.month(o.getUTCMonth()), this.date(o.getUTCDate()), this;
}
U("Q", 0, "Qo", "quarter"), tn("quarter", "Q"), on("quarter", 7), K("Q", hn), Ln("Q", function(e, t) {
	t[Vn] = (G(e) - 1) * 3;
});
function Xo(e) {
	return e == null ? Math.ceil((this.month() + 1) / 3) : this.month((e - 1) * 3 + this.month() % 3);
}
U("D", ["DD", 2], "Do", "date"), tn("date", "D"), on("date", 9), K("D", bn), K("DD", bn, gn), K("Do", function(e, t) {
	return e ? t._dayOfMonthOrdinalParse || t._ordinalParse : t._dayOfMonthOrdinalParseLenient;
}), Ln(["D", "DD"], Hn), Ln("Do", function(e, t) {
	t[Hn] = G(e.match(bn)[0]);
});
var Zo = un("Date", !0);
U("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), tn("dayOfYear", "DDD"), on("dayOfYear", 4), K("DDD", Cn), K("DDDD", _n), Ln(["DDD", "DDDD"], function(e, t, n) {
	n._dayOfYear = G(e);
});
function Qo(e) {
	var t = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
	return e == null ? t : this.add(e - t, "d");
}
U("m", ["mm", 2], 0, "minute"), tn("minute", "m"), on("minute", 14), K("m", bn), K("mm", bn, gn), Ln(["m", "mm"], Wn);
var $o = un("Minutes", !1);
U("s", ["ss", 2], 0, "second"), tn("second", "s"), on("second", 15), K("s", bn), K("ss", bn, gn), Ln(["s", "ss"], Gn);
var es = un("Seconds", !1);
U("S", 0, 0, function() {
	return ~~(this.millisecond() / 100);
}), U(0, ["SS", 2], 0, function() {
	return ~~(this.millisecond() / 10);
}), U(0, ["SSS", 3], 0, "millisecond"), U(0, ["SSSS", 4], 0, function() {
	return this.millisecond() * 10;
}), U(0, ["SSSSS", 5], 0, function() {
	return this.millisecond() * 100;
}), U(0, ["SSSSSS", 6], 0, function() {
	return this.millisecond() * 1e3;
}), U(0, ["SSSSSSS", 7], 0, function() {
	return this.millisecond() * 1e4;
}), U(0, ["SSSSSSSS", 8], 0, function() {
	return this.millisecond() * 1e5;
}), U(0, ["SSSSSSSSS", 9], 0, function() {
	return this.millisecond() * 1e6;
}), tn("millisecond", "ms"), on("millisecond", 16), K("S", Cn, hn), K("SS", Cn, gn), K("SSS", Cn, _n);
var ts, ns;
for (ts = "SSSS"; ts.length <= 9; ts += "S") K(ts, En);
function rs(e, t) {
	t[Kn] = G(("0." + e) * 1e3);
}
for (ts = "S"; ts.length <= 9; ts += "S") Ln(ts, rs);
ns = un("Milliseconds", !1), U("z", 0, 0, "zoneAbbr"), U("zz", 0, 0, "zoneName");
function is() {
	return this._isUTC ? "UTC" : "";
}
function as() {
	return this._isUTC ? "Coordinated Universal Time" : "";
}
var q = Ct.prototype;
q.add = ja, q.calendar = za, q.clone = Ba, q.diff = qa, q.endOf = ho, q.format = Qa, q.from = $a, q.fromNow = eo, q.to = to, q.toNow = no, q.get = pn, q.invalidAt = wo, q.isAfter = Va, q.isBefore = Ha, q.isBetween = Ua, q.isSame = Wa, q.isSameOrAfter = Ga, q.isSameOrBefore = Ka, q.isValid = So, q.lang = io, q.locale = ro, q.localeData = ao, q.max = Ji, q.min = qi, q.parsingFlags = Co, q.set = mn, q.startOf = mo, q.subtract = Ma, q.toArray = yo, q.toObject = bo, q.toDate = vo, q.toISOString = Xa, q.inspect = Za, typeof Symbol < "u" && Symbol.for != null && (q[Symbol.for("nodejs.util.inspect.custom")] = function() {
	return "Moment<" + this.format() + ">";
}), q.toJSON = xo, q.toString = Ya, q.unix = _o, q.valueOf = go, q.creationData = To, q.eraName = ko, q.eraNarrow = Ao, q.eraAbbr = jo, q.eraYear = Mo, q.year = mr, q.isLeapYear = hr, q.weekYear = Ho, q.isoWeekYear = Uo, q.quarter = q.quarters = Xo, q.month = cr, q.daysInMonth = lr, q.week = q.weeks = Er, q.isoWeek = q.isoWeeks = Dr, q.weeksInYear = Ko, q.weeksInWeekYear = qo, q.isoWeeksInYear = Wo, q.isoWeeksInISOWeekYear = Go, q.date = Zo, q.day = q.days = Hr, q.weekday = Ur, q.isoWeekday = Wr, q.dayOfYear = Qo, q.hour = q.hours = ti, q.minute = q.minutes = $o, q.second = q.seconds = es, q.millisecond = q.milliseconds = ns, q.utcOffset = fa, q.utc = ma, q.local = ha, q.parseZone = ga, q.hasAlignedHourOffset = _a, q.isDST = va, q.isLocal = ba, q.isUtcOffset = xa, q.isUtc = Sa, q.isUTC = Sa, q.zoneAbbr = is, q.zoneName = as, q.dates = Et("dates accessor is deprecated. Use date instead.", Zo), q.months = Et("months accessor is deprecated. Use month instead", cr), q.years = Et("years accessor is deprecated. Use year instead", mr), q.zone = Et("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", pa), q.isDSTShifted = Et("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", ya);
function os(e) {
	return Ki(e * 1e3);
}
function ss() {
	return Ki.apply(null, arguments).parseZone();
}
function cs(e) {
	return e;
}
var ls = Mt.prototype;
ls.calendar = Ft, ls.longDateFormat = Kt, ls.invalidDate = Jt, ls.ordinal = Zt, ls.preparse = cs, ls.postformat = cs, ls.relativeTime = $t, ls.pastFuture = en, ls.set = At, ls.eras = Eo, ls.erasParse = Do, ls.erasConvertYear = Oo, ls.erasAbbrRegex = Po, ls.erasNameRegex = No, ls.erasNarrowRegex = Fo, ls.months = rr, ls.monthsShort = ir, ls.monthsParse = or, ls.monthsRegex = dr, ls.monthsShortRegex = ur, ls.week = Sr, ls.firstDayOfYear = Tr, ls.firstDayOfWeek = wr, ls.weekdays = Lr, ls.weekdaysMin = zr, ls.weekdaysShort = Rr, ls.weekdaysParse = Vr, ls.weekdaysRegex = Gr, ls.weekdaysShortRegex = Kr, ls.weekdaysMinRegex = qr, ls.isPM = $r, ls.meridiem = ni;
function us(e, t, n, r) {
	var i = hi(), a = ht().set(r, t);
	return i[n](a, e);
}
function ds(e, t, n) {
	if (dt(e) && (t = e, e = void 0), e ||= "", t != null) return us(e, t, n, "month");
	var r, i = [];
	for (r = 0; r < 12; r++) i[r] = us(e, r, n, "month");
	return i;
}
function fs(e, t, n, r) {
	typeof e == "boolean" ? (dt(t) && (n = t, t = void 0), t ||= "") : (t = e, n = t, e = !1, dt(t) && (n = t, t = void 0), t ||= "");
	var i = hi(), a = e ? i._week.dow : 0, o, s = [];
	if (n != null) return us(t, (n + a) % 7, r, "day");
	for (o = 0; o < 7; o++) s[o] = us(t, (o + a) % 7, r, "day");
	return s;
}
function ps(e, t) {
	return ds(e, t, "months");
}
function ms(e, t) {
	return ds(e, t, "monthsShort");
}
function hs(e, t, n) {
	return fs(e, t, n, "weekdays");
}
function gs(e, t, n) {
	return fs(e, t, n, "weekdaysShort");
}
function _s(e, t, n) {
	return fs(e, t, n, "weekdaysMin");
}
fi("en", {
	eras: [{
		since: "0001-01-01",
		until: Infinity,
		offset: 1,
		name: "Anno Domini",
		narrow: "AD",
		abbr: "AD"
	}, {
		since: "0000-12-31",
		until: -Infinity,
		offset: 1,
		name: "Before Christ",
		narrow: "BC",
		abbr: "BC"
	}],
	dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
	ordinal: function(e) {
		var t = e % 10;
		return e + (G(e % 100 / 10) === 1 ? "th" : t === 1 ? "st" : t === 2 ? "nd" : t === 3 ? "rd" : "th");
	}
}), B.lang = Et("moment.lang is deprecated. Use moment.locale instead.", fi), B.langData = Et("moment.langData is deprecated. Use moment.localeData instead.", hi);
var vs = Math.abs;
function ys() {
	var e = this._data;
	return this._milliseconds = vs(this._milliseconds), this._days = vs(this._days), this._months = vs(this._months), e.milliseconds = vs(e.milliseconds), e.seconds = vs(e.seconds), e.minutes = vs(e.minutes), e.hours = vs(e.hours), e.months = vs(e.months), e.years = vs(e.years), this;
}
function bs(e, t, n, r) {
	var i = Ta(t, n);
	return e._milliseconds += r * i._milliseconds, e._days += r * i._days, e._months += r * i._months, e._bubble();
}
function xs(e, t) {
	return bs(this, e, t, 1);
}
function Ss(e, t) {
	return bs(this, e, t, -1);
}
function Cs(e) {
	return e < 0 ? Math.floor(e) : Math.ceil(e);
}
function ws() {
	var e = this._milliseconds, t = this._days, n = this._months, r = this._data, i, a, o, s, c;
	return e >= 0 && t >= 0 && n >= 0 || e <= 0 && t <= 0 && n <= 0 || (e += Cs(Es(n) + t) * 864e5, t = 0, n = 0), r.milliseconds = e % 1e3, i = ln(e / 1e3), r.seconds = i % 60, a = ln(i / 60), r.minutes = a % 60, o = ln(a / 60), r.hours = o % 24, t += ln(o / 24), c = ln(Ts(t)), n += c, t -= Cs(Es(c)), s = ln(n / 12), n %= 12, r.days = t, r.months = n, r.years = s, this;
}
function Ts(e) {
	return e * 4800 / 146097;
}
function Es(e) {
	return e * 146097 / 4800;
}
function Ds(e) {
	if (!this.isValid()) return NaN;
	var t, n, r = this._milliseconds;
	if (e = nn(e), e === "month" || e === "quarter" || e === "year") switch (t = this._days + r / 864e5, n = this._months + Ts(t), e) {
		case "month": return n;
		case "quarter": return n / 3;
		case "year": return n / 12;
	}
	else switch (t = this._days + Math.round(Es(this._months)), e) {
		case "week": return t / 7 + r / 6048e5;
		case "day": return t + r / 864e5;
		case "hour": return t * 24 + r / 36e5;
		case "minute": return t * 1440 + r / 6e4;
		case "second": return t * 86400 + r / 1e3;
		case "millisecond": return Math.floor(t * 864e5) + r;
		default: throw Error("Unknown unit " + e);
	}
}
function Os() {
	return this.isValid() ? this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + G(this._months / 12) * 31536e6 : NaN;
}
function ks(e) {
	return function() {
		return this.as(e);
	};
}
var As = ks("ms"), js = ks("s"), Ms = ks("m"), Ns = ks("h"), Ps = ks("d"), Fs = ks("w"), Is = ks("M"), Ls = ks("Q"), Rs = ks("y");
function zs() {
	return Ta(this);
}
function Bs(e) {
	return e = nn(e), this.isValid() ? this[e + "s"]() : NaN;
}
function Vs(e) {
	return function() {
		return this.isValid() ? this._data[e] : NaN;
	};
}
var Hs = Vs("milliseconds"), Us = Vs("seconds"), Ws = Vs("minutes"), Gs = Vs("hours"), Ks = Vs("days"), qs = Vs("months"), Js = Vs("years");
function Ys() {
	return ln(this.days() / 7);
}
var Xs = Math.round, Zs = {
	ss: 44,
	s: 45,
	m: 45,
	h: 22,
	d: 26,
	w: null,
	M: 11
};
function Qs(e, t, n, r, i) {
	return i.relativeTime(t || 1, !!n, e, r);
}
function $s(e, t, n, r) {
	var i = Ta(e).abs(), a = Xs(i.as("s")), o = Xs(i.as("m")), s = Xs(i.as("h")), c = Xs(i.as("d")), l = Xs(i.as("M")), u = Xs(i.as("w")), d = Xs(i.as("y")), f = a <= n.ss && ["s", a] || a < n.s && ["ss", a] || o <= 1 && ["m"] || o < n.m && ["mm", o] || s <= 1 && ["h"] || s < n.h && ["hh", s] || c <= 1 && ["d"] || c < n.d && ["dd", c];
	return n.w != null && (f = f || u <= 1 && ["w"] || u < n.w && ["ww", u]), f = f || l <= 1 && ["M"] || l < n.M && ["MM", l] || d <= 1 && ["y"] || ["yy", d], f[2] = t, f[3] = +e > 0, f[4] = r, Qs.apply(null, f);
}
function ec(e) {
	return e === void 0 ? Xs : typeof e == "function" ? (Xs = e, !0) : !1;
}
function tc(e, t) {
	return Zs[e] === void 0 ? !1 : t === void 0 ? Zs[e] : (Zs[e] = t, e === "s" && (Zs.ss = t - 1), !0);
}
function nc(e, t) {
	if (!this.isValid()) return this.localeData().invalidDate();
	var n = !1, r = Zs, i, a;
	return typeof e == "object" && (t = e, e = !1), typeof e == "boolean" && (n = e), typeof t == "object" && (r = Object.assign({}, Zs, t), t.s != null && t.ss == null && (r.ss = t.s - 1)), i = this.localeData(), a = $s(this, !n, r, i), n && (a = i.pastFuture(+this, a)), i.postformat(a);
}
var rc = Math.abs;
function ic(e) {
	return (e > 0) - (e < 0) || +e;
}
function ac() {
	if (!this.isValid()) return this.localeData().invalidDate();
	var e = rc(this._milliseconds) / 1e3, t = rc(this._days), n = rc(this._months), r, i, a, o, s = this.asSeconds(), c, l, u, d;
	return s ? (r = ln(e / 60), i = ln(r / 60), e %= 60, r %= 60, a = ln(n / 12), n %= 12, o = e ? e.toFixed(3).replace(/\.?0+$/, "") : "", c = s < 0 ? "-" : "", l = ic(this._months) === ic(s) ? "" : "-", u = ic(this._days) === ic(s) ? "" : "-", d = ic(this._milliseconds) === ic(s) ? "" : "-", c + "P" + (a ? l + a + "Y" : "") + (n ? l + n + "M" : "") + (t ? u + t + "D" : "") + (i || r || e ? "T" : "") + (i ? d + i + "H" : "") + (r ? d + r + "M" : "") + (e ? d + o + "S" : "")) : "P0D";
}
var oc = ra.prototype;
oc.isValid = ta, oc.abs = ys, oc.add = xs, oc.subtract = Ss, oc.as = Ds, oc.asMilliseconds = As, oc.asSeconds = js, oc.asMinutes = Ms, oc.asHours = Ns, oc.asDays = Ps, oc.asWeeks = Fs, oc.asMonths = Is, oc.asQuarters = Ls, oc.asYears = Rs, oc.valueOf = Os, oc._bubble = ws, oc.clone = zs, oc.get = Bs, oc.milliseconds = Hs, oc.seconds = Us, oc.minutes = Ws, oc.hours = Gs, oc.days = Ks, oc.weeks = Ys, oc.months = qs, oc.years = Js, oc.humanize = nc, oc.toISOString = ac, oc.toString = ac, oc.toJSON = ac, oc.locale = ro, oc.localeData = ao, oc.toIsoString = Et("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", ac), oc.lang = io, U("X", 0, 0, "unix"), U("x", 0, 0, "valueOf"), K("x", Dn), K("X", An), Ln("X", function(e, t, n) {
	n._d = /* @__PURE__ */ new Date(parseFloat(e) * 1e3);
}), Ln("x", function(e, t, n) {
	n._d = new Date(G(e));
}), B.version = "2.29.4", ot(Ki), B.fn = q, B.min = Xi, B.max = Zi, B.now = Qi, B.utc = ht, B.unix = os, B.months = ps, B.isDate = ft, B.locale = fi, B.invalid = yt, B.duration = Ta, B.isMoment = wt, B.weekdays = hs, B.parseZone = ss, B.localeData = hi, B.isDuration = ia, B.monthsShort = ms, B.weekdaysMin = _s, B.defineLocale = pi, B.updateLocale = mi, B.locales = gi, B.weekdaysShort = gs, B.normalizeUnits = nn, B.relativeTimeRounding = ec, B.relativeTimeThreshold = tc, B.calendarFormat = Ra, B.prototype = q, B.HTML5_FMT = {
	DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
	DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
	DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
	DATE: "YYYY-MM-DD",
	TIME: "HH:mm",
	TIME_SECONDS: "HH:mm:ss",
	TIME_MS: "HH:mm:ss.SSS",
	WEEK: "GGGG-[W]WW",
	MONTH: "YYYY-MM"
};
//#endregion
//#region ../cloud-client/src/main/javascript/activity/ActivityInformation.ts
var sc = ["SUCCESS", "ERROR"], cc = class {
	type;
	state;
	name;
	requestedDate;
	completedDate;
	url;
	studyId;
	templateId;
	constructor(e) {
		this.type = e.type, this.state = e.state, this.name = e.name, this.requestedDate = B(e.requestedDate), this.completedDate = e.completedDate ? B(e.completedDate) : null, this.url = e.url, this.studyId = e.studyId, this.templateId = e.templateId;
	}
	isFinished() {
		return sc.some((e) => e === this.state);
	}
}, lc = class {
	activities;
	lastActivityCheck;
	constructor(e) {
		this.activities = e.activities.map((e) => new cc(e)), this.lastActivityCheck = e.lastActivityCheck ? B(e.lastActivityCheck) : null;
	}
}, uc = class {
	frameInterval;
	totalNumberOfRespondents;
	version;
	collectedSensors;
	gazes;
	respondentIds;
	startMediaOffset;
	endMediaOffset;
	exposureTimeMs;
	constructor(e) {
		this.frameInterval = e.frameInterval, this.totalNumberOfRespondents = e.totalNumberOfRespondents || e.totalNumberOfRespondent, this.version = e.version, this.collectedSensors = e.collectedSensors, this.gazes = e.gazes || [], this.endMediaOffset = e.endMediaOffset, this.respondentIds = e.respondentIds || [], this.startMediaOffset = e.startMediaOffset, this.exposureTimeMs = -Infinity;
	}
	setExposureTimeMs(e, t) {
		this.endMediaOffset === void 0 ? e.type === "JS_SURVEY" || e.type === "SCREEN" || e.type === "SCENE_RECORDING" || e.type === "WEB" || e.type === "WEB_SURVEY" ? this.exposureTimeMs = this.gazes[this.gazes.length - 1]?.ts ?? 0 : this.exposureTimeMs = Math.max(e.exposureTimeMs, 0) : t && (e.type === "IMAGE" || e.type === "VIDEO") && !e.manualAdvance && e.exposureTimeMs !== -1 ? this.exposureTimeMs = e.exposureTimeMs : this.exposureTimeMs = this.endMediaOffset - this.startMediaOffset;
	}
	getExposureTimeMs() {
		return this.exposureTimeMs;
	}
}, dc = class extends uc {
	jsSurveyAnswers;
	summaryMetrics;
	predictAnalysis;
	mouseEvents;
	constructor(e) {
		super(e), this.jsSurveyAnswers = e.jsSurveyAnswers, this.summaryMetrics = e.summaryMetrics, this.predictAnalysis = e.predictAnalysis, this.mouseEvents = e.mouseEvents;
	}
}, fc = class extends uc {
	respondentfixations;
	mouseEvents;
	constructor(e) {
		super(e), this.respondentfixations = e.respondentfixations || [], this.mouseEvents = e.mouseEvents;
	}
}, pc = class {
	count;
	market;
	exposure;
	norms_type;
	category;
	sub_category;
	classifiers;
	constructor(e) {
		this.count = e.count, this.market = e.market, this.exposure = e.exposure, this.norms_type = e.norms_type, this.category = e.category, this.sub_category = e.sub_category, this.classifiers = e.classifiers || {};
	}
};
//#endregion
//#region ../node_modules/es-toolkit/dist/compat/predicate/isObject.mjs
function mc(e) {
	return e !== null && (typeof e == "object" || typeof e == "function");
}
//#endregion
//#region ../node_modules/es-toolkit/dist/compat/predicate/isMatchWith.mjs
function hc(e, t, n) {
	return typeof n == "function" ? gc(e, t, function e(t, r, i, a, o, s) {
		let c = n(t, r, i, a, o, s);
		return c === void 0 ? gc(t, r, e, s) : !!c;
	}, /* @__PURE__ */ new Map()) : hc(e, t, () => void 0);
}
function gc(e, t, n, r) {
	if (t === e) return !0;
	switch (typeof t) {
		case "object": return _c(e, t, n, r);
		case "function": return Object.keys(t).length > 0 ? gc(e, { ...t }, n, r) : _e(e, t);
		default: return mc(e) ? typeof t == "string" ? t === "" : !0 : _e(e, t);
	}
}
function _c(e, t, n, r) {
	if (t == null) return !0;
	if (Array.isArray(t)) return yc(e, t, n, r);
	if (t instanceof Map) return vc(e, t, n, r);
	if (t instanceof Set) return bc(e, t, n, r);
	let i = Object.keys(t);
	if (e == null || pe(e)) return i.length === 0;
	if (i.length === 0) return !0;
	if (r?.has(t)) return r.get(t) === e;
	r?.set(t, e);
	try {
		for (let a = 0; a < i.length; a++) {
			let o = i[a];
			if (!pe(e) && !(o in e) || t[o] === void 0 && e[o] !== void 0 || t[o] === null && e[o] !== null || !n(e[o], t[o], o, e, t, r)) return !1;
		}
		return !0;
	} finally {
		r?.delete(t);
	}
}
function vc(e, t, n, r) {
	if (t.size === 0) return !0;
	if (!(e instanceof Map)) return !1;
	for (let [i, a] of t.entries()) if (n(e.get(i), a, i, e, t, r) === !1) return !1;
	return !0;
}
function yc(e, t, n, r) {
	if (t.length === 0) return !0;
	if (!Array.isArray(e)) return !1;
	let i = /* @__PURE__ */ new Set();
	for (let a = 0; a < t.length; a++) {
		let o = t[a], s = !1;
		for (let c = 0; c < e.length; c++) {
			if (i.has(c)) continue;
			let l = e[c], u = !1;
			if (n(l, o, a, e, t, r) && (u = !0), u) {
				i.add(c), s = !0;
				break;
			}
		}
		if (!s) return !1;
	}
	return !0;
}
function bc(e, t, n, r) {
	return t.size === 0 ? !0 : e instanceof Set ? yc([...e], [...t], n, r) : !1;
}
//#endregion
//#region ../node_modules/es-toolkit/dist/compat/predicate/isMatch.mjs
function xc(e, t) {
	return hc(e, t, () => void 0);
}
//#endregion
//#region ../common-javascript/src/main/javascript/util/Lists.ts
var Sc = (e, t, n) => {
	if (n < 0 || n > e.length) throw Error("Index out of bounds");
	return e.slice(0, n).concat(t).concat(e.slice(n + 1));
}, Cc = (e, t, n) => Sc(e, t, e.indexOf(n)), wc = (e, t, n) => e.slice(0, n).concat(t).concat(e.slice(n)), Tc = ({ x: e, y: t }, { x1: n, y1: r, x2: i, y2: a }) => {
	let o = e - n, s = t - r, c = i - n, l = a - r, u = o * c + s * l, d = c * c + l * l, f = -1;
	d !== 0 && (f = u / d);
	let p, m;
	f < 0 ? (p = n, m = r) : f > 1 ? (p = i, m = a) : (p = n + f * c, m = r + f * l);
	let h = e - p, g = t - m;
	return Math.sqrt(h * h + g * g);
}, Ec = (e, t, n) => (t.x - e.x) * (n.y - e.y) - (t.y - e.y) * (n.x - e.x), Dc = (e, t) => {
	let n = {
		x: e.x1,
		y: e.y1
	}, r = {
		x: e.x2,
		y: e.y2
	}, i = {
		x: t.x1,
		y: t.y1
	}, a = {
		x: t.x2,
		y: t.y2
	}, o = Ec(n, r, i), s = Ec(n, r, a), c = Ec(i, a, n), l = Ec(i, a, r);
	return o * s < 0 && c * l < 0;
}, Oc = class e {
	ts;
	points;
	constructor(e) {
		this.ts = e.ts, this.points = e.points || [];
	}
	width() {
		return this.points.length === 0 ? 0 : oe(this.points, ({ x: e }) => e).x - this.offsetWidth();
	}
	height() {
		return this.points.length === 0 ? 0 : oe(this.points, ({ y: e }) => e).y - this.offsetHeight();
	}
	offsetWidth() {
		return this.points.length === 0 ? 0 : se(this.points, ({ x: e }) => e).x;
	}
	offsetHeight() {
		return this.points.length === 0 ? 0 : se(this.points, ({ y: e }) => e).y;
	}
	boundingBox(e = 1, t = 1) {
		return {
			width: this.width() * e,
			height: this.height() * t,
			left: this.offsetWidth() * e,
			top: this.offsetHeight() * t
		};
	}
	lineSegments() {
		return this.points.map((e, t) => {
			let n = this.points[(t + 1) % this.points.length];
			return {
				x1: e.x,
				y1: e.y,
				x2: n.x,
				y2: n.y
			};
		});
	}
	distanceToPoint(e) {
		return this.points.length === 0 ? Infinity : Math.min(...this.lineSegments().map((t) => Tc(e, t)));
	}
	containsPoint({ x: e, y: t }) {
		let n = {
			x1: e,
			y1: t,
			x2: 1.1,
			y2: t
		};
		return de(this.lineSegments(), (e) => +!!Dc(e, n)) % 2 == 1;
	}
	withNewPoint(t) {
		return new e({
			...this,
			points: this.points.concat(t)
		});
	}
	withReplacedPoint(t, n) {
		return new e({
			...this,
			points: Cc(this.points, n, t)
		});
	}
	withMovedPoints(t, n) {
		let r = this.points.map(({ x: e, y: r }) => ({
			x: e + t,
			y: r + n
		}));
		return new e({
			...this,
			points: r
		});
	}
	withoutPoint(t) {
		return new e({
			...this,
			points: ue(this.points, t)
		});
	}
	withTimestamp(t) {
		return new e({
			...this,
			ts: t
		});
	}
	withPoints(t) {
		return new e({
			...this,
			points: t.slice()
		});
	}
	withScaledPoints(t, n, r, i = .05, a = .05) {
		let { top: o, left: s, height: c, width: l } = this.boundingBox();
		if (c < a && n < 1 || l < i && t < 1) return this;
		let u = [];
		return r === "topleft" ? u = this.points.map((e) => ({
			x: (e.x - s) * t + s,
			y: (e.y - o) * n + o
		})) : r === "bottomright" ? u = this.points.map((e) => ({
			x: (e.x - s - l) * t + s + l,
			y: (e.y - o - c) * n + o + c
		})) : r === "topright" ? u = this.points.map((e) => ({
			x: (e.x - s - l) * t + s + l,
			y: (e.y - o) * n + o
		})) : r === "bottomleft" && (u = this.points.map((e) => ({
			x: (e.x - s) * t + s,
			y: (e.y - o - c) * n + o + c
		}))), new e({
			...this,
			points: u
		});
	}
	isEmpty() {
		return this.points.length === 0;
	}
	toSvgString(e = 1, t = 1) {
		return this.points.map((n) => `${n.x * e},${n.y * t}`).join(" ");
	}
}, kc = class e {
	id;
	name;
	displayColor;
	aoiSet;
	stimuli;
	respondentDefinitions;
	timelineType;
	updatedDate;
	timeline;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.displayColor = e.displayColor || "#ffa500", this.aoiSet = e.aoiSet, this.stimuli = e.stimuli, this.respondentDefinitions = (e.respondentDefinitions || []).map((e) => ({
			...e,
			timeline: e.timeline.map((e) => e instanceof Oc ? e : new Oc(e))
		})), this.timelineType = e.timelineType, this.updatedDate = B.isMoment(e.updatedDate) ? e.updatedDate : B(e.updatedDate), this.timeline = e.timeline?.map((e) => e instanceof Oc ? e : new Oc(e)) || [];
	}
	getShapeAtTime(e, t) {
		let n;
		if (this.timelineType === "PER_RESPONDENT") {
			if (!t) return null;
			let e = this.respondentDefinitions.find((e) => e.respondent.id === t);
			if (!e) return null;
			n = e.timeline;
		} else {
			if (t) return null;
			n = this.timeline;
		}
		return n.reduceRight((t, n) => !t && n.ts <= e ? n : t, null);
	}
	getNextShapeAfterTime(e) {
		for (let t = this.timeline.length - 1; t >= 0; t--) if (this.timeline[t].ts <= e) return this.timeline[t + 1];
	}
	getPreviousShapeBeforeTime(e) {
		for (let t = 0; t < this.timeline.length; t++) if (this.timeline[t].ts >= e) return this.timeline[t - 1];
	}
	withReplacedShape(t, n) {
		return new e({
			...this,
			timeline: Cc(this.timeline, n, t)
		});
	}
	withNewShape(t) {
		let n = 0;
		for (; n < this.timeline.length && this.timeline[n].ts < t.ts;) n++;
		return new e({
			...this,
			timeline: wc(this.timeline, t, n)
		});
	}
	withoutShape(t) {
		let n = this.timeline.indexOf(t), r = n + 1, i = this.timeline[n - 1], a = this.timeline[n + 1];
		i && i.points.length === 0 && a && a.points.length === 0 && r++;
		let o = this.timeline.slice(0, n).concat(this.timeline.slice(r));
		return new e({
			...this,
			timeline: o
		});
	}
	withUpdatedShape(e, t, n) {
		if (this.timelineType === "PER_RESPONDENT") throw Error("Unable to update per-respondent aoi");
		let r = e.ts > n - 200 && e.ts < n + 200;
		return t ? r ? this.withReplacedShape(e, t.withTimestamp(e.ts)) : this.withNewShape(t.withTimestamp(n)) : r ? this.withReplacedShape(e, new Oc({ ts: e.ts })) : this.withoutShape(e);
	}
	withDeactivatedShape(e) {
		let t = this.getShapeAtTime(e - 1), n = this.getShapeAtTime(e);
		return t && n && t !== n ? t.isEmpty() ? this.withoutShape(n) : this.withReplacedShape(n, new Oc({}).withTimestamp(e)) : !t && n ? this.withoutShape(n) : this.withNewShape(new Oc({}).withTimestamp(e));
	}
	withActivatedShape(e) {
		let t = this.getShapeAtTime(e - 1), n = this.getShapeAtTime(e);
		if (t && n && t !== n) if (t.isEmpty()) {
			let r = this.getShapeAtTime(t.ts - 1);
			if (r) return this.withUpdatedShape(n, n.withPoints(r.points), e);
			throw Error();
		} else return this.withoutShape(n);
		let r = this.timeline.reduceRight((t, n) => !t && n.ts <= e && !n.isEmpty() ? n : t, null);
		return r ||= this.timeline.reduce((t, n) => !t && n.ts >= e && !n.isEmpty() ? n : t, null), r ? n ? this.withReplacedShape(n, new Oc({}).withTimestamp(e).withPoints(r.points)) : this.withNewShape(new Oc({}).withTimestamp(e).withPoints(r.points)) : this.withNewShape(new Oc({}).withTimestamp(e).withPoints([
			{
				x: .4,
				y: .4
			},
			{
				x: .6,
				y: .4
			},
			{
				x: .6,
				y: .6
			},
			{
				x: .4,
				y: .6
			}
		]));
	}
	withOutOfDateStats() {
		return new e({
			...this,
			updatedDate: this.updatedDate.clone().add(1, "second")
		});
	}
	withName(t) {
		return new e({
			...this,
			name: t
		});
	}
	withNameOnly(t) {
		return new e({
			id: this.id,
			name: t,
			displayColor: this.displayColor,
			aoiSet: this.aoiSet,
			stimuli: this.stimuli
		});
	}
	withDisplayColor(t) {
		return new e({
			...this,
			displayColor: t
		});
	}
	withDisplayColorOnly(t) {
		return new e({
			id: this.id,
			displayColor: t,
			name: this.name,
			aoiSet: this.aoiSet,
			stimuli: this.stimuli
		});
	}
	isEmpty() {
		return this.timeline.length === 0 || this.timeline.length === 1 && this.timeline[0].points.length === 0;
	}
	equalsByNameAndTimeline(e) {
		return this.name === e.name && this.timeline.length === e.timeline.length && this.timeline.every((t, n) => t.toSvgString() === e.timeline[n].toSvgString());
	}
}, Ac = class {
	id;
	name;
	company;
	aoiDefinitions;
	metadata;
	calculatingAois;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.company = e.company, this.aoiDefinitions = e.aoiDefinitions.map((e) => e instanceof kc ? e : new kc(e)), this.metadata = e.metadata || [], this.calculatingAois = e.calculatingAois || !1;
	}
	getDefaultHiddenInUiIds() {
		let e = [];
		return this.metadata.forEach((t) => {
			t.Metrics.forEach((t) => {
				t.DefaultInUI !== "TRUE" && e.push(t.Id);
			});
		}), e;
	}
}, jc = class e {
	id;
	aoiDefinition;
	segment;
	updatedDate;
	ttff;
	timeSpent;
	ratio;
	mouseClicks;
	revisitorRatio;
	revisits;
	actualExposureMs;
	durationMs;
	areaPixels;
	ratioNumeratorFixation;
	fixationCount;
	ttffMs;
	dwellTimeMsFixation;
	dwellTimePercentFixation;
	visitsFixation;
	ratioNumeratorGaze;
	hitTimeMsGaze;
	dwellTimeMsGaze;
	dwellTimePercentGaze;
	visitsGaze;
	ratioNumeratorSaccade;
	saccadeCount;
	stats;
	constructor(e) {
		this.id = e.id, this.aoiDefinition = e.aoiDefinition, this.segment = e.segment, this.updatedDate = B(e.updatedDate), this.ttff = e.ttff, this.timeSpent = e.timeSpent, this.ratio = e.ratio, this.mouseClicks = e.mouseClicks, this.revisitorRatio = e.revisitorRatio, this.revisits = e.revisits, this.actualExposureMs = e.actualExposureMs, this.durationMs = e.durationMs, this.areaPixels = e.areaPixels, this.ratioNumeratorFixation = e.ratioNumeratorFixation, this.fixationCount = e.fixationCount, this.ttffMs = e.ttffMs, this.dwellTimeMsFixation = e.dwellTimeMsFixation, this.dwellTimePercentFixation = e.dwellTimePercentFixation, this.visitsFixation = e.visitsFixation, this.ratioNumeratorGaze = e.ratioNumeratorGaze, this.hitTimeMsGaze = e.hitTimeMsGaze, this.dwellTimeMsGaze = e.dwellTimeMsGaze, this.dwellTimePercentGaze = e.dwellTimePercentGaze, this.visitsGaze = e.visitsGaze, this.ratioNumeratorSaccade = e.ratioNumeratorSaccade, this.saccadeCount = e.saccadeCount, this.stats = e.stats || {};
	}
	isStale(e) {
		return !this.updatedDate.isSame(e.updatedDate);
	}
	hasNewMetrics() {
		return this.actualExposureMs !== null && this.actualExposureMs !== void 0;
	}
	static empty() {
		return new e({});
	}
}, Mc = class {
	keyId;
	snippet;
	nonHashedSecret;
	keyName;
	expiryDate;
	client;
	constructor(e) {
		this.nonHashedSecret = e.nonHashedSecret || "", this.keyId = e.keyId, this.keyName = e.keyName, this.snippet = e.snippet || "", this.expiryDate = e.expiryDate ? B(e.expiryDate) : null, this.client = e.client;
	}
}, Nc = class {
	id;
	username;
	name;
	email;
	salesforceId;
	companyId;
	features;
	createdDate;
	updatedDate;
	disabled;
	mfaState;
	validTo;
	constructor(e) {
		this.id = e.id, this.username = e.username, this.name = e.name, this.email = e.email, this.salesforceId = e.salesforceId, this.companyId = e.company || e.companyId, this.features = e.features || [], this.createdDate = B(e.createdDate), this.updatedDate = B(e.updatedDate), this.disabled = e.disabled, this.mfaState = e.mfaState, this.validTo = e.validTo ? B(e.validTo) : null;
	}
	hasAccessTo(...e) {
		return e.every((e) => this.features.includes(e));
	}
	hasAccessToAny(...e) {
		return e.some((e) => this.features.includes(e));
	}
	hasMfaEnabled() {
		return this.mfaState === "ENABLED";
	}
	isImotionsUser() {
		return this.email?.toLowerCase().endsWith("@imotions.com");
	}
}, Pc = class {
	id;
	name;
	customerKey;
	salesforceId;
	users;
	features;
	distributionSettings;
	createdDate;
	dpaVersionApproved;
	dpaApprover;
	dpaApprovalDate;
	rootFolder;
	mediaFolder;
	preProcessingVersions;
	panelProviderSettings;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.customerKey = e.customerKey, this.salesforceId = e.salesforceId, this.users = (e.users || []).map((e) => new Nc(e)), this.features = e.features || [], this.distributionSettings = e.distributionSettings, this.createdDate = B(e.createdDate), this.dpaVersionApproved = e.dpaVersionApproved || null, this.dpaApprover = e.dpaApprover || null, this.dpaApprovalDate = B(e.dpaApprovalDate) || null, this.rootFolder = e.rootFolder, this.mediaFolder = e.mediaFolder, this.panelProviderSettings = e.panelProviderSettings || [], this.preProcessingVersions = e.preProcessingVersions || [];
	}
	hasAccessToRespiration() {
		return this.preProcessingVersions.some((e) => e.jobType === "Respiration");
	}
}, Fc = class {
	id;
	user;
	type;
	valid;
	used;
	redirectTo;
	constructor(e) {
		this.id = e.accessToken, this.user = new Nc(e.user), this.type = e.temporaryType, this.valid = e.valid, this.used = e.used, this.redirectTo = e.redirectTo;
	}
	isResetPassword() {
		return this.type === "PASSWORD_RESET";
	}
	isWelcome() {
		return this.type === "NEW_USER_INVITE";
	}
}, Ic = [
	"image/apng",
	"image/gif",
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/bmp"
], Lc = class {
	id;
	name;
	company;
	parentFolder;
	version;
	versionTimestamp;
	createdDate;
	type;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.company = e.company, this.parentFolder = e.parentFolder, this.version = e.version, this.versionTimestamp = B(e.versionTimestamp), this.createdDate = B(e.createdDate), this.type = e.type;
	}
}, Rc = class {
	id;
	name;
	url;
	thumbnailUrl;
	mimeType;
	width;
	height;
	durationMs;
	fileItem;
	createdDate;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.url = e.url, this.thumbnailUrl = e.thumbnailUrl, this.mimeType = e.mimeType, this.width = e.width, this.height = e.height, this.durationMs = e.durationMs, this.fileItem = e.fileItem, this.createdDate = e.createdDate;
	}
	getType() {
		return Ic.includes(this.mimeType) ? "image" : this.mimeType === "video/mp4" ? "video" : this.mimeType === "surveyJs/theme" ? "surveyJsTheme" : this.mimeType === "surveyJs/themeImage" ? "surveyJsThemeImage" : "unknown";
	}
}, zc = class extends Lc {
	file;
	constructor(e) {
		super(e), this.file = new Rc(e.file);
	}
}, Bc = class extends Lc {
	studyCopy;
	constructor(e) {
		super(e), this.studyCopy = e.studyCopy;
	}
}, Vc = class extends Lc {
	study;
	studyType;
	collectingData;
	currentLab;
	constructor(e) {
		super(e), this.study = e.study, this.studyType = e.studyType, this.collectingData = e.collectingData, this.currentLab = e.currentLab;
	}
}, Hc = class e extends Lc {
	items;
	folderPath;
	constructor(t) {
		super(t), this.items = t.items.map((t) => {
			switch (t.type) {
				case "Folder": return new e(t);
				case "StudyItem": return new Vc(t);
				case "StudyCopyItem": return new Bc(t);
				case "FileItem": return new zc(t);
				default: throw Error(`Item type ${t.type} not supported`);
			}
		}), this.folderPath = t.folderPath || [];
	}
	isRootFolder() {
		return !this.parentFolder;
	}
	getFullFolderPath() {
		return this.folderPath.concat([{
			folderId: this.id,
			folderName: this.name
		}]);
	}
}, Uc = class {
	timestamp;
	studyId;
	busyUiShown;
	currentSlideNo;
	slideCount;
	offline;
	queuedUploads;
	constructor(e) {
		this.timestamp = B(e.timestamp), this.studyId = e.studyId, this.busyUiShown = e.busyUiShown, this.currentSlideNo = e.currentSlideNo, this.slideCount = e.slideCount, this.offline = e.offline, this.queuedUploads = e.queuedUploads;
	}
	isWaitingForCalibration() {
		return !this.isPostprocessing() && this.studyId && this.slideCount === 0;
	}
	isSessionInProgress() {
		return !!this.slideCount;
	}
	isPostprocessing() {
		return this.busyUiShown;
	}
	isIdle() {
		return !this.studyId;
	}
	isOffline() {
		return this.offline;
	}
}, Wc = {
	DATA_COLLECTOR: "Data collector",
	STUDY_OWNER: "Study owner"
}, Gc = class {
	id;
	name;
	location;
	labId;
	currentSessionId;
	actingAs;
	lastPing;
	sharePathOverride;
	createdDate;
	disabled;
	publicProductKey;
	pcAgentVersion;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.location = e.location, this.labId = e.lab || e.labId, this.currentSessionId = e.currentSession || e.currentSessionId, this.actingAs = e.actingAs || "DATA_COLLECTOR", this.lastPing = e.lastPing ? new Uc(e.lastPing) : null, this.sharePathOverride = e.sharePathOverride, this.createdDate = B(e.createdDate), this.disabled = e.disabled, this.publicProductKey = e.publicProductKey, this.pcAgentVersion = e.pcAgentVersion;
	}
	isIdle() {
		return !this.isStudyOwner() && !this.isDisabled() && !this.isNotInstalled() && !this.isOffline() && !this.isStudyInProgress();
	}
	isOffline() {
		return !this.isStudyOwner() && !this.isDisabled() && this.lastPing?.isOffline();
	}
	isNotInstalled() {
		return !this.isStudyOwner() && !this.lastPing;
	}
	isDisabled() {
		return !!this.disabled;
	}
	isStudyInProgress() {
		return !!this.currentSessionId || this.lastPing && !this.lastPing.isIdle() && !this.lastPing.isOffline();
	}
	isWaitingToStart() {
		return !!this.currentSessionId && this.lastPing && this.lastPing.isIdle() && !this.lastPing.isOffline() && !this.isDisabled();
	}
	isDataCollector() {
		return this.actingAs === "DATA_COLLECTOR";
	}
	isStudyOwner() {
		return this.actingAs === "STUDY_OWNER";
	}
	getRoleName() {
		return Wc[this.actingAs];
	}
	static stateComparator(e, t) {
		let n = [
			(e) => e.isNotInstalled(),
			(e) => e.isOffline(),
			(e) => e.isStudyInProgress(),
			(e) => e.isIdle(),
			(e) => e.isDisabled(),
			(e) => e.isStudyOwner(),
			() => !0
		];
		return n.findIndex((t) => t(e)) - n.findIndex((e) => e(t));
	}
}, Kc = class {
	id;
	name;
	machines;
	currentStudiesIds;
	maxConcurrentDownloaders;
	maxConcurrentUploaders;
	secondsIdleBeforeUploadAllowed;
	uploadWindowStart;
	uploadWindowEnd;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.machines = e.machines.map((e) => new Gc(e)), this.currentStudiesIds = e.currentStudies || e.currentStudiesIds, this.maxConcurrentDownloaders = e.maxConcurrentDownloaders, this.maxConcurrentUploaders = e.maxConcurrentUploaders, this.secondsIdleBeforeUploadAllowed = e.secondsIdleBeforeUploadAllowed, this.uploadWindowStart = e.uploadWindowStart ? B(e.uploadWindowStart) : null, this.uploadWindowEnd = e.uploadWindowEnd ? B(e.uploadWindowEnd) : null;
	}
}, qc = class {
	productKeyId;
	machineName;
	renewalDate;
	moduleNames;
	externalNote;
	unlocked;
	lastUserUnlockDate;
	unlocksRemaining;
	versionInstalled;
	constructor(e) {
		this.productKeyId = e.productKeyId, this.machineName = e.machineName, this.renewalDate = B(e.renewalDate), this.moduleNames = e.moduleNames, this.externalNote = e.externalNote, this.unlocked = e.unlocked, this.lastUserUnlockDate = e.lastUserUnlockDate ? B(e.lastUserUnlockDate) : null, this.unlocksRemaining = e.unlocksRemaining, this.versionInstalled = e.versionInstalled;
	}
}, Jc = class {
	customerKey;
	productLicenseInfoForExternalUsers;
	constructor(e) {
		this.customerKey = e.customerKey, this.productLicenseInfoForExternalUsers = e.productLicenseInfoForExternalUsers.map((e) => new qc(e));
	}
}, Yc = class {
	id;
	stimuli;
	respondent;
	segment;
	reportUrl;
	state;
	templateVersion;
	updatedDate;
	createdDate;
	constructor(e) {
		this.id = e.id, this.stimuli = e.stimuli, this.respondent = e.respondent, this.segment = e.segment, this.reportUrl = e.reportUrl, this.state = e.state, this.templateVersion = e.templateVersion, this.updatedDate = B(e.updatedDate), this.createdDate = B(e.createdDate);
	}
	isProcessing() {
		return this.state === "PROCESSING";
	}
	isSuccess() {
		return this.state === "SUCCESS";
	}
	isNotApplicable() {
		return this.state === "NOT_APPLICABLE";
	}
	isSignalsOnly() {
		return this.state === "SIGNALS_ONLY";
	}
	isError() {
		return this.state === "ERROR";
	}
}, Xc = (e) => Object.entries(e).map(([e, t]) => `${e}:${t}`).toSorted().join(","), Zc = class {
	id;
	template;
	study;
	templateVersion;
	parameterValues;
	state;
	reports;
	createdDate;
	constructor(e) {
		this.id = e.id, this.template = e.template, this.study = e.study, this.templateVersion = e.templateVersion, this.parameterValues = e.parameterValues, this.state = e.state, this.reports = e.reports?.map((e) => new Yc(e)) ?? [], this.createdDate = B(e.createdDate);
	}
	isWaitingToProcess() {
		return this.state === "CREATED" || this.state === "RETRYING";
	}
	isProcessing() {
		return this.state === "PROCESSING";
	}
	isSuccess() {
		return this.state === "SUCCESS";
	}
	getReport(e, t, n) {
		return this.reports.find((r) => (!e || r.stimuli.id === e) && (!t || r.respondent.id === t) && (!n || r.segment.id === n));
	}
	getParameterSetId() {
		return Xc(this.parameterValues);
	}
	hasSameParameterValues(e) {
		return this.getParameterSetId() === Xc(e);
	}
	getProgress() {
		if (this.isWaitingToProcess()) return {
			state: "inprogress",
			now: 0,
			max: 1
		};
		let e = this.reports.filter((e) => e.isProcessing()).length, t = this.reports.filter((e) => e.isError()).length, n = this.reports.filter((e) => e.isSuccess()).length;
		return e ? {
			state: "inprogress",
			now: t + n,
			max: t + n + e
		} : t ? n ? {
			state: "readywitherrors",
			errors: t,
			max: t + n
		} : { state: "error" } : { state: "ready" };
	}
}, Qc = class {
	name;
	type;
	order;
	label;
	description;
	defaultValue;
	min;
	max;
	step;
	choices;
	multiple;
	placeholder;
	requiredSensor;
	constructor(e) {
		this.name = e.name, this.type = e.type, this.order = e.order, this.label = e.label, this.description = e.description, this.defaultValue = e.defaultValue, this.min = e.min, this.max = e.max, this.step = e.step, this.choices = e.choices, this.multiple = e.multiple, this.placeholder = e.placeholder, this.requiredSensor = e.requiredSensor;
	}
	getDisplayLabel() {
		return this.label || this.name;
	}
	getDisplayValue(e, t) {
		let n = e[this.name];
		if (n === !0) return "Yes";
		if (n === !1) return "No";
		if (n === void 0 || n === "") return "(No value selected)";
		if (this.type === "FILE") return n.substr(n.lastIndexOf("/") + 1);
		if (this.type === "ENUMERATION") {
			if (this.choices?.includes("EVERY_STIMULUS")) {
				let e = t.getStimuli(n);
				if (e) return e.displayName;
			}
			if (this.choices?.includes("EVERY_RESPONDENT")) {
				let e = t.getRespondent(n);
				if (e) return e.label;
			}
			if (this.choices?.includes("EVERY_SEGMENT")) {
				let e = t.getSegment(n);
				if (e) return e.name;
			}
		}
		return n;
	}
	getDefaultValue(e) {
		if (this.type === "ENUMERATION" && this.choices && this.choices.length === 1) {
			if (this.choices[0] === "EVERY_STIMULUS") return e.stimuli[0].id;
			if (this.choices[0] === "EVERY_RESPONDENT") return e.respondents[0].id;
			if (this.choices[0] === "EVERY_SEGMENT") return e.getAllRespondentsSegment().id;
		}
		return this.defaultValue;
	}
	shouldBeDisplayedFor(e) {
		return this.requiredSensor ? e.collectedSensors.some((e) => {
			let t = e.sensor;
			return t.toLocaleLowerCase().includes(this.requiredSensor.toLocaleLowerCase()) || t.match(this.requiredSensor);
		}) : !0;
	}
}, $c = class {
	id;
	company;
	templateUrl;
	name;
	description;
	version;
	disabled;
	stimuliDynamic;
	respondentDynamic;
	segmentDynamic;
	parameters;
	requiredTemplates;
	requiredSensor;
	desktopGeneration;
	createdDate;
	updatedDate;
	type;
	systemType;
	nonDefaultMainFile;
	constructor(e) {
		this.id = e.id, this.company = e.company, this.templateUrl = e.templateUrl, this.name = e.name, this.description = e.description, this.version = e.version, this.disabled = e.disabled, this.stimuliDynamic = e.stimuliDynamic, this.respondentDynamic = e.respondentDynamic, this.segmentDynamic = e.segmentDynamic, this.parameters = e.parameters?.map((e) => new Qc(e)) ?? [], this.requiredTemplates = e.requiredTemplates || [], this.requiredSensor = e.requiredSensor, this.desktopGeneration = e.desktopGeneration, this.createdDate = B(e.createdDate), this.updatedDate = B(e.updatedDate), this.type = e.type, this.systemType = e.systemType, this.nonDefaultMainFile = e.nonDefaultMainFile;
	}
	hasParameters() {
		return this.parameters.length > 0;
	}
	getDefaultParameterValues(e) {
		return Object.assign({}, ...this.parameters.map((t) => ({ [t.name]: t.getDefaultValue(e) })));
	}
	getOrderedParameters() {
		return this.parameters.slice().sort((e, t) => e.order ? e.order - t.order : e.getDisplayLabel().localeCompare(t.getDisplayLabel()));
	}
	isVsts() {
		return this.templateUrl.startsWith("vsts://");
	}
	isCompatibleWith(e, t) {
		return e.desktopGeneration === this.desktopGeneration && this.hasRequiredSensor(t);
	}
	hasRequiredSensor(e) {
		return this.requiredSensor ? e.collectedSensors.some((e) => {
			let t = e.sensor;
			return t.toLocaleLowerCase().includes(this.requiredSensor.toLocaleLowerCase()) || t.match(this.requiredSensor);
		}) : !0;
	}
}, el = class {
	studies;
	respondents;
	totalProcessedRecordingSizeMb;
	constructor(e) {
		this.studies = e.studies, this.respondents = e.respondents, this.totalProcessedRecordingSizeMb = e.totalProcessedRecordingSizeMb;
	}
}, tl = class {
	lastDay;
	lastWeek;
	lastMonth;
	lastYear;
	lifeTime;
	constructor(e) {
		this.lastDay = new el(e.lastDay), this.lastWeek = new el(e.lastWeek), this.lastMonth = new el(e.lastMonth), this.lastYear = new el(e.lastYear), this.lifeTime = new el(e.lifeTime);
	}
}, nl = class {
	rdc;
	online;
	constructor(e) {
		this.rdc = new tl(e.rdc), this.online = new tl(e.online);
	}
}, rl = class {
	id;
	name;
	lastUpdated;
	deletionStatus;
	downloadAvailable;
	downloadUrl;
	nativeCloudStudy;
	downloadGenerationInProgress;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.lastUpdated = B(e.updatedDate), this.deletionStatus = e.deletionStatus, this.downloadUrl = e.downloadUrl, this.downloadAvailable = e.downloadAvailable, this.nativeCloudStudy = e.nativeCloudStudy, this.downloadGenerationInProgress = e.downloadGenerationInProgress;
	}
}, il = class {
	id;
	name;
	respondents;
	processingState;
	constructor(e) {
		this.id = e.id, this.name = e.name, this.respondents = e.respondents, this.processingState = e.processingState;
	}
	isProcessing() {
		return this.processingState === "PENDING";
	}
	hasSameRespondents(e) {
		return this.respondents.length === e.length && e.every((e) => this.respondents.some((t) => t.id === e));
	}
}, al = class {
	elementType;
	questionId;
	isRequired;
	isRequiredLabelVisible;
	isAnswered;
	isCloned;
	constructor(e) {
		this.elementType = e.$type, this.questionId = e.QuestionId, this.isRequired = e.IsRequired, this.isRequiredLabelVisible = e.IsRequiredLabelVisible, this.isAnswered = e.IsAnswered, this.isCloned = e.IsCloned;
	}
}, ol = class extends al {
	imageUrl;
	headline;
	constructor(e) {
		super(e), this.imageUrl = e.ImageURL.Path, this.headline = e.Headline;
	}
}, sl = class extends al {
	isMultiChoice;
	headline;
	showCategoryImage;
	showCategoryText;
	showQuestionText;
	randomizeLabels;
	randomizeQuestions;
	resizeNeeded;
	textAlign;
	isVertical;
	divisions;
	questions;
	questionTexts;
	constructor(e) {
		super(e), this.isMultiChoice = e.IsMultiChoice, this.headline = e.Headline, this.showCategoryImage = e.ShowCategoryImage, this.showCategoryText = e.ShowCategoryText, this.showQuestionText = e.ShowQuestionText, this.randomizeLabels = e.RandomizeLabels, this.randomizeQuestions = e.RandomizeQuestions, this.resizeNeeded = e.ResizeNeeded, this.textAlign = e.TextAlign, this.isVertical = e.IsVertical, this.divisions = [], e.Divisions.forEach((e) => {
			let t = {
				divisionType: e.$type,
				isChecked: e.IsChecked,
				groupName: e.GroupName,
				imageUri: e.ImageUri.Path,
				category: e.Category,
				value: e.Value
			};
			this.divisions.push(t);
		}), this.questions = [], e.Questions.forEach((e) => {
			let t = [];
			e.Values.forEach((e) => {
				let n = {
					divisionType: e.$type,
					isChecked: e.IsChecked,
					groupName: e.GroupName,
					imageUri: e.ImageUri.Path,
					category: e.Category,
					value: e.Value
				};
				t.push(n);
			});
			let n = {
				questionType: e.$type,
				isMultiChoice: e.IsMultiChoice,
				questionText: e.QuestionText,
				uniqueIdentifier: e.UniqueIdentifier,
				values: t
			};
			this.questions.push(n);
		}), this.questionTexts = [], e.QuestionTexts.forEach((e) => {
			this.questionTexts.push(e.Text);
		});
	}
}, cl = class extends al {
	headline;
	showNumbericValue;
	showCategoryText;
	isDiscrete;
	isSliderDirectionReversed;
	minValue;
	maxValue;
	defaultValue;
	value;
	numOfBins;
	tickCollection;
	divisions;
	bins;
	constructor(e) {
		super(e), this.headline = e.Headline, this.showNumbericValue = e.ShowNumbericValue, this.showCategoryText = e.ShowCategoryText, this.isDiscrete = e.IsDiscrete, this.isSliderDirectionReversed = e.IsSliderDirectionReversed, this.minValue = parseInt(e.MinValue, 10), this.maxValue = parseInt(e.MaxValue, 10), this.defaultValue = parseInt(e.DefaultValue, 10), this.value = parseInt(e.Value, 10), this.numOfBins = parseInt(e.NumOfBins, 10), this.tickCollection = [], e.TickCollection.forEach((e) => {
			this.tickCollection.push(parseFloat(e));
		}), this.divisions = [], e.Divisions.forEach((e) => {
			let t = {
				divisionType: e.$type,
				category: e.Category,
				value: parseInt(e.Value, 10)
			};
			this.divisions.push(t);
		}), this.bins = [], e.Bins.forEach((e) => {
			this.bins.push(e);
		});
	}
}, ll = class extends al {
	questionText;
	constructor(e) {
		super(e), this.questionText = e.QuestionText;
	}
}, ul = class extends al {
	headline;
	userText;
	maxChars;
	constructor(e) {
		super(e), this.headline = e.Headline, this.userText = e.UserText, this.maxChars = e.TextLength;
	}
}, dl = [
	"left",
	"right",
	"center",
	"justify"
], fl = class {
	elementType;
	width;
	height;
	x;
	y;
	foregroundColorString;
	backgroundColorString;
	fontSize;
	headlineFontSize;
	generalTextAlignment;
	zIndex;
	resolutionWidth;
	resolutionHeight;
	constructor(e) {
		this.elementType = e.$type, this.width = parseInt(e.Width, 10), this.height = parseInt(e.Height, 10), this.x = parseInt(e.X, 10), this.y = parseInt(e.Y, 10), this.foregroundColorString = this.getColor(e.ForegroundColorString), this.backgroundColorString = this.getColor(e.BackgroundColorString), this.fontSize = parseInt(e.FontSize, 10), this.headlineFontSize = parseInt(e.HeadlineFontSize, 10), this.generalTextAlignment = dl[e.GeneralTextAlignment], this.zIndex = parseInt(e.ZIndex, 10), this.resolutionWidth = e.Resolution.split(",")[0], this.resolutionHeight = e.Resolution.split(",")[1];
	}
	getColor(e) {
		return `#${e.substring(3, 9)}${e.substring(1, 3)}`;
	}
}, pl = (e) => {
	let t;
	if (e.$type.includes("Scale")) t = new cl(e);
	else if (e.$type.includes("QuestionLine")) t = new ll(e);
	else if (e.$type.includes("MultiChoiceMatrixElement")) t = new sl(e);
	else if (e.$type.includes("UserText")) t = new ul(e);
	else if (e.$type.includes("ImageElement")) t = new ol(e);
	else return;
	return {
		model: t,
		style: new fl(e)
	};
}, ml = (e) => e.QElements ? j(j(e.QElements).map((e) => pl(e))) : e, hl = (e, t) => Math.floor(e / t.width * t.height), gl = (e, t) => {
	if (typeof e == "number") {
		let n = e, r = Math.min(n, t.width);
		return {
			width: r,
			height: hl(r, t),
			scale: r / n
		};
	}
	let n = Math.min(e.width / t.width, e.height / t.height);
	return {
		width: t.width * n,
		height: t.height * n,
		scale: n
	};
}, _l = (e, t) => {
	let n = e.trim();
	return n.toLowerCase().startsWith("http://") || n.toLowerCase().startsWith("https://") ? n : `${t}://`.concat(n);
};
({
	type: "moving dot",
	color: "#ffffff",
	positions: [
		{
			top: .167,
			left: .167
		},
		{
			top: .167,
			left: .5
		},
		{
			top: .167,
			left: .833
		},
		{
			top: .5,
			left: .167
		},
		{
			top: .5,
			left: .5
		},
		{
			top: .5,
			left: .833
		},
		{
			top: .833,
			left: .167
		},
		{
			top: .833,
			left: .5
		},
		{
			top: .833,
			left: .833
		},
		{
			top: .333,
			left: .333
		},
		{
			top: .333,
			left: .667
		},
		{
			top: .667,
			left: .333
		},
		{
			top: .667,
			left: .667
		}
	],
	positionTimeMs: 2e3,
	backgroundColor: "#000000",
	transitionTimeMs: 350,
	randomizePositions: !0
}).positions.slice();
//#endregion
//#region ../cloud-client/src/main/javascript/study/Stimuli.ts
var vl = [
	"CALIBRATION",
	"JS_SURVEY",
	"IMAGE",
	"QUALTRICS",
	"VIDEO",
	"WEB",
	"INSTRUCTION"
], yl = class {
	assetId;
	name;
	surveyQuestions;
	fileName;
	fileSize;
	uploadLocation;
	presignedUrl;
	stsUploadParameters;
	constructor(e) {
		this.assetId = e.assetId, this.name = e.name, this.surveyQuestions = e.surveyQuestions, this.fileName = e.fileName, this.fileSize = e.fileSize, this.uploadLocation = e.uploadLocation, this.presignedUrl = e.presignedUrl, this.stsUploadParameters = e.stsUploadParameters;
	}
}, bl = class {
	id;
	parentStimuliId;
	name;
	displayName;
	type;
	exposureTimeMs;
	exposureOffsetMs;
	width;
	height;
	imageUrl;
	videoUrl;
	websiteUrl;
	manualAdvance;
	displayOrder;
	fixedPosition;
	surveyQuestions;
	surveyTheme;
	segmentData;
	respondentData;
	tags;
	recordWebcam;
	recordScreen;
	trackMouse;
	calibrationOptions;
	instructionOptions;
	websiteOptions;
	blocks;
	autoAoi;
	constructor(e) {
		this.id = e.id, this.parentStimuliId = e.parentStimuli || e.parentStimuliId, this.name = e.name, this.displayName = e.displayName || e.name, this.type = e.type, this.exposureTimeMs = e.exposureTimeMs, this.exposureOffsetMs = e.exposureOffsetMs || 0, this.width = e.width, this.height = e.height, this.imageUrl = e.imageUrl, this.videoUrl = e.videoUrl, this.websiteUrl = e.websiteUrl, this.manualAdvance = e.manualAdvance, this.displayOrder = e.displayOrder, this.fixedPosition = e.fixedPosition, this.surveyQuestions = this.parseSurveyQuestions(e), this.surveyTheme = e.surveyTheme, this.segmentData = e.segmentData || [], this.respondentData = e.respondentData || [], this.tags = e.tags || [], this.recordWebcam = e.recordWebcam, this.recordScreen = e.recordScreen, this.trackMouse = e.trackMouse, this.calibrationOptions = e.calibrationOptions, this.instructionOptions = e.instructionOptions, this.websiteOptions = e.websiteOptions, this.blocks = e.blocks, this.autoAoi = e.autoAoi;
	}
	parseSurveyQuestions(e) {
		return e.type === "JS_SURVEY" ? e.surveyQuestions : e.surveyQuestions ? ml(e.surveyQuestions) : null;
	}
	isShowImage() {
		return [
			"IMAGE",
			"IMAGE_SCENE",
			"INSTRUCTION",
			"WEB_SCENE",
			"SURVEY"
		].includes(this.type);
	}
	isShowVideo() {
		return [
			"VIDEO",
			"VIDEO_SCENE",
			"WEB",
			"QUALTRICS",
			"SCREEN",
			"SCENE_RECORDING",
			"JS_SURVEY"
		].includes(this.type);
	}
	supportsHeatmap() {
		return [
			"IMAGE",
			"VIDEO",
			"INSTRUCTION"
		].includes(this.type);
	}
	supportsMouseTracking() {
		return [
			"IMAGE",
			"VIDEO",
			"INSTRUCTION"
		].includes(this.type);
	}
	isScene() {
		return [
			"VIDEO_SCENE",
			"IMAGE_SCENE",
			"WEB_SCENE"
		].includes(this.type);
	}
	isSurvey() {
		return ["WEB_SURVEY"].includes(this.type);
	}
	hasAggregatedData() {
		return [
			"IMAGE",
			"IMAGE_SCENE",
			"VIDEO",
			"VIDEO_SCENE",
			"SURVEY",
			"WEB_SCENE",
			"INSTRUCTION"
		].includes(this.type);
	}
	csvEscapeName() {
		return this.name === null || ![
			"\"",
			"\r",
			"\n",
			","
		].some((e) => this.name.includes(e)) ? this.name : "\"" + this.name.replace(/"/g, "\"\"") + "\"";
	}
	getAspectAdjustedHeight(e) {
		return Math.floor(e / this.width * this.height);
	}
	getAspectAdjustedWidth(e) {
		return Math.floor(e / this.height * this.width);
	}
	getAspectAdjustedSize(e, t) {
		return gl(t ? {
			width: e,
			height: t
		} : e, this);
	}
	getDataForRespondent(e) {
		return this.respondentData.find((t) => t.respondent.id === e);
	}
	getDataForSegment(e) {
		return this.segmentData.find((t) => t.segment.id === e);
	}
	hasData() {
		return this.segmentData.length > 0 || this.respondentData.length > 0;
	}
	hasIndividualData() {
		return this.respondentData.length > 0;
	}
	hasTag(e) {
		return this.tags.includes(e);
	}
	getTagValue(e) {
		return (this.tags?.find((t) => t.startsWith(e)))?.split(":")[1];
	}
	shouldRecordWebcam(e = null) {
		return e?.webcam === void 0 ? this.recordWebcam === null ? !0 : this.recordWebcam : e.webcam;
	}
	shouldRecordScreen(e = null) {
		return e?.screenRecording === void 0 ? this.recordScreen === null ? this.type === "WEB" && (this.isManualAdvance() || this.hasTag("open-new-tab")) : this.recordScreen : e.screenRecording;
	}
	showInRemoteDataCollection() {
		return [
			"CALIBRATION",
			"IMAGE",
			"QUALTRICS",
			"VIDEO",
			"WEB",
			"WEB_SURVEY",
			"JS_SURVEY",
			"INSTRUCTION"
		].includes(this.type);
	}
	isQualtricsSurvey() {
		return this.type === "QUALTRICS" || this.type === "WEB" && this.websiteUrl?.includes("qualtrics.com");
	}
	isLegacyCalibrationSlide() {
		return (this.type === "IMAGE" || this.type === "VIDEO") && /^[a-z0-9]+_[0-9]+_[0-9]+x[0-9]+(-[0-9]+)?(\.(png|jpg))?$/i.test(this.name);
	}
	isCalibrationSlide() {
		return this.isLegacyCalibrationSlide() || this.type === "CALIBRATION";
	}
	isDefaultOnlineCalibrationSlide() {
		return this.isOnlinePreCalibrationSlide() || this.isOnlinePostCalibrationSlide();
	}
	isOnlinePreCalibrationSlide() {
		return this.type === "CALIBRATION" && this.name === "Pre-study calibration";
	}
	isOnlinePostCalibrationSlide() {
		return this.type === "CALIBRATION" && this.name === "Post-study calibration";
	}
	getWebsiteUrlWithProtocol(e) {
		return _l(this.websiteUrl, e);
	}
	isManualAdvance() {
		return this.hasTag("respondent-advance") || this.manualAdvance;
	}
	typeCanBeShownInOnlineAnalysis() {
		return !this.isCalibrationSlide();
	}
}, xl = (e, t) => {
	let n = [], r = [];
	for (e.replace(/(\d+)|(\D+)/g, (e, t, r) => (n.push([parseInt(t, 10) || Infinity, r || ""]), "")), t.replace(/(\d+)|(\D+)/g, (e, t, n) => (r.push([parseInt(t, 10) || Infinity, n || ""]), "")); n.length && r.length;) {
		let e = n.shift(), t = r.shift(), i = e[0] - t[0] || e[1].localeCompare(t[1]);
		if (i) return i < 0 ? -1 : 1;
	}
	let i = n.length - r.length;
	return i === 0 ? 0 : i < 0 ? -1 : 1;
}, Sl = class {
	name;
	createdDate;
	constructor(e) {
		this.name = e.name, this.createdDate = B(e.createdDate);
	}
}, Cl = class {
	phase;
	timestamp;
	studySessionId;
	setupStep;
	stimulusId;
	interslideSetup;
	currentSlideNo;
	slideCount;
	topLevelBlockId;
	constructor(e) {
		this.phase = e.phase, this.timestamp = e.timestamp ? B(e.timestamp) : void 0, this.studySessionId = e.studySessionId ? e.studySessionId : "", this.setupStep = e.setupStep, this.stimulusId = e.stimulusId, this.interslideSetup = e.interslideSetup, this.currentSlideNo = e.currentSlideNo, this.slideCount = e.slideCount, this.topLevelBlockId = e.topLevelBlockId;
	}
}, wl = class {
	id;
	createdDate;
	updatedDate;
	pendingPreProcessingSteps;
	zipFileName;
	constructor(e) {
		this.id = e.id, this.createdDate = B(e.createdDate), this.updatedDate = B(e.updatedDate), this.pendingPreProcessingSteps = e.pendingPreProcessingSteps, this.zipFileName = e.zipFileName;
	}
}, Tl = class {
	id;
	age;
	gender;
	label;
	companyId;
	sessionId;
	createdDate;
	sessionAbandonment;
	variables;
	respondentUniqueId;
	upload;
	stimuliOrder;
	processingError;
	constructor(e) {
		this.id = e.id, this.age = e.age, this.gender = e.gender, this.label = e.label, this.companyId = e.company || e.companyId, this.sessionId = e.session || e.sessionId, this.createdDate = B(e.createdDate), this.sessionAbandonment = e.sessionAbandonment ? new Cl(e.sessionAbandonment) : void 0, this.variables = e.variables || {}, this.respondentUniqueId = e.respondentUniqueId, this.upload = e.upload ? new wl(e.upload) : void 0, this.stimuliOrder = e.stimuliOrder || [], this.processingError = e.processingError;
	}
	isMale() {
		return this.gender === "MALE";
	}
	getGenderLong() {
		switch (this.gender) {
			case "FEMALE": return "Female";
			case "MALE": return "Male";
			default: return "Other";
		}
	}
	getGenderShort() {
		return this.getGenderLong().substr(0, 1);
	}
	isTestPlanDummy() {
		return !this.sessionId;
	}
	renderDetails() {
		return `${this.getGenderLong()}, ${this.age}`;
	}
}, El = class {
	id;
	studyId;
	youngMale;
	oldMale;
	youngFemale;
	oldFemale;
	oldAt;
	variables;
	constructor(e) {
		this.id = e.id, this.studyId = e.study || e.studyId, this.youngMale = e.youngMale, this.oldMale = e.oldMale, this.youngFemale = e.youngFemale, this.oldFemale = e.oldFemale, this.oldAt = e.oldAt || 35, this.variables = e.variables || [];
	}
	totalRespondents() {
		return this.youngMale + this.oldMale + this.youngFemale + this.oldFemale;
	}
	numRespondents(e, t) {
		return e === "MALE" && t ? this.oldMale : e === "MALE" && !t ? this.youngMale : e === "FEMALE" && t ? this.oldFemale : this.youngFemale;
	}
	isOld(e) {
		return e.age >= this.oldAt;
	}
	hasSpaceFor(e, t) {
		return this.numSpacesFor(e, t) > 0;
	}
	numSpacesFor(e, t) {
		let n = this.isOld(t), r = e.filter((e) => !e.isLowQuality() && e.respondent.gender === t.gender && this.isOld(e.respondent) === n).length;
		return t.isMale() ? n ? this.oldMale - r : this.youngMale - r : n ? this.oldFemale - r : this.youngFemale - r;
	}
}, Dl = class {
	stimuli;
	summary;
	constructor(e) {
		this.stimuli = e.slice(0, -1), this.summary = e[e.length - 1];
	}
	getSummary() {
		return this.summary;
	}
	getForStimuli(e) {
		return this.stimuli.find((t) => t.name === e.name);
	}
	getForStimuliOrSummary(e) {
		if (!e) return this.getSummary();
		let t = e.stimuli.filter((e) => e.hasTag("quality-metrics"));
		if (t.length === 0) return this.getSummary();
		let n = t.map((e) => e.name);
		return this.stimuli.find((e) => n.includes(e.name)) || this.getSummary();
	}
}, Ol = class {
	id;
	machineId;
	respondent;
	studyId;
	startTime;
	endTime;
	createdDate;
	qualityMetrics;
	lowQualityManual;
	lowQualityAuto;
	consentGiven;
	consentTime;
	variables;
	state;
	remoteLastPing;
	stimuliBlock;
	constructor(e) {
		this.id = e.id, this.machineId = e.machine || e.machineId, this.respondent = new Tl(e.respondent), this.studyId = e.study || e.studyId, this.startTime = e.startTime ? B(e.startTime) : null, this.endTime = e.endTime ? B(e.endTime) : null, this.createdDate = B(e.createdDate), this.qualityMetrics = e.exposureStatistics?.length ? new Dl(e.exposureStatistics) : null, this.lowQualityManual = e.lowQualityManual, this.lowQualityAuto = e.lowQualityAuto, this.consentGiven = e.consentGiven, this.consentTime = e.consentTime ? B(e.consentTime) : null, this.variables = e.variables || {}, this.state = e.state, this.remoteLastPing = e.remoteLastPing ? new Cl(e.remoteLastPing) : void 0, this.stimuliBlock = e.stimuliBlock;
	}
	isWaiting() {
		return !this.machineId;
	}
	isInProgress() {
		return !!this.machineId && !this.endTime;
	}
	isFinished() {
		return !!this.endTime;
	}
	isLowQuality() {
		return ve(this.lowQualityManual) ? this.lowQualityAuto : this.lowQualityManual;
	}
	isOdcOrCloudNativePreview() {
		return this.variables.iMotionsPreview === "true";
	}
	getCustomVariables() {
		let e = /* @__PURE__ */ new Map();
		return Object.entries(this.variables).forEach(([t, n]) => {
			!t.startsWith("iMotions") && t !== "incorrectSearchParameter" && t !== "possiblyIncorrectSearchParameter" && e.set(t, n);
		}), e;
	}
}, kl = class {
	id;
	version;
	name;
	studyUniqueId;
	currentLabId;
	availableOn;
	sessions;
	respondents;
	respondentRegistration;
	quota;
	screenWidth;
	screenHeight;
	stimuli;
	segments;
	createdDate;
	finishedDate;
	state;
	studyType;
	signalsDisabled;
	demarcatedSignals;
	company;
	companyName;
	pieces;
	tags;
	aoiSet;
	desktopVersion;
	desktopGeneration;
	annotations;
	remoteDataCollection;
	remoteDataCollectionVersion;
	rejectConsentRedirect;
	studyFinishedRedirect;
	collectionErrorRedirect;
	consentForm;
	contactEmail;
	respondentPositionCheck;
	respondentPositionReCheck;
	respondentEyesCheck;
	allowSkipRespondentPositionEyesChecks;
	audioInputCheck;
	audioOutputCheck;
	locale;
	blockUsage;
	topLevelBlocks;
	studyOwner;
	studyEditors;
	validTo;
	folder;
	sensors;
	deviceTypes;
	panelProviderType;
	panelProviderId;
	constructor(e) {
		this.id = e.id, this.version = e.version || 1, this.name = e.name, this.studyUniqueId = e.studyUniqueId, this.currentLabId = e.currentLab || e.currentLabId, this.availableOn = e.availableOn || [], this.sessions = e.sessions?.map((e) => new Ol(e)) ?? [], this.respondents = e.respondents?.map((e) => new Tl(e)) ?? [], this.respondentRegistration = e.respondentRegistration, this.quota = e.quota ? new El(e.quota) : null, this.screenWidth = e.screenWidth, this.screenHeight = e.screenHeight, this.stimuli = e.stimuli?.map((e) => new bl(e)) ?? [], this.segments = e.segments?.map((e) => new il(e)) ?? [], this.createdDate = B(e.createdDate), this.finishedDate = e.finishedDate ? B(e.finishedDate) : null, this.state = e.state, this.studyType = e.studyType, this.signalsDisabled = e.signalsDisabled || !1, this.demarcatedSignals = e.demarcatedSignals || {}, this.company = e.company, this.companyName = e.companyName, this.pieces = e.pieces, this.tags = e.tags || [], this.aoiSet = e.aoiSet, this.desktopVersion = e.desktopVersion, this.desktopGeneration = e.desktopGeneration, this.annotations = e.annotations || [], this.remoteDataCollection = e.remoteDataCollection, this.remoteDataCollectionVersion = e.remoteDataCollectionVersion ? new Sl(e.remoteDataCollectionVersion) : null, this.rejectConsentRedirect = e.rejectConsentRedirect, this.studyFinishedRedirect = e.studyFinishedRedirect, this.collectionErrorRedirect = e.collectionErrorRedirect, this.consentForm = e.consentForm, this.contactEmail = e.contactEmail, this.respondentPositionCheck = e.respondentPositionCheck, this.respondentPositionReCheck = e.respondentPositionReCheck, this.respondentEyesCheck = e.respondentEyesCheck, this.allowSkipRespondentPositionEyesChecks = e.allowSkipRespondentPositionEyesChecks, this.audioInputCheck = e.audioInputCheck, this.audioOutputCheck = e.audioOutputCheck, this.locale = e.locale, this.blockUsage = e.blockUsage, this.topLevelBlocks = e.topLevelBlocks || [], this.studyOwner = e.studyOwner, this.studyEditors = e.editors || [], this.validTo = e.validTo ? B(e.validTo) : null, this.folder = e.folder, this.sensors = e.sensors || {}, this.deviceTypes = e.deviceTypes, this.panelProviderType = e.panelProviderType, this.panelProviderId = e.panelProviderId;
	}
	canBeDownloaded() {
		return this.pieces.length > 0;
	}
	isBeingProcessed() {
		return this.state === "LOADING_IN_PROGRESS";
	}
	isAnalysisOnly() {
		return !this.quota && this.hasAnalysisResults();
	}
	isConfigNeeded() {
		return !this.quota && (this.state === "NEW_AVAILABLE" || this.state === "ALLOCATED_DISTRIBUTING");
	}
	isReadyToStart() {
		return this.quota && !this.currentLabId && this.sessions.length === 0;
	}
	isInProgress() {
		return !!this.quota && !!this.currentLabId;
	}
	isFinished() {
		return this.quota && !this.currentLabId && this.sessions.length > 0;
	}
	isUsingTestPlanDummies() {
		return this.respondentRegistration === "TEST_PLAN_ONLY";
	}
	hasAnalysisResults() {
		return this.stimuli.length > 0 && (this.segments.length > 0 || this.canCalculateAnalysis());
	}
	getStimuli(e) {
		return this.stimuli.find((t) => t.id === e);
	}
	getSegment(e) {
		return this.segments.find((t) => t.id === e);
	}
	getOrderedSegments() {
		return this.segments.slice().sort((e, t) => xl(e.name, t.name));
	}
	getRespondent(e) {
		return e ? this.respondents.find((t) => t.id === e) : this.respondents[0];
	}
	getOrderedTopLevelBlocks() {
		return this.topLevelBlocks.length ? this.topLevelBlocks[0].flowOrder === null ? this.topLevelBlocks.slice().sort((e, t) => xl(e.displayName, t.displayName)) : this.topLevelBlocks.slice().sort((e, t) => e.flowOrder - t.flowOrder) : this.topLevelBlocks;
	}
	getOrderedStimuli(e) {
		if (this.blockUsage === "BLOCKS_NOT_USED") return this.stimuli[0]?.displayOrder === void 0 ? this.stimuli.slice().sort((e, t) => xl(e.displayName, t.displayName)) : this.stimuli.slice().sort((e, t) => e.displayOrder - t.displayOrder);
		let t = (e) => e.children.slice().sort((e, t) => e.blockOrder - t.blockOrder).flatMap((e) => e.stimuli ? e.stimuli.id : e.block ? t(e.block) : []);
		return t(this.topLevelBlocks.find((t) => t.id === e)).map((e) => this.getStimuli(e));
	}
	getBlockChildForStimulus(e, t) {
		let n = (e) => {
			let r = e.children.find((e) => e.stimuli?.id === t);
			if (r) return r;
			for (let t of e.children) {
				if (!t.block) continue;
				let e = n(t.block);
				if (e) return e;
			}
		};
		return n(this.topLevelBlocks.find((t) => t.id === e));
	}
	getBlockChildForBlock(e, t) {
		let n = (e) => {
			let r = e.children.find((e) => e.block?.id === t);
			if (r) return r;
			for (let t of e.children) {
				if (!t.block) continue;
				let e = n(t.block);
				if (e) return e;
			}
		};
		return n(this.topLevelBlocks.find((t) => t.id === e));
	}
	getBlockChild(e) {
		let t = (n) => {
			let r = n.children.find((t) => t.id === e);
			if (r) return r;
			for (let e of n.children) {
				if (!e.block) continue;
				let n = t(e.block);
				if (n) return n;
			}
		};
		for (let e of this.topLevelBlocks) {
			let n = t(e);
			if (n) return n;
		}
	}
	getAllRespondentsSegment() {
		return this.segments.find((e) => e.name === "All Respondents");
	}
	getSession(e) {
		return this.sessions.find((t) => t.id === e);
	}
	getStimuliRespondentDataById(e) {
		return M(this.stimuli, (e) => e.respondentData).find((t) => t.id === e);
	}
	shouldDemarcateSignals() {
		return Object.keys(this.demarcatedSignals).length > 0;
	}
	shouldShowSensor(e) {
		return this.shouldDemarcateSignals() ? !!this.demarcatedSignals[e] : !0;
	}
	shouldShowSignalForSensor(e, t) {
		return this.shouldDemarcateSignals() ? this.shouldShowSensor(e) ? this.demarcatedSignals[e].includes(t) : !1 : !0;
	}
	canCalculateAnalysis() {
		return this.isCloudNative() ? this.getOrderedStimuliForOnlineAnalysis().length > 0 : this.state === "UPLOAD_COMPLETE";
	}
	canCalculateCloudNativeSegmentAnalysis() {
		return this.isCloudNative() && this.stimuli.some((e) => e.typeCanBeShownInOnlineAnalysis() && e.segmentData.some((e) => e.url));
	}
	getOrderedStimuliForOnlineAnalysis() {
		return this.stimuli.filter((e) => e.typeCanBeShownInOnlineAnalysis() && (e.respondentData.some((e) => e.url) || this.isPredictive() || e.segmentData.some((e) => e.url) && this.isMediaAnalytics() && e.type === "VIDEO")).sort((e, t) => xl(e.displayName, t.displayName));
	}
	hasSpaceFor(e) {
		return this.isUsingTestPlanDummies() ? this.findMatchingDummyRespondents(e).length > 0 : !0;
	}
	findMatchingDummyRespondents(e) {
		let { quota: t } = this;
		if (!t || !this.isUsingTestPlanDummies()) throw Error();
		let n = t.isOld(e);
		return this.respondents.filter((e) => e.isTestPlanDummy()).filter((t) => t.gender === e.gender).filter((e) => t.isOld(e) === n).filter((t) => xc(t.variables, e.variables)).toSorted((e, t) => e ? t ? e.label.localeCompare(t.label) : 1 : -1);
	}
	hasTag(e) {
		return this.tags.includes(e);
	}
	getTagValue(e) {
		return (this.tags?.find((t) => t.startsWith(e)))?.split(":")[1];
	}
	isCloudNative() {
		return this.studyType ? this.studyType === "ONLINE" || this.studyType === "MEDIA_ANALYTICS" || this.studyType === "PREDICTIVE" : this.desktopGeneration === "IMOTIONS_ONLINE";
	}
	isMediaAnalytics() {
		return this.studyType && this.studyType === "MEDIA_ANALYTICS";
	}
	isPredictive() {
		return this.studyType && this.studyType === "PREDICTIVE";
	}
	isOdc() {
		return this.studyType ? this.studyType === "REMOTE_DATA_COLLECTION" : !!(this.remoteDataCollection || this.remoteDataCollectionVersion) && !this.isCloudNative();
	}
	isOdcOrCloudNative() {
		return this.isOdc() || this.isCloudNative();
	}
	isLab() {
		return this.studyType ? this.studyType === "LAB" : !this.isOdcOrCloudNative();
	}
	getAllowedStimuliTypes() {
		return this.isMediaAnalytics() ? [
			"VIDEO",
			"JS_SURVEY",
			"INSTRUCTION"
		] : this.isPredictive() ? ["VIDEO"] : vl;
	}
	getOdcOrCloudNativeRespondentsInProgressCount() {
		let e = new Map(this.sessions.map((e) => [e.respondent.id, e]));
		return this.respondents.filter((t) => this.isOdcOrCloudNativeRespondentInProgress(t, e)).length;
	}
	getOdcOrCloudNativeRespondentsProcessingCount() {
		let e = new Map(this.sessions.map((e) => [e.respondent.id, e]));
		return this.respondents.filter((t) => this.isOdcOrCloudNativeRespondentProcessing(t, e)).length;
	}
	getOdcOrCloudNativeRespondentsProcessedCount() {
		return this.respondents.filter((e) => this.isOdcOrCloudNativeRespondentProcessed(e)).length;
	}
	getOdcOrCloudNativeAbandonedRespondentsCount() {
		return this.respondents.filter((e) => this.isOdcOrCloudNativeRespondentAbandoned(e)).length;
	}
	getOdcOrCloudNativeRespondentsWithProcessingErrorCount() {
		return this.respondents.filter((e) => this.isOdcOrCloudNativeRespondentWithProcessingError(e)).length;
	}
	isOdcOrCloudNativeRespondentInProgress(e, t) {
		if (e.sessionAbandonment || !e.sessionId || e.upload) return !1;
		let n = t.get(e.id);
		if (n.endTime || n.isOdcOrCloudNativePreview() || n.state === "DATA_SAVED_LOCALLY" || n.state === "DATA_DELETED_BY_RESEARCHER") return !1;
		let r = B().subtract(1, "day");
		return B(n.createdDate).isAfter(r);
	}
	isOdcOrCloudNativeRespondentProcessing(e, t) {
		if (e.processingError) return !1;
		let n = t.get(e.id);
		if (!n || n.state === "DATA_SAVED_LOCALLY" || n.state === "DATA_DELETED_BY_RESEARCHER" || n.state === "MULTIPLE_FILE_COPY_ERROR") return !1;
		if (!e.upload && n.endTime) return !0;
		let r = B().subtract(1, "day");
		return !!(e.upload?.updatedDate.isAfter(r) && e.upload?.pendingPreProcessingSteps?.trim().length);
	}
	isOdcOrCloudNativeRespondentProcessed(e) {
		return e.upload && !e.upload.pendingPreProcessingSteps?.trim();
	}
	isOdcOrCloudNativeRespondentAbandoned(e) {
		if (e.sessionAbandonment && !e.sessionId) return !0;
		if (!e.sessionId) return this.respondentRegistration !== "TEST_PLAN_ONLY";
		let t = B().subtract(1, "day"), n = this.sessions.find((t) => t.respondent.id === e.id);
		return n && !n.isOdcOrCloudNativePreview() && !n.endTime && n.state !== "DATA_DELETED_BY_RESEARCHER" && n.state !== "DATA_SAVED_LOCALLY" && n.state !== "MULTIPLE_FILE_COPY_ERROR" && n.createdDate.isBefore(t);
	}
	isOdcOrCloudNativeRespondentWithProcessingError(e) {
		let t = B().subtract(1, "day");
		return e.processingError ? !0 : !!(e.upload?.pendingPreProcessingSteps?.trim().length && e.upload.updatedDate.isBefore(t));
	}
	isCloudNativeStudyLocked() {
		return this.remoteDataCollection || this.sessions.some((e) => !e.variables || !e.isOdcOrCloudNativePreview()) || this.isMediaAnalytics() && this.remoteDataCollectionVersion !== null;
	}
	getRemoteCollectionSetupSteps() {
		let e = [];
		return this.sensors.screenRecording && e.push("screenRecording"), this.sensors.webcam && e.push("respondentCamera"), (this.audioInputCheck || this.audioOutputCheck) && e.push("audio"), document.documentElement.requestFullscreen && e.push("fullscreen"), this.sensors.webcam && (this.respondentPositionCheck || this.respondentEyesCheck) && e.push("respondentPositionCheck"), e;
	}
	getNonPreviewSessions() {
		return this.sessions.filter((e) => !e.isOdcOrCloudNativePreview());
	}
	static stateComparator(e, t) {
		let n = [
			(e) => e.isConfigNeeded(),
			(e) => e.isReadyToStart(),
			(e) => e.isInProgress(),
			(e) => e.isFinished(),
			(e) => e.isAnalysisOnly(),
			() => !0
		];
		return n.findIndex((t) => t(e)) - n.findIndex((e) => e(t));
	}
}, Al = class {
	id;
	studyId;
	s3FileUrl;
	versionTimestamp;
	completedDate;
	stale;
	readyForDownload;
	newestStudyUploadIncluded;
	targetVersion;
	name;
	respondents;
	state;
	selectionInformation;
	constructor(e) {
		this.id = e.id, this.studyId = e.studyId, this.s3FileUrl = e.s3FileUrl, this.versionTimestamp = B(e.versionTimestamp), this.completedDate = e.completedDate ? B(e.completedDate) : null, this.stale = e.stale, this.readyForDownload = e.readyForDownload, this.newestStudyUploadIncluded = e.newestStudyUploadIncluded, this.targetVersion = e.targetVersion, this.name = e.name, this.respondents = e.respondents, this.state = e.state, this.selectionInformation = this.parseSelectionInformation(e.selectionInformation);
	}
	isLegacy() {
		return !this.name;
	}
	parseSelectionInformation(e) {
		if (!e) return {};
		let t = {};
		return Object.entries(e).forEach(([e, n]) => {
			e === "startTime" || e === "endTime" ? t[e] = B(n) : t[e] = n;
		}), t;
	}
}, jl = /* @__PURE__ */ "#66c4f5.#02abff.#238bc2.#025c8a.#10bac9.#0e9aa5.#2a757a.#06464b.#02cfad.#02b196.#248172.#015044.#15d34e.#02b137.#24813f.#015018.#9cca07.#8aa407.#6c7926.#3f4a03.#e0c100.#c3a800.#a68f00.#827000.#ffa500.#d48900.#a16800.#7d5100.#de4300.#ba3800.#932d00.#6c2000.#ff6afc.#e900ff.#c223bc.#8a0286.#b86bff.#8f1aff.#7523c2.#56028a.#5b77ff.#002bff.#232cc2.#02098a".split("."), Ml = (e) => {
	let t = new Set(e);
	return ce(jl.filter((e) => !t.has(e))) || ce(jl);
}, Nl = (e) => e.replace("#FF", "#").toLowerCase(), Pl = class {
	id;
	annotation;
	stimuli;
	respondent;
	text;
	rangeStart;
	rangeEnd;
	imageUrl;
	constructor(e) {
		this.id = e.id, this.annotation = e.annotation, this.stimuli = e.stimuli, this.respondent = e.respondent, this.text = e.text, this.rangeStart = e.rangeStart, this.rangeEnd = e.rangeEnd, this.imageUrl = e.imageUrl;
	}
}, Fl = RegExp("^Video Segments(?: *\\(\\d+\\))?$", "i"), Il = class {
	id;
	study;
	name;
	displayColor;
	fragments;
	hotKey;
	locked;
	constructor(e) {
		this.id = e.id, this.study = e.study, this.name = e.name, this.displayColor = this.parseDisplayColor(e.displayColor), this.fragments = e.fragments ? e.fragments.map((e) => new Pl(e)) : [], this.hotKey = e.hotKey, this.locked = e.locked;
	}
	parseDisplayColor(e) {
		return /#FF[0-9a-f]{6}/i.test(e) ? Nl(e) : e;
	}
	getSortedFragmentsForStimulus(e) {
		return this.fragments.filter((t) => t.stimuli.id === e).sort((e, t) => e.rangeStart - t.rangeStart);
	}
	getFragmentsForStimulus(e) {
		return this.fragments.filter((t) => t.stimuli.id === e);
	}
	getValidRangeForFragment(e, t) {
		let n = this.fragments.find((t) => t.id === e);
		if (!n) throw Error(`Fragment ${e} not found`);
		let r = this.getSortedFragmentsForStimulus(n.stimuli.id), i = r.indexOf(n);
		return {
			min: r[i - 1]?.rangeEnd ?? 0,
			max: r[i + 1]?.rangeStart ?? t
		};
	}
	getValidRangeForFragmentStart(e) {
		let t = this.fragments.find((t) => t.id === e), n = this.getSortedFragmentsForStimulus(t.stimuli.id);
		return {
			min: n[n.indexOf(t) - 1]?.rangeEnd ?? 0,
			max: t.rangeEnd - 1
		};
	}
	getValidRangeForFragmentEnd(e, t) {
		let n = this.fragments.find((t) => t.id === e), r = this.getSortedFragmentsForStimulus(n.stimuli.id), i = r.indexOf(n);
		return {
			min: n.rangeStart + 1,
			max: r[i + 1]?.rangeStart ?? t
		};
	}
	isTimeWithinExistingFragmentExcludingEnds(e, t) {
		return this.getFragmentsForStimulus(e).some((e) => e.rangeStart < t && e.rangeEnd > t);
	}
	getFragmentsAtTime(e, t) {
		return this.getFragmentsForStimulus(e).filter((e) => t >= e.rangeStart && t <= e.rangeEnd);
	}
	getNextFragment(e, t) {
		return this.getSortedFragmentsForStimulus(e).find((e) => e.rangeStart > t);
	}
	getPreviousFragment(e, t) {
		return this.getSortedFragmentsForStimulus(e).reverse().find((e) => e.rangeEnd < t);
	}
	validateFragmentRangeChange(e, t, n, r) {
		if (t < 0 || n > r || !(n > t)) return !1;
		let i = this.getValidRangeForFragment(e, r);
		return t >= i.min && n <= i.max;
	}
	isVideoSceneAnnotation() {
		return Fl.test(this.name.trim());
	}
	isVideoSceneAnnotationWithoutFragmentsForStimulus(e) {
		return this.isVideoSceneAnnotation() && !this.fragments.some((t) => t.stimuli.id === e);
	}
};
jl.map((e) => e.toUpperCase().replace("#", "#FF"));
//#endregion
//#region ../cloud-client/src/main/javascript/studydetailspage/export/VisualExport.ts
var Ll = class {
	id;
	type;
	requester;
	study;
	stimuli;
	userDefinedName;
	exportSelection;
	state;
	createdDate;
	processingStartedDate;
	processingFinishedDate;
	s3FileUrl;
	constructor(e) {
		this.id = e.id, this.type = e.type, this.requester = e.requester, this.study = e.study, this.stimuli = e.stimuli, this.userDefinedName = e.userDefinedName, this.exportSelection = typeof e.exportSelection == "string" ? JSON.parse(e.exportSelection) : e.exportSelection, this.state = e.state, this.createdDate = B(e.createdDate), this.processingStartedDate = B(e.processingStartedDate), this.processingFinishedDate = B(e.processingFinishedDate), this.s3FileUrl = e.s3FileUrl;
	}
}, Rl = class {
	visualExportId;
	uploadLocation;
	presignedUrl;
	stsUploadParameters;
	constructor(e) {
		this.visualExportId = e.visualExportId, this.uploadLocation = e.uploadLocation, this.presignedUrl = e.presignedUrl, this.stsUploadParameters = e.stsUploadParameters;
	}
}, zl = class {
	id;
	study;
	targetType;
	targetId;
	text;
	createdBy;
	createdByAiAgent;
	createdDate;
	constructor(e) {
		this.id = e.id, this.study = e.study, this.targetType = e.targetType, this.targetId = e.targetId, this.text = e.text, this.createdBy = e.createdBy ?? null, this.createdByAiAgent = e.createdByAiAgent, this.createdDate = B(e.createdDate);
	}
}, [Bl, Vl] = De(), Hl = class extends it {
	authenticateRequest(e) {
		this.token && (e.headers = {
			...e.headers,
			Authorization: `Bearer ${this.token}`
		});
	}
	getAccessToken(e, t) {
		return this.sendMultiRegionRequestMultiAnswer((n) => fetch(`${n.apiUrl}/token`, {
			method: "POST",
			...z({
				username: e,
				password: t,
				grant_type: "password"
			})
		}).then(rt).then(I(He)));
	}
	getAccessTokenWith2FA(e, t) {
		return this.sendRequest("/token/mfa", {
			method: "POST",
			...z({
				accessToken: e,
				totp: t
			})
		}, { retries: 0 }).then(I(He));
	}
	getAccessTokenByUserId(e) {
		return this.sendRequest("/token/controlled", {
			method: "POST",
			...z({ targetId: e })
		}).then(I(He));
	}
	enableMfa() {
		return this.sendRequest("/mfa/enable", { method: "POST" }).then((e) => e.json()).then((e) => e.otpAuth);
	}
	disableMfa() {
		return this.sendRequest("/mfa/disable", { method: "POST" }).then(() => void 0);
	}
	enableMfaValidateTotp(e) {
		return this.sendRequest("/mfa/verifyenablement", {
			method: "POST",
			...z({ totp: e })
		}).then((e) => e.json()).then((e) => e.recoveryCodes);
	}
	getApiKeys(e) {
		return this.sendRequest(`/companies/${e}/apiKeys`, { method: "GET" }).then(L(Mc));
	}
	createApiKey(e, t) {
		return this.sendRequest(`/companies/${e}/apiKeys`, {
			method: "POST",
			...R(t)
		}).then(I(Mc));
	}
	deleteApiKey(e, t) {
		return this.sendRequest(`/companies/${e}/apiKeys/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	getAccessTokenByGoogleToken(e, t) {
		return this.sendMultiRegionRequestMultiAnswer((n) => fetch(`${n.apiUrl}/token/google`, {
			method: "POST",
			...z({
				username: e,
				idToken: t
			})
		}).then(rt).then(I(He)));
	}
	getAccessTokenWithScope(e) {
		return this.sendRequest("/token/scope", {
			method: "POST",
			...z({ scope: e })
		}).then(I(He));
	}
	getAuthorizationCode(e, t, n) {
		return this.sendRequest(`/token/clients/${e}/code`, {
			method: "POST",
			...z({
				scope: t,
				code_challenge: n
			})
		}).then((e) => e.json()).then((e) => e.authorizationCode);
	}
	getOAuth2Client(e) {
		return this.sendRequest(`/token/clients/${e}`, { method: "GET" }).then(I(Ge));
	}
	deleteCurrentAccessToken() {
		return this.sendRequest("/token/", { method: "DELETE" }).then(() => {
			this.setCurrentRegion(null);
		});
	}
	getCurrentUser() {
		return this.sendRequest("/users/current", { method: "GET" }).then(I(Nc));
	}
	getCurrentCompany() {
		return this.sendRequest("/companies/current", { method: "GET" }).then(I(Pc));
	}
	getLicenseInformation() {
		return this.sendRequest("/license", { method: "GET" }).then(I(Jc));
	}
	unlockProductKey(e) {
		return this.sendRequest(`/license/${e}/unlock`, { method: "POST" }).then(() => void 0);
	}
	updateProductKeyExternalNote(e, t) {
		return this.sendRequest(`/license/${e}/externalnote`, {
			method: "POST",
			...R(t)
		}).then(() => void 0);
	}
	shareProductKey(e, t) {
		let n = new Xe({ email: t });
		return this.sendRequest(`/license/${e}/share?${n}`, { method: "POST" }).then(() => void 0);
	}
	getLatestDesktopVersion() {
		return this.sendRequest("/license/versions/latest", { method: "GET" }).then((e) => e.json());
	}
	updatePassword(e, t) {
		return this.sendRequest("/users/current/password", {
			method: "POST",
			...z({
				currentPassword: e,
				newPassword: t
			})
		}).then(() => void 0);
	}
	getCompanies() {
		return this.sendRequest("/companies/", { method: "GET" }).then(tt(Pc));
	}
	createCompany(e) {
		return this.sendRequest("/companies/", {
			method: "POST",
			...R(e)
		}).then(I(Pc));
	}
	createLab(e, t) {
		return this.sendRequest(`/companies/${e}/labs`, {
			method: "POST",
			...R(t)
		}).then(() => void 0);
	}
	createUsers(e, t) {
		let n = {
			retries: 0,
			timeout: 25e3
		};
		return this.sendRequest(`/companies/${e}/users`, {
			method: "POST",
			...R(t)
		}, n).then(L(Nc));
	}
	updateCompany(e) {
		return this.sendRequest(`/companies/${e.id}`, {
			method: "PUT",
			...R(e)
		}).then(I(Pc));
	}
	updateUser(e) {
		return this.sendRequest(`/users/${e.id}`, {
			method: "PUT",
			...R(e)
		}).then(I(Nc));
	}
	getLabs() {
		return this.sendRequest("/labs/", { method: "GET" }).then(tt(Kc));
	}
	updateLab(e, t) {
		return this.sendRequest(`/labs/${e}`, {
			method: "PUT",
			...R(t)
		}).then(() => void 0);
	}
	updateMachine(e) {
		return this.sendRequest(`/machines/${e.id}`, {
			method: "PUT",
			...R(e)
		}).then(() => void 0);
	}
	getDeletedStudies() {
		return this.sendRequest("/deleted/studies", { method: "GET" }).then(L(rl));
	}
	getActiveLabStudies() {
		return this.sendRequest("/studies/activeInLab", { method: "GET" }).then(L(kl));
	}
	getStudy(e, t) {
		return this.sendRequest(`/studies/${e}`, { method: "GET" }, t).then(I(kl));
	}
	getDeletedStudy(e) {
		return this.sendRequest(`/deleted/studies/${e}`, { method: "GET" }).then(I(kl));
	}
	async createImageOrVideoStimulus(e, t, n, r, i, a) {
		let o = await this.getStimuliAssetUploadCredentials(e, new yl({
			name: t.name,
			fileName: n.name,
			fileSize: n.size
		}), a);
		await this.uploadToPresignedUrlOrMultipartUsingSTSToken(o, n, i, a);
		let s = t.type, c;
		if (s === "VIDEO") {
			if (!r) throw Error("Video stimuli must have a thumbnail");
			c = await this.uploadThumbnail(e, o, r);
		}
		return this.createStimulus(e, {
			...t,
			fixedPosition: !0,
			id: o.assetId,
			videoUrl: s === "VIDEO" ? o.uploadLocation : null,
			imageUrl: s === "VIDEO" ? c : o.uploadLocation
		});
	}
	getStimuliAssetUploadCredentials(e, t, n) {
		return this.sendRequest(`/studies/${e}/stimuli/uploadKey`, {
			method: "POST",
			signal: n,
			...R(t)
		}).then(I(yl));
	}
	async uploadToPresignedUrlOrMultipartUsingSTSToken(e, t, n, r) {
		if (e.presignedUrl !== null) return this.uploadStimuliToPresignedUrl(e, t, r);
		await this.multipartUploadStimuliUsingSTSToken(e, t, n, r);
	}
	async multipartUploadStimuliUsingSTSToken(e, t, n, r) {
		let { uploadToS3: i } = await import("@common/aws/S3Utils");
		return i(t, e.stsUploadParameters, !1, r, n);
	}
	async uploadStimuliToPresignedUrl(e, t, n) {
		if (!e.presignedUrl) throw Error("Presigned url must be set");
		await fetch(e.presignedUrl, {
			method: "PUT",
			signal: n,
			body: t
		});
	}
	async uploadThumbnail(e, t, n) {
		let r = await this.getStimuliAssetUploadCredentials(e, new yl({
			assetId: t.assetId,
			fileName: n.name,
			fileSize: n.size
		}));
		return await this.uploadToPresignedUrlOrMultipartUsingSTSToken(r, n), r.uploadLocation;
	}
	createStimulus(e, t, n) {
		return this.sendRequest(`/studies/${e}/stimuli`, {
			method: "POST",
			signal: n,
			...R(t)
		}).then(I(bl));
	}
	processPredictiveStimuli(e, t) {
		return this.sendRequest(`/studies/${e}/affectiva/runpredictive`, {
			method: "POST",
			...R(t)
		}).then(() => void 0);
	}
	deleteStimulus(e, t, n) {
		return this.sendRequest(`/studies/${e}/stimuli/${t}/?blockId=${n}`, { method: "DELETE" }).then(() => void 0);
	}
	updateStudy(e, t) {
		return this.sendRequest(`/studies/${e.id}`, {
			method: "PUT",
			...R(e)
		}, t).then(I(kl));
	}
	deleteStudy(e) {
		return this.sendRequest(`/studies/${e}`, { method: "DELETE" }).then(() => void 0);
	}
	permanentlyDeleteStudy(e) {
		return this.sendRequest(`/studies/${e}`, { method: "DELETE" }).then(() => this.sendRequest(`/studies/${e}/permanent`, { method: "DELETE" })).then(() => void 0);
	}
	undeleteStudy(e) {
		return this.sendRequest(`/deleted/studies/${e}/undelete`, { method: "PUT" }).then(() => void 0);
	}
	setStudyEditors(e, t) {
		return this.sendRequest(`/studies/${e}/editors`, {
			method: "PUT",
			...R(t)
		}).then(() => void 0);
	}
	generateCloudNativeStudyDownload(e) {
		return this.sendRequest(`/deleted/studies/${e}/generateDownload`, { method: "PUT" }).then(() => void 0);
	}
	getCloudNativeDownloadUrl(e) {
		return this.sendRequest(`/deleted/studies/${e}/downloadUrl`, { method: "GET" }).then((e) => e.json()).then((e) => e.url);
	}
	async createRespondent(e) {
		return await this.sendRequest("/respondents/", {
			method: "POST",
			...R(e)
		}).then(I(Ol));
	}
	updateStudySession(e) {
		return this.sendRequest(`/respondents/sessions/${e.id}`, {
			method: "PUT",
			...R(e)
		}).then(() => void 0);
	}
	deleteSession(e) {
		return this.sendRequest(`/respondents/sessions/${e}`, { method: "DELETE" }).then(() => void 0);
	}
	createSegment(e) {
		return this.sendRequest(`/studies/${e.study.id}/segments`, {
			method: "POST",
			...R(e)
		}).then(I(il));
	}
	editNonDefaultOnlineSegment(e, t, n) {
		return this.sendRequest(`/studies/${e}/segment/${t}`, {
			method: "PUT",
			...R(n)
		}).then(() => void 0);
	}
	deleteNonDefaultOnlineSegment(e, t) {
		return this.sendRequest(`/studies/${e}/segment/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	createRemoteStudy(e, t, n) {
		return this.sendRequest(`/studies/${t ? `?targetFolderId=${t}` : ""}`, {
			method: "POST",
			...R({
				name: e,
				studyType: n
			})
		}).then(I(kl));
	}
	changeOtherPassword(e, t, n) {
		let r = { newPassword: t };
		return n && (r.token = n), this.sendRequest(`/users/${e}/password${n ? "/token" : ""}`, {
			method: "POST",
			...z(r)
		}).then(() => void 0);
	}
	getRespondentExposureData(e) {
		return Promise.resolve(fetch(e, { method: "GET" })).then(I(fc));
	}
	getSegmentExposureData(e) {
		return Promise.resolve(fetch(e, { method: "GET" })).then(I(dc));
	}
	getNormsData(e) {
		return this.sendRequest(`/studies/${e}/affectiva/norms`, { method: "GET" }).then(L(pc));
	}
	getVerificationToken(e) {
		return this.sendMultiRegionRequestSingleAnswer((t) => fetch(`${t.apiUrl}/verify/${e}`, { method: "GET" }).then(rt).then(I(Fc)));
	}
	async requestPasswordResetEmail(e) {
		let t = new Xe({ email: e });
		await Promise.any(this.forEachRegion((e) => fetch(`${e.apiUrl}/verify/reset/?${t}`, { method: "POST" })));
	}
	getAoiSets() {
		return this.sendRequest("/aoi/sets/", { method: "GET" }).then(tt(Ac));
	}
	getAoiSet(e, t = !1) {
		return this.sendRequest(`/aoi/sets/${e}?excludeUneditable=${t}`, { method: "GET" }).then(I(Ac));
	}
	getAoiStats(e) {
		return this.sendRequest(`/aoi/sets/${e}/stats/`, { method: "GET" }).then(L(jc));
	}
	createAoiSet(e) {
		return this.sendRequest("/aoi/sets/", {
			method: "POST",
			...R(e)
		}).then(I(Ac));
	}
	updateAoiSet(e) {
		return this.sendRequest(`/aoi/sets/${e.id}`, {
			method: "PUT",
			...R(e)
		}).then(I(Ac));
	}
	createAoiDefinition(e) {
		return this.sendRequest("/aoi/definitions/", {
			method: "POST",
			...R(e)
		}).then(I(kc));
	}
	updateAoiDefinitions(e, t) {
		return this.sendRequest("/aoi/definitions/", {
			method: "PUT",
			...R(e)
		}, t).then(L(kc));
	}
	deleteAoiDefinition(e) {
		return this.sendRequest(`/aoi/definitions/${e}`, { method: "DELETE" }).then(() => void 0);
	}
	queueStatsCalculation(e, t) {
		return this.sendRequest(`/aoi/sets/${e}/calculateAois${t ? "?force=true" : ""}`, { method: "PUT" }).then(I(Ac));
	}
	getZendeskLoginUrl() {
		return this.sendRequest("/sso/zendesk", { method: "GET" }).then((e) => e.json()).then((e) => e.url);
	}
	getDocument360LoginUrl() {
		return this.sendRequest("/sso/document360", { method: "GET" }).then((e) => e.json()).then((e) => e.url);
	}
	searchHelpCenter(e) {
		return this.sendRequest(`/help/search?query=${encodeURIComponent(e)}`, { method: "GET" }).then(et());
	}
	getHelpCenterArticle(e) {
		return this.sendRequest(`/help/articles/${e}`, { method: "GET" }).then(et());
	}
	getStudyExports(e) {
		return this.sendRequest(`/studies/${e}/exports`, { method: "GET" }).then(L(Al));
	}
	getSignalExports(e) {
		return this.sendRequest(`/studies/${e}/signal-exports`, { method: "GET" }).then(L(Al));
	}
	getAffdexStatsExports(e) {
		return this.sendRequest(`/studies/${e}/affdex-stats-exports`, { method: "GET" }).then(L(Al));
	}
	getRespirationSummaryMetrics(e) {
		return this.sendRequest(`/studies/${e}/respiration-exports`, { method: "GET" }).then(L(Al));
	}
	createStudyExport(e, t, n, r, i) {
		let a = "";
		return i && (a = `?upgradeToVersion=${i}`), this.sendRequest(`/studies/${e}/exports${a}`, {
			method: "POST",
			...R({
				name: t,
				respondentIds: n,
				selectionInformation: r
			})
		}).then(() => void 0);
	}
	createSignalExport(e, t) {
		return this.sendRequest(`/studies/${e}/signal-exports`, {
			method: "POST",
			...R(t)
		}).then(() => void 0);
	}
	createAffdexStatsExports(e, t) {
		return this.sendRequest(`/studies/${e}/affdex-stats-exports`, {
			method: "POST",
			...R(t)
		}).then(() => void 0);
	}
	createRespirationSummaryMetrics(e, t) {
		return this.sendRequest(`/studies/${e}/respiration-exports`, {
			method: "POST",
			...R(t)
		}).then(et());
	}
	getReportRuns(e) {
		return this.sendRequest(`/studies/${e}/reportruns`, { method: "GET" }).then(L(Zc));
	}
	generateReports(e, t, n = {}, r = !1) {
		return this.sendRequest(`/studies/${e}/reports/templates/${t}${r ? "?retry=true" : ""}`, {
			method: "POST",
			...R(n)
		}).then(() => void 0);
	}
	getReportTemplates() {
		return this.sendRequest("/reports/templates", { method: "GET" }).then(tt($c));
	}
	createReportTemplate(e, t) {
		let n = new FormData();
		return n.append("template", JSON.stringify(e)), t && n.append("file", t, t.name), this.sendRequest("/reports/templates", {
			method: "POST",
			body: n
		}).then(I($c));
	}
	updateReportTemplate(e, t, n) {
		let r = new FormData();
		return r.append("template", JSON.stringify(t)), n && r.append("file", n, n.name), this.sendRequest(`/reports/templates/${e}`, {
			method: "PUT",
			body: r
		}).then(I($c));
	}
	getVisualExports(e) {
		return this.sendRequest(`/studies/${e}/visualExport`, { method: "GET" }).then(L(Ll));
	}
	createVisualExport(e, t, n, r, i) {
		return this.sendRequest("/studies/visualExport", {
			method: "POST",
			...R({
				studyId: e,
				stimulusId: t,
				userDefinedName: n,
				type: r,
				exportSelection: i
			})
		}).then(I(Ll));
	}
	updateVisualExport(e, t, n, r) {
		return this.sendRequest(`/studies/${e}/visualExport/${t}`, {
			method: "POST",
			...R({
				state: n,
				s3FileUrl: r
			})
		}).then(I(Ll));
	}
	deleteVisualExport(e, t) {
		return this.sendRequest(`/studies/${e}/visualExport/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	deleteStudyExport(e, t) {
		return this.sendRequest(`/studies/${e}/studyExport/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	deleteSignalExport(e, t) {
		return this.sendRequest(`/studies/${e}/signal-exports/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	deleteAffdexStatsExport(e, t) {
		return this.sendRequest(`/studies/${e}/affdex-stats-exports/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	deleteRespirationSummaryMetrics(e, t) {
		return this.sendRequest(`/studies/${e}/respiration-exports/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	getVisualExportUploadCredentials(e, t, n, r) {
		return this.sendRequest(`/studies/${e}/visualExport/${t}/uploadKey`, {
			method: "POST",
			...R({
				fileName: n,
				fileSize: r
			})
		}).then(I(Rl));
	}
	getAnnotation(e, t) {
		return this.sendRequest(`/annotations/${e}/annotation/${t}`, { method: "GET" }).then(I(Il));
	}
	getAnnotations(e) {
		return this.sendRequest(`/annotations/${e}`, { method: "GET" }).then(L(Il));
	}
	createAnnotation(e, t) {
		return this.sendRequest(`/annotations/${e}/annotation`, {
			method: "POST",
			...R({ ...t })
		}).then(I(Il));
	}
	updateAnnotation(e, t) {
		return this.sendRequest(`/annotations/${e.study.id}/annotation`, {
			method: "PUT",
			...R(e)
		}, t).then(I(Il));
	}
	deleteAnnotation(e, t) {
		return this.sendRequest(`/annotations/${e}/annotation/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	createAnnotationFragment(e, t) {
		return this.sendRequest(`/annotations/${e}/annotationFragment`, {
			method: "POST",
			...R({ ...t })
		}).then(I(Pl));
	}
	updateAnnotationFragment(e, t, n) {
		return this.sendRequest(`/annotations/${e}/annotationFragment`, {
			method: "PUT",
			...R({ ...t })
		}, n).then(I(Pl));
	}
	deleteAnnotationFragment(e, t, n) {
		return this.sendRequest(`/annotations/${e}/annotationFragment/${t}`, { method: "DELETE" }, n).then(() => void 0);
	}
	getNotes(e) {
		return this.sendRequest(`/notes/${e}`, { method: "GET" }).then(L(zl));
	}
	createNote(e, t) {
		return this.sendRequest(`/notes/${e}`, {
			method: "POST",
			...R({ ...t })
		}).then(I(zl));
	}
	deleteNote(e, t) {
		return this.sendRequest(`/notes/${e}/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	toggleStimulusRespondentDataAnnotationDone(e, t, n) {
		return this.sendRequest(`/annotations/${e}/toggleStimulusRespondentCombination/${t}`, {
			method: "POST",
			...R({ done: n })
		}).then(() => void 0);
	}
	getStimuliRespondentDataPartialInfo(e) {
		return this.sendRequest(`/studies/${e}/stimuliRespondentDataPartialInfo`, { method: "GET" }).then(et());
	}
	acceptDataProcessingAgreement(e, t, n) {
		return this.sendRequest("/companies/dpa/", {
			method: "POST",
			...R({
				dpaVersion: e,
				companyId: t,
				userId: n
			})
		}).then(() => void 0);
	}
	getActivityInformation() {
		return this.sendRequest("/activities", { method: "GET" }).then(I(lc));
	}
	clearCompletedActivities() {
		return this.sendRequest("/activities/clear", { method: "POST" }).then(() => void 0);
	}
	updateActivityCheckDate() {
		return this.sendRequest("/activities/updateCheckDate", { method: "POST" }).then(() => void 0);
	}
	resyncCompany(e) {
		return this.sendRequest(`/companies/${e}/resync`, { method: "POST" }).then(() => void 0);
	}
	toggleRemoteDataCollection(e, t) {
		return this.sendRequest(`/datacollection/studies/${e}/toggleRemoteDataCollection/${t}`, { method: "POST" }).then(() => void 0);
	}
	requestRespondentZipUpload(e, t) {
		return this.sendRequest(`/datacollection/studies/${e}/sessions/${t}/finishedSessionUpload`, { method: "POST" }).then(I(Ke));
	}
	markRespondentUploadCompleted(e, t, n) {
		return this.sendRequest(`/datacollection/studies/${e}/sessions/${t}/uploadCompleted`, {
			method: "POST",
			...R({ zipFileName: n })
		}).then(() => void 0);
	}
	deleteRemoteSessionData(e, t) {
		return this.sendRequest(`/datacollection/studies/${e}/sessions/${t}/data`, { method: "DELETE" }).then(() => void 0);
	}
	submitOnlineUserFeedback(e, t, n, r) {
		let i = {
			feedbackText: e,
			urlWhenSubmitting: n
		};
		return t && (i.userEnteredEmail = t), r && (i.studyName = r), this.sendRequest("/usermessage/onlinefeedback", {
			method: "POST",
			...z(i)
		}).then(() => void 0);
	}
	async stripeInvoiceCheckout(e) {
		return (await fetch(`${this.settingsStore.getRegions()[0].apiUrl}/invoices/checkout`, {
			method: "POST",
			...R(e)
		})).json();
	}
	copyStudy(e, t, n) {
		return this.sendRequest(`/studies/${e}/copy`, {
			method: "POST",
			...R({
				name: t,
				targetFolderId: n
			})
		}).then((e) => e.json());
	}
	updateBlocks(e, t, n) {
		return this.sendRequest(`/studies/${e}/blocks`, {
			method: "POST",
			...R(t)
		}, n).then(() => void 0);
	}
	updateBlockChildren(e, t, n) {
		return this.sendRequest(`/studies/${e}/blockChildren`, {
			method: "POST",
			...R(t)
		}, n).then(() => void 0);
	}
	createBlock(e, t, n) {
		return this.sendRequest(`/studies/${e}/blocks`, {
			method: "PUT",
			...R({
				name: n,
				parentBlockId: t
			})
		}).then(et());
	}
	copyBlocks(e, t, n) {
		return this.sendRequest(`/studies/${e}/blocks/copy${n ? `?targetStimuliBlockId=${n}` : ""}`, {
			method: "PUT",
			...R(t)
		}).then(et());
	}
	deleteBlock(e, t) {
		return this.sendRequest(`/studies/${e}/blocks/${t}`, { method: "DELETE" }).then(() => void 0);
	}
	createBlockChildrenWithExistingStimuli(e, t, n) {
		return this.sendRequest(`/studies/${e}/stimuliBlock/${n}/blockChildren`, {
			method: "PUT",
			...R(t)
		}).then(et());
	}
	createSupportTicket({ problemDescription: e, reproSteps: t, consistency: n, studyId: r, studyName: i, dataCollectionVersion: a, product: o, url: s, studyIdFromUrl: c, studyNameFromUrl: l, dataCollectionVersionFromUrl: u, userEnteredEmail: d, consentToAccessStudy: f, userAgentInfo: p, attachments: m }) {
		let h = new FormData();
		return h.append("problemDescription", e), h.append("reproSteps", t), n && h.append("consistency", n), r && h.append("studyId", r), i && h.append("studyName", i), a && h.append("dataCollectionVersion", a), o && h.append("product", o), h.append("url", s), c && h.append("studyIdFromUrl", c), l && h.append("studyNameFromUrl", l), u && h.append("dataCollectionVersionFromUrl", u), d && h.append("userEnteredEmail", d), h.append("userAgentInfo", p), h.append("consentToAccessStudy", f.toString()), m.length && m.forEach((e) => {
			h.append("files", e, e.name), h.append("fileTypeList", e.type);
		}), this.sendRequest("/usermessage/supportrequest", {
			method: "POST",
			body: h
		}).then(() => void 0);
	}
	getFolder(e) {
		return this.sendRequest(`/folders/${e}`, { method: "GET" }).then(I(Hc));
	}
	async getFolders() {
		return (await (await this.sendRequest("/folders", { method: "GET" })).json()).map((e) => {
			switch (e.type) {
				case "Folder": return new Hc(e);
				case "StudyItem": return new Vc(e);
				case "StudyCopyItem": return new Bc(e);
				case "FileItem": return new zc(e);
				default: throw Error(`Unknown folder type: ${e.type}`);
			}
		});
	}
	createFolder(e, t) {
		return this.sendRequest(`/folders/${t}`, {
			method: "POST",
			...R({ name: e })
		}).then(I(Hc));
	}
	deleteFolder(e, t) {
		return this.sendRequest(`/folders/${e}?version=${t}`, { method: "DELETE" }).then(() => void 0);
	}
	getStudyItem(e, t) {
		return this.sendRequest(`/folders/${e}/item`, {
			method: "POST",
			...R({ studyId: t })
		}).then(I(Vc));
	}
	updateFolderItem(e, t, n) {
		return this.sendRequest(`/folders/${t}/items/${e.id}`, {
			method: "PUT",
			...R(e)
		}, n).then((t) => {
			switch (e.type) {
				case "Folder": return I(Hc)(t);
				case "StudyItem": return I(Vc)(t);
				case "StudyCopyItem": return I(Bc)(t);
				case "FileItem": return I(zc)(t);
			}
		});
	}
	getStudiesVersions(e) {
		return this.sendRequest("/studies/versions", {
			method: "POST",
			...R(e)
		}).then(et());
	}
	getStudiesNames() {
		return this.sendRequest("/studies/names", { method: "GET" }).then(et());
	}
	createAnnotationFragmentImage(e, t, n, r) {
		let i = new FormData();
		return i.append("file", n, n.name), i.append("file.size", `${n.size}`), Object.entries(r).forEach(([e, t]) => {
			t !== void 0 && i.append(e, t);
		}), this.sendRequest(`/annotations/${e}/annotationFragment/${t}/image`, {
			method: "POST",
			body: i
		}).then(() => void 0);
	}
	createFile(e, t, n) {
		let r = new FormData();
		return r.append("file", e, e.name), r.append("file.size", `${e.size}`), n && (r.append("thumbnail", n, n.name), r.append("thumbnail.size", `${n.size}`)), Object.entries(t).forEach(([e, t]) => {
			t !== void 0 && r.append(e, t);
		}), this.sendRequest("/files", {
			method: "POST",
			body: r
		}).then(I(Rc));
	}
	deleteFile(e) {
		return this.sendRequest(`/files/${e}`, { method: "DELETE" }).then(() => void 0);
	}
	copyFileIntoStudy(e, t) {
		return this.sendRequest(`/files/${e}/copy/${t}`, { method: "POST" }).then((e) => e.json());
	}
	pushToPanelProvider(e, t, n) {
		return this.sendRequest(`/studies/${e}/panelprovider`, {
			method: "POST",
			...R({
				type: t,
				durationMins: n
			})
		}).then(() => void 0);
	}
	addPanelProviderSettings(e, t) {
		return this.sendRequest("/companies/current/panelprovider", {
			method: "POST",
			...R({
				type: e,
				apiKey: t
			})
		}).then(() => void 0);
	}
	getCompanySessionMetrics() {
		return this.sendRequest("/companies/current/studies/statistics", { method: "GET" }).then(I(nl));
	}
}, J = class extends Error {}, Ul = 10, Wl = async (e, t) => {
	let n = [];
	for (let r of A(e, Ul)) n.push(...await Promise.all(r.map(t)));
	return n;
}, Gl = (e, t) => {
	let n = e.segments.find((e) => e.name.toLocaleLowerCase() === t.toLocaleLowerCase());
	if (!n) throw new J(`Segment named ${t} not found in study ${e.name}. Available segments:\n${e.getOrderedSegments().map((e) => e.name).join("\n")}`);
	return n;
}, Kl = (e, t) => {
	let n = e.stimuli.find((e) => e.displayName.toLocaleLowerCase() === t.toLocaleLowerCase());
	if (!n) throw new J(`Stimulus named ${t} not found in study ${e.name}. Available stimuli:\n${e.stimuli.toSorted((e, t) => e.displayName.localeCompare(t.displayName, void 0, { numeric: !0 })).map((e) => e.displayName).join("\n")}`);
	return n;
}, ql = (e, t) => {
	let n = e.respondents.find((e) => e.label.toLocaleLowerCase() === t.toLocaleLowerCase());
	if (!n) throw new J(`Respondent with label ${t} not found in study ${e.name}. Available respondents:\n${e.respondents.map((e) => e.label).join("\n")}`);
	return n;
}, Jl = ["STUDY", "ANALYSIS"], Yl = class extends Hl {
	version;
	constructor(e, t, n) {
		super(e, n), this.version = t;
	}
	authenticateRequest(e) {
		super.authenticateRequest(e), e.headers = {
			...e.headers,
			"User-Agent": `ai-cli/${this.version}`
		};
	}
	getAuthorizationHeader() {
		return `Bearer ${this.token}`;
	}
	useAuthorizationCode(e, t) {
		return this.sendMultiRegionRequestSingleAnswer((n) => fetch(`${n.apiUrl}/token`, {
			method: "POST",
			...z({
				client_id: e,
				code_verifier: t,
				grant_type: "authorization_code"
			})
		}).then(rt).then(I(He)));
	}
	async ping() {
		let e = this.settingsStore.getRegions(), t = e.find((e) => e.id === "us") ?? e[0];
		return fetch(`${t.apiUrl.slice(0, -4)}/admin/ping`).then(rt);
	}
	async getStudyByName(e) {
		let t = await this.getStudiesNames(), n = Object.entries(t).find(([, t]) => t.toLocaleLowerCase() === e.toLocaleLowerCase());
		if (!n) throw new J(`Unable to find study named ${e}. Available studies:\n${Object.values(t).toSorted((e, t) => e.localeCompare(t, void 0, { numeric: !0 })).join("\n")}`);
		return await this.getStudy(n[0]);
	}
}, Xl = [
	{
		id: "us",
		name: "United States",
		apiUrl: "https://my.imotions.com/api",
		dataCollectionUrl: "https://my.imotions.com/collect/",
		mcpUrl: "https://mcp-us.imotions.com",
		uiUrl: "https://my.imotions.com"
	},
	{
		id: "eu",
		name: "European Union",
		apiUrl: "https://eu.imotions.com/api",
		dataCollectionUrl: "https://my.imotions.com/collect/",
		mcpUrl: "https://mcp-eu.imotions.com",
		uiUrl: "https://my.imotions.com"
	},
	{
		id: "test-us",
		name: "United States (Test)",
		apiUrl: "https://test-my.imotions.com/api",
		dataCollectionUrl: "https://test-my.imotions.com/collect/",
		mcpUrl: "https://mcp-test-us.imotions.com",
		uiUrl: "https://test-my.imotions.com"
	},
	{
		id: "test-eu",
		name: "European Union (Test)",
		apiUrl: "https://test-eu.imotions.com/api",
		dataCollectionUrl: "https://test-eu.imotions.com/collect/",
		mcpUrl: "https://mcp-test-eu.imotions.com",
		uiUrl: "https://test-eu.imotions.com"
	},
	...[]
], Zl = () => {
	let e = process.env.IMOTIONS_TEST_REGIONS;
	if (e) try {
		return JSON.parse(e);
	} catch {
		throw Error("Invalid JSON in IMOTIONS_TEST_REGIONS env var.");
	}
	return Xl;
}, Ql = "11c69b10-4392-4d33-a94b-8279799b5669", $l = 6e5, eu = (e) => `${e}-temp`, tu = () => `2026-08-19-1cc4cfbe6-${o.isSea() ? "sea" : "script"}`, nu = async (e, t) => {
	let n = a.randomBytes(32).toString("base64url"), o = a.createHash("sha256").update(n).digest("base64url");
	await i.promises.writeFile(eu(e), JSON.stringify({
		codeVerifier: n,
		time: Date.now()
	}, null, 4), { mode: 384 });
	let s = `${t.uiUrl}#oauth2?client_id=${Ql}&response_type=code&scope=${Jl.join("%20")}&code_challenge=${o}`;
	process.env.IMOTIONS_TEST_REGIONS || (process.platform === "win32" ? r.exec(`start "" "${s}"`) : process.platform === "darwin" ? r.exec(`open "${s}"`) : r.exec(`xdg-open "${s}"`)), console.log(`Authentication required. Please open ${s} in your browser to authenticate with your iMotions account. Then run the command again.`);
}, ru = async (e) => {
	try {
		await i.promises.unlink(e);
	} catch {}
	try {
		await i.promises.unlink(eu(e));
	} catch {}
}, iu = async (e) => {
	let t = new Ve({
		CONFIG: { regions: Zl() },
		BUILD: {}
	}).initialize(), n = new Yl(t, tu(), { location: { origin: "" } }), r = t.getRegions().find((e) => e.id === "us") ?? t.getRegions()[0];
	if (!i.existsSync(e)) {
		let a = eu(e);
		if (!i.existsSync(a)) {
			try {
				await n.ping();
			} catch {
				throw new J("Unable to access the iMotions server. Please check that Claude is allowed to communicate with iMotions.\nIn Claude, find Settings -> Capabilities -> Allow network egress. Make sure it is turned on and that `*.imotions.com` is in the list of additional allowed domains.\nIf you are on a team plan, you will need to ask your organization admin to set this up.\nThen start a new session in Claude and try again.");
			}
			await nu(e, r);
			return;
		}
		let o = JSON.parse(await i.promises.readFile(a, "utf-8"));
		if (!o.codeVerifier || !o.time) {
			await ru(e), await nu(e, r);
			return;
		}
		if (o.time + $l < Date.now()) {
			console.log("Authentication request has expired. Starting over."), await ru(e), await nu(e, r);
			return;
		}
		let s;
		try {
			s = await n.useAuthorizationCode(Ql, o.codeVerifier);
		} catch {
			throw new J("Authentication request has not been accepted in the browser yet.");
		}
		let c = {
			regionId: t.getCurrentRegion().id,
			accessToken: s.accessToken
		};
		await i.promises.writeFile(e, JSON.stringify(c, null, 4), { mode: 384 }), await i.promises.unlink(eu(e));
	}
	let a = JSON.parse(await i.promises.readFile(e, "utf-8"));
	if (!a.regionId || !a.accessToken) throw Error(`regionId and accessToken must be specified in ${e}`);
	if (!t.getRegions().find((e) => e.id === a.regionId)) throw Error(`Region ${a.regionId} not found`);
	return t.setCurrentRegion(a.regionId), n.setAuthToken(a.accessToken), n.onUnauthorized(async () => {
		console.log("Existing authentication token not valid. Please authenticate again."), await ru(e);
	}), {
		api: n,
		region: t.getCurrentRegion()
	};
}, au;
function Y(e, t, n) {
	function r(n, r) {
		if (n._zod || Object.defineProperty(n, "_zod", {
			value: {
				def: r,
				constr: o,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: !1
		}), n._zod.traits.has(e)) return;
		n._zod.traits.add(e), t(n, r);
		let i = o.prototype, a = Object.keys(i);
		for (let e = 0; e < a.length; e++) {
			let t = a[e];
			t in n || (n[t] = i[t].bind(n));
		}
	}
	let i = n?.Parent ?? Object;
	class a extends i {}
	Object.defineProperty(a, "name", { value: e });
	function o(e) {
		var t;
		let i = n?.Parent ? new a() : this;
		r(i, e), (t = i._zod).deferred ?? (t.deferred = []);
		for (let e of i._zod.deferred) e();
		return i;
	}
	return Object.defineProperty(o, "init", { value: r }), Object.defineProperty(o, Symbol.hasInstance, { value: (t) => n?.Parent && t instanceof n.Parent ? !0 : t?._zod?.traits?.has(e) }), Object.defineProperty(o, "name", { value: e }), o;
}
var ou = class extends Error {
	constructor() {
		super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
	}
}, su = class extends Error {
	constructor(e) {
		super(`Encountered unidirectional transform during encode: ${e}`), this.name = "ZodEncodeError";
	}
};
(au = globalThis).__zod_globalConfig ?? (au.__zod_globalConfig = {});
var cu = globalThis.__zod_globalConfig;
function lu(e) {
	return e && Object.assign(cu, e), cu;
}
//#endregion
//#region ../node_modules/zod/v4/core/util.js
function uu(e) {
	let t = Object.values(e).filter((e) => typeof e == "number");
	return Object.entries(e).filter(([e, n]) => t.indexOf(+e) === -1).map(([e, t]) => t);
}
function du(e, t) {
	return typeof t == "bigint" ? t.toString() : t;
}
function fu(e) {
	return { get value() {
		{
			let t = e();
			return Object.defineProperty(this, "value", { value: t }), t;
		}
		throw Error("cached value already set");
	} };
}
function pu(e) {
	return e == null;
}
function mu(e) {
	let t = +!!e.startsWith("^"), n = e.endsWith("$") ? e.length - 1 : e.length;
	return e.slice(t, n);
}
var hu = /* @__PURE__ */ Symbol("evaluating");
function gu(e, t, n) {
	let r;
	Object.defineProperty(e, t, {
		get() {
			if (r !== hu) return r === void 0 && (r = hu, r = n()), r;
		},
		set(n) {
			Object.defineProperty(e, t, { value: n });
		},
		configurable: !0
	});
}
function _u(e, t, n) {
	Object.defineProperty(e, t, {
		value: n,
		writable: !0,
		enumerable: !0,
		configurable: !0
	});
}
function vu(...e) {
	let t = {};
	for (let n of e) Object.assign(t, Object.getOwnPropertyDescriptors(n));
	return Object.defineProperties({}, t);
}
function yu(e) {
	return JSON.stringify(e);
}
function bu(e) {
	return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var xu = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function Su(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
var Cu = /* @__PURE__ */ fu(() => {
	if (cu.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1;
	try {
		return Function(""), !0;
	} catch {
		return !1;
	}
});
function wu(e) {
	if (Su(e) === !1) return !1;
	let t = e.constructor;
	if (t === void 0 || typeof t != "function") return !0;
	let n = t.prototype;
	return !(Su(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Tu(e) {
	return wu(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
var Eu = /* @__PURE__ */ new Set([
	"string",
	"number",
	"symbol"
]);
function Du(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ou(e, t, n) {
	let r = new e._zod.constr(t ?? e._zod.def);
	return (!t || n?.parent) && (r._zod.parent = e), r;
}
function X(e) {
	let t = e;
	if (!t) return {};
	if (typeof t == "string") return { error: () => t };
	if (t?.message !== void 0) {
		if (t?.error !== void 0) throw Error("Cannot specify both `message` and `error` params");
		t.error = t.message;
	}
	return delete t.message, typeof t.error == "string" ? {
		...t,
		error: () => t.error
	} : t;
}
function ku(e) {
	return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
-Number.MAX_VALUE, Number.MAX_VALUE;
function Au(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".pick() cannot be used on object schemas containing refinements");
	return Ou(e, vu(e._zod.def, {
		get shape() {
			let e = {};
			for (let r in t) {
				if (!(r in n.shape)) throw Error(`Unrecognized key: "${r}"`);
				t[r] && (e[r] = n.shape[r]);
			}
			return _u(this, "shape", e), e;
		},
		checks: []
	}));
}
function ju(e, t) {
	let n = e._zod.def, r = n.checks;
	if (r && r.length > 0) throw Error(".omit() cannot be used on object schemas containing refinements");
	return Ou(e, vu(e._zod.def, {
		get shape() {
			let r = { ...e._zod.def.shape };
			for (let e in t) {
				if (!(e in n.shape)) throw Error(`Unrecognized key: "${e}"`);
				t[e] && delete r[e];
			}
			return _u(this, "shape", r), r;
		},
		checks: []
	}));
}
function Mu(e, t) {
	if (!wu(t)) throw Error("Invalid input to extend: expected a plain object");
	let n = e._zod.def.checks;
	if (n && n.length > 0) {
		let n = e._zod.def.shape;
		for (let e in t) if (Object.getOwnPropertyDescriptor(n, e) !== void 0) throw Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return Ou(e, vu(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return _u(this, "shape", n), n;
	} }));
}
function Nu(e, t) {
	if (!wu(t)) throw Error("Invalid input to safeExtend: expected a plain object");
	return Ou(e, vu(e._zod.def, { get shape() {
		let n = {
			...e._zod.def.shape,
			...t
		};
		return _u(this, "shape", n), n;
	} }));
}
function Pu(e, t) {
	if (e._zod.def.checks?.length) throw Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	return Ou(e, vu(e._zod.def, {
		get shape() {
			let n = {
				...e._zod.def.shape,
				...t._zod.def.shape
			};
			return _u(this, "shape", n), n;
		},
		get catchall() {
			return t._zod.def.catchall;
		},
		checks: t._zod.def.checks ?? []
	}));
}
function Fu(e, t, n) {
	let r = t._zod.def.checks;
	if (r && r.length > 0) throw Error(".partial() cannot be used on object schemas containing refinements");
	return Ou(t, vu(t._zod.def, {
		get shape() {
			let r = t._zod.def.shape, i = { ...r };
			if (n) for (let t in n) {
				if (!(t in r)) throw Error(`Unrecognized key: "${t}"`);
				n[t] && (i[t] = e ? new e({
					type: "optional",
					innerType: r[t]
				}) : r[t]);
			}
			else for (let t in r) i[t] = e ? new e({
				type: "optional",
				innerType: r[t]
			}) : r[t];
			return _u(this, "shape", i), i;
		},
		checks: []
	}));
}
function Iu(e, t, n) {
	return Ou(t, vu(t._zod.def, { get shape() {
		let r = t._zod.def.shape, i = { ...r };
		if (n) for (let t in n) {
			if (!(t in i)) throw Error(`Unrecognized key: "${t}"`);
			n[t] && (i[t] = new e({
				type: "nonoptional",
				innerType: r[t]
			}));
		}
		else for (let t in r) i[t] = new e({
			type: "nonoptional",
			innerType: r[t]
		});
		return _u(this, "shape", i), i;
	} }));
}
function Lu(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue !== !0) return !0;
	return !1;
}
function Ru(e, t = 0) {
	if (e.aborted === !0) return !0;
	for (let n = t; n < e.issues.length; n++) if (e.issues[n]?.continue === !1) return !0;
	return !1;
}
function zu(e, t) {
	return t.map((t) => {
		var n;
		return (n = t).path ?? (n.path = []), t.path.unshift(e), t;
	});
}
function Bu(e) {
	return typeof e == "string" ? e : e?.message;
}
function Vu(e, t, n) {
	let r = e.message ? e.message : Bu(e.inst?._zod.def?.error?.(e)) ?? Bu(t?.error?.(e)) ?? Bu(n.customError?.(e)) ?? Bu(n.localeError?.(e)) ?? "Invalid input", { inst: i, continue: a, input: o, ...s } = e;
	return s.path ??= [], s.message = r, t?.reportInput && (s.input = o), s;
}
function Hu(e) {
	return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Uu(...e) {
	let [t, n, r] = e;
	return typeof t == "string" ? {
		message: t,
		code: "custom",
		input: n,
		inst: r
	} : { ...t };
}
//#endregion
//#region ../node_modules/zod/v4/core/errors.js
var Wu = (e, t) => {
	e.name = "$ZodError", Object.defineProperty(e, "_zod", {
		value: e._zod,
		enumerable: !1
	}), Object.defineProperty(e, "issues", {
		value: t,
		enumerable: !1
	}), e.message = JSON.stringify(t, du, 2), Object.defineProperty(e, "toString", {
		value: () => e.message,
		enumerable: !1
	});
}, Gu = Y("$ZodError", Wu), Ku = Y("$ZodError", Wu, { Parent: Error });
function qu(e, t = (e) => e.message) {
	let n = {}, r = [];
	for (let i of e.issues) i.path.length > 0 ? (n[i.path[0]] = n[i.path[0]] || [], n[i.path[0]].push(t(i))) : r.push(t(i));
	return {
		formErrors: r,
		fieldErrors: n
	};
}
function Ju(e, t = (e) => e.message) {
	let n = { _errors: [] }, r = (e, i = []) => {
		for (let a of e.issues) if (a.code === "invalid_union" && a.errors.length) a.errors.map((e) => r({ issues: e }, [...i, ...a.path]));
		else if (a.code === "invalid_key") r({ issues: a.issues }, [...i, ...a.path]);
		else if (a.code === "invalid_element") r({ issues: a.issues }, [...i, ...a.path]);
		else {
			let e = [...i, ...a.path];
			if (e.length === 0) n._errors.push(t(a));
			else {
				let r = n, i = 0;
				for (; i < e.length;) {
					let n = e[i];
					i === e.length - 1 ? (r[n] = r[n] || { _errors: [] }, r[n]._errors.push(t(a))) : r[n] = r[n] || { _errors: [] }, r = r[n], i++;
				}
			}
		}
	};
	return r(e), n;
}
//#endregion
//#region ../node_modules/zod/v4/core/parse.js
var Yu = (e) => (t, n, r, i) => {
	let a = r ? {
		...r,
		async: !1
	} : { async: !1 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise) throw new ou();
	if (o.issues.length) {
		let t = new (i?.Err ?? e)(o.issues.map((e) => Vu(e, a, lu())));
		throw xu(t, i?.callee), t;
	}
	return o.value;
}, Xu = (e) => async (t, n, r, i) => {
	let a = r ? {
		...r,
		async: !0
	} : { async: !0 }, o = t._zod.run({
		value: n,
		issues: []
	}, a);
	if (o instanceof Promise && (o = await o), o.issues.length) {
		let t = new (i?.Err ?? e)(o.issues.map((e) => Vu(e, a, lu())));
		throw xu(t, i?.callee), t;
	}
	return o.value;
}, Zu = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		async: !1
	} : { async: !1 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	if (a instanceof Promise) throw new ou();
	return a.issues.length ? {
		success: !1,
		error: new (e ?? Gu)(a.issues.map((e) => Vu(e, i, lu())))
	} : {
		success: !0,
		data: a.value
	};
}, Qu = /* @__PURE__ */ Zu(Ku), $u = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		async: !0
	} : { async: !0 }, a = t._zod.run({
		value: n,
		issues: []
	}, i);
	return a instanceof Promise && (a = await a), a.issues.length ? {
		success: !1,
		error: new e(a.issues.map((e) => Vu(e, i, lu())))
	} : {
		success: !0,
		data: a.value
	};
}, ed = /* @__PURE__ */ $u(Ku), td = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Yu(e)(t, n, i);
}, nd = (e) => (t, n, r) => Yu(e)(t, n, r), rd = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Xu(e)(t, n, i);
}, id = (e) => async (t, n, r) => Xu(e)(t, n, r), ad = (e) => (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return Zu(e)(t, n, i);
}, od = (e) => (t, n, r) => Zu(e)(t, n, r), sd = (e) => async (t, n, r) => {
	let i = r ? {
		...r,
		direction: "backward"
	} : { direction: "backward" };
	return $u(e)(t, n, i);
}, cd = (e) => async (t, n, r) => $u(e)(t, n, r), ld = /^[cC][0-9a-z]{6,}$/, ud = /^[0-9a-z]+$/, dd = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, fd = /^[0-9a-vA-V]{20}$/, pd = /^[A-Za-z0-9]{27}$/, md = /^[a-zA-Z0-9_-]{21}$/, hd = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, gd = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, _d = (e) => e ? RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, vd = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, yd = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function bd() {
	return new RegExp(yd, "u");
}
var xd = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Sd = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Cd = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, wd = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Td = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Ed = /^[A-Za-z0-9_-]*$/, Dd = /^https?$/, Od = /^\+[1-9]\d{6,14}$/, kd = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", Ad = /* @__PURE__ */ RegExp(`^${kd}$`);
function jd(e) {
	let t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
	return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Md(e) {
	return RegExp(`^${jd(e)}$`);
}
function Nd(e) {
	let t = jd({ precision: e.precision }), n = ["Z"];
	e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
	let r = `${t}(?:${n.join("|")})`;
	return RegExp(`^${kd}T(?:${r})$`);
}
var Pd = (e) => {
	let t = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
	return RegExp(`^${t}$`);
}, Fd = /^(?:true|false)$/i, Id = /^[^A-Z]*$/, Ld = /^[^a-z]*$/, Rd = /* @__PURE__ */ Y("$ZodCheck", (e, t) => {
	var n;
	e._zod ??= {}, e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), zd = /* @__PURE__ */ Y("$ZodCheckMaxLength", (e, t) => {
	var n;
	Rd.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !pu(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.maximum ?? Infinity;
		t.maximum < n && (e._zod.bag.maximum = t.maximum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length <= t.maximum) return;
		let i = Hu(r);
		n.issues.push({
			origin: i,
			code: "too_big",
			maximum: t.maximum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Bd = /* @__PURE__ */ Y("$ZodCheckMinLength", (e, t) => {
	var n;
	Rd.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !pu(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag.minimum ?? -Infinity;
		t.minimum > n && (e._zod.bag.minimum = t.minimum);
	}), e._zod.check = (n) => {
		let r = n.value;
		if (r.length >= t.minimum) return;
		let i = Hu(r);
		n.issues.push({
			origin: i,
			code: "too_small",
			minimum: t.minimum,
			inclusive: !0,
			input: r,
			inst: e,
			continue: !t.abort
		});
	};
}), Vd = /* @__PURE__ */ Y("$ZodCheckLengthEquals", (e, t) => {
	var n;
	Rd.init(e, t), (n = e._zod.def).when ?? (n.when = (e) => {
		let t = e.value;
		return !pu(t) && t.length !== void 0;
	}), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.minimum = t.length, n.maximum = t.length, n.length = t.length;
	}), e._zod.check = (n) => {
		let r = n.value, i = r.length;
		if (i === t.length) return;
		let a = Hu(r), o = i > t.length;
		n.issues.push({
			origin: a,
			...o ? {
				code: "too_big",
				maximum: t.length
			} : {
				code: "too_small",
				minimum: t.length
			},
			inclusive: !0,
			exact: !0,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Hd = /* @__PURE__ */ Y("$ZodCheckStringFormat", (e, t) => {
	var n, r;
	Rd.init(e, t), e._zod.onattach.push((e) => {
		let n = e._zod.bag;
		n.format = t.format, t.pattern && (n.patterns ??= /* @__PURE__ */ new Set(), n.patterns.add(t.pattern));
	}), t.pattern ? (n = e._zod).check ?? (n.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: t.format,
			input: n.value,
			...t.pattern ? { pattern: t.pattern.toString() } : {},
			inst: e,
			continue: !t.abort
		});
	}) : (r = e._zod).check ?? (r.check = () => {});
}), Ud = /* @__PURE__ */ Y("$ZodCheckRegex", (e, t) => {
	Hd.init(e, t), e._zod.check = (n) => {
		t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: n.value,
			pattern: t.pattern.toString(),
			inst: e,
			continue: !t.abort
		});
	};
}), Wd = /* @__PURE__ */ Y("$ZodCheckLowerCase", (e, t) => {
	t.pattern ??= Id, Hd.init(e, t);
}), Gd = /* @__PURE__ */ Y("$ZodCheckUpperCase", (e, t) => {
	t.pattern ??= Ld, Hd.init(e, t);
}), Kd = /* @__PURE__ */ Y("$ZodCheckIncludes", (e, t) => {
	Rd.init(e, t);
	let n = Du(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
	t.pattern = r, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(r);
	}), e._zod.check = (n) => {
		n.value.includes(t.includes, t.position) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: t.includes,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), qd = /* @__PURE__ */ Y("$ZodCheckStartsWith", (e, t) => {
	Rd.init(e, t);
	let n = RegExp(`^${Du(t.prefix)}.*`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.startsWith(t.prefix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: t.prefix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Jd = /* @__PURE__ */ Y("$ZodCheckEndsWith", (e, t) => {
	Rd.init(e, t);
	let n = RegExp(`.*${Du(t.suffix)}$`);
	t.pattern ??= n, e._zod.onattach.push((e) => {
		let t = e._zod.bag;
		t.patterns ??= /* @__PURE__ */ new Set(), t.patterns.add(n);
	}), e._zod.check = (n) => {
		n.value.endsWith(t.suffix) || n.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: t.suffix,
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Yd = /* @__PURE__ */ Y("$ZodCheckOverwrite", (e, t) => {
	Rd.init(e, t), e._zod.check = (e) => {
		e.value = t.tx(e.value);
	};
}), Xd = class {
	constructor(e = []) {
		this.content = [], this.indent = 0, this && (this.args = e);
	}
	indented(e) {
		this.indent += 1, e(this), --this.indent;
	}
	write(e) {
		if (typeof e == "function") {
			e(this, { execution: "sync" }), e(this, { execution: "async" });
			return;
		}
		let t = e.split("\n").filter((e) => e), n = Math.min(...t.map((e) => e.length - e.trimStart().length)), r = t.map((e) => e.slice(n)).map((e) => " ".repeat(this.indent * 2) + e);
		for (let e of r) this.content.push(e);
	}
	compile() {
		let e = Function, t = this?.args, n = [...(this?.content ?? [""]).map((e) => `  ${e}`)];
		return new e(...t, n.join("\n"));
	}
}, Zd = {
	major: 4,
	minor: 4,
	patch: 3
}, Qd = /* @__PURE__ */ Y("$ZodType", (e, t) => {
	var n;
	e ??= {}, e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Zd;
	let r = [...e._zod.def.checks ?? []];
	e._zod.traits.has("$ZodCheck") && r.unshift(e);
	for (let t of r) for (let n of t._zod.onattach) n(e);
	if (r.length === 0) (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
		e._zod.run = e._zod.parse;
	});
	else {
		let t = (e, t, n) => {
			let r = Lu(e), i;
			for (let a of t) {
				if (a._zod.def.when) {
					if (Ru(e) || !a._zod.def.when(e)) continue;
				} else if (r) continue;
				let t = e.issues.length, o = a._zod.check(e);
				if (o instanceof Promise && n?.async === !1) throw new ou();
				if (i || o instanceof Promise) i = (i ?? Promise.resolve()).then(async () => {
					await o, e.issues.length !== t && (r ||= Lu(e, t));
				});
				else {
					if (e.issues.length === t) continue;
					r ||= Lu(e, t);
				}
			}
			return i ? i.then(() => e) : e;
		}, n = (n, i, a) => {
			if (Lu(n)) return n.aborted = !0, n;
			let o = t(i, r, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new ou();
				return o.then((t) => e._zod.parse(t, a));
			}
			return e._zod.parse(o, a);
		};
		e._zod.run = (i, a) => {
			if (a.skipChecks) return e._zod.parse(i, a);
			if (a.direction === "backward") {
				let t = e._zod.parse({
					value: i.value,
					issues: []
				}, {
					...a,
					skipChecks: !0
				});
				return t instanceof Promise ? t.then((e) => n(e, i, a)) : n(t, i, a);
			}
			let o = e._zod.parse(i, a);
			if (o instanceof Promise) {
				if (a.async === !1) throw new ou();
				return o.then((e) => t(e, r, a));
			}
			return t(o, r, a);
		};
	}
	gu(e, "~standard", () => ({
		validate: (t) => {
			try {
				let n = Qu(e, t);
				return n.success ? { value: n.data } : { issues: n.error?.issues };
			} catch {
				return ed(e, t).then((e) => e.success ? { value: e.data } : { issues: e.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	}));
}), $d = /* @__PURE__ */ Y("$ZodString", (e, t) => {
	Qd.init(e, t), e._zod.pattern = [...e?._zod.bag?.patterns ?? []].pop() ?? Pd(e._zod.bag), e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = String(n.value);
		} catch {}
		return typeof n.value == "string" || n.issues.push({
			expected: "string",
			code: "invalid_type",
			input: n.value,
			inst: e
		}), n;
	};
}), ef = /* @__PURE__ */ Y("$ZodStringFormat", (e, t) => {
	Hd.init(e, t), $d.init(e, t);
}), tf = /* @__PURE__ */ Y("$ZodGUID", (e, t) => {
	t.pattern ??= gd, ef.init(e, t);
}), nf = /* @__PURE__ */ Y("$ZodUUID", (e, t) => {
	if (t.version) {
		let e = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[t.version];
		if (e === void 0) throw Error(`Invalid UUID version: "${t.version}"`);
		t.pattern ??= _d(e);
	} else t.pattern ??= _d();
	ef.init(e, t);
}), rf = /* @__PURE__ */ Y("$ZodEmail", (e, t) => {
	t.pattern ??= vd, ef.init(e, t);
}), af = /* @__PURE__ */ Y("$ZodURL", (e, t) => {
	ef.init(e, t), e._zod.check = (n) => {
		try {
			let r = n.value.trim();
			if (!t.normalize && t.protocol?.source === Dd.source && !/^https?:\/\//i.test(r)) {
				n.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid URL format",
					input: n.value,
					inst: e,
					continue: !t.abort
				});
				return;
			}
			let i = new URL(r);
			t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(i.hostname) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid hostname",
				pattern: t.hostname.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(i.protocol.endsWith(":") ? i.protocol.slice(0, -1) : i.protocol) || n.issues.push({
				code: "invalid_format",
				format: "url",
				note: "Invalid protocol",
				pattern: t.protocol.source,
				input: n.value,
				inst: e,
				continue: !t.abort
			})), t.normalize ? n.value = i.href : n.value = r;
			return;
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "url",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), of = /* @__PURE__ */ Y("$ZodEmoji", (e, t) => {
	t.pattern ??= bd(), ef.init(e, t);
}), sf = /* @__PURE__ */ Y("$ZodNanoID", (e, t) => {
	t.pattern ??= md, ef.init(e, t);
}), cf = /* @__PURE__ */ Y("$ZodCUID", (e, t) => {
	t.pattern ??= ld, ef.init(e, t);
}), lf = /* @__PURE__ */ Y("$ZodCUID2", (e, t) => {
	t.pattern ??= ud, ef.init(e, t);
}), uf = /* @__PURE__ */ Y("$ZodULID", (e, t) => {
	t.pattern ??= dd, ef.init(e, t);
}), df = /* @__PURE__ */ Y("$ZodXID", (e, t) => {
	t.pattern ??= fd, ef.init(e, t);
}), ff = /* @__PURE__ */ Y("$ZodKSUID", (e, t) => {
	t.pattern ??= pd, ef.init(e, t);
}), pf = /* @__PURE__ */ Y("$ZodISODateTime", (e, t) => {
	t.pattern ??= Nd(t), ef.init(e, t);
}), mf = /* @__PURE__ */ Y("$ZodISODate", (e, t) => {
	t.pattern ??= Ad, ef.init(e, t);
}), hf = /* @__PURE__ */ Y("$ZodISOTime", (e, t) => {
	t.pattern ??= Md(t), ef.init(e, t);
}), gf = /* @__PURE__ */ Y("$ZodISODuration", (e, t) => {
	t.pattern ??= hd, ef.init(e, t);
}), _f = /* @__PURE__ */ Y("$ZodIPv4", (e, t) => {
	t.pattern ??= xd, ef.init(e, t), e._zod.bag.format = "ipv4";
}), vf = /* @__PURE__ */ Y("$ZodIPv6", (e, t) => {
	t.pattern ??= Sd, ef.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
		try {
			new URL(`http://[${n.value}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
}), yf = /* @__PURE__ */ Y("$ZodCIDRv4", (e, t) => {
	t.pattern ??= Cd, ef.init(e, t);
}), bf = /* @__PURE__ */ Y("$ZodCIDRv6", (e, t) => {
	t.pattern ??= wd, ef.init(e, t), e._zod.check = (n) => {
		let r = n.value.split("/");
		try {
			if (r.length !== 2) throw Error();
			let [e, t] = r;
			if (!t) throw Error();
			let n = Number(t);
			if (`${n}` !== t || n < 0 || n > 128) throw Error();
			new URL(`http://[${e}]`);
		} catch {
			n.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: n.value,
				inst: e,
				continue: !t.abort
			});
		}
	};
});
function xf(e) {
	if (e === "") return !0;
	if (/\s/.test(e) || e.length % 4 != 0) return !1;
	try {
		return atob(e), !0;
	} catch {
		return !1;
	}
}
var Sf = /* @__PURE__ */ Y("$ZodBase64", (e, t) => {
	t.pattern ??= Td, ef.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
		xf(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
});
function Cf(e) {
	if (!Ed.test(e)) return !1;
	let t = e.replace(/[-_]/g, (e) => e === "-" ? "+" : "/");
	return xf(t.padEnd(Math.ceil(t.length / 4) * 4, "="));
}
var wf = /* @__PURE__ */ Y("$ZodBase64URL", (e, t) => {
	t.pattern ??= Ed, ef.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
		Cf(n.value) || n.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Tf = /* @__PURE__ */ Y("$ZodE164", (e, t) => {
	t.pattern ??= Od, ef.init(e, t);
});
function Ef(e, t = null) {
	try {
		let n = e.split(".");
		if (n.length !== 3) return !1;
		let [r] = n;
		if (!r) return !1;
		let i = JSON.parse(atob(r));
		return !("typ" in i && i?.typ !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
	} catch {
		return !1;
	}
}
var Df = /* @__PURE__ */ Y("$ZodJWT", (e, t) => {
	ef.init(e, t), e._zod.check = (n) => {
		Ef(n.value, t.alg) || n.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: n.value,
			inst: e,
			continue: !t.abort
		});
	};
}), Of = /* @__PURE__ */ Y("$ZodBoolean", (e, t) => {
	Qd.init(e, t), e._zod.pattern = Fd, e._zod.parse = (n, r) => {
		if (t.coerce) try {
			n.value = !!n.value;
		} catch {}
		let i = n.value;
		return typeof i == "boolean" || n.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
	};
}), kf = /* @__PURE__ */ Y("$ZodUnknown", (e, t) => {
	Qd.init(e, t), e._zod.parse = (e) => e;
}), Af = /* @__PURE__ */ Y("$ZodNever", (e, t) => {
	Qd.init(e, t), e._zod.parse = (t, n) => (t.issues.push({
		expected: "never",
		code: "invalid_type",
		input: t.value,
		inst: e
	}), t);
});
function jf(e, t, n) {
	e.issues.length && t.issues.push(...zu(n, e.issues)), t.value[n] = e.value;
}
var Mf = /* @__PURE__ */ Y("$ZodArray", (e, t) => {
	Qd.init(e, t), e._zod.parse = (n, r) => {
		let i = n.value;
		if (!Array.isArray(i)) return n.issues.push({
			expected: "array",
			code: "invalid_type",
			input: i,
			inst: e
		}), n;
		n.value = Array(i.length);
		let a = [];
		for (let e = 0; e < i.length; e++) {
			let o = i[e], s = t.element._zod.run({
				value: o,
				issues: []
			}, r);
			s instanceof Promise ? a.push(s.then((t) => jf(t, n, e))) : jf(s, n, e);
		}
		return a.length ? Promise.all(a).then(() => n) : n;
	};
});
function Nf(e, t, n, r, i, a) {
	let o = n in r;
	if (e.issues.length) {
		if (i && a && !o) return;
		t.issues.push(...zu(n, e.issues));
	}
	if (!o && !i) {
		e.issues.length || t.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [n]
		});
		return;
	}
	e.value === void 0 ? o && (t.value[n] = void 0) : t.value[n] = e.value;
}
function Pf(e) {
	let t = Object.keys(e.shape);
	for (let n of t) if (!e.shape?.[n]?._zod?.traits?.has("$ZodType")) throw Error(`Invalid element at key "${n}": expected a Zod schema`);
	let n = ku(e.shape);
	return {
		...e,
		keys: t,
		keySet: new Set(t),
		numKeys: t.length,
		optionalKeys: new Set(n)
	};
}
function Ff(e, t, n, r, i, a) {
	let o = [], s = i.keySet, c = i.catchall._zod, l = c.def.type, u = c.optin === "optional", d = c.optout === "optional";
	for (let i in t) {
		if (i === "__proto__" || s.has(i)) continue;
		if (l === "never") {
			o.push(i);
			continue;
		}
		let a = c.run({
			value: t[i],
			issues: []
		}, r);
		a instanceof Promise ? e.push(a.then((e) => Nf(e, n, i, t, u, d))) : Nf(a, n, i, t, u, d);
	}
	return o.length && n.issues.push({
		code: "unrecognized_keys",
		keys: o,
		input: t,
		inst: a
	}), e.length ? Promise.all(e).then(() => n) : n;
}
var If = /* @__PURE__ */ Y("$ZodObject", (e, t) => {
	if (Qd.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
		let e = t.shape;
		Object.defineProperty(t, "shape", { get: () => {
			let n = { ...e };
			return Object.defineProperty(t, "shape", { value: n }), n;
		} });
	}
	let n = fu(() => Pf(t));
	gu(e._zod, "propValues", () => {
		let e = t.shape, n = {};
		for (let t in e) {
			let r = e[t]._zod;
			if (r.values) {
				n[t] ?? (n[t] = /* @__PURE__ */ new Set());
				for (let e of r.values) n[t].add(e);
			}
		}
		return n;
	});
	let r = Su, i = t.catchall, a;
	e._zod.parse = (t, o) => {
		a ??= n.value;
		let s = t.value;
		if (!r(s)) return t.issues.push({
			expected: "object",
			code: "invalid_type",
			input: s,
			inst: e
		}), t;
		t.value = {};
		let c = [], l = a.shape;
		for (let e of a.keys) {
			let n = l[e], r = n._zod.optin === "optional", i = n._zod.optout === "optional", a = n._zod.run({
				value: s[e],
				issues: []
			}, o);
			a instanceof Promise ? c.push(a.then((n) => Nf(n, t, e, s, r, i))) : Nf(a, t, e, s, r, i);
		}
		return i ? Ff(c, s, t, o, n.value, e) : c.length ? Promise.all(c).then(() => t) : t;
	};
}), Lf = /* @__PURE__ */ Y("$ZodObjectJIT", (e, t) => {
	If.init(e, t);
	let n = e._zod.parse, r = fu(() => Pf(t)), i = (e) => {
		let t = new Xd([
			"shape",
			"payload",
			"ctx"
		]), n = r.value, i = (e) => {
			let t = yu(e);
			return `shape[${t}]._zod.run({ value: input[${t}], issues: [] }, ctx)`;
		};
		t.write("const input = payload.value;");
		let a = Object.create(null), o = 0;
		for (let e of n.keys) a[e] = `key_${o++}`;
		t.write("const newResult = {};");
		for (let r of n.keys) {
			let n = a[r], o = yu(r), s = e[r], c = s?._zod?.optin === "optional", l = s?._zod?.optout === "optional";
			t.write(`const ${n} = ${i(r)};`), c && l ? t.write(`
        if (${n}.issues.length) {
          if (${o} in input) {
            payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${o}, ...iss.path] : [${o}]
            })));
          }
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `) : c ? t.write(`
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        
        if (${n}.value === undefined) {
          if (${o} in input) {
            newResult[${o}] = undefined;
          }
        } else {
          newResult[${o}] = ${n}.value;
        }
        
      `) : t.write(`
        const ${n}_present = ${o} in input;
        if (${n}.issues.length) {
          payload.issues = payload.issues.concat(${n}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${o}, ...iss.path] : [${o}]
          })));
        }
        if (!${n}_present && !${n}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${o}]
          });
        }

        if (${n}_present) {
          if (${n}.value === undefined) {
            newResult[${o}] = undefined;
          } else {
            newResult[${o}] = ${n}.value;
          }
        }

      `);
		}
		t.write("payload.value = newResult;"), t.write("return payload;");
		let s = t.compile();
		return (t, n) => s(e, t, n);
	}, a, o = Su, s = !cu.jitless, c = s && Cu.value, l = t.catchall, u;
	e._zod.parse = (d, f) => {
		u ??= r.value;
		let p = d.value;
		return o(p) ? s && c && f?.async === !1 && f.jitless !== !0 ? (a ||= i(t.shape), d = a(d, f), l ? Ff([], p, d, f, u, e) : d) : n(d, f) : (d.issues.push({
			expected: "object",
			code: "invalid_type",
			input: p,
			inst: e
		}), d);
	};
});
function Rf(e, t, n, r) {
	for (let n of e) if (n.issues.length === 0) return t.value = n.value, t;
	let i = e.filter((e) => !Lu(e));
	return i.length === 1 ? (t.value = i[0].value, i[0]) : (t.issues.push({
		code: "invalid_union",
		input: t.value,
		inst: n,
		errors: e.map((e) => e.issues.map((e) => Vu(e, r, lu())))
	}), t);
}
var zf = /* @__PURE__ */ Y("$ZodUnion", (e, t) => {
	Qd.init(e, t), gu(e._zod, "optin", () => t.options.some((e) => e._zod.optin === "optional") ? "optional" : void 0), gu(e._zod, "optout", () => t.options.some((e) => e._zod.optout === "optional") ? "optional" : void 0), gu(e._zod, "values", () => {
		if (t.options.every((e) => e._zod.values)) return new Set(t.options.flatMap((e) => Array.from(e._zod.values)));
	}), gu(e._zod, "pattern", () => {
		if (t.options.every((e) => e._zod.pattern)) {
			let e = t.options.map((e) => e._zod.pattern);
			return RegExp(`^(${e.map((e) => mu(e.source)).join("|")})$`);
		}
	});
	let n = t.options.length === 1 ? t.options[0]._zod.run : null;
	e._zod.parse = (r, i) => {
		if (n) return n(r, i);
		let a = !1, o = [];
		for (let e of t.options) {
			let t = e._zod.run({
				value: r.value,
				issues: []
			}, i);
			if (t instanceof Promise) o.push(t), a = !0;
			else {
				if (t.issues.length === 0) return t;
				o.push(t);
			}
		}
		return a ? Promise.all(o).then((t) => Rf(t, r, e, i)) : Rf(o, r, e, i);
	};
}), Bf = /* @__PURE__ */ Y("$ZodIntersection", (e, t) => {
	Qd.init(e, t), e._zod.parse = (e, n) => {
		let r = e.value, i = t.left._zod.run({
			value: r,
			issues: []
		}, n), a = t.right._zod.run({
			value: r,
			issues: []
		}, n);
		return i instanceof Promise || a instanceof Promise ? Promise.all([i, a]).then(([t, n]) => Hf(e, t, n)) : Hf(e, i, a);
	};
});
function Vf(e, t) {
	if (e === t || e instanceof Date && t instanceof Date && +e == +t) return {
		valid: !0,
		data: e
	};
	if (wu(e) && wu(t)) {
		let n = Object.keys(t), r = Object.keys(e).filter((e) => n.indexOf(e) !== -1), i = {
			...e,
			...t
		};
		for (let n of r) {
			let r = Vf(e[n], t[n]);
			if (!r.valid) return {
				valid: !1,
				mergeErrorPath: [n, ...r.mergeErrorPath]
			};
			i[n] = r.data;
		}
		return {
			valid: !0,
			data: i
		};
	}
	if (Array.isArray(e) && Array.isArray(t)) {
		if (e.length !== t.length) return {
			valid: !1,
			mergeErrorPath: []
		};
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r], a = t[r], o = Vf(i, a);
			if (!o.valid) return {
				valid: !1,
				mergeErrorPath: [r, ...o.mergeErrorPath]
			};
			n.push(o.data);
		}
		return {
			valid: !0,
			data: n
		};
	}
	return {
		valid: !1,
		mergeErrorPath: []
	};
}
function Hf(e, t, n) {
	let r = /* @__PURE__ */ new Map(), i;
	for (let n of t.issues) if (n.code === "unrecognized_keys") {
		i ??= n;
		for (let e of n.keys) r.has(e) || r.set(e, {}), r.get(e).l = !0;
	} else e.issues.push(n);
	for (let t of n.issues) if (t.code === "unrecognized_keys") for (let e of t.keys) r.has(e) || r.set(e, {}), r.get(e).r = !0;
	else e.issues.push(t);
	let a = [...r].filter(([, e]) => e.l && e.r).map(([e]) => e);
	if (a.length && i && e.issues.push({
		...i,
		keys: a
	}), Lu(e)) return e;
	let o = Vf(t.value, n.value);
	if (!o.valid) throw Error(`Unmergable intersection. Error path: ${JSON.stringify(o.mergeErrorPath)}`);
	return e.value = o.data, e;
}
var Uf = /* @__PURE__ */ Y("$ZodEnum", (e, t) => {
	Qd.init(e, t);
	let n = uu(t.entries), r = new Set(n);
	e._zod.values = r, e._zod.pattern = RegExp(`^(${n.filter((e) => Eu.has(typeof e)).map((e) => typeof e == "string" ? Du(e) : e.toString()).join("|")})$`), e._zod.parse = (t, i) => {
		let a = t.value;
		return r.has(a) || t.issues.push({
			code: "invalid_value",
			values: n,
			input: a,
			inst: e
		}), t;
	};
}), Wf = /* @__PURE__ */ Y("$ZodTransform", (e, t) => {
	Qd.init(e, t), e._zod.optin = "optional", e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new su(e.constructor.name);
		let i = t.transform(n.value, n);
		if (r.async) return (i instanceof Promise ? i : Promise.resolve(i)).then((e) => (n.value = e, n.fallback = !0, n));
		if (i instanceof Promise) throw new ou();
		return n.value = i, n.fallback = !0, n;
	};
});
function Gf(e, t) {
	return t === void 0 && (e.issues.length || e.fallback) ? {
		issues: [],
		value: void 0
	} : e;
}
var Kf = /* @__PURE__ */ Y("$ZodOptional", (e, t) => {
	Qd.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", gu(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0), gu(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${mu(e.source)})?$`) : void 0;
	}), e._zod.parse = (e, n) => {
		if (t.innerType._zod.optin === "optional") {
			let r = e.value, i = t.innerType._zod.run(e, n);
			return i instanceof Promise ? i.then((e) => Gf(e, r)) : Gf(i, r);
		}
		return e.value === void 0 ? e : t.innerType._zod.run(e, n);
	};
}), qf = /* @__PURE__ */ Y("$ZodExactOptional", (e, t) => {
	Kf.init(e, t), gu(e._zod, "values", () => t.innerType._zod.values), gu(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (e, n) => t.innerType._zod.run(e, n);
}), Jf = /* @__PURE__ */ Y("$ZodNullable", (e, t) => {
	Qd.init(e, t), gu(e._zod, "optin", () => t.innerType._zod.optin), gu(e._zod, "optout", () => t.innerType._zod.optout), gu(e._zod, "pattern", () => {
		let e = t.innerType._zod.pattern;
		return e ? RegExp(`^(${mu(e.source)}|null)$`) : void 0;
	}), gu(e._zod, "values", () => t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (e, n) => e.value === null ? e : t.innerType._zod.run(e, n);
}), Yf = /* @__PURE__ */ Y("$ZodDefault", (e, t) => {
	Qd.init(e, t), e._zod.optin = "optional", gu(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		if (e.value === void 0) return e.value = t.defaultValue, e;
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => Xf(e, t)) : Xf(r, t);
	};
});
function Xf(e, t) {
	return e.value === void 0 && (e.value = t.defaultValue), e;
}
var Zf = /* @__PURE__ */ Y("$ZodPrefault", (e, t) => {
	Qd.init(e, t), e._zod.optin = "optional", gu(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => (n.direction === "backward" || e.value === void 0 && (e.value = t.defaultValue), t.innerType._zod.run(e, n));
}), Qf = /* @__PURE__ */ Y("$ZodNonOptional", (e, t) => {
	Qd.init(e, t), gu(e._zod, "values", () => {
		let e = t.innerType._zod.values;
		return e ? new Set([...e].filter((e) => e !== void 0)) : void 0;
	}), e._zod.parse = (n, r) => {
		let i = t.innerType._zod.run(n, r);
		return i instanceof Promise ? i.then((t) => $f(t, e)) : $f(i, e);
	};
});
function $f(e, t) {
	return !e.issues.length && e.value === void 0 && e.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: e.value,
		inst: t
	}), e;
}
var ep = /* @__PURE__ */ Y("$ZodCatch", (e, t) => {
	Qd.init(e, t), e._zod.optin = "optional", gu(e._zod, "optout", () => t.innerType._zod.optout), gu(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then((r) => (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => Vu(e, n, lu())) },
			input: e.value
		}), e.issues = [], e.fallback = !0), e)) : (e.value = r.value, r.issues.length && (e.value = t.catchValue({
			...e,
			error: { issues: r.issues.map((e) => Vu(e, n, lu())) },
			input: e.value
		}), e.issues = [], e.fallback = !0), e);
	};
}), tp = /* @__PURE__ */ Y("$ZodPipe", (e, t) => {
	Qd.init(e, t), gu(e._zod, "values", () => t.in._zod.values), gu(e._zod, "optin", () => t.in._zod.optin), gu(e._zod, "optout", () => t.out._zod.optout), gu(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (e, n) => {
		if (n.direction === "backward") {
			let r = t.out._zod.run(e, n);
			return r instanceof Promise ? r.then((e) => np(e, t.in, n)) : np(r, t.in, n);
		}
		let r = t.in._zod.run(e, n);
		return r instanceof Promise ? r.then((e) => np(e, t.out, n)) : np(r, t.out, n);
	};
});
function np(e, t, n) {
	return e.issues.length ? (e.aborted = !0, e) : t._zod.run({
		value: e.value,
		issues: e.issues,
		fallback: e.fallback
	}, n);
}
var rp = /* @__PURE__ */ Y("$ZodReadonly", (e, t) => {
	Qd.init(e, t), gu(e._zod, "propValues", () => t.innerType._zod.propValues), gu(e._zod, "values", () => t.innerType._zod.values), gu(e._zod, "optin", () => t.innerType?._zod?.optin), gu(e._zod, "optout", () => t.innerType?._zod?.optout), e._zod.parse = (e, n) => {
		if (n.direction === "backward") return t.innerType._zod.run(e, n);
		let r = t.innerType._zod.run(e, n);
		return r instanceof Promise ? r.then(ip) : ip(r);
	};
});
function ip(e) {
	return e.value = Object.freeze(e.value), e;
}
var ap = /* @__PURE__ */ Y("$ZodCustom", (e, t) => {
	Rd.init(e, t), Qd.init(e, t), e._zod.parse = (e, t) => e, e._zod.check = (n) => {
		let r = n.value, i = t.fn(r);
		if (i instanceof Promise) return i.then((t) => op(t, n, r, e));
		op(i, n, r, e);
	};
});
function op(e, t, n, r) {
	if (!e) {
		let e = {
			code: "custom",
			input: n,
			inst: r,
			path: [...r._zod.def.path ?? []],
			continue: !r._zod.def.abort
		};
		r._zod.def.params && (e.params = r._zod.def.params), t.issues.push(Uu(e));
	}
}
//#endregion
//#region ../node_modules/zod/v4/core/registries.js
var sp, cp = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
	}
	add(e, ...t) {
		let n = t[0];
		return this._map.set(e, n), n && typeof n == "object" && "id" in n && this._idmap.set(n.id, e), this;
	}
	clear() {
		return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
	}
	remove(e) {
		let t = this._map.get(e);
		return t && typeof t == "object" && "id" in t && this._idmap.delete(t.id), this._map.delete(e), this;
	}
	get(e) {
		let t = e._zod.parent;
		if (t) {
			let n = { ...this.get(t) ?? {} };
			delete n.id;
			let r = {
				...n,
				...this._map.get(e)
			};
			return Object.keys(r).length ? r : void 0;
		}
		return this._map.get(e);
	}
	has(e) {
		return this._map.has(e);
	}
};
function lp() {
	return new cp();
}
(sp = globalThis).__zod_globalRegistry ?? (sp.__zod_globalRegistry = lp());
var up = globalThis.__zod_globalRegistry;
//#endregion
//#region ../node_modules/zod/v4/core/api.js
/* @__NO_SIDE_EFFECTS__ */
function dp(e, t) {
	return new e({
		type: "string",
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function fp(e, t) {
	return new e({
		type: "string",
		format: "email",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function pp(e, t) {
	return new e({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function mp(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function hp(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v4",
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function gp(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v6",
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _p(e, t) {
	return new e({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: !1,
		version: "v7",
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function vp(e, t) {
	return new e({
		type: "string",
		format: "url",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function yp(e, t) {
	return new e({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function bp(e, t) {
	return new e({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function xp(e, t) {
	return new e({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Sp(e, t) {
	return new e({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Cp(e, t) {
	return new e({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function wp(e, t) {
	return new e({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Tp(e, t) {
	return new e({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ep(e, t) {
	return new e({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Dp(e, t) {
	return new e({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Op(e, t) {
	return new e({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function kp(e, t) {
	return new e({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ap(e, t) {
	return new e({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function jp(e, t) {
	return new e({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Mp(e, t) {
	return new e({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Np(e, t) {
	return new e({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: !1,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Pp(e, t) {
	return new e({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Fp(e, t) {
	return new e({
		type: "string",
		format: "date",
		check: "string_format",
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Ip(e, t) {
	return new e({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Lp(e, t) {
	return new e({
		type: "string",
		format: "duration",
		check: "string_format",
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Rp(e, t) {
	return new e({
		type: "boolean",
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function zp(e) {
	return new e({ type: "unknown" });
}
/* @__NO_SIDE_EFFECTS__ */
function Bp(e, t) {
	return new e({
		type: "never",
		...X(t)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Vp(e, t) {
	return new zd({
		check: "max_length",
		...X(t),
		maximum: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Hp(e, t) {
	return new Bd({
		check: "min_length",
		...X(t),
		minimum: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Up(e, t) {
	return new Vd({
		check: "length_equals",
		...X(t),
		length: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Wp(e, t) {
	return new Ud({
		check: "string_format",
		format: "regex",
		...X(t),
		pattern: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Gp(e) {
	return new Wd({
		check: "string_format",
		format: "lowercase",
		...X(e)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Kp(e) {
	return new Gd({
		check: "string_format",
		format: "uppercase",
		...X(e)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function qp(e, t) {
	return new Kd({
		check: "string_format",
		format: "includes",
		...X(t),
		includes: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Jp(e, t) {
	return new qd({
		check: "string_format",
		format: "starts_with",
		...X(t),
		prefix: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Yp(e, t) {
	return new Jd({
		check: "string_format",
		format: "ends_with",
		...X(t),
		suffix: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Xp(e) {
	return new Yd({
		check: "overwrite",
		tx: e
	});
}
/* @__NO_SIDE_EFFECTS__ */
function Zp(e) {
	return /* @__PURE__ */ Xp((t) => t.normalize(e));
}
/* @__NO_SIDE_EFFECTS__ */
function Qp() {
	return /* @__PURE__ */ Xp((e) => e.trim());
}
/* @__NO_SIDE_EFFECTS__ */
function $p() {
	return /* @__PURE__ */ Xp((e) => e.toLowerCase());
}
/* @__NO_SIDE_EFFECTS__ */
function em() {
	return /* @__PURE__ */ Xp((e) => e.toUpperCase());
}
/* @__NO_SIDE_EFFECTS__ */
function tm() {
	return /* @__PURE__ */ Xp((e) => bu(e));
}
/* @__NO_SIDE_EFFECTS__ */
function nm(e, t, n) {
	return new e({
		type: "array",
		element: t,
		...X(n)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function rm(e, t, n) {
	return new e({
		type: "custom",
		check: "custom",
		fn: t,
		...X(n)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function im(e, t) {
	let n = /* @__PURE__ */ am((t) => (t.addIssue = (e) => {
		if (typeof e == "string") t.issues.push(Uu(e, t.value, n._zod.def));
		else {
			let r = e;
			r.fatal && (r.continue = !1), r.code ??= "custom", r.input ??= t.value, r.inst ??= n, r.continue ??= !n._zod.def.abort, t.issues.push(Uu(r));
		}
	}, e(t.value, t)), t);
	return n;
}
/* @__NO_SIDE_EFFECTS__ */
function am(e, t) {
	let n = new Rd({
		check: "custom",
		...X(t)
	});
	return n._zod.check = e, n;
}
//#endregion
//#region ../node_modules/zod/v4/core/to-json-schema.js
function om(e) {
	let t = e?.target ?? "draft-2020-12";
	return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
		processors: e.processors ?? {},
		metadataRegistry: e?.metadata ?? up,
		target: t,
		unrepresentable: e?.unrepresentable ?? "throw",
		override: e?.override ?? (() => {}),
		io: e?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: e?.cycles ?? "ref",
		reused: e?.reused ?? "inline",
		external: e?.external ?? void 0
	};
}
function sm(e, t, n = {
	path: [],
	schemaPath: []
}) {
	var r;
	let i = e._zod.def, a = t.seen.get(e);
	if (a) return a.count++, n.schemaPath.includes(e) && (a.cycle = n.path), a.schema;
	let o = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: n.path
	};
	t.seen.set(e, o);
	let s = e._zod.toJSONSchema?.();
	if (s) o.schema = s;
	else {
		let r = {
			...n,
			schemaPath: [...n.schemaPath, e],
			path: n.path
		};
		if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, o.schema, r);
		else {
			let n = o.schema, a = t.processors[i.type];
			if (!a) throw Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);
			a(e, t, n, r);
		}
		let a = e._zod.parent;
		a && (o.ref ||= a, sm(a, t, r), t.seen.get(a).isParent = !0);
	}
	let c = t.metadataRegistry.get(e);
	return c && Object.assign(o.schema, c), t.io === "input" && um(e) && (delete o.schema.examples, delete o.schema.default), t.io === "input" && "_prefault" in o.schema && ((r = o.schema).default ?? (r.default = o.schema._prefault)), delete o.schema._prefault, t.seen.get(e).schema;
}
function cm(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = /* @__PURE__ */ new Map();
	for (let t of e.seen.entries()) {
		let n = e.metadataRegistry.get(t[0])?.id;
		if (n) {
			let e = r.get(n);
			if (e && e !== t[0]) throw Error(`Duplicate schema id "${n}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			r.set(n, t[0]);
		}
	}
	let i = (t) => {
		let r = e.target === "draft-2020-12" ? "$defs" : "definitions";
		if (e.external) {
			let n = e.external.registry.get(t[0])?.id, i = e.external.uri ?? ((e) => e);
			if (n) return { ref: i(n) };
			let a = t[1].defId ?? t[1].schema.id ?? `schema${e.counter++}`;
			return t[1].defId = a, {
				defId: a,
				ref: `${i("__shared")}#/${r}/${a}`
			};
		}
		if (t[1] === n) return { ref: "#" };
		let i = `#/${r}/`, a = t[1].schema.id ?? `__schema${e.counter++}`;
		return {
			defId: a,
			ref: i + a
		};
	}, a = (e) => {
		if (e[1].schema.$ref) return;
		let t = e[1], { ref: n, defId: r } = i(e);
		t.def = { ...t.schema }, r && (t.defId = r);
		let a = t.schema;
		for (let e in a) delete a[e];
		a.$ref = n;
	};
	if (e.cycles === "throw") for (let t of e.seen.entries()) {
		let e = t[1];
		if (e.cycle) throw Error(`Cycle detected: #/${e.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (let n of e.seen.entries()) {
		let r = n[1];
		if (t === n[0]) {
			a(n);
			continue;
		}
		if (e.external) {
			let r = e.external.registry.get(n[0])?.id;
			if (t !== n[0] && r) {
				a(n);
				continue;
			}
		}
		if (e.metadataRegistry.get(n[0])?.id) {
			a(n);
			continue;
		}
		if (r.cycle) {
			a(n);
			continue;
		}
		if (r.count > 1 && e.reused === "ref") {
			a(n);
			continue;
		}
	}
}
function lm(e, t) {
	let n = e.seen.get(t);
	if (!n) throw Error("Unprocessed schema. This is a bug in Zod.");
	let r = (t) => {
		let n = e.seen.get(t);
		if (n.ref === null) return;
		let i = n.def ?? n.schema, a = { ...i }, o = n.ref;
		if (n.ref = null, o) {
			r(o);
			let n = e.seen.get(o), s = n.schema;
			if (s.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (i.allOf = i.allOf ?? [], i.allOf.push(s)) : Object.assign(i, s), Object.assign(i, a), t._zod.parent === o) for (let e in i) e === "$ref" || e === "allOf" || e in a || delete i[e];
			if (s.$ref && n.def) for (let e in i) e === "$ref" || e === "allOf" || e in n.def && JSON.stringify(i[e]) === JSON.stringify(n.def[e]) && delete i[e];
		}
		let s = t._zod.parent;
		if (s && s !== o) {
			r(s);
			let t = e.seen.get(s);
			if (t?.schema.$ref && (i.$ref = t.schema.$ref, t.def)) for (let e in i) e === "$ref" || e === "allOf" || e in t.def && JSON.stringify(i[e]) === JSON.stringify(t.def[e]) && delete i[e];
		}
		e.override({
			zodSchema: t,
			jsonSchema: i,
			path: n.path ?? []
		});
	};
	for (let t of [...e.seen.entries()].reverse()) r(t[0]);
	let i = {};
	if (e.target === "draft-2020-12" ? i.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? i.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? i.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
		let n = e.external.registry.get(t)?.id;
		if (!n) throw Error("Schema is missing an `id` property");
		i.$id = e.external.uri(n);
	}
	Object.assign(i, n.def ?? n.schema);
	let a = e.metadataRegistry.get(t)?.id;
	a !== void 0 && i.id === a && delete i.id;
	let o = e.external?.defs ?? {};
	for (let t of e.seen.entries()) {
		let e = t[1];
		e.def && e.defId && (e.def.id === e.defId && delete e.def.id, o[e.defId] = e.def);
	}
	e.external || Object.keys(o).length > 0 && (e.target === "draft-2020-12" ? i.$defs = o : i.definitions = o);
	try {
		let n = JSON.parse(JSON.stringify(i));
		return Object.defineProperty(n, "~standard", {
			value: {
				...t["~standard"],
				jsonSchema: {
					input: fm(t, "input", e.processors),
					output: fm(t, "output", e.processors)
				}
			},
			enumerable: !1,
			writable: !1
		}), n;
	} catch {
		throw Error("Error converting schema to JSON.");
	}
}
function um(e, t) {
	let n = t ?? { seen: /* @__PURE__ */ new Set() };
	if (n.seen.has(e)) return !1;
	n.seen.add(e);
	let r = e._zod.def;
	if (r.type === "transform") return !0;
	if (r.type === "array") return um(r.element, n);
	if (r.type === "set") return um(r.valueType, n);
	if (r.type === "lazy") return um(r.getter(), n);
	if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault") return um(r.innerType, n);
	if (r.type === "intersection") return um(r.left, n) || um(r.right, n);
	if (r.type === "record" || r.type === "map") return um(r.keyType, n) || um(r.valueType, n);
	if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : um(r.in, n) || um(r.out, n);
	if (r.type === "object") {
		for (let e in r.shape) if (um(r.shape[e], n)) return !0;
		return !1;
	}
	if (r.type === "union") {
		for (let e of r.options) if (um(e, n)) return !0;
		return !1;
	}
	if (r.type === "tuple") {
		for (let e of r.items) if (um(e, n)) return !0;
		return !!(r.rest && um(r.rest, n));
	}
	return !1;
}
var dm = (e, t = {}) => (n) => {
	let r = om({
		...n,
		processors: t
	});
	return sm(e, r), cm(r, e), lm(r, e);
}, fm = (e, t, n = {}) => (r) => {
	let { libraryOptions: i, target: a } = r ?? {}, o = om({
		...i ?? {},
		target: a,
		io: t,
		processors: n
	});
	return sm(e, o), cm(o, e), lm(o, e);
}, pm = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
}, mm = (e, t, n, r) => {
	let i = n;
	i.type = "string";
	let { minimum: a, maximum: o, format: s, patterns: c, contentEncoding: l } = e._zod.bag;
	if (typeof a == "number" && (i.minLength = a), typeof o == "number" && (i.maxLength = o), s && (i.format = pm[s] ?? s, i.format === "" && delete i.format, s === "time" && delete i.format), l && (i.contentEncoding = l), c && c.size > 0) {
		let e = [...c];
		e.length === 1 ? i.pattern = e[0].source : e.length > 1 && (i.allOf = [...e.map((e) => ({
			...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: e.source
		}))]);
	}
}, hm = (e, t, n, r) => {
	n.type = "boolean";
}, gm = (e, t, n, r) => {
	n.not = {};
}, _m = (e, t, n, r) => {
	let i = e._zod.def, a = uu(i.entries);
	a.every((e) => typeof e == "number") && (n.type = "number"), a.every((e) => typeof e == "string") && (n.type = "string"), n.enum = a;
}, vm = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Custom types cannot be represented in JSON Schema");
}, ym = (e, t, n, r) => {
	if (t.unrepresentable === "throw") throw Error("Transforms cannot be represented in JSON Schema");
}, bm = (e, t, n, r) => {
	let i = n, a = e._zod.def, { minimum: o, maximum: s } = e._zod.bag;
	typeof o == "number" && (i.minItems = o), typeof s == "number" && (i.maxItems = s), i.type = "array", i.items = sm(a.element, t, {
		...r,
		path: [...r.path, "items"]
	});
}, xm = (e, t, n, r) => {
	let i = n, a = e._zod.def;
	i.type = "object", i.properties = {};
	let o = a.shape;
	for (let e in o) i.properties[e] = sm(o[e], t, {
		...r,
		path: [
			...r.path,
			"properties",
			e
		]
	});
	let s = new Set(Object.keys(o)), c = new Set([...s].filter((e) => {
		let n = a.shape[e]._zod;
		return t.io === "input" ? n.optin === void 0 : n.optout === void 0;
	}));
	c.size > 0 && (i.required = Array.from(c)), a.catchall?._zod.def.type === "never" ? i.additionalProperties = !1 : a.catchall ? a.catchall && (i.additionalProperties = sm(a.catchall, t, {
		...r,
		path: [...r.path, "additionalProperties"]
	})) : t.io === "output" && (i.additionalProperties = !1);
}, Sm = (e, t, n, r) => {
	let i = e._zod.def, a = i.inclusive === !1, o = i.options.map((e, n) => sm(e, t, {
		...r,
		path: [
			...r.path,
			a ? "oneOf" : "anyOf",
			n
		]
	}));
	a ? n.oneOf = o : n.anyOf = o;
}, Cm = (e, t, n, r) => {
	let i = e._zod.def, a = sm(i.left, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			0
		]
	}), o = sm(i.right, t, {
		...r,
		path: [
			...r.path,
			"allOf",
			1
		]
	}), s = (e) => "allOf" in e && Object.keys(e).length === 1;
	n.allOf = [...s(a) ? a.allOf : [a], ...s(o) ? o.allOf : [o]];
}, wm = (e, t, n, r) => {
	let i = e._zod.def, a = sm(i.innerType, t, r), o = t.seen.get(e);
	t.target === "openapi-3.0" ? (o.ref = i.innerType, n.nullable = !0) : n.anyOf = [a, { type: "null" }];
}, Tm = (e, t, n, r) => {
	let i = e._zod.def;
	sm(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Em = (e, t, n, r) => {
	let i = e._zod.def;
	sm(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.default = JSON.parse(JSON.stringify(i.defaultValue));
}, Dm = (e, t, n, r) => {
	let i = e._zod.def;
	sm(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(i.defaultValue)));
}, Om = (e, t, n, r) => {
	let i = e._zod.def;
	sm(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
	let o;
	try {
		o = i.catchValue(void 0);
	} catch {
		throw Error("Dynamic catch values are not supported in JSON Schema");
	}
	n.default = o;
}, km = (e, t, n, r) => {
	let i = e._zod.def, a = i.in._zod.traits.has("$ZodTransform"), o = t.io === "input" ? a ? i.out : i.in : i.out;
	sm(o, t, r);
	let s = t.seen.get(e);
	s.ref = o;
}, Am = (e, t, n, r) => {
	let i = e._zod.def;
	sm(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType, n.readOnly = !0;
}, jm = (e, t, n, r) => {
	let i = e._zod.def;
	sm(i.innerType, t, r);
	let a = t.seen.get(e);
	a.ref = i.innerType;
}, Mm = /* @__PURE__ */ Y("ZodISODateTime", (e, t) => {
	pf.init(e, t), ah.init(e, t);
});
function Nm(e) {
	return /* @__PURE__ */ Pp(Mm, e);
}
var Pm = /* @__PURE__ */ Y("ZodISODate", (e, t) => {
	mf.init(e, t), ah.init(e, t);
});
function Fm(e) {
	return /* @__PURE__ */ Fp(Pm, e);
}
var Im = /* @__PURE__ */ Y("ZodISOTime", (e, t) => {
	hf.init(e, t), ah.init(e, t);
});
function Lm(e) {
	return /* @__PURE__ */ Ip(Im, e);
}
var Rm = /* @__PURE__ */ Y("ZodISODuration", (e, t) => {
	gf.init(e, t), ah.init(e, t);
});
function zm(e) {
	return /* @__PURE__ */ Lp(Rm, e);
}
var Bm = /* @__PURE__ */ Y("ZodError", (e, t) => {
	Gu.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
		format: { value: (t) => Ju(e, t) },
		flatten: { value: (t) => qu(e, t) },
		addIssue: { value: (t) => {
			e.issues.push(t), e.message = JSON.stringify(e.issues, du, 2);
		} },
		addIssues: { value: (t) => {
			e.issues.push(...t), e.message = JSON.stringify(e.issues, du, 2);
		} },
		isEmpty: { get() {
			return e.issues.length === 0;
		} }
	});
}, { Parent: Error }), Vm = /* @__PURE__ */ Yu(Bm), Hm = /* @__PURE__ */ Xu(Bm), Um = /* @__PURE__ */ Zu(Bm), Wm = /* @__PURE__ */ $u(Bm), Gm = /* @__PURE__ */ td(Bm), Km = /* @__PURE__ */ nd(Bm), qm = /* @__PURE__ */ rd(Bm), Jm = /* @__PURE__ */ id(Bm), Ym = /* @__PURE__ */ ad(Bm), Xm = /* @__PURE__ */ od(Bm), Zm = /* @__PURE__ */ sd(Bm), Qm = /* @__PURE__ */ cd(Bm), $m = /* @__PURE__ */ new WeakMap();
function eh(e, t, n) {
	let r = Object.getPrototypeOf(e), i = $m.get(r);
	if (i || (i = /* @__PURE__ */ new Set(), $m.set(r, i)), !i.has(t)) {
		i.add(t);
		for (let e in n) {
			let t = n[e];
			Object.defineProperty(r, e, {
				configurable: !0,
				enumerable: !1,
				get() {
					let n = t.bind(this);
					return Object.defineProperty(this, e, {
						configurable: !0,
						writable: !0,
						enumerable: !0,
						value: n
					}), n;
				},
				set(t) {
					Object.defineProperty(this, e, {
						configurable: !0,
						writable: !0,
						enumerable: !0,
						value: t
					});
				}
			});
		}
	}
}
var th = /* @__PURE__ */ Y("ZodType", (e, t) => (Qd.init(e, t), Object.assign(e["~standard"], { jsonSchema: {
	input: fm(e, "input"),
	output: fm(e, "output")
} }), e.toJSONSchema = dm(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.parse = (t, n) => Vm(e, t, n, { callee: e.parse }), e.safeParse = (t, n) => Um(e, t, n), e.parseAsync = async (t, n) => Hm(e, t, n, { callee: e.parseAsync }), e.safeParseAsync = async (t, n) => Wm(e, t, n), e.spa = e.safeParseAsync, e.encode = (t, n) => Gm(e, t, n), e.decode = (t, n) => Km(e, t, n), e.encodeAsync = async (t, n) => qm(e, t, n), e.decodeAsync = async (t, n) => Jm(e, t, n), e.safeEncode = (t, n) => Ym(e, t, n), e.safeDecode = (t, n) => Xm(e, t, n), e.safeEncodeAsync = async (t, n) => Zm(e, t, n), e.safeDecodeAsync = async (t, n) => Qm(e, t, n), eh(e, "ZodType", {
	check(...e) {
		let t = this.def;
		return this.clone(vu(t, { checks: [...t.checks ?? [], ...e.map((e) => typeof e == "function" ? { _zod: {
			check: e,
			def: { check: "custom" },
			onattach: []
		} } : e)] }), { parent: !0 });
	},
	with(...e) {
		return this.check(...e);
	},
	clone(e, t) {
		return Ou(this, e, t);
	},
	brand() {
		return this;
	},
	register(e, t) {
		return e.add(this, t), this;
	},
	refine(e, t) {
		return this.check(cg(e, t));
	},
	superRefine(e, t) {
		return this.check(lg(e, t));
	},
	overwrite(e) {
		return this.check(/* @__PURE__ */ Xp(e));
	},
	optional() {
		return Wh(this);
	},
	exactOptional() {
		return Kh(this);
	},
	nullable() {
		return Jh(this);
	},
	nullish() {
		return Wh(Jh(this));
	},
	nonoptional(e) {
		return eg(this, e);
	},
	array() {
		return Mh(this);
	},
	or(e) {
		return Ih([this, e]);
	},
	and(e) {
		return Rh(this, e);
	},
	transform(e) {
		return ig(this, Hh(e));
	},
	default(e) {
		return Xh(this, e);
	},
	prefault(e) {
		return Qh(this, e);
	},
	catch(e) {
		return ng(this, e);
	},
	pipe(e) {
		return ig(this, e);
	},
	readonly() {
		return og(this);
	},
	describe(e) {
		let t = this.clone();
		return up.add(t, { description: e }), t;
	},
	meta(...e) {
		if (e.length === 0) return up.get(this);
		let t = this.clone();
		return up.add(t, e[0]), t;
	},
	isOptional() {
		return this.safeParse(void 0).success;
	},
	isNullable() {
		return this.safeParse(null).success;
	},
	apply(e) {
		return e(this);
	}
}), Object.defineProperty(e, "description", {
	get() {
		return up.get(e)?.description;
	},
	configurable: !0
}), e)), nh = /* @__PURE__ */ Y("_ZodString", (e, t) => {
	$d.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => mm(e, t, n, r);
	let n = e._zod.bag;
	e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, eh(e, "_ZodString", {
		regex(...e) {
			return this.check(/* @__PURE__ */ Wp(...e));
		},
		includes(...e) {
			return this.check(/* @__PURE__ */ qp(...e));
		},
		startsWith(...e) {
			return this.check(/* @__PURE__ */ Jp(...e));
		},
		endsWith(...e) {
			return this.check(/* @__PURE__ */ Yp(...e));
		},
		min(...e) {
			return this.check(/* @__PURE__ */ Hp(...e));
		},
		max(...e) {
			return this.check(/* @__PURE__ */ Vp(...e));
		},
		length(...e) {
			return this.check(/* @__PURE__ */ Up(...e));
		},
		nonempty(...e) {
			return this.check(/* @__PURE__ */ Hp(1, ...e));
		},
		lowercase(e) {
			return this.check(/* @__PURE__ */ Gp(e));
		},
		uppercase(e) {
			return this.check(/* @__PURE__ */ Kp(e));
		},
		trim() {
			return this.check(/* @__PURE__ */ Qp());
		},
		normalize(...e) {
			return this.check(/* @__PURE__ */ Zp(...e));
		},
		toLowerCase() {
			return this.check(/* @__PURE__ */ $p());
		},
		toUpperCase() {
			return this.check(/* @__PURE__ */ em());
		},
		slugify() {
			return this.check(/* @__PURE__ */ tm());
		}
	});
}), rh = /* @__PURE__ */ Y("ZodString", (e, t) => {
	$d.init(e, t), nh.init(e, t), e.email = (t) => e.check(/* @__PURE__ */ fp(oh, t)), e.url = (t) => e.check(/* @__PURE__ */ vp(lh, t)), e.jwt = (t) => e.check(/* @__PURE__ */ Np(wh, t)), e.emoji = (t) => e.check(/* @__PURE__ */ yp(uh, t)), e.guid = (t) => e.check(/* @__PURE__ */ pp(sh, t)), e.uuid = (t) => e.check(/* @__PURE__ */ mp(ch, t)), e.uuidv4 = (t) => e.check(/* @__PURE__ */ hp(ch, t)), e.uuidv6 = (t) => e.check(/* @__PURE__ */ gp(ch, t)), e.uuidv7 = (t) => e.check(/* @__PURE__ */ _p(ch, t)), e.nanoid = (t) => e.check(/* @__PURE__ */ bp(dh, t)), e.guid = (t) => e.check(/* @__PURE__ */ pp(sh, t)), e.cuid = (t) => e.check(/* @__PURE__ */ xp(fh, t)), e.cuid2 = (t) => e.check(/* @__PURE__ */ Sp(ph, t)), e.ulid = (t) => e.check(/* @__PURE__ */ Cp(mh, t)), e.base64 = (t) => e.check(/* @__PURE__ */ Ap(xh, t)), e.base64url = (t) => e.check(/* @__PURE__ */ jp(Sh, t)), e.xid = (t) => e.check(/* @__PURE__ */ wp(hh, t)), e.ksuid = (t) => e.check(/* @__PURE__ */ Tp(gh, t)), e.ipv4 = (t) => e.check(/* @__PURE__ */ Ep(_h, t)), e.ipv6 = (t) => e.check(/* @__PURE__ */ Dp(vh, t)), e.cidrv4 = (t) => e.check(/* @__PURE__ */ Op(yh, t)), e.cidrv6 = (t) => e.check(/* @__PURE__ */ kp(bh, t)), e.e164 = (t) => e.check(/* @__PURE__ */ Mp(Ch, t)), e.datetime = (t) => e.check(Nm(t)), e.date = (t) => e.check(Fm(t)), e.time = (t) => e.check(Lm(t)), e.duration = (t) => e.check(zm(t));
});
function ih(e) {
	return /* @__PURE__ */ dp(rh, e);
}
var ah = /* @__PURE__ */ Y("ZodStringFormat", (e, t) => {
	ef.init(e, t), nh.init(e, t);
}), oh = /* @__PURE__ */ Y("ZodEmail", (e, t) => {
	rf.init(e, t), ah.init(e, t);
}), sh = /* @__PURE__ */ Y("ZodGUID", (e, t) => {
	tf.init(e, t), ah.init(e, t);
}), ch = /* @__PURE__ */ Y("ZodUUID", (e, t) => {
	nf.init(e, t), ah.init(e, t);
}), lh = /* @__PURE__ */ Y("ZodURL", (e, t) => {
	af.init(e, t), ah.init(e, t);
}), uh = /* @__PURE__ */ Y("ZodEmoji", (e, t) => {
	of.init(e, t), ah.init(e, t);
}), dh = /* @__PURE__ */ Y("ZodNanoID", (e, t) => {
	sf.init(e, t), ah.init(e, t);
}), fh = /* @__PURE__ */ Y("ZodCUID", (e, t) => {
	cf.init(e, t), ah.init(e, t);
}), ph = /* @__PURE__ */ Y("ZodCUID2", (e, t) => {
	lf.init(e, t), ah.init(e, t);
}), mh = /* @__PURE__ */ Y("ZodULID", (e, t) => {
	uf.init(e, t), ah.init(e, t);
}), hh = /* @__PURE__ */ Y("ZodXID", (e, t) => {
	df.init(e, t), ah.init(e, t);
}), gh = /* @__PURE__ */ Y("ZodKSUID", (e, t) => {
	ff.init(e, t), ah.init(e, t);
}), _h = /* @__PURE__ */ Y("ZodIPv4", (e, t) => {
	_f.init(e, t), ah.init(e, t);
}), vh = /* @__PURE__ */ Y("ZodIPv6", (e, t) => {
	vf.init(e, t), ah.init(e, t);
}), yh = /* @__PURE__ */ Y("ZodCIDRv4", (e, t) => {
	yf.init(e, t), ah.init(e, t);
}), bh = /* @__PURE__ */ Y("ZodCIDRv6", (e, t) => {
	bf.init(e, t), ah.init(e, t);
}), xh = /* @__PURE__ */ Y("ZodBase64", (e, t) => {
	Sf.init(e, t), ah.init(e, t);
}), Sh = /* @__PURE__ */ Y("ZodBase64URL", (e, t) => {
	wf.init(e, t), ah.init(e, t);
}), Ch = /* @__PURE__ */ Y("ZodE164", (e, t) => {
	Tf.init(e, t), ah.init(e, t);
}), wh = /* @__PURE__ */ Y("ZodJWT", (e, t) => {
	Df.init(e, t), ah.init(e, t);
}), Th = /* @__PURE__ */ Y("ZodBoolean", (e, t) => {
	Of.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => hm(e, t, n, r);
});
function Eh(e) {
	return /* @__PURE__ */ Rp(Th, e);
}
var Dh = /* @__PURE__ */ Y("ZodUnknown", (e, t) => {
	kf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (e, t, n) => void 0;
});
function Oh() {
	return /* @__PURE__ */ zp(Dh);
}
var kh = /* @__PURE__ */ Y("ZodNever", (e, t) => {
	Af.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => gm(e, t, n, r);
});
function Ah(e) {
	return /* @__PURE__ */ Bp(kh, e);
}
var jh = /* @__PURE__ */ Y("ZodArray", (e, t) => {
	Mf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => bm(e, t, n, r), e.element = t.element, eh(e, "ZodArray", {
		min(e, t) {
			return this.check(/* @__PURE__ */ Hp(e, t));
		},
		nonempty(e) {
			return this.check(/* @__PURE__ */ Hp(1, e));
		},
		max(e, t) {
			return this.check(/* @__PURE__ */ Vp(e, t));
		},
		length(e, t) {
			return this.check(/* @__PURE__ */ Up(e, t));
		},
		unwrap() {
			return this.element;
		}
	});
});
function Mh(e, t) {
	return /* @__PURE__ */ nm(jh, e, t);
}
var Nh = /* @__PURE__ */ Y("ZodObject", (e, t) => {
	Lf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => xm(e, t, n, r), gu(e, "shape", () => t.shape), eh(e, "ZodObject", {
		keyof() {
			return Bh(Object.keys(this._zod.def.shape));
		},
		catchall(e) {
			return this.clone({
				...this._zod.def,
				catchall: e
			});
		},
		passthrough() {
			return this.clone({
				...this._zod.def,
				catchall: Oh()
			});
		},
		loose() {
			return this.clone({
				...this._zod.def,
				catchall: Oh()
			});
		},
		strict() {
			return this.clone({
				...this._zod.def,
				catchall: Ah()
			});
		},
		strip() {
			return this.clone({
				...this._zod.def,
				catchall: void 0
			});
		},
		extend(e) {
			return Mu(this, e);
		},
		safeExtend(e) {
			return Nu(this, e);
		},
		merge(e) {
			return Pu(this, e);
		},
		pick(e) {
			return Au(this, e);
		},
		omit(e) {
			return ju(this, e);
		},
		partial(...e) {
			return Fu(Uh, this, e[0]);
		},
		required(...e) {
			return Iu($h, this, e[0]);
		}
	});
});
function Ph(e, t) {
	return new Nh({
		type: "object",
		shape: e ?? {},
		...X(t)
	});
}
var Fh = /* @__PURE__ */ Y("ZodUnion", (e, t) => {
	zf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => Sm(e, t, n, r), e.options = t.options;
});
function Ih(e, t) {
	return new Fh({
		type: "union",
		options: e,
		...X(t)
	});
}
var Lh = /* @__PURE__ */ Y("ZodIntersection", (e, t) => {
	Bf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => Cm(e, t, n, r);
});
function Rh(e, t) {
	return new Lh({
		type: "intersection",
		left: e,
		right: t
	});
}
var zh = /* @__PURE__ */ Y("ZodEnum", (e, t) => {
	Uf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => _m(e, t, n, r), e.enum = t.entries, e.options = Object.values(t.entries);
	let n = new Set(Object.keys(t.entries));
	e.extract = (e, r) => {
		let i = {};
		for (let r of e) if (n.has(r)) i[r] = t.entries[r];
		else throw Error(`Key ${r} not found in enum`);
		return new zh({
			...t,
			checks: [],
			...X(r),
			entries: i
		});
	}, e.exclude = (e, r) => {
		let i = { ...t.entries };
		for (let t of e) if (n.has(t)) delete i[t];
		else throw Error(`Key ${t} not found in enum`);
		return new zh({
			...t,
			checks: [],
			...X(r),
			entries: i
		});
	};
});
function Bh(e, t) {
	return new zh({
		type: "enum",
		entries: Array.isArray(e) ? Object.fromEntries(e.map((e) => [e, e])) : e,
		...X(t)
	});
}
var Vh = /* @__PURE__ */ Y("ZodTransform", (e, t) => {
	Wf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => ym(e, t, n, r), e._zod.parse = (n, r) => {
		if (r.direction === "backward") throw new su(e.constructor.name);
		n.addIssue = (r) => {
			if (typeof r == "string") n.issues.push(Uu(r, n.value, t));
			else {
				let t = r;
				t.fatal && (t.continue = !1), t.code ??= "custom", t.input ??= n.value, t.inst ??= e, n.issues.push(Uu(t));
			}
		};
		let i = t.transform(n.value, n);
		return i instanceof Promise ? i.then((e) => (n.value = e, n.fallback = !0, n)) : (n.value = i, n.fallback = !0, n);
	};
});
function Hh(e) {
	return new Vh({
		type: "transform",
		transform: e
	});
}
var Uh = /* @__PURE__ */ Y("ZodOptional", (e, t) => {
	Kf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => jm(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Wh(e) {
	return new Uh({
		type: "optional",
		innerType: e
	});
}
var Gh = /* @__PURE__ */ Y("ZodExactOptional", (e, t) => {
	qf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => jm(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Kh(e) {
	return new Gh({
		type: "optional",
		innerType: e
	});
}
var qh = /* @__PURE__ */ Y("ZodNullable", (e, t) => {
	Jf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => wm(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Jh(e) {
	return new qh({
		type: "nullable",
		innerType: e
	});
}
var Yh = /* @__PURE__ */ Y("ZodDefault", (e, t) => {
	Yf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => Em(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Xh(e, t) {
	return new Yh({
		type: "default",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Tu(t);
		}
	});
}
var Zh = /* @__PURE__ */ Y("ZodPrefault", (e, t) => {
	Zf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => Dm(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function Qh(e, t) {
	return new Zh({
		type: "prefault",
		innerType: e,
		get defaultValue() {
			return typeof t == "function" ? t() : Tu(t);
		}
	});
}
var $h = /* @__PURE__ */ Y("ZodNonOptional", (e, t) => {
	Qf.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => Tm(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function eg(e, t) {
	return new $h({
		type: "nonoptional",
		innerType: e,
		...X(t)
	});
}
var tg = /* @__PURE__ */ Y("ZodCatch", (e, t) => {
	ep.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => Om(e, t, n, r), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function ng(e, t) {
	return new tg({
		type: "catch",
		innerType: e,
		catchValue: typeof t == "function" ? t : () => t
	});
}
var rg = /* @__PURE__ */ Y("ZodPipe", (e, t) => {
	tp.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => km(e, t, n, r), e.in = t.in, e.out = t.out;
});
function ig(e, t) {
	return new rg({
		type: "pipe",
		in: e,
		out: t
	});
}
var ag = /* @__PURE__ */ Y("ZodReadonly", (e, t) => {
	rp.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => Am(e, t, n, r), e.unwrap = () => e._zod.def.innerType;
});
function og(e) {
	return new ag({
		type: "readonly",
		innerType: e
	});
}
var sg = /* @__PURE__ */ Y("ZodCustom", (e, t) => {
	ap.init(e, t), th.init(e, t), e._zod.processJSONSchema = (t, n, r) => vm(e, t, n, r);
});
function cg(e, t = {}) {
	return /* @__PURE__ */ rm(sg, e, t);
}
function lg(e, t) {
	return /* @__PURE__ */ im(e, t);
}
//#endregion
//#region src/main/javascript/CommandDefinition.ts
var ug = class {
	name;
	description;
	args;
	options;
	handler;
	effect;
	constructor(e, t, n, r, i, a = "read") {
		this.name = e, this.description = t, this.args = r ?? [], this.options = i ?? {}, this.handler = n, this.effect = a;
	}
	addToProgram(e, t) {
		let n = e.command(this.name).description(this.description);
		for (let e of this.args) n.argument(`<${e.name}${e.variadic ? "..." : ""}>`, e.description);
		for (let [e, t] of Object.entries(this.options)) n.option(`--${ye(e)}${t.type === "string" ? " <value>" : ""}`, t.description);
		n.action(t(this.handler));
	}
	addToMcpServer(e, t) {
		let n = {};
		for (let e of this.args) {
			let t = ge(e.name);
			n[t] = e.variadic ? Mh(ih()).describe(e.description) : ih().describe(e.description);
		}
		for (let [e, t] of Object.entries(this.options)) t.cliOnly || (n[e] = (t.type === "boolean" ? Eh() : ih()).optional().describe(t.description));
		e.registerTool(this.name.replace(/-/g, "_"), {
			description: this.description,
			inputSchema: Ph(n),
			annotations: this.effect === "read" ? { readOnlyHint: !0 } : {
				readOnlyHint: !1,
				destructiveHint: this.effect === "destructive"
			}
		}, async (e) => {
			let n = this.args.map((t) => e[ge(t.name)]), r = {};
			return this.options && (r = Object.fromEntries(Object.entries(this.options).map(([t]) => [t, e[t]]))), t(this.handler, n, r);
		});
	}
}, dg = /[<>:"/\\|?*\x00-\x1F]+/g, fg = (e, t = "s", n = !1) => {
	if (e < 0) return "";
	let r = B.duration(Math.abs(e), "ms"), i = r.hours().toString(), a = r.minutes().toString().padStart(2, "0"), o = r.seconds().toString().padStart(2, "0");
	if (t === "ms") {
		let e = Math.floor(r.milliseconds()).toString().padStart(3, "0");
		return `${n ? `${i}:` : ""}${a}:${o}.${e}`;
	}
	return `${n ? `${i}:` : ""}${a}:${o}`;
}, pg = (e) => `${e.rangeStart}-${e.rangeEnd} ms${e.text ? ` (${e.text})` : ""}`, mg = (e, t) => e.find((e) => e.name.toLocaleLowerCase() === t.trim().toLocaleLowerCase()), hg = (e, t, n) => {
	let r = mg(e, t);
	if (!r) throw new J(`Annotation named ${t} not found in study ${n.name}. Available annotations:\n${e.map((e) => e.name).toSorted((e, t) => e.localeCompare(t, void 0, { numeric: !0 })).join("\n")}`);
	return r;
}, gg = (e, t, n) => {
	let r = e.getSortedFragmentsForStimulus(t.id), i = r.find((e) => e.rangeStart === n);
	if (!i) throw new J(r.length === 0 ? `The annotation ${e.name} has no intervals on stimulus ${t.displayName}.` : `No interval of annotation ${e.name} starts at ${n} ms on stimulus ${t.displayName}. Existing intervals:\n${r.map(pg).join("\n")}`);
	return i;
}, _g = (e, t) => {
	let n = Number(t);
	if (!Number.isInteger(n) || n < 0) throw new J(`${e} must be a whole non-negative number of milliseconds, got "${t}".`);
	return n;
}, vg = (e) => {
	if (e.isVideoSceneAnnotation()) throw new J(`The annotation named ${e.name} is automatically generated from video scene detection and cannot be changed.`);
	if (e.locked) throw new J(`The annotation named ${e.name} is locked and cannot be changed.`);
}, yg = (e, t, n, r, i) => {
	let a = e.getSortedFragmentsForStimulus(t.id).filter((e) => e.id !== i && e.rangeStart < r && e.rangeEnd > n);
	if (a.length > 0) throw new J(`The interval ${n}-${r} ms overlaps existing intervals of the annotation ${e.name} on stimulus ${t.displayName}:\n${a.map(pg).join("\n")}`);
}, bg = /* @__PURE__ */ p(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), Z = (/* @__PURE__ */ p(((e, t) => {
	t.exports = bg();
})))(), xg = () => "\n", Q = ({ variant: e = "body1", gutterBottom: t = !1, children: n }) => e === "body1" ? /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
	n,
	/* @__PURE__ */ (0, Z.jsx)(xg, {}),
	t && /* @__PURE__ */ (0, Z.jsx)(xg, {})
] }) : /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
	"#".repeat(parseInt(e.slice(1), 10)),
	" ",
	n,
	/* @__PURE__ */ (0, Z.jsx)(xg, {}),
	t && /* @__PURE__ */ (0, Z.jsx)(xg, {})
] }), Sg = ({ children: e }) => /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
	"- ",
	e,
	/* @__PURE__ */ (0, Z.jsx)(xg, {})
] }), Cg = ({ children: e }) => /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
	"---",
	/* @__PURE__ */ (0, Z.jsx)(xg, {}),
	"⚠️ **WARNING** ",
	e,
	/* @__PURE__ */ (0, Z.jsx)(xg, {}),
	"---",
	/* @__PURE__ */ (0, Z.jsx)(xg, {})
] }), wg = ({ spacing: e, children: t }) => {
	let n = Ee.Children.toArray(t);
	return /* @__PURE__ */ (0, Z.jsx)(Z.Fragment, { children: n.map((t, r) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [t, r < n.length - 1 && Array.from({ length: e }).map((e, t) => /* @__PURE__ */ (0, Z.jsx)(xg, {}, t))] }, r)) });
}, $ = ({ children: e }) => e, Tg = async ({ api: e }, t, n, r, i, a, o) => {
	let s = await e.getStudyByName(t), c = Kl(s, r), l = _g("start-ms", i), u = _g("end-ms", a);
	if (l >= u) throw new J(`start-ms (${l}) must be less than end-ms (${u}).`);
	let d = o.respondent ? ql(s, o.respondent) : null, f = n.trim();
	if (!f) throw new J("The annotation name cannot be empty.");
	let p = await e.getAnnotations(s.id), m = mg(p, f), h = !1;
	if (m) vg(m), yg(m, c, l, u);
	else {
		if (Fl.test(f)) throw new J(`The name ${f} is reserved for automatically generated video scene annotations. Please choose another name.`);
		if (f.match(dg)) throw new J("The annotation name can only include letters, numbers and spaces.");
		m = await e.createAnnotation(s.id, {
			name: f,
			displayColor: Ml(p.map((e) => e.displayColor)),
			hotKey: 0,
			locked: !1
		}), h = !0;
	}
	let g = await e.createAnnotationFragment(s.id, {
		annotation: { id: m.id },
		stimuli: { id: c.id },
		respondent: d ? { id: d.id } : null,
		text: o.text ?? null,
		rangeStart: l,
		rangeEnd: u,
		imageUrl: null
	});
	return /* @__PURE__ */ (0, Z.jsxs)($, { children: [
		/* @__PURE__ */ (0, Z.jsx)(Q, {
			variant: "h1",
			children: "Annotation interval added"
		}),
		h && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"The annotation ",
			m.name,
			" did not exist in study ",
			s.name,
			", so it was created."
		] }),
		/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"Interval ",
			fg(l, "ms"),
			"-",
			fg(u, "ms"),
			" added to annotation",
			" ",
			m.name,
			" on stimulus ",
			c.displayName,
			d && ` for respondent ${d.label}`,
			"."
		] }),
		/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["ID: ", g.id] })
	] });
}, Eg = async (e, t, n) => {
	let { segment: r, respondent: i, stimulus: a, annotation: o, startMs: s } = n;
	if (o !== void 0) {
		if (a === void 0 || s === void 0) throw new J("A note on an annotation interval requires --annotation, --stimulus and --start-ms together.");
		if (r !== void 0 || i !== void 0) throw new J("A note can only be attached to one thing at a time.");
		let n = Kl(t, a), c = hg(await e.getAnnotations(t.id), o, t);
		return {
			targetType: "ANNOTATION_FRAGMENT",
			targetId: gg(c, n, _g("--start-ms", s)).id,
			description: `the interval of annotation ${c.name} on stimulus ${n.displayName}`
		};
	}
	if ([
		r,
		i,
		a
	].filter((e) => e !== void 0).length > 1) throw new J("A note can only be attached to one thing at a time.");
	if (s !== void 0) throw new J("--start-ms is only used together with --annotation and --stimulus.");
	if (r !== void 0) {
		let e = Gl(t, r);
		return {
			targetType: "SEGMENT",
			targetId: e.id,
			description: `segment ${e.name}`
		};
	}
	if (i !== void 0) {
		let e = ql(t, i);
		return {
			targetType: "RESPONDENT",
			targetId: e.id,
			description: `respondent ${e.label}`
		};
	}
	if (a !== void 0) {
		let e = Kl(t, a);
		return {
			targetType: "STIMULUS",
			targetId: e.id,
			description: `stimulus ${e.displayName}`
		};
	}
	return {
		targetType: "STUDY",
		targetId: t.id,
		description: "the study"
	};
}, Dg = 2048, Og = async ({ api: e }, t, n, r) => {
	let i = await e.getStudyByName(t);
	if (!n.trim()) throw new J("The note text cannot be empty.");
	if (n.trim().length > Dg) throw new J(`The note text can be at most ${Dg} characters long, but was ${n.trim().length}. Shorten the note and try again.`);
	let a = await Eg(e, i, r), o = await e.createNote(i.id, {
		targetType: a.targetType,
		targetId: a.targetId,
		text: n.trim()
	});
	return /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
		variant: "h1",
		children: "Note added"
	}), /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
		"Added a note to ",
		a.description,
		" in study ",
		i.name,
		". It is visible to the user in the web interface. The note ID is ",
		o.id,
		"."
	] })] });
}, kg = (e, t, n, r) => {
	if (!t || !n) return;
	let i = t.getSortedFragmentsForStimulus(e.id);
	if (!i.length) return;
	let a = { metrics: {} }, o = n.collectedSensors.find((e) => e.sensor === "Affectiva AFFDEX" || e.sensor === "MA Facial Analysis")?.signals;
	if (!o?.length) return;
	let s = new Map(i.map((e) => [e, {}]));
	return o.forEach((e) => {
		let t = e.name, n = e.timeline;
		if (!n.length) return;
		let r = (e, n) => {
			n.length && (s.get(e)[t] = n.reduce((e, t) => e + t, 0) / n.length);
		}, o = [], c = [], l = 0, u = 0, d = -1;
		for (; l < n.length && u < i.length;) {
			let e = i[u], t = n[l];
			if (t[0] < e.rangeStart) l++;
			else if (t[0] > e.rangeEnd) r(e, c), c = [], u++;
			else {
				c.push(t[1]), d !== l && (o.push(t[1]), d = l);
				let n = i[u + 1];
				t[0] === e.rangeEnd && n?.rangeStart === t[0] ? (r(e, c), c = [], u++) : l++;
			}
		}
		u < i.length && r(i[u], c), o.length && (a.metrics[t] = o.reduce((e, t) => e + t, 0) / o.length);
	}), {
		annotation: t,
		aggregatedFragmentsInfo: a,
		orderedFragmentsInfo: Array.from(s.entries()).map(([e, t]) => ({
			fragment: e,
			metrics: t
		})),
		contextLabel: r
	};
}, Ag = /* @__PURE__ */ p(((e, t) => {
	function n(e) {
		return e >= 55296 && e <= 56319;
	}
	function r(e) {
		return e >= 56320 && e <= 57343;
	}
	t.exports = function(e, t, i) {
		if (typeof t != "string") throw Error("Input must be string");
		for (var a = t.length, o = 0, s, c, l = 0; l < a; l += 1) {
			if (s = t.charCodeAt(l), c = t[l], n(s) && r(t.charCodeAt(l + 1)) && (l += 1, c += t[l]), o += e(c), o === i) return t.slice(0, l + 1);
			if (o > i) return t.slice(0, l - c.length + 1);
		}
		return t;
	};
})), jg = /* @__PURE__ */ p(((e, t) => {
	var n = Ag(), r = Buffer.byteLength.bind(Buffer);
	t.exports = n.bind(null, r);
})), Mg = /* @__PURE__ */ h((/* @__PURE__ */ p(((e, t) => {
	var n = jg(), r = /[\/\?<>\\:\*\|"]/g, i = /[\x00-\x1f\x80-\x9f]/g, a = /^\.+$/, o = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, s = /[\. ]+$/;
	function c(e, t) {
		if (typeof e != "string") throw Error("Input must be string");
		return n(e.replace(r, t).replace(i, t).replace(a, t).replace(o, t).replace(s, t), 255);
	}
	t.exports = function(e, t) {
		var n = t && t.replacement || "", r = c(e, n);
		return n === "" ? r : c(r, "");
	};
})))(), 1), Ng = (e, t, n = globalThis) => {
	let r = n.document.createElement("a");
	r.download = (0, Mg.default)(t), r.href = e;
	let i = n.document.createEvent("MouseEvents");
	i.initMouseEvent("click", !0, !1, n.window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), r.dispatchEvent(i);
}, Pg = (e, t, n = globalThis) => {
	let r = URL.createObjectURL(e);
	Ng(r, t, n), n.setTimeout(() => {
		URL.revokeObjectURL(r);
	}, 5e3);
}, Fg = (e, t, n = "text/plain", r = globalThis) => {
	Pg(new Blob([e], { type: n }), t, r);
}, Ig = new Pe("CsvFormatter"), Lg = (e) => "Intl" in globalThis ? new Intl.NumberFormat(e, { useGrouping: !1 }) : { format(e) {
	return `${e}`;
} }, Rg = class {
	separator;
	numberFormat;
	linebreak;
	excel;
	dateFormat;
	constructor(e, t, n = "\r\n", r = !0) {
		this.separator = e, this.numberFormat = Lg(t), this.linebreak = n, this.excel = r, this.dateFormat = "YYYY-MM-DD HH:mm:ss";
	}
	generateCsvString(e) {
		let t = e.map((e) => e.map((e) => this.escapeString(this.formatValueAsString(e))).join(this.separator));
		return this.excel && t.unshift(`sep=${this.separator}`), t.join(this.linebreak);
	}
	formatValueAsString(e) {
		if (e == null) return "";
		if (B.isMoment(e)) {
			let t = -(/* @__PURE__ */ new Date()).getTimezoneOffset();
			return e.clone().utcOffset(t).format(this.dateFormat);
		}
		return typeof e == "number" ? this.numberFormat.format(e) : typeof e == "string" && /^[=+\-@\t\r]/.test(e) && this.excel ? `'${e}` : `${e}`;
	}
	escapeString(e) {
		let t = e;
		return e.includes("\"") && (t = e.replace(/"/g, "\"\"")), (e.includes(this.separator) || e.includes("\"") || e.includes("\r") || e.includes("\n")) && (t = `"${t}"`), t;
	}
	triggerDownload(e, t, n = globalThis) {
		Fg(this.generateCsvString(t), `${e}.csv`, "text/csv", n), Ig.info("Downloaded CSV file: ", e);
	}
}, zg = (e, t) => {
	let r = new Rg(",", "en", "\n", !1).generateCsvString(e);
	if (!t) return /* @__PURE__ */ (0, Z.jsx)(Z.Fragment, { children: r });
	let a = n.resolve(t);
	try {
		i.writeFileSync(a, r);
	} catch (e) {
		throw new J(`Unable to write to ${a}: ${e instanceof Error ? e.message : "Unknown error"}`);
	}
	return /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
		"Wrote ",
		e.length - 1,
		" rows to ",
		a
	] });
}, Bg = async ({ api: e }, t, { stimulus: n, segment: r, annotation: i, aggregatedIntervals: a, output: o }) => {
	let s = await e.getStudyByName(t), c = n ? [Kl(s, n)] : s.getOrderedStimuliForOnlineAnalysis(), l = r ? [Gl(s, r)] : s.getOrderedSegments(), u = await e.getAnnotations(s.id), d = i ? u.filter((e) => e.name.toLocaleLowerCase() === i.toLocaleLowerCase()) : u;
	if (d.length === 0) throw new J(i ? `No annotation named ${i} was found in ${s.name}.` : `The study ${s.name} has no annotations. They can be defined manually or with automatic scene detection on the study analysis page.`);
	let f = d.toSorted((e, t) => e.name.localeCompare(t.name, void 0, { numeric: !0 })), p = (await Wl(c.flatMap((e) => l.map((t) => ({
		stim: e,
		seg: t
	}))), async ({ stim: t, seg: n }) => {
		let r = t.getDataForSegment(n.id);
		if (!r) return [];
		let i = await e.getSegmentExposureData(r.url);
		return f.flatMap((e) => {
			let r = kg(t, e, i);
			if (!r) return [];
			let o = {
				stimulusName: t.displayName,
				segmentName: n.name,
				annotation: e
			};
			return a || r.orderedFragmentsInfo.length === 0 ? [{
				...o,
				interval: "All intervals",
				rangeStart: "",
				rangeEnd: "",
				metrics: r.aggregatedFragmentsInfo.metrics
			}] : r.orderedFragmentsInfo.map(({ fragment: e, metrics: t }, n) => ({
				...o,
				interval: e.text || `Interval ${n + 1}`,
				rangeStart: e.rangeStart,
				rangeEnd: e.rangeEnd,
				metrics: t
			}));
		});
	})).flat();
	if (p.length === 0) throw new J(`No annotation metrics are available for ${s.name}.`);
	let m = Array.from(new Set(p.flatMap((e) => Object.keys(e.metrics)))).toSorted((e, t) => e.localeCompare(t, void 0, { numeric: !0 }));
	return zg([[
		"Stimulus",
		"Segment",
		"Annotation",
		"Interval",
		"Interval start (ms)",
		"Interval end (ms)",
		...m
	], ...p.map((e) => [
		e.stimulusName,
		e.segmentName,
		e.annotation.name,
		e.interval,
		e.rangeStart,
		e.rangeEnd,
		...m.map((t) => e.metrics[t] ?? "")
	])], o);
}, Vg = 12, Hg = 200, Ug = 5, Wg = 20, Gg = "Webcam eye tracking gaze positions are typically off by 2-5 degrees of visual angle (roughly 5-12% of a desktop screen width, and an even larger share of tablet and phone screens), so small or detailed AOI shapes do not improve the metrics.", Kg = /^#[0-9a-fA-F]{6}$/, qg = (e) => {
	if (!Kg.test(e)) throw new J(`--color must be a hex color like #ffa500, got "${e}".`);
}, Jg = (e, t) => {
	let n = Number(t);
	if (!Number.isFinite(n) || n < 0 || n > 100) throw new J(`${e} must be a number between 0 and 100 (percent of the stimulus size), got "${t}".`);
	return n;
}, Yg = (e, t) => {
	let n = e.split(/[\s,]+/).filter((e) => e.length > 0);
	if (n.length !== 4) throw new J(`${t} must contain four numbers "left top width height" in percent, got "${e}".`);
	let r = {
		left: Jg("left", n[0]),
		top: Jg("top", n[1]),
		width: Jg("width", n[2]),
		height: Jg("height", n[3])
	};
	if (r.width < Ug || r.height < Ug) throw new J(`The AOI must be at least ${Ug} percent of the stimulus size in both dimensions. ${Gg}`);
	if (r.left + r.width > 100 || r.top + r.height > 100) throw new J("The AOI must be entirely within the stimulus, so left+width and top+height cannot exceed 100.");
	return r;
}, Xg = ({ left: e, top: t, width: n, height: r }) => [
	{
		x: e,
		y: t
	},
	{
		x: e + n,
		y: t
	},
	{
		x: e + n,
		y: t + r
	},
	{
		x: e,
		y: t + r
	}
], Zg = (e, t) => {
	let n = e.trim().split(/\s+/).map((e) => {
		let n = e.split(",");
		if (n.length !== 2) throw new J(`${t} must contain comma-separated pairs like "10,25 40,25 25,60", got "${e}".`);
		return {
			x: Jg("x", n[0]),
			y: Jg("y", n[1])
		};
	});
	if (n.length < 3) throw new J(`${t} must contain at least 3 points.`);
	if (n.length > Vg) throw new J(`${t} must contain at most ${Vg} points. ${Gg} Use a simpler shape that is padded generously around the region instead.`);
	let r = n.map((e) => e.x), i = n.map((e) => e.y);
	if (Math.max(...r) - Math.min(...r) < Ug || Math.max(...i) - Math.min(...i) < Ug) throw new J(`The AOI must be at least ${Ug} percent of the stimulus size in both dimensions. ${Gg}`);
	let a = n.map((e, t) => {
		let r = n[(t + 1) % n.length];
		return {
			x1: e.x,
			y1: e.y,
			x2: r.x,
			y2: r.y
		};
	});
	for (let e = 0; e < a.length; e++) for (let t = e + 1; t < a.length; t++) if (Dc(a[e], a[t])) throw new J("The polygon must not intersect itself. List the points in the order they occur along the outline of the shape.");
	return n;
}, Qg = (e) => e.map((e) => `${e.x},${e.y}`).join(" "), $g = (e) => e.map((e) => ({
	x: e.x / 100,
	y: e.y / 100
})), e_ = (e) => {
	let t = e.map((e) => e.x), n = e.map((e) => e.y);
	return Math.min(Math.max(...t) - Math.min(...t), Math.max(...n) - Math.min(...n)) < Wg;
}, t_ = (e) => {
	let t = e.indexOf(":");
	if (t === -1) throw new J(`Each --timeline entry must be "<milliseconds>: <shape>" where the shape is a rectangle, polygon points or the word hidden, got "${e}".`);
	let n = e.slice(0, t).trim(), r = Number(n);
	if (!Number.isInteger(r) || r < 0) throw new J(`Timeline timestamps must be a whole non-negative number of milliseconds from the start of the video, got "${n}".`);
	let i = e.slice(t + 1).trim();
	if (i.toLocaleLowerCase() === "hidden") return {
		ts: r,
		points: [],
		description: `${r} ms: hidden`
	};
	if (i.includes(",")) {
		let e = Zg(i, "--timeline");
		return {
			ts: r,
			points: e,
			description: `${r} ms: polygon with corners at ${Qg(e)}`
		};
	}
	let a = Yg(i, "--timeline");
	return {
		ts: r,
		points: Xg(a),
		description: `${r} ms: rectangle at left ${a.left}, top ${a.top}, width ${a.width}, height ${a.height}`
	};
}, n_ = (e) => {
	let t = e.split(";").map((e) => e.trim()).filter((e) => e.length > 0).map(t_);
	if (t.length < 2) throw new J("--timeline must contain at least 2 entries separated by semicolons. For a single unchanging shape, use --bounds or --points instead.");
	if (t.forEach((e, n) => {
		if (n > 0 && e.ts <= t[n - 1].ts) throw new J(`Timeline timestamps must be increasing, but ${e.ts} ms comes after ${t[n - 1].ts} ms.`);
		if (n > 0 && e.points.length === 0 && t[n - 1].points.length === 0) throw new J(`The timeline entry at ${e.ts} ms is hidden while the shape is already hidden. Each shape applies until the next entry, so remove the redundant entry.`);
	}), t.every((e) => e.points.length === 0)) throw new J("The timeline must contain at least one visible shape.");
	return t;
}, r_ = (e, t, n) => {
	if ([
		e,
		t,
		n
	].filter((e) => e !== void 0).length > 1) throw new J("Specify only one of --bounds, --points or --timeline.");
	if (e !== void 0) {
		let t = Yg(e, "--bounds"), n = Xg(t);
		return {
			timeline: [{
				ts: 0,
				points: $g(n)
			}],
			description: `the area at left ${t.left}, top ${t.top}, width ${t.width}, height ${t.height}`,
			smallerThanRecommended: e_(n)
		};
	}
	if (t !== void 0) {
		let e = Zg(t, "--points");
		return {
			timeline: [{
				ts: 0,
				points: $g(e)
			}],
			description: `the polygon with corners at ${Qg(e)}`,
			smallerThanRecommended: e_(e)
		};
	}
	if (n !== void 0) {
		let e = n_(n);
		return {
			timeline: e.map((e) => ({
				ts: e.ts,
				points: $g(e.points)
			})),
			description: `the moving shape, where each entry applies until the next one: ${e.map((e) => e.description).join("; ")}`,
			smallerThanRecommended: e.some((e) => e.points.length > 0 && e_(e.points))
		};
	}
}, i_ = (e, t) => {
	if (t.timeline.length !== 1) {
		if (e.type !== "VIDEO") throw new J(`--timeline can only be used on video stimuli, and ${e.displayName} is not a video. Use --bounds or --points instead.`);
		if (e.exposureTimeMs > 0) {
			let n = t.timeline[t.timeline.length - 1].ts;
			if (n >= e.exposureTimeMs) throw new J(`The timeline entry at ${n} ms is beyond the end of the video, which is ${e.exposureTimeMs} ms long.`);
			let r = Math.ceil(e.exposureTimeMs / Hg);
			if (t.timeline.length > r) throw new J(`--timeline must contain at most ${r} entries for this ${e.exposureTimeMs} ms long video.`);
		}
	}
}, a_ = (e) => {
	let t = e.deviceTypes.some((e) => e === "TABLET" || e === "PHONE");
	return `Note: this AOI is smaller than the recommended minimum of roughly ${Wg}% of the screen width (about 10 cm on a desktop screen). ${Gg} ` + (t ? "This study also allows tablets or phones, which are smaller and held closer, so the gaze error covers an even larger share of the screen. " : "") + "Research shows that large AOIs are the noise-robust choice, so consider enlarging it if the surrounding content allows.";
}, o_ = (e, t) => e.aoiDefinitions.filter((e) => e.stimuli.id === t), s_ = (e, t, n) => {
	let r = o_(e, t.id), i = r.find((e) => e.name.toLocaleLowerCase() === n.trim().toLocaleLowerCase());
	if (!i) throw new J(r.length === 0 ? `The stimulus ${t.displayName} has no AOIs.` : `AOI named ${n} not found on stimulus ${t.displayName}. Available AOIs:\n${r.map((e) => e.name).toSorted((e, t) => e.localeCompare(t, void 0, { numeric: !0 })).join("\n")}`);
	return i;
}, c_ = (e) => {
	if (e.timelineType === "PER_RESPONDENT") throw new J(`The AOI ${e.name} is defined separately for each respondent and can only be changed in the web interface.`);
}, l_ = (e) => `${Math.round(e * 1e3) / 10}`, u_ = (e) => {
	if (e.points.length !== 4) return !1;
	let t = e.offsetWidth(), n = e.offsetHeight(), r = t + e.width(), i = n + e.height();
	return [
		[t, n],
		[r, n],
		[r, i],
		[t, i]
	].every(([t, n]) => e.points.some((e) => e.x === t && e.y === n));
}, d_ = (e) => {
	if (e.points.length === 0) return "hidden";
	let t = `left ${l_(e.offsetWidth())}, top ${l_(e.offsetHeight())}, width ${l_(e.width())}, height ${l_(e.height())}`;
	return u_(e) ? `rectangle at ${t}` : `polygon with corners at ${e.points.map((e) => `${l_(e.x)},${l_(e.y)}`).join(" ")}`;
}, f_ = (e) => {
	if (e.timelineType === "PER_RESPONDENT") return "Defined separately for each respondent, can only be viewed in the web interface.";
	if (e.isEmpty()) return "No shape defined yet.";
	if (e.timeline.length > 1) return `The shape changes over time, where each entry applies until the next one: ${e.timeline.map((e) => `${e.ts} ms: ${d_(e)}`).join("; ")} (in percent of the stimulus size).`;
	let t = d_(e.timeline[0]);
	return `${t.charAt(0).toLocaleUpperCase()}${t.slice(1)} (in percent of the stimulus size).`;
}, p_ = async ({ api: e }, t, { stimulus: n, segment: r, output: i }) => {
	let a = await e.getStudyByName(t), o = await e.getAoiSet(a.aoiSet.id);
	if (o.aoiDefinitions.length === 0) throw new J(`The study ${a.name} has no AOIs.`);
	if (o.calculatingAois) throw new J("The AOI metrics are being processed, not available yet. Try again in a few minutes.");
	let s = await e.getAoiStats(o.id), c = o.metadata.flatMap((e) => e.Metrics.map((t) => ({
		id: t.Id,
		name: o.metadata.some((n) => n !== e && n.Metrics.some((e) => e.Name === t.Name)) ? `${e.Group} - ${t.Name}` : t.Name
	}))), l = n ? [Kl(a, n)] : a.getOrderedStimuliForOnlineAnalysis(), u = (r ? [Gl(a, r)] : a.getOrderedSegments()).flatMap((e) => l.flatMap((t) => o_(o, t.id).flatMap((n) => {
		let r = s.find((t) => t.segment?.id === e.id && t.aoiDefinition.id === n.id);
		return !r || r.isStale(n) ? [] : [[
			e.name,
			t.displayName,
			n.name,
			...c.map((e) => r.stats[e.id])
		]];
	})));
	if (u.length === 0) throw new J(`No AOI metrics are available for ${a.name}. If an AOI was created or changed recently the metrics may still be processing, try again in a few minutes.`);
	return zg([[
		"Segment",
		"Stimulus",
		"AOI",
		...c.map((e) => e.name)
	], ...u], i);
}, m_ = async ({ api: e }, t, n, r, i) => {
	let a = await e.getStudyByName(t);
	if (!a.sensors.eyeTracking) throw new J(`AOIs can only be created in studies with the eye tracking sensor enabled, which ${a.name} does not have.`);
	let o = Kl(a, n), s = r_(i.bounds, i.points, i.timeline);
	if (!s) throw new J("Specify the AOI shape with --bounds, --points or --timeline.");
	i_(o, s);
	let c = r.trim();
	if (!c) throw new J("The AOI name cannot be empty.");
	i.color && qg(i.color);
	let l = await e.getAoiSet(a.aoiSet.id), u = o_(l, o.id).find((e) => e.name.toLocaleLowerCase() === c.toLocaleLowerCase());
	if (u) throw new J(`An AOI named ${u.name} already exists on stimulus ${o.displayName}.`);
	let d = await e.createAoiDefinition({
		aoiSet: { id: l.id },
		stimuli: { id: o.id },
		name: c,
		displayColor: i.color,
		timeline: s.timeline
	}), f = a.canCalculateCloudNativeSegmentAnalysis();
	return f && await e.queueStatsCalculation(l.id), /* @__PURE__ */ (0, Z.jsxs)($, { children: [
		/* @__PURE__ */ (0, Z.jsxs)(Q, {
			variant: "h1",
			children: [
				"AOI ",
				c,
				" created"
			]
		}),
		/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["ID: ", d.id] }),
		/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"It covers ",
			s.description,
			" (in percent of the stimulus size) on stimulus ",
			o.displayName,
			"."
		] }),
		/* @__PURE__ */ (0, Z.jsx)(Q, { children: f ? "It will take a couple of minutes for its metrics to be calculated." : "Its metrics will be calculated once respondent data has been collected and processed." }),
		s.smallerThanRecommended && /* @__PURE__ */ (0, Z.jsx)(Q, { children: a_(a) })
	] });
}, h_ = async ({ api: e }, t, n, r) => {
	let i = await e.getStudyByName(t);
	if (r.length === 0) throw new J("At least one respondent label must be specified.");
	if (i.segments.find((e) => e.name === n)) throw new J(`A segment named ${n} already exists in study ${i.name}.`);
	r.length === 1 && r[0].includes(",") && (r = r[0].split(","));
	let a = new Map(i.respondents.map((e) => [e.label, e])), o = r.map((e) => {
		let t = a.get(e);
		if (!t) throw new J(`Respondent with label ${e} not found in study ${i.name}. Available respondents:\n${i.respondents.map((e) => e.label).toSorted((e, t) => e.localeCompare(t, void 0, { numeric: !0 })).join("\n")}`);
		return t.id;
	}), s = i.segments.find((e) => e.hasSameRespondents(o));
	if (s) throw new J(`The selected respondents already exist as the segment named ${s.name}. It is not possible to create two segments with the exact same respondents.`);
	let c = await e.createSegment({
		name: n,
		study: { id: i.id },
		respondents: o.map((e) => ({ id: e }))
	});
	return /* @__PURE__ */ (0, Z.jsxs)($, { children: [
		/* @__PURE__ */ (0, Z.jsxs)(Q, {
			variant: "h1",
			children: [
				"Segment ",
				n,
				" created"
			]
		}),
		/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["ID: ", c.id] }),
		/* @__PURE__ */ (0, Z.jsx)(Q, { children: "It will take a couple of minutes for data to be processed for it." })
	] });
}, g_ = async ({ api: e }, t, n, r, i) => {
	let a = await e.getStudyByName(t), o = Kl(a, r), s = _g("start-ms", i), c = hg(await e.getAnnotations(a.id), n, a);
	vg(c);
	let l = gg(c, o, s), u = c.fragments.length === 1;
	return u ? await e.deleteAnnotation(a.id, c.id) : await e.deleteAnnotationFragment(a.id, l.id), /* @__PURE__ */ (0, Z.jsxs)($, { children: [
		/* @__PURE__ */ (0, Z.jsx)(Q, {
			variant: "h1",
			children: "Annotation interval deleted"
		}),
		/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"The interval ",
			fg(l.rangeStart, "ms"),
			"-",
			fg(l.rangeEnd, "ms"),
			" of annotation ",
			c.name,
			" on stimulus ",
			o.displayName,
			" was deleted."
		] }),
		u && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"It was the last interval of the annotation, so the annotation ",
			c.name,
			" was also deleted."
		] })
	] });
}, __ = async ({ api: e }, t, n, r) => {
	let i = await e.getStudyByName(t), a = Kl(i, n), o = s_(await e.getAoiSet(i.aoiSet.id), a, r);
	return c_(o), await e.deleteAoiDefinition(o.id), /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsxs)(Q, {
		variant: "h1",
		children: [
			"AOI ",
			o.name,
			" deleted"
		]
	}), /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
		"The AOI ",
		o.name,
		" on stimulus ",
		a.displayName,
		" and its metrics were deleted."
	] })] });
}, v_ = async ({ api: e }, t, n) => {
	let r = await e.getStudyByName(t), i = (await e.getNotes(r.id)).find((e) => e.id.toLowerCase() === n.toLowerCase());
	if (!i) throw new J(`Note with ID ${n} not found in study ${r.name}. The IDs of the existing notes can be found with the list-notes command.`);
	return await e.deleteNote(r.id, i.id), /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
		variant: "h1",
		children: "Note deleted"
	}), /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
		"Deleted the note from study ",
		r.name,
		"."
	] })] });
}, y_ = async ({ api: e }, t, n, r, i, a) => {
	let o = await e.getStudyByName(t), s = Kl(o, r), c = _g("current-start-ms", i);
	if (a.startMs === void 0 && a.endMs === void 0 && a.text === void 0) throw new J("Specify at least one of --start-ms, --end-ms or --text to change.");
	let l = hg(await e.getAnnotations(o.id), n, o);
	vg(l);
	let u = gg(l, s, c), d = a.startMs === void 0 ? u.rangeStart : _g("--start-ms", a.startMs), f = a.endMs === void 0 ? u.rangeEnd : _g("--end-ms", a.endMs);
	if (d >= f) throw new J(`The interval start (${d} ms) must be less than the end (${f} ms).`);
	yg(l, s, d, f, u.id);
	let p = await e.updateAnnotationFragment(o.id, {
		id: u.id,
		stimuli: u.stimuli,
		text: a.text ?? u.text,
		rangeStart: d,
		rangeEnd: f
	});
	return /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
		variant: "h1",
		children: "Annotation interval updated"
	}), /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
		"The interval of annotation ",
		l.name,
		" on stimulus ",
		s.displayName,
		" is now",
		" ",
		fg(p.rangeStart, "ms"),
		"-",
		fg(p.rangeEnd, "ms"),
		p.text && ` with text "${p.text}"`,
		"."
	] })] });
}, b_ = async ({ api: e }, t, n, r, i) => {
	let a = await e.getStudyByName(t), o = Kl(a, n), s = r_(i.bounds, i.points, i.timeline);
	if (i.name === void 0 && i.color === void 0 && !s) throw new J("Specify at least one of --name, --bounds, --points, --timeline or --color to change.");
	s && i_(o, s), i.color && qg(i.color);
	let c = await e.getAoiSet(a.aoiSet.id), l = s_(c, o, r);
	c_(l);
	let u = i.name?.trim() ?? l.name;
	if (!u) throw new J("The AOI name cannot be empty.");
	let d = o_(c, o.id).find((e) => e.id !== l.id && e.name.toLocaleLowerCase() === u.toLocaleLowerCase());
	if (d) throw new J(`An AOI named ${d.name} already exists on stimulus ${o.displayName}.`);
	let f = i.color ?? l.displayColor;
	if (s?.timeline.length === 1 && l.timeline.length > 1) throw new J(`The shape of the AOI ${l.name} changes over time, so --bounds and --points would discard its movement. Use --timeline to replace all of its shapes instead.`);
	return s ? (await e.updateAoiDefinitions([{
		id: l.id,
		aoiSet: { id: c.id },
		stimuli: { id: o.id },
		name: u,
		displayColor: f,
		timelineType: l.timelineType,
		timeline: s.timeline.length === 1 ? [{
			ts: l.timeline[0]?.ts ?? 0,
			points: s.timeline[0].points
		}] : s.timeline
	}]), a.canCalculateCloudNativeSegmentAnalysis() && await e.queueStatsCalculation(c.id)) : await e.updateAoiDefinitions([{
		id: l.id,
		aoiSet: { id: c.id },
		stimuli: { id: o.id },
		name: u,
		displayColor: f
	}]), /* @__PURE__ */ (0, Z.jsxs)($, { children: [
		/* @__PURE__ */ (0, Z.jsxs)(Q, {
			variant: "h1",
			children: [
				"AOI ",
				u,
				" updated"
			]
		}),
		u !== l.name && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"The AOI was renamed from ",
			l.name,
			"."
		] }),
		f !== l.displayColor && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"The color was changed to ",
			f,
			"."
		] }),
		s && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"It now covers ",
			s.description,
			" (in percent of the stimulus size).",
			" ",
			a.canCalculateCloudNativeSegmentAnalysis() ? "It will take a couple of minutes for its metrics to be recalculated." : "Its metrics will be calculated once respondent data has been collected and processed."
		] }),
		s?.smallerThanRecommended && /* @__PURE__ */ (0, Z.jsx)(Q, { children: a_(a) })
	] });
}, x_ = (e) => e.split(",").map((e) => e.trim()).filter((e) => e.length > 0), S_ = async ({ api: e }, t, n, r) => {
	let i = await e.getStudyByName(t), a = Gl(i, n);
	if (r.name === void 0 && r.addRespondents === void 0 && r.removeRespondents === void 0) throw new J("Specify at least one of --name, --add-respondents or --remove-respondents to change.");
	if (i.getAllRespondentsSegment()?.id === a.id) throw new J("The All Respondents segment always contains every respondent and cannot be changed.");
	let o = r.name?.trim() ?? a.name;
	if (!o) throw new J("The segment name cannot be empty.");
	if (i.segments.some((e) => e.id !== a.id && e.name.toLocaleLowerCase() === o.toLocaleLowerCase())) throw new J(`A segment named ${o} already exists in study ${i.name}.`);
	let s = new Set(a.respondents.map((e) => e.id));
	for (let e of x_(r.addRespondents ?? "")) {
		let t = ql(i, e);
		if (s.has(t.id)) throw new J(`Respondent with label ${e} is already in segment ${a.name}.`);
		s.add(t.id);
	}
	for (let e of x_(r.removeRespondents ?? "")) {
		let t = ql(i, e);
		if (!s.has(t.id)) throw new J(`Respondent with label ${e} is not in segment ${a.name}.`);
		s.delete(t.id);
	}
	if (s.size === 0) throw new J("A segment must contain at least one respondent.");
	let c = !a.hasSameRespondents([...s]);
	if (c) {
		let e = i.segments.find((e) => e.id !== a.id && e.hasSameRespondents([...s]));
		if (e) throw new J(`The selected respondents already exist as the segment named ${e.name}. It is not possible to have two segments with the exact same respondents.`);
	}
	return await e.editNonDefaultOnlineSegment(i.id, a.id, {
		name: o,
		respondents: [...s].map((e) => ({ id: e }))
	}), /* @__PURE__ */ (0, Z.jsxs)($, { children: [
		/* @__PURE__ */ (0, Z.jsxs)(Q, {
			variant: "h1",
			children: [
				"Segment ",
				o,
				" updated"
			]
		}),
		o !== a.name && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"The segment was renamed from ",
			a.name,
			"."
		] }),
		/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"It now contains ",
			s.size,
			" respondents."
		] }),
		c && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "Since the respondents changed, it will take a couple of minutes for data to be reprocessed." })
	] });
}, C_ = async (e, t, n, r) => {
	let i = (r ? [ql(t, r)] : t.respondents.toSorted((e, t) => e.label.localeCompare(t.label, void 0, { numeric: !0 }))).flatMap((e) => {
		let t = n.getDataForRespondent(e.id);
		return t ? [{
			respondentLabel: e.label,
			url: t.url
		}] : [];
	});
	if (i.length === 0) throw new J(r ? `No data is available for respondent ${r} on stimulus ${n.displayName}. If it was collected recently it may still be processing, try again in a few minutes.` : `No individual respondent data is available for stimulus ${n.displayName}. If data has been collected recently it may still be processing, try again in a few minutes.`);
	return Wl(i, async (t) => ({
		respondentLabel: t.respondentLabel,
		data: await e.getRespondentExposureData(t.url)
	}));
}, w_ = async ({ api: e }, t, n, { respondent: r, output: i }) => {
	let a = await e.getStudyByName(t), o = Kl(a, n), s = (await C_(e, a, o, r)).flatMap(({ respondentLabel: e, data: t }) => t.respondentfixations.flatMap((t) => t.fixations.map((t) => [
		e,
		t.st,
		t.ed,
		t.x,
		t.y
	])));
	if (s.length === 0) throw new J(`No fixations are available for stimulus ${o.displayName}. Fixations are calculated from the eye tracking data, so they require respondents with processed eye tracking data.`);
	return zg([[
		"Respondent",
		"Start (ms)",
		"End (ms)",
		"X",
		"Y"
	], ...s], i);
}, T_ = async ({ api: e }, t, n, { respondent: r, output: i }) => {
	let a = await e.getStudyByName(t), o = Kl(a, n), s = (await C_(e, a, o, r)).flatMap(({ respondentLabel: e, data: t }) => t.gazes.flatMap((t) => t.x.flatMap((n, r) => {
		let i = t.y[r];
		return n === -1 || i === -1 || i === void 0 ? [] : [[
			e,
			t.ts,
			n,
			i
		]];
	})));
	if (s.length === 0) throw new J(`No gaze points are available for stimulus ${o.displayName}. They require respondents with processed eye tracking data.`);
	return zg([[
		"Respondent",
		"Timestamp (ms)",
		"X",
		"Y"
	], ...s], i);
}, E_ = async ({ api: e }, t) => {
	let n;
	try {
		n = await e.getHelpCenterArticle(t.trim());
	} catch (e) {
		throw e instanceof Qe && e.status === 404 ? new J(`No help article found with ID ${t}. Use the search-help command to find articles and their IDs.`) : e;
	}
	return /* @__PURE__ */ (0, Z.jsxs)(wg, {
		spacing: 1,
		children: [/* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
			variant: "h1",
			children: n.title
		}), n.url && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["URL: ", n.url] })] }), /* @__PURE__ */ (0, Z.jsx)(Q, { children: n.content ?? "The article is empty." })]
	});
}, D_ = async ({ api: e }, t, n) => {
	let r = await e.getStudyByName(t), i = await e.getAoiSet(r.aoiSet.id), a = n.stimulus ? [Kl(r, n.stimulus)] : r.stimuli, o = a.map((e) => ({
		stimulus: e,
		aois: o_(i, e.id)
	})).filter(({ aois: e }) => e.length > 0);
	return /* @__PURE__ */ (0, Z.jsxs)(wg, {
		spacing: 1,
		children: [
			/* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsxs)(Q, {
				variant: "h1",
				children: ["Areas of Interest in ", r.name]
			}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "An AOI marks an area on a stimulus, which creates eye tracking metrics based on when respondents look at it. Positions and sizes are in percent of the stimulus width and height, with the origin in the top left corner." })] }),
			o.length === 0 && /* @__PURE__ */ (0, Z.jsx)(Q, { children: n.stimulus ? `The stimulus ${a[0].displayName} has no AOIs.` : "The study has no AOIs." }),
			o.map(({ stimulus: e, aois: t }) => /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h2",
				children: e.displayName
			}), t.map((e) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h3",
					children: e.name
				}),
				/* @__PURE__ */ (0, Z.jsx)(Q, { children: f_(e) }),
				/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Color: ", e.displayColor] })
			] }, e.id))] }, e.id))
		]
	});
}, O_ = (e, t, n) => {
	switch (e.targetType) {
		case "STUDY": return "The study";
		case "STIMULUS": return `Stimulus ${t.getStimuli(e.targetId)?.displayName ?? "(deleted)"}`;
		case "SEGMENT": return `Segment ${t.segments.find((t) => t.id === e.targetId)?.name ?? "(deleted)"}`;
		case "RESPONDENT": return `Respondent ${t.respondents.find((t) => t.id === e.targetId)?.label ?? "(deleted)"}`;
		case "ANNOTATION_FRAGMENT": {
			let r = n.find((t) => t.fragments.some((t) => t.id === e.targetId)), i = r?.fragments.find((t) => t.id === e.targetId);
			if (!r || !i) return "Annotation interval (deleted)";
			let a = t.getStimuli(i.stimuli.id)?.displayName;
			return `Interval of annotation ${r.name}${a ? ` on stimulus ${a}` : ""} starting at ${i.rangeStart} ms`;
		}
	}
}, k_ = async ({ api: e }, t) => {
	let n = await e.getStudyByName(t), r = await e.getNotes(n.id);
	if (r.length === 0) return /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
		"Study ",
		n.name,
		" has no notes yet. Notes can be added with the add-note command."
	] });
	let i = r.some((e) => e.targetType === "ANNOTATION_FRAGMENT") ? await e.getAnnotations(n.id) : [], a = r.toSorted((e, t) => t.createdDate.diff(e.createdDate));
	return /* @__PURE__ */ (0, Z.jsxs)(wg, {
		spacing: 1,
		children: [/* @__PURE__ */ (0, Z.jsxs)(Q, {
			variant: "h1",
			children: ["Notes in study ", n.name]
		}), a.map((e) => /* @__PURE__ */ (0, Z.jsxs)($, { children: [
			/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h2",
				children: O_(e, n, i)
			}),
			/* @__PURE__ */ (0, Z.jsx)(Q, { children: e.text }),
			/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
				"Created ",
				e.createdDate.clone().utc().format("YYYY-MM-DDTHH:mm:ss"),
				e.createdByAiAgent && " by an AI agent",
				". ID: ",
				e.id
			] })
		] }, e.id))]
	});
}, A_ = class {
	window;
	constructor(e = globalThis) {
		this.window = e;
	}
	transformData(e) {
		let t = e.flatMap((e) => this.transformItem(e)), n = le(t.flatMap((e) => Object.keys(e))), r = [];
		return t.forEach((e) => {
			let t = [];
			n.forEach((n) => {
				let r = e[n];
				t.push(r);
			}), r.push(t);
		}), r.unshift(n), r;
	}
	url(e) {
		return this.window.location.origin + e;
	}
	triggerDownload(e, t, n, r) {
		new Rg(n, r).triggerDownload(e, this.transformData(t), this.window);
	}
}, j_ = (e) => e.pages.flatMap((e) => e.elements ?? []).filter((e) => e.type !== "instruction" && e.type !== "image" && e.type !== "text" && e.type !== "multipletext"), M_ = (e) => {
	if (typeof e == "string") return {
		value: e,
		text: e
	};
	if ("text" in e) return e;
	if ("imageLink" in e) return {
		value: e.value,
		text: e.imageLink
	};
	throw Error(`Unexpected choice value: ${e}`);
}, N_ = (e, t) => {
	if (!e || Array.isArray(e) || !("pages" in e)) return;
	let n = j_(e);
	if (n.length === 0) return;
	let r = {};
	return n.forEach((e) => {
		let n = {}, i = 0;
		Object.values(t).forEach((t) => {
			let r = t[e.name];
			r && (Array.isArray(r) ? r.forEach((e) => {
				n[e] = (n[e] || 0) + 1;
			}) : n[r] = (n[r] || 0) + 1, i += 1);
		});
		let a = {};
		"choices" in e && (e.choices.forEach((e) => {
			let { value: t, text: r } = M_(e);
			a[r] = i === 0 ? "0%" : `${Math.round((n[t] || 0) / i * 100)}%`;
		}), r[e.title || e.name] = a);
	}), r;
}, P_ = (e, t) => {
	if (!e || Array.isArray(e) || !("pages" in e)) return;
	let n = j_(e);
	if (n.length === 0) return;
	let r = {};
	return n.forEach((e) => {
		let n = t[e.name];
		!n || !("choices" in e) || (Array.isArray(n) || (n = [n]), r[e.title || e.name] = n.map((t) => e.choices.map((e) => M_(e)).find((e) => e.value === t)?.text ?? t).join("\n"));
	}), r;
}, F_ = "YYYY-MM-DDTHH:mm:ss", I_ = [
	"In progress",
	"Processing",
	"Completed",
	"Abandoned",
	"Processing error"
], L_ = (e, t) => {
	switch (e.phase) {
		case "testingUpload":
		case "testUploadError": return "Testing upload";
		case "consent": return "Consent screen";
		case "setup": switch (e.setupStep) {
			case "screenRecording": return "Screen recording setup";
			case "respondentCamera": return "Respondent camera setup";
			case "audio": return "Audio check";
			case "fullscreen": return "Enter fullscreen";
			case "respondentPositionCheck": return "Positioning check";
			default: return "Setup";
		}
		case "slideshow": {
			let n = e.stimulusId ? t.getStimuli(e.stimulusId)?.displayName : void 0, r = e.currentSlideNo && e.slideCount ? ` (${e.currentSlideNo} of ${e.slideCount})` : "";
			return `Stimuli presentation${n ? `: ${n}` : ""}${r}`;
		}
		case "uploading":
		case "zipError":
		case "uploadError": return "Study data upload";
		default: return e.phase;
	}
}, R_ = (e) => {
	if (e.length === 0) return;
	let t = e.toSorted((e, t) => e - t);
	return t[Math.floor(t.length / 2)];
}, z_ = class extends A_ {
	study;
	rawDataUrls;
	progress;
	sessionByRespondentId;
	medianDurationMsByFlowId = /* @__PURE__ */ new Map();
	medianDurationMs;
	constructor(e, t, n) {
		super(), this.study = e, this.rawDataUrls = t, this.progress = n, this.sessionByRespondentId = new Map(e.sessions.map((e) => [e.respondent.id, e]));
		let r = e.getNonPreviewSessions().filter((e) => e.startTime && e.endTime), i = (e) => e.endTime.diff(e.startTime);
		this.medianDurationMs = R_(r.map(i)), Map.groupBy(r, (e) => e.stimuliBlock?.id ?? "").forEach((e, t) => {
			this.medianDurationMsByFlowId.set(t, R_(e.map(i)));
		});
	}
	getEstimatedEndTime(e) {
		if (!e.startTime) return "";
		let t = this.medianDurationMsByFlowId.get(e.stimuliBlock?.id ?? "") ?? this.medianDurationMs;
		return t === void 0 ? "" : e.startTime.clone().add(t, "ms").utc().format(F_);
	}
	getState(e) {
		if (this.study.isOdcOrCloudNativeRespondentProcessed(e)) return "Completed";
		if (this.study.isOdcOrCloudNativeRespondentProcessing(e, this.sessionByRespondentId)) return "Processing";
		if (this.study.isOdcOrCloudNativeRespondentInProgress(e, this.sessionByRespondentId)) return "In progress";
		if (this.study.isOdcOrCloudNativeRespondentAbandoned(e)) return "Abandoned";
		if (this.study.isOdcOrCloudNativeRespondentWithProcessingError(e)) return "Processing error";
	}
	transformItem(e) {
		let t = this.study.getSession(e.sessionId), n = { Label: e.label };
		if (this.progress) {
			let r = this.getState(e);
			n.State = r;
			let i;
			r === "In progress" ? i = t?.remoteLastPing : r === "Abandoned" && (i = e.sessionAbandonment ?? t?.remoteLastPing), n.Progress = i ? L_(i, this.study) : "", n["Estimated end time"] = r === "In progress" && t ? this.getEstimatedEndTime(t) : "", n["Last heartbeat"] = i?.timestamp?.clone().utc().format(F_) ?? "";
		}
		return n.Flow = t?.stimuliBlock?.name, n["Start time"] = t?.startTime?.clone().utc().format(F_), n["End time"] = t?.endTime?.clone().utc().format(F_), n["Researcher preview"] = t?.isOdcOrCloudNativePreview() ? "true" : "", t?.getCustomVariables().forEach((e, t) => {
			n[t] = e;
		}), e.stimuliOrder.map((e) => this.study.getStimuli(e)).filter((e) => e.type === "JS_SURVEY").forEach((t) => {
			let r = t.getDataForRespondent(e.id);
			if (!r) return;
			let i = P_(t.surveyQuestions, typeof r.surveyAnswers == "string" ? JSON.parse(r.surveyAnswers) : r.surveyAnswers);
			Object.entries(i ?? {}).forEach(([e, t]) => {
				n[e] = t;
			});
		}), this.rawDataUrls && e.stimuliOrder.map((e) => this.study.getStimuli(e)).forEach((t) => {
			n[`${t.displayName} raw data URL`] = t.getDataForRespondent(e.id)?.url;
		}), n;
	}
}, B_ = async ({ api: e }, t, { rawDataUrls: n, progress: r, output: i }) => {
	let a = await e.getStudyByName(t), o = new z_(a, n ?? !1, r ?? !1), s = (e, t) => e.label.localeCompare(t.label, void 0, { numeric: !0 }), c;
	if (r) {
		let e = new Map(a.respondents.map((e) => [e, o.getState(e)]));
		c = a.respondents.filter((t) => e.get(t) !== void 0).toSorted((t, n) => I_.indexOf(e.get(t)) - I_.indexOf(e.get(n)) || s(t, n));
	} else {
		let e = a.getAllRespondentsSegment();
		if (!e) throw new J(`Study ${a.name} has no respondents yet. The "All Respondents" segment is created once data has been collected.`);
		c = e.respondents.map(({ id: e }) => a.respondents.find((t) => t.id === e)).filter((e) => e !== void 0).toSorted(s);
	}
	return zg(o.transformData(c), i);
}, V_ = async ({ api: e, region: t }) => {
	let n = await e.getFolders(), r = new Map(n.filter((e) => e instanceof Hc).map((e) => [e.id, e.getFullFolderPath().map((e) => e.folderName).slice(1).concat("").join("/")]));
	return r.set(void 0, ""), /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, { children: "Your user has access to the following studies:" }), n.filter((e) => e instanceof Vc).toSorted((e, t) => r.get(e.parentFolder?.id).localeCompare(r.get(t.parentFolder?.id), void 0, { numeric: !0 }) || e.name.localeCompare(t.name, void 0, { numeric: !0 })).map((e) => /* @__PURE__ */ (0, Z.jsx)(Ee.Fragment, { children: /* @__PURE__ */ (0, Z.jsxs)(Sg, { children: [
		r.get(e.parentFolder?.id),
		"[",
		e.name,
		"](",
		t.uiUrl,
		"/#studies/",
		e.study.id,
		")"
	] }) }, e.id))] });
}, H_ = async ({ api: e }, t, n) => {
	let r = await e.getStudyByName(t), i = ql(r, n), a = r.getSession(i.sessionId), o = i.stimuliOrder.map((e) => r.getStimuli(e)), s = o.flatMap((e) => {
		if (e.type !== "JS_SURVEY") return [];
		let t = e.getDataForRespondent(i.id);
		if (!t) return [];
		let n = P_(e.surveyQuestions, typeof t.surveyAnswers == "string" ? JSON.parse(t.surveyAnswers) : t.surveyAnswers);
		return n ? Object.entries(n).map(([e, t]) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
			variant: "h3",
			children: e
		}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: t })] }, e)) : [];
	});
	return /* @__PURE__ */ (0, Z.jsxs)(wg, {
		spacing: 1,
		children: [
			/* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsxs)(Q, {
					variant: "h1",
					children: ["Respondent ", i.label]
				}),
				/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["ID: ", i.id] }),
				a.isOdcOrCloudNativePreview() && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "This respondent was a researcher previewing the study and should be ignored." }),
				a.stimuliBlock && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Flow: ", a.stimuliBlock.name] }),
				a.startTime && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Start time: ", a.startTime.clone().utc().format("YYYY-MM-DDTHH:mm:ss")] }),
				a.endTime && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["End time: ", a.endTime.clone().utc().format("YYYY-MM-DDTHH:mm:ss")] })
			] }),
			a.getCustomVariables().size > 0 && /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h2",
				children: "Variables"
			}), Array.from(a.getCustomVariables().entries()).map(([e, t]) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h3",
				children: e
			}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: t })] }, e))] }),
			s.length > 0 && /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h2",
				children: "Survey answers"
			}), s] }),
			/* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h2",
					children: "Raw data"
				}),
				/* @__PURE__ */ (0, Z.jsx)(Q, { children: "The data is also available as a gzipped JSON file with with additional details. It can be fetched without authentication. The following properties may be of interest:" }),
				/* @__PURE__ */ (0, Z.jsx)(Sg, { children: "\"collectedSensors\": The raw sensor data for the respondent. Each sensor has a name and a list of signals. The signals have names and a timeline of [timestampMs, value] pairs." }),
				/* @__PURE__ */ (0, Z.jsx)(Sg, { children: "\"gazes\": The eye tracking gaze coordinates. This is a list of objects with a millisecond timestamp and list of all the x and y gaze coordinates respectively. The gaze coordinates have been normalized to a 1920x1080 coordinate system regardless of the actual size of the stimulus. Ignore the signalBitmask property. Ignore gazes where one or both coordinates are -1." }),
				/* @__PURE__ */ (0, Z.jsx)(Sg, { children: "\"respondentfixations\": Fixation coordinates. This is a list of objects with a millisecond start and end, and x and y gaze coordinates for the fixation." }),
				o.map((e) => {
					let t = e.getDataForRespondent(i.id);
					return /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h3",
						children: e.displayName
					}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: t?.url ?? "No data" })] }, e.id);
				})
			] })
		]
	});
}, U_ = (e) => e.replace(/<[^>]+>/g, ""), W_ = async ({ api: e }, t) => {
	if (!t.trim()) throw new J("The search query cannot be empty.");
	let n = await e.searchHelpCenter(t.trim());
	return /* @__PURE__ */ (0, Z.jsxs)(wg, {
		spacing: 1,
		children: [
			/* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsxs)(Q, {
				variant: "h1",
				children: [
					"Help Center search results for \"",
					t.trim(),
					"\""
				]
			}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "Use the help-article command with an article ID to read the full article." })] }),
			n.length === 0 && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "No articles found. Try a different search query." }),
			n.map((e) => /* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h2",
					children: e.title
				}),
				/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["ID: ", e.articleId] }),
				e.breadcrumb && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Location: ", e.breadcrumb] }),
				e.snippet && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
					"...",
					U_(e.snippet),
					"..."
				] })
			] }, e.articleId))
		]
	});
}, G_ = () => /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
	/* @__PURE__ */ (0, Z.jsx)(Q, {
		variant: "h2",
		children: "Raw data"
	}),
	/* @__PURE__ */ (0, Z.jsx)(Q, { children: "The data is also available as a gzipped JSON file with additional details. It can be fetched without authentication. The following properties may be of interest:" }),
	/* @__PURE__ */ (0, Z.jsx)(Sg, { children: "\"collectedSensors\": The aggregated sensor data for the segment. Each sensor has a name and a list of signals. The signals have names and a timeline of [timestampMs, value] pairs." }),
	/* @__PURE__ */ (0, Z.jsx)(Sg, { children: "\"gazes\": The eye tracking gaze coordinates. This is a list of objects with a millisecond timestamp and list of all the x and y gaze coordinates respectively. The gaze coordinates have been normalized to a 1920x1080 coordinate system regardless of the actual size of the stimulus. Ignore the signalBitmask property. Ignore gazes where one or both coordinates are -1." }),
	/* @__PURE__ */ (0, Z.jsx)(Sg, { children: "\"summaryMetrics\": Summary metrics for sensor signals, including many more signals than those listed above." })
] }), K_ = [
	"valence",
	"engagement",
	"neutral",
	"brow Furrow",
	"joy"
], q_ = {
	valence: "-100-100",
	engagement: "0-100",
	neutral: "0-100",
	"brow Furrow": "0-100",
	joy: "0-100"
}, J_ = async ({ api: e }, t, n, r = {}) => {
	let i = await e.getStudyByName(t), a = i.segments.find((e) => e.name.toLocaleLowerCase() === n.toLocaleLowerCase());
	if (!a) throw new J(`Segment named ${n} not found in study ${t}. Available segments:\n${i.getOrderedSegments().map((e) => e.name).join("\n")}`);
	let o = i.getOrderedStimuliForOnlineAnalysis().filter((e) => e.segmentData.some((e) => e.segment.id === a.id)), s = new Map(await Promise.all(o.flatMap((e) => {
		let t = e.getDataForSegment(a.id);
		return t ? [t] : [];
	}).map(async (t) => [t.stimuli.id, await e.getSegmentExposureData(t.url)]))), c = o.flatMap((e) => {
		let t = s.get(e.id);
		return !t || !t.summaryMetrics?.signalSummaryMetrics || Object.keys(t.summaryMetrics.signalSummaryMetrics).length === 0 ? [] : [/* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
			variant: "h2",
			children: e.displayName
		}), Object.entries(t.summaryMetrics.signalSummaryMetrics).map(([e, t]) => {
			if (!r.allMetrics && !K_.includes(e)) return null;
			let n = q_[e];
			return /* @__PURE__ */ (0, Z.jsx)(Ee.Fragment, { children: /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
				me(e),
				n ? ` (${n})` : "",
				": ",
				fe(t.mean, 1)
			] }) }, e);
		})] }, e.id)];
	}), l = o.flatMap((e) => {
		if (e.type !== "JS_SURVEY") return [];
		let t = s.get(e.id);
		if (!t) return [];
		let n = N_(e.surveyQuestions, t.jsSurveyAnswers);
		return n ? Object.entries(n).map(([e, t]) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
			variant: "h3",
			children: e
		}), Object.entries(t).map(([e, t]) => /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			e,
			": ",
			t
		] }, e))] }, e)) : [];
	}), u = await e.getAoiSet(i.aoiSet.id), d = (await e.getAoiStats(u.id)).filter((e) => e.segment?.id === a.id), f = u.metadata.flatMap((e) => e.Metrics), p = (e, t, n) => {
		let r = f.find((t) => t.Name === e);
		if (!r) return null;
		let i = t[r.Id];
		return i == null ? null : /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			n ?? r.Name,
			": ",
			i
		] });
	};
	return /* @__PURE__ */ (0, Z.jsxs)(wg, {
		spacing: 1,
		children: [
			/* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h1",
					children: a.name
				}),
				/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["ID: ", a.id] }),
				s.size === 0 && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "Data is being processed, details not available yet. Try again in a few minutes." })
			] }),
			c.length > 0 && /* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h2",
					children: "Summary metrics"
				}),
				/* @__PURE__ */ (0, Z.jsx)(Q, { children: "This shows the mean values for the signal during each stimulus. More signals and the variance and standard deviation are also available in the raw data referenced below." }),
				c,
				!r.allMetrics && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "Only the most important metrics are shown. More metrics are available with the `--all-metrics` option." })
			] }),
			l.length > 0 && /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h2",
				children: "Survey answers"
			}), l] }),
			d.length > 0 && f.length > 0 && /* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h2",
					children: "Area of Interest metrics"
				}),
				/* @__PURE__ */ (0, Z.jsx)(Q, { children: "Metrics calculated from the eye tracking data of respondents in this segment, for each of the defined areas of interest." }),
				!u.calculatingAois && d.map((e) => {
					let t = u.aoiDefinitions.find((t) => t.id === e.aoiDefinition.id), n = i.getStimuli(t.stimuli.id);
					return /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [
						/* @__PURE__ */ (0, Z.jsxs)(Q, {
							variant: "h3",
							children: [
								n.displayName,
								" - ",
								t.name
							]
						}),
						p("Respondent ratio (%)", e.stats),
						p("Revisit count", e.stats),
						p("Fixation count", e.stats),
						p("TTFF AOI (ms)", e.stats, "Time To First Fixation (ms)"),
						p("Dwell time (ms)", e.stats)
					] }, e.id);
				}),
				u.calculatingAois && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "Metrics are being processed, not available yet. Try again in a few minutes." })
			] }),
			/* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h2",
					children: "Respondents"
				}),
				/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Number of respondents: ", a.respondents.length] }),
				/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
					"Respondents labels:",
					" ",
					a.respondents.map((e) => i.getRespondent(e.id).label).toSorted((e, t) => e.localeCompare(t, void 0, { numeric: !0 })).join(", ")
				] })
			] }),
			/* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(G_, {}), o.map((e) => {
				let t = e.getDataForSegment(a.id);
				return /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h3",
					children: e.displayName
				}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: t?.url ?? "No data" })] }, e.id);
			})] })
		]
	});
}, Y_ = (e, t) => `${e} ${t}`, X_ = (e) => {
	let t = e.collectedSensors.flatMap((e) => e.signals.map((t) => ({
		sensor: e.sensor,
		name: t.name
	}))).toSorted((e, t) => e.sensor.localeCompare(t.sensor, void 0, { numeric: !0 }) || e.name.localeCompare(t.name, void 0, { numeric: !0 }));
	return t.map((e) => ({
		...e,
		column: t.some((t) => t.sensor !== e.sensor && t.name === e.name) ? `${e.sensor} - ${e.name}` : e.name
	}));
}, Z_ = (e, t) => {
	let n = /* @__PURE__ */ new Map();
	for (let t of e.collectedSensors) for (let e of t.signals) for (let [r, i] of e.timeline ?? []) {
		let a = n.get(r);
		a || (a = /* @__PURE__ */ new Map(), n.set(r, a)), a.set(Y_(t.sensor, e.name), i);
	}
	return Array.from(n.entries()).toSorted(([e], [t]) => e - t).map(([e, n]) => [e, ...t.map((e) => n.get(Y_(e.sensor, e.name)) ?? "")]);
}, Q_ = async ({ api: e }, t, n, { segment: r, respondent: i, output: a }) => {
	if (!r && !i) throw new J("Specify either --segment with a segment name to get its aggregated timeline, or --respondent with a respondent label to get that respondent's individual timeline.");
	if (r && i) throw new J("Specify either --segment or --respondent, not both.");
	let o = await e.getStudyByName(t), s = Kl(o, n), c;
	if (i) {
		let t = s.getDataForRespondent(ql(o, i).id);
		if (!t) throw new J(`No data is available for respondent ${i} on stimulus ${s.displayName}. If it was collected recently it may still be processing, try again in a few minutes.`);
		c = await e.getRespondentExposureData(t.url);
	} else {
		let t = Gl(o, r), n = s.getDataForSegment(t.id);
		if (!n) throw new J(`No data is available for segment ${t.name} on stimulus ${s.displayName}. If it was collected recently it may still be processing, try again in a few minutes.`);
		c = await e.getSegmentExposureData(n.url);
	}
	let l = X_(c), u = Z_(c, l);
	if (u.length === 0) throw new J(`No signal data is available for stimulus ${s.displayName}.`);
	return zg([["Timestamp (ms)", ...l.map((e) => e.column)], ...u], a);
}, $_ = async ({ api: e, region: t }) => {
	let n = await e.getCurrentUser();
	return /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
		"Logged in as ",
		n.name,
		" (",
		n.email,
		") in the iMotions ",
		t.name,
		" region."
	] });
}, ev = {
	categories: [
		{
			id: "3",
			name: "Apparel",
			subcategories: []
		},
		{
			id: "23",
			name: "Auto",
			subcategories: []
		},
		{
			id: "29",
			name: "Baby Care",
			subcategories: []
		},
		{
			id: "28",
			name: "Banking and Finance",
			subcategories: [{
				id: "26",
				name: "Investment Services"
			}, {
				id: "27",
				name: "Credit Cards"
			}]
		},
		{
			id: "13",
			name: "Beverage",
			subcategories: [
				{
					id: "1",
					name: "Alcohol"
				},
				{
					id: "2",
					name: "Soda"
				},
				{
					id: "25",
					name: "Non-Alcoholic"
				}
			]
		},
		{
			id: "16",
			name: "Candy",
			subcategories: [{
				id: "3",
				name: "Chocolate"
			}]
		},
		{
			id: "10",
			name: "Consumer Electronics",
			subcategories: [{
				id: "4",
				name: "Still"
			}]
		},
		{
			id: "37",
			name: "Entertainment",
			subcategories: [{
				id: "24",
				name: "Sports"
			}, {
				id: "31",
				name: "Travel"
			}]
		},
		{
			id: "2",
			name: "Fuel",
			subcategories: []
		},
		{
			id: "11",
			name: "Games",
			subcategories: []
		},
		{
			id: "4",
			name: "General Home",
			subcategories: []
		},
		{
			id: "5",
			name: "Grocery",
			subcategories: [
				{
					id: "5",
					name: "Butter and Spreads"
				},
				{
					id: "6",
					name: "Cereal"
				},
				{
					id: "7",
					name: "Dairy"
				},
				{
					id: "8",
					name: "Ice Cream"
				},
				{
					id: "9",
					name: "Snacks"
				}
			]
		},
		{
			id: "52",
			name: "Health and Fitness",
			subcategories: []
		},
		{
			id: "19",
			name: "Laundry",
			subcategories: []
		},
		{
			id: "38",
			name: "Movie Trailer",
			subcategories: [
				{
					id: "10",
					name: "Action/Adventure"
				},
				{
					id: "11",
					name: "Animated"
				},
				{
					id: "12",
					name: "Comedy"
				},
				{
					id: "13",
					name: "Drama"
				},
				{
					id: "14",
					name: "Horror/Slasher"
				},
				{
					id: "15",
					name: "Sci-Fi"
				},
				{
					id: "16",
					name: "Suspense/Thriller"
				}
			]
		},
		{
			id: "32",
			name: "Nutrition",
			subcategories: []
		},
		{
			id: "41",
			name: "Office Supplies",
			subcategories: []
		},
		{
			id: "33",
			name: "Other",
			subcategories: []
		},
		{
			id: "24",
			name: "Personal Care",
			subcategories: [
				{
					id: "17",
					name: "Beauty"
				},
				{
					id: "18",
					name: "Deodorant"
				},
				{
					id: "19",
					name: "Hair Care"
				},
				{
					id: "20",
					name: "Oral Care"
				},
				{
					id: "21",
					name: "Skin Care"
				}
			]
		},
		{
			id: "30",
			name: "Pet Care",
			subcategories: []
		},
		{
			id: "51",
			name: "Pharma",
			subcategories: [{
				id: "22",
				name: "OTC"
			}, {
				id: "23",
				name: "Prescription"
			}]
		},
		{
			id: "1",
			name: "Restaurant",
			subcategories: []
		},
		{
			id: "12",
			name: "Retail",
			subcategories: []
		},
		{
			id: "31",
			name: "Services",
			subcategories: [{
				id: "29",
				name: "Insurance"
			}]
		},
		{
			id: "22",
			name: "Telecom",
			subcategories: [
				{
					id: "28",
					name: "Home Internet"
				},
				{
					id: "30",
					name: "Streaming"
				},
				{
					id: "32",
					name: "Wireless"
				}
			]
		},
		{
			id: "42",
			name: "TV Episode",
			subcategories: [
				{
					id: "16",
					name: "Suspense/Thriller"
				},
				{
					id: "15",
					name: "Sci-Fi"
				},
				{
					id: "14",
					name: "Horror/Slasher"
				},
				{
					id: "13",
					name: "Drama"
				},
				{
					id: "12",
					name: "Comedy"
				},
				{
					id: "11",
					name: "Animated"
				},
				{
					id: "10",
					name: "Action/Adventure"
				}
			]
		}
	],
	markets: [
		{
			id: "17",
			name: "Albania"
		},
		{
			id: "18",
			name: "Algeria"
		},
		{
			id: "19",
			name: "Angola"
		},
		{
			id: "20",
			name: "Argentina"
		},
		{
			id: "1",
			name: "Australia"
		},
		{
			id: "21",
			name: "Austria"
		},
		{
			id: "22",
			name: "Azerbaijan"
		},
		{
			id: "23",
			name: "Bangladesh"
		},
		{
			id: "137",
			name: "Belarus"
		},
		{
			id: "24",
			name: "Belgium"
		},
		{
			id: "25",
			name: "Belgium - North (Flemish)"
		},
		{
			id: "26",
			name: "Belgium - South (French)"
		},
		{
			id: "27",
			name: "Bolivia"
		},
		{
			id: "28",
			name: "Bosnia And Herzegovina"
		},
		{
			id: "29",
			name: "Brazil (CAWI Only)"
		},
		{
			id: "30",
			name: "Brazil - North East"
		},
		{
			id: "31",
			name: "Brazil - Rio de Janeiro"
		},
		{
			id: "32",
			name: "Brazil - Sao Paulo"
		},
		{
			id: "33",
			name: "Brazil - South"
		},
		{
			id: "2",
			name: "Brazil - Unspecified"
		},
		{
			id: "34",
			name: "Bulgaria"
		},
		{
			id: "161",
			name: "Burkina Faso"
		},
		{
			id: "138",
			name: "Cambodia"
		},
		{
			id: "35",
			name: "Cameroon"
		},
		{
			id: "36",
			name: "Canada - English Speaking"
		},
		{
			id: "37",
			name: "Canada - French Speaking"
		},
		{
			id: "38",
			name: "Chile"
		},
		{
			id: "189",
			name: "Chinese mainland (Digital Mobile Only)"
		},
		{
			id: "39",
			name: "Chinese mainland - Beijing"
		},
		{
			id: "40",
			name: "Chinese mainland - Secondary Cities Central and West"
		},
		{
			id: "41",
			name: "Chinese mainland - Secondary Cities East"
		},
		{
			id: "42",
			name: "Chinese mainland - Secondary Cities North"
		},
		{
			id: "43",
			name: "Chinese mainland - Secondary Cities South and Guangzhou"
		},
		{
			id: "44",
			name: "Chinese mainland - Shanghai"
		},
		{
			id: "45",
			name: "Chinese mainland - Tertiary Cities"
		},
		{
			id: "186",
			name: "Chinese mainland - Total market"
		},
		{
			id: "3",
			name: "Chinese mainland - Unspecified"
		},
		{
			id: "46",
			name: "Colombia"
		},
		{
			id: "47",
			name: "Costa Rica"
		},
		{
			id: "166",
			name: "Cote DIvoire"
		},
		{
			id: "48",
			name: "Croatia"
		},
		{
			id: "49",
			name: "Cyprus"
		},
		{
			id: "50",
			name: "Czech Republic"
		},
		{
			id: "139",
			name: "Democratic Republic of the Congo"
		},
		{
			id: "171",
			name: "Denmark"
		},
		{
			id: "4",
			name: "Denmark - mixed methodology"
		},
		{
			id: "51",
			name: "Dominican Republic"
		},
		{
			id: "52",
			name: "Ecuador"
		},
		{
			id: "53",
			name: "Egypt"
		},
		{
			id: "54",
			name: "El Salvador"
		},
		{
			id: "167",
			name: "Estonia"
		},
		{
			id: "160",
			name: "Ethiopia"
		},
		{
			id: "173",
			name: "Finland"
		},
		{
			id: "56",
			name: "Finland - mixed methodology"
		},
		{
			id: "7",
			name: "France"
		},
		{
			id: "55",
			name: "FYR Macedonia"
		},
		{
			id: "163",
			name: "Georgia"
		},
		{
			id: "5",
			name: "Germany"
		},
		{
			id: "57",
			name: "Ghana"
		},
		{
			id: "58",
			name: "Greece"
		},
		{
			id: "59",
			name: "Guatemala"
		},
		{
			id: "60",
			name: "Honduras"
		},
		{
			id: "6",
			name: "Hong Kong"
		},
		{
			id: "61",
			name: "Hungary"
		},
		{
			id: "62",
			name: "Iceland"
		},
		{
			id: "180",
			name: "India - All Regions (River Sample Only)"
		},
		{
			id: "197",
			name: "India - All Regions (River sampling only)"
		},
		{
			id: "63",
			name: "India - East"
		},
		{
			id: "140",
			name: "India - Mumbai"
		},
		{
			id: "64",
			name: "India - North"
		},
		{
			id: "66",
			name: "India - Rest of South"
		},
		{
			id: "67",
			name: "India - Rest of West"
		},
		{
			id: "65",
			name: "India - Rural"
		},
		{
			id: "8",
			name: "India - Unspecified"
		},
		{
			id: "68",
			name: "Indonesia"
		},
		{
			id: "142",
			name: "Indonesia (JKT) (Mobile Only)"
		},
		{
			id: "69",
			name: "Iran"
		},
		{
			id: "70",
			name: "Ireland"
		},
		{
			id: "9",
			name: "Israel"
		},
		{
			id: "10",
			name: "Italy"
		},
		{
			id: "143",
			name: "Ivory Coast"
		},
		{
			id: "71",
			name: "Jamaica"
		},
		{
			id: "72",
			name: "Japan"
		},
		{
			id: "144",
			name: "Jordan"
		},
		{
			id: "73",
			name: "Kazakhstan"
		},
		{
			id: "74",
			name: "Kenya"
		},
		{
			id: "75",
			name: "Korea"
		},
		{
			id: "194",
			name: "Kosovo"
		},
		{
			id: "76",
			name: "Kuwait"
		},
		{
			id: "77",
			name: "Latvia"
		},
		{
			id: "78",
			name: "Lebanon"
		},
		{
			id: "79",
			name: "Lithuania"
		},
		{
			id: "80",
			name: "Luxembourg"
		},
		{
			id: "81",
			name: "Madagascar"
		},
		{
			id: "82",
			name: "Malaysia"
		},
		{
			id: "83",
			name: "Malaysia - Chinese sample"
		},
		{
			id: "84",
			name: "Malaysia - Malay sample"
		},
		{
			id: "162",
			name: "Mali"
		},
		{
			id: "85",
			name: "Malta"
		},
		{
			id: "86",
			name: "Mauritius"
		},
		{
			id: "11",
			name: "Mexico"
		},
		{
			id: "198",
			name: "Moldova"
		},
		{
			id: "87",
			name: "Morocco"
		},
		{
			id: "88",
			name: "Mozambique"
		},
		{
			id: "136",
			name: "Myanmar (Burma)"
		},
		{
			id: "182",
			name: "Namibia"
		},
		{
			id: "89",
			name: "Nepal"
		},
		{
			id: "12",
			name: "Netherlands"
		},
		{
			id: "90",
			name: "New Zealand"
		},
		{
			id: "91",
			name: "Nicaragua"
		},
		{
			id: "92",
			name: "Nigeria"
		},
		{
			id: "201",
			name: "North Macedonia"
		},
		{
			id: "199",
			name: "North Macedonia - Albanian Speaking"
		},
		{
			id: "200",
			name: "North Macedonia - Macedonian Speaking"
		},
		{
			id: "170",
			name: "Norway"
		},
		{
			id: "93",
			name: "Norway - mixed methodology"
		},
		{
			id: "94",
			name: "Pakistan"
		},
		{
			id: "145",
			name: "Pakistan (Karachi Only)"
		},
		{
			id: "146",
			name: "Pakistan (Lahore Only)"
		},
		{
			id: "95",
			name: "Panama"
		},
		{
			id: "96",
			name: "Paraguay"
		},
		{
			id: "97",
			name: "Peru"
		},
		{
			id: "98",
			name: "Philippines"
		},
		{
			id: "147",
			name: "Philippines (GMA & non-GMA) (Mobile Only)"
		},
		{
			id: "148",
			name: "Philippines (GMA) (Mobile Only)"
		},
		{
			id: "13",
			name: "Poland"
		},
		{
			id: "99",
			name: "Portugal"
		},
		{
			id: "100",
			name: "Puerto Rico"
		},
		{
			id: "165",
			name: "Qatar"
		},
		{
			id: "185",
			name: "Reunion Island"
		},
		{
			id: "101",
			name: "Romania"
		},
		{
			id: "102",
			name: "Russia"
		},
		{
			id: "103",
			name: "Saudi Arabia"
		},
		{
			id: "104",
			name: "Senegal"
		},
		{
			id: "105",
			name: "Serbia"
		},
		{
			id: "106",
			name: "Singapore"
		},
		{
			id: "107",
			name: "Slovakia"
		},
		{
			id: "108",
			name: "Slovenia"
		},
		{
			id: "168",
			name: "South Africa (SEM SG 2-3)"
		},
		{
			id: "169",
			name: "South Africa (SEM SG 4-5)"
		},
		{
			id: "149",
			name: "South Africa (Total Market)"
		},
		{
			id: "109",
			name: "South Africa - LSMA (7-10)"
		},
		{
			id: "110",
			name: "South Africa - LSMB (5-6)"
		},
		{
			id: "184",
			name: "South Africa - LSMC"
		},
		{
			id: "111",
			name: "Spain"
		},
		{
			id: "112",
			name: "Sri Lanka"
		},
		{
			id: "172",
			name: "Sweden"
		},
		{
			id: "113",
			name: "Sweden - mixed methodology"
		},
		{
			id: "114",
			name: "Switzerland"
		},
		{
			id: "195",
			name: "Switzerland - French Speaking"
		},
		{
			id: "196",
			name: "Switzerland - German Speaking"
		},
		{
			id: "115",
			name: "Syria"
		},
		{
			id: "116",
			name: "Taiwan"
		},
		{
			id: "117",
			name: "Tanzania"
		},
		{
			id: "150",
			name: "Thailand (Mobile Only)"
		},
		{
			id: "118",
			name: "Thailand Not Pre-Recruited Sample"
		},
		{
			id: "155",
			name: "Thailand Pre-Recruited Sample"
		},
		{
			id: "119",
			name: "Trinidad"
		},
		{
			id: "120",
			name: "Tunisia"
		},
		{
			id: "14",
			name: "Turkey"
		},
		{
			id: "125",
			name: "Uganda"
		},
		{
			id: "126",
			name: "Ukraine"
		},
		{
			id: "127",
			name: "United Arab Emirates - Arab sample"
		},
		{
			id: "164",
			name: "United Arab Emirates - Non-Arab sample"
		},
		{
			id: "15",
			name: "United Kingdom"
		},
		{
			id: "135",
			name: "Unspecified"
		},
		{
			id: "128",
			name: "Uruguay"
		},
		{
			id: "122",
			name: "USA - African American"
		},
		{
			id: "16",
			name: "USA - English"
		},
		{
			id: "124",
			name: "USA - Hispanic"
		},
		{
			id: "129",
			name: "Venezuela"
		},
		{
			id: "130",
			name: "Vietnam"
		},
		{
			id: "156",
			name: "Vietnam (Rural)"
		},
		{
			id: "157",
			name: "Vietnam - Cantho"
		},
		{
			id: "158",
			name: "Vietnam - Cantho & Ho Chi Minh"
		},
		{
			id: "131",
			name: "Vietnam - Hanoi"
		},
		{
			id: "132",
			name: "Vietnam - Ho Chi Minh"
		},
		{
			id: "133",
			name: "Zambia"
		},
		{
			id: "134",
			name: "Zimbabwe"
		}
	]
}, tv = "category:", nv = "subcategory:", rv = "market:", iv = ev.categories, av = ev.markets, ov = (e) => {
	let t = e.getTagValue(tv);
	if (!t) return;
	let n = iv.find((e) => e.id === t);
	if (!n) return;
	let r = e.getTagValue(nv);
	return r ? {
		category: n,
		subCategory: n.subcategories.find((e) => e.id === r)
	} : {
		category: n,
		subCategory: void 0
	};
}, sv = (e) => {
	let t = e.getTagValue(rv);
	if (t) return av.find((e) => e.id === t);
}, cv = ({ el: e }) => {
	switch (e.type) {
		case "instruction": return e.instruction.replaceAll("\n", " ").replaceAll("*", "");
		case "image": return `The image ${e.imageLink} is displayed.`;
		case "radiogroup":
		case "dropdown": return `${e.title || e.name} Choose 1 of: ${e.choices.map((e) => M_(e).text).join(", ")}`;
		case "checkbox": return `${e.title || e.name} Choose ${e.minSelectedChoices ?? "1"} ${e.maxSelectedChoices ? `to ${e.maxSelectedChoices}` : "or more"} of: ${e.choices.map((e) => M_(e).text).join(", ")}`;
		case "ranking": return `${e.title || e.name} Rank the following: ${e.choices.map((e) => M_(e).text).join(", ")}`;
		default: return e.title || e.name;
	}
}, lv = ({ stimulus: e, annotations: t }) => {
	let n = e.manualAdvance ? "until the respondent manually continues" : `for ${e.exposureTimeMs} milliseconds`;
	switch (e.type) {
		case "CALIBRATION": return /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"A series of ",
			e.calibrationOptions?.positions.length,
			" dots are displayed for the respondent to focus on. They are displayed in a random order for a total of ",
			e.exposureTimeMs,
			" ",
			"milliseconds. This is used to calibrate the eye tracking."
		] });
		case "IMAGE": return /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"The image ",
			e.imageUrl,
			" is displayed ",
			n,
			"."
		] });
		case "VIDEO": {
			let r = t.some((t) => t.isVideoSceneAnnotation() && t.fragments.some((t) => t.stimuli.id === e.id));
			return /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
				"The video ",
				e.videoUrl,
				" is displayed ",
				n,
				".",
				" ",
				r && "It is split into annotation intervals with thumbnails for analysis."
			] });
		}
		case "WEB": return /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"The website ",
			e.websiteUrl,
			" is displayed for the respondent to interact with."
		] });
		case "INSTRUCTION": return /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
			"Instruction text is displayed: `",
			e.instructionOptions?.instructions,
			"`"
		] });
		case "JS_SURVEY": return /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, { children: "A survey that asks the respondent a series of questions:" }), e.surveyQuestions.pages?.flatMap((e) => e.elements?.map((e) => /* @__PURE__ */ (0, Z.jsx)(Sg, { children: /* @__PURE__ */ (0, Z.jsx)(cv, { el: e }) }, e.name)))] });
		default: return "";
	}
}, uv = async ({ api: e }, t, n) => {
	let r = await e.getStudyByName(t), i = r.stimuli.find((e) => e.displayName.toLocaleLowerCase() === n.toLocaleLowerCase());
	if (!i) throw new J(`Stimulus named ${n} not found in study ${t}. Available stimuli:\n${r.stimuli.toSorted((e, t) => e.displayName.localeCompare(t.displayName, void 0, { numeric: !0 })).map((e) => e.displayName).join("\n")}`);
	let a = await e.getAnnotations(r.id), o = a.filter((e) => e.fragments.some((e) => e.stimuli.id === i.id && !e.respondent)), s = ov(i);
	return /* @__PURE__ */ (0, Z.jsxs)(wg, {
		spacing: 1,
		children: [/* @__PURE__ */ (0, Z.jsxs)($, { children: [
			/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h1",
				children: i.displayName
			}),
			/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["ID: ", i.id] }),
			s?.category && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Category: ", s.category.name] }),
			s?.subCategory && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Subcategory: ", s.subCategory.name] }),
			/* @__PURE__ */ (0, Z.jsx)(lv, {
				stimulus: i,
				annotations: a
			})
		] }), a.length > 0 && /* @__PURE__ */ (0, Z.jsxs)($, { children: [
			/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h2",
				children: "Annotations"
			}),
			/* @__PURE__ */ (0, Z.jsx)(Q, { children: "An annotation groups together a series of named time intervals." }),
			/* @__PURE__ */ (0, Z.jsx)(Q, { children: "Annotation fragment image URLs can be fetched without authentication." }),
			o.map((e) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h3",
				children: e.name
			}), e.getSortedFragmentsForStimulus(i.id).map((e) => /* @__PURE__ */ (0, Z.jsx)(Ee.Fragment, { children: /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
				e.text,
				": ",
				fg(e.rangeStart, "ms"),
				"-",
				fg(e.rangeEnd, "ms"),
				" ",
				e.imageUrl && `(${e.imageUrl})`
			] }) }, e.id))] }, e.id))
		] })]
	});
}, dv = async ({ api: e }, t, { stimulus: n, segment: r, output: i }) => {
	let a = await e.getStudyByName(t), o = n ? [Kl(a, n)] : a.getOrderedStimuliForOnlineAnalysis(), s = r ? [Gl(a, r)] : a.getOrderedSegments(), c = (await Wl(o.flatMap((e) => s.map((t) => ({
		stim: e,
		seg: t
	}))), async ({ stim: t, seg: n }) => {
		let r = t.getDataForSegment(n.id);
		if (!r) return [];
		let i = await e.getSegmentExposureData(r.url);
		return Object.entries(i.summaryMetrics?.signalSummaryMetrics ?? {}).toSorted(([e], [t]) => e.localeCompare(t, void 0, { numeric: !0 })).map(([e, r]) => [
			t.displayName,
			n.name,
			xe(e),
			r.mean,
			r.stdDev,
			r.variance,
			r.count
		]);
	})).flat();
	if (c.length === 0) throw new J(`No summary metrics are available for ${a.name}. If data has been collected recently it may still be processing, try again in a few minutes.`);
	return zg([[
		"Stimulus",
		"Segment",
		"Signal",
		"Mean",
		"Standard deviation",
		"Variance",
		"Count"
	], ...c], i);
}, fv = [
	"Valence",
	"Engagement",
	"Neutral",
	"Brow Furrow",
	"Joy"
], pv = (e) => e.collectedSensors.find((e) => e.sensor === "Affectiva AFFDEX")?.signals.map((e) => e.name) ?? [], mv = (e, t) => {
	let n = pv(e);
	if (t) return n.toSorted((e, t) => e.localeCompare(t, void 0, { numeric: !0 }));
	let r = new Set(n);
	return fv.filter((e) => r.has(e));
}, hv = (e, t) => e.summaryMetrics?.signalSummaryMetrics[be(t)]?.mean, gv = ({ signalNames: e, getValue: t }) => e.map((e) => {
	let n = t(e);
	return n === void 0 ? null : /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
		me(e),
		": ",
		fe(n, 1)
	] }, e);
}), _v = ({ stimulus: e, data: t }) => {
	if (e.type !== "JS_SURVEY") return null;
	let n = N_(e.surveyQuestions, t.jsSurveyAnswers);
	return n ? /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
		variant: "h2",
		children: "Survey answers"
	}), Object.entries(n).map(([e, t]) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
		variant: "h3",
		children: e
	}), Object.entries(t).map(([e, t]) => /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
		e,
		": ",
		t
	] }, e))] }, e))] }) : null;
}, vv = ({ stimulus: e, annotations: t, data: n, signalNames: r, individualIntervals: i }) => {
	if (t.length === 0) return /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
		variant: "h2",
		children: "Annotations"
	}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "No annotations are defined for this stimulus." })] });
	let a = t.map((t) => kg(e, t, n)).filter((e) => e !== void 0);
	return a.length === 0 ? /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
		variant: "h2",
		children: "Annotation metrics"
	}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "No annotation metrics are available for this stimulus and segment." })] }) : /* @__PURE__ */ (0, Z.jsxs)($, { children: [
		/* @__PURE__ */ (0, Z.jsx)(Q, {
			variant: "h2",
			children: "Annotation metrics"
		}),
		/* @__PURE__ */ (0, Z.jsx)(Q, { children: "Metrics for annotated intervals of the stimulus." }),
		/* @__PURE__ */ (0, Z.jsx)(Q, { children: "Annotation fragment image URLs can be fetched without authentication." }),
		a.map((e) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [
			/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h3",
				children: e.annotation.name
			}),
			!i && /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, { children: "All intervals" }), /* @__PURE__ */ (0, Z.jsx)(gv, {
				signalNames: r,
				getValue: (t) => e.aggregatedFragmentsInfo.metrics[t]
			})] }),
			i && e.orderedFragmentsInfo.map((e, t) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
				e.fragment.text || `Interval ${t + 1}`,
				":",
				" ",
				fg(e.fragment.rangeStart, "ms"),
				"-",
				fg(e.fragment.rangeEnd, "ms"),
				e.fragment.imageUrl && ` (${e.fragment.imageUrl})`
			] }), /* @__PURE__ */ (0, Z.jsx)(gv, {
				signalNames: r,
				getValue: (t) => e.metrics[t]
			})] }, e.fragment.id))
		] }, e.annotation.id))
	] });
}, yv = (e, t) => {
	let n = e.isVideoSceneAnnotation();
	return n === t.isVideoSceneAnnotation() ? e.name.localeCompare(t.name, void 0, { numeric: !0 }) : n ? -1 : 1;
}, bv = (e, t, n) => e.filter((e) => e.fragments.some((e) => e.stimuli.id === t.id)).filter((e) => !n.annotation || e.name.toLocaleLowerCase() === n.annotation.toLocaleLowerCase()).toSorted(yv), xv = ({ segment: e, stimulus: t, data: n }) => /* @__PURE__ */ (0, Z.jsxs)($, { children: [
	/* @__PURE__ */ (0, Z.jsxs)(Q, {
		variant: "h1",
		children: [
			t.displayName,
			" - ",
			e.name
		]
	}),
	/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Stimulus type: ", t.type] }),
	/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Respondents in segment: ", e.respondents.length] }),
	/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Respondents with exposure data: ", n.totalNumberOfRespondents] })
] }), Sv = async ({ api: e, region: t }, n, r, i, a = {}) => {
	let o = await e.getStudyByName(n), s = Kl(o, r), c = Gl(o, i), l = s.getDataForSegment(c.id);
	if (!l) return /* @__PURE__ */ (0, Z.jsx)(wg, {
		spacing: 1,
		children: /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsxs)(Q, {
			variant: "h1",
			children: [
				s.displayName,
				" - ",
				c.name
			]
		}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "No exposure data is available for this stimulus and segment." })] })
	});
	let u = await e.getSegmentExposureData(l.url), d = mv(u, a.allMetrics), f = bv(await e.getAnnotations(o.id), s, a);
	if (a.annotation && f.length === 0) throw new J(`Annotation named ${a.annotation} not found for stimulus ${s.displayName}.`);
	let p = s.type === "VIDEO" && !a.annotation && !f.some((e) => e.isVideoSceneAnnotation());
	return /* @__PURE__ */ (0, Z.jsxs)(wg, {
		spacing: 1,
		children: [
			/* @__PURE__ */ (0, Z.jsx)(xv, {
				stimulus: s,
				segment: c,
				data: u
			}),
			u.summaryMetrics?.signalSummaryMetrics && d.length > 0 && /* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h2",
					children: "Overall summary metrics"
				}),
				/* @__PURE__ */ (0, Z.jsx)(gv, {
					signalNames: d,
					getValue: (e) => hv(u, e)
				}),
				!a.allMetrics && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "Only the most important metrics are shown. More metrics are available with the `--all-metrics` option." })
			] }),
			/* @__PURE__ */ (0, Z.jsx)(_v, {
				stimulus: s,
				data: u
			}),
			/* @__PURE__ */ (0, Z.jsx)(vv, {
				stimulus: s,
				annotations: f,
				data: u,
				signalNames: d,
				individualIntervals: a.individualIntervals
			}),
			p && /* @__PURE__ */ (0, Z.jsx)($, { children: /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
				"Inform the user that they can get metrics for the scenes of the video stimulus by defining the intervals on on the study analysis page on ",
				`${t.uiUrl}/#studies/${o.id}/analysis`,
				". The user can define the intervals manually or by using the automatic scene detection."
			] }) }),
			/* @__PURE__ */ (0, Z.jsxs)($, { children: [
				/* @__PURE__ */ (0, Z.jsx)(G_, {}),
				/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h3",
					children: s.displayName
				}),
				/* @__PURE__ */ (0, Z.jsx)(Q, { children: l.url })
			] })
		]
	});
}, Cv = (e) => e ? " (fixed)" : " (randomized)", wv = ({ block: e, study: t, depth: n = 0 }) => {
	let r = e.children.slice().sort((e, t) => e.blockOrder - t.blockOrder), i = "  ".repeat(n);
	return /* @__PURE__ */ (0, Z.jsx)(Z.Fragment, { children: r.map((e) => {
		if (e.stimuli) {
			let n = t.getStimuli(e.stimuli.id);
			return /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [
				i,
				"- ",
				n.displayName,
				Cv(e.fixed),
				/* @__PURE__ */ (0, Z.jsx)(xg, {})
			] }, e.id);
		}
		return e.block ? /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [
			i,
			"- Block: ",
			e.block.displayName,
			Cv(e.fixed),
			/* @__PURE__ */ (0, Z.jsx)(xg, {}),
			/* @__PURE__ */ (0, Z.jsx)(wv, {
				block: e.block,
				study: t,
				depth: n + 1
			})
		] }, e.id) : null;
	}) });
}, Tv = ({ study: e }) => {
	let t = e.remoteDataCollection || e.getNonPreviewSessions().length > 0;
	if (e.isPredictive()) return /* @__PURE__ */ (0, Z.jsx)(Q, { children: "This is an AI Predictive study. No actual human respondents were involved in the study. Instead data was generated based on the Affectiva norms database." });
	if (!t) return /* @__PURE__ */ (0, Z.jsx)(Q, { children: "Data collection has not been started yet so no respondents have completed the study." });
	let n = e.getOdcOrCloudNativeRespondentsProcessedCount(), r = e.getOdcOrCloudNativeRespondentsInProgressCount(), i = e.getOdcOrCloudNativeRespondentsProcessingCount(), a = e.getOdcOrCloudNativeAbandonedRespondentsCount(), o = e.getOdcOrCloudNativeRespondentsWithProcessingErrorCount();
	return /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
		/* @__PURE__ */ (0, Z.jsxs)(Sg, { children: [n, " respondents have successfully completed the study."] }),
		/* @__PURE__ */ (0, Z.jsxs)(Sg, { children: [i, " respondents have completed the study but their data is still being processed."] }),
		/* @__PURE__ */ (0, Z.jsxs)(Sg, { children: [r, " respondents are currently in progress."] }),
		/* @__PURE__ */ (0, Z.jsxs)(Sg, { children: [a, " respondents abandoned the study partway through."] }),
		/* @__PURE__ */ (0, Z.jsxs)(Sg, { children: [o, " respondents encountered a technical error while their data was processed."] })
	] });
}, Ev = [
	new ug("list-studies", "List all the studies you have access to", V_),
	new ug("study-overview", "Get an overview of the contents of a study", async ({ api: e, region: t }, n) => {
		let r = await e.getStudyByName(n), i = await e.getAoiSet(r.aoiSet.id), a = await e.getAnnotations(r.id), o;
		if (r.folder) {
			let t = await e.getFolder(r.folder.id);
			t.isRootFolder() || (o = t.getFullFolderPath().slice(1).map(({ folderName: e }) => e).join("/"));
		}
		let s = sv(r);
		return /* @__PURE__ */ (0, Z.jsxs)(wg, {
			spacing: 1,
			children: [
				/* @__PURE__ */ (0, Z.jsxs)($, { children: [
					/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h1",
						children: r.name
					}),
					/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["ID: ", r.id] }),
					/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
						"Web interface URL: ",
						t.uiUrl,
						"/#studies/",
						r.id
					] }),
					o && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Folder: ", o] }),
					s && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Market: ", s.name] })
				] }),
				/* @__PURE__ */ (0, Z.jsxs)($, { children: [
					/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h2",
						children: "Stimuli"
					}),
					/* @__PURE__ */ (0, Z.jsx)(Q, { children: "The study contains the following stimuli which can be displayed to respondents. They are listed here in alphabetical order. The order respondents see them in depends on the flows listed below." }),
					r.stimuli.toSorted((e, t) => e.displayName.localeCompare(t.displayName, void 0, { numeric: !0 })).map((e) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h3",
						children: e.displayName
					}), /* @__PURE__ */ (0, Z.jsx)(lv, {
						stimulus: e,
						annotations: a
					})] }, e.id))
				] }),
				/* @__PURE__ */ (0, Z.jsxs)($, { children: [
					/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h2",
						children: "Flows"
					}),
					r.topLevelBlocks.length === 1 && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "The study has a single flow which determines the order respondents see the stimuli." }),
					r.topLevelBlocks.length > 1 && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "The study has these flows which determine the order respondents see the stimuli. Each respondent sees only one flow." }),
					/* @__PURE__ */ (0, Z.jsx)(Q, { children: "Each item is either in a fixed position or randomized with the other randomized items in the same block." }),
					r.topLevelBlocks.map((e) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [
						/* @__PURE__ */ (0, Z.jsx)(Q, {
							variant: "h3",
							children: e.displayName
						}),
						/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
							"Number of respondents:",
							" ",
							r.getNonPreviewSessions().filter((t) => t.stimuliBlock?.id === e.id).length
						] }),
						/* @__PURE__ */ (0, Z.jsx)(wv, {
							block: e,
							study: r
						})
					] }, e.id))
				] }),
				Object.values(r.sensors).some((e) => e) && /* @__PURE__ */ (0, Z.jsxs)($, { children: [
					/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h2",
						children: "Sensors"
					}),
					/* @__PURE__ */ (0, Z.jsx)(Q, { children: "The study uses the following sensors to record data from the respondent:" }),
					r.sensors.webcam && /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h3",
						children: "Webcam"
					}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "The webcam records the respondent's face." })] }),
					r.sensors.eyeTracking && /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h3",
						children: "Eye tracking"
					}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "The recording of the respondent's face and the calibration stimuli are used to determine where on the screen the respondent is looking." })] }),
					r.sensors.headPose && /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h3",
						children: "Head pose"
					}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "The recording of the respondent's face is used to show an anonymized 3d model of their head pose." })] }),
					r.sensors.facialExpressions && /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h3",
						children: "Facial expressions"
					}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "The recording of the respondent's face is used to determine which of these emotions they are experiencing: joy, anger, fear, surprise, sadness, contempt, and disgust. Valence (represents whether an emotion is positive or negative) and engagement (measures how active the face is, indicating attention) are also measured." })] }),
					r.sensors.screenRecording && /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h3",
						children: "Screen recording"
					}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "The respondent's screen is recorded." })] })
				] }),
				/* @__PURE__ */ (0, Z.jsxs)($, { children: [
					/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h2",
						children: "Respondents"
					}),
					/* @__PURE__ */ (0, Z.jsx)(Tv, { study: r }),
					r.panelProviderType === "PROLIFIC" && r.panelProviderId && /* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["The respondents were recruited through the panel provider Prolific: https://app.prolific.com/researcher/workspaces/studies/", r.panelProviderId] }),
					r.deviceTypes.length > 0 && /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [
						/* @__PURE__ */ (0, Z.jsx)(Q, {
							variant: "h3",
							children: "Devices"
						}),
						/* @__PURE__ */ (0, Z.jsx)(Q, { children: "Respondents were limited to using the following devices to participate in the study:" }),
						r.deviceTypes.includes("DESKTOP") && /* @__PURE__ */ (0, Z.jsx)(Sg, { children: "Desktop and laptop computers" }),
						r.deviceTypes.includes("TABLET") && /* @__PURE__ */ (0, Z.jsx)(Sg, { children: "Android and Apple tablets" }),
						r.deviceTypes.includes("PHONE") && /* @__PURE__ */ (0, Z.jsx)(Sg, { children: "Smartphones" })
					] })
				] }),
				/* @__PURE__ */ (0, Z.jsxs)($, { children: [
					/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h2",
						children: "Segments"
					}),
					r.segments.length === 0 && /* @__PURE__ */ (0, Z.jsx)(Q, { children: "The study does not contain any segments yet. Segments can be created to compare groups of respondents against each other." }),
					r.segments.length > 0 && /* @__PURE__ */ (0, Z.jsxs)(Z.Fragment, { children: [/* @__PURE__ */ (0, Z.jsxs)(Q, { children: [
						"The ",
						r.getAllRespondentsSegment().respondents.length,
						" respondents in the study have been grouped together into the following segments so they can be compared against each other. A single respondent can be in multiple segments. It is possible to create additional segments."
					] }), r.getOrderedSegments().map((e, t) => /* @__PURE__ */ (0, Z.jsxs)(Ee.Fragment, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
						variant: "h3",
						children: e.name
					}), /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [e.respondents.length, " respondents. "] })] }, t))] })
				] }),
				i.aoiDefinitions.length > 0 && /* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
					variant: "h2",
					children: "Areas of Interest (AOIs)"
				}), /* @__PURE__ */ (0, Z.jsxs)(Q, { children: [i.aoiDefinitions.length, " areas of interest have been defined on the stimuli in this study. This creates metrics based on when the respondents look at these areas and allows comparing them across segments."] })] })
			]
		});
	}, [{
		name: "study-name",
		description: "Name of the study"
	}]),
	new ug("segment-details", "Get detailed information about a segment", J_, [{
		name: "study-name",
		description: "Name of the study the segment belongs to"
	}, {
		name: "segment-name",
		description: "Name of the segment"
	}], { allMetrics: {
		description: "Include all available summary metrics",
		type: "boolean"
	} }),
	new ug("stimulus-details", "Get detailed information about a stimulus", uv, [{
		name: "study-name",
		description: "Name of the study the stimulus belongs to"
	}, {
		name: "stimulus-name",
		description: "Name of the stimulus"
	}]),
	new ug("respondent-details", "Get detailed information about a respondent", H_, [{
		name: "study-name",
		description: "Name of the study the respondent belongs to"
	}, {
		name: "respondent-label",
		description: "Label of the respondent"
	}]),
	new ug("list-respondents-csv", "List all the respondents in a study and their details as CSV", B_, [{
		name: "study-name",
		description: "Name of the study"
	}], {
		rawDataUrls: {
			description: "Add columns with the raw data URL for each stimulus",
			type: "boolean"
		},
		progress: {
			description: "Also include respondents that are in progress, processing, abandoned or in error, with columns for their state and progress. Useful for tracking ongoing data collection.",
			type: "boolean"
		},
		output: {
			description: "Write the CSV to this file instead of printing it",
			type: "string",
			cliOnly: !0
		}
	}),
	new ug("stimulus-metrics-csv", "List the summary metrics for every stimulus, segment and signal combination in a study as CSV", dv, [{
		name: "study-name",
		description: "Name of the study"
	}], {
		stimulus: {
			description: "Only include the stimulus with this name",
			type: "string"
		},
		segment: {
			description: "Only include the segment with this name",
			type: "string"
		},
		output: {
			description: "Write the CSV to this file instead of printing it",
			type: "string",
			cliOnly: !0
		}
	}),
	new ug("annotation-metrics-csv", "List the metrics of every annotation interval in a study as CSV, with one row per interval, stimulus and segment combination", Bg, [{
		name: "study-name",
		description: "Name of the study"
	}], {
		stimulus: {
			description: "Only include the stimulus with this name",
			type: "string"
		},
		segment: {
			description: "Only include the segment with this name",
			type: "string"
		},
		annotation: {
			description: "Only include the annotation with this name",
			type: "string"
		},
		aggregatedIntervals: {
			description: "Output one row per annotation with the metrics aggregated over all its intervals, instead of one row per individual interval",
			type: "boolean"
		},
		output: {
			description: "Write the CSV to this file instead of printing it",
			type: "string",
			cliOnly: !0
		}
	}),
	new ug("signal-timeline-csv", "Export the recorded signal time series for a stimulus as CSV, with one row per timestamp and one column per signal", Q_, [{
		name: "study-name",
		description: "Name of the study"
	}, {
		name: "stimulus-name",
		description: "Name of the stimulus"
	}], {
		segment: {
			description: "Name of the segment to get the aggregated timeline of",
			type: "string"
		},
		respondent: {
			description: "Label of a respondent to get the individual timeline of, instead of the aggregated timeline of a segment",
			type: "string"
		},
		output: {
			description: "Write the CSV to this file instead of printing it",
			type: "string",
			cliOnly: !0
		}
	}),
	new ug("fixations-csv", "Export the eye tracking fixations of the individual respondents for a stimulus as CSV, with one row per fixation", w_, [{
		name: "study-name",
		description: "Name of the study"
	}, {
		name: "stimulus-name",
		description: "Name of the stimulus"
	}], {
		respondent: {
			description: "Only include the respondent with this label",
			type: "string"
		},
		output: {
			description: "Write the CSV to this file instead of printing it",
			type: "string",
			cliOnly: !0
		}
	}),
	new ug("gazes-csv", "Export the eye tracking gaze points of the individual respondents for a stimulus as CSV, with one row per gaze point", T_, [{
		name: "study-name",
		description: "Name of the study"
	}, {
		name: "stimulus-name",
		description: "Name of the stimulus"
	}], {
		respondent: {
			description: "Only include the respondent with this label",
			type: "string"
		},
		output: {
			description: "Write the CSV to this file instead of printing it",
			type: "string",
			cliOnly: !0
		}
	}),
	new ug("aoi-metrics-csv", "List the eye tracking metrics for every area of interest (AOI) and segment combination in a study as CSV", p_, [{
		name: "study-name",
		description: "Name of the study"
	}], {
		stimulus: {
			description: "Only include AOIs on the stimulus with this name",
			type: "string"
		},
		segment: {
			description: "Only include the segment with this name",
			type: "string"
		},
		output: {
			description: "Write the CSV to this file instead of printing it",
			type: "string",
			cliOnly: !0
		}
	}),
	new ug("stimulus-segment-details", "Get detailed metrics for a stimulus and segment combination", Sv, [
		{
			name: "study-name",
			description: "Name of the study"
		},
		{
			name: "stimulus-name",
			description: "Name of the stimulus"
		},
		{
			name: "segment-name",
			description: "Name of the segment"
		}
	], {
		annotation: {
			description: "Only include one annotation",
			type: "string"
		},
		allMetrics: {
			description: "Include all available summary metrics",
			type: "boolean"
		},
		individualIntervals: {
			description: "Show each annotation interval instead of aggregated annotation metrics",
			type: "boolean"
		}
	}),
	new ug("create-segment", "Create a new segment", h_, [
		{
			name: "study-name",
			description: "Name of the study"
		},
		{
			name: "segment-name",
			description: "Name of the segment"
		},
		{
			name: "respondent-labels",
			description: "Labels of the respondents to include",
			variadic: !0
		}
	], void 0, "write"),
	new ug("edit-segment", "Rename a segment or change which respondents it contains", S_, [{
		name: "study-name",
		description: "Name of the study"
	}, {
		name: "segment-name",
		description: "Name of the segment to change"
	}], {
		name: {
			description: "New name for the segment",
			type: "string"
		},
		addRespondents: {
			description: "Comma-separated labels of respondents to add to the segment",
			type: "string"
		},
		removeRespondents: {
			description: "Comma-separated labels of respondents to remove from the segment",
			type: "string"
		}
	}, "write"),
	new ug("add-annotation-fragment", "Add an annotation time interval to a stimulus, creating the annotation if it does not exist", Tg, [
		{
			name: "study-name",
			description: "Name of the study"
		},
		{
			name: "annotation-name",
			description: "Name of the annotation, which is created if it does not exist"
		},
		{
			name: "stimulus-name",
			description: "Name of the stimulus the interval is on"
		},
		{
			name: "start-ms",
			description: "Start of the interval in milliseconds from the start of the stimulus"
		},
		{
			name: "end-ms",
			description: "End of the interval in milliseconds from the start of the stimulus"
		}
	], {
		text: {
			description: "Text label for the interval",
			type: "string"
		},
		respondent: {
			description: "Label of a respondent to attach the interval to, instead of the whole stimulus",
			type: "string"
		}
	}, "write"),
	new ug("edit-annotation-fragment", "Change the time range or text of an existing annotation interval", y_, [
		{
			name: "study-name",
			description: "Name of the study"
		},
		{
			name: "annotation-name",
			description: "Name of the annotation"
		},
		{
			name: "stimulus-name",
			description: "Name of the stimulus the interval is on"
		},
		{
			name: "current-start-ms",
			description: "Current start of the interval in milliseconds, used to identify it"
		}
	], {
		startMs: {
			description: "New start of the interval in milliseconds",
			type: "string"
		},
		endMs: {
			description: "New end of the interval in milliseconds",
			type: "string"
		},
		text: {
			description: "New text label for the interval",
			type: "string"
		}
	}, "write"),
	new ug("list-aois", "List the areas of interest (AOIs) defined on the stimuli in a study, including their positions and sizes", D_, [{
		name: "study-name",
		description: "Name of the study"
	}], { stimulus: {
		description: "Only include AOIs on the stimulus with this name",
		type: "string"
	} }),
	new ug("create-aoi", "Create an area of interest (AOI) on a stimulus", m_, [
		{
			name: "study-name",
			description: "Name of the study"
		},
		{
			name: "stimulus-name",
			description: "Name of the stimulus the AOI is on"
		},
		{
			name: "aoi-name",
			description: "Name of the new AOI"
		}
	], {
		bounds: {
			description: "Rectangle as four numbers \"left top width height\" in percent of the stimulus size, e.g. \"10 25 30 40\"",
			type: "string"
		},
		points: {
			description: "Polygon corners as comma-separated pairs in percent of the stimulus size, e.g. \"10,25 40,25 25,60\"",
			type: "string"
		},
		timeline: {
			description: "Moving shape on a video stimulus, as semicolon-separated \"<milliseconds>: <rectangle, polygon or hidden>\" entries, e.g. \"0: hidden; 5000: 10 25 30 40; 12000: hidden\"",
			type: "string"
		},
		color: {
			description: "Display color as a hex color like #ffa500",
			type: "string"
		}
	}, "write"),
	new ug("edit-aoi", "Rename an area of interest (AOI) or change the area it covers", b_, [
		{
			name: "study-name",
			description: "Name of the study"
		},
		{
			name: "stimulus-name",
			description: "Name of the stimulus the AOI is on"
		},
		{
			name: "aoi-name",
			description: "Name of the AOI to change"
		}
	], {
		name: {
			description: "New name for the AOI",
			type: "string"
		},
		bounds: {
			description: "New rectangle as four numbers \"left top width height\" in percent of the stimulus size, e.g. \"10 25 30 40\"",
			type: "string"
		},
		points: {
			description: "New polygon corners as comma-separated pairs in percent of the stimulus size, e.g. \"10,25 40,25 25,60\"",
			type: "string"
		},
		timeline: {
			description: "New moving shape on a video stimulus, as semicolon-separated \"<milliseconds>: <rectangle, polygon or hidden>\" entries, e.g. \"0: hidden; 5000: 10 25 30 40; 12000: hidden\"",
			type: "string"
		},
		color: {
			description: "New display color as a hex color like #ffa500",
			type: "string"
		}
	}, "write"),
	new ug("delete-aoi", "Delete an area of interest (AOI) and its metrics", __, [
		{
			name: "study-name",
			description: "Name of the study"
		},
		{
			name: "stimulus-name",
			description: "Name of the stimulus the AOI is on"
		},
		{
			name: "aoi-name",
			description: "Name of the AOI to delete"
		}
	], void 0, "destructive"),
	new ug("delete-annotation-fragment", "Delete an annotation interval, and the annotation itself if it was the last one", g_, [
		{
			name: "study-name",
			description: "Name of the study"
		},
		{
			name: "annotation-name",
			description: "Name of the annotation"
		},
		{
			name: "stimulus-name",
			description: "Name of the stimulus the interval is on"
		},
		{
			name: "start-ms",
			description: "Start of the interval in milliseconds, used to identify it"
		}
	], void 0, "destructive"),
	new ug("add-note", "Add a note to the study or an item in it, describing an interesting discovery or why a change was made", Og, [{
		name: "study-name",
		description: "Name of the study"
	}, {
		name: "text",
		description: "The text of the note"
	}], {
		segment: {
			description: "Name of a segment to attach the note to",
			type: "string"
		},
		respondent: {
			description: "Label of a respondent to attach the note to",
			type: "string"
		},
		stimulus: {
			description: "Name of a stimulus to attach the note to",
			type: "string"
		},
		annotation: {
			description: "Name of an annotation, to attach the note to one of its intervals together with --stimulus and --start-ms",
			type: "string"
		},
		startMs: {
			description: "Start time in milliseconds of the annotation interval to attach the note to",
			type: "string"
		}
	}, "write"),
	new ug("list-notes", "List the notes attached to a study and the items in it", k_, [{
		name: "study-name",
		description: "Name of the study"
	}]),
	new ug("delete-note", "Delete a note", v_, [{
		name: "study-name",
		description: "Name of the study"
	}, {
		name: "note-id",
		description: "ID of the note, as shown by list-notes"
	}], void 0, "destructive"),
	new ug("search-help", "Search the iMotions help center for articles about how to use the product", W_, [{
		name: "query",
		description: "The phrase to search for"
	}]),
	new ug("help-article", "Read a help center article about how to use the product", E_, [{
		name: "article-id",
		description: "ID of the article, as returned by search-help"
	}]),
	new ug("status", "Login and account status", $_)
], Dv = ({ api: e, region: t }) => /* @__PURE__ */ (0, Z.jsxs)(wg, {
	spacing: 1,
	children: [
		/* @__PURE__ */ (0, Z.jsxs)($, { children: [
			/* @__PURE__ */ (0, Z.jsx)(Q, {
				variant: "h1",
				children: "Raw API access"
			}),
			/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["API base URL: ", t.apiUrl] }),
			/* @__PURE__ */ (0, Z.jsxs)(Q, { children: ["Authorization header: ", e.getAuthorizationHeader()] })
		] }),
		/* @__PURE__ */ (0, Z.jsxs)($, { children: [/* @__PURE__ */ (0, Z.jsx)(Q, {
			variant: "h2",
			children: "Endpoints"
		}), /* @__PURE__ */ (0, Z.jsx)(Q, { children: "You can use the GET /studies/{id} endpoint to access a study. Note that the response json has a very large number of properties, often with meanings that are not obvious from the names. Do not make assumptions. Data about respondent+stimulus combinations are in stimuli.respondentData." })] }),
		/* @__PURE__ */ (0, Z.jsx)($, { children: /* @__PURE__ */ (0, Z.jsx)(Cg, {
			severity: "warning",
			children: "Do not attempt to POST, PUT or DELETE data under any circumstances. This will very likely lead to data loss."
		}) })
	]
}), Ov = async (e, t) => {
	let n = t.optsWithGlobals().config;
	await ru(n), console.log("Logged out");
}, kv = /* @__PURE__ */ p(((e) => {
	var t = Te();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, a = Symbol.for("react.portal");
	function o(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var s = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function c(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return o(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = s.T, n = i.p;
		try {
			if (s.T = null, i.p = 2, e) return e();
		} finally {
			s.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = c(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") if (typeof t == "object" && t) {
			if (t.as == null || t.as === "script") {
				var n = c(t.as, t.crossOrigin);
				i.d.M(e, {
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0
				});
			}
		} else t ?? i.d.M(e);
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = c(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") if (t) {
			var n = c(t.as, t.crossOrigin);
			i.d.m(e, {
				as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
				crossOrigin: n,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0
			});
		} else i.d.m(e);
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return s.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return s.H.useHostTransitionStatus();
	}, e.version = "19.2.0";
})), Av = /* @__PURE__ */ p(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = kv();
})), jv = /* @__PURE__ */ p(((e) => {
	var t = Te(), n = Av(), r = Symbol.for("react.transitional.element"), i = Symbol.for("react.portal"), a = Symbol.for("react.fragment"), o = Symbol.for("react.strict_mode"), s = Symbol.for("react.profiler"), c = Symbol.for("react.consumer"), l = Symbol.for("react.context"), u = Symbol.for("react.forward_ref"), d = Symbol.for("react.suspense"), f = Symbol.for("react.suspense_list"), p = Symbol.for("react.memo"), m = Symbol.for("react.lazy"), h = Symbol.for("react.scope"), g = Symbol.for("react.activity"), _ = Symbol.for("react.legacy_hidden"), v = Symbol.for("react.memo_cache_sentinel"), ee = Symbol.for("react.view_transition"), y = Symbol.iterator;
	function te(e) {
		return typeof e != "object" || !e ? null : (e = y && e[y] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var b = Array.isArray;
	function x(e, t) {
		var n = e.length & 3, r = e.length - n, i = t;
		for (t = 0; t < r;) {
			var a = e.charCodeAt(t) & 255 | (e.charCodeAt(++t) & 255) << 8 | (e.charCodeAt(++t) & 255) << 16 | (e.charCodeAt(++t) & 255) << 24;
			++t, a = 3432918353 * (a & 65535) + ((3432918353 * (a >>> 16) & 65535) << 16) & 4294967295, a = a << 15 | a >>> 17, a = 461845907 * (a & 65535) + ((461845907 * (a >>> 16) & 65535) << 16) & 4294967295, i ^= a, i = i << 13 | i >>> 19, i = 5 * (i & 65535) + ((5 * (i >>> 16) & 65535) << 16) & 4294967295, i = (i & 65535) + 27492 + (((i >>> 16) + 58964 & 65535) << 16);
		}
		switch (a = 0, n) {
			case 3: a ^= (e.charCodeAt(t + 2) & 255) << 16;
			case 2: a ^= (e.charCodeAt(t + 1) & 255) << 8;
			case 1: a ^= e.charCodeAt(t) & 255, a = 3432918353 * (a & 65535) + ((3432918353 * (a >>> 16) & 65535) << 16) & 4294967295, a = a << 15 | a >>> 17, i ^= 461845907 * (a & 65535) + ((461845907 * (a >>> 16) & 65535) << 16) & 4294967295;
		}
		return i ^= e.length, i ^= i >>> 16, i = 2246822507 * (i & 65535) + ((2246822507 * (i >>> 16) & 65535) << 16) & 4294967295, i ^= i >>> 13, i = 3266489909 * (i & 65535) + ((3266489909 * (i >>> 16) & 65535) << 16) & 4294967295, (i ^ i >>> 16) >>> 0;
	}
	var S = Object.assign, C = Object.prototype.hasOwnProperty, ne = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), w = {}, T = {};
	function re(e) {
		return C.call(T, e) ? !0 : C.call(w, e) ? !1 : ne.test(e) ? T[e] = !0 : (w[e] = !0, !1);
	}
	var E = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" ")), D = new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), O = /["'&<>]/;
	function k(e) {
		if (typeof e == "boolean" || typeof e == "number" || typeof e == "bigint") return "" + e;
		e = "" + e;
		var t = O.exec(e);
		if (t) {
			var n = "", r, i = 0;
			for (r = t.index; r < e.length; r++) {
				switch (e.charCodeAt(r)) {
					case 34:
						t = "&quot;";
						break;
					case 38:
						t = "&amp;";
						break;
					case 39:
						t = "&#x27;";
						break;
					case 60:
						t = "&lt;";
						break;
					case 62:
						t = "&gt;";
						break;
					default: continue;
				}
				i !== r && (n += e.slice(i, r)), i = r + 1, n += t;
			}
			e = i === r ? n : n + e.slice(i, r);
		}
		return e;
	}
	var A = /([A-Z])/g, j = /^ms-/, ie = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function ae(e) {
		return ie.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	var M = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, oe = n.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, se = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, N = oe.d;
	oe.d = {
		f: N.f,
		r: N.r,
		D: ct,
		C: lt,
		L: ut,
		m: dt,
		X: pt,
		S: ft,
		M: mt
	};
	var ce = [], le = null, ue = /(<\/|<)(s)(cript)/gi;
	function de(e, t, n, r) {
		return "" + t + (n === "s" ? "\\u0073" : "\\u0053") + r;
	}
	function fe(e, t, n, r, i) {
		return {
			idPrefix: e === void 0 ? "" : e,
			nextFormID: 0,
			streamingFormat: 0,
			bootstrapScriptContent: n,
			bootstrapScripts: r,
			bootstrapModules: i,
			instructions: 0,
			hasBody: !1,
			hasHtml: !1,
			unknownResources: {},
			dnsResources: {},
			connectResources: {
				default: {},
				anonymous: {},
				credentials: {}
			},
			imageResources: {},
			styleResources: {},
			scriptResources: {},
			moduleUnknownResources: {},
			moduleScriptResources: {}
		};
	}
	function pe(e, t, n, r) {
		return {
			insertionMode: e,
			selectedValue: t,
			tagScope: n,
			viewTransition: r
		};
	}
	function me(e, t, n) {
		var r = e.tagScope & -25;
		switch (t) {
			case "noscript": return pe(2, null, r | 1, null);
			case "select": return pe(2, n.value == null ? n.defaultValue : n.value, r, null);
			case "svg": return pe(4, null, r, null);
			case "picture": return pe(2, null, r | 2, null);
			case "math": return pe(5, null, r, null);
			case "foreignObject": return pe(2, null, r, null);
			case "table": return pe(6, null, r, null);
			case "thead":
			case "tbody":
			case "tfoot": return pe(7, null, r, null);
			case "colgroup": return pe(9, null, r, null);
			case "tr": return pe(8, null, r, null);
			case "head":
				if (2 > e.insertionMode) return pe(3, null, r, null);
				break;
			case "html": if (e.insertionMode === 0) return pe(1, null, r, null);
		}
		return 6 <= e.insertionMode || 2 > e.insertionMode ? pe(2, null, r, null) : e.tagScope === r ? e : pe(e.insertionMode, e.selectedValue, r, null);
	}
	function P(e) {
		return e === null ? null : {
			update: e.update,
			enter: "none",
			exit: "none",
			share: e.update,
			name: e.autoName,
			autoName: e.autoName,
			nameIdx: 0
		};
	}
	function he(e, t) {
		return t.tagScope & 32 && (e.instructions |= 128), pe(t.insertionMode, t.selectedValue, t.tagScope | 12, P(t.viewTransition));
	}
	function ge(e, t) {
		e = P(t.viewTransition);
		var n = t.tagScope | 16;
		return e !== null && e.share !== "none" && (n |= 64), pe(t.insertionMode, t.selectedValue, n, e);
	}
	var _e = /* @__PURE__ */ new Map();
	function ve(e, t) {
		if (typeof t != "object") throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
		var n = !0, r;
		for (r in t) if (C.call(t, r)) {
			var i = t[r];
			if (i != null && typeof i != "boolean" && i !== "") {
				if (r.indexOf("--") === 0) {
					var a = k(r);
					i = k(("" + i).trim());
				} else a = _e.get(r), a === void 0 && (a = k(r.replace(A, "-$1").toLowerCase().replace(j, "-ms-")), _e.set(r, a)), i = typeof i == "number" ? i === 0 || E.has(r) ? "" + i : i + "px" : k(("" + i).trim());
				n ? (n = !1, e.push(" style=\"", a, ":", i)) : e.push(";", a, ":", i);
			}
		}
		n || e.push("\"");
	}
	function ye(e, t, n) {
		n && typeof n != "function" && typeof n != "symbol" && e.push(" ", t, "=\"\"");
	}
	function be(e, t, n) {
		typeof n != "function" && typeof n != "symbol" && typeof n != "boolean" && e.push(" ", t, "=\"", k(n), "\"");
	}
	var xe = k("javascript:throw new Error('React form unexpectedly submitted.')");
	function Se(e, t) {
		this.push("<input type=\"hidden\""), Ce(e), be(this, "name", t), be(this, "value", e), this.push("/>");
	}
	function Ce(e) {
		if (typeof e != "string") throw Error("File/Blob fields are not yet supported in progressive forms. Will fallback to client hydration.");
	}
	function we(e, t) {
		if (typeof t.$$FORM_ACTION == "function") {
			var n = e.nextFormID++;
			e = e.idPrefix + n;
			try {
				var r = t.$$FORM_ACTION(e);
				return r && r.data?.forEach(Ce), r;
			} catch (e) {
				if (typeof e == "object" && e && typeof e.then == "function") throw e;
			}
		}
		return null;
	}
	function Ee(e, t, n, r, i, a, o, s) {
		var c = null;
		if (typeof r == "function") {
			var l = we(t, r);
			l === null ? (e.push(" ", "formAction", "=\"", xe, "\""), o = a = i = r = s = null, ke(t, n)) : (s = l.name, r = l.action || "", i = l.encType, a = l.method, o = l.target, c = l.data);
		}
		return s != null && F(e, "name", s), r != null && F(e, "formAction", r), i != null && F(e, "formEncType", i), a != null && F(e, "formMethod", a), o != null && F(e, "formTarget", o), c;
	}
	function F(e, t, n) {
		switch (t) {
			case "className":
				be(e, "class", n);
				break;
			case "tabIndex":
				be(e, "tabindex", n);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				be(e, t, n);
				break;
			case "style":
				ve(e, n);
				break;
			case "src":
			case "href": if (n === "") break;
			case "action":
			case "formAction":
				if (n == null || typeof n == "function" || typeof n == "symbol" || typeof n == "boolean") break;
				n = ae("" + n), e.push(" ", t, "=\"", k(n), "\"");
				break;
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "ref": break;
			case "autoFocus":
			case "multiple":
			case "muted":
				ye(e, t.toLowerCase(), n);
				break;
			case "xlinkHref":
				if (typeof n == "function" || typeof n == "symbol" || typeof n == "boolean") break;
				n = ae("" + n), e.push(" ", "xlink:href", "=\"", k(n), "\"");
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				typeof n != "function" && typeof n != "symbol" && e.push(" ", t, "=\"", k(n), "\"");
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				n && typeof n != "function" && typeof n != "symbol" && e.push(" ", t, "=\"\"");
				break;
			case "capture":
			case "download":
				!0 === n ? e.push(" ", t, "=\"\"") : !1 !== n && typeof n != "function" && typeof n != "symbol" && e.push(" ", t, "=\"", k(n), "\"");
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				typeof n != "function" && typeof n != "symbol" && !isNaN(n) && 1 <= n && e.push(" ", t, "=\"", k(n), "\"");
				break;
			case "rowSpan":
			case "start":
				typeof n == "function" || typeof n == "symbol" || isNaN(n) || e.push(" ", t, "=\"", k(n), "\"");
				break;
			case "xlinkActuate":
				be(e, "xlink:actuate", n);
				break;
			case "xlinkArcrole":
				be(e, "xlink:arcrole", n);
				break;
			case "xlinkRole":
				be(e, "xlink:role", n);
				break;
			case "xlinkShow":
				be(e, "xlink:show", n);
				break;
			case "xlinkTitle":
				be(e, "xlink:title", n);
				break;
			case "xlinkType":
				be(e, "xlink:type", n);
				break;
			case "xmlBase":
				be(e, "xml:base", n);
				break;
			case "xmlLang":
				be(e, "xml:lang", n);
				break;
			case "xmlSpace":
				be(e, "xml:space", n);
				break;
			default: if ((!(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (t = D.get(t) || t, re(t))) {
				switch (typeof n) {
					case "function":
					case "symbol": return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") return;
				}
				e.push(" ", t, "=\"", k(n), "\"");
			}
		}
	}
	function De(e, t, n) {
		if (t != null) {
			if (n != null) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
			if (typeof t != "object" || !("__html" in t)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information.");
			t = t.__html, t != null && e.push("" + t);
		}
	}
	function Oe(e) {
		var n = "";
		return t.Children.forEach(e, function(e) {
			e != null && (n += e);
		}), n;
	}
	function ke(e, t) {
		if (!(e.instructions & 16)) {
			e.instructions |= 16;
			var n = t.preamble, r = t.bootstrapChunks;
			(n.htmlChunks || n.headChunks) && r.length === 0 ? (r.push(t.startInlineScript), B(r, e), r.push(">", "addEventListener(\"submit\",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute(\"formAction\");null!=f&&(e=f,b=null)}\"javascript:throw new Error('React form unexpectedly submitted.')\"===e&&(a.preventDefault(),b?(a=document.createElement(\"input\"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});", "<\/script>")) : r.unshift(t.startInlineScript, ">", "addEventListener(\"submit\",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute(\"formAction\");null!=f&&(e=f,b=null)}\"javascript:throw new Error('React form unexpectedly submitted.')\"===e&&(a.preventDefault(),b?(a=document.createElement(\"input\"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});", "<\/script>");
		}
	}
	function Ae(e, t) {
		for (var n in e.push(Be("link")), t) if (C.call(t, n)) {
			var r = t[n];
			if (r != null) switch (n) {
				case "children":
				case "dangerouslySetInnerHTML": throw Error("link is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
				default: F(e, n, r);
			}
		}
		return e.push("/>"), null;
	}
	var je = /(<\/|<)(s)(tyle)/gi;
	function Me(e, t, n, r) {
		return "" + t + (n === "s" ? "\\73 " : "\\53 ") + r;
	}
	function Ne(e, t, n) {
		for (var r in e.push(Be(n)), t) if (C.call(t, r)) {
			var i = t[r];
			if (i != null) switch (r) {
				case "children":
				case "dangerouslySetInnerHTML": throw Error(n + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
				default: F(e, r, i);
			}
		}
		return e.push("/>"), null;
	}
	function Pe(e, t) {
		e.push(Be("title"));
		var n = null, r = null, i;
		for (i in t) if (C.call(t, i)) {
			var a = t[i];
			if (a != null) switch (i) {
				case "children":
					n = a;
					break;
				case "dangerouslySetInnerHTML":
					r = a;
					break;
				default: F(e, i, a);
			}
		}
		return e.push(">"), t = Array.isArray(n) ? 2 > n.length ? n[0] : null : n, typeof t != "function" && typeof t != "symbol" && t != null && e.push(k("" + t)), De(e, r, n), e.push(Ue("title")), null;
	}
	function Fe(e, t) {
		e.push(Be("script"));
		var n = null, r = null, i;
		for (i in t) if (C.call(t, i)) {
			var a = t[i];
			if (a != null) switch (i) {
				case "children":
					n = a;
					break;
				case "dangerouslySetInnerHTML":
					r = a;
					break;
				default: F(e, i, a);
			}
		}
		return e.push(">"), De(e, r, n), typeof n == "string" && e.push(("" + n).replace(ue, de)), e.push(Ue("script")), null;
	}
	function Ie(e, t, n) {
		e.push(Be(n));
		var r = n = null, i;
		for (i in t) if (C.call(t, i)) {
			var a = t[i];
			if (a != null) switch (i) {
				case "children":
					n = a;
					break;
				case "dangerouslySetInnerHTML":
					r = a;
					break;
				default: F(e, i, a);
			}
		}
		return e.push(">"), De(e, r, n), n;
	}
	function Le(e, t, n) {
		e.push(Be(n));
		var r = n = null, i;
		for (i in t) if (C.call(t, i)) {
			var a = t[i];
			if (a != null) switch (i) {
				case "children":
					n = a;
					break;
				case "dangerouslySetInnerHTML":
					r = a;
					break;
				default: F(e, i, a);
			}
		}
		return e.push(">"), De(e, r, n), typeof n == "string" ? (e.push(k(n)), null) : n;
	}
	var Re = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, ze = /* @__PURE__ */ new Map();
	function Be(e) {
		var t = ze.get(e);
		if (t === void 0) {
			if (!Re.test(e)) throw Error("Invalid tag: " + e);
			t = "<" + e, ze.set(e, t);
		}
		return t;
	}
	function Ve(e, t, n, r, i, a, o, s, c) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path": break;
			case "a":
				e.push(Be("a"));
				var l = null, u = null, d;
				for (d in n) if (C.call(n, d)) {
					var f = n[d];
					if (f != null) switch (d) {
						case "children":
							l = f;
							break;
						case "dangerouslySetInnerHTML":
							u = f;
							break;
						case "href":
							f === "" ? be(e, "href", "") : F(e, d, f);
							break;
						default: F(e, d, f);
					}
				}
				if (e.push(">"), De(e, u, l), typeof l == "string") {
					e.push(k(l));
					var p = null;
				} else p = l;
				return p;
			case "g":
			case "p":
			case "li": break;
			case "select":
				e.push(Be("select"));
				var m = null, h = null, g;
				for (g in n) if (C.call(n, g)) {
					var _ = n[g];
					if (_ != null) switch (g) {
						case "children":
							m = _;
							break;
						case "dangerouslySetInnerHTML":
							h = _;
							break;
						case "defaultValue":
						case "value": break;
						default: F(e, g, _);
					}
				}
				return e.push(">"), De(e, h, m), m;
			case "option":
				var v = s.selectedValue;
				e.push(Be("option"));
				var ee = null, y = null, te = null, x = null, ne;
				for (ne in n) if (C.call(n, ne)) {
					var w = n[ne];
					if (w != null) switch (ne) {
						case "children":
							ee = w;
							break;
						case "selected":
							te = w;
							break;
						case "dangerouslySetInnerHTML":
							x = w;
							break;
						case "value": y = w;
						default: F(e, ne, w);
					}
				}
				if (v != null) {
					var T = y === null ? Oe(ee) : "" + y;
					if (b(v)) {
						for (var E = 0; E < v.length; E++) if ("" + v[E] === T) {
							e.push(" selected=\"\"");
							break;
						}
					} else "" + v === T && e.push(" selected=\"\"");
				} else te && e.push(" selected=\"\"");
				return e.push(">"), De(e, x, ee), ee;
			case "textarea":
				e.push(Be("textarea"));
				var D = null, O = null, A = null, j;
				for (j in n) if (C.call(n, j)) {
					var ie = n[j];
					if (ie != null) switch (j) {
						case "children":
							A = ie;
							break;
						case "value":
							D = ie;
							break;
						case "defaultValue":
							O = ie;
							break;
						case "dangerouslySetInnerHTML": throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
						default: F(e, j, ie);
					}
				}
				if (D === null && O !== null && (D = O), e.push(">"), A != null) {
					if (D != null) throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
					if (b(A)) {
						if (1 < A.length) throw Error("<textarea> can only have at most one child.");
						D = "" + A[0];
					}
					D = "" + A;
				}
				return typeof D == "string" && D[0] === "\n" && e.push("\n"), D !== null && e.push(k("" + D)), null;
			case "input":
				e.push(Be("input"));
				var M = null, oe = null, se = null, N = null, le = null, ue = null, de = null, fe = null, pe = null, me;
				for (me in n) if (C.call(n, me)) {
					var P = n[me];
					if (P != null) switch (me) {
						case "children":
						case "dangerouslySetInnerHTML": throw Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
						case "name":
							M = P;
							break;
						case "formAction":
							oe = P;
							break;
						case "formEncType":
							se = P;
							break;
						case "formMethod":
							N = P;
							break;
						case "formTarget":
							le = P;
							break;
						case "defaultChecked":
							pe = P;
							break;
						case "defaultValue":
							de = P;
							break;
						case "checked":
							fe = P;
							break;
						case "value":
							ue = P;
							break;
						default: F(e, me, P);
					}
				}
				var he = Ee(e, r, i, oe, se, N, le, M);
				return fe === null ? pe !== null && ye(e, "checked", pe) : ye(e, "checked", fe), ue === null ? de !== null && F(e, "value", de) : F(e, "value", ue), e.push("/>"), he?.forEach(Se, e), null;
			case "button":
				e.push(Be("button"));
				var ge = null, _e = null, Ce = null, Te = null, Re = null, ze = null, Ve = null, He;
				for (He in n) if (C.call(n, He)) {
					var We = n[He];
					if (We != null) switch (He) {
						case "children":
							ge = We;
							break;
						case "dangerouslySetInnerHTML":
							_e = We;
							break;
						case "name":
							Ce = We;
							break;
						case "formAction":
							Te = We;
							break;
						case "formEncType":
							Re = We;
							break;
						case "formMethod":
							ze = We;
							break;
						case "formTarget":
							Ve = We;
							break;
						default: F(e, He, We);
					}
				}
				var Ge = Ee(e, r, i, Te, Re, ze, Ve, Ce);
				if (e.push(">"), Ge?.forEach(Se, e), De(e, _e, ge), typeof ge == "string") {
					e.push(k(ge));
					var Ke = null;
				} else Ke = ge;
				return Ke;
			case "form":
				e.push(Be("form"));
				var qe = null, Je = null, Ye = null, Xe = null, Ze = null, Qe = null, $e;
				for ($e in n) if (C.call(n, $e)) {
					var I = n[$e];
					if (I != null) switch ($e) {
						case "children":
							qe = I;
							break;
						case "dangerouslySetInnerHTML":
							Je = I;
							break;
						case "action":
							Ye = I;
							break;
						case "encType":
							Xe = I;
							break;
						case "method":
							Ze = I;
							break;
						case "target":
							Qe = I;
							break;
						default: F(e, $e, I);
					}
				}
				var et = null, L = null;
				if (typeof Ye == "function") {
					var tt = we(r, Ye);
					tt === null ? (e.push(" ", "action", "=\"", xe, "\""), Qe = Ze = Xe = Ye = null, ke(r, i)) : (Ye = tt.action || "", Xe = tt.encType, Ze = tt.method, Qe = tt.target, et = tt.data, L = tt.name);
				}
				if (Ye != null && F(e, "action", Ye), Xe != null && F(e, "encType", Xe), Ze != null && F(e, "method", Ze), Qe != null && F(e, "target", Qe), e.push(">"), L !== null && (e.push("<input type=\"hidden\""), be(e, "name", L), e.push("/>"), et?.forEach(Se, e)), De(e, Je, qe), typeof qe == "string") {
					e.push(k(qe));
					var R = null;
				} else R = qe;
				return R;
			case "menuitem":
				for (var z in e.push(Be("menuitem")), n) if (C.call(n, z)) {
					var nt = n[z];
					if (nt != null) switch (z) {
						case "children":
						case "dangerouslySetInnerHTML": throw Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
						default: F(e, z, nt);
					}
				}
				return e.push(">"), null;
			case "object":
				e.push(Be("object"));
				var rt = null, it = null, at;
				for (at in n) if (C.call(n, at)) {
					var B = n[at];
					if (B != null) switch (at) {
						case "children":
							rt = B;
							break;
						case "dangerouslySetInnerHTML":
							it = B;
							break;
						case "data":
							var ot = ae("" + B);
							if (ot === "") break;
							e.push(" ", "data", "=\"", k(ot), "\"");
							break;
						default: F(e, at, B);
					}
				}
				if (e.push(">"), De(e, it, rt), typeof rt == "string") {
					e.push(k(rt));
					var V = null;
				} else V = rt;
				return V;
			case "title":
				var st = s.tagScope & 1, ct = s.tagScope & 4;
				if (s.insertionMode === 4 || st || n.itemProp != null) var lt = Pe(e, n);
				else ct ? lt = null : (Pe(i.hoistableChunks, n), lt = void 0);
				return lt;
			case "link":
				var ut = s.tagScope & 1, dt = s.tagScope & 4, ft = n.rel, pt = n.href, mt = n.precedence;
				if (s.insertionMode === 4 || ut || n.itemProp != null || typeof ft != "string" || typeof pt != "string" || pt === "") {
					Ae(e, n);
					var H = null;
				} else if (n.rel === "stylesheet") if (typeof mt != "string" || n.disabled != null || n.onLoad || n.onError) H = Ae(e, n);
				else {
					var _t = i.styles.get(mt), vt = r.styleResources.hasOwnProperty(pt) ? r.styleResources[pt] : void 0;
					if (vt !== null) {
						r.styleResources[pt] = null, _t || (_t = {
							precedence: k(mt),
							rules: [],
							hrefs: [],
							sheets: /* @__PURE__ */ new Map()
						}, i.styles.set(mt, _t));
						var yt = {
							state: 0,
							props: S({}, n, {
								"data-precedence": n.precedence,
								precedence: null
							})
						};
						if (vt) {
							vt.length === 2 && ht(yt.props, vt);
							var bt = i.preloads.stylesheets.get(pt);
							bt && 0 < bt.length ? bt.length = 0 : yt.state = 1;
						}
						_t.sheets.set(pt, yt), o && o.stylesheets.add(yt);
					} else if (_t) {
						var xt = _t.sheets.get(pt);
						xt && o && o.stylesheets.add(xt);
					}
					c && e.push("<!-- -->"), H = null;
				}
				else n.onLoad || n.onError ? H = Ae(e, n) : (c && e.push("<!-- -->"), H = dt ? null : Ae(i.hoistableChunks, n));
				return H;
			case "script":
				var St = s.tagScope & 1, Ct = n.async;
				if (typeof n.src != "string" || !n.src || !Ct || typeof Ct == "function" || typeof Ct == "symbol" || n.onLoad || n.onError || s.insertionMode === 4 || St || n.itemProp != null) var wt = Fe(e, n);
				else {
					var Tt = n.src;
					if (n.type === "module") var Et = r.moduleScriptResources, Dt = i.preloads.moduleScripts;
					else Et = r.scriptResources, Dt = i.preloads.scripts;
					var Ot = Et.hasOwnProperty(Tt) ? Et[Tt] : void 0;
					if (Ot !== null) {
						Et[Tt] = null;
						var kt = n;
						if (Ot) {
							Ot.length === 2 && (kt = S({}, n), ht(kt, Ot));
							var At = Dt.get(Tt);
							At && (At.length = 0);
						}
						var jt = [];
						i.scripts.add(jt), Fe(jt, kt);
					}
					c && e.push("<!-- -->"), wt = null;
				}
				return wt;
			case "style":
				var Mt = s.tagScope & 1, Nt = n.precedence, Pt = n.href, Ft = n.nonce;
				if (s.insertionMode === 4 || Mt || n.itemProp != null || typeof Nt != "string" || typeof Pt != "string" || Pt === "") {
					e.push(Be("style"));
					var It = null, Lt = null, Rt;
					for (Rt in n) if (C.call(n, Rt)) {
						var zt = n[Rt];
						if (zt != null) switch (Rt) {
							case "children":
								It = zt;
								break;
							case "dangerouslySetInnerHTML":
								Lt = zt;
								break;
							default: F(e, Rt, zt);
						}
					}
					e.push(">");
					var Bt = Array.isArray(It) ? 2 > It.length ? It[0] : null : It;
					typeof Bt != "function" && typeof Bt != "symbol" && Bt != null && e.push(("" + Bt).replace(je, Me)), De(e, Lt, It), e.push(Ue("style"));
					var U = null;
				} else {
					var Vt = i.styles.get(Nt);
					if ((r.styleResources.hasOwnProperty(Pt) ? r.styleResources[Pt] : void 0) !== null) {
						r.styleResources[Pt] = null, Vt || (Vt = {
							precedence: k(Nt),
							rules: [],
							hrefs: [],
							sheets: /* @__PURE__ */ new Map()
						}, i.styles.set(Nt, Vt));
						var Ht = i.nonce.style;
						if (!Ht || Ht === Ft) {
							Vt.hrefs.push(k(Pt));
							var Ut = Vt.rules, Wt = null, Gt = null, Kt;
							for (Kt in n) if (C.call(n, Kt)) {
								var qt = n[Kt];
								if (qt != null) switch (Kt) {
									case "children":
										Wt = qt;
										break;
									case "dangerouslySetInnerHTML": Gt = qt;
								}
							}
							var Jt = Array.isArray(Wt) ? 2 > Wt.length ? Wt[0] : null : Wt;
							typeof Jt != "function" && typeof Jt != "symbol" && Jt != null && Ut.push(("" + Jt).replace(je, Me)), De(Ut, Gt, Wt);
						}
					}
					Vt && o && o.styles.add(Vt), c && e.push("<!-- -->"), U = void 0;
				}
				return U;
			case "meta":
				var Yt = s.tagScope & 1, Xt = s.tagScope & 4;
				if (s.insertionMode === 4 || Yt || n.itemProp != null) var Zt = Ne(e, n, "meta");
				else c && e.push("<!-- -->"), Zt = Xt ? null : typeof n.charSet == "string" ? Ne(i.charsetChunks, n, "meta") : n.name === "viewport" ? Ne(i.viewportChunks, n, "meta") : Ne(i.hoistableChunks, n, "meta");
				return Zt;
			case "listing":
			case "pre":
				e.push(Be(t));
				var Qt = null, $t = null, en;
				for (en in n) if (C.call(n, en)) {
					var W = n[en];
					if (W != null) switch (en) {
						case "children":
							Qt = W;
							break;
						case "dangerouslySetInnerHTML":
							$t = W;
							break;
						default: F(e, en, W);
					}
				}
				if (e.push(">"), $t != null) {
					if (Qt != null) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
					if (typeof $t != "object" || !("__html" in $t)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information.");
					var tn = $t.__html;
					tn != null && (typeof tn == "string" && 0 < tn.length && tn[0] === "\n" ? e.push("\n", tn) : e.push("" + tn));
				}
				return typeof Qt == "string" && Qt[0] === "\n" && e.push("\n"), Qt;
			case "img":
				var nn = s.tagScope & 3, rn = n.src, an = n.srcSet;
				if (!(n.loading === "lazy" || !rn && !an || typeof rn != "string" && rn != null || typeof an != "string" && an != null || n.fetchPriority === "low" || nn) && (typeof rn != "string" || rn[4] !== ":" || rn[0] !== "d" && rn[0] !== "D" || rn[1] !== "a" && rn[1] !== "A" || rn[2] !== "t" && rn[2] !== "T" || rn[3] !== "a" && rn[3] !== "A") && (typeof an != "string" || an[4] !== ":" || an[0] !== "d" && an[0] !== "D" || an[1] !== "a" && an[1] !== "A" || an[2] !== "t" && an[2] !== "T" || an[3] !== "a" && an[3] !== "A")) {
					o !== null && s.tagScope & 64 && (o.suspenseyImages = !0);
					var on = typeof n.sizes == "string" ? n.sizes : void 0, sn = an ? an + "\n" + (on || "") : rn, cn = i.preloads.images, ln = cn.get(sn);
					if (ln) (n.fetchPriority === "high" || 10 > i.highImagePreloads.size) && (cn.delete(sn), i.highImagePreloads.add(ln));
					else if (!r.imageResources.hasOwnProperty(sn)) {
						r.imageResources[sn] = ce;
						var G = n.crossOrigin, un = typeof G == "string" ? G === "use-credentials" ? G : "" : void 0, dn = i.headers, fn;
						dn && 0 < dn.remainingCapacity && typeof n.srcSet != "string" && (n.fetchPriority === "high" || 500 > dn.highImagePreloads.length) && (fn = gt(rn, "image", {
							imageSrcSet: n.srcSet,
							imageSizes: n.sizes,
							crossOrigin: un,
							integrity: n.integrity,
							nonce: n.nonce,
							type: n.type,
							fetchPriority: n.fetchPriority,
							referrerPolicy: n.refererPolicy
						}), 0 <= (dn.remainingCapacity -= fn.length + 2)) ? (i.resets.image[sn] = ce, dn.highImagePreloads && (dn.highImagePreloads += ", "), dn.highImagePreloads += fn) : (ln = [], Ae(ln, {
							rel: "preload",
							as: "image",
							href: an ? void 0 : rn,
							imageSrcSet: an,
							imageSizes: on,
							crossOrigin: un,
							integrity: n.integrity,
							type: n.type,
							fetchPriority: n.fetchPriority,
							referrerPolicy: n.referrerPolicy
						}), n.fetchPriority === "high" || 10 > i.highImagePreloads.size ? i.highImagePreloads.add(ln) : (i.bulkPreloads.add(ln), cn.set(sn, ln)));
					}
				}
				return Ne(e, n, "img");
			case "base":
			case "area":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "param":
			case "source":
			case "track":
			case "wbr": return Ne(e, n, t);
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": break;
			case "head":
				if (2 > s.insertionMode) {
					var pn = a || i.preamble;
					if (pn.headChunks) throw Error("The `<head>` tag may only be rendered once.");
					a !== null && e.push("<!--head-->"), pn.headChunks = [];
					var mn = Ie(pn.headChunks, n, "head");
				} else mn = Le(e, n, "head");
				return mn;
			case "body":
				if (2 > s.insertionMode) {
					var hn = a || i.preamble;
					if (hn.bodyChunks) throw Error("The `<body>` tag may only be rendered once.");
					a !== null && e.push("<!--body-->"), hn.bodyChunks = [];
					var gn = Ie(hn.bodyChunks, n, "body");
				} else gn = Le(e, n, "body");
				return gn;
			case "html":
				if (s.insertionMode === 0) {
					var _n = a || i.preamble;
					if (_n.htmlChunks) throw Error("The `<html>` tag may only be rendered once.");
					a !== null && e.push("<!--html-->"), _n.htmlChunks = [""];
					var vn = Ie(_n.htmlChunks, n, "html");
				} else vn = Le(e, n, "html");
				return vn;
			default: if (t.indexOf("-") !== -1) {
				e.push(Be(t));
				var yn = null, bn = null, xn;
				for (xn in n) if (C.call(n, xn)) {
					var Sn = n[xn];
					if (Sn != null) {
						var Cn = xn;
						switch (xn) {
							case "children":
								yn = Sn;
								break;
							case "dangerouslySetInnerHTML":
								bn = Sn;
								break;
							case "style":
								ve(e, Sn);
								break;
							case "suppressContentEditableWarning":
							case "suppressHydrationWarning":
							case "ref": break;
							case "className": Cn = "class";
							default: if (re(xn) && typeof Sn != "function" && typeof Sn != "symbol" && !1 !== Sn) {
								if (!0 === Sn) Sn = "";
								else if (typeof Sn == "object") continue;
								e.push(" ", Cn, "=\"", k(Sn), "\"");
							}
						}
					}
				}
				return e.push(">"), De(e, bn, yn), yn;
			}
		}
		return Le(e, n, t);
	}
	var He = /* @__PURE__ */ new Map();
	function Ue(e) {
		var t = He.get(e);
		return t === void 0 && (t = "</" + e + ">", He.set(e, t)), t;
	}
	function We(e, t) {
		e = e.preamble, e.htmlChunks === null && t.htmlChunks && (e.htmlChunks = t.htmlChunks), e.headChunks === null && t.headChunks && (e.headChunks = t.headChunks), e.bodyChunks === null && t.bodyChunks && (e.bodyChunks = t.bodyChunks);
	}
	function Ge(e, t) {
		t = t.bootstrapChunks;
		for (var n = 0; n < t.length - 1; n++) e.push(t[n]);
		return n < t.length ? (n = t[n], t.length = 0, e.push(n)) : !0;
	}
	function Ke(e, t, n) {
		if (e.push("<!--$?--><template id=\""), n === null) throw Error("An ID must have been assigned before we can complete the boundary.");
		return e.push(t.boundaryPrefix), t = n.toString(16), e.push(t), e.push("\"></template>");
	}
	function qe(e, t, n, r) {
		switch (n.insertionMode) {
			case 0:
			case 1:
			case 3:
			case 2: return e.push("<div hidden id=\""), e.push(t.segmentPrefix), t = r.toString(16), e.push(t), e.push("\">");
			case 4: return e.push("<svg aria-hidden=\"true\" style=\"display:none\" id=\""), e.push(t.segmentPrefix), t = r.toString(16), e.push(t), e.push("\">");
			case 5: return e.push("<math aria-hidden=\"true\" style=\"display:none\" id=\""), e.push(t.segmentPrefix), t = r.toString(16), e.push(t), e.push("\">");
			case 6: return e.push("<table hidden id=\""), e.push(t.segmentPrefix), t = r.toString(16), e.push(t), e.push("\">");
			case 7: return e.push("<table hidden><tbody id=\""), e.push(t.segmentPrefix), t = r.toString(16), e.push(t), e.push("\">");
			case 8: return e.push("<table hidden><tr id=\""), e.push(t.segmentPrefix), t = r.toString(16), e.push(t), e.push("\">");
			case 9: return e.push("<table hidden><colgroup id=\""), e.push(t.segmentPrefix), t = r.toString(16), e.push(t), e.push("\">");
			default: throw Error("Unknown insertion mode. This is a bug in React.");
		}
	}
	function Je(e, t) {
		switch (t.insertionMode) {
			case 0:
			case 1:
			case 3:
			case 2: return e.push("</div>");
			case 4: return e.push("</svg>");
			case 5: return e.push("</math>");
			case 6: return e.push("</table>");
			case 7: return e.push("</tbody></table>");
			case 8: return e.push("</tr></table>");
			case 9: return e.push("</colgroup></table>");
			default: throw Error("Unknown insertion mode. This is a bug in React.");
		}
	}
	var Ye = /[<\u2028\u2029]/g;
	function Xe(e) {
		return JSON.stringify(e).replace(Ye, function(e) {
			switch (e) {
				case "<": return "\\u003c";
				case "\u2028": return "\\u2028";
				case "\u2029": return "\\u2029";
				default: throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
			}
		});
	}
	var Ze = /[&><\u2028\u2029]/g;
	function Qe(e) {
		return JSON.stringify(e).replace(Ze, function(e) {
			switch (e) {
				case "&": return "\\u0026";
				case ">": return "\\u003e";
				case "<": return "\\u003c";
				case "\u2028": return "\\u2028";
				case "\u2029": return "\\u2029";
				default: throw Error("escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
			}
		});
	}
	var $e = !1, I = !0;
	function et(e) {
		var t = e.rules, n = e.hrefs, r = 0;
		if (n.length) {
			for (this.push(le.startInlineStyle), this.push(" media=\"not all\" data-precedence=\""), this.push(e.precedence), this.push("\" data-href=\""); r < n.length - 1; r++) this.push(n[r]), this.push(" ");
			for (this.push(n[r]), this.push("\">"), r = 0; r < t.length; r++) this.push(t[r]);
			I = this.push("</style>"), $e = !0, t.length = 0, n.length = 0;
		}
	}
	function L(e) {
		return e.state === 2 ? !1 : $e = !0;
	}
	function tt(e, t, n) {
		return $e = !1, I = !0, le = n, t.styles.forEach(et, e), le = null, t.stylesheets.forEach(L), $e && (n.stylesToHoist = !0), I;
	}
	function R(e) {
		for (var t = 0; t < e.length; t++) this.push(e[t]);
		e.length = 0;
	}
	var z = [];
	function nt(e) {
		Ae(z, e.props);
		for (var t = 0; t < z.length; t++) this.push(z[t]);
		z.length = 0, e.state = 2;
	}
	function rt(e) {
		var t = 0 < e.sheets.size;
		e.sheets.forEach(nt, this), e.sheets.clear();
		var n = e.rules, r = e.hrefs;
		if (!t || r.length) {
			if (this.push(le.startInlineStyle), this.push(" data-precedence=\""), this.push(e.precedence), e = 0, r.length) {
				for (this.push("\" data-href=\""); e < r.length - 1; e++) this.push(r[e]), this.push(" ");
				this.push(r[e]);
			}
			for (this.push("\">"), e = 0; e < n.length; e++) this.push(n[e]);
			this.push("</style>"), n.length = 0, r.length = 0;
		}
	}
	function it(e) {
		if (e.state === 0) {
			e.state = 1;
			var t = e.props;
			for (Ae(z, {
				rel: "preload",
				as: "style",
				href: e.props.href,
				crossOrigin: t.crossOrigin,
				fetchPriority: t.fetchPriority,
				integrity: t.integrity,
				media: t.media,
				hrefLang: t.hrefLang,
				referrerPolicy: t.referrerPolicy
			}), e = 0; e < z.length; e++) this.push(z[e]);
			z.length = 0;
		}
	}
	function at(e) {
		e.sheets.forEach(it, this), e.sheets.clear();
	}
	function B(e, t) {
		!(t.instructions & 32) && (t.instructions |= 32, e.push(" id=\"", k("_" + t.idPrefix + "R_"), "\""));
	}
	function ot(e, t) {
		e.push("[");
		var n = "[";
		t.stylesheets.forEach(function(t) {
			if (t.state !== 2) if (t.state === 3) e.push(n), t = Qe("" + t.props.href), e.push(t), e.push("]"), n = ",[";
			else {
				e.push(n);
				var r = t.props["data-precedence"], i = t.props, a = ae("" + t.props.href);
				for (var o in a = Qe(a), e.push(a), r = "" + r, e.push(","), r = Qe(r), e.push(r), i) if (C.call(i, o) && (r = i[o], r != null)) switch (o) {
					case "href":
					case "rel":
					case "precedence":
					case "data-precedence": break;
					case "children":
					case "dangerouslySetInnerHTML": throw Error("link is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
					default: V(e, o, r);
				}
				e.push("]"), n = ",[", t.state = 3;
			}
		}), e.push("]");
	}
	function V(e, t, n) {
		var r = t.toLowerCase();
		switch (typeof n) {
			case "function":
			case "symbol": return;
		}
		switch (t) {
			case "innerHTML":
			case "dangerouslySetInnerHTML":
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "style":
			case "ref": return;
			case "className":
				r = "class", t = "" + n;
				break;
			case "hidden":
				if (!1 === n) return;
				t = "";
				break;
			case "src":
			case "href":
				n = ae(n), t = "" + n;
				break;
			default:
				if (2 < t.length && (t[0] === "o" || t[0] === "O") && (t[1] === "n" || t[1] === "N") || !re(t)) return;
				t = "" + n;
		}
		e.push(","), r = Qe(r), e.push(r), e.push(","), r = Qe(t), e.push(r);
	}
	function st() {
		return {
			styles: /* @__PURE__ */ new Set(),
			stylesheets: /* @__PURE__ */ new Set(),
			suspenseyImages: !1
		};
	}
	function ct(e) {
		var t = Ln || null;
		if (t) {
			var n = t.resumableState, r = t.renderState;
			if (typeof e == "string" && e) {
				if (!n.dnsResources.hasOwnProperty(e)) {
					n.dnsResources[e] = null, n = r.headers;
					var i, a;
					(a = n && 0 < n.remainingCapacity) && (a = (i = "<" + ("" + e).replace(H, _t) + ">; rel=dns-prefetch", 0 <= (n.remainingCapacity -= i.length + 2))), a ? (r.resets.dns[e] = null, n.preconnects && (n.preconnects += ", "), n.preconnects += i) : (i = [], Ae(i, {
						href: e,
						rel: "dns-prefetch"
					}), r.preconnects.add(i));
				}
				Mr(t);
			}
		} else N.D(e);
	}
	function lt(e, t) {
		var n = Ln || null;
		if (n) {
			var r = n.resumableState, i = n.renderState;
			if (typeof e == "string" && e) {
				var a = t === "use-credentials" ? "credentials" : typeof t == "string" ? "anonymous" : "default";
				if (!r.connectResources[a].hasOwnProperty(e)) {
					r.connectResources[a][e] = null, r = i.headers;
					var o, s;
					if (s = r && 0 < r.remainingCapacity) {
						if (s = "<" + ("" + e).replace(H, _t) + ">; rel=preconnect", typeof t == "string") {
							var c = ("" + t).replace(vt, yt);
							s += "; crossorigin=\"" + c + "\"";
						}
						s = (o = s, 0 <= (r.remainingCapacity -= o.length + 2));
					}
					s ? (i.resets.connect[a][e] = null, r.preconnects && (r.preconnects += ", "), r.preconnects += o) : (a = [], Ae(a, {
						rel: "preconnect",
						href: e,
						crossOrigin: t
					}), i.preconnects.add(a));
				}
				Mr(n);
			}
		} else N.C(e, t);
	}
	function ut(e, t, n) {
		var r = Ln || null;
		if (r) {
			var i = r.resumableState, a = r.renderState;
			if (t && e) {
				switch (t) {
					case "image":
						if (n) var o = n.imageSrcSet, s = n.imageSizes, c = n.fetchPriority;
						var l = o ? o + "\n" + (s || "") : e;
						if (i.imageResources.hasOwnProperty(l)) return;
						i.imageResources[l] = ce, i = a.headers;
						var u;
						i && 0 < i.remainingCapacity && typeof o != "string" && c === "high" && (u = gt(e, t, n), 0 <= (i.remainingCapacity -= u.length + 2)) ? (a.resets.image[l] = ce, i.highImagePreloads && (i.highImagePreloads += ", "), i.highImagePreloads += u) : (i = [], Ae(i, S({
							rel: "preload",
							href: o ? void 0 : e,
							as: t
						}, n)), c === "high" ? a.highImagePreloads.add(i) : (a.bulkPreloads.add(i), a.preloads.images.set(l, i)));
						break;
					case "style":
						if (i.styleResources.hasOwnProperty(e)) return;
						o = [], Ae(o, S({
							rel: "preload",
							href: e,
							as: t
						}, n)), i.styleResources[e] = !n || typeof n.crossOrigin != "string" && typeof n.integrity != "string" ? ce : [n.crossOrigin, n.integrity], a.preloads.stylesheets.set(e, o), a.bulkPreloads.add(o);
						break;
					case "script":
						if (i.scriptResources.hasOwnProperty(e)) return;
						o = [], a.preloads.scripts.set(e, o), a.bulkPreloads.add(o), Ae(o, S({
							rel: "preload",
							href: e,
							as: t
						}, n)), i.scriptResources[e] = !n || typeof n.crossOrigin != "string" && typeof n.integrity != "string" ? ce : [n.crossOrigin, n.integrity];
						break;
					default:
						if (i.unknownResources.hasOwnProperty(t)) {
							if (o = i.unknownResources[t], o.hasOwnProperty(e)) return;
						} else o = {}, i.unknownResources[t] = o;
						if (o[e] = ce, (i = a.headers) && 0 < i.remainingCapacity && t === "font" && (l = gt(e, t, n), 0 <= (i.remainingCapacity -= l.length + 2))) a.resets.font[e] = ce, i.fontPreloads && (i.fontPreloads += ", "), i.fontPreloads += l;
						else switch (i = [], e = S({
							rel: "preload",
							href: e,
							as: t
						}, n), Ae(i, e), t) {
							case "font":
								a.fontPreloads.add(i);
								break;
							default: a.bulkPreloads.add(i);
						}
				}
				Mr(r);
			}
		} else N.L(e, t, n);
	}
	function dt(e, t) {
		var n = Ln || null;
		if (n) {
			var r = n.resumableState, i = n.renderState;
			if (e) {
				var a = t && typeof t.as == "string" ? t.as : "script";
				switch (a) {
					case "script":
						if (r.moduleScriptResources.hasOwnProperty(e)) return;
						a = [], r.moduleScriptResources[e] = !t || typeof t.crossOrigin != "string" && typeof t.integrity != "string" ? ce : [t.crossOrigin, t.integrity], i.preloads.moduleScripts.set(e, a);
						break;
					default:
						if (r.moduleUnknownResources.hasOwnProperty(a)) {
							var o = r.unknownResources[a];
							if (o.hasOwnProperty(e)) return;
						} else o = {}, r.moduleUnknownResources[a] = o;
						a = [], o[e] = ce;
				}
				Ae(a, S({
					rel: "modulepreload",
					href: e
				}, t)), i.bulkPreloads.add(a), Mr(n);
			}
		} else N.m(e, t);
	}
	function ft(e, t, n) {
		var r = Ln || null;
		if (r) {
			var i = r.resumableState, a = r.renderState;
			if (e) {
				t ||= "default";
				var o = a.styles.get(t), s = i.styleResources.hasOwnProperty(e) ? i.styleResources[e] : void 0;
				s !== null && (i.styleResources[e] = null, o || (o = {
					precedence: k(t),
					rules: [],
					hrefs: [],
					sheets: /* @__PURE__ */ new Map()
				}, a.styles.set(t, o)), t = {
					state: 0,
					props: S({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n)
				}, s && (s.length === 2 && ht(t.props, s), (a = a.preloads.stylesheets.get(e)) && 0 < a.length ? a.length = 0 : t.state = 1), o.sheets.set(e, t), Mr(r));
			}
		} else N.S(e, t, n);
	}
	function pt(e, t) {
		var n = Ln || null;
		if (n) {
			var r = n.resumableState, i = n.renderState;
			if (e) {
				var a = r.scriptResources.hasOwnProperty(e) ? r.scriptResources[e] : void 0;
				a !== null && (r.scriptResources[e] = null, t = S({
					src: e,
					async: !0
				}, t), a && (a.length === 2 && ht(t, a), e = i.preloads.scripts.get(e)) && (e.length = 0), e = [], i.scripts.add(e), Fe(e, t), Mr(n));
			}
		} else N.X(e, t);
	}
	function mt(e, t) {
		var n = Ln || null;
		if (n) {
			var r = n.resumableState, i = n.renderState;
			if (e) {
				var a = r.moduleScriptResources.hasOwnProperty(e) ? r.moduleScriptResources[e] : void 0;
				a !== null && (r.moduleScriptResources[e] = null, t = S({
					src: e,
					type: "module",
					async: !0
				}, t), a && (a.length === 2 && ht(t, a), e = i.preloads.moduleScripts.get(e)) && (e.length = 0), e = [], i.scripts.add(e), Fe(e, t), Mr(n));
			}
		} else N.M(e, t);
	}
	function ht(e, t) {
		e.crossOrigin ??= t[0], e.integrity ??= t[1];
	}
	function gt(e, t, n) {
		for (var r in e = ("" + e).replace(H, _t), t = ("" + t).replace(vt, yt), t = "<" + e + ">; rel=preload; as=\"" + t + "\"", n) C.call(n, r) && (e = n[r], typeof e == "string" && (t += "; " + r.toLowerCase() + "=\"" + ("" + e).replace(vt, yt) + "\""));
		return t;
	}
	var H = /[<>\r\n]/g;
	function _t(e) {
		switch (e) {
			case "<": return "%3C";
			case ">": return "%3E";
			case "\n": return "%0A";
			case "\r": return "%0D";
			default: throw Error("escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
		}
	}
	var vt = /["';,\r\n]/g;
	function yt(e) {
		switch (e) {
			case "\"": return "%22";
			case "'": return "%27";
			case ";": return "%3B";
			case ",": return "%2C";
			case "\n": return "%0A";
			case "\r": return "%0D";
			default: throw Error("escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
		}
	}
	function bt(e) {
		this.styles.add(e);
	}
	function xt(e) {
		this.stylesheets.add(e);
	}
	function St(e, t) {
		t.styles.forEach(bt, e), t.stylesheets.forEach(xt, e), t.suspenseyImages && (e.suspenseyImages = !0);
	}
	function Ct(e, t) {
		var n = e.idPrefix, r = [], i = e.bootstrapScriptContent, a = e.bootstrapScripts, o = e.bootstrapModules;
		i !== void 0 && (r.push("<script"), B(r, e), r.push(">", ("" + i).replace(ue, de), "<\/script>")), i = n + "P:";
		var s = n + "S:";
		n += "B:";
		var c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), p = /* @__PURE__ */ new Set(), m = /* @__PURE__ */ new Set(), h = {
			images: /* @__PURE__ */ new Map(),
			stylesheets: /* @__PURE__ */ new Map(),
			scripts: /* @__PURE__ */ new Map(),
			moduleScripts: /* @__PURE__ */ new Map()
		};
		if (a !== void 0) for (var g = 0; g < a.length; g++) {
			var _ = a[g], v, ee = void 0, y = void 0, te = {
				rel: "preload",
				as: "script",
				fetchPriority: "low",
				nonce: void 0
			};
			typeof _ == "string" ? te.href = v = _ : (te.href = v = _.src, te.integrity = y = typeof _.integrity == "string" ? _.integrity : void 0, te.crossOrigin = ee = typeof _ == "string" || _.crossOrigin == null ? void 0 : _.crossOrigin === "use-credentials" ? "use-credentials" : ""), _ = e;
			var b = v;
			_.scriptResources[b] = null, _.moduleScriptResources[b] = null, _ = [], Ae(_, te), f.add(_), r.push("<script src=\"", k(v), "\""), typeof y == "string" && r.push(" integrity=\"", k(y), "\""), typeof ee == "string" && r.push(" crossorigin=\"", k(ee), "\""), B(r, e), r.push(" async=\"\"><\/script>");
		}
		if (o !== void 0) for (a = 0; a < o.length; a++) te = o[a], ee = v = void 0, y = {
			rel: "modulepreload",
			fetchPriority: "low",
			nonce: void 0
		}, typeof te == "string" ? y.href = g = te : (y.href = g = te.src, y.integrity = ee = typeof te.integrity == "string" ? te.integrity : void 0, y.crossOrigin = v = typeof te == "string" || te.crossOrigin == null ? void 0 : te.crossOrigin === "use-credentials" ? "use-credentials" : ""), te = e, _ = g, te.scriptResources[_] = null, te.moduleScriptResources[_] = null, te = [], Ae(te, y), f.add(te), r.push("<script type=\"module\" src=\"", k(g), "\""), typeof ee == "string" && r.push(" integrity=\"", k(ee), "\""), typeof v == "string" && r.push(" crossorigin=\"", k(v), "\""), B(r, e), r.push(" async=\"\"><\/script>");
		return {
			placeholderPrefix: i,
			segmentPrefix: s,
			boundaryPrefix: n,
			startInlineScript: "<script",
			startInlineStyle: "<style",
			preamble: {
				htmlChunks: null,
				headChunks: null,
				bodyChunks: null
			},
			externalRuntimeScript: null,
			bootstrapChunks: r,
			importMapChunks: [],
			onHeaders: void 0,
			headers: null,
			resets: {
				font: {},
				dns: {},
				connect: {
					default: {},
					anonymous: {},
					credentials: {}
				},
				image: {},
				style: {}
			},
			charsetChunks: [],
			viewportChunks: [],
			hoistableChunks: [],
			preconnects: c,
			fontPreloads: l,
			highImagePreloads: u,
			styles: d,
			bootstrapScripts: f,
			scripts: p,
			bulkPreloads: m,
			preloads: h,
			nonce: {
				script: void 0,
				style: void 0
			},
			stylesToHoist: !1,
			generateStaticMarkup: t
		};
	}
	function wt(e, t, n, r) {
		return n.generateStaticMarkup ? (e.push(k(t)), !1) : (t === "" ? e = r : (r && e.push("<!-- -->"), e.push(k(t)), e = !0), e);
	}
	function Tt(e, t, n, r) {
		t.generateStaticMarkup || n && r && e.push("<!-- -->");
	}
	var Et = Function.prototype.bind, Dt = Symbol.for("react.client.reference");
	function Ot(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === Dt ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case a: return "Fragment";
			case s: return "Profiler";
			case o: return "StrictMode";
			case d: return "Suspense";
			case f: return "SuspenseList";
			case g: return "Activity";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case i: return "Portal";
			case l: return e.displayName || "Context";
			case c: return (e._context.displayName || "Context") + ".Consumer";
			case u:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case p: return t = e.displayName || null, t === null ? Ot(e.type) || "Memo" : t;
			case m:
				t = e._payload, e = e._init;
				try {
					return Ot(e(t));
				} catch {}
		}
		return null;
	}
	var kt = {}, At = null;
	function jt(e, t) {
		if (e !== t) {
			e.context._currentValue2 = e.parentValue, e = e.parent;
			var n = t.parent;
			if (e === null) {
				if (n !== null) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
			} else {
				if (n === null) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
				jt(e, n);
			}
			t.context._currentValue2 = t.value;
		}
	}
	function Mt(e) {
		e.context._currentValue2 = e.parentValue, e = e.parent, e !== null && Mt(e);
	}
	function Nt(e) {
		var t = e.parent;
		t !== null && Nt(t), e.context._currentValue2 = e.value;
	}
	function Pt(e, t) {
		if (e.context._currentValue2 = e.parentValue, e = e.parent, e === null) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
		e.depth === t.depth ? jt(e, t) : Pt(e, t);
	}
	function Ft(e, t) {
		var n = t.parent;
		if (n === null) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
		e.depth === n.depth ? jt(e, n) : Ft(e, n), t.context._currentValue2 = t.value;
	}
	function It(e) {
		var t = At;
		t !== e && (t === null ? Nt(e) : e === null ? Mt(t) : t.depth === e.depth ? jt(t, e) : t.depth > e.depth ? Pt(t, e) : Ft(t, e), At = e);
	}
	var Lt = {
		enqueueSetState: function(e, t) {
			e = e._reactInternals, e.queue !== null && e.queue.push(t);
		},
		enqueueReplaceState: function(e, t) {
			e = e._reactInternals, e.replace = !0, e.queue = [t];
		},
		enqueueForceUpdate: function() {}
	}, Rt = {
		id: 1,
		overflow: ""
	};
	function zt(e, t, n) {
		var r = e.id;
		e = e.overflow;
		var i = 32 - Bt(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Bt(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			return a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, {
				id: 1 << 32 - Bt(t) + i | n << i | r,
				overflow: a + e
			};
		}
		return {
			id: 1 << a | n << i | r,
			overflow: e
		};
	}
	var Bt = Math.clz32 ? Math.clz32 : Ht, U = Math.log, Vt = Math.LN2;
	function Ht(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (U(e) / Vt | 0) | 0;
	}
	function Ut() {}
	var Wt = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`.");
	function Gt(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Ut, Ut), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw t.reason;
			default:
				switch (typeof t.status == "string" ? t.then(Ut, Ut) : (e = t, e.status = "pending", e.then(function(e) {
					if (t.status === "pending") {
						var n = t;
						n.status = "fulfilled", n.value = e;
					}
				}, function(e) {
					if (t.status === "pending") {
						var n = t;
						n.status = "rejected", n.reason = e;
					}
				})), t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw t.reason;
				}
				throw Kt = t, Wt;
		}
	}
	var Kt = null;
	function qt() {
		if (Kt === null) throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
		var e = Kt;
		return Kt = null, e;
	}
	function Jt(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Yt = typeof Object.is == "function" ? Object.is : Jt, Xt = null, Zt = null, Qt = null, $t = null, en = null, W = null, tn = !1, nn = !1, rn = 0, an = 0, on = -1, sn = 0, cn = null, ln = null, G = 0;
	function un() {
		if (Xt === null) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.");
		return Xt;
	}
	function dn() {
		if (0 < G) throw Error("Rendered more hooks than during the previous render");
		return {
			memoizedState: null,
			queue: null,
			next: null
		};
	}
	function fn() {
		return W === null ? en === null ? (tn = !1, en = W = dn()) : (tn = !0, W = en) : W.next === null ? (tn = !1, W = W.next = dn()) : (tn = !0, W = W.next), W;
	}
	function pn() {
		var e = cn;
		return cn = null, e;
	}
	function mn() {
		$t = Qt = Zt = Xt = null, nn = !1, en = null, G = 0, W = ln = null;
	}
	function hn(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function gn(e, t, n) {
		if (Xt = un(), W = fn(), tn) {
			var r = W.queue;
			if (t = r.dispatch, ln !== null && (n = ln.get(r), n !== void 0)) {
				ln.delete(r), r = W.memoizedState;
				do
					r = e(r, n.action), n = n.next;
				while (n !== null);
				return W.memoizedState = r, [r, t];
			}
			return [W.memoizedState, t];
		}
		return e = e === hn ? typeof t == "function" ? t() : t : n === void 0 ? t : n(t), W.memoizedState = e, e = W.queue = {
			last: null,
			dispatch: null
		}, e = e.dispatch = vn.bind(null, Xt, e), [W.memoizedState, e];
	}
	function _n(e, t) {
		if (Xt = un(), W = fn(), t = t === void 0 ? null : t, W !== null) {
			var n = W.memoizedState;
			if (n !== null && t !== null) {
				var r = n[1];
				a: if (r === null) r = !1;
				else {
					for (var i = 0; i < r.length && i < t.length; i++) if (!Yt(t[i], r[i])) {
						r = !1;
						break a;
					}
					r = !0;
				}
				if (r) return n[0];
			}
		}
		return e = e(), W.memoizedState = [e, t], e;
	}
	function vn(e, t, n) {
		if (25 <= G) throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
		if (e === Xt) if (nn = !0, e = {
			action: n,
			next: null
		}, ln === null && (ln = /* @__PURE__ */ new Map()), n = ln.get(t), n === void 0) ln.set(t, e);
		else {
			for (t = n; t.next !== null;) t = t.next;
			t.next = e;
		}
	}
	function yn() {
		throw Error("A function wrapped in useEffectEvent can't be called during rendering.");
	}
	function bn() {
		throw Error("startTransition cannot be called during server rendering.");
	}
	function xn() {
		throw Error("Cannot update optimistic state while rendering.");
	}
	function Sn(e, t, n) {
		un();
		var r = an++, i = Qt;
		if (typeof e.$$FORM_ACTION == "function") {
			var a = null, o = $t;
			i = i.formState;
			var s = e.$$IS_SIGNATURE_EQUAL;
			if (i !== null && typeof s == "function") {
				var c = i[1];
				s.call(e, i[2], i[3]) && (a = n === void 0 ? "k" + x(JSON.stringify([
					o,
					null,
					r
				]), 0) : "p" + n, c === a && (on = r, t = i[0]));
			}
			var l = e.bind(null, t);
			return e = function(e) {
				l(e);
			}, typeof l.$$FORM_ACTION == "function" && (e.$$FORM_ACTION = function(e) {
				e = l.$$FORM_ACTION(e), n !== void 0 && (n += "", e.action = n);
				var t = e.data;
				return t && (a === null && (a = n === void 0 ? "k" + x(JSON.stringify([
					o,
					null,
					r
				]), 0) : "p" + n), t.append("$ACTION_KEY", a)), e;
			}), [
				t,
				e,
				!1
			];
		}
		var u = e.bind(null, t);
		return [
			t,
			function(e) {
				u(e);
			},
			!1
		];
	}
	function Cn(e) {
		var t = sn;
		return sn += 1, cn === null && (cn = []), Gt(cn, e, t);
	}
	function wn() {
		throw Error("Cache cannot be refreshed during server rendering.");
	}
	var Tn = {
		readContext: function(e) {
			return e._currentValue2;
		},
		use: function(e) {
			if (typeof e == "object" && e) {
				if (typeof e.then == "function") return Cn(e);
				if (e.$$typeof === l) return e._currentValue2;
			}
			throw Error("An unsupported type was passed to use(): " + String(e));
		},
		useContext: function(e) {
			return un(), e._currentValue2;
		},
		useMemo: _n,
		useReducer: gn,
		useRef: function(e) {
			Xt = un(), W = fn();
			var t = W.memoizedState;
			return t === null ? (e = { current: e }, W.memoizedState = e) : t;
		},
		useState: function(e) {
			return gn(hn, e);
		},
		useInsertionEffect: Ut,
		useLayoutEffect: Ut,
		useCallback: function(e, t) {
			return _n(function() {
				return e;
			}, t);
		},
		useImperativeHandle: Ut,
		useEffect: Ut,
		useDebugValue: Ut,
		useDeferredValue: function(e, t) {
			return un(), t === void 0 ? e : t;
		},
		useTransition: function() {
			return un(), [!1, bn];
		},
		useId: function() {
			var e = Zt.treeContext, t = e.overflow;
			e = e.id, e = (e & ~(1 << 32 - Bt(e) - 1)).toString(32) + t;
			var n = En;
			if (n === null) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
			return t = rn++, e = "_" + n.idPrefix + "R_" + e, 0 < t && (e += "H" + t.toString(32)), e + "_";
		},
		useSyncExternalStore: function(e, t, n) {
			if (n === void 0) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
			return n();
		},
		useOptimistic: function(e) {
			return un(), [e, xn];
		},
		useActionState: Sn,
		useFormState: Sn,
		useHostTransitionStatus: function() {
			return un(), se;
		},
		useMemoCache: function(e) {
			for (var t = Array(e), n = 0; n < e; n++) t[n] = v;
			return t;
		},
		useCacheRefresh: function() {
			return wn;
		},
		useEffectEvent: function() {
			return yn;
		}
	}, En = null, Dn = {
		getCacheForType: function() {
			throw Error("Not implemented.");
		},
		cacheSignal: function() {
			throw Error("Not implemented.");
		}
	}, On, kn;
	function An(e) {
		if (On === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			On = t && t[1] || "", kn = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + On + e + kn;
	}
	var jn = !1;
	function Mn(e, t) {
		if (!e || jn) return "";
		jn = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							e.call(n.prototype);
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			jn = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? An(n) : "";
	}
	function K(e) {
		if (typeof e == "string") return An(e);
		if (typeof e == "function") return e.prototype && e.prototype.isReactComponent ? Mn(e, !0) : Mn(e, !1);
		if (typeof e == "object" && e) {
			switch (e.$$typeof) {
				case u: return Mn(e.render, !1);
				case p: return Mn(e.type, !1);
				case m:
					var t = e, n = t._payload;
					t = t._init;
					try {
						e = t(n);
					} catch {
						return An("Lazy");
					}
					return K(e);
			}
			if (typeof e.name == "string") {
				a: {
					n = e.name, t = e.env;
					var r = e.debugLocation;
					if (r != null && (e = Error.prepareStackTrace, Error.prepareStackTrace = void 0, r = r.stack, Error.prepareStackTrace = e, r.startsWith("Error: react-stack-top-frame\n") && (r = r.slice(29)), e = r.indexOf("\n"), e !== -1 && (r = r.slice(e + 1)), e = r.indexOf("react_stack_bottom_frame"), e !== -1 && (e = r.lastIndexOf("\n", e)), e = e === -1 ? "" : r = r.slice(0, e), r = e.lastIndexOf("\n"), e = r === -1 ? e : e.slice(r + 1), e.indexOf(n) !== -1)) {
						n = "\n" + e;
						break a;
					}
					n = An(n + (t ? " [" + t + "]" : ""));
				}
				return n;
			}
		}
		switch (e) {
			case f: return An("SuspenseList");
			case d: return An("Suspense");
		}
		return "";
	}
	function Nn(e, t) {
		return (500 < t.byteSize || !1) && t.contentPreamble === null;
	}
	function Pn(e) {
		if (typeof e == "object" && e && typeof e.environmentName == "string") {
			var t = e.environmentName;
			e = [e].slice(0), typeof e[0] == "string" ? e.splice(0, 1, "[%s] " + e[0], " " + t + " ") : e.splice(0, 0, "[%s]", " " + t + " "), e.unshift(console), t = Et.apply(console.error, e), t();
		} else console.error(e);
		return null;
	}
	function Fn(e, t, n, r, i, a, o, s, c, l, u) {
		var d = /* @__PURE__ */ new Set();
		this.destination = null, this.flushScheduled = !1, this.resumableState = e, this.renderState = t, this.rootFormatContext = n, this.progressiveChunkSize = r === void 0 ? 12800 : r, this.status = 10, this.fatalError = null, this.pendingRootTasks = this.allPendingTasks = this.nextSegmentId = 0, this.completedPreambleSegments = this.completedRootSegment = null, this.byteSize = 0, this.abortableTasks = d, this.pingedTasks = [], this.clientRenderedBoundaries = [], this.completedBoundaries = [], this.partialBoundaries = [], this.trackedPostpones = null, this.onError = i === void 0 ? Pn : i, this.onPostpone = l === void 0 ? Ut : l, this.onAllReady = a === void 0 ? Ut : a, this.onShellReady = o === void 0 ? Ut : o, this.onShellError = s === void 0 ? Ut : s, this.onFatalError = c === void 0 ? Ut : c, this.formState = u === void 0 ? null : u;
	}
	function In(e, t, n, r, i, a, o, s, c, l, u, d) {
		return t = new Fn(t, n, r, i, a, o, s, c, l, u, d), n = Hn(t, 0, null, r, !1, !1), n.parentFlushed = !0, e = Bn(t, null, e, -1, null, n, null, null, t.abortableTasks, null, r, null, Rt, null, null), Un(e), t.pingedTasks.push(e), t;
	}
	var Ln = null;
	function Rn(e, t) {
		e.pingedTasks.push(t), e.pingedTasks.length === 1 && (e.flushScheduled = e.destination !== null, br(e));
	}
	function zn(e, t, n, r, i) {
		return n = {
			status: 0,
			rootSegmentID: -1,
			parentFlushed: !1,
			pendingTasks: 0,
			row: t,
			completedSegments: [],
			byteSize: 0,
			fallbackAbortableTasks: n,
			errorDigest: null,
			contentState: st(),
			fallbackState: st(),
			contentPreamble: r,
			fallbackPreamble: i,
			trackedContentKeyPath: null,
			trackedFallbackNode: null
		}, t !== null && (t.pendingTasks++, r = t.boundaries, r !== null && (e.allPendingTasks++, n.pendingTasks++, r.push(n)), e = t.inheritedHoistables, e !== null && St(n.contentState, e)), n;
	}
	function Bn(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m) {
		e.allPendingTasks++, i === null ? e.pendingRootTasks++ : i.pendingTasks++, p !== null && p.pendingTasks++;
		var h = {
			replay: null,
			node: n,
			childIndex: r,
			ping: function() {
				return Rn(e, h);
			},
			blockedBoundary: i,
			blockedSegment: a,
			blockedPreamble: o,
			hoistableState: s,
			abortSet: c,
			keyPath: l,
			formatContext: u,
			context: d,
			treeContext: f,
			row: p,
			componentStack: m,
			thenableState: t
		};
		return c.add(h), h;
	}
	function Vn(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.allPendingTasks++, a === null ? e.pendingRootTasks++ : a.pendingTasks++, f !== null && f.pendingTasks++, n.pendingTasks++;
		var m = {
			replay: n,
			node: r,
			childIndex: i,
			ping: function() {
				return Rn(e, m);
			},
			blockedBoundary: a,
			blockedSegment: null,
			blockedPreamble: null,
			hoistableState: o,
			abortSet: s,
			keyPath: c,
			formatContext: l,
			context: u,
			treeContext: d,
			row: f,
			componentStack: p,
			thenableState: t
		};
		return s.add(m), m;
	}
	function Hn(e, t, n, r, i, a) {
		return {
			status: 0,
			parentFlushed: !1,
			id: -1,
			index: t,
			chunks: [],
			children: [],
			preambleChildren: [],
			parentFormatContext: r,
			boundary: n,
			lastPushedText: i,
			textEmbedded: a
		};
	}
	function Un(e) {
		var t = e.node;
		if (typeof t == "object" && t) switch (t.$$typeof) {
			case r: e.componentStack = {
				parent: e.componentStack,
				type: t.type
			};
		}
	}
	function Wn(e) {
		return e === null ? null : {
			parent: e.parent,
			type: "Suspense Fallback"
		};
	}
	function Gn(e) {
		var t = {};
		return e && Object.defineProperty(t, "componentStack", {
			configurable: !0,
			enumerable: !0,
			get: function() {
				try {
					var n = "", r = e;
					do
						n += K(r.type), r = r.parent;
					while (r);
					var i = n;
				} catch (e) {
					i = "\nError generating stack: " + e.message + "\n" + e.stack;
				}
				return Object.defineProperty(t, "componentStack", { value: i }), i;
			}
		}), t;
	}
	function Kn(e, t, n) {
		if (e = e.onError, t = e(t, n), t == null || typeof t == "string") return t;
	}
	function qn(e, t) {
		var n = e.onShellError, r = e.onFatalError;
		n(t), r(t), e.destination === null ? (e.status = 13, e.fatalError = t) : (e.status = 14, e.destination.destroy(t));
	}
	function Jn(e, t) {
		Yn(e, t.next, t.hoistables);
	}
	function Yn(e, t, n) {
		for (; t !== null;) {
			n !== null && (St(t.hoistables, n), t.inheritedHoistables = n);
			var r = t.boundaries;
			if (r !== null) {
				t.boundaries = null;
				for (var i = 0; i < r.length; i++) {
					var a = r[i];
					n !== null && St(a.contentState, n), yr(e, a, null, null);
				}
			}
			if (t.pendingTasks--, 0 < t.pendingTasks) break;
			n = t.hoistables, t = t.next;
		}
	}
	function Xn(e, t) {
		var n = t.boundaries;
		if (n !== null && t.pendingTasks === n.length) {
			for (var r = !0, i = 0; i < n.length; i++) {
				var a = n[i];
				if (a.pendingTasks !== 1 || a.parentFlushed || Nn(e, a)) {
					r = !1;
					break;
				}
			}
			r && Yn(e, t, t.hoistables);
		}
	}
	function Zn(e) {
		var t = {
			pendingTasks: 1,
			boundaries: null,
			hoistables: st(),
			inheritedHoistables: null,
			together: !1,
			next: null
		};
		return e !== null && 0 < e.pendingTasks && (t.pendingTasks++, t.boundaries = [], e.next = t), t;
	}
	function Qn(e, t, n, r, i) {
		var a = t.keyPath, o = t.treeContext, s = t.row;
		t.keyPath = n, n = r.length;
		var c = null;
		if (t.replay !== null) {
			var l = t.replay.slots;
			if (typeof l == "object" && l) for (var u = 0; u < n; u++) {
				var d = i !== "backwards" && i !== "unstable_legacy-backwards" ? u : n - 1 - u, f = r[d];
				t.row = c = Zn(c), t.treeContext = zt(o, n, d);
				var p = l[d];
				typeof p == "number" ? (nr(e, t, p, f, d), delete l[d]) : dr(e, t, f, d), --c.pendingTasks === 0 && Jn(e, c);
			}
			else for (l = 0; l < n; l++) u = i !== "backwards" && i !== "unstable_legacy-backwards" ? l : n - 1 - l, d = r[u], t.row = c = Zn(c), t.treeContext = zt(o, n, u), dr(e, t, d, u), --c.pendingTasks === 0 && Jn(e, c);
		} else if (i !== "backwards" && i !== "unstable_legacy-backwards") for (i = 0; i < n; i++) l = r[i], t.row = c = Zn(c), t.treeContext = zt(o, n, i), dr(e, t, l, i), --c.pendingTasks === 0 && Jn(e, c);
		else {
			for (i = t.blockedSegment, l = i.children.length, u = i.chunks.length, d = n - 1; 0 <= d; d--) {
				f = r[d], t.row = c = Zn(c), t.treeContext = zt(o, n, d), p = Hn(e, u, null, t.formatContext, d === 0 ? i.lastPushedText : !0, !0), i.children.splice(l, 0, p), t.blockedSegment = p;
				try {
					dr(e, t, f, d), Tt(p.chunks, e.renderState, p.lastPushedText, p.textEmbedded), p.status = 1, --c.pendingTasks === 0 && Jn(e, c);
				} catch (t) {
					throw p.status = e.status === 12 ? 3 : 4, t;
				}
			}
			t.blockedSegment = i, i.lastPushedText = !1;
		}
		s !== null && c !== null && 0 < c.pendingTasks && (s.pendingTasks++, c.next = s), t.treeContext = o, t.row = s, t.keyPath = a;
	}
	function $n(e, t, n, r, i, a) {
		var o = t.thenableState;
		for (t.thenableState = null, Xt = {}, Zt = t, Qt = e, $t = n, an = rn = 0, on = -1, sn = 0, cn = o, e = r(i, a); nn;) nn = !1, an = rn = 0, on = -1, sn = 0, G += 1, W = null, e = r(i, a);
		return mn(), e;
	}
	function er(e, t, n, r, i, a, o) {
		var s = !1;
		if (a !== 0 && e.formState !== null) {
			var c = t.blockedSegment;
			if (c !== null) {
				s = !0, c = c.chunks;
				for (var l = 0; l < a; l++) l === o ? c.push("<!--F!-->") : c.push("<!--F-->");
			}
		}
		a = t.keyPath, t.keyPath = n, i ? (n = t.treeContext, t.treeContext = zt(n, 1, 0), dr(e, t, r, -1), t.treeContext = n) : s ? dr(e, t, r, -1) : rr(e, t, r, -1), t.keyPath = a;
	}
	function tr(e, t, n, r, i, v) {
		if (typeof r == "function") if (r.prototype && r.prototype.isReactComponent) {
			var y = i;
			if ("ref" in i) for (var x in y = {}, i) x !== "ref" && (y[x] = i[x]);
			var C = r.defaultProps;
			if (C) for (var ne in y === i && (y = S({}, y, i)), C) y[ne] === void 0 && (y[ne] = C[ne]);
			i = y, y = kt, C = r.contextType, typeof C == "object" && C && (y = C._currentValue2), y = new r(i, y);
			var w = y.state === void 0 ? null : y.state;
			if (y.updater = Lt, y.props = i, y.state = w, C = {
				queue: [],
				replace: !1
			}, y._reactInternals = C, v = r.contextType, y.context = typeof v == "object" && v ? v._currentValue2 : kt, v = r.getDerivedStateFromProps, typeof v == "function" && (v = v(i, w), w = v == null ? w : S({}, w, v), y.state = w), typeof r.getDerivedStateFromProps != "function" && typeof y.getSnapshotBeforeUpdate != "function" && (typeof y.UNSAFE_componentWillMount == "function" || typeof y.componentWillMount == "function")) if (r = y.state, typeof y.componentWillMount == "function" && y.componentWillMount(), typeof y.UNSAFE_componentWillMount == "function" && y.UNSAFE_componentWillMount(), r !== y.state && Lt.enqueueReplaceState(y, y.state, null), C.queue !== null && 0 < C.queue.length) if (r = C.queue, v = C.replace, C.queue = null, C.replace = !1, v && r.length === 1) y.state = r[0];
			else {
				for (C = v ? r[0] : y.state, w = !0, v = +!!v; v < r.length; v++) ne = r[v], ne = typeof ne == "function" ? ne.call(y, C, i, void 0) : ne, ne != null && (w ? (w = !1, C = S({}, C, ne)) : S(C, ne));
				y.state = C;
			}
			else C.queue = null;
			if (r = y.render(), e.status === 12) throw null;
			i = t.keyPath, t.keyPath = n, rr(e, t, r, -1), t.keyPath = i;
		} else {
			if (r = $n(e, t, n, r, i, void 0), e.status === 12) throw null;
			er(e, t, n, r, rn !== 0, an, on);
		}
		else if (typeof r == "string") if (y = t.blockedSegment, y === null) y = i.children, C = t.formatContext, w = t.keyPath, t.formatContext = me(C, r, i), t.keyPath = n, dr(e, t, y, -1), t.formatContext = C, t.keyPath = w;
		else {
			if (w = Ve(y.chunks, r, i, e.resumableState, e.renderState, t.blockedPreamble, t.hoistableState, t.formatContext, y.lastPushedText), y.lastPushedText = !1, C = t.formatContext, v = t.keyPath, t.keyPath = n, (t.formatContext = me(C, r, i)).insertionMode === 3) {
				n = Hn(e, 0, null, t.formatContext, !1, !1), y.preambleChildren.push(n), t.blockedSegment = n;
				try {
					n.status = 6, dr(e, t, w, -1), Tt(n.chunks, e.renderState, n.lastPushedText, n.textEmbedded), n.status = 1;
				} finally {
					t.blockedSegment = y;
				}
			} else dr(e, t, w, -1);
			t.formatContext = C, t.keyPath = v;
			a: {
				switch (t = y.chunks, e = e.resumableState, r) {
					case "title":
					case "style":
					case "script":
					case "area":
					case "base":
					case "br":
					case "col":
					case "embed":
					case "hr":
					case "img":
					case "input":
					case "keygen":
					case "link":
					case "meta":
					case "param":
					case "source":
					case "track":
					case "wbr": break a;
					case "body":
						if (1 >= C.insertionMode) {
							e.hasBody = !0;
							break a;
						}
						break;
					case "html":
						if (C.insertionMode === 0) {
							e.hasHtml = !0;
							break a;
						}
						break;
					case "head": if (1 >= C.insertionMode) break a;
				}
				t.push(Ue(r));
			}
			y.lastPushedText = !1;
		}
		else {
			switch (r) {
				case _:
				case o:
				case s:
				case a:
					r = t.keyPath, t.keyPath = n, rr(e, t, i.children, -1), t.keyPath = r;
					return;
				case g:
					r = t.blockedSegment, r === null ? i.mode !== "hidden" && (r = t.keyPath, t.keyPath = n, dr(e, t, i.children, -1), t.keyPath = r) : i.mode !== "hidden" && (e.renderState.generateStaticMarkup || r.chunks.push("<!--&-->"), r.lastPushedText = !1, y = t.keyPath, t.keyPath = n, dr(e, t, i.children, -1), t.keyPath = y, e.renderState.generateStaticMarkup || r.chunks.push("<!--/&-->"), r.lastPushedText = !1);
					return;
				case f:
					a: {
						if (r = i.children, i = i.revealOrder, i === "forwards" || i === "backwards" || i === "unstable_legacy-backwards") {
							if (b(r)) {
								Qn(e, t, n, r, i);
								break a;
							}
							if ((y = te(r)) && (y = y.call(r))) {
								if (C = y.next(), !C.done) {
									do
										C = y.next();
									while (!C.done);
									Qn(e, t, n, r, i);
								}
								break a;
							}
						}
						i === "together" ? (i = t.keyPath, y = t.row, C = t.row = Zn(null), C.boundaries = [], C.together = !0, t.keyPath = n, rr(e, t, r, -1), --C.pendingTasks === 0 && Jn(e, C), t.keyPath = i, t.row = y, y !== null && 0 < C.pendingTasks && (y.pendingTasks++, C.next = y)) : (i = t.keyPath, t.keyPath = n, rr(e, t, r, -1), t.keyPath = i);
					}
					return;
				case ee:
				case h: throw Error("ReactDOMServer does not yet support scope components.");
				case d:
					a: if (t.replay !== null) {
						r = t.keyPath, y = t.formatContext, C = t.row, t.keyPath = n, t.formatContext = ge(e.resumableState, y), t.row = null, n = i.children;
						try {
							dr(e, t, n, -1);
						} finally {
							t.keyPath = r, t.formatContext = y, t.row = C;
						}
					} else {
						r = t.keyPath, v = t.formatContext;
						var T = t.row, re = t.blockedBoundary;
						ne = t.blockedPreamble;
						var E = t.hoistableState;
						x = t.blockedSegment;
						var D = i.fallback;
						i = i.children;
						var O = /* @__PURE__ */ new Set(), k = zn(e, t.row, O, null, null);
						e.trackedPostpones !== null && (k.trackedContentKeyPath = n);
						var A = Hn(e, x.chunks.length, k, t.formatContext, !1, !1);
						x.children.push(A), x.lastPushedText = !1;
						var j = Hn(e, 0, null, t.formatContext, !1, !1);
						if (j.parentFlushed = !0, e.trackedPostpones !== null) {
							y = t.componentStack, C = [
								n[0],
								"Suspense Fallback",
								n[2]
							], w = [
								C[1],
								C[2],
								[],
								null
							], e.trackedPostpones.workingMap.set(C, w), k.trackedFallbackNode = w, t.blockedSegment = A, t.blockedPreamble = k.fallbackPreamble, t.keyPath = C, t.formatContext = he(e.resumableState, v), t.componentStack = Wn(y), A.status = 6;
							try {
								dr(e, t, D, -1), Tt(A.chunks, e.renderState, A.lastPushedText, A.textEmbedded), A.status = 1;
							} catch (t) {
								throw A.status = e.status === 12 ? 3 : 4, t;
							} finally {
								t.blockedSegment = x, t.blockedPreamble = ne, t.keyPath = r, t.formatContext = v;
							}
							t = Bn(e, null, i, -1, k, j, k.contentPreamble, k.contentState, t.abortSet, n, ge(e.resumableState, t.formatContext), t.context, t.treeContext, null, y), Un(t), e.pingedTasks.push(t);
						} else {
							t.blockedBoundary = k, t.blockedPreamble = k.contentPreamble, t.hoistableState = k.contentState, t.blockedSegment = j, t.keyPath = n, t.formatContext = ge(e.resumableState, v), t.row = null, j.status = 6;
							try {
								if (dr(e, t, i, -1), Tt(j.chunks, e.renderState, j.lastPushedText, j.textEmbedded), j.status = 1, vr(k, j), k.pendingTasks === 0 && k.status === 0) {
									if (k.status = 1, !Nn(e, k)) {
										T !== null && --T.pendingTasks === 0 && Jn(e, T), e.pendingRootTasks === 0 && t.blockedPreamble && Cr(e);
										break a;
									}
								} else T !== null && T.together && Xn(e, T);
							} catch (n) {
								k.status = 4, e.status === 12 ? (j.status = 3, y = e.fatalError) : (j.status = 4, y = n), C = Gn(t.componentStack), w = Kn(e, y, C), k.errorDigest = w, cr(e, k);
							} finally {
								t.blockedBoundary = re, t.blockedPreamble = ne, t.hoistableState = E, t.blockedSegment = x, t.keyPath = r, t.formatContext = v, t.row = T;
							}
							t = Bn(e, null, D, -1, re, A, k.fallbackPreamble, k.fallbackState, O, [
								n[0],
								"Suspense Fallback",
								n[2]
							], he(e.resumableState, t.formatContext), t.context, t.treeContext, t.row, Wn(t.componentStack)), Un(t), e.pingedTasks.push(t);
						}
					}
					return;
			}
			if (typeof r == "object" && r) switch (r.$$typeof) {
				case u:
					if ("ref" in i) for (D in y = {}, i) D !== "ref" && (y[D] = i[D]);
					else y = i;
					r = $n(e, t, n, r.render, y, v), er(e, t, n, r, rn !== 0, an, on);
					return;
				case p:
					tr(e, t, n, r.type, i, v);
					return;
				case l:
					if (C = i.children, y = t.keyPath, i = i.value, w = r._currentValue2, r._currentValue2 = i, v = At, At = r = {
						parent: v,
						depth: v === null ? 0 : v.depth + 1,
						context: r,
						parentValue: w,
						value: i
					}, t.context = r, t.keyPath = n, rr(e, t, C, -1), e = At, e === null) throw Error("Tried to pop a Context at the root of the app. This is a bug in React.");
					e.context._currentValue2 = e.parentValue, e = At = e.parent, t.context = e, t.keyPath = y;
					return;
				case c:
					i = i.children, r = i(r._context._currentValue2), i = t.keyPath, t.keyPath = n, rr(e, t, r, -1), t.keyPath = i;
					return;
				case m:
					if (y = r._init, r = y(r._payload), e.status === 12) throw null;
					tr(e, t, n, r, i, v);
					return;
			}
			throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + ((r == null ? r : typeof r) + "."));
		}
	}
	function nr(e, t, n, r, i) {
		var a = t.replay, o = t.blockedBoundary, s = Hn(e, 0, null, t.formatContext, !1, !1);
		s.id = n, s.parentFlushed = !0;
		try {
			t.replay = null, t.blockedSegment = s, dr(e, t, r, i), s.status = 1, o === null ? e.completedRootSegment = s : (vr(o, s), o.parentFlushed && e.partialBoundaries.push(o));
		} finally {
			t.replay = a, t.blockedSegment = null;
		}
	}
	function rr(e, t, n, r) {
		t.replay !== null && typeof t.replay.slots == "number" ? nr(e, t, t.replay.slots, n, r) : (t.node = n, t.childIndex = r, n = t.componentStack, Un(t), ir(e, t), t.componentStack = n);
	}
	function ir(e, t) {
		var n = t.node, a = t.childIndex;
		if (n !== null) {
			if (typeof n == "object") {
				switch (n.$$typeof) {
					case r:
						var o = n.type, s = n.key, c = n.props;
						n = c.ref;
						var u = n === void 0 ? null : n, f = Ot(o), p = s ?? (a === -1 ? 0 : a);
						if (s = [
							t.keyPath,
							f,
							p
						], t.replay !== null) a: {
							var h = t.replay;
							for (a = h.nodes, n = 0; n < a.length; n++) {
								var g = a[n];
								if (p === g[1]) {
									if (g.length === 4) {
										if (f !== null && f !== g[0]) throw Error("Expected the resume to render <" + g[0] + "> in this slot but instead it rendered <" + f + ">. The tree doesn't match so React will fallback to client rendering.");
										var _ = g[2];
										f = g[3], p = t.node, t.replay = {
											nodes: _,
											slots: f,
											pendingTasks: 1
										};
										try {
											if (tr(e, t, s, o, c, u), t.replay.pendingTasks === 1 && 0 < t.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
											t.replay.pendingTasks--;
										} catch (r) {
											if (typeof r == "object" && r && (r === Wt || typeof r.then == "function")) throw t.node === p ? t.replay = h : a.splice(n, 1), r;
											t.replay.pendingTasks--, c = Gn(t.componentStack), s = e, e = t.blockedBoundary, o = r, c = Kn(s, o, c), pr(s, e, _, f, o, c);
										}
										t.replay = h;
									} else {
										if (o !== d) throw Error("Expected the resume to render <Suspense> in this slot but instead it rendered <" + (Ot(o) || "Unknown") + ">. The tree doesn't match so React will fallback to client rendering.");
										b: {
											h = void 0, o = g[5], u = g[2], f = g[3], p = g[4] === null ? [] : g[4][2], g = g[4] === null ? null : g[4][3];
											var v = t.keyPath, ee = t.formatContext, y = t.row, x = t.replay, S = t.blockedBoundary, C = t.hoistableState, ne = c.children, w = c.fallback, T = /* @__PURE__ */ new Set();
											c = zn(e, t.row, T, null, null), c.parentFlushed = !0, c.rootSegmentID = o, t.blockedBoundary = c, t.hoistableState = c.contentState, t.keyPath = s, t.formatContext = ge(e.resumableState, ee), t.row = null, t.replay = {
												nodes: u,
												slots: f,
												pendingTasks: 1
											};
											try {
												if (dr(e, t, ne, -1), t.replay.pendingTasks === 1 && 0 < t.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
												if (t.replay.pendingTasks--, c.pendingTasks === 0 && c.status === 0) {
													c.status = 1, e.completedBoundaries.push(c);
													break b;
												}
											} catch (n) {
												c.status = 4, _ = Gn(t.componentStack), h = Kn(e, n, _), c.errorDigest = h, t.replay.pendingTasks--, e.clientRenderedBoundaries.push(c);
											} finally {
												t.blockedBoundary = S, t.hoistableState = C, t.replay = x, t.keyPath = v, t.formatContext = ee, t.row = y;
											}
											_ = Vn(e, null, {
												nodes: p,
												slots: g,
												pendingTasks: 0
											}, w, -1, S, c.fallbackState, T, [
												s[0],
												"Suspense Fallback",
												s[2]
											], he(e.resumableState, t.formatContext), t.context, t.treeContext, t.row, Wn(t.componentStack)), Un(_), e.pingedTasks.push(_);
										}
									}
									a.splice(n, 1);
									break a;
								}
							}
						}
						else tr(e, t, s, o, c, u);
						return;
					case i: throw Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
					case m:
						if (_ = n._init, n = _(n._payload), e.status === 12) throw null;
						rr(e, t, n, a);
						return;
				}
				if (b(n)) {
					ar(e, t, n, a);
					return;
				}
				if ((_ = te(n)) && (_ = _.call(n))) {
					if (n = _.next(), !n.done) {
						c = [];
						do
							c.push(n.value), n = _.next();
						while (!n.done);
						ar(e, t, c, a);
					}
					return;
				}
				if (typeof n.then == "function") return t.thenableState = null, rr(e, t, Cn(n), a);
				if (n.$$typeof === l) return rr(e, t, n._currentValue2, a);
				throw a = Object.prototype.toString.call(n), Error("Objects are not valid as a React child (found: " + (a === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
			}
			typeof n == "string" ? (a = t.blockedSegment, a !== null && (a.lastPushedText = wt(a.chunks, n, e.renderState, a.lastPushedText))) : (typeof n == "number" || typeof n == "bigint") && (a = t.blockedSegment, a !== null && (a.lastPushedText = wt(a.chunks, "" + n, e.renderState, a.lastPushedText)));
		}
	}
	function ar(e, t, n, r) {
		var i = t.keyPath;
		if (r !== -1 && (t.keyPath = [
			t.keyPath,
			"Fragment",
			r
		], t.replay !== null)) {
			for (var a = t.replay, o = a.nodes, s = 0; s < o.length; s++) {
				var c = o[s];
				if (c[1] === r) {
					r = c[2], c = c[3], t.replay = {
						nodes: r,
						slots: c,
						pendingTasks: 1
					};
					try {
						if (ar(e, t, n, -1), t.replay.pendingTasks === 1 && 0 < t.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
						t.replay.pendingTasks--;
					} catch (i) {
						if (typeof i == "object" && i && (i === Wt || typeof i.then == "function")) throw i;
						t.replay.pendingTasks--, n = Gn(t.componentStack);
						var l = t.blockedBoundary, u = i;
						n = Kn(e, u, n), pr(e, l, r, c, u, n);
					}
					t.replay = a, o.splice(s, 1);
					break;
				}
			}
			t.keyPath = i;
			return;
		}
		if (a = t.treeContext, o = n.length, t.replay !== null && (s = t.replay.slots, typeof s == "object" && s)) {
			for (r = 0; r < o; r++) c = n[r], t.treeContext = zt(a, o, r), l = s[r], typeof l == "number" ? (nr(e, t, l, c, r), delete s[r]) : dr(e, t, c, r);
			t.treeContext = a, t.keyPath = i;
			return;
		}
		for (s = 0; s < o; s++) r = n[s], t.treeContext = zt(a, o, s), dr(e, t, r, s);
		t.treeContext = a, t.keyPath = i;
	}
	function or(e, t, n) {
		if (n.status = 5, n.rootSegmentID = e.nextSegmentId++, e = n.trackedContentKeyPath, e === null) throw Error("It should not be possible to postpone at the root. This is a bug in React.");
		var r = n.trackedFallbackNode, i = [], a = t.workingMap.get(e);
		return a === void 0 ? (n = [
			e[1],
			e[2],
			i,
			null,
			r,
			n.rootSegmentID
		], t.workingMap.set(e, n), Fr(n, e[0], t), n) : (a[4] = r, a[5] = n.rootSegmentID, a);
	}
	function sr(e, t, n, r) {
		r.status = 5;
		var i = n.keyPath, a = n.blockedBoundary;
		if (a === null) r.id = e.nextSegmentId++, t.rootSlots = r.id, e.completedRootSegment !== null && (e.completedRootSegment.status = 5);
		else {
			if (a !== null && a.status === 0) {
				var o = or(e, t, a);
				if (a.trackedContentKeyPath === i && n.childIndex === -1) {
					r.id === -1 && (r.id = r.parentFlushed ? a.rootSegmentID : e.nextSegmentId++), o[3] = r.id;
					return;
				}
			}
			if (r.id === -1 && (r.id = r.parentFlushed && a !== null ? a.rootSegmentID : e.nextSegmentId++), n.childIndex === -1) i === null ? t.rootSlots = r.id : (n = t.workingMap.get(i), n === void 0 ? (n = [
				i[1],
				i[2],
				[],
				r.id
			], Fr(n, i[0], t)) : n[3] = r.id);
			else {
				if (i === null) {
					if (e = t.rootSlots, e === null) e = t.rootSlots = {};
					else if (typeof e == "number") throw Error("It should not be possible to postpone both at the root of an element as well as a slot below. This is a bug in React.");
				} else if (a = t.workingMap, o = a.get(i), o === void 0) e = {}, o = [
					i[1],
					i[2],
					[],
					e
				], a.set(i, o), Fr(o, i[0], t);
				else if (e = o[3], e === null) e = o[3] = {};
				else if (typeof e == "number") throw Error("It should not be possible to postpone both at the root of an element as well as a slot below. This is a bug in React.");
				e[n.childIndex] = r.id;
			}
		}
	}
	function cr(e, t) {
		e = e.trackedPostpones, e !== null && (t = t.trackedContentKeyPath, t !== null && (t = e.workingMap.get(t), t !== void 0 && (t.length = 4, t[2] = [], t[3] = null)));
	}
	function lr(e, t, n) {
		return Vn(e, n, t.replay, t.node, t.childIndex, t.blockedBoundary, t.hoistableState, t.abortSet, t.keyPath, t.formatContext, t.context, t.treeContext, t.row, t.componentStack);
	}
	function ur(e, t, n) {
		var r = t.blockedSegment, i = Hn(e, r.chunks.length, null, t.formatContext, r.lastPushedText, !0);
		return r.children.push(i), r.lastPushedText = !1, Bn(e, n, t.node, t.childIndex, t.blockedBoundary, i, t.blockedPreamble, t.hoistableState, t.abortSet, t.keyPath, t.formatContext, t.context, t.treeContext, t.row, t.componentStack);
	}
	function dr(e, t, n, r) {
		var i = t.formatContext, a = t.context, o = t.keyPath, s = t.treeContext, c = t.componentStack, l = t.blockedSegment;
		if (l === null) {
			l = t.replay;
			try {
				return rr(e, t, n, r);
			} catch (u) {
				if (mn(), n = u === Wt ? qt() : u, e.status !== 12 && typeof n == "object" && n) {
					if (typeof n.then == "function") {
						r = u === Wt ? pn() : null, e = lr(e, t, r).ping, n.then(e, e), t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, t.componentStack = c, t.replay = l, It(a);
						return;
					}
					if (n.message === "Maximum call stack size exceeded") {
						n = u === Wt ? pn() : null, n = lr(e, t, n), e.pingedTasks.push(n), t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, t.componentStack = c, t.replay = l, It(a);
						return;
					}
				}
			}
		} else {
			var u = l.children.length, d = l.chunks.length;
			try {
				return rr(e, t, n, r);
			} catch (r) {
				if (mn(), l.children.length = u, l.chunks.length = d, n = r === Wt ? qt() : r, e.status !== 12 && typeof n == "object" && n) {
					if (typeof n.then == "function") {
						l = n, n = r === Wt ? pn() : null, e = ur(e, t, n).ping, l.then(e, e), t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, t.componentStack = c, It(a);
						return;
					}
					if (n.message === "Maximum call stack size exceeded") {
						l = r === Wt ? pn() : null, l = ur(e, t, l), e.pingedTasks.push(l), t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, t.componentStack = c, It(a);
						return;
					}
				}
			}
		}
		throw t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, It(a), n;
	}
	function fr(e) {
		var t = e.blockedBoundary, n = e.blockedSegment;
		n !== null && (n.status = 3, yr(this, t, e.row, n));
	}
	function pr(e, t, n, r, i, a) {
		for (var o = 0; o < n.length; o++) {
			var s = n[o];
			if (s.length === 4) pr(e, t, s[2], s[3], i, a);
			else {
				s = s[5];
				var c = e, l = a, u = zn(c, null, /* @__PURE__ */ new Set(), null, null);
				u.parentFlushed = !0, u.rootSegmentID = s, u.status = 4, u.errorDigest = l, u.parentFlushed && c.clientRenderedBoundaries.push(u);
			}
		}
		if (n.length = 0, r !== null) {
			if (t === null) throw Error("We should not have any resumable nodes in the shell. This is a bug in React.");
			if (t.status !== 4 && (t.status = 4, t.errorDigest = a, t.parentFlushed && e.clientRenderedBoundaries.push(t)), typeof r == "object") for (var d in r) delete r[d];
		}
	}
	function mr(e, t, n) {
		var r = e.blockedBoundary, i = e.blockedSegment;
		if (i !== null) {
			if (i.status === 6) return;
			i.status = 3;
		}
		var a = Gn(e.componentStack);
		if (r === null) {
			if (t.status !== 13 && t.status !== 14) {
				if (r = e.replay, r === null) {
					t.trackedPostpones !== null && i !== null ? (r = t.trackedPostpones, Kn(t, n, a), sr(t, r, e, i), yr(t, null, e.row, i)) : (Kn(t, n, a), qn(t, n));
					return;
				}
				r.pendingTasks--, r.pendingTasks === 0 && 0 < r.nodes.length && (i = Kn(t, n, a), pr(t, null, r.nodes, r.slots, n, i)), t.pendingRootTasks--, t.pendingRootTasks === 0 && gr(t);
			}
		} else {
			var o = t.trackedPostpones;
			if (r.status !== 4) {
				if (o !== null && i !== null) return Kn(t, n, a), sr(t, o, e, i), r.fallbackAbortableTasks.forEach(function(e) {
					return mr(e, t, n);
				}), r.fallbackAbortableTasks.clear(), yr(t, r, e.row, i);
				r.status = 4, i = Kn(t, n, a), r.status = 4, r.errorDigest = i, cr(t, r), r.parentFlushed && t.clientRenderedBoundaries.push(r);
			}
			r.pendingTasks--, i = r.row, i !== null && --i.pendingTasks === 0 && Jn(t, i), r.fallbackAbortableTasks.forEach(function(e) {
				return mr(e, t, n);
			}), r.fallbackAbortableTasks.clear();
		}
		e = e.row, e !== null && --e.pendingTasks === 0 && Jn(t, e), t.allPendingTasks--, t.allPendingTasks === 0 && _r(t);
	}
	function hr(e, t) {
		try {
			var n = e.renderState, r = n.onHeaders;
			if (r) {
				var i = n.headers;
				if (i) {
					n.headers = null;
					var a = i.preconnects;
					if (i.fontPreloads && (a && (a += ", "), a += i.fontPreloads), i.highImagePreloads && (a && (a += ", "), a += i.highImagePreloads), !t) {
						var o = n.styles.values(), s = o.next();
						b: for (; 0 < i.remainingCapacity && !s.done; s = o.next()) for (var c = s.value.sheets.values(), l = c.next(); 0 < i.remainingCapacity && !l.done; l = c.next()) {
							var u = l.value, d = u.props, f = d.href, p = u.props, m = gt(p.href, "style", {
								crossOrigin: p.crossOrigin,
								integrity: p.integrity,
								nonce: p.nonce,
								type: p.type,
								fetchPriority: p.fetchPriority,
								referrerPolicy: p.referrerPolicy,
								media: p.media
							});
							if (0 <= (i.remainingCapacity -= m.length + 2)) n.resets.style[f] = ce, a && (a += ", "), a += m, n.resets.style[f] = typeof d.crossOrigin == "string" || typeof d.integrity == "string" ? [d.crossOrigin, d.integrity] : ce;
							else break b;
						}
					}
					r(a ? { Link: a } : {});
				}
			}
		} catch (t) {
			Kn(e, t, {});
		}
	}
	function gr(e) {
		e.trackedPostpones === null && hr(e, !0), e.trackedPostpones === null && Cr(e), e.onShellError = Ut, e = e.onShellReady, e();
	}
	function _r(e) {
		hr(e, e.trackedPostpones === null ? !0 : e.completedRootSegment === null || e.completedRootSegment.status !== 5), Cr(e), e = e.onAllReady, e();
	}
	function vr(e, t) {
		if (t.chunks.length === 0 && t.children.length === 1 && t.children[0].boundary === null && t.children[0].id === -1) {
			var n = t.children[0];
			n.id = t.id, n.parentFlushed = !0, n.status !== 1 && n.status !== 3 && n.status !== 4 || vr(e, n);
		} else e.completedSegments.push(t);
	}
	function yr(e, t, n, r) {
		if (n !== null && (--n.pendingTasks === 0 ? Jn(e, n) : n.together && Xn(e, n)), e.allPendingTasks--, t === null) {
			if (r !== null && r.parentFlushed) {
				if (e.completedRootSegment !== null) throw Error("There can only be one root segment. This is a bug in React.");
				e.completedRootSegment = r;
			}
			e.pendingRootTasks--, e.pendingRootTasks === 0 && gr(e);
		} else if (t.pendingTasks--, t.status !== 4) if (t.pendingTasks === 0) {
			if (t.status === 0 && (t.status = 1), r !== null && r.parentFlushed && (r.status === 1 || r.status === 3) && vr(t, r), t.parentFlushed && e.completedBoundaries.push(t), t.status === 1) n = t.row, n !== null && St(n.hoistables, t.contentState), Nn(e, t) || (t.fallbackAbortableTasks.forEach(fr, e), t.fallbackAbortableTasks.clear(), n !== null && --n.pendingTasks === 0 && Jn(e, n)), e.pendingRootTasks === 0 && e.trackedPostpones === null && t.contentPreamble !== null && Cr(e);
			else if (t.status === 5 && (t = t.row, t !== null)) {
				if (e.trackedPostpones !== null) {
					n = e.trackedPostpones;
					var i = t.next;
					if (i !== null && (r = i.boundaries, r !== null)) for (i.boundaries = null, i = 0; i < r.length; i++) {
						var a = r[i];
						or(e, n, a), yr(e, a, null, null);
					}
				}
				--t.pendingTasks === 0 && Jn(e, t);
			}
		} else r === null || !r.parentFlushed || r.status !== 1 && r.status !== 3 || (vr(t, r), t.completedSegments.length === 1 && t.parentFlushed && e.partialBoundaries.push(t)), t = t.row, t !== null && t.together && Xn(e, t);
		e.allPendingTasks === 0 && _r(e);
	}
	function br(e) {
		if (e.status !== 14 && e.status !== 13) {
			var t = At, n = M.H;
			M.H = Tn;
			var r = M.A;
			M.A = Dn;
			var i = Ln;
			Ln = e;
			var a = En;
			En = e.resumableState;
			try {
				var o = e.pingedTasks, s;
				for (s = 0; s < o.length; s++) {
					var c = o[s], l = e, u = c.blockedSegment;
					if (u === null) {
						var d = l;
						if (c.replay.pendingTasks !== 0) {
							It(c.context);
							try {
								if (typeof c.replay.slots == "number" ? nr(d, c, c.replay.slots, c.node, c.childIndex) : ir(d, c), c.replay.pendingTasks === 1 && 0 < c.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
								c.replay.pendingTasks--, c.abortSet.delete(c), yr(d, c.blockedBoundary, c.row, null);
							} catch (e) {
								mn();
								var f = e === Wt ? qt() : e;
								if (typeof f == "object" && f && typeof f.then == "function") {
									var p = c.ping;
									f.then(p, p), c.thenableState = e === Wt ? pn() : null;
								} else {
									c.replay.pendingTasks--, c.abortSet.delete(c);
									var m = Gn(c.componentStack);
									l = void 0;
									var h = d, g = c.blockedBoundary, _ = d.status === 12 ? d.fatalError : f, v = c.replay.nodes, ee = c.replay.slots;
									l = Kn(h, _, m), pr(h, g, v, ee, _, l), d.pendingRootTasks--, d.pendingRootTasks === 0 && gr(d), d.allPendingTasks--, d.allPendingTasks === 0 && _r(d);
								}
							}
						}
					} else if (d = void 0, h = u, h.status === 0) {
						h.status = 6, It(c.context);
						var y = h.children.length, te = h.chunks.length;
						try {
							ir(l, c), Tt(h.chunks, l.renderState, h.lastPushedText, h.textEmbedded), c.abortSet.delete(c), h.status = 1, yr(l, c.blockedBoundary, c.row, h);
						} catch (e) {
							mn(), h.children.length = y, h.chunks.length = te;
							var b = e === Wt ? qt() : l.status === 12 ? l.fatalError : e;
							if (l.status === 12 && l.trackedPostpones !== null) {
								var x = l.trackedPostpones, S = Gn(c.componentStack);
								c.abortSet.delete(c), Kn(l, b, S), sr(l, x, c, h), yr(l, c.blockedBoundary, c.row, h);
							} else if (typeof b == "object" && b && typeof b.then == "function") {
								h.status = 0, c.thenableState = e === Wt ? pn() : null;
								var C = c.ping;
								b.then(C, C);
							} else {
								var ne = Gn(c.componentStack);
								c.abortSet.delete(c), h.status = 4;
								var w = c.blockedBoundary, T = c.row;
								if (T !== null && --T.pendingTasks === 0 && Jn(l, T), l.allPendingTasks--, d = Kn(l, b, ne), w === null) qn(l, b);
								else if (w.pendingTasks--, w.status !== 4) {
									w.status = 4, w.errorDigest = d, cr(l, w);
									var re = w.row;
									re !== null && --re.pendingTasks === 0 && Jn(l, re), w.parentFlushed && l.clientRenderedBoundaries.push(w), l.pendingRootTasks === 0 && l.trackedPostpones === null && w.contentPreamble !== null && Cr(l);
								}
								l.allPendingTasks === 0 && _r(l);
							}
						}
					}
				}
				o.splice(0, s), e.destination !== null && jr(e, e.destination);
			} catch (t) {
				Kn(e, t, {}), qn(e, t);
			} finally {
				En = a, M.H = n, M.A = r, n === Tn && It(t), Ln = i;
			}
		}
	}
	function xr(e, t, n) {
		t.preambleChildren.length && n.push(t.preambleChildren);
		for (var r = !1, i = 0; i < t.children.length; i++) r = Sr(e, t.children[i], n) || r;
		return r;
	}
	function Sr(e, t, n) {
		var r = t.boundary;
		if (r === null) return xr(e, t, n);
		var i = r.contentPreamble, a = r.fallbackPreamble;
		if (i === null || a === null) return !1;
		switch (r.status) {
			case 1:
				if (We(e.renderState, i), e.byteSize += r.byteSize, t = r.completedSegments[0], !t) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
				return xr(e, t, n);
			case 5: if (e.trackedPostpones !== null) return !0;
			case 4: if (t.status === 1) return We(e.renderState, a), xr(e, t, n);
			default: return !0;
		}
	}
	function Cr(e) {
		if (e.completedRootSegment && e.completedPreambleSegments === null) {
			var t = [], n = e.byteSize, r = Sr(e, e.completedRootSegment, t), i = e.renderState.preamble;
			!1 === r || i.headChunks && i.bodyChunks ? e.completedPreambleSegments = t : e.byteSize = n;
		}
	}
	function wr(e, t, n, r) {
		switch (n.parentFlushed = !0, n.status) {
			case 0: n.id = e.nextSegmentId++;
			case 5: return r = n.id, n.lastPushedText = !1, n.textEmbedded = !1, e = e.renderState, t.push("<template id=\""), t.push(e.placeholderPrefix), e = r.toString(16), t.push(e), t.push("\"></template>");
			case 1:
				n.status = 2;
				var i = !0, a = n.chunks, o = 0;
				n = n.children;
				for (var s = 0; s < n.length; s++) {
					for (i = n[s]; o < i.index; o++) t.push(a[o]);
					i = Er(e, t, i, r);
				}
				for (; o < a.length - 1; o++) t.push(a[o]);
				return o < a.length && (i = t.push(a[o])), i;
			case 3: return !0;
			default: throw Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
		}
	}
	var Tr = 0;
	function Er(e, t, n, r) {
		var i = n.boundary;
		if (i === null) return wr(e, t, n, r);
		if (i.parentFlushed = !0, i.status === 4) {
			var a = i.row;
			return a !== null && --a.pendingTasks === 0 && Jn(e, a), e.renderState.generateStaticMarkup || (i = i.errorDigest, t.push("<!--$!-->"), t.push("<template"), i && (t.push(" data-dgst=\""), i = k(i), t.push(i), t.push("\"")), t.push("></template>")), wr(e, t, n, r), e = e.renderState.generateStaticMarkup ? !0 : t.push("<!--/$-->"), e;
		}
		if (i.status !== 1) return i.status === 0 && (i.rootSegmentID = e.nextSegmentId++), 0 < i.completedSegments.length && e.partialBoundaries.push(i), Ke(t, e.renderState, i.rootSegmentID), r && St(r, i.fallbackState), wr(e, t, n, r), t.push("<!--/$-->");
		if (!Ar && Nn(e, i) && Tr + i.byteSize > e.progressiveChunkSize) return i.rootSegmentID = e.nextSegmentId++, e.completedBoundaries.push(i), Ke(t, e.renderState, i.rootSegmentID), wr(e, t, n, r), t.push("<!--/$-->");
		if (Tr += i.byteSize, r && St(r, i.contentState), n = i.row, n !== null && Nn(e, i) && --n.pendingTasks === 0 && Jn(e, n), e.renderState.generateStaticMarkup || t.push("<!--$-->"), n = i.completedSegments, n.length !== 1) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
		return Er(e, t, n[0], r), e = e.renderState.generateStaticMarkup ? !0 : t.push("<!--/$-->"), e;
	}
	function Dr(e, t, n, r) {
		return qe(t, e.renderState, n.parentFormatContext, n.id), Er(e, t, n, r), Je(t, n.parentFormatContext);
	}
	function Or(e, t, n) {
		Tr = n.byteSize;
		for (var r = n.completedSegments, i = 0; i < r.length; i++) kr(e, t, n, r[i]);
		r.length = 0, r = n.row, r !== null && Nn(e, n) && --r.pendingTasks === 0 && Jn(e, r), tt(t, n.contentState, e.renderState), r = e.resumableState, e = e.renderState, i = n.rootSegmentID, n = n.contentState;
		var a = e.stylesToHoist;
		return e.stylesToHoist = !1, t.push(e.startInlineScript), t.push(">"), a ? (!(r.instructions & 4) && (r.instructions |= 4, t.push("$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data=\"$!\",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};")), !(r.instructions & 2) && (r.instructions |= 2, t.push("$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if(\"/$\"===d||\"/&\"===d)if(0===h)break;else h--;else\"$\"!==d&&\"$?\"!==d&&\"$~\"!==d&&\"$!\"!==d&&\"&\"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data=\"$\";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data=\"$~\",$RB.push(a,b),2===$RB.length&&(\"number\"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};")), r.instructions & 8 ? t.push("$RR(\"") : (r.instructions |= 8, t.push("$RM=new Map;$RR=function(n,w,p){function u(q){this._p=null;q()}for(var r=new Map,t=document,h,b,e=t.querySelectorAll(\"link[data-precedence],style[data-precedence]\"),v=[],k=0;b=e[k++];)\"not all\"===b.getAttribute(\"media\")?v.push(b):(\"LINK\"===b.tagName&&$RM.set(b.getAttribute(\"href\"),b),r.set(b.dataset.precedence,h=b));e=0;b=[];var l,a;for(k=!0;;){if(k){var f=p[e++];if(!f){k=!1;e=0;continue}var c=!1,m=0;var d=f[m++];if(a=$RM.get(d)){var g=a._p;c=!0}else{a=t.createElement(\"link\");a.href=d;a.rel=\n\"stylesheet\";for(a.dataset.precedence=l=f[m++];g=f[m++];)a.setAttribute(g,f[m++]);g=a._p=new Promise(function(q,x){a.onload=u.bind(a,q);a.onerror=u.bind(a,x)});$RM.set(d,a)}d=a.getAttribute(\"media\");!g||d&&!matchMedia(d).matches||b.push(g);if(c)continue}else{a=v[e++];if(!a)break;l=a.getAttribute(\"data-precedence\");a.removeAttribute(\"media\")}c=r.get(l)||h;c===h&&(h=a);r.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=t.head,c.insertBefore(a,c.firstChild))}if(p=document.getElementById(n))p.previousSibling.data=\n\"$~\";Promise.all(b).then($RC.bind(null,n,w),$RX.bind(null,n,\"CSS failed to load\"))};$RR(\""))) : (!(r.instructions & 2) && (r.instructions |= 2, t.push("$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if(\"/$\"===d||\"/&\"===d)if(0===h)break;else h--;else\"$\"!==d&&\"$?\"!==d&&\"$~\"!==d&&\"$!\"!==d&&\"&\"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data=\"$\";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data=\"$~\",$RB.push(a,b),2===$RB.length&&(\"number\"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};")), t.push("$RC(\"")), r = i.toString(16), t.push(e.boundaryPrefix), t.push(r), t.push("\",\""), t.push(e.segmentPrefix), t.push(r), a ? (t.push("\","), ot(t, n)) : t.push("\""), n = t.push(")<\/script>"), Ge(t, e) && n;
	}
	function kr(e, t, n, r) {
		if (r.status === 2) return !0;
		var i = n.contentState, a = r.id;
		if (a === -1) {
			if ((r.id = n.rootSegmentID) === -1) throw Error("A root segment ID must have been assigned by now. This is a bug in React.");
			return Dr(e, t, r, i);
		}
		return a === n.rootSegmentID ? Dr(e, t, r, i) : (Dr(e, t, r, i), n = e.resumableState, e = e.renderState, t.push(e.startInlineScript), t.push(">"), n.instructions & 1 ? t.push("$RS(\"") : (n.instructions |= 1, t.push("$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS(\"")), t.push(e.segmentPrefix), a = a.toString(16), t.push(a), t.push("\",\""), t.push(e.placeholderPrefix), t.push(a), t = t.push("\")<\/script>"), t);
	}
	var Ar = !1;
	function jr(e, t) {
		try {
			if (!(0 < e.pendingRootTasks)) {
				var n, r = e.completedRootSegment;
				if (r !== null) {
					if (r.status === 5) return;
					var i = e.completedPreambleSegments;
					if (i === null) return;
					Tr = e.byteSize;
					var a = e.resumableState, o = e.renderState, s = o.preamble, c = s.htmlChunks, l = s.headChunks, u;
					if (c) {
						for (u = 0; u < c.length; u++) t.push(c[u]);
						if (l) for (u = 0; u < l.length; u++) t.push(l[u]);
						else {
							var d = Be("head");
							t.push(d), t.push(">");
						}
					} else if (l) for (u = 0; u < l.length; u++) t.push(l[u]);
					var f = o.charsetChunks;
					for (u = 0; u < f.length; u++) t.push(f[u]);
					f.length = 0, o.preconnects.forEach(R, t), o.preconnects.clear();
					var p = o.viewportChunks;
					for (u = 0; u < p.length; u++) t.push(p[u]);
					p.length = 0, o.fontPreloads.forEach(R, t), o.fontPreloads.clear(), o.highImagePreloads.forEach(R, t), o.highImagePreloads.clear(), le = o, o.styles.forEach(rt, t), le = null;
					var m = o.importMapChunks;
					for (u = 0; u < m.length; u++) t.push(m[u]);
					m.length = 0, o.bootstrapScripts.forEach(R, t), o.scripts.forEach(R, t), o.scripts.clear(), o.bulkPreloads.forEach(R, t), o.bulkPreloads.clear(), a.instructions |= 32;
					var h = o.hoistableChunks;
					for (u = 0; u < h.length; u++) t.push(h[u]);
					for (a = h.length = 0; a < i.length; a++) {
						var g = i[a];
						for (o = 0; o < g.length; o++) Er(e, t, g[o], null);
					}
					var _ = e.renderState.preamble, v = _.headChunks;
					if (_.htmlChunks || v) {
						var ee = Ue("head");
						t.push(ee);
					}
					var y = _.bodyChunks;
					if (y) for (i = 0; i < y.length; i++) t.push(y[i]);
					Er(e, t, r, null), e.completedRootSegment = null;
					var te = e.renderState;
					if (e.allPendingTasks !== 0 || e.clientRenderedBoundaries.length !== 0 || e.completedBoundaries.length !== 0 || e.trackedPostpones !== null && (e.trackedPostpones.rootNodes.length !== 0 || e.trackedPostpones.rootSlots !== null)) {
						var b = e.resumableState;
						if (!(b.instructions & 64)) {
							if (b.instructions |= 64, t.push(te.startInlineScript), !(b.instructions & 32)) {
								b.instructions |= 32;
								var x = "_" + b.idPrefix + "R_";
								t.push(" id=\"");
								var S = k(x);
								t.push(S), t.push("\"");
							}
							t.push(">"), t.push("requestAnimationFrame(function(){$RT=performance.now()});"), t.push("<\/script>");
						}
					}
					Ge(t, te);
				}
				var C = e.renderState;
				r = 0;
				var ne = C.viewportChunks;
				for (r = 0; r < ne.length; r++) t.push(ne[r]);
				ne.length = 0, C.preconnects.forEach(R, t), C.preconnects.clear(), C.fontPreloads.forEach(R, t), C.fontPreloads.clear(), C.highImagePreloads.forEach(R, t), C.highImagePreloads.clear(), C.styles.forEach(at, t), C.scripts.forEach(R, t), C.scripts.clear(), C.bulkPreloads.forEach(R, t), C.bulkPreloads.clear();
				var w = C.hoistableChunks;
				for (r = 0; r < w.length; r++) t.push(w[r]);
				w.length = 0;
				var T = e.clientRenderedBoundaries;
				for (n = 0; n < T.length; n++) {
					var re = T[n];
					C = t;
					var E = e.resumableState, D = e.renderState, O = re.rootSegmentID, A = re.errorDigest;
					C.push(D.startInlineScript), C.push(">"), E.instructions & 4 ? C.push("$RX(\"") : (E.instructions |= 4, C.push("$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data=\"$!\",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};;$RX(\"")), C.push(D.boundaryPrefix);
					var j = O.toString(16);
					if (C.push(j), C.push("\""), A) {
						C.push(",");
						var ie = Xe(A || "");
						C.push(ie);
					}
					var ae = C.push(")<\/script>");
					if (!ae) {
						e.destination = null, n++, T.splice(0, n);
						return;
					}
				}
				T.splice(0, n);
				var M = e.completedBoundaries;
				for (n = 0; n < M.length; n++) if (!Or(e, t, M[n])) {
					e.destination = null, n++, M.splice(0, n);
					return;
				}
				M.splice(0, n), Ar = !0;
				var oe = e.partialBoundaries;
				for (n = 0; n < oe.length; n++) {
					var se = oe[n];
					a: {
						T = e, re = t, Tr = se.byteSize;
						var N = se.completedSegments;
						for (ae = 0; ae < N.length; ae++) if (!kr(T, re, se, N[ae])) {
							ae++, N.splice(0, ae);
							var ce = !1;
							break a;
						}
						N.splice(0, ae);
						var ue = se.row;
						ue !== null && ue.together && se.pendingTasks === 1 && (ue.pendingTasks === 1 ? Yn(T, ue, ue.hoistables) : ue.pendingTasks--), ce = tt(re, se.contentState, T.renderState);
					}
					if (!ce) {
						e.destination = null, n++, oe.splice(0, n);
						return;
					}
				}
				oe.splice(0, n), Ar = !1;
				var de = e.completedBoundaries;
				for (n = 0; n < de.length; n++) if (!Or(e, t, de[n])) {
					e.destination = null, n++, de.splice(0, n);
					return;
				}
				de.splice(0, n);
			}
		} finally {
			Ar = !1, e.allPendingTasks === 0 && e.clientRenderedBoundaries.length === 0 && e.completedBoundaries.length === 0 && (e.flushScheduled = !1, n = e.resumableState, n.hasBody && (oe = Ue("body"), t.push(oe)), n.hasHtml && (n = Ue("html"), t.push(n)), e.status = 14, t.push(null), e.destination = null);
		}
	}
	function Mr(e) {
		if (!1 === e.flushScheduled && e.pingedTasks.length === 0 && e.destination !== null) {
			e.flushScheduled = !0;
			var t = e.destination;
			t ? jr(e, t) : e.flushScheduled = !1;
		}
	}
	function Nr(e, t) {
		if (e.status === 13) e.status = 14, t.destroy(e.fatalError);
		else if (e.status !== 14 && e.destination === null) {
			e.destination = t;
			try {
				jr(e, t);
			} catch (t) {
				Kn(e, t, {}), qn(e, t);
			}
		}
	}
	function Pr(e, t) {
		(e.status === 11 || e.status === 10) && (e.status = 12);
		try {
			var n = e.abortableTasks;
			if (0 < n.size) {
				var r = t === void 0 ? Error("The render was aborted by the server without a reason.") : typeof t == "object" && t && typeof t.then == "function" ? Error("The render was aborted by the server with a promise.") : t;
				e.fatalError = r, n.forEach(function(t) {
					return mr(t, e, r);
				}), n.clear();
			}
			e.destination !== null && jr(e, e.destination);
		} catch (t) {
			Kn(e, t, {}), qn(e, t);
		}
	}
	function Fr(e, t, n) {
		if (t === null) n.rootNodes.push(e);
		else {
			var r = n.workingMap, i = r.get(t);
			i === void 0 && (i = [
				t[1],
				t[2],
				[],
				null
			], r.set(t, i), Fr(i, t[0], n)), i[2].push(e);
		}
	}
	function Ir() {}
	function Lr(e, t, n, r) {
		var i = !1, a = null, o = "", s = !1;
		if (t = fe(t ? t.identifierPrefix : void 0), e = In(e, t, Ct(t, n), pe(0, null, 0, null), Infinity, Ir, void 0, function() {
			s = !0;
		}, void 0, void 0, void 0), e.flushScheduled = e.destination !== null, br(e), e.status === 10 && (e.status = 11), e.trackedPostpones === null && hr(e, e.pendingRootTasks === 0), Pr(e, r), Nr(e, {
			push: function(e) {
				return e !== null && (o += e), !0;
			},
			destroy: function(e) {
				i = !0, a = e;
			}
		}), i && a !== r) throw a;
		if (!s) throw Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
		return o;
	}
	e.renderToStaticMarkup = function(e, t) {
		return Lr(e, t, !0, "The server used \"renderToStaticMarkup\" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to \"renderToPipeableStream\" which supports Suspense on the server");
	}, e.renderToString = function(e, t) {
		return Lr(e, t, !1, "The server used \"renderToString\" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to \"renderToPipeableStream\" which supports Suspense on the server");
	}, e.version = "19.2.0";
})), Mv = /* @__PURE__ */ p(((e) => {
	var t = g("util"), n = g("crypto"), r = g("async_hooks"), i = Te(), a = Av(), o = g("stream"), s = Symbol.for("react.transitional.element"), c = Symbol.for("react.portal"), l = Symbol.for("react.fragment"), u = Symbol.for("react.strict_mode"), d = Symbol.for("react.profiler"), f = Symbol.for("react.consumer"), p = Symbol.for("react.context"), m = Symbol.for("react.forward_ref"), h = Symbol.for("react.suspense"), _ = Symbol.for("react.suspense_list"), v = Symbol.for("react.memo"), ee = Symbol.for("react.lazy"), y = Symbol.for("react.scope"), te = Symbol.for("react.activity"), b = Symbol.for("react.legacy_hidden"), x = Symbol.for("react.memo_cache_sentinel"), S = Symbol.for("react.view_transition"), C = Symbol.iterator;
	function ne(e) {
		return typeof e != "object" || !e ? null : (e = C && e[C] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var w = Array.isArray, T = queueMicrotask;
	function re(e) {
		typeof e.flush == "function" && e.flush();
	}
	var E = null, D = 0, O = !0;
	function k(e, t) {
		if (typeof t == "string") {
			if (t.length !== 0) if (2048 < 3 * t.length) 0 < D && (A(e, E.subarray(0, D)), E = new Uint8Array(2048), D = 0), A(e, t);
			else {
				var n = E;
				0 < D && (n = E.subarray(D)), n = ae.encodeInto(t, n);
				var r = n.read;
				D += n.written, r < t.length && (A(e, E.subarray(0, D)), E = new Uint8Array(2048), D = ae.encodeInto(t.slice(r), E).written), D === 2048 && (A(e, E), E = new Uint8Array(2048), D = 0);
			}
		} else t.byteLength !== 0 && (2048 < t.byteLength ? (0 < D && (A(e, E.subarray(0, D)), E = new Uint8Array(2048), D = 0), A(e, t)) : (n = E.length - D, n < t.byteLength && (n === 0 ? A(e, E) : (E.set(t.subarray(0, n), D), D += n, A(e, E), t = t.subarray(n)), E = new Uint8Array(2048), D = 0), E.set(t, D), D += t.byteLength, D === 2048 && (A(e, E), E = new Uint8Array(2048), D = 0)));
	}
	function A(e, t) {
		e = e.write(t), O &&= e;
	}
	function j(e, t) {
		return k(e, t), O;
	}
	function ie(e) {
		E && 0 < D && e.write(E.subarray(0, D)), E = null, D = 0, O = !0;
	}
	var ae = new t.TextEncoder();
	function M(e) {
		return ae.encode(e);
	}
	function oe(e) {
		return typeof e == "string" ? Buffer.byteLength(e, "utf8") : e.byteLength;
	}
	var se = Object.assign, N = Object.prototype.hasOwnProperty, ce = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), le = {}, ue = {};
	function de(e) {
		return N.call(ue, e) ? !0 : N.call(le, e) ? !1 : ce.test(e) ? ue[e] = !0 : (le[e] = !0, !1);
	}
	var fe = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" ")), pe = new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), me = /["'&<>]/;
	function P(e) {
		if (typeof e == "boolean" || typeof e == "number" || typeof e == "bigint") return "" + e;
		e = "" + e;
		var t = me.exec(e);
		if (t) {
			var n = "", r, i = 0;
			for (r = t.index; r < e.length; r++) {
				switch (e.charCodeAt(r)) {
					case 34:
						t = "&quot;";
						break;
					case 38:
						t = "&amp;";
						break;
					case 39:
						t = "&#x27;";
						break;
					case 60:
						t = "&lt;";
						break;
					case 62:
						t = "&gt;";
						break;
					default: continue;
				}
				i !== r && (n += e.slice(i, r)), i = r + 1, n += t;
			}
			e = i === r ? n : n + e.slice(i, r);
		}
		return e;
	}
	var he = /([A-Z])/g, ge = /^ms-/, _e = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function ve(e) {
		return _e.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	var ye = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, be = a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, xe = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, Se = be.d;
	be.d = {
		f: Se.f,
		r: Se.r,
		D: mr,
		C: hr,
		L: gr,
		m: _r,
		X: yr,
		S: vr,
		M: br
	};
	var Ce = [], we = null;
	M("\"></template>");
	var Ee = M("<script"), F = M("<\/script>"), De = M("<script src=\""), Oe = M("<script type=\"module\" src=\""), ke = M(" nonce=\""), Ae = M(" integrity=\""), je = M(" crossorigin=\""), Me = M(" async=\"\"><\/script>"), Ne = M("<style"), Pe = /(<\/|<)(s)(cript)/gi;
	function Fe(e, t, n, r) {
		return "" + t + (n === "s" ? "\\u0073" : "\\u0053") + r;
	}
	var Ie = M("<script type=\"importmap\">"), Le = M("<\/script>");
	function Re(e, t, n, r, i, a) {
		n = typeof t == "string" ? t : t && t.script;
		var o = n === void 0 ? Ee : M("<script nonce=\"" + P(n) + "\""), s = typeof t == "string" ? void 0 : t && t.style, c = s === void 0 ? Ne : M("<style nonce=\"" + P(s) + "\""), l = e.idPrefix, u = [], d = e.bootstrapScriptContent, f = e.bootstrapScripts, p = e.bootstrapModules;
		if (d !== void 0 && (u.push(o), or(u, e), u.push(st, ("" + d).replace(Pe, Fe), F)), d = [], r !== void 0 && (d.push(Ie), d.push(("" + JSON.stringify(r)).replace(Pe, Fe)), d.push(Le)), r = i ? {
			preconnects: "",
			fontPreloads: "",
			highImagePreloads: "",
			remainingCapacity: 2 + (typeof a == "number" ? a : 2e3)
		} : null, i = {
			placeholderPrefix: M(l + "P:"),
			segmentPrefix: M(l + "S:"),
			boundaryPrefix: M(l + "B:"),
			startInlineScript: o,
			startInlineStyle: c,
			preamble: Be(),
			externalRuntimeScript: null,
			bootstrapChunks: u,
			importMapChunks: d,
			onHeaders: i,
			headers: r,
			resets: {
				font: {},
				dns: {},
				connect: {
					default: {},
					anonymous: {},
					credentials: {}
				},
				image: {},
				style: {}
			},
			charsetChunks: [],
			viewportChunks: [],
			hoistableChunks: [],
			preconnects: /* @__PURE__ */ new Set(),
			fontPreloads: /* @__PURE__ */ new Set(),
			highImagePreloads: /* @__PURE__ */ new Set(),
			styles: /* @__PURE__ */ new Map(),
			bootstrapScripts: /* @__PURE__ */ new Set(),
			scripts: /* @__PURE__ */ new Set(),
			bulkPreloads: /* @__PURE__ */ new Set(),
			preloads: {
				images: /* @__PURE__ */ new Map(),
				stylesheets: /* @__PURE__ */ new Map(),
				scripts: /* @__PURE__ */ new Map(),
				moduleScripts: /* @__PURE__ */ new Map()
			},
			nonce: {
				script: n,
				style: s
			},
			hoistableState: null,
			stylesToHoist: !1
		}, f !== void 0) for (r = 0; r < f.length; r++) l = f[r], s = o = void 0, c = {
			rel: "preload",
			as: "script",
			fetchPriority: "low",
			nonce: t
		}, typeof l == "string" ? c.href = a = l : (c.href = a = l.src, c.integrity = s = typeof l.integrity == "string" ? l.integrity : void 0, c.crossOrigin = o = typeof l == "string" || l.crossOrigin == null ? void 0 : l.crossOrigin === "use-credentials" ? "use-credentials" : ""), l = e, d = a, l.scriptResources[d] = null, l.moduleScriptResources[d] = null, l = [], gt(l, c), i.bootstrapScripts.add(l), u.push(De, P(a), L), n && u.push(ke, P(n), L), typeof s == "string" && u.push(Ae, P(s), L), typeof o == "string" && u.push(je, P(o), L), or(u, e), u.push(Me);
		if (p !== void 0) for (t = 0; t < p.length; t++) s = p[t], a = r = void 0, o = {
			rel: "modulepreload",
			fetchPriority: "low",
			nonce: n
		}, typeof s == "string" ? o.href = f = s : (o.href = f = s.src, o.integrity = a = typeof s.integrity == "string" ? s.integrity : void 0, o.crossOrigin = r = typeof s == "string" || s.crossOrigin == null ? void 0 : s.crossOrigin === "use-credentials" ? "use-credentials" : ""), s = e, c = f, s.scriptResources[c] = null, s.moduleScriptResources[c] = null, s = [], gt(s, o), i.bootstrapScripts.add(s), u.push(Oe, P(f), L), n && u.push(ke, P(n), L), typeof a == "string" && u.push(Ae, P(a), L), typeof r == "string" && u.push(je, P(r), L), or(u, e), u.push(Me);
		return i;
	}
	function ze(e, t, n, r, i) {
		return {
			idPrefix: e === void 0 ? "" : e,
			nextFormID: 0,
			streamingFormat: 0,
			bootstrapScriptContent: n,
			bootstrapScripts: r,
			bootstrapModules: i,
			instructions: 0,
			hasBody: !1,
			hasHtml: !1,
			unknownResources: {},
			dnsResources: {},
			connectResources: {
				default: {},
				anonymous: {},
				credentials: {}
			},
			imageResources: {},
			styleResources: {},
			scriptResources: {},
			moduleUnknownResources: {},
			moduleScriptResources: {}
		};
	}
	function Be() {
		return {
			htmlChunks: null,
			headChunks: null,
			bodyChunks: null
		};
	}
	function Ve(e, t, n, r) {
		return {
			insertionMode: e,
			selectedValue: t,
			tagScope: n,
			viewTransition: r
		};
	}
	function He(e) {
		return Ve(e === "http://www.w3.org/2000/svg" ? 4 : e === "http://www.w3.org/1998/Math/MathML" ? 5 : 0, null, 0, null);
	}
	function Ue(e, t, n) {
		var r = e.tagScope & -25;
		switch (t) {
			case "noscript": return Ve(2, null, r | 1, null);
			case "select": return Ve(2, n.value == null ? n.defaultValue : n.value, r, null);
			case "svg": return Ve(4, null, r, null);
			case "picture": return Ve(2, null, r | 2, null);
			case "math": return Ve(5, null, r, null);
			case "foreignObject": return Ve(2, null, r, null);
			case "table": return Ve(6, null, r, null);
			case "thead":
			case "tbody":
			case "tfoot": return Ve(7, null, r, null);
			case "colgroup": return Ve(9, null, r, null);
			case "tr": return Ve(8, null, r, null);
			case "head":
				if (2 > e.insertionMode) return Ve(3, null, r, null);
				break;
			case "html": if (e.insertionMode === 0) return Ve(1, null, r, null);
		}
		return 6 <= e.insertionMode || 2 > e.insertionMode ? Ve(2, null, r, null) : e.tagScope === r ? e : Ve(e.insertionMode, e.selectedValue, r, null);
	}
	function We(e) {
		return e === null ? null : {
			update: e.update,
			enter: "none",
			exit: "none",
			share: e.update,
			name: e.autoName,
			autoName: e.autoName,
			nameIdx: 0
		};
	}
	function Ge(e, t) {
		return t.tagScope & 32 && (e.instructions |= 128), Ve(t.insertionMode, t.selectedValue, t.tagScope | 12, We(t.viewTransition));
	}
	function Ke(e, t) {
		e = We(t.viewTransition);
		var n = t.tagScope | 16;
		return e !== null && e.share !== "none" && (n |= 64), Ve(t.insertionMode, t.selectedValue, n, e);
	}
	var qe = M("<!-- -->");
	function Je(e, t, n, r) {
		return t === "" ? r : (r && e.push(qe), e.push(P(t)), !0);
	}
	var Ye = /* @__PURE__ */ new Map(), Xe = M(" style=\""), Ze = M(":"), Qe = M(";");
	function $e(e, t) {
		if (typeof t != "object") throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
		var n = !0, r;
		for (r in t) if (N.call(t, r)) {
			var i = t[r];
			if (i != null && typeof i != "boolean" && i !== "") {
				if (r.indexOf("--") === 0) {
					var a = P(r);
					i = P(("" + i).trim());
				} else a = Ye.get(r), a === void 0 && (a = M(P(r.replace(he, "-$1").toLowerCase().replace(ge, "-ms-"))), Ye.set(r, a)), i = typeof i == "number" ? i === 0 || fe.has(r) ? "" + i : i + "px" : P(("" + i).trim());
				n ? (n = !1, e.push(Xe, a, Ze, i)) : e.push(Qe, a, Ze, i);
			}
		}
		n || e.push(L);
	}
	var I = M(" "), et = M("=\""), L = M("\""), tt = M("=\"\"");
	function R(e, t, n) {
		n && typeof n != "function" && typeof n != "symbol" && e.push(I, t, tt);
	}
	function z(e, t, n) {
		typeof n != "function" && typeof n != "symbol" && typeof n != "boolean" && e.push(I, t, et, P(n), L);
	}
	var nt = M(P("javascript:throw new Error('React form unexpectedly submitted.')")), rt = M("<input type=\"hidden\"");
	function it(e, t) {
		this.push(rt), at(e), z(this, "name", t), z(this, "value", e), this.push(ct);
	}
	function at(e) {
		if (typeof e != "string") throw Error("File/Blob fields are not yet supported in progressive forms. Will fallback to client hydration.");
	}
	function B(e, t) {
		if (typeof t.$$FORM_ACTION == "function") {
			var n = e.nextFormID++;
			e = e.idPrefix + n;
			try {
				var r = t.$$FORM_ACTION(e);
				return r && r.data?.forEach(at), r;
			} catch (e) {
				if (typeof e == "object" && e && typeof e.then == "function") throw e;
			}
		}
		return null;
	}
	function ot(e, t, n, r, i, a, o, s) {
		var c = null;
		if (typeof r == "function") {
			var l = B(t, r);
			l === null ? (e.push(I, "formAction", et, nt, L), o = a = i = r = s = null, pt(t, n)) : (s = l.name, r = l.action || "", i = l.encType, a = l.method, o = l.target, c = l.data);
		}
		return s != null && V(e, "name", s), r != null && V(e, "formAction", r), i != null && V(e, "formEncType", i), a != null && V(e, "formMethod", a), o != null && V(e, "formTarget", o), c;
	}
	function V(e, t, n) {
		switch (t) {
			case "className":
				z(e, "class", n);
				break;
			case "tabIndex":
				z(e, "tabindex", n);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				z(e, t, n);
				break;
			case "style":
				$e(e, n);
				break;
			case "src":
			case "href": if (n === "") break;
			case "action":
			case "formAction":
				if (n == null || typeof n == "function" || typeof n == "symbol" || typeof n == "boolean") break;
				n = ve("" + n), e.push(I, t, et, P(n), L);
				break;
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "ref": break;
			case "autoFocus":
			case "multiple":
			case "muted":
				R(e, t.toLowerCase(), n);
				break;
			case "xlinkHref":
				if (typeof n == "function" || typeof n == "symbol" || typeof n == "boolean") break;
				n = ve("" + n), e.push(I, "xlink:href", et, P(n), L);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				typeof n != "function" && typeof n != "symbol" && e.push(I, t, et, P(n), L);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				n && typeof n != "function" && typeof n != "symbol" && e.push(I, t, tt);
				break;
			case "capture":
			case "download":
				!0 === n ? e.push(I, t, tt) : !1 !== n && typeof n != "function" && typeof n != "symbol" && e.push(I, t, et, P(n), L);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				typeof n != "function" && typeof n != "symbol" && !isNaN(n) && 1 <= n && e.push(I, t, et, P(n), L);
				break;
			case "rowSpan":
			case "start":
				typeof n == "function" || typeof n == "symbol" || isNaN(n) || e.push(I, t, et, P(n), L);
				break;
			case "xlinkActuate":
				z(e, "xlink:actuate", n);
				break;
			case "xlinkArcrole":
				z(e, "xlink:arcrole", n);
				break;
			case "xlinkRole":
				z(e, "xlink:role", n);
				break;
			case "xlinkShow":
				z(e, "xlink:show", n);
				break;
			case "xlinkTitle":
				z(e, "xlink:title", n);
				break;
			case "xlinkType":
				z(e, "xlink:type", n);
				break;
			case "xmlBase":
				z(e, "xml:base", n);
				break;
			case "xmlLang":
				z(e, "xml:lang", n);
				break;
			case "xmlSpace":
				z(e, "xml:space", n);
				break;
			default: if ((!(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (t = pe.get(t) || t, de(t))) {
				switch (typeof n) {
					case "function":
					case "symbol": return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") return;
				}
				e.push(I, t, et, P(n), L);
			}
		}
	}
	var st = M(">"), ct = M("/>");
	function lt(e, t, n) {
		if (t != null) {
			if (n != null) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
			if (typeof t != "object" || !("__html" in t)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information.");
			t = t.__html, t != null && e.push("" + t);
		}
	}
	function ut(e) {
		var t = "";
		return i.Children.forEach(e, function(e) {
			e != null && (t += e);
		}), t;
	}
	var dt = M(" selected=\"\""), ft = M("addEventListener(\"submit\",function(a){if(!a.defaultPrevented){var c=a.target,d=a.submitter,e=c.action,b=d;if(d){var f=d.getAttribute(\"formAction\");null!=f&&(e=f,b=null)}\"javascript:throw new Error('React form unexpectedly submitted.')\"===e&&(a.preventDefault(),b?(a=document.createElement(\"input\"),a.name=b.name,a.value=b.value,b.parentNode.insertBefore(a,b),b=new FormData(c),a.parentNode.removeChild(a)):b=new FormData(c),a=c.ownerDocument||c,(a.$$reactFormReplay=a.$$reactFormReplay||[]).push(c,d,b))}});");
	function pt(e, t) {
		if (!(e.instructions & 16)) {
			e.instructions |= 16;
			var n = t.preamble, r = t.bootstrapChunks;
			(n.htmlChunks || n.headChunks) && r.length === 0 ? (r.push(t.startInlineScript), or(r, e), r.push(st, ft, F)) : r.unshift(t.startInlineScript, st, ft, F);
		}
	}
	var mt = M("<!--F!-->"), ht = M("<!--F-->");
	function gt(e, t) {
		for (var n in e.push(kt("link")), t) if (N.call(t, n)) {
			var r = t[n];
			if (r != null) switch (n) {
				case "children":
				case "dangerouslySetInnerHTML": throw Error("link is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
				default: V(e, n, r);
			}
		}
		return e.push(ct), null;
	}
	var H = /(<\/|<)(s)(tyle)/gi;
	function _t(e, t, n, r) {
		return "" + t + (n === "s" ? "\\73 " : "\\53 ") + r;
	}
	function vt(e, t, n) {
		for (var r in e.push(kt(n)), t) if (N.call(t, r)) {
			var i = t[r];
			if (i != null) switch (r) {
				case "children":
				case "dangerouslySetInnerHTML": throw Error(n + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
				default: V(e, r, i);
			}
		}
		return e.push(ct), null;
	}
	function yt(e, t) {
		e.push(kt("title"));
		var n = null, r = null, i;
		for (i in t) if (N.call(t, i)) {
			var a = t[i];
			if (a != null) switch (i) {
				case "children":
					n = a;
					break;
				case "dangerouslySetInnerHTML":
					r = a;
					break;
				default: V(e, i, a);
			}
		}
		return e.push(st), t = Array.isArray(n) ? 2 > n.length ? n[0] : null : n, typeof t != "function" && typeof t != "symbol" && t != null && e.push(P("" + t)), lt(e, r, n), e.push(Nt("title")), null;
	}
	var bt = M("<!--head-->"), xt = M("<!--body-->"), St = M("<!--html-->");
	function Ct(e, t) {
		e.push(kt("script"));
		var n = null, r = null, i;
		for (i in t) if (N.call(t, i)) {
			var a = t[i];
			if (a != null) switch (i) {
				case "children":
					n = a;
					break;
				case "dangerouslySetInnerHTML":
					r = a;
					break;
				default: V(e, i, a);
			}
		}
		return e.push(st), lt(e, r, n), typeof n == "string" && e.push(("" + n).replace(Pe, Fe)), e.push(Nt("script")), null;
	}
	function wt(e, t, n) {
		e.push(kt(n));
		var r = n = null, i;
		for (i in t) if (N.call(t, i)) {
			var a = t[i];
			if (a != null) switch (i) {
				case "children":
					n = a;
					break;
				case "dangerouslySetInnerHTML":
					r = a;
					break;
				default: V(e, i, a);
			}
		}
		return e.push(st), lt(e, r, n), n;
	}
	function Tt(e, t, n) {
		e.push(kt(n));
		var r = n = null, i;
		for (i in t) if (N.call(t, i)) {
			var a = t[i];
			if (a != null) switch (i) {
				case "children":
					n = a;
					break;
				case "dangerouslySetInnerHTML":
					r = a;
					break;
				default: V(e, i, a);
			}
		}
		return e.push(st), lt(e, r, n), typeof n == "string" ? (e.push(P(n)), null) : n;
	}
	var Et = M("\n"), Dt = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, Ot = /* @__PURE__ */ new Map();
	function kt(e) {
		var t = Ot.get(e);
		if (t === void 0) {
			if (!Dt.test(e)) throw Error("Invalid tag: " + e);
			t = M("<" + e), Ot.set(e, t);
		}
		return t;
	}
	var At = M("<!DOCTYPE html>");
	function jt(e, t, n, r, i, a, o, s, c) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path": break;
			case "a":
				e.push(kt("a"));
				var l = null, u = null, d;
				for (d in n) if (N.call(n, d)) {
					var f = n[d];
					if (f != null) switch (d) {
						case "children":
							l = f;
							break;
						case "dangerouslySetInnerHTML":
							u = f;
							break;
						case "href":
							f === "" ? z(e, "href", "") : V(e, d, f);
							break;
						default: V(e, d, f);
					}
				}
				if (e.push(st), lt(e, u, l), typeof l == "string") {
					e.push(P(l));
					var p = null;
				} else p = l;
				return p;
			case "g":
			case "p":
			case "li": break;
			case "select":
				e.push(kt("select"));
				var m = null, h = null, g;
				for (g in n) if (N.call(n, g)) {
					var _ = n[g];
					if (_ != null) switch (g) {
						case "children":
							m = _;
							break;
						case "dangerouslySetInnerHTML":
							h = _;
							break;
						case "defaultValue":
						case "value": break;
						default: V(e, g, _);
					}
				}
				return e.push(st), lt(e, h, m), m;
			case "option":
				var v = s.selectedValue;
				e.push(kt("option"));
				var ee = null, y = null, te = null, b = null, x;
				for (x in n) if (N.call(n, x)) {
					var S = n[x];
					if (S != null) switch (x) {
						case "children":
							ee = S;
							break;
						case "selected":
							te = S;
							break;
						case "dangerouslySetInnerHTML":
							b = S;
							break;
						case "value": y = S;
						default: V(e, x, S);
					}
				}
				if (v != null) {
					var C = y === null ? ut(ee) : "" + y;
					if (w(v)) {
						for (var ne = 0; ne < v.length; ne++) if ("" + v[ne] === C) {
							e.push(dt);
							break;
						}
					} else "" + v === C && e.push(dt);
				} else te && e.push(dt);
				return e.push(st), lt(e, b, ee), ee;
			case "textarea":
				e.push(kt("textarea"));
				var T = null, re = null, E = null, D;
				for (D in n) if (N.call(n, D)) {
					var O = n[D];
					if (O != null) switch (D) {
						case "children":
							E = O;
							break;
						case "value":
							T = O;
							break;
						case "defaultValue":
							re = O;
							break;
						case "dangerouslySetInnerHTML": throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
						default: V(e, D, O);
					}
				}
				if (T === null && re !== null && (T = re), e.push(st), E != null) {
					if (T != null) throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
					if (w(E)) {
						if (1 < E.length) throw Error("<textarea> can only have at most one child.");
						T = "" + E[0];
					}
					T = "" + E;
				}
				return typeof T == "string" && T[0] === "\n" && e.push(Et), T !== null && e.push(P("" + T)), null;
			case "input":
				e.push(kt("input"));
				var k = null, A = null, j = null, ie = null, ae = null, M = null, oe = null, ce = null, le = null, ue;
				for (ue in n) if (N.call(n, ue)) {
					var fe = n[ue];
					if (fe != null) switch (ue) {
						case "children":
						case "dangerouslySetInnerHTML": throw Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
						case "name":
							k = fe;
							break;
						case "formAction":
							A = fe;
							break;
						case "formEncType":
							j = fe;
							break;
						case "formMethod":
							ie = fe;
							break;
						case "formTarget":
							ae = fe;
							break;
						case "defaultChecked":
							le = fe;
							break;
						case "defaultValue":
							oe = fe;
							break;
						case "checked":
							ce = fe;
							break;
						case "value":
							M = fe;
							break;
						default: V(e, ue, fe);
					}
				}
				var pe = ot(e, r, i, A, j, ie, ae, k);
				return ce === null ? le !== null && R(e, "checked", le) : R(e, "checked", ce), M === null ? oe !== null && V(e, "value", oe) : V(e, "value", M), e.push(ct), pe?.forEach(it, e), null;
			case "button":
				e.push(kt("button"));
				var me = null, he = null, ge = null, _e = null, ye = null, be = null, xe = null, Se;
				for (Se in n) if (N.call(n, Se)) {
					var we = n[Se];
					if (we != null) switch (Se) {
						case "children":
							me = we;
							break;
						case "dangerouslySetInnerHTML":
							he = we;
							break;
						case "name":
							ge = we;
							break;
						case "formAction":
							_e = we;
							break;
						case "formEncType":
							ye = we;
							break;
						case "formMethod":
							be = we;
							break;
						case "formTarget":
							xe = we;
							break;
						default: V(e, Se, we);
					}
				}
				var Te = ot(e, r, i, _e, ye, be, xe, ge);
				if (e.push(st), Te?.forEach(it, e), lt(e, he, me), typeof me == "string") {
					e.push(P(me));
					var Ee = null;
				} else Ee = me;
				return Ee;
			case "form":
				e.push(kt("form"));
				var F = null, De = null, Oe = null, ke = null, Ae = null, je = null, Me;
				for (Me in n) if (N.call(n, Me)) {
					var Ne = n[Me];
					if (Ne != null) switch (Me) {
						case "children":
							F = Ne;
							break;
						case "dangerouslySetInnerHTML":
							De = Ne;
							break;
						case "action":
							Oe = Ne;
							break;
						case "encType":
							ke = Ne;
							break;
						case "method":
							Ae = Ne;
							break;
						case "target":
							je = Ne;
							break;
						default: V(e, Me, Ne);
					}
				}
				var Pe = null, Fe = null;
				if (typeof Oe == "function") {
					var Ie = B(r, Oe);
					Ie === null ? (e.push(I, "action", et, nt, L), je = Ae = ke = Oe = null, pt(r, i)) : (Oe = Ie.action || "", ke = Ie.encType, Ae = Ie.method, je = Ie.target, Pe = Ie.data, Fe = Ie.name);
				}
				if (Oe != null && V(e, "action", Oe), ke != null && V(e, "encType", ke), Ae != null && V(e, "method", Ae), je != null && V(e, "target", je), e.push(st), Fe !== null && (e.push(rt), z(e, "name", Fe), e.push(ct), Pe?.forEach(it, e)), lt(e, De, F), typeof F == "string") {
					e.push(P(F));
					var Le = null;
				} else Le = F;
				return Le;
			case "menuitem":
				for (var Re in e.push(kt("menuitem")), n) if (N.call(n, Re)) {
					var ze = n[Re];
					if (ze != null) switch (Re) {
						case "children":
						case "dangerouslySetInnerHTML": throw Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
						default: V(e, Re, ze);
					}
				}
				return e.push(st), null;
			case "object":
				e.push(kt("object"));
				var Be = null, Ve = null, He;
				for (He in n) if (N.call(n, He)) {
					var Ue = n[He];
					if (Ue != null) switch (He) {
						case "children":
							Be = Ue;
							break;
						case "dangerouslySetInnerHTML":
							Ve = Ue;
							break;
						case "data":
							var We = ve("" + Ue);
							if (We === "") break;
							e.push(I, "data", et, P(We), L);
							break;
						default: V(e, He, Ue);
					}
				}
				if (e.push(st), lt(e, Ve, Be), typeof Be == "string") {
					e.push(P(Be));
					var Ge = null;
				} else Ge = Be;
				return Ge;
			case "title":
				var Ke = s.tagScope & 1, Je = s.tagScope & 4;
				if (s.insertionMode === 4 || Ke || n.itemProp != null) var Ye = yt(e, n);
				else Je ? Ye = null : (yt(i.hoistableChunks, n), Ye = void 0);
				return Ye;
			case "link":
				var Xe = s.tagScope & 1, Ze = s.tagScope & 4, Qe = n.rel, tt = n.href, at = n.precedence;
				if (s.insertionMode === 4 || Xe || n.itemProp != null || typeof Qe != "string" || typeof tt != "string" || tt === "") {
					gt(e, n);
					var ft = null;
				} else if (n.rel === "stylesheet") if (typeof at != "string" || n.disabled != null || n.onLoad || n.onError) ft = gt(e, n);
				else {
					var mt = i.styles.get(at), ht = r.styleResources.hasOwnProperty(tt) ? r.styleResources[tt] : void 0;
					if (ht !== null) {
						r.styleResources[tt] = null, mt || (mt = {
							precedence: P(at),
							rules: [],
							hrefs: [],
							sheets: /* @__PURE__ */ new Map()
						}, i.styles.set(at, mt));
						var Dt = {
							state: 0,
							props: se({}, n, {
								"data-precedence": n.precedence,
								precedence: null
							})
						};
						if (ht) {
							ht.length === 2 && xr(Dt.props, ht);
							var Ot = i.preloads.stylesheets.get(tt);
							Ot && 0 < Ot.length ? Ot.length = 0 : Dt.state = 1;
						}
						mt.sheets.set(tt, Dt), o && o.stylesheets.add(Dt);
					} else if (mt) {
						var jt = mt.sheets.get(tt);
						jt && o && o.stylesheets.add(jt);
					}
					c && e.push(qe), ft = null;
				}
				else n.onLoad || n.onError ? ft = gt(e, n) : (c && e.push(qe), ft = Ze ? null : gt(i.hoistableChunks, n));
				return ft;
			case "script":
				var Mt = s.tagScope & 1, Pt = n.async;
				if (typeof n.src != "string" || !n.src || !Pt || typeof Pt == "function" || typeof Pt == "symbol" || n.onLoad || n.onError || s.insertionMode === 4 || Mt || n.itemProp != null) var Ft = Ct(e, n);
				else {
					var It = n.src;
					if (n.type === "module") var Lt = r.moduleScriptResources, Rt = i.preloads.moduleScripts;
					else Lt = r.scriptResources, Rt = i.preloads.scripts;
					var zt = Lt.hasOwnProperty(It) ? Lt[It] : void 0;
					if (zt !== null) {
						Lt[It] = null;
						var Bt = n;
						if (zt) {
							zt.length === 2 && (Bt = se({}, n), xr(Bt, zt));
							var U = Rt.get(It);
							U && (U.length = 0);
						}
						var Vt = [];
						i.scripts.add(Vt), Ct(Vt, Bt);
					}
					c && e.push(qe), Ft = null;
				}
				return Ft;
			case "style":
				var Ht = s.tagScope & 1, Ut = n.precedence, Wt = n.href, Gt = n.nonce;
				if (s.insertionMode === 4 || Ht || n.itemProp != null || typeof Ut != "string" || typeof Wt != "string" || Wt === "") {
					e.push(kt("style"));
					var Kt = null, qt = null, Jt;
					for (Jt in n) if (N.call(n, Jt)) {
						var Yt = n[Jt];
						if (Yt != null) switch (Jt) {
							case "children":
								Kt = Yt;
								break;
							case "dangerouslySetInnerHTML":
								qt = Yt;
								break;
							default: V(e, Jt, Yt);
						}
					}
					e.push(st);
					var Xt = Array.isArray(Kt) ? 2 > Kt.length ? Kt[0] : null : Kt;
					typeof Xt != "function" && typeof Xt != "symbol" && Xt != null && e.push(("" + Xt).replace(H, _t)), lt(e, qt, Kt), e.push(Nt("style"));
					var Zt = null;
				} else {
					var Qt = i.styles.get(Ut);
					if ((r.styleResources.hasOwnProperty(Wt) ? r.styleResources[Wt] : void 0) !== null) {
						r.styleResources[Wt] = null, Qt || (Qt = {
							precedence: P(Ut),
							rules: [],
							hrefs: [],
							sheets: /* @__PURE__ */ new Map()
						}, i.styles.set(Ut, Qt));
						var $t = i.nonce.style;
						if (!$t || $t === Gt) {
							Qt.hrefs.push(P(Wt));
							var en = Qt.rules, W = null, tn = null, nn;
							for (nn in n) if (N.call(n, nn)) {
								var rn = n[nn];
								if (rn != null) switch (nn) {
									case "children":
										W = rn;
										break;
									case "dangerouslySetInnerHTML": tn = rn;
								}
							}
							var an = Array.isArray(W) ? 2 > W.length ? W[0] : null : W;
							typeof an != "function" && typeof an != "symbol" && an != null && en.push(("" + an).replace(H, _t)), lt(en, tn, W);
						}
					}
					Qt && o && o.styles.add(Qt), c && e.push(qe), Zt = void 0;
				}
				return Zt;
			case "meta":
				var on = s.tagScope & 1, sn = s.tagScope & 4;
				if (s.insertionMode === 4 || on || n.itemProp != null) var cn = vt(e, n, "meta");
				else c && e.push(qe), cn = sn ? null : typeof n.charSet == "string" ? vt(i.charsetChunks, n, "meta") : n.name === "viewport" ? vt(i.viewportChunks, n, "meta") : vt(i.hoistableChunks, n, "meta");
				return cn;
			case "listing":
			case "pre":
				e.push(kt(t));
				var ln = null, G = null, un;
				for (un in n) if (N.call(n, un)) {
					var dn = n[un];
					if (dn != null) switch (un) {
						case "children":
							ln = dn;
							break;
						case "dangerouslySetInnerHTML":
							G = dn;
							break;
						default: V(e, un, dn);
					}
				}
				if (e.push(st), G != null) {
					if (ln != null) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
					if (typeof G != "object" || !("__html" in G)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://react.dev/link/dangerously-set-inner-html for more information.");
					var fn = G.__html;
					fn != null && (typeof fn == "string" && 0 < fn.length && fn[0] === "\n" ? e.push(Et, fn) : e.push("" + fn));
				}
				return typeof ln == "string" && ln[0] === "\n" && e.push(Et), ln;
			case "img":
				var pn = s.tagScope & 3, mn = n.src, hn = n.srcSet;
				if (!(n.loading === "lazy" || !mn && !hn || typeof mn != "string" && mn != null || typeof hn != "string" && hn != null || n.fetchPriority === "low" || pn) && (typeof mn != "string" || mn[4] !== ":" || mn[0] !== "d" && mn[0] !== "D" || mn[1] !== "a" && mn[1] !== "A" || mn[2] !== "t" && mn[2] !== "T" || mn[3] !== "a" && mn[3] !== "A") && (typeof hn != "string" || hn[4] !== ":" || hn[0] !== "d" && hn[0] !== "D" || hn[1] !== "a" && hn[1] !== "A" || hn[2] !== "t" && hn[2] !== "T" || hn[3] !== "a" && hn[3] !== "A")) {
					o !== null && s.tagScope & 64 && (o.suspenseyImages = !0);
					var gn = typeof n.sizes == "string" ? n.sizes : void 0, _n = hn ? hn + "\n" + (gn || "") : mn, vn = i.preloads.images, yn = vn.get(_n);
					if (yn) (n.fetchPriority === "high" || 10 > i.highImagePreloads.size) && (vn.delete(_n), i.highImagePreloads.add(yn));
					else if (!r.imageResources.hasOwnProperty(_n)) {
						r.imageResources[_n] = Ce;
						var bn = n.crossOrigin, xn = typeof bn == "string" ? bn === "use-credentials" ? bn : "" : void 0, Sn = i.headers, Cn;
						Sn && 0 < Sn.remainingCapacity && typeof n.srcSet != "string" && (n.fetchPriority === "high" || 500 > Sn.highImagePreloads.length) && (Cn = Sr(mn, "image", {
							imageSrcSet: n.srcSet,
							imageSizes: n.sizes,
							crossOrigin: xn,
							integrity: n.integrity,
							nonce: n.nonce,
							type: n.type,
							fetchPriority: n.fetchPriority,
							referrerPolicy: n.refererPolicy
						}), 0 <= (Sn.remainingCapacity -= Cn.length + 2)) ? (i.resets.image[_n] = Ce, Sn.highImagePreloads && (Sn.highImagePreloads += ", "), Sn.highImagePreloads += Cn) : (yn = [], gt(yn, {
							rel: "preload",
							as: "image",
							href: hn ? void 0 : mn,
							imageSrcSet: hn,
							imageSizes: gn,
							crossOrigin: xn,
							integrity: n.integrity,
							type: n.type,
							fetchPriority: n.fetchPriority,
							referrerPolicy: n.referrerPolicy
						}), n.fetchPriority === "high" || 10 > i.highImagePreloads.size ? i.highImagePreloads.add(yn) : (i.bulkPreloads.add(yn), vn.set(_n, yn)));
					}
				}
				return vt(e, n, "img");
			case "base":
			case "area":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "param":
			case "source":
			case "track":
			case "wbr": return vt(e, n, t);
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": break;
			case "head":
				if (2 > s.insertionMode) {
					var wn = a || i.preamble;
					if (wn.headChunks) throw Error("The `<head>` tag may only be rendered once.");
					a !== null && e.push(bt), wn.headChunks = [];
					var Tn = wt(wn.headChunks, n, "head");
				} else Tn = Tt(e, n, "head");
				return Tn;
			case "body":
				if (2 > s.insertionMode) {
					var En = a || i.preamble;
					if (En.bodyChunks) throw Error("The `<body>` tag may only be rendered once.");
					a !== null && e.push(xt), En.bodyChunks = [];
					var Dn = wt(En.bodyChunks, n, "body");
				} else Dn = Tt(e, n, "body");
				return Dn;
			case "html":
				if (s.insertionMode === 0) {
					var On = a || i.preamble;
					if (On.htmlChunks) throw Error("The `<html>` tag may only be rendered once.");
					a !== null && e.push(St), On.htmlChunks = [At];
					var kn = wt(On.htmlChunks, n, "html");
				} else kn = Tt(e, n, "html");
				return kn;
			default: if (t.indexOf("-") !== -1) {
				e.push(kt(t));
				var An = null, jn = null, Mn;
				for (Mn in n) if (N.call(n, Mn)) {
					var K = n[Mn];
					if (K != null) {
						var Nn = Mn;
						switch (Mn) {
							case "children":
								An = K;
								break;
							case "dangerouslySetInnerHTML":
								jn = K;
								break;
							case "style":
								$e(e, K);
								break;
							case "suppressContentEditableWarning":
							case "suppressHydrationWarning":
							case "ref": break;
							case "className": Nn = "class";
							default: if (de(Mn) && typeof K != "function" && typeof K != "symbol" && !1 !== K) {
								if (!0 === K) K = "";
								else if (typeof K == "object") continue;
								e.push(I, Nn, et, P(K), L);
							}
						}
					}
				}
				return e.push(st), lt(e, jn, An), An;
			}
		}
		return Tt(e, n, t);
	}
	var Mt = /* @__PURE__ */ new Map();
	function Nt(e) {
		var t = Mt.get(e);
		return t === void 0 && (t = M("</" + e + ">"), Mt.set(e, t)), t;
	}
	function Pt(e, t) {
		e = e.preamble, e.htmlChunks === null && t.htmlChunks && (e.htmlChunks = t.htmlChunks), e.headChunks === null && t.headChunks && (e.headChunks = t.headChunks), e.bodyChunks === null && t.bodyChunks && (e.bodyChunks = t.bodyChunks);
	}
	function Ft(e, t) {
		t = t.bootstrapChunks;
		for (var n = 0; n < t.length - 1; n++) k(e, t[n]);
		return n < t.length ? (n = t[n], t.length = 0, j(e, n)) : !0;
	}
	var It = M("requestAnimationFrame(function(){$RT=performance.now()});"), Lt = M("<template id=\""), Rt = M("\"></template>"), zt = M("<!--&-->"), Bt = M("<!--/&-->"), U = M("<!--$-->"), Vt = M("<!--$?--><template id=\""), Ht = M("\"></template>"), Ut = M("<!--$!-->"), Wt = M("<!--/$-->"), Gt = M("<template"), Kt = M("\""), qt = M(" data-dgst=\"");
	M(" data-msg=\""), M(" data-stck=\""), M(" data-cstck=\"");
	var Jt = M("></template>");
	function Yt(e, t, n) {
		if (k(e, Vt), n === null) throw Error("An ID must have been assigned before we can complete the boundary.");
		return k(e, t.boundaryPrefix), k(e, n.toString(16)), j(e, Ht);
	}
	var Xt = M("<div hidden id=\""), Zt = M("\">"), Qt = M("</div>"), $t = M("<svg aria-hidden=\"true\" style=\"display:none\" id=\""), en = M("\">"), W = M("</svg>"), tn = M("<math aria-hidden=\"true\" style=\"display:none\" id=\""), nn = M("\">"), rn = M("</math>"), an = M("<table hidden id=\""), on = M("\">"), sn = M("</table>"), cn = M("<table hidden><tbody id=\""), ln = M("\">"), G = M("</tbody></table>"), un = M("<table hidden><tr id=\""), dn = M("\">"), fn = M("</tr></table>"), pn = M("<table hidden><colgroup id=\""), mn = M("\">"), hn = M("</colgroup></table>");
	function gn(e, t, n, r) {
		switch (n.insertionMode) {
			case 0:
			case 1:
			case 3:
			case 2: return k(e, Xt), k(e, t.segmentPrefix), k(e, r.toString(16)), j(e, Zt);
			case 4: return k(e, $t), k(e, t.segmentPrefix), k(e, r.toString(16)), j(e, en);
			case 5: return k(e, tn), k(e, t.segmentPrefix), k(e, r.toString(16)), j(e, nn);
			case 6: return k(e, an), k(e, t.segmentPrefix), k(e, r.toString(16)), j(e, on);
			case 7: return k(e, cn), k(e, t.segmentPrefix), k(e, r.toString(16)), j(e, ln);
			case 8: return k(e, un), k(e, t.segmentPrefix), k(e, r.toString(16)), j(e, dn);
			case 9: return k(e, pn), k(e, t.segmentPrefix), k(e, r.toString(16)), j(e, mn);
			default: throw Error("Unknown insertion mode. This is a bug in React.");
		}
	}
	function _n(e, t) {
		switch (t.insertionMode) {
			case 0:
			case 1:
			case 3:
			case 2: return j(e, Qt);
			case 4: return j(e, W);
			case 5: return j(e, rn);
			case 6: return j(e, sn);
			case 7: return j(e, G);
			case 8: return j(e, fn);
			case 9: return j(e, hn);
			default: throw Error("Unknown insertion mode. This is a bug in React.");
		}
	}
	var vn = M("$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS(\""), yn = M("$RS(\""), bn = M("\",\""), xn = M("\")<\/script>");
	M("<template data-rsi=\"\" data-sid=\""), M("\" data-pid=\"");
	var Sn = M("$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if(\"/$\"===d||\"/&\"===d)if(0===h)break;else h--;else\"$\"!==d&&\"$?\"!==d&&\"$~\"!==d&&\"$!\"!==d&&\"&\"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data=\"$\";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data=\"$~\",$RB.push(a,b),2===$RB.length&&(\"number\"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};"), Cn = M("$RC(\""), wn = M("$RM=new Map;$RR=function(n,w,p){function u(q){this._p=null;q()}for(var r=new Map,t=document,h,b,e=t.querySelectorAll(\"link[data-precedence],style[data-precedence]\"),v=[],k=0;b=e[k++];)\"not all\"===b.getAttribute(\"media\")?v.push(b):(\"LINK\"===b.tagName&&$RM.set(b.getAttribute(\"href\"),b),r.set(b.dataset.precedence,h=b));e=0;b=[];var l,a;for(k=!0;;){if(k){var f=p[e++];if(!f){k=!1;e=0;continue}var c=!1,m=0;var d=f[m++];if(a=$RM.get(d)){var g=a._p;c=!0}else{a=t.createElement(\"link\");a.href=d;a.rel=\n\"stylesheet\";for(a.dataset.precedence=l=f[m++];g=f[m++];)a.setAttribute(g,f[m++]);g=a._p=new Promise(function(q,x){a.onload=u.bind(a,q);a.onerror=u.bind(a,x)});$RM.set(d,a)}d=a.getAttribute(\"media\");!g||d&&!matchMedia(d).matches||b.push(g);if(c)continue}else{a=v[e++];if(!a)break;l=a.getAttribute(\"data-precedence\");a.removeAttribute(\"media\")}c=r.get(l)||h;c===h&&(h=a);r.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=t.head,c.insertBefore(a,c.firstChild))}if(p=document.getElementById(n))p.previousSibling.data=\n\"$~\";Promise.all(b).then($RC.bind(null,n,w),$RX.bind(null,n,\"CSS failed to load\"))};$RR(\""), Tn = M("$RR(\""), En = M("\",\""), Dn = M("\","), On = M("\""), kn = M(")<\/script>");
	M("<template data-rci=\"\" data-bid=\""), M("<template data-rri=\"\" data-bid=\""), M("\" data-sid=\""), M("\" data-sty=\"");
	var An = M("$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data=\"$!\",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};"), jn = M("$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data=\"$!\",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};;$RX(\""), Mn = M("$RX(\""), K = M("\""), Nn = M(","), Pn = M(")<\/script>");
	M("<template data-rxi=\"\" data-bid=\""), M("\" data-dgst=\""), M("\" data-msg=\""), M("\" data-stck=\""), M("\" data-cstck=\"");
	var Fn = /[<\u2028\u2029]/g;
	function In(e) {
		return JSON.stringify(e).replace(Fn, function(e) {
			switch (e) {
				case "<": return "\\u003c";
				case "\u2028": return "\\u2028";
				case "\u2029": return "\\u2029";
				default: throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
			}
		});
	}
	var Ln = /[&><\u2028\u2029]/g;
	function Rn(e) {
		return JSON.stringify(e).replace(Ln, function(e) {
			switch (e) {
				case "&": return "\\u0026";
				case ">": return "\\u003e";
				case "<": return "\\u003c";
				case "\u2028": return "\\u2028";
				case "\u2029": return "\\u2029";
				default: throw Error("escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
			}
		});
	}
	var zn = M(" media=\"not all\" data-precedence=\""), Bn = M("\" data-href=\""), Vn = M("\">"), Hn = M("</style>"), Un = !1, Wn = !0;
	function Gn(e) {
		var t = e.rules, n = e.hrefs, r = 0;
		if (n.length) {
			for (k(this, we.startInlineStyle), k(this, zn), k(this, e.precedence), k(this, Bn); r < n.length - 1; r++) k(this, n[r]), k(this, $n);
			for (k(this, n[r]), k(this, Vn), r = 0; r < t.length; r++) k(this, t[r]);
			Wn = j(this, Hn), Un = !0, t.length = 0, n.length = 0;
		}
	}
	function Kn(e) {
		return e.state === 2 ? !1 : Un = !0;
	}
	function qn(e, t, n) {
		return Un = !1, Wn = !0, we = n, t.styles.forEach(Gn, e), we = null, t.stylesheets.forEach(Kn), Un && (n.stylesToHoist = !0), Wn;
	}
	function Jn(e) {
		for (var t = 0; t < e.length; t++) k(this, e[t]);
		e.length = 0;
	}
	var Yn = [];
	function Xn(e) {
		gt(Yn, e.props);
		for (var t = 0; t < Yn.length; t++) k(this, Yn[t]);
		Yn.length = 0, e.state = 2;
	}
	var Zn = M(" data-precedence=\""), Qn = M("\" data-href=\""), $n = M(" "), er = M("\">"), tr = M("</style>");
	function nr(e) {
		var t = 0 < e.sheets.size;
		e.sheets.forEach(Xn, this), e.sheets.clear();
		var n = e.rules, r = e.hrefs;
		if (!t || r.length) {
			if (k(this, we.startInlineStyle), k(this, Zn), k(this, e.precedence), e = 0, r.length) {
				for (k(this, Qn); e < r.length - 1; e++) k(this, r[e]), k(this, $n);
				k(this, r[e]);
			}
			for (k(this, er), e = 0; e < n.length; e++) k(this, n[e]);
			k(this, tr), n.length = 0, r.length = 0;
		}
	}
	function rr(e) {
		if (e.state === 0) {
			e.state = 1;
			var t = e.props;
			for (gt(Yn, {
				rel: "preload",
				as: "style",
				href: e.props.href,
				crossOrigin: t.crossOrigin,
				fetchPriority: t.fetchPriority,
				integrity: t.integrity,
				media: t.media,
				hrefLang: t.hrefLang,
				referrerPolicy: t.referrerPolicy
			}), e = 0; e < Yn.length; e++) k(this, Yn[e]);
			Yn.length = 0;
		}
	}
	function ir(e) {
		e.sheets.forEach(rr, this), e.sheets.clear();
	}
	M("<link rel=\"expect\" href=\"#"), M("\" blocking=\"render\"/>");
	var ar = M(" id=\"");
	function or(e, t) {
		!(t.instructions & 32) && (t.instructions |= 32, e.push(ar, P("_" + t.idPrefix + "R_"), L));
	}
	var sr = M("["), cr = M(",["), lr = M(","), ur = M("]");
	function dr(e, t) {
		k(e, sr);
		var n = sr;
		t.stylesheets.forEach(function(t) {
			if (t.state !== 2) if (t.state === 3) k(e, n), k(e, Rn("" + t.props.href)), k(e, ur), n = cr;
			else {
				k(e, n);
				var r = t.props["data-precedence"], i = t.props;
				for (var a in k(e, Rn(ve("" + t.props.href))), r = "" + r, k(e, lr), k(e, Rn(r)), i) if (N.call(i, a) && (r = i[a], r != null)) switch (a) {
					case "href":
					case "rel":
					case "precedence":
					case "data-precedence": break;
					case "children":
					case "dangerouslySetInnerHTML": throw Error("link is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
					default: fr(e, a, r);
				}
				k(e, ur), n = cr, t.state = 3;
			}
		}), k(e, ur);
	}
	function fr(e, t, n) {
		var r = t.toLowerCase();
		switch (typeof n) {
			case "function":
			case "symbol": return;
		}
		switch (t) {
			case "innerHTML":
			case "dangerouslySetInnerHTML":
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "style":
			case "ref": return;
			case "className":
				r = "class", t = "" + n;
				break;
			case "hidden":
				if (!1 === n) return;
				t = "";
				break;
			case "src":
			case "href":
				n = ve(n), t = "" + n;
				break;
			default:
				if (2 < t.length && (t[0] === "o" || t[0] === "O") && (t[1] === "n" || t[1] === "N") || !de(t)) return;
				t = "" + n;
		}
		k(e, lr), k(e, Rn(r)), k(e, lr), k(e, Rn(t));
	}
	function pr() {
		return {
			styles: /* @__PURE__ */ new Set(),
			stylesheets: /* @__PURE__ */ new Set(),
			suspenseyImages: !1
		};
	}
	function mr(e) {
		var t = Qi();
		if (t) {
			var n = t.resumableState, r = t.renderState;
			if (typeof e == "string" && e) {
				if (!n.dnsResources.hasOwnProperty(e)) {
					n.dnsResources[e] = null, n = r.headers;
					var i, a;
					(a = n && 0 < n.remainingCapacity) && (a = (i = "<" + ("" + e).replace(Cr, wr) + ">; rel=dns-prefetch", 0 <= (n.remainingCapacity -= i.length + 2))), a ? (r.resets.dns[e] = null, n.preconnects && (n.preconnects += ", "), n.preconnects += i) : (i = [], gt(i, {
						href: e,
						rel: "dns-prefetch"
					}), r.preconnects.add(i));
				}
				Xa(t);
			}
		} else Se.D(e);
	}
	function hr(e, t) {
		var n = Qi();
		if (n) {
			var r = n.resumableState, i = n.renderState;
			if (typeof e == "string" && e) {
				var a = t === "use-credentials" ? "credentials" : typeof t == "string" ? "anonymous" : "default";
				if (!r.connectResources[a].hasOwnProperty(e)) {
					r.connectResources[a][e] = null, r = i.headers;
					var o, s;
					if (s = r && 0 < r.remainingCapacity) {
						if (s = "<" + ("" + e).replace(Cr, wr) + ">; rel=preconnect", typeof t == "string") {
							var c = ("" + t).replace(Tr, Er);
							s += "; crossorigin=\"" + c + "\"";
						}
						s = (o = s, 0 <= (r.remainingCapacity -= o.length + 2));
					}
					s ? (i.resets.connect[a][e] = null, r.preconnects && (r.preconnects += ", "), r.preconnects += o) : (a = [], gt(a, {
						rel: "preconnect",
						href: e,
						crossOrigin: t
					}), i.preconnects.add(a));
				}
				Xa(n);
			}
		} else Se.C(e, t);
	}
	function gr(e, t, n) {
		var r = Qi();
		if (r) {
			var i = r.resumableState, a = r.renderState;
			if (t && e) {
				switch (t) {
					case "image":
						if (n) var o = n.imageSrcSet, s = n.imageSizes, c = n.fetchPriority;
						var l = o ? o + "\n" + (s || "") : e;
						if (i.imageResources.hasOwnProperty(l)) return;
						i.imageResources[l] = Ce, i = a.headers;
						var u;
						i && 0 < i.remainingCapacity && typeof o != "string" && c === "high" && (u = Sr(e, t, n), 0 <= (i.remainingCapacity -= u.length + 2)) ? (a.resets.image[l] = Ce, i.highImagePreloads && (i.highImagePreloads += ", "), i.highImagePreloads += u) : (i = [], gt(i, se({
							rel: "preload",
							href: o ? void 0 : e,
							as: t
						}, n)), c === "high" ? a.highImagePreloads.add(i) : (a.bulkPreloads.add(i), a.preloads.images.set(l, i)));
						break;
					case "style":
						if (i.styleResources.hasOwnProperty(e)) return;
						o = [], gt(o, se({
							rel: "preload",
							href: e,
							as: t
						}, n)), i.styleResources[e] = !n || typeof n.crossOrigin != "string" && typeof n.integrity != "string" ? Ce : [n.crossOrigin, n.integrity], a.preloads.stylesheets.set(e, o), a.bulkPreloads.add(o);
						break;
					case "script":
						if (i.scriptResources.hasOwnProperty(e)) return;
						o = [], a.preloads.scripts.set(e, o), a.bulkPreloads.add(o), gt(o, se({
							rel: "preload",
							href: e,
							as: t
						}, n)), i.scriptResources[e] = !n || typeof n.crossOrigin != "string" && typeof n.integrity != "string" ? Ce : [n.crossOrigin, n.integrity];
						break;
					default:
						if (i.unknownResources.hasOwnProperty(t)) {
							if (o = i.unknownResources[t], o.hasOwnProperty(e)) return;
						} else o = {}, i.unknownResources[t] = o;
						if (o[e] = Ce, (i = a.headers) && 0 < i.remainingCapacity && t === "font" && (l = Sr(e, t, n), 0 <= (i.remainingCapacity -= l.length + 2))) a.resets.font[e] = Ce, i.fontPreloads && (i.fontPreloads += ", "), i.fontPreloads += l;
						else switch (i = [], e = se({
							rel: "preload",
							href: e,
							as: t
						}, n), gt(i, e), t) {
							case "font":
								a.fontPreloads.add(i);
								break;
							default: a.bulkPreloads.add(i);
						}
				}
				Xa(r);
			}
		} else Se.L(e, t, n);
	}
	function _r(e, t) {
		var n = Qi();
		if (n) {
			var r = n.resumableState, i = n.renderState;
			if (e) {
				var a = t && typeof t.as == "string" ? t.as : "script";
				switch (a) {
					case "script":
						if (r.moduleScriptResources.hasOwnProperty(e)) return;
						a = [], r.moduleScriptResources[e] = !t || typeof t.crossOrigin != "string" && typeof t.integrity != "string" ? Ce : [t.crossOrigin, t.integrity], i.preloads.moduleScripts.set(e, a);
						break;
					default:
						if (r.moduleUnknownResources.hasOwnProperty(a)) {
							var o = r.unknownResources[a];
							if (o.hasOwnProperty(e)) return;
						} else o = {}, r.moduleUnknownResources[a] = o;
						a = [], o[e] = Ce;
				}
				gt(a, se({
					rel: "modulepreload",
					href: e
				}, t)), i.bulkPreloads.add(a), Xa(n);
			}
		} else Se.m(e, t);
	}
	function vr(e, t, n) {
		var r = Qi();
		if (r) {
			var i = r.resumableState, a = r.renderState;
			if (e) {
				t ||= "default";
				var o = a.styles.get(t), s = i.styleResources.hasOwnProperty(e) ? i.styleResources[e] : void 0;
				s !== null && (i.styleResources[e] = null, o || (o = {
					precedence: P(t),
					rules: [],
					hrefs: [],
					sheets: /* @__PURE__ */ new Map()
				}, a.styles.set(t, o)), t = {
					state: 0,
					props: se({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n)
				}, s && (s.length === 2 && xr(t.props, s), (a = a.preloads.stylesheets.get(e)) && 0 < a.length ? a.length = 0 : t.state = 1), o.sheets.set(e, t), Xa(r));
			}
		} else Se.S(e, t, n);
	}
	function yr(e, t) {
		var n = Qi();
		if (n) {
			var r = n.resumableState, i = n.renderState;
			if (e) {
				var a = r.scriptResources.hasOwnProperty(e) ? r.scriptResources[e] : void 0;
				a !== null && (r.scriptResources[e] = null, t = se({
					src: e,
					async: !0
				}, t), a && (a.length === 2 && xr(t, a), e = i.preloads.scripts.get(e)) && (e.length = 0), e = [], i.scripts.add(e), Ct(e, t), Xa(n));
			}
		} else Se.X(e, t);
	}
	function br(e, t) {
		var n = Qi();
		if (n) {
			var r = n.resumableState, i = n.renderState;
			if (e) {
				var a = r.moduleScriptResources.hasOwnProperty(e) ? r.moduleScriptResources[e] : void 0;
				a !== null && (r.moduleScriptResources[e] = null, t = se({
					src: e,
					type: "module",
					async: !0
				}, t), a && (a.length === 2 && xr(t, a), e = i.preloads.moduleScripts.get(e)) && (e.length = 0), e = [], i.scripts.add(e), Ct(e, t), Xa(n));
			}
		} else Se.M(e, t);
	}
	function xr(e, t) {
		e.crossOrigin ??= t[0], e.integrity ??= t[1];
	}
	function Sr(e, t, n) {
		for (var r in e = ("" + e).replace(Cr, wr), t = ("" + t).replace(Tr, Er), t = "<" + e + ">; rel=preload; as=\"" + t + "\"", n) N.call(n, r) && (e = n[r], typeof e == "string" && (t += "; " + r.toLowerCase() + "=\"" + ("" + e).replace(Tr, Er) + "\""));
		return t;
	}
	var Cr = /[<>\r\n]/g;
	function wr(e) {
		switch (e) {
			case "<": return "%3C";
			case ">": return "%3E";
			case "\n": return "%0A";
			case "\r": return "%0D";
			default: throw Error("escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
		}
	}
	var Tr = /["';,\r\n]/g;
	function Er(e) {
		switch (e) {
			case "\"": return "%22";
			case "'": return "%27";
			case ";": return "%3B";
			case ",": return "%2C";
			case "\n": return "%0A";
			case "\r": return "%0D";
			default: throw Error("escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
		}
	}
	function Dr(e) {
		this.styles.add(e);
	}
	function Or(e) {
		this.stylesheets.add(e);
	}
	function kr(e, t) {
		t.styles.forEach(Dr, e), t.stylesheets.forEach(Or, e), t.suspenseyImages && (e.suspenseyImages = !0);
	}
	function Ar(e) {
		return 0 < e.stylesheets.size || e.suspenseyImages;
	}
	var jr = Function.prototype.bind, Mr = new r.AsyncLocalStorage(), Nr = Symbol.for("react.client.reference");
	function Pr(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === Nr ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case l: return "Fragment";
			case d: return "Profiler";
			case u: return "StrictMode";
			case h: return "Suspense";
			case _: return "SuspenseList";
			case te: return "Activity";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case c: return "Portal";
			case p: return e.displayName || "Context";
			case f: return (e._context.displayName || "Context") + ".Consumer";
			case m:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case v: return t = e.displayName || null, t === null ? Pr(e.type) || "Memo" : t;
			case ee:
				t = e._payload, e = e._init;
				try {
					return Pr(e(t));
				} catch {}
		}
		return null;
	}
	var Fr = {}, Ir = null;
	function Lr(e, t) {
		if (e !== t) {
			e.context._currentValue = e.parentValue, e = e.parent;
			var n = t.parent;
			if (e === null) {
				if (n !== null) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
			} else {
				if (n === null) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
				Lr(e, n);
			}
			t.context._currentValue = t.value;
		}
	}
	function Rr(e) {
		e.context._currentValue = e.parentValue, e = e.parent, e !== null && Rr(e);
	}
	function zr(e) {
		var t = e.parent;
		t !== null && zr(t), e.context._currentValue = e.value;
	}
	function Br(e, t) {
		if (e.context._currentValue = e.parentValue, e = e.parent, e === null) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
		e.depth === t.depth ? Lr(e, t) : Br(e, t);
	}
	function Vr(e, t) {
		var n = t.parent;
		if (n === null) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
		e.depth === n.depth ? Lr(e, n) : Vr(e, n), t.context._currentValue = t.value;
	}
	function Hr(e) {
		var t = Ir;
		t !== e && (t === null ? zr(e) : e === null ? Rr(t) : t.depth === e.depth ? Lr(t, e) : t.depth > e.depth ? Br(t, e) : Vr(t, e), Ir = e);
	}
	var Ur = {
		enqueueSetState: function(e, t) {
			e = e._reactInternals, e.queue !== null && e.queue.push(t);
		},
		enqueueReplaceState: function(e, t) {
			e = e._reactInternals, e.replace = !0, e.queue = [t];
		},
		enqueueForceUpdate: function() {}
	}, Wr = {
		id: 1,
		overflow: ""
	};
	function Gr(e, t, n) {
		var r = e.id;
		e = e.overflow;
		var i = 32 - Kr(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Kr(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			return a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, {
				id: 1 << 32 - Kr(t) + i | n << i | r,
				overflow: a + e
			};
		}
		return {
			id: 1 << a | n << i | r,
			overflow: e
		};
	}
	var Kr = Math.clz32 ? Math.clz32 : Yr, qr = Math.log, Jr = Math.LN2;
	function Yr(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (qr(e) / Jr | 0) | 0;
	}
	function Xr() {}
	var Zr = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.\n\nTo handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`.");
	function Qr(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Xr, Xr), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw t.reason;
			default:
				switch (typeof t.status == "string" ? t.then(Xr, Xr) : (e = t, e.status = "pending", e.then(function(e) {
					if (t.status === "pending") {
						var n = t;
						n.status = "fulfilled", n.value = e;
					}
				}, function(e) {
					if (t.status === "pending") {
						var n = t;
						n.status = "rejected", n.reason = e;
					}
				})), t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw t.reason;
				}
				throw $r = t, Zr;
		}
	}
	var $r = null;
	function ei() {
		if ($r === null) throw Error("Expected a suspended thenable. This is a bug in React. Please file an issue.");
		var e = $r;
		return $r = null, e;
	}
	function ti(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var ni = typeof Object.is == "function" ? Object.is : ti, ri = null, ii = null, ai = null, oi = null, si = null, ci = null, li = !1, ui = !1, di = 0, fi = 0, pi = -1, mi = 0, hi = null, gi = null, _i = 0;
	function vi() {
		if (ri === null) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.");
		return ri;
	}
	function yi() {
		if (0 < _i) throw Error("Rendered more hooks than during the previous render");
		return {
			memoizedState: null,
			queue: null,
			next: null
		};
	}
	function bi() {
		return ci === null ? si === null ? (li = !1, si = ci = yi()) : (li = !0, ci = si) : ci.next === null ? (li = !1, ci = ci.next = yi()) : (li = !0, ci = ci.next), ci;
	}
	function xi() {
		var e = hi;
		return hi = null, e;
	}
	function Si() {
		oi = ai = ii = ri = null, ui = !1, si = null, _i = 0, ci = gi = null;
	}
	function Ci(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function wi(e, t, n) {
		if (ri = vi(), ci = bi(), li) {
			var r = ci.queue;
			if (t = r.dispatch, gi !== null && (n = gi.get(r), n !== void 0)) {
				gi.delete(r), r = ci.memoizedState;
				do
					r = e(r, n.action), n = n.next;
				while (n !== null);
				return ci.memoizedState = r, [r, t];
			}
			return [ci.memoizedState, t];
		}
		return e = e === Ci ? typeof t == "function" ? t() : t : n === void 0 ? t : n(t), ci.memoizedState = e, e = ci.queue = {
			last: null,
			dispatch: null
		}, e = e.dispatch = Ei.bind(null, ri, e), [ci.memoizedState, e];
	}
	function Ti(e, t) {
		if (ri = vi(), ci = bi(), t = t === void 0 ? null : t, ci !== null) {
			var n = ci.memoizedState;
			if (n !== null && t !== null) {
				var r = n[1];
				a: if (r === null) r = !1;
				else {
					for (var i = 0; i < r.length && i < t.length; i++) if (!ni(t[i], r[i])) {
						r = !1;
						break a;
					}
					r = !0;
				}
				if (r) return n[0];
			}
		}
		return e = e(), ci.memoizedState = [e, t], e;
	}
	function Ei(e, t, n) {
		if (25 <= _i) throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
		if (e === ri) if (ui = !0, e = {
			action: n,
			next: null
		}, gi === null && (gi = /* @__PURE__ */ new Map()), n = gi.get(t), n === void 0) gi.set(t, e);
		else {
			for (t = n; t.next !== null;) t = t.next;
			t.next = e;
		}
	}
	function Di() {
		throw Error("A function wrapped in useEffectEvent can't be called during rendering.");
	}
	function Oi() {
		throw Error("startTransition cannot be called during server rendering.");
	}
	function ki() {
		throw Error("Cannot update optimistic state while rendering.");
	}
	function Ai(e, t, r) {
		return e === void 0 ? (e = JSON.stringify([
			t,
			null,
			r
		]), t = n.createHash("md5"), t.update(e), "k" + t.digest("hex")) : "p" + e;
	}
	function ji(e, t, n) {
		vi();
		var r = fi++, i = ai;
		if (typeof e.$$FORM_ACTION == "function") {
			var a = null, o = oi;
			i = i.formState;
			var s = e.$$IS_SIGNATURE_EQUAL;
			if (i !== null && typeof s == "function") {
				var c = i[1];
				s.call(e, i[2], i[3]) && (a = Ai(n, o, r), c === a && (pi = r, t = i[0]));
			}
			var l = e.bind(null, t);
			return e = function(e) {
				l(e);
			}, typeof l.$$FORM_ACTION == "function" && (e.$$FORM_ACTION = function(e) {
				e = l.$$FORM_ACTION(e), n !== void 0 && (n += "", e.action = n);
				var t = e.data;
				return t && (a === null && (a = Ai(n, o, r)), t.append("$ACTION_KEY", a)), e;
			}), [
				t,
				e,
				!1
			];
		}
		var u = e.bind(null, t);
		return [
			t,
			function(e) {
				u(e);
			},
			!1
		];
	}
	function Mi(e) {
		var t = mi;
		return mi += 1, hi === null && (hi = []), Qr(hi, e, t);
	}
	function Ni() {
		throw Error("Cache cannot be refreshed during server rendering.");
	}
	var Pi = {
		readContext: function(e) {
			return e._currentValue;
		},
		use: function(e) {
			if (typeof e == "object" && e) {
				if (typeof e.then == "function") return Mi(e);
				if (e.$$typeof === p) return e._currentValue;
			}
			throw Error("An unsupported type was passed to use(): " + String(e));
		},
		useContext: function(e) {
			return vi(), e._currentValue;
		},
		useMemo: Ti,
		useReducer: wi,
		useRef: function(e) {
			ri = vi(), ci = bi();
			var t = ci.memoizedState;
			return t === null ? (e = { current: e }, ci.memoizedState = e) : t;
		},
		useState: function(e) {
			return wi(Ci, e);
		},
		useInsertionEffect: Xr,
		useLayoutEffect: Xr,
		useCallback: function(e, t) {
			return Ti(function() {
				return e;
			}, t);
		},
		useImperativeHandle: Xr,
		useEffect: Xr,
		useDebugValue: Xr,
		useDeferredValue: function(e, t) {
			return vi(), t === void 0 ? e : t;
		},
		useTransition: function() {
			return vi(), [!1, Oi];
		},
		useId: function() {
			var e = ii.treeContext, t = e.overflow;
			e = e.id, e = (e & ~(1 << 32 - Kr(e) - 1)).toString(32) + t;
			var n = Fi;
			if (n === null) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
			return t = di++, e = "_" + n.idPrefix + "R_" + e, 0 < t && (e += "H" + t.toString(32)), e + "_";
		},
		useSyncExternalStore: function(e, t, n) {
			if (n === void 0) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
			return n();
		},
		useOptimistic: function(e) {
			return vi(), [e, ki];
		},
		useActionState: ji,
		useFormState: ji,
		useHostTransitionStatus: function() {
			return vi(), xe;
		},
		useMemoCache: function(e) {
			for (var t = Array(e), n = 0; n < e; n++) t[n] = x;
			return t;
		},
		useCacheRefresh: function() {
			return Ni;
		},
		useEffectEvent: function() {
			return Di;
		}
	}, Fi = null, Ii = {
		getCacheForType: function() {
			throw Error("Not implemented.");
		},
		cacheSignal: function() {
			throw Error("Not implemented.");
		}
	};
	function Li(e, t) {
		e = (e.name || "Error") + ": " + (e.message || "");
		for (var n = 0; n < t.length; n++) e += "\n    at " + t[n].toString();
		return e;
	}
	var Ri, zi;
	function Bi(e) {
		if (Ri === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			Ri = t && t[1] || "", zi = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + Ri + e + zi;
	}
	var Vi = !1;
	function Hi(e, t) {
		if (!e || Vi) return "";
		Vi = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = Li;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							e.call(n.prototype);
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			Vi = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? Bi(n) : "";
	}
	function Ui(e) {
		if (typeof e == "string") return Bi(e);
		if (typeof e == "function") return e.prototype && e.prototype.isReactComponent ? Hi(e, !0) : Hi(e, !1);
		if (typeof e == "object" && e) {
			switch (e.$$typeof) {
				case m: return Hi(e.render, !1);
				case v: return Hi(e.type, !1);
				case ee:
					var t = e, n = t._payload;
					t = t._init;
					try {
						e = t(n);
					} catch {
						return Bi("Lazy");
					}
					return Ui(e);
			}
			if (typeof e.name == "string") {
				a: {
					n = e.name, t = e.env;
					var r = e.debugLocation;
					if (r != null && (e = Error.prepareStackTrace, Error.prepareStackTrace = Li, r = r.stack, Error.prepareStackTrace = e, r.startsWith("Error: react-stack-top-frame\n") && (r = r.slice(29)), e = r.indexOf("\n"), e !== -1 && (r = r.slice(e + 1)), e = r.indexOf("react_stack_bottom_frame"), e !== -1 && (e = r.lastIndexOf("\n", e)), e = e === -1 ? "" : r = r.slice(0, e), r = e.lastIndexOf("\n"), e = r === -1 ? e : e.slice(r + 1), e.indexOf(n) !== -1)) {
						n = "\n" + e;
						break a;
					}
					n = Bi(n + (t ? " [" + t + "]" : ""));
				}
				return n;
			}
		}
		switch (e) {
			case _: return Bi("SuspenseList");
			case h: return Bi("Suspense");
		}
		return "";
	}
	function Wi(e, t) {
		return (500 < t.byteSize || Ar(t.contentState)) && t.contentPreamble === null;
	}
	function Gi(e) {
		if (typeof e == "object" && e && typeof e.environmentName == "string") {
			var t = e.environmentName;
			e = [e].slice(0), typeof e[0] == "string" ? e.splice(0, 1, "\x1B[0m\x1B[7m%c%s\x1B[0m%c " + e[0], "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px", " " + t + " ", "") : e.splice(0, 0, "\x1B[0m\x1B[7m%c%s\x1B[0m%c", "background: #e6e6e6;background: light-dark(rgba(0,0,0,0.1), rgba(255,255,255,0.25));color: #000000;color: light-dark(#000000, #ffffff);border-radius: 2px", " " + t + " ", ""), e.unshift(console), t = jr.apply(console.error, e), t();
		} else console.error(e);
		return null;
	}
	function Ki(e, t, n, r, i, a, o, s, c, l, u) {
		var d = /* @__PURE__ */ new Set();
		this.destination = null, this.flushScheduled = !1, this.resumableState = e, this.renderState = t, this.rootFormatContext = n, this.progressiveChunkSize = r === void 0 ? 12800 : r, this.status = 10, this.fatalError = null, this.pendingRootTasks = this.allPendingTasks = this.nextSegmentId = 0, this.completedPreambleSegments = this.completedRootSegment = null, this.byteSize = 0, this.abortableTasks = d, this.pingedTasks = [], this.clientRenderedBoundaries = [], this.completedBoundaries = [], this.partialBoundaries = [], this.trackedPostpones = null, this.onError = i === void 0 ? Gi : i, this.onPostpone = l === void 0 ? Xr : l, this.onAllReady = a === void 0 ? Xr : a, this.onShellReady = o === void 0 ? Xr : o, this.onShellError = s === void 0 ? Xr : s, this.onFatalError = c === void 0 ? Xr : c, this.formState = u === void 0 ? null : u;
	}
	function qi(e, t, n, r, i, a, o, s, c, l, u, d) {
		return t = new Ki(t, n, r, i, a, o, s, c, l, u, d), n = ra(t, 0, null, r, !1, !1), n.parentFlushed = !0, e = ta(t, null, e, -1, null, n, null, null, t.abortableTasks, null, r, null, Wr, null, null), ia(e), t.pingedTasks.push(e), t;
	}
	function Ji(e, t, n, r, i, a, o, s, c, l, u) {
		return e = qi(e, t, n, r, i, a, o, s, c, l, u, void 0), e.trackedPostpones = {
			workingMap: /* @__PURE__ */ new Map(),
			rootNodes: [],
			rootSlots: null
		}, e;
	}
	function Yi(e, t, n, r, i, a, o, s, c) {
		return n = new Ki(t.resumableState, n, t.rootFormatContext, t.progressiveChunkSize, r, i, a, o, s, c, null), n.nextSegmentId = t.nextSegmentId, typeof t.replaySlots == "number" ? (r = ra(n, 0, null, t.rootFormatContext, !1, !1), r.parentFlushed = !0, e = ta(n, null, e, -1, null, r, null, null, n.abortableTasks, null, t.rootFormatContext, null, Wr, null, null), ia(e), n.pingedTasks.push(e), n) : (e = na(n, null, {
			nodes: t.replayNodes,
			slots: t.replaySlots,
			pendingTasks: 0
		}, e, -1, null, null, n.abortableTasks, null, t.rootFormatContext, null, Wr, null, null), ia(e), n.pingedTasks.push(e), n);
	}
	function Xi(e, t, n, r, i, a, o, s, c) {
		return e = Yi(e, t, n, r, i, a, o, s, c), e.trackedPostpones = {
			workingMap: /* @__PURE__ */ new Map(),
			rootNodes: [],
			rootSlots: null
		}, e;
	}
	var Zi = null;
	function Qi() {
		return Zi || Mr.getStore() || null;
	}
	function $i(e, t) {
		e.pingedTasks.push(t), e.pingedTasks.length === 1 && (e.flushScheduled = e.destination !== null, e.trackedPostpones !== null || e.status === 10 ? T(function() {
			return Ia(e);
		}) : setImmediate(function() {
			return Ia(e);
		}));
	}
	function ea(e, t, n, r, i) {
		return n = {
			status: 0,
			rootSegmentID: -1,
			parentFlushed: !1,
			pendingTasks: 0,
			row: t,
			completedSegments: [],
			byteSize: 0,
			fallbackAbortableTasks: n,
			errorDigest: null,
			contentState: pr(),
			fallbackState: pr(),
			contentPreamble: r,
			fallbackPreamble: i,
			trackedContentKeyPath: null,
			trackedFallbackNode: null
		}, t !== null && (t.pendingTasks++, r = t.boundaries, r !== null && (e.allPendingTasks++, n.pendingTasks++, r.push(n)), e = t.inheritedHoistables, e !== null && kr(n.contentState, e)), n;
	}
	function ta(e, t, n, r, i, a, o, s, c, l, u, d, f, p, m) {
		e.allPendingTasks++, i === null ? e.pendingRootTasks++ : i.pendingTasks++, p !== null && p.pendingTasks++;
		var h = {
			replay: null,
			node: n,
			childIndex: r,
			ping: function() {
				return $i(e, h);
			},
			blockedBoundary: i,
			blockedSegment: a,
			blockedPreamble: o,
			hoistableState: s,
			abortSet: c,
			keyPath: l,
			formatContext: u,
			context: d,
			treeContext: f,
			row: p,
			componentStack: m,
			thenableState: t
		};
		return c.add(h), h;
	}
	function na(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		e.allPendingTasks++, a === null ? e.pendingRootTasks++ : a.pendingTasks++, f !== null && f.pendingTasks++, n.pendingTasks++;
		var m = {
			replay: n,
			node: r,
			childIndex: i,
			ping: function() {
				return $i(e, m);
			},
			blockedBoundary: a,
			blockedSegment: null,
			blockedPreamble: null,
			hoistableState: o,
			abortSet: s,
			keyPath: c,
			formatContext: l,
			context: u,
			treeContext: d,
			row: f,
			componentStack: p,
			thenableState: t
		};
		return s.add(m), m;
	}
	function ra(e, t, n, r, i, a) {
		return {
			status: 0,
			parentFlushed: !1,
			id: -1,
			index: t,
			chunks: [],
			children: [],
			preambleChildren: [],
			parentFormatContext: r,
			boundary: n,
			lastPushedText: i,
			textEmbedded: a
		};
	}
	function ia(e) {
		var t = e.node;
		if (typeof t == "object" && t) switch (t.$$typeof) {
			case s: e.componentStack = {
				parent: e.componentStack,
				type: t.type
			};
		}
	}
	function aa(e) {
		return e === null ? null : {
			parent: e.parent,
			type: "Suspense Fallback"
		};
	}
	function oa(e) {
		var t = {};
		return e && Object.defineProperty(t, "componentStack", {
			configurable: !0,
			enumerable: !0,
			get: function() {
				try {
					var n = "", r = e;
					do
						n += Ui(r.type), r = r.parent;
					while (r);
					var i = n;
				} catch (e) {
					i = "\nError generating stack: " + e.message + "\n" + e.stack;
				}
				return Object.defineProperty(t, "componentStack", { value: i }), i;
			}
		}), t;
	}
	function sa(e, t, n) {
		if (e = e.onError, t = e(t, n), t == null || typeof t == "string") return t;
	}
	function ca(e, t) {
		var n = e.onShellError, r = e.onFatalError;
		n(t), r(t), e.destination === null ? (e.status = 13, e.fatalError = t) : (e.status = 14, e.destination.destroy(t));
	}
	function la(e, t) {
		ua(e, t.next, t.hoistables);
	}
	function ua(e, t, n) {
		for (; t !== null;) {
			n !== null && (kr(t.hoistables, n), t.inheritedHoistables = n);
			var r = t.boundaries;
			if (r !== null) {
				t.boundaries = null;
				for (var i = 0; i < r.length; i++) {
					var a = r[i];
					n !== null && kr(a.contentState, n), Fa(e, a, null, null);
				}
			}
			if (t.pendingTasks--, 0 < t.pendingTasks) break;
			n = t.hoistables, t = t.next;
		}
	}
	function da(e, t) {
		var n = t.boundaries;
		if (n !== null && t.pendingTasks === n.length) {
			for (var r = !0, i = 0; i < n.length; i++) {
				var a = n[i];
				if (a.pendingTasks !== 1 || a.parentFlushed || Wi(e, a)) {
					r = !1;
					break;
				}
			}
			r && ua(e, t, t.hoistables);
		}
	}
	function fa(e) {
		var t = {
			pendingTasks: 1,
			boundaries: null,
			hoistables: pr(),
			inheritedHoistables: null,
			together: !1,
			next: null
		};
		return e !== null && 0 < e.pendingTasks && (t.pendingTasks++, t.boundaries = [], e.next = t), t;
	}
	function pa(e, t, n, r, i) {
		var a = t.keyPath, o = t.treeContext, s = t.row;
		t.keyPath = n, n = r.length;
		var c = null;
		if (t.replay !== null) {
			var l = t.replay.slots;
			if (typeof l == "object" && l) for (var u = 0; u < n; u++) {
				var d = i !== "backwards" && i !== "unstable_legacy-backwards" ? u : n - 1 - u, f = r[d];
				t.row = c = fa(c), t.treeContext = Gr(o, n, d);
				var p = l[d];
				typeof p == "number" ? (_a(e, t, p, f, d), delete l[d]) : Ea(e, t, f, d), --c.pendingTasks === 0 && la(e, c);
			}
			else for (l = 0; l < n; l++) u = i !== "backwards" && i !== "unstable_legacy-backwards" ? l : n - 1 - l, d = r[u], t.row = c = fa(c), t.treeContext = Gr(o, n, u), Ea(e, t, d, u), --c.pendingTasks === 0 && la(e, c);
		} else if (i !== "backwards" && i !== "unstable_legacy-backwards") for (i = 0; i < n; i++) l = r[i], t.row = c = fa(c), t.treeContext = Gr(o, n, i), Ea(e, t, l, i), --c.pendingTasks === 0 && la(e, c);
		else {
			for (i = t.blockedSegment, l = i.children.length, u = i.chunks.length, d = n - 1; 0 <= d; d--) {
				f = r[d], t.row = c = fa(c), t.treeContext = Gr(o, n, d), p = ra(e, u, null, t.formatContext, d === 0 ? i.lastPushedText : !0, !0), i.children.splice(l, 0, p), t.blockedSegment = p;
				try {
					Ea(e, t, f, d), p.lastPushedText && p.textEmbedded && p.chunks.push(qe), p.status = 1, Pa(e, t.blockedBoundary, p), --c.pendingTasks === 0 && la(e, c);
				} catch (t) {
					throw p.status = e.status === 12 ? 3 : 4, t;
				}
			}
			t.blockedSegment = i, i.lastPushedText = !1;
		}
		s !== null && c !== null && 0 < c.pendingTasks && (s.pendingTasks++, c.next = s), t.treeContext = o, t.row = s, t.keyPath = a;
	}
	function ma(e, t, n, r, i, a) {
		var o = t.thenableState;
		for (t.thenableState = null, ri = {}, ii = t, ai = e, oi = n, fi = di = 0, pi = -1, mi = 0, hi = o, e = r(i, a); ui;) ui = !1, fi = di = 0, pi = -1, mi = 0, _i += 1, ci = null, e = r(i, a);
		return Si(), e;
	}
	function ha(e, t, n, r, i, a, o) {
		var s = !1;
		if (a !== 0 && e.formState !== null) {
			var c = t.blockedSegment;
			if (c !== null) {
				s = !0, c = c.chunks;
				for (var l = 0; l < a; l++) l === o ? c.push(mt) : c.push(ht);
			}
		}
		a = t.keyPath, t.keyPath = n, i ? (n = t.treeContext, t.treeContext = Gr(n, 1, 0), Ea(e, t, r, -1), t.treeContext = n) : s ? Ea(e, t, r, -1) : va(e, t, r, -1), t.keyPath = a;
	}
	function ga(e, t, n, r, i, a) {
		if (typeof r == "function") if (r.prototype && r.prototype.isReactComponent) {
			var o = i;
			if ("ref" in i) for (var s in o = {}, i) s !== "ref" && (o[s] = i[s]);
			var c = r.defaultProps;
			if (c) for (var g in o === i && (o = se({}, o, i)), c) o[g] === void 0 && (o[g] = c[g]);
			i = o, o = Fr, c = r.contextType, typeof c == "object" && c && (o = c._currentValue), o = new r(i, o);
			var x = o.state === void 0 ? null : o.state;
			if (o.updater = Ur, o.props = i, o.state = x, c = {
				queue: [],
				replace: !1
			}, o._reactInternals = c, a = r.contextType, o.context = typeof a == "object" && a ? a._currentValue : Fr, a = r.getDerivedStateFromProps, typeof a == "function" && (a = a(i, x), x = a == null ? x : se({}, x, a), o.state = x), typeof r.getDerivedStateFromProps != "function" && typeof o.getSnapshotBeforeUpdate != "function" && (typeof o.UNSAFE_componentWillMount == "function" || typeof o.componentWillMount == "function")) if (r = o.state, typeof o.componentWillMount == "function" && o.componentWillMount(), typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(), r !== o.state && Ur.enqueueReplaceState(o, o.state, null), c.queue !== null && 0 < c.queue.length) if (r = c.queue, a = c.replace, c.queue = null, c.replace = !1, a && r.length === 1) o.state = r[0];
			else {
				for (c = a ? r[0] : o.state, x = !0, a = +!!a; a < r.length; a++) g = r[a], g = typeof g == "function" ? g.call(o, c, i, void 0) : g, g != null && (x ? (x = !1, c = se({}, c, g)) : se(c, g));
				o.state = c;
			}
			else c.queue = null;
			if (r = o.render(), e.status === 12) throw null;
			i = t.keyPath, t.keyPath = n, va(e, t, r, -1), t.keyPath = i;
		} else {
			if (r = ma(e, t, n, r, i, void 0), e.status === 12) throw null;
			ha(e, t, n, r, di !== 0, fi, pi);
		}
		else if (typeof r == "string") if (o = t.blockedSegment, o === null) o = i.children, c = t.formatContext, x = t.keyPath, t.formatContext = Ue(c, r, i), t.keyPath = n, Ea(e, t, o, -1), t.formatContext = c, t.keyPath = x;
		else {
			if (x = jt(o.chunks, r, i, e.resumableState, e.renderState, t.blockedPreamble, t.hoistableState, t.formatContext, o.lastPushedText), o.lastPushedText = !1, c = t.formatContext, a = t.keyPath, t.keyPath = n, (t.formatContext = Ue(c, r, i)).insertionMode === 3) {
				n = ra(e, 0, null, t.formatContext, !1, !1), o.preambleChildren.push(n), t.blockedSegment = n;
				try {
					n.status = 6, Ea(e, t, x, -1), n.lastPushedText && n.textEmbedded && n.chunks.push(qe), n.status = 1, Pa(e, t.blockedBoundary, n);
				} finally {
					t.blockedSegment = o;
				}
			} else Ea(e, t, x, -1);
			t.formatContext = c, t.keyPath = a;
			a: {
				switch (t = o.chunks, e = e.resumableState, r) {
					case "title":
					case "style":
					case "script":
					case "area":
					case "base":
					case "br":
					case "col":
					case "embed":
					case "hr":
					case "img":
					case "input":
					case "keygen":
					case "link":
					case "meta":
					case "param":
					case "source":
					case "track":
					case "wbr": break a;
					case "body":
						if (1 >= c.insertionMode) {
							e.hasBody = !0;
							break a;
						}
						break;
					case "html":
						if (c.insertionMode === 0) {
							e.hasHtml = !0;
							break a;
						}
						break;
					case "head": if (1 >= c.insertionMode) break a;
				}
				t.push(Nt(r));
			}
			o.lastPushedText = !1;
		}
		else {
			switch (r) {
				case b:
				case u:
				case d:
				case l:
					r = t.keyPath, t.keyPath = n, va(e, t, i.children, -1), t.keyPath = r;
					return;
				case te:
					r = t.blockedSegment, r === null ? i.mode !== "hidden" && (r = t.keyPath, t.keyPath = n, Ea(e, t, i.children, -1), t.keyPath = r) : i.mode !== "hidden" && (r.chunks.push(zt), r.lastPushedText = !1, o = t.keyPath, t.keyPath = n, Ea(e, t, i.children, -1), t.keyPath = o, r.chunks.push(Bt), r.lastPushedText = !1);
					return;
				case _:
					a: {
						if (r = i.children, i = i.revealOrder, i === "forwards" || i === "backwards" || i === "unstable_legacy-backwards") {
							if (w(r)) {
								pa(e, t, n, r, i);
								break a;
							}
							if ((o = ne(r)) && (o = o.call(r))) {
								if (c = o.next(), !c.done) {
									do
										c = o.next();
									while (!c.done);
									pa(e, t, n, r, i);
								}
								break a;
							}
						}
						i === "together" ? (i = t.keyPath, o = t.row, c = t.row = fa(null), c.boundaries = [], c.together = !0, t.keyPath = n, va(e, t, r, -1), --c.pendingTasks === 0 && la(e, c), t.keyPath = i, t.row = o, o !== null && 0 < c.pendingTasks && (o.pendingTasks++, c.next = o)) : (i = t.keyPath, t.keyPath = n, va(e, t, r, -1), t.keyPath = i);
					}
					return;
				case S:
				case y: throw Error("ReactDOMServer does not yet support scope components.");
				case h:
					a: if (t.replay !== null) {
						r = t.keyPath, o = t.formatContext, c = t.row, t.keyPath = n, t.formatContext = Ke(e.resumableState, o), t.row = null, n = i.children;
						try {
							Ea(e, t, n, -1);
						} finally {
							t.keyPath = r, t.formatContext = o, t.row = c;
						}
					} else {
						r = t.keyPath, a = t.formatContext;
						var C = t.row;
						g = t.blockedBoundary, s = t.blockedPreamble;
						var T = t.hoistableState, re = t.blockedSegment, E = i.fallback;
						i = i.children;
						var D = /* @__PURE__ */ new Set(), O = 2 > t.formatContext.insertionMode ? ea(e, t.row, D, Be(), Be()) : ea(e, t.row, D, null, null);
						e.trackedPostpones !== null && (O.trackedContentKeyPath = n);
						var k = ra(e, re.chunks.length, O, t.formatContext, !1, !1);
						re.children.push(k), re.lastPushedText = !1;
						var A = ra(e, 0, null, t.formatContext, !1, !1);
						if (A.parentFlushed = !0, e.trackedPostpones !== null) {
							o = t.componentStack, c = [
								n[0],
								"Suspense Fallback",
								n[2]
							], x = [
								c[1],
								c[2],
								[],
								null
							], e.trackedPostpones.workingMap.set(c, x), O.trackedFallbackNode = x, t.blockedSegment = k, t.blockedPreamble = O.fallbackPreamble, t.keyPath = c, t.formatContext = Ge(e.resumableState, a), t.componentStack = aa(o), k.status = 6;
							try {
								Ea(e, t, E, -1), k.lastPushedText && k.textEmbedded && k.chunks.push(qe), k.status = 1, Pa(e, g, k);
							} catch (t) {
								throw k.status = e.status === 12 ? 3 : 4, t;
							} finally {
								t.blockedSegment = re, t.blockedPreamble = s, t.keyPath = r, t.formatContext = a;
							}
							t = ta(e, null, i, -1, O, A, O.contentPreamble, O.contentState, t.abortSet, n, Ke(e.resumableState, t.formatContext), t.context, t.treeContext, null, o), ia(t), e.pingedTasks.push(t);
						} else {
							t.blockedBoundary = O, t.blockedPreamble = O.contentPreamble, t.hoistableState = O.contentState, t.blockedSegment = A, t.keyPath = n, t.formatContext = Ke(e.resumableState, a), t.row = null, A.status = 6;
							try {
								if (Ea(e, t, i, -1), A.lastPushedText && A.textEmbedded && A.chunks.push(qe), A.status = 1, Pa(e, O, A), Na(O, A), O.pendingTasks === 0 && O.status === 0) {
									if (O.status = 1, !Wi(e, O)) {
										C !== null && --C.pendingTasks === 0 && la(e, C), e.pendingRootTasks === 0 && t.blockedPreamble && za(e);
										break a;
									}
								} else C !== null && C.together && da(e, C);
							} catch (n) {
								O.status = 4, e.status === 12 ? (A.status = 3, o = e.fatalError) : (A.status = 4, o = n), c = oa(t.componentStack), x = sa(e, o, c), O.errorDigest = x, Ca(e, O);
							} finally {
								t.blockedBoundary = g, t.blockedPreamble = s, t.hoistableState = T, t.blockedSegment = re, t.keyPath = r, t.formatContext = a, t.row = C;
							}
							t = ta(e, null, E, -1, g, k, O.fallbackPreamble, O.fallbackState, D, [
								n[0],
								"Suspense Fallback",
								n[2]
							], Ge(e.resumableState, t.formatContext), t.context, t.treeContext, t.row, aa(t.componentStack)), ia(t), e.pingedTasks.push(t);
						}
					}
					return;
			}
			if (typeof r == "object" && r) switch (r.$$typeof) {
				case m:
					if ("ref" in i) for (re in o = {}, i) re !== "ref" && (o[re] = i[re]);
					else o = i;
					r = ma(e, t, n, r.render, o, a), ha(e, t, n, r, di !== 0, fi, pi);
					return;
				case v:
					ga(e, t, n, r.type, i, a);
					return;
				case p:
					if (c = i.children, o = t.keyPath, i = i.value, x = r._currentValue, r._currentValue = i, a = Ir, Ir = r = {
						parent: a,
						depth: a === null ? 0 : a.depth + 1,
						context: r,
						parentValue: x,
						value: i
					}, t.context = r, t.keyPath = n, va(e, t, c, -1), e = Ir, e === null) throw Error("Tried to pop a Context at the root of the app. This is a bug in React.");
					e.context._currentValue = e.parentValue, e = Ir = e.parent, t.context = e, t.keyPath = o;
					return;
				case f:
					i = i.children, r = i(r._context._currentValue), i = t.keyPath, t.keyPath = n, va(e, t, r, -1), t.keyPath = i;
					return;
				case ee:
					if (o = r._init, r = o(r._payload), e.status === 12) throw null;
					ga(e, t, n, r, i, a);
					return;
			}
			throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + ((r == null ? r : typeof r) + "."));
		}
	}
	function _a(e, t, n, r, i) {
		var a = t.replay, o = t.blockedBoundary, s = ra(e, 0, null, t.formatContext, !1, !1);
		s.id = n, s.parentFlushed = !0;
		try {
			t.replay = null, t.blockedSegment = s, Ea(e, t, r, i), s.status = 1, Pa(e, o, s), o === null ? e.completedRootSegment = s : (Na(o, s), o.parentFlushed && e.partialBoundaries.push(o));
		} finally {
			t.replay = a, t.blockedSegment = null;
		}
	}
	function va(e, t, n, r) {
		t.replay !== null && typeof t.replay.slots == "number" ? _a(e, t, t.replay.slots, n, r) : (t.node = n, t.childIndex = r, n = t.componentStack, ia(t), ya(e, t), t.componentStack = n);
	}
	function ya(e, t) {
		var n = t.node, r = t.childIndex;
		if (n !== null) {
			if (typeof n == "object") {
				switch (n.$$typeof) {
					case s:
						var i = n.type, a = n.key, o = n.props;
						n = o.ref;
						var l = n === void 0 ? null : n, u = Pr(i), d = a ?? (r === -1 ? 0 : r);
						if (a = [
							t.keyPath,
							u,
							d
						], t.replay !== null) a: {
							var f = t.replay;
							for (r = f.nodes, n = 0; n < r.length; n++) {
								var m = r[n];
								if (d === m[1]) {
									if (m.length === 4) {
										if (u !== null && u !== m[0]) throw Error("Expected the resume to render <" + m[0] + "> in this slot but instead it rendered <" + u + ">. The tree doesn't match so React will fallback to client rendering.");
										var g = m[2];
										u = m[3], d = t.node, t.replay = {
											nodes: g,
											slots: u,
											pendingTasks: 1
										};
										try {
											if (ga(e, t, a, i, o, l), t.replay.pendingTasks === 1 && 0 < t.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
											t.replay.pendingTasks--;
										} catch (s) {
											if (typeof s == "object" && s && (s === Zr || typeof s.then == "function")) throw t.node === d ? t.replay = f : r.splice(n, 1), s;
											t.replay.pendingTasks--, o = oa(t.componentStack), a = e, e = t.blockedBoundary, i = s, o = sa(a, i, o), Oa(a, e, g, u, i, o);
										}
										t.replay = f;
									} else {
										if (i !== h) throw Error("Expected the resume to render <Suspense> in this slot but instead it rendered <" + (Pr(i) || "Unknown") + ">. The tree doesn't match so React will fallback to client rendering.");
										b: {
											f = void 0, i = m[5], l = m[2], u = m[3], d = m[4] === null ? [] : m[4][2], m = m[4] === null ? null : m[4][3];
											var _ = t.keyPath, v = t.formatContext, y = t.row, te = t.replay, b = t.blockedBoundary, x = t.hoistableState, S = o.children, C = o.fallback, T = /* @__PURE__ */ new Set();
											o = 2 > t.formatContext.insertionMode ? ea(e, t.row, T, Be(), Be()) : ea(e, t.row, T, null, null), o.parentFlushed = !0, o.rootSegmentID = i, t.blockedBoundary = o, t.hoistableState = o.contentState, t.keyPath = a, t.formatContext = Ke(e.resumableState, v), t.row = null, t.replay = {
												nodes: l,
												slots: u,
												pendingTasks: 1
											};
											try {
												if (Ea(e, t, S, -1), t.replay.pendingTasks === 1 && 0 < t.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
												if (t.replay.pendingTasks--, o.pendingTasks === 0 && o.status === 0) {
													o.status = 1, e.completedBoundaries.push(o);
													break b;
												}
											} catch (n) {
												o.status = 4, g = oa(t.componentStack), f = sa(e, n, g), o.errorDigest = f, t.replay.pendingTasks--, e.clientRenderedBoundaries.push(o);
											} finally {
												t.blockedBoundary = b, t.hoistableState = x, t.replay = te, t.keyPath = _, t.formatContext = v, t.row = y;
											}
											g = na(e, null, {
												nodes: d,
												slots: m,
												pendingTasks: 0
											}, C, -1, b, o.fallbackState, T, [
												a[0],
												"Suspense Fallback",
												a[2]
											], Ge(e.resumableState, t.formatContext), t.context, t.treeContext, t.row, aa(t.componentStack)), ia(g), e.pingedTasks.push(g);
										}
									}
									r.splice(n, 1);
									break a;
								}
							}
						}
						else ga(e, t, a, i, o, l);
						return;
					case c: throw Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
					case ee:
						if (g = n._init, n = g(n._payload), e.status === 12) throw null;
						va(e, t, n, r);
						return;
				}
				if (w(n)) {
					ba(e, t, n, r);
					return;
				}
				if ((g = ne(n)) && (g = g.call(n))) {
					if (n = g.next(), !n.done) {
						o = [];
						do
							o.push(n.value), n = g.next();
						while (!n.done);
						ba(e, t, o, r);
					}
					return;
				}
				if (typeof n.then == "function") return t.thenableState = null, va(e, t, Mi(n), r);
				if (n.$$typeof === p) return va(e, t, n._currentValue, r);
				throw r = Object.prototype.toString.call(n), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
			}
			typeof n == "string" ? (r = t.blockedSegment, r !== null && (r.lastPushedText = Je(r.chunks, n, e.renderState, r.lastPushedText))) : (typeof n == "number" || typeof n == "bigint") && (r = t.blockedSegment, r !== null && (r.lastPushedText = Je(r.chunks, "" + n, e.renderState, r.lastPushedText)));
		}
	}
	function ba(e, t, n, r) {
		var i = t.keyPath;
		if (r !== -1 && (t.keyPath = [
			t.keyPath,
			"Fragment",
			r
		], t.replay !== null)) {
			for (var a = t.replay, o = a.nodes, s = 0; s < o.length; s++) {
				var c = o[s];
				if (c[1] === r) {
					r = c[2], c = c[3], t.replay = {
						nodes: r,
						slots: c,
						pendingTasks: 1
					};
					try {
						if (ba(e, t, n, -1), t.replay.pendingTasks === 1 && 0 < t.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
						t.replay.pendingTasks--;
					} catch (i) {
						if (typeof i == "object" && i && (i === Zr || typeof i.then == "function")) throw i;
						t.replay.pendingTasks--, n = oa(t.componentStack);
						var l = t.blockedBoundary, u = i;
						n = sa(e, u, n), Oa(e, l, r, c, u, n);
					}
					t.replay = a, o.splice(s, 1);
					break;
				}
			}
			t.keyPath = i;
			return;
		}
		if (a = t.treeContext, o = n.length, t.replay !== null && (s = t.replay.slots, typeof s == "object" && s)) {
			for (r = 0; r < o; r++) c = n[r], t.treeContext = Gr(a, o, r), l = s[r], typeof l == "number" ? (_a(e, t, l, c, r), delete s[r]) : Ea(e, t, c, r);
			t.treeContext = a, t.keyPath = i;
			return;
		}
		for (s = 0; s < o; s++) r = n[s], t.treeContext = Gr(a, o, s), Ea(e, t, r, s);
		t.treeContext = a, t.keyPath = i;
	}
	function xa(e, t, n) {
		if (n.status = 5, n.rootSegmentID = e.nextSegmentId++, e = n.trackedContentKeyPath, e === null) throw Error("It should not be possible to postpone at the root. This is a bug in React.");
		var r = n.trackedFallbackNode, i = [], a = t.workingMap.get(e);
		return a === void 0 ? (n = [
			e[1],
			e[2],
			i,
			null,
			r,
			n.rootSegmentID
		], t.workingMap.set(e, n), $a(n, e[0], t), n) : (a[4] = r, a[5] = n.rootSegmentID, a);
	}
	function Sa(e, t, n, r) {
		r.status = 5;
		var i = n.keyPath, a = n.blockedBoundary;
		if (a === null) r.id = e.nextSegmentId++, t.rootSlots = r.id, e.completedRootSegment !== null && (e.completedRootSegment.status = 5);
		else {
			if (a !== null && a.status === 0) {
				var o = xa(e, t, a);
				if (a.trackedContentKeyPath === i && n.childIndex === -1) {
					r.id === -1 && (r.id = r.parentFlushed ? a.rootSegmentID : e.nextSegmentId++), o[3] = r.id;
					return;
				}
			}
			if (r.id === -1 && (r.id = r.parentFlushed && a !== null ? a.rootSegmentID : e.nextSegmentId++), n.childIndex === -1) i === null ? t.rootSlots = r.id : (n = t.workingMap.get(i), n === void 0 ? (n = [
				i[1],
				i[2],
				[],
				r.id
			], $a(n, i[0], t)) : n[3] = r.id);
			else {
				if (i === null) {
					if (e = t.rootSlots, e === null) e = t.rootSlots = {};
					else if (typeof e == "number") throw Error("It should not be possible to postpone both at the root of an element as well as a slot below. This is a bug in React.");
				} else if (a = t.workingMap, o = a.get(i), o === void 0) e = {}, o = [
					i[1],
					i[2],
					[],
					e
				], a.set(i, o), $a(o, i[0], t);
				else if (e = o[3], e === null) e = o[3] = {};
				else if (typeof e == "number") throw Error("It should not be possible to postpone both at the root of an element as well as a slot below. This is a bug in React.");
				e[n.childIndex] = r.id;
			}
		}
	}
	function Ca(e, t) {
		e = e.trackedPostpones, e !== null && (t = t.trackedContentKeyPath, t !== null && (t = e.workingMap.get(t), t !== void 0 && (t.length = 4, t[2] = [], t[3] = null)));
	}
	function wa(e, t, n) {
		return na(e, n, t.replay, t.node, t.childIndex, t.blockedBoundary, t.hoistableState, t.abortSet, t.keyPath, t.formatContext, t.context, t.treeContext, t.row, t.componentStack);
	}
	function Ta(e, t, n) {
		var r = t.blockedSegment, i = ra(e, r.chunks.length, null, t.formatContext, r.lastPushedText, !0);
		return r.children.push(i), r.lastPushedText = !1, ta(e, n, t.node, t.childIndex, t.blockedBoundary, i, t.blockedPreamble, t.hoistableState, t.abortSet, t.keyPath, t.formatContext, t.context, t.treeContext, t.row, t.componentStack);
	}
	function Ea(e, t, n, r) {
		var i = t.formatContext, a = t.context, o = t.keyPath, s = t.treeContext, c = t.componentStack, l = t.blockedSegment;
		if (l === null) {
			l = t.replay;
			try {
				return va(e, t, n, r);
			} catch (u) {
				if (Si(), n = u === Zr ? ei() : u, e.status !== 12 && typeof n == "object" && n) {
					if (typeof n.then == "function") {
						r = u === Zr ? xi() : null, e = wa(e, t, r).ping, n.then(e, e), t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, t.componentStack = c, t.replay = l, Hr(a);
						return;
					}
					if (n.message === "Maximum call stack size exceeded") {
						n = u === Zr ? xi() : null, n = wa(e, t, n), e.pingedTasks.push(n), t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, t.componentStack = c, t.replay = l, Hr(a);
						return;
					}
				}
			}
		} else {
			var u = l.children.length, d = l.chunks.length;
			try {
				return va(e, t, n, r);
			} catch (r) {
				if (Si(), l.children.length = u, l.chunks.length = d, n = r === Zr ? ei() : r, e.status !== 12 && typeof n == "object" && n) {
					if (typeof n.then == "function") {
						l = n, n = r === Zr ? xi() : null, e = Ta(e, t, n).ping, l.then(e, e), t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, t.componentStack = c, Hr(a);
						return;
					}
					if (n.message === "Maximum call stack size exceeded") {
						l = r === Zr ? xi() : null, l = Ta(e, t, l), e.pingedTasks.push(l), t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, t.componentStack = c, Hr(a);
						return;
					}
				}
			}
		}
		throw t.formatContext = i, t.context = a, t.keyPath = o, t.treeContext = s, Hr(a), n;
	}
	function Da(e) {
		var t = e.blockedBoundary, n = e.blockedSegment;
		n !== null && (n.status = 3, Fa(this, t, e.row, n));
	}
	function Oa(e, t, n, r, i, a) {
		for (var o = 0; o < n.length; o++) {
			var s = n[o];
			if (s.length === 4) Oa(e, t, s[2], s[3], i, a);
			else {
				s = s[5];
				var c = e, l = a, u = ea(c, null, /* @__PURE__ */ new Set(), null, null);
				u.parentFlushed = !0, u.rootSegmentID = s, u.status = 4, u.errorDigest = l, u.parentFlushed && c.clientRenderedBoundaries.push(u);
			}
		}
		if (n.length = 0, r !== null) {
			if (t === null) throw Error("We should not have any resumable nodes in the shell. This is a bug in React.");
			if (t.status !== 4 && (t.status = 4, t.errorDigest = a, t.parentFlushed && e.clientRenderedBoundaries.push(t)), typeof r == "object") for (var d in r) delete r[d];
		}
	}
	function ka(e, t, n) {
		var r = e.blockedBoundary, i = e.blockedSegment;
		if (i !== null) {
			if (i.status === 6) return;
			i.status = 3;
		}
		var a = oa(e.componentStack);
		if (r === null) {
			if (t.status !== 13 && t.status !== 14) {
				if (r = e.replay, r === null) {
					t.trackedPostpones !== null && i !== null ? (r = t.trackedPostpones, sa(t, n, a), Sa(t, r, e, i), Fa(t, null, e.row, i)) : (sa(t, n, a), ca(t, n));
					return;
				}
				r.pendingTasks--, r.pendingTasks === 0 && 0 < r.nodes.length && (i = sa(t, n, a), Oa(t, null, r.nodes, r.slots, n, i)), t.pendingRootTasks--, t.pendingRootTasks === 0 && ja(t);
			}
		} else {
			var o = t.trackedPostpones;
			if (r.status !== 4) {
				if (o !== null && i !== null) return sa(t, n, a), Sa(t, o, e, i), r.fallbackAbortableTasks.forEach(function(e) {
					return ka(e, t, n);
				}), r.fallbackAbortableTasks.clear(), Fa(t, r, e.row, i);
				r.status = 4, i = sa(t, n, a), r.status = 4, r.errorDigest = i, Ca(t, r), r.parentFlushed && t.clientRenderedBoundaries.push(r);
			}
			r.pendingTasks--, i = r.row, i !== null && --i.pendingTasks === 0 && la(t, i), r.fallbackAbortableTasks.forEach(function(e) {
				return ka(e, t, n);
			}), r.fallbackAbortableTasks.clear();
		}
		e = e.row, e !== null && --e.pendingTasks === 0 && la(t, e), t.allPendingTasks--, t.allPendingTasks === 0 && Ma(t);
	}
	function Aa(e, t) {
		try {
			var n = e.renderState, r = n.onHeaders;
			if (r) {
				var i = n.headers;
				if (i) {
					n.headers = null;
					var a = i.preconnects;
					if (i.fontPreloads && (a && (a += ", "), a += i.fontPreloads), i.highImagePreloads && (a && (a += ", "), a += i.highImagePreloads), !t) {
						var o = n.styles.values(), s = o.next();
						b: for (; 0 < i.remainingCapacity && !s.done; s = o.next()) for (var c = s.value.sheets.values(), l = c.next(); 0 < i.remainingCapacity && !l.done; l = c.next()) {
							var u = l.value, d = u.props, f = d.href, p = u.props, m = Sr(p.href, "style", {
								crossOrigin: p.crossOrigin,
								integrity: p.integrity,
								nonce: p.nonce,
								type: p.type,
								fetchPriority: p.fetchPriority,
								referrerPolicy: p.referrerPolicy,
								media: p.media
							});
							if (0 <= (i.remainingCapacity -= m.length + 2)) n.resets.style[f] = Ce, a && (a += ", "), a += m, n.resets.style[f] = typeof d.crossOrigin == "string" || typeof d.integrity == "string" ? [d.crossOrigin, d.integrity] : Ce;
							else break b;
						}
					}
					r(a ? { Link: a } : {});
				}
			}
		} catch (t) {
			sa(e, t, {});
		}
	}
	function ja(e) {
		e.trackedPostpones === null && Aa(e, !0), e.trackedPostpones === null && za(e), e.onShellError = Xr, e = e.onShellReady, e();
	}
	function Ma(e) {
		Aa(e, e.trackedPostpones === null ? !0 : e.completedRootSegment === null || e.completedRootSegment.status !== 5), za(e), e = e.onAllReady, e();
	}
	function Na(e, t) {
		if (t.chunks.length === 0 && t.children.length === 1 && t.children[0].boundary === null && t.children[0].id === -1) {
			var n = t.children[0];
			n.id = t.id, n.parentFlushed = !0, n.status !== 1 && n.status !== 3 && n.status !== 4 || Na(e, n);
		} else e.completedSegments.push(t);
	}
	function Pa(e, t, n) {
		if (oe !== null) {
			n = n.chunks;
			for (var r = 0, i = 0; i < n.length; i++) r += oe(n[i]);
			t === null ? e.byteSize += r : t.byteSize += r;
		}
	}
	function Fa(e, t, n, r) {
		if (n !== null && (--n.pendingTasks === 0 ? la(e, n) : n.together && da(e, n)), e.allPendingTasks--, t === null) {
			if (r !== null && r.parentFlushed) {
				if (e.completedRootSegment !== null) throw Error("There can only be one root segment. This is a bug in React.");
				e.completedRootSegment = r;
			}
			e.pendingRootTasks--, e.pendingRootTasks === 0 && ja(e);
		} else if (t.pendingTasks--, t.status !== 4) if (t.pendingTasks === 0) {
			if (t.status === 0 && (t.status = 1), r !== null && r.parentFlushed && (r.status === 1 || r.status === 3) && Na(t, r), t.parentFlushed && e.completedBoundaries.push(t), t.status === 1) n = t.row, n !== null && kr(n.hoistables, t.contentState), Wi(e, t) || (t.fallbackAbortableTasks.forEach(Da, e), t.fallbackAbortableTasks.clear(), n !== null && --n.pendingTasks === 0 && la(e, n)), e.pendingRootTasks === 0 && e.trackedPostpones === null && t.contentPreamble !== null && za(e);
			else if (t.status === 5 && (t = t.row, t !== null)) {
				if (e.trackedPostpones !== null) {
					n = e.trackedPostpones;
					var i = t.next;
					if (i !== null && (r = i.boundaries, r !== null)) for (i.boundaries = null, i = 0; i < r.length; i++) {
						var a = r[i];
						xa(e, n, a), Fa(e, a, null, null);
					}
				}
				--t.pendingTasks === 0 && la(e, t);
			}
		} else r === null || !r.parentFlushed || r.status !== 1 && r.status !== 3 || (Na(t, r), t.completedSegments.length === 1 && t.parentFlushed && e.partialBoundaries.push(t)), t = t.row, t !== null && t.together && da(e, t);
		e.allPendingTasks === 0 && Ma(e);
	}
	function Ia(e) {
		if (e.status !== 14 && e.status !== 13) {
			var t = Ir, n = ye.H;
			ye.H = Pi;
			var r = ye.A;
			ye.A = Ii;
			var i = Zi;
			Zi = e;
			var a = Fi;
			Fi = e.resumableState;
			try {
				var o = e.pingedTasks, s;
				for (s = 0; s < o.length; s++) {
					var c = o[s], l = e, u = c.blockedSegment;
					if (u === null) {
						var d = l;
						if (c.replay.pendingTasks !== 0) {
							Hr(c.context);
							try {
								if (typeof c.replay.slots == "number" ? _a(d, c, c.replay.slots, c.node, c.childIndex) : ya(d, c), c.replay.pendingTasks === 1 && 0 < c.replay.nodes.length) throw Error("Couldn't find all resumable slots by key/index during replaying. The tree doesn't match so React will fallback to client rendering.");
								c.replay.pendingTasks--, c.abortSet.delete(c), Fa(d, c.blockedBoundary, c.row, null);
							} catch (e) {
								Si();
								var f = e === Zr ? ei() : e;
								if (typeof f == "object" && f && typeof f.then == "function") {
									var p = c.ping;
									f.then(p, p), c.thenableState = e === Zr ? xi() : null;
								} else {
									c.replay.pendingTasks--, c.abortSet.delete(c);
									var m = oa(c.componentStack);
									l = void 0;
									var h = d, g = c.blockedBoundary, _ = d.status === 12 ? d.fatalError : f, v = c.replay.nodes, ee = c.replay.slots;
									l = sa(h, _, m), Oa(h, g, v, ee, _, l), d.pendingRootTasks--, d.pendingRootTasks === 0 && ja(d), d.allPendingTasks--, d.allPendingTasks === 0 && Ma(d);
								}
							}
						}
					} else if (d = void 0, h = u, h.status === 0) {
						h.status = 6, Hr(c.context);
						var y = h.children.length, te = h.chunks.length;
						try {
							ya(l, c), h.lastPushedText && h.textEmbedded && h.chunks.push(qe), c.abortSet.delete(c), h.status = 1, Pa(l, c.blockedBoundary, h), Fa(l, c.blockedBoundary, c.row, h);
						} catch (e) {
							Si(), h.children.length = y, h.chunks.length = te;
							var b = e === Zr ? ei() : l.status === 12 ? l.fatalError : e;
							if (l.status === 12 && l.trackedPostpones !== null) {
								var x = l.trackedPostpones, S = oa(c.componentStack);
								c.abortSet.delete(c), sa(l, b, S), Sa(l, x, c, h), Fa(l, c.blockedBoundary, c.row, h);
							} else if (typeof b == "object" && b && typeof b.then == "function") {
								h.status = 0, c.thenableState = e === Zr ? xi() : null;
								var C = c.ping;
								b.then(C, C);
							} else {
								var ne = oa(c.componentStack);
								c.abortSet.delete(c), h.status = 4;
								var w = c.blockedBoundary, T = c.row;
								if (T !== null && --T.pendingTasks === 0 && la(l, T), l.allPendingTasks--, d = sa(l, b, ne), w === null) ca(l, b);
								else if (w.pendingTasks--, w.status !== 4) {
									w.status = 4, w.errorDigest = d, Ca(l, w);
									var re = w.row;
									re !== null && --re.pendingTasks === 0 && la(l, re), w.parentFlushed && l.clientRenderedBoundaries.push(w), l.pendingRootTasks === 0 && l.trackedPostpones === null && w.contentPreamble !== null && za(l);
								}
								l.allPendingTasks === 0 && Ma(l);
							}
						}
					}
				}
				o.splice(0, s), e.destination !== null && qa(e, e.destination);
			} catch (t) {
				sa(e, t, {}), ca(e, t);
			} finally {
				Fi = a, ye.H = n, ye.A = r, n === Pi && Hr(t), Zi = i;
			}
		}
	}
	function La(e, t, n) {
		t.preambleChildren.length && n.push(t.preambleChildren);
		for (var r = !1, i = 0; i < t.children.length; i++) r = Ra(e, t.children[i], n) || r;
		return r;
	}
	function Ra(e, t, n) {
		var r = t.boundary;
		if (r === null) return La(e, t, n);
		var i = r.contentPreamble, a = r.fallbackPreamble;
		if (i === null || a === null) return !1;
		switch (r.status) {
			case 1:
				if (Pt(e.renderState, i), e.byteSize += r.byteSize, t = r.completedSegments[0], !t) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
				return La(e, t, n);
			case 5: if (e.trackedPostpones !== null) return !0;
			case 4: if (t.status === 1) return Pt(e.renderState, a), La(e, t, n);
			default: return !0;
		}
	}
	function za(e) {
		if (e.completedRootSegment && e.completedPreambleSegments === null) {
			var t = [], n = e.byteSize, r = Ra(e, e.completedRootSegment, t), i = e.renderState.preamble;
			!1 === r || i.headChunks && i.bodyChunks ? e.completedPreambleSegments = t : e.byteSize = n;
		}
	}
	function Ba(e, t, n, r) {
		switch (n.parentFlushed = !0, n.status) {
			case 0: n.id = e.nextSegmentId++;
			case 5: return r = n.id, n.lastPushedText = !1, n.textEmbedded = !1, e = e.renderState, k(t, Lt), k(t, e.placeholderPrefix), e = r.toString(16), k(t, e), j(t, Rt);
			case 1:
				n.status = 2;
				var i = !0, a = n.chunks, o = 0;
				n = n.children;
				for (var s = 0; s < n.length; s++) {
					for (i = n[s]; o < i.index; o++) k(t, a[o]);
					i = Ha(e, t, i, r);
				}
				for (; o < a.length - 1; o++) k(t, a[o]);
				return o < a.length && (i = j(t, a[o])), i;
			case 3: return !0;
			default: throw Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
		}
	}
	var Va = 0;
	function Ha(e, t, n, r) {
		var i = n.boundary;
		if (i === null) return Ba(e, t, n, r);
		if (i.parentFlushed = !0, i.status === 4) {
			var a = i.row;
			a !== null && --a.pendingTasks === 0 && la(e, a), i = i.errorDigest, j(t, Ut), k(t, Gt), i && (k(t, qt), k(t, P(i)), k(t, Kt)), j(t, Jt), Ba(e, t, n, r);
		} else if (i.status !== 1) i.status === 0 && (i.rootSegmentID = e.nextSegmentId++), 0 < i.completedSegments.length && e.partialBoundaries.push(i), Yt(t, e.renderState, i.rootSegmentID), r && kr(r, i.fallbackState), Ba(e, t, n, r);
		else if (!Ka && Wi(e, i) && (Va + i.byteSize > e.progressiveChunkSize || Ar(i.contentState))) i.rootSegmentID = e.nextSegmentId++, e.completedBoundaries.push(i), Yt(t, e.renderState, i.rootSegmentID), Ba(e, t, n, r);
		else {
			if (Va += i.byteSize, r && kr(r, i.contentState), n = i.row, n !== null && Wi(e, i) && --n.pendingTasks === 0 && la(e, n), j(t, U), n = i.completedSegments, n.length !== 1) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
			Ha(e, t, n[0], r);
		}
		return j(t, Wt);
	}
	function Ua(e, t, n, r) {
		return gn(t, e.renderState, n.parentFormatContext, n.id), Ha(e, t, n, r), _n(t, n.parentFormatContext);
	}
	function Wa(e, t, n) {
		Va = n.byteSize;
		for (var r = n.completedSegments, i = 0; i < r.length; i++) Ga(e, t, n, r[i]);
		r.length = 0, r = n.row, r !== null && Wi(e, n) && --r.pendingTasks === 0 && la(e, r), qn(t, n.contentState, e.renderState), r = e.resumableState, e = e.renderState, i = n.rootSegmentID, n = n.contentState;
		var a = e.stylesToHoist;
		return e.stylesToHoist = !1, k(t, e.startInlineScript), k(t, st), a ? (!(r.instructions & 4) && (r.instructions |= 4, k(t, An)), !(r.instructions & 2) && (r.instructions |= 2, k(t, Sn)), r.instructions & 8 ? k(t, Tn) : (r.instructions |= 8, k(t, wn))) : (!(r.instructions & 2) && (r.instructions |= 2, k(t, Sn)), k(t, Cn)), r = i.toString(16), k(t, e.boundaryPrefix), k(t, r), k(t, En), k(t, e.segmentPrefix), k(t, r), a ? (k(t, Dn), dr(t, n)) : k(t, On), n = j(t, kn), Ft(t, e) && n;
	}
	function Ga(e, t, n, r) {
		if (r.status === 2) return !0;
		var i = n.contentState, a = r.id;
		if (a === -1) {
			if ((r.id = n.rootSegmentID) === -1) throw Error("A root segment ID must have been assigned by now. This is a bug in React.");
			return Ua(e, t, r, i);
		}
		return a === n.rootSegmentID ? Ua(e, t, r, i) : (Ua(e, t, r, i), n = e.resumableState, e = e.renderState, k(t, e.startInlineScript), k(t, st), n.instructions & 1 ? k(t, yn) : (n.instructions |= 1, k(t, vn)), k(t, e.segmentPrefix), a = a.toString(16), k(t, a), k(t, bn), k(t, e.placeholderPrefix), k(t, a), t = j(t, xn), t);
	}
	var Ka = !1;
	function qa(e, t) {
		E = new Uint8Array(2048), D = 0, O = !0;
		try {
			if (!(0 < e.pendingRootTasks)) {
				var n, r = e.completedRootSegment;
				if (r !== null) {
					if (r.status === 5) return;
					var i = e.completedPreambleSegments;
					if (i === null) return;
					Va = e.byteSize;
					var a = e.resumableState, o = e.renderState, s = o.preamble, c = s.htmlChunks, l = s.headChunks, u;
					if (c) {
						for (u = 0; u < c.length; u++) k(t, c[u]);
						if (l) for (u = 0; u < l.length; u++) k(t, l[u]);
						else k(t, kt("head")), k(t, st);
					} else if (l) for (u = 0; u < l.length; u++) k(t, l[u]);
					var d = o.charsetChunks;
					for (u = 0; u < d.length; u++) k(t, d[u]);
					d.length = 0, o.preconnects.forEach(Jn, t), o.preconnects.clear();
					var f = o.viewportChunks;
					for (u = 0; u < f.length; u++) k(t, f[u]);
					f.length = 0, o.fontPreloads.forEach(Jn, t), o.fontPreloads.clear(), o.highImagePreloads.forEach(Jn, t), o.highImagePreloads.clear(), we = o, o.styles.forEach(nr, t), we = null;
					var p = o.importMapChunks;
					for (u = 0; u < p.length; u++) k(t, p[u]);
					p.length = 0, o.bootstrapScripts.forEach(Jn, t), o.scripts.forEach(Jn, t), o.scripts.clear(), o.bulkPreloads.forEach(Jn, t), o.bulkPreloads.clear(), c || l || (a.instructions |= 32);
					var m = o.hoistableChunks;
					for (u = 0; u < m.length; u++) k(t, m[u]);
					for (a = m.length = 0; a < i.length; a++) {
						var h = i[a];
						for (o = 0; o < h.length; o++) Ha(e, t, h[o], null);
					}
					var g = e.renderState.preamble, _ = g.headChunks;
					(g.htmlChunks || _) && k(t, Nt("head"));
					var v = g.bodyChunks;
					if (v) for (i = 0; i < v.length; i++) k(t, v[i]);
					Ha(e, t, r, null), e.completedRootSegment = null;
					var ee = e.renderState;
					if (e.allPendingTasks !== 0 || e.clientRenderedBoundaries.length !== 0 || e.completedBoundaries.length !== 0 || e.trackedPostpones !== null && (e.trackedPostpones.rootNodes.length !== 0 || e.trackedPostpones.rootSlots !== null)) {
						var y = e.resumableState;
						if (!(y.instructions & 64)) {
							if (y.instructions |= 64, k(t, ee.startInlineScript), !(y.instructions & 32)) {
								y.instructions |= 32;
								var te = "_" + y.idPrefix + "R_";
								k(t, ar), k(t, P(te)), k(t, L);
							}
							k(t, st), k(t, It), j(t, F);
						}
					}
					Ft(t, ee);
				}
				var b = e.renderState;
				r = 0;
				var x = b.viewportChunks;
				for (r = 0; r < x.length; r++) k(t, x[r]);
				x.length = 0, b.preconnects.forEach(Jn, t), b.preconnects.clear(), b.fontPreloads.forEach(Jn, t), b.fontPreloads.clear(), b.highImagePreloads.forEach(Jn, t), b.highImagePreloads.clear(), b.styles.forEach(ir, t), b.scripts.forEach(Jn, t), b.scripts.clear(), b.bulkPreloads.forEach(Jn, t), b.bulkPreloads.clear();
				var S = b.hoistableChunks;
				for (r = 0; r < S.length; r++) k(t, S[r]);
				S.length = 0;
				var C = e.clientRenderedBoundaries;
				for (n = 0; n < C.length; n++) {
					var ne = C[n];
					b = t;
					var w = e.resumableState, T = e.renderState, A = ne.rootSegmentID, ae = ne.errorDigest;
					k(b, T.startInlineScript), k(b, st), w.instructions & 4 ? k(b, Mn) : (w.instructions |= 4, k(b, jn)), k(b, T.boundaryPrefix), k(b, A.toString(16)), k(b, K), ae && (k(b, Nn), k(b, In(ae || "")));
					var M = j(b, Pn);
					if (!M) {
						e.destination = null, n++, C.splice(0, n);
						return;
					}
				}
				C.splice(0, n);
				var oe = e.completedBoundaries;
				for (n = 0; n < oe.length; n++) if (!Wa(e, t, oe[n])) {
					e.destination = null, n++, oe.splice(0, n);
					return;
				}
				oe.splice(0, n), ie(t), E = new Uint8Array(2048), D = 0, Ka = O = !0;
				var se = e.partialBoundaries;
				for (n = 0; n < se.length; n++) {
					var N = se[n];
					a: {
						C = e, ne = t, Va = N.byteSize;
						var ce = N.completedSegments;
						for (M = 0; M < ce.length; M++) if (!Ga(C, ne, N, ce[M])) {
							M++, ce.splice(0, M);
							var le = !1;
							break a;
						}
						ce.splice(0, M);
						var ue = N.row;
						ue !== null && ue.together && N.pendingTasks === 1 && (ue.pendingTasks === 1 ? ua(C, ue, ue.hoistables) : ue.pendingTasks--), le = qn(ne, N.contentState, C.renderState);
					}
					if (!le) {
						e.destination = null, n++, se.splice(0, n);
						return;
					}
				}
				se.splice(0, n), Ka = !1;
				var de = e.completedBoundaries;
				for (n = 0; n < de.length; n++) if (!Wa(e, t, de[n])) {
					e.destination = null, n++, de.splice(0, n);
					return;
				}
				de.splice(0, n);
			}
		} finally {
			Ka = !1, e.allPendingTasks === 0 && e.clientRenderedBoundaries.length === 0 && e.completedBoundaries.length === 0 ? (e.flushScheduled = !1, n = e.resumableState, n.hasBody && k(t, Nt("body")), n.hasHtml && k(t, Nt("html")), ie(t), re(t), e.status = 14, t.end(), e.destination = null) : (ie(t), re(t));
		}
	}
	function Ja(e) {
		e.flushScheduled = e.destination !== null, T(function() {
			return Mr.run(e, Ia, e);
		}), setImmediate(function() {
			e.status === 10 && (e.status = 11), e.trackedPostpones === null && Mr.run(e, Ya, e);
		});
	}
	function Ya(e) {
		Aa(e, e.pendingRootTasks === 0);
	}
	function Xa(e) {
		!1 === e.flushScheduled && e.pingedTasks.length === 0 && e.destination !== null && (e.flushScheduled = !0, setImmediate(function() {
			var t = e.destination;
			t ? qa(e, t) : e.flushScheduled = !1;
		}));
	}
	function Za(e, t) {
		if (e.status === 13) e.status = 14, t.destroy(e.fatalError);
		else if (e.status !== 14 && e.destination === null) {
			e.destination = t;
			try {
				qa(e, t);
			} catch (t) {
				sa(e, t, {}), ca(e, t);
			}
		}
	}
	function Qa(e, t) {
		(e.status === 11 || e.status === 10) && (e.status = 12);
		try {
			var n = e.abortableTasks;
			if (0 < n.size) {
				var r = t === void 0 ? Error("The render was aborted by the server without a reason.") : typeof t == "object" && t && typeof t.then == "function" ? Error("The render was aborted by the server with a promise.") : t;
				e.fatalError = r, n.forEach(function(t) {
					return ka(t, e, r);
				}), n.clear();
			}
			e.destination !== null && qa(e, e.destination);
		} catch (t) {
			sa(e, t, {}), ca(e, t);
		}
	}
	function $a(e, t, n) {
		if (t === null) n.rootNodes.push(e);
		else {
			var r = n.workingMap, i = r.get(t);
			i === void 0 && (i = [
				t[1],
				t[2],
				[],
				null
			], r.set(t, i), $a(i, t[0], n)), i[2].push(e);
		}
	}
	function eo(e) {
		var t = e.trackedPostpones;
		if (t === null || t.rootNodes.length === 0 && t.rootSlots === null) return e.trackedPostpones = null;
		if (e.completedRootSegment === null || e.completedRootSegment.status !== 5 && e.completedPreambleSegments !== null) {
			var n = e.nextSegmentId, r = t.rootSlots, i = e.resumableState;
			i.bootstrapScriptContent = void 0, i.bootstrapScripts = void 0, i.bootstrapModules = void 0;
		} else {
			n = 0, r = -1, i = e.resumableState;
			var a = e.renderState;
			i.nextFormID = 0, i.hasBody = !1, i.hasHtml = !1, i.unknownResources = { font: a.resets.font }, i.dnsResources = a.resets.dns, i.connectResources = a.resets.connect, i.imageResources = a.resets.image, i.styleResources = a.resets.style, i.scriptResources = {}, i.moduleUnknownResources = {}, i.moduleScriptResources = {}, i.instructions = 0;
		}
		return {
			nextSegmentId: n,
			rootFormatContext: e.rootFormatContext,
			progressiveChunkSize: e.progressiveChunkSize,
			resumableState: e.resumableState,
			replayNodes: t.rootNodes,
			replaySlots: r
		};
	}
	function to() {
		var e = i.version;
		if (e !== "19.2.0") throw Error("Incompatible React versions: The \"react\" and \"react-dom\" packages must have the exact same version. Instead got:\n  - react:      " + (e + "\n  - react-dom:  19.2.0\nLearn more: https://react.dev/warnings/version-mismatch"));
	}
	to();
	function no(e, t) {
		return function() {
			return Za(t, e);
		};
	}
	function ro(e, t) {
		return function() {
			e.destination = null, Qa(e, Error(t));
		};
	}
	function io(e, t) {
		var n = ze(t ? t.identifierPrefix : void 0, t ? t.unstable_externalRuntimeSrc : void 0, t ? t.bootstrapScriptContent : void 0, t ? t.bootstrapScripts : void 0, t ? t.bootstrapModules : void 0);
		return qi(e, n, Re(n, t ? t.nonce : void 0, t ? t.unstable_externalRuntimeSrc : void 0, t ? t.importMap : void 0, t ? t.onHeaders : void 0, t ? t.maxHeadersLength : void 0), He(t ? t.namespaceURI : void 0), t ? t.progressiveChunkSize : void 0, t ? t.onError : void 0, t ? t.onAllReady : void 0, t ? t.onShellReady : void 0, t ? t.onShellError : void 0, void 0, t ? t.onPostpone : void 0, t ? t.formState : void 0);
	}
	function ao(e) {
		return {
			write: function(t) {
				return typeof t == "string" && (t = ae.encode(t)), e.enqueue(t), !0;
			},
			end: function() {
				e.close();
			},
			destroy: function(t) {
				typeof e.error == "function" ? e.error(t) : e.close();
			}
		};
	}
	function oo(e, t, n) {
		return Yi(e, t, Re(t.resumableState, n ? n.nonce : void 0, void 0, void 0, void 0, void 0), n ? n.onError : void 0, n ? n.onAllReady : void 0, n ? n.onShellReady : void 0, n ? n.onShellError : void 0, void 0, n ? n.onPostpone : void 0);
	}
	to();
	function so(e) {
		return {
			write: function(t) {
				return typeof t == "string" && (t = ae.encode(t)), e.enqueue(t), !0;
			},
			end: function() {
				e.close();
			},
			destroy: function(t) {
				typeof e.error == "function" ? e.error(t) : e.close();
			}
		};
	}
	function co(e) {
		return {
			write: function(t) {
				return e.push(t);
			},
			end: function() {
				e.push(null);
			},
			destroy: function(t) {
				e.destroy(t);
			}
		};
	}
	e.prerender = function(e, t) {
		return new Promise(function(n, r) {
			var i = t ? t.onHeaders : void 0, a;
			i && (a = function(e) {
				i(new Headers(e));
			});
			var o = ze(t ? t.identifierPrefix : void 0, t ? t.unstable_externalRuntimeSrc : void 0, t ? t.bootstrapScriptContent : void 0, t ? t.bootstrapScripts : void 0, t ? t.bootstrapModules : void 0), s = Ji(e, o, Re(o, void 0, t ? t.unstable_externalRuntimeSrc : void 0, t ? t.importMap : void 0, a, t ? t.maxHeadersLength : void 0), He(t ? t.namespaceURI : void 0), t ? t.progressiveChunkSize : void 0, t ? t.onError : void 0, function() {
				var e, t = new ReadableStream({
					type: "bytes",
					start: function(t) {
						e = so(t);
					},
					pull: function() {
						Za(s, e);
					},
					cancel: function(e) {
						s.destination = null, Qa(s, e);
					}
				}, { highWaterMark: 0 });
				t = {
					postponed: eo(s),
					prelude: t
				}, n(t);
			}, void 0, void 0, r, t ? t.onPostpone : void 0);
			if (t && t.signal) {
				var c = t.signal;
				if (c.aborted) Qa(s, c.reason);
				else {
					var l = function() {
						Qa(s, c.reason), c.removeEventListener("abort", l);
					};
					c.addEventListener("abort", l);
				}
			}
			Ja(s);
		});
	}, e.prerenderToNodeStream = function(e, t) {
		return new Promise(function(n, r) {
			var i = ze(t ? t.identifierPrefix : void 0, t ? t.unstable_externalRuntimeSrc : void 0, t ? t.bootstrapScriptContent : void 0, t ? t.bootstrapScripts : void 0, t ? t.bootstrapModules : void 0), a = Ji(e, i, Re(i, void 0, t ? t.unstable_externalRuntimeSrc : void 0, t ? t.importMap : void 0, t ? t.onHeaders : void 0, t ? t.maxHeadersLength : void 0), He(t ? t.namespaceURI : void 0), t ? t.progressiveChunkSize : void 0, t ? t.onError : void 0, function() {
				var e = new o.Readable({ read: function() {
					Za(a, t);
				} }), t = co(e);
				e = {
					postponed: eo(a),
					prelude: e
				}, n(e);
			}, void 0, void 0, r, t ? t.onPostpone : void 0);
			if (t && t.signal) {
				var s = t.signal;
				if (s.aborted) Qa(a, s.reason);
				else {
					var c = function() {
						Qa(a, s.reason), s.removeEventListener("abort", c);
					};
					s.addEventListener("abort", c);
				}
			}
			Ja(a);
		});
	}, e.renderToPipeableStream = function(e, t) {
		var n = io(e, t), r = !1;
		return Ja(n), {
			pipe: function(e) {
				if (r) throw Error("React currently only supports piping to one writable stream.");
				return r = !0, Aa(n, n.trackedPostpones === null || n.completedRootSegment === null ? n.pendingRootTasks === 0 : n.completedRootSegment.status !== 5), Za(n, e), e.on("drain", no(e, n)), e.on("error", ro(n, "The destination stream errored while writing data.")), e.on("close", ro(n, "The destination stream closed early.")), e;
			},
			abort: function(e) {
				Qa(n, e);
			}
		};
	}, e.renderToReadableStream = function(e, t) {
		return new Promise(function(n, r) {
			var i, a, o = new Promise(function(e, t) {
				a = e, i = t;
			}), s = t ? t.onHeaders : void 0, c;
			s && (c = function(e) {
				s(new Headers(e));
			});
			var l = ze(t ? t.identifierPrefix : void 0, t ? t.unstable_externalRuntimeSrc : void 0, t ? t.bootstrapScriptContent : void 0, t ? t.bootstrapScripts : void 0, t ? t.bootstrapModules : void 0), u = qi(e, l, Re(l, t ? t.nonce : void 0, t ? t.unstable_externalRuntimeSrc : void 0, t ? t.importMap : void 0, c, t ? t.maxHeadersLength : void 0), He(t ? t.namespaceURI : void 0), t ? t.progressiveChunkSize : void 0, t ? t.onError : void 0, a, function() {
				var e, t = new ReadableStream({
					type: "bytes",
					start: function(t) {
						e = ao(t);
					},
					pull: function() {
						Za(u, e);
					},
					cancel: function(e) {
						u.destination = null, Qa(u, e);
					}
				}, { highWaterMark: 0 });
				t.allReady = o, n(t);
			}, function(e) {
				o.catch(function() {}), r(e);
			}, i, t ? t.onPostpone : void 0, t ? t.formState : void 0);
			if (t && t.signal) {
				var d = t.signal;
				if (d.aborted) Qa(u, d.reason);
				else {
					var f = function() {
						Qa(u, d.reason), d.removeEventListener("abort", f);
					};
					d.addEventListener("abort", f);
				}
			}
			Ja(u);
		});
	}, e.resume = function(e, t, n) {
		return new Promise(function(r, i) {
			var a, o, s = new Promise(function(e, t) {
				o = e, a = t;
			}), c = Yi(e, t, Re(t.resumableState, n ? n.nonce : void 0, void 0, void 0, void 0, void 0), n ? n.onError : void 0, o, function() {
				var e, t = new ReadableStream({
					type: "bytes",
					start: function(t) {
						e = ao(t);
					},
					pull: function() {
						Za(c, e);
					},
					cancel: function(e) {
						c.destination = null, Qa(c, e);
					}
				}, { highWaterMark: 0 });
				t.allReady = s, r(t);
			}, function(e) {
				s.catch(function() {}), i(e);
			}, a, n ? n.onPostpone : void 0);
			if (n && n.signal) {
				var l = n.signal;
				if (l.aborted) Qa(c, l.reason);
				else {
					var u = function() {
						Qa(c, l.reason), l.removeEventListener("abort", u);
					};
					l.addEventListener("abort", u);
				}
			}
			Ja(c);
		});
	}, e.resumeAndPrerender = function(e, t, n) {
		return new Promise(function(r, i) {
			var a = Xi(e, t, Re(t.resumableState, void 0, void 0, void 0, void 0, void 0), n ? n.onError : void 0, function() {
				var e, t = new ReadableStream({
					type: "bytes",
					start: function(t) {
						e = so(t);
					},
					pull: function() {
						Za(a, e);
					},
					cancel: function(e) {
						a.destination = null, Qa(a, e);
					}
				}, { highWaterMark: 0 });
				t = {
					postponed: eo(a),
					prelude: t
				}, r(t);
			}, void 0, void 0, i, n ? n.onPostpone : void 0);
			if (n && n.signal) {
				var o = n.signal;
				if (o.aborted) Qa(a, o.reason);
				else {
					var s = function() {
						Qa(a, o.reason), o.removeEventListener("abort", s);
					};
					o.addEventListener("abort", s);
				}
			}
			Ja(a);
		});
	}, e.resumeAndPrerenderToNodeStream = function(e, t, n) {
		return new Promise(function(r, i) {
			var a = Xi(e, t, Re(t.resumableState, void 0, void 0, void 0, void 0, void 0), n ? n.onError : void 0, function() {
				var e = new o.Readable({ read: function() {
					Za(a, t);
				} }), t = co(e);
				e = {
					postponed: eo(a),
					prelude: e
				}, r(e);
			}, void 0, void 0, i, n ? n.onPostpone : void 0);
			if (n && n.signal) {
				var s = n.signal;
				if (s.aborted) Qa(a, s.reason);
				else {
					var c = function() {
						Qa(a, s.reason), s.removeEventListener("abort", c);
					};
					s.addEventListener("abort", c);
				}
			}
			Ja(a);
		});
	}, e.resumeToPipeableStream = function(e, t, n) {
		var r = oo(e, t, n), i = !1;
		return Ja(r), {
			pipe: function(e) {
				if (i) throw Error("React currently only supports piping to one writable stream.");
				return i = !0, Za(r, e), e.on("drain", no(e, r)), e.on("error", ro(r, "The destination stream errored while writing data.")), e.on("close", ro(r, "The destination stream closed early.")), e;
			},
			abort: function(e) {
				Qa(r, e);
			}
		};
	}, e.version = "19.2.0";
})), Nv = (/* @__PURE__ */ p(((e) => {
	var t = jv(), n = Mv();
	e.version = t.version, e.renderToString = t.renderToString, e.renderToStaticMarkup = t.renderToStaticMarkup, e.renderToPipeableStream = n.renderToPipeableStream, e.renderToReadableStream = n.renderToReadableStream, e.resumeToPipeableStream = n.resumeToPipeableStream, e.resume = n.resume;
})))(), Pv = (e) => (0, Nv.renderToStaticMarkup)(e).replaceAll("&quot;", "\"").replaceAll("&#x27;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&#123;", "{").replaceAll("&#125;", "}").replaceAll("&amp;", "&"), Fv = new E(), Iv = (e) => async (...t) => {
	try {
		let n = Fv.opts().config, r = await iu(n);
		if (!r) return;
		let i = Pv(await e(r, ...t));
		console.log(i);
	} catch (e) {
		e instanceof J ? Fv.error(e.message) : Fv.error(`There was an error running the command. If the problem persists please report it as a bug to iMotions in version ${Fv.version()}. Error: ${e instanceof Error ? e.message : "Unknown error"}`);
	}
};
Fv.name("aimotions").description("CLI for working with your iMotions studies").version(tu()).addHelpText("after", "\nIf you are not logged in, we will automatically attempt to log you in when running a command that requires authentication.\nAfter successful authentication, you can run the command again."), Fv.addOption(new O("--config <path>", "Path to the config file to use").default(n.resolve(t.homedir(), "./.aimotions")).hideHelp());
for (let e of Ev) e.addToProgram(Fv, Iv);
Fv.command("logout").description("Log out").action(Ov), Fv.command("api-info", { hidden: !0 }).action(Iv(Dv)), await Fv.parseAsync();
//#endregion
export {};
