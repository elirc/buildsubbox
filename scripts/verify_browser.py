"""Disposable Chromium CRUD and reservation checks; no live integrations."""
from pathlib import Path
import json,os,socket,subprocess,time,urllib.request
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=Path(os.environ.get('PARCELPILOT_CHECK_DIR',str(ROOT/'.verification/browser'))).resolve();OUT.mkdir(parents=True,exist_ok=True)
KEY='parcelpilot-workspace-v1';results=[]
def accept_dialog(dialog):dialog.accept()
def nav(p,name):p.get_by_role('navigation',name='Main sections').get_by_role('button',name=name,exact=True).click()
def saved(p):expect(p.get_by_role('status')).to_contain_text('Saved to this browser.')
def stored(p):return p.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
def new_item(p,name='Practice soap'):
 nav(p,'Inventory');p.get_by_role('button',name='New item',exact=True).click();p.get_by_label('Name',exact=True).fill(name);p.get_by_label('Available units',exact=True).fill('5');p.get_by_label('Unit cost in USD').fill('1.35');p.get_by_label('Retail value in USD').fill('4.05')
def reserve(p):
 nav(p,'Box builder');p.get_by_label('Cycle month').fill('2026-09');p.get_by_role('button',name='Fill from recommendations').click();p.get_by_role('button',name='Reserve monthly box',exact=True).click();expect(p.get_by_role('status')).to_contain_text('Reservation recorded locally.');expect(p.locator('.shipment-card')).to_have_count(1)
with socket.socket() as probe:
 try:probe.bind(('127.0.0.1',5181))
 except OSError:raise SystemExit('Port 5181 is occupied; no existing server was tested or stopped.')
