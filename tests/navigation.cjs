const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('dist/index.html','utf8');const logic=html.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
const calls=[];let reduced=true;
const nodes={};const node=id=>nodes[id]||=( {id,offsetHeight:56,offsetLeft:60,current:null,style:{},value:'',getBoundingClientRect:()=>({top:80,left:12,width:100,height:100}),scrollTo(){},querySelector(){return null},animate(){return {}},focus(){},cloneNode(){return {style:{}}}} );
class DCLogic{constructor(){this.props={splash:false}}setState(update,done){this.state={...this.state,...(typeof update==='function'?update(this.state):update)};if(done)done()}}
const context={DCLogic,React:{createRef:()=>({current:null}),createElement:()=>null},sessionStorage:{getItem:()=>null,setItem(){}},localStorage:{getItem:()=>null,setItem(){}},window:{scrollY:0,matchMedia:()=>({matches:reduced}),scrollTo:o=>{calls.push(o);context.window.scrollY=o.top},addEventListener(){},removeEventListener(){}},document:{body:{style:{},animate(){}},getElementById:id=>node(id),addEventListener(){},removeEventListener(){}},URLSearchParams,location:{search:'?table=21'},requestAnimationFrame:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},console};
vm.createContext(context);vm.runInContext(logic+'\nglobalThis.Component=Component;globalThis.allItems=ITEMS;globalThis.allCats=CATS;',context);
const c=new context.Component();c.barRef.current=node('bar');c.browseRef.current=node('browse');
assert.equal(Object.keys(context.allItems).length,134);assert.equal(context.allCats.length,12);
let v=c.renderVals();assert.equal(v.table,'21');assert.equal(v.showDock,true);assert.equal(v.showCart,true);assert.equal(v.dockTotalLabel,"Корзина");assert.equal(v.showMenuFeed,true);
context.window.scrollY=945;c.toggleOverview();v=c.renderVals();assert.equal(v.categoryOverview,true);assert.equal(v.showMenuFeed,false);assert.equal(v.showPopular,false);assert.equal(v.categoryTiles.length,12);assert.equal(v.categoryTiles.find(x=>x.id==='desserts').count,4);assert.equal(v.categoryTiles.find(x=>x.id==='desserts').previews.length,3);
c.toggleOverview();assert.equal(context.window.scrollY,945);assert.equal(c.state.categoryOverview,false);
c.toggleOverview();c.renderVals().categoryTiles.find(x=>x.id==='coffee').go();assert.equal(c.state.categoryOverview,false);assert.equal(c.state.active,'coffee');assert.equal(c.state.searchOpen,false);assert(calls.at(-1).top>=0);
c.toggleOverview();c.toggleSearch();assert.equal(c.state.categoryOverview,false);assert.equal(c.state.searchOpen,true);assert.equal(c.renderVals().showDock,false);c.toggleSearch();assert.equal(c.renderVals().showDock,true);assert.equal(c.state.categoryOverview,true);c.toggleOverview();context.window.scrollY=702;c.toggleSearch();c.renderVals().onSearchKey({key:'Escape',preventDefault(){}});assert.equal(context.window.scrollY,702);assert.equal(c.state.searchOpen,false);assert.equal(c.state.categoryOverview,false);
c.launch(null,'desserts-0|0');v=c.renderVals();assert.equal(v.count,1);assert.equal(v.totalLabel.replace(/\s/g,''),'185₽');assert.equal(v.showCart,true);
c.launch(null,'desserts-0|0');assert.equal(c.renderVals().count,2);c.change('desserts-0|0',-1);assert.equal(c.renderVals().count,1);
c.renderVals().openCart();assert.equal(c.renderVals().isCartSheet,true);assert.equal(c.renderVals().showDock,false);assert.equal(context.document.body.style.overflow,'hidden');c.close();assert.equal(c.renderVals().showDock,true);
const latte=Object.values(context.allItems).find(x=>x.name==='Латте');c.open(latte.key);c.renderVals().si.sizes[1].pick();assert.equal(c.renderVals().si.priceLabel.replace(/\s/g,''),'280₽');c.renderVals().si.add();assert.equal(c.renderVals().totalLabel.replace(/\s/g,''),'465₽');
c.renderVals().openCart();c.renderVals().cartRows.find(x=>x.canEdit).edit();assert.equal(c.renderVals().isItemSheet,true);c.renderVals().si.sizes[2].pick();c.renderVals().si.add();assert.equal(c.renderVals().isCartSheet,true);assert.equal(c.renderVals().totalLabel.replace(/\s/g,''),'515₽');
c.close();c.change('desserts-0|0',-1);c.change(latte.key+'|2',-1);assert.equal(c.renderVals().count,0);assert.equal(c.renderVals().showCart,true);assert.equal(c.renderVals().dockTotalLabel,"Корзина");assert.equal(c.renderVals().showDock,true);
c.setState({cart:{'desserts-0|0':120}});assert.equal(c.renderVals().dockCount,'99+');assert(c.renderVals().cartAccessibleLabel.includes('120'));
console.log('PASS: original 134 items/12 categories; overview, scroll restore, category selection, search/keyboard dock state, immediate cart totals, original sheet, portion editing, empty and large cart, QR table.');
c.setState({categoryOverview:false});assert.equal(c.renderVals().notSearch,true);
c.toggleOverview();assert.equal(c.renderVals().notSearch,false);assert.equal(c.renderVals().overviewButtonLabel,'Показать блюда');
let frames=[],animations=[];c.browseRef.current.animate=(f,o)=>{frames.push({f,o});const a={cancel(){this.cancelled=true}};animations.push(a);return a};reduced=false;
c.toggleOverview();assert.equal(c.state.categoryOverview,false);
c.toggleOverview();assert.equal(c.state.categoryOverview,true);assert.equal(animations[0].cancelled,true);
c.go('coffee');assert.equal(c.state.categoryOverview,false);assert.equal(calls.at(-1).behavior,'auto');
reduced=true;const before=animations.length;c.toggleOverview();assert.equal(animations.length,before);
console.log('PASS: immediate switching, animation replacement, category scroll and reduced motion.');

