import test from 'node:test';
import assert from 'node:assert/strict';
import { DemoAudioCoordinator } from '../src/lib/playable-demo-protocol.ts';

test('changing games silences every previous owner before enabling the next one', () => {
  const active = new Set(), events = [];
  const coordinator = new DemoAudioCoordinator(['a','b','c'].map(id => ({id,setActive(value) {
    events.push([id,value]);
    if(value)active.add(id);else active.delete(id);
    assert.ok(active.size <= 1, 'two games became audible at once');
  }})));
  for(const id of ['a','b','c','a','c','b']) {
    events.length=0;assert.equal(coordinator.activate(id),true);
    assert.deepEqual([...active],[id]);assert.equal(coordinator.activeId,id);
    assert.equal(events.at(-1)[0],id);assert.equal(events.at(-1)[1],true);
    assert.ok(events.slice(0,-1).every(([,value])=>value===false));
  }
  assert.equal(coordinator.activate('unknown'),false);
  assert.deepEqual([...active],['b']);
  coordinator.pause();assert.equal(active.size,0);assert.equal(coordinator.activeId,null);
});

test('an already selected game stays the sole owner after asynchronous readiness', () => {
  const states={a:false,b:false,c:false};
  const coordinator=new DemoAudioCoordinator(Object.keys(states).map(id=>({id,setActive:value=>states[id]=value})));
  coordinator.activate('a');coordinator.activate('b');
  // A's late mount receives its own false state; it does not select itself.
  assert.equal(coordinator.activeId,'b');assert.equal(states.a,false);
  coordinator.activate(coordinator.activeId);
  assert.deepEqual(states,{a:false,b:true,c:false});
  coordinator.pause();coordinator.pause();assert.deepEqual(states,{a:false,b:false,c:false});
});
