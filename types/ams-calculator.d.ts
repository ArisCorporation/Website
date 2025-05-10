export type Crew = {
  id: string
  name: string
  ship: string
}

export type Worker = {
  id: string
  name: string
  crew: string
  external: boolean
  manager: boolean
}

export type Distribution = {
  id: string
  worker: string
  expenses: number
  share: number
  percentage: number
}