import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface EditModalProps {
  type: 'Folder' | 'File';
  name: string;
  onNameChange: (name: string) => void;
  isPublic: boolean;
  onPublicChange: (isPublic: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditModal({
  type,
  name,
  onNameChange,
  isPublic,
  onPublicChange,
  onSave,
  onCancel,
}: EditModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="editName">Name</Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => onPublicChange(checked === true)}
            />
            <Label htmlFor="isPublic">Make public</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
