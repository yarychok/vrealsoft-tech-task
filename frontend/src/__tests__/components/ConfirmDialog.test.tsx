import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useUIStore as useUiStore } from '@/stores/ui.store';

describe('ConfirmDialog', () => {
  beforeEach(() => {
    useUiStore.setState({
      confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
      },
    });
  });

  it('should not render when closed', () => {
    render(<ConfirmDialog />);
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    useUiStore.setState({
      confirmDialog: {
        isOpen: true,
        title: 'Delete Item',
        message: 'Are you sure you want to delete?',
        onConfirm: jest.fn(),
      },
    });

    render(<ConfirmDialog />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete?')).toBeInTheDocument();
  });

  it('should call onConfirm and close dialog on confirm click', () => {
    const onConfirm = jest.fn();
    useUiStore.setState({
      confirmDialog: {
        isOpen: true,
        title: 'Delete',
        message: 'Sure?',
        onConfirm,
      },
    });

    render(<ConfirmDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
