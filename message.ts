import { Base64 } from "./Base64";

export class JsonMessage implements ICodec {
    protected _result: any;
    protected _error: string;
    protected _content: any

    constructor(data: any) {
        this._content = data
    }

    parser(): void {
        if (typeof this._content != "string") {
            throw new Error("data type not string");
        }
        let parse = JSON.parse(this._content)
        this._error = parse.Error
        this._result = Base64.decode(parse.Result)
    }

    public get content(): any {
        return this._content
    }
    public get result(): any {
        return this._result
    }
    public get error(): any {
        return this._error
    }
}

export interface ICodec {
    readonly result: any
    readonly error: string
    readonly content: any
    parser(): void
}