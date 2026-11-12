import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { Alerta } from './entities/alerta.entity';

describe('AlertasController', () => {
  let controller: AlertasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertasController],
      providers: [
        AlertasService,
        { provide: getRepositoryToken(Alerta), useValue: {} },
      ],
    }).compile();

    controller = module.get<AlertasController>(AlertasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
