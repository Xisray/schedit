import type { EntityTable, IDType, InsertType, UpdateSpec } from "dexie"
import { DEFAULT_SCHEDULE_CONFIG } from "~/constants"
import { db } from "~/db"
import type {
  CreateDayConfig,
  CreateEntity,
  CreateTeacherHours,
  DayConfigExtended,
  Id,
  PatchEntity,
  PrimaryKeyName,
  Room,
  SchoolGroup,
  SchoolGroupExtended,
  Teacher,
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
  get: (id: IDType<TEntity, TKey>) => Promise<TEntity | undefined>
  getAll: () => Promise<TEntity[]>
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
  get: (
    id: IDType<SchoolGroup, PrimaryKeyName>
  ) => Promise<SchoolGroupExtended | undefined>
  bulkAdd: (
    entities: CreateEntity<SchoolGroup>[],
    dayConfigs?: CreateDayConfig[]
  ) => Promise<void>
  getAll: () => Promise<SchoolGroup[]>
  getAllExtended: () => Promise<SchoolGroupExtended[]>
  bulkRemove: (ids: IDType<SchoolGroup, PrimaryKeyName>[]) => Promise<void>
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
  get: (
    id: IDType<Teacher, PrimaryKeyName>
  ) => Promise<(Teacher & { hours: CreateTeacherHours[] }) | undefined>
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
      return await table.get(id)
    },
    async getAll() {
      return await table.toArray()
    },
  }
}

export const roomService = createService(db.rooms)
export const groupService: GroupService = {
  async add(group, dayConfigs) {
    await db.transaction("rw", [db.groups, db.dayConfigs], async () => {
      const groupId = await db.groups.add(group)
      console.log(dayConfigs)
      if (dayConfigs === undefined)
        dayConfigs = DEFAULT_SCHEDULE_CONFIG[group.grade]
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
  async get(id) {
    const result = await db.groups.get(id)
    if (!result) return undefined
    const dayConfigs = await db.dayConfigs.where({ groupId: id }).toArray()

    const roomIds = Array.from(
      new Set(
        dayConfigs.map((d) => d.roomId).filter((id): id is Id => Boolean(id))
      )
    )
    const rooms =
      roomIds.length > 0
        ? await db.rooms.where("id").anyOf(roomIds).toArray()
        : []

    const roomMap = new Map<Id, Room>(rooms.map((r) => [r.id, r]))

    return {
      ...result,
      dayConfigs: dayConfigs.map(({ groupId, roomId, ...dayCfg }) => ({
        ...dayCfg,
        room: roomId ? (roomMap.get(roomId) ?? null) : null,
      })),
    }
  },
  async bulkAdd(entities, dayConfigs) {
    await db.transaction("rw", [db.groups, db.dayConfigs], async () => {
      const groupIds = await db.groups.bulkAdd(entities, { allKeys: true })

      const allDayConfigs = groupIds.flatMap((groupId, index) =>
        (dayConfigs
          ? dayConfigs
          : DEFAULT_SCHEDULE_CONFIG[entities[index].grade]
        ).map((dc) => ({
          ...dc,
          groupId,
        }))
      )

      if (allDayConfigs.length > 0) {
        await db.dayConfigs.bulkAdd(allDayConfigs)
      }
    })
  },
  async getAll() {
    return await db.groups.toArray()
  },
  async getAllExtended() {
    const [groups, dayConfigs, rooms] = await Promise.all([
      db.groups.toArray(),
      db.dayConfigs.toArray(),
      db.rooms.toArray(),
    ])
    const roomMap = new Map<Id, Room>(rooms.map((r) => [r.id, r]))
    const configsByGroup = new Map<Id, DayConfigExtended[]>()

    for (const config of dayConfigs) {
      const { groupId, roomId, ...restConfig } = config
      const extendedConfig: DayConfigExtended = {
        ...restConfig,
        room: roomId ? (roomMap.get(roomId) ?? null) : null,
      }

      const list = configsByGroup.get(groupId)
      if (list) {
        list.push(extendedConfig)
      } else {
        configsByGroup.set(groupId, [extendedConfig])
      }
    }

    return groups.map((group) => ({
      ...group,
      dayConfigs: (configsByGroup.get(group.id) ?? []).sort(
        (a, b) => a.dayId - b.dayId
      ),
    }))
  },
  async bulkRemove(ids) {
    await db.groups.bulkDelete(ids)
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
  async get(id) {
    const result = await db.teachers.get(id)
    if (!result) return undefined

    const hours = await db.hours.where({ teacherId: id }).toArray()

    return {
      ...result,
      hours,
    }
  },
}
