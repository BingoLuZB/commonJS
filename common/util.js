import {
  Toast
} from 'vant';
import http from './http.js';
import axios from 'axios';
import configure from './config';
import router from '@/router'

export default {

  /**
   * 解析url参数
   * @example ?id=123&a=c
   * @return obj{id:123,a:b}
   * @author:SheldonYee
   */
  urlParser: function () {
    let url = window.location.search;
    let obj = {};
    let reg = /[?&][^?&]+=[^?&]+/g;
    let arr = url.match(reg);
    if (arr) {
      arr.forEach((item) => {
        let tempArr = item.substring(1).split('=');
        let key = decodeURIComponent(tempArr[0]);
        let val = decodeURIComponent(tempArr[1]);
        obj[key] = val;
      })
    }
    return obj;
  },
  /*
      url参数取值
      @param name 参数名
      @return  参数名对应的值
   */
  getQueryString: function (name) {
    var url = window.location.hash;
    var index = url.indexOf('?');
    url = url.substr(index + 1);
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = url.match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
  },
  
  
  /**
   * 时间戳格式化
   * @timestamp  时间戳
   * @format  日期格式 例：yyyy-MM-dd hh:mm:ss
   * @return yyyy-MM-dd hh:mm:ss
   * @author: wu
   */
  formatDate: function (date, fmt) {
    if(typeof date == 'string') {
      date = date && parseInt(date)
    }
    if (!date || date <= 0) {
      return 0;
    }
    var date = new Date(date);
    var o = {
      'M+': date.getMonth() + 1, //月份
      'd+': date.getDate(), //日
      'h+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      'S': date.getMilliseconds() //毫秒
    };
    if (!this.isNotEmpty(fmt)) {
      fmt = 'yyyy-MM-dd hh:mm:ss';
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return fmt;
  },

  /**
   * 获取cokie值
   * @name  key键名
   * @format   例：getCookie(token)
   * @return  	2323sxcsf2342sdf
   * @author: zhong
   */
  getCookie: function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
      return unescape(arr[2]);
    else
      return null;
  },

  /**
   * 设定cokie值
   * @name  s20是代表20秒，h是指小时，如12小时则是：h12 ，d是天数，30天则：d30
   * @format   例：setCookie('token',2312,'d1')
   * @return  	null
   * @author: zhong
   */
  setCookie: function (name, value, time) {
    var strsec = this.getsec(time);
    var exp = new Date();
    exp.setTime(exp.getTime() + strsec * 1);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + "; path=/";

  },
  /**
   * 清除cookie的方法
   * key 传入要删除的cookie的key
   * 不转的话清除全部
   */
  clearAllCookie(key) {
    if (key) {
      document.cookie = key + "=0;expires=" + new Date(0).toUTCString() + ";path=/";
    } else {
      var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
      if (keys) {
        for (var i = keys.length; i--;) {
          document.cookie = keys[i] + "=0;expires=" + new Date(0).toUTCString() + ";path=/";
        }
      }
    }
  },

  /**
   * 是否手机
   * @name  key键名
   * @format   例：isMoblie('13711111111')
   * @return  	注：不正确时返回 true
   */
  isMoblie: function (value) {
    return !/^1\d{10}$/.test(value);
  },


  /**
   * 算出几个月之后的时间
   * @date  date的值例如 2017-08-03 13:14
   * @mon  多少个月
   * @return  返回几个月后的日期 如2017/09/03 13:14
   */
  activeTime: function (date, mon) {
    // date的值例如 2017-08-03 13:14
    var arr = date.split('-');
    var year = arr[0]; //获取日期的年份
    var month = arr[1]; //获取日期的月份

    var newarr = arr[2].split(" ");
    var day = newarr[0]; //获取日期的日
    var time = newarr[1]; //获取日期的分秒

    //var days = new Date(year, month, 0);
    //days = days.getDate(); //获取当前日期中的月的天数

    var year2 = year;
    var month2 = parseInt(month) + mon
    if (month2 >= 13) {
      year2 = parseInt(year2) + 1;
      month2 = month2 - 12;
    }
    var day2 = day;
    var days2 = new Date(year2, month2, 0);
    days2 = days2.getDate();
    if (day2 > days2) {
      day2 = days2;
    }
    if (month2 < 10) {
      month2 = '0' + month2;
    }

    var t2 = year2 + '/' + month2 + '/' + day2 + ' ' + time;
    return t2;
  },
  /**
   * 去除字符串两边的空格
   */
  trim: function (str) {
    if (str == "") return "";
    if (!str) return;
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },

  /**
   * 保留两位小数(四舍五入)
   * @num 转换的数字
   */
  returnFloat: function (num) {
    var num = Math.round(parseFloat(num) * 100) / 100;
    var xsd = num.toString().split(".");
    if (xsd.length == 1) {
      num = num.toString() + ".00";
      return num;
    }
    if (xsd.length > 1) {
      if (xsd[1].length < 2) {
        num = num.toString() + "0";
      }
      return num;
    }
  },




  /**
   * 是否为空
   * @param str
   * @returns {boolean}
   */
  isNotEmpty: function (str) {
    if (str != '' && str != null && typeof str != 'undefined') {
      return true;
    }
    console.warn('argument format is wrong');
    return false;
  },

  /**
   * 倒计时
   * @time 时间戳
   * @timeId  定时器名称
   */
  getRTime: function (time, timeId) {
    var t = new Date(time).getTime();
    var d = 0,
      h = 0,
      m = 0,
      s = 0;
    if (t >= 0) {
      d = Math.floor(t / 1000 / 60 / 60 / 24);
      h = Math.floor(t / 1000 / 60 / 60 % 24);
      m = Math.floor(t / 1000 / 60 % 60);
      s = Math.floor(t / 1000 % 60);
    } else {
      if (timeId) {
        clearInterval(timeId);
      }
      return {
        'days': '00',
        'hours': '00',
        'minutes': '00',
        'seconds': '00'
      }
    }
    var obj = {
      'days': checkTime(d),
      'hours': checkTime(h),
      'minutes': checkTime(m),
      'seconds': checkTime(s)
    }

    function checkTime(i) {
      if (i < 10) {
        i = "0" + i;
      }
      return i;
    }
    return obj;
  },


  /**
   * 判断是否在微信中打开
   * @return  boolean  true 是
   * @author: zlf
   */
  is_weixn() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
      return true;
    } else {
      return false;
    }
  },

  // wxShareAll(shareInfo) {
  //   if (!shareInfo.type) {
  //     shareInfo.type = 0;
  //   }
  //   if(!wx) return false
  //   //去除#后面的
  //   var urls = location.origin + location.pathname;
  //   urls = /(.*)#.*/.exec(window.location.href)[1];
  //   urls = encodeURIComponent(urls);
  //   http.get('/wxShare/no_sign?url=' + urls, '', {
  //     isken: true
  //   }).then(res => {
  //     if (res.state == 'success') {
  //       //wx是引入的微信sdk
  //       wx.config({
  //         debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
  //         appId: 'wxd11f95277f85e24b', // 必填，公众号的唯一标识
  //         timestamp: res.data.timestamp, // 必填，生成签名的时间戳
  //         nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
  //         signature: res.data.signature, // 必填，签名，见附录1
  //         jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
  //       });
  //       wx.error(function (res) {
  //         console.table(res); // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
  //       });
  //       wx.ready(() => {
  //         //qq分享
  //         wx.onMenuShareQQ({
  //           title: shareInfo.title, // 分享标题
  //           desc: shareInfo.desc, // 分享描述
  //           link: shareInfo.link, // 分享链接
  //           imgUrl: shareInfo.imgUrl, // 分享图标
  //           success: function () {
  //             if(shareInfo.type != 6){
  //               Toast("分享成功")
  //             }
  //             if (shareInfo.type == 2) return;
  //             shareInfo.callback && shareInfo.callback()
  //             // 用户确认分享后执行的回调函数
  //           },
  //           cancel: function () {
  //             // 用户取消分享后执行的回调函数
  //             Toast("取消分享")
  //           }
  //         });
  //         //分享朋友圈
  //         wx.onMenuShareTimeline({
  //           title: shareInfo.title, // 分享标题
  //           link: shareInfo.link,
  //           imgUrl: shareInfo.imgUrl, // 分享图标
  //           success: function () {
  //             setTimeout(function () {
  //               if(shareInfo.type != 6){
  //                 Toast("分享成功")
  //               }
  //               if (shareInfo.type == 2) return;
  //               shareInfo.callback && shareInfo.callback()
  //             },1000)
  //           },
  //           cancel: function () {
  //             // 用户取消分享后执行的回调函数
  //             Toast("取消分享")
  //           }
  //         });

  //         //分享给朋友
  //         wx.onMenuShareAppMessage({
  //           title: shareInfo.title, // 分享标题
  //           desc: shareInfo.desc, // 分享描述
  //           link: shareInfo.link, // 分享链接
  //           imgUrl: shareInfo.imgUrl, // 分享图标
  //           success: function () {
  //             if(shareInfo.type != 6){
  //               Toast("分享成功")
  //             }
  //             if (shareInfo.type == 2) return;
  //             shareInfo.callback && shareInfo.callback()
  //             // 用户确认分享后执行的回调函数
  //           },
  //           cancel: function () {
  //             // 用户取消分享后执行的回调函数
  //             Toast("取消分享")
  //           }
  //         });
  //         //分享到腾讯微博
  //         wx.onMenuShareWeibo({
  //           title: shareInfo.title, // 分享标题
  //           desc: shareInfo.desc, // 分享描述
  //           link: shareInfo.link, // 分享链接
  //           imgUrl: shareInfo.imgUrl, // 分享图标
  //           success: function () {
  //             if(shareInfo.type != 6){
  //               Toast("分享成功")
  //             }
  //             if (shareInfo.type == 2) return;
  //             shareInfo.callback && shareInfo.callback()
  //             // 用户确认分享后执行的回调函数
  //           },
  //           cancel: function () {
  //             // 用户取消分享后执行的回调函数
  //             Toast("取消分享")
  //           }
  //         });
  //         //分享到QQ空间
  //         wx.onMenuShareQZone({
  //           title: shareInfo.title, // 分享标题
  //           desc: shareInfo.desc, // 分享描述
  //           link: shareInfo.link, // 分享链接
  //           imgUrl: shareInfo.imgUrl, // 分享图标
  //           success: function () {
  //             if(shareInfo.type != 6){
  //               Toast("分享成功")
  //             }
  //             if (shareInfo.type == 2) return;
  //             shareInfo.callback && shareInfo.callback()
  //             // 用户确认分享后执行的回调函数
  //           },
  //           cancel: function () {
  //             // 用户取消分享后执行的回调函数
  //             Toast("取消分享")
  //           }
  //         });
  //       })
  //     }
  //   })
  // },

  /**
   * 微信获取code
   * @param {*跳转地址} url
   * @param {*类型} type  1.扫一扫登录  2.点击登录
   * @param {*类型} scope  1.snsapi_userinfo为需要授权登录  2.snsapi_base为静默授权登录
   * @param {*类型} isToken  是否需要token，用来验证该用户是否有绑定微信1为是，2为否
   */
  // wxGetCode(url,type = 2,scope = 'snsapi_userinfo',isToken = 2) {
  //   let allUrl = window.location.origin + window.location.pathname + '#' + url
  //   allUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd11f95277f85e24b&redirect_uri=${encodeURIComponent(`${window.location.origin}/vuespa/static/html/auth.html?appUrl=${encodeURIComponent(allUrl)}`, "utf-8")}&response_type=code&scope=${scope}&state=${type},${isToken}&connect_redirect=1#wechat_redirect`
  //   window.location.replace(allUrl)
  // },

  /**
   * 微信登陆
   */
  // wxLogin () {
  //   const code = router.history.current.query.code
  //   const state = router.history.current.query.state
  //   if(!code) return false
  //   router.push({
  //     name: 'auth',
  //     query: {
  //       code,
  //       state
  //     }
  //   })
  // },
  
  /**
    * 只能输入英文大小写，中文字符
    */
  onlyInputChEn(val){
    let regExp = /^[A-Za-z\u4e00-\u9fa5]+$/
    if (regExp.test(val)) {
      return true
    }
    return false
  },
  /**
   * 只能输入字母，数字
   * @param {*} val 
   */
  onlyInputEnNum(val) {
    let regExp = /^[0-9a-zA-Z]+$/
    if (regExp.test(val)) {
      return true
    }
    return false
  },
  /**
   * 根据数组中某个属性值进行排序
   * @param {*} attr 排序的属性
   * @param {*} rev  true升序排序，false降序排序
   */
  sortByAttr(attr,rev = 1) {
    rev = rev ? 1 : -1
    return (a, b) => {
      if(a[attr] < b[attr]) {
        return rev * -1
      } else if(a[attr] > b[attr]) {
        return rev * 1
      } else {
        return 0
      }
    }
  }
}

