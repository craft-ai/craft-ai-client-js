interface Versionable {
  _version?: string
}

export namespace Property {
  interface Property<T> {
    type: T
    is_generated?: boolean
  }

  interface GeneratedProperty<T> extends Property<T> {
    is_generated?: true
  }

  type Enum<T extends string> = [Property<'enum'>, T]
  type Continuous = [Property<'continuous'>, number]
  type Timezone = [Property<'timezone'>, string]
  type DayOfMonth = [GeneratedProperty<'day_of_month'>, number]
  type DayOfWeek = [GeneratedProperty<'day_of_week'>, number]
  type MonthOfYear = [GeneratedProperty<'month_of_year'>, number]
  type TimeOfDay = [GeneratedProperty<'time_of_day'>, number]
  type Cyclic = DayOfMonth | DayOfWeek | MonthOfYear | TimeOfDay
  type Generated = DayOfMonth | DayOfWeek | MonthOfYear | TimeOfDay
  type Any = Cyclic | Enum<string> | Continuous | Timezone

  type NamedProperty = Any & { property: string }
}

export namespace DecisionRule {
  interface Default {
    property: string
    operator: string
    operand: any
  }

  export interface Continuous extends Default {
    operator: '<' | '>='
    operand: number
  }

  export interface Enum extends Default {
    operator: 'is'
    operand: string
  }

  export interface Cyclic extends Default {
    operator: '[in['
    operand: [number, number]
  }

  export type Any = Continuous | Enum | Cyclic
}

export interface Properties {
  [key: string]: Property.Any
}

export type Context<P extends Properties> = {
  [K in keyof P]: P[K][1]
}

export interface ContextOperation<P extends Properties> {
  timestamp: number
  context: Partial<Context<P>>
}

export interface Configuration<P extends Properties> extends Versionable {
  context: {
    [K in keyof P]: P[K][0]
  }
  output: (keyof P)[]
  time_quantum?: number
  learning_period?: number
  operations_as_events?: boolean
  tree_max_operations?: number
  tree_max_depth?: number
}

export interface Agent<P extends Properties> extends Versionable {
  id: string
  configuration: Configuration<P>
  firstTimestamp: number
  lastTimestamp: number
  creationDate: number
  lastTreeUpdate: number
  lastContextUpdate: number
}

export interface DecisionTree<P extends Properties> extends Versionable {
  configuration: Configuration<P>
  timestamp?: number
  trees: {
    [K in keyof P]: DecisionTreeLeaf | (DecisionTreeLeaf | DecisionTreeNode)[]
  }
}

export interface DecisionTreeLeaf {
  predicted_value: string | number | null
  confidence: number
  standard_deviation: number
  decision_rule: DecisionRule.Any
}

export interface DecisionTreeNode {
  decision_rule: DecisionRule.Any
  children: (DecisionTreeLeaf | DecisionTreeNode)[]
}

export interface Decision<P extends Properties> extends Versionable {
  context: Context<P>
  output: {
    [K in keyof P]: {
      predicted_value?: string | number
      confidence?: number
      standard_deviation?: number
      decision_rules: DecisionRule.Any[]
    }
  }
}

export interface Client {
  cfg: {
    token: string
    operationsChunksSize: number
  }

  /**
   * Adds context operations to the given agent id.
   *
   * First context operation must define every property of the agent configuration.
   * @param agentId Id of the agent
   * @param contextOperations Context operation or array of context operations
   */
  addAgentContextOperations<P extends Properties> (agentId: string, contextOperations: ContextOperation<P> | ContextOperation<P>[]): Promise<Agent<P>>

  /**
   * Computes the decision for a given context with the decision tree of the provided agent id.
   *
   * The partial context operations are merged from left to right to forge a single context.
   * The properties of the right-most partial context operation overwrites the other.
   * `Time` instance is used to generate the time-related properties and considered as a partial context operation.
   * @param agentId Id of the agent
   * @param treeTimestamp Timestamp of the tree used to compute the decision
   * @param timeOrContextOperation A list of partial context operation or an instance of `Time`
   */
  computeAgentDecision<P extends Properties> (agentId: string, treeTimestamp: number, ...timeOrContextOperation: (Partial<Context<P>> | Time)[]): Decision<P>

  /**
   * Creates an agent in the current project.
   *
   * If the agent id is not provided, craft ai generates a random id.
   * @param configuration Configuration of the agent
   * @param agentId Id of the agent
   */
  createAgent<P extends Properties> (configuration: Configuration<P>, agentId?: string): Promise<Agent<P>>

  /**
   * Deletes the given agent id from the current project.
   *
   * @param agentId Id of the agent
   */
  deleteAgent<P extends Properties> (agentId: string): Promise<Agent<P>>

