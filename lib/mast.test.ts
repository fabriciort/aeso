import { getObjectData, getObservationsByCoordinates, ObjectData, ObservationData } from './mast';

// Mock the global fetch function
global.fetch = jest.fn();

describe('MAST API Functions', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    // Suppress console.error for expected error handling in tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  describe('getObjectData', () => {
    it('should return object data for a valid object name', async () => {
      const mockObjectName = 'M51';
      const mockApiResponse = [
        {
          ra: 202.4695833,
          dec: 47.1952778,
          name: mockObjectName,
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await getObjectData(mockObjectName);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/Mast.Name.Lookup'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ input: mockObjectName, format: 'json' }),
        })
      );

      expect(result).toEqual({
        ra: 202.4695833,
        dec: 47.1952778,
        name: mockObjectName,
        coordinates: {
          ra_str: "13h 29m 52.7s",
          dec_str: "+47° 11' 43.0\"", 
        },
      });
    });

    it('should return null if object name is not found', async () => {
      const mockObjectName = 'UnknownObject';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [], // Empty array for not found
      });

      const result = await getObjectData(mockObjectName);
      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      const mockObjectName = 'ErrorObject';
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false, // Simulate API error
        status: 500,
      });

      const result = await getObjectData(mockObjectName);
      expect(result).toBeNull();
    });

     it('should return null on network error', async () => {
      const mockObjectName = 'NetworkErrorObject';
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

      const result = await getObjectData(mockObjectName);
      expect(result).toBeNull();
    });
  });

  describe('getObservationsByCoordinates', () => {
    const mockRa = 202.4695833;
    const mockDec = 47.1952778;
    const mockRadius = 0.1;

    it('should return observation data for valid coordinates', async () => {
      const mockApiResponse = {
        data: [
          {
            obsid: 'jwst_obs_001',
            instrument_name: 'NIRCAM',
            filters: 'F200W',
            t_exptime: 1000,
            dataURL: 'jwst/obs_001.fits',
            dataproduct_type: 'image',
          },
          {
            obsid: 'hst_obs_002',
            instrument_name: 'ACS',
            filters: 'F814W',
            t_exptime: 1200,
            dataURL: 'hst/obs_002.fits',
            dataproduct_type: 'image',
          },
        ],
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await getObservationsByCoordinates(mockRa, mockDec, mockRadius);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/Mast.Caom.Cone'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ra: mockRa, dec: mockDec, radius: mockRadius, format: 'json' }),
        })
      );

      expect(result).toEqual([
        {
          obs_id: 'jwst_obs_001',
          instrument_name: 'NIRCAM',
          filters: 'F200W',
          t_exptime: 1000,
          dataURL: 'jwst/obs_001.fits',
          productType: 'image',
        },
        {
          obs_id: 'hst_obs_002',
          instrument_name: 'ACS',
          filters: 'F814W',
          t_exptime: 1200,
          dataURL: 'hst/obs_002.fits',
          productType: 'image',
        },
      ]);
    });

    it('should return empty array if no observations found (empty data array)', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }), 
      });

      const result = await getObservationsByCoordinates(mockRa, mockDec, mockRadius);
      expect(result).toEqual([]);
    });
    
    it('should return empty array if no observations found (no data field)', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // No data field
      });

      const result = await getObservationsByCoordinates(mockRa, mockDec, mockRadius);
      expect(result).toEqual([]);
    });

    it('should return null on API error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false, // Simulate API error
        status: 500,
      });

      const result = await getObservationsByCoordinates(mockRa, mockDec, mockRadius);
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));
      const result = await getObservationsByCoordinates(mockRa, mockDec, mockRadius);
      expect(result).toBeNull();
    });
  });
});
