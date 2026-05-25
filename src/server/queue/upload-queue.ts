import { Queue } from 'bullmq';

// Redis 연결 설정 (임시)
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

// 동영상/콘텐츠 업로드를 위한 BullMQ 큐 선언
export const uploadQueue = new Queue('upload-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

export async function addUploadJob(jobName: string, data: any) {
  return await uploadQueue.add(jobName, data);
}
