import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSetting } from './entities/system-setting.entity';
import { SystemSettingsRepository } from './repositories/system-settings.repository';
import { SystemSettingsSeedService } from './seed/system-settings-seed.service';
import { SystemSettingsAdminController } from './system-settings-admin.controller';
import { SystemSettingsService } from './system-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSetting])],
  controllers: [SystemSettingsAdminController],
  providers: [
    SystemSettingsService,
    SystemSettingsRepository,
    SystemSettingsSeedService,
  ],
  exports: [SystemSettingsService, SystemSettingsRepository, TypeOrmModule],
})
export class SystemSettingsModule {}
