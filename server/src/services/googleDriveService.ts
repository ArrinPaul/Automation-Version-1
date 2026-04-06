import { google, drive_v3 } from 'googleapis';
import stream from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Create an auth client if credentials are provided
const credentialsPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

let drive: drive_v3.Drive | null = null;

if (credentialsPath) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    drive = google.drive({ version: 'v3', auth });
    console.log('Google Drive API instantiated.');
  } catch (err) {
    console.error('Failed to initialize Google Drive API. Verify your credentials.', err);
  }
} else {
  console.warn('Google Drive API disabled: GOOGLE_SERVICE_ACCOUNT_KEY_PATH is not set in .env');
}

/**
 * Uploads a file to Google Drive.
 */
export const uploadFile = async (buffer: Buffer, originalname: string, mimeType: string, parentFolderId?: string) => {
  if (!drive) {
    throw new Error('Google Drive API is not configured.');
  }

  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const fileMetadata: any = {
    name: originalname,
    parents: [parentFolderId || rootFolderId],
  };

  const media = {
    mimeType: mimeType,
    body: bufferStream,
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
  });

  return file.data;
};

/**
 * Creates a folder. Useful for creating society specific folders.
 */
export const createFolder = async (folderName: string, parentFolderId?: string) => {
  if (!drive) throw new Error('Google Drive API is not configured.');

  const fileMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId || rootFolderId],
  };

  const file = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  return file.data.id;
};

/**
 * Deletes a file or folder from Google Drive by ID.
 */
export const deleteFile = async (fileId: string) => {
  if (!drive) throw new Error('Google Drive API is not configured.');
  await drive.files.delete({ fileId });
  return true;
};
