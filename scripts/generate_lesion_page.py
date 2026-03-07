#!/usr/bin/env python3
"""
Generate a structured MkDocs cardiac MRI reference page from a textbook PDF chapter.

Uses Claude API (claude-opus-4-6) with the Files API for native PDF understanding,
falling back to pdfplumber text extraction if the Files API is unavailable.

Usage:
    python scripts/generate_lesion_page.py --input chapter.pdf
    python scripts/generate_lesion_page.py --input chapter.pdf --output custom-name.md
    python scripts/generate_lesion_page.py --input chapter.pdf --dry-run
"""

import argparse
import os
import re
import sys
from pathlib import Path

import anthropic

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).parent.parent
DOCS_CONGENITAL = REPO_ROOT / "docs" / "congenital"
MKDOCS_YML = REPO_ROOT / "mkdocs.yml"

# ---------------------------------------------------------------------------
# Few-shot examples (inline so the script is self-contained)
# ---------------------------------------------------------------------------
_TOF_EXAMPLE = """\
---
title: Tetralogy of Fallot
---

# Tetralogy of Fallot (TOF)

**Four components:** VSD + overriding aorta + RVOTO + RVH

## Pre-repair

Early diagnosis via fetal echo or postnatal echocardiography. Surgical candidates typically have adequate pulmonary arteries and left-to-right shunting with cyanosis.

## Post-repair Assessment

### CMR Evaluation

| Measurement | Normal | Concern |
|-------------|--------|---------|
| RV EDVi | 80–110 mL/m² | >160 suggests progressive dilation |
| RV EF | >45% | <40% = significant dysfunction |
| Pulmonary RF | <20% | >40% = severe PR |
| LV EF | >55% | |
| QRS duration | <160 ms | >180 ms = arrhythmia risk |

### Key Findings

- **Pulmonary regurgitation:** Measure PR by 4D flow at main PA. Progressive PR leads to RV dilation; major reason for pulmonary valve replacement (PVR)
- **Residual RVOTO:** Measure by PC velocity at site of narrowing (often infundibular). Use Bernoulli equation
- **RPA stenosis:** Common post-repair. Compare LPA:RPA flow ratios
- **Aortic root dilation:** Common sequelae. Measure at annulus, sinuses of Valsalva, sinotubular junction, ascending aorta

### PVR Timing

CMR RV volumes guide PVR indication. Most centers use:
- RVEDVi >150–160 mL/m² AND/OR RF >40% as thresholds for consideration of intervention

## Complications

- Arrhythmias (sustained VT risk if QRS >180 ms)
- Aortic root aneurysm
- Left ventricular dysfunction (late finding)
- Sudden cardiac death risk in untreated severe RV dilation"""

