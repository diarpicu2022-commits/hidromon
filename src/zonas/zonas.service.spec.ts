import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ZonasService } from './zonas.service';
import { Zona } from './entities/zona.entity';

describe('ZonasService', () => {
  let service: ZonasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZonasService,
        { provide: getRepositoryToken(Zona), useValue: {} },
      ],
    }).compile();

    service = module.get<ZonasService>(ZonasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
