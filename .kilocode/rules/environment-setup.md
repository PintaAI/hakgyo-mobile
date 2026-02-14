## Brief overview
This project is a React Native/Expo language learning application (hakgyo) running on Windows with PowerShell. These guidelines cover the development environment setup and command execution preferences.

## Package management
- Always use bun as the package manager instead of npm or yarn
- Use `bun install` for installing dependencies
- Use `bun add <package>` for adding new packages
- Use `bun run <script>` for running scripts defined in package.json
- Use `bunx <package>` for executing packages without installing

## Command execution
- This is a Windows environment using PowerShell as the default shell
- When chaining commands, use `;` for PowerShell (not `&&` which is for bash)
- Avoid Unix-specific utilities like `sed`, `grep`, `awk`, `cat`, `rm`, `cp`, `mv`
- Use PowerShell equivalents: `type` for cat, `Remove-Item` or `del` for rm, `Copy-Item` or `copy` for cp, `Move-Item` or `move` for mv, `Select-String` or `findstr` for grep
- All paths should be relative to the workspace directory or use absolute paths
- Do not use `~` or `$HOME` to refer to the home directory

## Development workflow
- The project uses React Native with Expo framework
- NativeWind is configured for styling with Tailwind CSS
- The app includes vocabulary and soal (questions) features
- Component structure follows a modular pattern with organized directories
