import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ZonasController } from './zonas.controller';
import { ZonasService } from './zonas.service';
import { Zona } from './entities/zona.entity';

describe('ZonasController', () => {
  let controller: ZonasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZonasController],
      providers: [
        ZonasService,
        { provide: getRepositoryToken(Zona), useValue: {} },
      ],
    }).compile();

    controller = module.get<ZonasController>(ZonasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
