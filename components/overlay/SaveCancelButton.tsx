import { cn } from '@/util/cn';
import Loader from '../loader/Loader';
import Button from '../button/Button';

interface SaveCancelButtonProps {
  isPending?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  saveStr?: string;
}

const SaveCancelButton = ({
  isPending,
  onSave,
  saveStr,
  onCancel,
}: SaveCancelButtonProps) => {
  return (
    <div className="w-full flex gap-4 mt-8 font-extrabold">
      <button
        type="button"
        className={cn('px-4', isPending ? 'opacity-20' : '')}
        onClick={onCancel}
        disabled={isPending}
      >
        Cancel
      </button>
      <Button
        type="submit"
        className={`w-full flex justify-center ${isPending ? 'opacity-25' : ''}`}
        onClick={onSave}
        disabled={isPending}
      >
        {isPending ? <Loader isDark={true} className="w-6 h-6" /> : saveStr || 'Save'}
      </Button>
    </div>
  );
};

export default SaveCancelButton;
