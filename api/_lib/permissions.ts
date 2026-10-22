export type Role = 'student' | 'teacher' | 'admin';
export const isStaff = (role?: string) => role === 'admin' || role === 'teacher';
export async function ownsTest(db: any, actor: {id:number;role:string}, testId: unknown) {
 if(actor.role==='admin')return true;
 if(actor.role!=='teacher'||typeof testId!=='string')return false;
 return !!(await db.query('SELECT 1 FROM tests WHERE id=$1 AND created_by=$2',[testId,actor.id])).rowCount;
}
