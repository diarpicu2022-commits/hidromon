import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SensoresService } from './sensores.service';
import { Sensor } from './entities/sensor.entity';

describe('SensoresService', () => {
  let service: SensoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensoresService,
        { provide: getRepositoryToken(Sensor), useValue: {} },
      ],
    }).compile();

    service = module.get<SensoresService>(SensoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
