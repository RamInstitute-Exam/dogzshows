declare module 'react-pageflip' {
  import * as React from 'react';

  export interface FlipBookProps {
    ref?: any;
    width: number;
    height: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startPage?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
    onFlip?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: 'portrait' | 'landscape' }) => void;
    onChangeState?: (e: { data: 'user_fold' | 'fold_corner' | 'flipping' | 'read' }) => void;
  }

  const HTMLFlipBook: React.ComponentType<FlipBookProps>;
  export default HTMLFlipBook;
}
