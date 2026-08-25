import { clsx, type ClassValue } from "clsx"
import Dexie from "dexie"
import { twMerge } from "tailwind-merge"
import {
  CYRILLIC_ALPHABET,
  CYRILLIC_LETTER,
  ERROR_MESSAGES,
  MAX_GRADE,
  MIN_GRADE,
} from "~/constants"
import type { CreateDayConfig, CreateEntity, Id, SchoolGroup } from "~/types"

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

interface BulkErrorLike {
  failures: unknown[]
}

function isBulkError(error: unknown): error is BulkErrorLike {
  if (error instanceof Dexie.BulkError) {
    return true
  }
  return (
    typeof error === "object" &&
    error !== null &&
    "failures" in error &&
    Array.isArray((error as Record<string, unknown>).failures)
  )
}

export function resolveError(error: unknown): Error | string {
  if (!error) return ""

  if (isBulkError(error))
    return error.failures[0]
      ? resolveError(error.failures[0])
      : "Не удалось сохранить часть записей"
  else if (typeof error === "string") return error
  else if (error instanceof Error && error.name === "Error") return error
  if (
    error instanceof Dexie.DexieError ||
    (error instanceof Error && error.name in ERROR_MESSAGES)
  ) {
    return ERROR_MESSAGES[error.name] ?? error.message
  }
  return "Произошла неизвестная ошибка"
}

export function groupToStr(group: SchoolGroup): string {
  return `${group.grade}${group.letter}`
}

function isValidGrade(grade: number): boolean {
  return Number.isInteger(grade) && grade >= MIN_GRADE && grade <= MAX_GRADE
}

function assertValidGrade(grade: number, token: string): void {
  if (!isValidGrade(grade)) {
    throw new Error(
      `Некорректный класс: ${token}. Допустимы классы с ${MIN_GRADE} по ${MAX_GRADE}.`
    )
  }
}

export function parseGroupTemplate(
  template: string
): Array<CreateEntity<SchoolGroup>> {
  const clean = template.replace(/\s+/g, "").toUpperCase()

  const simpleMatch = clean.match(/^(\d{1,2})([А-ЯЁ])$/)
  if (simpleMatch) {
    const [, gradeRaw, letter] = simpleMatch
    const grade = Number(gradeRaw)
    assertValidGrade(grade, gradeRaw)
    return [{ grade, letter }]
  }

  const match = clean.match(/^([0-9,\-]+)([А-ЯЁ,\-]+)$/)

  if (!match) {
    throw new Error("Неверный формат. Пример: 5А, 5-9А-Г или 5,7-9А,В-Д")
  }

  const [, gradesPart, lettersPart] = match
  const grades = new Set<number>()

  for (const token of gradesPart.split(",")) {
    if (token.includes("-")) {
      const parts = token.split("-")
      if (parts.length !== 2) {
        throw new Error(`Некорректный диапазон классов: ${token}`)
      }

      const [start, end] = parts.map(Number)
      if (!isValidGrade(start) || !isValidGrade(end) || start > end) {
        throw new Error(`Некорректный диапазон классов: ${token}`)
      }

      for (let grade = start; grade <= end; grade++) grades.add(grade)
    } else {
      const grade = Number(token)
      assertValidGrade(grade, token)
      grades.add(grade)
    }
  }

  const letters = new Set<string>()

  for (const token of lettersPart.split(",")) {
    if (token.includes("-")) {
      const parts = token.split("-")
      if (
        parts.length !== 2 ||
        parts[0].length !== 1 ||
        parts[1].length !== 1 ||
        !CYRILLIC_LETTER.test(parts[0]) ||
        !CYRILLIC_LETTER.test(parts[1])
      ) {
        throw new Error(`Некорректный диапазон литер: ${token}`)
      }

      const start = CYRILLIC_ALPHABET.indexOf(parts[0])
      const end = CYRILLIC_ALPHABET.indexOf(parts[1])

      if (start > end) {
        throw new Error(`Некорректный диапазон букв: ${token}`)
      }

      for (let index = start; index <= end; index++) {
        letters.add(CYRILLIC_ALPHABET[index])
      }
    } else {
      if (!CYRILLIC_LETTER.test(token)) {
        throw new Error(
          `Некорректная литера: ${token}. Используйте русскую букву.`
        )
      }
      letters.add(token)
    }
  }

  const result: Array<CreateEntity<SchoolGroup>> = []

  for (const grade of [...grades].sort((a, b) => a - b)) {
    for (const letter of [...letters].sort(
      (a, b) => CYRILLIC_ALPHABET.indexOf(a) - CYRILLIC_ALPHABET.indexOf(b)
    )) {
      result.push({ grade, letter })
    }
  }

  return result
}
