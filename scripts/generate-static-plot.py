# scripts/generate-static-plot.py
"""
Optional utility to generate PNG fallbacks for Plotly charts
Usage: python scripts/generate-static-plot.py
"""

import matplotlib.pyplot as plt
import numpy as np
import os

def create_sample_plots():
    """Generate sample static plots for fallback purposes"""
    
    # Ensure static image directory exists
    os.makedirs('static/img/static', exist_ok=True)
    
    # Plot 1: CD vs Dose
    fig, ax = plt.subplots(figsize=(8, 6))
    dose = np.array([10, 15, 20, 25, 30])
    cd = np.array([22, 18, 16, 14, 13])
    ax.plot(dose, cd, 'o-', linewidth=2, markersize=8)
    ax.set_xlabel('Dose (mJ/cm²)')
    ax.set_ylabel('Critical Dimension (nm)')
    ax.set_title('CD vs Exposure Dose')
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('static/img/static/cd_vs_dose.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    # Plot 2: Resolution vs Wavelength
    fig, ax = plt.subplots(figsize=(8, 6))
    wavelength_euv = np.array([13.3, 13.5, 13.7, 13.9, 14.1])
    resolution_euv = np.array([22, 16, 12, 8, 5])
    wavelength_duv = np.array([193, 248, 365, 436])
    resolution_duv = np.array([45, 65, 90, 130])
    
    ax.plot(wavelength_euv, resolution_euv, 'o-', label='EUV (13.5nm)', linewidth=2, markersize=8)
    ax.plot(wavelength_duv, resolution_duv, 's-', label='DUV (193nm)', linewidth=2, markersize=8)
    ax.set_xlabel('Wavelength (nm)')
    ax.set_ylabel('Minimum Feature Size (nm)')
    ax.set_title('Resolution vs Wavelength')
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('static/img/static/resolution_vs_wavelength.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    # Plot 3: 3D Surface (simplified heatmap)
    fig, ax = plt.subplots(figsize=(8, 6))
    x = np.linspace(0, 10, 15)
    y = np.linspace(0, 10, 6)
    X, Y = np.meshgrid(x, y)
    Z = 8.8 + 0.1 * np.sin(X) + 0.05 * np.cos(Y) + 0.02 * np.random.randn(*X.shape)
    
    im = ax.contourf(X, Y, Z, levels=20, cmap='viridis')
    ax.set_xlabel('X Position (mm)')
    ax.set_ylabel('Y Position (mm)')
    ax.set_title('Resist Thickness Uniformity')
    plt.colorbar(im, label='Thickness (nm)')
    plt.tight_layout()
    plt.savefig('static/img/static/resist_uniformity_3d.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    print("✅ Static plot fallbacks generated in static/img/static/")

if __name__ == "__main__":
    create_sample_plots()