  /**
   * Deletes the public inspector URL for the given agent id.
   *
   * @param agentId Id of the agent
   */
  deleteSharedAgentInspectorUrl (agentId: string): Promise<void>

  /**
   * Retrieves the information about the given agent id.
   *
   * @param agentId Id of the agent
   */
  getAgent<P extends Properties> (agentId: string): Promise<Agent<P>>

  /**
   * Retrieves the full context of the given agent id.
   *
   * If the timestamp is not provided the last pushed context operation timestamp is used as default.
   * @param agentId Id of the agent
   * @param timestamp Timestamp of the full context to be retrieved
   */
  getAgentContext<P extends Properties> (agentId: string, timestamp?: number): Promise<ContextOperation<P>>

  /**
   * Retrieves every context operations pushed to the given agent id.
   *
   * @param agentId Id of the agent
   * @param start The timestamp lower bound of the desired contexts (included)
   * @param end The timestamp upper bound of the desired contexts (included)
   */
  getAgentContextOperations<P extends Properties> (agentId: string, start?: number, end?: number): Promise<ContextOperation<P>[]>

  /**
   * Retrieves every an agent's state history, at every `time_quantum`, between the given bounds.
   *
   * @param agentId Id of the agent
   * @param start The timestamp lower bound of the desired contexts (included)
   * @param end The timestamp upper bound of the desired contexts (included)
   */
  getAgentStateHistory<P extends Properties> (agentId: string, start?: number, end?: number): Promise<ContextOperation<P>[]>

  /**
   * Retrieves the decision tree of the given agent id.
   *
   * If the timestamp is not provided the last pushed context operation timestamp is used as default.
   * @param agentId Id of the agent
   * @param timestamp Timestamp of the tree to be retrieved
   */
  getAgentDecisionTree<P extends Properties> (agentId: string, timestamp?: number): Promise<DecisionTree<P>>

  /**
   * Retrieves the public inspector URL for the given agent id.
   *
   * If the timestamp is not provided the last pushed context operation timestamp is used as default.
   * @param agentId Id of the agent
   * @param timestamp Default timestamp used to display the decision tree in the public inspector
   */
  getSharedAgentInspectorUrl (agentId: string, timestamp?: number): Promise<string>

  /**
   * List all agents id from the current project
   */
  listAgents (): Promise<string[]>

  /**
   * @deprecated Replaced by `client.deleteAgent()`
   */
  destroyAgent<P extends Properties> (agentId: string): Promise<Agent<P>>

  /**
   * @deprecated Replaced by `client.getSharedAgentInspectorUrl()`
   */
  getAgentInspectorUrl (agentId: string, timestamp?: number): Promise<string>
}

export interface Time {
  timestamp: number
  timezone: string
  time_of_day: number
  day_of_month: number
  month_of_year: number
  day_of_week: number
  utc: string
}

export type ClientConfiguration = string | {
  token: string
  operationsChunksSize?: number
}

/**
 * Helper for time-related properties generation
 */
export function Time (date: any): Time

/**
 * Creates a client instance of craft ai.
 *
 * A client is bound to a project.
 * The configuration must include at least an access token to a craft ai project.
 * You can create a project and get an access token with your logged account on https://beta.craft.ai/projects.
 * @param configuration Configuration of the client
 */
export function createClient (configuration: ClientConfiguration): Client

/**
 * Decision tree interpreter functions.
 */
export declare const interpreter: {
  /**
   * Computes the decision for a given context with the provided decision tree.
   *
   * @param tree Decision tree retrieved from craft ai (see `client.getAgentDecisionTree()`)
   * @param context Full context
   */
  decide<P extends Properties> (tree: DecisionTree<P>, context: Context<P>): Decision<P>

  /**
   * Computes the decision for a given context with the provided decision tree.
   *
   * The partial context operations are merged from left to right to forge a single context.
   * The properties of the right-most partial context operation overwrites the other.
   * `Time` instance is used to generate the time-related properties and considered as a partial context operation.
   *
   * @param tree Decision tree retrieved from craft ai (see `client.getAgentDecisionTree()`)
   * @param timeOrContextOperation A list of partial context operation or an instance of `Time`
   */
  decide<P extends Properties> (tree: DecisionTree<P>, ...timeOrContextOperation: (Partial<Context<P>> | Time)[]): Decision<P>

  /**
   * Traverse the given tree to retrieve all the properties used in decision rules
   *
   * @param tree The decision tree.
   */
  getDecisionRulesProperties<P extends Properties> (tree: DecisionTree<P>): Property.NamedProperty[]
}

export default createClient
