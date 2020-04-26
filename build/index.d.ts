interface OptionalArgumentSpecification {
    shortName?: string;
    type?: any;
    required?: boolean;
    defaultValue?: any;
    mapValue?: (value: any) => any;
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
declare class ArgumentParser {
    argumentsSpecification: ArgumentsSpecification;
    helpUsage: string;
    helpOnNoArguments: boolean;
    errorOnUnknownArguments: boolean;
    constructor(argumentsSpecification?: OptionalArgumentsSpecification, { helpUsage, helpOnNoArguments, errorOnUnknownArguments }?: {
        helpUsage?: string;
        helpOnNoArguments?: boolean;
        errorOnUnknownArguments?: boolean;
    });
    setArgumentsSpecification(optionalArgumentsSpecification: OptionalArgumentsSpecification): void;
    help(): void;
    getDefaultArguments(): {
        [longName: string]: any;
    };
    getShortArgument(argument: string): [string, string | undefined] | undefined;
    isShortArgument(argument: string): boolean;
    getLongArgument(argument: string): [string, string | undefined] | undefined;
    isLongArgument(argument: string): boolean;
    getNameAndSpecificationByShortName(argShortName: string): [string, ArgumentSpecification];
    getNameAndSpecificationByLongName(argLongName: string): [string, ArgumentSpecification];
    toArgumentValue({ type, value, mapValue }: ArgumentAndArgumentSpecification): any;
    parse(argumentsToParse?: string[]): {
        [longName: string]: any;
    };
}
export = ArgumentParser;
