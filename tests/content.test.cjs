const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const cache=new Map();
function load(file){if(cache.has(file))return cache.get(file);const source=fs.readFileSync(file,'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const mod={exports:{}};new Function('require','module','exports',code)(name=>name.startsWith('@/')?load(path.join(root,name.slice(2)+'.ts')):name.startsWith('.')?load(path.resolve(path.dirname(file),name+'.ts')):require(name),mod,mod.exports);cache.set(file,mod.exports);return mod.exports;}
const {contentSchema,safeLink,pageKeys}=load(path.join(root,'lib/cms/schema.ts'));
const {defaultContent}=load(path.join(root,'lib/cms/defaults.ts'));
test('all five initial documents pass the same validation used when publishing',()=>{for(const key of pageKeys)assert.equal(contentSchema.safeParse(defaultContent[key]).success,true,key);});
test('links allow local routes, enquiry anchors and secure external destinations',()=>{for(const value of ['','/admissions?course=Video%20Editing','#enquire','https://rakvih.in'])assert.equal(safeLink.safeParse(value).success,true,value);});
test('links reject script, data, protocol-relative and backslash destinations',()=>{for(const value of ['javascript:alert(1)','data:text/html,hello','//external.example','/\\external.example','http://example.com','https://example.com\n'])assert.equal(safeLink.safeParse(value).success,false,value);});
test('invalid and unbounded content is rejected',()=>{const doc=structuredClone(defaultContent.courses);doc.banner.title='';assert.equal(contentSchema.safeParse(doc).success,false);doc.banner.title='Course';doc.sections[0].items[0].description='x'.repeat(20001);assert.equal(contentSchema.safeParse(doc).success,false);});
test('published empty lists remain empty',()=>{const doc=structuredClone(defaultContent.courses);doc.sections[0].items=[];const parsed=contentSchema.parse(doc);assert.deepEqual(parsed.sections[0].items,[]);});
