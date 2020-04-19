# arguments

Parse conventional CLI arguments.

`--help` and `--verbose` arguments are included as defaults.
```
{
	help: {
		shortName: 'h',
		type: Boolean,
	},
	verbose: {
		shortName: 'v',
		type: Boolean,
	},
}
```

## API

```
import ArgumentParser from '@ryel/arguments';

const argumentsParser = new ArgumentParser(argumentsSpecification, options);

const args = argumentsParser.parse();
```


`argumentsSpecification` is an object specifying all expected arguments. The specification must provide a long name for each argument, but all other properties are optional.

By default an argument will be considered a boolean unless a `type` is provided. Arguments specified with a `type` of `Boolean` can either be provided as flags, or can be provided as an argument with a value that is boolean like. Boolean like values include `true`, `t`, `yes`, `y` and `1` as truthy and `false`, `f`, `no`, `n` and `0` as falsy. Arguments specified with a `type` of `Number` will be parsed from a string to a number.

A short name can be provided by `shortName` and must be a single character which is unique to all other arguments.

If an argument should always be provided, `required` can be specified for the argument as `true`.

A default value can be specified for an argument, to be used in the absence of the argument using `defaultValue`. By default, boolean arguments are considered to have a `defaultValue` of `false`.

If boolean, string and number arguments aren't enough, `mapValue` can be specified for an argument as a function to transform the argument as required.


`options` can be an object with the following properties:
```
helpUsage: string = 'Options:';
helpOnNoArgs: boolean = true;
errorOnUnknownArgs: boolean = true;
```

`helpUsage` is a string to be output to the console before listing the usage of all arguments in the specification.

`helpOnNoArgs` will default to output help and argument usage to the console when no arguments are provided.

`errorOnUnknownArgs` will default to throwing an error when the parser encounters an argument not provided in the specification.


Using the following example arguments specification:
```
{
	age: {
		shortName: 'a',
		type: Number,
	},
	fullName: {
		shortName: 'n',
		type: String,
		required: true,
	},
	jobTitle: {
		type: String,
		defaultValue: 'Developer',
	},
	skills: {
		type: String,
		mapValue: (value) => value.split(','),
	},
	special: {
		shortName: 's',
	},
	unplugged: {
		shortName: 'u',
		type: Boolean,
		defaultValue: true,
	},
}
```

Arguments specified as `required` must provided, otherwise an error will be thrown. All arguments that are not boolean arguments require a value to be parsed, a value can be provided with the argument name or as the following argument.
```
> cli --fullName="Thomas A. Anderson"
> cli --fullName "Thomas A. Anderson"
```

Arguments specified with a `shortName` such as `fullName` can be provided in short.
```
> cli -n="Thomas A. Anderson"
> cli -n "Thomas A. Anderson"
```

Arguments specified with a `defaultValue` that is truthy and that are boolean arguments, such as `unplugged` will be inverted to `false` when provided.
```
> cli --fullName="Thomas A. Anderson" -u
```

Arguments specified with a `shortName` that are boolean arguments, such as `special` and `verbose`, can be concatenated and provided in any order.
```
> cli --fullName="Thomas A. Anderson" -sv
> cli --fullName="Thomas A. Anderson" -vs
```

Arguments specified with a `mapValue` such as `skills` can be provided and transformed (e.g. to an array `['Budo', 'Krav Maga', 'Wushu']`).
```
> cli --fullName="Thomas A. Anderson" --skills Budo,"Krav Maga",Wushu
```
