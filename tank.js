import * as PIXI from "./pixi.min.mjs";
const createAnimatedSprite = (textureNames , position = {x:0,y:0},scale ={x: 0.5 , y:1} , anchor = {x:0.5 , y:0.5} ) => {
    const textures = textureNames.map(name => PIXI.Texture.from(name));

    const animetedSprite = new PIXI.AnimatedSprite(textures);
    animetedSprite.anchor.copyFrom(anchor);
    animetedSprite.position.copyFrom(position);
    animetedSprite.scale.copyFrom(scale);
    return animetedSprite;
}
const createSprite = (textureName , position = {x:0,y:0},scale ={x: 0.5 , y:0.5} , anchor = {x:0.5 , y:0.5} ) => {
    const texture = PIXI.Texture.from(textureName);
    const Sprite = new PIXI.Sprite(texture);
    Sprite.anchor.copyFrom(anchor);
    Sprite.position.copyFrom(position);
    Sprite.scale.copyFrom(scale);
    return Sprite;
}
const createRectangleGraphics = (x , y, width ,height,fillColor,lineColor,fillOpacity = 1,lineOpacity = 0) =>{
   const rectangle = new PIXI.Graphics();
    // Rectangle + line style 1
    rectangle.lineStyle(4, lineColor, lineOpacity)
    .beginFill(fillColor,fillOpacity)
    .drawRect(x, y, width, height)
    .endFill();
    return rectangle;
}
const clearAnimation = (animation) =>{
    if(animation!=false) {
        clearInterval(animation);
    }; 
    return false;
}
class HPBar{
    constructor( ){
        this._maxHealth =null;
        this._currentHealth =null;
        this._animationTimeout = null;
        this._x = -100;
        this._y = -100;
        this._width = 200;
        this._height = 30;
        this._barBorder = createRectangleGraphics(this._x,this._y ,this._width, this._height,0,0xFFFFFF,0,1);
        this._barCurrent = createRectangleGraphics(this._x,this._y ,this._width, this._height,0x097969,0);
        this._barDamaged = createRectangleGraphics(this._x,this._y ,this._width, this._height,0xE10600,0,1);
        this._damageBarAnimation = false ;
        this._visual = new PIXI.Container();
        this._visual.addChild(this._barDamaged,this._barCurrent,this._barBorder  );
    }
    setupMaxHealt(maxHealth){
        this._maxHealth = maxHealth;
        this._currentHealth = maxHealth;
    }
    update(){
        if (this._animationTimeout!=null) clearTimeout(this._animationTimeout) ;
        this._damageBarAnimation = clearAnimation(this._damageBarAnimation);
        const healtDifference  = this._currentHealth/this._maxHealth;
        let newWidth =this._width * healtDifference;
        let newColor = 0;
        if(healtDifference>= 1){
            newColor =0x097969;
        }
        else if(healtDifference >= 0.75 && healtDifference < 1){
            newColor =0x50C878;
        }
        else if(healtDifference >= 0.5 && healtDifference < 0.75){
            newColor =0xE4D00A;
        }
        else if(healtDifference >= 0.25 && healtDifference < 0.5){
            newColor =0xFFAF19 ;
        }
        else if(healtDifference > 0 && healtDifference < 0.25){
            newColor =0x800500;
        }
        else if(healtDifference <= 0){
            newWidth = 0;
        }
       const oldBarDamagedWidth = this._barDamaged.width;
       this._animationTimeout = setTimeout(() => {
            this._damageBarAnimation = setInterval(() =>{
                this._barDamaged.width -= 0.6 +(oldBarDamagedWidth-newWidth )/100;
                this._barDamaged.x -= 0.3 + (oldBarDamagedWidth-newWidth )/200;
                if(this._barDamaged.width <= newWidth){
                    this._damageBarAnimation = clearAnimation(this._damageBarAnimation);
                }
            },15) ;
        }, 200);
        this._barCurrent.clear().beginFill(newColor,1).drawRect(this._x,this._y ,newWidth, this._height).endFill();
        
       
        
    }
    get visual(){
        return this._visual;
    }
    get currentHealth(){
        return this._currentHealth;
    }
    set currentHealth(value){
        this._currentHealth = value;
    }
}
export class Tank {
    
