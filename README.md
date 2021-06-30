# **craft ai** isomorphic javascript client #

[![Version](https://img.shields.io/npm/v/craft-ai.svg?style=flat-square)](https://npmjs.org/package/craft-ai) [![Build Status](https://github.com/craft-ai/craft-ai-client-js/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/craft-ai/craft-ai-client-js/actions) [![License](https://img.shields.io/badge/license-BSD--3--Clause-42358A.svg?style=flat-square)](LICENSE) [![Dependencies](https://img.shields.io/david/craft-ai/craft-ai-client-js.svg?style=flat-square)](https://david-dm.org/craft-ai/craft-ai-client-js) [![Dev Dependencies](https://img.shields.io/david/dev/craft-ai/craft-ai-client-js.svg?style=flat-square)](https://david-dm.org/craft-ai/craft-ai-client-js#info=devDependencies)

[**craft ai**'s Explainable AI API](http://craft.ai) enables product & operational teams to quickly deploy and run explainable AIs. craft ai decodes your data streams to deliver self-learning services.

## Get Started!

### 1 - Create a project

Once your account is setup, let's create your first **project**! Go in the 'Projects' tab in the **craft ai** control center at [`https://beta.craft.ai/inspector`](https://beta.craft.ai/inspector), and press **Create a project**.

Once it's done, you can click on your newly created project to retrieve its tokens. There are two types of tokens: **read** and **write**. You'll need the **write** token to create, update and delete your agent.

### 2 - Setup

#### Install ####

##### [Node.js](https://nodejs.org/en/) / [Webpack](http://webpack.github.io) / [Browserify](http://browserify.org) #####

Let's first install the package from npm.

```sh
npm install craft-ai --save
```
Then import it in your code

```js
const craftai = require('craft-ai').createClient;
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

```js
// The token you retrieved for a given project
const client = craftai('{token}');
```

### 3 - Create an agent

**craft ai** is based on the concept of **agents**. In most use cases, one agent is created per user or per device.

An agent is an independent data set that stores the history of the **context** of its user or device's context, and learns which **prediction** to make based on the evolution of this context.

In this example, we will create an agent that learns the **predictive model** of a light bulb based on the time of the day and the number of people in the room. This dataset is treated as continuous context updates. If your data is more like events than context changes, please refer to the [Advanced Configuration section](#advanced-configuration) to know how to configure `operations_as_events` for your agent. Here, the agent's context has 4 properties or features:

- `peopleCount` which is a `continuous` property,
- `timeOfDay` which is a `time_of_day` property,
- `timezone`, a property of type `timezone` needed to generate proper values for `timeOfDay` (cf. the [context properties type section](#context-properties-types) for further information),
- and finally `lightbulbState` which is an `enum` property that is also the output.

> :information_source: `timeOfDay` is auto-generated, you will find more information below.

```js
const AGENT_ID = 'my_first_agent';

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
    model_type: 'decisionTree',
    output: [ 'lightbulbState' ]
  },
  AGENT_ID
)
.then(function(agent) {
  console.log('Agent ' + agent.id + ' successfully created!');
})
.catch(function(error) {
  console.error('Error!', error);
});
```

Pretty straightforward to test! Open [`https://beta.craft.ai/inspector`](https://beta.craft.ai/inspector), select you project and your agent is now listed.

Now, if you run that a second time, you'll get an error: the agent `'my_first_agent'` was already created. Let's see how we can delete it before recreating it.

```js
const AGENT_ID = 'my_first_agent';

client.deleteAgent(AGENT_ID)
.then(function() {
  console.log('Agent ' + AGENT_ID + ' no longer exists.');
  return client.createAgent(/*...*/);
})
.then(function(agent) {
  console.log('Agent ' + agent.id + ' successfully created!');
})
.catch(function(error) {
  console.error('Error!', error);
});
```

_For further information, check the ['create agent' reference documentation](#create)._

### 4 - Add context operations

We have now created our first agent but it is not able to do much, yet. To learn a model it needs to be provided with data, in **craft ai** these are called context operations.

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
const AGENT_ID = 'my_first_agent';

// for the purpose of this test, we delete and recreate the agent
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
          timezone: '+02:00',
          peopleCount: 1,
          lightbulbState: 'ON'
        }
      },
      {
        timestamp: 1469416500,
        context: {
          timezone: '+02:00',
          peopleCount: 2,
          lightbulbState: 'ON'
        }
      },
      {
        timestamp: 1469417460,
        context: {
          timezone: '+02:00',
          peopleCount: 2,
          lightbulbState: 'OFF'
        }
      },
      {
        timestamp: 1469419920,
        context: {
          timezone: '+02:00',
          peopleCount: 0,
          lightbulbState: 'OFF'
        }
      },
      {
        timestamp: 1469460180,
        context: {
          timezone: '+02:00',
          peopleCount: 2,
          lightbulbState: 'OFF'
        }
      },
      {
        timestamp: 1469471700,
        context: {
          timezone: '+02:00',
          peopleCount: 2,
          lightbulbState: 'ON'
        }
      },
      {
        timestamp: 1469473560,
        context: {
          timezone: '+02:00',
          peopleCount: 0,
          lightbulbState: 'ON'
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
  console.error('Error!', error);
});
```

In real-world applications you will probably do the same kind of thing when the agent is created, and then regularly throughout the lifetime of the agent with newer data.

_For further information, check the ['add context operations' reference documentation](#add-operations)._

### 5 - Compute the decision tree

The agent has acquired a context history, we can now compute a model (in this case a decision tree) from it! A decision tree models the output, allowing us to estimate what the output would be in a given context.

The decision tree is computed at a given timestamp, which means it will consider the data from the creation of this agent up to this moment. Let's first try to compute the decision tree at midnight on July 26, 2016.

```js
const AGENT_ID = 'my_first_agent';

// for the purpose of this test, we delete and recreate the agent
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
  console.error('Error!', error);
});
```

Try to retrieve the tree at different timestamps to see how it gradually learns from the new operations. To visualize the trees, use the [inspector](https://beta.craft.ai/inspector)!

_For further information, check the ['compute decision tree' reference documentation](#compute)._

### 6 - Make a decision

Once the decision tree is computed it can be used to make a decision or prediction. In our case it is basically answering this type of question: "What is the anticipated **state of the lightbulb** at 7:15 if there are 2 persons in the room ?".

```js
const AGENT_ID = 'my_first_agent';

