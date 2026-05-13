import type { Department } from './api'

export const MISSION_PLANNER_POSITION_TYPE_ORDER = [
  'primary',
  'secondary',
] as const

export type MissionPlannerPositionType =
  (typeof MISSION_PLANNER_POSITION_TYPE_ORDER)[number]

export interface MissionPlannerForm {
  title: string
  mission_type: string
  status: string
  description: string
  duration_hours: string
  location: string
  start_location: string
}

export interface MissionPlannerPositionDraft {
  id?: string
  sort?: number | null
  position_type: MissionPlannerPositionType
  role: string
  role_description?: string | null
  assigned_user: any | null
  status: string
}

export interface MissionPlannerShipDraft {
  id?: string
  hangar_id: any | null
  positions: MissionPlannerPositionDraft[]
}

export interface MissionPlannerTeamDraft {
  id?: string
  name: string
  description: string
  department: Department | string | null
  ships: MissionPlannerShipDraft[]
}
