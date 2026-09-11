const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const storage=new Map();
const window={addEventListener(){}};
const context={
  window,
  localStorage:{
    getItem:key=>storage.has(key)?storage.get(key):null,
    setItem:(key,value)=>storage.set(key,String(value)),
    removeItem:key=>storage.delete(key)
  },
  document:{querySelector(){return null;}},
  console,
  setTimeout(){return 0;},
  clearTimeout(){},
  AbortController,
  API:'https://example.invalid/exec'
};

let source=fs.readFileSync('heures-save-persistence.js','utf8');
source=source.replace(
  '  installSave();',
  '  window.__hoursTest={putPending,readPending,mergePendingIntoHours,weekPayload,clearConfirmed,pendingItemsForWeek};\n  installSave();'
);
vm.runInNewContext(source,context,{filename:'heures-save-persistence.js'});

const api=window.__hoursTest;
const week='2026-09-07';
const row=(sid,jour,heures,ref)=>({semaine:week,salarieId:sid,jour,type:'chantier',ref,heures,taux:50});

api.putPending(week,'kevin-2',[row('kevin-2',0,8,'C1')],false);
api.putPending(week,'morvan',[row('morvan',0,4,'C2'),row('morvan',0,4,'C3')],false);
const store=api.readPending();
const remote=[row('kevin-2',0,2,'OLD'),row('morvan',0,1,'OLD'),row('jimmy',0,8,'C4')];

const merged=api.mergePendingIntoHours(remote,store);
assert.equal(merged.filter(r=>r.salarieId==='kevin-2').length,1);
assert.equal(merged.filter(r=>r.salarieId==='morvan').length,2);
assert.equal(merged.filter(r=>r.salarieId==='jimmy').length,1);

const payload=api.weekPayload(remote,store,week);
assert.equal(payload.filter(r=>r.salarieId==='kevin-2').length,1);
assert.equal(payload.filter(r=>r.salarieId==='morvan').length,2);
assert.equal(payload.filter(r=>r.salarieId==='jimmy').length,1);

api.clearConfirmed(store,payload);
assert.equal(Object.keys(store.items).length,0);

api.putPending(week,'kevin-2',[row('kevin-2',1,8,'C5')],false);
const mismatch=api.readPending();
api.clearConfirmed(mismatch,remote);
assert.equal(Object.keys(mismatch.items).length,1);

console.log('heures-save-persistence: tests OK');
