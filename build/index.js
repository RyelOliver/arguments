"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var isUndefined = function (value) { return value === undefined; };
var isString = function (value) { return typeof value === 'string'; };
var TRUTHY_STRING = ['true', 't', 'yes', 'y', '1'];
var FALSY_STRING = ['false', 'f', 'no', 'n', '0'];
var DEFAULT_ARGUMENTS_SPECIFICATION = {
    help: {
        shortName: 'h',
        type: Boolean
    },
    verbose: {
        shortName: 'v',
        type: Boolean
    }
};
var InvalidArgumentsSpecificationError = /** @class */ (function (_super) {
    __extends(InvalidArgumentsSpecificationError, _super);
    function InvalidArgumentsSpecificationError(argumentsSpecification) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.name = 'InvalidArgumentsSpecificationError';
        _this.argumentsSpecification = argumentsSpecification;
        return _this;
    }
    return InvalidArgumentsSpecificationError;
}(Error));
var UnknownArgError = /** @class */ (function (_super) {
    __extends(UnknownArgError, _super);
    function UnknownArgError(argument) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.name = 'UnknownArgError';
        _this.message = argument + " could not be parsed as it is an unknown argument";
        return _this;
    }
    return UnknownArgError;
}(Error));
var InvalidArgError = /** @class */ (function (_super) {
    __extends(InvalidArgError, _super);
    function InvalidArgError(argument) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.apply(this, args) || this;
        _this.name = 'InvalidArgError';
        _this.argument = argument;
        return _this;
    }
    return InvalidArgError;
}(Error));
var ArgumentParser = /** @class */ (function () {
    function ArgumentParser(argumentsSpecification, _a) {
        if (argumentsSpecification === void 0) { argumentsSpecification = {}; }
        var _b = _a === void 0 ? {} : _a, _c = _b.helpUsage, helpUsage = _c === void 0 ? 'Options:' : _c, _d = _b.helpOnNoArguments, helpOnNoArguments = _d === void 0 ? true : _d, _e = _b.errorOnUnknownArguments, errorOnUnknownArguments = _e === void 0 ? true : _e;
        this.setArgumentsSpecification(__assign(__assign({}, DEFAULT_ARGUMENTS_SPECIFICATION), argumentsSpecification));
        this.helpUsage = helpUsage;
        this.helpOnNoArguments = helpOnNoArguments;
        this.errorOnUnknownArguments = errorOnUnknownArguments;
    }
    ArgumentParser.prototype.setArgumentsSpecification = function (optionalArgumentsSpecification) {
        this.argumentsSpecification = Object.entries(optionalArgumentsSpecification)
            .reduce(function (argumentsSpecification, _a) {
            var _b;
            var longName = _a[0], argumentSpecification = _a[1];
            if (argumentSpecification.shortName) {
                var duplicateArgSpec = Object.values(argumentsSpecification)
                    .find(function (_a) {
                    var shortName = _a.shortName;
                    return shortName === argumentSpecification.shortName;
                });
                if (duplicateArgSpec) {
                    throw new InvalidArgumentsSpecificationError(__assign(__assign({}, argumentsSpecification), (_b = {}, _b[longName] = argumentSpecification, _b)), argumentSpecification.shortName + " cannot be used as a short argument for more than one long argument");
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
            argumentsSpecification[longName] = argumentSpecification;
            return argumentsSpecification;
        }, {});
    };
    ArgumentParser.prototype.help = function () {
        var argumentsHelp = Object.entries(this.argumentsSpecification)
            .map(function (_a) {
            var longName = _a[0], _b = _a[1], shortName = _b.shortName, type = _b.type, defaultValue = _b.defaultValue, usage = _b.usage;
            var defaultValueHelp = isUndefined(defaultValue) ?
                '' :
                " [default: " + (isString(defaultValue) ? "\"" + defaultValue + "\"" : defaultValue) + "]";
            var lines = [
                "--" + longName + (shortName ? ", -" + shortName : ''),
                "[" + type.name + "]" + defaultValueHelp,
            ];
            if (usage) {
                lines.push(usage);
            }
            return lines.join('\n');
        });
        console.info(__spreadArrays([this.helpUsage], argumentsHelp).join('\n\n'));
    };
    ArgumentParser.prototype.getDefaultArguments = function () {
        return Object.entries(this.argumentsSpecification)
            .reduce(function (defaultArguments, _a) {
            var longName = _a[0], argSpec = _a[1];
            if (!isUndefined(argSpec.defaultValue)) {
                defaultArguments[longName] = argSpec.defaultValue;
            }
            return defaultArguments;
        }, {});
    };
    ArgumentParser.prototype.getShortArgument = function (argument) {
        var match = argument.match(/^-((\w+)|(\w)=(.+))$/);
        if (!match) {
            return;
        }
        var onlyName = match[2], _a = match[3], name = _a === void 0 ? onlyName : _a, value = match[4];
        return [name, value];
    };
    ArgumentParser.prototype.isShortArgument = function (argument) { return !!this.getShortArgument(argument); };
    ArgumentParser.prototype.getLongArgument = function (argument) {
        var match = argument.match(/^--([\w][\w-]*[\w])(=(.+))?$/);
        if (!match) {
            return;
        }
        var name = match[1], value = match[3];
        return [name, value];
    };
    ArgumentParser.prototype.isLongArgument = function (argument) { return !!this.getLongArgument(argument); };
    ArgumentParser.prototype.getNameAndSpecificationByShortName = function (argShortName) {
        var shortArgument = this.getShortArgument(argShortName);
        if (isUndefined(shortArgument)) {
            return;
        }
        var name = shortArgument[0];
        return Object.entries(this.argumentsSpecification)
            .find(function (_a) {
            var longName = _a[0], shortName = _a[1].shortName;
            return shortName === name;
        });
    };
    ArgumentParser.prototype.getNameAndSpecificationByLongName = function (argLongName) {
        var longArgument = this.getLongArgument(argLongName);
        if (isUndefined(longArgument)) {
            return;
        }
        var name = longArgument[0];
        return Object.entries(this.argumentsSpecification)
            .find(function (_a) {
            var longName = _a[0];
            return longName === name;
        });
    };
    ArgumentParser.prototype.toArgumentValue = function (_a) {
        var type = _a.type, value = _a.value, mapValue = _a.mapValue;
        var castedValue;
        switch (type) {
            case Boolean:
                if (TRUTHY_STRING.includes(value.toLowerCase())) {
                    castedValue = true;
                }
                else if (FALSY_STRING.includes(value.toLowerCase())) {
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
    };
    ArgumentParser.prototype.parse = function (argumentsToParse) {
        var _this = this;
        if (argumentsToParse === void 0) { argumentsToParse = process.argv.slice(2); }
        if (this.helpOnNoArguments && argumentsToParse.length === 0) {
            this.help();
            return;
        }
        var parsedArguments = this.getDefaultArguments();
        var _loop_1 = function () {
            var argument = argumentsToParse.shift();
            if (!isString(argument)) {
                throw new TypeError("Arguments are expected to be parsed from strings but " + argument + " is not a string");
            }
            if (this_1.isShortArgument(argument)) {
                var _a = this_1.getShortArgument(argument), shortArgumentName = _a[0], value = _a[1];
                if (!isUndefined(value)) {
                    var longNameAndSpecification = this_1.getNameAndSpecificationByShortName("-" + shortArgumentName);
                    if (isUndefined(longNameAndSpecification)) {
                        if (this_1.errorOnUnknownArguments) {
                            throw new UnknownArgError(argument);
                        }
                        else {
                            return "continue";
                        }
                    }
                    var longName = longNameAndSpecification[0], argSpec = longNameAndSpecification[1];
                    if (argSpec.type === Boolean) {
                        var argValue = this_1.toArgumentValue(__assign(__assign({}, argSpec), { value: value }));
                        if (isUndefined(argValue)) {
                            throw new InvalidArgError([longName, argSpec], "-" + shortArgumentName + " was provided with a value that was not a boolean");
                        }
                        parsedArguments[longName] = argValue;
                    }
                    else {
                        parsedArguments[longName] = this_1.toArgumentValue(__assign(__assign({}, argSpec), { value: value }));
                    }
                }
                else {
                    var shortArgumentNames_1 = shortArgumentName.split('');
                    shortArgumentNames_1.forEach(function (shortArgName) {
                        var longNameAndSpecification = _this.getNameAndSpecificationByShortName("-" + shortArgName);
                        if (isUndefined(longNameAndSpecification)) {
                            if (_this.errorOnUnknownArguments) {
                                throw new UnknownArgError(argument);
                            }
                            else {
                                return;
                            }
                        }
                        var longName = longNameAndSpecification[0], argSpec = longNameAndSpecification[1];
                        if (longName === 'help') {
                            parsedArguments.help = true;
                        }
                        else if (argSpec.type === Boolean) {
                            parsedArguments[longName] = !argSpec.defaultValue;
                        }
                        else {
                            if (shortArgumentNames_1.length > 1) {
                                throw new InvalidArgError([longName, argSpec], "-" + shortArgName + " was provided in a concatenated set of arguments, " + argument + ", but must be provided separately as it requires a corresponding argument value");
                            }
                            if (argumentsToParse.length === 0) {
                                throw new InvalidArgError([longName, argSpec], "-" + shortArgName + " was provided without a corresponding argument value");
                            }
                            var argumentValue = argumentsToParse.shift();
                            if (!isString(argumentValue)) {
                                throw new TypeError("Arguments are expected to be parsed from strings but " + argumentValue + " is not a string");
                            }
                            parsedArguments[longName] = _this.toArgumentValue(__assign(__assign({}, argSpec), { value: argumentValue }));
                        }
                    });
                }
            }
            else if (this_1.isLongArgument(argument)) {
                var _b = this_1.getLongArgument(argument), value = _b[1];
                if (!isUndefined(value)) {
                    var longNameAndSpecification = this_1.getNameAndSpecificationByLongName(argument);
                    if (isUndefined(longNameAndSpecification)) {
                        if (this_1.errorOnUnknownArguments) {
                            throw new UnknownArgError(argument);
                        }
                        else {
                            return "continue";
                        }
                    }
                    var longName = longNameAndSpecification[0], argSpec = longNameAndSpecification[1];
                    if (argSpec.type === Boolean) {
                        var argValue = this_1.toArgumentValue(__assign(__assign({}, argSpec), { value: value }));
                        if (isUndefined(argValue)) {
                            throw new InvalidArgError([longName, argSpec], "--" + longName + " was provided with a value that was not a boolean");
                        }
                        parsedArguments[longName] = argValue;
                    }
                    else {
                        parsedArguments[longName] = this_1.toArgumentValue(__assign(__assign({}, argSpec), { value: value }));
                    }
                }
                else {
                    var longNameAndSpecification = this_1.getNameAndSpecificationByLongName(argument);
                    if (isUndefined(longNameAndSpecification)) {
                        if (this_1.errorOnUnknownArguments) {
                            throw new UnknownArgError(argument);
                        }
                        else {
                            return "continue";
                        }
                    }
                    var longName = longNameAndSpecification[0], argSpec = longNameAndSpecification[1];
                    if (longName === 'help') {
                        parsedArguments.help = true;
                    }
                    else if (argSpec.type === Boolean) {
                        parsedArguments[longName] = !argSpec.defaultValue;
                    }
                    else {
                        if (argumentsToParse.length === 0) {
                            throw new InvalidArgError([longName, argSpec], argument + " was provided without a corresponding argument");
                        }
                        var argumentValue = argumentsToParse.shift();
                        if (!isString(argumentValue)) {
                            throw new TypeError("Arguments are expected to be parsed from strings but " + argumentValue + " is not a string");
                        }
                        parsedArguments[longName] = this_1.toArgumentValue(__assign(__assign({}, argSpec), { value: argumentValue }));
                    }
                }
            }
            else if (this_1.errorOnUnknownArguments) {
                throw new UnknownArgError(argument);
            }
        };
        var this_1 = this;
        while (argumentsToParse.length > 0 && !parsedArguments.help) {
            _loop_1();
        }
        if (parsedArguments.help) {
            this.help();
            return;
        }
        Object.entries(this.argumentsSpecification)
            .forEach(function (_a) {
            var longName = _a[0], argumentSpecification = _a[1];
            if (argumentSpecification.required && !(longName in parsedArguments)) {
                throw new InvalidArgError([longName, argumentSpecification], "--" + longName + " was not provided but is a required argument");
            }
        });
        return parsedArguments;
    };
    return ArgumentParser;
}());
module.exports = ArgumentParser;
