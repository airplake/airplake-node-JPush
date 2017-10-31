/**
 *
 * Created Date: 2017-10-31
 * Author: harry.yan
 *
 * Copyright (c) 2017 Your Company
 */

'use strict'

const EventEmitter = require('events').EventEmitter
const JPushNotification = require('./jpushNotification')

/**
 *
 *
 * @class SmsConsumer
 * @extends {EventEmitter}
 */
class JPushNotificationConsumer extends EventEmitter {
  constructor (conf) {
    super()

    const self = this
    this.conf = conf || {}

    this.jpushNotification = new JPushNotification(this.conf)
    this.on('message', function (message, callback) {
      self.send(message, function (err, info) {
        if (err) {
          return callback(err)
        }
        return callback(info)
      })
    })
  }

  /**
   *
   *
   * @param {any} message
   * @param {any} callback
   * @memberof JPushNotificationConsumer
   */
  send (message, callback) {
    this.jpushNotification.sendNotification(message).then((res) => {
      var raw = res.raw
      delete res.raw
      console.log('发送成功:the raw request is:%j,the response is:%j', raw, res)
      return callback(null, res)
    }).catch((err) => {
      let raw = err.raw
      console.log('发送失败:the raw request is:%j,the response is:%j', raw, err)
      return callback(err, null)
    })
  }
}

module.exports = JPushNotificationConsumer
