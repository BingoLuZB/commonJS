/**axios封装
 * 请求拦截、相应拦截、错误统一处理
 */
import axios from 'axios';
import qs from 'qs';
import config from './config.js'
//默认请求地址 ：如果有用vue配置跨域的话，那么就要做个判断 开发环境下，baseURL要为跨域所配置的东西，例如 ‘/’或者 '/api'等等
// baseURL: process.env.NODE_ENV === "production" ? 'https://gameapi.kunyufun.com' : '/api', 这里跨域是配置成了api的
axios.defaults.baseURL = config.baseURL
// 请求超时时间
axios.defaults.timeout = 10000;
// 解决跨域
axios.defaults.withCredentials = true;
// post请求头
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// pending CancelToken 用于阻止重复请求
const pending = {}
const CancelToken = axios.CancelToken

// 项目开发的额外配置
let defaultConfig = {
    //是否显示loading加载图 
    showLoading: {
        flag: false,
        fun: () => {
            console.log('显示loading图')
        }
    },
    //是否需要登录才能请求
    needLogin: {
        flag: false,
        fun: () => {
            console.error('需要登录才能执行请求')
            return
        }
    },
    //是否显示错误提示
    showErr: {
        flag: true,
        fun: (status, message) => {
            console.error('展示错误', status, message)
        }
    },
    //是否开启拦截重复请求
    repeatCancel: {
        flag: true,
        fun: () => {}
    }
}

/**
 * 封装请求拦截器
 * @param {*拦截回调} interceptorFun 
 * @param {*错误回调} errorFun 
 */
function setRequestInterceptor(interceptorFun, errorFun) {
    return axios.interceptors.request.use(interceptorFun, errorFun)
}


/**
 * 封装添加响应拦截器方法
 * @param interceptorFun
 * @param errorFun
 * @returns {Interceptor}
 */
function setResponseInterceptor(interceptorFun, errorFun) {
    return axios.interceptors.response.use(interceptorFun, errorFun)

}

// 拦截重复请求
const removePending = (key, isRequest = false) => {
    if (pending[key] && isRequest) {
        pending[key]('取消重复请求') // 执行CancelToken，用于取消进行中的请求
    }
    delete pending[key]
}

const setUrl = (config, isReuest = false) => {
    // request的时候，config.url是action路径；response的时候，config.url是全路径。所以存在判断请求操作从而处理url
    let url = config.url
    if (isReuest) {
        url = config.baseURL + config.url.substring(1, config.url.length)
    }
    return config.method === 'get' || config.method === 'delete' ? encodeURIComponent(url + JSON.stringify(config.params)) : encodeURIComponent(url + JSON.stringify(config.data))
}

// 执行请求拦截
setRequestInterceptor(
    config => {
        const {
            flag
        } = defaultConfig.repeatCancel.flag
        config.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'X-Requested-With': 'XMLHttpRequest'
        }
        // 拦截重复请求(即当前正在进行的相同请求)
        let requestData = setUrl(config, flag)
        removePending(requestData, flag)
        config.cancelToken = new CancelToken((c) => {
            pending[requestData] = c
        })
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 执行响应拦截
setResponseInterceptor(
    response => {
        // 把已经完成的请求从 pending 中移除
        let requestData = setUrl(response.config)
        removePending(requestData)
        return response
    }, error => {
        if (error && error.response) {
            const status = error.response.status
            const getMsg = new Map([
                [400, '错误请求'],
                [401, '未授权，请重新登录'],
                [403, '拒绝访问'],
                [404, '请求错误,未找到该资源'],
                [405, '请求方法未允许'],
                [408, '请求超时'],
                [500, '服务器端出错'],
                [501, '网络未实现'],
                [502, '网络错误'],
                [503, '服务不可用'],
                [504, '网络超时'],
                [505, 'http版本不支持该请求']
            ])
            error.message = getMsg.get(status) || `连接错误${status}`
            if (defaultConfig.showErr.flag) {
                // 展示错误提示
                defaultConfig.showErr.fun(status, error.message)
            }
        } else {
            // 请求超时
            if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
                console.error('连接请求超时')
            }
        }
        return Promise.reject(error)
    }
)



/**
 * 封装get post delete put方法
 * @param method
 * @param url
 * @param params
 * @param selfConfig 单个请求的个性化配置
 * @param devConfig 项目开发额外配置，例如是否需要重复请求，是否需要登录，是否需要展示错误提示框
 * @returns {Promise}
 */
function methodAxios(method, url, params, devConfig = {}, selfConfig = {}) {
    const todoType = ['showLoading', 'needLogin']
    for (let i in defaultConfig) {
        let {
            flag,
            fun
        } = defaultConfig[i]
        // devConfig有填入自定义的东西，例如showLoading的话，就替换掉defaultConfig的showLoading
        if (devConfig[i] && typeof devConfig[i] === "boolean") {
            flag = devConfig[i]
        }
        if (todoType.includes(i) && flag) {
            fun()
        }
    }
    let httpDefault = {
        method,
        url,
        params: method === 'GET' || method === 'DELETE' ? params : null,
        data: method === 'POST' || method === 'PUT' ? qs.stringify(params) : null
    }
    let requestConfig = Object.assign({}, httpDefault, selfConfig)
    // 这个其实可以直接return axios(requestConfig)，为何需要再增加一层Promise？
    // 这里是有原因的：
    // 1、如果直接return axios(requestConfig)，请求成功或失败的处理是交由使用者
    // 2、这里封装多一层Promise，是便于此处封装时考虑添加公共处理如开启遮罩层关闭遮罩层，之后才抛出调用结果给调用方，而不应该由调用方赖关闭遮罩层
    return new Promise((resolve, reject) => {
        axios(requestConfig)
            .then((response) => {
                resolve(response.data)
            }).catch((error) => {
                reject(error)
            }).finally(() => {
                if (defaultConfig.showLoading.flag) {
                    console.log('关闭loading')
                }
            })
    })
}


const requerstObj = {
    get: (url, params, devConfig, selfConfig) => 
('GET', url, params, devConfig, selfConfig),
    post: (url, params, devConfig, selfConfig) => methodAxios('POST', url, params, devConfig, selfConfig),
    put: (url, params, devConfig, selfConfig) => methodAxios('PUT', url, params, devConfig, selfConfig),
    delete: (url, params, devConfig, selfConfig) => methodAxios('DELETE', url, params, devConfig, selfConfig),
}


export default requerstObj
