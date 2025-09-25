// src/app/api/aws-upload/document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PDFDocument } from 'pdf-lib';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

// AWS S3 Client setup
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface DocumentUploadResult {
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  uploadTime: number;
  sanitizedName: string;
}

// Document type validation and extension mapping
const ALLOWED_DOCUMENT_TYPES = {
  // PDF
  'application/pdf': '.pdf',
  
  // Microsoft Word
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  
  // Microsoft Excel
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  
  // Microsoft PowerPoint
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  
  // Text files
  'text/plain': '.txt',
  'text/csv': '.csv',
  
  // Other common formats
  'application/rtf': '.rtf',
  'application/vnd.oasis.opendocument.text': '.odt',
  'application/vnd.oasis.opendocument.spreadsheet': '.ods',
  'application/vnd.oasis.opendocument.presentation': '.odp',
  
  // ZIP files
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/vnd.rar': '.rar',
  'application/x-7z-compressed': '.7z',
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  'application/pdf': 25 * 1024 * 1024, // 25MB for PDF
  'application/msword': 10 * 1024 * 1024, // 10MB for DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 10 * 1024 * 1024, // 10MB for DOCX
  'application/vnd.ms-excel': 15 * 1024 * 1024, // 15MB for XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 15 * 1024 * 1024, // 15MB for XLSX
  'application/vnd.ms-powerpoint': 20 * 1024 * 1024, // 20MB for PPT
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 20 * 1024 * 1024, // 20MB for PPTX
  'text/plain': 5 * 1024 * 1024, // 5MB for TXT
  'application/zip': 50 * 1024 * 1024, // 50MB for ZIP
  'default': 25 * 1024 * 1024 // 25MB default
};

function sanitizeFileName(fileName: string): string {
  // Remove file extension first
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  
  // Replace invalid characters with underscores
  let sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9\-_\s]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
    
  // Ensure filename is not too long
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  // Ensure filename is not empty
  if (!sanitized) {
    sanitized = 'document';
  }
  
  return sanitized;
}

function getFileCategory(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'pdfs';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'documents';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheets';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentations';
  if (mimeType.includes('text')) return 'text-files';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archives';
  return 'documents';
}

// Fixed PDF compression function
async function compressPDF(buffer: Buffer): Promise<{ buffer: Buffer; compressed: boolean; ratio: number }> {
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    
    // Fixed: Use valid SaveOptions properties only
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      // Removed: objectStreamsThreshold (not a valid property)
    });
    
    const compressedBuffer = Buffer.from(compressedBytes);
    const ratio = ((buffer.length - compressedBuffer.length) / buffer.length) * 100;
    
    return {
      buffer: compressedBuffer,
      compressed: true,
      ratio: Math.max(0, ratio)
    };
  } catch (error) {
    console.error('PDF compression failed:', error);
    return { buffer, compressed: false, ratio: 0 };
  }
}

async function compressGenericDocument(buffer: Buffer): Promise<{ buffer: Buffer; compressed: boolean; ratio: number }> {
  try {
    const compressedBuffer = await gzip(buffer, { level: 9 });
    const ratio = ((buffer.length - compressedBuffer.length) / buffer.length) * 100;
    
    // Only use compression if it saves at least 5%
    if (ratio > 5) {
      return {
        buffer: compressedBuffer,
        compressed: true,
        ratio
      };
    } else {
      return { buffer, compressed: false, ratio: 0 };
    }
  } catch (error) {
    console.error('Generic compression failed:', error);
    return { buffer, compressed: false, ratio: 0 };
  }
}

// Fixed: Define proper interface for processed file
interface ProcessedFile {
  buffer: Buffer;
  compressed: boolean;
  ratio: number;
  originalSize: number;
  finalSize: number;
  contentType: string;
  fileName: string;
}

