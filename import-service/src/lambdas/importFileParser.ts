import csvParser from 'csv-parser';
import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import * as stream from "stream";

export const handler = async (event: S3Event) => {

  const sqs = new AWS.SQS();
  const queueUrl = process.env.SQS_URL as string;

  console.log('queueUrl: ',queueUrl);

  // for (let i = 0; i < 3; i++) {
  //   const msgId = i;
  //   const msgBody = { msgId, msg: `This is msg ${i + 1}` };

  //   const params: AWS.SQS.SendMessageRequest = {
  //     MessageBody: JSON.stringify(msgBody),
  //     QueueUrl: queueUrl,
  //   };

  //   await sqs.sendMessage(params).promise();
  //   console.log('Successfully sent msg to queue- msgId:', msgId);
  // }


  const promises = event.Records.map((record) => {
    const bucketName = record?.s3?.bucket?.name || '';
    const objectKey = record?.s3?.object?.key || '';

    const params = { Bucket: bucketName, Key: objectKey };
    // console.log('params: ', params);
    const readStream = new AWS.S3().getObject(params).createReadStream();

    // const uploadStream = (Bucket: string, Key: string) => {
    //   const passT = new stream.PassThrough();
    //   return {
    //     writeStream: passT,
    //     promise: new AWS.S3().upload({ Bucket, Key, Body: passT }).promise(),
    //   };
    // };

    // const { writeStream, promise } = uploadStream({Bucket: bucketName, Key: 'yourfile.mp4'});

    const results: any = [];

    return new Promise(function (resolve, reject) {
      readStream
        .pipe(csvParser({separator: ';'}))
        .on('headers', (headers) => {
          // console.log(`First header: ${headers[0]}`)
        })      
        .on('data', (data) => {
          // console.log('data: ', JSON.stringify(data));
          results.push(data)

          

          // sqs.sendMessage(params).promise().then(() => {
          //   console.error('Data sent: ' + params);
          // }).catch((err) => console.log(`Some error occured: ${err}`));
        })
        .on('error', function (err) {
          console.error('Got an error: ' + err);
          reject(err);
        })
        .on('end', async (rows: any) => {
          // console.log(`Parsed ${rows} rows`);
          // console.log('results: ', results);
          // resolve(rows);
          const sendSqsMessagePromises = results.map((item: any) => {
            const params: AWS.SQS.SendMessageRequest = {
              MessageBody: JSON.stringify(item),
              QueueUrl: queueUrl,
            };
            return sqs.sendMessage(params).promise().then((something) => {
              console.error('Data sent: ' + JSON.stringify(params));
              console.error('something: ' + JSON.stringify(something));
            }).catch((err) => console.log(`Some error occured: ${err}`))
          })

          const results1 = await Promise.all(sendSqsMessagePromises);

          resolve(results1);

        });
    });
  });
  return Promise.all(promises);
}
