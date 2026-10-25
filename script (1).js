(function(){
'use strict';
document.documentElement.classList.add('booted');
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))},lerp=function(a,b,t){return a+(b-a)*t},TAU=Math.PI*2;
function mk(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e}

/* ---------- Your gym's details: edit these ---------- */
var GYM={name:'Forgehouse',tel:'+919999999999',phone:'+91 99999 99999',wa:'919999999999',email:'hello@forgehouse.example',
  address:'12 Iron Street, Your Area, Your City',hours:'Mon to Sat: 5:00 AM to 11:00 PM. Sun: 7:00 AM to 8:00 PM.',
  instagram:'https://www.instagram.com/',notice:'New Zumba batch starts Monday.'};
var ACC={violet:[.486,.302,1],red:[.9,.2,.18],green:[.12,.84,.37],orange:[1,.42,.1]};
var S={mx:.5,my:.5,mv:0,y:0,vel:0,vh:innerHeight,theme:'dark',acc:'violet',light:0,pointerOn:false};
var themeL=[],bg=null,objs=null;
function onTheme(f){themeL.push(f)}

/* ---------- shared frame loop ---------- */
var loops=[],lastT=0;
function addLoop(f){loops.push(f)}
function frame(now){var dt=Math.min(.05,(now-lastT)/1000||.016);lastT=now;if(!document.hidden){for(var i=0;i<loops.length;i++){try{loops[i](now/1000,dt)}catch(e){}}}requestAnimationFrame(frame)}
requestAnimationFrame(frame);

/* ---------- toast + helpers ---------- */
var toastEl=$('#toast'),toastT=0;
function toast(m){toastEl.textContent=m;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('show')},3200)}
function buzz(n){if(navigator.vibrate&&!reduce.matches){try{navigator.vibrate(n||12)}catch(e){}}}
function waLink(t){return 'https://wa.me/'+GYM.wa+'?text='+encodeURIComponent(t)}
function openUrl(u){var a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}

/* ---------- bind settings into the page ---------- */
$$('[data-bind]').forEach(function(e){var k=e.getAttribute('data-bind');if(GYM[k])e.textContent=GYM[k]});
$$('[data-href]').forEach(function(a){var k=a.getAttribute('data-href');
  a.href=k==='tel'?'tel:'+GYM.tel:k==='mail'?'mailto:'+GYM.email:k==='wa'?waLink('Hi '+GYM.name+', I have a question.'):k==='ig'?GYM.instagram:'#'});
$('#annTxt').firstChild.textContent=GYM.notice+' ';
var mapF=$('#mapF'),mapA=$('#mapA'),q=encodeURIComponent(GYM.address);
mapF.src='https://maps.google.com/maps?q='+q+'&output=embed';mapA.href='https://www.google.com/maps/search/?api=1&query='+q;

/* ---------- liquid segmented control ---------- */
var pills=[];
function makePill(seg,sel,isOn){
  var pill=$('.seg__pill',seg),last=-1;
  function place(){
    var bs=$$(sel,seg),b=bs.filter(isOn)[0];if(!b||!pill)return;
    var s=seg.getBoundingClientRect(),r=b.getBoundingClientRect();if(!s.width)return;
    var i=bs.indexOf(b);pill.classList.toggle('rev',i<last);last=i;
    pill.style.left=(r.left-s.left-seg.clientLeft+seg.scrollLeft)+'px';pill.style.right=(s.right-r.right-seg.clientLeft-seg.scrollLeft)+'px';
    pill.style.top=(r.top-s.top-seg.clientTop)+'px';pill.style.height=r.height+'px';
  }
  pills.push(place);return place;
}
function placePills(){pills.forEach(function(p){p()})}
addEventListener('resize',placePills);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(placePills);

/* ---------- theme + accent ---------- */
var themeSeg=$('#themeSeg'),placeTheme=makePill(themeSeg,'button',function(b){return b.getAttribute('data-t')===S.theme});
function setTheme(t,save){S.theme=t;root.setAttribute('data-theme',t);$$('button',themeSeg).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-t')===t)});
  var m=$('meta[name=theme-color]');if(m)m.setAttribute('content',t==='dark'?'#0A0A0A':'#F2F2F2');if(save){try{localStorage.setItem('fh_theme',t)}catch(e){}}placeTheme();themeL.forEach(function(f){f()})}
$$('button',themeSeg).forEach(function(b){b.addEventListener('click',function(){setTheme(b.getAttribute('data-t'),true)})});
var accSw=$('#accSw');
Object.keys(ACC).forEach(function(k){var sw={violet:'#7C4DFF',red:'#E5322D',green:'#1FD65F',orange:'#FF6A1A'}[k];
  var b=mk('button');b.type='button';b.style.background=sw;b.setAttribute('aria-label',k+' accent');b.setAttribute('data-k',k);b.setAttribute('aria-pressed','false');
  b.addEventListener('click',function(){setAcc(k,true)});accSw.appendChild(b)});
function setAcc(k,save){S.acc=k;root.setAttribute('data-accent',k);$$('button',accSw).forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-k')===k?'true':'false')});
  if(save){try{localStorage.setItem('fh_acc',k)}catch(e){}}themeL.forEach(function(f){f()})}
try{setTheme(localStorage.getItem('fh_theme')||'dark');setAcc(localStorage.getItem('fh_acc')||'violet')}catch(e){setTheme('dark');setAcc('violet')}

/* ---------- popovers ---------- */
function popToggle(btn,pop){btn.addEventListener('click',function(e){e.stopPropagation();var o=!pop.classList.contains('open');$$('.pop.open').forEach(function(p){p.classList.remove('open')});pop.classList.toggle('open',o);btn.setAttribute('aria-expanded',o?'true':'false');if(btn.id==='bellBtn')$('#bellDot').style.display='none'})}
popToggle($('#bellBtn'),$('#bellPop'));popToggle($('#styleBtn'),$('#stylePop'));
document.addEventListener('click',function(e){if(!e.target.closest('.pop'))$$('.pop.open').forEach(function(p){p.classList.remove('open')})});
var NOTES=[GYM.notice+' Book a spot from the schedule.','Free trial sessions are open this week. Tap Book a Free Trial.','Members: check the schedule for updated class times.'];
NOTES.forEach(function(n){$('#notes').appendChild(mk('li','',n))});

/* ---------- announcement bar + nav + menu ---------- */
var ann=$('#ann'),nav=$('#nav');
if(sessionStorage.getItem('fh_ann')==='1'){ann.hidden=true}else{nav.classList.add('has-ann')}
$('#annX').addEventListener('click',function(){ann.hidden=true;nav.classList.remove('has-ann');try{sessionStorage.setItem('fh_ann','1')}catch(e){}});
var burger=$('#burger'),menu=$('#menu');
function setMenu(o){menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o?'true':'false');burger.setAttribute('aria-label',o?'Close menu':'Open menu');menu.setAttribute('aria-hidden',o?'false':'true');root.classList.toggle('no-scroll',o)}
burger.addEventListener('click',function(){setMenu(!menu.classList.contains('open'))});
$$('a,button',menu).forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
addEventListener('resize',function(){S.vh=innerHeight;if(innerWidth>=1180)setMenu(false)});
var navLinks=$$('.nav__links a');
if('IntersectionObserver' in window){var so=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)navLinks.forEach(function(a){a.classList.toggle('is-active',a.getAttribute('href')==='#'+en.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
  ['about','facilities','trainers','plans','classes','workouts','contact'].forEach(function(id){var s=document.getElementById(id);if(s)so.observe(s)})}

/* ---------- loader: plates go on as it fills, then a liquid curtain lifts ---------- */
var pre=$('#pre'),preBar=$('#preBar'),preNum=$('#preNum'),wipePath=$('#wipePath'),plates=[],loaded=false,t0=performance.now(),finished=false;
for(var i=0;i<6;i++){[-1,1].forEach(function(s){var p=mk('span','pre__pl');var off=26+i*20;p.style.height=(i<4?92:i===4?70:54)+'px';p.style[s<0?'right':'left']='calc(50% + '+off+'px)';preBar.appendChild(p);plates.push([p,(i+1)/6*100-4])})}
addEventListener('load',function(){loaded=true});
var DUR=reduce.matches?350:2300;
function loadTick(now){
  if(finished)return;var k=clamp((now-t0)/DUR,0,1),pct=Math.round(100*(1-Math.pow(1-k,2.2)));if(!loaded&&pct>94)pct=94;
  preNum.textContent=pct;plates.forEach(function(p){p[0].classList.toggle('on',pct>=p[1])});
  if(pct>=100||(now-t0>6500)){finish();return}requestAnimationFrame(loadTick)}
function finish(){
  if(finished)return;finished=true;preNum.textContent='100';plates.forEach(function(p){p[0].classList.add('on')});
  var w0=performance.now(),dur=reduce.matches?10:1150,shown=false;
  setTimeout(function(){pre.classList.add('is-done')},180);
  (function f(now){var k=clamp((now-w0)/dur,0,1),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2,Y=100*(1-e)*1.12,amp=16*Math.sin(Math.PI*k),d='M0,0 L100,0',x;
    for(x=100;x>=0;x-=5){d+=' L'+x+','+Math.max(0,Y+amp*Math.sin(x*.1+k*9)).toFixed(1)}wipePath.setAttribute('d',d+' Z');
    if(k>.3&&!shown){shown=true;root.classList.add('ready');if(bg)bg.on()}
    if(k<1)requestAnimationFrame(f);else{wipePath.setAttribute('d','M0,0 L0,0 Z');pre.style.display='none'}})(performance.now());
}
requestAnimationFrame(loadTick);
setTimeout(function(){if(!finished){finished=true;pre.style.display='none';$('#wipe').style.display='none';root.classList.add('ready')}},9000);
setTimeout(function(){root.classList.add('ready')},12000);

/* ---------- pointer + touch effects ---------- */
var glow=$('#blob'),mx=0,my=0,bx=0,by=0,blobOn=false;
if(fine.matches){
  addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;mx=e.clientX;my=e.clientY;S.mx=mx/innerWidth;S.my=1-my/innerHeight;S.pointerOn=true;if(!blobOn){blobOn=true;bx=mx;by=my;glow.classList.add('on')}},{passive:true});
  document.addEventListener('pointerleave',function(){glow.classList.remove('on');blobOn=false});
  document.addEventListener('pointerover',function(e){glow.classList.toggle('big',!!(e.target.closest&&e.target.closest('a,button,.fac,.trn,.plan,.g,.flip')))});
  addLoop(function(){if(!blobOn)return;var dx=mx-bx,dy=my-by;bx+=dx*.2;by+=dy*.2;var v=Math.min(Math.hypot(dx,dy),40);S.mv=lerp(S.mv,v/40,.2);
    glow.style.transform='translate('+bx.toFixed(1)+'px,'+by.toFixed(1)+'px) rotate('+(Math.atan2(dy,dx)*57.3).toFixed(0)+'deg) scale('+(1+v*.035).toFixed(2)+','+(1-v*.012).toFixed(2)+')'});
  $$('.glass').forEach(function(el){el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true})});
}
function tiltify(el){if(!fine.matches||reduce.matches)return;el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--try',(px*9).toFixed(2)+'deg');el.style.setProperty('--trx',(-py*9).toFixed(2)+'deg')},{passive:true});el.addEventListener('pointerleave',function(){el.style.setProperty('--try','0deg');el.style.setProperty('--trx','0deg')})}
function magnet(el){if(!fine.matches||reduce.matches)return;el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.transform='translate('+((e.clientX-(r.left+r.width/2))*.16).toFixed(1)+'px,'+((e.clientY-(r.top+r.height/2))*.26).toFixed(1)+'px)'},{passive:true});el.addEventListener('pointerleave',function(){el.style.transform=''})}
$$('[data-magnet]').forEach(magnet);
document.addEventListener('pointerdown',function(e){
  if(bg)bg.tap(e.clientX,e.clientY);
  var b=e.target.closest&&e.target.closest('.btn');
  if(b&&!reduce.matches){var r=b.getBoundingClientRect();b.style.setProperty('--rx',(e.clientX-r.left)+'px');b.style.setProperty('--ry',(e.clientY-r.top)+'px');var s=mk('span','rip');b.appendChild(s);setTimeout(function(){s.remove()},750);if(e.pointerType==='touch')buzz(8)}
},{passive:true});

