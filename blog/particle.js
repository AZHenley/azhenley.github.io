var time = 0;
var burst = 3;
var rate = 30;
var count = 0;
let app = new PIXI.Application({
    width: 600,
    height: 400,
    backgroundColor: 0xf0f0f0
});
app.stage.sortableChildren = true;
document.getElementById('display').appendChild(app.view);

////

var code1 = "";
var code2 = "";
let slider1 = document.getElementById("s1");
let output1 = document.getElementById("st1");
output1.innerHTML = slider1.value; // Display the default value
slider1.oninput = function() {
    output1.innerHTML = this.value;
    burst = this.value;
}
let slider2 = document.getElementById("s2");
let output2 = document.getElementById("st2");
output2.innerHTML = slider2.value; // Display the default value
slider2.oninput = function() {
    output2.innerHTML = this.value;
    rate = this.value;
}

////

function run(obj) {
    obj.x += Math.cos(obj.rotation)*obj.speed;
    obj.y += Math.sin(obj.rotation)*obj.speed;
}

function rgbToHex(r, g, b) {
    return ((r << 16) | (g << 8) | b);
}

function makeShape(r, g, b) {
    let shape = new PIXI.Graphics();
    shape.beginFill(rgbToHex(r, g, b));
    shape.drawCircle(0, 0, 5);
    shape.endFill();
    return shape;
}

function updateShape(shape, r, g, b) {
    shape.clear();
    shape.beginFill(rgbToHex(r, g, b));
    shape.drawCircle(0, 0, 5);
    shape.endFill();
    return shape;
}

class Particle {
    constructor(shape, behavior) {
        this.i = 0;
        this.shape = shape;
        this.r = this._r = 0;
        this.g = this._g = 0;
        this.b = this._b = 0;
        this.alpha = 1;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.speed = 0;
        this.behavior = behavior;
        this.life = 3000;
        this.xscale = 1;
        this.yscale = 1;
        this.shape.x = this.x;
        this.shape.y = this.y;
    }

    update() {
        this.behavior(this);
        if(this.r != this._r || this.g != this._g || this.b != this._b) {
            this.shape = updateShape(this.shape, this.r, this.g, this.b);
        }
        this.shape.x = this.x;
        this.shape.y = this.y;
        this.shape.scale.x = this.xscale;
        this.shape.scale.y = this.yscale;
        this.shape.alpha = this.alpha;
        this.zIndex = this.z;
        this.life--;
        if (this.life <= 0) {
            app.stage.removeChild(this.shape);
        }
        run(this);
        this._r = this.r;
        this._g = this.g;
        this._b = this.b;
    }
}

class Emitter {
    constructor(create) {
        this.create = create;
        this.timer = 0;
        this.particles = [];
    }

    update() {
        this.timer++;
        if (this.timer >= rate) {
            this.timer = 0;
            for (let i = 0; i < burst; i++) {
                count += 1;
                let newParticle = this.create();
                app.stage.addChild(newParticle.shape);
                this.particles.push(newParticle);
            }
        }
        this.particles.forEach(particle => particle.update());
    }
}
let emitters = [];

function step(p) {
    eval(code1);
}

function init() {
    let newShape = makeShape(50, 250, 100);
    let p = new Particle(newShape, step);
    p.i = count;
    eval(code2);
    return p;
}

let emitter = new Emitter(init);
emitters.push(emitter);

function update() {
    emitters.forEach(emitter => emitter.update());
    requestAnimationFrame(update);
    time++;
}
update();

function restart() {
    app.stage.removeChildren();
    code1 = document.getElementById('tb1').value;
    code2 = document.getElementById('tb2').value;
    time = 0;
    count = 0;
}

function copyToClipboard() {
    var updateEvent = document.getElementById('tb1').value;
    var initEvent = document.getElementById('tb2').value;
    var str = "Update event:\n" + updateEvent + "\n\nInit event:\n" + initEvent;
    
    navigator.clipboard.writeText(str).then(function() {
        console.log('Copying to clipboard was successful!');
    }, function(err) {
        console.error('Could not copy text: ', err);
    });
}