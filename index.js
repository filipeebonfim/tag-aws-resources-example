const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const cloudwatchlogs = new AWS.CloudWatchLogs();

const tags = {
  'team': 'product',
  'env': 'development'
}
async function listLogGroups(nextToken) {
  const params = {
    nextToken,
  };

  const { logGroups, nextToken: newNextToken } = await cloudwatchlogs.describeLogGroups(params).promise();

  console.log(logGroups)

  if (newNextToken) {
    const additionalLogGroups = await listLogGroups(newNextToken);
    return logGroups.concat(additionalLogGroups);
  }

  return logGroups;
}

async function addTagToLogGroups(logGroups) {
  const promises = logGroups.map(logGroup => {
    const params = {
      logGroupName: logGroup.logGroupName,
      tags: tags
    }
    return cloudwatchlogs.tagLogGroup(params).promise();
  });

  await Promise.all(promises);
}

(async () => {
  const logGroups = await listLogGroups();
  await addTagToLogGroups(logGroups);
  console.log(`The tags were add in all ${logGroups.length} cloudwatch groups.`);
})();