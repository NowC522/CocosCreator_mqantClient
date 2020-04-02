import { mqant } from "./mqant"

export class Proxy implements IProxyHandler {
    once: boolean = false
    onError(client: mqant, error: string): void {
        console.error("操作出错:", error)
    }
    onMessage(client: mqant, data: any): void {
        console.log("收到服务器消息:", data)
    }
}

export interface IProxyHandler {
    once: boolean
    onError(client: mqant, error: string): void
    onMessage(client: mqant, data: any): void
}