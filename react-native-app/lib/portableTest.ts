const magic=new TextEncoder().encode('LUMINA_TEST_001!');
/** Attach a signed, data-only test to the portable Windows application. */
export function portableTest(executable:ArrayBuffer,test:unknown):Blob{
 const image=new Uint8Array(executable);
 if(image.length<100000||image.length>20_000_000||image[0]!==77||image[1]!==90)throw Error('Бағдарлама жүктелмеді. Қайта көріңіз.');
 const file=test as any;
 if(file?.format!=='lumina-test'||file.version!==1||!file.package||typeof file.proof!=='string')throw Error('Тест файлы жарамсыз.');
 const data=new TextEncoder().encode(JSON.stringify(test));
 if(!data.length||data.length>5_500_000)throw Error('Тест файлы тым үлкен.');
 const length=new Uint8Array(4);new DataView(length.buffer).setUint32(0,data.length,true);
 return new Blob([executable,data,length,magic],{type:'application/octet-stream'});
}
