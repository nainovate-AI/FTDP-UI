import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const METADATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'metadata.json');

// TODO: Replace this file-based approach with real database/API integration
// This is a mock implementation for development purposes

export async function GET() {
  try {
    // Check if metadata file exists
    if (!fs.existsSync(METADATA_FILE_PATH)) {
      // Return default metadata if file doesn't exist
      const defaultMetadata = {
        finetuningSession: {
          id: null,
          createdAt: null,
          lastModified: null,
          status: "dataset_selection"
        },
        dataset: {
          uid: null,
          id: null,
          name: null,
          selectedAt: null
        },
        model: {
          baseModel: null,
          modelName: null,
          parameters: {}
        },
        training: {
          epochs: null,
          batchSize: null,
          learningRate: null,
          validationSplit: null
        },
        deployment: {
          endpoint: null,
          version: null,
          environment: null
        }
      };
      
      // Create the file with default metadata
      fs.writeFileSync(METADATA_FILE_PATH, JSON.stringify(defaultMetadata, null, 2));
      return NextResponse.json(defaultMetadata);
    }
    
    // Read existing metadata
    const metadataContent = fs.readFileSync(METADATA_FILE_PATH, 'utf-8');
    const metadata = JSON.parse(metadataContent);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error reading metadata:', error);
    return NextResponse.json({ error: 'Failed to load metadata' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();
    
    // TODO: Add validation for metadata structure
    // TODO: In real implementation, save to database instead of file
    
    // Write metadata to file
    fs.writeFileSync(METADATA_FILE_PATH, JSON.stringify(metadata, null, 2));
    
    console.log('Metadata saved successfully:', {
      sessionId: metadata.finetuningSession?.id,
      datasetUID: metadata.dataset?.uid,
      status: metadata.finetuningSession?.status
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving metadata:', error);
    return NextResponse.json({ error: 'Failed to save metadata' }, { status: 500 });
  }
}
