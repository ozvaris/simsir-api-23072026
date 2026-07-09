import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CurrentUser } from '../../common/types/current-user.type';
import { RecordStatus } from '../../common/enums/record-status.enum';
import {
  SYSTEM_SETTING_DEFINITION_BY_KEY,
} from './constants/system-setting-definitions';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { ListSystemSettingsQueryDto } from './dto/list-system-settings-query.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { SystemSetting } from './entities/system-setting.entity';
import { SystemSettingValueType } from './enums/system-setting-value-type.enum';
import { SystemSettingsRepository } from './repositories/system-settings.repository';
import { SystemSettingResponse } from './responses/system-setting.response';

@Injectable()
export class SystemSettingsService implements OnModuleInit {
  private readonly logger = new Logger(SystemSettingsService.name);
  private readonly activeSettingsCache = new Map<string, SystemSetting>();

  constructor(
    private readonly systemSettingsRepository: SystemSettingsRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.refreshCache();
  }

  async listSettings(query: ListSystemSettingsQueryDto) {
    const settings = await this.systemSettingsRepository.list(query);
    return settings.map((setting) => this.toResponse(setting));
  }

  async getSetting(settingId: string) {
    const setting = await this.systemSettingsRepository.findById(settingId);

    if (!setting) {
      throw new NotFoundException('System setting not found');
    }

    return this.toResponse(setting);
  }

  async createSetting(dto: CreateSystemSettingDto, user: CurrentUser) {
    const key = this.normalizeKey(dto.key);
    const existingSetting = await this.systemSettingsRepository.findByKey(key);

    if (existingSetting) {
      throw new ConflictException('System setting key already exists');
    }

    this.validateByDefinition(key, dto.valueType, dto.value);
    this.validateValueByType(dto.valueType, dto.value);

    const setting = this.systemSettingsRepository.create({
      key,
      value: dto.value.trim(),
      valueType: dto.valueType,
      groupKey: dto.groupKey?.trim() || null,
      description: dto.description?.trim() || null,
      isPublic: dto.isPublic ?? false,
      isSystem: SYSTEM_SETTING_DEFINITION_BY_KEY.has(key),
      status: dto.status ?? RecordStatus.ACTIVE,
      createdById: user.userId,
      createdByName: this.toActorName(user),
      updatedById: user.userId,
      updatedByName: this.toActorName(user),
    });

    const savedSetting = await this.systemSettingsRepository.save(setting);
    await this.refreshCache();
    return this.toResponse(savedSetting);
  }

  async updateSetting(
    settingId: string,
    dto: UpdateSystemSettingDto,
    user: CurrentUser,
  ) {
    const setting = await this.systemSettingsRepository.findById(settingId);

    if (!setting) {
      throw new NotFoundException('System setting not found');
    }

    if (dto.value !== undefined) {
      this.validateByDefinition(setting.key, setting.valueType, dto.value);
      this.validateValueByType(setting.valueType, dto.value);
      setting.value = dto.value.trim();
    }

    if (dto.groupKey !== undefined) {
      setting.groupKey = dto.groupKey?.trim() || null;
    }

    if (dto.description !== undefined) {
      setting.description = dto.description?.trim() || null;
    }

    if (dto.isPublic !== undefined) {
      setting.isPublic = dto.isPublic;
    }

    if (dto.status !== undefined) {
      setting.status = dto.status;
    }

    setting.updatedById = user.userId;
    setting.updatedByName = this.toActorName(user);

    const savedSetting = await this.systemSettingsRepository.save(setting);
    await this.refreshCache();
    return this.toResponse(savedSetting);
  }

  async deleteSetting(settingId: string) {
    const setting = await this.systemSettingsRepository.findById(settingId);

    if (!setting) {
      throw new NotFoundException('System setting not found');
    }

    if (setting.isSystem) {
      throw new ForbiddenException('System seed settings cannot be deleted');
    }

    await this.systemSettingsRepository.remove(setting);
    await this.refreshCache();
    return { success: true };
  }

  getString(key: string, fallback?: string): string {
    const setting = this.activeSettingsCache.get(key);

    if (!setting) {
      if (fallback !== undefined) {
        return fallback;
      }

      throw new NotFoundException(`System setting not found: ${key}`);
    }

    return setting.value;
  }

