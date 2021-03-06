/**
 * HPuzzle  v0.1.6
 * @license MIT
 * Designed and built by Moer
 * Demo     https://moerj.github.io/HPuzzle/
 * GitHub   https://github.com/Moerj/HPuzzle
 */

{

    class Puzzle {
        constructor(opts) {
            const DEFAULT = {
                imgUrl: '',
                contanier: 'body',
                size: '600',
                level: 1
            }
            opts.contanier = $(opts.contanier)

            // 格式化尺寸单位
            if (opts.size) {
                opts.size = parseInt(opts.size)
            }

            // 配置参数
            this.opts = $.extend({}, DEFAULT, opts);

            // 难度，最小1
            if (opts.level < 1) {
                opts.level = 1
            }

            // 状态容器
            this.status = {}

            // 拼图行数
            this.row = opts.level + 2

            // 拼图碎片数
            this.fragment = this.row * this.row

            // 碎片的定位数组
            this.positionArry = []

            // 点击音效
            this.clickSound = $(`<audio src="${this.opts.clickSound}" preload></audio>`)[0]

            // 胜利音效
            this.clearSound = $(`<audio src="${this.opts.clearSound}" preload></audio>`)[0]


            // 键盘事件
            if (!window.Puzzle._isKeyDownEventBind) {
                window.Puzzle._isKeyDownEventBind = true
                $(document).on('keydown', (e) => {
                    if (document.activeElement == this.puzzle) {
                        e.preventDefault()
                        this._keyDown(e)
                    }
                })
            }

        }
        _getRandomNum(Min, Max) {
            let Range = Max - Min;
            let Rand = Math.random();
            return (Min + Math.round(Rand * Range));
        }
        _getSideDoms(dom) { //获取点击目标的上下左右
            let top = parseInt(dom.style.top)
            let left = parseInt(dom.style.left)
            let h = parseInt(dom.offsetHeight)
            let w = parseInt(dom.offsetWidth)
            let items = this.items

            // 上下左右相邻的碎片 理论中的坐标
            let side = {
                top: { top: top - h, left: left },
                bottom: { top: top + h, left: left },
                left: { top: top, left: left - w },
                right: { top: top, left: left + w }
            }

            let sideDoms = {};
            let keys = ['top', 'left', 'bottom', 'right']

            // 以实际坐标跟理论坐标对比，误差合理的判定为领边碎片
            for (let i = 0; i < items.length; i++) {
                let item = items[i]
                for (let j = 0; j < keys.length; j++) {
                    let key = keys[j]
                    let itemTop = parseInt(item.style['top'])
                    let itemLeft = parseInt(item.style['left'])
                    let topDiff = Math.abs(itemTop - side[key]['top'])
                    let leftDiff = Math.abs(itemLeft - side[key]['left'])
                    if (topDiff < 2 && leftDiff < 2) {
                        sideDoms[key] = item
                    }
                }
            }
            return sideDoms
        }
        _isClear() { //是否通关
            for (let i = 0; i < this.items.length; i++) {
                if (this.items[i]._puzzleCurrentIndex != this.items[i]._puzzleIndex) {
                    return false
                }
            }
            return true
        }
        _move(target) { //绘制拼图改变
            if (this.status.clear) {
                // 已拼完状态不再执行
                return
            }

            let sideDoms = this._getSideDoms(target)
            let blank
            let temp = {
                top: parseInt(target.style.top) + 'px',
                left: parseInt(target.style.left) + 'px'
            }
            for (let key in sideDoms) {
                if (sideDoms[key].className == '') {
                    // 获取到空白块
                    blank = sideDoms[key]

                    // 空白快和点击块交换位置
                    target.style.top = blank.style.top
                    target.style.left = blank.style.left
                    blank.style.top = temp.top
                    blank.style.left = temp.left

                    // 交换当前索引
                    let tempCurr = target._puzzleCurrentIndex
                    target._puzzleCurrentIndex = blank._puzzleCurrentIndex
                    blank._puzzleCurrentIndex = tempCurr

                    break
                }
            }
            this.clickSound.play()

            // 判断是否通关
            let timer = target._puzzleTimer
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(() => {
                if (this._isClear()) this.clearance()
            }, 310)
        }
        _keyDown(event) {
            let sideDoms = this._getSideDoms(this.items.blank)
            let keys = {
                top: 40,
                bottom: 38,
                left: 39,
                right: 37
            }
            let direction;
            for (let key in keys) {
                if (event.which === keys[key]) {
                    direction = key
                }
            }
            for (let key in sideDoms) {
                if (key == direction) {
                    this._move(sideDoms[direction])
                }
            }
        }
        create() { //创建结构
            if (this.puzzle) {
                throw new Error('this puzzle has already created. if you want to create again, do destory it first.')
            }

            // 设置状态
            this.status.clear = false

            // 图片实例
            let $img = $(`<img src="${this.opts.imgUrl}">`)
            this.simpleImg = $img[0]

            // 每次创建后并不能立即获取图片实例的尺寸，因此需要异步再重置一次尺寸
            $img.load(() => {
                this.resize()
            })

            let puzzleString = ''
            let fragment = this.fragment
            let row = this.row
            let fragmentSize = this.opts.size / row
            let top = 0
            let left = 0
            let leftIndex = 1
            let simpleImgWidth = this.simpleImg.naturalWidth
            let simpleImgHeight = this.simpleImg.naturalHeight

            for (let i = 0; i < fragment; i++) {
                let className = ''
                let style = ''
                if (leftIndex === row) {
                    top++
                }
                if (i % row === 0) {
                    left = 0
                    leftIndex = 0
                } else {
                    left++
                }

                // 拼图碎片必须的样式
                //拼图的第一块为空白占位块
                if (i > 0) {
                    style += `
                    background:#ddd url(${this.opts.imgUrl}) no-repeat;
                    cursor: pointer;
                    `;
                    className += 'fragment'
                }

                if (simpleImgWidth < simpleImgHeight) {
                    style += `background-size: ${this.opts.size}px auto;`
                } else {
                    style += `background-size: auto ${this.opts.size}px;`
                }

                // 碎片尺寸和位置
                style += `
                    background-position: -${fragmentSize*left}px -${fragmentSize*top}px;
                    width:${fragmentSize}px;
                    height:${fragmentSize}px;
                    position:absolute;
                    left: ${fragmentSize*left}px;
                    top: ${fragmentSize*top}px;
                `
                leftIndex++
                puzzleString += `<div class="${className}" style="${style}"></div>`;

            }
            puzzleString = `<div class="puzzle" tabindex="0" style="
                width:${this.opts.size}px;
                height:${this.opts.size}px;
                position:relative;
            ">${puzzleString}</div>`

            let $puzzle = $(puzzleString)

            // 记录容器
            this.puzzle = $puzzle[0]

            // 记录所有碎片
            this.items = $puzzle.children()

            // 给碎片dom 加上序号
            this.items.each((index, item) => {
                item._puzzleTop = item.style.top;
                item._puzzleLeft = item.style.left;
                item._puzzleIndex = index
                item._puzzleCurrentIndex = index

                let itemSize = parseInt(this.opts.size / this.row)
                let itemTop = parseInt(item.style.top)
                let itemLeft = parseInt(item.style.left)
                    // 当前碎片的定位索引，用于计算出新尺寸的背景定位
                item._puzzleTopIndex = Math.round(itemTop / itemSize)
                item._puzzleLeftIndex = Math.round(itemLeft / itemSize)

                // 记录第一个空白块
                if (index === 0) {
                    this.items.blank = item
                }
                // 记录每个碎片当前位置的定位
                this.positionArry[index] = { left: item.style.left, top: item.style.top }

            })

            // 移动碎片事件
            $puzzle.on('click', '.fragment', (e) => {
                // 更新渲染拼图
                this._move(e.target)
                return false
            })

            this.opts.contanier.append(this.puzzle)

            return this
        }
        replace(newImg) {
            $(this.simpleImg).remove()
            if (typeof newImg == 'string') {
                this.opts.imgUrl = newImg
            } else {
                this.opts.imgUrl = newImg.src
            }
            this.init()
        }
        resize(size) {
            if (!size) {
                size = this.opts.size
            }

            let oldSize = this.opts.size
            let oldItemSize = oldSize / this.row
            let newItemSize = size / this.row
            let newBackgroundSize;

            // 计算新碎片的背景尺寸
            if (this.simpleImg.width < this.simpleImg.height) {
                newBackgroundSize = `${size}px auto`
            } else {
                newBackgroundSize = `auto ${size}px`
            }

            // 更新参数
            this.opts.size = parseInt(size)

            // 更新拼图容器尺寸
            $(this.puzzle).css({
                width: size,
                height: size
            })

            // 更新每个碎片属性
            $.each(this.items, (index, item) => {
                let $item = $(item)
                let top = parseInt(item.style.top)
                let left = parseInt(item.style.left)
                let topIndex = Math.round(top / oldItemSize)
                let leftIndex = Math.round(left / oldItemSize)
                let newTop = newItemSize * topIndex
                let newLeft = newItemSize * leftIndex
                let newPosTop = newItemSize * item._puzzleTopIndex
                let newPosLeft = newItemSize * item._puzzleLeftIndex
                $item.css({
                    width: newItemSize,
                    height: newItemSize,
                    top: newTop,
                    left: newLeft,
                    backgroundSize: newBackgroundSize,
                    backgroundPosition: `-${newPosLeft}px -${newPosTop}px`
                })

                // 从新记录定位,在通关判断用调用
                item._puzzleLeft = item.style.left
                item._puzzleTop = item.style.top
            })

            return this
        }
        setLevel(num) { //设置难度
            num = parseInt(num)
            if (num < 1) {
                num = 1
            }
            if (num > 3) {
                num = 3
            }
            this.opts.level = num
            this.row = this.opts.level + 2;
            this.fragment = this.row * this.row
            this.destory().create().random()
            return this
        }
        getLevel() {
            return this.opts.level
        }
        random() { //随机排序拼图碎片
            // 建立一个新的数组，它存放所有拼图碎片
            let arr = []
            for (let i = 0; i < this.items.length; i++) {
                arr.push(this.items[i])
            }

            // 从新数组中随机抽取碎片
            let l = arr.length;
            for (let i = 0; i < l; i++) {
                let num = this._getRandomNum(0, arr.length - 1)
                    // 抽取一个碎片
                let f = arr[num]

                // 设置碎片当前索引
                f._puzzleCurrentIndex = i

                // 重绘制这个碎片的定位
                f.style.top = this.positionArry[i].top
                f.style.left = this.positionArry[i].left

                // 从新数组中移除已经重定位的碎片
                arr.splice(num, 1)

            }

            return this
        }
        clearance() { //触发胜利
            this.status.clear = true
            this.items.hide()
            $(this.puzzle).css({ background: `url(${this.opts.imgUrl})`, backgroundSize: 'cover' })
            this.clearSound.play()
            return this
        }
        destory() {
            $(this.puzzle).remove()
            this.puzzle = null
            return this
        }
        init() {
            if (this.status.inited) {
                this.destory().create().random()
            } else {
                this.status.inited = true
                this.create()
                    setTimeout(() => { this.random() })
            }
            return this
        }
    }


    window.Puzzle = (opts) => {
        return new Puzzle(opts)
    };




}