/* ---------- scroll effects ---------- */
var progress=$('#progress'),toTop=$('#toTop'),ring=$('#toTopRing'),lastY=pageYOffset;
addLoop(function(t,dt){
  var y=pageYOffset,vh=S.vh;S.vel=lerp(S.vel,(y-lastY)/Math.max(dt,.008),.12);lastY=y;S.y=y;
  var max=root.scrollHeight-vh,p=max>0?clamp(y/max,0,1):0;progress.style.transform='scaleX('+p.toFixed(4)+')';
  nav.classList.toggle('is-scrolled',y>20);toTop.classList.toggle('show',y>vh*.8);ring.style.strokeDashoffset=(141.4*(1-p)).toFixed(1);
});
toTop.addEventListener('click',function(){scrollTo({top:0,behavior:reduce.matches?'auto':'smooth'})});
$('#year').textContent=new Date().getFullYear();
var revEls=$$('.rv');
if('IntersectionObserver' in window&&!reduce.matches){var rio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');rio.unobserve(en.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});revEls.forEach(function(e){rio.observe(e)})}else revEls.forEach(function(e){e.classList.add('in')});
/* animated counters */
function countUp(el){var to=+el.getAttribute('data-count'),suf=el.getAttribute('data-suf')||'',t0=performance.now(),d=reduce.matches?10:1600;
  (function f(now){var k=clamp((now-t0)/d,0,1),e=1-Math.pow(1-k,3),v=Math.round(to*e);el.textContent=v.toLocaleString('en-IN')+(k>=1?suf:'');if(k<1)requestAnimationFrame(f)})(t0)}
if('IntersectionObserver' in window){var cio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){countUp(en.target);cio.unobserve(en.target)}})},{threshold:.6});$$('[data-count]').forEach(function(e){cio.observe(e)})}else $$('[data-count]').forEach(countUp);
/* velocity-linked marquee */
var mq=$('#mqTrack'),mqX=0,mqW=0,mqDir=1;
['Strength','Cardio','HIIT','Yoga','CrossFit','Mobility','Personal training','Zumba','Boxing fitness'].forEach(function(w){mq.appendChild(mk('div','mq','<span>'+w+'</span><i></i>'))});
var mqSet=mq.innerHTML;mq.innerHTML=mqSet+mqSet+mqSet;
function mqMeasure(){mqW=mq.scrollWidth/3}mqMeasure();addEventListener('resize',mqMeasure);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(mqMeasure);
addLoop(function(t,dt){if(!mqW||reduce.matches)return;if(S.vel>20)mqDir=1;else if(S.vel<-20)mqDir=-1;mqX-=mqDir*(50+Math.min(Math.abs(S.vel),2400)*.22)*dt;if(mqX<=-mqW)mqX+=mqW;if(mqX>0)mqX-=mqW;mq.style.transform='translate3d('+mqX.toFixed(1)+'px,0,0)'});
/* kinetic headline: letters swell toward the pointer or finger */
var h1=$('#h1'),KL=[];
(function(){var txt=h1.textContent;h1.textContent='';txt.split(' ').forEach(function(w,wi,arr){var ws=mk('span','');ws.style.cssText='display:inline-block;white-space:nowrap';w.split('').forEach(function(c){var l=mk('span','k-letter');l.textContent=c;ws.appendChild(l);KL.push(l)});h1.appendChild(ws);if(wi<arr.length-1)h1.appendChild(document.createTextNode(' '))});
  KL.forEach(function(l,i){l.style.opacity=0;l.style.transform='translateY(.5em)';l.style.transition='opacity .7s '+(i*35)+'ms var(--ease),transform .9s '+(i*35)+'ms var(--ease)'});
  var go=function(){KL.forEach(function(l){l.style.opacity=1;l.style.transform='none'});setTimeout(function(){KL.forEach(function(l){l.style.transition='none'})},1800)};
  var iv=setInterval(function(){if(root.classList.contains('ready')){clearInterval(iv);setTimeout(go,150)}},60)})();
var kx=-999,ky=-999,kOn=false;
function kmove(e){kx=e.clientX;ky=e.clientY;kOn=true}
addEventListener('pointermove',kmove,{passive:true});addEventListener('pointerleave',function(){kOn=false});addEventListener('pointerup',function(e){if(e.pointerType==='touch')kOn=false});
addLoop(function(){if(reduce.matches||pageYOffset>S.vh)return;
  for(var i=0;i<KL.length;i++){var r=KL[i].getBoundingClientRect(),d=kOn?Math.hypot(kx-(r.left+r.width/2),ky-(r.top+r.height/2)):999,k=Math.max(0,1-d/240);
    KL[i].style.fontVariationSettings="'wght' "+Math.round(800+100*k)+", 'wdth' "+Math.round(128+0*k);KL[i].style.color=k>.55?'var(--a-ink)':'';if(KL[i].style.transition==='none')KL[i].style.transform=k>0?'translateY('+(-k*.07).toFixed(3)+'em)':'none'}});

