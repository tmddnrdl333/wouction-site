import { z } from 'zod'

export const bidCreateSchema = z.object({
  bidderName: z.string().trim().min(1, '이름을 입력해주세요').max(50),
  password: z
    .string()
    .regex(/^\d{4}$/, '비밀번호는 숫자 4자리'),
  amount: z
    .number({ error: '입찰가를 입력해주세요' })
    .int('정수만 입력 가능')
    .positive('0보다 커야 합니다')
    .max(10_000_000_000),
  comment: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const bidDeleteSchema = z.object({
  password: z.string().regex(/^\d{4}$/, '비밀번호는 숫자 4자리'),
})

export const itemCreateSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해주세요').max(200),
  description: z.string().trim().min(1, '본문을 입력해주세요'),
})

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
})
