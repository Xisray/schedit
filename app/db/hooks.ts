import type { Dexie, EntityTable } from "dexie"
import type { Id, PrimaryKeyName } from "~/types"

export function addFieldCheckConstraint<T, K extends keyof T>(
  table: EntityTable<T, any>,
  key: K,
  check: (value: T[K]) => boolean,
  errorMessage: string
) {
  table.hook("creating", (_, obj) => {
    if (!check(obj[key])) {
      throw new Error(errorMessage)
    }
  })
  table.hook("updating", (mod, _, obj) => {
    const patch = mod as Partial<T>
    const newValue = key in patch ? patch[key]! : obj[key]
    if (!check(newValue)) {
      throw new Error(errorMessage)
    }
  })
}

export type ExtractEntity<T> =
  T extends EntityTable<infer E, any>
    ? E
    : T extends EntityTable<infer E, any>
      ? E
      : T

export type IdKey<T> = {
  [K in keyof T]-?: T[K] extends Id | null ? K : never
}[keyof T]

export type ForeignKeyNames<T> = Exclude<IdKey<T>, PrimaryKeyName>

export type RelationTarget<DBEntities, ParentKey extends keyof DBEntities> = {
  [TargetKey in Exclude<keyof DBEntities, ParentKey>]: {
    table: TargetKey
    field: ForeignKeyNames<ExtractEntity<DBEntities[TargetKey]>>
  }
}[Exclude<keyof DBEntities, ParentKey>]

export interface TableRelationRules<
  DBEntities,
  ParentKey extends keyof DBEntities,
> {
  cascade?: RelationTarget<DBEntities, ParentKey>[]
  setNull?: RelationTarget<DBEntities, ParentKey>[]
}

export type RelationConstraints<DBEntities> = {
  [K in keyof DBEntities]?: TableRelationRules<DBEntities, K>
}

export function setupRelationConstraints<
  DBEntities extends Record<string, any>,
>(db: Dexie & DBEntities, constraints: RelationConstraints<DBEntities>) {
  for (const [parentTableName, rules] of Object.entries(constraints)) {
    if (!rules) continue
    const parentTable = db.table(parentTableName)
    parentTable.hook("deleting", (primKey, _obj, transaction) => {
      if (rules.cascade && rules.cascade.length > 0) {
        for (const target of rules.cascade) {
          transaction
            .table(target.table)
            .where(target.field)
            .equals(primKey)
            .delete()
        }
      }
      if (rules.setNull && rules.setNull.length > 0) {
        for (const target of rules.setNull) {
          transaction
            .table(target.table as string)
            .where(target.field as string)
            .equals(primKey)
            .modify({ [target.field]: null })
        }
      }
    })
  }
}
