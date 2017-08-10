interface Versionable {
  _version?: string
}

export namespace Feature {
  interface Feature<T> {
    type: T
    is_generated?: boolean
  }

  interface GeneratedFeature<T> extends Feature<T> {
    is_generated?: true
  }

  type Enum<T extends string> = [Feature<'enum'>, T]
  type Continuous = [Feature<'continuous'>, number]
  type Timezone = [Feature<'timezone'>, string]
  type DayOfMonth = [GeneratedFeature<'day_of_month'>, number]
  type DayOfWeek = [GeneratedFeature<'day_of_week'>, number]
  type MonthOfYear = [GeneratedFeature<'month_of_year'>, number]
  type TimeOfDay = [GeneratedFeature<'time_of_day'>, number]
  type Cyclic = DayOfMonth | DayOfWeek | MonthOfYear | TimeOfDay
  type Generated = DayOfMonth | DayOfWeek | MonthOfYear | TimeOfDay
  type Any = Cyclic | Enum<string> | Continuous | Timezone
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

export interface Features {
  [key: string]: Feature.Any
}

export type Context<F extends Features> = {
  [K in keyof F]: F[K][1]
}

export interface ContextOperation<F extends Features> {
  timestamp: number
  context: Partial<Context<F>>
}

export interface Configuration<F extends Features> extends Versionable {
  context: {
    [K in keyof F]: F[K][0]
  }
  output: (keyof F)[]
  time_quantum?: number
  learning_period?: number
  operations_as_events?: boolean
  tree_max_operations?: number
  tree_max_depth?: number
}

export interface Agent<F extends Features> extends Versionable {
  id: string
  configuration: Configuration<F>
  firstTimestamp: number
  lastTimestamp: number
  creationDate: number
  lastTreeUpdate: number
  lastContextUpdate: number
}

export interface DecisionTree<F extends Features> extends Versionable {
  configuration: Configuration<F>
  timestamp?: number
  trees?: {
    [output: string]: DecisionTreeLeaf | DecisionTreeNode
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

export interface Decision<F extends Features> extends Versionable {
  context: Context<F>
  output: {
    [feature: string]: {
      predicted_value?: string | number
      confidence?: number
      standard_deviation?: number
      decision_rules: DecisionRule.Any[]
      error?: {
        name: 'CraftAiNullDecisionError' | 'CraftAiUnknownError'
        message: string
        metadata: { [key: string]: any }
      }
    }
  }
}

export interface Client {
  cfg: {
    token: string
    operationsChunksSize: number
    operationsAdditionWait: number
  },
  addAgentContextOperations<F extends Features> (agentId: string, contextOperations: ContextOperation<F>[]): Promise<Agent<F>>
  computeAgentDecision<F extends Features> (agentId: string, treeTimestamp: number, ...TimeOrContextOperation: (Partial<Context<F>> | Time)[]): Decision<F>
  createAgent<F extends Features> (configuration: Configuration<F>, agentId?: string): Promise<Agent<F>>
  deleteAgent<F extends Features> (agentId: string): Promise<Agent<F>>
  deleteSharedAgentInspectorUrl (agentId: string): Promise<true>
  getAgent<F extends Features> (agentId: string): Promise<Agent<F>>
  getAgentContext<F extends Features> (agentId: string, timestamp?: number): Promise<ContextOperation<F>>
  getAgentContextOperations<F extends Features> (agentId: string): Promise<ContextOperation<F>[]>
  getAgentDecisionTree<F extends Features> (agentId: string, timestamp?: number): Promise<DecisionTree<F>>
  getSharedAgentInspectorUrl (agentId: string, timestamp?: number): Promise<string>
  listAgents (): Promise<string[]>

  // Deperecated methods:
  destroyAgent<F extends Features> (agentId: string): Promise<Agent<F>>
  getAgentInspectorUrl (agentId: string, timestamp?: number): Promise<string>
}

export interface Time {
  timestamp: number,
  timezone: string,
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

export function Time (date: any): Time
export function decide<F extends Features> (tree: DecisionTree<F>, context: Context<F>): Decision<F>
export function decide<F extends Features> (tree: DecisionTree<F>, ...TimeOrContextOperation: (Partial<Context<F>> | Time)[]): Decision<F>
export function createClient (configuration: ClientConfiguration): Client

export default createClient
