import { supabase } from './supabase';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function syncUserWithPrisma(user) {
if (!user) return;
const { id, email, user_metadata } = user;
await prisma.user.upsert({
where: { id },
update: { email },
create: {
id,
email,
listenerProfile: user_metadata.userType === 'LISTENER' ? { create: {} } : undefined,
artistProfile: user_metadata.userType === 'ARTIST' ? { create: {} } : undefined,
},
});
}