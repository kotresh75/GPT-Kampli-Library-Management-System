!include "MUI2.nsh"

; ============================================================================
; ASSET CONFIGURATION
; ============================================================================
!define MUI_HEADERIMAGE_BITMAP_NOSTRETCH
!define MUI_WELCOMEFINISHPAGE_BITMAP_NOSTRETCH
!define MUI_UNWELCOMEFINISHPAGE_BITMAP_NOSTRETCH

; ============================================================================
; CUSTOM PAGES — Welcome page with skip-if-updated
; ============================================================================
; During updates: Welcome page is skipped. Directory page is auto-skipped by
; electron-builder's assistedInstaller.nsh template.

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to GPTK Library Manager"
  !define MUI_WELCOMEPAGE_TEXT "Government Polytechnic, Kampli$\r$\nGPT Kampli Library Management System$\r$\n$\r$\n$\"A library is not a luxury but one of the necessities of life.$\"$\r$\n$\"ಗ್ರಂಥಾಲಯವು ಜ್ಞಾನದ ದೇವಾಲಯ$\" (The library is a temple of knowledge)$\r$\n$\r$\nThis wizard will install the GPTK Library Management System on your computer. It is recommended to close all other applications before continuing.$\r$\n$\r$\nDeveloped by: CSE Department, Batch 2023-2026$\r$\nClick Next to continue."
  
  ; Skip welcome page during updates
  !define WelcomeUID ${__LINE__}
  Function skipWelcomeIfUpdated_${WelcomeUID}
    ${if} ${isUpdated}
      Abort
    ${endif}
  FunctionEnd
  !define MUI_PAGE_CUSTOMFUNCTION_PRE skipWelcomeIfUpdated_${WelcomeUID}
  !undef WelcomeUID
  
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customHeader
!macroend

; ============================================================================
; CHANGE HEADER TEXT TO "UPDATING" DURING UPDATES
; ============================================================================
; customPageAfterChangeDir is inserted by assistedInstaller.nsh right before
; MUI_PAGE_INSTFILES. Defining MUI_PAGE_CUSTOMFUNCTION_SHOW here applies to
; the instfiles page.

!macro customPageAfterChangeDir
  !define InstShowUID ${__LINE__}
  Function instFilesShowIfUpdate_${InstShowUID}
    ${if} ${isUpdated}
      !insertmacro MUI_HEADER_TEXT "Updating GPTK Library Manager" "Please wait while the update is being installed..."
      ; Also update the bottom branding text
      FindWindow $0 "#32770" "" $HWNDPARENT
      GetDlgItem $0 $HWNDPARENT 1028
      SendMessage $0 ${WM_SETTEXT} 0 "STR:Updating ${PRODUCT_NAME} ${VERSION}"
    ${endif}
  FunctionEnd
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW instFilesShowIfUpdate_${InstShowUID}
  !undef InstShowUID
!macroend

; ============================================================================
; SKIP INSTALL MODE PAGE DURING UPDATES
; ============================================================================
; The multiUserUi.nsh template checks for this macro. Setting
; $isForceMachineInstall or $isForceCurrentInstall to "1" skips the page.

!macro customInstallMode
  ${if} ${isUpdated}
    ${if} $hasPerMachineInstallation == "1"
      StrCpy $isForceMachineInstall "1"
    ${else}
      StrCpy $isForceCurrentInstall "1"
    ${endif}
  ${endif}
!macroend

; ============================================================================
; CUSTOM UNINSTALL BEHAVIOR
; ============================================================================
!macro customUnInstall
  ; Skip data deletion prompt during silent uninstall (auto-updates use /S flag for uninstall)
  IfSilent false
  MessageBox MB_YESNO "Do you also want to delete all LOCAL application data?$\r$\n(ನೀವು ಎಲ್ಲ ಸ್ಥಳೀಯ ಅಪ್ಲಿಕೇಶನ್ ಡೇಟಾವನ್ನೂ ಅಳಿಸಲು ಬಯಸುವಿರಾ?)$\r$\n$\r$\nThis includes: Database, Settings, Logs, Local Backups$\r$\nThis will NOT delete your Cloud Backups.$\r$\nThis action cannot be undone." IDYES true IDNO false
  true:
    ; Clean up AppData for Product Name
    RMDir /r "$APPDATA\GPTK Library Manager"
    ; Clean up AppData for Package Name (safety net)
    RMDir /r "$APPDATA\gptk-library-management-system"
  false:
!macroend
