import Bull from 'bull';

export const productQueue = new Bull('product-upload', {
  redis: {
    host: process.env.REDIS_HOST || 'redis-18204.c263.us-east-1-2.ec2.redns.redis-cloud.com',
    port: parseInt(process.env.REDIS_PORT || '18204'),
    password: process.env.REDIS_PASSWORD || 'YOUR_REDIS_PASSWORD', // get this from Redis Cloud
  },
});