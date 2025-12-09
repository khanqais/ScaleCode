'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

type BGVariantType = 'dots' | 'diagonal-stripes' | 'grid' | 'horizontal-lines' | 'vertical-lines' | 'checkerboard';
type BGMaskType =
	| 'fade-center'
	| 'fade-edges'
	| 'fade-top'
	| 'fade-bottom'
	| 'fade-left'
	| 'fade-right'
	| 'fade-x'
	| 'fade-y'
	| 'none';

type BGPatternProps = React.ComponentProps<'div'> & {
	variant?: BGVariantType;
	mask?: BGMaskType;
	size?: number;
	fill?: string;
};

const maskClasses: Record<BGMaskType, string> = {
	'fade-edges': '[mask-image:radial-gradient(ellipse_at_center,var(--background),transparent)]',
	'fade-center': '[mask-image:radial-gradient(ellipse_at_center,transparent,var(--background))]',
	'fade-top': '[mask-image:linear-gradient(to_bottom,transparent,var(--background))]',
	'fade-bottom': '[mask-image:linear-gradient(to_bottom,var(--background),transparent)]',
	'fade-left': '[mask-image:linear-gradient(to_right,transparent,var(--background))]',
	'fade-right': '[mask-image:linear-gradient(to_right,var(--background),transparent)]',
	'fade-x': '[mask-image:linear-gradient(to_right,transparent,var(--background),transparent)]',
	'fade-y': '[mask-image:linear-gradient(to_bottom,transparent,var(--background),transparent)]',
	none: '',
};

function geBgImage(variant: BGVariantType, fill: string, size: number) {
	switch (variant) {
		case 'dots':
			return `radial-gradient(${fill} 1px, transparent 1px)`;
		case 'grid':
			return `linear-gradient(to right, ${fill} 1px, transparent 1px), linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
		case 'diagonal-stripes':
			return `repeating-linear-gradient(45deg, ${fill}, ${fill} 1px, transparent 1px, transparent ${size}px)`;
		case 'horizontal-lines':
			return `linear-gradient(to bottom, ${fill} 1px, transparent 1px)`;
		case 'vertical-lines':
			return `linear-gradient(to right, ${fill} 1px, transparent 1px)`;
		case 'checkerboard':
			return `linear-gradient(45deg, ${fill} 25%, transparent 25%), linear-gradient(-45deg, ${fill} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${fill} 75%), linear-gradient(-45deg, transparent 75%, ${fill} 75%)`;
		default:
			return undefined;
	}
}

const BGPattern = ({
	variant = 'grid',
	mask = 'none',
	size = 24,
	fill = '#252525',
	className,
	style,
	...props
}: BGPatternProps) => {
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const bgSize = `${size}px ${size}px`;
	
	// Use light gray with low opacity for light theme, dark gray for dark theme
	const patternFill = theme === 'light' ? 'rgba(200, 200, 200, 0.4)' : fill;
	const backgroundImage = geBgImage(variant, patternFill, size);
	const bgColor = theme === 'light' ? '#ffffff' : '#000000';

	return (
		<div
			className={cn(className)}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 0,
				pointerEvents: 'none',
				backgroundImage,
				backgroundSize: bgSize,
				backgroundColor: bgColor,
				...style,
			}}
			{...props}
		/>
	);
};

BGPattern.displayName = 'BGPattern';
export { BGPattern };
