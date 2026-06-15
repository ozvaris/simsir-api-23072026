// src/common/seed/seed-execution-policy.ts

import { ConfigService } from '@nestjs/config';

export type SeedCategory = 'system' | 'reference' | 'demo';

function isEnabled(value: string | undefined): boolean {
  return ['1', 'true', 'yes', 'on'].includes((value ?? '').toLowerCase());
}

function isDisabled(value: string | undefined): boolean {
  return ['0', 'false', 'no', 'off'].includes((value ?? '').toLowerCase());
}

export function shouldRunSeed(
  configService: ConfigService,
  category: SeedCategory,
): boolean {
  const nodeEnv = configService.get<string>('NODE_ENV');
  const appEnv = configService.get<string>('APP_ENV');
  const environment = (nodeEnv ?? appEnv ?? 'development').toLowerCase();
  const isProduction = environment === 'production';

  if (category === 'demo') {
    return (
      !isProduction && isEnabled(configService.get<string>('SEED_DEMO_DATA'))
    );
  }

  const categoryEnvKey =
    category === 'system' ? 'SEED_SYSTEM_DATA' : 'SEED_REFERENCE_DATA';
  const categoryValue = configService.get<string>(categoryEnvKey);

  if (isProduction) {
    return (
      isEnabled(configService.get<string>('ENABLE_PRODUCTION_SEED')) &&
      isEnabled(categoryValue)
    );
  }

  if (isDisabled(categoryValue)) {
    return false;
  }

  return true;
}
