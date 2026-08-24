import type { InsertType, UpdateSpec } from "dexie"

export type Id = number & {
  readonly __brand: "Id"
}

export interface Entity {
  id: Id
}

export type PrimaryKeyName = keyof Entity

export interface Room extends Entity {
  name: string
  capacity: number
}

export interface SchoolGroup extends Entity {
  grade: number
  letter: string
  roomId: Id | null
}

export interface DayConfig extends Entity {
  groupId: Id
  dayId: number
  firstLesson: number
  minLessons: number
  maxLessons: number
  roomId: Id | null
}

export interface Teacher extends Entity {
  name: string
  roomId: Id | null
  groupId: Id | null
}

export interface TeacherHours extends Entity {
  teacherId: Id
  groupId: Id
  hours: number
}

export type CreateEntity<TEntity> = Omit<TEntity, PrimaryKeyName>
export type PatchEntity<TEntity> = Partial<CreateEntity<TEntity>>
export type CreateDayConfig = Omit<CreateEntity<DayConfig>, "groupId">
export type CreateTeacherHours = Omit<CreateEntity<TeacherHours>, "teacherId">
