export class HashMap<V> {
    constructor() { }
    private handlers: { [key: string]: V } = {}
    private len: number = 0
    /**
     * 
     * @param topic 
     * @param cb  接收两个参数 destinationName, data 
     */

    public add(topic: string, cb: V): void {
        if (!this.handlers[topic]) {
            this.handlers[topic] = cb
            this.len++
        }
    }

    public remove(topic): void {
        if (this.handlers[topic]) {
            delete this.handlers[topic]
            this.len--
        }
    }

    public update(topic: string, cb: V) {
        this.handlers[topic] = cb
    }

    public has(topic: string): boolean {
        return !!this.handlers[topic]
    }

    public clear(): void {
        this.handlers = {}
        this.len = 0
    }

    public empty(): boolean {
        return this.len == 0
    }

    public each(fn: Function): void {
        for (let key in this.handlers) {
            fn.call(this, this.handlers[key], key, this)
        }
    }

    public find(topic: string): V {
        let type = typeof topic
        if (type == "string" && this.has(topic)) {
            return this.handlers[topic]
        }
        return null;
    }
}