const axios = require('axios');
const codeforcesService = require('../../services/codeforcesService');
const Student = require('../../models/Student');

// Mock axios
jest.mock('axios');

describe('CodeforcesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserInfo', () => {
    it('should fetch and format user info correctly', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          result: [{
            handle: 'tourist',
            rating: 3000,
            maxRating: 3500,
            rank: 'legendary grandmaster',
            maxRank: 'legendary grandmaster'
          }]
        }
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await codeforcesService.fetchUserInfo('tourist');

      expect(result).toEqual({
        handle: 'tourist',
        rating: 3000,
        maxRating: 3500,
        rank: 'legendary grandmaster',
        maxRank: 'legendary grandmaster',
        lastUpdated: expect.any(Date)
      });
    });

    it('should handle user not found', async () => {
      const mockResponse = {
        data: {
          status: 'FAILED',
          comment: 'User not found'
        }
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      await expect(codeforcesService.fetchUserInfo('nonexistent'))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('fetchUserRating', () => {
    it('should fetch and format rating history correctly', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          result: [{
            contestId: 1234,
            contestName: 'Test Contest',
            rank: 1,
            oldRating: 2800,
            newRating: 2900,
            ratingUpdateTimeSeconds: 1600000000
          }]
        }
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await codeforcesService.fetchUserRating('tourist');

      expect(result).toEqual([{
        contestId: 1234,
        contestName: 'Test Contest',
        rank: 1,
        oldRating: 2800,
        newRating: 2900,
        date: expect.any(Date)
      }]);
    });
  });

  describe('fetchUserStatus', () => {
    it('should fetch and format submission history correctly', async () => {
      const mockResponse = {
        data: {
          status: 'OK',
          result: [{
            id: 123456,
            problem: {
              contestId: 1234,
              index: 'A',
              name: 'Test Problem',
              rating: 1500
            },
            verdict: 'OK',
            programmingLanguage: 'GNU C++17',
            creationTimeSeconds: 1600000000
          }]
        }
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      const result = await codeforcesService.fetchUserStatus('tourist');

      expect(result).toEqual([{
        id: 123456,
        contestId: 1234,
        problemIndex: 'A',
        problemName: 'Test Problem',
        rating: 1500,
        verdict: 'OK',
        programmingLanguage: 'GNU C++17',
        submissionTime: expect.any(Date)
      }]);
    });
  });

  describe('updateStudentData', () => {
    it('should update student data correctly', async () => {
      const mockStudent = {
        _id: '123',
        cfHandle: 'tourist',
        save: jest.fn()
      };

      const mockUserInfo = {
        handle: 'tourist',
        rating: 3000,
        maxRating: 3500,
        rank: 'legendary grandmaster',
        maxRank: 'legendary grandmaster',
        lastUpdated: new Date()
      };

      const mockRatingHistory = [{
        contestId: 1234,
        contestName: 'Test Contest',
        rank: 1,
        oldRating: 2800,
        newRating: 2900,
        date: new Date()
      }];

      const mockSubmissions = [{
        id: 123456,
        contestId: 1234,
        problemIndex: 'A',
        problemName: 'Test Problem',
        rating: 1500,
        verdict: 'OK',
        programmingLanguage: 'GNU C++17',
        submissionTime: new Date()
      }];

      // Mock the service methods
      codeforcesService.fetchUserInfo = jest.fn().mockResolvedValue(mockUserInfo);
      codeforcesService.fetchUserRating = jest.fn().mockResolvedValue(mockRatingHistory);
      codeforcesService.fetchUserStatus = jest.fn().mockResolvedValue(mockSubmissions);

      // Mock Student.findById
      Student.findById = jest.fn().mockResolvedValue(mockStudent);

      await codeforcesService.updateStudentData('123');

      expect(mockStudent.currentRating).toBe(3000);
      expect(mockStudent.maxRating).toBe(3500);
      expect(mockStudent.rank).toBe('legendary grandmaster');
      expect(mockStudent.maxRank).toBe('legendary grandmaster');
      expect(mockStudent.contestHistory).toEqual(mockRatingHistory);
      expect(mockStudent.save).toHaveBeenCalled();
    });

    it('should handle student not found', async () => {
      Student.findById = jest.fn().mockResolvedValue(null);

      await expect(codeforcesService.updateStudentData('nonexistent'))
        .rejects
        .toThrow('Student not found');
    });
  });
}); 