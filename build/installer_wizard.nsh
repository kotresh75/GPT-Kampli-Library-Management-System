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
  !define MUI_WELCOMEPAGE_TITLE "Welcome to the GPTK Library Manager Setup"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of GPTK Library Manager.$\r$\n$\r$\nDeveloped by:$\r$\nCSE Department$\r$\nBatch 2023-2026$\r$\n$\r$\nIt is recommended that you close all other applications before starting Setup.$\r$\n$\r$\nClick Next to continue."
  
  ; Insert the page. Electron-builder handles the images defined in package.json.
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customHeader
!macroend
