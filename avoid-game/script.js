"use strict";
const canvas = document.getElementById("main");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const MESH = 36;
const TILE_SIZE = (WIDTH - MESH * 2) / 36;
const ENEMY_SIZE = 6;
const SPAWN_RATE = 6;
const MAX_SPEED = 3;
const color = ["white", "red", "yellow", "green", "blue", "black", "purple", "lime", "gold"];
const POTION = 7;
const POINT = 8;

let boss_flag = false;
let boss_count = ENEMY_SIZE;

let rain = [];
let player;

let is_pressed_key = new Uint8Array(100);

let life = 5;
let score = 1;
let time_count = 0;

class Tile{
    constructor(x, y, id){
        this.x = x;
        this.y = y;
        this.color_id = id;
    }
    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = color[this.color_id];
        ctx.fill();
        ctx.closePath();
    }
}

class Character extends Tile{
    constructor(x, y, id, dx, dy){
        super(x, y, id);
        this.dx = dx;
        this.dy = dy;
    }
    tick(){
        this.x += this.dx;
        this.y += this.dy;
    }
}

class Player extends Character{
    constructor(x, y){
        super(x, y, 0, 0, 0);
    }
    tick(){
        super.tick();
        if(this.x < MESH * 3) this.x = MESH * 3;
        if(this.x + TILE_SIZE > WIDTH - MESH * 3) this.x = WIDTH - MESH * 3 - TILE_SIZE;
        if(this.y < MESH * 3) this.y = MESH * 3;
        if(this.y + TILE_SIZE > HEIGHT - MESH * 3) this.y = HEIGHT - MESH * 3 - TILE_SIZE;
    }
    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "#f37f44";
        ctx.fill();
        ctx.closePath();
    }
}

class Enemy extends Character{
    constructor(id){
        let rx = Math.floor(Math.random()*(WIDTH - MESH * 4)) + MESH * 2;
        let ry = Math.floor(Math.random()*(HEIGHT - MESH * 4)) + MESH * 2;
        super(rx, ry, id, 1, 1);
        this.bullet = [];
    }
    tick(){
        super.tick();
        if(this.x + TILE_SIZE > WIDTH - MESH || this.x < MESH) this.dx *= -1;
        if(this.y + TILE_SIZE > HEIGHT - MESH || this.y < MESH) this.dy *= -1;
        if(this.x < MESH) this.x = MESH;
        if(this.x + TILE_SIZE > WIDTH - MESH) this.x = WIDTH - MESH - TILE_SIZE;
        if(this.y < MESH) this.y = MESH;
        if(this.y + TILE_SIZE > HEIGHT - MESH) this.y = HEIGHT - MESH - TILE_SIZE;

        this.dx += 0.001 * Math.sign(this.dx);
        this.dy += 0.001 * Math.sign(this.dy);
        if(this.dx >= (MAX_SPEED - (boss_flag * MAX_SPEED / 2))) this.dx = (MAX_SPEED - (boss_flag * MAX_SPEED / 2));
        if(this.dy >= (MAX_SPEED - (boss_flag * MAX_SPEED / 2))) this.dy = (MAX_SPEED - (boss_flag * MAX_SPEED / 2));

        for(let i = 0; i < this.bullet.length; i++){
            this.bullet[i].tick();
        }
    }
}

class Item extends Character{
    constructor(id, dx, dy){
        let rx = Math.floor(Math.random()*(WIDTH - MESH * 4)) + MESH * 2;
        let ry = Math.floor(Math.random()*(HEIGHT - MESH * 4)) + MESH * 2;
        super(rx, ry, id, dx, dy);
    }
    tick(){
        super.tick();
        if(this.x + TILE_SIZE > WIDTH - MESH * 3 || this.x < MESH * 3) this.dx *= -1;
        if(this.y + TILE_SIZE > HEIGHT - MESH * 3 || this.y < MESH * 3) this.dy *= -1;
        if(this.x < MESH * 3) this.x = MESH * 3;
        if(this.x + TILE_SIZE > WIDTH - MESH * 3) this.x = WIDTH - MESH * 3 - TILE_SIZE;
        if(this.y < MESH * 3) this.y = MESH * 3;
        if(this.y + TILE_SIZE > HEIGHT - MESH * 3) this.y = HEIGHT - MESH * 3 - TILE_SIZE;
    }
}

class Bullet extends Character{
    constructor(enemy, dx, dy){
        super(enemy.x, enemy.y, enemy.color_id, dx, dy);
        this.is_enabled = true;
    }
    tick(){
        super.tick();
        if(this.x < MESH || this.y < MESH || this.x + TILE_SIZE > WIDTH - MESH || this.y + TILE_SIZE > HEIGHT - MESH){
            this.is_enabled = false;
        }
    }
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, TILE_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = color[this.color_id];
        ctx.fill();
        ctx.closePath();
    }
}

function init(){
    for(let i = 0; i < ENEMY_SIZE; i++){
        rain[i] = new Enemy(i);
    }
    player = new Player(WIDTH / 2, HEIGHT / 2);
    setInterval(tick, 10);
}

const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
  
