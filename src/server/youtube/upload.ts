const YOUTUBE_UPLOAD_INIT_ENDPOINT =
  'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';

interface UploadVideoInput {
  accessToken: string;
  file: File;
  title: string;
  description: string;
  privacyStatus: 'private' | 'unlisted' | 'public';
}

export async function uploadVideoToYouTube({
  accessToken,
  file,
  title,
  description,
  privacyStatus,
}: UploadVideoInput) {
  const metadata = {
    snippet: {
      title,
      description,
      categoryId: '10',
    },
    status: {
      privacyStatus,
      selfDeclaredMadeForKids: false,
    },
  };

  const initResponse = await fetch(YOUTUBE_UPLOAD_INIT_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': String(file.size),
      'X-Upload-Content-Type': file.type || 'video/mp4',
    },
    body: JSON.stringify(metadata),
  });

  if (!initResponse.ok) {
    const body = await initResponse.text();
    throw new Error(`YouTube upload session failed: ${initResponse.status} ${body}`);
  }

  const uploadUrl = initResponse.headers.get('location');
  if (!uploadUrl) {
    throw new Error('YouTube did not return an upload URL.');
  }

  const fileBuffer = await file.arrayBuffer();
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'video/mp4',
      'Content-Length': String(file.size),
    },
    body: fileBuffer,
  });

  if (!uploadResponse.ok) {
    const body = await uploadResponse.text();
    throw new Error(`YouTube upload failed: ${uploadResponse.status} ${body}`);
  }

  return (await uploadResponse.json()) as { id: string };
}
