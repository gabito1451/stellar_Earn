import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventStore } from '../entities/event-store.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventStoreService {
    private readonly logger = new Logger(EventStoreService.name);

    constructor(
        @InjectRepository(EventStore)
        private readonly eventStoreRepository: Repository<EventStore>,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async saveEvent(type: string, payload: any, metadata?: any): Promise<EventStore> {
        const event = this.eventStoreRepository.create({
            type,
            payload,
            metadata,
            version: 1,
        });

        const savedEvent = await this.eventStoreRepository.save(event);
        this.logger.debug(`Event saved: ${type} (${savedEvent.id})`);
        return savedEvent;
    }

    async getEvents(type?: string, fromDate?: Date, toDate?: Date): Promise<EventStore[]> {
        const where: any = {};
        if (type) where.type = type;
        if (fromDate && toDate) where.timestamp = Between(fromDate, toDate);

        return this.eventStoreRepository.find({
            where,
            order: { timestamp: 'ASC' },
        });
    }

    async replayEvents(fromId?: string): Promise<void> {
        this.logger.log('Starting event replay...');
        let events: EventStore[];

        if (fromId) {
            const startEvent = await this.eventStoreRepository.findOne({ where: { id: fromId } });
            if (!startEvent) throw new Error(`Event with ID ${fromId} not found`);
            
            events = await this.eventStoreRepository.createQueryBuilder('event')
                .where('event.timestamp > :timestamp', { timestamp: startEvent.timestamp })
                .orderBy('event.timestamp', 'ASC')
                .getMany();
        } else {
            events = await this.eventStoreRepository.find({ order: { timestamp: 'ASC' } });
        }

        this.logger.log(`Replaying ${events.length} events...`);
        for (const event of events) {
            this.logger.debug(`Replaying event: ${event.type} (${event.id})`);
            await this.eventEmitter.emitAsync(event.type, event.payload);
        }
        this.logger.log('Event replay completed successfully');
    }

    async markAsProcessed(id: string): Promise<void> {
        await this.eventStoreRepository.update(id, { processed: true, error: null });
    }

    async markAsFailed(id: string, error: string): Promise<void> {
        const event = await this.eventStoreRepository.findOne({ where: { id } });
        if (event) {
            await this.eventStoreRepository.update(id, {
                error,
                retryCount: event.retryCount + 1,
                processed: false,
            });
        }
    }

    async getFailedEvents(): Promise<EventStore[]> {
        return this.eventStoreRepository.find({
            where: { processed: false, error: Between('\u0000', '\uFFFF') as any }, // Roughly checks if error is not null
        });
    }
}