/* ===================== Liquid chrome background (raymarched metaballs) ===================== */
bg=(function(){
  var cv=$('#liquid');if(!cv)return null;
  var gl=null;try{gl=cv.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'})||cv.getContext('experimental-webgl')}catch(e){}
  if(!gl)return null;
  var fs=['#ifdef GL_FRAGMENT_PRECISION_HIGH','precision highp float;','#else','precision mediump float;','#endif',
  'uniform vec2 uRes;uniform float uTime;uniform vec4 uB[6];uniform vec3 uAcc;uniform float uLight;',
  'float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}',
  'float map(vec3 p){float d=1e5;for(int i=0;i<6;i++){d=smin(d,length(p-uB[i].xyz)-uB[i].w,.9);}return d;}',
  'vec3 env(vec3 d){vec3 c=vec3(.012,.013,.018);',
  'c+=vec3(1.)*smoothstep(.45,.92,d.y)*2.6;',
  'c+=uAcc*2.2*smoothstep(.3,.8,d.x)*smoothstep(.8,.15,abs(d.y));',
  'c+=vec3(.55,.7,1.)*1.2*smoothstep(.3,.8,-d.x)*smoothstep(.75,.1,abs(d.y));',
  'c+=vec3(1.)*.55*exp(-abs(d.y+.03)*20.);',
  'c+=vec3(.09,.08,.11)*smoothstep(-.2,-.9,d.y);return c;}',
  'float hs(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'void main(){',
  'vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;',
  'vec3 ro=vec3(0.,0.,6.5);vec3 rd=normalize(vec3(uv,-1.6));',
  'float t=0.;float d=1.;bool hit=false;',
  'for(int i=0;i<46;i++){vec3 p=ro+rd*t;d=map(p);if(d<.004){hit=true;break;}t+=d;if(t>13.)break;}',
  'float vg=dot(uv,uv);',
  'vec3 bgc=mix(vec3(.04,.04,.05),vec3(.012),smoothstep(0.,1.1,vg));',
  'bgc+=uAcc*.07*exp(-length(uv-vec2(.45,.12))*1.8);',
  'vec3 col=bgc;',
  'if(hit){vec3 p=ro+rd*t;vec2 e=vec2(.0025,0.);',
  'vec3 n=normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));',
  'vec3 r=reflect(rd,n);float fr=pow(1.-max(dot(-rd,n),0.),3.);',
  'col=env(r)*(.5+.5*fr)+uAcc*.16*fr;col=mix(bgc,col,.92);}',
  'col=1.-exp(-col*1.15);',
  'vec3 darkc=col*.46;',
  'vec3 lin=darkc*darkc;float lm=dot(lin,vec3(.2126,.7152,.0722));if(lm>.15)darkc*=sqrt(.15/lm);',
  'vec3 lightbg=vec3(.945,.945,.95);vec3 lightc=clamp(lightbg-(1.-col)*.0+(col-bgc*.0)*.0,0.,1.);',
  'lightc=mix(lightbg,vec3(.60)+col*.42,hit?.9:0.);lightc=mix(lightc,lightc*vec3(.96,.96,1.)+uAcc*.05,.5);lightc=clamp(lightc,.38,.975);',
  'col=mix(darkc,lightc,uLight);',
  'col+=(hs(gl_FragCoord.xy+uTime)-.5)/255.;',
  'gl_FragColor=vec4(col,1.);}'].join('\n');
  function sh(ty,src){var s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
  var v=sh(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'),f=sh(gl.FRAGMENT_SHADER,fs);
  if(!v||!f)return null;
  var pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return null;
  gl.useProgram(pr);var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var U={};['uRes','uTime','uB','uAcc','uLight'].forEach(function(n){U[n]=gl.getUniformLocation(pr,n)});
  var scale=innerWidth<700?.34:.5,w=0,h=0,slow=0,lost=false,shown=false,ballData=new Float32Array(24),acc=ACC[S.acc].slice(),light=S.theme==='light'?1:0;
  var bs=[];for(var i=0;i<6;i++)bs.push({x:0,y:0,vx:0,vy:0,r:[.62,.95,.78,1.05,.7,.88][i],ph:i*1.7+.4,kick:0,bx:[0,1.9,-1.8,2.6,-2.7,.4][i],by:[0,.9,-.7,-1.1,1.1,-1.5][i]});
  function resize(){w=Math.max(2,Math.round(innerWidth*scale));h=Math.max(2,Math.round(innerHeight*scale));cv.width=w;cv.height=h;gl.viewport(0,0,w,h)}
  resize();addEventListener('resize',resize);
  cv.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true;cv.classList.remove('on')});
  var dirty=60;onTheme(function(){dirty=200});
  function world(){var hh=2.03,aw=w/h;return {hx:hh*aw,hy:hh}}
  addLoop(function(t,dt){
    if(lost)return;var k=1-Math.exp(-dt*2.5),a=ACC[S.acc],i;for(i=0;i<3;i++)acc[i]=lerp(acc[i],a[i],k);light=lerp(light,S.theme==='light'?1:0,k);
    if(reduce.matches){if(dirty<=0)return;dirty--}
    var wd=world(),tt=reduce.matches?0:t;
    for(i=0;i<6;i++){var b=bs[i],sx=Math.sin(tt*.21+b.ph)*.55+Math.sin(tt*.13+b.ph*2.1)*.3,sy=Math.cos(tt*.17+b.ph*1.3)*.5;
      var tx=b.bx*wd.hx*.42+sx+Math.sin(S.y*.0016+b.ph)*.5,ty=b.by*.8+sy+Math.cos(S.y*.0012+b.ph*1.4)*.45;
      if(i===0){tx=(S.mx-.5)*2*wd.hx*.8;ty=(S.my-.5)*2*wd.hy*.8;if(!S.pointerOn){tx=Math.sin(tt*.3)*1.2+1.4;ty=Math.cos(tt*.25)*.8}}
      b.vx+=(tx-b.x)*dt*3.2;b.vy+=(ty-b.y)*dt*3.2;b.vx*=.9;b.vy*=.9;b.x+=b.vx;b.y+=b.vy;b.kick*=Math.exp(-dt*2.2);
      ballData[i*4]=b.x;ballData[i*4+1]=b.y;ballData[i*4+2]=-.2-(i===0?.3:0);ballData[i*4+3]=b.r+b.kick+(i===0?S.mv*.25:0)}
    gl.uniform2f(U.uRes,w,h);gl.uniform1f(U.uTime,tt);gl.uniform4fv(U.uB,ballData);gl.uniform3fv(U.uAcc,acc);gl.uniform1f(U.uLight,light);
    var t0=performance.now();gl.drawArrays(gl.TRIANGLES,0,3);
    if(!shown){shown=true}
    var ms=performance.now()-t0;if(dt>.034||ms>14)slow++;else slow=Math.max(0,slow-1);if(slow>40&&scale>.26){scale=Math.max(.26,scale-.08);slow=0;resize()}
  });
  return {
    on:function(){cv.classList.add('on')},
    tap:function(x,y){var wd=world(),wx=(x/innerWidth-.5)*2*wd.hx,wy=(.5-y/innerHeight)*2*wd.hy,best=1,bd=1e9,i;
      for(i=1;i<6;i++){var d=Math.hypot(bs[i].x-wx,bs[i].y-wy);if(d<bd){bd=d;best=i}}
      var b=bs[best];b.kick=.55;b.vx+=(wx-b.x)*.12;b.vy+=(wy-b.y)*.12;S.pointerOn=true}
  };
})();
if(bg===null){root.classList.add('no-liquid')}

/* ===================== 3D gym equipment (one WebGL canvas, drawn into page slots) ===================== */
objs=(function(){
  var cv=$('#gl3d');if(!cv)return null;
  var gl=null;try{gl=cv.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:true})||cv.getContext('experimental-webgl')}catch(e){}
  if(!gl){root.classList.add('no-gl');return null}
  /* ---- math ---- */
  function mul(a,b){var o=new Array(16),c,r,k,s;for(c=0;c<4;c++)for(r=0;r<4;r++){s=0;for(k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o}
  function I4(){return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}
  function T4(x,y,z){var m=I4();m[12]=x;m[13]=y;m[14]=z;return m}
  function S4(s){var m=I4();m[0]=m[5]=m[10]=s;return m}
  function RX(a){var c=Math.cos(a),s=Math.sin(a);return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]}
  function RY(a){var c=Math.cos(a),s=Math.sin(a);return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]}
  function persp(f,a,n,fa){var t=1/Math.tan(f/2);return [t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0]}
  function look(e){/* camera on +z axis looking at the origin */return T4(-e[0],-e[1],-e[2])}
  /* ---- meshes ---- */
  function Mesh(){this.v=[]}
  Mesh.prototype.vt=function(p,n,c,m){this.v.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2],m)};
  Mesh.prototype.tri=function(a,b,c,na,nb,nc,col,m){this.vt(a,na,col,m);this.vt(b,nb,col,m);this.vt(c,nc,col,m)};
  Mesh.prototype.quad=function(a,b,c,d,na,nb,nc,nd,col,m){this.tri(a,b,c,na,nb,nc,col,m);this.tri(a,c,d,na,nc,nd,col,m)};
  function cylX(m,x0,x1,r0,r1,seg,col,mat){for(var i=0;i<seg;i++){var a0=i/seg*TAU,a1=(i+1)/seg*TAU,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
    var n0=[0,c0,s0],n1=[0,c1,s1];m.quad([x0,r0*c0,r0*s0],[x1,r1*c0,r1*s0],[x1,r1*c1,r1*s1],[x0,r0*c1,r0*s1],n0,n0,n1,n1,col,mat);
    if(r0>0)m.tri([x0,0,0],[x0,r0*c1,r0*s1],[x0,r0*c0,r0*s0],[-1,0,0],[-1,0,0],[-1,0,0],col,mat);
    if(r1>0)m.tri([x1,0,0],[x1,r1*c0,r1*s0],[x1,r1*c1,r1*s1],[1,0,0],[1,0,0],[1,0,0],col,mat)}}
  function ringX(m,x0,x1,ri,ro,seg,col,mat){for(var i=0;i<seg;i++){var a0=i/seg*TAU,a1=(i+1)/seg*TAU,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1),n0=[0,c0,s0],n1=[0,c1,s1],i0=[0,-c0,-s0],i1=[0,-c1,-s1];
    m.quad([x0,ro*c0,ro*s0],[x1,ro*c0,ro*s0],[x1,ro*c1,ro*s1],[x0,ro*c1,ro*s1],n0,n0,n1,n1,col,mat);
    m.quad([x0,ri*c0,ri*s0],[x1,ri*c0,ri*s0],[x1,ri*c1,ri*s1],[x0,ri*c1,ri*s1],i0,i0,i1,i1,col,mat);
    m.quad([x0,ri*c0,ri*s0],[x0,ro*c0,ro*s0],[x0,ro*c1,ro*s1],[x0,ri*c1,ri*s1],[-1,0,0],[-1,0,0],[-1,0,0],[-1,0,0],col,mat);
    m.quad([x1,ri*c0,ri*s0],[x1,ro*c0,ro*s0],[x1,ro*c1,ro*s1],[x1,ri*c1,ri*s1],[1,0,0],[1,0,0],[1,0,0],[1,0,0],col,mat)}}
  function prismX(m,x0,x1,r,seg,col,mat){for(var i=0;i<seg;i++){var a0=(i+.5)/seg*TAU,a1=(i+1.5)/seg*TAU,am=(i+1)/seg*TAU,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1),n=[0,Math.cos(am),Math.sin(am)];
    m.quad([x0,r*c0,r*s0],[x1,r*c0,r*s0],[x1,r*c1,r*s1],[x0,r*c1,r*s1],n,n,n,n,col,mat);
    m.tri([x0,0,0],[x0,r*c1,r*s1],[x0,r*c0,r*s0],[-1,0,0],[-1,0,0],[-1,0,0],col,mat);m.tri([x1,0,0],[x1,r*c0,r*s0],[x1,r*c1,r*s1],[1,0,0],[1,0,0],[1,0,0],col,mat)}}
  function sphere(m,cx,cy,cz,r,seg,rings,col,mat,sy){sy=sy||1;function P(a,b){return [cx+r*Math.sin(b)*Math.cos(a),cy+r*Math.cos(b)*sy,cz+r*Math.sin(b)*Math.sin(a)]}function N(a,b){var x=Math.sin(b)*Math.cos(a),y=Math.cos(b)/sy,z=Math.sin(b)*Math.sin(a),l=Math.hypot(x,y,z);return [x/l,y/l,z/l]}
    for(var j=0;j<rings;j++){var b0=j/rings*Math.PI,b1=(j+1)/rings*Math.PI;for(var i=0;i<seg;i++){var a0=i/seg*TAU,a1=(i+1)/seg*TAU;m.quad(P(a0,b0),P(a1,b0),P(a1,b1),P(a0,b1),N(a0,b0),N(a1,b0),N(a1,b1),N(a0,b1),col,mat)}}}
  function torus(m,c,R,r,a0,a1,sU,sV,e1,e2,col,mat){var w=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
    function rd(u){return [Math.cos(u)*e1[0]+Math.sin(u)*e2[0],Math.cos(u)*e1[1]+Math.sin(u)*e2[1],Math.cos(u)*e1[2]+Math.sin(u)*e2[2]]}
    function N(u,v){var d=rd(u),cv=Math.cos(v),sv=Math.sin(v);return [cv*d[0]+sv*w[0],cv*d[1]+sv*w[1],cv*d[2]+sv*w[2]]}
    function P(u,v){var d=rd(u),n=N(u,v);return [c[0]+R*d[0]+r*n[0],c[1]+R*d[1]+r*n[1],c[2]+R*d[2]+r*n[2]]}
    for(var i=0;i<sU;i++){var u0=a0+(a1-a0)*i/sU,u1=a0+(a1-a0)*(i+1)/sU;for(var j=0;j<sV;j++){var v0=j/sV*TAU,v1=(j+1)/sV*TAU;m.quad(P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1),N(u0,v0),N(u1,v0),N(u1,v1),N(u0,v1),col,mat)}}}
  var CH=[.93,.94,.96],RB=[.07,.07,.08],ST=[.3,.31,.35],AC=[1,1,1];
  var PL=[{r:1.28,w:.17},{r:1.28,w:.17},{r:1.28,w:.17},{r:1.28,w:.17},{r:1.0,w:.14},{r:.8,w:.12}],PW=[20,20,20,20,10,5];
  function plate(m,r,w,bolts){var h=w/2;cylX(m,-h,h,r,r,56,RB,1);ringX(m,-h-.004,h+.004,r*.8,r*.86,56,AC,2);ringX(m,-h-.004,h+.004,r*.56,r*.585,56,ST,3);
    ringX(m,-h-.006,h+.006,.1,.27,32,CH,0)}
  function knurl(m,x0,x1,r){for(var x=x0;x<x1;x+=.034)cylX(m,x,x+.017,r,r,12,ST,3)}
  function bar(){var m=new Mesh();cylX(m,-3.4,3.4,.065,.065,20,CH,0);knurl(m,.55,1.3,.072);knurl(m,-1.3,-.55,.072);
    [-1,1].forEach(function(s){cylX(m,s*1.45,s*3.5,.095,.095,24,CH,0);cylX(m,s*1.38,s*1.5,.19,.19,24,ST,3);cylX(m,s*3.5,s*3.54,.07,.07,16,CH,0);ringX(m,s*1.5-.02*s,s*1.5+.02*s,.19,.2,24,AC,2)});return m}
  function plateMesh(i){var m=new Mesh();plate(m,PL[i].r,PL[i].w,false);return m}
  function dumbbell(){var m=new Mesh();cylX(m,-.9,.9,.1,.1,24,CH,0);knurl(m,-.55,.55,.108);
    [-1,1].forEach(function(s){prismX(m,s*.85,s*1.75,.7,6,ST,3);ringX(m,s*.85-.01*s,s*.85+.03*s,.2,.62,6,AC,2);cylX(m,s*1.75,s*1.8,.34,.34,28,CH,0);cylX(m,s*.78,s*.86,.17,.17,24,CH,0)});return m}
  function kettle(){var m=new Mesh();sphere(m,0,0,0,1,40,24,RB,1,.93);torus(m,[0,.38,0],.62,.13,0,Math.PI,24,14,[1,0,0],[0,1,0],CH,0);
    torus(m,[0,.05,0],.99,.045,0,TAU,48,8,[1,0,0],[0,0,1],AC,2);sphere(m,0,-.88,0,.001,4,2,RB,1,1);return m}
  function plateFace(){var m=new Mesh();plate(m,1.28,.2,true);
    for(var i=0;i<8;i++){var a=i/8*TAU,y=.4*Math.cos(a),z=.4*Math.sin(a);var b=new Mesh();cylX(b,-.11,.11,.034,.034,10,CH,0);for(var k=0;k<b.v.length;k+=10){b.v[k+1]+=y;b.v[k+2]+=z;m.v.push.apply(m.v,b.v.slice(k,k+10))}}return m}
  /* ---- gl setup ---- */
  var vs='attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;attribute float aM;uniform mat4 uVP;uniform mat4 uM;varying vec3 vN;varying vec3 vC;varying vec3 vP;varying float vM;void main(){vec4 w=uM*vec4(aP,1.);vP=w.xyz;vN=(uM*vec4(aN,0.)).xyz;vC=aC;vM=aM;gl_Position=uVP*w;}';
  var fs=['#ifdef GL_FRAGMENT_PRECISION_HIGH','precision highp float;','#else','precision mediump float;','#endif',
  'varying vec3 vN;varying vec3 vC;varying vec3 vP;varying float vM;uniform vec3 uEye;uniform vec3 uAcc;uniform float uTime;',
  'vec3 env(vec3 d){vec3 c=vec3(.012,.013,.018);c+=vec3(1.)*smoothstep(.4,.92,d.y)*2.8;c+=uAcc*2.3*smoothstep(.25,.8,d.x)*smoothstep(.85,.1,abs(d.y));',
  'c+=vec3(.55,.7,1.)*1.3*smoothstep(.25,.8,-d.x)*smoothstep(.8,.1,abs(d.y));c+=vec3(1.)*.6*exp(-abs(d.y+.03)*18.);c+=vec3(.1,.09,.12)*smoothstep(-.1,-.9,d.y);return c;}',
  'void main(){vec3 n=normalize(vN);vec3 v=normalize(uEye-vP);if(dot(n,v)<0.)n=-n;vec3 r=reflect(-v,n);float fr=pow(1.-max(dot(n,v),0.),4.);vec3 L=normalize(vec3(.5,.9,.6));float df=max(dot(n,L),0.);vec3 col;',
  'if(vM<.5){col=env(r)*vC*(.78+.45*fr);}',
  'else if(vM<1.5){col=vC*(.08+.55*df)+env(r)*.12*(.4+fr);}',
  'else if(vM<2.5){col=uAcc*(.85+.25*sin(uTime*2.))*(.55+.45*df)+env(r)*.22;}',
  'else{col=env(r)*vC*.75+vC*.05;}',
  'col=1.-exp(-col*1.1);gl_FragColor=vec4(col,1.);}'].join('\n');
  function sh(ty,src){var s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
  var a=sh(gl.VERTEX_SHADER,vs),b=sh(gl.FRAGMENT_SHADER,fs);if(!a||!b){root.classList.add('no-gl');return null}
  var pr=gl.createProgram();gl.attachShader(pr,a);gl.attachShader(pr,b);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){root.classList.add('no-gl');return null}
  gl.useProgram(pr);
  var AT=[['aP',3,0],['aN',3,3],['aC',3,6],['aM',1,9]].map(function(x){return [gl.getAttribLocation(pr,x[0]),x[1],x[2]]});
  var UL={};['uVP','uM','uEye','uAcc','uTime'].forEach(function(n){UL[n]=gl.getUniformLocation(pr,n)});
  function up(mesh){var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mesh.v),gl.STATIC_DRAW);return {buf:buf,n:mesh.v.length/10}}
  var G={bar:up(bar()),p0:up(plateMesh(0)),p4:up(plateMesh(4)),p5:up(plateMesh(5)),dumbbell:up(dumbbell()),kettlebell:up(kettle()),plate:up(plateFace())};
  function draw(g,M){gl.bindBuffer(gl.ARRAY_BUFFER,g.buf);AT.forEach(function(x){gl.enableVertexAttribArray(x[0]);gl.vertexAttribPointer(x[0],x[1],gl.FLOAT,false,40,x[2]*4)});gl.uniformMatrix4fv(UL.uM,false,new Float32Array(M));gl.drawArrays(gl.TRIANGLES,0,g.n)}
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.SCISSOR_TEST);
  var DPR=1;function size(){DPR=Math.min(devicePixelRatio||1,innerWidth<700?1.5:2);cv.width=Math.round(innerWidth*DPR);cv.height=Math.round(innerHeight*DPR)}size();addEventListener('resize',size);
  /* ---- objects mapped to page elements ---- */
  var list=[];
  var CAM={barbell:[11.5,.22,-.55],dumbbell:[7.6,.2,-.5],kettlebell:[6.3,.18,.35],plate:[7.2,.12,-1.2]};
  function Obj(el,model,o){this.el=el;this.model=model;this.yaw=CAM[model][2];this.pitch=CAM[model][1];this.vy=0;this.drag=false;this.lx=0;this.ly=0;this.spin=o&&o.spin!==undefined?o.spin:.16;this.scrollTurn=o&&o.scrollTurn;this.plates=o&&o.plates||0;this.pa=[0,0,0,0,0,0];this.swap=0;this.mx=0;this.my=0;
    var s=this;el.addEventListener('pointerdown',function(e){s.drag=true;s.lx=e.clientX;s.ly=e.clientY;s.vy=0;el.classList.add('drag');try{el.setPointerCapture(e.pointerId)}catch(x){}});
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();s.mx=((e.clientX-r.left)/r.width-.5);s.my=((e.clientY-r.top)/r.height-.5);if(!s.drag)return;var dx=e.clientX-s.lx,dy=e.clientY-s.ly;s.lx=e.clientX;s.ly=e.clientY;s.yaw+=dx*.009;s.vy=dx*.009;if(e.pointerType!=='touch')s.pitch=clamp(s.pitch+dy*.005,-.5,.9)});
    var end=function(){s.drag=false;el.classList.remove('drag')};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('pointerleave',function(){s.mx=0;s.my=0})}
  Obj.prototype.set=function(m){if(m===this.model)return;this.model=m;this.swap=1;this.yaw=CAM[m][2];this.pitch=CAM[m][1];this.vy=0};
  function add(el,model,o){var ob=new Obj(el,model,o);list.push(ob);return ob}
  function plateX(k,side,pa){var off=1.55;for(var i=0;i<k;i++)off+=PL[i].w+.022;return side*(off+PL[k].w/2+(1-pa)*2.6)}
  function render(ob,t,dt){
    var r=ob.el.getBoundingClientRect();if(r.bottom<-20||r.top>innerHeight+20||r.width<10)return;
    var x=Math.round(r.left*DPR),y=Math.round((innerHeight-r.bottom)*DPR),w=Math.round(r.width*DPR),h=Math.round(r.height*DPR);
    if(!ob.drag){if(!reduce.matches)ob.yaw+=ob.spin*dt;ob.yaw+=ob.vy;ob.vy*=.94}
    ob.swap=Math.max(0,ob.swap-dt*2.2);
    var cam=CAM[ob.model],aspect=r.width/r.height,dist=cam[0]*(aspect<1?Math.min(1.5,1/(aspect*1.1)):1),sc=1-Math.pow(ob.swap,2);
    var yaw=ob.yaw+(ob.scrollTurn?S.y*.0016:0)+ob.mx*.35+ob.swap*2.4,pitch=ob.pitch-ob.my*.3;
    gl.viewport(x,y,w,h);gl.scissor(x,y,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    var eye=[0,0,dist],VP=mul(persp(.7,w/h,1,60),look(eye));
    gl.uniformMatrix4fv(UL.uVP,false,new Float32Array(VP));gl.uniform3fv(UL.uEye,eye);gl.uniform3fv(UL.uAcc,ACC[S.acc]);gl.uniform1f(UL.uTime,t);
    var M=mul(mul(S4(sc),RX(pitch)),RY(yaw)),base=ob.model==='barbell'?'bar':ob.model;
    if(ob.model==='plate')M=mul(M,mul(I4(),RY(0)));
    draw(G[base],M);
    if(ob.model==='barbell'){for(var k=0;k<6;k++){var target=k<ob.plates?1:0;ob.pa[k]+=(target-ob.pa[k])*Math.min(1,dt*7);var pa=ob.pa[k];if(pa<.01)continue;
      var g=k<4?G.p0:k===4?G.p4:G.p5;[-1,1].forEach(function(s){var px=plateX(k,s,pa);draw(g,mul(M,mul(T4(px,0,0),RX(s*(1-pa)*6))))})}}
  }
  addLoop(function(t,dt){if(!list.length)return;gl.disable(gl.SCISSOR_TEST);gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.SCISSOR_TEST);
    for(var i=0;i<list.length;i++)render(list[i],t,dt)});
  return {add:add,weight:function(n){var s=0;for(var i=0;i<n;i++)s+=PW[i];return 20+2*s}};
})();

