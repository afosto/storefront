import { describe, expect, it } from 'vitest';
import { toSchemaVariables } from '../../src/utils';

describe('toSchemaVariables', () => {
  it('renames the address line keys the snake_case conversion gets wrong', () => {
    expect(
      toSchemaVariables({
        addressLine1: 'Stationsweg 1',
        addressLine2: 'Second floor',
        addressLine3: 'Door B',
      }),
    ).toEqual({
      address_line_1: 'Stationsweg 1',
      address_line_2: 'Second floor',
      address_line_3: 'Door B',
    });
  });

  it('renames them inside nested objects and arrays', () => {
    expect(
      toSchemaVariables({
        signUpInput: {
          addressing: {
            billing: [{ addressLine1: 'Stationsweg 1' }],
            shipping: [{ addressLine1: 'Stationsweg 2' }],
          },
        },
      }),
    ).toEqual({
      signUpInput: {
        addressing: {
          billing: [{ address_line_1: 'Stationsweg 1' }],
          shipping: [{ address_line_1: 'Stationsweg 2' }],
        },
      },
    });
  });

  it('leaves every other key alone', () => {
    const variables = {
      cocNumber: '12345678',
      countryCode: 'NL',
      premiseNumber: 1,
      premiseNumberSuffix: 'A',
      phoneNumbers: [{ countryCode: 'NL', number: '0612345678' }],
      priceListId: 'PL_1',
      address_line_1: 'Stationsweg 1',
    };

    expect(toSchemaVariables(variables)).toEqual(variables);
  });

  it('passes values that are not plain objects through untouched', () => {
    const date = new Date();

    expect(toSchemaVariables({ date, items: [1, 'two', null, undefined], empty: null })).toEqual({
      date,
      items: [1, 'two', null, undefined],
      empty: null,
    });
  });

  it('does not change the variables it was given', () => {
    const variables = { addressing: { billing: [{ addressLine1: 'Stationsweg 1' }] } };

    toSchemaVariables(variables);

    expect(variables).toEqual({ addressing: { billing: [{ addressLine1: 'Stationsweg 1' }] } });
  });
});
