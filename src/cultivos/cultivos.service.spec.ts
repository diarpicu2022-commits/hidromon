import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CultivosService } from './cultivos.service';
import { Cultivo } from './entities/cultivo.entity';

describe('CultivosService', () => {
  let service: CultivosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CultivosService,
        { provide: getRepositoryToken(Cultivo), useValue: {} },
      ],
    }).compile();

    service = module.get<CultivosService>(CultivosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
