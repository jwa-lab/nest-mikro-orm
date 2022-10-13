import { AggregateRoot } from './AggregateRoot';

export class Sub {
  private readonly id!: number;
  private name: string;
  private readonly aggregate: AggregateRoot;

  constructor(name: string, aggregate: AggregateRoot) {
    this.name = name;
    this.aggregate = aggregate;
  }
}
