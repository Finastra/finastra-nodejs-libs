import { Injectable } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  constructor() {}

  async findAll(): Promise<Cat[]> {
    return [
      {
        breed: 'Cat',
        name: 'Garfield',
        age: 12,
      },
    ];
  }
}
