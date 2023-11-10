import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { IPokemonResponse } from './interfaces/pokemon-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});
    const { data } = await this.axios.get<IPokemonResponse>(
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
