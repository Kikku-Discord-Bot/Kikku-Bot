import { DiscordAPIError } from "discord.js";

export class Exception {
    private stack: string;
    private message: string;
    private name: string;
    private code: number | string;
    private method: string;


    constructor(error: DiscordAPIError) {
        this.stack = error.stack ? error.stack : '';
        this.message = error.message;
        this.name = error.name;
        this.code = error.code ? error.code : 0;
        this.method = error.method;
    }
    
    public getStack(): string {
        return this.stack;
    }

    public getMessage(): string {
        return this.message;
    }

    public getName(): string {
        return this.name;
    }

    public getCode(): number | string {
        return this.code;
    }

    public getMethod(): string {
        return this.method;
    }
    
    public toString(): string {
        return `${this.name} (${this.code}): ${this.message} (Method: ${this.method})`;
    }

    public logError(): void {
        console.error(this.toString());
    }
}