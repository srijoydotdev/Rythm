import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export default function ListenerProfile() {
const router = useRouter();
const { id } = router.query;
const [profile, setProfile] = useState(null);

useEffect(() => {
if (id) {
prisma.listenerProfile
.findUnique({ where: { id }, include: { user: true } })
.then(setProfile);
}
}, [id]);

if (!profile) return <div>Loading...</div>;

return (
<div className="p-4">
<h1 className="text-2xl">{profile.username}</h1>
<img src={profile.profilePic || '/default-pic.jpg'} alt="Profile" className="w-32 h-32" />
<p>{profile.aboutMe}</p>
<button
onClick={() => router.push(`/profile/listener/edit/${id}`)}
className="bg-blue-500 text-white p-2"
>
Edit Profile
</button>
</div>
);
}