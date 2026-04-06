import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { FilesModule } from './files/files.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ShareLinksModule } from './share-links/share-links.module';
import { SearchModule } from './search/search.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('database.url');
        const isLocal = url?.includes('localhost') || url?.includes('@postgres:');
        return {
          type: 'postgres' as const,
          url,
          autoLoadEntities: true,
          synchronize: config.get<string>('nodeEnv') !== 'production',
          logging: config.get<string>('nodeEnv') === 'development',
          ...(!isLocal && { ssl: { rejectUnauthorized: false } }),
        };
      },
    }),

    AuthModule,
    UsersModule,
    FoldersModule,
    FilesModule,
    PermissionsModule,
    ShareLinksModule,
    SearchModule,
  ],
})
export class AppModule {}
