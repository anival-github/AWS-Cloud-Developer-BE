import csvParser from 'csv-parser';
import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';
const s3 = new AWS.S3();

export const handler = async (
  event: S3Event,
  _: any,
  callback: (err: any, data: any) => void
) => {
  const results: any[] = [];

  try {
    console.log(`Event: ${event}`);

    for (const record of event.Records) {
      const bucketName = record?.s3?.bucket?.name || '';
      const objectKey = record?.s3?.object?.key || '';

      const params = { Bucket: bucketName, Key: objectKey };
      s3.getObject(params)
        .createReadStream()
        // .pipe(csvParser())
        .on('data', (data) => {
          console.log('data: ', data);
          results.push(data);
        })
        .on('error', function (err) {
          console.error('Got an error: ' + err);
        })
        .on('end', () => {
          console.log('results:', results);
          // callback(null, {
          //   statusCode: 200,
          //   headers: {
          //     'Access-Control-Allow-Headers': 'Content-Type',
          //     'Access-Control-Allow-Origin': '*',
          //     'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
          //   },
          //   body: JSON.stringify({ results }),
          // });
          console.log('done:', results);
        });
      console.log(`results: ${results}`);

      // const data = response.Body?.toString('utf-8') || '';
      // // result += data;
      // console.log('record:', record);
      // console.log('data:', data);
    }

    // return {
    //   statusCode: 200,
    //   headers: {
    //     'Access-Control-Allow-Headers': 'Content-Type',
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    //   },
    //   body: JSON.stringify({ results1: results }),
    // };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
};
