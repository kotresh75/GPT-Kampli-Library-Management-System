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
  !define MUI_WELCOMEPAGE_TITLE "Welcome to the GPTK Library Manager Setup"
  !define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of GPTK Library Manager.$\r$\n$\r$\nDeveloped by:$\r$\nCSE Department$\r$\nBatch 2023-2026$\r$\n$\r$\nIt is recommended that you close all other applications before starting Setup.$\r$\n$\r$\nClick Next to continue."
  
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customHeader
!macroend

; ============================================================================
; CUSTOM UNINSTALL BEHAVIOR
; ============================================================================
!macro customUnInstall
  MessageBox MB_YESNO "Do you also want to delete all LOCAL application data? (Database, Settings, Logs, Local Backups)$\r$\n$\r$\nThis will NOT delete your Cloud Backups.$\r$\nThis action cannot be undone." IDYES true IDNO false
  true:
    ; Clean up AppData for Product Name
    RMDir /r "$APPDATA\GPTK Library Manager"
    ; Clean up AppData for Package Name (safety net)
    RMDir /r "$APPDATA\gptk-library-management-system"
  false:
!macroend