_EBSTEIN_EXAMPLE = """\
---
title: Ebstein Anomaly
---

# Ebstein Anomaly

## Anatomy

**Hallmark:** Apical displacement of the septal and posterior leaflets of the tricuspid valve from normal insertion at the annulus.

**Diagnostic criterion (echo):** Displacement ≥8 mm/m² (body surface area) below the mitral valve annulus level

**Key structural feature:**
- **"Atrialized" RV:** Portion of RV (from TV insertion to AV junction) is thin-walled and contractually incompetent; functions as part of RA
- **Functional RV:** Small chamber; often hypertrophic and restricted

## Physiology

- **Tricuspid regurgitation:** Almost universal
  - Leaflets are dysplastic and may not coapt properly
  - Severity varies: mild to severe

- **Right-to-left shunting:** ASD or patent foramen ovale present in ~70% of cases
  - Permits R→L shunting if RA pressure is elevated → cyanosis
  - Cyanosis typically mild (SaO₂ often 90–95%)

- **Atrial arrhythmias:** Accessory pathways (WPW syndrome) in ~25% of Ebstein patients
  - Risk of accessory pathway-mediated tachycardia

## CMR Assessment

### Ventricular Volumes and Function

- **Measure functional RV volume** (exclude atrialized portion from RV cavity)
  - Delineate atrialization boundary by cine
  - RV EF often reduced
  - Severe dysfunction may require intervention

- **LV volume and function:** Secondary effects from RV dilation (septal bulge into LV)

### Tricuspid Regurgitation

- **Severity assessment:** 4D flow quantifies regurgitant volume and fraction
- **Pathophysiology:** Dysplastic TV with malcoaptation; may have prolapse of leaflet

### Associated Findings

- **ASD/PFO:** Screen for right-to-left shunt on 4D flow
- **Accessory pathway:** Consider electrophysiology referral if WPW pattern on ECG
- **Other structural abnormalities:** LVOTO (left ventricular outflow obstruction), pulmonary stenosis

### Atrial Enlargement

- **RA dilation:** Often marked
- **LA size:** Usually normal unless secondary LA dilation from TR

## Clinical Considerations

### Indications for Surgery

- **Symptomatic cyanosis:** SaO₂ <90%
- **Severe RV dysfunction:** RV EF <35% or significant dilation
- **Progressive arrhythmias:** Refractory to medical management
- **Paradoxical embolism risk:** Large PFO/ASD with cyanosis

**Surgical options:**
- TV repair (cone procedure) or replacement
- ASD closure (to reduce R→L shunt)
- Arrhythmia management (if WPW)

### Medical Management

- Antiarrhythmics for accessory pathway-mediated arrhythmias
- Diuretics for right heart failure
- Anticoagulation if atrial fibrillation develops

## Imaging Follow-up

Serial CMR to assess:
- RV volume and function trajectory
- TR progression
- LA/RA size changes
- Development of arrhythmias or symptoms requiring intervention"""

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = f"""You are a cardiac imaging specialist creating quick-reference pages for cardiac MRI fellows.

Your task: Convert the provided textbook chapter into a concise, structured CMR reference page.

OUTPUT RULES:
1. Output ONLY valid MkDocs Material markdown — no preamble, no explanation, no wrapping code fences.
2. The very first line must be a filename comment: <!-- filename: kebab-case-lesion-name.md -->
   - Use a short, lowercase kebab-case slug (e.g., pulmonary-atresia.md, truncus-arteriosus.md)

REQUIRED PAGE STRUCTURE (in this exact order):

    <!-- filename: lesion-slug.md -->
    ---
    title: Full Condition Name
    ---

    # Full Condition Name

    **Key anatomy/defining feature:** One-line summary.

    ## [Background / Anatomy / Pre-repair]   ← include only if directly relevant to CMR interpretation
    Brief paragraph. 2–4 sentences max.

    ## CMR Assessment

    ### Measurements
    | Measurement | Normal / Reference | Concern / Threshold |
    |-------------|--------------------|---------------------|
    [Key CMR measurements, volumes, gradients, and intervention thresholds]

    ### Key Findings
    - **Finding category:** What to measure, where, and how. Include relevant sequences (cine SSFP, PC velocity mapping, 4D flow, LGE).

    !!! tip "Pearl"
        Include 1–2 key clinical pearls as admonition blocks where appropriate.

    ## Clinical Considerations

    ### Indications for Intervention
    - Specific numeric thresholds for surgery or catheter intervention

    ### Complications
    - List complications relevant to CMR monitoring

    ## Imaging Follow-up
    Surveillance intervals and triggers for escalation.

Use horizontal rules (---) to separate major surgical or anatomic variants (e.g., pre-repair vs post-repair).

STYLE:
- **bold:** for key terms and finding categories
- !!! tip / !!! warning / !!! info admonitions for important pearls
- Tables for all quantitative thresholds
- Be concise — this is a quick-reference card, not a textbook

---

EXAMPLE PAGE 1 — Tetralogy of Fallot:

{_TOF_EXAMPLE}

---

EXAMPLE PAGE 2 — Ebstein Anomaly:

{_EBSTEIN_EXAMPLE}

---

Now convert the provided chapter following the same style and structure."""


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a structured CMR reference page from a textbook PDF chapter.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--input", "-i",
        required=True,
        type=Path,
        help="Path to the input PDF chapter file",
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=None,
        help="Output filename override (e.g., pulmonary-atresia.md). "
             "Auto-detected from Claude's response if omitted.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print generated markdown to stdout without writing any files",
    )
    parser.add_argument(
        "--model",
        default="claude-opus-4-6",
        help="Claude model to use (default: claude-opus-4-6)",
    )
    return parser.parse_args()


