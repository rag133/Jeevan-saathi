import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useKaryStore } from '~/modules/kary/karyStore';
import { useDainandiniStore } from '~/modules/dainandini/dainandiniStore';
import { useAbhyasaStore } from '~/modules/abhyasa/abhyasaStore';

const useRootStore = create(devtools((set, get) => ({
  ...useKaryStore.getState(),
  ...useDainandiniStore.getState(),
  ...useAbhyasaStore.getState(),
})));

export default useRootStore;