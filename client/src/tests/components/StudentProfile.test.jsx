import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import StudentProfile from '../../components/StudentProfile';

// Mock axios
jest.mock('axios');

describe('StudentProfile', () => {
  const mockContestData = [
    {
      contestId: 1234,
      contestName: 'Test Contest',
      rank: 1,
      oldRating: 2800,
      newRating: 2900,
      date: new Date().toISOString()
    }
  ];

  const mockProblemData = {
    problems: [
      {
        problemId: '1234A',
        problemName: 'Test Problem',
        rating: 1500,
        firstSolved: new Date().toISOString()
      }
    ],
    stats: {
      totalSolved: 100,
      solvedLast30Days: 20,
      solvedLast90Days: 50,
      averageRating: 1600,
      averagePerDay: 0.67
    },
    ratingDistribution: {
      1500: 30,
      1600: 40,
      1700: 30
    }
  };

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/contests')) {
        return Promise.resolve({ data: mockContestData });
      }
      if (url.includes('/problems')) {
        return Promise.resolve({ data: mockProblemData });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders contest history correctly', async () => {
    render(<StudentProfile studentId="123" />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Contest History')).toBeInTheDocument();
      expect(screen.getByText('Test Contest')).toBeInTheDocument();
    });

    // Check time range filter
    const timeRangeSelect = screen.getByLabelText('Time Range');
    expect(timeRangeSelect).toBeInTheDocument();
  });

  it('renders problem solving data correctly', async () => {
    render(<StudentProfile studentId="123" />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Problem Solving Data')).toBeInTheDocument();
      expect(screen.getByText('Total Solved: 100')).toBeInTheDocument();
      expect(screen.getByText('Average Rating: 1600')).toBeInTheDocument();
    });

    // Check metrics cards
    expect(screen.getByText('Most Difficult Problem')).toBeInTheDocument();
    expect(screen.getByText('Average Per Day')).toBeInTheDocument();
  });

  it('handles time range changes', async () => {
    render(<StudentProfile studentId="123" />);

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('Contest History')).toBeInTheDocument();
    });

    // Change time range
    const timeRangeSelect = screen.getByLabelText('Time Range');
    fireEvent.change(timeRangeSelect, { target: { value: '90' } });

    // Verify API call with new time range
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/contests'),
        expect.objectContaining({
          params: { days: '90' }
        })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(<StudentProfile studentId="123" />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });

  it('updates charts when data changes', async () => {
    render(<StudentProfile studentId="123" />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Contest History')).toBeInTheDocument();
    });

    // Mock new data
    const newContestData = [...mockContestData, {
      contestId: 1235,
      contestName: 'New Contest',
      rank: 2,
      oldRating: 2900,
      newRating: 3000,
      date: new Date().toISOString()
    }];

    axios.get.mockResolvedValueOnce({ data: newContestData });

    // Change time range to trigger new data fetch
    const timeRangeSelect = screen.getByLabelText('Time Range');
    fireEvent.change(timeRangeSelect, { target: { value: '90' } });

    // Verify new data is displayed
    await waitFor(() => {
      expect(screen.getByText('New Contest')).toBeInTheDocument();
    });
  });
}); 