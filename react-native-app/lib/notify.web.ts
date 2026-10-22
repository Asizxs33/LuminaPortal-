import { toast } from 'sonner';

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message, { duration: 6500 }),
  info: (message: string) => toast.info(message),
};
