import csvParser from 'csv-parser';
import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as stream from "stream";

export const handler = async (event: S3Event) => {
  const promises = event.Records.map((record) => {
    const bucketName = record?.s3?.bucket?.name || '';
    const objectKey = record?.s3?.object?.key || '';

    const params = { Bucket: bucketName, Key: objectKey };
    console.log('params: ', params);
    const readStream = new AWS.S3().getObject(params).createReadStream();

    const uploadStream = (Bucket: string, Key: string) => {
      const passT = new stream.PassThrough();
      return {
        writeStream: passT,
        promise: new AWS.S3().upload({ Bucket, Key, Body: passT }).promise(),
      };
    };

    // const { writeStream, promise } = uploadStream({Bucket: bucketName, Key: 'yourfile.mp4'});

    return new Promise(function (resolve, reject) {
      readStream
        .pipe(csvParser())
        .on('data', (data) => {
          console.log('data: ', JSON.stringify(data));
        })
        .on('error', function (err) {
          console.error('Got an error: ' + err);
          reject(err);
        })
        .on('end', (rows: any) => {
          console.log(`Parsed ${rows} rows`);
          resolve(rows);
        });
    });
  });
  return Promise.all(promises);
}