    constructor(appX , appY){
        this._view = new PIXI.Container();
        this._view.scale.set (appX *appY/1000000);
        this._view.position.set (0,100);
        this._view.interactive = true;

        this._bot = new PIXI.Container();

        this._ltruk =createAnimatedSprite(["truk1","truk2"], {x:-100 , y:-30});
        this._rtruk =createAnimatedSprite(["truk1","truk2"], {x:100 , y:-30});

        this._ltruk.animationSpeed = 0.5;
        this._rtruk.animationSpeed = 0.5;

        this._gun =createSprite("gun", {x:0 , y:0},{x:0.5,y:0.5}, {x: 0.5, y:0.8});
        this._shoot=createAnimatedSprite(["shoot0","shoot1","shoot2","shoot3","shoot0"], {x:0 , y:-500} , {x:5 ,y:5});
        this._shoot.animationSpeed = 0.3;
        this._shoot.loop= false;
        this._gun.addChild (this._shoot) ;

        this._shootDamage=createAnimatedSprite(["shoot0","shootDamage1","shootDamage2","shoot0"], {x:0 , y:0} , {x:3 ,y:3});
        this._shootDamage.animationSpeed = 0.3;
        this._shootDamage.loop= false;
        this._shootDamage.tint = 0xF20000;

        this._explosion = createAnimatedSprite(["shoot0","explosion1","explosion2","explosion3","explosion4","explosion5","explosion6",
        "explosion7","explosion8","shoot0"], {x:0 , y:0} , {x:6 ,y:6});
        this._explosion.animationSpeed = 0.3;
        this._explosion.loop= false;

        this._bottom =createSprite("bottom");
        const hitBoxPath = [  
            120, 120, 
            65, 120,
            65, 100,
            -65, 100,
            -65, 120,
            -120, 120,
            -120, -150, 
            -65, -150,
            -65, -115,
            65, -115,
            65, -150,
            120, -150,
            ];

        this._bot.interactive =true;
        this._bot.hitArea = new PIXI.Polygon(hitBoxPath);
        
        this._health = new HPBar();
        this._health.setupMaxHealt(5);
        this._bot.addChild (this._ltruk,this._rtruk,this._bottom ) 

        this._view.addChild(this._bot,this._gun ,this._health.visual,this._shootDamage,this._explosion);  
        this._rotSpeed = 0.02 ;
        this._movSpeed = 2 ;

        this.isDestroyed = false ;
        this._isTakingDamage = false;
        this._isShooting = false;
        this._isDamaging = false;
        this._isRotating = false ;
        this._isMoving = false ;
    }
    animate () {
        this._ltruk.play();
        this._rtruk.play();
    }
    stop () {
        this._ltruk.stop();
        this._rtruk.stop();
    }
    shooting (x,y) {
       
        let movementData = this.calculateMovementData(x,y);
        this._shoot.gotoAndPlay(0); 
        this._isShooting = clearAnimation(this._isShooting);
        this._isDamaging = clearAnimation(this._isDamaging);
        let gunReaction = 0;
        this._isShooting = setInterval(() =>{
            gunReaction += Math.PI/4;
            this.gun.position.x -= Math.sin(movementData.rotationPath + this.bot.rotation)*2*Math.sin(gunReaction);
            this.gun.position.y += Math.cos(movementData.rotationPath+ this.bot.rotation)*2*Math.sin(gunReaction);
            if(gunReaction >= 2*Math.PI) {
                this._isShooting = clearAnimation(this._isShooting);
                
            }
        },10) ;
        
    }
    takeDamage () {
        this._isTakingDamage = clearAnimation(this._isTakingDamage);
        let damageTint = 0;
        this._health.currentHealth -= 1;
        if(this._health.currentHealth >= 0) this._health.update();
       
        if(this._health.currentHealth <= 0 && this.isDestroyed == false){

            this.isDestroyed = true;
            this._explosion.gotoAndPlay(0);
            this._isTakingDamage = clearAnimation(this._isTakingDamage);
            this._isMoving = clearAnimation(this._isMoving);
            this._isRotating = clearAnimation(this._isRotating);
            this._isShooting =  clearAnimation(this._isShooting );
            
            this.stop();
            this._gun.tint = 0  ;
            this._bottom.tint = 0  ;    
       
        }
        else if (this.isDestroyed == false){
            let resetTint = this._gun.tint;
            this._isTakingDamage  = setInterval(() =>{
                damageTint += Math.PI/4;
                this._gun.tint = 0xF20000 *Math.sin(damageTint +Math.PI/4) ;
                this._bottom.tint = 0xF20000 *Math.sin(damageTint+Math.PI/4);    
                if(damageTint >= Math.PI) {
                    this._gun.tint = resetTint ;
                    this._bottom.tint = resetTint;   
                    this._isTakingDamage  = clearAnimation(this._isTakingDamage );
                  }
            },20) ;
        }
        
        
    }
    stopShooting () {
        this._shoot.stop();
    }
    calculateMovementData = (x,y,
    deltax1 = x- this._bot.getGlobalPosition().x,
    deltay1 = y- this._bot.getGlobalPosition().y,
    deltax2 = this._bot.getGlobalPosition().x*Math.cos(this._bot.rotation-Math.PI/2), 
    deltay2 =this._bot.getGlobalPosition().y*Math.sin(this._bot.rotation-Math.PI/2) ) =>{

        const hypot1 = Math.hypot(deltax1, deltay1);
        const hypot2 = Math.hypot(deltax2, deltay2);
        let rotationPath =  Math.acos((deltay1*deltay2 + deltax1*deltax2) /hypot1 /  hypot2);
        let delta_pos_rot = deltax1 - Math.cos(this._bot.rotation + rotationPath-Math.PI/2)*hypot1;
        let delta_neg_rot = deltax1 - Math.cos(this._bot.rotation - rotationPath-Math.PI/2)*hypot1;
        (Math.abs(delta_pos_rot) <  Math.abs(delta_neg_rot))  ? rotationPath = rotationPath : rotationPath = - rotationPath  ; 
        if (Math.abs(rotationPath) < 0.02 ) rotationPath = 0 ; 
  
        return {rotationPath:rotationPath, deltax : deltax1 , deltax2 : deltax2 , deltay : deltay1, hypot :hypot1};

    }