const wa=new URL(c.renderVals().waHref);assert.equal(wa.hostname,"wa.me");assert.equal(wa.pathname,"/79959962436");assert(wa.searchParams.get("text").length>20);assert(c.renderVals().waSendLabel.startsWith("Заказать · "));console.log("PASS: WhatsApp recipient, encoded order text and concise label.");

// Reload must restore a valid draft, never stale products or invalid portions.
const saved=new Map();context.localStorage.getItem=k=>saved.get(k)||null;context.localStorage.setItem=(k,v)=>saved.set(k,v);
c.setState({cart:{[latte.key+'|1']:2},comment:'Без сахара'});c.componentDidUpdate();
let restored=new context.Component();assert.equal(restored.state.cart[latte.key+'|1'],2);assert.equal(restored.state.comment,'Без сахара');
assert.equal(restored.renderVals().totalLabel.replace(/\s/g,''),'560₽');
restored.setState({sheet:{type:'cart'},waSent:true});restored.renderVals().waFinish();assert.equal(restored.state.cart[latte.key+'|1'],2);assert.equal(restored.state.comment,'Без сахара');
restored.setState({sheet:{type:'cart'},waSent:true});restored.renderVals().waEdit();assert.equal(restored.state.waSent,false);assert.equal(restored.renderVals().waFormView,true);
const draftKey=restored.draftKey();saved.set(draftKey,JSON.stringify({version:1,at:Date.now(),cart:{'missing|0':2,[latte.key+'|99']:1,'desserts-0|0':-1,[latte.key+'|0']:3},comment:'ok'}));
restored=new context.Component();assert.deepEqual(Object.keys(restored.state.cart),[latte.key+'|0']);
saved.set(draftKey,JSON.stringify({version:1,at:Date.now()-86400001,cart:{[latte.key+'|0']:3}}));assert.equal(new context.Component().renderVals().count,0);
saved.set(draftKey,'broken JSON');assert.equal(new context.Component().renderVals().count,0);
context.localStorage.getItem=()=>{throw Error('Storage blocked')};assert.equal(new context.Component().renderVals().count,0);
context.localStorage.setItem=()=>{throw Error('Storage blocked')};restored.saveDraft();
restored.setState({query:'  черный   чай '});assert(restored.filtered().some(cat=>cat.rows.some(r=>context.allItems[r.key].name==='Чёрный')));
restored.setState({query:'фисташковым кремом'});assert(restored.filtered().some(cat=>cat.rows.length));
restored.setState({query:'пицца'});assert.equal(restored.filtered()[0].rows.length,8);
restored.open('desserts-0');assert.equal(restored.renderVals().si.hasNutrition,false);assert.equal(restored.renderVals().si.hasWeight,false);assert.equal(restored.renderVals().si.hasMeta,false);
assert(!restored.renderVals().si.allergens.includes('Не содержит'));
console.log('PASS: cart/comment reload, WhatsApp return/edit, draft validation/expiry/storage errors, category and description search, ё/е normalization and verified-only product metadata.');

