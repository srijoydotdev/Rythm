import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PrismaClient } from '../../../../generated/prisma';
import { supabase } from '../../../lib/supabase';

const prisma = new PrismaClient();

export default function EditListenerProfile() {
const router = useRouter();
const { id } = router.query;
const [profile, setProfile] = useState({
username: '',
fullName: '',
aboutMe: '',
profilePic: '',
});

useEffect(() => {
if (id) {
prisma.listenerProfile.findUnique({ where: { id } }).then((data) => {
if (data) setProfile(data);
});
}
}, [id]);

const handleSubmit = async (e) => {
e.preventDefault();
await prisma.listenerProfile.update({
where: { id },
data: { ...profile },
});
router.push(`/profile/listener/${id}`);
};

return (
<div className="p-4">
<h1 className="text-2xl">Edit Profile</h1>
<form onSubmit={handleSubmit}>
<input
type="text"
value={profile.username}
onChange={(e) => setProfile({ ...profile, username: e.target.value })}
placeholder="Username"
className="border p-2 m-2"
/>
<input
type="text"
value={profile.fullName}
onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
placeholder="Full Name"
className="border p-2 m-2"
/>
<textarea
value={profile.aboutMe}
onChange={(e) => setProfile({ ...profile, aboutMe: e.target.value })}
placeholder="About Me"
className="border p-2 m-2"
/>
<input
type="text"
value={profile.profilePic}
onChange={(e) => setProfile({ ...profile, profilePic: e.target.value })}
placeholder="Profile Pic URL"
className="border p-2 m-2"
/>
<button type="submit" className="bg-blue-500 text-white p-2">
Save
</button>
</form>
</div>
);
}