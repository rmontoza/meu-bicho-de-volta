import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CaseStatus, TimelineEventType, UserRole } from '../../common/enums';
import { User } from '../users/entities/user.entity';
import { GeoService } from '../geo/geo.service';
import { CaseTimelineEvent } from './entities/case-timeline-event.entity';
import { LostPetCase } from './entities/lost-pet-case.entity';
import { SightingReport } from './entities/sighting-report.entity';
import { CreateLostCaseDto } from './dto/create-lost-case.dto';
import { CreateSightingDto } from './dto/create-sighting.dto';
import { UpdateLostCaseDto } from './dto/update-lost-case.dto';

@Injectable()
export class LostCasesService {
  constructor(
    @InjectRepository(LostPetCase) private casesRepo: Repository<LostPetCase>,
    @InjectRepository(CaseTimelineEvent) private timelineRepo: Repository<CaseTimelineEvent>,
    @InjectRepository(SightingReport) private sightingsRepo: Repository<SightingReport>,
    private geoService: GeoService,
  ) {}

  async create(user: User, dto: CreateLostCaseDto) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const lostCase = this.casesRepo.create({
      petId: dto.petId,
      ownerId: user.id,
      status: CaseStatus.ACTIVE,
      title: dto.title,
      description: dto.description,
      lastSeenAt: new Date(dto.lastSeenAt),
      lastSeenLatitude: dto.lastSeenLatitude,
      lastSeenLongitude: dto.lastSeenLongitude,
      lastSeenAddressText: dto.lastSeenAddressText,
      radiusKm: dto.radiusKm ?? 3.0,
      rewardEnabled: dto.rewardEnabled ?? false,
      contactPreference: dto.contactPreference,
      urgencyLevel: dto.urgencyLevel ?? 3,
      expiresAt,
    });

    const saved = await this.casesRepo.save(lostCase);

    await this.timelineRepo.save(
      this.timelineRepo.create({
        lostCaseId: saved.id,
        eventType: TimelineEventType.CASE_CREATED,
        description: 'Caso aberto.',
      }),
    );

    return saved;
  }

  async findAll(lat?: number, lng?: number, radiusKm = 10) {
    if (lat !== undefined && lng !== undefined) {
      const nearby = await this.geoService.findCasesNearUser(lat, lng, radiusKm);
      if (nearby.length === 0) return [];

      const ids = nearby.map((n) => n.id);
      const cases = await this.casesRepo.find({
        where: { id: In(ids), status: CaseStatus.ACTIVE },
        relations: { pet: true },
      });

      return cases.map((c) => ({
        ...c,
        distanceKm: nearby.find((n) => n.id === c.id)?.distanceKm,
      }));
    }

    return this.casesRepo.find({
      where: { status: CaseStatus.ACTIVE },
      relations: { pet: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async findOne(id: string) {
    const lostCase = await this.casesRepo.findOne({
      where: { id },
      relations: { pet: true, timeline: true, sightings: true },
    });
    if (!lostCase) throw new NotFoundException('Caso não encontrado.');
    return lostCase;
  }

  async update(id: string, user: User, dto: UpdateLostCaseDto) {
    const lostCase = await this.findOne(id);
    this.assertOwnerOrAdmin(lostCase, user);

    const wasOpen = lostCase.status === CaseStatus.ACTIVE;
    const isClosing = dto.status && dto.status !== CaseStatus.ACTIVE;

    await this.casesRepo.update(id, {
      ...dto,
      ...(isClosing ? { resolvedAt: new Date() } : {}),
    });

    if (wasOpen && isClosing) {
      await this.timelineRepo.save(
        this.timelineRepo.create({
          lostCaseId: id,
          eventType: TimelineEventType.CASE_CLOSED,
          description: `Caso encerrado com status: ${dto.status}.`,
        }),
      );
    }

    return this.findOne(id);
  }

  async addSighting(caseId: string, user: User, dto: CreateSightingDto) {
    const lostCase = await this.findOne(caseId);
    if (lostCase.status !== CaseStatus.ACTIVE) {
      throw new ForbiddenException('Não é possível adicionar avistamento a um caso encerrado.');
    }

    const sighting = this.sightingsRepo.create({
      lostCaseId: caseId,
      reportedByUserId: user.id,
      seenAt: new Date(dto.seenAt),
      latitude: dto.latitude,
      longitude: dto.longitude,
      certaintyLevel: dto.certaintyLevel,
      comment: dto.comment,
      photoUrl: dto.photoUrl,
    });

    const saved = await this.sightingsRepo.save(sighting);

    await this.timelineRepo.save(
      this.timelineRepo.create({
        lostCaseId: caseId,
        eventType: TimelineEventType.SIGHTING_REPORTED,
        description: `Avistamento reportado por usuário.`,
        metadata: { sightingId: saved.id, lat: dto.latitude, lng: dto.longitude },
      }),
    );

    return saved;
  }

  async remove(id: string, user: User) {
    const lostCase = await this.findOne(id);
    this.assertOwnerOrAdmin(lostCase, user);
    await this.casesRepo.remove(lostCase);
    return { message: 'Caso removido.' };
  }

  private assertOwnerOrAdmin(lostCase: LostPetCase, user: User) {
    if (lostCase.ownerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Sem permissão.');
    }
  }
}
