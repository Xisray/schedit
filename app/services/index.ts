import type { EntityTable, IDType, InsertType, UpdateSpec } from "dexie"
import { db } from "~/db"
import type {
  CreateDayConfig,
  CreateEntity,
  CreateTeacherHours,
  DayConfig,
  PatchEntity,
  PrimaryKeyName,
  SchoolGroup,
  Teacher,
  TeacherHours,
} from "~/types"

type ServiceBase<TEntity, TKey extends keyof TEntity> = {
  remove: (id: IDType<TEntity, TKey>) => Promise<void>
  clear: () => Promise<void>
}

type Service<TEntity, TKey extends keyof TEntity> = ServiceBase<
  TEntity,
  TKey
> & {
  add: (entity: InsertType<TEntity, TKey>) => Promise<void>
  patch: (
    id: IDType<TEntity, TKey>,
    entity: UpdateSpec<InsertType<TEntity, TKey>>
  ) => Promise<void>
  bulkAdd: (entites: InsertType<TEntity, TKey>[]) => Promise<void>
  get: (id: IDType<TEntity, TKey>) => Promise<TEntity | null>
}

type GroupService = ServiceBase<SchoolGroup, PrimaryKeyName> & {
  add: (
    group: CreateEntity<SchoolGroup>,
    dayConfigs?: CreateDayConfig[]
  ) => Promise<void>
  patch: (
    id: IDType<SchoolGroup, PrimaryKeyName>,
    group: PatchEntity<SchoolGroup>,
    dayConfigs?: CreateDayConfig[]
  ) => Promise<void>
}

type TeacherService = ServiceBase<Teacher, PrimaryKeyName> & {
  add: (
    teacher: CreateEntity<Teacher>,
    hours?: CreateTeacherHours[]
  ) => Promise<void>
  patch: (
    id: IDType<Teacher, PrimaryKeyName>,
    teacher: PatchEntity<Teacher>,
    hours?: CreateTeacherHours[]
  ) => Promise<void>
}

function createService<TEntity, TKey extends keyof TEntity>(
  table: EntityTable<TEntity, TKey>
): Service<TEntity, TKey> {
  return {
    async add(entity) {
      await table.add(entity)
    },
    async patch(id, entity) {
      await table.update(id, entity)
    },
    async remove(id) {
      await table.delete(id)
    },
    async clear() {
      await table.clear()
    },
    async bulkAdd(entites) {
      await table.bulkAdd(entites)
    },
    async get(id) {
      return (await table.get(id)) ?? null
    },
  }
}

export const roomService = createService(db.rooms)
export const groupService: GroupService = {
  async add(group, dayConfigs = []) {
    await db.transaction("rw", [db.groups, db.dayConfigs], async () => {
      const groupId = await db.groups.add(group)

      if (dayConfigs.length > 0) {
        const dayConfigsWithForeignId = dayConfigs.map((h) => ({
          ...h,
          groupId: groupId,
        }))
        await db.dayConfigs.bulkAdd(dayConfigsWithForeignId)
      }
    })
  },
  async patch(id, group, dayConfigs) {
    await db.transaction("rw", [db.groups, db.dayConfigs], async () => {
      if (Object.keys(group).length > 0) {
        await db.groups.update(id, group)
      }

      if (dayConfigs) {
        await db.dayConfigs.where({ groupId: id }).delete()

        if (dayConfigs.length > 0) {
          const preparedDayConfigs = dayConfigs.map((h) => ({
            ...h,
            groupId: id,
          }))
          await db.dayConfigs.bulkAdd(preparedDayConfigs)
        }
      }
    })
  },
  async remove(id) {
    await db.groups.delete(id)
  },
  async clear() {
    await db.groups.clear()
  },
}
export const teacherService: TeacherService = {
  async add(teacher, hours = []) {
    await db.transaction("rw", [db.teachers, db.hours], async () => {
      const teacherId = await db.teachers.add(teacher)

      if (hours.length > 0) {
        const hoursWithForeignId = hours.map((h) => ({
          ...h,
          teacherId: teacherId,
        }))
        await db.hours.bulkAdd(hoursWithForeignId)
      }
    })
  },
  async patch(id, teacher, hours) {
    await db.transaction("rw", [db.teachers, db.hours], async () => {
      if (Object.keys(teacher).length > 0) {
        await db.teachers.update(id, teacher)
      }

      if (hours) {
        await db.hours.where({ teacherId: id }).delete()

        if (hours.length > 0) {
          const preparedHours = hours.map((h) => ({
            ...h,
            teacherId: id,
          }))
          await db.hours.bulkAdd(preparedHours)
        }
      }
    })
  },
  async remove(id) {
    await db.teachers.delete(id)
  },
  async clear() {
    await db.teachers.clear()
  },
}
