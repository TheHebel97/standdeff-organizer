const helperFunctions = require('../logic/helpers/helper-functions')

test('storeDataInGM', () => {
    const data : object = {test: "test"};
    const key = "test";
    helperFunctions.storeDataInGM(data, key);
    expect(helperFunctions.getDataFromGM(key)).toEqual(data);
});
