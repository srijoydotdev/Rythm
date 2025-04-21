import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export default function EditArtistProfile() {
const router = useRouter();
const { id } = router.query;
const [profile, setProfile] = useState({
stageName: '',
bio: '',
coverImage: '',
profilePic: '',
genreTags: [],
instrumentTags: [],
});

useEffect(() => {
if (id) {
prisma.artistProfile.findUnique({ where: { id } }).then((data) => {
if (data) setProfile(data);
});
}
}, [id]);

const handleSubmit = async (e) => {
e.preventDefault();
await prisma.artistProfile.update({
where: { id },
data: {
...profile,
genreTags: profile.genreTags.split(',').map((tag) => tag.trim()),
instrumentTags: profile.instrumentTags.split(',').map((tag) => tag.trim()),
},
});
router.push(`/profile /artist/${id}`);
};

return (
<div className="p-4">
<h1 className="text-2xl">Edit Artist Profile</h1>
<form onSubmit={handleSubmit}>
<input
type="text"
value={profile.stageубName}
onChange={(e) => setProfile({ ...profile, stageName: e.target.value })}
placeholder="Stage Name"
className="border p-2 m-2"
/>
<textarea
value={profile.bio}
onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
placeholder="Bio"
className="border p-2 m-2"
/>
<input
type="text"
value={profile.coverImage}
onChange={(e) => setProfile({ ...profile, coverImage: e.target.value })}
placeholder="Cover Image URL"
className="border p-2 m-2"
/>
<input
type="text"
value={profile.profilePic}
onChange={(e) => setProfile({ ...profile, profilePic: e.target.value })}
placeholder="Profile Pic URL"
className="border p-2 m-2"
/>
<input
type="text"
value={profile.genreTags.join(', ')}
onChange={(e) => setProfile({ ...profile, genreTags: e.target.value })}
placeholder="Genres (comma-separated)"
className="border p-2 m-2"
/>
<input
type="text"
value={profile.instrumentTags.join(', ')}
onChange={(e) => setProfile({ ...profile, instrumentTags: e.target.value })}
placeholder="Instruments (comma-separated)"
className="border p-2 m-2"
/>
<button type="submit" className="bg-blue-500 text-white p-2">
Save
</button>
</form>
</div>
);
}