import axios from 'axios'
import qs from 'qs';
import config from './config'



// 是否登录
function isLogin(obj) {
  let token = getCookie('token')
  if (!token && obj.needLogin) {
    //  缓存设置重定向页面
    // window.localStorage.setItem("redirectUrl", "/vuespa/index.html" + window.location.hash);
    // 跳转到 线上默认登录页面
    window.location.replace(config.DLdefault);
    // window.location.href = 'http://www.baidu.com'; // test
    return false
  } else {
    return true
  }
}
// 合并obj
function andData (data) {
  var obj = {showLoading: false, showErr: true, needLogin: false}
  for (var v in data) {
    obj[v] = data[v];
  }
  return obj 
}
// 设置cookie
function setCookie (name, value) {
  var Days = 7
  var exp = new Date()
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
  document.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString()
}
// 获取cookie
function getCookie (name) {
  var arr
  var reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
  if (arr = document.cookie.match(reg)) {
    return unescape(arr[2])
  } else {
    return null
  }
}
// 是否为空
function isNotEmpty (str) {
  if (str !== '' && str !== null && typeof str !== 'undefined') {
    return true
  }
  return false
}
// 展示错误信息
function showErrFun (res, obj) {
  if (res.code && res.code !== 200 && obj.showErr) {
    console.log('弹出错误提示框')
  }
}
// 展示Loading
function showLoadFun (obj) {
  console.log('清除loading')
  if(obj.showLoading) {
    console.log('展示loading')
  }
}




// ==================================================================================

const request = axios
// axios.defaults.baseURL = 'https://web-api.juejin.im' //test
axios.defaults.baseURL = config.baseURL
let CancelToken = axios.CancelToken;
let pending = []; // 用于取消重复请求 声明一个数组用于存储每个ajax请求的取消函数和ajax标识 
let msg = '' 
let removePending = (ever) => {
  // 后端还没有返回信息，前端又请求的时候，则取消上一个相同的请求
    for(let p in pending){
        if(pending[p].u === ever.url + '&' + ever.method) { //当当前请求在数组中存在时执行函数体
            pending[p].f(); //执行取消操作
            pending.splice(p, 1); //把这条记录从数组中移除
            msg = '取消重复请求'
        }
    }
}

request.interceptors.request.use( // 请求拦截器 请求开始
  (request) => {
    msg = ''
    removePending(request); //在一个ajax发送前执行一下取消操作
    request.cancelToken = new CancelToken((c)=>{
      //  pending.push({ u: request.url + JSON.stringify(request.data) +'&' + request.method, f: c })
       pending.push({ u: request.url + '&' + request.method, f: c })
    });
    return request
  },
  (err) => {
    return Promise.reject(err);
  }
)
  

request.interceptors.response.use( //响应拦截器
  response => {
    removePending(response.config);  //在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    return response;
  },
  (err) => {
    err.message = msg
    return Promise.reject(err);
  }
)


// 百度到的另一种取消重复请求的方法

// const removePending = (key, isRequest = false) => {
//   if (pending[key] && isRequest) {
//     pending[key]('取消重复请求')
//   }
//   delete pending[key]
// }
// const getRequestIdentify = (config, isReuest = false) => {
//   let url = config.url
//   if (isReuest) {
//     url = config.baseURL + config.url.substring(1, config.url.length)
//   }
//   return config.method === 'get' ? encodeURIComponent(url + JSON.stringify(config.params)) : encodeURIComponent(config.url + JSON.stringify(config.data))
// }

// // 请求拦截器
// axios.interceptors.request.use(config => {
//   // 拦截重复请求(即当前正在进行的相同请求)
//   let requestData = getRequestIdentify(config, true)
//   removePending(requestData, true)

//   config.cancelToken = new CancelToken((c) => {
//     pending[requestData] = c
//   })

//   return config
// }, error => {
//   return Promise.reject(error)
// })

