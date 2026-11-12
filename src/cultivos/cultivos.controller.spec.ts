import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CultivosController } from './cultivos.controller';
import { CultivosService } from './cultivos.service';
import { Cultivo } from './entities/cultivo.entity';

describe('CultivosController', () => {
  let controller: CultivosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CultivosController],
      providers: [
        CultivosService,
        { provide: getRepositoryToken(Cultivo), useValue: {} },
      ],
    }).compile();

    controller = module.get<CultivosController>(CultivosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
