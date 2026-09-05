const fs=require('fs');
const vm=require('vm');
function assert(ok,msg){if(!ok)throw new Error(msg)}

global.window=global;
global.document={
  readyState:'complete',
  body:null,
  head:null,
  getElementById(){return null},
  createElement(){return {id:'',textContent:'',classList:{add(){},remove(){}}}}
};
global.addEventListener=(type,fn)=>{if(type==='message')global.__messageHandler=fn};
global.state={selectedSkin:'top',best:{sotris:0},todayScore:0,coins:0};
global.currentSkin=()=>({id:state.selectedSkin,name:state.selectedSkin==='top'?'결의의 논개':'기본 오소',price:state.selectedSkin==='top'?3800:0});
let finishArgs=null;
global.finish=function(){finishArgs=Array.from(arguments);return 'ok'};
global.fantasyBattleCoinReward=()=>1000;
global.save=()=>{};

vm.runInThisContext(fs.readFileSync('play/character-performance-bonus.js','utf8'),{filename:'character-performance-bonus.js'});
const api=global.OsoCharacterPerformanceBonus;
assert(api,'API missing');
assert(api.bonusPercentForPrice(0)===0,'default tier');
assert(api.bonusPercentForPrice(750)===8,'750 tier');
assert(api.bonusPercentForPrice(2200)===15,'2200 tier');
assert(api.bonusPercentForPrice(3200)===22,'3200 tier');
assert(api.bonusPercentForPrice(3800)===25,'3800 tier');

finish('run',1000,()=>{},false,100);
assert(finishArgs&&finishArgs[1]===1250,'finish score bonus');
assert(finishArgs[4]===125,'finish coin bonus');
assert(fantasyBattleCoinReward({name:'보스',boss:true})===1250,'RPG battle coin bonus');

state.best.sotris=100;state.todayScore=100;state.coins=1000;
assert(typeof global.__messageHandler==='function','SP1 message hook missing');
global.__messageHandler({data:{source:'sotris-sp1',type:'RESULT',session:'test',attempt:1,score:100,clear:false}});
assert(state.best.sotris===125,'SP1 best bonus');
assert(state.todayScore===125,'SP1 daily score bonus');
assert(state.coins===1002,'SP1 coin bonus');

state.selectedSkin='default';
finishArgs=null;finish('run',1000,()=>{},false,100);
assert(finishArgs[1]===1000&&finishArgs[4]===100,'default no bonus');
console.log('CHARACTER_PERFORMANCE_BONUS_TEST=PASS');
