import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { shouldRunSeed } from '../../../common/seed/seed-execution-policy';
import {
  SYSTEM_SETTING_DEFINITIONS,
} from '../constants/system-setting-definitions';
import { SystemSettingsRepository } from '../repositories/system-settings.repository';
import { RecordStatus } from '../../../common/enums/record-status.enum';

@Injectable()
export class SystemSettingsSeedService implements OnModuleInit {
  private readonly logger = new Logger(SystemSettingsSeedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly systemSettingsRepository: SystemSettingsRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!shouldRunSeed(this.configService, 'system')) {
      this.logger.log('Skipping system settings seed.');
      return;
    }

    for (const definition of SYSTEM_SETTING_DEFINITIONS) {
      const existingSetting = await this.systemSettingsRepository.findByKey(
        definition.key,
      );

      if (existingSetting) {
        continue;
      }

      await this.systemSettingsRepository.save(
        this.systemSettingsRepository.create({
          key: definition.key,
          value: definition.defaultValue,
          valueType: definition.valueType,
          groupKey: definition.groupKey,
          description: definition.description,
          isPublic: definition.isPublic,
          isSystem: true,
          status: RecordStatus.ACTIVE,
          createdByName: 'System Seed',
          updatedByName: 'System Seed',
        }),
      );
    }
  }
}
