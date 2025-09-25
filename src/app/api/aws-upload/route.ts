/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/aws-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// AWS S3 Client setup
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface CompressionLog {
  iteration: number;
  quality: number;
  format: string;
  sizeKB: number;
  compressionTime: number;
  targetMet: boolean;
  resized?: string;
}

interface CompressionResult {
  buffer: Buffer;
  type: string;
  extension: string;
  skippedCompression: boolean;
  logs: CompressionLog[];
  totalTime: number;
  totalIterations: number;
  finalQuality?: number;
  reason?: string;
  resolutionReduced?: boolean;
}

// Fast compression function with aggressive optimization for large files
async function compressImageFast(buffer: Buffer, originalType: string): Promise<CompressionResult> {
  const startTime = Date.now();
  const logs: CompressionLog[] = [];
  let iterationCount = 0;
  
  try {
    const originalSizeKB = Math.round(buffer.length / 1024);
    // console.log(`🚀 Fast compression for ${originalType} image (${originalSizeKB}KB)`);
    
    // Skip compression if image is already under 400KB
    if (originalSizeKB <= 400) {
      const totalTime = Date.now() - startTime;
      // console.log(`✅ Compression skipped - Image already under 400KB (${originalSizeKB}KB)`);
      
      return { 
        buffer, 
        type: originalType, 
        extension: getExtension(originalType),
        skippedCompression: true,
        logs: [],
        totalTime,
        totalIterations: 0,
        reason: 'Image already under 400KB'
      };
    }

    let image = sharp(buffer);
    const metadata = await image.metadata();
    // console.log(`📊 Original: ${metadata.width}x${metadata.height}, ${originalSizeKB}KB`);

    let resolutionReduced = false;
    let resolutionInfo = '';

    // STRATEGY 1: Aggressive resolution reduction for very large images
    if (originalSizeKB > 3000) { // > 3MB
      const maxDimension = originalSizeKB > 6000 ? 1920 : 2560; // More aggressive for 6MB+
      
      if (metadata.width! > maxDimension || metadata.height! > maxDimension) {
        // console.log(`📏 Reducing resolution (target: ${maxDimension}px max dimension)`);
        
        image = image.resize(maxDimension, maxDimension, {
          fit: 'inside',
          withoutEnlargement: true,
        });
        
        const newMeta = await image.metadata();
        resolutionReduced = true;
        resolutionInfo = `${metadata.width}x${metadata.height} → ${newMeta.width}x${newMeta.height}`;
        // console.log(`📐 Resized to: ${newMeta.width}x${newMeta.height}`);
      }
    }

    // STRATEGY 2: Smart quality selection based on file size (no iteration)
    let targetQuality: number;
    let targetFormat: 'webp' | 'jpeg';

    if (originalSizeKB > 5000) {
      // Very large files: aggressive compression
      targetQuality = 45;
      targetFormat = 'webp';
    } else if (originalSizeKB > 2000) {
      // Large files: moderate compression
      targetQuality = 55;
      targetFormat = 'webp';
    } else {
      // Medium files: balanced compression
      targetQuality = 65;
      targetFormat = originalType.includes('gif') ? 'jpeg' : 'webp';
    }

    // console.log(`🎯 Using ${targetFormat.toUpperCase()} Q${targetQuality} (no iteration)`);

    // Single compression attempt with calculated settings
    iterationCount = 1;
    const compressionStart = Date.now();

    let finalBuffer: Buffer;
    let finalType: string;
    let finalExtension: string;

    if (targetFormat === 'webp' && (originalType !== 'image/gif' || (metadata.pages && metadata.pages <= 1))) {
      finalBuffer = await image
        .webp({ 
          quality: targetQuality, 
          effort: 4, // Reduced from 6 for speed
          nearLossless: false
        })
        .toBuffer();
      finalType = 'image/webp';
      finalExtension = '.webp';
    } else {
      finalBuffer = await image
        .jpeg({ 
          quality: targetQuality, 
          progressive: true, 
          mozjpeg: true,
          overshootDeringing: false, // Speed optimization
          optimizeScans: false // Speed optimization
        })
        .toBuffer();
      finalType = 'image/jpeg';
      finalExtension = '.jpg';
    }

    const compressionTime = Date.now() - compressionStart;
    const finalSizeKB = Math.round(finalBuffer.length / 1024);
    const targetMet = finalSizeKB <= 1000; // 1MB target

    const log: CompressionLog = {
      iteration: 1,
      quality: targetQuality,
      format: targetFormat.toUpperCase(),
      sizeKB: finalSizeKB,
      compressionTime,
      targetMet,
      resized: resolutionReduced ? resolutionInfo : undefined
    };
    logs.push(log);

    // const totalTime = Date.now() - startTime;
    
    // console.log(`📈 Single pass: ${targetFormat.toUpperCase()} Q${targetQuality} → ${finalSizeKB}KB (${compressionTime}ms) ${targetMet ? '✅' : '⚠️'}`);
    // if (resolutionReduced) {
    //   console.log(`📐 Resolution: ${resolutionInfo}`);
    // }
    
    // STRATEGY 3: If still too big, try one more aggressive attempt
    if (finalSizeKB > 1000 && targetQuality > 35) {
      // console.log(`🔄 Size still ${finalSizeKB}KB > 1MB, trying Q35...`);
      iterationCount++;
      const secondStart = Date.now();

      let secondBuffer: Buffer;
      if (targetFormat === 'webp') {
        secondBuffer = await image.webp({ quality: 35, effort: 3 }).toBuffer();
      } else {
        secondBuffer = await image.jpeg({ quality: 35, progressive: true, mozjpeg: true }).toBuffer();
      }

      const secondTime = Date.now() - secondStart;
      const secondSizeKB = Math.round(secondBuffer.length / 1024);
      const secondTargetMet = secondSizeKB <= 1000;

      const secondLog: CompressionLog = {
        iteration: 2,
        quality: 35,
        format: targetFormat.toUpperCase(),
        sizeKB: secondSizeKB,
        compressionTime: secondTime,
        targetMet: secondTargetMet
      };
      logs.push(secondLog);

      // console.log(`📈 Second pass: ${targetFormat.toUpperCase()} Q35 → ${secondSizeKB}KB (${secondTime}ms) ${secondTargetMet ? '✅' : '⚠️'}`);

      // Use the better result
      if (secondSizeKB <= 1000 || secondSizeKB < finalSizeKB) {
        finalBuffer = secondBuffer;
        targetQuality = 35;
      }
    }

    const finalTime = Date.now() - startTime;
    // const finalFinalSizeKB = Math.round(finalBuffer.length / 1024);
    
    // console.log(`🏁 Final result: ${finalFinalSizeKB}KB, ${finalTime}ms total (${iterationCount} attempts)`);
    
    return {
      buffer: finalBuffer,
      type: finalType,
      extension: finalExtension,
      skippedCompression: false,
      logs,
      totalTime: finalTime,
      totalIterations: iterationCount,
      finalQuality: targetQuality,
      resolutionReduced
    };

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('💥 Fast compression failed:', error);
    
    return { 
      buffer, 
      type: originalType, 
      extension: getExtension(originalType),
      skippedCompression: false,
      logs,
      totalTime,
      totalIterations: iterationCount,
      reason: 'Compression failed due to error'
    };
  }
}

