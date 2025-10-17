import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CaseDetailModal from '../CaseDetailModal';
import { crimeAPI } from '../../../services/api';

// Mock the API
jest.mock('../../../services/api', () => ({
  crimeAPI: {
    getCrime: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('CaseDetailModal', () => {
  const mockCaseData = {
    _id: '123',
    title: 'Test Crime Report',
    description: 'This is a test crime report',
    category: 'theft',
    severity: 'medium',
    status: 'pending',
    dateTime: '2023-12-01T10:00:00Z',
    location: {
      address: '123 Main St',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    reporter: {
      firstName: 'John',
      lastName: 'Doe'
    },
    isAnonymous: false,
    evidence: {
      photos: [
        {
          url: 'https://example.com/photo1.jpg',
          caption: 'Evidence photo 1',
          uploadedAt: '2023-12-01T10:00:00Z'
        }
      ],
      videos: [],
      documents: []
    },
    policeNotes: [],
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2023-12-01T10:00:00Z'
  };

  beforeEach(() => {
    crimeAPI.getCrime.mockResolvedValue({
      data: { crime: mockCaseData }
    });
    crimeAPI.updateStatus.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when loading', () => {
    render(
      <CaseDetailModal
        caseId="123"
        isOpen={true}
        onClose={jest.fn()}
        userRole="police"
      />
    );
    
    expect(screen.getByText('Loading case details...')).toBeInTheDocument();
  });

  it('renders case details when data is loaded', async () => {
    render(
      <CaseDetailModal
        caseId="123"
        isOpen={true}
        onClose={jest.fn()}
        userRole="police"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test Crime Report')).toBeInTheDocument();
      expect(screen.getByText('This is a test crime report')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
    });
  });

  it('shows evidence photos when available', async () => {
    render(
      <CaseDetailModal
        caseId="123"
        isOpen={true}
        onClose={jest.fn()}
        userRole="police"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Photos (1)')).toBeInTheDocument();
    });
  });

  it('shows action buttons for police role', async () => {
    render(
      <CaseDetailModal
        caseId="123"
        isOpen={true}
        onClose={jest.fn()}
        userRole="police"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Mark Under Investigation')).toBeInTheDocument();
      expect(screen.getByText('Mark Resolved')).toBeInTheDocument();
      expect(screen.getByText('Close Case')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    const mockOnClose = jest.fn();
    render(
      <CaseDetailModal
        caseId="123"
        isOpen={true}
        onClose={mockOnClose}
        userRole="police"
      />
    );

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('does not render when isOpen is false', () => {
    render(
      <CaseDetailModal
        caseId="123"
        isOpen={false}
        onClose={jest.fn()}
        userRole="police"
      />
    );
    
    expect(screen.queryByText('Case Details')).not.toBeInTheDocument();
  });
});
