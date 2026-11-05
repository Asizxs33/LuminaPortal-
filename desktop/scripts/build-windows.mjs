import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
// rustup's default location also works when its installer has not changed PATH.
const env={...process.env};const pathKey=Object.keys(env).find(k=>k.toLowerCase()==='path')||'PATH';
const rustBin=path.join(os.homedir(),'.cargo','bin');
if(existsSync(path.join(rustBin,'cargo.exe')))env[pathKey]=rustBin+path.delimiter+(env[pathKey]||'');
const result=spawnSync(process.execPath,['node_modules/@tauri-apps/cli/tauri.js','build'],{stdio:'inherit',env});
process.exit(result.status??1);
