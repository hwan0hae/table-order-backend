import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Request } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';

const s3 = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: String(process.env.AWS_ACCESS_KEY),
    secretAccessKey: String(process.env.AWS_SECRET_KEY),
  },
});

export const imageUploader = multer({
  storage: multerS3({
    s3,
    bucket: String(process.env.S3_BUCKET_NAME),
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read-write',
    key: (req: Request, file: Express.MulterS3.File, cb) => {
      const user = req.currentUser;

      const uploadDirectory = `${user?.company_id}/menu`;
      cb(null, `${uploadDirectory}/${Date.now()}_${file.originalname}`);
    },
  }),
});

export const imageDeleteCommand = async (path: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: path,
    });
    const response = await s3.send(command);
    return response;
  } catch (error) {
    console.error('s3 imageDeleteCommand >> ', error);

    return error;
  }
};