/* ===================== content + interactions ===================== */
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ic(p){return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'}
var IC={strength:'<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',cardio:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M7 11h3l1.5-2.5L13 13l1-2h3"/>',weights:'<circle cx="12" cy="15" r="6"/><path d="M8 11a4 4 0 0 1 8 0"/>',bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',yoga:'<circle cx="12" cy="5" r="2"/><path d="M5 20c2-5 5-6 7-6s5 1 7 6M12 14V9M6 11h12"/>',pt:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M18 4l.9 1.9 2.1.3-1.5 1.5.4 2.1L18 8.8l-1.9 1 .4-2.1L15 6.2l2.1-.3z"/>',locker:'<path d="M6 21V4h9l3 2v15M6 21h12M13 12.5h.01"/>',shower:'<path d="M5 12a7 7 0 0 1 14 0H5zM8 16v2M12 16v3M16 16v2"/>',parking:'<circle cx="12" cy="12" r="9"/><path d="M10 16.5V7.5h3a2.6 2.6 0 0 1 0 5.2h-3"/>',shaker:'<path d="M7 3h10l-1.2 17a1 1 0 0 1-1 .9H9.2a1 1 0 0 1-1-.9L7 3zM7.3 8h9.4"/>',
 chest:'<path d="M12 5v14M5 8c2 0 5 1 7 3 2-2 5-3 7-3v6c-2 0-5 1-7 3-2-2-5-3-7-3z"/>',back:'<path d="M12 4v16M6 7l6 3 6-3M6 17l6-3 6 3"/>',legs:'<path d="M9 3v8l-2 10M15 3v8l2 10M9 11h6"/>',
 protein:'<ellipse cx="12" cy="13" rx="6" ry="7.5"/><path d="M9 9c1-1.2 2.3-1.8 3.8-1.6"/>',water:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',plate:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/>',pre:'<rect x="3" y="8" width="16" height="8" rx="2"/><path d="M21 11v2M10 9.5L8.5 12H12l-1.5 2.5"/>',post:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 check:'<path d="M5 12.5l4.2 4.2L19 7"/>',star:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.2 1.2 6L12 16.4 6.7 19.5l1.2-6L3.4 9.3l6-.7z"/>'};

/* ---------- modals (liquid circle reveal) ---------- */
var openMod=null,lastFocus=null;
function openModal(id,ev){var m=document.getElementById(id);if(!m)return;var x=ev&&ev.clientX!==undefined?ev.clientX:innerWidth/2,y=ev&&ev.clientY!==undefined?ev.clientY:innerHeight/2;
  m.style.setProperty('--cx',x+'px');m.style.setProperty('--cy',y+'px');lastFocus=document.activeElement;m.classList.add('open');openMod=m;root.classList.add('no-scroll');buzz(10);
  setTimeout(function(){var f=$('input,select,textarea,button:not(.modal__x)',m)||$('.modal__x',m);if(f&&!f.closest('[hidden]'))f.focus()},350)}
function closeModal(){if(!openMod)return;openMod.classList.remove('open');openMod=null;root.classList.remove('no-scroll');if(lastFocus&&lastFocus.focus)lastFocus.focus()}
$$('.modal').forEach(function(m){m.addEventListener('click',function(e){if(e.target===m)closeModal()});$$('[data-close]',m).forEach(function(b){b.addEventListener('click',closeModal)})});
document.addEventListener('keydown',function(e){if(!openMod)return;if(e.key==='Escape')closeModal();
  if(e.key==='Tab'){var f=$$('input,select,textarea,button,a[href]',openMod).filter(function(x){return !x.closest('[hidden]')&&x.offsetParent!==null}),i=f.indexOf(document.activeElement);if(!f.length)return;e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}});

/* ---------- local demo data (bookings, member portal) ---------- */
var DB={get:function(){try{return JSON.parse(localStorage.getItem('fh_demo'))||{}}catch(e){return {}}},set:function(d){try{localStorage.setItem('fh_demo',JSON.stringify(d))}catch(e){}}};
function digits(v){return v.replace(/\D/g,'')}
function bad(el,st,msg){el.setAttribute('aria-invalid','true');el.focus();st.textContent=msg;st.className='status field--full err';return false}
function okf(els){els.forEach(function(e){e.setAttribute('aria-invalid','false')})}

/* ---------- hero barbell: load the bar ---------- */
var hero=objs?objs.add($('#heroStage'),'barbell',{plates:3,scrollTurn:true,spin:.12}):null;
var plOut=$('#plOut');
function plUpdate(){if(!hero)return;plOut.textContent='Bar: '+objs.weight(hero.plates)+' kg'}
if(hero){plUpdate();$('#plPlus').addEventListener('click',function(){if(hero.plates<6){hero.plates++;plUpdate();buzz(14)}else toast('The bar is fully loaded')});$('#plMinus').addEventListener('click',function(){if(hero.plates>0){hero.plates--;plUpdate();buzz(10)}})}
else{$('.load').style.display='none';$('.hint').style.display='none'}

/* ---------- equipment explorer ---------- */
var EQ={barbell:{n:'Olympic barbell',t:'The backbone of strength training. Load it up for squats, deadlifts, bench press and rows.',s:[['Typical weight','20 kg'],['Best for','Compound lifts'],['Grip','Knurled steel shaft'],['Pairs with','Rubber plates']]},
 dumbbell:{n:'Hex dumbbell',t:'Easy to grab, hard to roll away. Great for presses, rows, lunges and curls at every level.',s:[['Typical range','2 to 50 kg'],['Best for','Presses, rows, curls'],['Head','Hexagonal, rubber coated'],['Handle','Knurled chrome']]},
 kettlebell:{n:'Kettlebell',t:'An offset weight with a wide handle. Perfect for swings, goblet squats, carries and conditioning.',s:[['Typical range','4 to 32 kg'],['Best for','Swings and carries'],['Body','Cast, rubber finish'],['Handle','Wide and smooth']]},
 plate:{n:'Bumper plate',t:'Rubber plates are quiet, durable and floor friendly, so they suit everything from deadlifts to Olympic lifts.',s:[['Typical sizes','2.5 to 25 kg'],['Best for','Loading barbells'],['Finish','Rubber coated'],['Hub','Steel insert']]}};
var eqObj=objs?objs.add($('#eqStage'),'barbell',{plates:4,spin:.3}):null,eqSeg=$('#eqSeg');
if(eqObj){eqObj.plates=4}
var eqPlace=makePill(eqSeg,'button',function(b){return b.classList.contains('on')});
function eqSet(k){$$('button',eqSeg).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-m')===k);b.setAttribute('aria-selected',b.getAttribute('data-m')===k?'true':'false')});eqPlace();
  var d=EQ[k];$('#eqName').textContent=d.n;$('#eqText').textContent=d.t;$('#eqSpec').innerHTML=d.s.map(function(x){return '<dt>'+x[0]+'</dt><dd>'+x[1]+'</dd>'}).join('');if(eqObj){eqObj.set(k);eqObj.plates=k==='barbell'?4:0}}
$$('button',eqSeg).forEach(function(b){b.addEventListener('click',function(){eqSet(b.getAttribute('data-m'));buzz(8)})});eqSet('barbell');
if(!objs){$$('.stage').forEach(function(s){s.style.display='none'})}

/* ---------- facilities (bento) ---------- */
var FAC=[['Strength training','strength','Racks, platforms and plate-loaded machines for serious lifting.'],['Cardio zone','cardio','Treadmills, bikes and rowers with room to breathe.'],['Free weights','weights','Dumbbells and kettlebells from light to heavy.'],['CrossFit and functional training','bolt','Rigs, sleds, ropes and open space for circuits.'],['Yoga','yoga','A calm studio for yoga, mobility and stretching.'],['Personal training','pt','One-to-one coaching built around your goal.'],['Changing rooms','locker','Spacious and clean, with lockers.'],['Shower facilities','shower','Fresh up before work or after a long session.'],['Parking','parking','Easy parking for members.'],['Supplement and protein bar','shaker','Shakes, snacks and essentials to refuel.']];
var bento=$('#bento');FAC.forEach(function(f,i){var c=mk('div','fac rv');c.style.transitionDelay=(i%3)*70+'ms';c.innerHTML='<div class="fac__art">'+ic(IC[f[1]]).replace('class="ico"','class="ico" style="width:100%;height:auto;stroke-width:1.1"')+'</div><h3>'+f[0]+'</h3><p>'+f[2]+'</p>';bento.appendChild(c);tiltify(c)});

/* ---------- art placeholders for trainers + gallery ---------- */
var artN=0;
function art(kind,seed){var id='ga'+(++artN),r=function(i){return ((Math.sin(seed*91.7+i*37.3)+1)/2)},sh='';
  if(kind==='equipment'){for(var i=0;i<4;i++)sh+='<circle cx="'+(60+r(i)*80)+'" cy="'+(80+r(i+5)*90)+'" r="'+(26+i*14)+'" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="'+(2+i)+'"/>';sh+='<rect x="0" y="'+(110+r(9)*30)+'" width="200" height="8" rx="4" fill="rgba(255,255,255,.55)"/>'}
  else if(kind==='trainers'){sh='<circle cx="100" cy="95" r="34" fill="rgba(255,255,255,.4)"/><path d="M30 250c6-62 38-84 70-84s64 22 70 84z" fill="rgba(255,255,255,.3)"/>'}
  else if(kind==='events'){for(var j=0;j<16;j++)sh+='<rect x="'+(r(j)*190)+'" y="'+(r(j+30)*240)+'" width="'+(6+r(j+60)*10)+'" height="'+(6+r(j+90)*10)+'" rx="2" fill="rgba(255,255,255,'+(.25+r(j+120)*.4)+')" transform="rotate('+(r(j+150)*90)+' '+(r(j)*190)+' '+(r(j+30)*240)+')"/>'}
  else{sh='<circle cx="65" cy="105" r="26" fill="rgba(255,255,255,.38)"/><circle cx="135" cy="105" r="26" fill="rgba(255,255,255,.3)"/><circle cx="100" cy="85" r="30" fill="rgba(255,255,255,.45)"/><path d="M20 250c4-46 28-62 48-62h64c20 0 44 16 48 62z" fill="rgba(255,255,255,.28)"/>'}
  return '<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--a)"/><stop offset="1" stop-color="#14141a"/></linearGradient></defs><rect width="200" height="250" fill="url(#'+id+')"/>'+sh+'</svg>'}

/* ---------- trainers ---------- */
var TR=[['Rahul Sharma','Certified Strength and Conditioning Coach',8,['Strength and conditioning certification','CPR and first aid'],'Rahul builds strength programs for people who want to lift properly and keep progressing safely.'],
 ['Anjali Verma','Yoga and Mobility Coach',6,['Registered yoga teacher','Mobility specialist'],'Anjali helps members move better, recover faster and find a calmer rhythm in training.'],
 ['Aman Singh','Powerlifting and Strength Coach',7,['Strength coaching certification','Barbell technique coach'],'Aman focuses on squat, bench and deadlift technique and sensible long-term loading.'],
 ['Priya Nair','Group Fitness and Zumba Instructor',5,['Group fitness instructor','Dance fitness certified'],'Priya runs high-energy classes that make cardio feel more like a party than a chore.'],
 ['Karan Mehta','HIIT and Fat-loss Coach',4,['Personal trainer certification','HIIT specialist'],'Karan designs efficient interval sessions for people short on time and big on goals.'],
 ['Sneha Rao','Personal Trainer',6,['Personal trainer certification','Functional training coach'],'Sneha works one-to-one with beginners and returning members to rebuild confidence.']];
var rail=$('#rail');
TR.forEach(function(t,i){var c=mk('article','trn');c.innerHTML='<div class="trn__ph">'+art('trainers',i+2)+'<b>'+t[0].split(' ').map(function(w){return w[0]}).join('')+'</b></div><div class="trn__b"><h3>'+t[0]+'</h3><em>'+t[1]+'</em><p style="font-size:.92rem">'+t[2]+' years experience</p><button class="btn btn--ghost" type="button" data-tr="'+i+'"><span>View Profile</span></button></div>';rail.appendChild(c);tiltify(c)});
$$('[data-tr]',rail).forEach(function(b){b.addEventListener('click',function(e){var t=TR[+b.getAttribute('data-tr')];$('#mTrBody').innerHTML='<h3 id="mTrH">'+t[0]+'</h3><p class="acc" style="font-weight:700;margin-bottom:.8rem">'+t[1]+'</p><p>'+t[4]+'</p><p style="margin-top:.8rem"><b>Experience:</b> '+t[2]+' years</p><ul class="cert" style="margin-top:1rem">'+t[3].map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul><div style="margin-top:1.4rem;display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn btn--fill" type="button" id="trBook"><span>Book a session</span></button></div>';
  $('#trBook').addEventListener('click',function(ev){closeModal();setTimeout(function(){trialCtx={who:t[0]};openTrial(ev)},200)});openModal('mTr',e)})});
(function(){var down=false,sx=0,sl=0,moved=false;rail.addEventListener('pointerdown',function(e){if(e.pointerType==='touch')return;down=true;moved=false;sx=e.clientX;sl=rail.scrollLeft});addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;rail.classList.add('drag')}rail.scrollLeft=sl-dx});addEventListener('pointerup',function(){down=false;setTimeout(function(){rail.classList.remove('drag')},0)});rail.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true)})();