    move (x,y,bgSprite,resourcesSprites,tankEnemy) {
        this._isRotating = clearAnimation(this._isRotating);
        this._isMoving = clearAnimation(this._isMoving);
        let movementData = this.calculateMovementData(x,y);
        let count = 0;

        this.animate ();
        this._isRotating = setInterval(() =>{
            this._bot.rotation +=  Math.sign(movementData.rotationPath)*this._rotSpeed;
            count ++;
            if(count >  Math.abs(movementData.rotationPath)/this._rotSpeed) {
                count = 0;
                 clearAnimation(this._isRotating);
                this._isMoving = setInterval(() =>{
                    bgSprite.tilePosition.x -=this._movSpeed*movementData.deltax/ movementData.hypot;
                    bgSprite.tilePosition.y -=this._movSpeed*movementData.deltay/ movementData.hypot;
                    tankEnemy.position = {x: this._movSpeed*movementData.deltax/ movementData.hypot,y:this._movSpeed*movementData.deltay/ movementData.hypot};
                    for (let r = 0 ; r < resourcesSprites.length ; r++){
                        resourcesSprites[r].position.x -= this._movSpeed*movementData.deltax/ movementData.hypot;
                        resourcesSprites[r].position.y -= this._movSpeed*movementData.deltay/ movementData.hypot;
                    } 
                   
                    // this._view.position.x +=  movSpeed*movementData.deltax/ movementData.hypot;
                    // this._view.position.y +=  movSpeed*movementData.deltay/ movementData.hypot;
                    count ++;
                    if(count > movementData.hypot/this._movSpeed) {
                        clearAnimation(this._isMoving);

                        this.stop();
                    }
                },10)
            }
        },10)
    }
    trotate (x,y) {
        const deltax1 = x- this._gun.getGlobalPosition().x;
        const deltay1 = y- this._gun.getGlobalPosition().y;
        const deltax2 = 0;
        const deltay2 = 10;
        const hypot1 = Math.hypot(deltax1, deltay1);
        const hypot2 = Math.hypot(deltax2, deltay2);
        let q =(deltax1 < 0) ? -1 : 1;
        this._gun.rotation = q * Math.acos(-deltay1*deltay2  /hypot1 /  hypot2) ;
    }

    get view(){
        return this._view;
    }
    get bot(){
        return this._bot;
    }
    get gun(){
        return this._gun;
    }
    get gunRotation(){
        return this._gun.rotation;
    }
    get position(){
        return {x:this._view.position.x,y:this._view.position.y};
    }
    get shoot(){
        return this._shoot;
    }
    get shootDamage (){
        return this._shootDamage;
    }
    get health (){
        return this._health;
    }
    get isActing(){
        return this._isMoving || this._isRotating;
    }
    get isShooting(){
        return this._isShooting;
    }
    get isMoving(){
        return this._isMoving ;
    }
    get isRotating(){
        return  this._isRotating;
    }
    get hitBox(){
        return this._bot;
    }
    set shootDamagePosition(position){
        this._shootDamage.position.set(position.x , position.y);
    }
    set shootDamageRotation(rotation){
        this._shootDamage.rotation = rotation;
    }
    set setGotoAndPlay(frame){
        this._shootDamage.gotoAndPlay(frame);
    }
    set position(position){
        this._view.position.x -= position.x;
        this._view.position.y -= position.y;
    }
    set tint(tint){
        this._gun.tint = tint;
        this._bottom.tint = tint;
    }
    set currentFrame(currentFrame){
        this._shoot.currentFrame = currentFrame;
        
    }
    set changeHealth(damage){
        this._health -= damage;
        
    }
}

