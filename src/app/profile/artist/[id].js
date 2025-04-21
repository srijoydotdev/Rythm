import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export default function ArtistProfile() {
const router = useRouter();
const { id } = router.query;
const [profile, setProfile] = useState(null);

useEffect(() => {
if (id) {
prisma.artistProfile
.findUnique({
where: { id },
include: { user: true, songs: true },
})
.then(setProfile);
}
}, [id]);

if (!profile) return <div>Loading...</div>;

return (
<div className="p-4">
<h1 className="text-2xl">{profile.stageName}</h1>
<img src={profile.coverImage || '/default-cover.jpg'} alt="Cover" className="w-full h-48" />
<img src={profile.profilePic || '/default-pic.jpg'} alt="Profile" className="w-32 h-32" />
<p>{profile.bio}</p>
<p>Genres: {profile.genreTags.join(', ')}</p>
<p>Instruments: {profile.instrumentTags.join(', ')}</p>
<h2>Songs</h2>
<ul>
{profile.songs.map((song) => (
<li key={song.id}>{song.title}</li>
))}
</ul>
<button
onClick={() => router.push(`/profile/artist/edit/${id}`)}
className="bg-blue-500 text-white p-2"
>
Edit Profile
</button>
</div>
);
}