// Alternative: Even faster compression for very large files (under 5 seconds)
async function compressImageUltraFast(buffer: Buffer, originalType: string): Promise<CompressionResult> {
  const startTime = Date.now();
  // console.log(`⚡ Ultra-fast compression starting...`);
  
  try {
    const originalSizeKB = Math.round(buffer.length / 1024);
    
    if (originalSizeKB <= 400) {
      return { 
        buffer, 
        type: originalType, 
        extension: getExtension(originalType),
        skippedCompression: true,
        logs: [],
        totalTime: Date.now() - startTime,
        totalIterations: 0,
        reason: 'Image already under 400KB'
      };
    }

    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Ultra-aggressive single-pass compression
    let processedImage = image;
    let resolutionReduced = false;
    
    // Always resize large images
    if (metadata.width! > 1920 || metadata.height! > 1920) {
      processedImage = processedImage.resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      resolutionReduced = true;
      // console.log(`📐 Resized to max 1920px`);
    }

    // Single compression with very aggressive settings
    const quality = originalSizeKB > 5000 ? 40 : 50;
    
    const finalBuffer = await processedImage
      .webp({ 
        quality, 
        effort: 2, // Minimum effort for speed
        nearLossless: false
      })
      .toBuffer();

    const totalTime = Date.now() - startTime;
    const finalSizeKB = Math.round(finalBuffer.length / 1024);
    
    // console.log(`⚡ Ultra-fast result: ${finalSizeKB}KB in ${totalTime}ms`);

    return {
      buffer: finalBuffer,
      type: 'image/webp',
      extension: '.webp',
      skippedCompression: false,
      logs: [{
        iteration: 1,
        quality,
        format: 'WebP',
        sizeKB: finalSizeKB,
        compressionTime: totalTime,
        targetMet: finalSizeKB <= 1000,
        resized: resolutionReduced ? `Resized to 1920px max` : undefined
      }],
      totalTime,
      totalIterations: 1,
      finalQuality: quality,
      resolutionReduced
    };

  } catch (error) {
    console.error('💥 Ultra-fast compression failed:', error);
    return { 
      buffer, 
      type: originalType, 
      extension: getExtension(originalType),
      skippedCompression: false,
      logs: [],
      totalTime: Date.now() - startTime,
      totalIterations: 0,
      reason: 'Ultra-fast compression failed'
    };
  }
}

