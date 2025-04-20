import { NextResponse } from "next/server";
import  prisma from '@/app/lib/prisma';

export async function GET(){
    try{
        const songs = await prisma.song.findMany();
        return NextResponse.json({success:true , data:songs} , {status:200});

    }catch(error){
        console.error('Error fetching songs:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch songs' }, { status: 500 });
    
    }
}