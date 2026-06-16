import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GeoModule } from './modules/geo/geo.module';
import { LostCasesModule } from './modules/lost-cases/lost-cases.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PetsModule } from './modules/pets/pets.module';
import { MessagingModule } from './modules/messaging/messaging.module';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';

import { User } from './modules/users/entities/user.entity';
import { UserDevice } from './modules/users/entities/user-device.entity';
import { UserLocation } from './modules/users/entities/user-location.entity';
import { Pet } from './modules/pets/entities/pet.entity';
import { PetPhoto } from './modules/pets/entities/pet-photo.entity';
import { LostPetCase } from './modules/lost-cases/entities/lost-pet-case.entity';
import { CaseTimelineEvent } from './modules/lost-cases/entities/case-timeline-event.entity';
import { SightingReport } from './modules/lost-cases/entities/sighting-report.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { Conversation } from './modules/messaging/entities/conversation.entity';
import { Message } from './modules/messaging/entities/message.entity';
import { Report } from './modules/moderation/entities/report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [
          User, UserDevice, UserLocation,
          Pet, PetPhoto,
          LostPetCase, CaseTimelineEvent, SightingReport,
          Notification,
          Conversation, Message,
          Report,
        ],
        synchronize: config.get('database.synchronize'),
        logging: config.get('database.logging'),
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
        },
      }),
    }),

    AuthModule,
    UsersModule,
    GeoModule,
    PetsModule,
    LostCasesModule,
    NotificationsModule,
    MessagingModule,
  ],
})
export class AppModule {}
