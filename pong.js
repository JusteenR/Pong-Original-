// Keep track of the rounds
var rounds = false;

// Vector class defaults to 0 0
function Vector(x, y){
  this.x = (x === null) ? 0 : x;
  this.y = (y === null) ? 0 : y;

  this.mag = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  this.norm = function(v){
    let m = this.mag();
      if (v > 0){
        const fact = m/v;
        this.x /= fact;
        this.y /= fact;

      }
  }
}

// Rectangle class
class Rect{

  constructor(width, height){
    this.pos = new Vector;
    this.size = new Vector(width, height);
  }

  //Getters
  get left(){
    return this.pos.x - this.size.x / 2;
  }

  get right(){
    return this.pos.x + this.size.x / 2;
  }

  get top(){
    return this.pos.y - this.size.y / 2;
  }

  get bottom(){
    return this.pos.y + this.size.y / 2;
  }

}

// The Ball
class Ball extends Rect{
  constructor(){
    super(10,10);
    this.r = this.size.x / 2;
    this.vel = new Vector;

    this.fill = function(ctx) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI*2);
        ctx.fill();
    }
  }

  horBoundaries(p1, p2){
    if (this.left < 0 || this.right > canvas.width){
      this.vel.x = - this.vel.x;
      if (this.vel.x > 0){
        p2.score++;
      } else {
        p1.score++;
      }
      rounds = true;

      //console.log(p2.score);
    }
  }

  verBoundaries(){
    if (this.top < 0 || this.bottom > canvas.height){
      this.vel.y = - this.vel.y;
    }
  }

}

class Player extends Rect {
  constructor(){
    super();
    this.size.x = 10;
    this.size.y = 80;
    this.score = 0;
  }
}


class Game {
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');

    // Two players
    this.p1 = new Player();
    this.p1.pos.x = 20;
    this.p1.pos.y = this.canvas.height/2;

    this.cpu = new Player();
    this.cpu.pos.x = this.canvas.width - 20;
    this.cpu.pos.y = this.canvas.height/2;

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

    // Make new Ball - use as basis for painting the ball
    this.ball = new Ball;
    this.ball.pos.x = this.canvas.width/2;
    this.ball.pos.y = this.canvas.height/2;


    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
    this.ctx.fillStyle = 'red';
    this.ball.fill(this.ctx);

    let time;

    let step = (timestamp) => {
      if (time){
        this.update((timestamp - time)/1000);
      }
      time = timestamp;
      window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);

  }


  speedUp(ball){
    if (ball.vel.y < 1200 && ball.vel.x < 1200){
      if (ball.vel.y > 0){
        ball.vel.y += 20 * Math.random();
      } else {
        ball.vel.y -= 20 * Math.random();
      }
      if (ball.vel.x > 0){
        ball.vel.x += 10;
      } else {
        ball.vel.x -= 10;
      }
    }
  }

  collision(){
    if (this.ball.left < this.p1.right && this.ball.bottom > this.p1.top && this.ball.top < this.p1.bottom){
      this.ball.vel.x = - this.ball.vel.x;
      this.speedUp(this.ball);

    }

    if (this.ball.right > this.cpu.left && this.ball.top > this.cpu.top && this.ball.bottom < this.cpu.bottom){
      this.ball.vel.x = - this.ball.vel.x;
      this.speedUp(this.ball);
    }
  }

  draw(){
    // Makes a rectangle and colors it black
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

    //Draw a ball
    this.ctx.fillStyle = '#fff';
    this.ball.fill(this.ctx);


    this.ctx.font = "4vw Comic Sans MS";
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.cpu.score.toString(), 3 * this.canvas.width/4, this.canvas.height/7);
    this.ctx.fillText(this.p1.score.toString(), this.canvas.width/4, this.canvas.height/7);


    this.ctx.fillRect(this.p1.left, this.p1.top, this.p1.size.x, this.p1.size.y);
    this.ctx.fillRect(this.cpu.left, this.cpu.top, this.cpu.size.x, this.cpu.size.y);
  }

  reset(){

    this.p1.pos.x = 20;
    this.p1.pos.y = this.canvas.height/2;

    this.cpu.pos.x = this.canvas.width - 20;
    this.cpu.pos.y = this.canvas.height/2;

    this.ball.pos.x = this.canvas.width/2;
    this.ball.pos.y = this.canvas.height/2;

    this.ball.vel.x = 0;
    this.ball.vel.y = 0;


  }

  getRandomArbitrary(min, max) {
    let dir = -1;
    if (Math.random() < 0.5){
      dir = 1;
    }
    return (Math.random() * (max - min) + min) * dir;
  }


  start(){
    if (this.ball.vel.x == 0 && this.ball.vel.y == 0){
      this.ball.vel.x = this.getRandomArbitrary(300,100);
      this.ball.vel.y = this.getRandomArbitrary(200,100);
      this.ball.vel.norm(200);
    }
  }

  update(dt){
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;

    // Redraws everything
    this.draw();

    rounds = false;

    this.ball.verBoundaries();
    this.ball.horBoundaries(this.p1, this.cpu);

    this.collision();


    if (rounds == true){
      this.reset();
    }

    // Make the cpu unbeatablek
    this.cpu.pos.y = this.ball.pos.y;

    // Make the player move with the mouse
    canvas.addEventListener('mousemove', event => {
      const scale = event.clientY / event.target.getBoundingClientRect().height;
      this.p1.pos.y = canvas.height*scale;});

    // Make the ball move
    canvas.addEventListener('click', event => {pong.start();});
  }


}


// Access canvas
const canvas = document.getElementById('backdrop');
const pong = new Game(canvas);
