import { Module } from '@nestjs/common';
import { IntegrityController } from './integrity.controller';

@Module({ controllers: [IntegrityController] })
export class IntegrityModule {}
