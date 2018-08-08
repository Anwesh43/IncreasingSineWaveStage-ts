var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var IncreasingSineWaveStage = (function () {
    function IncreasingSineWaveStage() {
        this.canvas = document.createElement('canvas');
        this.linkedISW = new LinkedISW();
        this.animator = new Animator();
        this.initCanvas();
    }
    IncreasingSineWaveStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    IncreasingSineWaveStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.linkedISW.draw(this.context);
    };
    IncreasingSineWaveStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.linkedISW.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.linkedISW.update(function () {
                        _this.animator.stop();
                        _this.render();
                    });
                });
            });
        };
    };
    IncreasingSineWaveStage.init = function () {
        var stage = new IncreasingSineWaveStage();
        stage.render();
        stage.handleTap();
    };
    return IncreasingSineWaveStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.dir = 0;
        this.prevScale = 0;
    }
    State.prototype.update = function (stopcb) {
        this.scale += this.dir * 0.05;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            stopcb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(cb, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var ISWNode = (function () {
    function ISWNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    ISWNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new ISWNode(this.i + 1);
            this.next.prev = this;
        }
    };
    ISWNode.prototype.drawSineWave = function (context, a, gap, factor) {
        var j = 0;
        console.log(a * factor);
        context.beginPath();
        for (var i = 360 * this.state.scale; i <= 360; i++) {
            var x = (gap * i) / 360, y = (a * factor) * Math.sin(i * Math.PI / 180);
            if (j == 0) {
                context.moveTo(x, y);
            }
            else {
                context.lineTo(x, y);
            }
            j++;
        }
        context.stroke();
    };
    ISWNode.prototype.draw = function (context) {
        var gap = w / nodes;
        var a = h / 3;
        context.strokeStyle = '#66BB6A';
        context.lineCap = 'round';
        context.lineWidth = Math.min(w, h) / 60;
        context.save();
        context.translate(gap * this.i, h / 2);
        for (var j = 0; j < 5; j++) {
            this.drawSineWave(context, a, gap, (j + 1) / 5);
        }
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    ISWNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    ISWNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    ISWNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return ISWNode;
})();
var LinkedISW = (function () {
    function LinkedISW() {
        this.curr = new ISWNode(0);
        this.dir = 1;
    }
    LinkedISW.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedISW.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedISW.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedISW;
})();
