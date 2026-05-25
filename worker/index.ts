import { Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

console.log('Starting BullMQ Worker...');

// 업로드 큐 작업을 처리할 워커 정의
const worker = new Worker(
  'upload-queue',
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    console.log('Job data:', job.data);
    
    // 업로드 작업 비즈니스 로직 처리
    // 예: YouTube, Instagram 서비스 호출
    
    return { success: true };
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