// // 响应拦截器
// axios.interceptors.response.use(response => {
//   // 把已经完成的请求从 pending 中移除
//   let requestData = getRequestIdentify(response.config)
//   removePending(requestData)

//   return {
//     code: response.status,
//     message: response.statusText,
//     data: response.data
//   }
// }, err => {
//   if (err && err.response) {
//     switch (err.response.status) {
//       case 400:
//         err.message = '错误请求'
//         break
//       default:
//         err.message = `连接错误${err.response.status}`
//     }
//     let errData = {
//       code: err.response.status,
//       message: err.message
//     }
//     // 统一错误处理可以放这，例如页面提示错误...
//     console.log('统一错误处理: ', errData)
//   }

//   return Promise.reject(err)
// })




const ajax = {
  get (url, data, obj) {
    obj = andData(obj)
    // 检查是否已登录
    isLogin(obj)
    showLoadFun(obj)
    let headers = {
    }
    if (getCookie('token')) {
      headers.token = getCookie('token')
    }
    return request({ 
      url, 
      method: 'get', 
      params: data, 
      headers,
      // cancelToken: new CancelToken(function (c) {
      //   let isLoginState = isLogin(obj)
      //     if (!isLoginState) {
      //       c()
      //     }
      // })  
    }).then(function (d) {
      console.log('清除loading')
      showErrFun(d.data, obj)
      return d.data
    })
  },
  post (url, data, obj) {
    obj = andData(obj)
    // 检查是否已登录
    isLogin(obj)
    showLoadFun(obj)
    if (!data) {
      data = ''
    }
    let headers = {
      'Content-Type': 'application/json'
    }
    if (getCookie('token')) {
      headers.token = getCookie('token')
    }
    return request({ 
      method: 'post', 
      data: qs.stringify(data),
      // data,
      url, 
      headers, 
      // cancelToken: new CancelToken(function (c) {
      // let isLoginState = isLogin(obj)
      //   if (!isLoginState) {
      //     c()
      //   }
      // }) 
    }).then(function (d) {
      console.log('清除loading')
      showErrFun(d.data, obj)
      return d.data
    })
  },
  put (url, data, obj) {
    obj = andData(obj)
    isLogin(obj)
    showLoadFun(obj)
    let headers = {
      'Content-Type': 'application/json'
    }
    if (getCookie('token')) {
      headers.token = getCookie('token')
    }
    return request({ 
      method: 'put', 
      data, 
      url, 
      headers,
      // cancelToken: new CancelToken(function (c) {
      //   let isLoginState = isLogin(obj)
      //     if (!isLoginState) {
      //       c()
      //     }
      // })  
    }).then(function (d) {
      console.log('清除loading')
      showErrFun(d.data, obj)
      return d.data
    })
  },
  postUp (url, data, obj) {
    obj = andData(obj)
    isLogin(obj)
    showLoadFun(obj)
    let headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'multipart/form-data;'
    }
    if (getCookie('token')) {
      headers.token = getCookie('token')
    }
    return request({ 
      method: 'post', 
      data, 
      url, 
      headers,
      // cancelToken: new CancelToken(function (c) {
      //   let isLoginState = isLogin(obj)
      //     if (!isLoginState) {
      //       c()
      //     }
      // })  
    }).then(function (d) {
      console.log('清除loading')
      showErrFun(d.data, obj)
      return d.data
    })
  },
  postJson (url, data, obj) {
    obj = andData(obj)
    isLogin(obj)
    showLoadFun(obj)
    let headers = {
      'Content-Type': 'application/json'
    }
    if (getCookie('token')) {
      headers.token = getCookie('token')
    }
    return request({ 
      method: 'post', 
      data, 
      url, 
      headers,       
      // cancelToken: new CancelToken(function (c) {
      // let isLoginState = isLogin(obj)
      //   if (!isLoginState) {
      //     c()
      //   }
      // })  
    }).then(function (d) {
      console.log('清除loading')
      showErrFun(d.data, obj)
      return d.data
    })
  }
}




export default ajax
