(function(){
'use strict';
var LM=window.LM||{},T=LM.t||{},P=T.planner||{},C=T.common||{};
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
var nf=new Intl.NumberFormat(LM.numLocale,{maximumFractionDigits:0,useGrouping:'always'});
function eur(n){return '€'+nf.format(Math.round(n))}
function gbp(n){return '£'+nf.format(Math.round(n))}
function ls(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return ''}}

/* ---------- session trail (attribution) ---------- */
(function(){window.__ldT0=Date.now();
  if(!ls('ld_landing')){ls('ld_landing',location.pathname+location.search);ls('ld_ref',document.referrer||'')}
  var t=(ls('ld_trail')||'').split('>').filter(Boolean);t.push(location.pathname);ls('ld_trail',t.slice(-12).join('>'));})();

/* ---------- nav ---------- */
var bg=$('.burger'),dr=$('.drawer');
if(bg&&dr){bg.addEventListener('click',function(){var o=dr.classList.toggle('open');bg.setAttribute('aria-expanded',o)})}
$$('.nav details').forEach(function(d){document.addEventListener('click',function(e){if(!d.contains(e.target))d.removeAttribute('open')})});

/* ---------- lead submit ---------- */
function submitLead(form,extra){
  var hp=form.querySelector('[name=company_site]');var ok=form.querySelector('.ok'),er=form.querySelector('.er'),btn=form.querySelector('button[type=submit]');
  if(ok)ok.style.display='none';if(er)er.style.display='none';
  if(hp&&hp.value){if(ok)ok.style.display='block';return}
  var g=function(n){return form.elements[n]?form.elements[n].value.trim():''};
  var svc=g('servizio'),msg=g('messaggio');
  if(extra&&extra.summary)msg=(msg?msg+'\n\n':'')+extra.summary;
  if(extra&&extra.service&&!svc)svc=extra.service;
  var p={name:g('nome'),surname:g('cognome'),nome:g('nome'),cognome:g('cognome'),email:g('email'),telefono:g('tel'),phone:g('tel'),service:svc,servizio:svc,messaggio:msg,description:msg,
    language:LM.lang,market:LM.lang==='en'?'EN':'IT',source:(extra&&extra.source)||'Lumine platform',hp:hp?hp.value:'',elapsed_ms:Date.now()-window.__ldT0,
    sid:(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2),
    page:location.pathname,referrer:document.referrer||'',utm:location.search.slice(1),landing:ls('ld_landing')||'',trail:ls('ld_trail')||'',first_referrer:ls('ld_ref')||''};
  var old=btn?btn.textContent:'';if(btn){btn.disabled=true;btn.textContent=C.sending}
  fetch(LM.endpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)}).then(function(){
    try{if(window.gtag)gtag('event','generate_lead',{lead_source:p.source,service:p.service,language:p.language})}catch(x){}
    if(ok)ok.style.display='block';form.reset();
    setTimeout(function(){location.href=LM.thanksUrl+'?s='+encodeURIComponent(p.service||'')},500);
  }).catch(function(){if(er)er.style.display='block';if(btn){btn.disabled=false;btn.textContent=old}});
}
$$('form.f[data-lead]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();if(!f.checkValidity()){f.reportValidity();return}submitLead(f,f._extra)})});

/* ---------- planner ---------- */
var mount=$('#planner');
if(mount&&LM.items){
  var I=LM.items,S={tr:'implant',qty:3,tech:'aon4',cmp:LM.lang==='en'?'uk':'it',quote:'',travel:''};
  var lim={implant:[1,8],veneer:[1,16],crown:[1,16]};
  var presets=mount.getAttribute('data-plan')||(location.hash.match(/#plan=([a-z]+)/)||[])[1];
  if(presets&&P.opts[presets])S.tr=presets;
  if(mount.getAttribute('data-tech'))S.tech=mount.getAttribute('data-tech');
  // arch: 16 upper teeth laid out edge to edge, following a smile curve
  var TW=[18,17,16,15,15,14,16,17],TH=[22,23,24,26,27,29,31,33];
  function archSVG(){
    var n=16,gap=2,tw=[],th=[],i,tot=0;
    for(i=0;i<n;i++){var k=Math.min(i,n-1-i);tw.push(TW[k]);th.push(TH[k]);tot+=TW[k]}
    tot+=gap*(n-1);var x=(360-tot)/2,half=tot/2,cx=180;
    var s='<svg viewBox="0 0 360 72" role="img" aria-label="'+(LM.lang==='en'?'Dental arch preview':'Anteprima arcata dentale')+'">',wp='';
    for(i=0;i<n;i++){
      var mx=x+tw[i]/2,u=(mx-cx)/half,y=4+(1-u*u)*22,rot=Math.atan((-2*u/half)*22)*180/Math.PI;
      s+='<g transform="translate('+mx.toFixed(1)+' '+y.toFixed(1)+') rotate('+rot.toFixed(1)+')"><rect class="tooth" data-i="'+i+'" x="'+(-tw[i]/2)+'" y="0" width="'+tw[i]+'" height="'+th[i]+'" rx="'+(tw[i]/2.8).toFixed(1)+'" style="animation-delay:'+(i*28)+'ms"/></g>';
      wp+=(i?'L':'M')+mx.toFixed(1)+' '+(y+th[i]*.45).toFixed(1);
      x+=tw[i]+gap;
    }
    return s.replace('<svg','<svg')+'<path class="wire" id="wire" d="'+wp+'"/></svg>';
  }
  // light order: from centre outwards, alternating
  var centreOrder=[7,8,6,9,5,10,4,11,3,12,2,13,1,14,0,15];
  function lit(n,mode){var on={};if(mode==='all'){for(var i=0;i<16;i++)on[i]=1}else{for(var j=0;j<Math.min(n,16);j++)on[centreOrder[j]]=1}return on}

  function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstChild}
  function optHTML(name,val,label,sub,checked){return '<label class="opt"><input type="radio" name="'+name+'" value="'+val+'"'+(checked?' checked':'')+'><span>'+label+'<em>'+sub+'</em></span></label>'}
  mount.innerHTML='<div class="pl" id="plbox"><div class="pl-top"><h2>'+P.title+'</h2><span>'+P.hint+'</span></div>'+
   '<div class="arch" id="arch"></div>'+
   '<fieldset><legend>'+P.what+'</legend><div class="opts" id="o-tr"></div></fieldset>'+
   '<div id="o-q"></div>'+
   '<fieldset><legend>'+P.cmp+'</legend><div class="opts" id="o-cmp"></div><div id="o-quote" class="hide" style="margin-top:10px"><label class="lb" for="qin">'+P.quote+'</label><input id="qin" type="number" inputmode="numeric" min="0" step="50"></div></fieldset>'+
   '<div style="margin-bottom:18px"><label class="lb" for="tin">'+P.travel+'</label><input id="tin" type="number" inputmode="numeric" min="0" step="50" placeholder="0"></div>'+
   '<div class="res" aria-live="polite"><div class="res-top"><div class="res-price"><small>'+P.resLum+'</small><span id="r-p"></span></div><div class="save" id="r-s"></div></div><div class="bars" id="r-b"></div><p class="res-note" id="r-n"></p>'+
   '<div class="actions"><button type="button" class="btn btn-primary" id="r-cta">'+P.cta+'</button><a class="btn btn-ghost" id="r-wa" target="_blank" rel="noopener">'+P.wa+'</a></div>'+
   '<form class="f lead-f" id="lf" data-lead novalidate><div class="row2"><div><label for="lf-n">'+C.name+'</label><input id="lf-n" name="nome" required autocomplete="given-name"></div><div><label for="lf-c">'+C.surname+'</label><input id="lf-c" name="cognome" autocomplete="family-name"></div></div>'+
   '<div class="row2"><div><label for="lf-t">'+C.phone+'</label><input id="lf-t" name="tel" type="tel" required autocomplete="tel"></div><div><label for="lf-e">'+C.email+'</label><input id="lf-e" name="email" type="email" required autocomplete="email"></div></div>'+
   '<input class="hp" name="company_site" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="ok">'+C.ok+'</div><div class="er">'+C.err+'</div>'+
   '<button type="submit" class="btn btn-primary">'+C.send+'</button><small>'+C.privacy+' <a href="'+LM.privacyUrl+'">'+C.privacyLink+'</a>'+C.privacyEnd+'</small></form></div></div>';
  $('#arch').innerHTML=archSVG();
  var teeth=$$('.tooth',mount),wire=$('#wire',mount);
  var oTr=$('#o-tr');['implant','veneer','crown','full','ortho'].forEach(function(k){oTr.insertAdjacentHTML('beforeend',optHTML('tr',k,P.opts[k][0],P.opts[k][1],k===S.tr))});
  var oCmp=$('#o-cmp');['it','uk','own'].forEach(function(k){if(LM.lang==='en'&&k==='it'&&false)return;oCmp.insertAdjacentHTML('beforeend',optHTML('cmp',k,P.cmpOpts[k],'',k===S.cmp))});
  // compact compare opts (no sub text)
  $$('#o-cmp .opt span').forEach(function(s){s.style.minHeight='44px'});

  function price(){
    var tr=S.tr,lum,home=null,uk=null,label='',n=S.qty;
    if(tr==='implant'){lum=I.implant.lum*n;home=[I.implant.it[0]*n,I.implant.it[1]*n];uk=[I.implant.uk[0]*n,I.implant.uk[1]*n];label=n+' '+P.qtyUnit.implant}
    else if(tr==='veneer'){lum=I.veneer.lum*n;home=[I.veneer.it[0]*n,I.veneer.it[1]*n];uk=[I.veneer.uk[0]*n,I.veneer.uk[1]*n];label=n+' '+P.qtyUnit.veneer}
    else if(tr==='crown'){lum=I.crown.lum*n;home=[I.crown.it[0]*n,I.crown.it[1]*n];uk=[I.crown.uk[0]*n,I.crown.uk[1]*n];label=n+' '+P.qtyUnit.crown}
    else if(tr==='full'){var k=I[S.tech];lum=k.lum;home=k.it.slice();uk=k.uk.slice();label=P[S.tech][0]}
    else {lum=I.ortho.lum;home=I.ortho.it.slice();uk=I.ortho.uk.slice();label=P.opts.ortho[0]}
    return {lum:lum,home:home,uk:uk,label:P.opts[tr][0]+' ('+label.replace(/^\d+ /,function(m){return m})+')'};
  }
  function renderQ(){
    var q=$('#o-q'),tr=S.tr;
    if(lim[tr]){var L=lim[tr];if(S.qty<L[0])S.qty=L[0];if(S.qty>L[1])S.qty=L[1];
      var lab=tr==='implant'?P.qtyImplant:tr==='veneer'?P.qtyVeneer:P.qtyCrown;
      q.innerHTML='<fieldset><legend id="ql">'+lab+'</legend><div class="qty" role="group" aria-labelledby="ql"><button type="button" id="qm" aria-label="−">−</button><output id="qv" aria-live="polite">'+S.qty+'</output><button type="button" id="qp" aria-label="+">+</button></div></fieldset>';
      $('#qm').onclick=function(){S.qty=Math.max(L[0],S.qty-1);update()};$('#qp').onclick=function(){S.qty=Math.min(L[1],S.qty+1);update()};
    }else if(tr==='full'){
      q.innerHTML='<fieldset><legend>'+P.tech+'</legend><div class="opts">'+optHTML('tech','aon4','All-on-4',P.aon4[1]+' · '+eur(I.aon4.lum),S.tech==='aon4')+optHTML('tech','aon6','All-on-6',P.aon6[1]+' · '+eur(I.aon6.lum),S.tech==='aon6')+'</div></fieldset>';
      $$('input[name=tech]',q).forEach(function(r){r.onchange=function(){S.tech=r.value;update()}});
    }else q.innerHTML='';
  }
  function bar(cls,label,w,txt){return '<div class="bar"><b>'+label+'</b><div class="track"><div class="fill '+cls+'" style="width:calc('+Math.min(w,100)*0.42+'%)"></div><span class="val">'+txt+'</span></div></div>'}
  function update(){
    var p=price(),travel=parseFloat($('#tin').value)||0,tr=S.tr,res={};
    var homeLow=null,homeHigh=null,homeLabel='',fx=LM.gbpEur,cur='€';
    if(S.cmp==='it'){homeLow=p.home[0];homeHigh=p.home[1];homeLabel=P.resHome}
    else if(S.cmp==='uk'){homeLow=p.uk[0]*fx;homeHigh=p.uk[1]===null?null:p.uk[1]*fx;homeLabel=P.resHomeUk}
    else{var q=parseFloat($('#qin').value)||0;homeLow=q||null;homeHigh=q||null;homeLabel=P.resOwn}
    var total=p.lum+travel;
    $('#r-p').textContent=eur(p.lum);
    // bars
    var max=Math.max(homeHigh||homeLow||0,homeLow||0,total)||1;if(homeHigh===null&&homeLow)max=Math.max(homeLow*1.15,total);
    var bars='';
    if(homeLow){var shown=homeHigh===null?homeLow:homeHigh;
      var txt=homeHigh===null?(eur(homeLow)+'+'):(homeLow===homeHigh?eur(homeLow):eur(homeLow)+' – '+eur(homeHigh));
      bars+=bar(homeHigh!==null&&homeLow!==homeHigh?'range':'home',homeLabel,Math.max(8,shown/max*100),txt)}
    bars+=bar('lum',P.tirana,Math.max(8,p.lum/max*100),eur(p.lum)+(travel?' '+P.plusTravel+' '+eur(travel):''));
    if(travel)bars=bars.replace(/(<div class="fill lum" style="width:calc\()[\d.]+/,'$1'+(Math.max(8,total/max*100)*0.42).toFixed(1));
    $('#r-b').innerHTML=bars;
    // saving
    var sv=$('#r-s');
    if(!homeLow){sv.innerHTML='<small>'+P.saveNone+'</small>';sv.style.background='rgba(255,255,255,.12)';sv.style.color='#fff'}
    else{sv.style.background='';sv.style.color='';
      var a=Math.max(0,homeLow-total),b=homeHigh===null?null:Math.max(0,homeHigh-total);
      var big=b===null?P.saveOver+' '+eur(a):(Math.round(a)===Math.round(b)?eur(a):eur(a)+' – '+eur(b));
      sv.innerHTML='<small>'+P.save+'</small>'+big}
    var note=P.note+(S.cmp==='uk'?' '+P.noteUk.replace('{r}',fx):'');
    $('#r-n').textContent=note;
    // arch
    var mode=(tr==='full'||tr==='ortho')?'all':'n',on=lit(S.qty,mode);
    teeth.forEach(function(t,i){t.classList.toggle('on',!!on[i])});wire.classList.toggle('on',tr==='ortho');
    // summary + links
    var sum=P.summary.replace('{t}',p.label).replace('{p}',eur(p.lum));
    var cmpTxt=homeLow?(' '+homeLabel+': '+(homeHigh===null?eur(homeLow)+'+':homeLow===homeHigh?eur(homeLow):eur(homeLow)+'-'+eur(homeHigh))+'.'):'';
    if(travel)sum+=' Travel: '+eur(travel)+'.';
    S.summary=sum+cmpTxt;
    $('#r-wa').href='https://wa.me/'+LM.wa+'?text='+encodeURIComponent(C.waMsg+'. '+S.summary);
    var lf=$('#lf');lf._extra={summary:S.summary,service:P.opts[tr][0],source:'Planner'};
    var q=$('#qv');if(q)q.textContent=S.qty;
  }
  $$('input[name=tr]',mount).forEach(function(r){r.onchange=function(){S.tr=r.value;if(S.tr==='implant'&&S.qty>8)S.qty=3;renderQ();update();try{gtag('event','planner_treatment',{treatment:S.tr})}catch(e){}}});
  $$('input[name=cmp]',mount).forEach(function(r){r.onchange=function(){S.cmp=r.value;$('#o-quote').classList.toggle('hide',S.cmp!=='own');update()}});
  $('#qin').oninput=update;$('#tin').oninput=update;
  $('#r-cta').onclick=function(){var lf=$('#lf');lf.classList.add('open');this.classList.add('hide');var n=$('#lf-n');if(n)n.focus({preventScroll:false});try{gtag('event','planner_quote_open',{treatment:S.tr})}catch(e){}};
  renderQ();update();
}

/* ---------- consent + analytics ---------- */
(function(){
  var KEY='ld_consent',box=$('.cookie');
  function load(){if(window.__ga)return;window.__ga=1;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+LM.ga;document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',LM.ga,{anonymize_ip:true});}
  var v='';try{v=localStorage.getItem(KEY)||''}catch(e){}
  if(v==='yes')load();else if(!v&&box)box.classList.add('show');
  $$('[data-consent]').forEach(function(b){b.addEventListener('click',function(){var y=b.getAttribute('data-consent');try{localStorage.setItem(KEY,y)}catch(e){}box.classList.remove('show');if(y==='yes')load()})});
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a,button');if(!a||!window.gtag)return;var h=a.getAttribute('href')||'';
    var m=/wa\.me|whatsapp/.test(h)?'whatsapp':h.indexOf('tel:')===0?'phone':h.indexOf('mailto:')===0?'email':'';if(m)gtag('event','contact_click',{method:m,page:location.pathname});
    if(a.classList.contains('btn-primary'))gtag('event','cta_click',{cta:(a.textContent||'').trim().slice(0,40),page:location.pathname})});
})();
})();
