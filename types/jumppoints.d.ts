import type { string } from 'yup';

export { IStarsystem };

declare global {
  interface IStarsystem {
    id: string;
    name: string;
    size: string;
    systems: IStarsystem[];
  }
}
