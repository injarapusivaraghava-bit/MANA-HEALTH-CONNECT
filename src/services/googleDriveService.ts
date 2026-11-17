export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
  description?: string;
  parents?: string[];
}

const DRIVE_FOLDER_NAME = 'Mana Health Connect - Medical Records';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

async function handleDriveResponse(res: Response) {
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const message =
      errBody?.error?.message || `Google Drive API error (${res.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function getOrCreateManaHealthFolder(
  accessToken: string
): Promise<string> {
  const query = encodeURIComponent(
    `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const searchRes = await fetch(
    `${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name)&pageSize=1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const searchData = await handleDriveResponse(searchRes);
  if (searchData?.files?.length > 0) {
    return searchData.files[0].id;
  }

  const createRes = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description:
        'Medical reports, prescriptions, and lab summaries backed up from MANA HEALTH CONNECT.',
    }),
  });
  const created = await handleDriveResponse(createRes);
  return created.id;
}

export async function listDriveFiles(
  accessToken: string,
  options: { search?: string; folderId?: string; pageSize?: number } = {}
): Promise<DriveFileItem[]> {
  const conditions = ['trashed=false'];
  if (options.folderId) {
    conditions.push(`'${options.folderId}' in parents`);
  } else {
    // Exclude folders when listing general Drive files unless browsing inside app folder
    conditions.push(`mimeType!='application/vnd.google-apps.folder'`);
  }
  if (options.search && options.search.trim()) {
    const safeSearch = options.search.trim().replace(/'/g, "\\'");
    conditions.push(`name contains '${safeSearch}'`);
  }

  const q = encodeURIComponent(conditions.join(' and '));
  const fields = encodeURIComponent(
    'files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,description,parents)'
  );
  const pageSize = options.pageSize || 30;

  const res = await fetch(
    `${DRIVE_API_BASE}/files?q=${q}&orderBy=modifiedTime desc&pageSize=${pageSize}&fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await handleDriveResponse(res);
  return data?.files || [];
}

export async function uploadBlobToDrive(
  accessToken: string,
  file: Blob,
  fileName: string,
  mimeType: string,
  folderId?: string,
  description?: string
): Promise<DriveFileItem> {
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: mimeType || 'application/octet-stream',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }
  if (description) {
    metadata.description = description;
  }

  const boundary = `manahealth_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const metadataPart = JSON.stringify(metadata);

  const bodyParts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataPart}\r\n`,
    `--${boundary}\r\nContent-Type: ${mimeType || 'application/octet-stream'}\r\n\r\n`,
    file,
    `\r\n--${boundary}--`,
  ];

  const multipartBody = new Blob(bodyParts, {
    type: `multipart/related; boundary=${boundary}`,
  });

  const fields = encodeURIComponent(
    'id,name,mimeType,size,modifiedTime,webViewLink,description,parents'
  );
  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=${fields}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  return handleDriveResponse(res);
}

export async function downloadDriveFile(
  accessToken: string,
  file: DriveFileItem
): Promise<void> {
  let url = `${DRIVE_API_BASE}/files/${file.id}?alt=media`;
  let downloadName = file.name;

  // Export Google Workspace native formats as PDF
  if (file.mimeType.startsWith('application/vnd.google-apps.')) {
    url = `${DRIVE_API_BASE}/files/${file.id}/export?mimeType=application/pdf`;
    if (!downloadName.toLowerCase().endsWith('.pdf')) {
      downloadName = `${downloadName}.pdf`;
    }
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to download file (${res.status})`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = downloadName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export async function renameDriveFile(
  accessToken: string,
  fileId: string,
  newName: string
): Promise<DriveFileItem> {
  const fields = encodeURIComponent(
    'id,name,mimeType,size,modifiedTime,webViewLink,description'
  );
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?fields=${fields}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: newName }),
  });
  return handleDriveResponse(res);
}

export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await handleDriveResponse(res);
}
