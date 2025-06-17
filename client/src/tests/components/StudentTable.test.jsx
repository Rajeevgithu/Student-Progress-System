import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import StudentTable from '../../components/StudentTable';

// Mock axios
jest.mock('axios');

describe('StudentTable', () => {
  const mockStudents = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      cfHandle: 'john_doe',
      currentRating: 1500,
      maxRating: 1600,
      lastUpdated: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0987654321',
      cfHandle: 'jane_smith',
      currentRating: 2000,
      maxRating: 2100,
      lastUpdated: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockStudents });
  });

  it('renders student data correctly', async () => {
    render(<StudentTable />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Check if all columns are present
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('CF Handle')).toBeInTheDocument();
    expect(screen.getByText('Current Rating')).toBeInTheDocument();
    expect(screen.getByText('Max Rating')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles delete action correctly', async () => {
    axios.delete.mockResolvedValueOnce({});
    
    render(<StudentTable />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click delete button for first student
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify delete API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/api/students/1');
    });
  });

  it('handles view action correctly', async () => {
    render(<StudentTable />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click view button for first student
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);

    // Verify navigation
    expect(window.location.href).toContain('/student/1');
  });

  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(<StudentTable />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error loading students')).toBeInTheDocument();
    });
  });

  it('handles empty data state', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    
    render(<StudentTable />);

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByText('No students found')).toBeInTheDocument();
    });
  });
}); 