!include "MUI2.nsh"

; ============================================================================
; UI SETTINGS
; ============================================================================
; We intentionally DO NOT define the image paths here.
; They are defined in package.json, so electron-builder will set the variables.
; We only set the flags to modify behavior.

!define MUI_HEADERIMAGE_BITMAP_NOSTRETCH
!define MUI_WELCOMEFINISHPAGE_BITMAP_NOSTRETCH
!define MUI_UNWELCOMEFINISHPAGE_BITMAP_NOSTRETCH

; ============================================================================
; CUSTOM PAGES
; ============================================================================

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to GPTK Library Manager"
  !define MUI_WELCOMEPAGE_TEXT "Government Polytechnic, Kampli$\r$\nGPT Kampli Library Management System$\r$\n$\r$\n$\"A library is not a luxury but one of the necessities of life.$\"$\r$\n$\"ಗ್ರಂಥಾಲಯವು ಜ್ಞಾನದ ದೇವಾಲಯ$\"$\r$\n$\r$\nThis wizard will install the GPTK Library Management System on your computer. It is recommended to close all other applications before continuing.$\r$\n$\r$\nDeveloped by: CSE Department, Batch 2023-2026$\r$\nClick Next to continue."
  
  ; Insert the page. Electron-builder handles the images defined in package.json.
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customHeader
!macroend
