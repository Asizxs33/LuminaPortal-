import {test} from 'node:test';import assert from 'node:assert/strict';
import {portableTest} from '../../react-native-app/lib/portableTest';
const stub=()=>{const a=new Uint8Array(100000);a[0]=77;a[1]=90;return a.buffer;};
const file={format:'lumina-test',version:1,proof:'signed',package:{title:'Қазақша тест'}};
test('portable EXE preserves image and carries Unicode test in bounded trailer',async()=>{const bytes=new Uint8Array(await portableTest(stub(),file).arrayBuffer());assert.equal(bytes[0],77);assert.equal(bytes[1],90);assert.equal(new TextDecoder().decode(bytes.slice(-16)),'LUMINA_TEST_001!');const len=new DataView(bytes.buffer).getUint32(bytes.length-20,true);assert.deepEqual(JSON.parse(new TextDecoder().decode(bytes.slice(-20-len,-20))),file);assert.equal(bytes.length,100000+len+20);});
test('refuses an HTML error page instead of executable',()=>assert.throws(()=>portableTest(new TextEncoder().encode('<html>error</html>').buffer,file)));
test('refuses unknown test formats',()=>assert.throws(()=>portableTest(stub(),{format:'other'})));
test('refuses oversized test data',()=>assert.throws(()=>portableTest(stub(),{...file,package:{text:'x'.repeat(5_500_000)}})));
