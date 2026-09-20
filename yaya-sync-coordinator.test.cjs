const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const calls=[];
const pending=[];
class FakeResponse{
  constructor(label){this.ok=true;this.label=label;}
  clone(){return new FakeResponse(this.label);}
}
function controlledFetch(input,init={}){
  return new Promise((resolve,reject)=>{
    calls.push({url:String(input),method:String(init.method||'GET').toUpperCase()});
    pending.push({resolve,reject});
  });
}
const events=[];
const window={fetch:controlledFetch,dispatchEvent:e=>events.push(e)};
const context={window,location:{href:'https://example.test/yaya/'},API:'https://api.test/exec',URL,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init&&init.detail;}},setTimeout,clearTimeout,console};
vm.createContext(context);
vm.runInContext(fs.readFileSync('yaya-sync-coordinator.js','utf8'),context);

(async()=>{
  const first=window.fetch('https://api.test/exec?tabs=documents&_yaya=1');
  const duplicate=window.fetch('https://api.test/exec?tabs=documents&_yaya=2');
  await Promise.resolve();
  assert.equal(calls.length,1,'les lectures identiques doivent être fusionnées');
  pending.shift().resolve(new FakeResponse('documents'));
  assert.equal((await first).label,'documents');
  assert.equal((await duplicate).label,'documents');

  const docs=window.fetch('https://api.test/exec?tabs=documents');
  const orders=window.fetch('https://api.test/exec?tabs=commandes');
  await Promise.resolve();
  assert.equal(calls.length,3,'deux onglets différents ne doivent pas être fusionnés');
  pending.shift().resolve(new FakeResponse('documents-2'));
  pending.shift().resolve(new FakeResponse('orders'));
  await Promise.all([docs,orders]);

  const write=window.fetch('https://api.test/exec',{method:'POST'});
  const delayedRead=window.fetch('https://api.test/exec?tabs=achats');
  assert.equal(calls.length,4,'une lecture doit attendre la fin de l’écriture');
  pending.shift().resolve(new FakeResponse('write'));
  await write;
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(calls.length,5,'la lecture doit démarrer après l’écriture');
  pending.shift().resolve(new FakeResponse('achats'));
  await delayedRead;

  const metrics=window.__yayaSyncCoordinator.metrics();
  assert.equal(metrics.dedupedReads,1);
  assert.equal(metrics.delayedReads,1);
  assert.equal(metrics.writes,1);
  console.log('yaya-sync-coordinator: OK');
})().catch(error=>{console.error(error);process.exitCode=1;});
