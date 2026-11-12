import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SensoresController } from './sensores.controller';
import { SensoresService } from './sensores.service';
import { Sensor } from './entities/sensor.entity';

describe('SensoresController', () => {
  let controller: SensoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensoresController],
      providers: [
        SensoresService,
        { provide: getRepositoryToken(Sensor), useValue: {} },
      ],
    }).compile();

    controller = module.get<SensoresController>(SensoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
