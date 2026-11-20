import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const html=fs.readFileSync(new URL('../docs/callback.html', import.meta.url),'utf8');
const src=html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(src, 'inline script must exist');

function simulate(search) {
  const elements=new Map(['title','msg','open'].map(id=>[id,{textContent:'',href:'',hidden:false,classList:{add(c){if(c==='hidden') elements.get(id).hidden=true}}}]));
  const win={location:{search,pathname:'/obsidian-gsync-callback/callback.html',href:'https://rumba3333.github.io/obsidian-gsync-callback/callback.html'+search}};
  const histories=[];
  const ctx={window:win,document:{getElementById:(id)=>elements.get(id)},history:{replaceState:(_a,_b,uri)=>histories.push(uri)}, URLSearchParams,TextDecoder,Uint8Array,atob,encodeURIComponent, setTimeout:(fn)=>{fn();}};
  vm.runInNewContext(src,ctx,{timeout:1000});
  return {title:elements.get('title').textContent,msg:elements.get('msg').textContent,href:elements.get('open').href,hidden:elements.get('open').hidden,location:win.location.href,history:histories};
}
const encVault=Buffer.from('パーソナルファイル','utf8').toString('base64url');
test('code and state return to Obsidian, preserving vault and code',()=>{
  const v=simulate('?code=test-code%2B1&state=nonce~'+encVault);
  assert.equal(v.location,v.href);
  assert.ok(v.href.startsWith('obsidian://gsync-auth?'));
  const params=new URL(v.href).searchParams;
  assert.equal(params.get('vault'),'パーソナルファイル');
  assert.equal(params.get('code'),'test-code+1');
  assert.equal(params.get('state'),'nonce~'+encVault);
  assert.deepEqual(v.history,['/obsidian-gsync-callback/callback.html']);
});
test('empty callback does not navigate or expose a token',()=>{
  const v=simulate('');
  assert.equal(v.hidden,true);
  assert.equal(v.history.length,0);
  assert.ok(v.location.startsWith('https://'));
});
test('error callback forwards only error and no code',()=>{
  const v=simulate('?error=access_denied');
  assert.equal(new URL(v.href).searchParams.get('error'),'access_denied');
  assert.equal(new URL(v.href).searchParams.get('code'),null);
  assert.deepEqual(v.history,['/obsidian-gsync-callback/callback.html']);
});
test('malformed vault encoded state is handled without crashing',()=>{
  const v=simulate('?code=x&state=n~%25%25%25');
  assert.equal(new URL(v.href).searchParams.get('code'),'x');
});
test('static callback contains no obvious remote calls or trackers',()=>{
  for(const token of ['fetch(', 'XMLHttpRequest', 'sendBeacon(', 'WebSocket(', 'src="http', 'src="//', 'analytics', 'gtag(']){
    assert.equal(html.toLowerCase().includes(token.toLowerCase()),false,token);
  }
  assert.ok(html.includes('content="no-referrer"'));
});