// for the purpose of this test, we delete and recreate the agent
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
  const res = craftai.interpreter.decide(tree, {
    timezone: '+02:00',
    timeOfDay: 7.25,
    peopleCount: 2
  });
  console.log('The anticipated lightbulb state is "' + res.output.lightbulbState.predicted_value + '".');
})
.catch(function(error) {
  console.error('Error!', error);
});
```

_For further information, check the ['make decision' reference documentation](#make-decision)._

### Node.JS starter kit ###

If you prefer to get started from an existing code base, the official Node.JS starter kit can get you there! Retrieve the sources locally and follow the "readme" to get a fully working **SmartHome** app using _real-world_ data.

> [:package: _Get the **craft ai** Node.JS Starter Kit_](https://github.com/craft-ai/craft-ai-starterkit-nodejs)

## API

### Project

**craft ai** agents belong to **projects**. In the current version, each identified users defines a owner and can create projects for themselves, in the future we will introduce shared projects.

### Configuration

Each agent has a configuration defining:

- the context schema, i.e. the list of property keys and their type (as defined in the following section),
- the output properties, i.e. the list of property keys on which the agent makes decisions,
- the model type, either decision tree or gradient boosting.

#### Context properties types

##### Base types: `enum`, `continuous` and `boolean`

`enum`, `continuous` and `boolean` are the three base **craft ai** types:

- an `enum` property is a string;
- a `continuous` property is a real number.
- a `boolean` property is a boolean value: `true` or `false`

> :warning: the absolute value of a `continuous` property must be less than 10<sup>20</sup>.

Here is a simple example of configuration for decision tree:
```json
{
  "context": {
    "timezone": {
      "type": "enum"
    },
    "temperature": {
      "type": "continuous"
    },
    "lightbulbState": {
      "type": "enum"
    }
  },
  "model_type": "decisionTree",
  "output": ["lightbulbState"],
  "time_quantum": 100,
  "learning_period": 108000
}
```

And another simple example of configuration for gradient boosting:
```json
{
  "context": {
    "timezone": {
      "type": "enum"
    },
    "temperature": {
      "type": "continuous"
    },
    "lightbulbState": {
      "type": "enum"
    }
  },
  "model_type": "boosting",
  "output": ["lightbulbState"],
  "learning_rate": 1,
  "num_iterations": 50,
  "time_quantum": 100,
  "learning_period": 108000
}
```

##### Time types: `timezone`, `time_of_day`, `day_of_week`, `day_of_month` and `month_of_year`

**craft ai** defines the following types related to time:

- a `time_of_day` property is a real number belonging to **[0.0; 24.0[**, each value represents the number of hours in the day since midnight (e.g. 13.5 means 13:30),
- a `day_of_week` property is an integer belonging to **[0, 6]**, each value represents a day of the week starting from Monday (0 is Monday, 6 is Sunday).
- a `day_of_month` property is an integer belonging to **[1, 31]**, each value represents a day of the month.
- a `month_of_year` property is an integer belonging to **[1, 12]**, each value represents a month of the year.
- a `timezone` property can be:
  * a string value representing the timezone as an offset from UTC, supported formats are:

    - **±[hh]:[mm]**,
    - **±[hh][mm]**,
    - **±[hh]**,

    where `hh` represent the hour and `mm` the minutes from UTC (eg. `+01:30`)), between `-12:00` and
    `+14:00`.

  * an integer belonging to **[-720, 840]** which represents the timezone as an offset from UTC:

    - in hours if the integer belongs to **[-15, 15]**
    - in minutes otherwise

  * an abbreviation among the following:

    - **UTC** or **Z** Universal Time Coordinated,
    - **GMT** Greenwich Mean Time, as UTC,
    - **BST** British Summer Time, as UTC+1 hour,
    - **IST** Irish Summer Time, as UTC+1,
    - **WET** Western Europe Time, as UTC,
    - **WEST** Western Europe Summer Time, as UTC+1,
    - **CET** Central Europe Time, as UTC+1,
    - **CEST** Central Europe Summer Time, as UTC+2,
    - **EET** Eastern Europe Time, as UTC+2,
    - **EEST** Eastern Europe Summer Time, as UTC+3,
    - **MSK** Moscow Time, as UTC+3,
    - **MSD** Moscow Summer Time, as UTC+4,
    - **AST** Atlantic Standard Time, as UTC-4,
    - **ADT** Atlantic Daylight Time, as UTC-3,
    - **EST** Eastern Standard Time, as UTC-5,
    - **EDT** Eastern Daylight Saving Time, as UTC-4,
    - **CST** Central Standard Time, as UTC-6,
    - **CDT** Central Daylight Saving Time, as UTC-5,
    - **MST** Mountain Standard Time, as UTC-7,
    - **MDT** Mountain Daylight Saving Time, as UTC-6,
    - **PST** Pacific Standard Time, as UTC-8,
    - **PDT** Pacific Daylight Saving Time, as UTC-7,
    - **HST** Hawaiian Standard Time, as UTC-10,
    - **AKST** Alaska Standard Time, as UTC-9,
    - **AKDT** Alaska Standard Daylight Saving Time, as UTC-8,
    - **AEST** Australian Eastern Standard Time, as UTC+10,
    - **AEDT** Australian Eastern Daylight Time, as UTC+11,
    - **ACST** Australian Central Standard Time, as UTC+9.5,
    - **ACDT** Australian Central Daylight Time, as UTC+10.5,
    - **AWST** Australian Western Standard Time, as UTC+8.

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

##### Examples

Let's take a look at the following configuration. It is designed to model the **color** of a lightbulb (the `lightbulbColor` property, defined as an output) depending on the **outside light intensity** (the `lightIntensity` property), the **TV status** (the `TVactivated` property) the **time of the day** (the `time` property) and the **day of the week** (the `day` property).

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
    "lightIntensity": {
      "type": "continuous"
    },
    "TVactivated": {
      "type": "boolean"
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
  "model_type": "decisionTree",
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
    "lightIntensity": {
      "type": "continuous"
    },
      "TVactivated": {
      "type": "boolean"
    },
    "lightbulbColor": {
      "type": "enum"
    }
  },
  "model_type": "decisionTree",
  "output": ["lightbulbColor"],
  "time_quantum": 100,
  "learning_period": 108000
}
```

### Timestamp

