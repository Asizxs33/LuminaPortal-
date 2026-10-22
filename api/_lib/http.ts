import type {IncomingMessage,ServerResponse} from 'node:http';
// Structural request/response contract shared by Vercel Node and the local Express adapter.
export type VercelRequest = IncomingMessage & {query:Record<string,string|string[]|undefined>;body:any};
export type VercelResponse = ServerResponse & {
 status(code:number):VercelResponse;
 json(body:any):VercelResponse;
 send(body:any):VercelResponse;
};
