import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { User } from './entities/user.entity';
import { Quest } from '../quests/entities/quest.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { Payout } from '../payouts/entities/payout.entity';
import { CacheModule } from '../cache/cache.module';
import { UserExperienceListener } from './events/user-experience.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Quest, Submission, Payout]),
    CacheModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserExperienceListener],
  exports: [UsersService],
})
export class UsersModule {}
