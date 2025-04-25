// prisma/seed.js
import { PrismaClient } from '../generated/prisma/index.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

// Helper function to convert duration string (e.g., '2:30') to seconds
function parseDuration(durationStr) {
  const [minutes, seconds] = durationStr.split(':').map(Number);
  return minutes * 60 + seconds;
}

async function main() {
  // Pre-seed User (required for ArtistProfile)
  await prisma.user.upsert({
    where: { id: 'user-uuid-123' },
    update: {},
    create: {
      id: 'user-uuid-123',
      email: 'dj@example.com',
      role: 'ARTIST',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Pre-seed ArtistProfile (required for Song.artistId)
  await prisma.artistProfile.upsert({
    where: { userId: 'user-uuid-123' },
    update: {},
    create: {
      id: 'artist-uuid-123',
      userId: 'user-uuid-123',
      coverImage: '/images/cover_djdroolz.jpg', // Path in /public
      genreTags: ['lo-fi', 'electronic'],
      socialLinks: { twitter: 'https://x.com/djdroolz' },
      isVerified: true,
      verificationStatus: 'APPROVED',
      verificationDoc: '/docs/djdroolz.pdf', // Path in /public
      portfolioLinks: ['https://soundcloud.com/djdroolz'],
      artisticVision: 'Blending lo-fi and electronic music.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Song data with corrected fields
  const songData = [
    {
      id: '1',
      title: 'SELFISH',
      artistId: 'artist-uuid-123',
      duration: parseDuration('2:30'),
      cover: '/images/selfish.png',
      coverVideo: '/videos/selfish.mp4',
      lyrics: `Baby I could fall in love with me\nAm I selfish?\nIf myself and I agree, huh\nI can't help it\nI'm just who I'm meant to be with\n...`,
      filePath: '/songs/selfish.mp3',
      genre: 'Pop',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'YOU HAUNT ME',
      artistId: 'artist-uuid-123',
      duration: parseDuration('2:42'),
      cover: '/images/you-haunt-me.jpg',
      coverVideo: '/videos/you-haunt-me.mp4',
      lyrics: `I'm done with the long nights\nAll eyes on us at a stop light\nAll I want is a sign\nMake up your mind\n...`,
      filePath: '/songs/you-haunt-me.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'new-to-this',
      artistId: 'artist-uuid-123',
      duration: parseDuration('1:27'),
      cover: '/images/new-to-this.jpg',
      coverVideo: null,
      lyrics: `And I'm not new to this, baby, I'm really true to this\nI did it on my own, nobody can really do this shit\n...`,
      filePath: '/songs/new-to-this.mp3',
      genre: 'Hip-Hop',
      createdAt: new Date(),
    },
    {
      id: '4',
      title: 'The Night We Met',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:28'),
      cover: '/images/night-we-met.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/night-we-met.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '5',
      title: 'Greedy',
      artistId: 'artist-uuid-123',
      duration: parseDuration('0:26'),
      cover: '/images/greedy.jpg',
      coverVideo: '/videos/greedy.mp4',
      lyrics: null,
      filePath: '/songs/greedy.mp3',
      genre: 'cover',
      createdAt: new Date(),
    },
    {
      id: '6',
      title: 'Healer',
      artistId: 'artist-uuid-123',
      duration: parseDuration('2:36'),
      cover: '/images/healer.png',
      coverVideo: null,
      lyrics: `VERSE\nOoh scared to walk away\nCan’t bear the thought of change\nOoh torn between today\nAnd the turning of the page\n...`,
      filePath: '/songs/healer.mp3',
      genre: 'acoustic',
      createdAt: new Date(),
    },
    {
      id: '7',
      title: 'Afusic',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:10'),
      cover: '/images/afusic.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/afusic.mp3',
      genre: 'Unknown',
      createdAt: new Date(),
    },
    {
      id: '8',
      title: 'Baraat',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:29'),
      cover: '/images/baraat.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/baraat.mp3',
      genre: 'Electronic',
      createdAt: new Date(),
    },
    {
      id: '9',
      title: 'Bawe',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:15'),
      cover: '/images/bawe.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/bawe.mp3',
      genre: 'Hip-Hop',
      createdAt: new Date(),
    },
    {
      id: '10',
      title: 'Cold Mess',
      artistId: 'artist-uuid-123',
      duration: parseDuration('4:01'),
      cover: '/images/cold-mess.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/cold-mess.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '11',
      title: 'Fasle',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:45'),
      cover: '/images/fasle.jpeg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/fasle.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '12',
      title: 'Iradey',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:50'),
      cover: '/images/iradey.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/iradey.mp3',
      genre: 'Pop',
      createdAt: new Date(),
    },
    {
      id: '13',
      title: 'Kya Tu Theek Hai',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:40'),
      cover: '/images/kya-tu-theek-hai.png',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/kya-tu-theek-hai.mp3',
      genre: 'Hip-Hop',
      createdAt: new Date(),
    },
    {
      id: '14',
      title: 'Lumineer',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:30'),
      cover: '/images/lumineer.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/lumineer.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '15',
      title: 'Maharani',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:20'),
      cover: '/images/maharani.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/maharani.mp3',
      genre: 'Punjabi Pop',
      createdAt: new Date(),
    },
    {
      id: '16',
      title: 'Mann',
      artistId: 'artist-uuid-123',
      duration: parseDuration('4:05'),
      cover: '/images/mann.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/mann.mp3',
      genre: 'Indie Rock',
      createdAt: new Date(),
    },
    {
      id: '17',
      title: 'Mujhe Tum Nazar Se',
      artistId: 'artist-uuid-123',
      duration: parseDuration('5:20'),
      cover: '/images/mujhe-tum-nazar-se.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/mujhe-tum-nazar-se.mp3',
      genre: 'Ghazal',
      createdAt: new Date(),
    },
    {
      id: '18',
      title: 'Neighbourhood Sweater',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:25'),
      cover: '/images/neighbourhood.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/neighbourhood-sweater.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '19',
      title: 'Pal Pal',
      artistId: 'artist-uuid-123',
      duration: parseDuration('4:12'),
      cover: '/images/afusic.jpeg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/pal-pal.mp3',
      genre: 'Bollywood',
      createdAt: new Date(),
    },
    {
      id: '20',
      title: 'Paro',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:30'),
      cover: '/images/paro.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/paro.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '21',
      title: 'Rab Da Banda',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:55'),
      cover: '/images/rab-da-banda.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/rab-da-banda.mp3',
      genre: 'Devotional Bhajan',
      createdAt: new Date(),
    },
    {
      id: '22',
      title: 'Sunday',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:10'),
      cover: '/images/sunday.jpeg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/sunday.mp3',
      genre: 'Pop',
      createdAt: new Date(),
    },
    {
      id: '23',
      title: 'Hello miss Johnson',
      artistId: 'artist-uuid-123',
      duration: parseDuration('2:51'),
      cover: '/images/hello-miss-johnson.jpg',
      coverVideo: '/videos/hello-miss-johnson.mp4',
      lyrics: null,
      filePath: '/songs/hello-miss-johnson.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '24',
      title: 'Tu Hoti Toh',
      artistId: 'artist-uuid-123',
      duration: parseDuration('4:00'),
      cover: '/images/tu-hoti-toh.jpg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/tu-hoti-toh.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
    {
      id: '25',
      title: 'When U High',
      artistId: 'artist-uuid-123',
      duration: parseDuration('3:30'),
      cover: '/images/Ar.jpeg',
      coverVideo: null,
      lyrics: null,
      filePath: '/songs/when-u-high.mp3',
      genre: 'Indie',
      createdAt: new Date(),
    },
  ];

  // Seed songs
  for (const song of songData) {
    await prisma.song.upsert({
      where: { id: song.id },
      update: song,
      create: song,
    });
  }

  console.log('Seeded 25 songs successfully');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });