import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LecturasController } from './lecturas.controller';
import { LecturasService } from './lecturas.service';
import { Lectura } from './entities/lectura.entity';

describe('LecturasController', () => {
  let controller: LecturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LecturasController],
      providers: [
        LecturasService,
        { provide: getRepositoryToken(Lectura), useValue: {} },
      ],
    }).compile();

    controller = module.get<LecturasController>(LecturasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
