const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class IncreasingSineWaveStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    linkedISW : LinkedISW = new LinkedISW()
    animator : Animator = new Animator()
    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedISW.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedISW.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage = new IncreasingSineWaveStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(stopcb : Function) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = true
            clearInterval(this.interval)
        }
    }
}

class ISWNode {
    prev : ISWNode
    next : ISWNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new ISWNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / nodes
        const a : number = h/3
        context.strokeStyle = '#66BB6A'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        context.save()
        context.translate(0, h/2)
        var j = 0
        context.beginPath()
        for (var i = 360 * this.state.scale; i <= 360; i++) {
            const x = (gap * i) / 360 , y = -a * Math.sin(i * Math.PI/180)
            if (j == 0) {
                context.moveTo(x, y)
            } else {
                context.lineTo(x, y)
            }
            j++
        }
        context.stroke()
        context.restore()
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : ISWNode {
        var curr : ISWNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedISW {

    curr : ISWNode = new ISWNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
