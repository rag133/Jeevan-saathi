import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useKaryStore } from '../stores/karyStore';
import { useDainandiniStore } from '../stores/dainandiniStore';
import { useAbhyasaStore } from '../stores/abhyasaStore';

const useRootStore = create(devtools((set, get) => ({
  ...useKaryStore.getState(),
  ...useDainandiniStore.getState(),
  ...useAbhyasaStore.getState(),
})));

export default useRootStore;