const undo = new context.Component();
undo.setState({cart:{'desserts-0|0':1}});undo.change('desserts-0|0',-1);
assert.equal(undo.renderVals().showUndo,true);
undo.change('desserts-0|0',2);undo.change(latte.key+'|0',1);undo.undoRemoval();
assert.equal(undo.state.cart['desserts-0|0'],3);assert.equal(undo.state.cart[latte.key+'|0'],1);
undo.clearCart();undo.change(latte.key+'|0',2);undo.undoRemoval();
assert.equal(undo.state.cart['desserts-0|0'],3);assert.equal(undo.state.cart[latte.key+'|0'],3);
undo.undoRemoval();assert.equal(undo.state.cart[latte.key+'|0'],3);
undo.change('desserts-0|0',-1);assert.equal(undo.renderVals().showUndo,false);
console.log('PASS: undo removal and clear merge with new items, no duplicate restore or undo for quantity decrement.');

// WhatsApp hand-off is immediate even if background timers are suspended.
const handoff = new context.Component();handoff.setState({sheet:{type:'cart'},cart:{'desserts-0|0':1}});
const scrollPanel={scrollTop:800};handoff.waFormRef.current={closest:()=>scrollPanel};
let prevented=false;handoff.renderVals().onWaSend({preventDefault(){prevented=true}});
assert.equal(handoff.state.waSent,true);assert.equal(scrollPanel.scrollTop,0);assert.equal(prevented,false);
assert.equal(handoff.state.cart['desserts-0|0'],1);
const emptyHandoff=new context.Component();let blocked=false;
emptyHandoff.renderVals().onWaSend({preventDefault(){blocked=true}});assert.equal(blocked,true);assert(!emptyHandoff.state.waSent);
console.log('PASS: WhatsApp screen switches without timers, resets scroll, preserves native link and cart; empty order blocked.');

const readable=new context.Component();readable.setState({sheet:{type:'cart'},cart:{'desserts-0|0':4,'desserts-1|0':1},comment:'Без сахара'});
const message=new URL(readable.renderVals().waHref).searchParams.get('text');
assert(message.startsWith('*Заказ · стол 21*\n\n*1. '));
assert(message.includes('\n4 шт. · '));assert(message.includes('\n\n*2. '));
assert(message.includes('\n\n*Итого: '));assert(message.endsWith('\n\n*Комментарий*\nБез сахара'));
console.log('PASS: readable WhatsApp message has separate item blocks, quantity/cost lines, bold total and optional comment.');

// A single sheet body must be visible throughout the WhatsApp hand-off.
const screens=new context.Component();screens.setState({sheet:{type:'cart'},cart:{'desserts-0|0':1}});
const visibleBodies=()=>{const r=screens.renderVals();return [r.cartEmptyView,r.cartFullView,r.waSentView].filter(Boolean).length};
assert.equal(visibleBodies(),1);assert.equal(screens.renderVals().cartFullView,true);
screens.renderVals().onWaSend({preventDefault(){throw Error('Unexpected navigation block')}});
assert.equal(visibleBodies(),1);assert.equal(screens.renderVals().cartFullView,false);assert.equal(screens.renderVals().waSentView,true);
screens.renderVals().waEdit();assert.equal(visibleBodies(),1);assert.equal(screens.renderVals().cartFullView,true);
screens.setState({cart:{},waSent:true});assert.equal(visibleBodies(),1);assert.equal(screens.renderVals().cartEmptyView,false);
console.log('PASS: cart and WhatsApp confirmation bodies are mutually exclusive, including return to editing and empty cart.');
