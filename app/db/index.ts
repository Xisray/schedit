import { Dexie, type EntityTable } from "dexie"
import type {
  Room,
  SchoolGroup,
  Teacher,
  TeacherHours,
  PrimaryKeyName,
} from "../types"
import { addFieldCheckConstraint, setupRelationConstraints } from "./hooks"

const db = new Dexie("school") as Dexie & {
  rooms: EntityTable<Room, PrimaryKeyName>
  groups: EntityTable<SchoolGroup, PrimaryKeyName>
  teachers: EntityTable<Teacher, PrimaryKeyName>
  hours: EntityTable<TeacherHours, PrimaryKeyName>
}

db.version(1).stores({
  rooms: "++id, &name, capacity",
  groups: "++id, &[grade+letter], grade, letter, roomId",
  teachers: "++id, &name, roomId, &groupId",
  hours: "++id, &[teacherId+groupId], teacherId, groupId, hours",
})

addFieldCheckConstraint(
  db.rooms,
  "capacity",
  (value) => value >= 0,
  "Вместимость должна быть положительна или равна нулю"
)

addFieldCheckConstraint(
  db.rooms,
  "name",
  (value) => value.trim().length > 0,
  "Кабинет не может быть пустым"
)

addFieldCheckConstraint(
  db.groups,
  "grade",
  (value) => value > 0 && value < 12,
  "Класс может быть от 1 до 11"
)

addFieldCheckConstraint(
  db.groups,
  "letter",
  (value) => value.trim().length === 0,
  "У класса может быть только одна буква"
)

addFieldCheckConstraint(
  db.teachers,
  "name",
  (value) => value.trim().length > 0,
  "Имя учителя не может быть пустым"
)

addFieldCheckConstraint(
  db.hours,
  "hours",
  (value) => value >= 0,
  "Часы должны быть положительными"
)

setupRelationConstraints(db, {
  rooms: {
    setNull: [
      {
        table: "groups",
        field: "roomId",
      },
      {
        table: "teachers",
        field: "roomId",
      },
    ],
  },
  groups: {
    setNull: [
      {
        table: "teachers",
        field: "groupId",
      },
    ],
    cascade: [
      {
        table: "hours",
        field: "groupId",
      },
    ],
  },
  teachers: {
    cascade: [
      {
        table: "hours",
        field: "teacherId",
      },
    ],
  },
})

export { db }
