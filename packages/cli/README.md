# GetWired

GetWired is an AI-powered CLI for visual regression and exploratory testing.

## Install

```bash
npm install -g getwired
```

## Usage

```bash
cd /path/to/your-app
getwired init
npm run dev
getwired test --url http://localhost:3000
getwired report
```

Run GetWired from the project folder directly. It only tests local apps on `localhost` or loopback addresses and rejects remote online URLs.

## Commands

- `getwired init` initializes `.getwired/` in the current project folder and opens the dashboard.
- `getwired test` runs a testing session against a local app in the current project folder.
- `getwired report` opens a saved report by id.
- `getwired dashboard` opens the interactive dashboard.

## Requirements

- Node.js 20 or newer

## Repository

https://github.com/JaySym-ai/getwired
