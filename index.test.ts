import ArgumentParser from '.';

interface GetDSVOptions {
	delimiter?: string;
	dequote?: boolean;
	quotemark?: string;
}

const getDelimeterSeparatedValues = (values: string, { delimiter = ',', dequote = true, quotemark }: GetDSVOptions = {}) => {
	if (quotemark) {
		const separatedValues: string[] = [];
		const pushValue = (value: string) => {
			const shouldDequote = dequote && value.startsWith(quotemark) && value.endsWith(quotemark);
			separatedValues.push(shouldDequote ? value.slice(quotemark.length, value.length - quotemark.length) : value);
		};

		let valueStartIndex = 0;
		let valueEndIndex = 0;
		let inQuote = false;

		while (valueEndIndex <= values.length) {
			if (!inQuote && values.slice(valueEndIndex).startsWith(delimiter)) {
				pushValue(values.slice(valueStartIndex, valueEndIndex));
				valueStartIndex = valueEndIndex + delimiter.length;
				valueEndIndex = valueStartIndex;

			} else if (values.slice(valueEndIndex).startsWith(quotemark)) {
				if (inQuote) {
					if (!values.slice(valueEndIndex + 1).startsWith(delimiter)) {
						throw new SyntaxError(`Expected closing quotemark at the end of the value ${values.slice(valueStartIndex)}`);
					}
					inQuote = false;
				} else {
					if (valueEndIndex !== valueStartIndex) {
						throw new SyntaxError(`Expected opening quotemark at the start of the value ${values.slice(valueStartIndex)}`);
					}
					inQuote = true;
				}
				valueEndIndex++;

			} else {
				valueEndIndex++;
			}
		}

		pushValue(values.slice(valueStartIndex, valueEndIndex));

		if (inQuote) {
			throw new SyntaxError(`No closing quotemark was found for ${separatedValues[separatedValues.length - 1]}`);
		}

		return separatedValues;
	} else {
		return values.split(delimiter);
	}
};

describe('ArgumentParser', () => {
	afterEach(() => jest.restoreAllMocks());

	it('Should output help when no arguments are provided', () => {
		const cliOutput = jest.spyOn(global.console, 'info').mockImplementation(() => null);

		const argumentsParser = new ArgumentParser();
		const args = argumentsParser.parse([]);

		expect(cliOutput).toHaveBeenCalledTimes(1);
		expect(cliOutput.mock.calls[0][0]).toMatch(/^Options:.*--help.*--verbose/s);
	});

	it('Should not output help when no arguments are provided if `helpOnNoArguments: false`', () => {
		const cliOutput = jest.spyOn(global.console, 'info').mockImplementation(() => null);

		const argumentsParser = new ArgumentParser({}, { helpOnNoArguments: false });
		const args = argumentsParser.parse([]);

		expect(cliOutput).not.toHaveBeenCalled();
	});

	it('Should parse arguments provided by their long name', () => {
		const argumentsParser = new ArgumentParser();
		const args = argumentsParser.parse(['--verbose']);

		expect(args).toEqual({ help: false, verbose: true });
	});

	it('Should parse arguments provided by their short name', () => {
		const argumentsParser = new ArgumentParser();
		const args = argumentsParser.parse(['-v']);

		expect(args).toEqual({ help: false, verbose: true });
	});

	it('Should parse multiple boolean arguments provided by a concatenation of their short name', () => {
		const argumentsParser = new ArgumentParser({
			special: {
				shortName: 's',
			},
		});

		expect(argumentsParser.parse(['-sv'])).toEqual({ help: false, special: true, verbose: true });
		expect(argumentsParser.parse(['-vs'])).toEqual({ help: false, special: true, verbose: true });
	});

	it('Should parse boolean arguments with `defaultValue: true` as `true` when not provided', () => {
		const argumentsParser = new ArgumentParser({
			unplugged: {
				shortName: 'u',
				type: Boolean,
				defaultValue: true,
			},
		}, { helpOnNoArguments: false });
		const args = argumentsParser.parse([]);

		expect(args).toEqual({ help: false, unplugged: true, verbose: false });
	});

	it('Should parse boolean arguments with `defaultValue: true` as `false` when provided', () => {
		const argumentsParser = new ArgumentParser({
			unplugged: {
				shortName: 'u',
				type: Boolean,
				defaultValue: true,
			},
		});
		const args = argumentsParser.parse(['-u']);

		expect(args).toEqual({ help: false, unplugged: false, verbose: false });
	});

	it('Should parse arguments with `defaultValue: \'Developer\'` as `\'Developer\'` when not provided', () => {
		const argumentsParser = new ArgumentParser({
			jobTitle: {
				type: String,
				defaultValue: 'Developer',
			},
		}, { helpOnNoArguments: false });
		const args = argumentsParser.parse([]);

		expect(args).toEqual({ help: false, jobTitle: 'Developer', verbose: false });
	});

	it('Should parse arguments when a value is be provided with the argument name', () => {
		const argumentsParser = new ArgumentParser({
			jobTitle: {
				type: String,
				defaultValue: 'Developer',
			},
		});
		const args = argumentsParser.parse(['--jobTitle=Consultant']);

		expect(args).toEqual({ help: false, jobTitle: 'Consultant', verbose: false });
	});

	it('Should parse arguments when a value is provided as the following argument to an argument name', () => {
		const argumentsParser = new ArgumentParser({
			jobTitle: {
				type: String,
				defaultValue: 'Developer',
			},
		});
		const args = argumentsParser.parse(['--jobTitle', 'Consultant']);

		expect(args).toEqual({ help: false, jobTitle: 'Consultant', verbose: false });
	});

	it('Should parse number arguments with a value as a number when provided', () => {
		const argumentsParser = new ArgumentParser({
			age: {
				shortName: 'a',
				type: Number,
			},
		});
		const args = argumentsParser.parse(['--age=27.5']);

		expect(args).toEqual({ help: false, age: 27.5, verbose: false });
	});

	it('Should parse arguments and map them to a value', () => {
		const argumentsParser = new ArgumentParser({
			skills: {
				type: String,
				mapValue: (values) => getDelimeterSeparatedValues(values, { quotemark: '"' }),
			},
		});
		const args = argumentsParser.parse(['--skills=Budo,"Krav Maga",Wushu']);

		expect(args).toEqual({ help: false, skills: ['Budo', 'Krav Maga', 'Wushu'], verbose: false });
	});

	it('Should error when a required argument is not provided', () => {
		const argumentsParser = new ArgumentParser({
			fullName: {
				shortName: 'n',
				type: String,
				required: true,
			},
		}, { helpOnNoArguments: false });

		expect(() => argumentsParser.parse([])).toThrow('--fullName was not provided but is a required argument');
	});
});
