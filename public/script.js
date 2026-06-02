(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce)document.body.classList.add('reduce');
  var slides=[].slice.call(document.querySelectorAll('.slide'));
  var total=slides.length, cur=0;
  var bar=document.getElementById('bar'),counter=document.getElementById('counter'),crumb=document.getElementById('crumb');
  var meta=[['Portada','Presentación','Ecuaciones diferenciales · Grupo E194'],
    ['EDO','Punto de partida','¿Qué son las ecuaciones diferenciales?'],
    ['Redes','El protagonista','¿Qué son las redes neuronales?'],
    ['Gradiente','La brújula','¿Qué es el vector gradiente?'],
    ['Conexión','Se conectan','Cuando los tres se encuentran'],
    ['EDO del aprendizaje','El cierre','El aprendizaje es una ecuación diferencial'],
    ['Práctica','En acción','Una EDO que aprende sola']];

  /* side nav + dots + overview */
  var side=document.getElementById('sidenav'),dotsBox=document.getElementById('dots'),ovgrid=document.getElementById('ovgrid');
  meta.forEach(function(m,i){
    var b=document.createElement('button');b.innerHTML='<span class="n">0'+(i+1)+'</span><span class="bar"></span><span class="lbl">'+m[0]+'</span>';
    b.onclick=function(){go(i)};side.appendChild(b);
    var d=document.createElement('button');d.onclick=function(){go(i)};dotsBox.appendChild(d);
    var c=document.createElement('button');c.className='ovcard';
    c.innerHTML='<div class="num">0'+(i+1)+'</div><div class="k">'+m[1]+'</div><div class="ti">'+m[2]+'</div>';
    c.onclick=function(){go(i);closeOverlays()};ovgrid.appendChild(c);
  });
  var sideBtns=[].slice.call(side.children),dots=[].slice.call(dotsBox.children);
  function pad(n){return (n<9?'0':'')+(n+1)}

  function go(n){
    n=Math.max(0,Math.min(total-1,n));var t=slides[n];
    slides.forEach(function(s){s.classList.remove('active')});
    void t.offsetWidth;t.classList.add('active');cur=n;
    bar.style.width=((n+1)/total*100)+'%';counter.textContent=pad(n)+' / '+pad(total-1);
    if(crumb)crumb.innerHTML='0'+(n+1)+' · <b>'+meta[n][0]+'</b>';
    t.scrollTop=0;
    dots.forEach(function(d,k){d.classList.toggle('on',k===n)});
    sideBtns.forEach(function(b,k){b.classList.toggle('on',k===n);b.setAttribute('aria-current',k===n?'true':'false')});
    slides.forEach(function(s,k){s.setAttribute('aria-hidden',k===n?'false':'true')});
    setTimeout(function(){activate(n)},reduce?0:120);
  }
  function activate(n){ if(n===0)drawCover(); else if(n===1)drawDirField(); else if(n===2)drawNeuron(); else if(n===3)drawGrad(); else if(n===6)drawSim(); }
  function redrawCurrent(){activate(cur)}

  document.getElementById('next').onclick=function(){go(cur+1)};
  document.getElementById('prev').onclick=function(){go(cur-1)};
  var ovOverlay=document.getElementById('ovOverlay'),helpOverlay=document.getElementById('helpOverlay');
  function overlayOpen(){return ovOverlay.classList.contains('show')||helpOverlay.classList.contains('show')}
  function closeOverlays(){ovOverlay.classList.remove('show');helpOverlay.classList.remove('show')}
  function toggleOverview(){helpOverlay.classList.remove('show');ovOverlay.classList.toggle('show')}
  function toggleHelp(){ovOverlay.classList.remove('show');helpOverlay.classList.toggle('show')}
  document.getElementById('ovBtn').onclick=toggleOverview;
  document.getElementById('helpBtn').onclick=toggleHelp;
  document.getElementById('ovCloseX').onclick=closeOverlays;document.getElementById('helpCloseX').onclick=closeOverlays;
  document.getElementById('fsBtn').onclick=toggleFs;
  function toggleFs(){var el=document.documentElement;
    if(!document.fullscreenElement){if(el.requestFullscreen)el.requestFullscreen();}
    else if(document.exitFullscreen){document.exitFullscreen();}}
  document.getElementById('themeBtn').onclick=toggleTheme;
  function toggleTheme(){var r=document.documentElement;r.setAttribute('data-theme',r.getAttribute('data-theme')==='dark'?'light':'dark');
    document.querySelector('meta[name=theme-color]').setAttribute('content',getComputedStyle(r).getPropertyValue('--ink').trim());
    setTimeout(redrawCurrent,60)}

  document.addEventListener('keydown',function(e){
    if(['ArrowRight','ArrowDown',' ','PageDown'].indexOf(e.key)>=0){e.preventDefault();go(cur+1)}
    else if(['ArrowLeft','ArrowUp','PageUp'].indexOf(e.key)>=0){e.preventDefault();go(cur-1)}
    else if(e.key==='Home')go(0);else if(e.key==='End')go(total-1);
    else if(e.key.toLowerCase()==='o')toggleOverview();
    else if(e.key.toLowerCase()==='t')toggleTheme();
    else if(e.key.toLowerCase()==='f')toggleFs();
    else if(e.key==='?')toggleHelp();
    else if(e.key==='Escape')closeOverlays();
    else if(/^[1-6]$/.test(e.key))go(+e.key-1);
  });
  var sx=0,sy=0,stEl=null;
  document.addEventListener('touchstart',function(e){var t=e.changedTouches[0];sx=t.clientX;sy=t.clientY;stEl=e.target},{passive:true});
  document.addEventListener('touchend',function(e){
    if(stEl&&stEl.closest&&stEl.closest('input,button,.seg,.overlay'))return;
    var t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3){dx<0?go(cur+1):go(cur-1)}
  },{passive:true});

  /* ---------- shared canvas helpers ---------- */
  var DPR=Math.min(2,window.devicePixelRatio||1);
  function fit(cv){var W=cv.clientWidth||360,H=cv.clientHeight||240;cv.width=W*DPR;cv.height=H*DPR;
    var c=cv.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);return {c:c,W:W,H:H}}
  function pal(){var s=getComputedStyle(document.documentElement);
    return {amber:s.getPropertyValue('--amber').trim(),cyan:s.getPropertyValue('--cyan').trim(),
      paper:s.getPropertyValue('--paper').trim(),muted:s.getPropertyValue('--muted').trim(),
      grid:s.getPropertyValue('--grid').trim(),axis:s.getPropertyValue('--axis').trim(),violet:s.getPropertyValue('--violet').trim()}}

  /* ---------- slide 0: animated phase-portrait cover ---------- */
  var coverCtx,coverW,coverH,coverScale,coverCx,coverCy,coverParts=[],coverRAF=0;
  function coverFit(){var cv=document.getElementById('cCover');if(!cv)return false;
    var o=fit(cv);coverCtx=o.c;coverW=o.W;coverH=o.H;coverScale=Math.min(coverW,coverH)/7;
    coverCx=coverW*0.5;coverCy=coverH*0.5;return true}
  function coverSpawn(){var a=Math.random()*6.283,r=2.4+Math.random()*0.8;
    return {x:Math.cos(a)*r,y:Math.sin(a)*r,trail:[],ck:Math.random()<0.5?'amber':'cyan'}}
  function coverInit(){coverParts=[];for(var i=0;i<14;i++)coverParts.push(coverSpawn())}
  function coverAdvance(q){var dt=0.05,dx=(-0.3*q.x-q.y)*dt,dy=(q.x-0.3*q.y)*dt;q.x+=dx;q.y+=dy;
    q.trail.push([coverCx+q.x*coverScale,coverCy-q.y*coverScale]);if(q.trail.length>38)q.trail.shift();
    if(q.x*q.x+q.y*q.y<0.02){var s=coverSpawn();q.x=s.x;q.y=s.y;q.trail=[];q.ck=s.ck}}
  function coverRender(){var c=coverCtx,p=pal();c.clearRect(0,0,coverW,coverH);
    c.strokeStyle=p.grid;c.lineWidth=1;c.beginPath();c.moveTo(0,coverCy);c.lineTo(coverW,coverCy);
    c.moveTo(coverCx,0);c.lineTo(coverCx,coverH);c.stroke();
    for(var k=0;k<coverParts.length;k++){var q=coverParts[k],col=p[q.ck];c.lineWidth=1.8;
      for(var i=1;i<q.trail.length;i++){c.strokeStyle=col;c.globalAlpha=(i/q.trail.length)*0.85;
        c.beginPath();c.moveTo(q.trail[i-1][0],q.trail[i-1][1]);c.lineTo(q.trail[i][0],q.trail[i][1]);c.stroke()}
      var h=q.trail[q.trail.length-1];if(h){c.globalAlpha=1;c.fillStyle=col;c.beginPath();c.arc(h[0],h[1],2.6,0,7);c.fill()}}
    c.globalAlpha=.5;c.fillStyle=p.paper;c.beginPath();c.arc(coverCx,coverCy,3,0,7);c.fill();c.globalAlpha=1}
  function coverFrame(){if(cur!==0){coverRAF=0;return}
    if(!document.hidden&&!overlayOpen()){for(var k=0;k<coverParts.length;k++)coverAdvance(coverParts[k]);coverRender()}
    coverRAF=requestAnimationFrame(coverFrame)}
  function drawCover(){if(!coverFit())return;if(!coverParts.length)coverInit();
    if(reduce){coverInit();for(var s=0;s<70;s++)for(var k=0;k<coverParts.length;k++)coverAdvance(coverParts[k]);coverRender();return}
    if(!coverRAF)coverFrame()}

  /* ---------- slide 1: direction field dy/dt=-y ---------- */
  function drawDirField(){
    var cv=document.getElementById('cField');if(!cv)return;var o=fit(cv),c=o.c,W=o.W,H=o.H,p=pal();
    var mL=34,mB=26,pw=W-mL-14,ph=H-mB-12;
    function X(t){return mL+t/3*pw} function Y(y){return 12+(1-(y+1.2)/3.4)*ph}
    c.clearRect(0,0,W,H);
    c.strokeStyle=p.axis;c.lineWidth=1;c.beginPath();c.moveTo(mL,Y(0));c.lineTo(mL+pw,Y(0));c.stroke();
    c.strokeStyle=p.muted;c.globalAlpha=.55;c.lineWidth=1;
    for(var i=0;i<=8;i++){for(var j=0;j<=6;j++){
      var t=i/8*3, y=-1+j/6*2.6, slope=-y, ang=Math.atan2(slope,1), L=9;
      var x0=X(t),y0=Y(y);c.beginPath();c.moveTo(x0-Math.cos(ang)*L,y0+Math.sin(ang)*L);
      c.lineTo(x0+Math.cos(ang)*L,y0-Math.sin(ang)*L);c.stroke();}}
    c.globalAlpha=1;c.strokeStyle=p.cyan;c.lineWidth=2.4;c.beginPath();
    for(var t=0;t<=3.001;t+=0.03){var y=2*Math.exp(-t);var px=X(t),py=Y(y);t===0?c.moveTo(px,py):c.lineTo(px,py)}c.stroke();
    c.fillStyle=p.amber;c.beginPath();c.arc(X(0),Y(2),4,0,7);c.fill();
  }

  /* ---------- slide 2: neuron line fit ---------- */
  var dataX=[1,2,3,4,5,6,7,8],dataY=[1.7,2.8,4.9,5.6,7.9,8.6,10.9,11.7];
  var wNow=0.5,nAnim=null;
  function mse(w){var s=0;for(var i=0;i<dataX.length;i++){var e=w*dataX[i]-dataY[i];s+=e*e}return s/dataX.length}
  function drawNeuron(){
    var cv=document.getElementById('cNeuron');if(!cv)return;var o=fit(cv),c=o.c,W=o.W,H=o.H,p=pal();
    var mL=20,mB=24,pw=W-mL-14,ph=H-mB-12,xm=9,ym=13;
    function X(x){return mL+x/xm*pw} function Y(y){return 12+(1-y/ym)*ph}
    c.clearRect(0,0,W,H);
    c.strokeStyle=p.grid;c.lineWidth=1;for(var g=0;g<=ym;g+=3){c.beginPath();c.moveTo(mL,Y(g));c.lineTo(mL+pw,Y(g));c.stroke()}
    c.strokeStyle=p.axis;c.beginPath();c.moveTo(mL,Y(0));c.lineTo(mL+pw,Y(0));c.stroke();
    c.strokeStyle=p.muted;c.globalAlpha=.7;c.lineWidth=1.4;
    for(var i=0;i<dataX.length;i++){c.beginPath();c.moveTo(X(dataX[i]),Y(dataY[i]));c.lineTo(X(dataX[i]),Y(wNow*dataX[i]));c.stroke()}
    c.globalAlpha=1;c.strokeStyle=p.amber;c.lineWidth=2.4;c.beginPath();c.moveTo(X(0),Y(0));c.lineTo(X(xm),Y(wNow*xm));c.stroke();
    c.fillStyle=p.cyan;for(var i=0;i<dataX.length;i++){c.beginPath();c.arc(X(dataX[i]),Y(dataY[i]),4,0,7);c.fill()}
    var mv=document.getElementById('mseVal');if(mv)mv.textContent=mse(wNow).toFixed(2);
    var wv=document.getElementById('wVal');if(wv)wv.textContent=wNow.toFixed(2);
    var wr=document.getElementById('wRange');if(wr&&Math.abs(+wr.value-wNow)>0.001)wr.value=wNow;
  }
  document.getElementById('wRange').addEventListener('input',function(e){if(nAnim){cancelAnimationFrame(nAnim);nAnim=null}wNow=+e.target.value;drawNeuron()});
  document.getElementById('nResetBtn').onclick=function(){if(nAnim){cancelAnimationFrame(nAnim);nAnim=null}wNow=0.5;drawNeuron()};
  document.getElementById('trainBtn').onclick=function(){
    if(nAnim){cancelAnimationFrame(nAnim);nAnim=null;return}
    function loop(){var grad=0;for(var i=0;i<dataX.length;i++)grad+=2*dataX[i]*(wNow*dataX[i]-dataY[i]);grad/=dataX.length;
      wNow-=0.0016*grad;drawNeuron();if(Math.abs(grad)>0.05)nAnim=requestAnimationFrame(loop);else nAnim=null}
    loop();
  };

  /* ---------- slide 3: gradient on parabola ---------- */
  var thNow=2.2,gAnim=null;
  function drawGrad(){
    var cv=document.getElementById('cGrad');if(!cv)return;var o=fit(cv),c=o.c,W=o.W,H=o.H,p=pal();
    var mL=16,mB=22,pw=W-mL-14,ph=H-mB-12,xr=3.2,ymax=10;
    function X(x){return mL+(x+xr)/(2*xr)*pw} function Y(y){return 12+(1-y/ymax)*ph}
    c.clearRect(0,0,W,H);
    c.strokeStyle=p.axis;c.lineWidth=1;c.beginPath();c.moveTo(X(0),12);c.lineTo(X(0),Y(0));c.moveTo(mL,Y(0));c.lineTo(mL+pw,Y(0));c.stroke();
    c.strokeStyle=p.cyan;c.lineWidth=2.4;c.beginPath();
    for(var x=-xr;x<=xr;x+=0.04){var px=X(x),py=Y(x*x);x===-xr?c.moveTo(px,py):c.lineTo(px,py)}c.stroke();
    var L=thNow*thNow,g=2*thNow;
    c.strokeStyle=p.muted;c.lineWidth=1.5;c.setLineDash([4,3]);var dx=1;
    c.beginPath();c.moveTo(X(thNow-dx),Y(L-g*dx));c.lineTo(X(thNow+dx),Y(L+g*dx));c.stroke();c.setLineDash([]);
    var ax=Math.sign(-g)||1;
    c.strokeStyle=p.amber;c.lineWidth=2.6;c.beginPath();c.moveTo(X(thNow),Y(L)+0);c.lineTo(X(thNow+ax*0.9),Y(L));c.stroke();
    var hx=X(thNow+ax*0.9),hy=Y(L);c.fillStyle=p.amber;c.beginPath();c.moveTo(hx,hy);c.lineTo(hx-ax*8,hy-5);c.lineTo(hx-ax*8,hy+5);c.fill();
    c.fillStyle=p.amber;c.beginPath();c.arc(X(thNow),Y(L),5,0,7);c.fill();
    c.strokeStyle=p.paper;c.lineWidth=1.5;c.stroke();
    var s=document.getElementById('gLVal');if(s)s.textContent=L.toFixed(2);
    document.getElementById('gGVal').textContent=g.toFixed(2);
    document.getElementById('gDVal').textContent=(-g).toFixed(2);
    var tv=document.getElementById('thVal');if(tv)tv.textContent=thNow.toFixed(2);
    var tr=document.getElementById('thRange');if(tr&&Math.abs(+tr.value-thNow)>0.001)tr.value=thNow.toFixed(2);
  }
  document.getElementById('thRange').addEventListener('input',function(e){if(gAnim){cancelAnimationFrame(gAnim);gAnim=null}thNow=+e.target.value;drawGrad()});
  document.getElementById('rollBtn').onclick=function(){
    if(gAnim){cancelAnimationFrame(gAnim);gAnim=null;return}
    function loop(){thNow-=0.08*(2*thNow);drawGrad();if(Math.abs(thNow)>0.02)gAnim=requestAnimationFrame(loop);else{thNow=0;drawGrad();gAnim=null}}loop();
  };

  /* ---------- slide 6: GD vs Euler simulator ---------- */
  var lossIdx=0,eta=0.3,th0=2,revealed=0,playTimer=null,N=24;
  function lmin(){return lossIdx===0?0:5}
  function disc(n){return lmin()+(th0-lmin())*Math.pow(1-2*eta,n)}
  function exact(n){return lmin()+(th0-lmin())*Math.exp(-2*n*eta)}
  function drawSim(){
    var cv=document.getElementById('cSim');if(!cv)return;var o=fit(cv),c=o.c,W=o.W,H=o.H,p=pal();
    var mL=40,mB=30,pw=W-mL-14,ph=H-mB-12;
    var mn=lmin(),vals=[Math.abs(th0-mn)];for(var n=0;n<=N;n++){var d=disc(n);if(isFinite(d))vals.push(Math.abs(d-mn))}
    var span=Math.min(Math.max.apply(null,vals)*1.15,Math.abs(th0-mn)*4+1);if(span<1)span=1;
    var yLo=mn-span,yHi=mn+span;
    function X(n){return mL+n/N*pw} function Y(v){return 12+(1-(v-yLo)/(yHi-yLo))*ph}
    c.clearRect(0,0,W,H);
    c.strokeStyle=p.grid;c.lineWidth=1;c.font="11px 'JetBrains Mono',monospace";c.fillStyle=p.muted;c.textAlign='right';
    for(var k=0;k<=4;k++){var v=yLo+(yHi-yLo)*k/4;var yy=Y(v);c.beginPath();c.moveTo(mL,yy);c.lineTo(mL+pw,yy);c.stroke();c.fillText(v.toFixed(1),mL-6,yy+4)}
    c.strokeStyle=p.axis;c.lineWidth=1.2;c.beginPath();var y0=Y(mn);c.moveTo(mL,y0);c.lineTo(mL+pw,y0);c.stroke();
    c.textAlign='center';c.fillStyle=p.muted;c.fillText('iteración n  (t = n·η)',mL+pw/2,H-6);
    c.strokeStyle=p.cyan;c.lineWidth=2.4;c.beginPath();var first=true;
    for(var n=0;n<=N;n+=0.25){var px=X(n),py=Y(exact(n));first?(c.moveTo(px,py),first=false):c.lineTo(px,py)}c.stroke();
    c.setLineDash([5,4]);c.strokeStyle=p.amber;c.lineWidth=1.5;c.beginPath();
    for(var n=0;n<=revealed;n++){var d=disc(n);var px=X(n),py=Y(Math.max(yLo,Math.min(yHi,d)));n===0?c.moveTo(px,py):c.lineTo(px,py)}c.stroke();c.setLineDash([]);
    for(var n=0;n<=revealed;n++){var d=disc(n);if(d<yLo||d>yHi)continue;c.fillStyle=p.amber;c.beginPath();c.arc(X(n),Y(d),3.8,0,7);c.fill()}
    var f=1-2*eta;
    document.getElementById('sNVal').textContent=revealed;
    document.getElementById('sThVal').textContent=disc(revealed).toFixed(3);
    document.getElementById('sFVal').textContent=f.toFixed(2);
    document.getElementById('etaVal').textContent=eta.toFixed(2);
    document.getElementById('t0Val').textContent=th0.toFixed(1);
    var bd=document.getElementById('stabBadge'),cls='ok',txt='convergencia monótona';
    if(eta>1){cls='bad';txt='diverge · |1−2η|>1'} else if(Math.abs(eta-1)<0.02){cls='bad';txt='oscila sin converger'}
    else if(eta>0.5){cls='warn';txt='oscila y converge'} else if(Math.abs(eta-0.5)<0.02){cls='warn';txt='óptimo · 1 paso'}
    bd.className='badge '+cls;bd.textContent=txt;
  }
  function recompute(reset){if(playTimer){clearInterval(playTimer);playTimer=null}if(reset)revealed=N;drawSim()}
  document.getElementById('etaRange').addEventListener('input',function(e){eta=+e.target.value;recompute(true)});
  document.getElementById('t0Range').addEventListener('input',function(e){th0=+e.target.value;recompute(true)});
  [].slice.call(document.querySelectorAll('#lossSeg button')).forEach(function(b){b.onclick=function(){
    document.querySelectorAll('#lossSeg button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');
    lossIdx=+b.dataset.l;recompute(true)}});
  document.getElementById('stepBtn').onclick=function(){if(playTimer){clearInterval(playTimer);playTimer=null}if(revealed<N)revealed++;drawSim()};
  document.getElementById('simReset').onclick=function(){revealed=0;recompute(false)};
  document.getElementById('playBtn').onclick=function(){
    if(playTimer){clearInterval(playTimer);playTimer=null;return}
    revealed=0;drawSim();playTimer=setInterval(function(){revealed++;drawSim();if(revealed>=N){clearInterval(playTimer);playTimer=null}},320);
  };

  /* ---------- background gradient-descent field ---------- */
  var fc=document.getElementById('field'),fx=fc.getContext('2d'),FW,FH,parts=[];
  function rs(){FW=fc.width=innerWidth*DPR;FH=fc.height=innerHeight*DPR;fc.style.width=innerWidth+'px';fc.style.height=innerHeight+'px'}
  function sp(){return {x:Math.random()*FW,y:Math.random()*FH,vx:0,vy:0,life:Math.random()}}
  var glyphs=["dθ/dt = −∇L(θ)","θ(t) = θ₀e⁻²ᵗ","∇L = 2θ","L(θ) = θ²","y = w·x",
    "wₙ₊₁ = wₙ − η∇L","dy/dt = f(y,t)","∂L/∂θ","θₙ₊₁ = (1−2η)θₙ","e⁻²ᵗ","min L(θ)",
    "η","∇","∂","Σ","θ → 0","2.00  1.60  1.28  1.02  0.82","∫","≈ 0"];
  var tokens=[];
  function iniTokens(){tokens=[];var nn=Math.max(12,Math.round(innerWidth/90));
    for(var i=0;i<nn;i++){var sz=13+Math.random()*Math.random()*32,r=Math.random();
      tokens.push({text:glyphs[(Math.random()*glyphs.length)|0],x:Math.random()*FW,y:Math.random()*FH,
        vx:(Math.random()-0.5)*0.3*DPR,vy:(Math.random()-0.5)*0.3*DPR,size:sz*DPR,
        ph:Math.random()*6.283,sp:0.004+Math.random()*0.006,
        ck:r<0.72?'muted':(r<0.86?'amber':'cyan'),base:0.14-(sz/45)*0.075});}}
  function drawTokens(p){fx.textBaseline='middle';
    for(var i=0;i<tokens.length;i++){var t=tokens[i];t.x+=t.vx;t.y+=t.vy;t.ph+=t.sp;
      if(t.w===undefined){fx.font=t.size+"px 'JetBrains Mono',monospace";t.w=fx.measureText(t.text).width}
      if(t.x>FW+12)t.x=-t.w-12;else if(t.x<-t.w-12)t.x=FW+12;
      if(t.y>FH+12)t.y=-12;else if(t.y<-12)t.y=FH+12;
      var a=t.base*(0.5+0.5*Math.sin(t.ph));if(t.ck!=='muted')a*=1.2;
      fx.globalAlpha=a;fx.fillStyle=p[t.ck];fx.font=t.size+"px 'JetBrains Mono',monospace";
      fx.fillText(t.text,t.x,t.y);}
    fx.globalAlpha=1;}
  function ini(){parts=[];var np=innerWidth<760?42:80;for(var i=0;i<np;i++)parts.push(sp());iniTokens();}
  rs();ini();window.addEventListener('resize',function(){rs();ini();fitAll()});
  function fitAll(){activate(cur)}
  function fdraw(){fx.clearRect(0,0,FW,FH);var bx=FW*0.74,by=FH*0.5;var p=pal();
    for(var i=0;i<parts.length;i++){var q=parts[i],dx=bx-q.x,dy=by-q.y,d=Math.sqrt(dx*dx+dy*dy)+1;
      q.vx=q.vx*0.92+dx/d*0.45;q.vy=q.vy*0.92+dy/d*0.45;var nx=q.x+q.vx,ny=q.y+q.vy;
      var a=Math.max(0,Math.min(.42,(1-d/(FW*0.7))*.42));
      fx.strokeStyle=p.amber;fx.globalAlpha=a;fx.lineWidth=DPR;fx.beginPath();fx.moveTo(q.x,q.y);fx.lineTo(nx,ny);fx.stroke();
      q.x=nx;q.y=ny;q.life-=0.006;if(d<FW*0.04||q.life<0){var s=sp();q.x=s.x;q.y=s.y;q.vx=q.vy=0;q.life=1}}
    fx.globalAlpha=.6;fx.fillStyle=p.cyan;fx.beginPath();fx.arc(bx,by,3*DPR,0,7);fx.fill();fx.globalAlpha=1;
    drawTokens(p);}
  function fstep(){if(!document.hidden&&!overlayOpen())fdraw();requestAnimationFrame(fstep)}
  if(reduce){fc.style.opacity=.18;fdraw();} else {fstep();}

  go(0);
})();