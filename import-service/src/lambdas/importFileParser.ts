import csvParser from 'csv-parser';
import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as stream from "stream";
import stripBom from 'strip-bom-stream';

export const handler = async (event: S3Event) => {

  const sqs = new AWS.SQS();
  const queueUrl = process.env.SQS_URL as string;

  const promises = event.Records.map((record) => {
    const bucketName = record?.s3?.bucket?.name || '';
    const objectKey = record?.s3?.object?.key || '';

    const params = { Bucket: bucketName, Key: objectKey };
    const readStream = new AWS.S3().getObject(params).createReadStream();

    const results: any = [];

    return new Promise(function (resolve, reject) {
      readStream
        .pipe(stripBom())
        .pipe(csvParser({separator: ';'}))
        .on('data', (data) => {
          results.push(data)
        })
        .on('error', function (err) {
          reject(err);
        })
        .on('end', async () => {
          const sendSqsMessagePromises = results.map((item: any) => sqs.sendMessage({
            MessageBody: JSON.stringify(item),
            QueueUrl: queueUrl,
          }).promise())

          const results1 = await Promise.all(sendSqsMessagePromises);

          resolve(results1);
        });
    });
  });
  return Promise.all(promises);
}
