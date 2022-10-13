import { Collection } from '@mikro-orm/core';
import { Sub } from './Sub';

export class AggregateRoot {
  private readonly id: string;
  private name: string;
  private subs = new Collection<Sub>(this);

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  addSub(name: string): AggregateRoot {
    this.subs.add(new Sub(name, this));
    return this;
  }

  getName(): string {
    return this.name;
  }
}
