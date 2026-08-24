import { createDayConfig, createDayConfigs } from "~/lib/utils"
import type { CreateDayConfig, DayConfig } from "~/types"

export const DAYS_NAMES = [
  {
    short: "Пн",
    name: "Понедельник",
  },
  {
    short: "Вт",
    name: "Вторник",
  },
  {
    short: "Ср",
    name: "Среда",
  },
  {
    short: "Чт",
    name: "Четверг",
  },
  {
    short: "Пт",
    name: "Пятница",
  },
  {
    short: "Сб",
    name: "Суббота",
  },
] as const

export const DAYS_COUNT = DAYS_NAMES.length

export const DEFAULT_SCHEDULE_CONFIG: Record<number, CreateDayConfig[]> = {
  1: createDayConfigs(5, 1, 3, 4),
  2: createDayConfigs(5, 1, 3, 4),
  3: createDayConfigs(5, 1, 3, 4),
  4: createDayConfigs(5, 1, 3, 4),
  5: createDayConfigs(6, 1, 5, 6),
  6: createDayConfigs(6, 1, 5, 6),
  7: createDayConfigs(6, 1, 5, 7),
  8: createDayConfigs(6, 1, 6, 7),
  9: createDayConfigs(6, 1, 6, 7),
  10: createDayConfigs(6, 1, 6, 7),
  11: createDayConfigs(6, 1, 6, 7),
} as const

export const ERROR_MESSAGES: Record<string, string> = {
  ConstraintError: "Запись с такими уникальными данными уже существует.",
  QuotaExceededError: "Превышен лимит памяти хранилища браузера.",
  NotFoundError: "Запрашиваемая запись не найдена.",
  DatabaseClosedError:
    "База данных была закрыта. Попробуйте перезагрузить страницу.",
  VersionError: "Ошибка версии базы данных. Попробуйте очистить кэш браузера.",
  AbortError: "Операция была отменена.",
  TimeoutError: "Время ожидания операции истекло.",
  UnknownError: "Произошла неизвестная ошибка базы данных.",
} as const

export const CYRILLIC_ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ"
export const CYRILLIC_LETTER = /^[А-ЯЁ]$/
export const MIN_GRADE = 1
export const MAX_GRADE = 11
