require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const prisma = new PrismaClient();

async function reviewArtist(userId, status) {
  try {
    const { data: artistProfile } = await prisma.artistProfile.findUnique({ where: { userId } });
    if (!artistProfile) throw new Error('Artist not found');

    const { data: docData, error: docError } = await supabase.storage
      .from('verification-docs')
      .download(`docs/${userId}.json`);
    if (docError) throw new Error(docError.message);

    const docText = await docData.text();
    const doc = JSON.parse(docText);
    console.log('Artist Verification Data:', doc);

    await prisma.artistProfile.update({
      where: { userId },
      data: {
        verificationStatus: status,
        genreTags: doc.genreTags,
        socialLinks: doc.socialLinks,
        portfolioLinks: doc.portfolioLinks,
        artisticVision: doc.artisticVision,
        isVerified: status === 'APPROVED',
      },
    });

    console.log(`Artist ${userId} status updated to ${status}`);
  } catch (error) {
    console.error('Error reviewing artist:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const userId = process.argv[2];
const status = process.argv[3];
if (!userId || !['APPROVED', 'REJECTED'].includes(status)) {
  console.error('Usage: node scripts/reviewArtist.cjs <userId> <APPROVED|REJECTED>');
  process.exit(1);
}

reviewArtist(userId, status);