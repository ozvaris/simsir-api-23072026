import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { ListSystemSettingsQueryDto } from '../dto/list-system-settings-query.dto';
import { SystemSetting } from '../entities/system-setting.entity';

@Injectable()
export class SystemSettingsRepository {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
  ) {}

  findAllActive(): Promise<SystemSetting[]> {
    return this.systemSettingRepository.find({
      where: { status: RecordStatus.ACTIVE },
      order: { key: 'ASC' },
    });
  }

  findById(settingId: string): Promise<SystemSetting | null> {
    return this.systemSettingRepository.findOne({
      where: { id: settingId },
    });
  }

  findByKey(key: string): Promise<SystemSetting | null> {
    return this.systemSettingRepository.findOne({
      where: { key },
    });
  }

  async list(query: ListSystemSettingsQueryDto): Promise<SystemSetting[]> {
    const qb = this.systemSettingRepository
      .createQueryBuilder('systemSetting')
      .orderBy('systemSetting.groupKey', 'ASC')
      .addOrderBy('systemSetting.key', 'ASC');

    if (query.groupKey) {
      qb.andWhere('systemSetting.groupKey = :groupKey', {
        groupKey: query.groupKey,
      });
    }

    if (query.status) {
      qb.andWhere('systemSetting.status = :status', {
        status: query.status,
      });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(systemSetting.key) LIKE LOWER(:search) OR LOWER(COALESCE(systemSetting.description, \'\')) LIKE LOWER(:search))',
        {
          search: `%${query.search}%`,
        },
      );
    }

    return qb.getMany();
  }

  create(data: Partial<SystemSetting>): SystemSetting {
    return this.systemSettingRepository.create(data);
  }

  save(setting: SystemSetting): Promise<SystemSetting> {
    return this.systemSettingRepository.save(setting);
  }

  async remove(setting: SystemSetting): Promise<void> {
    await this.systemSettingRepository.remove(setting);
  }
}
