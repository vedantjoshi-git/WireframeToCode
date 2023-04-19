import _ from "lodash";
import aws from "aws-sdk";
const config = require("./config"); 

aws.config.update({

  region: config.awsRegion
});

const sagemakerruntime = new aws.SageMakerRuntime();

module.exports = async buffer => {
  const params = {
    Body: buffer,
    EndpointName: 'end-code',
    ContentType: 'image/jpeg'
  };

  const request = sagemakerruntime.invokeEndpoint(params);
      const data = await request.promise();
          // in case no blocks are found return undefined
          let error = data['error'];
          let result = data['Body'];
          let newResult = JSON.parse(result) //.toStr('utf8');
          return newResult;
        };

module.exports.wireCode = wireCode; 