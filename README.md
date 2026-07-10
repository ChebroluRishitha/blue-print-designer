# 📐 BluePrint Pro: Procedural Blueprint Designer

A premium, interactive web application designed to procedurally generate, validate, and export civil engineering and architectural floor plans. Built with modular Vanilla HTML, CSS, and JS, this tool enables real-time generation of custom layout structures alongside advanced compliance, material estimation, and MEP routing systems.

Designed and developed by **Rishitha Chebrolu from IIT Bombay**.

---

## ✨ Features

### 1. Procedural Layout Generator
- Supports **1 BHK, 2 BHK, 3 BHK, and 4 BHK** configurations.
- Custom plot area inputs ranging from **350 sq ft to 3,000 sq ft**.
- Orientation facing options: **East, West, North, and South**.
- Multi-style templates: **Modern Open Plan** (minimal partition walls) and **Traditional Closed Plan** (defined separate rooms).

### 2. Vastu Shastra compliance Engine
- Automatically checks room positions based on traditional Indian Vastu principles.
- Provides immediate visual alerts and score updates (e.g., checks if the Master Bedroom is in the South-West and the Kitchen is in the South-East).

### 3. MEP (Mechanical, Electrical, Plumbing) Layers
- **Electrical Layer**: Automatically generates ceiling fan points, electrical sockets, switchboards, and lighting layouts based on Target Lux criteria.
- **Plumbing Layer**: Routes fresh water inlets, sewage lines, drain points, and routes pipe runs towards shafts.
- **Ventilation Layer**: Places HVAC air condition ducts, exhaust fans, and calculates room-specific air exchange rates.

### 4. Interactive Inspector Panel
- Select any room, window, or fixture to check detailed properties.
- Computes local ventilation lighting ratios (Window-to-Floor Area), lighting levels (Lux), and storage utility metrics.

### 5. Cost & Material Estimator
- Dynamically estimates raw material quantities based on room dimensions and partition lengths.
- Calculates costs for **Cement, Steel, Sand, Bricks, and Tiles** with custom price settings.

### 6. Interactive Canvas Engine
- Supports smooth pan and zoom controls.
- Renders detailed dimensions, furniture, doors, windows, and layer states.
- Fully exports designs as **SVG**, **PNG**, or raw **JSON** data structures.

---

## 🛠️ Technology Stack & Architecture

- **Core**: HTML5 Semantic markup & SVG Canvas Rendering
- **Styling**: Modular CSS3 (custom layouts, variables, and dark UI aesthetics)
- **Javascript Structure**: Clean, modular vanilla JS files separated by domain tasks for optimal performance:
  - `state.js`: Global configuration state & design compliance thresholds.
  - `generator-*.js`: Specialized generation logic (walls, furniture, openings).
  - `render-*.js`: Renders components (canvas, MEP layout, dimensions).
  - `inspector.js` & `warnings.js`: Validates dimensions, lux ratios, and updates warnings.
  - `estimator.js`: Dynamic material quantities and cost calculation.
  - `exports.js`: SVG generator & download handlers.

---

## 📂 Project Directory Structure

```
blue-print-designer/
├── index.html                  # Main application interface canvas
├── style.css                   # Core structural stylesheet imports
├── css/                        # Modular Style Sheets
│   ├── variables.css           # HSL color system & variables
│   ├── layout.css              # Grid containers & panel placements
│   ├── components.css          # Form inputs, sliders, & UI elements
│   └── blueprint.css           # Architectural canvas aesthetics
└── js/                         # Modular Javascript Controllers
    ├── state.js                # Design constants & state manager
    ├── app.js                  # Main coordinator & boots loops
    ├── listeners.js            # Input panel events
    ├── drag.js                 # Drag & Drop canvas components
    ├── view.js                 # Canvas pan & zoom handlers
    ├── generator-core.js       # Grid & model allocator
    ├── generator-layout.js     # Room allocation algorithm
    ├── generator-walls.js      # Inner wall coordinate calculator
    ├── generator-openings.js   # Window & door layout installer
    ├── generator-furniture.js  # Furniture coordinate placer
    ├── electrical.js           # Lighting array calculator
    ├── plumbing.js             # Sewage and fresh water router
    ├── ventilation.js          # AC ducting and exhaust layouts
    ├── render-core.js          # Core canvas render pipeline
    ├── render-furniture.js     # Furniture SVG renderer
    ├── render-openings.js      # Doors/Windows SVG renderer
    ├── render-dims.js          # Dimension labels overlay
    ├── render-mep.js           # MEP paths and icons renderer
    ├── inspector.js            # Lux, ventilation & room property inspectors
    ├── warnings.js             # Structural compliance validator
    ├── estimator.js            # Material quantity and price math
    └── exports.js              # SVG, PNG, and JSON file exporters
```

---

## ⚠️ Limitations

- **Geometric Boundaries**: The layout generator only supports simple rectangular room divisions within standard 1–4 BHK templates. Irregular plot geometry, curves, and multi-story/duplex modeling are not supported.
- **Rule-Based Routing**: MEP lines (piping, conduits, ducts) are mapped using simple grid alignment rules rather than physical simulation models, meaning they do not bypass custom obstacle intersections.
- **Static Material Rates**: Material unit prices (for cement, steel, bricks, etc.) are fixed local state values rather than being retrieved dynamically from market APIs, ignoring inflation or regional tax differences.
- **Lack of 3D Previews**: The application operates entirely in a 2D canvas workspace. Real-time 3D walkthroughs or BIM rendering integrations are not supported.

