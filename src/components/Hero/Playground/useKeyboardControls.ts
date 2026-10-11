'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface CarControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  reset: boolean;
}

const INITIAL_CONTROLS: CarControls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  brake: false,
  reset: false
};

export function useKeyboardControls(enabled: boolean = true) {
  const [controls, setControls] = useState<CarControls>(INITIAL_CONTROLS);
  const controlsRef = useRef<CarControls>(INITIAL_CONTROLS);

  // Sync ref
  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  // Handle keydown / keyup
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setControls(INITIAL_CONTROLS);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in inputs
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      // Prevent scrolling when using arrow keys or space in playground zone
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) &&
        window.scrollY < 400
      ) {
        e.preventDefault();
      }

      let updatedKey: keyof CarControls | null = null;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          updatedKey = 'forward';
          break;
        case 'KeyS':
        case 'ArrowDown':
          updatedKey = 'backward';
          break;
        case 'KeyA':
        case 'ArrowLeft':
          updatedKey = 'left';
          break;
        case 'KeyD':
        case 'ArrowRight':
          updatedKey = 'right';
          break;
        case 'Space':
          updatedKey = 'brake';
          break;
        case 'KeyR':
          updatedKey = 'reset';
          break;
        default:
          break;
      }

      if (updatedKey && !controlsRef.current[updatedKey]) {
        setControls((prev) => ({ ...prev, [updatedKey!]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let updatedKey: keyof CarControls | null = null;
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          updatedKey = 'forward';
          break;
        case 'KeyS':
        case 'ArrowDown':
          updatedKey = 'backward';
          break;
        case 'KeyA':
        case 'ArrowLeft':
          updatedKey = 'left';
          break;
        case 'KeyD':
        case 'ArrowRight':
          updatedKey = 'right';
          break;
        case 'Space':
          updatedKey = 'brake';
          break;
        case 'KeyR':
          updatedKey = 'reset';
          break;
        default:
          break;
      }

      if (updatedKey) {
        setControls((prev) => ({ ...prev, [updatedKey!]: false }));
      }
    };

    const handleBlur = () => {
      setControls(INITIAL_CONTROLS);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled]);

  // Programmatic control for touch/mobile UI
  const setControlState = useCallback((key: keyof CarControls, value: boolean) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  }, []);

  const triggerReset = useCallback(() => {
    setControls((prev) => ({ ...prev, reset: true }));
    setTimeout(() => {
      setControls((prev) => ({ ...prev, reset: false }));
    }, 100);
  }, []);

  return {
    controls,
    setControlState,
    triggerReset
  };
}
