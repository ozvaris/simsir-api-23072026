import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import type { CurrentUser as CurrentUserType } from '../../common/types/current-user.type';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { ListSystemSettingsQueryDto } from './dto/list-system-settings-query.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { SystemSettingsService } from './system-settings.service';

@Controller('admin/system-settings')
export class SystemSettingsAdminController {
  constructor(
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  @Get()
  @Permissions('system_setting.read')
  listSettings(@Query() query: ListSystemSettingsQueryDto) {
    return this.systemSettingsService.listSettings(query);
  }

  @Get(':settingId')
  @Permissions('system_setting.read')
  getSetting(@Param('settingId', new ParseUUIDPipe()) settingId: string) {
    return this.systemSettingsService.getSetting(settingId);
  }

  @Post()
  @Permissions('system_setting.create')
  createSetting(
    @Body() dto: CreateSystemSettingDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.systemSettingsService.createSetting(dto, user);
  }

  @Patch(':settingId')
  @Permissions('system_setting.update')
  updateSetting(
    @Param('settingId', new ParseUUIDPipe()) settingId: string,
    @Body() dto: UpdateSystemSettingDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.systemSettingsService.updateSetting(settingId, dto, user);
  }

  @Delete(':settingId')
  @Permissions('system_setting.delete')
  deleteSetting(@Param('settingId', new ParseUUIDPipe()) settingId: string) {
    return this.systemSettingsService.deleteSetting(settingId);
  }
}
