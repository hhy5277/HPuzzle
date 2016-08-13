'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * 拼图核心js es6
 */

{
    (function () {
        var Puzzle = function () {
            function Puzzle(opts) {
                var _this = this;

                _classCallCheck(this, Puzzle);

                var DEFAULT = {
                    imgUrl: '',
                    contanier: 'body',
                    size: '600',
                    level: 1
                };
                opts.contanier = $(opts.contanier);

                // 格式化尺寸单位
                if (opts.size) {
                    opts.size = parseInt(opts.size);
                }

                // 配置参数
                this.opts = $.extend({}, DEFAULT, opts);

                // 拼图行数
                if (opts.level < 1) {
                    opts.level = 1;
                }
                if (opts.level > 3) {
                    opts.level = 3;
                }

                this.row = opts.level + 2;

                // 拼图碎片数
                this.fragment = this.row * this.row;

                // 碎片的定位数组
                this.positionArry = [];

                // 点击音效
                this.clickSound = $('<audio src="' + this.opts.clickSound + '" preload></audio>')[0];

                // 胜利音效
                this.clearSound = $('<audio src="' + this.opts.clearSound + '" preload></audio>')[0];

                // 图片实例
                this.simpleImg = $('<img src="' + this.opts.imgUrl + '">')[0];

                // 键盘事件
                if (!window.Puzzle._isKeyDownEventBind) {
                    window.Puzzle._isKeyDownEventBind = true;
                    $(document).on('keydown', function (e) {
                        _this._keyDown(e);
                    });
                }
            }

            _createClass(Puzzle, [{
                key: '_getRandomNum',
                value: function _getRandomNum(Min, Max) {
                    var Range = Max - Min;
                    var Rand = Math.random();
                    return Min + Math.round(Rand * Range);
                }
            }, {
                key: '_getSideDoms',
                value: function _getSideDoms(dom) {
                    //获取点击目标的上下左右
                    var top = parseInt(dom.style.top);
                    var left = parseInt(dom.style.left);
                    var h = parseInt(dom.offsetHeight);
                    var w = parseInt(dom.offsetWidth);
                    var items = this.items;

                    // 上下左右相邻的碎片 理论中的坐标
                    var side = {
                        top: { top: top - h, left: left },
                        bottom: { top: top + h, left: left },
                        left: { top: top, left: left - w },
                        right: { top: top, left: left + w }
                    };

                    var sideDoms = {};
                    var keys = ['top', 'left', 'bottom', 'right'];

                    // 以实际坐标跟理论坐标对比，误差合理的判定为领边碎片
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        for (var j = 0; j < keys.length; j++) {
                            var key = keys[j];
                            var itemTop = parseInt(item.style['top']);
                            var itemLeft = parseInt(item.style['left']);
                            var topDiff = Math.abs(itemTop - side[key]['top']);
                            var leftDiff = Math.abs(itemLeft - side[key]['left']);
                            if (topDiff < 2 && leftDiff < 2) {
                                sideDoms[key] = item;
                            }
                        }
                    }
                    return sideDoms;
                }
            }, {
                key: '_isClear',
                value: function _isClear() {
                    //是否通关
                    for (var i = 0; i < this.items.length; i++) {
                        var item = this.items[i];
                        if (item._puzzleTop != item.style.top || item._puzzleLeft != item.style.left) {
                            return false;
                        }
                    }
                    return true;
                }
            }, {
                key: '_move',
                value: function _move(traget) {
                    //绘制拼图改变
                    var sideDoms = this._getSideDoms(traget);
                    var blank = void 0;
                    var temp = {
                        top: parseInt(traget.style.top) + 'px',
                        left: parseInt(traget.style.left) + 'px'
                    };
                    for (var key in sideDoms) {
                        if (sideDoms[key].className == '') {
                            // 获取到空白块
                            blank = sideDoms[key];
                            // 空白快和点击块交换位置
                            traget.style.top = blank.style.top;
                            traget.style.left = blank.style.left;
                            blank.style.top = temp.top;
                            blank.style.left = temp.left;
                            break;
                        }
                    }
                    this.clickSound.play();
                }
            }, {
                key: '_keyDown',
                value: function _keyDown(event) {
                    var sideDoms = this._getSideDoms(this.items.blank);
                    var keys = {
                        top: 40,
                        bottom: 38,
                        left: 39,
                        right: 37
                    };
                    var direction = void 0;
                    for (var key in keys) {
                        if (event.which === keys[key]) {
                            direction = key;
                        }
                    }
                    for (var _key in sideDoms) {
                        if (_key == direction) {
                            this._move(sideDoms[direction]);
                        }
                    }
                }
            }, {
                key: 'create',
                value: function create() {
                    var _this2 = this;

                    //创建结构
                    var puzzleString = '';
                    var fragment = this.fragment;
                    var row = this.row;
                    var fragmentSize = this.opts.size / row;
                    var top = 0;
                    var left = 0;
                    var leftIndex = 1;
                    var simpleImgWidth = this.simpleImg.width;
                    var simpleImgHeight = this.simpleImg.height;

                    for (var i = 0; i < fragment; i++) {
                        var className = '';
                        var style = '';
                        if (leftIndex === row) {
                            top++;
                        }
                        if (i % row === 0) {
                            left = 0;
                            leftIndex = 0;
                        } else {
                            left++;
                        }

                        // 拼图碎片必须的样式
                        //拼图的第一块为空白占位块
                        if (i > 0) {
                            style += '\n                    background:#ddd url(' + this.opts.imgUrl + ') no-repeat;\n                    cursor: pointer;\n                    ';
                            className += 'fragment';
                        }

                        if (simpleImgWidth < simpleImgHeight) {
                            style += 'background-size: ' + this.opts.size + 'px auto;';
                        } else {
                            style += 'background-size: auto ' + this.opts.size + 'px;';
                        }

                        // 碎片尺寸和位置
                        style += '\n                    background-position: -' + fragmentSize * left + 'px -' + fragmentSize * top + 'px;\n                    width:' + fragmentSize + 'px;\n                    height:' + fragmentSize + 'px;\n                    position:absolute;\n                    left: ' + fragmentSize * left + 'px;\n                    top: ' + fragmentSize * top + 'px;\n                ';
                        leftIndex++;
                        puzzleString += '<div class="' + className + '" style="' + style + '"></div>';
                    }
                    puzzleString = '<div class="puzzle" style="\n                width:' + this.opts.size + 'px;\n                height:' + this.opts.size + 'px;\n                position:relative;\n            ">' + puzzleString + '</div>';

                    var $puzzle = $(puzzleString);

                    // 记录容器
                    this.puzzle = $puzzle[0];

                    // 记录所有碎片
                    this.items = $puzzle.children();

                    // 给碎片dom 加上序号
                    this.items.each(function (index, item) {
                        item._puzzleTop = item.style.top;
                        item._puzzleLeft = item.style.left;
                        item._puzzleIndex = index;

                        // 记录第一个空白块
                        if (index === 0) {
                            _this2.items.blank = item;
                        }
                        // 记录每个碎片当前位置的定位
                        _this2.positionArry[index] = { left: item.style.left, top: item.style.top };
                    });

                    // 移动碎片事件
                    $puzzle.on('click', '.fragment', function (e) {
                        var target = e.target;
                        var timer = target._puzzleTimer;

                        // 判断是否通关
                        if (timer) {
                            clearTimeout(timer);
                        }
                        timer = setTimeout(function () {
                            if (_this2._isClear()) _this2.clearance();
                        }, 310);

                        // 更新渲染拼图
                        _this2._move(target);
                        return false;
                    });

                    this.opts.contanier.append(this.puzzle);

                    return this;
                }
            }, {
                key: 'reSize',
                value: function reSize(size) {
                    var oldSize = this.opts.size;
                    var oldItemSize = oldSize / this.row;
                    var newItemSize = size / this.row;
                    var newBackgroundSize = void 0;

                    // 计算新碎片的背景尺寸
                    if (this.simpleImg.width < this.simpleImg.height) {
                        newBackgroundSize = size + 'px auto';
                    } else {
                        newBackgroundSize = 'auto ' + size + 'px';
                    }

                    // 更新参数
                    this.opts.size = parseInt(size);

                    // 更新拼图容器尺寸
                    $(this.puzzle).css({
                        width: size,
                        height: size
                    });

                    // 更新每个碎片属性
                    $.each(this.items, function (index, item) {
                        var $item = $(item);
                        var top = parseInt(item.style.top);
                        var left = parseInt(item.style.left);
                        var topIndex = Math.round(top / oldItemSize);
                        var leftIndex = Math.round(left / oldItemSize);
                        var newTop = newItemSize * topIndex;
                        var newLeft = newItemSize * leftIndex;
                        $item.css({
                            width: newItemSize,
                            height: newItemSize,
                            top: newTop,
                            left: newLeft,
                            backgroundSize: newBackgroundSize,
                            backgroundPosition: '-' + newTop + 'px -' + newLeft + 'px'
                        });
                    });

                    return this;
                }
            }, {
                key: 'setLevel',
                value: function setLevel(num) {
                    //设置难度
                    num = parseInt(num);
                    if (num < 1) {
                        num = 1;
                    }
                    if (num > 3) {
                        num = 3;
                    }
                    this.opts.level = num;
                    this.row = this.opts.level + 2;
                    this.fragment = this.row * this.row;
                    this.destory().create().random();
                    return this;
                }
            }, {
                key: 'getLevel',
                value: function getLevel() {
                    return this.opts.level;
                }
            }, {
                key: 'random',
                value: function random() {
                    //随机排序拼图碎片
                    // 建立一个新的数组，它存放所有拼图碎片
                    var arr = [];
                    for (var i = 0; i < this.items.length; i++) {
                        arr.push(this.items[i]);
                    }

                    // 从新数组中随机抽取碎片
                    var l = arr.length;
                    for (var _i = 0; _i < l; _i++) {
                        var num = this._getRandomNum(0, arr.length - 1);
                        // 抽取一个碎片
                        var f = arr[num];

                        // 重绘制这个碎片的定位
                        f.style.top = this.positionArry[_i].top;
                        f.style.left = this.positionArry[_i].left;

                        // 从新数组中移除已经重定位的碎片
                        arr.splice(num, 1);
                    }

                    return this;
                }
            }, {
                key: 'clearance',
                value: function clearance() {
                    //触发胜利
                    this.items.hide();
                    $(this.puzzle).css({ background: 'url(' + this.opts.imgUrl + ')', backgroundSize: 'cover' });
                    this.clearSound.play();
                    return this;
                }
            }, {
                key: 'destory',
                value: function destory() {
                    $(this.puzzle).remove();
                    return this;
                }
            }]);

            return Puzzle;
        }();

        window.Puzzle = function (opts) {
            var p = new Puzzle(opts);
            p.init = function () {
                if (p.inited) {
                    p.destory().create().random();
                } else {
                    p.inited = true;
                    p.create();
                    setTimeout(function () {
                        p.random();
                    });
                }
                return p;
            };
            return p;
        };
    })();
}