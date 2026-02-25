import React, { forwardRef, useState, useEffect } from 'react';

const IDCardTemplate = forwardRef(({ student, hodSignature, principalSignature, base64Bg, base64Emblem, base64BloodGroup }, ref) => {
    // --- STYLES (Inline for seamless SVG export) ---
    const styles = {
        card: {
            width: '380px',
            height: '615px', // 55mm : 89mm Aspect Ratio (~0.618)
            backgroundColor: 'white',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Roboto Condensed', 'Arial Narrow', Arial, sans-serif",
            boxSizing: 'border-box',
            border: '2px solid #90EE90' // Light green border
        },
        // Font loading for SVG export
        fontStyle: `
            /* Oswald & Roboto Condensed are bundled locally via fonts.css */
            .id-card-text { font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; }
        `,
        bgImg: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
        },
        header: {
            backgroundColor: '#2e1f5e',
            color: 'white',
            textAlign: 'center',
            padding: '15px 10px 15px 10px', // Increased bottom padding
            borderBottom: '2px solid black',
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
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.5px'
        },
        emblem: {
            width: '50px',
            height: 'auto'
        },
        deptName: {
            fontSize: '18px',
            fontWeight: 400,
            marginTop: '5px',
            letterSpacing: '1.5px'
        },
        collegeName: {
            color: '#fffa00',
            fontSize: '18px',
            fontWeight: 400, // Regular (Thicker than 300)
            fontFamily: "'Oswald', sans-serif",
            marginTop: '2px',
            letterSpacing: '3px', // Increased spacing
            textTransform: 'uppercase',
            lineHeight: 1,
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
            alignItems: 'center',
            marginTop: '10px',
            marginBottom: '10px',
            position: 'relative' // For potential absolute positioning if needed, but using flex gap
        },
        photoBox: {
            width: '130px',
            height: '160px',
            border: '2px solid black',
            backgroundColor: 'rgba(248, 248, 248, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#888',
            fontSize: '13px',
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
            fontSize: '18px',
            fontWeight: 700,
            color: '#2e1f5e',
            verticalAlign: 'top'
        },
        tdColon: {
            width: '15px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 700,
            color: '#2e1f5e',
            verticalAlign: 'top'
        },
        tdValue: {
            fontSize: '18px',
            fontWeight: 700,
            color: 'black',
            verticalAlign: 'top'
        },
        classOptions: {
            fontSize: '18px',
            letterSpacing: '1px',
            fontWeight: 700,
            color: 'black',
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
            fontSize: '14px',
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
    const [base64Profile, setBase64Profile] = useState(null);

    useEffect(() => {
        const convertToBase64 = async (url, setter) => {
            if (!url) return;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to load ${url} `);
                const blob = await res.blob();
                const reader = new FileReader();
                reader.onloadend = () => setter(reader.result);
                reader.readAsDataURL(blob);
            } catch (e) {
                console.error("Image Load Error:", e);
                setter(null);
            }
        };

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
                return `20${yearShort} `;
            }
        }
        return student.admission_year || '';
    };

    // Helper: Title Case
    const toTitleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
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
                {/* Photo & Blood Group */}
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
                            <td style={styles.tdValue}>{toTitleCase(student.full_name)}</td>
                        </tr>
                        <tr>
                            <td style={styles.tdLabel}>F. Name</td>
                            <td style={styles.tdColon}>:</td>
                            <td style={styles.tdValue}>{toTitleCase(student.father_name)}</td>
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
