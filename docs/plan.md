Bhutan Budget Dashboard — Plan
Oct 6, 2026 · @K.T
The project is now a static, read-only dashboard of Bhutan's national budget, built only from official Ministry of Finance reports. With no database, server or admin to run, the data lives as cited CSV files in Git, a build step checks them, and the site is pre-rendered and hosted for free.
1. What changed
The data model's ideas survive; the machinery around them goes. Budget data changes a few times a year (the budget in June, revisions and actuals later), so a pre-built static site serves it better than a live database and API. Git takes over the jobs the database and admin did: a pull request is the review step, a commit is a correction, a tag is a release.
Area	v1 full tracker	v2 dashboard
Scope	Revenue, budget, spending, projects, news, tax estimator	National budget and revenue from MoF reports only
Sources	Government, NSB, Parliament, news	Ministry of Finance reports (plus NSB population for per-person figures)
Storage	PostgreSQL + object storage	CSV files in the Git repo; PDFs listed with checksums, not committed
Review	Django admin queue	Pull request + automated checks in CI
Corrections	Supersede rows with timestamps	Edit the CSV row in a commit; Git history is the audit trail
Releases	`dataset_release` table	Git tag (`data-2026.10.1`) + downloadable CSV/JSON
Backend	Django + DRF API	None. A build script turns CSV into JSON
Frontend	Next.js server-rendered	Next.js static export on a free static host
Languages	Python + TypeScript	TypeScript end to end (Python optional, only for PDF table extraction)
Kept as-is	—	Stage (BE / RE / actual), page-level citations, amounts in ngultrum, control totals, agency renames, "data unavailable" over guesses
Dropped for now	—	Projects, news, tax estimator, map, live updates
This also removes most of the v1 loopholes: no admin to secure, no server to patch, no database to back up. The ones that remain are about the data itself and are covered in sections 5 and 7.
2. What the dashboard shows
Eight pages, each answering one plain question from tables the budget report already publishes. The page no other source offers is Plan vs outcome: the same fiscal year appears in up to five reports (projection, budget, revision, actual), and lining those up shows how far plans moved.
Page	Question it answers	Main visuals	Built from (budget report)
Overview `/`	How big is this year's budget, and how is the gap financed?	Headline tiles (resources, expenditure, fiscal balance and % of GDP, appropriation); resources vs expenditure over years	Medium-Term Fiscal Framework, resource and appropriation summaries
Revenue `/revenue`	Where does the money come from?	Stacked bars by year (direct tax, indirect tax, non-tax, grants, other); tax heads for one year, ranked	Resource summaries, domestic revenue and grants tables
Spending `/spending`	Where does it go?	Recurrent vs capital over years; sectors ranked; agencies ranked with search	Budget appropriation and sector allocation summaries
Agency `/agencies/[key]`	How has this agency's budget changed?	Line over years with stage markers; recurrent vs capital; rename notes	Appropriation summary across several years' reports
Local governments `/local-governments`	How much goes to each Dzongkhag, Gewog and Thromde?	Ranked bars; per-resident view using NSB population; map later	Local government allocation summary
Deficit and debt `/deficit`	How big is the gap and how is it financed?	Fiscal balance and % of GDP over years; borrowing and debt service	Fiscal framework, public debt chapter
Plan vs outcome `/plan-vs-outcome`	Did spending match the plan?	For each year, a dot per stage (projection → budget → revised → actual) joined by a line	The same year across successive reports
Sources `/sources`	Where does every number come from?	Document list with pages and checksums; CSV and JSON downloads	All of the above
Rules every page follows
Every figure shows its stage (Budget estimate, Revised, Actual, Projection) and links to the document and page it came from.
Projections and estimates are drawn visibly differently from actuals (outlined or dashed vs solid).
Missing values show "Not published", never zero or an interpolated value.
Amounts are shown in Nu. million or billion with a toggle; the underlying data stays in ngultrum.
Every chart has a "Download this data" link and a short "How to read this" note.
3. Data sources
The Ministry of Finance's annual Budget Report is enough to build every page. Figures are in Nu. million for a July–June fiscal year, and each edition's Medium-Term Fiscal Framework carries five years at once: actual (two years back), revised (last year), estimate (this year) and two projections. Collecting five editions gives about nine years of history, with most years seen at several stages.
Tables used, as numbered in the FY 2026–27 Budget Report
Table	Title	Page	Years and stages	Feeds page
2.1	Revised Budget Summary for FY 2025-26 as on March 31, 2026	16	Approved vs revised, previous year	Plan vs outcome
3.1	Medium-Term Fiscal Framework	22	Actual 2024-25, revised 2025-26, estimate 2026-27, projections 2027-28 and 2028-29	Overview, Deficit, Plan vs outcome
4.1	Medium-Term Resources Outlook	24	Estimate + 2 projections	Revenue
4.2	Summary of Resources for FY 2026-27	25	Estimate	Revenue
4.3	Summary of Domestic Revenue	26	Estimate, by tax head	Revenue
4.4	Summary of Grants for FY 2026-27	27	Estimate, by funder	Revenue
5.1	Medium-Term Budget Framework	29	Estimate + 2 projections	Spending
5.2	Summary of Budget Appropriation for FY 2026-27	30	Estimate, by agency and type	Spending, Agency
5.3	Summary of Sector Allocation for FY 2026-27	32	Estimate, by sector	Spending
5.4	Summary of Budget Allocation for Local Governments	33 in the FY 2025–26 edition; confirm for 2026–27	Estimate, by Dzongkhag, Gewog, Thromde	Local governments
Page numbers move between editions, so every citation stores the edition and page, never just a table number.
FY 2026–27 headline figures (Nu. million) and the checks they must pass
Figure	Value	Check
Total resources	110,280.523	Domestic revenue 77,406.065 + grants 30,697.484 + other receipts 2,176.974
Total expenditure	135,564.802	Recurrent 63,028.514 + capital 72,536.288
Fiscal balance	(25,284.279), 6.54% of GDP	Resources − expenditure
Budget appropriation	153,296.213	Expenditure + 17,731.411 for items such as loan repayments and on-lending
The arithmetic closes exactly, which is what the build's checks will test for every year. These values came from an automated read of the PDF; re-key them from the report in Phase 0 before publishing.
Other sources
Earlier Budget Reports from the MoF budget reports page: the history and the plan-vs-outcome view.
Audited actuals: the Royal Audit Authority's annual audit report and any published annual financial statements. Phase 2, once you confirm which tables are usable.
Population: NSB population projections, only for per-resident views.
Pitfalls to design for
"Total budget" is ambiguous. News often quotes the appropriation (153.3 billion) while expenditure is 135.6 billion. The site names both and never says "budget" alone.
Names change between editions: agencies after restructuring, and tax heads (for example sales tax and GST). Both need a mapping table, not a find-and-replace.
The fiscal year can be labelled "2026-27", "FY 2026/27" or "2026" across tables; store one form (the start year) and print one label.
Medium-term projections are not commitments. Show them, clearly marked, but never in totals or growth rates.
4. Architecture
One repository, one build, no server. Cited CSV files are the dataset; a TypeScript build script validates them and writes the JSON each page needs; Next.js pre-renders every page to static HTML; a free static host serves it from a CDN. If any check fails, the build fails and nothing is published.
[embedded content: Dashboard architecture · 6 steps, 1 return loop]
The only server-side moment is CI: it checks the CSVs, builds the pages and hands static files to the host.
Part	Technology	Job
Dataset	CSV files in `data/`	The facts, each row citing a document and page
Schema	`zod` in `src/lib/schema.ts`	One definition of every row type, shared by the build and the site
Build	TypeScript scripts run with `tsx`, `csv-parse`	Load → validate → derive totals and per-resident values → write JSON and downloads
Site	Next.js static export (`output: 'export'`), React, TypeScript strict, Tailwind	Eight pages, pre-rendered
Charts	Recharts	Bars, lines, stacked areas; the plan-vs-outcome dot plot as a custom scatter
CI/CD	GitHub Actions	Validate every pull request; build and deploy every merge to `main`
Hosting	Cloudflare Pages (or GitHub Pages / Vercel)	Static files on a CDN; free at this size
Optional helper	Python + `pdfplumber` in `tools/extract/`	Turn a PDF table page into a draft CSV you then check by hand
Why this shape
Nothing to run or secure. No database, API, admin or login; the attack surface is a static site.
Git is the audit trail. Every number's history is `git log -p data/`; every published state is a tag.
One language. TypeScript from data checks to charts, so Cursor works in one toolchain and types flow from the CSV schema to the chart props.
Fast on mobile data. Pages are pre-built HTML with small JSON files, cached at the edge.
Easy to grow back. If projects or a public API return later, the same CSVs load into PostgreSQL unchanged (the v1 design is archived in this doc).
5. Data model
One fact file per report edition, in long format (one row per printed number), plus small reference files that give every printed name a stable key. You type numbers exactly as printed; the build converts them, so nothing is entered twice in different forms.
5.1 Files
File	One row is…	Key columns
`data/documents.csv`	One report edition	`doc_id` (e.g. `br-2026-27`), `title`, `doc_type`, `edition_fy`, `published_on`, `url`, `archive_url`, `sha256`
`data/facts/<doc_id>.csv`	One number printed in that report	see 5.2
`data/reference/categories.csv`	A classification node (tree)	`category`, `label`, `parent`, `family` (resources, expenditure, sector, balance, financing)
`data/reference/agencies.csv`	An agency over its lifetime	`agency`, `name`, `kind`, `parent`, `from_fy`, `to_fy`
`data/reference/aliases.csv`	A printed spelling mapped to a key	`printed_name`, `kind` (agency or category), `key`, `doc_id`
`data/reference/lineage.csv`	A rename, merger or split	`from_key`, `to_key`, `relation`, `effective_fy`, `doc_id`, `page`
`data/reference/geography.csv`	A Dzongkhag, Gewog or Thromde	`geo`, `name`, `level`, `parent`
`data/stats/population.csv`	Residents for one year and place	`year`, `geo`, `persons`, `series`, `doc_id`, `page`
5.2 Fact columns
Column	Example	Rule
`fy`	`2026`	Start year; 2026 = FY 2026–27 (1 July 2026–30 June 2027)
`stage`	`BE`	`PROJ` projection, `BE` budget estimate, `RE` revised, `ACT` actual, `AUD` audited
`as_of`	`2026-03-31`	Optional; for revised figures "as on" a date
`category`	`exp.recurrent`	Must exist in `categories.csv`
`agency`	`moh` or blank	Blank = whole government
`geo`	blank	Blank = national
`printed_value`	`(25,284.279)`	Exactly as printed, brackets and commas included
`printed_unit`	`Nu. million`	`Nu. million`, `Nu.`, or `% of GDP`
`doc_id`, `page`, `table`	`br-2026-27`, `22`, `3.1`	Where to find it
`row_label`, `col_label`	`Recurrent Expenditure`, `FY 2026-27 Estimates`	Verbatim from the table, so the build can check the mapping
`note`		Anything a reader should know
The build adds `amount_nu` (whole ngultrum, an integer: "63,028.514" Nu. million → 63,028,514,000), so JavaScript never touches fractional money. Brackets become negatives. Percentages stay in a separate `pct` field.
Example rows from Table 3.1:
```csv
fy,stage,as_of,category,agency,geo,printed_value,printed_unit,doc_id,page,table,row_label,col_label,note
2026,BE,,res.total,,,"110,280.523",Nu. million,br-2026-27,22,3.1,Total Resources,FY 2026-27 Estimates,
2026,BE,,exp.recurrent,,,"63,028.514",Nu. million,br-2026-27,22,3.1,Recurrent Expenditure,FY 2026-27 Estimates,
2026,BE,,bal.fiscal,,,"(25,284.279)",Nu. million,br-2026-27,22,3.1,Fiscal Balance,FY 2026-27 Estimates,
```
(Confirm the exact row labels and page against the PDF; these illustrate the format.)
5.3 Which value a page shows
The same year, stage and line can appear in several editions (an actual first printed in one report may be restated in the next). The build keeps all of them and picks the one from the newest edition; older ones become "previously reported" values, shown on hover and in downloads. Stages never compete: a page always asks for a specific stage, and the headline uses the most final stage available (audited → actual → revised → budget) and labels it.
5.4 Derived values
Per-resident figures divide by the NSB population for the calendar year in which the fiscal year starts; that rule is printed on the Methodology page. Growth rates and shares are computed only within one stage, never by mixing actuals with estimates. Derived numbers are marked "Calculated" and list their inputs.
6. Update workflow
Adding a new report is a pull request: about a day of careful entry per edition, then CI and a preview link do the checking. The same path handles corrections.
Register the document. Download the PDF, record its SHA-256 (`certutil -hashfile file.pdf SHA256` on Windows), save it to the Wayback Machine, and add a row to `data/documents.csv`. Branch: `data/br-2027-28`.
Enter the numbers. For each table in section 3, type rows into `data/facts/<doc_id>.csv` exactly as printed, or draft them with `tools/extract` and then check every cell against the page.
Map new names. Run `npm run data:check`; it lists every printed agency or category name it can't match. Add each to `aliases.csv` (or a new key plus a `lineage.csv` row if it is a rename).
Re-key the headline table. Type Table 3.1 a second time into `data/rekey/<doc_id>.csv` without looking at the first file. The build compares the two.
Run the checks locally until `npm run data:check` is clean, then `npm run dev` and look at every affected page.
Open a pull request. CI re-runs the checks, builds the site and posts a preview URL. Tick the PR template: pages opened in the PDF, totals reconcile, new names mapped, preview reviewed.
Merge and tag. Merging deploys. Tag `data-2027.06.1` and write two lines in `CHANGELOG.md`: what was added, and which earlier figures the new edition restated.
Corrections: a reader reports a problem through the link on each chart (a pre-filled GitHub issue naming the document, page and row). Fix the row in a PR that references the issue; the changelog records it.
7. Validation and trust rules
The budget report's own arithmetic is the strongest check available: totals, sub-totals and the fiscal balance must close. Each rule below is a small function in `scripts/rules/` with a passing and a failing test fixture; errors stop the build, warnings appear as a comment on the pull request.
Check	Rule	Result
`SCHEMA`	Every row parses: known stage, sensible year, number pattern in `printed_value`, known unit	Error
`UNIQUE`	One row per document, year, stage, category, agency and place	Error
`REFERENCES`	Category, agency, place and document exist; page is within the document	Error
`LABEL_MATCH`	`row_label` maps (through `aliases.csv`) to the same category as the row says, catching wrong-row typos	Error
`IDENTITY`	Resources − expenditure = fiscal balance, per document, year and stage	Error
`CHILDREN_SUM`	Children of a category sum to their parent; agencies sum to the printed total	Error
`REKEY_MATCH`	The blind re-entry of Table 3.1 equals the main entry	Error
`STAGE_TIMING`	Actuals only for years that ended before the report was published; projections only for later years	Error
`SIGN`	No negatives except balances and net financing	Error
`RESTATED`	A newer edition changes an earlier figure by more than 1%	Warning, listed for the changelog
`YOY_JUMP`	More than 50% change from the previous year at the same stage	Warning, needs a `note`
Rounding tolerance: figures printed to 3 decimals in Nu. million can be off by up to Nu. 500 each, so a sum of n printed values may differ from its printed total by up to n × Nu. 500. Anything beyond that is an error.
Trust
Footer on every page: an independent project, not an official Government of Bhutan site; figures from Ministry of Finance publications as cited.
Neutral captions that describe changes and never judge them.
Link to and checksum the PDFs; don't re-host them. Publish your compiled CSV under CC BY 4.0, crediting the Ministry as the source.
Every chart has an accessible data-table alternative and a download link.
Before launch, check whether civil service rules on outside work or public commentary would apply to you.
8. Repository and roadmap
A single Next.js project with the data and build scripts beside it; generated files are never committed.
8.1 Repository layout
```text
bhutan-budget-dashboard/
├── AGENTS.md                  # rules for Cursor / Claude
├── .cursor/rules/data.mdc
├── data/
│   ├── documents.csv
│   ├── facts/br-2026-27.csv   # one file per report edition
│   ├── rekey/br-2026-27.csv   # blind re-entry of Table 3.1
│   ├── reference/             # categories, agencies, aliases, lineage, geography
│   └── stats/population.csv
├── scripts/
│   ├── build-data.ts          # load → validate → derive → write JSON + downloads
│   ├── parse.ts               # "(25,284.279)" Nu. million → -25284279000
│   └── rules/                 # one file per check, each with tests
├── src/
│   ├── app/                   # /, /revenue, /spending, /agencies/[key], /local-governments,
│   │                          # /deficit, /plan-vs-outcome, /sources, /methodology
│   ├── components/            # charts/, provenance/ (Figure, StageBadge, SourceLink, NotPublished), ui/
│   ├── lib/schema.ts          # zod schemas shared by build and site
│   └── data/                  # generated JSON (gitignored)
├── public/downloads/          # generated CSV/JSON (gitignored)
├── tools/extract/             # optional Python PDF-table helper
├── docs/                      # plan.md (this tab), methodology.md
├── CHANGELOG.md
├── .github/workflows/ci.yml
└── package.json               # scripts: data:check, data:build, dev, build, test, lint
```
8.2 Roadmap
About eight part-time weeks to launch. One report edition comes first, end to end, before any history is added.
[embedded content: Roadmap · 6 phases to launch]
Phase 0 needs no code: entering one edition by hand shows you the real table shapes before Cursor writes a schema around them.
Sources
Budget Report FY 2026–27, Ministry of Finance: table list, pages and headline figures in section 3
Budget Report FY 2025–26, Ministry of Finance: chapter structure and the local-government table
Royal Audit Authority, Annual Audit Report 2024–25 Vol. I: a possible source of audited figures (not yet reviewed)
NSB population projections