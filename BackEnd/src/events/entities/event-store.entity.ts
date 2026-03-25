import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('event_store')
export class EventStore {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string;

    @Column('jsonb')
    payload: any;

    @Column('jsonb', { nullable: true })
    metadata: any;

    @CreateDateColumn()
    timestamp: Date;

    @Column({ default: 1 })
    version: number;

    @Column({ default: false })
    processed: boolean;

    @Column({ nullable: true })
    error: string;

    @Column({ default: 0 })
    retryCount: number;
}
