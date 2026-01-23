import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const GlassEditor = ({ value, onChange, placeholder }) => {
    const editorRef = useRef(null);

    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
    };

    // Sync external value changes to editor content if not focused (prevent cursor jumps)
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            // Only update if the content is truly different (e.g. cleared by parent)
            // This prevents overwriting the DOM while the user is typing, which causes cursor reset.
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div style={{
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255,255,255,0.02)',
            height: '100%'
        }}>
            {/* Toolbar */}
            <div style={{
                padding: '8px',
                background: 'rgba(255,255,255,0.05)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
            }}>
                <ToolbarBtn icon={Bold} onClick={() => applyFormat('bold')} />
                <ToolbarBtn icon={Italic} onClick={() => applyFormat('italic')} />
                <ToolbarBtn icon={Underline} onClick={() => applyFormat('underline')} />
                <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 4px' }} />
                <ToolbarBtn icon={List} onClick={() => applyFormat('insertUnorderedList')} />
                <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 4px' }} />
                <ToolbarBtn icon={AlignLeft} onClick={() => applyFormat('justifyLeft')} />
                <ToolbarBtn icon={AlignCenter} onClick={() => applyFormat('justifyCenter')} />
                <ToolbarBtn icon={AlignRight} onClick={() => applyFormat('justifyRight')} />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                style={{
                    flex: 1,
                    padding: '15px',
                    outline: 'none',
                    overflowY: 'auto',
                    color: 'var(--text-primary)',
                    minHeight: '150px'
                }}
                className="glass-editor-content"
            />

            <style jsx>{`
                .glass-editor-content:empty:before {
                    content: '${placeholder || "Type here..."}';
                    color: rgba(255,255,255,0.3);
                    pointer-events: none;
                }
                .glass-editor-content ul {
                    margin-left: 20px;
                }
            `}</style>
        </div>
    );
};

const ToolbarBtn = ({ icon: Icon, onClick }) => (
    <button
        type="button"
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className="icon-btn-sm hover-glass"
        style={{
            padding: '6px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
    >
        <Icon size={16} />
    </button>
);

export default GlassEditor;
