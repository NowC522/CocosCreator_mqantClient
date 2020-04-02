CocosCreator mqant client 简单使用说明
-----
导入项目后,paho-mqtt 设置为插件
初始化连接后
```typescript
    mqant = new mqant()
    this.mqant.init({
        host: host,
        port: port,
        client_id: "111",
        useSSL: false,
        connect: function () {
            console.log("onConnected");
        },
        onConnectionLost: function (reason) {
            console.log(reason)
        }
    });
```
添加持久监听模式.使用onProxy统一注册协议

由于golang json库 针对[]byte二次序列化会base64编码. 添加一个base64库.

然后就可以愉快使用了

已在小游戏环境和模拟器环境测试通过!!!!

按道理也可用于Egert 和 Laya 项目,并未测试
