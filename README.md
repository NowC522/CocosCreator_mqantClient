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
然后就可以愉快使用了

已在小游戏环境和模拟器环境测试通过!!!!
