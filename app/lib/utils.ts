import { clsx, type ClassValue } from "clsx"
import Dexie from "dexie"
import { twMerge } from "tailwind-merge"
import { ERROR_MESSAGES } from "~/constants"
import type { CreateDayConfig, Id } from "~/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createDayConfig(
  dayId: number,
  firstLesson: number,
  minLessons: number,
  maxLessons: number,
  roomId: Id | null = null
): CreateDayConfig {
  return {
    dayId,
    firstLesson,
    minLessons,
    maxLessons,
    roomId,
  }
}

export function createDayConfigs(
  days: number,
  firstLesson: number,
  minLessons: number,
  maxLessons: number,
  roomId: Id | null = null
): CreateDayConfig[] {
  return Array.from({ length: days }, (_, index) =>
    createDayConfig(index, firstLesson, minLessons, maxLessons, roomId)
  )
}

export function setArrayItemField<T, K extends keyof T>(
  array: T[],
  index: number,
  field: K,
  value: T[K]
): T[] {
  return array.map((item, idx) =>
    index === idx ? { ...item, [field]: value } : item
  )
}

export function resolveError(error: unknown): Error | string {
  if (!error) return ""

  if (error instanceof Error && error.name === "Error") return error
  else if (typeof error === "string") return error
  else if (error instanceof Dexie.BulkError)
    return error.failures[0]
      ? resolveError(error.failures[0])
      : "Не удалось сохранить часть записей"
  if (
    error instanceof Dexie.DexieError ||
    (error instanceof Error && error.name in ERROR_MESSAGES)
  ) {
    return ERROR_MESSAGES[error.name] ?? error.message
  }
  return "Произошла неизвестная ошибка"
}
