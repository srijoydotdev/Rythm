require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Dynamically import prisma (ES module)
async function getPrisma() {
  const { prisma } = await import('../src/app/lib/prisma.js');
  return prisma;
}

// Verify environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function uploadFiles() {
  const prisma = await getPrisma();
  try {
    // Songs (MP3/MP4)
    const songsDir = path.join(__dirname, '../public/songs');
    if (!fs.existsSync(songsDir)) {
      console.error(`Directory ${songsDir} does not exist`);
      return;
    }
    const songFiles = fs.readdirSync(songsDir).filter(f => f.endsWith('.mp3') || f.endsWith('.mp4'));
    console.log(`Found ${songFiles.length} song files`);

    for (const file of songFiles) {
      const existingSong = await prisma.song.findFirst({
        where: { filePath: { contains: file } },
      });
      if (existingSong && existingSong.filePath.startsWith('https://')) {
        console.log(`Skipping ${file}: Already uploaded to ${existingSong.filePath}`);
        continue;
      }

      console.log(`Uploading song: ${file}`);
      const filePath = path.join(songsDir, file);
      const fileContent = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from('songs')
        .upload(`songs/${file}`, fileContent, {
          contentType: file.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4',
        });

      if (error) {
        console.error(`Error uploading song ${file}:`, error.message);
        continue;
      }

      const publicUrl = supabase.storage.from('songs').getPublicUrl(`songs/${file}`).data.publicUrl;

      await prisma.song.updateMany({
        where: { filePath: { contains: file } },
        data: { filePath: publicUrl },
      });

      console.log(`Uploaded song ${file} to ${publicUrl}`);
    }

    // Cover Images (JPG/PNG)
    const coversDir = path.join(__dirname, '../public/images');
    if (!fs.existsSync(coversDir)) {
      console.error(`Directory ${coversDir} does not exist`);
      return;
    }
    const coverFiles = fs.readdirSync(coversDir).filter(f => f.match(/\.(jpg|png|jpeg)$/i));
    console.log(`Found ${coverFiles.length} cover image files`);

    for (const file of coverFiles) {
      const existingSong = await prisma.song.findFirst({
        where: { cover: { contains: file } },
      });
      if (existingSong && existingSong.cover?.startsWith('https://')) {
        console.log(`Skipping cover ${file}: Already uploaded to ${existingSong.cover}`);
        continue;
      }

      console.log(`Uploading cover image: ${file}`);
      const filePath = path.join(coversDir, file);
      const fileContent = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from('covers')
        .upload(`covers/${file}`, fileContent, {
          contentType: `image/${file.split('.').pop().toLowerCase()}`,
        });

      if (error) {
        console.error(`Error uploading cover ${file}:`, error.message);
        continue;
      }

      const publicUrl = supabase.storage.from('covers').getPublicUrl(`covers/${file}`).data.publicUrl;

      await prisma.song.updateMany({
        where: { cover: { contains: file } },
        data: { cover: publicUrl },
      });

      console.log(`Uploaded cover ${file} to ${publicUrl}`);
    }

    // Cover Videos (MP4)
    const coverVideosDir = path.join(__dirname, '../public/video');
    if (!fs.existsSync(coverVideosDir)) {
      console.error(`Directory ${coverVideosDir} does not exist`);
      return;
    }
    const coverVideoFiles = fs.readdirSync(coverVideosDir).filter(f => f.endsWith('.mp4'));
    console.log(`Found ${coverVideoFiles.length} cover video files`);

    for (const file of coverVideoFiles) {
      const existingSong = await prisma.song.findFirst({
        where: { coverVideo: { contains: file } },
      });
      if (existingSong && existingSong.coverVideo?.startsWith('https://')) {
        console.log(`Skipping cover video ${file}: Already uploaded to ${existingSong.coverVideo}`);
        continue;
      }

      console.log(`Uploading cover video: ${file}`);
      const filePath = path.join(coverVideosDir, file);
      const fileContent = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from('covers')
        .upload(`covers/${file}`, fileContent, {
          contentType: 'video/mp4',
        });

      if (error) {
        console.error(`Error uploading cover video ${file}:`, error.message);
        continue;
      }

      const publicUrl = supabase.storage.from('covers').getPublicUrl(`covers/${file}`).data.publicUrl;

      await prisma.song.updateMany({
        where: { coverVideo: { contains: file } },
        data: { coverVideo: publicUrl },
      });

      console.log(`Uploaded cover video ${file} to ${publicUrl}`);
    }

    // Verification Documents (PDF/DOC/DOCX)
    const docsDir = path.join(__dirname, '../public/docs');
    if (!fs.existsSync(docsDir)) {
      console.error(`Directory ${docsDir} does not exist`);
      return;
    }
    const docFiles = fs.readdirSync(docsDir).filter(f => f.match(/\.(pdf|doc|docx)$/i));
    console.log(`Found ${docFiles.length} verification document files`);

    for (const file of docFiles) {
      const existingDoc = await prisma.artistProfile.findFirst({
        where: { verificationDoc: { contains: file } },
      });
      if (existingDoc && existingDoc.verificationDoc?.startsWith('https://')) {
        console.log(`Skipping doc ${file}: Already uploaded to ${existingDoc.verificationDoc}`);
        continue;
      }

      console.log(`Uploading verification doc: ${file}`);
      const filePath = path.join(docsDir, file);
      const fileContent = fs.readFileSync(filePath);

      const { data, error } = await supabase.storage
        .from('verification-docs')
        .upload(`docs/${file}`, fileContent, {
          contentType: `application/${file.split('.').pop().toLowerCase() === 'pdf' ? 'pdf' : 'msword'}`,
        });

      if (error) {
        console.error(`Error uploading doc ${file}:`, error.message);
        continue;
      }

      const publicUrl = supabase.storage.from('verification-docs').getPublicUrl(`docs/${file}`).data.publicUrl;

      await prisma.artistProfile.updateMany({
        where: { verificationDoc: { contains: file } },
        data: { verificationDoc: publicUrl },
      });

      console.log(`Uploaded doc ${file} to ${publicUrl}`);
    }
  } catch (error) {
    console.error('Script error:', error.message);
  }
}

uploadFiles()
  .catch(console.error)
  .finally(async () => {
    const prisma = await getPrisma();
    await prisma.$disconnect();
  });