import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class QuestionBank extends BaseModel {
  static table = 'question_banks'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare text: string

  @column()
  declare theme: 'action-verite' | 'on-ecoute-mais-on-ne-juge-pas'

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column({ columnName: 'usage_count' })
  declare usageCount: number

  @column({ columnName: 'created_by_user_id' })
  declare createdByUserId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
