import { createPinia } from 'pinia';

// Import stores
import { useUserStore } from './user';
import { useBookStore } from './book';
import { useBorrowStore } from './borrow';

const pinia = createPinia();

export { 
  pinia, 
  useUserStore, 
  useBookStore, 
  useBorrowStore 
}; 