/* ---------- plans ---------- */
var PLANS=[{n:'Basic',d:'1 Month',p:1499,f:['Full gym floor access','Changing rooms and showers','Free orientation session']},{n:'Pro',d:'3 Months',p:3999,pop:1,f:['Everything in Basic','Cardio zone access','Group classes included','Monthly progress check']},{n:'Elite',d:'12 Months',p:11999,f:['Everything in Pro','All-access, any time','Personal training sessions','Priority class booking']}];
var pb=$('#plansBox'),jsel=$('#jPl');
PLANS.forEach(function(p){var c=mk('article','plan rv'+(p.pop?' plan--pop':''));
  c.innerHTML=(p.pop?'<span class="plan__tag">Most Popular</span>':'')+'<div><h3>'+p.n+'</h3><p style="font-size:.95rem;margin-top:.2rem">'+p.d+'</p></div><div class="plan__price" data-price="'+p.p+'">&#8377;0 <small>/ '+p.d.toLowerCase()+'</small></div><ul>'+p.f.map(function(x){return '<li>'+ic(IC.check)+x+'</li>'}).join('')+'</ul><button class="btn '+(p.pop?'btn--fill':'btn--ghost')+'" type="button" data-open="join" data-plan="'+p.n+'"><span>Join Now</span></button>';
  pb.appendChild(c);tiltify(c);jsel.appendChild(mk('option','',p.n+' ('+p.d+')'))});
