// src/modules/addresses/addresses.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from '../users/entities/address.entity';
import { User } from '../users/entities/user.entity';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { AddressesRepository } from './repositories/addresses.repository';
import { DemoAddressesSeedService } from './seed/demo-addresses-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User])],
  controllers: [AddressesController],
  providers: [AddressesService, AddressesRepository, DemoAddressesSeedService],
  exports: [AddressesService, AddressesRepository],
})
export class AddressesModule {}
