import { Config } from '~/types/configInterface';

export const currencyFormat = (config: Config) =>
  new Intl.NumberFormat(config.currency.region, {
    style: 'currency',
    currency: config.currency.currency,
  });

export const capitalize = (input: string): string => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};
