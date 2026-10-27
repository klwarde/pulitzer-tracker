# Pulitzer Prize Fiction Tracker

I'm excited to share a visual tracker for the Pulitzer Prize for Fiction that lets you browse winners by year and easily track which you've read.

**Live site:** [pulitzer-tracker.netlify.app](https://pulitzer-tracker.netlify.app)

## About this project

I built this as a portfolio piece using a multi-AI workflow: ChatGPT for scoping and Claude for the build. AI built the app for me based on my prompting. I made the decisions about scope, structure and quality, and reviewed what the tools produced.

👉 Read the full case study: [in my portfolio](https://klwarde.github.io/my-docs-portfolio/docs/latest/studio/pulitzer-tracker.html)

## Built with

- ChatGPT
- Claude
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- Deployed on [Netlify](https://www.netlify.com/)

## Data

The Pulitzer book list lives in a standalone books.json file.

## Known limitations

Progress is saved in your browser (localStorage), not on a server, so it doesn't sync between devices. This means that what you see on a computer won't appear on your phone.

## Run it locally

You need [Node.js](https://nodejs.org/) (developed on v24).

```
git clone https://github.com/klwarde/pulitzer-tracker.git
cd pulitzer-tracker
npm install
npm run dev
```

Then open the address shown in the terminal (usually http://localhost:5173) in your browser.

To create a production build:

```
npm run build
```

The output goes to the `dist` folder.

## Author

Created by Kathy Warde using AI tools (ChatGPT, Claude). See the case study for how.

- LinkedIn: [linkedin.com/in/kathywarde](https://linkedin.com/in/kathywarde)
- Portfolio: [klwarde.github.io/my-docs-portfolio](https://klwarde.github.io/my-docs-portfolio)