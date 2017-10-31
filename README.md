# airplake-node-JPush

Message Distributing Center (MDC) 专用极光通知消息适配器。

## 安装

```console
$ npm install --save jpush-sdk
```

## 使用

### 配置

在 MDC 配置文件中做好配置，如：

```javascript
{
  ...,
  "pubsub": {
    ...,
    "consumerAdapters": [{
           queueName: 'jpush-notification',
           require: 'airplake-node-JPush',
           AccessKeyId: '', // 填写你的appKey,可以登录极光查找
           AccessKeySecret: ''// 填写你的masterSecret，可以登录极光查找
    }]
  }
}
```



### 消息格式

在生产者端生产消息的时候，注意使用这样的消息格式：



``` bash
/api/jpushNotification/verification     `发送验证消息`
```


```js 
    {//验证，不需要数据
    }
```


``` bash
/api/jpushNotification  `发送通知消息`
```

```js
     {
       id: 'xxx', //可选，建议填写,建议是一个uuid
       audience: 'all', // 要发送目标:all || ios || android || "[$jpush_regId1, $jpush_regId2,...]"//必填
       title: '新人有礼了', // 通知标题 , 可选
       content: '10月31日晚，凡是首充用户，享受1000元现金券！', // 通知的具体内容 //必填
         android: { //可选 
             category: 'xx', //通知栏条目过滤或排序,完全依赖 rom 厂商对 category 的处理策略
             priority: 0 ,//通知栏展示优先级 默认为0，范围为 -2～2 ，
             alert_type: -1 //通知提醒方式 可选范围为 -1 ～ 7 ，对应 Notification.DEFAULT_ALL = -1 或者 Notification.DEFAULT_SOUND = 1, Notification.DEFAULT_VIBRATE = 2, Notification.DEFAULT_LIGHTS = 4 的任意 “or” 组合。默认按照 -1 处理。 
         },
         ios: {
             sound: 'xx', //如果无此字段，则此消息无声音提示；有此字段，如果找到了指定的声音就播放该声音，否则播放默认声音,如果此字段为空字符串，iOS 7 为默认声音，iOS 8及以上系统为无声音。(消息) 说明：JPush 官方 API Library (SDK) 会默认填充声音字段。提供另外的方法关闭声音。
             badge: 0,//如果不填，表示不改变角标数字；否则把角标数字改为指定的数字；为 0 表示清除。JPush 官方 API Library(SDK) 会默认填充badge值为"+1",详情参考：badge +1)
             content-available: true, //推送的时候携带"content-available":true 说明是 Background Remote Notification，如果不携带此字段则是普通的Remote Notification。详情参考：Background Remote Notification
             mutable-content: true,//推送的时候携带”mutable-content":true 说明是支持iOS10的UNNotificationServiceExtension，如果不携带此字段则是普通的Remote Notification。详情参考：UNNotificationServiceExtension
             category: 'xx' , //IOS8才支持。设置APNs payload中的"category"字段值
         },
         options: { //可选 ,发送通知选项
             time_to_live: 86400, //单位：秒 离线消息在极光保留时长
             override_msg_id: ['xxmsg_id1','xxmsg_id2'], //如果当前的推送要覆盖之前的一条推送，这里填写前一条推送的 msg_id 就会产生覆盖效果 ,暂时先不支持
             apns_collapse_id: 'xxx' ,//可选  APNs 新通知如果匹配到当前通知中心有相同 apns-collapse-id 字段的通知，则会用新通知内容来更新它，并使其置于通知中心首位。collapse id 长度不可超过 64 bytes。
             big_push_duration: 100, //单位：分钟 又名缓慢推送，把原本尽可能快的推送速度，降低下来，给定的n分钟内，均匀地向这次推送的目标用户推送。最大值为1400.未设置则不是定速推送。

         },
       extra: Schema.JsonObject // 额外的信息，json格式 可选
     };
```


### 贡献者 Contributors
harry.yan
