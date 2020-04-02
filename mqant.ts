import { HashMap } from "./hashMap"
import { IProxyHandler } from "./IProxyHandler"
import { JsonMessage, ICodec } from "./message"

export class mqant {
    private waiting_queue: HashMap<IProxyHandler> = null
    private proxy_queue: HashMap<IProxyHandler> = null
    private context: any = null
    private curr_id: number = 0
    private client: Paho.MQTT.Client = null
    private connectcallback: Function = null
    private errorcallback: Paho.MQTT.OnFailureCallback = null
    private closecallback: Function = null
    private reconnectcallback: Function = null
    constructor() {
        this.waiting_queue = new HashMap
        this.proxy_queue = new HashMap
    }


    public init(prop: ClientProp, context: any = null): void {
        this.connectcallback = prop.connect;
        this.errorcallback = prop.error;
        this.closecallback = prop.close;
        this.reconnectcallback = prop.reconnect;
        this.context = context
        prop.connect = this.connect.bind(this)
        prop.error = this.error.bind(this)
        prop.close = this.close.bind(this)
        prop.reconnect = this.reconnect.bind(this)
        prop.useSSL = prop.useSSL || false
        prop.host = prop.host || ""
        prop.port = prop.port || 0
        prop.client_id = prop.client_id || 'mqttjs_' + Math.random().toString(16).substr(2, 8);
        this.client = new Paho.MQTT.Client(prop.host, prop.port, prop.client_id)
        let opt: Paho.MQTT.ConnectionOptions = {
            onFailure: prop.error,
            mqttVersion: 3,
            useSSL: prop.useSSL,
            cleanSession: true,
            reconnect: true,
            timeout: 10,
            keepAliveInterval: 10,
        }
        if (prop.uri) {
            opt.uris = [prop.uri]
        }
        this.client.connect(opt)
        this.client.onConnected = prop.connect
        this.client.onConnectionLost = prop.close
        this.client.onMessageArrived = this.onMessageArrived.bind(this)
    }

    private onMessageArrived(message: Paho.MQTT.Message): void {
        try {
            let fun = this.waiting_queue.find(message.destinationName)
            let h = message.destinationName.split("/")
            if (this.waiting_queue.has(message.destinationName)) {
                this.waiting_queue.remove(message.destinationName)
            } else {
                h.splice(h.length - 1, 1)
                let newTopic = h.join("/")
                let p = this.proxy_queue.find(newTopic)
                let msg = new JsonMessage(message.payloadString)
                msg.parser()
                if (msg.error != "") {
                    p.onError(this, msg.error)
                } else {
                    p.onMessage(this, msg.result)
                }
                return
            }
            if (fun != null) {
                let msg = new JsonMessage(message.payloadString)
                msg.parser()
                if (msg.error != "") {
                    fun.onError(this, msg.error)
                } else {
                    fun.onMessage(this, msg.result)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    private reconnect(...arg: any): void {
        this.client.connected = false
        var args = new Array()
        for (var key in arg) {
            args.push(args[key])
        }
        if (this.reconnectcallback) {
            this.reconnectcallback.apply(this.context, args)
        }
    }

    private close(...arg: any): void {
        this.client.connected = false
        var args = new Array()
        for (var key in arg) {
            args.push(args[key])
        }
        if (this.closecallback) {
            this.closecallback.apply(this.context, args)
        }
    }

    private error(e: Paho.MQTT.ErrorWithInvocationContext): void {
        this.client.connected = false
        if (this.errorcallback) {
            this.errorcallback.apply(this.context, e)
        }
    }

    private connect(...arg: any): void {
        this.client.connected = true
        var args = new Array()
        for (var key in arg) {
            args.push(args[key])
        }
        if (this.connectcallback) {
            this.connectcallback.apply(this.context, args)
        }
    }


    connected(): boolean {
        if (this.client != null && this.client.connected) {
            return true
        }
        return false
    }
    /**
     * 向服务器发送一条消息,并且消息只监听一次.使用后会被删除
     * @param topic
     * @param msg
     * @param proxy
     */

    requestOnce(topic: string, msg: any, proxy: IProxyHandler = null): void {
        this.curr_id += 1
        topic = `${topic}/${this.curr_id}`
        let payLoad = JSON.stringify(msg)
        this.on(topic, proxy)
        this.client.publish(topic, payLoad, 0, false)
    }

    request(topic: string, msg: any): void {
        this.curr_id += 1
        topic = `${topic}/${this.curr_id}`
        let payLoad = JSON.stringify(msg)
        this.client.publish(topic, payLoad, 0, false)
    }
    /**
    * 向服务器发送一条消息,但不要求服务器返回结果
    * 注意,如果有注册Proxy 模式. 还是会收到消息
    * @param topic
    * @param msg
    */
    requestNR(topic: string, msg: any): void {
        var payload = JSON.stringify(msg)
        this.client.publish(topic, payload, 0, false);
    }
    /**
     * 监听指定类型的topic消息
     * @param topic
     * @param callback
     */
    on(topic: string, proxy: IProxyHandler) {
        if (proxy == null) {
            return
        }
        //服务器不会返回结果
        this.waiting_queue.remove(topic);
        this.waiting_queue.add(topic, proxy) //添加这条消息到等待队列

    }

    onProxy(topic: string, proxy: IProxyHandler) {
        this.proxy_queue.add(topic, proxy)
    }

    /**
     * 取消某个代理
     */

    offProxy(topic: string): void {
        if (this.proxy_queue.has(topic)) {
            this.proxy_queue.remove(topic)
        }
    }

    clearProxy(): void {
        this.proxy_queue.clear();
    }

    clearCallback(): void {
        this.waiting_queue.clear();
    }
    destroy() {
        this.client.disconnect();
        this.waiting_queue.clear();
        this.proxy_queue.clear()
    }
    parseUTF8(payload): string {
        if (typeof payload === "string")
            return payload;
        else
            return Paho.MQTT.ParseUTF8(payload, 0, payload.length);
    }
}



export type ClientProp = {
    connect?: Function  //连接成功事件
    error?: Paho.MQTT.OnFailureCallback    //连接失败事件
    close?: Paho.MQTT.OnConnectionLostHandler    //连接关闭事件
    reconnect?: Function //重连
    onConnectionLost?: Paho.MQTT.OnConnectionLostHandler
    useSSL?: boolean
    host?: string
    port?: number
    client_id?: string
    uri?: string,
}