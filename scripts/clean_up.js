import craftai from '../src';

const craftToken = { token: process.env.CRAFT_TOKEN };
const JOB_ID = process.env.JOB_ID || 'local';
const client = craftai(craftToken);

console.log('Clearning up dangling agents and generators from tests');
client.listAgents()
  .then(async(agentNames) => {
    console.log('got', agentNames.length);
    const agentsToClean = agentNames.filter((agentName) => agentName.includes(JOB_ID));
    return agentsToClean.reduce((acc, agentName) =>
      acc.then((count) => client.deleteAgent(agentName)
        .then(() => {
          console.log('Deleted agent', agentName);
          return count += 1;
        })),
    Promise.resolve(0));
  })
  .then((nAgentDeleted) => {
    console.log(`${nAgentDeleted} agent(s) were deleted.`);
    return client.listGenerators()
      .then(async(generatorNames) => {
        console.log('got', generatorNames.length);
        const generatorsToClean = generatorNames.filter((generatorName) => generatorName.includes(JOB_ID));
        return generatorsToClean.reduce((acc, generatorName) =>
          acc.then((count) => client.deleteGenerator(generatorName)
            .then(() => {
              console.log('Deleted generators', generatorName);
              return count += 1;
            })),
        Promise.resolve(0));
      });
  })
  .then((nGeneratorDeleted) => {
    console.log(`${nGeneratorDeleted} generator(s) were deleted.`);
    process.exit(0);
  })
  .catch(function(error) {
    console.error('Error!', error);
    process.exit(1);
  });