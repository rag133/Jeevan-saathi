import { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions, PanResponder, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

export interface PanelLayoutState {
  isSidebarOpen: boolean;
  isDetailOpen: boolean;
  sidebarWidth: number;
  detailWidth: number;
  listWidth: number;
}

export interface PanelLayoutActions {
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  openDetail: () => void;
  closeDetail: () => void;
  toggleDetail: () => void;
  setSidebarWidth: (width: number) => void;
  setDetailWidth: (width: number) => void;
  resetLayout: () => void;
}

export const usePanelLayout = (): {
  panelStates: {
    sidebar: { width: number; isOpen: boolean };
    tasks: { width: number; isOpen: boolean };
    details: { width: number; isOpen: boolean };
  };
  togglePanel: (panelName: 'sidebar' | 'details') => void;
  resizePanel: (panelName: 'sidebar' | 'details', width: number) => void;
  resetLayout: () => void;
  getPanelWidth: (panelName: 'sidebar' | 'tasks' | 'details') => number;
  isPanelCollapsed: (panelName: 'sidebar' | 'details') => boolean;
  expandPanel: (panelName: 'sidebar' | 'details') => void;
  collapsePanel: (panelName: 'sidebar' | 'details') => void;
  getPanelDisplayInfo: (panelName: 'sidebar' | 'details') => { width: number; isVisible: boolean };
} => {
  const [state, setState] = useState<PanelLayoutState>({
    isSidebarOpen: false,
    isDetailOpen: false,
    sidebarWidth: screenWidth * 0.85,
    detailWidth: screenWidth * 0.85,
    listWidth: screenWidth,
  });

  // Animation values
  const sidebarAnim = useRef(new Animated.Value(-state.sidebarWidth)).current;
  const detailAnim = useRef(new Animated.Value(screenWidth)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderGrant: () => {
        // Provide haptic feedback when gesture starts
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        
        // Handle sidebar swipe
        if (state.isSidebarOpen && dx < 0) {
          const newValue = Math.max(-state.sidebarWidth, dx);
          sidebarAnim.setValue(newValue);
        }
        
        // Handle detail panel swipe
        if (state.isDetailOpen && dx > 0) {
          const newValue = Math.min(state.detailWidth, dx);
          detailAnim.setValue(screenWidth - newValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        
        // Handle sidebar swipe release
        if (state.isSidebarOpen && dx < 0) {
          if (dx < -50 || vx < -0.5) {
            closeSidebar();
          } else {
            openSidebar();
          }
        }
        
        // Handle detail panel swipe release
        if (state.isDetailOpen && dx > 0) {
          if (dx > 50 || vx > 0.5) {
            closeDetail();
          } else {
            openDetail();
          }
        }
      },
    })
  ).current;

  // Update animation values when state changes
  useEffect(() => {
    if (state.isSidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: -state.sidebarWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [state.isSidebarOpen, state.sidebarWidth]);

  useEffect(() => {
    if (state.isDetailOpen) {
      Animated.timing(detailAnim, {
        toValue: screenWidth - state.detailWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(detailAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [state.isDetailOpen, state.detailWidth]);

  const openSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isSidebarOpen: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const closeSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isSidebarOpen: false }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const openDetail = useCallback(() => {
    setState(prev => ({ ...prev, isDetailOpen: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const closeDetail = useCallback(() => {
    setState(prev => ({ ...prev, isDetailOpen: false }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleDetail = useCallback(() => {
    setState(prev => ({ ...prev, isDetailOpen: !prev.isDetailOpen }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const setSidebarWidth = useCallback((width: number) => {
    setState(prev => ({ ...prev, sidebarWidth: width }));
  }, []);

  const setDetailWidth = useCallback((width: number) => {
    setState(prev => ({ ...prev, detailWidth: width }));
  }, []);

  const resetLayout = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSidebarOpen: false,
      isDetailOpen: false,
    }));
  }, []);

  // Calculate list width based on panel states
  const listWidth = state.isSidebarOpen && state.isDetailOpen
    ? screenWidth - state.sidebarWidth - state.detailWidth
    : state.isSidebarOpen
    ? screenWidth - state.sidebarWidth
    : state.isDetailOpen
    ? screenWidth - state.detailWidth
    : screenWidth;

  // Update list width when panel states change
  useEffect(() => {
    setState(prev => ({ ...prev, listWidth }));
  }, [listWidth]);



  const panelStates = {
    sidebar: { width: state.sidebarWidth, isOpen: state.isSidebarOpen },
    tasks: { width: state.listWidth, isOpen: true },
    details: { width: state.detailWidth, isOpen: state.isDetailOpen },
  };

  const togglePanel = (panelName: 'sidebar' | 'details') => {
    if (panelName === 'sidebar') {
      toggleSidebar();
    } else if (panelName === 'details') {
      toggleDetail();
    }
  };

  const resizePanel = (panelName: 'sidebar' | 'details', width: number) => {
    if (panelName === 'sidebar') {
      setSidebarWidth(width);
    } else if (panelName === 'details') {
      setDetailWidth(width);
    }
  };

  const getPanelWidth = (panelName: 'sidebar' | 'tasks' | 'details'): number => {
    switch (panelName) {
      case 'sidebar':
        return state.sidebarWidth;
      case 'tasks':
        return state.listWidth;
      case 'details':
        return state.detailWidth;
      default:
        return 0;
    }
  };

  const isPanelCollapsed = (panelName: 'sidebar' | 'details'): boolean => {
    if (panelName === 'sidebar') {
      return !state.isSidebarOpen;
    } else if (panelName === 'details') {
      return !state.isDetailOpen;
    }
    return false;
  };

  const expandPanel = (panelName: 'sidebar' | 'details') => {
    if (panelName === 'sidebar') {
      openSidebar();
    } else if (panelName === 'details') {
      openDetail();
    }
  };

  const collapsePanel = (panelName: 'sidebar' | 'details') => {
    if (panelName === 'sidebar') {
      closeSidebar();
    } else if (panelName === 'details') {
      closeDetail();
    }
  };

  const getPanelDisplayInfo = (panelName: 'sidebar' | 'details') => {
    if (panelName === 'sidebar') {
      return { width: state.sidebarWidth, isVisible: state.isSidebarOpen };
    } else if (panelName === 'details') {
      return { width: state.detailWidth, isVisible: state.isDetailOpen };
    }
    return { width: 0, isVisible: false };
  };

  return {
    panelStates,
    togglePanel,
    resizePanel,
    resetLayout,
    getPanelWidth,
    isPanelCollapsed,
    expandPanel,
    collapsePanel,
    getPanelDisplayInfo,
  };
};

// Export animation values for use in components
export const usePanelAnimations = (state: PanelLayoutState) => {
  const sidebarAnim = useRef(new Animated.Value(-state.sidebarWidth)).current;
  const detailAnim = useRef(new Animated.Value(screenWidth)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.isSidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: -state.sidebarWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [state.isSidebarOpen, state.sidebarWidth]);

  useEffect(() => {
    if (state.isDetailOpen) {
      Animated.timing(detailAnim, {
        toValue: screenWidth - state.detailWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(detailAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [state.isDetailOpen, state.detailWidth]);

  return {
    sidebarAnim,
    detailAnim,
    overlayAnim,
  };
};

// Utility functions for responsive design
export const getResponsiveWidth = (percentage: number): number => {
  return Math.min(screenWidth * percentage, 400); // Max width of 400
};

export const getResponsivePadding = (base: number): number => {
  return screenWidth < 375 ? base * 0.8 : base; // Smaller padding on small screens
};

export const getResponsiveFontSize = (base: number): number => {
  return screenWidth < 375 ? base * 0.9 : base; // Smaller font on small screens
};

// Default export for the hook
export default usePanelLayout;
