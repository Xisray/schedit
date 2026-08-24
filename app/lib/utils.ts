import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
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
  return array.map((item, idx) => (index === idx ? { ...item, [field]: value } : item))
}
