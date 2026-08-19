# Run the React + Vite frontend
$nodeBin = "$env:LOCALAPPDATA\Programs\node"
if (Test-Path "$nodeBin\npm.cmd") {
    $env:Path = "$nodeBin;" + $env:Path
}
npm run dev
