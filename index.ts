const isUndefined = (value: any): value is undefined => value === undefined;

const isString = (value: any): value is string => typeof value === 'string';

const TRUTHY_STRING = ['true', 't', 'yes', 'y', '1'];

const FALSY_STRING = ['false', 'f', 'no', 'n', '0'];

const DEFAULT_ARGUMENTS_SPECIFICATION = {
	help: {
		shortName: 'h',
		type: Boolean,
	},
	verbose: {
		shortName: 'v',
		type: Boolean,
	},
};

interface OptionalArgumentSpecification {
	shortName?: string;
	type?: any;
	required?: boolean;
	defaultValue?: any;
	mapValue?: (value) => any;
	usage?: string;
}

interface ArgumentSpecification extends OptionalArgumentSpecification {
	type: any;
	required: boolean;
}

interface ArgumentAndArgumentSpecification extends ArgumentSpecification {
	value: string;
}

interface ArgumentsSpecification {
	[longName: string]: ArgumentSpecification;
}

interface OptionalArgumentsSpecification {
	[longName: string]: OptionalArgumentSpecification;
}

class InvalidArgumentsSpecificationError extends Error {
	argumentsSpecification: ArgumentSpecification;

	constructor(argumentsSpecification, ...genericArgs) {
		super(...genericArgs);
		this.name = 'InvalidArgumentsSpecificationError';
		this.argumentsSpecification = argumentsSpecification;
	}
}

class UnknownArgError extends Error {
	constructor(argument, ...genericArgs) {
		super(...genericArgs);
		this.name = 'UnknownArgError';
		this.message = `${argument} could not be parsed as it is an unknown argument`;
	}
}

class InvalidArgError extends Error {
	argument: [string, ArgumentSpecification];

	constructor(argument, ...genericArgs) {
		super(...genericArgs);
		this.name = 'InvalidArgError';
		this.argument = argument;
	}
}

class ArgumentParser {
	argumentsSpecification: ArgumentsSpecification;
	helpUsage: string;
	helpOnNoArguments: boolean;
	errorOnUnknownArguments: boolean;

	constructor(
		argumentsSpecification: OptionalArgumentsSpecification = {},
		{ helpUsage = 'Options:', helpOnNoArguments = true, errorOnUnknownArguments = true } = {},
	) {
		this.setArgumentsSpecification({ ...DEFAULT_ARGUMENTS_SPECIFICATION, ...argumentsSpecification });

		this.helpUsage = helpUsage;
		this.helpOnNoArguments = helpOnNoArguments;
		this.errorOnUnknownArguments = errorOnUnknownArguments;
	}

	setArgumentsSpecification(argsSpec: OptionalArgumentsSpecification) {
		this.argumentsSpecification = Object.entries(argsSpec)
			.reduce((argumentsSpecification: ArgumentsSpecification, [longName, argumentSpecification]) => {
				if (argumentSpecification.shortName) {
					const duplicateArgSpec = Object.values(argumentsSpecification)
						.find(({ shortName }) => shortName === argumentSpecification.shortName);
					if (duplicateArgSpec) {
						throw new InvalidArgumentsSpecificationError(
							{ ...argumentsSpecification, [longName]: argumentSpecification },
							`${argumentSpecification.shortName} cannot be used as a short argument for more than one long argument`,
						);
					}
				}
				if (isUndefined(argumentSpecification.type)) {
					argumentSpecification.type = Boolean;
				}
				if (isUndefined(argumentSpecification.required)) {
					argumentSpecification.required = false;
				}
				if (isUndefined(argumentSpecification.defaultValue) && argumentSpecification.type === Boolean) {
					argumentSpecification.defaultValue = false;
				}
				argumentsSpecification[longName] = argumentSpecification as ArgumentSpecification;
				return argumentsSpecification;
			}, {});
	}

	help() {
		const argumentsHelp = Object.entries(this.argumentsSpecification)
			.map(([longName, { shortName, type, defaultValue, usage }]) => {
				const defaultValueHelp = isUndefined(defaultValue) ?
					'' :
					` [default: ${isString(defaultValue) ? `"${defaultValue}"` : defaultValue}]`;

				const lines = [
					`--${longName}${shortName ? `, -${shortName}` : ''}`,
					`[${type.name}]${defaultValueHelp}`,
				];

				if (usage) {
					lines.push(usage);
				}

				return lines.join('\n');
			});

		console.info([this.helpUsage, ...argumentsHelp].join('\n\n'));
	}

	getDefaultArguments() {
		return Object.entries(this.argumentsSpecification)
			.reduce((defaultArguments: { [longName: string]: any }, [longName, argSpec]) => {
				if (!isUndefined(argSpec.defaultValue)) {
					defaultArguments[longName] = argSpec.defaultValue;
				}
				return defaultArguments;
			}, {});
	}

	getShortArgument(argument: string): [string, string | undefined] | undefined {
		const match = argument.match(/^-((\w+)|(\w)=(.+))$/);
		if (!match) {
			return;
		}
		const [, , onlyName, name = onlyName, value] = match;
		return [name, value];
	}

	isShortArgument(argument) { return !!this.getShortArgument(argument); }

	getLongArgument(argument: string): [string, string | undefined] | undefined {
		const match = argument.match(/^--([\w][\w-]*[\w])(=(.+))?$/);
		if (!match) {
			return;
		}
		const [, name, , value] = match;
		return [name, value];
	}

	isLongArgument(argument) { return !!this.getLongArgument(argument); }

