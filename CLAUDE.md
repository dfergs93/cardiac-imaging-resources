# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Activate the virtual environment first:
```bash
source venv_cardiac/bin/activate
```

| Task | Command |
|------|---------|
| Local dev server (live reload) | `mkdocs serve` |
| Build static site | `mkdocs build` |
| Deploy to GitHub Pages | `mkdocs gh-deploy` |
| Install dependencies | `pip install -r requirements.txt` |

Deployment also happens automatically via GitHub Actions on every push to `main`.

## Architecture

This is a **MkDocs static site** using the Material theme, serving as a cardiac imaging educational reference for radiologists/fellows.

### Content (`docs/`)
Markdown files organized into sections matching the nav in [mkdocs.yml](mkdocs.yml):
- `cardiac_ct/` — CT protocols and reporting
- `cardiac_mri/` — MRI sequences, protocols (function, viability, stress perfusion, congenital/4D flow, masses)
- `valves/` — Stenosis/regurgitation grading, TAVR/TMVR device planning
- `congenital/` — Individual CHD entities (TOF, TGA, ccTGA, DORV, ASD, VSD, Fontan, CoA, Ebstein, AVSD)
- `calculators/` — Calculator pages (ECV, 4D Flow, Bernoulli)

### Calculators
The interactive calculators are vanilla JavaScript embedded within Markdown pages via raw HTML. All computation runs client-side in the browser.

- [docs/javascripts/calculators.js](docs/javascripts/calculators.js) — main calculator logic; initialized via `DOMContentLoaded` calling `initECVCalc()`, `init4DFlowCalc()`, `initBernoulliCalc()`, `initCHDTabs()`
- [docs/javascripts/segmental_analysis.js](docs/javascripts/segmental_analysis.js) — congenital heart disease segmental analysis tool
- [docs/javascripts/mathjax.js](docs/javascripts/mathjax.js) — MathJax configuration for math rendering

Calculator HTML/inputs live inside the corresponding `.md` files (e.g., [docs/calculators/flow.md](docs/calculators/flow.md)). The JS selects DOM elements by ID, so IDs in the markdown HTML must match what the JS expects.

### Styling
Custom CSS at [docs/custom_css/extra.css](docs/custom_css/extra.css) extends the Material theme.

### Configuration
[mkdocs.yml](mkdocs.yml) defines navigation, theme settings, plugins (search, awesome-pages), and markdown extensions (admonition, tabbed, emoji, superfences/mermaid, arithmatex for LaTeX).
