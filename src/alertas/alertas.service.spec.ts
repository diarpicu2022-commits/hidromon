import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlertasService } from './alertas.service';
import { Alerta } from './entities/alerta.entity';

describe('AlertasService', () => {
  let service: AlertasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertasService,
        { provide: getRepositoryToken(Alerta), useValue: {} },
      ],
    }).compile();

    service = module.get<AlertasService>(AlertasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
