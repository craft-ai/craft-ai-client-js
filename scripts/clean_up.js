import craftai from '../src';

const craftToken = { token: process.env.CRAFT_TOKEN };
const JOB_ID = process.env.TRAVIS_JOB_ID || 'local';
const client = craftai(craftToken);
console.log(client);
client.listAgents()
  .then((agentNames) => {
    console.log('got', agentNames.length);
    agentNames.filter((agentName) => agentName.includes(JOB_ID));
    return agentNames.reduce((acc, agentName) =>
      acc.then((count) => client.deleteAgent(agentName)
        .then(() => {
          console.log('Deleted agent', agentName);
          return count += 1;
        })),
    Promise.resolve(0));
  })
  .then((nAgentDeleted) => {
    console.log(`${nAgentDeleted} agent(s) were deleted.`);
    process.exit(0);
  })
  .catch(function(error) {
    console.error('Error!', error);
    process.exit(1);
  });