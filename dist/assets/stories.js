/* Promotional stories. No order is sent from this viewer. */
(() => {
  const groups = [
    { category: 'cakes', color: '#F51A85', pages: [
      {title:'Торты к празднику',text:'Любимые вкусы для вашей особенной даты.',button:'Выбрать торт'},
      {title:'Выберите свой вкус',text:'Добавьте торт в корзину и оформите заказ в WhatsApp.',button:'Смотреть торты'}
    ]},
    { category: 'desserts', color: '#604B3E', pages: [
      {title:'Круассан к кофе',text:'Фисташковая начинка. Хрустящая корочка. 185 ₽.',button:'Посмотреть десерты'},
      {title:'Ваша сладкая пауза',text:'Любимый десерт и кофе — время для себя.',button:'Выбрать десерт'}
    ]}
  ];
  let active;
  const el = (tag, cls, text) => {const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;};
  window.ShStories = {open(groupIndex, onAction) {
    if(active)active();
    const trigger=document.activeElement;
    const covers=[...document.querySelectorAll('.sh-r-promos>div')];
    const photos=covers.map(cover=>getComputedStyle(cover.children[0].children[0]).backgroundImage);
    const pages=groups.flatMap((group,g)=>group.pages.map(page=>({...page,category:group.category,color:group.color,photo:photos[g]})));
    const startIndex=groups.slice(0,groupIndex).reduce((sum,g)=>sum+g.pages.length,0);
    const dialog=el('dialog','sh-stories');dialog.setAttribute('aria-label','Истории Shaukhaloves Cake');
    const frame=el('div','sh-story-frame');frame.style.background=pages[startIndex].color;
    const top=el('div','sh-story-top'), progress=el('div','sh-story-progress');
    const bars=pages.map(()=>{const track=el('span'),bar=el('i');track.append(bar);progress.append(track);return bar;});
    const tools=el('div','sh-story-tools'), close=el('button');close.type='button';close.setAttribute('aria-label','Закрыть историю');
    close.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4l12 12M16 4L4 16"/></svg>';
    const actions=el('div','sh-story-actions');actions.append(close);
    tools.append(el('span','sh-story-brand','Shaukhaloves Cake'),actions);top.append(progress,tools);
    const body=el('div','sh-story-content');body.setAttribute('aria-live','polite');
    const prev=el('button','sh-story-hit prev'),next=el('button','sh-story-hit next');prev.setAttribute('aria-label','Предыдущая история');next.setAttribute('aria-label','Следующая история');
    const footer=el('div','sh-story-footer'),cta=el('button');footer.append(cta);frame.append(top,body,prev,next,footer);dialog.append(frame);document.body.append(dialog);
    let index=startIndex,elapsed=0,last=performance.now(),raf,closed=false,held=false;
    const oldOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let paused=reduce;
    const finish=()=>{if(closed)return;closed=true;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);dialog.close();dialog.remove();document.documentElement.style.overflow=oldOverflow;if(trigger?.isConnected)trigger.focus();active=null;};active=finish;
    // One cursor across every story; covers only choose the starting position.
    const show=()=>{
      elapsed=0;last=performance.now();const page=pages[index];
      frame.style.background=page.color;
      body.replaceChildren();body.style.animation='none';void body.offsetWidth;body.style.animation='';
      const copy=el('div','sh-story-copy');
      const tidy=text=>text.replace(/(^|\s)([вксиауо]|из|на|по|за|со|для)\s+/gi,'$1$2\u00a0');
      copy.append(el('h2','',tidy(page.title)),el('p','',tidy(page.text)));
      const media=el('div','sh-story-media'),picture=el('div','sh-story-photo');
      picture.style.backgroundImage=page.photo||'none';media.append(picture);body.append(copy,media);
      cta.textContent=page.button;bars.forEach((bar,i)=>bar.style.transform=`scaleX(${i<index?1:0})`);
      prev.disabled=index===0;
    };
    const advance=delta=>{if(index+delta>=pages.length){finish();return;}index=Math.max(0,index+delta);show();};
    close.onclick=finish;prev.onclick=()=>advance(-1);next.onclick=()=>advance(1);cta.onclick=()=>{const category=pages[index].category;finish();onAction(category);};
    dialog.addEventListener('cancel',e=>{e.preventDefault();finish();});dialog.addEventListener('click',e=>{if(e.target===dialog)finish();});
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();advance(1);}if(e.key==='ArrowLeft'){e.preventDefault();advance(-1);}});
    frame.addEventListener('pointerleave',()=>{held=false;});
    let startY=0,startX=0,startTime=0,suppressClick=false;
    frame.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
    frame.addEventListener('pointerdown',e=>{held=true;suppressClick=false;startY=e.clientY;startX=e.clientX;startTime=performance.now();});
    frame.addEventListener('pointerup',e=>{held=false;const dx=e.clientX-startX,dy=e.clientY-startY;suppressClick=Math.abs(dx)>65||Math.abs(dy)>85||performance.now()-startTime>250;if(dy>85&&Math.abs(dy)>Math.abs(dx)){finish();return;}if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)){e.preventDefault();advance(dx<0?1:-1);}else if(performance.now()-startTime>250){/* holding pauses playback */}});
    frame.addEventListener('pointercancel',()=>{held=false;});
    const visibility=()=>{last=performance.now();};document.addEventListener('visibilitychange',visibility);
    const tick=now=>{if(closed)return;const dt=Math.min(now-last,100);last=now;if(!held&&!paused&&!document.hidden){elapsed+=dt;bars[index].style.transform=`scaleX(${Math.min(elapsed/6500,1)})`;if(elapsed>=6500){if(index===pages.length-1){paused=true;}else advance(1);}}if(!closed)raf=requestAnimationFrame(tick);};
    show();dialog.showModal();close.focus();raf=requestAnimationFrame(tick);
  }};
})();
