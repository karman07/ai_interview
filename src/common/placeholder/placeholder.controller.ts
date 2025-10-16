import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Utility')
@Controller('placeholder')
export class PlaceholderController {
  @Get(':width/:height')
  @ApiOperation({ summary: 'Generate a placeholder image' })
  @ApiParam({ name: 'width', description: 'Image width in pixels', example: 300 })
  @ApiParam({ name: 'height', description: 'Image height in pixels', example: 200 })
  @ApiResponse({ status: 200, description: 'Returns a placeholder image' })
  async getPlaceholderImage(
    @Param('width') width: string,
    @Param('height') height: string,
    @Res() res: Response,
  ) {
    const w = parseInt(width, 10) || 300;
    const h = parseInt(height, 10) || 200;
    
    // Validate dimensions
    if (w > 2000 || h > 2000 || w < 1 || h < 1) {
      return res.status(400).json({ 
        error: 'Invalid dimensions. Width and height must be between 1 and 2000 pixels.' 
      });
    }

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" stroke="#ddd" stroke-width="2"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#999">
          ${w} × ${h}
        </text>
      </svg>
    `;

    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    });
    
    return res.send(svg);
  }

  @Get(':width/:height/:text')
  @ApiOperation({ summary: 'Generate a placeholder image with custom text' })
  @ApiParam({ name: 'width', description: 'Image width in pixels', example: 300 })
  @ApiParam({ name: 'height', description: 'Image height in pixels', example: 200 })
  @ApiParam({ name: 'text', description: 'Custom text to display', example: 'Sample Text' })
  @ApiResponse({ status: 200, description: 'Returns a placeholder image with custom text' })
  async getPlaceholderImageWithText(
    @Param('width') width: string,
    @Param('height') height: string,
    @Param('text') text: string,
    @Res() res: Response,
  ) {
    const w = parseInt(width, 10) || 300;
    const h = parseInt(height, 10) || 200;
    const displayText = decodeURIComponent(text) || `${w} × ${h}`;
    
    // Validate dimensions
    if (w > 2000 || h > 2000 || w < 1 || h < 1) {
      return res.status(400).json({ 
        error: 'Invalid dimensions. Width and height must be between 1 and 2000 pixels.' 
      });
    }

    // Determine font size based on image size
    const fontSize = Math.min(w, h) / 10;
    const safeFontSize = Math.max(12, Math.min(fontSize, 32));

    // Create a simple SVG placeholder with custom text
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="Arial, sans-serif" font-size="${safeFontSize}" fill="#6c757d">
          ${displayText}
        </text>
      </svg>
    `;

    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    });
    
    return res.send(svg);
  }
}