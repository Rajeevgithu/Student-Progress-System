import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Settings from '../../components/Settings';

jest.mock('axios');

describe('Settings Component', () => {
  const mockSettings = {
    cronTime: '09:00',
    emailPreferences: {
      dailyReport: true,
      weeklyReport: true,
      contestReminders: true,
      ratingChanges: true
    }
  };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockSettings });
  });

  it('renders settings form correctly', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/cron time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/daily report/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/weekly report/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contest reminders/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rating changes/i)).toBeInTheDocument();
    });
  });

  it('loads and displays current settings', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/cron time/i)).toHaveValue('09:00');
      expect(screen.getByLabelText(/daily report/i)).toBeChecked();
      expect(screen.getByLabelText(/weekly report/i)).toBeChecked();
      expect(screen.getByLabelText(/contest reminders/i)).toBeChecked();
      expect(screen.getByLabelText(/rating changes/i)).toBeChecked();
    });
  });

  it('updates settings successfully', async () => {
    axios.put.mockResolvedValue({ data: { ...mockSettings, cronTime: '10:00' } });
    
    render(<Settings />);
    
    await waitFor(() => {
      const cronTimeInput = screen.getByLabelText(/cron time/i);
      fireEvent.change(cronTimeInput, { target: { value: '10:00' } });
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/settings', {
        ...mockSettings,
        cronTime: '10:00'
      });
      expect(screen.getByText(/settings updated successfully/i)).toBeInTheDocument();
    });
  });

  it('handles API errors when loading settings', async () => {
    axios.get.mockRejectedValue(new Error('Failed to load settings'));
    
    render(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load settings/i)).toBeInTheDocument();
    });
  });

  it('handles API errors when updating settings', async () => {
    axios.put.mockRejectedValue(new Error('Failed to update settings'));
    
    render(<Settings />);
    
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to update settings/i)).toBeInTheDocument();
    });
  });

  it('validates cron time format', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      const cronTimeInput = screen.getByLabelText(/cron time/i);
      fireEvent.change(cronTimeInput, { target: { value: '25:00' } });
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
    });
  });

  it('toggles email preferences correctly', async () => {
    render(<Settings />);
    
    await waitFor(() => {
      const dailyReportCheckbox = screen.getByLabelText(/daily report/i);
      fireEvent.click(dailyReportCheckbox);
      expect(dailyReportCheckbox).not.toBeChecked();
    });
  });
}); 