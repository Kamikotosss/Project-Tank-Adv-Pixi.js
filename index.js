import * as PIXI from "./pixi.min.mjs";
import {assetsMap} from "./assetsmap.js";
import { TankEnemy,Tank } from "./tank.js";
const app  = new PIXI.Application({ 
} );
document.body.appendChild(app.view);
function randomIntFromInterval(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
const start = () => {
    app.stage.position.set(app.view.width/2 , app.view.height/2 );
    app.stage.hitArea = app.renderer.screen ;
    app.stage.interactive =true;
    app.stage.hitArea.x = -app.view.width/2 ;
    app.stage.hitArea.y = -app.view.height/2 ;
    const bgTexture =  PIXI.Texture.from('./images/bg.png');
    const bgSprite = new PIXI.TilingSprite(bgTexture,800,800);
    bgSprite.tileScale.set(1.5,1.5);
    bgSprite.position.set(-app.view.width/2,-app.view.height/2);
    app.stage.addChild(bgSprite);
    const tank = new Tank(app.view.width,app.view.height);
    const tankEnemy = new TankEnemy(app.view.width,app.view.height,tank);
    const container = new PIXI.Container();
    
    const resourcesTextures = [
        PIXI.Texture.from('./images/ammo.png'),
        PIXI.Texture.from('./images/armor.png'),
        PIXI.Texture.from('./images/heal.png')

    ];
    const resourcesSprites = []; 
    tankEnemy.tint = 0.9691537756250204 * 0xFFFFFF;
    tankEnemy.position = {x:-200,y:200};
    tankEnemy.bot.rotation = 0;

    for (let i = 1 ; i < 31 ; i++){
        let resource = new PIXI.Sprite(resourcesTextures[i%3]);
        resource.scale.set(0.1,0.1);
        resource.position.set(randomIntFromInterval(-200* i , 200* i ),randomIntFromInterval(-200 * i, 200* i));
        resourcesSprites.push(resource);
        app.stage.addChild(resource); 
    } 

    app.stage.addChild(container);
    container.addChild(tankEnemy.view);
    
    container.addChild(tank.view);

    const movementPath= [{x:500 , y:200},{x:-300 , y:-130},{x:300 , y:50},{x:-400 , y:-100}];
   
    //container.removeChild(tankEnemy.view);
    
    app.ticker.add((e) => {
        if(tankEnemy.isActing === false && tankEnemy.isDestroyed === false){
            let m = movementPath.shift();
            movementPath.push(m);
            if(m) tankEnemy.move(m.x,m.y);
        }  
    });

        app.ticker.add((e) => {
            if(tankEnemy.isDestroyed === false){
                tankEnemy.trotate();
            } 
        });

    app.ticker.add((e) => {
        if(tankEnemy.isShooting === false){
        tankEnemy.shooting();
        }   
    });

    app.ticker.add((e) => {
        if(tank.isDestroyed === true){
            console.log("Game over");
        } 
    });

    app.ticker.start();
    app.stage.on('pointerdown', (e) => {    
       if(e.data.button === 0) tank.move(e.data.global.x , e.data.global.y ,  bgSprite,resourcesSprites,tankEnemy);
       if(e.data.button === 1) {
         tank.shooting(e.data.global.x , e.data.global.y);
       }
    });
    tankEnemy.hitBox.on('pointerdown', (e) => {  
        if(e.data.button === 1) {
            tankEnemy.setGotoAndPlay = 0; 
            tankEnemy.shootDamage.position.set(e.data.getLocalPosition(tankEnemy.view).x,e.data.getLocalPosition(tankEnemy.view).y) ;
            tankEnemy.shootDamageRotation = tank.gunRotation;
            tank.shooting(e.data.global.x , e.data.global.y,e.data.getLocalPosition(tankEnemy.view) , tankEnemy) ;
            tankEnemy.takeDamage();
          }
     });
    tank.view.on('pointermove', (e) => {
        tank.trotate (e.data.global.x , e.data.global.y);   
    });
}

assetsMap.sprites.forEach((value) => app.loader.add(value.name , value.url));
app.loader.load(start);
