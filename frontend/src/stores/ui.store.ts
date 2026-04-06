import { create } from 'zustand';

interface UIState {
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirm: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  },

  showConfirm: (title, message, onConfirm) => {
    set({
      confirmDialog: { isOpen: true, title, message, onConfirm },
    });
  },

  hideConfirm: () => {
    set({
      confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
      },
    });
  },
}));
