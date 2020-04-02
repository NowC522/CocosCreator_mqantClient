import { mqant } from "./MqantNet/mqant";
import { Proxy } from "./MqantNet/IProxyHandler";

export class demo {
    private mqant: mqant = null

    testOnec(): void {
        this.mqant = new mqant()
        this.mqant.init({
            host: "127.0.0.1",
            port: 3653,
            client_id: "111",
            useSSL: false,
            connect: function () {
                var topic = "HelloWorld/HD_Say";
                var req = {
                    pass_word: "登录密码",
                    user_name: "登录账户"
                }
                this.mqant.requestOnce(topic, req, new Hello_Say)
            },
            onConnectionLost: function (reason) {
                console.log(reason)
            }
        });
    }
    testOn(): void {
        this.mqant = new mqant()
        this.mqant.onProxy("HelloWorld/HD_Say", new Hello_Say)

        this.mqant.init({
            host: "127.0.0.1",
            port: 3653,
            client_id: "111",
            useSSL: false,
            connect: function () {
                var topic = "HelloWorld/HD_Say";
                var req = {
                    pass_word: "登录密码",
                    user_name: "登录账户"
                }
                this.mqant.request(topic, req)
            },
            onConnectionLost: function (reason) {
                console.log(reason)
            }
        });
    }





}

export type TLogin = {
    pass_word: string,
    user_name: string
}

export class Hello_Say extends Proxy {
    onError(client: mqant, error: string): void {
        console.error("服务器处理失败:", error)
    }
    onMessage(client: mqant, data: TLogin): void {
        console.log("收到服务器消息:", data)
    }
}
