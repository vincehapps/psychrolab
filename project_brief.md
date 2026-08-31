# Project Brief: PsychroLab

## Project Overview
**PsychroLab** is a high-fidelity, interactive engineering dashboard designed for mechanical engineers and HVAC professionals. It provides a technical environment for psychrometric and enthalpic analysis (Mollier diagrams) with a focus on precision, density, and professional utility.

## Core Features & Functionality

### 1. Interactive Thermodynamic Charts
- **Dual-View Toggle**: A persistent navigation toggle to switch between a standard **Psychrometric Chart** and a **Mollier Diagram**.
- **Visual Accuracy**: Charts feature industry-standard saturation curves, technical grids, and interactive point markers.
- **Live Cursor Inspector**: A translucent glassmorphic overlay providing real-time property readouts (DBT, Humidity, Enthalpy, etc.) based on mouse position.

### 2. Multi-State Management
- **State Point Setup**: Support for up to 3 simultaneous state points with independent configurations.
- **Flexible Inputs**: Users can define state points using any two independent properties (e.g., Dry-Bulb + RH, Wet-Bulb + Enthalpy, Dew Point + Absolute Humidity).
- **Data Summary Table**: A high-density table displaying all calculated properties for each state point with monospaced values for precision.

### 3. Engineering Analysis Tools
- **Point Delta Selector**: A flexible tool allowing users to select any two points to calculate the delta (ΔT, ΔW, Δh) between them.
- **System Parameters**: A dedicated settings interface to adjust barometric pressure and elevation, ensuring accuracy across different environmental conditions.
- **Unit System Toggle**: Instant switching between **SI (Metric)** and **IP (Imperial)** unit systems.

### 4. Professional Compliance & Utilities
- **Technical Guide**: Integrated, scrollable documentation designed to provide educational value and support Google AdSense approval.
- **Utility Ecosystem**: An "Explore Tools" dropdown providing links to related mechanical engineering utilities (Steam Tables, Refrigerant Charts).
- **Ad Placement**: Strategic, non-intrusive slots for professional ad placements.

## Visual Identity (Technical Precision System)
- **Primary Aesthetic**: Dark mode, high-density, geometric, and minimalist.
- **Color Palette**: 
  - Surface: Deep Navy (`#0b1326`)
  - Accent: Primary Blue (`#3b82f6`) for data points and active states.
  - Success: Green indicators for live status.
- **Typography**: Inter (Sans-serif) for UI elements; Monospaced fonts for data values to ensure column alignment and readability.
- **Icons**: Custom-designed, minimalist engineering icons representing chart geometries.

## Target Audience
- Mechanical Engineers
- HVAC Designers
- Engineering Students
- Building Services Professionals

## Current Development Progress
- [x] Dashboard Layout & Navigation
- [x] Unit System Toggling
- [x] Interactive Psychrometric Chart Integration
- [x] Multi-State Point Management
- [x] Live Cursor Inspector Widget
- [x] System Settings (Elevation/Pressure)
- [x] Delta Calculation Logic & UI
- [x] Documentation Modal & Ad Placement
- [x] Industry-Standard Mollier/Psychrometric Iconography
