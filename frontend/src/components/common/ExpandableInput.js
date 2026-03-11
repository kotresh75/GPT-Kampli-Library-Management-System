import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * ExpandableInput - Excel-like input that expands on focus to fit content.
 * 
 * On focus: width grows to match text (min: cell width, max: 400px).
 * On blur:  width shrinks back to 100% (normal column size).
 * 
 * Props: same as <input> (value, onChange, onBlur, className, type, style, etc.)
 */
const ExpandableInput = ({ value, onChange, onBlur, className, type, style, ...rest }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [expandedWidth, setExpandedWidth] = useState(null);
    const measurerRef = useRef(null);
    const inputRef = useRef(null);

    // Measure text width whenever value changes while focused
    const measureText = useCallback(() => {
        if (measurerRef.current) {
            const textWidth = measurerRef.current.scrollWidth + 24; // +24 for padding
            const minWidth = inputRef.current ? inputRef.current.parentElement.offsetWidth : 120;
            const clampedWidth = Math.max(minWidth, Math.min(textWidth, 400));
            setExpandedWidth(clampedWidth);
        }
    }, []);

    useEffect(() => {
        if (isFocused) {
            measureText();
        }
    }, [value, isFocused, measureText]);

    const handleFocus = (e) => {
        setIsFocused(true);
        // Measure after a tick so the measurer has the latest value
        setTimeout(measureText, 0);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        setExpandedWidth(null);
        if (onBlur) onBlur(e);
    };

    return (
        <div className={`expandable-cell ${isFocused ? 'expanded' : ''}`}>
            <input
                ref={inputRef}
                type={type || 'text'}
                className={className}
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                    ...style,
                    width: isFocused && expandedWidth ? `${expandedWidth}px` : '100%',
                }}
                {...rest}
            />
            {/* Hidden measurer span — mirrors input text to calculate width */}
            <span
                ref={measurerRef}
                className="expandable-cell-measurer"
                aria-hidden="true"
            >
                {value || ''}
            </span>
        </div>
    );
};

export default ExpandableInput;
