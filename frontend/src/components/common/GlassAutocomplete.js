import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Search, Loader, X, ChevronDown } from 'lucide-react';

const GlassAutocomplete = ({
    placeholder,
    onSearch, // async (query) => returns list
    onSelect, // (item) => void
    renderItem, // (item) => ReactNode
    onEnterRaw, // (value) => void (For barcode quick submit)
    autoFocus = false,
    value = '', // controlled value (optional)
    onChange, // (val) => void (optional)
    wrapperStyle = {},
    icon: Icon = Search // Default to Search if no icon provided
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const dropdownRef = useRef(null);

    // Debounce Search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (inputValue.trim().length > 1 && showSuggestions) {
                setLoading(true);
                try {
                    const results = await onSearch(inputValue);
                    setSuggestions(results || []);
                } catch (e) {
                    console.error("Search error", e);
                } finally {
                    setLoading(false);
                }
            } else if (inputValue.trim().length <= 1) {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [inputValue, onSearch, showSuggestions]);

    // Handle Outside Click
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isInsideWrapper = wrapperRef.current && wrapperRef.current.contains(event.target);
            const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);

            if (!isInsideWrapper && !isInsideDropdown) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync with controlled prop if provided
    useEffect(() => {
        if (value !== undefined && value !== inputValue && value !== null) {
            setInputValue(value);
        } else if (value === '') {
            setInputValue('');
        }
    }, [value]);

    // Handle auto-focus updates
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        if (onChange) onChange(val);
        setShowSuggestions(true);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // 1. If item selected from list
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                handleSelect(suggestions[highlightedIndex]);
            }
            // 2. Auto-select first item if list is visible and has items, but none highlighted
            else if (suggestions.length > 0) {
                handleSelect(suggestions[0]);
            }
            // 3. Fallback: Raw Enter (Barcode scan) - ONLY if list is empty
            else {
                if (onEnterRaw) {
                    onEnterRaw(inputValue);
                    setShowSuggestions(false);
                    setSuggestions([]);
                }
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Portal Position Logic
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const updatePosition = () => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        if (showSuggestions) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [showSuggestions]);

    const handleSelect = (item) => {
        // Decide what to do with input value? 
        // We leave it to parent to clear via props if needed.
        onSelect(item);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const dropdownContent = (
        <div
            ref={dropdownRef}
            className="glass-dropdown-menu"
            style={{
                position: 'absolute',
                top: position.top + 8,
                left: position.left,
                width: position.width,
                zIndex: 99999, // Ensure it's on top of everything
                maxHeight: '240px',
                overflowY: 'auto'
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss on scroll click
        >
            {loading ? (
                <div className="p-4 text-center text-gray-400 flex items-center justify-center gap-2 dropdown-empty">
                    <Loader size={16} className="animate-spin" /> Searching...
                </div>
            ) : suggestions.length > 0 ? (
                <div className="flex flex-col">
                    {suggestions.map((item, index) => (
                        <div
                            key={index}
                            className={`dropdown-option ${index === highlightedIndex ? 'selected' : ''}`}
                            onClick={() => handleSelect(item)}
                        >
                            {renderItem ? renderItem(item) : (
                                <span>{item.label || JSON.stringify(item)}</span>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="dropdown-empty">
                    Press Enter to use "{inputValue}" directly
                </div>
            )}
        </div>
    );

    return (
        <div className={`relative w-full ${wrapperStyle.className || ''}`} ref={wrapperRef} style={wrapperStyle.style || wrapperStyle}>
            {/* Use the exact class that matches Catalog Search style from CSS */}
            <div className="glass-search-input group">
                <Icon size={20} className="group-focus-within:text-blue-400 transition-colors" />
                <input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(inputValue.length > 0)}
                    autoFocus={autoFocus}
                />

                {inputValue ? (
                    <button
                        className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-2"
                        onClick={() => { setInputValue(''); if (onChange) onChange(''); inputRef.current?.focus(); }}
                    >
                        <X size={16} />
                    </button>
                ) : (
                    <ChevronDown size={16} className="text-gray-500 ml-2" />
                )}
            </div>

            {/* Portal Suggestions */}
            {showSuggestions && (inputValue.length > 1) && ReactDOM.createPortal(dropdownContent, document.body)}
        </div>
    );
};

export default GlassAutocomplete;
