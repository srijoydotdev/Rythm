import { supabaseServer } from '../../../lib/supabaseServer';
import { syncUserWithPrisma } from '../../../lib/auth';

export default async function handler(req, res) {
const { code } = req.query;
const { data, error } = await supabaseServer.auth.exchangeCodeForSession(code);
if (error) return res.status(400).json({ error: error.message });
await syncUserWithPrisma(data.user);
res.redirect('/dashboard');
}