if('IntersectionObserver' in window){var pio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var el=$('.plan__price',en.target),to=+el.getAttribute('data-price'),sm=el.querySelector('small').outerHTML,t0=performance.now();(function f(n){var k=clamp((n-t0)/(reduce.matches?10:1200),0,1),v=Math.round(to*(1-Math.pow(1-k,3)));el.innerHTML='&#8377;'+v.toLocaleString('en-IN')+' '+sm;if(k<1)requestAnimationFrame(f)})(t0);pio.unobserve(en.target)}})},{threshold:.5});$$('.plan',pb).forEach(function(e){pio.observe(e)})}else $$('.plan__price',pb).forEach(function(el){el.innerHTML='&#8377;'+(+el.getAttribute('data-price')).toLocaleString('en-IN')+' '+el.querySelector('small').outerHTML});

/* ---------- trial / join / class booking ---------- */
var trialCtx=null;
function openTrial(e){var cls=trialCtx&&trialCtx.cls,who=trialCtx&&trialCtx.who;$('#mTrialH').textContent=cls?'Book '+cls:who?'Book with '+who:'Book a free trial';$('#tD').closest('.field').style.display=cls?'none':'';$('#tT').closest('.field').style.display=cls?'none':'';$('#tG').closest('.field').style.display=cls?'none':'';
  var d=new Date();d.setDate(d.getDate()+1);$('#tD').min=iso(new Date());if(!$('#tD').value)$('#tD').value=iso(d);$('#tS').textContent='';openModal('mTrial',e)}
function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
$('#tGo').addEventListener('click',function(){var n=$('#tN'),p=$('#tP'),d=$('#tD'),st=$('#tS'),cls=trialCtx&&trialCtx.cls;okf([n,p,d]);
  if(n.value.trim().length<2)return bad(n,st,'Enter your name.');if(digits(p.value).length<7)return bad(p,st,'Enter a phone number we can reach you on.');
  if(!cls&&(!d.value||d.value<iso(new Date())))return bad(d,st,'Choose a date from today onwards.');
  var msg=cls?'Hi '+GYM.name+', I\'d like to book '+cls+'.\nName: '+n.value.trim()+'\nPhone: '+p.value.trim():'Hi '+GYM.name+', I\'d like to book a free trial'+(trialCtx&&trialCtx.who?' with '+trialCtx.who:'')+'.\nName: '+n.value.trim()+'\nPhone: '+p.value.trim()+'\nDate: '+d.value+'\nTime: '+$('#tT').value+'\nGoal: '+$('#tG').value;
  var db=DB.get();db.bookings=(db.bookings||[]);db.bookings.push((cls||'Free trial')+(cls?'':' on '+d.value+' at '+$('#tT').value));DB.set(db);
  st.className='status field--full';st.textContent='Opening WhatsApp with your details. Press send there to finish.';openUrl(waLink(msg));buzz([10,40,10])});
$$('[data-open]').forEach(function(b){b.addEventListener('click',function(e){var k=b.getAttribute('data-open');
  if(k==='trial'){trialCtx=null;openTrial(e)}else if(k==='join'){var pl=b.getAttribute('data-plan');if(pl){var o=$$('option',jsel).filter(function(x){return x.textContent.indexOf(pl)===0})[0];if(o)o.selected=true}$('#jS').textContent='';openModal('mJoin',e)}})});
$('#memBtn').addEventListener('click',function(e){portalShow();openModal('mMem',e)});
$('#jGo').addEventListener('click',function(e){var n=$('#jN'),p=$('#jP'),st=$('#jS');okf([n,p]);if(n.value.trim().length<2)return bad(n,st,'Enter your name.');if(digits(p.value).length<7)return bad(p,st,'Enter a phone number we can reach you on.');
  st.className='status field--full';st.textContent='Opening WhatsApp with your details. Press send there to finish.';openUrl(waLink('Hi '+GYM.name+', I\'d like to join.\nName: '+n.value.trim()+'\nPhone: '+p.value.trim()+'\nPlan: '+jsel.value));buzz([10,40,10])});

/* ---------- schedule ---------- */
var DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
var SCH={Monday:[['6:00 AM','Yoga','Anjali'],['7:00 AM','HIIT','Rahul'],['6:00 PM','Zumba','Priya'],['7:30 PM','Strength','Aman']],
 Tuesday:[['6:30 AM','Mobility flow','Anjali'],['7:00 AM','Strength','Aman'],['6:00 PM','HIIT','Karan'],['7:30 PM','Functional training','Sneha']],
 Wednesday:[['6:00 AM','Yoga','Anjali'],['7:00 AM','Strength','Rahul'],['6:00 PM','Zumba','Priya'],['7:30 PM','HIIT','Karan']],
 Thursday:[['6:30 AM','Mobility flow','Anjali'],['7:00 AM','HIIT','Karan'],['6:00 PM','Strength','Aman'],['7:30 PM','Functional training','Sneha']],
 Friday:[['6:00 AM','Yoga','Anjali'],['7:00 AM','Strength','Rahul'],['6:00 PM','Zumba','Priya'],['7:30 PM','HIIT','Karan']],
 Saturday:[['7:00 AM','Strength','Aman'],['8:30 AM','Yoga','Anjali'],['10:00 AM','Zumba','Priya']],
 Sunday:[['8:00 AM','Yoga','Anjali'],['9:30 AM','Mobility flow','Anjali']]};
var daySeg=$('#daySeg'),slots=$('#slots'),dayPlace=makePill(daySeg,'button',function(b){return b.classList.contains('on')}),curDay=DAYS[(new Date().getDay()+6)%7];
DAYS.forEach(function(d){var b=mk('button','');b.type='button';b.setAttribute('role','tab');b.setAttribute('data-d',d);b.textContent=d.slice(0,3);b.setAttribute('aria-label',d);b.addEventListener('click',function(){setDay(d)});daySeg.appendChild(b)});
function setDay(d){curDay=d;$$('button',daySeg).forEach(function(b){var on=b.getAttribute('data-d')===d;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')});dayPlace();slots.innerHTML='';
  (SCH[d]||[]).forEach(function(s,i){var p=s[0].split(' '),r=mk('div','slot');r.style.setProperty('--i',i);r.innerHTML='<div class="slot__t">'+p[0]+'<small>'+p[1]+'</small></div><div><h3>'+s[1]+'</h3><p>with '+s[2]+'</p></div><button class="btn btn--ghost" type="button"><span>Book</span></button>';
    $('button',r).addEventListener('click',function(e){trialCtx={cls:s[1]+' on '+d+' at '+s[0]+' with '+s[2]};openTrial(e)});slots.appendChild(r)});
  if(!(SCH[d]||[]).length)slots.appendChild(mk('div','slot slot--none','No classes today. Enjoy your rest day.'))}
setDay(curDay);

/* ---------- gallery + lightbox ---------- */
var GAL=[['equipment','Free-weight zone'],['trainers','Coach Rahul'],['events','Zumba night'],['members','Morning crew'],['equipment','Squat racks'],['events','Open day'],['trainers','Yoga studio'],['equipment','Cardio floor'],['members','Member challenge'],['events','Charity run'],['trainers','Coach Priya'],['equipment','Dumbbell wall']];
var gal=$('#gal'),galSeg=$('#galSeg'),gcats=['all','equipment','trainers','events','members'],galPlace=makePill(galSeg,'button',function(b){return b.classList.contains('on')}),gcur='all',lbList=[],lbI=0;
GAL.forEach(function(g,i){var t=mk('button','g');t.type='button';t.setAttribute('data-c',g[0]);t.setAttribute('aria-label','Open '+g[1]);t.innerHTML=art(g[0],i+1)+'<span class="g__cap">'+g[1]+'</span>';t.addEventListener('click',function(){lbList=$$('.g',gal).filter(function(x){return !x.classList.contains('is-off')});lbI=lbList.indexOf(t);lbShow();$('#lb').hidden=false;root.classList.add('no-scroll');$('#lbX').focus()});gal.appendChild(t)});
gcats.forEach(function(c){var b=mk('button',c==='all'?'on':'');b.type='button';b.setAttribute('data-f',c);b.textContent=c[0].toUpperCase()+c.slice(1);b.addEventListener('click',function(){gcur=c;$$('button',galSeg).forEach(function(x){x.classList.toggle('on',x===b)});galPlace();$$('.g',gal).forEach(function(g){g.classList.toggle('is-off',c!=='all'&&g.getAttribute('data-c')!==c)})});galSeg.appendChild(b)});
function lbShow(){var g=lbList[lbI];$('#lbS').innerHTML=g.innerHTML;$('#lbC').textContent=(lbI+1)+' / '+lbList.length}
function lbClose(){$('#lb').hidden=true;root.classList.remove('no-scroll')}
$('#lbX').addEventListener('click',lbClose);$('#lbP').addEventListener('click',function(){lbI=(lbI+lbList.length-1)%lbList.length;lbShow()});$('#lbN').addEventListener('click',function(){lbI=(lbI+1)%lbList.length;lbShow()});
document.addEventListener('keydown',function(e){if($('#lb').hidden)return;if(e.key==='Escape')lbClose();if(e.key==='ArrowLeft')$('#lbP').click();if(e.key==='ArrowRight')$('#lbN').click()});
(function(){var sx=null,lb=$('#lb');lb.addEventListener('pointerdown',function(e){sx=e.clientX});lb.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>60)(dx<0?$('#lbN'):$('#lbP')).click()})})();