function getExtension(type: string): string {
  switch (type) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/gif': return '.gif';
    case 'image/webp': return '.webp';
    default: return '.jpg';
  }
}

export async function POST(request: NextRequest) {
  const uploadStartTime = Date.now();
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const org = formData.get('organizationName');
    const OrgData = String(org).replaceAll(' ','_');
    // let organizationName
    // if(!org){
    //   return NextResponse.json({message:"Please Send Organization Id"})
    // }else{
    //   organizationName = await db.select().from(OrganizationsTable).where(eq(OrganizationsTable.id,org))
    // }


    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // console.log(`📁 File: ${file.name} (${Math.round(file.size / 1024)}KB)`);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 50 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
    }

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const originalSizeKB = Math.round(originalBuffer.length / 1024);

    // Choose compression strategy based on file size
    let compressed: CompressionResult;
    
    if (originalSizeKB > 5000) { // > 5MB: use ultra-fast
      // console.log(`⚡ Using ultra-fast compression for ${originalSizeKB}KB file`);
      compressed = await compressImageUltraFast(originalBuffer, file.type);
    } else { // < 5MB: use optimized fast
      // console.log(`🚀 Using fast compression for ${originalSizeKB}KB file`);
      compressed = await compressImageFast(originalBuffer, file.type);
    }
    
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '');
    const fileName = `${Date.now()}-${baseName}${compressed.extension}`;
    // const key = `GDM/${organizationName.name}/images/${fileName}`;
        const key = `GDM/${OrgData}/images/${fileName}`;
console.log("Upload Url" ,key);

    const uploadStart = Date.now();
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: compressed.buffer,
      ContentType: compressed.type,
    });

    await s3Client.send(command);
    
    const uploadTime = Date.now() - uploadStart;
    const totalTime = Date.now() - uploadStartTime;

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const finalSizeKB = Math.round(compressed.buffer.length / 1024);
    const compressionRatio = ((1 - compressed.buffer.length / originalBuffer.length) * 100);

    // console.log(`✅ Complete: ${originalSizeKB}KB → ${finalSizeKB}KB (${compressionRatio.toFixed(1)}%) in ${totalTime}ms`);

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: publicUrl,
      key,
      fileName,
      optimization: {
        originalSize: `${originalSizeKB}KB`,
        finalSize: `${finalSizeKB}KB`,
        compressionRatio: `${compressionRatio.toFixed(1)}%`,
        targetAchieved: finalSizeKB <= 1000, // 1MB target
        finalFormat: compressed.type,
        compressionSkipped: compressed.skippedCompression,
        resolutionReduced: compressed.resolutionReduced,
        finalQuality: compressed.finalQuality,
      },
      performance: {
        totalIterations: compressed.totalIterations,
        compressionTime: `${compressed.totalTime}ms`,
        uploadTime: `${uploadTime}ms`,
        totalProcessTime: `${totalTime}ms`,
        strategy: originalSizeKB > 5000 ? 'ultra-fast' : 'fast',
        iterationLogs: compressed.logs,
      },
    });

  } catch (error) {
    const totalTime = Date.now() - uploadStartTime;
    console.error(`💥 Error after ${totalTime}ms:`, error);
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        processingTime: `${totalTime}ms`
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Optimized AWS Upload API - Fast compression for large files',
    note: 'Images >5MB use ultra-fast compression (2-4s), smaller images use smart fast compression with 1MB target'
  });
}
