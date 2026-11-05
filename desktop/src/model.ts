export interface Option {id:number;text:string;is_correct:boolean}
export interface Question {id:number;text:string;type:string;options:Option[]}
export interface Test {id:string;title:string;subject:string;language:string;round:number;duration_minutes:number;passing_score:number;questions_per_attempt:number;questions:Question[]}
export interface TestFile {format:'lumina-test';version:1;proof:string;package:{id:string;exported_at:string;tests:Test[]}}
export interface Attempt {id:string;file:TestFile;testId:string;studentName:string;studentEmail:string;questions:Question[];answers:Record<string,number>;flagged:number[];index:number;startedAt:number;deadline:number;finishedAt?:number;uploadedId?:number}
export interface State {file?:TestFile;attempt?:Attempt;history:Attempt[]}
export function parseTest(raw:string):TestFile {
 if(raw.length>5_500_000)throw Error('Файл слишком большой. Максимум 5 МБ.');
 const f=JSON.parse(raw);
 if(f?.format!=='lumina-test'||f.version!==1||typeof f.proof!=='string'||!f.package||!Array.isArray(f.package.tests)||!f.package.tests.length||f.package.tests.length>3)throw Error('Выберите файл .lumina-test, скачанный с сайта.');
 const ids=new Set();const languages=new Set();
 for(const t of f.package.tests){
  if(typeof t.id!=='string'||ids.has(t.id)||!['kk','ru','en'].includes(t.language)||languages.has(t.language)||typeof t.title!=='string'||t.title.length>2000||typeof t.subject!=='string'||!Number.isInteger(t.duration_minutes)||t.duration_minutes<1||t.duration_minutes>1440||!Number.isInteger(t.questions_per_attempt)||t.questions_per_attempt<0||t.questions_per_attempt>5000||!Number.isFinite(t.passing_score)||t.passing_score<0||t.passing_score>100||!Array.isArray(t.questions)||!t.questions.length||t.questions.length>5000)throw Error('Неверные настройки теста. Скачайте файл заново.');
  ids.add(t.id);languages.add(t.language);const qids=new Set();
  for(const q of t.questions){
   if(q.type==='CODE'||!Number.isSafeInteger(q.id)||qids.has(q.id)||typeof q.text!=='string'||q.text.length>50000||!Array.isArray(q.options)||q.options.length<2||q.options.length>20||q.options.filter((o:Option)=>o.is_correct===true).length!==1)throw Error('Неверный формат вопросов.');
   qids.add(q.id);const oids=new Set();for(const o of q.options){if(!Number.isSafeInteger(o.id)||oids.has(o.id)||typeof o.text!=='string'||o.text.length>50000||typeof o.is_correct!=='boolean')throw Error('Неверный формат ответов.');oids.add(o.id);}
  }
 }
 return f;
}
export function shuffled<T>(values:T[]):T[]{const a=[...values];for(let i=a.length-1;i>0;i--){const x=new Uint32Array(1);crypto.getRandomValues(x);const j=Math.floor(x[0]/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function begin(file:TestFile,testId:string,name:string,email:string,now=Date.now()):Attempt {
 const t=file.package.tests.find(t=>t.id===testId);if(!t)throw Error('Выберите язык теста.');
 if(!name.trim()||name.trim().length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)throw Error('Укажите имя и почту вашего аккаунта на сайте.');
 const count=t.questions_per_attempt===0?t.questions.length:Math.min(t.questions_per_attempt,t.questions.length);
 return {id:crypto.randomUUID(),file,testId,studentName:name.trim(),studentEmail:email.trim().toLowerCase(),questions:shuffled(t.questions).slice(0,count).map(q=>({...q,options:shuffled(q.options)})),answers:{},flagged:[],index:0,startedAt:now,deadline:now+t.duration_minutes*60000};
}
export function resultPayload(a:Attempt){
 if(!a.finishedAt)throw Error('Сначала завершите тест.');
 return {format:'lumina-result',version:1,action:'desktopImport',file:a.file,test_id:a.testId,question_ids:a.questions.map(q=>q.id),answers:a.answers,submission_id:a.id,student_email:a.studentEmail,time_spent:Math.max(0,Math.floor((Math.min(a.finishedAt,a.deadline)-a.startedAt)/1000))};
}
export const score=(a:Attempt)=>a.questions.filter(q=>q.options.some(o=>o.id===a.answers[q.id]&&o.is_correct)).length;
export const clock=(s:number)=>`${String(Math.floor(Math.max(0,s)/60)).padStart(2,'0')}:${String(Math.max(0,s)%60).padStart(2,'0')}`;