function tick(){
    drawAll();
    if(life <= 0) return;
    if(score >= 100) boss_flag = true;
    if(score / rain.length > SPAWN_RATE && !boss_flag){
        rain.push(new Enemy(6));
    }
    if(score % 10 == 0){
        score++;
        rain.push(new Item(POTION, -0.1, -0.1));
    }
    for(let i = 0; i < rain.length; i++){
        if(rain[i].color_id < 6){
            if(boss_flag && time_count % Math.floor(1000 /((ENEMY_SIZE - boss_count + 1) * (boss_count == 1 ? 2 : 1))) == 0){
                for(let j = 0; j < (SPAWN_RATE * 3); j++){
                    rain[i].bullet.push(new Bullet(rain[i], Math.cos(Math.floor(Math.PI * 2 / SPAWN_RATE) * j), Math.sin(Math.floor(Math.PI * 2 / SPAWN_RATE) * j)));
                }
            }
            for(let j = 0; j < rain[i].bullet.length; j++){
                if(!rain[i].bullet[j].is_enabled){
                    rain[i].bullet.splice(j, 1);
                }else if(isInRect(rain[i].bullet[j].x, rain[i].bullet[j].y)){
                    life--;
                    score -= SPAWN_RATE;
                    if(life < 0) life = 0;
                    if(score < 0) score = 0;
                    rain[i].bullet.splice(j, 1);
                }
            }
        }
        if(boss_flag && rain[i].color_id == 6){
            rain.splice(i, 1);
            continue;
        }
        rain[i].tick();
        if(isInRect(rain[i].x, rain[i].y)){
            rain[i].dx = Math.sign(rain[i].dx);
            rain[i].dy = Math.sign(rain[i].dy);
            if(rain[i].color_id == POTION){
                life += 3;
            }else if(rain[i].color_id == POINT){
                score += 10;
            }else{
                if(rain[i].color_id < 6){
                    life -= 2;
                    if(boss_count > 0){
                        if(score > (150 + (ENEMY_SIZE - boss_count) * 100)){
                            score += 50;
                            boss_count--;
                            if(boss_count < 0) boss_count = 0;
                        }else{
                            rain.push(new Enemy(rain[i].color_id));
                        }
                    }
                }
                life--;
                score -= SPAWN_RATE;
                if(life < 0) life = 0;
                if(score < 0) score = 0;
            }
            if(boss_count > 0) rain.splice(i, 1);
        }
    }
    player.dx = (is_pressed_key[39] - is_pressed_key[37]) * 2;
    player.dy = (is_pressed_key[40] - is_pressed_key[38]) * 2;
    player.tick();

    if(time_count++ % 100 == 0){
        if(time_count >= 10000) time_count = 0;
        score++;
    }
}

function drawCanvas(){
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#ddd";
    ctx.fillRect(MESH, MESH, WIDTH - MESH * 2, HEIGHT - MESH * 2);
    ctx.rect(MESH * 3, MESH * 3, WIDTH - MESH * 6, HEIGHT - MESH * 6);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#f37f44";
    ctx.stroke();
}

function drawtext(){
    ctx.font = "32px monospace";
    ctx.fillStyle = "#000000";
    if(boss_flag && (score > (150 + (ENEMY_SIZE - boss_count) * 100) && life > 3)){
        ctx.fillText("Hit Enemy!", WIDTH / 2 - MESH * 3, HEIGHT - MESH / 6);
    }else if(life > 5 && score > 50){
        ctx.fillText("Press Space!", WIDTH / 2 - MESH * 3, HEIGHT - MESH / 6);
    }else{
        ctx.fillText("Cartahena Avoid Game", WIDTH / 2 - MESH * 5, HEIGHT - MESH / 6);
    }
    ctx.fillText("SCORE:" + score, MESH, HEIGHT);
    ctx.fillText("LIFE:" + life, WIDTH - MESH * 5, HEIGHT);
    if(life <= 0){
        ctx.fillText("GAME OVER", WIDTH / 2 - MESH * 3, HEIGHT / 2);
    }
    ctx.fillText("Player:", MESH, MESH * 0.8);
    ctx.fillText("Potion:", MESH * 6, MESH * 0.8);
    ctx.fillText("Point:", MESH * 12, MESH * 0.8);
    ctx.fillStyle = "#f37f44";
    ctx.fillRect(MESH * 4, TILE_SIZE / 3, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "lime";
    ctx.fillRect(MESH * 9, TILE_SIZE / 3, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "gold";
    ctx.fillRect(MESH * 14.5, TILE_SIZE / 3, TILE_SIZE, TILE_SIZE);
}

function drawAll(){
    drawCanvas();
    for(let i = 0; i < rain.length; i++){
        rain[i].draw();
        if(rain[i].color_id < 6){
            for(let j = 0; j < rain[i].bullet.length; j++){
                rain[i].bullet[j].draw();
            }
        }
    }
    player.draw();
    drawtext();
}

function isInRect(x, y){
    return (x < player.x && player.x < x + TILE_SIZE && y < player.y && player.y < y + TILE_SIZE);
}

function play(){
}

window.onload = function(){
    init();
    play();
}

window.onkeydown = function(ev){
    is_pressed_key[ev.keyCode] = 1;
}

window.onkeyup = function(ev){
    if(is_pressed_key[32] && life > 5 && score > 50){
        life -= 5;
        for(let i = 0; i < SPAWN_RATE; i++){
            let rx = Math.floor(Math.random() * 2) ? -1 : 1;
            let ry = Math.floor(Math.random() * 2) ? -1 : 1;
            rain.push(new Item(POINT, rx, ry));
        }
    }
    is_pressed_key[ev.keyCode] = 0;
}