import { Injectable } from '@nestjs/common';
import { IPokemonResponse } from './interfaces/pokemon-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly axiosAdapter: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});
    const data = await this.axiosAdapter.get<IPokemonResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=120',
    );

    const pokemonsToInsert: { name: string; no: number }[] = [];
    data.results.forEach(async ({ name, url }) => {
      const segment = url.split('/');
      const no = +segment[segment.length - 2];
      pokemonsToInsert.push({ name, no });
    });
    await this.pokemonModel.insertMany(pokemonsToInsert);
    return 'seed executed';
  }
}