**craft ai** API heavily relies on `timestamps`. A `timestamp` is an instant represented as a [Unix time](https://en.wikipedia.org/wiki/Unix_time), that is to say the amount of seconds elapsed since Thursday, 1 January 1970 at midnight UTC. Note that some programming languages use timestamps in milliseconds, but here we only refer to timestamps **in seconds**. In most programming languages this representation is easy to retrieve, you can refer to [**this page**](https://github.com/techgaun/unix-time/blob/master/README.md) to find out how.

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

### Configuration parameters

The following configuration parameters can be set in specific cases.

#### Common parameters

- **`model_type`**, i.e. the selected model. Values can be `decisionTree` or `boosting`. If not set, the default value is `decisionTree`.
- **`time_quantum`**, i.e. the minimum amount of time, in seconds, that is meaningful for an agent; context updates occurring faster than this quantum won't be taken into account. As a rule of thumb, you should always choose the largest value that seems right and reduce it, if necessary, after some tests. Default value is 600. This parameter is ignored if `operations_as_events` is set to `true`.
- **`operations_as_events`** is a boolean, either `true` or `false`. The default value is `false`. If you are not sure what to do, set it to `true`. If it is set to false, context operations are treated as state changes, and models are based on the resulting continuous state including between data points, using `time_quantum` as the sampling step. If it is set to true, context operations are treated as observations or events, and models are based on these data points directly, as in most machine learning libraries. If `operations_as_events` is `true`, `max_training_samples` and `learning_period` for decision trees must be set, and `time_quantum` is ignored because events have no duration.
- **`max_training_samples`** is a positive integer. It **can and must** be set only if `operations_as_events` is `true`. It defines the maximum number of events on which a model can be based. It is complementary to `learning_period` for decision trees, which limits the maximum age of data on which a model is based.
- **`min_samples_per_leaf`** is a positive integer. It defines the minimum number of samples in a tree leaf. It is complementary to `tree_max_depth` in preventing the tree from overgrowing, hence limiting overfitting. By default, `min_samples_per_leaf` is set to 4.
- **`tree_max_depth`** is a positive integer. It defines the maximum depth of decision trees, which is the maximum distance between the root node and a leaf (terminal) node. A depth of 0 means that the tree is made of a single root node. By default, `tree_max_depth` is set to 6 if the output is categorical (e.g. `enum`), or to 4 if the output is numerical (e.g. `continuous`) or if it's a boosting configuration.

#### Decision tree parameters

- **`learning_period`**, i.e. the maximum amount of time, in seconds, that matters for an agent; the agent's decision model can ignore context that is older than this duration. You should generally choose the smallest value that fits this description. Default value is 15000 time quantums and the maximum learning_period value is 55000 \* time_quantum.

#### Boosting parameters

- **`learning_rate`** is a positive float. It defines the step size shrinkage used between tree updates to prevent overfitting. Its value must be in `]0;1]`.
- **`num_iterations`** is a positive integer. It describes the number of trees that would be created for the forest.

### Agent

#### Create

Create a new agent, and define its [configuration](#configuration).

> The agent's identifier is a case sensitive string between 1 and 36 characters long. It only accepts letters, digits, hyphen-minuses and underscores (i.e. the regular expression `/[a-zA-Z0-9_-]{1,36}/`).

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
    model_type: 'decisionTree',
    output: [ 'lightbulbState' ],
    time_quantum: 100,
    learning_period: 108000
  },
  'impervious_kraken' // id for the agent, if undefined a random id is generated
)
.then(function(agent) {
  // Work on the agent here
  // agent = {
  //   _version: <version>
  //   id: <agent_id>,
  //   configuration: {
  //     context: {
  //       peopleCount: {
  //         type: 'continuous'
  //       },
  //       timeOfDay: {
  //         type: 'time_of_day'
  //       },
  //       timezone: {
  //         type: 'timezone'
  //       },
  //       lightbulbState: {
  //         type: 'enum'
  //       }
  //     },
  //     output: [ 'lightbulbState' ],
  //     time_quantum: 100,
  //     learning_period: 108000
  //   }
  // }
})
.catch(function(error) {
  // Catch errors here
})
```

#### Delete

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

#### Retrieve

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

#### List

```js
client.listAgents()
.then(function(agentIds) {
  // list of agent ids, eg. ['impervious_kraken', 'impervious_kraken']
})
.catch(function(error) {
  // Catch errors here
})
```

#### Create and retrieve shared url

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

#### Delete shared url

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



### Generator

The craft ai API lets you generate models built on data from one or several agents by creating a generator. It is useful to:
  - test several hyper-parameters and features sets without reloading all the data for each try
  - gather data from different agents to make new models based on several data sources, enhancing the possible data combinations and allowing you to inspect the global behavior across your agents

The data stream(s) used by a generator are defined by specifying a list of agents as a filter in its configuration. Other than the filter, the configuration of a generator is similar to an agent's configuration. But it has to verify some additional properties:

- Every feature defined in the context configuration of the generator must be present in **all** the agent that match the filter, with the same context types.
- The parameter `operations_as_events` must be set to `true`.
- It follows that the parameters `max_training_samples`, and `learning_period` in the case of decision trees, must be set.
- The agent names provided in the list must be valid agent identifiers.

#### Create

Create a new generator, and define its [configuration](#configuration).

> The generator's identifier is a case sensitive string between 1 and 36 characters long. It only accepts letters, digits, hyphen-minuses and underscores (i.e. the regular expression `/[a-zA-Z0-9_-]{1,36}/`).

```js

const GENERATOR_FILTER = ['smarthome'];
const GENERATOR_NAME = 'smarthome_gen';

const GENERATOR_CONFIGURATION = {
  context: {
      light: {
          type: 'enum'
      },
      tz: {
          type: 'timezone'
      },
      movement: {
          type: 'continuous'
      },
      time: {
          type: 'time_of_day',
          is_generated: true
      }
  },
  modelType: 'decisionTree',
  output: [
      'light'
  ],
  learning_period: 1500000,
  max_training_samples: 15000,
  operations_as_events: true,
  filter: GENERATOR_FILTER
};

