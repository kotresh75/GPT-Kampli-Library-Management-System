
Add-Type -AssemblyName System.Drawing

$sidebarSource = "F:\GPTK Library Management System\assets\set_needed\setup_sidebar.bmp"
$headerSource = "F:\GPTK Library Management System\assets\set_needed\setup_header.bmp"

$sidebarOutput = "F:\GPTK Library Management System\build\installerSidebar.bmp"
$headerOutput = "F:\GPTK Library Management System\build\installerHeader.bmp"

# Function to resize and save as 24-bit BMP
function Convert-Image {
    param (
        [string]$InputFile,
        [string]$OutputFile,
        [int]$Width,
        [int]$Height
    )

    $srcImage = [System.Drawing.Image]::FromFile($InputFile)
    $newImage = new-object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($srcImage, 0, 0, $Width, $Height)
    
    $newImage.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Bmp)
    
    $graphics.Dispose()
    $newImage.Dispose()
    $srcImage.Dispose()
    
    Write-Host "Generated $OutputFile ($Width x $Height)"
}

# Generate Sidebar (164x314)
Convert-Image -InputFile $sidebarSource -OutputFile $sidebarOutput -Width 164 -Height 314

# Generate Header (150x57)
Convert-Image -InputFile $headerSource -OutputFile $headerOutput -Width 150 -Height 57
