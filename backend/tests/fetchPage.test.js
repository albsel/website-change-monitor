const axios = require('axios');
const { fetchPage } = require('../src/services/fetchPage');

jest.mock('axios');

describe('fetchPage error handling', () => {
  it('throws a clear error when the request fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    await expect(
      fetchPage('https://does-not-exist.test')
    ).rejects.toThrow('Failed to fetch https://does-not-exist.test: Network error');
  });
});
