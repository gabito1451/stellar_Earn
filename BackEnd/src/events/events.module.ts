import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { eventsConfig } from '../config/events.config';
import { EventAuditListener } from './listeners/event-audit.listener';
import { UserListener } from './listeners/user.listener';
import { QuestListener } from './listeners/quest.listener';
import { PayoutListener } from './listeners/payout.listener';
import { SubmissionListener } from './listeners/submission.listener';
import { EventStoreService } from './event-store/event-store.service';
import { EventStore } from './entities/event-store.entity';
import { QuestEventsHandler } from './handlers/quest-events.handler';
import { UserEventsHandler } from './handlers/user-events.handler';
import { SubmissionEventsHandler } from './handlers/submission-events.handler';
import { DeadLetterHandler } from './handlers/dead-letter.handler';

@Global()
@Module({
    imports: [
        EventEmitterModule.forRoot(eventsConfig),
        TypeOrmModule.forFeature([EventStore]),
    ],
    providers: [
        EventAuditListener,
        UserListener,
        QuestListener,
        PayoutListener,
        SubmissionListener,
        EventStoreService,
        QuestEventsHandler,
        UserEventsHandler,
        SubmissionEventsHandler,
        DeadLetterHandler,
    ],
    exports: [EventEmitterModule, EventStoreService],
})
export class EventsModule { }