/* ---------- testimonials ---------- */
var REV=[['Amazing equipment and excellent trainers!','Meera K.','Member since last year'],['I finally found a gym where I look forward to training. The coaches actually care.','Arjun P.','Strength program'],['Clean, friendly and never too crowded. The evening classes are fantastic.','Neha S.','Group classes'],['Rahul fixed my squat in two sessions. I feel stronger and safer.','Vikram D.','Personal training'],['From nervous beginner to regular. The team made it easy.','Isha R.','Pro member']];
var tt=$('#tstTrack'),td=$('#tstDots'),ti=0,tTimer=null;
REV.forEach(function(r,i){var it=mk('div','tst__item');it.innerHTML='<div class="stars" role="img" aria-label="5 out of 5 stars">'+new Array(6).join('<svg viewBox="0 0 24 24" aria-hidden="true">'+IC.star+'</svg>')+'</div><blockquote>&ldquo;'+r[0]+'&rdquo;</blockquote><div class="who"><span class="av">'+r[1][0]+'</span><div><b>'+r[1]+'</b><span>'+r[2]+'</span></div></div>';tt.appendChild(it);
  var d=mk('button');d.type='button';d.setAttribute('aria-label','Show review '+(i+1));d.innerHTML='<span></span>';d.addEventListener('click',function(){tgo(i);trestart()});td.appendChild(d)});
function tgo(i){ti=(i+REV.length)%REV.length;tt.style.transform='translateX(-'+ti*100+'%)';$$('button',td).forEach(function(b,k){b.setAttribute('aria-current',k===ti?'true':'false')})}
function trestart(){clearInterval(tTimer);if(reduce.matches)return;tTimer=setInterval(function(){if(!document.hidden)tgo(ti+1)},6000)}
tgo(0);trestart();(function(){var sx=null,box=$('#tst');box.addEventListener('pointerdown',function(e){sx=e.clientX});box.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50){tgo(ti+(dx<0?1:-1));trestart()}})})();

/* ---------- BMI ---------- */
var unit='m',uPlace=makePill($('#unitSeg'),'button',function(b){return b.classList.contains('on')});
$$('#unitSeg button').forEach(function(b){b.addEventListener('click',function(){unit=b.getAttribute('data-u');$$('#unitSeg button').forEach(function(x){x.classList.toggle('on',x===b)});uPlace();$('#bHL').textContent=unit==='m'?'Height (cm)':'Height (inches)';$('#bWL').textContent=unit==='m'?'Weight (kg)':'Weight (lb)';$('#bH').placeholder=unit==='m'?'170':'67';$('#bW').placeholder=unit==='m'?'70':'154';$('#bH').value='';$('#bW').value=''})});
$('#bCalc').addEventListener('click',function(){var h=$('#bH'),w=$('#bW'),a=$('#bA'),st=$('#bStatus');okf([h,w,a]);var hv=parseFloat(h.value),wv=parseFloat(w.value),av=parseFloat(a.value);
  if(!(hv>0))return bad(h,st,'Enter your height.');if(!(wv>0))return bad(w,st,'Enter your weight.');if(!(av>=5&&av<=110))return bad(a,st,'Enter your age (5 to 110).');
  var m=unit==='m'?hv/100:hv*.0254,kg=unit==='m'?wv:wv*.45359237;if(m<.5||m>2.6||kg<10||kg>400)return bad(h,st,'Those numbers look unusual. Please check them.');
  var bmi=kg/(m*m),cat=bmi<18.5?'Below the healthy range':bmi<25?'In the healthy range':bmi<30?'Above the healthy range':'Well above the healthy range',pos=clamp((bmi-10)/30,0,1);
  st.className='status field--full';st.textContent='';var val=$('#bVal'),t0=performance.now();(function f(n){var k=clamp((n-t0)/(reduce.matches?10:1100),0,1);val.textContent=(bmi*(1-Math.pow(1-k,3))).toFixed(1);if(k<1)requestAnimationFrame(f)})(t0);
  $('#gArc').style.transition='stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)';$('#gArc').style.strokeDashoffset=(251*(1-pos)).toFixed(1);$('#gNeedle').style.transform='rotate('+(-90+pos*180).toFixed(1)+'deg)';
  if(av<18){$('#bCat').textContent='Your BMI';$('#bRange').textContent='For people under 18, BMI is judged against age and sex growth charts, so the adult categories do not apply. Please ask a doctor.'}
  else{$('#bCat').textContent=cat;var lo=18.5*m*m,hi=24.9*m*m;$('#bRange').textContent='For your height, the adult healthy BMI range of 18.5 to 24.9 equals about '+(unit==='m'?lo.toFixed(0)+' to '+hi.toFixed(0)+' kg':(lo/.45359237).toFixed(0)+' to '+(hi/.45359237).toFixed(0)+' lb')+'. Gender is not used in the standard BMI formula.'}buzz(12)});

/* ---------- workouts ---------- */
var WK={Chest:[['Bench press',3,'chest',['Chest','Shoulders','Triceps'],['Lie back with feet flat and eyes under the bar.','Grip just wider than your shoulders and unrack with straight arms.','Lower under control to your mid-chest, then press up.','Ask a spotter to help when the weight is heavy.']],
 ['Push-ups',1,'chest',['Chest','Shoulders','Core'],['Hands under your shoulders, body in one straight line.','Lower your chest toward the floor with elbows about 45 degrees.','Press back up without letting your hips sag.','Make it easier by raising your hands on a bench.']],
 ['Dumbbell press',2,'chest',['Chest','Shoulders','Triceps'],['Sit back on a bench with a dumbbell on each thigh.','Kick the weights up and press them over your chest.','Lower until your elbows are just below the bench line.','Press up and keep your wrists stacked over your elbows.']]],
 Back:[['Pull-ups',3,'back',['Lats','Upper back','Biceps'],['Hang from the bar with hands just outside your shoulders.','Pull your shoulder blades down, then your chest toward the bar.','Lower slowly to a full hang.','Use a band or the assisted machine if you need help.']],
 ['Lat pulldown',1,'back',['Lats','Upper back','Biceps'],['Sit tall with thighs secured under the pads.','Pull the bar to your upper chest, elbows pointing down.','Squeeze your shoulder blades together at the bottom.','Return slowly without leaning back.']],
 ['Seated row',1,'back',['Mid back','Lats','Biceps'],['Sit tall with a slight bend in your knees.','Pull the handle toward your belly, elbows close to your sides.','Pause and squeeze your shoulder blades.','Extend your arms slowly without rounding forward.']]],
 Legs:[['Squats',2,'legs',['Quads','Glutes','Core'],['Stand with feet about shoulder-width apart, toes slightly out.','Brace your core and sit down and back between your hips.','Keep your chest up and knees tracking over your toes.','Drive through your whole foot to stand.']],
 ['Lunges',1,'legs',['Quads','Glutes','Hamstrings'],['Step forward and lower until both knees are around 90 degrees.','Keep your front knee over your ankle and torso tall.','Push through the front heel to return.','Hold a rail or wall for balance at first.']],
 ['Leg press',1,'legs',['Quads','Glutes','Hamstrings'],['Sit back with feet shoulder-width apart on the platform.','Release the safeties and lower until knees are about 90 degrees.','Press up without locking your knees.','Keep your lower back on the pad.']]]};
var wkSeg=$('#wkSeg'),wkBox=$('#wk'),wkPlace=makePill(wkSeg,'button',function(b){return b.classList.contains('on')});
Object.keys(WK).forEach(function(g,i){var b=mk('button',i?'':'on');b.type='button';b.setAttribute('role','tab');b.textContent=g;b.addEventListener('click',function(){wkSet(g)});wkSeg.appendChild(b)});
function wkSet(g){$$('button',wkSeg).forEach(function(b){b.classList.toggle('on',b.textContent===g);b.setAttribute('aria-selected',b.textContent===g?'true':'false')});wkPlace();wkBox.innerHTML='';
  WK[g].forEach(function(e,i){var c=mk('article','ex');c.style.setProperty('--i',i);var lv=['Beginner','Intermediate','Advanced'][e[1]-1];
    c.innerHTML='<button class="ex__h" type="button" aria-expanded="false"><div class="ex__top"><span class="ex__ico">'+ic(IC[e[2]])+'</span><span class="lvl" role="img" aria-label="'+lv+'">'+[1,2,3].map(function(n){return '<i class="'+(n<=e[1]?'on':'')+'"></i>'}).join('')+'</span></div><h3>'+e[0]+'</h3><span style="font-size:.88rem;color:var(--ink3)">'+lv+'</span></button><div class="ex__b"><div><div class="ex__in"><ul class="tags">'+e[3].map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul><ol>'+e[4].map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol></div></div></div>';
    var h=$('.ex__h',c);h.addEventListener('click',function(){var o=!c.classList.contains('open');c.classList.toggle('open',o);h.setAttribute('aria-expanded',o?'true':'false')});wkBox.appendChild(c)})}
wkSet('Chest');

