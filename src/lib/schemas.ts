import { z } from 'zod'

export const bidCreateSchema = z.object({
  bidderName: z.string().trim().min(1, '이름을 입력해주세요').max(50),
  password: z
    .string()
    .regex(/^\d{4}$/, '비밀번호는 숫자 4자리'),
  // 미입력 시 0 = 무료
  amount: z
    .number()
    .int('정수만 입력 가능')
    .min(0, '0 이상이어야 합니다')
    .max(10_000_000_000),
  comment: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const bidDeleteSchema = z.object({
  password: z.string().regex(/^\d{4}$/, '비밀번호는 숫자 4자리'),
})

export const itemCreateSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해주세요').max(200),
  description: z.string().trim().min(1, '본문을 입력해주세요'),
  // null = 무료 (제안가격 미입력)
  suggestedPrice: z.number().int('정수만 입력 가능').min(0, '0 이상이어야 합니다').max(10_000_000_000).nullable(),
})

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
})
