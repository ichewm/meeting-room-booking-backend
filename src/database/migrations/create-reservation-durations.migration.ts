import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateReservationDurationsTable1628518978321
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reservation_durations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'durationMinutes',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'displayName',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Insert default durations
    await queryRunner.query(`
      INSERT INTO reservation_durations (durationMinutes, displayName)
      VALUES 
        (30, '30 minutes'),
        (60, '1 hour'),
        (120, '2 hours'),
        (180, '3 hours'),
        (240, '4 hours')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reservation_durations');
  }
}
