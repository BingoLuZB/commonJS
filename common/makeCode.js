//  分享带有二维码的卡片
class makeCode {
  constructor() {

  }

  // 初始化
  async init(id, config = {}) {
    this.el = document.getElementById(id)
    this.bgImgUrl = config.bgImgUrl
    this.width = config.width
    this.widthCode = config.widthCode
    this.height = config.height
    this.heightCode = config.heightCode
    this.x = config.x
    this.y = config.y
    this.name = config.name
    this.codeImgUrl = config.codeImgUrl
    this.ctx = ''
    this.el.width = this.width
    this.el.height = this.height
    this.img = ''
    await this.created()
  }

  // 创建上下文
  async created() {
    this.ctx = this.el.getContext('2d')
    await this.createdBgImg(this.bgImgUrl, 0, 0, this.width, this.height)
    await this.createdCodeImg(this.codeImgUrl, 0, 0, this.x, this.y)
    this.createdName()
    return new Promise((resolve, reject) => {
      this.exportImg()
      resolve()
    })
  }

  // 创建背景图片
  createdBgImg(url, sx, sy, swidth, sheight) {
    let img = new Image()
    img.src = url
    return new Promise((resolve, reject) => {
      img.onload = () => {
        this.ctx.drawImage(img, sx, sy, swidth, sheight)
        resolve()
      }
    })
  }

  // 创建二维码
  createdCodeImg(url, sx, sy, x, y) {
    let img = new Image()
    img.src = url
    return new Promise((resolve, reject) => {
      img.onload = () => {
        this.ctx.drawImage(img, sx, sy, img.width, img.height, x, y, this.widthCode, this.heightCode)
        resolve()
      }
    })
  }

  // 创建名字
  createdName() {
    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = 'normal normal normal 70px Arial'
    this.ctx.textAlign= 'center'
    this.ctx.fillText(this.name, this.width/2, 1230)
  }

  // 导出图片
  exportImg() {
    this.img = this.el.toDataURL()
  }
}
export default makeCode