async function compressDocument(buffer: Buffer, mimeType: string, fileName: string): Promise<ProcessedFile> {
  const originalSize = buffer.length;
  console.log(`🗜️ Attempting compression for ${fileName} (${Math.round(originalSize/1024)}KB)`);
  
  let result;
  
  // PDF-specific compression
  if (mimeType === 'application/pdf') {
    result = await compressPDF(buffer);
  } 
  // Generic compression for other documents
  else if (originalSize > 1024 * 1024) { // Only compress files > 1MB
    result = await compressGenericDocument(buffer);
  } else {
    result = { buffer, compressed: false, ratio: 0 };
  }
  
  const finalSize = result.buffer.length;
  
  if (result.compressed) {
    console.log(`✅ Compressed: ${Math.round(originalSize/1024)}KB → ${Math.round(finalSize/1024)}KB (${result.ratio.toFixed(1)}% saved)`);
  } else {
    console.log(`⏭️ Compression skipped for ${fileName}`);
  }
  
  // Fixed: Return properly typed object
  return {
    buffer: result.buffer,
    compressed: result.compressed,
    ratio: result.ratio,
    originalSize,
    finalSize,
    contentType: result.compressed && mimeType !== 'application/pdf' ? 'application/gzip' : mimeType,
    fileName: result.compressed && mimeType !== 'application/pdf' ? `${fileName}.gz` : fileName
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const org = formData.get('organizationName');
    const compress = formData.get('compress') !== 'false'; // Default to true
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    if (!org) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }
    
    const organizationName = String(org).trim();
    
    // Validate file type
    if (!ALLOWED_DOCUMENT_TYPES[file.type as keyof typeof ALLOWED_DOCUMENT_TYPES]) {
      return NextResponse.json({ 
        error: 'Unsupported file type', 
        supportedTypes: Object.keys(ALLOWED_DOCUMENT_TYPES),
        receivedType: file.type
      }, { status: 400 });
    }
    
    // Check file size limits
    const sizeLimit = FILE_SIZE_LIMITS[file.type as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.default;
    if (file.size > sizeLimit) {
      const sizeLimitMB = Math.round(sizeLimit / (1024 * 1024));
      return NextResponse.json({ 
        error: `File too large. Maximum size for ${file.type} is ${sizeLimitMB}MB` 
      }, { status: 400 });
    }
    
    console.log(`📁 Processing document: ${file.name} (${Math.round(file.size / 1024)}KB, ${file.type})`);
    
    // Convert file to buffer
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    
    // Fixed: Initialize with proper type
    let processedFile: ProcessedFile = {
      buffer: originalBuffer,
      compressed: false,
      ratio: 0,
      originalSize: originalBuffer.length,
      finalSize: originalBuffer.length,
      contentType: file.type,
      fileName: sanitizeFileName(file.name) + ALLOWED_DOCUMENT_TYPES[file.type as keyof typeof ALLOWED_DOCUMENT_TYPES]
    };
    
    // Compress if requested and file is large enough
    if (compress) {
      processedFile = await compressDocument(originalBuffer, file.type, file.name);
    }
    
    // Generate S3 key
    const orgNameSanitized = organizationName.replace(/[^a-zA-Z0-9-]/g, '_');
    const category = getFileCategory(file.type);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const finalFileName = `${timestamp}_${randomString}_${processedFile.fileName}`;
    const key = `GDM/${orgNameSanitized}/documents/${category}/${finalFileName}`;
    
    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: processedFile.buffer,
      ContentType: processedFile.contentType,
      Metadata: {
        'original-name': file.name,
        'original-size': processedFile.originalSize.toString(),
        'compressed': processedFile.compressed.toString(),
        'compression-ratio': processedFile.ratio.toString(),
        'upload-timestamp': timestamp.toString(),
        'organization': orgNameSanitized,
      },
      ContentDisposition: `attachment; filename="${encodeURIComponent(file.name)}"`,
    });
    
    await s3Client.send(command);
    
    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      message: 'Document uploaded successfully',
      url: publicUrl,
      key,
      fileInfo: {
        fileName: finalFileName,
        originalName: file.name,
        originalSize: `${Math.round(processedFile.originalSize / 1024)}KB`,
        finalSize: `${Math.round(processedFile.finalSize / 1024)}KB`,
        mimeType: processedFile.contentType,
        category: category,
        compressed: processedFile.compressed,
        compressionRatio: processedFile.compressed ? `${processedFile.ratio.toFixed(1)}%` : 'Not compressed',
      },
      performance: {
        totalProcessTime: `${totalTime}ms`,
        compressionSavings: processedFile.compressed ? `${Math.round((processedFile.originalSize - processedFile.finalSize) / 1024)}KB saved` : 'No compression applied'
      }
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`💥 Document upload error after ${totalTime}ms:`, error);
    
    return NextResponse.json({
      error: 'Document upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: `${totalTime}ms`
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Document Upload API for AWS S3 with Compression',
    supportedTypes: {
      'PDF': ['application/pdf'],
      'Microsoft Word': [
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      'Microsoft Excel': [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
      'Microsoft PowerPoint': [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ],
      'Text Files': ['text/plain', 'text/csv'],
      'Archives': ['application/zip', 'application/vnd.rar', 'application/x-7z-compressed'],
      'Other': ['application/rtf']
    },
    fileSizeLimits: {
      'PDF': '25MB',
      'Word Documents': '10MB',
      'Excel Files': '15MB',
      'PowerPoint': '20MB',
      'Archives': '50MB',
      'Text Files': '5MB'
    },
    usage: {
      endpoint: '/api/aws-upload/document',
      method: 'POST',
      formData: {
        file: 'Document file (required)',
        organizationName: 'Organization name for folder structure (required)',
        compress: 'Enable compression (optional, default: true)'
      }
    }
  });
}
