/* 논개 초필살기: 천상의 옥가락지 어택 대형 옥가락지 Canvas 이펙트
 * 별도 이미지 에셋을 사용하지 않는다.
 */
(function(){
  'use strict';
  if(window.__OSO_NONGAE_HEAVEN_JADE_FX__)return;
  window.__OSO_NONGAE_HEAVEN_JADE_FX__=true;
  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function easeOutCubic(t){return 1-Math.pow(1-t,3)}
  function draw(ctx,opt){
    if(!ctx||!opt)return;
    const W=Math.max(1,Number(opt.W)||1),H=Math.max(1,Number(opt.H)||1),ts=Number(opt.ts)||performance.now();
    const fx=opt.superFx||{},start=Number(fx.start)||ts,end=Math.max(start+1,Number(fx.end)||start+1900);
    const p=clamp((ts-start)/(end-start),0,1),e=easeOutCubic(clamp(p/0.72,0,1));
    const fade=clamp((1-p)/0.26,0,1),pulse=1+Math.sin(p*Math.PI*7)*0.035*(1-p);
    const min=Math.min(W,H),cx=W*.5,cy=H*.43;
    const r=(min*(.13+.31*e))*pulse,thick=min*(.068-.016*e);
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    ctx.lineCap='round';

    const aura=ctx.createRadialGradient(cx,cy,Math.max(1,r-thick*1.8),cx,cy,r+thick*2.2);
    aura.addColorStop(0,'rgba(60,255,199,0)');
    aura.addColorStop(.43,'rgba(62,255,204,0)');
    aura.addColorStop(.63,`rgba(70,255,211,${.18*fade})`);
    aura.addColorStop(.76,`rgba(137,255,226,${.32*fade})`);
    aura.addColorStop(1,'rgba(90,255,214,0)');
    ctx.fillStyle=aura;ctx.beginPath();ctx.arc(cx,cy,r+thick*2.25,0,TAU);ctx.fill();

    ctx.shadowColor='#66ffd2';ctx.shadowBlur=Math.max(22,min*.055);
    ctx.globalAlpha=.80*fade;ctx.lineWidth=thick*1.38;ctx.strokeStyle='#2ed9a4';ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
    ctx.globalAlpha=.96*fade;ctx.lineWidth=thick;ctx.strokeStyle='#72f6c8';ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
    ctx.shadowColor='#eafff7';ctx.shadowBlur=Math.max(12,min*.025);
    ctx.globalAlpha=.78*fade;ctx.lineWidth=Math.max(3,thick*.20);ctx.strokeStyle='#e9fff7';ctx.beginPath();ctx.arc(cx-thick*.08,cy-thick*.10,r-thick*.08,-2.85,-.10);ctx.stroke();
    ctx.globalAlpha=.46*fade;ctx.lineWidth=Math.max(2,thick*.12);ctx.strokeStyle='#0c9f78';ctx.beginPath();ctx.arc(cx+thick*.07,cy+thick*.10,r+thick*.08,.18,2.75);ctx.stroke();

    for(let i=0;i<16;i++){
      const a=i/16*TAU+p*1.4+(i%2?-.08:.08),rr=r+Math.sin(i*2.7+p*18)*thick*.30;
      const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
      const tw=.45+.55*Math.max(0,Math.sin(p*22+i*1.73));
      ctx.globalAlpha=fade*tw*.9;ctx.fillStyle=i%3===0?'#ffffff':'#baffea';ctx.shadowBlur=14;ctx.shadowColor='#78ffdb';
      ctx.beginPath();ctx.arc(x,y,2.5+tw*4.5,0,TAU);ctx.fill();
    }

    if(p<.52){
      const flash=1-p/.52;ctx.globalAlpha=.10*flash;ctx.fillStyle='#caffef';ctx.beginPath();ctx.arc(cx,cy,r*.64,0,TAU);ctx.fill();
    }
    ctx.restore();
  }
  window.OsoNongaeHeavenJadeFx={VERSION:'1.0.0',draw};
})();