	getNameAndSpecificationByShortName(argShortName) {
		const [name] = this.getShortArgument(argShortName);
		return Object.entries(this.argumentsSpecification)
			.find(([longName, { shortName }]) => shortName === name);
	}

	getNameAndSpecificationByLongName(argLongName) {
		const [name] = this.getLongArgument(argLongName);
		return Object.entries(this.argumentsSpecification)
			.find(([longName]) => longName === name);
	}

	toArgumentValue({ type, value, mapValue }: ArgumentAndArgumentSpecification) {
		let castedValue;

		switch (type) {
			case Boolean:
				if (TRUTHY_STRING.includes(value.toLowerCase())) {
					castedValue = true;
				} else if (FALSY_STRING.includes(value.toLowerCase())) {
					castedValue = false;
				}
				break;
			case Number:
				castedValue = Number(value);
				break;
			default:
				castedValue = value;
				break;
		}

		return mapValue ? mapValue(castedValue) : castedValue;
	}

	parse(argumentsToParse = process.argv.slice(2)) {
		if (this.helpOnNoArguments && argumentsToParse.length === 0) {
			this.help();
			return;
		}

		const parsedArguments = this.getDefaultArguments();

		while (argumentsToParse.length > 0 && !parsedArguments.help) {
			const argument = argumentsToParse.shift();

			if (this.isShortArgument(argument)) {
				const [shortArgumentName, value] = this.getShortArgument(argument);
				if (!isUndefined(value)) {
					const longNameAndSpecification = this.getNameAndSpecificationByShortName(`-${shortArgumentName}`);

					if (!longNameAndSpecification && this.errorOnUnknownArguments) {
						throw new UnknownArgError(argument);
					}

					const [longName, argSpec] = longNameAndSpecification;
					if (argSpec.type === Boolean) {
						const argValue = this.toArgumentValue({ ...argSpec, value });

						if (isUndefined(argValue)) {
							throw new InvalidArgError(
								[longName, argSpec],
								`-${shortArgumentName} was provided with a value that was not a boolean`,
							);
						}

						parsedArguments[longName] = argValue;

					} else {
						parsedArguments[longName] = this.toArgumentValue({ ...argSpec, value });
					}

				} else {
					const shortArgumentNames = shortArgumentName.split('');
					shortArgumentNames.forEach((shortArgName) => {
						const longNameAndSpecification = this.getNameAndSpecificationByShortName(`-${shortArgName}`);

						if (!longNameAndSpecification && this.errorOnUnknownArguments) {
							throw new UnknownArgError(argument);
						}

						const [longName, argSpec] = longNameAndSpecification;
						if (longName === 'help') {
							parsedArguments.help = true;
						} else if (argSpec.type === Boolean) {
							parsedArguments[longName] = !argSpec.defaultValue;
						} else {
							if (shortArgumentNames.length > 1) {
								throw new InvalidArgError(
									[longName, argSpec],
									`-${shortArgName} was provided in a concatenated set of arguments, ${argument}, but must be provided separately as it requires a corresponding argument value`,
								);
							}
							if (argumentsToParse.length === 0) {
								throw new InvalidArgError(
									[longName, argSpec],
									`-${shortArgName} was provided without a corresponding argument value`,
								);
							}

							parsedArguments[longName] = this.toArgumentValue({ ...argSpec, value: argumentsToParse.shift() });
						}
					});
				}

			} else if (this.isLongArgument(argument)) {
				const [, value] = this.getLongArgument(argument);
				if (!isUndefined(value)) {
					const longNameAndSpecification = this.getNameAndSpecificationByLongName(argument);

					if (!longNameAndSpecification && this.errorOnUnknownArguments) {
						throw new UnknownArgError(argument);
					}

					const [longName, argSpec] = longNameAndSpecification;
					if (argSpec.type === Boolean) {
						const argValue = this.toArgumentValue({ ...argSpec, value });

						if (isUndefined(argValue)) {
							throw new InvalidArgError(
								[longName, argSpec],
								`--${longName} was provided with a value that was not a boolean`,
							);
						}

						parsedArguments[longName] = argValue;
					} else {
						parsedArguments[longName] = this.toArgumentValue({ ...argSpec, value });
					}

				} else {
					const longNameAndSpecification = this.getNameAndSpecificationByLongName(argument);

					if (!longNameAndSpecification && this.errorOnUnknownArguments) {
						throw new UnknownArgError(argument);
					}

					const [longName, argSpec] = longNameAndSpecification;
					if (longName === 'help') {
						parsedArguments.help = true;
					} else if (argSpec.type === Boolean) {
						parsedArguments[longName] = !argSpec.defaultValue;
					} else {
						if (argumentsToParse.length === 0) {
							throw new InvalidArgError(
								[longName, argSpec],
								`${argument} was provided without a corresponding argument`,
							);
						}

						parsedArguments[longName] = this.toArgumentValue({ ...argSpec, value: argumentsToParse.shift() });
					}
				}

			} else if (this.errorOnUnknownArguments) {
				throw new UnknownArgError(argument);
			}
		}

		if (parsedArguments.help) {
			this.help();
			return;
		}

		Object.entries(this.argumentsSpecification)
			.forEach(([longName, argumentSpecification]) => {
				if (argumentSpecification.required && !(longName in parsedArguments)) {
					throw new InvalidArgError(
						[longName, argumentSpecification],
						`--${longName} was not provided but is a required argument`,
					);
				}
			});

		return parsedArguments;
	}
}

export default ArgumentParser;
