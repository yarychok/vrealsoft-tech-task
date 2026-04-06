import { useUIStore as useUiStore } from '@/stores/ui.store';

describe('UiStore', () => {
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

  it('should have closed dialog by default', () => {
    const state = useUiStore.getState();
    expect(state.confirmDialog.isOpen).toBe(false);
  });

  it('should open confirm dialog', () => {
    const onConfirm = jest.fn();
    useUiStore.getState().showConfirm('Delete?', 'Are you sure?', onConfirm);
    const state = useUiStore.getState();

    expect(state.confirmDialog.isOpen).toBe(true);
    expect(state.confirmDialog.title).toBe('Delete?');
    expect(state.confirmDialog.message).toBe('Are you sure?');
  });

  it('should close confirm dialog', () => {
    const onConfirm = jest.fn();
    useUiStore.getState().showConfirm('Delete?', 'Are you sure?', onConfirm);
    useUiStore.getState().hideConfirm();
    const state = useUiStore.getState();

    expect(state.confirmDialog.isOpen).toBe(false);
  });
});
