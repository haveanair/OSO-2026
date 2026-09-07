(()=>{
 'use strict';
 const STEP_WORLD=10000;
 const STEP_METERS=1000;
 const STEP_SPEED=50;
 function step(world){return Math.max(0,Math.floor((Number(world)||0)/STEP_WORLD))}
 function speed(world,level){
  const w=Math.max(0,Number(world)||0),lv=Math.max(1,Number(level)||1);
  const original=Math.min(455,205+w*.055+lv*18);
  return original+step(w)*STEP_SPEED
 }
 window.OsoRunDistanceSpeed=Object.freeze({speed,step,STEP_METERS,STEP_SPEED})
})();
