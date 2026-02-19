!include "MUI2.nsh"

; ============================================================================
; FINAL ASSET STRATEGY
; ============================================================================
; We have processed the correct assets from set_needed.
; We use NOSTRETCH to ensure they look perfect.

!define MUI_HEADERIMAGE_BITMAP_NOSTRETCH
!define MUI_WELCOMEFINISHPAGE_BITMAP_NOSTRETCH
!define MUI_UNWELCOMEFINISHPAGE_BITMAP_NOSTRETCH

; ============================================================================
; CUSTOM PAGES
; ============================================================================

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to GPTK Library Manager"
  !define MUI_WELCOMEPAGE_TEXT "Government Polytechnic, Kampli$\r$\nGPT Kampli Library Management System$\r$\n$\r$\n$\"A library is not a luxury but one of the necessities of life.$\"$\r$\n$\"ಗ್ರಂಥಾಲಯವು ಜ್ಞಾನದ ದೇವಾಲಯ$\" (The library is a temple of knowledge)$\r$\n$\r$\nThis wizard will install the GPTK Library Management System on your computer. It is recommended to close all other applications before continuing.$\r$\n$\r$\nDeveloped by: CSE Department, Batch 2023-2026$\r$\nClick Next to continue."
  
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customHeader
!macroend

; ============================================================================
; CUSTOM UNINSTALL BEHAVIOR
; ============================================================================
!macro customUnInstall
  MessageBox MB_YESNO "Do you also want to delete all LOCAL application data?$\r$\n(ನೀವು ಎಲ್ಲ ಸ್ಥಳೀಯ ಅಪ್ಲಿಕೇಶನ್ ಡೇಟಾವನ್ನೂ ಅಳಿಸಲು ಬಯಸುವಿರಾ?)$\r$\n$\r$\nThis includes: Database, Settings, Logs, Local Backups$\r$\nThis will NOT delete your Cloud Backups.$\r$\nThis action cannot be undone." IDYES true IDNO false
  true:
    ; Clean up AppData for Product Name
    RMDir /r "$APPDATA\GPTK Library Manager"
    ; Clean up AppData for Package Name (safety net)
    RMDir /r "$APPDATA\gptk-library-management-system"
  false:
!macroend
