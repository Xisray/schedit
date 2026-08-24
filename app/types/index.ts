export type Id = number & {
  readonly __brand: "Id"
}

interface Entity {
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