# ---------------------------------------------------------------------------
# PDF handling
# ---------------------------------------------------------------------------
def upload_pdf(client: anthropic.Anthropic, pdf_path: Path) -> str | None:
    """Upload the PDF via Files API. Returns file_id or None on failure."""
    print(f"  Uploading {pdf_path.name} via Files API...")
    try:
        with open(pdf_path, "rb") as f:
            uploaded = client.beta.files.upload(
                file=(pdf_path.name, f, "application/pdf"),
            )
        print(f"  File ID: {uploaded.id}")
        return uploaded.id
    except Exception as e:
        print(f"  Files API upload failed: {e}")
        return None


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extract text from PDF using pdfplumber."""
    try:
        import pdfplumber
    except ImportError:
        sys.exit(
            "Error: pdfplumber is not installed.\n"
            "Install it with:  pip install pdfplumber\n"
            "Or install all script deps:  pip install -r scripts/requirements.txt"
        )

    print(f"  Extracting text from {pdf_path.name} with pdfplumber...")
    pages_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)

    full_text = "\n\n".join(pages_text)
    estimated_tokens = len(full_text) // 4
    print(f"  Extracted ~{estimated_tokens:,} estimated tokens from {len(pages_text)} pages")

    if estimated_tokens > 150_000:
        print(
            f"\n  Warning: Chapter is very long (~{estimated_tokens:,} estimated tokens).\n"
            "  Consider extracting only the CMR/imaging and management sections for best results.\n"
        )

    return full_text


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------
def generate_page(client: anthropic.Anthropic, pdf_path: Path, model: str) -> str:
    """Send chapter to Claude via streaming and return generated markdown."""

    # Try Files API first for native PDF understanding
    file_id = upload_pdf(client, pdf_path)
    use_files_api = file_id is not None

    if use_files_api:
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Convert this textbook chapter into a CMR reference page "
                            "following the format in your instructions."
                        ),
                    },
                    {
                        "type": "document",
                        "source": {"type": "file", "file_id": file_id},
                    },
                ],
            }
        ]
    else:
        # Fallback: extract text and send as plain content
        chapter_text = extract_text_from_pdf(pdf_path)
        messages = [
            {
                "role": "user",
                "content": (
                    "Convert this textbook chapter into a CMR reference page "
                    "following the format in your instructions.\n\n"
                    "<chapter>\n"
                    f"{chapter_text}\n"
                    "</chapter>"
                ),
            }
        ]

    print(f"\nGenerating reference page with {model}...")
    print("-" * 60)

    common_kwargs: dict = dict(
        model=model,
        max_tokens=8192,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    full_text = ""

    try:
        if use_files_api:
            stream_ctx = client.beta.messages.stream(
                betas=["files-api-2025-04-14"],
                **common_kwargs,
            )
        else:
            stream_ctx = client.messages.stream(**common_kwargs)

        with stream_ctx as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
                full_text += text

    except anthropic.BadRequestError as e:
        sys.exit(f"\nError: Claude rejected the request — {e.message}")
    except anthropic.AuthenticationError:
        sys.exit("\nError: Invalid ANTHROPIC_API_KEY.")
    except anthropic.RateLimitError:
        sys.exit("\nError: Rate limit reached. Please wait and retry.")
    except anthropic.APIStatusError as e:
        sys.exit(f"\nAPI error {e.status_code}: {e.message}")
    finally:
        # Clean up the uploaded file regardless of outcome
        if file_id:
            try:
                client.beta.files.delete(file_id)
            except Exception:
                pass

    print("\n" + "-" * 60)
    return full_text


# ---------------------------------------------------------------------------
# Content parsing
# ---------------------------------------------------------------------------
def parse_filename_from_content(content: str) -> str | None:
    """Extract suggested filename from <!-- filename: xxx.md --> on first line."""
    first_line = content.strip().splitlines()[0] if content.strip() else ""
    match = re.match(r"<!--\s*filename:\s*([a-z0-9][a-z0-9\-]*\.md)\s*-->", first_line)
    if match:
        return match.group(1)
    return None


def parse_title_from_content(content: str) -> str | None:
    """Extract title from YAML frontmatter."""
    match = re.search(r"^title:\s*(.+)$", content, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return None


def clean_content(content: str) -> str:
    """Remove the <!-- filename: ... --> comment before writing to disk."""
    lines = content.strip().splitlines()
    if lines and lines[0].strip().startswith("<!--"):
        lines = lines[1:]
        # Drop one leading blank line if present
        if lines and not lines[0].strip():
            lines = lines[1:]
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# mkdocs.yml nav update
# ---------------------------------------------------------------------------
def update_mkdocs_nav(title: str, slug: str) -> None:
    """Append new page to the 'Congenital HD:' section of mkdocs.yml."""
    nav_entry = f"congenital/{slug}"

    with open(MKDOCS_YML, "r", encoding="utf-8") as f:
        content = f.read()

    if nav_entry in content:
        print(f"  mkdocs.yml: '{nav_entry}' already present, skipping.")
        return

    lines = content.splitlines()

    # Find the last line that references a congenital/ page
    last_congenital_idx = -1
    in_congenital_section = False

    for i, line in enumerate(lines):
        if "Congenital HD:" in line:
            in_congenital_section = True
            continue

        if in_congenital_section:
            stripped = line.strip()
            # Detect end of congenital section: a top-level nav item (2-space indent)
            if stripped.startswith("-") and "congenital/" not in line:
                indent = len(line) - len(line.lstrip())
                if indent <= 4 and ":" in stripped and not stripped.count(":") == 0:
                    # Look for lines like "  - Calculators:" which have indent ≤4
                    # and represent the next top-level section
                    if indent <= 2:
                        in_congenital_section = False
                        continue

            if "congenital/" in line:
                last_congenital_idx = i

    if last_congenital_idx == -1:
        print(
            "  Warning: Could not locate 'Congenital HD:' section in mkdocs.yml.\n"
            f"  Please add manually under 'Congenital HD:':\n"
            f"    - {title}: congenital/{slug}"
        )
        return

    # Match indentation from the last congenital entry
    last_line = lines[last_congenital_idx]
    indent_spaces = len(last_line) - len(last_line.lstrip())
    new_entry = " " * indent_spaces + f"- {title}: congenital/{slug}"

    lines.insert(last_congenital_idx + 1, new_entry)

    with open(MKDOCS_YML, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"  mkdocs.yml: added '- {title}: congenital/{slug}'")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    args = parse_args()

    pdf_path: Path = args.input.resolve()

    if not pdf_path.exists():
        sys.exit(f"Error: Input file not found: {pdf_path}")
    if pdf_path.suffix.lower() != ".pdf":
        sys.exit(f"Error: Input must be a PDF file. Got: {pdf_path.suffix}")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit(
            "Error: ANTHROPIC_API_KEY environment variable is not set.\n"
            "Export it with:  export ANTHROPIC_API_KEY=sk-ant-..."
        )

    client = anthropic.Anthropic(api_key=api_key)

    # ---- Generate ----
    content = generate_page(client, pdf_path, args.model)

    if not content.strip():
        sys.exit("Error: Claude returned empty output.")

    # ---- Determine filename ----
    filename: str
    if args.output:
        filename = args.output if args.output.endswith(".md") else args.output + ".md"
    else:
        detected = parse_filename_from_content(content)
        if detected:
            filename = detected
        else:
            # Last-resort fallback: derive from input filename
            slug = re.sub(r"[^a-z0-9]+", "-", pdf_path.stem.lower()).strip("-")
            filename = f"{slug}.md"
            print(f"  Warning: Could not detect filename from output. Using: {filename}")

    title = parse_title_from_content(content) or (
        filename.replace(".md", "").replace("-", " ").title()
    )
    clean = clean_content(content)

    # ---- Dry run ----
    if args.dry_run:
        print(f"\n{'='*60}")
        print(f"DRY RUN — output would be written to:  docs/congenital/{filename}")
        print(f"Title detected: {title}")
        print(f"{'='*60}\n")
        print(clean)
        return

    # ---- Write file ----
    output_path = DOCS_CONGENITAL / filename
    if output_path.exists():
        print(f"  Warning: {output_path.name} already exists — overwriting.")
    output_path.write_text(clean, encoding="utf-8")
    print(f"\nWrote: {output_path.relative_to(REPO_ROOT)}")

    # ---- Update nav ----
    update_mkdocs_nav(title, filename)

    print(f"\nDone! Preview the site with:  mkdocs serve")


if __name__ == "__main__":
    main()
