import { NextRequest, NextResponse } from 'next/server';
import { getValidYouTubeAccessToken } from '@/server/youtube/oauth';
import { uploadVideoToYouTube } from '@/server/youtube/upload';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: false });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const privacyStatus = String(formData.get('privacyStatus') || 'private') as 'private' | 'unlisted' | 'public';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Video file is required.' }, { status: 400 });
    }

    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'YouTube upload requires a video file.' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    if (!['private', 'unlisted', 'public'].includes(privacyStatus)) {
      return NextResponse.json({ error: 'Invalid privacy status.' }, { status: 400 });
    }

    const accessToken = await getValidYouTubeAccessToken(request, response);
    const uploaded = await uploadVideoToYouTube({
      accessToken,
      file,
      title,
      description,
      privacyStatus,
    });

    return NextResponse.json(
      {
        success: true,
        videoId: uploaded.id,
        url: `https://www.youtube.com/watch?v=${uploaded.id}`,
      },
      { headers: response.headers },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'YouTube upload failed.' },
      { status: 500, headers: response.headers },
    );
  }
}
