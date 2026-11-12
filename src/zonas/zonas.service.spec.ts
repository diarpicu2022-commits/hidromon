import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ZonasService } from './zonas.service';
import { Zona } from './entities/zona.entity';
import { Cultivo } from '../cultivos/entities/cultivo.entity';

describe('ZonasService', () => {
  let service: ZonasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZonasService,
        { provide: getRepositoryToken(Zona), useValue: {} },
        { provide: getRepositoryToken(Cultivo), useValue: {} },
      ],
    }).compile();

    service = module.get<ZonasService>(ZonasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
