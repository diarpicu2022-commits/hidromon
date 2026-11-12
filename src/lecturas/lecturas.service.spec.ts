import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LecturasService } from './lecturas.service';
import { Lectura } from './entities/lectura.entity';
import { Sensor } from '../sensores/entities/sensor.entity';
import { Alerta } from '../alertas/entities/alerta.entity';

describe('LecturasService', () => {
  let service: LecturasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturasService,
        { provide: getRepositoryToken(Lectura), useValue: {} },
        { provide: getRepositoryToken(Sensor), useValue: {} },
        { provide: getRepositoryToken(Alerta), useValue: {} },
      ],
    }).compile();

    service = module.get<LecturasService>(LecturasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
