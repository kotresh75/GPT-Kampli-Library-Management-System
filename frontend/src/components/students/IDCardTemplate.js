import React, { forwardRef, useState, useEffect } from 'react';
import cardBgUrl from '../../ID Template/id_bg.png';
import emblemBgUrl from '../../ID Template/karnataka_seal.png';

const IDCardTemplate = forwardRef(({ student, hodSignature, principalSignature }, ref) => {
    // --- STYLES (Inline for seamless SVG export) ---
    const styles = {
        card: {
            width: '380px',
            height: '603px', // 29:46 Aspect Ratio
            backgroundColor: 'white',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Roboto Condensed', 'Arial Narrow', Arial, sans-serif",
            boxSizing: 'border-box'
        },
        // Font loading for SVG export - REMOVED EXTERNAL LOAD TO PREVENT TAINT
        fontStyle: `
            .id-card-text { font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; }
        `,
        bgImg: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0 // Ensure it stays at the bottom
        },
        header: {
            backgroundColor: '#2e1f5e',
            color: 'white',
            textAlign: 'center',
            padding: '15px 10px 10px 10px',
            borderBottom: '2px solid black', // Changed from green to thin black
            position: 'relative',
            zIndex: 2
        },
        topRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '5px'
        },
        topText: {
            fontSize: '16px', // Reduced from 21px
            fontWeight: 700,
            letterSpacing: '0.5px'
        },
        emblem: {
            width: '50px',
            height: 'auto'
        },
        deptName: {
            fontSize: '17px', // Increased from 15px
            fontWeight: 400,
            marginTop: '5px',
            letterSpacing: '1.5px'
        },
        collegeName: {
            color: '#fffa00',
            fontSize: '14px',
            fontWeight: 900,
            marginTop: '5px',
            textTransform: 'uppercase',
            lineHeight: 1.2,
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            whiteSpace: 'nowrap'
        },
        content: {
            flex: 1,
            padding: '10px 25px 10px 25px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1
        },
        photoWrapper: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
            marginBottom: '10px'
        },
        photoBox: {
            width: '120px',
            height: '150px',
            border: '2px solid black', // Added distinct border
            backgroundColor: 'rgba(248, 248, 248, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#888',
            fontSize: '11px',
            overflow: 'hidden'
        },
        photoIcon: {
            fontSize: '24px',
            marginBottom: '5px',
            opacity: 0.5
        },
        img: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 3px'
        },
        tdLabel: {
            width: '100px',
            whiteSpace: 'nowrap',
            fontSize: '17px',
            fontWeight: 700,
            color: '#2e1f5e',
            verticalAlign: 'top'
        },
        tdColon: {
            width: '15px',
            textAlign: 'center',
            fontSize: '17px',
            fontWeight: 700,
            color: '#2e1f5e',
            verticalAlign: 'top'
        },
        tdValue: {
            fontSize: '17px',
            fontWeight: 700,
            color: '#2e1f5e',
            verticalAlign: 'top'
        },
        classOptions: {
            fontSize: '17px',
            letterSpacing: '1px',
            fontWeight: 700,
            color: '#2e1f5e',
            verticalAlign: 'top'
        },
        signatures: {
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '15px',
            paddingBottom: '8px'
        },
        signBox: {
            textAlign: 'center',
            width: '110px'
        },
        signPlaceholder: {
            height: '50px',
            width: '100%',
            marginBottom: '0px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
        },
        signLabel: {
            fontSize: '12px',
            fontWeight: 700,
            color: '#2e1f5e',
            position: 'relative',
            top: '-10px',
            display: 'inline-block',
            width: '100%'
        },
        signImage: {
            maxWidth: '100%',
            maxHeight: '40px',
            objectFit: 'contain'
        }
    };

    // Helper: Convert URL to Base64 for safe Export
    const [base64Bg, setBase64Bg] = useState(null);
    const [base64Profile, setBase64Profile] = useState(null);
    const [base64Emblem, setBase64Emblem] = useState(null);

    useEffect(() => {
        const convertToBase64 = async (url, setter) => {
            if (!url) return;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to load ${url}`);
                const blob = await res.blob();
                const reader = new FileReader();
                reader.onloadend = () => setter(reader.result);
                reader.readAsDataURL(blob);
            } catch (e) {
                console.error("Image Load Error:", e);
                // STRICT MODE: Do NOT fallback to URL. Leave as null to prevent crash.
                setter(null);
            }
        };

        // Convert BG
        convertToBase64(cardBgUrl, setBase64Bg);

        // Convert Emblem
        convertToBase64(emblemBgUrl, setBase64Emblem);

        // Convert Profile
        if (student.profile_image) {
            convertToBase64(student.profile_image, setBase64Profile);
        } else {
            setBase64Profile(null);
        }
    }, [student.profile_image]);

    // Helper to derive Admission Year from Register Number (e.g., 172CS23021 -> 2023)
    const getAdmissionYear = () => {
        if (student.register_number && student.register_number.length >= 7) {
            const yearShort = student.register_number.substring(5, 7);
            // Simple validation to check if it's a number
            if (!isNaN(yearShort)) {
                return `20${yearShort}`;
            }
        }
        return student.admission_year || '';
    };

    return (
        <div ref={ref} style={styles.card}>

            {/* Inject Styles for Export */}
            <style>
                {styles.fontStyle}
                {`* { box-sizing: border-box; margin: 0; padding: 0; }`}
            </style>

            {/* Background Image - Only render if Base64 loaded to prevent Taint */}
            {base64Bg && <img
                src={base64Bg}
                alt="Background"
                style={styles.bgImg}
            />}

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.topRow}>
                    <span style={styles.topText}>Govt. of</span>
                    {base64Emblem && <img
                        src={base64Emblem}
                        alt="Emblem"
                        style={styles.emblem}
                    />}
                    <span style={styles.topText}>Karnataka</span>
                </div>
                <div style={styles.deptName}>Dept. of Collegiate & Technical Education</div>
                <div style={styles.collegeName}>GOVERNMENT POLYTECHNIC, KAMPLI.</div>
            </div>

            {/* Content */}
            <div style={styles.content}>
                {/* Photo */}
                <div style={styles.photoWrapper}>
                    <div style={styles.photoBox}>
                        {base64Profile ? (
                            <img src={base64Profile} alt="Student" style={styles.img} crossOrigin="anonymous" />
                        ) : (
                            <>
                                <span style={styles.photoIcon}>📷</span>
                                <span>{student.profile_image ? 'LOADING...' : 'PASTE PHOTO'}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Details */}
                <table style={styles.table}>
                    <tbody>
                        <tr>
                            <td style={styles.tdLabel}>Name</td>
                            <td style={styles.tdColon}>:</td>
                            <td style={styles.tdValue}>{student.full_name?.toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style={styles.tdLabel}>F. Name</td>
                            <td style={styles.tdColon}>:</td>
                            <td style={styles.tdValue}>{student.father_name?.toUpperCase() || ''}</td>
                        </tr>
                        <tr>
                            <td style={styles.tdLabel}>Adm. Year</td>
                            <td style={styles.tdColon}>:</td>
                            <td style={styles.tdValue}>{getAdmissionYear()}</td>
                        </tr>
                        <tr>
                            <td style={styles.tdLabel}>Reg No.</td>
                            <td style={styles.tdColon}>:</td>
                            <td style={styles.tdValue}>{student.register_number}</td>
                        </tr>
                        <tr>
                            <td style={styles.tdLabel}>Class</td>
                            <td style={styles.tdColon}>:</td>
                            <td style={styles.classOptions}>I / II / III / IV / V / VI</td>
                        </tr>
                        <tr>
                            <td style={styles.tdLabel}>Branch</td>
                            <td style={styles.tdColon}>:</td>
                            <td style={styles.tdValue}>{(student.department_code || 'CS').toUpperCase()}</td>
                        </tr>
                        <tr>
                            <td style={styles.tdLabel}>Cell No.</td>
                            <td style={styles.tdColon}>:</td>
                            <td style={styles.tdValue}>{student.phone}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div style={styles.signatures}>
                    <div style={styles.signBox}>
                        <div style={styles.signPlaceholder}>
                            {hodSignature && (
                                <img src={hodSignature} alt="HOD Signature" style={styles.signImage} />
                            )}
                        </div>
                        <div style={styles.signLabel}>HOD</div>
                    </div>
                    <div style={styles.signBox}>
                        <div style={styles.signPlaceholder}>
                            {principalSignature && (
                                <img src={principalSignature} alt="Principal Signature" style={styles.signImage} />
                            )}
                        </div>
                        <div style={styles.signLabel}>Principal</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default IDCardTemplate;