/* ---------- nutrition (3D flip) ---------- */
var NUT=[['Protein','protein','Builds and repairs muscle',['Include a protein source in most meals.','Eggs, dairy, lentils, tofu, fish and meat all count.','Spreading it across the day is an easy way to start.']],
 ['Hydration','water','Water powers every rep',['Sip water through the day, not only during workouts.','Pale yellow urine is a handy rough guide.','Drink more when it is hot or you sweat heavily.']],
 ['Balanced meals','plate','A little of everything',['Mix protein, carbs, healthy fats and vegetables.','Fill about half your plate with vegetables and fruit.','Eat slowly and stop when you are comfortably full.']],
 ['Pre-workout','pre','Fuel before you train',['A light meal 1 to 3 hours before works for most people.','Choose carbs that are easy to digest.','Avoid trying new foods on a hard training day.']],
 ['Post-workout','post','Recover and rebuild',['Pair protein with carbs after training.','Eat within a few hours. There is no need to rush.','Rehydrate and get a good night of sleep.']]];
var nut=$('#nut');NUT.forEach(function(n,i){var f=mk('div','flip rv');f.tabIndex=0;f.setAttribute('role','button');f.setAttribute('aria-pressed','false');f.setAttribute('aria-label',n[0]+'. Tap to flip.');f.style.transitionDelay=i*70+'ms';
  f.innerHTML='<div class="flip__in"><div class="flip__f">'+ic(IC[n[1]])+'<div><h3>'+n[0]+'</h3><small>'+n[2]+'</small></div></div><div class="flip__b"><h3>'+n[0]+'</h3><ul style="display:grid;gap:.45rem">'+n[3].map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></div></div>';
  var tg=function(){var o=!f.classList.contains('on');f.classList.toggle('on',o);f.setAttribute('aria-pressed',o?'true':'false');buzz(8)};f.addEventListener('click',tg);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tg()}});nut.appendChild(f)});
revEls=$$('.rv:not(.in)');if('IntersectionObserver' in window&&!reduce.matches){var rio2=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');rio2.unobserve(en.target)}})},{threshold:.1,rootMargin:'0px 0px -5% 0px'});revEls.forEach(function(e){rio2.observe(e)})}else revEls.forEach(function(e){e.classList.add('in')});

/* ---------- contact form ---------- */
function ctMsg(){var n=$('#cN'),p=$('#cP'),m=$('#cM'),st=$('#cStatus');okf([n,p,m]);if(n.value.trim().length<2){bad(n,st,'Enter your name.');return null}if(digits(p.value).length<7){bad(p,st,'Enter a phone number we can reach you on.');return null}if(m.value.trim().length<3){bad(m,st,'Tell us how we can help.');return null}
  return 'Hi '+GYM.name+',\n'+m.value.trim()+'\n\nName: '+n.value.trim()+'\nPhone: '+p.value.trim()}
$('#cWa').addEventListener('click',function(){var t=ctMsg();if(!t)return;$('#cStatus').className='status field--full';$('#cStatus').textContent='Opening WhatsApp with your message. Press send there to finish.';openUrl(waLink(t))});
$('#cMail').addEventListener('click',function(){var t=ctMsg();if(!t)return;$('#cStatus').className='status field--full';$('#cStatus').textContent='Opening your email app. Press send there to finish.';location.href='mailto:'+GYM.email+'?subject='+encodeURIComponent('Enquiry from the website')+'&body='+encodeURIComponent(t)});
['trForm','jnForm','bmiForm','ctForm','lgForm'].forEach(function(id){$('#'+id).addEventListener('submit',function(e){e.preventDefault()})});

/* ---------- member portal (demo, stored in this browser) ---------- */
function portalShow(){var d=DB.get();if(d.name)renderDash(d);else{$('#pLogin').hidden=false;$('#pDash').hidden=true}}
$('#lGo').addEventListener('click',function(){var n=$('#lN'),p=$('#lP'),st=$('#lS');okf([n,p]);if(n.value.trim().length<2)return bad(n,st,'Enter your name.');if(digits(p.value).length<7)return bad(p,st,'Enter a phone number.');
  var d=DB.get();d.name=n.value.trim();d.phone=p.value.trim();d.plan=d.plan||'Pro';d.start=d.start||new Date().toISOString();d.checkins=d.checkins||[];DB.set(d);renderDash(d);buzz(12)});
function renderDash(d){$('#pLogin').hidden=true;var pd=$('#pDash');pd.hidden=false;var plan=PLANS.filter(function(p){return p.n===d.plan})[0]||PLANS[1],days={Basic:30,Pro:90,Elite:365}[plan.n],exp=new Date(new Date(d.start).getTime()+days*864e5),now=new Date(),y=now.getFullYear(),mo=now.getMonth(),dim=new Date(y,mo+1,0).getDate(),first=(new Date(y,mo,1).getDay()+6)%7,today=iso(now),cells='';
  for(var i=0;i<first;i++)cells+='<i style="background:none"></i>';for(var k=1;k<=dim;k++){var ds=y+'-'+('0'+(mo+1)).slice(-2)+'-'+('0'+k).slice(-2);cells+='<i class="'+((d.checkins||[]).indexOf(ds)>-1?'on ':'')+(ds===today?'today':'')+'">'+k+'</i>'}
  var here=(d.checkins||[]).indexOf(today)>-1,bk=(d.bookings||[]).slice(-4).reverse();
  pd.innerHTML='<h3>Welcome back, '+esc(d.name.split(' ')[0])+'</h3><p class="note" style="margin-top:.3rem">Demo dashboard. Your details stay in this browser only.</p><div class="mem"><div class="mem__row"><div class="mem__c"><small>Membership</small><b>'+plan.n+' ('+plan.d+')</b></div><div class="mem__c"><small>Status</small><b>Active</b></div></div><div class="mem__row"><div class="mem__c"><small>Expires on</small><b>'+exp.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+'</b></div><div class="mem__c"><small>Your trainer</small><b>Rahul Sharma</b></div></div>'+
  '<div class="mem__c"><small>Attendance this month ('+(d.checkins||[]).filter(function(x){return x.slice(0,7)===today.slice(0,7)}).length+' visits)</small><div class="cal" style="margin:.7rem 0">'+cells+'</div><button class="btn '+(here?'btn--ghost':'btn--fill')+'" type="button" id="chk" '+(here?'disabled':'')+'><span>'+(here?'Present today':'Check in today')+'</span></button></div>'+
  '<div class="mem__c"><small>Your workout plan</small><ul style="display:grid;gap:.35rem;margin-top:.4rem"><li><b>Mon</b> Upper body strength</li><li><b>Wed</b> Lower body and core</li><li><b>Fri</b> Full-body conditioning</li></ul></div>'+
  '<div class="mem__c"><small>Class bookings</small><ul style="display:grid;gap:.35rem;margin-top:.4rem">'+(bk.length?bk.map(function(b){return '<li>'+esc(b)+'</li>'}).join(''):'<li>No bookings yet. Book one from the schedule.</li>')+'</ul></div>'+
  '<div class="mem__c"><small>Announcements</small><ul style="display:grid;gap:.35rem;margin-top:.4rem">'+NOTES.map(function(n){return '<li>'+esc(n)+'</li>'}).join('')+'</ul></div><button class="btn btn--ghost" type="button" id="lgOut"><span>Log out</span></button></div>';
  var c=$('#chk');if(c)c.addEventListener('click',function(){var db=DB.get();db.checkins=db.checkins||[];if(db.checkins.indexOf(today)<0)db.checkins.push(today);DB.set(db);renderDash(db);toast('Checked in. See you on the floor!');buzz([10,30,10])});
  $('#lgOut').addEventListener('click',function(){var db=DB.get();delete db.name;delete db.phone;DB.set(db);$('#pLogin').hidden=false;$('#pDash').hidden=true;$('#lN').value='';$('#lP').value=''})}

/* ---------- assistant (demo, ready-made answers) ---------- */
var RULES=[[/injur|pain|hurt|doctor|medical|pregnan|condition/,'If you have pain, an injury, a medical condition or you are pregnant, please check with a doctor before training. Tell our coaches too, so they can adjust your plan.'],
 [/strength|stronger|muscle|bulk|gain/,'For strength, build your week around a few compound lifts (squat, hinge, press, row and pull) two to four days a week. Add weight gradually, leave one or two reps in the tank, and sleep well. A coach here can write you a program, and the free trial is a good first step.'],
 [/fat|lose|slim|cut|belly|weight loss/,'Fat loss comes mostly from a modest, steady calorie deficit you can keep up. Combine two or three strength sessions a week with walking or cardio, keep protein in your meals, and aim for gradual change rather than crash diets.'],
 [/begin|new|first|start|never|nervous/,'Welcome! Start with two or three full-body sessions a week, learn the basic movements with a coach, and keep the weights light while you learn. Book a free trial and we will show you around.'],
 [/price|plan|member|cost|fee|join/,'We have three plans: Basic (1 month), Pro (3 months, the most popular) and Elite (12 months). See Membership on this page, or tap Join Now.'],
 [/time|hour|open|close|timing/,'Our hours: '+GYM.hours],
 [/class|yoga|zumba|hiit|schedule/,'Group classes run through the week, from yoga and HIIT to Zumba and strength. Open the Class schedule section, pick a day and tap Book.'],
 [/bmi/,'Try the BMI calculator on this page. It is a screening number only, not a diagnosis.'],
 [/diet|food|eat|protein|nutrition|water|meal/,'See the Nutrition basics cards. In short: protein with meals, plenty of water and mostly whole foods. For a personal plan, please see a qualified dietitian.'],
 [/contact|phone|call|whatsapp|address|where|location/,'You can call '+GYM.phone+' or message us on WhatsApp. We are at '+GYM.address+'.']];
var aiP=$('#aiP'),aiBtn=$('#aiBtn'),aiM=$('#aiM');
function aiSay(t,me){var m=mk('div','msg'+(me?' me':''));m.textContent=t;aiM.appendChild(m);aiM.scrollTop=aiM.scrollHeight}
function aiAsk(q){aiSay(q,true);var a="I can help with training goals, plans, timings and classes. Try asking about strength, fat loss, beginners or membership. For anything else, message us on WhatsApp.";for(var i=0;i<RULES.length;i++){if(RULES[i][0].test(q.toLowerCase())){a=RULES[i][1];break}}setTimeout(function(){aiSay(a)},350)}
aiSay('Hi! I am the demo fitness assistant. Ask me about training, plans, classes or timings.');
['Improve my strength','Lose fat','I am a beginner','Plans and prices','Timings'].forEach(function(q){var b=mk('button','',q);b.type='button';b.addEventListener('click',function(){aiAsk(q)});$('#aiQ').appendChild(b)});
aiBtn.addEventListener('click',function(){var o=!aiP.classList.contains('open');aiP.classList.toggle('open',o);aiBtn.setAttribute('aria-expanded',o?'true':'false');if(o)setTimeout(function(){$('#aiI').focus()},300)});
$('#aiF').addEventListener('submit',function(e){e.preventDefault();var v=$('#aiI').value.trim();if(!v)return;$('#aiI').value='';aiAsk(v)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&aiP.classList.contains('open')&&!openMod){aiP.classList.remove('open');aiBtn.setAttribute('aria-expanded','false');aiBtn.focus()}});
placePills();setTimeout(placePills,400);

})();
