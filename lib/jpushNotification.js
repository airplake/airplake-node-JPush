/**
 *
 * 极光通知发送接口 nodejs 版本
 * 极光通知API官方文档: * https://docs.jiguang.cn/jpush/server/push/rest_api_v3_push/#notification
 */
const _ = require('lodash')
const JPush = require('jpush-sdk')

var JPushNotification = function (conf) {
  this.config = {
    appKey: conf.JPushAppKey, // 极光通知服务所用的密钥
    masterSecret: conf.JPushMasterSecret, // 极光通知服务所用的密钥值
    retryTimes: 5, // 请求失败重试次数
    ios: {},
    android: {},
    options: {
      apns_production: false, // iOS 平台 需要在 options 中通过 apns_production 字段来设定推送环境.True 表示推送生产环境，False 表示要推送开发环境；
      /*
       * 推送当前用户不在线时，为该用户保留多长时间的离线消息，以便其上线时
       * 再次推送。默认 86400 （1 天），最长 10 天。设置为 0 表示不保留离线
       * 消息，只有推送当前在线的用户可以收到。
       * */
      time_to_live: 86400
    },
    Action: 'SendJPushNotification',
    Version: '2017-10-29',
    RegionId: 'cn-shanghai'
  }
  this.client = JPush.buildClient(this.config.appKey, this.config.masterSecret)
}

JPushNotification.prototype = {
  /**
   * 极光通知发送接口
   * @param data  发送通知的参数，参考：最后sendJPushNotification示例
   * @param callback 发送短信后的回调函数
   */
  _sendNotification: function (param) {
    var self = this
    console.log('param', param)
    console.log('param', typeof param)
    var rawParam = JSON.stringify(param)
    // this.checkParam(param)
    var sendOptions = Object.assign({}, this.config.options, param.options)
    delete param.options
    param = Object.assign(param, this.config)
    param.options = sendOptions
    /*
     * TODO:要实现cid控制，有点麻烦，可以考虑后续加上.
     * cid 是用于防止 api 调用端重试造成服务端的重复推送而定义的一个推送参
     * 数。
     * 用户使用一个 cid 推送后，再次使用相同的 cid 进行推送，则会直接返回第
     * 一次成功推送的结果，不会再次进行推送。
     * CID的有效期为1天。CID的格式为：{appkey}-{uuid}
     * 在使用cid之前，必须通过接口获取你的 cid 池。获取时type=push或者不传
     * 递type值。
     * curl --insecure -X GET -v https://api.jpush.cn/v3/push/cid?count=3
     * -H "Content-Type: application/json" -u
     *  "2743204aad6fe2572aa2d8de:e674a3d0fd42a53b9a58121c"
     **/
    // if(param.cid) param.cid = `${this.config.appKey}-${param.cid}`;

    // 在extras中加上通知id
    if (param.id) param.extra.id = param.id

    // 填充extra数据,是一个json object,用户自己的业务数据传递
    param.android.extras = param.extra
    param.ios.extras = param.extra
    delete param.extra

    if (param.title) {
      param.android.title = param.title
      delete param.title
    }

    if (_.isArray(param.audience)) { // 定向推送给一组regId
      param.platform = 'all'
      param.audience = JPush.registration_id(param.audience)
    } else { // audience is "ios||android||all" //推送给android用户或者ios或者所有用户，群发
      param.platform = param.audience
      param.audience = JPush.ALL // 表示某平台下的所有用户,暂不支持按照Tag或者alias对用户分组推送
    }

    // 设置options
    if (param.id) param.options.sendno = param.id

    console.log('param.android.extras',param.android.extras)
    return new Promise((resolve, reject) => {
      self.client.push().setPlatform(param.platform)
        .setAudience(param.audience)
        //.setNotification(param.content)
        .setNotification(
          JPush.ios(param.content, null, null,null,param.ios.extras),
          JPush.android(param.content, null,1,param.android.extras)
         )
        // .setMessage(param.content,null,null,param.android.extras)
        .setOptions(param.options.sendno, param.options.time_to_live, param.options.override_msg_id, param.options.apns_production, param.options.big_push_duration)
        .send(function (err, res) {
          if (err) {
            console.error('Send notification to JPush error:%s', err)
            err.raw = rawParam
            return reject(err)
          } else {
            console.info('Send notification to JPush success:%j', res)
            res.raw = rawParam
            return resolve(res)
          }
        })
    })
  },
  checkParam: function (param) {
    if (!param) throw '-1:参数不能为空'
    if (!param.audience) throw '1:缺少audience属性'
    if (param.audience) {
      if (param.audience !== 'all' && param.audience !== 'ios' && param.audience !== 'android') {
        if (!_.isArray(param.audience)) throw '2:非法的audience值'
      }
    }
    if (!param.content) throw '3:通知内容为空'
  },

  // 发送通知给app[业务级]
  sendNotification: function (data) {
    // 参数data的结构如下:
    var dataSample = {
      extra: {} // 额外的信息，json格式 可选
    }
    data = Object.assign(dataSample, data)
    return this._sendNotification(data)
  }
}

module.exports = JPushNotification