log=(OUT/'preview.log').open('w',encoding='utf-8');server=subprocess.Popen(['node','node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5181','--strictPort'],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
try:
 deadline=time.monotonic()+120
 while time.monotonic()<deadline:
  if server.poll() is not None:raise RuntimeError('Owned preview stopped before readiness.')
  try:
   with urllib.request.urlopen('http://127.0.0.1:5181',timeout=2) as response:
    if response.status==200:break
  except OSError:time.sleep(.2)
 else:raise RuntimeError('Preview readiness timeout.')
 with sync_playwright() as pw:
  options={'headless':True}
  if os.environ.get('ASTRA_BROWSER_EXECUTABLE'):options['executable_path']=os.environ['ASTRA_BROWSER_EXECUTABLE']
  browser=pw.chromium.launch(**options)
  def run(name,action):
   context=browser.new_context(viewport={'width':1440,'height':1050},accept_downloads=True);p=context.new_page();p.set_default_timeout(60000);p.on('dialog',accept_dialog)
   try:
    p.goto('http://127.0.0.1:5181');expect(p.get_by_role('heading',name='Curate a box. Keep the record.',exact=True)).to_be_visible();action(p,context);results.append({'name':name,'passed':True});print('PASS',name,flush=True)
   except Exception as error:
    results.append({'name':name,'passed':False,'error':str(error)});print('FAIL',name,str(error)[:400],flush=True)
    try:p.screenshot(path=str(OUT/f'failure-{len(results)}.png'),full_page=True,timeout=10000)
    except Exception:pass
   finally:context.close()
  def seed(p,c):
   assert p.evaluate('(key)=>localStorage.getItem(key)',KEY) is None;nav(p,'Shipments');expect(p.get_by_text('No shipments match this search and filter.')).to_be_visible();assert p.evaluate('(key)=>localStorage.getItem(key)',KEY) is None
  run('initial catalog does not eagerly persist or invent shipment history',seed)
  def crud(p,c):
   new_item(p);p.get_by_role('button',name='Save item',exact=True).click();saved(p);p.get_by_role('button',name='Edit Practice soap',exact=True).click();p.get_by_label('Unit cost in USD').fill('2.45');p.get_by_role('button',name='Save item',exact=True).click();saved(p);p.reload();nav(p,'Inventory');expect(p.locator('.record-card').filter(has=p.get_by_role('heading',name='Practice soap',exact=True))).to_contain_text('$2.45');assert next(i for i in stored(p)['items'] if i['name']=='Practice soap')['version']==2;p.get_by_role('button',name='Delete Practice soap',exact=True).click();saved(p);assert len(stored(p)['items'])==9
  run('inventory CRUD preserves cents versions and reload state',crud)
  def plans(p,c):
   nav(p,'Plans');p.get_by_role('button',name='New plan',exact=True).click();p.get_by_label('Plan name',exact=True).fill('Mini');p.get_by_label('Monthly plan amount in USD').fill('9.95');p.get_by_label('Items per box').fill('1');p.get_by_role('button',name='Save plan',exact=True).click();saved(p);p.get_by_role('button',name='Edit Mini',exact=True).click();p.get_by_label('Monthly plan amount in USD').fill('10.95');p.get_by_role('button',name='Save plan',exact=True).click();saved(p);p.get_by_role('button',name='Delete Mini',exact=True).click();saved(p);assert len(stored(p)['plans'])==3
  run('plan CRUD and unused deletion work',plans)
  def subscribers(p,c):
   nav(p,'Subscribers');p.get_by_role('button',name='New subscriber',exact=True).click();p.get_by_label('Subscriber name',exact=True).fill('Practice learner');p.get_by_label('Email',exact=True).fill('LEARNER@example.com');p.get_by_label('Destination',exact=True).fill('Seattle, WA');p.get_by_role('button',name='Save subscriber',exact=True).click();saved(p);assert stored(p)['subscribers'][1]['email']=='learner@example.com'
   p.get_by_role('button',name='Edit Practice learner',exact=True).click();p.get_by_label('Add item rating').select_option('itm_101');p.get_by_label('Rating for Citrus Cloud Cleanser',exact=True).select_option('5');p.get_by_label('Subscription status',exact=True).select_option('Paused');p.get_by_role('button',name='Save subscriber',exact=True).click();saved(p);assert stored(p)['subscribers'][1]['ratings']==[{'itemId':'itm_101','rating':5}]
   p.get_by_role('button',name='Delete Practice learner',exact=True).click();saved(p);assert len(stored(p)['subscribers'])==1
  run('subscriber CRUD normalizes email and persists ratings and status',subscribers)
  def duplicate(p,c):
   nav(p,'Subscribers');p.get_by_role('button',name='New subscriber',exact=True).click();p.get_by_label('Subscriber name',exact=True).fill('Duplicate learner');p.get_by_label('Email',exact=True).fill('MAYA@example.com');p.get_by_label('Destination',exact=True).fill('Portland');p.get_by_role('button',name='Save subscriber',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('Duplicate');expect(p.get_by_label('Subscriber name',exact=True)).to_have_value('Duplicate learner');assert p.evaluate('(key)=>localStorage.getItem(key)',KEY) is None
  run('duplicate email rejection preserves the draft',duplicate)
  def exclusions(p,c):
   nav(p,'Subscribers');p.get_by_role('button',name='Edit Maya Chen',exact=True).click();p.get_by_label('Excluded tags (comma separated)').fill('citrus');p.get_by_role('button',name='Save subscriber',exact=True).click();saved(p);nav(p,'Box builder');expect(p.get_by_role('button',name='Add Citrus Cloud Cleanser',exact=True)).to_have_count(0);expect(p.get_by_role('button',name='Add Bright Start Serum',exact=True)).to_have_count(0)
   nav(p,'Inventory');p.get_by_role('button',name='Edit Ceramic Tea Scoop',exact=True).click();p.get_by_label('Active',exact=True).uncheck();p.get_by_role('button',name='Save item',exact=True).click();saved(p);nav(p,'Box builder');expect(p.get_by_role('button',name='Add Ceramic Tea Scoop',exact=True)).to_have_count(0)
  run('excluded tags and archived inventory cannot enter new boxes',exclusions)
  def reservation(p,c):
   reserve(p);s=stored(p);assert len(s['shipments'][0]['quote']['lines'])==5;assert next(i for i in s['items'] if i['id']=='itm_101')['stock']==419;assert s['shipments'][0]['status']=='Reserved';p.reload();nav(p,'Shipments');expect(p.locator('.shipment-card')).to_have_count(1)
  run('reservation atomically persists exact box and available stock',reservation)
  def cycle(p,c):
   reserve(p);nav(p,'Box builder');p.get_by_role('button',name='Fill from recommendations').click();p.get_by_role('button',name='Reserve monthly box',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('already has a reservation');assert len(stored(p)['shipments'])==1;assert stored(p)['items'][0]['stock']==419
  run('a second request key cannot duplicate a subscriber month',cycle)
  def cancel(p,c):
   reserve(p);p.get_by_role('button',name='Cancel reservation',exact=True).click();saved(p);assert stored(p)['items'][0]['stock']==420;assert stored(p)['shipments'][0]['status']=='Cancelled';expect(p.get_by_role('button',name='Cancel reservation',exact=True)).to_have_count(0)
   nav(p,'Subscribers');p.get_by_role('button',name='Delete Maya Chen',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('shipment history')
  run('cancellation restores once and history protects referenced records',cancel)
  def lifecycle(p,c):
   reserve(p);p.get_by_role('button',name='Mark packed',exact=True).click();saved(p);expect(p.get_by_role('button',name='Mark shipped',exact=True)).to_be_disabled();p.get_by_label('Tracking reference',exact=True).fill('DEMO-TRACK-123');p.get_by_role('button',name='Mark shipped',exact=True).click();saved(p);expect(p.get_by_role('button',name='Cancel reservation',exact=True)).to_have_count(0);p.get_by_role('button',name='Mark delivered',exact=True).click();saved(p);assert stored(p)['shipments'][0]['status']=='Delivered';assert len(stored(p)['shipments'][0]['history'])==4;assert stored(p)['items'][0]['stock']==419
  run('pack ship deliver requires tracking and keeps terminal history',lifecycle)
  def snapshots(p,c):
   reserve(p);nav(p,'Inventory');p.get_by_role('button',name='Edit Citrus Cloud Cleanser',exact=True).click();p.get_by_label('Name',exact=True).fill('Renamed cleanser');p.get_by_label('Unit cost in USD').fill('99.95');p.get_by_role('button',name='Save item',exact=True).click();saved(p);nav(p,'Shipments');expect(p.locator('.shipment-card')).to_contain_text('Citrus Cloud Cleanser / 1 unit / accepted cost $8.00')
  run('accepted contents and costs survive later inventory edits',snapshots)
  def stale(p,c):
   nav(p,'Inventory');p.get_by_role('button',name='Edit Citrus Cloud Cleanser',exact=True).click();p.get_by_label('Name',exact=True).fill('Unsaved name');other=c.new_page();other.goto('http://127.0.0.1:5181');new_item(other,'Other tab item');other.get_by_role('button',name='Save item',exact=True).click();saved(other);p.bring_to_front();p.get_by_role('button',name='Save item',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('another tab');expect(p.get_by_label('Name',exact=True)).to_have_value('Unsaved name')
   with p.expect_download() as event:p.get_by_role('button',name='Export editor draft',exact=True).click()
   assert json.loads(Path(event.value.path()).read_text())['draft']['name']=='Unsaved name';assert stored(p)['items'][0]['name']=='Citrus Cloud Cleanser'
  run('stale tab retains and exports its editor draft',stale)
  def lost(p,c):
   p.evaluate("""()=>{const original=Storage.prototype.setItem;let once=true;Storage.prototype.setItem=function(k,v){original.call(this,k,v);if(k==='parcelpilot-workspace-v1'&&once){once=false;throw new Error('Lost acknowledgement');}};}""")
   nav(p,'Box builder');p.get_by_role('button',name='Fill from recommendations').click();p.get_by_role('button',name='Reserve monthly box',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('Lost acknowledgement');key=stored(p)['shipments'][0]['requestKey'];expect(p.get_by_label('Cycle month')).to_be_disabled();p.get_by_role('button',name='Retry same reservation',exact=True).click();expect(p.locator('.shipment-card')).to_have_count(1);assert stored(p)['shipments'][0]['requestKey']==key;assert stored(p)['items'][0]['stock']==419
  run('lost acknowledgement retry returns the same reservation without stock loss',lost)
  def quota(p,c):
   p.evaluate("()=>{Storage.prototype.setItem=function(){throw new Error('Simulated quota failure');};}");new_item(p,'Quota draft');p.get_by_role('button',name='Save item',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('quota failure');expect(p.get_by_label('Name',exact=True)).to_have_value('Quota draft');assert p.evaluate('(key)=>localStorage.getItem(key)',KEY) is None
  run('failed storage write retains draft without successful acceptance',quota)
  def recovery(p,c):
   p.evaluate('(key)=>localStorage.setItem(key,"{broken")',KEY);p.reload();expect(p.get_by_role('heading',name='Workspace',exact=True)).to_be_visible()
   with p.expect_download() as event:p.get_by_role('button',name='Export original stored bytes').click()
   assert Path(event.value.path()).read_text()=='{broken'
   with p.expect_download() as event:p.get_by_role('button',name='Download clean sample backup').click()
   raw=Path(event.value.path()).read_bytes();p.get_by_label('Workspace JSON').set_input_files({'name':'sample.json','mimeType':'application/json','buffer':raw});expect(p.get_by_text('Validated backup:',exact=False)).to_be_visible();assert p.evaluate('(key)=>localStorage.getItem(key)',KEY)=='{broken';p.get_by_role('button',name='Replace with reviewed backup').click();expect(p.get_by_role('status')).to_contain_text('Reviewed backup restored');assert stored(p)['revision']==1
   before=p.evaluate('(key)=>localStorage.getItem(key)',KEY);p.get_by_label('Workspace JSON').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{}'});expect(p.get_by_role('alert')).to_be_visible();assert p.evaluate('(key)=>localStorage.getItem(key)',KEY)==before
  run('corrupt bytes export reviewed restore and invalid import rejection',recovery)
  def drafts(p,c):
   new_item(p,'Keep draft');p.remove_listener('dialog',accept_dialog);p.on('dialog',lambda dialog:dialog.dismiss());nav(p,'Overview');expect(p.get_by_label('Name',exact=True)).to_have_value('Keep draft')
  run('cancelled navigation preserves the unsaved editor',drafts)
  def pagination(p,c):
   new_item(p);p.get_by_role('button',name='Save item',exact=True).click();saved(p)
   p.evaluate("""key=>{const s=JSON.parse(localStorage.getItem(key));for(let i=0;i<11;i++)s.items.push({...s.items[0],id:'bulk-'+i,name:'Bulk '+i,tags:[]});s.revision++;localStorage.setItem(key,JSON.stringify(s));}""",KEY);p.reload();nav(p,'Inventory');expect(p.locator('.record-list > article')).to_have_count(20);p.get_by_role('button',name='Next',exact=True).click();expect(p.locator('.record-list > article')).to_have_count(1);p.get_by_role('button',name='Delete Bulk 10',exact=True).click();saved(p);expect(p.locator('.record-list > article')).to_have_count(20);expect(p.get_by_role('button',name='Next',exact=True)).to_be_disabled();p.get_by_label('Search inventory',exact=True).fill('[no match]');expect(p.get_by_text('No records match this search and filter.')).to_be_visible()
  run('pagination clamps after deletion and search treats punctuation literally',pagination)
  def layouts(p,c):
   for width in [1440,800,390]:
    p.set_viewport_size({'width':width,'height':1050});nav(p,'Overview');p.screenshot(path=str(OUT/f'overview-{width}.png'),full_page=True);assert p.evaluate('document.documentElement.scrollWidth<=innerWidth');assert p.locator('nav button').evaluate_all('(buttons)=>buttons.every(b=>b.scrollWidth<=b.clientWidth+1)');assert p.locator('.metric').evaluate_all('(cards)=>cards.every(c=>c.querySelector("span").getBoundingClientRect().bottom<=c.querySelector("strong").getBoundingClientRect().top)');nav(p,'Inventory');p.get_by_role('button',name='New item',exact=True).click();p.screenshot(path=str(OUT/f'editor-{width}.png'),full_page=True);assert p.evaluate('document.documentElement.scrollWidth<=innerWidth');p.get_by_role('button',name='Close editor',exact=True).click()
   nav(p,'Box builder');p.get_by_role('button',name='Fill from recommendations').click();p.screenshot(path=str(OUT/'builder-390.png'),full_page=True);assert p.evaluate('document.documentElement.scrollWidth<=innerWidth')
  run('desktop tablet and phone layouts keep controls readable',layouts)
  browser.close()
finally:
 server.terminate()
 try:server.wait(timeout=20)
 except subprocess.TimeoutExpired:server.kill();server.wait(timeout=20)
 log.close()
(OUT/'results.json').write_text(json.dumps({'passed':bool(results) and all(r['passed'] for r in results),'total':len(results),'checks':results},indent=2),encoding='utf-8')
raise SystemExit(0 if results and all(r['passed'] for r in results) else 1)