  getNumber(key: string, fallback?: number): number {
    const setting = this.activeSettingsCache.get(key);

    if (!setting) {
      if (fallback !== undefined) {
        return fallback;
      }

      throw new NotFoundException(`System setting not found: ${key}`);
    }

    const parsedValue = Number(setting.value);

    if (!Number.isFinite(parsedValue)) {
      this.logger.warn(`System setting ${key} has invalid numeric value.`);

      if (fallback !== undefined) {
        return fallback;
      }

      throw new BadRequestException(`System setting ${key} is not numeric`);
    }

    return parsedValue;
  }

  getBoolean(key: string, fallback?: boolean): boolean {
    const setting = this.activeSettingsCache.get(key);

    if (!setting) {
      if (fallback !== undefined) {
        return fallback;
      }

      throw new NotFoundException(`System setting not found: ${key}`);
    }

    if (setting.value === 'true') {
      return true;
    }

    if (setting.value === 'false') {
      return false;
    }

    if (fallback !== undefined) {
      return fallback;
    }

    throw new BadRequestException(`System setting ${key} is not boolean`);
  }

  async refreshCache(): Promise<void> {
    const activeSettings = await this.systemSettingsRepository.findAllActive();
    this.activeSettingsCache.clear();

    for (const setting of activeSettings) {
      this.activeSettingsCache.set(setting.key, setting);
    }
  }

  private toResponse(setting: SystemSetting): SystemSettingResponse {
    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      parsedValue: this.parseValue(setting),
      valueType: setting.valueType,
      groupKey: setting.groupKey,
      description: setting.description,
      isPublic: setting.isPublic,
      isSystem: setting.isSystem,
      status: setting.status,
      createdById: setting.createdById,
      createdByName: setting.createdByName,
      createdAt: setting.createdAt,
      updatedById: setting.updatedById,
      updatedByName: setting.updatedByName,
      updatedAt: setting.updatedAt,
    };
  }

  private parseValue(
    setting: SystemSetting,
  ): boolean | number | string | Record<string, unknown> | null {
    switch (setting.valueType) {
      case SystemSettingValueType.NUMBER:
        return Number(setting.value);
      case SystemSettingValueType.BOOLEAN:
        return setting.value === 'true';
      case SystemSettingValueType.JSON:
        return JSON.parse(setting.value) as Record<string, unknown>;
      case SystemSettingValueType.STRING:
      default:
        return setting.value;
    }
  }

  private validateValueByType(
    valueType: SystemSettingValueType,
    value: string,
  ): void {
    const normalizedValue = value.trim();

    switch (valueType) {
      case SystemSettingValueType.NUMBER: {
        const parsedValue = Number(normalizedValue);

        if (!Number.isFinite(parsedValue)) {
          throw new BadRequestException('System setting value must be numeric');
        }
        break;
      }
      case SystemSettingValueType.BOOLEAN:
        if (normalizedValue !== 'true' && normalizedValue !== 'false') {
          throw new BadRequestException(
            'System setting boolean values must be true or false',
          );
        }
        break;
      case SystemSettingValueType.JSON:
        try {
          JSON.parse(normalizedValue);
        } catch {
          throw new BadRequestException(
            'System setting JSON value must be valid JSON',
          );
        }
        break;
      case SystemSettingValueType.STRING:
      default:
        break;
    }
  }

  private validateByDefinition(
    key: string,
    valueType: SystemSettingValueType,
    value: string,
  ): void {
    const definition = SYSTEM_SETTING_DEFINITION_BY_KEY.get(key);

    if (!definition) {
      return;
    }

    if (definition.valueType !== valueType) {
      throw new BadRequestException(
        `System setting ${key} must use ${definition.valueType} value type`,
      );
    }

    if (valueType !== SystemSettingValueType.NUMBER) {
      return;
    }

    const numericValue = Number(value.trim());

    if (
      definition.min !== undefined &&
      Number.isFinite(numericValue) &&
      numericValue < definition.min
    ) {
      throw new BadRequestException(
        `System setting ${key} must be at least ${definition.min}`,
      );
    }

    if (
      definition.max !== undefined &&
      Number.isFinite(numericValue) &&
      numericValue > definition.max
    ) {
      throw new BadRequestException(
        `System setting ${key} must be at most ${definition.max}`,
      );
    }
  }

  private normalizeKey(key: string): string {
    return key.trim();
  }

  private toActorName(user: CurrentUser): string {
    return `${user.name} ${user.surname}`.trim() || user.userName;
  }
}
