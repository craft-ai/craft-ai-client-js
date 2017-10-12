# **craft ai** isomorphic javascript client #

[![Version](https://img.shields.io/npm/v/craft-ai.svg?style=flat-square)](https://npmjs.org/package/craft-ai) [![Build](https://img.shields.io/travis/craft-ai/craft-ai-client-js/master.svg?style=flat-square)](https://travis-ci.org/craft-ai/craft-ai-client-js) [![License](https://img.shields.io/badge/license-BSD--3--Clause-42358A.svg?style=flat-square)](LICENSE) [![Dependencies](https://img.shields.io/david/craft-ai/craft-ai-client-js.svg?style=flat-square)](https://david-dm.org/craft-ai/craft-ai-client-js) [![Dev Dependencies](https://img.shields.io/david/dev/craft-ai/craft-ai-client-js.svg?style=flat-square)](https://david-dm.org/craft-ai/craft-ai-client-js#info=devDependencies)

[**craft ai** _AI-as-a-service_](http://craft.ai) enables your services to learn every day: provide a personalized experience to each user and automate complex tasks.

## Get Started! ##

### 0 - Signup ###

If you're reading this you are probably already registered with **craft ai**, if not, head to [`https://beta.craft.ai/signup`](https://beta.craft.ai/signup).

### 1 - Create a project ###

Once your account is setup, let's create your first **project**! Go in the 'Projects' tab in the **craft ai** control center at [`https://beta.craft.ai/projects`](https://beta.craft.ai/projects), and press **Create a project**.

Once it's done, you can click on your newly created project to retrieve its tokens. There are two types of tokens: **read** and **write**. You'll need the **write** token to create, update and delete your agent.

### 2 - Setup ###

#### Install ####

##### [Node.js](https://nodejs.org/en/) / [Webpack](http://webpack.github.io) / [Browserify](http://browserify.org) #####

Let's first install the package from npm.

```sh
npm install craft-ai --save
```
Then import it in your code

```js
var craftai = require('craft-ai').createClient;
```

or using [es2015](https://babeljs.io/docs/learn-es2015/) syntax

```js
import craftai from 'craft-ai';
```

##### Plain Old Javascript #####

Thanks to [npmcdn](https://npmcdn.com), you can include the pre-generated bundle in your html file, for the latest version use

```html
<script type="text/javascript" src="https://npmcdn.com/craft-ai/dist/craft-ai.min.js"></script>
```

to include a specific version specify it in the url like

```html
<script type="text/javascript" src="https://npmcdn.com/craft-ai@0.1.13/dist/craft-ai.min.js"></script>
```

#### Initialize ####

The simple version:

```js
// The token you retrieved for a given project
let client = craftai('{token}');
```

The more complete version:

```js
let client = craftai({
  // Mandatory, the token
  token: '{token}',
  // Optional, default value is 500
  operationsChunksSize: {max_number_of_operations_sent_at_once}
});
```

### 3 - Create an agent ###

**craft ai** is based on the concept of **agents**. In most use cases, one agent is created per user or per device.

An agent is an independent module that stores the history of the **context** of its user or device's context, and learns which **decision** to take based on the evolution of this context in the form of a **decision tree**.

In this example, we will create an agent that learns the **decision model** of a light bulb based on the time of the day and the number of people in the room. In practice, it means the agent's context have 4 properties:

- `peopleCount` which is a `continuous` property,
- `timeOfDay` which is a `time_of_day` property,
- `timezone`, a property of type `timezone` needed to generate proper values for `timeOfDay` (cf. the [context properties type section](#context-properties-types) for further information),
- and finally `lightbulbState` which is an `enum` property that is also the output.

```js
var AGENT_ID = 'my_first_agent';

client.createAgent(
  {
    context: {
      peopleCount: {
        type: 'continuous'
      },
      timeOfDay: {
        type: 'time_of_day'
      },
      timezone: {
        type: 'timezone'
      },
      lightbulbState: {
        type: 'enum'
      }
    },
    output: [ 'lightbulbState' ]
  },
  AGENT_ID
)
.then(function(agent) {
  console.log('Agent ' + agent.id + ' successfully created!');
})
.catch(function(error) {
  console.err('Error!', error);
});
```

Pretty straightforward to test! Open [`https://beta.craft.ai/inspector`](https://beta.craft.ai/inspector), select you project and your agent is now listed.

Now, if you run that a second time, you'll get an error: the agent `'my_first_agent'` is already existing. Let's see how we can delete it before recreating it.

```js
var AGENT_ID = 'my_first_agent';

client.deleteAgent(AGENT_ID)
.then(function() {
  console.log('Agent ' + AGENT_ID + ' no longer exists.');
  return client.createAgent(/*...*/);
})
.then(function(agent) {
  console.log('Agent ' + agent.id + ' successfully created!');
})
.catch(function(error) {
  console.err('Error!', error);
});
```

_For further information, check the ['create agent' reference documentation](#create)._

### 4 - Add context operations ###

We have now created our first agent but it is not able to do much, yet. To learn a decision model it needs to be provided with data, in **craft ai** these are called context operations.

In the following we add 8 operations:

1. The initial one sets the initial state of the agent, on July 25 2016 at 5:30, in Paris, nobody is there and the light is off;
2. At 7:02, someone enters the room the light is turned on;
3. At 7:15, someone else enters the room;
4. At 7:31, the light is turned off;
5. At 8:12, everyone leaves the room;
6. At 19:23, 2 persons enter the room;
7. At 22:35, the light is turned on;
8. At 23:06, everyone leaves the room and the light is turned off.

```js
var AGENT_ID = 'my_first_agent';

client.deleteAgent(AGENT_ID)
.then(function() {
  console.log('Agent ' + AGENT_ID + ' no longer exists.');
  return client.createAgent(/*...*/);
})
.then(function(agent) {
  console.log('Agent ' + agent.id + ' successfully created!');
  return client.addAgentContextOperations(
    AGENT_ID,
    [
      {
        timestamp: 1469410200,
        context: {
          timezone: '+02:00',
          peopleCount: 0,
          lightbulbState: 'OFF'
        }
      },
      {
        timestamp: 1469415720,
        context: {
          peopleCount: 1,
          lightbulbState: 'ON'
        }
      },
      {
        timestamp: 1469416500,
        context: {
          peopleCount: 2
        }
      },
      {
        timestamp: 1469417460,
        context: {
          lightbulbState: 'OFF'
        }
      },
      {
        timestamp: 1469419920,
        context: {
          peopleCount: 0
        }
      },
      {
        timestamp: 1469460180,
        context: {
          peopleCount: 2
        }
      },
      {
        timestamp: 1469471700,
        context: {
          lightbulbState: 'ON'
        }
      },
      {
        timestamp: 1469473560,
        context: {
          peopleCount: 0
        }
      }
    ]
  )
  .then(function() {
    return agent;
  });
})
.then(function(agent) {
  console.log('Successfully added initial operations to agent ' + agent.id + '.');
})
.catch(function(error) {
  console.err('Error!', error);
});
```

In real-world applications, you'll probably do the same kind of things when the agent is created and then, regularly throughout the lifetime of the agent with newer data.

_For further information, check the ['add context operations' reference documentation](#add-operations)._

### 5 - Compute the decision tree ###

The agent has acquired a context history, we can now compute a decision tree from it! A decision tree models the output, allowing us to estimate what the output would be in a given context.

The decision tree is computed at a given timestamp, which means it will consider the context history from the creation of this agent up to this moment. Let's first try to compute the decision tree at midnight on July 26, 2016.

```js
var AGENT_ID = 'my_first_agent';

client.deleteAgent(AGENT_ID)
.then(function() {
  console.log('Agent ' + AGENT_ID + ' no longer exists.');
  return client.createAgent(/*...*/);
})
.then(function(agent) {
  console.log('Agent ' + agent.id + ' successfully created!');
  return client.addAgentContextOperations(AGENT_ID, /*...*/)
  .then(function() {
    return agent;
  });
})
.then(function(agent) {
  console.log('Successfully added initial operations to agent ' + agent.id + '.');
  return client.getAgentDecisionTree(AGENT_ID, 1469476800);
})
.then(function(tree) {
  console.log('Decision tree retrieved!', tree);
})
.catch(function(error) {
  console.err('Error!', error);
});
```

Try to retrieve the tree at different timestamps to see how it gradually learns from the new operations. To visualize the trees, use the [inspector](https://beta.craft.ai/inspector)!

_For further information, check the ['compute decision tree' reference documentation](#compute)._

### 6 - Take a decision ###

Once the decision tree is computed it can be used to take a decision. In our case it is basically answering this type of question: "What is the anticipated **state of the lightbulb** at 7:15 if there are 2 persons in the room ?".

```js
var AGENT_ID = 'my_first_agent';

client.deleteAgent(AGENT_ID)
.then(function() {
  console.log('Agent ' + AGENT_ID + ' no longer exists.');
  return client.createAgent(/*...*/);
})
.then(function(agent) {
  console.log('Agent ' + agent.id + ' successfully created!');
  return client.addAgentContextOperations(AGENT_ID, /*...*/)
  .then(function() {
    return agent;
  });
})
.then(function(agent) {
  console.log('Successfully added initial operations to agent ' + agent.id + '.');
  return client.getAgentDecisionTree(AGENT_ID, 1469476800);
})
.then(function(tree) {
  console.log('Decision tree retrieved!', tree);
  let res = craftai.interpreter.decide(tree, {
    timezone: '+02:00',
    timeOfDay: 7.25,
    peopleCount: 2
  });
  console.log('The anticipated lightbulb state is "' + res.output.lightbulbState.predicted_value + '".');
})
.catch(function(error) {
  console.err('Error!', error);
});
```

_For further information, check the ['take decision' reference documentation](#take-decision)._

### Node.JS starter kit ###

If you prefer to get started from an existing code base, the official Node.JS starter kit can get you there! Retrieve the sources locally and follow the "readme" to get a fully working **SmartHome** app using _real-world_ data.

> [:package: _Get the **craft ai** Node.JS Starter Kit_](https://github.com/craft-ai/craft-ai-starterkit-nodejs)

## API ##

### Project ###

**craft ai** agents belong to **projects**. In the current version, each identified users defines a owner and can create projects for themselves, in the future we will introduce shared projects.

### Configuration ###

Each agent has a configuration defining:

- the context schema, i.e. the list of property keys and their type (as defined in the following section),
- the output properties, i.e. the list of property keys on which the agent takes decisions,

> :warning: In the current version, only one output property can be provided.

- the `time_quantum`, i.e. the minimum amount of time, in seconds, that is meaningful for an agent; context updates occurring faster than this quantum won't be taken into account. As a rule of thumb, you should always choose the largest value that seems right and reduce it, if necessary, after some tests.
- the `learning_period`, i.e. the maximum amount of time, in seconds, that matters for an agent; the agent's decision model can ignore context that is older than this duration. You should generally choose the smallest value that fits this description.

> :warning: if no time_quantum is specified, the default value is 600.

> :warning: if no learning_period is specified, the default value is 15000 time quantums.

#### Context properties types ####

##### Base types: `enum` and `continuous` #####

`enum` and `continuous` are the two base **craft ai** types:

- an `enum` property is a string;
- a `continuous` property is a real number.

> :warning: the absolute value of a `continuous` property must be less than 10<sup>20</sup>.

##### Time types: `timezone`, `time_of_day`, `day_of_week`, `day_of_month` and `month_of_year` #####

**craft ai** defines the following types related to time:

- a `time_of_day` property is a real number belonging to **[0.0; 24.0[**, each value represents the number of hours in the day since midnight (e.g. 13.5 means
13:30),
- a `day_of_week` property is an integer belonging to **[0, 6]**, each
value represents a day of the week starting from Monday (0 is Monday, 6 is
Sunday).
- a `day_of_month` property is an integer belonging to **[1, 31]**, each value represents a day of the month.
- a `month_of_year` property is an integer belonging to **[1, 12]**, each value represents a month of the year.
- a `timezone` property is a string value representing the timezone as an
offset from UTC, the expected format is **±[hh]:[mm]** where `hh` represent the
hour and `mm` the minutes from UTC (eg. `+01:30`)), between `-12:00` and
`+14:00`.

> :information_source: By default, the values of the `time_of_day` and `day_of_week`
> properties are generated from the [`timestamp`](#timestamp) of an agent's
> state and the agent's current `timezone`. Therefore, whenever you use generated
> `time_of_day` and/or `day_of_week` in your configuration, you **must** provide a
> `timezone` value in the context. There can only be one `timezone` property.
>
> If you wish to provide their values manually, add `is_generated: false` to the
> time types properties in your configuration. In this case, since you provide the values, the
> `timezone` property is not required, and you must update the context whenever
> one of these time values changes in a way that is significant for your system.

##### Examples #####

Let's take a look at the following configuration. It is designed to model the **color**
of a lightbulb (the `lightbulbColor` property, defined as an output) depending
on the **outside light intensity** (the `lightIntensity` property), the **time
of the day** (the `time` property) and the **day of the week** (the `day`
property).

`day` and `time` values will be generated automatically, hence the need for
`timezone`, the current Time Zone, to compute their value from given
[`timestamps`](#timestamp).

The `time_quantum` is set to 100 seconds, which means that if the lightbulb
color is changed from red to blue then from blue to purple in less that 1
minutes and 40 seconds, only the change from red to purple will be taken into
account.

The `learning_period` is set to 108 000 seconds (one month) , which means that
the state of the lightbulb from more than a month ago can be ignored when learning
the decision model.

```json
{
  "context": {
      "lightIntensity":  {
        "type": "continuous"
      },
      "time": {
        "type": "time_of_day"
      },
      "day": {
        "type": "day_of_week"
      },
      "timezone": {
        "type": "timezone"
      },
      "lightbulbColor": {
          "type": "enum"
      }
  },
  "output": ["lightbulbColor"],
  "time_quantum": 100,
  "learning_period": 108000
}
```

In this second example, the `time` property is not generated, no property of
type `timezone` is therefore needed. However values of `time` must be manually
provided continuously.

```json
{
  "context": {
    "time": {
      "type": "time_of_day",
      "is_generated": false
    },
    "lightIntensity":  {
        "type": "continuous"
    },
    "lightbulbColor": {
        "type": "enum"
    }
  },
  "output": ["lightbulbColor"],
  "time_quantum": 100,
  "learning_period": 108000
}
```

### Timestamp ###

**craft ai** API heavily relies on `timestamps`. A `timestamp` is an instant represented as a [Unix time](https://en.wikipedia.org/wiki/Unix_time), that is to say the amount of seconds elapsed since Thursday, 1 January 1970 at midnight UTC. In most programming languages this representation is easy to retrieve, you can refer to [**this page**](https://github.com/techgaun/unix-time/blob/master/README.md) to find out how.

#### `craftai.Time` ####

The `craftai.Time` class facilitates the handling of time types in **craft ai**. It is able to extract the different **craft ai** formats from various _datetime_ representations, thanks to [Moment.js](http://momentjs.com).

From a unix timestamp and an explicit UTC offset:

```js
const t1 = new craftai.Time(1465496929, '+10:00');

// t1 === {
//   utc: '2016-06-09T18:28:49.000Z',
//   timestamp: 1465496929,
//   day_of_week: 4,
//   day_of_month: 10,
//   month_of_year: 6,
//   time_of_day: 4.480277777777778,
//   timezone: '+10:00'
// }
```

From a unix timestamp and using the local UTC offset:

```js
const t2 = new craftai.Time(1465496929);

// Value are valid if in Paris !
// t2 === {
//   utc: '2016-06-09T18:28:49.000Z',
//   timestamp: 1465496929,
//   day_of_week: 3,
//   day_of_month: 9,
//   month_of_year: 6,
//   time_of_day: 20.480277777777776,
//   timezone: '+02:00'
// }
```

From a [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) string:

```js
const t3 = new craftai.Time('1977-04-22T01:00:00-05:00');

// t3 === {
//   utc: '1977-04-22T06:00:00.000Z',
//   timestamp: 230536800,
//   day_of_week: 4,
//   time_of_day: 1,
//   day_of_month: 22,
//   month_of_year: 4,
//   timezone: '-05:00'
// }
```

From a [moment](http://momentjs.com) (or [moment timezone](http://momentjs.com/timezone/)) instance:

```js
const t4 = new craftai.Time(moment.tz('2017-05-31 12:45:00', 'Asia/Dubai'), '-08:00'));

// t4 === {
//   utc: '2017-05-31T08:45:00.000Z',
//   timestamp: 1496220300,
//   day_of_week: 2,
//   day_of_month: 31,
//   month_of_year: 5,
//   time_of_day: 0.75,
//   timezone: '-08:00'
// }
```

Retrieve the current time with the local UTC offset:

```js
const now = new craftai.Time();
```

Retrieve the current time with a given UTC offset:

```js
const nowP5 = new craftai.Time(undefined, '+05:00');
```

### Advanced configuration ###

The following **advanced** configuration parameters can be set in specific cases. They are **optional**. Usually you would not need them.

- `operations_as_events` is a boolean, either `true` or `false`. The default value is `false`. If it is set to true, all context operations are treated as events, as opposed to context updates. This is appropriate if the data for an agent is made of events that have no duration, and if many events are more significant than a few. If `operations_as_events` is `true`, `learning_period` and the advanced parameter `tree_max_operations` must be set as well. In that case, `time_quantum` is ignored because events have no duration, as opposed to the evolution of an agent's context over time.
- `tree_max_operations` is a positive integer. It **can and must** be set only if `operations_as_events` is `true`. It defines the maximum number of events on which a single decision tree can be based. It is complementary to `learning_period`, which limits the maximum age of events on which a decision tree is based.
- `tree_max_depth` is a positive integer. It defines the maximum depth of decision trees, which is the maximum distance between the root node and a leaf (terminal) node. A depth of 0 means that the tree is made of a single root node. By default, `tree_max_depth` is set to 6 if the output is categorical (e.g. `enum`), or to 4 if the output is numerical (e.g. `continuous`).

These advanced configuration parameters are optional, and will appear in the agent information returned by **craft ai** only if you set them to something other than their default value. If you intend to use them in a production environment, please get in touch with us.

### Agent ###

#### Create ####

Create a new agent, and create its [configuration](#configuration).

```js
client.createAgent(
  { // The configuration
    context: {
      peopleCount: {
        type: 'continuous'
      },
      timeOfDay: {
        type: 'time_of_day'
      },
      timezone: {
        type: 'timezone'
      },
      lightbulbState: {
        type: 'enum'
      }
    },
    output: [ 'lightbulbState' ],
    time_quantum: 100,
    learning_period: 108000
  },
  'impervious_kraken' // id for the agent, if undefined a random id is generated
)
.then(function(agent) {
  // Work on the agent here
  // agent = {
  //   "_version": <version>
  //   "id": <agent_id>,
  //   "configuration": {
  //     "context": {
  //       "peopleCount": {
  //         "type": "continuous"
  //       },
  //       "timeOfDay": {
  //         "type": "time_of_day"
  //       },
  //       "timezone": {
  //         "type": "timezone"
  //       },
  //       "lightbulbState": {
  //         "type": "enum"
  //       }
  //     },
  //     "output": [ "lightbulbState" ],
  //     "time_quantum": 100,
  //     "learning_period": 108000
  //   }
  // }
})
.catch(function(error) {
  // Catch errors here
})
```

#### Delete ####

```js
client.deleteAgent(
  'impervious_kraken' // The agent id
)
.then(function() {
  // The agent was successfully deleted
})
.catch(function(error) {
  // Catch errors here
})
```

#### Retrieve ####

```js
client.getAgent(
  'impervious_kraken' // The agent id
)
.then(function(agent) {
  // Agent details
})
.catch(function(error) {
  // Catch errors here
})
```

#### List ####

```js
client.listAgents()
.then(function(agentIds) {
  // list of agent ids, eg. ['impervious_kraken', 'impervious_kraken']
})
.catch(function(error) {
  // Catch errors here
})
```

#### Create and retrieve shared url ####
Create and get a shareable url to view an agent tree.
Only one url can be created at a time.

```js
client.getSharedAgentInspectorUrl(
  'impervious_kraken', // The agent id.
  1464600256 // optional, the timestamp for which you want to inspect the tree.
)
.then(function(url) {
  // Url to the agent's inspector
})
.catch(function(error) {
  // Catch errors here
})
```

#### Delete shared url ####
Delete a shareable url.
The previous url cannot access the agent tree anymore.

```js
client.deleteSharedAgentInspectorUrl(
  'impervious_kraken' // The agent id.
)
.then(function() {
  // return nothing
})
.catch(function(error) {
  // Catch errors here
})
```



### Context ###

#### Add operations ####

```js
client.addAgentContextOperations(
  'impervious_kraken', // The agent id
  [ // The list of operations
    {
      timestamp: 1469410200, // Operation timestamp
      context: {
        timezone: '+02:00',
        peopleCount: 0,
        lightbulbState: 'OFF'
      }
    },
    {
      timestamp: 1469415720,
      context: {
        peopleCount: 1,
        lightbulbState: 'ON'
      }
    },
    {
      timestamp: 1469416500,
      context: {
        peopleCount: 2
      }
    },
    {
      timestamp: 1469417460,
      context: {
        lightbulbState: 'OFF'
      }
    },
    {
      timestamp: 1469419920,
      context: {
        peopleCount: 0
      }
    },
    {
      timestamp: 1469460180,
      context: {
        peopleCount: 2
      }
    },
    {
      timestamp: 1469471700,
      context: {
        lightbulbState: 'ON'
      }
    },
    {
      timestamp: 1469473560,
      context: {
        peopleCount: 0
      }
    }
  ]
)
.then(function() {
  // The operations where successfully added to agent context on the server side
})
.catch(function(error) {
  // Catch errors here
})
```

#### List operations ####

```js
client.getAgentContextOperations(
  'impervious_kraken', // The agent id
  1478894153, // Optional, the **start** timestamp from which the
              // operations are retrieved (inclusive bound)
  1478895266, // Optional, the **end** timestamp up to which the
              /// operations are retrieved (inclusive bound)
)
.then(function(operations) {
  // Work on operations
})
.catch(function(error) {
  // Catch errors here
})
```

> This call can generate multiple requests to the craft ai API as results are paginated.

#### Retrieve state ####

```js
client.getAgentContext(
  'impervious_kraken', // The agent id
  1469473600 // The timestamp at which the context state is retrieved
)
.then(function(context) {
  // Work on context
})
.catch(function(error) {
  // Catch errors here
})
```

### Decision tree ###

Decision trees are computed at specific timestamps, directly by **craft ai** which learns from the context operations [added](#add-operations) throughout time.

When you [compute](#compute) a decision tree, **craft ai** returns an object containing:
- the **API version**
- the agent's configuration as specified during the agent's [creation](#create-agent)
- the tree itself as a JSON object:

  * Internal nodes are represented by a `"decision_rule"` object and a `"children"` array. The first one, contains the `"property`, and the `"property"`'s value, to decide which child matches a context.
  * Leaves have a `"predicted_value"`, `"confidence"` and `"decision_rule"` object for this value, instead of a `"children"` array. `"predicted_value`" is an estimation of the output in the contexts matching the node. `"confidence"` is a number between 0 and 1 that indicates how confident **craft ai** is that the output is a reliable prediction.  When the output is a numerical type, leaves also have a `"standard_deviation"` that indicates a margin of error around the `"predicted_value"`.
  * The root only contains a `"children"` array.

#### Compute ####

```js
client.getAgentDecisionTree(
  'impervious_kraken', // The agent id
  1469473600 // The timestamp at which the decision tree is retrieved
)
.then(function(tree) {
  // Works with the given tree
  console.log(tree);
  /* Outputed tree is the following
  {
    "_version": "1.0.0",
    "configuration": {
      "context": {
        "peopleCount": {
          "type": "continuous"
        },
        "timeOfDay": {
          "type": "time_of_day",
          "is_generated": true
        },
        "timezone": {
          "type": "timezone"
        },
        "lightbulbState": {
          "type": "enum"
        }
      },
      "output": [
        "lightbulbState"
      ],
      "time_quantum": 600,
      "learning_period": 108000
    },
    "trees": {
      "lightbulbState": {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "confidence": 0.9545537233352661,
                    "decision_rule": {
                      "operator": "<",
                      "operand": 1,
                      "property": "peopleCount"
                    },
                    "predicted_value": "OFF"
                  },
                  {
                    "confidence": 0.8630361557006836,
                    "decision_rule": {
                      "operator": ">=",
                      "operand": 1,
                      "property": "peopleCount"
                    },
                    "predicted_value": "ON"
                  }
                ],
                "decision_rule": {
                  "operator": "<",
                  "operand": 5.666666507720947,
                  "property": "timeOfDay"
                }
              },
              {
                "confidence": 0.9947378635406494,
                "decision_rule": {
                  "operator": ">=",
                  "operand": 5.666666507720947,
                  "property": "timeOfDay"
                },
                "predicted_value": "OFF"
              }
            ],
            "decision_rule": {
              "operator": "<",
              "operand": 20.66666603088379,
              "property": "timeOfDay"
            }
          },
          {
            "confidence": 0.8630361557006836,
            "decision_rule": {
              "operator": ">=",
              "operand": 20.66666603088379,
              "property": "timeOfDay"
            },
            "predicted_value": "ON"
          }
        ],
      }
    }
  ]
  */
})
.catch(function(error) {
  // Catch errors here
})
```

#### Take decision ####

The first method retrieves the decision tree then applies it on the given context.

```js
client.computeAgentDecision(
  'impervious_kraken', // The agent id
  1464600256, // The timestamp at which the decision is taken
  { // The context on which the decision is taken
    timezone: '+02:00',
    timeOfDay: 7.5,
    peopleCount: 3
  }
)
.then(function(decision) {
  // Work on the decision
})
.catch(function(error) {
  // Catch errors here
})
```

To get a chance to store and reuse the decision tree, use `getAgentDecisionTree` and use `craftai.interpreter.decide`, a simple function evaluating a decision tree **offline**.

```js
// `tree` is the decision tree as retrieved through the craft ai REST API
let tree = { ... };
// Compute the decision with specifying every context field
let decision = craftai.interpreter.decide(
  tree,
  {
    timezone: '+02:00',
    timeOfDay: 7.5,
    peopleCount: 3
  }
// Or Compute the decision on a context created from the given one and filling the
// `day_of_week`, `time_of_day` and `timezone` properties from the given `Time`
let decision = craftai.interpreter.decide(
  tree,
  {
    timezone: '+02:00',
    peopleCount: 3
  },
  new craftai.Time('2010-01-01T07:30:30'));
```

> Any number of partial contexts and/or `craftai.Time` instances can be provided to `decide`, it follows the same semantics as [Object.assign(...)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign): the later arguments overriding the properties value from the previous ones)

A computed `decision` on an `enum` type would look like:

```js
{
  context: { // In which context the decision was taken
    timezone: '+02:00',
    timeOfDay: 7.5,
    peopleCount: 3
  },
  output: { // The decision itself
    lightbulbState: {
      predicted_value: 'ON',
      confidence: 0.9937745256361138, // The confidence in the decision
      decision_rules: [ // The ordered list of decision_rules that were validated to reach this decision
        {
          property: 'timeOfDay',
          operator: '>=',
          operand: 6
        },
        {
          property: 'peopleCount',
          operator: '>=',
          operand: 2
        }
      ]
    }
  }
}
```

A `decision` for a numerical output type would look like:

```js
  output: {
    lightbulbIntensity: {
      predicted_value: 10.5,
      standard_deviation: 1.25,
      confidence: ...,
      decision_rules: [ ... ]
    }
  }
```

A `decision` in a case where the tree cannot make a prediction:

```js
  decision: {
    lightbulbState: {
      predicted_value: null, // No decision
      confidence: 0, // Zero confidence if the decision is null
      decision_rules: [ ... ]
    }
  },
```

#### Take multiple decisions ####

From the tree previously retrieved, ask for multiple decisions.

```js
// `tree` is the decision tree as retrieved through the craft ai REST API
let tree = { ... };
// Pass an array containing each context on which you want to take a decision
let decisionRules = craftai.interpreter.decideFromContextsArray(tree, [
  {
    timezone: '+02:00',
    peopleCount: 3,
    timeOfDay: 7.5
  },
  {
    timezone: '+02:00',
    peopleCount: 4,
    timeOfDay: 7.5
  },
  {
    timezone: '+02:00',
    peopleCount: 0,
    timeOfDay: 4.5
  }
])
```

Results for `craftai.interpreter.decideFromContextsArray` would look like:

```js
[
  {
    context: { // In which context the decision was taken
      timezone: '+02:00',
      timeOfDay: 7.5,
      peopleCount: 3
    },
    output: { // The decision itself
      lightbulbState: {
        predicted_value: 'ON',
        confidence: 0.9937745256361138, // The confidence in the decision
        decision_rules: [ // The ordered list of decision_rules that were validated to reach this decision
          {
            property: 'timeOfDay',
            operator: '>=',
            operand: 6
          },
          {
            property: 'peopleCount',
            operator: '>=',
            operand: 2
          }
        ]
      }
    }
  },
  {
    context: {
      timezone: '+02:00',
      timeOfDay: 7.5,
      peopleCount: 4
    },
    output: {
      lightbulbState: {
        predicted_value: 'ON',
        confidence: 0.9937745256361138,
        decision_rules: [
          {
            property: 'timeOfDay',
            operator: '>=',
            operand: 6
          },
          {
            property: 'peopleCount',
            operator: '>=',
            operand: 2
          }
        ]
      }
    }
  },
  {
    context: {
      timezone: '+02:00',
      timeOfDay: 4.5,
      peopleCount: 0
    },
    output: {
      lightbulbState: {
        predicted_value: 'OFF',
        confidence: 0.9545537233352661,
        decision_rules: [ // The ordered list of decision_rules that were validated to reach this decision
          {
            property: 'timeOfDay',
            operator: '<',
            operand: 5.666666507720947
          },
          {
            property: 'peopleCount',
            operator: '<',
            operand: 1
          }
        ]
      }
    }
  }
]
```
#### Get decision rules properties ####

From the tree previously retrieved, get the properties from the context that matters in the tree.

```js
// `tree` is the decision tree as retrieved through the craft ai REST API
let tree = { ... };

let decisionRules = craftai.interpreter.getDecisionRulesProperties(tree)
```

Results for `craftai.interpreter.getDecisionRulesProperties` would look like:

```js
[
  {
    property: 'timeOfDay',
    is_generated: true,
    type: 'time_of_day'
  }
]
```

### Logging ###

The **craft ai** client is using
[visionmedia/debug](https://www.npmjs.com/package/debug) under the namespace
`'craft-ai:client:*'`, please refer to their documentation for further
information.
