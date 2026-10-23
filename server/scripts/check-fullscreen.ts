import assert from 'node:assert/strict';
import {fullscreenState,requestPageFullscreen} from '../../react-native-app/lib/fullscreen';

async function main(){
 let checks=0,calls=0;
 const unsupported={documentElement:{},fullscreenEnabled:false};
 assert.deepEqual(await requestPageFullscreen(unsupported),{active:false,supported:false,standalone:false});checks++;
 const standard:any={fullscreenEnabled:true,documentElement:{async requestFullscreen(){calls++;standard.fullscreenElement={};}}};
 assert.equal((await requestPageFullscreen(standard)).active,true);checks++;
 await requestPageFullscreen(standard);assert.equal(calls,1);checks++;
 const safari:any={webkitFullscreenEnabled:true,documentElement:{async webkitRequestFullscreen(){safari.webkitFullscreenElement={};}}};
 assert.equal((await requestPageFullscreen(safari)).active,true);checks++;
 assert.equal(fullscreenState(unsupported,{navigator:{standalone:true}}).active,true);checks++;
 assert.equal(fullscreenState(unsupported,{matchMedia:()=>({matches:true})}).standalone,true);checks++;
 const denied={fullscreenEnabled:true,documentElement:{async requestFullscreen(){throw Error('permission denied');}}};
 await assert.rejects(requestPageFullscreen(denied),/permission denied/);checks++;
 assert.equal(fullscreenState(denied).active,false);checks++;
 const inactive={fullscreenEnabled:true,documentElement:{async requestFullscreen(){}}};
 assert.equal((await requestPageFullscreen(inactive)).active,false);checks++;
 assert.equal(fullscreenState(undefined).supported,false);checks++;
 console.log(`PASS: ${checks} fullscreen capability, iOS standalone, unsupported and rejected request checks.`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