client.createGenerator(GENERATOR_CONFIGURATION, GENERATOR_NAME)
  .then(function(generator) {
    console.log('Generator ' + generator.id + ' successfully created!');
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

#### Delete

```js
const GENERATOR_NAME = 'smarthome_gen'

client.deleteGenerator(GENERATOR_NAME)
  .then(function() {
  // The generator was successfully deleted
  })
  .catch(function(error) {
    // Catch errors here
  })
```

#### Retrieve

```js
const GENERATOR_NAME = 'smarthome_gen'

client.getGenerator(GENERATOR_NAME)
  .then(function(generator) {
    // Generator's details
  })
  .catch(function(error) {
    // Catch errors here
  })
```

#### Retrieve generators list

```js
const GENERATOR_NAME = 'smarthome_gen'

client.listGenerators()
  .then(function(generatorsList) {
    // The list of generators in the project
  })
  .catch(function(error) {
    // Catch errors here
  })
```

#### List operations in the generator

Retrieve the context operations of agents matching the generator's filter. Each operation also contains the identifier of the agent for which it was added, in the `agent_id` property.

```js
client.getGeneratorContextOperations(
  'smarthome_gen', // The generator id
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

### Context

#### Add operations

```js
client.addAgentContextOperations(
  'impervious_kraken', // The agent id
  [ // The list of operations
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
        timezone: '+02:00',
        peopleCount: 1,
        lightbulbState: 'ON'
      }
    },
    {
      timestamp: 1469416500,
      context: {
        timezone: '+02:00',
        peopleCount: 2,
        lightbulbState: 'ON'
      }
    },
    {
      timestamp: 1469417460,
      context: {
        timezone: '+02:00',
        peopleCount: 2,
        lightbulbState: 'OFF'
      }
    },
    {
      timestamp: 1469419920,
      context: {
        timezone: '+02:00',
        peopleCount: 0,
        lightbulbState: 'OFF'
      }
    },
    {
      timestamp: 1469460180,
      context: {
        timezone: '+02:00',
        peopleCount: 2,
        lightbulbState: 'OFF'
      }
    },
    {
      timestamp: 1469471700,
      context: {
        timezone: '+02:00',
        peopleCount: 2,
        lightbulbState: 'ON'
      }
    },
    {
      timestamp: 1469473560,
      context: {
        timezone: '+02:00',
        peopleCount: 0,
        lightbulbState: 'ON'
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

##### Missing Values

If the value of a base type property is **missing**, you can send a `null` value. **craft ai** will take into account as much information as possible from this incomplete context.

A context operation with a missing value looks like:
```json
[
  {
    "timestamp": 1469415720,
    "context": {
      "peopleCount": "OFF",
      "lightbulbState": null
    }
  },
  ...
]
```

##### Optional Values

If the value of an **optional** property is not filled at some point—as should be expected from an optional value—send the empty JSON Object `{}` to **craft ai**:

A context with an optional value looks like:
```json
[
  {
    "timestamp": 1469415720,
    "context": {
      "timezone": "+02:00",
      "temperature": {},
      "lightbulbState": "OFF"
    }
  },
  ...
]
```

#### List operations

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

#### Retrieve state

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

#### Retrieve state history

```js
client.getAgentStateHistory(
  'impervious_kraken', // The agent id
  1478894153, // Optional, the **start** timestamp from which the
              // operations are retrieved (inclusive bound)
  1478895266, // Optional, the **end** timestamp up to which the
              /// operations are retrieved (inclusive bound)
)
.then(function(stateHistory) {
  // Work on states history
})
.catch(function(error) {
  // Catch errors here
})
```

### Gradient boosting

Models can be generated with gradient boosting by setting the configuration parameter `model_type` to `boosting`. Models are based on training data within a provided timestamp window among data that was [added](#add-operations). You can only query predictions directly for gradient boosting models.

The implementation is based on LightGBM, but there are some parameters that differ from the ones used by default by LightGBM.

For classification:

- **`max_bin`** = 255. Max number of bins that feature values will be bucketed in (https://lightgbm.readthedocs.io/en/latest/Parameters.html#max_bin).

For regression:

- **`metric`** = L2 (alias mse). Metric(s) to be evaluated on the evaluation set(s) (https://lightgbm.readthedocs.io/en/latest/Parameters.html#metric).
- **`feature_fraction`** = 0.9. Randomly select a subset of features on each iteration (https://lightgbm.readthedocs.io/en/latest/Parameters.html#feature_fraction).
- **`bagging_freq`** = 5. Perform bagging at every k iteration. Every k-th iteration, LightGBM will randomly select `bagging_fraction` * 100% of the data to use for the next k iterations (https://lightgbm.readthedocs.io/en/latest/Parameters.html#bagging_freq).
- **`bagging_fraction`** = 0.8. It will randomly select part of data without resampling (https://lightgbm.readthedocs.io/en/latest/Parameters.html#bagging_fraction).
- **`min_sum_hessian_in_leaf`** = 5.0. It's the minimal sum hessian in one leaf (https://lightgbm.readthedocs.io/en/latest/Parameters.html#min_sum_hessian_in_leaf).

 See the [configuration](#configuration) section for parameters that you can set.

#### Get decision using boosting for agent

```js
const FROM_TIMESTAMP = 1469473600;
const TO_TIMESTAMP = 1529473600;
const CONTEXT_OPS = {
  tz: '+02:00',
  movement: 2,
  time: 7.5
};

client.computeAgentBoostingDecision(
  'impervious_kraken', // The generator id
  FROM_TIMESTAMP, //
  TO_TIMESTAMP,
  CONTEXT_OPS
)
  .then((decision) => {
    console.log(decision); // The decision made by the boosting
    /*
      {
        context: {
          tz: '+02:00',
          movement: 2,
          time: 7.5
        },
        output: {
          predicted_value: 'OFF'
        }
      }
    */
  })
```

#### Get decision using boosting for generator

```js
const FROM_TIMESTAMP = 1469473600;
const TO_TIMESTAMP = 1529473600;
const CONTEXT_OPS = {
  tz: '+02:00',
  movement: 2,
  time: 7.5
};

client.computeGeneratorBoostingDecision(
  'impervious_kraken', // The generator id
  FROM_TIMESTAMP, //
  TO_TIMESTAMP,
  CONTEXT_OPS
)
  .then((decision) => {
    console.log(decision); // The decision made by the boosting
    /*
      {
        context: {
          tz: '+02:00',
          movement: 2,
          time: 7.5
        },
        output: {
          predicted_value: 'OFF'
        }
      }
    */
  })
```

### Decision tree

Models can be generated as single decision trees by setting the configuration parameter `model_type` to `decisionTree`. Decision trees are computed based on data up to a specific timestamp and dating back to the `learning_period` configuration parameter among data that was [added](#add-operations).

When you [compute](#compute) a decision tree, **craft ai** returns an object containing:

- the version of the model's format
- the agent's configuration as specified during the agent's [creation](#create-agent)
- the tree itself as a JSON object:

  - Internal nodes are represented by a `"decision_rule"` object and a `"children"` array. The first one, contains the `"property`, and the `"property"`'s value, to decide which child matches a context.
  - Leaves have a `"predicted_value"`, `"confidence"` and `"decision_rule"` object for this value, instead of a `"children"` array. `"predicted_value`" is an estimation of the output in the contexts matching the node. `"confidence"` is a number between 0 and 1 that indicates how confident **craft ai** is that the output is a reliable prediction. When the output is a numerical type, leaves also have a `"standard_deviation"` that indicates a margin of error around the `"predicted_value"`.
  - The root only contains a `"children"` array.

#### Get decision tree for an agent

```js
client.getAgentDecisionTree(
  'impervious_kraken', // The agent id
  1469473600 // The timestamp at which the decision tree is retrieved
)
.then(function(tree) {
  // Works with the given tree
  console.log(tree);
  /* Outputted tree is the following
  {
    _version:'2.0.0',
    trees:{
      lightbulbState:{
        output_values:['OFF', 'ON'],
        children:[
          {
            children:[
              {
                prediction:{
                  confidence:0.6774609088897705,
                  distribution:[0.8, 0.2],
                  value:'OFF',
                  nb_samples: 5
                },
                decision_rule:{
                  operand:0.5,
                  operator:'<',
                  property:'peopleCount'
                }
              },
              {
                prediction:{
                  confidence:0.8630361557006836,
                  distribution:[0.1, 0.9],
                  value:'ON',
                  nb_samples: 10
                },
                decision_rule:{
                  operand:0.5,
                  operator:'>=',
                  property:'peopleCount'
                }
              }
            ],
            decision_rule:{
              operand:[
                5,
                5.6666665
              ],
              operator:'[in[',
              property:'timeOfDay'
            }
          },
          {
            children:[
              {
                prediction:{
                  confidence:0.9947378635406494,
                  distribution:[1.0, 0.0],
                  value:'ON',
                  nb_samples: 10
                },
                decision_rule:{
                  operand:[
                    5.6666665,
                    20.666666
                  ],
                  operator:'[in[',
                  property:'timeOfDay'
                }
              },
              {
                children:[
                  {
                    prediction:{
                      confidence:0.969236433506012,
                      distribution:[0.95, 0.05],
                      value:'OFF',
                      nb_samples: 10
                    },
                    decision_rule:{
                      operand:1,
                      operator:'<',
                      property:'peopleCount'
                    }
                  },
                  {
                    prediction:{
                      confidence:0.8630361557006836,
                      distribution:[0.2, 0.8],
                      value:'ON',
                      nb_samples: 15
                    },
                    decision_rule:{
                      operand:1,
                      operator:'>=',
                      property:'peopleCount'
                    }
                  }
                ],
                decision_rule:{
                  operand:[
                    20.666666,
                    5
                  ],
                  operator:'[in[',
                  property:'timeOfDay'
                }
              }
            ],
            decision_rule:{
              operand:[
                5.6666665,
                5
              ],
              operator:'[in[',
              property:'timeOfDay'
            }
          }
        ]
      }
    },
    configuration:{
      time_quantum:600,
      learning_period:9000000,
      context:{
        peopleCount:{
          type:'continuous'
        },
        timeOfDay:{
          type:'time_of_day',
          is_generated:true
        },
        timezone:{
          type:'timezone'
        },
        lightbulbState:{
          type:'enum'
        }
      },
      output:[
        'lightbulbState'
      ]
    }
  }
  */
})
.catch(function(error) {
  if (error instanceof craftai.errors.CraftAiLongRequestTimeOutError) {
    // Handle timeout errors here
  }
  else {
    // Handle other errors here
  }
})
```

#### Get decision using a decision tree for an agent

> :information_source: To make a decision (prediction) with decision tree, first compute the decision tree then use the **offline interpreter**.

#### Get decision tree for a generator

```js
const DECISION_TREE_TIMESTAMP = 1469473600;
const GENERATOR_NAME = 'smarthome_gen';
client.getGeneratorDecisionTree(
  GENERATOR_NAME, // The generator id
  DECISION_TREE_TIMESTAMP // The timestamp at which the decision tree is retrieved
)
  .then(function(tree) {
    // Works with the given tree
    console.log(tree);
    /* Outputted tree is the following
     {
    _version: '2.0.0',
    trees: {
        light: {
            children: [
                {
                    predicted_value: 'OFF',
                    confidence: 0.9966583847999572,
                    decision_rule: {
                        operand: [
                            7.25,
                            22.65
                        ],
                        operator: '[in[',
                        property: 'time'
                    }
                },
                {
                    predicted_value: 'ON',
                    confidence: 0.9266583847999572,
                    decision_rule: {
                        operand: [
                            22.65,
                            7.25
                        ],
                        operator: '[in[',
                        property: 'time'
                    }
                }
            ]
        }
    },
    configuration: {
        operations_as_events: true,
        learning_period: 1500000,
        max_training_samples: 15000,
        context: {
            light: {
                type: 'enum'
            },
            tz: {
                type: 'timezone'
            },
            movement: {
                type: 'continuous'
            },
            time: {
                type: 'time_of_day',
                is_generated: true
            }
        },
        output: [
            'light'
        ],
        filter: [
            'smarthome'
        ]
    }
  }
    */
  })
  .catch(function(error) {
    if (error instanceof craftai.errors.CraftAiLongRequestTimeOutError) {
     // Handle timeout errors here
   }
    else {
      // Handle other errors here
    }
  })
```

#### Get decision using a decision tree for a generator

```js
const CONTEXT_OPS = {
  tz: '+02:00',
  movement: 2,
  time: 7.5
};
const DECISION_TREE_TIMESTAMP = 1469473600;
const GENERATOR_NAME = 'smarthome_gen';

client.computeGeneratorDecision(
  GENERATOR_NAME, // The name of the generator
  DECISION_TREE_TIMESTAMP, //The timestamp at which the decision tree is retrieved
  CONTEXT_OPS // A valid context operation according to the generator configuration
)
  .then(function(decision) => {
    console.log(decision); // The decision made by the decision tree
    /*
      {
      _version: '2.0.0',
      context: {
          tz: '+02:00',
          movement: 2,
          time: 7.5
      },
      output: {
          light: {
              predicted_value: 'OFF',
              confidence: 0.8386044502258301,
              decision_rules: [
                  {
                      operand: [
                          2.1166666,
                          10.333333
                      ],
                      operator: '[in[',
                      property: 'time'
                  },
                  {
                      operand: [
                          2.1166666,
                          9.3
                      ],
                      operator: '[in[',
                      property: 'time'
                  },
                  {
                      operand: [
                          2.1166666,
                          8.883333
                      ],
                      operator: '[in[',
                      property: 'time'
                  },
                  {
                      operand: [
                          3.5333333,
                          8.883333
                      ],
                      operator: '[in[',
                      property: 'time'
                  }
              ],
              nb_samples: 442,
              decision_path: '0-0-0-0-1',
              distribution: [
                  0.85067874,
                  0.14932127
              ]
          }
        }
      }
    */
  })
```

### Bulk

The craft ai API includes a bulk route which provides a programmatic option to perform multiple operations at once.

> :warning: the bulk API comes on top of the basic routes described above, and requires an understanding of what they do. For more information, please refer to the basic routes that do the same operations one at a time.



#### Bulk - Create agents

To create several agents at once, use the method `createAgentBulk` as the following:

```js
const agent_ID_1 = 'my_first_agent';
const agent_ID_2 = 'my_second_agent';

const configuration_1 = {
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
  };
const configuration_2 = { /* ... */ };

const createBulkPayload = [
  {id: agent_ID_1, configuration: configuration_1},
  {id: agent_ID_2, configuration: configuration_2}
];

client.createAgentBulk(createBulkPayload)
  .then(function(agents) {
    console.log(agents);
  })
  .catch(function(error) {
    console.error('Error!', error);
  })
```

The variable `agents` is an **array of responses**. If an agent has been successfully created, the corresponding response is an object similar to the classic `createAgent()` response. When there are **mixed results**, `agents` should looks like:

```js
[
  { id: 'my_first_agent',   // creation failed
    status: 400,
    error: 'errorId',
    message: 'error-message' },
  { configuration:          // creation succeed
    { time_quantum: 100,
      learning_period: 1500000,
      context: [Object],
      output: [Object] },
    id: 'my_second_agent',
    _version: '2.0.0' }
]
```

#### Bulk - Delete agents

```js
const agent_ID_1 = 'my_first_agent';
const agent_ID_2 = 'my_second_agent';

const deleteBulkPayload = [
  { id: agent_ID_1 },
  { id: agent_ID_2 }
];

client.deleteAgentBulk(deleteBulkPayload)
.then(function(deletedAgents) {
  console.log(agents);
})
.catch(function(error) {
  console.error('Error!', error);
});
```
The variable `deletedAgents` is an **array of responses**. If an agent has been successfully deleted, the corresponding response is an object similar to the classic `deleteAgent()` response. When there are **mixed results**, `deletedAgents` should looks like:

```js
[
  { id: 'my_first_agent',       // deletion succeed
    configuration:
     { time_quantum: 100,
       learning_period: 1500000,
       context: [Object],
       output: [Object] },
    creationDate: 1557492944277,
    lastContextUpdate: 1557492944277,
    lastTreeUpdate: 1557492944277,
    _version: '2.0.0' },
  { id: 'my_unknown_agent' },   // deletion succeed
  { id: 'my_second_agent',      // deletion failed
    status: 400,
    error: 'errorId',
    message: 'error-message' }
]
```

#### Bulk - Add context operations

```js
const agent_ID_1 = 'my_first_agent';
const agent_ID_2 = 'my_second_agent';

const operations_agent_1 = [{
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
          timezone: '+02:00',
          peopleCount: 1,
          lightbulbState: 'ON'
        }
      },
      {
        timestamp: 1469416500,
        context: {
          timezone: '+02:00',
          peopleCount: 2,
          lightbulbState: 'ON'
        }
      },
      {
        timestamp: 1469417460,
        context: {
          timezone: '+02:00',
          peopleCount: 2,
          lightbulbState: 'OFF'
        }
      }];
const operations_agent_2 = [ /* ... */ ];

const contextOperationBulkPayload = [
  { id: agent_ID_1, operations: operations_agent_1},
  { id: agent_ID_2, operations: operations_agent_2}
];

client.addAgentContextOperationsBulk(contextOperationBulkPayload)
.then(function(agents) {
  console.log(agents);
})
.catch(function(error) {
  console.error('Error!', error);
});
```

The variable `agents` is an **array of responses**. If an agent has successfully received operations, the corresponding response is an object similar to the classic `addAgentContextOperations()` response. When there are **mixed results**, `agents` should looks like:

```js
[
  { id: 'my_first_agent',     // add operations failed
    status: 500,
    error: 'errorId',
    message: 'error-message' },
  { id: 'my_second_agent',      // add operations succeed
    status: 201,
    message: 'Successfully added XX operation(s) to the agent "{owner}/{project}/my_second_agent" context.',
    nbOperationsAdded: XX }
]
```

#### Bulk - Compute decision trees for agents

```js
const agent_ID_1 = 'my_first_agent';
const agent_ID_2 = 'my_second_agent';

const decisionTreePayload =  [
  { id: agent_ID_1 },
  { id: agent_ID_2 }
];

client.getAgentDecisionTreeBulk(decisionTreePayload)
.then(function(trees) {
  console.log(trees);
})
.catch(function(error) {
  console.error('Error!', error);
});
```

The variable `trees` is an **array of responses**. If an agent's model has successfully been created, the corresponding response is an object similar to the classic `getAgentDecisionTree()` response. When there are **mixed results**, `trees` should looks like:

```js
[
  { id: 'my_first_agent',       // computation failed
    (...)
    status: 400,
    error: 'errorId',
    message: 'error-message' },
  { id: 'my_second_agent',        // computation succeed
    timestamp: 1464601500,
    tree: { _version: '1.1.0', trees: [Object], configuration: [Object] } }
]
```

#### Bulk - Compute boosting decisions for agents

```js
const requestPayload = [
  {
    entityName: 'my_first_agent',
    timeWindow: [1469415600, 1679415800],
    context: {
      peopleCount: 19,
      timeOfDay: 7.5,
      timezone: '+02:00'
    }
  },
  {
    entityName: 'my_first_agent',
    timeWindow: [1469415600, 1679415800],
    context: {
      peopleCount: 21,
      timeOfDay: 5,
      timezone: '+02:00'
    }
  },
  {
    entityName: 'my_second_agent',
    timeWindow: [1469415600, 1679415800],
    context: {
      peopleCount: 33,
      timeOfDay: 8,
      timezone: '+01:00'
    }
  }
];

client.computeAgentBoostingDecisionBulk(requestPayload)
  .then(function(boostingResults) {
    console.log(boostingResults);
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

What is in `boostingResults` is:

```js
[
  {
    entityName: 'my_first_agent',
    context: {
      peopleCount: 19,
      timeOfDay: 7.5,
      timezone: '+02:00'
    },
    timeWindow: [1469415600, 1679415800],
    output: {
      predicted_value: 'ON'
    }
  },
  {
    entityName: 'my_first_agent',
    context: {
      peopleCount: 21,
      timeOfDay: 5,
      timezone: '+02:00'
    },
    timeWindow: [1469415600, 1679415800],
    output: {
      predicted_value: 'OFF'
    }
  },
  {
    entityName: 'my_second_agent',
    context: {
      peopleCount: 33,
      timeOfDay: 8,
      timezone: '+01:00'
    },
    timeWindow: [1469415600, 1679415800],
    output: {
      predicted_value: 'ON'
    }
  }
]
```

#### Bulk - Create generators

```js
const configuration = {
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
  model_type: 'decisionTree',
  output: ['lightbulbState'],
  operations_as_events: true,
  learning_period: 1500000,
  max_training_samples: 55000,
  filter: [ 'my_agent_name' , 'my_other_agent_name' ]
};
const payload = [
  { id: 'my_first_generator_name', configuration },
  { id: 'my_second_generator_name', configuration }
];

client.createGeneratorBulk(payload)
  .then(function(results) {
    console.log(results);
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

What is in `results` is:

```js
[
  {
    id: 'my_first_generator_name',
    configuration: {
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
      output: ['lightbulbState'],
      operations_as_events: true,
      learning_period: 1500000,
      max_training_samples: 55000,
      filter: [ 'my_agent_name' , 'my_other_agent_name' ]
    }
  },
  {
    id: 'my_second_generator_name',
    configuration: {
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
      output: ['lightbulbState'],
      operations_as_events: true,
      learning_period: 1500000,
      max_training_samples: 55000,
      filter: [ 'my_agent_name' , 'my_other_agent_name' ]
    }
  }
]
```

#### Bulk - Delete generators

```js
client.deleteGeneratorBulk(['my_first_generator_name', 'my_second_generator_name'])
  .then(function(results) {
    console.log(results);
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

Deleted generators are returned. What is in `results` is:

```js
[
  {
    id: 'my_first_generator_name',
    configuration: {
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
      output: ['lightbulbState'],
      filter: [ 'my_agent_name' , 'my_other_agent_name' ]
    }
  },
  {
    id: 'my_second_generator_name',
    configuration: {
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
      output: ['lightbulbState'],
      filter: [ 'my_agent_name' , 'my_other_agent_name' ]
    }
  }
]
```

#### Bulk - Compute decision trees for generators

```js
const payload = [
  { id: 'a_generator_name', timestamp: 1464600500 },
  { id: 'another_generator_name', timestamp: 1564600900 }
];

client.getGeneratorDecisionTreeBulk(payload)
  .then(function(trees) {
    console.log(trees);
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

What is in `results` is for example:

```js
[
  {
    id: 'a_generator_name',
    timestamp: 1464600500,
    tree: {
      _version: '2.0.0',
      trees: {
        light: {
        children: [
          {
            predicted_value: 'OFF',
            confidence: 0.9966583847999572,
            decision_rule: {
              operand: [
                7.25,
                22.65
              ],
              operator: '[in[',
              property: 'time'
            }
          },
          {
            children: [
              {
                predicted_value: 'ON',
                  confidence: 0.9618390202522278,
                  decision_rule: {
                    operand: [
                      22.65,
                      0.06666667
                    ],
                    operator: '[in[',
                    property: 'time'
                  }
              },
              {
                predicted_value: 'OFF',
                confidence: 0.92118390202522278,
                decision_rule: {
                  operand: [
                    0.06666667,
                    7.25
                  ],
                  operator: '[in[',
                  property: 'time'
                }
              }
            ],
            decision_rule: {
              operand: [
                22.65,
                7.25
              ],
              operator: '[in[',
              property: 'time'
            }
          }
        ]
      }
    },
    configuration: {
      operations_as_events: true,
      learning_period: 1500000,
      max_training_samples: 15000,
      context: {
        light: {
          type: 'enum'
        },
        tz: {
          type: 'timezone'
        },
        movement: {
          type: 'continuous'
        },
        time: {
          type: 'time_of_day',
          is_generated: true
        }
      },
      output: [
        'light'
      ],
      filter: [
        'smarthome'
      ]
    }
  },
  {
    id: 'another_generator_name',
    timestamp: 1564600900,
    tree: {
      _version: '2.0.0',
      trees: {
        light: {
        children: [
          {
            predicted_value: 'OFF',
            confidence: 0.9966583847999572,
            decision_rule: {
              operand: [
                7.25,
                22.65
              ],
              operator: '[in[',
              property: 'time'
            }
          },
          {
            children: [
              {
                predicted_value: 'ON',
                  confidence: 0.9618390202522278,
                  decision_rule: {
                    operand: [
                      22.65,
                      0.06666667
                    ],
                    operator: '[in[',
                    property: 'time'
                  }
              },
              {
                predicted_value: 'OFF',
                confidence: 0.92118390202522278,
                decision_rule: {
                  operand: [
                    0.06666667,
                    7.25
                  ],
                  operator: '[in[',
                  property: 'time'
                }
              }
            ],
            decision_rule: {
              operand: [
                22.65,
                7.25
              ],
              operator: '[in[',
              property: 'time'
            }
          }
        ]
      }
    },
    configuration: {
      operations_as_events: true,
      learning_period: 1500000,
      max_training_samples: 15000,
      context: {
        light: {
          type: 'enum'
        },
        tz: {
          type: 'timezone'
        },
        movement: {
          type: 'continuous'
        },
        time: {
          type: 'time_of_day',
          is_generated: true
        }
      },
      output: [
        'light'
      ],
      filter: [
        'smarthome'
      ]
    }
  }
]
```

#### Bulk - Compute boosting decisions for generators

```js
const requestPayload = [
  {
    entityName: 'my_first_agent',
    timeWindow: [1469415600, 1679415800],
    context: {
      peopleCount: 19,
      timeOfDay: 7.5,
      timezone: '+02:00'
    }
  },
  {
    entityName: 'my_first_agent',
    timeWindow: [1469415600, 1679415800],
    context: {
      peopleCount: 21,
      timeOfDay: 5,
      timezone: '+02:00'
    }
  },
  {
    entityName: 'my_second_agent',
    timeWindow: [1469415600, 1679415800],
    context: {
      peopleCount: 33,
      timeOfDay: 8,
      timezone: '+01:00'
    }
  }
];

client.computeGeneratorBoostingDecisionBulk(requestPayload)
  .then(function(boostingResults) {
    console.log(boostingResults);
  })
  .catch(function(error) {
    console.error('Error!', error);
  });
```

What is in `boostingResults` is:

```js
[
  {
    entityName: 'my_first_agent',
    context: {
      peopleCount: 19,
      timeOfDay: 7.5,
      timezone: '+02:00'
    },
    timeWindow: [1469415600, 1679415800],
    output: {
      predicted_value: 'ON'
    }
  },
  {
    entityName: 'my_first_agent',
    context: {
      peopleCount: 21,
      timeOfDay: 5,
      timezone: '+02:00'
    },
    timeWindow: [1469415600, 1679415800],
    output: {
      predicted_value: 'OFF'
    }
  },
  {
    entityName: 'my_second_agent',
    context: {
      peopleCount: 33,
      timeOfDay: 8,
      timezone: '+01:00'
    },
    timeWindow: [1469415600, 1679415800],
    output: {
      predicted_value: 'ON'
    }
  }
]
```

### Advanced client configuration ###

The simple configuration to create the `client` is just the token. For special needs, additional advanced configuration can be provided.

#### Amount of operations sent in one chunk ####

`client.addAgentContextOperations` splits the provided operations into chunks in order to limit the size of the http requests to the craft ai API. In the client configuration, `operationsChunksSize` can be increased in order to limit the number of request, or decreased when large http requests cause errors.

```js
const client = craftai({
  // Mandatory, the token
  token: '{token}',
  // Optional, default value is 500
  operationsChunksSize: {max_number_of_operations_sent_at_once}
});
```

#### Timeout duration for decision trees retrieval ####

It is possible to increase or decrease the timeout duration of `client.getAgentDecisionTree`, for exemple to account for especially long computations.

```js
const client = craftai({
  // Mandatory, the token
  token: '{token}',
  // Optional, default value is 5 minutes (300000)
  decisionTreeRetrievalTimeout: {timeout_duration_for_decision_trees_retrieval}
});
```

#### Proxy ####

> :information_source: This setting can only be set in Node.js environements. In a browser environement the settings of the browser will be used automatically.

It is possible to provide proxy configuration in the `proxy` property of the client configuration. It will be used to call the craft ai API (through HTTPS). The expected format is a host name or IP and port, optionally preceded by credentials such as `http://user:pass@10.10.1.10:1080`.

```js
const client = craftai({
  // Mandatory, the token
  token: '{token}',
  // Optional, no default value
  proxy: 'http://{user}:{password}@{host_or_ip}:{port}'
});
```

### Score

The following functions let you compute model scores.

> :warning: At the moment, this is only available as bulk functions, for generators set to generate [decision trees](#decision-tree).

#### Score - Sliding window

`client.getSlidingWindowScoresBulk(body)`.
##### Body #####

The body should be an array of objects containing the following keys:

- **id** `string` (required)

  The identifier of the generator whose model is evaluated.

- **test_from** `number`

  The beginning timestamp of the first test window (inclusive). 3 parameters among `test_from`, `test_to`, `step_size` and `nb_steps` must be defined.

- **test_to** `number`

  The end timestamp of the last test window (inclusive). 3 parameters among `test_from`, `test_to`, `step_size` and `nb_steps` must be defined.

- **step_size** `number`

  The timestamp difference between the beginning of a test window and the next. 3 parameters among `test_from`, `test_to`, `step` and `nb_steps` must be defined.

- **nb_steps** `number`

  The number of test windows. 3 parameters among `test_from`, `test_to`, `step_size` and `nb_steps` must be defined.

- **test_size** `number`

  The actual size of the test set from the beginning of a test window. If the size of a window (`step_size`) is larger than this, only the beginning of a window will be used to compute scores. If the size of a window is smaller than this, data in a window can be used in several score computations.

- **gap_size** `number`

  The timestamp difference between the end of a training window (data used in the model) and the beginning of a test window. The end of the training window is defined by the formula **`testWindowStart - gap_size - 1`**. By default `gap_size` is 0, in which case the test set starts directly after the end of the training set, i.e. the end of the training set is just before the beginning of the test window. A negative gap means that there is an overlap between the training and test data.

- **metrics** `array`

  Array of objects containing a `name` property with the name of a valid metric. The metrics are used to evaluate the ML model. For classification models, the available metrics are *accuracy* and *f1*; for regression models, *r2*, *mae* and *rmse*. By default all available metrics are computed.

```http
+ training data
* test data
                   gap_size test_size
                      <-><------------>
window 1  .+++++++++++...**************...................................
                         |
              window 1 start (test_from)
                         <--------->
                          step_size
window 2  ............+++++++++++...**************........................
                                    |
                             window 2 start
                                    <--------->
                                     step_size
window 3  .......................+++++++++++...**************.............
                                               |
                                         window 3 start
```
**Example:**
```js
  const slidingWindowScoresRequestPayload = [
    {
      id: 'generator1',
      test_from: 1461132001,
      test_to: 1462106220,
      step_size: 500000,
      metrics: [{ name: 'accuracy' }, { name: 'f1' }]
    },
    {
      id: 'generator2',
      test_from: 1477000801,
      test_to: 1485385200,
      step_size: 5000000,
      metrics: [{ name: 'r2' }, { name: 'mae' }, { name: 'rmse' }]
    }
  ];

  client.getSlidingWindowScoresBulk(slidingWindowScoresRequestPayload)
    .then((response) => {
      console.log(response);
      /* Outputted response is the following
        [
          {
            "id": "generator1",
            "scores": [
              {
                "from": 1461132001,
                "to": 1461632000,
                "modelTimestamp": 1461132000,
                "nbSamples": 15,
                "type": "classification",
                "accuracy": 0.467,
                "f1": {
                  "class_OPEN": {
                    "nbSamples": 7,
                    "score": 0.636
                  }
                },
                "f1_weighted": 0.297
              },
              {
                "from": 1461632001,
                "to": 1462106220,
                "modelTimestamp": 1461632000,
                "nbSamples": 14,
                "type": "classification",
                "accuracy": 0.786,
                "f1": {
                  "class_CLOSED": {
                    "nbSamples": 7,
                    "score": 0.8
                  },
                  "class_OPEN": {
                    "nbSamples": 7,
                    "score": 0.769
                  }
                },
                "f1_weighted": 0.785
              }
            ]
          },
          {
            "id": "generator2",
            "scores": [
              {
                "from": 1477000801,
                "to": 1482000800,
                "modelTimestamp": 1477000800,
                "nbSamples": 57,
                "type": "regression",
                "r2": -0.864,
                "mae": 2.186,
                "rmse": 2.489
              },
              {
                "from": 1482000801,
                "to": 1485385200,
                "modelTimestamp": 1482000800,
                "nbSamples": 39,
                "type": "regression",
                "r2": 0.52,
                "mae": 0.95,
                "rmse": 1.164
              }
            ]
          }
        ]
      */
    })
    .catch(function(error) {
      if (error instanceof craftai.errors.CraftAiLongRequestTimeOutError) {
       // Handle timeout errors here
     }
      else {
        // Handle other errors here
      }
    });
```

#### Score - Single window

`client.getSingleWindowScoreBulk(body)`
##### Body #####

The body should be an array of objects containing the following keys:

- **id** `string` (required)

  The identifier of the generator whose model is evaluated.

- **test_from** `number` (required)

  The beginning timestamp of the test window (inclusive).

- **test_to** `number` (required)

  The end timestamp of the test window (inclusive).

- **model_timestamp** `number`

  The last timestamp of the training data.

- **metrics** `array`

  Array of objects containing a `name` property with the name of a valid metric. The metrics are used to evaluate the ML model. For classification models, the available metrics are *accuracy* and *f1*; for regression models, *r2*, *mae* and *rmse*. By default all available metrics are computed.

```http
+ training data
* test data
            model_timestamp    test_from            test_to
window  ++++++++++++|..............|*******************|..................
```
**Example:**
```js
  const singleWindowScoreRequestPayload = [
    {
      id: 'generator1',
      test_from: 1461132001,
      test_to: 1461632000,
      model_timestamp: 1461132000,
      metrics: [{ name: 'accuracy' }, { name: 'f1' }]
    },
    {
      id: 'generator2',
      test_from: 1477000801,
      test_to: 1485385200,
      model_timestamp: 1477000800,
      metrics: [{ name: 'r2' }, { name: 'mae' }, { name: 'rmse' }]
    }
  ];

  client.getSingleWindowScoreBulk(singleWindowScoreRequestPayload)
    .then((response) => {
      console.log(response);
      /* Outputted response is the following
        [
          {
            "id": "myGeneratorClassificationValidation1",
            "score": {
              "from": 1461132001,
              "to": 1461632000,
              "modelTimestamp": 1461132000,
              "nbSamples": 15,
              "type": "classification",
              "accuracy": 0.467,
              "f1": {
                "class_OPEN": {
                  "nbSamples": 7,
                  "score": 0.636
                }
              },
              "f1_weighted": 0.297
            }
          },
          {
            "id": "myGeneratorRegressionValidation",
            "score": {
              "from": 1477000801,
              "to": 1485385200,
              "modelTimestamp": 1477000800,
              "nbSamples": 96,
              "type": "regression",
              "r2": -0.761,
              "mae": 2.06,
              "rmse": 2.356
            }
          }
        ]
      */
    })
    .catch(function(error) {
      if (error instanceof craftai.errors.CraftAiLongRequestTimeOutError) {
       // Handle timeout errors here
     }
      else {
        // Handle other errors here
      }
    });
```
## Interpreter ##

The decision tree interpreter can be used offline from decisions tree computed through the API.

### Make decision ###

```js
// `tree` is the decision tree as retrieved through the craft ai REST API
const tree = { ... };
// Compute the decision with specifying every context field
const decision = craftai.interpreter.decide(
  tree,
  {
    timezone: '+02:00',
    timeOfDay: 7.5,
    peopleCount: 3
  });

// Or Compute the decision on a context created from the given one and filling the
// `day_of_week`, `time_of_day` and `timezone` properties from the given `Time`
const decision = craftai.interpreter.decide(
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
  context: { // In which context the decision was made
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
      ],
      nb_samples: 25,
      distribution: [0.05, 0.95],
      decision_path: '0-1-1'
    }
  }
}
```

A `decision` for a numerical output type would look like:

```js
  output: {
    lightbulbState: {
      predicted_value: 'OFF',
      confidence: ...,
      distribution: [ ... ],
      nb_samples: 25,
      decision_rules: [ ... ],
      decision_path: ...
    }
  }
```

A `decision` for a categorical output type would look like:

```js
  output: {
    lightbulbIntensity: {
      predicted_value: 10.5,
      standard_deviation: 1.25,
      confidence: ...,
      min: 8.0,
      max: 11,
      nb_samples: 25,
      decision_rules: [ ... ],
      decision_path: ...
  }
```


A `decision` in a case where the tree cannot make a prediction:

```js
  decision: {
    lightbulbState: {
      predicted_value: null, // No decision
      distribution : [ ... ], // Distribution of the output classes normalized by the number of samples in the reached node.
      confidence: 0, // Zero confidence if the decision is null
      nb_samples: 25,
      decision_rules: [ ... ],
      decision_path: ...
    }
  },
```

### Make multiple decisions ###

From the tree previously retrieved, ask for multiple decisions.
The decideFromContextArray allows to pass craftai `Time` along with context, in this case generated features will be automatically generated.

```js
// `tree` is the decision tree as retrieved through the craft ai REST API
const tree = { ... };
// Pass an array containing each context on which you want to make a decision
const decisions = craftai.interpreter.decideFromContextsArray(tree, [
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
  },
  [
    {
      peopleCount: 0
    },
    new craftai.Time('2010-01-01T07:30:30Z')
    // This is equivalent to {
    //  timezone: 'UTC',
    //  peopleCount: 0,
    //  timeOfDay: 4.5
    //}
  ]
])
```

Results for `craftai.interpreter.decideFromContextsArray` would look like:

```js
[
  {
    context: { // In which context the decision was made
      timezone: '+02:00',
      timeOfDay: 7.5,
      peopleCount: 3
    },
    output: { // The decision itself
      lightbulbState: {
        predicted_value: 'ON',
        distribution: [0.0, 1.0],
        nb_samples: 20,
        confidence: 0.9937745256361138, // The confidence in the decision
        decision_path: '0-1-1',
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
        distribution: [0.0, 1.0],
        nb_samples: 20,
        confidence: 0.9937745256361138,
        decision_path: '0-1-1',
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
        distribution: [0.95, 0.05],
        nb_samples: 12,
        confidence: 0.9545537233352661,
        decision_path: '0-0-0',
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

### Reduce decision rules ###

From a list of decision rules, as retrieved when making a decision with a decision tree, compute an equivalent & minimal list of rules.

```js
// `decision` is the decision tree as retrieved from taking a decision
const decision = craftai.interpreter.decide( ... );

// `decisionRules` is the decision rules that led to decision for the `lightBulbState` value
const decisionRules = decision.output.lightBulbState.decision_rules;

// `minimalDecisionRules` has the mininum list of rules strictly equivalent to `decisionRules`
const minimalDecisionRules = craftai.interpreter.reduceDecisionRules(decisionRules)
```

### Format decision rules ###

From a list of decision rules, compute a _human readable_ version of these rules, in english.

```js
// `decision` is the decision tree as retrieved from taking a decision
const decision = craftai.interpreter.decide( ... );

// `decisionRules` is the decision rules that led to decision for the `lightBulbState` value
const decisionRules = decision.output.lightBulbState.decision_rules;

// `decisionRulesStr` is a human readable string representation of the rules.
const decisionRulesStr = craftai.interpreter.formatDecisionRules(decisionRules);
```

### Get decision rules properties ###

Retrieve the context properties that matters to a previously computed tree.

```js
// `tree` is the decision tree as retrieved through the craft ai REST API
const tree = { ... };

const decisionRules = craftai.interpreter.getDecisionRulesProperties(tree)
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

## Logging ##

The **craft ai** client is using [visionmedia/debug](https://www.npmjs.com/package/debug) under the namespace `'craft-ai:client:*'`, please refer to their documentation for further information.
