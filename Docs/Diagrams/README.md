# Diagram Files - Conversion Guide

## Date: 31/01/2026
## Time: 18:25 IST

---

## Files Created

All Mermaid diagrams have been extracted to separate `.mmd` files in this directory:

### Main Chapter Diagrams (7 files):
1. `Figure_1_1_System_Context.mmd` - System Context Diagram
2. `Figure_1_2_System_Architecture.mmd` - High-Level System Architecture
3. `Figure_1_3_Use_Case_Overview.mmd` - Use Case Overview Diagram
4. `Figure_2_1_WBS.mmd` - Work Breakdown Structure Diagram
5. `Figure_3_1_Use_Case_Admin_Staff.mmd` - Use Case Diagram for Admin and Staff
6. `Figure_3_2_Book_Issue_Workflow.mmd` - Book Issue Workflow
7. `Figure_3_3_Book_Return_Workflow.mmd` - Book Return and Fine Calculation Workflow

---

## How to Convert to PNG Images

### **Option 1: Using Mermaid Live Editor (Recommended)**

1. Go to https://mermaid.live/
2. Open each `.mmd` file in a text editor
3. Copy the entire content
4. Paste into Mermaid Live Editor
5. Click "Download PNG" button
6. Save with the same filename (e.g., `Figure_1_1_System_Context.png`)

### **Option 2: Using VS Code Extension**

1. Install "Markdown Preview Mermaid Support" extension in VS Code
2. Create a markdown file with:
   ```markdown
   ```mermaid
   [paste diagram code here]
   ```
   ```
3. Right-click on the preview → "Copy Image"
4. Paste into Paint/Photoshop and save as PNG

### **Option 3: Using Mermaid CLI (Command Line)**

```powershell
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Convert all diagrams to PNG
mmdc -i Figure_1_1_System_Context.mmd -o Figure_1_1_System_Context.png
mmdc -i Figure_1_2_System_Architecture.mmd -o Figure_1_2_System_Architecture.png
mmdc -i Figure_1_3_Use_Case_Overview.mmd -o Figure_1_3_Use_Case_Overview.png
mmdc -i Figure_2_1_WBS.mmd -o Figure_2_1_WBS.png
mmdc -i Figure_3_1_Use_Case_Admin_Staff.mmd -o Figure_3_1_Use_Case_Admin_Staff.png
mmdc -i Figure_3_2_Book_Issue_Workflow.mmd -o Figure_3_2_Book_Issue_Workflow.png
mmdc -i Figure_3_3_Book_Return_Workflow.mmd -o Figure_3_3_Book_Return_Workflow.png
```

### **Option 4: Batch Convert All (PowerShell Script)**

Save this as `convert_all.ps1` in the Diagrams folder:

```powershell
# Get all .mmd files
$files = Get-ChildItem -Filter "*.mmd"

foreach ($file in $files) {
    $outputName = $file.BaseName + ".png"
    Write-Host "Converting $($file.Name) to $outputName..."
    mmdc -i $file.Name -o $outputName
}

Write-Host "All diagrams converted to PNG!"
```

Then run: `.\convert_all.ps1`

---

## Using PNG Images in DOCX

After converting to PNG:

1. In your Word document, go to the location where the diagram should be
2. Click Insert → Pictures → This Device
3. Select the PNG file
4. Resize as needed
5. Add caption: Right-click image → Insert Caption

---

## Notes

- **PNG format is recommended** for DOCX compatibility
- SVG may not render properly in Microsoft Word
- PNG files will be larger but have better compatibility
- Recommended PNG resolution: 1920x1080 or higher for clarity