export class TankEnemy extends Tank{
    constructor(appX , appY,ally_tank){  
        super(appX , appY);
        this.ally_tank =  ally_tank;
        this._health.setupMaxHealt(20);
        this._shoot.tint = 0xF20000;
        this._shootDamage.tint = 16777215;

       
    }
    shooting () {
        if(this.isDestroyed === true){
            this._isShooting = "destoyed";
            return;
        }
        let deltax =this.ally_tank.position.x - this.view.position.x;
        let deltay =this.ally_tank.position.y - this.view.position.y;
        let movementData = this.calculateMovementData(deltax,deltay);
        this._isDamaging = true;
        this._shoot.gotoAndPlay(0);
        let gunReaction = 0;
        if((deltax < 350 && deltax > -350) && (deltay <350 && deltay > -150) ){
            this._isShooting = setInterval(() =>{
            gunReaction += Math.PI/4;
            this.gun.position.x -= Math.sin(movementData.rotationPath + this.bot.rotation)*2*Math.sin(gunReaction);
            this.gun.position.y += Math.cos(movementData.rotationPath+ this.bot.rotation)*2*Math.sin(gunReaction);
            if(gunReaction >= 2*Math.PI) {
                this._isShooting = clearAnimation(this._isShooting);
                this._isShooting = true;
                this._isDamaging = false;
                setTimeout(() => {this._isShooting = false}, 5000);
               
            }
        },10) ;
        this.ally_tank.setGotoAndPlay = 0; 
        this.ally_tank.shootDamage.position.set(this.ally_tank.view.position.x -50 ,this.ally_tank.view.position.y -50 ) ;
        this.ally_tank.shootDamageRotation = this.gunRotation;
        this.ally_tank.takeDamage();   
            //this.ally_tank
        }
        
    }
    trotate () {
    let x = this.ally_tank.bot.getGlobalPosition().x;
    let y =this.ally_tank.bot.getGlobalPosition().y;
    let deltax1 = x- this._bot.getGlobalPosition().x;
    let deltay1 = y- this._bot.getGlobalPosition().y;
    let deltax2 = 0;
    let deltay2 =-1;
        const hypot1 = Math.hypot(deltax1, deltay1);
        const hypot2 = Math.hypot(deltax2, deltay2);
        let rotationPath =  Math.acos((deltay1*deltay2 + deltax1*deltax2) /hypot1 /  hypot2);
        let delta_pos_rot = deltax1 - Math.cos(0 + rotationPath-Math.PI/2)*hypot1;
        let delta_neg_rot = deltax1 - Math.cos(0 - rotationPath-Math.PI/2)*hypot1;
        (Math.abs(delta_pos_rot) <  Math.abs(delta_neg_rot))  ? rotationPath = rotationPath : rotationPath = - rotationPath  ;       
        this._gun.rotation =  rotationPath;
    }
    move (x,y) {
        this._isRotating = clearAnimation(this._isRotating);
        this._isMoving = clearAnimation(this._isMoving);
        let movementData = this.calculateMovementData(x,y,x,y,Math.cos(this._bot.rotation-Math.PI/2), 
        Math.sin(this._bot.rotation-Math.PI/2) );
        
        let count = 0;
        this.animate ();
        this._isRotating = setInterval(() =>{
            this._bot.rotation +=  Math.sign(movementData.rotationPath)*this._rotSpeed;
            count ++;
            if(count >  Math.abs(movementData.rotationPath)/this._rotSpeed) {
                count = 0;
                this._isRotating = clearAnimation(this._isRotating);
                this._isMoving = setInterval(() =>{
                    this.view.position.x +=this._movSpeed*movementData.deltax/ movementData.hypot;
                    this.view.position.y +=this._movSpeed*movementData.deltay/ movementData.hypot;
                   
                    // this._view.position.x +=  movSpeed*movementData.deltax/ movementData.hypot;
                    // this._view.position.y +=  movSpeed*movementData.deltay/ movementData.hypot;
                    count ++;
                    if(count > movementData.hypot/this._movSpeed) {
                        this._isMoving = clearAnimation(this._isMoving);
                        this.stop();
                        
                    }
                },10)
            }
        },10)
    }
}